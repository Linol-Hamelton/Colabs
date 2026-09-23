#!/usr/bin/env node
'use strict';

// protocol-verdict.cjs - Checks 1 & 2 of docs/specs/2026-09-23-executable-rulebook-spec.md
// Check 1: Verdict arithmetic over a findings ledger
// Check 2: Root-cause stop rule (--stop-rule)
//
// The severity column in the findings ledger is recorded and is NEVER an input to the verdict.
// That separation is the whole point of PROTO-DEC-0041 item 4.

const fs = require('node:fs');
const path = require('node:path');

// PROTO-DEC-0046 item 3: Protected set for check 1 (PROTO-DEC-0041 item 4).
// Read at run time from repository state: every entry of `managed` and of `source`
// in protocol-manifest.json, plus anything under .ai/, .claude/, .codex/.
// Whole paths and directory prefixes only; never a substring or a concept name.
// tests/ is not in the set.
const BASE_PROTECTED_PREFIXES = [
  '.ai/',
  '.claude/',
  '.codex/',
];

function findManifestPath(startDir) {
  const candidates = [
    startDir,
    process.cwd(),
  ].filter(Boolean);

  for (const c of candidates) {
    let cur = path.resolve(c);
    while (true) {
      const candidate = path.join(cur, 'protocol-manifest.json');
      if (fs.existsSync(candidate)) {
        return candidate;
      }
      const parent = path.dirname(cur);
      if (parent === cur) break;
      cur = parent;
    }
  }

  const fallback = path.resolve(__dirname, '..', '..', 'protocol-manifest.json');
  if (fs.existsSync(fallback)) {
    return fallback;
  }
  return null;
}

function loadProtectedSet(manifestPathOrDir) {
  let manifestPath = manifestPathOrDir;
  if (!manifestPath || !manifestPath.endsWith('.json')) {
    manifestPath = findManifestPath(manifestPathOrDir);
  }
  if (!manifestPath || !fs.existsSync(manifestPath)) {
    throw new Error('Cannot load protocol-manifest.json at run time: manifest file not found');
  }

  let manifest;
  try {
    const raw = fs.readFileSync(manifestPath, 'utf8');
    manifest = JSON.parse(raw);
  } catch (err) {
    throw new Error(`Cannot load protocol-manifest.json at run time: ${err.message}`);
  }

  const prefixes = new Set(BASE_PROTECTED_PREFIXES.map(p => p.toLowerCase()));
  const wholePaths = new Set();

  const addEntry = (entry) => {
    if (typeof entry !== 'string') return;
    let norm = entry.trim().replace(/\\/g, '/');
    while (norm.startsWith('./')) {
      norm = norm.slice(2);
    }
    if (!norm) return;
    const lower = norm.toLowerCase();
    if (lower.endsWith('/')) {
      prefixes.add(lower);
    } else {
      wholePaths.add(lower);
    }
  };

  if (Array.isArray(manifest.managed)) {
    for (const e of manifest.managed) {
      addEntry(e);
    }
  }
  if (Array.isArray(manifest.source)) {
    for (const e of manifest.source) {
      addEntry(e);
    }
  }

  return {
    prefixes: Array.from(prefixes),
    wholePaths,
    manifestPath,
  };
}

// PROTO-DEC-0046 item 2: Ledger path contract
// The ledger `paths` field holds repository-root-relative paths.
// Normalise backslashes to `/` and strip a leading `./`.
// Any absolute form - POSIX `/...`, a Windows drive `X:` including drive-relative `X:path`,
// and UNC `\\...` or `//...` - and any `..` segment, before or after normalisation,
// makes the row unparseable and the check exits 2 (BLOCKED).
// Do NOT canonicalise against a root: no path.resolve/path.relative.
function validateAndNormalisePath(rawPath, rowNum) {
  const rowContext = rowNum !== undefined ? ` at row ${rowNum}` : '';
  if (typeof rawPath !== 'string' || !rawPath.trim()) {
    throw new Error(`Malformed findings ledger: empty path${rowContext}`);
  }

  const p = rawPath.trim();

  // Rejection BEFORE normalisation:
  // 1. UNC forms: \\... or //...
  if (p.startsWith('//') || p.startsWith('\\\\')) {
    throw new Error(`Malformed findings ledger: rejected UNC path '${p}'${rowContext}`);
  }

  // 2. POSIX root / root-prefixed: /... or \...
  if (p.startsWith('/') || p.startsWith('\\')) {
    throw new Error(`Malformed findings ledger: rejected absolute/root path '${p}'${rowContext}`);
  }

  // 3. Windows drive forms: X:..., X:/..., X:\...
  if (/^[a-zA-Z]:/.test(p)) {
    throw new Error(`Malformed findings ledger: rejected Windows drive path '${p}'${rowContext}`);
  }

  // 4. Any '..' segment before normalisation
  const rawSegments = p.split(/[\\\/]/);
  if (rawSegments.includes('..')) {
    throw new Error(`Malformed findings ledger: rejected parent directory segment '..' in '${p}'${rowContext}`);
  }

  // Normalisation:
  // Normalise backslashes to '/'
  let norm = p.replace(/\\/g, '/');

  // Strip a leading './'
  while (norm.startsWith('./')) {
    norm = norm.slice(2);
  }

  // Rejection AFTER normalisation:
  if (!norm || norm === '.') {
    throw new Error(`Malformed findings ledger: path '${p}' resolved to empty or dot${rowContext}`);
  }

  if (norm.startsWith('//')) {
    throw new Error(`Malformed findings ledger: rejected UNC path '${p}'${rowContext}`);
  }

  if (norm.startsWith('/')) {
    throw new Error(`Malformed findings ledger: rejected absolute/root path '${p}'${rowContext}`);
  }

  if (/^[a-zA-Z]:/.test(norm)) {
    throw new Error(`Malformed findings ledger: rejected Windows drive path '${p}'${rowContext}`);
  }

  const normSegments = norm.split('/');
  if (normSegments.includes('..')) {
    throw new Error(`Malformed findings ledger: rejected parent directory segment '..' in '${p}'${rowContext}`);
  }

  return norm;
}

function isProtectedPath(rawPath, customProtectedSet) {
  if (typeof rawPath !== 'string') return false;
  let norm;
  try {
    norm = validateAndNormalisePath(rawPath);
  } catch {
    return false;
  }

  const set = customProtectedSet || loadProtectedSet();
  const lower = norm.toLowerCase();

  // Match directory prefixes: .ai/, .claude/, .codex/
  for (const prefix of set.prefixes) {
    if (lower.startsWith(prefix) || lower === prefix.slice(0, -1)) {
      return true;
    }
  }

  // Match normalised whole paths
  if (set.wholePaths.has(lower)) {
    return true;
  }

  return false;
}

function parseFindingsLedger(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Findings ledger file not found: ${filePath}`);
  }
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split(/\r?\n/);

  // Find table header row
  let headerIndex = -1;
  let headers = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('|') && line.endsWith('|')) {
      const cells = line.slice(1, -1).split('|').map(c => c.trim().toLowerCase());
      if (cells.includes('id') && cells.includes('root-cause') && cells.includes('requirement')) {
        headerIndex = i;
        headers = cells;
        break;
      }
    }
  }

  if (headerIndex === -1) {
    throw new Error('Malformed findings ledger: no table header row found');
  }

  const requiredFields = [
    'id',
    'root-cause',
    'requirement',
    'paths',
    'reproduction',
    'exit',
    'severity',
    'disposition',
    'attempt',
  ];

  for (const req of requiredFields) {
    if (!headers.includes(req)) {
      throw new Error(`Malformed findings ledger: missing required column '${req}' in header`);
    }
  }

  const rows = [];
  const seenIds = new Set();

  for (let i = headerIndex + 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line.startsWith('|') || !line.endsWith('|')) {
      // End of table or non-table line
      if (rows.length > 0 && line === '') break;
      continue;
    }
    // Skip separator row (e.g. |---|---|)
    if (/^\|(?:\s*[-:]+\s*\|)+$/.test(line)) {
      continue;
    }

    const cells = line.slice(1, -1).split('|').map(c => c.trim());
    if (cells.length < headers.length) {
      throw new Error(`Malformed findings ledger: row ${i + 1} has ${cells.length} columns, expected at least ${headers.length}`);
    }

    const rowObj = {};
    for (let h = 0; h < headers.length; h++) {
      rowObj[headers[h]] = cells[h];
    }

    // Validate required fields
    for (const req of requiredFields) {
      if (rowObj[req] === undefined || rowObj[req] === '') {
        throw new Error(`Malformed findings ledger: row ${i + 1} has empty required field '${req}'`);
      }
    }

    // Check unique id
    if (seenIds.has(rowObj.id)) {
      throw new Error(`Malformed findings ledger: duplicate id '${rowObj.id}' at row ${i + 1}`);
    }
    seenIds.add(rowObj.id);

    // Validate and normalise paths (PROTO-DEC-0046 item 2)
    const rawPaths = rowObj.paths.split(',').map(p => p.trim());
    if (rawPaths.length === 0 || rawPaths.some(p => !p)) {
      throw new Error(`Malformed findings ledger: row ${i + 1} has empty path in '${rowObj.paths}'`);
    }
    const normalisedPaths = rawPaths.map(p => validateAndNormalisePath(p, i + 1));
    rowObj.paths = normalisedPaths.join(', ');

    // Validate severity (recorded only; NEVER used in verdict)
    const validSeverities = ['HIGH', 'MEDIUM', 'LOW', 'INFO'];
    if (!validSeverities.includes(rowObj.severity.toUpperCase())) {
      throw new Error(`Malformed findings ledger: invalid severity '${rowObj.severity}' at row ${i + 1}`);
    }

    // Validate disposition
    const validDispositions = ['confirmed', 'refuted', 'fixed-and-verified', 'deferred-by-owner', 'unresolved', 'unrunnable'];
    if (!validDispositions.includes(rowObj.disposition.toLowerCase())) {
      throw new Error(`Malformed findings ledger: invalid disposition '${rowObj.disposition}' at row ${i + 1}`);
    }

    // Validate attempt (positive integer)
    const attemptNum = parseInt(rowObj.attempt, 10);
    if (Number.isNaN(attemptNum) || attemptNum < 1 || String(attemptNum) !== rowObj.attempt) {
      throw new Error(`Malformed findings ledger: invalid attempt '${rowObj.attempt}' at row ${i + 1}; must be positive integer`);
    }
    rowObj._attemptNum = attemptNum;

    rows.push(rowObj);
  }

  if (rows.length === 0) {
    throw new Error('Malformed findings ledger: table contains no data rows');
  }

  return rows;
}

// Check 1: Verdict arithmetic
function computeVerdict(rows, customProtectedSet) {
  const protectedSet = customProtectedSet || loadProtectedSet();
  // CRITICAL INVARIANT: severity is NEVER read when computing verdict.
  // We explicitly sanitize rows to demonstrate this invariant cannot be violated.
  const sanitizedRows = rows.map(r => {
    const copy = { ...r };
    delete copy.severity;
    return copy;
  });

  const drivingRows = [];
  let advisoryCount = 0;

  // Rule 1: Any row with disposition: unresolved, or with a required check the reviewer recorded as unrunnable -> BLOCKED
  for (const row of sanitizedRows) {
    const isUnresolved = row.disposition.toLowerCase() === 'unresolved';
    const isUnrunnable = row.disposition.toLowerCase() === 'unrunnable' ||
                         row.exit.toLowerCase() === 'unrunnable' ||
                         row.reproduction.toLowerCase() === 'unrunnable' ||
                         /unrunnable/i.test(row.reproduction);
    if (isUnresolved || isUnrunnable) {
      drivingRows.push({
        row,
        reason: isUnresolved ? 'disposition is unresolved' : 'check recorded as unrunnable',
        target: 'BLOCKED'
      });
    }
  }
  if (drivingRows.length > 0) {
    return { verdict: 'BLOCKED', exitCode: 2, drivingRows };
  }

  // Rule 2: Any row with disposition: confirmed AND reproduction not none AND paths intersecting protected list -> FAIL
  for (const row of sanitizedRows) {
    const isConfirmed = row.disposition.toLowerCase() === 'confirmed';
    const hasRepro = row.reproduction.toLowerCase() !== 'none';
    if (isConfirmed && hasRepro) {
      const paths = row.paths.split(',').map(p => p.trim()).filter(Boolean);
      const hitProtected = paths.some(p => isProtectedPath(p, protectedSet));
      if (hitProtected) {
        drivingRows.push({
          row,
          reason: `confirmed finding with reproduction touching protected path(s): ${paths.filter(p => isProtectedPath(p, protectedSet)).join(', ')}`,
          target: 'FAIL'
        });
      }
    }
  }
  if (drivingRows.length > 0) {
    return { verdict: 'FAIL', exitCode: 1, drivingRows };
  }

  // Rule 3: Any row with disposition: confirmed and a reproduction, off protected paths ->
  // FAIL if the requirement names an invariant or contract, otherwise RECOMMENDATION
  for (const row of sanitizedRows) {
    const isConfirmed = row.disposition.toLowerCase() === 'confirmed';
    const hasRepro = row.reproduction.toLowerCase() !== 'none';
    if (isConfirmed && hasRepro) {
      const namesInvariantOrContract = /invariant|contract/i.test(row.requirement);
      if (namesInvariantOrContract) {
        drivingRows.push({
          row,
          reason: `confirmed finding with reproduction names invariant or contract: '${row.requirement}'`,
          target: 'FAIL'
        });
      } else {
        drivingRows.push({
          row,
          reason: `confirmed finding with reproduction off protected paths: '${row.requirement}'`,
          target: 'RECOMMENDATION'
        });
      }
    }
  }

  // Check for confirmed rows without reproduction (advisory)
  for (const row of sanitizedRows) {
    const isConfirmed = row.disposition.toLowerCase() === 'confirmed';
    const hasRepro = row.reproduction.toLowerCase() !== 'none';
    if (isConfirmed && !hasRepro) {
      advisoryCount++;
      drivingRows.push({
        row,
        reason: 'confirmed finding with reproduction none is advisory by AGENTS section 2 (cannot raise verdict above RECOMMENDATION)',
        target: 'RECOMMENDATION'
      });
    }
  }

  const failRows = drivingRows.filter(d => d.target === 'FAIL');
  if (failRows.length > 0) {
    return { verdict: 'FAIL', exitCode: 1, drivingRows: failRows };
  }

  const recRows = drivingRows.filter(d => d.target === 'RECOMMENDATION');
  if (recRows.length > 0) {
    return { verdict: 'RECOMMENDATION', exitCode: 0, drivingRows: recRows, advisoryCount };
  }

  // Rule 4: Otherwise -> PASS
  return { verdict: 'PASS', exitCode: 0, drivingRows: [] };
}

// Check 2: Root-cause stop rule
function checkStopRule(rows) {
  // Group rows by root-cause
  const groups = new Map();
  for (const row of rows) {
    const rc = row['root-cause'];
    if (!groups.has(rc)) {
      groups.set(rc, []);
    }
    groups.get(rc).push(row);
  }

  // Check attempt contiguity and limits for each root-cause
  const violations = [];
  for (const [rc, groupRows] of groups.entries()) {
    const attempts = groupRows.map(r => r._attemptNum);
    const uniqueAttempts = Array.from(new Set(attempts)).sort((a, b) => a - b);

    // Contiguity check: must start at 1 and have no gaps
    for (let i = 0; i < uniqueAttempts.length; i++) {
      if (uniqueAttempts[i] !== i + 1) {
        return {
          ok: false,
          exitCode: 2,
          error: `Ledger defect: root-cause '${rc}' has non-contiguous attempts [${uniqueAttempts.join(', ')}]; expected contiguous sequence starting at 1.`
        };
      }
    }

    const maxAttempt = uniqueAttempts[uniqueAttempts.length - 1];
    if (maxAttempt >= 3) {
      violations.push({
        rootCause: rc,
        maxAttempt,
        rows: groupRows
      });
    }
  }

  if (violations.length > 0) {
    return {
      ok: false,
      exitCode: 1,
      violations
    };
  }

  return { ok: true, exitCode: 0, groupCount: groups.size };
}

function main(argv) {
  const args = argv.slice();
  const stopRule = args.includes('--stop-rule');
  const pathArgs = args.filter(a => a !== '--stop-rule');

  if (pathArgs.length === 0) {
    process.stderr.write('Usage: protocol-verdict.cjs <ledger-path> [--stop-rule]\n');
    return 2;
  }

  const ledgerPath = path.resolve(pathArgs[0]);
  let rows;
  try {
    rows = parseFindingsLedger(ledgerPath);
  } catch (err) {
    process.stderr.write(`BLOCKED: ${err.message}\n`);
    return 2;
  }

  if (stopRule) {
    const stopResult = checkStopRule(rows);
    if (!stopResult.ok) {
      if (stopResult.exitCode === 2) {
        process.stderr.write(`LEDGER ERROR (exit 2): ${stopResult.error}\n`);
        return 2;
      }
      process.stdout.write('STOP RULE TRIGGERED (exit 1):\n');
      for (const v of stopResult.violations) {
        process.stdout.write(`Root cause '${v.rootCause}' reached attempt ${v.maxAttempt} (limit is 2):\n`);
        for (const r of v.rows) {
          process.stdout.write(`  - Finding ${r.id}, attempt ${r.attempt}, disposition '${r.disposition}', requirement: ${r.requirement}\n`);
        }
      }
      process.stdout.write('Rule requirement: stop and return the area or the premise to the owner, not open another round.\n');
      return 1;
    }
    process.stdout.write(`PASS: Root-cause stop rule satisfied across ${stopResult.groupCount} group(s); no root cause reached attempt 3.\n`);
    return 0;
  }

  let protectedSet;
  try {
    protectedSet = loadProtectedSet(path.dirname(ledgerPath));
  } catch (err) {
    process.stderr.write(`BLOCKED: ${err.message}\n`);
    return 2;
  }

  const result = computeVerdict(rows, protectedSet);
  process.stdout.write(`Verdict: ${result.verdict}\n`);
  if (result.drivingRows && result.drivingRows.length > 0) {
    process.stdout.write('Driving finding(s):\n');
    for (const d of result.drivingRows) {
      process.stdout.write(`  [${d.row.id}] root-cause: ${d.row['root-cause']}, paths: ${d.row.paths}, disposition: ${d.row.disposition}, repro: ${d.row.reproduction}\n`);
      process.stdout.write(`    -> Reason: ${d.reason}\n`);
    }
  } else {
    process.stdout.write('No blocking or advisory findings detected.\n');
  }

  return result.exitCode;
}

if (require.main === module) {
  process.exitCode = main(process.argv.slice(2));
}

module.exports = {
  BASE_PROTECTED_PREFIXES,
  PROTECTED_PREFIXES: BASE_PROTECTED_PREFIXES,
  findManifestPath,
  loadProtectedSet,
  validateAndNormalisePath,
  isProtectedPath,
  parseFindingsLedger,
  computeVerdict,
  checkStopRule,
  main,
};
