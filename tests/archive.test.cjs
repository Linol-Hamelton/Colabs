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

