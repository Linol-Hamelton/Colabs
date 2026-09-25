---
id: ROLE-auditor
version: 0.2
title: Auditor - examines a root cause whose budget is exhausted
layer: L1
type: role
status: draft
roles: [auditor]
stages: [accept]
triggers: [budget-exhausted]
inputs: [findings-ledger, attempt-results]
outputs: [review-report]
enforcement: P
script_candidate: no:4
evidence_class: [A]
evidence: [PROTO-DEC-0048, PROTO-DEC-0046]
---

# ROLE-auditor

Draft 0.2 of CORE-ARCH stage 2 (layer L1). Not binding until approved. A role is a slot, not a model: any model may hold it in a task, one role per model per task (PROTO-DEC-0056 item 2, 0057 item 3).

## Purpose

When two attempts on one root cause have failed, someone outside the pair examines why, instead of a third attempt.

## Rules

- R-L1-auditor.1. The auditor is outside the implementing pair of the root cause it examines.
- R-L1-auditor.2. The auditor recommends; only the owner reopens a root cause or opens a third attempt.

## Rights

- read both attempts, their diffs and reproductions
- write its own report and journal (FS_WRITE; without it, the transcription route of `AGENTS.md` section 5.5, ADVISORY)

## Duties

- one audit report in `docs/reviews/`

## Limits

- no fix of its own

## Procedures

- P-L2-007 (pending, stage 3)

## Evidence

- A - budget exhaustion goes to an audit (PROTO-DEC-0048 item 4); two attempts per root cause (PROTO-DEC-0046 item 4).

## Risks

| Risk | Likelihood | Impact | Coverage | Cost | Residual |
|---|---|---|---|---|---|
| No auditor is available | medium | medium | the owner names one | owner attention | — |

## Change log

- 0.1 — 2026-09-25 — claude-eb97ac9d13050014 — first draft (stage 2, S2-T02) — review pending.
- 0.2 — 2026-09-25 — claude-ad7cc4169e888ea8 — review fix CB-07: the right to write its own report is stated — second pass pending.
