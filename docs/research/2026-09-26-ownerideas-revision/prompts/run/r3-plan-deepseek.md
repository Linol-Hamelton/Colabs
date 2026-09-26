# Launch: task:ownerideas-r3-plan-deepseek

- Frame: `task:ownerideas-r3-plan-deepseek` (parent program: `ownerideas-revision`). This role holds
  for this frame only.
- Role: author of the single plan. You plan; you neither decide nor certify. The revision is closed
  by PROTO-DEC-0079..0082; the plan starts from those decisions.
- Agent name for the protocol: `deepseek`. Model and route (frozen, do not change): DeepSeek 4.1
  Flash through `kilo run -m deepseek/deepseek-flash`; the route exposes no effort value, recorded as
  unknown.
- Read first: `docs/research/2026-09-26-ownerideas-revision/prompts/COMMON.md`, then
  `docs/research/2026-09-26-ownerideas-revision/round3/RESOLUTION-CLAUDE.md` section 10 (the plan
  brief and boundary) and `docs/research/2026-09-26-ownerideas-revision/prompts/PLAN-AMENDMENT.md`
  (which overrides the suggested dependency order).
- Read as inputs: RESOLUTION sections 4-8 (boundary, active list A-1..A-14, research list R-1..R-7,
  unresolved questions U-1..U-14), `.ai/DECISIONS.md` PROTO-DEC-0079..0082 and the blocks they name,
  `docs/core-arch/stage-1/P-L0-008-research-governor.md` (the governor: frames, verdicts, streams,
  limits, DIG), and the frozen corpus list `round3/CORPUS.txt` as needed. Where the cleanup already
  removed an OwnerIdeas file, read it with `git show 7b6d17a:<path>`.
- Output (exactly one file): `docs/research/2026-09-26-ownerideas-revision/round4/PLAN-DEEPSEEK.md`.
- No commits, tags, pushes or branches; do not edit OwnerIdeas or any decision record.
