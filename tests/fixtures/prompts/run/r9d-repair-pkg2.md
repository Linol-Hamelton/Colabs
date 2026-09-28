# Launch: task:ownerideas-r9d-repair-pkg2

- Frame: `task:ownerideas-r9d-repair-pkg2` (parent program: `ownerideas-revision`). This role holds
  for this frame only.
- Role: stage-10 targeted repair (Gemini) - fix only the two confirmed PKG-2 findings of the MiMo
  certification round 1 (`round8/CERT-MIMO.md`, verdict FAIL) on CANDIDATE `f3ab4b8`.
- Agent name for the protocol: `gemini`. Model and route (frozen): Gemini 3.8 Flash, effort high,
  through agy.
- Read first: `docs/research/2026-09-26-ownerideas-revision/prompts/COMMON.md`, then
  `docs/research/2026-09-26-ownerideas-revision/prompts/REPAIR.md` (reproduce first; minimal fix;
  refute with evidence if a reproduction fails; no redesign; no commits), then
  `round8/CERT-MIMO.md` section "PKG-2 FAIL" and `round6/packages/PKG-2.md` (AC-1, S3 pins).

## Findings to fix (both reproduced by the operator)

- **F-PKG2-1** - `tests/fixtures/runrecord/golden.jsonl` (and `pattern-test.jsonl`) pins are
  invented: the `head` is not a git object (`git cat-file -t` fails) and `launchSha256` does not
  match the launch file at that commit; the tests never verify pins against the repository. Fix:
  compute `head` and `launchSha256` from the real repository objects (the method must match what
  `protocol-runrecord.cjs` itself computes), regenerate the fixtures with real values, and make
  `tests/runrecord.test.cjs` verify the pins against the repository (read the object, hash it,
  compare) instead of accepting literals.
- **F-PKG2-2** - the golden DONE record required by AC-1 is missing: `golden.jsonl` holds only the
  FAILED two-attempt record. Add the golden valid record (one fresh attempt, state DONE, every
  completion field true) in addition - keep the real-past-failure record as well.
- S3 in `PKG-2.md` defines the expected pins; follow it. If a pin cannot be derived from the
  repository, that is a STOP and a finding, not a literal.

## Output

- `docs/research/2026-09-26-ownerideas-revision/round9/REPAIR-PKG2-GEMINI.md`: one row per finding
  (reproduction before, change, reproduction after), the validation commands with real outputs
  (`node --test tests/runrecord.test.cjs`; `node .ai/bin/protocol-runrecord.cjs validate tests/fixtures/runrecord/golden.jsonl`),
  and the list of files touched.
- No commits, tags, pushes or branches; no writes outside PKG-2's allowed paths and your
  report/journal. Journal first write MUST contain the `Launch:` and `Orientation:` lines with the
  frame id.
