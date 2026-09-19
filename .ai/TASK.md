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
- [ ] C1 instrumentation (telemetry) and H1 pilot design with pre-registered thresholds.
- [ ] Repomix pilot run and report (evidence for or against M1 adoption).
- [ ] External audit round and the owner decision on repository cleanup or v2.0.

## Roles

- gemini: implementer
- deepseek: reviewer, auditor, controller

## Current state

v1.9.5 published (tag at `1b1deab`; the erratum documents the docs-only red CI on the tagged commit). Track C M0+C2 committed (`35f37af`) with audit PASS; `PROTO-DEC-0034` recorded (`99befee`); CI green on `99befee`. MCP cooperation matrix discussion deferred by the owner until after the Repomix pilot.

## Next

Prepare and dispatch the C1 item (H1 instrumentation plus pilot design); then the Repomix pilot and the external audit round; the owner decides cleanup/v2.0.

## Open questions

- Codex external audit of `001af50` plus pilot artifacts: report at `docs/reviews/2026-09-19-codex-trackc-h1-audit.md`. Reproduced missing Stop telemetry on incomplete handoffs, smoke/retry contamination of pilot medians, and a trial-row/archived-metric handoff mismatch. Correct these before package acceptance; the no-MCP conclusion remains supported. No decision is reopened by this note.
- Current-state/Next text above predates committed C1 and the preliminary pilot. Coordinator should reconcile it with the audit and restore the 30-journal limit without removing history.
