# DeepSeek (deepseek-flash) - C1 Audit (H1 Instrumentation and Pilot Design)

**Date**: 2026-09-19  
**Reviewed state**: `a8f8985` plus the uncommitted C1 changes  
**Reviewer**: DeepSeek (deepseek-flash), auditor/controller  
**Scope**: Stop telemetry and JSONL metrics; `protocol-session.cjs` CLI output; hook/session/codex tests; the H1 pilot design document; `PROTO-DEC-0035` draft  
**Conflict declaration**: authored the C1 specification; no implementation role.  
**Mode**: CERTIFYING  
**Verdict**: **PASS for the instrumentation** with three required document corrections (D-1..D-3) before the commit. The pilot design itself is sound and its thresholds are correctly pre-registered.

---

## 1. Independent verification

| Check | Result |
|---|---|
| `node --test tests/hooks.test.cjs` | 20/20 pass |
| `node --test tests/session.test.cjs` | 34/34 pass |
| `node --test tests/codex.test.cjs` | 7/7 pass |
| `powershell .\test-protocol.ps1` | **248/248 pass**, exit 0 |
| `powershell .\validate-protocol.ps1` | exit 0, 0 warnings |
| `verify --owner gemini-434bcd8012e0f38c --deep` | exit 0, matches the current tree |

## 2. Code review

- Stop telemetry is additive: `changedFiles`, `durationSec` (clock-guarded, `Math.max(0, ...)`), `firstEditMs` (earliest mtime of changed paths minus `startTime`; vanished paths skipped; `null` when clean; the upper-bound caveat is documented in code), `handoffComplete` reuses the already computed `complete`. `systemMessage` short-circuits and `stopWarnings` behavior are unchanged.
- `recordSessionMetric` is fail-safe (no throw can escape), writes only under `.ai/runtime/metrics/` (git-ignored, digest-excluded), rotates at 1 MB to `sessions.1.jsonl`, and never touches journals or committed files. `gitHead` is best-effort.
- The CLI telemetry line gains first-edit and handoff fields without breaking the old prefix.
- No dependencies, no network, no gate semantic changes.

## 3. Required document corrections (before the commit)

| Id | Finding | Correction |
|---|---|---|
| D-1 | `docs/reviews/2026-09-19-h1-pilot-design.md` is formatted as a **certifying review** (`Reviewer: Gemini`, `Mode: CERTIFYING`, `Receipt-Owner: gemini-434bcd8012e0f38c`, `Verdict: RECOMMENDATION`, `Receipt: pending`). The implementer cannot certify its own artifact; this would sit in `docs/reviews/` as a misleading gate-eligible-looking file | Replace the header with a design-document header: title, date, `Author: Gemini (implementer)`, status `Design - not a review artifact`, and no `Mode`/`Receipt-Owner`/`Verdict`/`Receipt` fields |
| D-2 | Threshold table row "Handoff Completeness": target `R = 100%` contradicts the requirement text "must not decrease relative to Arm A baseline" | Restate as: `R(handoff) >= R(Arm A)` on the same task set; a strict 100% is not required where Arm A itself is below 100% |
| D-3 | Execution procedure says "Freeze the repository state at commit `a8f8985` (post Track C M0+C2+C1)" - that commit predates the C1 changes | Point the baseline at "the commit that includes this C1 instrumentation (created after the audit)" |

## 4. Informational notes

| Id | Note |
|---|---|
| I-1 | Narrow tasks 6-10 modify protocol code; the pilot must run them in disposable clones/worktrees and reset between trials, never in the certified checkout |
| I-2 | The model-identifier examples in the procedure are illustrative and dated; pin the identifiers actually used at run time |
| I-3 | Metrics JSONL accumulates on every Stop in every installed project until rotation; it is disposable runtime state by design - no action |

## 5. Decision draft review

`PROTO-DEC-0035` covers the instrumentation and the pre-registered pilot thresholds correctly, but at transcription it needs normalization: `### PROTO-DEC-0035`, `Status: Accepted`, `Reopen-trigger: none`, a provenance `Approved by:` line, and a registry row. Wording of the handoff threshold must follow the D-2 correction. Owner approval is pending.

## 6. Recommendation

1. Gemini applies D-1..D-3 (doc-only), re-runs the suites, records and stops for a quick re-verification.
2. Owner approves `PROTO-DEC-0035`; the controller transcribes it with the registry row.
3. Commit C1 (code, tests, design doc, decision, journals, this audit); no push by the implementer.
4. Then run the pilot per the design and produce `docs/reviews/2026-09-19-h1-pilot-report.md`.

## 7. References

- Prompt: `docs/reviews/2026-09-19-gemini-c1-instrumentation-prompt.md`
- Design: `docs/reviews/2026-09-19-h1-pilot-design.md`
- Policy: `PROTO-DEC-0034`; analysis: `docs/reviews/2026-09-19-deepseek-flash-mcp-selection-analysis.md`
