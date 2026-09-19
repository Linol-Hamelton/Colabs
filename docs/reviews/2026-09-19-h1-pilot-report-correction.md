# H1 Pilot Report - Correction Addendum (External Audit Findings)

**Date**: 2026-09-19  
**Author**: DeepSeek (deepseek-flash), controller  
**Applies to**: `docs/reviews/2026-09-19-h1-pilot-report.md`  
**Context**: the external audit round returned two certifying FAIL verdicts on package acceptance (Codex `docs/reviews/2026-09-19-codex-trackc-h1-audit.md`, Gemini `docs/reviews/2026-09-19-gemini-trackc-h1-audit.md`) with the same four findings, plus a RECOMMENDATION from Qoder whose receipt binding is broken. This addendum corrects the record; the substantive stop-rule conclusion is unchanged and was confirmed by both FAIL reports.

## F-001 (HIGH) - Stop telemetry omits unsuccessful handoffs (accepted)

The Stop early-return paths (missing baseline, secret warning, incomplete journal) bypass `recordSessionMetric`, so a failed initial handoff followed by a repaired journal leaves only the successful Stop in the JSONL. This is a real C1 instrumentation defect; it is queued as **C1a** (fail-safe telemetry on every Stop exit plus regressions). Pilot mitigation: the dataset uses the **first** recorded event per trial, and the negative result does not depend on the affected events.

## F-002 (HIGH) - Corrected repetition-1 cohorts (accepted, corrected)

The published narrow medians and the Arm A cost mixed the smoke (`rep 0`) and retry (`rep 2`) rows into the repetition-1 cohort. Corrected numbers (independently recomputed by both auditors; total = in + cache read + out; fresh = in + out):

| Cohort and metric | Arm A | Arm B | Change |
|---|---:|---:|---:|
| Rep 1 broad, total (A n=4, B n=5) | 846,291 | 1,462,335 | +72.79% |
| Rep 1 broad, fresh | 73,269 | 79,935 | +9.10% |
| Rep 1 narrow, total (n=5 each) | 566,954 | 908,268 | +60.20% |
| Rep 1 narrow, fresh | 45,470 | 64,913 | +42.76% |
| Retry replacing A-T9, total | 566,954 | 908,268 | +60.20% |
| Retry replacing A-T9, fresh | 44,728 | 64,913 | +45.13% |
| All-rows narrow, total (A n=7) | 493,922 | 908,268 | +83.89% |

Corrected cost: Arm A **$0.307026 from nine cards** (the A-T4 card was never provided), Arm B **$0.495389 from ten cards**; a matched cost comparison is not possible without A-T4. **Conclusion unchanged**: Arm B fails the pre-registered >= 25% broad reduction and <= +5% narrow bound under every cohort interpretation; the `PROTO-DEC-0035` stop rule stands (no MCP adoption, no Arm C).

## F-003 (MEDIUM) - Trial data fidelity (accepted, fixed)

`trials.jsonl` is corrected: `durationSec`, `firstEditMs` and `handoffComplete` are restored for all 22 rows from the archived first Stop event; `A-9-1` now records `handoffComplete: false`; the smoke (`rep 0`) and retry (`rep 2`) rows are explicitly marked in `rep`/`notes`; the smoke/repeat rows stay excluded from cohort statistics.

## F-004 (LOW) - Journal count warning (fixed)

Six oldest unprotected journals were archived (text moved to `.ai/ARCHIVE.md`): `copilot-a514534536ed6bfb`, `deepseek-96c83a0f0c23d03b`, `qwen-f00d174ee1ee239a`, `deepseek-flash-411196c44afa7cfc`, `claude-9c191778e13959b6`, `qwen-adversarial-audit`. Result: 29 journals, `validate-protocol.ps1` exit 0 with 0 warnings.

## Audit round status

| Reviewer | Verdict | Receipt | Gate note |
|---|---|---|---|
| Codex (GPT-6) | FAIL (package), stop-rule confirmed | stale now (re-record at freeze) | gate-valid after re-record |
| Gemini (Antigravity) | FAIL (package), stop-rule confirmed | fresh | gate-valid |
| Qoder | RECOMMENDATION | stale; **Receipt-Owner mismatch** (`qoder-86c43a9a02fd9789` vs journal `qoder-4d1795a4ffecb995`) | non-gate-valid as submitted |

Both FAIL verdicts concern the report/data presentation, not the substantive decision; with this addendum their findings are either fixed (F-002/F-003/F-004) or queued (F-001). The owner remains the approver of any acceptance.
