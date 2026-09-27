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

## Review findings (stage-9 DeepSeek, `round8/IMPLEMENTATION-REVIEW-DEEPSEEK.md`, verdict FINDINGS - 5 BLOCKING)

Reproduce each; fix the confirmed ones minimally; refute with evidence if a reproduction fails.

- **F-1 BLOCKING** - the PKG-5 adversarial audit prompt does not exist (the package requires it).
- **F-2 BLOCKING** - the run-record `class` enum contradicts `run-record.schema.md` and
  PROTO-DEC-0075 item 4.
- **F-3 BLOCKING** - `docs/specs/bin-output-schema.md` lists twelve classes, not the fifteen of
  PROTO-DEC-0075 item 4.
- **F-4 BLOCKING** - the dispatch tests are not hermetic; they write into the canonical store
  (same root cause as finding 1 above).
- **F-5 BLOCKING** - registry freshness / AC-15 not reproducible: `vibe` is pinned to a stale
  version in the client registry.
- Related RECOMMENDATION: the registry at `:40` names `protocol-telemetry.cjs` and
  `protocol-audit.cjs` (check whether they exist or should not be named).

## Output

- `docs/research/2026-09-26-ownerideas-revision/round9/REPAIR-HYGIENE-GEMINI.md`: one row per
  finding (reproduction before, change, reproduction after or refutation), validation commands with
  real outputs, and a list of tracked files touched by the fix.
- **Resume rule (owner instruction 2026-09-27; earlier attempts were killed by the agy 429 quota).**
  Do NOT redo work that is already done: before changing anything, inspect the working tree and any
  partial `round9/REPAIR-HYGIENE-GEMINI.md`; treat already-applied fixes and already-clean files as
  complete, finish only the remaining findings, and append your rows to the existing report instead
  of rewriting it from scratch.
- This is the last automatic retry. If the agy quota kills it again, the operator stops and asks the
  owner about changing the executor; do not switch models yourself.
- No commits, tags, pushes or branches; no writes outside the packages' allowed paths, the fixtures
  and your report/journal. Journal first write MUST contain the `Launch:` and `Orientation:` lines
  with the frame id.
