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
  return run('git', ['-c', 'core.autocrlf=false', '-c', 'user.name=Protocol Test',
    '-c', 'user.email=protocol-test@example.invalid', ...args], cwd);
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

function shouldUseFastValidator(options = {}) {
  if (options.fastValidator === false || options.realValidator === true) return false;
  if (options.fastValidator === true) return true;
  if (process.env.PROTOCOL_TEST_FAST_CHECKS !== '1') return false;
  const currentFile = process.argv[1] ? path.basename(process.argv[1]) : '';
  if (/^(?:validator|installer|upgrade|manifest|review-findings|codex|registry)[.-]/.test(currentFile)) {
    return false;
  }
  return true;
}

// The protocol file set a fixture receives, read from the repository once per process.
// Derived from protocol-manifest.json, not from a list of its own. A fourth
// list that had to agree with the manifest is what broke the first CI run.
let protocolFiles = null;
function protocolFileSet() {
  if (protocolFiles) return protocolFiles;
  const manifest = JSON.parse(fs.readFileSync(path.join(repoRoot, 'protocol-manifest.json'), 'utf8'));
  // A fixture stands in for the protocol source repository, so it needs the
  // source-only tooling too. An installed project gets only `managed`.
  const entries = [...manifest.managed, ...manifest.source, ...manifest.tests,
    ...manifest.integration, '.editorconfig', '.codex/config.toml', 'templates'];
  const files = new Map();
  const collect = (sourceRelative, targetRelative) => {
    const source = path.join(repoRoot, sourceRelative);
    if (!fs.existsSync(source)) return;
    const stat = fs.lstatSync(source);
    if (stat.isSymbolicLink()) throw new Error(`Fixture source is a link: ${sourceRelative}`);
    if (stat.isDirectory()) {
      for (const name of fs.readdirSync(source)) collect(path.join(sourceRelative, name), path.join(targetRelative, name));
      return;
    }
    // A later entry replaces an earlier one at the same target, as the copy order did.
    files.set(targetRelative, { bytes: fs.readFileSync(source), mode: stat.mode & 0o777 });
  };
  for (const relative of entries) collect(relative, relative);
  collect(path.join('templates', 'ai'), '.ai');
  protocolFiles = files;
  return files;
}

function seedProtocol(root, options = {}) {
  // Written, not copied: on Windows the first read of a file created by the copy API costs about
  // 13 ms in on-access scanning, 1.2 s per fixture; written bytes cost 0.1 s (measured,
  // docs/reviews/2026-09-27-claude-powershell-refactor-assessment.md section H).
  for (const [relative, { bytes, mode }] of protocolFileSet()) {
    const target = path.join(root, relative);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, bytes, { mode });
  }
  if (shouldUseFastValidator(options)) {
    const stubValidator = 'Write-Output "AI Collaboration Protocol - validation"\nWrite-Output "Protocol OK. 0 warning(s)."\nexit 0\n';
    fs.writeFileSync(path.join(root, 'validate-protocol.ps1'), stubValidator, 'ascii');
  }
  return root;
}

function makeProtocolFixture(t, options = {}) {
  return seedProtocol(makeFixture(t), options);
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
