'use strict';
// AUTOCYCLE mailbox and consensus rule engine. ASCII only, no dependencies.
// Run from the repository root.
//
//   node docs/research/2026-09-28-autocycle/tools/mailbox.cjs pending-request
//   node docs/research/2026-09-28-autocycle/tools/mailbox.cjs wait-request [--interval 180] [--timeout 0]
//   node docs/research/2026-09-28-autocycle/tools/mailbox.cjs wait-prompt <Cnn> [--interval 120] [--timeout 5400]
//   node docs/research/2026-09-28-autocycle/tools/mailbox.cjs tally <tally.json>
//   node docs/research/2026-09-28-autocycle/tools/mailbox.cjs efficiency <row.json>
//
// Exit codes: 0 found / ok, 2 usage or input error, 3 nothing pending, 4 timeout.

const { execFileSync } = require('node:child_process');
const fs = require('node:fs');

const DIR = 'docs/research/2026-09-28-autocycle/cycles';
const REQUEST_BRANCH = 'origin/v2.0.0';
const PROMPT_BRANCH = 'origin/autocycle-claude';
const READY = /^STATUS: READY\b/;

function git(args) {
  return execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
}
function tryGit(args) {
  try { return git(args); } catch { return null; }
}
function fetch() { tryGit(['fetch', '-q', 'origin']); }
function isReady(text) {
  if (text === null) return false;
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  return lines.length > 0 && READY.test(lines[lines.length - 1]);
}
function readyAt(ref, path) { return isReady(tryGit(['show', `${ref}:${path}`])); }
function cyclesOn(ref) {
  const out = tryGit(['ls-tree', '-d', '--name-only', `${ref}:${DIR}`]);
  if (out === null) return [];
  return out.split('\n').map(s => s.trim()).filter(s => /^C\d{2,}$/.test(s)).sort();
}
function pending() {
  for (const c of cyclesOn(REQUEST_BRANCH)) {
    const req = `${DIR}/${c}/05-FINAL-REQUEST.md`;
    const res = `${DIR}/${c}/06-FINAL-PROMPT.md`;
    if (readyAt(REQUEST_BRANCH, req) && !readyAt(PROMPT_BRANCH, res)) return c;
  }
  return null;
}
function opt(args, name, dflt) {
  const i = args.indexOf(name);
  if (i < 0) return dflt;
  const v = Number(args[i + 1]);
  if (!Number.isFinite(v) || v < 0) { console.log(`ERROR reason=bad-option name=${name}`); process.exit(2); }
  return v;
}
function sleep(sec) { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, sec * 1000); }

// ---- consensus rule (owner rule 2026-09-28, see AUTOCYCLE-PROMPT.md section 5) ----
// A point's history holds only its VOTING rounds (rounds in which every participant voted on it),
// with round numbers of the cycle. pct = support / n * 100.
function classify(point, round, maxRounds) {
  const h = point.history || [];
  if (!h.length) return { status: 'OPEN', reason: 'no voting round yet' };
  for (const r of h) {
    if (!Number.isInteger(r.round) || !Number.isInteger(r.support) || !Number.isInteger(r.n)) throw new Error(`${point.id}: non-integer history entry`);
    if (r.n < 2) throw new Error(`${point.id}: n must be >= 2 (round ${r.round})`);
    if (r.support < 0 || r.support > r.n) throw new Error(`${point.id}: support out of range (round ${r.round})`);
  }
  for (let i = 1; i < h.length; i++) if (h[i].round <= h[i - 1].round) throw new Error(`${point.id}: rounds not increasing`);
  if (h[h.length - 1].round > round) throw new Error(`${point.id}: history round ${h[h.length - 1].round} is after the current round ${round}`);
  const pct = r => (r.support * 100) / r.n;
  const last = h[h.length - 1];
  const p = pct(last);
  const tail = k => {
    if (h.length < k) return null;
    const t = h.slice(h.length - k);
    for (let i = 1; i < t.length; i++) if (t[i].round !== t[i - 1].round + 1) return null; // not consecutive
    return t;
  };
  let status = null; let reason = '';
  if (p === 100) { status = 'ACCEPTED'; reason = '100% in one round'; }
  else if (tail(2) && tail(2).every(r => pct(r) >= 80)) { status = 'ACCEPTED'; reason = '>=80% in two consecutive rounds'; }
  else if (tail(3) && tail(3).every(r => pct(r) >= 60)) { status = 'ACCEPTED'; reason = '>=60% in three consecutive rounds'; }
  else if (p >= 40 && p < 60) { status = 'HYPOTHESIS'; reason = '40-59%'; }
  else if (p < 40 && h.length >= 2) { status = 'DROPPED'; reason = '<40% after its second voting round'; }
  else if (round >= maxRounds) {
    status = p >= 60 ? 'OWNER' : (p < 40 ? 'DROPPED' : 'HYPOTHESIS');
    reason = `round limit ${maxRounds} reached at ${p.toFixed(1)}%`;
  } else { status = 'OPEN'; reason = `${p.toFixed(1)}%, waiting for next round`; }
  if (point.blocker && status !== 'ACCEPTED') { reason += '; blocker -> owner'; status = 'OWNER'; }
  if (point.reserved) { reason += '; reserved category (delegation limit) -> owner'; status = 'OWNER'; }
  return { status, reason, pct: Number(p.toFixed(1)) };
}

function efficiency(row) {
  const q = Number(row.quality_q); const v = Number(row.volume_v);
  const cost = Math.max(Number(row.cost_shadow_usd), 0.001);
  const min = Math.max(Number(row.wall_s) / 60, 0.1);
  if (![q, v, cost, min].every(Number.isFinite)) throw new Error('quality_q, volume_v, cost_shadow_usd, wall_s must be numbers');
  return Number(((q * v) / (cost * min)).toFixed(3));
}

const [cmd, ...args] = process.argv.slice(2);
try {
  if (cmd === 'pending-request') {
    fetch();
    const c = pending();
    if (c) { console.log(`PENDING cycle=${c}`); process.exit(0); }
    console.log('NONE'); process.exit(3);
  } else if (cmd === 'wait-request') {
    const interval = opt(args, '--interval', 180); const timeout = opt(args, '--timeout', 0);
    const start = Date.now();
    for (;;) {
      fetch();
      const c = pending();
      if (c) { console.log(`PENDING cycle=${c}`); process.exit(0); }
      if (timeout && (Date.now() - start) / 1000 >= timeout) { console.log('TIMEOUT'); process.exit(4); }
      sleep(interval);
    }
  } else if (cmd === 'wait-prompt') {
    const c = args[0];
    if (!/^C\d{2,}$/.test(c || '')) { console.log('ERROR reason=usage cycle=Cnn'); process.exit(2); }
    const interval = opt(args, '--interval', 120); const timeout = opt(args, '--timeout', 5400);
    const start = Date.now();
    for (;;) {
      fetch();
      if (readyAt(PROMPT_BRANCH, `${DIR}/${c}/06-FINAL-PROMPT.md`)) { console.log(`READY cycle=${c}`); process.exit(0); }
      if (timeout && (Date.now() - start) / 1000 >= timeout) { console.log(`TIMEOUT cycle=${c}`); process.exit(4); }
      sleep(interval);
    }
  } else if (cmd === 'tally') {
    const data = JSON.parse(fs.readFileSync(args[0], 'utf8'));
    const round = Number(data.round); const maxRounds = Number(data.maxRounds);
    if (!Number.isInteger(round) || !Number.isInteger(maxRounds) || round < 1 || maxRounds < 1) throw new Error('round and maxRounds must be integers >= 1');
    let open = 0;
    for (const point of data.points || []) {
      const r = classify(point, round, maxRounds);
      if (r.status === 'OPEN') open++;
      console.log(`POINT id=${point.id} status=${r.status} pct=${r.pct === undefined ? '-' : r.pct} reason="${r.reason}"`);
    }
    console.log(`RESULT exit=0 open=${open} round=${round} maxRounds=${maxRounds}`);
    process.exit(0);
  } else if (cmd === 'efficiency') {
    const row = JSON.parse(fs.readFileSync(args[0], 'utf8'));
    console.log(`EFFICIENCY E=${efficiency(row)}`);
    process.exit(0);
  } else {
    console.log('ERROR reason=usage commands=pending-request|wait-request|wait-prompt|tally|efficiency');
    process.exit(2);
  }
} catch (e) {
  console.log(`ERROR reason="${String(e.message).replace(/"/g, "'")}"`);
  process.exit(2);
}
