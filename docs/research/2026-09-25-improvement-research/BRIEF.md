> Transcribed from chat by claude-eb97ac9d13050014, model: owner answers (RuslanFomenko) to two polls in the conversation, date: 2026-09-25

# Owner brief — improvement research (Google AX and beyond) and adaptive execution depth

- Status: owner input, verbatim. The directives that bind are recorded in PROTO-DEC-0066 and 0067; this file
  holds the owner's full wording, which the prompts cite by item id.
- How to read: take the index first. Open an item in full when your prompt names it. The index
  lines are the implementer's paraphrase; where they differ, the verbatim text below wins.
- Nothing inside a verbatim block was edited. Text outside the blocks is the implementer's.

## Index

| Id | Question the owner was asked | Owner's answer in one line (paraphrase) |
|---|---|---|
| O-01 | What does AX mean in this task? | Google AX integration: what it can give Colabs in speed, agent accuracy, context quality, convenience, architecture, security, scalability, fault tolerance and cost |
| O-02 | Who runs the prompt? | No fixed scheme: research an adaptive execution-depth policy — task type → functional class → base frequency F1–F5 → risk and other modifiers → execution pattern → roles → models through P-L2-002 |
| O-03 | Where do hypotheses come from? | A multi-source model: repository evidence, external sources, systematic derivation, measurements, failures, contrarian, cross-domain, combinatorial and negative hypotheses, with provenance, novelty and source diversity |
| O-04 | What is the output? | A funnel: maximum discovery → deduplication → fast screening → deep cards → backlog → rejected → synergies → priority set by a value formula |
| O-05 | How to lay out the two studies? | As is most convenient for models to read and to remember the answers; the owner's seed hypotheses, written as prompts, are in `OwnerIdeas/` |
| O-06 | How deep is this run, before a depth policy exists? | Three independent researchers plus a synthesis |
| O-07 | What may researchers do in this run? | Measurements now; prototypes and A/B tests later |
| O-08 | Where do results go, and when? | Now, inside the CORE-ARCH program |
| O-09 | (the owner's launch message) | Before launching through Kilo Code: the current per-procedure launch workflow first; if models are unavailable there, Kilo; no new candidates; check the syntax |
| O-10 | In which order to try Kilo routes? | The maker's official CLI, then Kilo; inside Kilo the cheapest suitable route; a stronger route when capabilities or effort fall short |
| O-11 | When to switch to Kilo? | Only on a hard failure before useful work; liveness instead of one timeout; soft 2-3 min inspect, hard 7-10 min probable hang; never after useful work; one Kilo attempt; never two executors |

## Context facts added by the implementer (not the owner's words)

- Google AX: official repository `https://github.com/google/ax` (Agent eXecutor, Apache-2.0, early
  stage with breaking changes expected). Secondary sources found on 2026-09-25 describe Task,
  Workspace, Gateway and Model primitives, sandboxed and resumable execution, event logging and a
  kubectl-like CLI over Kubernetes. These are leads, not facts: verify against the repository.
- Seeds: `OwnerIdeas/Google_AX.md` (2,085 lines), `OwnerIdeas/MCP_Server.md` (3,452 lines),
  `OwnerIdeas/Rust.md` (1,019 lines), untracked in the working tree, written by the owner on
  2026-09-25. Each is itself a research prompt with numbered hypothesis areas.

## O-01 — What does AX mean in this task?

Owner's answer, verbatim:

````text
интеграция Google AX может дать Colabs по скорости, точности работы агентов, качеству контекста, удобству, архитектуре, безопасности, масштабируемости, отказоустойчивости и стоимости.
````

## O-02 — Who runs the prompt? (becomes study B: adaptive execution depth)

Owner's answer, verbatim:

````text
Нужно скорректировать логику выбора исполнителей и глубины анализа в Colabs.

Сейчас постановка вопроса вида «кто прогоняет промпт?» слишком грубая, потому что я не хочу использовать одну фиксированную схему исполнения для всех типов задач.

Моя задумка другая:

Количество исполнителей, независимых прогонов, глубина критики, необходимость синтеза и полный цикл проверки должны зависеть от ТИПА ЗАДАЧИ.

Примеры типов задач:

- исполнение плана;
- внесение правок в код;
- построение дорожной карты;
- исследование;
- аудит проекта;
- синтез гипотез;
- проверка гипотез;
- составление плана;
- аудит плана;
- враждебная критика;
- code review;
- согласование плана;
- gap-анализ;
- SWOT-анализ;
- pre-mortem;
- анализ рисков;
- ретроспектива;
- chaos engineering;
- VRIO;
- PEST / PESTEL;
- статический анализ / SAST / линтеры;
- debugging;
- bug fixing;
- рефакторинг;
- архитектурный аудит;
- ATAM;
- threat modeling;
- анализ архитектурных рисков;
- vulnerability management;
- DAST / IAST;
- penetration testing;
- profiling;
- load testing;
- stress testing;
- bottleneck analysis;
- post-mortem;
- root cause analysis;
- technical debt management;
- QA;
- engineering / technical audit;
- и другие содержательно отличающиеся процедуры, которые обнаружатся при анализе.

Не воспринимай этот список как готовую таксономию.

## Задача

Сначала рационально сгруппируй все эти процедуры в небольшое количество функциональных классов.

Нужно:

1. убрать дубли;
2. объединить близкие по назначению процедуры;
3. сохранить действительно разные методы отдельно;
4. найти отсутствующие, но полезные типы задач;
5. не создавать лишние категории ради количества.

Например, предварительно могут существовать классы:

- исполнение и изменение;
- планирование;
- исследование и генерация;
- проверка и критика;
- архитектура;
- безопасность;
- производительность;
- стратегический анализ;
- надежность;
- качество;
- улучшение процесса.

Но эту группировку необходимо проверить и улучшить, а не принять автоматически.

---

# Ввести шкалу базовой частоты F1–F5

Каждому функциональному классу и, если необходимо, отдельной процедуре назначить:

`Default Invocation Frequency = F1–F5`

Это НЕ:

- важность;
- приоритет;
- severity;
- качество метода.

Это именно:

> насколько часто данный метод должен автоматически рассматриваться или запускаться в обычном жизненном цикле разработки.

Использовать следующую семантику:

### F5 — практически постоянно / default

Метод применяется почти при каждой релевантной задаче.

Примеры могут включать дешевые проверки, базовый review, validation и т.п.

### F4 — часто

Применяется в большинстве задач соответствующего класса, но не обязательно всегда.

### F3 — периодически

Запускается при наличии определенных признаков сложности, масштаба или риска.

### F2 — редко

Используется для крупных, нестандартных, рискованных или архитектурно значимых изменений.

### F1 — исключительный режим

Используется для особо критичных случаев, специальных аудитов, security-sensitive работ или по прямому запросу.

Ключевой принцип:

> высокая важность не означает высокую частотность.

Например, penetration testing может быть чрезвычайно важен, но иметь F1/F2, потому что его не нужно запускать после каждой небольшой правки.

---

# Частотность должна влиять на глубину исполнения

Исследуй связь:

`Task Type → Base Frequency → Execution Depth`

Но НЕ делай жесткую привязку без анализа.

В качестве стартовой гипотезы можно проверить такую модель:

F5:
- один быстрый основной исполнитель;
- минимальная дополнительная проверка;
- низкий overhead.

F4:
- одна сильная модель;
- selective verification или короткий reviewer pass.

F3:
- два независимых анализа либо исполнитель + независимый reviewer.

F2:
- несколько независимых исполнителей;
- отдельная критика;
- синтез;
- проверка итогового результата.

F1:
- полный adversarial / council workflow;
- независимые позиции;
- взаимная критика;
- синтез;
- verification;
- certification;
- при необходимости human approval.

Это только гипотеза.

Нужно определить оптимальный execution pattern для каждого уровня.

---

# Ввести динамическую эскалацию

Base Frequency не должна быть окончательным решением.

Используй дополнительные факторы:

- Risk;
- Complexity;
- Scope;
- Reversibility;
- Security sensitivity;
- Architectural impact;
- Blast radius;
- Uncertainty;
- Novelty;
- Cost of error;
- Confidence;
- наличие конфликтующих результатов;
- размер diff;
- количество затрагиваемых подсистем.

Итоговая логика должна выглядеть приблизительно так:

Task Type
    ↓
Functional Class
    ↓
Base Frequency F1–F5
    ↓
Risk Modifier
    ↓
Complexity Modifier
    ↓
Impact / Security / Uncertainty modifiers
    ↓
Required Independence
    ↓
Execution Pattern
    ↓
Model selection

Важно:

базовая частота может быть повышена динамически.

Например:

обычный Code Review
→ F5

но:

Code Review изменения authentication / authorization / cryptography
→ автоматически эскалируется до F2 или F1.

Или:

обычный bug fix
→ простой исполнитель + review

но:

bug fix в critical shared state / locking / data integrity
→ несколько независимых анализов + adversarial review.

---

# Отделить два разных решения

Очень важно не смешивать:

## 1. Сколько и как исполнять?

Это решает новая policy:

- число независимых прогонов;
- parallel / sequential;
- reviewer;
- critic;
- synthesizer;
- certifier;
- глубина цикла.

## 2. Какими моделями исполнять?

Это уже отдельный механизм.

Конкретные модели должны выбираться по существующей таблице рангов `P-L2-002`, а не по бренду.

То есть сначала определяется:

`Execution Pattern`

а потом:

`Model Selection via P-L2-002`

Например:

Task:
Architecture audit

Policy:
F2
→ 3 independent analyses
→ 1 adversarial critic
→ 1 synthesis

После этого P-L2-002 выбирает подходящие модели для каждой роли.

---

# Не привязывать F1–F5 напрямую к числу моделей

Избегай слишком простой схемы:

F1 = 5 моделей
F2 = 4 модели
...

Это неправильная абстракция.

Для разных типов задач одинаковая частотность может требовать разного workflow.

Например:

F2 security audit
может требовать:
- threat model;
- SAST;
- независимого security reviewer.

А F2 roadmap analysis:
- двух независимых стратегических анализов;
- risk critic;
- synthesis.

Поэтому должен существовать mapping:

`Task Class × Frequency × Risk → Execution Pattern`

а не только:

`Frequency → Number of Models`.

---

# Исследовать паттерны исполнения

Рассмотри минимум:

### Single
Один исполнитель.

### Single + Verify
Исполнитель + быстрая независимая проверка.

### Author + Reviewer
Основной исполнитель + независимый reviewer.

### Independent N
Несколько моделей независимо решают задачу.

### Independent N + Synthesis
Несколько независимых результатов → synthesizer.

### Adversarial
Author → critic → revision.

### Multi-critic
Author → несколько специализированных критиков.

### Council
Несколько независимых участников → обсуждение → synthesis.

### Full certification cycle
Analysis
→ execution
→ review
→ adversarial critique
→ tests
→ certification.

Определи, каким типам задач и уровням F1–F5 соответствует каждый pattern.

---

# Учесть стоимость

Цель — не максимальная глубина всегда.

Нужно оптимизировать:

`Quality / Cost / Latency`

Нежелательно:

использовать три сильнейшие модели для простой правки одной строки.

И наоборот, нельзя экономить на задаче с большим blast radius.

Нужна adaptive execution policy.

---

# Итоговая модель

Стремись прийти к системе примерно такого вида:

Task
↓
Task classifier
↓
Functional class
↓
Base frequency F1–F5
↓
Risk / complexity / impact assessment
↓
Escalation policy
↓
Execution pattern
↓
Required roles
↓
Model selection via P-L2-002
↓
Execution
↓
Validation
↓
Optional escalation if disagreement/failure

---

# Дополнительно исследуй автоматическую эскалацию после исполнения

Например:

F5 task
↓
одна модель
↓
low confidence / test failed / reviewer disagreement
↓
F3
↓
две независимые проверки
↓
снова конфликт
↓
F1 full council

То есть система должна уметь увеличивать глубину только тогда, когда это действительно необходимо.

Это потенциально позволит одновременно:

- уменьшить стоимость;
- уменьшить latency;
- повысить надежность;
- не тратить сильные модели на простые задачи;
- автоматически усиливать контроль сложных задач.

---

# Требуемый результат

Сформируй:

1. Нормализованную таксономию типов задач.
2. Functional classes.
3. Таблицу всех типов задач.
4. Для каждого:
   - Base Frequency F1–F5;
   - justification;
   - default execution pattern;
   - escalation triggers;
   - required roles;
   - допустимый параллелизм;
   - необходимость независимого review;
   - необходимость synthesis;
   - необходимость certification.
5. Матрицу:

`Task Type × F-level × Risk → Execution Pattern`

6. Правила динамической эскалации.
7. Правила деэскалации, если они оправданы.
8. Связь с P-L2-002.
9. Оценку влияния новой системы на:
   - latency;
   - стоимость;
   - token consumption;
   - качество;
   - correctness;
   - количество ошибок;
   - количество ненужных agent calls.
10. Предложение, как это встроить в архитектуру Colabs.

---

# Критические ограничения

Не делай F1–F5 рейтингом важности.

Не назначай количество моделей только на основании F-level.

Не выбирай модели по бренду.

Не превращай каждую задачу в council.

Не объединяй содержательно разные методы только ради уменьшения количества категорий.

Не сохраняй дубли вроде повторяющегося Code Review.

Не смешивай:
- task classification;
- frequency;
- risk;
- execution depth;
- model ranking.

Это пять разных сущностей.

---

# Главный вопрос

Нужно получить ответ на вопрос:

> Как построить в Colabs адаптивную policy выбора глубины агентного исполнения, в которой тип задачи задаёт базовую частоту F1–F5, риск и сложность динамически эскалируют глубину, execution pattern определяет необходимое число и роли независимых агентов, а конкретные модели выбираются отдельно через P-L2-002?

Главная цель:

> Использовать минимально достаточную вычислительную и агентную глубину для каждой задачи, автоматически усиливая процесс только там, где дополнительная независимость, критика или проверка действительно повышают вероятность корректного результата.
````

## O-03 — Where do hypotheses come from?

Owner's answer, verbatim:

````text
По источникам гипотез я не хочу ограничиваться бинарным выбором
«репозиторий или интернет».

Нужна многоисточниковая модель генерации гипотез, в которой разные
источники выполняют разные функции.

Главный принцип:

Repository evidence
        +
External evidence
        +
Systematic derivation
        +
Cross-source synthesis
        ↓
Hypothesis pool

Цель — одновременно:

1. не потерять связь с реальными проблемами Colabs;
2. найти решения, которых в проекте ещё никогда не пробовали;
3. не зависеть только от уже известных внешних практик;
4. вывести новые гипотезы из самой архитектуры, измерений и комбинаций
   технологий.

────────────────────────────────────
1. REPOSITORY / INTERNAL EVIDENCE
────────────────────────────────────

Это основной источник гипотез, связанных с реальными проблемами Colabs.

Исследуй:

- исходный код;
- Git history;
- commits;
- issues, если имеются;
- worklogs;
- ARCHIVE;
- DECISIONS;
- TASK / PLAN;
- review findings;
- failed experiments;
- rejected approaches;
- test failures;
- flaky tests;
- profiling;
- benchmarks;
- telemetry;
- logs;
- repeated warnings;
- TODO/FIXME;
- bottlenecks;
- duplicated work;
- repeated Git operations;
- process spawning;
- cache misses;
- agent mistakes;
- handoff failures;
- retries;
- protocol violations;
- human corrections;
- места высокой сложности;
- исторические regressions.

Особенно искать закономерности:

problem repeats
→ possible systemic cause
→ hypothesis.

Например:

30 похожих медленных операций
не должны породить 30 одинаковых гипотез.

Нужно попытаться найти общий механизм проблемы.

────────────────────────────────────
2. EXTERNAL SOURCES
────────────────────────────────────

Используй внешний поиск для обнаружения решений и механизмов,
которых в Colabs пока нет.

Исследуй:

- официальную документацию;
- papers;
- engineering blogs;
- mature open-source projects;
- GitHub repositories;
- issue discussions;
- benchmarks;
- conference talks;
- architecture reports;
- production post-mortems;
- новые библиотеки и frameworks;
- agent orchestration systems;
- distributed systems;
- compilers;
- build systems;
- databases;
- CI/CD;
- Kubernetes;
- MCP;
- Google AX;
- caching systems;
- Git internals;
- language servers;
- IDE infrastructure;
- workflow engines;
- observability systems.

Не искать только:

«как ускорить AI agents».

Ищи решения в соседних дисциплинах.

Например:

build systems
→ incremental computation

databases
→ MVCC / indexes / materialized views

Kubernetes
→ declarative reconciliation

compilers
→ dependency graphs / incremental compilation

distributed systems
→ event sourcing / leases / idempotency

language servers
→ persistent indexed project state

Эти механизмы могут породить сильные гипотезы для Colabs.

Каждая внешняя гипотеза должна иметь источник/URL.

Внешняя практика — это источник идеи, а НЕ доказательство того,
что она улучшит Colabs.

Она должна пройти собственный benchmark / A/B test.

────────────────────────────────────
3. SYSTEMATICALLY DERIVED HYPOTHESES
────────────────────────────────────

Это отдельный и очень важный источник.

После изучения Colabs самостоятельно выводи гипотезы из архитектуры,
даже если аналогичная идея:

- ещё не обсуждалась в repository;
- не найдена во внешних источниках.

Используй вопросы:

Что можно вообще НЕ делать?

Что можно делать реже?

Что можно вычислить один раз?

Что можно cache?

Что можно сделать incremental?

Что можно parallelize?

Что можно batch?

Что можно precompute?

Что можно сделать event-driven вместо polling?

Что можно превратить из O(N) в O(changed)?

Что можно вынести из reasoning модели в deterministic code?

Что можно убрать из prompt и превратить в typed API?

Что можно сделать persistent?

Что можно заменить индексом?

Что можно заменить DAG?

Что можно выполнять speculative?

Что можно сделать lazy?

Что можно выполнять только при escalation?

Что сейчас проверяется несколько раз?

Какие слои дублируют друг друга?

Какие invariants можно гарантировать архитектурно вместо повторной
проверки?

Где существуют accidental O(N²), repeated parsing, repeated hashing,
repeated Git operations или unnecessary process startup?

────────────────────────────────────
4. MEASUREMENT-DERIVED HYPOTHESES
────────────────────────────────────

Не ограничиваться чтением кода.

Измерения сами должны генерировать новые гипотезы.

Использовать:

profiling
tracing
CPU
RAM
I/O
process startup
Git latency
MCP latency
model latency
cache hit/miss
token consumption
context size
tool calls
retries
agent idle time
critical path.

Например:

TOTAL = 40 s

Git             16 s
PowerShell       8 s
Node             2 s
filesystem       9 s
other            5 s

→ гипотезы должны концентрироваться прежде всего на Git/filesystem,
а не автоматически на переписывании Node в Rust.

После каждой серии benchmark:

measurement
↓
new anomaly
↓
new hypothesis

То есть генерация гипотез должна быть итеративной.

────────────────────────────────────
5. FAILURE-DERIVED HYPOTHESES
────────────────────────────────────

Отдельный источник — ошибки и неудачные решения.

Исследуй:

- regressions;
- rejected hypotheses;
- failed prototypes;
- race conditions;
- model mistakes;
- incorrect handoffs;
- stale context;
- security incidents;
- test failures;
- performance regressions.

Задавай вопрос:

Почему это произошло?

И:

Как изменить систему так, чтобы этот класс ошибки стал невозможен,
а не просто исправить конкретный случай?

────────────────────────────────────
6. CONTRARIAN HYPOTHESES
────────────────────────────────────

Для крупных архитектурных предположений генерируй противоположные
гипотезы.

Например:

H1:
Persistent MCP Server ускорит Colabs.

H2:
Persistent MCP Server добавит больше complexity/IPC overhead,
чем пользы.

H3:
MCP полезен только как внешний adapter, но вреден внутри Core.

Все три должны иметь возможность пройти эксперимент.

То же самое для:

Rust
AX
daemon
database
cache
MCP
parallel agents
multi-model council
filesystem watcher.

Не превращай выбранное направление в догму.

────────────────────────────────────
7. CROSS-DOMAIN ANALOGIES
────────────────────────────────────

Отдельно проведи поиск механизмов из других областей,
которые можно перенести в Colabs.

Например:

Compiler architecture
Build systems
Databases
Operating systems
Distributed systems
Game engines
Search engines
Version control
CI/CD
Kubernetes
Browser engines
Language servers
Event-driven systems.

Не копировать решения механически.

Формат:

Mechanism in domain A
↓
Underlying principle
↓
Possible Colabs analogue
↓
Hypothesis
↓
Experiment

────────────────────────────────────
8. COMBINATORIAL / SYNERGY HYPOTHESES
────────────────────────────────────

После получения отдельных идей искать новые гипотезы,
возникающие из их комбинации.

Например:

Rust
+
persistent MCP
+
filesystem watcher
+
incremental cache

может дать эффект, которого ни одна технология отдельно не даёт.

Проверять:

A
B
C
A+B
A+C
B+C
A+B+C

там, где это экономически оправдано.

────────────────────────────────────
9. NEGATIVE HYPOTHESES
────────────────────────────────────

Гипотеза может состоять и в удалении существующего механизма.

Например:

- удалить дополнительный validation;
- отказаться от повторного snapshot;
- убрать PowerShell layer;
- убрать persistent daemon, если AX уже решает задачу;
- отказаться от database;
- сократить число моделей;
- убрать лишний MCP server.

Всегда задавай:

«Что произойдёт, если этот компонент вообще удалить?»

────────────────────────────────────
10. PROVENANCE
────────────────────────────────────

Каждая гипотеза должна иметь provenance.

Используй примерно такую классификацию:

A — INTERNAL EMPIRICAL
Подтверждается measurements/logs/failures самого Colabs.

B — INTERNAL STRUCTURAL
Выведена из анализа текущего кода/архитектуры.

C — EXTERNAL
Пришла из внешней практики/исследования.
Обязательно URL.
Пока считается непроверенной применительно к Colabs.

D — DERIVED
Логически выведена из архитектуры/first principles.

E — CROSS-DOMAIN
Перенесена из другой инженерной области.

F — SYNTHETIC
Возникла из комбинации нескольких других гипотез.

Одна гипотеза может иметь несколько источников:

A + C
B + D
A + C + F

Это повышает confidence, но не заменяет эксперимент.

────────────────────────────────────
11. НЕ ПУТАТЬ SOURCE И CONFIDENCE
────────────────────────────────────

Источник гипотезы не определяет автоматически её качество.

Например:

External paper ≠ доказательство пользы для Colabs.

Repository observation ≠ правильно найденная root cause.

LLM-derived hypothesis ≠ слабая гипотеза.

Каждая значимая идея должна пройти:

hypothesis
↓
mechanism
↓
expected measurable effect
↓
prototype
↓
benchmark / A/B
↓
confirmed / rejected

────────────────────────────────────
12. SOURCE DIVERSITY
────────────────────────────────────

Не позволять одному источнику доминировать.

После первого широкого прохода показать распределение:

Internal empirical     N
Internal structural    N
External               N
Derived                N
Cross-domain           N
Synthetic              N

Если почти все гипотезы относятся к одному классу,
провести дополнительный targeted search по недопредставленным классам.

────────────────────────────────────
13. NOVELTY CHECK
────────────────────────────────────

Для каждой сильной гипотезы определить:

KNOWN IN COLABS
уже пробовали;

KNOWN EXTERNALLY
новая для Colabs, известная практика;

NOVEL COMBINATION
известные элементы, новая комбинация;

NOVEL DERIVATION
идея, которую не удалось найти ни в history, ни во внешних источниках.

Последние две категории особенно не отбрасывать автоматически.

────────────────────────────────────
14. ГЛАВНЫЙ ПРИОРИТЕТ

Repository должен определять:

«где у нас реальные проблемы».

External research должен помогать:

«какие решения человечество уже знает».

Systematic derivation должен отвечать:

«какие решения следуют из структуры именно нашей системы».

Measurements должны отвечать:

«что действительно имеет значение».

Experiments должны отвечать:

«что реально работает».

Итоговый pipeline:

Repository evidence
        ┐
External research
        ├─→ broad hypothesis generation
Architecture analysis
        │
Measurements
        │
Cross-domain search
        ┘
              ↓
        deduplication
              ↓
        provenance tagging
              ↓
       mechanism analysis
              ↓
          screening
              ↓
      prototype / benchmark
              ↓
   CONFIRMED / REJECTED
              ↓
       synergy search
              ↓
       next iteration

────────────────────────────────────
15. КРИТИЧЕСКОЕ ОГРАНИЧЕНИЕ

Не хочу получить исследование, которое просто пересказывает:

- проблемы repository;
или
- лучшие практики из интернета.

Мне нужен механизм обнаружения новых решений.

Поэтому значительная часть работы должна быть посвящена
самостоятельному выводу новых гипотез после понимания:

- архитектуры Colabs;
- bottlenecks;
- исторических ошибок;
- измерений;
- возможностей Rust;
- MCP;
- AX;
- Git;
- agent architecture;
- текущих и потенциальных execution patterns.

────────────────────────────────────
ФИНАЛЬНЫЙ РЕЗУЛЬТАТ

Для каждой гипотезы указывать:

ID
Название
Источник / provenance
Конкретное наблюдение, породившее гипотезу
Механизм
Ожидаемый эффект
Метрика
Ссылки, если источник внешний
Связанные гипотезы
Novelty class
Confidence
Способ проверки
Результат проверки

Главный принцип:

Не «репозиторий ИЛИ внешние источники»,

а:

REAL PROBLEMS
×
EXTERNAL KNOWLEDGE
×
FIRST-PRINCIPLES REASONING
×
MEASUREMENT
×
CROSS-DOMAIN TRANSFER
×
EXPERIMENTATION.

Цель — максимизировать вероятность обнаружить сильную гипотезу,
а не максимизировать количество ссылок или количество идей.
````

## O-04 — What is the output?

Owner's answer, verbatim:

````text
По формату результата я хочу совместить максимальную ширину поиска гипотез с глубиной проработки действительно полезных идей.

Не выбирай между «максимумом гипотез» и «подробными карточками» как между взаимоисключающими форматами. Используй многоступенчатый funnel.

Предпочтительная схема:

1. ШИРОКИЙ ПРОХОД — максимальный охват
   - Сгенерировать максимально широкий набор содержательно разных гипотез.
   - Ориентир: не менее 100 гипотез, если предметная область реально позволяет.
   - Не создавать искусственные варианты ради количества.
   - На этом этапе каждая гипотеза должна быть короткой: название + 1–3 предложения о механизме ожидаемого улучшения.
   - Обязательно охватить все заданные направления и самостоятельно найденные направления.
   - Искать не только локальные оптимизации, но и архитектурные, процессные, алгоритмические и emergent-возможности.

2. НОРМАЛИЗАЦИЯ
   - Удалить фактические дубли.
   - Объединить гипотезы, различающиеся только формулировкой.
   - Не объединять идеи, если у них разные механизмы эффекта.
   - Сгруппировать оставшиеся гипотезы по классам.
   - Явно показать, сколько исходных гипотез осталось после дедупликации.

3. ПРЕДВАРИТЕЛЬНЫЙ ОТСЕВ
   Для каждой гипотезы быстро оценить:
   - потенциальный эффект;
   - частоту возникновения эффекта;
   - применимость к Colabs;
   - стоимость реализации;
   - технический риск;
   - риск нарушения protocol guarantees;
   - проверяемость;
   - вероятность того, что эффект вообще существует.

   На этом этапе не делать вывод только по субъективному score: где возможно, использовать исходный код, profiling, benchmark или эксперимент.

4. ГЛУБОКИЙ ПРОХОД
   Для наиболее перспективных гипотез сформировать полноценные карточки.

   Ориентир — 20–30 лучших гипотез, но НЕ устанавливай жёсткий лимит:
   - если сильных гипотез 12 — подробно разобрать 12;
   - если их 40 — не отбрасывать последние 10 только из-за искусственного ограничения.

   Карточка должна содержать:

   HYPOTHESIS ID
   Название
   Категория
   Текущий механизм
   Предлагаемое изменение
   Механизм ожидаемого прироста
   Что именно должно улучшиться
   Затрагиваемые компоненты
   Метрика проверки
   Baseline
   Expected effect
   Стоимость реализации
   Риск
   Побочные эффекты
   Зависимости
   План прототипа
   План A/B-теста или benchmark
   Результат проверки
   Статус:
   CONFIRMED / PARTIALLY CONFIRMED / REJECTED / UNKNOWN

5. ОТДЕЛЬНО СОХРАНИТЬ ХОРОШИЕ ГИПОТЕЗЫ, НЕ ПОПАВШИЕ В ГЛУБОКИЙ ПРОХОД
   Они не должны исчезать.

   Для них создать компактный backlog:
   - ID;
   - название;
   - механизм;
   - причина, почему сейчас не вошла в приоритетную группу.

6. REJECTED HYPOTHESES
   Не удалять проверенные, но не подтвердившиеся идеи.

   Отдельно показать:
   - что проверялось;
   - почему идея выглядела перспективной;
   - что показал эксперимент;
   - почему она отклонена.

7. СИНЕРГИИ
   После индивидуальной оценки гипотез обязательно проверить комбинации.

   Например:
   A + B
   A + C
   B + C
   A + B + C

   Некоторые улучшения по отдельности могут давать небольшой эффект, но вместе менять архитектуру принципиально.

8. ФИНАЛЬНЫЙ PRIORITY SET
   Выделить гипотезы, которые стоит реализовывать первыми.

   Приоритет должен учитывать не только максимальный локальный speedup, а:

   Value =
   (performance gain
   + accuracy gain
   + reliability gain
   + UX gain
   + architecture gain)
   × frequency
   × confidence
   /
   (implementation cost
   + complexity
   + risk)

   Если существуют реальные измерения — они имеют приоритет над субъективными оценками.

Главный принцип:

Не хочу получить только 20–30 красиво расписанных очевидных идей — это слишком сильно сужает пространство поиска.

Но и список из 100–200 односложных идей без проверки мне тоже недостаточен.

Мне нужен funnel:

MAXIMUM DISCOVERY
        ↓
DEDUPLICATION / CLUSTERING
        ↓
FAST SCREENING
        ↓
DEEP ANALYSIS
        ↓
PROTOTYPES / BENCHMARKS
        ↓
CONFIRMED IMPROVEMENTS
        ↓
SYNERGY ANALYSIS
        ↓
IMPLEMENTATION PRIORITY

То есть правильный формат — «ширина сначала, глубина затем».

Количество гипотез не должно быть самоцелью. Главная цель — минимизировать вероятность пропустить сильную нестандартную идею, а затем направить основную вычислительную глубину на те варианты, которые действительно могут дать значимый измеримый эффект.
````

## O-05 — How to lay out the two studies?

Owner's answer, verbatim:

````text
Оформь как удобнее всего нейросетям для чтения и памяти о ответах. для меня это не важно исходные базовые гипотезы в виде промтов лежат в папке D:\Colabs\OwnerIdeas
````

The implementer's layout is in `README.md` of this folder.

## O-06 — How deep is this run, before a depth policy exists?

Owner's choice: «3 независимых + синтез (Recommended)». The option as offered:

````text
Временный паттерн «Independent N + Synthesis», по вашей же стартовой гипотезе для исследования уровня F2: три модели разных производителей на каждое исследование, синтезатор — не из исследователей. Последствия: максимум непохожих гипотез — цель вашей воронки; цена — шесть прогонов плюс два синтеза.
````

## O-07 — What may researchers do in this run?

Owner's choice: «Замеры сейчас, тесты потом (Recommended)». The option as offered:

````text
В прогоне — только чтение и замеры без правок (время валидатора, git, запусков, размеры пакетов). Прототипы и A/B — отдельными задачами по P-L0-007 в одноразовом клоне, после того как вы утвердите приоритеты. Последствия: репозиторий и ядро в безопасности, статусы CONFIRMED/REJECTED появятся только во второй волне.
````

## O-08 — Where do results go, and when?

Owner's choice: «Сейчас, в CORE-ARCH (Recommended)». The option as offered:

````text
Запуск параллельно с ревью этапа 2: исследование не подпадает под лимит двух потоков (PROTO-DEC-0048 п.7) и ядро не трогает. Гипотезы входят в программу как кандидаты классов C/D. Часть этапа 3 про триаж и эскалацию ждёт синтеза политики, остальное идёт дальше. Последствия: этап 3 сразу проектируется под адаптивную глубину, ваше внимание делится на два фронта.
````

## O-09 — The launch rule (owner's message before launching through Kilo Code)

Owner's words, verbatim (the pasted `kilo --help`, model list and effort notes are not repeated
here; the facts taken from them are recorded in `docs/core-arch/stage-4/kilo-routes.json`):

````text
Я хочу запустить промт в расширении Kilo Kode но предже чем я это сделаю, мне нужно доработать таблицу моделей агентов и усилий и добавить одно правило.
Сначала приоритет запуска у текущего воркфлоу уже опиманого в процедуре инструкциями.
А если по этим путям модели не доступны, используются лимиты kilo.

Сейчас мы не рассатриваем новых кандидатов для таблицы. Только прописываем дополнения в виде новых маршрутов при недоступности нашего основного маршрута.

После этого сразу напиши промт на запуск исследования через расширение kilo kode.

Внимание!!! Перепроверь синтаксис, чтобы CLI не получили поломанный промт!
````

## O-10 — Route order inside Kilo

Question asked: in which order to try a model's Kilo routes when the primary route is unavailable.
Owner's answer, verbatim:

````text
1. Официальный CLI производителя — основной маршрут
   ↓ недоступен
2. Kilo — резервный маршрутизатор
   ↓
3. Внутри Kilo: самый дешёвый подходящий маршрут
   ↓ если не хватает capabilities / reasoning effort
4. Более сильный маршрут
````

## O-11 — When to switch to Kilo (failover policy)

Owner's answer, verbatim:

````text
Нужно реализовать адаптивный failover с официального CLI на Kilo.

Не использовать фиксированное правило «10 минут тишины = сбой», потому что это может прервать нормальное длительное reasoning или выполнение команды.

Политика:

1. Kilo — только резервный маршрут. Основной путь всегда официальный авторизованный CLI.

2. Немедленно переключаться на Kilo только при hard failure ДО начала полезной работы:
   - non-zero exit / crash;
   - ошибка авторизации;
   - исчерпан лимит;
   - модель/провайдер недоступны;
   - явная network/provider error.

3. Для зависания использовать не один timeout, а liveness/progress detection:
   - процесс жив;
   - появляется stdout/stderr;
   - меняются файлы;
   - обновляется журнал/state;
   - выполняются дочерние команды;
   - есть иные наблюдаемые признаки работы.

   Пока есть прогресс — timeout продлевается автоматически.

4. Ввести два таймера:
   - soft timeout: примерно 2–3 минуты без любых признаков прогресса → проверить состояние процесса, но НЕ переключаться;
   - hard idle timeout: примерно 7–10 минут абсолютной тишины при живом процессе → считать вероятным зависанием и разрешить fallback.

   Значения должны быть конфигурируемыми и в дальнейшем адаптироваться по типу задачи и историческим метрикам.

5. Критическое правило:
   если агент уже начал полезную работу — изменил файлы, записал state/journal, создал артефакты или выдал содержательный промежуточный результат — автоматический запуск другого исполнителя запрещён.

   В этом случае:
   сохранить состояние → explicit handoff / recovery → при необходимости запросить владельца.

6. Если fallback допустим:
   официальный CLI
   → один автоматический запуск через Kilo
   → если Kilo тоже не запускается, STOP и запрос решения.

7. Не допускать параллельного исполнения основной и резервной модели над одной задачей без явного решения orchestration layer.

Итоговый принцип:

hard failure → immediate fallback;
тишина без progress → adaptive timeout;
есть progress → ждать;
уже есть полезные изменения → никакого автоматического failover.

Предложи конкретный алгоритм state machine и набор сигналов liveness, чтобы минимизировать одновременно:
- ложное убийство долгого reasoning;
- потерю времени на реально зависший процесс;
- риск двойного исполнения одной задачи.
````

The implementer's answer to the last request is `docs/core-arch/stage-4/P-L3-004-route-failover.md`
(state table, signals L1-L7, timers), implemented in `prompts/launch.cjs`.
