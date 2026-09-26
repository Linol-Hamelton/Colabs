Advisory seed; consumed by R-6; status: RESOLUTION-CLAUDE.md section 4.4

Ты работаешь с проектом **Colabs** — протоколом и инфраструктурой координации нескольких AI-агентов, которые совместно выполняют разработку, анализ, review, тестирование, сертификацию и другие задачи.

Необходимо провести максимально глубокое исследование того, какой практический эффект может дать интеграция **Google AX (Agent eXecution)** в Colabs.

Главная задача — не доказать полезность AX, а найти, проверить и количественно оценить **максимально возможное число гипотез**, при которых AX способен улучшить:

- скорость работы;
- end-to-end latency;
- throughput;
- параллелизм;
- точность работы агентов;
- качество контекста;
- воспроизводимость;
- надежность;
- отказоустойчивость;
- безопасность;
- управление состоянием;
- удобство разработчика;
- удобство оператора;
- архитектуру;
- масштабируемость;
- стоимость вычислений;
- расход токенов;
- использование CPU/RAM;
- управление моделями;
- MCP-инфраструктуру;
- skills;
- Git/workspace management;
- observability;
- debugging;
- тестирование;
- orchestration;
- council workflow;
- suspend/resume;
- автономность агентной системы.

Исследование должно быть ориентировано непосредственно на **Colabs**, а не представлять собой общий обзор AX.

---

# 1. Основной принцип

Не исходи из предположения:

> AX хорош → его нужно интегрировать.

Используй:

`measure → understand → hypothesize → prototype → benchmark → compare → decide`

Для каждой гипотезы ответь:

1. Как Colabs работает сейчас?
2. Где конкретный bottleneck или архитектурная проблема?
3. Что именно AX изменяет?
4. Почему это потенциально улучшает систему?
5. Как измерить эффект?
6. Какова цена интеграции?
7. Каковы риски?
8. Есть ли более простое решение без AX?
9. Может ли собственная реализация Colabs быть лучше?
10. Подтверждается ли гипотеза экспериментально?

---

# 2. Сначала изучи существующий Colabs

Не проектируй AX-интеграцию до понимания текущего проекта.

Изучи:

- `AGENTS.md`
- `.ai/TASK.md`
- `.ai/PLAN.md`
- `.ai/DECISIONS.md`
- `.ai/ARCHIVE.md`
- `.ai/worklog/*`
- `.ai/bin/*`
- Claude hooks
- Codex hooks
- `protocol-manifest.json`
- validation
- handoff
- session
- lock
- archive
- gate
- review
- tests
- installer
- current performance-sensitive paths.

Определи:

- где находится orchestration;
- где хранится state;
- как устроены handoff;
- как определяется owner;
- как агенты получают context;
- где используются Git operations;
- как выполняются tests;
- какие действия происходят при каждом agent turn;
- какие операции выполняются один раз;
- какие операции выполняются десятки раз за session.

---

# 3. Построй текущую архитектурную модель

Представь текущий Colabs примерно как набор слоев:

```text
AI agents
    ↓
product hooks / CLI
    ↓
Colabs protocol
    ↓
Git / filesystem / worklogs
    ↓
Node / PowerShell / external processes
```

Уточни реальную архитектуру по исходному коду.

Затем отдельно покажи:

- control plane;
- data plane;
- execution plane;
- state plane;
- security plane.

Определи, какие из этих частей сейчас смешаны между собой.

---

# 4. Построй модель AX

Разбери роль четырех основных primitives:

```text
Task
Workspace
Gateway
Model
```

Дополнительно исследуй:

```text
suspend
resume
watch
apply
get
describe
delete
sandbox
resource limits
state persistence
task hierarchy
runner
agent substrate
gRPC/control API
```

Для каждого primitive ответь:

> Какую существующую подсистему Colabs он может заменить, дополнить или сделать ненужной?

---

# 5. Найди правильную границу между Colabs и AX

Исследуй разные архитектуры.

## Architecture A

```text
Colabs
↓
AX CLI
```

Colabs вызывает `ax` как внешний CLI.

---

## Architecture B

```text
Rust Colabs Core
↓
AX gRPC API
↓
AX
```

---

## Architecture C

```text
Colabs control plane
↓
AX
↓
Colabs agent runtime inside Task
```

---

## Architecture D

```text
Colabs
↓
custom AX runner
```

---

## Architecture E

```text
Colabs + AX default runner
```

---

## Architecture F

```text
persistent Colabs coordinator
+
AX execution backend
```

---

## Architecture G

AX используется только для тяжелых/недоверенных/долгоживущих задач.

---

## Architecture H

AX используется для всех агентов.

---

## Architecture I

Hybrid:

```text
local lightweight agents
+
remote AX workers
```

Не ограничивайся этими вариантами.

Найди дополнительные архитектуры.

---

# 6. Исследуй влияние AX на скорость

Проверь максимальное число гипотез.

## A. Process startup

Может ли AX уменьшить стоимость постоянного запуска:

```text
node
powershell
bash
agent CLI
MCP servers
```

через persistent Workspace или Task?

---

## B. Persistent environments

Если агенту не нужно каждый раз:

- clone repo;
- npm install;
- cargo build;
- запускать MCP;
- загружать skills;
- создавать environment,

сколько времени можно экономить?

---

## C. Suspend / Resume

Исследуй сценарий:

```text
agent works
↓
waiting for review
↓
suspend
↓
resume
```

Сравни с:

```text
kill
↓
restart
↓
reload context
↓
reinitialize workspace
```

Измерь:

- resume latency;
- token savings;
- context reconstruction savings;
- environment initialization savings.

---

## D. Parallel agent execution

Сейчас workflow может быть:

```text
Architect
↓
Coder
↓
Reviewer
↓
Tester
```

Проверь возможность DAG:

```text
        Coder
       /     \
Reviewer     Tester
       \     /
       Certifier
```

Оцени реальный end-to-end speedup.

---

## E. Speculative execution

Исследуй возможность запускать несколько гипотез одновременно:

```text
Implementation A
Implementation B
Implementation C
```

а затем:

```text
Reviewer → выбрать/объединить
```

Определи:

- когда это ускоряет работу;
- когда увеличивает стоимость;
- когда улучшает качество.

---

## F. Prewarming

Можно ли заранее держать:

- Workspace;
- MCP;
- compiler cache;
- dependencies;
- model configuration;

готовыми к следующей задаче?

---

## G. Workspace caching

Исследуй:

```text
cold workspace
warm workspace
suspended workspace
shared template workspace
```

---

## H. Build cache

Рассмотри:

- Cargo cache;
- npm cache;
- compilation artifacts;
- test fixtures;
- repository objects.

---

## I. Distributed execution

Проверь:

```text
agent A → worker 1
agent B → worker 2
agent C → worker 3
```

вместо конкуренции за CPU/RAM одной машины.

---

# 7. Точность и качество работы агентов

Это один из главных блоков.

Проверь, может ли AX повысить качество не напрямую через модель, а через **стабильность execution environment**.

## A. Deterministic Workspace

Одинаковое окружение для каждого запуска:

```text
same repo
same dependencies
same tools
same MCP
same skills
same config
```

Может ли это снизить вариативность ответов и ошибок?

---

## B. Context integrity

Проверь возможность гарантировать:

```text
Agent receives exactly:
- required repository state
- required TASK
- required PLAN
- required decisions
- correct tools
```

и ничего случайно устаревшего.

---

## C. Environment isolation

Может ли отдельный sandbox уменьшить ситуации:

```text
Agent B видит изменения Agent A,
которые ещё не прошли handoff/review.
```

---

## D. Controlled context sharing

Сравни:

```text
shared workspace
```

с:

```text
isolated workspaces + explicit handoff
```

Для accuracy и protocol guarantees.

---

## E. Role-specific Workspace

Например:

```text
Architect:
docs + graph + source

Coder:
source + compiler + tests

Reviewer:
diff + full source + static analysis

Tester:
binary + test tools

Certifier:
evidence + tests + policies
```

Может ли это уменьшить noise в context?

---

# 8. Model primitive

Исследуй возможности централизованного routing моделей.

Например:

```text
architecture → strong reasoning model
code → coding model
review → independent model
simple validation → cheap model
```

Проверь гипотезы:

- automatic model routing;
- fallback;
- different models per role;
- cross-provider review;
- model isolation;
- budget-aware routing;
- complexity-aware routing.

---

# 9. Динамический выбор модели

Проверь возможность:

```text
simple task → cheap/fast model
medium → stronger model
critical → strongest model
```

Разработай возможный classifier сложности.

Оцени:

```text
quality
latency
cost
```

---

# 10. Multi-model consensus

AX может запускать несколько Tasks.

Исследуй:

```text
Claude
Codex
Gemini
Qwen
```

решают одну задачу независимо.

Затем:

```text
judge / council
```

сравнивает результаты.

Определи:

- когда это повышает accuracy;
- насколько;
- сколько стоит;
- можно ли включать consensus только для high-risk tasks.

---

# 11. Workspace как механизм MCP

Исследуй возможность сделать Workspace декларативным описанием:

```text
repo
MCP
skills
dependencies
environment
```

Для каждого проекта Colabs сможет создавать профиль.

Пример:

```text
Web project
→ Playwright MCP
→ browser MCP
→ frontend skills

Rust
→ cargo
→ Rust analyzer
→ benchmark tools

Mobile
→ Android tooling
```

Исследуй автоматический подбор Workspace по проекту.

---

# 12. MCP lifecycle

Проверь, может ли AX решить проблемы:

- startup MCP;
- restart MCP;
- shared MCP;
- per-agent MCP;
- dead MCP;
- MCP resource limits;
- version management.

---

# 13. Skills lifecycle

Исследуй:

- automatic skill provisioning;
- role-specific skills;
- project-specific skills;
- skill versioning;
- reproducibility.

---

# 14. Gateway и безопасность

Проверь Gateway как механизм:

```text
default deny
+
explicit allowlist
```

Для каждого role.

Например:

```text
Coder
→ GitHub
→ npm
→ docs

Reviewer
→ read-only Git
→ docs

Tester
→ no external internet
```

Исследуй:

- снижение blast radius;
- credential protection;
- prompt-injection mitigation;
- supply-chain security;
- exfiltration prevention.

---

# 15. Least privilege agents

Разработай permissions matrix.

Пример:

```text
Architect:
read repo
no write

Coder:
write branch
no merge

Reviewer:
read
comment

Certifier:
read
execute tests
no source modification
```

Проверь, может ли AX enforce часть этих ограничений технически.

---

# 16. Resource isolation

Исследуй:

```text
CPU
RAM
disk
network
```

limits per agent.

Проверь:

- runaway agents;
- compiler overload;
- memory leak;
- fork bomb;
- test explosion.

---

# 17. Parallelism without interference

Одна из ключевых гипотез:

AX позволяет:

```text
Agent A
Agent B
Agent C
```

работать параллельно в отдельных sandboxes.

Исследуй, насколько это может ускорить council.

---

# 18. Git architecture

Рассмотри:

```text
one shared repo
```

против:

```text
workspace per agent
```

против:

```text
worktree per agent
```

против:

```text
branch per Task
```

против:

```text
ephemeral clone
```

Найди оптимальный вариант.

---

# 19. Automatic branch management

Проверь возможность:

```text
AX Task created
↓
Colabs creates branch/worktree
↓
agent works
↓
review
↓
merge
↓
workspace deleted
```

---

# 20. Conflict avoidance

Оцени, насколько отдельные Workspaces снижают:

- file conflicts;
- shared-state corruption;
- lock contention;
- accidental overwrites.

---

# 21. Handoff redesign

Исследуй новый handoff:

```text
Task A output
+
Git commit/diff
+
evidence
+
workspace metadata
+
model metadata
+
test metadata
↓
Task B
```

Может ли handoff стать более машинно-проверяемым?

---

# 22. State machine

Попробуй представить council как state machine:

```text
PLANNED
↓
RUNNING
↓
WAITING_REVIEW
↓
CHANGES_REQUESTED
↓
RUNNING
↓
APPROVED
↓
CERTIFIED
```

Проверь, может ли AX Task lifecycle стать частью этой модели.

---

# 23. Event-driven architecture

Вместо polling:

```text
while true:
    check task
```

исследуй:

```text
watch events
→ react
```

Например:

```text
Coder finished
→ automatically launch Reviewer
```

---

# 24. DAG scheduler

Исследуй переход Colabs от линейного workflow к DAG.

Пример:

```text
            architecture
                 ↓
              coder
         ┌──────┼──────┐
         ↓      ↓      ↓
      review   tests security
         └──────┼──────┘
                ↓
            certifier
```

Оцени потенциальное ускорение.

---

# 25. Critical-path optimization

Для каждой задачи определяй critical path.

Оптимизируй не сумму времени всех агентов, а:

```text
time-to-final-result
```

---

# 26. Adaptive parallelism

Не всегда запускать N агентов.

Разработай:

```text
small task → 1 agent

medium task → coder + reviewer

large task → council

critical task → full adversarial council
```

---

# 27. Dynamic resource allocation

Проверь:

```text
light agent:
1 CPU / 1 GB

build:
8 CPU / 16 GB

test:
4 CPU / 8 GB
```

вместо одинаковых ресурсов всем.

---

# 28. Accuracy through independent environments

Отдельно проверь очень важную гипотезу:

> Independent review более независим, если reviewer не находится в той же execution context, что author.

Сделай эксперимент.

---

# 29. Reproducibility

Для каждого результата должно быть возможно сохранить:

```text
Task spec
Workspace spec
Model
Gateway
commit
inputs
outputs
environment version
```

и повторить execution.

---

# 30. Debugging

Исследуй:

```text
ax get
ax describe
ax watch
logs
events
state
```

как основу нового diagnostic layer Colabs.

---

# 31. Observability

Предложи telemetry:

```text
task startup
workspace startup
model wait
tool wait
Git operations
tokens
cost
CPU
RAM
wall time
suspend time
resume time
failure reason
retry
```

---

# 32. Distributed tracing

Добавь trace ID:

```text
User request
→ Council
→ Task
→ Agent
→ MCP
→ Git
→ Test
```

Чтобы понимать latency end-to-end.

---

# 33. Failure recovery

Смоделируй:

```text
agent crash
worker crash
model API unavailable
MCP unavailable
network failure
Git conflict
test timeout
```

И проверь, что AX может восстановить автоматически.

---

# 34. Retry strategy

Исследуй:

```text
retry same task
```

против:

```text
new fresh workspace
```

против:

```text
different model
```

---

# 35. Suspend вместо idle

Измерь, какую часть времени agents проводят в:

```text
waiting human
waiting reviewer
waiting dependency
```

Проверь экономию CPU/RAM/cost от suspend.

---

# 36. Human-in-the-loop

Проверь workflow:

```text
agent
↓
suspend
↓
human approval
↓
resume
```

---

# 37. Cost optimization

Для каждой архитектуры измерь:

```text
$/task
$/successful task
$/accepted change
$/session
```

Не только token cost.

Учитывай:

```text
CPU
RAM
VM
model
network
storage
idle time
```

---

# 38. Token optimization

Исследуй, может ли persistent Workspace уменьшить необходимость каждый раз объяснять:

```text
repository
tools
environment
project configuration
```

Отдельно измерь savings.

---

# 39. Context reconstruction

Сравни:

```text
restart agent + rebuild context
```

и:

```text
resume Task
```

---

# 40. Persistent agent memory

Проверь, что лучше хранить:

```text
in model context
in workspace
in Colabs state
in Git
in worklog
in AX metadata
```

Не дублировать без необходимости.

---

# 41. AX vs custom Colabs implementation

Для каждой функции AX сравни:

```text
Use AX
vs
Build ourselves
```

По:

```text
performance
complexity
maintenance
control
reliability
security
vendor lock-in
```

---

# 42. Не создавай дублирование

Если AX уже реализует:

```text
sandbox
lifecycle
workspace provisioning
resource limits
suspend/resume
```

не дублируй это в Colabs без причины.

---

# 43. Но не отдавай AX интеллект Colabs

Сохрани в Colabs:

```text
council logic
roles
reasoning workflow
handoff rules
review rules
consensus
certification
protocol guarantees
decision history
```

если эксперимент не докажет обратное.

---

# 44. Rust + AX

Отдельно исследуй целевую архитектуру:

```text
Rust Colabs Core
↓
gRPC
↓
AX
```

Проверь:

- tonic/prost;
- connection pooling;
- streaming/watch;
- async Task management;
- persistent coordinator.

---

# 45. Нужен ли colabsd после AX

Это важнейший вопрос.

Раздели возможный `colabsd` на функции:

```text
execution
state
scheduler
watcher
cache
council
sandbox
process management
```

Определи, что может забрать AX.

---

# 46. Local-first architecture

Colabs должен по возможности оставаться применимым локально.

Исследуй:

```text
Local Mode
without AX

AX Mode
with distributed execution
```

Один protocol, два execution backend.

---

# 47. Backend abstraction

Рассмотри:

```text
ExecutionBackend

LocalBackend
AXBackend
future backend
```

Чтобы Colabs не был жестко привязан к AX.

---

# 48. Vendor lock-in

Определи все места, где AX начинает проникать в core protocol.

Минимизируй их.

---

# 49. Graceful degradation

Если AX недоступен:

```text
AX backend unavailable
↓
local backend
```

где это возможно.

---

# 50. Benchmark matrix

Обязательно протестируй несколько сценариев.

## Scenario 1

Один маленький bug fix.

## Scenario 2

Большой refactoring.

## Scenario 3

Architecture task.

## Scenario 4

Parallel review + testing.

## Scenario 5

10 agents.

## Scenario 6

50 agents.

## Scenario 7

Agent suspended на несколько часов.

## Scenario 8

Failure/recovery.

---

# 51. Baseline

Для каждого сценария сначала измерь Colabs без AX.

Например:

```text
Total time
Agent active time
Idle
Environment setup
Tool startup
Tests
Review
Tokens
CPU
RAM
Cost
Failures
Retries
```

---

# 52. AX benchmark

После интеграции сравни те же показатели.

---

# 53. Главный KPI

Не requests/sec.

Главный показатель:

```text
Time To Correct Certified Result
```

то есть:

> время от постановки задачи до корректного, проверенного и сертифицированного результата.

---

# 54. Дополнительные KPI

Измерь:

```text
TTCR — time to correct result
TTFC — time to first code
TTFR — time to first review
TTFV — time to final validation
```

Также:

```text
successful tasks %
retry %
human intervention %
regression %
failed review %
```

---

# 55. Quality benchmark

Создай набор задач с известными ожидаемыми результатами.

Сравни:

```text
Colabs baseline
vs
Colabs + AX
```

по:

```text
correctness
tests passed
review findings
regressions
iterations required
```

---

# 56. Hypothesis registry

Для каждой гипотезы используй формат:

```text
HYPOTHESIS AX-001

Name:

Category:
performance / accuracy / UX / architecture / security / cost / reliability

Current behavior:

Proposed AX mechanism:

Why it may help:

AX primitive:
Task / Workspace / Gateway / Model / Suspend / Other

Expected effect:

Measurement:

Implementation effort:
LOW / MEDIUM / HIGH

Architecture impact:
LOW / MEDIUM / HIGH

Risk:
LOW / MEDIUM / HIGH

Vendor lock-in:
LOW / MEDIUM / HIGH

Prototype:
YES / NO

Baseline:

AX result:

Measured improvement:

Conclusion:
CONFIRMED
PARTIALLY CONFIRMED
REJECTED
UNKNOWN
```

---

# 57. Не ограничивай число гипотез

Не останавливайся на первых 10–20 идеях.

После исследования кода проведи отдельный brainstorming:

> Какие дополнительные преимущества может дать наличие декларативного agent control plane, которого раньше у Colabs не было?

---

# 58. Ищи emergent opportunities

То есть преимущества, которые появляются не из отдельной функции AX, а из комбинации:

```text
Task
+
Workspace
+
Gateway
+
Model
+
Suspend
+
parallel execution
```

Например:

```text
ephemeral adversarial council
```

создающийся только для critical задач и удаляющийся после consensus.

---

# 59. Исследуй новые workflow

Не пытайся только ускорить существующий Colabs.

AX может позволить workflow, которые раньше были слишком сложны.

Например:

```text
N independent coders
↓
M reviewers
↓
automated tests
↓
judge
```

---

# 60. Agent swarm

Исследуй ограниченно и экспериментально:

```text
5
10
25
50
```

agents.

Определи точку diminishing returns.

---

# 61. Hierarchical agents

Проверь:

```text
Lead Architect
├── Backend architect
├── Frontend architect
└── Security architect
```

и аналогичные деревья.

---

# 62. Supervisor agents

Исследуй агента, управляющего другими Tasks через Colabs/AX.

---

# 63. Dynamic council

Council composition может зависеть от задачи.

Например:

```text
database change
→ DB expert

UI
→ UI reviewer

security
→ security agent
```

---

# 64. Automatic Workspace construction

Проверь pipeline:

```text
analyze repo
↓
detect stack
↓
select MCP
↓
select skills
↓
select tools
↓
create Workspace
```

---

# 65. Automatic Model routing

Аналогично:

```text
analyze task
↓
estimate complexity
↓
assign model
```

---

# 66. Automatic resource routing

```text
analyze workload
↓
CPU/RAM allocation
```

---

# 67. Policy as code

Рассмотри декларативные policy:

```text
Coder cannot merge
Reviewer cannot edit implementation
External network denied by default
Critical tasks require independent review
```

---

# 68. Architecture target

После исследований предложи минимум три целевых архитектуры:

## Conservative

Минимальная интеграция AX.

## Balanced

AX как execution backend, Colabs как brain.

## Aggressive

Полностью distributed AX-backed council.

---

# 69. Для каждой architecture рассчитай

```text
performance
accuracy
cost
complexity
maintenance
security
UX
lock-in
migration effort
```

---

# 70. Migration roadmap

Не делать big bang.

Пример:

```text
Phase 0
Instrumentation

Phase 1
AX experiment with one isolated Task

Phase 2
Workspace

Phase 3
Gateway

Phase 4
Model routing

Phase 5
parallel Tasks

Phase 6
suspend/resume

Phase 7
Rust AX backend

Phase 8
distributed council
```

Но сформируй реальный roadmap после анализа.

---

# 71. A/B testing

По возможности запускай:

```text
same task
same model
same repository
```

через:

```text
current Colabs
```

и:

```text
Colabs + AX
```

Сравни результаты.

---

# 72. Изолируй переменные

Если одновременно:

```text
Rust rewrite
+
AX
+
cache
+
new model
```

ускорили систему, невозможно понять вклад AX.

Поэтому делай controlled experiments.

---

# 73. Synergy experiments

После isolated experiments протестируй комбинации:

```text
AX + Rust
AX + cache
AX + DAG
AX + persistent state
AX + dynamic routing
```

---

# 74. Рассчитай cumulative effect

Например:

```text
Current session:

environment setup      40 s
agent starts           30 s
sequential workflow   300 s
context rebuild       100 s
idle resources        high

TOTAL                 470 s
```

После:

```text
warm workspace          5 s
resume                   2 s
parallel workflow      110 s
persistent state        10 s

TOTAL                  127 s
```

Важен общий эффект, а не отдельный microbenchmark.

---

# 75. Скорость против качества

Некоторые AX-подходы могут:

```text
ускорить ×3
```

но немного снизить accuracy.

Другие:

```text
замедлить ×1.3
```

но увеличить correctness.

Покажи Pareto frontier:

```text
speed
quality
cost
```

---

# 76. Финальная таблица гипотез

Отсортируй по:

```text
Measured Value =
(speed benefit
+ quality benefit
+ reliability benefit
+ UX benefit
+ architecture benefit)
× frequency
× confidence
/
(cost + complexity + risk + lock-in)
```

Не используй субъективные баллы там, где существуют реальные измерения.

---

# 77. Финальный вывод

В конце ответь на вопросы:

1. Нужен ли AX Colabs вообще?
2. Для каких задач он особенно полезен?
3. Для каких задач бесполезен?
4. Что AX должен заменить?
5. Что AX не должен заменять?
6. Что оставить в Rust Colabs Core?
7. Нужен ли `colabsd`?
8. Нужен ли Node?
9. Нужен ли PowerShell?
10. Какая роль остается Git?
11. Какая роль остается MCP?
12. Как должен выглядеть Workspace?
13. Как должен работать Model routing?
14. Как должен работать Gateway?
15. Когда использовать suspend/resume?
16. Когда запускать агентов параллельно?
17. Где speculative execution оправдан?
18. Как минимизировать AX vendor lock-in?

---

# 78. Требуемый финальный отчет

Предоставь:

## A. Current architecture

## B. Current bottlenecks

## C. AX capability map

## D. AX ↔ Colabs responsibility matrix

## E. Hypothesis registry

Желательно **50+ гипотез**, если код и архитектура позволяют найти столько содержательных вариантов.

Не создавай искусственные гипотезы ради числа.

## F. Benchmarks

BEFORE / AFTER.

## G. Rejected hypotheses

Это обязательно.

## H. Synergy matrix

Например:

```text
AX + Rust
AX + DAG
AX + cache
AX + watcher
AX + model routing
AX + MCP
```

## I. Target architecture

## J. Migration roadmap

## K. Risks

## L. Vendor lock-in strategy

## M. Conservative / Realistic / Aggressive forecast

---

# 79. Главное ограничение

Не проектируй систему вокруг AX только потому, что AX существует.

Правильный результат исследования может быть:

```text
Use AX heavily
```

или:

```text
Use AX only for sandbox execution
```

или:

```text
AX currently adds insufficient value
```

Все три результата допустимы.

---

# 80. Главная цель исследования

Нужно найти ответ не на вопрос:

> «Как подключить AX к Colabs?»

а на вопрос:

> **«Какая архитектура Colabs + AX обеспечивает максимальный выигрыш в скорости получения корректного результата, точности работы агентов, удобстве, безопасности, стоимости, масштабируемости и архитектурной чистоте — и какие функции AX действительно дают этот выигрыш?»**

Каждый существенный вывод должен быть подтвержден:

```text
кодом
или
архитектурным анализом
или
экспериментом
или
benchmark
```

а не только предположением.
