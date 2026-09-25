# Control report, second pass - CORE-ARCH stage 1, fix attempt 1 (DeepSeek)

- Reviewed commit SHA: `4ded1bee1c2acf2392fdeededf50935f59138302`; tree dirty; no commit in either pass.
- Reviewer: DeepSeek, owner `deepseek-cab3a8dba0dcb6b2`, client Kilo; model `deepseek/deepseek-flash`,
  reasoning effort `unknown` as launched. Same mismatch as round 1, which the fix response asks the
  owner about (owner item 4); it applies to this pass as well.
- Date: 2026-09-24 (UTC). Mode: ADVISORY. Scope: fix attempt 1 - only the files
  `docs/reviews/2026-09-24-claude-core-arch-stage1-fix-response.md` names, against
  `CA-01..CA-20` of `docs/reviews/2026-09-24-core-arch-stage1-findings.md`.
- **Verdict: FAIL (scoped).** 18 of 20 rows are `fixed-and-verified`; CA-10 stays open in one cell
  and two new defects were introduced by the fix's own output (CA-21, CA-22). All three are small;
  fix attempt 2 closes them. Nothing in the L0 structure or in the 18 verified fixes is questioned.
- Method: PROTO-DEC-0049 item 1 diff review. The files are untracked, so I used the fix response's
  `Where` column and each draft's change log, and widened reading only where a fix cites or depends
  on unchanged text: CORE-ARCH-2 §7/§10 (they restate P-L0-001), CORE-ARCH-3 §4/§6 (scope grammar and
  `Orientation:`), CORE-ARCH-4 §4 (task frame), CORE-ARCH-6 §8, CORE-ARCH-7 §5 - because CA-14,
  CA-15 and the 3.3-R-01 answer name these as the new homes. Widening recorded here as item 2 of the
  re-review instructions requires.
- Commands run: `git rev-parse --show-toplevel`, `git rev-parse HEAD`, `git status --short --branch`,
  `node .ai/bin/protocol-session.cjs start --agent deepseek`, `Get-ChildItem` (timestamps, sizes),
  `Get-Content` reads of the four stage-1 drafts and the named sections, `Select-String` over
  CORE-ARCH-3, `node .ai/bin/protocol-verdict.cjs` over the ledger, `protocol-handoff.cjs record`
  at the end.
- Related: ledger rows CA-21..CA-23 appended; the round-1 report, critique and existing ledger rows
  are untouched.

## Per-row result (attempt 1)

| CA | Result | Verified in |
|---|---|---|
| CA-01 | fixed-and-verified | L0-ROOT.md:1-16 (invariant key set per procedure.schema.md:108), headings Purpose/Rules/Evidence/Change log at :21, :28, :116, :126 in order |
| CA-02 | fixed-and-verified | procedure.schema.md:10 (cost_basis), :71-73 and :111-112 (conditional keys apply to every type); schema requires only Change log for itself (:109) |
| CA-03 | fixed-and-verified | procedure.schema.md:75-84 (registry 2.1); P-L0-001:11-12 and P-L0-002:11-12 use only registry ids plus one repo path |
| CA-04 | fixed-and-verified | P-L0-001:122-125 (steps 4, 7, 8, 10; owner confirms minor), :59-60 (R-L0-17.10) |
| CA-05 | fixed-and-verified | P-L0-001:56-58 (R-L0-17.9, active successor in the same candidate, pointer repointing, self-replacement rule) |
| CA-06 | fixed-and-verified | P-L0-001:14 (`1/1/owner`), :115-116 (step 11), :142-143 (prose) |
| CA-07 | fixed-and-verified | P-L0-002:45-46 (R-L0-10.7), :67 (form now names budget exhausted), L0-ROOT.md:77-79 (root stop rule) |
| CA-08 | fixed-and-verified | schema:9 and P-L0-001:18 now cite PROCEDURE-MAP.md:131, :144 (content starts) and DISCUSSION.md:46 (sentence head); residual note below |
| CA-09 | fixed-and-verified | CORE-ARCH-1:117 (X now `◐` with the two synthesis lines) |
| CA-10 | unresolved (one cell) | CORE-ARCH-1:50-57 defines six levels; :79 (H-11) carries `—` in the level column while its consequence is rejected -> CA-23, attempt 2 on the same root cause |
| CA-11 | fixed-and-verified | CORE-ARCH-1:70 (H-02 `◐`), :75 (H-07 `◐` x3), :76 (H-08 one source), footnotes :93-94 |
| CA-12 | left to the owner (confirmed) | .ai/DECISIONS.md:2275, :2289; owner item 1 |
| CA-13 | left to the owner (confirmed) | .ai/DECISIONS.md:2276; owner item 2 |
| CA-14 | fixed-and-verified | CORE-ARCH-1:263-269 (I-a/I-b), CORE-ARCH-4:207-209 (S3-T13..T15), CORE-ARCH-6:31-34, :56-58, :162-163, CORE-ARCH-7:130-134, :163-167 |
| CA-15 | fixed-and-verified | L0-ROOT.md:54-56, :66-69, :107-108; CORE-ARCH-2:83 (P-L0-005); CORE-ARCH-6:116-121 (P-L5-001, P-L5-002); CORE-ARCH-7:61-66 (table) |
| CA-16 | fixed-and-verified | P-L0-001:105-109 (non-author recount before active), :113-117 (`last_applied` recount) |
| CA-17 | fixed-and-verified | CORE-ARCH-1:235-237, CORE-ARCH-4:165 |
| CA-18 | fixed-and-verified | CORE-ARCH-2:295-301 (all five additions) |
| CA-19 | fixed-and-verified | CORE-ARCH-1:125-131 (R-20..R-26), note :133 |
| CA-20 | fixed-and-verified | CORE-ARCH-7:130-139 (five packages, shadow verdicts never count, R-25 interface freeze) |

Hand re-check of all four drafts against schema 0.2: every required key for the type, every
conditional key, heading presence and relative order, and the front-matter grammar (one field per
line, list items free of `,`/`[`/`]`) pass. The fix response's claim of 4/4 holds.

## Owner items

CA-12 and CA-13 stay `confirmed` and are the owner's; the fix response's owner items 1-4 are the
right list. Item 3 (program framing and no-switch rule) is the same question as control report
Part 2 items 2 and 6. Item 4 (T3) also applies to this second pass.

## New defects introduced by the fix output

1. **CA-21 (LOW, new root cause `RC-CA-restatement`).** CORE-ARCH-2 restates P-L0-001 and is now
   stale: line :248 lists back edges `5->2, 7->4, 9->4` and omits the new `1/1/owner`
   (P-L0-001:14); line :286 still says the minor path is steps 4, 7, 10 while P-L0-001:122 runs
   4, 7, 8, 10; the step-9 line :241 omits the non-author recount added at P-L0-001:105-109.
2. **CA-22 (MEDIUM, new root cause `RC-CA-scope-id`).** The answer to critique reservation
   3.3-R-01 (CORE-ARCH-1:142-144) says the scope id is issued in the task frame and cites
   CORE-ARCH-4 §4, but that frame defines `scope` as edit paths only (CORE-ARCH-4:81); no frame
   field carries the id used by the grammar (CORE-ARCH-3:83, :129). Either the frame gains a
   scope-id field or the answer must name another home.
3. **CA-23 (LOW, attempt 2 on `RC-CA-consolidation-rule`).** CORE-ARCH-1:79 (H-11) has `—` in the
   level column although section 2 (:56-57) makes `отклонено` a level; every other row now
   classifies correctly.

## Observations (not blocking)

- CA-08 residual: citing sentence heads list starts is acceptable; ranges
  (`DISCUSSION.md:46-47`, `PROCEDURE-MAP.md:131-140`, `:144-156`) would be exact.
- P-L0-002 trigger `scope-exceeded` appears in the form but has no matching rule in R-L0-10.x;
  the fix's change log claims "rules and form", the rules side is a form entry only. Worth one line
  in the next touch, not a fix round by itself.
- CORE-ARCH-7:66 homes the branch rule in P-L9-001, but P-L9-001's described content (:86-90) does
  not mention branching; S6-T02 must write it.
- CORE-ARCH-6 §8 lists S5-T10 before S5-T04 (cosmetic).
- The I-b package lists scripts whose implementation task is not named; the freeze step should say
  who builds them before the package starts.
- The preliminary id registry (schema 2.1) and the L5 catalog (CORE-ARCH-6:104-114) still differ in
  spelling (`orientation-line`, `evidence`, `findings-ledger`); S1-T10's acceptance already requires
  the alignment, so this stays covered.

## Verdict

**FAIL**, scoped to CA-21, CA-22 and CA-23. Fix attempt 2 is small and does not touch the verified
18 rows; after it, the stage can go to the owner with the CA-12/CA-13 and T3 questions.
