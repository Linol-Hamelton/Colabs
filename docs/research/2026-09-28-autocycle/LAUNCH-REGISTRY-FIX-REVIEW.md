# Launch: task:registry-fix-review (DeepSeek reviewer; only the registry fix diff)

Per the owner's item 3 (2026-09-28): one DeepSeek reviewer, the native route, scoped to this diff
only (low blast radius, a test file). Work in the worktree `D:\Colabs\.ai\runtime\fixreg` (branch
`fix-registry-fixture`).

## Scope (only this)

`git diff ad14a14..0e0d6a7` - the fix `0e0d6a7` to `tests/registry.test.cjs` (checks 6 and 7 now
derive `nextDecId = max(PROTO-DEC-NNNN in validDecisionsContent) + 1`, padded to four digits, used
in the synthetic block, the registry row and `assert.match`), plus the fix journal
`.ai/worklog/mistral-31c0a7ec3787702f.md`. Nothing else.

## What to verify

1. The reproduction claim: on the pre-fix tree the two tests fail because the fixture's validator
   resolves the REAL corpus and now finds a real `PROTO-DEC-0099`; the journal cites `[FAIL]
   duplicate decision: PROTO-DEC-0099` and `[FAIL] PROTO-DEC-0099 was edited after it was written`.
   Re-run the scratch repro `.ai/runtime/mistral-repro/registry-prefix.test.cjs` (gitignored) or
   reproduce your own way.
2. The fix is minimal and correct: only `tests/registry.test.cjs` changed; the computed id is used
   everywhere the hardcoded one was and nowhere else; no test is disabled or weakened; the
   derivation handles the live corpus's current max (0103 -> 0104) and stays correct if the corpus
   grows (check the regex covers four-digit ids only, states what happens at 9999).
3. Green on the fixed tree: `node --test tests/registry.test.cjs` -> 8/8 PASS.
4. Regression risk: the computed id must not collide with `expectedEntries` (registry check 1) or
   with any other synthetic content of the file's other tests.

## Deliverable

`docs/reviews/2026-09-28-deepseek-registry-fix-review.md` (<= 250 lines): header (reviewed SHA
`0e0d6a7`, tree status, reviewer model `DeepSeek Flash` + provider from your own call log, date UTC,
`Mode: ADVISORY` - a fix review, not certification - one verdict), per-item verdicts
(PASS/FAIL/BLOCKED/RECOMMENDATION; every FAIL carries a reproduction), and any new findings.

## Session rules

- `node .ai/bin/protocol-session.cjs start --agent deepseek`; journal with the five labels
  (model/effort/usage - the kilo JSON `step_finish` exposes tokens and cost); `record --quick`.
- Commit your review and journal with explicit paths on this branch; do NOT push.
- Review only: no code, no fixes; do not edit the fix journal or any other session's file.
