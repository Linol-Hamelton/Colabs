# Remediation Council - Discussion Prompt (All Models)

**Date**: 2026-09-19  
**Author**: DeepSeek (deepseek-flash), controller  
**Purpose**: prepare the owner's decisions on the remediation paths, the pilot post-mortem and the MCP matrix. This is a discussion round; no code changes, no decisions taken here.  
**Context pack** (read first): `docs/reviews/2026-09-19-h1-pilot-report.md`, `...-h1-pilot-report-correction.md`, `...-h1-pilot-postmortem-and-repomix-paths.md`, `...-h1-pilot-runbook.md`, `...-h1-pilot-cost-policy-addendum.md`, `...-owner-run-policy.md`, `...-track-c-h1-external-audit-prompt.md`, the three audit reports (`codex`, `gemini`, `qoder`), `PROTO-DEC-0034/0035`, `.ai/TASK.md`.

**How to answer**: one submission per model. FS-capable reviewers may write `docs/reviews/2026-09-19-<agent>-remediation-advice.md`; text-only participants answer `[MODE: READ-ONLY ADVISORY]` and the owner transcribes. For every answer give a recommendation and the **strongest counter-argument**; cite files/commands where you verified something.

## Questions

1. **C1a acceptance**: what must the fail-safe Stop telemetry prove beyond "a row on every exit" (ordering, first-event rule, secret hygiene, rotation, write-failure)? Give one counterexample the current prompt does not cover.
2. **Data pipeline**: specify the minimal script that rebuilds `trials.jsonl` from archived evidence plus cost cards (cohort filters by `rep`, mandatory card coverage, no manual arithmetic). What invariant should it enforce so F-002/F-003 cannot recur?
3. **Local/free subjects**: on an 8 GB-VRAM Windows laptop, which local model(s) and which integration (`qwen-code` with Ollama, `codex --oss`, or a raw `/api/chat` runner) give the least fragile tool-using trials with exact token counts? Where is the evidence weakest?
4. **Audit closure**: Qoder's report declares `Receipt-Owner: qoder-86c43a9a02fd9789` while its journal is `qoder-4d1795a4ffecb995` (receipt stale). Re-issue or downgrade to advisory? What exactly must the final ordered record pass cover for this round (which owners, which order, what to do about codex's stale receipt)?
5. **Process traps**: critique the proposed freeze checklist (all digest-visible files including untracked; CI verified to completion; idle-only test adjudication; one subject per session). Name a failure mode it still misses.
6. **Cleanup vs v2.0**: which criteria should select between (a) ref-surface cleanup (delete stale branches/tags, archive reviews) and (b) a v2.0 history freeze that starts clean while the v1.x repo stays as the archive? What must be preserved absolutely, and what would you refuse to delete?
7. **Repomix value**: the post-mortem argues Arm B tested "read everything" rather than an index. Which of B2 (index + grep + slice reads), B3 (scoped pack), B4 (compressed map + targeted raw), C2 (MCP grep) should run first, with what pre-registered thresholds, and what is the strongest argument that even the index approach cannot pay off for this repository?
8. **MCP matrix** (Qdrant hybrid/payload/AST; Repomix MCP; Serena LSP/graph/overview-detail): for each row state the evidence that must exist before adoption, whether it is dead on arrival for this repo, and one falsifiable experiment that could promote it.
9. **Metric design**: total tokens vs fresh tokens vs cost; per-finding normalization; cache-heavy providers; how to pre-register without HARKing. What would you change in the v2 metric set?
10. **Adversarial hardening**: what would make external auditors FAIL a v2 pilot even if the numbers pass (design, evidence, governance)? Propose the two strongest adversarial tests to run against v2 before the audit round.
11. **Unaddressed risk**: name the single biggest risk the remediation plan still ignores.

## Deliverable format

- Recommendation per question (2-4 sentences) + strongest counter-argument (1-2 sentences).
- Any claim about the repository must cite the path (or a command you ran).
- No implementation, no commits; the owner decides.
