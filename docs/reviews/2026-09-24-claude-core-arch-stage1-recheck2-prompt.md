# Re-check 2 prompt: CORE-ARCH stage 1, fixes CA-36..CA-40 (owner condition before approval)

- Author: Claude Opus 5.5, session `claude-eb97ac9d13050014`, implementer (PROTO-DEC-0054). Certifies nothing.
- Date: 2026-09-24. Baseline `4ded1bee1c2acf2392fdeededf50935f59138302`, tree dirty.
- The owner will approve stage 1 after one more re-check (poll answer, 2026-09-24:
  "Одобряю после ещё одной перепроверки").
- Addressee: the stage-1 reviewer (DeepSeek). Mode: ADVISORY. Launch line (Kilo, mode Code):
  `Read and follow the file docs/reviews/2026-09-24-claude-core-arch-stage1-recheck2-prompt.md`
- Model by P-L2-002 (trial): size 1, protected 1, novelty 0, reversibility 0, ambiguity 0, coupling 2
  = 4 -> T4; floor T4 holds. Table empty, `table-pending`: `deepseek/deepseek-flash` 4.1, same role.
  First journal line: `Launch: model=<exact> effort=<exact or unknown> client=Kilo`.

## Step 0

`git rev-parse --show-toplevel` must be the `D:/Colabs` checkout, else stop.
`node .ai/bin/protocol-session.cjs start --agent deepseek`.

## What to check (diff only, PROTO-DEC-0049 item 1)

| # | Finding | Fix | Where |
|---|---|---|---|
| 1 | CA-36 (attempt 2, last) | every question of section 9 carries its status and the block that closed it; only В-7 open | `docs/core-arch/CORE-ARCH-1.md` section 9 |
| 2 | CA-37 | the open list names В-12 and В-13 | `docs/core-arch/stage-1/S1-SUMMARY.md` last section |
| 3 | CA-38 | draft label 0.5 | `docs/core-arch/stage-1/P-L0-001-procedure-lifecycle.md` line 25 |
| 4 | CA-39 | trial metric M-009, defined in L6 | `docs/core-arch/stage-1/P-L0-007-comparative-test.md` 0.2; `docs/core-arch/CORE-ARCH-6.md` section 6 |
| 5 | CA-40 | one LCC table; LCC-9 names the line map, not `cover` | `docs/core-arch/CORE-ARCH-1.md` section 6.3 |
| 6 | CA-38 class, found by the author's script | draft labels matched to versions in three more records | `P-L0-007` (0.2), `docs/core-arch/stage-2/P-L2-002-model-selection.md` (0.3), `docs/core-arch/stage-4/P-L3-002-model-discovery.md` (0.2) |

CA-36 was the last attempt of RC-CA-plan-sync: if it does not hold, it goes to the owner, not to a
third fix (PROTO-DEC-0046 item 4).

## Rules

- Output: `docs/reviews/2026-09-24-deepseek-core-arch-stage1-recheck2.md`, at most 80 lines, header as
  before, one verdict token (PASS, RECOMMENDATION, FAIL, BLOCKED).
- New findings: rows from CA-41 in `docs/reviews/2026-09-24-core-arch-stage1-findings.md`; do not
  rewrite existing rows.
- Edit nothing else; no commit. Five-label journal entry, then
  `node .ai/bin/protocol-handoff.cjs record --owner <your owner name>`.
- On PASS or RECOMMENDATION the owner approves stage 1.
