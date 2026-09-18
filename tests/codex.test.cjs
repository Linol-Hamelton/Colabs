'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { run, git, write, makeProtocolFixture, runPowerShell, findGitBash } = require('./helpers.cjs');

function hook(root, event, session = 'same-id', extra = {}) {
  const result = run(process.execPath, [path.join(root, '.codex/hooks/protocol.cjs')], root, {
    input: JSON.stringify({ session_id: session, cwd: root, hook_event_name: event, ...extra }),
  });
  assert.equal(result.status, 0, result.stderr);
  return JSON.parse(result.stdout);
}

function journal(result) {
  return result.hookSpecificOutput.additionalContext.match(/Your worklog: (.+)\n/)[1];
}

const entry = '## 2026-09-12 - Handoff\n\nAgent: Codex\n\nAction: Updated source.\n\n' +
  'Result: Fixture verified.\n\nNext step: Continue.\n\nOpen: None.\n';

test('Codex and Claude isolate snapshots and journals for identical session ids', t => {
  const root = makeProtocolFixture(t);
  const codexJournal = journal(hook(root, 'SessionStart'));
  const claude = run(process.execPath, [path.join(root, '.claude/hooks/protocol-hooks.cjs'), 'SessionStart'], root, {
    input: JSON.stringify({ session_id: 'same-id', cwd: root }),
  });
  assert.equal(claude.status, 0, claude.stderr);
  const claudeJournal = journal(JSON.parse(claude.stdout));
  assert.match(codexJournal, /^\.ai\/worklog\/codex-[a-f0-9]{16}\.md$/);
  assert.notEqual(codexJournal, claudeJournal);
  assert.ok(fs.existsSync(path.join(root, codexJournal)));
  write(root, 'source.txt', 'Updated.\n');
  write(root, claudeJournal, entry);
  const warning = hook(root, 'Stop');
  assert.match(warning.systemMessage, /no new complete entry/);
  assert.equal(warning.decision, undefined);
  assert.equal(warning.continue, undefined);
  write(root, codexJournal, entry);
  const stop = hook(root, 'Stop');
  assert.equal(stop.systemMessage, undefined);
  assert.ok(stop.stopWarnings);
});

test('Codex resume and compact retain outstanding changes and bounded context', t => {
  const root = makeProtocolFixture(t);
  hook(root, 'SessionStart');
  write(root, 'source.txt', 'Updated.\n');
  for (const source of ['resume', 'compact']) {
    const start = hook(root, 'SessionStart', 'same-id', { source });
    assert.ok(start.hookSpecificOutput.additionalContext.length <= 9500);
    assert.match(hook(root, 'Stop').systemMessage, /no new complete entry/);
  }
});

test('Codex missing baseline and malformed inputs warn without blocking', t => {
  const root = makeProtocolFixture(t);
  assert.match(hook(root, 'Stop').systemMessage, /no SessionStart snapshot/);
  for (const input of ['{', JSON.stringify({ cwd: root, hook_event_name: 'SessionStart' }),
    JSON.stringify({ cwd: root, session_id: 's', hook_event_name: 'SubagentStart' })]) {
    const result = run(process.execPath, [path.join(root, '.codex/hooks/protocol.cjs')], root, { input });
    assert.equal(result.status, 0, result.stderr);
    const output = JSON.parse(result.stdout);
    assert.match(output.systemMessage, /hook check unavailable/);
    assert.equal(output.decision, undefined);
  }
});

test('configured Codex commands run in native shell and Bash from a Unicode subfolder', t => {
  const root = makeProtocolFixture(t);
  const cwd = path.dirname(write(root, 'space тест folder/nested/placeholder', 'x'));
  const config = JSON.parse(fs.readFileSync(path.join(root, '.codex/hooks.json'), 'utf8'));
  const shells = [];
  if (process.platform === 'win32') shells.push(['powershell.exe', ['-NoProfile', '-Command']]);
  const bash = findGitBash();
  assert.ok(bash, 'Git Bash is required for the cross-shell check');
  shells.push([bash, ['-c']]);
  for (const [shell, args] of shells) {
    for (const event of ['SessionStart', 'Stop']) {
      const command = config.hooks[event][0].hooks[0].command;
      const result = run(shell, [...args, command], cwd, {
        input: JSON.stringify({ session_id: shell, cwd, hook_event_name: event }),
      });
      assert.equal(result.status, 0, result.stderr);
      const output = JSON.parse(result.stdout);
      if (event === 'SessionStart') assert.match(journal(output), /codex-/);
      else assert.deepEqual(output, {});
    }
  }
});

test('configured Codex command uses the linked worktree instead of the main checkout', t => {
  const root = makeProtocolFixture(t);
  assert.equal(git(root, ['add', '.']).status, 0);
  assert.equal(git(root, ['-c', 'user.name=Test', '-c', 'user.email=test@example.invalid',
    'commit', '-m', 'Seed']).status, 0);
  const worktree = path.join(root, 'linked worktree');
  assert.equal(git(root, ['worktree', 'add', '-b', 'linked', worktree]).status, 0);
  const command = JSON.parse(fs.readFileSync(path.join(worktree, '.codex/hooks.json'), 'utf8'))
    .hooks.SessionStart[0].hooks[0].command;
  const bash = findGitBash();
  assert.ok(bash);
  const result = run(bash, ['-c', command], worktree, {
    input: JSON.stringify({ session_id: 'worktree', cwd: worktree, hook_event_name: 'SessionStart' }),
    env: { ...process.env, CLAUDE_PROJECT_DIR: root },
  });
  assert.equal(result.status, 0, result.stderr);
  const name = journal(JSON.parse(result.stdout));
  assert.ok(fs.existsSync(path.join(worktree, name)));
  assert.equal(fs.existsSync(path.join(root, name)), false);
});

test('validator rejects broken Codex registrations and execution overrides', t => {
  const root = makeProtocolFixture(t);
  const filename = path.join(root, '.codex/hooks.json');
  const original = fs.readFileSync(filename, 'utf8');
  const mutations = [
    config => { config.hooks.Stop = []; },
    config => { config.hooks.SessionStart[0].matcher = 'startup'; },
    config => { config.hooks.Stop[0].hooks[0].commandWindows = 'echo skipped'; },
    config => { config.hooks.Stop[0].hooks[0].timeout = 0; },
  ];
  for (const mutate of mutations) {
    const config = JSON.parse(original);
    mutate(config);
    write(root, '.codex/hooks.json', JSON.stringify(config) + '\n');
    const result = runPowerShell('validate-protocol.ps1', [], root);
    assert.equal(result.status, 1, result.stdout + result.stderr);
    assert.match(result.stdout, /invalid Codex hooks/);
  }
});

test('host Codex config formatting is preserved outside protocol encoding scope', t => {
  const root = makeProtocolFixture(t);
  write(root, '.codex/config.toml', '# Host preferences\r\nmodel_reasoning_effort = "high"\r\n');
  const result = runPowerShell('validate-protocol.ps1', [], root);
  assert.equal(result.status, 0, result.stdout + result.stderr);
});
