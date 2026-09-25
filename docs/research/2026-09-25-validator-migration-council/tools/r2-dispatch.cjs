#!/usr/bin/env node
'use strict';
// Round-2 dispatch helper of the validator migration council, plus the third pass on package L.
// Run by the Kilo operator of prompts/K-dispatch-r2.md. Starts one job detached, reports status
// from journals, outputs and process liveness, stops a job. Decides nothing; certifies nothing.
// State lives in .ai/runtime/vmc-r2/ (disposable, git-ignored).
//   node r2-dispatch.cjs start <slot> [--fallback]
//   node r2-dispatch.cjs status
//   node r2-dispatch.cjs stop <slot>
//   node r2-dispatch.cjs final <DONE|BLOCKED> <one line>
const fs = require('fs');
const path = require('path');
const cp = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..', '..', '..');
const DIR = 'docs/research/2026-09-25-validator-migration-council';
const RT = path.join(ROOT, '.ai', 'runtime', 'vmc-r2');
const STATE = path.join(RT, 'state.json');
const BASELINE = 'a4e6aef86440bc0e8da8f06c8f1d3f65af254367';
const L_CANDIDATE = '9a936ddf077793a0050597b06947bdd8650bb455';

const git = a => cp.execFileSync('git', a, { cwd: ROOT, encoding: 'utf8' }).trim();
const round1Sha = () => {
  const sha = git(['log', '-1', '--format=%H', '--', `${DIR}/round1`]);
  if (!sha) throw new Error('round1/ is not committed; the round-2 corpus must be frozen first');
  return sha;
};

const COPILOT_TOOLS = ['write', 'shell(git:*)', 'shell(node:*)', 'shell(powershell:*)', 'shell(Get-Content:*)',
  'shell(Get-ChildItem:*)', 'shell(Select-String:*)', 'shell(Test-Path:*)', 'shell(Measure-Object:*)']
  .map(t => `--allow-tool="${t}"`).concat(['git commit', 'git push', 'git tag'].map(c => `--deny-tool="shell(${c})"`)).join(' ');
const kilo = (route, variant, title, m) => `kilo run -m ${route}${variant ? ` --variant ${variant}` : ''} --auto --dir "${ROOT}" --title ${title} "${m}"`;

const councilLine = (prompt, extra) => `Read and follow the file ${DIR}/prompts/${prompt} Baseline: ${BASELINE} ${extra} ` +
  `Round-1 corpus: round1/ is frozen and committed after the baseline; read it with git show ${round1Sha()}:${DIR}/round1/FILE. ` +
  'Nobody answers questions during this run: where a rule says ask the owner, write an OPEN QUESTION and continue.';

const SLOTS = {
  'r2-a': { frame: 'task:vmc-r2-a', agent: 'grok', out: `${DIR}/round2/challenge-A.md`,
    msg: () => councilLine('R2-challenge.md', 'Target: A Owner override (chat, 2026-09-25): r2-a runs grok-4.5 / high (copilot, agent grok) instead of gpt-5.6-sol / max, same tier T6; record this line and do not ask for a relaunch.'),
    cmd: m => `copilot -p "${m}" --model grok-4.5 --reasoning-effort high --no-ask-user ${COPILOT_TOOLS}`,
    fallback: m => kilo('kilo/x-ai/grok-4.5', 'high', 'vmc-r2-a', m) },
  'r2-b': { frame: 'task:vmc-r2-b', agent: 'claude', out: `${DIR}/round2/challenge-B.md`,
    msg: () => councilLine('R2-challenge.md', 'Target: B Route: Kilo kilo/anthropic/claude-opus-5.5 xhigh (PROTO-DEC-0067 fallback: the claude CLI shares the coordinator session limit); model and effort are the table cell.'),
    cmd: m => kilo('kilo/anthropic/claude-opus-5.5', 'xhigh', 'vmc-r2-b', m) },
  'r2-c': { frame: 'task:vmc-r2-c', agent: 'deepseek', out: `${DIR}/round2/challenge-C.md`,
    msg: () => councilLine('R2-challenge.md', 'Target: C'),
    cmd: m => kilo('openai-compatible/deepseek/deepseek-flash', null, 'vmc-r2-c', m) },
  'r2-synthesis': { frame: 'task:vmc-r2-synthesis', agent: 'gemini', out: `${DIR}/round2/ISSUE-MATRIX.md`, needs: ['r2-a', 'r2-b', 'r2-c'],
    msg: () => councilLine('R2-issue-matrix.md', 'The three challenges are in the working tree under round2/.'),
    cmd: m => `agy -p "${m}" --model gemini-3.1-pro-low --mode accept-edits`,
    fallback: m => kilo('kilo/google/gemini-3.1-pro-preview', 'low', 'vmc-r2-synthesis', m) },
  'l3': { frame: null, agent: 'deepseek', out: null,
    msg: () => `Read and follow the file docs/reviews/2026-09-25-claude-core-arch-stage2-fix-response-addendum-2.md Candidate: ${L_CANDIDATE} ` +
      'This is the third pass on package L only. Nobody answers questions during this run: record open points in the review and continue.',
    cmd: m => kilo('openai-compatible/deepseek/deepseek-flash', null, 'core-arch-l3', m) },
};

const load = () => { try { return JSON.parse(fs.readFileSync(STATE, 'utf8')); } catch { return { jobs: {} }; } };
const save = s => { fs.mkdirSync(RT, { recursive: true }); fs.writeFileSync(STATE, JSON.stringify(s, null, 2)); };
const mtime = p => { try { return fs.statSync(p).mtimeMs; } catch { return 0; } };
function alive(pid) {
  if (!pid) return false;
  const out = cp.spawnSync('tasklist', ['/FI', `PID eq ${pid}`, '/NH', '/FO', 'CSV'], { encoding: 'utf8' }).stdout || '';
  return out.includes(`"${pid}"`);
}
// A council journal is matched by its Orientation line, so a journal that only cites a frame is not taken.
const owns = (slot, t) => SLOTS[slot].frame ? new RegExp('^Orientation:.*@ ' + SLOTS[slot].frame + '[\\s(]', 'm').test(t)
  : t.includes('addendum-2') && !/task:vmc-/.test(t);
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
  const out = SLOTS[slot].out && path.join(ROOT, SLOTS[slot].out);
  const outLines = out && fs.existsSync(out) ? fs.readFileSync(out, 'utf8').split('\n').length : 0;
  const run = alive(job.pid);
  const last = Math.max(mtime(job.log), j ? mtime(j) : 0, out ? mtime(out) : 0, job.started);
  const s = {
    route: job.route, pid: job.pid, alive: run, journal: j ? path.basename(j) : null,
    launch: /^Launch:/m.test(text), orientation: /^Orientation:/m.test(text), output: outLines,
    evidence: /^Evidence:/m.test(text), idleMin: Math.round((Date.now() - last) / 60000),
  };
  s.state = s.evidence && (!out || outLines) && !run ? 'DONE'
    : !run ? 'FAILED' : s.idleMin >= 20 ? 'STALLED' : s.launch && s.orientation ? 'WORKING' : 'STARTING';
  return s;
}

function start(slot, useFallback) {
  const def = SLOTS[slot];
  if (!def) throw new Error(`unknown slot ${slot}; one of ${Object.keys(SLOTS).join(', ')}`);
  const st = load();
  if (st.jobs[slot] && alive(st.jobs[slot].pid)) throw new Error(`${slot} is still running (pid ${st.jobs[slot].pid})`);
  for (const n of def.needs || []) {
    if (!st.jobs[n] || slotStatus(n, st.jobs[n]).state !== 'DONE') throw new Error(`${slot} waits for ${n} (DONE required)`);
  }
  if (useFallback && !def.fallback) throw new Error(`${slot} has no fallback route`);
  const m = def.msg();
  if (/["%^&|<>]/.test(m)) throw new Error('message holds a shell metacharacter');
  const cmd = (useFallback ? def.fallback : def.cmd)(m);
  fs.mkdirSync(RT, { recursive: true });
  const log = path.join(RT, `${slot}${useFallback ? '-fallback' : ''}.log`);
  const fd = fs.openSync(log, 'a');
  const child = cp.spawn(cmd, { cwd: ROOT, shell: true, detached: true, windowsHide: true, stdio: ['ignore', fd, fd] });
  child.unref();
  st.jobs[slot] = { pid: child.pid, started: Date.now(), route: useFallback ? 'fallback' : 'primary', log, cmd,
    tries: ((st.jobs[slot] || {}).tries || 0) + 1 };
  save(st);
  console.log(`started ${slot} pid ${child.pid} route ${st.jobs[slot].route}\n${cmd}`);
}

function status() {
  const st = load();
  const rows = Object.keys(SLOTS).map(k => [k, st.jobs[k] ? slotStatus(k, st.jobs[k]) : { state: 'NOT_STARTED' }]);
  const lines = rows.map(([k, s]) => `${k}: ${s.state}${s.pid ? ` pid=${s.pid} alive=${s.alive} route=${s.route} journal=${s.journal} launch=${s.launch} orientation=${s.orientation} outputLines=${s.output} evidence=${s.evidence} idleMin=${s.idleMin}` : ''}`);
  if (st.final) lines.push(`FINAL: ${st.final}`);
  const text = `# vmc-r2 status ${new Date().toISOString()}\n\n${lines.join('\n')}\n`;
  fs.mkdirSync(RT, { recursive: true });
  fs.writeFileSync(path.join(RT, 'STATUS.md'), text);
  process.stdout.write(text);
}

function stop(slot) {
  const job = load().jobs[slot];
  if (!job || !alive(job.pid)) return console.log(`${slot}: not running`);
  cp.spawnSync('taskkill', ['/PID', String(job.pid), '/T', '/F'], { stdio: 'inherit' });
}

const [cmd, a, ...rest] = process.argv.slice(2);
try {
  if (cmd === 'start') start(a, rest.includes('--fallback'));
  else if (cmd === 'status') status();
  else if (cmd === 'stop') stop(a);
  else if (cmd === 'show') { const d = SLOTS[a]; console.log(d.cmd(d.msg())); if (d.fallback) console.log(d.fallback(d.msg())); }
  else if (cmd === 'final') { const st = load(); st.final = `${a} ${rest.join(' ')}`.trim(); save(st); status(); }
  else console.log('usage: start <slot> [--fallback] | show <slot> | status | stop <slot> | final <DONE|BLOCKED> <text>');
} catch (e) { console.error(`r2-dispatch: ${e.message}`); process.exit(1); }
