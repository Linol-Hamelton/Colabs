'use strict';
// Summarises one bench run directory (<out>/<stamp>-<tag>/c<N>-r<k>): spawned processes by kind,
// latency distributions, fixture churn, helper calls, per-file worker wall time, per-file serial time
// and slowest tests.
//   node tools/perf/report.cjs <run-dir with stats/ and suite.tap | stats-dir>
const fs = require('node:fs');
const path = require('node:path');
const { quantile, readTap, parseTap, testNameIndex, perFileSerial } = require('./lib.cjs');

const inputDir = process.argv[2];
if (!inputDir) {
  console.error('usage: node tools/perf/report.cjs <run-dir with stats/ or stats-dir>');
  process.exit(1);
}

const resolved = path.resolve(inputDir);
let runDir, statsDir;
if (path.basename(resolved) === 'stats' && fs.existsSync(resolved)) {
  statsDir = resolved;
  runDir = path.dirname(resolved);
} else if (fs.existsSync(path.join(resolved, 'stats'))) {
  statsDir = path.join(resolved, 'stats');
  runDir = resolved;
} else {
  console.error('usage: node tools/perf/report.cjs <run-dir with stats/ or stats-dir>');
  process.exit(1);
}

const stats = fs.readdirSync(statsDir).filter(f => f.endsWith('.json'))
  .map(f => JSON.parse(fs.readFileSync(path.join(statsDir, f), 'utf8')));
const kinds = {}, samples = {}, fsAgg = {}, helpers = {}, perFileChildren = {}, perFileWall = {};
for (const s of stats) {
  if (s.depth === 1 && s.who) {
    const o = perFileWall[s.who] || (perFileWall[s.who] = { who: s.who, ms: 0, count: 0 });
    o.ms += (s.lifeMs || 0);
    o.count++;
  }
  for (const [k, v] of Object.entries(s.kinds || {})) {
    const key = (s.depth >= 2 ? '[nested] ' : '') + k;
    const o = kinds[key] || (kinds[key] = { n: 0, ms: 0 }); o.n += v.n; o.ms += v.ms;
    if (s.depth === 1 && /\.test\.cjs$/.test(s.who)) {
      const f = perFileChildren[s.who] || (perFileChildren[s.who] = { spawns: 0, ms: 0, ps: 0, git: 0 });
      f.spawns += v.n; f.ms += v.ms; if (k.startsWith('PS:')) f.ps += v.n; if (k.startsWith('git:')) f.git += v.n;
    }
  }
  for (const [k, a] of Object.entries(s.samples || {})) (samples[k] || (samples[k] = [])).push(...a);
  for (const [k, v] of Object.entries(s.fs || {})) {
    if (typeof v === 'number') fsAgg[k] = (fsAgg[k] || 0) + v;
    else { const o = fsAgg[k] || (fsAgg[k] = { n: 0, ms: 0 }); o.n += v.n; o.ms += v.ms; }
  }
  for (const [k, v] of Object.entries(s.helpers || {})) { const o = helpers[k] || (helpers[k] = { n: 0, ms: 0 }); o.n += v.n; o.ms += v.ms; }
}
const line = (v, label) => `${String(v.n).padStart(6)} ${(v.ms / 1000).toFixed(1).padStart(8)} s  mean ${String(Math.round(v.ms / Math.max(1, v.n))).padStart(5)} ms  ${label}`;
const sum = re => Object.entries(kinds).filter(([k]) => re.test(k)).reduce((a, [, v]) => ({ n: a.n + v.n, ms: a.ms + v.ms }), { n: 0, ms: 0 });

console.log(`processes reporting: ${stats.length}`);
console.log('\nspawned processes by kind (top 20; [nested] = spawned by a child of a test file)');
Object.entries(kinds).sort((a, b) => b[1].ms - a[1].ms).slice(0, 20).forEach(([k, v]) => console.log(line(v, k)));
console.log('\ntotals');
for (const [label, re] of [['git', /git:|sh:git/], ['PowerShell', /PS:|sh:(powershell|pwsh)/], ['node CLIs', /node:/], ['bash', /\bbash$/]]) console.log(line(sum(re), label));
console.log('\nlatency distributions (ms): count mean P50 P90 P95 max');
for (const [k, a] of Object.entries(samples).sort()) {
  console.log(`${k.padEnd(30)} ${String(a.length).padStart(5)} ${String(Math.round(a.reduce((x, y) => x + y, 0) / a.length)).padStart(6)} ${String(quantile(a, 0.5)).padStart(6)} ${String(quantile(a, 0.9)).padStart(6)} ${String(quantile(a, 0.95)).padStart(6)} ${String(Math.max(...a)).padStart(6)}`);
}
console.log('\nfixture churn: ' + JSON.stringify({
  cpSync: fsAgg.cpSync, cpFiles: fsAgg.cpFiles, cpMB: fsAgg.cpBytes && +(fsAgg.cpBytes / 1048576).toFixed(0),
  rmRecursive: fsAgg['rmSync-recursive'], tempDirs: Object.entries(fsAgg).filter(([k]) => k.startsWith('mkdtemp:')).reduce((a, [, v]) => a + v.n, 0),
}));
console.log('helpers (exported calls): ' + JSON.stringify(Object.fromEntries(Object.entries(helpers).map(([k, v]) => [k, { n: v.n, s: +(v.ms / 1000).toFixed(1) }]))));

console.log('\nper test file: children seconds, spawns, PS, git');
Object.entries(perFileChildren).sort((a, b) => b[1].ms - a[1].ms)
  .forEach(([f, v]) => console.log(`${(v.ms / 1000).toFixed(0).padStart(6)} s ${String(v.spawns).padStart(5)} ${String(v.ps).padStart(4)} ${String(v.git).padStart(5)}  ${f}`));

function roundSig(ms) {
  const s2 = +(ms / 1000).toFixed(2);
  const s1 = +(ms / 1000).toFixed(1);
  return s2 === s1 ? s1 : (Math.abs(s2 - s1) < 0.015 ? s1 : s2);
}

const sortedWall = Object.values(perFileWall).sort((a, b) => b.ms - a.ms);
console.log('\nper test file: worker wall time (depth=1 lifeMs):');
sortedWall.forEach(x => {
  const s = roundSig(x.ms);
  console.log(`${String(s).padStart(8)} s (${String(x.ms).padStart(6)} ms)  ${x.who}`);
});

let wallS = null;
const summaryPath = path.join(runDir, 'summary.json');
if (fs.existsSync(summaryPath)) {
  try {
    const s = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));
    if (typeof s.wallS === 'number') wallS = s.wallS;
  } catch {}
}

const tapFile = path.join(runDir, 'suite.tap');
let tapData = null;
if (fs.existsSync(tapFile)) {
  tapData = parseTap(readTap(tapFile));
  if (wallS === null && tapData.totals && typeof tapData.totals.duration_ms === 'number') {
    wallS = +(tapData.totals.duration_ms / 1000).toFixed(1);
  }
}

if (sortedWall.length >= 2) {
  const L_ms = sortedWall[0].ms;
  const L2_ms = sortedWall[1].ms;
  const L_s = roundSig(L_ms);
  const L2_s = roundSig(L2_ms);
  const diff_s = +(L_s - L2_s).toFixed(2);
  console.log('\nworker wall metrics (V3 candidate check):');
  console.log(`  L  - largest file wall  : ${L_s} s (${sortedWall[0].who}, raw lifeMs = ${L_ms})`);
  console.log(`  L2 - second largest      : ${L2_s} s (${sortedWall[1].who}, raw lifeMs = ${L2_ms})`);
  if (sortedWall.length >= 4) {
    const p3_s = roundSig(sortedWall[2].ms);
    const p4_s = roundSig(sortedWall[3].ms);
    console.log(`  next pair               : ${sortedWall[2].who} = ${p3_s} s (${sortedWall[2].ms}) and ${sortedWall[3].who} = ${p4_s} s (${sortedWall[3].ms})`);
  }
  if (wallS !== null) {
    const ratio = +(L_s / wallS).toFixed(3);
    const v3a = ratio >= 0.90 ? 'PASS' : 'FAIL';
    const v3b = diff_s >= 20 ? 'PASS' : 'FAIL';
    console.log(`  W  - run wall           : ${wallS} s (raw summary.json wallS)`);
    console.log(`  L/W                     : ${ratio} (V3(a) ${v3a}; threshold >= 0.90)`);
    console.log(`  L - L2                  : ${diff_s} s (V3(b) ${v3b}; threshold >= 20 s)`);
    console.log(`  V3 condition checks     : V3(a) ${v3a}; V3(b) ${v3b}; V3(c)/(d) OPEN`);
  }
}

if (tapData) {
  const { rows, totals } = tapData;
  const repoCandidate = fs.existsSync(path.join(runDir, 'tests')) ? runDir : (fs.existsSync(path.join(runDir, '..', '..', '..', '..', 'tests')) ? path.resolve(runDir, '..', '..', '..', '..') : undefined);
  const serial = perFileSerial(rows, testNameIndex(repoCandidate));
  console.log(`\nTAP totals ${JSON.stringify(totals)}; per-file serial time (critical-path candidates):`);
  serial.files.slice(0, 8).forEach(x => console.log(`${String(x.s).padStart(7)} s  ${x.file}`));
  console.log('slowest tests:');
  [...rows].sort((a, b) => b.ms - a.ms).slice(0, 10).forEach(r => console.log(`${(r.ms / 1000).toFixed(1).padStart(7)} s  ${r.name.slice(0, 90)}`));

  const tapFileRows = {};
  for (const r of rows) {
    const base = path.basename(r.name);
    if (base.endsWith('.test.cjs')) tapFileRows[base] = r;
  }
  console.log('\nTAP file-level duration cross-check:');
  const matched = Object.entries(tapFileRows);
  if (matched.length > 0) {
    for (const [f, r] of matched) {
      const w = perFileWall[f];
      const wStr = w ? `${roundSig(w.ms)} s (${w.ms} ms)` : 'n/a';
      const diff = w ? (r.ms - w.ms) : 0;
      const diffStr = w ? ` (diff ${(diff >= 0 ? '+' : '')}${(diff / 1000).toFixed(2)} s)` : '';
      console.log(`  ${f}: TAP duration ${(r.ms / 1000).toFixed(2)} s (${r.ms.toFixed(1)} ms) vs worker wall ${wStr}${diffStr}`);
    }
  }
  const unmapped = sortedWall.filter(x => !tapFileRows[x.who]);
  if (unmapped.length > 0) {
    console.log(`  (${unmapped.length} test files do not have top-level file duration in TAP; individual test subtests only)`);
  }
}
