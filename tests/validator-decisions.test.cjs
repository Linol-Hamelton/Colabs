'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const {
  makeProtocolFixture, makeFixture, seedProtocol, runPowerShell, git, write, run,
} = require('./helpers.cjs');

function validate(root) {
  const result = runPowerShell('validate-protocol.ps1', ['-Quiet'], root);
  assert.equal(result.error, undefined, String(result.error));
  return { ...result, output: result.stdout + result.stderr };
}

function succeeds(root) {
  const result = validate(root);
  assert.equal(result.status, 0, result.output);
  return result.output;
}

function fails(root, expected) {
  const result = validate(root);
  assert.equal(result.status, 1, result.output);
  assert.match(result.output, expected);
  return result.output;
}

function decision(fields = 'Status: Accepted\nDate: 2026-09-11\nApproved by: Test Owner\n', id = '0001') {
  return `# Decisions\n\n### DEC-${id}\n\n${fields}`;
}

test('each decision validates its own status, date and approval field', t => {
  const root = makeProtocolFixture(t);
  const blocks = [
    '# Decisions\n',
    '### DEC-0001\nStatus: Accepted\nDate: 2026-09-11\n', // missing approval
    '### DEC-0002\nStatus: Accepted\nDate: 2026-09-11\nApproved by: \n', // blank approval
    '### DEC-0003\nStatus: Accepted\nDate: 2026-09-11\nApproved by: _a human name_\n', // placeholder approval
    '### DEC-0004\nStatus: Superseded by DEC-0099\nDate: 2026-09-11\n', // superseded without approval
    '### DEC-0005\nDate: 2026-09-11\nApproved by: Test Owner\n', // missing status
    '### DEC-0006\nStatus: Done\nDate: 2026-09-11\nApproved by: Test Owner\n', // invalid status
    '### DEC-0007\nStatus: Accepted\nApproved by: Test Owner\n', // missing date
    '### DEC-0008\nStatus: Accepted\nDate: 2026-02-30\nApproved by: Test Owner\n', // impossible date
    '### DEC-0009\nStatus: Proposed\nDate: 2026-09-11\nApproved by: Test Owner\n', // proposed status forbidden
    '### DEC-0010\nStatus: Accepted\nStatus: Accepted\nDate: 2026-09-11\nApproved by: Test Owner\n', // duplicate status
    '### DEC-0011\nStatus: Accepted\nDate: 2026-09-11\nApproved by: One\nApproved by: Two\n', // duplicate approval
  ].join('\n');
  write(root, '.ai/DECISIONS.md', blocks);
  const output = fails(root, /DEC-0001 requires a non-placeholder Approved by field/);
  assert.match(output, /DEC-0002 requires a non-placeholder Approved by field/);
  assert.match(output, /DEC-0003 requires a non-placeholder Approved by field/);
  assert.match(output, /DEC-0004 requires a non-placeholder Approved by field/);
  assert.match(output, /DEC-0005 has missing or invalid Status/);
  assert.match(output, /DEC-0006 has missing or invalid Status/);
  assert.match(output, /DEC-0007 requires a valid Date/);
  assert.match(output, /DEC-0008 requires a valid Date/);
  assert.match(output, /DEC-0009 has missing or invalid Status \(Proposed is forbidden; drafts belong in PLAN\.md\)/);
  assert.match(output, /DEC-0010 has duplicate Status fields/);
  assert.match(output, /DEC-0011 has duplicate Approved by fields/);
});

test('approval in a following block or template cannot approve an earlier block', t => {
  const root = makeProtocolFixture(t);
  write(root, '.ai/DECISIONS.md', decision('Status: Accepted\nDate: 2026-09-11\n') +
    '\n### DEC-0002\nStatus: Accepted\nDate: 2026-09-11\nApproved by: Test Owner\n' +
    '\n## Template\n### DEC-nnnn\nApproved by: Another Owner\n');
  fails(root, /DEC-0001 requires a non-placeholder Approved by field/);
});

test('Proposed status is forbidden in DECISIONS and PROTO-DEC-nnnn is accepted', t => {
  const root = makeProtocolFixture(t);
  write(root, '.ai/DECISIONS.md', decision('Status: Proposed\nDate: 2026-09-11\nApproved by: Test Owner\n'));
  fails(root, /Proposed is forbidden; drafts belong in PLAN\.md/);

  // PROTO-DEC-nnnn prefix succeeds
  write(root, '.ai/DECISIONS.md', '# Decisions\n\n### PROTO-DEC-0001\n\nStatus: Accepted\nDate: 2026-09-11\nApproved by: Test Owner\n');
  succeeds(root);

  // Duplicate PROTO-DEC-0001 fails
  fs.appendFileSync(path.join(root, '.ai/DECISIONS.md'), '\n### PROTO-DEC-0001\nStatus: Accepted\nDate: 2026-09-11\nApproved by: Test Owner\n');
  fails(root, /duplicate decision: PROTO-DEC-0001/);
});

test('task status must be meaningful and unique', t => {
  const root = makeProtocolFixture(t);
  write(root, '.ai/TASK.md', 'Status: something\n');
  fails(root, /invalid Status/);
  write(root, '.ai/TASK.md', 'Status: In progress\nStatus: Completed\n');
  fails(root, /exactly one Status/);
  write(root, '.ai/TASK.md', 'Status: Completed. Ready for owner.\n');
  fails(root, /completed task requires a ## Completion gate/);
});

test('decision immutability: appending a new block exits 0, editing a committed block exits 1', t => {
  const root = makeProtocolFixture(t);
  const baseDecisions = '# Decisions\n\n### PROTO-DEC-0001 First Decision\n\nStatus: Accepted\nDate: 2026-09-20\nApproved by: Test Owner\nReopen-trigger: none\n\nFirst decision body.\n';
  write(root, '.ai/DECISIONS.md', baseDecisions);
  const regPath = path.join(root, 'docs/decisions/REGISTRY.md');
  const baseRegistry = '# Decision Registry\n\n| id | status | reopen-trigger | frozen-at | supersedes | evidence |\n|---|---|---|---|---|---|\n| PROTO-DEC-0001 | accepted | none | | | |\n';
  write(root, 'docs/decisions/REGISTRY.md', baseRegistry);

  git(root, ['add', '-A']);
  git(root, ['commit', '-m', 'Commit initial decision and registry']);

  // Direction A: Appending a new decision block after a committed last block (with --- separator) exits 0
  const appendedDecisions = baseDecisions + '\n---\n\n### PROTO-DEC-0002 Second Decision\n\nStatus: Accepted\nDate: 2026-09-21\nApproved by: Test Owner\nReopen-trigger: none\n\nSecond decision body.\n';
  write(root, '.ai/DECISIONS.md', appendedDecisions);
  write(root, 'docs/decisions/REGISTRY.md', baseRegistry + '| PROTO-DEC-0002 | accepted | none | | | |\n');

  succeeds(root);

  // Direction B: Genuine edit to a written block is caught (exit 1)
  const editedDecisions = baseDecisions.replace('First decision body.', 'Tampered decision body.') +
    '\n---\n\n### PROTO-DEC-0002 Second Decision\n\nStatus: Accepted\nDate: 2026-09-21\nApproved by: Test Owner\nReopen-trigger: none\n\nSecond decision body.\n';
  write(root, '.ai/DECISIONS.md', editedDecisions);

  fails(root, /PROTO-DEC-0001 was edited after it was written; a decision block is never rewritten/);

  // Direction C: Deletion of a written block is caught (exit 1)
  const deletedDecisions = '# Decisions\n\n### PROTO-DEC-0002 Second Decision\n\nStatus: Accepted\nDate: 2026-09-21\nApproved by: Test Owner\nReopen-trigger: none\n\nSecond decision body.\n';
  write(root, '.ai/DECISIONS.md', deletedDecisions);

  fails(root, /PROTO-DEC-0001 was deleted; a decision block is never removed/);

  // Direction D: F-003 positive regression test: block has an internal ---, editing text AFTER the internal --- is caught (exit 1)
  const rootD = makeProtocolFixture(t);
  const baseDecisionsWithInternalHr = '# Decisions\n\n### PROTO-DEC-0001 First Decision\n\nStatus: Accepted\nDate: 2026-09-20\nApproved by: Test Owner\nReopen-trigger: none\n\nText before internal separator.\n\n---\n\nText after internal separator.\n';
  write(rootD, '.ai/DECISIONS.md', baseDecisionsWithInternalHr);
  write(rootD, 'docs/decisions/REGISTRY.md', baseRegistry);
  git(rootD, ['add', '-A']);
  git(rootD, ['commit', '-m', 'Commit decision with internal hr']);

  // Edit text AFTER internal --- must fail (exit 1)
  const tamperedAfterInternalHr = baseDecisionsWithInternalHr.replace('Text after internal separator.', 'Tampered text after separator.');
  write(rootD, '.ai/DECISIONS.md', tamperedAfterInternalHr);
  fails(rootD, /PROTO-DEC-0001 was edited after it was written; a decision block is never rewritten/);

  // Appending a new block after a committed block that has an internal --- must succeed (exit 0)
  const appendedAfterInternalHr = baseDecisionsWithInternalHr + '\n---\n\n### PROTO-DEC-0002 Second Decision\n\nStatus: Accepted\nDate: 2026-09-21\nApproved by: Test Owner\nReopen-trigger: none\n\nSecond decision body.\n';
  write(rootD, '.ai/DECISIONS.md', appendedAfterInternalHr);
  write(rootD, 'docs/decisions/REGISTRY.md', baseRegistry + '| PROTO-DEC-0002 | accepted | none | | | |\n');
  succeeds(rootD);

  // Direction E: C07 / F-S2-02: inserting a bare --- line into a written block is caught (exit 1)
  const rootE = makeProtocolFixture(t);
  write(rootE, '.ai/DECISIONS.md', baseDecisions);
  write(rootE, 'docs/decisions/REGISTRY.md', baseRegistry);
  git(rootE, ['add', '-A']);
  git(rootE, ['commit', '-m', 'Commit initial decision']);

  const insertedHr = baseDecisions.replace('First decision body.', 'First decision body.\n\n---\n\nMore body.');
  write(rootE, '.ai/DECISIONS.md', insertedHr);
  fails(rootE, /PROTO-DEC-0001 was edited after it was written; a decision block is never rewritten/);

  // Direction F: C07 / F-S2-02: removing an internal --- line is caught (exit 1)
  const rootF = makeProtocolFixture(t);
  write(rootF, '.ai/DECISIONS.md', baseDecisionsWithInternalHr);
  write(rootF, 'docs/decisions/REGISTRY.md', baseRegistry);
  git(rootF, ['add', '-A']);
  git(rootF, ['commit', '-m', 'Commit decision with internal hr']);

  const removedHr = baseDecisionsWithInternalHr.replace('\n\n---\n\n', '\n\n');
  write(rootF, '.ai/DECISIONS.md', removedHr);
  fails(rootF, /PROTO-DEC-0001 was edited after it was written; a decision block is never rewritten/);

  // Direction G: C07: editing heading text is caught (exit 1)
  const rootG = makeProtocolFixture(t);
  write(rootG, '.ai/DECISIONS.md', baseDecisions);
  write(rootG, 'docs/decisions/REGISTRY.md', baseRegistry);
  git(rootG, ['add', '-A']);
  git(rootG, ['commit', '-m', 'Commit initial decision']);

  const editedHeading = baseDecisions.replace('### PROTO-DEC-0001 First Decision', '### PROTO-DEC-0001 First Decision Altered');
  write(rootG, '.ai/DECISIONS.md', editedHeading);
  fails(rootG, /PROTO-DEC-0001 was edited after it was written; a decision block is never rewritten/);

  // Direction H: C07: adding trailing space to approval line is caught (exit 1)
  const rootH = makeProtocolFixture(t);
  write(rootH, '.ai/DECISIONS.md', baseDecisions);
  write(rootH, 'docs/decisions/REGISTRY.md', baseRegistry);
  git(rootH, ['add', '-A']);
  git(rootH, ['commit', '-m', 'Commit initial decision']);

  const trailingSpace = baseDecisions.replace('Approved by: Test Owner\n', 'Approved by: Test Owner \n');
  write(rootH, '.ai/DECISIONS.md', trailingSpace);
  fails(rootH, /PROTO-DEC-0001 was edited after it was written; a decision block is never rewritten/);

  // Direction I: C07: appending a new block without separator succeeds (exit 0)
  const rootI = makeProtocolFixture(t);
  write(rootI, '.ai/DECISIONS.md', baseDecisions);
  write(rootI, 'docs/decisions/REGISTRY.md', baseRegistry);
  git(rootI, ['add', '-A']);
  git(rootI, ['commit', '-m', 'Commit initial decision']);

  const appendedNoSep = baseDecisions + '\n\n### PROTO-DEC-0002 Second Decision\n\nStatus: Accepted\nDate: 2026-09-21\nApproved by: Test Owner\nReopen-trigger: none\n\nSecond decision body.\n';
  write(rootI, '.ai/DECISIONS.md', appendedNoSep);
  write(rootI, 'docs/decisions/REGISTRY.md', baseRegistry + '| PROTO-DEC-0002 | accepted | none | | | |\n');
  succeeds(rootI);

  // Direction J: Codex observation (RC-immutability-boundary): adding a blank line to the end of DECISIONS.md without a new block fails (exit 1)
  const rootJ = makeProtocolFixture(t);
  write(rootJ, '.ai/DECISIONS.md', baseDecisions);
  write(rootJ, 'docs/decisions/REGISTRY.md', baseRegistry);
  git(rootJ, ['add', '-A']);
  git(rootJ, ['commit', '-m', 'Commit initial decision']);

  const blankLineTamper = baseDecisions + '\n';
  write(rootJ, '.ai/DECISIONS.md', blankLineTamper);
  fails(rootJ, /PROTO-DEC-0001 was edited after it was written; a decision block is never rewritten/);

  // Direction K: Trailing separator alone ('\n---\n') without new block succeeds (exit 0)
  const rootK = makeProtocolFixture(t);
  write(rootK, '.ai/DECISIONS.md', baseDecisions);
  write(rootK, 'docs/decisions/REGISTRY.md', baseRegistry);
  git(rootK, ['add', '-A']);
  git(rootK, ['commit', '-m', 'Commit initial decision']);

  const trailingSep = baseDecisions + '\n---\n';
  write(rootK, '.ai/DECISIONS.md', trailingSep);
  succeeds(rootK);
});
