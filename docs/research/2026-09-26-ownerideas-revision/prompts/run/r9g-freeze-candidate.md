# Launch: task:ownerideas-r9g-freeze-candidate (manual, operator gate)

- Frame: `task:ownerideas-r9g-freeze-candidate`. Route: `manual` - the operator runs this step and
  marks it accepted; nothing is launched.
- Purpose: freeze the round-3 CANDIDATE for certification. The certifiers (`r8e-cert-*`) need this
  slot so they cannot start before the freeze commit exists.

## Operator steps (owner directive 2026-09-27, section 2)

1. Confirm `r9e-repair-pkg2` and `r9f-repair-usage` are DONE and their reports exist:
   `round9/REPAIR-PKG2-R3-GEMINI.md`, `round9/REPAIR-USAGE-GEMINI.md`.
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
