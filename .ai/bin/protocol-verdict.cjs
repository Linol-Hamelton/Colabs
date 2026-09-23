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
  const targetDir = path.resolve(startDir || process.cwd());

  let repoRoot = null;
  try {
    const out = require('node:child_process').execFileSync('git', ['rev-parse', '--show-toplevel'], {
      cwd: targetDir,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      windowsHide: true,
    });
    repoRoot = out.trim();
  } catch {
    let cur = targetDir;
    while (true) {
      if (fs.existsSync(path.join(cur, '.git'))) {
        repoRoot = cur;
        break;
      }
      const parent = path.dirname(cur);
      if (parent === cur) break;
      cur = parent;
    }
  }

  if (repoRoot) {
    const candidate = path.join(repoRoot, 'protocol-manifest.json');
    if (fs.existsSync(candidate)) {
      return candidate;
    }
    return null;
  }

  const candidate = path.join(targetDir, 'protocol-manifest.json');
  if (fs.existsSync(candidate)) {
    return candidate;
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

  if (typeof manifest !== 'object' || manifest === null || Array.isArray(manifest)) {
    throw new Error('Cannot load protocol-manifest.json at run time: manifest must be a JSON object');
  }

  if (!Array.isArray(manifest.managed) || manifest.managed.length === 0) {
    throw new Error('Cannot load protocol-manifest.json at run time: managed must be a non-empty array');
  }
  if (!Array.isArray(manifest.source) || manifest.source.length === 0) {
    throw new Error('Cannot load protocol-manifest.json at run time: source must be a non-empty array');
  }

  for (const item of manifest.managed) {
    if (typeof item !== 'string' || !item.trim()) {
      throw new Error('Cannot load protocol-manifest.json at run time: managed entries must be non-empty strings');
    }
  }
  for (const item of manifest.source) {
    if (typeof item !== 'string' || !item.trim()) {
      throw new Error('Cannot load protocol-manifest.json at run time: source entries must be non-empty strings');
    }
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

  for (const e of manifest.managed) {
    addEntry(e);
  }
  for (const e of manifest.source) {
    addEntry(e);
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

  // Check for fenced code blocks containing hidden rows
  let inFence = false;
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i].trim();
    if (l.startsWith('```') || l.startsWith('~~~')) {
      inFence = !inFence;
      continue;
    }
    if (inFence) {
      if (l.includes('|') && (l.startsWith('|') || l.endsWith('|') || l.split('|').length >= 4)) {
        throw new Error(`Malformed findings ledger: table row hidden inside fenced code block at line ${i + 1}`);
      }
    }
  }

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

  // Check duplicate headers (duplicate column names)
  const headerSet = new Set();
  for (const h of headers) {
    if (headerSet.has(h)) {
      throw new Error(`Malformed findings ledger: duplicate column '${h}' in header`);
    }
    headerSet.add(h);
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

  // Next non-empty line must be separator row
  let separatorIndex = -1;
  for (let i = headerIndex + 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    if (/^\|(?:\s*[-:]+\s*\|)+$/.test(line)) {
      separatorIndex = i;
      break;
    } else {
      throw new Error(`Malformed findings ledger: expected table separator row after header, found '${line}'`);
    }
  }

  if (separatorIndex === -1) {
    throw new Error('Malformed findings ledger: missing table separator row');
  }

  const rows = [];
  const seenIds = new Set();
  let inTable = true;

  for (let i = separatorIndex + 1; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    if (!line) {
      if (inTable && rows.length > 0) {
        inTable = false;
      }
      continue;
    }

    // Strip inline backtick code spans to avoid mistaking markdown code for table columns
    const lineNoCode = line.replace(/`[^`]*`/g, '');
    const pipeCount = (lineNoCode.match(/\|/g) || []).length;
    const startsWithPipe = line.startsWith('|');
    const endsWithPipe = line.endsWith('|');

    // Detect if a line looks like an attempted table row:
    // 1. It starts and ends with |
    // 2. OR it has multiple pipes (pipeCount >= 2) and either starts or ends with |, or pipeCount >= 3 without being a list or heading
    const isTableRowShape = (startsWithPipe && endsWithPipe) ||
      (pipeCount >= 2 && (startsWithPipe || endsWithPipe)) ||
      (pipeCount >= 3 && !line.startsWith('#') && !line.startsWith('- ') && !line.startsWith('* '));

    if (inTable && !isTableRowShape) {
      if (rows.length > 0) {
        inTable = false;
      }
    }

    if (isTableRowShape && (!startsWithPipe || !endsWithPipe)) {
      if (!startsWithPipe) {
        throw new Error(`Malformed findings ledger: row at line ${i + 1} missing leading |`);
      }
      if (!endsWithPipe) {
        throw new Error(`Malformed findings ledger: row at line ${i + 1} missing trailing |`);
      }
    }

    if (!isTableRowShape) {
      continue;
    }

    // Line starts and ends with |
    if (!inTable && rows.length > 0) {
      throw new Error(`Malformed findings ledger: table interrupted by blank line or prose at line ${i + 1} (table must be contiguous)`);
    }

    // Check if line is a second table separator or header
    if (/^\|(?:\s*[-:]+\s*\|)+$/.test(line)) {
      throw new Error(`Malformed findings ledger: multiple tables detected at line ${i + 1}`);
    }

    const cells = line.slice(1, -1).split('|').map(c => c.trim());
    const lowerCells = cells.map(c => c.toLowerCase());
    if (lowerCells.includes('id') && lowerCells.includes('root-cause') && lowerCells.includes('requirement')) {
      throw new Error(`Malformed findings ledger: multiple tables detected at line ${i + 1}`);
    }

    if (cells.length !== headers.length) {
      throw new Error(`Malformed findings ledger: row at line ${i + 1} has ${cells.length} columns, expected ${headers.length}`);
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

    // Validate exit cell (integer or n/a)
    const exitVal = rowObj.exit.trim().toLowerCase();
    if (exitVal !== 'n/a' && !/^-?\d+$/.test(exitVal)) {
      throw new Error(`Malformed findings ledger: invalid exit code '${rowObj.exit}' at row ${i + 1}; expected integer or n/a`);
    }

    // Validate severity (recorded only; NEVER used in verdict)
    const validSeverities = ['HIGH', 'MEDIUM', 'LOW', 'INFO'];
    if (!validSeverities.includes(rowObj.severity.toUpperCase())) {
      throw new Error(`Malformed findings ledger: invalid severity '${rowObj.severity}' at row ${i + 1}`);
    }

    // Validate disposition (closed set of 5 recorded dispositions)
    const validDispositions = ['confirmed', 'refuted', 'fixed-and-verified', 'deferred-by-owner', 'unresolved'];
    if (!validDispositions.includes(rowObj.disposition.toLowerCase())) {
      throw new Error(`Malformed findings ledger: invalid disposition '${rowObj.disposition}' at row ${i + 1}`);
    }

    // Validate attempt (positive integer)
    if (!/^[1-9]\d*$/.test(rowObj.attempt)) {
      throw new Error(`Malformed findings ledger: invalid attempt '${rowObj.attempt}' at row ${i + 1}; must be positive integer`);
    }
    const attemptNum = parseInt(rowObj.attempt, 10);
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
    const isUnrunnable = (row.disposition.toLowerCase() !== 'fixed-and-verified' && row.disposition.toLowerCase() !== 'refuted') &&
                         (row.reproduction.trim().toLowerCase() === 'unrunnable' || row.exit.trim().toLowerCase() === 'unrunnable');
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
  // FAIL if the row explicitly records a reproduced invariant or contract violation, otherwise RECOMMENDATION
  for (const row of sanitizedRows) {
    const isConfirmed = row.disposition.toLowerCase() === 'confirmed';
    const hasRepro = row.reproduction.toLowerCase() !== 'none';
    if (isConfirmed && hasRepro) {
      const req = row.requirement.trim();
      const isNegated = /\bno\s+(?:recorded\s+)?(?:invariant|contract)\b/i.test(req);
      const isExplicitViolation = !isNegated && (
        /^(?:recorded\s+)?(?:invariant|contract)\b/i.test(req) ||
        /(?:violated|broken|reproduced|breached)\s+(?:invariant|contract)/i.test(req) ||
        /(?:invariant|contract)\s+(?:violated|broken|reproduced|breached)/i.test(req)
      );
      if (isExplicitViolation) {
        drivingRows.push({
          row,
          reason: `confirmed finding with reproduction violates recorded invariant or contract: '${req}'`,
          target: 'FAIL'
        });
      } else {
        drivingRows.push({
          row,
          reason: `confirmed finding with reproduction off protected paths: '${req}'`,
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
