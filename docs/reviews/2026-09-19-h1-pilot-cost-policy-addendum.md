# H1 Pilot Addendum - Cost Policy and Idle-Only Adjudication

**Date**: 2026-09-19  
**Applies to**: `docs/reviews/2026-09-19-h1-pilot-runbook.md`  
**Author**: DeepSeek (deepseek-flash), controller; owner directive on cost (chat, 2026-09-19)

## 1. Model policy (owner directive)

1. **Default trial subject**: the cheapest adequate model - `DeepSeek V4.1 Flash` (or the cheapest current DeepSeek tier). Flagship models (`Claude Opus`, `GPT-5.x`, `DeepSeek V4 Pro`, `Gemini Pro` tiers) are **not** used for routine pilot repetitions.
2. **Free-tier subjects preferred** where available: Gemini CLI (free tier, 60 rpm / 1000 rpd; JSON output carries usage), Qwen Code (free OAuth tier). These make repetitions effectively free and should carry the remaining reps.
3. **Flagship models** are reserved for the final certification/adversarial rounds and, at most, one cross-model variance sample per arm when the owner approves the spend.
4. **Local models** (Ollama/vLLM) are acceptable for pipeline smoke tests only; their audit quality is below the pilot's quality bar.

## 2. Batch cost control

- Every batch is estimated before launch (sessions x expected tokens x provider price) and pre-approved by the owner; no silent repetitions.
- Repetitions: 3 reps per arm only for cheap/free subjects; flagship subjects get 1 rep maximum.
- The current Arm B batch on `DeepSeek V4 Pro` is the **last paid-flagship batch** unless the owner explicitly approves another; the T9 repeat already ran within it.
- Failed trials are repeated once on the cheapest adequate model, not on the original flagship.

## 3. Idle-only adjudication (finding from the T9 repeat)

The T9 repeat's implementation is correct (`whoami` now emits `hostname: os.hostname()` and the assertion was added), but its suite run failed on the heavy `A1 branch 11` test with `status: null` after 126 s - a load-induced child timeout while eleven sessions ran in parallel. Rule: **quality and test adjudication runs only when the batch is idle**. Any trial whose suite ran under load is re-verified after the batch finishes before `quality_pass` is finalised.

## 4. Consequence for the current run

Arm B (`B-1..B-10`, DeepSeek V4 Pro) continues as launched; when it finishes, the controller: (a) re-runs failed/heavy tests in each worktree with the machine idle, (b) collects telemetry and diffs, (c) records rows, (d) waits for the owner's per-session usage numbers. Rep 2/3 and Arm C switch to the cheap/free subjects above.
