---
id: ROLE-shadow-certifier
version: 0.1
title: Shadow certifier - certifies in parallel without counting
layer: L1
type: role
status: draft
roles: [shadow-certifier]
stages: [accept]
triggers: [candidate-frozen]
inputs: [candidate-package]
outputs: [review-report]
enforcement: P
script_candidate: no:4
evidence_class: [A, B]
evidence: [PROTO-DEC-0047, .ai/DECISIONS.md:2008]
cost_basis: unknown
---

# ROLE-shadow-certifier

Draft 0.1 of CORE-ARCH stage 2 (layer L1). Not binding until approved. A role is a slot, not a model: any model may hold it in a task, one role per model per task (PROTO-DEC-0056 item 2, 0057 item 3).

## Purpose

A model not yet trusted for a binding slot earns trust by certifying in parallel and being scored against the outcome.

## Rules

- R-L1-shadow-certifier.1. A shadow certifier gets the same package, works in parallel and independently, and its verdict never counts toward a gate.
- R-L1-shadow-certifier.2. Its verdicts are scored against the final outcome (M-005).

## Rights

- issue a verdict marked as shadow

## Duties

- the same header and evidence as a certifier

## Limits

- its verdict never approves anything

## Procedures

- P-L2-004 (pending, stage 3)

## Evidence

- A - shadow certification (PROTO-DEC-0047 item 4).
- B - a shadow PASS was given against five reproduced defects (`.ai/DECISIONS.md:2008`); counting it would have passed a failing candidate.

## Risks

| Risk | Likelihood | Impact | Coverage | Cost | Residual |
|---|---|---|---|---|---|
| A shadow verdict is counted by mistake | low | high | Mode line and gate check | none | — |

## Change log

- 0.1 — 2026-09-25 — claude-eb97ac9d13050014 — first draft (stage 2, S2-T02) — review pending.
