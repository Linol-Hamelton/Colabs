# Usage per run

Written by `run-chain.cjs` from each client's own output: kilo JSON step costs, the copilot
"AI Credits" line, the codex "tokens used" line. A blank figure means the client printed none.

| Slot | Client | Model | Effort | Wall min | Output lines | Kilo $ | Kilo tokens in/out | Copilot credits | Codex tokens | Retries | State |
|---|---|---|---|---:|---:|---:|---:|---:|---:|---:|---|
| r3-a | copilot | kimi-k3 | high | 19 | 161 | 0.00 | 0/0 | 227.58 | 0 | 0 | DONE |
| r3-b | kilo | kilo/openai/gpt-6-astra | high | 19 | 0 | 10.83 | 105/19904 | 0.00 | 0 | 1 | FAILED |
| r3-c | ? | ? | - | 3 | 123 | 0.00 | 0/0 | 0.00 | 0 | 0 | DONE |
| draft | copilot | kimi-k3 | high | 19 | 309 | 0.00 | 0/0 | 208.54 | 0 | 0 | DONE |
| critique-a | kilo | kilo/openai/gpt-6-astra | high | 4 | 0 | 1.97 | 51/2750 | 0.00 | 0 | 1 | FAILED |
| critique-b | agy | gemini-3.8-flash-low | - | 2 | 143 | 0.00 | 0/0 | 0.00 | 0 | 0 | DONE |
| final | kilo | deepseek/deepseek-v4-pro | - | 7 | 688 | 0.13 | 165303/21341 | 0.00 | 0 | 1 | DONE |
| verify | vibe | mistral-medium-3.5 | - | -29839195 | 82 | 0.00 | 0/0 | 0.00 | 0 | 2 | FAILED |
| revise | kilo | deepseek/deepseek-v4-pro | - | 4 | 706 | 0.05 | 69694/4343 | 0.00 | 0 | 0 | DONE |
| reverify | vibe | mistral-medium-3.5 | - | 6 | 96 | 0.00 | 0/0 | 0.00 | 0 | 0 | DONE |
