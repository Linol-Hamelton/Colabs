'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { repoRoot, makeFixture, makeProtocolFixture, run, git, runPowerShell, write } = require('./helpers.cjs');
const hooks = require('../.claude/hooks/protocol-hooks.cjs');
const handoff = require('../.ai/bin/protocol-handoff.cjs');

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

test('evidence chains parent-entry to previous entry hash creating an auditable Merkle link', t => {
  const root = makeProtocolFixture(t);
  const journal = '.ai/worklog/chain-session.md';
  const entry1 = entry('first turn', 'initial');
  write(root, journal, `# W\n\n${entry1}\n`);
  const recorded1 = cli(root, ['record', '--owner', 'chain-session', '--quick']);
  assert.equal(recorded1.status, 0, recorded1.stderr);

  const fullPath = path.join(root, journal);
  const ev1 = handoff.readEvidence(fullPath);
  assert.equal(ev1.parentEntry, 'root');

  // Now append a second entry on top (newest first)
  const entry2 = entry('second turn', 'subsequent');
  const entry1WithEvidence = fs.readFileSync(fullPath, 'utf8').replace(/^# W\n\n/, '');
  fs.writeFileSync(fullPath, `# W\n\n${entry2}\n---\n\n${entry1WithEvidence}`);

  const recorded2 = cli(root, ['record', '--owner', 'chain-session', '--quick']);
  assert.equal(recorded2.status, 0, recorded2.stderr);

  const ev2 = handoff.readEvidence(fullPath);
  assert.equal(ev2.parentEntry, ev1.entry);

  const verifyPass = cli(root, ['verify', '--owner', 'chain-session']);
  assert.equal(verifyPass.status, 0, verifyPass.stderr);
});

test('tampering with an earlier entry in the journal invalidates later parent-entry verification', t => {
  const root = makeProtocolFixture(t);
  const journal = '.ai/worklog/tamper-chain.md';
  const entry1 = entry('first turn', 'initial content');
  write(root, journal, `# W\n\n${entry1}\n`);
  cli(root, ['record', '--owner', 'tamper-chain', '--quick']);

  const fullPath = path.join(root, journal);
  const ev1 = handoff.readEvidence(fullPath);

  const entry2 = entry('second turn', 'subsequent content');
  const entry1Recorded = fs.readFileSync(fullPath, 'utf8').replace(/^# W\n\n/, '');
  fs.writeFileSync(fullPath, `# W\n\n${entry2}\n---\n\n${entry1Recorded}`);
  cli(root, ['record', '--owner', 'tamper-chain', '--quick']);

  const modified = fs.readFileSync(fullPath, 'utf8').replace('initial content', 'tampered_secret_content');
  fs.writeFileSync(fullPath, modified);

  const verifyResult = cli(root, ['verify', '--owner', 'tamper-chain']);
  assert.notEqual(verifyResult.status, 0);
  assert.match(verifyResult.stderr, /historical link was broken/);
});

test('tampering with authenticated Evidence metadata invalidates the entry hash', t => {
  const root = makeProtocolFixture(t);
  const journal = '.ai/worklog/evidence-auth.md';
  const fullPath = path.join(root, journal);
  write(root, journal, `# W\n\n${entry('authenticated evidence')}\n`);
  assert.equal(cli(root, ['record', '--owner', 'evidence-auth', '--quick']).status, 0);

  const original = fs.readFileSync(fullPath, 'utf8');
  fs.writeFileSync(fullPath, original.replace(/- scope: .+/, '- scope: forged receipt'));

  const result = cli(root, ['verify', '--owner', 'evidence-auth']);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /entry was changed after it was certified/);
});

test('record fails closed and refuses to stamp evidence when parent entry is tampered', t => {
  const root = makeProtocolFixture(t);
  const journal = '.ai/worklog/tamper-failclosed.md';
  const fullPath = path.join(root, journal);

  write(root, journal, `# W\n\n${entry('turn 1', 'legit')}\n`);
  assert.equal(cli(root, ['record', '--owner', 'tamper-failclosed', '--quick']).status, 0);

  const prev = fs.readFileSync(fullPath, 'utf8').replace(/^# W\n\n/, '');
  fs.writeFileSync(fullPath, `# W\n\n${entry('turn 2', 'two')}\n---\n\n${prev}`);
  assert.equal(cli(root, ['record', '--owner', 'tamper-failclosed', '--quick']).status, 0);

  const modified = fs.readFileSync(fullPath, 'utf8').replace('legit', 'FORGED');
  fs.writeFileSync(fullPath, modified);

  const prev2 = fs.readFileSync(fullPath, 'utf8').replace(/^# W\n\n/, '');
  fs.writeFileSync(fullPath, `# W\n\n${entry('turn 3', 'three')}\n---\n\n${prev2}`);

  const recordResult = cli(root, ['record', '--owner', 'tamper-failclosed', '--quick']);
  assert.notEqual(recordResult.status, 0);
  assert.match(recordResult.stderr, /historical entry link is tampered/);
});

test('full in-journal verification detects tampering three entries back even if latest is recorded', t => {
  const root = makeProtocolFixture(t);
  const journal = '.ai/worklog/deep-injournal.md';
  const fullPath = path.join(root, journal);

  write(root, journal, `# W\n\n${entry('turn 1', 'content one')}\n`);
  assert.equal(cli(root, ['record', '--owner', 'deep-injournal', '--quick']).status, 0);

  let prev = fs.readFileSync(fullPath, 'utf8').replace(/^# W\n\n/, '');
  fs.writeFileSync(fullPath, `# W\n\n${entry('turn 2', 'content two')}\n---\n\n${prev}`);
  assert.equal(cli(root, ['record', '--owner', 'deep-injournal', '--quick']).status, 0);

  prev = fs.readFileSync(fullPath, 'utf8').replace(/^# W\n\n/, '');
  fs.writeFileSync(fullPath, `# W\n\n${entry('turn 3', 'content three')}\n---\n\n${prev}`);
  assert.equal(cli(root, ['record', '--owner', 'deep-injournal', '--quick']).status, 0);

  const modified = fs.readFileSync(fullPath, 'utf8').replace('content one', 'tampered one');
  fs.writeFileSync(fullPath, modified);

  const verifyResult = cli(root, ['verify', '--owner', 'deep-injournal']);
  assert.notEqual(verifyResult.status, 0);
  assert.match(verifyResult.stderr, /historical link was broken/);
});

test('timestamped entry headings are supported across newestSection, record, and verify', t => {
  const root = makeProtocolFixture(t);
  const journal = '.ai/worklog/timestamped.md';
  const heading = '## 2026-09-18 04:12:00 UTC - Timestamped entry\n\nAgent: tester\n\nAction: Did task.\n\nResult: Pass.\n\nNext step: Handoff.\n\nOpen:\nNone.\n';
  write(root, journal, `# W\n\n${heading}\n`);

  const recorded = cli(root, ['record', '--owner', 'timestamped', '--quick']);
  assert.equal(recorded.status, 0, recorded.stderr);

  const verified = cli(root, ['verify', '--owner', 'timestamped']);
  assert.equal(verified.status, 0, verified.stderr);
});

test('legacy Evidence format < 4 is treated as legacy instead of tampered', t => {
  const root = makeProtocolFixture(t);
  const journal = '.ai/worklog/legacy-compat.md';
  const fullPath = path.join(root, journal);

  const legacyEntry = entry('legacy format 3', 'older content') +
    '\nEvidence:\n- anchor: 0123456789abcdef0123456789abcdef01234567\n' +
    '- digest: sha256:' + 'a'.repeat(64) + '\n' +
    '- digest format: 3\n' +
    '- recorded: 2026-09-10T12:00:00.000Z by legacy-agent\n' +
    '- validate-protocol.ps1: exit 0 in 1s\n' +
    '- reproduce: node .ai/bin/protocol-handoff.cjs verify\n';

  const newTurn = entry('new turn 4', 'modern content');
  write(root, journal, `# W\n\n${newTurn}\n---\n\n${legacyEntry}`);

  const recordResult = cli(root, ['record', '--owner', 'legacy-compat', '--quick']);
  assert.equal(recordResult.status, 0, recordResult.stderr);

  const ev = handoff.readEvidence(fullPath);
  assert.equal(ev.parentEntry, 'legacy');
});

test('verify --deep re-hashes archived entry body and fails when body in ARCHIVE.md is tampered', t => {
  const root = makeProtocolFixture(t);
  const archiveModule = require(path.join(root, '.ai/bin/protocol-archive.cjs'));
  const journal = '.ai/worklog/deep-tamper.md';
  const fullPath = path.join(root, journal);

  write(root, journal, `# W\n\n${entry('entry 1', 'archive me')}\n`);
  assert.equal(cli(root, ['record', '--owner', 'deep-tamper', '--quick']).status, 0);

  const prev = fs.readFileSync(fullPath, 'utf8').replace(/^# W\n\n/, '');
  fs.writeFileSync(fullPath, `# W\n\n${entry('entry 2', 'keep me')}\n---\n\n${prev}`);
  assert.equal(cli(root, ['record', '--owner', 'deep-tamper', '--quick']).status, 0);

  // Archive entry 1 into ARCHIVE.md
  archiveModule.archiveWorklog(root, fullPath, 1, 'deep-tamper');

  // Verify --deep passes on clean archive
  const verifyClean = cli(root, ['verify', '--owner', 'deep-tamper', '--deep']);
  assert.equal(verifyClean.status, 0, verifyClean.stderr);

  // Now tamper with the archived entry's text in ARCHIVE.md
  const archivePath = path.join(root, '.ai/ARCHIVE.md');
  const archiveText = fs.readFileSync(archivePath, 'utf8');
  fs.writeFileSync(archivePath, archiveText.replace('archive me', 'tampered archive body'));

  const verifyTampered = cli(root, ['verify', '--owner', 'deep-tamper', '--deep']);
  assert.notEqual(verifyTampered.status, 0);
  assert.match(verifyTampered.stderr, /archived parent .* was tampered in \.ai\/ARCHIVE\.md/);
});

test('verify --deep rejects duplicate archived copies instead of accepting the first valid one', t => {
  const root = makeProtocolFixture(t);
  const archiveModule = require(path.join(root, '.ai/bin/protocol-archive.cjs'));
  const journal = '.ai/worklog/deep-duplicate.md';
  const fullPath = path.join(root, journal);
  write(root, journal, `# W\n\n${entry('entry 1', 'archive me')}\n`);
  assert.equal(cli(root, ['record', '--owner', 'deep-duplicate', '--quick']).status, 0);
  const previous = fs.readFileSync(fullPath, 'utf8').replace(/^# W\n\n/, '');
  fs.writeFileSync(fullPath, `# W\n\n${entry('entry 2', 'keep me')}\n---\n\n${previous}`);
  assert.equal(cli(root, ['record', '--owner', 'deep-duplicate', '--quick']).status, 0);
  archiveModule.archiveWorklog(root, journal, 1, 'deep-duplicate');

  const archivePath = path.join(root, '.ai/ARCHIVE.md');
  const archiveText = fs.readFileSync(archivePath, 'utf8');
  const firstSection = archiveText.split(/(?=^## )/m)
    .find(section => /^- entry: sha256:[a-f0-9]{64}\b/m.test(section));
  assert.ok(firstSection, 'expected an archived entry section');
  assert.match(firstSection, /^- entry: sha256:[a-f0-9]{64}\b/m);
  fs.appendFileSync(archivePath, `\n---\n\n### Duplicate copy\n\n${firstSection}`);
  const duplicatedText = fs.readFileSync(archivePath, 'utf8');
  assert.equal((duplicatedText.match(/^- entry: sha256:[a-f0-9]{64}\b/gm) || []).length, 2);

  const result = cli(root, ['verify', '--owner', 'deep-duplicate', '--deep']);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /duplicate copies/);
});

test('verify --deep traverses archived parent links and detects missing links and cycles', t => {
  const root = makeProtocolFixture(t);
  const archiveModule = require(path.join(root, '.ai/bin/protocol-archive.cjs'));
  const journal = '.ai/worklog/deep-chain.md';
  const fullPath = path.join(root, journal);
  write(root, journal, `# W\n\n${entry('entry 1', 'oldest')}\n`);
  assert.equal(cli(root, ['record', '--owner', 'deep-chain', '--quick']).status, 0);
  let previous = fs.readFileSync(fullPath, 'utf8').replace(/^# W\n\n/, '');
  fs.writeFileSync(fullPath, `# W\n\n${entry('entry 2', 'middle')}\n---\n\n${previous}`);
  assert.equal(cli(root, ['record', '--owner', 'deep-chain', '--quick']).status, 0);
  previous = fs.readFileSync(fullPath, 'utf8').replace(/^# W\n\n/, '');
  fs.writeFileSync(fullPath, `# W\n\n${entry('entry 3', 'newest')}\n---\n\n${previous}`);
  assert.equal(cli(root, ['record', '--owner', 'deep-chain', '--quick']).status, 0);
  archiveModule.archiveWorklog(root, journal, 1, 'deep-chain');

  const archivePath = path.join(root, '.ai/ARCHIVE.md');
  const initial = fs.readFileSync(archivePath, 'utf8');
  const hashes = [...initial.matchAll(/^- entry: (sha256:[a-f0-9]{64})\b/gm)].map(match => match[1]);
  assert.equal(hashes.length, 2);
  const missing = initial.replace(
    new RegExp(`^- parent-entry: ${hashes[1]}$`, 'm'),
    `- parent-entry: ${'f'.repeat(64)}`);
  fs.writeFileSync(archivePath, missing);
  let result = cli(root, ['verify', '--owner', 'deep-chain', '--deep']);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /(?:missing from \.ai\/ARCHIVE\.md|tampered in \.ai\/ARCHIVE\.md|orphaned segment)/);

  const cycle = initial.replace(
    new RegExp(`^- parent-entry: ${hashes[1]}$`, 'm'),
    `- parent-entry: ${hashes[0]}`);
  fs.writeFileSync(archivePath, cycle);
  result = cli(root, ['verify', '--owner', 'deep-chain', '--deep']);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /(?:contains a cycle|tampered in \.ai\/ARCHIVE\.md)/);
});

test('numeric timezone offset in entry heading is supported and verified', t => {
  const root = makeProtocolFixture(t);
  const journal = '.ai/worklog/tz-offset.md';
  const heading = '## 2026-09-18 11:30:00 +03:00 - Entry with numeric timezone\n\nAgent: tester\n\nAction: Checked offset.\n\nResult: Pass.\n\nNext step: Handoff.\n\nOpen:\nNone.\n';
  write(root, journal, `# W\n\n${heading}\n`);

  const recorded = cli(root, ['record', '--owner', 'tz-offset', '--quick']);
  assert.equal(recorded.status, 0, recorded.stderr);

  const verified = cli(root, ['verify', '--owner', 'tz-offset']);
  assert.equal(verified.status, 0, verified.stderr);
});

test('compact ISO-8601 timezone offset in entry heading is supported and verified', t => {
  const root = makeProtocolFixture(t);
  const journal = '.ai/worklog/tz-compact.md';
  const heading = '## 2026-09-18 11:30:00+03:00 - Entry with compact timezone\n\nAgent: tester\n\nAction: Checked compact offset.\n\nResult: Pass.\n\nNext step: Handoff.\n\nOpen:\nNone.\n';
  write(root, journal, `# W\n\n${heading}\n`);

  const recorded = cli(root, ['record', '--owner', 'tz-compact', '--quick']);
  assert.equal(recorded.status, 0, recorded.stderr);

  const verified = cli(root, ['verify', '--owner', 'tz-compact']);
  assert.equal(verified.status, 0, verified.stderr);
});

test('archive terminal uniqueness accepts unique transitional root and rejects second transitional root', t => {
  const root = makeProtocolFixture(t);
  const crypto = require('crypto');
  const archivePath = path.join(root, '.ai/ARCHIVE.md');

  function makeArchivedEntry(title, evExtra = '') {
    const body = `## 2026-09-18 - ${title}\n\nAgent: tester\n\nAction: act\n\nResult: res\n\nNext step: next\n\nOpen:\nnone\n`;
    const clean = body.trim();
    const hash = `sha256:${crypto.createHash('sha256').update(clean, 'utf8').digest('hex')}`;
    const full = `${body}\nEvidence:\n- anchor: cb27c76da5d11d7ed502160f858c370bd72ce453\n` +
      `- digest: sha256:${'0'.repeat(64)}\n- digest format: 4\n- recorded: 2026-09-18T12:00:00.000Z by tester\n` +
      `- entry: ${hash}\n${evExtra}- validate-protocol.ps1: exit 0 in 1s\n` +
      `- reproduce: node .ai/bin/protocol-handoff.cjs verify\n`;
    return { hash, full };
  }

  const trans = makeArchivedEntry('transitional root', '- chain root: transitional\n');
  const middle = makeArchivedEntry('middle entry', `- parent-entry: ${trans.hash}\n`);
  fs.writeFileSync(archivePath, `# Archive\n\n${middle.full}\n---\n\n${trans.full}`);

  // Single transitional root is accepted
  const check1 = handoff.verifyArchivedChain(root, middle.hash);
  assert.equal(check1.ok, true, check1.reason);

  // A second transitional root marker is rejected
  const secondTrans = makeArchivedEntry('second transitional', '- chain root: transitional\n');
  fs.appendFileSync(archivePath, `\n---\n\n${secondTrans.full}`);
  const check2 = handoff.verifyArchivedChain(root, middle.hash);
  assert.equal(check2.ok, false);
  assert.match(check2.reason, /multiple transitional root markers/);

  // Stripping a middle link fails with orphan segment
  const top = makeArchivedEntry('top entry', `- parent-entry: ${middle.hash}\n`);
  fs.writeFileSync(archivePath, `# Archive\n\n${top.full}\n---\n\n${trans.full}`);
  const check3 = handoff.verifyArchivedChain(root, top.hash);
  assert.equal(check3.ok, false);
  assert.match(check3.reason, /(?:archive contains an orphaned segment|is missing from \.ai\/ARCHIVE\.md)/);
});

test('archive orphan detection rejects format >= 4 entry lacking parent-entry or valid terminal', t => {
  const root = makeProtocolFixture(t);
  const crypto = require('crypto');
  const archivePath = path.join(root, '.ai/ARCHIVE.md');

  function makeArchivedEntry(title, evExtra = '') {
    const body = `## 2026-09-18 - ${title}\n\nAgent: tester\n\nAction: act\n\nResult: res\n\nNext step: next\n\nOpen:\nnone\n`;
    const clean = body.trim();
    const hash = `sha256:${crypto.createHash('sha256').update(clean, 'utf8').digest('hex')}`;
    const full = `${body}\nEvidence:\n- anchor: cb27c76da5d11d7ed502160f858c370bd72ce453\n` +
      `- digest: sha256:${'0'.repeat(64)}\n- digest format: 4\n- recorded: 2026-09-18T12:00:00.000Z by tester\n` +
      `- entry: ${hash}\n${evExtra}- validate-protocol.ps1: exit 0 in 1s\n` +
      `- reproduce: node .ai/bin/protocol-handoff.cjs verify\n`;
    return { hash, full };
  }

  const orphanEntry = makeArchivedEntry('orphan format 4');
  fs.writeFileSync(archivePath, `# Archive\n\n${orphanEntry.full}`);

  const res = handoff.verifyArchivedChain(root, orphanEntry.hash);
  assert.equal(res.ok, false);
  assert.match(res.reason, /archive contains an orphaned segment/);
});

test('two independent valid archive chains from different journals are accepted', t => {
  const root = makeProtocolFixture(t);
  const crypto = require('crypto');
  const archivePath = path.join(root, '.ai/ARCHIVE.md');

  function makeArchivedEntry(title, evExtra = '') {
    const body = `## 2026-09-18 - ${title}\n\nAgent: tester\n\nAction: act\n\nResult: res\n\nNext step: next\n\nOpen:\nnone\n`;
    const clean = body.trim();
    const hash = `sha256:${crypto.createHash('sha256').update(clean, 'utf8').digest('hex')}`;
    const full = `${body}\nEvidence:\n- anchor: cb27c76da5d11d7ed502160f858c370bd72ce453\n` +
      `- digest: sha256:${'0'.repeat(64)}\n- digest format: 4\n- recorded: 2026-09-18T12:00:00.000Z by tester\n` +
      `- entry: ${hash}\n${evExtra}- validate-protocol.ps1: exit 0 in 1s\n` +
      `- reproduce: node .ai/bin/protocol-handoff.cjs verify\n`;
    return { hash, full };
  }

  const aRoot = makeArchivedEntry('chain A root', '- parent-entry: root\n');
  const aTop = makeArchivedEntry('chain A top', `- parent-entry: ${aRoot.hash}\n`);

  const bRoot = makeArchivedEntry('chain B root', '- parent-entry: root\n');
  const bTop = makeArchivedEntry('chain B top', `- parent-entry: ${bRoot.hash}\n`);

  fs.writeFileSync(archivePath, `# Archive\n\n${aTop.full}\n---\n\n${aRoot.full}\n---\n\n${bTop.full}\n---\n\n${bRoot.full}`);

  const checkA = handoff.verifyArchivedChain(root, aTop.hash);
  assert.equal(checkA.ok, true, checkA.reason);

  const checkB = handoff.verifyArchivedChain(root, bTop.hash);
  assert.equal(checkB.ok, true, checkB.reason);

  // Journal with no archived parent skips archive check
  const checkNone = handoff.verifyArchivedChain(root, null);
  assert.equal(checkNone.ok, true);
});

test('re-root attack with unreachable older record pointing into reached chain fails with orphaned segment', t => {
  const root = makeProtocolFixture(t);
  const crypto = require('crypto');
  const archivePath = path.join(root, '.ai/ARCHIVE.md');

  function makeArchivedEntry(title, evExtra = '') {
    const body = `## 2026-09-18 - ${title}\n\nAgent: tester\n\nAction: act\n\nResult: res\n\nNext step: next\n\nOpen:\nnone\n`;
    const clean = body.trim();
    const hash = `sha256:${crypto.createHash('sha256').update(clean, 'utf8').digest('hex')}`;
    const full = `${body}\nEvidence:\n- anchor: cb27c76da5d11d7ed502160f858c370bd72ce453\n` +
      `- digest: sha256:${'0'.repeat(64)}\n- digest format: 4\n- recorded: 2026-09-18T12:00:00.000Z by tester\n` +
      `- entry: ${hash}\n${evExtra}- validate-protocol.ps1: exit 0 in 1s\n` +
      `- reproduce: node .ai/bin/protocol-handoff.cjs verify\n`;
    return { hash, full };
  }

  const e3 = makeArchivedEntry('entry 3 root', '- chain root: transitional\n');
  const e2 = makeArchivedEntry('entry 2 middle', `- parent-entry: ${e3.hash}\n`);
  const e1 = makeArchivedEntry('entry 1 top', `- parent-entry: ${e2.hash}\n`);

  // Attack: e2 re-rooted to root, and e3 points to e2
  const e2Attack = makeArchivedEntry('entry 2 middle', '- parent-entry: root\n');
  const e3Attack = makeArchivedEntry('entry 3 root', `- parent-entry: ${e2Attack.hash}\n`);

  fs.writeFileSync(archivePath, `# Archive\n\n${e1.full}\n---\n\n${e2Attack.full}\n---\n\n${e3Attack.full}`);

  const res = handoff.verifyArchivedChain(root, e1.hash);
  assert.equal(res.ok, false);
  assert.match(res.reason, /archive contains an orphaned segment/);
});

test('archive record with deleted evidence is untrusted and fails verification', t => {
  const root = makeProtocolFixture(t);
  const crypto = require('crypto');
  const archivePath = path.join(root, '.ai/ARCHIVE.md');

  function makeArchivedEntry(title, evExtra = '') {
    const body = `## 2026-09-18 - ${title}\n\nAgent: tester\n\nAction: act\n\nResult: res\n\nNext step: next\n\nOpen:\nnone\n`;
    const clean = body.trim();
    const hash = `sha256:${crypto.createHash('sha256').update(clean, 'utf8').digest('hex')}`;
    const full = `${body}\nEvidence:\n- anchor: cb27c76da5d11d7ed502160f858c370bd72ce453\n` +
      `- digest: sha256:${'0'.repeat(64)}\n- digest format: 4\n- recorded: 2026-09-18T12:00:00.000Z by tester\n` +
      `- entry: ${hash}\n${evExtra}- validate-protocol.ps1: exit 0 in 1s\n` +
      `- reproduce: node .ai/bin/protocol-handoff.cjs verify\n`;
    return { hash, full };
  }

  const e2 = makeArchivedEntry('entry 2 middle', '- parent-entry: root\n');
  const e1 = makeArchivedEntry('entry 1 top', `- parent-entry: ${e2.hash}\n`);

  // Delete Evidence from e2:
  const e2NoEv = `## 2026-09-18 - entry 2 middle\n\nAgent: tester\n\nAction: act\n\nResult: res\n\nNext step: next\n\nOpen:\nnone\n\n- entry: ${e2.hash}\n`;
  fs.writeFileSync(archivePath, `# Archive\n\n${e1.full}\n---\n\n${e2NoEv}`);

  const res = handoff.verifyArchivedChain(root, e1.hash);
  assert.equal(res.ok, false);
  assert.match(res.reason, /(?:lacks recognized Evidence|orphaned segment)/);
});

test('removing digest format line from middle record does not fabricate a terminal root (older record remains checked)', t => {
  const root = makeProtocolFixture(t);
  const crypto = require('crypto');
  const archivePath = path.join(root, '.ai/ARCHIVE.md');

  function makeArchivedEntry(title, evExtra = '') {
    const body = `## 2026-09-18 - ${title}\n\nAgent: tester\n\nAction: act\n\nResult: res\n\nNext step: next\n\nOpen:\nnone\n`;
    const clean = body.trim();
    const hash = `sha256:${crypto.createHash('sha256').update(clean, 'utf8').digest('hex')}`;
    const full = `${body}\nEvidence:\n- anchor: cb27c76da5d11d7ed502160f858c370bd72ce453\n` +
      `- digest: sha256:${'0'.repeat(64)}\n- digest format: 4\n- recorded: 2026-09-18T12:00:00.000Z by tester\n` +
      `- entry: ${hash}\n${evExtra}- validate-protocol.ps1: exit 0 in 1s\n` +
      `- reproduce: node .ai/bin/protocol-handoff.cjs verify\n`;
    return { hash, full };
  }

  const e3 = makeArchivedEntry('entry 3 root', '- chain root: transitional\n');
  const e2 = makeArchivedEntry('entry 2 middle', `- parent-entry: ${e3.hash}\n`);
  const e1 = makeArchivedEntry('entry 1 top', `- parent-entry: ${e2.hash}\n`);

  // Strip only the '- digest format: 4\n' line from e2 (keeping parent-entry: e3.hash)
  const e2NoFormat = e2.full.replace(/^[ \t]*-[ \t]+digest format:\s*\d+\r?\n/m, '');

  // Tamper with older record e3's body
  const e3Tampered = e3.full.replace('entry 3 root', 'tampered entry 3');

  fs.writeFileSync(archivePath, `# Archive\n\n${e1.full}\n---\n\n${e2NoFormat}\n---\n\n${e3Tampered}`);

  const res = handoff.verifyArchivedChain(root, e1.hash);
  assert.equal(res.ok, false);
  // Proof that older entry e3 is reached and verified rather than e2 terminating early:
  assert.match(res.reason, /was tampered in \.ai\/ARCHIVE\.md/);
});

