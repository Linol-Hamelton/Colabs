# Launch: task:ownerideas-r9e-repair-pkg2-r3

- Frame: `task:ownerideas-r9e-repair-pkg2-r3` (parent program: `ownerideas-revision`). This role
  holds for this frame only.
- Role: stage-10 targeted repair round 3 (Gemini) - fix only the residual PKG-2 findings of the
  MiMo round-2 certification (`round8/CERT-MIMO-PKG2-R2.md`) on the CANDIDATE `b8781ca`. Note: the
  operator committed `b8db360` removing a transient `tests/fixtures/dispatch/t26-launch.md` that a
  checkpoint had swept in; the normative tree equals `b8781ca` again (verify with
  `git diff --stat b8781ca HEAD -- .ai/bin tests docs/specs .ai/docs .ai/SIGNALS.md docs/ops protocol-manifest.json`).
- Agent name for the protocol: `gemini`. Model and route (frozen): Gemini 3.8 Flash, effort high,
  through agy.
- Read first: `docs/research/2026-09-26-ownerideas-revision/prompts/COMMON.md`, then
  `prompts/REPAIR.md` (reproduce first; minimal fix; refute with evidence; no redesign; no commits),
  then `round8/CERT-MIMO-PKG2-R2.md` ("Residual findings": F-PKG2-R2-1..R2-4) and
  `round6/packages/PKG-2.md` (S4 column names, S5 CLI rows, AC-7, AC-9).

## Findings (all four from the MiMo round-2 report; reproduce each first)

- **F-PKG2-R2-1** (AC-7, S4): render headers use `Model` / `Effort`; S4 names `Model ran` and
  `Effort used`. Align the renderer with S4 (or refute with the S4 text).
- **F-PKG2-R2-2** (AC-9): as reported by MiMo for the CLI output/pattern expectations (read the
  report for its exact reproduction).
- **F-PKG2-R2-3** (AC-7): T13 asserts only `includes(...)`; add a golden Markdown equality check
  against a committed golden table (byte- or line-equal).
- **F-PKG2-R2-4** (AC-9): no test captures CLI stdout against `^[A-Z][A-Z_]*( |$)`; the no-command
  `printUsage` help body would fail that pattern if checked - add the CLI-stdout pattern test and
  make `printUsage` conform or scope the pattern per the package.

## Output

- `docs/research/2026-09-26-ownerideas-revision/round9/REPAIR-PKG2-R3-GEMINI.md`: one row per
  finding (reproduction before, change, reproduction after or refutation), validation commands with
  real output (`node --test tests/runrecord.test.cjs`, the CLI checks), files touched.
- No commits, tags, pushes or branches; no writes outside PKG-2's allowed paths and your
  report/journal. Journal first write MUST contain the `Launch:` and `Orientation:` lines.
