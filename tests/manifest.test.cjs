'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { repoRoot, makeProtocolFixture, runPowerShell, write } = require('./helpers.cjs');

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
