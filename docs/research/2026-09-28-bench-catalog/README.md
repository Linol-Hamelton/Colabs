# Frame F-18: benchmark catalog for the working ladder (S2, minor)

Owner directive 2026-09-28 (AUTOCYCLE-1 section 12 item 7; PROTO-DEC-0094 B.2): open one minor frame
in stream S2 for the benchmark catalog, exempt from the R-L0-22.43 DIG ratchet for this frame only.

Admission fields (R-L0-22.13):

1. The decision that depends on it: the ladder calibration of the quality metric (PROTO-DEC-0084
   item 9; `docs/ops/MODEL-ECONOMICS.md`, "Next step" items 3-4) and the working-ladder tiers.
2. One primary question: which public benchmarks measure each F-02 dimension (D-IMPL, D-ARCH,
   D-DEBUG, D-SEC, D-REVIEW, D-SYN) well enough to calibrate the working-ladder models, and what
   verified evidence exists that each named model was actually scored on them?
3. Alternatives: (a) keep the catalog empty and the quality metric at provisional v0; (b) build it
   from vendor claims alone without verification; (c) this frame: a verified catalog from public
   sources with a source for every row.
4. Budget: participants - two collectors (vibe with Mistral Medium 3.5; codex with GPT-5.6 Luna)
   plus one verifier from another family (MiMo-V2.6-Pro, 20% sample); one reasoning round; deadline
   2026-09-28 23:00 MSK (NIGHT_END).
5. Exit condition: `docs/research/2026-09-28-bench-catalog/CATALOG.jsonl` with one row per
   benchmark: name; URL and date; owner/maintainer; active or stale; what it measures; the F-02
   dimension or POSSIBLE_FUTURE_DIMENSION; contamination risk; which working-ladder models have
   public scores, each with its source. `protocol-ledger.cjs cover` reports full coverage; no value
   is invented - unknown stays unknown.

Minor per R-L0-22.8: one question, one executor role (the collector pair is one measurement step),
one reasoning round, no kernel-architecture change, no new permanent mechanism. The verifier is the
independent check required by AUTOCYCLE section 12 item 7.

Collector split (to avoid duplicate work; the cover/dup check still runs at the end):

- Collector A (vibe): the general and reasoning benchmarks - MMLU-Pro and successors, GPQA, ARC-AGI,
  HLE, AIME/OMEGA-style math, SWE-bench Verified and its variants, LiveCodeBench, plus agentic
  benchmarks (SWE-Lancer, OSWorld, tau-bench, GAIA).
- Collector B (codex): the implementation and review benchmarks - HumanEval/MBPP line and their
  successors, RepoBench, BigCodeBench, Codeforces/CodeElo, security benchmarks (Cybench, SecBench
  and successors), review/verification benchmarks, and contamination studies for the above.

Rules for both collectors: public sources only (paper page, leaderboard, repository, vendor model
card); each row carries the source URL and the access date; a model score is recorded only when the
source states it, with the model id exactly as the source writes it; the vibe logs are checked for
"falling back" before the model label is recorded (PROTO-DEC-0094 B.1/B.5).
