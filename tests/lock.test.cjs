'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { spawn } = require('node:child_process');
const { makeProtocolFixture, run, write } = require('./helpers.cjs');

function invoke(root, command, owner) {
  return run(process.execPath, [path.join(root, 'scripts/protocol-lock.cjs'), command,
    ...(owner ? ['--owner', owner] : [])], root);
}

test('shared ownership excludes another writer and only the owner can release it', t => {
  const root = makeProtocolFixture(t);
  const initial = invoke(root, 'status');
  assert.equal(initial.status, 0, initial.stderr);
  assert.equal(JSON.parse(initial.stdout).lock, null);
  assert.equal(fs.existsSync(path.join(root, '.ai/runtime')), false, 'status must not mutate');
  const acquired = invoke(root, 'acquire', 'codex-session-a');
  assert.equal(acquired.status, 0, acquired.stderr);
  assert.equal(JSON.parse(acquired.stdout).worklog, '.ai/worklog/codex-session-a.md');
  assert.notEqual(invoke(root, 'acquire', 'claude-session-b').status, 0);
  assert.notEqual(invoke(root, 'release', 'claude-session-b').status, 0);
  assert.equal(JSON.parse(invoke(root, 'status').stdout).lock.owner, 'codex-session-a');
  assert.equal(invoke(root, 'release', 'codex-session-a').status, 0);
  assert.equal(invoke(root, 'acquire', 'claude-session-b').status, 0);
  assert.equal(invoke(root, 'release', 'claude-session-b').status, 0);
});

test('concurrent acquisitions grant ownership to exactly one process', async t => {
  const root = makeProtocolFixture(t);
  const acquire = owner => new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [path.join(root, 'scripts/protocol-lock.cjs'),
      'acquire', '--owner', owner], { cwd: root, windowsHide: true, stdio: 'ignore' });
    child.on('error', reject);
    child.on('exit', status => resolve({ status, owner }));
  });
  const results = await Promise.all(['codex-one', 'codex-two', 'claude-three', 'claude-four'].map(acquire));
  const winners = results.filter(result => result.status === 0);
  assert.equal(winners.length, 1);
  const owner = JSON.parse(invoke(root, 'status').stdout).lock.owner;
  assert.equal(owner, winners[0].owner);
  assert.equal(invoke(root, 'release', owner).status, 0);
});

test('an interrupted operation is visible and never silently stolen', t => {
  const root = makeProtocolFixture(t);
  write(root, '.ai/runtime/shared-writer-operation/operation.json', '{"owner":"interrupted-session"}\n');
  const result = invoke(root, 'acquire', 'codex-new-session');
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /interrupted|running/);
  assert.equal(JSON.parse(invoke(root, 'status').stdout).operationInProgress, true);
});

test('invalid session identities cannot become worklog paths', t => {
  const root = makeProtocolFixture(t);
  for (const owner of ['../outside', 'codex/session', 'x', 'bad owner']) {
    assert.notEqual(invoke(root, 'acquire', owner).status, 0);
  }
  assert.equal(fs.existsSync(path.join(root, '.ai/runtime')), false);
});
