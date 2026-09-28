# Launch: task:roadmap-2a-fix-round2 (vibe, Mistral Medium 3.5; round 2 of 3)

PROTO-DEC-0096 item 1. Certification round 1 closed with a classification divergence: Sol = FAIL
(two reproduced blockers), MiMo = RECOMMENDATION (all items PASS; F-2A-03 treated as LOW backlog).
Round 2 fixes Sol's two reproduced blockers; the divergence is recorded in OWNER-QUEUE.

Work in `D:\Colabs\.ai\runtime\kb1` (branch `kernel-batch-1`, HEAD `5ce5219`; candidate code
`5bc9940`). Model: Mistral Medium 3.5 until a GLM probe PASSes; record the model honestly.

## Fix 1: W5 test hermeticity (Sol item B / F-2A-03)

Reproduction:
`rg -n "gemini-0123456789abcdef|unlinkSync\(journalPath" tests/dispatch.test.cjs tests/dispatch-fake-client.cjs`
- `tests/dispatch-fake-client.cjs:18` writes the journal; `tests/dispatch.test.cjs:217` binds the
destination into the real checkout; lines 241-242 require it; line 246 deletes it. T20-T26 and T30
are equivalent.

Required: FIRST a failing test demonstrating the tracked-tree import (e.g., assert the fake client's
journal path lies inside the test's temp root, or assert that `git status --porcelain` stays empty
across the run); THEN the fix, binding the journal into the test's temp root. After the fix the
T6/T20-T26/T30 suite passes with ZERO writes into the tracked tree during the run and a killed run
leaves a clean `git status`.

## Fix 2: S-7 concurrency bound of four (Sol item E)

Reproduction (instrumented spawn): the probe in `docs/reviews/2026-09-28-sol-wave2a-certification.md`
item E prints `PROBE_MAX_ONE=6`. Cause: `launch-test.cjs:460-471` starts two `own` watchdog
scenarios via `deadWatchdog(id, report)` before the pool; lines 474-485 allow four more.

Required: FIRST a failing test asserting the maximum simultaneous `--one` children is <= 4 (adapt the
probe); THEN the fix, starting the `own` cases through the same bounded pool so the maximum is four
and every terminal path releases its slot exactly once. Keep the semantics: `launch-test.cjs --pure`
still passes all assertions, and the instrumented full run reports all scenarios PASS with
`PROBE_MAX_ONE=4`.

## Rules

- One commit per fix, failing-test-first; `git add` explicit paths; no force/rebase/amend; do not
  push.
- Do not touch `.ai/DECISIONS.md` or any frozen review file; do not close F-2A-01/05/06 - they stay
  in the backlog.
- Journal entry with the five labels plus model/effort/usage; then
  `node .ai/bin/protocol-handoff.cjs record --quick --owner <your session>`.
- Leave the worktree clean; the operator freezes the new SHA, then the DeepSeek diff review and the
  repeat certification (MiMo + Sol, Sol at Medium) follow.
