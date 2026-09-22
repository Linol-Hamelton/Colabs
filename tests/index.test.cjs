'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { run, write, makeProtocolFixture } = require('./helpers.cjs');
const index = require('../.ai/bin/protocol-index.cjs');

const BLOCK = (id, date, decision, extra = '') =>
  `### ${id}\n\nStatus: Accepted\nDate: ${date}\n${extra}` +
  `\nContext:\nSomething forced a choice.\n\nDecision:\n${decision}\n\n` +
  'Reasoning:\nBecause.\n\nAlternatives rejected:\nNothing.\n\n' +
  'Consequences:\nNone.\n\nApproved by: Owner Name\n';

function seed(t) {
  const root = makeProtocolFixture(t);
  write(root, '.ai/DECISIONS.md',
    '# Architectural and Technical Decisions\n\n' +
    BLOCK('DEC-0001', '2026-01-01',
      '1. Every `.ps1` file is ASCII-only. A second sentence must not appear.',
      'Reopen-trigger: owner-directive\n') +
    '\n---\n\n' +
    BLOCK('DEC-0002', '2026-01-02',
      'The gate reads `validate-protocol.ps1` and `.ai/bin/protocol-lock.cjs`.',
      'Supersedes: DEC-0001\n') +
    '\n---\n\n' +
    BLOCK('DEC-nnnn', '', '_What was chosen._'));
  return root;
}

function build(root) {
  return index.build(root);
}

test('the index covers every real block and excludes the template', t => {
  const root = seed(t);
  const result = build(root);
  const ids = result.rows.map(row => row.id);
  assert.deepEqual(ids, ['DEC-0001', 'DEC-0002']);
  assert.doesNotMatch(result.content, /DEC-nnnn/);
});

test('the normative line is the first sentence, numbering stripped, never a paraphrase', t => {
  const root = seed(t);
  const rows = build(root).rows;
  assert.equal(rows[0].norm, 'Every `.ps1` file is ASCII-only.');
  assert.equal(rows[0].trigger, 'owner-directive');
  assert.equal(rows[1].supersedes, 'DEC-0001');
});

test('the reverse index maps a path to the decisions that name it', t => {
  const root = seed(t);
  const result = build(root);
  assert.match(result.content, /`validate-protocol\.ps1` -> DEC-0002/);
  assert.match(result.content, /`\.ai\/bin\/protocol-lock\.cjs` -> DEC-0002/);
});

test('the index carries the source hash and --check detects a stale one', t => {
  const root = seed(t);
  const first = run(process.execPath, [path.join(root, '.ai/bin/protocol-index.cjs')], root);
  assert.equal(first.status, 0, first.stderr);
  const built = fs.readFileSync(path.join(root, index.OUTPUT), 'utf8');
  assert.match(built, /^- source sha256: [0-9a-f]{64}$/m);

  const fresh = run(process.execPath,
    [path.join(root, '.ai/bin/protocol-index.cjs'), '--check'], root);
  assert.equal(fresh.status, 0, fresh.stdout);

  fs.appendFileSync(path.join(root, '.ai/DECISIONS.md'),
    `\n---\n\n${BLOCK('DEC-0003', '2026-01-03', 'A later decision changes the file.')}`);
  const stale = run(process.execPath,
    [path.join(root, '.ai/bin/protocol-index.cjs'), '--check'], root);
  assert.equal(stale.status, 1, 'a changed source must make the index stale');
  assert.match(stale.stdout, /stale/);
});

test('the index is derived state and never claims authority', t => {
  const root = seed(t);
  const content = build(root).content;
  assert.match(content, /derived, disposable/);
  assert.match(content, /never cited as Evidence/);
  // It must live under the disposable runtime directory, not in tracked state.
  assert.match(index.OUTPUT.replace(/\\/g, '/'), /^\.ai\/runtime\//);
});
