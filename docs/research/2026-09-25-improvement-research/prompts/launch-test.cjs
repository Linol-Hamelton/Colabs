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
  // F-L1, F-L2: a remote added and a branch created in the copy stop the job; the checkout's own
  // config and refs are untouched, because the copy is a private clone.
  'zz-t16': { primary: 'git-escape', kilo: 'work', isolate: true, imported: false, gitEscape: true, expect: { status: 'NEEDS_OWNER', attempts: 1, first: 'SCOPE_STOP' } },
  // Item 2: a job's environment and the git config it sees carry no canary credential vector;
  // scenarios() plants the canaries in this child's environment.
  'zz-t17': { primary: 'env-dump', kilo: 'work', isolate: true, imported: true, envCanary: true, expect: { status: 'DONE', attempts: 1, first: 'DONE' } },
  // Item 4: a bypass push (the known `-c` residual) is invisible to prevention, so the ls-remote
  // audit invalidates the attempt. zz-t19 is the positive case; zz-t20 the audit's named blind.
  'zz-t18': { primary: 'push-bypass', kilo: 'work', isolate: true, imported: false, audit: 'diff', expect: { status: 'NEEDS_OWNER', attempts: 1, first: 'REMOTE_INCIDENT' } },
  'zz-t19': { primary: 'work', kilo: 'work', isolate: true, imported: true, audit: 'empty', expect: { status: 'DONE', attempts: 1, first: 'DONE' } },
  'zz-t20': { primary: 'push-transient', kilo: 'work', isolate: true, imported: true, audit: 'transient', expect: { status: 'DONE', attempts: 1, first: 'DONE' } },
  // Item 6 (M-1): a transient index.lock must not stop a working attempt; a permanent one stops it
  // with its own reason, keeps the copy and never deletes the lock.
  'zz-t21': { primary: 'index-lock-brief', kilo: 'work', isolate: true, imported: true, indexLock: 'brief', expect: { status: 'DONE', attempts: 1, first: 'DONE' } },
  'zz-t22': { primary: 'index-lock-permanent', kilo: 'work', isolate: true, imported: false, indexLock: 'stale', expect: { status: 'NEEDS_OWNER', attempts: 1, first: 'INDEX_LOCK' } },
};
// The host global config and the credential canaries the item-2 scenario plants in the job parent.
const CANARY_HOST = path.join(os.tmpdir(), 'zz-host-global.gitconfig');
const CANARY_ENV = { GH_TOKEN: 'canary-gh', GITHUB_TOKEN: 'canary-github', GIT_ASKPASS: 'canary-askpass',
  SSH_ASKPASS: 'canary-ssh-askpass', SSH_AUTH_SOCK: 'canary-agent', MY_GIT_TOKEN: 'canary-git-token',
  OPENAI_TOKEN: 'keep-openai-token', GIT_CONFIG_GLOBAL: CANARY_HOST };
const cfg = { ...L.DEFAULTS, tickSeconds: 1, softSeconds: 3, hardSeconds: 6, capMinutes: 2 };
const routes = { models: { 'fake-model': [{ route: 'fakeprov/fake-model', provider: 'fakeprov', present: true, status: 'active', toolcall: true, input: 1, output: 2, variants: ['low', 'high'] }] } };

function jobFor(id, dir) {
  return { [id]: { kind: 'research', agent: 'zzfake', model: 'fake-model', level: 'high', position: 'max',
    primary: { client: 'fake', id: 'fake' }, outputs: [path.join(dir, 'f1.md'), path.join(dir, 'f2.md')],
    git: { mode: 'READ_ONLY', publishRequired: false } } };
}

function cleanup() {
  try { for (const f of fs.readdirSync(JOBS_DIR)) if (f.startsWith('zz-')) fs.unlinkSync(path.join(JOBS_DIR, f)); } catch { /* none */ }
  try { fs.rmSync(CANARY_HOST, { force: true }); } catch { /* none */ }
  const logs = path.dirname(JOBS_DIR);
  try { for (const f of fs.readdirSync(logs)) if (f.startsWith('zz-')) fs.unlinkSync(path.join(logs, f)); } catch { /* none */ }
  // Isolated scenarios: their copied-back outputs, and any copy a scope stop kept (clones now,
  // linked worktrees from older runs).
  try { fs.rmSync(path.join(ROOT, REL, 'zz-out'), { recursive: true, force: true }); } catch { /* none */ }
  const copies = path.join(os.tmpdir(), 'colabs-research');
  try {
    for (const d of fs.readdirSync(copies)) {
      if (d.startsWith('zz-')) fs.rmSync(path.join(copies, d), { recursive: true, force: true, maxRetries: 3 });
    }
  } catch { /* none */ }
  const list = spawnSync('git', ['-C', ROOT, 'worktree', 'list', '--porcelain'], { encoding: 'utf8' }).stdout || '';
  for (const m of list.matchAll(/^worktree (.+)$/gm)) {
    if (/colabs-research[\\/]zz-/.test(m[1])) spawnSync('git', ['-C', ROOT, 'worktree', 'remove', '--force', m[1]]);
  }
  spawnSync('git', ['-C', ROOT, 'worktree', 'prune']);
  // The launcher's private hooks/config directory of this test process, when it was created.
  try { const root = L.hooksRootPath(); if (root) fs.rmSync(root, { recursive: true, force: true, maxRetries: 3 }); } catch { /* none */ }
  // Audit and hook fixtures that a crashed run may have left in the temp root.
  try {
    for (const d of fs.readdirSync(os.tmpdir())) {
      if (d.startsWith('zz-audit-') || d.startsWith('zz-hooks-') || d.startsWith('zz-push-') || d.startsWith('zz-env-') || d.startsWith('zz-table-') || d.startsWith('zz-gitmode-')) {
        fs.rmSync(path.join(os.tmpdir(), d), { recursive: true, force: true, maxRetries: 3 });
      }
    }
  } catch { /* none */ }
}

// One scenario, run in its own process: node launch-test.cjs --one <id>
if (process.argv[2] === '--one') {
  const id = process.argv[3];
  const s = SC[id];
  if (s.isolate) {
    const out = dir => path.join(dir, REL, 'zz-out', id);
    const bare = process.env.ZZ_AUDIT_BARE || '';
    const arg = bare ? ` "${bare}"` : '';
    const job = { ...jobFor(id, '.')[id], outputs: [`${REL}/zz-out/${id}/f1.md`, `${REL}/zz-out/${id}/f2.md`] };
    L.run(id, null, cfg, { jobs: { [id]: job }, routes, auditRepo: process.env.ZZ_AUDIT_REPO || null,
      primaryCommand: (jobId, message, dir) => `node "${FAKE}" ${s.primary} "${out(dir)}" "${dir}"${arg}`,
      kiloCommand: (jobId, route, variant, message, dir) => `node "${FAKE}" ${s.kilo} "${out(dir)}" "${dir}"${arg}` });
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

// F-L1, Part 2 cases 1,3,5,6,7,8,10,13: with the executor's environment (item 2), no push leaves a
// scratch repository, in any direct form. The `-c` bypass is prevention-impossible by config and is
// covered by the audit scenario (zz-t18 below); the audit and receiver state are the rest.
function pushBlockChecks() {
  const base = fs.mkdtempSync(path.join(os.tmpdir(), 'zz-push-'));
  const bare = path.join(base, 'remote.git'); const work = path.join(base, 'work');
  const g = (args, env) => spawnSync('git', args, { encoding: 'utf8', env: env || process.env });
  g(['init', '-q', '--bare', bare]); g(['init', '-q', work]);
  g(['-C', work, '-c', 'user.email=t@t', '-c', 'user.name=t', 'commit', '-q', '--allow-empty', '-m', 'x']);
  g(['-C', work, 'remote', 'add', 'origin', bare]);
  // Case 5 and 9 locally: the host global config holds a canary helper and a longer `insteadOf`
  // mapping. The job environment must override the file it names.
  const hostGlobal = path.join(base, 'host.gitconfig');
  fs.writeFileSync(hostGlobal, `[credential]\n\thelper = canary-helper\n[url "${bare}"]\n\tinsteadOf = no-push://blocked\n`);
  const env = L.executorEnv({ ...process.env, GIT_CONFIG_GLOBAL: hostGlobal, GIT_ASKPASS: 'canary-askpass' });
  const no = r => r.status !== 0;
  const out = [];
  out.push(['(1) push to the remote present at launch is refused', no(g(['-C', work, 'push', '-q', 'origin', 'HEAD:refs/heads/a'], env))]);
  out.push(['(7) a new branch cannot be created on the remote', no(g(['-C', work, 'push', '-q', 'origin', 'HEAD:refs/heads/new'], env))]);
  g(['-C', work, 'remote', 'add', 'added', bare]);
  out.push(['(3) push to a remote added later is refused', no(g(['-C', work, 'push', '-q', 'added', 'HEAD:refs/heads/b'], env))]);
  out.push(['(3) push to an explicit URL is refused', no(g(['-C', work, 'push', '-q', bare, 'HEAD:refs/heads/c'], env))]);
  g(['-C', work, 'remote', 'set-url', '--push', 'added', bare]);
  out.push(['(3) push through an explicit push URL is refused', no(g(['-C', work, 'push', '-q', 'added', 'HEAD:refs/heads/d'], env))]);
  out.push(['(6) a tag push is refused', no(g(['-C', work, 'push', '-q', 'origin', 'HEAD:refs/tags/v1'], env))]);
  out.push(['(8) a force push is refused', no(g(['-C', work, 'push', '-q', '--force', 'origin', 'HEAD:refs/heads/a'], env))]);
  g(['-C', work, 'push', '-q', bare, 'HEAD:refs/heads/doomed']);
  out.push(['(13) a branch deletion through push is refused', no(g(['-C', work, 'push', '-q', 'origin', ':refs/heads/doomed'], env))]);
  out.push(['(5) an ambient global config does not restore the URL', no(g(['-C', work, 'push', '-q', 'no-push://blocked', 'HEAD:refs/heads/e'], env))]);
  // (10) another git executable or absolute path: the environment still applies.
  let gitExe = null;
  try { if (process.platform === 'win32') gitExe = (require('node:child_process').execFileSync('where', ['git'], { encoding: 'utf8' }).split(/\r?\n/).filter(Boolean)[0] || null); } catch { /* skip */ }
  if (gitExe) out.push([`(10) an absolute git path is refused too (${gitExe})`, no(spawnSync(gitExe, ['-C', work, 'push', '-q', 'origin', 'HEAD:refs/heads/f'], { encoding: 'utf8', env }))]);
  out.push(['git status still works under the job environment', g(['-C', work, 'status', '--short'], env).status === 0]);
  const refs = (g(['-C', bare, 'for-each-ref', '--format=%(refname)']).stdout || '').trim().split('\n').filter(Boolean);
  out.push([`the scratch remote received no pushed ref (${JSON.stringify(refs)})`, refs.length === 1 && refs[0] === 'refs/heads/doomed']);
  const listed = g(['-C', work, 'config', '--show-origin', '-l'], env).stdout || '';
  out.push(['(9) the canary helper is not the effective credential helper', !listed.includes('canary-helper')]);
  try { fs.rmSync(base, { recursive: true, force: true, maxRetries: 3 }); } catch { /* scratch */ }
  return out;
}

// Item 2: the job environment carries no git credential vector, and the ambient global config
// (canary credential helper) is not read. The in-job path is zz-t17 below.
function envChecks() {
  const out = [];
  const base = fs.mkdtempSync(path.join(os.tmpdir(), 'zz-env-'));
  const hostGlobal = path.join(base, 'host.gitconfig');
  fs.writeFileSync(hostGlobal, '[credential]\n\thelper = canary-helper\n');
  const canaries = { GH_TOKEN: 'canary-gh', GITHUB_TOKEN: 'canary-github', GIT_ASKPASS: 'canary-askpass',
    SSH_ASKPASS: 'canary-ssh-askpass', SSH_AUTH_SOCK: 'canary-agent', MY_GIT_TOKEN: 'canary-git-token',
    GITHUB_PAT: 'canary-github-pat', OPENAI_TOKEN: 'keep-openai-token', FORGE_PAT: 'keep-forge-pat' };
  const env = L.executorEnv({ ...process.env, ...canaries, GIT_CONFIG_GLOBAL: hostGlobal });
  const leaked = Object.entries(canaries).filter(([k, v]) => v.startsWith('canary') && String(env[k]) === v).map(([k]) => k);
  out.push([`every planted credential vector is removed (${leaked.length ? leaked.join(', ') : 'none left'})`, leaked.length === 0]);
  out.push(['a token that does not name GitHub or git survives the scrub', env.OPENAI_TOKEN === 'keep-openai-token' && env.FORGE_PAT === 'keep-forge-pat']);
  out.push(['the job does not inherit the host global config',
    env.GIT_CONFIG_GLOBAL !== hostGlobal && !env.GIT_CONFIG_GLOBAL.includes('zz-env-')
    && env.GIT_CONFIG_NOSYSTEM === '1' && env.GIT_TERMINAL_PROMPT === '0' && env.GCM_INTERACTIVE === 'never'
    && fs.existsSync(env.GIT_CONFIG_GLOBAL) && fs.readFileSync(env.GIT_CONFIG_GLOBAL, 'utf8') === '']);
  const work = path.join(base, 'work');
  spawnSync('git', ['init', '-q', work], { encoding: 'utf8' });
  const cfg = spawnSync('git', ['config', '--show-origin', '-l'], { cwd: work, encoding: 'utf8', env }).stdout || '';
  const helper = spawnSync('git', ['config', '--get', 'credential.helper'], { cwd: work, encoding: 'utf8', env });
  out.push(['git config inside the job shows no canary helper and no host origin', !cfg.includes('canary-helper') && !cfg.includes(hostGlobal)]);
  out.push([`the effective credential helper is empty, not the canary (${JSON.stringify(helper.stdout.trim())})`, helper.stdout.trim() === '' || helper.status !== 0]);
  try { fs.rmSync(base, { recursive: true, force: true, maxRetries: 3 }); } catch { /* scratch */ }
  return out;
}

// F-3P-2: plant post-checkout and pre-commit hooks where a job can write, run every launcher git
// call, and assert that none executed. The positive control proves the planted hooks do run when
// git is pointed at their directory, so a silent environment cannot pass this check by accident.
function hookChecks() {
  const out = [];
  const base = fs.mkdtempSync(path.join(os.tmpdir(), 'zz-hooks-'));
  const marker = path.join(base, 'ran.txt').replace(/\\/g, '/');
  const plant = dir => {
    fs.mkdirSync(dir, { recursive: true });
    for (const h of ['post-checkout', 'pre-commit', 'post-commit', 'pre-push']) {
      const f = path.join(dir, h);
      fs.writeFileSync(f, `#!/bin/sh\necho ${h} >> "${marker}"\n`);
      fs.chmodSync(f, 0o755);
    }
  };
  const ran = () => fs.existsSync(marker);
  const g = (args, cwd) => spawnSync('git', args, { cwd, encoding: 'utf8' });
  const repo = path.join(base, 'clone');
  g(['init', '-q', repo]);
  g(['-C', repo, 'config', 'user.email', 't@t']);
  g(['-C', repo, 'config', 'user.name', 't']);
  g(['-C', repo, 'commit', '-q', '--allow-empty', '-m', 'x']);
  // Positive control: the planted hooks execute when git is told to use their directory.
  const planted = path.join(base, 'planted');
  plant(planted);
  g(['-C', repo, '-c', `core.hooksPath=${planted}`, 'checkout', '-q', '--detach', 'HEAD']);
  out.push(['a planted post-checkout hook runs when git uses its directory (positive control)', ran()]);
  try { fs.rmSync(marker); } catch { /* not written */ }
  // Where a job can write: the retired shared directory and a copy's own hooks directory.
  plant(path.join(os.tmpdir(), 'colabs-research', '.no-hooks'));
  plant(path.join(repo, '.git', 'hooks'));
  // Every git call the launcher makes on a copy, including the two that run hooks.
  L.gitIn(repo, ['checkout', '-q', '--detach', 'HEAD']);
  L.gitIn(repo, ['status', '--porcelain=v1', '-z', '--untracked-files=all']);
  L.gitIn(repo, ['rev-parse', 'HEAD']);
  L.gitIn(repo, ['for-each-ref', '--format=%(refname) %(objectname)']);
  L.gitIn(repo, ['config', 'core.hooksPath']);
  L.gitIn(repo, ['commit', '-q', '--allow-empty', '-m', 'y']);
  out.push(['no launcher git call ran a hook planted in a job-writable directory', !ran()]);
  // The launcher's preparation path: the checkout of a fresh copy while the retired shared
  // directory holds hooks; the one that executed under the old mechanism (F-3P-2).
  let dir = null;
  try { ({ dir } = L.prepareWorkdir('zz-hooks', 1)); } catch { /* reported below */ }
  out.push(['prepareWorkdir (clone + checkout) runs no planted hook', dir !== null && !ran()]);
  if (dir) L.dropWorkdir(dir);
  out.push(['the per-call hooks path is never created', !fs.existsSync(L.noHooksPath()) && !fs.existsSync(L.noHooksPath())]);
  try { fs.rmSync(base, { recursive: true, force: true, maxRetries: 3 }); } catch { /* scratch */ }
  return out;
}

// M-2 (PROTO-DEC-0073): the job table is strict. Unknown keys and missing fields fail closed at
// load and at the CLI; `--check`, `--preflight` and `--dry` pass with the real file.
function tableChecks() {
  const out = [];
  const base = fs.mkdtempSync(path.join(os.tmpdir(), 'zz-table-'));
  const good = JSON.parse(fs.readFileSync(path.join(__dirname, 'jobs.json'), 'utf8'));
  const write = (name, mutate) => { const copy = JSON.parse(JSON.stringify(good)); mutate(copy); const f = path.join(base, name); fs.writeFileSync(f, JSON.stringify(copy)); return f; };
  const throws = f => { try { L.loadJobTable(f); return false; } catch (e) { return e instanceof L.TableError; } };
  try { out.push(['the real job table loads, 8 jobs', Object.keys(L.loadJobTable().jobs).length === 8]); } catch { out.push(['the real job table loads, 8 jobs', false]); }
  out.push(['an unknown top-level key fails closed', throws(write('top.json', t => { t.extra = 1; }))]);
  out.push(['an unknown job key fails closed', throws(write('jobkey.json', t => { t.jobs['a-sol'].extra = 1; }))]);
  out.push(['a missing field fails closed', throws(write('missing.json', t => { delete t.jobs['a-sol'].level; }))]);
  out.push(['an unknown client fails closed', throws(write('client.json', t => { t.jobs['a-sol'].primary.client = 'other'; }))]);
  out.push(['an unknown position fails closed', throws(write('position.json', t => { t.jobs['a-sol'].position = 'top'; }))]);
  out.push(['a need on an unknown job fails closed', throws(write('needs.json', t => { t.jobs['a-synth'].needs = ['a-sol', 'nope']; }))]);
  out.push(['an empty jobs object fails closed', throws(write('empty.json', t => { t.jobs = {}; }))]);
  const badGit = (name, mutate) => throws(write(name, t => mutate(t.jobs['a-sol'].git)));
  out.push(['(14) an unknown git mode fails closed', badGit('mode.json', g => { g.mode = 'PUSH_MAYBE'; })]);
  out.push(['(14) publishRequired missing fails closed', badGit('pub.json', g => { delete g.publishRequired; })]);
  out.push(['(14) an unknown git key fails closed', badGit('gitkey.json', g => { g.extra = 1; })]);
  out.push(['(14) a missing git descriptor fails closed', throws(write('nogit.json', t => { delete t.jobs['a-sol'].git; }))]);
  out.push(['(14) LOCAL_COMMIT without an authorisation fails closed', throws(write('lc.json', t => { t.jobs['a-sol'].git = { mode: 'LOCAL_COMMIT', publishRequired: false }; }))]);
  out.push(['(14) a push mode without a target fails closed', throws(write('push.json', t => { t.jobs['a-sol'].git = { mode: 'BRANCH_PUSH', publishRequired: false }; }))]);
  out.push(['LOCAL_COMMIT with an authorisation parses', (() => { try { return L.loadJobTable(write('oklc.json', t => { t.jobs['a-sol'].git = { mode: 'LOCAL_COMMIT', publishRequired: false, authorisation: 'PROTO-DEC-0000' }; })).jobs['a-sol'].git.mode === 'LOCAL_COMMIT'; } catch { return false; } })()]);
  const quiet = (argv, ov) => { const w = process.stdout.write; process.stdout.write = () => true; try { try { return L.main(argv, ov); } catch { return 99; } } finally { process.stdout.write = w; } };
  const broken = write('cli-broken.json', t => { t.jobs['a-sol'].extra = 1; });
  out.push(['the CLI fails closed (exit 2) on a broken table file', quiet(['--dry', 'a-sol'], { jobsFile: broken }) === 2]);
  out.push(['--dry passes with the job table file', quiet(['--dry', 'researchers']) === 0]);
  out.push(['--check passes with the job table file', quiet(['--check', 'a-sol']) === 0]);
  out.push(['--preflight passes with the job table file', quiet(['--preflight']) === 0]);
  try { fs.rmSync(base, { recursive: true, force: true, maxRetries: 3 }); } catch { /* scratch */ }
  return out;
}

// Item 3: task git modes, default-deny. Every mode is exercised: READ_ONLY runs, LOCAL_COMMIT
// needs the loader-enforced authorisation, both push modes fail closed with "publisher not
// implemented" at the dispatcher and again in the watchdog.
function gitModeChecks() {
  const out = [];
  const base = fs.mkdtempSync(path.join(os.tmpdir(), 'zz-gitmode-'));
  const routes = { models: { 'fake-model': [{ route: 'fakeprov/fake-model', provider: 'fakeprov', present: true, status: 'active', toolcall: true, input: 1, output: 2, variants: ['low', 'high'] }] } };
  const cfg = { ...L.DEFAULTS, tickSeconds: 1, softSeconds: 3, hardSeconds: 6, capMinutes: 2 };
  const mode = (id, g) => ({ [id]: { kind: 'research', agent: 'zzfake', model: 'fake-model', level: 'high', position: 'max',
    primary: { client: 'fake', id: 'fake' }, outputs: [path.join(base, id, 'f1.md')], git: g } });
  const capture = fn => { const w = process.stdout.write; let text = ''; process.stdout.write = chunk => { text += chunk; return true; }; try { return { code: fn(), text }; } finally { process.stdout.write = w; } };
  const readOnly = { mode: 'READ_ONLY', publishRequired: false, target: null, authorisation: null };
  const local = { mode: 'LOCAL_COMMIT', publishRequired: false, target: null, authorisation: 'PROTO-DEC-0000' };
  out.push(['READ_ONLY is allowed', L.gitRefusal({ git: readOnly }) === null]);
  out.push(['LOCAL_COMMIT with an authorisation is allowed', L.gitRefusal({ git: local }) === null]);
  out.push(['(14) BRANCH_PUSH fails closed with "publisher not implemented"', L.gitRefusal({ git: { ...readOnly, mode: 'BRANCH_PUSH', target: 'refs/heads/x' } }) === 'publisher not implemented']);
  out.push(['(14) RELEASE_PUSH fails closed with "publisher not implemented"', L.gitRefusal({ git: { ...readOnly, mode: 'RELEASE_PUSH', target: 'refs/tags/v1' } }) === 'publisher not implemented']);
  out.push(['a missing descriptor fails closed', L.gitRefusal({}) === 'no git descriptor in the job table']);
  const pushTable = mode('zz-pushmode', { mode: 'BRANCH_PUSH', publishRequired: false, target: 'refs/heads/x', authorisation: null });
  const started = capture(() => L.startJobs(['zz-pushmode'], cfg, pushTable));
  out.push([`the dispatcher refuses a push-mode job with nothing started (${started.text.trim()})`, started.code === 1 && /publisher not implemented/.test(started.text)]);
  let clientRan = false;
  L.run('zz-pushmode', null, cfg, { jobs: pushTable, routes, isolate: false,
    primaryCommand: () => { clientRan = true; return 'node -e ""'; }, kiloCommand: () => 'node -e ""' });
  const st = L.readJob('zz-pushmode');
  out.push([`the watchdog refuses the same job before any client runs (${st && st.reason})`,
    !clientRan && st && st.status === 'NEEDS_OWNER' && /publisher not implemented/.test(st.reason || '')]);
  const readTable = { 'zz-readonly': { kind: 'research', agent: 'zzfake', model: 'fake-model', level: 'high', position: 'max',
    primary: { client: 'vibe', id: null }, outputs: [path.join(base, 'zz-readonly', 'f1.md')], git: readOnly } };
  const startedRead = capture(() => L.startJobs(['zz-readonly'], cfg, readTable));
  out.push([`a READ_ONLY job passes the git gate (${startedRead.text.trim().split('\n')[0]})`, startedRead.code === 0 && /started/.test(startedRead.text)]);
  try { fs.rmSync(path.join(base, 'zz-readonly.lock'), { force: true }); } catch { /* none */ }
  try { fs.rmSync(path.join(ROOT, '.ai', 'runtime', 'improvement-research', 'jobs', 'zz-pushmode.json'), { force: true }); } catch { /* none */ }
  try { fs.rmSync(path.join(ROOT, '.ai', 'runtime', 'improvement-research', 'jobs', 'zz-readonly.json'), { force: true }); } catch { /* none */ }
  try { fs.rmSync(path.join(ROOT, '.ai', 'runtime', 'improvement-research', 'jobs', 'zz-readonly.lock'), { force: true }); } catch { /* none */ }
  try { fs.rmSync(base, { recursive: true, force: true, maxRetries: 3 }); } catch { /* scratch */ }
  return out;
}

cleanup();
const results = pureChecks().map(([n, ok]) => `${ok ? 'PASS' : 'FAIL'} pure: ${n}`)
  .concat(pushBlockChecks().map(([n, ok]) => `${ok ? 'PASS' : 'FAIL'} push-block: ${n}`))
  .concat(envChecks().map(([n, ok]) => `${ok ? 'PASS' : 'FAIL'} env: ${n}`))
  .concat(tableChecks().map(([n, ok]) => `${ok ? 'PASS' : 'FAIL'} table: ${n}`))
  .concat(gitModeChecks().map(([n, ok]) => `${ok ? 'PASS' : 'FAIL'} git-mode: ${n}`))
  .concat(hookChecks().map(([n, ok]) => `${ok ? 'PASS' : 'FAIL'} hook: ${n}`));
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
    let childEnv = process.env;
    if (SC[id].envCanary) { fs.writeFileSync(CANARY_HOST, '[credential]\n\thelper = canary-helper\n'); childEnv = { ...process.env, ...CANARY_ENV }; }
    let auditBare = null;
    if (SC[id].audit) {
      const base = fs.mkdtempSync(path.join(os.tmpdir(), 'zz-audit-'));
      auditBare = path.join(base, 'remote.git');
      const repo = path.join(base, 'repo');
      spawnSync('git', ['init', '-q', '--bare', auditBare], { encoding: 'utf8' });
      spawnSync('git', ['init', '-q', repo], { encoding: 'utf8' });
      spawnSync('git', ['-C', repo, '-c', 'user.email=t@t', '-c', 'user.name=t', 'commit', '-q', '--allow-empty', '-m', 'x'], { encoding: 'utf8' });
      spawnSync('git', ['-C', repo, 'remote', 'add', 'origin', auditBare], { encoding: 'utf8' });
      childEnv = { ...childEnv, ZZ_AUDIT_BARE: auditBare, ZZ_AUDIT_REPO: repo };
    }
    const child = spawn(process.execPath, [__filename, '--one', id], { stdio: 'ignore', env: childEnv });
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
        let gitLeak = '';
        if (SC[id].gitEscape) {
          const remote = spawnSync('git', ['-C', ROOT, 'config', '--get', 'remote.evil.url'], { encoding: 'utf8' }).status === 0;
          const ref = spawnSync('git', ['-C', ROOT, 'show-ref', '--verify', '--quiet', 'refs/heads/zz-probe']).status === 0;
          gitLeak = remote || ref ? `; GIT ESCAPE LEAKED into the checkout (remote ${remote}, ref ${ref})` : '; checkout config and refs untouched';
        }
        let canary = '';
        if (SC[id].envCanary) {
          const outDir = path.join(ROOT, REL, 'zz-out', id);
          const dump = fs.readFileSync(path.join(outDir, 'f1.md'), 'utf8');
          const cfg = fs.readFileSync(path.join(outDir, 'f2.md'), 'utf8');
          const envOk = !/canary-/.test(dump) && dump.includes('keep-openai-token');
          const cfgOk = !cfg.includes('canary-helper') && !cfg.includes(CANARY_HOST);
          canary = `; ${envOk && cfgOk ? '' : 'CANARY LEAKED '}job env clean: ${envOk}; job git config clean: ${cfgOk}`;
        }
        let audit = '';
        if (SC[id].audit) {
          const refs = (spawnSync('git', ['-C', auditBare, 'for-each-ref', '--format=%(refname)'], { encoding: 'utf8' }).stdout || '').trim();
          const ra = st && st.attempts[0] && st.attempts[0].remoteAudit;
          const inc = ra && ra.incident;
          const same = ra && JSON.stringify(ra.before) === JSON.stringify(ra.after);
          let okAudit = false;
          if (SC[id].audit === 'diff') okAudit = Boolean(inc && inc.length) && refs.includes('refs/heads/zz-bypass') && st.attempts[0].imported.length === 0;
          if (SC[id].audit === 'empty') okAudit = !inc && refs === '' && same;
          if (SC[id].audit === 'transient') okAudit = !inc && refs === '' && same;
          audit = `; ${okAudit ? '' : 'AUDIT MISMATCH '}remote refs [${refs}], incident ${inc ? inc.join('; ') : 'none'}, snapshots equal: ${same}`;
        }
        let indexLock = '';
        if (SC[id].indexLock) {
          const a0 = st.attempts[0];
          const wd = a0.workdir;
          const lock = fs.existsSync(path.join(wd, '.git', 'index.lock'));
          const kept = fs.existsSync(wd);
          const okLock = SC[id].indexLock === 'stale'
            ? lock && kept && /stale index.lock/.test(st.reason || '') && a0.imported.length === 0
            : !lock && a0.workdirRemoved === true;
          indexLock = `; ${okLock ? '' : 'LOCK MISMATCH '}lock ${lock ? 'present' : 'gone'}, copy kept: ${kept}, workdirRemoved: ${a0.workdirRemoved}`;
        }
        report(line(`; output copied back: ${back}${back === SC[id].imported ? '' : ' MISMATCH'}${leaked ? '; ESCAPE LEAKED into the checkout' : ''}${gitLeak}${canary}${audit}${indexLock}`));
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
