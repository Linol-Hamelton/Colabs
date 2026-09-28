# Launch: task:roadmap-2a-fix-review (DeepSeek reviewer; fix range 5ce5219..149b19a)

Per PROTO-DEC-0098 item 3. You are a separate DeepSeek session (route `deepseek-native`,
selection=owner). Work in the worktree `D:\Colabs\.ai\runtime\kb1` (branch `kernel-batch-1`).

## Scope (only this)

The round-2 fix commits:
- `6364322` - W5 test hermeticity (new failing test first; the test-only
  `PROTOCOL_JOURNAL_IMPORT_ROOT` override; T6/T20-T26/T28/T30 bindings);
- `b26b177` - S-7 bound of four (instrumented spawn probe; the two `own` scenarios through the pool);
- `149b19a` - the fix-round journal (`mistral-e5b0a7370dee2904`).
Diff: `git diff 5ce5219..149b19a`. Review against Sol's round-1 FAIL findings
(`docs/reviews/2026-09-28-sol-wave2a-certification.md`, items B and E) and MiMo's RECOMMENDATION
(`docs/reviews/2026-09-28-mimo-wave2a-certification.md`). Do not edit those reports.

## Attack surfaces (evidence = commands and artifacts)

1. W5 hermeticity:
   - is the new W5 test genuinely new and asserting the temp-root binding (read the diff)? Reproduce
     the guard: no `gemini-0123456789abcdef` path may appear in the real tree during a suite run;
     run `node --test tests/dispatch.test.cjs`, watch `git status --porcelain` during and after, and
     after a killed run;
   - `PROTOCOL_JOURNAL_IMPORT_ROOT`: confirm the override is test-only - `journalImportRoot(repoRoot)`
     must return `repoRoot` when the env is unset; check no other journal-import writer bypasses the
     helper.
2. S-7 bound:
   - rebuild the instrumented probe from the Sol report's item E one-liner; confirm
     `PROBE_MAX_ONE=4` on the fixed tree;
   - confirm from the diff that both `own` watchdog scenarios go through the bounded pool and every
     terminal path releases its slot exactly once; run `launch-test.cjs --pure` (expect 55 PASS) and
     one full instrumented run (expect all scenarios PASS).
3. Hygiene: one commit per fix; explicit paths; no force/rebase/amend; `.ps1` ASCII; UTF-8/LF; the
   journal's claims spot-check against the tree (2-3 claims).
4. Regression risk: the env override and the pool change must not alter production semantics; name
   any behaviour that could differ outside tests.

## Deliverable

`docs/reviews/2026-09-28-deepseek-2a-fix-review.md` (<= 250 lines): header (reviewed SHA `149b19a`,
tree status, reviewer model `DeepSeek Flash`, provider `deepseek` confirmed from your own call log,
date UTC, `Mode: ADVISORY` - a fix review, not certification - and one verdict), per-item verdicts
(PASS/FAIL/BLOCKED/RECOMMENDATION; every FAIL carries at least one reproduction), the closure state
of Sol's B/E findings, and any new findings with reproductions.

## Session rules

- Separate session, own journal: `node .ai/bin/protocol-session.cjs start --agent deepseek`; five
  labels; include the model, effort and the client usage/cost from your own run (the kilo JSON
  `step_finish` exposes `tokens` and `cost`); then `record --quick`.
- Commit your review and journal with explicit paths on `kernel-batch-1`; do NOT push.
- Review only: no code, no fixes, no decisions; do not edit the MiMo/Sol reports.
