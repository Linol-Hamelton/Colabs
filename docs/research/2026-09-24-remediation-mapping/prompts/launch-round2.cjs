'use strict';

// Round-2 launcher for the remediation-mapping research. A dispatch helper, not kernel
// code: it grants nothing and certifies nothing. It exists so the dispatcher runs ONE
// command instead of hand-quoting three CLI invocations.
//
//   node docs/research/2026-09-24-remediation-mapping/prompts/launch-round2.cjs            start all, detached
//   node docs/research/2026-09-24-remediation-mapping/prompts/launch-round2.cjs --only mistral,copilot
//   node docs/research/2026-09-24-remediation-mapping/prompts/launch-round2.cjs --status   print state
//
// Each agent receives a one-line prompt naming its prompt file, so no prompt text passes
// through a shell. Idle exit per PROTO-DEC-0049 item 3: no growth of the agent's log, its
// report or its newest journal for more than five minutes stops the agent (STALLED).
// A hard cap of 60 minutes stops it as TIMEOUT. State: .ai/runtime/r2/state.json.

const fs = require('node:fs');
const path = require('node:path');
const { spawn, execFileSync } = require('node:child_process');

const ROOT = path.resolve(__dirname, '..', '..', '..', '..');
const REL = 'docs/research/2026-09-24-remediation-mapping';
const OUT = path.join(ROOT, '.ai', 'runtime', 'r2');
const STATE = path.join(OUT, 'state.json');
const IDLE_MS = 5 * 60 * 1000;
const CAP_MS = 60 * 60 * 1000;
const TICK_MS = 30 * 1000;

const line = name => `"Read and follow the file ${REL}/prompts/r2-${name}.md"`;
const JOBS = {
  mistral: {
    report: `${REL}/r2-mistral-z1-z3.md`,
    command: `vibe -p ${line('mistral')} --auto-approve --max-turns 150 --output streaming --workdir "${ROOT}"`,
  },
  copilot: {
    report: `${REL}/r2-copilot-z2-z4.md`,
    command: `copilot -p ${line('copilot')} --allow-all-tools --log-dir "${path.join(OUT, 'copilot-log')}"`,
  },
  gemini: {
    report: `${REL}/r2-gemini-z4-z2.md`,
    command: `agy -p ${line('gemini')} --dangerously-skip-permissions --add-dir "${ROOT}" --print-timeout 3600s --output-format stream-json`,
  },
};

function readState() {
  try { return JSON.parse(fs.readFileSync(STATE, 'utf8')); } catch { return {}; }
}

function writeState(state) {
  fs.mkdirSync(OUT, { recursive: true });
  fs.writeFileSync(STATE, `${JSON.stringify(state, null, 2)}\n`, 'utf8');
}

// Sum of sizes and newest mtime across the files that show this agent is working.
function activity(name) {
  const files = [path.join(OUT, `${name}.log`), path.join(ROOT, JOBS[name].report)];
  const worklog = path.join(ROOT, '.ai', 'worklog');
  try {
    for (const f of fs.readdirSync(worklog)) if (f.startsWith(`${name}-`)) files.push(path.join(worklog, f));
  } catch { /* no worklog directory yet */ }
  if (name === 'copilot') {
    const dir = path.join(OUT, 'copilot-log');
    try { for (const f of fs.readdirSync(dir)) files.push(path.join(dir, f)); } catch { /* not created yet */ }
  }
  let signature = 0;
  for (const f of files) {
    try { const s = fs.statSync(f); signature += s.size + s.mtimeMs; } catch { /* absent */ }
  }
  return signature;
}

function kill(pid) {
  try { execFileSync('taskkill', ['/PID', String(pid), '/T', '/F'], { stdio: 'ignore' }); } catch { /* already gone */ }
}

function run(names) {
  fs.mkdirSync(OUT, { recursive: true });
  // A partial restart (--only) keeps the recorded status of the agents it does not touch.
  const previous = readState();
  const state = { started: new Date().toISOString(), root: ROOT, agents: previous.agents || {} };
  // vibe is Python: with stdout redirected to a file on Windows it writes in the ANSI code
  // page and died on the first U+2192 (measured 2026-09-24). Force UTF-8 for every child.
  const env = { ...process.env, PYTHONUTF8: '1', PYTHONIOENCODING: 'utf-8' };
  const children = {};
  for (const name of names) {
    const log = fs.openSync(path.join(OUT, `${name}.log`), 'a');
    const child = spawn(JOBS[name].command, { cwd: ROOT, env, shell: true, stdio: ['ignore', log, log], windowsHide: true });
    children[name] = { child, last: Date.now(), signature: activity(name), began: Date.now() };
    state.agents[name] = { status: 'RUNNING', pid: child.pid, command: JOBS[name].command, report: JOBS[name].report };
    child.on('exit', code => {
      const entry = state.agents[name];
      if (entry.status === 'RUNNING') entry.status = code === 0 ? 'EXITED' : `FAILED(${code})`;
      entry.exitCode = code;
      entry.reportExists = fs.existsSync(path.join(ROOT, JOBS[name].report));
      entry.ended = new Date().toISOString();
      writeState(state);
    });
  }
  writeState(state);
  const timer = setInterval(() => {
    let running = 0;
    for (const [name, c] of Object.entries(children)) {
      const entry = state.agents[name];
      if (entry.status !== 'RUNNING') continue;
      running += 1;
      const now = Date.now();
      const sig = activity(name);
      if (sig !== c.signature) { c.signature = sig; c.last = now; }
      entry.idleSeconds = Math.round((now - c.last) / 1000);
      if (now - c.last > IDLE_MS) { entry.status = 'STALLED'; kill(c.child.pid); }
      else if (now - c.began > CAP_MS) { entry.status = 'TIMEOUT'; kill(c.child.pid); }
    }
    state.checked = new Date().toISOString();
    writeState(state);
    if (!running) clearInterval(timer);
  }, TICK_MS);
}

function main(argv) {
  if (argv.includes('--status')) {
    const state = readState();
    if (!state.agents) { process.stdout.write('no round-2 run recorded\n'); return 0; }
    for (const [name, a] of Object.entries(state.agents)) {
      const report = fs.existsSync(path.join(ROOT, a.report)) ? 'report present' : 'no report yet';
      process.stdout.write(`${name}: ${a.status}, idle ${a.idleSeconds || 0}s, ${report}\n`);
    }
    return 0;
  }
  const onlyAt = argv.indexOf('--only');
  const names = onlyAt === -1 ? Object.keys(JOBS) : String(argv[onlyAt + 1] || '').split(',').filter(Boolean);
  const unknown = names.filter(n => !JOBS[n]);
  if (!names.length || unknown.length) {
    process.stdout.write(`unknown agent(s): ${unknown.join(', ') || '(none given)'}; known: ${Object.keys(JOBS).join(', ')}\n`);
    return 2;
  }
  if (argv.includes('--dry')) {
    for (const n of names) process.stdout.write(`${n}: ${JOBS[n].command}\n`);
    return 0;
  }
  if (argv.includes('--run')) { run(names); return null; }
  const child = spawn(process.execPath, [__filename, '--run', '--only', names.join(',')],
    { cwd: ROOT, detached: true, stdio: 'ignore', windowsHide: true });
  child.unref();
  process.stdout.write(`started ${names.join(', ')} in the background; check with: node ${REL}/prompts/launch-round2.cjs --status\n`);
  return 0;
}

const code = main(process.argv.slice(2));
if (code !== null) process.exitCode = code;
