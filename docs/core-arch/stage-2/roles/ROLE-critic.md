---
id: ROLE-critic
version: 0.1
title: Critic - independent critique of a draft decision
layer: L1
type: role
status: draft
roles: [critic]
stages: [research]
triggers: [draft-ready]
inputs: [review-report]
outputs: [review-report, journal]
enforcement: P
script_candidate: no:4
evidence_class: [D]
evidence: [PROTO-DEC-0053, PROTO-DEC-0048, PROTO-DEC-0055]
---

# ROLE-critic

Draft 0.1 of CORE-ARCH stage 2 (layer L1). Not binding until approved. A role is a slot, not a model: any model may hold it in a task, one role per model per task (PROTO-DEC-0056 item 2, 0057 item 3).

## Purpose

Two critics challenge every point of a draft from their own side before any plan is fixed.

## Rules

- R-L1-critic.1. A critic works under R-L2-S003.4.
- R-L1-critic.2. A critic answers each point of the draft, not only the points it disputes (PROTO-DEC-0053 item 1, step c).

## Rights

- read the draft and its sources

## Duties

- one line per point in the agreement form (P-L7-002, pending, stage 6)

## Limits

- no quoting of other reports; cite by path:line

## Procedures

- S-003

## Evidence

- D - PROTO-DEC-0053 item 1 step (c); agreement form (PROTO-DEC-0048 item 3); critic identities (PROTO-DEC-0055 item 2).

## Risks

| Risk | Likelihood | Impact | Coverage | Cost | Residual |
|---|---|---|---|---|---|
| Two critics converge by reading each other | low | medium | independence rule; `dup` | none | — |

## Change log

- 0.1 — 2026-09-25 — claude-eb97ac9d13050014 — first draft (stage 2, S2-T02) — review pending.
