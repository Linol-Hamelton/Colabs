---
id: P-L0-005
version: 0.1
title: Record, supersede and reopen decisions
layer: L0
type: procedure
status: draft
roles: [all]
stages: [any]
triggers: [owner-directive, owner-approval, reopen-trigger]
inputs: [decisions-index, docs/decisions/REGISTRY.md, .ai/DECISIONS.md]
outputs: [.ai/DECISIONS.md, docs/decisions/REGISTRY.md, decisions-index, journal]
back_edges: []
enforcement: S~
enforced_by: [validate-protocol.ps1, .ai/bin/protocol-lock.cjs, .ai/bin/protocol-index.cjs]
script_candidate: no:4
evidence_class: [A, B]
evidence: [AGENTS.md:39, AGENTS.md:306, AGENTS.md:311, PROTO-DEC-0030, PROTO-DEC-0033, PROTO-DEC-0048, docs/research/2026-09-24-remediation-mapping/PROCEDURE-MAP.md:148]
cost_basis: unknown
---

# P-L0-005 Record, supersede and reopen decisions

Draft 0.1 of CORE-ARCH stage 1, task S1-T09. Not binding until approved (PROTO-DEC-0054 item 1).

## Purpose

The decision log is the one source safe to trust because nothing in it is ever rewritten.
This procedure keeps it that way: how an owner decision is written down, how it is replaced,
and what it takes to reopen one. It gathers rules now spread over `AGENTS.md` sections 2 and 6
and PROTO-DEC-0030 and 0033 into one home (RULE-MAP AR-008..AR-010, AR-044..AR-046).

## Rules

- R-L0-18.1. A decision exists only as an approved block in `.ai/DECISIONS.md` with an
  `Approved by:` line naming a human; the line is a record, not proof.
- R-L0-18.2. An agent writes `Approved by:` only after a direct owner confirmation, with its
  provenance, and only while holding the lock (PROTO-DEC-0030).
- R-L0-18.3. Proposals live in PLAN or in program documents; `Status: Proposed` never appears
  in a new block.
- R-L0-18.4. A written block is never edited, not even its status. A decision changes only by a
  new approved block with a `Supersedes:` line, plus a REGISTRY row.
- R-L0-18.5. Reopening an accepted decision needs a REGISTRY trigger row of one kind, with its
  proof: `invariant-broken` (a regression proof), `metric-drop` (a measured drop against a
  baseline), `new-external-data` (reproducible external evidence or a contract change),
  `security-finding` (a reproducible proof of concept or an audit reference), `owner-directive`
  (an explicit, dated owner confirmation), `higher-source-contradiction` (the conflicting path in
  a higher source). Without a trigger row, doubt stays a note.
- R-L0-18.6. When the transcriber reads more into the owner's words than they say, the block
  says so in its provenance, or the owner confirms first.

## Steps

1. **Classify** (any role). New decision, supersession, or reopening? For a reopening, name the
   trigger kind and its proof; without one, write a note in the task or the journal and stop.
2. **Find the blocks** (any role). Use `decisions-index` to list every block the change touches.
3. **Draft** (any role). Write the block text in a proposal document, never in DECISIONS.
4. **Confirm** (owner). The owner approves, amends or rejects. Words the transcriber had to
   interpret are shown to the owner before writing (R-L0-18.6).
5. **Write** (lock holder). Acquire the lock; append the block (Status, Date, Reopen-trigger,
   optional Supersedes, Context, Decision, Reasoning, Alternatives rejected, Consequences,
   Approved by with provenance); append the REGISTRY row; release the lock.
6. **Derive** (lock holder). Regenerate `decisions-index`; run the validator, which checks that
   committed blocks are unchanged.
7. **Journal** (lock holder). One entry naming the block and the owner's words it transcribes.

## Stop conditions

- The owner has not confirmed: nothing is written to DECISIONS.
- A reopening has no trigger of a listed kind, or its proof is missing.
- The lock is held by another live session.

## Back edges

None. A rejected draft ends the procedure; a new attempt is a new intake.

## Evidence

- A - the append-only log is trusted because it is never rewritten (`AGENTS.md:306`); the
  validator's immutability check held for 46 committed blocks in this session.
- B - DEC-0014 carries `Status: Proposed` inside DECISIONS (K2; `docs/research/2026-09-24-remediation-mapping/PROCEDURE-MAP.md:148`).
- B - R3-C05: a blank line added inside a committed block passed the validator and was accepted
  as an exception after two attempts (PROTO-DEC-0048 item 4).
- B - CA-12 of this program: PROTO-DEC-0055 item 2 reads more into an owner answer than it quotes
  (`docs/reviews/2026-09-24-core-arch-stage1-findings.md`, row CA-12). R-L0-18.6 closes that class.

## Risks

| Risk | Likelihood | Impact | Coverage | Cost | Residual |
|---|---|---|---|---|---|
| Transcription over-reads the owner | medium | high | R-L0-18.6; the reviewer checks provenance against quotes | one owner glance | the owner confirms without reading |
| A block edited after writing | low | high | validator immutability check on committed blocks | — | uncommitted blocks until the next commit; R3-C05 byte class |
| Reopening by argument, not trigger | medium | medium | R-L0-18.5; REGISTRY row required | — | — |

## Change log

- 0.1 — 2026-09-24 — claude-eb97ac9d13050014 — first draft — review pending (S1-T11).
