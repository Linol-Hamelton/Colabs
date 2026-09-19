# Current Task

Status: In progress
Owner: RuslanFomenko
Last update: 2026-09-19

## Objective

Track C - context economy: M0 universal on-demand digest and C2 external-tooling policy (done); C1 H1 instrumentation and the Repomix pilot (next), per plan revision 2 section 6.

## Problem

Repeated reading of kernel code and historical prose burns context across models; MCP-only approaches add schema tax and per-client drift. The universal layer must work without MCP.

## Constraints

- No runtime dependencies and no package.json; the digest command is pinned and invoked on demand.
- All tool state lives under `.ai/runtime/` or outside the repository; never tracked, never an Evidence or gate input.
- One MCP server at most per adoption phase; schema budget <= 1500 tokens; local, sandboxed, pinned.
- Size limits unchanged; validator 0 warnings.

## Acceptance criteria

- [x] M0 PROTOCOL.md subsection (commit 35f37af).
- [x] C2 PROTOCOL.md policy subsection plus the AGENTS.md pointer (35f37af).
- [x] Policy-pin test registered in the manifest (35f37af).
- [x] PROTO-DEC-0034 approved and transcribed (99befee).
- [x] C1 instrumentation (telemetry) and H1 pilot design with pre-registered thresholds.
- [ ] C1a Stop telemetry fail-safe fix (external audit F-001: every Stop exit emits a metrics row) plus regressions.
- [x] Repomix pilot run and report (evidence for or against M1 adoption): negative result, stop rule executed, correction addendum published.
- [ ] External audit round closure (Qoder receipt re-issue or downgrade; codex receipt re-record at freeze).

## Roles

- gemini: implementer
- deepseek: reviewer, auditor, controller

## Current state

v1.9.5 published (tag at `1b1deab`; erratum recorded). Track C M0+C2 committed with audit PASS; `PROTO-DEC-0034/0035` recorded; H1 repetition 1 produced a negative result for the raw digest (corrected numbers in the pilot-report addendum; stop rule executed, no MCP, no Arm C). External audit round: Codex and Gemini FAIL on package acceptance (F-001..F-004), Qoder RECOMMENDATION with a broken receipt binding. F-002/F-003/F-004 fixed (data corrected, journals 29/30, validator 0 warnings); F-001 queued as C1a. Owner run policy recorded (tests on free models only; paid for analysis/coding; Gemini exception).

## Next

Gemini implements C1a (fail-safe Stop telemetry) and stops for DeepSeek's audit; the owner decides on repository cleanup/v2.0 after the audit round closes.

## Open questions

- Codex external audit of `001af50` plus pilot artifacts: report at `docs/reviews/2026-09-19-codex-trackc-h1-audit.md`. Reproduced missing Stop telemetry on incomplete handoffs, smoke/retry contamination of pilot medians, and a trial-row/archived-metric handoff mismatch. Correct these before package acceptance; the no-MCP conclusion remains supported. No decision is reopened by this note.
- Current-state/Next text above predates committed C1 and the preliminary pilot. Coordinator should reconcile it with the audit and restore the 30-journal limit without removing history.
