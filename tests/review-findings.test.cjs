'use strict';

// One regression per finding from the three independent reviews of 2026-09-16.
// Each name says which finding it holds down. See DEC-0021.

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { repoRoot, makeProtocolFixture, runPowerShell, run, write } = require('./helpers.cjs');
const hooks = require('../.ai/bin/protocol-hooks.cjs');
const handoff = require('../.ai/bin/protocol-handoff.cjs');

function tool(root, name, args) {
  return run(process.execPath, [path.join(repoRoot, '.ai/bin/', name), ...args], root);
}

function journalWith(root, agent, session, body) {
  tool(root, 'protocol-session.cjs', ['start', '--agent', agent, '--session', session, '--root', root]);
  const worklog = hooks.sessionPaths(fs.realpathSync(root), session, agent).worklog;
  fs.appendFileSync(path.join(root, worklog), body);
  return { file: path.join(root, worklog), owner: path.basename(worklog, '.md') };
}

const ENTRY = '\n## 2026-09-16 - Work\n\nAgent: reviewer\n\nAction: Did the work.\n\n' +
  'Result: It held up.\n\nNext step: Hand off.\n\nOpen: Nothing.\n';

// C1 - the receipt did not cover the entry it certified.
test('an entry rewritten after certification no longer verifies', t => {
  const root = makeProtocolFixture(t);
  const { file, owner } = journalWith(root, 'tester', 'c1', ENTRY);
  const recorded = tool(root, 'protocol-handoff.cjs', ['record', '--owner', owner, '--quick', '--root', root]);
  assert.equal(recorded.status, 0, recorded.stderr);
  assert.equal(tool(root, 'protocol-handoff.cjs', ['verify', '--owner', owner, '--root', root]).status, 0);

  fs.writeFileSync(file, fs.readFileSync(file, 'utf8').replace('Result: It held up.', 'Result: FORGED.'));
  const after = tool(root, 'protocol-handoff.cjs', ['verify', '--owner', owner, '--root', root]);
  assert.notEqual(after.status, 0, 'a rewritten entry still verified');
  assert.match(after.stderr, /changed after it was certified/);
});

// The first fix hashed the separator at record time and not at verify time, so
// a journal with any older entry below failed its own fresh receipt. Recording
// and verifying must round-trip on a real journal, not only an empty one.
test('a fresh receipt verifies when an older entry follows the new one', t => {
  const root = makeProtocolFixture(t);
  const older = '\n## 2026-09-15 - Earlier work\n\nAgent: reviewer\n\n' +
    'Action: Came before.\n\nResult: Filed.\n\nNext step: Continue.\n\nOpen: Nothing.\n\n---\n';
  const { file, owner } = journalWith(root, 'tester', 'c1c', older);
  fs.writeFileSync(file, fs.readFileSync(file, 'utf8')
    .replace(older, `${ENTRY}\n---\n${older}`));

  const recorded = tool(root, 'protocol-handoff.cjs', ['record', '--owner', owner, '--quick', '--root', root]);
  assert.equal(recorded.status, 0, recorded.stderr);
  const checked = tool(root, 'protocol-handoff.cjs', ['verify', '--owner', owner, '--root', root]);
  assert.equal(checked.status, 0, `fresh receipt did not verify: ${checked.stderr}`);
});

test('the evidence block carries a hash of the entry without itself', t => {
  const root = makeProtocolFixture(t);
  const { file, owner } = journalWith(root, 'tester', 'c1b', ENTRY);
  tool(root, 'protocol-handoff.cjs', ['record', '--owner', owner, '--quick', '--root', root]);
  assert.match(handoff.readEvidence(file).entry, /^sha256:[a-f0-9]{64}$/);
});

// C2 - an interrupted lock operation blocked every later acquire and release.
test('an abandoned lock gate is diagnosed and can be cleared', t => {
  const root = makeProtocolFixture(t);
  const gate = path.join(root, '.ai/runtime/shared-writer-operation');
  fs.mkdirSync(gate, { recursive: true });
  fs.writeFileSync(path.join(gate, 'operation.json'),
    JSON.stringify({ command: 'acquire', owner: 'killed', pid: 999999, hostname: os.hostname() }));

  const blocked = tool(root, 'protocol-lock.cjs', ['acquire', '--owner', 'next-session', '--root', root]);
  assert.notEqual(blocked.status, 0);
  assert.match(blocked.stderr, /interrupted and left its gate behind/);
  assert.match(blocked.stderr, /clear-operation/);

  const cleared = tool(root, 'protocol-lock.cjs', ['clear-operation', '--root', root]);
  assert.equal(cleared.status, 0, cleared.stderr);
  assert.equal(tool(root, 'protocol-lock.cjs', ['acquire', '--owner', 'next-session', '--root', root]).status, 0);
});

test('a gate owned by a living process is not cleared', t => {
  const root = makeProtocolFixture(t);
  const gate = path.join(root, '.ai/runtime/shared-writer-operation');
  fs.mkdirSync(gate, { recursive: true });
  fs.writeFileSync(path.join(gate, 'operation.json'),
    JSON.stringify({ command: 'acquire', owner: 'live', pid: process.pid, hostname: os.hostname() }));
  const refused = tool(root, 'protocol-lock.cjs', ['clear-operation', '--root', root]);
  assert.notEqual(refused.status, 0);
  assert.match(refused.stderr, /still holds the operation gate/);
});

// H1 - stop claimed a handoff when nothing had been handed off.
test('stop does not claim a handoff that was never written', t => {
  const root = makeProtocolFixture(t);
  tool(root, 'protocol-session.cjs', ['start', '--agent', 'tester', '--session', 'h1', '--root', root]);
  const stopped = tool(root, 'protocol-session.cjs', ['stop', '--agent', 'tester', '--session', 'h1', '--root', root]);
  assert.equal(stopped.status, 0, stopped.stderr);
  assert.match(stopped.stdout, /Nothing was handed off/);
  assert.doesNotMatch(stopped.stdout, /Handoff recorded/);
});

// H2 - a field swallowed the rest of the entry when labels were permuted.
test('fields parse the same whatever order they are written in', () => {
  const canonical = '## 2026-09-16 - T\n\nAgent: tester\n\nAction: built it\n\nResult: it held\n\nNext step: hand off\n\nOpen: nothing\n';
  const permuted = '## 2026-09-16 - T\n\nOpen: nothing\n\nAgent: tester\n\nAction: built it\n\nResult: it held\n\nNext step: hand off\n';
  for (const label of ['Agent', 'Action', 'Result', 'Next step', 'Open']) {
    assert.equal(hooks.entryField(permuted, label), hooks.entryField(canonical, label), label);
  }
  assert.notEqual(hooks.latestCompleteEntry(permuted), null);
});

// M3 - one character per field counted as a complete handoff.
test('a stub entry is not a complete entry', () => {
  const stub = '## 2026-09-16 - t\n\nAgent: a\n\nAction: b\n\nResult: c\n\nNext step: d\n\nOpen: e\n';
  assert.equal(hooks.latestCompleteEntry(stub), null);
  const real = '## 2026-09-16 - T\n\nAgent: tester\n\nAction: built it\n\nResult: it held\n\nNext step: hand off\n\nOpen: nothing\n';
  assert.notEqual(hooks.latestCompleteEntry(real), null);
});

// L1 - a quick receipt looked like a full one.
test('a quick receipt says the suite was not run', t => {
  const root = makeProtocolFixture(t);
  const { file, owner } = journalWith(root, 'tester', 'l1', ENTRY);
  tool(root, 'protocol-handoff.cjs', ['record', '--owner', owner, '--quick', '--root', root]);
  assert.match(fs.readFileSync(file, 'utf8'), /scope: validator only; the regression suite was NOT run/);
});

// M2 - journals accumulated with no way to clear the empty ones.
test('prune removes journals with no entry and keeps the rest', t => {
  const root = makeProtocolFixture(t);
  tool(root, 'protocol-session.cjs', ['start', '--agent', 'empty', '--session', 'm2a', '--root', root]);
  journalWith(root, 'busy', 'm2b', ENTRY);
  const emptyJournal = fs.readdirSync(path.join(root, '.ai/worklog')).find(name => name.startsWith('empty-'));
  const aged = (Date.now() - 30 * 60 * 1000) / 1000;
  fs.utimesSync(path.join(root, '.ai/worklog', emptyJournal), aged, aged);
  const pruned = tool(root, 'protocol-session.cjs', ['prune', '--root', root]);
  assert.equal(pruned.status, 0, pruned.stderr);
  const left = fs.readdirSync(path.join(root, '.ai/worklog'));
  assert.ok(left.some(name => name.startsWith('busy-')), 'a journal with an entry was removed');
  assert.ok(!left.some(name => name.startsWith('empty-')), 'an empty journal survived');
});

// Reproduced in D:\VPN on 2026-09-17: prune deleted a journal whose heading was
// `## YYYY-MM-DD HH:MM:SS UTC - Title` even though it held a full audit. The
// heading check treated every nonstandard heading as an empty file.
test('prune keeps a journal with a nonstandard heading that holds an entry', t => {
  const root = makeProtocolFixture(t);
  const file = path.join(root, '.ai/worklog/tester-nonstandard.md');
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, '# Worklog\n\n'
    + '## 2026-09-17 01:23:16 UTC - Complete Audit Entry\n\n'
    + 'Agent: tester\n\nAction: wrote the audit.\n\nResult: it held.\n\n'
    + 'Next step: none.\n\nOpen: none.\n');
  const pruned = tool(root, 'protocol-session.cjs', ['prune', '--root', root]);
  assert.equal(pruned.status, 0, pruned.stderr);
  assert.ok(fs.existsSync(file), 'a nonstandard but substantive journal was removed');
});

test('prune still removes a journal that holds nothing', t => {
  const root = makeProtocolFixture(t);
  const file = path.join(root, '.ai/worklog/tester-empty.md');
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, '# Worklog: tester\n\nSession journal.\n\n---\n');
  const aged = (Date.now() - 30 * 60 * 1000) / 1000;
  fs.utimesSync(file, aged, aged);
  const pruned = tool(root, 'protocol-session.cjs', ['prune', '--root', root]);
  assert.equal(pruned.status, 0, pruned.stderr);
  assert.ok(!fs.existsSync(file), 'an empty journal survived prune');
});

// H3 - a written decision block could be rewritten and validation still passed.
test('editing a committed decision block fails validation', t => {
  const root = makeProtocolFixture(t);
  const file = path.join(root, '.ai/DECISIONS.md');
  fs.writeFileSync(file, '# Decisions\n\n### DEC-0001\n\nStatus: Accepted\nDate: 2026-09-16\n'
    + 'Approved by: Test Owner\n\nContext:\nThe original reasoning.\n');
  for (const args of [['add', '-A'], ['-c', 'user.name=T', '-c', 'user.email=t@e', 'commit', '-m', 'decide']]) {
    assert.equal(run('git', args, root).status, 0);
  }
  fs.writeFileSync(file, fs.readFileSync(file, 'utf8')
    .replace('The original reasoning.', 'Rewritten after the fact.'));
  const result = runPowerShell('validate-protocol.ps1', ['-Quiet'], root);
  assert.equal(result.status, 1);
  assert.match(result.stdout + result.stderr, /DEC-0001 was edited after it was written/);
});

// M1 - one version lived in three files and nothing compared them.
test('a version that disagrees with the manifest fails validation', t => {
  const root = makeProtocolFixture(t);
  const text = fs.readFileSync(path.join(root, 'AGENTS.md'), 'utf8');
  write(root, 'AGENTS.md', text.replace(/^## AI Collaboration Protocol v\S+$/m,
    '## AI Collaboration Protocol v9.9.9'));
  const result = runPowerShell('validate-protocol.ps1', ['-Quiet'], root);
  assert.equal(result.status, 1);
  assert.match(result.stdout + result.stderr, /AGENTS\.md says 9\.9\.9/);
});

test('deleting a committed decision block fails validation', t => {
  const root = makeProtocolFixture(t);
  const file = path.join(root, '.ai/DECISIONS.md');
  fs.writeFileSync(file, '# Decisions\n\n### DEC-0001\n\nStatus: Accepted\nDate: 2026-09-16\n'
    + 'Approved by: Test Owner\n\nContext:\nFirst.\n\n### DEC-0002\n\nStatus: Accepted\nDate: 2026-09-16\n'
    + 'Approved by: Test Owner\n\nContext:\nSecond.\n');
  for (const args of [['add', '-A'], ['-c', 'user.name=T', '-c', 'user.email=t@e', 'commit', '-m', 'decide']]) {
    assert.equal(run('git', args, root).status, 0);
  }
  fs.writeFileSync(file, '# Decisions\n\n### DEC-0002\n\nStatus: Accepted\nDate: 2026-09-16\n'
    + 'Approved by: Test Owner\n\nContext:\nSecond.\n');
  const result = runPowerShell('validate-protocol.ps1', ['-Quiet'], root);
  assert.equal(result.status, 1, 'validation passed despite deletion of DEC-0001');
  assert.match(result.stdout + result.stderr, /DEC-0001 was deleted; a decision block is never removed/);
});

// A4 - capability and evidence discipline policy text protection.
test('A4: review template and AGENTS.md define Mode, Receipt-Owner, and capabilities', () => {
  const templatePath = path.join(repoRoot, 'templates/reviews/REVIEW.md');
  const templateText = fs.readFileSync(templatePath, 'utf8');
  assert.match(templateText, /\*\*Mode\*\*:\s*CERTIFYING\s*\|\s*ADVISORY/i);
  assert.match(templateText, /\*\*Receipt-Owner\*\*:\s*<owner id>/i);
  assert.match(templateText, /\*\*Receipt\*\*:\s*<path or digest>/i);

  const agentsPath = path.join(repoRoot, 'AGENTS.md');
  const agentsText = fs.readFileSync(agentsPath, 'utf8');
  assert.match(agentsText, /\bFS_WRITE\b/);
  assert.match(agentsText, /\bSHELL_EXEC\b/);
  assert.match(agentsText, /\bEVIDENCE_SIGN\b/);
  assert.match(agentsText, /\bREPO_READ\b/);
  assert.match(agentsText, /\bMode:\s*CERTIFYING\b/);
  assert.match(agentsText, /\bReceipt-Owner\b/);
  assert.match(agentsText, /\[MODE:\s*READ-ONLY ADVISORY\]/);
});
