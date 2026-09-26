# Launch: task:ownerideas-r9c-repair-hygiene

- Frame: `task:ownerideas-r9c-repair-hygiene` (parent program: `ownerideas-revision`). This role
  holds for this frame only.
- Role: stage-10 targeted repair (Gemini) - test hygiene and the disputed certification items.
- Agent name for the protocol: `gemini`. Model and route (frozen): Gemini 3.8 Flash, effort high,
  through agy.
- Read first: `docs/research/2026-09-26-ownerideas-revision/prompts/COMMON.md`, then
  `docs/research/2026-09-26-ownerideas-revision/prompts/REPAIR.md` (rules: reproduce first, minimal
  fixes, refute with evidence, no redesign, no commits).

## Confirmed findings to fix (reproduced by the operator, Windows, 2026-09-26)

1. **Tests pollute tracked kernel state.** Running `node --test tests/dispatch.test.cjs` adds
   lines to tracked `.ai/SIGNALS.md` (124 -> 136) and `docs/ops/RUNS.jsonl` (277 -> 293). Tests
   must never write tracked registry/log files: isolate the paths (temp dir, or a test-only env
   override), and clean up the pollution already present in the working tree (revert the added
   test-generated lines without touching legitimate session records; if ambiguous, reset the two
   files to HEAD and say so in the report).
2. **Fixture lifecycle.** After a run, `tests/fixtures/dispatch/hang-launch.md` was left deleted
   (restored by the operator with `git checkout`); `t23-launch.md` was deleted mid-run and
   recreated. The test suite must guarantee fixture restore on success and on failure (try/finally
   or per-test temp copies), and must not depend on repo-state mutation.
3. **Disputed MiMo certification items** (reproduce each; fix confirmed, refute with evidence):
   `round8/CERT-MIMO.md` - PKG-1 (F1-P1, F2-P1, F3-P1; AC-16: `protocol-scope.cjs`/
   `protocol-verdict.cjs` unnamed), PKG-2 (AC-10 only), PKG-3 (F1-P3 flake; AC-7, AC-14).
   Re-run `node --test tests/dispatch.test.cjs`, `tests/resolver.test.cjs`,
   `tests/runrecord.test.cjs` after isolation and record the results.
4. **Resolver AC-5 platform note.** AC-5 passes on Windows (`tests/resolver.test.cjs` 7/7) but the
   owner observed a failure on Linux. Investigate platform-dependent causes (line endings, path
   separators, ordering, environment). If a real defect is found, fix it; otherwise document the
   Linux reproduction conditions needed and make the test deterministic where possible.

## Output

- `docs/research/2026-09-26-ownerideas-revision/round9/REPAIR-HYGIENE-GEMINI.md`: one row per
  finding (reproduction before, change, reproduction after or refutation), validation commands with
  real outputs, and a list of tracked files touched by the fix.
- No commits, tags, pushes or branches; no writes outside the packages' allowed paths, the fixtures
  and your report/journal. Journal first write MUST contain the `Launch:` and `Orientation:` lines
  with the frame id.
