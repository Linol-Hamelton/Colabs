# Launch: task:ownerideas-r5-mimo-critique

- Frame: `task:ownerideas-r5-mimo-critique` (parent program: `ownerideas-revision`). This role
  holds for this frame only.
- Role: critic B — independent critique of the single plan. You decide nothing; Claude resolves.
- Agent name for the protocol: `mimo`. Model and route (fixed): MiMo-V2.6-Pro through the `mimo`
  CLI, model `xiaomi/mimo-v2.6-pro`, `--variant high`.
- Read first: `docs/research/2026-09-26-ownerideas-revision/prompts/COMMON.md`, then
  `docs/research/2026-09-26-ownerideas-revision/prompts/CRITIQUE.md`.
- Output (exactly one file): `docs/research/2026-09-26-ownerideas-revision/round5/CRITIQUE-MIMO.md`.
- Do not open `round5/CRITIQUE-KIMI.md`. No commits, tags, pushes or branches.
