# Current Task

Status: In progress
Owner: RuslanFomenko
Last update: 2026-09-19

## Objective

Track C - context economy: M0 universal on-demand digest and C2 external-tooling/MCP policy, per plan revision 2 section 6 and the accepted decisions M1-M5. Implementation by Gemini; audit by DeepSeek.

## Problem

Repeated reading of kernel code and historical prose burns context across models; MCP-only approaches add schema tax and per-client drift. The universal layer must work without MCP.

## Constraints

- No runtime dependencies and no package.json; the digest command is pinned and invoked on demand.
- All tool state lives under `.ai/runtime/` or outside the repository; never tracked, never an Evidence or gate input.
- One MCP server at most per adoption phase; schema budget <= 1500 tokens; local, sandboxed, pinned.
- Size limits unchanged: TASK.md <= 80 lines, journals <= 150 lines, PLAN <= 200 lines; validator 0 warnings.

## Acceptance criteria

- [ ] M0 PROTOCOL.md subsection: pinned digest command, raw vs compressed rules, staleness header, graceful absence.
- [ ] C2 PROTOCOL.md policy subsection plus one AGENTS.md pointer sentence.
- [ ] Policy-pin test registered in the manifest.
- [ ] PROTO-DEC-0034 approved by the owner and transcribed.
- [ ] C1 instrumentation and H1 pilot design (separate item, after M0/C2).

## Roles

- gemini: implementer
- deepseek: reviewer, auditor, controller

## Current state

v1.9.5 published (tag `v1.9.5`); the release-line CI fix landed (`1b1deab`, helper git identity). Track C dispatch prompt committed at `b8f8c4c`: docs/reviews/2026-09-19-gemini-trackc-m0-c2-prompt.md. Owner decision pending on the tag re-point after the 28-second CI failure on `1b1deab`.

## Next

Gemini implements M0+C2; DeepSeek audits before the commit.
