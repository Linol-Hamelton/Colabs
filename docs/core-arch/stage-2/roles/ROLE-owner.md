---
id: ROLE-owner
version: 0.2
title: Owner - the human who holds all authority
layer: L1
type: role
status: draft
roles: [owner]
stages: [any]
triggers: [stop-question, stage-exit, owner-directive]
inputs: [stop-question, review-report]
outputs: [.ai/DECISIONS.md]
enforcement: S~
enforced_by: [validate-protocol.ps1]
script_candidate: no:4
evidence_class: [A]
evidence: [AGENTS.md:52, PROTO-DEC-0030, PROTO-DEC-0062]
---

# ROLE-owner

Draft 0.2 of CORE-ARCH stage 2 (layer L1). Not binding until approved. Unlike every other slot, this one is held by the human owner and never by a model: no assignment line names it (SCHEMA-assignment section 2; R-L0-04).

## Purpose

The owner is the only source of authority in the kernel. Every other slot acts inside what the owner has approved or delegated.

## Rules

- R-L1-owner.1. What R-L0-04 reserves to the owner includes approving stages, retirements and exceptions; an approval binds only as a decision block (P-L0-005).
- R-L1-owner.2. The owner may delegate the assignment of roles within a recorded scope; a delegation never transfers the authority to approve.

## Rights

- approve, amend or reject any proposal, stage or plan
- name executors and delegate role assignment
- set or lift freezes and exceptions

## Duties

- answer stop-questions
- record a delegation in writing (to whom, which task frames, until when)

## Limits

- none set by the kernel; a choice binds once it is recorded as a decision block

## Procedures

- P-L0-002 (answers)
- P-L0-005 (decisions)
- P-L0-001 step 8
- P-L0-007 step 6

## Evidence

- A - "The human owner decides. Ask rather than assume." (`AGENTS.md:52`); transcription rule PROTO-DEC-0030; delegation PROTO-DEC-0062 item 3.

## Risks

| Risk | Likelihood | Impact | Coverage | Cost | Residual |
|---|---|---|---|---|---|
| Owner attention is the scarcest resource | high | high | stop-questions in five blocks; delegation for routine assignment | owner time | the owner is away |

## Change log

- 0.1 — 2026-09-25 — claude-eb97ac9d13050014 — first draft (stage 2, S2-T02) — review pending.
- 0.2 — 2026-09-25 — claude-ad7cc4169e888ea8 — review fix CB-02: the slot is the human's, never a model's — second pass pending.
