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

// The first pilot gave one task to two assistants and received two answers to
// it. Each session is now told its own role before it starts. See DEC-0020.
function withRoles(root, body) {
  // Replace the template's own Roles section rather than adding a second one.
  const file = path.join(root, '.ai/TASK.md');
  const text = fs.readFileSync(file, 'utf8');
  const parts = text.split(/(?=^## )/m).map(part => /^## Roles\b/.test(part)
    ? `## Roles\n\n${body}\n\n` : part);
  fs.writeFileSync(file, parts.join(''));
}

test('each assistant is told its own role, in the owner own words', t => {
  const root = makeProtocolFixture(t);
  withRoles(root, '- qwen: implementer, leads this task\n- deepseek: reviewer, opposes before handoff');
  const qwen = session(root, ['start', '--agent', 'qwen', '--session', 'a']);
  assert.match(qwen.stdout, /Your role in this task: implementer, leads this task/);
  const deepseek = session(root, ['start', '--agent', 'deepseek', '--session', 'b']);
  assert.match(deepseek.stdout, /Your role in this task: reviewer, opposes before handoff/);
});

test('an assistant the task does not name is told to ask first', t => {
  const root = makeProtocolFixture(t);
  withRoles(root, '- qwen: implementer\n- deepseek: reviewer');
  const other = session(root, ['start', '--agent', 'kimi', '--session', 'c']);
  assert.match(other.stdout, /You are kimi and are not among them\. Ask the owner/);
  assert.match(other.stdout, /Assignment: qwen = implementer, deepseek = reviewer/);
});

test('a task with no Roles section says nothing about roles', t => {
  const root = makeProtocolFixture(t);
  const started = session(root, ['start', '--agent', 'qwen', '--session', 'd']);
  assert.equal(started.status, 0, started.stderr);
  assert.doesNotMatch(started.stdout, /Your role in this task/);
  assert.doesNotMatch(started.stdout, /Assignment:/);
});

test('only well-formed role lines are read', t => {
  const root = makeProtocolFixture(t);
  withRoles(root, '- qwen: implementer\nnot a list item: ignored\n- ../escape: nope\n- Capitals: nope');
  assert.deepEqual(hooks.assignment(root), [{ agent: 'qwen', role: 'implementer' }]);
});

test('prune protects an empty journal when its owning session process is still alive', t => {
  const root = makeProtocolFixture(t);
  session(root, ['start', '--agent', 'qwen', '--session', 'live-session']);
  const paths = hooks.sessionPaths(fs.realpathSync(root), 'live-session', 'qwen');
  const stateFile = paths.state;
  const state = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
  state.pid = process.pid;
  state.hostname = require('node:os').hostname();
  fs.writeFileSync(stateFile, JSON.stringify(state) + '\n');

  const pruned = session(root, ['prune']);
  assert.equal(pruned.status, 0, pruned.stderr);
  assert.ok(fs.existsSync(path.join(root, paths.worklog)), 'an active live session was pruned');
  assert.match(pruned.stdout, /skipping qwen-.*active session/);
});

test('prune protects an empty journal when its owner holds the shared lock', t => {
  const root = makeProtocolFixture(t);
  const started = session(root, ['start', '--agent', 'qwen', '--session', 'locked-session']);
  const owner = started.stdout.match(/Owner name for the lock and for evidence: (\S+)/)[1];
  const paths = hooks.sessionPaths(fs.realpathSync(root), 'locked-session', 'qwen');
  run(process.execPath, [path.join(root, '.ai/bin/protocol-lock.cjs'), 'acquire', '--owner', owner, '--root', root], root);

  const pruned = session(root, ['prune']);
  assert.equal(pruned.status, 0, pruned.stderr);
  assert.ok(fs.existsSync(path.join(root, paths.worklog)), 'an active lock holder was pruned');
  assert.match(pruned.stdout, /skipping qwen-.*active lock holder/);
});

test('glm, mistral and copilot assistants initialize sessions, acquire locks and isolate journals', t => {
  const root = makeProtocolFixture(t);
  const glmStart = session(root, ['start', '--agent', 'glm', '--session', 'glm-task']);
  assert.equal(glmStart.status, 0, glmStart.stderr);
  assert.match(glmStart.stdout, /Owner name for the lock and for evidence: glm-[a-f0-9]{16}/);

  const mistralStart = session(root, ['start', '--agent', 'mistral', '--session', 'mistral-task']);
  assert.equal(mistralStart.status, 0, mistralStart.stderr);
  assert.match(mistralStart.stdout, /Owner name for the lock and for evidence: mistral-[a-f0-9]{16}/);

  const copilotStart = session(root, ['start', '--agent', 'copilot', '--session', 'copilot-task']);
  assert.equal(copilotStart.status, 0, copilotStart.stderr);
  assert.match(copilotStart.stdout, /Owner name for the lock and for evidence: copilot-[a-f0-9]{16}/);

  const glmJournal = glmStart.stdout.match(/Journal: (\S+)/)[1];
  const mistralJournal = mistralStart.stdout.match(/Journal: (\S+)/)[1];
  const copilotJournal = copilotStart.stdout.match(/Journal: (\S+)/)[1];
  assert.ok(fs.existsSync(path.join(root, glmJournal)));
  assert.ok(fs.existsSync(path.join(root, mistralJournal)));
  assert.ok(fs.existsSync(path.join(root, copilotJournal)));
  assert.notEqual(glmJournal, mistralJournal);
  assert.notEqual(copilotJournal, glmJournal);

  // All can lock independently
  const copilotOwner = copilotStart.stdout.match(/Owner name for the lock and for evidence: (\S+)/)[1];
  const lock = run(process.execPath,
    [path.join(root, '.ai/bin/protocol-lock.cjs'), 'acquire', '--owner', copilotOwner, '--root', root], root);
  assert.equal(lock.status, 0, lock.stderr);
  const unlock = run(process.execPath,
    [path.join(root, '.ai/bin/protocol-lock.cjs'), 'release', '--owner', copilotOwner, '--root', root], root);
  assert.equal(unlock.status, 0, unlock.stderr);
});

test('cleanup-runtime removes orphan snapshots and stale temp files while protecting active sessions', t => {
  const root = makeProtocolFixture(t);
  const runtimeDir = path.join(root, '.ai/runtime');
  fs.mkdirSync(runtimeDir, { recursive: true });

  // 1. Orphan snapshot (no journal in .ai/worklog)
  const orphanJson = path.join(runtimeDir, 'qwen-orphan12345678.json');
  fs.writeFileSync(orphanJson, JSON.stringify({ version: 1, files: {}, entryHash: null }));

  // 2. Active session with journal
  const started = session(root, ['start', '--agent', 'qwen', '--session', 'active-sess']);
  const activeOwner = started.stdout.match(/Owner name for the lock and for evidence: (\S+)/)[1];
  const activeJson = path.join(runtimeDir, `${activeOwner}.json`);
  assert.ok(fs.existsSync(activeJson));

  // 3. Stale temporary file
  const staleTmp = path.join(runtimeDir, 'temp-file.tmp');
  fs.writeFileSync(staleTmp, 'temporary');
  const pastTime = (Date.now() - 2 * 3600 * 1000) / 1000;
  fs.utimesSync(staleTmp, pastTime, pastTime);

  // Run cleanup-runtime
  const cleaned = session(root, ['cleanup-runtime']);
  assert.equal(cleaned.status, 0, cleaned.stderr);

  // Assertions
  assert.ok(!fs.existsSync(orphanJson), 'orphan snapshot was not removed');
  assert.ok(!fs.existsSync(staleTmp), 'stale tmp file was not removed');
  assert.ok(fs.existsSync(activeJson), 'active session snapshot was mistakenly removed');
});

