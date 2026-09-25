# Re-check prompt: CORE-ARCH stage 1 before owner approval (PROTO-DEC-0060 item 1)

- Author: Claude Opus 5.5, session `claude-eb97ac9d13050014`, implementer (PROTO-DEC-0054). Certifies nothing.
- Date: 2026-09-24. Baseline `4ded1bee1c2acf2392fdeededf50935f59138302`, tree dirty.
- Addressee: the stage-1 reviewer (DeepSeek). Mode: ADVISORY. Launch line (Kilo):
  `Read and follow the file docs/reviews/2026-09-24-claude-core-arch-stage1-recheck-prompt.md`
- Model choice by P-L2-002 (trial): size 1, protected 1, novelty 2 (two new procedures), reversibility 0,
  ambiguity 1, coupling 2 = 7 -> T6; floor for a protected path T4 holds. The tier table is empty
  (P-L3-002 has not run), so the choice is `table-pending`: `deepseek/deepseek-flash` 4.1 as reviewer,
  the same role as before. Record the actual values in your first journal line:
  `Launch: model=<exact> effort=<exact or unknown> client=Kilo`.

## Step 0

`git rev-parse --show-toplevel` must be the `D:/Colabs` checkout, else stop.
`node .ai/bin/protocol-session.cjs start --agent deepseek`.

## What to re-check

| # | What | Where |
|---|---|---|
| R1 | the fixes of your last pass: CA-32, CA-33 (attempt 2 of RC-CA-gap-count), CA-34, CA-35 (attempt 2 of RC-CA-lcc2-divergence) | `stage-1/trial/TRIAL-NOTES.md`, `CORE-ARCH-1.md` §9, `CORE-ARCH-3.md` §5, `.ai/TASK.md` Next, `stage-1/P-L0-004-layer-consistency.md` 0.3 |
| R2 | PROTO-DEC-0060 against the owner words in its `Approved by` line, and its REGISTRY row | `.ai/DECISIONS.md` last block; `docs/decisions/REGISTRY.md` last row |
| R3 | removal of retirement by disuse everywhere; class E now needs a P-L0-006 finding and a P-L0-007 test | `stage-1/L0-ROOT.md` 0.4, `procedure.schema.md` 0.6, `P-L0-001` 0.5, `CORE-ARCH-2.md` §3, §7, §12 |
| R4 | two new L0 records, full review: schema, anchoring to root rules R-L0-20 and R-L0-21, evidence, loops, authority, and whether P-L0-007 matches the owner's A/B/C wording (A new kernel, B old kernel, C none; 2-3 tasks; one model; a repository clone) | `stage-1/P-L0-006-retire-or-improve-candidates.md`, `stage-1/P-L0-007-comparative-test.md`, `CORE-ARCH-7.md` §10 |
| R5 | the persisted external synthesis: transcription header of AGENTS.md section 5 item 5; that the files citing it now point at it | `docs/research/2026-09-24-remediation-mapping/external-synthesis.md`; `CORE-ARCH-1.md` §1; `P-L0-002` 0.4 Evidence |
| R6 | the owner package reads true against the tree | `stage-1/S1-SUMMARY.md` |

You cannot see the chat, so for R5 check form and references, not wording; say so in the report.
The attempt-2 fixes in R1 are the last attempts of their root causes: if one does not hold, it goes to
the owner, not to a third fix (PROTO-DEC-0046 item 4).

## Rules

- Output: `docs/reviews/2026-09-24-deepseek-core-arch-stage1-recheck.md`, at most 150 lines, header as
  before, one verdict token (PASS, RECOMMENDATION, FAIL, BLOCKED).
- New findings: append rows from CA-36 to `docs/reviews/2026-09-24-core-arch-stage1-findings.md`,
  `attempt: 1` for new root causes; do not rewrite existing rows.
- FACT/CLAIM/HYPOTHESIS labels; a FACT carries a `path:line` you opened.
- Edit nothing else; no commit. Journal checkpoint per row R1-R6, five-label entry, then
  `node .ai/bin/protocol-handoff.cjs record --owner <your owner name>`.
- On PASS or RECOMMENDATION stage 1 goes to the owner for approval (PROTO-DEC-0060 item 1).
