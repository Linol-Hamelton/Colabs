'use strict';
// Summarises one bench run directory (<out>/<stamp>-<tag>/c<N>-r<k>): spawned processes by kind,
// latency distributions, fixture churn, helper calls, per-file serial time and slowest tests.
//   node tools/perf/report.cjs <run-dir>
const fs = require('node:fs');
const path = require('node:path');
const { quantile, readTap, parseTap, testNameIndex, perFileSerial } = require('./lib.cjs');

const dir = process.argv[2];
if (!dir || !fs.existsSync(path.join(dir, 'stats'))) { console.error('usage: node tools/perf/report.cjs <run-dir with stats/ and suite.tap>'); process.exit(1); }

const stats = fs.readdirSync(path.join(dir, 'stats')).filter(f => f.endsWith('.json'))
  .map(f => JSON.parse(fs.readFileSync(path.join(dir, 'stats', f), 'utf8')));
const kinds = {}, samples = {}, fsAgg = {}, helpers = {}, perFileChildren = {};
for (const s of stats) {
  for (const [k, v] of Object.entries(s.kinds)) {
    const key = (s.depth >= 2 ? '[nested] ' : '') + k;
    const o = kinds[key] || (kinds[key] = { n: 0, ms: 0 }); o.n += v.n; o.ms += v.ms;
    if (s.depth === 1 && /\.test\.cjs$/.test(s.who)) {
      const f = perFileChildren[s.who] || (perFileChildren[s.who] = { spawns: 0, ms: 0, ps: 0, git: 0 });
      f.spawns += v.n; f.ms += v.ms; if (k.startsWith('PS:')) f.ps += v.n; if (k.startsWith('git:')) f.git += v.n;
    }
  }
  for (const [k, a] of Object.entries(s.samples)) (samples[k] || (samples[k] = [])).push(...a);
  for (const [k, v] of Object.entries(s.fs)) {
    if (typeof v === 'number') fsAgg[k] = (fsAgg[k] || 0) + v;
    else { const o = fsAgg[k] || (fsAgg[k] = { n: 0, ms: 0 }); o.n += v.n; o.ms += v.ms; }
  }
  for (const [k, v] of Object.entries(s.helpers)) { const o = helpers[k] || (helpers[k] = { n: 0, ms: 0 }); o.n += v.n; o.ms += v.ms; }
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
const tapFile = path.join(dir, 'suite.tap');
if (fs.existsSync(tapFile)) {
  const { rows, totals } = parseTap(readTap(tapFile));
  const serial = perFileSerial(rows, testNameIndex());
  console.log(`\nTAP totals ${JSON.stringify(totals)}; per-file serial time (critical-path candidates):`);
  serial.files.slice(0, 8).forEach(x => console.log(`${String(x.s).padStart(7)} s  ${x.file}`));
  console.log('slowest tests:');
  [...rows].sort((a, b) => b.ms - a.ms).slice(0, 10).forEach(r => console.log(`${(r.ms / 1000).toFixed(1).padStart(7)} s  ${r.name.slice(0, 90)}`));
}
