# Launch: task:ownerideas-r12-final-deepseek

- Frame: `task:ownerideas-r12-final-deepseek` (parent program: `ownerideas-revision`). This role
  holds for this frame only. You produce the stage-12 final technical verdict; the owner closes
  with Claude.
- Agent name for the protocol: `deepseek`. Model and route (frozen): DeepSeek 4.1 Flash through
  `kilo run -m deepseek/deepseek-flash` (same route as the stage-9 review).
- Read first: `docs/research/2026-09-26-ownerideas-revision/prompts/COMMON.md`; then
  `DISPATCH-OWNER.md` section "Этап 12"; then `round9/VERIFY-SOL.md`, `round8/CERT-KIMI-PKG2-R3.md`,
  `round8/CERT-MIMO-PKG2-R3.md`, `round8/CERT-KIMI-PKG2-R2.md`, `round8/CERT-MIMO-PKG2-R2.md`,
  `round8/IMPLEMENTATION-REVIEW-DEEPSEEK.md`, the repair reports in `round9/` (PKG2-R3, USAGE,
  HYGIENE, PKG5), `round6/FINAL-RESOLUTION-CLAUDE.md`, `round6/packages/PKG-1..5.md`,
  `.ai/DECISIONS.md` PROTO-DEC-0079..0086, `docs/research/FRAMES.md`.

## What to verify and report

1. The original findings and their repairs: the stage-9 review F-1..F-5 and the certifier findings
   across rounds 1-3 - each resolved (reproduce), refuted, or still open.
2. The Mistral/certification/verification record: rounds 1-3 of Kimi and MiMo and `VERIFY-SOL.md`;
   state whether the final candidate survived independent verification.
3. Tests and validators: run them YOURSELF in your own git worktree at the current HEAD
   (`git worktree add .ai/runtime/r12-deepseek HEAD`), sequentially - `validate-protocol.ps1`,
   `test-protocol.ps1`, the package tests (`tests/dispatch.test.cjs`, `tests/resolver.test.cjs`,
   `tests/runrecord.test.cjs`, `tests/signals.test.cjs`), then a FULL
   `node .ai/bin/protocol-handoff.cjs record --owner <your owner>` (not `--quick`) and `verify`;
   remove the worktree at the end. No other test run may execute in parallel.
4. Integration and documentation: the packages work together; docs match the implementation; no
   duplicate sources of truth.
5. Closure criteria: no dangling references to deleted or archived OwnerIdeas (use
   `docs/research/archive/INDEX.md` and grep the active corpus); canonical destinations exist for
   the current ideas; approved research candidates are registered in FRAMES.md; no second active
   source of truth for an implemented decision.

## Known items - list and classify, do NOT fix

- Codex usage parser under-count: `"tokens used: 10 644"` parses as `10` (reproduce it; expected
  behavior per PKG-1 S8 / `codex-tokens` parser).
- Dispatch tests are not hermetic: transient `*-launch.md` files, `hang-launch.md` rewrites, and
  the cross-worktree interference seen in MiMo's first full record.
- STOP-7: FRAMES.md F-01 is CLOSED without a receipt (R-L0-22.56/67).
- STOP-8 owner decisions: OQ-1 (A-11/DIG), OQ-2 (A-1 design block), OQ-3 (stall threshold), the
  F-02 gate, the DeepSeek identity mapping.
  These are **OPEN OWNER DECISIONS**, not failures.

## Output

- `docs/research/2026-09-26-ownerideas-revision/round9/FINAL-DEEPSEEK.md`, at most 250 lines;
  header `Mode: ADVISORY`, the current HEAD SHA, `Reviewer: DeepSeek 4.1 Flash, route kilo`, date,
  scope, and one verdict line: `Verdict: PASS | FAIL`. Every FAIL claim carries a reproduction
  command and its output. Owner items are listed under `OPEN OWNER DECISIONS`.
- No commits, tags, pushes or branches; edit nothing outside that file, your worktree and your
  journal; five-label journal entry and the full `record` above; journal first write MUST contain
  the `Launch:` and `Orientation:` lines with the frame id.
