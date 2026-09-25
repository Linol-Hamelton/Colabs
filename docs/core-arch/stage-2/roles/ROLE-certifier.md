---
id: ROLE-certifier
version: 0.1
title: Certifier - independent final check whose verdict a gate counts
layer: L1
type: role
status: draft
roles: [certifier]
stages: [accept]
triggers: [candidate-frozen]
inputs: [candidate-package]
outputs: [review-report, evidence, journal]
enforcement: S~
enforced_by: [.ai/bin/protocol-handoff.cjs]
script_candidate: no:4
evidence_class: [A]
evidence: [PROTO-DEC-0041, PROTO-DEC-0031, PROTO-DEC-0046, PROTO-DEC-0057, AGENTS.md:127]
---

# ROLE-certifier

Draft 0.1 of CORE-ARCH stage 2 (layer L1). Not binding until approved. A role is a slot, not a model: any model may hold it in a task, one role per model per task (PROTO-DEC-0056 item 2, 0057 item 3).

## Purpose

The certifier is the independent check that lets work be accepted without the owner reading it all.

## Rules

- R-L1-certifier.1. R-L0-05 holds even when the certification runs as a task of its own, and across every frame of the candidate's lineage (P-L1-002).
- R-L1-certifier.2. Each of the two certifiers R-L0-05 requires gets the identical package at one committed SHA, works in its own worktree, and reads neither the other's report before fixing its own verdict.
- R-L1-certifier.3. A certifying verdict needs FS_WRITE, SHELL_EXEC, EVIDENCE_SIGN and REPO_READ, set by the orchestrator, never self-declared.
- R-L1-certifier.4. In the standard cycle a certifier PASS approves the work on the certifier's authority; FAIL or RECOMMENDATION sends it to the owner.

## Rights

- issue a CERTIFYING verdict
- record its own Evidence

## Duties

- record the candidate SHA at start and end
- declare `Mode: CERTIFYING` and `Receipt-Owner`

## Limits

- no certification of anything it shaped
- no second role in the same task

## Procedures

- P-L2-004 (pending, stage 3)
- P-L2-008
- P-L1-002

## Evidence

- A - independence and two certifiers (PROTO-DEC-0041 items 1-2; one SHA, own worktree, PROTO-DEC-0046 item 6); capabilities (PROTO-DEC-0031; `AGENTS.md:127`); approval on the certifier's authority and no self-certification in a separate task (PROTO-DEC-0057 items 2, 4).

## Risks

| Risk | Likelihood | Impact | Coverage | Cost | Residual |
|---|---|---|---|---|---|
| Certifier limits run out | high | medium | availability order after the independence filter (PROTO-DEC-0047 item 1); diff-only rounds | waiting | no certifier available |

## Change log

- 0.1 — 2026-09-25 — claude-eb97ac9d13050014 — first draft (stage 2, S2-T02) — review pending.
