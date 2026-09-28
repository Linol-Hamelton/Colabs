# M-2A-res check: F-2A-01 and F-2A-05 (operator, no code changes)

Baseline: `v2.0.0` @ `1f15b5f` (the commit before this report). Method: read the sources named by the
wave-2A review and the fix review, verified against git history and the current tree. No repository
file was changed except this report.

## F-2A-01 - CONFIRMED (LOW, documentation)

- The claim: the execution report misdescribes the INDEX edit.
  `docs/research/2026-09-27-roadmap-queue/W2A-EXECUTION.md:42`: "Updated
  `docs/research/archive/INDEX.md` line 16 (CR-F01-1) to reflect the fixture retention under
  `tests/fixtures/prompts/`."
- The fact: `git show 61c7159 -- docs/research/archive/INDEX.md` adds exactly one line - the new
  `CR-W5-1` row; `CR-F01-1` is byte-identical (`docs/research/archive/INDEX.md:17`).
- Verdict: CONFIRMED; the sentence still misdescribes the change. Source: DeepSeek review
  `docs/reviews/2026-09-27-deepseek-roadmap-2a-review.md:50`; the fix round left it open
  (`docs/reviews/2026-09-28-deepseek-2a-fix-review.md:79`), MiMo round 2 kept it as an open LOW
  residual (`docs/reviews/2026-09-28-mimo-wave2a-certification-r2.md`).

## F-2A-05 - CONFIRMED (LOW, test coverage)

- The claim: T30 does not exercise the bare default `docs/ops/RUNS.jsonl` path.
- The fact: `tests/dispatch.test.cjs:1609` (T30) sets `runsFile` in the dispatch object (`:1624`,
  `custom-runs.jsonl` under the suite temp) and asserts that configured store (`:1671-1674`); the
  body ends at `:1705`. The bare default resolution (no `runsFile`, no `PROTOCOL_RUNS_FILE`) is not
  asserted anywhere: a search over `tests/*.test.cjs` finds no such assertion, and the suite's
  `DEFAULT_TEST_RUNS` (`tests/dispatch.test.cjs:26`) routes to `TEST_SUITE_TMP`.
- Verdict: CONFIRMED; the dedicated default-path assertion is still missing. (The review's
  alternative - accept the manual `report` proof - remains open to the owner/next wave.)
- Source: DeepSeek review `docs/reviews/2026-09-27-deepseek-roadmap-2a-review.md:54`; MiMo round 2
  `docs/reviews/2026-09-28-mimo-wave2a-certification-r2.md:111`.

## Disposition

Both residuals are LOW, non-blocking, and still open; no code was changed by this check. They are
candidates for the next wave under M-2A-res (`docs/ops/BACKLOG.md:64-65`).
