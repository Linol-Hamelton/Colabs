#!/usr/bin/env node
'use strict';
// Generic chain runner (PROTO-DEC-0073). Holds no prompt, no task instruction and no task path:
// every slot, route, output and launch file comes from the dispatch file named on the command
// line. The message to an agent is only "Read and follow the file <launch file>". What stays here
// is tooling: how each client takes a model and an effort, process control, and the status rules.
//   node run-chain.cjs <dispatch.json> runner | run | status | show <slot> | stop <slot>
// Dispatch file: { stateDir, usageFile, startLimitMin, stallMin, runLimitHours, slots: [ { id,
//   frame, out, launch, needs?, when?: { file, notMatch }, adopted?, route: { client, model, effort,
//   minBalance? }, fallback? } ] }. Paths are relative to the repository root.
const fs = require('fs');
const path = require('path');
const cp = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..', '..', '..');
const [DISPATCH, CMD, ARG] = process.argv.slice(2);
if (!DISPATCH || !CMD) { console.log('usage: run-chain.cjs <dispatch.json> runner | run | status | show <slot> | stop <slot> | accept <slot> <reason>'); process.exit(2); }
const D = JSON.parse(fs.readFileSync(path.resolve(ROOT, DISPATCH), 'utf8'));
const RT = path.join(ROOT, D.stateDir);
const STATE = path.join(RT, 'state.json');
const SLOTS = Object.fromEntries(D.slots.map(s => [s.id, s]));
const ORDER = D.slots.map(s => s.id);
const abs = p => path.join(ROOT, p);
const now = () => new Date().toISOString();

// Client adapters: command syntax only. `m` is the pointer message.
const COPILOT_TOOLS = ['write', 'shell(git:*)', 'shell(node:*)', 'shell(powershell:*)', 'shell(Get-Content:*)',
  'shell(Get-ChildItem:*)', 'shell(Select-String:*)', 'shell(Test-Path:*)', 'shell(Measure-Object:*)']
  .map(t => `--allow-tool="${t}"`).concat(['git commit', 'git push', 'git tag'].map(c => `--deny-tool="shell(${c})"`)).join(' ');
const VIBE_TOOLS = ['read_file', 'grep', 'write_file', 'edit', 'bash'].map(t => `--enabled-tools ${t}`).join(' ');
const CLIENTS = {
  copilot: (r, m) => `copilot -p "${m}" --model ${r.model}${r.effort ? ` --reasoning-effort ${r.effort}` : ''} --no-ask-user ${COPILOT_TOOLS}`,
  codex: (r, m) => `codex exec -m ${r.model}${r.effort ? ` -c model_reasoning_effort=${r.effort}` : ''} --approve-for-me --skip-git-repo-check -C "${ROOT}" "${m}"`,
  agy: (r, m) => `agy -p "${m}" --model ${r.model} --mode accept-edits`,
  kilo: (r, m, id) => `kilo run -m ${r.model}${r.effort ? ` --variant ${r.effort}` : ''} --auto --dir "${ROOT}" --title ${id} --format json "${m}"`,
  claude: (r, m) => `claude -p "${m}" --model ${r.model}${r.effort ? ` --effort ${r.effort}` : ''} --permission-mode acceptEdits --allowedTools Read Grep Glob Write Edit "Bash(node:*)" "Bash(git:*)" "Bash(powershell:*)"`,
  vibe: (r, m) =>`vibe -p "${m}" ${VIBE_TOOLS} --auto-approve --trust --max-turns 400 --output streaming --workdir "${ROOT}"`,
};
// Environment a client needs (its PROTO-DEC-0050 item 3 profile). vibe is Python and fails on a
// non-ASCII character under the Windows code page (measured again 2026-09-25: 'charmap' codec).
const CLIENT_ENV = { vibe: { PYTHONUTF8: '1', PYTHONIOENCODING: 'utf-8' } };
const command = (slot, route) => {
  const m = `Read and follow the file ${SLOTS[slot].launch}`;
  if (/["%^&|<>']/.test(m)) throw new Error('launch path holds a shell metacharacter');
  if (!fs.existsSync(abs(SLOTS[slot].launch))) throw new Error(`launch file missing: ${SLOTS[slot].launch}`);
  return CLIENTS[route.client](route, m, slot);
};

const load = () => {
  let s = {};
  try { s = JSON.parse(fs.readFileSync(STATE, 'utf8')); } catch { /* first run */ }
  for (const k of ['jobs', 'blocked', 'waits', 'skipped', 'accepted']) s[k] = s[k] || {};
  return s;
};
const save = s => { fs.mkdirSync(RT, { recursive: true }); fs.writeFileSync(STATE, JSON.stringify(s, null, 2)); };
const mtime = p => { try { return fs.statSync(p).mtimeMs; } catch { return 0; } };
// A process is ours only if both its pid and its start time match the launch record: Windows
// reuses pids, and a pid alone once made this runner restart a finished step and kill an unrelated
// process (2026-09-25). A record without a start time is never treated as alive.
const startTimeOf = pid => (cp.spawnSync('powershell', ['-NoProfile', '-NonInteractive', '-Command',
  `try { (Get-Process -Id ${Number(pid)} -ErrorAction Stop).StartTime.ToFileTimeUtc() } catch { '' }`], { encoding: 'utf8' }).stdout || '').trim();
function alive(pid, startTime) {
  if (!pid || !startTime) return false;
  return startTimeOf(pid) === String(startTime);
}
function balance() {
  const r = cp.spawnSync('kilo profile', { shell: true, encoding: 'utf8', timeout: 60000 });
  const m = /Balance:\s*\$([0-9]+(?:\.[0-9]+)?)/.exec(`${r.stdout}${r.stderr}`);
  return r.status === 0 && m ? Number(m[1]) : null;
}

// A detached node child gets no console, and kilo run exits silently without one (measured
// 2026-09-25). A job runs from a .cmd file through Start-Process, with a hidden console of its own.
function launch(cmd, log, env = {}) {
  const bat = log.replace(/\.log$/, '.cmd');
  const sets = Object.entries(env).map(([k, v]) => `set ${k}=${v}\r\n`).join('');
  fs.writeFileSync(bat, `@echo off\r\ncd /d "${ROOT}"\r\n${sets}${cmd} >> "${log}" 2>&1\r\necho EXIT=%ERRORLEVEL% >> "${log}"\r\n`);
  const r = cp.spawnSync('powershell', ['-NoProfile', '-NonInteractive', '-Command',
    "$p = Start-Process -FilePath $env:ComSpec -ArgumentList '/d','/c',$env:RUN_BAT -WindowStyle Hidden -PassThru; \"$($p.Id) $($p.StartTime.ToFileTimeUtc())\""],
    { encoding: 'utf8', env: { ...process.env, RUN_BAT: bat } });
  const [pid, startTime] = (r.stdout || '').trim().split(/s+/);
  if (r.status !== 0 || !Number(pid) || !startTime) throw new Error(`launch failed: ${r.stderr}`);
  return { pid: Number(pid), startTime };
}

// A journal belongs to a slot by its Orientation line, so a journal that only cites a frame is not taken.
const owns = (slot, t) => new RegExp(`^Orientation:.*@ ${SLOTS[slot].frame}[\\s(]`, 'm').test(t);
function journalOf(slot, since) {
  const wl = path.join(ROOT, '.ai', 'worklog');
  const hits = fs.readdirSync(wl).filter(f => f.endsWith('.md') && f !== 'README.md')
    .map(f => path.join(wl, f)).filter(p => fs.statSync(p).birthtimeMs >= since - 60000)
    .filter(p => owns(slot, fs.readFileSync(p, 'utf8')));
  return hits.sort((a, b) => mtime(b) - mtime(a))[0] || null;
}
function slotStatus(slot, job) {
  // A step found DONE stays DONE: its process record is never checked again.
  if (job.doneAt) return { state: 'DONE', route: job.route, pid: job.pid, journal: job.journal, output: job.outputLines, evidence: true, idleMin: 0 };
  const j = journalOf(slot, job.started);
  const text = j ? fs.readFileSync(j, 'utf8') : '';
  const out = abs(SLOTS[slot].out);
  const outLines = fs.existsSync(out) && mtime(out) >= job.started ? fs.readFileSync(out, 'utf8').split('\n').length : 0;
  const run = alive(job.pid, job.startTime);
  const last = Math.max(mtime(job.log), j ? mtime(j) : 0, mtime(out), job.started);
  const s = { route: job.route, pid: job.pid, alive: run, journal: j ? path.basename(j) : null,
    launch: /^Launch:/m.test(text), orientation: /^Orientation:/m.test(text), output: outLines,
    evidence: /^Evidence:/m.test(text), idleMin: Math.round((Date.now() - last) / 60000),
    ageMin: Math.round((Date.now() - job.started) / 60000) };
  if (s.evidence && outLines && !run) s.state = 'DONE';
  else if (!run) s.state = 'FAILED';
  else if (s.idleMin >= D.stallMin) s.state = 'STALLED';
  else if (s.launch && s.orientation) s.state = 'WORKING';
  else s.state = s.ageMin >= D.startLimitMin ? 'NO_START' : 'STARTING';
  return s;
}
const done = (st, k) => Boolean(st.jobs[k] && slotStatus(k, st.jobs[k]).state === 'DONE');
const settledOk = (st, k) => st.skipped[k] || st.accepted[k] || done(st, k);

function start(slot, useFallback) {
  const def = SLOTS[slot];
  const st = load();
  const prev = st.jobs[slot];
  if (prev && alive(prev.pid, prev.startTime)) throw new Error(`${slot} is still running (pid ${prev.pid})`);
  const route = useFallback ? def.fallback : def.route;
  if (!route) throw new Error(`${slot} has no ${useFallback ? 'fallback' : 'primary'} route`);
  const cmd = command(slot, route);
  fs.mkdirSync(RT, { recursive: true });
  const tries = ((prev || {}).tries || 0) + 1;
  const log = path.join(RT, `${slot}-${tries}.log`);
  const { pid, startTime } = launch(cmd, log, CLIENT_ENV[route.client]);
  st.jobs[slot] = { pid, startTime, started: Date.now(), route: useFallback ? 'fallback' : 'primary', client: route.client,
    model: route.model, effort: route.effort || null, log, cmd, tries, fallbackUsed: useFallback || Boolean(prev && prev.fallbackUsed) };
  delete st.waits[slot];
  save(st);
  console.log(`${now()} started ${slot} pid ${pid} ${route.client} ${route.model} try ${tries}`);
}
function stop(slot) {
  const job = load().jobs[slot];
  if (job && alive(job.pid, job.startTime)) cp.spawnSync('taskkill', ['/PID', String(job.pid), '/T', '/F'], { stdio: 'ignore' });
}

// Usage per run from what each client prints: kilo JSON step costs, copilot AI credits, codex tokens.
function usageOf(job) {
  const text = fs.existsSync(job.log) ? fs.readFileSync(job.log, 'utf8') : '';
  const u = { kiloCost: 0, kiloIn: 0, kiloOut: 0, copilotCredits: 0, codexTokens: 0 };
  for (const l of text.split('\n')) {
    try {
      const p = JSON.parse(l).part || {};
      if (p.type === 'step-finish') { u.kiloCost += p.cost || 0; u.kiloIn += (p.tokens || {}).input || 0; u.kiloOut += (p.tokens || {}).output || 0; }
    } catch { /* not a kilo event */ }
  }
  for (const m of text.matchAll(/AI Credits\s+([0-9.]+)/g)) u.copilotCredits += Number(m[1]);
  for (const m of text.matchAll(/tokens used\s*\r?\n?\s*([0-9,]+)/gi)) u.codexTokens += Number(m[1].replace(/,/g, ''));
  u.wallMin = Math.round((mtime(job.log) - job.started) / 60000);
  return u;
}
function writeUsage(st) {
  if (!D.usageFile) return;
  const rows = ORDER.filter(k => st.jobs[k] && st.jobs[k].usage).map(k => {
    const j = st.jobs[k], u = j.usage;
    return `| ${k} | ${j.client || '?'} | ${j.model || '?'} | ${j.effort || '-'} | ${u.wallMin} | ${u.outputLines} | ${u.kiloCost.toFixed(2)} | ${u.kiloIn}/${u.kiloOut} | ${u.copilotCredits.toFixed(2)} | ${u.codexTokens} | ${j.tries - 1} | ${u.state} |`;
  });
  fs.writeFileSync(abs(D.usageFile), `# Usage per run\n\nWritten by \`run-chain.cjs\` from each client's own output: kilo JSON step costs, the copilot\n` +
    '"AI Credits" line, the codex "tokens used" line. A blank figure means the client printed none.\n\n' +
    '| Slot | Client | Model | Effort | Wall min | Output lines | Kilo $ | Kilo tokens in/out | Copilot credits | Codex tokens | Retries | State |\n' +
    '|---|---|---|---|---:|---:|---:|---:|---:|---:|---:|---|\n' + rows.join('\n') + '\n');
}

function statusText(st) {
  const lines = ORDER.map(k => {
    if (st.accepted[k]) return `${k}: ACCEPTED ${st.accepted[k]}`;
    if (st.blocked[k]) return `${k}: BLOCKED ${st.blocked[k]}`;
    if (st.skipped[k]) return `${k}: SKIPPED ${st.skipped[k]}`;
    if (!st.jobs[k]) return `${k}: ${st.waits[k] ? `WAITING ${st.waits[k]}` : 'NOT_STARTED'}`;
    const s = slotStatus(k, st.jobs[k]);
    return `${k}: ${s.state} pid=${s.pid} ${st.jobs[k].client || ''} ${st.jobs[k].model || ''} try=${st.jobs[k].tries} journal=${s.journal} outputLines=${s.output} evidence=${s.evidence} idleMin=${s.idleMin}`;
  });
  if (st.runner) lines.push(`runner: pid=${st.runner.pid} alive=${alive(st.runner.pid, st.runner.startTime)}`);
  if (st.final) lines.push(`FINAL: ${st.final}`);
  return `# chain status ${now()} (${DISPATCH})\n\n${lines.join('\n')}\n`;
}

function tick() {
  let st = load();
  for (const slot of ORDER) {
    const def = SLOTS[slot];
    if (st.blocked[slot] || st.skipped[slot] || st.accepted[slot]) continue;
    const job = st.jobs[slot];
    if (!job) {
      if (def.adopted) continue;
      const needs = def.needs || [];
      const stuck = needs.find(n => st.blocked[n]);
      if (stuck) { st.blocked[slot] = `input ${stuck} blocked`; save(st); continue; }
      if (!needs.every(n => settledOk(st, n))) continue;
      const skippedNeed = needs.find(n => st.skipped[n]);
      if (skippedNeed) { st.skipped[slot] = `input ${skippedNeed} skipped`; save(st); continue; }
      // A route with a known reset time: the step waits, which spends no retry budget.
      if (def.notBefore && Date.now() < Date.parse(def.notBefore)) { st.waits[slot] = `not before ${def.notBefore}`; save(st); continue; }
      if (def.when && new RegExp(def.when.notMatch, 'm').test(fs.readFileSync(abs(def.when.file), 'utf8'))) {
        st.skipped[slot] = `${def.when.file} matches ${def.when.notMatch}`; save(st); continue;
      }
      if (def.route.minBalance) {
        const b = balance();
        if (b === null || b < def.route.minBalance) { st.waits[slot] = `Kilo balance ${b} < ${def.route.minBalance}`; save(st); continue; }
      }
      try { start(slot, false); } catch (e) { st = load(); st.blocked[slot] = e.message; save(st); }
      st = load();
      continue;
    }
    const s = slotStatus(slot, job);
    if (s.state === 'DONE' && !job.doneAt) {
      Object.assign(job, { doneAt: now(), journal: s.journal, outputLines: s.output });
      if (!job.usage) job.usage = { ...usageOf(job), outputLines: s.output, state: 'DONE' };
      save(st); writeUsage(st);
    }
    if (['FAILED', 'STALLED', 'NO_START'].includes(s.state)) {
      stop(slot);
      job.usage = { ...usageOf(job), outputLines: s.output, state: s.state }; save(st); writeUsage(st);
      console.log(`${now()} ${slot}: ${s.state} on try ${job.tries}`);
      try {
        if (def.fallback && !job.fallbackUsed) start(slot, true);
        else if (!def.fallback && job.tries < 2) start(slot, false);
        else { st = load(); st.blocked[slot] = `${s.state} after ${job.tries} tries`; save(st); }
      } catch (e) { st = load(); st.blocked[slot] = e.message; save(st); }
      st = load();
    }
  }
  return st;
}

// The report of the work done (PROTO-DEC-0076 item 3): the statuses the script accumulated, per step.
function reportText(st) {
  const rows = ORDER.map(k => {
    const j = st.jobs[k] || {};
    let s = 'NOT_STARTED';
    if (st.accepted[k]) s = 'ACCEPTED';
    else if (st.skipped[k]) s = 'SKIPPED';
    else if (st.blocked[k]) s = 'BLOCKED';
    else if (j.pid) s = slotStatus(k, j).state;
    const u = j.usage || {};
    const usage = [u.kiloCost ? `kilo ${u.kiloCost.toFixed(2)} USD` : '', u.copilotCredits ? `${u.copilotCredits.toFixed(0)} copilot credits` : '',
      u.codexTokens ? `${u.codexTokens} codex tokens` : ''].filter(Boolean).join(', ');
    const note = (st.accepted[k] || st.skipped[k] || st.blocked[k] || st.waits[k] || '').split('|').join('/');
    return `| ${k} | ${s} | ${j.client || '-'} ${j.model || ''} ${j.effort || ''} | ${j.tries || 0} | ${j.journal || '-'} | ${j.outputLines ?? u.outputLines ?? '-'} | ${usage} | ${note} |`;
  });
  return `# Report of the work done (${DISPATCH})\n\nWritten by run-chain.cjs at ${now()}. ${st.final ? `FINAL: ${st.final}` : 'Running.'}\n\n` +
    '| Step | State | Client, model, effort | Tries | Journal | Output lines | Usage | Note |\n|---|---|---|---:|---|---:|---|---|\n' + rows.join('\n') + '\n';
}

function run() {
  const t0 = Date.now();
  for (;;) {
    const st = tick();
    fs.writeFileSync(path.join(RT, 'STATUS.md'), statusText(st));
    const settled = ORDER.every(k => st.blocked[k] || settledOk(st, k));
    if (settled || Date.now() - t0 > D.runLimitHours * 3600000) {
      const open = ORDER.filter(k => st.blocked[k] || !settledOk(st, k));
      st.final = open.length ? `BLOCKED ${open.map(k => `${k} (${st.blocked[k] || st.waits[k] || 'not done'})`).join('; ')}` : 'DONE every slot finished or skipped';
      save(st);
      fs.writeFileSync(path.join(RT, 'STATUS.md'), statusText(st));
      fs.writeFileSync(path.join(RT, 'REPORT.md'), reportText(st));
      return;
    }
    cp.spawnSync('powershell', ['-NoProfile', '-Command', 'Start-Sleep -Seconds 60']);
  }
}
function runner() {
  const st = load();
  if (st.runner && alive(st.runner.pid, st.runner.startTime)) throw new Error(`runner still running (pid ${st.runner.pid})`);
  fs.mkdirSync(RT, { recursive: true });
  st.runner = { ...launch(`node "${__filename}" "${DISPATCH}" run`, path.join(RT, 'runner.log')), started: Date.now() };
  st.skipped = st.skipped || {};
  delete st.final;
  save(st);
  console.log(`runner pid ${st.runner.pid}`);
}

try {
  if (CMD === 'runner') runner();
  else if (CMD === 'run') run();
  else if (CMD === 'report') { const t = reportText(load()); fs.mkdirSync(RT, { recursive: true }); fs.writeFileSync(path.join(RT, 'REPORT.md'), t); process.stdout.write(t); }
  else if (CMD === 'status') { const t = statusText(load()); fs.mkdirSync(RT, { recursive: true }); fs.writeFileSync(path.join(RT, 'STATUS.md'), t); process.stdout.write(t); }
  else if (CMD === 'show') { const d = SLOTS[ARG]; console.log(command(ARG, d.route)); if (d.fallback) console.log(command(ARG, d.fallback)); }
  else if (CMD === 'stop') stop(ARG);
  // A coordinator's recorded acceptance of a step whose output is complete but whose run did not
  // close normally. It unblocks the dependents; the reason is kept in the state and the status.
  else if (CMD === 'reset') {
    // Clears a blocked slot once its cause is fixed, and the dependents it blocked.
    const st = load(); delete st.blocked[ARG]; delete st.jobs[ARG];
    for (const k of ORDER) if (/^input .* blocked$/.test(st.blocked[k] || '')) delete st.blocked[k];
    delete st.final; save(st); console.log(statusText(st));
  }
  else if (CMD === 'accept') {
    const reason = process.argv.slice(5).join(' ');
    if (!SLOTS[ARG] || !reason) throw new Error('accept <slot> <reason>');
    const st = load(); st.accepted[ARG] = `${now()} ${reason}`; delete st.blocked[ARG];
    for (const k of ORDER) if (/^input .* blocked$/.test(st.blocked[k] || '')) delete st.blocked[k];
    delete st.final; save(st); console.log(statusText(st));
  }
  else throw new Error(`unknown command ${CMD}`);
} catch (e) { console.error(`run-chain: ${e.message}`); process.exit(1); }
