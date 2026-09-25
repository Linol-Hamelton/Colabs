


Да. Это лучше оформлять именно как **исследовательскую программу по проектированию benchmark-driven model resolver**, а не как аудит текущего механизма.

Если говорить именно про текущий слой **`AVAILABLE MODELS / MODEL-MATRIX + MODEL-ECONOMICS`**, то по модели у нас уже есть довольно много данных. Но важно отделить **реально собранные поля** от тех, которые resolver уже должен учитывать по `PROTO-DEC-0075`, но которые пока заполняются неполно.

| Группа                                                 | Какая информация есть о модели                                                                                                     | Состояние сейчас                                                                                            |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------- |
| **Идентичность**                           | Название модели                                                                                                                                | есть                                                                                                                   |
|                                                              | Канонический model ID / API ID                                                                                                                   | есть                                                                                                                   |
|                                                              | Производитель модели: OpenAI, Anthropic, Google, DeepSeek и т. д.                                                                      | есть                                                                                                                   |
|                                                              | Алиасы модели в разных клиентах                                                                                                   | частично есть                                                                                                  |
| **Маршруты доступа**                    | Через какой клиент модель доступна: Claude CLI, Codex, Copilot, Antigravity, Vibe, Kilo и т. д.                             | есть                                                                                                                   |
|                                                              | Через какие альтернативные клиенты можно получить ту же модель                                         | есть                                                                                                                   |
|                                                              | Provider/route                                                                                                                                               | есть                                                                                                                   |
|                                                              | Доступна ли модель фактически в текущей среде                                                                         | есть как discovery snapshot                                                                                         |
|                                                              | Активен ли route                                                                                                                                    | частично есть                                                                                                  |
|                                                              | Может ли route работать с tools/tool calls                                                                                                   | частично есть                                                                                                  |
| **Версии среды**                            | Версия клиента, через который модель вызывается                                                                     | есть                                                                                                                   |
|                                                              | Дата, когда доступность/характеристики были проверены                                                         | есть                                                                                                                   |
|                                                              | Источник данных: CLI-команда, официальный сайт, ответ владельца                                            | есть                                                                                                                   |
| **Позиционирование**                   | Как сам provider позиционирует модель: flagship, balanced, fast/cheap, coding и т. п.                                            | есть                                                                                                                   |
|                                                              | Относительный rank внутри одного производителя                                                                         | есть                                                                                                                   |
|                                                              | `flagship / second / workhorse`                                                                                                                            | есть                                                                                                                   |
| **Reasoning / effort**                                 | Какие reasoning effort поддерживает клиент/модель                                                                               | есть или`unknown`                                                                                                 |
|                                                              | Полный ordered list effort levels                                                                                                                      | частично есть                                                                                                  |
|                                                              | Выбранные`minimum / middle / maximum`                                                                                                             | есть                                                                                                                   |
|                                                              | Какой effort был запрошен при конкретном запуске                                                                         | уже фиксируется                                                                                              |
|                                                              | Какой effort действительно применился                                                                                            | не всегда наблюдаемо                                                                                     |
| **Tier**                                               | Производный уровень T1–T9                                                                                                                 | есть                                                                                                                   |
|                                                              | Связка`model rank × effort`                                                                                                                         | есть                                                                                                                   |
|                                                              | Источник/причина назначения tier                                                                                                    | есть                                                                                                                   |
| **Стоимость**                                 | Цена input за 1M токенов                                                                                                                        | есть там, где удалось получить                                                                    |
|                                                              | Цена output за 1M токенов                                                                                                                       | есть там, где удалось получить                                                                    |
|                                                              | Стоимость конкретного route, если отличается                                                                               | частично                                                                                                           |
|                                                              | Фактическая стоимость выполненных запусков                                                                            | уже собирается                                                                                                |
|                                                              | Фактические Copilot credits / Kilo dollars / Codex tokens и т. п.                                                                              | частично собирается                                                                                      |
| **Подписка / ресурс**                    | Через какую подписку/API оплачивается модель                                                                             | есть                                                                                                                   |
|                                                              | Остаток денег/кредитов/лимита                                                                                                      | есть snapshot                                                                                                          |
|                                                              | Сколько лимита уже использовано                                                                                                  | есть snapshot                                                                                                          |
|                                                              | Когда лимит сбрасывается                                                                                                               | есть                                                                                                                   |
|                                                              | Является ли ресурс дефицитным прямо сейчас                                                                              | выводится из snapshot                                                                                           |
| **Практическое назначение**      | Текущая рекомендация владельца: workhorse, expert, fallback и т. п.                                                           | есть в dynamic economics                                                                                              |
|                                                              | Для каких типов работы модель сейчас считается рациональной                                              | есть как routing preference                                                                                         |
|                                                              | Является ли она дорогой/редкой и должна ли экономиться                                                         | есть как preference                                                                                                 |
| **Надёжность исполнения**          | Успешность route                                                                                                                                   | начинает накапливаться                                                                                |
|                                                              | Ошибки запуска                                                                                                                                  | собираются                                                                                                       |
|                                                              | AUTH / QUOTA / MODEL_UNAVAILABLE / CONFIG / NETWORK и т. д.                                                                                               | архитектурно уже определено                                                                       |
|                                                              | Количество retries / fallback                                                                                                                      | начинает собираться                                                                                      |
|                                                              | Может ли сессия resume/continue                                                                                                                 | известно по клиентам, но ещё не полностью нормализовано                     |
| **Результаты реальной работы** | Какую роль выполняла модель                                                                                                          | частично фиксируется                                                                                    |
|                                                              | Какой task/stage она выполняла                                                                                                              | есть в новых запусках                                                                                    |
|                                                              | Получен ли`DONE`                                                                                                                                  | есть                                                                                                                   |
|                                                              | Был ли`INVALID_OUTPUT`                                                                                                                                | предусмотрено                                                                                                 |
|                                                              | Прошла ли structural validation                                                                                                                      | предусмотрено                                                                                                 |
|                                                              | Что сказал следующий reviewer                                                                                                              | пока не превращено в полноценный рейтинг                                                |
|                                                              | Сколько понадобилось repairs                                                                                                              | начинает появляться                                                                                      |
| **Скорость**                                   | Wall-clock конкретного запуска                                                                                                             | уже местами измеряется                                                                                 |
|                                                              | Время до результата                                                                                                                         | частично                                                                                                           |
|                                                              | Latency как устойчивая характеристика модели                                                                                | пока данных мало                                                                                             |
| **Capabilities**                                       | Coding/agentic suitability                                                                                                                                   | частично — provider positioning + локальные наблюдения                                         |
|                                                              | Tool support                                                                                                                                                 | частично                                                                                                           |
|                                                              | Контекстное окно                                                                                                                              | resolver обязан учитывать, но единая заполненная таблица ещё не готова |
|                                                              | Modality support                                                                                                                                             | предусмотрено, заполнено не полностью                                                     |
|                                                              | Языки/runtime-specific suitability                                                                                                                      | предусмотрено, систематических данных пока мало                                  |
| **Независимость**                         | Семейство модели                                                                                                                              | фактически известно                                                                                      |
|                                                              | Provider                                                                                                                                                     | есть                                                                                                                   |
|                                                              | Можно ли использовать как независимого reviewer/certifier относительно текущего исполнителя | вычисляется из workflow/role history                                                                          |
| **История**                                     | Когда модель была проверена                                                                                                          | есть                                                                                                                   |
|                                                              | Какая версия/route использовалась                                                                                                   | частично                                                                                                           |
|                                                              | Как модель показывала себя на конкретных типах задач                                                            | данные уже появляются, но полноценной competence matrix ещё нет                      |

### Если сжать это до сущности `MODEL PROFILE`

Сейчас она концептуально выглядит примерно так:

```text
MODEL
├─ identity
│  ├─ canonical id
│  ├─ aliases
│  ├─ maker
│  └─ family
│
├─ access
│  ├─ clients/routes
│  ├─ availability
│  ├─ route health
│  └─ entitlement
│
├─ capability
│  ├─ provider positioning
│  ├─ rank
│  ├─ coding/agentic suitability
│  ├─ tools
│  ├─ context
│  ├─ modality
│  └─ effort levels
│
├─ economics
│  ├─ input price
│  ├─ output price
│  ├─ subscription/API
│  ├─ remaining quota
│  ├─ reset
│  └─ actual observed cost
│
├─ execution history
│  ├─ roles/tasks
│  ├─ success/failure
│  ├─ retries
│  ├─ latency
│  ├─ repair count
│  └─ route failures
│
└─ quality history
   ├─ validator outcome
   ├─ reviewer outcome
   ├─ certification outcome
   ├─ escaped defects
   └─ observed task-class competence
```

И вот **последний блок — `quality history / task-class competence` — сейчас самый незрелый**.

То есть мы уже довольно хорошо знаем:

> **что это за модель, где она доступна, сколько стоит, какой у неё effort, сколько у нас осталось ресурса и может ли она технически выполнить работу.**

Но значительно хуже знаем:

> **на каких конкретно классах наших задач эта модель является самой дешёвой моделью, которая стабильно даёт достаточное качество.**

На мой взгляд, именно сюда сейчас и упирается ваша новая гипотеза. Потому что для экономически оптимального выбора нам уже почти не нужны ещё десять статических характеристик модели — нам нужно научиться получать **эмпирическую функцию `цена → вероятность приемлемого результата для конкретного класса задачи`**.

Основано прежде всего на `P-L2-002`, `P-L3-002`, `P-L3-003`, `MODEL-MATRIX.md`, `PROTO-DEC-0074/0075` и `docs/ops/MODEL-ECONOMICS.md` в текущем контуре Colabs.

Критически важно не дать исследователям задачу «доказать нашу идею». Наша нынешняя гипотеза — сильный seed, но первый раунд должен иметь право прийти к выводу, что часть формулы, метрик или benchmark-портфеля неверна.

Я бы построил исследование так:

```text
                         RESEARCH GOAL
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
   RESEARCHER A          RESEARCHER B          RESEARCHER C
 benchmarks/source       task taxonomy          statistics/
 quality/authority       + capability map       normalization/economics

                              +
                              │
                              ▼
                        RESEARCHER D
                  adversarial / benchmark validity
                  contamination / harness / blind spots

             Все четыре работают НЕЗАВИСИМО
                              │
                       FREEZE CORPUS
                              │
               ┌──────────────┴──────────────┐
               ▼                             ▼
        SENIOR SYNTHESIS A             SENIOR SYNTHESIS B
       independent synthesis          independent synthesis
       + criticism                    + criticism
       + own judgement                + own judgement
               │                             │
               └──────────────┬──────────────┘
                              ▼
                      SENIOR CERTIFIER
                              │
                  CERTIFIED RESEARCH PLAN
                              │
                 ┌────────────┴────────────┐
                 ▼                         ▼
             ACCEPT                    OWNER GATE
```

И я бы дал всей цепочке **один общий master research brief**, а каждому участнику — отдельный role prompt.

---

# Master Research Brief

```markdown
# RESEARCH PROGRAM
## Benchmark-Driven Model Selection for Software Engineering Agents

Status: RESEARCH
Mode: evidence-seeking, adversarial, non-confirmatory
Primary objective: design an empirically grounded model-selection system for software-engineering agent workflows.

---

## 1. Research goal

Design a model-selection methodology that chooses the most economically rational model, effort and route for a concrete software-engineering task while preserving the required probability and quality of successful completion.

The target is NOT:

- to rank models by generic intelligence;
- to produce a universal "best model" leaderboard;
- to justify the current T1-T9 system;
- to prove that cheap models are always preferable;
- to prove that expensive models are unnecessary.

The target is:

> determine which observable data best predicts whether a particular
> model + effort + harness + route will successfully perform a particular
> class of software-engineering work, and how to combine those data with
> cost, time and failure/rework cost to choose the economically optimal executor.

---

# 2. Core economic question

For any task T and candidate executor M, the future resolver should ideally estimate:

P(
  accepted completion
  |
  task characteristics,
  role,
  model,
  effort,
  harness,
  tools,
  repository context
)

and then estimate:

- expected total cost to accepted completion;
- expected total time to accepted completion;
- expected rework;
- expected escalation probability;
- expected review burden.

The cheapest first invocation is NOT necessarily the cheapest completed task.

The strongest model is NOT necessarily the economically optimal executor.

---

# 3. Central hypothesis to investigate, not assume

Current hypothesis:

> Instead of first estimating a global intelligence tier and then selecting a model from that tier,
> the resolver should estimate task-specific competence and select the cheapest/fastest sufficiently
> reliable executor, escalating only when evidence indicates that more capability is needed.

This hypothesis MUST be challenged.

Researchers must actively search for cases where:

- cheap-first escalation costs more;
- benchmark performance fails to predict repository work;
- expensive models reduce total cost through lower rework;
- task classification is unreliable;
- public benchmark data are incomparable;
- model/harness/effort interactions dominate model identity;
- benchmark contamination makes a metric useless;
- a capability cannot reasonably be measured by current benchmarks.

---

# 4. Unit of analysis

Do not treat a model name alone as the unit.

Preferred unit:

(model,
 model version,
 harness/client,
 reasoning effort,
 tools/scaffold,
 task class)

Where evidence is missing, explicitly record it.

Examples of distinct datapoints:

Model X / Medium / native CLI

and

Model X / High / generic API harness

must not automatically be treated as equivalent.

---

# 5. Required software-engineering capability dimensions

The research must determine whether the following dimensions are valid, mergeable, missing, or redundant:

- repository-level implementation;
- bug fixing;
- feature implementation;
- multi-file change;
- refactoring;
- repository comprehension;
- architecture comprehension;
- architecture design;
- technical decision-making;
- debugging;
- terminal/CLI execution;
- long-horizon agentic execution;
- code review;
- defect detection;
- review precision;
- review recall;
- specification following;
- patch/edit reliability;
- algorithmic coding;
- test generation;
- test-based self-repair;
- tool use;
- context handling;
- recovery after failed attempt.

Do NOT preserve this taxonomy merely because it appears in the research brief.

Merge, split or reject dimensions when evidence supports doing so.

---

# 6. Benchmark candidates already identified

Treat these as candidates, NOT as an approved portfolio:

- SWE-Bench Pro;
- SWE-Bench Verified or relevant successors;
- SWE-Lancer IC;
- SWE-Lancer managerial / engineering-decision tasks;
- Terminal-Bench;
- RepoProbe;
- ArchBench or equivalent architecture benchmarks;
- AACR-Bench or equivalent repository code-review benchmarks;
- Aider Polyglot;
- LiveCodeBench;
- other demonstrably stronger or more relevant benchmarks discovered during research.

Search actively for newer or superior alternatives.

---

# 7. Benchmark evaluation criteria

Every benchmark must be evaluated on at least:

## Relevance
How directly does it represent the work performed by software-engineering agents?

## Ecological validity
How close is the task to real repository work?

## Difficulty
Does it still discriminate frontier and economical models?

## Contamination resistance
How likely is training/test contamination?

## Freshness
How recently was the corpus constructed or updated?

## Reproducibility
Can results be reproduced or independently verified?

## Harness dependence
How strongly does the reported score depend on a particular scaffold?

## Model comparability
Were candidate models evaluated under sufficiently comparable conditions?

## Effort comparability
Are reasoning budgets comparable?

## Tool comparability
Do agents receive comparable tools?

## Metric quality
Does the headline number actually measure the capability we need?

## Sample size
Is the benchmark large enough?

## Variance / confidence
Are uncertainty estimates available?

## Authority
Who maintains it and how credible is the methodology?

## Independent verification
Are there results not published solely by model vendors?

---

# 8. Source hierarchy

Prefer evidence approximately in this order:

1. benchmark repository / benchmark paper / official methodology;
2. independently maintained leaderboard;
3. independent reproduction;
4. peer-reviewed or technically transparent research;
5. model provider's benchmark report;
6. community measurements with reproducible methodology;
7. anecdotal reports.

A provider's own benchmark result is valid evidence that it reported that result.

It is NOT automatically independent evidence of comparative superiority.

---

# 9. Required separation of evidence

For every important claim distinguish:

FACT
MEASURED
PROVIDER CLAIM
INDEPENDENT CLAIM
HYPOTHESIS
INFERENCE

Do not silently merge them.

---

# 10. Research question: what information about a model is actually useful?

The current system records many fields.

Research which fields materially improve executor selection.

Candidates include:

- model identity;
- provider;
- route;
- effort;
- context;
- tools;
- modality;
- price;
- quota;
- latency;
- route reliability;
- benchmark profile;
- historical task success;
- reviewer outcome;
- repair count;
- escalation count;
- wall time;
- actual cost;
- task class;
- role;
- independence constraints.

For every field ask:

> Could changing this value change a rational routing decision?

If no realistic decision changes, classify the field as:

INVENTORY ONLY

rather than:

RESOLVER FEATURE.

---

# 11. External benchmark profile

Investigate a representation similar to:

MODEL_CAPABILITY_PROFILE

repository_implementation
bug_fixing
feature_work
repository_comprehension
architecture
debugging
terminal_agent
code_review
specification_following
editing
algorithmic_reasoning
...

Do not assume scores from unrelated benchmarks are directly combinable.

Research proper normalization.

---

# 12. Benchmark weighting

Investigate whether effective benchmark weight should depend on:

- task relevance;
- benchmark authority;
- freshness;
- comparability;
- confidence;
- sample size;
- contamination risk;
- harness similarity;
- tool similarity.

Candidate concept:

effective_weight =
    task_relevance
  × evidence_confidence
  × comparability
  × freshness
  × authority

This formula is only a hypothesis.

Develop better alternatives if justified.

---

# 13. Aggregation problem

Investigate alternatives including:

- weighted arithmetic mean;
- weighted geometric mean;
- harmonic-style aggregation;
- hard capability floors;
- Pareto filtering;
- Bayesian models;
- logistic success models;
- learned ranking;
- contextual bandits.

A critical question:

Can excellence in one capability compensate for weakness in another?

Example:

implementation = 0.98
architecture comprehension = 0.35

For an architecture-heavy task, a simple arithmetic mean may produce a dangerously misleading score.

Determine where hard floors are preferable.

---

# 14. External prior + local evidence

The system should probably treat public benchmarks as a prior and project telemetry as increasingly important local evidence.

Investigate models such as:

Q_final =
(k * Q_external + n * Q_local) /
(k + n)

where:

Q_external = benchmark prior
Q_local    = observed local performance
n          = comparable local observations
k          = prior strength

This is only a starting hypothesis.

Investigate Bayesian or calibration-based alternatives.

---

# 15. Success metric

The target variable should not simply be:

PROCESS EXIT = 0

Potential target:

ACCEPTED COMPLETION

which may include:

- output structurally valid;
- tests pass;
- required acceptance criteria satisfied;
- independent reviewer accepts;
- no mandatory repair;
- no escaped blocking defect observed within defined window.

Determine whether one binary variable is sufficient or whether a multi-dimensional quality target is needed.

---

# 16. Economic objective

Research the correct objective function.

Candidate:

Expected Accepted Completion Cost:

EAC_i =
C_i +
(1 - P_i) *
(
  recovery_cost +
  EAC_next
)

Possible components:

- model/API cost;
- subscription scarcity cost;
- token cost;
- retry cost;
- repair cost;
- review cost;
- handoff cost;
- escalation cost;
- owner intervention;
- opportunity cost of scarce expert capacity.

Similarly:

Expected Accepted Completion Time.

Determine which costs should genuinely enter routing and which create unnecessary complexity.

---

# 17. Possible optimization formulation

Candidate:

MINIMIZE

ExpectedAcceptedCost
+
lambda * ExpectedAcceptedTime

SUBJECT TO

quality floor
capability floors
technical compatibility
independence
context requirements
tool requirements
availability
budget

Investigate whether:

- lexicographic optimization,
- Pareto optimization,
- constrained optimization,
- expected utility,

would be superior.

---

# 18. Cheap-first vs strong-first

Study explicitly when each policy dominates.

## Cheap-first candidate

cheap qualified worker
→ validation
→ repair
→ escalation only if needed

## Strong-first candidate

senior model immediately

Calculate conditions under which one dominates the other.

Do not decide from intuition.

Relevant variables may include:

- price ratio;
- success probability;
- rework cost;
- handoff cost;
- review cost;
- task latency sensitivity;
- escalation penalty;
- context-transfer cost.

---

# 19. Role-specific routing

Do not assume the same model ranking for:

- implementer;
- debugger;
- architect;
- reviewer;
- certifier;
- researcher;
- synthesiser.

Research whether each role needs its own capability profile and success model.

A model may rationally be:

excellent implementer
poor architect
excellent reviewer
average researcher.

---

# 20. Required output of the overall research program

The final research plan should contain:

1. software-engineering task taxonomy;
2. capability taxonomy;
3. authoritative benchmark portfolio;
4. rejected benchmark list with reasons;
5. benchmark-to-capability mapping;
6. evidence-confidence model;
7. normalization method;
8. model capability-profile schema;
9. local telemetry schema;
10. definition of accepted completion;
11. external-prior / local-evidence fusion method;
12. executor-selection formula;
13. expected-cost model;
14. expected-time model;
15. escalation model;
16. independence handling;
17. missing-data behavior;
18. cold-start behavior for a new model;
19. stale-data/versioning policy;
20. minimum viable implementation;
21. experimental validation plan;
22. failure modes;
23. technical debt;
24. explicit unresolved questions.

The research is successful only if this can eventually be implemented as a deterministic or bounded decision layer.

---

# 21. Non-goals

Do not:

- create a generic AI leaderboard;
- optimize for benchmark prestige;
- use benchmark scores without checking methodology;
- assume vendor-reported scores are comparable;
- equate model price with capability;
- equate model family rank with task competence;
- hardcode current model names into protocol architecture;
- optimize token price while ignoring rework;
- invent precision where evidence does not support it.

---

# 22. Final principle under investigation

The desired system should eventually be able to answer:

> Which available model + effort + route is expected to reach an accepted result
> for this particular task at the lowest total economic cost and acceptable elapsed
> time, while satisfying all mandatory quality and safety constraints?

Research whether sufficient evidence currently exists to answer this robustly.
```

---

# Раунд 1 — четыре независимых исследователя

Я бы **не давал им одинаковый prompt**. Общий brief один, но углы атаки разные.

### R1 — Benchmark Landscape / Evidence

```markdown
Role: Benchmark Researcher

Your responsibility is to build the strongest possible evidence base about existing benchmarks.

Focus on:

- discovering current authoritative benchmarks;
- reading primary methodology;
- identifying exactly what each benchmark measures;
- determining versions and freshness;
- collecting available model results;
- determining whether results are comparable;
- detecting vendor-only claims;
- identifying independent reproductions;
- identifying contamination or benchmark saturation.

Do not design the final resolver except where necessary to explain what benchmark data can support.

Deliver:

BENCHMARK-CATALOG.md

For every benchmark include:
- capability measured;
- unit of task;
- dataset size;
- languages;
- repository-level vs isolated;
- tools/scaffold;
- metric;
- current difficulty;
- contamination controls;
- freshness;
- known limitations;
- result availability;
- comparability;
- confidence;
- primary sources.

Also provide:
- recommended portfolio;
- rejected benchmarks;
- missing capability dimensions.
```

### R2 — Task Taxonomy / Capability Mapping

```markdown
Role: Software-Engineering Capability Researcher

Start from real software-engineering workflows, not benchmark names.

Develop a task and role taxonomy suitable for routing coding agents.

Investigate:

- implementation;
- debugging;
- refactoring;
- repository comprehension;
- architecture;
- review;
- certification;
- specification;
- research;
- synthesis;
- terminal work;
- long-horizon autonomous execution.

Determine:

- which capabilities are genuinely distinct;
- which can be merged;
- which require hard floors;
- which public benchmarks proxy them;
- where no adequate benchmark exists.

Deliver:

TASK-CAPABILITY-MAP.md

The report must explicitly distinguish:

task class
role
risk/consequence
required capability
measurable proxy
benchmark availability
confidence.
```

### R3 — Statistics / Economics / Selection Formula

```markdown
Role: Quantitative Routing Researcher

Design candidate mathematical approaches to executor selection.

Study:

- score normalization;
- incomparable benchmark scales;
- benchmark weighting;
- uncertainty;
- Bayesian priors;
- local telemetry updating;
- expected accepted completion cost;
- expected accepted completion time;
- rework;
- escalation;
- cold start;
- sparse data;
- censored failures;
- contextual bandits as a future option.

Compare at least three materially different routing formulations.

Do not assume the proposed weighted-score formula is correct.

Deliver:

ROUTING-MATH.md

For every proposed formula include:

- variables;
- assumptions;
- behavior on missing data;
- behavior on low sample size;
- failure cases;
- explainability;
- data requirements;
- implementation complexity.

Finish with a recommended MVP formula and a later mature formula.
```

### R4 — Adversarial Validity / Failure Modes

```markdown
Role: Adversarial Benchmark and Routing Researcher

Attack the entire concept.

Search for reasons benchmark-driven routing may fail.

Focus on:

- benchmark contamination;
- leaderboard gaming;
- harness effects;
- scaffold effects;
- effort differences;
- provider self-reporting;
- benchmark saturation;
- domain mismatch;
- repository mismatch;
- model version drift;
- price volatility;
- subscription distortion;
- survivorship bias;
- selection bias;
- reviewer bias;
- local telemetry feedback loops;
- Simpson's paradox;
- small-sample overfitting;
- cheap-first rework traps;
- expensive-first waste;
- hidden cost of handoff.

For every major risk propose:
- detection;
- mitigation;
- residual risk.

Deliver:

ADVERSARIAL-VALIDITY.md

End with:
- what evidence would convince you the resolver works;
- what evidence would falsify it.
```

---

# Раунд 2 — два независимых старших синтеза

И вот здесь я бы сделал именно то, что вы описали: **оба получают все четыре frozen reports, но не читают синтез друг друга**.

Prompt обоим практически одинаковый:

```markdown
# SENIOR SYNTHESIS

You are an independent senior expert.

Inputs:

- MASTER RESEARCH BRIEF
- BENCHMARK-CATALOG
- TASK-CAPABILITY-MAP
- ROUTING-MATH
- ADVERSARIAL-VALIDITY

Do not merely summarize the four reports.

Your job is to adjudicate them.

For every important question:

1. state the positions found in the reports;
2. identify agreement;
3. identify disagreement;
4. compare evidence quality;
5. reject weak claims;
6. preserve unresolved disagreement;
7. state the emerging cross-report consensus;
8. separately state your own expert judgement.

Use exactly this conceptual distinction:

CONSENSUS:
what the collected evidence/researchers support.

SENIOR JUDGEMENT:
your own conclusion after examining that evidence.

They may differ.

Do not manufacture consensus.

---

## Required work

Produce a coherent proposed design for:

- task taxonomy;
- capability taxonomy;
- benchmark portfolio;
- benchmark confidence;
- score normalization;
- benchmark weighting;
- hard capability floors;
- external benchmark prior;
- local telemetry;
- accepted-result definition;
- model competence profile;
- executor selection;
- expected cost;
- expected time;
- escalation;
- missing data;
- cold start;
- version drift;
- implementation MVP;
- validation experiment.

For each major design decision label:

CONSENSUS
STRONG SUPPORT
CONTESTED
SENIOR OVERRIDE
INSUFFICIENT EVIDENCE

If you override the apparent consensus, explain exactly why.

---

## Critical requirement

Attempt to falsify the central hypothesis:

"task-specific cheapest sufficiently reliable executor + evidence-triggered escalation
is superior to preassigning a global model tier."

If the evidence only supports this for some task classes, identify them.

---

## Output

SYNTHESIS-<A|B>.md

End with:

### Proposed final architecture

### Proposed formulas

### Recommended benchmark portfolio

### Evidence gaps

### Decisions safe to implement now

### Decisions that require experiments

### Decisions that must remain technical debt
```

Это даст как раз два слоя мнения:

```text
4 independent researchers
        ↓
evidence consensus
        +
senior A judgement

и отдельно

evidence consensus
        +
senior B judgement
```

---

# Раунд 3 — сертификация

Здесь я бы уже не просил третью модель написать ещё один «умный синтез». Она должна быть **сертификатором**, то есть проверять, можно ли по материалам строить реальный план.

```markdown
# FINAL CERTIFICATION — Benchmark-Driven Model Resolver Research

Role: Independent Senior Certifier

Inputs:

- MASTER RESEARCH BRIEF;
- all four Round-1 reports;
- SYNTHESIS-A;
- SYNTHESIS-B.

You did not participate in their production.

Your job is NOT to write a third independent research report.

Your job is to determine whether the corpus supports a defensible implementation plan.

---

## 1. Integrity

Verify that:

- both syntheses considered all four reports;
- material disagreements were preserved;
- important claims have evidence;
- vendor claims were not silently converted into facts;
- benchmark comparability problems were addressed;
- missing data were not replaced by invented precision.

---

## 2. Cross-synthesis comparison

For every material proposal classify:

AGREE
COMPATIBLE
CONFLICT
UNSUPPORTED

Compare at least:

- task taxonomy;
- benchmark portfolio;
- benchmark weighting;
- normalization;
- capability floors;
- external/local evidence fusion;
- success probability;
- cost model;
- time model;
- escalation;
- telemetry;
- MVP.

---

## 3. Hostile checks

Attempt to find:

- a task where the proposed resolver selects an obviously irrational model;
- a task where cheap-first causes predictable waste;
- a task where strong-first causes predictable waste;
- a benchmark whose inclusion distorts the result;
- a missing benchmark dimension;
- a model whose ranking changes merely because a benchmark uses another harness;
- a feedback loop that would incorrectly reinforce an initially lucky model.

---

## 4. Certification target

The certification target is NOT:

"a perfect final resolver."

The target is:

"a research-backed implementation plan for an MVP resolver plus an explicit experimental path to improve it."

---

## 5. Verdict

Return exactly one:

CERTIFIED
CERTIFIED_WITH_CONDITIONS
NOT_CERTIFIED

Do not average disagreements to reach certification.

---

## 6. Final deliverable

If certified, produce:

CERTIFIED-PLAN.md

containing:

1. accepted findings;
2. rejected findings;
3. unresolved questions;
4. benchmark portfolio v1;
5. capability profile v1;
6. formula/resolver v1;
7. telemetry required;
8. MVP implementation sequence;
9. shadow-mode experiment;
10. acceptance criteria;
11. promotion criteria from shadow to live routing;
12. rollback conditions;
13. explicitly deferred sophistication;
14. technical debt.

If NOT_CERTIFIED, identify the minimum missing research necessary for another certification attempt.
```

---

## Очень важное дополнение: перед Round 1 надо заморозить `RESEARCH QUESTIONS`

Иначе четыре исследователя принесут четыре великолепных, но плохо стыкуемых эссе.

Я бы обязательно задал им одну и ту же таблицу вопросов:

```text
Q1  Какие классы programming work реально различимы?
Q2  Какие способности определяют успех в каждом классе?
Q3  Какими benchmark их лучше измерять?
Q4  Насколько benchmark авторитетен?
Q5  Насколько результаты разных моделей сравнимы?
Q6  Как нормализовать scores?
Q7  Какие capability нельзя усреднять и требуют floor?
Q8  Как объединить внешние benchmark и локальные результаты?
Q9  Что считать accepted completion?
Q10 Как оценить P(success)?
Q11 Как считать реальную стоимость завершённой задачи?
Q12 Как считать время?
Q13 Когда cheap-first рационален?
Q14 Когда strong-first рационален?
Q15 Как выбирать effort?
Q16 Как учитывать harness/tools?
Q17 Как работать с новой моделью без истории?
Q18 Как бороться со stale benchmark/model versions?
Q19 Какие данные нынешнего model layer бесполезны?
Q20 Какой минимальный resolver уже даст экономическую пользу?
```

Это даст вам очень хороший **join key** между четырьмя независимыми исследованиями.

---

## И ещё одно изменение относительно вашей схемы

Я бы не делал:

```text
4 исследования
→ 2 синтеза
→ лучший эксперт выбрал один синтез
```

Лучше:

```text
4 исследования
→ 2 синтеза
→ certifier получает ВСЕ 6 документов
```

Потому что иначе синтезаторы становятся lossy compression layer. Оба могут независимо выкинуть один и тот же неудобный, но важный факт.

Сертификатору нужны первоисточники.

И **оба синтеза тоже должны быть сохранены**, даже если один окажется заметно слабее.

---

## Что должно выйти в самом конце

Не очередной документ «какая модель умнее», а фактически спецификация нового model layer:

```text
AVAILABLE MODELS
       ↓
CAPABILITY / BENCHMARK PROFILE
       ↓
TASK CAPABILITY REQUIREMENTS
       ↓
ELIGIBILITY + HARD FLOORS
       ↓
P(ACCEPTED COMPLETION)
       ↓
EXPECTED TOTAL COST + TIME
       ↓
ECONOMIC RESOLVER
       ↓
PRIMARY + FALLBACKS
       ↓
EXECUTION
       ↓
LOCAL OUTCOME TELEMETRY
       ↓
PROFILE UPDATE
```

И после этого уже можно отдельно решить судьбу нынешних `T1–T9`: оставить их как coarse safety mechanism, сильно упростить или вообще постепенно вывести из routing path.

Это исследование я бы считал достаточно значимым, чтобы **не привязывать его к сегодняшним конкретным именам моделей**. Роли фиксируем, а четыре исследовательских, два senior и одного certifier выбирает ваш динамический resolver из доступного пула с требованием к независимости семейств там, где это возможно.
