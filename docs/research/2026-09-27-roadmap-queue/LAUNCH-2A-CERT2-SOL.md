# Launch: task:wave2a-cert-r2-sol (GPT-5.6 Sol via codex, effort Medium; certification round 2 of 3)

Frozen candidate: `kernel-batch-1` @ `9bf15ae` (freeze recorded by the operator 2026-09-28; code =
`5bc9940` + the round-2 fixes `6364322`, `b26b177` + docs). You are one of two independent
certifiers (PROTO-DEC-0090 item 4, PROTO-DEC-0041 item 2); the other runs in parallel in another
worktree. Do not read its artifacts before committing your own review. This is the owner-reserved
repeat call for 2A (PROTO-DEC-0098 item 5): effort Medium, one round.

## Scope (round 2)

Full certification of the frozen tree, with emphasis on the round-2 delta:

1. Re-run the unified adversarial audit items of
   `docs/reviews/2026-09-28-vibe-wave2a-adversarial-prompt.md` (its baseline `5bc9940`) against
   `9bf15ae`.
2. Verify the fix delta `5ce5219..9bf15ae`: your round-1 items B (W5 test hermeticity) and E (the
   S-7 bound of four). Reproduce both again on the fixed tree; the fix journal is
   `.ai/worklog/mistral-e5b0a7370dee2904.md`; a DeepSeek fix review exists at
   `docs/reviews/2026-09-28-deepseek-2a-fix-review.md` - verify its claims yourself, do not adopt
   them.
3. Round-1 closure: your B/E and MiMo's residuals F-2A-01/03/05 (judge whether any residual blocks).

## Baseline check

`git rev-parse HEAD` is `9bf15ae`; `git diff 5bc9940..9bf15ae --stat` shows the two fixes and docs
only.

## Deliverable

`docs/reviews/2026-09-28-sol-wave2a-certification-r2.md` (<= 250 lines): header (reviewed SHA, tree
status, reviewer model `GPT-5.6 Sol`, provider confirmed from your own client log/rollout, date UTC,
`Mode: CERTIFYING`, `Receipt-Owner: <your session owner>`, ONE verdict:
`PASS` / `FAIL` / `BLOCKED` / `RECOMMENDATION`), per-item verdicts, at least one reproduction per
FAIL, and the closure table for your B/E and MiMo's F-2A-01/03/05.

## Session rules

- Start the protocol session (hooks may have started it); use the injected or printed owner name;
  journal with the five labels (model, effort, usage or `not-exposed`); `record --quick`; `verify`
  must print "matches".
- Commit your review and journal with explicit paths on this branch; do NOT push.
- Verification only: no code, no fixes, no decisions; do not edit any frozen report.
