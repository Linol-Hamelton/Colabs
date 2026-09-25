---
id: P-L0-001
version: 0.5
title: Procedure lifecycle - how a kernel procedure is created, changed and retired
layer: L0
type: procedure
status: draft
roles: [procedure-author, reviewer, coordinator]
stages: [any]
triggers: [signal:procedure-gap, signal:fall, signal:script-candidate, owner-directive, research-consensus, incident]
inputs: [signals, CATALOG, decisions-index, docs/core-arch/stage-1/procedure.schema.md]
outputs: [record-draft, review-report, CATALOG, journal]
tools: [TOOL-protocol-core, TOOL-protocol-index, TOOL-protocol-ledger]
back_edges: [5>2/1/owner, 7>4/2/owner, 9>4/1/retire, 11>1/1/owner]
enforcement: none
script_candidate: no:4
evidence_class: [B, C]
evidence: [docs/research/2026-09-24-remediation-mapping/PROCEDURE-MAP.md:131, docs/research/2026-09-24-remediation-mapping/PROCEDURE-MAP.md:144, docs/research/2026-09-23-kernel-architecture/DISCUSSION.md:46, docs/research/2026-09-23-kernel-architecture/DISCUSSION.md:85, PROTO-DEC-0050, PROTO-DEC-0051]
cost_basis: unknown
trial: metric=M-001; kill=two layers built under it with more LCC defects found in review than before it; until=CORE-ARCH package I
---

# P-L0-001 Procedure lifecycle

Draft 0.5 of CORE-ARCH stage 1, task S1-T02 (fix rounds: CA-03..CA-06, CA-08, CA-16; CA-S1; S1-T08 gap G4; PROTO-DEC-0060; CA-38). Not binding until approved (PROTO-DEC-0054 item 1).
`enforcement: none` means the procedure is decided in design but not yet built: its
mechanical parts become `protocol-core.cjs lint | catalog | check-links` (task S1-T10), which
will move it to `S~`. `script_candidate: no:4` because the core of the procedure - whether
evidence is sufficient and whether a change is right - is judgement (spec §1, "not
mechanizable").

## Purpose

Every rule in the kernel is created, changed and retired by this one procedure, so that
no rule enters without evidence, no rule has two homes, no loop is unbounded, and no rule
outlives its use. It prevents the failure class measured in this repository: rules written
ad hoc inside decision blocks and several documents, which produced seven multi-home rules,
five conflicts (K1-K5) and eight certification rounds spent on diverging restatements.

## Rules

- R-L0-17.1. A kernel record is created, changed or retired only through the steps below.
- R-L0-17.2. Every record carries an evidence class (A, B, C, D or E) and at least one
  evidence reference that is a decision id, a signal id or a `path:line`.
- R-L0-17.3. A record has exactly one home layer. Any other mention of its rule is a pointer
  (`see <id>`), never a restatement.
- R-L0-17.4. Every back edge of a record has a budget and an exit.
- R-L0-17.5. Class C and class D records pass a trial with a metric and a kill criterion
  before they become `active`.
- R-L0-17.6. The author of a record never reviews it, and no one marks a record `active`
  without the owner's approval.
- R-L0-17.7. A binding record cites the approved decision block that binds it; a record
  without one is advisory.
- R-L0-17.8. A retired record's text moves to the archive; its id stays reserved and a
  pointer stays in CATALOG.
- R-L0-17.9. A record that the root or another active record points to is retired or
  superseded only in the same candidate that makes its active successor and repoints every
  pointer. This procedure itself is replaced only by a successor that passed it.
- R-L0-17.10. Every change of a binding record, minor or major, carries an owner act before
  it becomes active.

## Steps

Actor slots are defined in L1: `author` (procedure-author), `reviewer`, `coordinator`, `owner`.

1. **Intake** (author). Record the trigger: signal id, owner directive, research reference,
   or incident `path:line`. Search CATALOG by id, title and triggers, and grep the kernel
   for the rule's key terms. Until CATALOG exists, grep the drafts under `docs/core-arch/stage-*/`,
   `AGENTS.md`, `.ai/docs/` and `docs/core-arch/stage-1/RULE-MAP.md` instead, and record the query. If a record already covers it, continue as a change (class D)
   to that record. Output: a journal line `Intake: <trigger> -> new | change <id>`.
2. **Classify and place** (author). Pick the evidence class or classes. Pick the one
   home layer with the layer test: L0 if it holds everywhere and for every role; L1 if it
   defines who may do what; L2 if it orders work; L3 if it describes a tool; L4 if it is
   measured experience with a tool; L5 if it defines an artifact; L6 if it measures; L7 if it
   governs prose documents; L8 if it widens access; L9 if it governs code. A rule that fits
   two layers is split into two rules, or it goes to the owner (back edge 5>2). Output: class,
   layer and the list of existing homes that will become pointers.
3. **Dossier** (author). For the class, collect what CORE-ARCH-2 §3 requires:
   - A: the event where the record caught or prevented a defect, and what it saved;
   - B: the incident, its cost in attempts, minutes or owner interventions, its root cause,
     why the record closes the class and not only the instance, and one golden regression case;
   - C: sources with agreement marks, at least two independent support marks and no
     reproduced objection, the expected gain, a metric, a kill criterion and a deadline;
   - D: the same as C plus the old version, the difference and why the old one is worse;
   - E: the finding of P-L0-006 that makes it a retirement candidate, and the result of its
     comparative test (P-L0-007); disuse alone never counts (PROTO-DEC-0060).
   Add the risk table in the PROTO-DEC-0049 item 4 form. Output: the `## Evidence` and
   `## Risks` sections.
4. **Draft** (author). Write the record to `SCHEMA-procedure`: front matter, then the
   required body sections. Run `protocol-core.cjs lint` when it exists; until then check the
   fields by hand against the schema table. Output: the draft file with `status: draft`.
5. **Place** (author). Replace every other home found in step 2 with a pointer, in the same
   candidate. Run the layer consistency check P-L0-004 for every layer the record touches or
   points to. Output: the LCC line in the journal.
6. **Script test** (author). Apply the four conditions of section 1 of
   `docs/specs/2026-09-23-executable-rulebook-spec.md`. If all four hold, open a
   `script-candidate` signal and a task under the script standard of PROTO-DEC-0047 item 8;
   the record says `enforcement: none` until the script is certified. If not, write the number
   of the first failing condition into `script_candidate`.
7. **Review** (reviewer, never the author). Adversarial review of the draft with the closed
   verdict vocabulary of PROTO-DEC-0041 item 3; each defect with a reproduction or a
   `path:line`. FAIL or BLOCKED returns to step 4 (back edge 7>4, at most two attempts per root
   cause). Output: a review report and the record at `status: review`.
8. **Approve** (owner). Approve, amend or reject. A binding record needs an approved decision
   block; its id goes into `decision` and `owner_approval`. Rejection sets `status: retired`
   with the reason in the change log.
9. **Trial** (coordinator), classes C and D only. Run the record in shadow or as a pilot for
   the period in `trial`, measuring its metric. The reviewer of step 7, or another participant
   who is not the author, recounts the metric from its source (by script once the metric is
   scripted, by hand until then) and records the result. Only a confirmed success lets step 10
   set `status: active`. On failure: one rework (back edge 9>4); a second failure retires it.
10. **Publish** (coordinator). Regenerate CATALOG, update pointers, add the file to the
    manifest when it lands in the kernel, set `status: active`, and record the version in
    the change log.
11. **Live and retire** (coordinator). At batch planning, run P-L0-006. A record it names as a
    candidate re-enters at step 1: an improvement as a change (class D), a retirement only after
    its comparative test (P-L0-007) and with class E evidence (back edge 11>1: once per record
    per batch; a second re-entry in the same batch goes to the owner). `last_applied` is kept for
    information and is never a reason to retire. Superseding a record sets the
    old one to `superseded` with `superseded_by`; retiring moves its text to the archive.

### Short path for minor versions

A clarification that changes no meaning (a minor version) runs steps 4, 7, 8 and 10. The
reviewer proposes the minor classification; the owner confirms it in step 8, which may cover
several minor changes in one list. If the reviewer or the owner calls a change major, the full
path applies. Wording that changes what any role must, may or must not do is always major.

## Stop conditions

Stop and go to P-L0-002 when:
- no layer passes the layer test, or two layers pass and the rule cannot be split;
- the record would contradict an accepted decision block (check `decisions-index` reverse map);
- the evidence required for the class does not exist and cannot be produced;
- the record would give any agent authority, lower a gate or skip a review;
- a back edge budget is exhausted.

## Back edges

- `5>2/1/owner`: placement in step 5 fails once, then the owner decides the layer.
- `7>4/2/owner`: review FAIL or BLOCKED returns to drafting at most twice per root cause
  (PROTO-DEC-0046 item 4); then the case goes to the owner or an audit (CORE-ARCH-4 §6).
- `9>4/1/retire`: a failed trial gets one rework through drafting; a second failure retires the record.
- `11>1/1/owner`: the re-entry of a P-L0-006 candidate from step 11 to step 1 runs once per record per batch; a
  second re-entry in the same batch goes to the owner.

## Evidence

- B - multi-home rules and conflicts: seven rules with several homes, K1-K5
  (`docs/research/2026-09-24-remediation-mapping/PROCEDURE-MAP.md:131`, `:144`); eight rounds
  spent on diverging restatements (`docs/research/2026-09-23-kernel-architecture/DISCUSSION.md:46`
). Cost: unknown in attempts; the rounds are not individually priced.
- B - failures handled as workarounds: PROTO-DEC-0050 records that each break was a missing
  procedure; PROTO-DEC-0051 records that failure classes were noticed only after they cost a round.
- C - owner directive of 2026-09-24 (PROTO-DEC-0054) and the kernel discussion (M section 5:
  "общий принцип построения любой процедуры" in the meta-root). Trial: M-001 below.

M-001 (counted by hand until L6 defines it at stage 5): LCC defects caught by the author before review, against
LCC-class defects found by the reviewer, per layer.

## Risks

| Risk | Likelihood | Impact | Coverage | Cost | Residual |
|---|---|---|---|---|---|
| Ceremony for small changes | medium | medium | minor-version short path | one reviewer call | the minor/major line is judged |
| Evidence invented to pass step 3 | medium | high | references must resolve; reviewer opens each; Layer C `cover` on the dossier | reviewer time | a real reference that does not show what is claimed |
| Kernel keeps growing | high | high | P-L0-006 findings (two homes, obsolete subject, cost); root size cap; the A/B/C test at program end | one pass per batch | the owner can keep a rule alive |
| Author self-approves | low | high | R-L0-17.6; `owner_approval` required for `active`; lint rejects `active` without it | none | a forged decision id, caught by `check-links` against DECISIONS |
| Deadlock on placement | low | medium | back edge 5>2 to the owner | one owner question | — |

## Change log

- 0.1 — 2026-09-24 — claude-eb97ac9d13050014 — reviewer DeepSeek: FAIL (CA-03..CA-06, CA-08, CA-16) — no decision.
- 0.2 — 2026-09-24 — claude-eb97ac9d13050014 — owner act on the minor path; active-successor rule; budgeted re-entry; independent trial recount; ids from schema 2.1; citations on content lines — reviewer DeepSeek r2: verified.
- 0.3 — 2026-09-24 — claude-eb97ac9d13050014 — back edges name their source step (schema 0.3, CA-S1) — reviewer DeepSeek r3: verified.
- 0.4 — 2026-09-24 — claude-eb97ac9d13050014 — step 1 search fallback until CATALOG exists (S1-T08 gap G4) — reviewer DeepSeek: RECOMMENDATION.
- 0.5 — 2026-09-24 — claude-eb97ac9d13050014 — retirement by disuse removed; step 11 runs P-L0-006, retirement needs P-L0-007 (PROTO-DEC-0060) — review pending (stage-1 re-check).
