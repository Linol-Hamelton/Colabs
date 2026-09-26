'use strict';

const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const crypto = require('node:crypto');
const { spawn, spawnSync, execFileSync } = require('node:child_process');

const JOURNAL_RE = /^\.ai\/worklog\/[a-z][a-z0-9]*-[0-9a-f]{16}\.md$/;
const SAFE_CMD = /^[^%^&|<>']*$/;
const RETRY_TEXT = /\bretry(?:ing)?\b|\bretries\b|\bbacking off\b|\bwaiting \d+(?:\.\d+)? ?(?:ms|s|sec|seconds?)\b/i;

const FAILURE_CLASSES = [
  'AUTH_ERROR',
  'RATE_LIMIT',
  'QUOTA_EXHAUSTED',
  'MODEL_UNAVAILABLE',
  'NETWORK_ERROR',
  'PROVIDER_ERROR',
  'PROCESS_CRASH',
  'INVALID_OUTPUT',
  'STALL',
  'TIMEOUT',
  'CONFIG_ERROR',
  'POLICY_FAILURE'
];

const ERROR_PATTERNS = {
  AUTH_ERROR: [
    /\b(?:HTTP(?:\/\d(?:\.\d)?)?|status|error|code)\W{0,3}(?:401|403)\b/i,
    /\b(?:401|403)\W{0,3}(?:Unauthori[sz]ed|Forbidden)\b/i,
    /\bunauthori[sz]ed\b|not logged in|log ?in required|authenticat\w* (?:failed|error|required)|invalid[ _](?:api[ _-]?key|token|credentials)/i
  ],
  RATE_LIMIT: [
    /\b(?:HTTP(?:\/\d(?:\.\d)?)?|status|error|code)\W{0,3}429\b/i,
    /\b429\W{0,3}Too Many Requests\b/i,
    /\brate[ _-]?limit(?:ed|[ _](?:error|exceeded|reached|hit))|too many requests\b/i
  ],
  QUOTA_EXHAUSTED: [
    /\bquota[ _](?:exceeded|exhausted|reached|error)|exceeded (?:your|the) (?:current )?quota|insufficient[ _](?:credit|balance|funds|quota)|credit balance is too low|usage limit (?:reached|exceeded)|limit (?:reached|exceeded)|hit your (?:usage )?limit|RESOURCE_EXHAUSTED\b/i
  ],
  MODEL_UNAVAILABLE: [
    /\bmodel\b.*?\b(?:not found|not available|unavailable|does not exist|unsupported)\b|\bunknown model\b/i
  ],
  NETWORK_ERROR: [
    /\b(?:ENOTFOUND|ECONNRESET|ECONNREFUSED|ETIMEDOUT|EAI_AGAIN|fetch failed|socket hang up|network error)\b/i
  ],
  PROVIDER_ERROR: [
    /\b(?:HTTP(?:\/\d(?:\.\d)?)?|status|error|code)\W{0,3}(?:500|502|503|504|529)\b/i,
    /\b(?:500|502|503|504|529)\W{0,3}(?:Internal Server Error|Bad Gateway|Service Unavailable|Gateway Time-?out|Overloaded)\b/i,
    /\bprovider error|service unavailable|overloaded_error|(?:server|model|api|service)(?: is)? overloaded\b/i
  ]
};

const ERROR_TEXT = new RegExp(
  Object.values(ERROR_PATTERNS)
    .flatMap(patterns => patterns.map(p => p.source))
    .join('|'),
  'i'
);

const NO_PUSH = { key: 'url.no-push://blocked.insteadOf', value: '' };
const CRED_ENV_KEYS = ['GH_TOKEN', 'GITHUB_TOKEN', 'GIT_ASKPASS', 'SSH_ASKPASS', 'SSH_AUTH_SOCK'];
const CRED_ENV_SUFFIX = /_(TOKEN|PAT)$/;
const CRED_ENV_NAME = /(^|_)(GH|GITHUB|GIT)(_|$)/;

let HOOKS_ROOT = null;
function hooksRoot() {
  if (!HOOKS_ROOT) HOOKS_ROOT = fs.mkdtempSync(path.join(os.tmpdir(), 'colabs-hooks-'));
  return HOOKS_ROOT;
}
function noHooksPath() {
  return path.join(hooksRoot(), `none-${crypto.randomBytes(8).toString('hex')}`);
}
function gitOpts() {
  return ['-c', 'core.fsmonitor=false', '-c', `core.hooksPath=${noHooksPath()}`];
}
function git(args, cwd = process.cwd(), opts = {}) {
  return spawnSync('git', [...gitOpts(), ...args], {
    cwd,
    encoding: 'utf8',
    windowsHide: true,
    maxBuffer: 1 << 26,
    ...opts
  });
}
function gitIn(dir, args, opts = {}) {
  return git(args, dir, opts);
}

let EMPTY_GLOBAL_CONFIG = null;
function emptyGlobalConfig() {
  if (!EMPTY_GLOBAL_CONFIG) {
    EMPTY_GLOBAL_CONFIG = path.join(hooksRoot(), 'empty-gitconfig');
    fs.writeFileSync(EMPTY_GLOBAL_CONFIG, '');
  }
  return EMPTY_GLOBAL_CONFIG;
}

function gitEnv() {
  return {
    GIT_CONFIG_NOSYSTEM: '1',
    GIT_CONFIG_GLOBAL: emptyGlobalConfig(),
    GIT_TERMINAL_PROMPT: '0',
    GCM_INTERACTIVE: 'never',
    GIT_CONFIG_COUNT: '2',
    GIT_CONFIG_KEY_0: NO_PUSH.key,
    GIT_CONFIG_VALUE_0: NO_PUSH.value,
    GIT_CONFIG_KEY_1: 'credential.helper',
    GIT_CONFIG_VALUE_1: ''
  };
}

function executorEnv(parent = process.env) {
  const out = {};
  for (const key of Object.keys(parent)) {
    const up = key.toUpperCase();
    if (CRED_ENV_KEYS.includes(up)) continue;
    if (CRED_ENV_SUFFIX.test(up) && CRED_ENV_NAME.test(up.replace(CRED_ENV_SUFFIX, ''))) continue;
    out[key] = parent[key];
  }
  Object.assign(out, gitEnv());
  return out;
}

function sleepSync(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

function fileHash(file) {
  try {
    return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
  } catch {
    return 'absent';
  }
}

function parsePorcelainZ(text) {
  const parts = String(text).split('\0').filter(Boolean);
  const out = [];
  for (let i = 0; i < parts.length; i++) {
    const code = parts[i].slice(0, 2);
    const p = parts[i].slice(3).replace(/\\/g, '/');
    out.push({ code, path: p });
    if (/[RC]/.test(code) && parts[i + 1] !== undefined) {
      out.push({ code, path: parts[i + 1].replace(/\\/g, '/') });
      i++;
    }
  }
  return out;
}

function scopeViolations(entries, outputs, baseFiles, hashOf) {
  const base = new Map(baseFiles);
  return entries
    .filter(e => {
      const p = e.path.replace(/\\/g, '/');
      if (outputs.includes(p)) return false;
      if (e.code === '??' && JOURNAL_RE.test(p)) return false;
      if (base.has(p) && base.get(p) === hashOf(p)) return false;
      return true;
    })
    .map(e => e.path.replace(/\\/g, '/'));
}

function workdirState(dir) {
  if (fs.existsSync(path.join(dir, '.git', 'index.lock'))) return null;
  const st = gitIn(dir, ['status', '--porcelain=v1', '-z', '--untracked-files=all']);
  const head = gitIn(dir, ['rev-parse', 'HEAD']);
  const refs = gitIn(dir, ['for-each-ref', '--format=%(refname) %(objectname)']);
  if (st.status !== 0 || head.status !== 0 || refs.status !== 0) return null;
  const gitDir = path.join(dir, '.git');
  let hooks = '';
  try {
    hooks = fs.readdirSync(path.join(gitDir, 'hooks')).sort().map(f => `${f} ${fileHash(path.join(gitDir, 'hooks', f))}`).join('\n');
  } catch {}
  return {
    entries: parsePorcelainZ(st.stdout),
    head: head.stdout.trim(),
    refs: crypto.createHash('sha256').update(refs.stdout).digest('hex'),
    config: fileHash(path.join(gitDir, 'config')),
    hooks: crypto.createHash('sha256').update(hooks).digest('hex')
  };
}

const STATE_RETRIES = [250, 500, 1000, 2000];
function readStateRetried(dir) {
  let st = workdirState(dir);
  for (let i = 0; st === null && i < STATE_RETRIES.length; i++) {
    sleepSync(STATE_RETRIES[i]);
    st = workdirState(dir);
  }
  return st;
}

function gitProcessIn(dir, known = {}) {
  try {
    const json = execFileSync('powershell', ['-NoProfile', '-NonInteractive', '-Command',
      "Get-CimInstance Win32_Process | Where-Object { $_.Name -match '^git' } | Select-Object ProcessId,ParentProcessId,CommandLine | ConvertTo-Json -Compress"],
    { encoding: 'utf8', maxBuffer: 1 << 26, windowsHide: true });
    const parsed = JSON.parse(json || 'null');
    const rows = Array.isArray(parsed) ? parsed : (parsed ? [parsed] : []);
    if (!rows.length) return false;
    const needle = String(dir).toLowerCase();
    const pids = new Set(Object.keys(known || {}).map(Number));
    return rows.some(r => String(r.CommandLine || '').toLowerCase().includes(needle) || pids.has(Number(r.ParentProcessId)));
  } catch {
    return null;
  }
}

function scopeCheck(dir, base, outputs, known = {}) {
  const st = readStateRetried(dir);
  if (!st) {
    if (fs.existsSync(path.join(dir, '.git', 'index.lock'))) {
      const busy = gitProcessIn(dir, known);
      if (busy !== false) return { wait: true };
      return { staleLock: true };
    }
    return { bad: ['git state of the copy cannot be read'] };
  }
  const bad = scopeViolations(st.entries, outputs, base.files, p => fileHash(path.join(dir, p)));
  if (st.head !== base.head) bad.push(`HEAD moved to ${st.head.slice(0, 12)} (a commit or checkout)`);
  if (st.refs !== base.refs) bad.push('refs changed (a branch, tag or ref was created, moved or deleted)');
  if (st.config !== base.config) bad.push('repository config changed (a remote added, or the no-push rule removed)');
  if (st.hooks !== base.hooks) bad.push('git hooks changed');
  return bad.length ? { bad } : null;
}

function prepareWorkdir(slot, attemptNumber, repoRoot, copyInPaths, customTmpDir) {
  const head = git(['rev-parse', 'HEAD'], repoRoot);
  if (head.status !== 0) throw new Error('the checkout HEAD cannot be read');
  const baseTmp = customTmpDir || path.join(os.tmpdir(), 'colabs-dispatch');
  fs.mkdirSync(baseTmp, { recursive: true });
  let dir = null;
  let r = null;
  for (let i = 0; i < 3; i++) {
    dir = path.join(baseTmp, `${slot.id}-${attemptNumber}-${Date.now().toString(36)}-${i}`);
    r = git(['clone', '--shared', '--no-checkout', '--quiet', repoRoot, dir], baseTmp);
    if (r.status === 0) break;
    try { fs.rmSync(dir, { recursive: true, force: true }); } catch {}
    sleepSync(500);
  }
  if (!r || r.status !== 0) throw new Error(`git clone failed: ${(r && r.stderr) || ''}`);
  gitIn(dir, ['checkout', '--quiet', '--detach', head.stdout.trim()]);
  const remotesRes = gitIn(dir, ['remote']);
  for (const rem of (remotesRes.stdout || '').split(/\r?\n/).filter(Boolean)) {
    gitIn(dir, ['remote', 'remove', rem]);
  }
  gitIn(dir, ['config', NO_PUSH.key, NO_PUSH.value]);
  for (const cp of (copyInPaths || [slot.launch])) {
    const src = path.resolve(repoRoot, cp);
    if (fs.existsSync(src)) {
      const dst = path.resolve(dir, cp);
      fs.mkdirSync(path.dirname(dst), { recursive: true });
      fs.copyFileSync(src, dst);
    }
  }
  const st = workdirState(dir);
  if (!st) throw new Error('git state of the new copy cannot be read');
  return {
    dir,
    base: {
      head: st.head,
      refs: st.refs,
      config: st.config,
      hooks: st.hooks,
      files: st.entries.map(e => [e.path, fileHash(path.join(dir, e.path))])
    }
  };
}

function importResults(dir, outputs, repoRoot) {
  const st = workdirState(dir);
  const journals = st ? st.entries.filter(e => e.code === '??' && JOURNAL_RE.test(e.path)).map(e => e.path) : [];
  const copied = [];
  for (const f of [...outputs, ...journals]) {
    const src = path.join(dir, f);
    if (!fs.existsSync(src)) continue;
    const dest = path.join(repoRoot, f);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
    copied.push(f);
  }
  return copied;
}

function dropWorkdir(dir) {
  for (let i = 0; i < 3; i++) {
    try { fs.rmSync(dir, { recursive: true, force: true, maxRetries: 3 }); } catch {}
    if (!fs.existsSync(dir)) return true;
    sleepSync(500);
  }
  return !fs.existsSync(dir);
}

function lsRemoteSnapshot(repoRoot) {
  const env = { ...process.env, GIT_TERMINAL_PROMPT: '0', GCM_INTERACTIVE: 'never' };
  const remotesRes = git(['remote'], repoRoot, { timeout: 30000, env });
  if (remotesRes.status !== 0) return { '*': `remotes cannot be listed: ${remotesRes.stderr || 'unknown error'}` };
  const out = {};
  const names = (remotesRes.stdout || '').split(/\r?\n/).filter(Boolean).sort();
  for (const name of names) {
    const r = git(['ls-remote', name], repoRoot, { timeout: 60000, env });
    out[name] = r.status === 0 ? crypto.createHash('sha256').update(r.stdout).digest('hex') : `error: ${r.stderr || 'exit ' + r.status}`;
  }
  return out;
}

function remoteAuditVerdict(before, after) {
  const names = [...new Set([...Object.keys(before || {}), ...Object.keys(after || {})])].sort();
  const incident = [];
  const unverified = [];
  const isErr = v => typeof v === 'string' && v.startsWith('error:');
  for (const n of names) {
    const b = (before || {})[n];
    const a = (after || {})[n];
    if (b === a) continue;
    if (isErr(b) || isErr(a)) unverified.push(`${n}: ${b} -> ${a}`);
    else incident.push(`${n}: ${b} -> ${a}`);
  }
  return { incident, unverified };
}

function checkCommand(cmd) {
  if (!SAFE_CMD.test(cmd)) throw new Error(`unsafe character in command: ${cmd}`);
  if ((cmd.match(/"/g) || []).length % 2) throw new Error(`unbalanced quotes in command: ${cmd}`);
  if (/\\"/.test(cmd)) throw new Error(`backslash before a quote in command: ${cmd}`);
  return cmd;
}

function chunkIsProgress(chunk) {
  return String(chunk).split(/\r?\n/).some(l => l.trim() && !ERROR_TEXT.test(l) && !RETRY_TEXT.test(l));
}

function classifyErrorText(text) {
  if (!text) return null;
  for (const [cls, patterns] of Object.entries(ERROR_PATTERNS)) {
    for (const p of patterns) {
      if (p.test(text)) return cls;
    }
  }
  return null;
}

function procTable() {
  try {
    const json = execFileSync('powershell', ['-NoProfile', '-NonInteractive', '-Command',
      "Get-CimInstance Win32_Process | Select-Object ProcessId,ParentProcessId,KernelModeTime,UserModeTime,@{n='C';e={$_.CreationDate.ToFileTimeUtc()}} | ConvertTo-Json -Compress"],
    { encoding: 'utf8', maxBuffer: 1 << 26, windowsHide: true });
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch {
    return null;
  }
}

function tree(rootPid, rows = procTable()) {
  if (!rows) return null;
  const root = rows.find(r => r.ProcessId === rootPid);
  if (!root) return null;
  const kids = new Map();
  for (const r of rows) {
    if (!kids.has(r.ParentProcessId)) kids.set(r.ParentProcessId, []);
    kids.get(r.ParentProcessId).push(r);
  }
  const procs = [];
  const stack = [root];
  const seen = new Set([rootPid]);
  while (stack.length) {
    const p = stack.pop();
    for (const c of kids.get(p.ProcessId) || []) {
      if (seen.has(c.ProcessId) || Number(c.C) < Number(p.C)) continue;
      seen.add(c.ProcessId);
      procs.push({ pid: c.ProcessId, created: Number(c.C) });
      stack.push(c);
    }
  }
  return { root, procs, allPids: [rootPid, ...procs.map(x => x.pid)] };
}

function isPidAlive(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch (e) {
    return e.code === 'EPERM';
  }
}

function killExact(pid) {
  try {
    execFileSync('taskkill', ['/PID', String(pid), '/F'], { stdio: 'ignore' });
  } catch {}
}

function killTree(rootPid) {
  try {
    execFileSync('taskkill', ['/PID', String(rootPid), '/T', '/F'], { stdio: 'ignore' });
  } catch {
    killExact(rootPid);
  }
}

function takeStartLock(id, stateDir) {
  const locksDir = path.join(stateDir, 'locks');
  fs.mkdirSync(locksDir, { recursive: true });
  const lockFilePath = path.join(locksDir, `${id}.lock`);
  for (let i = 0; i < 2; i++) {
    try {
      const fd = fs.openSync(lockFilePath, 'wx');
      fs.writeSync(fd, JSON.stringify({ starter: process.pid, at: Date.now() }));
      fs.closeSync(fd);
      return true;
    } catch (e) {
      if (e.code !== 'EEXIST') throw e;
      let lock = {};
      try { lock = JSON.parse(fs.readFileSync(lockFilePath, 'utf8')); } catch {}
      const pidAlive = lock.starter ? isPidAlive(lock.starter) : false;
      const fresh = lock.at && (Date.now() - lock.at < 60000);
      if (pidAlive || fresh) return false;
      try { fs.unlinkSync(lockFilePath); } catch {}
    }
  }
  return false;
}

function releaseStartLock(id, stateDir) {
  const lockFilePath = path.join(stateDir, 'locks', `${id}.lock`);
  try { fs.unlinkSync(lockFilePath); } catch {}
}

function isSafeRelativePath(p) {
  if (typeof p !== 'string' || !p.trim()) return false;
  if (path.isAbsolute(p)) return false;
  if (/^[a-zA-Z]:/.test(p)) return false;
  if (/^\\\\/.test(p)) return false;
  const parts = p.replace(/\\/g, '/').split('/');
  if (parts.some(part => part === '..')) return false;
  if (/["%^&|<>']/.test(p)) return false;
  return true;
}

function validateRegistry(obj) {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
    throw new Error('registry must be an object');
  }
  if (obj.schema !== 'clients/1') {
    throw new Error(`unsupported registry schema "${obj.schema}"`);
  }
  if (!obj.clients || typeof obj.clients !== 'object' || Array.isArray(obj.clients)) {
    throw new Error('registry.clients must be an object');
  }
  for (const [k, v] of Object.entries(obj)) {
    if (k !== 'schema' && k !== 'clients') throw new Error(`unknown registry top-level key "${k}"`);
  }
  const reqKeys = ['binary', 'present', 'version', 'verifiedOn', 'source', 'command', 'model', 'effort', 'env', 'resume', 'usage', 'failureModes'];
  for (const [name, client] of Object.entries(obj.clients)) {
    if (!client || typeof client !== 'object' || Array.isArray(client)) throw new Error(`client "${name}" must be an object`);
    for (const k of Object.keys(client)) {
      if (!reqKeys.includes(k)) throw new Error(`unknown key "${k}" in client "${name}"`);
    }
    for (const k of reqKeys) {
      if (!(k in client)) throw new Error(`missing key "${k}" in client "${name}"`);
    }
    if (typeof client.binary !== 'string') throw new Error(`client "${name}".binary must be a string`);
    if (typeof client.present !== 'boolean') throw new Error(`client "${name}".present must be a boolean`);
    if (client.version !== null && typeof client.version !== 'string') throw new Error(`client "${name}".version must be string or null`);
    if (typeof client.verifiedOn !== 'string') throw new Error(`client "${name}".verifiedOn must be string`);
    if (typeof client.source !== 'string') throw new Error(`client "${name}".source must be string`);
    if (!Array.isArray(client.command)) throw new Error(`client "${name}".command must be an array`);
    if (!client.model || typeof client.model !== 'object') throw new Error(`client "${name}".model must be an object`);
    if (!client.effort || typeof client.effort !== 'object') throw new Error(`client "${name}".effort must be an object`);
    if (!client.env || typeof client.env !== 'object') throw new Error(`client "${name}".env must be an object`);
    if (!client.resume || typeof client.resume !== 'object') throw new Error(`client "${name}".resume must be an object`);
    if (typeof client.usage !== 'string') throw new Error(`client "${name}".usage must be a string`);
    if (!Array.isArray(client.failureModes)) throw new Error(`client "${name}".failureModes must be an array`);
  }
  return obj;
}

function loadRegistry(filePath = null) {
  const regPath = filePath || path.resolve(__dirname, '..', 'docs', 'clients.json');
  let raw = '';
  try {
    raw = fs.readFileSync(regPath, 'utf8');
  } catch (e) {
    throw new Error(`cannot read registry file "${regPath}": ${e.message}`);
  }
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    throw new Error(`registry file "${regPath}" is not valid JSON: ${e.message}`);
  }
  return validateRegistry(parsed);
}

function validateDispatch(obj) {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
    throw new Error('dispatch must be a JSON object');
  }
  const allowedTopKeys = ['version', 'stateDir', 'usageFile', 'startLimitMin', 'stallMin', 'hardMin', 'runLimitHours', 'slots', 'jobs'];
  for (const k of Object.keys(obj)) {
    if (!allowedTopKeys.includes(k)) throw new Error(`unknown top-level key "${k}"`);
  }
  if (obj.stallMin !== undefined) {
    if (typeof obj.stallMin !== 'number' || !Number.isInteger(obj.stallMin) || obj.stallMin < 5 || obj.stallMin > 120) {
      throw new Error(`stallMin must be an integer between 5 and 120; got ${obj.stallMin}`);
    }
  }
  if (obj.hardMin !== undefined) {
    if (typeof obj.hardMin !== 'number' || !Number.isInteger(obj.hardMin) || obj.hardMin < 10 || obj.hardMin > 720) {
      throw new Error(`hardMin must be an integer between 10 and 720; got ${obj.hardMin}`);
    }
  }
  const slotsRaw = obj.slots || obj.jobs;
  if (!Array.isArray(slotsRaw) || !slotsRaw.length) {
    throw new Error('dispatch must contain a non-empty slots array');
  }
  const allowedSlotKeys = ['id', 'frame', 'out', 'outputs', 'launch', 'copyIn', 'needs', 'when', 'adopted', 'route', 'fallback', 'git'];
  for (const s of slotsRaw) {
    if (!s || typeof s !== 'object' || Array.isArray(s)) throw new Error('slot must be an object');
    for (const k of Object.keys(s)) {
      if (!allowedSlotKeys.includes(k)) throw new Error(`unknown slot key "${k}" in slot "${s.id}"`);
    }
    if (!s.id || typeof s.id !== 'string') throw new Error('slot.id must be a non-empty string');
    if (!s.launch || typeof s.launch !== 'string') throw new Error(`slot "${s.id}" missing launch path`);
    if (!isSafeRelativePath(s.launch)) throw new Error(`slot "${s.id}" unsafe launch path: "${s.launch}"`);
    if (s.out && !isSafeRelativePath(s.out)) throw new Error(`slot "${s.id}" unsafe out path: "${s.out}"`);
    if (s.outputs) {
      if (!Array.isArray(s.outputs)) throw new Error(`slot "${s.id}".outputs must be an array`);
      for (const p of s.outputs) {
        if (!isSafeRelativePath(p)) throw new Error(`slot "${s.id}" unsafe output path: "${p}"`);
      }
    }
    if (s.copyIn) {
      if (!Array.isArray(s.copyIn)) throw new Error(`slot "${s.id}".copyIn must be an array`);
      for (const p of s.copyIn) {
        if (!isSafeRelativePath(p)) throw new Error(`slot "${s.id}" unsafe copyIn path: "${p}"`);
      }
    }
    if (s.when) {
      if (typeof s.when !== 'object') throw new Error(`slot "${s.id}".when must be an object`);
      if (s.when.file && !isSafeRelativePath(s.when.file)) throw new Error(`slot "${s.id}" unsafe when.file path: "${s.when.file}"`);
    }
    if (s.git) {
      if (typeof s.git !== 'object') throw new Error(`slot "${s.id}".git must be an object`);
      if (s.git.mode === 'BRANCH_PUSH' || s.git.mode === 'RELEASE_PUSH') {
        throw new Error('no publisher exists');
      }
    }
  }
  return obj;
}

function loadDispatch(filePath) {
  let raw = '';
  try {
    raw = fs.readFileSync(filePath, 'utf8');
  } catch (e) {
    throw new Error(`cannot read dispatch file "${filePath}": ${e.message}`);
  }
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    throw new Error(`dispatch file "${filePath}" is not valid JSON: ${e.message}`);
  }
  return validateDispatch(parsed);
}

function buildClientCommand(clientCfg, route, tokens) {
  const parts = [];
  const expand = tok => {
    let s = tok;
    for (const [k, v] of Object.entries(tokens)) {
      if (v !== undefined && v !== null) {
        s = s.replaceAll(`{${k}}`, String(v));
      }
    }
    return s;
  };
  for (const item of clientCfg.command) {
    if (typeof item === 'string') {
      parts.push(expand(item));
    } else if (item && typeof item === 'object' && item.if) {
      if (route && route[item.if]) {
        for (const a of item.args || []) {
          parts.push(expand(a));
        }
      }
    }
  }
  return parts;
}

function formatCommandLine(tokens) {
  return tokens.map(t => {
    if (/[\s"]/.test(t)) {
      return `"${t.replace(/"/g, '\\"')}"`;
    }
    return t;
  }).join(' ');
}

function probeClient(clientName, registry, options = {}) {
  const clientCfg = registry.clients[clientName];
  if (!clientCfg) return { ok: false, state: 'UNKNOWN_CLIENT', rows: [`PROBE client=${clientName} state=UNKNOWN_CLIENT`] };
  const rows = [];
  let verOutput = null;
  try {
    const raw = execFileSync(clientCfg.binary, ['--version'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true, shell: true });
    verOutput = String(raw || '').trim().split(/\r?\n/)[0].trim();
  } catch {
    rows.push(`PROBE client=${clientName} state=ABSENT`);
    return { ok: false, state: 'ABSENT', rows };
  }
  if (clientCfg.version && verOutput !== clientCfg.version) {
    rows.push(`PROBE client=${clientName} state=VERSION_CHANGED expected="${clientCfg.version}" actual="${verOutput}"`);
    return { ok: false, state: 'VERSION_CHANGED', rows };
  }
  rows.push(`PROBE client=${clientName} state=OK version="${verOutput}"`);

  if (options.model && clientCfg.model && clientCfg.model.listing) {
    try {
      const listCmd = clientCfg.model.listing[0];
      const listArgs = clientCfg.model.listing.slice(1);
      const listOut = execFileSync(listCmd, listArgs, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true, shell: true });
      if (listOut.includes(options.model)) {
        rows.push(`PROBE client=${clientName} model=${options.model} state=OK`);
      } else {
        rows.push(`PROBE client=${clientName} model=${options.model} state=MODEL_UNAVAILABLE`);
        return { ok: false, state: 'MODEL_UNAVAILABLE', rows };
      }
    } catch (e) {
      rows.push(`PROBE client=${clientName} model=${options.model} state=MODEL_UNAVAILABLE error="${e.message}"`);
      return { ok: false, state: 'MODEL_UNAVAILABLE', rows };
    }
  }
  return { ok: true, state: 'OK', rows };
}

function probeAll(registry, options = {}, clientFilter = []) {
  const clients = clientFilter.length ? clientFilter : Object.keys(registry.clients);
  let allOk = true;
  const rows = [];
  for (const c of clients) {
    const res = probeClient(c, registry, options);
    if (!res.ok) allOk = false;
    rows.push(...res.rows);
  }
  return { ok: allOk, rows };
}

function executeAttempt(slot, attemptNumber, dispatch, registry, opts = {}) {
  const repoRoot = opts.repoRoot || process.cwd();
  const stateDir = path.resolve(repoRoot, dispatch.stateDir || '.ai/runtime/dispatch');
  fs.mkdirSync(stateDir, { recursive: true });
  const logsDir = path.join(stateDir, 'logs');
  fs.mkdirSync(logsDir, { recursive: true });

  const route = slot.route;
  if (!route) {
    return Promise.resolve({ status: 'FAILED', class: 'CONFIG_ERROR', reason: 'no-route' });
  }
  const clientName = route.client;
  const clientCfg = registry.clients[clientName];
  if (!clientCfg) {
    return Promise.resolve({ status: 'FAILED', class: 'CONFIG_ERROR', reason: `unknown client ${clientName}` });
  }

  const probeRes = probeClient(clientName, registry, { model: route.model });
  if (!probeRes.ok) {
    const cls = probeRes.state === 'MODEL_UNAVAILABLE' ? 'MODEL_UNAVAILABLE' : 'CONFIG_ERROR';
    return Promise.resolve({ status: 'FAILED', class: cls, reason: probeRes.state });
  }

  let prepared;
  try {
    prepared = prepareWorkdir(slot, attemptNumber, repoRoot, slot.copyIn, opts.tmpDir);
  } catch (e) {
    return Promise.resolve({ status: 'FAILED', class: 'CONFIG_ERROR', reason: `prepareWorkdir failed: ${e.message}` });
  }
  const { dir, base } = prepared;

  const declaredOutputs = [];
  if (slot.out) declaredOutputs.push(slot.out.replace(/\\/g, '/'));
  if (slot.outputs) {
    for (const p of slot.outputs) declaredOutputs.push(p.replace(/\\/g, '/'));
  }

  const logFilePath = path.join(logsDir, `${slot.id}-${attemptNumber}.log`);
  const logFd = fs.openSync(logFilePath, 'a');

  const launchRel = slot.launch.replace(/\\/g, '/');
  const message = `Read and follow the file ${launchRel}`;

  const tokens = {
    message,
    model: route.model || '',
    effort: route.effort || '',
    workdir: dir,
    title: slot.id,
    logdir: path.join(logsDir, `${slot.id}-log`)
  };

  const cmdTokens = buildClientCommand(clientCfg, route, tokens);
  const cmdString = formatCommandLine(cmdTokens);
  try {
    checkCommand(cmdString);
  } catch (e) {
    fs.closeSync(logFd);
    dropWorkdir(dir);
    return Promise.resolve({ status: 'BLOCKED', class: 'POLICY_FAILURE', reason: e.message });
  }

  const env = executorEnv();
  if (clientCfg.env) Object.assign(env, clientCfg.env);

  const auditBefore = lsRemoteSnapshot(repoRoot);

  const stallSeconds = opts.stallSeconds || (dispatch.stallMin ? dispatch.stallMin * 60 : 600);
  const hardSeconds = opts.hardSeconds || (dispatch.hardMin ? dispatch.hardMin * 60 : 7200);

  const knownProcs = {};
  const startTime = Date.now();
  let lastProgressAt = startTime;
  let usefulWork = false;
  let lastLogSize = 0;
  let childExited = false;
  let childExitCode = null;
  let failureClass = null;
  let failureReason = null;

  return new Promise((resolve) => {
    const child = spawn(cmdString, {
      cwd: dir,
      env,
      shell: true,
      stdio: ['ignore', logFd, logFd],
      windowsHide: true
    });

    knownProcs[child.pid] = Date.now();

    const getLogSize = () => {
      try { return fs.fstatSync(logFd).size; } catch { return 0; }
    };
    const getLogTail = (bytes = 4096) => {
      try {
        const sz = getLogSize();
        const readLen = Math.min(sz, bytes);
        const buf = Buffer.alloc(readLen);
        fs.readSync(logFd, buf, 0, readLen, sz - readLen);
        return buf.toString('utf8');
      } catch { return ''; }
    };

    const tickInterval = Math.max(100, Math.min(15000, Math.floor(stallSeconds * 250)));

    const timer = setInterval(() => {
      const curTime = Date.now();
      const curLogSize = getLogSize();
      let madeProgress = false;

      if (curLogSize > lastLogSize) {
        const diffBytes = curLogSize - lastLogSize;
        const buf = Buffer.alloc(diffBytes);
        try {
          fs.readSync(logFd, buf, 0, diffBytes, lastLogSize);
          if (chunkIsProgress(buf.toString('utf8'))) {
            madeProgress = true;
          }
        } catch {}
        lastLogSize = curLogSize;
      }

      const stNow = workdirState(dir);
      if (stNow) {
        const changedOutputs = declaredOutputs.some(f => fs.existsSync(path.join(dir, f)) && fs.statSync(path.join(dir, f)).size > 0);
        const hasJournals = stNow.entries.some(e => e.code === '??' && JOURNAL_RE.test(e.path));
        if (changedOutputs || hasJournals) {
          usefulWork = true;
          madeProgress = true;
        }
      }

      if (curLogSize >= 16384) {
        usefulWork = true;
      }

      if (madeProgress) {
        lastProgressAt = curTime;
      } else {
        if ((curTime - lastProgressAt) >= stallSeconds * 1000) {
          failureClass = 'STALL';
          failureReason = `no progress for ${stallSeconds} seconds`;
          clearInterval(timer);
          killTree(child.pid);
          cleanupAndResolve();
          return;
        }
        if ((curTime - startTime) >= hardSeconds * 1000) {
          failureClass = 'TIMEOUT';
          failureReason = `elapsed time reached hardMin limit of ${hardSeconds} seconds`;
          clearInterval(timer);
          killTree(child.pid);
          cleanupAndResolve();
          return;
        }
      }
    }, tickInterval);

    function cleanupAndResolve() {
      if (childExited) return;
      childExited = true;
      clearInterval(timer);
      try { fs.closeSync(logFd); } catch {}
      const endTime = Date.now();
      const wallMinutes = Math.max(0, Number(((endTime - startTime) / 60000).toFixed(2)));

      if (failureClass === 'STALL' || failureClass === 'TIMEOUT') {
        dropWorkdir(dir);
        return resolve({
          status: 'FAILED',
          class: failureClass,
          reason: failureReason,
          wallMinutes,
          useful: usefulWork,
          attemptNumber
        });
      }

      const logText = getLogTail(16384);

      if (childExitCode === 0) {
        const missingOutputs = declaredOutputs.filter(f => !fs.existsSync(path.join(dir, f)) || fs.statSync(path.join(dir, f)).size === 0);
        if (missingOutputs.length) {
          dropWorkdir(dir);
          return resolve({
            status: 'FAILED',
            class: 'INVALID_OUTPUT',
            reason: `declared outputs missing or empty: ${missingOutputs.join(', ')}`,
            wallMinutes,
            useful: usefulWork,
            attemptNumber
          });
        }
      } else {
        const identifiedClass = classifyErrorText(logText);
        const cls = identifiedClass || 'PROCESS_CRASH';
        dropWorkdir(dir);
        return resolve({
          status: 'FAILED',
          class: cls,
          reason: `process exited with code ${childExitCode}`,
          wallMinutes,
          useful: usefulWork,
          attemptNumber
        });
      }

      const sc = scopeCheck(dir, base, declaredOutputs, knownProcs);
      if (sc && sc.bad) {
        return resolve({
          status: 'BLOCKED',
          class: 'POLICY_FAILURE',
          reason: `SCOPE_STOP: ${sc.bad.join('; ')}`,
          workdirKept: dir,
          wallMinutes,
          useful: usefulWork,
          attemptNumber
        });
      }

      const auditAfter = lsRemoteSnapshot(repoRoot);
      const auditVerdict = remoteAuditVerdict(auditBefore, auditAfter);
      if (auditVerdict.incident.length) {
        return resolve({
          status: 'BLOCKED',
          class: 'POLICY_FAILURE',
          reason: `REMOTE_INCIDENT: ${auditVerdict.incident.join('; ')}`,
          workdirKept: dir,
          wallMinutes,
          useful: usefulWork,
          attemptNumber
        });
      }

      const imported = importResults(dir, declaredOutputs, repoRoot);
      dropWorkdir(dir);

      return resolve({
        status: 'DONE',
        class: null,
        reason: null,
        imported,
        wallMinutes,
        useful: true,
        attemptNumber
      });
    }

    child.on('exit', (code, signal) => {
      childExitCode = code !== null ? code : (signal ? -1 : 0);
      cleanupAndResolve();
    });

    child.on('error', (err) => {
      childExitCode = -1;
      failureClass = 'CONFIG_ERROR';
      failureReason = `spawn error: ${err.message}`;
      cleanupAndResolve();
    });
  });
}

function updateUsageFile(usageFilePath, slot, route, attemptResult) {
  if (!usageFilePath) return;
  try {
    fs.mkdirSync(path.dirname(usageFilePath), { recursive: true });
    let existing = '';
    if (fs.existsSync(usageFilePath)) {
      existing = fs.readFileSync(usageFilePath, 'utf8');
    } else {
      existing = '| slot | agent | model | effort | in_tok | out_tok | cost | turns | time_m | retries | err | status |\n| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |\n';
    }
    const agent = (slot.frame && slot.frame.split('-')[1]) || 'unknown';
    const model = route.model || 'none';
    const effort = route.effort || 'none';
    const timeM = attemptResult.wallMinutes !== undefined ? attemptResult.wallMinutes : 0;
    const retries = (attemptResult.attemptNumber || 1) - 1;
    const err = attemptResult.class || 0;
    const status = attemptResult.status;
    const row = `| ${slot.id} | ${agent} | ${model} | ${effort} | 0 | 0 | 0.00 | 0 | ${timeM} | ${retries} | ${err} | ${status} |\n`;
    fs.writeFileSync(usageFilePath, existing + row, 'utf8');
  } catch {}
}

async function runDispatch(dispatchFile, slotsToRun = [], opts = {}) {
  const dispatch = loadDispatch(dispatchFile);
  const registry = loadRegistry(opts.registry);
  const repoRoot = opts.repoRoot || process.cwd();
  const stateDir = path.resolve(repoRoot, dispatch.stateDir || '.ai/runtime/dispatch');
  fs.mkdirSync(stateDir, { recursive: true });
  const stateFile = path.join(stateDir, 'state.json');

  let state = { slots: {} };
  try {
    if (fs.existsSync(stateFile)) state = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
  } catch {}

  const slotsList = dispatch.slots || dispatch.jobs;
  const targetSlots = slotsToRun.length
    ? slotsList.filter(s => slotsToRun.includes(s.id))
    : slotsList;

  let anyFailed = false;

  for (const slot of targetSlots) {
    if (slot.when) {
      const whenFile = path.resolve(repoRoot, slot.when.file);
      if (fs.existsSync(whenFile)) {
        const content = fs.readFileSync(whenFile, 'utf8');
        if (slot.when.notMatch && new RegExp(slot.when.notMatch).test(content)) {
          console.log(`SKIP slot=${slot.id} reason=when-matched`);
          state.slots[slot.id] = { status: 'SKIPPED', route: slot.route };
          fs.writeFileSync(stateFile, JSON.stringify(state, null, 2), 'utf8');
          continue;
        }
      }
    }

    if (slot.needs && slot.needs.length) {
      const unmet = slot.needs.filter(reqId => {
        const cur = state.slots[reqId];
        return !cur || cur.status !== 'DONE';
      });
      if (unmet.length) {
        console.log(`WAIT slot=${slot.id} reason=needs waiting="${unmet.join(',')}"`);
        anyFailed = true;
        continue;
      }
    }

    const locked = takeStartLock(slot.id, stateDir);
    if (!locked) {
      console.log(`ERROR reason=start-lock-held slot=${slot.id}`);
      anyFailed = true;
      continue;
    }

    const slotState = state.slots[slot.id] || { attempts: [] };
    const attemptNum = (slotState.attempts ? slotState.attempts.length : 0) + 1;

    console.log(`RUN slot=${slot.id} attempt=${attemptNum} route=${slot.route.client}:${slot.route.model || ''}`);

    const res = await executeAttempt(slot, attemptNum, dispatch, registry, {
      repoRoot,
      stallSeconds: opts.stallSeconds,
      hardSeconds: opts.hardSeconds,
      tmpDir: opts.tmpDir
    });

    slotState.attempts = slotState.attempts || [];
    slotState.attempts.push(res);
    slotState.status = res.status;
    slotState.class = res.class;
    slotState.reason = res.reason;
    slotState.route = slot.route;
    state.slots[slot.id] = slotState;

    fs.writeFileSync(stateFile, JSON.stringify(state, null, 2), 'utf8');
    releaseStartLock(slot.id, stateDir);

    if (dispatch.usageFile) {
      updateUsageFile(path.resolve(repoRoot, dispatch.usageFile), slot, slot.route, res);
    }

    if (res.status === 'DONE') {
      console.log(`DONE slot=${slot.id}`);
    } else if (res.status === 'BLOCKED') {
      console.log(`BLOCKED slot=${slot.id} class=${res.class || 'POLICY_FAILURE'} reason="${res.reason}"`);
      anyFailed = true;
    } else {
      console.log(`FAILED slot=${slot.id} class=${res.class || 'UNKNOWN'} reason="${res.reason}"`);
      anyFailed = true;
    }
  }

  return anyFailed ? 1 : 0;
}

function checkDispatch(dispatchFile, opts = {}) {
  const dispatch = loadDispatch(dispatchFile);
  const repoRoot = opts.repoRoot || process.cwd();
  const slots = dispatch.slots || dispatch.jobs;

  console.log(`CHECK dispatch=${dispatchFile} slots=${slots.length}`);

  let missing = 0;
  for (const s of slots) {
    const launchPath = path.resolve(repoRoot, s.launch);
    if (!fs.existsSync(launchPath)) {
      console.log(`ERROR reason=launch-missing slot=${s.id} path=${s.launch}`);
      missing++;
    }
  }

  let noRoute = 0;
  for (const s of slots) {
    if (!s.route) {
      console.log(`ERROR reason=no-route-resolver-not-installed slot=${s.id}`);
      noRoute++;
    }
  }

  if (missing > 0 || noRoute > 0) return 1;
  return 0;
}

function statusDispatch(dispatchFile, opts = {}) {
  const dispatch = loadDispatch(dispatchFile);
  const repoRoot = opts.repoRoot || process.cwd();
  const stateDir = path.resolve(repoRoot, dispatch.stateDir || '.ai/runtime/dispatch');
  const stateFile = path.join(stateDir, 'state.json');
  let state = { slots: {} };
  try {
    if (fs.existsSync(stateFile)) state = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
  } catch {}

  const slots = dispatch.slots || dispatch.jobs;
  for (const s of slots) {
    const cur = state.slots[s.id] || { status: 'NOT_STARTED', attempts: [] };
    const routeStr = s.route ? `${s.route.client}:${s.route.model || ''}` : 'none';
    console.log(`SLOT id=${s.id} status=${cur.status} route=${routeStr} attempts=${cur.attempts ? cur.attempts.length : 0}`);
  }
  return 0;
}

function reportDispatch(dispatchFile, opts = {}) {
  const dispatch = loadDispatch(dispatchFile);
  const repoRoot = opts.repoRoot || process.cwd();
  const stateDir = path.resolve(repoRoot, dispatch.stateDir || '.ai/runtime/dispatch');
  const stateFile = path.join(stateDir, 'state.json');
  let state = { slots: {} };
  try {
    if (fs.existsSync(stateFile)) state = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
  } catch {}

  const slots = dispatch.slots || dispatch.jobs;
  for (const s of slots) {
    const cur = state.slots[s.id] || { status: 'NOT_STARTED', attempts: [] };
    const routeStr = s.route ? `${s.route.client}:${s.route.model || ''}` : 'none';
    const outputs = s.outputs || (s.out ? [s.out] : []);
    console.log(`REPORT slot=${s.id} route=${routeStr} state=${cur.status} attempts=${cur.attempts ? cur.attempts.length : 0} outputs="${outputs.join(',')}" usage=none`);
  }
  return 0;
}

function stopSlot(dispatchFile, slotId, opts = {}) {
  const dispatch = loadDispatch(dispatchFile);
  const repoRoot = opts.repoRoot || process.cwd();
  const stateDir = path.resolve(repoRoot, dispatch.stateDir || '.ai/runtime/dispatch');
  const stateFile = path.join(stateDir, 'state.json');
  let state = { slots: {} };
  try {
    if (fs.existsSync(stateFile)) state = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
  } catch {}

  releaseStartLock(slotId, stateDir);
  const cur = state.slots[slotId] || {};
  cur.status = 'STOPPED';
  state.slots[slotId] = cur;
  try { fs.writeFileSync(stateFile, JSON.stringify(state, null, 2), 'utf8'); } catch {}
  console.log(`STOP slot=${slotId} pids=none`);
  return 0;
}

function acceptSlot(dispatchFile, slotId, reason = 'accepted', opts = {}) {
  const dispatch = loadDispatch(dispatchFile);
  const repoRoot = opts.repoRoot || process.cwd();
  const stateDir = path.resolve(repoRoot, dispatch.stateDir || '.ai/runtime/dispatch');
  const stateFile = path.join(stateDir, 'state.json');
  let state = { slots: {} };
  try {
    if (fs.existsSync(stateFile)) state = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
  } catch {}

  const cur = state.slots[slotId] || {};
  cur.status = 'ACCEPTED';
  cur.acceptedReason = reason;
  state.slots[slotId] = cur;
  try { fs.writeFileSync(stateFile, JSON.stringify(state, null, 2), 'utf8'); } catch {}
  console.log(`ACCEPT slot=${slotId} reason="${reason}"`);
  return 0;
}

async function main(argv) {
  if (!argv || !argv.length) {
    console.log('USAGE command=[probe|check|run|start|status|stop|accept|report]');
    return 2;
  }

  const cmd = argv[0];
  const rest = argv.slice(1);

  let registryPath = null;
  let modelArg = null;
  let smokeArg = null;
  let stallSec = null;
  let hardSec = null;
  const positional = [];

  for (let i = 0; i < rest.length; i++) {
    const a = rest[i];
    if (a === '--registry') {
      registryPath = rest[++i];
      if (!registryPath || registryPath.startsWith('--')) {
        console.log('ERROR reason=missing-flag-value flag=--registry');
        return 2;
      }
    } else if (a === '--model') {
      modelArg = rest[++i];
      if (!modelArg || modelArg.startsWith('--')) {
        console.log('ERROR reason=missing-flag-value flag=--model');
        return 2;
      }
    } else if (a === '--smoke') {
      smokeArg = rest[++i];
      if (!smokeArg || smokeArg.startsWith('--')) {
        console.log('ERROR reason=missing-flag-value flag=--smoke');
        return 2;
      }
    } else if (a === '--stall-seconds') {
      const v = rest[++i];
      const n = Number(v);
      if (!v || isNaN(n) || n <= 0) {
        console.log('ERROR reason=invalid-number flag=--stall-seconds');
        return 2;
      }
      stallSec = n;
    } else if (a === '--hard-seconds') {
      const v = rest[++i];
      const n = Number(v);
      if (!v || isNaN(n) || n <= 0) {
        console.log('ERROR reason=invalid-number flag=--hard-seconds');
        return 2;
      }
      hardSec = n;
    } else if (a.startsWith('--')) {
      console.log(`ERROR reason=unknown-flag flag=${a}`);
      return 2;
    } else {
      positional.push(a);
    }
  }

  try {
    switch (cmd) {
      case 'probe': {
        const reg = loadRegistry(registryPath);
        const res = probeAll(reg, { model: modelArg, smoke: smokeArg }, positional);
        for (const line of res.rows) console.log(line);
        return res.ok ? 0 : 1;
      }
      case 'check': {
        if (!positional.length) {
          console.log('ERROR reason=missing-dispatch-file');
          return 2;
        }
        return checkDispatch(positional[0], { registry: registryPath });
      }
      case 'run': {
        if (!positional.length) {
          console.log('ERROR reason=missing-dispatch-file');
          return 2;
        }
        const dispatchFile = positional[0];
        const slotIds = positional.slice(1);
        return await runDispatch(dispatchFile, slotIds, {
          registry: registryPath,
          stallSeconds: stallSec,
          hardSeconds: hardSec
        });
      }
      case 'start': {
        if (!positional.length) {
          console.log('ERROR reason=missing-dispatch-file');
          return 2;
        }
        const dispatchFile = positional[0];
        const slotIds = positional.slice(1);
        const sub = spawn(process.execPath, [__filename, 'run', dispatchFile, ...slotIds], {
          detached: true,
          stdio: 'ignore',
          windowsHide: true
        });
        sub.unref();
        console.log(`START dispatch=${dispatchFile} pid=${sub.pid}`);
        return 0;
      }
      case 'status': {
        if (!positional.length) {
          console.log('ERROR reason=missing-dispatch-file');
          return 2;
        }
        return statusDispatch(positional[0], { registry: registryPath });
      }
      case 'stop': {
        if (positional.length < 2) {
          console.log('ERROR reason=missing-stop-arguments');
          return 2;
        }
        return stopSlot(positional[0], positional[1], { registry: registryPath });
      }
      case 'accept': {
        if (positional.length < 2) {
          console.log('ERROR reason=missing-accept-arguments');
          return 2;
        }
        const reason = positional.slice(2).join(' ') || 'accepted';
        return acceptSlot(positional[0], positional[1], reason, { registry: registryPath });
      }
      case 'report': {
        if (!positional.length) {
          console.log('ERROR reason=missing-dispatch-file');
          return 2;
        }
        return reportDispatch(positional[0], { registry: registryPath });
      }
      default: {
        console.log(`ERROR reason=unknown-command command=${cmd}`);
        return 2;
      }
    }
  } catch (e) {
    console.log(`ERROR reason=execution-error message="${e.message}"`);
    return 2;
  }
}

if (require.main === module) {
  main(process.argv.slice(2)).then(code => {
    if (code !== null && code !== undefined) process.exitCode = code;
  }).catch(() => {
    process.exitCode = 2;
  });
}

module.exports = {
  main,
  loadRegistry,
  validateRegistry,
  loadDispatch,
  validateDispatch,
  buildClientCommand,
  formatCommandLine,
  probeClient,
  probeAll,
  prepareWorkdir,
  dropWorkdir,
  scopeCheck,
  scopeViolations,
  importResults,
  lsRemoteSnapshot,
  remoteAuditVerdict,
  workdirState,
  readStateRetried,
  gitProcessIn,
  parsePorcelainZ,
  executorEnv,
  gitEnv,
  gitOpts,
  git,
  gitIn,
  takeStartLock,
  releaseStartLock,
  checkCommand,
  chunkIsProgress,
  classifyErrorText,
  tree,
  killExact,
  killTree,
  isPidAlive,
  FAILURE_CLASSES,
  ERROR_PATTERNS,
  ERROR_TEXT,
  RETRY_TEXT,
  NO_PUSH
};
