---
id: ROLE-reviewer
version: 0.2
title: Reviewer - adversarial check before a stage or candidate moves on
layer: L1
type: role
status: draft
roles: [reviewer]
stages: [accept]
triggers: [stage-exit, candidate-ready]
inputs: [candidate-package, task-frame, environment-manifest]
outputs: [review-report, findings-ledger, journal]
enforcement: P
script_candidate: no:4
evidence_class: [A]
evidence: [PROTO-DEC-0041, PROTO-DEC-0054, PROTO-DEC-0057, docs/research/2026-09-23-kernel-architecture/DISCUSSION.md:151]
---

# ROLE-reviewer

Draft 0.2 of CORE-ARCH stage 2 (layer L1). Not binding until approved. A role is a slot, not a model: any model may hold it in a task, one role per model per task (PROTO-DEC-0056 item 2, 0057 item 3).

## Purpose

A second pair of eyes that hunts for defects before the work goes further: to the owner for kernel work, to the certifier in the standard cycle.

## Rules

- R-L1-reviewer.1. The reviewer reads everything it checks, including the tools the implementer used.
- R-L1-reviewer.2. Its verdict token and its reproductions follow P-L2-004 (pending, stage 3); until then PROTO-DEC-0041 item 3 and `AGENTS.md:137-138` apply.
- R-L1-reviewer.3. The reviewer never edits the candidate.
- R-L1-reviewer.4. For kernel work its PASS or RECOMMENDATION sends the stage to the owner; in the standard cycle it sends the work to the certifier.
- R-L1-reviewer.5. The reviewer is the controller, in the sense of R-L0-05, of everything it reviews.

## Rights

- read anything
- run any check read-only
- append findings to the ledger
- write its own report and journal (FS_WRITE; without it, the transcription route of `AGENTS.md` section 5.5, ADVISORY)

## Duties

- diff-only review from the second round, widening where needed and saying why (PROTO-DEC-0049 item 1)
- record the model and effort it ran with

## Limits

- no edits to the candidate
- no certification of what it controlled

## Procedures

- P-L2-004 (pending, stage 3)
- P-L0-004 step 4
- P-L1-002

## Evidence

- A - closed verdicts and reproductions (PROTO-DEC-0041 items 3, 5); stage order (PROTO-DEC-0054 item 4, 0057 item 2); the reviewer reads the candidate (`docs/research/2026-09-23-kernel-architecture/DISCUSSION.md:151`).

## Risks

| Risk | Likelihood | Impact | Coverage | Cost | Residual |
|---|---|---|---|---|---|
| One reviewer model accumulates blind spots | medium | high | model rotation between steps (PROTO-DEC-0056 item 2); two certifiers at landing | none | shared training blind spots |

## Change log

- 0.1 — 2026-09-25 — claude-eb97ac9d13050014 — first draft (stage 2, S2-T02) — review pending.
- 0.2 — 2026-09-25 — claude-ad7cc4169e888ea8 — review fix CB-07: the right to write its own report is stated — second pass pending.
