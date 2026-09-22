'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { run, git, write, makeProtocolFixture, makeFixture } = require('./helpers.cjs');
const ledger = require('../.ai/bin/protocol-ledger.cjs');

const TOOL = path.join(__dirname, '..', '.ai', 'bin', 'protocol-ledger.cjs');

function corpusFixture(t) {
  const root = makeProtocolFixture(t);
  write(root, 'src/alpha.py', 'print("alpha")\n');
  write(root, 'src/beta.py', 'print("beta")\n');
  write(root, 'src/gamma.py', 'print("gamma")\n');
  assert.equal(git(root, ['add', '.']).status, 0);
  assert.equal(git(root, ['-c', 'user.name=Protocol Test', '-c',
    'user.email=protocol-test@example.invalid', 'commit', '-m', 'Seed corpus']).status, 0);
  return root;
}

test('cover names the unit that has no record', t => {
  const root = corpusFixture(t);
  write(root, 'records/src/alpha.py.md', 'alpha record\n');
  write(root, 'records/src/beta.py.md', 'beta record\n');
  const result = ledger.cover(root, path.join(root, 'records'), ['.git'], '.md');
  const gamma = result.rows.find(row => row.unit === 'src/gamma.py');
  assert.equal(gamma.disposition, 'no record');
  assert.equal(result.rows.filter(row => row.disposition === 'record').length, 2);
  assert.deepEqual(result.extra, []);
});

test('cover names a record that has no unit behind it', t => {
  const root = corpusFixture(t);
  write(root, 'records/src/alpha.py.md', 'alpha record\n');
  write(root, 'records/src/invented.py.md', 'a record for a file that does not exist\n');
  const result = ledger.cover(root, path.join(root, 'records'), ['.git'], '.md');
  assert.equal(result.extra.length, 1);
  assert.match(result.extra[0], /invented\.py\.md$/);
});

test('a gap fails only under --expect-all; an unexpected record always fails', t => {
  const root = corpusFixture(t);
  write(root, 'records/src/alpha.py.md', 'alpha record\n');

  // The corpus is the whole repository, not the three files this test added, so the
  // expectation is derived from git rather than hard-coded.
  const tracked = git(root, ['ls-files']).stdout.split(/\r?\n/).filter(Boolean).length;
  const lenient = run(process.execPath,
    [TOOL, 'cover', '--records', path.join(root, 'records'), '--out',
      path.join(root, '.ai/runtime/c1.md')], root);
  assert.equal(lenient.status, 0, 'a unit without a record may be a declared classification');
  assert.match(lenient.stdout, new RegExp(`units ${tracked}, without record ${tracked - 1},`));

  const strict = run(process.execPath,
    [TOOL, 'cover', '--records', path.join(root, 'records'), '--expect-all', '--out',
      path.join(root, '.ai/runtime/c2.md')], root);
  assert.equal(strict.status, 1);

  write(root, 'records/src/invented.py.md', 'no unit behind this\n');
  const unexpected = run(process.execPath,
    [TOOL, 'cover', '--records', path.join(root, 'records'), '--out',
      path.join(root, '.ai/runtime/c3.md')], root);
  assert.equal(unexpected.status, 1, 'a record with no unit is always a defect');
});

test('dup reports records shared across two producers', t => {
  const root = corpusFixture(t);
  write(root, 'a/src/alpha.py.md', 'identical body\n');
  write(root, 'b/src/alpha.py.md', 'identical body\n');
  write(root, 'a/src/beta.py.md', 'own work\n');
  write(root, 'b/src/beta.py.md', 'different own work\n');
  const result = ledger.duplicates([path.join(root, 'a'), path.join(root, 'b')]);
  assert.equal(result.across.length, 1);
  assert.equal(result.across[0].count, 2);
  assert.equal(result.within.length, 0);
});

test('dup separates duplication inside one set from duplication across sets', t => {
  const root = corpusFixture(t);
  write(root, 'a/one.md', 'a filled template\n');
  write(root, 'a/two.md', 'a filled template\n');
  write(root, 'b/three.md', 'something else\n');
  const result = ledger.duplicates([path.join(root, 'a'), path.join(root, 'b')]);
  assert.equal(result.within.length, 1, 'the same body twice in one set is a template, not a copy');
  assert.equal(result.across.length, 0);
});

test('dup exits non-zero on a cross-producer duplicate and ignores the --out path', t => {
  const root = corpusFixture(t);
  write(root, 'a/one.md', 'shared\n');
  write(root, 'b/one.md', 'shared\n');
  const out = path.join(root, '.ai/runtime/dup.md');
  const result = run(process.execPath,
    [TOOL, 'dup', path.join(root, 'a'), path.join(root, 'b'), '--out', out], root);
  assert.equal(result.status, 1);
  const report = fs.readFileSync(out, 'utf8');
  assert.doesNotMatch(report, /dup\.md,/, 'the output file must not be compared against itself');
  assert.match(report, /identical across sets: 1/);
});

test('a corpus that is not a git repository still gets an inventory', t => {
  const root = makeFixture(t);
  write(root, 'notes/one.txt', 'one\n');
  write(root, 'notes/two.txt', 'two\n');
  const found = ledger.corpus(root, ['.git', 'node_modules']);
  assert.match(found.source, /not a git repository/);
  assert.deepEqual(found.units, ['notes/one.txt', 'notes/two.txt']);
});

test('the report states that it is advisory and decides nothing', t => {
  const root = corpusFixture(t);
  write(root, 'a/one.md', 'x\n');
  write(root, 'b/one.md', 'x\n');
  const rendered = ledger.renderDup(
    ledger.duplicates([path.join(root, 'a'), path.join(root, 'b')]),
    [path.join(root, 'a'), path.join(root, 'b')]);
  assert.match(rendered, /assigns no/);
  assert.match(rendered, /decides nothing/);
});

test('a non-ASCII tracked path survives git quoting (the certification blocker)', t => {
  const root = corpusFixture(t);
  write(root, 'src/крупный.md', 'x'.repeat(60000));
  assert.equal(git(root, ['add', '.']).status, 0);
  assert.equal(git(root, ['-c', 'user.name=Protocol Test', '-c',
    'user.email=protocol-test@example.invalid', 'commit', '-m', 'Add non-ASCII']).status, 0);

  // Precondition: the default configuration C-quotes it, which is what broke this.
  const quoted = git(root, ['ls-files']).stdout.split(/\r?\n/)
    .filter(line => line.startsWith('"'));
  assert.equal(quoted.length, 1, 'precondition: git must be C-quoting the non-ASCII path');
  assert.ok(!quoted[0].includes('крупный'), 'precondition: the quoted form hides the real name');

  const found = ledger.corpus(root, ['.git']);
  assert.ok(found.units.includes('src/крупный.md'),
    'the real path must be a unit, not the quoted string');
  assert.ok(!found.units.some(unit => unit.startsWith('"')),
    'no quoted string may survive as a unit');
});

test('a missing comparison set fails instead of reporting no duplicates', t => {
  const root = corpusFixture(t);
  write(root, 'a/one.md', 'body\n');
  const result = run(process.execPath,
    [TOOL, 'dup', path.join(root, 'a'), path.join(root, 'does-not-exist')], root);
  assert.notEqual(result.status, 0, 'a comparison that never happened is not a clean result');
  assert.match(result.stdout, /not an existing directory/);
});

test('the same directory twice is refused rather than matching itself', t => {
  const root = corpusFixture(t);
  write(root, 'a/one.md', 'body\n');
  const result = run(process.execPath,
    [TOOL, 'dup', path.join(root, 'a'), path.join(root, 'a')], root);
  assert.equal(result.status, 2);
  assert.match(result.stdout, /given twice/);
});

test('an exclusion written with a trailing slash still excludes', t => {
  const root = corpusFixture(t);
  write(root, 'logs/noise.txt', 'noise\n');
  write(root, 'logs-old/keep.txt', 'keep\n');
  assert.equal(git(root, ['add', '.']).status, 0);
  assert.equal(git(root, ['-c', 'user.name=Protocol Test', '-c',
    'user.email=protocol-test@example.invalid', 'commit', '-m', 'Add logs']).status, 0);

  const found = ledger.corpus(root, ['.git', 'logs/']);
  assert.ok(!found.units.includes('logs/noise.txt'), 'trailing slash must still exclude');
  assert.ok(found.units.includes('logs-old/keep.txt'), 'a prefix is not a directory match');
});

test('a missing records directory fails with a named reason', t => {
  const root = corpusFixture(t);
  const result = run(process.execPath,
    [TOOL, 'cover', '--records', path.join(root, 'nope')], root);
  assert.equal(result.status, 2);
  assert.match(result.stdout, /records directory is not an existing directory/);
});
