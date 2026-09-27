'use strict';
// Shared helpers for the performance harness. No side effects on import.
const fs = require('node:fs');
const path = require('node:path');

const repoRoot = path.resolve(__dirname, '..', '..');

function quantile(values, p) {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.round((sorted.length - 1) * p))];
}

function readTap(file) {
  const raw = fs.readFileSync(file);
  const text = (raw[0] === 0xFF && raw[1] === 0xFE) ? raw.toString('utf16le') : raw.toString('utf8');
  return text.replace(/^\uFEFF/, '');
}

// Top-level test results with durations: [{ name, ms, ok }].
function parseTap(text) {
  const lines = text.split(/\r?\n/);
  const rows = [];
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^(not )?ok \d+ - (.*?)(?: # .*)?$/);
    if (!m) continue;
    for (let j = i + 1; j < Math.min(i + 6, lines.length); j++) {
      const d = lines[j].match(/^ {2}duration_ms: ([\d.]+)/);
      if (d) { rows.push({ name: m[2].replace(/\\\\/g, '\\'), ms: Number(d[1]), ok: !m[1] }); break; }
    }
  }
  const totals = {};
  for (const key of ['tests', 'pass', 'fail', 'cancelled', 'skipped', 'duration_ms']) {
    const m = text.match(new RegExp(`^# ${key} ([\\d.]+)`, 'm'));
    if (m) totals[key] = Number(m[1]);
  }
  return { rows, totals };
}

// Test name -> test file, from the string literals in tests/*.test.cjs.
function testNameIndex(root = repoRoot) {
  const index = new Map();
  const dir = path.join(root, 'tests');
  for (const file of fs.readdirSync(dir).filter(f => f.endsWith('.test.cjs'))) {
    const source = fs.readFileSync(path.join(dir, file), 'utf8');
    for (const m of source.matchAll(/\b(?:test|it|describe)\(\s*(['"`])((?:\\.|(?!\1).)*)\1/g)) {
      index.set(m[2].replace(/\\(['"`\\])/g, '$1'), file);
    }
  }
  return index;
}

// Per-file serial time: tests inside one file run in sequence, so their durations add up.
function perFileSerial(rows, index) {
  const perFile = {};
  let unmappedMs = 0;
  let unmapped = 0;
  for (const row of rows) {
    if (/\.test\.cjs$/.test(row.name)) continue;
    const file = index.get(row.name);
    if (!file) { unmapped++; unmappedMs += row.ms; continue; }
    perFile[file] = (perFile[file] || 0) + row.ms;
  }
  const sorted = Object.entries(perFile).sort((a, b) => b[1] - a[1]).map(([file, ms]) => ({ file, s: +(ms / 1000).toFixed(1) }));
  return { files: sorted, unmapped, unmappedS: +(unmappedMs / 1000).toFixed(1) };
}

function parseArgs(argv, defaults) {
  const options = { ...defaults };
  for (let i = 0; i < argv.length; i++) {
    const m = argv[i].match(/^--([\w-]+)$/);
    if (!m) throw new Error(`Unexpected argument: ${argv[i]}`);
    const key = m[1];
    if (!(key in defaults)) throw new Error(`Unknown option --${key}`);
    if (typeof defaults[key] === 'boolean') options[key] = true;
    else options[key] = argv[++i];
  }
  return options;
}

module.exports = { repoRoot, quantile, readTap, parseTap, testNameIndex, perFileSerial, parseArgs };
