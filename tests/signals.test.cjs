'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { spawnSync, fork } = require('node:child_process');

const signals = require('../.ai/bin/protocol-signals.cjs');

const BIN_PATH = path.resolve(__dirname, '..', '.ai', 'bin', 'protocol-signals.cjs');
const FIXTURES_DIR = path.resolve(__dirname, 'fixtures', 'signals');

function runBin(args, options = {}) {
  const result = spawnSync('node', [BIN_PATH, ...args], {
    cwd: options.cwd || path.resolve(__dirname, '..'),
    encoding: 'utf8',
    env: { ...process.env, ...options.env }
  });
  return {
    code: result.status,
    stdout: result.stdout || '',
    stderr: result.stderr || ''
  };
}

function assertUpperTokens(stdout) {
  const lines = stdout.split('\n').map(l => l.trim()).filter(Boolean);
  for (const line of lines) {
    assert.match(
      line,
      /^[A-Z][A-Z_]*( |$)/,
      `stdout line must match ^[A-Z][A-Z_]*( |$): "${line}"`
    );
  }
}

test('AC-1: Golden ledger passes check; header modified by 1 byte fails', () => {
  const goldenPath = path.join(FIXTURES_DIR, 'golden.md');
  assert.ok(fs.existsSync(goldenPath), 'golden fixture must exist');

  // Library check
  const libErrors = signals.validateFile(goldenPath);
  assert.deepEqual(libErrors, [], 'validateFile must report no errors for golden fixture');

  // CLI check
  const r = runBin(['check', goldenPath]);
  assert.equal(r.code, 0, 'golden check must exit 0');
  assertUpperTokens(r.stdout);
  assert.match(r.stdout, /SUMMARY lines=\d+ signals=4 invalid=0/);

  // Alter header by 1 byte
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'signals-ac1-'));
  try {
    const badHeaderPath = path.join(tmpDir, 'bad-header.md');
    const content = fs.readFileSync(goldenPath, 'utf8');
    // Replace '# Signals' with '# Xignals'
    const modified = content.replace('# Signals ledger', '# Xignals ledger');
    fs.writeFileSync(badHeaderPath, modified, 'utf8');

    const badErrors = signals.validateFile(badHeaderPath);
    assert.ok(badErrors.length > 0, 'validateFile must fail altered header');
    assert.ok(badErrors.some(e => e.includes('header-line-1-mismatch') || e.includes('header line 1 mismatch')));

    const rBad = runBin(['check', badHeaderPath]);
    assert.equal(rBad.code, 2, 'altered header check must exit 2');
    assertUpperTokens(rBad.stdout);
    assert.match(rBad.stdout, /INVALID line=1/);
    assert.match(rBad.stdout, /SUMMARY lines=\d+ signals=\d+ invalid=1/);
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});

test('AC-2: Negative fixtures fail with exact line numbers and no silent pass-through', () => {
  const expectations = [
    { file: 'wrong-separator.md', line: 5 },
    { file: 'extra-field.md', line: 5 },
    { file: 'missing-field.md', line: 5 },
    { file: 'unknown-type.md', line: 5 },
    { file: 'bad-date.md', line: 5 },
    { file: 'bad-cost.md', line: 5 },
    { file: 'bad-disposition.md', line: 5 },
    { file: 'dotdot-path.md', line: 5 },
    { file: 'immutable-field.md', line: 6 }
  ];

  for (const { file, line } of expectations) {
    const filePath = path.join(FIXTURES_DIR, file);
    assert.ok(fs.existsSync(filePath), `fixture ${file} must exist`);

    // Library validation
    const errors = signals.validateFile(filePath);
    assert.ok(errors.length > 0, `fixture ${file} must report errors`);
    assert.ok(
      errors.some(e => e.startsWith(`line ${line}:`)),
      `fixture ${file} error must name line ${line}: got ${JSON.stringify(errors)}`
    );

    // CLI validation
    const r = runBin(['check', filePath]);
    assert.equal(r.code, 2, `fixture ${file} check must exit 2`);
    assertUpperTokens(r.stdout);
    assert.match(
      r.stdout,
      new RegExp(`INVALID line=${line} error=`),
      `fixture ${file} output must match INVALID line=${line}`
    );
    assert.match(r.stdout, /SUMMARY lines=\d+ signals=\d+ invalid=\d+/);
  }
});

test('AC-3: add assigns sequential IDs; update appends and list reflects; unknown id exits 1', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'signals-ac3-'));
  const ledgerPath = path.join(tmpDir, 'SIGNALS.md');

  try {
    const today = new Date().toISOString().split('T')[0];
    const datePrefix = `sig-${today.replace(/-/g, '')}-`;

    // 1. Add first signal
    const r1 = runBin([
      'add',
      '--file', ledgerPath,
      '--type', 'procedure-gap',
      '--participant', 'gemini',
      '--evidence', 'docs/specs/test.md',
      '--cost', 'unknown'
    ]);
    assert.equal(r1.code, 0);
    assertUpperTokens(r1.stdout);
    assert.match(r1.stdout, new RegExp(`ADDED id=${datePrefix}001`));

    // 2. Add second signal
    const r2 = runBin([
      'add',
      '--file', ledgerPath,
      '--type', 'fall',
      '--participant', 'claude',
      '--evidence', 'docs/ops/RUNS.jsonl#R-100',
      '--cost', 'minutes=5'
    ]);
    assert.equal(r2.code, 0);
    assertUpperTokens(r2.stdout);
    assert.match(r2.stdout, new RegExp(`ADDED id=${datePrefix}002`));

    // 3. Update first signal
    const rUpdate = runBin([
      'update', `${datePrefix}001`,
      '--file', ledgerPath,
      '--disposition', 'procedure:P-L2-006',
      '--rc', 'rc-test',
      '--batch', 'B1'
    ]);
    assert.equal(rUpdate.code, 0);
    assertUpperTokens(rUpdate.stdout);
    assert.match(rUpdate.stdout, new RegExp(`UPDATED id=${datePrefix}001`));

    // Check ledger content directly: update must append a line, keeping earlier line intact
    const rawLines = fs.readFileSync(ledgerPath, 'utf8').split('\n').filter(l => l.startsWith('Signal: '));
    assert.equal(rawLines.length, 3, 'ledger must have 3 signal lines');
    assert.ok(rawLines[0].includes('disposition=open') || rawLines[0].includes('| open |'));
    assert.ok(rawLines[2].includes('procedure:P-L2-006'));

    // 4. List signals: must show latest states
    const rList = runBin(['list', '--file', ledgerPath]);
    assert.equal(rList.code, 0);
    assertUpperTokens(rList.stdout);
    assert.match(rList.stdout, new RegExp(`SIGNAL id=${datePrefix}001 type=procedure-gap .* disposition=procedure:P-L2-006 rc=rc-test batch=B1`));
    assert.match(rList.stdout, new RegExp(`SIGNAL id=${datePrefix}002 type=fall .* disposition=open`));

    // 5. Update unknown id exits 1
    const rBadUpdate = runBin([
      'update', `${datePrefix}999`,
      '--file', ledgerPath,
      '--disposition', 'closed:DEC-0001'
    ]);
    assert.equal(rBadUpdate.code, 1);
    assertUpperTokens(rBadUpdate.stdout);
    assert.match(rBadUpdate.stdout, new RegExp(`ERROR reason=unknown-id id=${datePrefix}999`));
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});

test('AC-4: Concurrency: two processes adding 50 signals each produce 100 valid lines with 100 distinct IDs', async () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'signals-ac4-'));
  const ledgerPath = path.join(tmpDir, 'SIGNALS.md');

  try {
    // Initialize ledger header
    const rInit = runBin(['init', ledgerPath]);
    assert.equal(rInit.code, 0);

    const workerScript = path.join(tmpDir, 'worker.cjs');
    fs.writeFileSync(workerScript, `
const signals = require(${JSON.stringify(BIN_PATH)});
const ledgerPath = process.argv[2];
const workerId = process.argv[3];

(async () => {
  for (let i = 0; i < 50; i++) {
    signals.addSignal(ledgerPath, {
      type: 'procedure-gap',
      participant: 'worker-' + workerId,
      evidence: 'docs/specs/test.md:' + i,
      cost: 'unknown',
      disposition: 'open'
    });
  }
})();
`, 'utf8');

    const p1 = fork(workerScript, [ledgerPath, '1'], { stdio: 'inherit' });
    const p2 = fork(workerScript, [ledgerPath, '2'], { stdio: 'inherit' });

    const [code1, code2] = await Promise.all([
      new Promise(resolve => p1.on('exit', resolve)),
      new Promise(resolve => p2.on('exit', resolve))
    ]);

    assert.equal(code1, 0, 'worker 1 must exit 0');
    assert.equal(code2, 0, 'worker 2 must exit 0');

    // Verify ledger
    const checkErrors = signals.validateFile(ledgerPath);
    assert.deepEqual(checkErrors, [], 'concurrently populated ledger must have 0 validation errors');

    const ledgerMap = signals.readLedger(ledgerPath);
    assert.equal(ledgerMap.size, 100, 'ledger must contain exactly 100 distinct signal ids');

    const rawLines = fs.readFileSync(ledgerPath, 'utf8').split('\n').filter(l => l.startsWith('Signal: '));
    assert.equal(rawLines.length, 100, 'ledger must contain exactly 100 signal lines');
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});

test('AC-5: Stale lock removal with WARN row; busy lock timeout exits 1 ledger-busy', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'signals-ac5-'));
  const ledgerPath = path.join(tmpDir, 'SIGNALS.md');

  try {
    runBin(['init', ledgerPath]);

    const runtimeDir = path.join(tmpDir, 'runtime');
    fs.mkdirSync(runtimeDir, { recursive: true });
    const lockPath = path.join(runtimeDir, 'SIGNALS.md.lock');

    // 1. Stale lock with dead PID
    const deadPid = 9999999;
    fs.writeFileSync(lockPath, String(deadPid), 'utf8');

    const rStale = runBin([
      'add',
      '--file', ledgerPath,
      '--type', 'fall',
      '--participant', 'gemini',
      '--evidence', 'docs/specs/test.md',
      '--cost', 'unknown'
    ]);
    assert.equal(rStale.code, 0, 'add must recover from stale lock and exit 0');
    assertUpperTokens(rStale.stdout);
    assert.match(rStale.stdout, new RegExp(`WARN reason=stale-lock pid=${deadPid}`));
    assert.match(rStale.stdout, /ADDED id=/);
    assert.equal(fs.existsSync(lockPath), false, 'lock must be released after completion');

    // 2. Live lock with current process PID causes timeout and exit 1
    fs.writeFileSync(lockPath, String(process.pid), 'utf8');
    const rBusy = runBin([
      'add',
      '--file', ledgerPath,
      '--lock-timeout', '150',
      '--type', 'fall',
      '--participant', 'gemini',
      '--evidence', 'docs/specs/test.md',
      '--cost', 'unknown'
    ]);
    assert.equal(rBusy.code, 1, 'add on live lock must exit 1');
    assertUpperTokens(rBusy.stdout);
    assert.match(rBusy.stdout, /ERROR reason=ledger-busy/);

    // Clean up lock
    try { fs.unlinkSync(lockPath); } catch {}
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});

test('AC-6: import on fixture repository with pipe, dash, id-prefixed lines, duplicates, and skipped lines', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'signals-ac6-'));

  try {
    // Setup fixture git repo
    spawnSync('git', ['init'], { cwd: tmpDir });
    spawnSync('git', ['config', 'user.name', 'TestAgent'], { cwd: tmpDir });
    spawnSync('git', ['config', 'user.email', 'test@example.com'], { cwd: tmpDir });

    const aiDir = path.join(tmpDir, '.ai');
    const worklogDir = path.join(aiDir, 'worklog');
    fs.mkdirSync(worklogDir, { recursive: true });

    const archivePath = path.join(aiDir, 'ARCHIVE.md');
    const journalPath = path.join(worklogDir, 'agent-test.md');
    const signalsPath = path.join(aiDir, 'SIGNALS.md');

    // 3 valid interim forms:
    // 1) pipe form
    // 2) dash form
    // 3) id-prefixed form
    // Plus 2 invalid forms: type-unknown, date-unknown
    const archiveContent = [
      '# Archive',
      '',
      '## 2026-09-21 - Test section',
      'Agent: gemini',
      '',
      'Signal: procedure-gap | 2026-09-20 | claude | .ai/worklog/claude-1.md:10 | unknown | open',
      '- Signal: script-candidate - 2026-09-21 - gemini - docs/specs/test.md - minutes=15 - open',
      'Signal: weird-type | 2026-09-23 | mimo | docs/specs/test.md | unknown | open'
    ].join('\n') + '\n';

    const journalContent = [
      '# Worklog',
      '',
      'Signal: sig-local-001 | fall | 2026-09-22 | qwen | docs/ops/RUNS.jsonl#R-1 | minutes=3 | open',
      'Signal: fall | 2026-99-99 | mistral | docs/ops/RUNS.jsonl#R-2 | unknown | open'
    ].join('\n') + '\n';

    fs.writeFileSync(archivePath, archiveContent, 'utf8');
    fs.writeFileSync(journalPath, journalContent, 'utf8');

    spawnSync('git', ['add', '.'], { cwd: tmpDir });
    spawnSync('git', ['commit', '-m', 'initial fixture corpus'], { cwd: tmpDir });

    const archiveBefore = fs.readFileSync(archivePath, 'utf8');
    const journalBefore = fs.readFileSync(journalPath, 'utf8');

    // First import
    const rImport1 = runBin(['import', '--file', signalsPath], { cwd: tmpDir });
    assertUpperTokens(rImport1.stdout);
    assert.equal(rImport1.code, 1, 'import with skipped lines must exit 1');
    assert.match(rImport1.stdout, /SUMMARY found=5 imported=3 duplicate=0 skipped=2/);
    assert.match(rImport1.stdout, /SKIPPED reason=type-unknown path=\.ai\/ARCHIVE\.md line=8/);
    assert.match(rImport1.stdout, /SKIPPED reason=date-unknown path=\.ai\/worklog\/agent-test\.md line=4/);

    // Verify no journal or ARCHIVE byte changes
    assert.equal(fs.readFileSync(archivePath, 'utf8'), archiveBefore, 'ARCHIVE.md bytes must not change');
    assert.equal(fs.readFileSync(journalPath, 'utf8'), journalBefore, 'journal bytes must not change');

    // Second import: imports 0
    const rImport2 = runBin(['import', '--file', signalsPath], { cwd: tmpDir });
    assertUpperTokens(rImport2.stdout);
    assert.equal(rImport2.code, 1);
    assert.match(rImport2.stdout, /SUMMARY found=5 imported=0 duplicate=3 skipped=2/);

    // Move a line from journal into ARCHIVE, commit, run import
    const movedLine = 'Signal: sig-local-001 | fall | 2026-09-22 | qwen | docs/ops/RUNS.jsonl#R-1 | minutes=3 | open\n';
    fs.appendFileSync(archivePath, movedLine, 'utf8');
    // Remove it from journal
    fs.writeFileSync(journalPath, journalContent.replace(movedLine, ''), 'utf8');

    spawnSync('git', ['add', '.'], { cwd: tmpDir });
    spawnSync('git', ['commit', '-m', 'move line to archive'], { cwd: tmpDir });

    const rImport3 = runBin(['import', '--file', signalsPath], { cwd: tmpDir });
    assertUpperTokens(rImport3.stdout);
    assert.match(rImport3.stdout, /DUPLICATE src=[0-9a-f]{64} path=\.ai\/ARCHIVE\.md line=/);
    assert.match(rImport3.stdout, /SUMMARY found=5 imported=0 duplicate=3 skipped=2/);
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});

test('AC-7: plan --batch B1 --stamp then plan --batch B2 prints ESCALATE for open signal, not closed', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'signals-ac7-'));
  const ledgerPath = path.join(tmpDir, 'SIGNALS.md');

  try {
    runBin(['init', ledgerPath]);

    // Add signal 1 (stays open)
    const id1 = signals.addSignal(ledgerPath, {
      type: 'procedure-gap',
      participant: 'gemini',
      evidence: 'docs/specs/test1.md',
      cost: 'unknown',
      disposition: 'open'
    });

    // Add signal 2 (will be closed)
    const id2 = signals.addSignal(ledgerPath, {
      type: 'script-candidate',
      participant: 'claude',
      evidence: 'docs/specs/test2.md',
      cost: 'minutes=10',
      disposition: 'open'
    });

    // Plan B1 with stamp
    const rPlan1 = runBin(['plan', '--file', ledgerPath, '--batch', 'B1', '--stamp']);
    assert.equal(rPlan1.code, 0);
    assertUpperTokens(rPlan1.stdout);
    assert.match(rPlan1.stdout, new RegExp(`STAMPED id=${id1} batch=B1`));
    assert.match(rPlan1.stdout, new RegExp(`STAMPED id=${id2} batch=B1`));
    // No escalation yet
    assert.doesNotMatch(rPlan1.stdout, /ESCALATE/);

    // Close signal 2 in between
    signals.updateSignal(ledgerPath, id2, { disposition: 'closed:DEC-0001' });

    // Plan B2
    const rPlan2 = runBin(['plan', '--file', ledgerPath, '--batch', 'B2']);
    assert.equal(rPlan2.code, 0);
    assertUpperTokens(rPlan2.stdout);
    assert.match(rPlan2.stdout, new RegExp(`ESCALATE id=${id1} batches=B1,B2`));
    assert.doesNotMatch(rPlan2.stdout, new RegExp(`ESCALATE id=${id2}`));
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});

test('AC-8: count and export --json agree with list on golden ledger', () => {
  const goldenPath = path.join(FIXTURES_DIR, 'golden.md');

  // 1. List
  const rList = runBin(['list', goldenPath]);
  assert.equal(rList.code, 0);
  assertUpperTokens(rList.stdout);
  const listLines = rList.stdout.split('\n').filter(l => l.startsWith('SIGNAL '));
  assert.equal(listLines.length, 4, 'list must return 4 unique signals');

  // 2. Count
  const rCount = runBin(['count', goldenPath]);
  assert.equal(rCount.code, 0);
  assertUpperTokens(rCount.stdout);
  assert.match(rCount.stdout, /COUNT type=procedure-gap total=2 open=1/);
  assert.match(rCount.stdout, /COUNT type=script-candidate total=1 open=1/);
  assert.match(rCount.stdout, /COUNT type=fall total=1 open=1/);
  assert.match(rCount.stdout, /SUMMARY total=4 open=3/);

  // 3. Export --json
  const rExport = runBin(['export', goldenPath, '--json']);
  assert.equal(rExport.code, 0);
  const exported = JSON.parse(rExport.stdout);
  assert.equal(exported.length, 4, 'export --json must have 4 entries');

  const exportedIds = exported.map(s => s.id).sort();
  const listIds = listLines.map(l => l.match(/id=(sig-[^ ]+)/)[1]).sort();
  assert.deepEqual(exportedIds, listIds, 'exported ids must match list ids');

  // Counts agree
  const openExported = exported.filter(s => s.disposition === 'open' || s.disposition.startsWith('grouped:'));
  assert.equal(openExported.length, 3, 'open count in exported json must agree with count summary open=3');
});

test('AC-9: Every stdout line across all CLI commands matches ^[A-Z][A-Z_]*( |$)', () => {
  const goldenPath = path.join(FIXTURES_DIR, 'golden.md');

  const commands = [
    ['check', goldenPath],
    ['list', goldenPath],
    ['count', goldenPath],
    ['plan', goldenPath, '--batch', 'B1'],
    ['nonexistent-command']
  ];

  for (const cmd of commands) {
    const r = runBin(cmd);
    assertUpperTokens(r.stdout);
  }
});
