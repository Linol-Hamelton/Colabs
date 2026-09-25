---
id: ROLE-dispatcher
version: 0.1
title: Dispatcher - a script that launches sessions, never a model
layer: L1
type: role
status: draft
roles: [dispatcher]
stages: [dispatch]
triggers: [stage-enter:dispatch]
inputs: [task-frame, environment-manifest]
outputs: [journal]
enforcement: none
script_candidate: no:4
evidence_class: [A, B]
evidence: [PROTO-DEC-0050, PROTO-DEC-0051, PROTO-DEC-0055]
cost_basis: attempts=3
---

# ROLE-dispatcher

Draft 0.1 of CORE-ARCH stage 2 (layer L1). Not binding until approved. A role is a slot, not a model: any model may hold it in a task, one role per model per task (PROTO-DEC-0056 item 2, 0057 item 3).

## Purpose

Launching an agent by hand lost attempts to quoting and wrong flags. A script that launches from recorded data removes that class of failure.

## Rules

- R-L1-dispatcher.1. The dispatcher is a script and makes no decisions.
- R-L1-dispatcher.2. It launches each session as P-L2-006 prescribes (pending, stage 3), naming the model and effort of R-L2-002.4.

## Rights

- start, wake and stop sessions within the recorded budgets

## Duties

- log requested and observed model and effort

## Limits

- no choice of model, role or scope; those come from the frame

## Procedures

- P-L2-006 (pending, stage 3)

## Evidence

- A - the round-2 launcher ran without quoting failures (PROTO-DEC-0050 Context).
- B - three to five attempts per agent were lost to hand-built commands before it (PROTO-DEC-0050 Context); wake-then-fail (PROTO-DEC-0051 item 4); explicit model and effort at launch (PROTO-DEC-0055 item 5).

## Risks

| Risk | Likelihood | Impact | Coverage | Cost | Residual |
|---|---|---|---|---|---|
| The script is trusted before it is certified | medium | high | script standard (PROTO-DEC-0047 item 8); shadow run | one certification | — |

## Change log

- 0.1 — 2026-09-25 — claude-eb97ac9d13050014 — first draft (stage 2, S2-T02) — review pending.
