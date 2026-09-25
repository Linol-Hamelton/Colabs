#!/usr/bin/env node
'use strict';
// Round-3 and closing dispatcher of the validator migration council. Unlike r2-dispatch, it runs
// the chain itself (`run`), with no model in the loop: start a step when its inputs are DONE,
// fall back once on failure or stall, wait for Kilo balance before a Fable step, block what
// cannot run. The Kilo operator of prompts/K-dispatch-r3.md starts it with `runner`.
// Decides nothing; certifies nothing. State: .ai/runtime/vmc-r3/ (disposable, git-ignored).
//   node r3-dispatch.cjs runner | run | status | show <slot> | start <slot> [--fallback] | stop <slot>
const fs = require('fs');
const path = require('path');
const cp = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..', '..', '..');
const DIR = 'docs/research/2026-09-25-validator-migration-council';
const RT = path.join(ROOT, '.ai', 'runtime', 'vmc-r3');
const STATE = path.join(RT, 'state.json');
const USAGE = path.join(ROOT, DIR, 'round3', 'FABLE-USAGE.md');
const BASELINE = 'a4e6aef86440bc0e8da8f06c8f1d3f65af254367';
const TICK_MS = 60000;
const START_LIMIT_MIN = 10;
const STALL_MIN = 30;
const RUN_LIMIT_MS = 12 * 3600000;

const git = a => cp.execFileSync('git', a, { cwd: ROOT, encoding: 'utf8' }).trim();
const addendumSha = () => {
  const sha = git(['log', '-1', '--format=%H', '--', `${DIR}/OWNER-DECISION-R3.md`]);
  if (!sha) throw new Error('OWNER-DECISION-R3.md is not committed');
  return sha;
};

const kilo = (route, variant, title, m, json) =>
  `kilo run -m ${route}${variant ? ` --variant ${variant}` : ''} --auto --dir "${ROOT}" --title ${title}${json ? ' --format json' : ''} "${m}"`;
const codex = m => `codex exec -m gpt-6-astra -c model_reasoning_effort=high --approve-for-me --skip-git-repo-check -C "${ROOT}" "${m}"`;
const agy = m => `agy -p "${m}" --model gemini-3.8-flash-low --mode accept-edits`;
const COPILOT_TOOLS = ['write', 'shell(git:*)', 'shell(node:*)', 'shell(powershell:*)', 'shell(Get-Content:*)',
  'shell(Get-ChildItem:*)', 'shell(Select-String:*)', 'shell(Test-Path:*)', 'shell(Measure-Object:*)']
  .map(t => `--allow-tool="${t}"`).concat(['git commit', 'git push', 'git tag'].map(c => `--deny-tool="shell(${c})"`)).join(' ');

const line = (prompt, agent, extra) => `Read and follow the file ${DIR}/prompts/${prompt} then ${DIR}/prompts/R3-ADDENDUM.md ` +
  `Baseline: ${BASELINE} ${extra} Start with: node .ai/bin/protocol-session.cjs start --agent ${agent} ` +
  `Frozen inputs: round1/ and round2/ as listed with sha256 in ${DIR}/round3/CORPUS.txt; the owner decision and the F-3P-1 inputs at ${addendumSha()}. ` +
  'Nobody answers questions during this run: where a rule says ask the owner, write an OPEN QUESTION and continue.';

const FABLE = 'kilo/anthropic/claude-fable-5.1';
const SLOTS = {
  'r3-a': { frame: 'task:vmc-r3-a', agent: 'claude', out: 'round3/synthesis-A.md', fable: 'medium', minBalance: 15,
    msg: () => line('R3-synthesis.md', 'claude', 'Slot: A Route: Kilo claude-fable-5.1 medium, owner-authorised 2026-09-25.'),
    cmd: m => kilo(FABLE, 'medium', 'vmc-r3-a', m, true) },
  'r3-b': { frame: 'task:vmc-r3-b', agent: 'codex', out: 'round3/synthesis-B.md',
    msg: () => line('R3-synthesis.md', 'codex', 'Slot: B'), cmd: codex,
    fallback: m => kilo('kilo/openai/gpt-6-astra', 'high', 'vmc-r3-b', m) },
  'r3-c': { frame: 'task:vmc-r3-c', agent: 'gemini', out: 'round3/synthesis-C.md',
    msg: () => line('R3-synthesis.md', 'gemini', 'Slot: C'), cmd: agy,
    fallback: m => kilo('kilo/google/gemini-3.8-flash', 'low', 'vmc-r3-c', m) },
  'draft': { frame: 'task:vmc-draft', agent: 'claude', out: 'draft-decision.md', fable: 'medium', minBalance: 15, needs: ['r3-a', 'r3-b', 'r3-c'],
    msg: () => line('C-draft.md', 'claude', 'Route: Kilo claude-fable-5.1 medium, owner-authorised 2026-09-25.'),
    cmd: m => kilo(FABLE, 'medium', 'vmc-draft', m, true) },
  'critique-a': { frame: 'task:vmc-critique-a', agent: 'codex', out: 'critique-A.md', needs: ['draft'],
    msg: () => line('C-critique.md', 'codex', 'Slot: A'), cmd: codex,
    fallback: m => kilo('kilo/openai/gpt-6-astra', 'high', 'vmc-critique-a', m) },
  'critique-b': { frame: 'task:vmc-critique-b', agent: 'gemini', out: 'critique-B.md', needs: ['draft'],
    msg: () => line('C-critique.md', 'gemini', 'Slot: B'), cmd: agy,
    fallback: m => kilo('kilo/google/gemini-3.8-flash', 'low', 'vmc-critique-b', m) },
  'final': { frame: 'task:vmc-final', agent: 'claude', out: 'final-plan.md', fable: 'high', minBalance: 20, needs: ['critique-a', 'critique-b'],
    msg: () => line('C-final-plan.md', 'claude', 'Route: Kilo claude-fable-5.1 high, owner-authorised 2026-09-25.'),
    cmd: m => kilo(FABLE, 'high', 'vmc-final', m, true) },
  'verify': { frame: 'task:vmc-verify', agent: 'kimi', out: 'verification.md', needs: ['final'],
    msg: () => line('C-verify.md', 'kimi', 'Verifier: kimi-k2.7-code / high, another model family than Fable.'),
    cmd: m => `copilot -p "${m}" --model kimi-k2.7-code --reasoning-effort high --no-ask-user ${COPILOT_TOOLS}`,
    fallback: m => kilo('kilo/moonshotai/kimi-k2.7-code', 'high', 'vmc-verify', m) },
};
const ORDER = Object.keys(SLOTS);

const load = () => { try { return JSON.parse(fs.readFileSync(STATE, 'utf8')); } catch { return { jobs: {}, blocked: {}, waits: {} }; } };
const save = s => { fs.mkdirSync(RT, { recursive: true }); fs.writeFileSync(STATE, JSON.stringify(s, null, 2)); };
const mtime = p => { try { return fs.statSync(p).mtimeMs; } catch { return 0; } };
const now = () => new Date().toISOString();
function alive(pid) {
  if (!pid) return false;
  const out = cp.spawnSync('tasklist', ['/FI', `PID eq ${pid}`, '/NH', '/FO', 'CSV'], { encoding: 'utf8' }).stdout || '';
  return out.includes(`"${pid}"`);
}
function balance() {
  const r = cp.spawnSync('kilo profile', { shell: true, encoding: 'utf8', timeout: 60000 });
  const m = /Balance:\s*\$([0-9.]+)/.exec(`${r.stdout}${r.stderr}`);
  return m ? Number(m[1]) : null;
}

// A detached node child gets no console, and kilo run exits silently without one (measured
// 2026-09-25). A job runs from a .cmd file through Start-Process, with a hidden console of its own.
function launch(cmd, log) {
  const bat = log.replace(/\.log$/, '.cmd');
  fs.writeFileSync(bat, `@echo off\r\ncd /d "${ROOT}"\r\n${cmd} >> "${log}" 2>&1\r\n`);
  const r = cp.spawnSync('powershell', ['-NoProfile', '-NonInteractive', '-Command',
    "(Start-Process -FilePath $env:ComSpec -ArgumentList '/d','/c',$env:R3_BAT -WindowStyle Hidden -PassThru).Id"],
    { encoding: 'utf8', env: { ...process.env, R3_BAT: bat } });
  const pid = Number((r.stdout || '').trim());
  if (r.status !== 0 || !pid) throw new Error(`launch failed: ${r.stderr}`);
  return pid;
}

// A council journal is matched by its Orientation line, so a journal that only cites a frame is not taken.
const owns = (slot, t) => new RegExp(`^Orientation:.*@ ${SLOTS[slot].frame}[\\s(]`, 'm').test(t);
function journalOf(slot, since) {
  const wl = path.join(ROOT, '.ai', 'worklog');
  const hits = fs.readdirSync(wl).filter(f => f.endsWith('.md') && f !== 'README.md')
    .map(f => path.join(wl, f)).filter(p => fs.statSync(p).birthtimeMs >= since - 60000)
    .filter(p => owns(slot, fs.readFileSync(p, 'utf8')));
  return hits.sort((a, b) => mtime(b) - mtime(a))[0] || null;
}
function slotStatus(slot, job) {
  const j = journalOf(slot, job.started);
  const text = j ? fs.readFileSync(j, 'utf8') : '';
  const out = path.join(ROOT, DIR, SLOTS[slot].out);
  const outLines = fs.existsSync(out) && mtime(out) >= job.started ? fs.readFileSync(out, 'utf8').split('\n').length : 0;
  const run = alive(job.pid);
  const last = Math.max(mtime(job.log), j ? mtime(j) : 0, mtime(out), job.started);
  const s = { route: job.route, pid: job.pid, alive: run, journal: j ? path.basename(j) : null,
    launch: /^Launch:/m.test(text), orientation: /^Orientation:/m.test(text), output: outLines,
    evidence: /^Evidence:/m.test(text), idleMin: Math.round((Date.now() - last) / 60000),
    ageMin: Math.round((Date.now() - job.started) / 60000) };
  if (s.evidence && outLines && !run) s.state = 'DONE';
  else if (!run) s.state = 'FAILED';
  else if (s.idleMin >= STALL_MIN) s.state = 'STALLED';
  else if (s.launch && s.orientation) s.state = 'WORKING';
  else s.state = s.ageMin >= START_LIMIT_MIN ? 'NO_START' : 'STARTING';
  return s;
}

function start(slot, useFallback) {
  const def = SLOTS[slot];
  if (!def) throw new Error(`unknown slot ${slot}; one of ${ORDER.join(', ')}`);
  const st = load();
  const prev = st.jobs[slot];
  if (prev && alive(prev.pid)) throw new Error(`${slot} is still running (pid ${prev.pid})`);
  for (const n of def.needs || []) {
    if (!st.jobs[n] || slotStatus(n, st.jobs[n]).state !== 'DONE') throw new Error(`${slot} waits for ${n} (DONE required)`);
  }
  if (useFallback && !def.fallback) throw new Error(`${slot} has no fallback route`);
  const m = def.msg();
  if (/["%^&|<>']/.test(m)) throw new Error('message holds a shell metacharacter');
  const cmd = (useFallback ? def.fallback : def.cmd)(m);
  fs.mkdirSync(RT, { recursive: true });
  const tries = ((prev || {}).tries || 0) + 1;
  const log = path.join(RT, `${slot}-${tries}.log`);
  const before = def.fable ? balance() : null;
  const pid = launch(cmd, log);
  st.jobs[slot] = { pid, started: Date.now(), route: useFallback ? 'fallback' : 'primary', log, cmd, tries,
    fallbackUsed: useFallback || Boolean(prev && prev.fallbackUsed), balanceBefore: before };
  delete st.waits[slot];
  save(st);
  console.log(`${now()} started ${slot} pid ${pid} route ${st.jobs[slot].route} try ${tries}`);
}

function stop(slot) {
  const job = load().jobs[slot];
  if (job && alive(job.pid)) cp.spawnSync('taskkill', ['/PID', String(job.pid), '/T', '/F'], { stdio: 'ignore' });
}

// Fable measurement from the kilo JSON events of each try: tokens and cost per step, wall time.
function usageOf(job) {
  const u = { input: 0, output: 0, reasoning: 0, cacheRead: 0, cost: 0, first: null, last: null, errors: 0 };
  for (const l of fs.readFileSync(job.log, 'utf8').split('\n')) {
    let e; try { e = JSON.parse(l); } catch { if (/error/i.test(l)) u.errors++; continue; }
    u.first = u.first || e.timestamp; u.last = e.timestamp || u.last;
    if (e.type === 'error') u.errors++;
    const p = e.part || {};
    if (p.type === 'step-finish' && p.tokens) {
      u.input += p.tokens.input || 0; u.output += p.tokens.output || 0; u.reasoning += p.tokens.reasoning || 0;
      u.cacheRead += (p.tokens.cache || {}).read || 0; u.cost += p.cost || 0;
    }
  }
  return u;
}
function writeUsage(st) {
  const rows = ORDER.filter(k => SLOTS[k].fable && st.jobs[k] && st.jobs[k].usage).map(k => {
    const j = st.jobs[k], u = j.usage;
    const wall = u.first && u.last ? Math.round((u.last - u.first) / 60000) : '?';
    return `| ${k} | ${FABLE} ${SLOTS[k].fable} | ${u.input} | ${u.cacheRead} | ${u.output} | ${u.reasoning} | ${u.outputLines} | ${wall} | ` +
      `${j.balanceBefore ?? '?'} | ${j.balanceAfter ?? '?'} | ${u.cost.toFixed(2)} | ${j.tries - 1} | ${u.errors} | ${u.state} |`;
  });
  fs.writeFileSync(USAGE, '# Fable usage in round 3 (owner decision, "FABLE USAGE MEASUREMENT")\n\n' +
    'Written by `tools/r3-dispatch.cjs` from the kilo JSON events of each run. Tokens and cost are summed over the\n' +
    'step-finish events of the last try. Balance is `kilo profile` before start and after the end; other Kilo jobs\n' +
    'running at the same time also move it, so the event cost is the per-run figure. The quality verdict is the\n' +
    'Fable quality line of the next reviewer (critiques, verification).\n\n' +
    '| Slot | Route, effort | Input tokens | Cache read | Output tokens | Reasoning | Output lines | Wall min | Balance before $ | Balance after $ | Cost $ (events) | Retries | Errors | State |\n' +
    '|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|\n' + rows.join('\n') + '\n');
}

function statusText(st) {
  const lines = ORDER.map(k => {
    if (st.blocked[k]) return `${k}: BLOCKED ${st.blocked[k]}`;
    if (!st.jobs[k]) return `${k}: ${st.waits[k] ? `WAITING ${st.waits[k]}` : 'NOT_STARTED'}`;
    const s = slotStatus(k, st.jobs[k]);
    return `${k}: ${s.state} pid=${s.pid} route=${s.route} try=${st.jobs[k].tries} journal=${s.journal} outputLines=${s.output} evidence=${s.evidence} idleMin=${s.idleMin}`;
  });
  if (st.runner) lines.push(`runner: pid=${st.runner.pid} alive=${alive(st.runner.pid)}`);
  if (st.final) lines.push(`FINAL: ${st.final}`);
  return `# vmc-r3 status ${now()}\n\n${lines.join('\n')}\n`;
}
function status() {
  const text = statusText(load());
  fs.mkdirSync(RT, { recursive: true });
  fs.writeFileSync(path.join(RT, 'STATUS.md'), text);
  process.stdout.write(text);
}

function tick() {
  let st = load();
  for (const slot of ORDER) {
    const def = SLOTS[slot];
    if (st.blocked[slot]) continue;
    const job = st.jobs[slot];
    if (!job) {
      const stuck = (def.needs || []).find(n => st.blocked[n]);
      if (stuck) { st.blocked[slot] = `input ${stuck} blocked`; save(st); continue; }
      if (!(def.needs || []).every(n => st.jobs[n] && slotStatus(n, st.jobs[n]).state === 'DONE')) continue;
      if (def.fable) {
        const b = balance();
        if (b === null || b < def.minBalance) { st.waits[slot] = `Kilo balance ${b} < ${def.minBalance}`; save(st); continue; }
      }
      try { start(slot, false); } catch (e) { console.log(`${now()} ${slot}: ${e.message}`); }
      st = load();
      continue;
    }
    const s = slotStatus(slot, job);
    if (s.state === 'DONE' && def.fable && !job.usage) {
      job.usage = { ...usageOf(job), outputLines: s.output, state: 'DONE' };
      job.balanceAfter = balance(); save(st); writeUsage(st);
    }
    if (['FAILED', 'STALLED', 'NO_START'].includes(s.state)) {
      stop(slot);
      if (def.fable) { job.usage = { ...usageOf(job), outputLines: s.output, state: s.state }; save(st); writeUsage(st); }
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

function run() {
  const t0 = Date.now();
  for (;;) {
    const st = tick();
    fs.writeFileSync(path.join(RT, 'STATUS.md'), statusText(st));
    const settled = ORDER.every(k => st.blocked[k] || (st.jobs[k] && slotStatus(k, st.jobs[k]).state === 'DONE'));
    if (settled || Date.now() - t0 > RUN_LIMIT_MS) {
      const blocked = ORDER.filter(k => st.blocked[k] || !(st.jobs[k] && slotStatus(k, st.jobs[k]).state === 'DONE'));
      st.final = blocked.length ? `BLOCKED ${blocked.map(k => `${k} (${st.blocked[k] || st.waits[k] || 'not done'})`).join('; ')}` : 'DONE round 3, closing and verification finished';
      save(st);
      fs.writeFileSync(path.join(RT, 'STATUS.md'), statusText(st));
      return;
    }
    cp.spawnSync('powershell', ['-NoProfile', '-Command', `Start-Sleep -Milliseconds ${TICK_MS}`]);
  }
}

function runner() {
  const st = load();
  if (st.runner && alive(st.runner.pid)) throw new Error(`runner still running (pid ${st.runner.pid})`);
  fs.mkdirSync(RT, { recursive: true });
  st.runner = { pid: launch(`node "${__filename}" run`, path.join(RT, 'runner.log')), started: Date.now() };
  delete st.final;
  save(st);
  console.log(`runner pid ${st.runner.pid}`);
}

const [cmd, a, ...rest] = process.argv.slice(2);
try {
  if (cmd === 'runner') runner();
  else if (cmd === 'run') run();
  else if (cmd === 'status') status();
  else if (cmd === 'start') start(a, rest.includes('--fallback'));
  else if (cmd === 'stop') stop(a);
  else if (cmd === 'show') { const d = SLOTS[a]; console.log(d.cmd(d.msg())); if (d.fallback) console.log(d.fallback(d.msg())); }
  else console.log('usage: runner | run | status | show <slot> | start <slot> [--fallback] | stop <slot>');
} catch (e) { console.error(`r3-dispatch: ${e.message}`); process.exit(1); }
