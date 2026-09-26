# Launch: task:ownerideas-r3-clean-gemini

- Frame: `task:ownerideas-r3-clean-gemini` (parent program: `ownerideas-revision`). This role holds
  for this frame only.
- Role: cleanup executor — execute the approved OwnerIdeas cleanup. No architectural judgement; the
  approval and the exact commands are fixed.
- Agent name for the protocol: `gemini`. Model and route (frozen, do not change): Gemini 3.8 Flash,
  effort high, through agy.
- Read first: `docs/research/2026-09-26-ownerideas-revision/prompts/COMMON.md`, then
  `docs/research/2026-09-26-ownerideas-revision/prompts/CLEANUP.md`, then
  `docs/research/2026-09-26-ownerideas-revision/round3/RESOLUTION-CLAUDE.md` sections 5 and 9.
- Output (exactly one file): `docs/research/2026-09-26-ownerideas-revision/round4/CLEANUP-GEMINI.md`.
- No commits, tags, pushes or branches. The operator commits.
