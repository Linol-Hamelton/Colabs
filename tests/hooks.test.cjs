'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { run, git, write, makeProtocolFixture, makeFixture, findGitBash } = require('./helpers.cjs');
const hooks = require('../.ai/bin/protocol-hooks.cjs');

function entry(title = 'Handoff', detail = 'Changed the fixture.') {
  return `## 2026-09-11 - ${title}\n\nAgent: Claude\n\nAction:\n${detail}\n\n` +
    'Result:\nVerified the behavior.\n\nNext step:\nContinue the test.\n\nOpen:\nNone.\n\nEvidence:\nFixture verified.\n';
}

function fixture(t) {
  const root = makeProtocolFixture(t);
  fs.appendFileSync(path.join(root, '.gitignore'), '\n.ai/runtime/\n');
  write(root, 'source.txt', 'Initial source.\n');
  write(root, 'file with spaces.txt', 'Initial source.\n');
  assert.equal(git(root, ['add', '.']).status, 0);
  const commit = git(root, ['-c', 'user.name=Protocol Test', '-c',
    'user.email=protocol-test@example.invalid', 'commit', '-m', 'Seed protocol']);
  assert.equal(commit.status, 0, commit.stderr);
  return root;
}

function hook(root, event, session = 'test-session', extra = {}) {
  const result = run(process.execPath, [path.join(root, '.claude/hooks/protocol-hooks.cjs'), event], root, {
    input: JSON.stringify({ session_id: session, cwd: root, hook_event_name: event, ...extra }),
  });
  assert.equal(result.status, 0, result.stderr);
  return JSON.parse(result.stdout);
}

function start(root, session = 'test-session', extra = {}) {
  const result = hook(root, 'SessionStart', session, extra);
  assert.ok(result.hookSpecificOutput, JSON.stringify(result));
  const context = result.hookSpecificOutput.additionalContext;
  return { context, worklog: context.match(/Your worklog: (.+)\n/)[1] };
}

function warning(result) {
  assert.match(result.systemMessage || '', /file\(s\) changed/);
  assert.equal(result.decision, undefined, 'Stop must never block');
}

function okStop(result, expected = {}) {
  assert.equal(result.systemMessage, expected.systemMessage, result.systemMessage);
  assert.equal(typeof result.changedFiles, 'number');
  assert.equal(typeof result.durationSec, 'number');
  assert.ok(result.firstEditMs === null || typeof result.firstEditMs === 'number');
  assert.equal(typeof result.handoffComplete, 'boolean');
  if (expected.changedFiles !== undefined) assert.equal(result.changedFiles, expected.changedFiles);
  if (expected.firstEditMs !== undefined) assert.equal(result.firstEditMs, expected.firstEditMs);
  if (expected.handoffComplete !== undefined) assert.equal(result.handoffComplete, expected.handoffComplete);
}

test('read-only sessions ignore pre-existing edits and ignored runtime files', t => {
  const root = fixture(t);
  write(root, 'source.txt', 'Already dirty before this session.\n');
  write(root, 'pre-existing untracked.txt', 'Other work.\n');
  start(root);
  write(root, '.ai/runtime/generated.json', '{}\n');
  okStop(hook(root, 'Stop'), { changedFiles: 0, firstEditMs: null });
});

test('snapshot metadata does not collide with a file named __dirty', t => {
  const root = fixture(t);
  write(root, '__dirty', 'a real repository file\n');
  const snapshot = hooks.snapshot(root);
  assert.equal(snapshot[hooks.DIRTY_SYMBOL], true);
  assert.ok(Object.keys(snapshot).includes('__dirty'));
});

for (const change of ['spaces and unicode', 'deletion', 'staged rename', 'more than 60 paths']) {
  test(`Stop detects ${change}`, t => {
    const root = fixture(t);
    start(root);
    if (change === 'spaces and unicode') write(root, "a 'quote' $(literal) тест.txt", 'Changed.\n');
    if (change === 'deletion') fs.unlinkSync(path.join(root, 'file with spaces.txt'));
    if (change === 'staged rename') {
      const moved = git(root, ['mv', 'file with spaces.txt', 'renamed file.txt']);
      assert.equal(moved.status, 0, moved.stderr);
    }
    if (change === 'more than 60 paths') {
      for (let i = 0; i < 75; i++) write(root, `many files/${i}.txt`, `${i}\n`);
    }
    const result = hook(root, 'Stop');
    warning(result);
    if (change === 'more than 60 paths') assert.match(result.systemMessage, /75 file/);
  });
}

test('same timestamp, touched worklog, and header-only edits do not count as a handoff', t => {
  const root = fixture(t);
  const { worklog } = start(root);
  write(root, worklog, entry('Earlier handoff'));
  okStop(hook(root, 'Stop'), { changedFiles: 0, firstEditMs: null });
  const fixedTime = new Date('2026-09-11T00:00:00Z');
  write(root, 'source.txt', 'A new change.\n');
  fs.utimesSync(path.join(root, 'source.txt'), fixedTime, fixedTime);
  fs.utimesSync(path.join(root, worklog), fixedTime, fixedTime);
  warning(hook(root, 'Stop'));
  fs.appendFileSync(path.join(root, worklog), '\n## Entry template\nChanged boilerplate.\n');
  warning(hook(root, 'Stop'));
  write(root, worklog, `${entry('Current handoff')}\n${entry('Earlier handoff')}`);
  okStop(hook(root, 'Stop'), { changedFiles: 1, handoffComplete: true });
  write(root, 'source.txt', 'Next turn, same timestamp.\n');
  fs.utimesSync(path.join(root, 'source.txt'), fixedTime, fixedTime);
  warning(hook(root, 'Stop'));
});

test('an incomplete entry cannot acknowledge changes; a new complete entry can', t => {
  const root = fixture(t);
  const { worklog } = start(root);
  write(root, 'source.txt', 'Changed.\n');
  write(root, worklog, '## 2026-09-11 - Incomplete\n\nAgent: Claude\n\nAction:\nStarted.\n');
  warning(hook(root, 'Stop'));
  write(root, worklog, entry());
  okStop(hook(root, 'Stop'), { changedFiles: 1, handoffComplete: true });
  okStop(hook(root, 'Stop'), { changedFiles: 0, handoffComplete: false });
});

test('session-specific worklogs prevent another Claude session satisfying the check', t => {
  const root = fixture(t);
  const first = start(root, 'first');
  const second = start(root, '../second/session');
  assert.notEqual(first.worklog, second.worklog);
  assert.match(second.worklog, /^\.ai\/worklog\/claude-[a-f0-9]{16}\.md$/);
  write(root, 'source.txt', 'Changed.\n');
  write(root, first.worklog, entry());
  okStop(hook(root, 'Stop', 'first'), { changedFiles: 1, handoffComplete: true });
  warning(hook(root, 'Stop', '../second/session'));
});

test('SessionStart resume and compaction preserve unrecorded changes', t => {
  const root = fixture(t);
  start(root);
  write(root, 'source.txt', 'Changed.\n');
  start(root, 'test-session', { source: 'compact' });
  warning(hook(root, 'Stop'));
  start(root, 'test-session', { source: 'resume' });
  warning(hook(root, 'Stop'));
});

test('context includes a complete recent entry beyond line 30 and excludes older entries', t => {
  const root = fixture(t);
  const detail = Array.from({ length: 38 }, (_, i) => `Detail ${i}.`).join('\n') + '\nLAST_DETAIL_MARKER';
  write(root, '.ai/worklog/claude.md', '# Worklog\n\n' + entry('Latest', detail) + '\n' + entry('OLDER_MARKER'));
  const { context } = start(root);
  assert.match(context, /LAST_DETAIL_MARKER/);
  assert.match(context, /Open:\nNone\./);
  assert.doesNotMatch(context, /OLDER_MARKER/);
  assert.match(context, /\.ai\/PLAN\.md/);
  assert.match(context, /\.ai\/DECISIONS\.md/);
  assert.ok(context.length <= 9500);
});

test('oversized entries are explicitly omitted whole, and context remains bounded', t => {
  const root = fixture(t);
  for (let i = 0; i < 12; i++) write(root, `.ai/worklog/agent-${i}.md`, entry('Large', 'X'.repeat(6000)));
  const { context } = start(root);
  assert.match(context, /Not injected in full/);
  assert.match(context, /additional worklog\(s\) omitted/);
  assert.doesNotMatch(context, /X{100}/);
  assert.ok(context.length <= 9500);
});

test('context includes an archive summary so archived sessions are visible', t => {
  const root = fixture(t);
  write(root, '.ai/ARCHIVE.md', '# Archive\n\n## 2026-09-17 - Deep work\n\nAgent: DeepSeek\n\nAction: Did 7 turns.\n\nResult: Pass.\n\nNext step: Handoff.\n\nOpen: None.\n');
  const { context } = start(root);
  assert.match(context, /Archive ledger: \.ai\/ARCHIVE\.md holds 1 archived entry/);
  assert.match(context, /2026-09-17 - Deep work/);
});

test('missing baseline, invalid JSON, missing session id, and corrupt state produce visible warnings', t => {
  const root = fixture(t);
  assert.match(hook(root, 'Stop').systemMessage, /no SessionStart snapshot/);
  assert.match(hook(root, 'SessionStart', '').systemMessage, /no session_id/);
  const invalid = run(process.execPath, [path.join(root, '.claude/hooks/protocol-hooks.cjs'), 'Stop'], root,
    { input: 'not JSON' });
  assert.equal(invalid.status, 0);
  assert.match(JSON.parse(invalid.stdout).systemMessage, /hook check unavailable/);
  start(root);
  const runtime = path.join(root, '.ai/runtime');
  const state = fs.readdirSync(runtime).find(name => name.startsWith('claude-'));
  fs.writeFileSync(path.join(runtime, state), '{broken');
  assert.match(hook(root, 'Stop').systemMessage, /Cannot read session snapshot/);
});

test('the configured Git Bash commands work at root, in subdirectories, and in a worktree', t => {
  const bash = findGitBash();
  assert.ok(bash, 'Git Bash is required to verify configured hooks');
  const root = fixture(t);
  const settings = JSON.parse(fs.readFileSync(path.join(root, '.claude/settings.json'), 'utf8'));
  const commands = Object.fromEntries(['SessionStart', 'Stop'].map(event =>
    [event, settings.hooks[event][0].hooks[0].command]));
  const configured = (event, commandCwd, projectDir, activeCwd, session) => {
    const env = { ...process.env };
    if (projectDir) env.CLAUDE_PROJECT_DIR = projectDir;
    else delete env.CLAUDE_PROJECT_DIR;
    const result = run(bash, ['-c', commands[event]], commandCwd, {
      env, input: JSON.stringify({ cwd: activeCwd, session_id: session }),
    });
    assert.equal(result.status, 0, result.stderr);
    return JSON.parse(result.stdout);
  };
  const subdir = path.join(root, 'directory with spaces');
  fs.mkdirSync(subdir);
  for (const [cwd, projectDir, session] of [
    [root, root, 'root'], [subdir, subdir, 'subdir'], [subdir, null, 'fallback'],
  ]) {
    const result = configured('SessionStart', cwd, projectDir, cwd, session);
    assert.match(result.hookSpecificOutput?.additionalContext || JSON.stringify(result), /Your worklog:/);
    okStop(configured('Stop', cwd, projectDir, cwd, session), { changedFiles: 0, firstEditMs: null });
  }
  const worktree = path.join(makeFixture(t), 'worktree with spaces');
  const added = git(root, ['worktree', 'add', '--detach', worktree, 'HEAD']);
  assert.equal(added.status, 0, added.stderr);
  write(worktree, '.ai/TASK.md', '# Current Task\n\nWORKTREE_ONLY_MARKER\n');
  const active = configured('SessionStart', root, root, worktree, 'worktree');
  assert.match(active.hookSpecificOutput?.additionalContext || JSON.stringify(active), /WORKTREE_ONLY_MARKER/);
  write(worktree, 'source.txt', 'Worktree edit.\n');
  warning(configured('Stop', root, root, worktree, 'worktree'));
});

test('Stop warns and flags unredacted secret patterns in worklog entries', t => {
  const root = fixture(t);
  const session = 'secret-test';
  const { worklog } = start(root, session);
  write(root, 'new-file.txt', 'New work.\n');
  const journal = path.join(root, worklog);
  fs.writeFileSync(journal, `# Worklog\n\n## 2026-09-17 - Work\n\nAgent: tester\n\nAction: did work\n\n` +
    `Result: API_KEY = "sk-1234567890abcdef12345678"\n\nNext step: next\n\nOpen: none\n`);
  const stop = hook(root, 'Stop', session);
  assert.match(stop.systemMessage || '', /unredacted secret pattern detected/);
});

test('Stop returns telemetry fields and records JSONL line in .ai/runtime/metrics/sessions.jsonl', t => {
  const root = fixture(t);
  const sessionName = 'telemetry-test';
  const { worklog } = start(root, sessionName);
  write(root, 'changed.txt', 'Hello telemetry\n');
  write(root, worklog, entry('Telemetry test'));
  const res = hook(root, 'Stop', sessionName);
  okStop(res, { changedFiles: 1, handoffComplete: true });
  assert.equal(typeof res.firstEditMs, 'number');

  const metricsPath = path.join(root, '.ai/runtime/metrics/sessions.jsonl');
  assert.ok(fs.existsSync(metricsPath));
  const lines = fs.readFileSync(metricsPath, 'utf8').trim().split('\n');
  assert.equal(lines.length, 1);
  const record = JSON.parse(lines[0]);
  assert.ok(record.ts);
  assert.equal(record.session, sessionName);
  assert.equal(record.agent, 'claude');
  assert.equal(record.changedFiles, 1);
  assert.equal(typeof record.durationSec, 'number');
  assert.equal(typeof record.firstEditMs, 'number');
  assert.equal(record.handoffComplete, true);
  assert.ok(Object.prototype.hasOwnProperty.call(record, 'gitHead'));
});

test('Stop produces changedFiles: 0 and firstEditMs: null when tree is clean', t => {
  const root = fixture(t);
  const sessionName = 'clean-session';
  start(root, sessionName);
  const res = hook(root, 'Stop', sessionName);
  okStop(res, { changedFiles: 0, firstEditMs: null, handoffComplete: false });

  const metricsPath = path.join(root, '.ai/runtime/metrics/sessions.jsonl');
  const lines = fs.readFileSync(metricsPath, 'utf8').trim().split('\n');
  const record = JSON.parse(lines[lines.length - 1]);
  assert.equal(record.changedFiles, 0);
  assert.equal(record.firstEditMs, null);
  assert.equal(record.handoffComplete, false);
});

test('vanished path between snapshot and stat is skipped gracefully', t => {
  const root = fixture(t);
  const sessionName = 'vanish-session';
  start(root, sessionName);
  write(root, 'vanish.txt', 'Going away\n');
  // Delete the file so it's vanished
  fs.unlinkSync(path.join(root, 'vanish.txt'));
  const res = hook(root, 'Stop', sessionName);
  okStop(res, { changedFiles: 0, firstEditMs: null });
});

test('metrics file rotates to sessions.1.jsonl when exceeding 1 MB', t => {
  const root = fixture(t);
  const sessionName = 'rotation-test';
  start(root, sessionName);
  const metricsDir = path.join(root, '.ai/runtime/metrics');
  fs.mkdirSync(metricsDir, { recursive: true });
  const metricsFile = path.join(metricsDir, 'sessions.jsonl');
  const rotatedFile = path.join(metricsDir, 'sessions.1.jsonl');

  // Seed with 1 MB of dummy data
  const chunk = '{"dummy":true}\n';
  const repeatCount = Math.ceil((1024 * 1024) / chunk.length);
  fs.writeFileSync(metricsFile, chunk.repeat(repeatCount));
  assert.ok(fs.statSync(metricsFile).size >= 1024 * 1024);

  // Trigger recordSessionMetric directly or via hook
  const res = hook(root, 'Stop', sessionName);
  okStop(res);

  assert.ok(fs.existsSync(rotatedFile), 'sessions.1.jsonl must exist after rotation');
  assert.ok(fs.statSync(rotatedFile).size >= 1024 * 1024);
  const newContent = fs.readFileSync(metricsFile, 'utf8').trim().split('\n');
  assert.equal(newContent.length, 1);
  assert.equal(JSON.parse(newContent[0]).session, 'rotation-test');
});

test('changed-without-journal Stop writes row with handoffComplete: false and preserves warning', t => {
  const root = fixture(t);
  const sessionName = 'changed-no-journal';
  start(root, sessionName);
  write(root, 'uncommitted.txt', 'Uncommitted edit\n');
  const res = hook(root, 'Stop', sessionName);
  assert.match(res.systemMessage || '', /file\(s\) changed/);

  const metricsPath = path.join(root, '.ai/runtime/metrics/sessions.jsonl');
  assert.ok(fs.existsSync(metricsPath));
  const lines = fs.readFileSync(metricsPath, 'utf8').trim().split('\n');
  assert.equal(lines.length, 1);
  const record = JSON.parse(lines[0]);
  assert.equal(record.session, sessionName);
  assert.equal(record.agent, 'claude');
  assert.equal(record.changedFiles, 1);
  assert.equal(typeof record.durationSec, 'number');
  assert.equal(typeof record.firstEditMs, 'number');
  assert.equal(record.handoffComplete, false);
  assert.ok(Object.prototype.hasOwnProperty.call(record, 'gitHead'));
});

test('Stop without SessionStart writes row with null baseline-dependent fields and preserves warning', t => {
  const root = fixture(t);
  const sessionName = 'no-start-session';
  const res = hook(root, 'Stop', sessionName);
  assert.match(res.systemMessage || '', /no SessionStart snapshot/);

  const metricsPath = path.join(root, '.ai/runtime/metrics/sessions.jsonl');
  assert.ok(fs.existsSync(metricsPath));
  const lines = fs.readFileSync(metricsPath, 'utf8').trim().split('\n');
  assert.equal(lines.length, 1);
  const record = JSON.parse(lines[0]);
  assert.equal(record.session, sessionName);
  assert.equal(record.agent, 'claude');
  assert.equal(record.changedFiles, null);
  assert.equal(record.durationSec, null);
  assert.equal(record.firstEditMs, null);
  assert.equal(record.handoffComplete, false);
  assert.ok(Object.prototype.hasOwnProperty.call(record, 'gitHead'));
});

test('secret-warning Stop writes row with handoffComplete: false and preserves warning', t => {
  const root = fixture(t);
  const sessionName = 'secret-metrics-test';
  const { worklog } = start(root, sessionName);
  write(root, 'file.txt', 'Edit\n');
  const journal = path.join(root, worklog);
  fs.writeFileSync(journal, `# Worklog\n\n## 2026-09-17 - Work\n\nAgent: tester\n\nAction: did work\n\n` +
    `Result: API_KEY = "sk-1234567890abcdef12345678"\n\nNext step: next\n\nOpen: none\n`);
  const res = hook(root, 'Stop', sessionName);
  assert.match(res.systemMessage || '', /unredacted secret pattern detected/);

  const metricsPath = path.join(root, '.ai/runtime/metrics/sessions.jsonl');
  assert.ok(fs.existsSync(metricsPath));
  const lines = fs.readFileSync(metricsPath, 'utf8').trim().split('\n');
  assert.equal(lines.length, 1);
  const record = JSON.parse(lines[0]);
  assert.equal(record.session, sessionName);
  assert.equal(record.agent, 'claude');
  assert.equal(record.changedFiles, 1);
  assert.equal(typeof record.durationSec, 'number');
  assert.equal(typeof record.firstEditMs, 'number');
  assert.equal(record.handoffComplete, false);
});

test('metrics write failure (read-only directory in a fixture) hook still succeeds and does not throw', t => {
  const root = fixture(t);
  const sessionName = 'fail-safe-test';
  const { worklog } = start(root, sessionName);
  write(root, 'work.txt', 'Work\n');
  write(root, worklog, entry('Fail-safe metric test'));

  const metricsDir = path.join(root, '.ai/runtime/metrics');
  fs.writeFileSync(metricsDir, 'blocker file to force ENOTDIR');

  const res = hook(root, 'Stop', sessionName);
  okStop(res, { changedFiles: 1, handoffComplete: true });
});

test('no journal text, diffs, or secrets appear in any metrics row across exits', t => {
  const root = fixture(t);
  const sessionName = 'hygiene-test';
  const secret = 'sk-1234567890abcdef12345678';
  const uniqueActionText = 'UNIQUE_PROPRIETARY_ACTION_TEXT_12345';
  const { worklog } = start(root, sessionName);
  write(root, 'work.txt', 'Work\n');
  const journal = path.join(root, worklog);
  fs.writeFileSync(journal, `# Worklog\n\n## 2026-09-17 - Work\n\nAgent: tester\n\n` +
    `Action: ${uniqueActionText}\n\n` +
    `Result: API_KEY = "${secret}"\n\nNext step: next\n\nOpen: none\n`);

  hook(root, 'Stop', sessionName);

  const metricsPath = path.join(root, '.ai/runtime/metrics/sessions.jsonl');
  const content = fs.readFileSync(metricsPath, 'utf8');
  assert.ok(!content.includes(secret), 'Metrics row must not contain secret');
  assert.ok(!content.includes(uniqueActionText), 'Metrics row must not contain journal action text');
  assert.ok(!content.includes('UNIQUE_PROPRIETARY'), 'Metrics row must not contain journal content');
  assert.ok(!content.includes('diff --git'), 'Metrics row must not contain diffs');
});

