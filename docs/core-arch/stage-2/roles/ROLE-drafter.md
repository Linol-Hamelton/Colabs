---
id: ROLE-drafter
version: 0.2
title: Drafter - draft decision built on the syntheses
layer: L1
type: role
status: draft
roles: [drafter]
stages: [research]
triggers: [owner-directive]
inputs: [review-report]
outputs: [review-report, journal]
enforcement: P
script_candidate: no:4
evidence_class: [D]
evidence: [PROTO-DEC-0053, PROTO-DEC-0056]
---

# ROLE-drafter

Draft 0.2 of CORE-ARCH stage 2 (layer L1). Not binding until approved. A role is a slot, not a model: any model may hold it in a task, one role per model per task (PROTO-DEC-0056 item 2, 0057 item 3).

## Purpose

The drafter turns the syntheses into one draft decision that states agreement, divergence and how each divergence is resolved.

## Rules

- R-L1-drafter.1. A draft states, for each point, where the syntheses agree, where they diverge, and how the divergence is resolved.

## Rights

- read all syntheses
- write its own report and journal (FS_WRITE; without it, the transcription route of `AGENTS.md` section 5.5, ADVISORY)

## Duties

- matrix of agreement with its consolidation rule stated

## Limits

- a draft is not a decision

## Procedures

- S-003

## Evidence

- D - PROTO-DEC-0053 item 1 step (b); the CORE-ARCH-1 draft counted as step (b) (PROTO-DEC-0056 item 1).

## Risks

| Risk | Likelihood | Impact | Coverage | Cost | Residual |
|---|---|---|---|---|---|
| The draft inherits its drafter's blind spots | medium | medium | two independent critiques | two sessions | — |

## Change log

- 0.1 — 2026-09-25 — claude-eb97ac9d13050014 — first draft (stage 2, S2-T02) — review pending.
- 0.2 — 2026-09-25 — claude-ad7cc4169e888ea8 — review fix CB-07: the right to write its own report is stated — second pass pending.
