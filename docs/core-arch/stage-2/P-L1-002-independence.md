---
id: P-L1-002
version: 0.1
title: Independence - who counts as one participant, and when independence is checked
layer: L1
type: procedure
status: draft
roles: [coordinator, certifier, reviewer]
stages: [frame, dispatch, accept]
triggers: [role-assignment, candidate-frozen]
inputs: [task-frame, journal]
outputs: [journal, stop-question]
back_edges: []
enforcement: S~
enforced_by: [.ai/bin/protocol-scope.cjs]
script_candidate: yes
evidence_class: [A, B]
evidence: [PROTO-DEC-0038, PROTO-DEC-0041, PROTO-DEC-0047, PROTO-DEC-0048, PROTO-DEC-0056, PROTO-DEC-0057, PROTO-DEC-0063]
cost_basis: unknown
---

# P-L1-002 Independence

Draft 0.1 of CORE-ARCH stage 2 (S2-T03). Not binding until approved. `S~`: today
`protocol-scope.cjs` checks independence by parsing free prose, which produced five root causes
(PROTO-DEC-0048 Context); the fixed grammar of SCHEMA-assignment replaces that in package I-b.

## Purpose

A check is worth only as much as the independence of whoever makes it. The rules of independence
already have homes: the root, the selection procedure and the role records. This procedure adds
what they leave open: who counts as the same participant, over which frames independence is
judged, and when it is checked.

## Rules

- R-L1-002.1. The participant is the model, named by its maker's id in the model matrix. A client
  alias, a new session or another effort level of the same model is the same participant.
- R-L1-002.2. A candidate's lineage is every task frame that produced, fixed, reviewed or
  coordinated it. Independence is judged over the whole lineage, not the certifying frame alone.
- R-L1-002.3. Any participant may report FAIL or BLOCKED with a reproduction; only an independent
  certifier issues PASS or RECOMMENDATION toward a gate.
- R-L1-002.4. The number of checks scales with risk: high risk as R-L0-05 requires; medium risk one
  certifier and a confirmer that re-checks its report in a new session; low risk one independent
  reviewer statement.

### Rules this procedure checks, by home

| Rule | Home |
|---|---|
| no one certifies what they authored, executed or controlled; two certifiers for high risk | R-L0-05 |
| one model, one role per task frame; rotation between steps | R-L2-002.2, R-L2-002.3 |
| certification as a separate task; lineage | R-L1-certifier.1 |
| two certifiers on one package and SHA, neither reading the other | R-L1-certifier.2 |
| the coordinator certifies nothing it framed, dispatched or controlled | R-L1-coordinator.2 |
| the reviewer is the controller of what it reviews | R-L1-reviewer.5 |
| the implementer never reviews its own candidate | R-L1-implementer.3 |
| the author never reviews its own record | R-L1-procedure-author.2 |
| critics write independently | R-L2-S003.4 |
| synthesisers, researchers do not read each other first | R-L2-S003.3, R-L1-researcher.2 |
| a certifier-to-be is not the fixer | R-L1-fixer.2 |
| a shadow verdict never counts | R-L1-shadow-certifier.1 |

## Steps

1. **At assignment** (coordinator or owner). Before writing a role line, resolve each model to its
   matrix id (R-L1-002.1), collect the lineage of the candidate (R-L1-002.2), and check every rule
   in the table above against it. A conflict is not written; it goes to step 4.
2. **At orientation** (any role). P-L1-001 step 5 checks the one-role rule from the session's side.
3. **At certification** (certifier). The report names the lineage frames it checked and states that
   the certifier holds none of the excluded roles in them. The gate checks the role lines of every
   frame of the lineage.
4. **No eligible model** (coordinator). If the independence filter leaves a needed slot empty, the
   availability order of PROTO-DEC-0047 item 1 is applied to what remains; if nothing remains,
   P-L0-002 to the owner.

## Stop conditions

- A needed slot has no eligible model (step 4).
- A model id that the matrix does not hold: the assignment waits for P-L3-002.

## Back edges

None.

## Evidence

- A - independence and two certifiers (PROTO-DEC-0041 items 1-2); verdict asymmetry and checks by
  risk (PROTO-DEC-0047 items 2-3; PROTO-DEC-0038 item 2).
- B - free-prose role parsing produced five root causes, and the empty rounds spent the certifiers'
  limits (PROTO-DEC-0048 Context); cost unknown.
- R-L1-002.1 from PROTO-DEC-0056 item 2 and 0063 item 2 (the model, whatever client runs it);
  R-L1-002.2 from PROTO-DEC-0057 item 4 (certification as a task of its own).

## Risks

| Risk | Likelihood | Impact | Coverage | Cost | Residual |
|---|---|---|---|---|---|
| Splitting work into frames to escape a rule | medium | high | R-L1-002.2 judges the lineage, not the frame | lineage lookup | influence that no frame records |
| A client reports a model under another id | medium | medium | R-L1-002.1 resolves ids through the matrix; an unknown id stops | one lookup | a client that hides the model |
| A medium-risk confirmer re-checks its own report | low | medium | open: the decisions do not say whether the confirmer must be another model (owner question В-25) | — | until answered |

## Change log

- 0.1 — 2026-09-25 — claude-eb97ac9d13050014 — first draft (stage 2, S2-T03) — review pending.
