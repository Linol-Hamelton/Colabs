'use strict';
// Fixture-cost experiments (sections 17-20 and 80 of the audit criteria).
//   node tools/perf/fixtures.cjs cold-read [--n 5]
//       create a protocol fixture by fs.cpSync (seedProtocol) vs by writing the same bytes from a
//       once-read cache; time creation, first read and second read of every file.
//   node tools/perf/fixtures.cjs factorial [--n 10]
//       2x2: validator {PowerShell, Node cost model} x seeding {cpSync, written}; each iteration =
//       git init + commit, seed, mutate TASK, validate, remove. The Node side is a cost model of the
//       validator's I/O and subprocesses plus the gate slice, not a semantic replacement.
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const { spawnSync, execFileSync } = require('node:child_process');
const { repoRoot, quantile, parseArgs } = require('./lib.cjs');
const h = require(path.join(repoRoot, 'tests', 'helpers.cjs'));
const { gateForRoot } = require('./gate-slice.cjs');

const mode = process.argv[2];
const opts = parseArgs(process.argv.slice(3), { n: mode === 'factorial' ? '10' : '5' });
const N = Number(opts.n);
const temp = prefix => fs.mkdtempSync(path.join(os.tmpdir(), `colabs-perf-${prefix}-`));
const remove = dir => fs.rmSync(dir, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });

function listFiles(root) {
  const out = [];
  (function walk(d) {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      if (e.name === '.git') continue;
      const p = path.join(d, e.name);
      if (e.isDirectory()) walk(p); else out.push(p);
    }
  })(root);
  return out;
}
const readAll = files => { const t = performance.now(); for (const f of files) fs.readFileSync(f); return performance.now() - t; };

// The exact file set seedProtocol produces, captured once.
let cache = null;
function seedCache() {
  if (cache) return cache;
  const probe = temp('probe');
  h.seedProtocol(probe, { realValidator: true });
  cache = listFiles(probe).map(f => ({ rel: path.relative(probe, f), bytes: fs.readFileSync(f), mode: fs.statSync(f).mode }));
  remove(probe);
  return cache;
}
function seedWritten(root) {
  for (const { rel, bytes, mode: m } of seedCache()) {
    const target = path.join(root, rel);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, bytes, { mode: m & 0o777 });
  }
}
function gitRepo() {
  const root = temp('fx');
  for (const args of [['init', '-b', 'main'], ['-c', 'user.name=T', '-c', 'user.email=t@t', 'commit', '--allow-empty', '-m', 'x']]) h.git(root, args);
  return root;
}

function coldRead() {
  const rows = { cpSync: [], written: [] };
  seedCache();
  for (let i = 0; i < N; i++) {
    for (const kind of Object.keys(rows)) {
      const root = temp('cold');
      const t = performance.now();
      if (kind === 'cpSync') h.seedProtocol(root, { realValidator: true }); else seedWritten(root);
      const create = performance.now() - t;
      const files = listFiles(root);
      rows[kind].push({ create, first: readAll(files), second: readAll(files) });
      remove(root);
    }
  }
  for (const [kind, a] of Object.entries(rows)) {
    const med = k => Math.round(quantile(a.map(x => x[k]), 0.5));
    console.log(`${kind.padEnd(8)} create ${med('create')} ms | first read ${med('first')} ms | second read ${med('second')} ms | create + first read ${med('create') + med('first')} ms (median of ${a.length}, ${cache.length} files)`);
  }
}

const bash = h.findGitBash();
function nodeValidateCost(root) {
  const git = (...a) => execFileSync('git', ['-C', root, ...a], { encoding: 'utf8', maxBuffer: 1e8, timeout: 30000, windowsHide: true });
  const m = JSON.parse(fs.readFileSync(path.join(root, 'protocol-manifest.json'), 'utf8'));
  const required = [...m.managed, ...m.integration, ...m.state.map(s => '.ai/' + s),
    ...(m.role === 'installed' ? [] : [...(m.source || []), ...(m.tests || []), ...m.state.map(s => 'templates/ai/' + s)])];
  for (const r of required) fs.existsSync(path.join(root, r));
  git('rev-parse', '--is-inside-work-tree', '--show-toplevel');
  git('rev-list', '--all', '--count');
  const listed = git('ls-files', '--cached', '--others', '--exclude-standard', '-z').split('\0').filter(Boolean);
  const decoder = new TextDecoder('utf-8', { fatal: true });
  for (const r of new Set([...required, ...listed])) {
    let b;
    try { if (!fs.lstatSync(path.join(root, r)).isFile()) continue; b = fs.readFileSync(path.join(root, r)); } catch { continue; }
    b.includes(0); b.includes(13);
    if (/\.ps1$/.test(r)) b.some(x => x > 127);
    try { decoder.decode(b); } catch { /* counted as a failure by the real validator */ }
  }
  for (const f of ['.ai/bin/protocol-hooks.cjs', '.claude/hooks/protocol-hooks.cjs', '.codex/hooks/protocol.cjs']) {
    const p = path.join(root, f);
    if (fs.existsSync(p)) new vm.Script(fs.readFileSync(p, 'utf8'), { filename: f }); // compile only
  }
  for (const w of ['session-start.sh', 'stop-worklog-check.sh']) {
    const p = path.join(root, '.claude', 'hooks', w);
    if (bash && fs.existsSync(p)) spawnSync(bash, ['-n', p.replace(/\\/g, '/')], { timeout: 10000, windowsHide: true });
  }
  spawnSync('git', ['-C', root, 'cat-file', '--batch'], { input: 'HEAD:.ai/DECISIONS.md\nHEAD:docs/decisions/REGISTRY.md\n', encoding: 'utf8', windowsHide: true });
  spawnSync('git', ['-C', root, 'check-ignore', '--no-index', '-q', '.ai/runtime/shared-writer.json', '.claude/settings.local.json', '.ai/scratch/probe.txt'], { windowsHide: true });
  for (const r of m.managed) { const p = path.join(root, r); if (fs.existsSync(p)) crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex'); }
  return gateForRoot(root);
}

function factorial() {
  const validators = { PS: root => h.runPowerShell('validate-protocol.ps1', ['-Quiet'], root), Node: nodeValidateCost };
  const seeders = { cpSync: root => h.seedProtocol(root, { realValidator: true }), written: seedWritten };
  seedCache();
  const results = [];
  for (const [vName, validate] of Object.entries(validators)) {
    for (const [sName, seed] of Object.entries(seeders)) {
      const t = { repo: [], seed: [], validate: [], cleanup: [], total: [] };
      for (let i = 0; i < N; i++) {
        const t0 = performance.now();
        const root = gitRepo();
        const t1 = performance.now();
        seed(root);
        const t2 = performance.now();
        h.write(root, '.ai/TASK.md', '# Current Task\n\nStatus: Completed.\n');
        validate(root);
        const t3 = performance.now();
        remove(root);
        const t4 = performance.now();
        t.repo.push(t1 - t0); t.seed.push(t2 - t1); t.validate.push(t3 - t2); t.cleanup.push(t4 - t3); t.total.push(t4 - t0);
      }
      const med = k => Math.round(quantile(t[k], 0.5));
      results.push({ validator: vName, seeding: sName, repoMs: med('repo'), seedMs: med('seed'), validateMs: med('validate'), cleanupMs: med('cleanup'), totalMs: med('total') });
    }
  }
  console.table(results);
}

if (mode === 'cold-read') coldRead();
else if (mode === 'factorial') factorial();
else { console.error('usage: node tools/perf/fixtures.cjs cold-read|factorial [--n N]'); process.exit(1); }
