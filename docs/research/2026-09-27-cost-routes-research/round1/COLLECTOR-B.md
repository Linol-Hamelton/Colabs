# COLLECTOR-B: нулевые маршруты и официальные цены (сбор B)

Метки: **FACT** — официальный источник/команда; **INFERENCE** — вывод с основанием; **OPEN QUESTION** — не подтверждено. Дата 2026-09-27 (UTC). Только официальные каналы. Секреты не приводятся (ключи по имени). Среда: приватный клон (win32, PowerShell 5.1); `kimi` 2.1.1, `mimo` 0.1.15, `kilo` 7.7.9.

## DeepSeek (собственный ключ; store `~/.local/share/kilo/auth.json`, поле `deepseek`)
### Q1 модели
- FACT: `GET https://api.deepseek.com/models` (ключ из store, без печати) → `deepseek-flash`, `deepseek-v4-pro`; HTTP 200.
- FACT: страница цен: legacy-имена `deepseek-v4-flash`, `deepseek-v4-flash-vision-exp` ещё принимаются, обслуживает V4.1-Flash по цене Flash; контекст 1M, выход до 384K.
### Q2 $0
- FACT: $0-моделей нет; минимум `deepseek-flash` off-peak $0.15/1M вход (cache miss), $0.6/1M выход.
### Q3 достижимость (команда + вывод + код возврата)
- FACT: `GET /user/balance` → `is_available:true`; USD total 11.92 (topped_up 11.92, granted 0), CNY 121.82.
- FACT: мини-вызов `kilo run -m deepseek/deepseek-flash ...` ушёл провайдером `deepseek` (BYOK): экспорт `ses_f1f5dcf9...` → providerID=deepseek, modelID=deepseek-flash; cost 0.00351738 (23386 вх./3 вых.), exit 0.
- INFERENCE (из цены): 23386 × $0.15/1M ≈ $0.0035 — сходится с off-peak, т.е. списание шло по цене DeepSeek, не шлюза.
### Q4 тарифная модель
- FACT: pay-as-you-go: токены × цена, списание с topped-up/granted (granted первым); параллелизм 2500 (flash)/500 (v4-pro); пик 01:00-04:00 и 06:00-10:00 UTC Пн-Пт (кроме кит. праздников), прочее off-peak (вдвое дешевле).
- OPEN QUESTION: текст ошибки при нулевом балансе — не заявлен и не проверялся (проверка потратила бы остаток).
### Q5 ключ: модели и цены (USD/1M; off-peak / peak)
| модель | вход miss | вход hit | выход |
|---|---|---|---|
| `deepseek-flash` | 0.15 / 0.30 | 0.003 / 0.006 | 0.60 / 1.20 |
| `deepseek-v4-pro` | 0.66 / 1.32 | 0.022 / 0.044 | 1.98 / 3.96 |
- FACT: источник https://api-docs.deepseek.com/quick_start/pricing (2026-09-27).
### Q6 бесплатно до нуля баланса
- FACT: нет; баланс расходуемый (11.92 USD), при исчерпании — пополнение.
### Q7 практика
- FACT: 1M контекст, tool calls, Anthropic-совместимый endpoint, 384K выход.
- INFERENCE (из цен): 100K вх. + 10K вых. ≈ $0.021 off-peak / $0.042 peak — задача диспетчера укладывается в центы.

## OpenRouter (ключ в env `OPENROUTER_API_KEY`)
### Q1 модели
- FACT: `GET https://openrouter.ai/api/v1/models` → 458 моделей, из них 21 с prompt=completion=0; примеры: `deepseek/deepseek-v4.1-flash`, `moonshotai/kimi-k3`, `moonshotai/kimi-k2.6`, `moonshotai/kimi-k2.7-code`, `xiaomi/mimo-v2.5`, `z-ai/glm-5.3-flash`, `minimax/minimax-m3`, `openrouter/free`.
### Q2 $0
- FACT: 17× суффикс `:free` (0/0): gemma-4-26b-a4b-it, gemma-4-31b-it, qwen3.8-27b, nemotron-3-super-120b-a12b, nemotron-3-ultra-550b-a55b, nemotron-3-nano-omni-30b-a3b-reasoning, nemotron-3.5-lightning, nemotron-3.5-content-safety, ling-3.0-flash-fin, ling-3.0-flash-sante, lfm-2.5-2.6b, inkling, inkling-small, laguna-s-2.1, laguna-xs-2.1, north-mini-code, dots-3-note-preview; плюс `openrouter/free` и `stealth/space-bunny-alpha` (медиа `google/lyria-3-*` — не LLM).
- FACT: лимиты `:free`: 20 req/мин; 50 req/сутки при <10 купленных кредитов, 1000 при ≥10; наш tier — `free_model_daily_requests {used:0, limit:50, remaining:50}` (`GET /api/v1/key`, 02:19 UTC); окно — сутки UTC.
### Q3 достижимость (команда + вывод + код возврата)
- FACT: `GET /api/v1/key` → 200, usage=0.082266292, limit=null, is_free_tier=true; `GET /api/v1/credits` → total_credits=0, total_usage=0.074867992 (02:11 UTC).
- FACT: POST chat/completions `nvidia/nemotron-3.5-lightning:free` → 200 OK, ответ получен (`:free` достижим). Тест `google/gemma-4-26b-a4b-it:free` → HTTP 429 `temporarily rate-limited upstream ... shared pool` (лимит upstream, не наш).
### Q4 тарифная модель
- FACT: предоплаченные кредиты; учёт total_credits/total_usage; 402 при недостатке, в т.ч. для free-моделей при отрицательном балансе; по-ключевые limit/limit_reset/limit_remaining. URL: https://openrouter.ai/docs/api-reference/limits.
### Q5 ключ: модели и цены (USD/1M, официальный каталог)
| модель | вход | выход | контекст |
|---|---|---|---|
| `deepseek/deepseek-v4.1-flash` | 0.035 | 0.29 | 1.05M |
| `moonshotai/kimi-k3` | 3.00 | 15.00 | 1.05M |
| `moonshotai/kimi-k2.6` | 0.95 | 4.00 | 262K |
| `moonshotai/kimi-k2.7-code` | 0.6562 | 3.30 | 262K |
| `xiaomi/mimo-v2.5` | 0.14 | 0.28 | 1.05M |
| `z-ai/glm-5.3-flash` | 0.04 | 0.50 | 1.31M |
| `minimax/minimax-m3` | 0.30 | 1.20 | 1.05M |
| `:free`-варианты | 0 | 0 | от 262K |
### Q6 бесплатно до нуля баланса
- FACT: is_free_tier=true, total_credits=0; free-модель ответила 200 → баланс не отрицателен (при отрицательном free дают 402 по докам). `:free` не расходует баланс, но 50 запросов/сутки.
- INFERENCE (из двух замеров usage): 0.0749→0.0823 за сессию — ключ общий, расход других сессий возможен; авторство не устанавливается.
### Q7 практика
- FACT: через OpenRouter ходит `mimo` (default `openrouter/deepseek/deepseek-v4.1-flash`).
- INFERENCE: 50 free-запросов/сутки мало для длинной агентной серии; платные не ограничены суточно, только балансом/in-flight бюджетом.

## HuggingFace (токен `HF_TOKEN`, User scope; база `https://router.huggingface.co/v1`)
### Q1 модели
- FACT: `GET router.huggingface.co/v1/models` (Bearer) → 140 моделей; примеры: `deepseek-ai/DeepSeek-V4.1-Flash`, `moonshotai/Kimi-K3`, `moonshotai/Kimi-K2.6`, `XiaomiMiMo/MiMo-V2.5`, `XiaomiMiMo/MiMo-V2.5-Pro`, `zai-org/GLM-5.3-Flash`, `Qwen/Qwen3.8-27B`, `MiniMaxAI/MiniMax-M3`.
### Q2 $0
- FACT: у выбранных моделей is_free=false; бесплатных LLM нет. Механизм — месячные кредиты: Free $0.10/мес, PRO $2/мес, Team/Enterprise $2/место.
### Q3 достижимость (команда + вывод + код возврата)
- FACT: `GET https://huggingface.co/api/whoami-v2` → 200, аккаунт владельца, isPro=false; `GET router.../v1/models` → 200, 140 моделей.
- OPEN QUESTION: inference-вызов не проверялся — тратит кредиты (правило: трата → OPEN QUESTION); остаток $0.10/мес API не отдаёт.
### Q4 тарифная модель
- FACT: routed-запросы — по ценам провайдера без наценки; сначала месячные кредиты, затем pay-as-you-go только после покупки кредитов; custom provider key — платит провайдер, кредиты HF не применяются. URL: https://huggingface.co/docs/inference-providers/pricing.
### Q5 ключ: модели и цены (USD/1M; официальный ответ роутера, провайдер = вход/выход)
| модель | провайдеры |
|---|---|
| DeepSeek-V4.1-Flash | deepinfra 0.2/0.6; novita 0.3/1.2; baseten 0.3/1.2 |
| Kimi-K3 | deepinfra 2.85/14.25; together/fireworks/baseten 3/15 |
| Kimi-K2.6 | deepinfra 0.75/3.5; novita 0.8/3.4; baseten 0.95/4 |
| MiMo-V2.5 | deepinfra 0.14/0.28; novita 0.168/0.336 |
| MiMo-V2.5-Pro | novita 0.522/1.044; deepinfra 1/3 |
| GLM-5.3-Flash | novita/together/baseten/deepinfra 0.15/0.5 |
| MiniMax-M3 | deepinfra 0.28/1.1; novita/together/fireworks 0.3/1.2 |
| Qwen3.8-27B | deepinfra 0.2/2.5; novita 0.42/3; cerebras 0.99/1.49 |
### Q6 бесплатно до нуля баланса
- FACT: месячные кредиты (у нас $0.10) применяются первыми; после исчерпания без покупки кредитов запросы прекращаются.
### Q7 практика
- INFERENCE (из $0.10 и цен): ≈0.5M вх. токенов DeepSeek-V4.1-Flash у deepinfra в месяц без выхода — на тесты, не на диспетчера; 140 моделей удобны для сверки цен.

## Moonshot API и kimi (CLI)
### Q1 модели
- FACT: `kimi --version` → 2.1.1 (exit 0); `kimi --help` — export/fork/provider/session/login/doctor/web/acp/upgrade и др.
- FACT: `kimi provider list` → `managed:kimi-code type=kimi models=4 source=oauth`; `moonshot-ai type=kimi models=4 source=inline`; default `moonshot-ai/kimi-k2.7-code-highspeed`.
- FACT: `C:\Users\Dmitry\.kimi-code\config.toml`: managed:kimi-code → `kimi-for-coding` (K2.8 Preview), `kimi-for-coding-highspeed`, `k3`, `k3-256k`; moonshot-ai → `kimi-k2.6`, `kimi-k3`, `kimi-k2.7-code`, `kimi-k2.7-code-highspeed` (ключ в конфиге, значение не приводится).
- FACT: `GET https://api.moonshot.ai/v1/models` (ключ из конфига) → `kimi-k2.6`, `kimi-k3`, `kimi-k2.7-code`, `kimi-k2.7-code-highspeed`.
### Q2 $0
- FACT: $0 по подписке Kimi Code у аккаунта нет — доступ отклонён 403 (Q3); по API $0-моделей нет.
### Q3 достижимость (команда + вывод + код возврата)
- FACT: `kimi -p "Reply with exactly: PONG"` → `PONG`, exit 0 (платный API-ключ Moonshot, default-модель).
- FACT: `kimi -m kimi-code/k3 -p "Reply with exactly: PONG"` → exit 1: `error: failed to run prompt: provider.auth_error: 403 Your current subscription does not have access to Kimi Code right now. Upgrade your plan to keep coding with Kimi Code: https://www.kimi.com/code/#pricing`.
### Q4 тарифная модель
- FACT: Kimi Code — часть подписки Kimi; одна квота на CLI/VS Code/Desktop/третьи инструменты и API-ключи; новые планы: rolling-окно 5 ч + месячная квота (недельная отменена), legacy: недельный сброс; Extra Usage — pay-per-use fallback в RMB (мин. ¥25, до 10×/сутки, cap ¥3000/сутки, баланс до ¥10000). URL: https://www.kimi.com/code/docs/en/kimi-code/membership.html.
- FACT: уровни: Kimi Code — Plus+ (legacy Andante+); k3 — Plus+; k3 1M — Pro+; highspeed — Pro+ (legacy Allegretto+).
- OPEN QUESTION: цены и числовые квоты планов — страницы https://www.kimi.ai/code/#pricing и https://www.kimi.com/membership/pricing рендерятся JS, суммы снять не удалось.
### Q5 API-ключ: модели и цены (USD/1M; вход cache-miss, выход; cache hit)
| модель | вход | выход | cache hit | контекст |
|---|---|---|---|---|
| `kimi-k3` | 3.00 | 15.00 | 0.30 (write 3/6) | 1,048,576 |
| `kimi-k2.7-code` | 0.95 | 4.00 | 0.19 | 262,144 |
| `kimi-k2.7-code-highspeed` | 1.90 | 8.00 | 0.38 | 262,144 |
| `kimi-k2.6` | 0.95 | 4.00 | 0.16 | 262,144 |
- FACT: источник https://platform.moonshot.ai/docs/pricing/chat (редирект на platform.kimi.ai).
- FACT: `GET /v1/users/me/balance` → available_balance 3.1468701, voucher 0 (валюта в ответе не указана).
- INFERENCE (конфиг vs прайс): в kimi-конфиге highspeed с overrides 1M, официально 262,144 — оверрайд официально не подтверждён.
### Q6 бесплатно до нуля баланса — FACT: нет; расход с баланса API (3.15) либо из квоты подписки, доступа к которой нет.
### Q7 практика
- FACT: K3 — 1M контекст, tool use; API OpenAI- и Anthropic-совместим.
- INFERENCE (из цен): K3 $3/$15 дорог для минутных агентных задач; `kimi-k2.7-code` $0.95/$4 умереннее; $0-путь — только подписка (сейчас 403).

## Kilo-шлюз (CLI `kilo`; ключ аккаунта oauth `kilo` в store)
### Q1 модели
- FACT: `kilo --version` → 7.7.9; `kilo models` — 1155 строк; провайдеры CLI: `kilo` 328, `openrouter` 384, `vercel` 383, `google` 38, `openai` 19, `deepseek` 2, `openai-compatible` 1.
- FACT: примеры id шлюза: `kilo/deepseek/deepseek-v4.1-flash`, `kilo/moonshotai/kimi-k3`, `kilo/moonshotai/kimi-k2.7-code`, `kilo/xiaomi/mimo-v2.5`, `kilo/xiaomi/mimo-v2.6-flash`, `kilo/z-ai/glm-4.7-flash`, `kilo/qwen/qwen3.7-flash`, `kilo/minimax/minimax-m3`, `kilo/kilo-auto/free`.
### Q2 $0
- FACT (`kilo models --verbose`, провайдер kilo, cost 0/0; 24 строки): `kilo/kilo-auto/free`; `kilo/cohere/north-mini-code:free`; `kilo/dots-studio/dots-3-note-preview:free`; `kilo/inclusionai/ling-3.0-flash-{fin,sante}:free`; `kilo/liquid/lfm-2.5-2.6b:free`; `kilo/nvidia/nemotron-3-{nano-omni-30b-a3b-reasoning,super-120b-a12b,ultra-550b-a55b,3.5-lightning}:free`; `kilo/poolside/laguna-{s,xs}-2.1:free`; `kilo/qwen/qwen3.8-27b:free`; `kilo/stealth/space-bunny-alpha`; `kilo/stepfun/step-3.7-flash:free`; `kilo/thinkingmachines/inkling-small:free`; `kilo/openrouter/{auto,auto-beta,free,pareto-code}`; `kilo/typesafe/jev-router`; `kilo/kilo-auto/{balanced,efficient,frontier}`.
- INFERENCE (из https://kilo.ai/pricing): `kilo/kilo-auto/balanced|efficient|frontier` в листинге тоже 0, но это роутеры Auto Model — цена = цена выбранной модели; $0-гарантия только у `kilo-auto/free`.
### Q3 достижимость (команда + вывод + код возврата)
- FACT: `kilo run -m deepseek/deepseek-flash --variant minimal --auto --dir . --format json "Reply with exactly: PONG"` → `"text":"PONG"`, exit 0, cost 0.00351738, маршрут BYOK `deepseek` (см. Q3 DeepSeek).
- FACT: `kilo run -m kilo/kilo-auto/free --auto --dir . --format json "..."` → `PONG`, exit 0, cost 0, providerID=kilo, modelID=`dots-studio/dots-3-note-preview:free` — $0-маршрут работает при балансе `$-0.00`.
- FACT: `kilo run -m kilo/xiaomi/mimo-v2.6-flash ...` → exit 1, HTTP 402 `Add credits to continue, or switch to a free model`; тело: `{"error":{"title":"Paid Model - Credits Required",...,"balance":-0.002231},"error_type":"usage_limit_exceeded"}`.
- FACT: `kilo profile` → `Balance: $-0.00` (02:10 UTC; в запуске заявлялось ~$0.03 — расхождение фиксирую).
### Q4 тарифная модель
- FACT: pay-as-you-go по ценам провайдера без наценки; комиссия 5% при покупке кредитов; Kilo Pass от $19/мес (бонусы до 50%); BYOK — платит провайдер; Auto Free — $0/мес. URL: https://kilo.ai/pricing.
- FACT: при балансе ≤0 платные модели → 402 (текст выше), бесплатные работают (эмпирика).
### Q5 модели и цены шлюза (USD/1M; `kilo models --verbose`)
| модель | вход | выход |
|---|---|---|
| `kilo/deepseek/deepseek-v4.1-flash` | 0.30 | 1.20 |
| `kilo/~deepseek/deepseek-flash-latest` | 0.035 | 0.29 |
| `kilo/moonshotai/kimi-k3` | 3.00 | 15.00 |
| `kilo/moonshotai/kimi-k2.6` | 0.95 | 4.00 |
| `kilo/moonshotai/kimi-k2.7-code` | 0.6562 | 3.30 |
| `kilo/xiaomi/mimo-v2.5` | 0.14 | 0.28 |
| `kilo/xiaomi/mimo-v2.6-flash` | 0.14 | 0.28 |
| `kilo/z-ai/glm-4.7-flash` | 0.0605 | 0.40 |
| `kilo/z-ai/glm-5.3-flash` | 0.15 | 0.50 |
| `kilo/qwen/qwen3.7-flash` | 0.03 | 0.13 |
| `kilo/qwen/qwen3.5-flash-02-23` | 0.065 | 0.26 |
| `kilo/minimax/minimax-m3` | 0.30 | 1.20 |
### Q6 бесплатно до нуля баланса
- FACT: инверсия: бесплатные модели доступны и при нулевом/отрицательном балансе (проверено), платные — только при балансе > 0 (402).
### Q7 практика
- FACT: неинтерактивный запуск (`--auto --format json`), сессии, 1M контекст у deepseek-v4.1-flash, 328 моделей шлюза.
- INFERENCE (из нулевого листинга): при балансе ~0 годятся только $0-модели (nemotron/qwen/ling и `kilo-auto/free`); платные требуют пополнения.

## Vercel AI Gateway (ключ в store, поле `vercel`)
### Q1 модели
- FACT: `GET https://ai-gateway.vercel.sh/v1/models` (наш ключ) → 391 модель; примеры: `deepseek/deepseek-v4.1-flash`, `deepseek/deepseek-v4-pro`, `moonshotai/kimi-k3`, `moonshotai/kimi-k2.7-code`, `moonshotai/kimi-k2.7-code-highspeed`, `xiaomi/mimo-v2.5`, `zai/glm-5.3-flash`, `minimax/minimax-m3`.
- FACT: `kilo.json` задаёт маршрут `openai-compatible` → base `https://ai-gateway.vercel.sh/coding-agent/v1`, модель `deepseek/deepseek-flash`, ключ из env `AI_GATEWAY_API_KEY` (в текущей оболочке env не задан).
### Q2 $0
- FACT: в каталоге 4 language-модели с ценой 0/0: `inclusionai/ling-3.0-flash-sante`, `inclusionai/ling-3.0-flash-sante-free`, `poolside/laguna-s-2.1-free`, `stealth/pixel-canary`.
- FACT: free tier — месячный кредит, покрывает подмножество моделей; официальный список — https://vercel.com/ai-gateway/models?freeTier=true (JS) → OPEN QUESTION: точный состав.
### Q3 достижимость (команда + вывод + код возврата)
- FACT: `GET /v1/models` → 200 (391); `GET /v1/credits` → `{"balance":"4.98586991","total_used":"0.01413009"}` (02:17 UTC).
- OPEN QUESTION: генерационный вызов нашим ключом не делался — тратит баланс (правило: трата → OPEN QUESTION).
### Q4 тарифная модель
- FACT: наценки нет; 402 при отсутствии положительного баланса; 403 (free tier) для моделей вне подмножества; 429 — rate limit free tier; покупные кредиты истекают через 1 год; free tier — месячный кредит, не trial. URL: https://vercel.com/docs/ai-gateway/pricing, /faq.
### Q5 модели и цены (USD/1M; поле pricing официального /v1/models)
| модель | вход | выход | cache read |
|---|---|---|---|
| `deepseek/deepseek-v4.1-flash` | 0.30 | 1.20 | 0.007 |
| `deepseek/deepseek-v4-flash` | 0.13 | 0.26 | 0.028 |
| `deepseek/deepseek-v4-pro` | 0.66 | 1.98 | 0.022 |
| `moonshotai/kimi-k3` | 3.00 | 15.00 | 0.30 |
| `moonshotai/kimi-k2.7-code` | 0.95 | 4.00 | 0.19 |
| `moonshotai/kimi-k2.7-code-highspeed` | 1.90 | 8.00 | 0.38 |
| `moonshotai/kimi-k2.6` | 0.95 | 4.00 | 0.16 |
| `xiaomi/mimo-v2.5` | 0.14 | 0.28 | 0.0028 |
| `zai/glm-5.3-flash` | 0.15 | 0.50 | 0.03 |
| `minimax/minimax-m3` | 0.30 | 1.20 | 0.06 |
### Q6 бесплатно до нуля баланса
- FACT: сначала месячный free-credit, затем покупные; при нулевом балансе 402 (доки); наш баланс 4.9859 USD.
- OPEN QUESTION: free tier или paid tier у команды — API не отдаёт (при paid месячный кредит не применяется).
### Q7 практика
- INFERENCE (из баланса/цен): ~$5 ≈ 16.6M вх. токенов deepseek-v4.1-flash — минутные агентные задачи покрываются; 391 модель, zero-markup, единый ключ; ограничение — free-tier 429.

## mimo (Xiaomi), CLI `mimo`
### Q1 модели
- FACT: `mimo --version` → 0.1.15; `mimo --help` — run/models/stats/providers/agent/session/serve и др.
- FACT: `mimo models` — каталог: `xiaomi/mimo-v2.5`, `xiaomi/mimo-v2.5-pro`, `xiaomi/mimo-v2.5-pro-ultraspeed`, `xiaomi/mimo-v2.6-flash`, `xiaomi/mimo-v2.6-pro`, `xiaomi/mimo-v2.6-pro-ultraspeed`, `mimo/mimo-auto` (1M) и сотни `openrouter/...`, `google/...`, `openai/...`.
- FACT: `C:\Users\Dmitry\.config\mimocode\mimocode.jsonc`: provider openrouter (ключ из env `OPENROUTER_API_KEY`), model `openrouter/deepseek/deepseek-v4.1-flash`; комментарий: «2026-09-25: the MiMo Auto free channel has ended… xiaomi provider carries no key»; бэкап `.bak-2026-09-25`; имя ключа MiMo CLI — в `~/.local/share/mimocode/mimo-key-name` (значение не привожу).
### Q2 $0
- FACT: бесплатный канал MiMo завершён (запись 2026-09-25), xiaomi-провайдер без ключа; текущий маршрут — платный OpenRouter.
- OPEN QUESTION: есть ли бесплатный тариф у `mimo/mimo-auto` — нет ключа xiaomi и официальной страницы цен MiMo.
### Q3 достижимость (команда + вывод + код возврата)
- FACT: `mimo run "Reply with exactly: PONG"` → `PONG`, exit 0, баннер `build · deepseek/deepseek-v4.1-flash` (OpenRouter).
### Q4 тарифная модель
- OPEN QUESTION: тарифы Xiaomi MiMo (кредиты/квоты/сброс) официально не подтверждены; де-факто CLI расходует кредиты OpenRouter.
### Q5 API-ключ
- N/A: своего ключа/цен у mimo в инвентаре нет; цены маршрутов — это OpenRouter (раздел выше).
### Q6 бесплатно до нуля баланса — FACT: нет ($0-канал завершён).
### Q7 практика
- FACT: `mimo run` поддерживает `--format json`, `--model`, сессии, контекст 1M+.
- INFERENCE (из конфига): равноценен прямому OpenRouter-маршруту; выгода — только при возврате бесплатного канала Xiaomi.

## Итоговая таблица: кандидаты $0
| сервис | клиент/ключ | модель id | механизм | лимит | окно | проверка | источник+дата |
|---|---|---|---|---|---|---|---|
| Kilo | CLI kilo / аккаунт | `kilo/kilo-auto/free` → `dots-studio/dots-3-note-preview:free` | free-модели шлюза, cost 0 | не заявлен | — | FACT: `kilo run ...` → PONG, exit 0, cost 0 при балансе −0.002231 | `kilo models --verbose`; 2026-09-27 |
| Kilo | CLI kilo / аккаунт | 24 $0-строки шлюза: `:free`-модели (nemotron, qwen, ling, laguna и др.), роутеры, space-bunny, jev-router | free-модели/роутеры, in=out=0 | не заявлен | — | FACT: официальный листинг | `kilo models --verbose`; 2026-09-27 |
| OpenRouter | ключ env | 17× `:free` + `openrouter/free` | free-варианты (0/0) | 20 req/мин; 50 req/сутки (наш tier) | сутки UTC | FACT: `nemotron-3.5-lightning:free` → 200 | /api/v1/models, /api/v1/key, docs/limits; 2026-09-27 |
| Vercel | ключ store | `inclusionai/ling-3.0-flash-sante(-free)`, `poolside/laguna-s-2.1-free`, `stealth/pixel-canary` | цена 0 в каталоге | free-tier rate limits (429) | месячный credit | FACT: /v1/models pricing=0 | /v1/models; 2026-09-27 |
| HuggingFace | `HF_TOKEN` | — | месячные кредиты $0.10 (Free) | $0.10/мес | месяц | FACT: доки; вызов не проверялся (трата) | docs/inference-providers/pricing; 2026-09-27 |
| DeepSeek | own key | — | нет | — | — | — | api-docs pricing; 2026-09-27 |
| Moonshot/kimi | подписка Kimi Code | `k3`, `k3-256k`, `kimi-for-coding`, `...-highspeed` | included-квота подписки | 5-ч rolling + месячная квота | — | FACT: 403 — доступа нет | kimi.com/code/docs membership; 2026-09-27 |
| mimo | — | — | нет (free-канал завершён) | — | — | FACT: конфиг (комментарий) | mimocode.jsonc; 2026-09-25 |

## Итоговая таблица: цены (USD за 1M; полные таблицы — в разделах Q5)
| сервис | модель | in/out | URL+дата |
|---|---|---|---|
| DeepSeek | `deepseek-flash` off-peak/peak | 0.15/0.60 · 0.30/1.20 | api-docs.deepseek.com/quick_start/pricing; 2026-09-27 |
| DeepSeek | `deepseek-v4-pro` off-peak/peak | 0.66/1.98 · 1.32/3.96 | там же |
| Moonshot API | `kimi-k3` | 3.00/15.00 | platform.moonshot.ai/docs/pricing/chat; 2026-09-27 |
| Moonshot API | `kimi-k2.7-code` | 0.95/4.00 | там же |
| Moonshot API | `kimi-k2.7-code-highspeed` | 1.90/8.00 | там же |
| Moonshot API | `kimi-k2.6` | 0.95/4.00 | там же |
| OpenRouter | `deepseek/deepseek-v4.1-flash` | 0.035/0.29 | openrouter.ai/api/v1/models; 2026-09-27 |
| OpenRouter | `moonshotai/kimi-k3` | 3.00/15.00 | там же |
| OpenRouter | `z-ai/glm-5.3-flash` | 0.04/0.50 | там же |
| OpenRouter | `:free`-варианты | 0/0 | там же |
| Kilo | `kilo/deepseek/deepseek-v4.1-flash` | 0.30/1.20 | `kilo models --verbose`; 2026-09-27 |
| Kilo | `kilo/qwen/qwen3.7-flash` | 0.03/0.13 | там же |
| Vercel | `deepseek/deepseek-v4.1-flash` | 0.30/1.20 | ai-gateway.vercel.sh/v1/models; 2026-09-27 |
| Vercel | `moonshotai/kimi-k3` | 3.00/15.00 | там же |
| Vercel | `deepseek/deepseek-v4-flash` | 0.13/0.26 | там же |
| HuggingFace | `DeepSeek-V4.1-Flash` (deepinfra) | 0.20/0.60 | router.huggingface.co/v1/models; 2026-09-27 |
| HuggingFace | `Kimi-K3` (deepinfra) | 2.85/14.25 | там же |

## Сомнения и пробелы (OPEN QUESTION)
- OPEN QUESTION: цены/числовые квоты планов Kimi — страницы рендерятся JS (https://www.kimi.ai/code/#pricing, https://www.kimi.com/membership/pricing); суммы снять не удалось.
- OPEN QUESTION: статус подписки Kimi Code — oauth-провайдер настроен, но запрос даёт 403 «does not have access»; остаток квоты доступен только интерактивно (`/usage`).
- OPEN QUESTION: валюта баланса Moonshot API (3.1468701) — в ответе не указана.
- OPEN QUESTION: конфиг kimi даёт highspeed 1M (overrides), официальный прайс — 262,144.
- OPEN QUESTION: HF inference-вызов не проверялся (тратит кредиты); остаток $0.10/мес API не отдаёт.
- OPEN QUESTION: точный список free-tier Vercel и наш tier (free/paid) — по API не определяются.
- OPEN QUESTION: генерация через Vercel-ключ эмпирически не проверялась (трата баланса).
- OPEN QUESTION: текст ошибки DeepSeek при нулевом балансе — не проверялся (трата).
- OPEN QUESTION: тарифы Xiaomi MiMo и бесплатный `mimo/mimo-auto` — нет ключа и официальной страницы цен.
- OPEN QUESTION: расход OpenRouter-ключа вырос за сессию (0.0749→0.0823) — ключ общий; авторство расхода не установлено.
- INFERENCE: валюта шлюза Kilo — USD (основание: формат `$-0.00` в `kilo profile` и `balance` в теле 402; страница цен в долларах).
