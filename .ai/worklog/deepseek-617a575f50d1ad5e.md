# Worklog: deepseek-617a575f50d1ad5e

Session journal. Owned by this session. No other session writes here.

Newest entry first. Limit 150 lines.

---

## 2026-09-27 - task:cr-collector-b: независимый сборщик B (исследование cost-routes)

Launch: model=deepseek/deepseek-flash effort=max client=kilo
Orientation: deepseek @ task:cr-collector-b (study cost-routes-research): independent collector B | success=round1/COLLECTOR-B.md

Agent: deepseek

Action: Собран сбор B по Q1-Q7 для DeepSeek own key, OpenRouter, HuggingFace, Moonshot/kimi,
Kilo-шлюза, Vercel AI Gateway, mimo. Источники: официальные страницы цен/доки и официальные
листинги моделей; эмпирика: `kimi -p` (PONG, exit 0), `kimi -m kimi-code/k3` (403, exit 1),
`mimo run` (PONG, exit 0, OpenRouter), `kilo run` x3 (`deepseek/deepseek-flash` BYOK cost
0.00351738; `kilo/kilo-auto/free` cost 0, exit 0; `kilo/xiaomi/mimo-v2.6-flash` 402 при
balance -0.002231), `kilo profile` ($-0.00), `kilo models --verbose` (парсинг цен),
`GET /models`, `/api/v1/key`, `/api/v1/credits`, `/user/balance`, `/v1/users/me/balance`,
`/v1/models` (Vercel, pricing), `router.huggingface.co/v1/models`. Секреты не печатались,
конфиги не изменялись. Написан единственный deliverable.

Result: `docs/research/2026-09-27-cost-routes-research/round1/COLLECTOR-B.md` создан: 234 строки,
ru-RU, метки FACT/INFERENCE/OPEN QUESTION, таблицы. Ключевые находки: $0-маршрут Kilo
`kilo-auto/free` работает при отрицательном балансе (cost 0), платные — 402 «Add credits …»;
OpenRouter `:free` достижим нашим ключом (20/мин, 50/сутки, used 0); подписка Kimi Code
недоступна аккаунту (403); HF — $0.10/мес кредитов; DeepSeek/Vercel/Moonshot/mimo — платные;
mimo free-канал завершён 2026-09-25 (запись в конфиге). git status: только journal и
deliverable (в границах задачи).

Next step: deliverable готов к импорту диспетчером; при необходимости — точечная верификация
round2 (verifier).

Open: цены/квоты планов Kimi (JS-страницы), валюта баланса Moonshot API, точный free-tier
список Vercel и tier команды, HF inference-вызов не проверялся (трата кредитов), тарифная
модель Xiaomi MiMo / бесплатный mimo-auto. Подробности — в разделе «Сомнения и пробелы».

Evidence:
- anchor: 9cda8dd232f5c2fa7bc0d6531bc9e7da780ae3d0, uncommitted changes present
- digest: sha256:148411bc33168f5bcc709b6f613a4be2d2a4e10c8a200d0c2398c3e1a07ecbc7 over 712 tracked and untracked files
- digest format: 4
- recorded: 2026-09-27T02:24:22.505Z by deepseek-617a575f50d1ad5e
- entry hash format: 2
- entry: sha256:e71e8e022714a81ee41c556411ff1ef8d3f086627c04e65239701bd7e79d0f92 of this entry without this block
- parent-entry: root
- scope: validator only; the regression suite was NOT run; host-project tests run separately
- validate-protocol.ps1: exit 0 in 11s
- reproduce: node .ai/bin/protocol-handoff.cjs verify
