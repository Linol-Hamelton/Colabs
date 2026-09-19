# H1 Repomix Pilot - Preliminary Report (Repetition 1)

**Date**: 2026-09-19  
**Baseline**: `001af50` (all trials branched from it)  
**Author**: DeepSeek (deepseek-flash), controller  
**Status**: preliminary (repetition 1 of 3; parallel launch, timing metrics non-authoritative)  
**Verdict**: **Arm B FAILS the pre-registered adoption gate** under both token definitions; the stop rule from `PROTO-DEC-0035` applies - document the negative result, do not adopt the MCP path, and do not proceed to Arm C.

## 1. Method

- Arms: A control (no digest) vs B (pinned raw Repomix digest generated before the task; advisory, no `--compress`).
- Ten tasks (five broad audits T1-T5, five narrow edits T6-T10), repetition 1, subject DeepSeek V4 Pro (provider `deepseek`, high), one fresh worktree per trial.
- Quality: narrow tasks by their own tests; broad audits by substantive file-referenced findings; verified idle where needed.
- Raw data: `.ai/runtime/pilot-data/trials.jsonl` (22 rows including the smoke reference); per-trial evidence under `.ai/runtime/pilot-data/evidence/<trial>/`.

## 2. Results (median per arm)

| Metric | Arm A | Arm B | Threshold | Result |
|---|---|---|---|---|
| Broad tasks, total tokens (in + cache read + out) | 846,291 | 1,462,335 | >= 25% reduction | **+72.8% (worse)** |
| Narrow tasks, total tokens | 493,922 | 908,268 | <= +5% | **+83.9% (worse)** |
| Broad tasks, fresh tokens only (in + out) | 73,269 | 79,935 | >= 25% reduction | +9.1% (worse) |
| Narrow tasks, fresh tokens only | 44,728 | 64,913 | <= +5% | +45.1% (worse) |
| Cost, batch total | $0.349 (9 cards) | $0.495 | - | +42% |
| Quality | T1-T8, T10 pass; T9 failed (telemetry anomaly), repeat passed | T1-T10 pass (T9 passes on full suite) | no regression | equal |

Per-task totals are in `trials.jsonl`; the missing Arm A T4 usage card ($0.04-class) does not change the medians materially.

## 3. Observations

1. **The raw digest is an all-files read.** Control sessions read only the files they need; Arm B sessions read (or at least loaded into context) the whole digest - measured up to 2.18M cache-read tokens in a single trial - and often explored on top of it, because the digest was advisory rather than a substitution discipline.
2. **Arm B produced more thorough audits** (T4: 18 file references vs A's 10; journals 1.8-3.7 KB vs 1.2-2.9 KB) and used more steps (13-26 vs 10-19). The token metric therefore mixes "overhead" with "more work". Pre-registration forbids redefining the metric after seeing the data; the observation is recorded, not used to excuse the result.
3. **Latency outlier**: B-T2 ran 2306 s (38 min) versus ~230-800 s for the rest; its token count was still mid-range.
4. **Cache hit rates were 89-95% in both arms**; cache-read tokens dominate totals in both, so the primary comparison is stable across the fresh-only view as well (B worse in both).
5. **Digest usage varies**: all B worktrees generated the digest; some journals never mention reading it, yet those trials still cost more than their Arm A counterparts.

## 4. Caveats

- One repetition, launched in parallel (cost/latency caveats); flagship subject; ten tasks.
- A free-tier confirmation repetition (Gemini CLI or Qwen Code) can be run at zero API cost if the owner wants a second data point; the gate already fails, so a confirmation can only confirm the negative.

## 5. Decision

- `PROTO-DEC-0035` stop rule executed: **no MCP adoption, no Arm C**. The universal digest remains an optional, on-demand, advisory helper exactly as documented (`PROTO-DEC-0034`); it is not auto-injected and not a gate input.
- The MCP cooperation matrix discussion (post-pilot) now has its evidence base: the tested digest layer did not reduce tokens for this task set; any future candidate must beat the same pre-registered gate.

## 6. Next steps

1. Optional free-tier confirmation repetition (broad tasks only).
2. Cleanup: remove the 22 pilot worktrees after the owner's decision (evidence already archived under `.ai/runtime/pilot-data/evidence/`).
3. Proceed to the external audit round and the repository cleanup/v2.0 discussion.
