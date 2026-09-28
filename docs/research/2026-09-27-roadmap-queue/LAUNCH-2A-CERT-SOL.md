# Launch: task:wave2a-cert-sol (GPT-5.6 Sol via codex, effort Medium; certifier 2 of 2)

Frozen candidate: `kernel-batch-1` @ the head of this worktree (candidate code `5bc9940`; the audit
prompt and the dispatch files sit on top). You are one of two independent certifiers
(PROTO-DEC-0090 item 4, PROTO-DEC-0041 item 2); the other works in parallel in a different
worktree. Do not read the other certifier's artifacts before your own review is committed. This is
one of exactly two Sol calls reserved by the owner (PROTO-DEC-0095 item 4): effort Medium, one
round.

## Task

1. Start: `node .ai/bin/protocol-session.cjs start --agent codex` (hooks may have started it; use
   the injected or printed owner name) - use it for the journal, the lock and the evidence.
2. Read and execute the unified adversarial audit prompt at
   `docs/reviews/2026-09-28-vibe-wave2a-adversarial-prompt.md` (134 lines; it binds the audit to
   `kernel-batch-1 @ 5bc9940`, range `a4312e8..5bc9940`). Follow its attack surfaces, its required
   evidence and its KNOWN-items list (DeepSeek findings F-2A-01..F-2A-06: verify closure, do not
   rediscover, do not waive).
3. Check the baseline: `git rev-parse HEAD` is the frozen head; the candidate code must be identical
   to `5bc9940` (`git diff 5bc9940..HEAD --stat` should show only docs).
4. Deliverable: `docs/reviews/2026-09-28-sol-wave2a-certification.md`, <= 250 lines. Header with:
   reviewed commit SHA and tree status; reviewer model `GPT-5.6 Sol` (confirm from your own client
   log/rollout, not by self-report); date UTC; scope; `Mode: CERTIFYING`;
   `Receipt-Owner: <your session owner>`; and ONE explicit verdict token:
   `PASS` / `FAIL` / `BLOCKED` / `RECOMMENDATION`. Provide per-item verdicts for every
   implementation item covered by the audit prompt, and at least one reproduction per FAIL claim -
   a FAIL without a reproduction is advisory and cannot block (PROTO-DEC-0038).
5. Journal entry with the five labels; include the model, effort and usage (from the codex client
   output/rollout; otherwise `not-exposed`). Then
   `node .ai/bin/protocol-handoff.cjs record --quick --owner <owner>` and
   `node .ai/bin/protocol-handoff.cjs verify` - it must print "matches".
6. Commit with explicit paths (your review and journal) on this branch; do NOT push. Read-only on
   the candidate: no code, no tests, no fixes, no decisions.
