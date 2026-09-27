'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { spawnSync } = require('node:child_process');

const dispatch = require('../.ai/bin/protocol-dispatch.cjs');
const runrecord = require('../.ai/bin/protocol-runrecord.cjs');

const repoRoot = path.resolve(__dirname, '..');
const DISPATCH_BIN = path.resolve(repoRoot, '.ai', 'bin', 'protocol-dispatch.cjs');
const REAL_DISPATCH = path.resolve(repoRoot, 'tests', 'fixtures', 'prompts', 'DISPATCH.json');
const R3_DISPATCH = path.resolve(__dirname, 'fixtures', 'dispatch', 'R3-DISPATCH.json');
const FAKE_CLIENT = path.resolve(__dirname, 'dispatch-fake-client.cjs');

const TEST_TMP_DIR = path.join('.ai', 'runtime', 'dispatch-test');
const testTmpAbs = path.resolve(repoRoot, TEST_TMP_DIR);
fs.mkdirSync(testTmpAbs, { recursive: true });
const DEFAULT_OUT_FILE = path.join(TEST_TMP_DIR, 'out1.txt').replace(/\\/g, '/');
process.env.TEST_DISPATCH_OUT_FILE = DEFAULT_OUT_FILE;

const TEST_SUITE_TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'disp-suite-'));
const DEFAULT_TEST_RUNS = path.join(TEST_SUITE_TMP, 'RUNS.jsonl');
const DEFAULT_TEST_SIGNALS = path.join(TEST_SUITE_TMP, 'SIGNALS.md');
fs.writeFileSync(DEFAULT_TEST_RUNS, '', 'utf8');
fs.writeFileSync(DEFAULT_TEST_SIGNALS, '# Signals ledger\n\nAppend-only.\n\n', 'utf8');
process.env.PROTOCOL_RUNS_FILE = DEFAULT_TEST_RUNS;
process.env.PROTOCOL_SIGNALS_FILE = DEFAULT_TEST_SIGNALS;

const getTrackedStatus = () => {
  const r = spawnSync('git', ['status', '--porcelain'], {
    cwd: path.resolve(__dirname, '..'),
    encoding: 'utf8',
    windowsHide: true
  });
  return (r.stdout || '')
    .split('\n')
    .map(l => l.trimEnd())
    .filter(l => Boolean(l) && !l.startsWith('?? '));
};
const initialTrackedStatus = getTrackedStatus();

const getFixturesStatus = () => {
  const r = spawnSync('git', ['status', '--porcelain', 'tests/fixtures'], {
    cwd: path.resolve(__dirname, '..'),
    encoding: 'utf8',
    windowsHide: true
  });
  return (r.stdout || '')
    .split('\n')
    .map(l => l.trimEnd())
    .filter(Boolean);
};
const initialFixturesStatus = getFixturesStatus();

const runBin = (args, cwd = path.resolve(__dirname, '..'), extraEnv = {}) => {
  const r = spawnSync(process.execPath, [DISPATCH_BIN, ...args], {
    cwd,
    encoding: 'utf8',
    windowsHide: true,
    env: {
      ...process.env,
      PROTOCOL_RUNS_FILE: DEFAULT_TEST_RUNS,
      PROTOCOL_SIGNALS_FILE: DEFAULT_TEST_SIGNALS,
      TEST_DISPATCH_OUT_FILE: DEFAULT_OUT_FILE,
      ...extraEnv
    }
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
  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'disp-t5-'));
  try {
    const targetDir = path.join(tmpRoot, 'docs', 'research', '2026-09-26-ownerideas-revision', 'prompts');
    fs.mkdirSync(path.dirname(targetDir), { recursive: true });
    fs.cpSync(path.resolve(repoRoot, 'tests', 'fixtures', 'prompts'), targetDir, { recursive: true });

    const copiedDispatch = path.join(targetDir, 'DISPATCH.json');
    const r1 = runBin(['check', copiedDispatch], tmpRoot);
    assert.equal(r1.code, 0);
    const expectedSlots = JSON.parse(fs.readFileSync(REAL_DISPATCH, 'utf8')).slots.length;
    assert.match(r1.stdout, new RegExp(`^CHECK dispatch=.* slots=${expectedSlots}`, 'm'));

    const r2 = runBin(['check', R3_DISPATCH], tmpRoot);
    assert.equal(r2.code, 1);
    assert.match(r2.stdout, /^CHECK dispatch=.* slots=10/m);
    const missingRows = r2.stdout.trim().split(/\r?\n/).filter(l => l.startsWith('ERROR reason=launch-missing'));
    assert.equal(missingRows.length, 10);
    assert.ok(!r2.stdout.includes('ERROR reason=unknown-'));
  } finally {
    try { fs.rmSync(tmpRoot, { recursive: true, force: true }); } catch {}
  }
});

test('T6: end-to-end run with fake client in work mode', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'disp-e2e-'));
  const launchFile = path.join(TEST_TMP_DIR, 'fake-launch.md').replace(/\\/g, '/');
  const repoRoot = path.resolve(__dirname, '..');
  const outFile = DEFAULT_OUT_FILE;

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

  const journalPath = path.resolve(repoRoot, '.ai/worklog/gemini-0123456789abcdef.md');

  try {
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
    assert.ok(fs.existsSync(journalPath));
  } finally {
    // Cleanup imported test artifacts
    try { fs.unlinkSync(path.resolve(repoRoot, outFile)); } catch {}
    try { fs.unlinkSync(journalPath); } catch {}
    try { fs.unlinkSync(path.resolve(repoRoot, launchFile)); } catch {}
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test('T7-T10: policy and scope violations end in BLOCKED with clone kept', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'disp-viol-'));
  const launchFile = path.join(TEST_TMP_DIR, 'viol-launch.md').replace(/\\/g, '/');
  const repoRoot = path.resolve(__dirname, '..');
  const outFile = DEFAULT_OUT_FILE;

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

  try {
    testViolationMode('write-escape'); // T7
    testViolationMode('commit-escape'); // T8
    testViolationMode('remote-escape'); // T9
  } finally {
    try { fs.unlinkSync(path.resolve(repoRoot, launchFile)); } catch {}
    fs.rmSync(tmp, { recursive: true, force: true });
  }
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
  const launchFile = path.join(TEST_TMP_DIR, 'hang-launch.md').replace(/\\/g, '/');
  const repoRoot = path.resolve(__dirname, '..');
  const outFile = DEFAULT_OUT_FILE;

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

  try {
    fs.mkdirSync(path.dirname(path.resolve(repoRoot, launchFile)), { recursive: true });
    fs.writeFileSync(path.resolve(repoRoot, launchFile), '# Hang launch\n', 'utf8');

    const rStall = runTimedMode('silent', '--stall-seconds', 1);
    assert.match(rStall.stdout, /^FAILED slot=timed-silent class=STALL/m);

    const rTimeout = runTimedMode('always-talking', '--hard-seconds', 2);
    assert.match(rTimeout.stdout, /^(?:FAILED|BLOCKED) slot=timed-always-talking class=TIMEOUT/m);
  } finally {
    try { fs.unlinkSync(path.resolve(repoRoot, launchFile)); } catch {}
    fs.rmSync(tmp, { recursive: true, force: true });
  }
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
  const launchFile = path.join(TEST_TMP_DIR, 'when-launch.md').replace(/\\/g, '/');
  const checkRel = path.join(TEST_TMP_DIR, 'flag.txt').replace(/\\/g, '/');
  const checkFile = path.resolve(repoRoot, checkRel);

  try {
    fs.mkdirSync(path.dirname(path.resolve(repoRoot, launchFile)), { recursive: true });
    fs.writeFileSync(path.resolve(repoRoot, launchFile), '# When launch\n', 'utf8');
    fs.writeFileSync(checkFile, 'DONE_ALREADY', 'utf8');

    const dispPath = path.join(tmp, 'disp-when.json');
    fs.writeFileSync(dispPath, JSON.stringify({
      stateDir: path.relative(repoRoot, path.join(tmp, 'state')).replace(/\\/g, '/'),
      slots: [
        {
          id: 's-skipped',
          launch: launchFile,
          when: {
            file: checkRel,
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
  } finally {
    try { fs.unlinkSync(checkFile); } catch {}
    try { fs.unlinkSync(path.resolve(repoRoot, launchFile)); } catch {}
    fs.rmSync(tmp, { recursive: true, force: true });
  }
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

test('T20: AC-7, AC-12: transient retry, run record validation, usage render', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'disp-t20-'));
  const launchFile = path.join(TEST_TMP_DIR, 't20-launch.md').replace(/\\/g, '/');
  const repoRoot = path.resolve(__dirname, '..');
  const outFile = DEFAULT_OUT_FILE;

  fs.mkdirSync(path.dirname(path.resolve(repoRoot, launchFile)), { recursive: true });
  fs.writeFileSync(path.resolve(repoRoot, launchFile), '# T20 launch\n', 'utf8');

  const fakeRegPath = path.join(tmp, 'clients.json');
  fs.writeFileSync(fakeRegPath, JSON.stringify({
    schema: 'clients/1',
    clients: {
      fake: {
        binary: 'node',
        present: true,
        version: process.version,
        verifiedOn: '2026-09-26',
        source: 'node --version',
        command: ['node', FAKE_CLIENT, 'transient-retry', '{workdir}', '{workdir}'],
        model: { how: 'none', listing: null },
        effort: { how: 'none', values: null, note: null },
        env: {},
        resume: { command: null, sessionId: null, note: 'none' },
        usage: 'none',
        failureModes: []
      }
    }
  }), 'utf8');

  const runsFile = path.join(tmp, 'RUNS.jsonl');
  const usageFile = path.join(tmp, 'usage.md');
  const dispPath = path.join(tmp, 'disp.json');
  fs.writeFileSync(dispPath, JSON.stringify({
    stateDir: path.relative(repoRoot, path.join(tmp, 'state')).replace(/\\/g, '/'),
    usageFile: path.relative(repoRoot, usageFile).replace(/\\/g, '/'),
    stallMin: 10,
    hardMin: 60,
    slots: [
      {
        id: 't20-slot',
        launch: launchFile,
        out: outFile,
        route: { client: 'fake', model: 'test' }
      }
    ]
  }), 'utf8');

  const marker = path.join(tmp, 'fake-transient.txt');
  try { fs.unlinkSync(marker); } catch {}
  try { fs.unlinkSync(path.join(os.tmpdir(), 'fake-transient.txt')); } catch {}

  try {
    const r = runBin([
      'run',
      dispPath,
      '--registry', fakeRegPath,
      '--runs-file', runsFile,
      '--fast-retry'
    ], path.resolve(__dirname, '..'), { FAKE_TRANSIENT_MARKER: marker });

    assert.equal(r.code, 0);
    assert.match(r.stdout, /^RUN slot=t20-slot attempt=1/m);
    assert.match(r.stdout, /^RUN slot=t20-slot attempt=2/m);
    assert.match(r.stdout, /^DONE slot=t20-slot/m);

    assert.ok(fs.existsSync(runsFile), 'RUNS.jsonl must exist');
    const records = runrecord.readRecords(runsFile);
    assert.equal(records.length, 1);
    const rec = records[0];
    assert.equal(rec.state, 'DONE');
    assert.equal(rec.budget.freshUsed, 2);
    assert.equal(rec.budget.resumes, 0);
    assert.equal(rec.attempts[0].reason, 'first');
    assert.equal(rec.attempts[1].reason, 'transient-retry');

    const valErrors = runrecord.validateRecord(rec);
    assert.deepEqual(valErrors, []);

    assert.ok(fs.existsSync(usageFile), 'usageFile must be rendered');
  } finally {
    try { fs.unlinkSync(marker); } catch {}
    try { fs.unlinkSync(path.join(os.tmpdir(), 'fake-transient.txt')); } catch {}
    try { fs.unlinkSync(path.resolve(repoRoot, launchFile)); } catch {}
    try { fs.unlinkSync(path.resolve(repoRoot, outFile)); } catch {}
    try { fs.unlinkSync(path.resolve(repoRoot, '.ai/worklog/gemini-0123456789abcdef.md')); } catch {}
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test('T21: AC-8: STALL recovery with wakes and fallen = true', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'disp-t21-'));
  const launchFile = path.join(TEST_TMP_DIR, 't21-launch.md').replace(/\\/g, '/');
  const repoRoot = path.resolve(__dirname, '..');
  const outFile = DEFAULT_OUT_FILE;

  try {
    fs.mkdirSync(path.dirname(path.resolve(repoRoot, launchFile)), { recursive: true });
    fs.writeFileSync(path.resolve(repoRoot, launchFile), '# T21 launch\n', 'utf8');

    const fakeRegPath = path.join(tmp, 'clients.json');
    fs.writeFileSync(fakeRegPath, JSON.stringify({
      schema: 'clients/1',
      clients: {
        fake: {
          binary: 'node',
          present: true,
          version: process.version,
          verifiedOn: '2026-09-26',
          source: 'node --version',
          command: ['node', FAKE_CLIENT, 'stall-wake', '{workdir}', '{workdir}'],
          model: { how: 'none', listing: null },
          effort: { how: 'none', values: null, note: null },
          env: {},
          resume: {
            command: ['node', FAKE_CLIENT, 'stall-wake', '{workdir}', '{workdir}', '--resume={sessionId}'],
            sessionId: 'printed',
            note: 'supports resume'
          },
          usage: 'none',
          failureModes: []
        }
      }
    }), 'utf8');

    const runsFile = path.join(tmp, 'RUNS.jsonl');
    const dispPath = path.join(tmp, 'disp.json');
    fs.writeFileSync(dispPath, JSON.stringify({
      stateDir: path.relative(repoRoot, path.join(tmp, 'state')).replace(/\\/g, '/'),
      stallMin: 10,
      hardMin: 60,
      slots: [
        {
          id: 't21-slot',
          launch: launchFile,
          out: outFile,
          route: { client: 'fake', model: 'test' }
        }
      ]
    }), 'utf8');

    const r = runBin([
      'run',
      dispPath,
      '--registry', fakeRegPath,
      '--runs-file', runsFile,
      '--stall-seconds', '1'
    ]);

    assert.equal(r.code, 1);
    assert.match(r.stdout, /^FAILED slot=t21-slot class=STALL/m);

    assert.ok(fs.existsSync(runsFile), 'RUNS.jsonl must exist');
    const records = runrecord.readRecords(runsFile);
    assert.equal(records.length, 1);
    const rec = records[0];
    assert.equal(rec.state, 'FAILED');
    assert.equal(rec.fallen, true, 'fallen must be true on stall exhaustion');

    // Verify attempt kinds and reasons
    assert.equal(rec.attempts[0].kind, 'fresh');
    assert.equal(rec.attempts[0].reason, 'first');
    assert.equal(rec.attempts[1].kind, 'resume');
    assert.equal(rec.attempts[1].reason, 'resume');
    assert.equal(rec.attempts[2].kind, 'resume');
    assert.equal(rec.attempts[3].kind, 'resume');

    const valErrors = runrecord.validateRecord(rec);
    assert.deepEqual(valErrors, []);
  } finally {
    try { fs.unlinkSync(path.resolve(repoRoot, launchFile)); } catch {}
    try { fs.unlinkSync(path.resolve(repoRoot, outFile)); } catch {}
    try { fs.unlinkSync(path.resolve(repoRoot, '.ai/worklog/gemini-0123456789abcdef.md')); } catch {}
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test('T22: AC-9: INVALID_OUTPUT repair resume', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'disp-t22-'));
  const launchFile = path.join(TEST_TMP_DIR, 't22-launch.md').replace(/\\/g, '/');
  const repoRoot = path.resolve(__dirname, '..');
  const outFile = DEFAULT_OUT_FILE;

  fs.mkdirSync(path.dirname(path.resolve(repoRoot, launchFile)), { recursive: true });
  fs.writeFileSync(path.resolve(repoRoot, launchFile), '# T22 launch\n', 'utf8');

  const fakeRegPath = path.join(tmp, 'clients.json');
  fs.writeFileSync(fakeRegPath, JSON.stringify({
    schema: 'clients/1',
    clients: {
      fake: {
        binary: 'node',
        present: true,
        version: process.version,
        verifiedOn: '2026-09-26',
        source: 'node --version',
        command: ['node', FAKE_CLIENT, 'repair-mode', '{workdir}', '{workdir}'],
        model: { how: 'none', listing: null },
        effort: { how: 'none', values: null, note: null },
        env: {},
        resume: {
          command: ['node', FAKE_CLIENT, 'repair-mode', '{workdir}', '{workdir}', '--resume={sessionId}'],
          sessionId: 'printed',
          note: 'supports resume'
        },
        usage: 'none',
        failureModes: []
      }
    }
  }), 'utf8');

  const runsFile = path.join(tmp, 'RUNS.jsonl');
  const dispPath = path.join(tmp, 'disp.json');
  fs.writeFileSync(dispPath, JSON.stringify({
    stateDir: path.relative(repoRoot, path.join(tmp, 'state')).replace(/\\/g, '/'),
    stallMin: 10,
    hardMin: 60,
    slots: [
      {
        id: 't22-slot',
        launch: launchFile,
        out: outFile,
        route: { client: 'fake', model: 'test' }
      }
    ]
  }), 'utf8');

  try {
    const r = runBin([
      'run',
      dispPath,
      '--registry', fakeRegPath,
      '--runs-file', runsFile,
      '--fast-retry'
    ]);

    assert.equal(r.code, 0);
    assert.match(r.stdout, /^DONE slot=t22-slot/m);

    const records = runrecord.readRecords(runsFile);
    assert.equal(records.length, 1);
    const rec = records[0];
    assert.equal(rec.state, 'DONE');
    assert.equal(rec.attempts.length, 2);
    assert.equal(rec.attempts[0].kind, 'fresh');
    assert.equal(rec.attempts[0].reason, 'first');
    assert.equal(rec.attempts[1].kind, 'resume');
    assert.equal(rec.attempts[1].reason, 'repair');

    const valErrors = runrecord.validateRecord(rec);
    assert.deepEqual(valErrors, []);
  } finally {
    try { fs.unlinkSync(path.resolve(repoRoot, launchFile)); } catch {}
    try { fs.unlinkSync(path.resolve(repoRoot, outFile)); } catch {}
    try { fs.unlinkSync(path.resolve(repoRoot, '.ai/worklog/gemini-0123456789abcdef.md')); } catch {}
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test('T23: AC-10: Launch pinning mismatch BLOCKED pin-changed, and --revise starts new run', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'disp-t23-'));
  const launchFile = path.join(TEST_TMP_DIR, 't23-launch.md').replace(/\\/g, '/');
  const repoRoot = path.resolve(__dirname, '..');
  const outFile = DEFAULT_OUT_FILE;

  fs.mkdirSync(path.dirname(path.resolve(repoRoot, launchFile)), { recursive: true });
  fs.writeFileSync(path.resolve(repoRoot, launchFile), '# T23 initial launch\n', 'utf8');

  const fakeRegPath = path.join(tmp, 'clients.json');
  fs.writeFileSync(fakeRegPath, JSON.stringify({
    schema: 'clients/1',
    clients: {
      fake: {
        binary: 'node',
        present: true,
        version: process.version,
        verifiedOn: '2026-09-26',
        source: 'node --version',
        command: ['node', FAKE_CLIENT, 'auth-error', '{workdir}', '{workdir}'],
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
    slots: [
      {
        id: 't23-slot',
        launch: launchFile,
        out: outFile,
        route: { client: 'fake', model: 'test' }
      }
    ]
  }), 'utf8');

  try {
    // First run: records pins, fails with AUTH_ERROR
    const r1 = runBin(['run', dispPath, '--registry', fakeRegPath]);
    assert.equal(r1.code, 1);

    // Modify launch file
    fs.writeFileSync(path.resolve(repoRoot, launchFile), '# T23 TAMPERED launch\n', 'utf8');

    // Second run without --revise: BLOCKED pin-changed
    const r2 = runBin(['run', dispPath, '--registry', fakeRegPath]);
    assert.equal(r2.code, 1);
    assert.match(r2.stdout, new RegExp(`^BLOCKED slot=t23-slot class=POLICY_FAILURE reason="pin-changed ${launchFile}"`, 'm'));

    // Third run with --revise: starts fresh revision
    const r3 = runBin(['run', dispPath, '--registry', fakeRegPath, '--revise']);
    assert.equal(r3.code, 1);
    assert.match(r3.stdout, /^RUN slot=t23-slot attempt=1/m);
  } finally {
    try { fs.unlinkSync(path.resolve(repoRoot, launchFile)); } catch {}
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test('T24: AC-11: Completion contract requires Evidence line', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'disp-t24-'));
  const launchFile = path.join(TEST_TMP_DIR, 't24-launch.md').replace(/\\/g, '/');
  const repoRoot = path.resolve(__dirname, '..');
  const outFile = DEFAULT_OUT_FILE;

  fs.mkdirSync(path.dirname(path.resolve(repoRoot, launchFile)), { recursive: true });
  fs.writeFileSync(path.resolve(repoRoot, launchFile), '# T24 launch\n', 'utf8');

  // Fake client without Evidence line in journal
  const fakeScript = path.join(tmp, 'no-evidence-client.cjs');
  fs.writeFileSync(fakeScript, `
    const fs = require('fs');
    const path = require('path');
    const root = process.argv[2] || '.';
    const out = path.join(root, ${JSON.stringify(outFile)});
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, 'valid output without evidence\\n', 'utf8');
    const j = path.join(root, '.ai/worklog/gemini-0123456789abcdef.md');
    fs.mkdirSync(path.dirname(j), { recursive: true });
    fs.writeFileSync(j, '# Session journal\\nNo evidence here\\n', 'utf8');
    process.exit(0);
  `, 'utf8');

  const fakeRegPath = path.join(tmp, 'clients.json');
  fs.writeFileSync(fakeRegPath, JSON.stringify({
    schema: 'clients/1',
    clients: {
      fake: {
        binary: 'node',
        present: true,
        version: process.version,
        verifiedOn: '2026-09-26',
        source: 'node --version',
        command: ['node', fakeScript, '{workdir}'],
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
    slots: [
      {
        id: 't24-slot',
        launch: launchFile,
        out: outFile,
        route: { client: 'fake', model: 'test' }
      }
    ]
  }), 'utf8');

  try {
    const r = runBin(['run', dispPath, '--registry', fakeRegPath]);
    assert.equal(r.code, 1);
    assert.match(r.stdout, /^FAILED slot=t24-slot class=INVALID_OUTPUT/m);
  } finally {
    try { fs.unlinkSync(path.resolve(repoRoot, launchFile)); } catch {}
    try { fs.unlinkSync(path.resolve(repoRoot, outFile)); } catch {}
    try { fs.unlinkSync(path.resolve(repoRoot, '.ai/worklog/gemini-0123456789abcdef.md')); } catch {}
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test('T25: AC-7: PROCESS_CRASH recovery via resume', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'disp-t25-'));
  const launchFile = path.join(TEST_TMP_DIR, 't25-launch.md').replace(/\\/g, '/');
  const repoRoot = path.resolve(__dirname, '..');
  const outFile = DEFAULT_OUT_FILE;

  fs.mkdirSync(path.dirname(path.resolve(repoRoot, launchFile)), { recursive: true });
  fs.writeFileSync(path.resolve(repoRoot, launchFile), '# T25 launch\n', 'utf8');

  const fakeRegPath = path.join(tmp, 'clients.json');
  fs.writeFileSync(fakeRegPath, JSON.stringify({
    schema: 'clients/1',
    clients: {
      fake: {
        binary: 'node',
        present: true,
        version: process.version,
        verifiedOn: '2026-09-26',
        source: 'node --version',
        command: ['node', FAKE_CLIENT, 'crash-resume', '{workdir}', '{workdir}'],
        model: { how: 'none', listing: null },
        effort: { how: 'none', values: null, note: null },
        env: {},
        resume: {
          command: ['node', FAKE_CLIENT, 'crash-resume', '{workdir}', '{workdir}', '--resume={sessionId}'],
          sessionId: 'printed',
          note: 'supports resume'
        },
        usage: 'none',
        failureModes: []
      }
    }
  }), 'utf8');

  const runsFile = path.join(tmp, 'RUNS.jsonl');
  const dispPath = path.join(tmp, 'disp.json');
  fs.writeFileSync(dispPath, JSON.stringify({
    stateDir: path.relative(repoRoot, path.join(tmp, 'state')).replace(/\\/g, '/'),
    slots: [
      {
        id: 't25-slot',
        launch: launchFile,
        out: outFile,
        route: { client: 'fake', model: 'test' }
      }
    ]
  }), 'utf8');

  try {
    const r = runBin([
      'run',
      dispPath,
      '--registry', fakeRegPath,
      '--runs-file', runsFile,
      '--fast-retry'
    ]);

    assert.equal(r.code, 0);
    assert.match(r.stdout, /^DONE slot=t25-slot/m);

    const records = runrecord.readRecords(runsFile);
    assert.equal(records.length, 1);
    const rec = records[0];
    assert.equal(rec.state, 'DONE');
    assert.equal(rec.attempts.length, 2);
    assert.equal(rec.attempts[0].kind, 'fresh');
    assert.equal(rec.attempts[0].reason, 'first');
    assert.equal(rec.attempts[1].kind, 'resume');
    assert.equal(rec.attempts[1].reason, 'resume');

    const valErrors = runrecord.validateRecord(rec);
    assert.deepEqual(valErrors, []);
  } finally {
    try { fs.unlinkSync(path.resolve(repoRoot, launchFile)); } catch {}
    try { fs.unlinkSync(path.resolve(repoRoot, outFile)); } catch {}
    try { fs.unlinkSync(path.resolve(repoRoot, '.ai/worklog/gemini-0123456789abcdef.md')); } catch {}
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test('T26: AC-10: PKG-5 dispatcher fall signal test', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'disp-t26-'));
  const launchFile = path.join(TEST_TMP_DIR, 't26-launch.md').replace(/\\/g, '/');
  const repoRoot = path.resolve(__dirname, '..');
  const outFile = DEFAULT_OUT_FILE;

  fs.mkdirSync(path.dirname(path.resolve(repoRoot, launchFile)), { recursive: true });
  fs.writeFileSync(path.resolve(repoRoot, launchFile), '# T26 launch\n', 'utf8');

  try {
    // Case 1: STALL fake client exhausting its wakes adds one fall line with evidence=docs/ops/RUNS.jsonl#<runId>
    const fakeRegPath = path.join(tmp, 'clients-wakes.json');
    fs.writeFileSync(fakeRegPath, JSON.stringify({
      schema: 'clients/1',
      clients: {
        fake: {
          binary: 'node',
          present: true,
          version: process.version,
          verifiedOn: '2026-09-26',
          source: 'node --version',
          command: ['node', FAKE_CLIENT, 'stall-wake', '{workdir}', '{workdir}'],
          model: { how: 'none', listing: null },
          effort: { how: 'none', values: null, note: null },
          env: {},
          resume: {
            command: ['node', FAKE_CLIENT, 'stall-wake', '{workdir}', '{workdir}', '--resume={sessionId}'],
            sessionId: 'printed',
            note: 'supports resume'
          },
          usage: 'none',
          failureModes: []
        }
      }
    }), 'utf8');

    const runsFile1 = path.join(tmp, 'RUNS1.jsonl');
    const signalsFile1 = path.join(tmp, 'SIGNALS1.md');
    const dispPath1 = path.join(tmp, 'disp1.json');
    fs.writeFileSync(dispPath1, JSON.stringify({
      stateDir: path.relative(repoRoot, path.join(tmp, 'state1')).replace(/\\/g, '/'),
      stallMin: 10,
      hardMin: 60,
      slots: [
        {
          id: 't26-slot1',
          launch: launchFile,
          out: outFile,
          route: { client: 'fake', model: 'test-model' }
        }
      ]
    }), 'utf8');

    const r1 = runBin([
      'run',
      dispPath1,
      '--registry', fakeRegPath,
      '--runs-file', runsFile1,
      '--signals-file', signalsFile1,
      '--stall-seconds', '1'
    ]);

    assert.equal(r1.code, 1);
    assert.ok(fs.existsSync(signalsFile1), 'signalsFile1 must exist');
    const content1 = fs.readFileSync(signalsFile1, 'utf8');
    const lines1 = content1.split('\n').filter(l => l.startsWith('Signal: '));
    assert.ok(lines1.length >= 1, 'must add at least 1 signal line on wake exhaustion');
    assert.ok(lines1.every(l => l.includes(' | fall | ')), 'must be fall signal');
    assert.match(lines1[0], /fake:test-model/, 'participant must match client:model');

    const records1 = runrecord.readRecords(runsFile1);
    assert.equal(records1.length, 1);
    const runId1 = records1[0].runId;
    assert.ok(lines1[0].includes(`docs/ops/RUNS.jsonl#${runId1}`), 'evidence must point to runId in RUNS.jsonl');

    // Case 2: Fake client without resume.command adds fall and procedure-gap
    const fakeRegNoResume = path.join(tmp, 'clients-no-resume.json');
    fs.writeFileSync(fakeRegNoResume, JSON.stringify({
      schema: 'clients/1',
      clients: {
        fake: {
          binary: 'node',
          present: true,
          version: process.version,
          verifiedOn: '2026-09-26',
          source: 'node --version',
          command: ['node', FAKE_CLIENT, 'stall-wake', '{workdir}', '{workdir}'],
          model: { how: 'none', listing: null },
          effort: { how: 'none', values: null, note: null },
          env: {},
          resume: {
            command: null,
            sessionId: null,
            note: 'no resume'
          },
          usage: 'none',
          failureModes: []
        }
      }
    }), 'utf8');

    const runsFile2 = path.join(tmp, 'RUNS2.jsonl');
    const signalsFile2 = path.join(tmp, 'SIGNALS2.md');
    const dispPath2 = path.join(tmp, 'disp2.json');
    fs.writeFileSync(dispPath2, JSON.stringify({
      stateDir: path.relative(repoRoot, path.join(tmp, 'state2')).replace(/\\/g, '/'),
      stallMin: 10,
      hardMin: 60,
      slots: [
        {
          id: 't26-slot2',
          launch: launchFile,
          out: outFile,
          route: { client: 'fake', model: 'test-no-res' }
        }
      ]
    }), 'utf8');

    const r2 = runBin([
      'run',
      dispPath2,
      '--registry', fakeRegNoResume,
      '--runs-file', runsFile2,
      '--signals-file', signalsFile2,
      '--stall-seconds', '1'
    ]);

    assert.equal(r2.code, 1);
    assert.ok(fs.existsSync(signalsFile2), 'signalsFile2 must exist');
    const content2 = fs.readFileSync(signalsFile2, 'utf8');
    const lines2 = content2.split('\n').filter(l => l.startsWith('Signal: '));
    assert.ok(lines2.length >= 2, 'must add signal lines (fall and procedure-gap)');
    const fallLine = lines2.find(l => l.includes(' | fall | '));
    const gapLine = lines2.find(l => l.includes(' | procedure-gap | '));
    assert.ok(fallLine, 'must have fall signal');
    assert.ok(gapLine, 'must have procedure-gap signal');
    assert.ok(gapLine.includes('unknown'), 'procedure-gap cost must be unknown');

    const records2 = runrecord.readRecords(runsFile2);
    assert.equal(records2.length, 1);
    const runId2 = records2[0].runId;
    assert.ok(fallLine.includes(`docs/ops/RUNS.jsonl#${runId2}`));
    assert.ok(gapLine.includes(`docs/ops/RUNS.jsonl#${runId2}`));

    // Case 3: A failing ledger leaves run record unchanged and prints ERROR row
    const badSignalsFile = path.join(tmp, 'BAD_SIGNALS.md');
    fs.writeFileSync(badSignalsFile, 'Corrupted invalid header line\n\n\n\n', 'utf8');

    const runsFile3 = path.join(tmp, 'RUNS3.jsonl');
    const dispPath3 = path.join(tmp, 'disp3.json');
    fs.writeFileSync(dispPath3, JSON.stringify({
      stateDir: path.relative(repoRoot, path.join(tmp, 'state3')).replace(/\\/g, '/'),
      stallMin: 10,
      hardMin: 60,
      slots: [
        {
          id: 't26-slot3',
          launch: launchFile,
          out: outFile,
          route: { client: 'fake', model: 'test-fail' }
        }
      ]
    }), 'utf8');

    const r3 = runBin([
      'run',
      dispPath3,
      '--registry', fakeRegNoResume,
      '--runs-file', runsFile3,
      '--signals-file', badSignalsFile,
      '--stall-seconds', '1'
    ]);

    assert.match(r3.stdout, /ERROR reason=signal-append-failed runId=R-/, 'must print ERROR reason=signal-append-failed row');
    assert.ok(fs.existsSync(runsFile3), 'runsFile3 must still exist');
    const records3 = runrecord.readRecords(runsFile3);
    assert.equal(records3.length, 1, 'run record must still be written');
    assert.equal(records3[0].state, 'FAILED');
  } finally {
    try { fs.unlinkSync(path.resolve(repoRoot, launchFile)); } catch {}
    try { fs.unlinkSync(path.resolve(repoRoot, outFile)); } catch {}
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test('T27: AC-usage: parse attempt usage from log across all parsers and negative patterns', () => {
  const usageFixturesDir = path.resolve(__dirname, 'fixtures', 'dispatch', 'usage');

  // 1. Kilo parser (kilo-json)
  const kiloRes = dispatch.parseUsageFromLog(path.join(usageFixturesDir, 'kilo.log'), 'kilo-json');
  assert.equal(kiloRes.found, true);
  assert.equal(kiloRes.usage.amount, 0.005);
  assert.equal(kiloRes.usage.unit, 'USD');
  assert.deepEqual(kiloRes.tokens, { in: 200, out: 100, source: 'client-output' });

  // 2. MiMo parser (kilo-json)
  const mimoRes = dispatch.parseUsageFromLog(path.join(usageFixturesDir, 'mimo.log'), 'kilo-json');
  assert.equal(mimoRes.found, true);
  assert.equal(mimoRes.usage.amount, 0.02);
  assert.equal(mimoRes.usage.unit, 'USD');
  assert.deepEqual(mimoRes.tokens, { in: 450, out: 150, source: 'client-output' });

  // 3. Copilot credits (AI Credits 12.5)
  const copilotRes = dispatch.parseUsageFromLog(path.join(usageFixturesDir, 'copilot.log'), 'copilot-credits');
  assert.equal(copilotRes.found, true);
  assert.equal(copilotRes.usage.amount, 12.5);
  assert.equal(copilotRes.usage.unit, 'credits');
  assert.deepEqual(copilotRes.tokens, { in: null, out: null, source: 'none' });

  // 4. Codex tokens (tokens used\n12,345)
  const codexRes = dispatch.parseUsageFromLog(path.join(usageFixturesDir, 'codex.log'), 'codex-tokens');
  assert.equal(codexRes.found, true);
  assert.equal(codexRes.usage.amount, 12345);
  assert.equal(codexRes.usage.unit, 'tokens');
  assert.deepEqual(codexRes.tokens, { in: null, out: null, source: 'none' });

  // 5. Negative patterns: "line 503" and "429 tokens" must NOT be parsed as usage
  for (const parser of ['codex-tokens', 'copilot-credits', 'kilo-json']) {
    const negRes = dispatch.parseUsageFromLog(path.join(usageFixturesDir, 'negative.log'), parser);
    assert.equal(negRes.found, false, `negative.log should not match parser ${parser}`);
    assert.equal(negRes.usage.amount, null);
    assert.equal(negRes.usage.unit, null);
    assert.deepEqual(negRes.tokens, { in: null, out: null, source: 'none' });
  }

  // 6. Log without usage
  for (const parser of ['codex-tokens', 'copilot-credits', 'kilo-json']) {
    const noRes = dispatch.parseUsageFromLog(path.join(usageFixturesDir, 'no-usage.log'), parser);
    assert.equal(noRes.found, false);
    assert.equal(noRes.usage.amount, null);
    assert.equal(noRes.usage.unit, null);
    assert.deepEqual(noRes.tokens, { in: null, out: null, source: 'none' });
  }

  // 7. usage=none client
  const noneRes = dispatch.parseUsageFromLog(path.join(usageFixturesDir, 'codex.log'), 'none');
  assert.equal(noneRes.found, false);
  assert.equal(noneRes.usage.amount, null);
  assert.equal(noneRes.usage.unit, null);
  assert.deepEqual(noneRes.tokens, { in: null, out: null, source: 'none' });
});

test('W0: codex usage parser with grouping, colon, K/M suffixes, and raw line', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'codex-usage-'));
  try {
    const checkCase = (text) => {
      const p = path.join(tmp, 'test.log');
      fs.writeFileSync(p, text, 'utf8');
      return dispatch.parseUsageFromLog(p, 'codex-tokens');
    };

    // 1. "10 644"
    const r1 = checkCase('tokens used\n10 644');
    assert.equal(r1.found, true);
    assert.equal(r1.usage.amount, 10644);
    assert.equal(r1.usage.unit, 'tokens');

    // 2. "10" + NBSP + "644"
    const r2 = checkCase('tokens used\n10\u00A0644');
    assert.equal(r2.found, true);
    assert.equal(r2.usage.amount, 10644);

    // 3. "10,644"
    const r3 = checkCase('tokens used\n10,644');
    assert.equal(r3.found, true);
    assert.equal(r3.usage.amount, 10644);

    // 4. "tokens used: 10 644"
    const r4 = checkCase('tokens used: 10 644');
    assert.equal(r4.found, true);
    assert.equal(r4.usage.amount, 10644);

    // 5. Real captured pair (cr-verifier-1.log:3883-3884): "tokens used\n252" + NBSP + "154" -> expected 252154
    const r5 = checkCase('tokens used\n252\u00A0154\nDone: [VERIFICATION.md]');
    assert.equal(r5.found, true);
    assert.equal(r5.usage.amount, 252154);
    assert.ok(r5.rawUsage && r5.rawUsage.includes('252\u00A0154'), 'rawUsage must be captured');

    // 6. Dot as grouping character
    const r6 = checkCase('tokens used: 10.644');
    assert.equal(r6.found, true);
    assert.equal(r6.usage.amount, 10644);

    // 7. K and M suffixes
    const r7a = checkCase('tokens used: 10k');
    assert.equal(r7a.found, true);
    assert.equal(r7a.usage.amount, 10000);

    const r7b = checkCase('tokens used: 1.5K');
    assert.equal(r7b.found, true);
    assert.equal(r7b.usage.amount, 1500);

    const r7c = checkCase('tokens used: 2.5M');
    assert.equal(r7c.found, true);
    assert.equal(r7c.usage.amount, 2500000);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});


test('T28: AC-usage: two-attempt sum, mixed units giving actual=null, and cost recording', async () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'disp-t28-'));
  const repoRoot = path.resolve(__dirname, '..');
  const launchFile = path.join(TEST_TMP_DIR, 't28-launch.md').replace(/\\/g, '/');
  const outFile = DEFAULT_OUT_FILE;

  try {
    fs.mkdirSync(path.dirname(path.resolve(repoRoot, launchFile)), { recursive: true });
    fs.writeFileSync(path.resolve(repoRoot, launchFile), '# T28 launch\n', 'utf8');

    const runnerScript = path.join(tmp, 'runner.cjs');
    fs.writeFileSync(runnerScript, `'use strict';
const fs = require('fs');
const path = require('path');
const mode = process.argv[2];
const tmpDir = process.argv[3];
const workdir = process.cwd();

const outPath = path.join(workdir, ${JSON.stringify(outFile)});
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, 'output\\n', 'utf8');

const journalDir = path.join(workdir, '.ai', 'worklog');
fs.mkdirSync(journalDir, { recursive: true });
fs.writeFileSync(path.join(journalDir, 'gemini-0123456789abcdef.md'), '# Worklog\\n\\nEvidence: ok\\n', 'utf8');

const marker = path.join(tmpDir, 'marker.txt');
if (mode === 'two-attempts') {
  if (!fs.existsSync(marker)) {
    fs.writeFileSync(marker, 'attempt1', 'utf8');
    console.log('tokens used\\n1,000');
    process.exit(1);
  } else {
    console.log('tokens used\\n2,500');
    process.exit(0);
  }
}
`, 'utf8');

    const fakeRegPath = path.join(tmp, 'clients.json');
    fs.writeFileSync(fakeRegPath, JSON.stringify({
      schema: 'clients/1',
      clients: {
        fakeRunner: {
          binary: 'node',
          present: true,
          version: process.version,
          verifiedOn: '2026-09-26',
          source: 'node --version',
          command: ['node', runnerScript, 'two-attempts', tmp],
          model: { how: 'none', listing: null },
          effort: { how: 'none', values: null, note: null },
          env: {},
          resume: { command: null, sessionId: null, note: 'none' },
          usage: 'codex-tokens',
          failureModes: []
        }
      }
    }), 'utf8');

    const runsFile = path.join(tmp, 'runs.jsonl');
    const dispPath = path.join(tmp, 'disp.json');
    fs.writeFileSync(dispPath, JSON.stringify({
      stateDir: path.relative(repoRoot, path.join(tmp, 'state')).replace(/\\/g, '/'),
      slots: [
        {
          id: 'slot-two-attempts',
          launch: launchFile,
          out: outFile,
          route: { client: 'fakeRunner', model: 'm1' }
        }
      ]
    }), 'utf8');

    const r = runBin([
      'run', dispPath,
      '--registry', fakeRegPath,
      '--runs-file', runsFile,
      '--fast-retry'
    ]);
    assert.equal(r.code, 0);

    const recs = runrecord.readRecords(runsFile);
    assert.equal(recs.length, 1);
    const rec = recs[0];
    assert.equal(rec.attempts.length, 2);
    assert.equal(rec.attempts[0].usage.amount, 1000);
    assert.equal(rec.attempts[0].usage.unit, 'tokens');
    assert.equal(rec.attempts[1].usage.amount, 2500);
    assert.equal(rec.attempts[1].usage.unit, 'tokens');
    assert.equal(rec.cost.actual, 3500);
    assert.equal(rec.cost.cumulative, 3500);
    assert.equal(rec.cost.unit, 'tokens');
    assert.equal(rec.cost.estimated, null);

    const valErrors = runrecord.validateRecord(rec);
    assert.deepEqual(valErrors, []);

    // Also verify mixed units giving actual=null via a constructed 2-attempt record
    const mixedRec = JSON.parse(JSON.stringify(rec));
    mixedRec.runId = 'R-20260927T000000Z-mixed';
    mixedRec.slot = 'mixed';
    mixedRec.attempts[0].usage = { amount: 10, unit: 'USD' };
    mixedRec.attempts[1].usage = { amount: 5, unit: 'credits' };
    mixedRec.cost = { estimated: null, actual: null, cumulative: null, unit: null };
    const mixedValErrors = runrecord.validateRecord(mixedRec);
    assert.deepEqual(mixedValErrors, []);
  } finally {
    try { fs.unlinkSync(path.resolve(repoRoot, launchFile)); } catch {}
    try { fs.unlinkSync(path.resolve(repoRoot, outFile)); } catch {}
    try { fs.unlinkSync(path.resolve(repoRoot, '.ai/worklog/gemini-0123456789abcdef.md')); } catch {}
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test('T29: AC-usage: report distinct reasons and renderUsage table', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'disp-t29-'));

  try {
    const fakeRegPath = path.join(tmp, 'clients.json');
    fs.writeFileSync(fakeRegPath, JSON.stringify({
      schema: 'clients/1',
      clients: {
        noneClient: {
          binary: 'node',
          present: true,
          version: '1',
          verifiedOn: '2026-09-26',
          source: 'none',
          command: ['node', '-e', ''],
          model: { how: 'none', listing: null },
          effort: { how: 'none', values: null, note: null },
          env: {},
          resume: { command: null, sessionId: null, note: 'none' },
          usage: 'none',
          failureModes: []
        },
        codexClient: {
          binary: 'node',
          present: true,
          version: '1',
          verifiedOn: '2026-09-26',
          source: 'none',
          command: ['node', '-e', ''],
          model: { how: 'none', listing: null },
          effort: { how: 'none', values: null, note: null },
          env: {},
          resume: { command: null, sessionId: null, note: 'none' },
          usage: 'codex-tokens',
          failureModes: []
        },
        copilotClient: {
          binary: 'node',
          present: true,
          version: '1',
          verifiedOn: '2026-09-26',
          source: 'none',
          command: ['node', '-e', ''],
          model: { how: 'none', listing: null },
          effort: { how: 'none', values: null, note: null },
          env: {},
          resume: { command: null, sessionId: null, note: 'none' },
          usage: 'copilot-credits',
          failureModes: []
        }
      }
    }), 'utf8');

    const dispPath = path.join(tmp, 'disp.json');
    fs.writeFileSync(dispPath, JSON.stringify({
      slots: [
        { id: 'slot-none', launch: 'tests/fixtures/dispatch/hang-launch.md', out: 'out.txt', route: { client: 'noneClient', model: 'm1' } },
        { id: 'slot-parser-empty', launch: 'tests/fixtures/dispatch/hang-launch.md', out: 'out.txt', route: { client: 'codexClient', model: 'm2' } },
        { id: 'slot-with-usage', launch: 'tests/fixtures/dispatch/hang-launch.md', out: 'out.txt', route: { client: 'copilotClient', model: 'm3' } }
      ]
    }), 'utf8');

    const runsFile = path.join(tmp, 'RUNS.jsonl');
    const records = [
      {
        schema: 'run-record/1',
        runId: 'R-20260927T000000Z-slot-none',
        slot: 'slot-none',
        frame: 'task:test',
        role: null,
        selection: 'owner',
        resolution: { ladderSnapshot: null, primary: { client: 'noneClient', model: 'm1', effort: null }, substitutes: [], excluded: [], skipped: [], unverified: [], approval: null, shortfall: null },
        pins: { head: 'a'.repeat(40), launchFile: 'launch.md', launchSha256: 'b'.repeat(64), roleSha256: null, corpusHash: null, dispatchVersion: '1' },
        attempts: [{
          n: 1, kind: 'fresh', reason: 'first', routeRole: 'primary',
          route: { client: 'noneClient', model: 'm1', effort: null },
          effortUsed: null, modelRan: { id: 'm1', source: 'requested' },
          sessionId: null, start: '2026-09-27T00:00:00Z', end: '2026-09-27T00:01:00Z',
          exitCode: 0, class: 'NONE',
          tokens: { in: null, out: null, source: 'none' },
          usage: { amount: null, unit: null }
        }],
        budget: { freshUsed: 1, resumes: 0, stallMin: 10, hardMin: 60 },
        cost: { estimated: null, actual: null, cumulative: null, unit: null },
        completion: { processEnded: true, exitCode: 0, outputsPresent: true, outputsNonEmpty: true, structuralCheck: 'pass', validator: 'pass', evidence: 'evidence.md', supervisorDone: true },
        state: 'DONE', fallen: false, transitions: [], outputs: ['out.txt']
      },
      {
        schema: 'run-record/1',
        runId: 'R-20260927T000000Z-slot-parser-empty',
        slot: 'slot-parser-empty',
        frame: 'task:test',
        role: null,
        selection: 'owner',
        resolution: { ladderSnapshot: null, primary: { client: 'codexClient', model: 'm2', effort: null }, substitutes: [], excluded: [], skipped: [], unverified: [], approval: null, shortfall: null },
        pins: { head: 'a'.repeat(40), launchFile: 'launch.md', launchSha256: 'b'.repeat(64), roleSha256: null, corpusHash: null, dispatchVersion: '1' },
        attempts: [{
          n: 1, kind: 'fresh', reason: 'first', routeRole: 'primary',
          route: { client: 'codexClient', model: 'm2', effort: null },
          effortUsed: null, modelRan: { id: 'm2', source: 'requested' },
          sessionId: null, start: '2026-09-27T00:00:00Z', end: '2026-09-27T00:01:00Z',
          exitCode: 0, class: 'NONE',
          tokens: { in: null, out: null, source: 'none' },
          usage: { amount: null, unit: null }
        }],
        budget: { freshUsed: 1, resumes: 0, stallMin: 10, hardMin: 60 },
        cost: { estimated: null, actual: null, cumulative: null, unit: null },
        completion: { processEnded: true, exitCode: 0, outputsPresent: true, outputsNonEmpty: true, structuralCheck: 'pass', validator: 'pass', evidence: 'evidence.md', supervisorDone: true },
        state: 'DONE', fallen: false, transitions: [], outputs: ['out.txt']
      },
      {
        schema: 'run-record/1',
        runId: 'R-20260927T000000Z-slot-with-usage',
        slot: 'slot-with-usage',
        frame: 'task:test',
        role: null,
        selection: 'owner',
        resolution: { ladderSnapshot: null, primary: { client: 'copilotClient', model: 'm3', effort: null }, substitutes: [], excluded: [], skipped: [], unverified: [], approval: null, shortfall: null },
        pins: { head: 'a'.repeat(40), launchFile: 'launch.md', launchSha256: 'b'.repeat(64), roleSha256: null, corpusHash: null, dispatchVersion: '1' },
        attempts: [{
          n: 1, kind: 'fresh', reason: 'first', routeRole: 'primary',
          route: { client: 'copilotClient', model: 'm3', effort: null },
          effortUsed: null, modelRan: { id: 'm3', source: 'requested' },
          sessionId: null, start: '2026-09-27T00:00:00Z', end: '2026-09-27T00:01:00Z',
          exitCode: 0, class: 'NONE',
          tokens: { in: null, out: null, source: 'none' },
          usage: { amount: 12.5, unit: 'credits' }
        }],
        budget: { freshUsed: 1, resumes: 0, stallMin: 10, hardMin: 60 },
        cost: { estimated: null, actual: 12.5, cumulative: 12.5, unit: 'credits' },
        completion: { processEnded: true, exitCode: 0, outputsPresent: true, outputsNonEmpty: true, structuralCheck: 'pass', validator: 'pass', evidence: 'evidence.md', supervisorDone: true },
        state: 'DONE', fallen: false, transitions: [], outputs: ['out.txt']
      }
    ];

    for (const rec of records) {
      assert.deepEqual(runrecord.validateRecord(rec), []);
      fs.appendFileSync(runsFile, JSON.stringify(rec) + '\n', 'utf8');
    }

    const r = runBin([
      'report', dispPath,
      '--registry', fakeRegPath,
      '--runs-file', runsFile
    ]);

    assert.equal(r.code, 0);
    // Reason 1: client usage=none in clients.json
    assert.match(r.stdout, /REPORT slot=slot-none route=noneClient:m1 state=DONE attempts=1 outputs="out\.txt" usage=none \(client usage=none in clients\.json\)/);
    // Reason 2: parser <key> found no usage in log
    assert.match(r.stdout, /REPORT slot=slot-parser-empty route=codexClient:m2 state=DONE attempts=1 outputs="out\.txt" usage=none \(parser codex-tokens found no usage in log\)/);
    // With usage
    assert.match(r.stdout, /REPORT slot=slot-with-usage route=copilotClient:m3 state=DONE attempts=1 outputs="out\.txt" usage=12\.5 credits/);
    // Old wording completely removed
    assert.ok(!r.stdout.includes('client reported no tokens/cost'));

    // renderUsage table
    const table = runrecord.renderUsage(records);
    // Assert headers
    assert.ok(table.includes('| Run | Slot | Selection | Client | Model ran | Effort used | Fresh/Resume | Wall min | Tokens in/out | Cost | State |'));
    // Cost column has rendered cost
    assert.ok(table.includes('12.50 credits'));
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test('Guard test: test suite leaves no changes to tracked files', () => {
  const current = getTrackedStatus();
  const changed = current.filter(l => !initialTrackedStatus.includes(l));
  assert.deepEqual(changed, [], `Test suite modified tracked files:\n${changed.join('\n')}`);
  assert.ok(!changed.some(l => l.includes('.ai/SIGNALS.md')), '.ai/SIGNALS.md polluted');
  assert.ok(!changed.some(l => l.includes('docs/ops/RUNS.jsonl')), 'docs/ops/RUNS.jsonl polluted');
  assert.ok(!changed.some(l => l.includes('hang-launch.md')), 'hang-launch.md modified/deleted');
  assert.ok(!changed.some(l => l.includes('t21-launch.md')), 't21-launch.md modified/deleted');

  const currentFixtures = getFixturesStatus();
  const changedFixtures = currentFixtures.filter(l => !initialFixturesStatus.includes(l));
  assert.deepEqual(changedFixtures, [], `Test suite modified or created files under tests/fixtures:\n${changedFixtures.join('\n')}`);
});

test.after(() => {
  try { fs.rmSync(testTmpAbs, { recursive: true, force: true }); } catch {}
  try { fs.rmSync(TEST_SUITE_TMP, { recursive: true, force: true }); } catch {}
});


