---
id: P-L0-008
version: 0.1
title: Research governor - a frame closes with a decision; new research is not an output
layer: L0
type: procedure
status: trial
roles: [all]
stages: [any]
triggers: [frame-open, frame-round, frame-close, owner-directive]
inputs: [journal, DECISIONS, CATALOG]
outputs: [frame-verdict, DEC-block, backlog-item, signals]
back_edges: []
enforcement: P
script_candidate: no:1
evidence_class: [A, C, D]
evidence: [PROTO-DEC-0082, docs/research/2026-09-26-ownerideas-revision/round3/RESOLUTION-CLAUDE.md, docs/research/2026-09-26-ownerideas-revision/DISPATCH-OWNER.md]
cost_basis: unknown
trial: metric=M-010; kill=the governor blocks a slot for more than 24 h twice, or a stream holds more than 1 major + 1 minor ACTIVE across two consecutive gates, without an owner decision; until=3-5 closed frames
decision: [PROTO-DEC-0082]
---

# P-L0-008 Research governor

Trial 0.1 of CORE-ARCH, adopted by PROTO-DEC-0082 as Appendix A of the OwnerIdeas revision resume
directive (owner confirmation 2026-09-26, transcribed by `kilo-f22faac486b5e567`). It refines
PROTO-DEC-0052 item 1 and applies to the OwnerIdeas revision program from its adoption. Not binding
until the trial review; `status: trial`.

## Purpose

Research exists to close a decision; new research is not a research output. This procedure bounds
frames, streams and rounds so that a frame ends in a decision, a rejection, a bounded experiment or a
parked backlog item - never in "more research".

## Rules

- **R-L0-22 Frame.** A frame is bounded work whose main purpose is to reduce uncertainty, compare
  alternatives, produce a recommendation, or form or change a decision, an architecture or a plan.
  The name does not matter.
  - Not frames: fact-gathering and measurement; implementing an accepted decision; testing a defined
    implementation; review or certification of a frozen artifact that does not widen scope.
  - The stages of one program are one frame.
  - After ACCEPT, an implementation plan is preparation, not a frame, unless it reopens
    architecture. A plan is critiqued once.
- **R-L0-23 Size.** Minor: all of one question, one executor, one round, no kernel-architecture
  change, no new permanent mechanism, within a small budget. Major: everything else.
- **R-L0-24 Streams.** Streams are fixed by the owner: (1) kernel, runtime and routes; (2) model and
  task routing (schemas, profiles, calibration); (3) product pilots. A new stream needs an owner
  decision naming the stream it closes, merges or pauses.
- **R-L0-25 Admission.** Five fields go in the frame README: decision, question, alternatives,
  budget, exit condition. If they cannot be filled, the item goes to implementation, EXPERIMENT or
  DEFER.
- **R-L0-26 Verdicts.** Only four: ACCEPT (a DEC block and a linked implementation task, then
  CLOSED); REJECT (a tombstone with the decision and the evidence, then CLOSED); EXPERIMENT
  (hypothesis, baseline, thresholds, budget and deadline; holds a slot; KEEP leads to DEC,
  implementation and CLOSED, ROLLBACK leads to CLOSED); DEFER (summary, reason, reopen trigger and
  canonical source; goes to the backlog, out of agent context). "More research is needed" is not a
  verdict.
- **R-L0-27 Rounds.** At most two reasoning rounds, then the gate. A third round only by owner
  decision, with five justifications. No fourth round. Experiment iterations are bounded by budget.
- **R-L0-28 Limits.** Per stream: at most 1 major and 1 minor ACTIVE. An owner override names the
  frame it pauses. SUSPENDED: after 24 h in BLOCKED or waiting for a gate; a suspended frame records
  its reason, its resume condition, an owner and a review date. At most 1 suspended major per
  stream. The DEFER backlog cap is set by the owner after the cleanup.
- **R-L0-29 Findings.** Findings are BLOCKING, RELATED or FUTURE, classified by the gate owner, not
  the author. Only BLOCKING findings widen a frame. There are no child frames until the parent
  closes. P0/P1, security and data-loss findings are never DEFERred without an owner decision.
- **R-L0-30 Gate.** The owner decides. Low-risk gates may be delegated (0062 item 3, 0078). A
  delegate never closes a frame it authored (0057).
- **R-L0-31 Stop.** Any one of these sends a frame to its gate: no new decision-relevant evidence;
  an implementation is the cheaper test; the choice is reversible with a shown rollback; the
  question is optimization, not correctness. Stability is judged by evidence, not votes.
- **R-L0-32 Complexity.** A new layer, procedure, role, state machine, store or scoring model must
  show that the simpler option fails. This does not apply to accepted decisions. Full
  pre-registration and holdout apply only to kernel, certification and protected paths.
- **R-L0-33 DIG ratchet.** DIG counts accepted-not-implemented items. An item is implemented when
  its maturity chain reaches test and end-to-end use. DEFER items are excluded, and moving an item
  from ACCEPT to DEFER needs the owner. While DIG > DIG_FLOOR, optional frames do not open; P0/P1
  and security still pass. A new minimum becomes the floor; only the owner raises the floor. The
  ratchet is inactive until a status ledger exists; the first baseline count is task one of the
  plan. Report RER together with backlog growth.
- **R-L0-34 External texts.** External texts are advisory only. Empty citation markers are replaced
  by a verified source with an address and a date, or removed together with the claim they
  supported.
- **R-L0-35 Transition and trial.** On adoption, every open frame gets "continues to round X" or a
  verdict. The trial runs for 3-5 closed frames, then a short operational review: did it obstruct,
  was it bypassed, did it add false bureaucracy, did branches drop? The trial is reviewed if the
  governor itself blocks a slot for more than 24 h twice. Leaving the mode needs a Kernel v1
  completion contract; its scope and operating threshold are open for the owner.
- **R-L0-36 Validator checks** (to build): ACTIVE and SUSPENDED limits per stream; the five
  admission fields; a verdict and its fields on every closed frame; SUSPENDED after 24 h; no empty
  citation markers; DIG once the ledger exists.

## Steps

1. Frame owner fills the five admission fields in the frame README (R-L0-25) and states stream,
   size and round budget.
2. Work runs at most two reasoning rounds (R-L0-27); findings are classified at the gate, not by
   the author (R-L0-29).
3. The gate (R-L0-30) records one of the four verdicts with its fields (R-L0-26).
4. A SUSPENDED frame records reason, resume condition, owner and review date (R-L0-28).
5. A CLOSED frame writes its verdict, evidence and the DIG effect into the ledger once it exists
   (R-L0-33).

## Stop conditions

- No new decision-relevant evidence, or the question is optimization rather than correctness
  (R-L0-31) - go to the gate, do not open another round.
- A third round is requested - owner decision with five justifications, or the frame closes.
- A new layer, procedure, role or store is proposed without the simpler option shown to fail
  (R-L0-32) - implementation, EXPERIMENT or DEFER.

## Back edges

None.

## Evidence

- [A] PROTO-DEC-0082 - owner adoption of the governor as a trial policy.
- [C] `docs/research/2026-09-26-ownerideas-revision/round3/RESOLUTION-CLAUDE.md` - the revision whose
  open questions the governor bounds.
- [D] `docs/research/2026-09-26-ownerideas-revision/DISPATCH-OWNER.md` - the program the trial
  applies to.

Trial: M-010 - closed frames with a recorded verdict against opened frames, plus bypass incidents,
per stream, counted by hand until the ledger exists (R-L0-36). Kill: see front matter. Until: 3-5
closed frames.

Evolution log:
- 0.1 - accepted by PROTO-DEC-0082 (owner directive, 2026-09-26; trial).
