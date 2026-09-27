# Stage 10 targeted repair report (round 3): PKG-2 RUN-RECORD

- Mode: ADVISORY
- Baseline: b8781ca6fc9d854786cbd7ffc656b8b3c0c2bcde (CANDIDATE commit); working tree status: dirty
- Reviewer: Gemini 3.8 Flash, route agy, effort high
- Date: 2026-09-27
- Frame: `task:ownerideas-r9e-repair-pkg2-r3` (parent program: `ownerideas-revision`)
- Scope: targeted repair round 3 of residual PKG-2 findings F-PKG2-R2-1 through F-PKG2-R2-4 from MiMo round 2 certification (`round8/CERT-MIMO-PKG2-R2.md`)
- Verdict: REPAIR COMPLETE

---

## 1. Findings and Resolution Matrix

| # | Finding & Source | Package Item | Reproduction Before | Minimal Change | Reproduction After |
|---|---|---|---|---|---|
| 1 | **F-PKG2-R2-1**: Render headers violate S4 (`round8/CERT-MIMO-PKG2-R2.md:41`) | PKG-2 S4, AC-7 | `node -e "const{renderUsage,readRecords}=require('./.ai/bin/protocol-runrecord.cjs');console.log(renderUsage(readRecords('tests/fixtures/runrecord/golden.jsonl')).split('\n')[0])"`<br>Emitted: `\| Run \| Slot \| Selection \| Client \| Model \| Effort \| Fresh/Resume \| Wall min \| Tokens in/out \| Cost \| State \|`<br>Render headers used `'Model'` and `'Effort'` instead of S4 specification `'Model ran'` and `'Effort used'`. | In `.ai/bin/protocol-runrecord.cjs:926`: updated `headers` array to `['Run', 'Slot', 'Selection', 'Client', 'Model ran', 'Effort used', 'Fresh/Resume', 'Wall min', 'Tokens in/out', 'Cost', 'State']`. | `node -e "const{renderUsage,readRecords}=require('./.ai/bin/protocol-runrecord.cjs');console.log(renderUsage(readRecords('tests/fixtures/runrecord/golden.jsonl')).split('\n')[0])"`<br>Emits: `\| Run \| Slot \| Selection \| Client \| Model ran \| Effort used \| Fresh/Resume \| Wall min \| Tokens in/out \| Cost \| State \|`<br>Matches PKG-2 S4 exactly. |
| 2 | **F-PKG2-R2-2**: `validate` omits required `VALID line=` rows (`round8/CERT-MIMO-PKG2-R2.md:50`) | PKG-2 S5, AC-9 | `node .ai/bin/protocol-runrecord.cjs validate tests/fixtures/runrecord/golden.jsonl`<br>Emitted: `SUMMARY records=2 invalid=0`<br>Exit code 0, but zero `VALID` rows. CLI handler previously called `readRecords` and only printed the final `SUMMARY` row. | In `.ai/bin/protocol-runrecord.cjs`: updated `case 'validate':` to inspect input file line-by-line, emitting `VALID line=<n> runId=<id>` for valid records, emitting `INVALID line=<n> error="<msg>"` (one per problem) for invalid records or syntax errors, and printing `SUMMARY records=<n> invalid=<m>`, exiting 0 if m=0 else 2. | `node .ai/bin/protocol-runrecord.cjs validate tests/fixtures/runrecord/golden.jsonl`<br>Emits:<br>`VALID line=1 runId=R-20260926T123940Z-r6-claude-final`<br>`VALID line=2 runId=R-20260926T123940Z-r6-claude-final`<br>`SUMMARY records=2 invalid=0`<br>Exit code: 0. |
| 3 | **F-PKG2-R2-3**: No golden Markdown equality check in T13 (`round8/CERT-MIMO-PKG2-R2.md:59`) | PKG-2 AC-7 | In `tests/runrecord.test.cjs`, `testT13_RenderGoldenTable` only asserted `rendered.includes(...)`. There was no committed golden Markdown table fixture and no byte- or line-equality check. | 1. Created committed golden Markdown table fixture `tests/fixtures/runrecord/golden.md` containing the exact expected rendered table matching `golden.jsonl` (with LF line endings, no BOM).<br>2. Updated T13 in `tests/runrecord.test.cjs` to load `golden.md` and assert exact byte/line equality (`assert.strictEqual(rendered, goldenMd)`). | `testT13_RenderGoldenTable` asserts byte-for-byte equality against `tests/fixtures/runrecord/golden.md` and passes with exit code 0. |
| 4 | **F-PKG2-R2-4**: Tests do not pattern-check CLI stdout; `printUsage` help body fails pattern (`round8/CERT-MIMO-PKG2-R2.md:61`) | PKG-2 AC-9, S5, `bin-output-schema.md` | `testPattern_validate` in `tests/runrecord.test.cjs` only exercised in-memory library functions without capturing CLI stdout against `^[A-Z][A-Z_]*( \|$)`. Running `node .ai/bin/protocol-runrecord.cjs` with no arguments printed multi-line uncapitalized help (`Commands:`, indented commands, `Exit codes:`, `  0: ok`) which violates `^[A-Z][A-Z_]*( \|$)`. | 1. In `.ai/bin/protocol-runrecord.cjs`: updated `printUsage()` to emit a conforming single line `USAGE command=[validate\|append\|render\|sessions] syntax="node .ai/bin/protocol-runrecord.cjs <command> [args]"` (matches `^[A-Z][A-Z_]*( \|$)`, exits 2).<br>2. In `tests/runrecord.test.cjs`: added helper `runCli` and `assertCliPattern` verifying that all non-empty stdout lines match `/^[A-Z][A-Z_]*( \|$)/`.<br>3. Added `testCliPattern_AllCommands` testing all CLI commands (`no-args`, `unknown-command`, `validate` valid & invalid, `append` valid & invalid, `render --out`, `sessions`), verifying exact S5 exit codes and token pattern conformance. | `node .ai/bin/protocol-runrecord.cjs` exits 2 emitting a conforming `USAGE ` row. `testCliPattern_AllCommands` passes all CLI command checks. All CLI stdout lines match `/^[A-Z][A-Z_]*( \|$)/`. |

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
# T13 PASS: Render produces valid markdown table with DONE and FAILED records matching golden.md
# T14 PASS: sessions on synthetic fixture prints ratio=2.96
# PATTERN VALIDATE PASS: library functions produce correct output and verify pins
# CLI PATTERN PASS: every CLI stdout line matches ^[A-Z][A-Z_]*( |$) and exits follow S5
# All T1-T14 tests passed!
# AC-1 through AC-10 checks: PASS
# Subtest: tests\runrecord.test.cjs
ok 1 - tests\runrecord.test.cjs
  ---
  duration_ms: 1261.4514
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
# duration_ms 1270.7384
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
Exit code: 0 (measured live telemetry ratio: 6.04)

### 4. Package test suites
- `node --test tests/dispatch.test.cjs` -> exit 0 (23/23 pass)
- `node --test tests/resolver.test.cjs` -> exit 0 (7/7 pass)
- `node --test tests/signals.test.cjs` -> exit 0 (9/9 pass)

### 5. `powershell -ExecutionPolicy Bypass -File .\validate-protocol.ps1`
```
Protocol OK. 1 warning(s).
```
Exit code: 0 (1 warning on worklog count 139 > cap 100, WARN-first per PROTO-DEC-0057)

---

## 3. Touched Files Summary

- `.ai/bin/protocol-runrecord.cjs`: updated render table headers to `'Model ran'` and `'Effort used'` (S4); updated `printUsage()` to single conforming `USAGE ` row; updated `validate` CLI handler to print `VALID line=<n> runId=<id>` / `INVALID line=<n> error="..."` per problem and `SUMMARY records=<n> invalid=<m>`.
- `tests/fixtures/runrecord/golden.md`: created committed golden Markdown table fixture matching `golden.jsonl` render with LF endings and no BOM.
- `tests/runrecord.test.cjs`: updated T13 to assert exact byte-for-byte equality against `golden.md`; added `runCli`, `assertCliPattern`, and `testCliPattern_AllCommands` verifying AC-9 `^[A-Z][A-Z_]*( |$)` token format and S5 exit codes across all commands.
- `docs/research/2026-09-26-ownerideas-revision/round9/REPAIR-PKG2-R3-GEMINI.md`: this repair report.
- `.ai/worklog/gemini-504809281e1dcdbc.md`: session journal.

No writes outside PKG-2's allowed paths and this report/journal. No commits, tags, pushes or branches.
