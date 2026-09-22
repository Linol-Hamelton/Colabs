'use strict';

// Derives a compact, addressable index of .ai/DECISIONS.md.
//
// DECISIONS.md is append-only and never trimmed, so it grows without bound while
// every reviewer needs the norms in it. Re-reading 117 KB to find which decision
// binds one file is the cost this removes. The index is derived, disposable and
// lives under .ai/runtime/; it is never a source of truth. It carries the hash of
// the file it was built from, so a stale index is detectable rather than silently
// wrong. When the hash does not match, discard it and read DECISIONS.md.

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const SOURCE = path.join('.ai', 'DECISIONS.md');
const OUTPUT = path.join('.ai', 'runtime', 'decisions-index.md');
const TEMPLATE_ID = /^(PROTO-)?DEC-n+$/i;
const FIELDS = ['Status', 'Date', 'Supersedes', 'Reopen-trigger'];
const PATH_LIKE = /^[A-Za-z0-9_.@/\\-]+$/;
const PATH_EXTENSION = /\.(md|cjs|js|ps1|json|jsonc|yml|yaml|toml|sh|txt)$/i;

function sha256(text) {
  return crypto.createHash('sha256').update(text, 'utf8').digest('hex');
}

// A block runs from its "### <id>" heading to the next heading or the end.
function parseBlocks(text) {
  const lines = text.split(/\r?\n/);
  const blocks = [];
  let current = null;
  for (const line of lines) {
    const heading = line.match(/^### +(\S+) *$/);
    if (heading) {
      if (current) blocks.push(current);
      current = { id: heading[1], body: [] };
      continue;
    }
    if (current) current.body.push(line);
  }
  if (current) blocks.push(current);
  return blocks.filter(block => !TEMPLATE_ID.test(block.id));
}

function field(body, name) {
  const prefix = `${name}:`;
  for (const line of body) {
    if (line.startsWith(prefix)) return line.slice(prefix.length).trim();
  }
  return '';
}

// The first normative statement: item 1 when the Decision is numbered, otherwise
// the first sentence. Deterministic extraction, never a paraphrase.
function firstNorm(body) {
  const start = body.findIndex(line => line.startsWith('Decision:'));
  if (start === -1) return '';
  const collected = [];
  for (let i = start + 1; i < body.length; i += 1) {
    const line = body[i];
    if (/^[A-Z][A-Za-z ]+:$/.test(line.trim()) && collected.length) break;
    if (line.trim()) collected.push(line.trim());
    else if (collected.length) break;
  }
  let text = collected.join(' ').replace(/^1\.\s*/, '').trim();
  const sentence = text.match(/^(.+?[.!?])(\s|$)/);
  if (sentence) text = sentence[1];
  return text.length > 220 ? `${text.slice(0, 217)}...` : text;
}

// Paths the block binds, taken only from backticked tokens so prose cannot leak in.
function boundPaths(body) {
  const found = new Set();
  const text = body.join('\n');
  const matches = text.match(/`[^`\n]+`/g) || [];
  for (const raw of matches) {
    const token = raw.slice(1, -1).trim();
    if (!PATH_LIKE.test(token)) continue;
    if (!token.includes('/') && !PATH_EXTENSION.test(token)) continue;
    if (token.length > 120) continue;
    found.add(token.replace(/\\/g, '/'));
  }
  return [...found].sort();
}

function build(root) {
  const sourcePath = path.join(root, SOURCE);
  const text = fs.readFileSync(sourcePath, 'utf8');
  const blocks = parseBlocks(text);
  const reverse = new Map();

  const rows = blocks.map(block => {
    const paths = boundPaths(block.body);
    for (const item of paths) {
      if (!reverse.has(item)) reverse.set(item, []);
      reverse.get(item).push(block.id);
    }
    return {
      id: block.id,
      status: field(block.body, 'Status'),
      date: field(block.body, 'Date'),
      supersedes: field(block.body, 'Supersedes'),
      trigger: field(block.body, 'Reopen-trigger'),
      norm: firstNorm(block.body),
      paths,
    };
  });

  const out = [];
  out.push('# Decisions index (derived, disposable)');
  out.push('');
  out.push(`Built from \`${SOURCE.replace(/\\/g, '/')}\` at ${new Date().toISOString()}.`);
  out.push('');
  out.push(`- source sha256: ${sha256(text)}`);
  out.push(`- source bytes: ${Buffer.byteLength(text, 'utf8')}`);
  out.push(`- blocks indexed: ${rows.length}`);
  out.push('');
  out.push('This file is not a source of truth and is never cited as Evidence. It points');
  out.push('at decisions; it does not restate them. Before relying on a line here, open the');
  out.push('block it names. Re-run `node .ai/bin/protocol-index.cjs` when the hash above does');
  out.push('not match `.ai/DECISIONS.md`; `--check` reports that without rewriting anything.');
  out.push('');
  out.push('## Blocks');
  out.push('');
  for (const row of rows) {
    const marks = [row.status, row.date].filter(Boolean).join(', ');
    const extra = [];
    if (row.supersedes) extra.push(`supersedes: ${row.supersedes}`);
    if (row.trigger) extra.push(`reopen: ${row.trigger}`);
    if (row.paths.length) extra.push(`${row.paths.length} bound path(s)`);
    out.push(`- **${row.id}** (${marks})${row.norm ? ` - ${row.norm}` : ''}`);
    if (extra.length) out.push(`  - ${extra.join('; ')}`);
  }
  out.push('');
  out.push('## Paths a decision names');
  out.push('');
  out.push('Before changing one of these, read the blocks listed beside it.');
  out.push('');
  const sortedPaths = [...reverse.keys()].sort();
  for (const item of sortedPaths) {
    out.push(`- \`${item}\` -> ${reverse.get(item).join(', ')}`);
  }
  out.push('');
  return { content: out.join('\n'), rows, sourceHash: sha256(text), pathCount: sortedPaths.length };
}

function currentHash(root) {
  const file = path.join(root, OUTPUT);
  if (!fs.existsSync(file)) return null;
  const match = fs.readFileSync(file, 'utf8').match(/^- source sha256: ([0-9a-f]{64})$/m);
  return match ? match[1] : null;
}

function main(argv) {
  const root = process.cwd();
  const check = argv.includes('--check');
  const result = build(root);
  if (check) {
    const recorded = currentHash(root);
    if (recorded === null) {
      process.stdout.write(`${OUTPUT}: missing; run without --check to build it\n`);
      return 1;
    }
    if (recorded !== result.sourceHash) {
      process.stdout.write(`${OUTPUT}: stale; ${SOURCE} has changed since it was built\n`);
      return 1;
    }
    process.stdout.write(`${OUTPUT}: current for ${SOURCE}\n`);
    return 0;
  }
  const file = path.join(root, OUTPUT);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${result.content}\n`, 'utf8');
  const bytes = Buffer.byteLength(result.content, 'utf8');
  process.stdout.write(
    `${OUTPUT}: ${result.rows.length} block(s), ${result.pathCount} path(s), ${bytes} bytes\n`);
  return 0;
}

if (require.main === module) process.exit(main(process.argv.slice(2)));

module.exports = { build, parseBlocks, firstNorm, boundPaths, main, OUTPUT, SOURCE };
