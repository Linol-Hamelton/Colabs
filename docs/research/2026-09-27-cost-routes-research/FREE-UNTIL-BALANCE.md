# FREE-UNTIL-BALANCE: «бесплатно, пока не кончится баланс»

Оператор: `kilo-9a9b18229cce57fd`. Дата: 2026-09-27 (UTC). Источники: `round1/COLLECTOR-B.md`,
`round1/COLLECTOR-A.md`, `round2/VERIFICATION.md`. Разделение: «кредитный сервис» — расходуемый
баланс/кредиты; ниже — модели с $0 или минимальной ценой при балансе > 0, способ проверки и
поведение при нуле. Метки: FACT/INFERENCE/OPEN QUESTION.

## Сводная таблица

| Сервис | Баланс/кредит на 2026-09-27 | $0-модели при балансе > 0 | Как проверено | При нуле/отрицательном балансе | Источник+метка |
|---|---|---|---|---|---|
| Kilo-шлюз | `Balance: $-0.00` (в промпте владельца было ~$0.03 — расхождение зафиксировано) | `kilo/kilo-auto/free` и free-строки каталога (nemotron/qwen/ling/laguna/…) | `kilo run -m kilo/kilo-auto/free ...` → PONG, exit 0, cost 0 при балансе −0.002231; платная `kilo/xiaomi/mimo-v2.6-flash` → 402 | Free-модели продолжали работать при отрицательном балансе (наблюдение); платные требуют пополнения | `kilo profile`, `kilo models --verbose`, 2026-09-27 — FACT (эмпирика B); верификатор не воспроизвёл (EPERM) |
| OpenRouter | Кредит: total_credits=0, usage 0.082266; `is_free_tier=true` | Варианты `:free` (каталог 0/0) | POST `nemotron-3.5-lightning:free` → 200; `:free`-лимит `used:0, limit:50` (`/api/v1/key`) | По докам: 402 и для free-моделей при отрицательном балансе (не проверялось — трата) | https://openrouter.ai/docs/api-reference/limits; `/api/v1/key`, 2026-09-27 — FACT (вызов и лимит) |
| Vercel AI Gateway | 4.98586991 USD (total_used 0.01413009) | 4 модели с ценой 0/0 в каталоге (ling-flash-sante, -free, laguna-s-2.1-free, pixel-canary) | `GET /v1/credits` → 200; каталог `/v1/models` | 402 при отсутствии положительного баланса; 403 для моделей вне free-подмножества; 429 — rate limit (доки) | https://vercel.com/docs/ai-gateway/pricing; `/v1/credits`, 2026-09-27 — FACT (баланс); «ровно 4» — REFUTED, официальный док даёт $5/мес кредит, состав OPEN QUESTION |
| HuggingFace | Месячные кредиты; API остаток не отдаёт | Бесплатных LLM нет (is_free=false у выбранных) | `GET /api/whoami-v2` → 200, isPro=false; каталог 140 моделей | После исчерпания месячных кредитов без покупки новых запросы прекращаются (доки) | https://huggingface.co/docs/inference-providers/pricing — OPEN QUESTION (размер кредита не подтверждён: черновик B называет $0.10/мес) |
| DeepSeek | 11.92 USD (topped_up 11.92, granted 0; CNY 121.82) | Нет | `GET /user/balance` → `is_available:true` | Требуется пополнение; точный текст ошибки не наблюдался | https://api-docs.deepseek.com/quick_start/pricing — FACT (баланс, отсутствие $0 — UNVERIFIABLE у верификатора из-за тайм-аута страницы) |
| Moonshot API | available_balance 3.1468701 (валюта не указана) | Нет | `GET /v1/users/me/balance` | Расход с баланса либо из квоты подписки (доступ к ней — 403) | platform.moonshot.ai/docs/pricing/chat — FACT (баланс); валюта — OPEN QUESTION |
| Gemini API | Баланс не расходуется на Free Tier | `gemini-2.5-flash`, `gemini-2.5-flash-lite`, `gemini-2.5-pro`, `gemma-4` (Free Tier) | Официальная страница тарифов | 429 `RESOURCE_EXHAUSTED` (заявлено; не воспроизводилось); Paid Tier тарифицируется по факту | https://ai.google.dev/gemini-api/docs/pricing — CONFIRMED (free tier 2.5-family и gemma-4); численные квоты — OPEN QUESTION |
| Kimi Code (подписка) | Квота подписки недоступна аккаунту | Фактически нет | `kimi -m kimi-code/k3 -p ...` → 403 `does not have access to Kimi Code` | — | эмпирика 2026-09-27 — FACT (403) |

## Проверка утверждений (как это устанавливалось)

- **Kilo**: единственный маршрут, где $0 подтверждён и документом (Auto Free `$0/mo`), и
  эмпирикой (`cost 0` при отрицательном балансе); полный список free-строк — из официального
  листинга `kilo models --verbose` (воспроизведение верификатором заблокировано EPERM его среды).
- **OpenRouter**: free-достижимость подтверждена одним вызовом 200; второй вызов упёрся в 429
  upstream shared pool (лимит провайдера, не наш). Счётчики ключа: `limit=null`,
  `is_free_tier=true`, free-лимит 50/сутки (использовано 0).
- **Осторожно (INFERENCE)**: расход ключа OpenRouter вырос за сессию (0.0749→0.0823) — ключ
  общий, авторство расхода не установлено (B).
- **Vercel**: баланс — FACT; «4 модели 0/0» — из каталога, но вердикт верификатора REFUTED для
  утверждения «ровно 4»; официальный документ говорит о $5 free usage/month.
- **HF/DeepSeek/Moonshot**: генерационные вызовы не делались сознательно (трата кредитов —
  правило B); остатки и отсутствие $0-моделей — из официальных ответов API/доков.

## Итог для владельца

- При балансе ≈0 реально доступны: Kilo free-модели (включая `kilo-auto/free`), OpenRouter
  `:free` (мало: 50/сутки), Gemini API Free Tier (узкие RPM/RPD).
- Всё остальное на кредитных сервисах платное; при нуле баланса шлюзы отвечают 402 и требуют
  пополнения (Kilo — наблюдалось; OpenRouter/Vercel — по докам).
