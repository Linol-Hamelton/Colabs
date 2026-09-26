# Stage 10 targeted repair report: PKG-2 RUN-RECORD

- Mode: ADVISORY
- Baseline: f3ab4b8b299c3fc783d9b6e22b61d1cdcfb15dcc (CANDIDATE commit); working tree status: dirty
- Reviewer: Gemini 3.8 Flash, route agy, effort high
- Date: 2026-09-27
- Frame: `task:ownerideas-r9d-repair-pkg2` (parent program: `ownerideas-revision`)
- Scope: targeted repair of PKG-2 findings F-PKG2-1 and F-PKG2-2 from MiMo certification round 1 (`round8/CERT-MIMO.md`)
- Verdict: REPAIR COMPLETE

---

## 1. Findings and Resolution Matrix

| # | Finding & Source | Package Item | Reproduction Before | Minimal Change | Reproduction After |
|---|---|---|---|---|---|
| 1 | **F-PKG2-1**: Golden pins invented, not verified against git (`round8/CERT-MIMO.md`, PKG-2 S3 pins) | PKG-2 S1/S3 pins, AC-1, AC-2 | `git rev-parse fd789ac` gives `fd789acdb6558400576644822622544c41296980`. `golden.jsonl` and `pattern-test.jsonl` held invented head `fd789ac0d8e5b36a1b2c3d4e5f6a7b8c9d0e1f2a`; `git cat-file -t` failed with `fatal: git cat-file: could not get object info`. `launchSha256` in `golden.jsonl` was `206f3411...` and in `pattern-test.jsonl` was `c3122761...` (hash of literal dummy string `'launch-file-content'`). Neither matched the real repository object at `fd789ac:docs/research/2026-09-26-ownerideas-revision/prompts/run/r6-claude-final.md` (git blob `dbac63f4366b5c04358274ed500238dbcf823bb3`, 1147 bytes LF, SHA-256 `8bcb2e8ddb8708f70ea043a3758680da2fc5d8106a3c8205391fe957c9da59a5`). `tests/runrecord.test.cjs` used literal string `'launch-file-content'` and never verified pins against git repository objects. | 1. Implemented `verifyPinsAgainstRepo(pins)` in `tests/runrecord.test.cjs` which verifies `git cat-file -t <head>` exits 0 with `'commit'` and computes SHA-256 of `git cat-file -p <head>:<launchFile>` comparing against `pins.launchSha256`. Added negative test `testPinVerification_Negative` asserting that invented heads and mismatched launch hashes are rejected.<br>2. Derived `REPO_PINS` from real git objects at `fd789ac`: `head = 'fd789acdb6558400576644822622544c41296980'`, `launchFile = 'docs/research/2026-09-26-ownerideas-revision/prompts/run/r6-claude-final.md'`, `launchSha256 = '8bcb2e8ddb8708f70ea043a3758680da2fc5d8106a3c8205391fe957c9da59a5'`.<br>3. Regenerated `tests/fixtures/runrecord/golden.jsonl` and `tests/fixtures/runrecord/pattern-test.jsonl` with real repository pins.<br>4. *Note on MiMo's citation*: MiMo cited `f500344c8b0bcf1736f9a23e84239862c095aa60f8065982863ad5e7c521959c` by piping `git show` through Windows PowerShell 5.1, which converted LF to CRLF (1163 bytes). The canonical in-repository object `dbac63f4...` holds LF line endings (1147 bytes per AGENTS.md §11), whose SHA-256 is `8bcb2e8ddb8708f70ea043a3758680da2fc5d8106a3c8205391fe957c9da59a5`. | `verifyPinsAgainstRepo` runs on all fixture records and passes. `testPinVerification_Negative` verifies that invented heads and launch hashes are rejected. `node --test tests/runrecord.test.cjs` exits 0. |
| 2 | **F-PKG2-2**: AC-1 golden DONE record missing (`round8/CERT-MIMO.md`, PKG-2 AC-1) | PKG-2 AC-1, Golden corpus | `tests/fixtures/runrecord/golden.jsonl` held only 1 line: the FAILED two-attempt record (`state: "FAILED"`, `supervisorDone: false`). The required golden valid DONE record (one fresh attempt, state DONE, every completion field true) was missing. `tests/runrecord.test.cjs` T1 tested only the in-memory FAILED record. | 1. Added `GOLDEN_DONE_RECORD` meeting AC-1 (one fresh attempt, state DONE, every completion field true, real repository pins, valid evidence path, output path matching slot `r6-claude-final`).<br>2. Preserved `PAST_FAILURE_RECORD` (real past failure row from `USAGE.md` at `8fca7ae`, two fresh primary attempts, FAILED, real repository pins).<br>3. Regenerated `tests/fixtures/runrecord/golden.jsonl` to hold both records: line 1 = golden valid DONE record; line 2 = real past failure record.<br>4. Updated `tests/runrecord.test.cjs` T1 to validate both records in memory and on disk via `readRecords(goldenFile)`, verifying pins against repository, and asserting exact serialization match for both records.<br>5. Updated T13 (`testT13_RenderGoldenTable`) to render both `PAST_FAILURE_RECORD` (FAILED) and `GOLDEN_DONE_RECORD` (DONE), verifying table formatting for both states. | `node .ai/bin/protocol-runrecord.cjs validate tests/fixtures/runrecord/golden.jsonl` reports `SUMMARY records=2 invalid=0` (exit code 0). `node --test tests/runrecord.test.cjs` passes all tests with exit code 0. |

---

## 2. Validation Commands and Real Outputs

### 1. `node --test tests/runrecord.test.cjs`
```
TAP version 13
# Starting PKG-2 runrecord tests...
# T1 PASS: Golden DONE record and past failure record validate, verify pins against repository, and serialize to fixed bytes
# PIN NEGATIVE PASS: invented head and launchSha256 rejected by repository verification
# T2 PASS: Extra key rejected
# T3 PASS: Missing required key rejected
# T4 PASS: Wrong enum rejected
# T5 PASS: Wrong type rejected
# T6 PASS: Wrong key order rejected
# T7 PASS: Wrong schema rejected
# T8 PASS: Empty attempts array rejected
# T9 PASS: DONE with invalid completion rejected
# T10a PASS: Budget over-run detected (3 primary fresh)
# T10b PASS: Budget over-run detected (7 fresh attempts)
# T11a PASS: tokens.source=none with number rejected
# T11b PASS: end before start rejected (BACKLOG S-6 regression)
# T12 PASS: readRecords names the invalid line
# T12b PASS: appendRecord writes nothing on invalid record
# T13 PASS: Render produces valid markdown table with DONE and FAILED records
# T14 PASS: sessions on synthetic fixture prints ratio=2.96
# PATTERN VALIDATE PASS: library functions produce correct output and verify pins
# All T1-T14 tests passed!
# AC-1 through AC-10 checks: PASS
# Subtest: tests\runrecord.test.cjs
ok 1 - tests\runrecord.test.cjs
  ---
  duration_ms: 753.2367
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 759.1615
```
Exit code: 0

### 2. `node .ai/bin/protocol-runrecord.cjs validate tests/fixtures/runrecord/golden.jsonl`
```
VALID line=1 runId=R-20260926T123940Z-r6-claude-final
VALID line=2 runId=R-20260926T123940Z-r6-claude-final
SUMMARY records=2 invalid=0
```
Exit code: 0

### 3. `node .ai/bin/protocol-runrecord.cjs sessions`
```
SUMMARY rows=284 sessions=47 ratio=6.04
```
Exit code: 0

### 4. Package test suites
- `node --test tests/dispatch.test.cjs` -> exit 0 (23/23 pass)
- `node --test tests/resolver.test.cjs` -> exit 0 (7/7 pass)
- `node --test tests/signals.test.cjs` -> exit 0 (9/9 pass)

### 5. `powershell -ExecutionPolicy Bypass -File .\validate-protocol.ps1`
```
Protocol OK. 1 warning(s).
```
Exit code: 0 (1 warning: worklog count 137 > cap 100, WARN-first per PROTO-DEC-0057)

---

## 3. Touched Files Summary

- `tests/fixtures/runrecord/golden.jsonl`: updated pins to real git objects (`head = fd789acdb6558400576644822622544c41296980`, `launchSha256 = 8bcb2e8ddb8708f70ea043a3758680da2fc5d8106a3c8205391fe957c9da59a5`), added line 1 golden valid DONE record alongside line 2 real past failure record.
- `tests/fixtures/runrecord/pattern-test.jsonl`: updated pins to real git objects.
- `tests/runrecord.test.cjs`: added repository pin verification (`verifyPinsAgainstRepo`), negative pin verification test (`testPinVerification_Negative`), golden valid DONE record (`GOLDEN_DONE_RECORD`), disk fixture check of both records in T1, and dual state rendering test in T13.
- `docs/research/2026-09-26-ownerideas-revision/round9/REPAIR-PKG2-GEMINI.md`: this repair report.
- `.ai/worklog/gemini-573e1c9757d07529.md`: session journal.

No writes outside PKG-2's allowed paths and this report/journal. No commits, tags, pushes or branches.
