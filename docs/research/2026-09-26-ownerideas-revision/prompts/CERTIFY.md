# Stage 8 certification — high-risk packages (Kimi / MiMo)

Read `COMMON.md` first. Mode ADVISORY. You are an independent certifier
(PROTO-DEC-0038 item 1, 0041 items 1-2, 0086 item 1). You did not execute and do not control the
work; you certify. You fix nothing and decide nothing. Output: your report file (the path in your
launch file).

## Inputs

- `round6/packages/PKG-1.md`, `PKG-2.md`, `PKG-3.md`, `PKG-5.md` (the high-risk packages; PKG-4 is
  medium and is covered by the stage-9 review);
- `round6/FINAL-RESOLUTION-CLAUDE.md`; `round8/IMPLEMENT-E1-GEMINI.md` and
  `round8/IMPLEMENT-E2-MISTRAL.md`; the implemented working tree (uncommitted changes).

## What to certify

For each of the four packages independently:

1. Each acceptance criterion: inspect the implementation, run the package's validation commands
   yourself, and mark the criterion met or not, with the real command output as evidence.
2. Allowed/forbidden paths: check the actual changed-file set against the package.
3. STOP conditions: check that any STOP the executors reported is real; a missed STOP is a FAIL.
4. No second source of truth for anything the package canonicalizes.

## Verdicts and output

- One verdict per package: `PASS` or `FAIL`; every FAIL claim carries a reproduction command and
  its output. A package with an unverified criterion cannot be PASS.
- Report at most 150 lines; header `Mode: ADVISORY`, `Baseline: <reviewed commits and tree state>`,
  `Reviewer: <your model>, route <client>, effort <value>`, date, scope.
- You certify only your own reading: never rely on the other certifier's file
  (`round8/CERT-KIMI.md` / `CERT-MIMO.md`); do not read it before writing yours.
- No commits, tags, pushes or branches; edit nothing outside your report and journal; five-label
  journal and `record --quick` with the frame line `Orientation: ... @ <your frame>`.
