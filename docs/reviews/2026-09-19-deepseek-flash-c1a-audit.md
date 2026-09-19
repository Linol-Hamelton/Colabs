# DeepSeek (deepseek-flash) - C1a Audit (Fail-Safe Stop Telemetry)

**Date**: 2026-09-19  
**Reviewed state**: `66755cd` plus the uncommitted C1a changes (`protocol-hooks.cjs`, `PROTOCOL.md`, `tests/hooks.test.cjs`)  
**Reviewer**: DeepSeek (deepseek-flash), auditor/controller  
**Scope**: fix for external audit finding F-001 (Stop telemetry omits unsuccessful handoffs)  
**Conflict declaration**: authored the C1a specification and the F-001 adjudication; no implementation role.  
**Mode**: CERTIFYING  
**Verdict**: **PASS** - the defect is closed with genuine failure-path coverage and independent reproduction.

## 1. Independent verification

| Check | Result |
|---|---|
| `node --test tests/hooks.test.cjs tests/session.test.cjs tests/codex.test.cjs` | 68/68 pass |
| `powershell .\test-protocol.ps1` | **255/255 pass**, exit 0 |
| `powershell .\validate-protocol.ps1` | exit 0, 0 warnings |
| Implementer receipt | **stale** - the council file `docs/reviews/2026-09-19-gemini-remediation-advice.md` was written after the record; re-record at freeze (expected) |

### Independent reproduction (fresh clones, fixed hooks)

| Path | Observed |
|---|---|
| changed file, no journal entry | warning preserved; row `{"session":"c1a-1","changedFiles":1,"durationSec":1,"firstEditMs":599,"handoffComplete":false,"gitHead":"66755cd..."}` |
| Stop without SessionStart | warning preserved; row `{"session":"c1a-2","changedFiles":null,"durationSec":null,"firstEditMs":null,"handoffComplete":false,"gitHead":"66755cd..."}` |

Both paths previously produced **zero** rows (audit reproduction), so the survival-bias gap is closed empirically, not just by unit tests.

## 2. Code review

- `sessionId` and `gitHead` are computed once at the top of `run('Stop')`, fail-safe; every early exit calls `recordSessionMetric` before returning its unchanged `systemMessage`.
- `durationSec` becomes `null` in the JSONL when no `startTime` exists, while the hook-return telemetry object keeps the previous `0` fallback for contract stability - a thoughtful split; PROTOCOL.md documents that consumers select the **first** event per session because failed handoffs are now recorded.
- Secret-warning and changed-without-journal rows contain only counters/timestamps; the hygiene test injects a fake secret and a unique action string and asserts neither appears in any row.
- The write-failure test forces a real failure on Windows by placing a **file** where the metrics directory must be (ENOTDIR) rather than relying on `chmod` semantics; the hook still succeeds.

## 3. Notes (non-blocking)

| Id | Note |
|---|---|
| C1A-1 | Council submissions suggest extra hardening for the future (monotonic timestamps, atomic rotation, tool-call success rate); none are required for F-001 and are v2 candidates |
| C1A-2 | The stale implementer receipt is the expected consequence of the council file landing after the record; the ordered record pass at the freeze covers it |
| C1A-3 | `gitHead` is resolved even on the no-baseline path; negligible cost, fail-safe already |

## 4. Recommendation

1. Commit C1a as one item: `.ai/bin/protocol-hooks.cjs`, `.ai/docs/PROTOCOL.md`, `tests/hooks.test.cjs`, both journals, this audit; no push by the implementer.
2. Fold the council's extra telemetry hardening ideas into the v2 plan rather than expanding C1a.
