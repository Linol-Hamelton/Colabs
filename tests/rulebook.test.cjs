'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { repoRoot, makeProtocolFixture, git, write, run } = require('./helpers.cjs');
const verdictTool = require('../.ai/bin/protocol-verdict.cjs');
const scopeTool = require('../.ai/bin/protocol-scope.cjs');

function runTool(toolFile, args, cwd) {
  const fullPath = path.join(repoRoot, '.ai', 'bin', toolFile);
  const result = run('node', [fullPath, ...args], cwd || repoRoot);
  return {
    status: result.status,
    stdout: result.stdout.toString('utf8'),
    stderr: result.stderr.toString('utf8'),
  };
}

function makeLedgerTable(rows) {
  let md = '# Findings Ledger\n\n' +
    '| id | root-cause | requirement | paths | reproduction | exit | severity | disposition | attempt |\n' +
    '|---|---|---|---|---|---|---|---|---|\n';
  for (const r of rows) {
    md += `| ${r.id} | ${r.rootCause} | ${r.requirement} | ${r.paths} | ${r.reproduction} | ${r.exit} | ${r.severity} | ${r.disposition} | ${r.attempt} |\n`;
  }
  return md;
}

// ---------------------------------------------------------------------------
// Check 1: Verdict Arithmetic Tests
// ---------------------------------------------------------------------------

test('verdict arithmetic: all clean/fixed findings yields PASS', t => {
  const root = makeProtocolFixture(t);
  const ledgerFile = path.join(root, 'docs/reviews/test-findings.md');
  const content = makeLedgerTable([
    {
      id: 'F-001',
      rootCause: 'RC-1',
      requirement: 'docs check',
      paths: 'docs/test.md',
      reproduction: 'none',
      exit: 'n/a',
      severity: 'LOW',
      disposition: 'fixed-and-verified',
      attempt: '1',
    },
  ]);
  write(root, 'docs/reviews/test-findings.md', content);

  const res = runTool('protocol-verdict.cjs', [ledgerFile], root);
  assert.equal(res.status, 0);
  assert.match(res.stdout, /Verdict: PASS/);
});

test('verdict arithmetic: confirmed finding on protected path (.ai/bin/) is FAIL even if severity is LOW', t => {
  const root = makeProtocolFixture(t);
  const ledgerFile = path.join(root, 'docs/reviews/test-findings.md');
  // Spec section 8: a ledger whose only confirmed finding is labelled LOW but touches .ai/bin/, which must still be FAIL
  const content = makeLedgerTable([
    {
      id: 'F-001',
      rootCause: 'RC-bin',
      requirement: 'CLI script check',
      paths: '.ai/bin/protocol-verdict.cjs',
      reproduction: 'node .ai/bin/protocol-verdict.cjs',
      exit: '1',
      severity: 'LOW', // Must be ignored by arithmetic
      disposition: 'confirmed',
      attempt: '1',
    },
  ]);
  write(root, 'docs/reviews/test-findings.md', content);

  const res = runTool('protocol-verdict.cjs', [ledgerFile], root);
  assert.equal(res.status, 1);
  assert.match(res.stdout, /Verdict: FAIL/);
  assert.match(res.stdout, /F-001/);
});

test('verdict arithmetic: confirmed finding on validator / gate / hooks is FAIL', t => {
  const root = makeProtocolFixture(t);
  const ledgerFile = path.join(root, 'docs/reviews/test-findings.md');
  const content = makeLedgerTable([
    {
      id: 'F-002',
      rootCause: 'RC-val',
      requirement: 'validation script',
      paths: '.claude/hooks/protocol-hooks.cjs',
      reproduction: 'node .claude/hooks/protocol-hooks.cjs',
      exit: '1',
      severity: 'INFO',
      disposition: 'confirmed',
      attempt: '1',
    },
  ]);
  write(root, 'docs/reviews/test-findings.md', content);

  const res = runTool('protocol-verdict.cjs', [ledgerFile], root);
  assert.equal(res.status, 1);
  assert.match(res.stdout, /Verdict: FAIL/);
});

test('F-001: verdict arithmetic normalises leading ./ on protected path to FAIL (exit 1)', t => {
  const root = makeProtocolFixture(t);
  const ledgerFile = path.join(root, 'docs/reviews/test-findings.md');
  const content = makeLedgerTable([
    {
      id: 'F-001a',
      rootCause: 'RC-norm',
      requirement: 'CLI script check',
      paths: './.ai/bin/protocol-verdict.cjs',
      reproduction: 'node .ai/bin/protocol-verdict.cjs',
      exit: '1',
      severity: 'LOW',
      disposition: 'confirmed',
      attempt: '1',
    },
  ]);
  write(root, 'docs/reviews/test-findings.md', content);

  const res = runTool('protocol-verdict.cjs', [ledgerFile], root);
  assert.equal(res.status, 1);
  assert.match(res.stdout, /Verdict: FAIL/);
});

test('F-001: verdict arithmetic normalises case variation on protected path to FAIL (exit 1)', t => {
  const root = makeProtocolFixture(t);
  const ledgerFile = path.join(root, 'docs/reviews/test-findings.md');
  const content = makeLedgerTable([
    {
      id: 'F-001b',
      rootCause: 'RC-case',
      requirement: 'CLI script check',
      paths: '.AI/bin/protocol-verdict.cjs',
      reproduction: 'node .ai/bin/protocol-verdict.cjs',
      exit: '1',
      severity: 'LOW',
      disposition: 'confirmed',
      attempt: '1',
    },
  ]);
  write(root, 'docs/reviews/test-findings.md', content);

  const res = runTool('protocol-verdict.cjs', [ledgerFile], root);
  assert.equal(res.status, 1);
  assert.match(res.stdout, /Verdict: FAIL/);
});

test('F-001: normal path containing false-protection word (data/gate/validate) yields RECOMMENDATION (exit 0)', t => {
  const root = makeProtocolFixture(t);
  const ledgerFile = path.join(root, 'docs/reviews/test-findings.md');
  const content = makeLedgerTable([
    {
      id: 'F-001c',
      rootCause: 'RC-doc-data',
      requirement: 'readme formatting improvement',
      paths: 'docs/database-notes.md',
      reproduction: 'cat docs/database-notes.md',
      exit: '0',
      severity: 'LOW',
      disposition: 'confirmed',
      attempt: '1',
    },
    {
      id: 'F-001d',
      rootCause: 'RC-doc-gate',
      requirement: 'helper tweak',
      paths: 'src/delegate.js',
      reproduction: 'node src/delegate.js',
      exit: '0',
      severity: 'LOW',
      disposition: 'confirmed',
      attempt: '1',
    },
    {
      id: 'F-001e',
      rootCause: 'RC-doc-val',
      requirement: 'archived report doc',
      paths: 'docs/invalidated.md',
      reproduction: 'cat docs/invalidated.md',
      exit: '0',
      severity: 'LOW',
      disposition: 'confirmed',
      attempt: '1',
    },
  ]);
  write(root, 'docs/reviews/test-findings.md', content);

  const res = runTool('protocol-verdict.cjs', [ledgerFile], root);
  assert.equal(res.status, 0);
  assert.match(res.stdout, /Verdict: RECOMMENDATION/);
});

// ---------------------------------------------------------------------------
// PROTO-DEC-0046 item 5: Protected set & rejected path contract tests
// ---------------------------------------------------------------------------

test('PROTO-DEC-0046: neutral requirement on .ai/... protected path yields FAIL (exit 1)', t => {
  const root = makeProtocolFixture(t);
  const ledgerFile = path.join(root, 'docs/reviews/test-findings.md');
  const content = makeLedgerTable([
    {
      id: 'F-P01',
      rootCause: 'RC-ai',
      requirement: 'CLI check',
      paths: '.ai/bin/protocol-verdict.cjs',
      reproduction: 'node .ai/bin/protocol-verdict.cjs',
      exit: '1',
      severity: 'LOW',
      disposition: 'confirmed',
      attempt: '1',
    },
  ]);
  write(root, 'docs/reviews/test-findings.md', content);

  const res = runTool('protocol-verdict.cjs', [ledgerFile], root);
  assert.equal(res.status, 1);
  assert.match(res.stdout, /Verdict: FAIL/);
});

test('PROTO-DEC-0046: neutral requirement on .claude/... protected path yields FAIL (exit 1)', t => {
  const root = makeProtocolFixture(t);
  const ledgerFile = path.join(root, 'docs/reviews/test-findings.md');
  const content = makeLedgerTable([
    {
      id: 'F-P02',
      rootCause: 'RC-claude',
      requirement: 'CLI check',
      paths: '.claude/hooks/protocol-hooks.cjs',
      reproduction: 'node .claude/hooks/protocol-hooks.cjs',
      exit: '1',
      severity: 'LOW',
      disposition: 'confirmed',
      attempt: '1',
    },
  ]);
  write(root, 'docs/reviews/test-findings.md', content);

  const res = runTool('protocol-verdict.cjs', [ledgerFile], root);
  assert.equal(res.status, 1);
  assert.match(res.stdout, /Verdict: FAIL/);
});

test('PROTO-DEC-0046: neutral requirement on .codex/... protected path yields FAIL (exit 1)', t => {
  const root = makeProtocolFixture(t);
  const ledgerFile = path.join(root, 'docs/reviews/test-findings.md');
  const content = makeLedgerTable([
    {
      id: 'F-P03',
      rootCause: 'RC-codex',
      requirement: 'CLI check',
      paths: '.codex/hooks/protocol.cjs',
      reproduction: 'node .codex/hooks/protocol.cjs',
      exit: '1',
      severity: 'LOW',
      disposition: 'confirmed',
      attempt: '1',
    },
  ]);
  write(root, 'docs/reviews/test-findings.md', content);

  const res = runTool('protocol-verdict.cjs', [ledgerFile], root);
  assert.equal(res.status, 1);
  assert.match(res.stdout, /Verdict: FAIL/);
});

test('PROTO-DEC-0046: neutral requirement on managed validate-protocol.ps1 yields FAIL (exit 1)', t => {
  const root = makeProtocolFixture(t);
  const ledgerFile = path.join(root, 'docs/reviews/test-findings.md');
  const content = makeLedgerTable([
    {
      id: 'F-P04',
      rootCause: 'RC-val',
      requirement: 'CLI check',
      paths: 'validate-protocol.ps1',
      reproduction: 'powershell -File validate-protocol.ps1',
      exit: '1',
      severity: 'LOW',
      disposition: 'confirmed',
      attempt: '1',
    },
  ]);
  write(root, 'docs/reviews/test-findings.md', content);

  const res = runTool('protocol-verdict.cjs', [ledgerFile], root);
  assert.equal(res.status, 1);
  assert.match(res.stdout, /Verdict: FAIL/);
});

test('PROTO-DEC-0046: neutral requirement on managed protocol-manifest.json yields FAIL (exit 1)', t => {
  const root = makeProtocolFixture(t);
  const ledgerFile = path.join(root, 'docs/reviews/test-findings.md');
  const content = makeLedgerTable([
    {
      id: 'F-P05',
      rootCause: 'RC-manifest',
      requirement: 'CLI check',
      paths: 'protocol-manifest.json',
      reproduction: 'cat protocol-manifest.json',
      exit: '1',
      severity: 'LOW',
      disposition: 'confirmed',
      attempt: '1',
    },
  ]);
  write(root, 'docs/reviews/test-findings.md', content);

  const res = runTool('protocol-verdict.cjs', [ledgerFile], root);
  assert.equal(res.status, 1);
  assert.match(res.stdout, /Verdict: FAIL/);
});

test('PROTO-DEC-0046: neutral requirement on source entry setup-ai-protocol.ps1 yields FAIL (exit 1)', t => {
  const root = makeProtocolFixture(t);
  const ledgerFile = path.join(root, 'docs/reviews/test-findings.md');
  const content = makeLedgerTable([
    {
      id: 'F-P06',
      rootCause: 'RC-setup',
      requirement: 'CLI check',
      paths: 'setup-ai-protocol.ps1',
      reproduction: 'powershell -File setup-ai-protocol.ps1',
      exit: '1',
      severity: 'LOW',
      disposition: 'confirmed',
      attempt: '1',
    },
  ]);
  write(root, 'docs/reviews/test-findings.md', content);

  const res = runTool('protocol-verdict.cjs', [ledgerFile], root);
  assert.equal(res.status, 1);
  assert.match(res.stdout, /Verdict: FAIL/);
});

test('PROTO-DEC-0046: neutral requirement on off-protected control docs/notes.md yields RECOMMENDATION (exit 0)', t => {
  const root = makeProtocolFixture(t);
  const ledgerFile = path.join(root, 'docs/reviews/test-findings.md');
  const content = makeLedgerTable([
    {
      id: 'F-P07',
      rootCause: 'RC-notes',
      requirement: 'CLI check',
      paths: 'docs/notes.md',
      reproduction: 'cat docs/notes.md',
      exit: '0',
      severity: 'LOW',
      disposition: 'confirmed',
      attempt: '1',
    },
  ]);
  write(root, 'docs/reviews/test-findings.md', content);

  const res = runTool('protocol-verdict.cjs', [ledgerFile], root);
  assert.equal(res.status, 0);
  assert.match(res.stdout, /Verdict: RECOMMENDATION/);
});

test('PROTO-DEC-0046: rejected path form D:/Colabs/.ai/bin/x exits 2 (BLOCKED)', t => {
  const root = makeProtocolFixture(t);
  const ledgerFile = path.join(root, 'docs/reviews/test-findings.md');
  const content = makeLedgerTable([
    {
      id: 'F-R01',
      rootCause: 'RC-rej',
      requirement: 'CLI check',
      paths: 'D:/Colabs/.ai/bin/x',
      reproduction: 'node x',
      exit: '1',
      severity: 'LOW',
      disposition: 'confirmed',
      attempt: '1',
    },
  ]);
  write(root, 'docs/reviews/test-findings.md', content);

  const res = runTool('protocol-verdict.cjs', [ledgerFile], root);
  assert.equal(res.status, 2);
  assert.match(res.stderr, /BLOCKED/);
});

test('PROTO-DEC-0046: rejected path form C:/Colabs/.ai/bin/x exits 2 (BLOCKED)', t => {
  const root = makeProtocolFixture(t);
  const ledgerFile = path.join(root, 'docs/reviews/test-findings.md');
  const content = makeLedgerTable([
    {
      id: 'F-R02',
      rootCause: 'RC-rej',
      requirement: 'CLI check',
      paths: 'C:/Colabs/.ai/bin/x',
      reproduction: 'node x',
      exit: '1',
      severity: 'LOW',
      disposition: 'confirmed',
      attempt: '1',
    },
  ]);
  write(root, 'docs/reviews/test-findings.md', content);

  const res = runTool('protocol-verdict.cjs', [ledgerFile], root);
  assert.equal(res.status, 2);
  assert.match(res.stderr, /BLOCKED/);
});

test('PROTO-DEC-0046: rejected path form ../.ai/bin/x exits 2 (BLOCKED)', t => {
  const root = makeProtocolFixture(t);
  const ledgerFile = path.join(root, 'docs/reviews/test-findings.md');
  const content = makeLedgerTable([
    {
      id: 'F-R03',
      rootCause: 'RC-rej',
      requirement: 'CLI check',
      paths: '../.ai/bin/x',
      reproduction: 'node x',
      exit: '1',
      severity: 'LOW',
      disposition: 'confirmed',
      attempt: '1',
    },
  ]);
  write(root, 'docs/reviews/test-findings.md', content);

  const res = runTool('protocol-verdict.cjs', [ledgerFile], root);
  assert.equal(res.status, 2);
  assert.match(res.stderr, /BLOCKED/);
});

test('PROTO-DEC-0046: rejected path form x/../.ai/bin/x exits 2 (BLOCKED)', t => {
  const root = makeProtocolFixture(t);
  const ledgerFile = path.join(root, 'docs/reviews/test-findings.md');
  const content = makeLedgerTable([
    {
      id: 'F-R04',
      rootCause: 'RC-rej',
      requirement: 'CLI check',
      paths: 'x/../.ai/bin/x',
      reproduction: 'node x',
      exit: '1',
      severity: 'LOW',
      disposition: 'confirmed',
      attempt: '1',
    },
  ]);
  write(root, 'docs/reviews/test-findings.md', content);

  const res = runTool('protocol-verdict.cjs', [ledgerFile], root);
  assert.equal(res.status, 2);
  assert.match(res.stderr, /BLOCKED/);
});

test('PROTO-DEC-0046: rejected UNC path forms (//... and \\\\...) exit 2 (BLOCKED)', t => {
  const root = makeProtocolFixture(t);
  const file1 = path.join(root, 'docs/reviews/unc1.md');
  write(root, 'docs/reviews/unc1.md', makeLedgerTable([
    { id: 'F-U01', rootCause: 'RC-unc', requirement: 'CLI check', paths: '//server/share/.ai/bin/x', reproduction: 'node x', exit: '1', severity: 'LOW', disposition: 'confirmed', attempt: '1' },
  ]));
  const res1 = runTool('protocol-verdict.cjs', [file1], root);
  assert.equal(res1.status, 2);
  assert.match(res1.stderr, /BLOCKED/);

  const file2 = path.join(root, 'docs/reviews/unc2.md');
  write(root, 'docs/reviews/unc2.md', makeLedgerTable([
    { id: 'F-U02', rootCause: 'RC-unc', requirement: 'CLI check', paths: '\\\\server\\share\\.ai\\bin\\x', reproduction: 'node x', exit: '1', severity: 'LOW', disposition: 'confirmed', attempt: '1' },
  ]));
  const res2 = runTool('protocol-verdict.cjs', [file2], root);
  assert.equal(res2.status, 2);
  assert.match(res2.stderr, /BLOCKED/);
});

test('PROTO-DEC-0046: rejected POSIX-root path form /home/user/... exits 2 (BLOCKED)', t => {
  const root = makeProtocolFixture(t);
  const ledgerFile = path.join(root, 'docs/reviews/test-findings.md');
  const content = makeLedgerTable([
    {
      id: 'F-R05',
      rootCause: 'RC-rej',
      requirement: 'CLI check',
      paths: '/home/user/colabs/.ai/bin/x',
      reproduction: 'node x',
      exit: '1',
      severity: 'LOW',
      disposition: 'confirmed',
      attempt: '1',
    },
  ]);
  write(root, 'docs/reviews/test-findings.md', content);

  const res = runTool('protocol-verdict.cjs', [ledgerFile], root);
  assert.equal(res.status, 2);
  assert.match(res.stderr, /BLOCKED/);
});

test('PROTO-DEC-0046: rejected Windows drive-relative form D:.ai/bin/x exits 2 (BLOCKED)', t => {
  const root = makeProtocolFixture(t);
  const ledgerFile = path.join(root, 'docs/reviews/test-findings.md');
  const content = makeLedgerTable([
    {
      id: 'F-R06',
      rootCause: 'RC-rej',
      requirement: 'CLI check',
      paths: 'D:.ai/bin/x',
      reproduction: 'node x',
      exit: '1',
      severity: 'LOW',
      disposition: 'confirmed',
      attempt: '1',
    },
  ]);
  write(root, 'docs/reviews/test-findings.md', content);

  const res = runTool('protocol-verdict.cjs', [ledgerFile], root);
  assert.equal(res.status, 2);
  assert.match(res.stderr, /BLOCKED/);
});

test('verdict arithmetic: confirmed finding off protected path naming invariant or contract is FAIL', t => {
  const root = makeProtocolFixture(t);
  const ledgerFile = path.join(root, 'docs/reviews/test-findings.md');
  const content = makeLedgerTable([
    {
      id: 'F-003',
      rootCause: 'RC-contract',
      requirement: 'API contract violated: return format mismatch',
      paths: 'src/api.js',
      reproduction: 'node test-api.js',
      exit: '1',
      severity: 'MEDIUM',
      disposition: 'confirmed',
      attempt: '1',
    },
  ]);
  write(root, 'docs/reviews/test-findings.md', content);

  const res = runTool('protocol-verdict.cjs', [ledgerFile], root);
  assert.equal(res.status, 1);
  assert.match(res.stdout, /Verdict: FAIL/);
});

test('verdict arithmetic: confirmed finding off protected paths without invariant/contract is RECOMMENDATION', t => {
  const root = makeProtocolFixture(t);
  const ledgerFile = path.join(root, 'docs/reviews/test-findings.md');
  const content = makeLedgerTable([
    {
      id: 'F-004',
      rootCause: 'RC-doc',
      requirement: 'readme formatting improvement',
      paths: 'docs/guide.md',
      reproduction: 'cat docs/guide.md',
      exit: '0',
      severity: 'LOW',
      disposition: 'confirmed',
      attempt: '1',
    },
  ]);
  write(root, 'docs/reviews/test-findings.md', content);

  const res = runTool('protocol-verdict.cjs', [ledgerFile], root);
  assert.equal(res.status, 0);
  assert.match(res.stdout, /Verdict: RECOMMENDATION/);
});

test('verdict arithmetic: confirmed finding with reproduction none cannot exceed RECOMMENDATION (advisory)', t => {
  const root = makeProtocolFixture(t);
  const ledgerFile = path.join(root, 'docs/reviews/test-findings.md');
  const content = makeLedgerTable([
    {
      id: 'F-005',
      rootCause: 'RC-advisory',
      requirement: 'suspected invariant breach',
      paths: '.ai/bin/protocol-verdict.cjs',
      reproduction: 'none',
      exit: 'n/a',
      severity: 'HIGH',
      disposition: 'confirmed',
      attempt: '1',
    },
  ]);
  write(root, 'docs/reviews/test-findings.md', content);

  const res = runTool('protocol-verdict.cjs', [ledgerFile], root);
  assert.equal(res.status, 0);
  assert.match(res.stdout, /Verdict: RECOMMENDATION/);
  assert.match(res.stdout, /advisory by AGENTS section 2/);
});

test('verdict arithmetic: unresolved finding or unrunnable check yields BLOCKED (exit 2)', t => {
  const root = makeProtocolFixture(t);
  const ledgerFile1 = path.join(root, 'docs/reviews/unresolved.md');
  write(root, 'docs/reviews/unresolved.md', makeLedgerTable([
    {
      id: 'F-006',
      rootCause: 'RC-unres',
      requirement: 'disputed behavior',
      paths: 'docs/test.md',
      reproduction: 'test command',
      exit: '1',
      severity: 'HIGH',
      disposition: 'unresolved',
      attempt: '1',
    },
  ]));

  const res1 = runTool('protocol-verdict.cjs', [ledgerFile1], root);
  assert.equal(res1.status, 2);
  assert.match(res1.stdout, /Verdict: BLOCKED/);

  const ledgerFile2 = path.join(root, 'docs/reviews/unrunnable.md');
  write(root, 'docs/reviews/unrunnable.md', makeLedgerTable([
    {
      id: 'F-007',
      rootCause: 'RC-unrun',
      requirement: 'network check',
      paths: 'docs/test.md',
      reproduction: 'unrunnable',
      exit: 'n/a',
      severity: 'HIGH',
      disposition: 'confirmed',
      attempt: '1',
    },
  ]));

  const res2 = runTool('protocol-verdict.cjs', [ledgerFile2], root);
  assert.equal(res2.status, 2);
  assert.match(res2.stdout, /Verdict: BLOCKED/);
});

test('verdict arithmetic: malformed ledger exits 2 (BLOCKED)', t => {
  const root = makeProtocolFixture(t);

  // Missing required column
  const badTable1 = '# Ledger\n\n| id | root-cause | paths |\n|---|---|---|\n| F-1 | RC-1 | a.txt |\n';
  const file1 = path.join(root, 'docs/reviews/bad1.md');
  write(root, 'docs/reviews/bad1.md', badTable1);
  const res1 = runTool('protocol-verdict.cjs', [file1], root);
  assert.equal(res1.status, 2);

  // Duplicate ID
  const badTable2 = makeLedgerTable([
    { id: 'F-001', rootCause: 'RC-1', requirement: 'r', paths: 'p', reproduction: 'none', exit: '0', severity: 'LOW', disposition: 'confirmed', attempt: '1' },
    { id: 'F-001', rootCause: 'RC-2', requirement: 'r', paths: 'p', reproduction: 'none', exit: '0', severity: 'LOW', disposition: 'confirmed', attempt: '1' },
  ]);
  const file2 = path.join(root, 'docs/reviews/bad2.md');
  write(root, 'docs/reviews/bad2.md', badTable2);
  const res2 = runTool('protocol-verdict.cjs', [file2], root);
  assert.equal(res2.status, 2);

  // Invalid severity
  const badTable3 = makeLedgerTable([
    { id: 'F-001', rootCause: 'RC-1', requirement: 'r', paths: 'p', reproduction: 'none', exit: '0', severity: 'CRITICAL', disposition: 'confirmed', attempt: '1' },
  ]);
  const file3 = path.join(root, 'docs/reviews/bad3.md');
  write(root, 'docs/reviews/bad3.md', badTable3);
  const res3 = runTool('protocol-verdict.cjs', [file3], root);
  assert.equal(res3.status, 2);
});

// ---------------------------------------------------------------------------
// Check 2: Root-Cause Stop Rule Tests (--stop-rule)
// ---------------------------------------------------------------------------

test('stop rule: pass when attempts <= 2 and contiguous', t => {
  const root = makeProtocolFixture(t);
  const ledgerFile = path.join(root, 'docs/reviews/stop-pass.md');
  write(root, 'docs/reviews/stop-pass.md', makeLedgerTable([
    { id: 'F-001', rootCause: 'RC-git', requirement: 'r', paths: 'p', reproduction: 'none', exit: '0', severity: 'LOW', disposition: 'fixed-and-verified', attempt: '1' },
    { id: 'F-002', rootCause: 'RC-git', requirement: 'r', paths: 'p', reproduction: 'none', exit: '0', severity: 'LOW', disposition: 'fixed-and-verified', attempt: '2' },
  ]));

  const res = runTool('protocol-verdict.cjs', [ledgerFile, '--stop-rule'], root);
  assert.equal(res.status, 0);
  assert.match(res.stdout, /PASS: Root-cause stop rule satisfied/);
});

test('stop rule: third attempt on one root-cause triggers STOP (exit 1)', t => {
  const root = makeProtocolFixture(t);
  const ledgerFile = path.join(root, 'docs/reviews/stop-fail.md');
  write(root, 'docs/reviews/stop-fail.md', makeLedgerTable([
    { id: 'F-001', rootCause: 'RC-git', requirement: 'r', paths: 'p', reproduction: 'none', exit: '0', severity: 'LOW', disposition: 'fixed-and-verified', attempt: '1' },
    { id: 'F-002', rootCause: 'RC-git', requirement: 'r', paths: 'p', reproduction: 'none', exit: '0', severity: 'LOW', disposition: 'fixed-and-verified', attempt: '2' },
    { id: 'F-003', rootCause: 'RC-git', requirement: 'r', paths: 'p', reproduction: 'none', exit: '0', severity: 'LOW', disposition: 'unresolved', attempt: '3' },
  ]));

  const res = runTool('protocol-verdict.cjs', [ledgerFile, '--stop-rule'], root);
  assert.equal(res.status, 1);
  assert.match(res.stdout, /STOP RULE TRIGGERED/);
  assert.match(res.stdout, /stop and return the area or the premise to the owner/);
  assert.match(res.stdout, /RC-git/);
});

test('stop rule: non-contiguous attempts (1, 3) is a ledger defect (exit 2)', t => {
  const root = makeProtocolFixture(t);
  const ledgerFile = path.join(root, 'docs/reviews/stop-noncontig.md');
  write(root, 'docs/reviews/stop-noncontig.md', makeLedgerTable([
    { id: 'F-001', rootCause: 'RC-git', requirement: 'r', paths: 'p', reproduction: 'none', exit: '0', severity: 'LOW', disposition: 'fixed-and-verified', attempt: '1' },
    { id: 'F-002', rootCause: 'RC-git', requirement: 'r', paths: 'p', reproduction: 'none', exit: '0', severity: 'LOW', disposition: 'unresolved', attempt: '3' },
  ]));

  const res = runTool('protocol-verdict.cjs', [ledgerFile, '--stop-rule'], root);
  assert.equal(res.status, 2);
  assert.match(res.stderr, /non-contiguous attempts/);
});

// ---------------------------------------------------------------------------
// Check 3: Scope Check Tests (--baseline <sha> --scope <file>)
// ---------------------------------------------------------------------------

test('scope check: clean subset passes (exit 0)', t => {
  const root = makeProtocolFixture(t);
  git(root, ['add', '-A']);
  git(root, ['commit', '-m', 'Initial baseline']);
  const baseline = git(root, ['rev-parse', 'HEAD']).stdout.trim();

  write(root, 'docs/guide.md', '# Guide\nUpdated.\n');
  git(root, ['add', '-A']);
  write(root, 'scope.txt', 'docs/guide.md\nscope.txt\n');

  const res = runTool('protocol-scope.cjs', ['--baseline', baseline, '--scope', 'scope.txt', '--cwd', root]);
  assert.equal(res.status, 0);
  assert.match(res.stdout, /SCOPE CHECK PASS/);
});

test('scope check: handles non-ASCII paths without C-quoting failure via -z', t => {
  const root = makeProtocolFixture(t);
  git(root, ['add', '-A']);
  git(root, ['commit', '-m', 'Initial baseline']);
  const baseline = git(root, ['rev-parse', 'HEAD']).stdout.trim();

  // Non-ASCII path that would be C-quoted by git diff without -z
  write(root, 'docs/Битва-за-луну.md', '# Луна\nТекст.\n');
  git(root, ['add', '-A']);
  write(root, 'scope.txt', 'docs/\nscope.txt\n');

  const res = runTool('protocol-scope.cjs', ['--baseline', baseline, '--scope', 'scope.txt', '--cwd', root]);
  assert.equal(res.status, 0);
  assert.match(res.stdout, /SCOPE CHECK PASS/);
});

test('scope check: prefix is not a directory match (exit 1)', t => {
  const root = makeProtocolFixture(t);
  git(root, ['add', '-A']);
  git(root, ['commit', '-m', 'Initial baseline']);
  const baseline = git(root, ['rev-parse', 'HEAD']).stdout.trim();

  write(root, 'docs-extra/secret.md', '# Secret\n');
  git(root, ['add', '-A']);
  write(root, 'scope.txt', 'docs\n'); // Prefix 'docs' must NOT match 'docs-extra'

  const res = runTool('protocol-scope.cjs', ['--baseline', baseline, '--scope', 'scope.txt', '--cwd', root]);
  assert.equal(res.status, 1);
  assert.match(res.stdout, /OUT_OF_SCOPE: docs-extra\/secret\.md/);
});

test('scope check: touching forbidden path fails (exit 1)', t => {
  const root = makeProtocolFixture(t);
  git(root, ['add', '-A']);
  git(root, ['commit', '-m', 'Initial baseline']);
  const baseline = git(root, ['rev-parse', 'HEAD']).stdout.trim();

  write(root, 'validate-protocol.ps1', '# Tampered\n');
  write(root, 'scope.txt', 'validate-protocol.ps1\n');

  const res = runTool('protocol-scope.cjs', ['--baseline', baseline, '--scope', 'scope.txt', '--cwd', root]);
  assert.equal(res.status, 1);
  assert.match(res.stdout, /FORBIDDEN: validate-protocol\.ps1/);
});

test('scope check: missing baseline or unreadable scope file exits 2', t => {
  const root = makeProtocolFixture(t);

  const res1 = runTool('protocol-scope.cjs', ['--baseline', 'deadbeef00000000000000000000000000000000', '--scope', 'missing-scope.txt', '--cwd', root]);
  assert.equal(res1.status, 2);

  write(root, 'empty-scope.txt', '# Only comments\n');
  const res2 = runTool('protocol-scope.cjs', ['--baseline', 'HEAD', '--scope', 'empty-scope.txt', '--cwd', root]);
  assert.equal(res2.status, 2);
});

test('F-004: scope check detects untracked forbidden file and fails (exit 1)', t => {
  const root = makeProtocolFixture(t);
  git(root, ['add', '-A']);
  git(root, ['commit', '-m', 'Initial baseline']);
  const baseline = git(root, ['rev-parse', 'HEAD']).stdout.trim();

  // Declared scope allows docs/
  write(root, 'scope.txt', 'docs/\n');

  // Untracked forbidden file
  fs.mkdirSync(path.join(root, 'tests'), { recursive: true });
  fs.writeFileSync(path.join(root, 'tests', 'evil.test.cjs'), 'evil\n');

  const res = runTool('protocol-scope.cjs', ['--baseline', baseline, '--scope', 'scope.txt', '--cwd', root]);
  assert.equal(res.status, 1);
  assert.match(res.stdout, /SCOPE CHECK FAILED/);
  assert.match(res.stdout, /FORBIDDEN: tests\/evil\.test\.cjs/);
});

// ---------------------------------------------------------------------------
// Check 4: Author Is Not Reviewer Tests (--independence <review-path>)
// ---------------------------------------------------------------------------

test('independence check: Receipt-Owner equals producer owner exits 1', t => {
  const root = makeProtocolFixture(t);
  const reviewFile = path.join(root, 'docs/reviews/self-review.md');
  write(root, 'docs/reviews/self-review.md',
    '# Review\n\n' +
    'Date: 2026-09-23\n' +
    'Receipt-Owner: agent-same-owner\n' +
    'Candidate session: agent-same-owner\n' +
    'Verdict: PASS\n'
  );

  const res = runTool('protocol-scope.cjs', ['--independence', reviewFile, '--cwd', root]);
  assert.equal(res.status, 1);
  assert.match(res.stdout, /Independence violation/);
  assert.match(res.stdout, /identical to candidate producer owner/);
});

test('independence check: reviewer is named as implementer in TASK.md exits 1', t => {
  const root = makeProtocolFixture(t);
  write(root, '.ai/TASK.md',
    '# Current Task\n\n' +
    '## Roles\n' +
    '- gemini: paired-cycle remediation implementer\n' +
    '- deepseek: independent adversarial reviewer\n'
  );

  const reviewFile = path.join(root, 'docs/reviews/gemini-review.md');
  write(root, 'docs/reviews/gemini-review.md',
    '# Review\n\n' +
    'Date: 2026-09-23\n' +
    'Receipt-Owner: gemini-8a06ba8cb343bedc\n' +
    'Producer: other-agent-123\n' +
    'Verdict: PASS\n'
  );

  const res = runTool('protocol-scope.cjs', ['--independence', reviewFile, '--cwd', root]);
  assert.equal(res.status, 1);
  assert.match(res.stdout, /appears as implementer \(gemini\) in \.ai\/TASK\.md roles/);
});

test('independence check: unknown owner exits 2', t => {
  const root = makeProtocolFixture(t);
  const reviewFile = path.join(root, 'docs/reviews/no-header.md');
  write(root, 'docs/reviews/no-header.md', '# Review without Receipt-Owner\n\nVerdict: PASS\n');

  const res = runTool('protocol-scope.cjs', ['--independence', reviewFile, '--cwd', root]);
  assert.equal(res.status, 2);
  assert.match(res.stderr, /Cannot determine Receipt-Owner/);
});

test('independence check: valid independent reviewer passes (exit 0)', t => {
  const root = makeProtocolFixture(t);
  write(root, '.ai/TASK.md',
    '# Current Task\n\n' +
    '## Roles\n' +
    '- gemini: paired-cycle remediation implementer\n' +
    '- deepseek: independent adversarial reviewer\n'
  );

  const reviewFile = path.join(root, 'docs/reviews/independent-review.md');
  write(root, 'docs/reviews/independent-review.md',
    '# Review\n\n' +
    'Date: 2026-09-23\n' +
    'Receipt-Owner: deepseek-59c81998639a4feb\n' +
    'Producer: gemini-8a06ba8cb343bedc\n' +
    'Verdict: PASS\n'
  );

  const res = runTool('protocol-scope.cjs', ['--independence', reviewFile, '--cwd', root]);
  assert.equal(res.status, 0);
  assert.match(res.stdout, /Independence check PASS/);
});

test('F-002: independence check is deterministic with swapped mtimes and does not rely on mtime', t => {
  const root = makeProtocolFixture(t);
  write(root, '.ai/TASK.md',
    '# Current Task\n\n' +
    '## Roles\n' +
    '- alice: implementer\n' +
    '- bob: independent reviewer\n'
  );

  const reviewFile = path.join(root, 'docs/reviews/bob-review.md');
  write(root, 'docs/reviews/bob-review.md',
    '# Review\n\n' +
    'Date: 2026-09-23\n' +
    'Receipt-Owner: bob-12345678abcdef01\n' +
    'Producer: alice-87654321fedcba09\n' +
    'Verdict: PASS\n'
  );

  const j1 = path.join(root, '.ai', 'worklog', 'alice-87654321fedcba09.md');
  const j2 = path.join(root, '.ai', 'worklog', 'alice-another.md');
  write(root, '.ai/worklog/alice-87654321fedcba09.md', '## Entry\nEvidence:\n- recorded: 2026-09-23 by alice-87654321fedcba09\n');
  write(root, '.ai/worklog/alice-another.md', '## Entry\nEvidence:\n- recorded: 2026-09-23 by alice-another\n');

  // Case 1: j1 newer than j2
  fs.utimesSync(j1, new Date('2026-09-23T10:00:00Z'), new Date('2026-09-23T10:00:00Z'));
  fs.utimesSync(j2, new Date('2026-09-23T09:00:00Z'), new Date('2026-09-23T09:00:00Z'));
  const res1 = runTool('protocol-scope.cjs', ['--independence', reviewFile, '--cwd', root]);

  // Case 2: j2 newer than j1 (swapped mtimes)
  fs.utimesSync(j1, new Date('2026-09-23T08:00:00Z'), new Date('2026-09-23T08:00:00Z'));
  fs.utimesSync(j2, new Date('2026-09-23T09:00:00Z'), new Date('2026-09-23T09:00:00Z'));
  const res2 = runTool('protocol-scope.cjs', ['--independence', reviewFile, '--cwd', root]);

  assert.equal(res1.status, 0);
  assert.equal(res2.status, 0);
  assert.equal(res1.stdout, res2.stdout);
});

test('F-002: independence check exits 2 when producer cannot be determined from declared inputs', t => {
  const root = makeProtocolFixture(t);
  write(root, '.ai/TASK.md',
    '# Current Task\n\n' +
    '## Roles\n' +
    '- alice: implementer\n' +
    '- bob: independent reviewer\n'
  );

  const reviewFile = path.join(root, 'docs/reviews/no-producer.md');
  // Review has Receipt-Owner but no Producer/Candidate header
  write(root, 'docs/reviews/no-producer.md',
    '# Review\n\n' +
    'Date: 2026-09-23\n' +
    'Receipt-Owner: bob-12345678abcdef01\n' +
    'Verdict: PASS\n'
  );

  // Even if worklog has an implementer journal, tool must NOT guess by mtime and must exit 2
  write(root, '.ai/worklog/alice-87654321fedcba09.md', '## Entry\nEvidence:\n- recorded: 2026-09-23 by alice-87654321fedcba09\n');

  const res = runTool('protocol-scope.cjs', ['--independence', reviewFile, '--cwd', root]);
  assert.equal(res.status, 2);
  assert.match(res.stderr, /Cannot determine candidate producer owner/);
});

// ---------------------------------------------------------------------------
// PROTO-DEC-0046 Remediation Tests: C01-C10 & Claude findings
// ---------------------------------------------------------------------------

test('RC-ledger-parse (C01, F-S2-01, F-S2-03): malformed shapes exit 2 in both verdict and stop-rule mode', t => {
  const root = makeProtocolFixture(t);
  const header = '| id | root-cause | requirement | paths | reproduction | exit | severity | disposition | attempt |\n|---|---|---|---|---|---|---|---|---|\n';
  const clean = '| C1 | RC1 | observed mismatch | .ai/bin/x.cjs | node probe.cjs | 0 | LOW | refuted | 1 |\n';
  const bad = '| B1 | RC1 | observed mismatch | .ai/bin/x.cjs | node probe.cjs | 1 | HIGH | confirmed | 3 |\n';

  const malformedCases = {
    'missing-leading-pipe': header + clean + bad.slice(1),
    'missing-trailing-pipe': header + clean + bad.trimEnd().slice(0, -1) + '\n',
    'blank-split': header + clean + '\n' + bad,
    'prose-split': header + clean + 'prose note\n' + bad,
    'short-row': header + clean + '| B1 | RC1 | observed mismatch | .ai/x |\n',
    'extra-cell': header + clean + bad.trimEnd() + ' extra |\n',
    'duplicate-header': header.replace(' attempt |', ' attempt | disposition |') + clean.trimEnd() + ' refuted |\n',
    'empty-exit': header + '| B1 | RC1 | req | .ai/bin/x.cjs | node probe.cjs |  | HIGH | confirmed | 1 |\n',
    'invalid-exit': header + '| B1 | RC1 | req | .ai/bin/x.cjs | node probe.cjs | banana | HIGH | confirmed | 1 |\n',
    'second-table': header + clean + '\n' + header + bad,
    'fenced-hidden-row': header + clean + '\n```markdown\n' + bad + '```\n',
  };

  for (const [name, content] of Object.entries(malformedCases)) {
    const file = path.join(root, `docs/reviews/malformed-${name}.md`);
    write(root, `docs/reviews/malformed-${name}.md`, content);

    // In verdict mode: must exit 2
    const resVerdict = runTool('protocol-verdict.cjs', [file], root);
    assert.equal(resVerdict.status, 2, `malformed case '${name}' in verdict mode must exit 2`);

    // In stop-rule mode: must exit 2
    const resStop = runTool('protocol-verdict.cjs', [file, '--stop-rule'], root);
    assert.equal(resStop.status, 2, `malformed case '${name}' in --stop-rule mode must exit 2`);
  }
});

test('RC-manifest-schema (C02): missing, empty, or wrong-type manifest keys fail closed (exit 2)', t => {
  const root = makeProtocolFixture(t);
  const header = '| id | root-cause | requirement | paths | reproduction | exit | severity | disposition | attempt |\n|---|---|---|---|---|---|---|---|---|\n';
  const row = '| F1 | RC1 | observed mismatch | validate-protocol.ps1 | node probe.cjs | 1 | LOW | confirmed | 1 |\n';
  const file = path.join(root, 'docs/reviews/test.md');
  write(root, 'docs/reviews/test.md', header + row);

  const manifestCases = {
    'malformed': '{',
    'missing-managed': JSON.stringify({ source: ['test.md'] }),
    'missing-source': JSON.stringify({ managed: ['test.md'] }),
    'empty-managed': JSON.stringify({ managed: [], source: ['test.md'] }),
    'empty-source': JSON.stringify({ managed: ['test.md'], source: [] }),
    'wrong-type': JSON.stringify({ managed: {}, source: null }),
    'empty-object': '{}',
  };

  for (const [name, jsonContent] of Object.entries(manifestCases)) {
    write(root, 'protocol-manifest.json', jsonContent);
    const res = runTool('protocol-verdict.cjs', [file], root);
    assert.equal(res.status, 2, `manifest case '${name}' must exit 2`);
    assert.match(res.stderr, /Cannot load protocol-manifest\.json at run time/);
  }
});

test('RC-manifest-root-discovery (C03): no ancestor borrowing and no nested shadowing', t => {
  const root = makeProtocolFixture(t);
  const header = '| id | root-cause | requirement | paths | reproduction | exit | severity | disposition | attempt |\n|---|---|---|---|---|---|---|---|---|\n';
  const row = '| F1 | RC1 | observed mismatch | validate-protocol.ps1 | node probe.cjs | 1 | LOW | confirmed | 1 |\n';

  // Sub-case 1: candidate git repository with no manifest inside parent repository with manifest
  const candidateDir = path.join(root, 'candidate-repo');
  fs.mkdirSync(candidateDir, { recursive: true });
  git(candidateDir, ['init', '-b', 'main']);
  write(candidateDir, 'probe.md', header + row);
  git(candidateDir, ['add', '.']);
  git(candidateDir, ['commit', '-m', 'Initial candidate commit']);

  // Candidate has no manifest. Running tool in candidateDir must NOT borrow parent root manifest.
  const resBorrow = runTool('protocol-verdict.cjs', ['probe.md'], candidateDir);
  assert.equal(resBorrow.status, 2);
  assert.match(resBorrow.stderr, /manifest file not found/);

  // Sub-case 2: nested manifest in docs/reviews/ does not shadow root manifest
  write(root, 'docs/reviews/protocol-manifest.json', '{}');
  write(root, 'docs/reviews/probe.md', header + row);
  const resShadow = runTool('protocol-verdict.cjs', ['docs/reviews/probe.md'], root);
  // Root manifest protects validate-protocol.ps1, so neutral row yields FAIL (exit 1), not RECOMMENDATION (0)
  assert.equal(resShadow.status, 1);
  assert.match(resShadow.stdout, /Verdict: FAIL/);
});

test('RC-touched-input-exemption (C04): untracked scope file on forbidden path fails scope check', t => {
  const root = makeProtocolFixture(t);
  git(root, ['add', '-A']);
  git(root, ['commit', '-m', 'Baseline']);
  const baseline = git(root, ['rev-parse', 'HEAD']).stdout.trim();

  // Create an untracked tests/scope.txt which declares src/
  write(root, 'tests/scope.txt', 'src/\n');
  const res = runTool('protocol-scope.cjs', ['--baseline', baseline, '--scope', 'tests/scope.txt', '--cwd', root]);
  assert.equal(res.status, 1);
  assert.match(res.stdout, /FORBIDDEN: tests\/scope\.txt/);
});

test('RC-owner-source-guessing (C05): producer identity only from declared inputs', t => {
  const root = makeProtocolFixture(t);
  write(root, '.ai/TASK.md', '# Current Task\n\n## Roles\n- reviewer: reviewer\n- producer: implementer\n');

  // Sub-case 1: empty candidate journal without receipt exits 2 (no basename fallback)
  write(root, 'empty-journal.md', '# Journal without evidence receipt\n');
  write(root, 'docs/reviews/empty-j.md', 'Receipt-Owner: reviewer-123\nCandidate journal: empty-journal.md\n');
  const res1 = runTool('protocol-scope.cjs', ['--independence', 'docs/reviews/empty-j.md', '--cwd', root]);
  assert.equal(res1.status, 2);

  // Sub-case 2: identities in body/fenced example only exits 2
  write(root, 'docs/reviews/body-only.md', '# Review\n\n---\n## Example\n```\nReceipt-Owner: reviewer-123\nProducer: producer-123\n```\n');
  const res2 = runTool('protocol-scope.cjs', ['--independence', 'docs/reviews/body-only.md', '--cwd', root]);
  assert.equal(res2.status, 2);

  // Sub-case 3: 40-hex SHA as candidate producer exits 2
  write(root, 'docs/reviews/sha-producer.md', 'Receipt-Owner: reviewer-123\nCandidate: b232a9e5e99b51fccf8a1ce2ccfa009c3a204bed\n');
  const res3 = runTool('protocol-scope.cjs', ['--independence', 'docs/reviews/sha-producer.md', '--cwd', root]);
  assert.equal(res3.status, 2);

  // Sub-case 4: --producer cannot override declared journal's recorded owner
  write(root, 'candidate.md', 'Evidence:\n- recorded: 2026-09-23 by reviewer-123\n');
  write(root, 'docs/reviews/journal-declared.md', 'Receipt-Owner: reviewer-123\nCandidate journal: candidate.md\n');
  const res4 = runTool('protocol-scope.cjs', ['--independence', 'docs/reviews/journal-declared.md', '--producer', 'other-456', '--cwd', root]);
  assert.equal(res4.status, 1);
  assert.match(res4.stdout, /identical to candidate producer owner/);
});

test('RC-spec-controller-omission (C06): controller role in TASK.md excluded from certifying', t => {
  const root = makeProtocolFixture(t);
  write(root, '.ai/TASK.md', '# Current Task\n\n## Roles\n- controller: coordinator and controller of this candidate\n- builder: implementer\n');
  write(root, 'docs/reviews/controller-review.md', 'Receipt-Owner: controller-12345678\nProducer: builder-12345678\n');

  const res = runTool('protocol-scope.cjs', ['--independence', 'docs/reviews/controller-review.md', '--cwd', root]);
  assert.equal(res.status, 1);
  assert.match(res.stdout, /appears as controller \(controller\) in \.ai\/TASK\.md roles/);
});

test('RC-text-as-judgement (C08): negative invariant mention is RECOMMENDATION and unrunnable test filename does not block', t => {
  const root = makeProtocolFixture(t);
  const header = '| id | root-cause | requirement | paths | reproduction | exit | severity | disposition | attempt |\n|---|---|---|---|---|---|---|---|---|\n';

  // Sub-case 1: negative-invariant-mention off protected path yields RECOMMENDATION (exit 0)
  const contentNeg = header + '| F1 | RC1 | No invariant or contract applies; optional spelling correction | docs/notes.md | node probe.cjs | 0 | LOW | confirmed | 1 |\n';
  write(root, 'docs/reviews/neg-inv.md', contentNeg);
  const resNeg = runTool('protocol-verdict.cjs', ['docs/reviews/neg-inv.md'], root);
  assert.equal(resNeg.status, 0);
  assert.match(resNeg.stdout, /Verdict: RECOMMENDATION/);

  // Sub-case 2: test filename containing 'unrunnable' with fixed-and-verified disposition is not BLOCKED
  const contentFixed = header + '| F2 | RC2 | test check | docs/notes.md | node tests/unrunnable.test.cjs | 0 | LOW | fixed-and-verified | 1 |\n';
  write(root, 'docs/reviews/fixed-unrun.md', contentFixed);
  const resFixed = runTool('protocol-verdict.cjs', ['docs/reviews/fixed-unrun.md'], root);
  assert.equal(resFixed.status, 0);
  assert.match(resFixed.stdout, /Verdict: PASS/);
});

test('RC-path-alphabet (C09): boundPaths accepts Unicode and + tokens', t => {
  const root = makeProtocolFixture(t);
  write(root, 'docs/a+name.md', 'content\n');
  write(root, 'docs/источник.md', 'content\n');

  const indexTool = require('../.ai/bin/protocol-index.cjs');
  const tokens = indexTool.boundPaths(['`docs/a+name.md` `docs/источник.md` `docs/reviews/*.md` `<prompt>.md`'], root);
  assert.ok(tokens.includes('docs/a+name.md'), 'must include path with + token');
  assert.ok(tokens.includes('docs/источник.md'), 'must include path with Unicode token');
  assert.ok(!tokens.includes('<prompt>.md'), 'must not include placeholder <prompt>.md');
});

test('RC-absolute-diagnostics (C10): scope error output uses repo-relative path', t => {
  const root = makeProtocolFixture(t);
  git(root, ['add', '-A']);
  git(root, ['commit', '-m', 'Baseline']);
  const baseline = git(root, ['rev-parse', 'HEAD']).stdout.trim();

  const res = runTool('protocol-scope.cjs', ['--baseline', baseline, '--scope', 'absent.txt', '--cwd', root]);
  assert.equal(res.status, 2);
  assert.match(res.stderr, /Scope file not found: absent\.txt/);
  // Ensure no absolute drive path is embedded
  assert.ok(!res.stderr.includes(root), 'error message must not embed absolute checkout path');
});

// ---------------------------------------------------------------------------
// Round 3 Remediation Tests: F-R2-01..F-R2-04 and Codex Observations
// ---------------------------------------------------------------------------

test('RC-ledger-parse (F-R2-01, attempt 2 of 2): framed rows, list items, inline code, fenced blocks outside table and prose before header exit 2', t => {
  const root = makeProtocolFixture(t);
  const header = '| id | root-cause | requirement | paths | reproduction | exit | severity | disposition | attempt |\n|---|---|---|---|---|---|---|---|---|\n';
  const row = '| F1 | RC1 | observed mismatch | .ai/bin/x.cjs | node probe.cjs | 1 | LOW | confirmed | 1 |\n';
  const cleanRow = '| F0 | RC0 | observed mismatch | docs/notes.md | none | n/a | LOW | refuted | 1 |\n';

  const negativeCases = {
    // 1. Framed row above the header
    'framed-above-header': '# Title\n\n' + row + '\n' + header + cleanRow,
    // 2. List item above the table
    'list-above-header': '# Title\n\n- ' + row + '\n' + header + cleanRow,
    // 3. List item below the table
    'list-below-table': '# Title\n\n' + header + cleanRow + '\n- ' + row,
    // 4. Inline code above the table
    'inline-code-above-header': '# Title\n\n`' + row.trim() + '`\n\n' + header + cleanRow,
    // 5. Inline code below the table
    'inline-code-below-table': '# Title\n\n' + header + cleanRow + '\n`' + row.trim() + '`\n',
    // 6. Fenced code block above the table
    'fenced-above-header': '# Title\n\n```text\n' + row + '```\n\n' + header + cleanRow,
    // 7. Fenced code block below the table
    'fenced-below-table': '# Title\n\n' + header + cleanRow + '\n```text\n' + row + '```\n',
    // 8. Prose before the header
    'prose-before-header': '# Title\n\nExplanatory prose note before the table header.\n\n' + header + cleanRow,
    // 9. Codex's list-hidden form (no outer pipes inside list)
    'codex-list-hidden': '# Title\n\n' + header + cleanRow + '- ' + row.trim().slice(2, -2) + '\n',
    // 10. Codex's inline-code-hidden form (no outer pipes inside inline code)
    'codex-inline-code-hidden': '# Title\n\n' + header + cleanRow + '`' + row.trim().slice(2, -2) + '`\n',
    // 11. Codex's heading-hidden form
    'codex-heading-hidden': '# Title\n\n' + header + cleanRow + '# ' + row.trim().slice(2, -2) + '\n',
  };

  for (const [name, content] of Object.entries(negativeCases)) {
    const file = path.join(root, `docs/reviews/neg-${name}.md`);
    write(root, `docs/reviews/neg-${name}.md`, content);

    // In verdict mode: must exit 2
    const resVerdict = runTool('protocol-verdict.cjs', [file], root);
    assert.equal(resVerdict.status, 2, `negative case '${name}' in verdict mode must exit 2, got ${resVerdict.status} (${resVerdict.stderr || resVerdict.stdout})`);

    // In stop-rule mode: must exit 2
    const resStop = runTool('protocol-verdict.cjs', [file, '--stop-rule'], root);
    assert.equal(resStop.status, 2, `negative case '${name}' in --stop-rule mode must exit 2, got ${resStop.status} (${resStop.stderr || resStop.stdout})`);
  }
});

test('RC-attempt-contiguity (F-R2-03, attempt 1): cross-file counting, union contiguity, duplicate merging, and conflict detection', t => {
  const root = makeProtocolFixture(t);
  const header = '| id | root-cause | requirement | paths | reproduction | exit | severity | disposition | attempt |\n|---|---|---|---|---|---|---|---|---|\n';

  // Sub-case 1: single file starting at attempt 2 without attempt 1 exits 2
  const ledgerGapStart = header + '| F1 | RC-gap | requirement | docs/notes.md | none | n/a | LOW | confirmed | 2 |\n';
  write(root, 'docs/reviews/gap-start-findings.md', ledgerGapStart);
  const resGapStart = runTool('protocol-verdict.cjs', ['docs/reviews/gap-start-findings.md', '--stop-rule'], root);
  assert.equal(resGapStart.status, 2, 'sequence starting at 2 without 1 must exit 2');
  assert.match(resGapStart.stderr, /non-contiguous attempts/);
  fs.unlinkSync(path.join(root, 'docs/reviews/gap-start-findings.md'));

  // Sub-case 2: sequence with gaps {1, 3} exits 2
  const ledgerGapMid = header +
    '| F1 | RC-mid | requirement | docs/notes.md | none | n/a | LOW | confirmed | 1 |\n' +
    '| F2 | RC-mid | requirement | docs/notes.md | none | n/a | LOW | confirmed | 3 |\n';
  write(root, 'docs/reviews/gap-mid-findings.md', ledgerGapMid);
  const resGapMid = runTool('protocol-verdict.cjs', ['docs/reviews/gap-mid-findings.md', '--stop-rule'], root);
  assert.equal(resGapMid.status, 2, 'sequence {1, 3} must exit 2');
  assert.match(resGapMid.stderr, /non-contiguous attempts/);
  fs.unlinkSync(path.join(root, 'docs/reviews/gap-mid-findings.md'));

  // Sub-case 3: cross-file union: file A has attempt 1, file B has attempt 2 -> union {1, 2} contiguous exits 0
  const fileA = header + '| F1 | RC-cross | requirement | docs/notes.md | none | n/a | LOW | fixed-and-verified | 1 |\n';
  const fileB = header + '| F2 | RC-cross | requirement | docs/notes.md | none | n/a | LOW | fixed-and-verified | 2 |\n';
  write(root, 'docs/reviews/a-findings.md', fileA);
  write(root, 'docs/reviews/b-findings.md', fileB);
  const resCross = runTool('protocol-verdict.cjs', ['docs/reviews/b-findings.md', '--stop-rule'], root);
  assert.equal(resCross.status, 0, 'cross-file union {1, 2} must satisfy stop rule');
  assert.match(resCross.stdout, /Root-cause stop rule satisfied/);

  // Sub-case 4: duplicate (root-cause, attempt) across files with identical disposition is merged
  const fileC = header +
    '| F1 | RC-cross | requirement | docs/notes.md | none | n/a | LOW | fixed-and-verified | 1 |\n' +
    '| F2 | RC-cross | requirement | docs/notes.md | none | n/a | LOW | fixed-and-verified | 2 |\n';
  write(root, 'docs/reviews/c-findings.md', fileC);
  const resMerge = runTool('protocol-verdict.cjs', ['docs/reviews/c-findings.md', '--stop-rule'], root);
  assert.equal(resMerge.status, 0, 'identical duplicate across files must be merged and pass');

  // Sub-case 5: duplicate (root-cause, attempt) across files with conflicting disposition exits 2
  const fileConflict = header + '| F1 | RC-cross | requirement | docs/notes.md | none | n/a | LOW | refuted | 1 |\n';
  write(root, 'docs/reviews/conflict-findings.md', fileConflict);
  const resConflict = runTool('protocol-verdict.cjs', ['docs/reviews/conflict-findings.md', '--stop-rule'], root);
  assert.equal(resConflict.status, 2, 'conflicting dispositions for same (root-cause, attempt) must exit 2');
  assert.match(resConflict.stderr, /conflicting dispositions/);
});

test('RC-role-prose-substring (F-R2-02, attempt 1): exact tokens and negation guard', t => {
  const root = makeProtocolFixture(t);
  const { checkIndependence, extractExcludedRole } = scopeTool;

  // Unit tests on extractExcludedRole
  // 1. Excluded roles match
  assert.equal(extractExcludedRole('author'), 'author');
  assert.equal(extractExcludedRole('executor'), 'executor');
  assert.equal(extractExcludedRole('controller'), 'controller');
  assert.equal(extractExcludedRole('coordinator'), 'coordinator');
  assert.equal(extractExcludedRole('implementer'), 'implementer');
  assert.equal(extractExcludedRole('member of the executing pair'), 'member of the executing pair');
  assert.equal(extractExcludedRole('executing pair'), 'member of the executing pair');

  // 2. Negated roles do NOT match
  assert.equal(extractExcludedRole('independent certifier; not author or controller'), null);
  assert.equal(extractExcludedRole('neither authored nor controlled this candidate'), null);
  assert.equal(extractExcludedRole('independent of author, controller, or implementer'), null);
  assert.equal(extractExcludedRole('never an author or executor'), null);
  assert.equal(extractExcludedRole('standing default certifier. Fills the first of the two independent reviewer slots required by PROTO-DEC-0041 item 2, for any candidate it neither authored nor controlled'), null);

  // 3. Mixed roles: implementer with negated author matches implementer
  assert.equal(extractExcludedRole('implementer; not author'), 'implementer');

  // Integration test with checkIndependence
  const taskContent = '# Current Task\n\n## Roles\n\n' +
    '- rev-author: author\n' +
    '- rev-executor: executor\n' +
    '- rev-controller: controller\n' +
    '- rev-coord: coordinator\n' +
    '- rev-impl: implementer\n' +
    '- rev-pair: member of the executing pair\n' +
    '- rev-indep: independent certifier; not author or controller\n' +
    '- claude: standing default certifier. Fills the first of the two independent reviewer slots required by PROTO-DEC-0041 item 2, for any candidate it neither authored nor controlled\n';
  write(root, '.ai/TASK.md', taskContent);

  const testReviewer = (owner, expectedExit) => {
    const revFile = `docs/reviews/rev-${owner}.md`;
    write(root, revFile, `# Review\n\nReceipt-Owner: ${owner}-123\nProducer: builder-456\nVerdict: PASS\n`);
    const res = runTool('protocol-scope.cjs', ['--independence', revFile, '--cwd', root]);
    assert.equal(res.status, expectedExit, `reviewer '${owner}' expected exit ${expectedExit}, got ${res.status}`);
  };

  testReviewer('rev-author', 1);
  testReviewer('rev-executor', 1);
  testReviewer('rev-controller', 1);
  testReviewer('rev-coord', 1);
  testReviewer('rev-impl', 1);
  testReviewer('rev-pair', 1);
  testReviewer('rev-indep', 0);
  testReviewer('claude', 0);
});

test('RC-arg-parsing (F-R2-04, attempt 1): unknown flags exit 2 on both tools', t => {
  const root = makeProtocolFixture(t);
  const ledgerFile = 'docs/reviews/test-findings.md';
  const header = '| id | root-cause | requirement | paths | reproduction | exit | severity | disposition | attempt |\n|---|---|---|---|---|---|---|---|---|\n';
  write(root, ledgerFile, header + '| F1 | RC | req | docs/notes.md | none | n/a | LOW | fixed-and-verified | 1 |\n');

  // protocol-verdict.cjs
  const resV1 = runTool('protocol-verdict.cjs', [ledgerFile, '--typo-flag'], root);
  assert.equal(resV1.status, 2, 'protocol-verdict unknown flag must exit 2');
  assert.match(resV1.stderr, /Unrecognised CLI flag/);

  const resV2 = runTool('protocol-verdict.cjs', [ledgerFile, '--forbiden'], root);
  assert.equal(resV2.status, 2, 'protocol-verdict unknown flag must exit 2');
  assert.match(resV2.stderr, /Unrecognised CLI flag/);

  // protocol-scope.cjs
  const revFile = 'docs/reviews/test-rev.md';
  write(root, revFile, '# Review\n\nReceipt-Owner: reviewer-123\nProducer: builder-456\nVerdict: PASS\n');

  const resS1 = runTool('protocol-scope.cjs', ['--independence', revFile, '--typo-flag', '--cwd', root]);
  assert.equal(resS1.status, 2, 'protocol-scope unknown flag must exit 2');
  assert.match(resS1.stderr, /Unrecognised CLI flag/);

  const resS2 = runTool('protocol-scope.cjs', ['--independence', revFile, '--forbiden', 'x', '--cwd', root]);
  assert.equal(resS2.status, 2, 'protocol-scope unknown flag must exit 2');
  assert.match(resS2.stderr, /Unrecognised CLI flag/);
});

test('Codex observations (C05): candidate journal fenced blocks and commit SHA owners fail closed', t => {
  const root = makeProtocolFixture(t);

  // Sub-case 1: Journal with Evidence block ONLY inside fenced code block exits 2
  const journalFenced = '# Journal\n\n```text\nEvidence:\n- recorded: 2026-09-23 by builder-123\n```\n';
  write(root, '.ai/worklog/fenced-journal.md', journalFenced);
  const revFenced = '# Review\n\nReceipt-Owner: reviewer-123\nCandidate journal: .ai/worklog/fenced-journal.md\nVerdict: PASS\n';
  write(root, 'docs/reviews/rev-fenced.md', revFenced);
  const resFenced = runTool('protocol-scope.cjs', ['--independence', 'docs/reviews/rev-fenced.md', '--cwd', root]);
  assert.equal(resFenced.status, 2, 'evidence inside fenced code block must not be parsed as valid owner');

  // Sub-case 2: Journal with 40-hex commit SHA as evidence owner exits 2
  const sha = 'a'.repeat(40);
  const journalSha = `# Journal\n\nEvidence:\n- recorded: 2026-09-23 by ${sha}\n`;
  write(root, '.ai/worklog/sha-journal.md', journalSha);
  const revSha = '# Review\n\nReceipt-Owner: reviewer-123\nCandidate journal: .ai/worklog/sha-journal.md\nVerdict: PASS\n';
  write(root, 'docs/reviews/rev-sha.md', revSha);
  const resSha = runTool('protocol-scope.cjs', ['--independence', 'docs/reviews/rev-sha.md', '--cwd', root]);
  assert.equal(resSha.status, 2, '40-hex SHA in journal must not be accepted as owner');

  // Sub-case 3: Journal with fenced example followed by actual entry parses actual entry (catches same owner -> exit 1)
  const journalMulti = '# Journal\n\n```text\nEvidence:\n- recorded: 2026-09-23 by builder-123\n```\n\n## Actual Entry\n\nEvidence:\n- recorded: 2026-09-23 by reviewer-123\n';
  write(root, '.ai/worklog/multi-journal.md', journalMulti);
  const revMulti = '# Review\n\nReceipt-Owner: reviewer-123\nCandidate journal: .ai/worklog/multi-journal.md\nVerdict: PASS\n';
  write(root, 'docs/reviews/rev-multi.md', revMulti);
  const resMulti = runTool('protocol-scope.cjs', ['--independence', 'docs/reviews/rev-multi.md', '--cwd', root]);
  assert.equal(resMulti.status, 1, 'actual entry outside fence must be parsed, catching reviewer == producer');
});
