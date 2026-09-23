# Claude Opus - v1.9.5 Delta Re-Certification

**Date**: 2026-09-19  
**Reviewed commit**: 1fb0580908a3aa31e0756fea5f27879651aadc61  
**Working tree**: dirty (untracked new journal `claude-b738c7f405ed7dc3.md`)  
**Reviewer**: Claude Opus 4.6 (Thinking) via Antigravity  
**Scope**: delta certification | findings closure | regression  
**Verdict**: PASS  
**Mode**: CERTIFYING  
**Receipt-Owner**: claude-opus-0f1b841e5c4c6638  
**Receipt**: verifiable via `node .ai/bin/protocol-handoff.cjs verify --owner claude-opus-0f1b841e5c4c6638 --deep`  

---

## Executive Summary

Delta re-certification of release candidate `1fb0580` (the Item 6 remediation commit). All four findings from the initial certification (`docs/reviews/2026-09-19-claude-opus-v1.9.5-certification.md`, verdict RECOMMENDATION) are confirmed closed by independent live negative tests. AUD-C1 (missing unified-prompt phrase) is also confirmed closed. The full regression suite passes **241/241** tests. The validator passes with **0 failures, 1 warning** (32 journals; process state, not a code defect). No new release-blocking defects found. Verdict: **PASS**.

---

## Scope and Evidence

- **Baseline Commit**: `47cf55f` (pre-remediation)
- **Reviewed Commit**: `1fb0580908a3aa31e0756fea5f27879651aadc61` (HEAD)
- **Working Tree State**: `dirty` (untracked journal only)
- **Commands & Tests Executed**:
  - `powershell -ExecutionPolicy Bypass -File .\validate-protocol.ps1` → Exit 0 (0 failures, 1 warning: 32 journals)
  - `powershell -ExecutionPolicy Bypass -File .\test-protocol.ps1` → Exit 0 (241/241 tests pass, 110.9s)
  - `node --test tests/registry.test.cjs` → 8/8 pass (includes test 8: case-mutation probe)
  - `node --test tests/gate.test.cjs` → 16/16 pass (includes tests 12-15: F-002/F-004 probes)
  - `node --test tests/session.test.cjs` → 33/33 pass (includes isSessionAlive 6-state spec with PID ≤ 4)
  - Custom delta probe suite (6 tests, all pass): F-001 case-mutation → 3 WARNs, F-002a header-scoped Date, F-002b body-only Date, F-003 PID 4 unusable, F-004 boundary-aware citation, AUD-C1 end-to-end
- **Environment**: Windows 11, Node.js v22.21.0, PowerShell 5.1, Git 2.53.0

---

## Findings Closure

| Id | Original Severity | Title | Closure Status | Evidence |
|---|---|---|---|---|
| F-001 | MEDIUM | Registry immutability uses case-insensitive comparison | **CLOSED** | Case-mutated row produces 3 WARNs |
| F-002 | MEDIUM | gate-check Date regex matches body lines | **CLOSED** | Header-scoped extraction; body Date ignored |
| F-003 | LOW | isSessionAlive accepts reserved PID ≤ 4 | **CLOSED** | `checkProcessAlive(4)` → `false` |
| F-004 | LOW | gate-check journal path uses unanchored substring | **CLOSED** | `.bak` citation rejected; exact passes |
| AUD-C1 | — | Prompt missing unified-prompt phrase | **CLOSED** | Validator basic check passes on Completed task |

---

### F-001 — CLOSED — Case-sensitive registry comparison

- **Fix**: `validate-protocol.ps1` now uses `Dictionary[string,bool](Ordinal)` for `$seen`, `HashSet[string](Ordinal)` for `$regIdSet`, and `-cne` for positional row comparison.
- **Negative test**: A committed registry row mutated from `DEC-0001 | accepted` to `dec-0001 | ACCEPTED` produces exactly three warnings:
  ```
  [WARN] decision registry missing entry for decision DEC-0001
  [WARN] decision registry contains unknown decision dec-0001
  [WARN] docs/decisions/REGISTRY.md modified or removed existing rows from HEAD
  ```
  Validator exits 0 with 3 warnings. Before the fix, this mutation passed silently.
- **Regression**: Full registry suite (8/8) passes; complete valid registry produces 0 warnings.

---

### F-002 — CLOSED — Header-scoped Date extraction

- **Fix**: `protocol-handoff.cjs:gateCheck` now defines a deterministic header region (text before the first `---` separator, else before the first `## ` heading, else the whole file). All five field regexes (`Mode`, `Verdict`, `Date`, `Receipt-Owner`, `Receipt`) are scoped to this header region.
- **Negative test (a)**: Review with header `Date: 2026-09-25` (new review, > cutoff) and body `Date: 2026-01-01` after `---`, missing `Mode`:
  ```
  gate-check: independent review docs/reviews/2026-09-20-review.md is missing Mode: CERTIFYING.
  Exit code: 1
  ```
  The body `Date: 2026-01-01` no longer triggers legacy classification.
- **Negative test (b)**: Review with no header `Date` field but body `Date: 2026-01-01` after `---`:
  ```
  gate-check: independent review docs/reviews/2026-09-19-review.md is missing or has an invalid Date.
  Exit code: 1
  ```
  A body-only Date is correctly rejected.
- **Regression**: Gate suite (16/16) passes; legacy reviews with header `Date: 2026-09-19` still receive graceful WARN treatment (test 3b).

---

### F-003 — CLOSED — PID ≤ 4 treated as unusable

- **Fix**: `protocol-session.cjs:checkProcessAlive` now requires `pid > 4` (was `> 0`). Both `isSessionAlive` branches apply the same `> 4` bound, matching the writer-side `start` validation.
- **Negative test**:
  ```javascript
  checkProcessAlive(4) → false
  isSessionAlive({ hostname: os.hostname(), supervisorPid: 4, pid: 2147483640 }) → false
  isSessionAlive({ hostname: os.hostname(), supervisorPid: 4, pid: 4 }) → null
  ```
  PID 4 (Windows System process) can no longer pin artifacts as perpetually alive.
- **Regression**: Session suite (33/33) passes; the 6-state specification (test 20) covers PID ≤ 4 as unusable in lines 324-339.

---

### F-004 — CLOSED — Boundary-aware citation matching

- **Fix**: `protocol-handoff.cjs:gateCheck` now constructs a regex from the escaped review path with a negative lookahead `(?![A-Za-z0-9._/-])`, preventing `.bak`, `-draft`, and subdirectory continuations from matching.
- **Negative test (`.bak` rejected)**:
  ```
  gate-check: journal .ai\worklog\session-audit.md does not mention independent review docs/reviews/2026-09-19-review.md.
  Exit code: 1
  ```
- **Positive test (exact citation passes)**:
  ```
  completion gate verified: docs/reviews/2026-09-19-review.md bound to .ai\worklog\session-audit.md (section 0)
  Exit code: 0
  ```
- **Regression**: Gate tests 14-15 verify `.bak`, `-draft` rejection and six valid boundary characters (backtick, quote, space, closing paren, end-of-line).

---

### AUD-C1 — CLOSED — Unified-prompt phrase present

- **Fix**: `docs/reviews/2026-09-19-final-v1.9.5-adversarial-review-prompt.md` now contains the phrase `This is the unified adversarial audit prompt for the v1.9.5 release candidate.` matching the validator's pattern at `validate-protocol.ps1:537`.
- **End-to-end test**: A fixture with `Status: Completed` citing the final prompt and a CERTIFYING review:
  - `record --owner session-audit --quick` → exit 0
  - `validate-protocol.ps1` → exit 0, 0 `[FAIL]` lines
  - Completion gate basic check passes (prompt phrase recognized, review certified).
- **Regression**: Full validator (241/241 tests + standalone validator exit 0).

---

## Diff Review

Reviewed `git diff 47cf55f..1fb0580` across 3 implementation files:

1. **`validate-protocol.ps1`** (+6/-3): Ordinal `Dictionary`/`HashSet` replace default case-insensitive hashtable; `-cne` replaces `-ne`. All existing call sites (`ContainsKey`/indexer on `$seen`; `Contains` on `$regIdSet`) remain compatible.
2. **`protocol-handoff.cjs`** (+32/-6): Deterministic header region calculation (first `---`, then first `## `, then whole file); all five regex extractions scoped to `headerRegion`; review path matching uses escaped regex with negative lookahead. Transcription-marker check remains whole-file (intentional; transcribed markers may appear in the body).
3. **`protocol-session.cjs`** (+4/-4): `checkProcessAlive` bound changed from `> 0` to `> 4`; three matching changes in `isSessionAlive` for `supervisorPid`, `sessionPid`, and `targetPid` guards.

No unrelated changes. No secret material. No encoding violations.

---

## New Findings

None. No new release-blocking or non-blocking defects were discovered during this delta review.

---

## Delta List

### Required-Before-Tag Fixes
- **None**: All four original findings are closed. No new defects found.

### Accepted Residuals
- **32 journals** in `.ai/worklog/` (advisory WARN; process state, needs archival before freeze — not a code defect).
- **Version string** reads `1.9.4` in manifest (expected; the version bump to `1.9.5` happens at tag time per convention).

---

## References

- Initial Certification: `docs/reviews/2026-09-19-claude-opus-v1.9.5-certification.md` (RECOMMENDATION)
- Remediation Commit: `1fb0580` (Item 6: F-001..F-004, AUD-C1)
- DeepSeek Item 6 Audit: `docs/reviews/2026-09-19-deepseek-flash-item6-audit.md` (PASS)
- Delta Certification Request: `docs/reviews/2026-09-19-claude-opus-delta-certification-request.md`
- Final Adversarial Prompt: `docs/reviews/2026-09-19-final-v1.9.5-adversarial-review-prompt.md`
- Decision Blocks: `PROTO-DEC-0029` through `PROTO-DEC-0033` in `.ai/DECISIONS.md`
- Associated Session Journal: `.ai/worklog/claude-opus-0f1b841e5c4c6638.md`
