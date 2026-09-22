# R5 Discussion - Pilot v2 Arms and Thresholds

**Date**: 2026-09-19  
**Participants**: DeepSeek V4.1 Flash (via Kilo Agent Manager) and Gemini (via the Antigravity CLI, `agy`)  
**Purpose**: owner asked these two parties to settle the v2 arms and threshold table between themselves; the owner decides on their joint recommendation.  
**Inputs to read**: `docs/reviews/2026-09-19-h1-pilot-postmortem-and-repomix-paths.md`, `...-h1-pilot-report.md`, `...-h1-pilot-report-correction.md`, `...-v2-remediation-plan.md`, `PROTO-DEC-0035`, `...-owner-run-policy.md`.

## Context (agreed facts)

- Pilot v1 Arm B measured an *additional all-files digest read* on top of exploration: broad total tokens +72.8%, narrow +60.2% (repetition-1 cohorts; correction addendum).
- The post-mortem concludes the "index, not context" pattern was never tested and proposes arms **B2** (on-disk digest, `rg`-only access plus small slice reads, whole-file read forbidden), **B3** (per-task scoped pack, 3-6 files), **B4** (compressed map plus targeted raw reads), **C2** (Repomix MCP sandbox with `grep_repomix_output`/`read_repomix_output` slices, MCP clients only).
- v1 thresholds: >= 25% median broad total-token reduction, <= +5% narrow regression, handoff completeness not below control, schema <= 1500 for MCP. Council proposals differ: CodeGeeX suggested 20% / +3%; Gemini proposed cost-weighted tokens and tokens-per-finding.
- Subject policy: tests run on free/local models; paid models for analysis/coding only; Gemini is an exception with moderation. Local stack: `omnicoder-2-9b`, `qwen3:8b` (Ollama, pulling now); HF Inference API is the owner's requested alternative to `qwen-code`.

## Questions (answer each with recommendation + strongest counter-argument)

1. Which arms should v2 run, in what order, and why? Is B2 alone enough to falsify or confirm the index pattern, or are B3/B4 required before any conclusion?
2. Primary metric: total tokens (in + cache read + out), fresh tokens (in + out), cost-weighted, or a combination? State the exact formula and the tie-breaker rule.
3. Threshold numbers: keep 25% / +5%, adopt CodeGeeX's 20% / +3%, or propose another pair? Justify with a concrete false-positive/false-negative argument.
4. Secondary metrics: adopt "tokens per accepted finding" and "tool-call success rate"? Who or what counts as "accepted" (owner, auditor, automated check), and how is that not subjective?
5. Subject set and repetitions for v2 under the free/local policy: which models, how many tasks, how many reps, parallel or sequential? Define a minimal viable run if the budget is halved.
6. Pre-registered stop: what result would make you abandon the Repomix index path permanently for this repository (not just this round)?
7. Adversarial tests: pick the two strongest pre-audit tests (placebo index, threshold-tampering detection, selection-bias reversal, stub-verifier mismatch) and specify their pass criteria.
8. Disagreement check: do you accept the post-mortem's claim that v1 Arm B measured read-all overhead rather than index value? If not, give the counter-evidence and the experiment that would settle it.

## Output

A short joint recommendation (or two clearly separated positions) covering questions 1-8. Cite repository paths for claims. No implementation, no commits; the owner decides.
