'use strict';

// Shared SessionStart/Stop logic. Product entrypoints supply their namespace.
// stdin.cwd always locates the active worktree, including linked worktrees.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const os = require('node:os');
const { spawnSync } = require('node:child_process');

const VERSION = 1;
const MAX_CONTEXT = 9500;

function digest(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function git(root, args) {
  const result = spawnSync('git', ['-C', root, ...args], {
    encoding: 'utf8', windowsHide: true, maxBuffer: 32 * 1024 * 1024,
    timeout: 20000,
  });
  if (result.error || result.status !== 0) {
    throw new Error(`Git ${args[0]} failed: ${result.error?.message || result.stderr.trim()}`);
  }
  return result.stdout;
}

function rootFor(input, agent) {
  const cwd = input.cwd || (agent === 'claude' && process.env.CLAUDE_PROJECT_DIR) || process.cwd();
  const root = git(cwd, ['rev-parse', '--show-toplevel']).trim();
  if (!fs.existsSync(path.join(root, '.ai', 'TASK.md'))) {
    throw new Error(`No .ai/TASK.md in the active checkout ${root}; install the protocol there.`);
  }
  return root;
}

// Git already knows every tracked file's content by its blob hash, and which
// files differ from it. Re-hashing the whole working tree cost about six
// seconds per hook on a fifty-thousand-file repository, on every response.
//
// The identity of a file must not depend on whether Git happens to be tracking
// it yet, or evidence recorded before `git add` would not survive it. So a
// working-tree file is identified by the same Git blob hash the index would
// hold for it, including path-specific conversions. See DEC-0015 and DEC-0016.
const SNAPSHOT_FORMAT = 4;
const DIRTY_SYMBOL = Symbol('protocol snapshot dirty');

function blobId(content) {
  const header = Buffer.from(`blob ${content.length}${String.fromCharCode(0)}`);
  return crypto.createHash('sha1').update(Buffer.concat([header, content])).digest('hex');
}

function fingerprint(filename) {
  let stat;
  try { stat = fs.lstatSync(filename); }
  catch (error) { if (error.code === 'ENOENT') return null; throw error; }
  // Git stores a symlink as a blob holding its target path.
  if (stat.isSymbolicLink()) return `120000:${blobId(Buffer.from(fs.readlinkSync(filename)))}`;
  if (stat.isDirectory()) return 'directory'; // Git submodules are separate repositories.
  if (!stat.isFile()) throw new Error(`Unsupported file type: ${filename}`);
  const mode = (stat.mode & 0o111) ? '100755' : '100644';
  return `${mode}:${blobId(fs.readFileSync(filename))}`;
}

function hashWorkingFiles(root, entries, identities) {
  if (!entries.length) return;
  const trustMode = git(root, ['config', '--type=bool', '--default', 'true', '--get', 'core.filemode'])
    .trim() === 'true';
  const hashBatch = batch => {
    // Git applies each path's attributes, clean filters and encoding. Raw
    // bytes are not necessarily the blob git add stores (for example CRLF).
    // Pass filenames as arguments, never shell code or newline-separated stdin.
    const hashes = git(root, ['hash-object', '--', ...batch.map(item => item.name)])
      .trim().split(/\r?\n/);
    if (hashes.length !== batch.length || hashes.some(hash => !/^(?:[a-f0-9]{40}|[a-f0-9]{64})$/.test(hash))) {
      throw new Error('Git hash-object returned unexpected file identities.');
    }
    batch.forEach((item, i) => {
      const mode = trustMode
        ? ((item.mode & 0o111) ? '100755' : '100644')
        : (item.indexMode === '100755' ? '100755' : '100644');
      identities.set(item.name, `${mode}:${hashes[i]}`);
    });
  };
  let batch = [];
  let characters = 0;
  for (const entry of entries) {
    // Leave ample room below Windows' command-line limit, including quoting.
    const size = entry.name.length * 2 + 4;
    if (batch.length && (batch.length >= 128 || characters + size > 12000)) {
      hashBatch(batch);
      batch = [];
      characters = 0;
    }
    batch.push(entry);
    characters += size;
  }
  if (batch.length) hashBatch(batch);
}

function snapshot(root) {
  const names = new Set(git(root, ['ls-files', '--cached', '--others', '--exclude-standard', '-z'])
    .split('\0').filter(Boolean));
  const index = new Map();
  const indexModes = new Map();
  for (const record of git(root, ['ls-files', '--stage', '-z']).split('\0').filter(Boolean)) {
    const separator = record.indexOf('\t');
    const name = record.slice(separator + 1);
    const parts = record.slice(0, separator).split(/\s+/);
    // mode, object id. Keep every stage so a conflicted path stays distinct.
    index.set(name, `${index.get(name) || ''}${parts[0]}:${parts[1]};`);
    if (parts[2] === '0') indexModes.set(name, parts[0]);
  }
  // --no-renames keeps every record a single path, so NUL parsing stays simple.
  const dirty = new Set();
  for (const record of git(root, ['status', '--porcelain=v1', '-uall', '-z', '--no-renames'])
    .split('\0').filter(Boolean)) {
    if (record.length > 3) dirty.add(record.slice(3));
  }
  const identities = new Map();
  const regular = [];
  for (const name of [...names].sort()) {
    // Runtime is disposable. Worklogs and cold archive are checked separately.
    if (name.startsWith('.ai/runtime/') || name.startsWith('.ai/worklog/') || name === '.ai/ARCHIVE.md') continue;
    const staged = index.get(name);
    // Clean tracked entries need no file reads or extra Git subprocesses.
    if (staged && !dirty.has(name)) {
      identities.set(name, staged.replace(/;$/, ''));
      continue;
    }
    const filename = path.join(root, name);
    let stat;
    try { stat = fs.lstatSync(filename); }
    catch (error) {
      if (error.code !== 'ENOENT') throw error;
      identities.set(name, null);
      continue;
    }
    if (stat.isFile()) {
      regular.push({ name, mode: stat.mode, indexMode: indexModes.get(name) });
    }
    else {
      // Journal fingerprints remain raw and independent of repository filters.
      // Symlinks/directories retain their existing snapshot handling too.
      identities.set(name, fingerprint(filename));
    }
  }
  hashWorkingFiles(root, regular, identities);
  const files = {};
  for (const name of [...identities.keys()].sort()) {
    Object.defineProperty(files, name, {
      value: String(identities.get(name)), enumerable: true, configurable: true,
    });
  }
  Object.defineProperty(files, DIRTY_SYMBOL, { value: dirty.size > 0 });
  return files;
}

function changedFiles(before, after) {
  return [...new Set([...Object.keys(before), ...Object.keys(after)])]
    .filter(name => before[name] !== after[name]);
}

// Any assistant may take part, not only the two with hooks. The name becomes a
// filename, so it is restricted to a slug rather than to a fixed list. See
// DEC-0019.
const AGENT_NAME = /^[a-z][a-z0-9-]{1,23}$/;

function sessionPaths(root, sessionId, agent = 'claude') {
  if (!AGENT_NAME.test(agent)) {
    throw new Error('Agent name must be 2 to 24 lowercase letters, digits or hyphens, starting with a letter.');
  }
  if (typeof sessionId !== 'string' || !sessionId.trim()) {
    throw new Error('Hook input has no session_id; per-session tracking is unavailable.');
  }
  const key = digest(sessionId).slice(0, 16);
  return {
    state: path.join(root, '.ai', 'runtime', `${agent}-${key}.json`),
    worklog: `.ai/worklog/${agent}-${key}.md`,
  };
}

function readState(filename) {
  try {
    const state = JSON.parse(fs.readFileSync(filename, 'utf8'));
    if (state.version !== VERSION || !state.files || typeof state.files !== 'object' ||
        Array.isArray(state.files) || !Object.hasOwn(state, 'entryHash')) {
      throw new Error('unsupported snapshot format');
    }
    return state;
  } catch (error) {
    if (error.code === 'ENOENT') return null;
    throw new Error(`Cannot read session snapshot: ${error.message}`);
  }
}

function saveState(filename, state, createOnly = false) {
  fs.mkdirSync(path.dirname(filename), { recursive: true });
  if (createOnly) {
    try { fs.writeFileSync(filename, `${JSON.stringify(state)}\n`, { flag: 'wx' }); }
    catch (error) { if (error.code !== 'EEXIST') throw error; }
    return;
  }
  const temporary = `${filename}.${process.pid}.${crypto.randomBytes(4).toString('hex')}.tmp`;
  try {
    fs.writeFileSync(temporary, `${JSON.stringify(state)}\n`, { flag: 'wx' });
    fs.renameSync(temporary, filename);
  } finally { if (fs.existsSync(temporary)) fs.unlinkSync(temporary); }
}

// Required labels, then optional ones. Optional labels never gate completeness,
// but they do terminate the preceding label's capture, so an Evidence block
// appended by .ai/bin/protocol-handoff.cjs does not leak into Open.
const REQUIRED_LABELS = ['Agent', 'Action', 'Result', 'Next step', 'Open'];
const ENTRY_LABELS = [...REQUIRED_LABELS, 'Evidence'];

// Canonical date heading patterns, shared by all protocol modules.
// Supports: YYYY-MM-DD, optional HH:MM[:SS], optional timezone (named, +-HHMM, Z).
const DATE_HEADING_REGEX = /^## \d{4}-\d{2}-\d{2}(?: \d{2}:\d{2}(?::\d{2})?(?:[ ]?(?:[A-Za-z0-9_]+|[+-]\d{2}(?::?\d{2})?|Z))?)? - .+/;
const DATE_HEADING_M_REGEX = /^## \d{4}-\d{2}-\d{2}(?: \d{2}:\d{2}(?::\d{2})?(?:[ ]?(?:[A-Za-z0-9_]+|[+-]\d{2}(?::?\d{2})?|Z))?)? - .+/m;

const SECRET_PATTERNS = [
  /(?:(?:SESSION_SECRET|ADMIN_TOKEN|API_KEY|AUTH_TOKEN|PRIVATE_KEY|SECRET_KEY|WEB_ONBOARD_[A-Z_]+)[ \t]*=[ \t]*['"][^'"]{8,}['"])/i,
  /-----BEGIN (?:RSA|EC|OPENSSH|DSA|PGP|ENCRYPTED|PRIVATE) KEY-----/,
  /(?:ghp_[A-Za-z0-9_]{36}|glpat-[A-Za-z0-9\-]{20}|xox[baprs]-[A-Za-z0-9\-]{10,48}|sk_live_[0-9a-zA-Z]{24})/,
];

function findSecretLeak(text) {
  if (!text || typeof text !== 'string') return null;
  for (const pattern of SECRET_PATTERNS) {
    const match = text.match(pattern);
    if (match) return match[0];
  }
  return null;
}

function entryField(section, label) {
  // Terminate on any other label, not only the ones that come later in the
  // canonical order. Writing Open before Agent used to make Open swallow every
  // field after it while the entry still counted as complete. See DEC-0021.
  const others = ENTRY_LABELS.filter(name => name !== label);
  const end = others.map(next => `${next}:`).join('|') || '(?!)';
  const match = section.match(new RegExp(`^${label}:[ \\t]*([\\s\\S]*?)(?=^(?:${end})|(?![\\s\\S]))`, 'm'));
  return match ? match[1].trim() : null;
}

function latestCompleteEntry(text) {
  // Strip the trailing separator first. Leaving it attached let an empty final
  // label capture "---" and count as a filled section.
  const sections = text.replace(/\r\n/g, '\n').split(/(?=^## )/m)
    .map(section => section.replace(/\n-{3,}\s*$/, '\n'));
  return sections.find(section => {
    if (!DATE_HEADING_REGEX.test(section)) return false;
    return REQUIRED_LABELS.every(label => {
      const value = entryField(section, label);
      // A floor against stubs, not a judgement of substance: "a"/"b"/"c"/"d"
      // used to pass as a handoff. Nothing here can tell filler from work.
      return value && value.length >= 3 && !/^_(?:What|Assumptions)/.test(value);
    });
  })?.trim() || null;
}

const ENTRY_HASH_FORMAT = 2;

function hasEntryHashFormat2(section) {
  if (!section) return false;
  return /^[ \t]*-[ \t]+entry hash format:[ \t]*2(?:\s|$)/m.test(section);
}

// Canonical entry body hash logic: covers the entry body with its own
// Evidence block removed (for legacy format) or with its own '- entry:' line removed
// (for format 2). See DEC-0021 and PROTO-DEC-0028.
function canonicalEntryBody(section) {
  if (!section) return '';
  const authenticated = hasEntryHashFormat2(section);
  let body = authenticated
    ? section.replace(/\n*^[ \t]*-[ \t]+entry:[^\r\n]*$/m, '\n')
    : section.replace(/\n*^Evidence:[\s\S]*$/m, '\n');
  body = body.replace(/(?:\s*\n-{3,}[ \t]*|\s*\n### From [^\r\n]+)*\s*$/, '');
  return body.replace(/\s+$/, '');
}

function readText(root, relative) {
  return fs.readFileSync(path.join(root, relative), 'utf8');
}

// Who does what in the current task. The first pilot gave one task to two
// assistants and received two answers to it, so every session is now told its
// own role before it starts. The owner writes the section; nothing here
// assigns, rotates or enforces anything. See DEC-0020.
function assignment(root) {
  let text;
  try { text = fs.readFileSync(path.join(root, '.ai', 'TASK.md'), 'utf8').replace(/\r\n/g, '\n'); }
  catch (error) { if (error.code === 'ENOENT') return []; throw error; }
  const section = text.split(/(?=^## )/m).find(part => /^## Roles\b/.test(part));
  if (!section) return [];
  const entries = [];
  for (const line of section.split('\n')) {
    const match = line.match(/^[-*][ \t]+([a-z][a-z0-9-]{1,23})[ \t]*:[ \t]*(\S.*?)[ \t]*$/);
    if (match) entries.push({ agent: match[1], role: match[2] });
  }
  return entries;
}

function assignmentLines(root, agent) {
  const roles = assignment(root);
  if (!roles.length) return '';
  const mine = roles.filter(entry => entry.agent === agent).map(entry => entry.role);
  const everyone = roles.map(entry => `${entry.agent} = ${entry.role}`).join(', ');
  const yours = mine.length
    ? `Your role in this task: ${mine.join('; ')}\n`
    : `This task names ${roles.map(entry => entry.agent).join(', ')}. You are ${agent} and are `
      + 'not among them. Ask the owner before starting work.\n';
  return `${yours}Assignment: ${everyone}\n`;
}

const INVENTORY_EXTENSIONS = new Set(['.md', '.txt', '.json', '.csv', '.rst', '.adoc', '.org']);
const INVENTORY_SKIP = /^(\.ai\/|\.claude\/|\.codex\/|\.github\/|node_modules\/)/;
const INVENTORY_MINIMUM = 50000;
const INVENTORY_SHOWN = 8;

// A tracked file that nobody changed never appears in `git status`, so a large primary
// source can stay invisible for an entire chain of sessions. This lists the biggest ones
// so a task's own source list can be checked for completeness before it is trusted.
function inventory(root) {
  let listed = '';
  // -z is not a preference. Without it git C-quotes any path that is not plain
  // ASCII, so `крупный.md` arrives as `"\320\272..."`: the extension filter drops
  // it and statSync then fails, twice silently. That is the omission this block
  // exists to prevent. NUL separation also settles newlines inside a filename.
  try { listed = git(root, ['ls-files', '-z']); } catch { return ''; }
  const rows = [];
  for (const line of listed.split('\0')) {
    const relative = line.trim();
    if (!relative || INVENTORY_SKIP.test(relative)) continue;
    if (!INVENTORY_EXTENSIONS.has(path.extname(relative).toLowerCase())) continue;
    let size = 0;
    try { size = fs.statSync(path.join(root, relative)).size; } catch { continue; }
    if (size < INVENTORY_MINIMUM) continue;
    rows.push({ relative, size });
  }
  if (!rows.length) return '';
  rows.sort((a, b) => (b.size - a.size) || a.relative.localeCompare(b.relative));
  const shown = rows.slice(0, INVENTORY_SHOWN)
    .map(row => `- ${row.relative} (${Math.round(row.size / 1024)} KB)`).join('\n');
  const more = rows.length > INVENTORY_SHOWN
    ? `\n- ... ${rows.length - INVENTORY_SHOWN} more; run \`git ls-files\`.` : '';
  return 'Tracked and unchanged, so `git status` never shows them. Before accepting the source\n'
    + 'list your task names, check it against this one and against `git ls-files`.\n\n'
    + shown + more;
}

function context(root, worklog, agent) {
  let result = '# AI protocol state (injected at session start)\n\n';
  result += `Active checkout: ${root}\nRules: AGENTS.md\nYour worklog: ${worklog}\n`;
  result += 'Prepend a complete entry to this session-specific worklog; create it if needed.\n';
  result += 'Shared metadata has one writer: use .ai/bin/protocol-lock.cjs before editing it.\n';
  result += assignmentLines(root, agent);
  result += 'This bounded context is a starting point. Read omitted files when relevant.\n\n';
  const add = (heading, body, maximum = 5000) => {
    const block = `## ${heading}\n\n${body.trim()}\n\n`;
    if (block.length <= maximum && result.length + block.length <= MAX_CONTEXT - 250) result += block;
    else result += `## ${heading}\n\n(Not injected in full: read this file directly.)\n\n`;
  };
  add('.ai/TASK.md', readText(root, '.ai/TASK.md'));
  const status = git(root, ['status', '--short', '--branch']);
  add('Git status', status.length < 2000 ? status :
    `${status.split('\n').slice(0, 20).join('\n')}\n(More paths omitted; run git status.)`, 2400);
  const large = inventory(root);
  if (large) add('Large tracked documents', large, 900);
  let logOutput = '';
  try { logOutput = git(root, ['log', '--oneline', '-10']).trim(); } catch { logOutput = ''; }
  add('Recent commits', logOutput ? logOutput : '(No commits yet.)', 1800);
  for (const relative of ['.ai/PLAN.md', '.ai/DECISIONS.md']) {
    if (!fs.existsSync(path.join(root, relative))) { add(relative, '(Missing.)'); continue; }
    const headings = readText(root, relative).split(/\r?\n/).filter(line => /^#{1,3} /.test(line));
    add(relative, `${headings.slice(0, 35).join('\n')}\nRead the full file before changing architecture or contracts.${headings.length > 35 ? ' More headings omitted.' : ''}`, 1700);
  }
  const archivePath = path.join(root, '.ai', 'ARCHIVE.md');
  if (fs.existsSync(archivePath)) {
    const archiveText = readText(root, '.ai/ARCHIVE.md');
    const matches = archiveText.match(new RegExp(DATE_HEADING_M_REGEX.source, 'mg'));
    if (matches && matches.length) {
      const newest = matches[matches.length - 1].replace(/^## /, '');
      result += `Archive ledger: .ai/ARCHIVE.md holds ${matches.length} archived entry(s); newest: ${newest}\n\n`;
    }
  }
  const directory = path.join(root, '.ai', 'worklog');
  const logs = fs.readdirSync(directory).filter(name => name.endsWith('.md'))
    .sort((a, b) => fs.statSync(path.join(directory, b)).mtimeMs - fs.statSync(path.join(directory, a)).mtimeMs);
  const own = path.basename(worklog);
  if (logs.includes(own)) {
    logs.splice(logs.indexOf(own), 1);
    logs.unshift(own);
  }
  let shown = 0;
  for (const name of logs) {
    if (shown === 8 || result.length > MAX_CONTEXT - 350) break;
    const entry = latestCompleteEntry(fs.readFileSync(path.join(directory, name), 'utf8'));
    add(`.ai/worklog/${name}`, entry || '(No complete dated entry. Read the file if needed.)', 4200);
    shown += 1;
  }
  if (shown < logs.length) result += `${logs.length - shown} additional worklog(s) omitted; inspect .ai/worklog/.\n`;
  return result;
}

// Advisory stop-time warnings. These are surfaced as informational hints, not
// blocking errors. Each returns null when the condition is not relevant or the
// check passes, and a short human string when it fires.
function stopWarnings(root, paths, entry, agent) {
  const warnings = [];
  // BAD-6: Journal has content but no Evidence block.
  if (entry && !entryField(entry, 'Evidence')) {
    warnings.push(
      `This session's latest entry has no Evidence block. ` +
      `Run 'node .ai/bin/protocol-handoff.cjs record --owner ${path.basename(paths.worklog, '.md')}' ` +
      `before ending to attach verifiable evidence.`
    );
  }
  // CP-6: Non-standard entry format (ATX sub-headings instead of label lines).
  if (entry === null) {
    try {
      const text = readText(root, paths.worklog);
      if (/^### (?:Agent|Action|Result)\b/m.test(text)) {
        warnings.push(
          'Non-standard entry format detected: use "Agent:" on its own line, not "### Agent". ' +
          'The canonical format is: ## YYYY-MM-DD - title, then Agent:, Action:, Result:, Next step:, Open: as label lines.'
        );
      }
    } catch { /* journal may not exist yet */ }
  }
  // BAD-5: Agent working outside its assigned role.
  const roles = assignment(root);
  if (roles.length && entry) {
    const mine = roles.find(r => r.agent === agent);
    if (mine) {
      const others = roles.filter(r => r.agent !== agent);
      for (const other of others) {
        // Simple keyword check: if the entry's Action mentions code/files in another
        // agent's described area and this agent is an implementer, warn.
        // Lightweight: only fire when the agent explicitly names the other's role keywords.
        const roleWords = other.role.split(/[,;]\s*/).map(w => w.trim().toLowerCase()).filter(w => w.length > 3);
        const actionText = (entryField(entry, 'Action') || '').toLowerCase();
        // Only warn for role descriptions that are specific enough (>= 2 distinctive words)
        if (roleWords.length >= 2 && roleWords.every(w => actionText.includes(w))) {
          warnings.push(
            `This session's work may overlap with ${other.agent}'s assigned area (${other.role}). ` +
            `If this was intentional, note the reason in the journal.`
          );
          break;
        }
      }
    }
  }
  return warnings;
}

function run(event, input, agent = 'claude') {
  if (!['SessionStart', 'Stop'].includes(event)) throw new Error(`Unknown hook event: ${event}`);
  const root = rootFor(input, agent);
  const paths = sessionPaths(root, input.session_id, agent);
  const previous = readState(paths.state);
  const logHash = fingerprint(path.join(root, paths.worklog));
  const entry = logHash === null ? null : latestCompleteEntry(readText(root, paths.worklog));
  const current = {
    version: VERSION,
    pid: process.pid,
    hostname: os.hostname(),
    startTime: (previous && previous.startTime) ? previous.startTime : Date.now(),
    nonce: (previous && previous.nonce) ? previous.nonce : crypto.randomBytes(32).toString('hex'),
    supervisorPid: (input && typeof input.supervisor_pid === 'number')
      ? input.supervisor_pid
      : ((previous && typeof previous.supervisorPid === 'number') ? previous.supervisorPid : null),
    files: snapshot(root),
    worklogHash: logHash,
    entryHash: entry === null ? null : digest(entry),
  };
  if (event === 'SessionStart') {
    // Create the journal the agent is told to use. Leaving it absent is how a
    // session ends up writing to a name of its own choosing, which no Stop
    // check and no other agent then looks for.
    if (logHash === null) {
      const file = path.join(root, paths.worklog);
      fs.mkdirSync(path.dirname(file), { recursive: true });
      const name = path.basename(paths.worklog, '.md');
      try {
        fs.writeFileSync(file,
          `# Worklog: ${name}\n\nSession journal. Owned by this session. ` +
          `No other session writes here.\n\nNewest entry first. Limit 150 lines.\n\n---\n`,
          { flag: 'wx' });
      } catch (error) { if (error.code !== 'EEXIST') throw error; }
    }
    // Resume and compaction must not erase the pre-edit baseline.
    if (!previous) saveState(paths.state, current, true);
    return { suppressOutput: true, hookSpecificOutput: {
      hookEventName: 'SessionStart', additionalContext: context(root, paths.worklog, agent),
    } };
  }
  if (event !== 'Stop') throw new Error(`Unknown hook event: ${event}`);
  const sessionId = (input && input.session_id) || path.basename(paths.worklog, '.md');
  let gitHead = null;
  try {
    gitHead = git(root, ['rev-parse', 'HEAD']).trim() || null;
  } catch {
    gitHead = null;
  }

  if (!previous) {
    recordSessionMetric(root, {
      ts: new Date().toISOString(),
      session: sessionId,
      agent,
      changedFiles: null,
      durationSec: null,
      firstEditMs: null,
      handoffComplete: false,
      gitHead,
    });
    return { systemMessage: 'AI protocol: no SessionStart snapshot for this session in the active checkout. ' +
      `Changes cannot be compared. Record the handoff in ${paths.worklog}; restart or resume here to enable tracking.` };
  }
  const changed = changedFiles(previous.files, current.files);
  const complete = current.entryHash !== null && current.entryHash !== previous.entryHash;

  const startTime = typeof previous.startTime === 'number' ? previous.startTime : null;
  const durationSec = typeof startTime === 'number'
    ? Math.max(0, Math.round((Date.now() - startTime) / 1000))
    : null;

  // Compute firstEditMs: when changed.length > 0, the earliest filesystem mtime
  // among the changed paths minus startTime (in ms); skip vanished paths; null when
  // nothing changed or no mtime is readable.
  // Note: filesystem mtime records the last write timestamp, so mtime - startTime is
  // an upper bound of the true first edit time.
  let firstEditMs = null;
  if (changed.length > 0 && typeof startTime === 'number') {
    let earliestMtime = Infinity;
    for (const name of changed) {
      try {
        const stat = fs.statSync(path.join(root, name));
        if (stat.mtimeMs < earliestMtime) {
          earliestMtime = stat.mtimeMs;
        }
      } catch {
        // Vanished paths (e.g. deleted files) or unreadable entries are skipped.
      }
    }
    if (earliestMtime !== Infinity) {
      firstEditMs = Math.max(0, Math.round(earliestMtime - startTime));
    }
  }

  if (entry) {
    const secretLeak = findSecretLeak(entry);
    if (secretLeak) {
      recordSessionMetric(root, {
        ts: new Date().toISOString(),
        session: sessionId,
        agent,
        changedFiles: changed.length,
        durationSec,
        firstEditMs,
        handoffComplete: false,
        gitHead,
      });
      return { systemMessage: `AI protocol: unredacted secret pattern detected in ${paths.worklog}: ` +
        `"${secretLeak.slice(0, 16)}...". Never commit or record credentials in protocol journals; redact them immediately.` };
    }
  }
  if (changed.length && !complete) {
    recordSessionMetric(root, {
      ts: new Date().toISOString(),
      session: sessionId,
      agent,
      changedFiles: changed.length,
      durationSec,
      firstEditMs,
      handoffComplete: false,
      gitHead,
    });
    return { systemMessage: `AI protocol: ${changed.length} file(s) changed since this session's last handoff, ` +
      `but ${paths.worklog} has no new complete entry. Prepend what changed, verification, and open issues ` +
      '(Agent, Action, Result, Next step, Open). Changes in a shared checkout may belong to another agent; ' +
      'review the diff before describing them.' };
  }
  // Advisory warnings: these inform but do not block the session.
  const warnings = stopWarnings(root, paths, entry, agent);
  // Auto-archive older entries if journal exceeded 150 lines (Fork 2).
  try {
    const archive = require('./protocol-archive.cjs');
    const owner = path.basename(paths.worklog, '.md');
    archive.autoArchiveWorklog(root, paths.worklog, 150, 1, owner);
  } catch { }

  const telemetry = {
    changedFiles: changed.length,
    durationSec: typeof durationSec === 'number' ? durationSec : 0,
    firstEditMs,
    handoffComplete: complete,
  };

  recordSessionMetric(root, {
    ts: new Date().toISOString(),
    session: sessionId,
    agent,
    changedFiles: changed.length,
    durationSec,
    firstEditMs,
    handoffComplete: complete,
    gitHead,
  });

  // Stop runs after every response. Successful handoffs establish the next turn's baseline.
  saveState(paths.state, current);
  return warnings.length ? { stopWarnings: warnings, ...telemetry } : { ...telemetry };
}

const METRICS_MAX_BYTES = 1024 * 1024; // ~1 MB

function recordSessionMetric(root, record) {
  try {
    const metricsDir = path.join(root, '.ai', 'runtime', 'metrics');
    fs.mkdirSync(metricsDir, { recursive: true });
    const logFile = path.join(metricsDir, 'sessions.jsonl');
    const rotatedFile = path.join(metricsDir, 'sessions.1.jsonl');
    try {
      if (fs.existsSync(logFile)) {
        const stat = fs.statSync(logFile);
        if (stat.size >= METRICS_MAX_BYTES) {
          if (fs.existsSync(rotatedFile)) fs.unlinkSync(rotatedFile);
          fs.renameSync(logFile, rotatedFile);
        }
      }
    } catch { }
    fs.appendFileSync(logFile, JSON.stringify(record) + '\n', 'utf8');
  } catch {
    // Fail-safe: metrics failure must never fail or block a hook.
  }
}

function sessionNonce(root, owner) {
  const stateFile = path.join(root, '.ai', 'runtime', `${owner}.json`);
  const state = readState(stateFile);
  return state ? (state.nonce || null) : null;
}

function main(agent = 'claude') {
  try {
    const input = JSON.parse(fs.readFileSync(0, 'utf8'));
    const event = agent === 'codex' ? input.hook_event_name : process.argv[2];
    process.stdout.write(`${JSON.stringify(run(event, input, agent))}\n`);
  } catch (error) {
    process.stdout.write(`${JSON.stringify({ systemMessage:
      `AI protocol: hook check unavailable: ${error.message.slice(0, 800)} Run validate-protocol.ps1.` })}\n`);
  }
}

module.exports = { SNAPSHOT_FORMAT, DIRTY_SYMBOL, ENTRY_HASH_FORMAT, AGENT_NAME, DATE_HEADING_REGEX, DATE_HEADING_M_REGEX, context, assignment, latestCompleteEntry, entryField, findSecretLeak, stopWarnings, sessionPaths, readState, sessionNonce, hasEntryHashFormat2, canonicalEntryBody, run, changedFiles, snapshot, fingerprint, main, recordSessionMetric, METRICS_MAX_BYTES };

if (require.main === module) main();
