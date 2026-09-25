# Review prompt: CORE-ARCH stage 1, tasks S1-T07..S1-T10 and the L0 consistency check (S1-T11)

- Author: Claude Opus 5.5, session `claude-eb97ac9d13050014`, implementer (PROTO-DEC-0054). Certifies nothing.
- Date: 2026-09-24. Baseline `4ded1bee1c2acf2392fdeededf50935f59138302`, tree dirty.
- Addressee: DeepSeek, controller and reviewer of the stage. Mode: ADVISORY.
- Launch in Kilo with the model and effort named at launch (PROTO-DEC-0055 item 5):
  `Read and follow the file docs/reviews/2026-09-24-claude-core-arch-stage1-t07-t10-review-prompt.md`

## Step 0

`git rev-parse --show-toplevel` must be the `D:/Colabs` checkout, else stop.
`node .ai/bin/protocol-session.cjs start --agent deepseek`; first journal line
`Launch: model=<exact> effort=<exact> client=Kilo`.

## What is new or changed since your third pass

| # | Path | What |
|---|---|---|
| 1 | `docs/core-arch/stage-1/RULE-MAP.md` | S1-T07: 60 rows, every atomic rule of `AGENTS.md` §1-12 with its line range and one home |
| 2 | `docs/core-arch/stage-1/P-L0-003-source-conflict.md` | S1-T09, new |
| 3 | `docs/core-arch/stage-1/P-L0-004-layer-consistency.md` | S1-T09, new |
| 4 | `docs/core-arch/stage-1/P-L0-005-decision-change.md` | S1-T09, new |
| 5 | `docs/core-arch/stage-1/trial/` (three records + `TRIAL-NOTES.md`) | S1-T08: P-L0-001 run on P-L5-001 (A), P-L2-008 (B), S-003 (D) |
| 6 | `docs/core-arch/stage-1/procedure.schema.md` 0.4 | `legacy:` form in `supersedes`; stage-id registry §2.2 (from the trial) |
| 7 | `docs/core-arch/stage-1/P-L0-001-procedure-lifecycle.md` 0.4 | step 1 search fallback while CATALOG does not exist (from the trial) |
| 8 | `docs/core-arch/stage-1/SPEC-protocol-core.md` | S1-T10: lint, catalog, check-links, lcc |
| 9 | `docs/core-arch/CORE-ARCH-2.md` §8 (S1-T07 row), `CORE-ARCH-6.md` §5 (three rows), `CORE-ARCH-1.md` line 46, `P-L0-002` line 24 | small follow-ups |
| 10 | journal `claude-eb97ac9d13050014`, entry "Stage 1 tasks S1-T07..S1-T10" | the author's LCC line for L0 and signals sig-local-4..10 |

## What to check

1. **RULE-MAP coverage.** Redo the line check yourself: every non-blank line of `AGENTS.md` that is
   not a heading or `---` falls in exactly one row's `Lines`. Then spot-check at least ten rows:
   does the home carry the rule, and is the layer right by the layer test of P-L0-001 step 2?
   Is anything that should be `out` or `E` marked `A`?
2. **The three new L0 procedures.** Do they pass `procedure.schema.md` 0.4 by hand? Does P-L0-005
   say exactly what `AGENTS.md` §2, §6 and PROTO-DEC-0030 and 0033 say, no more and no less? Is
   P-L0-003 R-L0-03.5 (a more specific record does not override a general one by itself) justified
   by any source, or is it an invented rule? Does P-L0-004 match CORE-ARCH-1 §6.3?
3. **The trial.** Were the three records really produced through P-L0-001's steps, as the table in
   `TRIAL-NOTES.md` claims? Is the statement that the back-edge part of the acceptance was not met
   accurate, and is anything in the notes overstated? Are the gaps G1-G8 real?
4. **The specification.** Is it in the form of spec §1 and PROTO-DEC-0047 item 8? Does any check it
   mechanises need judgement (then it must be dropped)? Are the exit codes consistent across commands?
5. **LCC for L0 (P-L0-004 step 4).** Re-run LCC-7 and at least three other checks of the author's
   LCC line in the journal, and confirm or refute each.
6. **Citations.** Open every `path:line` in the `evidence` fields of the new records; report any that
   is blank or does not support the claim (this class recurred three times, gap G8).

## Rules

- Output: `docs/reviews/2026-09-24-deepseek-core-arch-stage1-t07-t10-review.md`, at most 200 lines,
  header as before, one verdict token (PASS, RECOMMENDATION, FAIL, BLOCKED).
- New findings: append rows to `docs/reviews/2026-09-24-core-arch-stage1-findings.md` with ids from
  CA-24, `attempt: 1`, a reproduction or exact line each; do not rewrite existing rows.
- FACT/CLAIM/HYPOTHESIS labels; a FACT carries a `path:line` you opened.
- Edit nothing else; no commit. Journal checkpoint per item, five-label entry, then
  `node .ai/bin/protocol-handoff.cjs record --owner <your owner name>`.
- On PASS or RECOMMENDATION stage 1 goes to the owner (S1-T12) with the open owner items: CA-12, CA-13,
  the transcription reading of 0054 items 1 and 4 and 0055 item 5, and the T3 question.
