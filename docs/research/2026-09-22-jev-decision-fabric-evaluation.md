> Transcribed from chat by mistral, model: deepseek/deepseek-flash, date: 2026-09-22
# Jev как System-One Decision Fabric для Colabs — глубокое исследование

**Дата**: 2026-09-22 (UTC)
**Автор**: Kilo (модель `deepseek/deepseek-flash`), исследовательская сессия `kilo-ddc9014eda60f89b`
**Режим**: RESEARCH / ADVISORY. Ничего в Colabs не изменено: ни файла, ни зависимости, ни решения. Отчёт лежит вне репозитория.
**Baseline Colabs**: локальный рабочий каталог `D:\Colabs`, HEAD `f68b50222ba3afa92dd3be36f4197ac8307d9511` (ветка `proto-dec-0044/layers-abc-checkpoint`, дерево dirty). Публичный `github.com/Linol-Hamelton/Colabs` — тот же origin (`origin/main` = `d38d2f2`), но актуальное состояние state machine существует только в локальном дереве (слой A/B/C, PROTO-DEC-0044, dirty-правки) и в этом отчёте учитывается именно оно.
**Маркировка утверждений**: `FACT` — проверено в репозитории/документации; `MEASURED` — измерено в этой сессии или в зафиксированной телеметрии; `CLAIM` — заявление вендора/третьей стороны, не подтверждённое независимо; `HYPOTHESIS` — гипотеза; `RECOMMENDATION` — рекомендация; `ESTIMATE` — арифметическая оценка без прямого измерения.

---

## 1. Executive Summary

1. **Jev — реальный и необычный кандидат.** `FACT`: TypeSafe AI выпустила Jev 1.13 (System One model) — модель, которая не генерирует текст, а принимает `state` + типизированные вопросы (`Choice`/`Score`/`Noul`) и возвращает типизированные ответы с вероятностями; несколько вопросов к одному state выполняются одним запросом параллельно. Цена $0,042/M входных токенов, выход бесплатный, заявленная задержка 70–500 мс, контекст 64k (32k на state + длиннейший вопрос).
2. **Гипотеза автора Colabs частично верна, но её главный вывод — «ускорение в разы» — не подтверждается текущими данными.** Colabs тратит wall-clock не на маленькие решения, а на длинные агентские сессии, тесты и человеческие паузы. `MEASURED` (телеметрия `.ai/runtime/metrics/sessions.jsonl`, 56 записей): медиана сессии Claude — ~20 600 с, Codex — ~506 с, при этом детерминированные проверки занимают секунды-минуты (валидатор ~3 с; suite ~276 с). Jev может устранить только часть `T_decision`, которая сегодня близка к нулю как отдельная latency: решения в Colabs *встроены* в reasoning дорогих агентов и в человеческие approvals, а не вынесены в отдельные вызовы.
3. **Наибольший реальный ROI — не router и не meta-controller, а advisory-триаж ограниченных текстовых суждений**, где ошибка обратима, а детерминированная проверка ограничивает blast radius: (a) классификация архивных review-документов по категориям A–F, (b) рекомендация глубины ревью с детерминированным полом (PROTO-DEC-0041 нельзя понижать), (c) rubric-проверки «есть ли evidence / воспроизведение / соответствие acceptance criteria», (d) семантическая страховка при эскалации к человеку. `RECOMMENDATION`
4. **Есть жёсткие границы.** Jev не может быть сертификатором (нет `FS_WRITE`/`SHELL_EXEC`/`EVIDENCE_SIGN`/`REPO_READ`), не может быть входом completion gate (PROTO-DEC-0034: внешний вывод никогда не Evidence и не gate input), не может отменять/понижать обязательный human gate, не должен решать, «прав ли Claude или Codex» в инженерном споре (правило симметрии evidence: воспроизведение важнее голосования). `FACT`
5. **Калибровка — ключевой неизвестный фактор, но не «чёрный ящик».** `CLAIM`: вендор заявляет калибровку (RLCD), confidence только у Choice/Score (не у Noul), структурные инварианты не гарантированы (Noul 0,22 и Choice «no» 0,99 по одному вопросу), context rot и податливость к adversarial-контенту прямо признаны в официальном «jaggedness»-документе. `CLAIM` (независимые исследования, сведённые в community-индексе): на CLINC150 порог 5% скрытых ошибок маршрутизации держался на in-scope выборке, но провалился в 3,6× при сдвиге распределения; в action-gate исследовании Jev и Claude допустили по одному unsafe allow на 111 кейсов; batching менял результат ranking-теста. Вывод: калибровать на своих данных, не переносить чужие пороги.
6. **Единственный допустимый первый шаг сегодня — offline shadow mode вне репозитория.** `RECOMMENDATION`: собрать датасет исторических решений Colabs (архивные классификации, light/strict-разметка, findings ledger, исходы review-раундов), прогнать Jev офлайн, посчитать ECE/Brier/selective accuracy и только затем просить у владельца freeze-исключение на runtime shadow. Ни один вывод Jev не должен влиять на gate, вердикты, замки, бюджеты или approvals без отдельного owner-решения и решения PROTO-DEC.
7. **Ответ на «разы»: нет оснований.** `RECOMMENDATION`-вывод §20: реалистичный потолок при текущем устройстве Colabs — ~1,05–1,3× по wall-clock (в основном за счёт сокращения лишних review-раундов и внимания владельца, если shadow-данные это докажут), до ~2× только при изменении политики ревью владельцем; 3–5× механизма не имеют. Токены frontier-моделей могут упасть на 5–25% (в основном координационные), стоимость Jev при этом ничтожна (<$10/мес при сотнях решений в день).

---

## 2. Что такое Jev на самом деле

`FACT` (источники: `vercel.com/ai-gateway/models/jev`, `docs.typesafe.ai/introduction`, `/api`, `/models`, `/confidence`, `/model-jaggedness/jev-1.13`, блог TypeSafe; всё открыто 2026-09-22):

- **Класс**: System One model — «machine-native intelligence для решений внутри софта», противопоставленный text-generation LLM. Основатель Диого Алмейда (ex-OpenAI, RLHF-исследования, лёгшие в ChatGPT); метод обучения — RLCD (Reinforcement Learning for Calibrated Decisions).
- **API**: `POST https://api.typesafe.ai/v1/systemone`, `Authorization: Bearer`, тело `{state, model, questions}`. `state` — строка | объект | массив текстовых значений (изображения/аудио нет). `model`: `jev-latest` → `jev-1.13.0`, `jev-preview`. Ответ: `{model, answers, usage}`; ошибки 401/422/429/529 с retry-after у SDK.
- **Примитивы** (все три можно смешивать в одном запросе; каждый вопрос оценивается независимо и параллельно):
  - `Noul` — «правда ли утверждение?», ответ `noul` ∈ [0,1]; confidence НЕТ.
  - `Choice` — выбор из именованных опций (до 255), ответ `choice`, `probabilities` по всем опциям, `confidence`.
  - `Score` — упорядоченная рубрика (2–10 уровней), ответ `score` (взвешенный, может быть между уровнями), `legend`, `probabilities`, `confidence`.
- **Confidence** — статистика от распределения (для Choice/Score; формула вендора, но полное распределение отдаётся наружу — можно применять свою). Документация прямо советует: high → действовать, medium → подтвердить/собрать данные, low → не действовать/человек; пороги зависят от ставок. `FACT`
- **Экономика**: $42/Btok = $0,042/Mtok вход, выход «free»; лимиты 250 000 токенов/с и 1 200 запросов/мин, динамически меняются (вендор предупреждает, что лимиты нестабильны до новых GPU). `FACT`
- **Латентность**: заявлено 70–500 мс end-to-end; community-плагин `jev-use` публикует измеренные p50 ≈230 мс и ≈$0,02 за 1 000 суждений (вендорские/community-числа, не наши). `CLAIM`
- **Батчинг**: 32k на state + длиннейший вопрос, 64k на всё; «добавление вопросов почти не меняет время ответа»; кукбук `parallel_questions` заявляет 13 вопросов одним вызовом = 12,2× дешевле и 10,0× быстрее, чем 13 вызовов, без изменения ответов. `CLAIM`
- **Позиционирование**: официальная страница «Jev with coding agents» прямо говорит — Jev НЕ является заменой модели coding-агента; его место — внутри кода/пайплайна как fast typed decision. `FACT`
- **Честные ограничения (jaggedness, jev-1.13, ревизия 2026-09-17)**: буквальное чтение инструкции; не калькулятор и не счётчик; даты как текст; точность падает с indirection; context rot от нерелевантного state; adversarial/authority-контент может сдвигать ответ (модель не считает state враждебным); структурные инварианты между вопросами не гарантированы; генерации нет. `FACT`
- **Независимые данные** (сведены community-индексом `AbdelStark/awesome-typesafe-jev`, ссылки на первоисточники в §16; я их не перепроверял): KoBBQ audit — при доступной опции «unknown» Jev выбирает её в 95% из 300 неоднозначных кейсов, со стереотипом в 79% при вынужденном выборе; Janus cascade — улучшение Banking77, но на Web of Science равенство Jev с ростом цены на 47%; jev-certify — 84,75% auto-routing при 2,25% потерь на 400 in-scope примерах, но при сдвиге out-of-scope prevalence ошибка в 3,6× превысила 5%-й бюджет; jev-orderby — проход шести ranking-гейтов на одном корпусе и провал четырёх на другом, причём **батчинг менял результат**; action-gate — 100/111 совпадений с разметкой у Jev против 102 у Claude, у обоих по одному unsafe allow; jev-engineering — blunt injection сдвинул 0 из 30 опасных команд, но дал 10% ложных отказов на безопасных, authority-framing сдвинул 3 из 30. `CLAIM/REPORTED`
- **Доступ и альтернативы**: TypeSafe direct, OpenRouter (`typesafe/jev-1.13`), Vercel AI Gateway (`typesafe-ai/jev` через `experimental_evaluate` из `ai`), Cloudflare Workers AI, Netlify AI Gateway. MCP-коннектор `itsmostafa/typesafe-mcp` (один tool `evaluate`). Self-host/локальные альтернативы: `openjev` (DiffusionGemma, 312★), `Laya` (ONNX ~1,7 GB), `Kev`, `AnyDecisionModel` (MLX); `system-one-adapter-python` позволяет гонять тот же typed-интерфейс поверх OpenAI/Anthropic (качество иное). `FACT`

**Главный вывод по §2**: Jev — это не «ещё один агент» и не «дешёвый reasoning», а **typed evaluator**: одно состояние + пакет атомарных вопросов → распределения. Его сила — скорость/цена/структура; его слабость — буквальность, отсутствие воспроизведения фактов, зависимость от качества декомпозиции вопросов и полная неспособность выполнять действия/проверки.

---

## 3. Текущая архитектура Colabs (state machine)

`FACT` (AGENTS.md v1.9.6, `.ai/docs/PAIRED-CYCLE.md`, `.ai/docs/PROTOCOL.md`, `.ai/TASK.md`, `.ai/DECISIONS.md`, `.ai/bin/*`, `validate-protocol.ps1`, `protocol-manifest.json`; локальное дерево 2026-09-22):

### 3.1 Модель мира
- Несколько независимых CLI-агентов (Claude, Codex, Gemini, DeepSeek, Copilot, GLM, Qwen, Mistral…) **не делят chat history**; единственный канал — файловая система Git-репозитория. `FACT`
- Долговременная память: `.ai/TASK.md` (текущая задача), `.ai/PLAN.md` (подход), `.ai/DECISIONS.md` (append-only, `Approved by:` = человек; предложения запрещены), `docs/decisions/REGISTRY.md` (статусы, append-only), `.ai/ARCHIVE.md` (холодная история), `.ai/worklog/<owner>.md` (журнал каждой сессии, 5 меток), `docs/reviews/` (промпты и сертифицирующие ревью), `.ai/runtime/` (disposable, не tracked). `FACT`
- Достоверность: Git — источник правды; evidence-блок в журнале — машинно проверяемая запись (`protocol-handoff.cjs record/verify`), prose без evidence — не доказательство. `FACT`

### 3.2 Роли и власть (PROTO-DEC-0041)
- **Владелец (человек)** — единственный, кто принимает решения (`Approved by:`), назначает роли в `## Roles`, выдаёт owner-директивы, freeze-исключения, разрешения на commit/tag/push, закрывает/открывает council. Роли — функциональные слоты, не бренды; capability определяется средой (FS/SHELL/EVIDENCE_SIGN/REPO_READ), не названием модели. `FACT`
- **Implementer** — выполняет blocks, пишет тесты/отчёт, обязан написать Unified Adversarial Audit Prompt ДО handoff, не имеет права ставить `Status: Completed`. `FACT`
- **Controller/Reviewer** — диспатчит, координирует, ведёт findings ledger; не сертифицирует то, чем управлял. `FACT`
- **Independent certifiers** — вне исполнения и контроля; high-risk требует ≥2 параллельных независимых сертификаторов с разными мандатами; третий — только по покрытому риску/воспроизведённому противоречию/owner-директиве. `FACT`

### 3.3 Процесс
- Семь фаз (0 Frame → 1 Diagnosis → 1a External research → 2 Solution → 3 Plan+adversarial review → 4 Implementation done-checked → 5 Final adversarial audit → 6 Closure), у каждой — выход и проверяемый transition gate; повтор фазы — только по одному из четырёх триггеров (дефект, изменение scope/кандидата, новая внешняя информация, неполное closure-доказательство). `FACT`
- Escalation budget: ≤2 попытки ремедиации на root cause, затем возврат владельцу; новый council — только по owner-директиве. `FACT`
- Severity rubric + objective blocking rule: воспроизведённый дефект, нарушающий инвариант/контракт или лежащий на protected path, блокирует независимо от ярлыка severity; понижение до RECOMMENDATION запрещено. `FACT`
- Завершение: `Status: Completed` требует completion gate, оцениваемого **двумя движками** (PowerShell-валидатор и Node `gate-check`): либо strict path (prompt + certifying review + receipt binding), либо light path (только docs/config, baseline 40-hex, один независимый reviewer). Protected paths (`.ai/**` кроме worklog/runtime/TASK, `.claude/**`, `.codex/**`, `.github/**`, `tests/**`, `templates/**`, `docs/decisions/**`, executable-расширения и перечисленные root-файлы) вычисляются детерминированно и force strict. `FACT` (реализация: `protocol-handoff.cjs:934` `gateCheck`, `:975` `isLightPath`, `:1037` `isProtectedPath`)

### 3.4 Уже детерминированные решения (не кандидаты на ИИ)
Замки и их статусы; имена/журналы сессий; snapshot/Stop-проверка handoff; `record/verify/gate-check`; подсчёт corpus/лимитов; архивация журналов; классификация light/strict и protected path; покрытие/дубликаты (`protocol-ledger.cjs`); индекс решений (`protocol-index.cjs`); install/upgrade и его самопроверки; encoding/синтаксис. `FACT`

### 3.5 Текущее давление (актуальные данные)
- `MEASURED` (эта сессия): validator exit 0 / 0 warnings; suite 321/321 за 276 с; corpus активных `docs/reviews/` 52 файла; 25 журналов; 23 блока PROTO-DEC; 8 файлов в `.ai/bin`; 19 test-файлов.
- `FACT` (TASK 2026-09-22): измеренное бутылочное горло — страта **S3 (prose/governance retrieval)**, а не S1 (навигация по символам); S3 закрывается детерминированно слоем B (117 321 B → 13 932 B, 8,4×) и политикой corpus/PROTO-DEC-0037.
- `FACT`: три измеренных провала 2026-09-22 — пропущенный источник (`Битва за луну`, ~35 600 токенов), 95 скопированных записей (`opus_orchestrator`), рост governance-корпуса ~14 КБ/сутки; ответ — слои A/B/C (PROTO-DEC-0044).
- `FACT`: freeze PROTO-DEC-0039; MCP/index-эксперименты запрещены до отчёта продуктовых пилотов; внешний вывод — только advisory (PROTO-DEC-0034); MCP-совет закрыт, единственный предрегистрированный кандидат — Serena, и только по owner-директиве.
- `MEASURED` (телеметрия `sessions.jsonl`, 56 записей): Claude n=42, медиана 20 604 с, максимум 64 275 с, handoffComplete=19; Codex n=9, медиана 506 с; DeepSeek n=1, 1 415 с; Copilot n=1, 304 с. Это wall-clock сессий, включая простой; прямого «compute time» телеметрия не даёт.

---

## 4. Карта решений Colabs

Ниже — все реальные decision points, найденные в state machine (не абстрактные). Столбцы: кто решает сейчас / требуется ли reasoning / bounded? / представимость / цена ошибки / обратимость / blast radius. Классы A–F — по таксономии задания (§10), итоговые диспозиции в §5.

| # | Decision point | Кто решает сейчас | Reasoning? | Bounded | Представимо | Цена ошибки | Обратимо | Blast radius |
|---|---|---|---|---|---|---|---|---|
| D1 | Objective/scope/risk class/роли/baseline (Phase 0) | Владелец | да (System-2) | нет | — | высокая | частично | весь цикл |
| D2 | 40-hex baseline и его валидность | Детерм. код + владелец | нет | да | валидация | средняя | да | gate |
| D3 | Кому дать роль implementer/reviewer/certifier | Владелец (capability+availability) | да | полу- | Choice (слоты) | высокая (DEC-0020 duplicate-assignment) | да | цикл |
| D4 | Старт сессии: контекст, инвентаризация, журнал | Детерм. hooks/Layer A | нет | да | — | средняя | да | core |
| D5 | Замок: acquire/release/steal/clear | Детерм. `protocol-lock` | нет | да | — | высокая | да | core |
| D6 | Light vs strict path | Детерм. gate-check (protected paths) | нет | да | boolean | высокая | да | gate |
| D7 | Класс риска задачи (low/normal/high) | Controller/владелец (policy PROTO-DEC-0041) | да, но рубрика | да | Choice/Score | высокая (глубина ревью) | да | цикл |
| D8 | Состав ревью (1/2/3 reviewer'а, мандаты) | Policy + владелец | да | да | Choice + policy floor | высокая (пропуск дефекта) | да | цикл |
| D9 | Декомпозиция на blocks и план | Controller/implementer | да (System-2) | нет | — | средняя | да | блок |
| D10 | Воспроизведение finding / валидность дефекта | Reviewer с shell/FS | да + tool | полу- | evidence | высокая | нет (это доказательство) | кандидат |
| D11 | Severity label finding'а | Reviewer | да, рубрика | да | Score | низкая (blocking не зависит от ярлыка) | да | ledger |
| D12 | Вердикт PASS/FAIL/BLOCKED/RECOMMENDATION | Certifier (authority) | да, но по evidence | да | enum | критическая | нет | gate |
| D13 | Completion gate | Детерм. + receipts | нет | да | boolean | критическая | нет | gate |
| D14 | Полнота журнала (5 меток) | Детерм. hook/regex | нет | да | boolean | низкая | да | housekeeping |
| D15 | Свежесть/связность receipt | Детерм. verify --deep | нет | да | boolean | высокая | да | gate |
| D16 | Что делать после ревью: remediation/новый раунд/стоп | Policy (триггеры) + controller | да | да | Choice | высокая (rework/пропуск) | да | цикл |
| D17 | «Продолжать ли обсуждение/раунд?» (marginal value) | Controller (неявно) | да | да | Noul/Score | средняя-высокая | да | цикл |
| D18 | Эскалация к человеку: нужен ли owner | Policy + владелец | да | да | Choice + deterministic floor | высокая | да (но дорого) | весь цикл |
| D19 | Созывать ли council | Только владелец | да | да | boolean (owner) | высокая | да | governance |
| D20 | Классификация review-документов A–F при архивации | Человек/агент (эвристика + цитатный скан) | да, семантика | да | Choice 6 | средняя (сломать binding) | да (индекс стабилен) | corpus |
| D21 | Что архивировать перед созданием артефакта | Policy + ручная оценка | да | да | Choice/ранжирование | средняя | да | corpus |
| D22 | Какой контекст читать под задачу (S3) | Агент вручную; Layer B детерминированно по путям | да | полу- | Choice/ранжирование | средняя (пропуск нормы) | да | task |
| D23 | Модель/уровень интеллекта под задачу | Не решается протоколом (CLI/владелец) | да | да | Choice | средняя | да | продукт |
| D24 | Готовность к commit/PR | Только владелец | да | да | boolean (owner) | высокая | нет | репо |
| D25 | Branch strategy | Владелец | да | да | Choice | средняя | да | репо |
| D26 | Выбор тестов под diff | Детерм. (testCommand, CI) | нет | да | — | высокая | да | продукт |
| D27 | Выбор tool/MCP | Policy (freeze/allowlist) | нет | да | allowlist | высокая | да | core |
| D28 | Компакция контекста/усечение | Агент/CLI | да | да | Choice/Score по элементам | средняя (потеря evidence) | нет | task |
| D29 | Детект копирования/дубликатов работы | Детерм. Layer C (sha256) | нет | да | boolean | средняя | да | цикл |
| D30 | Проверка claim vs evidence в отчёте («suite passes», «ничего не менял») | Детерм. record/verify + reviewer | да (для семантики) | да | Noul + deterministic | высокая | да | gate |
| D31 | Findings ledger: disposition (confirmed/refuted/…) | Reviewer по воспроизведению | да + tool | да | Choice | высокая | да | кандидат |

**Наблюдение §4**: из 31 решения детерминированный код уже закрывает ~10 (D2, D4–D6, D13–D15, D26, D27, D29), человек — ~7 (D1, D3, D18–D20, D24, D25), и только ~10–12 являются bounded текстовыми суждениями, где Jev может добавить сигнал. Именно они — предмет §5.

---

## 5. System-One suitability matrix (A–F)

Классы: **A** — отличный кандидат; **B** — перспективно с предохранителями; **C** — нужен эксперимент; **D** — детерминированный код лучше; **E** — нужен System-2 LLM; **F** — обязательный human authority.

| Решение | Класс | Почему | Обязательный предохранитель |
|---|---|---|---|
| D20 Архивная классификация A–F | **A** (кандидат №1) | bounded Choice из 6 категорий, повторяется на каждом overflow, цена ошибки ограничена, ground truth существует (`archive/INDEX.md`, правила PROTO-DEC-0037) | Перед перемещением: детерминированная проверка «нет живых цитат/receipt» (уже есть в методе классификации); Jev только предлагает категорию; файлы не удаляются |
| D7 Класс риска задачи | **B** | рубрика из policy, Choice/Score, ошибка дорогая | Детерминированный пол: protected paths → strict независимо от ответа Jev; ответ advisory, решает владелец/controller |
| D8 Состав ревью | **B** | Choice, но меняет assurance-бюджет | Floor политики PROTO-DEC-0041 неизменяем: Jev не может опуститься ниже «2 параллельных сертификатора для high-risk»; только поднимать |
| D16/D17 Стоп/продолжение | **B** | Noul/Score «есть ли ещё ценность раунда», триггеры уже формализованы | Решение остаётся за policy/controller; Jev не может отменить обязательный триггер повторной проверки; fail-closed |
| D30 Rubric-проверка «evidence присутствует / acceptance criteria покрыты» | **B** | атомарные Noul по чек-листу, дёшево, воспроизводимо | Только как дополнительный сигнал; канонические проверки — `record/verify/gate-check`; не вход гейта |
| D11 Severity | **B** (низкая ценность) | Score по рубрике, но blocking от ярлыка не зависит | Не позволять Jev понижать severity и обходить objective blocking rule |
| D22 Выбор контекста (S3) | **B/C** | Choice/Noul по кандидатам-блокам, закрывает реальное узкое место | Layer B (детерминированный reverse-index) остаётся каноном; Jev может только переранжировать/дополнять; не удалять и не «сжимать» DECISIONS |
| D28 Компакция | **C** | community-прецеденты (fast-jev-compaction, jev-pruner) | Не усекать evidence/журналы; полный текст архивируется; эксперимент отдельно |
| D25 Branch strategy | **C** | bounded Choice, но последствия высоки | Только рекомендация владельцу |
| D3 Маршрутизация к агенту (по бренду/перфомансу) | **C/D** | policy «no brand trust»; риск bias/голодания/feedback loop | Маршрутизация только по capability/availability (детерминированно); перфоманс-роутинг — отдельное owner-решение |
| D23 Модель/tier/reasoning effort | **C** (product-side) | не решение протокола; возможен advisory в продуктах | Явное согласие владельца; не в протокольном контуре |
| D1, D19, D24 | **F** | authority владельца, не может быть делегирована вероятностной модели | — |
| D12 Вердикт/сертификация | **F** (+capability) | у Jev нет FS/SHELL/EVIDENCE capability; independence rules | Запрещено структурно |
| D10 Воспроизведение дефекта, D31 disposition | **E** (+tool) | нужен запуск кода/тестов и evidence | Jev может лишь оценивать «достаточно ли приведённого evidence» как advisory |
| D9 План/декомпозиция, разрешение инженерных споров | **E** | System-2; «majority vote не отменяет воспроизведение» | — |
| D2, D4–D6, D13–D15, D26, D27, D29 | **D** | 20 строк точного кода надёжнее модели | — |

`RECOMMENDATION`: начинать не с router (D3), а с A/B-кандидатов (D20, D7, D8, D16), где blast radius ограничен, а ground truth для калибровки уже существует.

---

## 6. Где Jev использовать НЕЛЬЗЯ (жёсткие запреты)

1. **Сертификация и вердикты** (D12): capability-профиль Jev не содержит `FS_WRITE`, `SHELL_EXEC`, `EVIDENCE_SIGN`, `REPO_READ`; certifier обязан быть «outside execution and control» и уметь проверять receipt. `FACT`
2. **Completion gate** (D13): PROTO-DEC-0034 item 2 — внешний вывод никогда не Evidence и не вход гейта; любая попытка сделать это «вторым чекером» запрещена до нового owner-решения. `FACT`
3. **Authority-решения** (D1, D18–D20, D24): решения существуют только как `Approved by: <человек>`; вероятность 0,97 не даёт разрешения. `FACT`
4. **Воспроизведение дефектов** (D10): требование воспроизведения и симметрии evidence; модель, не запускающая код, не может ни подтвердить, ни опровергнуть. `FACT`
5. **Разрешение инженерных споров** (D9): «прав ли Claude или Codex» — System-2 и evidence-задача; голосование (и вероятностная оценка) не отменяет воспроизведение. `FACT`
6. **Секреты и чувствительные данные**: state уходит на внешний API; `.env`, ключи, приватные данные не должны попадать в DSP (см. §20). Кейс `mcp-gateway.js:37` показывает, что флот уже сталкивался с утечкой ключа. `FACT`
7. **Действия и side effects**: Jev не должна получать право выполнять команды/правки; её ответ — данные, не команда. `FACT`
8. **Замены детерминированного**: политики замков, лимитов, protected paths, форматов заголовков ревью — regex/код надёжнее (класс D). `RECOMMENDATION`
9. **Перфоманс-роутинг по бренду**: прямо конфликтует с «No brand trust» (PROTO-DEC-0041 item 5) и создаёт feedback loops/голодание агентов. `FACT/RECOMMENDATION`

---

## 7. Layer A — Task routing: низкий ROI в Colabs, ограниченный product-side

`FACT`: в Colabs маршрутизацию решает владелец (роли в TASK по capability/availability), а не «кто лучше пишет код»; агент, не названный в ролях, обязан спросить владельца (это проверяется тестом; session start так и делает). Поэтому классический Jev-router «task → лучший агент» здесь **не имеет легальной цели**: нельзя ранжировать модели там, где policy требует функциональные слоты.

Что остаётся:
- **Capability/availability routing** (детерминированно): кто имеет certifying capability, кто исчерпал лимиты (кейс Codex «out of limits» уже зафиксирован в TASK), кто свободен по замку. Это решается правилами; Jev может лишь классифицировать «тип требуемой capability» (Choice): `read_only_review | certifying_review | implementation | coordination | owner` — **B**, advisory.
- **Top-1/top-2/parallel routing агентов**: `RECOMMENDATION` — нет. Параллельный fan-out дорогих агентов ломает one-writer/lock дисциплину, порождает дубликаты (измеренный класс: 95 скопированных записей; DEC-0020 duplicate assignment) и не имеет политики утилизации второго результата.
- **Product-side routing** (Block-Puzzle/VPN): там нет протокольного запрета, но нет и замеренной боли; начинать с shadow, не с внедрения.

Итог: **D/C**, не A. Экономия от «правильного выбора агента» не измерена; цена ошибки — цикл переделки.

## 8. Layer B — Model-tier routing

`FACT`: Colabs не выбирает модель/уровень reasoning для протокольной работы — это зона CLI-хостов и бюджета владельца; в продуктах тоже пока фиксировано ролями. Поэтому «предотвратить Opus на простой задаче» — валидная цель, но она **вне текущего контура Colabs**.

Если владелец захочет (product-side, отдельным решением):
- Схема: `Choice` (deterministic_tool | cheap_model | strong_model | frontier | multi_agent | human) + `Score` сложности + `Noul` «нужны ли инструменты/воспроизведение». Прецеденты: `Distill`, `Jev Codex Router` (tier+thinking depth на каждый turn), `jev-router`. `CLAIM/FACT`
- Предохранители: детерминированный максимум (нельзя понижать tier ниже порога для protected paths), лог каждого решения, отсутствие влияния на gate; калибровка на своих исторических задачах.
- Ожидаемая экономия: `HYPOTHESIS` 10–30% стоимости на задачах, где сейчас систематически берётся frontier; измеримо только A/B в продукте.

## 9. Layer C — Review gate: главный кандидат, но только advisory

Сегодняшнее состояние: глубина ревью определяется **policy** (low/normal/high → 1 reviewer / reviewer+integration / ≥2 parallel certifiers) и подтверждается детерминированным gate. Это не «фиксированные циклы» в наивном смысле — архитектура уже риск-масштабирована (PROTO-DEC-0038/0041).

Что может Jev:
- `Choice` «review depth» (accept | single_review | second_review | consilium | human) + `Noul` «есть ли в кандидате неразрешённый вопрос» + `Score` «полнота evidence» — одним вызовом. **B**.
- Жёсткие правила: (1) floor политики неизменяем; (2) Jev не видит секретов и не заменяет воспроизведение; (3) рекомендация всегда видна человеку/контроллеру с confidence и распределением; (4) fail-closed при недоступности API (нельзя «пропустить ревью» из-за 429).
- Ground truth для калибровки: findings ledger'ы (какие дефекты реально нашлись, какие были пропущены и обнаружены позже), журналы раундов, факты повторных ревизий. `FACT` (материал существует: 23 решения, 52 активных review, 25 журналов, архивные INDEX).

`RECOMMENDATION`: это лучший первый runtime-кандидат после калибровки — но он не должен уменьшать обязательное число сертификаторов, только обосновывать **дополнительный** раунд/эскалацию и приоритизацию.

## 10. Layer D — Stop/Continue (marginal value of another round)

`FACT`: у Colabs уже есть формальные анти-idle правила: один primary pass на фазу; повтор только по четырём триггерам; ≤2 ремедиации на root cause; один synthesis/disposition на раунд; запрет нового council без директивы. То есть «бесконечное обсуждение» уже ограничено политикой.

Кандидат Jev: `Noul` «содержит ли новый вход новую информацию, способную изменить вывод?» + `Score` ожидаемой маржинальной ценности + `Choice` (stop | recheck | escalate). **B**, advisory; не может отменять четыре триггера (например, подтверждённый дефект) и не может останавливать сертификацию high-risk до выполнения floor.

Данные для калибровки: последовательности раундов в журналах и ledger'ах (кто нашёл новое после «пора остановиться»). Если в историческом корпусе «ещё один раунд» почти никогда не добавлял новых confirmed findings — тогда stop-рекомендация Jev имеет ценность; если наоборот — она опасна. `MEASURABLE` (см. §24).

## 11. Layer E — Human escalation: confidence ≠ authority

`FACT`: в Colabs авторитетная матрица уже частично детерминирована: protected paths, secrets, release/commit, decisions, freeze-исключения, production/DB-операции (в продуктах), необратимые действия — обязательный человек. Jev не может уменьшать эти гейты.

Правильная схема — **двухслойная**:
1. **Deterministic policy (authority floor)**: пути/расширения/типы операций/флаги (production, migration, credentials, release, governance) → `human_required = true` безусловно.
2. **Jev safety net (advisory)**: `Noul` «содержит ли план необратимое действие, не покрытое floor?», `Noul` «упоминаются ли секреты/креды/чувствительные данные?», `Score` неопределённости. Jev может только **поднять** уровень эскалации, никогда не понизить.

Прецеденты: `jev-use` gate «can only deny or ask», fail-closed при недоступности; `jev-engineering` — deterministic rules before any model call; `Canny`/`jev-belay` — проверка «done»-заявки перед доверием. `CLAIM/FACT` (community-код, не наш стенд)

## 12. Layer F — Meta-controller: допустимо только как advisory

Идея «Jev выбирает процесс» (DIRECT_EXECUTION … CONSILIUM … HUMAN_DECISION) красива, но в Colabs процесс уже **предписан policy** по классу риска и фазе. Meta-controller может:
- рекомендовать **минимально достаточный** процесс выше floor (`Choice` + `Score` сложности + `Noul` достаточности evidence);
- инициировать только те улучшения, которые политика оставляет на усмотрение (третий reviewer по «непокрытому риску», дополнительный integration pass, порядок blocks);
- не может: менять класс риска вниз, отменять сертификацию, созывать council, менять роли.

`RECOMMENDATION`: строить meta-controller как **распределение по процессам + объяснение через ответы на атомарные вопросы** (не как один «оцени всё» вопрос): например, отдельные вопросы «нужен ли запуск тестов до ревью?», «есть ли конфликт evidence?», «затронут ли protected path?» — и код сам собирает распределение. Это ровно рекомендованный вендором паттерн декомпозиции и он снижает context rot. `FACT` (docs) + `RECOMMENDATION`

---

## 13. Дополнительные decision points (сверх заданных слоёв)

| Точка | Класс | Комментарий |
|---|---|---|
| Task decomposition (D9) | **E** | System-2; Jev может лишь оценить «атомарность блока» (Noul по чек-листу) |
| Context routing (D22) | **B** | См. §5; Layer B — канон, Jev — переранжирование |
| Context compression (D28) | **C** | Опасность потери evidence; только с полным архивом оригинала |
| Memory retrieval (Graphiti/Cognee) | **C** | См. §18; внешняя память уже отклонена PROTO-DEC-0034, окно — после пилотов |
| CodeGraph/Serena invocation | **C/D** | Предрегистрированный эксперимент только по owner-директиве; Jev может классифицировать «нужна ли структурная навигация» (Noul) — advisory |
| MCP selection (D27) | **D** | Freeze/allowlist; не ИИ |
| Tool selection | **D/B** | Инструменты детерминированы (suite, validator); «какой тест запустить» — git diff + CI |
| Test selection (D26) | **D** | Расширяемо детерминированно (affected-граф), не Jev |
| Reviewer selection (D3/D8) | **C** | Только capability/availability + owner; мандаты — policy |
| Retry (D16) | **B** | Триггеры формальны; Jev — «стоит ли повтор» advisory |
| Rollback readiness | **C** | Noul «есть ли rollback boundary» по block-спеке — полезный чек-лист |
| Conflict severity (D9/D31) | **E** | Воспроизведение важнее оценки модели |
| Consensus detection | **C** | «Согласны ли два отчёта по существу?» — можно Noul/Score, но голосование не решает (правило симметрии evidence) |
| Evidence sufficiency (D30) | **B** | Чек-лист Noul + детерминированные проверки |
| Handoff sufficiency (D14) | **D/B** | Формат — regex; «сказано ли по существу» — Noul advisory, риск template-gaming |
| Commit/PR readiness (D24) | **F** | Владелец |
| Branch strategy (D25) | **C** | Advisory |
| Model/reasoning selection (D23) | **C** | Product-side |
| Archival (D20/D21) | **A** | Лучший ROI |
| Coverage/dup checks (D29) | **D** | Уже sha256; Jev не нужен |
| Риск-классификация в R5-light | **D** | Protected-path логика детерминирована; Jev не должен её трогать |

## 14. Decision State Packet (DSP)

Принцип: Jev не читает репозиторий, работу и историю агентов. DSP собирается **кодом** из детерминированных источников и фильтруется под конкретный вопрос (официальное предупреждение: context rot и нерелевантный state снижают точность). `FACT` (docs: state/jaggedness) + `RECOMMENDATION`

Источники, доступные детерминированно (всё уже существует в Colabs):
`git status/diff/numstat/ls-files`, `git rev-parse`, exit codes `validate-protocol.ps1` и `test-protocol.ps1`, `protocol-handoff.cjs state/verify/gate-check`, `.ai/runtime/metrics/sessions.jsonl`, `protocol-index.cjs` (индекс решений, 8,4×), `protocol-ledger.cjs cover/dup`, размеры/числа corpus, статус замка, `protocol-manifest.json`, заголовки review-файлов (regex). Плюс — при внешних слоях (§18) и отдельном решении: CodeGraph/Serena-запросы, но не как gate input.

Схемы (PoC-версии):

```jsonc
// DspRouting (advisory, capability/type routing)
{"decision_id":"r-2026-09-22-001","task":{"type":"docs|code|security|release","risk":"low|normal|high",
 "protected_paths_touched":false,"description_excerpt":"<=1200 chars"},"required_capability":["read_only_review"],
 "agents":{"available":["claude","codex"],"exhausted_limits":["codex"],"certifying":["claude","deepseek"],
 "current_locks":["none"]},"budget":{"tokens_left":"unknown","wall":"unknown"}}

// DspReview
{"decision_id":"v-2026-09-22-004","task_risk_class":"high","deterministic":{"light_or_strict":"strict",
 "protected_paths":["validate-protocol.ps1"],"validator":"exit 0","suite":"321/321 exit 0",
 "receipts_fresh":["gemini-927b6b871251a111"]},"candidate":{"files_changed":7,"additions":214,
 "deletions":39,"diff_excerpt":"<=4000 chars","unresolved_findings":1,
 "self_reported_claims":["suite green","scope respected"]},"review":{"mode":"CERTIFYING","verdict":"PASS",
 "mandate":"reproducibility","reviewer":"claude"},"history":{"same_area_passes":2,"last_fail_reason":"none"}}

// DspStop
{"decision_id":"s-2026-09-22-002","phase":5,"rounds_done":1,"triggers_present":["confirmed_defect"],
 "new_input_since_last":"2 findings refuted, 0 new confirmed","ledger":{"confirmed":3,"refuted":5,
 "unresolved":0},"budget":{"attempts_left":1,"declared_phase_budget_exceeded":false}}

// DspEscalation
{"decision_id":"e-2026-09-22-001","action_class":"governance|release|destructive|credentials|code|docs",
 "deterministic_floor":"human_required","irreversibility":"high","plan_excerpt":"<=800 chars",
 "evidence_present":true,"uncertainty_sources":["ambiguous_scope"]}
```

Правила минимизации: (1) DSP — только поля, нужные вопросам; (2) никаких полных файлов, только вырезанные фрагменты и хэши; (3) `state_sha256` фиксирует, что именно оценивалось; (4) если поле неизвестно — `"unknown"`, а не догадка (это само по себе сигнал). `RECOMMENDATION`

## 15. Multi-question strategy: один вызов на decision point, 3–15 атомарных вопросов

`FACT`: API поддерживает смешивание Choice/Score/Noul в одном запросе; вопросы оцениваются параллельно и изолированно; контекст 32k на state+длиннейший вопрос. `CLAIM`: 13 вопросов одним вызовом = 12,2× дешевле/10× быстрее 13 вызовов, ответы те же.

Проектная гранулярность для Colabs:
- **Один decision point = один вызов** с 3–15 атомарными вопросами (например, review-gate: 4 вопроса — risk class, evidence sufficiency, unresolved conflict, review depth).
- **Не «один гигантский evaluation» на всю сессию**: разные слои видят разные state, у них разные пороги и разная цена ошибки; смешивание ухудшает и калибровку, и аудит.
- **Двухстадийность для высоких ставок**: стадия 1 — батч классификации; стадия 2 — точечный вызов только по спорным/низкоконфидентным ответам с более узким state.
- **Проверить batching-инвариантность на своих вопросах**: независимый ordering-тест показал, что батчинг менял прохождение ranking-гейтов; значит для экзаменуемых вопросов сравнить одиночный и батч-режим. `CLAIM/RECOMMENDATION`

Максимум вопросов формально не документирован; ограничение — 64k (state + все вопросы) и падение точности от размера state. Для Colabs держать state ≤8–12k токенов на вызов. `HYPOTHESIS/ESTIMATE`

## 16. Вероятности и калибровка

`FACT`:
- Confidence есть только у Choice и Score; Noul даёт вероятность без confidence.
- `confidence` — детерминированная функция распределения (пример вендора для 3 опций), не «вероятность правильности». Порог нельзя переносить между примитивами: Noul 0,22 и Choice «no» 0,99 на одном кейсе — прямое предупреждение вендора о нарушенных структурных инвариантах.
- Официальных ECE/Brier/reliability-диаграмм для доменов Colabs нет; «калиброванность» — заявление RLCD.
- Независимые данные указывают на task-specific провалы и чувствительность к сдвигу распределения (CLINC150: держит 5% на in-scope, пробивает в 3,6× при росте out-of-scope; KoBBQ: 95% abstain при опции unknown, 79% стереотип при её отсутствии; action-gate: 1 unsafe allow на 111; ranking: 4 из 6 гейтов провалены на другом корпусе). `CLAIM/REPORTED`

Pipeline калибровки для Colabs (`RECOMMENDATION`, выполним офлайн без изменения репозитория):
1. **Собрать labelled dataset** из истории: (a) 52 активных review + архивные INDEX → категории A–F; (b) light/strict для прошлых изменений → детерминированный ground truth; (c) findings ledger'ы → «был ли finding воспроизведён/принят»; (d) раунды → «принёс ли следующий раунд новый confirmed finding»; (e) события владельца → «требовалось ли human-решение»; (f) 9+42+… сессий телеметрии → исходы handoff.
2. **Прогнать Jev 1.13 (pinned, не alias)** по DSP-схемам, с фиксацией полного распределения.
3. **Метрики**: reliability diagram, ECE, Brier, selective accuracy (точность при confidence≥t), confusion по категориям, abstention rate, drift между одиночным и батч-вызовом, русскоязычный vs англоязычный state (Jev English-primary; governance-тексты Colabs англоязычны, но продуктовые задачи — русские; это отдельная ось проверки). `FACT` (language support) + `RECOMMENDATION`
4. **Пороги в коде**: только после этого фиксировать t для каждого вопроса отдельно, скан по held-out части; не переносить пороги между вопросами/примитивами.
5. **Мониторинг дрейфа**: еженедельные теневые прогоны на новых решениях; алерт при падении ECE/selective accuracy; pin версии модели (`jev-1.13.0`), т.к. alias двигается.

## 17. Historical adaptive routing: capability ledger, не «рейтинг моделей»

`FACT`: policy запрещает brand trust; роли — функциональные слоты. Поэтому «self-optimizing routing по историческому успеху бренда» в протоколе нелегален без изменения политики владельцем.

Легальная замена — **capability ledger** из уже существующих детерминированных фактов: кто имеет certifying capability, кто исчерпал лимиты, median handoff completeness, длительность сессий (телеметрия), стоимость по данным CLI. Это не ИИ вообще (класс D). `RECOMMENDATION`

Если владелец захочет performance-routing: (1) только product-side, (2) стратификация по классам задач с минимальным n (≥30 на класс, доверительные интервалы), (3) мониторинг голодания агентов и feedback loop (роутер обучается на собственных решениях), (4) обязательный human override, (5) запрет понижать качество gate. `HYPOTHESIS/RECOMMENDATION`

## 18. Связка с CodeGraph / Serena / Graphiti / Cognee / Mem0

`FACT` (из предыдущего исследования и PROTO-DEC-0034/0036/0039): все внешние контекст-слои сейчас отложены/отклонены; Serena — единственный предрегистрированный кандидат (S1), Graphiti/Cognee/Mem0 — внешняя память, отклонённая как второй источник правды; CodeGraph — новый S1-класс; MCP-совет закрыт до отчёта продуктовых пилотов.

Роль Jev: **не заменять их, а классифицировать необходимость**. Например: `Noul` «требует ли задача структурной навигации по символам (S1)?», `Noul` «достаточен ли детерминированный индекс решений (Layer B) для S3?». Но: (1) любое включение инструментов — по owner-директиве и после пилотов; (2) Jev-вывод advisory, не триггер; (3) если Jev вызывается через MCP-коннектор (`typesafe-mcp`, один tool), появляется schema tax — по политике ≤1500 токенов суммарно и ≤1 сервер; прямой HTTP без MCP предпочтителен, но тогда вызов Jev — новая сетевая зависимость в контуре, что тоже требует отдельного решения. `RECOMMENDATION`

## 19. Failure modes и fallback-архитектура

| # | Риск | Проявление (свидетельства) | Митигация |
|---|---|---|---|
| 1 | Overconfidence / wrong-but-high-confidence | пороги не переносимы; task-shift ломает bound (jev-certify) | калибровка на своих данных, selective accuracy, пороги в коде, human floor |
| 2 | Prompt injection через state | репозиторий полон текстов, «доказывающих» свою правоту; вендор признаёт чувствительность; authority-framing сдвинул 3/30 решений в независимом тесте | state — недоверенные данные; никаких действий по ответу; deterministic floor; canary-тесты с внедрёнными «ignore instructions» |
| 3 | Stale state | DSP собран до правок дерева | `state_sha256` + baseline; повторная сборка при несовпадении; Jev-ответ с истёкшим хэшем отбрасывается |
| 4 | Missing evidence | DSP не содержит receipt/логов | fail-closed: нет evidence → эскалация/строгий путь |
| 5 | Ambiguous Choice | фиксированный набор без «не знаю» → ошибки | всегда добавлять `other/unknown/no_match`; порог confidence; ru/eng проверка |
| 6 | Routing bias / starvation | перфоманс-роутинг, обратная связь | capability-routing (D); никакого brand ranking без owner-решения |
| 7 | Feedback loops | Jev влияет на решения, которые становятся его же обучающими данными | теневой лог; периодический holdout; запрет авто-применения там, где решение пересекается с оценкой |
| 8 | Review loops / premature stop | Jev «остановил» обязательный триггер | Jev не может отменять 4 триггера, floor политики, fail-closed |
| 9 | Premature acceptance | Jev «принял» неполный кандидат | Jev не участвует в gate; advisory только |
| 10 | False / missing escalation | семантика не увидела необратимость | детерминированная матрица действий + Jev как дополнительный (не отменяющий) сигнал |
| 11 | Model drift | alias сменился | pin `jev-1.13.0`, response.model в логе, периодическая ре-калибровка |
| 12 | API outage / rate limit | 429/529, динамические лимиты | retry/backoff; деградация к текущему процессу; authority-функции fail-closed |
| 13 | Vendor lock-in | зависимость от одного вендора | тонкий адаптер; маршруты OpenRouter/Vercel/Cloudflare; локальные альтернативы; kill switch |
| 14 | Data egress | governance-текст уходит наружу | минимизация/редакция DSP; ZDR/DPA для enterprise; аудит state; при запрете — self-hosted вариант |
| 15 | Стоимость-петля | batch по 250 файлов × частые прогоны | бюджеты на вызовы, дедупликация по `state_sha256`, кэш ответов |
| 16 | Language accuracy | English-primary | отдельная калибровка ru-состояний; не смешивать языки в одном DSP |

`FACT`: Jev не должен быть single point of failure; при его отказе Colabs обязан работать без изменений (policy/PROTO-DEC-0034 уже требует деградации без изменения веса gate). `RECOMMENDATION`: авторитетные проверки — fail-closed (нет Jev → как раньше, строже); сервисные подсказки — fail-open (нет Jev → как раньше).

## 20. Security

1. **Классификация данных перед отправкой**: DSP проходит фильтр (запрещённые шаблоны: ключи, `.env`, токены, персональные данные, приватные URL); полный лог того, что ушло, хранится локально (хэш state + размер), сам state — нет. `RECOMMENDATION`
2. **Ключи**: `TYPESAFE_API_KEY` только в environment; никогда в репозитории, журналах, DSP, decision log. Напоминание: флот уже имел инцидент с ключом в `D:\mcp-stack` (`mcp-gateway.js:37`), не повторять. `FACT`
3. **Внешний вывод — недоверенные данные**: ответы Jev нельзя исполнять, нельзя вставлять в промпты как инструкции, нельзя цитировать как Evidence. Внедрённая в state инструкция может сдвинуть ответ — это признано вендором. `FACT`
4. **Изоляция действия**: любые action-gate паттерны — только «deny/ask/abstain», никогда «allow by default»; при недоступности — отказ (прецедент `jev-use`). `RECOMMENDATION`
5. **Аудит**: decision log — append-only JSONL **вне** репозитория (или в `.ai/runtime/`, disposable, не tracked); никакого влияния на tree digest/receipts. `RECOMMENDATION`
6. **Supply chain**: использовать официальный SDK или прямой `fetch` (Node 22); не ставить сторонние обёртки (`jev-use`, MCP-серверы) в протокольный контур без ревью — они получают доступ к текстам репозитория. `RECOMMENDATION`
7. **Юридически/приватность**: у TypeSafe есть DPA/Privacy Policy и ZDR для enterprise; для governance-текста это обязательное условие, иначе self-hosted. `FACT`

## 21. Vendor / fallback strategy

- **Primary**: TypeSafe direct (`api.typesafe.ai`), pinned model, официальный SDK (или fetch) из PoC-каталога вне Colabs.
- **Secondary routes**: OpenRouter `typesafe/jev-1.13`, Vercel AI Gateway, Cloudflare Workers AI — как взаимозаменяемые транспорты за одним интерфейсом адаптера.
- **Local/self-host fallback**: `openjev`, `Laya` (ONNX ~1,7 GB), `Kev`, `AnyDecisionModel` (MLX), либо `system-one-adapter-python` поверх существующих LLM (точность иная, зато локально).
- **Ultimate fallback**: существующий детерминированный процесс Colabs без изменений (гейты, политика, человек). `RECOMMENDATION`
- **Kill criterion**: если shadow-калибровка не проходит пороги (§25) — тема закрывается без интеграции, как Track C/H1. Прецедент честного отрицательного результата у флота уже есть. `FACT`

## 22. Cost model

`FACT`: $0,042/Mtok вход, выход бесплатный. `ESTIMATE` (наши DSP ~0,3–12k токенов):
- архивная классификация 20 документов: ~6k токенов → **$0,00025**;
- review-depth (DSP ~3k): **$0,00013**;
- stop/continue (DSP ~1k): **$0,00004**;
- 500 решений/день при среднем 3k → 1,5M токенов/день ≈ **$0,063/день ≈ $1,9/мес**; даже 5 000 решений/день ≈ $19/мес.
- Сравнение: одна сессия Claude с 45–73k fresh tokens (H1-контроль) стоит на порядки больше, чем все Jev-вызовы за день. Экономика Jev не является ограничением; ограничение — качество и политика. `MEASURED` (H1 numbers) + `ESTIMATE`

## 23. Latency model

`FACT/CLAIM`: 70–500 мс на вызов, p50 community ≈230–274 мс; параллельные вопросы почти не добавляют времени; издержки сети из России/Европы до West Coast могут добавить ещё 100–300 мс (не измерено).
Практический эффект: +0,3–0,8 с на decision point против сессий длиной минуты-часы — незаметно. Выигрыш возможен только когда Jev **заменяет целый дорогой раунд** (например, снимает необходимость отдельного review-прохода), а не когда добавляется к нему. Если Jev просто добавляет проверку поверх существующей — это чистые дополнительные 0,5 с и риск без выигрыша. `RECOMMENDATION/HYPOTHESIS`

## 24. Benchmark на Colabs

Ограничение: менять поведение Colabs нельзя без owner-решения и freeze-исключения; поэтому бенчмарк двухслойный.

**Слой 0 — offline replay (можно сегодня, без изменений репозитория)**
- Датасет (ground truth): архивная классификация (INDEX.md); light/strict по baseline-SHA для исторических диффов; findings ledger disposition; исходы review-раундов; решения владельца; handoff-полнота из телеметрии.
- Прогон Jev на DSP по каждому пункту; метрики: accuracy, abstention, ECE/Brier, selective accuracy, confusion, batching-инвариантность, ru/eng, latency, $.
- Выход: `CALIBRATION-REPORT.md` с доверительными интервалами и явным «n мал, значимость не заявляется».

**Слой 1 — live shadow (после owner-решения; поведение Colabs не меняется)**
- Арм A (control) — текущий процесс.
- Арм S — те же решения, но параллельно записываются рекомендации Jev, распределения, confidence, фактические решения человека/контроллера и последующий исход.
- Метрики: agreement, calibration, wrong-high-confidence, false escalation, missed escalation, latency, cost, «сколько раз рекомендация отличалась от фактического успешного решения».

**Слой 2 — controlled advisory (только обратимые, не-authority поверхности, по owner-решению)**
- Арм B: Jev предлагает архивную категорию (детерминированная проверка цитат остаётся обязательной).
- Арм C: Jev рекомендует review-depth выше floor.
- Арм D: Jev даёт P(дополнительный раунд полезен) — контроллер решает.
- Арм E: Jev рекомендует эскалацию (только вверх).
- Арм F: meta-controller как advisory-распределение процессов.
- Измерения (полный список задания §19): wall-clock, decision latency, total/frontier/Jev tokens, frontier calls, handoffs, review/consilium rounds, human interventions, cost, retries, regressions, false accept/reject, wrong routing, human overrides. Источники: `sessions.jsonl`, `git diff --numstat`, journals, ledger'ы, cost-отчёты CLI.
- Анализ: парные сравнения на сопоставимых задачах, медианы с n≈5–10 на арм, confidence intervals; никакой статистической значимости при малых n. `RECOMMENDATION`

**Ключевой дизайн-принцип**: любой арм, затрагивающий gate/вердикты/authority, запрещён; их «ускорение» можно оценить только контрфактически (сколько раундов/сессий было бы сэкономлено), и это остаётся гипотезой, а не измерением.

## 25. Shadow-mode rollout и promotion criteria

`RECOMMENDATION` (стадии и количественные пороги; пороги — предложение, утверждает владелец):

- **S0 Offline replay** — без допуска. Gate: датасет ≥100 решений с ground truth; отчёт с ECE/Brier/selective accuracy; выявленные failure modes; budget-аудит (утечек нет).
- **S1 Live shadow** — пишется только лог. Gate для перехода (по каждой поверхности отдельно): ≥150–200 наблюдений; ECE ≤0,05; при confidence ≥0,90 ошибка ≤2% (для классификаций с ground truth); 0 опасных «allow» в escalation-кейсах; 0 расхождений с детерминированным ground truth там, где он есть; human override ≤10%; latency p95 ≤1 с; нет инцидентов утечки/инъекции; дрейф за 4 недели ≤2 п.п.
- **S2 Advisory** — рекомендации видны человеку/контроллеру, fail-open, не gate input. Gate: ≥300 наблюдений; подтверждённая калибровка на новых данных; владелец подтверждает, что рекомендации снижают его нагрузку (опрос/метрика «owner touches»).
- **S3 Guarded auto (только обратимые, не-authority действия)** — например, авто-применение архивной категории при выполнении: (a) confidence ≥ порога, (b) детерминированная проверка цитат PASS, (c) corpus в бюджете, (d) лог и one-command rollback. Gate: ≥500 наблюдений; false-apply ≤1%; 0 инцидентов за 6 недель; явное owner-решение и отдельный PROTO-DEC.
- **S4 Auto** — запрещено для authority/gate/вердиктов навсегда; для прочих поверхностей рассматривается отдельно и не входит в текущий scope.
- **Откат в любой момент**: удалить вызов Jev — Colabs продолжает работать как раньше (обязательство деградации).

## 26. Минимальная архитектура с максимальным ROI

```text
(вне репозитория, без изменения Colabs)
историческая телеметрия/артефакты  -> DSP builder -> Jev (pinned) -> decision log (JSONL)
                                                              |
                                                              v
                                                   CALIBRATION-REPORT (offline)

(после owner-решения; runtime-only, advisory)
TASK -> DSP builder -> Jev -> [рекомендация + распределение + confidence]
                                   |
        +--------------------------+---------------------------+
        v                          v                           v
  архивная категория        review depth (>= floor)      stop/continue (advisory)
  (проверка цитат — код)    (policy решает)              (триггеры неприкосновенны)
```

Почему именно это: (1) не трогает gate/вердикты/власть; (2) использует уже существующие ground truth и телеметрию; (3) обратимо удалением вызова; (4) даёт измеримые метрики до любого внедрения; (5) не требует MCP и новых серверов. Router, model-tier и meta-controller — **после** доказанной калибровки и только по отдельному решению. `RECOMMENDATION`

## 27. Полный Decision Fabric (рациональный максимум)

```text
HUMAN / OWNER  (authority: решения, release, governance, irreversible)
      ^
Policy Engine  (детерминированные floor'ы, матрица эскалации, лимиты, freeze)
      ^
JEV Escalation  (advisory: поднять уровень, никогда не понизить)
      ^
JEV Meta-Controller  (advisory: распределение процессов выше floor)
      ^
+-------------+--------------+
| ACCEPT      | REVIEW       | CONSILIUM (только owner)
+-------------+--------------+
      ^
JEV Review/Stop  (advisory; триггеры и floor неприкосновенны)
      ^
Agent(s)  (frontier/System-2; единственные, кто пишет код и evidence)
      ^
JEV Router  (advisory: capability/тип задачи; не бренд-ранжирование)
      ^
DETERMINISTIC PRE-FILTER  (protected paths, light/strict, замки, бюджеты, receipts)
      ^
TASK
```

Инварианты: каждый следующий уровень вызывается только если предыдущего недостаточно; Jev никогда не исполняет и не сертифицирует; каждый Jev-ответ логируется с распределением и хэшем state; «нет Jev» = текущий процесс. `RECOMMENDATION`

## 28. Roadmap

| Шаг | Что | Требования | Выход |
|---|---|---|---|
| R0 | Offline dataset + replay harness (вне репо) | ничего у владельца; только чтение | CALIBRATION-REPORT, failure-mode list |
| R1 | Owner-решение по результатам R0 (PROTO-DEC, registry row) | владелец; никаких изменений кода | решение: shadow / stop |
| R2 | Runtime shadow-рекордер (`.ai/runtime/` или внешний процесс) | freeze-исключение PROTO-DEC-0039; high-risk review: adversarial prompt + 2 независимых сертификатора (PROTO-DEC-0038/0041) | shadow-лог, drift-отчёты |
| R3 | Advisory-поверхности (архив, review-depth, stop) | owner + прохождение promotion criteria S1/S2 | рекомендации в контексте сессий |
| R4 | Guarded auto для одной обратимой поверхности | owner + S3 criteria + отдельный PROTO-DEC | авто-применение с rollback |
| R5 | Ревизия: расширять/закрыть | owner | итоговый отчёт, обновление политики |

`RECOMMENDATION`: R0 можно выполнить без единого изменения Colabs; R1+ — только после результатов R0. Оценка трудоёмкости R0: 1–2 сессии на датасет и harness; R2 — протокольное изменение (core path), т.е. полный цикл с двумя сертификаторами.

## 29. PoC design (не production)

Каталог вне репозитория (например, `D:\jev-colabs-poc`), лицензионно чисто, в Colabs ничего не импортируется.

```text
src/
  jev/client.ts          // fetch-адаптер: POST /v1/systemone, pin jev-1.13.0, retry 429/529, таймаут
  jev/types.ts           // Noul/Choice/Score, вопрос-хелперы, ResultFor<T>
  dsp/builders.ts        // buildRoutingDsp/buildReviewDsp/buildStopDsp/buildEscalationDsp (read-only сбор из git/файлов)
  policy/engine.ts       // детерминированные floor'ы, матрица authority, пороги (числа — конфиг)
  decision-engine.ts     // evaluate({type,state}) -> typed decision + advisory envelope
  shadow/recorder.ts     // JSONL decision log вне репо, дедуп по state_sha256
  calibration/metrics.ts // ECE, Brier, selective accuracy, reliability buckets
  replay/harness.ts      // офлайн-прогон исторических решений, отчёт
fixtures/                // синтетические и исторические кейсы (без секретов)
```

Интерфейсы (TypeScript, эскиз):

```ts
type Question =
  | { type: 'noul'; instructions: string; criteria?: { true?: string; false?: string } }
  | { type: 'choice'; instructions: string; criteria: Record<string, string | null> }
  | { type: 'score'; instructions: string; criteria: string[] };

interface EvaluateRequest<K extends DecisionKind> {
  type: K;
  state: DspByKind[K];          // DSP для слоя
  policyRevision: string;        // хэш/рев политики, с которой собраны пороги
  mode: 'shadow' | 'advisory';   // 'auto' не существует в PoC
}

type DecisionEnvelope<A> = {
  decisionId: string; model: string; stateSha256: string;
  answers: A;                    // типизированные ответы Jev
  recommendation: string;        // собранная кодом рекомендация
  policyFloor: string;           // что решает детерминированная политика
  advisory: true;                // всегда true в PoC
  latencyMs: number; usage: { inputTokens: number };
};

// пример вызова
const d = await decisionEngine.evaluate({ type: 'review-depth', state: buildReviewDsp(root), policyRevision: 'pdc-0041', mode: 'advisory' });
// d.recommendation: 'second_review' | 'single_review' | 'consilium' | 'human'
// d.policyFloor: 'two_parallel_certifiers' (high-risk floor неизменяем)
```

Примеры реальных Jev-вопросов для Colabs (state — DSP; ответы комбинируются кодом):

1. **Архивная категория** (Choice, 6 опций): «К какой категории относится этот документ: A KEEP-BINDING, B KEEP-ACTIVE EVIDENCE, C KEEP-OPEN, D ARCHIVE-SUPERSEDED, E ARCHIVE-CLOSED, F AMBIGUOUS?» при criteria, описывающих каждую категорию; отдельный `Noul` «Содержит ли документ живую цитату из TASK/PLAN/DECISIONS/REGISTRY/AGENTS/тестов?» (подсказка, проверяемая кодом).
2. **Review depth** (Choice + Noul): Choice «accept | single_review | second_review | consilium | human»; Noul «есть ли воспроизведённый дефект на protected path?»; Noul «содержит ли отчёт описание evidence, а не только вывод?».
3. **Stop/continue** (Noul + Score): Noul «содержит ли новый вход новую информацию, которая может изменить вывод?»; Score «ожидаемая маржинальная ценность ещё одного раунда» (0–2: нет | возможно | высокая).
4. **Escalation safety net** (Noul + Choice): Noul «описывает ли план необратимое действие или изменение governance?»; Noul «упоминает ли state секреты, креды или production-доступ?»; Choice «какой уровень эскалации рекомендован» — только повышение.
5. **Evidence rubric** (пакет Noul): «приложен ли receipt?», «указан ли baseline 40-hex?», «перечислены ли acceptance criteria и их статус?», «есть ли ссылка на воспроизведение?».

Decision log (JSONL, вне репо):

```jsonc
{"ts":"2026-09-22T20:40:00Z","decision_id":"v-2026-09-22-004","kind":"review-depth","model":"jev-1.13.0",
 "state_sha256":"...","questions":5,"answers":{...},"recommendation":"second_review","confidence":0.82,
 "policy_floor":"two_parallel_certifiers","actual":"second_review","outcome_refs":["docs/reviews/..."],
 "latency_ms":281,"usage":{"input_tokens":2871},"advisory":true}
```

Тесты PoC: контрактные (типы ответов), инъекционные (state с «ignore instructions»), стабильность (single vs batch), ru/eng-наборы, регрессия порогов на замороженном holdout.

## 30. Финальные выводы

1. **Гипотеза автора уточняется так**: Jev — не «дешёвый участник совета» и не замена reasoning-агентов, а **typed decision evaluator**, пригодный для ограниченного класса решений Colabs. Он может дать выигрыш в координационном слое, но не в производстве кода/тестов и не в authority.
2. **Главный механизм выигрыша** — не latency (0,3 с против часов), а возможное **сокращение целых дорогих раундов** (review/consilium/owner-триаж) при условии, что shadow докажет калибровку и что владелец изменит политику там, где она допускает сокращение. Без изменения политики выигрыш близок к нулю.
3. **Риски перевешиваются только при жёстком каркасе**: детерминированный pre-filter → Jev advisory → policy floor → human authority; fail-closed для authority; никакой прямой интеграции в gate; минимальный DSP; pin модели; полный shadow-лог.
4. **Порядок действий**: R0 (offline replay, без изменений Colabs) → решение владельца → R2 shadow → advisory → (возможно) guarded auto для одной обратимой поверхности. Всё остальное — потом и отдельными решениями.
5. **Итог по вопросу «Decision Fabric или вспомогательный router/gate»**: вспомогательный advisory-контур. «Центральный fabric» структурно невозможен без нарушения PROTO-DEC-0034/0041 и создал бы single point of failure.

---

## Обязательные финальные ответы

**A. Где Jev даёт наибольший ROI в Colabs?**
В advisory-триаже ограниченных текстовых решений с существующим ground truth: (1) архивная классификация review-документов A–F (при детерминированной цитатной проверке), (2) рекомендация глубины ревью **выше** policy floor, (3) rubric-проверки evidence/acceptance criteria, (4) safety-net при эскалации (только вверх), (5) P(marginal value следующего раунда) как сигнал контроллеру. `RECOMMENDATION`

**B. Какие решения категорически не стоит передавать Jev?**
Сертификация/вердикты; completion gate; решения владельца (governance, release, freeze, роли); воспроизведение дефектов; разрешение инженерных споров; всё, что уже решает regex/скрипт; действия с side effects; обработка секретов; понижение human gate; brand-based routing. `FACT/RECOMMENDATION`

**C. Может ли Jev безопасно решать, нужен ли следующий review?**
Как **решение** — нет: это policy/authority. Как **advisory-вероятность** — да, при калибровке на своих данных, с обязательным floor (high-risk ≥2 независимых сертификатора) и fail-closed. Независимые исследования показывают, что пороги ломаются при сдвиге распределения. `RECOMMENDATION`

**D. Может ли Jev определять, когда нужен человек?**
Определять — нет; рекомендовать — да. Authority-матрица (protected paths, secrets, release, необратимое, governance) должна оставаться детерминированной; Jev может только повышать уровень эскалации. Confidence ≠ authority. `FACT/RECOMMENDATION`

**E. Может ли Jev выбирать между Claude/Codex/Gemini?**
Технически классифицировать — да; легально в Colabs — нет без изменения политики «No brand trust». Легальная замена — capability/availability routing (детерминированно). Performance-routing по бренду создаёт bias, голодание и feedback loops. `FACT`

**F. Стоит ли использовать Jev для оценки результатов LLM, и для каких типов?**
Да — для **structural/rubric evaluation**: наличие evidence, baseline, acceptance criteria, scope adherence, формальные признаки, «есть ли воспроизведение», согласованность с DSP. Нет — для **deep semantic/engineering judgment**: корректность архитектуры/доказательства, тонкие race condition, «прав ли Claude или Codex»; здесь нужны System-2 и воспроизведение, а не вероятностная оценка. `RECOMMENDATION`

**G. Несколько Jev calls или один multi-question call?**
Один state + пакет атомарных вопросов (3–15) на decision point; не «один огромный evaluation»; для высоких ставок — двухстадийно; обязательно проверить batching-инвариантность (в независимом тесте батчинг менял результат) и держать state ≤8–12k токенов. `RECOMMENDATION` (основание — `FACT` API + `CLAIM` кукбука)

**H. Минимальная архитектура с большей частью эффекта?**
Offline replay + shadow-лог + advisory-пакет из 3–4 поверхностей (архив, review-depth, stop, escalation) с детерминированными floor'ами и без изменения gate. Это даёт измеримость и обратимую ценность; router/model-tier/meta-controller — не в минимальном контуре. `RECOMMENDATION`

**I. Есть ли основания ожидать ускорение Colabs в разы?**
Нет. `MEASURED`: wall-clock доминируют агентские сессии (медиана Claude ~5,7 ч wall) и человеческие паузы; детерминированные проверки и так быстрые; Jev устраняет только малую долю `T_decision`. `ESTIMATE`: типично 1,05–1,3×; до ~2× только при изменении review-политики владельцем и доказанной безопасности stop/review-рекомендаций; 3–5× — без механизма. `RECOMMENDATION`

**J. Если ускорение есть, то за счёт каких механизмов?**
(1) Замена целых review-раундов advisory-фильтрацией (при изменении политики); (2) сокращение owner-триажа (меньше «owner touches»); (3) меньше токенов frontier на классификацию/координацию; (4) более ранний и дешёвый первый проход по простым задачам; (5) меньше контекстного чтения (S3-селекция) — при условии, что Layer B уже не покрывает случай. Все механизмы — условные и измеримые только в controlled advisory/пилоте. `HYPOTHESIS`

**K. Какой benchmark докажет/опровергнет?**
Двухслойный: offline replay на исторических решениях с ground truth (архив INDEX, light/strict, findings disposition, исходы раундов, решения владельца) + live shadow/controlled advisory по поверхностям с метриками §24 (calibration, false accept/reject, missed/false escalation, tokens, rounds, owner touches, cost) и promotion-порогами §25. «Разовость» wall-clock корректно проверяется только controlled-пилотом на сопоставимых задачах; при малых n — только описательные медианы и доверительные интервалы. `RECOMMENDATION`

**L. Jev — центральный Decision Fabric или вспомогательный router/gate?**
Вспомогательный advisory-контур. Центральный fabric противоречит трём несущим опорам Colabs: детерминированный gate (PROTO-DEC-0034), human authority и независимая сертификация с capability-профилем (PROTO-DEC-0041); он же создал бы single point of failure и внешнюю зависимость в критическом пути. Максимум допустимого — advisory decision layer, расширяемый по мере доказанной калибровки и только для обратимых, не-authority решений. `RECOMMENDATION/FACT`

---

## Приложение: источники

**Colabs (локальное дерево, 2026-09-22)**: `AGENTS.md`; `.ai/docs/PAIRED-CYCLE.md`; `.ai/docs/PROTOCOL.md`; `.ai/TASK.md`; `.ai/PLAN.md`; `.ai/DECISIONS.md` (PROTO-DEC-0034/0035/0036/0039/0040/0041/0044); `.ai/ARCHIVE.md`; `docs/reviews/2026-09-20-mcp-council-final-round2-synthesis.md`; `docs/reviews/2026-09-19-h1-pilot-report-correction.md`; `docs/reviews/2026-09-19-deepseek-flash-mcp-selection-analysis.md`; `.ai/bin/protocol-handoff.cjs` (`gateCheck`:934, `isLightPath`:975, `isProtectedPath`:1037); `protocol-manifest.json`; `.ai/runtime/metrics/sessions.jsonl` (диспозитивная телеметрия); предыдущий отчёт `docs/research/2026-09-22-kilo-candidate-tool-evaluation.md`.
**Jev/TypeSafe**: `vercel.com/ai-gateway/models/jev`; `docs.typesafe.ai/{introduction,api,models,confidence,concepts/state,concepts/system-one,introduction/coding-agents,model-jaggedness/jev-1.13,patterns/intent-routing,cookbooks/parallel_questions}`; `typesafe.ai/blog/introducing-system-one-models-and-jev`; community-индекс `github.com/AbdelStark/awesome-typesafe-jev` (включая ссылки на независимые исследования: KoBBQ audit, Janus, jev-certify CLINC150, jev-orderby-bench, agent-action-gate, jev-engineering adversarial kit); `registry.npmjs.org/jev-use`; `github.com/itsmostafa/typesafe-mcp`; `github.com/devagrawal09/jev-review`.

**Границы этого исследования**: ни один кандидат не устанавливался и не вызывался; все числа вендора/сообщества помечены `CLAIM`; пороги promotion в §25 — предложение, не результат измерения; wall-clock доли в §20/§23 — `ESTIMATE` на основе телеметрии длительностей сессий, которая включает простой и не разделяет reasoning/tool/human. Для окончательных выводов нужен R0 (offline replay) и, при решении владельца, R2 (shadow).

