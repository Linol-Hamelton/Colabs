# Launch: task:ownerideas-r9c-repair-hygiene

- Frame: `task:ownerideas-r9c-repair-hygiene` (parent program: `ownerideas-revision`). This role
  holds for this frame only.
- Role: stage-10 targeted repair (Gemini) - test hygiene and the disputed certification items.
- Agent name for the protocol: `gemini`. Model and route (frozen): Gemini 3.8 Flash, effort high,
  through agy.
- Read first: `docs/research/2026-09-26-ownerideas-revision/prompts/COMMON.md`, then
  `docs/research/2026-09-26-ownerideas-revision/prompts/REPAIR.md` (rules: reproduce first, minimal
  fixes, refute with evidence, no redesign, no commits).

## Confirmed findings to fix (reproduced by the operator and the cloud review of 1fd27ce)

1. **Tests pollute tracked kernel state.** Running `node --test tests/dispatch.test.cjs` adds
   lines to tracked `.ai/SIGNALS.md` (124 -> 136) and `docs/ops/RUNS.jsonl` (277 -> 293). Cloud
   review of 1fd27ce: in `docs/ops/RUNS.jsonl` **all lines are test rows** (`client: fake`,
   `model: test`); no real runs exist there. In `.ai/SIGNALS.md`, **8 of 103 signals are test
   signals** (`fake:test`, including `sig-20260926-004..008`); **keep the other 95**.
   - Cleanup, owner-approved: `docs/ops/RUNS.jsonl` - clear it entirely; `.ai/SIGNALS.md` -
     delete the test lines in one commit marked "deletion of test artifacts, not history"
     (option (a)); leave the 95 real signals untouched.
   - Fix the cause: tests must write only into a temporary directory (override the journal/registry
     paths for tests; a test-only env override is fine).
2. **Fixture lifecycle.** After a run, `tests/fixtures/dispatch/hang-launch.md` was left deleted;
   restore it. `t23-launch.md` was deleted mid-run and recreated. The test suite must guarantee
   fixture restore on success and on failure (try/finally or per-test temp copies), and must not
   depend on repo-state mutation.
2b. **Guard test (cloud addition).** Add a test that runs after the suite and asserts that
   `git status --porcelain` shows no changes to tracked files caused by the tests (a temp-dir
   isolation check). It must fail if any test touches tracked state.
3. **Disputed MiMo certification items** (reproduce each; fix confirmed, refute with evidence):
   `round8/CERT-MIMO.md` - PKG-1 (F1-P1, F2-P1, F3-P1; AC-16: `protocol-scope.cjs`/
   `protocol-verdict.cjs` unnamed), PKG-2 (AC-10 only), PKG-3 (F1-P3 flake; AC-7, AC-14).
   Re-run `node --test tests/dispatch.test.cjs`, `tests/resolver.test.cjs`,
   `tests/runrecord.test.cjs` after isolation and record the results.
4. **Resolver AC-5 platform note (cloud-confirmed).** AC-5 passes on Windows (`tests/resolver.test.cjs`
   7/7) and fails on Linux: record it as a **portability defect** - the test depends on its
   environment. It is not a blocker now. Investigate platform-dependent causes (line endings, path
   separators, ordering, temp-dir behaviour) and make the test deterministic where possible;
   document the Linux reproduction conditions.

## After this repair

The certifications of PKG-1, PKG-2 and PKG-5 must be re-run on the repaired (clean) tree: their
current reports were produced on a polluted one. The operator resets the cert slots after this
slot closes.

## Output

- `docs/research/2026-09-26-ownerideas-revision/round9/REPAIR-HYGIENE-GEMINI.md`: one row per
  finding (reproduction before, change, reproduction after or refutation), validation commands with
  real outputs, and a list of tracked files touched by the fix.
- No commits, tags, pushes or branches; no writes outside the packages' allowed paths, the fixtures
  and your report/journal. Journal first write MUST contain the `Launch:` and `Orientation:` lines
  with the frame id.
