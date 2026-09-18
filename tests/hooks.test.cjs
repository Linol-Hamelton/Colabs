'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { run, git, write, makeProtocolFixture, makeFixture, findGitBash } = require('./helpers.cjs');

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

test('read-only sessions ignore pre-existing edits and ignored runtime files', t => {
  const root = fixture(t);
  write(root, 'source.txt', 'Already dirty before this session.\n');
  write(root, 'pre-existing untracked.txt', 'Other work.\n');
  start(root);
  write(root, '.ai/runtime/generated.json', '{}\n');
  assert.deepEqual(hook(root, 'Stop'), {});
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
  assert.deepEqual(hook(root, 'Stop'), {});
  const fixedTime = new Date('2026-09-11T00:00:00Z');
  write(root, 'source.txt', 'A new change.\n');
  fs.utimesSync(path.join(root, 'source.txt'), fixedTime, fixedTime);
  fs.utimesSync(path.join(root, worklog), fixedTime, fixedTime);
  warning(hook(root, 'Stop'));
  fs.appendFileSync(path.join(root, worklog), '\n## Entry template\nChanged boilerplate.\n');
  warning(hook(root, 'Stop'));
  write(root, worklog, `${entry('Current handoff')}\n${entry('Earlier handoff')}`);
  assert.deepEqual(hook(root, 'Stop'), {});
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
  assert.deepEqual(hook(root, 'Stop'), {});
  assert.deepEqual(hook(root, 'Stop'), {});
});

test('session-specific worklogs prevent another Claude session satisfying the check', t => {
  const root = fixture(t);
  const first = start(root, 'first');
  const second = start(root, '../second/session');
  assert.notEqual(first.worklog, second.worklog);
  assert.match(second.worklog, /^\.ai\/worklog\/claude-[a-f0-9]{16}\.md$/);
  write(root, 'source.txt', 'Changed.\n');
  write(root, first.worklog, entry());
  assert.deepEqual(hook(root, 'Stop', 'first'), {});
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
    assert.deepEqual(configured('Stop', cwd, projectDir, cwd, session), {});
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


