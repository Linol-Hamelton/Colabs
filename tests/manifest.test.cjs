'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { repoRoot, makeProtocolFixture, runPowerShell, run, write } = require('./helpers.cjs');

const manifest = JSON.parse(fs.readFileSync(path.join(repoRoot, 'protocol-manifest.json'), 'utf8'));

// Three separate outages came from a manifest and a required-file list that had
// to agree with nothing checking: an entry naming a file that did not exist, a
// required file the installer never shipped, and a tool demanded after install.
test('every managed and integration entry exists in this repository', () => {
  const missing = [...manifest.managed, ...manifest.integration]
    .filter(relative => !fs.existsSync(path.join(repoRoot, relative)));
  assert.deepEqual(missing, []);
});

test('every state entry has a template to create it from', () => {
  const missing = manifest.state
    .filter(relative => !fs.existsSync(path.join(repoRoot, 'templates/ai', relative)));
  assert.deepEqual(missing, []);
});

test('the manifest lists itself, so installs carry it forward', () => {
  assert.ok(manifest.managed.includes('protocol-manifest.json'));
});

test('PAIRED-CYCLE.md is pinned in manifest managed entries', () => {
  assert.ok(manifest.managed.includes('.ai/docs/PAIRED-CYCLE.md'),
    'PAIRED-CYCLE.md must be pinned in manifest.managed');
});

test('an installed project contains every manifest entry', t => {
  const source = repoRoot;
  const target = makeProtocolFixture(t);
  fs.rmSync(path.join(target, '.ai'), { recursive: true, force: true });
  const install = runPowerShell('setup-ai-protocol.ps1', ['-Target', target, '-InitGit'], source);
  assert.equal(install.status, 0, install.stdout + install.stderr);
  const missing = [
    ...manifest.managed,
    ...manifest.integration,
    ...manifest.state.map(relative => path.posix.join('.ai', relative)),
  ].filter(relative => !fs.existsSync(path.join(target, relative)));
  assert.deepEqual(missing, [], `installed project is missing: ${missing.join(', ')}`);
});

test('a manifest entry with no file stops the installer before it writes', t => {
  const source = makeProtocolFixture(t);
  const target = makeProtocolFixture(t);
  const broken = JSON.parse(fs.readFileSync(path.join(source, 'protocol-manifest.json'), 'utf8'));
  broken.managed.push('docs/NOT-A-REAL-FILE.md');
  write(source, 'protocol-manifest.json', JSON.stringify(broken, null, 2) + '\n');
  const install = runPowerShell('setup-ai-protocol.ps1', ['-Target', target], source);
  assert.notEqual(install.status, 0);
  assert.match(install.stdout + install.stderr, /NOT-A-REAL-FILE/);
});

test('validation fails when the manifest is unreadable', t => {
  const root = makeProtocolFixture(t);
  write(root, 'protocol-manifest.json', '{ not json');
  const result = runPowerShell('validate-protocol.ps1', ['-Quiet'], root);
  assert.equal(result.status, 1);
  assert.match(result.stdout + result.stderr, /protocol-manifest\.json is not valid JSON/);
});

test('every protocol test file is listed in the manifest', () => {
  const onDisk = fs.readdirSync(path.join(repoRoot, 'tests'))
    .filter(name => name.endsWith('.cjs')).map(name => `tests/${name}`).sort();
  assert.deepEqual(onDisk, [...manifest.tests].sort());
});

// Installing into somebody else's repository must not turn their own source
// into validation failures. The encoding rules exist to protect this
// protocol's PowerShell scripts, not to police a host project.
test('a host project keeps its own line endings and still validates', t => {
  const root = makeProtocolFixture(t);
  fs.writeFileSync(path.join(root, 'app.js'), 'const a = 1;\r\nconst b = 2;\r\n');
  fs.writeFileSync(path.join(root, 'legacy.md'), '# Host document\r\n');
  const result = runPowerShell('validate-protocol.ps1', ['-Quiet'], root);
  const output = result.stdout + result.stderr;
  assert.equal(result.status, 0, output);
  assert.doesNotMatch(output, /app\.js/);
  assert.doesNotMatch(output, /legacy\.md/);
});

test('protocol files are still held to the encoding rules', t => {
  const root = makeProtocolFixture(t);
  fs.writeFileSync(path.join(root, '.ai/TASK.md'), '# Current Task\r\n\r\nStatus: In progress\r\n');
  const result = runPowerShell('validate-protocol.ps1', ['-Quiet'], root);
  assert.equal(result.status, 1);
  assert.match(result.stdout + result.stderr, /CR\/CRLF found[\s\S]*TASK\.md/);
});

// A product repository gets the runtime and nothing else. Shipping the
// installer, the protocol's own test suite and its templates put fifteen
// files of protocol-development machinery into somebody's product.
test('an installed project receives the runtime but not the source tooling', t => {
  const target = makeProtocolFixture(t);
  fs.rmSync(path.join(target, '.ai'), { recursive: true, force: true });
  for (const relative of [...manifest.source, ...manifest.tests, 'templates',
    '.editorconfig', '.codex/config.toml']) {
    fs.rmSync(path.join(target, relative), { recursive: true, force: true });
  }
  const install = runPowerShell('setup-ai-protocol.ps1', ['-Target', target, '-InitGit'], repoRoot);
  assert.equal(install.status, 0, install.stdout + install.stderr);

  for (const relative of manifest.managed) {
    assert.ok(fs.existsSync(path.join(target, relative)), `missing runtime file: ${relative}`);
  }
  for (const relative of [...manifest.source, ...manifest.tests, 'templates', '.editorconfig', '.codex/config.toml']) {
    assert.ok(!fs.existsSync(path.join(target, relative)), `source-only file was installed: ${relative}`);
  }
});

test('the installed manifest declares its role and drops the source lists', t => {
  const target = makeProtocolFixture(t);
  fs.rmSync(path.join(target, '.ai'), { recursive: true, force: true });
  runPowerShell('setup-ai-protocol.ps1', ['-Target', target, '-InitGit'], repoRoot);
  const installed = JSON.parse(fs.readFileSync(path.join(target, 'protocol-manifest.json'), 'utf8'));
  assert.equal(installed.role, 'installed');
  assert.equal(installed.source, undefined);
  assert.equal(installed.tests, undefined);
  assert.deepEqual(installed.managed, manifest.managed);
});

test('an installed project validates without the installer present', t => {
  const target = makeProtocolFixture(t);
  fs.rmSync(path.join(target, '.ai'), { recursive: true, force: true });
  runPowerShell('setup-ai-protocol.ps1', ['-Target', target, '-InitGit'], repoRoot);
  const result = runPowerShell('validate-protocol.ps1', [], target);
  assert.equal(result.status, 0, result.stdout + result.stderr);
  assert.match(result.stdout, /installed project; the installer lives in the protocol source repository/);
});

// Line endings and editor settings belong to the host project.
test('fresh hygiene files govern protocol paths only', t => {
  const target = makeProtocolFixture(t);
  fs.rmSync(path.join(target, '.ai'), { recursive: true, force: true });
  fs.rmSync(path.join(target, '.gitattributes'), { force: true });
  fs.writeFileSync(path.join(target, 'host.js'), 'const a = 1;\n');
  runPowerShell('setup-ai-protocol.ps1', ['-Target', target, '-InitGit'], repoRoot);
  const attributes = fs.readFileSync(path.join(target, '.gitattributes'), 'utf8');
  assert.doesNotMatch(attributes, /^\* /m, 'a repository-wide rule reached a host project');
  assert.match(attributes, /BEGIN AI COLLABORATION PROTOCOL/);
  assert.match(attributes, /\.ai\/\*\* text eol=lf/);
});

test('a Supersedes pointing at no decision fails validation', t => {
  const root = makeProtocolFixture(t);
  const log = '# Decisions\n\n### DEC-0001\n\nStatus: Accepted\nDate: 2026-09-12\n' +
    'Supersedes: DEC-9999\nApproved by: Test Owner\n';
  write(root, '.ai/DECISIONS.md', log);
  const result = runPowerShell('validate-protocol.ps1', ['-Quiet'], root);
  assert.equal(result.status, 1);
  assert.match(result.stdout + result.stderr, /DEC-0001 supersedes DEC-9999, which does not exist/);
});

// Both candidate pilot repositories keep their own scripts/ and docs/, and one
// of them regenerates docs/ from a workflow. The protocol must not put files
// in a directory the project already uses. See DEC-0017.
test('installing adds nothing to a host project own directories', t => {
  const target = makeProtocolFixture(t);
  fs.rmSync(path.join(target, '.ai'), { recursive: true, force: true });
  for (const relative of [...manifest.source, ...manifest.tests, 'templates',
    'tests', '.editorconfig', '.codex/config.toml', 'docs', 'scripts']) {
    fs.rmSync(path.join(target, relative), { recursive: true, force: true });
  }
  fs.mkdirSync(path.join(target, 'scripts'), { recursive: true });
  fs.mkdirSync(path.join(target, 'docs'), { recursive: true });
  fs.writeFileSync(path.join(target, 'scripts/build.js'), 'build\n');
  fs.writeFileSync(path.join(target, 'docs/index.md'), '# API\n');

  const install = runPowerShell('setup-ai-protocol.ps1', ['-Target', target, '-InitGit'], repoRoot);
  assert.equal(install.status, 0, install.stdout + install.stderr);
  assert.deepEqual(fs.readdirSync(path.join(target, 'scripts')), ['build.js']);
  assert.deepEqual(fs.readdirSync(path.join(target, 'docs')), ['index.md']);

  const roots = fs.readdirSync(target).filter(name => !name.startsWith('.') &&
    !['scripts', 'docs'].includes(name)).sort();
  assert.deepEqual(roots, ['AGENTS.md', 'CLAUDE.md', 'protocol-manifest.json', 'validate-protocol.ps1'],
    `the protocol added unexpected top-level entries: ${roots.join(', ')}`);
});

test('the tools resolve the project root from .ai/bin, including a subdirectory', t => {
  const target = makeProtocolFixture(t);
  fs.rmSync(path.join(target, '.ai'), { recursive: true, force: true });
  runPowerShell('setup-ai-protocol.ps1', ['-Target', target, '-InitGit'], repoRoot);
  fs.mkdirSync(path.join(target, 'deep', 'nested'), { recursive: true });

  for (const cwd of [target, path.join(target, 'deep', 'nested')]) {
    const state = run(process.execPath, [path.join(target, '.ai/bin/protocol-handoff.cjs'), 'state'], cwd);
    assert.equal(state.status, 0, state.stderr);
    assert.ok(JSON.parse(state.stdout).fileCount > 10,
      `root resolved wrongly from ${cwd}: ${state.stdout}`);
    const lock = run(process.execPath, [path.join(target, '.ai/bin/protocol-lock.cjs'), 'status'], cwd);
    assert.equal(lock.status, 0, lock.stderr);
  }
});

// The v1.6 move updated every file that referenced the old paths except the
// three that were moved, because by then they no longer matched the list. The
// SessionStart hook went on telling agents to run a path that an installed
// project does not have. Nothing but a check keeps that from recurring.
test('no shipped file mentions a path the protocol no longer installs', () => {
  const retired = ['scripts/protocol-hooks.cjs', 'scripts/protocol-lock.cjs',
    'scripts/protocol-handoff.cjs', 'docs/PROTOCOL.md', 'docs/CODEX.md'];
  // A retired path is only a real mention when it stands on its own. The
  // replacement `.ai/docs/PROTOCOL.md` contains the old one as a suffix.
  const mentions = (text, stale) => {
    for (let i = text.indexOf(stale); i !== -1; i = text.indexOf(stale, i + 1)) {
      const before = i === 0 ? '' : text[i - 1];
      if (!/[\w./-]/.test(before)) return true;
    }
    return false;
  };
  const offenders = [];
  for (const relative of [...manifest.managed, ...manifest.integration,
    ...manifest.state.map(name => path.posix.join('templates/ai', name))]) {
    const full = path.join(repoRoot, relative);
    if (!fs.existsSync(full)) continue;
    const text = fs.readFileSync(full, 'utf8');
    for (const stale of retired) {
      if (mentions(text, stale)) offenders.push(`${relative} mentions ${stale}`);
    }
  }
  assert.deepEqual(offenders, []);
});
test('the injected context names a tool the installed project actually has', t => {
  const target = makeProtocolFixture(t);
  fs.rmSync(path.join(target, '.ai'), { recursive: true, force: true });
  runPowerShell('setup-ai-protocol.ps1', ['-Target', target, '-InitGit'], repoRoot);
  const started = run(process.execPath,
    [path.join(target, '.claude/hooks/protocol-hooks.cjs'), 'SessionStart'], target,
    { input: JSON.stringify({ session_id: 'context-probe', cwd: target }) });
  assert.equal(started.status, 0, started.stderr);
  const context = JSON.parse(started.stdout).hookSpecificOutput.additionalContext;
  for (const mentioned of context.match(/[\w./-]+\/protocol-[\w-]+\.cjs/g) || []) {
    assert.ok(fs.existsSync(path.join(target, mentioned)),
      `the injected context names ${mentioned}, which is not installed`);
  }
});
