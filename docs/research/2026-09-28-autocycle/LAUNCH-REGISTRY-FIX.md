# Launch: task:fix-registry-fixture (vibe, Mistral Medium 3.5; one test file)

Context: the merged-tree suite (2026-09-28) failed 2 tests in `tests/registry.test.cjs` because tests
6 and 7 hardcode the synthetic block id `PROTO-DEC-0099`, which the live `.ai/DECISIONS.md` now
contains (the fixture-based validator resolves the real corpus). Owner directive 2026-09-28: fix the
two tests on v2.0.0 in a separate commit before the 2A merge. This worktree is `.ai/runtime/fixreg`
(branch `fix-registry-fixture`, cut from `v2.0.0` `ad14a14`).

## Task (exactly this; nothing else)

In `tests/registry.test.cjs`, tests 6 and 7 ("registry check 6..." and "registry check 7..."):

- compute the synthetic id as `max(PROTO-DEC-NNNN present in validDecisionsContent) + 1`,
  zero-padded to 4 digits (the value is a variable, e.g. `nextDecId`);
- use that variable in the synthetic decision block, in the appended REGISTRY row, and in the
  `assert.match` pattern - nowhere else;
- change nothing else: not the validator, not other tests, not `.ai/DECISIONS.md` or
  `docs/decisions/REGISTRY.md`; do not disable or weaken the tests.

## Verification (required)

1. FIRST reproduce on the current tree:
   `node --test --test-name-pattern "registry check 6|registry check 7" tests/registry.test.cjs`
   -> 2 fail; capture the output (the FAIL lines mention the real id collision).
2. Apply the fix; `node --test tests/registry.test.cjs` -> **8/8 PASS**; capture the output.
3. Put both outputs into your journal entry (five labels); model honestly: requested `glm-5-3`,
   ran `mistral-medium-3.5` while the vibe log shows "falling back" (check it); then
   `node .ai/bin/protocol-handoff.cjs record --quick --owner <your session>`.
4. Commit with explicit paths (`tests/registry.test.cjs` and your journal) on this branch; if `git`
   is denied, stage and commit via the `node -e` wrapper as in earlier sessions; do NOT push.
