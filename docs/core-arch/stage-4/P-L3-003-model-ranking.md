---
id: P-L3-003
version: 0.2
title: Rank a provider's models as flagship, second and workhorse when the client does not say
layer: L3
type: procedure
status: draft
roles: [coordinator]
stages: [session, dispatch]
triggers: [discovery-unranked, owner-directive]
inputs: [journal, docs/core-arch/stage-4/MODEL-MATRIX.md]
outputs: [journal, docs/core-arch/stage-4/MODEL-MATRIX.md]
back_edges: []
enforcement: P
script_candidate: no:2
evidence_class: [B]
evidence: [sig-local-11, PROTO-DEC-0058, PROTO-DEC-0062, PROTO-DEC-0063, PROTO-DEC-0064]
cost_basis: owner=1
---

# P-L3-003 Rank models when the client does not say

Draft 0.2, CORE-ARCH stage 4 record, written early because the first run of P-L3-002 stopped on
it (sig-local-11). Not binding until approved. `script_candidate: no:2`: step 2 reads the
provider's web documentation, which is not repository state (spec §1 condition 2).

## Purpose

P-L3-002 step 3 picks a flagship, a second and a workhorse per provider. In its first run only
one client (codex) reported which of its models is stronger; four reported names only, and no
provider reported a price. The procedure then fell back to asking the owner, which is not a
procedure. This record says where strength and price are taken from, in which order, and when,
only after that, the owner is asked.

## Rules

- R-L3-003.1. Strength and price come only from the provider itself: the client's own catalog,
  then the provider's official documentation and pricing pages on the provider's own domain.
  Third-party leaderboards, memory and preference are not sources.
- R-L3-003.2. Every value is recorded with its source (command or URL) and date.
- R-L3-003.3. A model belongs to the matrix of the provider that makes it. A client that reaches
  other providers' models (for example copilot or agy) gets a list of reachable models, not ranks
  of its own. The one-role-per-model rule (PROTO-DEC-0056 item 2) applies to the model, whatever
  client runs it.
- R-L3-003.4. The owner is asked only for a rank that steps 1-4 leave unsettled, with the
  collected evidence attached.
- R-L3-003.5. A maker with fewer than three reachable models repeats the models it has: the
  higher-ranked above, the lower one filling the lower ranks (PROTO-DEC-0064 item 3).

## Steps

1. **Catalog** (coordinator). Take the client's own signals first: an explicit order or priority,
   a description, a default model. If they settle all three ranks, stop.
2. **Provider pages** (coordinator). For each provider still unranked, read its official model
   overview and pricing pages (read-only). Record for each candidate model: the provider's own
   positioning words (for example "most capable", "balanced", "fast and affordable"), and the input
   and output price per million tokens.
3. **Rank** (coordinator).
   - Flagship: the model the provider positions as its most capable.
   - Second: the next one down in the provider's own positioning.
   - Workhorse: among the rest, the model with the lowest output price that the provider positions
     for general or coding work; a tie goes to the higher-positioned model.
   - Version recency breaks a tie only between models of the same family and the same positioning.
4. **Reachable models** (coordinator). For clients that expose other providers' models, list them
   under their own provider's ranks and mark the client as a route to them (R-L3-003.3).
5. **Owner** (coordinator). Anything still unsettled goes to P-L0-002 as one stop-question per
   provider, with steps 1-4's evidence.

## Stop conditions

- The provider publishes neither positioning nor prices: step 5.
- Two pages of the same provider contradict each other: record both and go to step 5.

## Back edges

None.

## Evidence

- B - first run of P-L3-002 (signal sig-local-11 in the journal of claude-eb97ac9d13050014): four of six
  providers reported names only and none reported price, so step 3 stopped for four providers.
  Cost: one round of owner questions (owner=1). Signal sig-local-11.
- PROTO-DEC-0058 item 3 names the provider's own help as the source of the model list; this record
  extends "the provider's own information" to its official pages for strength and price.

## Risks

| Risk | Likelihood | Impact | Coverage | Cost | Residual |
|---|---|---|---|---|---|
| Provider pages are marketing, not measurement | high | medium | the rule only orders a provider's own models against each other; brand never ranks against brand | none | a provider that mislabels its own models |
| Pages change or disappear | medium | low | source and date on every value; re-run on upgrade (P-L3-002 trigger) | one run | between runs |
| Price alone picks a weak workhorse | medium | medium | only models positioned for general or coding work qualify | — | positioning is the provider's word |

## Change log

- 0.1 — 2026-09-24 — claude-eb97ac9d13050014 — first draft after the owner pointed at the missing procedure.
- 0.2 — 2026-09-25 — claude-eb97ac9d13050014 — repeat rule for makers with fewer than three models (PROTO-DEC-0064) — review pending.
