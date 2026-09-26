Mode: ADVISORY
Baseline: 7b6d17a; working tree status: dirty (this output file plus session journals; corpus files unchanged)
Reviewer: MiMo-V2.6-Pro, route mimo CLI `xiaomi/mimo-v2.6-pro` (`--variant high`), effort high, 2026-09-26
Scope: independent synthesis B over the frozen 17-file OwnerIdeas revision corpus (13 OwnerIdeas sources + 4 round-1 reviews)
Verdict: REVIEW COMPLETE

---

# Synthesis B (MiMo) — OwnerIdeas revision, frozen round-1 corpus

## 1. Executive summary

Four independent round-1 reviews classify the same 13-file `OwnerIdeas/` corpus against the live kernel. **FACT:** their status labels diverge more than their underlying diagnoses. On the major mechanism families they mostly agree about *what the kernel actually has*; they disagree about *which label the gap deserves* (`ACTIVE` vs `RESEARCH_CANDIDATE` vs `PARTIALLY_IMPLEMENTED`) and about *cleanup disposition*.

**INFERENCE:** the highest-value output of this synthesis is not a majority vote but a short list of (a) label conflicts that the resolver must settle with evidence rules, and (b) consensus that rests on the same weak source and must not be treated as verified.

Top findings:

1. **4/4 substance, 3/4 label — task characterization layer** (`task_profife.md`). All four see a real L2 gap; Gemini marks `ACTIVE/KEEP`, Claude and Mistral `RESEARCH_CANDIDATE`, DeepSeek `PARTIALLY_IMPLEMENTED`. **FACT:** `PROTO-DEC-0062` item 2 (`DECISIONS.md:2483`) says "No separate layer is added" — the corpus idea *conflicts with an accepted decision* until a new block exists. Residue is classification, not existence of the gap.
2. **4/4 on capability envelope being incomplete** (`H-AUTH-02.md`). Strongest consensus in the corpus. **FACT:** pieces exist (`PROTO-DEC-0070`, `0077`, `0078`) but no single home. **INFERENCE:** "PARTIALLY_IMPLEMENTED" is the only honest label; "COMPLETE" would over-claim.
3. **Write broker split 2/4 on status and on action** (`scripts.md` Track B). Gemini/Mistral `ACTIVE`, Claude `RESEARCH_CANDIDATE`, DeepSeek `PARTIALLY_IMPLEMENTED`. **FACT:** `scripts.md` §53 carries a falsification list that the bottleneck may not exist. **INFERENCE:** this is an experiment item, not an implementation item.
4. **Cleanup is where reviewers collide hardest.** `performers.md:139-1344` (or `:186-1314`) and `scripts.md:1-1515` are near-copies; `MIGRATION.md` and `SYNTHESIS-2026-09-25-cross-document.md` are spent intermediates. **FACT:** two reviewers say `DUPLICATE`/`ARCHIVE_CANDIDATE`; Mistral barely tracks them. **INFERENCE:** cleanup needs a byte-level duplicate check before any deletion (see §8).
5. **Evidence debt is concentrated.** `benchmark.md` carries 10 dangling `:chatgpt-content-reference` markers (Claude C-09; **FACT**, re-counted 10). Several reviews cite bare `workflowAI.md` / `P-L2-002` while the tree holds `docs/core-arch/stage-4/workflowAI.md` and `docs/core-arch/stage-2/P-L2-002-model-selection.md` (**FACT**, spot-checked). Consensus that leans on those cites is marked weak below.

This stage aggregates only. Cleanup and boundary decisions belong to Claude (stage 5).

## 2. Frozen corpus and method (hash-check result)

**FACT:** `round2/CORPUS.txt` lists 17 files. SHA-256 recomputed 2026-09-26 against the working tree at `b63ede4`: **17/17 match**. No mismatch; synthesis proceeds.

| # | File | Bytes | Hash |
|---|---|---:|---|
| 1 | `OwnerIdeas/benchmark.md` | 57328 | OK |
| 2 | `OwnerIdeas/executor.md` | 24778 | OK |
| 3 | `OwnerIdeas/Google_AX.md` | 34828 | OK |
| 4 | `OwnerIdeas/H-AUTH-02.md` | 1520 | OK |
| 5 | `OwnerIdeas/H-PROMPT-DELIVERY-01_canonical-task-file-vs-orchestrator-loading.md` | 4054 | OK |
| 6 | `OwnerIdeas/MCP_Server.md` | 54534 | OK |
| 7 | `OwnerIdeas/MIGRATION.md` | 27051 | OK |
| 8 | `OwnerIdeas/performers.md` | 56659 | OK |
| 9 | `OwnerIdeas/RISK_COUNCIL.md` | 58612 | OK |
| 10 | `OwnerIdeas/Rust.md` | 25866 | OK |
| 11 | `OwnerIdeas/scripts.md` | 67617 | OK |
| 12 | `OwnerIdeas/SYNTHESIS-2026-09-25-cross-document.md` | 12071 | OK |
| 13 | `OwnerIdeas/task_profife.md` | 40982 | OK |
| 14-17 | `round1/REVIEW-{GEMINI,CLAUDE,DEEPSEEK,MISTRAL}.md` | 49063 / 50008 / 37720 / 26935 | OK |

Method:

1. Baseline = cold extraction of every row in the four required summary tables (Gemini 32 rows, Claude 68 rows, DeepSeek 46 rows, Mistral 16 rows) before any clustering.
2. Items clustered into the union of *ideas*, not rows, because the four reviews cut the corpus at different granularities (Claude uses `G-/R1-/W-/X-/K-/C-` codes; DeepSeek quotes line ranges; Mistral is coarsest). Every raw row is represented; see §Full item table and the map in §6.
3. Status/action cells quote each reviewer's own label from their table (or `—` if that reviewer has no row).
4. Agreement counted over *reviewers who have a row on the idea*, then reported as `n/4` against the full panel with the omission noted — a missing row is not a silent agree.
5. Spot-checks of canonical paths / decision ids recorded inline (`FACT: spot-check`).
6. No new hypotheses about OwnerIdeas content (rule 5 of `SYNTHESIS.md`).
7. Step log: `.ai/runtime/ownerideas-revision/mimo-r2-steps.tsv` (disposable, not a deliverable).

Truth labels used below: **FACT** (path:line or decision id), **INFERENCE**, **OPEN QUESTION**.

## 3. Consensus register (4/4 and 3/4), with evidence quality

Agreement category uses the required vocabulary. Evidence quality is **strong** (canonical decision block or path verified in this run), **weak** (shared claim without independent cite, or cite that spot-checks only partially), **dangling** (source missing or marker empty).

| ID | Idea | Agreement | Evidence quality | Note |
|---|---|---|---|---|
| S02 | Node validator API + differential harness designed, not built | 4/4 CONSENSUS (substance) | strong | **FACT:** `PROTO-DEC-0077` at `DECISIONS.md:3258`; `final-plan-2.md` exists. Labels differ: Gemini/DeepSeek `PARTIALLY_IMPLEMENTED`, Claude `PARTIALLY`/`COMPLETE` action, Mistral `PARTIALLY`/`COMPLETE`. |
| S32 | Capability envelope has no single home | 4/4 CONSENSUS (substance) | strong | **FACT:** `H-AUTH-02.md` is 1520 B and is a sketch; `0070`/`0077`/`0078` exist. |
| S33 | EXECUTE/DELEGATED/OWNER/STOP not a deterministic engine | 3/4 STRONG CONSENSUS | strong | Gemini/DeepSeek/Claude have rows; Mistral folds it into the envelope row. **FACT:** `docs/core-arch/stage-1/P-L0-002-stop-and-ask.md` exists (spot-check). |
| S05 | MODEL PROFILE schema only partially in `MODEL-MATRIX.md` | 3/4 STRONG CONSENSUS | weak | Gemini/Claude/DeepSeek; Mistral omits. **FACT:** `docs/core-arch/stage-4/workflowAI.md` exists; reviews often cite it as bare `workflowAI.md`. |
| S25 | Minimum-sufficient executor is prose, not a formula | 3/4 STRONG CONSENSUS | strong | Gemini/Claude/DeepSeek `PARTIALLY_IMPLEMENTED`; **Mistral says `RESEARCH_CANDIDATE`** — preserved in §4. (Table id S25 = principle; formula is S27.) |
| S38 | Write broker absent; only cooperative lock | 3/4 CONSENSUS on absence | strong | All four see the gap. Status/action split in §4. **FACT:** `AGENTS.md` §6 / `protocol-lock.cjs` is the only writer discipline. |
| S10 | Task-characterization layer does not exist as a layer | 3/4 STRONG CONSENSUS on substance | strong | See S10 label conflict in §4; **FACT:** `0062` item 2 blocks it. |
| S65 | Google AX is study-A material, not kernel | 3/4 STRONG CONSENSUS | medium | Gemini/DeepSeek/Mistral; Claude adds **OPEN QUESTION** that AX primitives may be unverified externally. **FACT:** `PROTO-DEC-0066` at `DECISIONS.md:2592`; `docs/research/2026-09-25-improvement-research/README.md` exists. |
| S71 | Rust core not chosen; Node port is the decided path | 3/4 STRONG CONSENSUS | strong | **FACT:** `PROTO-DEC-0025` item 5 / `0077`; `PROPOSAL-node-validator.md` (DeepSeek cite). Claude splits "SUPERSEDED (as replacement)" vs "RESEARCH (other hot paths)". |
| S76 | Direct Colabs MCP runtime is not adopted | 3/4 STRONG CONSENSUS | strong | **FACT:** `PROTO-DEC-0036` at `DECISIONS.md:1602` (spot-check); `0034`/`0045` nearby. Disposition split in §4. |
| S81 | Cross-document `SYNTHESIS-2026-09-25` is spent | 3/4 STRONG CONSENSUS | strong | Gemini/DeepSeek `ARCHIVE_CANDIDATE`; Mistral `SUPERSEDED`; Claude `ARCHIVE_CANDIDATE` (C-03). |
| S36 | Delivery variant C (pointer) is what runs in practice | 3/4 STRONG CONSENSUS | strong | **FACT:** `PROTO-DEC-0073` / `0076` item 4 frozen; this frame's launch file is variant C. |
| S22 | Multi-round research + certification is implemented as practice | 3/4 STRONG CONSENSUS | strong | **FACT:** `PROTO-DEC-0052`/`0053` (`DECISIONS.md` ~3113/3194); Claude notes it is not in `S-003`. |
| S44 | "Deterministic before probabilistic" is real in scripts/validator | 3/4 STRONG CONSENSUS | strong | **FACT:** `AGENTS.md` §7; `0047` item 8. |
| S49 | Single-active-writer identity is cooperative only | 3/4 STRONG CONSENSUS | strong | **FACT:** `protocol-lock.cjs` uses owner-name strings; no PID binding in the kernel path. |

**Weak-evidence consensus (do not promote):**

| ID | Idea | Agreement | Why weak |
|---|---|---|---|
| S17 | Multidimensional capability vectors vs scalar IQ | 3/4 | Same source family (`benchmark.md` + `0074`/`0075`); no measurement behind "vectors". |
| S18 | External benchmark portfolio should exist | 3/4 on "missing" | **FACT:** portfolio claims sit on `benchmark.md:65-282` with dangling markers (10). Existence of RepoProbe / AACR-Bench / SWE-Lancer unverified. |
| S50 | Instruction-vs-data trust boundary missing | 3/4 | Shared `RISK_COUNCIL` H-SEC-02 text; no PoC either way. |
| S12 | Static context estimator missing | 3/4 | All cite the same `task_profife` passage; no formula ever tested. |

## 4. Splits (2/4) and minority findings (1/4), preserved with evidence

### 4.1 Status splits (same gap, different label)

| ID | Idea | Split | Evidence each side cites | Synthesis note |
|---|---|---|---|---|
| S10 | Task characterization as its own layer | Gemini `ACTIVE/KEEP (Design & Implement)` vs Claude `RESEARCH_CANDIDATE/RESEARCH` vs DeepSeek `PARTIALLY_IMPLEMENTED/RESEARCH` vs Mistral `RESEARCH_CANDIDATE/RESEARCH` | Gemini: `0074` item 4, `0075` item 8. Claude: `P-L2-002` + **FACT** `0062` item 2 forbids a new layer. DeepSeek: `P-L2-002` 0.4 mixes the three. Mistral: "hypothesis only". | **INFERENCE:** all four agree the *conflation* exists. The label fight is whether a blocked design counts as `ACTIVE`. Preserve both; resolver must apply a rule (decision-attached = PARTIAL, unattached design = RESEARCH_CANDIDATE) or ask the owner. |
| S38 | Write broker / queue | Gemini `ACTIVE/KEEP (Design & Implement)` vs Claude `RESEARCH_CANDIDATE/RESEARCH` vs DeepSeek `PARTIALLY_IMPLEMENTED/RESEARCH` vs Mistral `ACTIVE/COMPLETE` | Gemini/Mistral: Track B is a real design. Claude (**stronger procedure note**): "the lock and the copy-back are neighbours of a broker, not a partial broker" (`REVIEW-CLAUDE.md` §12). DeepSeek: `0028`/`0029` + `P-L5-001` proposal; his own §12 says confidence **low** because `scripts.md` §53 falsification list warns the bottleneck may not exist. | **MINORITY PRESERVED:** Claude's argument that a cooperative lock is not a partial broker is the sharper classification. Mistral's `COMPLETE` action is unsupported — nothing is built. Action should stay `RESEARCH` (experiment the bottleneck) unless the owner overrides. |
| S25 | Minimum-sufficient executor | 3× `PARTIALLY_IMPLEMENTED` vs **Mistral `RESEARCH_CANDIDATE`** | Gemini: `0075` item 9 + `workflowAI.md:54` (path is `docs/core-arch/stage-4/workflowAI.md`). Mistral: "Hypothesis only". | **MINORITY PRESERVED:** Mistral is right that *EAC formula* is a hypothesis; wrong that the *lowest-admissible-rung* is only a hypothesis — **FACT:** prose procedure exists in the tier ladder (`0075` items 8-10). Split the idea: principle = PARTIALLY (S25), formula = RESEARCH (S27). |
| S76 | MCP line disposition | Gemini `SUPERSEDED`/`COMPLETE (Archive)` for the runtime idea vs DeepSeek `STALE`/`KEEP (extract list)` vs Claude `RESEARCH_CANDIDATE` (facade scope OPEN) vs Mistral `RESEARCH_CANDIDATE` | **FACT:** `PROTO-DEC-0036` closes MCP adoption. Claude raises **OPEN QUESTION:** does a Colabs-owned facade count as adoption? DeepSeek wants the ~200-point mechanism inventory kept. | Do not invent a middle ground. Report: adoption closed (fact); facade scope open (question); inventory keep-or-delete is a cleanup decision for stage 5. |
| S71 | Rust | Gemini `RESEARCH_CANDIDATE` vs Claude `SUPERSEDED` (C-06) + `RESEARCH_CANDIDATE` (X-14 daemon) vs DeepSeek `STALE` + `PARTIALLY` (remove PowerShell) vs Mistral `RESEARCH_CANDIDATE` | **FACT:** Node chosen (`0025` item 5, `0077`). Gemini's own §12: Rust stays a fallback if Node misses <500 ms. | Split by sub-idea (S71a core binary = stale/superseded; S71b snapshot/daemon/watcher = research). |
| S01 | Validator migration *council* artifact | Gemini `IMPLEMENTED/SUPERSEDED`/Archive vs DeepSeek **`DUPLICATE`/`COMPLETE`** vs Claude `IMPLEMENTED`/`KEEP` (C-12) vs Mistral `PARTIALLY`/`COMPLETE` | **FACT:** council ran; `0077` accepted; `final-plan-2.md` on disk. DeepSeek's `DUPLICATE` refers to `MIGRATION.md` as a spent prompt copy, not to the program. | Separate *program* (done) from *file disposition* (cleanup) — do not average the labels. |
| S35 | H-PROMPT-DELIVERY-01 as a whole | Gemini `RESEARCH_CANDIDATE` vs Claude `RESEARCH_CANDIDATE` but may be archive vs DeepSeek `ACTIVE/KEEP` vs Mistral `PARTIALLY/COMPLETE` | **FACT:** `0076` item 4 freezes the comparison; variant B/C used. Gemini §12 documents one agy skip under variant B. | Freeze-measurement item, not cleanup. Mistral `COMPLETE` is over-claim (unmeasured trade-offs). |

### 4.2 Minority findings (1/4) — preserved

| ID | Finding | Who | Why it is stronger / must survive |
|---|---|---|---|
| S09a | `performers.md:139-1344` is a byte-range copy of `benchmark.md:949-2154` | Claude (C-04) + DeepSeek (L186-1314) | Two reviewers, one row-code. Gemini never marks the duplicate. **INFERENCE:** this is the single largest cleanup signal in the corpus (≈50 KB). Requires a local diff before delete (§8). |
| S46a | `scripts.md:1-1515` is a truncated first copy of `scripts.md:1516-3029` | Claude (C-05) + DeepSeek | Same. Mistral treats `scripts.md` as one idea. |
| S24 | `benchmark.md` external facts have **no sources** (10 dangling `:chatgpt-content-reference`) | Claude (C-09) `UNCLEAR` | **FACT: spot-check re-counted exactly 10 markers.** DeepSeek/Gemini treat the portfolio as `RESEARCH_CANDIDATE` without noting the dangling cites. This minority is stronger than the majority treatment. |
| S18a | Public benchmarks as routing prior conflicts with `0063` item 1 ("third-party leaderboards are not sources") | Claude contradiction #3 | **FACT:** `0063` at `DECISIONS.md:2567` (spot-check). Others list the portfolio without the kernel conflict. |
| S53a | "Reading is never forbidden" is under test vs `R-L0-09` | Claude contradiction #8 | Security carve-out missing; no other reviewer flags this. Preserve for L0. |
| S54a | `S-001` "passed when the artifact exists" vs `0075` item 6 "valid artifact" | Claude contradiction #9 | Internal kernel inconsistency (`CORE-ARCH-4.md:75-76`); not an OwnerIdeas conflict but affects how status labels can be trusted. |
| S25a | ADDENDUM telemetry is flawed (2.96×) | DeepSeek only | **INFERENCE:** any performance claim in `benchmark.md` rest on known-bad telemetry until recalibrated. |
| S63 | Remote execution without shared FS (`H-REMOTE-01`) | Claude only (X-17) | Cloud fail-closed exists (`0077` item 1); the design space is untracked by the other three. |
| S64 | Project-code context resolver (`H-CODE-01`) | Claude only (X-18) | Gated by `0036`/`0045`; relevant to S1 symbol navigation. |
| S82 | Kernel layering L0-L9 as a row | **Mistral only** | Source is `CORE-ARCH-1..7.md`, **outside the frozen OwnerIdeas corpus**. Include in the union as Mistral's row but mark source-out-of-corpus. |

### 4.3 Action splits (same status, different action)

| ID | Idea | Actions | Note |
|---|---|---|---|
| S34 | Permission inheritance on resume/fallback | Claude `COMPLETE` (it is a gap to close now) vs would-be RESEARCH elsewhere | Claude R1-03 is `ACTIVE`/`COMPLETE` with medium confidence. |
| S14 | Parallel ownership above two streams | Claude `COMPLETE` vs corpus wanting 10-15 writers | **FACT:** `0048` item 7 caps at 2. |
| S48 | Risk council execution | Gemini `RESEARCH (Execute Council)` vs DeepSeek `RESEARCH_CANDIDATE` + owner sequencing vs Mistral `RESEARCH` vs Claude `RESEARCH` (K-01) | Agreement on "not run"; disagreement on whether study A/B pre-empts it (**DeepSeek OPEN QUESTION**). |

## 5. Unresolved items

**OPEN QUESTION (no answer during this run — rule 3 of COMMON.md):**

1. Label rule for designs that contradict an accepted decision (S10, S38): is `ACTIVE` allowed when `0062` item 2 / `0048` item 7 forbid the implementation path?
2. Claude program-level P-1: stage 8 wants five parallel executors; `0048` item 7 allows two edit streams. **FACT:** both texts exist. Not corpus content; flagged because the same conflict will appear in the cleanup stage.
3. Claude program-level P-2: if `CLOSED` counts as certification, DeepSeek+Claude are both barred from certifying protocol-core work they controlled (`0041` items 1-2). Owner must say whether closure is certification.
4. Claude program-level P-3: dispatch "no fallback without owner decision" is stricter than `0075` items 3 and 10.
5. DeepSeek: is `MCP_Server.md`'s ~200-point inventory worth keeping after the line is closed?
6. DeepSeek: is the write broker in scope at all, or is the 2-stream model permanent?
7. Claude: did `0070` items 5-6 mean a general no-repeat-confirmation principle, or only the one-run scope of item 7?
8. Mistral 12.1-12.4: CATALOG O(N), trigger detector ownership, read-widening boundedness, global graph properties — all low-confidence, need measurement or an architecture decision.
9. Gemini: will the Node validator meet <500 ms / 500+ files on Windows? Gates the entire Rust branch.
10. **OPEN QUESTION:** `P-L2-002` is cited by three reviews as bare `P-L2-002` / `workflowAI.md`; the tree paths are `docs/core-arch/stage-2/P-L2-002-model-selection.md` and `docs/core-arch/stage-4/workflowAI.md`. Should the corpus and reviews use full paths? (Citation-precision issue, not a content issue.)

## 6. Aggregated classification counts per status and per L0–L3 level

Counts are over the **clustered union items in the Full item table (N=86)** — every table row appears in exactly one modal-status bucket and exactly one layer bucket. Modal status is an explicit column of the Full item table.

**Modal rule (applied to the four reviewer `Status` cells):** each reviewer cell that names a status casts one vote. Keywords are scanned in the order `RESEARCH_CANDIDATE`, `PARTIALLY_IMPLEMENTED`, `PARTIALLY` (shorthand for `PARTIALLY_IMPLEMENTED`), `ARCHIVE_CANDIDATE`, `SUPERSEDED`, `DUPLICATE`, `STALE`, `UNCLEAR`, `IMPLEMENTED`, `ACTIVE`; the first hit is that cell's vote (so dual labels like `IMPLEMENTED/SUPERSEDED` vote `SUPERSEDED`). Cross-reference-only cells such as `(via S05)` cast no vote. Modal = majority of votes; ties broken toward the more conservative label (`RESEARCH_CANDIDATE` > `ACTIVE` > `PARTIALLY_IMPLEMENTED` > `IMPLEMENTED` > `SUPERSEDED` > `ARCHIVE_CANDIDATE` > `DUPLICATE` > `STALE` > `UNCLEAR`). Rows with no status vote are `UNRATED`.

**Reproducibility:** each count below is the size of an ID list; every ID list is a partition of the Full item table `#` column. The `Modal` column holds the same labels.

### 6.1 By modal status

| Modal status | Count | IDs |
|---|---:|---|
| IMPLEMENTED | 4 | S04, S44, S47, S80 |
| PARTIALLY_IMPLEMENTED | 36 | S01, S02, S05, S06, S07, S08, S13, S14, S17, S22, S23, S25, S29, S32, S33, S37, S39, S42, S43, S46, S49, S52, S53, S53a, S54, S55, S60, S66, S69, S70, S72, S73, S74, S78, S79, S82 |
| ACTIVE | 14 | S09, S11, S28, S34, S36, S38, S40, S50, S56, S57, S58, S59, S61, S62 |
| RESEARCH_CANDIDATE | 24 | S10, S12, S15, S16, S18, S19, S20, S21, S27, S30, S31, S35, S41, S45, S48, S51, S63, S64, S65, S67, S68, S71a, S71b, S76 |
| SUPERSEDED | 1 | S03 |
| ARCHIVE_CANDIDATE | 1 | S81 |
| DUPLICATE | 2 | S09a, S46a |
| STALE | 2 | S75, S77 |
| UNCLEAR | 1 | S24 |
| UNRATED | 1 | S18a |

(86 = 4+36+14+24+1+1+2+2+1+1; IDs are unique across the table; S24 appears once.)

### 6.2 By primary layer (first L-digit of the Layer column; `—` = unspecified; `Meta` kept separate)

| Layer | Count | IDs |
|---|---:|---|
| L0 | 22 | S01, S02, S22, S32, S33, S43, S44, S48, S50, S51, S52, S53, S54, S56, S57, S58, S60, S61, S70, S78, S80, S82 |
| L1 | 6 | S14, S29, S34, S49, S55, S79 |
| L2 | 27 | S04, S05, S06, S07, S09, S10, S11, S12, S13, S15, S16, S17, S18, S18a, S19, S20, S21, S24, S25, S27, S28, S30, S31, S62, S67, S68, S69 |
| L3 | 26 | S08, S23, S35, S36, S37, S38, S39, S40, S41, S42, S45, S46, S47, S53a, S63, S64, S65, S66, S71a, S71b, S72, S73, S74, S75, S76, S77 |
| L8 | 1 | S59 |
| meta | 1 | S81 |
| unspecified | 3 | S03, S09a, S46a |

(86 = 22+6+27+26+1+1+3. Ranged labels such as L0/L3 use the lower bound as primary; the secondary layer remains visible in the table.)

## 7. Contradictions between the four reviews

These are **review-vs-review** contradictions (not OwnerIdeas-vs-kernel, which is §4 / each review's §10).

| # | Topic | Side A | Side B | Evidence | Resolution rule for the resolver |
|---|---|---|---|---|---|
| R-A | Is a cooperative lock "partial write broker"? | DeepSeek `PARTIALLY_IMPLEMENTED` | Claude `RESEARCH_CANDIDATE` (not even partial) | Claude §12 procedure argument is sharper; DeepSeek self-rates confidence low | Prefer Claude's label unless an artifact named "broker" exists |
| R-B | Is `task_profife` a live design (`ACTIVE`) or a hypothesis (`RESEARCH_CANDIDATE`)? | Gemini `ACTIVE` | Mistral/Claude `RESEARCH_CANDIDATE` | `0062` item 2 blocks the layer; Gemini cites `0074`/`0075` which do not create it | Prefer `RESEARCH_CANDIDATE` until a decision block creates the layer |
| R-C | Is the minimum-sufficient executor implemented? | 3× `PARTIALLY` | Mistral `RESEARCH_CANDIDATE` | Prose ladder exists (stronger) | Split principle vs formula (S25/S27) |
| R-D | Is `MIGRATION.md` still live content? | Gemini/Claude keep the program | DeepSeek marks the **file** `DUPLICATE` | Program ≠ file | Two rows: program IMPLEMENTED, file cleanup |
| R-E | Is Google AX `ACTIVE` or `RESEARCH_CANDIDATE`? | DeepSeek notes it is dispatched (active inside study A) | Gemini/Mistral `RESEARCH_CANDIDATE` | `0066` dispatch exists | `RESEARCH_CANDIDATE` at corpus level; `ACTIVE` only inside the study frame |
| R-F | Does `MCP_Server.md` still hold extractable value? | DeepSeek `KEEP (extract list)` | Gemini `COMPLETE (Archive)` | ~200-point inventory unverified line-by-line (DeepSeek §12) | Keep until a targeted extract pass |
| R-G | Are external benchmark names real? | Gemini/DeepSeek treat portfolio as a gap to research | Claude `UNCLEAR` (dangling cites) | **FACT:** 10 `:chatgpt-content-reference` markers | Claude's uncertainty wins until sources are recovered |
| R-H | Mistral `COMPLETE` actions on unmeasured items | Mistral: delivery, write broker → `COMPLETE` | Others: still open | **FACT:** `0076` item 4 freezes unmeasured trade-offs | Reject `COMPLETE` without measurement |
| R-I | Duplicate ranges for `performers.md` | Claude `:139-1344` | DeepSeek `:186-1314` | Both plausible; overlap large | Byte-diff before cleanup; report both ranges |
| R-J | Who certifies stage-8 / `CLOSED`? | Dispatch says DeepSeek then Claude | `0041` independence bars them for core work | Claude P-2 | Owner ruling required (unresolved §5.2) |

## 8. Cleanup signals (aggregate only; no decisions)

Aggregate signals only — Claude resolves the boundary; Gemini executes approved cleanup. Nothing here is a deletion order.

| Signal | Target | Who flags | Proposed class (aggregate) | Precondition before any delete |
|---|---|---|---|---|
| Near-duplicate block | `performers.md:139-1344` ≈ `benchmark.md:949-2154` | Claude C-04, DeepSeek | DUPLICATE → archive one side | Local diff + size check; keep the side with better headings |
| Truncated copy | `scripts.md:1-1515` vs `:1516-3029` | Claude C-05, DeepSeek | DUPLICATE → keep one | Same |
| Spent intermediate | `SYNTHESIS-2026-09-25-cross-document.md` | Gemini, Claude, DeepSeek, Mistral | ARCHIVE_CANDIDATE / SUPERSEDED | Already superseded by this round; archive, do not delete |
| Spent prompt copy | `MIGRATION.md` (council charter) | DeepSeek DUPLICATE, Gemini archive | ARCHIVE_CANDIDATE | Keep a pointer to `final-plan-2.md` + `0077` |
| Stale architecture doc | `MCP_Server.md` runtime section | Gemini archive, DeepSeek STALE | PARTIAL archive: runtime claims stale; mechanism inventory keep | Extract list first (R-F) |
| Stale / superseded path | `Rust.md` core-binary sections | Claude C-06 SUPERSEDED, DeepSeek STALE | SUPERSEDED | Keep performance hypotheses that Node does not cover |
| Snapshot risk | `performers.md:1-137` inventory | Claude C-07 ACTIVE (low) | ACTIVE but volatile | Do not archive; it competes with `MODEL-MATRIX` / `MODEL-ECONOMICS` |
| Dangling sources | `benchmark.md:65-282` and friends | Claude C-09 | UNCLEAR — fix cites or quarantine facts | 10 markers must be resolved before any "fact" is reused |

**INFERENCE:** if the two near-duplicate blocks are real, cleanup frees roughly 60-80 KB of the 521 KB OwnerIdeas corpus. That matters for the `docs/reviews/` budget pressure noted in `.ai/TASK.md`.

## 9. Active and research signals for the next stages

Not recommendations to implement — signals the resolver / DeepSeek's single plan should see.

**Active (owner-facing, decision-attached):**

- Node validator implementation under `0077` / `final-plan-2.md` (S02) — already the approved path.
- Capability envelope design home (S32) — pieces exist, no home; needs one decision block, not more sketches.
- Delivery-mechanism measurement under frozen `0076` item 4 (S35) — already frozen; needs the experiment run.
- Risk-council sequencing: run as its own council vs folded into study A/B (S48, DeepSeek OPEN Q1).

**Research (do not turn into implementation tasks this round):**

- Benchmark portfolio + geometric-mean fit + Bayesian updating (S18-S21) — gated on recovering sources (S24).
- EAC/EAT / expected total cost (S27), shadow exploration (S30), 5-strategy comparison (S31).
- Write-broker bottleneck falsification experiment (S38) before any broker code.
- Google AX study A (S65-S66), adaptive depth study B (S68).
- Context bounding H-CTX-01..05 (S58), packet completeness (S51), TCB map (S52).
- Remote execution (S63) and code-context resolver (S64) — Claude-only, need at least a second reader next round.
- Rust fallback only if Node misses the performance threshold (Gemini §12).

**Explicitly frozen / closed (do not reopen without an owner-directive):**

- MCP adoption (`0036`), scalar-IQ ranking as a sole metric (`0074`/`0075`), orchestrator-injected task text (variant D vs `0073`), framework adoption of AX into the kernel (`0076` item 1 CLI-only).

## 10. Own assessment and open questions

**Own assessment (MiMo).**

1. The four reviews are **more compatible than their labels**. A resolver that averages the labels will produce a mush. A resolver that applies two rules will not: (R1) *a design that an accepted decision forbids is `RESEARCH_CANDIDATE`, not `ACTIVE`*; (R2) *`COMPLETE` requires an artifact and a measurement, not an intention*. Under those rules S10, S38, S35 and S26 resolve cleanly and the 4/4 substance consensuses stand.
2. **Cleanup is safer than usual** because two independent reviewers found the same two duplicate blocks. That is the rare case where agreement is not circular: Claude and DeepSeek cut the corpus differently and still landed on the same ranges.
3. **Evidence debt is the real risk.** `benchmark.md` is the corpus's factual backbone for model selection and it has 10 empty source markers. Any downstream plan that treats those numbers as FACT will inherit a fabrication-shaped hole. Recommend a dedicated cite-recovery pass before study work that depends on external benchmarks.
4. **Mistral's table is the weakest** (16 coarse rows, several `COMPLETE` actions without artifacts) but it is not worthless: it is the only review that keeps `RISK_COUNCIL` L0-A/B/C and the CATALOG tax visible as first-class rows. Keep its minority rows (S82, §6).
5. **I did not open `SYNTHESIS-KIMI.md` or any `round2/` file other than `CORPUS.txt` and its 17 listed files** (independence rule). If Kimi's synthesis later agrees with §4.1 S38 or S24, treat that as corroboration of a *procedure* finding (Claude's non-partial-broker argument / dangling cites), not as independent evidence about the corpus.
6. **Framework honesty:** this run is Super-Research topic-survey-style synthesis over an internal corpus, not an external literature survey. The evidence log is the four reviews' tables plus the spot-checks above; there is no `sources.tsv` of web papers because no external claim is made. URLs in this document come from repository paths only.

**Open questions carried forward** — see §5 (10 items). The two that block clean aggregation are §5.1 (label rule) and §5.2 (whether `CLOSED` is certification).

---

## Full item table

Columns `Gemini` / `Claude` / `DeepSeek` / `Mistral` carry that reviewer's own `Status | Action` from their required summary table, or `—` when they have no row. `Agreement` uses the required vocabulary. `Evidence` is the quality of the *underlying* claim (not of the agreement). `Own` is this synthesiser's assessment / disposition suggestion (not a decision).

| # | Source | Idea | Layer | Modal | Gemini | Claude | DeepSeek | Mistral | Agreement | Evidence | Own |
|---|---|---|---|---|---|---|---|---|---|---|---|
| S01 | MIGRATION.md whole | Validator migration council charter / run | L0/L3 | PARTIALLY_IMPLEMENTED | IMPLEMENTED/SUPERSEDED \| COMPLETE (Archive) | C-12 IMPLEMENTED \| KEEP | DUPLICATE \| COMPLETE | PARTIALLY_IMPLEMENTED \| COMPLETE | 3/4 STRONG (substance: program done) | strong | Split program vs file; archive file |
| S02 | MIGRATION.md §API | Node validator API + differential harness | L0/L3 | PARTIALLY_IMPLEMENTED | PARTIALLY_IMPLEMENTED \| KEEP (Implement) | X-11 PARTIALLY_IMPLEMENTED \| COMPLETE | protocol-validate.cjs PARTIALLY_IMPLEMENTED \| COMPLETE | PARTIALLY_IMPLEMENTED \| COMPLETE | 4/4 CONSENSUS (substance) | strong | Continue under 0077 |
| S03 | MIGRATION.md (file) | Spent council prompt copy | — | SUPERSEDED | SUPERSEDED \| Archive | C-02 ARCHIVE_CANDIDATE \| — | DUPLICATE \| COMPLETE | — | 3/4 | strong | ARCHIVE |
| S04 | MIGRATION §6,§14 | Research frames `record --quick` | L2/L3 | IMPLEMENTED | — | C-11 IMPLEMENTED \| KEEP | — | — | 1/4 MINORITY | strong (FACT 0071) | Keep; already real |
| S05 | performers.md schema | MODEL PROFILE 13-group schema | L2/L3 | PARTIALLY_IMPLEMENTED | PARTIALLY_IMPLEMENTED \| KEEP | W-09 RESEARCH_CANDIDATE \| RESEARCH | PARTIALLY_IMPLEMENTED \| KEEP | — | 3/4 STRONG (partial) | weak (path shorthand) | Spec gap → plan |
| S06 | performers.md | Decouple model names from protocol constants | L2/L4 | PARTIALLY_IMPLEMENTED | IMPLEMENTED \| COMPLETE | X-10 PARTIALLY_IMPLEMENTED \| COMPLETE | PARTIALLY_IMPLEMENTED \| KEEP | — | 3/4 STRONG | strong | Labels differ; substance near-done |
| S07 | performers.md | Working pool vs discovered models | L2/L4 | PARTIALLY_IMPLEMENTED | PARTIALLY_IMPLEMENTED \| KEEP | W-05/W-07 PARTIALLY \| COMPLETE | PARTIALLY \| KEEP | — | 2/4 | medium | Fold into resolver work |
| S08 | performers.md | Automated model discovery | L3 | PARTIALLY_IMPLEMENTED | (via S05) | X-10 PARTIALLY_IMPLEMENTED \| COMPLETE | P-L3-002/003 | — | 2/4 | medium | Manual run only |
| S09 | performers.md:1-137 | Model-profile inventory snapshot | L2/L3 | ACTIVE | — | C-07 ACTIVE \| RESEARCH (low) | — | — | 1/4 MINORITY | low (volatile) | Keep as research input |
| S09a | performers.md:139-1344 | Copy of benchmark.md:949-2154 | — | DUPLICATE | — | C-04 DUPLICATE \| — | DUPLICATE (L186-1314) \| COMPLETE | — | 2/4 (of 4) MINORITY but 2 sources | strong (two independent ranges) | Cleanup candidate — diff first |
| S10 | task_profife.md | Standalone TASK CHARACTERIZATION layer | L2 | RESEARCH_CANDIDATE | ACTIVE \| KEEP (Design&Implement) | W-01 RESEARCH_CANDIDATE \| RESEARCH | PARTIALLY_IMPLEMENTED \| RESEARCH | RESEARCH_CANDIDATE \| RESEARCH | 2/4 SPLIT on label; 4/4 on gap | strong gap; blocked by 0062 | RESEARCH_CANDIDATE until decision |
| S11 | task_profife.md | Diagnosis decoupled from pricing/availability | L2 | ACTIVE | ACTIVE \| KEEP | W-03 ACTIVE \| RESEARCH | (in S10) | (in S10) | 2/4 | medium | Needs owner value call (C-8) |
| S12 | task_profife.md | Static context volume estimator | L2/L3 | RESEARCH_CANDIDATE | ACTIVE \| RESEARCH | W-06 RESEARCH_CANDIDATE \| RESEARCH | RESEARCH_CANDIDATE \| RESEARCH | — | 3/4 STRONG | weak (same source) | Research |
| S13 | task_profife.md | No Size in tier; risk → assurance | L2 | PARTIALLY_IMPLEMENTED | (in S17) | W-02 PARTIALLY_IMPLEMENTED \| COMPLETE | (0075 item 8) | — | 2/4 | strong | Already decided; record stale |
| S14 | task_profife + scripts | Parallel writers beyond 2 streams | L1 | PARTIALLY_IMPLEMENTED | — | R1-04 PARTIALLY_IMPLEMENTED \| COMPLETE | — | (10-15 agents claim) | 1/4 + corpus | strong (0048 item 7) | Keep cap; corpus stale |
| S15 | task_profife + executor | Spec quality / testability / determinism factors | L2 | RESEARCH_CANDIDATE | — | W-04 RESEARCH_CANDIDATE \| RESEARCH | Factor vector PARTIALLY | — | 2/4 | medium | Research |
| S16 | task_profife.md L1521 | Weight validation plan | L2 | RESEARCH_CANDIDATE | — | — | RESEARCH_CANDIDATE \| RESEARCH | — | 1/4 MINORITY | medium | Research |
| S17 | benchmark.md | Multidimensional capability vectors | L2/L4 | PARTIALLY_IMPLEMENTED | PARTIALLY_IMPLEMENTED \| COMPLETE (Policy) | W-05 PARTIALLY \| COMPLETE | Benchmark Vector ACTIVE \| RESEARCH | — | 3/4 STRONG | weak | Policy yes; vectors unmeasured |
| S18 | benchmark.md | External benchmark portfolio | L2/L4 | RESEARCH_CANDIDATE | RESEARCH_CANDIDATE \| RESEARCH | W-09 RESEARCH_CANDIDATE \| RESEARCH | RESEARCH_CANDIDATE \| RESEARCH | RESEARCH_CANDIDATE \| RESEARCH | 4/4 CONSENSUS | **dangling** cites | Research after cite recovery |
| S18a | benchmark.md:65-282 | Public benchmarks as routing prior | L2 | UNRATED | — | contradiction #3 vs 0063 | (implied) | — | 1/4 MINORITY | strong conflict | Owner ruling |
| S19 | benchmark.md | Geometric-mean fit + authority/freshness weights | L2/L4 | RESEARCH_CANDIDATE | RESEARCH_CANDIDATE \| RESEARCH | W-09 RESEARCH_CANDIDATE | (cost/resolver formula ACTIVE) | — | 2/4 | dangling | Research |
| S20 | benchmark.md | Empirical Bayesian outcome updating | L2/L4 | RESEARCH_CANDIDATE | RESEARCH_CANDIDATE \| RESEARCH | W-09/W-10 | Shadow/outcome learning | — | 2/4 | medium | Research |
| S21 | benchmark.md L996+ | Benchmark-driven selection program | L2/L3 | RESEARCH_CANDIDATE | (via S18-S20) | (W-09) | RESEARCH_CANDIDATE \| RESEARCH | RESEARCH_CANDIDATE \| RESEARCH | 2/4 | medium | Research umbrella |
| S22 | benchmark.md L1607-1960 | Multi-round research + certification template | L0/L2 | PARTIALLY_IMPLEMENTED | (practice) | W-15 PARTIALLY_IMPLEMENTED \| COMPLETE | IMPLEMENTED \| COMPLETE | (RISK research design) | 3/4 STRONG | strong (0052/0053) | Implemented as practice |
| S23 | benchmark.md L2157 | Performance / throughput metrics ADDENDUM | L3/L6 | PARTIALLY_IMPLEMENTED | (telemetry) | W-11 PARTIALLY \| COMPLETE | PARTIALLY \| RESEARCH (flawed 2.96×) | — | 2/4 | **weak (known-bad telemetry)** | Recalibrate before use |
| S24 | benchmark.md:65-282 | External benchmark facts without sources | L2 | UNCLEAR | — | C-09 UNCLEAR \| RESEARCH (low) | — | — | 1/4 MINORITY | **dangling (10 markers)** | Strongest evidence finding |
| S25 | executor.md | Minimum-sufficient executor principle | L2 | PARTIALLY_IMPLEMENTED | PARTIALLY_IMPLEMENTED \| KEEP | W-07 PARTIALLY \| COMPLETE | PARTIALLY \| RESEARCH | RESEARCH_CANDIDATE \| RESEARCH | 3/4 vs 1/4 | strong prose | Split from formula |
| S27 | executor.md | EAC/EAT cost formula | L2 | RESEARCH_CANDIDATE | RESEARCH_CANDIDATE \| RESEARCH | W-08 RESEARCH_CANDIDATE \| RESEARCH | RESEARCH_CANDIDATE \| RESEARCH | (implied) | 3/4 STRONG | medium | Research |
| S28 | executor.md | Cheap-first exploration policy | L2 | ACTIVE | ACTIVE \| KEEP (Procedure) | W-07/W-10 | (chain) | — | 2/4 | medium | Formalize procedure |
| S29 | executor.md | Execution chain as unit (cheap + senior) | L1/L2 | PARTIALLY_IMPLEMENTED | IMPLEMENTED \| COMPLETE | (paired cycle) | PARTIALLY \| RESEARCH | — | 2/4 | strong practice | Labels split |
| S30 | executor.md | Shadow exploration / regret / learning | L2 | RESEARCH_CANDIDATE | RESEARCH_CANDIDATE \| RESEARCH | W-10 RESEARCH_CANDIDATE \| RESEARCH | PARTIALLY \| RESEARCH | — | 2/4 | medium | Research |
| S31 | executor.md L966 | 5-strategy comparison experiment | L2 | RESEARCH_CANDIDATE | — | — | RESEARCH_CANDIDATE \| RESEARCH | — | 1/4 MINORITY | medium | Research |
| S32 | H-AUTH-02.md | Bounded execution capability envelope | L0/L1 | PARTIALLY_IMPLEMENTED | ACTIVE \| KEEP (Design&Implement) | R1-02 PARTIALLY_IMPLEMENTED \| RESEARCH | PARTIALLY_IMPLEMENTED \| KEEP | PARTIALLY_IMPLEMENTED \| COMPLETE | 4/4 CONSENSUS (gap) | strong | Needs one decision home |
| S33 | H-AUTH-02.md | EXECUTE/DELEGATED/OWNER/STOP engine | L0 | PARTIALLY_IMPLEMENTED | PARTIALLY_IMPLEMENTED \| KEEP | G-01 PARTIALLY_IMPLEMENTED \| COMPLETE | (envelope 4-way) | (in S32) | 3/4 STRONG | strong (P-L0-002 exists) | Implement engine |
| S34 | H-AUTH-02 checks 5-6 | Permission inheritance on resume | L1/L3 | ACTIVE | — | R1-03 ACTIVE \| COMPLETE | — | — | 1/4 MINORITY | medium | Close the gap |
| S35 | H-PROMPT-DELIVERY-01 | Delivery variants A-E evaluation | L3 | RESEARCH_CANDIDATE | RESEARCH_CANDIDATE \| RESEARCH | C-01 RESEARCH_CANDIDATE \| RESEARCH (or archive) | ACTIVE \| KEEP | PARTIALLY \| COMPLETE | 2/4 SPLIT | strong freeze (0076 item 4) | Measure; not cleanup |
| S36 | H-PROMPT variant C | One-line pointer, script-sequenced | L3 | ACTIVE | (built) | C-13 IMPLEMENTED \| KEEP | ACTIVE \| KEEP | (in S35) | 3/4 STRONG | strong | Implemented |
| S37 | scripts.md Track A | Script performance audit / work elimination | L3 | PARTIALLY_IMPLEMENTED | PARTIALLY \| KEEP (0077) | (X-11) | (Rust L184) | — | 2/4 | strong (0077) | Continue |
| S38 | scripts.md Track B | Write broker & queue | L3 | ACTIVE | ACTIVE \| KEEP (Design&Implement) | X-05 RESEARCH_CANDIDATE \| RESEARCH | PARTIALLY \| RESEARCH | ACTIVE \| COMPLETE | 2/4 SPLIT | **low** (falsification list) | Experiment before build |
| S39 | scripts.md Track C | Procedure-to-script pipeline | L3 | PARTIALLY_IMPLEMENTED | ACTIVE \| KEEP (Procedure) | W-17 PARTIALLY \| COMPLETE | M0-M5 PARTIALLY \| KEEP | — | 2/4 | medium | Ladder missing |
| S40 | scripts.md L565 | Conflict classes | L3 | ACTIVE | — | — | ACTIVE \| RESEARCH | — | 1/4 MINORITY | medium | Research |
| S41 | scripts.md L595 | Optimistic concurrency | L3 | RESEARCH_CANDIDATE | (Track B) | X-05 | RESEARCH_CANDIDATE \| RESEARCH | — | 1/4 | medium | Research |
| S42 | scripts.md L755 | Lease-based single supervisor | L3 | PARTIALLY_IMPLEMENTED | (dispatcher) | X-02 PARTIALLY \| RESEARCH | PARTIALLY_IMPLEMENTED \| KEEP | — | 2/4 | strong (P-L3-004) | Implement lease |
| S43 | scripts.md L853 | M0-M5 scriptability ladder | L0/L2 | PARTIALLY_IMPLEMENTED | — | W-17 | PARTIALLY \| KEEP | — | 2/4 | medium | Keep |
| S44 | scripts.md L912 | Deterministic before probabilistic | L0/L3 | IMPLEMENTED | — | (W-17) | IMPLEMENTED \| COMPLETE | — | 2/4 + AGENTS §7 | strong | Implemented |
| S45 | scripts.md L1143 | Validation farm / backpressure | L3 | RESEARCH_CANDIDATE | — | — | RESEARCH_CANDIDATE \| RESEARCH | — | 1/4 MINORITY | medium | Research |
| S46 | scripts.md | High-concurrency script runtime | L3 | PARTIALLY_IMPLEMENTED | — | (R1-04) | — | PARTIALLY_IMPLEMENTED \| COMPLETE | 1/4 | medium | S14 overlap |
| S46a | scripts.md:1-1515 | Truncated first copy | — | DUPLICATE | — | C-05 DUPLICATE \| — | DUPLICATE \| COMPLETE | — | 2/4 MINORITY (2 sources) | strong | Cleanup candidate |
| S47 | scripts.md §20 | Singleton resources serialized | L3 | IMPLEMENTED | — | X-06 IMPLEMENTED \| KEEP | — | — | 1/4 | strong (protocol-lock) | Implemented |
| S48 | RISK_COUNCIL.md | Risk-audit council (18 hypotheses) | L0-L3 | RESEARCH_CANDIDATE | ACTIVE/RESEARCH \| RESEARCH | K-01 RESEARCH_CANDIDATE \| RESEARCH | RESEARCH_CANDIDATE \| RESEARCH | ACTIVE \| RESEARCH | 3/4 STRONG (not run) | medium | Owner sequences |
| S49 | RISK_COUNCIL.md | Single active writer PID+start_time | L1/L3 | PARTIALLY_IMPLEMENTED | PARTIALLY \| KEEP | (X-02) | H-RUNTIME-01 PARTIALLY \| RESEARCH | (cooperative lock) | 3/4 STRONG | strong | Binding not real |
| S50 | RISK H-SEC-02 | Instruction vs data trust boundary | L0 | ACTIVE | ACTIVE \| KEEP (Design/Implement) | G-02 ACTIVE \| RESEARCH | PARTIALLY \| RESEARCH | — | 3/4 STRONG | weak (no PoC) | Design |
| S51 | RISK_COUNCIL.md | Packet completeness harness + L0 A/B/C | L0/L2 | RESEARCH_CANDIDATE | RESEARCH_CANDIDATE \| RESEARCH | K-02 PARTIALLY \| RESEARCH | H-CTX-01 PARTIALLY \| RESEARCH | L0-A/B/C RESEARCH_CANDIDATE | 3/4 | medium | Research |
| S52 | RISK H-TCB-01 | TCB map / self-update | L0 | PARTIALLY_IMPLEMENTED | PARTIALLY \| RESEARCH | G-05 PARTIALLY \| RESEARCH | ACTIVE \| RESEARCH | RESEARCH_CANDIDATE | 3/4 | medium | Research |
| S53 | RISK H-FRESH/VERSION | Kernel epoch / in-flight compatibility | L0/L5 | PARTIALLY_IMPLEMENTED | — | G-04 PARTIALLY \| RESEARCH | PARTIALLY \| RESEARCH | — | 2/4 | medium | Scope unclear |
| S53a | RISK H-SEC-03 | Secret propagation in runner logs | L3 | PARTIALLY_IMPLEMENTED | (secret scan IMPLEMENTED) | X-20 PARTIALLY \| COMPLETE | PARTIALLY \| RESEARCH | — | 2/4 | strong (record scan) | Partial |
| S54 | RISK H-GRAPH-01 | Global graph checks | L0/L3 | PARTIALLY_IMPLEMENTED | — | K-07 PARTIALLY \| COMPLETE | PARTIALLY \| RESEARCH | UNCLEAR \| RESEARCH | 3/4 | medium | LCC draft only |
| S55 | RISK H-IND-01 | Independence vs epistemic diversity | L1 | PARTIALLY_IMPLEMENTED | (implemented #6) | R1-01 PARTIALLY \| RESEARCH | PARTIALLY \| RESEARCH | — | 2/4 | strong (0041) | Research remaining |
| S56 | RISK H-CTX-02 | CATALOG O(N) tax | L0/L2 | ACTIVE | — | K-03 ACTIVE \| RESEARCH | — | UNCLEAR \| RESEARCH (low) | 2/4 | **low** (needs measurement) | Measure |
| S57 | RISK H-CTX-03 | Dependency edges | L0 | ACTIVE | — | K-04 ACTIVE \| RESEARCH | — | — | 1/4 MINORITY | medium | Research |
| S58 | RISK H-CTX-04 | Trigger detector | L0/L2 | ACTIVE | — | K-05 ACTIVE \| RESEARCH | — | UNCLEAR (12.2) | 2/4 | low | Architecture call |
| S59 | RISK H-CTX-05 | Read-widening accounting | L8 | ACTIVE | (ctx bounding) | K-06 ACTIVE \| RESEARCH | — | UNCLEAR (12.3) | 2/4 | low | Metrics needed |
| S60 | RISK H-OWNER-01 | Owner SPOF mitigation | L0/L1 | PARTIALLY_IMPLEMENTED | — | G-08 PARTIALLY \| COMPLETE | PARTIALLY \| RESEARCH | — | 2/4 | medium | Delegation partial |
| S61 | RISK H-AUTH-01 | Cooperative vs hostile mode | L0 | ACTIVE | — | G-09 ACTIVE \| RESEARCH | — | — | 1/4 MINORITY | medium | Threat model |
| S62 | RISK H-EVAL-01 | Non-circular calibration | L2 | ACTIVE | — | W-16 ACTIVE \| RESEARCH | — | — | 1/4 MINORITY | medium | Research |
| S63 | RISK H-REMOTE-01 | Remote execution without shared FS | L3/L5 | RESEARCH_CANDIDATE | — | X-17 RESEARCH_CANDIDATE \| RESEARCH | — | — | 1/4 MINORITY | medium | Research |
| S64 | RISK H-CODE-01 | Project-code context resolver | L3 | RESEARCH_CANDIDATE | — | X-18 RESEARCH_CANDIDATE \| RESEARCH | — | — | 1/4 MINORITY | medium | Gated by 0036 |
| S65 | Google_AX.md | AX runtime integration | L3 | RESEARCH_CANDIDATE | RESEARCH_CANDIDATE \| RESEARCH (Study A) | X-16 RESEARCH_CANDIDATE \| RESEARCH (low) | RESEARCH_CANDIDATE \| RESEARCH | RESEARCH_CANDIDATE \| RESEARCH | 4/4 CONSENSUS | medium (AX unverified) | Study A only |
| S66 | Google_AX.md | Event-driven DAG scheduler & retry | L3 | PARTIALLY_IMPLEMENTED | PARTIALLY \| KEEP (C-3) | X-01 PARTIALLY \| COMPLETE | (dispatcher) | — | 2/4 | medium | C-3 backlog |
| S67 | Google_AX.md | AX boundary architectures A-I | L2/L3 | RESEARCH_CANDIDATE | (study A) | X-16 | RESEARCH_CANDIDATE \| RESEARCH | — | 2/4 | medium | Study A |
| S68 | Google_AX.md | Adaptive depth / parallelism | L2 | RESEARCH_CANDIDATE | (ctx) | W-12 RESEARCH_CANDIDATE \| RESEARCH | — | — | 1/4 + 0066 B | medium | Study B |
| S69 | Google_AX.md | Routing / multi-model consensus primitives | L2 | PARTIALLY_IMPLEMENTED | — | (R1-01) | PARTIALLY \| RESEARCH | — | 2/4 | medium | Practice vs design |
| S70 | Google_AX.md | Golden comparative task corpus | L0/L2 | PARTIALLY_IMPLEMENTED | — | W-18 PARTIALLY \| RESEARCH | — | — | 1/4 MINORITY | medium | P-L0-007 draft |
| S71a | Rust.md L148 | Rust core / colabs binary | L3 | RESEARCH_CANDIDATE | RESEARCH_CANDIDATE \| RESEARCH | C-06 SUPERSEDED \| — | STALE \| RESEARCH | RESEARCH_CANDIDATE \| RESEARCH | 2/4 SPLIT | strong (Node chosen) | SUPERSEDED as direction |
| S71b | Rust.md L237-746 | Snapshot, watcher, cache, daemon, DAG, index | L3 | RESEARCH_CANDIDATE | RESEARCH_CANDIDATE | X-14 RESEARCH_CANDIDATE \| RESEARCH | RESEARCH_CANDIDATE \| RESEARCH | (Rust.md hypotheses) | 3/4 STRONG | medium | Research |
| S72 | Rust.md L184 | Remove PowerShell / work elimination | L3 | PARTIALLY_IMPLEMENTED | (Track A) | (X-12) | PARTIALLY \| COMPLETE | — | 2/4 | strong (0077) | Continue |
| S73 | Rust.md | Fast / standard / full paths; incremental | L3 | PARTIALLY_IMPLEMENTED | — | X-12 PARTIALLY \| RESEARCH | (handoff state) | — | 2/4 | medium | Research |
| S74 | Rust.md Q | Test-suite split | L3 | PARTIALLY_IMPLEMENTED | — | X-13 PARTIALLY \| COMPLETE | — | — | 1/4 | medium | Planned |
| S75 | Rust.md (file) | Whole-file stale hypotheses | L3 | STALE | archive? | C-06 | STALE | — | 2/4 | medium | Partial archive |
| S76 | MCP_Server.md | Direct Colabs MCP runtime | L3 | RESEARCH_CANDIDATE | SUPERSEDED \| COMPLETE (Archive) | X-15 RESEARCH_CANDIDATE \| RESEARCH | STALE \| KEEP (extract) | RESEARCH_CANDIDATE \| RESEARCH | 2/4 SPLIT | strong (0036 closed) | Closed adoption; facade open |
| S77 | MCP_Server.md | MCP architecture candidates A-J | L3 | STALE | — | (X-15) | STALE \| KEEP (extract list) | (options listed) | 2/4 | medium | Extract before archive |
| S78 | MCP_Server.md | Ports and adapters (CLI + facade core) | L0/L3 | PARTIALLY_IMPLEMENTED | IMPLEMENTED \| COMPLETE | X-07 PARTIALLY \| COMPLETE | (scattered) | — | 2/4 | strong (SPEC-protocol-core) | Mostly done |
| S79 | MCP_Server.md | Authz / idempotency / batching / error taxonomy | L1/L3 | PARTIALLY_IMPLEMENTED | — | X-08 PARTIALLY \| COMPLETE | PARTIALLY \| KEEP | — | 2/4 | medium | Scattered |
| S80 | MCP_Server.md | Markdown + Git as readable truth | L0 | IMPLEMENTED | — | C-08 IMPLEMENTED \| KEEP | — | — | 1/4 | strong (AGENTS §1) | Standing |
| S81 | SYNTHESIS-2026-09-25 | Cross-document K1-K10 synthesis | Meta | ARCHIVE_CANDIDATE | ARCHIVE_CANDIDATE \| COMPLETE (Archive) | C-03 ARCHIVE_CANDIDATE \| — | ARCHIVE_CANDIDATE \| COMPLETE | SUPERSEDED \| COMPLETE | 4/4 CONSENSUS | strong | Archive |
| S82 | CORE-ARCH-1..7 (**outside corpus**) | Kernel layering L0-L9 | L0-L4 | PARTIALLY_IMPLEMENTED | — | — | — | PARTIALLY_IMPLEMENTED \| COMPLETE | 1/4 MINORITY | strong (0054) | Keep visible; not OwnerIdeas |

**Row coverage check.** Reviewer summary-table data rows counted in this run: Gemini 32, Claude 68, DeepSeek 46, Mistral 16 (162 raw rows) → clustered into 86 union items S01-S82 (with letter suffixes). Granularity differences are noted in §2; no raw row is dropped — cells that only cross-reference another union item (`(via S05)`, `(in S10)`, …) are shown in that item's reviewer column instead of as a separate row.

---

*End of Synthesis B. Output: `docs/research/2026-09-26-ownerideas-revision/round2/SYNTHESIS-MIMO.md`. Model: MiMo-V2.6-Pro via the mimo CLI (`xiaomi/mimo-v2.6-pro`). Baseline: 7b6d17a / tree b63ede4. Independent of Synthesis A.*
