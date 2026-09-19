'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { repoRoot, makeProtocolFixture, runPowerShell, git, write } = require('./helpers.cjs');

function validate(root) {
  const result = runPowerShell('validate-protocol.ps1', ['-Quiet'], root);
  assert.equal(result.error, undefined, String(result.error));
  return { ...result, output: result.stdout + result.stderr };
}

const validRegistryPath = path.join(repoRoot, 'docs/decisions/REGISTRY.md');
const validRegistryContent = fs.readFileSync(validRegistryPath, 'utf8');
const expectedEntries = validRegistryContent
  .split('\n')
  .filter(line => /^\s*\|\s*(?:PROTO-)?DEC-\d{4}\s*\|/.test(line))
  .length;

const validDecisionsPath = path.join(repoRoot, '.ai/DECISIONS.md');
const validDecisionsContent = fs.readFileSync(validDecisionsPath, 'utf8');

test('registry check 1: complete valid registry passes with 0 warnings', t => {
  const root = makeProtocolFixture(t, { realValidator: true });
  write(root, '.ai/DECISIONS.md', validDecisionsContent);
  write(root, 'docs/decisions/REGISTRY.md', validRegistryContent);
  write(root, '.ai/TASK.md', '# Current Task\n\nStatus: In progress\nOwner: Test\n');

  git(root, ['add', '.ai/DECISIONS.md', 'docs/decisions/REGISTRY.md', '.ai/TASK.md']);
  git(root, ['commit', '-m', 'Baseline decisions and registry']);

  const res = runPowerShell('validate-protocol.ps1', [], root);
  assert.equal(res.status, 0, res.stdout + res.stderr);
  assert.match(res.stdout, new RegExp(`inspected decision registry with ${expectedEntries} entries`));
  assert.match(res.stdout, /Protocol OK\. 0 warning\(s\)\./);
});

test('registry check 2: registry absent emits WARN (migration safety)', t => {
  const root = makeProtocolFixture(t, { realValidator: true });
  fs.rmSync(path.join(root, 'docs/decisions'), { recursive: true, force: true });

  const res = validate(root);
  assert.equal(res.status, 0, res.output);
  assert.match(res.output, /\[WARN\] docs\/decisions\/REGISTRY\.md is missing/);
});

test('registry check 3: missing decision id in registry emits WARN', t => {
  const root = makeProtocolFixture(t, { realValidator: true });
  write(root, '.ai/DECISIONS.md', validDecisionsContent);

  // Remove PROTO-DEC-0032 row from registry
  const lines = validRegistryContent.split('\n').filter(l => !l.includes('PROTO-DEC-0032'));
  write(root, 'docs/decisions/REGISTRY.md', lines.join('\n'));

  const res = validate(root);
  assert.equal(res.status, 0, res.output);
  assert.match(res.output, /\[WARN\] decision registry missing entry for decision PROTO-DEC-0032/);
});

test('registry check 4: extra decision id in registry not in DECISIONS.md emits WARN', t => {
  const root = makeProtocolFixture(t, { realValidator: true });
  write(root, '.ai/DECISIONS.md', validDecisionsContent);

  const extraContent = validRegistryContent + '| DEC-9999 | accepted | none | | | |\n';
  write(root, 'docs/decisions/REGISTRY.md', extraContent);

  const res = validate(root);
  assert.equal(res.status, 0, res.output);
  assert.match(res.output, /\[WARN\] decision registry contains unknown decision DEC-9999/);
});

test('registry check 5: edited row vs HEAD emits WARN (immutability)', t => {
  const root = makeProtocolFixture(t, { realValidator: true });
  write(root, '.ai/DECISIONS.md', validDecisionsContent);
  write(root, 'docs/decisions/REGISTRY.md', validRegistryContent);
  git(root, ['add', '.ai/DECISIONS.md', 'docs/decisions/REGISTRY.md']);
  git(root, ['commit', '-m', 'Commit registry to HEAD']);

  const modifiedContent = validRegistryContent.replace(
    '| DEC-0001 | accepted | none | | | |',
    '| DEC-0001 | accepted | invariant-broken | | | |'
  );
  write(root, 'docs/decisions/REGISTRY.md', modifiedContent);

  const res = validate(root);
  assert.equal(res.status, 0, res.output);
  assert.match(res.output, /\[WARN\] docs\/decisions\/REGISTRY\.md modified or removed existing rows from HEAD/);
});

test('registry check 6: new decision block without Reopen-trigger: emits WARN', t => {
  const root = makeProtocolFixture(t, { realValidator: true });
  write(root, '.ai/DECISIONS.md', validDecisionsContent);
  write(root, 'docs/decisions/REGISTRY.md', validRegistryContent);
  git(root, ['add', '.ai/DECISIONS.md', 'docs/decisions/REGISTRY.md']);
  git(root, ['commit', '-m', 'Baseline commit']);

  const newDecBlock = `\n### PROTO-DEC-0099 New Feature\nStatus: Accepted\nDate: 2026-09-19\nApproved by: Test Owner\n\nContext:\nNew test feature.\n`;
  write(root, '.ai/DECISIONS.md', validDecisionsContent + newDecBlock);

  const regWithNew = validRegistryContent + '| PROTO-DEC-0099 | accepted | none | | | |\n';
  write(root, 'docs/decisions/REGISTRY.md', regWithNew);

  const res = validate(root);
  assert.equal(res.status, 0, res.output);
  assert.match(res.output, /\[WARN\] new decision block PROTO-DEC-0099 missing Reopen-trigger field/);
});

test('registry check 7: new decision block with unknown Reopen-trigger emits WARN', t => {
  const root = makeProtocolFixture(t, { realValidator: true });
  write(root, '.ai/DECISIONS.md', validDecisionsContent);
  write(root, 'docs/decisions/REGISTRY.md', validRegistryContent);
  git(root, ['add', '.ai/DECISIONS.md', 'docs/decisions/REGISTRY.md']);
  git(root, ['commit', '-m', 'Baseline commit']);

  const newDecBlock = `\n### PROTO-DEC-0099 New Feature\nStatus: Accepted\nDate: 2026-09-19\nApproved by: Test Owner\nReopen-trigger: invalid-trigger-name\n\nContext:\nNew test feature.\n`;
  write(root, '.ai/DECISIONS.md', validDecisionsContent + newDecBlock);

  const regWithNew = validRegistryContent + '| PROTO-DEC-0099 | accepted | none | | | |\n';
  write(root, 'docs/decisions/REGISTRY.md', regWithNew);

  const res = validate(root);
  assert.equal(res.status, 0, res.output);
  assert.match(res.output, /\[WARN\] new decision block PROTO-DEC-0099 has unknown Reopen-trigger: invalid-trigger-name/);
});

test('registry check 8: case-mutated row vs HEAD emits immutability and unknown-id WARN', t => {
  const root = makeProtocolFixture(t, { realValidator: true });
  write(root, '.ai/DECISIONS.md', validDecisionsContent);
  write(root, 'docs/decisions/REGISTRY.md', validRegistryContent);
  git(root, ['add', '.ai/DECISIONS.md', 'docs/decisions/REGISTRY.md']);
  git(root, ['commit', '-m', 'Commit registry to HEAD']);

  const mutatedContent = validRegistryContent.replace(
    '| DEC-0001 | accepted | none | | | |',
    '| dec-0001 | ACCEPTED | none | | | |'
  );
  write(root, 'docs/decisions/REGISTRY.md', mutatedContent);

  const res = validate(root);
  assert.equal(res.status, 0, res.output);
  assert.match(res.output, /\[WARN\] docs\/decisions\/REGISTRY\.md modified or removed existing rows from HEAD/);
  assert.match(res.output, /\[WARN\] decision registry missing entry for decision DEC-0001/);
  assert.match(res.output, /\[WARN\] decision registry contains unknown decision dec-0001/);
});

