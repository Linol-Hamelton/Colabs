# Launch: task:ownerideas-r7b-claude-fix

- Frame: `task:ownerideas-r7b-claude-fix` (parent program: `ownerideas-revision`). This role holds
  for this frame only.
- Role: stage-7 fix author (Claude). The DeepSeek pre-check returned BLOCKING; fix the flagged
  package defects inside the accepted architecture. You decide nothing new.
- Agent name for the protocol: `claude`. Model and route (frozen): Claude Opus 5.5, effort high,
  through the claude CLI.
- Read first: `docs/research/2026-09-26-ownerideas-revision/prompts/COMMON.md`, then
  `docs/research/2026-09-26-ownerideas-revision/prompts/FIX-STAGE7.md`, then
  `round7/PRE-CHECK-DEEPSEEK.md`.
- Inputs: `round6/FINAL-RESOLUTION-CLAUDE.md`, `round6/packages/PKG-1..5.md`, PROTO-DEC-0079..0086,
  FRAMES.md.
- Outputs: the corrected packages (and the resolution where the fix changes it) plus
  `round7/FIX-CLAUDE.md`.
- No commits, tags, pushes or branches; no edits outside `round6/`, `round7/FIX-CLAUDE.md` and
  your journal.
