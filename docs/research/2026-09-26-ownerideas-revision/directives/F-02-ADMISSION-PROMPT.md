# Owner directive - F-02 admission (model-evidence layer), backlog caps, owner override

To: the program operator (`kilo-f22faac486b5e567`, or the session the owner hands this to). You
transcribe, edit the listed files, run the checks and dispatch one short review. You decide nothing,
certify nothing, and do not launch F-02 until the owner names its executors.

Authority: the owner confirmed each point below on 2026-09-26, in his own words:
- the six benchmark dimensions, with SWE-Lancer Manager as evidence for D-CRIT: "да";
- freeze the working ladder of 2026-09-25: "да";
- deadline: "нет 2026-09-29";
- F-02 builds no local tests: "написать";
- executors are named by the owner at launch, and the verifier comes from another model family:
  "да, пока не заработает слой автовыбора исполнителя на основании наших доработок. но даже после,
  мое прямое решение может отключить слой и назначит моделей вручную";
- the backlog caps (DEFER 5, candidates 5) were confirmed with the preceding message.

He hands you this prompt himself (AGENTS.md section 2). The text was drafted in the advisory
session `claude-b00262b88c55444b`, which wrote nothing to the repository.

Provenance line:
`Approved by: RuslanFomenko (direct owner confirmation, 2026-09-26, answers quoted in the directive; decision text drafted by claude-b00262b88c55444b; transcribed by <your session>)`

## 0. Before you start

1. The preceding owner message (caps in FRAMES.md, BACKLOG migration, review exception, journal
   pruning) must be done and committed. If it is not, finish it first.
2. Read PROTO-DEC-0079..0083, P-L0-008 0.2, `docs/research/FRAMES.md`,
   `docs/research/2026-09-26-ownerideas-revision/round4/PLAN-DEEPSEEK.md` section R-3,
   `docs/ops/MODEL-ECONOMICS.md` and `OwnerIdeas/benchmark.md` sections 1-8.
3. Write the journal line: `Intake: owner directive PROTO-DEC-0084 -> F-02 admission; change P-L0-008 (minor)`.
4. `node .ai/bin/protocol-lock.cjs acquire --owner <your session>`. Never steal the lock.

## 1. PROTO-DEC-0084 (append verbatim; next free number, adjust references if 0084 is taken)

```
### PROTO-DEC-0084

Status: Accepted
Date: 2026-09-26
Reopen-trigger: owner-directive
Refines: PROTO-DEC-0080 item 1 (F-02 question and dimension set); PROTO-DEC-0083 items 3 and 7 (backlog caps); PROTO-DEC-0079 D1 (executor assignment)

Context:
F-02 (R-3, model layer) was ACTIVE at round 0 with admission pending. The plan gave it three
research questions that cannot be answered without run records (A-10 does not exist yet). The
benchmark classes of benchmark.md cover code work, while most Colabs work is documents, rules,
adversarial review and synthesis. The DEFER backlog cap was pending; the candidate list had no cap,
and docs/ops/BACKLOG.md held frozen hypotheses outside the registry.

Decision:
1. F-02 has one primary question: "What minimal, verifiable and maintainable evidence base on model
   capabilities is sufficient for Model Resolver v1?" H-WAI-1..6 are not researched in F-02; they
   stay DEFERred until run records accumulate, and may then open as EXPERIMENT.
2. The capability dimensions are frozen for F-02:
   - six benchmark-derived dimensions from benchmark.md sections 2-7:
     D-IMPL repository implementation and bug fixing; D-ARCH architecture and repository
     comprehension; D-REV code review; D-TERM terminal, debugging and autonomous execution; D-ALGO
     algorithmic coding; D-EDIT code editing and patch-instruction following;
   - three local dimensions:
     D-DOC document and rule comprehension (long corpus, rules, dependencies, contradictions,
     exact extraction of requirements); D-CRIT adversarial review and critical analysis (defects,
     omissions, contradictions, false premises); D-SYN multi-document synthesis (merging sources
     without losing minority findings, provenance or material conditions).
   SWE-Lancer Manager (benchmark.md section 8) is proxy evidence for D-CRIT, not a dimension: it
   measures selection among proposed solutions, not adversarial review of long textual artifacts.
   No dimension is added inside F-02; a benchmark found for any other capability is recorded as a
   FUTURE finding (POSSIBLE_FUTURE_DIMENSION) under the candidate cap, and the contract does not
   grow. Adding a dimension needs an owner decision.
3. F-02 builds no local evaluations, test suites or harnesses. A local dimension without verified
   public evidence is recorded MISSING. D-CRIT is at most WEAK, with evidence_type proxy, on
   SWE-Lancer Manager evidence, and a resolver never reads a proxy WEAK as benchmark coverage.
   Local evaluations are a later EXPERIMENT that needs run records (A-10).
4. The working-model set is frozen as an explicit list of models and efforts copied from the
   owner's working ladder (docs/ops/MODEL-ECONOMICS.md, "Owner's working ladder, snapshot
   2026-09-25 evening"), recorded with its source commit SHA and blob hash in the F-02 README. Other
   available models get no benchmark collection in F-02. A model promoted to working later goes
   through qualification and a separate evidence enrichment by hand after its promotion; it does
   not reopen F-02. No automatic enrichment job is built.
5. Canonical location of model evidence after ACCEPT: docs/ops/model-evidence/ (README.md,
   methodology.md, benchmark-registry.json, model-benchmark-evidence.jsonl,
   model-capability-profiles.json). Raw evidence is the source of truth; the capability profiles
   are derived and must be reproducible from it. Task-class capability requirements are not model
   evidence: F-02 designs their schema and proposes values, and their canonical owner is the task
   characterization inside P-L2-002 (PROTO-DEC-0079 D3), which receives them through its next
   revision.
6. A task relates to capability dimensions, never directly to a benchmark. The benchmark-to-
   dimension mapping lives in the benchmark registry. Task-to-benchmark relevance is derived, never
   stored.
7. Budget: round 1 has two collectors, A (benchmark registry, methodology, citation recovery) and
   B (model-by-benchmark evidence). Round 2 has one independent verifier plus targeted corrections
   by the collectors. Then the gate. Deadline 2026-09-29: at the deadline the frame goes to its
   gate with what exists. There is no third round without R-L0-22.22.
8. Executors: until automatic executor selection works, the owner names every F-02 executor at
   launch. The verifier's model family differs from both collectors' families and is neither
   Claude nor DeepSeek, which drafted and transcribed the contract.
9. Owner override, standing: at any time, including after automatic executor selection works, the
   owner's direct decision may switch the selection off and assign models by hand. The resolver
   never overrides an owner assignment. Every such run is recorded in its run record with
   selection = owner, and it is never counted as evidence about the resolver.
10. Backlog caps: the DEFER backlog cap is 5. The candidate list has a cap of 5: at the cap no new
    candidate is recorded until one is merged, removed or opened. FRAMES.md is the only registry of
    DEFER entries and candidates; the former "Frozen hypotheses" of docs/ops/BACKLOG.md live there.

Reasoning:
One question with a coverage-based exit makes F-02 finite. The three hypotheses of the plan need
run records that do not exist. Coding benchmarks alone would measure the models well on work
Colabs rarely does and poorly on its main work, so the local dimensions are named now and marked
MISSING honestly rather than approximated. Tying tasks to dimensions instead of benchmarks keeps the
unstable benchmark landscape behind a stable resolver contract and removes a third source of
relevance. Separate owners for model evidence and task requirements keep one authority per
question. An uncapped candidate list and a second backlog outside the registry were open bypasses of
the DEFER cap. Recording manual assignments keeps owner overrides from corrupting resolver
calibration.

Alternatives rejected:
A new frame MODEL-CAPABILITY-EVIDENCE-v1 (would breach the S2 limit and PROTO-DEC-0080's one-frame
rule); collecting every benchmark for every model (unbounded); numeric relevance weights in v1
(unsupported precision); pure rank normalization (loses gaps and shifts when the model set changes);
building local evaluations inside F-02; a deadline of 2026-10-03.

Consequences:
F-02 gets its admission README and moves to round 1 once the owner names its executors. P-L0-008
becomes 0.3 (candidate cap). FRAMES.md records the caps and the F-02 row. PROTO-DEC-0080 item 2,
PROTO-DEC-0063 item 1 and the P-L2-002 ownership of task characterization stand. This block
supersedes nothing.

Approved by: <provenance line>
```

## 2. Files to change (exactly these)

1. `.ai/DECISIONS.md`: append PROTO-DEC-0084. Edit no existing block.
2. `docs/decisions/REGISTRY.md` (separate commit after the first, as before):
   - `| PROTO-DEC-0084 | accepted | owner-directive | <sha> | none | F-02 admission: one question (evidence base sufficient for Resolver v1); dimensions frozen (6 benchmark + D-DOC, D-CRIT, D-SYN); no local evals in F-02; working ladder 2026-09-25 frozen; docs/ops/model-evidence/ canonical; 2 collectors + 1 verifier, deadline 2026-09-29; owner names executors, standing owner override; DEFER cap 5, candidate cap 5 |`
   - `| PROTO-DEC-0080 | accepted | owner-directive | <sha> | none | Item 1 refined by PROTO-DEC-0084: F-02 single question and frozen dimension set including three local dimensions |`
   - `| PROTO-DEC-0083 | accepted | owner-directive | <sha> | none | Refined by PROTO-DEC-0084: DEFER cap 5; candidate cap 5 (P-L0-008 0.3) |`
3. `docs/core-arch/stage-1/P-L0-008-research-governor.md` becomes 0.3, a minor change:
   - After R-L0-22.29, insert as a new rule at the end of the Rules list, so no existing id moves:
     `R-L0-22.55. The candidate list has a cap set by the owner, and at the cap no new candidate is recorded until a candidate is merged, removed or opened.`
   - Add `PROTO-DEC-0084` to front-matter `decision` and `evidence`.
   - Set `version: 0.3`.
   - Append the change-log line:
     `- 0.3 — 2026-09-26 — <your session> (transcription; text by claude-b00262b88c55444b) — candidate cap R-L0-22.55; caps set to 5 and 5 (PROTO-DEC-0084) — reviewer <reviewer>: <verdict>.`
4. `docs/research/FRAMES.md`:
   - counters: `DEFER backlog / cap` → `<n> / 5 (PROTO-DEC-0084)`; add `Candidates / cap` →
     `<n> / 5 (PROTO-DEC-0084)`;
   - F-02 row:
     - path `docs/research/2026-09-26-model-layer/`;
     - title `Model-evidence layer (R-3): evidence base sufficient for Resolver v1`;
     - status ACTIVE, round `0 of 2, admitted; round 1 waits for executor names`;
     - opened = the admission commit date;
     - record `PROTO-DEC-0080, 0084`.
5. Create `docs/research/2026-09-26-model-layer/README.md` from Appendix A exactly. Freeze the
   ladder: fill the "Frozen working set" block with the explicit model list and effort per rung,
   copied verbatim from MODEL-ECONOMICS.md. Add `source_commit` (the last commit that touched
   MODEL-ECONOMICS.md, from `git log -1 --format=%H -- docs/ops/MODEL-ECONOMICS.md`) and
   `source_blob` (`git hash-object docs/ops/MODEL-ECONOMICS.md`). Write names, not a line reference.
6. Create no `docs/ops/model-evidence/` files now. They are created only after ACCEPT at the gate.
7. Launch files for the three F-02 slots (collector A, collector B, verifier) are prepared only
   after the owner names the models and efforts. Use the pattern of
   `docs/research/2026-09-26-ownerideas-revision/prompts/run/`. Each slot's launch file points to
   the README and names its role section.

Do NOT touch: P-L2-002, MODEL-ECONOMICS.md (read only), AGENTS.md, `.ai/bin/`, the validator,
`tests/`, host projects, or any existing DECISIONS block.

## 3. Checks, review, commit

1. Check P-L0-008 0.3 against `procedure.schema.md`. `git grep -n "R-L0-22.55"` must return exactly
   one definition.
2. The validator must show 0 errors; report its output verbatim.
3. Release the lock. Commit per the owner's standing instruction, then commit REGISTRY. Run
   `protocol-handoff.cjs record`, then write the journal entry.
4. Minor-path review (P-L0-001):
   - One reviewer, not Claude and not DeepSeek, at most 60 lines, in
     `docs/reviews/2026-09-26-<reviewer>-p-l0-008-0.3-f02-admission-review.md`.
   - Scope: P-L0-008 0.3, PROTO-DEC-0084 and the F-02 README. Verdict: PASS, RECOMMENDATION or FAIL,
     with reproductions.
   - The header Baseline must be the reviewed commit, not an older one.
   - Fill `<reviewer>`/`<verdict>` in the change log afterwards.
5. Report to the owner:
   - the commits;
   - the validator output;
   - the caps and counts;
   - the F-02 row;
   - the request: "Name models and efforts for collector A, collector B and the verifier".

---

## Appendix A - `docs/research/2026-09-26-model-layer/README.md`

```markdown
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
    source_commit: <operator: SHA>
    source_blob: <operator: git hash-object>
    models:            # operator: one line per rung, verbatim model and effort
      - <model> / <effort>
  ```
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
```
