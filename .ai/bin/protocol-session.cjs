#!/usr/bin/env node
'use strict';

// Session entry point for assistants without hooks.
//
// Claude and Codex get their journal and their context from a SessionStart
// hook. Any other assistant, reached through a chat panel or a custom
// endpoint, gets nothing: no journal, no injected state, no Stop reminder.
// It could still take part, because AGENTS.md section 5 defines the naming,
// but it had to know to do all of it by hand.
//
// This runs the same engine the hooks run, so a session started here is
// indistinguishable from a hooked one.
//
//   start --agent <name> [--session <id>]   create the journal, print context
//   stop  --agent <name> --session <id>     the Stop check, as a message
//   whoami --agent <name> --session <id>    print the journal and owner name
//
// The printed owner name is what to pass to protocol-lock.cjs and
// protocol-handoff.cjs, so one identity covers journal, lock and evidence.

const crypto = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const hooks = require('./protocol-hooks.cjs');

const RECENT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes (D2 heuristic)

function checkProcessAlive(pid) {
  if (typeof pid !== 'number' || !Number.isInteger(pid) || pid <= 4) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return error.code === 'EPERM';
  }
}

function isSessionAlive(record) {
  if (!record || record.hostname !== os.hostname()) return null;
  if (typeof record.supervisorPid === 'number' && Number.isInteger(record.supervisorPid) && record.supervisorPid > 4) {
    if (checkProcessAlive(record.supervisorPid)) return true;
    // dead supervisorPid falls through to pid
  }
  const targetPid = (typeof record.sessionPid === 'number' && Number.isInteger(record.sessionPid) && record.sessionPid > 4)
    ? record.sessionPid
    : record.pid;
  if (typeof targetPid !== 'number' || !Number.isInteger(targetPid) || targetPid <= 4) return null;
  return checkProcessAlive(targetPid);
}

const isProcessAlive = isSessionAlive;

function parse(argv) {
  const command = argv[0];
  const options = {};
  for (let i = 1; i < argv.length; i += 1) {
    if (argv[i] === '--dry-run') { options.dryRun = true; continue; }
    if (argv[i] === '--force') { options.force = true; continue; }
    const value = argv[i + 1];
    if (!value) throw new Error(`Missing value for ${argv[i]}`);
    if (argv[i] === '--agent') options.agent = value;
    else if (argv[i] === '--session') options.session = value;
    else if (argv[i] === '--supervisor-pid') options.supervisorPid = value;
    else if (argv[i] === '--root') options.root = value;
    else throw new Error('Usage: protocol-session.cjs start|stop|whoami|prune|cleanup-runtime --agent <name> [--session <id>] [--root <path>] [--supervisor-pid <pid>] [--force]');
    i += 1;
  }
  // prune and cleanup-runtime are about directory hygiene, not about one assistant.
  if (command !== 'prune' && command !== 'cleanup-runtime' && !options.agent) {
    throw new Error('This command needs --agent <name>, for example --agent qwen');
  }
  if (options.agent && !hooks.AGENT_NAME.test(options.agent)) {
    throw new Error('Agent name must be 2 to 24 lowercase letters, digits or hyphens, starting with a letter.');
  }
  return { command, options };
}

function main(argv) {
  const { command, options } = parse(argv);
  const input = { cwd: options.root || process.cwd() };

  if (command === 'start') {
    if (options.supervisorPid !== undefined) {
      const supPid = Number(options.supervisorPid);
      if (!Number.isInteger(supPid) || supPid <= 4 || supPid > 0x7fffffff) {
        throw new Error(`Invalid --supervisor-pid: ${options.supervisorPid} (must be an integer > 4 (reserved system PID))`);
      }
      if (!checkProcessAlive(supPid)) {
        throw new Error(`Invalid --supervisor-pid: process ${supPid} is not alive`);
      }
      input.supervisor_pid = supPid;
    }
    input.session_id = options.session || crypto.randomBytes(8).toString('hex');
    const result = hooks.run('SessionStart', input, options.agent);
    const paths = hooks.sessionPaths(
      fs.realpathSync(input.cwd), input.session_id, options.agent);
    const owner = path.basename(paths.worklog, '.md');
    const state = hooks.readState(paths.state);
    const token = state ? (state.nonce || '') : '';
    process.stdout.write(`${result.hookSpecificOutput.additionalContext}\n`);
    process.stdout.write('---\n\n');
    process.stdout.write(`Session id: ${options.session || input.session_id}\n`);
    process.stdout.write(`Owner name for the lock and for evidence: ${owner}\n`);
    process.stdout.write(`Session token: ${token}\n`);
    if (input.supervisor_pid) {
      process.stdout.write(`Session supervisor PID for lock calls: ${input.supervisor_pid}\n`);
    } else {
      process.stdout.write(`Session PID for lock calls: ${process.pid}\n`);
    }
    process.stdout.write(`Journal: ${paths.worklog}\n`);
    return 0;
  }

  if (command === 'stop') {
    if (!options.session) throw new Error('stop needs the --session id that start printed');
    input.session_id = options.session;
    const result = hooks.run('Stop', input, options.agent);
    if (result && result.systemMessage) {
      process.stderr.write(`${result.systemMessage}\n`);
      return 1;
    }
    // An empty result means the Stop check found nothing to warn about, which
    // also happens when nothing changed and nothing was written. Saying a
    // handoff was recorded in that case was a claim the tool could not support.
    const paths = hooks.sessionPaths(
      fs.realpathSync(input.cwd), options.session, options.agent);
    const file = path.join(
      fs.realpathSync(input.cwd), paths.worklog);
    let entry = null;
    try { entry = hooks.latestCompleteEntry(fs.readFileSync(file, 'utf8')); }
    catch (error) { if (error.code !== 'ENOENT') throw error; }
    process.stdout.write(entry
      ? `Nothing outstanding. ${paths.worklog} holds a complete entry.\n`
      : `Nothing changed in the tree, and ${paths.worklog} holds no complete entry. Nothing was handed off.\n`);
    if (result && (result.durationSec !== undefined || result.changedFiles !== undefined)) {
      const elapsed = (result.durationSec !== undefined && result.durationSec !== null)
        ? ` in ~${result.durationSec}s` : '';
      const firstEdit = (result.firstEditMs !== undefined && result.firstEditMs !== null)
        ? `, first edit at +${result.firstEditMs}ms` : '';
      const handoff = result.handoffComplete !== undefined
        ? `, handoff ${result.handoffComplete ? 'complete' : 'incomplete'}` : '';
      process.stdout.write(`Session telemetry: ${result.changedFiles || 0} file(s) changed${elapsed}${firstEdit}${handoff}.\n`);
    }
    // Surface advisory warnings (missing Evidence, non-standard format, out-of-role work).
    if (result && result.stopWarnings && result.stopWarnings.length) {
      process.stderr.write('\nAdvisory:\n');
      for (const warning of result.stopWarnings) {
        process.stderr.write(`  [WARN] ${warning}\n`);
      }
    }
    // Auto-archive older entries if journal exceeded 150 lines (Fork 2).
    try {
      const archive = require('./protocol-archive.cjs');
      const owner = path.basename(paths.worklog, '.md');
      archive.autoArchiveWorklog(fs.realpathSync(input.cwd), paths.worklog, 150, 1, owner);
    } catch { }
    return 0;
  }

  if (command === 'prune') {
    // Every SessionStart creates a journal, so a session that starts and writes
    // nothing leaves an empty file behind. Only files that hold nothing at all
    // are removed. Matching the canonical heading alone deleted a full audit
    // whose heading carried a time stamp, so any ATX heading or any entry label
    // now counts as content; a nonstandard entry is kept, never destroyed.
    // Active sessions (whose process is alive) and active lock holders are
    // protected from accidental removal unless --force is specified.
    // fs, path, os are module-level imports
    const root = fs.realpathSync(input.cwd);
    const directory = path.join(root, '.ai', 'worklog');
    if (!fs.existsSync(directory)) throw new Error('No .ai/worklog directory here.');

    let activeLockOwner = null;
    try {
      const lockData = JSON.parse(fs.readFileSync(path.join(root, '.ai', 'runtime', 'shared-writer.json'), 'utf8'));
      activeLockOwner = lockData && lockData.owner;
    } catch { }


    const holdsContent = text => /^##[ \t]/m.test(text) || /^(?:Agent|Action|Result|Next step|Open):/m.test(text);
    const empty = fs.readdirSync(directory)
      .filter(name => name.endsWith('.md') && name !== 'README.md')
      .filter(name => !holdsContent(fs.readFileSync(path.join(directory, name), 'utf8')));
    if (!empty.length) {
      process.stdout.write('No empty journals.\n');
      return 0;
    }
    let removedCount = 0;
    for (const name of empty) {
      const owner = path.basename(name, '.md');
      const journalPath = path.join(directory, name);
      const journalStat = fs.statSync(journalPath);
      const isRecent = journalStat.mtimeMs >= (Date.now() - RECENT_WINDOW_MS);

      if (activeLockOwner && owner === activeLockOwner) {
        process.stdout.write(`skipping ${name} (active lock holder)\n`);
        continue;
      }

      const stateFile = path.join(root, '.ai', 'runtime', `${owner}.json`);
      let state = null;
      let hasState = false;
      if (fs.existsSync(stateFile)) {
        try {
          state = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
          hasState = true;
        } catch { }
      }

      const liveness = hasState ? isSessionAlive(state) : null;

      // Table 5.2: true -> skip (even with --force)
      if (liveness === true) {
        const livePid = (state && (state.supervisorPid || state.pid)) || 'unknown';
        process.stdout.write(`skipping ${name} (active session process ${livePid})\n`);
        continue;
      }

      if (!options.force) {
        // Table 5.2: null -> preserve
        if (hasState && liveness === null) {
          process.stdout.write(`skipping ${name} (unknown liveness or foreign host)\n`);
          continue;
        }

        // 5.3 Recency fallback: when liveness is false or null (e.g. missing state),
        // treat as active while mtime >= now - RECENT_WINDOW (15 min)
        if (isRecent) {
          process.stdout.write(`skipping ${name} (recent empty journal)\n`);
          continue;
        }
      } else {
        // With --force:
        // Table 5.2: null -> --force may quarantine with an audit message
        if (hasState && liveness === null) {
          process.stderr.write(`[AUDIT WARN] quarantining foreign host or unknown liveness journal ${name} with --force\n`);
        }
        // --force overrides recency for liveness === false or missing state
      }

      if (options.dryRun) { process.stdout.write(`would quarantine ${name}\n`); continue; }
      const quarantine = path.join(root, '.ai', 'runtime', 'pruned');
      fs.mkdirSync(quarantine, { recursive: true });
      fs.renameSync(journalPath, path.join(quarantine, name));
      // Its snapshot is disposable too and belongs to a session that is gone.
      if (fs.existsSync(stateFile)) fs.rmSync(stateFile);
      process.stdout.write(`quarantined ${name}\n`);
      removedCount += 1;
    }
    process.stdout.write(`${removedCount} journal(s) quarantined.\n`);
    return 0;
  }

  if (command === 'cleanup-runtime') {
    // Remove orphaned snapshots whose journals no longer exist, stale temporary
    // files (*.tmp), and dead session snapshots older than 24h. Shared-writer state is never touched.
    // fs, path, os are module-level imports
    const root = fs.realpathSync(input.cwd);
    const runtimeDir = path.join(root, '.ai', 'runtime');
    if (!fs.existsSync(runtimeDir)) { process.stdout.write('No .ai/runtime directory.\n'); return 0; }
    const worklogDir = path.join(root, '.ai', 'worklog');
    const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const tempCutoff = Date.now() - 60 * 60 * 1000;
    let cleaned = 0;

    let activeLockOwner = null;
    try {
      const lockData = JSON.parse(fs.readFileSync(path.join(runtimeDir, 'shared-writer.json'), 'utf8'));
      activeLockOwner = lockData && lockData.owner;
    } catch { }


    for (const name of fs.readdirSync(runtimeDir)) {
      const fullPath = path.join(runtimeDir, name);
      const stat = fs.statSync(fullPath);
      // Never touch directories (pruned/, codex-schema/) or lock files.
      if (stat.isDirectory()) continue;
      if (name.startsWith('shared-writer')) continue;

      // Temporary files older than 1 hour (*.tmp)
      if (name.endsWith('.tmp') && stat.mtimeMs < tempCutoff) {
        if (options.dryRun) { process.stdout.write(`would remove temp ${name}\n`); continue; }
        fs.rmSync(fullPath);
        process.stdout.write(`removed temp ${name}\n`);
        cleaned += 1;
        continue;
      }

      // Snapshots: .json files
      if (name.endsWith('.json')) {
        const owner = name.replace(/\.json$/, '');
        if (activeLockOwner && owner === activeLockOwner) continue;

        let state = null;
        try { state = JSON.parse(fs.readFileSync(fullPath, 'utf8')); } catch { }

        const liveness = isSessionAlive(state);

        // Table 5.2 (:247): true -> skip (even with --force)
        if (liveness === true) continue;

        const journal = name.replace(/\.json$/, '.md');
        // Orphaned snapshots: .json files whose journal no longer exists
        if (!fs.existsSync(path.join(worklogDir, journal))) {
          if (options.dryRun) { process.stdout.write(`would remove orphan ${name}\n`); continue; }
          fs.rmSync(fullPath);
          process.stdout.write(`removed orphan ${name}\n`);
          cleaned += 1;
          continue;
        }

        // Table 5.2 (:247): null -> preserve (even with --force)
        if (liveness === null) continue;

        // Snapshots from dead session processes older than 24 hours (or if --force and process dead)
        // Table 5.2 (:261): false -> existing --force/24h rule
        if (options.force || stat.mtimeMs < (Date.now() - 24 * 60 * 60 * 1000)) {
          if (liveness === false) {
            if (options.dryRun) { process.stdout.write(`would remove dead session snapshot ${name}\n`); continue; }
            fs.rmSync(fullPath);
            process.stdout.write(`removed dead session snapshot ${name}\n`);
            cleaned += 1;
            continue;
          }
        }

        // Stale snapshots older than 7 days — only if process is confirmed dead
        // Table 5.2 (:272): false -> existing 7d rule
        if (stat.mtimeMs < cutoff && liveness === false) {
          if (options.dryRun) { process.stdout.write(`would remove stale ${name}\n`); continue; }
          fs.rmSync(fullPath);
          process.stdout.write(`removed stale ${name}\n`);
          cleaned += 1;
          continue;
        }

        continue;
      }

      // Non-snapshot files older than 7 days (logs, scripts, probes).
      if (stat.mtimeMs < cutoff) {
        if (options.dryRun) { process.stdout.write(`would remove stale ${name}\n`); continue; }
        fs.rmSync(fullPath);
        process.stdout.write(`removed stale ${name}\n`);
        cleaned += 1;
      }
    }
    // Clean up pruned quarantine older than 30 days.
    const prunedDir = path.join(runtimeDir, 'pruned');
    if (fs.existsSync(prunedDir)) {
      const prunedCutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
      for (const name of fs.readdirSync(prunedDir)) {
        const fullPath = path.join(prunedDir, name);
        const stat = fs.statSync(fullPath);
        if (stat.mtimeMs < prunedCutoff) {
          if (options.dryRun) { process.stdout.write(`would purge quarantined ${name}\n`); continue; }
          fs.rmSync(fullPath);
          process.stdout.write(`purged quarantined ${name}\n`);
          cleaned += 1;
        }
      }
    }
    process.stdout.write(`${cleaned} file(s) cleaned.\n`);
    return 0;
  }

  if (command === 'whoami') {
    if (!options.session) throw new Error('whoami needs the --session id that start printed');
    const paths = hooks.sessionPaths(
      fs.realpathSync(input.cwd), options.session, options.agent);
    const owner = path.basename(paths.worklog, '.md');
    const state = hooks.readState(paths.state);
    const token = state ? (state.nonce || null) : null;
    const supervisorPid = state ? (state.supervisorPid || null) : null;
    process.stdout.write(`${JSON.stringify({ owner, worklog: paths.worklog, sessionToken: token, supervisorPid }, null, 2)}\n`);
    return 0;
  }

  throw new Error('Usage: protocol-session.cjs start|stop|whoami|prune|cleanup-runtime --agent <name> [--session <id>]');
}

if (require.main === module) {
  try { process.exitCode = main(process.argv.slice(2)); }
  catch (error) { process.stderr.write(`AI protocol: ${error.message}\n`); process.exitCode = 1; }
}
module.exports = {
  main,
  parse,
  isSessionAlive,
  isProcessAlive,
  checkProcessAlive,
  RECENT_WINDOW_MS,
};
