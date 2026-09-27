# Methodology: Normalization, Provenance, and Evaluation Rules (v1)

Frame: `task:f02-collector-a` (parent frame: F-02, `docs/research/2026-09-26-model-layer/README.md`)  
Collector: `gemini` (Gemini 3.8 Flash high via agy)  
Date: 2026-09-26 (UTC)  
Authority: Frozen under PROTO-DEC-0080, PROTO-DEC-0084, and P-L0-008.

This document records the exact, binding methodology rules verbatim from the Frame F-02 Contract (`docs/research/2026-09-26-model-layer/README.md`). Changing any rule in this document requires an approved owner decision.

---

## 1. Contract Rules (Verbatim)

1. **Tasks relate to dimensions, never to benchmarks.** Benchmark-to-dimension mapping lives only in the registry. Task-to-benchmark relevance is derived, never stored.
2. **Scales in v1 are ordinal only:** `HIGH`, `MEDIUM`, `LOW`, `NONE`, each with a reason. No numeric relevance or importance weights.
3. **A model-benchmark pair with no found result stays UNKNOWN.** No row is written for it, and no score is inferred or invented.
4. **Raw scores are always kept.** Absolute scores of different benchmarks are never compared.
5. **Comparability:** `full` only when benchmark version, harness, tool permissions and reasoning budget match materially; otherwise `partial` or `none`, with a note. Rows marked `none` are kept but do not enter profiles.
6. **Provenance for every registry entry and evidence row:**
   - source URL;
   - publication or update date;
   - retrieval date;
   - locator (table, section or row);
   - source class: `vendor`, `maintainer` or `independent`;
   - snapshot id (archive URL or content hash) where practical.
7. **A benchmark enters the registry only if it improves coverage of a frozen dimension.** Its existence is verified from a primary source before it is RETAINED.

---

## 2. Normalization Rules (Verbatim)

- **Per benchmark, over comparable (`full` or `partial`) rows of frozen working models:**
  $n$ is the number of such models, and rank $r = 1$ is the best, following the metric's direction.
  - When $n \ge 2$:
    $$\text{position} = \frac{n - r}{n - 1}$$
    so the best is $1.0$ and the last is $0.0$.
  - Ties take the average rank.
  - When $n = 1$: no position; the raw score only. A lone model is not "best", so $1.0$ would claim a comparison that did not happen.
  - `raw_score`, `metric`, `rank`, `n` and `position` are all kept.
- **Per model and dimension:**
  `position` is the median over the benchmarks that measure the dimension with strength `HIGH` or `MEDIUM`.
- **Confidence:**
  - `HIGH`: at least 2 benchmarks, $n \ge 4$, and at least one independent source;
  - `MEDIUM`: 1 benchmark, or vendor-only sources;
  - `LOW`: `partial` comparability only.
- **Coverage per dimension:**
  - `COVERED`: at least 1 RETAINED benchmark with strength `HIGH`, and comparable rows for at least half of the frozen working models (at least 6 of 11);
  - `WEAK`: some evidence, below that threshold, or proxy evidence only (`evidence_type: proxy`, with a reason stating what the proxy does not measure);
  - `MISSING`: none.
- **Evidence status per model:**
  - `SUFFICIENT`: COVERED-level rows on at least 4 of the 6 benchmark dimensions;
  - `PARTIAL`: 1–3;
  - `INSUFFICIENT`: 0.
- **Profiles are recomputed from the rows by the written procedure**, by hand or by a throwaway script kept in the frame. They are never edited by hand.

---

## 3. Operational Definitions & Pipeline Requirements

### 3.1 Frozen Working Model Snapshot
The frozen working set comprises 11 ladder rungs from `docs/ops/MODEL-ECONOMICS.md` (snapshot 2026-09-25 evening, commit `0200730326d107ad76f706e05762adea161ee603`):
1. Opus 5.5 XHigh (`claude`)
2. Opus 5.5 High (`claude`)
3. Opus 5.5 Medium (`claude`)
4. GPT-5.6 Sol Medium (`codex`)
5. DeepSeek V4.1 Max (`kilo` with owner's key)
6. Gemini 3.8 High (`agy`, `gemini-3.8-flash-high`)
7. GPT-5.6 Terra High (`codex`)
8. GPT-5.6 Luna XHigh (`codex`)
9. Gemini 3.7 High (`agy`, `gemini-3.7-flash-high`)
10. Gemini 3.6 High (`agy`, `gemini-3.6-flash-high`)
11. Mistral Medium 3.5 (`vibe`)

### 3.2 Six Core Benchmark Dimensions
1. `D-IMPL`: repository implementation and bug fixing
2. `D-ARCH`: architecture and repository comprehension
3. `D-REV`: code review
4. `D-TERM`: terminal, debugging and autonomous execution
5. `D-ALGO`: algorithmic coding
6. `D-EDIT`: code editing and patch-instruction following

Auxiliary dimensions:
- `D-DOC`: document and rule comprehension (local only; expected MISSING)
- `D-CRIT`: adversarial review and critical analysis (proxy: SWE-Lancer Manager, capped at WEAK; local tests otherwise)
- `D-SYN`: multi-document synthesis (local only; expected MISSING)

### 3.3 Verification Protocol (Round 2)
The independent verifier checks:
- 100% of registry entries for existence;
- 100% of `vendor` rows;
- 100% of the rows that decide the top position of any dimension;
- A seeded random sample of $\ge 20\%$ of remaining rows.
