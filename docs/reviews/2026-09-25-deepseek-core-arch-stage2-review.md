# Report S - CORE-ARCH stage 2 (L1 roles): transcription, adversarial review, LCC re-run

- Reviewer: DeepSeek, model `deepseek/deepseek-flash`, effort unknown, client Kilo (mode Code),
  owner `deepseek-de4b5c30af414f21`. Date: 2026-09-25 UTC.
- Baseline: `4ded1bee1c2acf2392fdeededf50935f59138302` (from `git rev-parse HEAD`); tree **dirty**
  (86 tracked/untracked status entries at open; no reviewed file changed during this review - 17
  reviewed files hashed twice, identical).
- Scope: package S - PROTO-DEC-0056..0065, the stage-2 records of `docs/core-arch/stage-2/`, the
  stage-1 anchors they cite, `docs/core-arch/CORE-ARCH-3.md`; Parts 1-3 of
  `docs/reviews/2026-09-25-claude-core-arch-stage2-review-prompt.md` as carried by the launch
  prompt. Mode: **ADVISORY** (R-L0-05); the reviewer certifies nothing.
- Verdict: **FAIL** - one confirmed cross-record conflict (CB-01) and several grammar/one-home
  defects are reproduced below; all are fixable, none requires abandoning the design.
- Commands run: `git rev-parse/status/log`; `protocol-session start`; read-only scans by
  `node` over the records (rule-id duplicate scan, role/tool/back-edge scan, citation opening,
  packet-size count); `validate-protocol.ps1` exit 0/0 warnings, tree unchanged. All experiments
  or long runs that could write were in a copy under the temp directory. No model was called.
- Launch prompt deviation: the prescribed orientation line uses free text (`rights=read, run the
  allowed commands, write three files | limits=Rules`) where P-L1-001 step 4 asks for rule ids,
  TOOL ids and criteria ids. The grammar did not fit because this task has no packet, no TOOL ids
  and its limits are the launch prompt's Rules; the line was written as prescribed and the gap is
  recorded here and as a Signal.

## Part 1 - transcription check (PROTO-DEC-0056..0065)

Method: each block compared with its own `Approved by` verbatim text and, where the block cites a
record, with that record. Label: FACT = text opened; CLAIM = reading of words.

| Block | Result | Note |
|---|---|---|
| 0056 | faithful | Items 1, 4 match "да" answers; item 2 matches the one-role sentence; item 5 drops no limit (WARN-first kept). Item 3 names 4.1 as a strong model, as the owner said. FACT: `.ai/DECISIONS.md:2303-2307,2318` |
| 0057 | faithful | Item 2 limits the kernel order exactly as the quoted answer does; item 3 "one task is one task frame"; item 4 "never, even as a separate task"; item 5 caps 200/2MB/100. The two-stage cap inside item 4's async pilot is not in the quoted words (CLAIM: only "Да, с этапа 2" is quoted) - not a defect, a transcription limitation |
| 0058 | faithful | Five rules = "Это идеально"; item 3 repeats the six-step owner procedure; item 4 nine tiers. FACT: `:2362-2371,2382` |
| 0059 | faithful | Order, mapping, floors, even-shift-up, short-list-repeat all in the poll answer. FACT: `:2396-2399,2410` |
| 0060 | faithful | Class E rejection, the two procedures, A/B/C and `.ai/core/`; artefacts exist (`stage-1/P-L0-006`, `P-L0-007`, `CORE-ARCH-7:156`, `external-synthesis.md`) |
| 0061 | faithful | Approval conditioned on the second re-check, which returned RECOMMENDATION |
| 0062 | faithful; unverifiable detail | Items 1-3 match the quotes; the "at most two stages" cap is not in the quoted words (same limitation as 0057) |
| 0063 | faithful | Sources, routes-not-ranks, run-now all in the poll. FACT: `:2510-2512,2523` |
| 0064 | faithful | Google/OpenAI/DeepSeek/repeat and copilot-only ranking match the poll |
| 0065 | faithful; reading marked | v4-pro out, per-client procedure, stage 2 starts; the "counts as at launch" sentence is marked as the transcriber's reading. FACT: `:2576-2577` |

No block states anything the quoted words do not direct in a load-bearing way; no standing limit
was dropped among 0056..0065. Signal: poll option texts are not persisted, so several accepted
options (0062 item 4) cannot be checked from the quoted words alone.

## Extra angle - the reported defect in SCHEMA-assignment section 2: CONFIRMED

FACT: `docs/core-arch/stage-2/SCHEMA-assignment.md:48-50` - "Lines of the parent scope hold in
every child task ... so a second role for it in any of them breaks R-L2-002.2"; fixture F7
(`:80`) encodes this. FACT: PROTO-DEC-0057 item 3 says the one-role rule "applies within one
frame" (`.ai/DECISIONS.md:2335`), and the owner's words are "Одна рамка задачи". FACT: the same
schema's section 6 (`:114-118`) admits the effect when it keeps certifiers out of program scope
because a program line "would forbid the same model the critic role ... in a separate frame".
Effect: a program-scope line turns R-L2-002.2 into a program-wide exclusion, which no decision
directs; with the migration of section 6 plus `parent-scope: program:core-arch`, the planned
assignment `deepseek-flash @ task:research-a: researcher` would exit 1 (deepseek-flash would hold
`reviewer` at program scope), i.e. the grammar as written rejects the very dispatch PROTO-DEC-0066
item 4 and the research README specify. Fix proposed: in section 2, state that `parent-scope`
lines are inherited defaults for models not named in the child, and that the one-role check is
evaluated on the frame's own lines; keep cross-frame independence in R-L1-002.2 (lineage) and the
specific bars (R-L1-certifier.1, R-L1-fixer.2, R-L0-05). If the owner instead wants the
program-wide exclusion, that is a decision superseding PROTO-DEC-0057 item 3, not a schema note.
Alternative safer reading, if the merge stays: mark a program-scope line as incompatible with any
other line of the same model in the program, and say so where the owner can see it - the current
text hides the consequence in a rationale paragraph.

## Part 2 - adversarial review of stage 2 (one verdict per angle)

1. **Rights (R-L0-04, R-L1-owner.2): FAIL.** The grammar accepts a model in the `owner` slot
   (`SCHEMA-assignment.md:41`) with no rule barring it, and a delegated coordinator may write
   assignment lines (`:89-92`) without a slot restriction; ROLE-owner grants approval-amending
   rights (`roles/ROLE-owner.md:34-37`). R-L0-04 and P-L0-005 still bind, so no binding approval
   can be produced, but the grammar should not be able to describe a model as the owner
   (LCC-7-adjacent). Also the grammar's `assigner ::= model | "owner"` (`:43`) accepts a
   model-written delegation line while section 5 (`:91`) says only the owner writes them; the
   parser cannot exit 2 for that.
2. **Identity wash (R-L1-002.1/.2): RECOMMENDATION.** Alias/session/effort/client washes are
   closed by the matrix id and F6 (`:79`); a frame change is allowed by PROTO-DEC-0057 item 3 and
   is not a wash because R-L1-002.2 judges the lineage. Gap: the lineage enumeration is
   "produced, fixed, reviewed or coordinated" (`P-L1-002-independence.md:39-40`) while
   R-L1-coordinator.2 and R-L0-05 also bar certifying what one "framed, dispatched or controlled"
   - add those words.
3. **Grammar (fixtures F1-F8): RECOMMENDATION.** Each fixture follows from the grammar and
   reading rules as written; F1-F8 all reproduce on paper: wrong form exits 2, fenced/decoy
   `## Roles` exits 2, alias collapse exits 1, parent merge exits 1, unknown model exits 2. Open
   input: the reading rules never define where a scope's lines are read from (which document
   carries `program:core-arch`, a `candidate:<sha>`, or `parent-scope`), the behaviour when the
   parent document is missing, or two parents. F7 is unimplementable without that. Recommend a
   scope registry (scope-id to frame path) and exit 2 for an unresolved parent.
4. **Scope merge: FAIL.** See the extra angle: the parent-scope rule extends the one-role rule
   beyond one frame and conflicts with PROTO-DEC-0057 item 3; section 6's reason is sound only as
   a workaround for the flawed section 2, so the fix belongs in section 2.
5. **One home (R-L0-12): FAIL.** The participant rule is defined twice: P-L1-002 independence
   rule .1 (`P-L1-002-independence.md:37-38`) and SCHEMA-assignment section 1
   (`SCHEMA-assignment.md:22-28`), both normative. "The dispatcher is a script" is stated in
   `SCHEMA-assignment.md:51` and `roles/ROLE-dispatcher.md:30`. Keep one normative statement and
   make the other a pointer; a schema may hold the alias-resolution table without restating the
   rule.
6. **Capabilities (PROTO-DEC-0031): RECOMMENDATION.** The slot table (`CORE-ARCH-3.md:69-84`)
   under-declares: researcher, synthesiser, drafter, critic and fixer show REPO_READ only while
   their outputs/duties are file writes (`ROLE-researcher.md:12,37-39`); the coordinator shows
   FS_WRITE, REPO_READ while its rights include dispatching sessions and taking the lock
   (`ROLE-coordinator.md:36-40`), which need SHELL_EXEC under the 0031 set. State whether 0031's
   four capabilities bind only certifying verdicts (AGENTS.md:127) or every slot, then align.
7. **Rubric re-score (>= 3 rows): PASS with notes.** Re-scored rows 1, 4, 6 and 8 of
   `trial/P-L2-002-rubric-trial.md`: row 1 (0,2,1,0,1,0 = 4 -> T7 by kernel floor) agrees;
   row 4 (1,2,2,0,1,1 = 7 -> T6 -> T7) agrees; row 6 (1,2,0,0,0,1 = 4 -> T4 -> T7) agrees;
   row 8 (1,1,1,0,1,1 = 5 -> T4) agrees with the author's own doubt. Signals S-1..S-5 check out:
   S-1 true in this repo; S-2 true (row 6 lifted three tiers); S-3 is open question В-24 and
   should be closed by a rule (does reviewing an unlanded kernel record take T7?); S-4 is a real
   gap - the rubric does not say what Size means for a review; S-5 counted correctly (nine of ten
   rows 0).
8. **Packet trial re-check (>= 8 rows): RECOMMENDATION.** Re-checked rows 1-6, 8, 9, 11, 12, 14,
   19, 20, 23-33 against the current records. Rows 4, 8, 19, 20, 24-26, 28-30, 33 hold. Wrong:
   row 3 maps "a reproduced FAIL or BLOCKED still blocks" to R-L1-002.3, which only says who may
   report and issue verdicts; the blocking force is PROTO-DEC-0041 items 4-5, which
   ROLE-reviewer.2 names (`roles/ROLE-reviewer.md:30`). Understated: row 5 marks the launch line
   "pending (stage 3)" but calls ROLE-dispatcher.2 a carrier; ROLE-dispatcher.2
   (`roles/ROLE-dispatcher.md:31`) does not carry the one fixed ASCII line of PROTO-DEC-0050
   item 2 - only the decision does. No hand-written instruction is missing from the table; the
   async-review sentence (prompt lines 18-19) is a scope statement and belongs in the frame.
9. **Pipelined review (WORK-CYCLE step 8): RECOMMENDATION.** The hazards are rework (accepted and
   measured) and writing on a moving candidate. PROTO-DEC-0062 item 4 caps stages, not edits: the
   reviewed package may change while it is under review (T-3/T-4 style signals aside, no freeze
   applies to stage drafts; `P-L2-008` is the planned freeze, stage 3). Concretely, package L
   gained `launch-test.cjs` and `launch-fake-client.cjs` minutes before this review and the
   implementer's journal records further edits after it. Recommend freezing the reviewed paths
   (or recording their hashes in the review prompt) for stage candidates under the pilot.
10. **Citations: PASS for the stage-2 files.** Opened 24 `path:line` citations in the stage-2
    files (every one resolves to a non-blank, relevant line: AGENTS.md 52, 73, 77, 127, 137-138;
    P-L0-001:50; stage1-control:7; DISCUSSION.md:151; BRIEF.md:100; DECISIONS.md:2008;
    PAIRED-CYCLE.md:9; AGENTS.md:69-71; protocol-hooks.cjs:300). One wrong citation found, in a
    stage-1 record: `P-L0-004-layer-consistency.md:17` cites `CORE-ARCH-1.md:240` for the nine
    checks; line 240 is blank, the heading is `:239`, the table `:243-253`, the home sentence
    `:255`. Same G8 class the implementer reported.

## Part 3 - LCC re-run (R-L0-19.2)

- Confirmed by independent re-run: **LCC-1** (138 rule ids defined across `docs/core-arch/`,
  0 defined twice); **LCC-4** (every slot in every record's `roles` exists in the 14-slot L1
  catalog); **LCC-6** (all nine `back_edges` items match `<from>><to>/<budget>/<exit>`);
  **LCC-9** (all four RULE-MAP L1 rows have their record: AR-013 SCHEMA-assignment, AR-014
  P-L1-001, AR-015 ROLE-implementer, AR-022 ROLE-certifier). **LCC-7** (invariants): no stage-2
  record lets an agent break R-L0-03..08; the owner-slot grammar gap (angle 1) is a
  representation defect, not a breach while R-L0-04/P-L0-005 bind.
- **LCC-3: cannot stand as recorded (3=pass).** The SCHEMA-assignment section 2 defect (CB-01)
  conflicts with PROTO-DEC-0057 item 3 / 0055 item 3 and was reported by the implementer, so the
  LCC line as written missed it; after the section 2 fix, LCC-3 must be re-run.
- **LCC-8: the failure is confirmed; the measurement is sound in substance; the remedy is the
  right lever.** My independent count under procedure.schema.md section 4 gives reviewer/accept
  47,626 B (full 43,189 + catalog 4,437) and coordinator/frame 42,541 B, both above the
  40,000 B hypothesis; coordinator/dispatch is now 62,259 B because P-L3-004 (9,546 B) landed
  after the LCC line. Top contributors are exactly the records the remedy names: P-L0-001
  12,390 B, P-L0-007 5,748 B, P-L0-006 4,796 B, P-L0-004 5,166 B with `stages: [any]`. Numbers
  differ from the implementer's (50,780 / 45,662 / 56,131) by method, not by conclusion. Remedy
  (a) narrow those `stages` through P-L0-001 at stage 3, plus (b) keep the budget as a measured
  admission until then; both are sound; note that PROTO-DEC-0057 item 5's WARN-first applies to
  corpus caps, not to this packet budget, so an owner answer is needed for the interim.
- Journal-LCC confirmation: the line itself (`ARCHIVE.md:8360`) matches the format of P-L0-004
  step 3; only check 8 is `fail`, correctly sent to the owner as В-26.

## Ledger

Findings CB-01..CB-11 in `docs/reviews/2026-09-25-core-arch-stage2-findings.md`, one row per
root cause, `attempt: 1`. What happens next: the implementer answers each row; a diff-only second
pass follows; on PASS/RECOMMENDATION stage 2 goes to the owner (R-L1-reviewer.4).
