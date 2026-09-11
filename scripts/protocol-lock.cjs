#!/usr/bin/env node
'use strict';

// Cooperative ownership of TASK, PLAN, DECISIONS and ARCHIVE in one checkout.
// This is not an OS write barrier: participating agents must use this command.
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');

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

function operate(root, command, owner) {
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
  if (command === 'status') {
    const lock = read();
    return {
      lock: lock ? { ...lock, ...describeAge(lock) } : null,
      operationInProgress: fs.existsSync(gate),
      staleAfterMinutes: STALE_AFTER_MINUTES,
    };
  }
  if (!['acquire', 'release'].includes(command)) throw new Error('Use acquire, release, or status');
  if (!/^[a-z0-9][a-z0-9._-]{2,95}$/.test(owner || '')) {
    throw new Error('--owner must be a unique session ID (3-96 lowercase letters, digits, dots, underscores or hyphens)');
  }
  fs.mkdirSync(runtime, { recursive: true });
  try { fs.mkdirSync(gate); }
  catch (error) {
    if (error.code === 'EEXIST') {
      throw new Error('Another lock operation is running. Retry; if interrupted, inspect .ai/runtime/shared-writer-operation before recovery.');
    }
    throw error;
  }
  try {
    fs.writeFileSync(path.join(gate, 'operation.json'), JSON.stringify({
      command, owner, pid: process.pid, hostname: os.hostname(), started: new Date().toISOString(),
    }) + '\n', { flag: 'wx' });
    const current = read();
    if (command === 'acquire') {
      if (current) {
        const age = describeAge(current);
        const held = age.heldForMinutes === null ? 'an unknown time' : `${age.heldForMinutes} minute(s)`;
        const advice = age.stale
          ? ` The lock has been held for ${held}, past the ${STALE_AFTER_MINUTES}-minute stale threshold.`
            + ' Confirm that session has finished, then release it with'
            + `: node scripts/protocol-lock.cjs release --owner ${current.owner}`
          : ` Held for ${held}. Wait, or ask that session to release it.`;
        throw new Error(`Shared documents are owned by ${current.owner}; do not overwrite or automatically steal the lock.${advice}`);
      }
      const lock = { owner, acquiredAt: new Date().toISOString(), hostname: os.hostname(),
        worklog: `.ai/worklog/${owner}.md` };
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
  let root = path.resolve(__dirname, '..');
  for (let i = 0; i < options.length; i += 2) {
    if (options[i] === '--owner' && options[i + 1]) owner = options[i + 1];
    else if (options[i] === '--root' && options[i + 1]) root = path.resolve(options[i + 1]);
    else throw new Error('Usage: node scripts/protocol-lock.cjs acquire|release|status [--owner session-id] [--root path]');
  }
  process.stdout.write(JSON.stringify(operate(root, command, owner), null, 2) + '\n');
}

if (require.main === module) {
  try { main(process.argv.slice(2)); }
  catch (error) { process.stderr.write(`AI protocol: ${error.message}\n`); process.exitCode = 1; }
}
module.exports = { operate };
