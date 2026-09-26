# Launch: task:vmc-revise, reviser of the final plan

- Agent name: `deepseek`. Start with `node .ai/bin/protocol-session.cjs start --agent deepseek`.
- Model and route: deepseek-v4-pro through Kilo on the owner's DeepSeek key. It wrote final-plan.md as the substitute of the final synthesiser after the copilot monthly quota ran out (journal kimi-4128de4654dc504d, launched under the agent name kimi).
- Role file: `docs/research/2026-09-25-validator-migration-council/prompts/C-revise.md`, then `docs/research/2026-09-25-validator-migration-council/prompts/R3-ADDENDUM.md`.
- Runs only when `verification.md` is not `Verdict: ACCEPT`.
- Shared values: `docs/research/2026-09-25-validator-migration-council/prompts/run-r3/COMMON-LAUNCH.md`.
