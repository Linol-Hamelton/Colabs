'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {
  makeProtocolFixture, makeFixture, seedProtocol, runPowerShell, git, write,
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

test('encoding checks ignore scratch files but include tracked ignored files', t => {
  const root = makeProtocolFixture(t);
  write(root, '.ai/scratch/thirdparty.ps1', '# non-ASCII: é\r\n');
  write(root, '.git/internal.md', Buffer.from([0xc3, 0x28]));
  succeeds(root);
  const add = git(root, ['add', '-f', '.ai/scratch/thirdparty.ps1']);
  assert.equal(add.status, 0, add.stderr);
  fails(root, /non-ASCII byte in PowerShell script: \.ai\/scratch\/thirdparty\.ps1/);
});

test('untracked Unicode and literal wildcard filenames are checked as paths', t => {
  const root = makeProtocolFixture(t);
  const filename = 'документ с пробелами [draft].md';
  write(root, filename, Buffer.from([0xc3, 0x28]));
  fails(root, /invalid UTF-8: документ с пробелами \[draft\]\.md/);
  write(root, filename, 'Корректный UTF-8.\n');
  succeeds(root);
});

test('BOM, malformed UTF-8, CRLF and PowerShell syntax fail independently', async t => {
  const cases = [
    ['UTF-8 BOM', 'notes.md', Buffer.from([0xef, 0xbb, 0xbf, 0x61, 10]), /byte order mark present: notes\.md/],
    ['malformed UTF-8', 'notes.md', Buffer.from([0xc0, 0xaf]), /invalid UTF-8: notes\.md/],
    ['UTF-16', 'notes.md', Buffer.from([0xff, 0xfe, 0x41, 0]), /invalid UTF-8: notes\.md/],
    ['editor config CRLF', '.editorconfig', 'root = true\r\n', /CR\/CRLF found.*\.editorconfig/],
    ['Node file CRLF', 'custom.cjs', 'module.exports = {};\r\n', /CR\/CRLF found.*custom\.cjs/],
    ['YAML CRLF', 'pipeline.yml', 'name: test\r\n', /CR\/CRLF found.*pipeline\.yml/],
    ['PowerShell syntax', 'broken.ps1', 'if (\n', /PowerShell syntax in broken\.ps1/],
  ];
  for (const [name, filename, content, message] of cases) {
    await t.test(name, child => {
      const root = makeProtocolFixture(child);
      write(root, filename, content);
      fails(root, message);
    });
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

test('each decision validates its own status, date and approval field', async t => {
  const cases = [
    ['missing approval', 'Status: Accepted\nDate: 2026-09-11\n', /DEC-0001 requires a non-placeholder Approved by field/],
    ['blank approval', 'Status: Accepted\nDate: 2026-09-11\nApproved by: \n', /non-placeholder Approved by/],
    ['placeholder approval', 'Status: Accepted\nDate: 2026-09-11\nApproved by: _a human name_\n', /non-placeholder Approved by/],
    ['superseded without approval', 'Status: Superseded by DEC-0002\nDate: 2026-09-11\n', /non-placeholder Approved by/],
    ['missing status', 'Date: 2026-09-11\nApproved by: Test Owner\n', /missing or invalid Status/],
    ['invalid status', 'Status: Done\nDate: 2026-09-11\nApproved by: Test Owner\n', /missing or invalid Status/],
    ['missing date', 'Status: Proposed\n', /requires a valid Date/],
    ['impossible date', 'Status: Proposed\nDate: 2026-02-30\n', /requires a valid Date/],
    ['duplicate status', 'Status: Accepted\nStatus: Proposed\nDate: 2026-09-11\nApproved by: Test Owner\n', /duplicate Status fields/],
    ['duplicate approval', 'Status: Accepted\nDate: 2026-09-11\nApproved by: One\nApproved by: Two\n', /duplicate Approved by fields/],
  ];
  for (const [name, fields, message] of cases) {
    await t.test(name, child => {
      const root = makeProtocolFixture(child);
      write(root, '.ai/DECISIONS.md', decision(fields));
      fails(root, message);
    });
  }
});

test('approval in a following block or template cannot approve an earlier block', t => {
  const root = makeProtocolFixture(t);
  write(root, '.ai/DECISIONS.md', decision('Status: Accepted\nDate: 2026-09-11\n') +
    '\n### DEC-0002\nStatus: Accepted\nDate: 2026-09-11\nApproved by: Test Owner\n' +
    '\n## Template\n### DEC-nnnn\nApproved by: Another Owner\n');
  fails(root, /DEC-0001 requires a non-placeholder Approved by field/);
});

test('proposals are allowed and numbered decisions must be unique and complete', t => {
  const root = makeProtocolFixture(t);
  write(root, '.ai/DECISIONS.md', decision('Status: Proposed\nDate: 2026-09-11\n'));
  succeeds(root);
  fs.appendFileSync(path.join(root, '.ai/DECISIONS.md'), '\n### DEC-0001\nStatus: Proposed\nDate: 2026-09-11\n');
  fails(root, /duplicate decision: DEC-0001/);
  write(root, '.ai/DECISIONS.md', '### DEC-0001');
  fails(root, /DEC-0001 has missing or invalid Status/);
});

test('task status must be meaningful and unique', t => {
  const root = makeProtocolFixture(t);
  write(root, '.ai/TASK.md', 'Status: something\n');
  fails(root, /invalid Status/);
  write(root, '.ai/TASK.md', 'Status: In progress\nStatus: Completed\n');
  fails(root, /exactly one Status/);
  write(root, '.ai/TASK.md', 'Status: Completed. Ready for owner.\n');
  succeeds(root);
});

test('malformed settings, wrong commands, missing files and fake imports fail', t => {
  const root = makeProtocolFixture(t);
  const settingsPath = path.join(root, '.claude/settings.json');
  const original = fs.readFileSync(settingsPath, 'utf8');
  write(root, '.claude/settings.json', '{broken\n');
  fails(root, /invalid Claude settings JSON/);
  const settings = JSON.parse(original);
  settings.hooks.Stop[0].hooks[0].command = 'echo .claude/hooks/stop-worklog-check.sh';
  write(root, '.claude/settings.json', JSON.stringify(settings) + '\n');
  fails(root, /Stop must configure exactly one canonical protocol hook command/);
  write(root, '.claude/settings.json', original);
  write(root, 'CLAUDE.md', 'Do not mistake this mention of @AGENTS.md for an import.\n');
  fails(root, /must import @AGENTS\.md on its own line/);
  fs.unlinkSync(path.join(root, '.claude/hooks/protocol-hooks.cjs'));
  fails(root, /missing file: \.claude\/hooks\/protocol-hooks\.cjs/);
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

test('a deleted installer fails validation instead of skipping its self-check', t => {
  const root = makeProtocolFixture(t);
  fs.rmSync(path.join(root, 'setup-ai-protocol.ps1'));
  const output = fails(root, /missing file: setup-ai-protocol\.ps1/);
  assert.match(output, /installer absent/);
});

test('every runtime entrypoint is required, not only the validator', t => {
  for (const entrypoint of ['test-protocol.ps1', 'scripts/protocol-lock.cjs',
    'scripts/protocol-handoff.cjs', 'docs/PROTOCOL.md']) {
    const root = makeProtocolFixture(t);
    fs.rmSync(path.join(root, entrypoint));
    fails(root, new RegExp('missing file: ' + entrypoint));
  }
});

test('globally disabled hooks fail validation in both settings files', t => {
  for (const name of ['.claude/settings.json', '.claude/settings.local.json']) {
    const root = makeProtocolFixture(t);
    const file = path.join(root, name);
    const settings = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : {};
    settings.disableAllHooks = true;
    write(root, name, JSON.stringify(settings, null, 2) + '\n');
    fails(root, /disableAllHooks; protocol enforcement is off/);
  }
});

test('ignore rules cancelled by a later negation fail validation', t => {
  const root = makeProtocolFixture(t);
  const current = fs.readFileSync(path.join(root, '.gitignore'), 'utf8');
  write(root, '.gitignore', `${current}\n!.ai/runtime/\n!.ai/runtime/**\n`);
  fails(root, /Git does not ignore \.ai\/runtime/);
});

test('hooks left enabled and ignore rules intact still validate', t => {
  const root = makeProtocolFixture(t);
  succeeds(root);
});
