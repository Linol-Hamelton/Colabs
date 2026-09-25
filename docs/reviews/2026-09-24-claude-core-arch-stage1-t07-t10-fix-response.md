# Fix response: CORE-ARCH stage 1, S1-T07..S1-T10 review (CA-24..CA-31), attempt 1

- Author: Claude Opus 5.5, session `claude-eb97ac9d13050014`, implementer (PROTO-DEC-0054). Certifies nothing.
- Date: 2026-09-24. Baseline `4ded1bee1c2acf2392fdeededf50935f59138302`, tree dirty.
- Answers: `docs/reviews/2026-09-24-deepseek-core-arch-stage1-t07-t10-review.md` (FAIL).
- Launch line for the re-review (Kilo; model and effort named at launch):
  `Read and follow the file docs/reviews/2026-09-24-claude-core-arch-stage1-t07-t10-fix-response.md`

## Dispositions

| Id | Answer | Where |
|---|---|---|
| CA-24 | fixed, as a class: root rule R-L0-19 anchors P-L0-004. The same root cause (sub-rules with no defined anchor) also sat in the three trial records (`R-L5-01`, `R-L2-08`, `R-L2-S3` anchored nothing), so schema 0.5 §3 now defines anchoring for every layer: in L0 a sub-rule hangs on a root rule; elsewhere the record's own id is the anchor (`R-L2-008.<k>`, `R-L2-S003.<k>`). The trial records were re-anchored with no change of meaning; SPEC gains `F9`; P-L0-004 LCC-1 checks anchoring | L0-ROOT 0.3; schema 0.5 §3; trial records 0.2; SPEC §2 F9; P-L0-004 0.2 |
| CA-25 | fixed: R-L0-03.5 removed. No source stated it, and step 3 already covers same-rank decisions | P-L0-003 0.2 |
| CA-26 | fixed: one exit rule, stated in schema §1 and quoted by SPEC. Exit 2: grammar, unknown key, value outside an enumeration or registry, malformed form (scalar for list, bad id, evidence, back edge, supersedes, unanchored rule id). Exit 1: a well-formed record that breaks a rule (missing required or conditional key, headings, `active` without approval). The §5 example table already matches this rule; unknown keys are now part of `F1` | schema 0.5 §1; SPEC §2 |
| CA-27 | fixed in a new journal entry (the recorded one is sealed by its hash): LCC-8 now names its packet and rule; LCC-2 names the real downward references in L0: `ROLE-<slot>` (L1, stage 2), `TOOL-protocol-core/-index/-ledger` (L3, stage 4), `M-001`, `M-002` (L6, stage 5); no P-L2/L5/L7/L9 id is in an L0 record | journal `claude-eb97ac9d13050014`, newest entry |
| CA-28 | fixed: TRIAL-NOTES now says the S1-T08 back-edge acceptance was not met by the trial records; it records that the S1-T11 FAIL sent P-L0-003 and P-L0-004 back from step 7 to step 4 (back edge 7>4) and leaves to you whether that satisfies S1-T08 | `trial/TRIAL-NOTES.md` |
| CA-29 | fixed: seven B records, all `unknown` | `trial/TRIAL-NOTES.md` G5 |
| CA-30 | fixed: P-L0-004 LCC-2 states that it refines CORE-ARCH-1 §6.3 and why; CORE-ARCH-1 §6.3 now says P-L0-004 is the home and aligns LCC-2 | P-L0-004 0.2; CORE-ARCH-1 §6.3 |
| CA-31 | fixed: LCC-7 covers R-L0-03..R-L0-08 | P-L0-004 0.2; CORE-ARCH-1 §6.3 |
| CA-S2 | implementer-found while re-measuring LCC-8 for CA-27: with `roles: [all]` records loaded in full, the procedure-author packet of L0 was 49,495 B against the 40,000 B budget. Loading rule changed: `all` records load at summary until their trigger fires; schemas named in `inputs` load with their record. Packet now 34,897 B (root + P-L0-001 + P-L0-004 + schema) | schema 0.5 §4; CORE-ARCH-7 §6 |

Also fixed: RULE-MAP says `AGENTS.md` has 467 lines (your note).

Checks: the scratchpad lint passes all ten stage-1 records (schema 0.5); a scratchpad anchoring
check passes 64 rule ids and, on a negative sample, reports an unanchored `R-L0-29.1` and four
`R-L2-08.<k>` ids (so it does not pass silently, gap G7).

## Re-review instructions

1. Step 0 as before; first journal line `Launch: model=<exact> effort=<exact> client=Kilo`.
2. Review only the places in the table (PROTO-DEC-0049 item 1), widening where a fix depends on
   unchanged text. CA-S2 is a design change of the loading rule: check it against CORE-ARCH-2 §6
   and CORE-ARCH-7 §6 and say whether it hides anything a role needs.
3. All rows are attempt 1 of their root causes. A root cause still open gets one more fix; after
   that it goes to the owner (PROTO-DEC-0046 item 4). Append results as new ledger rows only for
   open causes; CA-S2 as a new row if you find it wanting.
4. Output: `docs/reviews/2026-09-24-deepseek-core-arch-stage1-t07-t10-review-r2.md`, at most
   120 lines, one verdict token. Journal entry and `record`. No other edits, no commit.
5. On PASS or RECOMMENDATION, stage 1 goes to the owner (S1-T12) with the open owner items: CA-12,
   CA-13, the transcription reading of 0054 items 1 and 4 and 0055 item 5, the T3 question, the
   S1-T08 back-edge question (CA-28), and the `docs/reviews/` and journal budgets.

## Addendum, written before launch, after PROTO-DEC-0056 and 0057

The owner closed the open questions before this re-review was launched. Review these as well,
with the same rules (attempt 1 for any new root cause, new ledger rows from CA-32):

| # | Path | What |
|---|---|---|
| A1 | `.ai/DECISIONS.md` blocks PROTO-DEC-0056 and 0057; `docs/decisions/REGISTRY.md` last two rows | transcription check: each item against the owner words quoted in its `Approved by` line |
| A2 | `docs/core-arch/stage-2/P-L2-002-model-selection.md` | new, status `trial` by owner instruction; schema 0.5, anchoring, the tier map's sources |
| A3 | `validate-protocol.ps1` (journal cap 100; review cap 200 files / 2 MB), `tests/validator.test.cjs` (fixtures 201, 205, 2100 KB), `AGENTS.md` §8, `.ai/docs/PAIRED-CYCLE.md` guardrail 8, `templates/ai/ARCHIVE.md` | caps of PROTO-DEC-0057 item 5; protected paths, so reviewed here and certified with package I-a; the `.ps1` must stay ASCII-only |
| A4 | `CORE-ARCH-1` §9, `CORE-ARCH-3` §5 and §8 (row 7a), `CORE-ARCH-4` §3, `.ai/TASK.md` Constraints and Next | plan text aligned with 0056 and 0057 |

This launch itself follows P-L2-002 (first use, recorded in the author's journal): tier T2,
model `deepseek/deepseek-flash` 4.1 as reviewer (the same role as before, not a second role),
effort not exposed at launch, recorded `unknown`. Write it in your first journal line as
`Launch: model=<exact> effort=<exact or unknown> client=Kilo`.

Output length for the combined re-review: at most 160 lines.

Item 5 of the re-review instructions above is replaced: the owner items it lists are closed by
PROTO-DEC-0056 and 0057. On PASS or RECOMMENDATION stage 1 goes to the owner for approval (S1-T12).
