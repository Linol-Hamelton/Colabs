# Gemini C1a Dispatch - Fail-Safe Stop Telemetry

**Date**: 2026-09-19  
**Implementer**: Gemini  
**Auditor**: DeepSeek - audits before the commit  
**Trigger**: external audit finding F-001 (`docs/reviews/2026-09-19-codex-trackc-h1-audit.md` section F-001, `docs/reviews/2026-09-19-gemini-trackc-h1-audit.md`): Stop omits unsuccessful handoffs from telemetry, creating survival bias.  
**Scope**: `.ai/bin/protocol-hooks.cjs` `run('Stop')`, `.ai/docs/PROTOCOL.md` telemetry subsection, `tests/hooks.test.cjs` (and session/codex tests if they touch the Stop contract).

## Defect

`run('Stop')` returns early on several paths before the telemetry block and `recordSessionMetric` (around `:463` missing baseline, `:476` changed-without-journal, the secret-warning branch, and `:535` normal call). A failed initial handoff followed by a repaired journal therefore leaves only the successful Stop in `.ai/runtime/metrics/sessions.jsonl`, contradicting "one JSONL record per Stop event" and biasing completion metrics.

## Required behavior

1. **Every Stop exit writes exactly one metrics row** - including: missing SessionStart baseline, changed-without-journal, secret warning, no changes, and the ordinary complete-handoff path. The schema stays exactly as documented (`ts, session, agent, changedFiles, durationSec, firstEditMs, handoffComplete, gitHead`).
2. **Failure paths use explicit nulls, never omissions**: `durationSec` from `state.startTime` when a state exists, else `null`; `firstEditMs` only when a baseline exists (else `null`); `changedFiles` when computable (else `null`); `handoffComplete: false` on all failure paths.
3. **No journal content, no diffs, no secrets** in the metrics row; the existing secret-warning text and `systemMessage`/**warning behavior and exit semantics stay unchanged**.
4. **Fail-safe**: a metrics failure never throws, blocks, or changes a hook outcome; rotation at 1 MB unchanged; runtime-only storage unchanged.
5. **Documentation**: in the PROTOCOL.md telemetry subsection add one sentence: consumers select the **first** event per session/trial because failed handoffs are now recorded too, and the metric of interest is the initial Stop outcome.
6. **Tests** (`tests/hooks.test.cjs`, using existing fixtures):
   - changed-without-journal Stop -> row written with `handoffComplete: false` and the warning preserved;
   - Stop without SessionStart -> row written with null baseline-dependent fields;
   - secret-warning Stop -> row written;
   - ordinary Stop -> unchanged behavior and fields;
   - metrics write failure (read-only directory in a fixture) -> hook still succeeds, no throw;
   - no journal text appears in any row.

## Acceptance and evidence

- `node --test tests/hooks.test.cjs`, `tests/session.test.cjs`, `tests/codex.test.cjs` green; full `test-protocol.ps1` green; `validate-protocol.ps1` exit 0 with 0 warnings (TASK is `In progress`).
- Report includes a fixture transcript showing rows now emitted on the previously silent paths (before/after).
- Journal entry (five labels), `record --owner gemini-434bcd8012e0f38c`, `verify --deep` exit 0; stop for DeepSeek's audit; no commit, no push.

## Rules

- Only the files named above change; the metrics schema, the gate logic, decision blocks, the registry and other sessions' journals stay untouched.
- UTF-8 without BOM and LF; `.ps1` ASCII-only when touched (no `.ps1` change is expected here).
- Stop and ask on any contradiction with the repository or any red check.
