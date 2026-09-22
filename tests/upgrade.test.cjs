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
const os = require('node:os');
const { makeProtocolFixture, runPowerShell, repoRoot, run } = require('./helpers.cjs');

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

test('a reconciled PAIRED-CYCLE.md warns but does not fail validation', t => {
  const source = makeProtocolFixture(t);
  const target = path.join(source, 'reconciled paired-cycle');
  install(source, target, ['-InitGit']);

  const pairedDoc = path.join(target, '.ai/docs/PAIRED-CYCLE.md');
  fs.appendFileSync(pairedDoc, '\n## Local adjustments\n');

  const result = validate(target);
  assert.equal(result.status, 0, result.stdout + result.stderr);
  assert.match(result.stdout + result.stderr,
    /PAIRED-CYCLE\.md differs from the installed protocol content; it is a document the host may reconcile/);
});

test('missing PAIRED-CYCLE.md in an installed project fails validation', t => {
  const source = makeProtocolFixture(t);
  const target = path.join(source, 'missing paired-cycle');
  install(source, target, ['-InitGit']);

  fs.rmSync(path.join(target, '.ai/docs/PAIRED-CYCLE.md'));

  const result = validate(target);
  assert.equal(result.status, 1, result.stdout + result.stderr);
  assert.match(result.stdout + result.stderr, /missing file: \.ai\/docs\/PAIRED-CYCLE\.md/);
});

const historicalTags = ['v1.9.4', 'v1.9.5'];
const passedTags = new Set();

for (const tag of historicalTags) {
  test(`upgrade from historical release fixture ${tag} restores PAIRED-CYCLE and reaches parity with -Force`, t => {
    // Note for CI checkout workflows: release tags must be fetched via git fetch --tags or actions/checkout with fetch-depth: 0.
    const tagCheck = run('git', ['tag', '-l', tag], repoRoot);
    const tagList = (tagCheck.stdout || '').split(/\r?\n/).map(s => s.trim());
    if (tagCheck.status !== 0 || !tagList.includes(tag)) {
      t.skip(`Historical release tag ${tag} not found in repository. CI checkout must fetch tags (git fetch --tags or actions/checkout fetch-depth: 0).`);
      return;
    }

    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), `colabs-upgrade-${tag}-`));
    t.after(() => fs.rmSync(tmp, { recursive: true, force: true }));

    const tarPath = path.join(tmp, 'release.tar');
    const oldSrc = path.join(tmp, 'old-src');
    const target = path.join(tmp, 'target');
    fs.mkdirSync(oldSrc);
    fs.mkdirSync(target);

    const archRes = run('git', ['archive', '--format=tar', '-o', tarPath, tag], repoRoot);
    assert.equal(archRes.status, 0, `git archive failed: ${archRes.stdout} ${archRes.stderr}`);

    const tarExe = (process.platform === 'win32' && fs.existsSync('C:\\Windows\\System32\\tar.exe'))
      ? 'C:\\Windows\\System32\\tar.exe'
      : 'tar';
    const tarRes = run(tarExe, ['-xf', 'release.tar', '-C', 'old-src'], tmp);
    assert.equal(tarRes.status, 0, `tar extraction failed: ${tarRes.stdout} ${tarRes.stderr}`);

    const instRes = runPowerShell(path.join(oldSrc, 'setup-ai-protocol.ps1'), ['-Target', target, '-InitGit'], oldSrc);
    assert.equal(instRes.status, 0, instRes.stdout + instRes.stderr);
    assert.ok(!fs.existsSync(path.join(target, '.ai/docs/PAIRED-CYCLE.md')), `${tag} should not have PAIRED-CYCLE.md`);

    // Ordinary upgrade from current source
    const plainRes = runPowerShell('setup-ai-protocol.ps1', ['-Target', target], repoRoot);
    assert.equal(plainRes.status, 0, plainRes.stdout + plainRes.stderr);
    assert.ok(fs.existsSync(path.join(target, '.ai/docs/PAIRED-CYCLE.md')), 'ordinary upgrade restores PAIRED-CYCLE.md');
    const plainManifest = JSON.parse(fs.readFileSync(path.join(target, 'protocol-manifest.json'), 'utf8'));
    assert.equal(plainManifest.protocolVersion, '1.9.6');
    const plainVal = validate(target);
    assert.equal(plainVal.status, 1, 'ordinary upgrade leaves older tooling, failing validation');

    // Force upgrade brings full parity
    const forceRes = runPowerShell('setup-ai-protocol.ps1', ['-Target', target, '-Force'], repoRoot);
    assert.equal(forceRes.status, 0, forceRes.stdout + forceRes.stderr);
    const forceVal = validate(target);
    assert.equal(forceVal.status, 0, forceVal.stdout + forceVal.stderr);

    passedTags.add(tag);
    t.diagnostic(`Historical upgrade verified PASS for release tag: ${tag}`);
  });
}

test('historical release tag coverage: all required release tags (v1.9.4, v1.9.5) verified', t => {
  const tagCheck = run('git', ['tag', '-l'], repoRoot);
  const repoTags = (tagCheck.stdout || '').split(/\r?\n/).map(s => s.trim());
  const existingRequiredTags = historicalTags.filter(tag => repoTags.includes(tag));
  if (existingRequiredTags.length === 0) {
    t.skip('No historical release tags found (v1.9.4, v1.9.5). CI checkout must fetch tags via git fetch --tags or fetch-depth: 0.');
    return;
  }
  // Final PASS requires that all required tags actually passed their per-tag tests
  const verifiedTags = historicalTags.filter(tag => passedTags.has(tag));
  assert.deepEqual(verifiedTags.sort(), historicalTags.slice().sort(),
    `Incomplete historical release tag coverage: verified [${verifiedTags.join(', ')}], required [${historicalTags.join(', ')}]. All per-tag tests must pass.`);
  t.diagnostic(`Historical release upgrade suite PASS verified for tags: ${verifiedTags.join(', ')}`);
});

