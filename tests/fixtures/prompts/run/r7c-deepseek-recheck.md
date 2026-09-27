# Launch: task:ownerideas-r7c-deepseek-recheck

- Frame: `task:ownerideas-r7c-deepseek-recheck` (parent program: `ownerideas-revision`). This role
  holds for this frame only.
- Role: stage-7 re-check (DeepSeek). Verify that the fixes for the BLOCKING findings of
  `round7/PRE-CHECK-DEEPSEEK.md` now hold, with reproductions; check the five packages again for
  the same classes of defect (stale paths, invented fixtures, same-wave path collisions,
  non-verifiable acceptance criteria). You decide nothing.
- Agent name for the protocol: `deepseek`. Model and route (frozen): DeepSeek 4.1 Flash through
  `kilo run -m deepseek/deepseek-flash`.
- Read first: `docs/research/2026-09-26-ownerideas-revision/prompts/COMMON.md`, then
  `round7/PRE-CHECK-DEEPSEEK.md`, `round7/FIX-CLAUDE.md`, and the corrected
  `round6/FINAL-RESOLUTION-CLAUDE.md` / `round6/packages/PKG-1..5.md`.
- Output (exactly one file): `docs/research/2026-09-26-ownerideas-revision/round7/RECHECK-DEEPSEEK.md`
  - header `Mode: ADVISORY`, `Baseline: <reviewed commits>`, `Reviewer: DeepSeek 4.1 Flash, route
  kilo, effort max`, date, scope; one verdict `PASS` or `BLOCKING`; each BLOCKING finding with a
  reproduction; at most 120 lines.
- No commits, tags, pushes or branches; no edits outside that file and your journal.
