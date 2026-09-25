---
id: P-L2-002
version: 0.4
title: Choose the executor, model and effort for a task before it is launched
layer: L2
type: procedure
status: trial
roles: [all]
stages: [triage, dispatch]
triggers: [stage-enter:triage]
inputs: [task-frame, journal]
outputs: [task-frame, journal]
back_edges: [7>5/1/owner]
enforcement: P
script_candidate: no:4
evidence_class: [B, C]
evidence: [PROTO-DEC-0047, PROTO-DEC-0055, PROTO-DEC-0058, PROTO-DEC-0059, docs/reviews/2026-09-24-deepseek-core-arch-stage1-control.md:7]
cost_basis: unknown
trial: metric=M-007; kill=two consecutive tasks whose computed tier the executor or the reviewer disputes with a reproduced reason; until=CORE-ARCH package I-a
---

# P-L2-002 Choose executor, model and effort

Draft 0.4, CORE-ARCH stage 2 (L1/L2 boundary), written early and put into use as a trial on the
owner's instruction of 2026-09-24: "должно решаться согласно процедуре выбора модели (если такой
процедуры пока нет, надо ее описать и начать использовать)". Not binding until approved.

## Purpose

Every task runs in a new session, launched with its model and effort named explicitly
(PROTO-DEC-0055 item 5). Which model and effort that is was decided by habit or brand. The
first uses of this program showed it: a control prompt asked for "the strongest DeepSeek model
at the highest effort", and all passes ran on `deepseek/deepseek-flash` with effort unknown,
because no procedure said how to choose or what "strong" meant. This procedure makes the
choice a recorded step: complexity decides the tier, the tier and the task's other roles decide
the model, and models rotate between steps so that different training data and weights cover
each other's blind spots (owner, 2026-09-24).

## Rules

- R-L2-002.1. The tier of a task is computed before launch from the rubric below and written in
  the task frame (`tier`).
- R-L2-002.2. Within one task, one model holds one role. A model that already holds a role in the
  task is not chosen for another.
- R-L2-002.3. Between consecutive steps of a piece of work, prefer a different model from the one
  that did the previous step, when one of the right tier is available.
- R-L2-002.4. The session is launched with the chosen model and effort named explicitly; the
  model does not change inside the session.
- R-L2-002.5. The session's first journal line records the model and effort it actually runs
  with (`Launch: model=<id> effort=<value|unknown> client=<client>`); a mismatch with the frame
  is reported as `Tier-mismatch:` and a relaunch is requested.
- R-L2-002.6. A brand name is never a reason. The reason is the tier, the role constraint of
  R-L2-002.2 and the rotation of R-L2-002.3.

## Steps

1. **Frame** (coordinator). The task frame exists with goal, scope and risk class.
2. **Score** (coordinator). Score each factor 0-2:

| Factor | 0 | 1 | 2 |
|---|---|---|---|
| Size | ≤ 3 files | 4-15 | > 15 or a new module |
| Protected paths | none | tests or kernel documents | `.ai/`, validator, gates, hooks |
| Novelty | precedent exists | partial | none |
| Reversibility | trivial revert | revert with migration | irreversible or external |
| Ambiguity | no open question | 1-2 | ≥ 3 or conflicting sources |
| Coupling | one layer | two layers | ≥ 3 layers |

3. **Tier** (coordinator). Map the sum to a tier (PROTO-DEC-0059): 0 → T1; 1-2 → T2; 3 → T3;
   4-5 → T4; 6 → T5; 7-8 → T6; 9 → T7; 10-11 → T8; 12 → T9. Hard floors: a kernel change or a
   certification is at least T7; a protected path is at least T4. Write `tier` and the six scores
   in the frame.
4. **Exclude** (coordinator). List the models that already hold a role in this task (R-L2-002.2).
5. **Choose** (coordinator, or the owner when the owner launches). From the tier map, take an
   available model of the tier that is not excluded, preferring one different from the previous
   step's model (R-L2-002.3). Choose the effort the map gives for the tier. Write both in the frame.
6. **Launch** (dispatcher or owner). Name the model and effort at launch (R-L2-002.4).
7. **Confirm** (the executor). First journal line as R-L2-002.5. On a mismatch, the coordinator
   relaunches once (back edge 7>5); a second mismatch goes to the owner.

## Tier table

The table is built by P-L3-002 (model discovery), never filled from memory or preference
(PROTO-DEC-0058). Per provider it has nine tiers: three model ranks (workhorse, second,
flagship) times three effort levels (minimum, middle, maximum). The model rank comes first
(PROTO-DEC-0059):

| | minimum | middle | maximum |
|---|---|---|---|
| workhorse | T1 | T2 | T3 |
| second | T4 | T5 | T6 |
| flagship | T7 | T8 | T9 |

The current table, with a source for every cell, is `docs/core-arch/stage-4/MODEL-MATRIX.md`
(first run of P-L3-002 and P-L3-003, 2026-09-24; owner answers PROTO-DEC-0064, 0065). This
procedure reads it and never copies it (R-L0-12).

## Stop conditions

- No available model of the tier is left after step 4: go to P-L0-002 (the owner decides).
- The frame is missing: the tier cannot be computed.

## Back edges

- `7>5/1/owner`: a launch that does not match the frame is relaunched once; a second mismatch goes
  to the owner.

## Evidence

- B - the first stage-1 control prompt asked for T3; all four DeepSeek passes ran on `deepseek/deepseek-flash`, effort
  unknown (`docs/reviews/2026-09-24-deepseek-core-arch-stage1-control.md:7`); no procedure said
  what to choose. Cost: one open owner question, carried over four passes.
- B - PROTO-DEC-0047 item 9: effort scales and flags differ per client and were not recorded.
- C - owner principle of 2026-09-24 on executors, rotation and one role per model per task
  (PROTO-DEC-0056 item 2); rubric from CORE-ARCH-3 §7. Trial: M-007. The rubric was scored on ten
  past tasks (`trial/P-L2-002-rubric-trial.md`, S2-T07); its signals S-1..S-5 are open for review.

## Risks

| Risk | Likelihood | Impact | Coverage | Cost | Residual |
|---|---|---|---|---|---|
| The rubric under-rates protected work | medium | high | hard floors in step 3 | none | judgement in scoring |
| A tier cell is wrong | medium | medium | cells come only from P-L3-002 with their source and date; mismatch lines | one relaunch | provider information that is itself wrong |
| Rotation leaves no model of the tier | low | medium | stop to the owner | owner attention | — |

## Change log

- 0.1 — 2026-09-24 — claude-eb97ac9d13050014 — first draft, in trial use by owner instruction — owner: rules confirmed ("Это идеально"), interim tier map rejected.
- 0.2 — 2026-09-24 — claude-eb97ac9d13050014 — interim map withdrawn; nine-tier table built by P-L3-002 (PROTO-DEC-0058); score mapping and tier order open for the owner.
- 0.3 — 2026-09-24 — claude-eb97ac9d13050014 — score mapping, floors and tier order set by the owner (PROTO-DEC-0059) — review pending.
- 0.4 — 2026-09-25 — claude-eb97ac9d13050014 — the tier table points to MODEL-MATRIX.md instead of the empty-table note; rubric trial on ten past tasks (S2-T07); `roles: [all]`, because step 7 is the executor's (S2-T10 signal T-1); no `session-start` trigger, which would load the record in full in every packet (LCC-8) — review pending (stage 2).
