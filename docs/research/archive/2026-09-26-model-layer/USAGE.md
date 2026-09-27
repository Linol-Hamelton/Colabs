# Usage per run

Written by `run-chain.cjs` from each client's own output: kilo JSON step costs, the copilot
"AI Credits" line, the codex "tokens used" line. A blank figure means the client printed none.

| Slot | Client | Model | Effort | Wall min | Output lines | Kilo $ | Kilo tokens in/out | Copilot credits | Codex tokens | Retries | State |
|---|---|---|---|---:|---:|---:|---:|---:|---:|---:|---|
| f02-collector-a | agy | gemini-3.8-flash-high | - | 15 | 61 | 0.00 | 0/0 | 0.00 | 0 | 1 | DONE |
| f02-collector-b | kilo | deepseek/deepseek-flash | max | 8 | 54 | 0.10 | 234859/21767 | 0.00 | 0 | 0 | DONE |
| f02-verifier | vibe | mistral-medium-3.5 | - | 5 | 0 | 0.00 | 0/0 | 0.00 | 0 | 1 | FAILED |
