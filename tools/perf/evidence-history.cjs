'use strict';
// Distribution of recorded check times from Evidence blocks in .ai/ARCHIVE.md and .ai/worklog/*.md
// (`- validate-protocol.ps1: exit N in Ns`, `- test-protocol.ps1: exit N in Ns`), overall and by date.
//   node tools/perf/evidence-history.cjs [--since YYYY-MM-DD]
const fs = require('node:fs');
const path = require('node:path');
const { repoRoot, quantile, parseArgs } = require('./lib.cjs');

const opts = parseArgs(process.argv.slice(2), { since: '' });
const files = [path.join(repoRoot, '.ai', 'ARCHIVE.md'), ...fs.readdirSync(path.join(repoRoot, '.ai', 'worklog'))
  .filter(f => f.endsWith('.md') && f !== 'README.md').map(f => path.join(repoRoot, '.ai', 'worklog', f))];
const rows = { 'validate-protocol.ps1': [], 'test-protocol.ps1': [] };
for (const file of files) {
  let date = null;
  for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
    const d = line.match(/^- recorded: (\d{4}-\d{2}-\d{2})/);
    if (d) date = d[1];
    const m = line.match(/^- (validate-protocol\.ps1|test-protocol\.ps1): exit (\d+) in (\d+)s/);
    if (m && (!opts.since || (date && date >= opts.since))) rows[m[1]].push({ s: Number(m[3]), exit: Number(m[2]), date });
  }
}
for (const [name, all] of Object.entries(rows)) {
  const ok = all.filter(r => r.exit === 0).map(r => r.s);
  if (!ok.length) { console.log(`${name}: no records`); continue; }
  const mean = ok.reduce((a, b) => a + b, 0) / ok.length;
  console.log(`${name}: n=${ok.length} (${all.length - ok.length} nonzero exits excluded) min ${Math.min(...ok)} P25 ${quantile(ok, 0.25)} median ${quantile(ok, 0.5)} P75 ${quantile(ok, 0.75)} P90 ${quantile(ok, 0.9)} P95 ${quantile(ok, 0.95)} max ${Math.max(...ok)} mean ${mean.toFixed(1)}`);
  const byDate = {};
  for (const r of all.filter(x => x.exit === 0)) (byDate[r.date || 'unknown'] = byDate[r.date || 'unknown'] || []).push(r.s);
  console.log('  median by record date: ' + Object.keys(byDate).sort().map(d => `${d.slice(5)} n=${byDate[d].length} ${quantile(byDate[d], 0.5)}`).join(' | '));
}
