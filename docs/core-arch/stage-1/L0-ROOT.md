---
id: P-L0-000
version: 0.5
title: Kernel root - why the kernel exists, its invariants, and how everything else is found
layer: L0
type: invariant
status: draft
roles: [all]
stages: [any]
triggers: [session-start]
enforcement: S~
enforced_by: [validate-protocol.ps1, .ai/bin/protocol-handoff.cjs, .ai/bin/protocol-lock.cjs]
script_candidate: no:4
evidence_class: [A, B]
evidence: [PROTO-DEC-0041, PROTO-DEC-0044, PROTO-DEC-0045, PROTO-DEC-0047, PROTO-DEC-0050, PROTO-DEC-0054, PROTO-DEC-0060, PROTO-DEC-0082, PROTO-DEC-0083]
cost_basis: unknown
---

# Kernel root (L0)

## Purpose

Draft 0.4, CORE-ARCH stage 1. Not binding until approved. Always loaded; everything else is
loaded by your role and stage. Each rule says why it exists; the full evidence is in
CORE-ARCH-2 §4 and in the Evidence section below. Scripts enforce the parts they can
(`enforced_by`); the rest is judgement, so `script_candidate` is `no:4`.

## Rules

### Why this kernel exists

R-L0-01. Several AI assistants work in one repository and share no memory; the filesystem
is the only channel. The kernel makes their work verifiable and keeps authority with the
human owner. The scarce resource is review rounds and owner attention, not tokens; every
rule is judged by whether it saves them.

### How the kernel is built

R-L0-02. Ten layers, loaded from this root down to the leaf you work on:
L0 root and rule-making - L1 roles - L2 procedures and scenarios - L3 tools - L4 measured
tool experience - L5 state and artifacts - L6 metrics - L7 prose documents - L8 access
expansion - L9 code. Load in full what names your role and your stage; read the CATALOG
summary of the rest. Why: one agent loaded ~62k tokens of which its task needed little.

### Invariants

R-L0-03. Sources rank: approved decisions > the working tree and git > the task > the plan
> journals > the archive. When two disagree, the lower one is stale: fix it or report it.

R-L0-08. Chat is not memory; what is not in the repository did not happen.

R-L0-04. Only the owner decides. An approval given in conversation is recorded by the lock
holder with its provenance. A call, a prompt or a role transfers no authority; no agent has
authority over another. Any participant may challenge any other; the disagreement is
recorded in the task's open questions and never silently overwritten. Why: authority that
can be written into a prompt can be forged, and a silenced objection is a lost reproduction.

R-L0-05. No one certifies what they authored, executed or controlled. High-risk work needs
two parallel independent certifiers. Why: the second reviewer found what the first missed
three times in one batch.

R-L0-06. A reproduction outweighs any vote, rank or majority. Label claims FACT, CLAIM or
HYPOTHESIS; "measured" only with the measurement. Why: a council once voted down a real
defect, and unmeasured MEASURED labels cost rounds.

R-L0-07. Never: write another session's journal; write a secret anywhere; edit a written
decision block; approve your own proposal; delete history instead of archiving it; release
a lock you did not take without confirming its holder is gone; commit or push without the
owner; report work as verified when you did not run the check.

### How to act

R-L0-09. The files your role and stage name are the minimum you read, never the ceiling.
Reading is never forbidden. An anomaly you notice outside your set must be reported.
Why: a rule that forbids reading makes agents walk around problems.

R-L0-10. If no rule covers your next action, sources conflict, a tool is blocked, a budget
is exhausted, or the premise is wrong: stop and ask (P-L0-002). Never invent a rule or
widen a permission.

R-L0-11. Every loop has a budget: two attempts per root cause, three certification rounds
per batch, three wakes per stalled session. An exhausted budget goes to the owner or to an
audit, never to one more try. Why: rounds kept finding new causes while none hit its limit.

R-L0-16. Check any source list against the repository inventory before trusting it; a
list inherited from a prompt is not verified. Why: seven rounds ran on a concept whose
primary source nobody opened.

### How the kernel changes

R-L0-12. Each rule has one home. Everywhere else it is a pointer. Why: diverging
restatements cost eight certification rounds.

R-L0-13. A failure is closed by changing the procedure it belongs to; a workaround only
finishes the work in hand. Record every failure as a signal.

R-L0-14. Risks are sought to cover them, not to refuse. Reject a solution only when its
risks cannot be covered at an acceptable cost.

R-L0-15. A check whose inputs are repository state, whose output is reproducible and whose
rule is already recorded becomes a script; judgement stays with models and the owner.

R-L0-17. Every kernel record is created, changed and retired through P-L0-001, with
evidence of its class: proven useful (A), harm when absent (B), predicted gain of a new rule
(C) or of a change (D), retirement (E).

R-L0-18. An accepted decision changes only through a new approved block; reopening one
needs a recorded trigger of a defined kind (P-L0-005).

R-L0-19. No layer lands, and no next layer starts, without a recorded consistency check of
the layers built so far (P-L0-004). Why: the owner directed it (PROTO-DEC-0054 item 4).

R-L0-20. A record is improved or retired only on a recorded finding (P-L0-006); disuse is never
a reason, because a layered kernel expects records to wait for their trigger.

R-L0-21. A retirement, and the kernel as a whole, are judged by a comparative test of variants on
the same tasks with one model (P-L0-007), not by opinion.

R-L0-22. Research converges: every frame ends in ACCEPT, REJECT, EXPERIMENT or DEFER within bounded
rounds and per-stream limits, and new research is never a frame's output (P-L0-008). Why: research
frames multiplied faster than decisions were built (PROTO-DEC-0082, 0083).

## Where to go next

Your role: L1 `ROLE-<slot>`. Your stage: L2. Missing rule: P-L0-002. New or changed record:
P-L0-001. Conflicting sources: P-L0-003. Layer consistency: P-L0-004. Decisions and
reopening: P-L0-005. Candidates to improve or retire: P-L0-006. Comparative tests: P-L0-007.
Research frames: P-L0-008.
All are drafts until stage 1 is approved.

## Evidence

- R-L0-01: PROTO-DEC-0045 item 6. R-L0-02: kernel discussion section 2 (62k tokens).
- R-L0-04: PROTO-DEC-0030, 0043 item 2; `AGENTS.md:50-51`. R-L0-05: PROTO-DEC-0041 items 1-2,
  0047 item 3. R-L0-06: PROTO-DEC-0041 item 5, `.ai/docs/PAIRED-CYCLE.md:153`, PROTO-DEC-0051.
- R-L0-07: `AGENTS.md:459-467`. R-L0-10: P-L0-002. R-L0-11: PROTO-DEC-0046 item 4, 0047
  item 5, 0051 item 4. R-L0-16: PROTO-DEC-0044. R-L0-12: kernel discussion section 3.
- R-L0-13: PROTO-DEC-0050, 0051. R-L0-14: PROTO-DEC-0049 item 4. R-L0-15: spec section 1,
  PROTO-DEC-0047 item 8. R-L0-17: P-L0-001. R-L0-18: `AGENTS.md:311-321`, PROTO-DEC-0033.
  R-L0-19: PROTO-DEC-0054 item 4. R-L0-20, R-L0-21: PROTO-DEC-0060 item 2.
  R-L0-22: PROTO-DEC-0082, 0083.

## Change log

- 0.1 — 2026-09-24 — claude-eb97ac9d13050014 — reviewer DeepSeek: FAIL (CA-01, root section of CA-15) — no decision.
- 0.2 — 2026-09-24 — claude-eb97ac9d13050014 — passes the invariant key set and headings; verified-without-check ban, challenge rule, R-L0-18 reopening; pending ids marked — reviewer DeepSeek r2: verified.
- 0.3 — 2026-09-24 — claude-eb97ac9d13050014 — R-L0-19 anchors P-L0-004 (CA-24); P-L0-003..005 no longer pending — reviewer DeepSeek: RECOMMENDATION.
- 0.4 — 2026-09-24 — claude-eb97ac9d13050014 — class E no longer means disuse; R-L0-20 and R-L0-21 anchor P-L0-006 and P-L0-007 (PROTO-DEC-0060) — review pending (stage-1 re-check).
- 0.5 — 2026-09-26 — kilo-f22faac486b5e567 (transcription; text by claude-b00262b88c55444b) — R-L0-22 anchors P-L0-008 (PROTO-DEC-0083) — reviewer Mistral Medium 3.5 (`docs/reviews/2026-09-26-mistral-p-l0-008-0.2-review.md`): RECOMMENDATION.
