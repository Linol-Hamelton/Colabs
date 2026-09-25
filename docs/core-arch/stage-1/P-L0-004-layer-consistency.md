---
id: P-L0-004
version: 0.3
title: Layer consistency check before a layer lands or the next layer starts
layer: L0
type: procedure
status: draft
roles: [procedure-author, reviewer]
stages: [any]
triggers: [stage-exit, package-freeze]
inputs: [CATALOG, decisions-index, record-draft, docs/core-arch/stage-1/RULE-MAP.md]
outputs: [journal, review-report, signals]
back_edges: [5>2/2/owner]
enforcement: none
script_candidate: yes
evidence_class: [C]
evidence: [PROTO-DEC-0054, docs/core-arch/CORE-ARCH-1.md:240]
trial: metric=M-001; kill=no defect found by the author's LCC in two layers while the reviewer finds LCC-class defects; until=CORE-ARCH package I-a
---

# P-L0-004 Layer consistency check (LCC)

Draft 0.3 of CORE-ARCH stage 1, task S1-T09 (fix: CA-24, CA-30, CA-31; CA-35). The home of the
nine checks is this record; CORE-ARCH-1 §6.3 points here. Not binding until approved (PROTO-DEC-0054 item 1).
`script_candidate: yes`: LCC-1..LCC-6, LCC-8 and LCC-9 meet the four conditions of spec
section 1 and are specified for `protocol-core.cjs` (S1-T10); LCC-7 stays with the reviewer.

## Purpose

The owner directed that before each next layer the architecture of processes and procedures
is checked for consistency (PROTO-DEC-0054 item 4). This procedure makes that check the same
nine questions every time, with a fixed journal line, so that a reviewer can see what was
checked and a script can later check most of it.

## Rules

- R-L0-19.1. No layer lands, and no next layer starts, without a recorded LCC line for it.
- R-L0-19.2. The author runs the LCC; the reviewer re-runs LCC-7 and spot-checks the rest.
- R-L0-19.3. A failed check is fixed or goes to the owner; it is never waived by the author.

## Steps

1. **Collect** (procedure-author). List the records of the layer and every record they point to.
2. **Check** (procedure-author). Run each check:

| # | Check | Pass condition |
|---|---|---|
| LCC-1 | one home | no rule id is defined in two records, and every rule id has its anchor (schema §3) |
| LCC-2 | direction | references go up, or through L5 artifacts. A reference down to another layer is a defect unless it is a forward reference to a record that a named stage writes; at a package freeze every forward reference must resolve. Why the exception: during design the root must name layers that do not exist yet. CORE-ARCH-1 §6.3 first had the strict form (every downward reference a defect); it was aligned to this row (CA-30) and now points here |
| LCC-3 | decisions | no record contradicts an accepted block (reverse map of `decisions-index`) |
| LCC-4 | roles | every slot in `roles` exists in L1 or is `all` |
| LCC-5 | tools | every `TOOL-*` in `tools` exists in L3 or is declared pending with its stage |
| LCC-6 | loops | every `back_edges` item has the form `<from>><to>/<budget>/<exit>` and its prose |
| LCC-7 | invariants | no record lets an agent break an L0 invariant (R-L0-03..R-L0-08, the "Invariants" part of the root) |
| LCC-8 | budget | the layer's full-load size stays within CORE-ARCH-2 §6 |
| LCC-9 | coverage | every RULE-MAP row homed in this layer has its record, or a declared pending stage |

3. **Record** (procedure-author). One journal line:
   `LCC: <layer> | 1=<pass|fail:<ids>> | 2=... | ... | 9=... | by=<session>`.
4. **Review** (reviewer). Re-run LCC-7 and at least three other checks; confirm or refute the line.
5. **Fix** (procedure-author). Each failed check is fixed in the records (back edge 5>2, at most
   two rounds), or goes to P-L0-002 with the failing ids.

## Stop conditions

- LCC-3 finds a contradiction with an accepted decision: that is P-L0-003 or P-L0-005, not a fix.
- A check cannot be run because its input does not exist yet (for example L1 before stage 2):
  record `n/a:<reason>` and declare the stage that closes it.

## Back edges

- `5>2/2/owner`: a failed check sends the author back to re-check after fixing, at most twice;
  then the owner decides.

## Evidence

- C - owner directive, PROTO-DEC-0054 item 4; the nine checks are CORE-ARCH-1 §6.3
  (`docs/core-arch/CORE-ARCH-1.md:240`). No practice evidence yet; trial M-001, counted by hand
  until L6 defines it.

## Risks

| Risk | Likelihood | Impact | Coverage | Cost | Residual |
|---|---|---|---|---|---|
| The line is filled in without running the checks | medium | high | the reviewer re-runs LCC-7 and three others; script later | reviewer time | until the script exists |
| Forward references hide missing records | medium | medium | LCC-2 and LCC-9 require the pending stage | — | a stage that slips |
| Checks become ritual | medium | medium | trial kill criterion | — | — |

## Change log

- 0.1 — 2026-09-24 — claude-eb97ac9d13050014 — first draft — reviewer DeepSeek S1-T11: FAIL (CA-24, CA-30, CA-31).
- 0.2 — 2026-09-24 — claude-eb97ac9d13050014 — anchored by root R-L0-19; LCC-1 checks anchoring; LCC-2 deviation from CORE-ARCH-1 §6.3 stated; LCC-7 covers R-L0-03 — reviewer DeepSeek r2: RECOMMENDATION (CA-35).
- 0.3 — 2026-09-24 — claude-eb97ac9d13050014 — LCC-2 note describes CORE-ARCH-1 §6.3 as it now is (CA-35, attempt 2) — for the owner (S1-T12).
