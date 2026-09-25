# workflowAI: the procedure for choosing owner-defined models

- Layer: kernel, model layer (stage 4). A candidate record, not certified.
- Status: ACTIVE as a bootstrap procedure. TECH DEBT: TD-MODEL-QUALIFICATION (section 6).
- Position in the stack:
  - below it: the table of available models and routes (`MODEL-MATRIX.md`, P-L3-002 discovery,
    P-L3-003 ranking, `kilo-routes.json`);
  - above it: the choice of a set of executors by task complexity (P-L2-002; PROTO-DEC-0074 and
    0075: roles, capability floor, primary and two substitutes).

  workflowAI turns "what is available" into "what we work with now". This is the qualification step
  of the stack; it is done by the owner for now.
- Binding sources:
  - PROTO-DEC-0073: no model or prompt in scripts;
  - PROTO-DEC-0074: roles, not models;
  - PROTO-DEC-0075: resolver order, recovery;
  - PROTO-DEC-0076: CLI-only routes, script supervision, defect triage.
- Where the data lives: model names, their order, routes and limits are data. They live in
  `docs/ops/MODEL-ECONOMICS.md`, never in this file or in a decision block.

## 1. Procedure (bootstrap, owner-defined)

1. Inventory. The available models come from the lower layer, and each client's own listing where
   the lower layer is stale (for example `agy models`, `kilo models`). A model not observed there is
   not available.
2. Owner's working ladder. The owner states an ordered ladder of working models, with a reason
   (cost and observed quality). It is recorded as a dated snapshot in `MODEL-ECONOMICS.md`, verbatim
   where the owner wrote it. A model outside the ladder is not used, unless the owner names it for
   one task.
3. Route rule. Each rung carries its route. Current rule, PROTO-DEC-0076:
   - makers' CLIs only;
   - the one exception is DeepSeek V4.1 Max, which receives long tasks only after the owner's
     manual approval.
4. Rung availability is checked by a script before a launch:
   - the client is present;
   - the model id is in the client's listing;
   - the limit is not exhausted, where readable. An unreadable limit counts as available;
     exhaustion found at run time is QUOTA_EXHAUSTED under PROTO-DEC-0075 item 4;
   - a rung the ladder marks "on approval" is available only for a task the owner approved, and
     the approval is recorded with the resolution (PROTO-DEC-0076 item 1). Approval is needed only
     for a task declared long; a task without a declaration counts as long (PROTO-DEC-0078 item 4).

   An unavailable rung is skipped and the skip is recorded. The owner is not asked about a skip;
   the owner is asked only in the terminal cases of item 5.
5. Selection for a stage, the layer above, in the order of PROTO-DEC-0075 item 9:
   1. the stage's capability floor, by uncertainty and consequence (0075 item 8), maps to the
      highest rung it needs; rungs below it are out;
   2. technical compatibility: rungs failing the stage's context window, modality, tools, route
      capability or language are out (0075 item 8);
   3. independence: the constraints the dispatch file declares (0075 item 13: another model,
      family or provider; no certifying one's own work; not the sole reviewer of one's own
      synthesis) are filters on the primary and the substitutes alike, checked against the
      models recorded for the work the stage judges;
   4. the primary is the lowest remaining rung. Cheaper wins among admissible rungs; the owner's
      order already weighs quality against cost;
   5. substitutes are the next remaining rungs, as many as the dispatch file asks, two by
      default (0075 item 10);
   6. rungs of one group (the owner's "group" of equals) are interchangeable. The tie goes to the
      one with the most headroom when both limits are readable in the same unit, else to the
      rung the owner wrote first in the snapshot (PROTO-DEC-0078 item 2);
   7. where the dispatch file declares a step budget, rungs whose estimate exceeds it are out;
   8. terminal cases, settled before the start, never by a silent downgrade:
      - no rung passes 1-3: BLOCKED, and the owner is asked;
      - none of them fits the budget: ASK OWNER or BLOCKED_BUDGET (0075 item 9);
      - fewer substitutes than asked: a certification or kernel-changing stage asks the owner
        before the start. Any other stage records the shortfall and starts; when recovery needs a
        substitute that does not exist, it is BLOCKED and the owner is asked, as for exhausted
        quota (PROTO-DEC-0078 item 3; `OWNER-DECISION-execution-model-2026-09-25.md`, recovery
        rule 4).
6. Recording. The runner writes into its state and its report: the date of the ladder snapshot
   used, the resolved primary and substitutes, the skipped and excluded rungs with their reasons,
   any owner approval, and any shortfall or terminal case. Evidence of the stage names the model
   that actually ran.
7. Change. A new owner snapshot replaces the ladder from its date. Running stages keep their
   resolution.

## 2. Supervision is a script (PROTO-DEC-0076)

- Processes are checked by a script, never by a model: liveness, completion, failures, retries.
- The script accumulates statuses while the chain runs, then hands them over with a report of the
  work done (PROTO-DEC-0076 item 3): per stage, the model, route, tries, state, outputs, usage
  where the client reports it (else why it is missing), and the reasons for any manual acceptance
  as the coordinator recorded them.
- When a stage counts as done, and which recovery transitions are allowed, is set by
  PROTO-DEC-0075 items 2-6 and 11; this file does not restate them. Semantic judgement is a
  reviewer stage (item 12), not the script's. The script recovers only mechanically, by those rules
  (PROTO-DEC-0078 item 1).
- A model-run operator session (the round-2 Kilo operator) is not used for supervision.

## 3. Assessment of the pasted "Model Inventory, Working Pool and Executor Selection" proposal

Undisputed. Each point is decided already or follows from a decision:

| Point of the proposal | Source |
|---|---|
| Model names are data, not protocol constants | 0073, 0074 item 2 |
| AVAILABLE and WORKING are separate, and the user sees both | 0076 item 2 (the layer between the table of available models and the choice of executors); sections 1.1-1.2 |
| AVAILABLE -> WORKING is a separate qualification step, and it is tech debt | 0076 item 2 (TD-MODEL-QUALIFICATION); section 6 |
| Tier by uncertainty x consequence, not volume; senior models for the owner's list | 0074 item 4, 0075 item 8 |
| The decomposition senior spec -> worker -> middle -> senior escalation | 0074 item 4 |
| Capability floor before price; no silent downgrade; the owner gate on budget | 0075 item 9 |
| A primary plus two substitutes, chosen per role, not the next global rank | 0074 item 3, 0075 item 10 |
| Independence constraints in selection | 0075 item 13 |
| Explicit owner override, recorded as such | section 1.2 (a model named for one task); 0076 item 1 (the approval-gated rung); 0075 item 10 (the resolution and its reasons go into Evidence) |
| Telemetry per stage (model, route, tries, cost, result) | 0075 items 6, 9-10; runner usage records |
| Non-goals: no global IQ score, no heavy resolver system | 0075 item 11 ("smallest mechanism") |

Hypotheses. They are recorded and not expanded now, by the owner's instruction of 2026-09-25, and
are tested when data exists:

- H-WAI-1: automatic discovery and bootstrap in a new environment is reliable enough to build the
  inventory without the owner. P-L3-002 is a candidate for it.
- H-WAI-2: the qualification criteria of the proposal's section 6 predict good executors. Until
  measured, the owner's ladder stands in for them.
- H-WAI-3: observed project results should outweigh external benchmarks once N runs exist per role
  class. N is unknown.
- H-WAI-4: price and performance differ enough by task class to justify per-class ladders instead
  of one.
- H-WAI-5: the requalification triggers of the proposal's section 21 are the right ones, and
  periodic requalification pays off.
- H-WAI-6: functional categories of the working pool (senior, worker, reviewer, verifier, and so
  on) add value over one ordered ladder. The role semantics and the escalation chain are decided
  (PROTO-DEC-0074 item 4); only a categorised pool, as against one ladder, is open.

## 4. Relation to the other files

- `docs/ops/MODEL-ECONOMICS.md` holds the snapshots: the ladder, limits, prices and measured runs.
- `docs/ops/BACKLOG.md` holds work items by the owner's triage; `docs/ops/PROBLEMS.md` holds the
  isolated blocking defects.
- The research runner `run-chain.cjs` is the current script supervisor. The kernel dispatch script
  of PROTO-DEC-0050 item 4 takes over this procedure.

## 5. Open

- The runner does not yet read the ladder: its dispatch file names models. That is a transitional
  breach of 0074 item 2, and it closes when the resolver of section 1.5 is scripted (BACKLOG C-3).
- The runner implements only part of PROTO-DEC-0075: resume-first, error classes, the hard ceiling
  and launch-input pinning are missing (BACKLOG M-4). Section 2 describes the target.
- Revision: R1-R8 of `docs/research/2026-09-25-workflowai-review/synthesis.md`, applied
  2026-09-25. The owner answered Q1-Q5 (PROTO-DEC-0078).

## 6. TD-MODEL-QUALIFICATION (technical debt)

- The move AVAILABLE -> WORKING is done by the owner, with the model's analysis, and not by a
  validated mechanism.
- Missing:
  - a unified capability schema;
  - repeatable qualification on project workloads;
  - normalised quality scoring;
  - price-performance per role class;
  - stale-data handling, starting with the ladder snapshot in `MODEL-ECONOMICS.md`, which today
    only a newer owner snapshot replaces (section 1.7);
  - the feedback loop from telemetry to requalification.
- Until closed, section 1 is the procedure, and its choices are explainable, overridable and
  recorded.
- Tracked as BACKLOG C-5. Its parts overlap H-WAI-2..5, which are frozen (PROTO-DEC-0076 item 4),
  so it is not worked while that freeze stands.
