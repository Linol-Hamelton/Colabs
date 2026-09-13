'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { makeFixture, makeProtocolFixture, run, runPowerShell, write } = require('./helpers.cjs');
const hooks = require('../.claude/hooks/protocol-hooks.cjs');
const handoff = require('../scripts/protocol-handoff.cjs');

// Source fixtures use --quick unless their suite is replaced by a small test
// runner. Installed fixtures must exercise the default handoff without --quick.
function cli(root, args) {
  return run(process.execPath, [path.join(root, 'scripts/protocol-handoff.cjs'), ...args], root);
}

function entry(title = 'work', open = 'nothing outstanding') {
  return `## 2026-09-12 - ${title}\n\nAgent: tester\n\nAction: did a thing\n\n` +
    `Result: the thing exists\n\nNext step: hand off\n\nOpen:\n${open}\n`;
}

test('an empty final field before a separator is not a complete entry', () => {
  const withSeparator = `# W\n\n${entry('t', '')}\n---\n`;
  assert.equal(hooks.latestCompleteEntry(withSeparator), null);
  const filled = `# W\n\n${entry('t', 'a real open point')}\n---\n`;
  assert.notEqual(hooks.latestCompleteEntry(filled), null);
});

test('evidence is parsed as its own field and never absorbed into Open', t => {
  const root = makeProtocolFixture(t);
  const journal = '.ai/worklog/session-a.md';
  write(root, journal, `# W\n\n${entry()}\n`);
  const full = path.join(root, journal);
  handoff.attach(full, 'Evidence:\n- anchor: none\n- digest: sha256:' + 'a'.repeat(64));
  const parsed = hooks.latestCompleteEntry(fs.readFileSync(full, 'utf8'));
  assert.notEqual(parsed, null);
  assert.equal(hooks.entryField(parsed, 'Open'), 'nothing outstanding');
  assert.match(hooks.entryField(parsed, 'Evidence'), /digest: sha256:a{64}/);
});

test('recording evidence twice replaces the block instead of stacking it', t => {
  const root = makeProtocolFixture(t);
  const journal = '.ai/worklog/session-b.md';
  write(root, journal, `# W\n\n${entry()}\n`);
  const full = path.join(root, journal);
  handoff.attach(full, 'Evidence:\n- digest: sha256:' + 'b'.repeat(64));
  handoff.attach(full, 'Evidence:\n- digest: sha256:' + 'c'.repeat(64));
  const text = fs.readFileSync(full, 'utf8');
  assert.equal(text.match(/^Evidence:/gm).length, 1);
  assert.match(handoff.readEvidence(full).digest, /c{64}/);
});

test('the anchor changes when a tracked file changes', t => {
  const root = makeProtocolFixture(t);
  const before = handoff.anchor(root);
  write(root, 'AGENTS.md', fs.readFileSync(path.join(root, 'AGENTS.md'), 'utf8') + '\nedited\n');
  const after = handoff.anchor(root);
  assert.notEqual(before.digest, after.digest);
  assert.match(after.digest, /^sha256:[a-f0-9]{64}$/);
});

test('verify rejects a missing block, stale evidence and a recorded failure', t => {
  const root = makeProtocolFixture(t);
  const journal = '.ai/worklog/session-c.md';
  write(root, journal, `# W\n\n${entry()}\n`);
  const full = path.join(root, journal);

  const missing = cli(root, ['verify', '--journal', journal]);
  assert.notEqual(missing.status, 0);
  assert.match(missing.stderr, /no Evidence block/);

  handoff.attach(full, `Evidence:\n- digest: sha256:${'d'.repeat(64)}\n- digest format: ${hooks.SNAPSHOT_FORMAT}\n- validate-protocol.ps1: exit 0 in 1s`);
  const stale = cli(root, ['verify', '--journal', journal]);
  assert.notEqual(stale.status, 0);
  assert.match(stale.stderr, /stale/);

  const real = handoff.anchor(root);
  handoff.attach(full, `Evidence:\n- digest: ${real.digest}\n- digest format: ${hooks.SNAPSHOT_FORMAT}\n- validate-protocol.ps1: exit 0 in 1s`);
  const good = cli(root, ['verify', '--journal', journal]);
  assert.equal(good.status, 0, good.stderr);

  handoff.attach(full, `Evidence:\n- digest: ${handoff.anchor(root).digest}\n- digest format: ${hooks.SNAPSHOT_FORMAT}\n- test-protocol.ps1: exit 1 in 9s`);
  const failing = cli(root, ['verify', '--journal', journal]);
  assert.notEqual(failing.status, 0);
  assert.match(failing.stderr, /failing check/);
});

test('evidence cannot be attached to a journal with no dated entry', t => {
  const root = makeProtocolFixture(t);
  const journal = '.ai/worklog/session-d.md';
  write(root, journal, '# W\n\nno entries yet\n');
  assert.throws(() => handoff.attach(path.join(root, journal), 'Evidence:\n- x'), /No dated entry/);
});

// Picking the newest journal by modification time was wrong: a checkout or a
// merge rewrites every file and scrambles the order, so verify reported a
// stale result for a tree that did have matching evidence elsewhere.
test('verify without a target asks whether any journal matches the tree', t => {
  const root = makeProtocolFixture(t);
  write(root, '.ai/worklog/old-session.md', `# W\n\n${entry('older')}\n`);
  write(root, '.ai/worklog/new-session.md', `# W\n\n${entry('newer')}\n`);
  const old = path.join(root, '.ai/worklog/old-session.md');
  const fresh = path.join(root, '.ai/worklog/new-session.md');

  handoff.attach(old, `Evidence:\n- digest: sha256:${'e'.repeat(64)}\n- validate-protocol.ps1: exit 0 in 1s`);
  handoff.attach(fresh, `Evidence:\n- digest: ${handoff.anchor(root).digest}\n- digest format: ${hooks.SNAPSHOT_FORMAT}\n- validate-protocol.ps1: exit 0 in 1s`);

  // Make the stale journal the most recently touched one.
  const later = new Date(Date.now() + 60000);
  fs.utimesSync(old, later, later);

  const result = cli(root, ['verify']);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /new-session\.md: evidence matches/);
});

test('verify reports every journal when none matches the tree', t => {
  const root = makeProtocolFixture(t);
  write(root, '.ai/worklog/one.md', `# W\n\n${entry('one')}\n`);
  write(root, '.ai/worklog/two.md', `# W\n\n${entry('two')}\n`);
  handoff.attach(path.join(root, '.ai/worklog/one.md'), `Evidence:\n- digest: sha256:${'1'.repeat(64)}`);
  handoff.attach(path.join(root, '.ai/worklog/two.md'), `Evidence:\n- digest: sha256:${'2'.repeat(64)}`);
  const result = cli(root, ['verify']);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /one\.md/);
  assert.match(result.stderr, /two\.md/);
});

test('a clean installed project records and verifies a default handoff without source tooling', t => {
  const root = makeFixture(t);
  const install = runPowerShell('setup-ai-protocol.ps1', ['-Target', root]);
  assert.equal(install.status, 0, install.stdout + install.stderr);
  assert.equal(fs.existsSync(path.join(root, 'test-protocol.ps1')), false);
  const journal = '.ai/worklog/installed-session.md';
  write(root, journal, `# W\n\n${entry('installed handoff')}\n`);

  const recorded = cli(root, ['record', '--owner', 'installed-session']);
  assert.equal(recorded.status, 0, recorded.stdout + recorded.stderr);
  assert.match(recorded.stdout, /validate-protocol\.ps1: exit 0/);
  assert.doesNotMatch(recorded.stdout, /test-protocol\.ps1/);
  const evidence = handoff.readEvidence(path.join(root, journal));
  assert.match(evidence.body, /scope: protocol checks only; host-project tests run separately/);
  assert.match(evidence.body, /validate-protocol\.ps1: exit 0/);
  assert.doesNotMatch(evidence.body, /test-protocol\.ps1/);
  const verified = cli(root, ['verify', '--owner', 'installed-session']);
  assert.equal(verified.status, 0, verified.stdout + verified.stderr);
  assert.match(verified.stdout, /evidence matches the current tree/);
});

test('source handoff still runs the required suite and records its real failure', t => {
  const root = makeProtocolFixture(t);
  write(root, 'test-protocol.ps1', 'exit 7\n');
  const journal = '.ai/worklog/source-session.md';
  write(root, journal, `# W\n\n${entry('source handoff')}\n`);
  const result = cli(root, ['record', '--owner', 'source-session']);
  assert.equal(result.status, 1, result.stdout + result.stderr);
  const evidence = handoff.readEvidence(path.join(root, journal));
  assert.match(evidence.body, /validate-protocol\.ps1: exit 0/);
  assert.match(evidence.body, /test-protocol\.ps1: exit 7/);
  assert.equal(cli(root, ['verify', '--owner', 'source-session']).status, 1);
});

test('a missing source suite is a failed handoff, including legacy manifests without a role', t => {
  const root = makeProtocolFixture(t);
  fs.unlinkSync(path.join(root, 'test-protocol.ps1'));
  const journal = '.ai/worklog/missing-suite.md';
  write(root, journal, `# W\n\n${entry('missing suite')}\n`);
  for (const legacy of [false, true]) {
    if (legacy) {
      const manifest = JSON.parse(fs.readFileSync(path.join(root, 'protocol-manifest.json'), 'utf8'));
      delete manifest.role;
      write(root, 'protocol-manifest.json', JSON.stringify(manifest) + '\n');
    }
    const result = cli(root, ['record', '--owner', 'missing-suite']);
    assert.equal(result.status, 1, result.stdout + result.stderr);
    const evidence = handoff.readEvidence(path.join(root, journal));
    assert.match(evidence.body, /test-protocol\.ps1: exit (?!0\b)/);
  }
});

test('missing or invalid manifests cannot produce handoff evidence', t => {
  const root = makeProtocolFixture(t);
  const journal = '.ai/worklog/invalid-manifest.md';
  write(root, journal, `# W\n\n${entry('invalid manifest')}\n`);
  for (const content of [null, '{ broken', 'null', '[]', '{"role":"unknown"}', '{"role":null}']) {
    if (content === null) fs.unlinkSync(path.join(root, 'protocol-manifest.json'));
    else write(root, 'protocol-manifest.json', content + '\n');
    const result = cli(root, ['record', '--owner', 'invalid-manifest', '--quick']);
    assert.equal(result.status, 1, result.stdout + result.stderr);
    assert.match(result.stderr, /[Pp]rotocol manifest/);
    assert.equal(handoff.readEvidence(path.join(root, journal)), null);
  }
});

test('an explicit missing owner never falls back to another session journal', t => {
  const root = makeProtocolFixture(t);
  const other = write(root, '.ai/worklog/other-session.md', `# W\n\n${entry('other session')}\n`);
  const before = fs.readFileSync(other);
  for (const command of ['record', 'verify']) {
    const result = cli(root, [command, '--owner', 'missing-session', '--quick']);
    assert.equal(result.status, 1, result.stdout + result.stderr);
    assert.match(result.stderr, /No session journal for owner missing-session/);
    assert.deepEqual(fs.readFileSync(other), before);
  }
});

// Re-hashing every tracked file cost about six seconds per hook on a
// fifty-thousand-file repository, and Stop fires after every response. Git
// already identifies clean files by their blob hash. See DEC-0015.
test('clean tracked files are identified by the Git index, not read from disk', t => {
  const root = makeProtocolFixture(t);
  run('git', ['-c', 'user.name=T', '-c', 'user.email=t@e', 'add', '-A'], root);
  run('git', ['-c', 'user.name=T', '-c', 'user.email=t@e', 'commit', '-m', 'baseline'], root);
  // Count the reads rather than inspect the identity: both states produce the
  // same Git blob hash by design, so only the absence of reads proves it.
  const original = fs.readFileSync;
  let reads = 0;
  fs.readFileSync = (...args) => { reads += 1; return original(...args); };
  let taken;
  try { taken = hooks.snapshot(root); } finally { fs.readFileSync = original; }
  assert.ok(Object.keys(taken).length > 5);
  assert.equal(reads, 0, `a committed, unmodified tree was read ${reads} time(s)`);
});
test('a modified file is read even though it is tracked', t => {
  const root = makeProtocolFixture(t);
  run('git', ['-c', 'user.name=T', '-c', 'user.email=t@e', 'add', '-A'], root);
  run('git', ['-c', 'user.name=T', '-c', 'user.email=t@e', 'commit', '-m', 'baseline'], root);
  const before = hooks.snapshot(root);
  fs.appendFileSync(path.join(root, 'AGENTS.md'), '\nedited\n');
  const after = hooks.snapshot(root);
  assert.deepEqual(hooks.changedFiles(before, after), ['AGENTS.md']);
  assert.ok(!after['AGENTS.md'].endsWith('|indexed'), 'a dirty file must be hashed');
});

test('deletions and new files are still detected', t => {
  const root = makeProtocolFixture(t);
  run('git', ['-c', 'user.name=T', '-c', 'user.email=t@e', 'add', '-A'], root);
  run('git', ['-c', 'user.name=T', '-c', 'user.email=t@e', 'commit', '-m', 'baseline'], root);
  const before = hooks.snapshot(root);
  fs.writeFileSync(path.join(root, 'appeared.txt'), 'new\n');
  fs.unlinkSync(path.join(root, 'CLAUDE.md'));
  const after = hooks.snapshot(root);
  assert.deepEqual(hooks.changedFiles(before, after).sort(), ['CLAUDE.md', 'appeared.txt']);
});

test('evidence from an older digest format is named, not called stale', t => {
  const root = makeProtocolFixture(t);
  const journal = '.ai/worklog/older-format.md';
  write(root, journal, `# W\n\n${entry()}\n`);
  const full = path.join(root, journal);
  const current = handoff.anchor(root);
  // Format 1 evidence: the digest line without a format line.
  handoff.attach(full, `Evidence:\n- digest: ${current.digest}\n- validate-protocol.ps1: exit 0 in 1s`);
  const result = cli(root, ['verify', '--journal', journal]);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /digest format 1/);
  assert.doesNotMatch(result.stderr, /stale/);
});

// Evidence must survive the commit that follows it, or a receipt is useless the
// moment the work is saved. A file's identity is therefore the Git blob hash in
// both states, never a different function for tracked and untracked. DEC-0016.
test('a file keeps one identity untracked, staged and committed', t => {
  const root = makeProtocolFixture(t);
  fs.writeFileSync(path.join(root, 'appeared.txt'), 'content under test\n');
  const untracked = handoff.anchor(root).digest;
  run('git', ['-c', 'user.name=T', '-c', 'user.email=t@e', 'add', '-A'], root);
  const staged = handoff.anchor(root).digest;
  run('git', ['-c', 'user.name=T', '-c', 'user.email=t@e', 'commit', '-m', 'save'], root);
  const committed = handoff.anchor(root).digest;
  assert.equal(staged, untracked, 'git add must not move the digest');
  assert.equal(committed, staged, 'git commit must not move the digest');
});

test('recorded evidence still verifies after the work is committed', t => {
  const root = makeProtocolFixture(t);
  const journal = '.ai/worklog/committing.md';
  write(root, journal, `# W\n\n${entry()}\n`);
  const full = path.join(root, journal);
  handoff.attach(full, `Evidence:\n- digest: ${handoff.anchor(root).digest}\n` +
    `- digest format: ${hooks.SNAPSHOT_FORMAT}\n- validate-protocol.ps1: exit 0 in 1s`);
  assert.equal(cli(root, ['verify', '--journal', journal]).status, 0);
  run('git', ['-c', 'user.name=T', '-c', 'user.email=t@e', 'add', '-A'], root);
  run('git', ['-c', 'user.name=T', '-c', 'user.email=t@e', 'commit', '-m', 'save'], root);
  const after = cli(root, ['verify', '--journal', journal]);
  assert.equal(after.status, 0, after.stderr);
});
