'use strict';

// Reproduced in D:\Block-Puzzle and D:\VPN on 2026-09-17: both declared
// protocol v1.9.0 while running an older generation of managed files, and the
// validator stayed green because it compared version strings only. The
// installed manifest now records the digest of the bytes the install
// delivered, and validation compares them. See .ai/TASK.md and
// docs/reviews/2026-09-17-three-repository-review.md.

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { makeProtocolFixture, runPowerShell } = require('./helpers.cjs');

function install(source, target, extra = []) {
  const result = runPowerShell(path.join(source, 'setup-ai-protocol.ps1'),
    ['-Target', target, ...extra], source);
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
}

function validate(target) {
  return runPowerShell('validate-protocol.ps1', ['-Quiet'], target);
}

test('an installed project that keeps an older managed engine fails validation', t => {
  const source = makeProtocolFixture(t);
  const target = path.join(source, 'installed target');
  install(source, target, ['-InitGit']);

  // A plain install keeps a differing managed file instead of replacing it.
  // Simulate the stale copy that a partial upgrade leaves behind.
  fs.writeFileSync(path.join(target, '.ai/bin/protocol-session.cjs'), '// older engine\n');

  const result = validate(target);
  assert.equal(result.status, 1, result.stdout + result.stderr);
  assert.match(result.stdout + result.stderr,
    /protocol-session\.cjs is not the content this protocol version installed/);
});

test('a plain install cannot claim a version it did not deliver', t => {
  const source = makeProtocolFixture(t);
  const target = path.join(source, 'partial target');
  install(source, target, ['-InitGit']);
  const delivered = fs.readFileSync(path.join(target, '.ai/bin/protocol-session.cjs'), 'utf8');

  // The source moves on. A plain install keeps the target's older managed copy,
  // which is exactly how both pilot repositories reached 1.9.0 while stale.
  fs.appendFileSync(path.join(source, '.ai/bin/protocol-session.cjs'), '\n// source moved on\n');
  install(source, target);
  assert.equal(fs.readFileSync(path.join(target, '.ai/bin/protocol-session.cjs'), 'utf8'), delivered,
    'a plain install must not replace a managed file');

  const result = validate(target);
  assert.equal(result.status, 1, result.stdout + result.stderr);
  assert.match(result.stdout + result.stderr,
    /protocol-session\.cjs is not the content this protocol version installed/);
});

test('a reconciled AGENTS.md warns but does not fail validation', t => {
  const source = makeProtocolFixture(t);
  const target = path.join(source, 'reconciled target');
  install(source, target, ['-InitGit']);

  const agents = fs.readFileSync(path.join(target, 'AGENTS.md'), 'utf8');
  fs.writeFileSync(path.join(target, 'AGENTS.md'),
    `${agents}\n## Local project rules\n\nKeep this section when upgrading.\n`);

  const result = validate(target);
  assert.equal(result.status, 0, result.stdout + result.stderr);
  assert.match(result.stdout + result.stderr,
    /AGENTS\.md differs from the installed protocol content/);
});

test('a reconciled COPILOT.md and GLM.md warn but do not fail validation', t => {
  const source = makeProtocolFixture(t);
  const target = path.join(source, 'reconciled target docs');
  install(source, target, ['-InitGit']);

  const copilotDoc = path.join(target, '.ai/docs/COPILOT.md');
  fs.appendFileSync(copilotDoc, '\n## Local adjustments\n');

  const result = validate(target);
  assert.equal(result.status, 0, result.stdout + result.stderr);
  assert.match(result.stdout + result.stderr,
    /COPILOT\.md differs from the installed protocol content; it is a document the host may reconcile/);
});

test('the installed manifest records a digest for every managed file', t => {
  const source = makeProtocolFixture(t);
  const target = path.join(source, 'digest target');
  install(source, target, ['-InitGit']);
  const manifest = JSON.parse(fs.readFileSync(path.join(target, 'protocol-manifest.json'), 'utf8'));
  assert.equal(manifest.role, 'installed');
  assert.equal(manifest.contentDigest['protocol-manifest.json'], undefined,
    'the manifest cannot carry its own hash');
  for (const relative of manifest.managed) {
    if (relative === 'protocol-manifest.json') continue;
    assert.match(manifest.contentDigest[relative] || '', /^sha256:[a-f0-9]{64}$/, relative);
  }
});
