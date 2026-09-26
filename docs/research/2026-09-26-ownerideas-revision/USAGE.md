# Usage per run

Written by `run-chain.cjs` from each client's own output: kilo JSON step costs, the copilot
"AI Credits" line, the codex "tokens used" line. A blank figure means the client printed none.

| Slot | Client | Model | Effort | Wall min | Output lines | Kilo $ | Kilo tokens in/out | Copilot credits | Codex tokens | Retries | State |
|---|---|---|---|---:|---:|---:|---:|---:|---:|---:|---|
| r1-gemini | agy | gemini-3.8-flash-high | - | 4 | 439 | 0.00 | 0/0 | 0.00 | 0 | 0 | DONE |
| r1-claude | claude | claude-opus-5-5 | xhigh | 18 | 475 | 0.00 | 0/0 | 0.00 | 0 | 0 | DONE |
| r1-deepseek | kilo | deepseek/deepseek-flash | - | 5 | 499 | 0.09 | 282349/21696 | 0.00 | 0 | 0 | DONE |
| r1-mistral | vibe | mistral-medium-3.5 | - | 3 | 408 | 0.00 | 0/0 | 0.00 | 0 | 0 | DONE |
| r2-kimi | kimi | moonshot-ai/kimi-k2.7-code-highspeed | - | 5 | 235 | 0.00 | 0/0 | 0.00 | 0 | 0 | DONE |
| r2-mimo | mimo | xiaomi/mimo-v2.6-pro | high | 11 | 354 | 0.11 | 179099/15993 | 0.00 | 0 | 0 | DONE |
| r3-claude | claude | claude-opus-5-5 | xhigh | 21 | 600 | 0.00 | 0/0 | 0.00 | 0 | 0 | DONE |
| r3-clean-gemini | agy | gemini-3.8-flash-high | - | 5 | 72 | 0.00 | 0/0 | 0.00 | 0 | 0 | DONE |
| r3-plan-deepseek | kilo | deepseek/deepseek-flash | - | 4 | 439 | 0.05 | 134857/14726 | 0.00 | 0 | 0 | DONE |
| r4-mistral-review | vibe | mistral-medium-3.5 | - | 2 | 294 | 0.00 | 0/0 | 0.00 | 0 | 0 | DONE |
| r5-kimi-critique | kimi | moonshot-ai/kimi-k2.7-code-highspeed | - | 2 | 121 | 0.00 | 0/0 | 0.00 | 0 | 0 | DONE |
| r5-mimo-critique | mimo | xiaomi/mimo-v2.6-pro | high | 10 | 126 | 0.06 | 88585/8262 | 0.00 | 0 | 0 | DONE |
| r6-review-p-l0-008-0.3 | vibe | mistral-medium-3.5 | - | 2 | 21 | 0.00 | 0/0 | 0.00 | 0 | 0 | DONE |
| r6-claude-final | claude | claude-opus-5-5 | high | 13 | 466 | 0.00 | 0/0 | 0.00 | 0 | 0 | DONE |
| r7-precheck-deepseek | kilo | deepseek/deepseek-flash | - | 5 | 142 | 0.07 | 139151/11499 | 0.00 | 0 | 0 | DONE |
| r7b-claude-fix | claude | claude-opus-5-5 | high | 0 | 0 | 0.00 | 0/0 | 0.00 | 0 | 1 | FAILED |
| r7c-deepseek-recheck | kilo | deepseek/deepseek-flash | - | 5 | 84 | 0.05 | 101636/11644 | 0.00 | 0 | 0 | DONE |
