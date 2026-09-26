---
id: P-L0-008
version: 0.3
title: Research governor - every frame ends in a decision; new research is not an output
layer: L0
type: procedure
status: trial
roles: [all]
stages: [any]
triggers: [frame-open, frame-round, frame-gate, frame-close, owner-directive]
inputs: [journal, decisions-index, docs/research/FRAMES.md, .ai/DECISIONS.md]
outputs: [docs/research/FRAMES.md, .ai/DECISIONS.md, docs/ops/BACKLOG.md, journal, signals]
back_edges: [3>2/1/owner]
enforcement: P
script_candidate: no:1
evidence_class: [B, D]
evidence: [PROTO-DEC-0052, PROTO-DEC-0082, PROTO-DEC-0083, PROTO-DEC-0084, docs/research/2026-09-26-ownerideas-revision/round3/RESOLUTION-CLAUDE.md]
cost_basis: unknown
trial: metric=M-010; kill=in two independent cases the governor itself blocks a work stream for more than 24 h with no related technical or external blocker; until=frames-5
decision: [PROTO-DEC-0082, PROTO-DEC-0083, PROTO-DEC-0084]
---

# P-L0-008 Research governor

Trial 0.2 of CORE-ARCH stage 1, anchored by R-L0-22. Binding for every frame of the Colabs source
repository from PROTO-DEC-0083. `status: trial` means the text may change at the trial review; it is
not optional before then. Not installed into host projects. `until=frames-5` is the batch of the
first five frames closed under this procedure, counted in `docs/research/FRAMES.md`.

## Purpose

Research exists to close a decision; new research is not a research output. Without a bound, frames
multiplied faster than decisions were built. This procedure makes every frame end in ACCEPT, REJECT,
EXPERIMENT or DEFER, within bounded rounds and per-stream limits, and keeps the backlog, the
suspended frames and the accepted-but-unbuilt decisions visible and capped.

## Rules

R-L0-22.1. This procedure binds every frame of the Colabs source repository from PROTO-DEC-0083, and its trial status means its text may change at the trial review, not that it is optional.

R-L0-22.2. It does not apply to installed host projects until an owner decision extends it after the trial.

R-L0-22.3. A frame is bounded work whose main purpose is to reduce uncertainty, compare alternatives, produce a recommendation, or form or change a decision, an architecture or a plan, whatever its name.

R-L0-22.4. Fact-gathering and measurement that recommend nothing, implementation of an accepted decision, testing of a defined implementation, and review or certification of a frozen artifact are not frames.

R-L0-22.5. A review or certification that widens scope or designs something new opens a separate frame for that new part.

R-L0-22.6. All stages of one program, meaning one owner dispatch, form one frame.

R-L0-22.7. After ACCEPT, a plan that implements the accepted items is preparation and not a frame unless it reopens architecture, and it is critiqued once.

R-L0-22.8. A frame is minor only when it has one question, one executor, one reasoning round, no kernel-architecture change and no new permanent mechanism; every other frame is major.

R-L0-22.9. The streams are fixed by the owner: S1 kernel, runtime and routes; S2 model and task routing (schemas, profiles, calibration); S3 product pilots.

R-L0-22.10. Every frame belongs to exactly one stream, named at admission.

R-L0-22.11. A new stream needs an owner decision naming the stream it closes, merges or pauses, and a stream is never created to escape a limit.

R-L0-22.12. Every frame has one row in `docs/research/FRAMES.md`, edited only under the shared-document lock of AGENTS.md section 6, and a frame without a row is not open.

R-L0-22.13. A frame opens only when its README states the decision that depends on it, its one primary question, the alternatives, its budget (participants, rounds, deadline) and its exit condition.

R-L0-22.14. An item whose five admission fields cannot be stated goes to implementation, EXPERIMENT or DEFER, never to research.

R-L0-22.15. A frame ends only in ACCEPT, REJECT, EXPERIMENT or DEFER, and "more research is needed" is not a verdict.

R-L0-22.16. ACCEPT records an approved DEC block and a linked implementation task, and the frame's source material leaves the active corpus once canonicalized.

R-L0-22.17. REJECT records a tombstone with the decision and its main evidence, and the idea reopens only through a trigger row of AGENTS.md section 6.

R-L0-22.18. EXPERIMENT records, before it starts, the hypothesis, baseline, measured variable, success and failure thresholds, budget and deadline, and it holds a slot until it ends.

R-L0-22.19. An experiment ends in KEEP, which proceeds to a DEC block, implementation and CLOSED, or in ROLLBACK, which proceeds to CLOSED.

R-L0-22.20. DEFER records a summary, the reason, a reopen trigger and the canonical source, and the item stays out of agent context until reopened.

R-L0-22.21. A frame runs at most two reasoning rounds and then goes to its gate.

R-L0-22.22. A third round needs an owner decision that states the open blocking question, why two rounds could not answer it, how its answer could change the decision, its scope and its budget.

R-L0-22.23. There is no fourth round, and experiment iterations are bounded by the experiment's budget, not by rounds.

R-L0-22.24. A stream holds at most one major and one minor frame ACTIVE, and an experiment or a BLOCKED frame counts as ACTIVE.

R-L0-22.25. An owner override of a limit is recorded together with the frame it pauses.

R-L0-22.26. A frame BLOCKED or waiting for its gate for more than 24 hours becomes SUSPENDED and frees its slot.

R-L0-22.27. A SUSPENDED frame records its reason, resume condition, responsible party and next review date.

R-L0-22.28. A stream holds at most one SUSPENDED major frame, and beyond that a frame is closed, merged, deferred or replaced before another is suspended.

R-L0-22.29. The DEFER backlog has a cap set by the owner after the OwnerIdeas cleanup, and at the cap no new DEFER is recorded until items are merged, removed, closed or returned to work.

R-L0-22.30. Findings made in a frame are BLOCKING, RELATED or FUTURE, and the gate owner, not the author, assigns the class.

R-L0-22.31. Only BLOCKING findings widen the current frame, and RELATED and FUTURE findings go to the backlog as candidates.

R-L0-22.32. No child frame opens while its parent frame is open.

R-L0-22.33. A P0/P1, security, data-loss or missing-mandatory-capability finding is never DEFERred without an owner decision, and its author never classifies it.

R-L0-22.34. The owner decides every gate, and a low-risk gate may be delegated under PROTO-DEC-0062 item 3 and PROTO-DEC-0078.

R-L0-22.35. A delegate never closes a frame it created or authored (PROTO-DEC-0057).

R-L0-22.36. A frame goes to its gate when its last round added no decision-relevant evidence, or when an implementation, test or experiment answers faster, or when the chosen option is reversible and its rollback is shown, or when the open issue is optimization rather than correctness.

R-L0-22.37. Agreement between models is evidence of robust reasoning, not of truth, and a well-supported minority finding outweighs a weak consensus.

R-L0-22.38. A new proposal that adds a layer, mandatory procedure, permanent role, state machine, store or scoring model shows why the simpler option fails its acceptance criteria.

R-L0-22.39. R-L0-22.38 does not apply to accepted decisions, which reopen only through the triggers of AGENTS.md section 6.

R-L0-22.40. Full pre-registration and holdout apply only to kernel, certification and protected-path experiments, and other experiments state hypothesis, threshold and budget.

R-L0-22.41. DIG counts accepted items not yet implemented, and an item is implemented only when its maturity chain reaches test and end-to-end use.

R-L0-22.42. Moving an item from ACCEPT to DEFER needs an owner decision, removes it from DIG and adds it to DEFERRED_ACCEPTED, which is reported beside DIG until the item is implemented or its decision is cancelled.

R-L0-22.43. While DIG exceeds DIG_FLOOR no optional frame opens, and P0/P1, security and data-loss work still proceed.

R-L0-22.44. When DIG reaches a new minimum that value becomes DIG_FLOOR, and only an owner decision raises the floor.

R-L0-22.45. The DIG ratchet is inactive until a status ledger exists, and the first baseline count is the first task of the OwnerIdeas plan.

R-L0-22.46. RER, new questions opened over questions closed, is reported together with backlog growth at every gate.

R-L0-22.47. Text from outside the repository enters only as advisory input.

R-L0-22.48. An empty citation marker is replaced by a verified source with an address and a date, or removed together with the claim it supported.

R-L0-22.49. On adoption every open frame receives at a transition gate either "continues to round X" with its stream and size, or a verdict.

R-L0-22.50. The trial ends at the fifth frame closed under this procedure, followed by one operational review by a reviewer who neither drafted nor operates it, answering whether it obstructed work, was bypassed, created false bureaucracy, and reduced branches and DIG.

R-L0-22.51. A breach of a limit is recorded as a bypass incident in `docs/research/FRAMES.md` and counted in M-010, and it is not a kill criterion.

R-L0-22.52. These are the kernel-completion mode parameters, and they stay in force until the owner records steady-state parameters.

R-L0-22.53. Kernel-completion mode ends only when the Kernel v1 completion contract holds: the owner-approved Kernel v1 scope has canonical implementations; DIG within that scope is zero or its remainder is DEFERred by the owner; no P0, P1, security, data-loss or architectural-impossibility finding is open; the task lifecycle passes end to end for success, recoverable failure with retry or repair, and blocked-with-escalation; the mandatory validators and tests pass; documentation matches the implementation; no decision has two active sources of truth; every kernel frame has a verdict; and the navigation shows the kernel state and its open items unambiguously.

R-L0-22.54. The Kernel v1 scope is set by a separate owner decision, and performance blocks completion only where a hot path exceeds its own latency budget.

R-L0-22.55. The candidate list has a cap set by the owner, and at the cap no new candidate is recorded until a candidate is merged, removed or opened.

## Steps

Actor slots are defined in L1: `author` (frame author), `coordinator` (operator), `owner`, `reviewer`.

1. **Admission** (author, coordinator). Input: the proposed frame. The author writes the five
   admission fields in the frame README, with its stream and size (R-L0-22.8-22.14). The
   coordinator checks the stream limits and, for an optional frame, the DIG ratchet
   (R-L0-22.24, R-L0-22.43). Output: a FRAMES.md row, ACTIVE or CANDIDATE.
2. **Rounds** (author and participants). Input: the admitted frame. At most two reasoning rounds
   (R-L0-22.21). Findings are recorded without a class. Output: round artifacts and a candidate
   verdict.
3. **Gate** (owner or delegate). Input: the round artifacts. Classify findings (R-L0-22.30-22.33).
   Choose one verdict with its fields (R-L0-22.15-22.20), or grant one third round
   (R-L0-22.22; back edge 3>2). Output: the verdict, transcribed as a DEC block, tombstone,
   experiment record or DEFER entry, and the FRAMES.md row updated.
4. **Suspension** (coordinator). Input: a frame BLOCKED or at its gate for more than 24 h. Set it
   SUSPENDED with reason, resume condition, responsible party and review date
   (R-L0-22.26-22.28). Output: the updated row.
5. **Counters** (coordinator, at every gate). Update DIG, DIG_FLOOR, DEFERRED_ACCEPTED, the DEFER
   backlog size, RER and the closed-frame count in FRAMES.md (R-L0-22.41-22.46). Record every
   limit breach as a bypass incident (R-L0-22.51). Output: the counters block.
6. **Trial review** (reviewer named by the owner). Input: frames-5 reached and M-010. One short
   review file answers the four questions of R-L0-22.50. Output: accept, revise or retire,
   decided by the owner.

## Stop conditions

- The five admission fields cannot be stated: no frame; the item goes to implementation,
  EXPERIMENT or DEFER (R-L0-22.14).
- The stream limit is reached, or DIG exceeds DIG_FLOOR for an optional frame: the item stays
  CANDIDATE.
- A third round is requested: owner decision (R-L0-22.22), otherwise the gate closes the frame.
- A finding is P0/P1, security or data loss: the owner classifies it (R-L0-22.33).
- No rule covers the case: P-L0-002. Two sources conflict: P-L0-003.

## Back edges

- `3>2/1/owner`: from the gate back to the rounds, once, only by an owner decision with the five
  justifications of R-L0-22.22. There is no second use; the exit is the owner's verdict.

## Evidence

- [B] `docs/research/2026-09-26-ownerideas-revision/round3/RESOLUTION-CLAUDE.md` sections 1 and 7:
  the kernel decided far more than it built, and the revision produced seven research candidates.
  `docs/research/` gained twelve frame directories between 2026-09-20 and 2026-09-26. Cost:
  unknown (owner time and model runs not measured).
- [D] PROTO-DEC-0052 item 1 (old: up to three rounds, no terminal verdict, no concurrency limit,
  no registry). This version adds terminal verdicts, per-stream limits, a registry and the DIG
  ratchet. The old rule allowed unlimited parallel frames and treated research as an outcome.
- Decisions: PROTO-DEC-0082 (trial adoption), PROTO-DEC-0083 (general scope, 0.2).
- Trial: M-010 (CORE-ARCH-6 section 6), counted by hand from FRAMES.md until the checks exist;
  kill and until in front matter.
- Enforcement: `P` now. `script_candidate: no:1` because the recorded-rule condition of
  SPEC-protocol-core section 1 is unmet while the status is trial. After the trial is accepted,
  these checks go into the Node validator (PROTO-DEC-0077, A-4), WARN first:
  - per-stream ACTIVE and SUSPENDED limits;
  - the five admission fields;
  - a verdict with its fields on every closed row;
  - SUSPENDED after 24 h;
  - no empty citation markers;
  - DIG once the ledger exists.

## Risks

| Risk | Likelihood | Impact | Coverage | Cost | Residual |
|---|---|---|---|---|---|
| Work renamed to escape the limits | high | high | functional frame R-L0-22.3-22.6; registry R-L0-22.12 | one row per frame | judging a frame's main purpose |
| DEFER and SUSPENDED become graveyards | medium | high | R-L0-22.27-22.29, R-L0-22.42 | fields per item | DEFER cap not yet set |
| Owner gate becomes the bottleneck | high | medium | SUSPENDED R-L0-22.26; delegation R-L0-22.34 | none | owner availability |
| Authors classify their own blockers | medium | high | R-L0-22.30, R-L0-22.33 | gate time | none |
| DIG or RER gamed | medium | medium | R-L0-22.41-22.42, R-L0-22.46 | manual counting | counts by hand until the ledger |
| Bureaucracy for small work | medium | medium | non-frames R-L0-22.4; minor R-L0-22.8 | README fields | the minor line is judged |
| The governor blocks real work | low | high | kill criterion; trial review R-L0-22.50 | one review | none |

## Change log

- 0.1 — 2026-09-26 — kilo-f22faac486b5e567 (transcription; text by claude-b00262b88c55444b) — trial for the OwnerIdeas program only (PROTO-DEC-0082) — no review.
- 0.2 — 2026-09-26 — kilo-f22faac486b5e567 (transcription; text by claude-b00262b88c55444b) — general scope in the source repository; functional frame; minor without "small budget"; DEFERRED_ACCEPTED; kill criterion measures harm; FRAMES.md registry; transition gate; Kernel v1 contract; schema compliance (root R-L0-22 with sub-rules, Risks, Change log, ids of schema 2.1, until=frames-5, M-010 defined). Id map 0.1 to 0.2: R-L0-22 → 22.3-22.7; R-L0-23 → 22.8; R-L0-24 → 22.9-22.11; R-L0-25 → 22.13-22.14; R-L0-26 → 22.15-22.20; R-L0-27 → 22.21-22.23; R-L0-28 → 22.24-22.29; R-L0-29 → 22.30-22.33; R-L0-30 → 22.34-22.35; R-L0-31 → 22.36-22.37; R-L0-32 → 22.38-22.40; R-L0-33 → 22.41-22.46; R-L0-34 → 22.47-22.48; R-L0-35 → 22.49-22.53; R-L0-36 → Evidence (Enforcement) — reviewer Mistral Medium 3.5 (vibe; `docs/reviews/2026-09-26-mistral-p-l0-008-0.2-review.md`): RECOMMENDATION — PROTO-DEC-0083.
- 0.3 — 2026-09-26 — kilo-f22faac486b5e567 (transcription; text by claude-b00262b88c55444b) — candidate cap R-L0-22.55; caps set to 5 and 5 (PROTO-DEC-0084) — reviewer Mistral Medium 3.5 (`docs/reviews/2026-09-26-mistral-p-l0-008-0.3-f02-admission-review.md`): PASS.
