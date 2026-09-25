---
id: S-003
version: 0.2
title: Research cycle - zones, challenges, independent syntheses, draft, critiques, final plan
layer: L2
type: scenario
status: draft
roles: [researcher, synthesiser, drafter, critic, fixer, coordinator]
stages: [research]
triggers: [owner-directive]
inputs: [task-frame, journal]
outputs: [review-report, journal]
back_edges: []
enforcement: P
script_candidate: no:4
evidence_class: [D]
evidence: [PROTO-DEC-0052, PROTO-DEC-0053, PROTO-DEC-0055, docs/research/2026-09-24-remediation-mapping/PROCEDURE-MAP.md:144, docs/reviews/2026-09-24-core-arch-stage1-findings.md:20, docs/reviews/2026-09-24-core-arch-stage1-findings.md:30]
supersedes: [legacy:.ai/docs/PAIRED-CYCLE.md:160]
trial: metric=M-003; kill=the next research cycle reaches owner adoption with more rounds or more owner clarifications than this one; until=next research cycle
---

# S-003 Research cycle

Trial record of CORE-ARCH stage 1, task S1-T08, written through P-L0-001 (class D). Draft 0.2;
lands in stage 3. Not binding until approved. It is a scenario: roles are slots, not names.

## Purpose

Research and design work consumed most of the week before this program and had no kernel
procedure. The old rule, one synthesis per round, let one synthesiser's blind spots pass into
the plan. This scenario runs independent syntheses and two independent critiques before a plan
is fixed, and leaves adoption to the owner.

## Rules

- R-L2-S003.1. Round 1 has exactly one researcher per zone.
- R-L2-S003.2. In round 2 no participant challenges its own zone; the round closes with one synthesis.
- R-L2-S003.3. Round-3 synthesisers do not read each other's syntheses before writing their own, and
  say so in their journals.
- R-L2-S003.4. A draft decision (b) is followed by two critiques (c) written independently of each
  other in the fixed agreement form (P-L7-002), then a final plan (d) that answers every point.
- R-L2-S003.5. Nothing in the cycle is a decision; the owner adopts, amends or rejects the plan.
- R-L2-S003.6. A missing report is pending, never agreement.

## Steps

1. **Frame** (coordinator). The owner's question, the zones, the participants per slot, the caps.
2. **Round 1** (researcher). One report per zone.
3. **Round 2** (researcher, synthesiser). Cross-challenges; one synthesis of the round.
4. **Round 3** (synthesiser ×3). Independent syntheses.
5. **Draft** (drafter). Agreement, divergence and resolution of each point.
6. **Critique** (critic ×2). Independent critiques in the agreement form.
7. **Final plan** (fixer). Accepts, rejects with reason, or leaves to the owner each critique point,
   and marks which accepted points came from which critic.
8. **Adopt** (owner). Approve, amend or reject; only an approved block binds.

## Stage graph

```
frame → round 1 → round 2 (+ synthesis) → round 3 (3 × independent) → (b) draft
      → (c) critique A ∥ critique B → (d) final plan → owner
```

## Handoff artifacts

| From | To | Artifact |
|---|---|---|
| frame | round 1 | brief with zones and slots |
| round 3 | draft | three synthesis files with independence lines in the journals |
| draft | critique | the draft file |
| critique | final plan | two critique files |
| final plan | owner | the plan with its per-point answers |

## Stop conditions

- A slot has no independent participant (P-L0-002).
- A round-3 synthesiser read another synthesis before writing: its synthesis is advisory only.

## Back edges

None; the scenario runs forward. Rejection by the owner ends it.

## Evidence

- D - old version: `.ai/docs/PAIRED-CYCLE.md:160`, one synthesis and one disposition table per
  round, which conflicts with the owner's structure (K1, `docs/research/2026-09-24-remediation-mapping/PROCEDURE-MAP.md:144`); replaced for
  research cycles by PROTO-DEC-0052 and closed by PROTO-DEC-0053, critic identities by 0055 item 2.
- Why the old one is worse: in this program the critique step found defects the draft's author
  missed: wrong matrix marks and an inconsistent consolidation rule (CA-09, CA-10, CA-11) and seven
  omitted hypotheses (CA-19), rows 20-22 and 30 of `docs/reviews/2026-09-24-core-arch-stage1-findings.md`.
- Step 7's source marking comes from CA-13 (critic independence versus certifier slots).

## Risks

| Risk | Likelihood | Impact | Coverage | Cost | Residual |
|---|---|---|---|---|---|
| Independence claimed but not kept | medium | medium | journal line; `protocol-ledger.cjs dup` on reports | one run | reading cannot be observed |
| Rounds multiply | medium | high | at most three rounds (R-L2-S003.1..4) | — | — |
| A critic later certifies what its critique shaped | medium | medium | step 7 marks the source of each accepted point | — | owner judgement (CA-13) |

## Change log

- 0.1 — 2026-09-24 — claude-eb97ac9d13050014 — trial record through P-L0-001 (S1-T08); first draft failed the hand lint (a path in `supersedes`), fixed after schema 0.4 added `legacy:` — reviewer DeepSeek S1-T11: held.
- 0.2 — 2026-09-24 — claude-eb97ac9d13050014 — rule ids re-anchored to the record (schema 0.5, CA-24 class); no meaning changed — review pending.
