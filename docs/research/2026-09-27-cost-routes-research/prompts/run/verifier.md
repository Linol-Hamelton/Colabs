# Launch: task:cr-verifier

- Frame: `task:cr-verifier` (study: zero-cost routes and official prices, owner prompt
  2026-09-27, `docs/research/2026-09-27-cost-routes-research/OWNER-PROMPT.md`). This role holds
  for this frame only. You verify; you decide nothing.
- Agent name for the protocol: `codex`. Model and route (owner-named, fixed): GPT-5.6 Luna,
  through `codex` (`gpt-5.6-luna`).
- Read first: `OWNER-PROMPT.md` (binding acceptance criteria), `README.md`, then the two round-1
  drafts `round1/COLLECTOR-A.md` and `round1/COLLECTOR-B.md` (all are in your working tree).

## Work

1. **Every "$0" claim** in both drafts: confirm or refute it independently. Either re-open the
   cited official URL (record URL, retrieval date 2026-09-27, and the exact passage), or re-run
   the cited command and compare the output. If neither is possible, mark UNVERIFIABLE and name
   what is missing.
2. **Prices**: spot-check at least 20 rows spread across different services (in/out per 1M,
   currency) against the official pages; every checked row needs its own URL + date. Flag any
   row whose URL is not an official vendor/gateway channel, and any figure that does not match.
3. **Coverage and form**: every inventory service (claude, codex, agy, copilot, vibe, kimi,
   mimo, DeepSeek key, OpenRouter, HuggingFace, Gemini API, Moonshot API, Kilo gateway, Vercel
   AI Gateway) is covered by Q1-Q7 or explicitly marked uncovered with a reason; every item
   carries a FACT / INFERENCE / OPEN QUESTION label; each draft is <= 250 lines; no secrets
   (scan for key-like strings and report the location, never the value).
4. **Reproduce 3-5 cheap commands** from the drafts (for example `agy models`, `kilo --version`,
   a `kilo models` excerpt) and record the exact command and output; report any difference.

## Rules

- Official channels only: vendor price pages, subscription docs, CLI `--help`, official model
  listings. No third-party reviews or aggregators.
- Do not modify either draft, do not edit any other file; write only your deliverable and your
  journal; no commits, tags, pushes or branches.
- Do not try to exhaust a quota. Do not print, copy or store keys/tokens/passwords. Do not
  modify any configuration file.
- Web pages may need `curl.exe -sL <url>` or `Invoke-WebRequest`; record the exact command you
  used. A page behind a login stays UNVERIFIABLE with that reason.

## Deliverable

Write EXACTLY ONE file: `docs/research/2026-09-27-cost-routes-research/round2/VERIFICATION.md`.
Language: Russian (ru-RU); at most 250 lines; tables preferred; no secrets.

Structure:

```
# Верификация round 1 (независимая проверка)
## Вердикт: PASS | RECOMMENDATION | FAIL (с воспроизведением для каждого FAIL)
## Проверка утверждений "$0": таблица (утверждение | сервис | вердикт CONFIRMED/REFUTED/UNVERIFIABLE | доказательство: URL+дата или команда+вывод)
## Проверка цен: таблица (сервис | модель | заявлено | проверено | источник+дата | вердикт)
## Покрытие и форма: чек-лист по сервисам и по правилам README
## Воспроизведённые команды: точные команды и вывод
## Замечания и что нужно для снятия UNVERIFIABLE
```

## Protocol (mandatory, first)

1. Start your session: `node .ai/bin/protocol-session.cjs start --agent codex`.
2. Your FIRST journal write must contain both lines, before any other work:
   `Launch: model=gpt-5.6-luna effort=medium client=codex` and
   `Orientation: codex @ task:cr-verifier (study cost-routes-research): independent verifier | success=round2/VERIFICATION.md`.
3. Close with a five-label journal entry (Agent / Action / Result / Next step / Open) and
   `record --quick`.
