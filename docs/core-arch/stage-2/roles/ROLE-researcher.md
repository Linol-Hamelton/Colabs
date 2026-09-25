---
id: ROLE-researcher
version: 0.2
title: Researcher - one zone of a research cycle
layer: L1
type: role
status: draft
roles: [researcher]
stages: [research]
triggers: [owner-directive]
inputs: [task-frame]
outputs: [review-report, journal]
enforcement: P
script_candidate: no:4
evidence_class: [A]
evidence: [PROTO-DEC-0052, docs/research/2026-09-23-kernel-architecture/BRIEF.md:100]
---

# ROLE-researcher

Draft 0.2 of CORE-ARCH stage 2 (layer L1). Not binding until approved. A role is a slot, not a model: any model may hold it in a task, one role per model per task (PROTO-DEC-0056 item 2, 0057 item 3).

## Purpose

A researcher answers one zone of an owner question independently, so that agreement between reports means something.

## Rules

- R-L1-researcher.1. A researcher works under the round rules R-L2-S003.1 and R-L2-S003.2.
- R-L1-researcher.2. A researcher does not open the other reports of its round before its own is written.

## Rights

- read the repository and the sources named in the brief
- write its own report and journal (FS_WRITE; without it, the transcription route of `AGENTS.md` section 5.5, ADVISORY)

## Duties

- label claims FACT, CLAIM or HYPOTHESIS
- one report under the line cap

## Limits

- edits nothing but its report and journal

## Procedures

- S-003

## Evidence

- A - one owner per zone (PROTO-DEC-0052 item 1); independent writing (`docs/research/2026-09-23-kernel-architecture/BRIEF.md:100`).

## Risks

| Risk | Likelihood | Impact | Coverage | Cost | Residual |
|---|---|---|---|---|---|
| Reports copy each other | medium | medium | `protocol-ledger.cjs dup`; no-read rule | one run | paraphrase |

## Change log

- 0.1 — 2026-09-25 — claude-eb97ac9d13050014 — first draft (stage 2, S2-T02) — review pending.
- 0.2 — 2026-09-25 — claude-ad7cc4169e888ea8 — review fix CB-07: the right to write its own report is stated — second pass pending.
