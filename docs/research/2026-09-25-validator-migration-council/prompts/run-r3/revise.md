# Launch: task:vmc-revise, reviser of the final plan

- Agent name: `kimi`. Start with `node .ai/bin/protocol-session.cjs start --agent kimi`.
- Model and route: kimi-k3 / high, copilot.
- Role file: `docs/research/2026-09-25-validator-migration-council/prompts/C-revise.md`, then `docs/research/2026-09-25-validator-migration-council/prompts/R3-ADDENDUM.md`.
- Runs only when `verification.md` is not `Verdict: ACCEPT`.
- Shared values: `docs/research/2026-09-25-validator-migration-council/prompts/run-r3/COMMON-LAUNCH.md`.
