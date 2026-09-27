# Launch: task:perf-wave-1-m1 (Gemini 3.8 Flash high via agy; the ONLY session in the M1 window)

Frame: PROTO-DEC-0087 item 1 - the perf wave 1 measurement campaign (M1). Worktrees:
`D:\Colabs\.ai\runtime\perf1` (branch `perf-wave-1` at `64043a3`) and
`D:\Colabs\.ai\runtime\perf1a` (detached at `e752c0c`). The workstation must be otherwise idle:
before starting, scan processes; do not start anything else; the operator launches no other
session and runs no `record` until the campaign ends.

## Campaign

1. **Diagnostic run**: one full `test-protocol.ps1` in `perf1a` (`e752c0c`); record the wall time.
2. **Five full runs**: in `perf1` (`64043a3`), with the branch's parallel mode at concurrency 16
   (read `test-protocol.ps1` and the perf commits for the exact switch - `64043a3` is "split
   validator.test.cjs into four files by test family", `e752c0c` seeds fixtures instead of copying
   them). Record each run's wall time.
3. **Acceptance**: median of the five `64043a3` runs **<= 300 s**. If the median is above 300 s,
   the campaign fails: write the numbers, mark the verdict `M1 MISSED`, stop; nothing is merged.
4. A crashed or incomplete run: retry it once and note the retry; if it fails again, stop and
   report the exact failure.

## Rules

- `node .ai/bin/protocol-session.cjs start --agent gemini` (in `perf1`); use the printed owner name.
- Measure only: do not modify tests, tooling or any file outside the report, your journal and your
  evidence. Do not merge, do not push, do not run other programs' tests.
- Write `docs/research/2026-09-27-perf/M1-REPORT.md` on the `perf-wave-1` branch: machine specs,
  per-run wall times, the median, the verdict, timestamps. Commit with explicit paths.
- Only **after** the last measurement: your five-label journal entry and `record --quick`.
- If the median passes, note in the report that the operator then checks merge overlaps between
  `perf-wave-1` and `kernel-batch-1` (`git diff --name-only`) before any merge.
