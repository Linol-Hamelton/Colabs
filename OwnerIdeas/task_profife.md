Advisory seed; consumed by R-3; status: RESOLUTION-CLAUDE.md section 4.4



Да. Все три фактора существенные, но они влияют **на разные части решения**, и это принципиально.

Да. И здесь я бы сразу сделал важную архитектурную поправку: **слой не должен называться просто «оценка сложности задачи»**. Сложность — только один из его выходов.

Сейчас в `Colabs` эту функцию в основном выполняет `P-L2-002-model-selection.md`: он одновременно **оценивает задачу, превращает оценку в T1–T9 и сразу выбирает модель**. В rubric сейчас входят `Size`, `Protected paths`, `Novelty`, `Reversibility`, `Ambiguity`, `Coupling`. Но `PROTO-DEC-0075` уже частично отменил эту логику: объём больше не должен повышать интеллект модели, а выбирать надо по uncertainty, consequence of error, reasoning depth, coupling и independent judgement. То есть нынешний слой уже концептуально расколот надвое, но ещё не оформлен до конца (`P-L2-002` и `PROTO-DEC-0075`, состояние `4a85a23`).

Я бы сделал самостоятельный слой:

# `TASK CHARACTERIZATION / TASK PROFILE`

Его единственная задача:

> **Понять, что именно представляет собой работа и какие способности, ограничения и гарантии она требует.**

И принципиально:

```text
TASK
  ↓
TASK CHARACTERIZATION
  ↓
TASK PROFILE
  ↓
MODEL RESOLVER
```

**Task Characterization не должен выбирать модель. Не должен знать, что Opus дорогой, DeepSeek дешёвый или Gemini свободен.** Иначе мы опять смешаем диагноз задачи с лечением.

---

## Что он должен определять

Я сейчас вижу примерно **семь независимых групп характеристик**.

| Группа                                                | Что оцениваем                                                           | Зачем                                                                                 |
| ----------------------------------------------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| **Тип работы**                               | implementation, debugging, architecture, review, research, synthesis и т. д.     | Сопоставление с benchmark-профилем моделей                    |
| **Интеллектуальная нагрузка** | novelty, ambiguity, reasoning depth, search depth                                   | Насколько сложное рассуждение требуется                |
| **Риск ошибки**                             | consequence, blast radius, reversibility                                            | Какой assurance нужен                                                            |
| **Технический профиль**             | язык, framework, tools, context, modalities                                     | Hard eligibility модели                                                              |
| **Структура работы**                   | coupling, dependencies, long-horizon, число этапов                       | Насколько сложна execution                                                  |
| **Проверяемость**                        | tests, formal validator, объективность acceptance criteria             | Насколько безопасно использовать дешёвую модель |
| **Качество постановки**             | полнота specification, известные precedents, неизвестные | Насколько worker может действовать без senior reasoning        |

И вот это уже намного информативнее одного `T7`.

---

# 1. Task class — **что мы вообще делаем**

Нужен не один label, а при необходимости смесь.

Например:

```yaml
task_capabilities:
  repository_implementation: 0.55
  debugging: 0.20
  repository_comprehension: 0.15
  architecture: 0.10
```

Другой task:

```yaml
task_capabilities:
  architecture_design: 0.50
  repository_comprehension: 0.25
  technical_decision: 0.15
  specification: 0.10
```

Это непосредственно состыкуется с исследованием benchmark-driven resolver, которое мы только что сформировали.

То есть вместо:

```text
TASK = T6
```

мы получаем:

```text
TASK requires:
55% implementation
20% debugging
15% repo comprehension
10% architecture
```

---

# 2. Cognitive difficulty — **насколько трудно понять правильное решение**

Здесь нынешний `P-L2-002` уже нащупал хорошие сигналы:

- novelty;
- ambiguity;
- coupling.

Но я бы расширил и разделил:

```text
novelty
ambiguity
reasoning_depth
search_space
cross-system reasoning
requirement uncertainty
evidence conflict
```

Особенно важен **reasoning depth**.

Например:

```text
"переименовать поле по точной спецификации в 35 файлах"
```

может быть огромной задачей, но:

```text
reasoning_depth = LOW
```

А:

```text
"почему иногда теряется состояние после resume?"
```

может затронуть пять строк, но:

```text
reasoning_depth = VERY HIGH
```

Это именно тот недостаток, который мы уже нашли в старой rubric.

---

# 3. Consequence / Risk — отдельно от сложности

Это вообще нельзя смешивать.

Например:

### Задача A

```text
сложность: высокая
последствия ошибки: низкие
```

Исследовательский prototype, который можно удалить.

### Задача B

```text
сложность: низкая
последствия ошибки: огромные
```

Изменить одну строку ACL/security policy.

Поэтому:

```yaml
risk:
  consequence: high
  blast_radius: high
  reversibility: medium
  external_effects: true
```

не должно автоматически означать:

```text
нужен дорогой implementer
```

Это может означать:

```text
дешёвый implementer
+
очень сильный reviewer/certifier
```

И это для вашей экономики чрезвычайно важно.

---

# 4. Specification quality

Я считаю, что это вообще один из **сильнейших предикторов необходимой силы модели**, которого сейчас почти нет в rubric.

Нужно оценивать:

```text
specification completeness
acceptance criteria completeness
known implementation path
known constraints
known examples
known negative cases
```

Потому что:

```text
сложная задача + точная спека
```

и:

```text
та же задача + "сделай нормально"
```

для модели — совершенно разные задачи.

Можно даже ввести:

```text
specification_strength = 0…1
```

И гипотеза, которую стоит проверить:

> Чем выше specification strength и testability, тем дешевле может быть executor без снижения итогового качества.

Это потенциально очень мощный экономический рычаг.

---

# 5. Verification / Testability

Ещё один параметр, который, на мой взгляд, сейчас недооценён.

Нужно спросить:

> **Насколько быстро и объективно мы узнаем, что модель ошиблась?**

Например:

```text
100 deterministic tests
+
schema validator
+
known expected output
```

Это великолепная среда для дешёвого worker.

Даже если он ошибётся:

```text
worker
→ tests FAIL
→ repair
```

Ошибка дешёвая и сразу наблюдаемая.

А если задача:

```text
"выбрать архитектуру новой подсистемы"
```

и объективного validator нет, ошибка может обнаружиться через неделю.

Там стоимость ошибки огромна.

Поэтому нужны примерно:

```yaml
verification:
  deterministic_coverage: high
  acceptance_observability: high
  failure_detection_latency: low
  semantic_judgement_required: low
```

Это может оказаться **не менее важным для выбора модели, чем сама сложность задачи**.

---

# 6. Scope / Volume

Объём всё равно надо измерять.

Но не как интеллект.

Сейчас:

```text
>15 files
→ повышаем TIER
```

я бы окончательно убрал.

Вместо этого:

```yaml
execution_load:
  estimated_files: 40
  estimated_context_tokens: 120000
  expected_output_size: large
  expected_tool_calls: high
```

Это влияет на:

- context compatibility;
- стоимость;
- wall time;
- возможность parallelization;
- необходимость decomposition.

Но **не говорит непосредственно, насколько умной должна быть модель**.

---

# 7. Long-horizon / orchestration complexity

Отдельно от reasoning complexity.

Задача может быть не особенно интеллектуально трудной, но потребовать:

```text
прочитать 80 файлов
→ изменить 20
→ запустить 6 тестов
→ исправить 3 ошибки
→ проверить diff
```

То есть:

```yaml
execution:
  horizon: high
  sequential_dependencies: high
  tool_interaction: high
```

Некоторые модели могут быть очень умными, но хуже удерживать такой agentic loop.

И тут как раз пригодятся Terminal-Bench / SWE-Bench agentic metrics.

---

# 8. Hard technical constraints

Эти параметры вообще **не должны входить в score**.

Просто фильтр:

```yaml
requirements:
  language: [javascript, powershell]
  tools: [filesystem, shell, git]
  context_min: 100000
  vision: false
  internet: true
```

Если модель не проходит — она не кандидат.

Никакая высокая benchmark-оценка это не компенсирует.

---

# 9. Assurance requirements

Ещё один отдельный выход task profiler:

```yaml
assurance:
  independent_review: true
  certification: true
  different_family: true
  max_semantic_repairs: 2
```

Опять-таки это не обязательно свойство **executor**.

Очень важное разделение:

```text
TASK RISK
       ↓
WORKFLOW DEPTH
```

а не обязательно:

```text
TASK RISK
       ↓
EXPENSIVE EXECUTOR
```

Это может дать огромную экономию.

---

# Я бы поэтому вообще убрал понятие одной «сложности»

Не:

```text
complexity = 8/10
```

а:

```yaml
task_profile:

  capabilities:
    implementation: 0.55
    debugging: 0.25
    repo_comprehension: 0.20

  cognition:
    novelty: 0.30
    ambiguity: 0.20
    reasoning_depth: 0.45

  specification:
    completeness: 0.92

  verification:
    determinism: 0.95
    test_coverage: 0.90
    semantic_judgement: 0.10

  risk:
    consequence: 0.65
    blast_radius: 0.50
    reversibility: 0.90

  execution:
    context: 0.40
    volume: 0.80
    horizon: 0.50
    coupling: 0.30

  hard_requirements:
    tools: [...]
    languages: [...]
    context_min: ...
```

И вот **resolver уже смотрит на этот вектор**.

---

# Тогда архитектура становится гораздо чище

```text
USER TASK
    ↓
TASK CHARACTERIZER
    ↓
TASK PROFILE
    │
    ├── capability requirements
    ├── cognitive requirements
    ├── specification quality
    ├── verification strength
    ├── risk / consequence
    ├── execution load
    └── hard constraints
    ↓
WORKFLOW / ASSURANCE POLICY
    │
    └── какие stages/reviews/certification нужны
    ↓
MODEL RESOLVER
    │
    ├── model benchmark profiles
    ├── local empirical performance
    ├── price
    ├── speed
    └── availability
    ↓
PRIMARY + FALLBACKS
```

На мой взгляд, это **важное разделение относительно сегодняшнего ядра**:

> `TASK CHARACTERIZER` говорит **что требуется от исполнителя**.
> `MODEL RESOLVER` говорит **кто это требование выполнит наиболее рационально**.
> `ASSURANCE POLICY` говорит **как проверить, что результату можно доверять**.

И я бы пока **не писал формулу Task Characterizer**. Именно здесь стоит провести следующее исследование: какие признаки реально предсказывают необходимую способность модели, какие дублируют друг друга, какие можно снять автоматически из репозитория, а какие требуют семантической оценки.

Особенно я бы исследовал четыре потенциально очень сильных фактора, которых нынешняя rubric почти не использует:

**`specification quality × testability × task-capability profile × cost of undetected error`**.

Есть подозрение, что эта четвёрка окажется для экономичного routing значительно полезнее привычной абстрактной «сложности задачи».

### 1. Детерминированность задачи — **очень существенная**

Я бы поставил её в число потенциально самых сильных факторов наряду с `specification quality` и `testability`.

Но важно разделить:

- **детерминированность решения** — насколько узок диапазон корректных решений;
- **детерминированность проверки** — насколько однозначно можно установить, что результат правильный.

Например:

```text
"замени API X на Y по данной схеме,
вот acceptance tests"
```

может быть довольно большой задачей, но чрезвычайно детерминированной.

А:

```text
"спроектируй оптимальную архитектуру нового resolver"
```

может занимать три страницы, но быть очень недетерминированной.

Моя исходная гипотеза:

> **Чем выше детерминированность + проверяемость, тем безопаснее опускаться к дешёвому executor.**

Причём это, вероятно, не просто ещё один фактор, а **модификатор влияния других факторов**.

---

### 2. Объём входных токенов — **важный, но не как мера интеллекта**

Ваше предложение с маленьким deterministic script мне нравится.

Мы действительно можем ещё **до запуска модели** оценить:

```text
prompt tokens
+
mandatory files
+
dependency-neighbour files
+
role/protocol context
+
likely supporting context
```

И получить пусть не точный, но хороший верхний/ожидаемый диапазон:

```text
estimated_input_tokens
estimated_required_context
estimated_max_context
```

Но я бы не использовал:

```text
больше токенов → сильнее модель
```

Объём влияет прежде всего на:

- допустимость модели по context window;
- фактическую стоимость;
- скорость чтения;
- риск потери внимания;
- необходимость retrieval;
- long-context degradation;
- вероятность пропуска важной связи.

И я бы исследовал не только `token volume`, но ещё:

```text
context fragmentation
```

То есть 100k токенов одного последовательного specification и 100k токенов из 70 взаимосвязанных файлов — **совсем не одинаковая задача**.

Поэтому более сильный профиль:

```text
context_volume
context_fragmentation
dependency_density
required_context_fraction
```

---

### 3. Близость задачи к benchmark — **крайне важная, но это метрика доверия к прогнозу**

Это, по-моему, очень сильная идея.

Если задача почти идентична классу задач SWE-Bench Pro, то результат модели на SWE-Bench Pro должен иметь большой вес.

Если задача:

```text
архитектурный синтез нового orchestration kernel
```

а мы пытаемся оценивать её через LiveCodeBench, benchmark score должен иметь почти нулевой вес.

Я бы ввёл:

```text
benchmark_task_similarity
```

или даже:

```text
benchmark_transferability
```

То есть:

> Насколько результат модели на benchmark X является хорошим предиктором результата именно на этой задаче?

Это может стать **множителем веса benchmark**, а не характеристикой модели как таковой:

\[
EffectiveBenchmarkWeight =
BaseBenchmarkConfidence
\times
TaskSimilarity
\times
HarnessSimilarity
\times
EnvironmentSimilarity
\]

Вот это уже очень мощная конструкция.

---

# И здесь есть важный поворот

Я бы **не искал один универсальный вес каждого фактора**.

То есть не:

```text
determinism = 0.17
ambiguity = 0.12
tokens = 0.08
...
```

навсегда.

Скорее:

\[
w_i = f(task\_class,\ role,\ workflow)
\]

Потому что `input tokens` могут быть почти несущественны для маленького исследовательского ответа и критичны для repository-wide review.

А `determinism` может быть чрезвычайно важна для implementer и значительно менее важна для researcher.

Поэтому исследование должно выяснить:

1. какие факторы существуют;
2. что именно они предсказывают;
3. являются ли они независимыми;
4. где они взаимодействуют;
5. имеют ли они threshold/nonlinear effect;
6. как меняется их вес по классам задач.

---

# Готовый prompt исследования

```markdown
# RESEARCH PROGRAM
## Task Characterization Factors for Economically Optimal Model Routing

**Status:** RESEARCH  
**Mode:** evidence-seeking, adversarial, non-confirmatory  
**Target system:** software-engineering multi-agent model resolver

---

# 1. Research goal

Determine which measurable characteristics of a software-engineering task are actually predictive of:

1. the minimum model capability required for successful completion;
2. the probability of accepted completion for a given model;
3. expected execution cost;
4. expected completion time;
5. expected repair/retry/escalation cost;
6. required review/certification depth.

The goal is NOT to invent a subjective "task difficulty score".

The goal is to construct an empirically defensible:

TASK CHARACTERIZATION VECTOR

that can later be combined with:

- model benchmark profiles;
- internal model telemetry;
- cost;
- speed;
- availability;

to select an economically rational executor.

---

# 2. Architectural boundary

Keep three systems conceptually separate:

TASK CHARACTERIZER
    ↓
describes what the task requires

MODEL RESOLVER
    ↓
selects which executor can satisfy it economically

ASSURANCE POLICY
    ↓
decides how strongly the result must be verified

The Task Characterizer MUST NOT choose a concrete model.

It outputs task properties and requirements only.

---

# 3. Central research question

For a task T, which observable features materially change:

P(
  accepted completion
  |
  model,
  effort,
  harness,
  task
)

and:

Expected Accepted Completion Cost

and:

Expected Accepted Completion Time?

---

# 4. Seed factors already identified

Treat all factors below as HYPOTHESES.

Researchers MUST be allowed to:

- reject them;
- merge them;
- split them;
- redefine them;
- identify stronger factors.

---

## A. Task capability profile

Determine which kinds of capability the task actually requires.

Candidate dimensions:

- repository implementation;
- feature implementation;
- bug fixing;
- refactoring;
- debugging;
- repository comprehension;
- architecture comprehension;
- architecture design;
- technical decision-making;
- specification writing;
- code review;
- certification;
- research;
- evidence synthesis;
- terminal/CLI execution;
- long-horizon autonomous work;
- algorithmic coding;
- testing;
- repair.

A task may require a mixture rather than one category.

Candidate representation:

task_capabilities:
  repository_implementation: 0.50
  debugging: 0.20
  repo_comprehension: 0.20
  architecture: 0.10

Investigate whether this representation is useful.

---

## B. Determinism

Investigate task determinism as a potentially major factor.

Separate at least:

### Solution determinism
How narrow is the space of acceptable solutions?

### Verification determinism
How objectively can correctness be established?

Examples:

high determinism:
- exact migration;
- mechanical refactoring;
- schema transformation;
- implementation against strong acceptance tests.

low determinism:
- architecture design;
- strategy;
- research synthesis;
- ambiguous debugging;
- product design.

Investigate the hypothesis:

> High determinism allows weaker/cheaper executors to perform reliably because the search space is constrained and errors are easier to detect.

Do NOT assume this is universally true.

Determine whether determinism interacts strongly with:

- specification quality;
- testability;
- ambiguity;
- model capability.

---

## C. Specification quality

Potential dimensions:

- requirement completeness;
- acceptance-criteria completeness;
- implementation-path clarity;
- explicit constraints;
- examples;
- negative examples;
- known precedents;
- unresolved questions.

Investigate whether specification strength predicts how far executor capability can safely be reduced.

---

## D. Verification / testability

Measure how cheaply and objectively an incorrect result can be detected.

Candidate dimensions:

- deterministic tests available;
- test coverage;
- schema validation;
- static analysis;
- known expected output;
- reproducible failure;
- objective acceptance criteria;
- semantic human/model judgement required;
- failure detection latency.

Investigate:

> Does strong verification permit a much cheaper first executor without increasing Expected Accepted Completion Cost?

---

## E. Cognitive uncertainty / reasoning demand

Candidate factors:

- novelty;
- ambiguity;
- reasoning depth;
- search-space size;
- conflicting evidence;
- requirement uncertainty;
- causal reasoning;
- cross-system reasoning;
- hidden-state inference.

Determine which are distinct and which duplicate one another.

---

## F. Coupling

Potential dimensions:

- number of architectural layers touched;
- number of subsystems;
- dependency density;
- cross-repository coupling;
- runtime coupling;
- external-system coupling;
- stateful interaction.

Do not equate coupling with file count.

---

## G. Reversibility

Investigate:

- trivial revert;
- migration required;
- external side effects;
- persistent data mutation;
- irreversible operation;
- costly rollback.

Determine whether reversibility predicts executor strength or primarily assurance depth.

---

## H. Consequence of error

Separate difficulty from consequence.

Candidate dimensions:

- blast radius;
- security impact;
- data impact;
- financial impact;
- user impact;
- protocol/core impact;
- probability of silent failure;
- time until error detection.

Investigate whether high consequence should:

1. raise executor capability;
2. raise reviewer/certifier strength;
3. increase workflow depth;
4. some combination of these.

Do not assume high risk automatically requires an expensive implementer.

---

# 5. Input-context metrics

Investigate whether context requirements materially predict model suitability, cost and completion time.

The system can estimate context BEFORE execution.

Potential deterministic measurement:

prompt tokens
+
mandatory task files
+
dependency-linked files
+
protocol/role context
+
expected supporting context

Candidate metrics:

- prompt_token_count;
- mandatory_context_tokens;
- reachable_context_tokens;
- estimated_context_tokens;
- maximum_relevant_context_tokens;
- context-window utilization ratio;
- context fragmentation;
- number of source files;
- dependency density;
- required context fraction;
- repeated-context overhead.

---

## Important distinction

Do NOT treat:

large token volume

as equivalent to:

high intelligence requirement.

Investigate whether token volume primarily predicts:

- compatibility;
- latency;
- price;
- attention degradation;
- retrieval burden;
- probability of omission.

---

# 6. Static context estimator

Research the feasibility of a deterministic pre-execution script that:

1. reads the canonical task/prompt;
2. discovers explicitly referenced files;
3. follows dependency/import/reference relationships;
4. calculates token counts;
5. estimates minimum/likely/maximum task context.

Candidate output:

context_estimate:
  prompt_tokens: ...
  mandatory_tokens: ...
  likely_tokens: ...
  reachable_tokens: ...
  fragmentation: ...
  confidence: ...

Determine:

- what can be computed cheaply;
- what requires semantic inference;
- how much overestimation is acceptable;
- whether maximum context is actually useful;
- whether expected context is more predictive.

---

# 7. Execution volume

Measure work volume separately from intelligence.

Candidate factors:

- expected files touched;
- expected LOC changed;
- expected commands;
- expected tool calls;
- expected output tokens;
- expected execution duration;
- expected number of validation cycles.

Investigate which predict:

- cost;
- time;
- context need;

and which, if any, genuinely predict intelligence requirement.

---

# 8. Long-horizon / agentic complexity

Separate reasoning difficulty from execution horizon.

Potential metrics:

- number of sequential steps;
- dependency depth;
- need to preserve intermediate state;
- number of tool interactions;
- branching factor;
- expected repair loops;
- environment mutations;
- requirement for resume/recovery.

A task may be:

low reasoning + high execution horizon

or:

high reasoning + short execution.

Treat them separately.

---

# 9. Benchmark proximity / transferability

This is a central research target.

For every task and benchmark, estimate:

benchmark_task_similarity

Meaning:

> How strongly should performance on benchmark B predict performance on task T?

Potential dimensions:

- task-type similarity;
- repository-level similarity;
- language similarity;
- tool similarity;
- harness similarity;
- context-size similarity;
- autonomy/horizon similarity;
- verification similarity;
- output-type similarity.

Candidate:

BenchmarkTransferability(B,T) =
TaskSimilarity
× HarnessSimilarity
× EnvironmentSimilarity
× EvidenceConfidence

This formula is only a hypothesis.

Research better alternatives.

---

# 10. Benchmark relevance as a weight modifier

Do NOT use the same benchmark weight for every task.

Example:

SWE-Bench Pro may receive high weight for:

repository bug fixing

but low weight for:

architecture design.

RepoProbe may receive high weight for:

repository comprehension

but lower weight for:

mechanical code transformation.

Determine how task-to-benchmark proximity should influence model competence estimation.

---

# 11. Hard technical constraints

Identify characteristics that should NOT be weighted scores at all.

Possible hard filters:

- minimum context window;
- required modality;
- required tools;
- internet requirement;
- filesystem access;
- terminal access;
- language support;
- required structured output;
- route availability.

If a candidate fails a mandatory constraint, high scores elsewhere must not compensate.

---

# 12. Search for additional factors

Do NOT stop at the seed list.

Actively search software-engineering research, agent benchmarks, empirical software engineering, cognitive task analysis and LLM-routing literature for additional predictors.

Potential areas to investigate:

- requirement entropy;
- dependency entropy;
- task decomposition quality;
- availability of precedent;
- locality of change;
- observability of system state;
- feedback latency;
- feedback quality;
- error recoverability;
- environment reproducibility;
- API/documentation quality;
- domain specialization;
- language/framework rarity;
- degree of hidden state;
- parallelizability;
- tool reliability;
- human-intervention requirement.

For every discovered factor explain why it may matter.

---

# 13. Feature usefulness test

For every candidate feature F ask:

> Can changing F reasonably change the optimal executor, effort or assurance strategy while the other important variables remain approximately constant?

If not, classify:

INVENTORY ONLY

rather than:

ROUTING FEATURE.

Do not include data merely because it can be measured.

---

# 14. Factor redundancy

Search explicitly for correlated/redundant features.

Examples that may overlap:

- ambiguity and requirement uncertainty;
- coupling and dependency density;
- determinism and testability;
- size and token volume;
- novelty and lack of precedent.

Determine whether they should:

- remain separate;
- merge;
- form latent dimensions;
- serve different downstream decisions.

---

# 15. Factor interactions

Do not assume additive effects.

Investigate important interactions such as:

determinism × testability

specification_quality × executor_strength

context_volume × context_fragmentation

task_type × benchmark_similarity

ambiguity × reasoning_depth

risk × verification_strength

novelty × precedent_availability

cheap_executor × repair_cost

A factor may matter primarily through interactions rather than as an independent main effect.

---

# 16. Non-linear effects and thresholds

Investigate whether some factors behave non-linearly.

Examples:

- context may matter little until a model approaches its effective context limit;
- risk may create a hard review floor;
- benchmark similarity below a threshold may make that benchmark nearly useless;
- determinism above a threshold may make cheap executors highly reliable.

Do not force every factor into a linear 0-1 weighting model.

---

# 17. Factor weights

The research must ultimately propose a method for assigning influence/weight.

However:

DO NOT assign arbitrary permanent weights from intuition.

Investigate whether weight should depend on:

- task class;
- role;
- workflow stage;
- risk;
- available verification;
- model family;
- evidence quantity.

Preferred concept:

w_i = f(task_class, role, evidence)

rather than:

w_i = global constant.

---

# 18. What should the factors predict?

Do not optimize a vague "difficulty score".

Evaluate factors against explicit target variables:

### Target A
Probability of accepted completion on first attempt.

### Target B
Probability of accepted completion after bounded repair.

### Target C
Expected total cost to accepted completion.

### Target D
Expected total time to accepted completion.

### Target E
Probability of requiring escalation.

### Target F
Probability of semantic failure escaping deterministic validation.

### Target G
Required assurance/review depth.

A factor may be strong for one target and weak for another.

Record this.

---

# 19. Measurement quality

For each factor specify:

- definition;
- unit/range;
- deterministic vs judgement-based;
- measurement method;
- expected cost of measurement;
- expected noise;
- reproducibility;
- manipulability;
- confidence.

Prefer cheap deterministic measurements where predictive value is comparable.

---

# 20. Automatic vs semantic characterization

Classify every factor as:

### Deterministic
Can be measured by script before model execution.

Examples may include:
- token counts;
- files;
- dependency graph;
- language;
- test count;
- context window need.

### Semantic
Requires model/human judgement.

Examples may include:
- ambiguity;
- architecture novelty;
- specification completeness.

### Hybrid
Script generates evidence; model interprets it.

The eventual Task Characterizer should minimize expensive semantic classification where deterministic signals suffice.

---

# 21. Cold-start implementation

The first implementation will have little local data.

Design a bootstrap characterization method using:

- deterministic repository metrics;
- structured LLM judgement;
- public research;
- benchmark mapping.

Record confidence for every inferred factor.

---

# 22. Learning from outcomes

After task execution, compare:

predicted task profile

against:

actual difficulty observed.

Potential observations:

- executor succeeded immediately;
- executor required repair;
- stronger model was required;
- unexpected context expansion occurred;
- benchmark prediction was wrong;
- tests failed to detect semantic defect;
- task was easier than predicted.

Use these observations to improve future factor weights.

---

# 23. Required output

Produce:

TASK-CHARACTERIZATION-RESEARCH.md

containing:

1. complete candidate-factor inventory;
2. factors rejected as useless;
3. factor definitions;
4. task taxonomy;
5. determinism model;
6. specification-quality model;
7. verification/testability model;
8. context/token model;
9. static context-estimation proposal;
10. benchmark-proximity model;
11. risk/consequence model;
12. execution-horizon model;
13. hard constraints;
14. discovered additional factors;
15. redundancy/correlation analysis;
16. interaction effects;
17. nonlinear/threshold effects;
18. target variables each factor predicts;
19. proposed factor-weight methodology;
20. confidence model;
21. deterministic vs semantic measurements;
22. MVP task-profile schema;
23. validation experiment;
24. missing evidence;
25. technical debt.

---

# 24. Final table

Every investigated factor must appear in a final table:

| Factor | Definition | Predicts | Expected influence | Evidence | Measurement cost | Automatic? | Confidence | Keep/Reject |
|---|---|---|---|---|---|---|---|---|

"Expected influence" may initially be:

VERY HIGH
HIGH
MEDIUM
LOW
UNKNOWN

Do not pretend to know numerical weights without evidence.

---

# 25. Weight-validation plan

Propose an experiment for estimating real influence.

At minimum consider:

- historical task replay;
- matched tasks across models;
- ablation analysis;
- regression/logistic modelling;
- feature importance;
- calibration error;
- out-of-sample validation.

The purpose is to eventually replace subjective weights with measured ones.

---

# 26. Final research question

The study must answer:

> What is the smallest set of task characteristics that predicts, with useful accuracy,
> which model/effort can complete a software-engineering task at acceptable quality,
> cost and time?

Prefer predictive usefulness over descriptive completeness.
```

## Что мне особенно нравится в этой конструкции

Мы перестаём пытаться создать:

```text
Difficulty = 7.3
```

и вместо этого получаем примерно:

```text
TASK PROFILE
     ↓
determinism              0.91
specification strength   0.88
verification strength    0.95
reasoning depth          0.34
ambiguity                0.18
context expected         74k
context fragmentation    0.63
execution horizon        0.71
risk                     0.52
benchmark proximity:
    SWE-Bench Pro        0.86
    Terminal-Bench       0.64
    RepoProbe            0.31
```

А дальше уже другой слой сопоставляет этот вектор с профилями моделей.

И главное — исследование должно определить не только **веса**, но и **форму влияния**. Я почти уверен, что часть факторов окажется не линейными весами, а **hard floors, multipliers и interaction terms**. Например, `benchmark proximity` логичнее использовать как множитель доверия к benchmark score, а не складывать с ambiguity или token volume в одну сумму.

Это делает будущую формулу значительно менее примитивной и, вероятно, намного экономичнее на реальных задачах.
