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
   - the limit is not exhausted, where readable.

   An unavailable rung is skipped and the skip is recorded. The owner is not asked.
5. Selection for a stage, the layer above:
   1. the stage's capability floor, by uncertainty and consequence (PROTO-DEC-0075 item 8), maps to
      the highest rung it needs;
   2. the primary is the lowest available rung at or above the floor. Cheaper wins among admissible
      rungs; the owner's order already weighs quality against cost;
   3. substitutes 1 and 2 are the next available admissible rungs, preferring another family when
      the stage has an independence constraint (PROTO-DEC-0075 item 13);
   4. rungs of one group (the owner's "group" of equals) are interchangeable, and the tie goes to
      the one with the most headroom in its limit.
6. Recording. The runner writes the resolved primary and substitutes, and the skipped rungs with
   their reasons, into its state and its report. Evidence of the stage names the model that actually
   ran.
7. Change. A new owner snapshot replaces the ladder from its date. Running stages keep their
   resolution.

## 2. Supervision is a script (PROTO-DEC-0076)

- Processes are checked by a script, never by a model: liveness, completion, failures, retries.
- The script only accumulates statuses while the chain runs, then hands them over with a report of
  the work done: per stage, the model, route, tries, state, outputs, usage and the reasons for any
  manual acceptance.
- A model-run operator session (the round-2 Kilo operator) is not used for supervision.

## 3. Assessment of the pasted "Model Inventory, Working Pool and Executor Selection" proposal

Undisputed. Each point is decided already or follows from a decision:

| Point of the proposal | Source |
|---|---|
| Model names are data, not protocol constants | 0073, 0074 item 2 |
| AVAILABLE and WORKING are separate, and the user sees both | this file, sections 1.1-1.2 |
| AVAILABLE -> WORKING is a separate qualification step, and it is tech debt | the owner, 2026-09-25 (section 6) |
| Tier by uncertainty x consequence, not volume; senior models for the owner's list | 0074 item 4, 0075 item 8 |
| The decomposition senior spec -> worker -> middle -> senior escalation | 0074 item 4 |
| Capability floor before price; no silent downgrade; the owner gate on budget | 0075 item 9 |
| A primary plus two substitutes, chosen per role, not the next global rank | 0074 item 3, 0075 item 10 |
| Independence constraints in selection | 0075 item 13 |
| Explicit owner override, recorded as such | section 1.2; 0075 item 10 |
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
  on) add value over one ordered ladder.

## 4. Relation to the other files

- `docs/ops/MODEL-ECONOMICS.md` holds the snapshots: the ladder, limits, prices and measured runs.
- `docs/ops/BACKLOG.md` holds work items by the owner's triage; `docs/ops/PROBLEMS.md` holds the
  isolated blocking defects.
- The research runner `run-chain.cjs` is the current script supervisor. The kernel dispatch script
  of PROTO-DEC-0050 item 4 takes over this procedure.

## 5. Open

- The runner does not yet read the ladder: its dispatch file names models. That is a transitional
  breach of 0074 item 2, and it closes when the resolver of section 1.5 is scripted.

## 6. TD-MODEL-QUALIFICATION (technical debt)

- The move AVAILABLE -> WORKING is done by the owner, with the model's analysis, and not by a
  validated mechanism.
- Missing:
  - a unified capability schema;
  - repeatable qualification on project workloads;
  - normalised quality scoring;
  - price-performance per role class;
  - stale-data handling;
  - the feedback loop from telemetry to requalification.
- Until closed, section 1 is the procedure, and its choices are explainable, overridable and
  recorded.
