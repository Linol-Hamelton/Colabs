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

test('a fresh protocol instance validates and reports its idle task', t => {
  const root = makeProtocolFixture(t);
  assert.match(succeeds(root), /no active task/);
});

test('junction escape outside repository root fails safe path check in validator', t => {
  const root = makeProtocolFixture(t);
  const manifestPath = path.join(root, 'protocol-manifest.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  manifest.role = 'installed';
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

  // Normal owner-selected in-root path exits 0
  write(root, '.ai/TASK.md', '# Current Task\n\nStatus: Completed.\n\n## Completion gate\n\n' +
    '- Adversarial review prompt: custom-reviews/prompt.md\n' +
    '- Independent review: custom-reviews/review.md\n');
  write(root, 'custom-reviews/prompt.md', '# Unified Adversarial Audit Prompt: valid\n\nValid.\n');
  write(root, 'custom-reviews/review.md', '# Independent review\n\nDate: 2026-09-19\nReviewer: auditor\nVerdict: PASS\n');
  succeeds(root);

  // Junction pointing outside root fails validator with exit 1 (guarded for Windows-only)
  if (process.platform === 'win32') {
    const outside = fs.mkdtempSync(path.join(os.tmpdir(), 'colabs-junc-outside-'));
    t.after(() => fs.rmSync(outside, { recursive: true, force: true }));

    fs.writeFileSync(path.join(outside, 'prompt.md'), '# Unified Adversarial Audit Prompt: escape\n');
    fs.writeFileSync(path.join(outside, 'review.md'), '# Independent review\n\nDate: 2026-09-19\nReviewer: auditor\nVerdict: PASS\n');

    const link = path.join(root, 'docs/reviews/junc-link');
    fs.mkdirSync(path.join(root, 'docs/reviews'), { recursive: true });
    fs.symlinkSync(outside, link, 'junction');

    write(root, '.ai/TASK.md', '# Current Task\n\nStatus: Completed.\n\n## Completion gate\n\n' +
      '- Adversarial review prompt: docs/reviews/junc-link/prompt.md\n' +
      '- Independent review: docs/reviews/junc-link/review.md\n');
    fails(root, /must be a safe path inside the repository root/);
  }
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

test('C40-06: in-root junction is rejected by path safety check', t => {
  const root = makeProtocolFixture(t);
  git(root, ['add', '-A']);
  git(root, ['commit', '-m', 'Base commit']);
  const baseline = git(root, ['rev-parse', 'HEAD']).stdout.trim();

  write(root, 'docs/user-guide.md', '# User Guide\n\nSome doc content.\n');
  fs.mkdirSync(path.join(root, 'docs', 'target-dir'), { recursive: true });
  write(root, 'docs/target-dir/guide-review.md', 'Reviewer: docs-auditor\nVerdict: PASS\n');

  try {
    fs.symlinkSync(path.join(root, 'docs', 'target-dir'), path.join(root, 'docs', 'link-dir'), 'junction');
  } catch {
    t.skip('Filesystem does not permit junctions in this test environment');
    return;
  }

  write(root, '.ai/TASK.md', '# Current Task\n\nStatus: Completed.\n\n## Completion gate\n\n' +
    '- Scope: docs\n' +
    `- Baseline: ${baseline}\n` +
    '- Independent review: docs/link-dir/guide-review.md\n');

  fails(root, /must be a safe path inside the repository root/);
});

test('C40-07: non-.md files and nested subdirectories in docs/reviews are counted towards corpus budget', t => {
  const root = makeProtocolFixture(t);
  fs.mkdirSync(path.join(root, 'docs', 'reviews', 'sub'), { recursive: true });
  for (let i = 0; i < 201; i++) {
    write(root, `docs/reviews/sub/file${i}.txt`, 'review content\n');
  }

  const out = validate(root).output;
  assert.match(out, /active docs\/reviews\/ exceeds budget \(201 files/);
});

test('C40-07: docs/reviews/archive is excluded from corpus budget count', t => {
  const root = makeProtocolFixture(t);
  fs.mkdirSync(path.join(root, 'docs', 'reviews', 'archive'), { recursive: true });
  for (let i = 0; i < 205; i++) {
    write(root, `docs/reviews/archive/archived${i}.md`, 'archived review\n');
  }

  const out = validate(root).output;
  assert.doesNotMatch(out, /active docs\/reviews\/ exceeds budget/);
});

test('C40-07: corpus byte limit triggers warning independently of file count', t => {
  const root = makeProtocolFixture(t);
  fs.mkdirSync(path.join(root, 'docs', 'reviews'), { recursive: true });
  const largeBuf = Buffer.alloc(2100 * 1024, 'a');
  fs.writeFileSync(path.join(root, 'docs', 'reviews', 'large-review.md'), largeBuf);

  const out = validate(root).output;
  assert.match(out, /active docs\/reviews\/ exceeds budget/);
});

test('C40-07: junction / symlink outside root in docs/reviews is not traversed by corpus check', t => {
  const root = makeProtocolFixture(t);
  if (process.platform !== 'win32') {
    t.skip('Windows junction test only');
    return;
  }
  const outside = fs.mkdtempSync(path.join(os.tmpdir(), 'colabs-corpus-outside-'));
  t.after(() => fs.rmSync(outside, { recursive: true, force: true }));

  // Create 205 files outside root (above the PROTO-DEC-0057 cap of 200)
  for (let i = 0; i < 205; i++) {
    fs.writeFileSync(path.join(outside, `outside-review-${i}.md`), 'content\n');
  }

  // Create junction inside docs/reviews pointing outside
  fs.mkdirSync(path.join(root, 'docs', 'reviews'), { recursive: true });
  const link = path.join(root, 'docs', 'reviews', 'outside-link');
  try {
    fs.symlinkSync(outside, link, 'junction');
  } catch {
    t.skip('Filesystem does not permit junctions in this test environment');
    return;
  }

  const out = validate(root).output;
  assert.doesNotMatch(out, /active docs\/reviews\/ exceeds budget/);
});
