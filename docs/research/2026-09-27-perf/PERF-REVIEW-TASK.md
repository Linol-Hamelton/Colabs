# Launch: task:roadmap-perf-wave1-review (DeepSeek Flash via kilo, its own session)

Merge-gate review per **PROTO-DEC-0088 item 6**. Work in the worktree `D:\Colabs\.ai\runtime\perf1`
(branch `perf-wave-1`). The reviewed range is **`606b23a..64043a3`** - the performance commits
`e752c0c` ("seed fixtures by writing the protocol file set instead of copying it") and `64043a3`
("split validator.test.cjs into four files by test family"); the Variant-3 commit does not exist.

## Focus (from the decision)

1. **Byte-equivalence of the fixture seeding**: the new seeding must write the same bytes the old
   copy API produced; verify with `tools/perf/fixtures.cjs` evidence and by reading the code.
2. **Test set and semantics unchanged**: the same 420 tests; 34/34 in the validator family after
   the split into four files; no test renamed or weakened; no assertion dropped.
3. **No validator or protocol changes**: `validate-protocol.ps1`, `.ai/bin/*`, `docs/` outside
   `docs/research/2026-09-27-perf/` untouched in the range.
4. Any FAIL claim needs a reproduction. The existing wave-1 ROADMAP review
   (`docs/reviews/2026-09-27-deepseek-roadmap-w1-review.md`) stays closed - do not re-run it; the
   M1 measurements themselves are not in scope.

## Rules

- `node .ai/bin/protocol-session.cjs start --agent deepseek`; use the printed owner name.
- Read-only on the reviewed files. Write only your review, your journal and your evidence.
- Do not run `test-protocol.ps1`; you may run `validate-protocol.ps1` once and `record --quick` at
  the end. (This review may run while other tasks run on other clients; do not start suites.)
- Commit your files on this branch with explicit paths; do not push.
- Deliverable: `docs/reviews/2026-09-27-deepseek-perf-wave1-review.md` (<= 250 lines) with the
  mandatory header (reviewed commit `64043a3`, tree status, reviewer model, date UTC, scope) and an
  explicit `PASS` / `RECOMMENDATION` / `FAIL` / `BLOCKED` verdict; journal: five labels plus model,
  effort, usage.
