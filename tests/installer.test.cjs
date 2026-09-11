const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { repoRoot, makeFixture, runPowerShell, git, write } = require('./helpers.cjs');

const installer = path.join(repoRoot, 'setup-ai-protocol.ps1');
const states = ['TASK.md', 'PLAN.md', 'DECISIONS.md', 'ARCHIVE.md', 'worklog/README.md'];
function setup(root, ...args) {
  return runPowerShell(installer, ['-Target', root, ...args]);
}
function succeeded(result) {
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
}
function bytes(root, relative) { return fs.readFileSync(path.join(root, relative)); }
function snapshot(root, prefix = '') {
  const result = {};
  for (const entry of fs.readdirSync(path.join(root, prefix), { withFileTypes: true })) {
    if (!prefix && entry.name === '.git') continue;
    const relative = path.posix.join(prefix, entry.name);
    if (entry.isDirectory()) Object.assign(result, snapshot(root, relative));
    else result[relative] = bytes(root, relative).toString('base64');
  }
  return result;
}

test('installer initializes paths with spaces, brackets and Unicode and remains reusable', t => {
  const parent = makeFixture(t);
  const root = path.join(parent, 'project [one] ' + String.fromCodePoint(0x442, 0x435, 0x441, 0x442));
  succeeded(setup(root, '-InitGit'));
  for (const relative of states) assert.ok(fs.existsSync(path.join(root, '.ai', relative)));
  assert.ok(fs.existsSync(path.join(root, 'docs/PROTOCOL.md')));
  assert.ok(fs.existsSync(path.join(root, 'test-protocol.ps1')));
  succeeded(runPowerShell(path.join(root, 'setup-ai-protocol.ps1'), [], root));
  succeeded(setup(root, '-Verify'));
  const before = snapshot(root);
  succeeded(setup(root));
  succeeded(setup(root, '-Force'));
  assert.deepEqual(snapshot(root), before, 'repeat installs must not rewrite or create backups unnecessarily');
});

test('Verify with InitGit never creates an absent target', t => {
  const root = path.join(makeFixture(t), 'does not exist [yet]');
  const result = setup(root, '-Verify', '-InitGit', '-Force');
  assert.notEqual(result.status, 0);
  assert.equal(fs.existsSync(root), false);
});

test('populated state survives Verify, ordinary install and Force byte for byte', t => {
  const root = makeFixture(t);
  succeeded(setup(root));
  const expected = {};
  for (const relative of states) {
    const name = '.ai/' + relative;
    const content = Buffer.from(`# Project memory: ${relative}\n\nPreserve these decisions and work.\n`);
    write(root, name, content);
    expected[name] = content;
  }
  write(root, '.ai/worklog/codex-session-123.md', '# Session history\n');
  const before = snapshot(root);
  succeeded(setup(root, '-Verify'));
  assert.deepEqual(snapshot(root), before, 'verification must be read only');
  succeeded(setup(root));
  succeeded(setup(root, '-Force'));
  for (const [relative, content] of Object.entries(expected)) assert.deepEqual(bytes(root, relative), content);
  assert.equal(bytes(root, '.ai/worklog/codex-session-123.md').toString(), '# Session history\n');
});

test('managed changes require Force and retain a backup without resetting state', t => {
  const root = makeFixture(t);
  succeeded(setup(root));
  const localRules = '# Local project rules\nKeep this original version in backup.\n';
  write(root, 'AGENTS.md', localRules);
  write(root, '.ai/TASK.md', '# Active task with valuable context\n');
  const before = snapshot(root);
  assert.notEqual(setup(root, '-Verify').status, 0);
  assert.deepEqual(snapshot(root), before);
  succeeded(setup(root));
  assert.equal(bytes(root, 'AGENTS.md').toString(), localRules);
  succeeded(setup(root, '-Force'));
  assert.deepEqual(bytes(root, 'AGENTS.md'), bytes(repoRoot, 'AGENTS.md'));
  assert.equal(bytes(root, '.ai/TASK.md').toString(), '# Active task with valuable context\n');
  const backups = fs.readdirSync(path.join(root, '.ai/backups'));
  assert.ok(backups.some(name => fs.existsSync(path.join(root, '.ai/backups', name, 'AGENTS.md')) &&
    bytes(root, `.ai/backups/${name}/AGENTS.md`).toString() === localRules));
  succeeded(setup(root, '-Verify'));
});

test('settings merge preserves permissions and user hooks while updating legacy protocol hooks', t => {
  const root = makeFixture(t);
  const custom = { type: 'command', command: 'echo project-session', timeout: 30 };
  const customStop = { matcher: 'custom', hooks: [{ type: 'command', command: 'echo project-stop' }] };
  const input = {
    permissions: { allow: ['Bash(npm test)'], deny: ['Read(.env)'] },
    env: { PROJECT_SETTING: 'retained' },
    hooks: {
      SessionStart: [{ matcher: 'startup', hooks: [custom, {
        type: 'command', command: '[ -f .claude/hooks/session-start.sh ] && bash .claude/hooks/session-start.sh || true'
      }] }],
      Stop: [customStop],
      PreToolUse: [{ matcher: 'Write', hooks: [{ type: 'command', command: 'echo pre-write' }] }]
    }
  };
  write(root, '.claude/settings.json', JSON.stringify(input, null, 2) + '\n');
  succeeded(setup(root));
  const output = JSON.parse(bytes(root, '.claude/settings.json'));
  assert.deepEqual(output.permissions, input.permissions);
  assert.deepEqual(output.env, input.env);
  assert.deepEqual(output.hooks.PreToolUse, input.hooks.PreToolUse);
  assert.deepEqual(output.hooks.SessionStart[0], { matcher: 'startup', hooks: [custom] });
  assert.deepEqual(output.hooks.Stop[0], customStop);
  const canonical = JSON.parse(bytes(repoRoot, '.claude/settings.json'));
  assert.deepEqual(output.hooks.SessionStart.slice(1), canonical.hooks.SessionStart);
  assert.deepEqual(output.hooks.Stop.slice(1), canonical.hooks.Stop);
  const before = snapshot(root);
  succeeded(setup(root, '-Force'));
  succeeded(setup(root, '-Verify'));
  assert.deepEqual(snapshot(root), before);
});

test('hygiene merge preserves application rules and scopes protocol overrides', t => {
  const root = makeFixture(t);
  const attributes = '*.cs text eol=crlf\n*.dat binary\n';
  const editor = 'root = true\n\n[*]\nindent_style = tab\nindent_size = 8\n';
  write(root, '.gitattributes', attributes);
  write(root, '.editorconfig', editor);
  write(root, '.gitignore', 'build-output/\ncustom-secret.txt\n');
  succeeded(setup(root, '-Force'));
  assert.ok(bytes(root, '.gitattributes').toString().startsWith(attributes));
  assert.ok(bytes(root, '.editorconfig').toString().startsWith(editor));
  assert.ok(bytes(root, '.gitignore').toString().startsWith('build-output/\ncustom-secret.txt\n'));
  const application = git(root, ['check-attr', 'eol', '--', 'application.cs']);
  succeeded(application);
  assert.match(application.stdout, /crlf/);
  const protocol = git(root, ['check-attr', 'eol', '--', 'setup-ai-protocol.ps1']);
  succeeded(protocol);
  assert.match(protocol.stdout, /eol: lf/);
  succeeded(setup(root, '-Verify'));
  const before = snapshot(root);
  succeeded(setup(root, '-Force'));
  assert.deepEqual(snapshot(root), before);
});

test('missing state fails self-check and Verify without recreating it', t => {
  const root = makeFixture(t);
  succeeded(setup(root));
  fs.unlinkSync(path.join(root, '.ai/DECISIONS.md'));
  const before = snapshot(root);
  assert.notEqual(setup(root, '-Verify').status, 0);
  assert.notEqual(runPowerShell(path.join(root, 'setup-ai-protocol.ps1'), [], root).status, 0);
  assert.deepEqual(snapshot(root), before);
  succeeded(setup(root));
  assert.deepEqual(bytes(root, '.ai/DECISIONS.md'), bytes(repoRoot, 'templates/ai/DECISIONS.md'));
});

test('incomplete installer source fails before creating target files', t => {
  const source = makeFixture(t);
  succeeded(setup(source));
  fs.unlinkSync(path.join(source, 'templates/ai/TASK.md'));
  const target = path.join(source, 'uncreated target');
  const result = runPowerShell(path.join(source, 'setup-ai-protocol.ps1'), ['-Target', target, '-InitGit'], source);
  assert.notEqual(result.status, 0);
  assert.match(result.stdout, /Required source file missing/);
  assert.equal(fs.existsSync(target), false);
});

test('invalid settings are preserved and fail before installation', t => {
  const root = makeFixture(t);
  write(root, '.claude/settings.json', '{ invalid json, do not truncate }\n');
  const before = snapshot(root);
  assert.notEqual(setup(root, '-Force').status, 0);
  assert.deepEqual(snapshot(root), before);
});

test('a broken Git directory and nonrepository target fail clearly', t => {
  const parent = makeFixture(t);
  const broken = path.join(parent, 'broken');
  write(broken, '.git', 'gitdir: missing-worktree-directory\n');
  assert.notEqual(setup(broken, '-InitGit').status, 0);
  assert.equal(fs.existsSync(path.join(broken, 'AGENTS.md')), false);
  const absent = path.join(parent, 'no repository');
  assert.notEqual(setup(absent).status, 0);
  assert.equal(fs.existsSync(absent), false);
});
