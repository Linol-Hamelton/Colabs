'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { repoRoot, makeFixture, makeProtocolFixture, run, git, runPowerShell, write } = require('./helpers.cjs');
const hooks = require('../.claude/hooks/protocol-hooks.cjs');
const handoff = require('../.ai/bin/protocol-handoff.cjs');

// Source fixtures use --quick unless their suite is replaced by a small test
// runner. Installed fixtures must exercise the default handoff without --quick.
function cli(root, args) {
  return run(process.execPath, [path.join(root, '.ai/bin/protocol-handoff.cjs'), ...args], root);
}

function checkedGit(root, args) {
  const result = git(root, ['-c', 'user.name=Protocol Test',
    '-c', 'user.email=protocol-test@example.invalid', ...args]);
  assert.equal(result.status, 0, result.stdout + result.stderr);
  return result.stdout;
}

function entry(title = 'work', open = 'nothing outstanding') {
  return `## 2026-09-12 - ${title}\n\nAgent: tester\n\nAction: did a thing\n\n` +
    `Result: the thing exists\n\nNext step: hand off\n\nOpen:\n${open}\n`;
}

test('an empty final field before a separator is not a complete entry', () => {
  const withSeparator = `# W\n\n${entry('t', '')}\n---\n`;
  assert.equal(hooks.latestCompleteEntry(withSeparator), null);
  const filled = `# W\n\n${entry('t', 'a real open point')}\n---\n`;
  assert.notEqual(hooks.latestCompleteEntry(filled), null);
});

test('evidence is parsed as its own field and never absorbed into Open', t => {
  const root = makeProtocolFixture(t);
  const journal = '.ai/worklog/session-a.md';
  write(root, journal, `# W\n\n${entry()}\n`);
  const full = path.join(root, journal);
  handoff.attach(full, 'Evidence:\n- anchor: none\n- digest: sha256:' + 'a'.repeat(64));
  const parsed = hooks.latestCompleteEntry(fs.readFileSync(full, 'utf8'));
  assert.notEqual(parsed, null);
  assert.equal(hooks.entryField(parsed, 'Open'), 'nothing outstanding');
  assert.match(hooks.entryField(parsed, 'Evidence'), /digest: sha256:a{64}/);
});

test('recording evidence twice replaces the block instead of stacking it', t => {
  const root = makeProtocolFixture(t);
  const journal = '.ai/worklog/session-b.md';
  write(root, journal, `# W\n\n${entry()}\n`);
  const full = path.join(root, journal);
  handoff.attach(full, 'Evidence:\n- digest: sha256:' + 'b'.repeat(64));
  handoff.attach(full, 'Evidence:\n- digest: sha256:' + 'c'.repeat(64));
  const text = fs.readFileSync(full, 'utf8');
  assert.equal(text.match(/^Evidence:/gm).length, 1);
  assert.match(handoff.readEvidence(full).digest, /c{64}/);
});

test('the anchor changes when a tracked file changes', t => {
  const root = makeProtocolFixture(t);
  const before = handoff.anchor(root);
  write(root, 'AGENTS.md', fs.readFileSync(path.join(root, 'AGENTS.md'), 'utf8') + '\nedited\n');
  const after = handoff.anchor(root);
  assert.notEqual(before.digest, after.digest);
  assert.match(after.digest, /^sha256:[a-f0-9]{64}$/);
});

test('verify rejects a missing block, stale evidence and a recorded failure', t => {
  const root = makeProtocolFixture(t);
  const journal = '.ai/worklog/session-c.md';
  write(root, journal, `# W\n\n${entry()}\n`);
  const full = path.join(root, journal);

  const missing = cli(root, ['verify', '--journal', journal]);
  assert.notEqual(missing.status, 0);
  assert.match(missing.stderr, /no Evidence block/);

  handoff.attach(full, `Evidence:\n- digest: sha256:${'d'.repeat(64)}\n- digest format: ${hooks.SNAPSHOT_FORMAT}\n- entry: ${handoff.entryHash(full)}\n- validate-protocol.ps1: exit 0 in 1s`);
  const stale = cli(root, ['verify', '--journal', journal, '--allow-legacy']);
  assert.notEqual(stale.status, 0);
  assert.match(stale.stderr, /stale/);

  const real = handoff.anchor(root);
  handoff.attach(full, `Evidence:\n- digest: ${real.digest}\n- digest format: ${hooks.SNAPSHOT_FORMAT}\n- entry: ${handoff.entryHash(full)}\n- validate-protocol.ps1: exit 0 in 1s`);
  const good = cli(root, ['verify', '--journal', journal, '--allow-legacy']);
  assert.equal(good.status, 0, good.stderr);

  handoff.attach(full, `Evidence:\n- digest: ${handoff.anchor(root).digest}\n- digest format: ${hooks.SNAPSHOT_FORMAT}\n- entry: ${handoff.entryHash(full)}\n- test-protocol.ps1: exit 1 in 9s`);
  const failing = cli(root, ['verify', '--journal', journal, '--allow-legacy']);
  assert.notEqual(failing.status, 0);
  assert.match(failing.stderr, /failing check/);
});

test('evidence cannot be attached to a journal with no dated entry', t => {
  const root = makeProtocolFixture(t);
  const journal = '.ai/worklog/session-d.md';
  write(root, journal, '# W\n\nno entries yet\n');
  assert.throws(() => handoff.attach(path.join(root, journal), 'Evidence:\n- x'), /No dated entry/);
});

// Picking the newest journal by modification time was wrong: a checkout or a
// merge rewrites every file and scrambles the order, so verify reported a
// stale result for a tree that did have matching evidence elsewhere.
test('verify without a target asks whether any journal matches the tree', t => {
  const root = makeProtocolFixture(t);
  write(root, '.ai/worklog/old-session.md', `# W\n\n${entry('older')}\n`);
  write(root, '.ai/worklog/new-session.md', `# W\n\n${entry('newer')}\n`);
  const old = path.join(root, '.ai/worklog/old-session.md');
  const fresh = path.join(root, '.ai/worklog/new-session.md');

  handoff.attach(old, `Evidence:\n- digest: sha256:${'e'.repeat(64)}\n- validate-protocol.ps1: exit 0 in 1s`);
  assert.equal(cli(root, ['record', '--owner', 'new-session', '--quick']).status, 0);

  // Make the stale journal the most recently touched one.
  const later = new Date(Date.now() + 60000);
  fs.utimesSync(old, later, later);

  const result = cli(root, ['verify']);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /new-session\.md: evidence matches/);
});

test('verify reports every journal when none matches the tree', t => {
  const root = makeProtocolFixture(t);
  write(root, '.ai/worklog/one.md', `# W\n\n${entry('one')}\n`);
  write(root, '.ai/worklog/two.md', `# W\n\n${entry('two')}\n`);
  handoff.attach(path.join(root, '.ai/worklog/one.md'), `Evidence:\n- digest: sha256:${'1'.repeat(64)}`);
  handoff.attach(path.join(root, '.ai/worklog/two.md'), `Evidence:\n- digest: sha256:${'2'.repeat(64)}`);
  const result = cli(root, ['verify']);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /one\.md/);
  assert.match(result.stderr, /two\.md/);
});

test('a clean installed project records and verifies a default handoff without source tooling', t => {
  const root = makeFixture(t);
  const install = runPowerShell('setup-ai-protocol.ps1', ['-Target', root]);
  assert.equal(install.status, 0, install.stdout + install.stderr);
  assert.equal(fs.existsSync(path.join(root, 'test-protocol.ps1')), false);
  const journal = '.ai/worklog/installed-session.md';
  write(root, journal, `# W\n\n${entry('installed handoff')}\n`);

  const recorded = cli(root, ['record', '--owner', 'installed-session']);
  assert.equal(recorded.status, 0, recorded.stdout + recorded.stderr);
  assert.match(recorded.stdout, /validate-protocol\.ps1: exit 0/);
  assert.doesNotMatch(recorded.stdout, /test-protocol\.ps1/);
  const evidence = handoff.readEvidence(path.join(root, journal));
  assert.match(evidence.body, /scope: protocol checks only; host-project tests run separately/);
  assert.match(evidence.body, /validate-protocol\.ps1: exit 0/);
  assert.doesNotMatch(evidence.body, /test-protocol\.ps1/);
  const verified = cli(root, ['verify', '--owner', 'installed-session']);
  assert.equal(verified.status, 0, verified.stdout + verified.stderr);
  assert.match(verified.stdout, /evidence matches the current tree/);
});

test('source handoff still runs the required suite and records its real failure', t => {
  const root = makeProtocolFixture(t);
  write(root, 'test-protocol.ps1', 'exit 7\n');
  const journal = '.ai/worklog/source-session.md';
  write(root, journal, `# W\n\n${entry('source handoff')}\n`);
  const result = cli(root, ['record', '--owner', 'source-session']);
  assert.equal(result.status, 1, result.stdout + result.stderr);
  const evidence = handoff.readEvidence(path.join(root, journal));
  assert.match(evidence.body, /validate-protocol\.ps1: exit 0/);
  assert.match(evidence.body, /test-protocol\.ps1: exit 7/);
  assert.equal(cli(root, ['verify', '--owner', 'source-session']).status, 1);
});

test('a missing source suite is a failed handoff, including legacy manifests without a role', t => {
  const root = makeProtocolFixture(t);
  fs.unlinkSync(path.join(root, 'test-protocol.ps1'));
  const journal = '.ai/worklog/missing-suite.md';
  write(root, journal, `# W\n\n${entry('missing suite')}\n`);
  for (const legacy of [false, true]) {
    if (legacy) {
      const manifest = JSON.parse(fs.readFileSync(path.join(root, 'protocol-manifest.json'), 'utf8'));
      delete manifest.role;
      write(root, 'protocol-manifest.json', JSON.stringify(manifest) + '\n');
    }
    const result = cli(root, ['record', '--owner', 'missing-suite']);
    assert.equal(result.status, 1, result.stdout + result.stderr);
    const evidence = handoff.readEvidence(path.join(root, journal));
    assert.match(evidence.body, /test-protocol\.ps1: exit (?!0\b)/);
  }
});

test('missing or invalid manifests cannot produce handoff evidence', t => {
  const root = makeProtocolFixture(t);
  const journal = '.ai/worklog/invalid-manifest.md';
  write(root, journal, `# W\n\n${entry('invalid manifest')}\n`);
  for (const content of [null, '{ broken', 'null', '[]', '{"role":"unknown"}', '{"role":null}']) {
    if (content === null) fs.unlinkSync(path.join(root, 'protocol-manifest.json'));
    else write(root, 'protocol-manifest.json', content + '\n');
    const result = cli(root, ['record', '--owner', 'invalid-manifest', '--quick']);
    assert.equal(result.status, 1, result.stdout + result.stderr);
    assert.match(result.stderr, /[Pp]rotocol manifest/);
    assert.equal(handoff.readEvidence(path.join(root, journal)), null);
  }
});

test('an explicit missing owner never falls back to another session journal', t => {
  const root = makeProtocolFixture(t);
  const other = write(root, '.ai/worklog/other-session.md', `# W\n\n${entry('other session')}\n`);
  const before = fs.readFileSync(other);
  for (const command of ['record', 'verify']) {
    const result = cli(root, [command, '--owner', 'missing-session', '--quick']);
    assert.equal(result.status, 1, result.stdout + result.stderr);
    assert.match(result.stderr, /No session journal for owner missing-session/);
    assert.deepEqual(fs.readFileSync(other), before);
  }
});

// Re-hashing every tracked file cost about six seconds per hook on a
// fifty-thousand-file repository, and Stop fires after every response. Git
// already identifies clean files by their blob hash. See DEC-0015.
test('clean tracked files are identified by the Git index, not read from disk', t => {
  const root = makeProtocolFixture(t);
  run('git', ['-c', 'user.name=T', '-c', 'user.email=t@e', 'add', '-A'], root);
  run('git', ['-c', 'user.name=T', '-c', 'user.email=t@e', 'commit', '-m', 'baseline'], root);
  // Count the reads rather than inspect the identity: both states produce the
  // same Git blob hash by design, so only the absence of reads proves it.
  const original = fs.readFileSync;
  let reads = 0;
  fs.readFileSync = (...args) => { reads += 1; return original(...args); };
  let taken;
  try { taken = hooks.snapshot(root); } finally { fs.readFileSync = original; }
  assert.ok(Object.keys(taken).length > 5);
  assert.equal(reads, 0, `a committed, unmodified tree was read ${reads} time(s)`);
});
test('a modified file is read even though it is tracked', t => {
  const root = makeProtocolFixture(t);
  run('git', ['-c', 'user.name=T', '-c', 'user.email=t@e', 'add', '-A'], root);
  run('git', ['-c', 'user.name=T', '-c', 'user.email=t@e', 'commit', '-m', 'baseline'], root);
  const before = hooks.snapshot(root);
  fs.appendFileSync(path.join(root, 'AGENTS.md'), '\nedited\n');
  const after = hooks.snapshot(root);
  assert.deepEqual(hooks.changedFiles(before, after), ['AGENTS.md']);
  assert.ok(!after['AGENTS.md'].endsWith('|indexed'), 'a dirty file must be hashed');
});

test('deletions and new files are still detected', t => {
  const root = makeProtocolFixture(t);
  run('git', ['-c', 'user.name=T', '-c', 'user.email=t@e', 'add', '-A'], root);
  run('git', ['-c', 'user.name=T', '-c', 'user.email=t@e', 'commit', '-m', 'baseline'], root);
  const before = hooks.snapshot(root);
  fs.writeFileSync(path.join(root, 'appeared.txt'), 'new\n');
  fs.unlinkSync(path.join(root, 'CLAUDE.md'));
  const after = hooks.snapshot(root);
  assert.deepEqual(hooks.changedFiles(before, after).sort(), ['CLAUDE.md', 'appeared.txt']);
});

test('evidence from an older digest format is named, not called stale', t => {
  const root = makeProtocolFixture(t);
  const journal = '.ai/worklog/older-format.md';
  write(root, journal, `# W\n\n${entry()}\n`);
  const full = path.join(root, journal);
  const current = handoff.anchor(root);
  // Format 1 evidence: the digest line without a format line.
  handoff.attach(full, `Evidence:\n- digest: ${current.digest}\n- validate-protocol.ps1: exit 0 in 1s`);
  const result = cli(root, ['verify', '--journal', journal]);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /digest format 1/);
  assert.doesNotMatch(result.stderr, /stale/);
});

// Evidence must survive the commit that follows it, or a receipt is useless the
// moment the work is saved. A file's identity is therefore the Git blob hash in
// both states, never a different function for tracked and untracked. DEC-0016.
test('a file keeps one identity untracked, staged and committed', t => {
  const root = makeProtocolFixture(t);
  fs.writeFileSync(path.join(root, 'appeared.txt'), 'content under test\n');
  const untracked = handoff.anchor(root).digest;
  run('git', ['-c', 'user.name=T', '-c', 'user.email=t@e', 'add', '-A'], root);
  const staged = handoff.anchor(root).digest;
  run('git', ['-c', 'user.name=T', '-c', 'user.email=t@e', 'commit', '-m', 'save'], root);
  const committed = handoff.anchor(root).digest;
  assert.equal(staged, untracked, 'git add must not move the digest');
  assert.equal(committed, staged, 'git commit must not move the digest');
});

test('recorded evidence still verifies after the work is committed', t => {
  const root = makeProtocolFixture(t);
  const journal = '.ai/worklog/committing.md';
  write(root, journal, `# W\n\n${entry()}\n`);
  assert.equal(cli(root, ['record', '--owner', 'committing', '--quick']).status, 0);
  assert.equal(cli(root, ['verify', '--journal', journal]).status, 0);
  run('git', ['-c', 'user.name=T', '-c', 'user.email=t@e', 'add', '-A'], root);
  run('git', ['-c', 'user.name=T', '-c', 'user.email=t@e', 'commit', '-m', 'save'], root);
  const after = cli(root, ['verify', '--journal', journal]);
  assert.equal(after.status, 0, after.stderr);
});

test('CRLF host evidence survives staging and commit while a real edit still invalidates it', t => {
  const root = makeFixture(t);
  write(root, '.gitattributes', '*.txt text eol=crlf\n');
  const install = runPowerShell('setup-ai-protocol.ps1', ['-Target', root]);
  assert.equal(install.status, 0, install.stdout + install.stderr);
  checkedGit(root, ['add', '.']);
  checkedGit(root, ['commit', '-m', 'Installed project baseline']);
  const relative = "host source/a 'quote' $(literal) \u0442\u0435\u0441\u0442.txt";
  const content = Buffer.from('first\r\nsecond\r\n');
  const filename = write(root, relative, content);
  const journal = '.ai/worklog/crlf-session.md';
  write(root, journal, `# W\n\n${entry('CRLF host handoff')}\n`);

  const recorded = cli(root, ['record', '--owner', 'crlf-session']);
  assert.equal(recorded.status, 0, recorded.stdout + recorded.stderr);
  const before = handoff.anchor(root).digest;
  checkedGit(root, ['add', '--', relative]);
  assert.equal(handoff.anchor(root).digest, before, 'staging must preserve the evidence digest');
  checkedGit(root, ['commit', '-m', 'Commit CRLF content without changing working bytes']);
  assert.deepEqual(fs.readFileSync(filename), content);
  assert.equal(handoff.anchor(root).digest, before, 'committing must preserve the evidence digest');
  const verified = cli(root, ['verify', '--owner', 'crlf-session']);
  assert.equal(verified.status, 0, verified.stdout + verified.stderr);

  fs.appendFileSync(filename, 'a real edit\r\n');
  assert.notEqual(handoff.anchor(root).digest, before);
  const changed = cli(root, ['verify', '--owner', 'crlf-session']);
  assert.equal(changed.status, 1, changed.stdout + changed.stderr);
  assert.match(changed.stderr, /evidence is stale/);
});

test('core.filemode=false keeps an executable index mode when only content changes', t => {
  const root = makeFixture(t);
  checkedGit(root, ['config', 'core.filemode', 'false']);
  const filename = write(root, 'run.sh', 'echo initial\n');
  checkedGit(root, ['add', 'run.sh']);
  checkedGit(root, ['update-index', '--chmod=+x', 'run.sh']);
  checkedGit(root, ['commit', '-m', 'Executable index entry']);
  const initial = hooks.snapshot(root)['run.sh'];
  assert.match(initial, /^100755:/);

  const content = Buffer.from('echo changed\n');
  fs.writeFileSync(filename, content);
  const dirty = hooks.snapshot(root)['run.sh'];
  assert.match(dirty, /^100755:/, 'the filesystem mode must not override core.filemode=false');
  assert.notEqual(dirty, initial, 'the content change must remain visible');
  const before = handoff.anchor(root).digest;
  checkedGit(root, ['add', 'run.sh']);
  assert.equal(handoff.anchor(root).digest, before);
  checkedGit(root, ['commit', '-m', 'Content-only update']);
  assert.deepEqual(fs.readFileSync(filename), content);
  assert.equal(hooks.snapshot(root)['run.sh'], dirty);
  assert.equal(handoff.anchor(root).digest, before);
});

test('dirty hashing handles argument edge cases and files beyond the first batch', t => {
  const root = makeFixture(t);
  const names = ['-leading.txt', "a 'quote' $(literal) \u0442\u0435\u0441\u0442.txt"];
  if (process.platform !== 'win32') names.push('a\nnewline.txt', 'a"double-quote.txt', 'a\\backslash.txt');
  for (let i = 0; i < 130; i += 1) names.push(`many files/${String(i).padStart(3, '0')}.txt`);
  for (const [i, name] of names.entries()) write(root, name, `content ${i}\n`);
  const before = hooks.snapshot(root);
  assert.equal(Object.keys(before).length, names.length);
  checkedGit(root, ['add', '.']);
  checkedGit(root, ['commit', '-m', 'Preserve every filename and batch']);
  assert.deepEqual(hooks.snapshot(root), before);
  const last = names[names.length - 1];
  write(root, last, 'a changed final file\n');
  assert.deepEqual(hooks.changedFiles(before, hooks.snapshot(root)), [last]);
});

test('record rejects journals containing unredacted secret patterns', t => {
  const root = makeProtocolFixture(t);
  const journal = '.ai/worklog/leaky-session.md';
  write(root, journal, `# W\n\n${entry('leak', 'SESSION_SECRET = "very-secret-token-123456"')}\n`);
  const result = cli(root, ['record', '--owner', 'leaky-session', '--quick']);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Unredacted secret pattern detected/);
});

test('record executes manifest testCommand and stamps host test scope in evidence', t => {
  const source = repoRoot;
  const target = makeProtocolFixture(t);
  fs.rmSync(path.join(target, '.ai'), { recursive: true, force: true });
  runPowerShell('setup-ai-protocol.ps1', ['-Target', target, '-InitGit'], source);

  const manifestPath = path.join(target, 'protocol-manifest.json');
  const manifestData = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  manifestData.testCommand = 'node -e "process.exit(0)"';
  fs.writeFileSync(manifestPath, JSON.stringify(manifestData, null, 2) + '\n');

  const journal = '.ai/worklog/product-session.md';
  write(target, journal, `# W\n\n${entry('product-test', 'none')}\n`);

  const result = cli(target, ['record', '--owner', 'product-session']);
  assert.equal(result.status, 0, result.stderr);
  const text = fs.readFileSync(path.join(target, journal), 'utf8');
  assert.match(text, /scope: protocol checks and host-project tests/);
  assert.match(text, /node -e "process\.exit\(0\)": exit 0/);
});

test('rehash command updates entry hash after secret redaction with sanitized marker', t => {
  const root = makeProtocolFixture(t);
  const journal = '.ai/worklog/redact-session.md';
  write(root, journal, `# W\n\n${entry('initial work', 'initial details')}\n`);
  const recorded = cli(root, ['record', '--owner', 'redact-session', '--quick']);
  assert.equal(recorded.status, 0, recorded.stderr);

  const verifiedInitial = cli(root, ['verify', '--owner', 'redact-session']);
  assert.equal(verifiedInitial.status, 0, verifiedInitial.stderr);

  // Redact a simulated leaked token in the entry
  const textBefore = fs.readFileSync(path.join(root, journal), 'utf8');
  const redactedText = textBefore.replace('initial details', '[REDACTED_SECRET]');
  fs.writeFileSync(path.join(root, journal), redactedText);

  // Verify should now fail because the entry was changed
  const verifiedAfterChange = cli(root, ['verify', '--owner', 'redact-session']);
  assert.notEqual(verifiedAfterChange.status, 0);
  assert.match(verifiedAfterChange.stderr, /entry was changed after it was certified/);

  // Run rehash with reason
  const rehashed = cli(root, ['rehash', '--owner', 'redact-session', '--reason', 'redacted sensitive credential']);
  assert.equal(rehashed.status, 0, rehashed.stderr);
  assert.match(rehashed.stdout, /entry hash updated/);

  // Content should contain sanitized marker
  const textAfter = fs.readFileSync(path.join(root, journal), 'utf8');
  assert.match(textAfter, /sanitized: .* reason: redacted sensitive credential/);

  // Verify should now succeed
  const verifiedAfterRehash = cli(root, ['verify', '--owner', 'redact-session']);
  assert.equal(verifiedAfterRehash.status, 0, verifiedAfterRehash.stderr);
  assert.match(verifiedAfterRehash.stdout, /evidence matches the current tree/);
});

test('P-3: legacy newest entry fails verify without --allow-legacy and passes with --allow-legacy', t => {
  const root = makeProtocolFixture(t);
  const journal = '.ai/worklog/legacy-p3.md';
  const full = path.join(root, journal);
  write(root, journal, `# W\n\n${entry('legacy turn')}\n`);

  const current = handoff.anchor(root);
  // Attach format-1 legacy evidence (without entry hash format: 2)
  handoff.attach(full, `Evidence:\n- digest: ${current.digest}\n- digest format: ${hooks.SNAPSHOT_FORMAT}\n- entry: ${handoff.entryHash(full)}\n- validate-protocol.ps1: exit 0 in 1s`);

  // Without --allow-legacy: must fail with non-zero and explanatory message
  const refused = cli(root, ['verify', '--owner', 'legacy-p3']);
  assert.notEqual(refused.status, 0);
  assert.match(refused.stderr, /evidence is not authenticated \(legacy format\); re-record to refresh/);

  // With --allow-legacy: prints warning on stderr and exits 0
  const allowed = cli(root, ['verify', '--owner', 'legacy-p3', '--allow-legacy']);
  assert.equal(allowed.status, 0);
  assert.match(allowed.stderr, /evidence is not authenticated \(legacy format\); re-record to refresh/);
  assert.match(allowed.stdout, /evidence matches the current tree/);

  // Fresh format-2 entry: passes without --allow-legacy
  const journal2 = '.ai/worklog/format2-fresh.md';
  write(root, journal2, `# W\n\n${entry('format 2 turn')}\n`);
  const recorded = cli(root, ['record', '--owner', 'format2-fresh', '--quick']);
  assert.equal(recorded.status, 0);
  const verified2 = cli(root, ['verify', '--owner', 'format2-fresh']);
  assert.equal(verified2.status, 0);
  assert.match(verified2.stdout, /evidence matches the current tree/);
});

test('P-3: no-owner verify excludes legacy receipts from matching handoffs', t => {
  const root = makeProtocolFixture(t);
  const journal = '.ai/worklog/only-legacy.md';
  const full = path.join(root, journal);
  write(root, journal, `# W\n\n${entry('only legacy')}\n`);

  const current = handoff.anchor(root);
  handoff.attach(full, `Evidence:\n- digest: ${current.digest}\n- digest format: ${hooks.SNAPSHOT_FORMAT}\n- entry: ${handoff.entryHash(full)}\n- validate-protocol.ps1: exit 0 in 1s`);

  const result = cli(root, ['verify']);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /no evidence matches the current tree/);
  assert.match(result.stderr, /only-legacy\.md: evidence is not authenticated \(legacy format\)/);
});

test('P-3: doctor reports legacy unauthenticated count as warning in source role and exits 0', t => {
  const root = makeProtocolFixture(t);
  const journal = '.ai/worklog/doc-legacy.md';
  const full = path.join(root, journal);
  write(root, journal, `# W\n\n${entry('doc legacy')}\n`);
  const current = handoff.anchor(root);
  handoff.attach(full, `Evidence:\n- digest: ${current.digest}\n- digest format: ${hooks.SNAPSHOT_FORMAT}\n- entry: ${handoff.entryHash(full)}\n- validate-protocol.ps1: exit 0 in 1s`);

  const res = run(process.execPath, [path.join(root, '.ai/bin/protocol.cjs'), 'doctor'], root);
  assert.equal(res.status, 0);
  assert.match(res.stdout, /\[WARN\] Legacy unauthenticated Evidence receipts: 1 journal\(s\)/);
  assert.match(res.stdout, /Verdict: Protocol Healthy\. All checks passed\./);
});

test('P-4: field order with parent-entry before entry parses correctly and does not confuse entry capture', () => {
  const entryText = `## 2026-09-18 - Field order turn

Agent: tester

Action: Testing field order resilience.

Result: Pass.

Next step: Verify.

Open: None.

Evidence:
- anchor: none
- digest: sha256:0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef
- digest format: 4
- entry hash format: 2
- parent-entry: sha256:1111111111111111111111111111111111111111111111111111111111111111
- entry: sha256:2222222222222222222222222222222222222222222222222222222222222222 of this entry without this block
`;

  // parseEvidenceBlock: parentEntry and entry must be distinct and correct
  const parsed = handoff.parseEvidenceBlock(entryText);
  assert.equal(parsed.authenticated, true);
  assert.equal(parsed.parentEntry, 'sha256:1111111111111111111111111111111111111111111111111111111111111111');
  assert.equal(parsed.entry, 'sha256:2222222222222222222222222222222222222222222222222222222222222222');

  // canonicalEntryBody removes - entry: and keeps - parent-entry:
  const clean = hooks.canonicalEntryBody(entryText);
  assert.doesNotMatch(clean, /^[ \t]*- entry:/m);
  assert.match(clean, /^[ \t]*- parent-entry: sha256:1111/m);

  // Unanchored capture resistance: a line like "- sub-entry: sha256:333..." or "parent-entry:" cannot be matched as entry
  const withFakeEntry = `Evidence:
- anchor: none
- digest: sha256:0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef
- digest format: 4
- sub-entry: sha256:3333333333333333333333333333333333333333333333333333333333333333
- parent-entry: root
`;
  const parsedFake = handoff.parseEvidenceBlock(withFakeEntry);
  assert.equal(parsedFake.entry, null);
  assert.equal(parsedFake.parentEntry, 'root');
});

test('P-4: findParentEntry resolves older section when parent-entry precedes entry', t => {
  const root = makeProtocolFixture(t);
  const journal = '.ai/worklog/reversed-fields.md';
  const full = path.join(root, journal);

  // Create an older section with parent-entry BEFORE entry
  const olderBody = `## 2026-09-17 - Older reversed\n\nAgent: tester\n\nAction: Did older.\n\nResult: Pass.\n\nNext step: Next.\n\nOpen: None.\n\nEvidence:\n- anchor: none\n- digest: sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\n- digest format: 4\n- entry hash format: 2\n- parent-entry: root\n`;
  const olderEntryDigest = 'sha256:' + require('node:crypto').createHash('sha256').update(hooks.canonicalEntryBody(olderBody + '- entry: provisional of this entry without this block\n'), 'utf8').digest('hex');
  const olderSection = olderBody + `- entry: ${olderEntryDigest} of this entry without this block\n`;

  const newerSection = `## 2026-09-18 - Newer turn\n\nAgent: tester\n\nAction: Working on new.\n\nResult: Pass.\n\nNext step: None.\n\nOpen: None.\n`;

  write(root, journal, `# W\n\n${newerSection}\n---\n\n${olderSection}\n`);

  // findParentEntry should find olderSection's entry hash and NOT 'tampered' or 'root'
  const resolvedParent = handoff.findParentEntry(full);
  assert.equal(resolvedParent, olderEntryDigest);
});

test('Fact 11: journal at limit-minus-10 lines auto-archives older entries during record to keep total lines <= 150', t => {
  const root = makeProtocolFixture(t, { fastValidator: true });
  const owner = 'test-near-cap';
  const journal = `.ai/worklog/${owner}.md`;
  const full = path.join(root, journal);

  // Write entry 1 and record it
  const filler1 = Array.from({ length: 45 }, (_, i) => `note line ${i + 1}`).join('\n');
  const entry1 = `## 2026-09-18 - Older turn\n\nAgent: tester\n\nAction:\n${filler1}\n\nResult: Pass.\n\nNext step: Next.\n\nOpen: None.\n`;
  write(root, journal, `# Worklog: ${owner}\n\n${entry1}\n`);
  const rec1 = cli(root, ['record', '--owner', owner, '--quick']);
  assert.equal(rec1.status, 0, rec1.stderr);

  // Read recorded journal with evidence 1
  const textAfterRec1 = fs.readFileSync(full, 'utf8');
  const archiveMod = require('../.ai/bin/protocol-archive.cjs');
  const lines1 = archiveMod.getLineCount(textAfterRec1);

  // We want total journal lines to be ~140 (limit-minus-10) before record 2
  const neededFillerLines = 140 - lines1 - 14;
  const filler2 = Array.from({ length: Math.max(neededFillerLines, 10) }, (_, i) => `action step ${i + 1}`).join('\n');
  const entry2 = `## 2026-09-19 - Newest turn\n\nAgent: tester\n\nAction:\n${filler2}\n\nResult: Pass.\n\nNext step: Next.\n\nOpen: None.\n`;

  const updatedJournal = textAfterRec1.replace(/^(# Worklog: [^\n]+\n\n)/, `$1${entry2}\n---\n\n`);
  fs.writeFileSync(full, updatedJournal);

  const countBefore = archiveMod.getLineCount(fs.readFileSync(full, 'utf8'));
  assert.ok(countBefore >= 135 && countBefore <= 145, `Expected countBefore near 140, got ${countBefore}`);

  // Running record without the fix would push 140 + ~14 = 154 lines > 150
  // With the fix, it must auto-archive entry 1 and keep entry 2 with fresh evidence <= 150 lines
  const rec2 = cli(root, ['record', '--owner', owner, '--quick']);
  assert.equal(rec2.status, 0, rec2.stderr);

  const contentAfterRec2 = fs.readFileSync(full, 'utf8');
  const countAfter = archiveMod.getLineCount(contentAfterRec2);
  assert.ok(countAfter <= 150, `Expected journal length <= 150, got ${countAfter}`);

  // verify --deep must exit 0
  const verified = cli(root, ['verify', '--owner', owner, '--deep']);
  assert.equal(verified.status, 0, verified.stderr);

  // ARCHIVE.md must contain entry 1
  const archiveContent = fs.readFileSync(path.join(root, '.ai', 'ARCHIVE.md'), 'utf8');
  assert.match(archiveContent, /Older turn/);
});

test('Fact 11: simulated oversized single entry causes record to exit non-zero with actionable message and leaves journal unchanged', t => {
  const root = makeProtocolFixture(t, { fastValidator: true });
  const owner = 'test-oversized';
  const journal = `.ai/worklog/${owner}.md`;
  const full = path.join(root, journal);

  // Single entry whose body is 142 lines (so + Evidence will exceed 150)
  const filler = Array.from({ length: 135 }, (_, i) => `detailed explanation step ${i + 1}`).join('\n');
  const oversizedEntry = `## 2026-09-19 - Oversized turn\n\nAgent: tester\n\nAction:\n${filler}\n\nResult: Pass.\n\nNext step: Next.\n\nOpen: None.\n`;
  const initialJournal = `# Worklog: ${owner}\n\n${oversizedEntry}\n`;
  write(root, journal, initialJournal);

  const rec = cli(root, ['record', '--owner', owner, '--quick']);
  assert.notEqual(rec.status, 0);
  assert.match(rec.stderr, /journal entry is too long; split the entry before recording/);

  // Journal on disk must be completely unchanged
  const currentContent = fs.readFileSync(full, 'utf8');
  assert.equal(currentContent, initialJournal, 'Journal content was modified despite record failure');
});



