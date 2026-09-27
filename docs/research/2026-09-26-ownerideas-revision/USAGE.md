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
| r8-exec-e1 | agy | gemini-3.8-flash-high | - | 33 | 194 | 0.00 | 0/0 | 0.00 | 0 | 0 | DONE |
| r8-exec-e2 | vibe | mistral-medium-3.5 | - | 18 | 288 | 0.00 | 0/0 | 0.00 | 0 | 0 | DONE |
| r8-review-deepseek | kilo | deepseek/deepseek-flash | - | 55 | 171 | 0.19 | 550721/29172 | 0.00 | 0 | 0 | DONE |
| r8-cert-mimo | mimo | xiaomi/mimo-v2.6-pro | high | 49 | 70 | 0.42 | 732790/35655 | 0.00 | 0 | 0 | DONE |
| r8b-cont-e1 | agy | gemini-3.8-flash-high | - | 55 | 303 | 0.00 | 0/0 | 0.00 | 0 | 0 | DONE |
| r8b-cont-e2 | vibe | mistral-medium-3.5 | - | 16 | 551 | 0.00 | 0/0 | 0.00 | 0 | 0 | DONE |
| r9b-repair-pkg5 | agy | gemini-3.8-flash-high | - | 39 | 143 | 0.00 | 0/0 | 0.00 | 0 | 0 | DONE |
| r9c-repair-hygiene | agy | gemini-3.8-flash-high | - | 32 | 209 | 0.00 | 0/0 | 0.00 | 0 | 0 | DONE |
| r9d-repair-pkg2 | agy | gemini-3.8-flash-high | - | 11 | 103 | 0.00 | 0/0 | 0.00 | 0 | 0 | DONE |
| r8d-cert-kimi-pkg2 | kimi | moonshot-ai/kimi-k2.7-code-highspeed | - | 41 | 58 | 0.00 | 0/0 | 0.00 | 0 | 0 | DONE |
| r8d-cert-mimo-pkg2 | mimo | xiaomi/mimo-v2.6-pro | high | 57 | 69 | 0.12 | 138090/14469 | 0.00 | 0 | 0 | DONE |
| r9e-repair-pkg2 | agy | gemini-3.8-flash-high | - | 11 | 106 | 0.00 | 0/0 | 0.00 | 0 | 0 | DONE |
| r9f-repair-usage | agy | gemini-3.8-flash-high | - | 23 | 110 | 0.00 | 0/0 | 0.00 | 0 | 0 | DONE |
| r8e-cert-kimi-pkg2 | kimi | moonshot-ai/kimi-k2.7-code-highspeed | - | 38 | 97 | 0.00 | 0/0 | 0.00 | 0 | 0 | DONE |
| r9-verify-codex | codex | gpt-5.6-sol | medium | 28 | 86 | 0.00 | 0/0 | 0.00 | 204 | 0 | DONE |
