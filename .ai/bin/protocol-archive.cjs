#!/usr/bin/env node
'use strict';

// Moves older entries from a session journal into .ai/ARCHIVE.md,
// preserving newest entries and provenance headers.
// Reports size limit status for protocol documents.

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const lockModule = require('./protocol-lock.cjs');
const hooks = require('./protocol-hooks.cjs');

function extractEntryHash(entryText) {
  const match = entryText.match(/^[ \t]*-[ \t]+entry:[ \t]*(sha256:[a-f0-9]{64})\b/m);
  if (match) {
    const clean = hooks.canonicalEntryBody(entryText);
    const actualHash = `sha256:${crypto.createHash('sha256').update(clean, 'utf8').digest('hex')}`;
    if (actualHash === match[1]) return match[1];
  }
  return null;
}

function parseArchiveEntryHashes(text) {
  const normalized = text.replace(/\r\n/g, '\n');
  const sections = normalized.split(/(?=^## )/m);
  const valid = new Set();
  for (const section of sections) {
    if (!hooks.DATE_HEADING_M_REGEX.test(section)) continue;
    const hash = extractEntryHash(section);
    if (hash) valid.add(hash);
  }
  return valid;
}

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

function atomicRename(tempFile, targetFile, retries = 5, delayMs = 50) {
  for (let i = 0; i < retries; i++) {
    try {
      fs.renameSync(tempFile, targetFile);
      return;
    } catch (err) {
      if ((err.code === 'EPERM' || err.code === 'EBUSY' || err.code === 'EACCES') && i < retries - 1) {
        Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, Math.floor(delayMs * Math.pow(1.5, i)));
        continue;
      }
      throw err;
    }
  }
}

function archiveWorklog(root, worklogPath, keep = 1, owner = null) {
  const fullWorklog = path.isAbsolute(worklogPath) ? worklogPath : path.join(root, worklogPath);
  if (!fs.existsSync(fullWorklog)) {
    throw new Error(`Worklog not found: ${fullWorklog}`);
  }

  const relativeWorklog = path.relative(root, fullWorklog).replace(/\\/g, '/');
  const content = fs.readFileSync(fullWorklog, 'utf8').replace(/\r\n/g, '\n');

  // Split into preamble and entries (entries start with ## YYYY-MM-DD)
  // Derive lookahead splitter from canonical DATE_HEADING_M_REGEX.
  const entryRegex = new RegExp('(?=' + hooks.DATE_HEADING_M_REGEX.source + ')', 'm');
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

  let lockAcquired = false;
  let tempOwner = null;
  const lockStatus = lockModule.operate(root, 'status');
  if (lockStatus.lock) {
    if (owner && lockStatus.lock.owner === owner) {
      lockAcquired = false;
    } else {
      throw new Error(`Cannot archive: shared documents lock is held by session ${lockStatus.lock.owner}`);
    }
  } else {
    tempOwner = owner || ('archive-' + Math.random().toString(16).slice(2, 10));
    lockModule.operate(root, 'acquire', tempOwner);
    lockAcquired = true;
  }

  let tempFile = null;
  try {
    // Idempotent append: skip entries whose entry hash already exists in ARCHIVE.md.
    // This prevents duplicates when a previous run appended successfully but the
    // journal rename failed, causing a retry to re-archive the same entries.
    const existingArchive = fs.readFileSync(archiveFile, 'utf8');
    const existingHashes = parseArchiveEntryHashes(existingArchive);
    const filteredArchive = cleanToArchive.filter(entry => {
      const hash = extractEntryHash(entry);
      return !hash || !existingHashes.has(hash);
    });

    // Extract entry hash of the newest archived entry from the clean archived text
    const archivedHash = cleanToArchive.length > 0 ? extractEntryHash(cleanToArchive[0]) : null;

    // Prepare the new journal content FIRST (tmp file), before touching ARCHIVE.md.
    let cleanPreamble = preamble
      .replace(/<!-- archived-parent:\s*sha256:[a-f0-9]{64} -->\s*/g, '')
      .replace(/\n-{3,}\s*$/, '')
      .trim();
    if (archivedHash) {
      cleanPreamble += `\n\n<!-- archived-parent: ${archivedHash} -->`;
    }
    if (cleanPreamble.length > 0) cleanPreamble += '\n\n---\n\n';

    const cleanKept = keptEntries.map(entry => entry.replace(/\n-{3,}\s*$/, '').trim());
    const newJournalContent = cleanPreamble + cleanKept.join('\n\n---\n\n') + '\n';

    // Write trimmed journal to tmp file first
    const runtimeDir = path.join(root, '.ai', 'runtime');
    fs.mkdirSync(runtimeDir, { recursive: true });
    tempFile = path.join(runtimeDir, `worklog-atomic-${Date.now()}-${Math.random().toString(36).slice(2, 6)}.tmp`);
    fs.writeFileSync(tempFile, newJournalContent, 'utf8');

    // Now append to ARCHIVE.md (only entries not already present)
    if (filteredArchive.length > 0) {
      const archiveAddition = `\n---\n\n${provenanceHeader}\n\n` + filteredArchive.join('\n\n---\n\n') + '\n';
      fs.appendFileSync(archiveFile, archiveAddition, 'utf8');

      // Read back the append before replacing the journal. A failed rename
      // must leave the journal intact, while a successful append must be
      // provably present for the next idempotent retry.
      const archiveAfter = fs.readFileSync(archiveFile, 'utf8');
      if (!archiveAfter.endsWith(archiveAddition)) {
        throw new Error('Archive append could not be verified; journal was not pruned.');
      }
      const archiveHashes = parseArchiveEntryHashes(archiveAfter);
      for (const entry of filteredArchive) {
        const hash = extractEntryHash(entry);
        if (hash && !archiveHashes.has(hash)) {
          throw new Error(`Archive append is missing verified entry ${hash}; journal was not pruned.`);
        }
      }
    }

    // Finally rename the tmp journal over the original
    atomicRename(tempFile, fullWorklog);
    console.log(`archived ${toArchive.length} entry(s) from ${relativeWorklog} to .ai/ARCHIVE.md`);
  } finally {
    if (lockAcquired && tempOwner) {
      try { lockModule.operate(root, 'release', tempOwner); } catch (_) {}
    }
    if (tempFile && fs.existsSync(tempFile)) {
      try { fs.unlinkSync(tempFile); } catch (_) {}
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
      process.stderr.write(`[WARN] autoArchiveWorklog skipped: ${err.message}\n`);
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

module.exports = {
  archiveWorklog, archiveStatus, autoArchiveWorklog, getLineCount,
  extractEntryHash, parseArchiveEntryHashes,
};
