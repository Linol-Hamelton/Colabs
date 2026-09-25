---
id: P-L2-008
version: 0.2
title: Freeze a candidate before its certification starts
layer: L2
type: procedure
status: draft
roles: [coordinator, implementer, certifier]
stages: [freeze]
triggers: [stage-enter:freeze]
inputs: [task-frame, journal]
outputs: [candidate-package, evidence]
tools: [TOOL-protocol-handoff]
back_edges: [5>4/1/owner]
enforcement: none
script_candidate: no:4
evidence_class: [B]
evidence: [PROTO-DEC-0047, PROTO-DEC-0046, PROTO-DEC-0049]
cost_basis: unknown
---

# P-L2-008 Freeze a candidate

Trial record of CORE-ARCH stage 1, task S1-T08, written through P-L0-001 (class B). Draft 0.2;
lands in stage 3. Not binding until approved. The mechanical parts (commit exists, ancestry,
digest) become checks of the package builder in stage 3 (S3-T14); the choice of what belongs
to the candidate is judgement, hence `no:4`.

## Purpose

Certification must look at one fixed thing. Without a freeze, certifiers reviewed a tree before
its candidate existed, and unrelated work in the shared tree entered a candidate and failed its
scope check. This procedure makes the candidate a commit whose content is exactly the declared
scope.

## Rules

- R-L2-008.1. Certification of a candidate starts only after its freeze commit exists.
- R-L2-008.2. The freeze commit contains only paths inside the frame's `scope`; unrelated work
  in the tree stays out of it.
- R-L2-008.3. Every certifier works on that one SHA, in its own worktree, and records the SHA at
  start and end.
- R-L2-008.4. Authorisation for the commit itself follows the git rule of the code layer (see
  P-L9-001 and root R-L0-07); this procedure only says when and what.

## Steps

1. **Close the work** (implementer). All streams of the candidate stop; the journal has a
   checkpoint naming the last change.
2. **List the paths** (coordinator). `git status` against the frame's `scope`; anything outside
   the scope is excluded from the freeze and listed in the journal.
3. **Authorise** (owner, via the coordinator). See R-L2-008.4.
4. **Commit** (coordinator). A path-scoped commit of exactly the listed paths.
5. **Package** (coordinator). Build the candidate package (Baseline, Candidate, Scope-ID, Diff,
   Closes-findings, Producer-journal, Producer-Evidence) and record producer Evidence against the
   candidate (CORE-ARCH-6 §2). If the diff shows a path outside the scope, return to step 4
   (back edge 5>4, once).
6. **Hand over** (coordinator). The identical package goes to both certifiers.

## Stop conditions

- The owner does not authorise the commit.
- The diff still holds an out-of-scope path after one correction.

## Back edges

- `5>4/1/owner`: a package whose diff leaves the scope goes back to the commit once; a second
  failure goes to the owner.

## Evidence

- B - PROTO-DEC-0047 Context: "a certification round that reviewed a tree before its candidate
  existed"; Consequences: freeze commits must be path-scoped, "since unrelated work in the tree
  otherwise enters the candidate and fails its scope check". Cost: at least one round; not priced.
- B - PROTO-DEC-0046 item 6 made "the candidate is committed before certification" a condition
  for that premise only; this record makes it general.
- PROTO-DEC-0049 item 1: diff certification needs a fixed candidate to diff against.

## Risks

| Risk | Likelihood | Impact | Coverage | Cost | Residual |
|---|---|---|---|---|---|
| A needed file is left out of the freeze | medium | medium | the package diff is reviewed; certifiers widen reading | one more commit | — |
| The freeze waits for owner authorisation | medium | low | the coordinator asks at step 1, not at step 4 | owner attention | — |

## Change log

- 0.1 — 2026-09-24 — claude-eb97ac9d13050014 — trial record through P-L0-001 (S1-T08) — reviewer DeepSeek S1-T11: held.
- 0.2 — 2026-09-24 — claude-eb97ac9d13050014 — rule ids re-anchored to the record (schema 0.5, CA-24 class); no meaning changed — review pending.
