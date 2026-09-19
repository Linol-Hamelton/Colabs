# Track C + H1 Pilot - External Adversarial Audit Prompt (All Models)

**Date**: 2026-09-19  
**Reviewed state**: `001af50` (HEAD == origin/main) plus the uncommitted Track C pilot artifacts (report, evidence under `.ai/runtime/`, journals)  
**Author**: DeepSeek (deepseek-flash), controller - **non-certifying in this round** (implemented nothing; audited per-item; must not certify)  
**Invited**: Claude, Gemini, Qoder, Mistral Vibe, GLM, Copilot, Qwen, CodeGeeX, and any other available model  
**Mode rules**: only reviewers with `FS_WRITE`, `SHELL_EXEC`, `EVIDENCE_SIGN`, `REPO_READ` may certify (`Mode: CERTIFYING`, `Receipt-Owner: <owner id>`, receipt that verifies). Text-only participants answer `[MODE: READ-ONLY ADVISORY]` and need transcription (AGENTS.md 5.5); advisory cannot satisfy the independent-review gate. Invite at least one certifying review.

## 1. Context

v1.9.5 is released (tag facts in `docs/reviews/2026-09-19-deepseek-flash-release-tag-erratum.md`). Track C then delivered: **M0** context digest documentation, **C2** external-tooling/MCP policy and **C1** H1 telemetry plus the pilot design (`PROTO-DEC-0034`, `PROTO-DEC-0035`). The H1 pilot's first repetition produced a **negative result** for the raw Repomix digest; the stop rule executed (no MCP, no Arm C). The next governance step is the repository cleanup / v2.0 discussion. The task: audit the Track C package and the pilot's integrity, not the plan.

## 2. Read first

- `docs/reviews/2026-09-19-deepseek-flash-mcp-selection-analysis.md`, `...-h1-pilot-design.md`, `...-h1-pilot-runbook.md`, `...-h1-pilot-runbook-addendum-agents.md`, `...-h1-pilot-cost-policy-addendum.md`, `...-h1-pilot-smoke-report.md`, `...-h1-pilot-report.md`
- `.ai/DECISIONS.md` `PROTO-DEC-0029`..`0035`; `docs/decisions/REGISTRY.md`
- `.ai/docs/PROTOCOL.md` (Context digest; MCP and external tooling policy; Gate freshness check); `AGENTS.md` section 7 pointer
- Git history: `git log --oneline 001af50 -20` and the commit dates of the design/decisions versus the pilot data timestamps

## 3. Facts to verify (commands required)

1. **Decision compliance**: the M0 digest command in PROTOCOL.md matches `PROTO-DEC-0034` (pinned `repomix@1.18.0`, `--no-git-sort-by-changes`, runtime-only output, raw-vs-compressed rule); the C2 policy lists advisory-only, one server per phase, <= 1500-token schema budget, no auto-install, identical degradation; the policy-pin test asserts the anchors; no MCP server, dependency or `.mcp.json` exists in the repository.
2. **Telemetry**: `node --test tests/hooks.test.cjs tests/session.test.cjs tests/codex.test.cjs`; a Stop event writes one JSONL row to `.ai/runtime/metrics/sessions.jsonl` with the declared fields and 1 MB rotation; a metrics write failure cannot fail a hook (read the code, try to falsify); no metrics are written into journals or committed files.
3. **Pre-registration integrity**: prove the thresholds and the task set were fixed **before** the data arrived (compare commit timestamps of the design/decision files with the pilot row timestamps in `.ai/runtime/pilot-data/trials.jsonl`); look for any post-hoc metric change (the report introduces no new metric; confirm).
4. **Pilot arithmetic**: independently recompute the medians from `trials.jsonl` for broad/narrow under both token definitions (total = in + cache read + out; fresh = in + out); verify the report's numbers and the stop-rule conclusion.
5. **Evidence integrity**: the 22 evidence directories under `.ai/runtime/pilot-data/evidence/` match the trial rows; sample at least three trials (one broad A, one broad B, one narrow) and verify journal, metrics and diff against the row; confirm no worktree remains (`git worktree list`) and branches are gone.
6. **Governance**: the registry covers all decision ids and committed rows are unchanged; the completed-gate logic still passes on the current tree (TASK is `In progress`, so `gate-check` is not applicable; verify that too); `validate-protocol.ps1` exit 0 with 0 warnings and `test-protocol.ps1` green.
7. **Honesty checks**: the report discloses the confounds (parallel launch, B audits more thorough, missing A-T4 usage card, one repetition, 38-minute B-T2 outlier); no negative result was hidden; the "more thorough audits" observation is not used to redefine the metric.

## 4. Attack vectors

- Find a way the pilot could have been gamed: metric definition swaps, selective omission of trials, threshold reinterpretation, retry-until-pass, evidence rows without artifacts.
- Break the telemetry: spoof `startTime`, freeze clock, grow the metrics file past rotation, make the metrics directory read-only, run Stop twice, run Stop without SessionStart.
- Policy bypass: adopt an MCP server without changing PROTOCOL.md (would anything detect it?); place tool state inside the repo outside `.ai/runtime/` and see whether the anchor digest stales receipts (expected: yes - confirm).
- Governance: try to reopen `PROTO-DEC-0034/0035` without a registry trigger; try to flip a registry status without a new row.
- Provide at least one **negative reproduction** (command and output) per mechanism you attack.

## 5. Deliverables

1. Report at `docs/reviews/YYYY-MM-DD-<agent>-trackc-h1-audit.md` per `templates/reviews/REVIEW.md` with `Mode`, `Receipt-Owner`, reviewed commit, an explicit verdict on the **Track C package + pilot conclusions** (`PASS` / `FAIL` / `BLOCKED` / `RECOMMENDATION`), findings with severities and reproductions for any FAIL/BLOCKED.
2. Delta list: required-before-cleanup fixes, recommendations, accepted residuals (including suggestions for the v2.0/cleanup criteria).
3. Journal entry (five labels), `record --owner <your id>`, `verify --owner <your id> --deep` exit 0.
4. Short chat summary: verdict, report path, top findings.

## 6. Constraints

- Do not modify implementation files, decision blocks, the registry, the pilot data, the plan or historical reviews; probes in clones/fixtures.
- No history rewrite; never touch other sessions' journals.
- Owner/coordinator decides; auditor output is input, not a decision.
