# Launch: task:wai-synthesis

- Role in this research frame: senior synthesiser.
- Agent name: `claude`. Model and route: Opus 5.5 High through claude (rung 2, senior floor). Substitute: Opus 5.5 XHigh, resolved by `docs/core-arch/stage-4/workflowAI.md` section 1.5 from the owner's ladder (`docs/ops/MODEL-ECONOMICS.md`).
- Role file: `docs/research/2026-09-25-workflowai-review/prompts/SYNTHESIS.md`, after `docs/research/2026-09-25-workflowai-review/prompts/COMMON.md`.
- Output: `docs/research/2026-09-25-workflowai-review/synthesis.md`.
- If the model that actually runs is not the one named above (a substitute), use the agent name of its maker (`claude` for Opus, `codex` for GPT) and write the actual model in your Launch line.
