# Launch: task:ownerideas-r9g-freeze-candidate (manual, operator gate)

- Frame: `task:ownerideas-r9g-freeze-candidate`. Route: `manual` - the operator runs this step and
  marks it accepted; nothing is launched.
- Purpose: freeze the round-3 CANDIDATE for certification. The certifiers (`r8e-cert-*`) need this
  slot so they cannot start before the freeze commit exists.

## Operator steps (owner directive 2026-09-27, section 2, with the freeze-check addendum)

1. Confirm `r9e-repair-pkg2` and `r9f-repair-usage` are DONE and their reports exist:
   `round9/REPAIR-PKG2-R3-GEMINI.md`, `round9/REPAIR-USAGE-GEMINI.md`.
1b. **Freeze check (owner addendum 2026-09-27, corrected the same day; run BEFORE the CANDIDATE
   commit).** Run
   `git status --short -- .ai/bin tests docs/specs .ai/docs protocol-manifest.json`; the expected
   output is exactly:
   - `M  .ai/bin/protocol-dispatch.cjs`
   - `M  tests/dispatch.test.cjs`
   - `?? tests/fixtures/dispatch/usage/...`
   (the r9e files are already committed in `9d3f84d`).
   - **Transient `t20-/t24-/...-launch.md`** are pre-existing PKG-1 test design: the dispatch tests
     write them into `tests/fixtures/dispatch/` and delete them at the end. They are NOT an r9f
     defect and NOT a reason to send r9f back.
   - **Freeze only when r9f is DONE and no test process is running** (the agy pid has exited). Run
     the local lane yourself, **sequentially**, never in parallel with another test run.
   - A leftover untracked `*-launch.md` after that is junk from an interrupted run: delete it,
     rerun the lane, check again.
   - Confirm `tests/fixtures/dispatch/hang-launch.md` shows no ` M`; if it is modified, restore it
     with `git checkout -- tests/fixtures/dispatch/hang-launch.md` and rerun the lane.
   - Send r9f back only if its own work is missing: the `dispatch.test.cjs` changes, the usage
     fixtures, or passing T27-T29.
   - Log for **stage 12**, not for this round: the dispatch tests are not hermetic; they write into
     the tracked tree (pre-existing PKG-1 design; already covered by the stage-9 F-4 finding and the
     r9c hygiene repair, which did not fully close the `*-launch.md` class).
   The freeze commit carries only the r9f files; the agreed message names both repairs because the
   CANDIDATE diff `b8781ca..CANDIDATE` contains both.
2. Run the full local lane on the combined tree:
   - `powershell -ExecutionPolicy Bypass -File .\validate-protocol.ps1`;
   - `powershell -ExecutionPolicy Bypass -File .\test-protocol.ps1` (>= 416 tests plus the new ones,
     all pass);
   - `git status --porcelain` clean after the runs (the runner's own `USAGE.md` aside);
   - `node .ai/bin/protocol-handoff.cjs record --owner <operator>` in FULL mode (not `--quick`),
     then `verify`.
3. One commit carrying both repairs, message:
   `fix(pkg-1,pkg-2): round-3 repairs - PKG-2 residuals R2-1..R2-4; usage and cost per attempt (PKG-1 S8, PKG-3 S8, 0075 item 9)`.
   Push.
4. That commit is the new CANDIDATE. Announce its full SHA. Nothing touching the normative tree may
   be committed after it; later checkpoints carry journals and reports only.
5. Mark this slot accepted: `run-chain.cjs <dispatch> accept r9g-freeze-candidate "<freeze commit SHA + lane results>"`.
