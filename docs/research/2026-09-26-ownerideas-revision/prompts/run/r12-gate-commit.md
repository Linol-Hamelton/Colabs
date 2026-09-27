# Launch: task:ownerideas-r12-gate-commit (manual, operator gate)

- Frame: `task:ownerideas-r12-gate-commit`. Route: `manual` - the operator runs this step and marks
  it accepted; nothing is launched.
- Purpose: gate `r12-final-deepseek` so it starts only after the operator committed and pushed the
  round-3 artifacts (owner directive 2026-09-27, stage-12 restore).

## Operator steps

1. Confirm `r9-verify-codex` is DONE and `round9/VERIFY-SOL.md` exists with a single verdict token.
2. Prune journals if over the cap; commit ONLY our files by explicit paths (round8/CERT-*-PKG2-R3.md,
   round9/VERIFY-SOL.md, the kimi/mimo/codex/kilo journals, USAGE.md, ARCHIVE.md if it carries our
   block) after the owner's fetch/diff procedure; push (no force/rebase/amend).
3. Confirm no test process is running.
4. `run-chain.cjs <dispatch> accept r12-gate-commit "<verification verdict + commit SHA + push result>"`.
