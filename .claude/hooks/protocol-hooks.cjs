'use strict';

// Hook contract: https://code.claude.com/docs/en/hooks
// CLAUDE_PROJECT_DIR locates the script; stdin.cwd locates the active worktree.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
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

function rootFor(input) {
  const cwd = input.cwd || process.env.CLAUDE_PROJECT_DIR || process.cwd();
  const root = git(cwd, ['rev-parse', '--show-toplevel']).trim();
  if (!fs.existsSync(path.join(root, '.ai', 'TASK.md'))) {
    throw new Error(`No .ai/TASK.md in the active checkout ${root}; install the protocol there.`);
  }
  return root;
}

function fingerprint(filename) {
  let stat;
  try { stat = fs.lstatSync(filename); }
  catch (error) { if (error.code === 'ENOENT') return null; throw error; }
  if (stat.isSymbolicLink()) return `link:${digest(fs.readlinkSync(filename))}`;
  if (stat.isDirectory()) return 'directory'; // Git submodules are separate repositories.
  if (!stat.isFile()) throw new Error(`Unsupported file type: ${filename}`);
  const hash = crypto.createHash('sha256');
  const fd = fs.openSync(filename, 'r');
  try {
    const buffer = Buffer.alloc(64 * 1024);
    let size;
    while ((size = fs.readSync(fd, buffer, 0, buffer.length, null)) > 0) {
      hash.update(buffer.subarray(0, size));
    }
  } finally { fs.closeSync(fd); }
  return `${stat.mode & 0o111}:${hash.digest('hex')}`;
}

function snapshot(root) {
  const names = new Set(git(root, ['ls-files', '--cached', '--others', '--exclude-standard', '-z'])
    .split('\0').filter(Boolean));
  const index = new Map();
  for (const record of git(root, ['ls-files', '--stage', '-z']).split('\0').filter(Boolean)) {
    const separator = record.indexOf('\t');
    const name = record.slice(separator + 1);
    index.set(name, `${index.get(name) || ''}${record.slice(0, separator)};`);
  }
  const files = {};
  for (const name of [...names].sort()) {
    // Runtime is disposable. Each worklog has its own writer and is checked separately.
    if (name.startsWith('.ai/runtime/') || name.startsWith('.ai/worklog/')) continue;
    Object.defineProperty(files, name, {
      value: `${index.get(name) || ''}|${fingerprint(path.join(root, name))}`,
      enumerable: true,
    });
  }
  return files;
}

function changedFiles(before, after) {
  return [...new Set([...Object.keys(before), ...Object.keys(after)])]
    .filter(name => before[name] !== after[name]);
}

function sessionPaths(root, sessionId) {
  if (typeof sessionId !== 'string' || !sessionId.trim()) {
    throw new Error('Hook input has no session_id; per-session tracking is unavailable.');
  }
  const key = digest(sessionId).slice(0, 16);
  return {
    state: path.join(root, '.ai', 'runtime', `claude-${key}.json`),
    worklog: `.ai/worklog/claude-${key}.md`,
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

function latestCompleteEntry(text) {
  const sections = text.replace(/\r\n/g, '\n').split(/(?=^## )/m);
  return sections.find(section => {
    if (!/^## \d{4}-\d{2}-\d{2} - .+/.test(section)) return false;
    return ['Agent', 'Action', 'Result', 'Next step', 'Open'].every((label, i, labels) => {
      const end = labels.slice(i + 1).map(next => `${next}:`).join('|') || '(?!)';
      const match = section.match(new RegExp(`^${label}:[ \\t]*([\\s\\S]*?)(?=^(?:${end})|(?![\\s\\S]))`, 'm'));
      return match && match[1].trim() && !/^_(?:What|Assumptions)/.test(match[1].trim());
    });
  })?.trim().replace(/\n---\s*$/, '') || null;
}

function readText(root, relative) {
  return fs.readFileSync(path.join(root, relative), 'utf8');
}

function context(root, worklog) {
  let result = '# AI protocol state (injected at session start)\n\n';
  result += `Active checkout: ${root}\nRules: AGENTS.md\nYour worklog: ${worklog}\n`;
  result += 'Prepend a complete entry to this session-specific worklog; create it if needed.\n';
  result += 'Shared metadata has one writer: use scripts/protocol-lock.cjs before editing it.\n';
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
  const hasCommits = Number(git(root, ['rev-list', '--all', '--count']).trim()) > 0;
  add('Recent commits', hasCommits ? git(root, ['log', '--oneline', '-10']) : '(No commits yet.)', 1800);
  for (const relative of ['.ai/PLAN.md', '.ai/DECISIONS.md']) {
    if (!fs.existsSync(path.join(root, relative))) { add(relative, '(Missing.)'); continue; }
    const headings = readText(root, relative).split(/\r?\n/).filter(line => /^#{1,3} /.test(line));
    add(relative, `${headings.slice(0, 35).join('\n')}\nRead the full file before changing architecture or contracts.${headings.length > 35 ? ' More headings omitted.' : ''}`, 1700);
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

function run(event, input) {
  const root = rootFor(input);
  const paths = sessionPaths(root, input.session_id);
  const previous = readState(paths.state);
  const logHash = fingerprint(path.join(root, paths.worklog));
  const entry = logHash === null ? null : latestCompleteEntry(readText(root, paths.worklog));
  const current = {
    version: VERSION,
    files: snapshot(root),
    worklogHash: logHash,
    entryHash: entry === null ? null : digest(entry),
  };
  if (event === 'SessionStart') {
    // Resume and compaction must not erase the pre-edit baseline.
    if (!previous) saveState(paths.state, current, true);
    return { suppressOutput: true, hookSpecificOutput: {
      hookEventName: 'SessionStart', additionalContext: context(root, paths.worklog),
    } };
  }
  if (event !== 'Stop') throw new Error(`Unknown hook event: ${event}`);
  if (!previous) {
    return { systemMessage: 'AI protocol: no SessionStart snapshot for this session in the active checkout. ' +
      `Changes cannot be compared. Record the handoff in ${paths.worklog}; restart or resume here to enable tracking.` };
  }
  const changed = changedFiles(previous.files, current.files);
  const complete = current.entryHash !== null && current.entryHash !== previous.entryHash;
  if (changed.length && !complete) {
    return { systemMessage: `AI protocol: ${changed.length} file(s) changed since this session's last handoff, ` +
      `but ${paths.worklog} has no new complete entry. Prepend what changed, verification, and open issues ` +
      '(Agent, Action, Result, Next step, Open). Changes in a shared checkout may belong to another agent; ' +
      'review the diff before describing them.' };
  }
  // Stop runs after every response. Successful handoffs establish the next turn's baseline.
  saveState(paths.state, current);
  return {};
}

function main() {
  try {
    const input = JSON.parse(fs.readFileSync(0, 'utf8'));
    process.stdout.write(`${JSON.stringify(run(process.argv[2], input))}\n`);
  } catch (error) {
    process.stdout.write(`${JSON.stringify({ systemMessage:
      `AI protocol: hook check unavailable: ${error.message.slice(0, 800)} Run validate-protocol.ps1.` })}\n`);
  }
}

if (require.main === module) main();
module.exports = { latestCompleteEntry, sessionPaths, run, changedFiles };
