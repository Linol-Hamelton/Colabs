# COST-ZERO-ROUTES: нулевые по стоимости маршруты (сводный реестр)

Оператор: `kilo-9a9b18229cce57fd`. Дата сведения: 2026-09-27 (UTC). Источники: `round1/COLLECTOR-A.md`,
`round1/COLLECTOR-B.md`, `round2/VERIFICATION.md`. Тип «$0» разделён (замечание верификатора):
**included** — входит в подписку; **free tier** — официальный бесплатный уровень; **каталог 0/0** —
нулевая цена модели в официальном каталоге; **маржинальная $0** — стоимость для владельца при
текущем состоянии аккаунта. Метки: FACT — доказательство ниже; OPEN QUESTION — не подтверждено;
INFERENCE — вывод с основанием. Никаких оценок без метки.

## Сводная таблица

| Сервис | CLI/ключ | Модель (id) | Тип $0 | Механизм | Лимит | Окно сброса | Проверка при исчерпании | Источник+дата | Метка |
|---|---|---|---|---|---|---|---|---|---|
| agy (Google) | `agy` (подписка) | `gemini-3.7-flash-high` | included | Квота подписки Antigravity / Google AI | не объявлен | скользящее (точно не установлено) | вызов exit 0, PONG; текст ошибки при исчерпании не наблюдался | `agy models`; мини-вызов, 2026-09-27 | FACT (вызов); OPEN QUESTION (официальное подтверждение включения и лимит) |
| agy (Google) | `agy` | `gemini-3.8-flash-*`, `gemini-3.6-flash-*`, `gemini-3.1-pro-*`, `claude-sonnet-4-6`, `claude-opus-4-6-thinking`, `gpt-oss-120b-medium` | included | то же | не объявлен | — | в списке `agy models`, вызов не делался | `agy models`, 2026-09-27 | FACT (список); OPEN QUESTION ($0-статус каждой) |
| claude (Anthropic) | `claude` (подписка) | `sonnet`/`claude-sonnet-4.6`, `claude-opus-*`, `claude-haiku-4.5`, алиасы `fable`, `opus` | included | Общий пул запросов Pro/Max/Team; 5-часовое окно + недельный лимит | недельный лимит достигнут | 5 ч / неделя | **`claude -p ...` → exit 1: `You've hit your weekly limit · resets 2pm (Europe/Moscow)`** — CLI отказывает целиком | эмпирика 2026-09-27; тарифы: https://www.anthropic.com/pricing | FACT (отказ и текст); OPEN QUESTION (официальное подтверждение $0 на марже) |
| codex (OpenAI) | `codex` (подписка) | `gpt-5.6-luna`, `gpt-5.6-sol`, `gpt-5.6-terra`, `gpt-6-astra` | included | Квота сообщений/рассуждений подписки ChatGPT | квота на 3-часовое окно (из черновика, не подтверждена) | 3 ч (не подтверждено) | **`codex exec -m gpt-5.6-luna ...` → exit 0, `PONG`, `tokens used: 10 644`** | эмпирика 2026-09-27 | FACT (вызов); OPEN QUESTION (включение, лимит, текст ошибки) |
| copilot (GitHub) | `copilot` (подписка) | каталог из `copilot help config`: `gpt-*`, `claude-*`, `gemini-*`, `grok-4.5`, `kimi-*`, `mai-code-*` | included | Месячный пул AI Credits / premium requests | месячная квота исчерпана | месяц | **`copilot -p ...` → exit 1: `You have exceeded your monthly quota ... AI Credits 0 (5s)`** — полный отказ | эмпирика 2026-09-27; https://docs.github.com/en/copilot/concepts/billing | FACT (отказ и текст, каталог); OPEN QUESTION (включение $0) |
| vibe (Mistral) | `vibe` (подписка/ключ) | `mistral-medium-3.5` и др. (из `~/.vibe/config.toml`) | included | Квота Vibe CLI | «$300 allowance» — не подтверждено | расчётный период (не подтверждено) | `vibe -p ...` → exit 0, `PONG` | эмпирика 2026-09-27 | FACT (вызов); OPEN QUESTION ($300, лимит, текст ошибки) |
| Gemini API (Google AI) | ключ Gemini API | `gemini-2.5-flash`, `gemini-2.5-flash-lite`, `gemini-2.5-pro`, `gemma-4` | free tier | Официальный Free Tier | числа (RPM/RPD) из черновика | сутки/минуты | HTTP 429 `RESOURCE_EXHAUSTED` (заявлено; воспроизведение не делалось) | https://ai.google.dev/gemini-api/docs/pricing, 2026-09-27 | FACT (free tier подтверждён верификатором); OPEN QUESTION (численные квоты) |
| Gemini API | ключ Gemini API | `gemini-3-flash-preview`, `gemini-3.5-flash-lite`, `gemini-embedding-2` и др. | free tier (заявлено) | Free Tier | не подтверждён | — | — | там же | OPEN QUESTION (строки/квоты не воспроизведены) |
| DeepSeek | own key | — | нет | $0-моделей нет (заявлено) | — | — | — | https://api-docs.deepseek.com/quick_start/pricing (страница тайм-аутилась у верификатора) | OPEN QUESTION |
| OpenRouter | ключ `OPENROUTER_API_KEY` | варианты `:free` + `openrouter/free` | каталог 0/0 | Бесплатные варианты моделей | 20 req/мин; 50 req/сутки (наш tier; `used:0, remaining:50`) | сутки UTC | `:free`-вызов → 200 (`nemotron-3.5-lightning:free`); `gemma-4-26b-a4b-it:free` → 429 (upstream shared pool) | https://openrouter.ai/api/v1/models, `/api/v1/key`, 2026-09-27 | FACT (достижимость, лимиты аккаунта); OPEN QUESTION (полный список 0/0-вариантов: «не все варианты» — верификатор) |
| Kilo-шлюз | CLI `kilo` (аккаунт) | `kilo/kilo-auto/free` → `dots-studio/dots-3-note-preview:free` | маржинальная $0 | Free-модели шлюза | не заявлен | — | **`kilo run -m kilo/kilo-auto/free ...` → exit 0, `PONG`, cost 0 при балансе −0.002231** | эмпирика B 2026-09-27; https://kilo.ai/pricing (Auto Free $0/mo) | FACT (эмпирика + документ Auto Free); верификатор не воспроизвёл (EPERM его среды) |
| Kilo-шлюз | CLI `kilo` | 24 строки `cost 0/0` в `kilo models --verbose` (nemotron/qwen/ling/laguna/…): см. B Q2 | каталог 0/0 | Free-модели и роутеры | не заявлен | — | листинг B; верификатор: `kilo models --verbose` не выполнился | `kilo models --verbose`, 2026-09-27 | FACT (листинг B); OPEN QUESTION (гарантия $0 на каждую строку — верификатор) |
| Vercel AI Gateway | ключ `vercel` | `inclusionai/ling-3.0-flash-sante`, `-sante-free`, `poolside/laguna-s-2.1-free`, `stealth/pixel-canary` | каталог 0/0 | Цена 0/0 в каталоге | free-tier rate limits (429) | месячный free credit | вызов не делался (трата) | https://ai-gateway.vercel.sh/v1/models, 2026-09-27 | FACT (каталог); REFUTED («ровно 4»: официальный документ — $5 free usage/month; точный состав OPEN QUESTION) |
| HuggingFace | токен `HF_TOKEN` | — | нет free LLM | Месячные кредиты | $0.10/мес (Free) — не подтверждено | месяц | вызов не делался (трата) | https://huggingface.co/docs/inference-providers/pricing | OPEN QUESTION (конкретный размер кредита) |
| Moonshot API / kimi | подписка Kimi Code | `k3`, `k3-256k`, `kimi-for-coding`, `-highspeed` | нет (у аккаунта) | Подписка Kimi Code | 5-ч rolling + месячная квота (доки) | 5 ч / месяц | **`kimi -m kimi-code/k3 -p ...` → exit 1, 403: `Your current subscription does not have access to Kimi Code right now`** | эмпирика 2026-09-27; kimi.com/code/docs membership | FACT (403); OPEN QUESTION (цены/квоты планов — JS-страницы) |
| mimo (Xiaomi) | CLI `mimo` | `mimo/mimo-auto` и др. | нет | Бесплатный канал завершён (запись в конфиге) | — | — | `mimo run ...` → exit 0, но маршрут OpenRouter (платный) | `~/.config/mimocode/mimocode.jsonc` (комментарий), 2026-09-25 | OPEN QUESTION (официального источника нет) |

## Практические выводы (Q7, сведено)

- **Фактически $0 сейчас**: `kilo/kilo-auto/free` и free-строки Kilo (эмпирически при ≤0 балансе);
  OpenRouter `:free` (50/сутки, лимит upstream — риск 429); Gemini API Free Tier (2.5-family,
  квоты численно не подтверждены).
- **Подписочные CLI**: работают как $0 только пока не исчерпана квота; copilot и claude на момент
  сбора УЖЕ отказывали целиком (месячная/недельная квота); тексты отказов зафиксированы.
- **Дорогие/платные**: DeepSeek, Moonshot API, Vercel (баланс $4.9859), Kilo платные модели
  (402 при балансе ≤0), HuggingFace (кредиты).
- Для диспетчера (десятки-сотни тыс. токенов, минуты, агентные шаги): пригодны Gemini API Free
  Tier (узкие RPM/RPD), OpenRouter `:free` (50/сутки — мало), Kilo free-модели (лимит не заявлен),
  подписочные CLI (до исчерпания).

## Ограничения реестра

- Ни одно «включено в подписку» утверждение не подтверждено account-level доказательством
  (см. `GAPS.md`); эмпирика фиксирует только наблюдаемое поведение.
- Верификатор: вердикт FAIL к черновикам (расхождения/непроверяемость); сюда вошли только
  статусы, помеченные FACT/CONFIRMED, либо явные OPEN QUESTION.
