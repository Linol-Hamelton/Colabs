'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const crypto = require('node:crypto');
const { spawn } = require('node:child_process');
const { makeProtocolFixture, run, write } = require('./helpers.cjs');

function invoke(root, command, owner) {
  return run(process.execPath, [path.join(root, '.ai/bin/protocol-lock.cjs'), command,
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
    const child = spawn(process.execPath, [path.join(root, '.ai/bin/protocol-lock.cjs'),
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

test('an abandoned lock from a dead process is diagnosed and can be cleared with clear-lock', t => {
  const root = makeProtocolFixture(t);
  const lockFile = path.join(root, '.ai/runtime/shared-writer.json');
  fs.mkdirSync(path.join(root, '.ai/runtime'), { recursive: true });
  fs.writeFileSync(lockFile, JSON.stringify({
    owner: 'dead-agent',
    acquiredAt: new Date().toISOString(),
    pid: 999999,
    hostname: require('node:os').hostname(),
    worklog: '.ai/worklog/dead-agent.md',
  }, null, 2) + '\n');

  const blocked = invoke(root, 'acquire', 'new-agent');
  assert.notEqual(blocked.status, 0);
  assert.match(blocked.stderr, /process is no longer running/);
  assert.match(blocked.stderr, /clear-lock/);

  const status = JSON.parse(invoke(root, 'status').stdout);
  assert.equal(status.lock.alive, false);

  const cleared = invoke(root, 'clear-lock');
  assert.equal(cleared.status, 0, cleared.stderr);
  assert.equal(JSON.parse(cleared.stdout).cleared, true);

  const nowAcquired = invoke(root, 'acquire', 'new-agent');
  assert.equal(nowAcquired.status, 0, nowAcquired.stderr);
});

test('a lock held by a live process cannot be cleared with clear-lock', t => {
  const root = makeProtocolFixture(t);
  const lockFile = path.join(root, '.ai/runtime/shared-writer.json');
  fs.mkdirSync(path.join(root, '.ai/runtime'), { recursive: true });
  fs.writeFileSync(lockFile, JSON.stringify({
    owner: 'live-agent',
    acquiredAt: new Date().toISOString(),
    pid: process.pid,
    hostname: require('node:os').hostname(),
    worklog: '.ai/worklog/live-agent.md',
  }, null, 2) + '\n');

  const refused = invoke(root, 'clear-lock');
  assert.notEqual(refused.status, 0);
  assert.match(refused.stderr, /still holds the lock/);
});

test('acquire with --force recovers an abandoned lock from a dead process', t => {
  const root = makeProtocolFixture(t);
  const lockFile = path.join(root, '.ai/runtime/shared-writer.json');
  fs.mkdirSync(path.join(root, '.ai/runtime'), { recursive: true });
  fs.writeFileSync(lockFile, JSON.stringify({
    owner: 'dead-agent',
    acquiredAt: new Date().toISOString(),
    pid: 999999,
    hostname: require('node:os').hostname(),
    worklog: '.ai/worklog/dead-agent.md',
  }, null, 2) + '\n');

  const recovered = run(process.execPath, [path.join(root, '.ai/bin/protocol-lock.cjs'),
    'acquire', '--owner', 'new-agent', '--force'], root);
  assert.equal(recovered.status, 0, recovered.stderr);
  assert.equal(JSON.parse(recovered.stdout).owner, 'new-agent');
});

test('acquire with --force refuses to steal a lock held by a live process', t => {
  const root = makeProtocolFixture(t);
  const lockFile = path.join(root, '.ai/runtime/shared-writer.json');
  fs.mkdirSync(path.join(root, '.ai/runtime'), { recursive: true });
  fs.writeFileSync(lockFile, JSON.stringify({
    owner: 'live-agent',
    acquiredAt: new Date().toISOString(),
    pid: process.pid,
    hostname: require('node:os').hostname(),
    worklog: '.ai/worklog/live-agent.md',
  }, null, 2) + '\n');

  const refused = run(process.execPath, [path.join(root, '.ai/bin/protocol-lock.cjs'),
    'acquire', '--owner', 'thief-agent', '--force'], root);
  assert.notEqual(refused.status, 0);
  assert.match(refused.stderr, /do not overwrite or automatically steal the lock/);
});

test('--session-pid accepts a live supervisor process and rejects a dead or invalid PID', t => {
  const root = makeProtocolFixture(t);
  const success = run(process.execPath, [path.join(root, '.ai/bin/protocol-lock.cjs'),
    'acquire', '--owner', 'supervisor-agent', '--session-pid', String(process.pid)], root);
  assert.equal(success.status, 0, success.stderr);
  const lockData = JSON.parse(fs.readFileSync(path.join(root, '.ai/runtime/shared-writer.json'), 'utf8'));
  assert.equal(lockData.sessionPid, process.pid);
  assert.equal(typeof lockData.pid, 'number');

  const deadPid = 2147483640;
  const dead = run(process.execPath, [path.join(root, '.ai/bin/protocol-lock.cjs'),
    'acquire', '--owner', 'dead-check', '--session-pid', String(deadPid)], root);
  assert.notEqual(dead.status, 0);
  assert.match(dead.stderr, /target process is not running/);

  const invalid = run(process.execPath, [path.join(root, '.ai/bin/protocol-lock.cjs'),
    'acquire', '--owner', 'invalid-check', '--session-pid', '-1'], root);
  assert.notEqual(invalid.status, 0);
  assert.match(invalid.stderr, /must be a positive integer/);
});

test('--session-pid rejects pid <= 4', t => {
  const root = makeProtocolFixture(t);
  const p4 = run(process.execPath, [path.join(root, '.ai/bin/protocol-lock.cjs'),
    'acquire', '--owner', 'pid4-check', '--session-pid', '4'], root);
  assert.notEqual(p4.status, 0);
  assert.match(p4.stderr, /must be a positive integer > 4/);

  const p1 = run(process.execPath, [path.join(root, '.ai/bin/protocol-lock.cjs'),
    'acquire', '--owner', 'pid1-check', '--session-pid', '1'], root);
  assert.notEqual(p1.status, 0);
  assert.match(p1.stderr, /must be a positive integer > 4/);
});

test('--session-pid rejects unrelated live PID without token', t => {
  const root = makeProtocolFixture(t);
  const child = spawn(process.execPath, ['-e', 'setInterval(() => {}, 10000)'], {
    stdio: 'ignore', windowsHide: true,
  });
  t.after(() => { try { child.kill(); } catch {} });

  const refused = run(process.execPath, [path.join(root, '.ai/bin/protocol-lock.cjs'),
    'acquire', '--owner', 'unrelated-agent', '--session-pid', String(child.pid)], root);
  assert.notEqual(refused.status, 0);
  assert.match(refused.stderr, /not bound to this session/);
});

test('--session-pid accepts own PID and parent PPID', t => {
  const root = makeProtocolFixture(t);
  // Parent PPID (process.pid from perspective of child):
  const ppidRun = run(process.execPath, [path.join(root, '.ai/bin/protocol-lock.cjs'),
    'acquire', '--owner', 'ppid-agent', '--session-pid', String(process.pid)], root);
  assert.equal(ppidRun.status, 0, ppidRun.stderr);
  let lockData = JSON.parse(fs.readFileSync(path.join(root, '.ai/runtime/shared-writer.json'), 'utf8'));
  assert.equal(lockData.sessionPid, process.pid);
  assert.equal(typeof lockData.pid, 'number');
  assert.equal(run(process.execPath, [path.join(root, '.ai/bin/protocol-lock.cjs'),
    'release', '--owner', 'ppid-agent'], root).status, 0);

  // Own PID (child passes its own PID):
  const script = `
    const { operate } = require('./.ai/bin/protocol-lock.cjs');
    const res = operate(process.cwd(), 'acquire', 'own-agent', { sessionPid: process.pid });
    process.stdout.write(JSON.stringify(res));
  `;
  const ownRun = run(process.execPath, ['-e', script], root);
  assert.equal(ownRun.status, 0, ownRun.stderr);
  lockData = JSON.parse(fs.readFileSync(path.join(root, '.ai/runtime/shared-writer.json'), 'utf8'));
  assert.equal(lockData.sessionPid, lockData.pid);
  assert.equal(run(process.execPath, [path.join(root, '.ai/bin/protocol-lock.cjs'),
    'release', '--owner', 'own-agent'], root).status, 0);
});

test('--session-pid accepts registered PID with correct token and rejects wrong token', t => {
  const root = makeProtocolFixture(t);
  const supervisor = spawn(process.execPath, ['-e', 'setInterval(() => {}, 10000)'], {
    stdio: 'ignore', windowsHide: true,
  });
  t.after(() => { try { supervisor.kill(); } catch {} });

  const nonce = 'session-token-secret-12345';
  fs.mkdirSync(path.join(root, '.ai/runtime'), { recursive: true });
  fs.writeFileSync(path.join(root, '.ai/runtime/registered-agent.json'), JSON.stringify({
    version: 1,
    pid: supervisor.pid,
    hostname: os.hostname(),
    startTime: Date.now(),
    nonce,
    files: {},
    entryHash: null,
  }) + '\n');

  // Wrong token fails:
  const wrong = run(process.execPath, [path.join(root, '.ai/bin/protocol-lock.cjs'),
    'acquire', '--owner', 'registered-agent', '--session-pid', String(supervisor.pid),
    '--session-token', 'wrong-token'], root);
  assert.notEqual(wrong.status, 0);
  assert.match(wrong.stderr, /token does not match/);

  // Correct token succeeds:
  const ok = run(process.execPath, [path.join(root, '.ai/bin/protocol-lock.cjs'),
    'acquire', '--owner', 'registered-agent', '--session-pid', String(supervisor.pid),
    '--session-token', nonce], root);
  assert.equal(ok.status, 0, ok.stderr);

  const lockData = JSON.parse(fs.readFileSync(path.join(root, '.ai/runtime/shared-writer.json'), 'utf8'));
  assert.equal(lockData.sessionPid, supervisor.pid);
  const expectedHash = crypto.createHash('sha256').update(nonce).digest('hex');
  assert.equal(lockData.tokenHash, expectedHash);
  assert.equal(lockData.sessionToken, undefined, 'raw token must never be stored in lock');
  assert.equal(lockData.token, undefined, 'raw token must never be stored in lock');

  const status = JSON.parse(invoke(root, 'status').stdout);
  assert.equal(status.lock.liveness, 'registered');
  assert.equal(status.lock.alive, true);
});

test('foreign host lock has unknown liveness and is preserved against unforced clear', t => {
  const root = makeProtocolFixture(t);
  const lockFile = path.join(root, '.ai/runtime/shared-writer.json');
  fs.mkdirSync(path.join(root, '.ai/runtime'), { recursive: true });
  fs.writeFileSync(lockFile, JSON.stringify({
    owner: 'foreign-agent',
    acquiredAt: new Date().toISOString(),
    pid: 12345,
    sessionPid: 12345,
    hostname: 'foreign-host-99',
    worklog: '.ai/worklog/foreign-agent.md',
  }, null, 2) + '\n');

  const status = JSON.parse(invoke(root, 'status').stdout);
  assert.equal(status.lock.alive, null);
  assert.equal(status.lock.liveness, 'cooperative');

  const refused = invoke(root, 'clear-lock');
  assert.notEqual(refused.status, 0);
  assert.match(refused.stderr, /Cannot tell whether the lock owner is alive/);
  assert.equal(fs.existsSync(lockFile), true);

  const cleared = run(process.execPath, [path.join(root, '.ai/bin/protocol-lock.cjs'),
    'clear-lock', '--force'], root);
  assert.equal(cleared.status, 0, cleared.stderr);
  assert.equal(fs.existsSync(lockFile), false);
});

test('live registered lock requires --force and --reason to clear', t => {
  const root = makeProtocolFixture(t);
  const supervisor = spawn(process.execPath, ['-e', 'setInterval(() => {}, 10000)'], {
    stdio: 'ignore', windowsHide: true,
  });
  t.after(() => { try { supervisor.kill(); } catch {} });

  const nonce = 'super-secret-token-abcdef';
  fs.mkdirSync(path.join(root, '.ai/runtime'), { recursive: true });
  fs.writeFileSync(path.join(root, '.ai/runtime/live-reg.json'), JSON.stringify({
    version: 1,
    pid: supervisor.pid,
    hostname: os.hostname(),
    startTime: Date.now(),
    nonce,
    files: {},
    entryHash: null,
  }) + '\n');

  const ok = run(process.execPath, [path.join(root, '.ai/bin/protocol-lock.cjs'),
    'acquire', '--owner', 'live-reg', '--session-pid', String(supervisor.pid),
    '--session-token', nonce], root);
  assert.equal(ok.status, 0, ok.stderr);

  // clear-lock without force: refused
  const refused = invoke(root, 'clear-lock');
  assert.notEqual(refused.status, 0);
  assert.match(refused.stderr, /still holds the registered lock/);

  // clear-lock with force but no reason: refused
  const noReason = run(process.execPath, [path.join(root, '.ai/bin/protocol-lock.cjs'),
    'clear-lock', '--force'], root);
  assert.notEqual(noReason.status, 0);
  assert.match(noReason.stderr, /requires --force and --reason/);

  // clear-lock with force and reason: succeeds with audit warning on stderr
  const cleared = run(process.execPath, [path.join(root, '.ai/bin/protocol-lock.cjs'),
    'clear-lock', '--force', '--reason', 'Emergency supervisor restart'], root);
  assert.equal(cleared.status, 0, cleared.stderr);
  assert.match(cleared.stderr, /\[AUDIT WARN\] Forcefully clearing live registered lock held by live-reg/);
  assert.equal(JSON.parse(cleared.stdout).cleared, true);
});

test('status reports liveness cooperative when tokenHash is missing', t => {
  const root = makeProtocolFixture(t);
  invoke(root, 'acquire', 'coop-agent');
  const status = JSON.parse(invoke(root, 'status').stdout);
  assert.equal(status.lock.liveness, 'cooperative');
  assert.equal(status.lock.tokenHash, null);
  invoke(root, 'release', 'coop-agent');
});

test('CLI-held lock is preserved and autoArchiveWorklog does not steal it', t => {
  const root = makeProtocolFixture(t);
  const acquired = invoke(root, 'acquire', 'live-session-a');
  assert.equal(acquired.status, 0, acquired.stderr);

  const bWorklog = path.join(root, '.ai/worklog/session-b.md');
  const longContent = '# Worklog: session-b\n\n' + Array.from({ length: 160 }, (_, i) => `line ${i}`).join('\n') + '\n';
  fs.writeFileSync(bWorklog, longContent, 'utf8');

  const archiveModule = require(path.join(root, '.ai/bin/protocol-archive.cjs'));
  archiveModule.autoArchiveWorklog(root, bWorklog, 150, 1, 'session-b');

  const status = JSON.parse(invoke(root, 'status').stdout);
  assert.equal(status.lock.owner, 'live-session-a');
  assert.equal(invoke(root, 'release', 'live-session-a').status, 0);
});

test('real CLI supervisor registration flow without manual state injection', async t => {
  const root = makeProtocolFixture(t);

  const supervisorScript = `
    const { spawnSync } = require('child_process');
    const path = require('path');
    const root = ${JSON.stringify(root)};
    const sessionBin = path.join(root, '.ai/bin/protocol-session.cjs');
    const res = spawnSync(process.execPath, [
      sessionBin, 'start',
      '--agent', 'qwen', '--session', 'real-sup-sess',
      '--supervisor-pid', String(process.pid),
      '--root', root
    ], { encoding: 'utf8' });
    if (res.status !== 0) {
      process.stderr.write(res.stderr || 'start failed');
      process.exit(1);
    }
    process.stdout.write(res.stdout);
    setInterval(() => {}, 10000);
  `;

  const supervisor = spawn(process.execPath, ['-e', supervisorScript], {
    windowsHide: true,
  });
  t.after(() => { try { supervisor.kill(); } catch {} });

  const startOutput = await new Promise((resolve, reject) => {
    let out = '';
    supervisor.stdout.on('data', chunk => {
      out += chunk.toString('utf8');
      if (out.includes('Journal:')) resolve(out);
    });
    supervisor.stderr.on('data', chunk => {
      process.stderr.write(chunk.toString('utf8'));
    });
    supervisor.on('error', reject);
    supervisor.on('exit', code => {
      if (code !== 0) reject(new Error(`Supervisor exited with code ${code}`));
    });
  });

  assert.match(startOutput, /Session token: [a-f0-9]{64}/);
  const token = startOutput.match(/Session token: ([a-f0-9]{64})/)[1];
  const owner = startOutput.match(/Owner name for the lock and for evidence: (\S+)/)[1];

  const acq = run(process.execPath, [
    path.join(root, '.ai/bin/protocol-lock.cjs'), 'acquire',
    '--owner', owner,
    '--session-pid', String(supervisor.pid),
    '--session-token', token,
    '--root', root,
  ], root);
  assert.equal(acq.status, 0, acq.stderr);

  const lockData = JSON.parse(fs.readFileSync(path.join(root, '.ai/runtime/shared-writer.json'), 'utf8'));
  assert.equal(lockData.sessionPid, supervisor.pid);
  assert.equal(lockData.tokenHash, crypto.createHash('sha256').update(token).digest('hex'));
  assert.equal(lockData.sessionToken, undefined, 'raw token must never be written to lock file');

  const refused = run(process.execPath, [
    path.join(root, '.ai/bin/protocol-lock.cjs'), 'clear-lock',
    '--root', root,
  ], root);
  assert.notEqual(refused.status, 0);
  assert.match(refused.stderr, /still holds the registered lock/);

  const cleared = run(process.execPath, [
    path.join(root, '.ai/bin/protocol-lock.cjs'), 'clear-lock',
    '--force', '--reason', 'Supervisor terminated by test runner',
    '--root', root,
  ], root);
  assert.equal(cleared.status, 0, cleared.stderr);
  assert.match(cleared.stderr, /\[AUDIT WARN\] Forcefully clearing live registered lock/);
  assert.equal(JSON.parse(cleared.stdout).cleared, true);

  supervisor.kill();
  await new Promise(resolve => {
    supervisor.on('exit', resolve);
    setTimeout(resolve, 500);
  });
});


