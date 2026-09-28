# Launch: task:A-1 cert (GPT-5.6 Sol via codex, effort Medium; one round)

Frozen candidate: branch `a1-installed-advisory`, frozen SHA = `git rev-parse HEAD` (the commit that
adds this file). You are one of two independent certifiers (PROTO-DEC-0041 item 2; PROTO-DEC-0105
item 2: effort Medium, one round; the adversarial prompt is <= 150 lines, your report <= 250). The
other certifier (MiMo-V2.6-Pro) runs in parallel in another worktree; do not read its artifacts
before committing your own review.

## Scope (full certification of the frozen tree)

1. Execute every item of `docs/reviews/2026-09-28-a1-adversarial-prompt.md` against the frozen
   tree. Reproduce the A-1 defect on the pre-fix tree (`git show 74b46ff:validate-protocol.ps1`,
   e.g. via `git archive 74b46ff` into a temp dir) and the fix on the candidate.
2. A DeepSeek fix review exists: `docs/reviews/2026-09-28-deepseek-a1-fix-review.md`
   (RECOMMENDATION; it records residual blacklist limitations R2/R3 - a marker split across a
   newline, table-cell declarations, exotic prefixes - as pre-existing and not introduced by A-1).
   Verify its claims yourself; do not adopt them; judge whether any residual blocks.
3. Operator evidence: `test-protocol.ps1` 425/425 PASS, 304.5 s, 2026-09-28T19:27:46-19:32:57Z;
   `validate-protocol.ps1` exit 0; log `D:\Colabs\.ai\runtime\a1-suite.log` (main tree). You may
   re-run targeted tests (e.g. `node --test tests/validator-gate.test.cjs`).

## Baseline check

`git rev-parse HEAD` equals the frozen SHA; `git diff 74b46ff..HEAD --stat` shows the candidate files
(`validate-protocol.ps1`, `tests/validator-gate.test.cjs`), the adversarial prompt, the journal, the
review and launch docs only.

## Deliverable

`docs/reviews/2026-09-28-sol-a1-certification.md` (<= 250 lines): header (reviewed SHA, tree status,
reviewer model `GPT-5.6 Sol`, provider confirmed from your own client log/rollout, date UTC,
`Mode: CERTIFYING`, `Receipt-Owner: <your session owner>`, ONE verdict:
`PASS` / `FAIL` / `BLOCKED` / `RECOMMENDATION`), per-item verdicts, at least one reproduction per
FAIL, and a closure table for the DeepSeek review's residuals.

## Session rules

- Start the protocol session (hooks may have started it); journal with the five labels (model,
  effort, usage or `not-exposed`); `record --quick`; `verify` must print "matches".
- Commit your review and journal with explicit paths on this branch; do NOT push.
- Verification only: no code, no fixes, no decisions; do not edit any frozen report.
