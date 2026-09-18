#!/usr/bin/env node
'use strict';

// Moves older entries from a session journal into .ai/ARCHIVE.md,
// preserving newest entries and provenance headers.
// Reports size limit status for protocol documents.

const fs = require('node:fs');
const path = require('node:path');
const lockModule = require('./protocol-lock.cjs');

function parseArgs(argv) {
  const command = argv[0];
  const options = { keep: 1, root: process.cwd(), owner: null };
  let target = null;

  for (let i = 1; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--keep') {
      const val = argv[++i];
      if (!val || isNaN(parseInt(val, 10))) throw new Error('Missing or invalid value for --keep');
      options.keep = parseInt(val, 10);
    } else if (arg === '--root') {
      const val = argv[++i];
      if (!val) throw new Error('Missing value for --root');
      options.root = val;
    } else if (arg === '--owner') {
      const val = argv[++i];
      if (!val) throw new Error('Missing value for --owner');
      options.owner = val;
    } else if (!target && !arg.startsWith('--')) {
      target = arg;
    } else {
      throw new Error(`Unknown option: ${arg}`);
    }
  }

  if (!['worklog', 'status'].includes(command)) {
    throw new Error('Usage: protocol-archive.cjs worklog <path> [--keep <n>] [--root <dir>]\n       protocol-archive.cjs status [--root <dir>]');
  }

  if (command === 'worklog' && !target) {
    throw new Error('Usage: protocol-archive.cjs worklog <path> [--keep <n>] [--root <dir>]');
  }

  return { command, target, options };
}

function getLineCount(text) {
  if (!text || text.length === 0) return 0;
  const matches = text.match(/\n/g);
  let count = matches ? matches.length : 0;
  if (!text.endsWith('\n')) count++;
  return count;
}

function archiveWorklog(root, worklogPath, keep = 1, owner = null) {
  const fullWorklog = path.isAbsolute(worklogPath) ? worklogPath : path.join(root, worklogPath);
  if (!fs.existsSync(fullWorklog)) {
    throw new Error(`Worklog not found: ${fullWorklog}`);
  }

  const relativeWorklog = path.relative(root, fullWorklog).replace(/\\/g, '/');
  const content = fs.readFileSync(fullWorklog, 'utf8').replace(/\r\n/g, '\n');

  // Split into preamble and entries (entries start with ## YYYY-MM-DD)
  const entryRegex = /(?=^## \d{4}-\d{2}-\d{2} - )/m;
  const matchIndex = content.search(entryRegex);

  if (matchIndex === -1) {
    console.log(`archived 0 entry(s) from ${relativeWorklog}`);
    return;
  }

  const preamble = content.slice(0, matchIndex);
  const entriesBody = content.slice(matchIndex);
  // Split entries
  const rawEntries = entriesBody.split(entryRegex).filter(e => e.trim().length > 0);

  if (rawEntries.length <= keep) {
    console.log(`archived 0 entry(s) from ${relativeWorklog} (${rawEntries.length} total, keeping ${keep})`);
    return;
  }

  const keptEntries = rawEntries.slice(0, keep);
  const toArchive = rawEntries.slice(keep);

  // Clean each entry of trailing separator lines
  const cleanToArchive = toArchive.map(entry => {
    return entry.replace(/\n-{3,}\s*$/, '').trim();
  });

  const archiveFile = path.join(root, '.ai', 'ARCHIVE.md');
  if (!fs.existsSync(archiveFile)) {
    throw new Error(`ARCHIVE.md not found at ${archiveFile}`);
  }

  const dateStamp = new Date().toISOString().split('T')[0];
  const provenanceHeader = `### From ${relativeWorklog}, archived ${dateStamp}`;

  const archiveAddition = `\n---\n\n${provenanceHeader}\n\n` + cleanToArchive.join('\n\n---\n\n') + '\n';

  let lockAcquired = false;
  let tempOwner = null;
  const lockStatus = lockModule.operate(root, 'status');
  if (lockStatus.lock) {
    if (owner && lockStatus.lock.owner === owner) {
      lockAcquired = false;
    } else if (lockStatus.lock.alive === true) {
      throw new Error(`Cannot archive: .ai/ARCHIVE.md is locked by active session ${lockStatus.lock.owner}`);
    } else if (lockStatus.lock.alive === false) {
      lockModule.operate(root, 'clear-lock', null, true);
      tempOwner = owner || ('archive-' + Math.random().toString(16).slice(2, 10));
      lockModule.operate(root, 'acquire', tempOwner);
      lockAcquired = true;
    } else {
      throw new Error(`Cannot archive: .ai/ARCHIVE.md is locked by session ${lockStatus.lock.owner}`);
    }
  } else {
    tempOwner = owner || ('archive-' + Math.random().toString(16).slice(2, 10));
    lockModule.operate(root, 'acquire', tempOwner);
    lockAcquired = true;
  }

  try {
    fs.appendFileSync(archiveFile, archiveAddition, 'utf8');

    // Rewrite journal with kept entries
    let cleanPreamble = preamble.replace(/\n-{3,}\s*$/, '').trim();
    if (cleanPreamble.length > 0) cleanPreamble += '\n\n---\n\n';

    const cleanKept = keptEntries.map(entry => entry.replace(/\n-{3,}\s*$/, '').trim());
    const newJournalContent = cleanPreamble + cleanKept.join('\n\n---\n\n') + '\n';

    fs.writeFileSync(fullWorklog, newJournalContent, 'utf8');
    console.log(`archived ${toArchive.length} entry(s) from ${relativeWorklog} to .ai/ARCHIVE.md`);
  } finally {
    if (lockAcquired && tempOwner) {
      try { lockModule.operate(root, 'release', tempOwner); } catch (_) {}
    }
  }
}

function archiveStatus(root) {
  // Kept in step with validate-protocol.ps1. When these two disagreed,
  // `status` reported a limit the validator did not enforce.
  const limits = {
    '.ai/TASK.md': 80,
    '.ai/PLAN.md': 200,
    '.ai/worklog': { fileLimit: 30, lineLimit: 150 }
  };

  console.log('AI Collaboration Protocol - Storage & Archiving Status');
  console.log(`Root: ${root}`);

  const taskFile = path.join(root, '.ai', 'TASK.md');
  if (fs.existsSync(taskFile)) {
    const lines = getLineCount(fs.readFileSync(taskFile, 'utf8'));
    console.log(`.ai/TASK.md: ${lines}/${limits['.ai/TASK.md']} lines`);
  }

  const planFile = path.join(root, '.ai', 'PLAN.md');
  if (fs.existsSync(planFile)) {
    const lines = getLineCount(fs.readFileSync(planFile, 'utf8'));
    console.log(`.ai/PLAN.md: ${lines}/${limits['.ai/PLAN.md']} lines`);
  }

  const worklogDir = path.join(root, '.ai', 'worklog');
  if (fs.existsSync(worklogDir)) {
    const files = fs.readdirSync(worklogDir).filter(f => f.endsWith('.md') && f !== 'README.md');
    console.log(`.ai/worklog/: ${files.length}/${limits['.ai/worklog'].fileLimit} files`);
    for (const f of files) {
      const full = path.join(worklogDir, f);
      const lines = getLineCount(fs.readFileSync(full, 'utf8'));
      if (lines >= 100) {
        console.log(`  .ai/worklog/${f}: ${lines}/${limits['.ai/worklog'].lineLimit} lines`);
      }
    }
  }
}

function autoArchiveWorklog(root, worklogPath, maxLines = 150, keep = 1, owner = null) {
  const fullWorklog = path.isAbsolute(worklogPath) ? worklogPath : path.join(root, worklogPath);
  if (!fs.existsSync(fullWorklog)) return false;
  const content = fs.readFileSync(fullWorklog, 'utf8');
  if (getLineCount(content) > maxLines) {
    try {
      archiveWorklog(root, worklogPath, keep, owner);
      return true;
    } catch (err) {
      console.warn(`[archive] autoArchiveWorklog skipped: ${err.message}`);
      return false;
    }
  }
  return false;
}

function main() {
  const { command, target, options } = parseArgs(process.argv.slice(2));
  const root = fs.realpathSync(options.root);

  if (command === 'worklog') {
    archiveWorklog(root, target, options.keep, options.owner);
  } else if (command === 'status') {
    archiveStatus(root);
  }
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

module.exports = { archiveWorklog, archiveStatus, autoArchiveWorklog, getLineCount };
