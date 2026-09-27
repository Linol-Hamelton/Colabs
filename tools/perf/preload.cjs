'use strict';
// Measurement preload for `node --test` runs: NODE_OPTIONS=--require=<this file>.
// Counts child processes, fixture file-system churn and test-helper calls in memory and writes one
// JSON file per process at exit into PERF_STATS_DIR. It changes no behaviour; without
// PERF_STATS_DIR it records nothing.
const cp = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const OUT = process.env.PERF_STATS_DIR;
const depth = Number(process.env.PERF_DEPTH || 0);
process.env.PERF_DEPTH = String(depth + 1);
const who = path.basename(process.argv[1] || '?');
const started = performance.now();
const stats = { who, depth, pid: process.pid, kinds: {}, fs: {}, helpers: {}, samples: {} };

function add(bucket, key, ms, keepSample) {
  const entry = bucket[key] || (bucket[key] = { n: 0, ms: 0 });
  entry.n++;
  entry.ms += ms;
  if (keepSample) (stats.samples[key] || (stats.samples[key] = [])).push(Math.round(ms));
}

function gitSubcommand(args) {
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '-c' || args[i] === '-C') { i++; continue; }
    if (!args[i].startsWith('-')) return args[i];
  }
  return '?';
}

function kindOf(command, args) {
  args = Array.isArray(args) ? args : [];
  const base = path.basename(String(command)).replace(/\.exe$/i, '').toLowerCase();
  if (base === 'powershell' || base === 'pwsh') {
    const script = args.find(a => /\.ps1$/i.test(a));
    if (script) return 'PS:' + path.basename(script);
    return args.includes('-Command') ? 'PS:-Command' : 'PS:?';
  }
  if (base === 'node') {
    const script = args.find(a => /\.c?js$/.test(a));
    return 'node:' + (script ? path.basename(script) : '-e');
  }
  if (base === 'git') return 'git:' + gitSubcommand(args);
  return base;
}

for (const name of ['spawnSync', 'execFileSync']) {
  const original = cp[name];
  cp[name] = function (command, args, ...rest) {
    const t = performance.now();
    try { return original.call(this, command, args, ...rest); } finally {
      const kind = kindOf(command, args);
      add(stats.kinds, kind, performance.now() - t, /^git:(init|commit)$|^PS:/.test(kind));
    }
  };
}
{
  const original = cp.execSync;
  cp.execSync = function (command, ...rest) {
    const t = performance.now();
    try { return original.call(this, command, ...rest); } finally {
      add(stats.kinds, 'sh:' + String(command).split(' ')[0], performance.now() - t);
    }
  };
}
{
  const original = cp.spawn;
  cp.spawn = function (command, args, ...rest) {
    const t = performance.now();
    const child = original.call(this, command, args, ...rest);
    const kind = kindOf(command, args);
    child.once('exit', () => add(stats.kinds, kind, performance.now() - t));
    return child;
  };
}

// Fixture churn. Source trees are measured once per path.
const sizes = new Map();
function treeSize(target) {
  if (sizes.has(target)) return sizes.get(target);
  let files = 0;
  let bytes = 0;
  (function walk(p) {
    let st;
    try { st = fs.lstatSync(p); } catch { return; }
    if (st.isDirectory()) { for (const e of fs.readdirSync(p)) walk(path.join(p, e)); }
    else { files++; bytes += st.size; }
  })(target);
  const result = { files, bytes };
  sizes.set(target, result);
  return result;
}
{
  const cpSync = fs.cpSync;
  fs.cpSync = function (src, dst, opts) {
    const t = performance.now();
    try { return cpSync.call(this, src, dst, opts); } finally {
      add(stats.fs, 'cpSync', performance.now() - t);
      const s = treeSize(path.resolve(String(src)));
      stats.fs.cpFiles = (stats.fs.cpFiles || 0) + s.files;
      stats.fs.cpBytes = (stats.fs.cpBytes || 0) + s.bytes;
    }
  };
  const mkdtempSync = fs.mkdtempSync;
  fs.mkdtempSync = function (prefix, ...rest) {
    const t = performance.now();
    try { return mkdtempSync.call(this, prefix, ...rest); } finally {
      add(stats.fs, 'mkdtemp:' + path.basename(String(prefix)).replace(/-\d+-?$/, '-'), performance.now() - t);
    }
  };
  const rmSync = fs.rmSync;
  fs.rmSync = function (target, opts) {
    const t = performance.now();
    try { return rmSync.call(this, target, opts); } finally {
      if (opts && opts.recursive) add(stats.fs, 'rmSync-recursive', performance.now() - t, true);
    }
  };
}

// Exported test helpers (calls made inside helpers.cjs itself are not seen).
try {
  const helpersPath = path.resolve('tests', 'helpers.cjs');
  if (/\.test\.cjs$/.test(who) && fs.existsSync(helpersPath)) {
    const helpers = require(helpersPath);
    for (const name of ['run', 'git', 'runPowerShell', 'makeFixture', 'makeProtocolFixture', 'seedProtocol', 'findGitBash', 'write']) {
      if (typeof helpers[name] !== 'function') continue;
      const original = helpers[name];
      helpers[name] = function (...args) {
        const t = performance.now();
        try { return original.apply(this, args); } finally {
          add(stats.helpers, name, performance.now() - t, name === 'makeProtocolFixture' || name === 'makeFixture');
        }
      };
    }
  }
} catch (error) { stats.helperWrapError = String(error && error.message); }

process.on('exit', () => {
  if (!OUT) return;
  stats.lifeMs = Math.round(performance.now() - started);
  try { fs.writeFileSync(path.join(OUT, `stats-${who}-${process.pid}.json`), JSON.stringify(stats)); } catch { /* measurement only */ }
});
