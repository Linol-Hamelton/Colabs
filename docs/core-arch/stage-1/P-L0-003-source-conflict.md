---
id: P-L0-003
version: 0.2
title: Resolve a conflict between two sources of truth
layer: L0
type: procedure
status: draft
roles: [all]
stages: [any]
triggers: [source-conflict]
inputs: [decisions-index, journal, CATALOG]
outputs: [journal, signals, stop-question]
back_edges: []
enforcement: P
script_candidate: no:4
evidence_class: [A, B]
evidence: [AGENTS.md:28, docs/research/2026-09-24-remediation-mapping/PROCEDURE-MAP.md:150, docs/research/2026-09-24-remediation-mapping/PROCEDURE-MAP.md:153, docs/research/2026-09-23-kernel-architecture/DISCUSSION.md:46]
cost_basis: unknown
---

# P-L0-003 Resolve a conflict between two sources of truth

Draft 0.2 of CORE-ARCH stage 1, task S1-T09 (fix: CA-25). Not binding until approved (PROTO-DEC-0054 item 1).

## Purpose

When two sources say different things, an agent must neither pick the convenient one nor
act on a stale text. The ranking of the root (R-L0-03) settles most conflicts; this procedure
says what to do with the loser and what to do when the ranking does not settle it. It prevents
the measured class of stale restatements that kept being acted on: PAIRED-CYCLE section 5
behind three later decisions (K4), PROTOCOL.md still prescribing a closed tool (K3).

## Rules

- R-L0-03.1. Name both sources with `path:line` before deciding anything.
- R-L0-03.2. The higher-ranked source wins; the lower one is stale and is never acted on.
- R-L0-03.3. A stale text is fixed by the session that owns it and has it in scope; otherwise it
  is reported, never silently left.
- R-L0-03.4. Two accepted decision blocks that conflict without a `Supersedes:` line are not
  resolved by any agent; the case goes to the owner.

## Steps

1. **Locate** (any role). Write both sources as `path:line` and quote nothing longer than
   needed. Output: a journal line `Conflict: <path:line> vs <path:line>`.
2. **Rank** (any role). Apply R-L0-03: decisions > tree and git > task > plan > journals >
   archive. Use the reverse map of `decisions-index` to find every block that names the path.
3. **Same rank?** If both are accepted decision blocks, check for `Supersedes:`; if one
   supersedes the other, the later wins. If neither does, go to P-L0-002 with problem
   `sources conflict` and trigger `higher-source-contradiction` in mind for P-L0-005.
4. **Handle the loser** (any role). If the stale text is in a file the session owns and in
   scope, fix it in the same candidate and say so in the journal. If not, record a
   `procedure-gap` signal naming the stale path, and for a shared document add a line to the
   task's open questions under the lock.
5. **Continue** on the winning source.

## Stop conditions

- Step 3 finds two unsuperseded conflicting decisions.
- The winning source itself is ambiguous at the point of conflict.
- Fixing the stale text would leave the task's scope.

## Back edges

None. A stop goes to P-L0-002 and the answer re-enters at step 5.

## Evidence

- A - the ranking rule already settles most conflicts (`AGENTS.md:28`, since DEC-0001..0007).
- B - K3 and K4 in PROCEDURE-MAP (`docs/research/2026-09-24-remediation-mapping/PROCEDURE-MAP.md:150`,
  `:153`): stale kernel text survived later decisions because nothing made the reader fix or
  report it. Eight certification rounds went to diverging restatements
  (`docs/research/2026-09-23-kernel-architecture/DISCUSSION.md:46`). Cost: not priced per round.

## Risks

| Risk | Likelihood | Impact | Coverage | Cost | Residual |
|---|---|---|---|---|---|
| An agent "fixes" a higher source to match a lower one | low | high | R-L0-03.2; decision blocks are immutable and validator-checked | none | wording outside decisions |
| Reports pile up unfixed | medium | medium | signals are grouped at batch planning (0051 item 2) | coordinator time | — |
| Same-rank conflicts flood the owner | low | medium | step 3 checks `Supersedes:` first | one grep | — |

## Change log

- 0.1 — 2026-09-24 — claude-eb97ac9d13050014 — first draft — reviewer DeepSeek S1-T11: FAIL (CA-25).
- 0.2 — 2026-09-24 — claude-eb97ac9d13050014 — R-L0-03.5 removed: no source stated it, and step 3 already covers same-rank decisions — review pending.
