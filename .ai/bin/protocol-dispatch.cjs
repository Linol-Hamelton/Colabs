'use strict';

const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const crypto = require('node:crypto');
const { spawn, spawnSync, execFileSync } = require('node:child_process');

let runrecordLib = null;
try {
  runrecordLib = require('./protocol-runrecord.cjs');
} catch {}

const JOURNAL_RE = /^\.ai\/worklog\/[a-z][a-z0-9]*-[0-9a-f]{16}\.md$/;
const SAFE_CMD = /^[^%^&|<>']*$/;
const RETRY_TEXT = /\bretry(?:ing)?\b|\bretries\b|\bbacking off\b|\bwaiting \d+(?:\.\d+)? ?(?:ms|s|sec|seconds?)\b/i;

const POINTER_PREFIX = 'Read and follow the file ';
function makePointer(target) {
  return `${POINTER_PREFIX}${target.replace(/\\/g, '/')}`;
}

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

function getRepoRoot(opts = {}) {
  return opts.repoRoot || process.env.PROTOCOL_REPO_ROOT || process.cwd();
}

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
  const env = { ...process.env };
  env.GIT_CONFIG_GLOBAL = emptyGlobalConfig();
  env.GIT_CONFIG_SYSTEM = emptyGlobalConfig();
  env.GIT_CONFIG_NOSYSTEM = '1';
  return env;
}

function executorEnv(parentEnv = process.env) {
  const env = { ...parentEnv };
  for (const k of Object.keys(env)) {
    if (CRED_ENV_KEYS.includes(k) || CRED_ENV_SUFFIX.test(k) || CRED_ENV_NAME.test(k)) {
      delete env[k];
    }
  }
  env.GIT_CONFIG_GLOBAL = emptyGlobalConfig();
  env.GIT_CONFIG_SYSTEM = emptyGlobalConfig();
  env.GIT_CONFIG_NOSYSTEM = '1';
  return env;
}

function isPidAlive(pid) {
  if (!pid || typeof pid !== 'number') return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch (e) {
    return e.code === 'EPERM';
  }
}

function killExact(pid) {
  if (!pid) return;
  try {
    process.kill(pid, 'SIGKILL');
  } catch {}
}

function killTree(pid) {
  if (!pid) return;
  if (process.platform === 'win32') {
    try {
      execFileSync('taskkill', ['/F', '/T', '/PID', String(pid)], {
        stdio: 'ignore',
        windowsHide: true
      });
    } catch {}
  } else {
    try {
      const pids = tree(pid);
      for (const p of pids.reverse()) {
        try { process.kill(p, 'SIGKILL'); } catch {}
      }
    } catch {
      killExact(pid);
    }
  }
}

function tree(rootPid) {
  const res = [];
  if (process.platform === 'win32') return [rootPid];
  try {
    const raw = execFileSync('pgrep', ['-P', String(rootPid)], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
    const children = raw.trim().split(/\s+/).filter(Boolean).map(Number);
    for (const c of children) {
      res.push(...tree(c));
    }
  } catch {}
  res.push(rootPid);
  return res;
}

function parsePorcelainZ(buf) {
  const entries = [];
  let i = 0;
  while (i < buf.length) {
    const nextZero = buf.indexOf(0, i);
    if (nextZero === -1) break;
    const header = buf.toString('utf8', i, nextZero);
    i = nextZero + 1;
    if (!header) continue;
    const code = header.substring(0, 2);
    let p = header.substring(3);
    if (code.startsWith('R') || code.startsWith('C')) {
      const origZero = buf.indexOf(0, i);
      if (origZero !== -1) {
        i = origZero + 1;
      }
    }
    entries.push({ code, path: p.replace(/\\/g, '/') });
  }
  return entries;
}

function gitProcessIn(dir, args) {
  return spawnSync('git', [...gitOpts(), ...args], {
    cwd: dir,
    windowsHide: true,
    maxBuffer: 1 << 26
  });
}

function readStateRetried(dir, retries = 3) {
  for (let attempt = 0; attempt < retries; attempt++) {
    const r = gitProcessIn(dir, ['status', '--porcelain=v1', '-z', '--untracked-files=all']);
    if (r.status === 0 && Buffer.isBuffer(r.stdout)) {
      return parsePorcelainZ(r.stdout);
    }
    const sleepMs = 50 * Math.pow(2, attempt);
    const end = Date.now() + sleepMs;
    while (Date.now() < end) {}
  }
  return null;
}

function workdirState(dir) {
  const entries = readStateRetried(dir);
  if (!entries) return null;
  return { entries };
}

function prepareWorkdir(slot, attemptNumber, repoRoot = getRepoRoot(), copyIn = [], tmpDir = null) {
  const baseDir = tmpDir || os.tmpdir();
  const dir = fs.mkdtempSync(path.join(baseDir, `disp-${slot.id}-${attemptNumber}-`));
  const rClone = gitIn(repoRoot, ['clone', '--shared', '--no-checkout', repoRoot, dir]);
  if (rClone.status !== 0) {
    dropWorkdir(dir);
    throw new Error(`git clone failed: ${rClone.stderr || rClone.stdout}`);
  }
  const rCo = gitIn(dir, ['checkout', 'HEAD']);
  if (rCo.status !== 0) {
    dropWorkdir(dir);
    throw new Error(`git checkout failed: ${rCo.stderr || rCo.stdout}`);
  }
  gitIn(dir, ['config', NO_PUSH.key, NO_PUSH.value]);

  const base = gitIn(dir, ['rev-parse', 'HEAD']).stdout.trim();

  if (Array.isArray(copyIn)) {
    for (const rel of copyIn) {
      const src = path.resolve(repoRoot, rel);
      const dst = path.resolve(dir, rel);
      if (fs.existsSync(src)) {
        fs.mkdirSync(path.dirname(dst), { recursive: true });
        fs.copyFileSync(src, dst);
      }
    }
  }

  return { dir, base };
}

function dropWorkdir(dir) {
  if (!dir) return;
  try {
    fs.rmSync(dir, { recursive: true, force: true });
  } catch {}
}

function scopeViolations(dir, baseHead, declaredOutputs) {
  const bad = [];
  const rRev = gitIn(dir, ['rev-parse', 'HEAD']);
  const curHead = (rRev.stdout || '').trim();
  if (curHead !== baseHead) {
    bad.push(`HEAD changed from ${baseHead} to ${curHead}`);
  }

  const rRemotes = gitIn(dir, ['remote', '-v']);
  const remoteLines = (rRemotes.stdout || '').trim().split(/\r?\n/).filter(Boolean);
  for (const line of remoteLines) {
    const parts = line.split(/\s+/);
    if (parts[0] !== 'origin') {
      bad.push(`unauthorized remote added: ${parts[0]}`);
    }
  }

  const rCfg = gitIn(dir, ['config', '--get', NO_PUSH.key]);
  if ((rCfg.stdout || '').trim() !== NO_PUSH.value) {
    bad.push(`push prevention config ${NO_PUSH.key} altered`);
  }

  const st = workdirState(dir);
  if (!st) {
    bad.push('failed to read git status');
    return bad;
  }

  const allowedOutputs = (declaredOutputs || []).map(p => p.replace(/\\/g, '/'));
  for (const e of st.entries) {
    const norm = e.path.replace(/\\/g, '/');
    if (allowedOutputs.includes(norm)) continue;
    if (JOURNAL_RE.test(norm)) continue;
    bad.push(`unauthorized file touched: ${norm} (${e.code})`);
  }

  return bad;
}

function scopeCheck(dir, baseHead, declaredOutputs, knownProcs = {}) {
  const bad = scopeViolations(dir, baseHead, declaredOutputs);
  return { bad: bad.length ? bad : null };
}

function importResults(dir, declaredOutputs, repoRoot = getRepoRoot()) {
  const imported = [];
  const declaredNorm = (declaredOutputs || []).map(p => p.replace(/\\/g, '/'));

  for (const p of declaredNorm) {
    const src = path.resolve(dir, p);
    if (fs.existsSync(src)) {
      const dst = path.resolve(repoRoot, p);
      fs.mkdirSync(path.dirname(dst), { recursive: true });
      fs.copyFileSync(src, dst);
      imported.push(p);
    }
  }

  const st = workdirState(dir);
  if (st) {
    for (const e of st.entries) {
      const norm = e.path.replace(/\\/g, '/');
      if (JOURNAL_RE.test(norm)) {
        const src = path.resolve(dir, norm);
        const dst = path.resolve(repoRoot, norm);
        fs.mkdirSync(path.dirname(dst), { recursive: true });
        fs.copyFileSync(src, dst);
        imported.push(norm);
      }
    }
  }

  return imported;
}

function lsRemoteSnapshot(repoRoot = getRepoRoot()) {
  const r = gitIn(repoRoot, ['ls-remote']);
  if (r.status !== 0) return null;
  return (r.stdout || '').trim();
}

function remoteAuditVerdict(beforeSnapshot, afterSnapshot) {
  if (beforeSnapshot === null || afterSnapshot === null) {
    return { incident: [] };
  }
  if (beforeSnapshot !== afterSnapshot) {
    return { incident: ['remote refs changed during attempt execution'] };
  }
  return { incident: [] };
}

function takeStartLock(slotId, stateDir) {
  const lockPath = path.join(stateDir, `${slotId}.startlock`);
  try {
    const fd = fs.openSync(lockPath, 'wx');
    fs.writeSync(fd, String(process.pid));
    fs.closeSync(fd);
    return true;
  } catch (e) {
    if (e.code === 'EEXIST') {
      try {
        const content = fs.readFileSync(lockPath, 'utf8').trim();
        const pid = parseInt(content, 10);
        if (pid && !isPidAlive(pid)) {
          fs.unlinkSync(lockPath);
          const fd = fs.openSync(lockPath, 'wx');
          fs.writeSync(fd, String(process.pid));
          fs.closeSync(fd);
          return true;
        }
      } catch {}
      return false;
    }
    return false;
  }
}

function releaseStartLock(slotId, stateDir) {
  const lockPath = path.join(stateDir, `${slotId}.startlock`);
  try {
    fs.unlinkSync(lockPath);
  } catch {}
}

function chunkIsProgress(chunk) {
  if (!chunk || !chunk.length) return false;
  const lines = chunk.split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (RETRY_TEXT.test(trimmed)) continue;
    return true;
  }
  return false;
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

function checkCommand(cmdString) {
  if (!SAFE_CMD.test(cmdString)) {
    throw new Error(`unsafe characters in command string: ${cmdString}`);
  }
}

function isSafeRelativePath(p) {
  if (!p || typeof p !== 'string') return false;
  if (path.isAbsolute(p)) return false;
  if (/^[a-zA-Z]:/.test(p)) return false;
  if (/[*?"<>|]/.test(p)) return false;
  const norm = path.normalize(p);
  if (norm.startsWith('..') || norm === '..') return false;
  return true;
}

function validateRegistry(obj) {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
    throw new Error('registry must be a JSON object');
  }
  for (const k of Object.keys(obj)) {
    if (k !== 'schema' && k !== 'clients') throw new Error(`unknown registry top-level key "${k}"`);
  }
  if (obj.schema !== 'clients/1') {
    throw new Error(`unsupported registry schema "${obj.schema}"`);
  }
  if (!obj.clients || typeof obj.clients !== 'object' || Array.isArray(obj.clients)) {
    throw new Error('registry.clients must be an object');
  }
  const requiredClientKeys = [
    'binary', 'present', 'version', 'verifiedOn', 'source',
    'command', 'model', 'effort', 'env', 'resume', 'usage', 'failureModes'
  ];
  for (const [cName, cCfg] of Object.entries(obj.clients)) {
    if (!cCfg || typeof cCfg !== 'object' || Array.isArray(cCfg)) {
      throw new Error(`client "${cName}" must be an object`);
    }
    for (const req of requiredClientKeys) {
      if (!(req in cCfg)) throw new Error(`client "${cName}" missing required key "${req}"`);
    }
    if (typeof cCfg.binary !== 'string') throw new Error(`client "${cName}".binary must be string`);
    if (typeof cCfg.present !== 'boolean') throw new Error(`client "${cName}".present must be boolean`);
    if (!Array.isArray(cCfg.command)) throw new Error(`client "${cName}".command must be array`);
  }
  return obj;
}

function loadRegistry(filePath) {
  const p = filePath || path.resolve(__dirname, '..', 'docs', 'clients.json');
  let raw = '';
  try {
    raw = fs.readFileSync(p, 'utf8');
  } catch (e) {
    throw new Error(`cannot read registry file "${p}": ${e.message}`);
  }
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    throw new Error(`registry file "${p}" is not valid JSON: ${e.message}`);
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
  const allowedSlotKeys = [
    'id', 'frame', 'out', 'outputs', 'launch', 'copyIn', 'needs', 'when', 'adopted',
    'route', 'fallback', 'git', 'role', 'floor', 'constraints', 'independence',
    'substitutes', 'stageKind', 'long', 'approval', 'validate', 'budget', 'notBefore'
  ];
  for (const s of slotsRaw) {
    if (!s || typeof s !== 'object' || Array.isArray(s)) throw new Error('slot must be an object');
    for (const k of Object.keys(s)) {
      if (!allowedSlotKeys.includes(k)) throw new Error(`unknown slot key "${k}" in slot "${s.id}"`);
    }
    if (s.notBefore && typeof s.notBefore !== 'string') throw new Error(`slot "${s.id}".notBefore must be a string`);
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

    if (s.budget !== undefined) {
      throw new Error('budget not supported in v0');
    }
    if (s.constraints !== undefined) {
      if (typeof s.constraints !== 'object' || s.constraints === null || Array.isArray(s.constraints)) {
        throw new Error(`slot "${s.id}".constraints must be an object`);
      }
      for (const ck of Object.keys(s.constraints)) {
        if (ck !== 'contextMin') throw new Error(`constraint "${ck}" not supported in v0`);
      }
      if (s.constraints.contextMin !== undefined) {
        if (typeof s.constraints.contextMin !== 'number' || !Number.isInteger(s.constraints.contextMin) || s.constraints.contextMin <= 0) {
          throw new Error(`slot "${s.id}".constraints.contextMin must be a positive integer`);
        }
      }
    }
    if (s.substitutes !== undefined) {
      if (typeof s.substitutes !== 'number' || !Number.isInteger(s.substitutes) || s.substitutes < 0 || s.substitutes > 2) {
        throw new Error(`slot "${s.id}".substitutes must be an integer between 0 and 2; got ${s.substitutes}`);
      }
    }
    if (s.stageKind !== undefined && !['kernel', 'certification', 'other'].includes(s.stageKind)) {
      throw new Error(`slot "${s.id}".stageKind must be "kernel", "certification", or "other"`);
    }
    if (s.long !== undefined && typeof s.long !== 'boolean') {
      throw new Error(`slot "${s.id}".long must be a boolean`);
    }
    if (s.validate !== undefined && s.validate !== null && !Array.isArray(s.validate)) {
      throw new Error(`slot "${s.id}".validate must be an array or null`);
    }

    if (!s.route) {
      if (!s.role || typeof s.role !== 'string') {
        throw new Error(`slot "${s.id}" missing role (required when slot has no route)`);
      }
      if (!s.floor || typeof s.floor !== 'string' || !/^T[1-9]$/.test(s.floor)) {
        throw new Error(`slot "${s.id}" missing or invalid floor (must be T1..T9)`);
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

function loadLadder(ladderPath, repoRoot = getRepoRoot()) {
  const fullPath = path.resolve(repoRoot, ladderPath);
  let raw = '';
  try {
    raw = fs.readFileSync(fullPath, 'utf8');
  } catch (e) {
    throw new Error(`cannot read ladder file "${fullPath}": ${e.message}`);
  }
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    throw new Error(`ladder file "${fullPath}" is not valid JSON: ${e.message}`);
  }
  return parsed;
}

function verifyLadderSectionSha256(ladder, repoRoot = getRepoRoot()) {
  if (!ladder || !ladder.source || !ladder.source.path || !ladder.source.heading) {
    return { ok: false, reason: 'missing-source-metadata' };
  }
  const fullPath = path.resolve(repoRoot, ladder.source.path);
  if (!fs.existsSync(fullPath)) {
    return { ok: false, reason: 'source-not-found' };
  }
  const content = fs.readFileSync(fullPath, 'utf8').replace(/\r\n/g, '\n');
  const lines = content.split('\n');
  const start = lines.indexOf(ladder.source.heading);
  if (start === -1) {
    return { ok: false, reason: 'heading-not-found' };
  }
  let end = lines.findIndex((l, i) => i > start && l.startsWith('## '));
  if (end === -1) end = lines.length;
  const sectionText = lines.slice(start, end).join('\n') + '\n';
  const hash = crypto.createHash('sha256').update(sectionText).digest('hex');
  if (hash !== ladder.source.sectionSha256) {
    return { ok: false, reason: 'section-sha-mismatch', expected: ladder.source.sectionSha256, actual: hash };
  }
  return { ok: true, sha256: hash };
}

function computePins(slot, dispatchPath, repoRoot = getRepoRoot()) {
  let head = '';
  try {
    const r = gitIn(repoRoot, ['rev-parse', 'HEAD']);
    head = (r.stdout || '').trim();
  } catch {}
  if (!head || !/^[0-9a-f]{40}$/.test(head)) {
    head = '0000000000000000000000000000000000000000';
  }

  const launchFull = path.resolve(repoRoot, slot.launch);
  let launchSha256 = '';
  if (fs.existsSync(launchFull)) {
    launchSha256 = crypto.createHash('sha256').update(fs.readFileSync(launchFull)).digest('hex');
  }

  const dispatchFull = path.resolve(repoRoot, dispatchPath);
  let dispatchVersion = '';
  if (fs.existsSync(dispatchFull)) {
    dispatchVersion = crypto.createHash('sha256').update(fs.readFileSync(dispatchFull)).digest('hex');
  }

  const copyInHashes = {};
  if (Array.isArray(slot.copyIn)) {
    for (const c of slot.copyIn) {
      const full = path.resolve(repoRoot, c);
      if (fs.existsSync(full)) {
        copyInHashes[c] = crypto.createHash('sha256').update(fs.readFileSync(full)).digest('hex');
      }
    }
  }

  return {
    head,
    launchFile: slot.launch.replace(/\\/g, '/'),
    launchSha256,
    roleSha256: null,
    corpusHash: null,
    dispatchVersion,
    copyInHashes
  };
}

function verifyPins(pins, slot, dispatchPath, repoRoot = getRepoRoot()) {
  if (!pins) return { ok: false, reason: 'pins-missing' };
  const current = computePins(slot, dispatchPath, repoRoot);
  if (current.launchSha256 !== pins.launchSha256) {
    return { ok: false, reason: `pin-changed ${slot.launch.replace(/\\/g, '/')}` };
  }
  if (current.dispatchVersion !== pins.dispatchVersion) {
    return { ok: false, reason: `pin-changed ${dispatchPath.replace(/\\/g, '/')}` };
  }
  if (pins.copyInHashes) {
    for (const [p, h] of Object.entries(pins.copyInHashes)) {
      if (current.copyInHashes[p] !== h) {
        return { ok: false, reason: `pin-changed ${p.replace(/\\/g, '/')}` };
      }
    }
  }
  return { ok: true };
}

function resolveSlot(slot, ladder, registry = {}, opts = {}) {
  if (slot.route) {
    return {
      selection: 'owner',
      ladderSnapshot: null,
      primary: slot.route,
      substitutes: (slot.fallback || []).slice(0, 2),
      excluded: [],
      skipped: [],
      unverified: [],
      approval: slot.approval || null,
      shortfall: null,
      admissible: [slot.route],
      terminal: null
    };
  }

  const floorNum = parseInt(slot.floor.replace(/^T/, ''), 10);
  const substitutesCount = slot.substitutes !== undefined ? slot.substitutes : 2;
  const isLong = slot.long !== undefined ? Boolean(slot.long) : true;
  const stageKind = slot.stageKind || 'other';

  const excluded = [];
  const skipped = [];
  const unverified = [];
  const admissible = [];

  const probeFn = opts.probeFn || ((client, model) => {
    if (opts.skipProbe) return { ok: true, state: 'OK' };
    const reg = registry.clients ? registry : (opts.registry ? loadRegistry(opts.registry) : loadRegistry());
    return probeClient(client, reg, { model });
  });

  for (const rung of ladder.rungs) {
    // 1. Route data
    if (!rung.client || !rung.model) {
      excluded.push({ rung: rung.rung, label: rung.label, reason: 'route-unknown' });
      continue;
    }

    // 2. Hard constraints
    if (slot.constraints && slot.constraints.contextMin) {
      const minCtx = slot.constraints.contextMin;
      if (rung.contextWindow === null || rung.contextWindow === undefined) {
        unverified.push({ rung: rung.rung, constraint: 'contextMin' });
      } else if (rung.contextWindow < minCtx) {
        excluded.push({ rung: rung.rung, label: rung.label, reason: 'context-window' });
        continue;
      }
    }

    // 3. Floor
    if (!rung.tiers || !rung.tiers.length) {
      excluded.push({ rung: rung.rung, label: rung.label, reason: 'tier-unknown' });
      continue;
    }
    const maxTier = Math.max(...rung.tiers);
    if (maxTier < floorNum) {
      excluded.push({ rung: rung.rung, label: rung.label, reason: 'below-floor' });
      continue;
    }

    // 4. Independence
    if (slot.independence) {
      const ind = slot.independence;
      let indExcluded = false;
      if (ind.excludeModels && ind.excludeModels.includes(rung.model)) indExcluded = true;
      if (ind.excludeFamilies && ind.excludeFamilies.includes(rung.family)) indExcluded = true;
      if (ind.excludeProviders && ind.excludeProviders.includes(rung.provider)) indExcluded = true;
      if (indExcluded) {
        excluded.push({ rung: rung.rung, label: rung.label, reason: 'independence' });
        continue;
      }
    }

    // 5. Approval
    if (rung.approval === 'owner-long-task' && isLong && !slot.approval) {
      skipped.push({ rung: rung.rung, label: rung.label, reason: 'needs-approval' });
      continue;
    }

    // 6. Liveness
    const probe = probeFn(rung.client, rung.model);
    if (!probe.ok) {
      const reason = probe.state ? `unavailable:${probe.state}` : 'unavailable';
      skipped.push({ rung: rung.rung, label: rung.label, reason: 'unavailable', detail: reason });
      continue;
    }

    admissible.push(rung);
  }

  // 7 & 8. Primary and Substitutes
  admissible.sort((a, b) => {
    if (b.rung !== a.rung) return b.rung - a.rung; // largest rung number first
    return a.order - b.order; // within group, lowest order first
  });

  const primary = admissible.length > 0 ? admissible[0] : null;
  const substitutes = admissible.slice(1, 1 + substitutesCount);

  // 9. Terminal cases
  let terminal = null;
  let shortfallStr = null;

  if (!primary) {
    terminal = 'no-admissible-rung';
  } else {
    const shortfallCount = substitutesCount - substitutes.length;
    if (shortfallCount > 0) {
      shortfallStr = `shortfall=${shortfallCount}`;
      if (stageKind === 'kernel' || stageKind === 'certification') {
        terminal = 'shortfall';
      }
    }
  }

  return {
    selection: 'resolver',
    ladderSnapshot: (ladder.source && ladder.source.snapshot) || null,
    primary,
    substitutes,
    excluded,
    skipped,
    unverified,
    approval: slot.approval || null,
    shortfall: shortfallStr,
    admissible,
    terminal
  };
}

function resolveCommand(dispatchFile, slotId, opts = {}) {
  const repoRoot = getRepoRoot(opts);
  const ladderPath = opts.ladder || path.resolve(repoRoot, 'docs/ops/model-ladder.json');
  const ladder = loadLadder(ladderPath, repoRoot);

  const checkLadder = verifyLadderSectionSha256(ladder, repoRoot);
  if (!checkLadder.ok) {
    console.log('ERROR reason=ladder-stale');
    return 1;
  }

  const dispatch = loadDispatch(dispatchFile);
  const slots = dispatch.slots || dispatch.jobs;
  const slot = slots.find(s => s.id === slotId);
  if (!slot) {
    console.log(`ERROR reason=slot-not-found slot=${slotId}`);
    return 2;
  }

  const registry = loadRegistry(opts.registry);
  const res = resolveSlot(slot, ladder, registry, opts);

  if (res.primary) {
    console.log(`RESOLVE slot=${slot.id} primary=${res.primary.client}:${res.primary.model || ''} rung=${res.primary.rung}`);
    for (let i = 0; i < res.substitutes.length; i++) {
      const sub = res.substitutes[i];
      console.log(`SUBSTITUTE n=${i + 1} route=${sub.client}:${sub.model || ''} rung=${sub.rung}`);
    }
  }

  for (const e of res.excluded) {
    console.log(`EXCLUDED rung=${e.rung} reason=${e.reason} label="${e.label || ''}"`);
  }
  for (const s of res.skipped) {
    console.log(`SKIPPED rung=${s.rung} reason=${s.reason} label="${s.label || ''}"`);
  }
  for (const u of res.unverified) {
    console.log(`UNVERIFIED rung=${u.rung} constraint=${u.constraint}`);
  }

  if (res.terminal === 'no-admissible-rung') {
    console.log('ERROR reason=no-admissible-rung');
    return 1;
  }
  if (res.terminal === 'shortfall') {
    console.log('ASK_OWNER reason=shortfall');
    return 1;
  }

  return 0;
}

function writeRepairFile(dir, attemptNum, failingRows, repoRoot = getRepoRoot()) {
  const templatePath = path.resolve(repoRoot, '.ai', 'docs', 'dispatch', 'repair.md');
  let header = '';
  try {
    header = fs.readFileSync(templatePath, 'utf8');
  } catch {
    header = '# Dispatch Repair\n\nRepair only the named outputs.\n';
  }
  const rowsText = (failingRows || []).join('\n');
  const fullContent = `${header.trim()}\n\n## Failing Check Rows\n${rowsText}\n`;
  const relPath = path.join('.ai', 'runtime', `dispatch-repair-${attemptNum}.md`).replace(/\\/g, '/');
  const targetPath = path.resolve(dir, relPath);
  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  fs.writeFileSync(targetPath, fullContent, 'utf8');
  return relPath;
}

function checkCompletion(slot, dir, declaredOutputs, attemptResult, repoRoot = getRepoRoot()) {
  const result = {
    processEnded: attemptResult.exitCode !== null,
    exitCode: attemptResult.exitCode,
    outputsPresent: true,
    outputsNonEmpty: true,
    structuralCheck: 'pass',
    validator: 'n/a',
    evidence: null,
    supervisorDone: false,
    failingRows: []
  };

  const outputs = (declaredOutputs || []).map(p => p.replace(/\\/g, '/'));
  for (const p of outputs) {
    const full = path.resolve(dir, p);
    if (!fs.existsSync(full)) {
      result.outputsPresent = false;
      result.failingRows.push(`OUTPUT_MISSING path=${p}`);
    } else {
      const sz = fs.statSync(full).size;
      if (sz === 0) {
        result.outputsNonEmpty = false;
        result.failingRows.push(`OUTPUT_EMPTY path=${p}`);
      }
      try {
        const buf = fs.readFileSync(full);
        const str = buf.toString('utf8');
        if (str.includes('\uFFFD')) {
          result.structuralCheck = 'fail';
          result.failingRows.push(`ENCODING_ERROR path=${p} contains U+FFFD`);
        }
      } catch {
        result.structuralCheck = 'fail';
        result.failingRows.push(`ENCODING_ERROR path=${p} read error`);
      }
    }
  }

  // Validator
  if (slot.validate && Array.isArray(slot.validate) && slot.validate.length) {
    try {
      const vBin = slot.validate[0];
      const vArgs = slot.validate.slice(1);
      const vr = spawnSync(vBin, vArgs, { cwd: dir, encoding: 'utf8', windowsHide: true });
      if (vr.status === 0) {
        result.validator = 'pass';
      } else {
        result.validator = 'fail';
        result.failingRows.push(`VALIDATOR_FAILED exitCode=${vr.status}`);
      }
    } catch (e) {
      result.validator = 'fail';
      result.failingRows.push(`VALIDATOR_ERROR message="${e.message}"`);
    }
  }

  // Evidence from copied-back or workdir journal
  const st = workdirState(dir);
  if (st) {
    for (const e of st.entries) {
      const norm = e.path.replace(/\\/g, '/');
      if (JOURNAL_RE.test(norm)) {
        const jPath = path.resolve(dir, norm);
        if (fs.existsSync(jPath)) {
          const content = fs.readFileSync(jPath, 'utf8');
          if (/^Evidence:/m.test(content)) {
            result.evidence = norm;
            break;
          }
        }
      }
    }
  }

  if (!result.evidence) {
    result.failingRows.push('MISSING_EVIDENCE journal has no line starting Evidence:');
  }

  if (
    result.processEnded &&
    result.exitCode === 0 &&
    result.outputsPresent &&
    result.outputsNonEmpty &&
    result.structuralCheck === 'pass' &&
    result.validator !== 'fail' &&
    result.evidence !== null
  ) {
    result.supervisorDone = true;
  }

  return result;
}

function mapClassForRunRecord(cls, status) {
  if (status === 'DONE') return 'NONE';
  if (!cls) return 'NONE';
  const CANONICAL_CLASSES = new Set([
    'AUTH_ERROR', 'CONFIG_ERROR', 'MODEL_UNAVAILABLE', 'QUOTA_EXHAUSTED',
    'RATE_LIMIT', 'NETWORK_ERROR', 'PROVIDER_ERROR', 'PROCESS_CRASH',
    'STALL', 'TIMEOUT', 'INVALID_OUTPUT', 'VALIDATION_FAILURE',
    'SEMANTIC_FAILURE', 'DEPENDENCY_FAILURE', 'POLICY_FAILURE',
    'NONE', 'UNCLASSIFIED'
  ]);
  if (CANONICAL_CLASSES.has(cls)) return cls;
  return 'UNCLASSIFIED';
}

function buildClientCommand(clientCfg, route, tokens, attemptKind = 'fresh') {
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

  const cmdList = (attemptKind === 'resume' && clientCfg.resume && clientCfg.resume.command)
    ? clientCfg.resume.command
    : clientCfg.command;

  let messageExpanded = false;
  for (const item of cmdList) {
    if (typeof item === 'string') {
      if (item.includes('{message}')) messageExpanded = true;
      parts.push(expand(item));
    } else if (item && typeof item === 'object' && item.if) {
      if (route && route[item.if]) {
        for (const a of item.args || []) {
          if (a.includes('{message}')) messageExpanded = true;
          parts.push(expand(a));
        }
      }
    }
  }

  if (attemptKind === 'resume' && !messageExpanded && tokens.message) {
    parts.push(tokens.message);
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

function parseCodexTokenNumber(str) {
  if (!str) return NaN;
  const trimmed = str.trim();
  const mSuffix = trimmed.match(/([kKmM])$/);
  const suffix = mSuffix ? mSuffix[1].toUpperCase() : null;
  const numPart = suffix ? trimmed.slice(0, -1).trim() : trimmed;

  if (suffix) {
    const mult = suffix === 'K' ? 1000 : 1000000;
    const decMatch = numPart.match(/^([0-9\u00A0 ,.]*?)[.,]([0-9]{1,2})$/);
    if (decMatch) {
      const intPart = decMatch[1].replace(/[\u00A0 ,.]/g, '');
      const val = parseFloat((intPart || '0') + '.' + decMatch[2]);
      return Math.round(val * mult);
    }
    const cleaned = numPart.replace(/[\u00A0 ,.]/g, '');
    const val = parseInt(cleaned, 10);
    return isNaN(val) ? NaN : Math.round(val * mult);
  }

  const cleaned = numPart.replace(/[\u00A0 ,.]/g, '');
  return parseInt(cleaned, 10);
}

function parseUsageFromLog(logPath, usageParser) {
  const result = {
    tokens: { in: null, out: null, source: 'none' },
    usage: { amount: null, unit: null },
    found: false,
    rawUsage: null
  };

  if (!usageParser || usageParser === 'none' || !logPath || !fs.existsSync(logPath)) {
    return result;
  }

  let text = '';
  try {
    text = fs.readFileSync(logPath, 'utf8');
  } catch {
    return result;
  }

  if (!text) {
    return result;
  }

  if (usageParser === 'kilo-json') {
    let costSum = 0;
    let inTokens = 0;
    let outTokens = 0;
    let stepCount = 0;
    let hasCost = false;
    let hasTokens = false;
    const rawMatches = [];

    const lines = text.split(/\r?\n/);
    for (const line of lines) {
      if (!line.trim()) continue;
      try {
        const parsed = JSON.parse(line);
        const part = (parsed && parsed.part) ? parsed.part : parsed;
        if (part && part.type === 'step-finish') {
          stepCount++;
          rawMatches.push(line.trim());
          if (typeof part.cost === 'number' && !isNaN(part.cost)) {
            costSum += part.cost;
            hasCost = true;
          }
          if (part.tokens && typeof part.tokens === 'object') {
            if (typeof part.tokens.input === 'number' && !isNaN(part.tokens.input)) {
              inTokens += part.tokens.input;
              hasTokens = true;
            }
            if (typeof part.tokens.output === 'number' && !isNaN(part.tokens.output)) {
              outTokens += part.tokens.output;
              hasTokens = true;
            }
          }
        }
      } catch {
        // Not a JSON event
      }
    }

    if (stepCount > 0 && (hasCost || hasTokens)) {
      result.found = true;
      result.rawUsage = rawMatches.join('\n');
      if (hasCost) {
        result.usage = {
          amount: Number(costSum.toFixed(6)),
          unit: 'USD'
        };
      }
      if (hasTokens) {
        result.tokens = {
          in: Math.round(inTokens),
          out: Math.round(outTokens),
          source: 'client-output'
        };
      }
    }
  } else if (usageParser === 'copilot-credits') {
    let creditSum = 0;
    let count = 0;
    const rawMatches = [];
    for (const m of text.matchAll(/AI Credits\s+([0-9.]+)/g)) {
      const val = parseFloat(m[1]);
      if (!isNaN(val)) {
        creditSum += val;
        count++;
        rawMatches.push(m[0].trim());
      }
    }
    if (count > 0) {
      result.found = true;
      result.rawUsage = rawMatches.join('\n');
      result.usage = {
        amount: Number(creditSum.toFixed(6)),
        unit: 'credits'
      };
      result.tokens = { in: null, out: null, source: 'none' };
    }
  } else if (usageParser === 'codex-tokens') {
    let tokenSum = 0;
    let count = 0;
    const rawMatches = [];
    const codexRegex = /\btokens used\b\s*:?\s*([0-9](?:[0-9\u00A0 ,.]*[0-9kKmM])?|[0-9][kKmM])/gi;
    for (const m of text.matchAll(codexRegex)) {
      const val = parseCodexTokenNumber(m[1]);
      if (!isNaN(val)) {
        tokenSum += val;
        count++;
        rawMatches.push(m[0].trim());
      }
    }
    if (count > 0) {
      result.found = true;
      result.rawUsage = rawMatches.join('\n');
      result.usage = {
        amount: tokenSum,
        unit: 'tokens'
      };
      result.tokens = { in: null, out: null, source: 'none' };
    }
  }

  return result;
}

function executeAttempt(slot, attemptNumber, dispatch, registry, opts = {}) {
  const repoRoot = getRepoRoot(opts);
  const stateDir = path.resolve(repoRoot, dispatch.stateDir || '.ai/runtime/dispatch');
  fs.mkdirSync(stateDir, { recursive: true });
  const logsDir = path.join(stateDir, 'logs');
  fs.mkdirSync(logsDir, { recursive: true });

  const route = opts.route || slot.route;
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

  const attemptKind = opts.attemptKind || 'fresh';
  let dir = opts.workdir;
  let base = null;

  if (!dir) {
    let prepared;
    try {
      prepared = prepareWorkdir(slot, attemptNumber, repoRoot, slot.copyIn, opts.tmpDir);
    } catch (e) {
      return Promise.resolve({ status: 'FAILED', class: 'CONFIG_ERROR', reason: `prepareWorkdir failed: ${e.message}` });
    }
    dir = prepared.dir;
    base = prepared.base;
  } else {
    try {
      base = gitIn(dir, ['rev-parse', 'HEAD']).stdout.trim();
    } catch {}
  }

  const declaredOutputs = [];
  if (slot.out) declaredOutputs.push(slot.out.replace(/\\/g, '/'));
  if (slot.outputs) {
    for (const p of slot.outputs) declaredOutputs.push(p.replace(/\\/g, '/'));
  }

  const logFilePath = path.join(logsDir, `${slot.id}-${attemptNumber}.log`);
  const logFd = fs.openSync(logFilePath, 'a');

  const message = opts.message || makePointer(slot.launch);

  const tokens = {
    message,
    model: route.model || '',
    effort: route.effort || '',
    workdir: dir,
    title: slot.id,
    logdir: path.join(logsDir, `${slot.id}-log`),
    sessionId: opts.sessionId || `session-${slot.id}-${attemptNumber}`
  };

  const cmdTokens = buildClientCommand(clientCfg, route, tokens, attemptKind);
  const cmdString = formatCommandLine(cmdTokens);
  try {
    checkCommand(cmdString);
  } catch (e) {
    fs.closeSync(logFd);
    if (!opts.keepWorkdirOnExit) dropWorkdir(dir);
    return Promise.resolve({ status: 'BLOCKED', class: 'POLICY_FAILURE', reason: e.message, workdir: dir, logPath: logFilePath });
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
    const getLogTail = (bytes = 16384) => {
      try {
        const sz = getLogSize();
        const readLen = Math.min(sz, bytes);
        const buf = Buffer.alloc(readLen);
        fs.readSync(logFd, buf, 0, readLen, sz - readLen);
        return buf.toString('utf8');
      } catch { return ''; }
    };

    const tickInterval = Math.max(50, Math.min(15000, Math.floor(stallSeconds * 250)));

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
      const logText = getLogTail(32768);

      let extractedSessionId = tokens.sessionId;
      const sMatch = logText.match(/(?:SESSION_ID|session(?:_id)?|conversation):\s*(\S+)/i);
      if (sMatch) extractedSessionId = sMatch[1];

      if (failureClass === 'STALL' || failureClass === 'TIMEOUT') {
        return resolve({
          status: 'FAILED',
          class: failureClass,
          reason: failureReason,
          wallMinutes,
          useful: usefulWork,
          attemptNumber,
          sessionId: extractedSessionId,
          workdir: dir,
          exitCode: childExitCode,
          logPath: logFilePath
        });
      }

      if (childExitCode === 0) {
        const missingOutputs = declaredOutputs.filter(f => !fs.existsSync(path.join(dir, f)) || fs.statSync(path.join(dir, f)).size === 0);
        if (missingOutputs.length) {
          return resolve({
            status: 'FAILED',
            class: 'INVALID_OUTPUT',
            reason: `declared outputs missing or empty: ${missingOutputs.join(', ')}`,
            wallMinutes,
            useful: usefulWork,
            attemptNumber,
            sessionId: extractedSessionId,
            workdir: dir,
            exitCode: childExitCode,
            logPath: logFilePath
          });
        }
      } else {
        const identifiedClass = classifyErrorText(logText);
        const cls = identifiedClass || 'PROCESS_CRASH';
        return resolve({
          status: 'FAILED',
          class: cls,
          reason: `process exited with code ${childExitCode}`,
          wallMinutes,
          useful: usefulWork,
          attemptNumber,
          sessionId: extractedSessionId,
          workdir: dir,
          exitCode: childExitCode,
          logPath: logFilePath
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
          attemptNumber,
          sessionId: extractedSessionId,
          workdir: dir,
          exitCode: childExitCode,
          logPath: logFilePath
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
          attemptNumber,
          sessionId: extractedSessionId,
          workdir: dir,
          exitCode: childExitCode,
          logPath: logFilePath
        });
      }

      return resolve({
        status: 'DONE',
        class: null,
        reason: null,
        wallMinutes,
        useful: true,
        attemptNumber,
        sessionId: extractedSessionId,
        workdir: dir,
        exitCode: childExitCode,
        logPath: logFilePath
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

function updateUsageFile(usageFilePath, repoRoot = getRepoRoot(), runsFilePath = null) {
  if (!usageFilePath || !runrecordLib) return;
  try {
    const fullRuns = runsFilePath || (process.env.PROTOCOL_RUNS_FILE
      ? path.resolve(repoRoot, process.env.PROTOCOL_RUNS_FILE)
      : path.resolve(repoRoot, 'docs/ops/RUNS.jsonl'));
    if (!fs.existsSync(fullRuns)) return;
    const records = runrecordLib.readRecords(fullRuns);
    const rendered = runrecordLib.renderUsage(records);
    fs.mkdirSync(path.dirname(usageFilePath), { recursive: true });
    fs.writeFileSync(usageFilePath, rendered, 'utf8');
  } catch {}
}

function emitFallSignal(signalsFile, runId, client, model, startIso, endIso, isNoResumeGap, repoRoot) {
  try {
    const signalsBin = path.join(repoRoot, '.ai', 'bin', 'protocol-signals.cjs');
    if (!fs.existsSync(signalsBin)) return;
    const { addSignal } = require(signalsBin);
    const rawParticipant = `${client || 'unknown'}:${model || 'unknown'}`;
    const participant = rawParticipant.replace(/[^A-Za-z0-9._:\/@-]/g, '-').slice(0, 80);
    const startMs = new Date(startIso).getTime();
    const endMs = new Date(endIso).getTime();
    const minutes = isNaN(startMs) || isNaN(endMs) ? 0 : Math.max(0, Math.floor((endMs - startMs) / 60000));
    const evidence = `docs/ops/RUNS.jsonl#${runId}`;

    addSignal(signalsFile, {
      type: 'fall',
      participant,
      evidence,
      cost: `minutes=${minutes}`
    });

    if (isNoResumeGap) {
      addSignal(signalsFile, {
        type: 'procedure-gap',
        participant,
        evidence,
        cost: 'unknown'
      });
    }
  } catch (err) {
    console.log(`ERROR reason=signal-append-failed runId=${runId} error="${err.message}"`);
  }
}

const sleepAsync = ms => new Promise(resolve => setTimeout(resolve, ms));

async function runDispatch(dispatchFile, slotsToRun = [], opts = {}) {
  const repoRoot = getRepoRoot(opts);
  const dispatch = loadDispatch(dispatchFile);
  const registry = loadRegistry(opts.registry);
  const ladderPath = opts.ladder || path.resolve(repoRoot, 'docs/ops/model-ladder.json');
  let ladder = null;
  try {
    if (fs.existsSync(ladderPath)) {
      ladder = loadLadder(ladderPath, repoRoot);
    }
  } catch {}

  const stateDir = path.resolve(repoRoot, dispatch.stateDir || '.ai/runtime/dispatch');
  fs.mkdirSync(stateDir, { recursive: true });
  const stateFile = path.join(stateDir, 'state.json');

  let state = { slots: {} };
  try {
    if (fs.existsSync(stateFile)) state = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
  } catch {}
  if (!state || typeof state !== 'object' || !state.slots) state = { slots: {} };
  if (!state.slots) state.slots = {};

  const runsFile = opts.runsFile
    ? path.resolve(repoRoot, opts.runsFile)
    : (process.env.PROTOCOL_RUNS_FILE
        ? path.resolve(repoRoot, process.env.PROTOCOL_RUNS_FILE)
        : path.resolve(repoRoot, 'docs/ops/RUNS.jsonl'));

  const signalsFile = opts.signalsFile
    ? path.resolve(repoRoot, opts.signalsFile)
    : (process.env.PROTOCOL_SIGNALS_FILE
        ? path.resolve(repoRoot, process.env.PROTOCOL_SIGNALS_FILE)
        : path.resolve(repoRoot, '.ai/SIGNALS.md'));

  const slotsList = dispatch.slots || dispatch.jobs;
  const targetSlots = slotsToRun.length
    ? slotsList.filter(s => slotsToRun.includes(s.id))
    : slotsList;

  let anyFailed = false;

  let dispatchRunningSum = 0;
  let dispatchRunningUnit = null;
  let dispatchMixedUnits = false;
  let dispatchHasAnyCost = false;

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

    let resolution;
    if (slot.route) {
      resolution = resolveSlot(slot, ladder, registry, opts);
    } else {
      if (!ladder) {
        console.log(`ERROR reason=ladder-missing slot=${slot.id}`);
        releaseStartLock(slot.id, stateDir);
        anyFailed = true;
        continue;
      }
      const checkLadder = verifyLadderSectionSha256(ladder, repoRoot);
      if (!checkLadder.ok) {
        console.log('ERROR reason=ladder-stale');
        releaseStartLock(slot.id, stateDir);
        return 1;
      }
      resolution = resolveSlot(slot, ladder, registry, opts);
      if (resolution.terminal === 'no-admissible-rung') {
        console.log(`ERROR reason=no-admissible-rung slot=${slot.id}`);
        state.slots[slot.id] = { status: 'BLOCKED', reason: 'no-admissible-rung' };
        fs.writeFileSync(stateFile, JSON.stringify(state, null, 2), 'utf8');
        releaseStartLock(slot.id, stateDir);
        anyFailed = true;
        continue;
      }
      if (resolution.terminal === 'shortfall') {
        console.log(`ASK_OWNER reason=shortfall slot=${slot.id}`);
        state.slots[slot.id] = { status: 'BLOCKED', reason: 'shortfall' };
        fs.writeFileSync(stateFile, JSON.stringify(state, null, 2), 'utf8');
        releaseStartLock(slot.id, stateDir);
        anyFailed = true;
        continue;
      }
    }

    const slotState = state.slots[slot.id] || { attempts: [] };

    // Launch pinning
    if (opts.revise || !slotState.pins) {
      const nowIso = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
      slotState.runId = `R-${nowIso}-${slot.id}`;
      slotState.pins = computePins(slot, dispatchFile, repoRoot);
    } else {
      const pCheck = verifyPins(slotState.pins, slot, dispatchFile, repoRoot);
      if (!pCheck.ok) {
        console.log(`BLOCKED slot=${slot.id} class=POLICY_FAILURE reason="${pCheck.reason}"`);
        slotState.status = 'BLOCKED';
        slotState.class = 'POLICY_FAILURE';
        slotState.reason = pCheck.reason;
        state.slots[slot.id] = slotState;
        fs.writeFileSync(stateFile, JSON.stringify(state, null, 2), 'utf8');
        releaseStartLock(slot.id, stateDir);
        anyFailed = true;
        continue;
      }
    }

    const routes = [];
    if (resolution.primary) routes.push({ role: 'primary', route: resolution.primary });
    if (resolution.substitutes && resolution.substitutes[0]) {
      routes.push({ role: 'substitute-1', route: resolution.substitutes[0] });
    }
    if (resolution.substitutes && resolution.substitutes[1]) {
      routes.push({ role: 'substitute-2', route: resolution.substitutes[1] });
    }

    let routeIdx = 0;
    let freshPrimary = 0;
    const freshSubs = { 'substitute-1': 0, 'substitute-2': 0 };
    let freshTotal = 0;
    let wakesThisAttempt = 0;
    let crashResumeDone = false;
    let repairResumeDone = false;

    let currentWorkdir = null;
    let lastSessionId = null;
    let lastAttemptResult = null;
    let lastCompletion = null;

    const recordAttempts = [];
    const transitions = [];
    let curState11 = 'DISPATCHED';

    const addTransition = (to, reason) => {
      const at = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
      transitions.push({ from: curState11, to, at, reason });
      curState11 = to;
    };

    addTransition('LAUNCHED', 'initial-launch');

    let finalState = null;
    let fallen = false;
    const hardSeconds = opts.hardSeconds || (dispatch.hardMin ? dispatch.hardMin * 60 : 7200);
    const slotStartTime = Date.now();

    while (!finalState) {
      if ((Date.now() - slotStartTime) >= hardSeconds * 1000) {
        addTransition('BLOCKED', 'hard-ceiling-reached');
        finalState = 'BLOCKED';
        break;
      }
      if (freshTotal >= 6) {
        addTransition('FAILED', 'budget-exhausted-fresh');
        finalState = 'FAILED';
        break;
      }

      let attemptKind = 'fresh';
      let attemptReason = 'first';
      let messageToUse = null;

      const curRouteEntry = routes[routeIdx];
      const curClientName = curRouteEntry?.route?.client;
      const curClientCfg = curClientName ? registry.clients[curClientName] : null;
      const clientCanResume = Boolean(curClientCfg && curClientCfg.resume && curClientCfg.resume.command);

      if (lastAttemptResult && lastAttemptResult.class === 'STALL' && clientCanResume && wakesThisAttempt < 3 && lastSessionId && currentWorkdir) {
        attemptKind = 'resume';
        attemptReason = 'resume';
        messageToUse = makePointer('.ai/docs/dispatch/wake.md');
        wakesThisAttempt++;
        addTransition('RESUMING', `wake-resume-${wakesThisAttempt}`);
      } else if (lastAttemptResult && lastAttemptResult.class === 'PROCESS_CRASH' && clientCanResume && !crashResumeDone && lastSessionId && currentWorkdir) {
        attemptKind = 'resume';
        attemptReason = 'resume';
        messageToUse = makePointer(slot.launch);
        crashResumeDone = true;
        addTransition('RESUMING', 'crash-resume');
      } else if (
        lastAttemptResult &&
        (lastAttemptResult.class === 'INVALID_OUTPUT' || lastAttemptResult.class === 'VALIDATION_FAILURE') &&
        clientCanResume &&
        !repairResumeDone &&
        lastSessionId &&
        currentWorkdir
      ) {
        attemptKind = 'resume';
        attemptReason = 'repair';
        const failingRows = (lastCompletion && lastCompletion.failingRows) || [lastAttemptResult.reason || 'invalid-output'];
        const repairRel = writeRepairFile(currentWorkdir, recordAttempts.length + 1, failingRows, repoRoot);
        messageToUse = makePointer(repairRel);
        repairResumeDone = true;
        addTransition('RECOVERING', 'repair-start');
        addTransition('RESUMING', 'repair-resume');
      } else {
        // Fresh attempt
        if (lastAttemptResult && lastAttemptResult.class === 'STALL' && wakesThisAttempt >= 3) {
          fallen = true;
        }

        const curRouteEntry = routes[routeIdx];
        if (!curRouteEntry) {
          finalState = fallen ? 'FAILED' : 'FAILED';
          addTransition('FAILED', 'no-routes-remaining');
          break;
        }

        const role = curRouteEntry.role;
        if (role === 'primary') {
          if (freshPrimary < 2) {
            freshPrimary++;
            attemptReason = recordAttempts.length === 0 ? 'first' : 'transient-retry';
          } else {
            routeIdx++;
            continue;
          }
        } else {
          if (freshSubs[role] < 2) {
            freshSubs[role]++;
            attemptReason = (routes[routeIdx - 1] && routes[routeIdx - 1].role !== role) ? 'route-change' : 'transient-retry';
          } else {
            routeIdx++;
            continue;
          }
        }

        freshTotal++;
        attemptKind = 'fresh';
        wakesThisAttempt = 0;
        crashResumeDone = false;
        repairResumeDone = false;

        if (currentWorkdir) {
          dropWorkdir(currentWorkdir);
          currentWorkdir = null;
        }
        addTransition('RUNNING', `fresh-attempt-${role}`);
      }

      const activeRouteEntry = routes[routeIdx];
      const attemptNum = recordAttempts.length + 1;
      const attemptStartIso = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');

      console.log(`RUN slot=${slot.id} attempt=${attemptNum} route=${activeRouteEntry.route.client}:${activeRouteEntry.route.model || ''}`);

      const res = await executeAttempt(slot, attemptNum, dispatch, registry, {
        repoRoot,
        route: activeRouteEntry.route,
        attemptKind,
        sessionId: lastSessionId,
        workdir: currentWorkdir,
        message: messageToUse,
        stallSeconds: opts.stallSeconds,
        hardSeconds: opts.hardSeconds,
        tmpDir: opts.tmpDir,
        keepWorkdirOnExit: true
      });

      lastAttemptResult = res;
      lastSessionId = res.sessionId;
      currentWorkdir = res.workdir;

      const attemptEndIso = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');

      const activeClientName = activeRouteEntry.route.client;
      const activeClientCfg = (registry && registry.clients && activeClientName) ? registry.clients[activeClientName] : null;
      const attemptUsageParser = activeClientCfg ? (activeClientCfg.usage || 'none') : 'none';
      const attemptLogPath = res.logPath || path.join(stateDir, 'logs', `${slot.id}-${attemptNum}.log`);
      const attemptUsage = parseUsageFromLog(attemptLogPath, attemptUsageParser);

      const declaredOutputs = [];
      if (slot.out) declaredOutputs.push(slot.out.replace(/\\/g, '/'));
      if (slot.outputs) for (const p of slot.outputs) declaredOutputs.push(p.replace(/\\/g, '/'));

      let completionObj = null;
      let mappedClass = 'NONE';

      if (res.status === 'DONE') {
        completionObj = checkCompletion(slot, currentWorkdir, declaredOutputs, res, repoRoot);
        lastCompletion = completionObj;
        if (completionObj.supervisorDone) {
          mappedClass = 'NONE';
          finalState = 'DONE';
          addTransition('DONE', 'completion-contract-passed');
        } else {
          res.status = 'FAILED';
          res.class = completionObj.validator === 'fail' ? 'VALIDATION_FAILURE' : 'INVALID_OUTPUT';
          res.reason = completionObj.failingRows.join('; ') || 'completion-contract-failed';
          mappedClass = mapClassForRunRecord(res.class, 'FAILED');
        }
      } else if (res.status === 'BLOCKED') {
        mappedClass = mapClassForRunRecord(res.class, 'BLOCKED');
        finalState = 'BLOCKED';
        addTransition('BLOCKED', res.reason || 'policy-failure');
      } else {
        mappedClass = mapClassForRunRecord(res.class, 'FAILED');
        if (res.class === 'TIMEOUT') {
          finalState = 'BLOCKED';
          addTransition('BLOCKED', 'timeout-ceiling-reached');
        }
      }

      recordAttempts.push({
        n: attemptNum,
        kind: attemptKind,
        reason: attemptReason,
        routeRole: activeRouteEntry.role,
        route: {
          client: activeRouteEntry.route.client,
          model: activeRouteEntry.route.model,
          effort: activeRouteEntry.route.effort || null
        },
        effortUsed: activeRouteEntry.route.effort || null,
        modelRan: {
          id: activeRouteEntry.route.model || null,
          source: 'requested'
        },
        sessionId: lastSessionId,
        start: attemptStartIso,
        end: attemptEndIso,
        exitCode: res.exitCode !== undefined ? res.exitCode : null,
        class: mappedClass,
        tokens: attemptUsage.tokens,
        usage: attemptUsage.usage,
        rawUsage: attemptUsage.rawUsage || null
      });

      if (res.class === 'STALL') {
        const isNoResume = !clientCanResume;
        if (isNoResume || wakesThisAttempt >= 3) {
          fallen = true;
          emitFallSignal(
            signalsFile,
            slotState.runId,
            activeRouteEntry.route.client,
            activeRouteEntry.route.model,
            attemptStartIso,
            attemptEndIso,
            isNoResume,
            repoRoot
          );
        }
      }

      if (finalState === 'DONE') {
        importResults(currentWorkdir, declaredOutputs, repoRoot);
        dropWorkdir(currentWorkdir);
        currentWorkdir = null;
        console.log(`DONE slot=${slot.id}`);
        break;
      } else if (finalState === 'BLOCKED') {
        if (!res.workdirKept) {
          dropWorkdir(currentWorkdir);
          currentWorkdir = null;
        }
        console.log(`BLOCKED slot=${slot.id} class=${res.class || 'POLICY_FAILURE'} reason="${res.reason}"`);
        anyFailed = true;
        break;
      } else {
        // Failed attempt: inspect per S5 action
        if (res.class === 'AUTH_ERROR' || res.class === 'CONFIG_ERROR') {
          routeIdx++;
        } else if (res.class === 'MODEL_UNAVAILABLE') {
          routeIdx++;
        } else if (res.class === 'QUOTA_EXHAUSTED') {
          routeIdx++;
          if (routeIdx >= routes.length) {
            console.log(`ASK_OWNER reason=quota-exhausted slot=${slot.id}`);
            finalState = 'BLOCKED';
            addTransition('BLOCKED', 'quota-exhausted-all-routes');
            anyFailed = true;
            break;
          }
        } else if (res.class === 'RATE_LIMIT') {
          if (!opts.fastRetry) await sleepAsync(60000);
        } else if (res.class === 'NETWORK_ERROR' || res.class === 'PROVIDER_ERROR') {
          if (!opts.fastRetry) await sleepAsync(30000);
        } else if (res.class === 'INVALID_OUTPUT' || res.class === 'VALIDATION_FAILURE') {
          if (repairResumeDone) {
            routeIdx++;
          }
        }
      }
    }

    if (!finalState) {
      finalState = 'FAILED';
      addTransition('FAILED', 'terminated-without-resolution');
      anyFailed = true;
    }

    if (currentWorkdir && !lastAttemptResult?.workdirKept) {
      dropWorkdir(currentWorkdir);
    }

    slotState.status = finalState;
    slotState.class = lastAttemptResult ? lastAttemptResult.class : null;
    slotState.reason = lastAttemptResult ? lastAttemptResult.reason : null;
    slotState.attempts = recordAttempts;
    state.slots[slot.id] = slotState;
    fs.writeFileSync(stateFile, JSON.stringify(state, null, 2), 'utf8');

    releaseStartLock(slot.id, stateDir);

    if (finalState === 'FAILED') {
      console.log(`FAILED slot=${slot.id} class=${slotState.class || 'UNKNOWN'} reason="${slotState.reason || ''}"`);
      anyFailed = true;
    }

    // Build run record for RUNS.jsonl
    const declaredOutputs = [];
    if (slot.out) declaredOutputs.push(slot.out.replace(/\\/g, '/'));
    if (slot.outputs) for (const p of slot.outputs) declaredOutputs.push(p.replace(/\\/g, '/'));

    // Cost computation (PROTO-DEC-0075 item 9, PKG-1 S8, PKG-3 S8)
    const attemptsWithAmount = recordAttempts.filter(
      a => a.usage && typeof a.usage.amount === 'number' && !isNaN(a.usage.amount)
    );

    let actualCost = null;
    let slotUnit = null;

    if (attemptsWithAmount.length > 0) {
      const units = new Set(attemptsWithAmount.map(a => a.usage.unit).filter(Boolean));
      if (units.size === 1) {
        slotUnit = Array.from(units)[0];
        const sum = attemptsWithAmount.reduce((acc, a) => acc + a.usage.amount, 0);
        actualCost = Number(sum.toFixed(6));
      }
    }

    if (actualCost !== null && slotUnit !== null) {
      if (!dispatchHasAnyCost) {
        dispatchHasAnyCost = true;
        dispatchRunningUnit = slotUnit;
        dispatchRunningSum = actualCost;
      } else if (!dispatchMixedUnits) {
        if (dispatchRunningUnit === slotUnit) {
          dispatchRunningSum = Number((dispatchRunningSum + actualCost).toFixed(6));
        } else {
          dispatchMixedUnits = true;
        }
      }
    } else if (attemptsWithAmount.length > 0) {
      dispatchMixedUnits = true;
    }

    let cumulativeCost = null;
    let costUnit = null;

    if (dispatchHasAnyCost && !dispatchMixedUnits) {
      cumulativeCost = dispatchRunningSum;
    }

    if (actualCost !== null) {
      costUnit = slotUnit;
    } else if (cumulativeCost !== null) {
      costUnit = dispatchRunningUnit;
    }

    const runRecordObj = {
      schema: 'run-record/1',
      runId: slotState.runId || `R-${new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}-${slot.id}`,
      slot: slot.id,
      frame: slot.frame || 'task:default',
      role: slot.role || null,
      selection: resolution.selection,
      resolution: {
        ladderSnapshot: resolution.ladderSnapshot || null,
        primary: resolution.primary ? {
          client: resolution.primary.client,
          model: resolution.primary.model,
          effort: resolution.primary.effort || null
        } : null,
        substitutes: (resolution.substitutes || []).map(s => ({
          client: s.client,
          model: s.model,
          effort: s.effort || null
        })),
        excluded: (resolution.excluded || []).map(e => ({ rung: String(e.rung), reason: String(e.reason) })),
        skipped: (resolution.skipped || []).map(s => ({ rung: String(s.rung), reason: String(s.reason) })),
        unverified: (resolution.unverified || []).map(u => ({ rung: String(u.rung), constraint: String(u.constraint) })),
        approval: resolution.approval || null,
        shortfall: resolution.shortfall || null
      },
      pins: {
        head: slotState.pins.head,
        launchFile: slotState.pins.launchFile,
        launchSha256: slotState.pins.launchSha256,
        roleSha256: null,
        corpusHash: null,
        dispatchVersion: slotState.pins.dispatchVersion
      },
      attempts: recordAttempts,
      budget: {
        freshUsed: recordAttempts.filter(a => a.kind === 'fresh').length,
        resumes: recordAttempts.filter(a => a.kind === 'resume').length,
        stallMin: dispatch.stallMin || 10,
        hardMin: dispatch.hardMin || 120
      },
      cost: { estimated: null, actual: actualCost, cumulative: cumulativeCost, unit: costUnit },
      completion: lastCompletion ? {
        processEnded: lastCompletion.processEnded,
        exitCode: lastCompletion.exitCode,
        outputsPresent: lastCompletion.outputsPresent,
        outputsNonEmpty: lastCompletion.outputsNonEmpty,
        structuralCheck: lastCompletion.structuralCheck,
        validator: lastCompletion.validator,
        evidence: lastCompletion.evidence,
        supervisorDone: lastCompletion.supervisorDone
      } : {
        processEnded: true,
        exitCode: lastAttemptResult ? lastAttemptResult.exitCode : null,
        outputsPresent: false,
        outputsNonEmpty: false,
        structuralCheck: 'none',
        validator: 'n/a',
        evidence: null,
        supervisorDone: false
      },
      state: finalState,
      fallen: finalState === 'FAILED' && recordAttempts.length > 0 && recordAttempts[recordAttempts.length - 1].class === 'STALL',
      transitions,
      outputs: declaredOutputs
    };

    if (runrecordLib) {
      try {
        runrecordLib.appendRecord(runsFile, runRecordObj);
      } catch (err) {
        console.error(`RUNRECORD_ERROR: ${err.message}`);
      }
    }

    if (dispatch.usageFile) {
      updateUsageFile(path.resolve(repoRoot, dispatch.usageFile), repoRoot, runsFile);
    }
  }

  return anyFailed ? 1 : 0;
}

function checkDispatch(dispatchFile, opts = {}) {
  const dispatch = loadDispatch(dispatchFile);
  const repoRoot = getRepoRoot(opts);
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

  let invalidRoute = 0;
  for (const s of slots) {
    if (!s.route) {
      if (!s.role || !s.floor) {
        console.log(`ERROR reason=missing-role-or-floor slot=${s.id}`);
        invalidRoute++;
      }
    }
  }

  if (missing > 0 || invalidRoute > 0) return 1;
  return 0;
}

function statusDispatch(dispatchFile, opts = {}) {
  const dispatch = loadDispatch(dispatchFile);
  const repoRoot = getRepoRoot(opts);
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
  const repoRoot = getRepoRoot(opts);
  const runsFile = opts.runsFile
    ? path.resolve(repoRoot, opts.runsFile)
    : (process.env.PROTOCOL_RUNS_FILE
        ? path.resolve(repoRoot, process.env.PROTOCOL_RUNS_FILE)
        : path.resolve(repoRoot, 'docs/ops/RUNS.jsonl'));

  let records = [];
  if (runrecordLib && fs.existsSync(runsFile)) {
    try {
      records = runrecordLib.readRecords(runsFile);
    } catch {}
  }

  let registry = null;
  try {
    registry = opts.registry
      ? (typeof opts.registry === 'object' ? opts.registry : loadRegistry(opts.registry))
      : loadRegistry();
  } catch {}

  const slots = dispatch.slots || dispatch.jobs;
  for (const s of slots) {
    const outputs = s.outputs || (s.out ? [s.out] : []);
    const matching = records.filter(r => r.slot === s.id);
    if (!matching.length) {
      const routeStr = s.route ? `${s.route.client}:${s.route.model || ''}` : 'none';
      console.log(`REPORT slot=${s.id} route=${routeStr} state=NOT_STARTED attempts=0 outputs="${outputs.join(',')}" usage=none (no-run-record)`);
    } else {
      const rec = matching[matching.length - 1];
      const lastAttempt = (rec.attempts && rec.attempts.length) ? rec.attempts[rec.attempts.length - 1] : null;
      const clientName = (lastAttempt && lastAttempt.route) ? lastAttempt.route.client : (s.route ? s.route.client : null);
      const clientCfg = (registry && registry.clients && clientName) ? registry.clients[clientName] : null;
      const usageKey = clientCfg ? (clientCfg.usage || 'none') : 'none';

      const routeStr = (lastAttempt && lastAttempt.route) ? `${lastAttempt.route.client}:${lastAttempt.route.model || ''}` : 'none';
      let usageStr;
      if (lastAttempt && lastAttempt.usage && lastAttempt.usage.amount !== null) {
        usageStr = `${lastAttempt.usage.amount} ${lastAttempt.usage.unit}`;
      } else {
        if (usageKey === 'none') {
          usageStr = 'none (client usage=none in clients.json)';
        } else {
          usageStr = `none (parser ${usageKey} found no usage in log)`;
        }
      }
      console.log(`REPORT slot=${s.id} route=${routeStr} state=${rec.state} attempts=${rec.attempts ? rec.attempts.length : 0} outputs="${outputs.join(',')}" usage=${usageStr}`);
    }
  }
  return 0;
}

function stopSlot(dispatchFile, slotId, opts = {}) {
  const dispatch = loadDispatch(dispatchFile);
  const repoRoot = getRepoRoot(opts);
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
  const repoRoot = getRepoRoot(opts);
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
    console.log('USAGE command=[probe|check|run|start|status|stop|accept|report|resolve]');
    return 2;
  }

  const cmd = argv[0];
  const rest = argv.slice(1);

  let registryPath = null;
  let modelArg = null;
  let smokeArg = null;
  let stallSec = null;
  let hardSec = null;
  let ladderArg = null;
  let runsFileArg = null;
  let signalsFileArg = null;
  let reviseFlag = false;
  let fastRetryFlag = false;
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
    } else if (a === '--ladder') {
      ladderArg = rest[++i];
      if (!ladderArg || ladderArg.startsWith('--')) {
        console.log('ERROR reason=missing-flag-value flag=--ladder');
        return 2;
      }
    } else if (a === '--runs-file') {
      runsFileArg = rest[++i];
      if (!runsFileArg || runsFileArg.startsWith('--')) {
        console.log('ERROR reason=missing-flag-value flag=--runs-file');
        return 2;
      }
    } else if (a === '--signals-file') {
      signalsFileArg = rest[++i];
      if (!signalsFileArg || signalsFileArg.startsWith('--')) {
        console.log('ERROR reason=missing-flag-value flag=--signals-file');
        return 2;
      }
    } else if (a === '--revise') {
      reviseFlag = true;
    } else if (a === '--fast-retry') {
      fastRetryFlag = true;
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
      case 'resolve': {
        if (positional.length < 2) {
          console.log('ERROR reason=missing-resolve-arguments');
          return 2;
        }
        return resolveCommand(positional[0], positional[1], {
          ladder: ladderArg,
          registry: registryPath
        });
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
          ladder: ladderArg,
          runsFile: runsFileArg,
          signalsFile: signalsFileArg,
          revise: reviseFlag,
          fastRetry: fastRetryFlag,
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
        return reportDispatch(positional[0], { registry: registryPath, runsFile: runsFileArg });
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
  loadLadder,
  verifyLadderSectionSha256,
  resolveSlot,
  resolveCommand,
  computePins,
  verifyPins,
  writeRepairFile,
  checkCompletion,
  mapClassForRunRecord,
  makePointer,
  buildClientCommand,
  formatCommandLine,
  probeClient,
  probeAll,
  executeAttempt,
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
  parseUsageFromLog,
  reportDispatch,
  runDispatch,
  tree,
  killExact,
  killTree,
  isPidAlive,
  FAILURE_CLASSES,
  ERROR_PATTERNS,
  ERROR_TEXT,
  RETRY_TEXT,
  NO_PUSH,
  getRepoRoot
};
