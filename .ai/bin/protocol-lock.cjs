#!/usr/bin/env node
'use strict';

// Cooperative ownership of TASK, PLAN, DECISIONS and ARCHIVE in one checkout.
// This is not an OS write barrier: participating agents must use this command.
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const crypto = require('node:crypto');
const { isSessionAlive, checkProcessAlive } = require('./protocol-session.cjs');

// A lock older than this is reported as stale. It is never stolen automatically:
// DEC-0009 requires inspection before recovery, because a live holder that is
// merely slow looks exactly like one that died.
const STALE_AFTER_MINUTES = 120;

function describeAge(lock) {
  const started = Date.parse(lock && (lock.acquiredAt || lock.acquired));
  if (!Number.isFinite(started)) return { heldForMinutes: null, stale: null };
  const heldForMinutes = Math.max(0, Math.round((Date.now() - started) / 60000));
  return { heldForMinutes, stale: heldForMinutes >= STALE_AFTER_MINUTES };
}

function isRegisteredLock(root, lock) {
  if (!lock || !lock.tokenHash) return false;
  if (lock.hostname !== os.hostname()) return false;
  const targetPid = (typeof lock.sessionPid === 'number' && Number.isInteger(lock.sessionPid) && lock.sessionPid > 0)
    ? lock.sessionPid
    : lock.pid;
  if (!checkProcessAlive(targetPid)) return false;

  const stateFile = path.join(root, '.ai', 'runtime', `${lock.owner}.json`);
  try {
    const state = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
    if (!state || !state.nonce) return false;
    const computedHash = crypto.createHash('sha256').update(String(state.nonce)).digest('hex');
    return computedHash === lock.tokenHash;
  } catch {
    return false;
  }
}

function operate(root, command, owner, forceOrOptions = false) {
  const force = typeof forceOrOptions === 'boolean' ? forceOrOptions : Boolean(forceOrOptions && forceOrOptions.force);
  root = fs.realpathSync(root);
  if (!fs.existsSync(path.join(root, 'AGENTS.md')) || !fs.existsSync(path.join(root, '.ai'))) {
    throw new Error('Expected a protocol checkout containing AGENTS.md and .ai');
  }
  const runtime = path.join(root, '.ai', 'runtime');
  const lockFile = path.join(runtime, 'shared-writer.json');
  const gate = path.join(runtime, 'shared-writer-operation');
  const read = () => {
    try { return JSON.parse(fs.readFileSync(lockFile, 'utf8')); }
    catch (error) { if (error.code === 'ENOENT') return null; throw error; }
  };
  // A lock operation that is killed between creating this gate and removing it
  // used to block every later acquire and release for good. The gate now
  // reports whose process it belongs to and whether that process is still
  // alive, and there is a command to clear an abandoned one. See DEC-0021.
  const gateRecord = () => {
    try { return JSON.parse(fs.readFileSync(path.join(gate, 'operation.json'), 'utf8')); }
    catch (error) { return null; }
  };
  const processAlive = isSessionAlive;
  if (command === 'clear-operation') {
    if (!fs.existsSync(gate)) return { cleared: false, reason: 'no operation gate is present' };
    const record = gateRecord();
    const alive = processAlive(record);
    if (alive === true) {
      throw new Error(`Process ${record.pid} still holds the operation gate. Wait for it to finish.`);
    }
    if (alive === null && !force) {
      throw new Error('Cannot tell whether the gate owner is alive: it was created on another host '
        + 'or carries no process id. Inspect .ai/runtime/shared-writer-operation, then pass --force.');
    }
    fs.rmSync(gate, { recursive: true, force: true });
    return { cleared: true, previousOwner: record ? record.owner : null };
  }
  if (command === 'clear-lock') {
    const current = read();
    if (!current) return { cleared: false, reason: 'no lock is currently held' };
    const alive = processAlive(current);
    const isRegLive = isRegisteredLock(root, current);

    if (isRegLive) {
      const reason = (typeof forceOrOptions === 'object' && forceOrOptions && forceOrOptions.reason)
        ? String(forceOrOptions.reason).trim()
        : '';
      if (force && reason) {
        process.stderr.write(`[AUDIT WARN] Forcefully clearing live registered lock held by ${current.owner} (sessionPid ${current.sessionPid || current.pid}): ${reason}\n`);
        fs.unlinkSync(lockFile);
        return { cleared: true, previousOwner: current.owner, forced: true };
      }
      if (force && !reason) {
        throw new Error('Clearing a live registered lock requires --force and --reason "<explanation>"');
      }
      throw new Error(`Process ${current.sessionPid || current.pid} still holds the registered lock. Wait for it to finish.`);
    }

    if (alive === true) {
      throw new Error(`Process ${current.pid} still holds the lock. Wait for it to finish.`);
    }
    if (alive === null && !force) {
      throw new Error('Cannot tell whether the lock owner is alive: it was created on another host '
        + 'or carries no process id. Inspect .ai/runtime/shared-writer.json, then pass --force.');
    }
    fs.unlinkSync(lockFile);
    return { cleared: true, previousOwner: current.owner };
  }
  if (command === 'status') {
    const lock = read();
    return {
      lock: lock ? {
        ...lock,
        alive: processAlive(lock),
        liveness: lock.tokenHash ? 'registered' : 'cooperative',
        ...describeAge(lock),
      } : null,
      operationInProgress: fs.existsSync(gate),
      staleAfterMinutes: STALE_AFTER_MINUTES,
    };
  }
  if (!['acquire', 'release', 'clear-lock'].includes(command)) {
    throw new Error('Use acquire, release, status, clear-operation or clear-lock');
  }
  if (!/^[a-z0-9][a-z0-9._-]{2,95}$/.test(owner || '')) {
    throw new Error('--owner must be a unique session ID (3-96 lowercase letters, digits, dots, underscores or hyphens)');
  }
  fs.mkdirSync(runtime, { recursive: true });
  try { fs.mkdirSync(gate); }
  catch (error) {
    if (error.code === 'EEXIST') {
      const record = gateRecord();
      const alive = processAlive(record);
      if (alive === true) {
        throw new Error(`Another lock operation is running (process ${record.pid}). Retry shortly.`);
      }
      throw new Error('A lock operation was interrupted and left its gate behind'
        + (record && record.owner ? ` (owner ${record.owner})` : '')
        + '. Nothing is holding it now. Clear it with'
        + ': node .ai/bin/protocol-lock.cjs clear-operation');
    }
    throw error;
  }
  try {
    fs.writeFileSync(path.join(gate, 'operation.json'), JSON.stringify({
      command, owner, pid: process.pid, hostname: os.hostname(), started: new Date().toISOString(),
    }) + '\n', { flag: 'wx' });
    const current = read();
    if (command === 'acquire') {
      let declaredSessionPid = null;
      let tokenHash = null;

      const opts = (typeof forceOrOptions === 'object' && forceOrOptions) ? forceOrOptions : {};
      const sessionPidArg = opts.sessionPid;
      const sessionTokenArg = opts.sessionToken;

      const stateFile = path.join(runtime, `${owner}.json`);
      let state = null;
      if (fs.existsSync(stateFile)) {
        try { state = JSON.parse(fs.readFileSync(stateFile, 'utf8')); } catch {}
      }

      if (sessionTokenArg) {
        if (!state || !state.nonce) {
          throw new Error(`Invalid --session-token: no registered session found for owner ${owner}`);
        }
        const givenHash = crypto.createHash('sha256').update(String(sessionTokenArg)).digest('hex');
        const expectedHash = crypto.createHash('sha256').update(String(state.nonce)).digest('hex');
        if (givenHash !== expectedHash) {
          throw new Error('Invalid --session-token: token does not match registered session');
        }
        tokenHash = givenHash;
      }

      if (sessionPidArg !== null && sessionPidArg !== undefined) {
        const num = Number(sessionPidArg);
        if (!Number.isInteger(num) || num <= 4 || num > 0x7fffffff) {
          throw new Error(`Invalid --session-pid value: ${sessionPidArg} (must be a positive integer > 4 (reserved system PID) and <= 2147483647)`);
        }
        if (!checkProcessAlive(num)) {
          throw new Error(`Invalid --session-pid value: ${sessionPidArg} (target process is not running)`);
        }

        const isOwn = (num === process.pid);
        const isParent = (Boolean(process.ppid) && num === process.ppid);
        const isRegisteredPid = Boolean(state && (state.pid === num || state.supervisorPid === num));
        const isRegistered = Boolean(isRegisteredPid && tokenHash);

        if (!isOwn && !isParent && !isRegistered) {
          if (isRegisteredPid && !tokenHash) {
            throw new Error(`--session-pid ${num} matches registered session for ${owner}, but requires valid --session-token`);
          }
          throw new Error(`--session-pid ${num} is not bound to this session (must be process.pid, process.ppid, or registered PID with valid --session-token)`);
        }
        declaredSessionPid = num;
      }

      if (current) {
        if (current.owner === owner) return { acquired: true, ...current };
        const isRegLive = isRegisteredLock(root, current);
        if (isRegLive) {
          const reason = (typeof forceOrOptions === 'object' && forceOrOptions && forceOrOptions.reason)
            ? String(forceOrOptions.reason).trim()
            : '';
          if (force && reason) {
            process.stderr.write(`[AUDIT WARN] Forcefully acquiring lock over live registered lock held by ${current.owner} (sessionPid ${current.sessionPid || current.pid}): ${reason}\n`);
            fs.unlinkSync(lockFile);
          } else if (force && !reason) {
            throw new Error('Clearing a live registered lock requires --force and --reason "<explanation>"');
          } else {
            throw new Error(`Shared documents are owned by ${current.owner}; do not overwrite or automatically steal the lock. Live registered lock held by process ${current.sessionPid || current.pid}.`);
          }
        } else {
          const alive = processAlive(current);
          if (alive === false) {
            if (force) {
              fs.unlinkSync(lockFile);
            } else {
              throw new Error(`Shared documents were locked by ${current.owner} (pid ${current.sessionPid || current.pid}), `
                + 'but that process is no longer running. Nothing is holding it now. '
                + 'Pass --force to take ownership, or clear it with: node .ai/bin/protocol-lock.cjs clear-lock');
            }
          } else if (alive === null && force) {
            fs.unlinkSync(lockFile);
          } else {
            const age = describeAge(current);
            const held = age.heldForMinutes === null ? 'an unknown time' : `${age.heldForMinutes} minute(s)`;
            const advice = age.stale
              ? ` The lock has been held for ${held}, past the ${STALE_AFTER_MINUTES}-minute stale threshold.`
                + ' Confirm that session has finished, then release it with'
                + `: node .ai/bin/protocol-lock.cjs release --owner ${current.owner}`
              : ` Held for ${held}. Wait, or ask that session to release it.`;
            throw new Error(`Shared documents are owned by ${current.owner}; do not overwrite or automatically steal the lock.${advice}`);
          }
        }
      }

      const lock = {
        owner,
        acquiredAt: new Date().toISOString(),
        pid: process.pid,
        sessionPid: declaredSessionPid,
        tokenHash: tokenHash,
        hostname: os.hostname(),
        worklog: `.ai/worklog/${owner}.md`
      };
      fs.writeFileSync(lockFile, JSON.stringify(lock, null, 2) + '\n', { flag: 'wx' });
      return { acquired: true, ...lock };
    }
    if (!current) throw new Error('No shared-document owner is recorded');
    if (current.owner !== owner) throw new Error(`Cannot release another session's lock (${current.owner})`);
    fs.unlinkSync(lockFile);
    return { released: true, owner };
  } finally {
    const record = path.join(gate, 'operation.json');
    if (fs.existsSync(record)) fs.unlinkSync(record);
    fs.rmdirSync(gate);
  }
}

function main(args) {
  const [command, ...options] = args;
  let owner;
  let force = false;
  let sessionPid = null;
  let sessionToken = null;
  let reason = null;
  let root = path.resolve(__dirname, '..', '..');
  for (let i = 0; i < options.length; i += 1) {
    if (options[i] === '--force') {
      force = true;
    } else if (options[i] === '--owner') {
      if (!options[i + 1]) throw new Error('Missing value for --owner');
      owner = options[i + 1];
      i += 1;
    } else if (options[i] === '--session-pid') {
      if (!options[i + 1]) throw new Error('Missing value for --session-pid');
      sessionPid = Number(options[i + 1]);
      i += 1;
    } else if (options[i] === '--session-token') {
      if (!options[i + 1]) throw new Error('Missing value for --session-token');
      sessionToken = options[i + 1];
      i += 1;
    } else if (options[i] === '--reason') {
      if (!options[i + 1]) throw new Error('Missing value for --reason');
      reason = options[i + 1];
      i += 1;
    } else if (options[i] === '--root') {
      if (!options[i + 1]) throw new Error('Missing value for --root');
      root = path.resolve(options[i + 1]);
      i += 1;
    } else {
      throw new Error('Usage: node .ai/bin/protocol-lock.cjs acquire|release|status|clear-operation|clear-lock [--owner id] [--root path] [--session-pid pid] [--session-token token] [--force] [--reason text]');
    }
  }
  process.stdout.write(JSON.stringify(operate(root, command, owner, { force, sessionPid, sessionToken, reason }), null, 2) + '\n');
}

if (require.main === module) {
  try { main(process.argv.slice(2)); }
  catch (error) { process.stderr.write(`AI protocol: ${error.message}\n`); process.exitCode = 1; }
}
module.exports = { operate };
