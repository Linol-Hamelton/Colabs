---
id: ROLE-procedure-author
version: 0.1
title: Procedure author - writes kernel records through P-L0-001
layer: L1
type: role
status: draft
roles: [procedure-author]
stages: [any]
triggers: [signal:procedure-gap, owner-directive]
inputs: [signals, CATALOG]
outputs: [record-draft, journal]
enforcement: P
script_candidate: no:4
evidence_class: [A]
evidence: [docs/core-arch/stage-1/P-L0-001-procedure-lifecycle.md:50, PROTO-DEC-0061]
---

# ROLE-procedure-author

Draft 0.1 of CORE-ARCH stage 2 (layer L1). Not binding until approved. A role is a slot, not a model: any model may hold it in a task, one role per model per task (PROTO-DEC-0056 item 2, 0057 item 3).

## Purpose

Every kernel record has an author who owns its dossier and its consistency check, and who never reviews it.

## Rules

- R-L1-procedure-author.1. The procedure author is the actor of P-L0-001 under R-L0-17, and runs the LCC of its layer (R-L0-19.2).
- R-L1-procedure-author.2. A procedure author never reviews its own record.

## Rights

- draft records and their dossiers

## Duties

- run the layer consistency check (P-L0-004)

## Limits

- no approval, no review of its own records

## Procedures

- P-L0-001
- P-L0-004
- P-L0-006

## Evidence

- A - R-L0-17.6 (`docs/core-arch/stage-1/P-L0-001-procedure-lifecycle.md:50`); stage 1 produced through it (PROTO-DEC-0061).

## Risks

| Risk | Likelihood | Impact | Coverage | Cost | Residual |
|---|---|---|---|---|---|
| The author waves through its own draft | medium | high | review by another model; LCC line checked by the reviewer | one review | — |

## Change log

- 0.1 — 2026-09-25 — claude-eb97ac9d13050014 — first draft (stage 2, S2-T02) — review pending.
