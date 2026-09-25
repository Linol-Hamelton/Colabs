'use strict';

// Self-test of launch.cjs (P-L3-004) with fake clients. Calls no model, starts no research job and
// writes only under the system temp directory and .ai/runtime/improvement-research/ (zz-* files,
// removed at the end). Timers are shortened: tick 1 s, soft 3 s, hard 6 s.
//
//   node docs/research/2026-09-25-improvement-research/prompts/launch-test.cjs
//   node docs/research/2026-09-25-improvement-research/prompts/launch-test.cjs --pure
//
// Exit 0 when every scenario ends in its expected state. `--pure` runs only the checks of pure
// functions (no process is started, nothing is written), on any operating system; the full run
// runs them first.

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawn, spawnSync } = require('node:child_process');
const L = require('./launch.cjs');

const FAKE = path.join(__dirname, 'launch-fake-client.cjs');
const JOBS_DIR = path.resolve(__dirname, '..', '..', '..', '..', '.ai', 'runtime', 'improvement-research', 'jobs');
const SC = {
  'zz-t1': { primary: 'fail', kilo: 'work', expect: { status: 'DONE', attempts: 2, first: 'FAILED_EARLY' } },
  'zz-t2': { primary: 'ratelimit-hang', kilo: 'fail', expect: { status: 'NEEDS_OWNER', attempts: 2, first: 'FAILED_EARLY' } },
  'zz-t3': { primary: 'work-hang', kilo: 'work', expect: { status: 'NEEDS_OWNER', attempts: 1, first: 'HUNG' } },
  'zz-t4': { primary: 'cpu-then-work', kilo: 'work', expect: { status: 'DONE', attempts: 1, first: 'DONE' } },
  'zz-t5': { primary: 'work-crash', kilo: 'work', expect: { status: 'NEEDS_OWNER', attempts: 1, first: 'CRASHED' } },
  'zz-t6': { primary: 'exit0-nothing', kilo: 'work', expect: { status: 'DONE', attempts: 2, first: 'FAILED_EARLY' } },
  'zz-t7': { primary: 'work-hang', kilo: 'work', stopAfter: 3500, expect: { status: 'NEEDS_OWNER', attempts: 1, first: 'STOPPED' } },
  'zz-t8': { primary: 'ratelimit-hang', kilo: 'work', stopAfter: 2500, expect: { status: 'NEEDS_OWNER', attempts: 1, first: 'STOPPED' } },
};
const cfg = { ...L.DEFAULTS, tickSeconds: 1, softSeconds: 3, hardSeconds: 6, capMinutes: 2 };
const routes = { models: { 'fake-model': [{ route: 'fakeprov/fake-model', provider: 'fakeprov', present: true, status: 'active', toolcall: true, input: 1, output: 2, variants: ['low', 'high'] }] } };

function jobFor(id, dir) {
  return { [id]: { kind: 'research', agent: 'zzfake', model: 'fake-model', level: 'high', position: 'max',
    primary: { client: 'fake', id: 'fake' }, outputs: [path.join(dir, 'f1.md'), path.join(dir, 'f2.md')] } };
}

function cleanup() {
  try { for (const f of fs.readdirSync(JOBS_DIR)) if (f.startsWith('zz-')) fs.unlinkSync(path.join(JOBS_DIR, f)); } catch { /* none */ }
  const logs = path.dirname(JOBS_DIR);
  try { for (const f of fs.readdirSync(logs)) if (f.startsWith('zz-')) fs.unlinkSync(path.join(logs, f)); } catch { /* none */ }
}

// One scenario, run in its own process: node launch-test.cjs --one <id>
if (process.argv[2] === '--one') {
  const id = process.argv[3];
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), `${id}-`));
  const s = SC[id];
  L.run(id, null, cfg, { jobs: jobFor(id, dir), routes,
    primaryCommand: () => `node "${FAKE}" ${s.primary} "${dir}"`,
    kiloCommand: () => `node "${FAKE}" ${s.kilo} "${dir}"` });
  return;
}

// The start lock under a race: five processes at once, exactly one may win.
if (process.argv[2] === '--lock') {
  process.stdout.write(L.takeStartLock(process.argv[3]) ? 'WIN\n' : 'LOSE\n');
  return;
}

// Pure checks: each entry is [name, ok].
function pureChecks() {
  const out = [];
  const exitOf = argv => { const w = process.stdout.write; process.stdout.write = () => true; try { return L.main(argv); } finally { process.stdout.write = w; } };
  const code = argv => { try { L.options(argv); return 0; } catch (e) { return e instanceof L.UsageError ? 2 : 99; } };
  // CB-16: malformed or unknown input exits 2.
  for (const argv of [['--start', 'a-sol', '--hard-seconds', '-5'], ['--start', 'a-sol', '--cap-minutes', '0'],
    ['--start', 'a-sol', '--soft-seconds', 'abc'], ['--start', 'a-sol', '--soft-seconds'], ['--start', 'a-sol', '--bogus'],
    ['--start', 'a-sol', '--route', 'kilo:x'], ['--start', 'a-sol', '--soft-seconds', '500'], ['--start', 'a', '--stop', 'a'],
    ['--start', 'a-sol', '--takeover', '--takeover'], [], ['--status', 'extra']]) {
    out.push([`options ${JSON.stringify(argv)} exits 2`, code(argv) === 2 && exitOf(argv) === 2]);
  }
  for (const argv of [['--status'], ['--start', 'a-sol', '--soft-seconds', '60', '--hard-seconds', '300', '--cap-minutes', '90'],
    ['--start', 'b-kimi', '--route', 'kilo:1', '--takeover'], ['--dry']]) out.push([`options ${JSON.stringify(argv)} parses`, code(argv) === 0]);
  return out;
}

if (process.argv[2] === '--pure') {
  const checks = pureChecks();
  process.stdout.write(`${checks.map(([n, ok]) => `${ok ? 'PASS' : 'FAIL'} ${n}`).join('\n')}\n`);
  process.exitCode = checks.every(([, ok]) => ok) ? 0 : 1;
  return;
}

cleanup();
const results = pureChecks().map(([n, ok]) => `${ok ? 'PASS' : 'FAIL'} pure: ${n}`);
const race = Array.from({ length: 5 }, () => spawn(process.execPath, [__filename, '--lock', 'zz-race'], { stdio: ['ignore', 'pipe', 'ignore'] }));
let raceOut = '';
let raceLeft = race.length;
for (const c of race) {
  c.stdout.on('data', d => { raceOut += d; });
  c.on('exit', () => {
    raceLeft -= 1;
    if (raceLeft) return;
    const wins = (raceOut.match(/WIN/g) || []).length;
    results.push(`${wins === 1 ? 'PASS' : 'FAIL'} zz-race: five simultaneous starts, ${wins} took the start lock (expected 1)`);
    const again = spawnSync(process.execPath, [__filename, '--lock', 'zz-race'], { encoding: 'utf8' }).stdout.trim();
    results.push(`${again === 'LOSE' ? 'PASS' : 'FAIL'} zz-lock-fresh: a second start within a minute is refused (${again})`);
    fs.writeFileSync(path.join(JOBS_DIR, 'zz-race.lock'), JSON.stringify({ starter: 1, at: Date.now() - 120000 }));
    const stale = spawnSync(process.execPath, [__filename, '--lock', 'zz-race'], { encoding: 'utf8' }).stdout.trim();
    results.push(`${stale === 'WIN' ? 'PASS' : 'FAIL'} zz-lock-stale: a stale lock with no watchdog is replaced (${stale})`);
    scenarios();
  });
}

function scenarios() {
  const ids = Object.keys(SC);
  let left = ids.length;
  for (const id of ids) {
    const child = spawn(process.execPath, [__filename, '--one', id], { stdio: 'ignore' });
    if (SC[id].stopAfter) setTimeout(() => fs.writeFileSync(path.join(JOBS_DIR, `${id}.stop`), 'test'), SC[id].stopAfter);
    const began = Date.now();
    const poll = setInterval(() => {
      const st = L.readJob(id);
      const done = st && ['DONE', 'NEEDS_OWNER'].includes(st.status) && !st.pid;
      if (!done && Date.now() - began < 120000) return;
      clearInterval(poll);
      child.kill();
      const e = SC[id].expect;
      const got = st ? { status: st.status, attempts: st.attempts.length, first: st.attempts[0] && st.attempts[0].status } : null;
      const ok = got && got.status === e.status && got.attempts === e.attempts && got.first === e.first;
      results.push(`${ok ? 'PASS' : 'FAIL'} ${id}: expected ${JSON.stringify(e)} got ${JSON.stringify(got)}${st && st.reason ? `; reason: ${st.reason}` : ''}`);
      left -= 1;
      if (left) return;
      cleanup();
      process.stdout.write(`${results.sort().join('\n')}\n`);
      process.exitCode = results.every(r => r.startsWith('PASS')) ? 0 : 1;
    }, 500);
  }
}
