# COVERAGE-B - collector B draft (round 1)

Frame: `task:f02-collector-b` (parent F-02). Collector: `deepseek`. Date: 2026-09-26 (UTC).
Baseline: HEAD `adce6cc5213cd3906797a6a02b2982d13c094a28`, working tree dirty (F-02 round-1 dispatch;
other sessions' uncommitted work present). Scope: `round1/model-benchmark-evidence.jsonl` and this file.

This is one of two coverage drafts. Collector A writes `round1/COVERAGE-A.md`; the merged audit is
assembled at round 2. Nothing here is a verdict on the contract; `SUFFICIENT`/`COVERED` values are a
provisional read of raw rows and must be recomputed from the corrected data and A's registry.

## Deliverable

- `round1/model-benchmark-evidence.jsonl`: 53 rows, one observation per line, validated as JSON
  (script check: 53 lines, 53 unique row_ids, all schema fields present, source_class and
  comparability in the allowed sets).
- Rows by benchmark: swe-bench-pro 6, swe-bench-pro-v2 3, terminal-bench-4.0 17,
  terminal-bench-2.1 14, terminal-bench-hard 3, livecodebench 5, aider-polyglot 5.
- Rows by model: Opus 5.5 6, GPT-5.6 Sol 10, GPT-5.6 Terra 11, GPT-5.6 Luna 5, Gemini 3.8 Flash 7,
  Gemini 3.7 Flash 5, Gemini 3.6 Flash 3, DeepSeek V4.1 (Flash) 4, Mistral Medium 3.5 2.
- No row is written where no result was found (README rule 3). No estimate is recorded as a result:
  DeepSeek's explicitly "estimated" SWE-Bench Pro cell (~58) is excluded, not recorded.

## Method and provenance

- One bounded pass per (frozen model x benchmark of benchmark.md sections 2-8): official benchmark
  leaderboards first (Scale, tbench.ai, swelancer.github.io, Tencent-Hunyuan RepoProbe, alibaba
  AACR-Bench, aider.chat), then vendor cards, then independent evaluators/aggregators that name a
  primary source (Artificial Analysis via BenchLeader, Vals AI window via BenchLeader, benchlm,
  llm-stats, llmboard, benchmarklist, llmlearner, vibecoderjournal). Searches were run
  2026-09-26; `retrieved` is 2026-09-26 on every row.
- Every row carries source_url, publication/update date (or `null` when the page is undated; the
  note or locator then names the underlying release date), locator, `source_class` and a
  comparability note. `snapshot` is `null` on all rows: no archiving tooling was available in this
  run, so snapshot ids could not be produced. The verifier can re-open every URL.
- `source_class`: `vendor` = model maker's own report; `maintainer` = benchmark owner's own board
  (only the tbench.ai row); `independent` = third party (Artificial Analysis and Vals AI runs read
  through their aggregator mirrors, and aggregators such as llm-stats, benchlm, llmboard,
  benchmarklist, vibecoderjournal). Aggregator rows say so in the note; a vendor figure reproduced
  by a third-party page is marked `independent` and the note names the vendor card.
- Model naming follows the frozen working set; `model_version` keeps the source string.
  Identity mapping assumed and needing verification: frozen rung "DeepSeek V4.1 Max" = DeepSeek
  V4.1 Flash at maximum reasoning effort (route `deepseek/deepseek-flash`); frozen rungs
  "Gemini 3.x High" = "Gemini 3.x Flash (high)". Rows record the reported effort verbatim in
  `effort` (normalized XHigh/High/Medium/Low/Max/unknown); where the reported effort differs from
  the frozen rung this is stated in the comparability note.
- benchmark_id scheme used here: `swe-bench-pro`, `swe-bench-pro-v2`, `terminal-bench-4.0`,
  `terminal-bench-2.1`, `terminal-bench-hard`, `livecodebench`, `aider-polyglot`.
  A's `round1/benchmark-registry.json` did not exist when this file was written, so ids are NOT
  yet aligned. At round 2 these ids must be renamed to A's `id` values, and rows on benchmarks A
  EXCLUDES must be marked (README: they stay).

## Coverage per dimension (draft, on comparable-or-partial rows)

| Dimension | Seeded benchmark(s) | Frozen rungs with rows | Draft | Reason |
|---|---|---|---|---|
| D-IMPL | SWE-Bench Pro; SWE-Lancer IC | SBP: Opus 5.5, Sol, Terra, Luna, Gemini 3.6 (5/11); V2 adds Gemini 3.8, not comparable across versions | WEAK | below COVERED threshold (half of 11 = 6); SBP evidence is `partial` (vendor harnesses, contested benchmark validity), SWE-Lancer IC has 0 frozen rows |
| D-ARCH | RepoProbe; ArchBench | 0/11 | MISSING | RepoProbe paper (Aug 2026) evaluates 20 models, none frozen (newest GPT-5.4 / Opus 4.6); ArchBench public board shows only older generations (GPT-4, GPT-4o, DeepSeek-V2.5) |
| D-REV | AACR-Bench | 0/11 | MISSING | paper v3 evaluates Claude-4.5-Sonnet, GPT-5.2, DeepSeek-V3.2, GLM-4.7, Qwen-480B-Coder only; no live frozen-model leaderboard found |
| D-TERM | Terminal-Bench | 11/11 rungs on at least one version | COVERED | TB 4.0 covers 6 rungs (incl. all three Opus 5.5 efforts), TB 2.1 covers 8, Hard covers 3, vendor cards add more; comparability is `partial` across vendor/AA/maintainer runs |
| D-ALGO | LiveCodeBench | Gemini 3.8, 3.7, 3.6, Terra, Sol (5/11) | WEAK | below threshold; Vals window only |
| D-EDIT | Aider Polyglot | Sol, Terra, Luna, Gemini 3.8, DeepSeek (5/11) | WEAK | below threshold; maintainer board has no frozen rows, third-party re-runs with thin harness provenance (`partial`) |
| D-CRIT | SWE-Lancer Manager (proxy, WEAK cap) | 0/11 | MISSING | no public result for any frozen model; SWE-Lancer IC likewise has none (OpenAI stopped reporting it after GPT-5.1-Codex-Max, Nov 2025) |

D-DOC and D-SYN are local-only and expected MISSING; they are collector A's candidate pass, not
searched here.

## Per-model draft (raw-row basis; profiles recompute at round 2)

| Rung (frozen) | Dimensions with rows | Draft | Reason |
|---|---|---|---|
| Opus 5.5 XHigh | D-IMPL (SBP, Max effort only), D-TERM (TB4.0 xhigh + vendor) | PARTIAL | 2 dimensions; SBP effort mismatch (Max) |
| Opus 5.5 High | D-TERM (TB4.0 high) | PARTIAL | 1 dimension |
| Opus 5.5 Medium | D-TERM (TB4.0 medium) | PARTIAL | 1 dimension |
| GPT-5.6 Sol Medium | D-IMPL, D-TERM, D-ALGO, D-EDIT | SUFFICIENT (provisional) | 4 dimensions; D-ALGO/D-EDIT use Max-effort rows |
| DeepSeek V4.1 Max | D-TERM, D-EDIT | PARTIAL | 2 dimensions |
| Gemini 3.8 Flash High | D-IMPL (V2 only), D-TERM, D-ALGO, D-EDIT | SUFFICIENT (provisional) | 4 dimensions; D-IMPL rests on the V2 dataset |
| GPT-5.6 Terra High | D-IMPL (SBP + V2), D-TERM, D-ALGO, D-EDIT | SUFFICIENT (provisional) | 4 dimensions; TB4.0 high row is anomalous (see below) |
| GPT-5.6 Luna XHigh | D-IMPL, D-TERM, D-EDIT | PARTIAL | 3 dimensions |
| Gemini 3.7 Flash High | D-TERM, D-ALGO | PARTIAL | 2 dimensions |
| Gemini 3.6 Flash High | D-IMPL, D-TERM, D-ALGO | PARTIAL | 3 dimensions |
| Mistral Medium 3.5 | D-TERM | PARTIAL | 1 dimension; no Aider row recorded (only an unverifiable 72% aggregate claim found; deliberately not recorded) |

No frozen rung is INSUFFICIENT on the raw-row reading; all have at least one row. Under the README
thresholds (SUFFICIENT = COVERED-level rows on at least 4 of 6 benchmark dimensions) the three
provisional SUFFICIENT values depend on rows whose effort/comparability may fail round-2 checks.

## Searched, not found (no row written)

- SWE-Lancer IC and SWE-Lancer Manager: all 11 rungs. IC boards carry only GPT-5 / GPT-5.3-Codex /
  GPT-5.2 / GPT-4.x / o3-mini; Manager has no frozen-model results at all.
- RepoProbe, ArchBench, AACR-Bench: all 11 rungs (only older model generations evaluated).
- SWE-Bench Pro: Gemini 3.8 Flash, Gemini 3.7 Flash, DeepSeek V4.1 Flash, Mistral Medium 3.5.
- LiveCodeBench (Vals window): Opus 5.5 (one tracker lists it as "coming soon"), Luna,
  DeepSeek V4.1 Flash, Mistral Medium 3.5.
- Aider Polyglot: Opus 5.5, Gemini 3.7 Flash, Gemini 3.6 Flash, Mistral Medium 3.5 (maintainer board
  last updated Nov 2025; no Opus 5.5 or Mistral row found on the third-party board).
- Terminal-Bench: none missing (every rung has at least one row).

## Comparability warnings (round-2 material)

1. Same model + same benchmark, large vendor-vs-independent gaps: Opus 5.5 TB 4.0 66.4 (vendor
   harness, xhigh) vs 59.6 (AA, xhigh); Terra TB 4.0 23.6 (Google card) vs 35.4 (AA, max) with AA's
   high/medium/low rows at 1.5/1.0/1.5 (non-monotonic and suspicious); DeepSeek V4.1 Flash TB 4.0
   31.2 (vendor, DSH Minimal) vs 26.8 (AA, max). These rows must not be pooled without a harness
   note.
2. Effort mismatches: several rungs have rows only at a non-frozen effort; every such row says so.
   Rank/position inside a benchmark can change when only mismatch rows exist.
3. Terminal-Bench version choice is material: 2.1 is saturated near the top (several models >85),
   4.0 discriminates (Opus 5.5 59.6, Sol 39.9, many models <20), Hard sits between. A single
   retained "Terminal-Bench" entry must name its version; rows for the other versions are kept.
4. SWE-Bench Pro validity is contested: OpenAI's 2026-07-08 audit found 27.4-34.1% of the 731
   public tasks broken and retracted its recommendation (Artificial Analysis had already dropped
   it for contamination via commit history). It is still the only D-IMPL benchmark with frozen rows.
5. Aider Polyglot third-party rows claim Pass@2 on the 225-task set but sit 30+ points below the
   maintainer board's 2025 scale for older models; harness/effort provenance is thin. Treat as
   directional only until the verifier finds the primary runs.
6. Identity mapping for "DeepSeek V4.1 Max" is an inference (see above); if the owner means a
   different checkpoint, all 4 DeepSeek rows must be re-mapped.

## Findings for the frame (recorded, not applied)

- The seeded portfolio is mismatched to the frozen model generation: five of nine benchmarks
  (RepoProbe, ArchBench, AACR-Bench, SWE-Lancer IC, SWE-Lancer Manager) have zero evaluations of
  any frozen model as of 2026-09-26. This is a coverage saturation fact, not a request to change
  the contract; it belongs in the gate material.
- The only benchmark families that currently cover most frozen rungs are Terminal-Bench and (partly)
  SWE-Bench Pro, LiveCodeBench and Aider Polyglot. D-ARCH, D-REV and D-CRIT will most likely be
  MISSING/WEAK at the deadline regardless of further searching.
- No finding here would change the contract; none is applied.

## Open items for round 2

- Align benchmark_ids with `round1/benchmark-registry.json` when A publishes it; mark excluded
  benchmarks' rows (they stay).
- Verify the identity mapping for DeepSeek and the Gemini Flash effort labels.
- Check the Terra TB 4.0 anomaly at the source, and decide `partial` vs `none` for the Aider rows.
- Verify vendor rows (100% per README) and the two SWE-Bench Pro version families.
