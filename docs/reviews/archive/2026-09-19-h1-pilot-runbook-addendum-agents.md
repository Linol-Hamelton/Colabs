# H1 Pilot Runbook Addendum - Agent Manager Execution

**Date**: 2026-09-19  
**Applies to**: `docs/reviews/2026-09-19-h1-pilot-runbook.md`  
**Author**: DeepSeek (deepseek-flash), controller

## 1. Isolation: worktrees are allowed

Agent Manager `worktree` mode creates a fresh isolated working tree per trial (shared `.git`, separate files) and removes it afterwards. For the pilot's file-level tasks this is equivalent to the runbook's clone requirement; every trial still starts from the baseline commit and is deleted after the data copy. Clones remain the fallback for CLI sessions.

## 2. Concurrency: sequential

Run one trial at a time. Parallel sessions distort `durationSec`/`firstEditMs`, compete for machine resources and can hit provider rate limits. Token metrics are more robust, but the pre-registered thresholds include wall-time-adjacent signals; keep the environment steady (runbook section 8).

## 3. Model selection

Each session must pin its model explicitly from the catalog (subject model + variant). The catalog in this installation already provides the council models through the Kilo provider, for example: `Anthropic: Claude Opus Latest`, `Gemini 3.8 Flash` (google), `DeepSeek V4 Flash` (deepseek), `Qwen: Qwen3 Coder 480B A35B`, `Mistral: Mistral Medium 3.5`, `GLM-5.3`. Minimum three fixed models; the same set for every arm. Never use auto-routing models (`Auto *`) as subjects.

## 4. Token accounting - the one open dependency

The primary metric needs per-trial token usage. The harness UI shows session usage/cost for Agent Manager sessions; the controller cannot read usage programmatically. Therefore:

1. Preferred: the owner (or the operator) exports the per-session input/output token counts from the UI into the trial row (`token_source: "orchestrator"`).
2. Fallback: `token_source: "bytes4"` requires request/response byte counts, which the controller cannot reconstruct reliably from transcripts (tool output is excluded from recall). If neither is available, the trial records `token_source: "unavailable"` and the primary threshold cannot be evaluated.
3. Prerequisite before scaling to 90 trials: run one Arm A trial and confirm that usage data is retrievable. If it is not, the pilot's primary metric needs a redesign decision by the owner (for example, harness-level usage export or a proxy metric), taken before further spend.

## 5. What the controller collects automatically

After each trial: the worktree diff (quality rubric, out-of-scope check), `.ai/runtime/metrics/sessions.jsonl` (telemetry fields), the journal entry and any task-specific test output. The controller writes `pilot-data/trials.jsonl` and the final report; the owner supplies token usage (section 4).

## 6. First batch proposal

Arm A (control), one model, ten tasks, one repetition: ten sequential sessions, one fresh worktree each, the filled trial prompts from the template. This validates the whole pipeline end to end at minimal cost before expanding to Arm B and the remaining models.
