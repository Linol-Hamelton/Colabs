'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { spawnSync } = require('node:child_process');

const dispatch = require('../.ai/bin/protocol-dispatch.cjs');

const DISPATCH_BIN = path.resolve(__dirname, '..', '.ai', 'bin', 'protocol-dispatch.cjs');
const REAL_DISPATCH = path.resolve(__dirname, '..', 'docs', 'research', '2026-09-26-ownerideas-revision', 'prompts', 'DISPATCH.json');
const R3_DISPATCH = path.resolve(__dirname, 'fixtures', 'dispatch', 'R3-DISPATCH.json');
const FAKE_CLIENT = path.resolve(__dirname, 'dispatch-fake-client.cjs');

const runBin = (args, cwd = path.resolve(__dirname, '..')) => {
  const r = spawnSync(process.execPath, [DISPATCH_BIN, ...args], {
    cwd,
    encoding: 'utf8',
    windowsHide: true
  });
  return {
    code: r.status === null ? -1 : r.status,
    stdout: r.stdout || '',
    stderr: r.stderr || ''
  };
};

test('T1: no arguments exits 2 with USAGE row', () => {
  const r = runBin([]);
  assert.equal(r.code, 2);
  assert.match(r.stdout, /^USAGE /m);
});

test('T2: unknown command or flag exits 2 with ERROR row', () => {
  const r1 = runBin(['unknown-cmd']);
  assert.equal(r1.code, 2);
  assert.match(r1.stdout, /^ERROR reason=unknown-command/m);

  const r2 = runBin(['probe', '--unknown-flag']);
  assert.equal(r2.code, 2);
  assert.match(r2.stdout, /^ERROR reason=unknown-flag/m);
});

test('T3: registry loader validation', () => {
  // Committed registry loads cleanly
  const reg = dispatch.loadRegistry();
  assert.equal(reg.schema, 'clients/1');
  assert.ok(reg.clients.claude);

  // Unknown top-level key exits 2
  assert.throws(() => dispatch.validateRegistry({ schema: 'clients/1', clients: {}, extra: 1 }));

  // Missing required key in client
  assert.throws(() => dispatch.validateRegistry({ schema: 'clients/1', clients: { fake: { binary: 'x' } } }));

  // Wrong type for present
  assert.throws(() => dispatch.validateRegistry({
    schema: 'clients/1',
    clients: {
      fake: {
        binary: 'fake', present: 'yes', version: '1', verifiedOn: '2026-09-26', source: 's',
        command: [], model: {}, effort: {}, env: {}, resume: {}, usage: 'none', failureModes: []
      }
    }
  }));
});

test('T4: dispatch loader validation', () => {
  // Unknown top-level key
  assert.throws(() => dispatch.validateDispatch({ unknown: 123 }));

  // Unsafe paths
  assert.throws(() => dispatch.validateDispatch({ slots: [{ id: 's1', launch: '../unsafe.md' }] }));
  assert.throws(() => dispatch.validateDispatch({ slots: [{ id: 's1', launch: 'C:/abs.md' }] }));
  assert.throws(() => dispatch.validateDispatch({ slots: [{ id: 's1', launch: 'foo"bar.md' }] }));

  // stallMin / hardMin out of range
  assert.throws(() => dispatch.validateDispatch({ stallMin: 2, slots: [{ id: 's1', launch: 'valid.md' }] }));
  assert.throws(() => dispatch.validateDispatch({ stallMin: 150, slots: [{ id: 's1', launch: 'valid.md' }] }));
  assert.throws(() => dispatch.validateDispatch({ hardMin: 5, slots: [{ id: 's1', launch: 'valid.md' }] }));
  assert.throws(() => dispatch.validateDispatch({ hardMin: 800, slots: [{ id: 's1', launch: 'valid.md' }] }));

  // Missing launch file exits 1 on check
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'disp-test-'));
  const dispPath = path.join(tmp, 'disp.json');
  fs.writeFileSync(dispPath, JSON.stringify({
    slots: [{ id: 's1', launch: 'missing-launch-file.md', route: { client: 'agy', model: 'gemini-3.8-flash' } }]
  }), 'utf8');

  const r = runBin(['check', dispPath]);
  assert.equal(r.code, 1);
  assert.match(r.stdout, /^ERROR reason=launch-missing slot=s1 path=missing-launch-file\.md/m);
  fs.rmSync(tmp, { recursive: true, force: true });
});

test('T5: check parity: DISPATCH.json exits 0, R3-DISPATCH.json exits 1 with 10 launch-missing rows', () => {
  const r1 = runBin(['check', REAL_DISPATCH]);
  assert.equal(r1.code, 0);
  assert.match(r1.stdout, /^CHECK dispatch=.* slots=23/m);

  const r2 = runBin(['check', R3_DISPATCH]);
  assert.equal(r2.code, 1);
  assert.match(r2.stdout, /^CHECK dispatch=.* slots=10/m);
  const missingRows = r2.stdout.trim().split(/\r?\n/).filter(l => l.startsWith('ERROR reason=launch-missing'));
  assert.equal(missingRows.length, 10);
  assert.ok(!r2.stdout.includes('ERROR reason=unknown-'));
});

test('T6: end-to-end run with fake client in work mode', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'disp-e2e-'));
  const launchFile = 'tests/fixtures/dispatch/fake-launch.md';
  const repoRoot = path.resolve(__dirname, '..');
  const outFile = 'tests/fixtures/dispatch/out1.txt';

  fs.mkdirSync(path.dirname(path.resolve(repoRoot, launchFile)), { recursive: true });
  fs.writeFileSync(path.resolve(repoRoot, launchFile), '# Fake launch prompt\n', 'utf8');

  const fakeRegPath = path.join(tmp, 'clients.json');
  fs.writeFileSync(fakeRegPath, JSON.stringify({
    schema: 'clients/1',
    clients: {
      fake: {
        binary: 'node',
        present: true,
        version: 'fake-v1',
        verifiedOn: '2026-09-26',
        source: 'node --version',
        command: ['node', FAKE_CLIENT, 'work', '{workdir}', '{workdir}'],
        model: { how: 'none', listing: null },
        effort: { how: 'none', values: null, note: null },
        env: {},
        resume: { command: null, sessionId: null, note: 'none' },
        usage: 'none',
        failureModes: []
      }
    }
  }), 'utf8');

  const dispPath = path.join(tmp, 'disp.json');
  fs.writeFileSync(dispPath, JSON.stringify({
    stateDir: path.relative(repoRoot, path.join(tmp, 'state')).replace(/\\/g, '/'),
    usageFile: path.relative(repoRoot, path.join(tmp, 'usage.md')).replace(/\\/g, '/'),
    stallMin: 10,
    hardMin: 60,
    slots: [
      {
        id: 'fake-slot',
        launch: launchFile,
        out: outFile,
        route: { client: 'fake', model: 'test' }
      }
    ]
  }), 'utf8');

  // Probe level 0 test with fake client
  const probeR = runBin(['probe', '--registry', fakeRegPath, 'fake']);
  assert.equal(probeR.code, 1); // version mismatch because node --version != fake-v1
  assert.match(probeR.stdout, /^PROBE client=fake state=VERSION_CHANGED/m);

  // Update fake registry with actual node version
  const nodeVer = process.version;
  const regObj = JSON.parse(fs.readFileSync(fakeRegPath, 'utf8'));
  regObj.clients.fake.version = nodeVer;
  fs.writeFileSync(fakeRegPath, JSON.stringify(regObj), 'utf8');

  const probeR2 = runBin(['probe', '--registry', fakeRegPath, 'fake']);
  assert.equal(probeR2.code, 0);
  assert.match(probeR2.stdout, /^PROBE client=fake state=OK/m);

  const r = runBin(['run', dispPath, '--registry', fakeRegPath]);
  assert.equal(r.code, 0);
  assert.match(r.stdout, /^DONE slot=fake-slot/m);

  // Declared output must exist in repoRoot
  assert.ok(fs.existsSync(path.resolve(repoRoot, outFile)));
  // Journal must have been imported into repoRoot .ai/worklog
  const journalPath = path.resolve(repoRoot, '.ai/worklog/gemini-0123456789abcdef.md');
  assert.ok(fs.existsSync(journalPath));

  // Cleanup imported test artifacts
  try { fs.unlinkSync(path.resolve(repoRoot, outFile)); } catch {}
  try { fs.unlinkSync(journalPath); } catch {}
  try { fs.unlinkSync(path.resolve(repoRoot, launchFile)); } catch {}
  fs.rmSync(tmp, { recursive: true, force: true });
});

test('T7-T10: policy and scope violations end in BLOCKED with clone kept', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'disp-viol-'));
  const launchFile = 'tests/fixtures/dispatch/viol-launch.md';
  const repoRoot = path.resolve(__dirname, '..');
  const outFile = 'tests/fixtures/dispatch/out1.txt';

  fs.mkdirSync(path.dirname(path.resolve(repoRoot, launchFile)), { recursive: true });
  fs.writeFileSync(path.resolve(repoRoot, launchFile), '# Viol launch prompt\n', 'utf8');

  const testViolationMode = (vMode) => {
    const fakeRegPath = path.join(tmp, `clients-${vMode}.json`);
    fs.writeFileSync(fakeRegPath, JSON.stringify({
      schema: 'clients/1',
      clients: {
        fake: {
          binary: 'node',
          present: true,
          version: process.version,
          verifiedOn: '2026-09-26',
          source: 'node --version',
          command: ['node', FAKE_CLIENT, vMode, '{workdir}', '{workdir}'],
          model: { how: 'none', listing: null },
          effort: { how: 'none', values: null, note: null },
          env: {},
          resume: { command: null, sessionId: null, note: 'none' },
          usage: 'none',
          failureModes: []
        }
      }
    }), 'utf8');

    const dispPath = path.join(tmp, `disp-${vMode}.json`);
    fs.writeFileSync(dispPath, JSON.stringify({
      stateDir: path.relative(repoRoot, path.join(tmp, `state-${vMode}`)).replace(/\\/g, '/'),
      slots: [{ id: `viol-${vMode}`, launch: launchFile, out: outFile, route: { client: 'fake', model: 'test' } }]
    }), 'utf8');

    const r = runBin(['run', dispPath, '--registry', fakeRegPath]);
    assert.equal(r.code, 1);
    assert.match(r.stdout, /^BLOCKED slot=viol-/m);

    // Forbidden file must NOT have been copied back
    assert.ok(!fs.existsSync(path.resolve(repoRoot, 'forbidden-escape.txt')));
  };

  testViolationMode('write-escape'); // T7
  testViolationMode('commit-escape'); // T8
  testViolationMode('remote-escape'); // T9

  try { fs.unlinkSync(path.resolve(repoRoot, launchFile)); } catch {}
  fs.rmSync(tmp, { recursive: true, force: true });
});

test('T11: credential canaries absent from child env, GIT_CONFIG_NOSYSTEM=1 present', () => {
  const canaryParent = {
    ...process.env,
    GH_TOKEN: 'canary-gh',
    GITHUB_TOKEN: 'canary-github',
    X_GIT_TOKEN: 'canary-x-git',
    SSH_AUTH_SOCK: 'canary-sock',
    CUSTOM_VAR: 'preserved'
  };

  const childEnv = dispatch.executorEnv(canaryParent);
  assert.equal(childEnv.GH_TOKEN, undefined);
  assert.equal(childEnv.GITHUB_TOKEN, undefined);
  assert.equal(childEnv.X_GIT_TOKEN, undefined);
  assert.equal(childEnv.SSH_AUTH_SOCK, undefined);
  assert.equal(childEnv.GIT_CONFIG_NOSYSTEM, '1');
  assert.equal(childEnv.CUSTOM_VAR, 'preserved');
});

test('T12, T13: STALL at --stall-seconds and TIMEOUT at --hard-seconds', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'disp-timeout-'));
  const launchFile = 'tests/fixtures/dispatch/hang-launch.md';
  const repoRoot = path.resolve(__dirname, '..');
  const outFile = 'tests/fixtures/dispatch/out1.txt';

  fs.mkdirSync(path.dirname(path.resolve(repoRoot, launchFile)), { recursive: true });
  fs.writeFileSync(path.resolve(repoRoot, launchFile), '# Hang launch\n', 'utf8');

  const runTimedMode = (tMode, flag, sec) => {
    const fakeRegPath = path.join(tmp, `clients-${tMode}.json`);
    fs.writeFileSync(fakeRegPath, JSON.stringify({
      schema: 'clients/1',
      clients: {
        fake: {
          binary: 'node',
          present: true,
          version: process.version,
          verifiedOn: '2026-09-26',
          source: 'node --version',
          command: ['node', FAKE_CLIENT, tMode, '{workdir}', '{workdir}'],
          model: { how: 'none', listing: null },
          effort: { how: 'none', values: null, note: null },
          env: {},
          resume: { command: null, sessionId: null, note: 'none' },
          usage: 'none',
          failureModes: []
        }
      }
    }), 'utf8');

    const dispPath = path.join(tmp, `disp-${tMode}.json`);
    fs.writeFileSync(dispPath, JSON.stringify({
      stateDir: path.relative(repoRoot, path.join(tmp, `state-${tMode}`)).replace(/\\/g, '/'),
      slots: [{ id: `timed-${tMode}`, launch: launchFile, out: outFile, route: { client: 'fake', model: 'test' } }]
    }), 'utf8');

    const r = runBin(['run', dispPath, '--registry', fakeRegPath, flag, String(sec)]);
    assert.equal(r.code, 1);
    return r;
  };

  const rStall = runTimedMode('silent', '--stall-seconds', 1);
  assert.match(rStall.stdout, /^FAILED slot=timed-silent class=STALL/m);

  const rTimeout = runTimedMode('always-talking', '--hard-seconds', 2);
  assert.match(rTimeout.stdout, /^FAILED slot=timed-always-talking class=TIMEOUT/m);

  try { fs.unlinkSync(path.resolve(repoRoot, launchFile)); } catch {}
  fs.rmSync(tmp, { recursive: true, force: true });
});

test('T14: failure classification and bare-number guards', () => {
  // Each S6 class is recognized from matching samples
  assert.equal(dispatch.classifyErrorText('HTTP 401 Unauthorized'), 'AUTH_ERROR');
  assert.equal(dispatch.classifyErrorText('status 403 Forbidden: authentication failed'), 'AUTH_ERROR');
  assert.equal(dispatch.classifyErrorText('HTTP 429 Too Many Requests: rate limit exceeded'), 'RATE_LIMIT');
  assert.equal(dispatch.classifyErrorText('quota exceeded for current billing period; RESOURCE_EXHAUSTED'), 'QUOTA_EXHAUSTED');
  assert.equal(dispatch.classifyErrorText('model gpt-5.9 not found on server'), 'MODEL_UNAVAILABLE');
  assert.equal(dispatch.classifyErrorText('FetchError: ECONNRESET network error'), 'NETWORK_ERROR');
  assert.equal(dispatch.classifyErrorText('HTTP 503 Service Unavailable: overloaded_error'), 'PROVIDER_ERROR');

  // Bare-number guards: "line 503" and "429 tokens" must NOT match!
  assert.equal(dispatch.classifyErrorText('Compilation error at line 503 in main.rs'), null);
  assert.equal(dispatch.classifyErrorText('Prompt processed: 429 tokens used successfully'), null);
});

test('T15: needs and when skipping rules', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'disp-when-'));
  const launchFile = 'tests/fixtures/dispatch/when-launch.md';
  const repoRoot = path.resolve(__dirname, '..');
  fs.mkdirSync(path.dirname(path.resolve(repoRoot, launchFile)), { recursive: true });
  fs.writeFileSync(path.resolve(repoRoot, launchFile), '# When launch\n', 'utf8');

  const checkFile = path.resolve(repoRoot, 'tests', 'fixtures', 'dispatch', 'flag.txt');
  fs.writeFileSync(checkFile, 'DONE_ALREADY', 'utf8');

  const dispPath = path.join(tmp, 'disp-when.json');
  fs.writeFileSync(dispPath, JSON.stringify({
    stateDir: path.relative(repoRoot, path.join(tmp, 'state')).replace(/\\/g, '/'),
    slots: [
      {
        id: 's-skipped',
        launch: launchFile,
        when: {
          file: 'tests/fixtures/dispatch/flag.txt',
          notMatch: 'DONE_ALREADY'
        },
        route: { client: 'agy', model: 'gemini-3.8-flash' }
      },
      {
        id: 's-waiting',
        launch: launchFile,
        needs: ['s-unmet-dep'],
        route: { client: 'agy', model: 'gemini-3.8-flash' }
      }
    ]
  }), 'utf8');

  const r = runBin(['run', dispPath]);
  assert.match(r.stdout, /^SKIP slot=s-skipped reason=when-matched/m);
  assert.match(r.stdout, /^WAIT slot=s-waiting reason=needs/m);

  try { fs.unlinkSync(checkFile); } catch {}
  try { fs.unlinkSync(path.resolve(repoRoot, launchFile)); } catch {}
  fs.rmSync(tmp, { recursive: true, force: true });
});

test('T16: second run of live slot exits 1 due to start lock', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'disp-lock-'));
  const acquired = dispatch.takeStartLock('lock-slot', tmp);
  assert.equal(acquired, true);

  // Second acquisition while lock held
  const second = dispatch.takeStartLock('lock-slot', tmp);
  assert.equal(second, false);

  dispatch.releaseStartLock('lock-slot', tmp);
  const third = dispatch.takeStartLock('lock-slot', tmp);
  assert.equal(third, true);

  dispatch.releaseStartLock('lock-slot', tmp);
  fs.rmSync(tmp, { recursive: true, force: true });
});

test('T17: probe command output and exits', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'disp-probe-'));
  const fakeRegPath = path.join(tmp, 'clients.json');
  fs.writeFileSync(fakeRegPath, JSON.stringify({
    schema: 'clients/1',
    clients: {
      c_ok: {
        binary: 'node',
        present: true,
        version: process.version,
        verifiedOn: '2026-09-26',
        source: 'node --version',
        command: ['node'],
        model: { how: 'none', listing: null },
        effort: { how: 'none', values: null, note: null },
        env: {},
        resume: { command: null, sessionId: null, note: 'none' },
        usage: 'none',
        failureModes: []
      },
      c_absent: {
        binary: 'nonexistent_bin_123456789',
        present: true,
        version: '1.0',
        verifiedOn: '2026-09-26',
        source: 's',
        command: ['nonexistent_bin_123456789'],
        model: { how: 'none', listing: null },
        effort: { how: 'none', values: null, note: null },
        env: {},
        resume: { command: null, sessionId: null, note: 'none' },
        usage: 'none',
        failureModes: []
      },
      c_changed: {
        binary: 'node',
        present: true,
        version: 'wrong-version-999',
        verifiedOn: '2026-09-26',
        source: 's',
        command: ['node'],
        model: { how: 'none', listing: null },
        effort: { how: 'none', values: null, note: null },
        env: {},
        resume: { command: null, sessionId: null, note: 'none' },
        usage: 'none',
        failureModes: []
      }
    }
  }), 'utf8');

  const rOk = runBin(['probe', '--registry', fakeRegPath, 'c_ok']);
  assert.equal(rOk.code, 0);
  assert.match(rOk.stdout, /^PROBE client=c_ok state=OK/m);

  const rAbsent = runBin(['probe', '--registry', fakeRegPath, 'c_absent']);
  assert.equal(rAbsent.code, 1);
  assert.match(rAbsent.stdout, /^PROBE client=c_absent state=ABSENT/m);

  const rChanged = runBin(['probe', '--registry', fakeRegPath, 'c_changed']);
  assert.equal(rChanged.code, 1);
  assert.match(rChanged.stdout, /^PROBE client=c_changed state=VERSION_CHANGED/m);

  fs.rmSync(tmp, { recursive: true, force: true });
});

test('T18: every stdout line matches uppercase token format', () => {
  const outputs = [
    runBin([]).stdout,
    runBin(['unknown-cmd']).stdout,
    runBin(['probe', '--unknown-flag']).stdout,
    runBin(['check', REAL_DISPATCH]).stdout,
    runBin(['check', R3_DISPATCH]).stdout
  ];

  for (const text of outputs) {
    const lines = text.trim().split(/\r?\n/).filter(Boolean);
    for (const line of lines) {
      assert.match(line, /^[A-Z][A-Z_]*( |$)/, `line does not match TOKEN format: "${line}"`);
    }
  }
});

test('T19: script source contains no docs/research/ path, no prompt text, and pointer template exactly once', () => {
  const code = fs.readFileSync(DISPATCH_BIN, 'utf8');
  assert.ok(!code.includes('docs/research/'), 'source must not contain docs/research/');
  const matches = code.match(/Read and follow the file /g) || [];
  assert.equal(matches.length, 1, 'pointer template must appear exactly once');
});
