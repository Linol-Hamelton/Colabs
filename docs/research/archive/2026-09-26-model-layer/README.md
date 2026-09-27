# F-02 Model-evidence layer (R-3) - admission

Frame F-02, stream S2, major. Governed by P-L0-008 (0.3). Decisions: PROTO-DEC-0080, PROTO-DEC-0084.
Status: admitted; round 1 waits for the owner to name the executors.

## Admission (R-L0-22.13)

- **Decision it serves:** the owner's ACCEPT of the model-evidence contract and data that Model
  Resolver v0/v1 reads as its model-profile source (canonical in `docs/ops/model-evidence/` after
  ACCEPT), plus a proposal of task-class requirements for P-L2-002.
- **Primary question:** What minimal, verifiable and maintainable evidence base on model
  capabilities is sufficient for Model Resolver v1?
- **Alternatives:**
  - (a) status quo: provider pages (rank, price) plus the owner's ladder, no capability evidence;
  - (b) the benchmark-based evidence base defined below;
  - (c) local evaluations first. Not now: no run records (A-10), and local evaluations are out of
    F-02 scope (PROTO-DEC-0084 item 3).
- **Budget:** round 1 with collectors A and B in parallel; round 2 with one verifier plus targeted
  corrections; then the gate. Deadline 2026-09-29. Executors are named by the owner at launch. The
  verifier's family differs from both collectors' families and is neither Claude nor DeepSeek.
- **Exit condition:** see "Exit" below, or the deadline, whichever comes first.

## Frozen inputs

- Capability dimensions (PROTO-DEC-0084 item 2). Frozen: none is added, removed or renamed in F-02.

  | Id | Dimension | Public evidence expected |
  |---|---|---|
  | D-IMPL | repository implementation and bug fixing | benchmark.md section 2 |
  | D-ARCH | architecture and repository comprehension | section 3 |
  | D-REV | code review | section 4 |
  | D-TERM | terminal, debugging and autonomous execution | section 5 |
  | D-ALGO | algorithmic coding | section 6 |
  | D-EDIT | code editing and patch-instruction following | section 7 |
  | D-DOC | document and rule comprehension | local only; expected MISSING |
  | D-CRIT | adversarial review and critical analysis | local; SWE-Lancer Manager (section 8) as proxy only, at most WEAK |
  | D-SYN | multi-document synthesis | local only; expected MISSING |

- Frozen working set (explicit; a later edit of MODEL-ECONOMICS.md does not change it):

  ```yaml
  working_model_snapshot:
    observed_at: 2026-09-25
    source: docs/ops/MODEL-ECONOMICS.md ("Owner's working ladder, snapshot 2026-09-25 evening")
    source_commit: 0200730326d107ad76f706e05762adea161ee603
    source_blob: 3a38746c382abb0781237c7722e464deb7684a54
    models:            # one per ladder rung, verbatim model and effort, with its route
      - Opus 5.5 XHigh (claude)
      - Opus 5.5 High (claude)
      - Opus 5.5 Medium (claude)
      - GPT-5.6 Sol Medium (codex)
      - DeepSeek V4.1 Max (Kilo with the owner's key; long tasks only after the owner's manual approval)
      - Gemini 3.8 High (agy, gemini-3.8-flash-high)
      - GPT-5.6 Terra High (codex)
      - GPT-5.6 Luna XHigh (codex)
      - Gemini 3.7 High (agy, gemini-3.7-flash-high)
      - Gemini 3.6 High (agy, gemini-3.6-flash-high)
      - Mistral Medium 3.5 (vibe)
  ```

  Models outside the ladder (copilot, Kilo gateway models, kimi, grok, agy's Claude 4.6 and
  GPT-OSS) are outside the frozen working set (PROTO-DEC-0084 item 4).
- Seeds: `OwnerIdeas/benchmark.md` (sections 1-8, the Master Research Brief evaluation criteria),
  `OwnerIdeas/task_profife.md` (task class, benchmark proximity), `OwnerIdeas/executor.md`
  (matching). These are seeds, not requirements.

## Out of scope (stop and return a finding instead)

- local evaluations, test suites or harnesses for any dimension;
- resolver code (A-3), formulas, bandits, learned weights, numeric relevance weights;
- new dimensions (a benchmark for another capability is recorded as a FUTURE finding
  `POSSIBLE_FUTURE_DIMENSION`, under the candidate cap);
- benchmark collection for models outside the frozen working set;
- an automatic enrichment job;
- the H-WAI hypotheses (DEFERred);
- any edit to P-L2-002 or MODEL-ECONOMICS.md.

## Contract (fixed before collection; changing it needs an owner decision)

### Rules
1. Tasks relate to dimensions, never to benchmarks. Benchmark-to-dimension mapping lives only in
   the registry. Task-to-benchmark relevance is derived, never stored.
2. Scales in v1 are ordinal only: HIGH, MEDIUM, LOW, NONE, each with a reason. No numeric relevance
   or importance weights.
3. A model-benchmark pair with no found result stays UNKNOWN. No row is written for it, and no score
   is inferred or invented.
4. Raw scores are always kept. Absolute scores of different benchmarks are never compared.
5. Comparability: `full` only when benchmark version, harness, tool permissions and reasoning budget
   match materially; otherwise `partial` or `none`, with a note. Rows marked `none` are kept but do
   not enter profiles.
6. Provenance for every registry entry and evidence row:
   - source URL;
   - publication or update date;
   - retrieval date;
   - locator (table, section or row);
   - source class: `vendor`, `maintainer` or `independent`;
   - snapshot id (archive URL or content hash) where practical.
7. A benchmark enters the registry only if it improves coverage of a frozen dimension. Its
   existence is verified from a primary source before it is RETAINED.

### Schemas (JSON; UTF-8, LF)
- `benchmark-registry.json`, an array, one object per benchmark:
  - identity and provenance: `id`, `name`, `version`, `maintainer`, `source_url`, `published`,
    `retrieved`, `locator`, `snapshot`;
  - `measures`: `[{dimension, strength: HIGH|MEDIUM|LOW, reason}]`;
  - description: `methodology`, `harness`, `tools`, `languages`, `context_profile`,
    `contamination_notes`, `limitations`, `authority: primary|secondary`;
  - `status: RETAINED|EXCLUDED`, `exclusion_reason`;
  - `existence_verified: true|false|null` (set by the verifier).
- `model-benchmark-evidence.jsonl`, one JSON object per line, one observation per line:
  - identity: `row_id`, `model`, `model_version`, `effort`, `harness`, `tools`, `benchmark_id`,
    `benchmark_version`;
  - result: `score`, `metric`, `n_tasks`;
  - provenance: `source_url`, `published`, `retrieved`, `locator`, `snapshot`,
    `source_class: vendor|maintainer|independent`;
  - comparability: `comparability: full|partial|none`, `comparability_note`;
  - review: `collector`, `verification: unverified|confirmed|corrected|rejected`, `verifier_note`.
- `model-capability-profiles.json`, derived:
  - per benchmark: `[{benchmark_id, model, effort, raw_score, metric, rank, n, position}]`,
    computed only from comparable rows;
  - one object per `model` + `effort`: `{dimension: {position, n_benchmarks, n_models,
    confidence: HIGH|MEDIUM|LOW, status: COVERED|WEAK|MISSING, evidence_type: direct|proxy,
    reason, rows: [row_id]}}`;
  - plus `price` and `speed`, each with its source (provider pages or `kilo models`, PROTO-DEC-0063),
    and `evidence_status: SUFFICIENT|PARTIAL|INSUFFICIENT`.
- `task-class-requirements.json`, a proposal for P-L2-002:
  - `[{task_class, dimension, importance: HIGH|MEDIUM|LOW|NONE, reason, transferability:
    HIGH|MEDIUM|LOW}]`;
  - the task-class list is proposed from `task_profife.md` section 1 and approved at the gate.

### Normalization (v1; methodology.md states it verbatim)
- Per benchmark, over comparable (`full` or `partial`) rows of frozen working models: n is the
  number of such models, and rank r = 1 is the best, following the metric's direction.
  - When n ≥ 2: `position = (n - r) / (n - 1)`, so the best is 1.0 and the last is 0.0.
  - Ties take the average rank.
  - When n = 1: no position; the raw score only. A lone model is not "best", so 1.0 would claim a
    comparison that did not happen.
  - `raw_score`, `metric`, `rank`, `n` and `position` are all kept.
- Per model and dimension: `position` is the median over the benchmarks that measure the dimension
  with strength HIGH or MEDIUM.
- Confidence:
  - HIGH: at least 2 benchmarks, n ≥ 4, and at least one independent source;
  - MEDIUM: 1 benchmark, or vendor-only sources;
  - LOW: `partial` comparability only.
- Coverage per dimension:
  - COVERED: at least 1 RETAINED benchmark with strength HIGH, and comparable rows for at least
    half of the frozen working models;
  - WEAK: some evidence, below that threshold, or proxy evidence only (`evidence_type: proxy`,
    with a reason stating what the proxy does not measure);
  - MISSING: none.
- Evidence status per model:
  - SUFFICIENT: COVERED-level rows on at least 4 of the 6 benchmark dimensions;
  - PARTIAL: 1-3;
  - INSUFFICIENT: 0.
- Profiles are recomputed from the rows by the written procedure, by hand or by a throwaway script
  kept in the frame. They are never edited by hand.

## Roles and rounds

### Round 1 (parallel)
- **Collector A:**
  1. Recover or remove the 10 `:chatgpt-content-reference` markers in `OwnerIdeas/benchmark.md`.
     Each marker is replaced by a verified source (URL and date), or its claim is removed. Output
     a recovery table in `round1/CITATIONS.md`.
  2. Build `benchmark-registry.json` for the six benchmark dimensions, plus SWE-Lancer Manager
     for D-CRIT.
  3. Record any public candidate found for D-DOC or D-SYN, with its strength. Stop searching those
     two after one bounded pass.
  4. Write `methodology.md`.
- **Collector B:** build `model-benchmark-evidence.jsonl` for every frozen working model across
  the benchmarks of `benchmark.md` sections 2-8. At the end of round 1, align `benchmark_id`s with
  A's registry. Rows on benchmarks A EXCLUDES stay but are marked.

Both collectors write the coverage audit draft `round1/COVERAGE.md`: per dimension COVERED, WEAK
or MISSING; per model SUFFICIENT, PARTIAL or INSUFFICIENT.

### Round 2
- **Verifier** re-opens sources independently and checks:
  - 100% of registry entries for existence;
  - 100% of `vendor` rows;
  - 100% of the rows that decide the top position of any dimension;
  - a seeded random sample of at least 20% of the remaining rows (seed recorded).

  Sets `verification` on every row it touched and `existence_verified` on every registry entry.
- Challenges comparability and coverage.
- Output: `round2/VERIFICATION.md` (at most 250 lines), with a verdict of PASS, RECOMMENDATION or
  FAIL and a reproduction for each FAIL claim.
- The collectors then make targeted corrections only to rows the verifier marked. This is part of
  round 2, not a new round.

### Gate (owner; R-L0-22.30-22.35)
- Expected verdict: ACCEPT for the contract and data. The data move to `docs/ops/model-evidence/`,
  and the task-class proposal goes to the next P-L2-002 revision.
- WEAK and MISSING are recorded as they are.
- Findings are classified by the owner, not by the collectors.

## Exit (R-L0-22.36)

Round 1 and collection end when:
1. every frozen dimension is COVERED, WEAK or MISSING, with reasons;
2. every frozen working model has been searched across every RETAINED applicable benchmark;
3. every retained row and registry entry has complete provenance;
4. the task-class requirements proposal is filled;
5. no finding would change the contract. A finding that would goes to the owner, and is not
   applied.

After coverage saturation no further benchmarks are sought.

F-02 goes to its mandatory gate at whichever comes first:
- (A) the conditions above are met and the verifier has finished round 2;
- (B) 2026-09-29.

At the deadline the frame is not extended automatically. It goes to the gate with its actual state:
COVERED, WEAK, MISSING or UNKNOWN per dimension and model.

## Layout

`README.md` (this file), `round1/` (CITATIONS.md, COVERAGE.md, draft data files, methodology.md),
`round2/VERIFICATION.md`, `data/` (the corrected data files proposed for ACCEPT).
