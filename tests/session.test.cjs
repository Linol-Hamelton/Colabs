'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { repoRoot, makeProtocolFixture, run } = require('./helpers.cjs');
const hooks = require('../.ai/bin/protocol-hooks.cjs');

function session(root, args) {
  return run(process.execPath, [path.join(repoRoot, '.ai/bin/protocol-session.cjs'), ...args,
    '--root', root], root);
}

// Only Claude and Codex have hooks. Every other assistant reached through a
// chat panel had no way to obtain a journal or the injected context, so it
// could not take part at all. See DEC-0019.
test('an assistant without hooks gets a journal and the same context', t => {
  const root = makeProtocolFixture(t);
  const started = session(root, ['start', '--agent', 'qwen', '--session', 'fixed-id']);
  assert.equal(started.status, 0, started.stderr);
  assert.match(started.stdout, /# AI protocol state \(injected at session start\)/);
  assert.match(started.stdout, /Owner name for the lock and for evidence: qwen-[a-f0-9]{16}/);

  const journal = started.stdout.match(/Journal: (\S+)/)[1];
  assert.ok(fs.existsSync(path.join(root, journal)), `${journal} was not created`);
  assert.match(journal, /^\.ai\/worklog\/qwen-[a-f0-9]{16}\.md$/);
});

test('the identity is the same for the journal, the lock and the evidence', t => {
  const root = makeProtocolFixture(t);
  const started = session(root, ['start', '--agent', 'deepseek', '--session', 'fixed-id']);
  const owner = started.stdout.match(/Owner name for the lock and for evidence: (\S+)/)[1];

  const lock = run(process.execPath,
    [path.join(root, '.ai/bin/protocol-lock.cjs'), 'acquire', '--owner', owner, '--root', root], root);
  assert.equal(lock.status, 0, lock.stderr);
  assert.equal(JSON.parse(lock.stdout).worklog, `.ai/worklog/${owner}.md`);

  const released = run(process.execPath,
    [path.join(root, '.ai/bin/protocol-lock.cjs'), 'release', '--owner', owner, '--root', root], root);
  assert.equal(released.status, 0, released.stderr);
});

test('starting twice with one session id reuses the journal', t => {
  const root = makeProtocolFixture(t);
  const first = session(root, ['start', '--agent', 'qwen', '--session', 'same']);
  const second = session(root, ['start', '--agent', 'qwen', '--session', 'same']);
  assert.equal(first.stdout.match(/Journal: (\S+)/)[1], second.stdout.match(/Journal: (\S+)/)[1]);
  const journals = fs.readdirSync(path.join(root, '.ai/worklog'))
    .filter(name => name.startsWith('qwen-'));
  assert.equal(journals.length, 1);
});

test('two assistants in one checkout never share a journal', t => {
  const root = makeProtocolFixture(t);
  const a = session(root, ['start', '--agent', 'qwen', '--session', 'one']);
  const b = session(root, ['start', '--agent', 'deepseek', '--session', 'one']);
  assert.notEqual(a.stdout.match(/Journal: (\S+)/)[1], b.stdout.match(/Journal: (\S+)/)[1]);
});

test('an agent name that could escape the worklog directory is refused', t => {
  const root = makeProtocolFixture(t);
  for (const name of ['../escape', 'a', 'Has-Capitals', 'has space', '1leading-digit',
    'this-name-is-far-too-long-to-be-a-slug']) {
    const result = session(root, ['start', '--agent', name, '--session', 'x']);
    assert.notEqual(result.status, 0, `accepted ${name}`);
    assert.match(result.stderr, /Agent name must be/);
  }
  assert.deepEqual(fs.readdirSync(path.join(root, '.ai/worklog')), ['README.md']);
});

test('stop reports a changed tree with no new complete entry', t => {
  const root = makeProtocolFixture(t);
  session(root, ['start', '--agent', 'qwen', '--session', 'fixed']);
  fs.appendFileSync(path.join(root, 'AGENTS.md'), '\nedited by the session\n');
  const stopped = session(root, ['stop', '--agent', 'qwen', '--session', 'fixed']);
  assert.notEqual(stopped.status, 0);
  assert.match(stopped.stderr, /no new complete entry/);
});

test('whoami names the journal without creating one', t => {
  const root = makeProtocolFixture(t);
  const who = session(root, ['whoami', '--agent', 'qwen', '--session', 'never-started']);
  assert.equal(who.status, 0, who.stderr);
  const answer = JSON.parse(who.stdout);
  assert.match(answer.owner, /^qwen-[a-f0-9]{16}$/);
  assert.equal(fs.existsSync(path.join(root, answer.worklog)), false);
});

test('the hooks and this tool agree on where a session writes', () => {
  const paths = hooks.sessionPaths(repoRoot, 'shared-id', 'claude');
  assert.match(paths.worklog, /^\.ai\/worklog\/claude-[a-f0-9]{16}\.md$/);
  const other = hooks.sessionPaths(repoRoot, 'shared-id', 'qwen');
  assert.equal(path.basename(other.worklog), path.basename(paths.worklog).replace('claude-', 'qwen-'));
});
