# Gemini C1 Dispatch - H1 Instrumentation and Repomix Pilot Design

**Date**: 2026-09-19  
**Implementer**: Gemini  
**Auditor**: DeepSeek - audits the item before its commit  
**Basis**: plan revision 2 section 6 (C1); `PROTO-DEC-0034` and the MCP selection analysis; owner decisions M1-M5.  
**Preconditions**: Track C M0+C2 committed (`35f37af`); `.ai/TASK.md` open (`In progress`).  
**Out of scope**: installing any MCP server, running the pilot, network use, adding dependencies, changing gate semantics.

---

## Part A - H1 instrumentation (code)

1. **Wire the dead telemetry.** `protocol-handoff`-independent: `protocol-hooks.cjs` `run('Stop')` already computes `const changed = changedFiles(previous.files, current.files)` (around line 467) and holds `state.startTime` (set once, line 432). Extend the Stop return object with additive fields:
   - `changedFiles`: number of changed files;
   - `durationSec`: `Math.round((Date.now() - state.startTime) / 1000)` (guard when `startTime` is absent);
   - `firstEditMs`: when `changed.length > 0`, the earliest filesystem mtime among the changed paths minus `startTime` (in ms); skip vanished paths; `null` when nothing changed or no mtime is readable. Document in a comment that mtime is the last write, so this is an upper bound of the true first edit;
   - `handoffComplete`: boolean, reuse the already computed `complete`.
   The existing contract must not change: `systemMessage` still short-circuits, `stopWarnings` still collects advisory warnings, and the hook JSON consumers (Claude/Codex) must keep working - all new fields are additive.
2. **CLI printout.** In `protocol-session.cjs` `stop`, the telemetry branch already exists; extend it to print the new fields in the same style (files changed, wall time, first-edit offset, handoff complete) while keeping the old message stable.
3. **Machine-readable metrics.** Append one JSONL line per Stop event to `.ai/runtime/metrics/sessions.jsonl` (create the directory; `.ai/runtime/` is git-ignored and digest-excluded): `{ts, session, agent, changedFiles, durationSec, firstEditMs, handoffComplete, gitHead}`. Requirements: fail-safe (`try/catch`; a metrics failure must never fail or block a hook), no secrets, and rotation at ~1 MB to `sessions.1.jsonl` so the file cannot grow without bound. This file is the pilot's raw data source. Do not write metrics anywhere else and never into journals.
4. **Tests** (`tests/hooks.test.cjs` and the session suites): Stop returns the four fields; the JSONL line appears with the expected keys; a no-change stop yields `changedFiles: 0` and `firstEditMs: null`; a vanished path is skipped; existing hook tests stay green. No new dependencies, no network.

## Part B - Pilot design (document only, no execution)

Create `docs/reviews/2026-09-19-h1-pilot-design.md`:

1. **Hypothesis**: the universal digest layer reduces repeated reading and total session tokens across models without quality loss. The 35%/50%/65% forecast stays an unverified hypothesis and must not enter decision text as fact.
2. **Arms**: A control (no digest); B Repomix CLI digest on demand (raw for audits/implementation, compressed for orientation); C B plus Repomix MCP `--mcp --sandbox` for MCP-capable clients only. One variable at a time; C only if B shows no regression.
3. **Task set**: ten crossed tasks - five broad kernel audits and five narrow single-file edits - with verbatim prompts, fixed order per arm, recorded in the document.
4. **Metrics**: primary = total tokens per task (orchestrator-reported; otherwise a pre-registered bytes/4 estimate); secondary = schema tokens, files read, time-to-first-edit (new telemetry), session wall time, handoff completeness, and a binary per-task quality rubric.
5. **Pre-registered thresholds**: adopt M1 only if median total tokens drop by at least 25% on broad tasks, narrow tasks worsen by no more than 5%, schema tokens stay within 1500, and handoff completeness does not drop. Otherwise document the negative result and stop; no MCP adoption.
6. **Procedure**: freeze a task snapshot; run each arm with the same fixed model IDs; three repetitions per task per arm; collect `sessions.jsonl` plus orchestrator usage; no protocol file changes during the pilot; results go to `docs/reviews/2026-09-19-h1-pilot-report.md` (written by the pilot executor later, not in this item).
7. **Confounders**: model version drift, cache warmth, learning effects; mitigate with fixed model IDs, randomized arm order per task and notes on any environment change.
8. **Non-goals**: Serena, Qdrant, AST chunking and the cooperation matrix stay deferred until after the pilot.

## Part C - Decision draft

`PROTO-DEC-0035` (H1 instrumentation plus the pre-registered pilot thresholds) in your report for the owner; do not insert it into `.ai/DECISIONS.md` (the controller transcribes after approval and appends its registry row).

## Acceptance and evidence

- Full `test-protocol.ps1` green with the new tests; `validate-protocol.ps1` exit 0 with 0 warnings (TASK `In progress`).
- A demonstration that a Stop event writes the JSONL line (fixture output in the report).
- Journal entry (five labels), `record --owner gemini-434bcd8012e0f38c`, `verify --deep` exit 0; stop for DeepSeek's audit; no commit, no push.

## Rules

- Only the canonical `.ai/bin/protocol-hooks.cjs` and `.ai/bin/protocol-session.cjs` change; the `.claude/hooks` wrapper needs no edit. No MCP installation, no network, no new dependencies, no gate semantics changes, no journal-format changes.
- UTF-8 without BOM and LF; `.ps1` ASCII-only.
- Stop and ask on any contradiction with the repository or any red check.
