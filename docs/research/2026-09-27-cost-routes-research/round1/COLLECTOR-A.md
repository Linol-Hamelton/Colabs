# COLLECTOR-A: нулевые маршруты и официальные цены (сбор A)

Дата сбора: 2026-09-27 (UTC) | Агент: `gemini` (Gemini 3.7 Flash high через `agy`)

## agy (Google / Antigravity)
- **Q1 Модели (FACT)**: CLI `agy` v1.2.11. Список из `agy models`: `gemini-3.8-flash-high`, `gemini-3.8-flash-medium`, `gemini-3.8-flash-low`, `gemini-3.7-flash-high`, `gemini-3.7-flash-medium`, `gemini-3.7-flash-low`, `gemini-3.6-flash-high`, `gemini-3.6-flash-medium`, `gemini-3.6-flash-low`, `gemini-3.1-pro-high`, `gemini-3.1-pro-low`, `claude-sonnet-4-6`, `claude-opus-4-6-thinking`, `gpt-oss-120b-medium`. Выбор: флаг `--model <id>`, усилие `--effort <low|medium|high|max>`.
- **Q2 $0 (FACT)**: Маржинальная стоимость $0 на активной подписке Google AI / квоте Antigravity. Механизм: включено в тариф (included / rolling quota).
- **Q3 Исчерпание (FACT/OPEN QUESTION)**: Команда `agy -p "Reply with exactly: PONG" --model gemini-3.7-flash-low` -> Вывод: `PONG`, Код: 0. Лимит в тесте не исчерпан (FACT). Текст ошибки при исчерпании: OPEN QUESTION.
- **Q4 Тарифная модель (FACT)**: Квота подписки аккаунта. При исчерпании сессия блокируется до сброса скользящего окна квоты.
- **Q5 API (FACT)**: См. раздел «Gemini API (Google AI Studio)».
- **Q6 Бесплатно до нуля баланса (FACT)**: Не применимо (подписочная квота).
- **Q7 Практика (INFERENCE)**: Отлично подходит для диспетчера: контекст 1M+ токенов, высокая скорость генерации на Flash-уровнях, поддержка мультиагентных циклов.

## claude (Anthropic Claude Code)
- **Q1 Модели (FACT)**: CLI `claude` v2.1.283. Доступные алиасы/модели: `fable`, `opus`, `sonnet`, `claude-fable-5`, `claude-opus-5`, `claude-opus-4.8`, `claude-opus-4.7`, `claude-opus-4.6`, `claude-sonnet-5`, `claude-sonnet-4.6`, `claude-haiku-4.5`. Выбор: `--model <id/alias>`, `--fallback-model <model>`.
- **Q2 $0 (FACT)**: $0 на марже в рамках подписок Claude Pro ($20/мес), Claude Max (5x/20x от $100/мес), Claude Team ($25/seat/мес). Механизм: скользящее окно 5 часов + недельный лимит (https://www.anthropic.com/pricing, 2026-09-27).
- **Q3 Исчерпание (FACT)**: Команда `claude -p "Reply with exactly: PONG"` -> Код: 1. Вывод: `You've hit your weekly limit · resets 2pm (Europe/Moscow)`. При исчерпании недельного лимита CLI полностью отказывает с кодом 1.
- **Q4 Тарифная модель (FACT)**: Общий пул запросов для web/desktop/CLI. Окно 5 часов + недельный лимит. После исчерпания CLI блокирует вызовы до даты сброса либо покупки доп. емкости.
- **Q5 API (FACT)**: no key in inventory.
- **Q6 Бесплатно до нуля баланса (FACT)**: Не применимо.
- **Q7 Практика (INFERENCE)**: Высокое качество рассуждений, контекст 200k+, но жесткие недельные и 5-часовые лимиты делают невозможным автономный непрерывный прогон при исчерпании.

## codex (OpenAI Codex CLI)
- **Q1 Модели (FACT)**: CLI `codex-cli` v0.154.0. Модели: `gpt-5.6-luna`, `gpt-5.6-sol`, `gpt-5.6-terra`, `gpt-6-astra`, `o3`, `o1`, `gpt-4o`. Выбор: флаг `-m, --model <id>` или `-c model="<id>"`.
- **Q2 $0 (FACT)**: $0 на марже в подписках ChatGPT Plus ($20/мес), Pro ($200/мес), Team ($25/seat/мес). Механизм: скользящая квота сообщений/рассуждений.
- **Q3 Исчерпание (FACT/OPEN QUESTION)**: Команда `$null | codex exec -m gpt-5.6-luna "Reply with exactly: PONG" --skip-git-repo-check` -> Вывод: `PONG` (tokens used: 10 644), Код: 0. Лимит не достигнут (FACT). Текст ошибки при исчерпании: OPEN QUESTION.
- **Q4 Тарифная модель (FACT)**: Месячная подписка; для reasoning-моделей действуют ограничения на число сообщений в 3-часовом скользящем окне.
- **Q5 API (FACT)**: no key in inventory.
- **Q6 Бесплатно до нуля баланса (FACT)**: Не применимо.
- **Q7 Практика (INFERENCE)**: Высокая автономность и глубина решения задач, подходит для диспетчерских циклов с контролем частоты вызовов.

## copilot (GitHub Copilot CLI)
- **Q1 Модели (FACT)**: CLI `copilot` v1.0.88. Модели (`copilot help config`): `claude-sonnet-5`, `claude-fable-5.1`, `claude-fable-5`, `claude-opus-5`, `claude-opus-4.8`, `claude-opus-4.8-fast`, `claude-opus-4.7`, `claude-sonnet-4.6`, `claude-haiku-4.5`, `gpt-6-astra`, `gpt-5.6-sol`, `gpt-5.6-terra`, `gpt-5.6-luna`, `gpt-5.5`, `gpt-5.4`, `gpt-5.4-mini`, `gpt-5.3-codex`, `gpt-5-mini`, `mai-code-1.1-flash`, `gemini-3.8-flash`, `gemini-3.7-flash`, `gemini-3.6-flash`, `gemini-3.5-flash`, `grok-4.5`, `kimi-k3`, `kimi-k2.7-code`. Выбор: `--model <id>`.
- **Q2 $0 (FACT)**: $0 на марже в подписках Individual ($10/мес), Business ($19/seat/мес), Enterprise ($39/seat/мес), Pro ($20/мес). Механизм: месячный пул AI Credits / Premium Requests (https://docs.github.com/en/copilot/concepts/billing, 2026-09-27).
- **Q3 Исчерпание (FACT)**: Команда `copilot -p "Reply with exactly: PONG" --allow-all` -> Код: 1. Вывод: `You have exceeded your monthly quota (Request ID: AE46:1EF2:1C54D44:23BD5B7:6AB8796C) AI Credits 0 (5s)`. CLI полностью блокирует выполнение.
- **Q4 Тарифная модель (FACT)**: Месячный пакет кредитов; сброс раз в месяц по расчетному циклу. При исчерпании вызовы всех моделей блокируются до нового месяца.
- **Q5 API (FACT)**: no key in inventory.
- **Q6 Бесплатно до нуля баланса (FACT)**: Не применимо.
- **Q7 Практика (INFERENCE)**: Богатый выбор мульти-вендорных моделей, но быстрый расход месячной квоты в агентных циклах делает канал рискованным без запаса кредитов.

## vibe (Mistral Vibe CLI)
- **Q1 Модели (FACT)**: CLI `vibe` v2.25.8. Модели (`~/.vibe/config.toml`, доки Mistral): `mistral-medium-3.5`, `mistral-large-2411`, `codestral-2501`, `devstral`, `open-mistral-nemo`, `ministral-8b-latest`. Выбор: alias в `config.toml` или `VIBE_ACTIVE_MODEL`.
- **Q2 $0 (FACT)**: $0 в рамках квоты Vibe ($300 allowance для Vibe CLI) либо баланса подписки Mistral. Окно сброса: расчетный период.
- **Q3 Исчерпание (FACT/OPEN QUESTION)**: Команда `$null | vibe -p "Reply with exactly: PONG" --enabled-tools read_file --max-turns 1 --trust` -> Вывод: `PONG`, Код: 0. Лимит не исчерпан (FACT). Текст ошибки исчерпания: OPEN QUESTION.
- **Q4 Тарифная модель (FACT)**: Доступ по ключу/токену платформы Mistral с пулом Vibe CLI.
- **Q5 API (FACT)**: no key in inventory.
- **Q6 Бесплатно до нуля баланса (FACT)**: Не применимо.
- **Q7 Практика (INFERENCE)**: Эффективен для код-ревью и быстрых правок; требует явных флагов `--trust` и `--enabled-tools` при скриптовании.

## Gemini API (Google AI Studio)
- **Q1 Модели (FACT)**: Официальный список (https://ai.google.dev/pricing, 2026-09-27): `gemini-2.5-flash`, `gemini-2.5-flash-lite`, `gemini-2.5-pro`, `gemini-3.5-flash-lite`, `gemini-3.5-flash`, `gemini-3.5-transcribe`, `gemini-3.5-transcribe-live`, `gemini-3-flash-preview`, `gemini-3.1-pro`, `gemini-3.8-flash-tts`, `gemini-3.8-flash-lite-tts`, `gemini-2.5-flash-preview-tts`, `gemini-2.5-pro-preview-tts`, `gemini-2.5-flash-native-audio-preview-12-2025`, `gemini-2.5-flash-image`, `gemini-3.1-flash-image`, `gemini-3.1-flash-lite-image`, `gemini-3-pro-image`, `gemini-2.5-computer-use-preview-10-2025`, `gemini-embedding-2`, `gemini-robotics-er-2-preview`, `gemini-robotics-er-2-streaming-preview`, `gemma-4`, `veo-3.1-generate-preview`, `lyria-3.5`.
- **Q2 $0 (FACT)**: Free Tier ($0): `gemini-2.5-flash` (15 RPM / 1M TPM / 1500 RPD), `gemini-2.5-flash-lite` (30 RPM / 1M TPM / 1500 RPD), `gemini-2.5-pro` (2 RPM / 32k TPM / 50 RPD), `gemini-3.5-flash-lite`, `gemini-3-flash-preview`, `gemini-embedding-2`, `gemma-4`. Механизм: бесплатный суточный/минутный лимит (сброс посуточно).
- **Q3 Исчерпание (FACT)**: Ошибка HTTP 429 Too Many Requests (`RESOURCE_EXHAUSTED`).
- **Q4 Тарифная модель (FACT)**: Pay-as-you-go (Paid Tier) тарификация за 1M токенов (USD). Бесплатный уровень доступен параллельно с лимитом RPD/RPM.
- **Q5 API цены (FACT)**: Цены за 1M токенов приведены в итоговой таблице (источник: https://ai.google.dev/pricing, 2026-09-27).
- **Q6 Бесплатно до нуля баланса (FACT)**: Free Tier бесплатен бессрочно в рамках лимитов без списания баланса; Paid Tier тарифицируется по факту использования.
- **Q7 Практика (INFERENCE)**: Наиболее масштабируемый маршрут: контекст до 1M-2M токенов, сверхнизкая цена на Flash-Lite ($0.10/$0.40) и Flash ($0.30/$2.50), отсутствие блокировок при наличии биллинга.

## Итоговая таблица: кандидаты $0 (сервис | CLI | модель id | механизм | лимит | окно | проверка | источник+дата)
| Сервис | CLI | Модель ID | Механизм $0 | Лимит | Окно | Проверка | Источник + дата |
|---|---|---|---|---|---|---|---|
| Google/AGY | `agy` | `gemini-3.7-flash-high` | Included (подписка) | Пул подписки | Скользящее | Exit 0 (PONG) | `agy models`, 2026-09-27 |
| Google/AGY | `agy` | `gemini-3.7-flash-low` | Included (подписка) | Пул подписки | Скользящее | Exit 0 (PONG) | `agy models`, 2026-09-27 |
| Google/AGY | `agy` | `gemini-3.8-flash-high` | Included (подписка) | Пул подписки | Скользящее | FACT в списке | `agy models`, 2026-09-27 |
| Google/AGY | `agy` | `claude-sonnet-4-6` | Included (подписка) | Пул подписки | Скользящее | FACT в списке | `agy models`, 2026-09-27 |
| Anthropic | `claude` | `sonnet` / `claude-sonnet-4.6` | Included (Pro/Team) | 5h rolling / weekly | 5h / 1 неделя | Exit 1 (weekly limit) | https://www.anthropic.com/pricing, 2026-09-27 |
| OpenAI | `codex` | `gpt-5.6-luna` | Included (Plus/Pro) | Сообщений / 3h | 3 часа | Exit 0 (PONG) | `codex exec`, 2026-09-27 |
| OpenAI | `codex` | `gpt-5.6-sol` | Included (Plus/Pro) | Сообщений / 3h | 3 часа | FACT в конфиге | `~/.codex/config.toml`, 2026-09-27 |
| GitHub | `copilot` | `gpt-5.6-sol` | Included (AI Credits) | Месячная квота | 1 месяц | Exit 1 (quota exceeded) | https://docs.github.com/en/copilot/concepts/billing, 2026-09-27 |
| GitHub | `copilot` | `claude-sonnet-4.6` | Included (AI Credits) | Месячная квота | 1 месяц | Exit 1 (quota exceeded) | https://docs.github.com/en/copilot/concepts/billing, 2026-09-27 |
| Mistral | `vibe` | `mistral-medium-3.5` | Vibe allowance ($300) | Пул $300 | Месяц / баланс | Exit 0 (PONG) | `~/.vibe/config.toml`, 2026-09-27 |
| Gemini API | API | `gemini-2.5-flash` | Free Tier ($0) | 15 RPM, 1.5k RPD | 1 мин / 1 день | FACT в тарифах | https://ai.google.dev/pricing, 2026-09-27 |
| Gemini API | API | `gemini-2.5-flash-lite` | Free Tier ($0) | 30 RPM, 1.5k RPD | 1 мин / 1 день | FACT в тарифах | https://ai.google.dev/pricing, 2026-09-27 |
| Gemini API | API | `gemini-2.5-pro` | Free Tier ($0) | 2 RPM, 50 RPD | 1 мин / 1 день | FACT в тарифах | https://ai.google.dev/pricing, 2026-09-27 |
| Gemini API | API | `gemini-3-flash-preview` | Free Tier ($0) | Free Tier пул | 1 мин / 1 день | FACT в тарифах | https://ai.google.dev/pricing, 2026-09-27 |
| Gemini API | API | `gemma-4` | Free Tier ($0) | Free of charge | Постоянно | FACT в тарифах | https://ai.google.dev/pricing, 2026-09-27 |

## Итоговая таблица: цены (сервис | модель | in/out за 1M | валюта | URL+дата)
| Сервис | Модель | Input / 1M | Output / 1M | Caching Read / Storage | Валюта | URL + дата |
|---|---|---|---|---|---|---|
| Gemini API | `gemini-2.5-flash` (Standard) | $0.30 | $2.50 | $0.03 / $1.00/1M/h | USD | https://ai.google.dev/pricing, 2026-09-27 |
| Gemini API | `gemini-2.5-flash` (Batch/Flex) | $0.15 | $1.25 | $0.03 / $1.00/1M/h | USD | https://ai.google.dev/pricing, 2026-09-27 |
| Gemini API | `gemini-2.5-flash` (Priority) | $0.54 | $4.50 | $0.054 / $1.80/1M/h | USD | https://ai.google.dev/pricing, 2026-09-27 |
| Gemini API | `gemini-2.5-flash-lite` (Standard) | $0.10 | $0.40 | $0.01 / $1.00/1M/h | USD | https://ai.google.dev/pricing, 2026-09-27 |
| Gemini API | `gemini-2.5-flash-lite` (Batch/Flex) | $0.05 | $0.20 | $0.01 / $1.00/1M/h | USD | https://ai.google.dev/pricing, 2026-09-27 |
| Gemini API | `gemini-2.5-flash-lite` (Priority) | $0.18 | $0.72 | $0.018 / $1.80/1M/h | USD | https://ai.google.dev/pricing, 2026-09-27 |
| Gemini API | `gemini-2.5-pro` (<=200k) | $1.25 | $10.00 | $0.125 / $4.50/1M/h | USD | https://ai.google.dev/pricing, 2026-09-27 |
| Gemini API | `gemini-2.5-pro` (>200k) | $2.50 | $15.00 | $0.25 / $4.50/1M/h | USD | https://ai.google.dev/pricing, 2026-09-27 |
| Gemini API | `gemini-2.5-pro` (Batch <=200k) | $0.625 | $5.00 | $0.125 / $4.50/1M/h | USD | https://ai.google.dev/pricing, 2026-09-27 |
| Gemini API | `gemini-2.5-pro` (Batch >200k) | $1.25 | $7.50 | $0.25 / $4.50/1M/h | USD | https://ai.google.dev/pricing, 2026-09-27 |
| Gemini API | `gemini-3.5-flash-lite` | $0.30 | $0.30 (INFERENCE) | $0.03 / $1.00/1M/h | USD | https://ai.google.dev/pricing, 2026-09-27 |
| Gemini API | `gemini-3-flash-preview` | $0.50 | $3.00 | $0.05 / $1.00/1M/h | USD | https://ai.google.dev/pricing, 2026-09-27 |
| Gemini API | `gemini-3.1-pro` (<=200k) | $2.00 | $12.00 | $0.20 / $4.50/1M/h | USD | https://ai.google.dev/pricing, 2026-09-27 |
| Gemini API | `gemini-3.1-pro` (>200k) | $3.60 | $21.60 | $0.36 / $4.50/1M/h | USD | https://ai.google.dev/pricing, 2026-09-27 |
| Gemini API | `gemini-2.5-computer-use-preview` (<=200k) | $1.25 | $10.00 | Not available | USD | https://ai.google.dev/pricing, 2026-09-27 |
| Gemini API | `gemini-2.5-computer-use-preview` (>200k) | $2.50 | $15.00 | Not available | USD | https://ai.google.dev/pricing, 2026-09-27 |
| Gemini API | `gemini-robotics-er-2-preview` (2026 rate) | $1.00 | $5.00 | $0.10 / $0.50/1M/h | USD | https://ai.google.dev/pricing, 2026-09-27 |
| Gemini API | `gemini-embedding-2` (Text) | $0.20 | $0.00 | Not available | USD | https://ai.google.dev/pricing, 2026-09-27 |
| Gemini API | `gemini-embedding-2` (Image) | $0.45 ($0.00012/img) | $0.00 | Not available | USD | https://ai.google.dev/pricing, 2026-09-27 |
| Gemini API | `gemini-2.5-flash-native-audio` | $0.50 (text) / $3.00 (aud) | $2.00 (text) / $12.00 (aud) | Not available | USD | https://ai.google.dev/pricing, 2026-09-27 |
| Gemini API | `gemini-2.5-flash-image` (Nano Banana) | $0.30 | $0.039 / image | Not available | USD | https://ai.google.dev/pricing, 2026-09-27 |
| Gemini API | `gemma-4` | $0.00 (Free Tier) | $0.00 (Free Tier) | $0.00 / $0.00 | USD | https://ai.google.dev/pricing, 2026-09-27 |

## Сомнения и пробелы (OPEN QUESTION: что и где не подтвердилось)
1. **OPEN QUESTION (agy)**: Точный текст ошибки и код возврата при превышении квоты сессии Antigravity (`agy`), так как лимит на момент эмпирической проверки активен и не исчерпан.
2. **OPEN QUESTION (codex)**: Точный текст ошибки и поведение Codex CLI при полном исчерпании 3-часового лимита сообщений/токенов ChatGPT Plus/Pro.
3. **OPEN QUESTION (vibe)**: Граница разделения квоты Mistral Vibe ($300 allowance) и биллинга API ключа Mistral при длительной непрерывной работе в неинтерактивном режиме.
4. **OPEN QUESTION (copilot)**: Возможность автоматического переключения Copilot CLI на бесплатный/резервный пул при исчерпании месячных AI Credits (в тесте вызов завершился жестким отказом с exit code 1).
