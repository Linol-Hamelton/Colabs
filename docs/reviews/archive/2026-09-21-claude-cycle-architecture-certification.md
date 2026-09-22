# Claude - Cycle architecture fixation: independent certification

**Date**: 2026-09-21
**Reviewed commit**: d38d2f2ae4b4c17fe6c2c18f11215cedb2f10eb1
**Working tree**: dirty
**Reviewer**: Claude (Opus 5), session claude-a0c740d2132e43eb
**Scope**: literal conformance of documentation and templates to PROTO-DEC-0041 and the `.ai/PLAN.md` cycle architecture policy (B1-B8)
**scope-check**: FAIL
**Verdict**: FAIL
**Mode**: CERTIFYING
**Receipt-Owner**: claude-a0c740d2132e43eb

---

## Executive Summary

B1, B3, B5 and B7 conform to their governing texts; the seven phases, the objective
blocking rule, the block definition, the symmetry of evidence and all ten anti-idle
rules are present and faithful. Certification fails on four mandatory items: the
"fifth voice" clause restates PROTO-DEC-0041 item 2 with a different subject and a
different trigger set; the completion-gate documentation and `AGENTS.md` never carry
the two-reviewer rule, so a reader conforming to them closes a high-risk task with one
reviewer; `PROTOCOL.md` adds a self-authorizing exception to the forbidden-path check
that the PLAN policy does not contain; and the acceptance state is not met at this
verification version (1 validator warning, no reserved corpus capacity for the two
mandated certifier reports, unsatisfiable baseline scope-check).

**Independence (PROTO-DEC-0041 item 2)**: this session read the input package
(PROTO-DEC-0041, the PLAN policy, the dispatch, the unified prompt, the candidate
documents, the tree) and deliberately did not open the parallel certifier's or the
controller's review artifacts before recording these findings.

## Scope and Evidence

- **Commands executed**: `powershell -ExecutionPolicy Bypass -File .\validate-protocol.ps1`
  (exit 0, **1 warning**); `git diff --name-only d38d2f2...`; `git status --short --branch`;
  corpus and journal measurement by `find`/`ls`; text comparison by `grep -n`.
- **Not executed**: `test-protocol.ps1` (not required by this angle; the suite is the
  parallel certifier's mandate and the implementer's receipt).
- **Environment**: Windows 11 26200, Node v22.21.0, Windows PowerShell 5.1.

### Per-block literal conformance

| Block | Subject | Result |
|---|---|---|
| B1 | terms, seven phases, one primary pass, 12-stage mapping | PASS (F-009 LOW) |
| B2 | composition, independence, parallelism | **FAIL** (F-001, F-003) |
| B3 | severity rubric and objective blocking rule | PASS (F-008 LOW) |
| B4 | closed verdict vocabulary, forward only | PASS |
| B5 | blocks, findings ledger, symmetry of evidence | PASS |
| B6 | access tiers, BARC, legitimization | **FAIL** (F-004) |
| B7 | ten anti-idle rules | PASS |
| B8 | governance reconciliation, budgets | **FAIL** (F-005, F-002) |

`scope-check: FAIL` - see F-002: the prescribed method cannot separate this cycle's
diff from the PROTO-DEC-0040 remediation sharing the same baseline and dirty tree.

## Findings Ledger (PROTO-DEC-0041)

| ID | Requirement | Reproduction | Actual | Severity | Disposition |
|---|---|---|---|---|---|
| F-001 | PROTO-DEC-0041 item 2, third-reviewer clause | `sed -n '1793p' .ai/DECISIONS.md`; `sed -n '280p' .ai/docs/PROTOCOL.md`; `sed -n '23p' .ai/docs/PAIRED-CYCLE.md` | subject and one trigger both changed | MEDIUM | confirmed |
| F-002 | dispatch criterion 4; PLAN legitimization `diff subset of scope` | `git diff --name-only d38d2f2 -- validate-protocol.ps1 .ai/bin/` | non-empty: 2 forbidden paths | MEDIUM | confirmed |
| F-003 | PROTO-DEC-0041 item 2 reaches the gate contract | `grep -c 0041 AGENTS.md` -> 0; PAIRED-CYCLE 304-316; PROTOCOL 291-296 | one reviewer satisfies documented gate | MEDIUM | confirmed |
| F-004 | PLAN policy: `no forbidden path touched` | `sed -n '113p' .ai/docs/PROTOCOL.md` | escape clause added | MEDIUM | confirmed |
| F-005 | dispatch criteria 2 and 6; anti-idle rule 4 | validator run; `find docs/reviews -maxdepth 1 -type f` | 1 WARN, 36 journals, 6,005 B headroom | MEDIUM | confirmed |
| F-006 | PROTO-DEC-0041 item 6, reversibility | `grep -n "PLAN policy" .ai/docs/PROTOCOL.md` | exported as settled doctrine | LOW | confirmed |
| F-007 | PROTO-DEC-0041 Kaesberg statement | `sed -n '277p;381p' .ai/docs/PROTOCOL.md` | two different claims, one unverified | LOW | confirmed |
| F-008 | item 4: rubric does not decide blocking | PAIRED-CYCLE 115-122; REVIEW.md 61-67 | `Blocks?` column decides blocking | LOW | confirmed |
| F-009 | PLAN policy: exactly four repeat triggers | PAIRED-CYCLE 41-50, row 2 | fifth trigger introduced | LOW | confirmed |

### F-001 - MEDIUM - "Fifth voice" restates a binding rule

PROTO-DEC-0041 item 2: "A **third reviewer** is added only for **an uncovered risk**,
contradicting reproductions, or an explicit owner directive."
`PROTOCOL.md:280` and `PAIRED-CYCLE.md:23`: "A **fifth participant** is consulted only
upon unresolved conflicting reproductions, **missing operational capability across all
assigned assistants**, or an explicit owner directive."

Two divergences, in opposite directions. Counting participants rather than reviewers
moves the threshold: in a low-risk task (implementer + 1 reviewer) a third and fourth
reviewer are unrestricted by the documented rule but restricted by the decision. The
decision's trigger "an uncovered risk" is dropped, and "missing capability" - not one
of the decision's three triggers - is added. The dispatch B2 carries the same
paraphrase, so the fix belongs in both texts; per dispatch B8 a divergence from
PROTO-DEC-0041 is a documentation defect, never a reason to amend the block.

### F-002 - MEDIUM - Baseline scope-check is unsatisfiable

Dispatch acceptance criterion 4 requires `git diff --name-only <baseline> --
validate-protocol.ps1 .ai/bin/` to be empty. It returns `.ai/bin/protocol-handoff.cjs`
and `validate-protocol.ps1`. The full baseline diff also carries `tests/**`,
`setup-ai-protocol.ps1`, `protocol-manifest.json`, `QUICKSTART.md` and `Modelfile`.
These are attributable to the PROTO-DEC-0040 remediation, which is authorized, but the
attribution rests on session reports: no commit separates the two work packages, so the
manual duty that `PROTOCOL.md` itself prescribes (run the baseline diff, compare against
block scope, record `scope-check`) cannot return PASS for this candidate by its own
method. Scope adherence here is self-reported, not verified.

### F-003 - MEDIUM - The two-reviewer rule never reaches the gate contract

`grep -c 0041 AGENTS.md` returns 0. `AGENTS.md` section 2 still presents PROTO-DEC-0038
as the whole review regime and requires exactly one `- Independent review:` path; the
completion-gate sections of `PROTOCOL.md` and `PAIRED-CYCLE.md` section 8 repeat that
single field with no cross-reference to PROTO-DEC-0041 item 2. An agent following
AGENTS.md section 3 (mandatory session start) never learns that a high-risk candidate
needs no fewer than two parallel independent reviewers, nor that the controller may not
certify what it controlled. The rule exists only in the review-composition sections of
two documents a non-paired task is not told to read, and the gate cannot enforce what it
does not record.

### F-004 - MEDIUM - Forbidden-path check acquires an exception

PLAN policy: "Legitimization: diff is a subset of the authorized scope; **no forbidden
path touched**; author is not the reviewer; ...". `PROTOCOL.md:113`: "No forbidden path
is touched (`AGENTS.md`, `QUICKSTART.md`, kernel, hooks, gates, manifest, tests,
decisions, registry) **unless the block explicitly targets it under a high-risk
dispatch**." Two changes: forbidden paths, which Phase 0 defines per task ("scope, risk
class, ... forbidden paths"), are replaced by a fixed list; and the added clause lets a
dispatch authorize its own exceptions, which is exactly the check's subject. The
condition becomes unfalsifiable.

### F-005 - MEDIUM - Acceptance state not met; capacity never reserved

At this verification version: validator exit 0 with **1 warning** ("36 session journals
in .ai/worklog (cap 30)"); active `docs/reviews/` holds 59 files / 608,395 B against the
validator's 60 files / 614,400 B, i.e. **one file and 6,005 bytes of headroom** for the
two certifier reports PROTO-DEC-0041 item 2 mandates. The second report breaches the file
cap and either breaches the byte cap. Capacity was not reserved before the certification
artifacts were commissioned, contrary to anti-idle rule 4 in the candidate's own text.
`prune` clears 4 empty journals, leaving 32 - still 2 over cap, so archiving under the
lock is required. `.ai/TASK.md:55` asserts "validator 0 warnings, corpus 56 files /
589,244 B, 30 journals"; none of the three holds now.

Measured after this report was written: 60 files / 620,428 B, and the validator now
reports **2 warnings** (journals and corpus). This artifact is the first of the two
mandated certifier reports and it alone crosses the byte cap; a compliant report
carrying one reproduction per claim, as item 4 requires of a `FAIL`, does not fit in
6,005 bytes. Archiving under the lock, not a shorter report, is the remedy.

### F-006 to F-009 - LOW - backlog

- **F-006**: PROTO-DEC-0041 item 6 leaves the seven phases, the one-primary-pass rule,
  the block definition, T0-T4 and BARC "deliberately reversible" until the pilot report.
  Both managed documents, which install into consumer repositories, present them as
  settled rules ("strictly forbidden", "a BARC record is established") with no
  provisional marker. Section headings cite "PLAN policy" but never its revocability.
- **F-007**: `PROTOCOL.md:277` and `PAIRED-CYCLE.md:20` attribute "response diversity
  enhances accuracy" to Kaesberg et al.; the statement verified in PROTO-DEC-0041 is
  "increasing the number of agents improves performance while more discussion rounds
  before voting reduce it", which the same two files state correctly at `PROTOCOL.md:381`
  and `PAIRED-CYCLE.md:63`. A decision written to correct unverified claims should not
  ship a paraphrase attributed to its own verified source.
- **F-008**: item 4 states the rubric "does not decide blocking by itself". The rubric
  table adds a `Blocks?` column, answers "No, otherwise" for MEDIUM off protected paths -
  which clause (a) of the blocking rule contradicts for any violated contract - and adds
  "state drift" to INFO, a term absent from the decision that invites dismissing state
  findings such as F-005.
- **F-009**: the phases table `Repeat Triggers` column lists "Owner requests alternative"
  for Phase 2. The PLAN policy admits **exactly four** triggers and an owner request is
  not among them; the same document states the four correctly one section later.

## Conditions to clear this FAIL

1. Restate the fifth-voice clause in `PROTOCOL.md`, `PAIRED-CYCLE.md` and the dispatch as
   PROTO-DEC-0041 item 2 words it: a third reviewer, on an uncovered risk, contradicting
   reproductions, or an owner directive (F-001).
2. Record PROTO-DEC-0041 items 1 and 2 in `AGENTS.md` section 2 and cross-reference them
   from both completion-gate sections, stating that the single `- Independent review:`
   field records one of the reviewers a high-risk candidate requires (F-003).
3. Remove the "unless the block explicitly targets it" clause and bind the check to the
   forbidden paths declared in the Phase 0 frame (F-004).
4. Either obtain an owner instruction to commit the PROTO-DEC-0040 work so the baseline
   separates the packages, or record in `.ai/TASK.md` an explicit owner-acknowledged
   attribution list for the non-cycle paths, and restate criterion 4 against it (F-002).
5. Archive journals to 30 or fewer and reserve corpus capacity for both certifier
   reports before the closure receipts; refresh the `.ai/TASK.md` standing figures to
   measured values at step 6 of the closure order (F-005).
6. F-006 to F-009 are backlog; they do not gate closure on their own.

A `FAIL` cannot certify completion. The task correctly remains `Status: In progress`.
F-003 and F-005 are conditions on the task, not on the implementer: the first is a gap
the dispatch never assigned to anyone, the second was created by the certification round
itself.

## References

- `.ai/DECISIONS.md` PROTO-DEC-0041; `.ai/PLAN.md` "Cycle architecture policy"
- `docs/reviews/2026-09-20-deepseek-gemini-cycle-architecture-dispatch.md`
- `docs/reviews/2026-09-20-gemini-cycle-architecture-adversarial-prompt.md`
- `.ai/worklog/claude-a0c740d2132e43eb.md`
