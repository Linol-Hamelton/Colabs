# Launch: task:cr-collector-b

- Frame: `task:cr-collector-b` (study: zero-cost routes and official prices, owner prompt
  2026-09-27, `docs/research/2026-09-27-cost-routes-research/OWNER-PROMPT.md`). This role holds
  for this frame only. You collect facts and decide nothing.
- Agent name for the protocol: `deepseek`. Model and route (owner-named, fixed): DeepSeek 4.1
  Flash, effort max, through `kilo run -m deepseek/deepseek-flash`.
- Read first: `OWNER-PROMPT.md` (binding scope and acceptance criteria) and `README.md` (the
  study contract; both are in your working tree).
- Your services: DeepSeek own key, OpenRouter, HuggingFace, Moonshot API and `kimi`, Kilo
  gateway (balance ~$0.03), Vercel AI Gateway, `mimo` (Xiaomi).

## What to collect (questions Q1-Q7 of OWNER-PROMPT.md, per service)

For each of your services answer Q1-Q7. Minimum content:

1. Q1 model list: exact ids/aliases reachable with our key or client; for API services take the
   vendor's official model list; for gateways take the gateway's own model listing
   (`kilo models` is the official listing for the Kilo gateway); for `kimi` and `mimo` take
   `--help`, `models` listing and config.
2. Q2 zero cost: which models are $0 (or the minimum price) for us and by which mechanism
   (free variants such as OpenRouter `:free`, free tier, included subscription, 0x multiplier);
   state the limit and reset window where one exists.
3. Q3 exhaustion / reachability: one short empirical call per CLI you cover (`kimi`, `mimo`,
   `kilo`); record the exact command, output and exit code. For keys, record the observed
   reachability of the official endpoints; if a check cannot be made without spending or
   exposing a secret, record OPEN QUESTION and why.
4. Q4 tariff model: what a credit/request is on each gateway or subscription, how the balance
   works, and what happens at zero balance (vendor statement or observed error).
5. Q5 API keys: for DeepSeek, OpenRouter, HuggingFace, Moonshot and the Kilo and Vercel
   gateways: the model list reachable with our key and the official prices in/out per 1M
   tokens, including free variants (for example OpenRouter `:free` if reachable with our key).
   Only official price pages or official model listings.
6. Q6 free-until-balance: models with $0 or the minimum price while the balance is > 0, how
   this is checked, and what happens at zero balance.
7. Q7 operator practice: would this suit the dispatcher profile (contexts tens-to-hundreds of
   thousands of tokens, minutes of work, agentic steps), and which windows/limits constrain it.

For every fact: the official URL and the retrieval date (UTC, 2026-09-27), or the exact command
with its captured output. Official channels only; no third-party reviews or aggregators.
Never estimate, interpolate or guess an id, a price or a limit - mark it OPEN QUESTION instead.

## Empirical evidence to capture (short, exact)

- `kimi --version`, `kimi --help`; `mimo --version`, `mimo models`; `kilo --version`.
- `kilo profile` (the current balance is evidence for the Kilo gateway).
- `kilo models` excerpt: exact ids and prices for the deepseek, kimi, mimo, glm, qwen, minimax,
  `:free`-style and zero-price rows you rely on (quote the listing rows, not the whole file).
- one mini-call per CLI, for example (adapt only if a flag fails; record what you actually ran):
  - `kimi -p "Reply with exactly: PONG"`
  - `mimo run "Reply with exactly: PONG"`
  - `kilo run -m deepseek/deepseek-flash --variant minimal --auto --dir . --format json "Reply with exactly: PONG"`
- Reachability of official API endpoints with configured credentials, without printing any
  secret; if a key is needed and cannot be used safely, OPEN QUESTION.
- Never try to exhaust a quota. Never print, copy or store keys/tokens/passwords; refer to
  credentials by name only, and do not modify any configuration file.

## Deliverable

Write EXACTLY ONE file: `docs/research/2026-09-27-cost-routes-research/round1/COLLECTOR-B.md`.
Language: Russian (ru-RU); tables preferred; at most 250 lines; no secrets.

Structure:

```
# COLLECTOR-B: нулевые маршруты и официальные цены (сбор B)
## <service>
### Q1 модели ...
### Q2 $0 ...
### Q3 при исчерпании / достижимость ... (команда + вывод + код возврата)
### Q4 тарифная модель ...
### Q5 API-ключ: модели и цены ...
### Q6 бесплатно до нуля баланса ...
### Q7 практика ...
## Итоговая таблица: кандидаты $0 (сервис | клиент/ключ | модель id | механизм | лимит | окно | проверка | источник+дата)
## Итоговая таблица: цены (сервис | модель | in/out за 1M | валюта | URL+дата)
## Сомнения и пробелы (OPEN QUESTION: что и где не подтвердилось)
```

Every row/item carries a label FACT, INFERENCE or OPEN QUESTION (INFERENCE only with the
evidence it derives from).

## Boundaries

- Write no file other than the deliverable and your journal; no commits, tags, pushes or
  branches; do not edit `OWNER-PROMPT.md`, `README.md`, `.ai/bin`, `tests/`, `docs/specs/`, or
  anything in `D:\VPN`; do not run the protocol test suite.
- You work in a private clone; your deliverable and journal are imported by the dispatcher.

## Protocol (mandatory, first)

1. Start your session: `node .ai/bin/protocol-session.cjs start --agent deepseek`.
2. Your FIRST journal write must contain both lines, before any other work:
   `Launch: model=deepseek/deepseek-flash effort=max client=kilo` and
   `Orientation: deepseek @ task:cr-collector-b (study cost-routes-research): independent collector B | success=round1/COLLECTOR-B.md`.
3. Close with a five-label journal entry (Agent / Action / Result / Next step / Open) and
   `record --quick`.
