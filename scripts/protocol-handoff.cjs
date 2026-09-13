#!/usr/bin/env node
'use strict';

// Attaches verifiable evidence to a session journal entry.
//
// The protocol used to transfer assertions: an agent wrote "the suite passes"
// and the next agent had no way to check. This records what actually ran, the
// exact tree it ran against, and lets anyone re-verify later.
//
//   record  --owner <session> [--journal <path>] [--quick]
//   verify  [--journal <path>]
//   state
//
// record exits non-zero when a check fails, so a red tree cannot produce a
// green receipt.

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { spawnSync } = require('node:child_process');
const hooks = require('./protocol-hooks.cjs');

const CHECKS = [
  { name: 'validate-protocol.ps1', quick: true },
  { name: 'test-protocol.ps1', quick: false },
];

function checksFor(root, quick) {
  let manifest;
  try { manifest = JSON.parse(fs.readFileSync(path.join(root, 'protocol-manifest.json'), 'utf8')); }
  catch (error) { throw new Error(`Cannot read protocol manifest: ${error.message}`); }
  if (!manifest || typeof manifest !== 'object' || Array.isArray(manifest)) {
    throw new Error('Protocol manifest must be a JSON object.');
  }
  // Older manifests had no role and shipped the source suite. Do not treat
  // that absence, an unknown role, or a missing script as an installed runtime.
  const role = Object.hasOwn(manifest, 'role') ? manifest.role : 'source';
  if (!['source', 'installed'].includes(role)) {
    throw new Error('Protocol manifest role must be source or installed.');
  }
  return CHECKS.filter(check => (role !== 'installed' || check.quick) && (!quick || check.quick));
}

function git(root, args) {
  const result = spawnSync('git', ['-C', root, ...args], {
    encoding: 'utf8', windowsHide: true, timeout: 30000,
  });
  if (result.error || result.status !== 0) {
    throw new Error(`git ${args[0]} failed: ${result.error?.message || (result.stderr || '').trim()}`);
  }
  return result.stdout;
}

// The anchor identifies the exact state the evidence describes. A commit alone
// is not enough: most protocol work is uncommitted when it is handed over.
function anchor(root) {
  const head = git(root, ['rev-list', '--all', '--count']).trim() === '0'
    ? null
    : git(root, ['rev-parse', 'HEAD']).trim();
  const files = hooks.snapshot(root);
  const names = Object.keys(files).sort();
  const hash = crypto.createHash('sha256');
  for (const name of names) {
    // snapshot() prefixes each entry with its Git index record. Staging a file
    // changes that record without changing the file, so evidence recorded
    // before `git add` would fail to verify after it. Content and mode are
    // what the evidence is about; keep only those.
    const content = files[name].split('|').pop();
    hash.update(`${name}|${content}|`);
  }
  const dirty = git(root, ['status', '--porcelain', '-uall']).trim().length > 0;
  return {
    commit: head,
    dirty,
    fileCount: names.length,
    digest: `sha256:${hash.digest('hex')}`,
    format: hooks.SNAPSHOT_FORMAT,
  };
}

function powershell() {
  if (process.env.PROTOCOL_TEST_POWERSHELL) return process.env.PROTOCOL_TEST_POWERSHELL;
  return process.platform === 'win32' ? 'powershell.exe' : 'pwsh';
}

function runCheck(root, name) {
  const started = Date.now();
  const result = spawnSync(powershell(),
    ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', path.join(root, name)],
    { cwd: root, encoding: 'utf8', windowsHide: true, timeout: 900000 });
  if (result.error) throw new Error(`${name} could not run: ${result.error.message}`);
  return { name, code: result.status, seconds: Math.round((Date.now() - started) / 1000) };
}

function renderEvidence(state, checks, owner) {
  const lines = [
    'Evidence:',
    `- anchor: ${state.commit || 'no commits'}${state.dirty ? ', uncommitted changes present' : ', clean tree'}`,
    `- digest: ${state.digest} over ${state.fileCount} tracked and untracked files`,
    `- digest format: ${state.format}`,
    `- recorded: ${new Date().toISOString()} by ${owner}`,
    '- scope: protocol checks only; host-project tests run separately',
  ];
  for (const check of checks) {
    lines.push(`- ${check.name}: exit ${check.code} in ${check.seconds}s`);
  }
  lines.push('- reproduce: node scripts/protocol-handoff.cjs verify');
  return lines.join('\n');
}

// The newest dated section, complete or not: evidence attaches to what the
// agent just wrote, and an incomplete entry is exactly when it matters.
function newestSection(text) {
  const normalized = text.replace(/\r\n/g, '\n');
  const sections = normalized.split(/(?=^## )/m);
  const index = sections.findIndex(section => /^## \d{4}-\d{2}-\d{2} - .+/.test(section));
  if (index === -1) return null;
  return { sections, index, normalized };
}

function attach(journalPath, block) {
  const text = fs.readFileSync(journalPath, 'utf8');
  const found = newestSection(text);
  if (!found) throw new Error(`No dated entry in ${journalPath}. Write the entry first, then record evidence.`);
  let section = found.sections[found.index];
  const trailing = section.match(/\n(-{3,}\s*)$/);
  const separator = trailing ? `\n${trailing[1]}` : '';
  if (trailing) section = section.slice(0, section.length - separator.length);
  section = section.replace(/\n*Evidence:[\s\S]*$/, '\n');
  section = `${section.replace(/\n+$/, '')}\n\n${block}\n${separator ? `${separator}\n` : ''}`;
  found.sections[found.index] = section;
  fs.writeFileSync(journalPath, found.sections.join(''));
}

function readEvidence(journalPath) {
  const text = fs.readFileSync(journalPath, 'utf8');
  const found = newestSection(text);
  if (!found) return null;
  const body = hooks.entryField(found.sections[found.index].replace(/\n-{3,}\s*$/, '\n'), 'Evidence');
  if (!body) return null;
  const digest = body.match(/digest:\s*(sha256:[a-f0-9]{64})/);
  const format = body.match(/digest format:\s*(\d+)/);
  return { body, digest: digest ? digest[1] : null, format: format ? Number(format[1]) : 1 };
}

function resolveJournal(root, explicit, owner) {
  if (explicit) return path.resolve(root, explicit);
  if (owner) {
    const byOwner = path.join(root, '.ai', 'worklog', `${owner}.md`);
    if (fs.existsSync(byOwner)) return byOwner;
    throw new Error(`No session journal for owner ${owner}. Create ${path.relative(root, byOwner)} first.`);
  }
  const directory = path.join(root, '.ai', 'worklog');
  if (!fs.existsSync(directory)) {
    throw new Error('No .ai/worklog directory. Start a session, or create the journal by hand.');
  }
  const notJournals = new Set(['README.md']);
  const candidates = fs.readdirSync(directory)
    .filter(name => name.endsWith('.md') && !notJournals.has(name))
    .map(name => ({ name, mtime: fs.statSync(path.join(directory, name)).mtimeMs }))
    .sort((a, b) => b.mtime - a.mtime);
  if (!candidates.length) throw new Error('No session journal found in .ai/worklog. Create one first.');
  return path.join(directory, candidates[0].name);
}

function reportOne(root, journalPath, state) {
  const evidence = readEvidence(journalPath);
  const relative = path.relative(root, journalPath);
  if (!evidence) {
    process.stderr.write(`AI protocol: ${relative} has no Evidence block on its newest entry.
`);
    return 1;
  }
  if (evidence.format !== state.format) {
    process.stderr.write(`AI protocol: ${relative} evidence uses digest format ${evidence.format}; ` +
      `this build computes format ${state.format}. The two cannot be compared. Re-record to refresh it.
`);
    return 1;
  }
  if (evidence.digest !== state.digest) {
    process.stderr.write(`AI protocol: ${relative} evidence is stale. Recorded ${evidence.digest}, tree is now ${state.digest}.
`);
    return 1;
  }
  if (/exit [^0]/.test(evidence.body)) {
    process.stderr.write(`AI protocol: ${relative} evidence matches the tree but records a failing check.
`);
    return 1;
  }
  process.stdout.write(`${relative}: evidence matches the current tree
`);
  return 0;
}

function main(argv) {
  const command = argv[0];
  const options = {};
  for (let i = 1; i < argv.length; i += 1) {
    if (argv[i] === '--quick') { options.quick = true; continue; }
    const value = argv[i + 1];
    if (!value) throw new Error(`Missing value for ${argv[i]}`);
    if (argv[i] === '--owner') options.owner = value;
    else if (argv[i] === '--journal') options.journal = value;
    else if (argv[i] === '--root') options.root = value;
    else throw new Error('Usage: protocol-handoff.cjs record|verify|state [--owner id] [--journal path] [--root path] [--quick]');
    i += 1;
  }
  const root = fs.realpathSync(path.resolve(options.root || path.join(__dirname, '..')));
  const state = anchor(root);

  if (command === 'state') {
    process.stdout.write(`${JSON.stringify(state, null, 2)}\n`);
    return 0;
  }

  if (command === 'record') {
    if (!options.owner) throw new Error('record needs --owner <session id>');
    const journalPath = resolveJournal(root, options.journal, options.owner);
    const checks = checksFor(root, options.quick).map(check => runCheck(root, check.name));
    const failed = checks.filter(check => check.code !== 0);
    // Re-anchor: the checks may have touched the tree. Evidence must describe
    // the state it was actually measured against.
    const after = anchor(root);
    attach(journalPath, renderEvidence(after, checks, options.owner));
    process.stdout.write(`${path.relative(root, journalPath)}: evidence recorded\n`);
    process.stdout.write('Protocol checks only; run and report the host project tests separately.\n');
    for (const check of checks) process.stdout.write(`  ${check.name}: exit ${check.code}\n`);
    if (failed.length) {
      process.stderr.write(`AI protocol: ${failed.length} check(s) failed; the evidence records the failure.\n`);
      return 1;
    }
    return 0;
  }

  if (command === 'verify') {
    // With an explicit target, judge that one journal. Without one, ask the
    // real question: does any journal hold evidence for the tree as it is now?
    // Picking the newest by modification time was wrong, because a checkout or
    // a merge rewrites every file and scrambles the order.
    if (options.journal || options.owner) {
      const journalPath = resolveJournal(root, options.journal, options.owner);
      return reportOne(root, journalPath, state);
    }
    const directory = path.join(root, '.ai', 'worklog');
    if (!fs.existsSync(directory)) {
      process.stderr.write('AI protocol: no .ai/worklog directory.\n');
      return 1;
    }
    const journals = fs.readdirSync(directory)
      .filter(name => name.endsWith('.md') && name !== 'README.md')
      .map(name => path.join(directory, name));
    const carrying = journals
      .map(file => ({ file, evidence: readEvidence(file) }))
      .filter(item => item.evidence);
    if (!carrying.length) {
      process.stderr.write('AI protocol: no journal carries an Evidence block. ' +
        'Run: node scripts/protocol-handoff.cjs record --owner <session-id>\n');
      return 1;
    }
    const matching = carrying.filter(item => item.evidence.format === state.format &&
      item.evidence.digest === state.digest && !/exit [^0]/.test(item.evidence.body));
    if (matching.length) {
      for (const item of matching) {
        process.stdout.write(`${path.relative(root, item.file)}: evidence matches the current tree\n`);
      }
      return 0;
    }
    process.stderr.write(`AI protocol: no evidence matches the current tree ${state.digest}.\n`);
    for (const item of carrying) {
      const why = item.evidence.format !== state.format
        ? `recorded with digest format ${item.evidence.format}, not comparable`
        : (item.evidence.digest === state.digest ? 'records a failing check' : 'anchored to a different tree');
      process.stderr.write(`  ${path.relative(root, item.file)}: ${why}\n`);
    }
    return 1;
  }

  throw new Error('Usage: protocol-handoff.cjs record|verify|state');
}

if (require.main === module) {
  try { process.exitCode = main(process.argv.slice(2)); }
  catch (error) { process.stderr.write(`AI protocol: ${error.message}\n`); process.exitCode = 1; }
}
module.exports = { anchor, attach, readEvidence, renderEvidence };
