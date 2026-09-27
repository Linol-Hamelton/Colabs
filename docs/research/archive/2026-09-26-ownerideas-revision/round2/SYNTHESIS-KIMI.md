Mode: ADVISORY
Baseline: 7b6d17a; working tree status: dirty
Reviewer: Kimi K2.7 Code HighSpeed, route kimi CLI, effort high, 2026-09-26T09:14:46Z
Scope: Independent synthesis of the four OwnerIdeas round-1 reviews against the frozen 13-file corpus
Verdict: REVIEW COMPLETE

## 1. Executive summary

FACT: All 17 files listed in `round2/CORPUS.txt` were hash-checked with `sha256sum`; every digest matched.
FACT: The four round-1 reviews (Gemini, Claude, DeepSeek, Mistral) are advisory and share no completion authority; this synthesis is also advisory.
INFERENCE: The corpus is predominantly research-program prose and historical council prompts. The current kernel has decided far more than it has built; the typical maturity-chain break is **PROCEDURE/ARCHITECTURE -> IMPLEMENTATION**.
INFERENCE: The highest-value unbuilt mechanisms, by cross-review agreement, are: (1) capability envelope / bounded execution authorization, (2) kernel dispatcher / supervisor with resume-first recovery, (3) task-characterization layer separated from model selection, (4) write-broker research before any implementation, and (5) the risk-council frame.
FACT: Cleanup consensus is strong for archiving `MIGRATION.md`, the `SYNTHESIS-2026-09-25-cross-document.md` file, and deleting the two known duplicate blocks in `performers.md` and `scripts.md`.
OPEN QUESTION: The four reviews disagree on the disposition of `MCP_Server.md` (archive vs extract-list vs research seed) and on whether the write broker is already an active design task or still a research candidate.

## 2. Frozen corpus and method (hash-check result)

| # | File | sha256 (truncated) | Check |
|---|------|--------------------|-------|
| 1 | OwnerIdeas/benchmark.md | 28e47890... | matched |
| 2 | OwnerIdeas/executor.md | 82ce32ac... | matched |
| 3 | OwnerIdeas/Google_AX.md | 34f0a2ff... | matched |
| 4 | OwnerIdeas/H-AUTH-02.md | f78aa98b... | matched |
| 5 | OwnerIdeas/H-PROMPT-DELIVERY-01_...md | 3a59d7c2... | matched |
| 6 | OwnerIdeas/MCP_Server.md | a90d7534... | matched |
| 7 | OwnerIdeas/MIGRATION.md | 7c10072f... | matched |
| 8 | OwnerIdeas/performers.md | 73b81d25... | matched |
| 9 | OwnerIdeas/RISK_COUNCIL.md | 7ded3380... | matched |
| 10 | OwnerIdeas/Rust.md | c7f29f49... | matched |
| 11 | OwnerIdeas/scripts.md | a12f3957... | matched |
| 12 | OwnerIdeas/SYNTHESIS-2026-09-25-cross-document.md | 34b9f150... | matched |
| 13 | OwnerIdeas/task_profife.md | 0641bd1d... | matched |
| 14 | round1/REVIEW-CLAUDE.md | d9b890fd... | matched |
| 15 | round1/REVIEW-DEEPSEEK.md | 7cb71902... | matched |
| 16 | round1/REVIEW-GEMINI.md | b2ede6e4... | matched |
| 17 | round1/REVIEW-MISTRAL.md | 825afcec... | matched |

Method: read `COMMON.md`, `SYNTHESIS.md`, verified every hash, read all four review summary tables and supporting sections, then built one row per substantial item from the union of the tables. Agreement is counted only among reviewers that took a position on the item. Evidence quality reflects whether the reviewer(s) cited a canonical path or decision id.

## 3. Consensus register (4/4 and 3/4), with evidence quality

4/4 CONSENSUS
- Node.js validator migration is partial/needs implementation (PROTO-DEC-0077, final-plan-2.md) — high evidence.
- Risk-council frame is a research candidate, not yet run (BACKLOG.md C-4) — high evidence.
- Google AX integration is a Study A research seed (PROTO-DEC-0066) — high evidence.
- Rust core / daemon / cache is research/deferred until the Node validator is measured (PROTO-DEC-0077) — high evidence.
- `SYNTHESIS-2026-09-25-cross-document.md` should be archived (PROBLEMS.md P-1 closed) — high evidence.
- Bounded-context / packet-completeness / L0-loading questions need research before the risk council (CORE-ARCH-7, procedure.schema.md) — medium evidence.
- Kernel dispatcher / supervisor / state machine / resume-first recovery is partial/needs implementation (PROTO-DEC-0050 item 4, 0075 items 2-4,11, BACKLOG C-3) — high evidence.
- Automated model discovery / P-L3-002/003 routing data is partial (MODEL-MATRIX.md) — medium evidence.

3/4 STRONG CONSENSUS
- Capability envelope / bounded execution authorization is partial/needs design+implementation (PROTO-DEC-0070, 0077 item 3, 0078 item 4) — high evidence.
- External benchmark portfolio / formula / Bayesian updating is research (workflowAI.md TD-MODEL-QUALIFICATION) — medium evidence.
- Minimum-sufficient executor / EAC/EAT economics is research (PROTO-DEC-0075 items 8-10) — medium evidence.
- Task-characterization/profile layer is research/design (P-L2-002, 0062 item 2, 0075 item 8) — high evidence.
- Static context estimator is research (no canonical source) — low evidence.
- Script performance / remove PowerShell is partial/complete via Node migration (PROTO-DEC-0077) — high evidence.
- Procedure-to-script conversion / signals ledger is partial/needs completion (PROTO-DEC-0047 item 8, 0051 item 3) — high evidence.
- TCB / self-hosting safety is research (final-plan-2.md section P) — medium evidence.
- Single active writer / process identity is research/partial (P-L3-004, PROTO-DEC-0075 item 11) — medium evidence.
- Kernel epoch / packet freshness is research (PROTO-DEC-0075 item 7) — medium evidence.
- Instruction/data trust boundary is research (R-L0-04) — medium evidence.
- Owner-SPOF delegation is partial/needs formalization (PROTO-DEC-0062 item 3, 0078 items 3-4) — medium evidence.
- Independence vs epistemic diversity is research (PROTO-DEC-0041, CORE-ARCH-3 §5) — medium evidence.
- Per-run outcome record / telemetry is partial/needs a unified schema (PROTO-DEC-0035, USAGE.md) — medium evidence.
- `performers.md:139-1344` duplicate is deletable (byte match) — high evidence.
- `scripts.md` duplicate first copy is deletable (prefix match) — high evidence.

## 4. Splits (2/4) and minority findings (1/4), preserved with evidence

2/4 SPLIT
- Validator migration council charter/run: Gemini calls it superseded/archive, Claude implemented/keep, DeepSeek duplicate/complete, Mistral partially-implemented/complete (PROTO-DEC-0077) — disposition unresolved.
- Write broker / queue / conflict classes: Gemini active/design+implement, Claude research-candidate, DeepSeek partially-implemented/research, Mistral active/complete (PROTO-DEC-0028/0029, P-L5-001) — needs owner call on research vs design.
- H-AUTH-02 transition engine (EXECUTE/DELEGATED/OWNER/STOP): Gemini and Claude partial with different next actions (P-L0-002) — keep as part of envelope work.
- MCP_Server.md generic mechanisms (ports/adapters/authz/idempotency): Gemini implemented/complete, DeepSeek partial/keep, others silent (PROTO-DEC-0070/0077) — extract reusable list.
- Google AX event-driven DAG scheduler: Gemini partial/implement-in-C-3, DeepSeek partial/research (PROTO-DEC-0075/0076) — implement inside dispatcher.
- Deterministic-before-probabilistic / fail-closed script standard: Claude implemented/keep, DeepSeek implemented/complete (PROTO-DEC-0047 item 8) — keep standard.
- Global graph correctness (H-GRAPH-01): Claude partial/complete, DeepSeek partial/research (P-L0-004 draft) — research then implement.
- Secret propagation redaction: Gemini implemented (scan only), Claude partial/complete, DeepSeek partial/research, Mistral partial (AGENTS.md §7, protocol-handoff.cjs) — extend redaction.

1/4 MINORITY FINDING (preserved because the reviewer provided the only evidence on the item)
- Decouple model names from constants (Gemini: implemented; DeepSeek: partial/keep) — only two reviewers touch it.
- Working pool qualification (Gemini only) — include in model-layer frame.
- Abandon scalar IQ / multidimensional vectors (Gemini only) — record as implemented policy.
- Validation farm / backpressure (DeepSeek only) — research with broker.
- Singleton resources / shared-doc lock (Claude implemented; Mistral partial/complete) — keep lock until broker proven.
- Workspace per job / private clone / git modes (Gemini implemented; Claude partial/complete) — keep and launch.
- Adaptive depth / parallelism / Study B (Claude only) — run Study B as approved.
- Fast/standard/full validation paths / incremental DAG (Claude only) — research after Node validator.
- Test-suite split (Claude only) — implement.
- Core API behind adapters / structured output / navigation indexes (Claude only) — continue in tooling.
- Research-cycle steps / freeze subject/join-key (Claude + DeepSeek) — formalize in S-003.
- Permission inheritance on resume/fallback (Claude only) — include in envelope design.
- External benchmark facts citations (Claude only) — verify or remove dangling markers.
- Script/critical-section performance audit (Claude only) — measure hooks/runtime.
- Non-circular calibration / external ground truth (Claude only) — research with model qualification.
- Remote/cloud execution without shared FS (Claude only) — low-priority research.
- Project-code context resolver (Claude only) — gated research.

## 5. Unresolved items

- Disposition of `MIGRATION.md`: archive, keep as provenance, or delete? Three of four reviewers lean toward archive/delete after extracting methods, but Mistral treats the council outcome as still complete/keep-worthy.
- Disposition of `MCP_Server.md`: Gemini wants it archived as superseded; DeepSeek wants the mechanism inventory extracted and kept; Claude and Mistral keep it as a Study A research seed. The central adoption is closed by PROTO-DEC-0036, but the file's role is unsettled.
- Write broker: Gemini and Mistral treat it as an active design task; Claude and DeepSeek treat it as a research candidate requiring an A/B/C/D experiment.
- Delivery variants B/C/E vs D: Gemini/Claude say research, DeepSeek says active/keep, Mistral says partial/complete. Variant D is excluded by PROTO-DEC-0073; the comparative measurement is frozen by PROTO-DEC-0076 item 4 but has not run.
- Performance / Rust core: three reviewers agree the Node validator is the current path; Mistral keeps Rust as an active research candidate alongside Node, creating ambiguity about whether Rust is deferred or parallel.

## 6. Aggregated classification counts per status and per L0–L3 level

Counts are derived from the "Own assessment" column of the full item table.

| Status bucket | Count | Notes |
|---------------|-------|-------|
| RESEARCH | 31 | Needs a framed study or experiment before implementation decision. |
| IMPLEMENT / DESIGN / KEEP (active work) | 16 | Decision exists; build or realign procedure. |
| COMPLETE / KEEP AS-IS | 7 | Already implemented or policy in force; no new work. |
| ARCHIVE / DELETE | 4 | Move to archive or remove duplicate. |
| UNRESOLVED / OWNER-RULING | 4 | Reviewers disagree; owner call required. |

| Layer | Count of items | Dominant bucket |
|-------|-----------------|-----------------|
| L0 governance / invariants / TCB / security | 11 | RESEARCH (8), IMPLEMENT (2), UNRESOLVED (1) |
| L1 roles / rights / independence / identity | 7 | RESEARCH (5), IMPLEMENT (2) |
| L2 task characterization / selection / assurance / economics | 12 | RESEARCH (9), IMPLEMENT (2), COMPLETE (1) |
| L3 execution / dispatch / locks / tooling / performance | 22 | RESEARCH (11), IMPLEMENT (10), COMPLETE (1) |
| Meta / cleanup | 8 | ARCHIVE/DELETE (4), UNRESOLVED (3), COMPLETE (1) |

## 7. Contradictions between the four reviews

| Topic | Gemini | Claude | DeepSeek | Mistral | Note |
|-------|--------|--------|----------|---------|------|
| `MIGRATION.md` | archive | keep | delete/duplicate | partial/complete | All agree council closed; disagree on file fate. |
| `MCP_Server.md` | superseded/archive | research seed (X-15) | stale/keep list | research seed | Central adoption closed by PROTO-DEC-0036. |
| Write broker | active design | research candidate | research candidate | active design | 2 vs 2 split. |
| Rust performance path | defer to Study A after Node | Node first, Rust research/defer | Node first, Rust stale/research | active research | All agree Node is first; Rust status differs. |
| Delivery variants | research | research | active/keep | partial/complete | Comparative test frozen, not run. |
| Script runtime / high-concurrency lock | — | implemented (lock) | — | partial/complete | Minority-level disagreement on lock status. |

## 8. Cleanup signals (aggregate only; no decisions)

- **Archive now**: `OwnerIdeas/MIGRATION.md` (after extracting owner-question filter and subject-freeze methods), `OwnerIdeas/SYNTHESIS-2026-09-25-cross-document.md`.
- **Mark stale / add header**: `OwnerIdeas/MCP_Server.md` central adoption; `OwnerIdeas/Rust.md` "Rust core replaces Node" framing; `benchmark.md` and `executor.md` passages that describe a "current" automatic resolver.
- **Delete after confirmation**: `performers.md:139-1344` (duplicates `benchmark.md:949-2154`), `scripts.md:1-1515` (truncated first copy of the program).
- **Keep as Study A seeds until study runs**: `Google_AX.md`, `MCP_Server.md` mechanism inventory, `Rust.md` performance hypotheses.
- **Do not delete**: `H-AUTH-02.md`, `H-PROMPT-DELIVERY-01_...md`, `RISK_COUNCIL.md`, `task_profife.md`, `executor.md`, `benchmark.md`, `scripts.md` until their active frames close.

## 9. Active and research signals for the next stages

Immediate implementation signals (high agreement + canonical decision):
1. Node.js validator migration (PROTO-DEC-0077).
2. Kernel dispatcher / supervisor / resume-first recovery (BACKLOG C-3, PROTO-DEC-0075).
3. Capability envelope / bounded authorization design (PROTO-DEC-0070/0077/0078).
4. Signals ledger / procedure-to-script maturity (PROTO-DEC-0047 item 8, 0051 item 3).

Research frames requiring owner gating:
1. Model-layer frame: task profile, benchmark portfolio, executor economics, MODEL PROFILE schema.
2. Risk council frame: bounded context, TCB, trust boundary, L0 A/B/C, H-IND-01 diversity.
3. Study A: Google AX, MCP facade mechanisms, Rust performance.
4. Study B: adaptive depth / parallelism.
5. Write-broker frame: A/B/C/D experiment before any broker build.

## 10. Own assessment and open questions

Own assessment: The corpus should be classified, not deleted. The strongest next step is for the owner to rule on the five unresolved items in section 5, because they determine whether `MIGRATION.md` and `MCP_Server.md` move out of the active corpus and whether the write broker stays in research. After that, the implementation signals in section 9 can be sequenced without revisiting the corpus boundary.

Open questions:
1. Should `MIGRATION.md` be archived as a whole, or only after its reusable methods are copied into S-003 and L0 procedures?
2. Should `MCP_Server.md` be archived, kept as a mechanism extract, or left as a Study A seed?
3. Is the write broker an active design task or a research candidate requiring an experiment?
4. Does the owner want the Rust core kept as a parallel research track, or strictly deferred behind the Node validator measurements?
5. Does a Colabs-owned MCP facade count as "MCP adoption" under PROTO-DEC-0036 item 1?

---

## Full item table

| # | Source | Idea | Layer | Gemini | Claude | DeepSeek | Mistral | Agreement | Evidence quality | Own assessment |
|---|--------|------|-------|--------|--------|----------|---------|-----------|------------------|----------------|
| 1 | MIGRATION.md | Validator migration council charter/run | L0-L3 | IMPLEMENTED/SUPERSEDED / COMPLETE (Archive) | IMPLEMENTED / KEEP | DUPLICATE / COMPLETE | PARTIALLY_IMPLEMENTED / COMPLETE | UNRESOLVED | high: PROTO-DEC-0077, final-plan-2.md | Archive after extracting reusable methods |
| 2 | MIGRATION.md / 0077 | Node.js validator migration | L3 | PARTIALLY_IMPLEMENTED / KEEP (Implement) | PARTIALLY_IMPLEMENTED / COMPLETE | PARTIALLY_IMPLEMENTED / KEEP | PARTIALLY_IMPLEMENTED / COMPLETE | 4/4 CONSENSUS | high: PROTO-DEC-0077, .ai/DECISIONS.md:3258 | Implement after L-CORRECTION-4 |
| 3 | performers.md | Decouple model names from protocol constants | L2-L4 | IMPLEMENTED / COMPLETE | — | PARTIALLY_IMPLEMENTED / KEEP | — | 1/4 MINORITY FINDING | medium: PROTO-DEC-0073/0074 | Policy in force; keep matrices current |
| 4 | performers.md | 13-group MODEL PROFILE / capability vector | L2-L4 | PARTIALLY_IMPLEMENTED / KEEP (Spec/Implement) | RESEARCH_CANDIDATE / RESEARCH (W-09); ACTIVE / RESEARCH (C-07) | PARTIALLY_IMPLEMENTED / KEEP | — | 3/4 STRONG CONSENSUS | medium: workflowAI.md TD-MODEL-QUALIFICATION | Merge into model-layer research frame |
| 5 | performers.md | Working pool qualification (AVAILABLE→WORKING) | L2-L4 | PARTIALLY_IMPLEMENTED / KEEP (Implement) | — | — | — | 1/4 MINORITY FINDING | medium: MODEL-ECONOMICS.md | Include in model-layer frame |
| 6 | task_profife.md | Separate task characterization/profile layer | L2 | ACTIVE / KEEP (Design & Implement) | RESEARCH_CANDIDATE / RESEARCH (W-01) | PARTIALLY_IMPLEMENTED / RESEARCH | RESEARCH_CANDIDATE / RESEARCH | 3/4 STRONG CONSENSUS | high: P-L2-002, PROTO-DEC-0062 item 2, 0075 item 8 | Research; resolve conflict with 0062 item 2 |
| 7 | task_profife.md | Static context volume estimator | L2-L3 | ACTIVE / RESEARCH | RESEARCH_CANDIDATE / RESEARCH (W-06) | RESEARCH_CANDIDATE / RESEARCH | — | 3/4 STRONG CONSENSUS | low: no canonical source | Research script candidate |
| 8 | benchmark.md | Abandon scalar IQ / multidimensional capability vectors | L2-L4 | PARTIALLY_IMPLEMENTED / COMPLETE (Policy) | — | — | — | 1/4 MINORITY FINDING | high: PROTO-DEC-0074/0075 item 8 | Record as implemented policy |
| 9 | benchmark.md | External benchmark portfolio / formula / Bayesian updating | L2-L4 | RESEARCH_CANDIDATE / RESEARCH (3 rows) | RESEARCH_CANDIDATE / RESEARCH (W-09) | RESEARCH_CANDIDATE / RESEARCH (L996 program; L284 vector; L1292 portfolio) | — | 3/4 STRONG CONSENSUS | medium: workflowAI.md:142-157 | One research frame on model qualification |
| 10 | executor.md | Minimum-sufficient executor / EAC/EAT formula | L2-L3 | PARTIALLY_IMPLEMENTED / KEEP (Implement formula) | PARTIALLY_IMPLEMENTED / COMPLETE (W-07); RESEARCH_CANDIDATE / RESEARCH (W-08) | PARTIALLY_IMPLEMENTED / RESEARCH (L244); RESEARCH_CANDIDATE / RESEARCH (L209-236) | RESEARCH_CANDIDATE / RESEARCH | 3/4 STRONG CONSENSUS | medium: PROTO-DEC-0075 items 8-10, workflowAI.md | Research with task-profile frame |
| 11 | executor.md | Cheap-first exploration / execution chain routing | L2-L3 | ACTIVE / KEEP (Procedure); IMPLEMENTED / COMPLETE (chain) | PARTIALLY_IMPLEMENTED / COMPLETE (W-07) | PARTIALLY_IMPLEMENTED / RESEARCH (L756) | — | 2/4 SPLIT | medium: PROTO-DEC-0040, 0074 item 4 | Keep workflows; measure |
| 12 | H-AUTH-02.md | Capability envelope / bounded authorization | L0-L1 | ACTIVE / KEEP (Design & Implement) | PARTIALLY_IMPLEMENTED / RESEARCH (R1-02); PARTIALLY_IMPLEMENTED / COMPLETE (G-01) | PARTIALLY_IMPLEMENTED / KEEP | PARTIALLY_IMPLEMENTED / COMPLETE | 3/4 STRONG CONSENSUS | high: PROTO-DEC-0070, 0077 item 3, 0078 item 4, P-L0-002 | Design decision then implement; highest priority |
| 13 | H-AUTH-02.md | EXECUTE/DELEGATED/OWNER/STOP transition engine | L0 | PARTIALLY_IMPLEMENTED / KEEP (Implement) | PARTIALLY_IMPLEMENTED / COMPLETE (G-01) | — | — | 2/4 SPLIT | medium: P-L0-002 | Implement as part of envelope |
| 14 | H-PROMPT-DELIVERY-01.md | Delivery variants B/C/E comparison | L3 | RESEARCH_CANDIDATE / RESEARCH | RESEARCH_CANDIDATE / RESEARCH (C-01) | ACTIVE / KEEP | PARTIALLY_IMPLEMENTED / COMPLETE | UNRESOLVED | medium: PROTO-DEC-0073, 0076 item 4 | Keep frozen until comparative test |
| 15 | scripts.md | Track A: remove PowerShell / script performance | L3 | PARTIALLY_IMPLEMENTED / KEEP (Implement 0077) | PARTIALLY_IMPLEMENTED / COMPLETE (X-11); UNCLEAR / RESEARCH (C-10) | PARTIALLY_IMPLEMENTED / COMPLETE (L184/L733) | PARTIALLY_IMPLEMENTED / COMPLETE (high-concurrency runtime) | 3/4 STRONG CONSENSUS | high: PROTO-DEC-0077, PROPOSAL-node-validator.md | Implement Node validator; measure hooks |
| 16 | scripts.md | Track B: Write broker / queue / conflict classes | L3 | ACTIVE / KEEP (Design & Implement) | RESEARCH_CANDIDATE / RESEARCH (X-05) | PARTIALLY_IMPLEMENTED / RESEARCH (L419); ACTIVE / RESEARCH (L565 conflicts); RESEARCH_CANDIDATE / RESEARCH (L595 optimistic) | ACTIVE / COMPLETE | 2/4 SPLIT | medium: PROTO-DEC-0028/0029, P-L5-001 | Research frame with A/B/C/D experiment; do not build yet |
| 17 | scripts.md | Track C: procedure-to-script conversion / signals ledger | L2-L3 | ACTIVE / KEEP (Procedure) | PARTIALLY_IMPLEMENTED / COMPLETE (W-17) | PARTIALLY_IMPLEMENTED / KEEP (L853) | — | 3/4 STRONG CONSENSUS | high: PROTO-DEC-0047 item 8, 0051 item 3 | Build signals ledger + maturity registry |
| 18 | scripts.md | Deterministic-before-probabilistic / fail-closed script standard | L0-L3 | — | IMPLEMENTED / KEEP (C-08) | IMPLEMENTED / COMPLETE (L912) | — | 2/4 SPLIT | high: PROTO-DEC-0047 item 8 | Keep standard |
| 19 | scripts.md | Validation farm / backpressure | L3 | — | — | RESEARCH_CANDIDATE / RESEARCH | — | 1/4 MINORITY FINDING | low: no canonical source | Research with broker |
| 20 | scripts.md | Singleton resources / shared-document lock | L3 | — | IMPLEMENTED / KEEP (X-06) | — | PARTIALLY_IMPLEMENTED / COMPLETE (runtime) | 1/4 MINORITY FINDING | high: protocol-lock.cjs, PROTO-DEC-0028/0029 | Keep lock; do not replace until broker proven |
| 21 | RISK_COUNCIL.md | Risk council charter / frame (whole) | L0-L4 | ACTIVE/RESEARCH_CANDIDATE / RESEARCH | RESEARCH_CANDIDATE / RESEARCH (K-01) | RESEARCH_CANDIDATE / RESEARCH | ACTIVE / RESEARCH | 4/4 CONSENSUS | high: BACKLOG.md C-4, .ai/TASK.md:68 | Schedule owner-timed council |
| 22 | RISK_COUNCIL.md | TCB / self-hosting safety (H-TCB-01) | L0 | — | PARTIALLY_IMPLEMENTED / RESEARCH (G-05) | ACTIVE / RESEARCH | RESEARCH_CANDIDATE / RESEARCH | 3/4 STRONG CONSENSUS | medium: final-plan-2.md section P | Include in risk council |
| 23 | RISK_COUNCIL.md | Single active writer / process identity / exactly-once (H-RUNTIME-01) | L1-L3 | — | PARTIALLY_IMPLEMENTED / RESEARCH (X-02) | PARTIALLY_IMPLEMENTED / RESEARCH | PARTIALLY_IMPLEMENTED / COMPLETE (supervised execution) | 3/4 STRONG CONSENSUS | medium: P-L3-004, PROTO-DEC-0075 item 11 | Build into C-3 dispatcher |
| 24 | RISK_COUNCIL.md | Global graph correctness (H-GRAPH-01) | L0-L3 | — | PARTIALLY_IMPLEMENTED / COMPLETE (K-07) | PARTIALLY_IMPLEMENTED / RESEARCH | — | 2/4 SPLIT | low: P-L0-004 draft | Research then implement graph checker |
| 25 | RISK_COUNCIL.md | Kernel epoch / packet freshness (H-FRESH-01/H-VERSION-01) | L0-L5 | L0 missing | PARTIALLY_IMPLEMENTED / RESEARCH (G-04) | PARTIALLY_IMPLEMENTED / RESEARCH | — | 3/4 STRONG CONSENSUS | medium: PROTO-DEC-0075 item 7 | Design epoch / policy-hash |
| 26 | RISK_COUNCIL.md | Instruction/data trust boundary (H-SEC-02) | L0 | L0 missing | ACTIVE / RESEARCH (G-02) | PARTIALLY_IMPLEMENTED / RESEARCH | ACTIVE (trust boundary) | 3/4 STRONG CONSENSUS | medium: R-L0-04 | Research with risk council |
| 27 | RISK_COUNCIL.md | Secret propagation / H-SEC-03 redaction | L3 | IMPLEMENTED (secret scanning) | PARTIALLY_IMPLEMENTED / COMPLETE (X-20) | PARTIALLY_IMPLEMENTED / RESEARCH | PARTIALLY_IMPLEMENTED (observability) | 2/4 SPLIT | high: protocol-handoff.cjs, AGENTS.md §7 | Extend redaction to runner logs |
| 28 | RISK_COUNCIL.md | Bounded context / packet completeness / L0 loading (H-CTX-01..05) | L0-L2 | L0 missing | PARTIALLY_IMPLEMENTED/ACTIVE / RESEARCH (K-02..K-06) | PARTIALLY_IMPLEMENTED / RESEARCH | RESEARCH_CANDIDATE / RESEARCH; UNCLEAR | 4/4 CONSENSUS | medium: CORE-ARCH-7, procedure.schema.md | Build K4 harness before council |
| 29 | RISK_COUNCIL.md | Owner SPOF / delegation (H-OWNER-01) | L0-L1 | L1 missing | PARTIALLY_IMPLEMENTED / COMPLETE (G-08) | PARTIALLY_IMPLEMENTED / RESEARCH | — | 3/4 STRONG CONSENSUS | medium: PROTO-DEC-0062 item 3, 0078 items 3-4 | Formalize delegation artifact/timeouts |
| 30 | RISK_COUNCIL.md | Independence vs epistemic diversity (H-IND-01) | L1 | L1 missing | PARTIALLY_IMPLEMENTED / RESEARCH (R1-01) | PARTIALLY_IMPLEMENTED / RESEARCH | PARTIALLY_IMPLEMENTED (independent review) | 3/4 STRONG CONSENSUS | medium: PROTO-DEC-0041, CORE-ARCH-3 §5 | Owner decision on family/provider rule |
| 31 | Google_AX.md | AX integration / runtime framework | L3-L4 | RESEARCH_CANDIDATE / RESEARCH (Study A) | RESEARCH_CANDIDATE / RESEARCH (X-16) | RESEARCH_CANDIDATE / RESEARCH | RESEARCH_CANDIDATE / RESEARCH | 4/4 CONSENSUS | high: PROTO-DEC-0066 Study A | Keep as study A seed |
| 32 | Google_AX.md | Event-driven DAG scheduler / routing primitives | L3 | PARTIALLY_IMPLEMENTED / KEEP (Implement in C-3) | — | PARTIALLY_IMPLEMENTED / RESEARCH | — | 2/4 SPLIT | medium: PROTO-DEC-0075/0076 | Implement in C-3 dispatcher |
| 33 | Rust.md | Node validator / remove PowerShell / work elimination | L3 | PARTIALLY_IMPLEMENTED / KEEP (Implement 0077) | PARTIALLY_IMPLEMENTED / COMPLETE (X-11, X-12, X-13) | PARTIALLY_IMPLEMENTED / COMPLETE (L184/L733) | RESEARCH_CANDIDATE / RESEARCH | 3/4 STRONG CONSENSUS | high: PROTO-DEC-0077, final-plan-2.md | Implement Node validator; measure before Rust |
| 34 | Rust.md | Rust core / colabsd / daemon, snapshot, watcher, cache | L3-L4 | RESEARCH_CANDIDATE / RESEARCH (Study A) | RESEARCH_CANDIDATE / RESEARCH (X-14); SUPERSEDED (C-06) | RESEARCH_CANDIDATE / RESEARCH (L237-746); STALE (L148) | RESEARCH_CANDIDATE / RESEARCH | 4/4 CONSENSUS | high: PROTO-DEC-0077, final-plan-2.md:71-75 | Defer to study A after Node baseline |
| 35 | MCP_Server.md | Direct in-process MCP server adoption | L3-L4 | SUPERSEDED / COMPLETE (Archive) | RESEARCH_CANDIDATE / RESEARCH (X-15) | STALE / KEEP (extract list) | RESEARCH_CANDIDATE / RESEARCH | 3/4 STRONG CONSENSUS | high: PROTO-DEC-0036, .ai/DECISIONS.md:1602 | Archive or mark stale header |
| 36 | MCP_Server.md | Ports/adapters / authz / idempotency / error taxonomy | L0-L3 | IMPLEMENTED / COMPLETE | — | PARTIALLY_IMPLEMENTED / KEEP | — | 2/4 SPLIT | medium: PROTO-DEC-0070/0077 | Extract reusable requirements |
| 37 | SYNTHESIS-2026-09-25-cross-document.md | Cross-document synthesis (K1-K10) | Meta | ARCHIVE_CANDIDATE / COMPLETE (Archive) | ARCHIVE_CANDIDATE | ARCHIVE_CANDIDATE / COMPLETE | SUPERSEDED / COMPLETE | 4/4 CONSENSUS | high: PROBLEMS.md P-1 closed | Archive |
| 38 | performers.md:139-1344 / benchmark.md:949-2154 | Duplicate brief block | — | DELETE candidate (§8) | DUPLICATE | DUPLICATE / COMPLETE | DELETE_CANDIDATE | 3/4 STRONG CONSENSUS | high: byte-level match | Delete after confirmation |
| 39 | scripts.md:1-1515 / scripts.md:1516-3029 | Duplicate program copy | — | DELETE candidate (§8) | DUPLICATE | DUPLICATE / COMPLETE | DELETE_CANDIDATE (redundant sections) | 3/4 STRONG CONSENSUS | high: prefix match | Delete first copy |
| 40 | Kernel dispatch | Kernel dispatcher / supervisor / state machine / resume-first recovery | L3 | L3 missing | PARTIALLY_IMPLEMENTED / COMPLETE (X-01, X-03, W-13) | PARTIALLY_IMPLEMENTED / KEEP/RESEARCH (L755, AX scheduler, H-RUNTIME-01) | PARTIALLY_IMPLEMENTED / COMPLETE (supervised execution) | 4/4 CONSENSUS | high: PROTO-DEC-0050 item 4, 0075 items 2-4,11, BACKLOG C-3 | Build C-3 dispatcher with tests |
| 41 | PROTO-DEC-0070 | Workspace per job / private clone / git modes | L3 | IMPLEMENTED (disposable clones) | PARTIALLY_IMPLEMENTED / COMPLETE (X-04) | — | — | 1/4 MINORITY FINDING | high: PROTO-DEC-0070 | Keep and launch |
| 42 | P-L3-002/003 | Automated model discovery / routing data | L3 | PARTIALLY_IMPLEMENTED (performers) | PARTIALLY_IMPLEMENTED / COMPLETE (X-10) | PARTIALLY_IMPLEMENTED (MODEL PROFILE essence) | PARTIALLY_IMPLEMENTED (model routing) | 4/4 CONSENSUS | medium: MODEL-MATRIX.md, P-L3-002/003 | Automate discovery |
| 43 | PROTO-DEC-0035 | Per-run outcome record / telemetry / token accounting | L2-L3 | — | PARTIALLY_IMPLEMENTED / COMPLETE (W-11) | PARTIALLY_IMPLEMENTED / RESEARCH (L2157) | PARTIALLY_IMPLEMENTED / COMPLETE (observability) | 3/4 STRONG CONSENSUS | medium: PROTO-DEC-0035, USAGE.md | Define unified run-record schema |
| 44 | PROTO-DEC-0066 Study B | Adaptive depth / parallelism / Study B | L2 | — | RESEARCH_CANDIDATE / RESEARCH (W-12) | — | — | 1/4 MINORITY FINDING | high: PROTO-DEC-0066 Study B | Run Study B as approved |
| 45 | PROTO-DEC-0071 | Fast/standard/full validation paths / incremental DAG | L3 | — | PARTIALLY_IMPLEMENTED / RESEARCH (X-12) | — | — | 1/4 MINORITY FINDING | medium: PROTO-DEC-0071 | Research after Node validator |
| 46 | final-plan-2.md M | Test-suite split | L3 | — | PARTIALLY_IMPLEMENTED / COMPLETE (X-13) | — | — | 1/4 MINORITY FINDING | medium: final-plan-2.md section M | Implement |
| 47 | final-plan-2.md J | Core API behind adapters / structured output / navigation indexes | L3 | — | PARTIALLY_IMPLEMENTED / COMPLETE (X-07, X-08, X-09) | — | — | 1/4 MINORITY FINDING | medium: protocol-index.cjs, final-plan-2.md J | Continue in Node migration/tooling |
| 48 | PROTO-DEC-0052/0053 | Research-cycle steps / freeze subject/join-key | L2 | — | PARTIALLY_IMPLEMENTED / COMPLETE (W-15) | IMPLEMENTED / COMPLETE (L1607-1960) | — | 1/4 MINORITY FINDING | medium: PROTO-DEC-0052/0053 | Formalize in S-003 |
| 49 | H-AUTH-02.md | Permission inheritance on resume/fallback | L1 | — | ACTIVE / COMPLETE (R1-03) | — | — | 1/4 MINORITY FINDING | low: no canonical source | Include in envelope design |
| 50 | benchmark.md | External benchmark facts citations (C-09) | L2 | — | UNCLEAR / RESEARCH | — | — | 1/4 MINORITY FINDING | low: dangling :chatgpt-content-reference markers | Verify or remove claims |
| 51 | scripts.md | Script/critical-section performance audit (C-10) | L3 | — | UNCLEAR / RESEARCH | — | — | 1/4 MINORITY FINDING | low: hooks unmeasured | Measure hooks/runtime |
| 52 | executor.md / benchmark.md | Non-circular calibration / external ground truth | L2 | — | ACTIVE / RESEARCH (W-16) | — | — | 1/4 MINORITY FINDING | medium: PROTO-DEC-0047 item 4 | Research with model qualification |
| 53 | RISK_COUNCIL.md H-REMOTE-01 | Remote/cloud execution without shared FS | L3-L5 | — | RESEARCH_CANDIDATE / RESEARCH (X-17) | — | — | 1/4 MINORITY FINDING | medium: PROTO-DEC-0077 item 1 | Low-priority research |
| 54 | RISK_COUNCIL.md H-CODE-01 | Project-code context resolver | L3 | — | RESEARCH_CANDIDATE / RESEARCH (X-18) | — | — | 1/4 MINORITY FINDING | medium: PROTO-DEC-0045 item 2 | Gated research |
| 55 | H-PROMPT-DELIVERY-01.md | Delivery variant D / orchestrator text injection | L3 | — | (contradiction #6) | OPEN QUESTION | — | UNRESOLVED | medium: PROTO-DEC-0073 | Owner call; keep pointer-only rule |
