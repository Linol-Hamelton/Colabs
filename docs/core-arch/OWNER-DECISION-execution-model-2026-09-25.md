# Owner decision: recovery policy, B1-B8 and the system-level execution model (2026-09-25)

The owner's two answers to the questions on `docs/core-arch/PROPOSAL-role-resolver-supervisor.md`,
given in chat on 2026-09-25 and saved by claude-c73232724159e5bd. Below each of the two headings,
the text is the owner's, verbatim. PROTO-DEC-0075 records it.

## Answer 1: the fork on automatic retries

Выбираю расширенный F-c: error-aware hybrid recovery с ограниченным общим бюджетом попыток, resume-first после начатой работы и двумя динамически выбранными заместителями.

Не фиксировать универсальное правило «при любом сбое сделать 1+2+2 одинаковых запусков». Число 1+2+2 допустимо использовать как верхнюю границу fresh invocation budget, но конкретное действие должно определяться классом ошибки.

### Основной инвариант

Recovery определяется причиной сбоя, состоянием уже выполненной работы и доступностью маршрутов.

Повтор заведомо нерабочей операции запрещён.

Каждая новая попытка должна иметь обоснование:
- transient retry;
- resume существующей сессии;
- смена route/client;
- смена модели;
- repair invalid result;
- escalation по качеству.

Простое «запустить то же самое ещё раз» без классифицированной причины не считается recovery policy.

---

### Базовый budget

Для шага предусматриваются:

- primary route/model;
- fallback-1;
- fallback-2.

Ориентировочный верхний предел fresh invocations:

- primary: initial attempt + максимум 1 повтор при retryable transient failure;
- fallback-1: максимум 2 попытки;
- fallback-2: максимум 2 попытки.

То есть ориентир — максимум 5 fresh invocations после первоначального запуска / либо эквивалентный ограниченный budget, но это не означает обязательное расходование всех попыток.

Если причина ошибки делает повтор бессмысленным, соответствующие попытки пропускаются.

`resume/continue` существующей успешно начатой сессии учитывать отдельно от fresh invocation, потому что resume сохраняет уже выполненную работу и обычно дешевле полного перезапуска.

---

### Классы ошибок и обязательное поведение

#### 1. AUTH / BAD KEY / MISSING KEY

Примеры:
- invalid API key;
- missing token;
- authentication failure;
- credential unavailable.

Действие:

- НЕ повторять тот же route с теми же credentials;
- если существует совместимый route с другими credentials/client — сразу перейти к нему;
- если ни одного допустимого route нет — `BLOCKED`, а не серия бессмысленных retries.

---

#### 2. INVALID CONFIG / UNSUPPORTED FLAG / MODEL-PARAMETER MISMATCH

Примеры:
- модель не принимает `effort`;
- неправильное имя route;
- отсутствующий параметр;
- несовместимая CLI option.

Действие:

- не повторять неизменённую команду;
- если runner умеет безопасно нормализовать известную конфигурационную ошибку — исправить invocation один раз;
- иначе перейти к совместимому route/model;
- если ошибка относится к самому dispatch/specification — `BLOCKED/CONFIG_ERROR`.

---

#### 3. MODEL UNAVAILABLE / PROVIDER UNAVAILABLE

Действие:

- не тратить полный retry budget на отсутствующую модель;
- допустим один короткий retry только если ошибка явно transient;
- затем fallback-1;
- затем fallback-2.

---

#### 4. HARD QUOTA EXHAUSTED / PLAN LIMIT EXHAUSTED

Действие:

- не повторять тот же недоступный route;
- сразу перейти на допустимого заместителя;
- если заместителя нужного capability class нет — `BLOCKED` и вопрос владельцу.

Не путать с кратковременным rate limit.

---

#### 5. RATE LIMIT

Если API/CLI возвращает разумный `retry-after` и ожидание дешевле смены модели:

- выполнить bounded wait;
- один retry текущего route.

Если ожидание велико либо limit фактически долгосрочный:

- сразу переходить к fallback.

Runner не должен часами ждать освобождения лимита, если имеется эквивалентный доступный route.

---

#### 6. NETWORK ERROR / TRANSIENT PROVIDER ERROR

Действие:

- один retry того же route;
- если не помогло — fallback-1;
- далее согласно общему retry budget.

Использовать bounded exponential backoff/jitter, если это оправдано клиентом.

---

#### 7. PROCESS CRASH / CLI CRASH

Если сессия ещё существует и клиент поддерживает продолжение:

1. попробовать `resume/continue`;
2. если resume невозможен или не помог — fresh retry текущего route;
3. затем fallback.

---

#### 8. STALL / HANG / NO PROGRESS

Не определять зависание только по wall-clock времени.

Runner должен отслеживать признаки жизни/прогресса:

- heartbeat;
- изменение status/progress файла;
- изменение ожидаемого output artifact;
- увеличение журнала;
- изменение `progress_seq`;
- иной достоверный signal.

Нужны два независимых ограничения:

##### Liveness timeout
Если нет реального progress signal в течение N минут — step считается stalled.

Стартовое значение может быть порядка 10–15 минут и затем калиброваться по данным.

##### Hard execution ceiling
Абсолютный потолок жизни шага независимо от heartbeat.

До появления статистики допустимо использовать bootstrap ceiling около 120 минут для длительных ролей, но далее потолок должен рассчитываться по истории конкретной роли/класса задач, желательно по p90/p95 либо консервативной функции исторических значений.

Heartbeat сам по себе не должен позволять бесконечно удерживать зависший логически процесс.

При stall:

1. если есть resumable session — сначала resume;
2. затем fresh retry;
3. затем fallback-1;
4. затем fallback-2;
5. после исчерпания budget — `BLOCKED/FAILED`.

---

#### 9. TIMEOUT

Отличать:

- inactivity/liveness timeout;
- hard execution timeout;
- provider-side timeout;
- CLI timeout.

Recovery выбирается согласно природе timeout.

Hard timeout не должен автоматически приводить к бесконечному resume той же явно зацикленной сессии.

---

#### 10. INVALID OUTPUT / STRUCTURAL FAILURE

Примеры:
- обязательный файл не создан;
- файл пуст;
- неверный формат;
- отсутствует обязательный раздел;
- JSON/Markdown/schema невалидны.

Это не transport failure.

Действие:

1. если session resumable — одна targeted repair попытка той же модели с конкретным validator feedback;
2. повторная валидация;
3. если structural failure сохраняется — fallback/reviewer согласно policy.

Не запускать весь исходный prompt заново, если достаточно repair.

---

#### 11. SEMANTICALLY BAD RESULT / REVIEW FAILURE

Примеры:
- ответ формально валиден, но неверен;
- reviewer выявил противоречие;
- evidence не подтверждает вывод;
- specification неполна.

Это не обычный retry.

Действие:

1. targeted repair текущей моделью допускается один раз, если reviewer дал конкретный feedback;
2. если проблема остаётся — escalation к модели более высокого capability class;
3. старшая модель получает исходную задачу + результат + evidence + critique, а не начинает исследование вслепую;
4. если senior также не разрешает проблему — `BLOCKED`/owner decision.

---

#### 12. DEPENDENCY FAILURE

Если вход предыдущего шага отсутствует, невалиден или не завершён:

- следующий шаг не запускать;
- состояние `WAITING_DEPENDENCY` либо `BLOCKED_DEPENDENCY`;
- не считать это failure модели и не расходовать retry budget.

---

#### 13. POLICY FAILURE

Если нарушено протокольное условие:

- запрещённый target;
- неподходящий delivery mode;
- непроверенный input;
- отсутствует mandatory evidence;

не пытаться лечить это сменой модели.

Step блокируется до восстановления policy invariant.

---

### Completion contract

`exit code 0` сам по себе НЕ означает, что step завершён.

Step считается `DONE` только если одновременно выполнено всё требуемое:

1. процесс действительно завершился;
2. exit code записан;
3. обязательные output artifacts существуют;
4. они не пустые;
5. прошли минимальную structural/schema validation;
6. записан Evidence;
7. если шаг требует специализированного validator — он прошёл;
8. завершение зарегистрировано supervisor'ом.

---

### State machine

Минимально:

`PENDING`
→ `READY`
→ `RUNNING`

Из `RUNNING` возможны:

- `DONE`;
- `RETRYABLE`;
- `REPAIRING`;
- `WAITING_DEPENDENCY`;
- `BLOCKED`;
- `FAILED`.

Для retry:

`RETRYABLE`
→ `RESUMING` или `RETRYING`
→ `RUNNING`.

Состояние и причина перехода должны логироваться.

---

### Выбор fallback

Fallback'и не должны быть навсегда захардкоженными именами конкретных моделей.

Step задаёт:

- role;
- capability floor/class;
- criticality;
- необходимые tools/context/modalities;
- budget constraints;
- число резервных кандидатов.

Model resolver перед стартом выбирает:

- primary;
- fallback-1;
- fallback-2,

с учётом:

- capability;
- доступности;
- route health;
- текущих лимитов;
- context support;
- tool support;
- стоимости;
- истории надёжности.

Фактически выбранные модели и причины выбора записываются в Evidence.

---

### Retry budget

Нужен одновременно:

- per-route budget;
- global step budget;
- hard time budget;
- при возможности monetary/token budget.

Runner обязан прекращать автоматическое восстановление при исчерпании любого критического budget и переводить step в `BLOCKED`, а не продолжать бесконечный failover.

---

### Итоговое правило

Использовать F-c как `error-aware supervised recovery`.

`1+2+2` — не алгоритм сам по себе, а ориентировочный максимальный резерв fresh attempts.

Цель — минимизировать:
- бессмысленные запуски;
- потерю уже выполненной работы;
- ожидание человека;
- расход дорогих моделей;

при сохранении способности многочасовой цепочки самостоятельно переживать реальные transient failures.

## Scope boundary

Данный recovery policy действует внутри ОДНОГО stage.

`resume`, `retry`, `fallback` и `execution-repair` не являются новым review round.

Если stage содержательно завершён, но следующий reviewer/certifier отклонил результат, дальнейшая работа создаётся WORKFLOW / ASSURANCE POLICY как новый semantic repair/review stage.

Execution Supervisor не имеет права самостоятельно превращать technical retry в новый semantic workflow cycle и наоборот.

## Answer 2: B1-B8 and the system-level execution model

Принять B1–B6 с указанными ниже уточнениями и одновременно добавить B7–B8. Фиксировать именно эти инварианты, а не текущие конкретные имена моделей/маршрутов.

---

## B1 — ACCEPT WITH REFINEMENT
### Model tier определяется неопределённостью и последствиями ошибки, а не объёмом механической работы

Объём задачи, число файлов, строк кода или продолжительность исполнения НЕ должны сами по себе повышать уровень модели.

Основные параметры model tier:

1. uncertainty / novelty;
2. reasoning depth;
3. consequence/cost of error;
4. reversibility ошибки;
5. cross-system coupling;
6. требуемая степень независимого суждения.

Hard constraints отдельно:

- context window;
- modality;
- tools;
- route/client capability;
- language/runtime support.

Концептуально:

`required intelligence ≈ uncertainty × consequence_of_error`

а не:

`required intelligence ≈ amount_of_output`.

### Senior/frontier модели преимущественно использовать для:

- стратегических планов;
- roadmaps;
- архитектуры;
- изменения архитектуры;
- архитектурной сертификации;
- synthesis повышенной ответственности;
- certification повышенной ответственности;
- specification повышенной ответственности;
- design решений с большим blast radius;
- audit повышенной ответственности;
- сложного debugging при высокой неопределённости;
- расследования противоречивых evidence;
- реализации кода только там, где сама implementation требует сильного reasoning.

Не использовать senior-модель как дорогую «клавиатуру» только потому, что нужно написать большой объём кода.

Предпочтительная экономичная цепочка:

`senior → specification/architecture`
→ `worker → implementation`
→ `middle → review/fix`
→ при нерешённой проблеме `senior escalation`.

Если качественная спецификация делает задачу механической, worker должен иметь возможность выполнить основную реализацию.

---

## B2 + B3 — ACCEPT WITH REFINEMENT
### Supervisor timeout + строгий completion contract

Нужны два независимых временных механизма.

### 1. Liveness / inactivity timeout

Контролируется не просто временем, а отсутствием признаков прогресса.

Допустимые progress signals:

- heartbeat;
- обновление status файла;
- изменение output artifact;
- progress counter;
- изменение журнала;
- иной проверяемый signal.

Начальное значение можно установить около 10–15 минут без прогресса и далее калибровать.

### 2. Hard execution ceiling

Абсолютный предел жизни шага независимо от heartbeat.

Пока статистики нет:
- допустим bootstrap ceiling порядка 120 минут для длительных ролей.

После накопления истории:
- потолок рассчитывать по классу роли/задачи;
- предпочтительно использовать p90/p95 либо иную устойчивую историческую оценку;
- не полагаться только на голую медиану.

`3 × median` может оставаться одним из эвристических сигналов, но не единственным универсальным правилом.

### Completion contract

Step `DONE` только если:

- process завершён;
- exit code зафиксирован;
- required output files существуют;
- required files не пустые;
- прошла минимальная structural/schema validation;
- требуемый specialized validator прошёл;
- Evidence записан.

`process exited 0` ≠ `step completed`.

---

## B4 + B5 — ACCEPT WITH REFINEMENT
### Error taxonomy + immutable launch inputs

Ввести минимальную классификацию ошибок:

- `AUTH_ERROR`;
- `QUOTA_EXHAUSTED`;
- `RATE_LIMIT`;
- `MODEL_UNAVAILABLE`;
- `CONFIG_ERROR`;
- `NETWORK_ERROR`;
- `PROVIDER_ERROR`;
- `PROCESS_CRASH`;
- `STALL`;
- `TIMEOUT`;
- `INVALID_OUTPUT`;
- `VALIDATION_FAILURE`;
- `SEMANTIC_FAILURE`;
- `DEPENDENCY_FAILURE`;
- `POLICY_FAILURE`.

Эта классификация должна управлять recovery policy, а не использовать один generic `ERROR → retry`.

### Launch provenance / pinning

Не вводить глобальный запрет запуска при любом dirty repository.

Инвариант должен относиться к фактическим INPUT ARTIFACTS запуска.

Перед запуском зафиксировать минимум:

- Git HEAD;
- путь canonical launch/task file;
- SHA-256 canonical task;
- SHA-256 role file, если отдельный;
- corpus/manifest revision/hash, если используется;
- relevant dispatch version;
- route/model resolution result.

Если конкретный input artifact изменён после pinning, запуск должен:
- либо остановиться;
- либо явно создать новую launch revision/hash.

Посторонние незакоммиченные изменения, не входящие в execution inputs, сами по себе не должны блокировать работу.

При этом для особо критичных protocol inputs можно отдельно установить требование `must be committed`.

Цель:
`exactly know what the agent received`,
а не:
`repository must always be perfectly clean`.

---

## B6 — ACCEPT WITH IMPORTANT ORDERING
### Capability floor first, cost optimization second

Цена не должна автоматически понижать required model tier.

Порядок выбора:

1. определить минимальный capability floor;
2. исключить модели ниже него;
3. проверить техническую совместимость;
4. среди оставшихся оптимизировать:
   - quality;
   - reliability;
   - availability;
   - latency;
   - cost;
5. применить step budget/cost ceiling.

Если ни одна модель, удовлетворяющая capability floor, не укладывается в допустимый budget:

`ASK OWNER / BLOCKED_BUDGET`

до старта.

Не делать скрытую замену senior → weak model только ради цены.

### Budget

Желательно иметь:

- estimate до запуска;
- actual cost после запуска;
- cumulative chain cost;
- cost by role/model/route.

История расхода должна улучшать будущий resolver.

---

## B7 — ADD AND ACCEPT
### Dynamic role/capability-based model resolver

Протокол не должен хардкодить конкретную модель как семантику роли.

Плохо:

`r3-a = kimi-k3`

Правильно:

`r3-a = strategic challenger / senior capability`.

Task/dispatch должен описывать:

- role;
- responsibility;
- capability floor;
- criticality;
- required reasoning;
- required context;
- required tools;
- modality if needed;
- budget;
- desired fallback count.

Перед запуском resolver динамически выбирает:

- primary;
- fallback-1;
- fallback-2.

Resolver учитывает:

- доступные подписки/routes;
- текущие лимиты;
- модельные возможности;
- quality class;
- context window;
- tools;
- health route;
- observed reliability;
- latency;
- price.

Фактическое resolution записывается в Evidence:

- selected primary;
- selected fallbacks;
- reason;
- rejected candidates/reason — минимум для значимых случаев.

### Важный инвариант

Protocol roles живут дольше конкретных моделей.

Появление новой модели не должно требовать переписывания workflow.

---

## B8 — ADD AND ACCEPT
### Execution Supervisor вместо простого scheduler

Оркестратор должен не только запускать шаги по расписанию, но и контролировать их жизненный цикл.

Минимальные обязанности supervisor:

1. dependency readiness;
2. launch;
3. process tracking;
4. heartbeat/progress tracking;
5. timeout/stall detection;
6. error classification;
7. resume/retry/fallback;
8. output artifact validation;
9. Evidence registration;
10. final state transition.

Минимальная state machine:

`PENDING`
→ `READY`
→ `RUNNING`
→ одно из:
- `DONE`;
- `RETRYABLE`;
- `REPAIRING`;
- `WAITING_DEPENDENCY`;
- `BLOCKED`;
- `FAILED`.

Для long-running autonomous chains supervisor обязан переживать:

- сеть;
- падение CLI;
- временную недоступность provider;
- rate limits;
- исчерпание отдельного маршрута;
- зависание;
- отсутствующий output;
- structural invalid output;
- recoverable session interruption.

Но supervisor не должен превращаться в тяжёлый workflow framework.

Принцип:

> smallest mechanism that removes human waiting and handles the failures actually observed.

---

## Общий принцип выбора моделей

Самые сильные модели резервировать прежде всего для точек, где высоки:

- неопределённость;
- стоимость ошибки;
- архитектурный blast radius;
- сложность синтеза;
- ответственность сертификации.

Большой механический объём работы сам по себе не является достаточным основанием для senior tier.

Пример правильного разделения:

`senior architect`
→ создаёт точную specification

`worker`
→ реализует

`middle reviewer`
→ проверяет/исправляет

`senior`
→ подключается снова только при unresolved issue, архитектурном конфликте либо критической certification.

---

## Общий принцип автономности

Цель всех B1–B8:

не максимальная сложность оркестратора, а максимальная полезная автономность.

Хороший результат означает, что цепочка из 10+ шагов может идти часами без человека и при этом:

- не висеть бессрочно;
- не расходовать деньги на заведомо бессмысленные retries;
- не терять частично выполненную работу;
- не использовать дорогую модель там, где достаточно worker;
- автоматически эскалировать задачу, когда worker/middle действительно не справились;
- сохранять полный Evidence о том, что произошло.

---

## Итог

Утвердить:

- B1 — с рубрикой `uncertainty + consequence`, без объёмного escalation;
- B2+B3 — с двумя timeout'ами и строгим completion contract;
- B4+B5 — с error taxonomy и pinning именно execution inputs;
- B6 — только после capability floor;
- B7 — dynamic model resolver;
- B8 — lightweight execution supervisor.

Не фиксировать названия текущих моделей как часть протокольной архитектуры.

# SYSTEM-LEVEL EXECUTION MODEL

Все последующие правила B1–B8 относятся не ко всей задаче целиком, а преимущественно к исполнению ОТДЕЛЬНОГО STAGE внутри более крупного workflow.

Протокол должен различать три уровня:

1. TASK / WORKFLOW level;
2. STAGE / ROLE level;
3. EXECUTION ATTEMPT level.

Они не должны смешиваться.

---

## LEVEL 1 — TASK / WORKFLOW

Полная задача может состоять из нескольких ролей, стадий и смысловых циклов.

Базовая модель:

TASK
  ↓
TASK CLASSIFICATION
  ↓
WORKFLOW / ASSURANCE POLICY
  ↓
ROLE GRAPH / STAGE GRAPH
  │
  ├─ implementer
  │      ↓
  ├─ reviewer
  │      ↓
  ├─ semantic repair? ───────────────┐
  │      ↓                           │
  ├─ reviewer again ─────────────────┘
  │      ↓
  ├─ certifier
  │      ↓
  └─ DONE

Конкретный workflow определяется:

- типом задачи;
- criticality;
- uncertainty;
- consequence of error;
- reversibility;
- assurance requirements;
- архитектурным blast radius;
- policy проекта.

Не каждая задача обязана иметь reviewer или certifier.

Примеры:

### Простая механическая задача

worker
→ validator
→ DONE

### Обычная code task

implementer
→ reviewer
→ ACCEPT?
    ├─ yes → DONE
    └─ no → semantic repair
            → reviewer again

### Существенное изменение

specification
→ implementation
→ review
→ semantic repair if required
→ certification

### Архитектурное изменение

architect
→ independent challenger
→ synthesis
→ implementation
→ architectural review
→ independent certification

### Работа повышенной ответственности

parallel research / analysis
→ synthesis
→ hostile review
→ correction
→ independent certification
→ owner gate if unresolved

---

## LEVEL 2 — STAGE / ROLE

Каждый узел ROLE GRAPH исполняется независимо через общий execution pipeline:

ROLE + CRITICALITY + CAPABILITY FLOOR
  ↓
DYNAMIC MODEL RESOLVER
  ↓
PRIMARY + FALLBACK 1 + FALLBACK 2
  ↓
EXECUTION SUPERVISOR
  ↓
error-aware resume / retry / execution-repair
  ↓
STAGE COMPLETION CONTRACT
  ↓
EVIDENCE

После успешного или неуспешного завершения stage управление возвращается в workflow:

STAGE RESULT
  ↓
WORKFLOW TRANSITION
  ├─ next role
  ├─ another review round
  ├─ semantic repair stage
  ├─ escalation
  ├─ certification
  ├─ owner gate
  ├─ blocked
  └─ final completion

---

## LEVEL 3 — EXECUTION ATTEMPT

Внутри одного stage могут происходить технические попытки исполнения:

primary attempt
→ resume
→ transient retry
→ fallback-1
→ fallback-2

Эти действия обслуживает EXECUTION SUPERVISOR.

Они НЕ должны автоматически создавать новый workflow round.

---

# CRITICAL DISTINCTION

Не смешивать:

## Execution retry

Причина:

- network failure;
- CLI crash;
- provider error;
- stall;
- transient timeout;
- temporary rate limit.

Пример:

reviewer stage
→ CLI crash
→ resume
→ reviewer stage continues

Это всё ещё ОДИН stage и ОДИН semantic pass.

---

## Execution repair

Результат формально не завершён:

- missing section;
- malformed JSON;
- empty output;
- required artifact absent.

Модель получает validator feedback и исправляет свой output.

Это также остаётся внутри текущего stage.

---

## Semantic repair

Stage успешно завершился, но независимый reviewer/certifier обнаружил содержательную проблему:

- неверное решение;
- нарушение архитектурного invariant;
- неподтверждённый вывод;
- существенный дефект implementation;
- неполная specification.

Это НЕ retry.

Workflow создаёт новый смысловой stage:

review
→ REJECT
→ semantic repair
→ review again

Такой цикл учитывается отдельно от execution retry budget.

---

# WORKFLOW LOOP LIMITS

Чтобы система не могла бесконечно циркулировать:

каждый workflow template должен задавать, где применимо:

- `max_review_rounds`;
- `max_semantic_repairs`;
- `max_escalations`;
- `max_certification_rounds`.

Пример:

review round 1
→ reject
→ semantic repair
→ review round 2
→ reject
→ senior escalation
→ unresolved
→ OWNER_GATE / BLOCKED

Не допускается бесконечное:

review → repair → review → repair → ...

---

# INDEPENDENCE POLICY

Для high-criticality stages workflow может требовать независимости.

Поддерживаемые constraints:

- different model;
- different model family;
- different provider;
- cannot certify own work;
- cannot be sole reviewer of own synthesis.

Пример:

architecture author
≠
architecture certifier

если assurance policy требует независимой сертификации.

Для дешёвых и низкорисковых задач такая независимость не обязательна.

---

# WORKFLOW VS MODEL

Workflow задаёт РОЛИ, а не имена моделей.

Неправильно:

r3-a = kimi-k3
review = mistral-medium

Правильно:

r3-a:
  role: strategic_challenger
  capability: senior

review:
  role: independent_verifier
  capability: middle_or_higher
  independence:
    different_model_family: true

Model Resolver выбирает фактическую модель только во время исполнения.

---

# FINAL COMPLETION

TASK считается завершённой не тогда, когда завершился последний процесс, а когда:

1. все обязательные stages workflow достигли допустимого terminal state;
2. все обязательные review/certification gates пройдены;
3. unresolved P0/P1 conditions отсутствуют либо явно переданы OWNER_GATE;
4. final artifacts существуют и валидны;
5. final Evidence собран;
6. workflow state зарегистрирован как DONE.

Таким образом:

PROCESS COMPLETION
≠
STAGE COMPLETION
≠
TASK COMPLETION.

Это три различных уровня протокола.
