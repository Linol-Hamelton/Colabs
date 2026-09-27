# PRICES-OFFICIAL: официальные цены (сводный реестр)

Оператор: `kilo-9a9b18229cce57fd`. Дата сведения: 2026-09-27 (UTC). Источники: `round1/COLLECTOR-A.md`,
`round1/COLLECTOR-B.md`, `round2/VERIFICATION.md`. Все цены — USD за 1M токенов, объявлены
вендором/gateway; колонка «Проверка» — вердикт независимого верификатора (CONFIRMED /
UNVERIFIABLE / REFUTED / не проверялось). Агрегаторные обзоры не использовались. Метки: FACT —
число из официального канала; OPEN QUESTION — не воспроизведено.

## Gemini API (Google AI) — https://ai.google.dev/gemini-api/docs/pricing, 2026-09-27

| Модель | Input / 1M | Output / 1M | Caching (read / storage) | Проверка |
|---|---:|---:|---|---|
| `gemini-2.5-flash` Standard | 0.30 | 2.50 | 0.03 / 1.00·1M/ч | CONFIRMED |
| `gemini-2.5-flash` Batch/Flex | 0.15 | 1.25 | 0.03 / 1.00·1M/ч | CONFIRMED |
| `gemini-2.5-flash` Priority | 0.54 | 4.50 | 0.054 / 1.80·1M/ч | не проверялось (FACT из страницы) |
| `gemini-2.5-flash-lite` Standard | 0.10 | 0.40 | 0.01 / 1.00·1M/ч | CONFIRMED |
| `gemini-2.5-flash-lite` Batch/Flex | 0.05 | 0.20 | 0.01 / 1.00·1M/ч | CONFIRMED |
| `gemini-2.5-flash-lite` Priority | 0.18 | 0.72 | 0.018 / 1.80·1M/ч | не проверялось (FACT из страницы) |
| `gemini-2.5-pro` ≤200k | 1.25 | 10.00 | 0.125 / 4.50·1M/ч | CONFIRMED |
| `gemini-2.5-pro` >200k | 2.50 | 15.00 | 0.25 / 4.50·1M/ч | CONFIRMED |
| `gemini-2.5-pro` Batch ≤200k | 0.625 | 5.00 | 0.125 / 4.50·1M/ч | не проверялось (FACT из страницы) |
| `gemini-2.5-pro` Batch >200k | 1.25 | 7.50 | 0.25 / 4.50·1M/ч | не проверялось (FACT из страницы) |
| `gemini-3.5-flash-lite` | 0.30 | 0.30 (INFERENCE в черновике A) | 0.03 / 1.00·1M/ч | UNVERIFIABLE |
| `gemini-3-flash-preview` | 0.50 | 3.00 | 0.05 / 1.00·1M/ч | UNVERIFIABLE |
| `gemini-3.1-pro` ≤200k | 2.00 | 12.00 | 0.20 / 4.50·1M/ч | UNVERIFIABLE |
| `gemini-3.1-pro` >200k | 3.60 | 21.60 | 0.36 / 4.50·1M/ч | UNVERIFIABLE |
| `gemini-2.5-computer-use-preview` ≤200k/>200k | 1.25 / 2.50 | 10.00 / 15.00 | не применимо | не проверялось |
| `gemini-robotics-er-2-preview` | 1.00 | 5.00 | 0.10 / 0.50·1M/ч | не проверялось |
| `gemini-embedding-2` Text / Image | 0.20 / 0.45 | 0.00 | — | не проверялось |
| `gemini-2.5-flash-native-audio` | 0.50 text / 3.00 audio | 2.00 text / 12.00 audio | — | не проверялось |
| `gemini-2.5-flash-image` | 0.30 | 0.039 / изображение | — | не проверялось |
| `gemma-4` | 0.00 (Free Tier) | 0.00 (Free Tier) | 0.00 | CONFIRMED |

## DeepSeek own key — https://api-docs.deepseek.com/quick_start/pricing, 2026-09-27

| Модель | Вход miss (off-peak / peak) | Вход cache hit | Выход (off-peak / peak) | Проверка |
|---|---:|---:|---:|---|
| `deepseek-flash` | 0.15 / 0.30 | 0.003 / 0.006 | 0.60 / 1.20 | UNVERIFIABLE (страница тайм-аутилась у верификатора) |
| `deepseek-v4-pro` | 0.66 / 1.32 | 0.022 / 0.044 | 1.98 / 3.96 | UNVERIFIABLE (там же) |

Эмпирика B (FACT): мини-вызов BYOK списал 0.00351738 USD за 23 386 вх./3 вых. — сходится с
off-peak ценой Flash (INFERENCE из цены). Баланс: 11.92 USD (topped_up 11.92, granted 0; CNY 121.82).

## Moonshot API (ключ из конфига kimi) — https://platform.moonshot.ai/docs/pricing/chat, 2026-09-27

| Модель | Вход | Выход | Cache hit | Контекст | Проверка |
|---|---:|---:|---:|---:|---|
| `kimi-k3` | 3.00 | 15.00 | 0.30 | 1 048 576 | UNVERIFIABLE |
| `kimi-k2.7-code` | 0.95 | 4.00 | 0.19 | 262 144 | UNVERIFIABLE |
| `kimi-k2.7-code-highspeed` | 1.90 | 8.00 | 0.38 | 262 144 | UNVERIFIABLE |
| `kimi-k2.6` | 0.95 | 4.00 | 0.16 | 262 144 | UNVERIFIABLE |

Баланс: available 3.1468701 (валюта в ответе не указана) — OPEN QUESTION.

## OpenRouter — https://openrouter.ai/api/v1/models, 2026-09-27

| Модель | Вход | Выход | Контекст | Проверка |
|---|---:|---:|---:|---|
| `deepseek/deepseek-v4.1-flash` | 0.035 | 0.29 | 1.05M | CONFIRMED |
| `moonshotai/kimi-k3` | 3.00 | 15.00 | 1.05M | CONFIRMED |
| `moonshotai/kimi-k2.6` | 0.95 | 4.00 | 262K | не проверялось |
| `moonshotai/kimi-k2.7-code` | 0.6562 | 3.30 | 262K | не проверялось |
| `xiaomi/mimo-v2.5` | 0.14 | 0.28 | 1.05M | не проверялось |
| `z-ai/glm-5.3-flash` | 0.04 | 0.50 | 1.31M | CONFIRMED |
| `minimax/minimax-m3` | 0.30 | 1.20 | 1.05M | не проверялось |
| варианты `:free` | 0 | 0 | от 262K | REFUTED как «все»: не каждый вариант 0/0 (верификатор) |

## Kilo-шлюз — `kilo models --verbose`, 2026-09-27 (официальный листинг шлюза)

| Модель | Вход | Выход | Проверка |
|---|---:|---:|---|
| `kilo/deepseek/deepseek-v4.1-flash` | 0.30 | 1.20 | UNVERIFIABLE (EPERM у верификатора) |
| `kilo/~deepseek/deepseek-flash-latest` | 0.035 | 0.29 | UNVERIFIABLE |
| `kilo/moonshotai/kimi-k3` | 3.00 | 15.00 | UNVERIFIABLE |
| `kilo/moonshotai/kimi-k2.6` | 0.95 | 4.00 | UNVERIFIABLE |
| `kilo/moonshotai/kimi-k2.7-code` | 0.6562 | 3.30 | UNVERIFIABLE |
| `kilo/xiaomi/mimo-v2.5` | 0.14 | 0.28 | UNVERIFIABLE |
| `kilo/xiaomi/mimo-v2.6-flash` | 0.14 | 0.28 | UNVERIFIABLE |
| `kilo/z-ai/glm-4.7-flash` | 0.0605 | 0.40 | UNVERIFIABLE |
| `kilo/z-ai/glm-5.3-flash` | 0.15 | 0.50 | UNVERIFIABLE |
| `kilo/qwen/qwen3.7-flash` | 0.03 | 0.13 | UNVERIFIABLE |
| `kilo/qwen/qwen3.5-flash-02-23` | 0.065 | 0.26 | UNVERIFIABLE |
| `kilo/minimax/minimax-m3` | 0.30 | 1.20 | UNVERIFIABLE |

Эмпирика B (FACT): `kilo run -m deepseek/deepseek-flash` списал 0.00351738 USD за 23 386/3
токенов (провайдер deepseek BYOK). `kilo profile` → `Balance: $-0.00` (02:10 UTC).

## Vercel AI Gateway — https://ai-gateway.vercel.sh/v1/models, 2026-09-27

| Модель | Вход | Выход | Cache read | Проверка |
|---|---:|---:|---:|---|
| `deepseek/deepseek-v4.1-flash` | 0.30 | 1.20 | 0.007 | не проверялось |
| `deepseek/deepseek-v4-flash` | 0.13 | 0.26 | 0.028 | не проверялось |
| `deepseek/deepseek-v4-pro` | 0.66 | 1.98 | 0.022 | не проверялось |
| `moonshotai/kimi-k3` | 3.00 | 15.00 | 0.30 | CONFIRMED |
| `moonshotai/kimi-k2.7-code` | 0.95 | 4.00 | 0.19 | не проверялось |
| `moonshotai/kimi-k2.7-code-highspeed` | 1.90 | 8.00 | 0.38 | CONFIRMED |
| `moonshotai/kimi-k2.6` | 0.95 | 4.00 | 0.16 | не проверялось |
| `xiaomi/mimo-v2.5` | 0.14 | 0.28 | 0.0028 | не проверялось |
| `zai/glm-5.3-flash` | 0.15 | 0.50 | 0.03 | не проверялось |
| `minimax/minimax-m3` | 0.30 | 1.20 | 0.06 | не проверялось |

Баланс: 4.98586991 USD (total_used 0.01413009) — FACT. Free tier: $5/мес кредит (страница
документации; точный состав моделей — OPEN QUESTION).

## HuggingFace router — https://router.huggingface.co/v1/models, 2026-09-27

| Модель | Провайдер(ы) in/out | Проверка |
|---|---|---|
| `DeepSeek-V4.1-Flash` | deepinfra 0.20/0.60; novita 0.30/1.20; baseten 0.30/1.20 | UNVERIFIABLE |
| `Kimi-K3` | deepinfra 2.85/14.25; together/fireworks/baseten 3/15 | UNVERIFIABLE |
| `Kimi-K2.6` | deepinfra 0.75/3.5; novita 0.8/3.4; baseten 0.95/4 | не проверялось |
| `MiMo-V2.5` | deepinfra 0.14/0.28; novita 0.168/0.336 | не проверялось |
| `MiMo-V2.5-Pro` | novita 0.522/1.044; deepinfra 1/3 | не проверялось |
| `GLM-5.3-Flash` | novita/together/baseten/deepinfra 0.15/0.5 | не проверялось |
| `MiniMax-M3` | deepinfra 0.28/1.1; novita/together/fireworks 0.3/1.2 | не проверялось |
| `Qwen3.8-27B` | deepinfra 0.2/2.5; novita 0.42/3; cerebras 0.99/1.49 | не проверялось |

## Планы подписок (справочно; не «in/out за 1M»)

| Сервис | План и цена | Источник+дата | Метка |
|---|---|---|---|
| claude | Pro $20/мес; Max 5x/20x от $100/мес; Team $25/seat/мес | https://www.anthropic.com/pricing, 2026-09-27 | FACT (страница); не проверялось верификатором |
| copilot | Individual $10/мес; Business $19/seat/мес; Enterprise $39/seat/мес | https://docs.github.com/en/copilot/concepts/billing, 2026-09-27 | FACT (страница) |
| codex | Plus $20/мес, Pro $200/мес, Team $25/seat/мес | URL в черновике A не приведён | OPEN QUESTION |
| vibe | «$300 allowance» | URL не приведён | OPEN QUESTION |
| Kimi Code | Plus+/Pro+ уровни; численные цены — JS-страницы | kimi.com/code/docs membership | OPEN QUESTION (цены) |

## Ограничения

- Часть страниц не воспроизвелась у верификатора (DeepSeek тайм-аут, Moonshot/HF таблицы,
  Kilo EPERM): соответствующие числа помечены UNVERIFIABLE, не удалены (история сохраняется).
- Ни одна строка не является агрегаторным обзором: только официальные страницы вендоров и
  официальные каталоги шлюзов.
