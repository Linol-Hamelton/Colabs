# Research frames registry (P-L0-008)

One row per frame. A frame without a row is not open (R-L0-22.12). Edited only under the
shared-document lock (AGENTS.md section 6). Statuses: CANDIDATE (not open), ACTIVE, BLOCKED (counts
as ACTIVE), SUSPENDED, CLOSED, TRANSITION-PENDING (counts as ACTIVE until the owner confirms).
Streams: S1 kernel, runtime and routes; S2 model and task routing; S3 product pilots. A CLOSED row
carries `receipt: <CR-id> <sha> K:n C:n A:n D:n R:n T:n` (P-L0-008 R-L0-22.67).

## Counters (kernel-completion mode)

| Counter | Value | As of | Source |
|---|---|---|---|
| DIG | not counted (ledger pending; first count is task one of the OwnerIdeas plan) | 2026-09-26 | R-L0-22.45 |
| DIG_FLOOR | - | - | R-L0-22.44 |
| DEFERRED_ACCEPTED | 0 | 2026-09-26 | R-L0-22.42 |
| DEFER backlog / cap | 3 / 5 (PROTO-DEC-0084) | 2026-09-26 | R-L0-22.29 |
| Candidates / cap | 4 / 5 (PROTO-DEC-0084) | 2026-09-26 | R-L0-22.55 (P-L0-008 0.3) |
| RER at last gate | - | - | R-L0-22.46 |
| Frames closed under P-L0-008 (trial: 5) | 0 (the transition inventory F-01..F-16 records closures before adoption) | 2026-09-26 | R-L0-22.50 |
| Closed frames without a receipt | 10 (9 in the first closure pass; F-01 excluded while its program implements) | 2026-09-26 | R-L0-22.56 |

## Frames

| ID | Frame | Path | Stream | Size | Status | Round | Opened | Gate owner | Verdict | Record | Suspension: reason; resume; responsible; review date |
|---|---|---|---|---|---|---|---|---|---|---|---|
| F-01 | OwnerIdeas revision | `docs/research/2026-09-26-ownerideas-revision/` | S1 | major | CLOSED | 3 | 2026-09-26 | owner | ACCEPT at the stage-3 gate; stages 4-12 continue as implementation preparation and implementation (R-L0-22.7); the stage-4 Kimi/MiMo critique is the plan's single critique | PROTO-DEC-0079..0081 | - |
| F-02 | Model-evidence layer (R-3): evidence base sufficient for Resolver v1 | `docs/research/2026-09-26-model-layer/` | S2 | major | ACTIVE | 0 of 2, admitted; round 1 waits for executor names | 2026-09-26 | owner | - | PROTO-DEC-0080, 0084 | - |
| F-03 | CORE-ARCH design program | `docs/core-arch/` | S1 | major | ACTIVE (continues) | continues through the approved stage 2 and the running stage-3 design (waits for Study B) | 2026-09-24 | owner | - | PROTO-DEC-0053, 0054; owner confirmation 2026-09-26: continues; every next stage passes admission under P-L0-008 | - |
| F-04 | Study A (AX, MCP facade, Rust daemon and caches, incremental validation, general core API) | `docs/research/2026-09-25-improvement-research/` | S1 | major | SUSPENDED | - | 2026-09-25 | owner | - | PROTO-DEC-0066; RESOLUTION R-6 | waits for K-launch after M-3; resume "K-launch ready"; responsible owner; review 2026-10-03 |
| F-05 | Study B (adaptive execution depth) | `docs/research/2026-09-25-improvement-research/` | S2 | major | SUSPENDED | - | 2026-09-25 | owner | - | PROTO-DEC-0066; RESOLUTION R-4 | waits for K-launch after M-3; resume "K-launch ready"; responsible owner; review 2026-10-03 |
| F-06 | Validator migration council | `docs/research/2026-09-25-validator-migration-council/` | S1 | major | CLOSED | 3 | 2026-09-25 | owner | ACCEPT | PROTO-DEC-0077 | - |
| F-07 | Cycle architecture | `docs/research/2026-09-20-cycle-architecture/` | S1 | major | CLOSED | - | 2026-09-20 | owner | ACCEPT | PROTO-DEC-0041; TASK "RESOLVED 2026-09-20" | - |
| F-08 | Cycle-history dataset (script and evidence snapshot) | `docs/research/2026-09-20-cycle-history/` | - | - | not a frame (measurement input to F-07) | - | - | - | - | R-L0-22.4; the dataset underlies F-16 | - |
| F-09 | Jev decision-fabric evaluation | `docs/research/2026-09-22-jev-decision-fabric-evaluation.md` | S2 | minor | CLOSED | 1 | 2026-09-22 | owner | REJECT (adoption as a decision fabric; Jev stays advisory outside the gate); the authorised offline replay is candidate C-JEV | PROTO-DEC-0045 item 3 | - |
| F-10 | Candidate tool evaluation (CodeGraph, Serena, Graphiti, Cognee, Letta, Mem0) | `docs/research/2026-09-22-kilo-candidate-tool-evaluation.md` | S1 | minor | CLOSED | 1 | 2026-09-22 | owner | REJECT (adoption; CodeGraph recorded as an alternative S1 arm of the preregistered experiment) | PROTO-DEC-0045 item 1 | - |
| F-11 | Kernel architecture discussion and questions | `docs/research/2026-09-23-kernel-architecture/` | S1 | major | CLOSED | - | 2026-09-23 | owner | ACCEPT (the layered scheme absorbed into CORE-ARCH; `PROCEDURE-MAP.md:15-16` keeps it a discussion input, not a decision) | PROTO-DEC-0054; F-03 | - |
| F-12 | R0 decision dataset | `docs/research/2026-09-23-r0-decision-dataset/` | - | - | not a frame (measurement; `README.md:13-17`: no model is called, no outcome is evaluated) | - | - | - | - | R-L0-22.4; evidence input to the routing research and the Jev calibration discussion | - |
| F-13 | Routing research (15 questions) | `docs/research/2026-09-23-routing/` | S2 | major | CLOSED | - | 2026-09-23 | owner | ACCEPT only for what entered PROTO-DEC-0047; DEFER for the remainder (D-02) | PROTO-DEC-0047; `INDEX-draft.md:9-11`, `:221` (its `:3` count is outdated) | - |
| F-14 | Remediation mapping cycle | `docs/research/2026-09-24-remediation-mapping/` | S1 | major | CLOSED | 3 | 2026-09-24 | owner | ACCEPT | PROTO-DEC-0048 item 4; 0052-0054 | - |
| F-15 | workflowAI review | `docs/research/2026-09-25-workflowai-review/` | S2 | major | CLOSED | 2 | 2026-09-25 | owner | ACCEPT | PROTO-DEC-0078 | - |
| F-16 | Cycle-history one-round proposal (Codex research) | `docs/reviews/2026-09-20-codex-cycle-history-research.md` | S1 | major | CLOSED | - | 2026-09-20 | owner | DEFER (D-01) | PROTO-DEC-0083 transition; owner confirmation 2026-09-26 | - |

## DEFER backlog (cap: pending owner number; R-L0-22.29)

| ID | Item | Summary | Reason | Reopen trigger | Canonical source | Date |
|---|---|---|---|---|---|---|
| D-01 (F-16) | One-round certification policy proposal | The research challenges the claimed three-reviewer/two-round optimum and proposes a seven-phase sequence with a single primary pass and a repeat on a specific trigger; it has no verdict yet | It concerns certification cycles and is decided after the pilots report | Publication of the comparative pilots report | `docs/reviews/2026-09-20-codex-cycle-history-research.md` (verdict RECOMMENDATION, 2026-09-20) | 2026-09-26 |
| D-02 (F-13 remainder) | Routing questions not closed by PROTO-DEC-0047 | 15 questions total (Q14 and Q15 were added later; `INDEX-draft.md:3` is outdated on the count). ACCEPT covers only what entered PROTO-DEC-0047, of the 8 completed pairs (`:221`: Q02, Q05, Q06, Q10, Q11, Q12, Q14, Q15). Unclosed, all 7: Q01, Q08, Q09 - primary answer exists, Gemini's critique not done; Q03, Q04, Q07, Q13 - no Gemini primary, and the critiques are not done: Mistral on Q03 and Q07, Copilot on Q04, DeepSeek on Q13. No final `INDEX.md` | The routing questions become measurable only once resolver v0 runs on live tasks | Resolver v0 launch (PROTO-DEC-0079 item 1, D1) | `docs/research/2026-09-23-routing/INDEX-draft.md:9-11`, `:221` (owner correction 2026-09-26) | 2026-09-26 |
| D-03 | Frozen workflowAI hypotheses H-WAI-1..6 (one entry) | Six hypotheses in `docs/core-arch/stage-4/workflowAI.md` section 3, frozen by PROTO-DEC-0076 item 4; moved here from `docs/ops/BACKLOG.md` | They need run records that do not exist yet; F-02 does not research them (PROTO-DEC-0084 item 1) | Run records accumulated (A-10) | `docs/core-arch/stage-4/workflowAI.md` section 3; `docs/ops/BACKLOG.md` (before migration) | 2026-09-26 |

## Candidates (not open)

| ID | Candidate | Source | Stream | Size | Waits for |
|---|---|---|---|---|---|
| C-R1 | K4 packet-completeness harness, then the RISK council (with R-2 epistemic diversity) | RESOLUTION section 7 (R-1, R-2) | S1 | major | a free S1 slot; owner sequencing U-10, U-11 |
| C-R5 | Write coordination and scale | RESOLUTION section 7 (R-5) | S1 | major | U-1, U-3; PROTO-DEC-0076 item 4 (lifted for R-3 only) |
| C-R7 | Delivery B against C; script and hook performance (merged with H-PROMPT-DELIVERY-01, `OwnerIdeas/H-PROMPT-DELIVERY-01_canonical-task-file-vs-orchestrator-loading.md`, per owner directive 2026-09-26) | RESOLUTION section 7 (R-7); `docs/ops/BACKLOG.md` (before migration) | S1 | minor | the Node phase-0 baseline; frozen hypothesis |
| C-JEV | Offline replay of Jev over historical decisions | PROTO-DEC-0045 item 3 | S2 | minor | a free S2 slot; the DIG ratchet (R-L0-22.43) |

## Migrated from docs/ops/BACKLOG.md (owner directive 2026-09-26)

| Former entry | Disposition now | Record |
|---|---|---|
| H-WAI-1..6 | DEFER D-03 (trigger: run records accumulated, A-10) | this file, D-03 |
| H-PROMPT-DELIVERY-01 | merged into candidate C-R7 | this file, C-R7 |
| L-GIT-01 | CLOSED - answered by the council (C-1) | `docs/ops/BACKLOG.md`, C-1 |

## Bypass incidents

| Date | Frame | What happened | Resolution |
|---|---|---|---|
