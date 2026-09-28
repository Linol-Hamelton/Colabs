# Launch: task:H1 cert (GPT-5.6 Luna via codex, effort xhigh; one round)

Frozen candidate: branch `h1-installed-protected-set`, frozen SHA = `git rev-parse HEAD` (the commit
that adds this file). You are one of two independent certifiers (PROTO-DEC-0041 item 2; PROTO-DEC-0107
item 2: one round; the adversarial prompt is <= 150 lines, your report <= 250). The other certifier
(MiMo-V2.6-Pro) runs in parallel in another worktree; do not read its artifacts before committing
your own review.

## Scope (full certification of the frozen tree)

1. Execute every item of `docs/reviews/2026-09-28-h1-adversarial-prompt.md` against the frozen tree.
   Reproduce the H1 defect on the pre-fix tree (`git show 606fcc5:.ai/bin/protocol-verdict.cjs`,
   e.g. via `git archive 606fcc5` into a temp dir) and the fix on the candidate; re-run the
   end-to-end installed probe (fresh temp install -> neutral ledger -> `Verdict: FAIL`, exit 1).
2. A DeepSeek fix review exists: `docs/reviews/2026-09-28-deepseek-h1-fix-review.md` (PASS). Verify
   its claims yourself; do not adopt them; judge whether any residual blocks.
3. Operator evidence: `test-protocol.ps1` 432/432 PASS, 311.2 s, 2026-09-28T19:33:13-19:38:36Z;
   `validate-protocol.ps1` exit 0; log `D:\Colabs\.ai\runtime\h1-suite.log` (main tree). The
   executor reported 63/63 `tests/rulebook.test.cjs`. You may re-run targeted tests.

## Baseline check

`git rev-parse HEAD` equals the frozen SHA; `git diff 606fcc5..HEAD --stat` shows the candidate files
(`.ai/bin/protocol-verdict.cjs`, `tests/rulebook.test.cjs`, the spec paragraph), the adversarial
prompt, the journal, the review and launch docs only.

## Deliverable

`docs/reviews/2026-09-28-luna-h1-certification.md` (<= 250 lines): header (reviewed SHA, tree status,
reviewer model `GPT-5.6 Luna`, provider confirmed from your own client log/rollout, date UTC,
`Mode: CERTIFYING`, `Receipt-Owner: <your session owner>`, ONE verdict:
`PASS` / `FAIL` / `BLOCKED` / `RECOMMENDATION`), per-item verdicts, at least one reproduction per
FAIL, and the nine-case matrix results.

## Session rules

- Start the protocol session (hooks may have started it); journal with the five labels (model,
  effort, usage or `not-exposed`); `record --quick`; `verify` must print "matches".
- Commit your review and journal with explicit paths on this branch; do NOT push.
- Verification only: no code, no fixes, no decisions; do not edit any frozen report.
