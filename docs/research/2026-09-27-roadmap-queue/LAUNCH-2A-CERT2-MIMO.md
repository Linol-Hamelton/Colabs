# Launch: task:wave2a-cert-r2-mimo (MiMo-V2.6-Pro; certification round 2 of 3)

Frozen candidate: `kernel-batch-1` @ `9bf15ae` (freeze recorded by the operator 2026-09-28; code =
`5bc9940` + the round-2 fixes `6364322`, `b26b177` + docs). You are one of two independent
certifiers (PROTO-DEC-0090 item 4, PROTO-DEC-0041 item 2); the other runs in parallel in another
worktree. Do not read its artifacts before committing your own review.

## Scope (round 2)

Full certification of the frozen tree, with emphasis on the round-2 delta:

1. Re-run the unified adversarial audit items of
   `docs/reviews/2026-09-28-vibe-wave2a-adversarial-prompt.md` (its baseline `5bc9940`) against
   `9bf15ae`.
2. Verify the fix delta `5ce5219..9bf15ae`: W5 hermeticity (the test-only
   `PROTOCOL_JOURNAL_IMPORT_ROOT`, temp-root bindings) and the S-7 pool bound of four. Sources: the
   fix journal `.ai/worklog/mistral-e5b0a7370dee2904.md` and, for comparison only, the DeepSeek fix
   review `docs/reviews/2026-09-28-deepseek-2a-fix-review.md` - verify its claims yourself; do not
   adopt them.
3. Round-1 closure: Sol's B (W5) and E (S-7); MiMo's residuals F-2A-01 (report sentence), F-2A-03
   (test write; claimed fixed by the delta), F-2A-05 (T30 default path). Judge whether any residual
   blocks.

## Baseline check

`git rev-parse HEAD` is `9bf15ae`; `git diff 5bc9940..9bf15ae --stat` shows the two fixes and docs
only.

## Deliverable

`docs/reviews/2026-09-28-mimo-wave2a-certification-r2.md` (<= 250 lines): header (reviewed SHA, tree
status, reviewer model `MiMo-V2.6-Pro`, route confirmed from your own client log, date UTC,
`Mode: CERTIFYING`, `Receipt-Owner: <your session owner>`, ONE verdict:
`PASS` / `FAIL` / `BLOCKED` / `RECOMMENDATION`), per-item verdicts, at least one reproduction per
FAIL, and the closure table for Sol B/E and MiMo F-2A-01/03/05.

## Session rules

- `node .ai/bin/protocol-session.cjs start --agent mimo`; journal with the five labels (model,
  effort, usage; usage `not-exposed` if the client hides it); then `record --quick` and
  `verify` ("matches").
- Commit your review and journal with explicit paths on this branch; do NOT push.
- Verification only: no code, no fixes, no decisions; do not edit any frozen report.
