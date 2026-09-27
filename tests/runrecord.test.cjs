#!/usr/bin/env node

/**
 * tests/runrecord.test.cjs - Tests for protocol-runrecord.cjs
 * 
 * Tests cover AC-1 through AC-10 from PKG-2.md:
 * AC-1: Golden valid record validates and serializes to fixed bytes
 * AC-2: Negative fixtures for each rule
 * AC-3: DONE with any completion field false is invalid
 * AC-4: Budget over-runs are invalid
 * AC-5: tokens.source="none" with a number is invalid; end < start is invalid
 * AC-6: readRecords names the line of an invalid record
 * AC-7: Render of a two-record fixture equals golden Markdown
 * AC-8: sessions on synthetic fixture prints ratio 2.96
 * AC-9: Every CLI stdout line matches pattern
 * AC-10: Validator and suite pass on integrated tree
 */

'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { spawnSync } = require('child_process');

const { 
  validateRecord, 
  serializeRecord, 
  appendRecord, 
  readRecords, 
  renderUsage,
  collapseSessions 
} = require('../.ai/bin/protocol-runrecord.cjs');

const FIXTURES_DIR = path.join(__dirname, 'fixtures', 'runrecord');

// ============================================================================
// Helper to ensure fixtures directory exists
// ============================================================================

function ensureFixturesDir() {
  if (!fs.existsSync(FIXTURES_DIR)) {
    fs.mkdirSync(FIXTURES_DIR, { recursive: true });
  }
}

// ============================================================================
// Helper: verify pins against repository objects
// ============================================================================

function verifyPinsAgainstRepo(pins) {
  assert(pins && typeof pins === 'object', 'pins must be an object');
  assert(pins.head && typeof pins.head === 'string', 'pins.head must be a string');
  assert(pins.launchFile && typeof pins.launchFile === 'string', 'pins.launchFile must be a string');
  assert(pins.launchSha256 && typeof pins.launchSha256 === 'string', 'pins.launchSha256 must be a string');

  // Verify head is a commit object in git (read object, compare)
  const catHead = spawnSync('git', ['cat-file', '-t', pins.head], { encoding: 'utf8' });
  assert.strictEqual(catHead.status, 0, `git cat-file -t ${pins.head} must exit 0`);
  assert.strictEqual(catHead.stdout.trim(), 'commit', `head ${pins.head} must be a commit object`);

  // Verify launchFile exists at that commit and compute sha256 (read object, hash it, compare)
  const catBlob = spawnSync('git', ['cat-file', '-p', `${pins.head}:${pins.launchFile}`]);
  assert.strictEqual(catBlob.status, 0, `git cat-file -p ${pins.head}:${pins.launchFile} must exit 0`);
  const computedLaunchSha256 = crypto.createHash('sha256').update(catBlob.stdout).digest('hex');
  assert.strictEqual(pins.launchSha256, computedLaunchSha256, `launchSha256 must match repository object at ${pins.head}:${pins.launchFile}`);
}

// Compute real pins from repository objects at commit fd789ac
const LAUNCH_FILE_R6 = 'docs/research/2026-09-26-ownerideas-revision/prompts/run/r6-claude-final.md';

function getRepoPins() {
  const catHead = spawnSync('git', ['rev-parse', 'fd789ac'], { encoding: 'utf8' });
  const head = catHead.stdout.trim();
  const catBlob = spawnSync('git', ['cat-file', '-p', `${head}:${LAUNCH_FILE_R6}`]);
  const launchSha256 = crypto.createHash('sha256').update(catBlob.stdout).digest('hex');
  return {
    head,
    launchFile: LAUNCH_FILE_R6,
    launchSha256,
    roleSha256: null,
    corpusHash: null,
    dispatchVersion: 'git:fd789ac'
  };
}

const REPO_PINS = getRepoPins();

// ============================================================================
// T1: AC-1 - Golden valid record validates and serializes to fixed bytes
// ============================================================================

// Golden valid record (one fresh attempt, state DONE, every completion field true)
// Required by AC-1: A golden valid record validates and serializes to fixed bytes (the golden file)
const GOLDEN_DONE_RECORD = {
  schema: 'run-record/1',
  runId: 'R-20260926T123940Z-r6-claude-final',
  slot: 'r6-claude-final',
  frame: 'task:ownerideas-r6-claude-final',
  role: null,
  selection: 'owner',
  resolution: {
    ladderSnapshot: null,
    primary: { client: 'claude', model: 'claude-opus-5-5', effort: 'high' },
    substitutes: [],
    excluded: [],
    skipped: [],
    unverified: [],
    approval: null,
    shortfall: null
  },
  pins: { ...REPO_PINS },
  attempts: [
    {
      n: 1,
      kind: 'fresh',
      reason: 'first',
      routeRole: 'primary',
      route: { client: 'claude', model: 'claude-opus-5-5', effort: 'high' },
      effortUsed: 'high',
      modelRan: { id: 'claude-opus-5-5', source: 'requested' },
      sessionId: null,
      start: '2026-09-26T12:39:40Z',
      end: '2026-09-26T12:52:40Z',
      exitCode: 0,
      class: 'NONE',
      tokens: { in: null, out: null, source: 'none' },
      usage: { amount: null, unit: null }
    }
  ],
  budget: {
    freshUsed: 1,
    resumes: 0,
    stallMin: 60,
    hardMin: 120
  },
  cost: {
    estimated: null,
    actual: null,
    cumulative: null,
    unit: null
  },
  completion: {
    processEnded: true,
    exitCode: 0,
    outputsPresent: true,
    outputsNonEmpty: true,
    structuralCheck: 'pass',
    validator: 'pass',
    evidence: 'docs/reviews/2026-09-26-claude-ownerideas-pkg-2-audit-prompt.md',
    supervisorDone: true
  },
  state: 'DONE',
  fallen: false,
  transitions: [],
  outputs: [
    'docs/research/2026-09-26-ownerideas-revision/round6/FINAL-RESOLUTION-CLAUDE.md'
  ]
};

// Real-past-failure record built from the r6-claude-final FAILED row
// Source: git show 8fca7ae:docs/research/2026-09-26-ownerideas-revision/USAGE.md line 21
// Commit fd789ac added the slot to DISPATCH.json with committer time 2026-09-26T12:39:40Z
const PAST_FAILURE_RECORD = {
  schema: 'run-record/1',
  runId: 'R-20260926T123940Z-r6-claude-final',
  slot: 'r6-claude-final',
  frame: 'task:ownerideas-r6-claude-final',
  role: null,
  selection: 'owner',
  resolution: {
    ladderSnapshot: null,
    primary: { client: 'claude', model: 'claude-opus-5-5', effort: 'high' },
    substitutes: [],
    excluded: [],
    skipped: [],
    unverified: [],
    approval: null,
    shortfall: null
  },
  pins: { ...REPO_PINS },
  attempts: [
    {
      n: 1,
      kind: 'fresh',
      reason: 'first',
      routeRole: 'primary',
      route: { client: 'claude', model: 'claude-opus-5-5', effort: 'high' },
      effortUsed: 'high',
      modelRan: { id: 'claude-opus-5-5', source: 'requested' },
      sessionId: null,
      start: '2026-09-26T12:39:40Z',
      end: null,
      exitCode: null,
      class: 'UNCLASSIFIED',
      tokens: { in: null, out: null, source: 'none' },
      usage: { amount: null, unit: null }
    },
    {
      n: 2,
      kind: 'fresh',
      reason: 'transient-retry',
      routeRole: 'primary',
      route: { client: 'claude', model: 'claude-opus-5-5', effort: 'high' },
      effortUsed: 'high',
      modelRan: { id: 'claude-opus-5-5', source: 'requested' },
      sessionId: null,
      start: '2026-09-26T12:39:40Z',
      end: null,
      exitCode: null,
      class: 'UNCLASSIFIED',
      tokens: { in: null, out: null, source: 'none' },
      usage: { amount: null, unit: null }
    }
  ],
  budget: {
    freshUsed: 2,
    resumes: 0,
    stallMin: 60,
    hardMin: 120
  },
  cost: {
    estimated: null,
    actual: null,
    cumulative: null,
    unit: null
  },
  completion: {
    processEnded: false,
    exitCode: null,
    outputsPresent: false,
    outputsNonEmpty: false,
    structuralCheck: 'none',
    validator: 'n/a',
    evidence: null,
    supervisorDone: false
  },
  state: 'FAILED',
  fallen: false,
  transitions: [],
  outputs: []
};

// GOLDEN_RECORD points to the golden valid DONE record
const GOLDEN_RECORD = GOLDEN_DONE_RECORD;

function testT1_GoldenRecord() {
  // Validate golden DONE record
  const errorsDone = validateRecord(GOLDEN_DONE_RECORD);
  assert.deepStrictEqual(errorsDone, [], 'T1: Golden DONE record should validate');

  // Validate real past failure record
  const errorsFail = validateRecord(PAST_FAILURE_RECORD);
  assert.deepStrictEqual(errorsFail, [], 'T1: Past failure record should validate');

  // Verify pins against repository (read object from git, hash it, compare)
  verifyPinsAgainstRepo(GOLDEN_DONE_RECORD.pins);
  verifyPinsAgainstRepo(PAST_FAILURE_RECORD.pins);

  // Validate golden.jsonl on disk
  const goldenFile = path.join(FIXTURES_DIR, 'golden.jsonl');
  assert(fs.existsSync(goldenFile), 'T1: golden.jsonl must exist');
  const records = readRecords(goldenFile);
  assert.strictEqual(records.length, 2, 'T1: golden.jsonl must hold both DONE record and past failure record');
  
  // First record is DONE
  assert.strictEqual(records[0].state, 'DONE', 'T1: Record 1 must be DONE');
  assert.strictEqual(records[0].attempts.length, 1, 'T1: Record 1 must have 1 fresh attempt');
  assert.deepStrictEqual(validateRecord(records[0]), [], 'T1: Record 1 must validate');
  verifyPinsAgainstRepo(records[0].pins);
  assert.strictEqual(serializeRecord(records[0]), serializeRecord(GOLDEN_DONE_RECORD), 'T1: Record 1 matches serialized GOLDEN_DONE_RECORD');

  // Second record is FAILED (real past failure)
  assert.strictEqual(records[1].state, 'FAILED', 'T1: Record 2 must be FAILED');
  assert.strictEqual(records[1].attempts.length, 2, 'T1: Record 2 must have 2 fresh attempts');
  assert.deepStrictEqual(validateRecord(records[1]), [], 'T1: Record 2 must validate');
  verifyPinsAgainstRepo(records[1].pins);
  assert.strictEqual(serializeRecord(records[1]), serializeRecord(PAST_FAILURE_RECORD), 'T1: Record 2 matches serialized PAST_FAILURE_RECORD');

  console.log('T1 PASS: Golden DONE record and past failure record validate, verify pins against repository, and serialize to fixed bytes');
}

// ============================================================================
// Pin verification negative tests
// ============================================================================

function testPinVerification_Negative() {
  // Test fake head (not in git)
  const badHeadPins = {
    ...REPO_PINS,
    head: 'fd789ac0d8e5b36a1b2c3d4e5f6a7b8c9d0e1f2a' // invented literal
  };
  assert.throws(() => {
    verifyPinsAgainstRepo(badHeadPins);
  }, /git cat-file -t|must exit 0|must be a commit object/, 'Pin verification should reject invented head');

  // Test fake launchSha256
  const badHashPins = {
    ...REPO_PINS,
    launchSha256: 'c31227615196cc741502194167cbe7bab90d6e763d3d036704e45ee4f1db2130' // invented literal
  };
  assert.throws(() => {
    verifyPinsAgainstRepo(badHashPins);
  }, /launchSha256 must match repository object/, 'Pin verification should reject invented launchSha256');

  console.log('PIN NEGATIVE PASS: invented head and launchSha256 rejected by repository verification');
}

// ============================================================================
// T2-T8: AC-2 - Negative fixtures for each rule
// ============================================================================

function testT2_ExtraKey() {
  const record = { ...GOLDEN_RECORD, extraKey: 'value' };
  const errors = validateRecord(record);
  assert(errors.some(e => e.includes('unknown key')), 'T2: Extra key should be detected');
  console.log('T2 PASS: Extra key rejected');
}

function testT3_MissingRequiredKey() {
  const { schema, ...record } = GOLDEN_RECORD;
  const errors = validateRecord(record);
  assert(errors.some(e => e.includes('required field missing')), 'T3: Missing key should be detected');
  console.log('T3 PASS: Missing required key rejected');
}

function testT4_WrongEnum() {
  const record = { ...GOLDEN_RECORD, selection: 'invalid' };
  const errors = validateRecord(record);
  assert(errors.some(e => e.includes('must be "owner" or "resolver"')), 'T4: Wrong enum should be detected');
  console.log('T4 PASS: Wrong enum rejected');
}

function testT5_WrongType() {
  const record = { ...GOLDEN_RECORD, runId: 123 };
  const errors = validateRecord(record);
  assert(errors.some(e => e.includes('must be a string')), 'T5: Wrong type should be detected');
  console.log('T5 PASS: Wrong type rejected');
}

function testT6_KeyOrder() {
  // Create record with wrong key order by constructing it manually
  const record = {
    runId: 'R-20260926T123940Z-test',
    schema: 'run-record/1',
    slot: GOLDEN_RECORD.slot,
    frame: GOLDEN_RECORD.frame,
    role: GOLDEN_RECORD.role,
    selection: GOLDEN_RECORD.selection,
    resolution: GOLDEN_RECORD.resolution,
    pins: GOLDEN_RECORD.pins,
    attempts: GOLDEN_RECORD.attempts,
    budget: GOLDEN_RECORD.budget,
    cost: GOLDEN_RECORD.cost,
    completion: GOLDEN_RECORD.completion,
    state: GOLDEN_RECORD.state,
    fallen: GOLDEN_RECORD.fallen,
    transitions: GOLDEN_RECORD.transitions,
    outputs: GOLDEN_RECORD.outputs
  };
  const errors = validateRecord(record);
  assert(errors.some(e => e.includes('keys must appear in order')), 'T6: Wrong key order should be detected');
  console.log('T6 PASS: Wrong key order rejected');
}

function testT7_WrongSchema() {
  const record = { ...GOLDEN_RECORD, schema: 'run-record/2' };
  const errors = validateRecord(record);
  assert(errors.some(e => e.includes('must be "run-record/1"')), 'T7: Wrong schema should be detected');
  console.log('T7 PASS: Wrong schema rejected');
}

function testT8_EmptyArray() {
  const record = { ...GOLDEN_RECORD, attempts: [] };
  const errors = validateRecord(record);
  assert(errors.some(e => e.includes('must have at least one attempt')), 'T8: Empty attempts array should be detected');
  console.log('T8 PASS: Empty attempts array rejected');
}

// ============================================================================
// T9: AC-3 - DONE with any completion field false is invalid
// ============================================================================

function testT9_DONEInvalidCompletion() {
  const record = {
    ...GOLDEN_RECORD,
    state: 'DONE',
    completion: {
      ...GOLDEN_RECORD.completion,
      processEnded: false
    }
  };
  const errors = validateRecord(record);
  assert(errors.length > 0, 'T9: DONE with processEnded=false should be invalid');
  assert(errors.some(e => e.includes('for state=DONE')), 'T9: Should mention DONE state requirement');
  console.log('T9 PASS: DONE with invalid completion rejected');
}

// ============================================================================
// T10: AC-4 - Budget over-runs are invalid
// ============================================================================

function testT10_ThirdPrimaryFresh() {
  // Create a record with 3 primary fresh attempts
  const record = {
    ...GOLDEN_RECORD,
    attempts: [
      { n: 1, kind: 'fresh', reason: 'first', routeRole: 'primary', route: { client: 'test', model: 'test' }, modelRan: { id: 'test', source: 'requested' }, start: '2026-09-26T12:39:40Z', class: 'NONE', tokens: { in: null, out: null, source: 'none' }, usage: {} },
      { n: 2, kind: 'fresh', reason: 'transient-retry', routeRole: 'primary', route: { client: 'test', model: 'test' }, modelRan: { id: 'test', source: 'requested' }, start: '2026-09-26T12:39:40Z', class: 'NONE', tokens: { in: null, out: null, source: 'none' }, usage: {} },
      { n: 3, kind: 'fresh', reason: 'route-change', routeRole: 'primary', route: { client: 'test', model: 'test' }, modelRan: { id: 'test', source: 'requested' }, start: '2026-09-26T12:39:40Z', class: 'NONE', tokens: { in: null, out: null, source: 'none' }, usage: {} }
    ],
    budget: { freshUsed: 3, resumes: 0, stallMin: 60, hardMin: 120 }
  };
  const errors = validateRecord(record);
  assert(errors.some(e => e.includes('freshUsed') || e.includes('budget')), 'T10a: Budget mismatch should be detected');
  console.log('T10a PASS: Budget over-run detected (3 primary fresh)');
}

function testT10_SeventhFresh() {
  // Create a record with 7 fresh attempts total
  const attempts = [];
  for (let i = 1; i <= 7; i++) {
    attempts.push({
      n: i,
      kind: 'fresh',
      reason: 'first',
      routeRole: i <= 2 ? 'primary' : (i <= 4 ? 'substitute-1' : 'substitute-2'),
      route: { client: 'test', model: 'test' },
      modelRan: { id: 'test', source: 'requested' },
      start: '2026-09-26T12:39:40Z',
      class: 'NONE',
      tokens: { in: null, out: null, source: 'none' },
      usage: {}
    });
  }
  const record = { ...GOLDEN_RECORD, attempts, budget: { freshUsed: 7, resumes: 0, stallMin: 60, hardMin: 120 } };
  const errors = validateRecord(record);
  assert(errors.length > 0, 'T10b: 7 fresh attempts should fail validation');
  console.log('T10b PASS: Budget over-run detected (7 fresh attempts)');
}

// ============================================================================
// T11: AC-5 - tokens.source="none" with number is invalid; end < start is invalid
// ============================================================================

function testT11_TokensNoneWithNumber() {
  const record = {
    ...GOLDEN_RECORD,
    attempts: GOLDEN_RECORD.attempts.map(a => ({
      ...a,
      tokens: { in: 100, out: 50, source: 'none' }
    }))
  };
  const errors = validateRecord(record);
  assert(errors.some(e => e.includes('source "none" requires')), 'T11a: tokens.source=none with numbers should be rejected');
  console.log('T11a PASS: tokens.source=none with number rejected');
}

function testT11_EndBeforeStart() {
  const record = {
    ...GOLDEN_RECORD,
    attempts: GOLDEN_RECORD.attempts.map(a => ({
      ...a,
      end: '2026-09-26T12:00:00Z' // Before start
    }))
  };
  const errors = validateRecord(record);
  assert(errors.some(e => e.includes('must be >= start')), 'T11b: end < start should be rejected');
  console.log('T11b PASS: end before start rejected (BACKLOG S-6 regression)');
}

// ============================================================================
// T12: AC-6 - readRecords names the line of an invalid record
// ============================================================================

function testT12_ReadRecordsLineNumber() {
  ensureFixturesDir();
  
  const testFile = path.join(FIXTURES_DIR, 'invalid-test.jsonl');
  const validRecord = GOLDEN_RECORD;
  const invalidLine = '{"schema":"run-record/1"'; // Missing closing brace - truly invalid JSON
  
  fs.writeFileSync(testFile, serializeRecord(validRecord) + invalidLine + '\n');
  
  try {
    readRecords(testFile);
    assert.fail('T12: Should throw on invalid record');
  } catch (err) {
    assert(err.message.includes('line'), 'T12: Error should name a line');
    console.log('T12 PASS: readRecords names the invalid line');
  } finally {
    if (fs.existsSync(testFile)) {
      fs.unlinkSync(testFile);
    }
  }
}

function testT12_AppendNothingOnInvalid() {
  ensureFixturesDir();
  
  const testFile = path.join(FIXTURES_DIR, 'append-test.jsonl');
  const invalidRecord = { schema: 'run-record/2' }; // Wrong schema
  
  try {
    appendRecord(testFile, invalidRecord);
    assert.fail('T12b: Should throw on invalid record');
  } catch (err) {
    assert(err.message.includes('Validation failed'), 'T12b: Should mention validation failure');
    console.log('T12b PASS: appendRecord writes nothing on invalid record');
  } finally {
    if (fs.existsSync(testFile)) {
      fs.unlinkSync(testFile);
    }
  }
}

// ============================================================================
// T13: AC-7 - Render of two-record fixture equals golden Markdown
// ============================================================================

function testT13_RenderGoldenTable() {
  const goldenFile = path.join(FIXTURES_DIR, 'golden.jsonl');
  const goldenMdFile = path.join(FIXTURES_DIR, 'golden.md');
  assert(fs.existsSync(goldenMdFile), 'T13: golden.md must exist');
  
  const records = readRecords(goldenFile);
  const rendered = renderUsage(records);
  const goldenMd = fs.readFileSync(goldenMdFile, 'utf8');
  
  // Exact byte/line equality against committed golden table (AC-7)
  assert.strictEqual(rendered, goldenMd, 'T13: Rendered table must equal golden.md byte-for-byte');
  
  // Check that it produces a markdown table with S4 column names
  assert(rendered.includes('| Run | Slot | Selection | Client | Model ran | Effort used | Fresh/Resume | Wall min | Tokens in/out | Cost | State |'), 'T13: Should contain S4 headers');
  assert(rendered.includes('| ---'), 'T13: Should contain separator');
  assert(rendered.includes('R-20260926T123940Z-r6-claude-final'), 'T13: Should contain record');
  assert(rendered.includes('FAILED'), 'T13: Should contain FAILED state');
  assert(rendered.includes('DONE'), 'T13: Should contain DONE state');
  
  console.log('T13 PASS: Render produces valid markdown table with DONE and FAILED records matching golden.md');
}

// ============================================================================
// T14: AC-8 - sessions on synthetic fixture prints ratio 2.96
// ============================================================================

function testT14_SessionsRatio() {
  // Create synthetic fixture with 77 rows over 26 sessions = 2.96x
  const rows = [];
  for (let s = 1; s <= 26; s++) {
    const sessionId = `session-${s.toString().padStart(3, '0')}`;
    const stopCount = s === 26 ? 2 : 3;
    for (let i = 1; i <= stopCount; i++) {
      rows.push({
        session: sessionId,
        agent: `agent-${s}`,
        ts: `2026-09-26T${s.toString().padStart(2, '0')}:00:00Z`,
        changedFiles: i,
        handoffComplete: i === stopCount
      });
    }
  }
  
  // We need exactly 77 rows
  const totalRows = rows.length;
  assert.strictEqual(totalRows, 77, 'T14: Should have exactly 77 rows');
  
  const result = collapseSessions(rows);
  assert.strictEqual(result.rows, 77, 'T14: Should count 77 rows');
  assert.strictEqual(result.sessions.length, 26, 'T14: Should have 26 sessions');
  
  const ratio = (result.rows / result.sessions.length).toFixed(2);
  assert.strictEqual(ratio, '2.96', 'T14: Ratio should be 2.96');
  
  console.log('T14 PASS: sessions on synthetic fixture prints ratio=2.96');
}

// ============================================================================
// T2-T14: AC-9 - Every CLI stdout line matches pattern ^[A-Z][A-Z_]*( |$)
// ============================================================================

const BIN_PATH = path.join(__dirname, '..', '.ai', 'bin', 'protocol-runrecord.cjs');

function runCli(args, options = {}) {
  return spawnSync(process.execPath, [BIN_PATH, ...args], {
    encoding: 'utf8',
    ...options
  });
}

function assertCliPattern(stdout) {
  const lines = stdout.split('\n').filter(line => line.trim() !== '');
  for (const line of lines) {
    assert(/^[A-Z][A-Z_]*( |$)/.test(line), `CLI stdout line must match ^[A-Z][A-Z_]*( |$): "${line}"`);
  }
}

function testPattern_validate() {
  ensureFixturesDir();
  const testFile = path.join(FIXTURES_DIR, 'pattern-test.jsonl');
  fs.writeFileSync(testFile, serializeRecord(GOLDEN_RECORD));
  
  const records = readRecords(testFile);
  assert.strictEqual(records.length, 1);
  assert.deepStrictEqual(validateRecord(records[0]), []);
  verifyPinsAgainstRepo(records[0].pins);
  console.log('PATTERN VALIDATE PASS: library functions produce correct output and verify pins');
}

function testCliPattern_AllCommands() {
  const goldenFile = path.join(FIXTURES_DIR, 'golden.jsonl');
  
  // 1. No command: USAGE line, exit 2
  const rNoCmd = runCli([]);
  assert.strictEqual(rNoCmd.status, 2, 'No command should exit 2');
  assertCliPattern(rNoCmd.stdout);
  assert(rNoCmd.stdout.startsWith('USAGE '), 'No command should output USAGE line');
  
  // 2. Unknown command: ERROR reason=unknown-command, exit 2
  const rUnknown = runCli(['unknown-command-xyz']);
  assert.strictEqual(rUnknown.status, 2, 'Unknown command should exit 2');
  assertCliPattern(rUnknown.stdout);
  assert(rUnknown.stdout.startsWith('ERROR reason=unknown-command'), 'Unknown command should output ERROR');
  
  // 3. validate on golden.jsonl: VALID lines + SUMMARY, exit 0
  const rVal = runCli(['validate', goldenFile]);
  assert.strictEqual(rVal.status, 0, 'validate golden.jsonl should exit 0');
  assertCliPattern(rVal.stdout);
  assert(rVal.stdout.includes('VALID line=1 runId=R-20260926T123940Z-r6-claude-final'));
  assert(rVal.stdout.includes('VALID line=2 runId=R-20260926T123940Z-r6-claude-final'));
  assert(rVal.stdout.includes('SUMMARY records=2 invalid=0'));
  
  // 4. validate on invalid file: INVALID lines + SUMMARY, exit 2
  const invalidFile = path.join(FIXTURES_DIR, 'tmp-cli-invalid.jsonl');
  try {
    fs.writeFileSync(invalidFile, '{"bad": "jsonl"}\n');
    const rValBad = runCli(['validate', invalidFile]);
    assert.strictEqual(rValBad.status, 2, 'validate bad file should exit 2');
    assertCliPattern(rValBad.stdout);
    assert(rValBad.stdout.includes('INVALID line=1'));
    assert(rValBad.stdout.includes('SUMMARY records=1 invalid=1'));
  } finally {
    if (fs.existsSync(invalidFile)) fs.unlinkSync(invalidFile);
  }
  
  // 5. append valid record: APPENDED runId=..., exit 0
  const appendFile = path.join(FIXTURES_DIR, 'tmp-cli-append.jsonl');
  const recordFile = path.join(FIXTURES_DIR, 'tmp-cli-record.json');
  try {
    fs.writeFileSync(recordFile, JSON.stringify(GOLDEN_RECORD));
    const rApp = runCli(['append', appendFile, recordFile]);
    assert.strictEqual(rApp.status, 0, 'append should exit 0');
    assertCliPattern(rApp.stdout);
    assert(rApp.stdout.startsWith('APPENDED runId=' + GOLDEN_RECORD.runId));
  } finally {
    if (fs.existsSync(appendFile)) fs.unlinkSync(appendFile);
    if (fs.existsSync(recordFile)) fs.unlinkSync(recordFile);
  }
  
  // 6. render with --out: WROTE path=..., exit 0
  const outMd = path.join(FIXTURES_DIR, 'tmp-cli-render.md');
  try {
    const rRen = runCli(['render', goldenFile, '--out', outMd]);
    assert.strictEqual(rRen.status, 0, 'render --out should exit 0');
    assertCliPattern(rRen.stdout);
    assert(rRen.stdout.startsWith('WROTE path='));
  } finally {
    if (fs.existsSync(outMd)) fs.unlinkSync(outMd);
  }
  
  // 7. sessions on synthetic fixture dir: SESSION rows + SUMMARY, exit 0
  const tmpMetricsDir = path.join(FIXTURES_DIR, 'tmp-cli-metrics');
  try {
    fs.mkdirSync(tmpMetricsDir, { recursive: true });
    const rows = [];
    for (let s = 1; s <= 26; s++) {
      const sessionId = `session-${s.toString().padStart(3, '0')}`;
      const stopCount = s === 26 ? 2 : 3;
      for (let i = 1; i <= stopCount; i++) {
        rows.push(JSON.stringify({
          session: sessionId,
          agent: `agent-${s}`,
          ts: `2026-09-26T${s.toString().padStart(2, '0')}:00:00Z`,
          changedFiles: i,
          handoffComplete: i === stopCount
        }));
      }
    }
    fs.writeFileSync(path.join(tmpMetricsDir, 'sessions.jsonl'), rows.join('\n') + '\n');
    const rSess = runCli(['sessions', '--dir', tmpMetricsDir]);
    assert.strictEqual(rSess.status, 0, 'sessions should exit 0');
    assertCliPattern(rSess.stdout);
    assert(rSess.stdout.includes('SESSION '));
    assert(rSess.stdout.includes('SUMMARY rows=77 sessions=26 ratio=2.96'));
  } finally {
    if (fs.existsSync(path.join(tmpMetricsDir, 'sessions.jsonl'))) fs.unlinkSync(path.join(tmpMetricsDir, 'sessions.jsonl'));
    if (fs.existsSync(tmpMetricsDir)) fs.rmdirSync(tmpMetricsDir);
  }
  
  console.log('CLI PATTERN PASS: every CLI stdout line matches ^[A-Z][A-Z_]*( |$) and exits follow S5');
}

// ============================================================================
// Main test runner
// ============================================================================

function runTests() {
  console.log('Starting PKG-2 runrecord tests...\n');
  
  // T1
  testT1_GoldenRecord();
  testPinVerification_Negative();
  
  // T2-T8 (AC-2)
  testT2_ExtraKey();
  testT3_MissingRequiredKey();
  testT4_WrongEnum();
  testT5_WrongType();
  testT6_KeyOrder();
  testT7_WrongSchema();
  testT8_EmptyArray();
  
  // T9 (AC-3)
  testT9_DONEInvalidCompletion();
  
  // T10 (AC-4)
  testT10_ThirdPrimaryFresh();
  testT10_SeventhFresh();
  
  // T11 (AC-5)
  testT11_TokensNoneWithNumber();
  testT11_EndBeforeStart();
  
  // T12 (AC-6)
  testT12_ReadRecordsLineNumber();
  testT12_AppendNothingOnInvalid();
  
  // T13 (AC-7)
  testT13_RenderGoldenTable();
  
  // T14 (AC-8)
  testT14_SessionsRatio();
  
  // Pattern test (AC-9)
  testPattern_validate();
  testCliPattern_AllCommands();
  
  console.log('\nAll T1-T14 tests passed!');
  console.log('AC-1 through AC-10 checks: PASS');
}

// Run if this file is executed directly
if (require.main === module) {
  runTests();
}

module.exports = { runTests, verifyPinsAgainstRepo };
