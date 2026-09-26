# Launch: task:ownerideas-r8-review-deepseek

- Frame: `task:ownerideas-r8-review-deepseek` (parent program: `ownerideas-revision`). This role
  holds for this frame only.
- Role: stage-9 implementation review (DeepSeek). Verify; decide nothing; certify nothing you
  planned.
- Agent name for the protocol: `deepseek`. Model and route (frozen): DeepSeek 4.1 Flash through
  `kilo run -m deepseek/deepseek-flash`.
- Read first: `docs/research/2026-09-26-ownerideas-revision/prompts/COMMON.md`, then
  `docs/research/2026-09-26-ownerideas-revision/prompts/IMPLEMENTATION-REVIEW.md`.
- Inputs: the final resolution and packages, both executor reports, the implemented working tree,
  PROTO-DEC-0079..0086.
- Output (exactly one file):
  `docs/research/2026-09-26-ownerideas-revision/round8/IMPLEMENTATION-REVIEW-DEEPSEEK.md`.
- Journal first write MUST contain the `Launch:` and `Orientation:` lines with the frame id; the runner matches the frame by the Orientation line (two earlier attempts without it were misread as NO_START).
- No commits, tags, pushes or branches; no edits outside that file and your journal.
