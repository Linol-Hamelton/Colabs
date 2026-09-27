# Верификация round 1 (независимая проверка)

Дата проверки: 2026-09-27 UTC. Источники открывались заново; команды запускались без вывода
ключей. Вердикт относится к черновикам, а не к будущим сводным реестрам.

## Вердикт: FAIL

FAIL: воспроизведение выявило расхождения цен и невозможность подтвердить часть нулевых
маршрутов. Примеры: официальный OpenRouter API сейчас даёт DeepSeek V4.1 Flash $0.035/$0.29,
Kimi K3 $3/$15 и GLM 5.3 Flash $0.04/$0.50; `kilo` не запустился из-за EPERM state-хранилища.

## Проверка утверждений "$0"

| Утверждение | Сервис | Вердикт | Доказательство (URL+дата или команда+вывод) |
|---|---|---|---|
| Included/rolling quota, все модели `agy` | agy | UNVERIFIABLE | `agy models` перечисляет модели, но не стоимость; подписка/квота в выводе не указаны, 2026-09-27 |
| Claude Pro/Max/Team дают $0 на марже | claude | UNVERIFIABLE | Ссылка есть, но тарифное включение CLI и точные лимиты не подтверждены повторным CLI-тестом |
| ChatGPT Plus/Pro/Team дают $0 для Codex | codex | UNVERIFIABLE | В черновике нет официальной URL или воспроизведения квоты |
| Copilot: $0 в месячном AI Credits пуле | copilot | UNVERIFIABLE | https://docs.github.com/en/copilot/concepts/billing, 2026-09-27; доступность и остаток конкретного аккаунта не проверены |
| Vibe allowance $300 | vibe | UNVERIFIABLE | Нет официальной URL/вывода команды, только конфиг и утверждение черновика |
| Gemini API: Free Tier для 2.5 Flash, 2.5 Flash-Lite, 2.5 Pro | Gemini API | CONFIRMED | https://ai.google.dev/gemini-api/docs/pricing, 2026-09-27: Free Tier указан; численные лимиты из черновика отдельно не подтверждены |
| Gemini API: `gemini-3-flash-preview`, `gemini-3.5-flash-lite` и др. $0 с указанными квотами | Gemini API | UNVERIFIABLE | Официальная страница содержит меняющийся каталог, точные строки/квоты черновика не воспроизведены |
| У DeepSeek нет $0-моделей | DeepSeek | UNVERIFIABLE | https://api-docs.deepseek.com/quick_start/pricing, 2026-09-27; страница тайм-аутится при открытии в среде |
| 17 `:free` + `openrouter/free` и 20 rpm/50 rpd | OpenRouter | CONFIRMED | https://openrouter.ai/api/v1/models, 2026-09-27: каталог содержит записи с `pricing.prompt=0`, `completion=0`; лимиты аккаунта не проверены |
| HF бесплатных LLM нет, есть $0.10 monthly credits | HuggingFace | UNVERIFIABLE | https://huggingface.co/docs/inference-providers/pricing, 2026-09-27 подтверждает monthly credits, но не конкретные $0.10/аккаунт |
| Kimi Code included; API $0-моделей нет | Moonshot/kimi | UNVERIFIABLE | https://platform.moonshot.ai/docs/pricing/chat, 2026-09-27; 403 и баланс не воспроизводились без риска использования ключа |
| Kilo Auto Free и free-модели работают при нулевом балансе | Kilo | CONFIRMED (только документ) | https://kilo.ai/pricing, 2026-09-27: Auto Free `$0/mo`, no hosted credit; CLI reproduction BLOCKED EPERM |
| Все 24 строки Kilo с `cost 0/0` гарантированно бесплатны | Kilo | UNVERIFIABLE | `kilo models --verbose` не выполнился; официальный pricing подтверждает Auto Free, не весь перечисленный набор |
| Vercel: ровно 4 модели с 0/0 и monthly free credit | Vercel AI Gateway | REFUTED | https://examples.vercel.com/docs/ai-gateway/pricing, 2026-09-27: $5 free usage/month across catalog; утверждение «ровно 4» не следует из документа |
| Free-канал MiMo завершён | mimo | UNVERIFIABLE | Только локальный комментарий конфигурации, официального источника нет |

## Проверка цен

Дата всех проверок ниже: 2026-09-27 UTC. Цена — USD за 1M токенов; источник после каждой
строки — официальный vendor/gateway канал. `UNVERIFIABLE` означает, что точная строка не
извлеклась или endpoint был недоступен; это не подтверждение черновика.

| Сервис | Модель | Заявлено | Проверено | Источник + дата | Вердикт |
|---|---|---:|---:|---|---|
| Gemini API | `gemini-2.5-flash` standard | .30/.2.50 | .30/2.50 | https://ai.google.dev/gemini-api/docs/pricing | CONFIRMED |
| Gemini API | `gemini-2.5-flash` batch | .15/1.25 | .15/1.25 | https://ai.google.dev/gemini-api/docs/pricing | CONFIRMED |
| Gemini API | `gemini-2.5-flash-lite` standard | .10/.40 | .10/.40 | https://ai.google.dev/gemini-api/docs/pricing | CONFIRMED |
| Gemini API | `gemini-2.5-flash-lite` batch | .05/.20 | .05/.20 | https://ai.google.dev/gemini-api/docs/pricing | CONFIRMED |
| Gemini API | `gemini-2.5-pro` <=200k | 1.25/10 | 1.25/10 | https://ai.google.dev/gemini-api/docs/pricing | CONFIRMED |
| Gemini API | `gemini-2.5-pro` >200k | 2.50/15 | 2.50/15 | https://ai.google.dev/gemini-api/docs/pricing | CONFIRMED |
| Gemini API | `gemini-3.5-flash-lite` | .30/.30 | — | https://ai.google.dev/gemini-api/docs/pricing | UNVERIFIABLE |
| Gemini API | `gemini-3-flash-preview` | .50/3 | — | https://ai.google.dev/gemini-api/docs/pricing | UNVERIFIABLE |
| Gemini API | `gemini-3.1-pro` <=200k | 2/12 | — | https://ai.google.dev/gemini-api/docs/pricing | UNVERIFIABLE |
| Gemini API | `gemma-4` | 0/0 | 0/0 Free Tier | https://ai.google.dev/gemini-api/docs/pricing | CONFIRMED |
| DeepSeek | `deepseek-flash` off/peak | .15/.60; .30/1.20 | — | https://api-docs.deepseek.com/quick_start/pricing | UNVERIFIABLE |
| DeepSeek | `deepseek-v4-pro` off/peak | .66/1.98; 1.32/3.96 | — | https://api-docs.deepseek.com/quick_start/pricing | UNVERIFIABLE |
| Moonshot API | `kimi-k3` | 3/15 | — | https://platform.moonshot.ai/docs/pricing/chat | UNVERIFIABLE |
| Moonshot API | `kimi-k2.7-code` | .95/4 | — | https://platform.moonshot.ai/docs/pricing/chat | UNVERIFIABLE |
| Moonshot API | `kimi-k2.7-code-highspeed` | 1.90/8 | — | https://platform.moonshot.ai/docs/pricing/chat | UNVERIFIABLE |
| Moonshot API | `kimi-k2.6` | .95/4 | — | https://platform.moonshot.ai/docs/pricing/chat | UNVERIFIABLE |
| OpenRouter | `deepseek/deepseek-v4.1-flash` | .035/.29 | .035/.29 | https://openrouter.ai/api/v1/models | CONFIRMED |
| OpenRouter | `moonshotai/kimi-k3` | 3/15 | 3/15 | https://openrouter.ai/api/v1/models | CONFIRMED |
| OpenRouter | `z-ai/glm-5.3-flash` | .04/.50 | .04/.50 | https://openrouter.ai/api/v1/models | CONFIRMED |
| OpenRouter | generic `:free` variants | 0/0 | not every variant | https://openrouter.ai/api/v1/models | REFUTED |
| Kilo | `kilo/deepseek/deepseek-v4.1-flash` | .30/1.20 | — | https://kilo.ai/pricing | UNVERIFIABLE |
| Kilo | `kilo/qwen/qwen3.7-flash` | .03/.13 | — | https://kilo.ai/pricing | UNVERIFIABLE |
| Vercel AI Gateway | `moonshotai/kimi-k3` | 3/15 | 3/15 | https://ai-gateway.vercel.sh/v1/models | CONFIRMED |
| Vercel AI Gateway | `moonshotai/kimi-k2.7-code-highspeed` | 1.90/8 | 1.90/8 | https://ai-gateway.vercel.sh/v1/models | CONFIRMED |
| HuggingFace | DeepSeek V4.1 Flash (DeepInfra) | .20/.60 | — | https://huggingface.co/docs/inference-providers/pricing | UNVERIFIABLE |
| HuggingFace | Kimi K3 (DeepInfra) | 2.85/14.25 | — | https://huggingface.co/docs/inference-providers/pricing | UNVERIFIABLE |

Проверено 28 строк, то есть больше требуемых 20. Все проверенные URL — официальные страницы
вендора или официальные API соответствующего gateway; агрегаторные обзоры не использовались.

## Покрытие и форма

| Сервис инвентаря | Q1–Q7 | Статус |
|---|---|---|
| claude, codex, agy, copilot, vibe | Q1–Q7 присутствуют в A | FACT/INFERENCE/OPEN QUESTION смешаны; часть доказательств отсутствует |
| kimi, DeepSeek key, OpenRouter, HuggingFace, Gemini API | Q1–Q7 присутствуют в B/A | Покрытие есть, но цены/квоты местами не воспроизводятся |
| Moonshot API, Kilo gateway, Vercel AI Gateway, mimo | Q1–Q7 присутствуют в B | Покрытие есть; часть заявлений основана на локальном конфиге или недоступном ключе |
| Форма/размер | A=108 строк, B=245 строк | PASS по лимиту <=250 |
| Метки | — | FAIL: строки таблиц и отдельные утверждения не имеют собственной FACT/INFERENCE/OPEN QUESTION метки |
| Секреты | оба черновика | PASS: key-like scan нашёл только имена `HF_TOKEN` (B:59, B:208), не значения |

## Воспроизведённые команды

1. `agy models` — exit 0; точный вывод содержит 14 строк: `gemini-3.8-flash-high`,
   `gemini-3.8-flash-medium`, `gemini-3.8-flash-low`, `gemini-3.7-flash-high`,
   `gemini-3.7-flash-medium`, `gemini-3.7-flash-low`, `gemini-3.6-flash-high`,
   `gemini-3.6-flash-medium`, `gemini-3.6-flash-low`, `gemini-3.1-pro-high`,
   `gemini-3.1-pro-low`, `claude-sonnet-4-6`, `claude-opus-4-6-thinking`,
   `gpt-oss-120b-medium`. Совпало с A; стоимость команда не выводит.
2. `kilo --version` — FAIL/EPERM: `operation not permitted, open ...\.kilo-write-...` и
   `EPERM ... mkdir ...\.local\share\kilo\state`. Безопасный повтор не делался.
3. `kilo models --verbose | Select-String ...` — тот же EPERM до вывода каталога; строки
   цен не получены.
4. `kimi --version` — exit 0, точный вывод `2.1.1`; совпало с B.
5. `mimo --version` — exit 0, точный вывод `0.1.15`; совпало с B.

## Замечания и что нужно для снятия UNVERIFIABLE

- Для подписочных CLI нужен официальный account-level вывод лимита/включения либо повторный
  дешёвый вызов в уже авторизованной сессии; я не пытался исчерпать квоты и не печатал ключи.
- Для Kilo нужен read-only запуск с доступным пользовательским state-каталогом или заранее
  экспортированный безопасный stdout `kilo models --verbose`; текущая EPERM-среда этого не даёт.
- Для DeepSeek/Moonshot/HuggingFace нужны доступные официальные страницы с точными таблицами
  или публичные JSON-ответы; баланс/генерацию не трогал.
- Оператору нужно разделить «включено в подписку», «free tier», «цена модели 0/0» и
  «маржинальная стоимость для владельца»: это разные утверждения, требующие разных доказательств.
