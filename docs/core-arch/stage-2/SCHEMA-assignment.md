---
id: SCHEMA-assignment
version: 0.2
title: Grammar of role assignments and delegations in a task frame
layer: L1
type: schema
status: draft
evidence_class: [B, D]
evidence: [PROTO-DEC-0048, PROTO-DEC-0049, PROTO-DEC-0056, PROTO-DEC-0057, PROTO-DEC-0062, PROTO-DEC-0063, AGENTS.md:69]
cost_basis: unknown
---

# Role-assignment grammar (draft 0.1, CORE-ARCH stage 2, S2-T04, S2-T05)

Not binding until approved. Replaces the free role text of `AGENTS.md:69-71` (class D, E there) and
the brand-per-line practice of DEC-0020, which PROTO-DEC-0054 item 3 already suspended for this
program. Read by the independence check (P-L1-002) in package I-b. Every line outside the grammar
exits 2 (PROTO-DEC-0049 item 2).

## 1. Participant (S2-T05)

The participant is the model, named by its maker's id as the model matrix records it
(`docs/core-arch/stage-4/MODEL-MATRIX.md`; R-L1-002.1). A client alias resolves to that id: the
matrix records, for example, that copilot reaches `claude-opus-5-5` as `claude-opus-5`. A fresh
session, another client or another effort level of the same model is the same participant, so a
new session inherits every role its model held in the candidate's lineage (R-L1-002.2). This
replaces the family-and-lineage identity proposed in CORE-ARCH-3 section 2, which the owner's rule
"one model, one role" made unnecessary (PROTO-DEC-0056 item 2, 0063 item 2).

## 2. Grammar

```
roles_section ::= "## Roles" LF { line LF }
line          ::= assignment | delegation | blank
assignment    ::= "- " model " @ " scope_id ": " slot
delegation    ::= "- delegation @ " scope_id ": " model " until " date " by " block_id
model         ::= a model id present in the model matrix
scope_id      ::= kind ":" name
kind          ::= "program" | "task" | "candidate"
name          ::= [a-z0-9][a-z0-9-]{2,63}         for "candidate", the 40-hex SHA
slot          ::= coordinator | implementer | reviewer | certifier | shadow-certifier
                | auditor | researcher | synthesiser | drafter | critic | fixer | procedure-author
date          ::= YYYY-MM-DD
block_id      ::= "PROTO-DEC-" 4 digits | "DEC-" 4 digits
```

- One slot per line, no trailing text, no negation, no comment.
- `owner` is not a slot of an assignment line: the owner is the human who writes the lines or
  delegates them (R-L0-04, R-L1-owner.2). A line that names `owner` as its slot exits 2.
- A task frame names its parent with `parent-scope: <scope_id>`, or `-` for none. Lines of the
  parent scope are inherited defaults: a model that the frame's own lines do not name holds its
  parent-scope role in the frame; a model that the frame's own lines name holds only those lines.
  The one-role rule (R-L2-002.2) is checked on these effective lines of one frame (PROTO-DEC-0057
  item 3). Independence across frames is judged by the lineage (R-L1-002.2) and the bars of
  R-L0-05, R-L1-certifier.1 and R-L1-fixer.2, never by the merge.
- The dispatcher is a script and never appears in a role line.
- Conditions that are not roles (dates, pilots, priorities, history) go under `## Role notes`,
  which no script reads.

## 3. Reading rules

1. Fenced blocks are removed first, by CommonMark rules: a fence closes only on the same character
   (backtick or tilde) repeated at least as many times as it opened; an unclosed fence runs to the
   end of the file.
2. Outside fences, exactly one heading `## Roles` must exist. Any other heading that begins with
   `## Roles` (for example `## Roles archive`) exits 2, so no decoy section can shadow the real one.
3. The section ends at the next `## ` heading. Each line in it must match the grammar.
4. Effective lines: the frame's own lines, plus each parent-scope line whose model the frame's own
   lines do not name (section 2). The parent scope's own lines are checked as a frame of their own.

Exit codes: 0 every line parses and no rule is broken; 1 a well-formed set breaks an independence
rule (P-L1-002); 2 anything the grammar or the reading rules do not accept.

## 4. Fixtures (the four round-3 findings, closed by construction)

M below is `claude-opus-5-5`; the check asks whether M may certify a candidate of `task:x`.

| # | Input | Exit | Closes |
|---|---|---|---|
| F1 | `- reviewer: not reviewer, controller` | 2 (no `@`, a negation, two tokens) | R3-C01 |
| F2 | a fenced `## Roles` with `- M @ task:x: certifier`, then the real `## Roles` with `- M @ task:x: implementer` | 1 (the real line is read, the fenced one is not) | R3-C02 |
| F3 | `## Roles archive` anywhere outside a fence | 2 | R3-C02 |
| F4 | the real line of F2 inside a four-tilde fence that contains two triple-backtick lines, and no other `## Roles` | 2 (no Roles section outside fences) | R3-C03 |
| F5 | `- M @ task:x: authored` | 2 (`authored` is not a slot) | F-R3-02 |
| F6 | `- M @ task:x: implementer` and `- claude-opus-5 @ task:x: reviewer` | 1 (one participant after the alias resolves, two roles) | R-L1-002.1 |
| F7 | `- deepseek-flash @ program:core-arch: reviewer` and `- deepseek-flash @ task:s2-review: critic`, the task's parent being `program:core-arch` | 0 (the task's own line replaces the inherited one: one role in the frame; the lineage check still applies) | PROTO-DEC-0057 item 3 |
| F8 | `- unknown-model @ task:x: reviewer` | 2 | P-L1-002 stop |
| F9 | `- M @ task:x: owner` | 2 (`owner` is not an assignable slot) | R-L0-04 (CB-02) |
| F10 | `- delegation @ task:x: M until 2026-10-31`, or the same line `by` a block that does not name M | 2 (no owner record the line can be checked against) | section 5 (CB-03) |

The journal side of R3-C03 (a producer identity inside a fence) is closed by the same fence rule
applied to journals: the producer is read only from the entry's `Launch:` line outside fences
(R-L2-002.5); none found exits 2.

## 5. Delegation (PROTO-DEC-0062 item 3)

`- delegation @ program:core-arch: claude-opus-5-5 until 2026-10-31 by <block_id>` lets that model,
as coordinator, write assignment lines in that scope until that date. Only the owner writes
delegation lines. The text of a line cannot show who wrote it, so the line names the decision block
in which the owner recorded the delegation (to whom, which frames, until when: PROTO-DEC-0062
item 3). The line is accepted only if that block exists in `.ai/DECISIONS.md` outside fences,
carries `Approved by:` and contains the line's model id, scope-id and date; otherwise exit 2. The
`by` field is this draft's proposal for the recorded form that PROTO-DEC-0062 item 3 leaves open.
A delegated coordinator writes assignment lines only, never delegation lines and never a
`coordinator` line (the delegation already names the coordinator; R-L1-coordinator.1), and records
each one in its journal.

## 6. Proposed migration of the current `.ai/TASK.md` Roles (owner question В-12)

The current section names brands. Under this grammar and the model matrix it would read:

```
## Roles

- claude-opus-5-5 @ program:core-arch: implementer
- deepseek-flash @ program:core-arch: reviewer

## Role notes

- Certifiers of packages I-III: one OpenAI and one Google model (PROTO-DEC-0055 item 3), written
  at each package freeze as `- <model> @ candidate:<sha>: certifier`, the model chosen then
  through P-L2-002 (T7 floor for certification, PROTO-DEC-0059 item 2).
- The Google critique of CORE-ARCH-1 (PROTO-DEC-0053 step c, 0055 item 2) has not run yet; it
  is written at task scope when dispatched.
- Product-pilot roles (Block-Puzzle, VPN) are on hold under PROTO-DEC-0048 item 1.
```

Why the certifiers are not program-scope lines: a program-scope line is the default role of its
model in every task of the program that does not name that model (section 2), so a certifier line
there would make the model a certifier by default in tasks where it certifies nothing. A
program-scope line is for a role held throughout the program; a role that changes from task to
task is written at task or candidate scope, and the lineage check of P-L1-002 still catches a
certifier that touched the candidate elsewhere.

The migration waits for the owner's confirmation and for package I-b, because the current hook
reads only `- name: role` lines (`.ai/bin/protocol-hooks.cjs:300`).

## Change log

- 0.1 — 2026-09-25 — claude-eb97ac9d13050014 — first draft (stage 2, S2-T04, S2-T05) — review pending.
- 0.2 — 2026-09-25 — claude-ad7cc4169e888ea8 — review fixes: CB-01 (parent lines are inherited defaults; one role per frame), CB-02 (`owner` not assignable; F9), CB-03 (delegation names its owner record; F10) — second pass pending.
