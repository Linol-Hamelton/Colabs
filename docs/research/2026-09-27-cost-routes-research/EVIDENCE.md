# EVIDENCE: команды, выводы и ссылки

Оператор: `kilo-9a9b18229cce57fd`. Дата: 2026-09-27 (UTC). Метки: **FACT** — команда/URL и
результат приведены; **INFERENCE** — вывод с основанием; **OPEN QUESTION** — не подтверждено.
Секреты не приводятся (ключи только по имени). Полные черновики: `round1/COLLECTOR-A.md`,
`round1/COLLECTOR-B.md`; верификация: `round2/VERIFICATION.md`.

## 1. Эмпирика CLI (мини-вызовы; точные тексты)

| Команда (сокращённо) | Результат | Метка |
|---|---|---|
| `agy --version` | `1.2.11` | FACT |
| `agy models` | 14 строк: `gemini-3.8-flash-high/medium/low`, `gemini-3.7-flash-high/medium/low`, `gemini-3.6-flash-high/medium/low`, `gemini-3.1-pro-high/low`, `claude-sonnet-4-6`, `claude-opus-4-6-thinking`, `gpt-oss-120b-medium` (верификатор воспроизвёл: совпало) | FACT |
| `agy -p "Reply with exactly: PONG" --model gemini-3.7-flash-low` | `PONG`, exit 0 (квота не исчерпана) | FACT |
| `claude --version` | `2.1.283 (Claude Code)` | FACT |
| `claude -p "Reply with exactly: PONG"` | exit 1: `You've hit your weekly limit · resets 2pm (Europe/Moscow)` — отказ целиком | FACT |
| `codex --version` | `codex-cli 0.154.0` | FACT |
| `codex exec -m gpt-5.6-luna "Reply with exactly: PONG" --skip-git-repo-check` | `PONG`, `tokens used: 10 644`, exit 0 | FACT |
| `copilot --version` | `GitHub Copilot CLI 1.0.88.` | FACT |
| `copilot -p "Reply with exactly: PONG" --allow-all` | exit 1: `You have exceeded your monthly quota (Request ID: AE46:1EF2:1C54D44:23BD5B7:6AB8796C) AI Credits 0 (5s)` | FACT |
| `vibe --version` | `vibe 2.25.8` | FACT |
| `vibe -p "Reply with exactly: PONG" --enabled-tools read_file --max-turns 1 --trust` | `PONG`, exit 0 | FACT |
| `kimi --version` | `2.1.1` (верификатор воспроизвёл: совпало) | FACT |
| `kimi -p "Reply with exactly: PONG"` | `PONG`, exit 0 (маршрут — платный ключ Moonshot) | FACT |
| `kimi -m kimi-code/k3 -p "Reply with exactly: PONG"` | exit 1: `provider.auth_error: 403 Your current subscription does not have access to Kimi Code right now...` | FACT |
| `mimo --version` | `0.1.15` (верификатор воспроизвёл: совпало) | FACT |
| `mimo run "Reply with exactly: PONG"` | `PONG`, exit 0, баннер `deepseek/deepseek-v4.1-flash` (маршрут OpenRouter) | FACT |
| `kilo --version` | `7.7.9` (верификатор: EPERM state-хранилища, не воспроизвёл) | FACT (B) / UNVERIFIABLE (round 2) |
| `kilo profile` | `Balance: $-0.00` (02:10 UTC; в промпте владельца ~$0.03 — расхождение) | FACT |
| `kilo run -m deepseek/deepseek-flash --variant minimal ... "Reply with exactly: PONG"` | `PONG`, exit 0, cost 0.00351738, провайдер `deepseek` (BYOK), 23 386 вх./3 вых. | FACT |
| `kilo run -m kilo/kilo-auto/free ... "Reply with exactly: PONG"` | `PONG`, exit 0, cost 0, providerID=kilo, modelID=`dots-studio/dots-3-note-preview:free`, при балансе −0.002231 | FACT |
| `kilo run -m kilo/xiaomi/mimo-v2.6-flash ...` | exit 1, HTTP 402: `Add credits to continue, or switch to a free model`, `balance: -0.002231` | FACT |
| `kilo models --verbose` | 1155 строк каталога; 24 строки с cost 0/0 (список в B Q2) | FACT |

## 2. Эмпирика API (HTTP, без печати ключей)

| Команда | Результат | Метка |
|---|---|---|
| `GET https://api.deepseek.com/models` | 200: `deepseek-flash`, `deepseek-v4-pro` | FACT |
| `GET https://api.deepseek.com/user/balance` | `is_available:true`; USD 11.92 (topped_up 11.92, granted 0); CNY 121.82 | FACT |
| `GET https://openrouter.ai/api/v1/models` | 200: 458 моделей, 21 с prompt=completion=0 | FACT |
| `GET https://openrouter.ai/api/v1/key` | 200: `usage=0.082266292`, `limit=null`, `is_free_tier=true`, `free_model_daily_requests {used:0, limit:50, remaining:50}` | FACT |
| `GET https://openrouter.ai/api/v1/credits` | `total_credits=0`, `total_usage=0.074867992` | FACT |
| `POST /api/v1/chat/completions` `nvidia/nemotron-3.5-lightning:free` | 200, ответ получен | FACT |
| `POST ...` `google/gemma-4-26b-a4b-it:free` | HTTP 429 `temporarily rate-limited upstream ... shared pool` | FACT |
| `GET https://huggingface.co/api/whoami-v2` | 200, `isPro=false` | FACT |
| `GET https://router.huggingface.co/v1/models` | 200, 140 моделей | FACT |
| `GET https://api.moonshot.ai/v1/models` | 4 модели: `kimi-k2.6`, `kimi-k3`, `kimi-k2.7-code`, `kimi-k2.7-code-highspeed` | FACT |
| `GET https://api.moonshot.ai/v1/users/me/balance` | `available_balance 3.1468701`, voucher 0 (валюта не указана) | FACT |
| `GET https://ai-gateway.vercel.sh/v1/models` | 200, 391 модель | FACT |
| `GET https://ai-gateway.vercel.sh/v1/credits` | `{"balance":"4.98586991","total_used":"0.01413009"}` | FACT |
| `kimi provider list`; `C:\Users\Dmitry\.kimi-code\config.toml` | managed:kimi-code (oauth), moonshot-ai (inline key, значение не приводится); 4+4 модели | FACT |
| `C:\Users\Dmitry\.config\mimocode\mimocode.jsonc` | openrouter/deepseek/deepseek-v4.1-flash; комментарий «MiMo Auto free channel has ended» (2026-09-25) | FACT (конфиг); OPEN QUESTION (официальный источник) |

## 3. Официальные ссылки (снято 2026-09-27)

- Gemini API: https://ai.google.dev/gemini-api/docs/pricing (верификатор использовал тот же путь)
- Anthropic: https://www.anthropic.com/pricing
- GitHub Copilot billing: https://docs.github.com/en/copilot/concepts/billing
- DeepSeek: https://api-docs.deepseek.com/quick_start/pricing (у верификатора тайм-аут)
- Moonshot: https://platform.moonshot.ai/docs/pricing/chat (у верификатора таблицы не извлеклись)
- OpenRouter limits: https://openrouter.ai/docs/api-reference/limits
- HuggingFace: https://huggingface.co/docs/inference-providers/pricing
- Kilo: https://kilo.ai/pricing (Auto Free $0/mo)
- Vercel: https://vercel.com/docs/ai-gateway/pricing, /faq
- Kimi Code membership: https://www.kimi.com/code/docs/en/kimi-code/membership.html
  (цены: https://www.kimi.ai/code/#pricing — JS, не сняты)

## 4. Верификатор round 2 (вердикт FAIL к черновикам)

- Проверено 28 ценовых строк (больше требуемых 20); все URL — официальные.
- **CONFIRMED**: Gemini API 2.5-family (standard/batch) и `gemma-4` free; OpenRouter
  `deepseek/deepseek-v4.1-flash` 0.035/0.29, `kimi-k3` 3/15, `glm-5.3-flash` 0.04/0.50;
  Vercel `kimi-k3` 3/15, `kimi-k2.7-code-highspeed` 1.90/8.
- **REFUTED**: «все `:free`-варианты 0/0» (не каждый вариант); Vercel «ровно 4 модели 0/0»
  (официальный документ: $5 free usage/month).
- **UNVERIFIABLE**: подписочные включения (agy/claude/codex/copilot/vibe), DeepSeek/Moonshot/HF
  таблицы, Kilo-цены (EPERM), численные квоты Gemini Free Tier, «24 free-строки» Kilo.
- Воспроизведения верификатора: `agy models` (14 строк, совпало с A); `kimi --version` →
  `2.1.1`; `mimo --version` → `0.1.15`; `kilo --version` → EPERM
  (`operation not permitted, open ...\.kilo-write-...`; `EPERM ... mkdir ...\.local\share\kilo\state`).
- Форма: A=108, B=245 строк (PASS <=250); метки по строкам таблиц — FAIL (учтено в сводных
  реестрах); скан секретов — PASS (только имена `HF_TOKEN`).

## 5. Условия сбора (для воспроизводимости)

- Коллекторы исполнялись в приватных клонах (`disp-cr-collector-a-1-*`, `-b-1-*`), HEAD
  `9cda8dd`; секреты не печатались, конфиги не изменялись; генерационные вызовы с ключами
  HF/Vercel/Moonshot/DeepSeek сознательно не выполнялись (правило «трата → OPEN QUESTION»).
- K-launch пометил попытки `POLICY_FAILURE` из-за незакоммиченных `copyIn`-файлов (ошибка
  конфигурации оператора, не коллекторов); отчёты и журналы спасены из сохранённых клонов.
