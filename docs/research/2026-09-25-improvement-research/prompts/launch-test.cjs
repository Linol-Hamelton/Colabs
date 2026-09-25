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
const ROOT = path.resolve(__dirname, '..', '..', '..', '..');
const REL = 'docs/research/2026-09-25-improvement-research';
const JOBS_DIR = path.join(ROOT, '.ai', 'runtime', 'improvement-research', 'jobs');
const SC = {
  'zz-t1': { primary: 'fail', kilo: 'work', expect: { status: 'DONE', attempts: 2, first: 'FAILED_EARLY' } },
  'zz-t2': { primary: 'ratelimit-hang', kilo: 'fail', expect: { status: 'NEEDS_OWNER', attempts: 2, first: 'FAILED_EARLY' } },
  'zz-t3': { primary: 'work-hang', kilo: 'work', expect: { status: 'NEEDS_OWNER', attempts: 1, first: 'HUNG' } },
  'zz-t4': { primary: 'cpu-then-work', kilo: 'work', expect: { status: 'DONE', attempts: 1, first: 'DONE' } },
  'zz-t5': { primary: 'work-crash', kilo: 'work', expect: { status: 'NEEDS_OWNER', attempts: 1, first: 'CRASHED' } },
  'zz-t6': { primary: 'exit0-nothing', kilo: 'work', expect: { status: 'DONE', attempts: 2, first: 'FAILED_EARLY' } },
  'zz-t7': { primary: 'work-hang', kilo: 'work', stopAfter: 3500, expect: { status: 'NEEDS_OWNER', attempts: 1, first: 'STOPPED' } },
  'zz-t8': { primary: 'ratelimit-hang', kilo: 'work', stopAfter: 2500, expect: { status: 'NEEDS_OWNER', attempts: 1, first: 'STOPPED' } },
  // CB-19: a client that prints a rate-limit error in a loop is not making progress.
  'zz-t9': { primary: 'ratelimit-loop', kilo: 'work', expect: { status: 'DONE', attempts: 2, first: 'FAILED_EARLY' } },
  // CB-18: an owner stop issued before the watchdog runs is obeyed, not deleted.
  'zz-t10': { primary: 'work', kilo: 'work', stopBefore: true, expect: { status: 'NEEDS_OWNER', attempts: 0 } },
  // CB-24: the root exits while a detached grandchild lives; the watchdog stops it by identity.
  'zz-t11': { primary: 'orphan-exit', kilo: 'work', orphanGone: true, expect: { status: 'DONE', attempts: 1, first: 'DONE' } },
  // CB-17: driven by deadWatchdog() below, not by the common loop. t12: the watchdog dies after it
  // recorded the tree, so --stop must stop the grandchild. t15: it dies within seconds, maybe before
  // any record, so the start is refused until --stop and nothing unrecorded can be stopped.
  'zz-t12': { primary: 'orphan-hang-long', kilo: 'work', own: true, killAt: 6000, checkAt: 8000, mustRecord: true },
  'zz-t15': { primary: 'orphan-hang', kilo: 'work', own: true, killAt: 2500, checkAt: 4000 },
  // PROTO-DEC-0070: in a disposable worktree; the outputs come back into the checkout.
  'zz-t13': { primary: 'work', kilo: 'work', isolate: true, imported: true, expect: { status: 'DONE', attempts: 1, first: 'DONE' } },
  // PROTO-DEC-0070 item 4: a write outside the job's scope stops it, and nothing is copied back.
  'zz-t14': { primary: 'escape', kilo: 'work', isolate: true, imported: false, expect: { status: 'NEEDS_OWNER', attempts: 1, first: 'SCOPE_STOP' } },
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
  // Isolated scenarios: their copied-back outputs and any worktree a scope stop kept.
  try { fs.rmSync(path.join(ROOT, REL, 'zz-out'), { recursive: true, force: true }); } catch { /* none */ }
  const list = spawnSync('git', ['-C', ROOT, 'worktree', 'list', '--porcelain'], { encoding: 'utf8' }).stdout || '';
  for (const m of list.matchAll(/^worktree (.+)$/gm)) {
    if (/colabs-research[\\/]zz-/.test(m[1])) spawnSync('git', ['-C', ROOT, 'worktree', 'remove', '--force', m[1]]);
  }
  spawnSync('git', ['-C', ROOT, 'worktree', 'prune']);
}

// One scenario, run in its own process: node launch-test.cjs --one <id>
if (process.argv[2] === '--one') {
  const id = process.argv[3];
  const s = SC[id];
  if (s.isolate) {
    const out = dir => path.join(dir, REL, 'zz-out', id);
    const job = { ...jobFor(id, '.')[id], outputs: [`${REL}/zz-out/${id}/f1.md`, `${REL}/zz-out/${id}/f2.md`] };
    L.run(id, null, cfg, { jobs: { [id]: job }, routes,
      primaryCommand: (jobId, message, dir) => `node "${FAKE}" ${s.primary} "${out(dir)}" "${dir}"`,
      kiloCommand: (jobId, route, variant, message, dir) => `node "${FAKE}" ${s.kilo} "${out(dir)}" "${dir}"` });
    return;
  }
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), `${id}-`));
  L.run(id, null, cfg, { jobs: jobFor(id, dir), routes, isolate: false,
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
  // CB-20: hard-failure texts are detected, normal output is not.
  for (const t of ['Your credit balance is too low', 'overloaded_error: Overloaded', '500 Internal Server Error',
    '504 Gateway Timeout', 'TypeError: fetch failed', 'Error: socket hang up', 'getaddrinfo EAI_AGAIN api.example',
    "You've hit your limit", 'stream error: 429 rate limit exceeded', 'Error: 401 Unauthorized - not logged in',
    '{"type":"error","error":{"type":"rate_limit_error"}}', 'HTTP 503', '"status":529', '403 Forbidden',
    'You exceeded your current quota', 'RESOURCE_EXHAUSTED', 'Insufficient Balance']) out.push([`error text detected: ${t}`, L.ERROR_TEXT.test(t)]);
  for (const t of ['line 503 of the spec', 'processed 429 tokens', 'Forbidden path: .claude/ is outside the sandbox',
    'the quota section of the report', 'a rate limit policy for providers', 'wrote 500 lines']) out.push([`normal text not flagged: ${t}`, !L.ERROR_TEXT.test(t)]);
  // CB-17, CB-24: identity-only trees. Rows: root 100; child 101; grandchild 102; 103 claims parent
  // 100 but is older (a dead namesake's child); 104 reuses a recorded PID with a new creation time.
  const rows = [{ ProcessId: 100, ParentProcessId: 1, C: 10 }, { ProcessId: 101, ParentProcessId: 100, C: 11 },
    { ProcessId: 102, ParentProcessId: 101, C: 12 }, { ProcessId: 103, ParentProcessId: 100, C: 5 },
    { ProcessId: 104, ParentProcessId: 1, C: 50 }, { ProcessId: 301, ParentProcessId: 300, C: 25 }];
  const pids = list => (list || []).map(x => x.pid).join(',');
  out.push(['aliveTree: live tree newest first, older namesake child excluded', pids(L.aliveTree(rows, { 100: 10 })) === '102,101,100']);
  out.push(['aliveTree: a reused PID is not the recorded process', pids(L.aliveTree(rows, { 104: 20 })) === '']);
  out.push(['aliveTree: a child of a dead recorded process counts only for a refusal', pids(L.aliveTree(rows, { 300: 20 })) === '' && pids(L.aliveTree(rows, { 300: 20 }, true)) === '301']);
  out.push(['aliveTree: unreadable table is unknown, not empty', L.aliveTree(null, { 100: 10 }) === null]);
  // CB-19: a retry loop's log lines are not progress; ordinary output is.
  out.push(['error-only log chunk is not progress', !L.chunkIsProgress('stream error: 429 rate limit exceeded\nstream error: 429 rate limit exceeded; retrying in 1s\n')]);
  out.push(['retry notices alone are not progress', !L.chunkIsProgress('Retrying in 5 seconds (attempt 3/10)\n\n')]);
  out.push(['ordinary output is progress', L.chunkIsProgress('reading docs/research/BRIEF.md\n')]);
  out.push(['one ordinary line among errors is progress', L.chunkIsProgress('HTTP 503\nwrote section 2\n')]);
  // PROTO-DEC-0070: git status parsing, the scope rule, and the client commands it fixes.
  const ents = L.parsePorcelainZ('?? a/out.md\0 M docs/x.md\0R  new.md\0old.md\0?? .ai/worklog/codex-0123456789abcdef.md\0');
  out.push(['porcelain -z: a rename yields both paths', JSON.stringify(ents.map(e => e.path)) === JSON.stringify(['a/out.md', 'docs/x.md', 'new.md', 'old.md', '.ai/worklog/codex-0123456789abcdef.md'])]);
  const same = L.scopeViolations(ents, ['a/out.md'], [['docs/x.md', 'h1']], p => (p === 'docs/x.md' ? 'h1' : 'absent'));
  out.push(['scope: outputs, a new journal and an unchanged baseline path pass; anything else stops', JSON.stringify(same) === JSON.stringify(['new.md', 'old.md'])]);
  out.push(['scope: a baseline path changed again stops', L.scopeViolations([{ code: ' M', path: 'docs/x.md' }], [], [['docs/x.md', 'h0']], () => 'h1').length === 1]);
  out.push(['scope: an edit to a tracked journal stops', L.scopeViolations([{ code: ' M', path: '.ai/worklog/codex-0123456789abcdef.md' }], [], [], () => 'x').length === 1]);
  const vibe = L.primaryCommand('b-mistral', 'm', 'D:/w');
  out.push(['vibe: minimal tool set under --auto-approve, no web tool', /--enabled-tools read_file .*--enabled-tools powershell --auto-approve/.test(vibe) && !/web_/.test(vibe)]);
  // The owner's pre-launch role gate: every job agent's `## Roles` line points to its job.
  const jobs2 = { 'x-one': { agent: 'aa' }, 'x-two': { agent: 'bb' } };
  const verdict = entries => L.rolePreflight(entries, jobs2).map(r => `${r.agent}:${r.ok}`).join(' ');
  out.push(['preflight: a missing line, a line without its job, and a missing operator line fail',
    verdict([{ agent: 'aa', role: 'research frames only: job x-one' }, { agent: 'bb', role: 'research frames only' }]) === 'aa:true bb:false kilo:false']);
  out.push(['preflight: lines naming each job and the operator pass',
    verdict([{ agent: 'aa', role: 'job x-one' }, { agent: 'bb', role: 'job x-two' }, { agent: 'kilo', role: 'operator of K-launch only' }]) === 'aa:true bb:true kilo:true']);
  out.push(['options ["--preflight"] parses', code(['--preflight']) === 0]);
  const copilot = L.primaryCommand('b-grok', 'm', 'D:/w');
  let parses = true;
  try { L.checkCommand(copilot); } catch { parses = false; }
  out.push(['copilot: worktree as working directory, no --add-dir, commit/push/tag denied, command passes checkCommand',
    /-C "D:\/w"/.test(copilot) && !/--add-dir/.test(copilot) && /shell\(git push\)/.test(copilot) && parses]);
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

// A killed process may linger as a zombie on Linux until it is reaped; it counts as gone.
const pidAlive = pid => {
  try { if (/\) Z /.test(fs.readFileSync(`/proc/${pid}/stat`, 'utf8'))) return false; } catch { /* not Linux, or gone */ }
  try { process.kill(pid, 0); return true; } catch (e) { return e.code === 'EPERM'; }
};
const quiet = fn => { const w = process.stdout.write; process.stdout.write = () => true; try { return fn(); } finally { process.stdout.write = w; } };

// CB-17: the watchdog dies, the root exits, a grandchild lives on. A new start must be refused
// until the owner's --stop has settled the attempt; then it is allowed again. If the watchdog
// recorded the tree before it died, --stop must also have stopped the grandchild; if it never did,
// no process table can name the grandchild (the residual in P-L3-004), and the test stops its own
// grandchild so that none outlives the run.
function deadWatchdog(id, finish) {
  const s = SC[id];
  const child = spawn(process.execPath, [__filename, '--one', id], { stdio: 'ignore' });
  setTimeout(() => child.kill('SIGKILL'), s.killAt);
  setTimeout(() => {
    const before = L.startBlockers(id);
    quiet(() => L.stop([id]));
    setTimeout(() => {
      const after = L.startBlockers(id);
      const st = L.readJob(id);
      const a0 = st && st.attempts[0];
      const dir = a0 && (a0.command.match(/"([^"]+)"\s*$/) || [])[1];
      let orphan = null;
      try { orphan = Number(fs.readFileSync(path.join(dir, 'orphan.pid'), 'utf8')); } catch { /* not written */ }
      const scanned = Boolean(a0 && a0.scanned);
      const alive = orphan !== null && pidAlive(orphan);
      if (alive) { try { process.kill(orphan); } catch { /* gone */ } }
      const ok = Boolean(before) && after === null && st && st.status === 'NEEDS_OWNER' && !(scanned && alive) && (scanned || !s.mustRecord);
      finish(`${ok ? 'PASS' : 'FAIL'} ${id}: dead watchdog, live grandchild: refused before --stop (${before}), allowed after (${after}); tree recorded before the watchdog died: ${scanned}; grandchild after --stop: ${alive ? 'alive' : 'gone'}`);
    }, 1500);
  }, s.checkAt);
}

function scenarios() {
  const ids = Object.keys(SC).filter(id => !SC[id].own);
  const own = Object.keys(SC).filter(id => SC[id].own);
  let left = ids.length + own.length;
  const report = line => {
    results.push(line);
    left -= 1;
    if (left) return;
    cleanup();
    process.stdout.write(`${results.sort().join('\n')}\n`);
    process.exitCode = results.every(r => r.startsWith('PASS')) ? 0 : 1;
  };
  for (const id of own) deadWatchdog(id, report);
  for (const id of ids) {
    if (SC[id].stopBefore) { fs.mkdirSync(JOBS_DIR, { recursive: true }); fs.writeFileSync(path.join(JOBS_DIR, `${id}.stop`), 'test'); }
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
      const line = note => `${ok && !/ALIVE|MISMATCH|LEAKED/.test(note) ? 'PASS' : 'FAIL'} ${id}: expected ${JSON.stringify(e)} got ${JSON.stringify(got)}${st && st.reason ? `; reason: ${st.reason}` : ''}${note}`;
      if (SC[id].imported !== undefined) {
        const back = fs.existsSync(path.join(ROOT, REL, 'zz-out', id, 'f1.md'));
        const leaked = fs.existsSync(path.join(ROOT, 'OwnerIdeas', 'zz-escape.md'));
        report(line(`; output copied back: ${back}${back === SC[id].imported ? '' : ' MISMATCH'}${leaked ? '; ESCAPE LEAKED into the checkout' : ''}`));
        return;
      }
      if (!SC[id].orphanGone) { report(line('')); return; }
      const f = st && st.attempts[0] && (st.attempts[0].changed || [])[0];
      const orphanPid = f ? Number(fs.readFileSync(path.join(path.dirname(f), 'orphan.pid'), 'utf8')) : null;
      let waited = 0;
      const wait = setInterval(() => {
        waited += 250;
        const gone = orphanPid !== null && !pidAlive(orphanPid);
        if (!gone && waited < 3000) return;
        clearInterval(wait);
        report(line(`; grandchild ${orphanPid} ${gone ? 'gone' : 'STILL ALIVE'}`));
      }, 250);
    }, 500);
  }
}
