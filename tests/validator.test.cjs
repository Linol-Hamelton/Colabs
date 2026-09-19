'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {
  makeProtocolFixture, makeFixture, seedProtocol, runPowerShell, git, write,
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

test('a fresh protocol instance validates and reports its idle task', t => {
  const root = makeProtocolFixture(t);
  assert.match(succeeds(root), /no active task/);
});

test('completed tasks require a prompt and independent review completion gate', t => {
  const root = makeProtocolFixture(t);
  write(root, '.ai/TASK.md', '# Current Task\n\nStatus: Completed.\n');
  fails(root, /completed task requires a ## Completion gate/);

  write(root, '.ai/TASK.md', '# Current Task\n\nStatus: Completed.\n\n## Completion gate\n\n' +
    '- Adversarial review prompt: docs/reviews/prompt.md\n' +
    '- Independent review: docs/reviews/review.md\n');
  write(root, 'docs/reviews/prompt.md', '# Unified adversarial audit prompt\n\n' +
    'This unified adversarial review prompt covers every changed item.\n');
  write(root, 'docs/reviews/review.md', '# Independent review\n\nDate: 2026-09-19\nReviewer: opposing-agent\n\nVerdict: PASS\n');
  succeeds(root);

  write(root, 'docs/reviews/review.md', '# Independent review\n\nDate: 2026-09-19\nReviewer: opposing-agent\n\nVerdict: BLOCKED\n');
  fails(root, /must have a PASS or RECOMMENDATION verdict/);

  // Separate artifacts required
  write(root, '.ai/TASK.md', '# Current Task\n\nStatus: Completed.\n\n## Completion gate\n\n' +
    '- Adversarial review prompt: docs/reviews/review.md\n' +
    '- Independent review: docs/reviews/review.md\n');
  fails(root, /must be separate artifacts/);

  // Reviewer required
  write(root, '.ai/TASK.md', '# Current Task\n\nStatus: Completed.\n\n## Completion gate\n\n' +
    '- Adversarial review prompt: docs/reviews/prompt.md\n' +
    '- Independent review: docs/reviews/review.md\n');
  write(root, 'docs/reviews/review.md', '# Independent review\n\nDate: 2026-09-19\nVerdict: PASS\n');
  fails(root, /must name a Reviewer/);

  // Unified adversarial prompt required
  write(root, 'docs/reviews/review.md', '# Independent review\n\nDate: 2026-09-19\nReviewer: opposing-agent\n\nVerdict: RECOMMENDATION\n');
  write(root, 'docs/reviews/prompt.md', '# Regular prompt\n\nPlease review.\n');
  fails(root, /must identify a unified adversarial audit prompt/);

  // Compliant with RECOMMENDATION succeeds
  write(root, 'docs/reviews/prompt.md', '# Unified adversarial audit prompt\n\nPrompt content.\n');
  succeeds(root);

  // Empty prompt fails
  write(root, 'docs/reviews/prompt.md', '   \n\n');
  fails(root, /must not be empty/);
  write(root, 'docs/reviews/prompt.md', '# Unified adversarial audit prompt\n\nPrompt content.\n');

  // Empty review fails
  write(root, 'docs/reviews/review.md', '');
  fails(root, /must not be empty/);
  write(root, 'docs/reviews/review.md', '# Independent review\n\nDate: 2026-09-19\nReviewer: opposing-agent\n\nVerdict: PASS\n');

  // Completed task citing missing review artifact in TASK.md fails
  write(root, '.ai/TASK.md', '# Current Task\n\nStatus: Completed.\n\nSee docs/reviews/missing-analysis.md.\n\n## Completion gate\n\n' +
    '- Adversarial review prompt: docs/reviews/prompt.md\n' +
    '- Independent review: docs/reviews/review.md\n');
  fails(root, /cites missing review artifact/);

  // Completed task citing existing review artifact succeeds
  write(root, 'docs/reviews/missing-analysis.md', '# Analysis\n\nContent.\n');
  succeeds(root);

  // Completed task citing empty review artifact fails
  write(root, 'docs/reviews/missing-analysis.md', '   \n');
  fails(root, /cites empty review artifact/);
});

test('required protocol state is inspected even when Git ignores it', t => {
  const root = makeProtocolFixture(t);
  fs.appendFileSync(path.join(root, '.gitignore'), '\n.ai/\n');
  write(root, '.ai/TASK.md', 'Status: In progress\r\n');
  fails(root, /CR\/CRLF found.*\.ai\/TASK\.md/);
});

test('line limits count a final newline correctly, with and without it', t => {
  const root = makeProtocolFixture(t);
  for (const finalNewline of [true, false]) {
    write(root, '.ai/TASK.md', ['Status: In progress', ...Array(79).fill('line')].join('\n') + (finalNewline ? '\n' : ''));
    write(root, '.ai/PLAN.md', Array(200).fill('line').join('\n') + (finalNewline ? '\n' : ''));
    write(root, '.ai/worklog/custom.md', Array(150).fill('line').join('\n') + (finalNewline ? '\n' : ''));
    succeeds(root);
  }
  fs.appendFileSync(path.join(root, '.ai/TASK.md'), '\none too many\n');
  fails(root, /TASK\.md: 81 lines exceeds limit of 80/);
});

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

test('a directory named .git does not prove a valid working tree', t => {
  const root = makeProtocolFixture(t);
  fs.renameSync(path.join(root, '.git'), path.join(root, 'original-git'));
  fs.mkdirSync(path.join(root, '.git'));
  fails(root, /not a valid Git working tree/);
});

test('Git history command failures are failures instead of empty-history warnings', t => {
  const root = makeProtocolFixture(t);
  write(root, '.git/refs/heads/broken', 'not-an-object-id\n');
  fails(root, /cannot read Git history/);
});

test('linked worktrees with .git files validate', t => {
  const root = makeFixture(t);
  const linked = path.join(root, 'linked project');
  const result = git(root, ['worktree', 'add', '--detach', linked, 'HEAD']);
  assert.equal(result.status, 0, result.stderr);
  seedProtocol(linked);
  assert.ok(fs.statSync(path.join(linked, '.git')).isFile());
  succeeds(linked);
});

test('a protocol instance in a parent repository requires its own root', t => {
  const root = makeFixture(t);
  const nested = path.join(root, 'nested');
  seedProtocol(nested);
  fails(nested, /protocol root is inside another repository/);
});

