#!/usr/bin/env node

/**
 * protocol-signals.cjs - Signals ledger management script
 * Part of PKG-5 SIGNALS for ownerideas-revision program
 * Author: mistral-dbafced31ad20a45 / gemini-ce0485aa5fe54c98
 * Specification: docs/specs/signals-ledger.md
 * 
 * Implements: S3 (Library), S4 (CLI), S5 (Import)
 */

'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');

// ============================================================================
// S1 / S3: Validation Helpers & Library
// ============================================================================

/**
 * Check if a date string is a real calendar date YYYY-MM-DD
 * @param {string} dateStr
 * @returns {boolean}
 */
function isValidCalendarDate(dateStr) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
  const parts = dateStr.split('-');
  const y = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  const d = parseInt(parts[2], 10);
  if (m < 1 || m > 12 || d < 1 || d > 31) return false;
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === (m - 1) && dt.getUTCDate() === d;
}

/**
 * Validate evidence production per S1:
 * evidence ::= decision | sigref | relpath [":" N ["-" N]] ["#" anchor]
 * decision ::= "PROTO-DEC-" DDDD | "DEC-" DDDD
 * sigref   ::= id
 * relpath  ::= [A-Za-z0-9._/-]{1,200}, not starting with "/", no ".." segment, no ":" drive
 * anchor   ::= [A-Za-z0-9._:-]{1,80}
 * @param {string} ev
 * @returns {boolean}
 */
function isValidEvidence(ev) {
  if (typeof ev !== 'string' || ev.length === 0) return false;
  if (/^PROTO-DEC-\d{4}$/.test(ev) || /^DEC-\d{4}$/.test(ev)) return true;
  if (/^sig-\d{8}-\d{3}$/.test(ev)) return true;

  let rem = ev;
  const hashIdx = rem.indexOf('#');
  if (hashIdx !== -1) {
    const anchor = rem.slice(hashIdx + 1);
    rem = rem.slice(0, hashIdx);
    if (!/^[A-Za-z0-9._:-]{1,80}$/.test(anchor)) return false;
  }

  const colonMatch = rem.match(/:(\d+)(?:-(\d+))?$/);
  if (colonMatch) {
    rem = rem.slice(0, colonMatch.index);
  }

  if (rem.length === 0 || rem.length > 200) return false;
  if (rem.startsWith('/')) return false;
  if (!/^[A-Za-z0-9._\/-]+$/.test(rem)) return false;

  const segments = rem.split('/');
  for (const seg of segments) {
    if (seg === '..') return false;
  }
  return true;
}

/**
 * Check if a path is a valid relpath:
 * [A-Za-z0-9._/-]{1,200}, not starting with "/", no ".." segment, no ":" drive
 * @param {string} p
 * @returns {boolean}
 */
function isValidRelpath(p) {
  if (typeof p !== 'string' || p.length === 0 || p.length > 200) return false;
  if (p.startsWith('/')) return false;
  if (!/^[A-Za-z0-9._\/-]+$/.test(p)) return false;
  const segments = p.split('/');
  for (const seg of segments) {
    if (seg === '..') return false;
  }
  return true;
}

/**
 * Parse a single signal line and validate it strictly
 * @param {string} text - The line to parse
 * @returns {object} - Parsed fields
 * @throws {Error} - If the line is invalid
 */
function parseLine(text) {
  const line = text.replace(/\r?\n$/, '');

  if (!line.startsWith('Signal: ')) {
    throw new Error('line does not start with Signal:');
  }

  // Remove "Signal: " prefix (exactly 8 chars)
  const content = line.slice(8);

  const fields = content.split(' | ');
  if (fields.length !== 10) {
    throw new Error(`expected 10 fields, got ${fields.length}`);
  }

  const result = {};

  // Field 0: id
  result.id = fields[0];
  if (!/^sig-\d{8}-\d{3}$/.test(result.id) || result.id.endsWith('-000')) {
    throw new Error(`invalid id format: ${result.id}`);
  }

  // Field 1: type
  result.type = fields[1];
  const validTypes = ['procedure-gap', 'script-candidate', 'fall'];
  if (!validTypes.includes(result.type)) {
    throw new Error(`invalid type: ${result.type}`);
  }

  // Field 2: date
  result.date = fields[2];
  if (!isValidCalendarDate(result.date)) {
    throw new Error(`invalid date: ${result.date}`);
  }

  // Field 3: participant
  result.participant = fields[3];
  if (!/^[A-Za-z0-9._:\/@-]{1,80}$/.test(result.participant)) {
    throw new Error(`invalid participant: ${result.participant}`);
  }

  // Field 4: evidence
  result.evidence = fields[4];
  if (!isValidEvidence(result.evidence)) {
    throw new Error(`invalid evidence: ${result.evidence}`);
  }

  // Field 5: cost
  result.cost = fields[5];
  if (result.cost !== 'unknown') {
    const costPattern = /^(attempts=\d+|minutes=\d+|owner=\d+)(,(attempts=\d+|minutes=\d+|owner=\d+))*$/;
    if (!costPattern.test(result.cost)) {
      throw new Error(`invalid cost: ${result.cost}`);
    }
  }

  // Field 6: disposition
  result.disposition = fields[6];
  let dispositionValid = false;
  if (result.disposition === 'open') {
    dispositionValid = true;
  } else if (/^grouped:G-\d+$/.test(result.disposition)) {
    dispositionValid = true;
  } else if (/^procedure:[A-Za-z0-9._-]+$/.test(result.disposition)) {
    dispositionValid = true;
  } else if (result.disposition.startsWith('script:')) {
    const scriptPath = result.disposition.slice(7);
    dispositionValid = isValidRelpath(scriptPath);
  } else if (/^kept-by-assistant:[1-4]$/.test(result.disposition)) {
    dispositionValid = true;
  } else if (result.disposition.startsWith('rejected:')) {
    const token = result.disposition.slice(9);
    dispositionValid = /^[A-Za-z0-9._:\/#-]{1,80}$/.test(token);
  } else if (result.disposition.startsWith('closed:')) {
    const ev = result.disposition.slice(7);
    dispositionValid = isValidEvidence(ev);
  }

  if (!dispositionValid) {
    throw new Error(`invalid disposition: ${result.disposition}`);
  }

  // Field 7: rc
  const rcMatch = fields[7].match(/^rc=(.*)$/);
  if (!rcMatch) {
    throw new Error(`rc field must start with rc=: ${fields[7]}`);
  }
  result.rc = rcMatch[1];
  if (result.rc !== '-' && !/^[a-z0-9-]{1,40}$/.test(result.rc)) {
    throw new Error(`invalid rc: ${result.rc}`);
  }

  // Field 8: batch
  const batchMatch = fields[8].match(/^batch=(.*)$/);
  if (!batchMatch) {
    throw new Error(`batch field must start with batch=: ${fields[8]}`);
  }
  result.batch = batchMatch[1];
  if (result.batch !== '-' && !/^[A-Za-z0-9._-]{1,40}$/.test(result.batch)) {
    throw new Error(`invalid batch: ${result.batch}`);
  }

  // Field 9: src
  const srcMatch = fields[9].match(/^src=(.*)$/);
  if (!srcMatch) {
    throw new Error(`src field must start with src=: ${fields[9]}`);
  }
  result.src = srcMatch[1];
  if (result.src !== '-' && !/^[0-9a-f]{64}$/.test(result.src)) {
    throw new Error(`invalid src: ${result.src}`);
  }

  return result;
}

/**
 * Validate a signals file
 * @param {string} filePath - Path to the signals file
 * @returns {string[]} - Array of error messages, empty if valid
 */
function validateFile(filePath) {
  const errors = [];

  if (!fs.existsSync(filePath)) {
    errors.push(`file not found: ${filePath}`);
    return errors;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  // Check header (first 4 lines)
  const expectedHeader = [
    '# Signals ledger',
    '',
    'Append-only. Written only by `node .ai/bin/protocol-signals.cjs`. Grammar: `docs/specs/signals-ledger.md`.',
    ''
  ];

  if (lines.length < 4) {
    errors.push('line 1: header-truncated');
    return errors;
  }

  for (let i = 0; i < 4; i++) {
    const actual = lines[i].replace(/\r$/, '');
    if (actual !== expectedHeader[i]) {
      errors.push(`line ${i + 1}: header-line-${i + 1}-mismatch`);
    }
  }

  const signalIds = new Map(); // id -> {firstLine: object, lines: number[]}

  for (let i = 4; i < lines.length; i++) {
    const rawLine = lines[i];
    if (i === lines.length - 1 && rawLine === '') continue; // trailing EOF newline
    if (rawLine.trim() === '') continue;

    try {
      const parsed = parseLine(rawLine);

      if (signalIds.has(parsed.id)) {
        const first = signalIds.get(parsed.id);
        // Check immutable fields: type, date, participant, evidence, src
        if (parsed.type !== first.firstLine.type ||
            parsed.date !== first.firstLine.date ||
            parsed.participant !== first.firstLine.participant ||
            parsed.evidence !== first.firstLine.evidence ||
            parsed.src !== first.firstLine.src) {
          errors.push(`line ${i + 1}: immutable field changed for id=${parsed.id}`);
        }
        first.lines.push(i + 1);
      } else {
        signalIds.set(parsed.id, { firstLine: parsed, lines: [i + 1] });
      }
    } catch (e) {
      errors.push(`line ${i + 1}: error="${e.message}"`);
    }
  }

  return errors;
}

/**
 * Read a ledger file and return a Map of signals
 * @param {string} filePath - Path to the ledger file
 * @returns {Map} - Map<id, {first, latest, lines: [n...], batches: Set}>
 * @throws {Error} - If any line is invalid
 */
function readLedger(filePath) {
  const signals = new Map();

  if (!fs.existsSync(filePath)) {
    throw new Error(`file not found: ${filePath}`);
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  const expectedHeader = [
    '# Signals ledger',
    '',
    'Append-only. Written only by `node .ai/bin/protocol-signals.cjs`. Grammar: `docs/specs/signals-ledger.md`.',
    ''
  ];

  if (lines.length < 4) {
    throw new Error('invalid header: file has fewer than 4 header lines');
  }

  for (let i = 0; i < 4; i++) {
    const actual = lines[i].replace(/\r$/, '');
    if (actual !== expectedHeader[i]) {
      throw new Error(`header line ${i + 1} mismatch`);
    }
  }

  for (let i = 4; i < lines.length; i++) {
    const rawLine = lines[i];
    if (i === lines.length - 1 && rawLine === '') continue;
    if (rawLine.trim() === '') continue;

    const parsed = parseLine(rawLine);

    if (signals.has(parsed.id)) {
      const existing = signals.get(parsed.id);
      if (parsed.type !== existing.first.type ||
          parsed.date !== existing.first.date ||
          parsed.participant !== existing.first.participant ||
          parsed.evidence !== existing.first.evidence ||
          parsed.src !== existing.first.src) {
        throw new Error(`line ${i + 1}: immutable field changed for id=${parsed.id}`);
      }
      existing.lines.push(i + 1);
      existing.latest = parsed;
      if (parsed.batch !== '-') {
        existing.batches.add(parsed.batch);
      }
    } else {
      const batches = new Set();
      if (parsed.batch !== '-') {
        batches.add(parsed.batch);
      }
      signals.set(parsed.id, { first: parsed, latest: parsed, lines: [i + 1], batches });
    }
  }

  return signals;
}

/**
 * Check if a process is alive
 * @param {number} pid - Process ID
 * @returns {boolean} - True if process is alive
 */
function isProcessAlive(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch (e) {
    return e.code !== 'ESRCH' && e.code !== 'EPERM';
  }
}

/**
 * Execute a callback under an exclusive file lock
 * Lock file: <dirname(ledger)>/runtime/<basename(ledger)>.lock
 * @param {string} filePath - Path to ledger
 * @param {Function} fn - Operation to execute
 * @param {object} [options] - Optional lock options
 * @returns {*}
 */
function withLock(filePath, fn, options = {}) {
  const dir = path.dirname(path.resolve(filePath));
  const base = path.basename(filePath);
  const runtimeDir = path.join(dir, 'runtime');
  if (!fs.existsSync(runtimeDir)) {
    fs.mkdirSync(runtimeDir, { recursive: true });
  }
  const lockPath = path.join(runtimeDir, `${base}.lock`);
  const envTimeout = process.env.SIGNALS_LOCK_TIMEOUT ? parseInt(process.env.SIGNALS_LOCK_TIMEOUT, 10) : undefined;
  const timeout = options.timeout !== undefined ? options.timeout : (envTimeout !== undefined ? envTimeout : 10000);
  const retryInterval = options.retryInterval !== undefined ? options.retryInterval : 100;
  const pid = process.pid;
  const startTime = Date.now();
  let acquired = false;

  while (Date.now() - startTime < timeout) {
    try {
      fs.writeFileSync(lockPath, String(pid), { flag: 'wx' });
      acquired = true;
      break;
    } catch (e) {
      if (e.code === 'EEXIST') {
        try {
          const content = fs.readFileSync(lockPath, 'utf8').trim();
          const existingPid = parseInt(content, 10);
          if (existingPid && !isProcessAlive(existingPid)) {
            try {
              fs.unlinkSync(lockPath);
              console.log(`WARN reason=stale-lock pid=${existingPid}`);
            } catch (_) {}
            continue;
          }
        } catch (_) {}
        const elapsed = Date.now() - startTime;
        const sleep = Math.min(retryInterval, Math.max(1, timeout - elapsed));
        Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, sleep);
      } else {
        throw e;
      }
    }
  }

  if (!acquired) {
    throw new Error('ledger-busy');
  }

  try {
    return fn();
  } finally {
    try {
      fs.unlinkSync(lockPath);
    } catch (_) {}
  }
}

/**
 * Add a signal to the ledger under exclusive lock
 * @param {string} filePath - Path to the ledger file
 * @param {object} options - Signal options
 * @returns {string} - The assigned signal id
 */
function addSignal(filePath, options) {
  const absPath = path.resolve(filePath);
  const dir = path.dirname(absPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  if (!fs.existsSync(absPath) || fs.readFileSync(absPath, 'utf8').trim() === '') {
    const header = '# Signals ledger\n\n' +
      'Append-only. Written only by `node .ai/bin/protocol-signals.cjs`. Grammar: `docs/specs/signals-ledger.md`.\n\n';
    fs.writeFileSync(absPath, header, 'utf8');
  }

  return withLock(absPath, () => {
    let signals;
    try {
      signals = readLedger(absPath);
    } catch (e) {
      if (e.message.startsWith('file not found')) {
        signals = new Map();
      } else {
        throw e;
      }
    }

    const today = new Date().toISOString().split('T')[0];
    const date = options.date || today;

    if (!isValidCalendarDate(date)) {
      throw new Error(`invalid date: ${date}`);
    }

    let maxDDD = 0;
    const datePrefix = `sig-${date.replace(/-/g, '')}-`;
    for (const [sigId] of signals) {
      if (sigId.startsWith(datePrefix)) {
        const ddd = parseInt(sigId.slice(datePrefix.length), 10);
        if (ddd > maxDDD) maxDDD = ddd;
      }
    }

    const nextDDD = maxDDD + 1;
    if (nextDDD > 999) {
      throw new Error('id-space-exhausted');
    }

    const id = `${datePrefix}${String(nextDDD).padStart(3, '0')}`;
    const type = options.type;
    const participant = options.participant;
    const evidence = options.evidence;
    const cost = options.cost || 'unknown';
    const disposition = options.disposition || 'open';
    const rc = options.rc || '-';
    const batch = options.batch || '-';
    const src = options.src || '-';

    const line = `Signal: ${id} | ${type} | ${date} | ${participant} | ${evidence} | ${cost} | ${disposition} | rc=${rc} | batch=${batch} | src=${src}\n`;

    parseLine(line);

    fs.appendFileSync(absPath, line, 'utf8');
    return id;
  }, options._lockOptions);
}

/**
 * Update a signal in the ledger under exclusive lock
 * @param {string} filePath - Path to the ledger file
 * @param {string} id - Signal id to update
 * @param {object} updates - Fields to update
 */
function updateSignal(filePath, id, updates) {
  const absPath = path.resolve(filePath);
  return withLock(absPath, () => {
    const signals = readLedger(absPath);

    if (!signals.has(id)) {
      throw new Error(`unknown signal id: ${id}`);
    }

    const latest = signals.get(id).latest;
    const disposition = updates.disposition || latest.disposition;
    const rc = updates.rc || latest.rc;
    const batch = updates.batch || latest.batch;

    const line = `Signal: ${id} | ${latest.type} | ${latest.date} | ${latest.participant} | ${latest.evidence} | ${latest.cost} | ${disposition} | rc=${rc} | batch=${batch} | src=${latest.src}\n`;

    parseLine(line);

    fs.appendFileSync(absPath, line, 'utf8');
  });
}

// ============================================================================
// S5: Import of Interim Signal: Lines
// ============================================================================

/**
 * Import interim Signal: lines from journals and ARCHIVE
 * @param {string} ledgerPath - Path to the ledger file
 * @param {string} repoRoot - Repository root
 * @returns {object} - Import results
 */
function importInterim(ledgerPath, repoRoot) {
  const absLedger = path.resolve(ledgerPath);
  const absRoot = path.resolve(repoRoot);

  if (!fs.existsSync(absLedger) || fs.readFileSync(absLedger, 'utf8').trim() === '') {
    const dir = path.dirname(absLedger);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const header = '# Signals ledger\n\n' +
      'Append-only. Written only by `node .ai/bin/protocol-signals.cjs`. Grammar: `docs/specs/signals-ledger.md`.\n\n';
    fs.writeFileSync(absLedger, header, 'utf8');
  }

  // Get tracked files at HEAD
  let trackedFiles = [];
  try {
    const out = execSync('git ls-files -- .ai/ARCHIVE.md .ai/worklog/*.md', { cwd: absRoot, encoding: 'utf8' });
    trackedFiles = out.trim().split('\n').map(f => f.trim().replace(/\\/g, '/')).filter(f => f !== '' && f !== '.ai/worklog/README.md').sort();
  } catch (e) {
    const archivePath = path.join(absRoot, '.ai', 'ARCHIVE.md');
    const worklogDir = path.join(absRoot, '.ai', 'worklog');
    if (fs.existsSync(archivePath)) trackedFiles.push('.ai/ARCHIVE.md');
    if (fs.existsSync(worklogDir)) {
      const wFiles = fs.readdirSync(worklogDir)
        .filter(f => f.endsWith('.md') && f !== 'README.md')
        .map(f => `.ai/worklog/${f}`);
      trackedFiles.push(...wFiles);
    }
    trackedFiles.sort();
  }

  return withLock(absLedger, () => {
    let signals;
    try {
      signals = readLedger(absLedger);
    } catch (e) {
      signals = new Map();
    }

    const seenSrc = new Set();
    for (const [, sig] of signals) {
      if (sig.latest.src && sig.latest.src !== '-') {
        seenSrc.add(sig.latest.src);
      }
    }

    let found = 0;
    let imported = 0;
    let duplicate = 0;
    let skipped = 0;

    for (const relPath of trackedFiles) {
      let content;
      try {
        content = execSync(`git show HEAD:${relPath}`, { cwd: absRoot, encoding: 'utf8' });
      } catch (e) {
        const fullP = path.join(absRoot, relPath);
        if (fs.existsSync(fullP)) {
          content = fs.readFileSync(fullP, 'utf8');
        } else {
          continue;
        }
      }

      const fileLines = content.split('\n');
      let currentDate = null;
      let currentAgent = null;

      for (let i = 0; i < fileLines.length; i++) {
        const rawLine = fileLines[i];

        const dateMatch = rawLine.match(/^## (\d{4}-\d{2}-\d{2})/);
        if (dateMatch) {
          currentDate = dateMatch[1];
          currentAgent = null;
          continue;
        }

        const agentMatch = rawLine.match(/^Agent:\s*(.+)/);
        if (agentMatch) {
          currentAgent = agentMatch[1].trim();
          continue;
        }

        const signalMatch = rawLine.match(/^[\s]*(?:-\s+)?Signal:\s(.*)/);
        if (signalMatch) {
          found++;
          const text = signalMatch[1].trim();
          const sha256 = crypto.createHash('sha256').update(text, 'utf8').digest('hex');

          if (seenSrc.has(sha256)) {
            duplicate++;
            console.log(`DUPLICATE src=${sha256} path=${relPath} line=${i + 1}`);
            continue;
          }
          seenSrc.add(sha256);

          let t = text;
          // Drop leading sig-... token and the | after it, if present
          t = t.replace(/^sig-[A-Za-z0-9._-]+\s*\|\s*/, '');

          // Check type
          const typeMatch = t.match(/^(procedure-gap|script-candidate|fall)(?:$|[\s|.,:;])/);
          if (!typeMatch) {
            console.log(`SKIPPED reason=type-unknown path=${relPath} line=${i + 1}`);
            skipped++;
            continue;
          }
          const type = typeMatch[1];

          let date = null;
          let participant = null;
          let cost = 'unknown';
          let disposition = 'open';

          const isPipeForm = t.includes(' | ');
          if (isPipeForm) {
            const parts = t.split(' | ').map(p => p.trim());
            if (parts.length >= 2 && isValidCalendarDate(parts[1])) {
              date = parts[1];
            }
            if (parts.length >= 3 && /^[A-Za-z0-9._:\/@-]{1,80}$/.test(parts[2])) {
              participant = parts[2];
            }
            if (parts.length >= 5) {
              const c = parts[4];
              if (c === 'unknown' || /^(attempts=\d+|minutes=\d+|owner=\d+)(,(attempts=\d+|minutes=\d+|owner=\d+))*$/.test(c)) {
                cost = c;
              }
            }
            if (parts.length >= 6) {
              if (parts[5].startsWith('closed')) {
                disposition = `closed:${relPath}:${i + 1}`;
              } else if (parts[5].startsWith('rejected')) {
                disposition = 'rejected:interim';
              }
            }
          }

          if (!date) date = currentDate;
          if (!date || !isValidCalendarDate(date)) {
            console.log(`SKIPPED reason=date-unknown path=${relPath} line=${i + 1}`);
            skipped++;
            continue;
          }

          if (!participant) {
            if (relPath.startsWith('.ai/worklog/')) {
              participant = path.basename(relPath, '.md');
            } else {
              if (currentAgent) {
                const cutMatch = currentAgent.match(/^[A-Za-z0-9._:\/@-]+/);
                participant = cutMatch ? cutMatch[0].slice(0, 80) : 'unknown';
              } else {
                participant = 'unknown';
              }
            }
          }

          const evidence = `${relPath}:${i + 1}`;

          // Re-read ledger under lock to compute sequential ID
          signals = readLedger(absLedger);
          let maxDDD = 0;
          const datePrefix = `sig-${date.replace(/-/g, '')}-`;
          for (const [sigId] of signals) {
            if (sigId.startsWith(datePrefix)) {
              const ddd = parseInt(sigId.slice(datePrefix.length), 10);
              if (ddd > maxDDD) maxDDD = ddd;
            }
          }

          const nextDDD = maxDDD + 1;
          if (nextDDD > 999) {
            throw new Error('id-space-exhausted');
          }

          const id = `${datePrefix}${String(nextDDD).padStart(3, '0')}`;
          const newLine = `Signal: ${id} | ${type} | ${date} | ${participant} | ${evidence} | ${cost} | ${disposition} | rc=- | batch=- | src=${sha256}\n`;

          parseLine(newLine);
          fs.appendFileSync(absLedger, newLine, 'utf8');

          imported++;
          console.log(`IMPORTED id=${id} src=${sha256} path=${relPath} line=${i + 1}`);
        }
      }
    }

    return { found, imported, duplicate, skipped };
  });
}

// ============================================================================
// S4: CLI
// ============================================================================

const DEFAULT_LEDGER = path.join(__dirname, '..', '..', '.ai', 'SIGNALS.md');

function printUsage() {
  console.log('USAGE node .ai/bin/protocol-signals.cjs <command> [options]');
  console.log('');
  console.log('Commands:');
  console.log('  init              Initialize a new ledger with header only');
  console.log('  check [--file <f>]   Check ledger validity');
  console.log('  add --type T --participant P --evidence E --cost C [--disposition D] [--rc R] [--batch B] [--date YYYY-MM-DD]');
  console.log('  update <id> [--disposition D] [--rc R] [--batch B]');
  console.log('  list [--type T] [--open]');
  console.log('  count              Count signals by type');
  console.log('  plan --batch B [--stamp]');
  console.log('  export --json      Export signals as JSON');
  console.log('  import            Import interim Signal: lines');
}

function getArg(args, flag, defaultValue = undefined) {
  const index = args.indexOf(flag);
  if (index !== -1 && args.length > index + 1 && !args[index + 1].startsWith('--')) {
    return args[index + 1];
  }
  return defaultValue;
}

function main() {
  const rawArgs = process.argv.slice(2);

  if (rawArgs.length === 0) {
    printUsage();
    process.exit(2);
  }

  const args = [...rawArgs];
  const command = args[0];
  let filePath = DEFAULT_LEDGER;
  const fileIndex = args.indexOf('--file');

  if (fileIndex !== -1 && args.length > fileIndex + 1) {
    filePath = args[fileIndex + 1];
    args.splice(fileIndex, 2);
  } else if (args[1] && !args[1].startsWith('--') && command !== 'update') {
    filePath = args[1];
    args.splice(1, 1);
  }

  try {
    switch (command) {
      case 'init': {
        if (fs.existsSync(filePath)) {
          console.log('ERROR reason=file-exists');
          process.exit(1);
        }
        const dir = path.dirname(path.resolve(filePath));
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        const header = '# Signals ledger\n\n' +
          'Append-only. Written only by `node .ai/bin/protocol-signals.cjs`. Grammar: `docs/specs/signals-ledger.md`.\n\n';
        fs.writeFileSync(filePath, header, 'utf8');
        console.log(`WROTE path=${filePath}`);
        process.exit(0);
        break;
      }

      case 'check': {
        const errors = validateFile(filePath);
        for (const error of errors) {
          const match = error.match(/^line (\d+): (?:error=")?(.*?)"?$/);
          if (match) {
            console.log(`INVALID line=${match[1]} error="${match[2]}"`);
          } else {
            console.log(`INVALID ${error}`);
          }
        }

        let signalsCount = 0;
        try {
          const signals = readLedger(filePath);
          signalsCount = signals.size;
        } catch (e) {
          // If unreadable or only header
        }

        let lineCount = 0;
        try {
          lineCount = fs.readFileSync(filePath, 'utf8').split('\n').filter(l => l.length > 0).length;
        } catch (_) {}

        console.log(`SUMMARY lines=${lineCount} signals=${signalsCount} invalid=${errors.length}`);
        process.exit(errors.length === 0 ? 0 : 2);
        break;
      }

      case 'add': {
        const opts = {
          type: getArg(args, '--type'),
          date: getArg(args, '--date'),
          participant: getArg(args, '--participant'),
          evidence: getArg(args, '--evidence'),
          cost: getArg(args, '--cost', 'unknown'),
          disposition: getArg(args, '--disposition', 'open'),
          rc: getArg(args, '--rc', '-'),
          batch: getArg(args, '--batch', '-'),
          src: getArg(args, '--src', '-')
        };

        if (!opts.type || !opts.participant || !opts.evidence) {
          console.log('ERROR reason=missing-required-field');
          process.exit(2);
        }

        if (!['procedure-gap', 'script-candidate', 'fall'].includes(opts.type)) {
          console.log('ERROR reason=invalid-type');
          process.exit(2);
        }

        if (opts.date && !isValidCalendarDate(opts.date)) {
          console.log('ERROR reason=invalid-date');
          process.exit(2);
        }

        if (!isValidEvidence(opts.evidence)) {
          console.log('ERROR reason=invalid-evidence');
          process.exit(2);
        }

        if (opts.cost !== 'unknown') {
          const costPattern = /^(attempts=\d+|minutes=\d+|owner=\d+)(,(attempts=\d+|minutes=\d+|owner=\d+))*$/;
          if (!costPattern.test(opts.cost)) {
            console.log('ERROR reason=invalid-cost');
            process.exit(2);
          }
        }

        const lockTimeout = getArg(args, '--lock-timeout') || getArg(args, '--timeout');
        if (lockTimeout) {
          opts._lockOptions = { timeout: parseInt(lockTimeout, 10) };
        }

        try {
          const id = addSignal(filePath, opts);
          console.log(`ADDED id=${id}`);
          process.exit(0);
        } catch (err) {
          if (err.message === 'ledger-busy') {
            console.log('ERROR reason=ledger-busy');
            process.exit(1);
          } else {
            console.log(`ERROR reason=${err.message}`);
            process.exit(2);
          }
        }
        break;
      }

      case 'update': {
        if (args.length < 2) {
          console.log('USAGE node .ai/bin/protocol-signals.cjs update <id> [--disposition D] [--rc R] [--batch B]');
          process.exit(2);
        }

        const idToUpdate = args[1];
        const updates = {
          disposition: getArg(args.slice(2), '--disposition'),
          rc: getArg(args.slice(2), '--rc'),
          batch: getArg(args.slice(2), '--batch')
        };

        try {
          updateSignal(filePath, idToUpdate, updates);
          console.log(`UPDATED id=${idToUpdate}`);
          process.exit(0);
        } catch (e) {
          if (e.message.startsWith('unknown signal id')) {
            console.log(`ERROR reason=unknown-id id=${idToUpdate}`);
            process.exit(1);
          } else if (e.message === 'ledger-busy') {
            console.log('ERROR reason=ledger-busy');
            process.exit(1);
          } else {
            console.log(`ERROR reason=${e.message}`);
            process.exit(2);
          }
        }
        break;
      }

      case 'list': {
        const typeFilter = getArg(args, '--type');
        const openOnly = args.includes('--open');

        let signals;
        try {
          signals = readLedger(filePath);
        } catch (e) {
          if (e.message.startsWith('file not found')) {
            console.log('ERROR reason=file-not-found');
            process.exit(1);
          }
          throw e;
        }

        for (const [id, signal] of signals) {
          const latest = signal.latest;
          if (typeFilter && latest.type !== typeFilter) continue;
          if (openOnly && latest.disposition !== 'open' && !latest.disposition.startsWith('grouped:')) continue;

          console.log(`SIGNAL id=${id} type=${latest.type} date=${latest.date} participant=${latest.participant} disposition=${latest.disposition} rc=${latest.rc} batch=${latest.batch}`);
        }
        process.exit(0);
        break;
      }

      case 'count': {
        let signals;
        try {
          signals = readLedger(filePath);
        } catch (e) {
          if (e.message.startsWith('file not found')) {
            console.log('ERROR reason=file-not-found');
            process.exit(1);
          }
          throw e;
        }

        const typeOrder = ['procedure-gap', 'script-candidate', 'fall'];
        const counts = { total: 0, open: 0 };
        const typeCounts = {};

        for (const type of typeOrder) {
          typeCounts[type] = { total: 0, open: 0 };
        }

        for (const [, signal] of signals) {
          const latest = signal.latest;
          counts.total++;
          const isOpen = (latest.disposition === 'open' || latest.disposition.startsWith('grouped:'));
          if (isOpen) {
            counts.open++;
          }

          if (typeOrder.includes(latest.type)) {
            typeCounts[latest.type].total++;
            if (isOpen) {
              typeCounts[latest.type].open++;
            }
          }
        }

        for (const type of typeOrder) {
          console.log(`COUNT type=${type} total=${typeCounts[type].total} open=${typeCounts[type].open}`);
        }
        console.log(`SUMMARY total=${counts.total} open=${counts.open}`);
        process.exit(0);
        break;
      }

      case 'plan': {
        const batchArg = getArg(args, '--batch');
        const stamp = args.includes('--stamp');

        if (!batchArg) {
          console.log('USAGE node .ai/bin/protocol-signals.cjs plan --batch B [--stamp]');
          process.exit(2);
        }

        let signals;
        try {
          signals = readLedger(filePath);
        } catch (e) {
          if (e.message.startsWith('file not found')) {
            console.log('ERROR reason=file-not-found');
            process.exit(1);
          }
          throw e;
        }

        const groupedByRc = new Map();
        const escalateCandidates = new Set();
        const escalateBatches = new Map();
        const toStamp = [];

        for (const [id, signal] of signals) {
          const latest = signal.latest;
          if (latest.disposition === 'open' || latest.disposition.startsWith('grouped:')) {
            if (latest.rc !== '-') {
              if (!groupedByRc.has(latest.rc)) {
                groupedByRc.set(latest.rc, []);
              }
              groupedByRc.get(latest.rc).push(id);
            }

            const batchesForEscalate = new Set(signal.batches);
            if (batchArg) {
              batchesForEscalate.add(batchArg);
            }
            if (batchesForEscalate.size >= 2) {
              escalateCandidates.add(id);
              escalateBatches.set(id, Array.from(batchesForEscalate).sort());
            }

            if (stamp && latest.batch !== batchArg) {
              toStamp.push(id);
            }
          }
        }

        for (const [rc, ids] of groupedByRc) {
          if (ids.length > 0) {
            console.log(`GROUP rc=${rc} ids=${ids.sort().join(',')}`);
          }
        }

        for (const id of Array.from(escalateCandidates).sort()) {
          console.log(`ESCALATE id=${id} batches=${escalateBatches.get(id).join(',')}`);
        }

        if (stamp) {
          for (const id of toStamp) {
            updateSignal(filePath, id, { batch: batchArg });
            console.log(`STAMPED id=${id} batch=${batchArg}`);
          }
        }

        process.exit(0);
        break;
      }

      case 'export': {
        const jsonExport = args.includes('--json');

        let signals;
        try {
          signals = readLedger(filePath);
        } catch (e) {
          if (e.message.startsWith('file not found')) {
            console.log('ERROR reason=file-not-found');
            process.exit(1);
          }
          throw e;
        }

        if (jsonExport) {
          const exported = [];
          for (const [, signal] of signals) {
            exported.push(signal.latest);
          }
          console.log(JSON.stringify(exported, null, 2));
          process.exit(0);
        } else {
          console.log('USAGE node .ai/bin/protocol-signals.cjs export --json');
          process.exit(2);
        }
        break;
      }

      case 'import': {
        const repoArg = getArg(args, '--repo');
        let repoRoot = repoArg || process.cwd();
        try {
          const rootCheck = spawnSync('git', ['rev-parse', '--show-toplevel'], {
            cwd: path.dirname(path.resolve(filePath)),
            encoding: 'utf8'
          });
          if (rootCheck.status === 0 && rootCheck.stdout.trim()) {
            repoRoot = repoArg || rootCheck.stdout.trim();
          }
        } catch (_) {}
        const result = importInterim(filePath, repoRoot);
        console.log(`SUMMARY found=${result.found} imported=${result.imported} duplicate=${result.duplicate} skipped=${result.skipped}`);
        process.exit(result.skipped > 0 ? 1 : 0);
        break;
      }

      default:
        console.log(`ERROR reason=unknown-command command=${command}`);
        process.exit(2);
    }
  } catch (e) {
    console.log(`ERROR reason=${e.message}`);
    process.exit(2);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  parseLine,
  validateFile,
  readLedger,
  addSignal,
  updateSignal,
  importInterim,
  withLock,
  isValidEvidence,
  isValidCalendarDate
};
