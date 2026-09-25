'use strict';

// Launcher for the improvement research (PROTO-DEC-0066, 0067). It implements P-L3-004
// (route failover, trial): the maker's CLI first, one automatic Kilo fallback on a hard
// failure before useful work, liveness signals instead of a fixed silence rule, never two
// executors on one task. A dispatch helper, not kernel code: it grants and certifies nothing.
//
//   node docs/research/2026-09-25-improvement-research/prompts/launch.cjs --dry [jobs]
//   node docs/research/2026-09-25-improvement-research/prompts/launch.cjs --check [jobs]   parse only, no model call
//   node docs/research/2026-09-25-improvement-research/prompts/launch.cjs --smoke [jobs]   one-word answer per route
//   node docs/research/2026-09-25-improvement-research/prompts/launch.cjs --start <jobs>
//   node docs/research/2026-09-25-improvement-research/prompts/launch.cjs --status
//   node docs/research/2026-09-25-improvement-research/prompts/launch.cjs --preflight      role lines of .ai/TASK.md, read-only
//   node docs/research/2026-09-25-improvement-research/prompts/launch.cjs --stop <job>
//   node docs/research/2026-09-25-improvement-research/prompts/launch.cjs --start <job> --route kilo:<n> [--takeover]
//
// <jobs>: comma list of job ids, or `researchers` (the six), `a`, `b`. Options:
// --soft-seconds N, --hard-seconds N, --cap-minutes N. State: .ai/runtime/improvement-research/.
// Exit codes: 0 done, 1 a refusal the owner can resolve, 2 unknown or malformed input.
//
// PROTO-DEC-0070: every attempt runs in a disposable private local clone of HEAD under the system temp
// directory. Only the job's outputs and its new journals are copied back into the checkout; any
// other change there, a moved HEAD or a new tag stops the job (SCOPE_STOP) and nothing is copied.

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawn, spawnSync, execFileSync, execSync } = require('node:child_process');

const ROOT = path.resolve(__dirname, '..', '..', '..', '..');
const REL = 'docs/research/2026-09-25-improvement-research';
const OUT = path.join(ROOT, '.ai', 'runtime', 'improvement-research');
const ROUTES = path.join(ROOT, 'docs', 'core-arch', 'stage-4', 'kilo-routes.json');
const TMP = os.tmpdir();

// soft and hard sit inside the owner's "2-3 min" and "7-10 min" (O-11); the tick, the caps and the
// smoke timeout are the implementer's proposal (P-L3-004 timer table, "Source" column).
const DEFAULTS = { tickSeconds: 15, softSeconds: 150, hardSeconds: 480, usefulBytes: 16384, cpuSeconds: 0.5,
  capMinutes: { research: 360, synthesis: 180 }, smokeSeconds: 180 };
// Hard-failure texts (P-L3-004). A bare number never matches: a status code counts only after an
// HTTP/status/error/code word or before its reason phrase, so "line 503" or "429 tokens" stay normal.
const CODES = '(?:401|403|429|500|502|503|504|529)';
const ERROR_TEXT = new RegExp([
  String.raw`\b(?:HTTP(?:\/\d(?:\.\d)?)?|status|error|code)\W{0,3}${CODES}\b`,
  String.raw`\b${CODES}\W{0,3}(?:Unauthori[sz]ed|Forbidden|Too Many Requests|Internal Server Error|Bad Gateway|Service Unavailable|Gateway Time-?out|Overloaded)\b`,
  String.raw`\bunauthori[sz]ed\b|not logged in|log ?in required|authenticat\w* (?:failed|error|required)|invalid[ _](?:api[ _-]?key|token|credentials)`,
  String.raw`rate[ _-]?limit(?:ed|[ _](?:error|exceeded|reached|hit))|too many requests|quota[ _](?:exceeded|exhausted|reached|error)|exceeded (?:your|the) (?:current )?quota|insufficient[ _](?:credit|balance|funds|quota)|credit balance is too low|usage limit (?:reached|exceeded)|limit (?:reached|exceeded)|hit your (?:usage )?limit|RESOURCE_EXHAUSTED`,
  String.raw`model\W.{0,60}(?:not found|not available|unavailable|does not exist|unsupported)|unknown model`,
  String.raw`ENOTFOUND|ECONNRESET|ECONNREFUSED|ETIMEDOUT|EAI_AGAIN|fetch failed|socket hang up|network error|provider error|service unavailable|overloaded_error|(?:server|model|api|service)(?: is)? overloaded`,
].join('|'), 'i');

const LEVELS = ['none', 'minimal', 'low', 'medium', 'high', 'xhigh', 'max'];
const POSITION = { min: 0, mid: 1, max: 2 };

const outputs = (study, model, parts) => parts.map(p => `${REL}/${study}/${model}-${p}.md`);
const JOBS = {
  'a-sol': { kind: 'research', agent: 'codex', model: 'gpt-5.6-sol', level: 'max', position: 'max',
    primary: { client: 'codex', id: 'gpt-5.6-sol' }, outputs: outputs('A', 'gpt-5.6-sol', ['registry', 'cards', 'measurements', 'report']) },
  'a-gemini': { kind: 'research', agent: 'gemini', model: 'gemini-3.1-pro', level: 'high', position: 'max',
    primary: { client: 'agy', id: 'gemini-3.1-pro-high' }, outputs: outputs('A', 'gemini-3.1-pro', ['registry', 'cards', 'measurements', 'report']) },
  'a-deepseek': { kind: 'research', agent: 'deepseek', model: 'deepseek-flash', level: null, position: 'max',
    primary: { client: 'kilo', id: 'openai-compatible/deepseek/deepseek-flash' }, outputs: outputs('A', 'deepseek-flash', ['registry', 'cards', 'measurements', 'report']) },
  'a-synth': { kind: 'synthesis', agent: 'copilot', model: 'kimi-k2.7-code', level: 'medium', position: 'mid',
    primary: { client: 'copilot', id: 'kimi-k2.7-code' }, needs: ['a-sol', 'a-gemini', 'a-deepseek'],
    outputs: [`${REL}/A/synthesis.md`, `${REL}/A/synthesis-registry.md`] },
  'b-grok': { kind: 'research', agent: 'grok', model: 'grok-4.5', level: 'high', position: 'max',
    primary: { client: 'copilot', id: 'grok-4.5' }, outputs: outputs('B', 'grok-4.5', ['taxonomy', 'policy']) },
  'b-kimi': { kind: 'research', agent: 'kimi', model: 'kimi-k2.7-code', level: 'high', position: 'max',
    primary: { client: 'copilot', id: 'kimi-k2.7-code' }, outputs: outputs('B', 'kimi-k2.7-code', ['taxonomy', 'policy']) },
  'b-mistral': { kind: 'research', agent: 'mistral', model: 'mistral-medium-3.5', level: 'max', position: 'max',
    primary: { client: 'vibe', id: null }, outputs: outputs('B', 'mistral-medium-3.5', ['taxonomy', 'policy']) },
  'b-synth': { kind: 'synthesis', agent: 'agy', model: 'gemini-3.1-pro', level: 'high', position: 'mid',
    primary: { client: 'agy', id: 'gemini-3.1-pro-high' }, needs: ['b-grok', 'b-kimi', 'b-mistral'],
    outputs: [`${REL}/B/synthesis.md`] },
};
const GROUPS = { researchers: ['a-sol', 'a-gemini', 'a-deepseek', 'b-grok', 'b-kimi', 'b-mistral'],
  a: ['a-sol', 'a-gemini', 'a-deepseek'], b: ['b-grok', 'b-kimi', 'b-mistral'] };

// ---------- pure decisions (P-L3-004), exported for the self-test ----------

function sortLevels(list) {
  return (list || []).filter(v => LEVELS.includes(v)).sort((x, y) => LEVELS.indexOf(x) - LEVELS.indexOf(y));
}

// Three levels nearest the centre; even lists shift up; short lists repeat (PROTO-DEC-0059 items 3-4).
function threeLevels(list) {
  const v = sortLevels(list);
  if (!v.length) return null;
  if (v.length === 1) return [v[0], v[0], v[0]];
  if (v.length === 2) return [v[0], v[1], v[1]];
  const mid = v.length % 2 ? (v.length - 1) / 2 : v.length / 2;
  return [v[mid - 1], v[mid], v[mid + 1]];
}

// R-L3-004.3: the level a route can give this job, or why it cannot.
function resolveEffort(route, job) {
  const v = sortLevels(route.variants);
  if (job.level === null) {
    if (!v.length) return { ok: true, variant: null, note: 'effort not settable; the primary cell is unknown too' };
    return { ok: true, variant: threeLevels(v)[POSITION[job.position]], note: `tier position ${job.position}` };
  }
  if (!v.length) return { ok: false, why: 'cannot set effort' };
  if (v.includes(job.level)) return { ok: true, variant: job.level, note: 'same level' };
  const higher = v.filter(x => LEVELS.indexOf(x) > LEVELS.indexOf(job.level));
  if (higher.length) return { ok: true, variant: higher[0], note: `stronger level (${job.level} not offered)` };
  return { ok: false, why: `highest level ${v[v.length - 1]} is below ${job.level}` };
}

// R-L3-004.2: Kilo candidates, cheapest suitable first.
function kiloCandidates(job, routes) {
  const list = (routes.models[job.model] || []).filter(r => !(job.primary.client === 'kilo' && r.route === job.primary.id));
  const rows = list.map(r => {
    if (!r.present) return { ...r, ok: false, why: 'absent from the Kilo catalog' };
    if (r.status !== 'active') return { ...r, ok: false, why: `status ${r.status}` };
    if (!r.toolcall) return { ...r, ok: false, why: 'no tool calls' };
    return { ...r, ...resolveEffort(r, job) };
  });
  const price = r => [Number(r.output) || 0, Number(r.input) || 0];
  const suitable = rows.filter(r => r.ok).sort((x, y) => {
    const [xo, xi] = price(x); const [yo, yi] = price(y);
    return xo - yo || xi - yi || (y.own === true) - (x.own === true) || x.provider.localeCompare(y.provider);
  });
  return { suitable, unsuitable: rows.filter(r => !r.ok) };
}

// R-L3-004.4-6, 8: what the watchdog does on this tick for a live process.
function decide(att, obs, cfg, now) {
  if (obs.progress) att.lastProgressAt = now;
  if (obs.useful) att.useful = true;
  const silent = (now - att.lastProgressAt) / 1000;
  if ((now - att.startedAt) / 60000 > att.capMinutes) return 'OVER_CAP';
  if (!att.useful && obs.errorText && silent >= cfg.softSeconds) return 'FAILED_EARLY';
  if (silent >= cfg.hardSeconds) return att.useful ? 'HUNG' : 'FAILED_EARLY';
  if (silent >= cfg.softSeconds) return 'SUSPECT';
  return att.useful ? 'WORKING' : 'STARTING';
}

// L2 progress (P-L3-004): new log bytes count only when at least one new line is neither an error
// text nor a retry notice. A client that prints the same failure in a loop makes no progress (CB-19).
const RETRY_TEXT = /\bretry(?:ing)?\b|\bretries\b|\bbacking off\b|\bwaiting \d+(?:\.\d+)? ?(?:ms|s|sec|seconds?)\b/i;
function chunkIsProgress(chunk) {
  return String(chunk).split(/\r?\n/).some(l => l.trim() && !ERROR_TEXT.test(l) && !RETRY_TEXT.test(l));
}

// What an exit means (state table of P-L3-004).
function classifyExit(att, code, outputsComplete) {
  if (!att.useful) return 'FAILED_EARLY';
  if (code === 0) return outputsComplete ? 'DONE' : 'INCOMPLETE';
  return 'CRASHED';
}

// ---------- commands ----------

const promptLine = job => `Read and follow the file ${REL}/prompts/run/${job}.md`;
const SAFE = /^[A-Za-z0-9 _.,:=/\\"()-]+$/;

// PROTO-DEC-0070 item 2: vibe gets the minimal tool set a study-B researcher needs (read, search,
// write its own files, a shell for the session script and read-only commands); --auto-approve covers
// only these. Names are vibe 2.25.5's tool classes; study B needs no web tool. `--trust` only skips
// the trust prompt for the disposable copy, as for the checkout it copies; it adds no tool.
const VIBE_TOOLS = ['read_file', 'grep', 'write_file', 'edit', 'powershell'];
// PROTO-DEC-0070 items 3-4: copilot runs in the job's copy (-C), with --no-ask-user (listed by
// copilot 1.0.88 --help) and with commit, push and tag denied as tools.
const COPILOT_DENY = ['git commit', 'git push', 'git tag'].map(c => `--deny-tool "shell(${c})"`).join(' ');

function primaryCommand(jobId, message, dir) {
  const j = JOBS[jobId];
  const m = `"${message}"`;
  switch (j.primary.client) {
    case 'codex': return `codex exec -m ${j.primary.id} -c model_reasoning_effort=${j.level} --approve-for-me --skip-git-repo-check -C "${dir}" --add-dir "${TMP}" --json ${m}`;
    case 'agy': return `agy -p ${m} --model ${j.primary.id} --dangerously-skip-permissions --add-dir "${dir}" --add-dir "${TMP}" --output-format stream-json`;
    case 'copilot': return `copilot -p ${m} --model ${j.primary.id} --reasoning-effort ${j.level} -C "${dir}" --allow-all-tools --no-ask-user ${COPILOT_DENY} --log-dir "${path.join(OUT, `${jobId}-copilot-log`)}"`;
    case 'vibe': return `vibe -p ${m} ${VIBE_TOOLS.map(t => `--enabled-tools ${t}`).join(' ')} --auto-approve --trust --max-turns 400 --output streaming --workdir "${dir}"`;
    case 'kilo': return kiloCommand(jobId, j.primary.id, null, message, dir);
    default: throw new Error(`unknown client ${j.primary.client}`);
  }
}

function kiloCommand(jobId, route, variant, message, dir) {
  return `kilo run -m ${route}${variant ? ` --variant ${variant}` : ''} --auto --dir "${dir}" --format json --title ${jobId} "${message}"`;
}

function checkCommand(cmd) {
  if (!SAFE.test(cmd)) throw new Error(`unsafe character in command: ${cmd}`);
  if ((cmd.match(/"/g) || []).length % 2) throw new Error(`unbalanced quotes in command: ${cmd}`);
  if (/\\"/.test(cmd)) throw new Error(`backslash before a quote in command: ${cmd}`);
  return cmd;
}

// ---------- state ----------

const jobFile = id => path.join(OUT, 'jobs', `${id}.json`);
function readJob(id) { try { return JSON.parse(fs.readFileSync(jobFile(id), 'utf8')); } catch { return null; } }
function writeJob(id, data) {
  fs.mkdirSync(path.dirname(jobFile(id)), { recursive: true });
  const tmp = `${jobFile(id)}.tmp`;
  fs.writeFileSync(tmp, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
  fs.renameSync(tmp, jobFile(id));
}

function alive(pid) {
  if (!pid) return false;
  try { return execFileSync('tasklist', ['/FI', `PID eq ${pid}`, '/NH'], { encoding: 'utf8' }).includes(String(pid)); }
  catch { return false; }
}

// Stops one process by PID. Callers pass only a PID whose identity (PID plus creation time) they
// have just confirmed in a process-table snapshot. No /T: taskkill /T selects children by parent
// linkage, which a reused PID makes unreliable (R-L3-004.7, CB-24).
function killExact(pid) {
  try { execFileSync('taskkill', ['/PID', String(pid), '/F'], { stdio: 'ignore' }); } catch { /* already gone */ }
}

// The live processes of a recorded tree, newest first, so leaves go before their parents. `known`
// maps pid to creation time; a process counts only while its PID and creation time both match.
// A live process whose parent is in the set, and which is no older than that parent, joins it, so
// children started after the last tick are found too. With `throughDead`, a child of a recorded
// process that has already exited also joins: that only widens a refusal to start, never a kill.
function aliveTree(rows, known, throughDead = false) {
  if (!rows) return null;
  const byPid = new Map(rows.map(r => [r.ProcessId, r]));
  const set = new Map();
  const recorded = new Map(Object.entries(known || {}).map(([pid, created]) => [Number(pid), Number(created)]));
  for (const [pid, created] of recorded) { const r = byPid.get(pid); if (r && Number(r.C) === created) set.set(pid, created); }
  for (let grew = true; grew;) {
    grew = false;
    for (const r of rows) {
      if (set.has(r.ProcessId)) continue;
      const parent = set.has(r.ParentProcessId) ? set.get(r.ParentProcessId) : (throughDead ? recorded.get(r.ParentProcessId) : undefined);
      if (parent !== undefined && Number(r.C) >= parent) { set.set(r.ProcessId, Number(r.C)); grew = true; }
    }
  }
  return [...set.entries()].sort((a, b) => b[1] - a[1] || b[0] - a[0]).map(([pid, created]) => ({ pid, created }));
}

// Everything a job's record says may still run: each attempt's root and recorded descendants.
// `unconfirmed` keeps only attempts whose tree the watchdog did not confirm gone.
function recordedTree(s, unconfirmed = false) {
  const known = {};
  for (const a of (s && s.attempts) || []) {
    if (unconfirmed && a.treeGone === true) continue;
    Object.assign(known, a.known || {});
    if (a.pid && a.rootCreated !== null && a.rootCreated !== undefined) known[a.pid] = a.rootCreated;
  }
  return known;
}

// R-L3-004.7 at start: why a new executor must not start yet, or null (CB-17). The previous
// watchdog must be gone, and so must every process the record names, whatever state it was left in.
function startBlockers(id, rows = procTable()) {
  const s = readJob(id);
  if (!s) return null;
  if (!rows) return 'the process table cannot be read, so the previous tree cannot be confirmed gone';
  if (s.watchdog && sameProcess(s.watchdog, s.watchdogCreated, rows)) return `its watchdog is still running (pid ${s.watchdog})`;
  const left = aliveTree(rows, recordedTree(s, true), true);
  if (left.length) return `a process of an earlier attempt is still alive (pid ${left.map(p => p.pid).join(', ')}); stop it with --stop ${id}`;
  if (s.pid && (s.rootCreated === null || s.rootCreated === undefined) && alive(s.pid)) return `pid ${s.pid} is alive and its identity is unknown`;
  // CB-17: a watchdog that died before its attempt settled may have missed processes it never saw,
  // and no process table can name them later. Only the owner's --stop settles such an attempt.
  const n = (s.attempts || []).length;
  const lastAtt = n ? s.attempts[n - 1] : null;
  if (lastAtt && !lastAtt.endedAt) return `its watchdog died before attempt ${n} settled${lastAtt.scanned ? '' : ', before it recorded any process tree'}; processes of that attempt may run unrecorded; check them, then run --stop ${id}`;
  return null;
}

// L6-L7: CPU seconds and child set of each running tree, one query per tick.
// One snapshot of all processes. `C` is the creation time (file time, UTC): a PID alone is not an
// identity on Windows, because PIDs are reused and ParentProcessId keeps pointing at dead parents.
function procTable() {
  try {
    const json = execFileSync('powershell', ['-NoProfile', '-NonInteractive', '-Command',
      "Get-CimInstance Win32_Process | Select-Object ProcessId,ParentProcessId,KernelModeTime,UserModeTime,@{n='C';e={$_.CreationDate.ToFileTimeUtc()}} | ConvertTo-Json -Compress"],
    { encoding: 'utf8', maxBuffer: 1 << 26, windowsHide: true });
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch { return null; }
}

// L6-L7 for a live root: CPU seconds and descendants. A descendant counts only if it was created
// no earlier than its parent, which excludes processes whose recorded parent is a dead namesake.
function tree(rootPid, rows) {
  if (!rows) return null;
  const root = rows.find(r => r.ProcessId === rootPid);
  if (!root) return null;
  const kids = new Map();
  for (const r of rows) { if (!kids.has(r.ParentProcessId)) kids.set(r.ParentProcessId, []); kids.get(r.ParentProcessId).push(r); }
  let cpu = (Number(root.KernelModeTime) + Number(root.UserModeTime)) / 1e7;
  const procs = [];
  const stack = [root]; const seen = new Set([rootPid]);
  while (stack.length) {
    const p = stack.pop();
    for (const c of kids.get(p.ProcessId) || []) {
      if (seen.has(c.ProcessId) || Number(c.C) < Number(p.C)) continue;
      seen.add(c.ProcessId); procs.push({ pid: c.ProcessId, created: Number(c.C) }); stack.push(c);
      cpu += (Number(c.KernelModeTime) + Number(c.UserModeTime)) / 1e7;
    }
  }
  return { cpu, procs, children: procs.map(x => x.pid).sort((a, b) => a - b).join(',') };
}

function fileSig(files) {
  let sig = 0;
  for (const f of files) { try { const s = fs.statSync(f); sig += s.size + s.mtimeMs; } catch { /* absent */ } }
  return sig;
}

function journalsOf(agent, root = ROOT) {
  const dir = path.join(root, '.ai', 'worklog');
  try { return fs.readdirSync(dir).filter(f => f.startsWith(`${agent}-`) && f.endsWith('.md')).map(f => path.join(dir, f)); }
  catch { return []; }
}

function dirFiles(dir) {
  try { return fs.readdirSync(dir).map(f => path.join(dir, f)); } catch { return []; }
}

// Bytes [from, to) of a file, at most the last `cap` of them.
function range(file, from, to, cap = 65536) {
  try {
    const start = Math.max(from, to - cap); const len = Math.max(0, to - start);
    const fd = fs.openSync(file, 'r'); const buf = Buffer.alloc(len);
    fs.readSync(fd, buf, 0, len, start); fs.closeSync(fd);
    return buf.toString('utf8');
  } catch { return ''; }
}

function tail(file, bytes) {
  try {
    const fd = fs.openSync(file, 'r'); const size = fs.fstatSync(fd).size;
    const len = Math.min(size, bytes); const buf = Buffer.alloc(len);
    fs.readSync(fd, buf, 0, len, size - len); fs.closeSync(fd);
    return buf.toString('utf8');
  } catch { return ''; }
}

// ---------- the disposable working copy (PROTO-DEC-0070) ----------

// A journal a session creates: `.ai/worklog/<agent>-<16 hex>.md`, new (untracked) in the copy.
const JOURNAL_RE = /^\.ai\/worklog\/[a-z][a-z0-9]*-[0-9a-f]{16}\.md$/;
const sleepSync = ms => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
const sha = data => require('node:crypto').createHash('sha256').update(data).digest('hex');
const git = (args, cwd = ROOT) => spawnSync('git', args, { cwd, encoding: 'utf8', windowsHide: true, maxBuffer: 1 << 26 });
// The launcher's own git calls inside a job's copy run no hook and no fsmonitor, whatever the job
// wrote into the copy's config or hooks directory (F-L2).
const EMPTY_HOOKS = path.join(TMP, 'colabs-research', '.no-hooks');
const gitIn = (dir, args) => git(['-c', 'core.fsmonitor=false', '-c', `core.hooksPath=${EMPTY_HOOKS}`, ...args], dir);

// No push (PROTO-DEC-0070 item 4; F-L1). Every URL git resolves is rewritten to an unusable scheme:
// existing remotes, remotes a job adds, explicit push URLs and URLs typed on the command line alike
// (`pushInsteadOf` would miss an explicit push URL). A network fetch fails too; the jobs need none.
// The rule is in the executor's environment and in each copy's own config; removing it from the
// config changes the config, which is a scope stop.
const NO_PUSH = { key: 'url.no-push://blocked.insteadOf', value: '' };
const NO_PUSH_ENV = { GIT_CONFIG_COUNT: '1', GIT_CONFIG_KEY_0: NO_PUSH.key, GIT_CONFIG_VALUE_0: NO_PUSH.value };

// `git status --porcelain=v1 -z` entries: {code, path}; a rename or copy also yields its source.
function parsePorcelainZ(text) {
  const parts = String(text).split('\0').filter(Boolean);
  const out = [];
  for (let i = 0; i < parts.length; i += 1) {
    const code = parts[i].slice(0, 2); const p = parts[i].slice(3);
    out.push({ code, path: p });
    if (/[RC]/.test(code) && parts[i + 1] !== undefined) { out.push({ code, path: parts[i + 1] }); i += 1; }
  }
  return out;
}

function fileHash(file) {
  try { return sha(fs.readFileSync(file)); } catch { return 'absent'; }
}

// What the scope check compares: the working files, HEAD, every ref, the copy's own config and its
// hooks. Ignored paths (`.gitignore`: `.ai/runtime/` and scratch) are not read; they are never
// copied back and are deleted with the copy (F-L4).
function workdirState(dir) {
  const st = gitIn(dir, ['status', '--porcelain=v1', '-z', '--untracked-files=all']);
  const head = gitIn(dir, ['rev-parse', 'HEAD']);
  const refs = gitIn(dir, ['for-each-ref', '--format=%(refname) %(objectname)']);
  if (st.status !== 0 || head.status !== 0 || refs.status !== 0) return null;
  const gitDir = path.join(dir, '.git');
  let hooks = '';
  try { hooks = fs.readdirSync(path.join(gitDir, 'hooks')).sort().map(f => `${f} ${fileHash(path.join(gitDir, 'hooks', f))}`).join('\n'); } catch { /* none */ }
  return { entries: parsePorcelainZ(st.stdout), head: head.stdout.trim(), refs: sha(refs.stdout),
    config: fileHash(path.join(gitDir, 'config')), hooks: sha(hooks) };
}

// Paths changed outside the job's scope. Allowed: the job's outputs, and new journals. A path that
// was already different at preparation (the copied research package) counts only if it changed.
function scopeViolations(entries, outputs, baseFiles, hashOf) {
  const base = new Map(baseFiles);
  return entries.filter(e => !outputs.includes(e.path) && !(e.code === '??' && JOURNAL_RE.test(e.path))
    && !(base.has(e.path) && base.get(e.path) === hashOf(e.path))).map(e => e.path);
}

// A private local clone of HEAD, with no remote and the no-push rule in its own config, and the
// research package copied in (earlier outputs, prompt stubs). Unlike a linked worktree, a clone
// shares no config, refs or hooks with the checkout (F-L2): what a job does to its repository stays
// in the copy. `--shared` borrows the checkout's objects instead of copying them. Six watchdogs may
// start at once, so it retries under a fresh name.
function prepareWorkdir(jobId, n) {
  fs.mkdirSync(EMPTY_HOOKS, { recursive: true });
  const head = git(['rev-parse', 'HEAD']);
  if (head.status !== 0) throw new Error('the checkout HEAD cannot be read');
  let r = null; let dir = null;
  for (let i = 0; i < 3; i += 1) {
    dir = path.join(TMP, 'colabs-research', `${jobId}-${n}-${Date.now().toString(36)}-${i}`);
    r = git(['clone', '--shared', '--no-checkout', '--quiet', ROOT, dir], TMP);
    if (r.status === 0) break;
    try { fs.rmSync(dir, { recursive: true, force: true, maxRetries: 3 }); } catch { /* nothing made */ }
    sleepSync(700);
  }
  if (r.status !== 0) throw new Error(`git clone failed: ${(r.stderr || '').trim().split('\n')[0]}`);
  const steps = [['checkout', '--quiet', '--detach', head.stdout.trim()]];
  for (const remote of (gitIn(dir, ['remote']).stdout || '').split(/\r?\n/).filter(Boolean)) steps.push(['remote', 'remove', remote]);
  steps.push(['config', NO_PUSH.key, NO_PUSH.value]);
  for (const s of steps) {
    const x = gitIn(dir, s);
    if (x.status !== 0) throw new Error(`git ${s[0]} failed in the new copy: ${(x.stderr || '').trim().split('\n')[0]}`);
  }
  fs.cpSync(path.join(ROOT, REL), path.join(dir, REL), { recursive: true, force: true });
  const st = workdirState(dir);
  if (!st) throw new Error('git state of the new copy cannot be read');
  return { dir, base: { head: st.head, refs: st.refs, config: st.config, hooks: st.hooks,
    files: st.entries.map(e => [e.path, fileHash(path.join(dir, e.path))]) } };
}

// Why the copy is out of scope now, or null. Unreadable state is a violation, never a pass.
function scopeCheck(dir, base, outputs) {
  const st = workdirState(dir);
  if (!st) return ['git state of the copy cannot be read'];
  const bad = scopeViolations(st.entries, outputs, base.files, p => fileHash(path.join(dir, p)));
  if (st.head !== base.head) bad.push(`HEAD moved to ${st.head.slice(0, 12)} (a commit or checkout)`);
  if (st.refs !== base.refs) bad.push('refs changed (a branch, tag or ref was created, moved or deleted)');
  if (st.config !== base.config) bad.push('repository config changed (a remote added, or the no-push rule removed)');
  if (st.hooks !== base.hooks) bad.push('git hooks changed');
  return bad.length ? bad : null;
}

// Copies the job's outputs and its new journals into the checkout; returns what was copied.
function importResults(dir, outputs) {
  const st = workdirState(dir);
  const journals = st ? st.entries.filter(e => e.code === '??' && JOURNAL_RE.test(e.path)).map(e => e.path) : [];
  const copied = [];
  for (const f of [...outputs, ...journals]) {
    const src = path.join(dir, f);
    if (!fs.existsSync(src)) continue;
    fs.mkdirSync(path.dirname(path.join(ROOT, f)), { recursive: true });
    fs.copyFileSync(src, path.join(ROOT, f));
    copied.push(f);
  }
  return copied;
}

// Deletes a settled copy. A copy kept by a scope stop, or left by a watchdog that died, stays under
// `<system temp>/colabs-research/` until the owner removes it (F-L5).
function dropWorkdir(dir) {
  for (let i = 0; i < 3; i += 1) {
    try { fs.rmSync(dir, { recursive: true, force: true, maxRetries: 3 }); } catch { /* a file still open */ }
    if (!fs.existsSync(dir)) return true;
    sleepSync(1000);
  }
  return false;
}

// ---------- the watchdog (runs detached) ----------

function sameProcess(pid, created, rows = procTable()) {
  if (!pid || created === null || created === undefined) return null; // identity unknown
  return Boolean(rows && rows.some(r => r.ProcessId === pid && Number(r.C) === created));
}

const stopFile = id => path.join(OUT, 'jobs', `${id}.stop`);
const lockFile = id => path.join(OUT, 'jobs', `${id}.lock`);

// R-L3-004.7: two starts of one job at the same moment must not both pass the state check. The
// start lock is created atomically ('wx'); the watchdog takes it over and removes it when the job
// settles. A lock with no live watchdog and older than a minute is stale and is replaced.
function takeStartLock(id) {
  fs.mkdirSync(path.join(OUT, 'jobs'), { recursive: true });
  for (let i = 0; i < 2; i += 1) {
    try {
      const fd = fs.openSync(lockFile(id), 'wx');
      fs.writeSync(fd, JSON.stringify({ starter: process.pid, at: Date.now() }));
      fs.closeSync(fd);
      return true;
    } catch (e) {
      if (e.code !== 'EEXIST') throw e;
      let lock = {};
      try { lock = JSON.parse(fs.readFileSync(lockFile(id), 'utf8')); } catch { /* unreadable: judge by age only */ }
      const watchdogLive = lock.watchdog ? sameProcess(lock.watchdog, lock.watchdogCreated) === true : false;
      const fresh = lock.at && Date.now() - lock.at < 60000;
      if (watchdogLive || fresh) return false;
      try { fs.unlinkSync(lockFile(id)); } catch { /* another starter removed it */ }
    }
  }
  return false;
}

function run(jobId, routeArg, cfg, ov = {}) {
  const j = (ov.jobs || JOBS)[jobId];
  const routes = ov.routes || JSON.parse(fs.readFileSync(ROUTES, 'utf8'));
  const buildPrimary = ov.primaryCommand || primaryCommand;
  const buildKilo = ov.kiloCommand || kiloCommand;
  const { suitable } = kiloCandidates(j, routes);
  // The self-test runs its fake jobs in place (outputs in scratch directories); real jobs are isolated.
  const isolate = ov.isolate !== false;
  const env = { ...process.env, PYTHONUTF8: '1', PYTHONIOENCODING: 'utf-8', ...(isolate ? NO_PUSH_ENV : {}) };
  fs.mkdirSync(path.join(OUT, 'jobs'), { recursive: true });
  // The stop marker is never removed here: `--start` clears an old one before it spawns this
  // watchdog, so a marker seen now is an owner stop issued after that start (CB-18).
  const state = readJob(jobId) || { job: jobId, attempts: [] };
  state.autoFallbackUsed = false; // a new dispatch by the owner; history stays in attempts
  const stopRequested = () => fs.existsSync(stopFile(jobId));

  // R-L3-004.7: the previous tree must be gone before anything else starts. Only processes seen as
  // descendants while the root was alive, and still carrying the same creation time, are stopped;
  // nothing is ever stopped by a PID alone.
  // Descendants go first, newest first, each by PID only right after its identity was confirmed;
  // the root is stopped through Node's own child handle, never by its PID (CB-24).
  const ensureGone = (att, child, isExited, done) => {
    let rounds = 0;
    const check = setInterval(() => {
      rounds += 1;
      const rows = procTable();
      const known = { ...att.known };
      if (!isExited() && att.rootCreated !== null) known[child.pid] = att.rootCreated;
      const left = aliveTree(rows, known);
      const descendants = left ? left.filter(p => p.pid !== child.pid || isExited()) : null;
      for (const p of descendants || []) { att.known[p.pid] = p.created; killExact(p.pid); }
      if (!isExited() && (!descendants || !descendants.length || rounds > 5)) { try { child.kill(); } catch { /* exited */ } }
      if (isExited() && descendants && !descendants.length) { clearInterval(check); done(true); return; }
      if (rounds > 30) { clearInterval(check); done(false); }
    }, 1000);
  };

  const start = route => {
    const message = promptLine(jobId);
    const primary = route.kind === 'primary';
    let dir = ROOT; let base = null;
    if (isolate) {
      try { ({ dir, base } = prepareWorkdir(jobId, state.attempts.length + 1)); } catch (e) {
        state.status = 'NEEDS_OWNER'; state.reason = `no disposable copy, nothing launched: ${e.message}`; writeJob(jobId, state);
        try { fs.unlinkSync(lockFile(jobId)); } catch { /* no lock */ }
        return undefined;
      }
    }
    const outFiles = j.outputs.map(f => path.resolve(dir, f));
    const cmd = checkCommand(primary ? buildPrimary(jobId, message, dir) : buildKilo(jobId, route.route, route.variant, message, dir));
    const logPath = path.join(OUT, `${jobId}-${state.attempts.length + 1}.log`);
    const log = fs.openSync(logPath, 'a');
    // Baselines are taken before the spawn, so nothing the executor writes can slip into them.
    const baseline = { outputs: fileSig(outFiles), journals: journalsOf(j.agent, dir) };
    const child = spawn(cmd, { cwd: dir, env, shell: true, stdio: ['ignore', log, log], windowsHide: true });
    const now = Date.now();
    const rows0 = procTable();
    const r0 = rows0 && rows0.find(r => r.ProcessId === child.pid);
    const att = { primary, route: primary ? `${j.primary.client}:${j.primary.id || 'config'}` : route.route,
      variant: primary ? j.level : route.variant, command: cmd, pid: child.pid, rootCreated: r0 ? Number(r0.C) : null,
      log: logPath, workdir: isolate ? dir : null, base, startedAt: now, lastProgressAt: now, useful: false, known: {},
      capMinutes: cfg.capMinutes || DEFAULTS.capMinutes[j.kind], baseline, status: 'STARTING' };
    state.attempts.push(att); state.status = 'STARTING'; state.pid = child.pid; state.rootCreated = att.rootCreated;
    const me = rows0 && rows0.find(r => r.ProcessId === process.pid);
    state.watchdog = process.pid; state.watchdogCreated = me ? Number(me.C) : null; writeJob(jobId, state);
    fs.writeFileSync(lockFile(jobId), JSON.stringify({ watchdog: process.pid, watchdogCreated: state.watchdogCreated, at: Date.now() }));
    const logSize = () => { try { return fs.statSync(logPath).size; } catch { return 0; } };
    const newJournals = () => journalsOf(j.agent, dir).filter(f => !att.baseline.journals.includes(f));
    const errorIn = () => (tail(logPath, 65536).match(ERROR_TEXT) || [null])[0];
    // Log volume counts as useful work only while the log carries no error text (a retry loop is not work).
    const usefulNow = () => fileSig(outFiles) !== att.baseline.outputs || newJournals().length > 0 || (logSize() >= cfg.usefulBytes && !errorIn());
    let last = { logBytes: 0, outputs: att.baseline.outputs, journals: 0, clientLog: 0, cpu: null, children: '' };
    let exited = null;
    child.on('exit', code => { exited = code === null ? -1 : code; });
    // CB-17: the tree is first recorded one and three seconds after the spawn, not one tick later, so
    // a watchdog that dies early leaves on record the processes it could see.
    const scan = () => {
      if (exited !== null || att.endedAt) return;
      const tr = tree(child.pid, procTable());
      if (!tr) return;
      for (const p of tr.procs) att.known[p.pid] = p.created;
      att.scanned = true; writeJob(jobId, state);
    };
    setTimeout(scan, 1000); setTimeout(scan, 3000);
    const finish = status => {
      att.status = status; att.endedAt = new Date().toISOString();
      ensureGone(att, child, () => exited !== null, gone => { att.treeGone = gone; settle(att); });
    };
    const outOfScope = () => {
      if (!isolate) return false;
      const bad = scopeCheck(dir, base, j.outputs);
      if (bad) att.scope = bad;
      return Boolean(bad);
    };
    const timer = setInterval(() => {
      const t = Date.now();
      if (stopRequested()) { clearInterval(timer); finish('STOPPED'); return; }
      if (outOfScope()) { clearInterval(timer); finish('SCOPE_STOP'); return; }
      if (exited !== null) {
        clearInterval(timer);
        if (usefulNow()) att.useful = true;
        att.exitCode = exited;
        finish(classifyExit(att, exited, outFiles.every(f => fs.existsSync(f))));
        return;
      }
      const logBytes = logSize();
      const outputsNow = fileSig(outFiles);
      const fresh = newJournals();
      const journalsNow = fileSig(fresh);
      const clientLog = fileSig(dirFiles(path.join(OUT, `${jobId}-copilot-log`)));
      const seen = tree(child.pid, procTable());
      const tr = seen || { cpu: last.cpu || 0, children: last.children, procs: [] };
      for (const p of tr.procs) att.known[p.pid] = p.created;
      if (seen) att.scanned = true;
      // A tick whose new log lines are all error or retry lines is no progress, and the client's own
      // log, which records the same retries, does not count in that tick either (CB-19).
      const grew = logBytes > last.logBytes;
      const logMoved = logBytes < last.logBytes || (grew && chunkIsProgress(range(logPath, last.logBytes, logBytes)));
      const errorOnly = grew && !logMoved;
      const progress = logMoved || outputsNow !== last.outputs || journalsNow !== last.journals
        || (clientLog !== last.clientLog && !errorOnly) || (last.cpu !== null && tr.cpu - last.cpu >= cfg.cpuSeconds) || tr.children !== last.children;
      const errNow = att.useful ? null : errorIn();
      const useful = outputsNow !== att.baseline.outputs || fresh.length > 0 || (logBytes >= cfg.usefulBytes && !errNow);
      const text = att.useful || useful ? null : errNow;
      last = { logBytes, outputs: outputsNow, journals: journalsNow, clientLog, cpu: tr.cpu, children: tr.children };
      const verdict = decide(att, { progress, useful, errorText: text }, cfg, t);
      att.silentSeconds = Math.round((t - att.lastProgressAt) / 1000);
      if (text) att.errorText = text;
      if (verdict === 'SUSPECT' && att.status !== 'SUSPECT') {
        att.inspections = (att.inspections || []).concat({ at: new Date(t).toISOString(), alive: exited === null, cpu: tr.cpu, children: tr.children, logTail: tail(logPath, 800) });
      }
      if (['FAILED_EARLY', 'HUNG', 'OVER_CAP'].includes(verdict)) { clearInterval(timer); finish(verdict); return; }
      att.status = verdict; state.status = verdict; writeJob(jobId, state);
    }, cfg.tickSeconds * 1000);
  };

  const settle = att => {
    if (att.workdir) {
      // The tree is gone, so the copy no longer changes: one last scope check, then the copy back.
      // A scope stop copies nothing and keeps the copy for the owner to inspect.
      if (att.status !== 'SCOPE_STOP') {
        const bad = scopeCheck(att.workdir, att.base, j.outputs);
        if (bad) { att.scope = bad; att.status = 'SCOPE_STOP'; }
      }
      att.imported = att.status === 'SCOPE_STOP' ? [] : importResults(att.workdir, j.outputs);
      if (att.status !== 'SCOPE_STOP' && att.treeGone) att.workdirRemoved = dropWorkdir(att.workdir);
    }
    att.changed = j.outputs.filter(f => fs.existsSync(path.resolve(ROOT, f)));
    att.journals = att.workdir ? att.imported.filter(f => JOURNAL_RE.test(f))
      : journalsOf(j.agent).filter(f => !att.baseline.journals.includes(f)).map(f => path.relative(ROOT, f));
    const autoAllowed = !routeArg || routeArg === 'primary';
    if (att.status === 'FAILED_EARLY' && att.primary && att.treeGone && !state.autoFallbackUsed && autoAllowed
      && suitable.length && !stopRequested()) {
      state.autoFallbackUsed = true; writeJob(jobId, state);
      return start({ kind: 'kilo', route: suitable[0].route, variant: suitable[0].variant });
    }
    state.status = att.status === 'DONE' ? 'DONE' : 'NEEDS_OWNER';
    const why = att.status === 'STOPPED' ? 'stopped by the owner'
      : att.status === 'HUNG' ? `HUNG on ${att.route}; FALLEN without wakes, the launcher resumes no session (PROTO-DEC-0051 item 4, P-L3-004)`
        : att.status === 'SCOPE_STOP' ? `SCOPE_STOP on ${att.route}: ${att.scope.slice(0, 5).join('; ')}${att.scope.length > 5 ? ` (+${att.scope.length - 5} more)` : ''}; nothing copied back, copy kept at ${att.workdir} (PROTO-DEC-0070 item 4)`
          : `${att.status} on ${att.route}`;
    state.reason = att.status === 'DONE' ? null
      : `${why}${att.errorText ? ` (${att.errorText})` : ''}${att.treeGone === false ? '; process tree NOT confirmed gone' : ''}`;
    state.pid = null; state.rootCreated = null; state.watchdog = null; state.watchdogCreated = null; writeJob(jobId, state);
    try { fs.unlinkSync(lockFile(jobId)); } catch { /* no lock: started directly, as in the self-test */ }
    return undefined;
  };

  if (stopRequested()) {
    state.status = 'NEEDS_OWNER'; state.reason = 'stopped by the owner before launch'; writeJob(jobId, state);
    try { fs.unlinkSync(lockFile(jobId)); } catch { /* no lock: started directly, as in the self-test */ }
    return undefined;
  }
  if (routeArg && routeArg !== 'primary') {
    const n = Number(routeArg.split(':')[1]);
    const r = suitable[n - 1];
    return start({ kind: 'kilo', route: r.route, variant: r.variant });
  }
  return start({ kind: 'primary' });
}

// ---------- commands of the CLI ----------

function expand(list) {
  const ids = [];
  for (const x of String(list || '').split(',').filter(Boolean)) ids.push(...(GROUPS[x] || [x]));
  return [...new Set(ids)];
}

// PROTO-DEC-0047 item 8: unknown or malformed input exits 2, never a silent default. Every
// argument is a known flag or the value of the flag before it; numbers are positive whole numbers.
class UsageError extends Error {}
const COMMANDS = ['--dry', '--check', '--smoke', '--start', '--stop', '--status', '--preflight', '--run'];
const JOB_LISTS = ['--dry', '--check', '--smoke', '--start', '--stop'];
const NUMBERS = { '--soft-seconds': 'softSeconds', '--hard-seconds': 'hardSeconds', '--cap-minutes': 'capMinutes' };

function options(argv) {
  const cfg = { ...DEFAULTS, capMinutes: null, route: null, takeover: false };
  const seen = new Set();
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    const next = argv[i + 1];
    if (seen.has(a)) throw new UsageError(`${a} is given twice`);
    seen.add(a);
    if (NUMBERS[a]) {
      if (next === undefined || !/^[1-9]\d{0,6}$/.test(next)) throw new UsageError(`${a} needs a positive whole number, got ${next === undefined ? 'nothing' : `"${next}"`}`);
      cfg[NUMBERS[a]] = Number(next); i += 1;
    } else if (a === '--route') {
      if (next === undefined || !/^(primary|kilo:[1-9]\d*)$/.test(next)) throw new UsageError(`--route needs primary or kilo:<n>, got ${next === undefined ? 'nothing' : `"${next}"`}`);
      cfg.route = next; i += 1;
    } else if (a === '--run') {
      if (next === undefined || next.startsWith('--')) throw new UsageError('--run needs a job id');
      i += 1;
    } else if (JOB_LISTS.includes(a)) {
      if (next !== undefined && !next.startsWith('--')) i += 1;
    } else if (a !== '--takeover' && a !== '--status' && a !== '--preflight') {
      throw new UsageError(`unknown argument "${a}"`);
    }
    if (a === '--takeover') cfg.takeover = true;
  }
  const commands = COMMANDS.filter(c => seen.has(c));
  if (commands.length !== 1) throw new UsageError(commands.length ? `one command at a time, got ${commands.join(' ')}` : 'no command given');
  if (cfg.softSeconds >= cfg.hardSeconds) throw new UsageError(`--soft-seconds (${cfg.softSeconds}) must be below --hard-seconds (${cfg.hardSeconds})`);
  return cfg;
}

function dry(ids) {
  const routes = JSON.parse(fs.readFileSync(ROUTES, 'utf8'));
  for (const id of ids) {
    const j = JOBS[id];
    process.stdout.write(`\n${id} (${j.kind}, ${j.model}, level ${j.level || `unknown, position ${j.position}`}, agent ${j.agent})\n`);
    process.stdout.write(`  primary: ${checkCommand(primaryCommand(id, promptLine(id), ROOT))}\n`);
    const { suitable, unsuitable } = kiloCandidates(j, routes);
    suitable.forEach((r, i) => process.stdout.write(`  kilo:${i + 1}${i === 0 ? ' (automatic fallback)' : ''}: ${checkCommand(kiloCommand(id, r.route, r.variant, promptLine(id), ROOT))}   [$${r.input}/$${r.output} per 1M in/out, ${r.note}]\n`));
    for (const r of unsuitable) process.stdout.write(`  not suitable: ${r.route} (${r.why})\n`);
    if (!suitable.length) process.stdout.write('  no automatic fallback: a primary failure goes to the owner\n');
    const stub = path.join(ROOT, REL, 'prompts', 'run', `${id}.md`);
    if (!fs.existsSync(stub)) process.stdout.write(`  MISSING prompt stub ${path.relative(ROOT, stub)}\n`);
  }
  process.stdout.write(`\nroutes: ${path.relative(ROOT, ROUTES)} (kilo ${routes.kilo}, ${routes.generated})\n`);
  return 0;
}

function smoke(ids, cfg) {
  // Availability and syntax probe: each route answers one word from a scratch directory outside
  // the repository, so no hook, journal or file of the project is touched.
  const dir = fs.mkdtempSync(path.join(TMP, 'colabs-smoke-'));
  const routes = JSON.parse(fs.readFileSync(ROUTES, 'utf8'));
  const message = 'Reply with exactly the word OK and do nothing else';
  const results = [];
  const seen = new Set();
  for (const id of ids) {
    const j = JOBS[id];
    const first = kiloCandidates(j, routes).suitable[0];
    const probes = [[`primary ${j.primary.client}:${j.primary.id || 'config'} ${j.level || ''}`.trim(), primaryCommand(id, message, dir)]];
    if (first) probes.push([`kilo:1 ${first.route} ${first.variant || ''}`.trim(), kiloCommand(id, first.route, first.variant, message, dir)]);
    let primaryOk = false;
    for (const [route, cmd] of probes) {
      if (route.startsWith('kilo:') && primaryOk) continue;
      if (seen.has(route)) { if (!route.startsWith('kilo:')) primaryOk = results.some(r => r.route === route && r.ok); continue; }
      seen.add(route);
      checkCommand(cmd);
      const began = Date.now();
      let out = ''; let code = 0;
      try { out = execSync(cmd, { cwd: dir, encoding: 'utf8', timeout: DEFAULTS.smokeSeconds * 1000, env: { ...process.env, PYTHONUTF8: '1', PYTHONIOENCODING: 'utf-8' }, stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 1 << 26, windowsHide: true }); }
      catch (e) { code = e.status === null || e.status === undefined ? -1 : e.status; out = `${e.stdout || ''}${e.stderr || ''}`; }
      const ok = code === 0 && /\bOK\b/.test(out);
      const err = (out.match(ERROR_TEXT) || [null])[0];
      results.push({ job: id, route, ok, exit: code, seconds: Math.round((Date.now() - began) / 1000), error: err });
      if (!route.startsWith('kilo:')) primaryOk = ok;
      process.stdout.write(`${id} ${route}: ${ok ? 'OK' : `FAIL exit ${code}${err ? ` (${err})` : ''}`}\n`);
    }
  }
  fs.mkdirSync(OUT, { recursive: true });
  fs.writeFileSync(path.join(OUT, 'smoke.json'), `${JSON.stringify({ at: new Date().toISOString(), results }, null, 2)}\n`);
  try { fs.rmSync(dir, { recursive: true, force: true }); } catch { /* scratch */ }
  return results.every(r => r.ok) ? 0 : 1;
}

// Zero-cost syntax check: every flag must appear in the client's own help, and each client must
// parse the exact command without starting a model (codex and kilo stop at --help; agy, copilot
// and vibe reject a sentinel flag and name only that sentinel as unknown).
const HELP = { codex: 'codex exec --help', agy: 'agy --help', copilot: 'copilot --help', vibe: 'vibe --help', kilo: 'kilo run --help' };
const SENTINEL = '--zz-parse-check';
const PROBE = {
  codex: { suffix: ' --help', ok: code => code === 0 },
  kilo: { suffix: ' --help', ok: code => code === 0 },
  agy: { suffix: ` ${SENTINEL}`, ok: (code, out) => code !== 0 && /not defined: -zz-parse-check\s*$/m.test(out) },
  // copilot rejects broken quoting and invalid values even with --help (measured 2026-09-25).
  copilot: { suffix: ' --help', ok: code => code === 0 },
  vibe: { suffix: ` ${SENTINEL}`, ok: (code, out) => code !== 0 && new RegExp(`unrecognized arguments: ${SENTINEL}\\s*$`, 'm').test(out) },
};

function shell(cmd, seconds) {
  // stdout and stderr together: agy and kilo print their help on stderr.
  const r = spawnSync(cmd, { cwd: ROOT, shell: true, encoding: 'utf8', timeout: seconds * 1000, maxBuffer: 1 << 26, windowsHide: true, env: { ...process.env, PYTHONUTF8: '1', PYTHONIOENCODING: 'utf-8' } });
  return { code: r.status === null ? -1 : r.status, out: `${r.stdout || ''}${r.stderr || ''}` };
}

function check(ids) {
  const routes = JSON.parse(fs.readFileSync(ROUTES, 'utf8'));
  const list = [];
  for (const id of ids) {
    list.push([id, 'primary', JOBS[id].primary.client, primaryCommand(id, promptLine(id), ROOT)]);
    kiloCandidates(JOBS[id], routes).suitable.forEach((r, i) => list.push([id, `kilo:${i + 1}`, 'kilo', kiloCommand(id, r.route, r.variant, promptLine(id), ROOT)]));
  }
  const help = {};
  let failed = 0;
  for (const [id, route, client, cmd] of list) {
    const problems = [];
    try { checkCommand(cmd); } catch (e) { problems.push(e.message); }
    if (!help[client]) help[client] = shell(HELP[client], 60).out;
    for (const m of cmd.matchAll(/(?:^|\s)(--?[A-Za-z][\w-]*)/g)) if (!help[client].includes(m[1])) problems.push(`flag ${m[1]} not in \`${HELP[client]}\``);
    const probe = shell(cmd + PROBE[client].suffix, 90);
    if (!PROBE[client].ok(probe.code, probe.out)) problems.push(`parse probe failed (exit ${probe.code}): ${probe.out.split('\n').filter(Boolean).slice(0, 2).join(' | ')}`);
    failed += problems.length ? 1 : 0;
    process.stdout.write(`${problems.length ? 'FAIL' : 'ok  '} ${id} ${route} (${client})${problems.length ? `\n     ${problems.join('\n     ')}` : ''}\n`);
  }
  process.stdout.write(`${list.length - failed}/${list.length} commands parse; no model was called\n`);
  return failed ? 1 : 0;
}

// Pre-launch role check (the owner's gate, 2026-09-25). `protocol-session start` injects each
// agent's `## Roles` line from `.ai/TASK.md`; a name without a line is told to ask the owner before
// starting work. Every job's agent must have a line that points to that job; the K-launch operator
// must have its operator line. Read-only: the session hook's own parser is used and nothing is
// written.
function rolePreflight(entries, jobs = JOBS) {
  const text = agent => entries.filter(e => e.agent === agent).map(e => e.role).join('; ');
  const rows = [];
  for (const agent of [...new Set(Object.values(jobs).map(j => j.agent))]) {
    const ids = Object.keys(jobs).filter(id => jobs[id].agent === agent);
    const line = text(agent);
    const missing = ids.filter(id => !line.includes(`job ${id}`));
    let why = `points to ${ids.map(id => `job ${id}`).join(', ')}`;
    if (!line) why = 'no ## Roles line: the session start would say "Ask the owner before starting work"';
    else if (missing.length) why = `the role line names no ${missing.map(id => `job ${id}`).join(', ')}`;
    rows.push({ agent, ok: Boolean(line) && !missing.length, why });
  }
  const operator = text('kilo');
  rows.push({ agent: 'kilo', ok: /operator of K-launch/.test(operator), why: operator ? 'operator of K-launch' : 'no ## Roles line' });
  return rows;
}

function preflight() {
  const hooks = require(path.join(ROOT, '.ai', 'bin', 'protocol-hooks.cjs'));
  const rows = rolePreflight(hooks.assignment(ROOT));
  for (const r of rows) process.stdout.write(`${r.ok ? 'ok  ' : 'FAIL'} ${r.agent}: ${r.why}\n`);
  process.stdout.write(`${rows.filter(r => r.ok).length}/${rows.length} role lines point to their jobs; nothing was written\n`);
  return rows.every(r => r.ok) ? 0 : 1;
}

function status() {
  for (const id of Object.keys(JOBS)) {
    const s = readJob(id);
    if (!s) { process.stdout.write(`${id}: not started\n`); continue; }
    const a = s.attempts[s.attempts.length - 1] || {};
    // A running attempt writes into its copy; a settled one has been copied back.
    const where = a.workdir && !a.endedAt ? a.workdir : ROOT;
    const present = JOBS[id].outputs.filter(f => fs.existsSync(path.join(where, f))).length;
    process.stdout.write(`${id}: ${s.status}${s.reason ? ` - ${s.reason}` : ''}; route ${a.route || '-'}; silent ${a.silentSeconds || 0}s; useful ${Boolean(a.useful)}; outputs ${present}/${JOBS[id].outputs.length}; attempts ${s.attempts.length}${where !== ROOT ? `; copy ${where}` : ''}\n`);
  }
  return 0;
}

function startJobs(ids, cfg) {
  const routes = JSON.parse(fs.readFileSync(ROUTES, 'utf8'));
  let refused = 0;
  for (const id of ids) {
    const blocker = startBlockers(id);
    if (blocker) { process.stdout.write(`${id}: refused, ${blocker}\n`); refused += 1; continue; }
    const j = JOBS[id];
    if (j.needs) {
      const pending = j.needs.filter(n => { const x = readJob(n); return !x || (x.pid && sameProcess(x.pid, x.rootCreated) !== false); });
      if (pending.length) { process.stdout.write(`${id}: refused, waiting for ${pending.join(', ')}\n`); refused += 1; continue; }
    }
    const present = j.outputs.filter(f => fs.existsSync(path.join(ROOT, f)));
    if (present.length && !cfg.takeover) { process.stdout.write(`${id}: refused, outputs exist (${present.length}); a new executor needs --takeover from the owner\n`); refused += 1; continue; }
    if (cfg.route && cfg.route !== 'primary') {
      const n = Number(String(cfg.route).split(':')[1]);
      if (!/^kilo:\d+$/.test(cfg.route) || !kiloCandidates(j, routes).suitable[n - 1]) { process.stdout.write(`${id}: refused, no route ${cfg.route}\n`); refused += 1; continue; }
    }
    checkCommand(primaryCommand(id, promptLine(id), ROOT));
    if (!takeStartLock(id)) { process.stdout.write(`${id}: refused, another start or a live watchdog holds ${path.relative(ROOT, lockFile(id))}\n`); refused += 1; continue; }
    // This start is a new owner act: an earlier stop marker is cleared now, never by the watchdog.
    try { fs.unlinkSync(stopFile(id)); } catch { /* no earlier stop */ }
    const args = [__filename, '--run', id];
    for (const f of ['--soft-seconds', '--hard-seconds', '--cap-minutes', '--route']) {
      const v = f === '--route' ? cfg.route : f === '--soft-seconds' ? cfg.softSeconds : f === '--hard-seconds' ? cfg.hardSeconds : cfg.capMinutes;
      if (v !== null && v !== undefined) args.push(f, String(v));
    }
    const child = spawn(process.execPath, args, { cwd: ROOT, detached: true, stdio: 'ignore', windowsHide: true });
    child.unref();
    process.stdout.write(`${id}: started (watchdog pid ${child.pid})\n`);
  }
  process.stdout.write(`check with: node ${REL}/prompts/launch.cjs --status\n`);
  return refused ? 1 : 0;
}

// The owner's stop: a marker the watchdog obeys on its next tick (it stops the tree by identity and
// starts no fallback). If the watchdog itself is gone, the root is stopped here, by identity only.
function stop(ids) {
  fs.mkdirSync(path.join(OUT, 'jobs'), { recursive: true });
  for (const id of ids) {
    fs.writeFileSync(stopFile(id), `${new Date().toISOString()}\n`);
    const s = readJob(id);
    if (!s || !s.pid) {
      const starting = fs.existsSync(lockFile(id));
      process.stdout.write(`${id}: ${starting ? 'starting; the watchdog obeys the stop before it launches or on its first tick' : 'nothing running; stop request recorded'}\n`);
      continue;
    }
    const rows = procTable();
    const watchdogAlive = s.watchdog ? sameProcess(s.watchdog, s.watchdogCreated, rows) : false;
    if (watchdogAlive) { process.stdout.write(`${id}: stop requested; the watchdog stops it within one tick\n`); continue; }
    // No watchdog: stop the recorded tree here, leaves first, each process by identity only.
    const left = aliveTree(rows, recordedTree(s));
    if (!left) { process.stdout.write(`${id}: the process table cannot be read; nothing was stopped\n`); continue; }
    for (const p of left) killExact(p.pid);
    const after = aliveTree(procTable(), recordedTree(s));
    // The owner's stop settles an attempt its dead watchdog left open (CB-17). Its tree counts as
    // gone only if it was ever scanned and nothing recorded is alive now.
    const unscanned = [];
    (s.attempts || []).forEach((a, i) => {
      if (a.endedAt) return;
      a.status = 'STOPPED'; a.endedAt = new Date().toISOString();
      a.treeGone = Boolean(a.scanned && after && !after.length);
      if (!a.scanned) unscanned.push(i + 1);
    });
    s.status = 'NEEDS_OWNER'; s.reason = 'stopped by the owner'; s.pid = null; s.watchdog = null; writeJob(id, s);
    process.stdout.write(`${id}: no watchdog was running; stopped ${left.length} process(es) by identity${after && after.length ? `; still alive: ${after.map(p => p.pid).join(', ')}` : ''}\n`);
    if (unscanned.length) process.stdout.write(`${id}: WARNING attempt ${unscanned.join(', ')} ended before its process tree was recorded; processes it started may still run and must be checked by hand\n`);
  }
  return 0;
}

function main(argv) {
  let cfg;
  try { cfg = options(argv); } catch (e) {
    if (!(e instanceof UsageError)) throw e;
    process.stdout.write(`${e.message}\nusage: --dry [jobs] | --check [jobs] | --smoke [jobs] | --start <jobs> [--route primary|kilo:<n>] [--takeover] [--soft-seconds N] [--hard-seconds N] [--cap-minutes N] | --status | --preflight | --stop <jobs>\n`);
    return 2;
  }
  const pick = flag => {
    const i = argv.indexOf(flag);
    const next = argv[i + 1];
    return i === -1 || !next || next.startsWith('--') ? [] : expand(next);
  };
  const bad = ids => ids.filter(id => !JOBS[id]);
  if (argv.includes('--run')) { const id = argv[argv.indexOf('--run') + 1]; if (!JOBS[id]) return 2; run(id, cfg.route, cfg); return null; }
  if (argv.includes('--status')) return status();
  if (argv.includes('--preflight')) return preflight();
  for (const flag of ['--dry', '--check', '--smoke', '--start', '--stop']) {
    if (!argv.includes(flag)) continue;
    const picked = pick(flag);
    const ids = picked.length ? picked : (['--dry', '--check', '--smoke'].includes(flag) ? Object.keys(JOBS) : []);
    if (!ids.length || bad(ids).length) { process.stdout.write(`unknown job(s): ${bad(ids).join(', ') || '(none given)'}; known: ${Object.keys(JOBS).join(', ')}; groups: ${Object.keys(GROUPS).join(', ')}\n`); return 2; }
    if (flag === '--dry') return dry(ids);
    if (flag === '--check') return check(ids);
    if (flag === '--smoke') return smoke(ids, cfg);
    if (flag === '--start') return startJobs(ids, cfg);
    return stop(ids);
  }
  process.stdout.write('usage: --dry [jobs] | --check [jobs] | --smoke [jobs] | --start <jobs> [--route kilo:<n>] [--takeover] | --status | --preflight | --stop <jobs>\n');
  return 2;
}

if (require.main === module) {
  const code = main(process.argv.slice(2));
  if (code !== null) process.exitCode = code;
}

module.exports = { threeLevels, resolveEffort, kiloCandidates, decide, classifyExit, chunkIsProgress, aliveTree, startBlockers, stop, primaryCommand, kiloCommand, checkCommand, run, readJob, check, takeStartLock, lockFile, options, UsageError, main, rolePreflight, NO_PUSH_ENV, parsePorcelainZ, scopeViolations, JOURNAL_RE, JOBS, DEFAULTS, ERROR_TEXT };
