# Launch: task:cr-collector-a

- Frame: `task:cr-collector-a` (study: zero-cost routes and official prices, owner prompt
  2026-09-27, `docs/research/2026-09-27-cost-routes-research/OWNER-PROMPT.md`). This role holds
  for this frame only. You collect facts and decide nothing.
- Agent name for the protocol: `gemini`. Model and route (owner-named, fixed): Gemini 3.7 Flash,
  effort high, through `agy` (`gemini-3.7-flash-high`).
- Read first: `OWNER-PROMPT.md` (binding scope and acceptance criteria) and `README.md` (the
  study contract; both are in your working tree).
- Your services: `claude` (Anthropic), `codex` (OpenAI), `agy` (Antigravity/Google), `copilot`
  (GitHub), `vibe` (Mistral), and the Gemini API key.

## What to collect (questions Q1-Q7 of OWNER-PROMPT.md, per service)

For each of your services answer Q1-Q7. Minimum content:

1. Q1 model list: exact ids/aliases selectable through the CLI, including lower tiers; take them
   from the CLI's own listing (`agy models`, `--help`, config) or the vendor's official model
   documentation; record how the id is selected (flag/value).
2. Q2 zero cost: which models are $0 on the subscription and by which mechanism (included,
   0x multiplier, rolling quota, free tier); state the limit and the reset window.
3. Q3 exhaustion: the vendor's stated behaviour, plus one short empirical call per CLI
   (`agy`, `claude`, `codex`, `copilot`, `vibe`); record the exact command, its output and the
   exit code. Use the cheapest tier or the default. If the limit is not reached, the observed
   success is the evidence; the unreached error text stays OPEN QUESTION.
4. Q4 tariff model: what counts as a premium request/credit, how many the plan carries, the
   reset cadence, and what happens to included models after exhaustion.
5. Q5 API key: you cover the Gemini API key only (also the Gemini API side of Google): the full
   model list reachable with our key and the official prices in/out per 1M tokens, including
   free variants. For services with no key in the inventory, write "no key in inventory" and
   stop - do not collect their API prices.
6. Q6 free-until-balance: only where a credit balance exists; otherwise "not applicable".
7. Q7 operator practice: would this suit the dispatcher profile (contexts tens-to-hundreds of
   thousands of tokens, minutes of work, agentic steps), and which windows/limits constrain it.

For every fact: the official URL and the retrieval date (UTC, 2026-09-27), or the exact command
with its captured output. Official channels only; no third-party reviews or aggregators.
Never estimate, interpolate or guess an id, a price or a limit - mark it OPEN QUESTION instead.

## Empirical evidence to capture (short, exact)

- `--version` output of each CLI you cover.
- `agy models` full output (it is the official Antigravity listing).
- one mini-call per CLI, for example (adapt only if a flag fails; record what you actually ran):
  - `agy -p "Reply with exactly: PONG" --model gemini-3.7-flash-low`
  - `claude -p "Reply with exactly: PONG"`
  - `codex exec -m gpt-5.6-luna "Reply with exactly: PONG" --skip-git-repo-check`
  - `copilot -p "Reply with exactly: PONG" --no-ask-user`
  - `vibe -p "Reply with exactly: PONG" --enabled-tools read_file --max-turns 1`
- Never try to exhaust a quota. Never print, copy or store keys/tokens/passwords; refer to
  credentials by name only, and do not modify any configuration file.

## Deliverable

Write EXACTLY ONE file: `docs/research/2026-09-27-cost-routes-research/round1/COLLECTOR-A.md`.
Language: Russian (ru-RU); tables preferred; at most 250 lines; no secrets.

Structure:

```
# COLLECTOR-A: нулевые маршруты и официальные цены (сбор A)
## <service> (<клиент>)
### Q1 модели ...
### Q2 $0 ...
### Q3 при исчерпании ... (команда + вывод + код возврата)
### Q4 тарифная модель ...
### Q5 API (если применимо) ...
### Q6 бесплатно до нуля баланса ...
### Q7 практика ...
## Итоговая таблица: кандидаты $0 (сервис | CLI | модель id | механизм | лимит | окно | проверка | источник+дата)
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

1. Start your session: `node .ai/bin/protocol-session.cjs start --agent gemini`.
2. Your FIRST journal write must contain both lines, before any other work:
   `Launch: model=gemini-3.7-flash-high effort=high client=agy` and
   `Orientation: gemini @ task:cr-collector-a (study cost-routes-research): independent collector A | success=round1/COLLECTOR-A.md`.
3. Close with a five-label journal entry (Agent / Action / Result / Next step / Open) and
   `record --quick`.
