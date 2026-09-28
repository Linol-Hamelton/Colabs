# MiMo-V2.6-Pro - F-18 bench catalog 20% sample verification

**Date**: 2026-09-28
**Reviewed commit**: e31a31a7e7be4c7a86ed984ea95fc5153cd94dd3
**Working tree**: dirty (this review + verifier journal only; no CATALOG/COVER/MERGE edits)
**Reviewer**: MiMo-V2.6-Pro (mimo CLI)
**Scope**: audit
**scope-check**: PASS
**Verdict**: RECOMMENDATION
**Mode**: CERTIFYING
**Receipt-Owner**: mimo-4aeecec4ecf66249
**Receipt**: see journal entry Evidence block via `node .ai/bin/protocol-handoff.cjs record --quick --owner mimo-4aeecec4ecf66249`

---

## Executive Summary

Independent 20% sample (10/48 rows, file-order 5,10,15,20,25,30,35,40,45,48) of
`docs/research/2026-09-28-bench-catalog/CATALOG.jsonl`. Nine rows CONFIRM; one row UNSURE
(HTTP 403 on a single score source); zero REJECT. No sampled score value or model id was
found wrong against its cited source. Overall verdict: **RECOMMENDATION**.

---

## Scope and Evidence

- **Baseline Commit**: `e31a31a7e7be4c7a86ed984ea95fc5153cd94dd3` (`git rev-parse HEAD` at start)
- **Working Tree State**: dirty (review + journal only)
- **Artifact under test**: `CATALOG.jsonl` (48 rows; mechanical merge A+B per `MERGE-NOTE.md`)
- **Sample rule**: file-order rows 5, 10, 15, 20, 25, 30, 35, 40, 45, 48
- **Commands & Tests Executed**: live public-web fetch of each row `url` and every
  `scores[].source_url` (WebFetch; Firecrawl scrape where client-rendered or 403-blocked);
  `git rev-parse HEAD`; `protocol-session.cjs start --agent mimo`
- **Environment**: Windows PowerShell session; Node.js available for protocol tools

---

## Per-row verdicts

### Row 5 - aider-polyglot - CONFIRM

- **Opened**: https://aider.chat/2024/12/21/polyglot.html (row url + all three score source_urls; same page)
- **Judgment**: Aider project; Dec 2024 snapshot (stale OK); 225 hard Exercism exercises in C++/Go/Java/JS/Python/Rust; D-IMPL OK; contamination medium is collector classification.
- **Scores**:
  - `o1-2024-12-17 (high)` 61.7% / 91.5% - stated exactly on the page
  - `claude-3-5-sonnet-20241022` 45.3% / 100.0% - stated exactly
  - `Qwen2.5-Coder-32B-Instruct` 8.0% / 71.6% - stated exactly
- **Reasoning**: value, model id, and design note (scores spread ~5%-50%) all match the cited snapshot.

### Row 10 - evalperf - CONFIRM

- **Opened**: https://github.com/evalplus/evalplus/blob/master/docs/evalperf.md
- **Judgment**: EvalPlus project; active; COLM'24 efficiency benchmark (118 performance-exercising tasks, DPS metric); D-IMPL OK.
- **Scores**: empty `scores[]` is correct - the accessed primary source publishes no working-ladder model score table.
- **Reasoning**: existence, owner, measures, and empty scores all check out; nothing invented.

### Row 15 - mbpp-v1 - CONFIRM

- **Opened**:
  - https://github.com/google-research/google-research/tree/master/mbpp
  - https://evalplus.github.io/results.json
- **Judgment**: Google Research; ~1,000 crowd-sourced Python problems with description, reference solution, and automated tests; train/validation/test task-id splits; hand-verified sanitized subset - all stated in the README. Stale + high contamination risk is a fair collector call for a long-public fixed corpus.
- **Scores**:
  - `Qwen2.5-Coder-32B-Instruct` pass@1=90.5 (mbpp) - exact match in results.json
  - `DeepSeek-V3 (Nov 2024)` pass@1=87.6 (mbpp) - exact match in results.json
- **Reasoning**: values and model ids match the cited JSON. Minor note: the parenthetical "(greedy; ...)" is not stated in results.json (only `pass@1` / `mbpp`); the score value and model id themselves are correct.

### Row 20 - swe-bench-pro - UNSURE

- **Opened**:
  - https://labs.scale.com/leaderboard/swe_bench_pro
  - https://llm-stats.com/benchmarks/swe-bench-pro
  - https://www.morphllm.com/claude-benchmarks
  - https://www.datacamp.com/blog/gemini-3-8-flash-cyber - **HTTP 403**
  - https://localaimaster.com/models/swe-bench-explained-ai-benchmarks
- **Judgment**: Scale AI (SEAL); active; contamination-resistant long-horizon SWE benchmark with public/private/held-out subsets - confirmed on the Scale page. D-IMPL / low risk OK.
- **Scores**:
  - `Claude Opus 5.5` 0.899 - CONFIRMED on llm-stats (leader, 59 models)
  - `Claude Opus 4.8` 69.2% - CONFIRMED on morphllm (vendor-run column)
  - `Muse Spark 1.1` 61.5% - CONFIRMED on localaimaster (and matches Scale SEAL #1 61.50)
  - `Gemini 3.8 Flash` 61.6% - **UNSURE**: cited source datacamp.com returned HTTP 403; value not verified
- **Reasoning**: three of four scores and the benchmark identity check out; one score source is unreachable (403), so the row cannot be full CONFIRM and is not wrong enough to REJECT.

### Row 25 - contextcrbench - CONFIRM

- **Opened**:
  - https://github.com/kinesiatricssxilm14/ContextCRBench
  - https://arxiv.org/abs/2511.07017 (linked from the repo README; used to check measures claims)
- **Judgment**: D-REVIEW OK; fine-grained code review with hunk-level quality assessment, line-level defect localization, line-level comment generation - exact match to the paper abstract. 67,910 entries from 153.7K issues/PRs - exact match. ByteDance deployment - stated in the abstract.
- **Scores**: empty `scores[]` is valid under "unknown stays unknown" (no score copied from the primary repo URL).
- **Reasoning**: maintainer "unknown" is honest (repo under a non-personal GitHub handle; no maintainer name in repo metadata). Nothing invented.

### Row 30 - cyberseceval-v1 - CONFIRM

- **Opened**: https://arxiv.org/abs/2312.04724
- **Judgment**: Meta / Purple Llama; Dec 2023 paper (stale OK relative to CyberSecEval 2/3 rows); insecure-code generation + cyberattack-compliance; automated test-case generation and evaluation pipelines; seven-model case study (Llama 2, Code Llama, OpenAI GPT) - all in the abstract. D-SEC OK.
- **Scores**: empty `scores[]` is correct - the abstract gives no per-model score.
- **Reasoning**: every recorded claim is stated by the cited source.

### Row 35 - secbench-vulnerability-patches - CONFIRM

- **Opened**: https://github.com/TQRG/secbench
- **Judgment**: TQRG / Sofia Reis and Rui Abreu (cited publications); stale OK (2020 update, "new version in progress"); 676 real security vulnerabilities from 114 projects; vulnerable and fixing commits; CWE classification; CVE severity where available - all in the README. D-SEC / high risk OK for a long-public vulnerability corpus.
- **Scores**: empty `scores[]` is correct - vulnerability-patch corpus, not a frontier leaderboard.
- **Reasoning**: values and identity match the official repository.

### Row 40 - arc-agi-3 - CONFIRM

- **Opened**:
  - https://arcprize.org/leaderboard (row url + score source_url; Firecrawl scrape for the client-rendered table)
  - https://benchlm.ai/benchmarks/arcagi3 (corroboration named in notes)
- **Judgment**: ARC Prize Foundation; active; interactive novel-reasoning tasks with cost-per-task efficiency; Standard vs Provider Adapter harness split - confirmed. POSSIBLE_FUTURE_DIMENSION is a reasonable non-coding classification. Low contamination risk OK (private task set, high run cost).
- **Scores** (Standard harness, as recorded):
  - `GPT-6 Astra (Max)` 62.7% - exact match on arcprize (also 98.6% / $17.3K Provider Adapter, as notes say)
  - `Claude Opus 5 (High)` 30.2% - exact match
  - `Gemini 3.8 Flash (High)` 10.4% - exact match
- **Notes check**: GPT-5.6 Sol Max 7.8%, Terra Max 0.8% - both on the official board. BenchLM top three match.
- **Reasoning**: every score and model id is stated by the cited official leaderboard.

### Row 45 - humaneval-contamination-cdd - CONFIRM

- **Opened**: https://arxiv.org/abs/2603.03203
- **Judgment**: Omer Sela / CDD study (maintainer label acceptable); active (Mar 2026 paper + code); controlled contamination experiments on HumanEval, GSM8K, MATH; CDD peakedness vs perplexity and Min-k% Prob - all in the abstract. POSSIBLE_FUTURE_DIMENSION / high risk OK for a contamination study.
- **Scores**: empty `scores[]` is correct - no HumanEval model score is published on the abstract page.
- **Reasoning**: qualitative claims in notes match the abstract; nothing invented.

### Row 48 - omega - CONFIRM

- **Opened**: https://allenai.org/blog/omega (Firecrawl scrape after direct fetch returned 403; page itself HTTP 200)
- **Judgment**: Allen Institute for AI (Ai2; Nouha Dziri); June 24 2025 announcement; three axes (exploratory, compositional, transformative); six math domains; 40 programmatic templates; GRPO study on Qwen2.5-7B variants - all stated on the page.
- **Scores**: empty `scores[]` is correct - the announcement names DeepSeek-R1, Claude 3.7, o3-mini, o4-mini and GRPO-tuned Qwen2.5 variants but publishes no per-model score table. Status "unknown" is honest (no maintenance evidence beyond the post).
- **Notes check**: ~38% of DeepSeek-R1 incorrect responses initially contained the correct answer - stated on the page.
- **Reasoning**: identity, measures, and empty scores all check out.

---

## Totals

| Verdict | Count | Rows |
|---|---:|---|
| CONFIRM | 9 | 5, 10, 15, 25, 30, 35, 40, 45, 48 |
| REJECT | 0 | - |
| UNSURE | 1 | 20 |
| **Total sampled** | **10** | 20% of 48 |

---

## Overall verdict: RECOMMENDATION

No sampled row has a wrong score value or wrong model id against its cited source
(zero REJECT). One row (20) is UNSURE solely because
`https://www.datacamp.com/blog/gemini-3-8-flash-cyber` returned HTTP 403 and its
`Gemini 3.8 Flash` 61.6% figure could not be opened; the other three scores on that row
were confirmed. Per the launch rule ("RECOMMENDATION if no sample row has a wrong value"),
the catalog sample supports the exit artifact.

Optional follow-up (not blocking): re-open the DataCamp Gemini 3.8 Flash source when
reachable; drop or source-check the unsourced "(greedy)" qualifier on row 15 score labels.

---

## References

- Frame rules: `docs/research/2026-09-28-bench-catalog/README.md`
- Exit artifact: `docs/research/2026-09-28-bench-catalog/CATALOG.jsonl`
- Merge/dup: `MERGE-NOTE.md`, `COVER-DUP.md`
- Launch: `docs/research/2026-09-28-bench-catalog/LAUNCH-F18-VERIFY.md`
- Associated session journal: `.ai/worklog/mimo-4aeecec4ecf66249.md`
