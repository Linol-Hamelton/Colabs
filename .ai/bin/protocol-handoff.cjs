#!/usr/bin/env node
'use strict';

// Attaches verifiable evidence to a session journal entry.
//
// The protocol used to transfer assertions: an agent wrote "the suite passes"
// and the next agent had no way to check. This records what actually ran, the
// exact tree it ran against, and lets anyone re-verify later.
//
//   record  --owner <session> [--journal <path>] [--quick]
//   verify  [--journal <path>]
//   rehash  --owner <session> --reason <text> [--journal <path>]
//   state
//
// record exits non-zero when a check fails, so a red tree cannot produce a
// green receipt.

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { spawnSync } = require('node:child_process');
const hooks = require('./protocol-hooks.cjs');
const archive = require('./protocol-archive.cjs');

const CHECKS = [
  { name: 'validate-protocol.ps1', quick: true },
  { name: 'test-protocol.ps1', quick: false },
];

function checksFor(root, quick) {
  let manifest;
  try { manifest = JSON.parse(fs.readFileSync(path.join(root, 'protocol-manifest.json'), 'utf8')); }
  catch (error) { throw new Error(`Cannot read protocol manifest: ${error.message}`); }
  if (!manifest || typeof manifest !== 'object' || Array.isArray(manifest)) {
    throw new Error('Protocol manifest must be a JSON object.');
  }
  // Older manifests had no role and shipped the source suite. Do not treat
  // that absence, an unknown role, or a missing script as an installed runtime.
  const role = Object.hasOwn(manifest, 'role') ? manifest.role : 'source';
  if (!['source', 'installed'].includes(role)) {
    throw new Error('Protocol manifest role must be source or installed.');
  }
  const checks = CHECKS.filter(check => (role !== 'installed' || check.quick) && (!quick || check.quick)).map(c => ({ ...c }));
  if (!quick && manifest.testCommand && typeof manifest.testCommand === 'string' && manifest.testCommand.trim()) {
    checks.push({ name: manifest.testCommand.trim(), quick: false, isCustom: true });
  }
  return checks;
}

function git(root, args) {
  const result = spawnSync('git', ['-C', root, ...args], {
    encoding: 'utf8', windowsHide: true, timeout: 30000,
  });
  if (result.error || result.status !== 0) {
    throw new Error(`git ${args[0]} failed: ${result.error?.message || (result.stderr || '').trim()}`);
  }
  return result.stdout;
}

// The anchor identifies the exact state the evidence describes. A commit alone
// is not enough: most protocol work is uncommitted when it is handed over.
function anchor(root) {
  let head = null;
  try {
    head = git(root, ['rev-parse', '--verify', '--quiet', 'HEAD']).trim() || null;
  } catch {
    head = null;
  }
  const files = hooks.snapshot(root);
  const names = Object.keys(files).sort();
  const hash = crypto.createHash('sha256');
  for (const name of names) {
    // snapshot() supplies the same Git content/mode identity before and after
    // staging. No separate index-state prefix needs stripping.
    hash.update(`${name}|${files[name]}|`);
  }
  const dirty = typeof files[hooks.DIRTY_SYMBOL] === 'boolean'
    ? files[hooks.DIRTY_SYMBOL]
    : git(root, ['status', '--porcelain', '-uall']).trim().length > 0;
  return {
    commit: head,
    dirty,
    fileCount: names.length,
    digest: `sha256:${hash.digest('hex')}`,
    format: hooks.SNAPSHOT_FORMAT,
  };
}

function powershell() {
  if (process.env.PROTOCOL_TEST_POWERSHELL) return process.env.PROTOCOL_TEST_POWERSHELL;
  return process.platform === 'win32' ? 'powershell.exe' : 'pwsh';
}

function runCheck(root, check) {
  const started = Date.now();
  let result;
  const env = { ...process.env, PROTOCOL_SKIP_GATE: '1' };
  if (check.isCustom) {
    result = spawnSync(check.name, { cwd: root, shell: true, encoding: 'utf8', windowsHide: true, timeout: 900000, env });
  } else {
    result = spawnSync(powershell(),
      ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', path.join(root, check.name)],
      { cwd: root, encoding: 'utf8', windowsHide: true, timeout: 900000, env });
  }
  if (result.error) throw new Error(`${check.name} could not run: ${result.error.message}`);
  return { name: check.name, code: result.status, seconds: Math.round((Date.now() - started) / 1000), isCustom: Boolean(check.isCustom) };
}

function renderEvidence(state, checks, owner, entryDigest, quick, parentEntry = 'root') {
  const hasCustom = checks.some(c => c.isCustom);
  let scopeLine;
  if (quick) {
    scopeLine = '- scope: validator only; the regression suite was NOT run; host-project tests run separately';
  } else if (hasCustom) {
    scopeLine = '- scope: protocol checks and host-project tests';
  } else {
    scopeLine = '- scope: protocol checks only; host-project tests run separately';
  }
  const lines = [
    'Evidence:',
    `- anchor: ${state.commit || 'no commits'}${state.dirty ? ', uncommitted changes present' : ', clean tree'}`,
    `- digest: ${state.digest} over ${state.fileCount} tracked and untracked files`,
    `- digest format: ${state.format}`,
    `- recorded: ${new Date().toISOString()} by ${owner}`,
    '- entry hash format: 2',
    `- entry: ${entryDigest} of this entry without this block`,
    `- parent-entry: ${parentEntry}`,
    scopeLine,
  ];
  for (const check of checks) {
    lines.push(`- ${check.name}: exit ${check.code} in ${check.seconds}s`);
  }
  lines.push('- reproduce: node .ai/bin/protocol-handoff.cjs verify');
  return lines.join('\n');
}

// Imported from protocol-hooks.cjs (canonical source, avoids duplication drift).
const { DATE_HEADING_REGEX, DATE_HEADING_M_REGEX, ENTRY_HASH_FORMAT, hasEntryHashFormat2, canonicalEntryBody } = hooks;

function findArchivedParent(text) {
  const normalized = text.replace(/\r\n/g, '\n');
  const firstHeading = normalized.search(/^## /m);
  const preamble = firstHeading !== -1 ? normalized.slice(0, firstHeading) : normalized;
  const match = preamble.match(/<!-- archived-parent:\s*(sha256:[a-f0-9]{64})\s*-->/);
  return match ? match[1] : null;
}

function findParentEntry(journalPath) {
  const text = fs.readFileSync(journalPath, 'utf8');
  const found = newestSection(text);
  if (!found) return 'root';
  const olderSections = found.sections.slice(found.index + 1);
  for (const section of olderSections) {
    if (DATE_HEADING_M_REGEX.test(section)) {
      const match = section.match(/^[ \t]*-[ \t]+entry:[ \t]*(sha256:[a-f0-9]{64})\b/m);
      if (match) {
        const clean = canonicalEntryBody(section);
        const actualHash = `sha256:${crypto.createHash('sha256').update(clean, 'utf8').digest('hex')}`;
        if (actualHash !== match[1]) {
          return 'tampered';
        }
        return match[1];
      }
      const ev = parseEvidenceBlock(section);
      if (ev && ev.format >= 4) {
        return 'tampered';
      }
      return 'legacy';
    }
  }
  const archived = findArchivedParent(text);
  if (archived) return archived;
  return 'root';
}

function parseEvidenceBlock(body) {
  if (!body) return null;
  const digest = body.match(/^[ \t]*-[ \t]+digest:[ \t]*(sha256:[a-f0-9]{64})\b/m) || body.match(/digest:\s*(sha256:[a-f0-9]{64})/);
  const format = body.match(/^[ \t]*-[ \t]+digest format:[ \t]*(\d+)/m) || body.match(/digest format:\s*(\d+)/);
  const entry = body.match(/^[ \t]*-[ \t]+entry:[ \t]*(sha256:[a-f0-9]{64})\b/m);
  const parent = body.match(/^[ \t]*-[ \t]+parent-entry:[ \t]*(\S+)/m);
  const chainRoot = body.match(/^[ \t]*-[ \t]+chain root:[ \t]*(\S+)/m);
  const authenticated = hasEntryHashFormat2(body);
  return { body, digest: digest ? digest[1] : null, format: format ? Number(format[1]) : 1,
    entry: entry ? entry[1] : null, parentEntry: parent ? parent[1] : null,
    chainRoot: chainRoot ? chainRoot[1] : null, authenticated };
}

function archiveEntryRecords(text) {
  const normalized = text.replace(/\r\n/g, '\n');
  const sections = normalized.split(/(?=^## )/m);
  return sections.filter(section => DATE_HEADING_M_REGEX.test(section)).flatMap(section => {
    const match = section.match(/^[ \t]*-[ \t]+entry:[ \t]*(sha256:[a-f0-9]{64})\b/m);
    if (!match) return [];
    const clean = canonicalEntryBody(section);
    const actualHash = `sha256:${crypto.createHash('sha256').update(clean, 'utf8').digest('hex')}`;
    const evidence = hooks.entryField(section.replace(/(?:\n-{3,}[ \t]*|\n### From [^\r\n]+)*\s*$/, '\n'), 'Evidence');
    const parsed = parseEvidenceBlock(evidence);
    const hasExplicitFormat = Boolean(evidence && /digest format:\s*\d+/.test(evidence));
    const authenticated = hasEntryHashFormat2(section);
    return [{
      hash: match[1],
      actualHash,
      valid: actualHash === match[1],
      hasEvidence: Boolean(parsed && parsed.body),
      parentEntry: parsed ? parsed.parentEntry : null,
      chainRoot: parsed ? parsed.chainRoot : null,
      format: (parsed && hasExplicitFormat) ? parsed.format : null,
      authenticated,
    }];
  });
}

// Verification scope note: verifyArchivedChain detects chain truncation, orphaned segments,
// duplicate copies, and hash tampering/cycles within .ai/ARCHIVE.md along the chain reached
// from archivedParent. Complete replacement or wholesale deletion of archive segments remains
// outside the threat model, consistent with DEC-0016.
function verifyArchivedChain(root, archivedParent) {
  if (!archivedParent) return { ok: true };

  const archivePath = path.join(root, '.ai', 'ARCHIVE.md');
  if (!fs.existsSync(archivePath)) {
    return { ok: false, reason: `archived parent ${archivedParent} specified, but .ai/ARCHIVE.md does not exist.` };
  }
  const archiveText = fs.readFileSync(archivePath, 'utf8').replace(/\r\n/g, '\n');
  const entryLabelCounts = new Map();
  for (const line of archiveText.split('\n')) {
    const match = line.trim().match(/^-[ \t]+entry:[ \t]*(sha256:[a-f0-9]{64})\b/);
    if (match) entryLabelCounts.set(match[1], (entryLabelCounts.get(match[1]) || 0) + 1);
  }
  for (const [hash, count] of entryLabelCounts) {
    if (count > 1) return { ok: false, reason: `archive contains duplicate copies of ${hash}.` };
  }

  const records = archiveEntryRecords(archiveText);
  const byHash = new Map();
  for (const record of records) {
    const matches = byHash.get(record.hash) || [];
    matches.push(record);
    byHash.set(record.hash, matches);
  }
  for (const [hash, matches] of byHash) {
    if (matches.length > 1) {
      return { ok: false, reason: `archive contains duplicate copies of ${hash}.` };
    }
  }

  const transitionalRecords = records.filter(r => r.chainRoot === 'transitional');
  if (transitionalRecords.length > 1) {
    return { ok: false, reason: 'archive contains multiple transitional root markers; history may have been truncated.' };
  }

  // Helper to determine if a record is a valid terminal root:
  // Must have recognized Evidence; missing Evidence cannot be trusted as a terminal.
  const isTerminal = r => (
    r.hasEvidence && (
      (r.format !== null && r.format < 4) ||
      r.parentEntry === 'root' ||
      r.parentEntry === 'legacy' ||
      r.chainRoot === 'transitional'
    )
  );

  const visited = new Set();
  const reachedChain = [];
  let current = archivedParent;
  let reachedTerminal = null;

  while (current && current !== 'root' && current !== 'legacy') {
    if (visited.has(current)) {
      return { ok: false, reason: `archived parent chain contains a cycle at ${current}.` };
    }
    visited.add(current);
    const matches = byHash.get(current) || [];
    if (!matches.length) {
      return { ok: false, reason: `archived parent ${current} is missing from .ai/ARCHIVE.md.` };
    }
    const record = matches[0];
    reachedChain.push(record);
    if (!record.hasEvidence) {
      return { ok: false, reason: `archived parent ${current} lacks recognized Evidence in .ai/ARCHIVE.md.` };
    }
    if (!record.valid) {
      return { ok: false, reason: `archived parent ${current} was tampered in .ai/ARCHIVE.md (hash mismatch: expected ${current}, computed ${record.actualHash}).` };
    }
    if (isTerminal(record)) {
      reachedTerminal = record;
      break;
    }
    if (!record.parentEntry) {
      return { ok: false, reason: 'archive contains an orphaned segment; history may have been truncated.' };
    }
    current = record.parentEntry;
  }

  if (!reachedTerminal) {
    return { ok: false, reason: `archive chain from ${archivedParent} did not terminate at a valid root.` };
  }

  // Transitional root marker uniqueness in this chain
  const transitionalInChain = reachedChain.filter(r => r.chainRoot === 'transitional');
  if (transitionalInChain.length > 1) {
    return { ok: false, reason: 'archive contains multiple transitional root markers; history may have been truncated.' };
  }
  if (transitionalInChain.length === 1 && reachedTerminal !== transitionalInChain[0]) {
    return { ok: false, reason: 'archive contains multiple transitional root markers; history may have been truncated.' };
  }

  // Per-chain orphan rule: any record outside the reached set whose parent-entry points into it is an orphaned segment
  for (const r of records) {
    if (!visited.has(r.hash)) {
      if (r.parentEntry && visited.has(r.parentEntry)) {
        return { ok: false, reason: 'archive contains an orphaned segment; history may have been truncated.' };
      }
    }
  }

  return { ok: true };
}

function verifyJournalChain(root, journalPath, deep = false) {
  const text = fs.readFileSync(journalPath, 'utf8');
  const normalized = text.replace(/\r\n/g, '\n');
  const sections = normalized.split(/(?=^## )/m);
  const datedSections = sections.filter(s => DATE_HEADING_M_REGEX.test(s));
  const archivedParent = findArchivedParent(normalized);

  for (let i = 0; i < datedSections.length; i++) {
    const section = datedSections[i];
    const evBody = hooks.entryField(section.replace(/\n-{3,}\s*$/, '\n'), 'Evidence');
    if (!evBody) continue;
    const ev = parseEvidenceBlock(evBody);
    if (!ev || !ev.entry) continue;

    const clean = canonicalEntryBody(section);
    const actualEntryHash = `sha256:${crypto.createHash('sha256').update(clean, 'utf8').digest('hex')}`;
    if (ev.entry !== actualEntryHash) {
      return { ok: false, reason: `historical entry at index ${i} was changed after certification. Recorded ${ev.entry}, computed ${actualEntryHash}.` };
    }

    if (ev.parentEntry && ev.parentEntry !== 'root' && ev.parentEntry !== 'legacy') {
      if (ev.parentEntry === 'tampered') {
        return { ok: false, reason: `historical entry at index ${i} recorded a tampered parent entry.` };
      }
      if (i + 1 < datedSections.length) {
        const nextSection = datedSections[i + 1];
        const nextClean = canonicalEntryBody(nextSection);
        const nextHash = `sha256:${crypto.createHash('sha256').update(nextClean, 'utf8').digest('hex')}`;
        if (ev.parentEntry !== nextHash) {
          return { ok: false, reason: `historical link at index ${i} was broken. Recorded parent ${ev.parentEntry}, expected ${nextHash}.` };
        }
      } else {
        if (archivedParent) {
          if (ev.parentEntry !== archivedParent) {
            return { ok: false, reason: `oldest entry parent ${ev.parentEntry} does not match archived-parent marker ${archivedParent}.` };
          }
        }
      }
    } else if (i + 1 < datedSections.length) {
      const authenticated = /(?:^|\n)[ \t]*-[ \t]+entry hash format:[ \t]*2(?:\s|$)/m.test(section);
      if (authenticated && !ev.parentEntry && ev.chainRoot !== 'transitional') {
        return { ok: false, reason: `historical link at index ${i} lacks parent-entry; chain is broken.` };
      }
    }
  }
  if (deep) {
    const archiveCheck = verifyArchivedChain(root, archivedParent);
    if (!archiveCheck.ok) return archiveCheck;
  }
  return { ok: true };
}

// The newest dated section, complete or not: evidence attaches to what the
// agent just wrote, and an incomplete entry is exactly when it matters.
function newestSection(text) {
  const normalized = text.replace(/\r\n/g, '\n');
  const sections = normalized.split(/(?=^## )/m);
  const index = sections.findIndex(section => DATE_HEADING_REGEX.test(section));
  if (index === -1) return null;
  return { sections, index, normalized };
}

function formatWithEvidence(text, block) {
  const found = newestSection(text);
  if (!found) return null;
  let section = found.sections[found.index];
  const trailing = section.match(/\n(-{3,}\s*)$/);
  const separator = trailing ? `\n${trailing[1]}` : '';
  if (trailing) section = section.slice(0, section.length - separator.length);
  section = section.replace(/\n*Evidence:[\s\S]*$/, '\n');
  section = `${section.replace(/\n+$/, '')}\n\n${block}\n${separator ? `${separator}\n` : ''}`;
  const sections = [...found.sections];
  sections[found.index] = section;
  return sections.join('');
}

function attach(journalPath, block) {
  const text = fs.readFileSync(journalPath, 'utf8');
  const updated = formatWithEvidence(text, block);
  if (updated === null) throw new Error(`No dated entry in ${journalPath}. Write the entry first, then record evidence.`);
  fs.writeFileSync(journalPath, updated);
}

// The digest deliberately excludes .ai/worklog, or writing the Evidence block
// would invalidate the evidence the moment it was written. The consequence was
// that the one artifact the protocol calls a record could be rewritten after
// certification and verify would still pass. Three reviewers found it.
//
// The entry hash closes the loop without reintroducing the cycle: it covers the
// entry body with its own Evidence block removed. See DEC-0021.
function entryBody(journalPath) {
  const text = fs.readFileSync(journalPath, 'utf8');
  const found = newestSection(text);
  if (!found) return null;
  return canonicalEntryBody(found.sections[found.index]);
}

function entryHash(journalPath) {
  const body = entryBody(journalPath);
  if (body === null) return null;
  return `sha256:${crypto.createHash('sha256').update(body, 'utf8').digest('hex')}`;
}

function readEvidence(journalPath) {
  const text = fs.readFileSync(journalPath, 'utf8');
  const found = newestSection(text);
  if (!found) return null;
  const body = hooks.entryField(found.sections[found.index].replace(/\n-{3,}\s*$/, '\n'), 'Evidence');
  return parseEvidenceBlock(body);
}

function resolveJournal(root, explicit, owner) {
  if (explicit) return path.resolve(root, explicit);
  if (owner) {
    const byOwner = path.join(root, '.ai', 'worklog', `${owner}.md`);
    if (fs.existsSync(byOwner)) return byOwner;
    throw new Error(`No session journal for owner ${owner}. Create ${path.relative(root, byOwner)} first.`);
  }
  const directory = path.join(root, '.ai', 'worklog');
  if (!fs.existsSync(directory)) {
    throw new Error('No .ai/worklog directory. Start a session, or create the journal by hand.');
  }
  const notJournals = new Set(['README.md']);
  const candidates = fs.readdirSync(directory)
    .filter(name => name.endsWith('.md') && !notJournals.has(name))
    .map(name => ({ name, mtime: fs.statSync(path.join(directory, name)).mtimeMs }))
    .sort((a, b) => b.mtime - a.mtime);
  if (!candidates.length) throw new Error('No session journal found in .ai/worklog. Create one first.');
  return path.join(directory, candidates[0].name);
}

function checkOwnerReceipt(root, owner, options = {}) {
  let journalPath = options.journalPath;
  if (!journalPath) {
    if (options.journal) {
      journalPath = path.resolve(root, options.journal);
    } else if (owner) {
      if (owner.endsWith('.md') || owner.includes('/') || owner.includes('\\')) {
        journalPath = path.resolve(root, owner);
      } else {
        journalPath = path.join(root, '.ai', 'worklog', `${owner}.md`);
      }
    }
  }
  if (!journalPath) {
    return { ok: false, reason: 'missing-owner', message: 'no owner or journal specified' };
  }
  const relative = path.relative(root, journalPath);
  if (!fs.existsSync(journalPath)) {
    return {
      ok: false,
      reason: 'missing-journal',
      message: `journal does not exist: ${relative}`,
      relative,
      journalPath,
    };
  }

  const sectionIndex = typeof options.sectionIndex === 'number' ? options.sectionIndex : 0;
  const journalText = fs.readFileSync(journalPath, 'utf8');
  const normalized = journalText.replace(/\r\n/g, '\n');
  const sections = normalized.split(/(?=^## )/m);
  const datedSections = sections.filter(s => DATE_HEADING_M_REGEX.test(s));

  if (datedSections.length === 0) {
    return {
      ok: false,
      reason: 'no-dated-entries',
      message: 'has no dated entry',
      relative,
      journalPath,
    };
  }

  if (sectionIndex >= datedSections.length) {
    return {
      ok: false,
      reason: 'section-not-found',
      message: `dated section ${sectionIndex} not found`,
      relative,
      journalPath,
    };
  }

  const section = datedSections[sectionIndex];
  const evBody = hooks.entryField(section.replace(/\n-{3,}\s*$/, '\n'), 'Evidence');
  if (!evBody) {
    return {
      ok: false,
      reason: 'no-evidence',
      message: sectionIndex === 0
        ? 'has no Evidence block on its newest entry.'
        : `has no Evidence block on dated section ${sectionIndex}.`,
      relative,
      journalPath,
    };
  }

  const evidence = parseEvidenceBlock(evBody);
  if (!evidence) {
    return {
      ok: false,
      reason: 'no-evidence',
      message: sectionIndex === 0
        ? 'has no Evidence block on its newest entry.'
        : `has no Evidence block on dated section ${sectionIndex}.`,
      relative,
      journalPath,
    };
  }

  const state = options.state || anchor(root);

  if (evidence.format !== state.format) {
    return {
      ok: false,
      reason: 'format-mismatch',
      message: `evidence uses digest format ${evidence.format}; ` +
        `this build computes format ${state.format}. The two cannot be compared. Re-record to refresh it.`,
      evidence,
      relative,
      journalPath,
    };
  }

  let warning = null;
  if (!evidence.authenticated) {
    warning = 'evidence is not authenticated (legacy format); re-record to refresh.';
    if (!options.allowLegacy) {
      return {
        ok: false,
        reason: 'unauthenticated',
        message: warning,
        warning,
        evidence,
        relative,
        journalPath,
      };
    }
  }

  if (evidence.entry === null) {
    return {
      ok: false,
      reason: 'predates-hashing',
      message: 'evidence predates entry hashing. Re-record it so the entry itself is covered.',
      warning,
      evidence,
      relative,
      journalPath,
    };
  }

  const clean = canonicalEntryBody(section);
  const actualHash = `sha256:${crypto.createHash('sha256').update(clean, 'utf8').digest('hex')}`;
  if (evidence.entry !== actualHash) {
    return {
      ok: false,
      reason: 'entry-changed',
      message: `entry was changed after it was certified. Recorded ${evidence.entry}, the entry now hashes to ${actualHash}.`,
      warning,
      evidence,
      relative,
      journalPath,
    };
  }

  if (evidence.parentEntry === 'tampered') {
    return {
      ok: false,
      reason: 'tampered-parent',
      message: 'historical link was broken. Entry recorded a tampered parent entry.',
      warning,
      evidence,
      relative,
      journalPath,
    };
  }

  const chainCheck = verifyJournalChain(root, journalPath, Boolean(options.deep));
  if (!chainCheck.ok) {
    return {
      ok: false,
      reason: 'chain-broken',
      message: `historical link was broken. ${chainCheck.reason}`,
      warning,
      evidence,
      relative,
      journalPath,
    };
  }

  if (sectionIndex === 0 && evidence.parentEntry && evidence.parentEntry !== 'root' && evidence.parentEntry !== 'legacy') {
    const expectedParent = findParentEntry(journalPath);
    if (evidence.parentEntry !== expectedParent) {
      return {
        ok: false,
        reason: 'parent-mismatch',
        message: `historical link was broken. Recorded parent ${evidence.parentEntry}, expected ${expectedParent}.`,
        warning,
        evidence,
        relative,
        journalPath,
      };
    }
  }

  if (evidence.digest !== state.digest) {
    return {
      ok: false,
      reason: 'stale',
      message: `evidence is stale. Recorded ${evidence.digest}, tree is now ${state.digest}.`,
      warning,
      evidence,
      relative,
      journalPath,
    };
  }

  if (/exit [^0]/.test(evidence.body)) {
    return {
      ok: false,
      reason: 'failing-check',
      message: 'evidence matches the tree but records a failing check.',
      warning,
      evidence,
      relative,
      journalPath,
    };
  }

  return {
    ok: true,
    reason: 'matches-current-tree',
    message: 'evidence matches the current tree',
    warning,
    evidence,
    relative,
    journalPath,
  };
}

function reportOne(root, journalPath, state, deep = false, allowLegacy = false) {
  const result = checkOwnerReceipt(root, journalPath, { journalPath, state, deep, allowLegacy });
  if (result.warning) {
    process.stderr.write(`AI protocol: ${result.relative} ${result.warning}\n`);
  }
  if (!result.ok) {
    process.stderr.write(`AI protocol: ${result.relative} ${result.message}\n`);
    return 1;
  }
  process.stdout.write(`${result.relative}: evidence matches the current tree\n`);
  return 0;
}

function main(argv) {
  const command = argv[0];
  const options = {};
  for (let i = 1; i < argv.length; i += 1) {
    if (argv[i] === '--quick') { options.quick = true; continue; }
    if (argv[i] === '--deep') { options.deep = true; continue; }
    if (argv[i] === '--allow-legacy') { options.allowLegacy = true; continue; }
    const value = argv[i + 1];
    if (!value) throw new Error(`Missing value for ${argv[i]}`);
    if (argv[i] === '--owner') options.owner = value;
    else if (argv[i] === '--journal') options.journal = value;
    else if (argv[i] === '--root') options.root = value;
    else if (argv[i] === '--reason') options.reason = value;
    else throw new Error('Usage: protocol-handoff.cjs record|verify|rehash|state|gate-check [--owner id] [--journal path] [--root path] [--reason text] [--quick] [--deep] [--allow-legacy]');
    i += 1;
  }
  const root = fs.realpathSync(path.resolve(options.root || path.join(__dirname, '..', '..')));
  let state = null;
  const getState = () => {
    if (!state) state = anchor(root);
    return state;
  };

  if (command === 'state') {
    process.stdout.write(`${JSON.stringify(getState(), null, 2)}\n`);
    return 0;
  }

  if (command === 'record') {
    if (!options.owner) throw new Error('record needs --owner <session id>');
    const journalPath = resolveJournal(root, options.journal, options.owner);
    // Auto-archive older entries if journal exceeded 150 lines (Fork 2).
    try {
      archive.autoArchiveWorklog(root, journalPath, 150, 1, options.owner);
    } catch { }
    const journalText = fs.readFileSync(journalPath, 'utf8');
    const secretLeak = hooks.findSecretLeak(journalText);
    if (secretLeak) {
      throw new Error(`Unredacted secret pattern detected in ${path.relative(root, journalPath)}: "${secretLeak.slice(0, 16)}...". ` +
        'Remove or redact secrets before recording evidence.');
    }
    const checks = checksFor(root, options.quick).map(check => runCheck(root, check));
    const failed = checks.filter(check => check.code !== 0);
    // Re-anchor: the checks may have touched the tree. Evidence must describe
    // the state it was actually measured against.
    const after = anchor(root);
    // Hash the entry as it stands before the block is attached, so the
    // hash covers the claim and not itself.
    let parentEntry = findParentEntry(journalPath);
    if (parentEntry === 'tampered') {
      throw new Error(`Cannot record evidence in ${path.relative(root, journalPath)}: historical entry link is tampered. ` +
        'Previous entry hash does not match its contents.');
    }
    let chainCheck = verifyJournalChain(root, journalPath);
    if (!chainCheck.ok) {
      throw new Error(`Cannot record evidence in ${path.relative(root, journalPath)}: historical entry link is tampered. ${chainCheck.reason}`);
    }
    const provisionalEntry = `sha256:${'0'.repeat(64)}`;
    let evidenceBlock = renderEvidence(
      after, checks, options.owner, provisionalEntry, Boolean(options.quick), parentEntry,
    );

    let currentJournalText = fs.readFileSync(journalPath, 'utf8');
    let projected = formatWithEvidence(currentJournalText, evidenceBlock);
    if (projected === null) {
      throw new Error(`No dated entry in ${path.relative(root, journalPath)}. Write the entry first, then record evidence.`);
    }

    if (archive.getLineCount(projected) > 150) {
      const foundSection = newestSection(currentJournalText);
      const firstHeading = currentJournalText.replace(/\r\n/g, '\n').search(/^## /m);
      const preamble = firstHeading !== -1 ? currentJournalText.slice(0, firstHeading) : '';
      const dummyArchivedMarker = '<!-- archived-parent: sha256:' + '0'.repeat(64) + ' -->\n\n---\n\n';
      const singleEntryText = (preamble.trim() ? preamble.trim() + '\n\n' : '') + dummyArchivedMarker + foundSection.sections[foundSection.index];
      const singleProjected = formatWithEvidence(singleEntryText, evidenceBlock);
      if (archive.getLineCount(singleProjected) > 150) {
        throw new Error(`Cannot record evidence in ${path.relative(root, journalPath)}: journal entry is too long; split the entry before recording.`);
      }

      // Archive older entries first (keep newest = 1)
      archive.autoArchiveWorklog(root, journalPath, 0, 1, options.owner);
      currentJournalText = fs.readFileSync(journalPath, 'utf8');

      // Re-evaluate chain links in case parent entry moved to archive
      parentEntry = findParentEntry(journalPath);
      if (parentEntry === 'tampered') {
        throw new Error(`Cannot record evidence in ${path.relative(root, journalPath)}: historical entry link is tampered. ` +
          'Previous entry hash does not match its contents.');
      }
      chainCheck = verifyJournalChain(root, journalPath);
      if (!chainCheck.ok) {
        throw new Error(`Cannot record evidence in ${path.relative(root, journalPath)}: historical entry link is tampered. ${chainCheck.reason}`);
      }

      evidenceBlock = renderEvidence(
        after, checks, options.owner, provisionalEntry, Boolean(options.quick), parentEntry,
      );
      projected = formatWithEvidence(currentJournalText, evidenceBlock);
      if (archive.getLineCount(projected) > 150) {
        throw new Error(`Cannot record evidence in ${path.relative(root, journalPath)}: journal entry is too long; split the entry before recording.`);
      }
    }

    fs.writeFileSync(journalPath, projected);
    const entryDigest = entryHash(journalPath);
    const updated = fs.readFileSync(journalPath, 'utf8')
      .replace(`- entry: ${provisionalEntry}`, `- entry: ${entryDigest}`);
    fs.writeFileSync(journalPath, updated);
    process.stdout.write(`${path.relative(root, journalPath)}: evidence recorded\n`);
    process.stdout.write('Protocol checks only; run and report the host project tests separately.\n');
    for (const check of checks) process.stdout.write(`  ${check.name}: exit ${check.code}\n`);
    if (failed.length) {
      process.stderr.write(`AI protocol: ${failed.length} check(s) failed; the evidence records the failure.\n`);
      return 1;
    }
    return 0;
  }

  if (command === 'verify') {
    const state = getState();
    // With an explicit target, judge that one journal. Without one, ask the
    // real question: does any journal hold evidence for the tree as it is now?
    // Picking the newest by modification time was wrong, because a checkout or
    // a merge rewrites every file and scrambles the order.
    if (options.journal || options.owner) {
      const journalPath = resolveJournal(root, options.journal, options.owner);
      return reportOne(root, journalPath, state, Boolean(options.deep), Boolean(options.allowLegacy));
    }
    const directory = path.join(root, '.ai', 'worklog');
    if (!fs.existsSync(directory)) {
      process.stderr.write('AI protocol: no .ai/worklog directory.\n');
      return 1;
    }
    const journals = fs.readdirSync(directory)
      .filter(name => name.endsWith('.md') && name !== 'README.md')
      .map(name => path.join(directory, name));
    const carrying = journals
      .map(file => ({ file, evidence: readEvidence(file) }))
      .filter(item => item.evidence);
    if (!carrying.length) {
      process.stderr.write('AI protocol: no journal carries an Evidence block. ' +
        'Run: node .ai/bin/protocol-handoff.cjs record --owner <session-id>\n');
      return 1;
    }
    const matching = carrying.filter(item => {
      if (!item.evidence.authenticated) return false;
      if (item.evidence.format !== state.format) return false;
      if (item.evidence.digest !== state.digest) return false;
      if (item.evidence.entry !== entryHash(item.file)) return false;
      if (item.evidence.parentEntry === 'tampered') return false;
      if (/exit [^0]/.test(item.evidence.body)) return false;
      const chain = verifyJournalChain(root, item.file, Boolean(options.deep));
      return chain.ok;
    });
    if (matching.length) {
      for (const item of matching) {
        process.stdout.write(`${path.relative(root, item.file)}: evidence matches the current tree\n`);
      }
      return 0;
    }
    process.stderr.write(`AI protocol: no evidence matches the current tree ${state.digest}.\n`);
    for (const item of carrying) {
      const why = !item.evidence.authenticated
        ? 'evidence is not authenticated (legacy format)'
        : (item.evidence.entry !== null && item.evidence.entry !== entryHash(item.file)
        ? 'the entry was changed after it was certified'
        : item.evidence.format !== state.format
        ? `recorded with digest format ${item.evidence.format}, not comparable`
        : (item.evidence.digest === state.digest ? 'records a failing check' : 'anchored to a different tree'));
      process.stderr.write(`  ${path.relative(root, item.file)}: ${why}\n`);
    }
    return 1;
  }

  if (command === 'rehash') {
    if (!options.owner) throw new Error('rehash needs --owner <session id>');
    if (!options.reason) throw new Error('rehash needs --reason <text> explaining why the entry was changed');
    const journalPath = resolveJournal(root, options.journal, options.owner);
    const evidence = readEvidence(journalPath);
    if (!evidence) throw new Error(`No Evidence block in ${path.relative(root, journalPath)}. Record evidence first.`);
    if (!evidence.entry) throw new Error('Evidence predates entry hashing. Re-record instead.');
    // Add the sanitized marker before hashing because authenticated Evidence
    // metadata is part of the canonical entry body.
    const text = fs.readFileSync(journalPath, 'utf8');
    const marker = `- sanitized: ${new Date().toISOString()} reason: ${options.reason}`;
    const withMarker = text.includes('- sanitized:') ? text
      : text.replace(/(- reproduce: node .ai\/bin\/protocol-handoff\.cjs verify)/, `${marker}\n$1`);
    if (withMarker !== text) fs.writeFileSync(journalPath, withMarker);
    const currentHash = entryHash(journalPath);
    if (evidence.entry === currentHash && withMarker === text) {
      process.stdout.write(`${path.relative(root, journalPath)}: entry hash already matches; nothing to rehash.\n`);
      return 0;
    }
    const updated = withMarker.replace(
      /^(- entry: )sha256:[a-f0-9]{64}( of this entry without this block)?$/m,
      (m, p1, p2) => `${p1}${currentHash}${p2 || ''}`
    );
    if (updated === text) throw new Error('Could not locate the entry hash line in the Evidence block.');
    fs.writeFileSync(journalPath, updated);
    process.stdout.write(`${path.relative(root, journalPath)}: entry hash updated (was ${evidence.entry}, now ${currentHash})\n`);
    process.stdout.write(`Reason: ${options.reason}\n`);
    return 0;
  }

  if (command === 'gate-check') {
    return gateCheck(root, options);
  }

  throw new Error('Usage: protocol-handoff.cjs record|verify|rehash|state|gate-check');
}

function gateCheck(root, options = {}) {
  const taskPath = path.join(root, '.ai', 'TASK.md');
  if (!fs.existsSync(taskPath)) {
    process.stderr.write('AI protocol: gate-check: .ai/TASK.md does not exist.\n');
    return 1;
  }
  const taskText = fs.readFileSync(taskPath, 'utf8');
  const statusMatch = taskText.match(/^Status:[ \t]*(\S.*)$/m);
  const taskStatus = statusMatch ? statusMatch[1].trim() : 'Unknown';

  if (!taskStatus.match(/^Completed(?:[ .;:-]|$)/i)) {
    process.stdout.write(`not applicable: task status is ${taskStatus}\n`);
    return 0;
  }

  const gateMatch = taskText.match(/(?:^|\n)## Completion gate[ \t]*\r?\n([\s\S]*?)(?=(?:\n## )|$)/);
  if (!gateMatch) {
    process.stderr.write('AI protocol: gate-check: completed task requires a ## Completion gate section.\n');
    return 1;
  }
  const gateBody = gateMatch[1];
  const promptMatch = gateBody.match(/^[ \t]*-[ \t]+Adversarial review prompt:[ \t]*(\S+)[ \t]*$/m);
  const reviewMatch = gateBody.match(/^[ \t]*-[ \t]+Independent review:[ \t]*(\S+)[ \t]*$/m);

  if (!promptMatch) {
    process.stderr.write('AI protocol: gate-check: completed task is missing its adversarial review prompt field.\n');
    return 1;
  }
  if (!reviewMatch) {
    process.stderr.write('AI protocol: gate-check: completed task is missing its independent review field.\n');
    return 1;
  }

  const promptRel = promptMatch[1].replace(/\\/g, '/').replace(/^\.\//, '');
  const reviewRel = reviewMatch[1].replace(/\\/g, '/').replace(/^\.\//, '');

  if (promptRel === reviewRel) {
    process.stderr.write('AI protocol: gate-check: adversarial prompt and independent review must be separate artifacts.\n');
    return 1;
  }

  const gateFiles = [
    { label: 'adversarial review prompt', rel: promptRel },
    { label: 'independent review', rel: reviewRel },
  ];

  for (const item of gateFiles) {
    if (!item.rel.startsWith('docs/reviews/') || item.rel.includes('..')) {
      process.stderr.write(`AI protocol: gate-check: ${item.label} must point inside docs/reviews/: ${item.rel}\n`);
      return 1;
    }
    const full = path.join(root, item.rel);
    if (!fs.existsSync(full) || !fs.statSync(full).isFile()) {
      process.stderr.write(`AI protocol: gate-check: ${item.label} file does not exist: ${item.rel}\n`);
      return 1;
    }
    const content = fs.readFileSync(full, 'utf8');
    if (!content.trim()) {
      process.stderr.write(`AI protocol: gate-check: ${item.label} file is empty: ${item.rel}\n`);
      return 1;
    }
  }

  const reviewContent = fs.readFileSync(path.join(root, reviewRel), 'utf8');

  // Mode: ADVISORY or transcribed reviews cannot satisfy independent slot
  const modeMatch = reviewContent.match(/^[ \t]*(?:\*\*)?\bMode\b(?:\*\*)?\s*:\s*([^\r\n]+)/im);
  const declaredMode = modeMatch ? modeMatch[1].trim() : null;
  if (declaredMode && declaredMode.toUpperCase() === 'ADVISORY') {
    process.stderr.write(`AI protocol: gate-check: independent review ${reviewRel} has Mode: ADVISORY; advisory reviews cannot satisfy the independent review gate.\n`);
    return 1;
  }
  if (/(?:transcribed\s+(?:from\s+chat\s+)?by|transcription\s+fallback)/i.test(reviewContent)) {
    process.stderr.write(`AI protocol: gate-check: independent review ${reviewRel} is transcribed; transcribed reviews cannot satisfy the independent review gate.\n`);
    return 1;
  }

  // Verdict check: must be PASS or RECOMMENDATION
  const verdictMatch = reviewContent.match(/^[ \t]*(?:\*\*)?\bVerdict\b(?:\*\*)?\s*:\s*([^\r\n]+)/im);
  if (!verdictMatch) {
    process.stderr.write(`AI protocol: gate-check: independent review ${reviewRel} is missing a Verdict.\n`);
    return 1;
  }
  const rawVerdict = verdictMatch[1].trim();
  const verdictToken = rawVerdict.toUpperCase();
  if (verdictToken !== 'PASS' && verdictToken !== 'RECOMMENDATION') {
    process.stderr.write(`AI protocol: gate-check: independent review ${reviewRel} verdict must be PASS or RECOMMENDATION, got ${rawVerdict}.\n`);
    return 1;
  }

  // Date check for legacy cutoff (legacy: valid Date <= 2026-09-19; new reviews: Date > 2026-09-19)
  const dateMatch = reviewContent.match(/^[ \t]*(?:\*\*)?\bDate\b(?:\*\*)?\s*:\s*([^\r\n]+)/im);
  const dateIsoMatch = dateMatch ? dateMatch[1].match(/\b\d{4}-\d{2}-\d{2}\b/) : null;
  if (!dateIsoMatch) {
    process.stderr.write(`AI protocol: gate-check: independent review ${reviewRel} is missing or has an invalid Date.\n`);
    return 1;
  }
  const reviewDate = dateIsoMatch[0];
  const isLegacy = reviewDate <= '2026-09-19';
  const isNew = !isLegacy;

  // Mode: CERTIFYING required for new reviews
  if (!declaredMode) {
    if (isNew) {
      process.stderr.write(`AI protocol: gate-check: independent review ${reviewRel} is missing Mode: CERTIFYING.\n`);
      return 1;
    }
    process.stdout.write(`[WARN] legacy review ${reviewRel} missing Mode: CERTIFYING\n`);
  } else if (declaredMode.toUpperCase() !== 'CERTIFYING') {
    process.stderr.write(`AI protocol: gate-check: independent review ${reviewRel} mode must be CERTIFYING, got ${declaredMode}.\n`);
    return 1;
  }

  // Receipt-Owner (Session fallback)
  const ownerMatch = reviewContent.match(/^[ \t]*(?:\*\*)?(?:\bReceipt-Owner\b|\bSession\b)(?:\*\*)?\s*:\s*([^\r\n]+)/im);
  const receiptOwner = ownerMatch ? ownerMatch[1].trim() : null;

  if (!receiptOwner) {
    if (isNew) {
      process.stderr.write(`AI protocol: gate-check: independent review ${reviewRel} is missing Receipt-Owner.\n`);
      return 1;
    }
    process.stdout.write(`[WARN] legacy review ${reviewRel} missing Receipt-Owner\n`);
  }

  // Receipt field is optional and informational only (empty is valid)
  const receiptMatch = reviewContent.match(/^[ \t]*(?:\*\*)?\bReceipt\b(?:\*\*)?\s*:\s*([^\r\n]*)/im);

  const state = options.state || anchor(root);

  // Candidate journals to check
  let candidateJournals = [];
  if (receiptOwner) {
    const ownerJournal = path.join(root, '.ai', 'worklog', `${receiptOwner}.md`);
    if (!fs.existsSync(ownerJournal)) {
      process.stderr.write(`AI protocol: gate-check: journal for Receipt-Owner "${receiptOwner}" not found: ${path.relative(root, ownerJournal)}.\n`);
      return 1;
    }
    candidateJournals.push({ owner: receiptOwner, journalPath: ownerJournal });
  } else {
    // Legacy without Receipt-Owner: scan .ai/worklog
    const worklogDir = path.join(root, '.ai', 'worklog');
    if (fs.existsSync(worklogDir)) {
      const files = fs.readdirSync(worklogDir).filter(f => f.endsWith('.md') && f !== 'README.md');
      for (const file of files) {
        candidateJournals.push({ owner: path.basename(file, '.md'), journalPath: path.join(worklogDir, file) });
      }
    }
  }

  if (candidateJournals.length === 0) {
    if (isLegacy && !receiptOwner) {
      process.stdout.write(`[WARN] legacy review ${reviewRel} has no session journals in .ai/worklog\n`);
      return 0;
    }
    process.stderr.write(`AI protocol: gate-check: no session journals available in .ai/worklog to verify review ${reviewRel}.\n`);
    return 1;
  }

  // Find a section that satisfies the binding
  let reviewPathFound = false;
  let evidenceFound = false;
  let lastFailureReason = null;
  let verifiedBinding = null;

  for (const cand of candidateJournals) {
    const journalText = fs.readFileSync(cand.journalPath, 'utf8');
    const norm = journalText.replace(/\r\n/g, '\n');
    const sections = norm.split(/(?=^## )/m);
    const datedSections = sections.filter(s => DATE_HEADING_M_REGEX.test(s));

    for (let i = 0; i < datedSections.length; i++) {
      const sectionText = datedSections[i];
      const normSection = sectionText.replace(/\\/g, '/');
      if (!normSection.includes(reviewRel)) {
        continue;
      }
      reviewPathFound = true;
      const evBody = hooks.entryField(sectionText.replace(/\n-{3,}\s*$/, '\n'), 'Evidence');
      if (!evBody) {
        lastFailureReason = 'entry has no Evidence block';
        continue;
      }
      evidenceFound = true;
      const checkRes = checkOwnerReceipt(root, cand.owner, {
        journalPath: cand.journalPath,
        sectionIndex: i,
        deep: true,
        allowLegacy: isLegacy,
        state,
      });
      if (checkRes.ok) {
        verifiedBinding = { owner: cand.owner, journalPath: cand.journalPath, sectionIndex: i };
        break;
      } else {
        lastFailureReason = checkRes.message;
      }
    }
    if (verifiedBinding) break;
  }

  if (verifiedBinding) {
    const relJournal = path.relative(root, verifiedBinding.journalPath);
    process.stdout.write(`completion gate verified: ${reviewRel} bound to ${relJournal} (section ${verifiedBinding.sectionIndex})\n`);
    return 0;
  }

  // Binding failed; provide distinguished error message
  const primaryOwner = receiptOwner || candidateJournals[0].owner;
  const primaryRel = path.relative(root, path.join(root, '.ai', 'worklog', `${primaryOwner}.md`));

  if (!reviewPathFound) {
    if (isLegacy && !receiptOwner) {
      process.stdout.write(`[WARN] legacy review ${reviewRel} not mentioned in any journal in .ai/worklog\n`);
      return 0;
    }
    process.stderr.write(`AI protocol: gate-check: journal ${primaryRel} does not mention independent review ${reviewRel}.\n`);
    return 1;
  }
  if (!evidenceFound) {
    process.stderr.write(`AI protocol: gate-check: journal ${primaryRel} entry mentioning ${reviewRel} has no Evidence block.\n`);
    return 1;
  }
  process.stderr.write(`AI protocol: gate-check: journal ${primaryRel} evidence failed verification: ${lastFailureReason || 'receipt does not verify'}.\n`);
  return 1;
}

if (require.main === module) {
  try { process.exitCode = main(process.argv.slice(2)); }
  catch (error) { process.stderr.write(`AI protocol: ${error.message}\n`); process.exitCode = 1; }
}
module.exports = { anchor, attach, formatWithEvidence, readEvidence, renderEvidence, entryHash, findParentEntry, verifyJournalChain, verifyArchivedChain, archiveEntryRecords, parseEvidenceBlock, DATE_HEADING_REGEX, DATE_HEADING_M_REGEX, ENTRY_HASH_FORMAT, hasEntryHashFormat2, canonicalEntryBody, checkOwnerReceipt, gateCheck };
