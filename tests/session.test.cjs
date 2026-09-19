'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawn } = require('node:child_process');
const { repoRoot, makeProtocolFixture, run, write } = require('./helpers.cjs');
const hooks = require('../.ai/bin/protocol-hooks.cjs');
const { isSessionAlive, checkProcessAlive, RECENT_WINDOW_MS } = require('../.ai/bin/protocol-session.cjs');

function ageArtifact(filePath, minutesAgo = 30) {
  const past = (Date.now() - minutesAgo * 60 * 1000) / 1000;
  fs.utimesSync(filePath, past, past);
}

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

test('stop prints extended telemetry including wall time and handoff status', t => {
  const root = makeProtocolFixture(t);
  const startRes = session(root, ['start', '--agent', 'qwen', '--session', 'telemetry-stop']);
  assert.equal(startRes.status, 0, startRes.stderr);
  const journal = startRes.stdout.match(/Journal: (\S+)/)[1];

  // Stop with clean tree
  const cleanStop = session(root, ['stop', '--agent', 'qwen', '--session', 'telemetry-stop']);
  assert.equal(cleanStop.status, 0, cleanStop.stderr);
  assert.match(cleanStop.stdout, /Session telemetry: 0 file\(s\) changed in ~\d+s, handoff incomplete\./);

  // Edit file and add complete journal entry
  write(root, 'new-file.txt', 'Edits made.\n');
  const entryText = `## 2026-09-19 - Test entry\n\nAgent: qwen\n\nAction: did work\n\nResult: verified\n\nNext step: handoff\n\nOpen: none\n`;
  const existingJournal = fs.readFileSync(path.join(root, journal), 'utf8');
  fs.writeFileSync(path.join(root, journal), existingJournal + '\n' + entryText);

  const editedStop = session(root, ['stop', '--agent', 'qwen', '--session', 'telemetry-stop']);
  assert.equal(editedStop.status, 0, editedStop.stderr);
  assert.match(editedStop.stdout, /Session telemetry: 1 file\(s\) changed in ~\d+s, first edit at \+\d+ms, handoff complete\./);
});

test('whoami names the journal without creating one', t => {
  const root = makeProtocolFixture(t);
  const who = session(root, ['whoami', '--agent', 'qwen', '--session', 'never-started']);
  assert.equal(who.status, 0, who.stderr);
  const answer = JSON.parse(who.stdout);
  assert.match(answer.owner, /^qwen-[a-f0-9]{16}$/);
  assert.equal(fs.existsSync(path.join(root, answer.worklog)), false);
});

test('session start and whoami print session token and preserve nonce across runs', t => {
  const root = makeProtocolFixture(t);
  const started = session(root, ['start', '--agent', 'qwen', '--session', 'token-test']);
  assert.equal(started.status, 0, started.stderr);
  assert.match(started.stdout, /Session token: [a-f0-9]{64}/);
  const token = started.stdout.match(/Session token: ([a-f0-9]{64})/)[1];

  const who = session(root, ['whoami', '--agent', 'qwen', '--session', 'token-test']);
  assert.equal(who.status, 0, who.stderr);
  const whoJson = JSON.parse(who.stdout);
  assert.equal(whoJson.sessionToken, token);

  // Second start preserves nonce
  const startedAgain = session(root, ['start', '--agent', 'qwen', '--session', 'token-test']);
  assert.equal(startedAgain.status, 0, startedAgain.stderr);
  assert.match(startedAgain.stdout, new RegExp(`Session token: ${token}`));
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

test('cleanup-runtime --force preserves snapshot if hostname is foreign or pid status unknown', t => {
  const root = makeProtocolFixture(t);
  const runtimeDir = path.join(root, '.ai/runtime');
  fs.mkdirSync(runtimeDir, { recursive: true });

  const foreignSnapshot = path.join(runtimeDir, 'qwen-foreign12345678.json');
  fs.writeFileSync(foreignSnapshot, JSON.stringify({
    version: 1,
    pid: 999999,
    hostname: 'other-machine-xyz',
    files: {}
  }));

  // Create corresponding worklog so it is not treated as orphan
  write(root, '.ai/worklog/qwen-foreign12345678.md', '# W\n\n');

  const cleaned = session(root, ['cleanup-runtime', '--force']);
  assert.equal(cleaned.status, 0, cleaned.stderr);
  assert.ok(fs.existsSync(foreignSnapshot), 'foreign snapshot should be preserved even with --force');
});

test('cleanup-runtime preserves foreign-host stale snapshot older than 7 days (null liveness)', t => {
  const root = makeProtocolFixture(t);
  const runtimeDir = path.join(root, '.ai/runtime');
  fs.mkdirSync(runtimeDir, { recursive: true });

  const staleSnapshot = path.join(runtimeDir, 'agent-stale7day12345678.json');
  fs.writeFileSync(staleSnapshot, JSON.stringify({
    version: 1,
    pid: 888888,
    hostname: 'remote-ci-server-xyz',
    files: {}
  }));
  // Set mtime to 8 days ago
  const eightDaysAgo = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000);
  fs.utimesSync(staleSnapshot, eightDaysAgo, eightDaysAgo);

  // Create corresponding worklog so it is not treated as orphan
  write(root, '.ai/worklog/agent-stale7day12345678.md', '# W\n\n');

  const cleaned = session(root, ['cleanup-runtime']);
  assert.equal(cleaned.status, 0, cleaned.stderr);
  assert.ok(fs.existsSync(staleSnapshot),
    'foreign-host snapshot with unknown liveness must survive 7-day rule');
});

test('isSessionAlive contract matches 6-state specification', t => {
  const child = spawn(process.execPath, ['-e', 'setInterval(() => {}, 10000)'], { windowsHide: true });
  t.after(() => { try { child.kill(); } catch {} });
  const livePid = child.pid;
  const deadPid = 2147483640;

  // 1. hostname mismatch -> null
  assert.equal(isSessionAlive({ hostname: 'other-machine', pid: livePid, supervisorPid: livePid }), null);
  assert.equal(isSessionAlive({ hostname: null, pid: livePid }), null);
  assert.equal(isSessionAlive(null), null);

  // 2. supervisorPid integer > 4 and alive -> true
  assert.equal(isSessionAlive({ hostname: os.hostname(), supervisorPid: livePid, pid: deadPid }), true);

  // 3. supervisorPid integer > 4 and dead -> fall through to pid
  assert.equal(isSessionAlive({ hostname: os.hostname(), supervisorPid: deadPid, pid: livePid }), true);
  assert.equal(isSessionAlive({ hostname: os.hostname(), supervisorPid: deadPid, pid: deadPid }), false);
  assert.equal(isSessionAlive({ hostname: os.hostname(), supervisorPid: deadPid, pid: null }), null);

  // supervisorPid <= 4 is treated as unusable and falls through to pid; supervisorPid: 4 with dead pid yields false
  assert.equal(isSessionAlive({ hostname: os.hostname(), supervisorPid: 4, pid: deadPid }), false);
  assert.equal(isSessionAlive({ hostname: os.hostname(), supervisorPid: 4, pid: livePid }), true);
  assert.equal(isSessionAlive({ hostname: os.hostname(), supervisorPid: 4, pid: 4 }), null);

  // 4. pid integer > 4 and alive -> true
  assert.equal(isSessionAlive({ hostname: os.hostname(), pid: livePid }), true);

  // 5. pid integer > 4 and dead -> false
  assert.equal(isSessionAlive({ hostname: os.hostname(), pid: deadPid }), false);

  // 6. no usable pid fields (legacy null state, or <= 4) -> null
  assert.equal(isSessionAlive({ hostname: os.hostname(), pid: null }), null);
  assert.equal(isSessionAlive({ hostname: os.hostname(), pid: -1 }), null);
  assert.equal(isSessionAlive({ hostname: os.hostname(), pid: 0 }), null);
  assert.equal(isSessionAlive({ hostname: os.hostname(), pid: 4 }), null);
  assert.equal(isSessionAlive({ hostname: os.hostname() }), null);
});

test('A1 branch 1: supervisor alive, transient dead, aged -> journal + snapshot preserved', t => {
  const root = makeProtocolFixture(t);
  const sup = spawn(process.execPath, ['-e', 'setInterval(() => {}, 10000)'], { windowsHide: true });
  t.after(() => { try { sup.kill(); } catch {} });
  const liveSupPid = sup.pid;
  const deadPid = 2147483640;

  const owner = 'qwen-sup-alive-test';
  const journalRel = `.ai/worklog/${owner}.md`;
  const journalPath = path.join(root, journalRel);
  write(root, journalRel, `# Worklog: ${owner}\n\n`);

  const runtimeDir = path.join(root, '.ai/runtime');
  fs.mkdirSync(runtimeDir, { recursive: true });
  const snapshotPath = path.join(runtimeDir, `${owner}.json`);
  fs.writeFileSync(snapshotPath, JSON.stringify({
    version: 1,
    pid: deadPid,
    supervisorPid: liveSupPid,
    hostname: os.hostname(),
    files: {},
  }));

  ageArtifact(journalPath, 30);
  ageArtifact(snapshotPath, 30);

  // prune must preserve journal
  const pruned = session(root, ['prune']);
  assert.equal(pruned.status, 0, pruned.stderr);
  assert.ok(fs.existsSync(journalPath), 'journal must be preserved with live supervisor');
  assert.match(pruned.stdout, /skipping qwen-sup-alive-test.*active session/);

  // cleanup-runtime --force must preserve snapshot
  const cleaned = session(root, ['cleanup-runtime', '--force']);
  assert.equal(cleaned.status, 0, cleaned.stderr);
  assert.ok(fs.existsSync(snapshotPath), 'snapshot must be preserved with live supervisor even with --force');
});

test('A1 branch 2: supervisor dead, transient dead, aged -> journal quarantined, snapshot removable', t => {
  const root = makeProtocolFixture(t);
  const deadSupPid = 2147483639;
  const deadPid = 2147483640;

  const owner = 'qwen-all-dead-test';
  const journalRel = `.ai/worklog/${owner}.md`;
  const journalPath = path.join(root, journalRel);
  write(root, journalRel, `# Worklog: ${owner}\n\n`);

  const runtimeDir = path.join(root, '.ai/runtime');
  fs.mkdirSync(runtimeDir, { recursive: true });
  const snapshotPath = path.join(runtimeDir, `${owner}.json`);
  fs.writeFileSync(snapshotPath, JSON.stringify({
    version: 1,
    pid: deadPid,
    supervisorPid: deadSupPid,
    hostname: os.hostname(),
    files: {},
  }));

  ageArtifact(journalPath, 30);
  ageArtifact(snapshotPath, 30);

  const pruned = session(root, ['prune']);
  assert.equal(pruned.status, 0, pruned.stderr);
  assert.ok(!fs.existsSync(journalPath), 'journal must be quarantined when everything is dead');
  assert.ok(fs.existsSync(path.join(runtimeDir, 'pruned', `${owner}.md`)));

  // Re-create snapshot for cleanup test (since prune deletes state file for quarantined journal)
  fs.writeFileSync(snapshotPath, JSON.stringify({
    version: 1,
    pid: deadPid,
    supervisorPid: deadSupPid,
    hostname: os.hostname(),
    files: {},
  }));
  ageArtifact(snapshotPath, 30);

  const cleaned = session(root, ['cleanup-runtime', '--force']);
  assert.equal(cleaned.status, 0, cleaned.stderr);
  assert.ok(!fs.existsSync(snapshotPath), 'snapshot must be removed with --force when dead');
});

test('A1 branch 3: supervisor dead, transient alive -> preserved', t => {
  const root = makeProtocolFixture(t);
  const child = spawn(process.execPath, ['-e', 'setInterval(() => {}, 10000)'], { windowsHide: true });
  t.after(() => { try { child.kill(); } catch {} });
  const livePid = child.pid;
  const deadSupPid = 2147483639;

  const owner = 'qwen-transient-alive';
  const journalRel = `.ai/worklog/${owner}.md`;
  const journalPath = path.join(root, journalRel);
  write(root, journalRel, `# Worklog: ${owner}\n\n`);

  const runtimeDir = path.join(root, '.ai/runtime');
  fs.mkdirSync(runtimeDir, { recursive: true });
  const snapshotPath = path.join(runtimeDir, `${owner}.json`);
  fs.writeFileSync(snapshotPath, JSON.stringify({
    version: 1,
    pid: livePid,
    supervisorPid: deadSupPid,
    hostname: os.hostname(),
    files: {},
  }));

  ageArtifact(journalPath, 30);
  ageArtifact(snapshotPath, 30);

  const pruned = session(root, ['prune']);
  assert.equal(pruned.status, 0, pruned.stderr);
  assert.ok(fs.existsSync(journalPath), 'journal must be preserved when transient pid is alive');

  const cleaned = session(root, ['cleanup-runtime', '--force']);
  assert.equal(cleaned.status, 0, cleaned.stderr);
  assert.ok(fs.existsSync(snapshotPath), 'snapshot must be preserved when transient pid is alive');
});

test('A1 branch 4: no supervisor, dead, aged -> prunable/removable', t => {
  const root = makeProtocolFixture(t);
  const deadPid = 2147483640;

  const owner = 'qwen-nosup-dead-aged';
  const journalRel = `.ai/worklog/${owner}.md`;
  const journalPath = path.join(root, journalRel);
  write(root, journalRel, `# Worklog: ${owner}\n\n`);

  const runtimeDir = path.join(root, '.ai/runtime');
  fs.mkdirSync(runtimeDir, { recursive: true });
  const snapshotPath = path.join(runtimeDir, `${owner}.json`);
  fs.writeFileSync(snapshotPath, JSON.stringify({
    version: 1,
    pid: deadPid,
    supervisorPid: null,
    hostname: os.hostname(),
    files: {},
  }));

  ageArtifact(journalPath, 30);
  ageArtifact(snapshotPath, 30);

  const pruned = session(root, ['prune']);
  assert.equal(pruned.status, 0, pruned.stderr);
  assert.ok(!fs.existsSync(journalPath), 'aged empty journal must be quarantined');

  fs.writeFileSync(snapshotPath, JSON.stringify({
    version: 1,
    pid: deadPid,
    supervisorPid: null,
    hostname: os.hostname(),
    files: {},
  }));
  ageArtifact(snapshotPath, 30);

  const cleaned = session(root, ['cleanup-runtime', '--force']);
  assert.equal(cleaned.status, 0, cleaned.stderr);
  assert.ok(!fs.existsSync(snapshotPath), 'snapshot must be removed with --force when dead and aged');
});

test('A1 branch 5: no supervisor, dead, fresh -> preserved by recency', t => {
  const root = makeProtocolFixture(t);
  const deadPid = 2147483640;

  const owner = 'qwen-nosup-dead-fresh';
  const journalRel = `.ai/worklog/${owner}.md`;
  const journalPath = path.join(root, journalRel);
  write(root, journalRel, `# Worklog: ${owner}\n\n`);

  const runtimeDir = path.join(root, '.ai/runtime');
  fs.mkdirSync(runtimeDir, { recursive: true });
  const snapshotPath = path.join(runtimeDir, `${owner}.json`);
  fs.writeFileSync(snapshotPath, JSON.stringify({
    version: 1,
    pid: deadPid,
    supervisorPid: null,
    hostname: os.hostname(),
    files: {},
  }));

  // Artifact is fresh (within 15 minutes)
  const pruned = session(root, ['prune']);
  assert.equal(pruned.status, 0, pruned.stderr);
  assert.ok(fs.existsSync(journalPath), 'fresh empty journal must be preserved by recency');
  assert.match(pruned.stdout, /skipping qwen-nosup-dead-fresh.*recent empty journal/);
});

test('A1 branch 6: foreign host, aged -> prune preserves without --force; cleanup preserves even with --force', t => {
  const root = makeProtocolFixture(t);
  const owner = 'qwen-foreign-aged';
  const journalRel = `.ai/worklog/${owner}.md`;
  const journalPath = path.join(root, journalRel);
  write(root, journalRel, `# Worklog: ${owner}\n\n`);

  const runtimeDir = path.join(root, '.ai/runtime');
  fs.mkdirSync(runtimeDir, { recursive: true });
  const snapshotPath = path.join(runtimeDir, `${owner}.json`);
  fs.writeFileSync(snapshotPath, JSON.stringify({
    version: 1,
    pid: 999999,
    supervisorPid: 999998,
    hostname: 'foreign-remote-machine',
    files: {},
  }));

  ageArtifact(journalPath, 30);
  ageArtifact(snapshotPath, 30);

  // prune without --force preserves foreign host
  const pruned = session(root, ['prune']);
  assert.equal(pruned.status, 0, pruned.stderr);
  assert.ok(fs.existsSync(journalPath), 'foreign host journal must be preserved without --force');

  // cleanup-runtime preserves even with --force
  const cleaned = session(root, ['cleanup-runtime', '--force']);
  assert.equal(cleaned.status, 0, cleaned.stderr);
  assert.ok(fs.existsSync(snapshotPath), 'foreign host snapshot must be preserved even with --force');
});

test('A1 branch 7: journal with content, everything dead -> never quarantined', t => {
  const root = makeProtocolFixture(t);
  const deadPid = 2147483640;
  const owner = 'qwen-content-dead';
  const journalRel = `.ai/worklog/${owner}.md`;
  const journalPath = path.join(root, journalRel);
  write(root, journalRel, `# Worklog: ${owner}\n\n## 2026-09-19 - Content test\n\nAgent: qwen\n\nAction: test\n\nResult: test\n\nNext step: test\n\nOpen: none\n`);

  const runtimeDir = path.join(root, '.ai/runtime');
  fs.mkdirSync(runtimeDir, { recursive: true });
  const snapshotPath = path.join(runtimeDir, `${owner}.json`);
  fs.writeFileSync(snapshotPath, JSON.stringify({
    version: 1,
    pid: deadPid,
    supervisorPid: deadPid,
    hostname: os.hostname(),
    files: {},
  }));

  ageArtifact(journalPath, 30);
  ageArtifact(snapshotPath, 30);

  const pruned = session(root, ['prune', '--force']);
  assert.equal(pruned.status, 0, pruned.stderr);
  assert.ok(fs.existsSync(journalPath), 'journal with content must NEVER be quarantined, even with --force');
});

test('A1 branch 8: --force + live supervisor -> preserved (both commands)', t => {
  const root = makeProtocolFixture(t);
  const sup = spawn(process.execPath, ['-e', 'setInterval(() => {}, 10000)'], { windowsHide: true });
  t.after(() => { try { sup.kill(); } catch {} });
  const liveSupPid = sup.pid;
  const deadPid = 2147483640;

  const owner = 'qwen-force-livesup';
  const journalRel = `.ai/worklog/${owner}.md`;
  const journalPath = path.join(root, journalRel);
  write(root, journalRel, `# Worklog: ${owner}\n\n`);

  const runtimeDir = path.join(root, '.ai/runtime');
  fs.mkdirSync(runtimeDir, { recursive: true });
  const snapshotPath = path.join(runtimeDir, `${owner}.json`);
  fs.writeFileSync(snapshotPath, JSON.stringify({
    version: 1,
    pid: deadPid,
    supervisorPid: liveSupPid,
    hostname: os.hostname(),
    files: {},
  }));

  ageArtifact(journalPath, 30);
  ageArtifact(snapshotPath, 30);

  const pruned = session(root, ['prune', '--force']);
  assert.equal(pruned.status, 0, pruned.stderr);
  assert.ok(fs.existsSync(journalPath), 'journal with live supervisor must be preserved even under --force');

  const cleaned = session(root, ['cleanup-runtime', '--force']);
  assert.equal(cleaned.status, 0, cleaned.stderr);
  assert.ok(fs.existsSync(snapshotPath), 'snapshot with live supervisor must be preserved even under --force');
});

test('A1 branch 9: --force + foreign host -> prune may quarantine (audited), cleanup preserves', t => {
  const root = makeProtocolFixture(t);
  const owner = 'qwen-force-foreign';
  const journalRel = `.ai/worklog/${owner}.md`;
  const journalPath = path.join(root, journalRel);
  write(root, journalRel, `# Worklog: ${owner}\n\n`);

  const runtimeDir = path.join(root, '.ai/runtime');
  fs.mkdirSync(runtimeDir, { recursive: true });
  const snapshotPath = path.join(runtimeDir, `${owner}.json`);
  fs.writeFileSync(snapshotPath, JSON.stringify({
    version: 1,
    pid: 999999,
    supervisorPid: 999998,
    hostname: 'other-foreign-host',
    files: {},
  }));

  ageArtifact(journalPath, 30);
  ageArtifact(snapshotPath, 30);

  // prune --force quarantines with audit warning
  const pruned = session(root, ['prune', '--force']);
  assert.equal(pruned.status, 0, pruned.stderr);
  assert.match(pruned.stderr, /\[AUDIT WARN\] quarantining foreign host or unknown liveness journal/);
  assert.ok(!fs.existsSync(journalPath), 'foreign host empty journal quarantined under --force');

  // cleanup-runtime --force preserves foreign host snapshot
  fs.writeFileSync(snapshotPath, JSON.stringify({
    version: 1,
    pid: 999999,
    supervisorPid: 999998,
    hostname: 'other-foreign-host',
    files: {},
  }));
  // create worklog for cleanup check
  write(root, journalRel, `# Worklog: ${owner}\n\n`);
  ageArtifact(snapshotPath, 30);

  const cleaned = session(root, ['cleanup-runtime', '--force']);
  assert.equal(cleaned.status, 0, cleaned.stderr);
  assert.ok(fs.existsSync(snapshotPath), 'foreign host snapshot preserved in cleanup even with --force');
});

test('A1 branch 10: missing state file, empty journal fresh / aged -> preserved / quarantined', t => {
  const root = makeProtocolFixture(t);

  // Fresh empty journal without state file
  const freshOwner = 'qwen-nostate-fresh';
  const freshJournal = path.join(root, `.ai/worklog/${freshOwner}.md`);
  write(root, `.ai/worklog/${freshOwner}.md`, `# Worklog: ${freshOwner}\n\n`);

  const prunedFresh = session(root, ['prune']);
  assert.equal(prunedFresh.status, 0, prunedFresh.stderr);
  assert.ok(fs.existsSync(freshJournal), 'fresh empty journal without state file preserved by recency');

  // Aged empty journal without state file
  const agedOwner = 'qwen-nostate-aged';
  const agedJournal = path.join(root, `.ai/worklog/${agedOwner}.md`);
  write(root, `.ai/worklog/${agedOwner}.md`, `# Worklog: ${agedOwner}\n\n`);
  ageArtifact(agedJournal, 30);

  const prunedAged = session(root, ['prune']);
  assert.equal(prunedAged.status, 0, prunedAged.stderr);
  assert.ok(!fs.existsSync(agedJournal), 'aged empty journal without state file quarantined');
});

test('A1 branch 11: certify two entries, archive the older (--keep 1), verify --deep -> exit 0', t => {
  const root = makeProtocolFixture(t, { fastValidator: true });
  const started = session(root, ['start', '--agent', 'qwen', '--session', 'archive-verify-test']);
  assert.equal(started.status, 0, started.stderr);
  const owner = started.stdout.match(/Owner name for the lock and for evidence: (\S+)/)[1];
  const journalPath = path.join(root, `.ai/worklog/${owner}.md`);

  // Write entry 1
  const entry1 = `## 2026-09-19 - First entry\n\nAgent: qwen\n\nAction: action 1\n\nResult: result 1\n\nNext step: step 1\n\nOpen: none\n`;
  write(root, `.ai/worklog/${owner}.md`, `# Worklog: ${owner}\n\n${entry1}\n`);

  const rec1 = run(process.execPath, [
    path.join(root, '.ai/bin/protocol-handoff.cjs'), 'record',
    '--owner', owner, '--root', root,
  ], root);
  assert.equal(rec1.status, 0, rec1.stderr);

  // Read journal with evidence 1, prepend entry 2
  const journalContent1 = fs.readFileSync(journalPath, 'utf8');
  const entry2 = `## 2026-09-19 - Second entry\n\nAgent: qwen\n\nAction: action 2\n\nResult: result 2\n\nNext step: step 2\n\nOpen: none\n`;
  const updatedJournal = journalContent1.replace(/^(# Worklog: [^\n]+\n\n)/, `$1${entry2}\n---\n\n`);
  fs.writeFileSync(journalPath, updatedJournal);

  const rec2 = run(process.execPath, [
    path.join(root, '.ai/bin/protocol-handoff.cjs'), 'record',
    '--owner', owner, '--root', root,
  ], root);
  assert.equal(rec2.status, 0, rec2.stderr);

  // Archive older entry keeping 1 (entry 2 kept in journal, entry 1 moved to ARCHIVE.md)
  const arch = run(process.execPath, [
    path.join(root, '.ai/bin/protocol-archive.cjs'), 'worklog',
    journalPath, '--keep', '1', '--root', root,
  ], root);
  assert.equal(arch.status, 0, arch.stderr);

  // Verify --deep must exit 0
  const verify = run(process.execPath, [
    path.join(root, '.ai/bin/protocol-handoff.cjs'), 'verify',
    '--owner', owner, '--deep', '--root', root,
  ], root);
  assert.equal(verify.status, 0, verify.stderr);
});

test('AUD-4: corrupt or unreadable state JSON with an aged empty journal is quarantined by prune', t => {
  const root = makeProtocolFixture(t);
  const owner = 'qwen-corrupt-state';
  const journalRel = `.ai/worklog/${owner}.md`;
  const journalPath = path.join(root, journalRel);
  write(root, journalRel, `# Worklog: ${owner}\n\n`);

  const runtimeDir = path.join(root, '.ai', 'runtime');
  fs.mkdirSync(runtimeDir, { recursive: true });
  const snapshotPath = path.join(runtimeDir, `${owner}.json`);
  fs.writeFileSync(snapshotPath, '{ malformed-json: [unclosed');

  ageArtifact(journalPath, 30);
  ageArtifact(snapshotPath, 30);

  const pruned = session(root, ['prune']);
  assert.equal(pruned.status, 0, pruned.stderr);
  assert.ok(!fs.existsSync(journalPath), 'aged empty journal with corrupt state file should be quarantined');
  assert.doesNotMatch(pruned.stderr, /\[AUDIT WARN\]/, 'corrupt state file should fall back to recency without AUDIT WARN');
});

test('AUD-4: active lock holder empty journal is preserved by prune even under --force', t => {
  const root = makeProtocolFixture(t);
  const owner = 'qwen-lock-holder';
  const journalRel = `.ai/worklog/${owner}.md`;
  const journalPath = path.join(root, journalRel);
  write(root, journalRel, `# Worklog: ${owner}\n\n`);

  // Acquire cooperative lock for this owner
  const lock = run(process.execPath, [
    path.join(root, '.ai/bin/protocol-lock.cjs'), 'acquire',
    '--owner', owner, '--root', root,
  ], root);
  assert.equal(lock.status, 0, lock.stderr);

  // Age the journal past RECENT_WINDOW
  ageArtifact(journalPath, 30);

  const pruned = session(root, ['prune', '--force']);
  assert.equal(pruned.status, 0, pruned.stderr);
  assert.ok(fs.existsSync(journalPath), 'active lock holder empty journal must be preserved under prune --force');
  assert.match(pruned.stdout, /skipping qwen-lock-holder\.md \(active lock holder\)/);

  // Release the lock
  const unlock = run(process.execPath, [
    path.join(root, '.ai/bin/protocol-lock.cjs'), 'release',
    '--owner', owner, '--root', root,
  ], root);
  assert.equal(unlock.status, 0, unlock.stderr);
});

test('cycle guard: requiring protocol-session then protocol-lock exposes callable liveness functions without undefined exports', () => {
  const code = `
    const sess = require('./.ai/bin/protocol-session.cjs');
    const lock = require('./.ai/bin/protocol-lock.cjs');
    if (typeof sess.isSessionAlive !== 'function') process.exit(1);
    if (typeof sess.checkProcessAlive !== 'function') process.exit(2);
    if (typeof lock.operate !== 'function') process.exit(3);
  `;
  const res = run(process.execPath, ['-e', code], repoRoot);
  assert.equal(res.status, 0, res.stderr);
  assert.doesNotMatch(res.stderr, /circular dependency/i);
});

test('CLI stop executes auto-archive without circular dependency warnings when journal exceeds 150 lines', t => {
  const root = makeProtocolFixture(t);
  const sessionName = 'archive-stop-session';
  const startRes = session(root, ['start', '--agent', 'qwen', '--session', sessionName]);
  assert.equal(startRes.status, 0, startRes.stderr);
  const journalRel = startRes.stdout.match(/Journal: (\S+)/)[1];
  const journalPath = path.join(root, journalRel);

  // Construct a journal exceeding 150 lines with two valid complete entries
  const entry1 = `## 2026-09-19 - Latest entry\n\nAgent: qwen\n\nAction: latest work done\n\nResult: verified latest\n\nNext step: handoff\n\nOpen: none\n\nEvidence:\nClean.\n`;
  const fillerLines = Array.from({ length: 160 }, (_, i) => `Detail line ${i}.`).join('\n');
  const entry2 = `## 2026-09-18 - Older entry to archive\n\nAgent: qwen\n\nAction:\n${fillerLines}\n\nResult: verified\n\nNext step: handoff\n\nOpen: none\n\nEvidence:\nClean.\n`;
  fs.writeFileSync(journalPath, `# Worklog: ${sessionName}\n\n${entry1}\n---\n\n${entry2}\n`);

  const linesBefore = fs.readFileSync(journalPath, 'utf8').trim().split(/\r?\n/).length;
  assert.ok(linesBefore > 150, `journal should exceed 150 lines before stop, got ${linesBefore}`);

  // Execute CLI stop
  const stopRes = session(root, ['stop', '--agent', 'qwen', '--session', sessionName]);
  assert.equal(stopRes.status, 0, stopRes.stderr);
  assert.doesNotMatch(stopRes.stderr, /circular dependency/i, 'stderr must not contain circular dependency warnings');

  // Verify that auto-archive actually moved the older entry to .ai/ARCHIVE.md
  const journalAfter = fs.readFileSync(journalPath, 'utf8');
  const linesAfter = journalAfter.trim().split(/\r?\n/).length;
  assert.ok(linesAfter <= 150, `journal should be <= 150 lines after auto-archive, got ${linesAfter}`);
  assert.match(journalAfter, /Latest entry/);
  assert.doesNotMatch(journalAfter, /Older entry to archive/);

  const archivePath = path.join(root, '.ai/ARCHIVE.md');
  assert.ok(fs.existsSync(archivePath));
  const archiveContent = fs.readFileSync(archivePath, 'utf8');
  assert.match(archiveContent, /Older entry to archive/);
});

