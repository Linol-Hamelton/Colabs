---
id: P-L0-002
version: 0.4
title: Stop and ask when a rule is missing, conflicting or blocked
layer: L0
type: procedure
status: draft
roles: [all]
stages: [any]
triggers: [rule-not-found, source-conflict, tool-blocked, scope-exceeded, budget-exhausted, premise-wrong]
inputs: [journal, CATALOG, decisions-index]
outputs: [stop-question, journal, signals]
back_edges: []
enforcement: P
script_candidate: no:4
evidence_class: [A, B, C]
evidence: [docs/research/2026-09-23-kernel-architecture/DISCUSSION.md:167, docs/research/2026-09-23-kernel-architecture/DISCUSSION.md:179, PROTO-DEC-0049]
cost_basis: owner=unknown
trial: metric=M-002; kill=mean owner clarifications per stop-question above 1.5 over ten questions; until=CORE-ARCH package I
---

# P-L0-002 Stop and ask

Draft 0.4 of CORE-ARCH stage 1, task S1-T03 (fix rounds: CA-03, CA-07; R-L0-10.8; evidence path). Not binding until approved (PROTO-DEC-0054 item 1).

## Purpose

An agent that meets a gap in the rules must not fill it with an invented rule, a bypass
flag or a guess. It stops, keeps its work recoverable, and asks the owner one question in a
fixed form that the owner can answer in one reply. This keeps authority with the owner
(L0 R-L0-04) and turns every gap into a recorded signal.

## Rules

- R-L0-10.1. When no rule covers the next action, stop before acting.
- R-L0-10.2. When two sources conflict, apply the source ranking; if the ranking does not
  settle it, stop.
- R-L0-10.3. When a tool is blocked by a permission, sandbox or gate, stop; never retry with a
  wider permission that the owner has not recorded.
- R-L0-10.4. When the premise of the task is wrong, report it upward instead of working
  around it ("the leaf has an edge upward", DISCUSSION section 4).
- R-L0-10.5. A stop is not a failure. Silent continuation past a stop condition is a violation.
- R-L0-10.6. "Act at your discretion" does not grant a missing authority; the agent asks
  again for the specific permission.
- R-L0-10.7. When a budget is exhausted (attempts per root cause, rounds per batch, wakes per
  session), stop; the case goes to the owner or to an audit, never to one more try.
- R-L0-10.8. When the next action falls outside the scope or onto a forbidden path of the task
  frame, stop; the frame is widened only by its issuer.

## Steps

1. **Save state** (any role). Write a journal checkpoint: what is done, what is next, the
   files touched. Nothing half-written stays outside the journal's record.
2. **Search once** (any role). Search CATALOG and grep the kernel and `decisions-index` for
   the rule. Record the query and the result count. A rule found ends the stop.
3. **Append a signal** (any role). `procedure-gap` for a missing or conflicting rule; `fall`
   only if the dispatcher records it. Until the signals ledger exists, a `Signal:` line in the
   journal (PROTO-DEC-0051 item 5).
4. **Ask** (any role). Send the stop-question below to the owner, or to the coordinator when
   one is named and the question is inside its delegated scope.
5. **Wait or continue elsewhere** (any role). Do nothing that depends on the answer. Work
   that does not depend on it may continue, and the journal says which.

### Stop-question form (five blocks)

```
STOP-QUESTION <signal id or journal line>
1. Context: task, step, what I was about to do.
2. Problem: rule missing | sources conflict (name both, path:line) | tool blocked (exact error) | scope exceeded | budget exhausted (which budget, count, ledger rows) | premise wrong.
3. Options: 2-4 options, each with its gain and its risk.
4. Recommendation: the option I would take and why. I do not act on it.
5. Waiting for: the exact decision or permission I need.
```

## Stop conditions

This procedure is itself the stop. If the owner cannot be reached, the agent ends its
session after step 3 with its journal entry; the next session resumes from the journal.

## Back edges

None. The answer re-enters the task at the step that stopped.

## Evidence

- A - the agy incident: the coordinator stopped and asked instead of bypassing the
  permission model (`docs/research/2026-09-23-kernel-architecture/DISCUSSION.md:179`).
- B - `--mode accept-edits` was assumed to allow commands instead of being measured, and the
  error entered a decision (PROTO-DEC-0049 Context, correcting PROTO-DEC-0047 item 7). A stop
  with a measurement would have caught it. Cost: one research run blocked at its first `git`.
- C - the rule sits in the root by agreement of the owner and Claude
  (`docs/research/2026-09-23-kernel-architecture/DISCUSSION.md:167`) and in the external
  synthesis supplied by the owner (`docs/research/2026-09-24-remediation-mapping/external-synthesis.md`,
  template 3). Trial: M-002,
  counted by hand until L6 defines it (stage 5).

## Risks

| Risk | Likelihood | Impact | Coverage | Cost | Residual |
|---|---|---|---|---|---|
| Too many stops; the owner is flooded | medium | medium | step 2 search first; the coordinator answers inside delegated scope; M-002 counts stops per task | one search | a genuinely thin kernel stops often until L1-L2 exist |
| Stop used to avoid hard work (taboo) | low | medium | the recommendation block is mandatory; reviewers flag stops without a real gap | none | — |
| Work lost while waiting | low | medium | step 1 checkpoint | one journal line | — |

## Change log

- 0.1 — 2026-09-24 — claude-eb97ac9d13050014 — reviewer DeepSeek: FAIL (CA-03, CA-07) — no decision.
- 0.2 — 2026-09-24 — claude-eb97ac9d13050014 — budget-exhausted and scope-exceeded in rules and form; artifact ids from schema 2.1 — reviewer DeepSeek r2: verified.
- 0.3 — 2026-09-24 — claude-eb97ac9d13050014 — R-L0-10.8 for scope-exceeded (r2 observation) — reviewer DeepSeek r3: verified.
- 0.4 — 2026-09-24 — claude-eb97ac9d13050014 — evidence points at the persisted external synthesis; no rule changed.
