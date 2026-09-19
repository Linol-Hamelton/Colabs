'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { repoRoot, makeProtocolFixture, run, write } = require('./helpers.cjs');

function handoffCli(root, args) {
  return run(process.execPath, [path.join(root, '.ai/bin/protocol-handoff.cjs'), ...args], root);
}

function makeTaskCompleted(root, promptRel, reviewRel) {
  const content = `# Current Task\n\nStatus: Completed\nOwner: RuslanFomenko\nLast update: 2026-09-19\n\n## Objective\nCompleted test task.\n\n## Completion gate\n- Adversarial review prompt: ${promptRel}\n- Independent review: ${reviewRel}\n`;
  write(root, '.ai/TASK.md', content);
}

function makePrompt(root, promptRel) {
  const content = `# Unified Adversarial Audit Prompt\n\nDate: 2026-09-19\nReviewer: auditor\n\nUnified adversarial audit prompt text.\n`;
  write(root, promptRel, content);
}

test('gate-check 1: pass when completed task cites certifying review with verifying owner receipt', t => {
  const root = makeProtocolFixture(t, { fastValidator: true });
  const promptRel = 'docs/reviews/2026-09-19-prompt.md';
  const reviewRel = 'docs/reviews/2026-09-19-review.md';
  makeTaskCompleted(root, promptRel, reviewRel);
  makePrompt(root, promptRel);

  const reviewContent = `# Review\n\nDate: 2026-09-19\nReviewer: auditor\nMode: CERTIFYING\nReceipt-Owner: session-audit\nVerdict: PASS\n\nCertified.\n`;
  write(root, reviewRel, reviewContent);

  const journal = '.ai/worklog/session-audit.md';
  const journalContent = `# Worklog: session-audit\n\n## 2026-09-19 - independent review audit\n\nAgent: auditor\n\nAction: audited ${reviewRel}\n\nResult: PASS\n\nNext step: handoff\n\nOpen: none\n`;
  write(root, journal, journalContent);

  const rec = handoffCli(root, ['record', '--owner', 'session-audit', '--quick']);
  assert.equal(rec.status, 0, rec.stderr);

  const res = handoffCli(root, ['gate-check']);
  assert.equal(res.status, 0, res.stderr);
  assert.match(res.stdout, /completion gate verified/);
});

test('gate-check 2: fails with stale reason when a tracked file is modified after certification', t => {
  const root = makeProtocolFixture(t, { fastValidator: true });
  const promptRel = 'docs/reviews/2026-09-19-prompt.md';
  const reviewRel = 'docs/reviews/2026-09-19-review.md';
  makeTaskCompleted(root, promptRel, reviewRel);
  makePrompt(root, promptRel);

  const reviewContent = `# Review\n\nDate: 2026-09-19\nReviewer: auditor\nMode: CERTIFYING\nReceipt-Owner: session-audit\nVerdict: PASS\n\nCertified.\n`;
  write(root, reviewRel, reviewContent);

  const journal = '.ai/worklog/session-audit.md';
  const journalContent = `# Worklog: session-audit\n\n## 2026-09-19 - independent review audit\n\nAgent: auditor\n\nAction: audited ${reviewRel}\n\nResult: PASS\n\nNext step: handoff\n\nOpen: none\n`;
  write(root, journal, journalContent);

  const rec = handoffCli(root, ['record', '--owner', 'session-audit', '--quick']);
  assert.equal(rec.status, 0, rec.stderr);

  // Mutate a tracked file
  write(root, 'AGENTS.md', fs.readFileSync(path.join(root, 'AGENTS.md'), 'utf8') + '\n<!-- mutation -->\n');

  const res = handoffCli(root, ['gate-check']);
  assert.equal(res.status, 1);
  assert.match(res.stderr, /stale/i);
});

test('gate-check 3a: fails when new review (Date > 2026-09-19) is missing Mode', t => {
  const root = makeProtocolFixture(t, { fastValidator: true });
  const promptRel = 'docs/reviews/2026-09-20-prompt.md';
  const reviewRel = 'docs/reviews/2026-09-20-review.md';
  makeTaskCompleted(root, promptRel, reviewRel);
  makePrompt(root, promptRel);

  // Missing Mode on new review
  const reviewContent = `# Review\n\nDate: 2026-09-20\nReviewer: auditor\nReceipt-Owner: session-audit\nVerdict: PASS\n\nCertified.\n`;
  write(root, reviewRel, reviewContent);

  const journal = '.ai/worklog/session-audit.md';
  const journalContent = `# Worklog: session-audit\n\n## 2026-09-20 - independent review audit\n\nAgent: auditor\n\nAction: audited ${reviewRel}\n\nResult: PASS\n\nNext step: handoff\n\nOpen: none\n`;
  write(root, journal, journalContent);

  const rec = handoffCli(root, ['record', '--owner', 'session-audit', '--quick']);
  assert.equal(rec.status, 0, rec.stderr);

  const res = handoffCli(root, ['gate-check']);
  assert.equal(res.status, 1);
  assert.match(res.stderr, /missing Mode: CERTIFYING/i);
});

test('gate-check 3b: passes with warning when legacy review (Date <= 2026-09-19) lacks fields but receipt verifies', t => {
  const root = makeProtocolFixture(t, { fastValidator: true });
  const promptRel = 'docs/reviews/2026-09-19-prompt.md';
  const reviewRel = 'docs/reviews/2026-09-19-review.md';
  makeTaskCompleted(root, promptRel, reviewRel);
  makePrompt(root, promptRel);

  // Legacy review without Mode and without Receipt-Owner
  const reviewContent = `# Review\n\nDate: 2026-09-19\nReviewer: auditor\nVerdict: PASS\n\nLegacy certified.\n`;
  write(root, reviewRel, reviewContent);

  const journal = '.ai/worklog/session-audit.md';
  const journalContent = `# Worklog: session-audit\n\n## 2026-09-19 - legacy review audit\n\nAgent: auditor\n\nAction: audited ${reviewRel}\n\nResult: PASS\n\nNext step: handoff\n\nOpen: none\n`;
  write(root, journal, journalContent);

  const rec = handoffCli(root, ['record', '--owner', 'session-audit', '--quick']);
  assert.equal(rec.status, 0, rec.stderr);

  const res = handoffCli(root, ['gate-check']);
  assert.equal(res.status, 0, res.stderr);
  assert.match(res.stdout, /\[WARN\]/);
  assert.match(res.stdout, /completion gate verified/);
});

test('gate-check 4: fails when review has Mode: ADVISORY even if receipt is fresh', t => {
  const root = makeProtocolFixture(t, { fastValidator: true });
  const promptRel = 'docs/reviews/2026-09-19-prompt.md';
  const reviewRel = 'docs/reviews/2026-09-19-review.md';
  makeTaskCompleted(root, promptRel, reviewRel);
  makePrompt(root, promptRel);

  const reviewContent = `# Review\n\nDate: 2026-09-19\nReviewer: auditor\nMode: ADVISORY\nReceipt-Owner: session-audit\nVerdict: PASS\n\nAdvisory report.\n`;
  write(root, reviewRel, reviewContent);

  const journal = '.ai/worklog/session-audit.md';
  const journalContent = `# Worklog: session-audit\n\n## 2026-09-19 - independent review audit\n\nAgent: auditor\n\nAction: audited ${reviewRel}\n\nResult: PASS\n\nNext step: handoff\n\nOpen: none\n`;
  write(root, journal, journalContent);

  const rec = handoffCli(root, ['record', '--owner', 'session-audit', '--quick']);
  assert.equal(rec.status, 0, rec.stderr);

  const res = handoffCli(root, ['gate-check']);
  assert.equal(res.status, 1);
  assert.match(res.stderr, /advisory reviews cannot satisfy/i);
});

test('gate-check 5: multi-review owner where journal mentions review A only (citing B fails, citing A passes)', t => {
  const root = makeProtocolFixture(t, { fastValidator: true });
  const promptRel = 'docs/reviews/2026-09-19-prompt.md';
  const reviewA = 'docs/reviews/2026-09-19-review-a.md';
  const reviewB = 'docs/reviews/2026-09-19-review-b.md';
  makePrompt(root, promptRel);

  const contentA = `# Review A\n\nDate: 2026-09-19\nReviewer: auditor\nMode: CERTIFYING\nReceipt-Owner: session-multi\nVerdict: PASS\n\nReview A.\n`;
  const contentB = `# Review B\n\nDate: 2026-09-19\nReviewer: auditor\nMode: CERTIFYING\nReceipt-Owner: session-multi\nVerdict: PASS\n\nReview B.\n`;
  write(root, reviewA, contentA);
  write(root, reviewB, contentB);

  // Journal only mentions review A
  const journal = '.ai/worklog/session-multi.md';
  const journalContent = `# Worklog: session-multi\n\n## 2026-09-19 - review turn\n\nAgent: auditor\n\nAction: completed ${reviewA}\n\nResult: PASS\n\nNext step: next\n\nOpen: none\n`;
  write(root, journal, journalContent);

  // Set TASK.md to cite review A first and record fresh evidence
  makeTaskCompleted(root, promptRel, reviewA);
  const rec = handoffCli(root, ['record', '--owner', 'session-multi', '--quick']);
  assert.equal(rec.status, 0, rec.stderr);

  // Citing review A must pass
  const resA = handoffCli(root, ['gate-check']);
  assert.equal(resA.status, 0, resA.stderr);
  assert.match(resA.stdout, /completion gate verified/);

  // Citing review B must fail because journal does not mention review B
  makeTaskCompleted(root, promptRel, reviewB);
  const resB = handoffCli(root, ['gate-check']);
  assert.equal(resB.status, 1);
  assert.match(resB.stderr, /does not mention independent review/i);
});

test('gate-check 6: fails when Receipt-Owner names a journal with no mention of the review', t => {
  const root = makeProtocolFixture(t, { fastValidator: true });
  const promptRel = 'docs/reviews/2026-09-19-prompt.md';
  const reviewRel = 'docs/reviews/2026-09-19-review.md';
  makeTaskCompleted(root, promptRel, reviewRel);
  makePrompt(root, promptRel);

  const reviewContent = `# Review\n\nDate: 2026-09-19\nReviewer: auditor\nMode: CERTIFYING\nReceipt-Owner: session-wrong\nVerdict: PASS\n\nCertified.\n`;
  write(root, reviewRel, reviewContent);

  // session-wrong does not mention reviewRel
  const journal = '.ai/worklog/session-wrong.md';
  const journalContent = `# Worklog: session-wrong\n\n## 2026-09-19 - unrelated turn\n\nAgent: other\n\nAction: unrelated work\n\nResult: PASS\n\nNext step: next\n\nOpen: none\n`;
  write(root, journal, journalContent);

  const rec = handoffCli(root, ['record', '--owner', 'session-wrong', '--quick']);
  assert.equal(rec.status, 0, rec.stderr);

  const res = handoffCli(root, ['gate-check']);
  assert.equal(res.status, 1);
  assert.match(res.stderr, /does not mention independent review/i);
});

test('gate-check 7: passes when review has empty Receipt: field', t => {
  const root = makeProtocolFixture(t, { fastValidator: true });
  const promptRel = 'docs/reviews/2026-09-19-prompt.md';
  const reviewRel = 'docs/reviews/2026-09-19-review.md';
  makeTaskCompleted(root, promptRel, reviewRel);
  makePrompt(root, promptRel);

  const reviewContent = `# Review\n\nDate: 2026-09-19\nReviewer: auditor\nMode: CERTIFYING\nReceipt-Owner: session-audit\nReceipt:\nVerdict: PASS\n\nCertified.\n`;
  write(root, reviewRel, reviewContent);

  const journal = '.ai/worklog/session-audit.md';
  const journalContent = `# Worklog: session-audit\n\n## 2026-09-19 - independent review audit\n\nAgent: auditor\n\nAction: audited ${reviewRel}\n\nResult: PASS\n\nNext step: handoff\n\nOpen: none\n`;
  write(root, journal, journalContent);

  const rec = handoffCli(root, ['record', '--owner', 'session-audit', '--quick']);
  assert.equal(rec.status, 0, rec.stderr);

  const res = handoffCli(root, ['gate-check']);
  assert.equal(res.status, 0, res.stderr);
  assert.match(res.stdout, /completion gate verified/);
});

test('gate-check 8: exits 0 with not applicable when task status is In progress', t => {
  const root = makeProtocolFixture(t, { fastValidator: true });
  const taskContent = `# Current Task\n\nStatus: In progress\nOwner: RuslanFomenko\nLast update: 2026-09-19\n\n## Objective\nActive work.\n`;
  write(root, '.ai/TASK.md', taskContent);

  const res = handoffCli(root, ['gate-check']);
  assert.equal(res.status, 0, res.stderr);
  assert.match(res.stdout, /not applicable: task status is In progress/);
});

test('gate-check 9: fails when independent review is missing Date', t => {
  const root = makeProtocolFixture(t, { fastValidator: true });
  const promptRel = 'docs/reviews/2026-09-19-prompt.md';
  const reviewRel = 'docs/reviews/2026-09-19-review.md';
  makeTaskCompleted(root, promptRel, reviewRel);
  makePrompt(root, promptRel);

  // Review without Date field
  const reviewContent = `# Review\n\nReviewer: auditor\nMode: CERTIFYING\nReceipt-Owner: session-audit\nVerdict: PASS\n\nCertified.\n`;
  write(root, reviewRel, reviewContent);

  const journal = '.ai/worklog/session-audit.md';
  const journalContent = `# Worklog: session-audit\n\n## 2026-09-19 - independent review audit\n\nAgent: auditor\n\nAction: audited ${reviewRel}\n\nResult: PASS\n\nNext step: handoff\n\nOpen: none\n`;
  write(root, journal, journalContent);

  const rec = handoffCli(root, ['record', '--owner', 'session-audit', '--quick']);
  assert.equal(rec.status, 0, rec.stderr);

  const res = handoffCli(root, ['gate-check']);
  assert.equal(res.status, 1);
  assert.match(res.stderr, /missing or has an invalid Date/i);
});

test('gate-check 10: fails when independent review has malformed Date', t => {
  const root = makeProtocolFixture(t, { fastValidator: true });
  const promptRel = 'docs/reviews/2026-09-19-prompt.md';
  const reviewRel = 'docs/reviews/2026-09-19-review.md';
  makeTaskCompleted(root, promptRel, reviewRel);
  makePrompt(root, promptRel);

  // Review with unparseable Date field
  const reviewContent = `# Review\n\nDate: not-a-date\nReviewer: auditor\nMode: CERTIFYING\nReceipt-Owner: session-audit\nVerdict: PASS\n\nCertified.\n`;
  write(root, reviewRel, reviewContent);

  const journal = '.ai/worklog/session-audit.md';
  const journalContent = `# Worklog: session-audit\n\n## 2026-09-19 - independent review audit\n\nAgent: auditor\n\nAction: audited ${reviewRel}\n\nResult: PASS\n\nNext step: handoff\n\nOpen: none\n`;
  write(root, journal, journalContent);

  const rec = handoffCli(root, ['record', '--owner', 'session-audit', '--quick']);
  assert.equal(rec.status, 0, rec.stderr);

  const res = handoffCli(root, ['gate-check']);
  assert.equal(res.status, 1);
  assert.match(res.stderr, /missing or has an invalid Date/i);
});

test('gate-check 11: deadlock regression - record succeeds on Completed task with real validator, gate-check verifies fresh', t => {
  const root = makeProtocolFixture(t, { realValidator: true });
  const promptRel = 'docs/reviews/2026-09-19-prompt.md';
  const reviewRel = 'docs/reviews/2026-09-19-review.md';
  makeTaskCompleted(root, promptRel, reviewRel);
  makePrompt(root, promptRel);

  const reviewContent = `# Review\n\nDate: 2026-09-19\nReviewer: auditor\nMode: CERTIFYING\nReceipt-Owner: session-audit\nVerdict: PASS\n\nCertified.\n`;
  write(root, reviewRel, reviewContent);

  // Owner journal mentions review but has NO Evidence block yet
  const journal = '.ai/worklog/session-audit.md';
  const journalContent = `# Worklog: session-audit\n\n## 2026-09-19 - independent review audit\n\nAgent: auditor\n\nAction: audited ${reviewRel}\n\nResult: PASS\n\nNext step: handoff\n\nOpen: none\n`;
  write(root, journal, journalContent);

  // In A3-1, record would invoke real validate-protocol.ps1 which ran gate-check, causing a deadlock failure.
  // With PROTOCOL_SKIP_GATE=1, validate-protocol.ps1 skips gate-check and record succeeds and stamps fresh evidence.
  const rec = handoffCli(root, ['record', '--owner', 'session-audit', '--quick']);
  assert.equal(rec.status, 0, rec.stderr);

  const ver = handoffCli(root, ['verify', '--owner', 'session-audit', '--deep']);
  assert.equal(ver.status, 0, ver.stderr);

  const res = handoffCli(root, ['gate-check']);
  assert.equal(res.status, 0, res.stderr);
  assert.match(res.stdout, /completion gate verified/);

  // Mutating a tracked file makes both verify and gate-check fail
  write(root, 'AGENTS.md', fs.readFileSync(path.join(root, 'AGENTS.md'), 'utf8') + '\n<!-- post-record mutation -->\n');

  const verFail = handoffCli(root, ['verify', '--owner', 'session-audit', '--deep']);
  assert.equal(verFail.status, 1);

  const resFail = handoffCli(root, ['gate-check']);
  assert.equal(resFail.status, 1);
  assert.match(resFail.stderr, /stale/i);
});
