'use strict';
// Section profile of validate-protocol.ps1 and setup-ai-protocol.ps1, plus a per-call log of the
// validator's Invoke-External subprocesses. Instrumented copies are generated in a temp directory
// from the current scripts (markers are placed by code structure, not line numbers) and checked
// with the PowerShell parser before they run. The repository copies are never modified.
//
// Safety: the installer copy always runs with -Verify (read-only), and the repository state
// (git status and the manifest hash) is compared before and after every run; a change aborts.
//   node tools/perf/ps-profile.cjs [--runs 3] [--root <dir>] [--fixture]
//     --root     profile the validator against another checkout (default: this repository)
//     --fixture  profile the validator against a fresh test fixture, as the suite sees it
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const crypto = require('node:crypto');
const { spawnSync } = require('node:child_process');
const { repoRoot, quantile, parseArgs } = require('./lib.cjs');

const opts = parseArgs(process.argv.slice(2), { runs: '3', root: '', fixture: false });
const shell = process.platform === 'win32'
  ? path.join(process.env.SystemRoot || 'C:\\Windows', 'System32', 'WindowsPowerShell', 'v1.0', 'powershell.exe')
  : 'pwsh';
const work = fs.mkdtempSync(path.join(os.tmpdir(), 'colabs-perf-ps-'));

function fingerprint() {
  const status = spawnSync('git', ['-C', repoRoot, 'status', '--porcelain'], { encoding: 'utf8', windowsHide: true }).stdout;
  const manifest = crypto.createHash('sha256').update(fs.readFileSync(path.join(repoRoot, 'protocol-manifest.json'))).digest('hex');
  return `${status}\n${manifest}\n${fs.existsSync(path.join(repoRoot, '.ai', 'backups'))}`;
}

const TIMER = [
  "$__perfClock = [System.Diagnostics.Stopwatch]::StartNew(); $script:__perfLast = 0; $script:__perfLabel = 'start'",
  "function __PerfMark([string]$Label) { $now = $__perfClock.ElapsedMilliseconds; [Console]::Error.WriteLine(('PERF T {0} {1}' -f ($now - $script:__perfLast), $script:__perfLabel)); $script:__perfLast = $now; $script:__perfLabel = $Label }",
];
const label = (i, text) => `L${i + 1} ${text.trim().slice(0, 48).replace(/'/g, "''")}`;
const STATEMENT = /^(if|foreach|\$[A-Za-z_]|Write-Host)\b/;

function instrumentValidator(source) {
  const lines = source.split('\n');
  const rootIndex = lines.findIndex(l => /^\$Root = \$PSScriptRoot\s*$/.test(l));
  const ieStart = lines.findIndex(l => /^function Invoke-External\b/.test(l));
  const ieEnd = ieStart >= 0 ? lines.findIndex((l, i) => i > ieStart && l === '}') : -1;
  if (rootIndex < 0 || ieStart < rootIndex || ieEnd < 0) throw new Error('validate-protocol.ps1 layout changed; update ps-profile.cjs');
  const out = [];
  lines.forEach((line, i) => {
    if (i === rootIndex) { out.push('$Root = [System.IO.Path]::GetFullPath($env:PERF_ROOT)', ...TIMER); return; }
    if (i > rootIndex && STATEMENT.test(line)) out.push(`__PerfMark '${label(i, line)}'`);
    out.push(line);
    if (i === ieEnd) {
      out.push('Rename-Item function:Invoke-External Invoke-ExternalInner');
      out.push("function Invoke-External { param([string]$Executable, [string[]]$Arguments) $sw = [System.Diagnostics.Stopwatch]::StartNew(); $r = Invoke-ExternalInner $Executable $Arguments; [Console]::Error.WriteLine(('PERF IE {0} {1} {2}' -f $sw.ElapsedMilliseconds, [System.IO.Path]::GetFileName($Executable), (($Arguments | ForEach-Object { if ($_.Length -gt 48) { '...' + $_.Substring($_.Length - 45) } else { $_ } }) -join ' '))); return $r }");
    }
  });
  const exitIndex = out.findIndex(l => /^if \(\$script:Failures -eq 0\)/.test(l));
  if (exitIndex > 0) out.splice(exitIndex, 0, "__PerfMark 'end'");
  return out.join('\n');
}

function instrumentInstaller(source) {
  const lines = source.split('\n');
  const rootIndex = lines.findIndex(l => /^\$SourceRoot = \[System\.IO\.Path\]::GetFullPath\(\$PSScriptRoot\)\s*$/.test(l));
  const tryIndex = lines.findIndex(l => /^try \{\s*$/.test(l));
  const catchIndex = lines.findIndex((l, i) => i > tryIndex && /^catch \{/.test(l));
  if (rootIndex < 0 || tryIndex < rootIndex || catchIndex < 0) throw new Error('setup-ai-protocol.ps1 layout changed; update ps-profile.cjs');
  const out = [];
  lines.forEach((line, i) => {
    if (i === rootIndex) { out.push('$SourceRoot = [System.IO.Path]::GetFullPath($env:PERF_ROOT)', ...TIMER); return; }
    if (i > tryIndex && i < catchIndex && /^ {4}(if|foreach|\$[A-Za-z_]|Write-Host)\b/.test(line)) {
      if (/^ {4}(if|foreach)\b.*\bexit\b/.test(line)) out.push("    __PerfMark 'end'");
      else out.push(`    __PerfMark '${label(i, line)}'`);
    }
    out.push(line);
  });
  return out.join('\n');
}

function parseCheck(file) {
  const cmd = `$e = $null; [void][System.Management.Automation.Language.Parser]::ParseFile('${file.replace(/'/g, "''")}', [ref]$null, [ref]$e); $e.Count`;
  const r = spawnSync(shell, ['-NoProfile', '-Command', cmd], { encoding: 'utf8', windowsHide: true });
  if (r.status !== 0 || r.stdout.trim() !== '0') throw new Error(`instrumented copy does not parse: ${file}\n${r.stdout}${r.stderr}`);
}

function run(file, args, root) {
  const before = fingerprint();
  const t = performance.now();
  const r = spawnSync(shell, ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', file, ...args], {
    encoding: 'utf8', windowsHide: true, timeout: 300000, env: { ...process.env, PERF_ROOT: root },
  });
  const wall = performance.now() - t;
  if (fingerprint() !== before) {
    console.error(`ERROR: the repository changed while profiling ${path.basename(file)}; inspect git status and protocol-manifest.json now.`);
    process.exit(2);
  }
  return { wall, status: r.status, lines: (r.stderr || '').split(/\r?\n/).filter(l => l.startsWith('PERF ')) };
}

function summarise(title, results) {
  const sections = {}, calls = {};
  for (const r of results) {
    const seen = {};
    for (const l of r.lines) {
      let m = l.match(/^PERF T (\d+) (.*)$/);
      if (m) { seen[m[2]] = (seen[m[2]] || 0) + Number(m[1]); continue; }
      m = l.match(/^PERF IE (\d+) (.*)$/);
      if (m) (calls[m[2]] = calls[m[2]] || []).push(Number(m[1]));
    }
    for (const [k, v] of Object.entries(seen)) (sections[k] = sections[k] || []).push(v);
  }
  const walls = results.map(r => r.wall);
  console.log(`\n== ${title}: wall median ${Math.round(quantile(walls, 0.5))} ms over ${results.length} runs (exit ${results.map(r => r.status).join(',')})`);
  console.log('sections by median ms (label = first statement of the section):');
  Object.entries(sections).map(([k, a]) => [k, quantile(a, 0.5)]).sort((a, b) => b[1] - a[1]).slice(0, 12)
    .forEach(([k, ms]) => console.log(`${String(ms).padStart(7)} ms  ${k}`));
  if (Object.keys(calls).length) {
    const perRun = Object.values(calls).reduce((a, v) => a + v.length, 0) / results.length;
    console.log(`subprocesses per run: ${perRun}; median ms per call:`);
    Object.entries(calls).forEach(([k, a]) => console.log(`${String(quantile(a, 0.5)).padStart(7)} ms x${a.length / results.length}  ${k}`));
  }
}

try {
  const runs = Number(opts.runs);
  let root = opts.root ? path.resolve(opts.root) : repoRoot;
  let fixture = null;
  if (opts.fixture) {
    const h = require(path.join(repoRoot, 'tests', 'helpers.cjs'));
    fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'colabs-perf-psfx-'));
    for (const a of [['init', '-b', 'main'], ['-c', 'user.name=T', '-c', 'user.email=t@t', 'commit', '--allow-empty', '-m', 'x']]) h.git(fixture, a);
    h.seedProtocol(fixture, { realValidator: true });
    root = fixture;
  }
  const validatorCopy = path.join(work, 'validate-protocol.perf.ps1');
  const installerCopy = path.join(work, 'setup-ai-protocol.perf.ps1');
  fs.writeFileSync(validatorCopy, instrumentValidator(fs.readFileSync(path.join(repoRoot, 'validate-protocol.ps1'), 'utf8')));
  fs.writeFileSync(installerCopy, instrumentInstaller(fs.readFileSync(path.join(repoRoot, 'setup-ai-protocol.ps1'), 'utf8')));
  parseCheck(validatorCopy);
  parseCheck(installerCopy);
  const v = [], s = [];
  for (let i = 0; i < runs; i++) v.push(run(validatorCopy, ['-Quiet'], root));
  // -Verify is mandatory: the copy's source root is the repository itself.
  for (let i = 0; i < runs; i++) s.push(run(installerCopy, ['-Target', repoRoot, '-Verify'], repoRoot));
  summarise(`validate-protocol.ps1 on ${fixture ? 'a fresh fixture' : root}`, v);
  summarise('setup-ai-protocol.ps1 -Verify (read-only)', s);
  if (fixture) fs.rmSync(fixture, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
} finally {
  fs.rmSync(work, { recursive: true, force: true });
}
