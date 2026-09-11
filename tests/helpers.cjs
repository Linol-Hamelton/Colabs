'use strict';

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const repoRoot = path.resolve(__dirname, '..');

function run(command, args, cwd = repoRoot, options = {}) {
  return spawnSync(command, args, {
    cwd, encoding: 'utf8', windowsHide: true, timeout: 120000,
    maxBuffer: 16 * 1024 * 1024, ...options,
  });
}

function git(cwd, args) {
  return run('git', ['-c', 'core.autocrlf=false', ...args], cwd);
}

function runPowerShell(script, args = [], cwd = repoRoot) {
  const shell = process.env.PROTOCOL_TEST_POWERSHELL ||
    (process.platform === 'win32' ? 'powershell.exe' : 'pwsh');
  return run(shell, ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File',
    path.resolve(cwd, script), ...args], cwd);
}

function write(root, relative, content) {
  const destination = path.resolve(root, relative);
  const relation = path.relative(root, destination);
  if (relation.startsWith('..') || path.isAbsolute(relation)) {
    throw new Error('Fixture write must stay inside its root');
  }
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.writeFileSync(destination, content);
  return destination;
}

function makeFixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'colabs-test-'));
  t.after(() => {
    // Only this exact, freshly created temporary directory can be removed.
    const parent = fs.realpathSync(os.tmpdir());
    const resolved = fs.realpathSync(root);
    if (path.dirname(resolved) !== parent || !path.basename(resolved).startsWith('colabs-test-')) {
      throw new Error('Refusing cleanup outside the test temporary directory');
    }
    fs.rmSync(resolved, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
  });
  for (const args of [
    ['init', '-b', 'main'],
    ['-c', 'user.name=Protocol Test', '-c', 'user.email=protocol-test@example.invalid',
      'commit', '--allow-empty', '-m', 'Test fixture'],
  ]) {
    const result = git(root, args);
    if (result.status !== 0) throw new Error(result.stderr || String(result.error));
  }
  return root;
}

function seedProtocol(root) {
  const entries = [
    'AGENTS.md', 'CLAUDE.md', '.gitattributes', '.editorconfig', '.gitignore',
    'setup-ai-protocol.ps1', 'validate-protocol.ps1', 'test-protocol.ps1',
    '.claude/settings.json', '.claude/hooks', 'scripts', 'tests', 'templates', 'docs',
  ];
  for (const relative of entries) {
    const source = path.join(repoRoot, relative);
    if (!fs.existsSync(source)) continue;
    const target = path.join(root, relative);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.cpSync(source, target, { recursive: true });
  }
  fs.cpSync(path.join(repoRoot, 'templates', 'ai'), path.join(root, '.ai'), { recursive: true });
  return root;
}

function makeProtocolFixture(t) {
  return seedProtocol(makeFixture(t));
}

function findGitBash() {
  if (process.platform !== 'win32') return 'bash';
  const located = run('where.exe', ['git.exe']);
  const gitPaths = (located.stdout || '').trim().split(/\r?\n/);
  const candidates = gitPaths.flatMap(file => [
    path.resolve(path.dirname(file), '..', 'bin', 'bash.exe'),
    path.resolve(path.dirname(file), '..', 'usr', 'bin', 'bash.exe'),
  ]);
  candidates.push('C:\\Program Files\\Git\\bin\\bash.exe');
  return candidates.find(candidate => fs.existsSync(candidate)) || null;
}

module.exports = {
  repoRoot, run, git, runPowerShell, write, makeFixture,
  seedProtocol, makeProtocolFixture, findGitBash,
};
