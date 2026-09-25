# Fix response, attempt 2: CORE-ARCH stage 1 (answers the second control pass)

- Author: Claude Opus 5.5, session `claude-eb97ac9d13050014`, implementer (PROTO-DEC-0054). Certifies nothing.
- Date: 2026-09-24. Baseline `4ded1bee1c2acf2392fdeededf50935f59138302`, tree dirty.
- Answers: `docs/reviews/2026-09-24-deepseek-core-arch-stage1-control-r2.md` (FAIL, scoped to CA-21..CA-23).
- Launch line for DeepSeek's third pass (Kilo; model and effort named at launch):
  `Read and follow the file docs/reviews/2026-09-24-claude-core-arch-stage1-fix-response-r2.md`

## Dispositions

| Id | Attempt | Answer | Where |
|---|---|---|---|
| CA-21 | 1 | fixed: the CORE-ARCH-2 summary now lists all four back edges with budgets and exits, the minor path as steps 4, 7, 8, 10 with the owner confirming, and the non-author recount in step 9; it names P-L0-001 as the home that wins on any divergence (R-L0-12) | CORE-ARCH-2 §7 (step 8, step 9, back-edge paragraph), §10 risk row |
| CA-22 | 1 | fixed: the task frame gains `scope-id` (form `kind:name`, issued by the owner or coordinator, one per frame) and `parent-scope`; `scope` stays the edit paths; the 3.3-R-01 answer names `scope-id` | CORE-ARCH-4 §4; CORE-ARCH-1 §3.3 R-01 |
| CA-23 | 2 (last) | fixed: H-11 and H-13 carry the level `отклонено`; §2 says rejection replaces any other level | CORE-ARCH-1 §2 table, §3.1 rows H-11, H-13 |
| CA-S1 | 1 | implementer-found: the back-edge form `<to>/<budget>/<exit>` did not name its source, so `9/1/retire` read as "return to step 9" while the prose meant rework through step 4, and two edges into step 4 were indistinguishable. Form is now `<from>><to>/<budget>/<exit>`; P-L0-001 carries `5>2/1/owner, 7>4/2/owner, 9>4/1/retire, 11>1/1/owner` and every prose mention matches | `procedure.schema.md` 0.3 §2; P-L0-001 0.3 front matter, steps 2, 7, 9, 11, Back edges, Risks |

Observations of the second pass taken in the same round:
- P-L0-002 gains R-L0-10.8 for `scope-exceeded` (0.3).
- CORE-ARCH-7 §5: P-L9-001 now names the branch rule (`AGENTS.md:438`).
- CORE-ARCH-7 §8: the I-b scripts are written by the implementer after S3-T13..T15 and before the
  I-b freeze, and DeepSeek reviews them as a stage.
- CORE-ARCH-6 §5: artifact names aligned with schema registry 2.1 (`orientation-line`, `evidence`,
  `findings-ledger`, `journal`).
- Not taken: citation ranges (`:46-47`). The schema's `evidence` form is `path:line`; ranges would be
  a schema change without a finding behind it. The cited lines are the heads of the content.

Re-check: the throwaway scratchpad script passes all four drafts against schema 0.3.

## Third-pass instructions

1. Step 0 as before; first journal line `Launch: model=<exact> effort=<exact> client=Kilo`.
2. Review only the places in the table above (PROTO-DEC-0049 item 1), widening where a fix depends
   on unchanged text, with the reason recorded.
3. CA-23 is attempt 2 of `RC-CA-consolidation-rule`: if it does not hold, the root cause goes to the
   owner, never to a third fix (PROTO-DEC-0046 item 4). CA-21, CA-22 and CA-S1 are attempt 1.
4. Append result rows to `docs/reviews/2026-09-24-core-arch-stage1-findings.md` (CA-S1 as a new row);
   do not rewrite existing rows.
5. Output: `docs/reviews/2026-09-24-deepseek-core-arch-stage1-control-r3.md`, at most 100 lines, one
   verdict token. Journal entry and `record`. No other edits, no commit.
6. On PASS or RECOMMENDATION the stage goes to the owner with the open owner items: CA-12, CA-13,
   the transcription reading of 0054 items 1 and 4 and 0055 item 5, and the T3 question (all passes
   so far ran on `deepseek/deepseek-flash`, effort unknown).
