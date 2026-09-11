'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { makeProtocolFixture, run, write } = require('./helpers.cjs');
const hooks = require('../.claude/hooks/protocol-hooks.cjs');
const handoff = require('../scripts/protocol-handoff.cjs');

// Never invoke `record` without --quick from here: it runs test-protocol.ps1,
// which runs this file again.
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

  handoff.attach(full, `Evidence:\n- digest: sha256:${'d'.repeat(64)}\n- validate-protocol.ps1: exit 0 in 1s`);
  const stale = cli(root, ['verify', '--journal', journal]);
  assert.notEqual(stale.status, 0);
  assert.match(stale.stderr, /stale/);

  const real = handoff.anchor(root);
  handoff.attach(full, `Evidence:\n- digest: ${real.digest}\n- validate-protocol.ps1: exit 0 in 1s`);
  const good = cli(root, ['verify', '--journal', journal]);
  assert.equal(good.status, 0, good.stderr);

  handoff.attach(full, `Evidence:\n- digest: ${handoff.anchor(root).digest}\n- test-protocol.ps1: exit 1 in 9s`);
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
