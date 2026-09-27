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

  // In source role, paths outside docs/reviews/ fail
  write(root, '.ai/TASK.md', '# Current Task\n\nStatus: Completed.\n\n## Completion gate\n\n' +
    '- Adversarial review prompt: custom-reviews/prompt.md\n' +
    '- Independent review: custom-reviews/review.md\n');
  write(root, 'custom-reviews/prompt.md', '# Unified adversarial audit prompt\n\nPrompt content.\n');
  write(root, 'custom-reviews/review.md', '# Independent review\n\nDate: 2026-09-19\nReviewer: opposing-agent\n\nVerdict: PASS\n');
  fails(root, /in source repository, adversarial review prompt must be under docs\/reviews\//);

  // In installed role, owner-selected safe in-root review path outside docs/reviews/ succeeds
  const manifestPath = path.join(root, 'protocol-manifest.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  manifest.role = 'installed';
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

  succeeds(root);

  // Path traversal in completion gate fails safe path check
  write(root, '.ai/TASK.md', '# Current Task\n\nStatus: Completed.\n\n## Completion gate\n\n' +
    '- Adversarial review prompt: ../outside-prompt.md\n' +
    '- Independent review: custom-reviews/review.md\n');
  fails(root, /must be a safe path inside the repository root/);

  // Reset to source role for following tests
  manifest.role = 'source';
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

  // Template 4 exact title Unified Adversarial Audit Prompt passes, old title without unified fails
  write(root, '.ai/TASK.md', '# Current Task\n\nStatus: Completed.\n\n## Completion gate\n\n' +
    '- Adversarial review prompt: docs/reviews/prompt.md\n' +
    '- Independent review: docs/reviews/review.md\n');
  write(root, 'docs/reviews/review.md', '# Independent review\n\nDate: 2026-09-19\nReviewer: opposing-agent\n\nVerdict: PASS\n');
  write(root, 'docs/reviews/prompt.md', '# Unified Adversarial Audit Prompt: Wave A Remediation\n\nPrompt content.\n');
  succeeds(root);
  write(root, 'docs/reviews/prompt.md', '# Mandatory Adversarial Review Prompt: Wave A Remediation\n\nPrompt content.\n');
  fails(root, /must identify a unified adversarial audit prompt/);
});

test('F-5: PowerShell validator review with header terminator on line 0 does not splice last line', t => {
  const root = makeProtocolFixture(t);
  const promptRel = 'docs/reviews/2026-09-20-prompt.md';
  const reviewRel = 'docs/reviews/2026-09-20-review.md';
  write(root, '.ai/TASK.md', '# Current Task\n\nStatus: Completed.\n\n## Completion gate\n\n' +
    `- Adversarial review prompt: ${promptRel}\n` +
    `- Independent review: ${reviewRel}\n`);
  write(root, promptRel, '# Unified Adversarial Audit Prompt\n\nDate: 2026-09-20\nReviewer: auditor\n\nPrompt content.\n');
  // Line 0 is '---', followed by body with Reviewer and Verdict
  write(root, reviewRel, '---\nReviewer: auditor\nDate: 2026-09-20\nVerdict: PASS\n');

  fails(root, /independent review must name a Reviewer/);
});
