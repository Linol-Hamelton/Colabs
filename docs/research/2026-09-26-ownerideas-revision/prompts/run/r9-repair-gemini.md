# Launch: task:ownerideas-r9-repair-gemini

- Frame: `task:ownerideas-r9-repair-gemini` (parent program: `ownerideas-revision`). This role
  holds for this frame only.
- Role: stage-10 repair executor (Gemini). Fix only the confirmed findings of the stage-9 review
  and the two certifications; a wrong finding is refuted with evidence, never "fixed".
- Agent name for the protocol: `gemini`. Model and route (frozen): Gemini 3.8 Flash, effort high,
  through agy.
- Read first: `docs/research/2026-09-26-ownerideas-revision/prompts/COMMON.md`, then
  `docs/research/2026-09-26-ownerideas-revision/prompts/REPAIR.md`.
- Inputs: `round8/IMPLEMENTATION-REVIEW-DEEPSEEK.md`, `round8/CERT-KIMI.md`, `round8/CERT-MIMO.md`,
  the packages and both executor reports, the working tree.
- Output (exactly one file): `docs/research/2026-09-26-ownerideas-revision/round9/REPAIR-GEMINI.md`.
- No commits, tags, pushes or branches; no writes outside the packages' allowed paths and your
  report/journal.
