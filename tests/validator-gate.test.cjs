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

// A-1, PROTO-DEC-0087 item 4. AGENTS.md section 2: an advisory output carries
// `[MODE: READ-ONLY ADVISORY]`, is non-certifying, and cannot satisfy the independent-review gate.
// The validator refused only an exact `Mode: ADVISORY`, and the installed role runs no gate-check.
const A1_PROMPT = 'docs/reviews/2026-09-28-a1-prompt.md';
const A1_REVIEW = 'docs/reviews/2026-09-28-a1-review.md';
const A1_FORMS = ['Mode: READ-ONLY ADVISORY', '[MODE: READ-ONLY ADVISORY]'];
const ADVISORY_REFUSED = /advisory reviews cannot satisfy the independent review gate/;

function a1Review(header, body = '') {
  return `# Independent review\n\nDate: 2026-09-28\nReviewer: opposing-agent\n${header}\nVerdict: PASS\n${body}`;
}

// Commits the role into a fresh baseline, since a changed manifest would force the strict path,
// then leaves one docs change for the light path. Returns the TASK.md text for both paths.
function a1Baseline(root, role) {
  const manifestPath = path.join(root, 'protocol-manifest.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  manifest.role = role;
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  git(root, ['add', '-A']);
  git(root, ['commit', '-m', `A-1 ${role} baseline`]);
  const baseline = git(root, ['rev-parse', 'HEAD']).stdout.trim();
  write(root, 'docs/user-guide.md', `# User Guide\n\nChanged after the ${role} baseline.\n`);
  write(root, A1_PROMPT, '# Unified Adversarial Audit Prompt\n\nPrompt content.\n');
  const task = gate => `# Current Task\n\nStatus: Completed.\n\n## Completion gate\n\n${gate}`;
  return {
    strict: task(`- Adversarial review prompt: ${A1_PROMPT}\n- Independent review: ${A1_REVIEW}\n`),
    light: task(`- Scope: docs\n- Baseline: ${baseline}\n- Independent review: ${A1_REVIEW}\n`),
  };
}

// Validates each review in turn and names every one the gate did not refuse as advisory. A
// light-path task that fell to the strict path fails on its missing prompt; that is no refusal.
function a1NotRefused(root, reviews) {
  const missed = [];
  for (const [label, review] of reviews) {
    write(root, A1_REVIEW, review);
    const { status, output } = validate(root);
    if (status !== 1 || !ADVISORY_REFUSED.test(output) || /missing its adversarial review prompt field/.test(output)) {
      missed.push(`${label} -> exit ${status}`);
    }
  }
  return missed;
}

test('A-1: a READ-ONLY ADVISORY review fails the completion gate in both roles and on both paths', t => {
  const root = makeProtocolFixture(t);
  const missed = [];
  for (const role of ['installed', 'source']) {
    const tasks = a1Baseline(root, role);
    for (const [route, task] of Object.entries(tasks)) {
      write(root, '.ai/TASK.md', task);
      missed.push(...a1NotRefused(root, A1_FORMS.map(form => [`${role}/${route}/${form}`, a1Review(form)])));
      if (role === 'installed') {
        // Control: the same fixture with a certifying header passes, so the refusal is the form's.
        write(root, A1_REVIEW, a1Review('Mode: CERTIFYING'));
        succeeds(root);
      }
    }
  }
  assert.deepEqual(missed, []);
});

test('A-1: advisory Mode values and markers are refused in any spelling, in the review header only', t => {
  const root = makeProtocolFixture(t);
  write(root, '.ai/TASK.md', a1Baseline(root, 'installed').strict);
  const missed = a1NotRefused(root, [
    '- Mode: read-only advisory (owner-requested audit; certifies nothing)',
    '**Mode:** READ-ONLY ADVISORY',
    'Mode: CERTIFYING\nMode: READ-ONLY ADVISORY',
    '> [Mode: Read-Only Advisory]',
    // The exact rule refused this; a scan that consumed the first line would skip the second.
    '- Mode:\nMode:\nADVISORY',
  ].map(header => [JSON.stringify(header), a1Review(header)]));
  assert.deepEqual(missed, []);
  // The header region ends at the first `---` line. A certifying review that quotes both forms in
  // its body, as a review of this fix will, still passes.
  write(root, A1_REVIEW, a1Review('Mode: CERTIFYING',
    '\n---\n\nMode: READ-ONLY ADVISORY and [MODE: READ-ONLY ADVISORY] now fail the gate.\n'));
  succeeds(root);
  // The review template explains the modes in an HTML comment above its first `---` and quotes the
  // marker there. A certifying review filled in from it, comments kept, still passes.
  const template = fs.readFileSync(path.join(root, 'templates', 'reviews', 'REVIEW.md'), 'utf8');
  write(root, A1_REVIEW, template.replace('**Mode**: CERTIFYING | ADVISORY', '**Mode**: CERTIFYING')
    .replace(/\*\*Verdict\*\*: \[[^\]\r\n]*\]/, '**Verdict**: PASS'));
  succeeds(root);
});
