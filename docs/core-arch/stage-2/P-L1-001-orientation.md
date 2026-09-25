---
id: P-L1-001
version: 0.2
title: Orientation - the first procedure of every session - where am I, what am I, what may I do
layer: L1
type: procedure
status: draft
roles: [all]
stages: [session]
triggers: [session-start]
inputs: [task-frame, environment-manifest, CATALOG]
outputs: [orientation-line, journal, stop-question]
back_edges: []
enforcement: none
script_candidate: no:4
evidence_class: [A, B, C]
evidence: [AGENTS.md:73, DEC-0020, PROTO-DEC-0050, PROTO-DEC-0055, PROTO-DEC-0057, PROTO-DEC-0065]
cost_basis: unknown
---

# P-L1-001 Orientation

Draft 0.1 of CORE-ARCH stage 2 (S2-T06). Not binding until approved. `enforcement: none` until the
orientation-line check of stage 3 exists; the check of the line against the packet is then
mechanical, while "do my rights cover this task" stays judgement (`no:4`).

## Purpose

A session is started for one task, in one role, by a model that knows nothing about the project.
Before it touches anything it must establish where it is, which role it holds, what it may and may
not do, and whether it is the right model for the task. The orientation line records that, so the
reviewer can see what the session believed when it started.

## Rules

- R-L1-001.1. A session checks that it runs in the repository its packet names before anything else,
  and stops if it does not.
- R-L1-001.2. The orientation line follows the launch line of R-L2-002.5; no work starts before
  both are written.
- R-L1-001.3. A session whose model already holds another role in its task frame (R-L2-002.2, with
  the participant of R-L1-002.1) stops before any work.
- R-L1-001.4. A task that asks for more than the role's rights and limits allow is a case of R-L0-10:
  the session stops and asks.

## Steps

1. **Where** (any role). `git rev-parse --show-toplevel` equals the root in the packet; otherwise stop.
2. **Launch line** (any role). If the client takes the model after launch, set the model and effort
   first by the client's own command, as the per-client procedure of stage 4 prescribes
   (PROTO-DEC-0065 item 2). Then write the launch line of R-L2-002.5, with the model's matrix id.
3. **Read** (any role). The root, the role record `ROLE-<slot>`, the full records the packet names for
   the stage, and the CATALOG summary of the rest.
4. **Orientation line** (any role). Write, in this grammar, with `<model-id>` the matrix id and
   `<scope-id>` the frame's (SCHEMA-assignment):
   `Orientation: <model-id> @ <scope-id>: <slot> | rights=<rule ids> | limits=<rule ids> | tools=<TOOL ids> | success=<criteria ids> | tier=<Tn>`
5. **One role** (any role). Check the frame's effective role lines (SCHEMA-assignment section 2):
   if this model holds another slot in them, stop (R-L1-001.3). A role held in another frame, the
   parent scope included, is not a second role here; the lineage bars of P-L1-002 cover it.
6. **Rights** (any role). Compare what the task asks with the role's rights and limits; any gap goes
   to P-L0-002 (R-L1-001.4).
7. **Tier** (any role). Recompute the tier with P-L2-002; a difference from the frame is reported
   as R-L2-002.5 prescribes, in the form `Tier-mismatch: planned=<Tn> computed=<Tn> reason=<factor>`.

## Stop conditions

- Wrong repository (step 1), a second role (step 5), rights that do not cover the task (step 6).

## Back edges

None. A stop ends the session or waits for the answer (P-L0-002).

## Evidence

- A - every session is told its role at start, and an unnamed one asks first (`AGENTS.md:73`; DEC-0020).
- B - one task given to two assistants produced two answers (DEC-0020 Context); cost unknown.
- Step 1 comes from the dispatch procedure (PROTO-DEC-0050 item 2); step 2 from PROTO-DEC-0055 item 5
  and 0065 item 2; step 5 from PROTO-DEC-0057 item 3.
- C - the orientation line itself is new (CORE-ARCH-3 section 6): a receipt of what the session
  understood, so a reviewer can compare it with the packet.

## Risks

| Risk | Likelihood | Impact | Coverage | Cost | Residual |
|---|---|---|---|---|---|
| The orientation line is written but not meant | medium | medium | the reviewer compares it with the packet; the line becomes checkable in stage 3 | one check | a line that is formally right |
| A model does not know its own id | medium | low | the dispatcher writes the launch values into the packet; the session copies them | none | clients that hide the model |

## Change log

- 0.1 — 2026-09-25 — claude-eb97ac9d13050014 — first draft (stage 2, S2-T06) — review pending.
- 0.2 — 2026-09-25 — claude-ad7cc4169e888ea8 — review fixes: CB-01 (step 5 checks one frame's effective lines) — second pass pending.
