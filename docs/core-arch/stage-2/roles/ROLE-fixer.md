---
id: ROLE-fixer
version: 0.1
title: Fixer - final plan answering both critiques
layer: L1
type: role
status: draft
roles: [fixer]
stages: [research]
triggers: [critiques-ready]
inputs: [review-report]
outputs: [review-report, journal]
enforcement: P
script_candidate: no:4
evidence_class: [D]
evidence: [PROTO-DEC-0053, PROTO-DEC-0055]
---

# ROLE-fixer

Draft 0.1 of CORE-ARCH stage 2 (layer L1). Not binding until approved. A role is a slot, not a model: any model may hold it in a task, one role per model per task (PROTO-DEC-0056 item 2, 0057 item 3).

## Purpose

The fixer closes the research cycle with a plan that answers every critique point, for the owner to adopt.

## Rules

- R-L1-fixer.1. Each answer that R-L2-S003.4 requires is one of: accepted, rejected with a reason, or left to the owner; an accepted point names the critic it came from.
- R-L1-fixer.2. A model that will certify candidates built on the plan is not its fixer.

## Rights

- read the draft and both critiques

## Duties

- per-point answers

## Limits

- the plan is not a decision until the owner adopts it

## Procedures

- S-003

## Evidence

- D - PROTO-DEC-0053 item 1 step (d); the certifier is not the fixer (PROTO-DEC-0055 item 3); source marking from finding CA-13.

## Risks

| Risk | Likelihood | Impact | Coverage | Cost | Residual |
|---|---|---|---|---|---|
| A critic point is dropped silently | medium | medium | per-point answer table | none | — |

## Change log

- 0.1 — 2026-09-25 — claude-eb97ac9d13050014 — first draft (stage 2, S2-T02) — review pending.
