'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { repoRoot, makeProtocolFixture, run } = require('./helpers.cjs');
const hooks = require('../.ai/bin/protocol-hooks.cjs');

function archiveTool(root, args) {
  return run(process.execPath, [path.join(repoRoot, '.ai/bin/protocol-archive.cjs'), ...args,
    '--root', root], root);
}

function session(root, args) {
  return run(process.execPath, [path.join(repoRoot, '.ai/bin/protocol-session.cjs'), ...args,
    '--root', root], root);
}

const ENTRY_NEW = '## 2026-09-17 - Newest turn\n\nAgent: tester\n\nAction: Working on new turn.\n\n' +
  'Result: Clean pass.\n\nNext step: Handoff.\n\nOpen: None.\n';

const ENTRY_OLD_1 = '## 2026-09-16 - Older turn 1\n\nAgent: tester\n\nAction: First turn.\n\n' +
  'Result: Worked.\n\nNext step: Next.\n\nOpen: None.\n';

const ENTRY_OLD_2 = '## 2026-09-15 - Older turn 2\n\nAgent: tester\n\nAction: Initial turn.\n\n' +
  'Result: Initialized.\n\nNext step: Next.\n\nOpen: None.\n';

test('archive worklog moves older entries to .ai/ARCHIVE.md and preserves the newest entry', t => {
  const root = makeProtocolFixture(t);
  session(root, ['start', '--agent', 'tester', '--session', 'arch-1']);
  const paths = hooks.sessionPaths(fs.realpathSync(root), 'arch-1', 'tester');
  const journalFile = path.join(root, paths.worklog);

  // Append three entries (newest first, as AGENTS.md specifies)
  const fullContent = `# Worklog: tester\n\nSession journal.\n\n---\n\n${ENTRY_NEW}\n---\n\n${ENTRY_OLD_1}\n---\n\n${ENTRY_OLD_2}\n`;
  fs.writeFileSync(journalFile, fullContent);

  const archiveResult = archiveTool(root, ['worklog', paths.worklog, '--keep', '1']);
  assert.equal(archiveResult.status, 0, archiveResult.stderr);
  assert.match(archiveResult.stdout, /archived 2 entry\(s\)/);

  // Journal now only contains ENTRY_NEW
  const journalAfter = fs.readFileSync(journalFile, 'utf8');
  assert.match(journalAfter, /2026-09-17 - Newest turn/);
  assert.doesNotMatch(journalAfter, /2026-09-16 - Older turn 1/);
  assert.doesNotMatch(journalAfter, /2026-09-15 - Older turn 2/);

  // ARCHIVE.md now contains the two older entries with provenance header
  const archiveFile = path.join(root, '.ai', 'ARCHIVE.md');
  const archiveAfter = fs.readFileSync(archiveFile, 'utf8');
  assert.match(archiveAfter, /### From \.ai\/worklog\/tester-.*, archived/);
  assert.match(archiveAfter, /2026-09-16 - Older turn 1/);
  assert.match(archiveAfter, /2026-09-15 - Older turn 2/);
});

test('archive status reports size limits and warnings when files approach thresholds', t => {
  const root = makeProtocolFixture(t);
  const statusResult = archiveTool(root, ['status']);
  assert.equal(statusResult.status, 0, statusResult.stderr);
  assert.match(statusResult.stdout, /\.ai\/TASK\.md: \d+\/80 lines/);
  assert.match(statusResult.stdout, /\.ai\/PLAN\.md/);
  assert.match(statusResult.stdout, /\.ai\/worklog\//);
});

test('autoArchiveWorklog automatically moves older entries when line limit is exceeded', t => {
  const root = makeProtocolFixture(t);
  const archiveModule = require('../.ai/bin/protocol-archive.cjs');
  session(root, ['start', '--agent', 'tester', '--session', 'auto-arch']);
  const paths = hooks.sessionPaths(fs.realpathSync(root), 'auto-arch', 'tester');
  const journalFile = path.join(root, paths.worklog);

  // Generate content exceeding 150 lines with 2 entries
  const filler = 'Detail line.\n'.repeat(80);
  const bigEntryNew = `## 2026-09-18 - Big turn 2\n\nAgent: tester\n\nAction:\n${filler}\nResult: Pass.\n\nNext step: Handoff.\n\nOpen: None.\n`;
  const bigEntryOld = `## 2026-09-17 - Big turn 1\n\nAgent: tester\n\nAction:\n${filler}\nResult: Pass.\n\nNext step: Handoff.\n\nOpen: None.\n`;
  fs.writeFileSync(journalFile, `# Worklog\n\n${bigEntryNew}\n---\n\n${bigEntryOld}\n`);

  const linesBefore = archiveModule.getLineCount(fs.readFileSync(journalFile, 'utf8'));
  assert.ok(linesBefore > 150, `Expected > 150 lines, got ${linesBefore}`);

  // Call autoArchiveWorklog
  const didArchive = archiveModule.autoArchiveWorklog(root, paths.worklog, 150, 1);
  assert.equal(didArchive, true);

  const linesAfter = archiveModule.getLineCount(fs.readFileSync(journalFile, 'utf8'));
  assert.ok(linesAfter <= 150, `Expected <= 150 lines after auto-archiving, got ${linesAfter}`);

  // The newest entry was preserved
  const contentAfter = fs.readFileSync(journalFile, 'utf8');
  assert.match(contentAfter, /2026-09-18 - Big turn 2/);
  assert.doesNotMatch(contentAfter, /2026-09-17 - Big turn 1/);

  // ARCHIVE.md received the older entry
  const archiveText = fs.readFileSync(path.join(root, '.ai', 'ARCHIVE.md'), 'utf8');
  assert.match(archiveText, /2026-09-17 - Big turn 1/);
});

test('autoArchiveWorklog respects active lock and does not write to ARCHIVE.md concurrently', t => {
  const root = makeProtocolFixture(t);
  const archiveModule = require('../.ai/bin/protocol-archive.cjs');
  const lockModule = require('../.ai/bin/protocol-lock.cjs');
  session(root, ['start', '--agent', 'tester', '--session', 'lock-arch']);
  const paths = hooks.sessionPaths(fs.realpathSync(root), 'lock-arch', 'tester');
  const journalFile = path.join(root, paths.worklog);

  const filler = 'Detail line.\n'.repeat(80);
  const bigEntryNew = `## 2026-09-18 - Big turn 2\n\nAgent: tester\n\nAction:\n${filler}\nResult: Pass.\n\nNext step: Handoff.\n\nOpen: None.\n`;
  const bigEntryOld = `## 2026-09-17 - Big turn 1\n\nAgent: tester\n\nAction:\n${filler}\nResult: Pass.\n\nNext step: Handoff.\n\nOpen: None.\n`;
  fs.writeFileSync(journalFile, `# Worklog\n\n${bigEntryNew}\n---\n\n${bigEntryOld}\n`);

  lockModule.operate(root, 'acquire', 'other-live-session');

  const didArchive = archiveModule.autoArchiveWorklog(root, paths.worklog, 150, 1);
  assert.equal(didArchive, false, 'autoArchiveWorklog modified ARCHIVE.md while lock was held by another session');

  lockModule.operate(root, 'release', 'other-live-session');

  const didArchiveFree = archiveModule.autoArchiveWorklog(root, paths.worklog, 150, 1);
  assert.equal(didArchiveFree, true);

  const statusAfter = lockModule.operate(root, 'status');
  assert.equal(statusAfter.lock, null, 'temporary lock was not released');
});

test('archive deduplication uses exact valid entry hashes, not incidental text', t => {
  const root = makeProtocolFixture(t);
  const archiveModule = require('../.ai/bin/protocol-archive.cjs');
  const handoff = require('../.ai/bin/protocol-handoff.cjs');
  const journal = '.ai/worklog/hash-dedup.md';
  const fullPath = path.join(root, journal);

  fs.writeFileSync(fullPath, `# Worklog\n\n${ENTRY_OLD_1}\n`);
  assert.equal(run(process.execPath, [
    path.join(repoRoot, '.ai/bin/protocol-handoff.cjs'), 'record',
    '--owner', 'hash-dedup', '--quick', '--root', root,
  ], root).status, 0);
  const oldEntryHash = handoff.readEvidence(fullPath).entry;
  const oldEntry = fs.readFileSync(fullPath, 'utf8').replace(/^# Worklog\n\n/, '');
  fs.writeFileSync(fullPath, `# Worklog\n\n${ENTRY_NEW}\n---\n\n${oldEntry}`);
  assert.equal(run(process.execPath, [
    path.join(repoRoot, '.ai/bin/protocol-handoff.cjs'), 'record',
    '--owner', 'hash-dedup', '--quick', '--root', root,
  ], root).status, 0);
  const archivePath = path.join(root, '.ai/ARCHIVE.md');
  fs.writeFileSync(archivePath, `# Archive\n\nThis prose mentions ${oldEntryHash}, but is not an entry.\n`);

  archiveModule.archiveWorklog(root, journal, 1, 'hash-dedup');
  const archiveText = fs.readFileSync(archivePath, 'utf8');
  assert.match(archiveText, new RegExp(`^- entry: ${oldEntryHash} `, 'm'));
});

test('archive append is verified before pruning and retries remain idempotent', t => {
  const root = makeProtocolFixture(t);
  const archiveModule = require('../.ai/bin/protocol-archive.cjs');
  const handoff = require('../.ai/bin/protocol-handoff.cjs');
  const journal = '.ai/worklog/append-check.md';
  const fullPath = path.join(root, journal);
  fs.writeFileSync(fullPath, `# Worklog\n\n${ENTRY_OLD_1}\n`);
  assert.equal(run(process.execPath, [
    path.join(repoRoot, '.ai/bin/protocol-handoff.cjs'), 'record',
    '--owner', 'append-check', '--quick', '--root', root,
  ], root).status, 0);
  const oldEntry = fs.readFileSync(fullPath, 'utf8').replace(/^# Worklog\n\n/, '');
  fs.writeFileSync(fullPath, `# Worklog\n\n${ENTRY_NEW}\n---\n\n${oldEntry}`);
  assert.equal(run(process.execPath, [
    path.join(repoRoot, '.ai/bin/protocol-handoff.cjs'), 'record',
    '--owner', 'append-check', '--quick', '--root', root,
  ], root).status, 0);
  const content = fs.readFileSync(fullPath, 'utf8');
  const expectedHash = handoff.readEvidence(fullPath).parentEntry;
  fs.writeFileSync(fullPath, content);
  const originalRename = fs.renameSync;
  fs.renameSync = (source, target) => {
    if (target === fullPath) throw Object.assign(new Error('simulated rename failure'), { code: 'EPERM' });
    return originalRename(source, target);
  };
  try {
    assert.throws(() => archiveModule.archiveWorklog(root, journal, 1), /simulated rename failure/);
  } finally {
    fs.renameSync = originalRename;
  }
  assert.equal(fs.readFileSync(fullPath, 'utf8'), content, 'journal was pruned before rename succeeded');

  archiveModule.archiveWorklog(root, journal, 1);
  const archived = fs.readFileSync(path.join(root, '.ai/ARCHIVE.md'), 'utf8');
  const hashes = [...archiveModule.parseArchiveEntryHashes(archived)];
  assert.equal(hashes.length, 1);
  assert.equal(hashes[0], expectedHash);
  assert.equal((archived.match(new RegExp(`^- entry: ${hashes[0]} `, 'gm')) || []).length, 1);
});

test('P-4: format-2 archive round-trip preserves archived-parent marker and verifies with verify --deep', t => {
  const root = makeProtocolFixture(t);
  const archiveModule = require('../.ai/bin/protocol-archive.cjs');
  const handoff = require('../.ai/bin/protocol-handoff.cjs');
  const journal = '.ai/worklog/format2-arch.md';
  const fullPath = path.join(root, journal);

  // Write and record first turn
  fs.writeFileSync(fullPath, `# Worklog: format2-arch\n\n${ENTRY_OLD_1}\n`);
  assert.equal(run(process.execPath, [
    path.join(repoRoot, '.ai/bin/protocol-handoff.cjs'), 'record',
    '--owner', 'format2-arch', '--quick', '--root', root,
  ], root).status, 0);
  const oldEvidence = handoff.readEvidence(fullPath);
  assert.equal(oldEvidence.authenticated, true);
  const oldEntryHash = oldEvidence.entry;

  // Prepend second turn and record it
  const oldContent = fs.readFileSync(fullPath, 'utf8').replace(/^# Worklog: format2-arch\n\n/, '');
  fs.writeFileSync(fullPath, `# Worklog: format2-arch\n\n${ENTRY_NEW}\n---\n\n${oldContent}`);
  assert.equal(run(process.execPath, [
    path.join(repoRoot, '.ai/bin/protocol-handoff.cjs'), 'record',
    '--owner', 'format2-arch', '--quick', '--root', root,
  ], root).status, 0);
  const newEvidence = handoff.readEvidence(fullPath);
  assert.equal(newEvidence.parentEntry, oldEntryHash);

  // Archive keeping 1 entry (newest preserved in journal, older moved to ARCHIVE.md)
  archiveModule.archiveWorklog(root, journal, 1, 'format2-arch');

  // Verify journal has archived-parent marker matching oldEntryHash
  const journalText = fs.readFileSync(fullPath, 'utf8');
  assert.match(journalText, new RegExp(`<!-- archived-parent: ${oldEntryHash} -->`));

  // Verify ARCHIVE.md received format-2 entry with exact valid hash
  const archivePath = path.join(root, '.ai', 'ARCHIVE.md');
  const archiveText = fs.readFileSync(archivePath, 'utf8');
  assert.match(archiveText, new RegExp(`^- entry: ${oldEntryHash} `, 'm'));
  assert.match(archiveText, /- entry hash format: 2/);

  // verify --deep passes
  const verifyRes = run(process.execPath, [
    path.join(repoRoot, '.ai/bin/protocol-handoff.cjs'), 'verify',
    '--deep', '--owner', 'format2-arch', '--root', root,
  ], root);
  assert.equal(verifyRes.status, 0, verifyRes.stderr);

  // Archiving again (dedup round-trip) preserves exactly one copy and one entry label
  archiveModule.archiveWorklog(root, journal, 1, 'format2-arch');
  const archiveText2 = fs.readFileSync(archivePath, 'utf8');
  const labelMatches = archiveText2.match(new RegExp(`^- entry: ${oldEntryHash} `, 'gm')) || [];
  assert.equal(labelMatches.length, 1, 'dedup should not duplicate entry label in archive');

  // Tampering the archived entry body causes verify --deep to fail
  const tamperedArchive = archiveText2.replace('First turn.', 'Tampered first turn.');
  fs.writeFileSync(archivePath, tamperedArchive, 'utf8');
  const tamperedVerify = run(process.execPath, [
    path.join(repoRoot, '.ai/bin/protocol-handoff.cjs'), 'verify',
    '--deep', '--owner', 'format2-arch', '--root', root,
  ], root);
  assert.notEqual(tamperedVerify.status, 0);
  assert.match(tamperedVerify.stderr, /was tampered in \.ai\/ARCHIVE\.md/);
});

test('P5-F2: second batch boundary in ARCHIVE.md remains valid across archive batches and verify --deep', t => {
  const root = makeProtocolFixture(t);
  const archiveModule = require('../.ai/bin/protocol-archive.cjs');
  const handoff = require('../.ai/bin/protocol-handoff.cjs');

  const journalA = '.ai/worklog/batch-a.md';
  const fullA = path.join(root, journalA);
  const journalB = '.ai/worklog/batch-b.md';
  const fullB = path.join(root, journalB);

  // Journal A: turn 1 then turn 2
  fs.writeFileSync(fullA, `# Worklog: batch-a\n\n${ENTRY_OLD_1}\n`);
  assert.equal(run(process.execPath, [
    path.join(repoRoot, '.ai/bin/protocol-handoff.cjs'), 'record',
    '--owner', 'batch-a', '--quick', '--root', root,
  ], root).status, 0);
  const oldContentA = fs.readFileSync(fullA, 'utf8').replace(/^# Worklog: batch-a\n\n/, '');
  fs.writeFileSync(fullA, `# Worklog: batch-a\n\n${ENTRY_NEW}\n---\n\n${oldContentA}`);
  assert.equal(run(process.execPath, [
    path.join(repoRoot, '.ai/bin/protocol-handoff.cjs'), 'record',
    '--owner', 'batch-a', '--quick', '--root', root,
  ], root).status, 0);

  // Archive Journal A (first batch into ARCHIVE.md)
  archiveModule.archiveWorklog(root, journalA, 1, 'batch-a');

  // Journal B: turn 1 then turn 2
  fs.writeFileSync(fullB, `# Worklog: batch-b\n\n${ENTRY_OLD_2}\n`);
  assert.equal(run(process.execPath, [
    path.join(repoRoot, '.ai/bin/protocol-handoff.cjs'), 'record',
    '--owner', 'batch-b', '--quick', '--root', root,
  ], root).status, 0);
  const oldContentB = fs.readFileSync(fullB, 'utf8').replace(/^# Worklog: batch-b\n\n/, '');
  fs.writeFileSync(fullB, `# Worklog: batch-b\n\n${ENTRY_NEW}\n---\n\n${oldContentB}`);
  assert.equal(run(process.execPath, [
    path.join(repoRoot, '.ai/bin/protocol-handoff.cjs'), 'record',
    '--owner', 'batch-b', '--quick', '--root', root,
  ], root).status, 0);

  // Archive Journal B (second batch into ARCHIVE.md)
  archiveModule.archiveWorklog(root, journalB, 1, 'batch-b');

  // Verify archive text contains both batches
  const archivePath = path.join(root, '.ai', 'ARCHIVE.md');
  const archiveText = fs.readFileSync(archivePath, 'utf8');
  assert.match(archiveText, /### From \.ai\/worklog\/batch-a\.md/);
  assert.match(archiveText, /### From \.ai\/worklog\/batch-b\.md/);

  // Both archived boundary records must be strictly valid under archiveEntryRecords
  const records = handoff.archiveEntryRecords(archiveText);
  assert.equal(records.length, 2, 'expected exactly 2 archived records');
  assert.equal(records[0].valid, true, `boundary record ${records[0].hash} must be valid`);
  assert.equal(records[0].actualHash, records[0].hash);
  assert.equal(records[1].valid, true, `second batch record ${records[1].hash} must be valid`);
  assert.equal(records[1].actualHash, records[1].hash);

  // verify --deep passes for both journals
  const verifyA = run(process.execPath, [
    path.join(repoRoot, '.ai/bin/protocol-handoff.cjs'), 'verify',
    '--deep', '--owner', 'batch-a', '--root', root,
  ], root);
  assert.equal(verifyA.status, 0, verifyA.stderr);

  const verifyB = run(process.execPath, [
    path.join(repoRoot, '.ai/bin/protocol-handoff.cjs'), 'verify',
    '--deep', '--owner', 'batch-b', '--root', root,
  ], root);
  assert.equal(verifyB.status, 0, verifyB.stderr);

  // doctor passes
  const doc = run(process.execPath, [path.join(root, '.ai/bin/protocol.cjs'), 'doctor'], root);
  assert.equal(doc.status, 0, doc.stderr);
  assert.match(doc.stdout, /Verdict: Protocol Healthy/);
});


