'use strict';
// Full-suite benchmark: runs the protocol regression suite the way test-protocol.ps1 does
// (same environment, same files) at one or more --test-concurrency levels, with resource sampling
// and the measurement preload. Output goes outside the repository (default: <tmp>/colabs-perf).
//
//   node tools/perf/bench.cjs --conc 16 --runs 5 --tag baseline
//   node tools/perf/bench.cjs --conc 8,16,24 --runs 3 --tag concurrency
//   node tools/perf/bench.cjs --conc 2 --files index.test.cjs,operator.test.cjs --tag smoke
//   node tools/perf/bench.cjs --repo .ai/runtime/<worktree> --conc 16 --runs 5 --tag branch
//
// Run it on an otherwise idle workstation: no other suite, validator or agent session.
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawn, spawnSync, execFile } = require('node:child_process');
const { repoRoot: defaultRoot, quantile, parseTap, testNameIndex, perFileSerial, parseArgs } = require('./lib.cjs');

const opts = parseArgs(process.argv.slice(2), {
  conc: '16', runs: '1', tag: 'run', files: '', repo: defaultRoot, out: path.join(os.tmpdir(), 'colabs-perf'), 'no-preload': false,
});

// --repo measures another checkout (for example a branch worktree) with this harness.
const repoRoot = path.resolve(opts.repo);
function git(args) {
  const r = spawnSync('git', ['-C', repoRoot, ...args], { encoding: 'utf8', windowsHide: true });
  return r.status === 0 ? r.stdout.trim() : null;
}

function cpuSnapshot() {
  let idle = 0, total = 0;
  for (const c of os.cpus()) { for (const v of Object.values(c.times)) total += v; idle += c.times.idle; }
  return { idle, total };
}

function processCounts() {
  return new Promise(resolve => {
    const done = names => {
      const counts = { node: 0, powershell: 0, pwsh: 0, git: 0, bash: 0, all: names.length };
      for (const n of names) { const k = n.toLowerCase().replace(/\.exe$/, ''); if (k in counts) counts[k]++; }
      resolve(counts);
    };
    if (process.platform === 'win32') {
      execFile('tasklist', ['/FO', 'CSV', '/NH'], { windowsHide: true, maxBuffer: 1 << 24 }, (e, out) =>
        done(e ? [] : out.split(/\r?\n/).filter(Boolean).map(l => l.split('","')[0].replace(/^"/, ''))));
    } else {
      execFile('ps', ['-e', '-o', 'comm='], { maxBuffer: 1 << 24 }, (e, out) =>
        done(e ? [] : out.split('\n').filter(Boolean).map(l => path.basename(l.trim()))));
    }
  });
}

function powershellPath() {
  if (process.platform !== 'win32') return 'pwsh';
  const sys = path.join(process.env.SystemRoot || 'C:\\Windows', 'System32', 'WindowsPowerShell', 'v1.0', 'powershell.exe');
  return fs.existsSync(sys) ? sys : 'powershell.exe';
}

async function runOnce(conc, runIndex, testFiles, dir) {
  fs.mkdirSync(path.join(dir, 'stats'), { recursive: true });
  const env = { ...process.env, PROTOCOL_TEST_POWERSHELL: powershellPath(), PROTOCOL_TEST_FAST_CHECKS: '1' };
  if (!opts['no-preload']) {
    env.NODE_OPTIONS = `--require=${path.join(__dirname, 'preload.cjs').replace(/\\/g, '/')}`;
    env.PERF_STATS_DIR = path.join(dir, 'stats');
  }
  const treeBefore = git(['status', '--porcelain']);
  const samples = [];
  let last = cpuSnapshot();
  let sampling = false;
  const t0 = performance.now();
  const timer = setInterval(async () => {
    if (sampling) return;
    sampling = true;
    const now = cpuSnapshot();
    const cpu = 100 * (1 - (now.idle - last.idle) / Math.max(1, now.total - last.total));
    last = now;
    const procs = await processCounts();
    samples.push({ s: Math.round((performance.now() - t0) / 1000), cpu: Math.round(cpu), freeMB: Math.round(os.freemem() / 1048576), ...procs });
    sampling = false;
  }, 2000);
  const tap = fs.createWriteStream(path.join(dir, 'suite.tap'));
  const exit = await new Promise(resolve => {
    const child = spawn(process.execPath, ['--test', `--test-concurrency=${conc}`, ...testFiles], { cwd: repoRoot, env, windowsHide: true });
    child.stdout.pipe(tap);
    child.stderr.pipe(tap);
    child.on('close', code => resolve(code));
  });
  const wallMs = Math.round(performance.now() - t0);
  clearInterval(timer);
  await new Promise(r => tap.end(r));
  const treeAfter = git(['status', '--porcelain']);
  const { rows, totals } = parseTap(fs.readFileSync(path.join(dir, 'suite.tap'), 'utf8'));
  const serial = perFileSerial(rows, testNameIndex(repoRoot));
  const max = key => Math.max(0, ...samples.map(x => x[key]));
  const summary = {
    commit: git(['rev-parse', 'HEAD']), tag: opts.tag, conc, run: runIndex, preload: !opts['no-preload'],
    wallS: +(wallMs / 1000).toFixed(1), exit, totals,
    cpuAvg: samples.length ? Math.round(samples.reduce((a, x) => a + x.cpu, 0) / samples.length) : null,
    cpuMax: max('cpu'), freeMinMB: samples.length ? Math.min(...samples.map(x => x.freeMB)) : null,
    maxConcurrent: { node: max('node'), powershell: max('powershell'), git: max('git'), bash: max('bash'), all: max('all') },
    longestFiles: serial.files.slice(0, 5), samples: samples.length,
    treeChanged: treeBefore !== treeAfter, treeAfter,
  };
  fs.writeFileSync(path.join(dir, 'summary.json'), JSON.stringify(summary, null, 1));
  fs.writeFileSync(path.join(dir, 'samples.json'), JSON.stringify(samples));
  return summary;
}

(async () => {
  const levels = String(opts.conc).split(',').map(Number).filter(n => n > 0);
  const runs = Number(opts.runs);
  const all = fs.readdirSync(path.join(repoRoot, 'tests')).filter(f => f.endsWith('.test.cjs')).sort();
  const picked = opts.files ? opts.files.split(',').map(s => s.trim()).filter(Boolean) : all;
  for (const f of picked) if (!all.includes(f)) throw new Error(`No such test file: tests/${f}`);
  const testFiles = picked.map(f => path.join(repoRoot, 'tests', f));
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const base = path.join(opts.out, `${stamp}-${opts.tag}`);
  const results = [];
  for (const conc of levels) {
    for (let r = 1; r <= runs; r++) {
      const s = await runOnce(conc, r, testFiles, path.join(base, `c${conc}-r${r}`));
      results.push(s);
      fs.appendFileSync(path.join(base, 'summary.jsonl'), JSON.stringify(s) + '\n');
      console.log(`c${conc} run ${r}: ${s.wallS} s exit=${s.exit} tests=${s.totals.tests} fail=${s.totals.fail} cpu avg/max ${s.cpuAvg}/${s.cpuMax}% freeMin ${s.freeMinMB} MB maxPS ${s.maxConcurrent.powershell} maxGit ${s.maxConcurrent.git} longest ${s.longestFiles[0] ? s.longestFiles[0].file + ' ' + s.longestFiles[0].s + ' s' : '-'}${s.treeChanged ? ' TREE CHANGED' : ''}`);
    }
    const walls = results.filter(x => x.conc === conc).map(x => x.wallS);
    const mean = walls.reduce((a, b) => a + b, 0) / walls.length;
    const sd = walls.length > 1 ? Math.sqrt(walls.reduce((a, b) => a + (b - mean) ** 2, 0) / (walls.length - 1)) : 0;
    console.log(`c${conc}: n=${walls.length} median ${quantile(walls, 0.5)} P90 ${quantile(walls, 0.9)} min ${Math.min(...walls)} max ${Math.max(...walls)} CV ${(100 * sd / mean).toFixed(1)}%`);
  }
  console.log(`results: ${base}`);
})().catch(error => { console.error(error.message); process.exit(1); });
