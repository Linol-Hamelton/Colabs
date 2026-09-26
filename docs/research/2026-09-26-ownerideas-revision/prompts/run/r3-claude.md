# Launch: task:ownerideas-r3-claude

- Frame: `task:ownerideas-r3-claude` (parent program: `ownerideas-revision`). This role holds for
  this frame only.
- Role: resolver — the Claude resolution over the frozen OwnerIdeas revision corpus. Your own
  resolution only; the outcome of this frame is the single output file below.
- Agent name for the protocol: `claude`. Model and route (frozen, do not change): Claude Opus 5.5,
  effort xhigh, through the claude CLI.
- Read first: `docs/research/2026-09-26-ownerideas-revision/prompts/COMMON.md`, then
  `docs/research/2026-09-26-ownerideas-revision/prompts/RESOLUTION.md`. The frozen input list is
  `docs/research/2026-09-26-ownerideas-revision/round3/CORPUS.txt`; verify every hash in it.
- Output (exactly one file):
  `docs/research/2026-09-26-ownerideas-revision/round3/RESOLUTION-CLAUDE.md`.
- You may read every file listed in `CORPUS.txt`. Delete, archive or edit nothing; the cleanup is
  executed later by another frame that must be able to follow your list mechanically.
