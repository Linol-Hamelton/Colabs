
Ты работаешь с проектом **Colabs** — системой координации нескольких AI-агентов, включающей protocol state, task management, handoff, council workflow, review, certification, worklogs, Git state, validation, context preparation и другие механизмы совместной работы AI-моделей.

Необходимо провести максимально глубокое исследование следующей гипотезы:

> Что даст превращение Colabs — полностью или частично — в MCP Server или набор MCP Servers?

Главная задача — не подтвердить заранее, что MCP является правильным решением.

Нужно найти, проверить и количественно оценить **максимально возможное количество содержательных гипотез**, при которых MCP-архитектура способна улучшить:

- скорость;
- end-to-end latency;
- Time To Correct Certified Result;
- точность действий AI-агентов;
- качество передаваемого контекста;
- снижение hallucination/tool misuse;
- расход токенов;
- prompt-cache hit rate;
- количество subprocess;
- количество повторных чтений repository;
- удобство подключения новых моделей;
- удобство подключения новых IDE/CLI;
- developer experience;
- operator experience;
- архитектурную чистоту;
- модульность;
- composability;
- portability;
- тестируемость;
- observability;
- security;
- least privilege;
- reliability;
- отказоустойчивость;
- масштабируемость;
- distributed execution;
- integration с Google AX;
- integration с Rust Core;
- MCP lifecycle;
- skills;
- model routing;
- context routing;
- interoperability.

Исследование должно быть привязано непосредственно к **реальному исходному коду Colabs**.

---

# 1. Главный принцип

Не используй логику:

`MCP модный → завернем Colabs в MCP`.

Используй:

`baseline → bottleneck → hypothesis → prototype → benchmark → conclusion`

Для каждой гипотезы устанавливай:

```text
Current mechanism
↓
MCP alternative
↓
Expected benefit
↓
Expected cost
↓
Prototype
↓
Measurement
↓
Decision
```

Не считай MCP автоматически более быстрым.

MCP может:

- убрать лишние слои;
- либо добавить JSON-RPC/transport overhead.

Это нужно измерить.

---

# 2. Сначала исследуй существующий Colabs

Изучи минимум:

```text
AGENTS.md

.ai/TASK.md
.ai/PLAN.md
.ai/DECISIONS.md
.ai/ARCHIVE.md
.ai/worklog/*

.ai/bin/protocol.cjs
.ai/bin/protocol-hooks.cjs
.ai/bin/protocol-session.cjs
.ai/bin/protocol-handoff.cjs
.ai/bin/protocol-lock.cjs
.ai/bin/protocol-archive.cjs

validate-protocol.ps1
setup-ai-protocol.ps1
test-protocol.ps1

protocol-manifest.json

Claude hooks
Codex hooks
tests/*
```

Построй текущий call graph.

Например:

```text
AI Client
↓
product-specific hook
↓
Node
↓
PowerShell
↓
Git
↓
filesystem
↓
worklog
↓
Node
```

Выясни точную реальную цепочку.

---

# 3. Измерь baseline

Для основных команд измерь:

```text
startup time
process spawning
Git time
filesystem
hashing
parsing
validation
context generation
model/tool interaction
tests
```

Особенно:

```text
SessionStart
SessionStop
handoff
snapshot
gate
validate
status
doctor
archive
review
certification
```

Измерь:

```text
cold
warm
small repo
large repo
clean repo
dirty repo
single agent
multiple agents
```

---

# 4. Построй текущую integration matrix

Для каждого клиента:

```text
Codex
Claude
Gemini
other CLI
IDE
future agents
```

зафиксируй:

```text
integration code
hooks
config
commands
duplicated logic
limitations
```

Главный вопрос:

> Сколько product-specific glue сейчас приходится поддерживать?

---

# 5. Построй MCP capability map

Рассмотри отдельно:

```text
Tools
Resources
Prompts
Tasks
Skills
Elicitation
Sampling
Roots
Subscriptions / notifications
Progress
Cancellation
Logging
Completion
Authorization
Extensions
structured outputs
resource links
```

Для каждого механизма MCP найди возможное применение в Colabs.

Не используй feature, если он не дает практической пользы.

---

# 6. Ключевой архитектурный вопрос

Исследуй минимум следующие варианты.

## A. Один большой MCP Server

```text
colabs-mcp
```

содержит всё.

---

## B. Несколько специализированных серверов

```text
colabs-core-mcp
colabs-git-mcp
colabs-context-mcp
colabs-council-mcp
colabs-validation-mcp
```

---

## C. Rust Core + MCP facade

```text
AI Client
↓
MCP
↓
thin MCP layer
↓
Rust Colabs Core
```

---

## D. MCP Server как основной runtime

```text
AI Clients
↓
MCP
↓
Colabs MCP Server
↓
Git/filesystem/state
```

---

## E. MCP только как compatibility layer

```text
AI Client
↓
MCP
↓
existing Colabs CLI
```

---

## F. Embedded MCP Server

MCP работает внутри persistent `colabsd`.

---

## G. Remote MCP Server

Colabs работает как сетевой сервис.

---

## H. Local stdio MCP

Каждый client запускает локальный server process.

---

## I. Hybrid

```text
local MCP facade
↓
remote Colabs coordinator
```

---

## J. MCP + Google AX

```text
AI Client
↓
Colabs MCP
↓
Rust Colabs Core
↓
AX execution backend
```

---

Не ограничивайся этим списком.

Найди дополнительные архитектуры.

---

# 7. Tools — исследуй правильную tool surface

Не делай механически:

```text
каждая CLI command = MCP tool
```

Проверь несколько уровней abstraction.

## Low-level tools

```text
git_status
read_worklog
hash_file
validate_entry
```

## Mid-level tools

```text
colabs_status
colabs_handoff
colabs_validate
colabs_snapshot
```

## Intent-level tools

```text
prepare_handoff
start_review
certify_task
begin_agent_session
complete_agent_session
```

Сравни:

```text
tool count
model accuracy
tool selection errors
token overhead
latency
```

Определи оптимальную granularity.

---

# 8. Tool count hypothesis

Проверь:

```text
10 tools
25 tools
50 tools
100 tools
```

Как количество tools влияет на:

```text
model tool selection
prompt size
prompt cache
hallucination
latency
```

Найди practical limit.

---

# 9. Dynamic tool exposure

Исследуй возможность показывать агенту только tools, relevant для его роли.

Например:

```text
Architect:
read
analyze
plan

Coder:
edit
build
test

Reviewer:
diff
inspect
report

Certifier:
validate
verify
certify
```

Измерь:

```text
tool-selection accuracy
tokens
wrong calls
```

---

# 10. Typed input schemas

Исследуй, уменьшает ли JSON Schema ошибки вида:

```text
wrong path
wrong owner
wrong mode
missing parameter
invalid state
```

по сравнению с CLI parsing и natural-language commands.

---

# 11. Structured outputs

Где возможно, возвращай:

```text
structuredContent
```

вместо длинного текста.

Например:

```json
{
  "status": "dirty",
  "changedFiles": 12,
  "handoffReady": false,
  "blockingIssues": [...]
}
```

Сравни точность модели при structured vs textual output.

---

# 12. Tool result size

Измерь влияние размера tool result:

```text
1 KB
10 KB
100 KB
1 MB
```

на:

```text
latency
tokens
accuracy
context pollution
```

---

# 13. Resources вместо tool output

Проверь архитектуру:

```text
tool:
find relevant worklog

result:
resource URI
```

вместо передачи полного документа.

Например:

```text
colabs://task/current
colabs://plan/current
colabs://decision/DEC-0015
colabs://worklog/codex/latest
colabs://repo/status
```

---

# 14. Resource architecture

Определи URI space Colabs.

Например:

```text
colabs://task/current
colabs://plan/current
colabs://decisions/index
colabs://decision/{id}
colabs://worklog/{agent}
colabs://worklog/{agent}/latest
colabs://session/{id}
colabs://snapshot/{id}
colabs://review/{id}
colabs://evidence/{id}
colabs://repository/status
```

Не принимай эту схему автоматически — исследуй оптимальную.

---

# 15. Lazy context loading

Проверь переход:

```text
inject everything
```

к:

```text
give index
↓
model fetches only needed resource
```

Измерь:

```text
tokens
latency
correctness
context completeness
```

---

# 16. Context precision

Проверь гипотезу:

> MCP Resources позволяют передавать модели меньше, но более релевантного контекста.

Измерь accuracy на задачах с:

```text
full context
vs
selected resources
```

---

# 17. Context contamination

Проверь, уменьшается ли количество ошибок от:

```text
old worklogs
obsolete decisions
irrelevant files
stale status
```

если контекст предоставляется через explicit resources.

---

# 18. Resource annotations

Исследуй применение metadata:

```text
audience
priority
lastModified
```

для context ranking.

---

# 19. Context ranking

Разработай ranking:

```text
TASK        priority 1.0
current PLAN 0.95
relevant decision 0.9
latest worklog 0.85
archive 0.2
```

Проверь влияние.

---

# 20. Resource search

Проверь создание MCP tool/resource search:

```text
search_protocol_context(query)
```

который возвращает только релевантные URI.

---

# 21. Repository search

Исследуй:

```text
search → resource links
```

вместо:

```text
search → huge text
```

---

# 22. Incremental resources

Если файл не менялся:

```text
не перечитывать
не пересылать
не перепарсивать
```

Проверь использование:

```text
mtime
hash
Git blob ID
cache
```

---

# 23. MCP cache hints

Используй возможности текущей MCP specification для явного caching.

Исследуй:

```text
ttlMs
cacheScope
```

для:

```text
tools/list
resources/list
resources/read
prompts/list
```

Определи разумные TTL.

---

# 24. Tool-list prompt caching

Проверь, насколько стабильный детерминированный порядок tools улучшает prompt-cache hit rate клиента.

Не меняй tool order без причины.

Измерь:

```text
cached input %
latency
token cost
```

---

# 25. MCP statelessness

Актуальный MCP core является stateless.

Не пытайся хранить неявное состояние соединения.

Исследуй explicit handles:

```text
session_id
task_id
snapshot_id
handoff_id
workspace_id
```

которые server создает и клиент передает последующим вызовам.

---

# 26. Explicit state handles

Сравни:

```text
implicit global current session
```

и:

```text
explicit session handle
```

по:

```text
correctness
parallelism
debugging
multi-agent safety
```

---

# 27. Persistent Colabs process

Проверь возможность:

```text
MCP server starts once
↓
serves hundreds of calls
```

вместо:

```text
spawn Node
spawn PowerShell
spawn script
exit
```

Измерь startup savings.

---

# 28. Process elimination

Подсчитай текущие:

```text
node.exe
powershell.exe
git.exe
bash.exe
```

per task/session.

После MCP architecture посчитай снова.

---

# 29. Rust MCP Server

Отдельно исследуй:

```text
Rust Colabs Core
+
native MCP Server
```

Преимущества могут включать:

```text
startup
memory
concurrency
filesystem
hashing
serialization
single binary
```

Но каждое преимущество измеряй.

---

# 30. MCP transport comparison

Сравни:

```text
stdio
Streamable HTTP
local socket/proxy if architecture permits
```

по:

```text
startup
latency
throughput
deployment
security
debugging
```

---

# 31. Local MCP vs Remote MCP

Проверь:

```text
local server
```

и:

```text
central remote server
```

для Colabs.

---

# 32. Remote shared state

Может ли remote MCP server стать единым источником:

```text
task state
council state
agent state
handoff state
```

для нескольких машин?

---

# 33. Multi-client concurrency

Смоделируй:

```text
Claude
Codex
Gemini
```

одновременно подключены к Colabs MCP.

Проверь:

```text
race conditions
locking
state isolation
throughput
```

---

# 34. Agent identity

Определи безопасный способ идентифицировать:

```text
agent
role
task
workspace
```

в MCP calls.

Не доверяй произвольному `agent="reviewer"` без authorization model.

---

# 35. Authorization

Исследуй scopes:

```text
colabs.read
colabs.write
colabs.review
colabs.certify
colabs.admin
```

---

# 36. Role-specific authorization

Например:

```text
Coder:
read
write
test

Reviewer:
read
review
NO implementation write

Certifier:
read
validate
certify
NO source modification
```

---

# 37. Least privilege tools

Проверь, может ли MCP authorization ограничивать tool visibility и calls по role.

---

# 38. Tool safety annotations

Используй tool metadata/annotations только как hint.

Security enforcement должен происходить на server side.

---

# 39. Human confirmation

Раздели tools:

```text
safe read-only
```

и:

```text
destructive / irreversible
```

Для вторых исследуй human approval.

---

# 40. Prompts

Проверь MCP Prompts как механизм стандартизации:

```text
start-task
review-change
prepare-handoff
adversarial-review
certify
investigate-failure
```

---

# 41. Prompt duplication

Найди одинаковые инструкции, которые сейчас существуют в:

```text
AGENTS.md
Claude config
Codex config
scripts
docs
```

Проверь возможность убрать duplication.

---

# 42. Prompt versioning

Сделай prompts versioned.

Измерь возможность воспроизводить:

```text
какая инструкция использовалась при конкретном review
```

---

# 43. Role-specific prompts

Проверь:

```text
architect prompt
coder prompt
reviewer prompt
certifier prompt
```

через MCP discovery.

---

# 44. Prompt accuracy experiment

Сравни:

```text
long generic AGENTS instructions
```

с:

```text
short role-specific MCP prompt
+
relevant resources
```

---

# 45. Skills over MCP

Исследуй возможность распространять Colabs Skills через MCP.

Например:

```text
code-review skill
architecture skill
testing skill
certification skill
security-review skill
```

---

# 46. Dynamic skills

Проверь:

```text
detect project
↓
select skills
↓
expose to agent
```

---

# 47. Project-specific skills

Например:

```text
Next.js project
Rust project
mobile project
database project
```

получают разные skill sets.

---

# 48. MCP as universal adapter

Исследуй ключевую гипотезу:

> Если AI client поддерживает MCP, Colabs больше не должен писать отдельную глубокую integration для каждого AI продукта.

Измерь:

```text
lines of glue
config complexity
maintenance effort
```

---

# 49. Integration matrix after MCP

Сравни:

```text
BEFORE

Claude adapter
Codex adapter
Gemini adapter
Qwen adapter
...
```

с:

```text
AFTER

MCP interface
    ↓
all compatible clients
```

---

# 50. Remaining product-specific adapters

Определи, что всё равно останется platform-specific.

Не заявляй portability там, где конкретный MCP client не поддерживает нужную capability.

---

# 51. Capability negotiation

Colabs MCP должен определять возможности клиента.

Например:

```text
supports tools
supports resources
supports tasks
supports skills
supports sampling
supports elicitation
```

И адаптировать поведение.

---

# 52. Graceful degradation

Если client поддерживает только tools:

```text
resources unavailable
↓
tool fallback
```

Если Tasks unavailable:

```text
synchronous / polling fallback
```

---

# 53. Tasks extension

Исследуй MCP Tasks для долгих операций:

```text
full validation
large repository analysis
test suite
benchmark
AX job
multi-agent council
```

---

# 54. Long-running operations

Вместо:

```text
tool call waits 60 seconds
```

проверь:

```text
start task
↓
task handle
↓
progress
↓
result
```

---

# 55. Cancellation

Проверь возможность остановить:

```text
test suite
benchmark
large scan
agent task
```

если результат больше не нужен.

---

# 56. Progress

Для долгих операций возвращай progress:

```text
files scanned
tests passed
validators completed
agents finished
```

Проверь UX.

---

# 57. Mid-flight input

Исследуй сценарии, где долгий task требует:

```text
human clarification
approval
additional input
```

---

# 58. Sampling

Исследуй возможность MCP Server запрашивать model reasoning у host через sampling там, где это поддерживается.

Не использовать автоматически.

---

# 59. Server-side orchestration

Проверь:

```text
MCP call
↓
Colabs decides that another model is needed
↓
sampling / AX / model backend
```

---

# 60. Avoid recursive complexity

Исследуй риск:

```text
model → MCP → model → MCP → model
```

и способы ограничения depth/cost.

---

# 61. Elicitation

Проверь использование elicitation для ситуаций:

```text
missing task scope
human approval
choice between destructive options
```

---

# 62. Roots

Исследуй использование roots для явного ограничения repository/workspace, доступного Colabs.

---

# 63. Repository isolation

MCP Server не должен случайно работать с repository вне разрешенного root.

---

# 64. Tool context reduction

Сравни:

```text
model получает инструкции как выполнить Git command
```

и:

```text
model вызывает semantic tool
```

Например:

```text
prepare_handoff()
```

вместо знания деталей:

```text
node .ai/bin/protocol-handoff.cjs ...
```

---

# 65. Semantic API hypothesis

Проверь, повышает ли accuracy API уровня intent:

```text
certify_current_task
```

по сравнению с API уровня implementation:

```text
run_script(path,args)
```

---

# 66. Protocol invariants inside server

Перенеси сложность:

```text
hash chain
lock
owner checks
evidence validation
```

из prompt instructions в deterministic MCP server.

Проверь эффект на accuracy.

---

# 67. Reduce model responsibility

Основная гипотеза:

> Модель должна принимать смысловые решения, а не помнить protocol mechanics.

Выяви все protocol mechanics, которые можно сделать deterministic.

---

# 68. Error prevention

Измерь количество ошибок до/после MCP:

```text
forgot handoff
wrong command
wrong path
wrong journal
wrong owner
missing evidence
invalid status
```

---

# 69. Self-describing errors

MCP errors должны быть actionable.

Например:

```text
HANDOFF_NOT_READY

reason:
missing independent review

possible next action:
start_review
```

---

# 70. Machine-readable error taxonomy

Создай стабильные error codes.

Не заставляй модель парсить случайный stderr.

---

# 71. Recovery hints

Tool error может возвращать:

```text
canRetry
requiredAction
relatedResource
```

---

# 72. Tool chaining

Исследуй, какие последовательности tools повторяются постоянно.

Например:

```text
status
↓
validate
↓
handoff
```

Стоит ли создать composite tool?

---

# 73. Composite tools

Сравни:

```text
3 tool calls
```

с:

```text
prepare_handoff
```

по:

```text
latency
tokens
accuracy
observability
```

---

# 74. Avoid over-composition

Слишком умные tools могут скрыть важные decisions.

Найди правильную границу.

---

# 75. Batching

Проверь:

```text
read N resources
```

в одном request вместо N round trips там, где протокол/implementation это позволяет.

---

# 76. Git batching behind MCP

AI больше не должен делать:

```text
git status
git diff
git log
git show
```

по отдельности, если server может построить один repository snapshot.

---

# 77. One snapshot per logical operation

Проверь:

```text
snapshot once
↓
reuse across status/validation/handoff
```

---

# 78. Incremental snapshot engine

Свяжи MCP architecture с ранее рассматриваемой оптимизацией:

```text
Rust
+
incremental repository state
+
MCP
```

---

# 79. Filesystem watcher

Persistent MCP server может держать watcher.

Проверь:

```text
full scan every call
```

vs:

```text
watch changed paths
```

---

# 80. Warm caches

Persistent MCP server может держать:

```text
parsed TASK
parsed PLAN
decision index
worklog index
Git metadata
file fingerprints
```

в памяти.

Измерь.

---

# 81. Multi-level cache

Исследуй:

```text
L1 process memory
L2 persistent local cache
L3 distributed cache
```

---

# 82. Cache correctness

Для каждого cache укажи invalidation strategy.

Correctness protocol нельзя ослаблять.

---

# 83. Server startup

Сравни:

```text
Node MCP Server
Rust MCP Server
```

по:

```text
startup
memory
latency
binary size
developer complexity
```

---

# 84. Persistent server vs CLI

Главный benchmark:

```text
CLI spawn per operation
```

против:

```text
persistent MCP server
```

---

# 85. MCP serialization overhead

Измерь стоимость:

```text
JSON-RPC
serialization
deserialization
transport
```

чтобы понимать, где MCP может быть медленнее прямого Rust API.

---

# 86. Internal API

Не используй MCP внутри Rust Core между внутренними модулями без необходимости.

MCP — external boundary, если benchmark не докажет обратное.

---

# 87. Ports and adapters

Исследуй архитектуру:

```text
           Colabs Core
               │
       Execution/Context API
       /       |         \
    CLI       MCP         AX
```

То есть:

```text
CLI adapter
MCP adapter
AX adapter
```

над одним Core.

---

# 88. MCP must not own domain logic

Domain logic:

```text
handoff rules
review rules
certification
council
```

должна жить в Core, а не в transport layer.

---

# 89. AX + MCP

Исследуй разделение:

```text
MCP
= interface for agents

AX
= execution control plane

Rust Core
= protocol intelligence
```

---

# 90. AX as MCP tools

Например:

```text
start_agent_task
suspend_agent
resume_agent
get_agent_status
```

---

# 91. AX as Resources

Например:

```text
colabs://ax/task/{id}
colabs://ax/workspace/{id}
```

---

# 92. Hide AX details

Проверь, лучше ли агенту видеть:

```text
start_reviewer
```

чем:

```text
ax_apply_task
```

Чтобы Colabs сохранял execution-backend abstraction.

---

# 93. Backend abstraction

Создай концепцию:

```text
ExecutionBackend

Local
AX
future
```

MCP surface не должна меняться при смене backend.

---

# 94. Local-first

Colabs MCP должен иметь возможность работать:

```text
без AX
без cloud
```

если это архитектурно оправдано.

---

# 95. MCP Gateway / proxy

Исследуй отдельный gateway между clients и несколькими Colabs-related MCP Servers.

---

# 96. Tool aggregation

Если появится много MCP Servers:

```text
Git
Colabs
Graph
Testing
AX
```

исследуй:

```text
tool collisions
discovery overhead
prompt size
```

---

# 97. Naming strategy

Создай deterministic naming:

```text
colabs.session.start
colabs.handoff.prepare
colabs.review.start
colabs.task.status
```

Сравни с короткими names.

---

# 98. Tool descriptions

Экспериментально проверь качество tool descriptions.

Слишком короткие могут снижать selection accuracy.

Слишком длинные увеличивают context.

---

# 99. Description optimization benchmark

A/B test:

```text
minimal
balanced
verbose
```

tool descriptions.

---

# 100. Deterministic discovery

Tool/resource/prompt listings должны быть стабильными.

Проверь влияние на prompt caching.

---

# 101. Observability

Добавь metrics:

```text
MCP calls
tool latency
resource latency
cache hit
Git latency
validation latency
tool errors
wrong tool retries
client
model
agent
task
```

---

# 102. OpenTelemetry

Используй trace propagation там, где это поддерживается.

Строй trace:

```text
User
↓
AI host
↓
MCP
↓
Colabs
↓
Git
↓
AX
↓
agent
↓
tests
```

---

# 103. Distributed tracing

Для каждого user task должен существовать trace ID.

---

# 104. Accuracy telemetry

Отслеживай:

```text
wrong tool calls
repeated calls
invalid args
recoverable errors
protocol violations
manual corrections
```

---

# 105. Developer UX

Сравни onboarding:

```text
install scripts
configure hooks
PowerShell
Node
paths
```

с:

```text
configure MCP server
```

---

# 106. Single binary installation

Исследуй вариант:

```text
colabs-mcp.exe
```

который запускается любым MCP host.

---

# 107. Zero Node dependency

Проверь, может ли Rust MCP Server убрать обязательный Node runtime.

---

# 108. Zero PowerShell dependency

Аналогично.

---

# 109. Cross-platform

Benchmark/setup:

```text
Windows
Linux
macOS
```

---

# 110. Configuration UX

Исследуй единый config:

```text
colabs.toml
```

или аналог.

---

# 111. Auto-discovery

Можно ли MCP Server автоматически определить repository root и protocol state безопасно?

---

# 112. Multi-repository server

Проверь:

```text
one MCP process per repo
```

vs:

```text
one MCP server handles many repos
```

---

# 113. Multi-project isolation

При shared server один project не должен видеть state другого.

---

# 114. Security boundary

Исследуй риск превращения Colabs MCP в мощный local execution server.

---

# 115. Path traversal

Проверь защиту от:

```text
../../
symlinks
junctions
reparse points
```

---

# 116. Command injection

Не предоставляй generic:

```text
run_shell(command)
```

без крайне веской причины.

---

# 117. Typed commands

Предпочитай semantic operations.

---

# 118. Secret handling

Проверь:

```text
Git credentials
model API keys
AX credentials
MCP auth
```

Никогда не возвращай secrets как tool content.

---

# 119. Remote MCP security

Исследуй:

```text
authentication
authorization
TLS
token scopes
multi-tenancy
audit
```

---

# 120. Audit log

Каждый mutating MCP call должен оставлять audit event:

```text
agent
task
tool
arguments summary
result
time
repository state
```

---

# 121. Idempotency

Определи operations, которые должны быть idempotent.

Например:

```text
ensure_session
prepare_workspace
```

---

# 122. Retry safety

Если client повторяет request после timeout:

```text
не создавать двойной handoff
не создавать двойной task
```

---

# 123. Operation IDs

Рассмотри idempotency/operation handles.

---

# 124. Concurrency control

Исследуй optimistic concurrency:

```text
expected snapshot digest
expected revision
```

---

# 125. Stale-state prevention

Tool mutating state должен иметь возможность отказать:

```text
repository changed since model inspected it
```

---

# 126. Accuracy benefit from optimistic concurrency

Проверь, уменьшает ли это операции на устаревшем контексте.

---

# 127. Resource subscriptions

Если client поддерживает notifications/subscriptions, исследуй обновления:

```text
task changed
review finished
repository changed
AX task finished
```

---

# 128. Event-driven agents

Вместо polling:

```text
status?
status?
status?
```

используй event notification там, где возможно.

---

# 129. Tool list changes

Исследуй динамическое обновление tool availability:

```text
review tools появляются только после implementation
```

Но не создавай нестабильный surface без доказанной пользы.

---

# 130. State-dependent tools

Проверь:

```text
before review:
start_review available

after certification:
start_review hidden
```

Сравни с stable list + server-side validation.

---

# 131. Prompt-cache trade-off

Dynamic tool list может ухудшать prompt caching.

Измерь.

---

# 132. MCP Apps

Исследуй, может ли интерактивный UI через MCP Apps улучшить:

```text
council state
task DAG
review findings
benchmarks
agent status
```

Используй только если конкретные MCP hosts поддерживают extension.

---

# 133. Human dashboard

Возможный UI:

```text
Tasks
Agents
Branches
Reviews
Validation
AX state
```

---

# 134. Architecture visualization

Проверь возможность визуализировать DAG и critical path.

---

# 135. Model-neutral Colabs

Главная гипотеза:

> MCP превращает Colabs из набора интеграций под конкретные AI-продукты в model-neutral infrastructure.

Проверь реальную переносимость.

---

# 136. Client compatibility matrix

Для каждого target client зафиксируй:

```text
tools
resources
prompts
tasks
skills
sampling
elicitation
authorization
```

Не предполагай полную поддержку MCP только потому, что client говорит «MCP supported».

---

# 137. Thin-client hypothesis

Проверь, может ли client-specific code сократиться до:

```text
MCP configuration
+
минимальные hooks
```

---

# 138. Hook elimination

Какие Claude/Codex hooks можно удалить после MCP?

---

# 139. Hooks that must remain

Какие lifecycle events невозможно заменить обычным MCP server interaction?

---

# 140. Hybrid hooks + MCP

Возможно оптимальный вариант:

```text
tiny lifecycle hook
↓
MCP call
```

---

# 141. Token accounting

Измерь:

```text
tool definitions tokens
resources tokens
tool results
prompt instructions
repeated protocol docs
```

BEFORE / AFTER.

---

# 142. Context budget allocation

После MCP сколько context освобождается под реальный код/задачу?

---

# 143. Prompt instruction reduction

Подсчитай, сколько deterministic mechanics можно убрать из AGENTS prompt.

---

# 144. Accuracy benchmark

Создай dataset типичных ошибок:

```text
wrong handoff
missed review
wrong agent
stale state
incorrect branch
missing evidence
invalid lock
```

Сравни current vs MCP.

---

# 145. Tool-use benchmark

Дай моделям задачи и измерь:

```text
correct first tool %
wrong tool %
invalid args %
number of calls
time to completion
```

---

# 146. Multi-model benchmark

Проверяй минимум на нескольких разных моделях.

MCP surface должен быть понятен не только одной модели.

---

# 147. Small vs strong model

Особенно проверь:

> Позволяет ли deterministic MCP API более слабой/дешевой модели выполнять protocol operations так же надежно, как сильная модель?

Это может дать большой cost benefit.

---

# 148. Model routing synergy

Если simple protocol actions становятся deterministic tools:

```text
cheap model
```

может выполнять больше работы.

---

# 149. Council architecture

Исследуй Colabs Council через MCP:

```text
create_council
assign_role
submit_position
request_review
collect_result
certify
```

---

# 150. Avoid exposing internal mechanics

Агенту необязательно знать:

```text
worklog formatting
hash syntax
archive layout
lock file path
```

если server может гарантировать contract.

---

# 151. Protocol as API

Исследуй идею:

> Markdown files остаются source of truth / human-readable representation, но MCP становится operational API Colabs.

---

# 152. API as source of truth?

Отдельно проверь альтернативу:

> MCP-backed structured state становится source of truth.

Не принимать без сильных причин.

---

# 153. Human-readable guarantees

Не потерять возможность:

```text
git clone
↓
человек читает protocol state
```

без MCP server.

---

# 154. Offline mode

Colabs должен сохранять разумную функциональность offline.

---

# 155. Failure mode: MCP unavailable

Что происходит?

```text
fail closed?
CLI fallback?
read-only?
```

---

# 156. CLI + MCP shared core

Предпочтительная гипотеза для проверки:

```text
        Rust Core
       /        \
     CLI        MCP
```

Чтобы MCP failure не делал Colabs unusable.

---

# 157. Backward compatibility

Существующие commands могут продолжать работать.

---

# 158. Migration without big bang

Не переписывать всё сразу.

---

# 159. Shadow mode

MCP server выполняет computation параллельно текущему Colabs, но не меняет state.

Сравни результаты.

---

# 160. Read-only MCP prototype

Первый prototype может предоставлять:

```text
status
task
plan
decisions
worklogs
snapshot
```

без mutations.

---

# 161. Mutating prototype

Затем:

```text
session
handoff
review
certify
```

---

# 162. Performance experiment

Для каждого operation сравни:

```text
CLI
current hooks
MCP Node
MCP Rust
```

---

# 163. Benchmark network

Для remote MCP:

```text
localhost
LAN
cloud same-region
cloud remote-region
```

---

# 164. Throughput

Измерь:

```text
1 client
5 clients
20 clients
100 clients
```

если distributed architecture это предполагает.

---

# 165. Head-of-line blocking

Один долгий validation не должен блокировать read-only status.

---

# 166. Concurrency pools

Для Rust исследуй:

```text
Tokio
blocking pool
Rayon
```

по типу workload.

---

# 167. Long-running Git operations

Не блокировать MCP event loop.

---

# 168. Load shedding

Если 50 agents одновременно запускают full validation, server должен контролировать overload.

---

# 169. Deduplication

Если 10 agents спрашивают один и тот же snapshot:

```text
compute once
share result
```

---

# 170. Single-flight

Исследуй single-flight cache для expensive operations.

---

# 171. Shared validation

Если repository state identical:

```text
reuse validation result
```

---

# 172. Snapshot-addressed cache

Cache key:

```text
repository snapshot digest
+
validator version
```

---

# 173. Cross-agent cache sharing

Это потенциально один из крупнейших MCP-server benefits.

Измерь.

---

# 174. Central decision index

Persistent server может держать indexed `.ai/DECISIONS.md`.

---

# 175. Worklog index

Аналогично.

---

# 176. Archive scalability

Проверь large archive:

```text
1 MB
10 MB
100 MB
```

и индексированный MCP access.

---

# 177. Resource pagination

Не возвращай огромные indexes одним response.

---

# 178. Partial reads

Исследуй semantic sections/chunks.

---

# 179. Stable resource identifiers

URI должна сохранять identity, где это возможно.

---

# 180. Versioned resources

Рассмотри:

```text
colabs://decision/15?revision=...
```

для reproducibility.

---

# 181. Reproducible review

Review должен указывать exact:

```text
commit
snapshot
decision revision
task revision
```

---

# 182. MCP server testing

Создай contract tests для:

```text
tool schema
resource schema
error schema
authorization
concurrency
idempotency
```

---

# 183. Model-in-the-loop tests

Автоматические tests недостаточны.

Тестируй реальные model tool calls.

---

# 184. Fuzzing

Для Rust MCP server:

```text
JSON schemas
URI parsing
path handling
concurrent operations
```

---

# 185. Property-based tests

Особенно для protocol invariants.

---

# 186. Fault injection

Симулируй:

```text
Git failure
filesystem failure
MCP disconnect
client retry
AX failure
server restart
```

---

# 187. Server restart recovery

После restart:

```text
explicit handles
persistent state
tasks
```

должны вести себя определенно.

---

# 188. Stateless core implication

Поскольку MCP core stateless, persistent domain state должен жить в Colabs state layer, а не предполагаться существующим из-за connection lifetime.

---

# 189. State architecture

Сравни:

```text
files only
files + memory cache
files + persistent index
embedded DB
```

но не добавляй DB без benchmark.

---

# 190. Auditability

Каждое MCP mutation должно быть сопоставимо с Git/worklog evidence.

---

# 191. MCP protocol versioning

Colabs MCP должен корректно работать при обновлении MCP specification.

Минимизируй зависимость core domain от protocol revision.

---

# 192. Colabs API versioning

Отдельно версионируй domain contracts:

```text
colabs.handoff.v1
```

если это действительно нужно.

---

# 193. Vendor-neutrality

MCP interface должен позволить работать:

```text
Claude
Codex
Gemini
future clients
```

без зависимости от одного vendor.

---

# 194. MCP dependency risk

Исследуй стоимость изменений specification и несовместимости client implementations.

---

# 195. Native integrations comparison

Сравни:

```text
native Claude integration
native Codex integration
```

и:

```text
MCP
```

По:

```text
latency
feature access
maintenance
accuracy
```

---

# 196. Don't force MCP everywhere

Если native integration заметно лучше для lifecycle event, оставь ее.

---

# 197. Architecture candidate 1 — Conservative

```text
Rust Core
├── CLI
└── MCP read-only/context facade
```

---

# 198. Candidate 2 — Balanced

```text
Rust Core
├── CLI
├── MCP operational API
└── AX execution adapter
```

---

# 199. Candidate 3 — Aggressive

```text
AI ecosystem
↓
MCP
↓
Colabs distributed control plane
↓
AX / local workers
```

---

# 200. Найди собственные гипотезы

Предыдущие пункты — seed list, а не предел.

После анализа кода проведи отдельный этап:

```text
What becomes possible specifically because
Colabs is now a persistent standardized MCP service?
```

Ищи emergent opportunities.

---

# Hypothesis Registry

Для каждой гипотезы используй формат:

```text
HYPOTHESIS MCP-001

Name:

Category:
performance / accuracy / tokens / UX / architecture /
security / portability / reliability / cost / observability

Current behavior:

MCP alternative:

MCP primitive:
Tool / Resource / Prompt / Task / Skill /
Sampling / Elicitation / Root / Extension / Other

Why improvement is plausible:

Affected Colabs components:

Expected improvement:

Possible regression:

Benchmark:

Baseline:

Prototype result:

Measured result:

Implementation complexity:
LOW / MEDIUM / HIGH

Risk:
LOW / MEDIUM / HIGH

Lock-in:
LOW / MEDIUM / HIGH

Confidence:

Conclusion:
CONFIRMED
PARTIALLY CONFIRMED
REJECTED
UNKNOWN
```

---

# Группировка результатов

Раздели подтвержденные гипотезы.

## Tier A

Малые изменения, большой ROI.

## Tier B

Улучшение context/tool architecture.

## Tier C

Persistent MCP + Rust optimizations.

## Tier D

MCP + AX + distributed agents.

## Tier E

Экспериментальные возможности.

---

# Cumulative performance

Не ограничивайся microbenchmark.

Считай session-level result.

Например:

```text
CURRENT

process startup          40 s
repeated Git             50 s
context preparation      30 s
protocol errors/retries  80 s
agent work              300 s

TOTAL                   500 s
```

и:

```text
MCP ARCHITECTURE

persistent server         3 s
shared snapshot          10 s
resource context          8 s
protocol errors/retries  20 s
agent work              280 s

TOTAL                   321 s
```

---

# Главный KPI

Используй:

```text
Time To Correct Certified Result
```

а не только tool latency.

---

# Дополнительные KPI

Измеряй:

```text
TTFR — time to first result
TTCR — time to correct result
TTFC — time to final certification

tokens/task
tool calls/task
wrong tool calls/task
protocol errors/task
retries/task
Git processes/task
external processes/task
context bytes/task
cache hit %
human interventions/task
```

---

# Quality experiments

Проводи A/B:

```text
same task
same model
same repository
same temperature/config
```

Сравни:

```text
Current Colabs
vs
Colabs MCP
```

---

# Architecture scorecard

Для каждой целевой architecture покажи:

```text
Performance
Accuracy
Token efficiency
Maintainability
Portability
Security
Observability
UX
Complexity
AX compatibility
Rust compatibility
Vendor independence
```

Используй измеряемые показатели вместо субъективных баллов там, где это возможно.

---

# Обязательный раздел: что MCP НЕ улучшает

Найди случаи, где:

```text
MCP adds overhead
MCP duplicates existing layer
native API is better
CLI is simpler
AX already solves problem
```

Это обязательная часть исследования.

---

# Обязательный раздел: rejected hypotheses

Не удаляй неудачные эксперименты.

Фиксируй:

```text
hypothesis
why plausible
measurement
why rejected
```

---

# Финальный deliverable

Предоставь:

## 1. Current architecture

## 2. Current integration map

## 3. Current performance baseline

## 4. MCP capability → Colabs opportunity map

## 5. Полный hypothesis registry

Стремись найти **50+ содержательных гипотез**, а при наличии материала — существенно больше.

Не создавай бессмысленные пункты ради количества.

## 6. Confirmed improvements

## 7. Rejected hypotheses

## 8. Tool design proposal

## 9. Resource URI design

## 10. Prompt/Skill architecture

## 11. Security model

## 12. Rust MCP architecture

## 13. AX + MCP architecture

## 14. Client compatibility matrix

## 15. Performance benchmarks

## 16. Accuracy benchmarks

## 17. Token benchmarks

## 18. Migration roadmap

## 19. Conservative architecture

## 20. Balanced architecture

## 21. Aggressive architecture

## 22. Vendor-lock-in strategy

## 23. Failure/recovery strategy

## 24. Final target architecture

---

# Особое внимание уделить комбинации

Исследуй как отдельную группу гипотез:

```text
             AI Clients
       Claude / Codex / Gemini
                │
               MCP
                │
        ┌───────▼────────┐
        │  Colabs MCP    │
        │     facade     │
        └───────┬────────┘
                │
        ┌───────▼────────┐
        │ Rust Colabs    │
        │     Core       │
        │                │
        │ protocol       │
        │ incremental    │
        │ validation DAG │
        │ Git state      │
        │ cache          │
        │ council        │
        └───────┬────────┘
                │
        ExecutionBackend
          /           \
       Local           AX
```

Проверь, не является ли именно это наиболее чистым разделением:

```text
MCP
= universal agent interface

Rust Core
= deterministic intelligence and protocol

AX
= execution infrastructure
```

---

# Критические ограничения

Не превращать MCP в новый монолит.

Не переносить domain logic в transport layer.

Не заставлять внутренние Rust-модули общаться через MCP без причины.

Не использовать generic shell tools там, где возможен semantic API.

Не считать MCP быстрее без benchmark.

Не считать MCP точнее без A/B test.

Не считать «поддерживает MCP» равным «поддерживает все MCP capabilities».

Не нарушать Colabs protocol guarantees.

Не превращать Markdown/Git state в opaque database без веской причины.

Не увеличивать vendor lock-in.

Не делать big-bang rewrite.

Не смешивать эффект:

```text
Rust
MCP
AX
cache
new models
```

в одном эксперименте без возможности измерить вклад каждого.

---

# Финальный вопрос исследования

Ответ должен быть не:

> «Как написать MCP Server для Colabs?»

а:

> **«Какие части Colabs следует предоставить через MCP, какие следует оставить внутри Rust Core, какие функции MCP реально улучшают скорость, точность, токен-эффективность, удобство, совместимость и архитектуру, и насколько велик каждый эффект по измерениям?»**

А затем ответить на более крупный вопрос:

> **«Может ли Colabs через MCP превратиться из protocol implementation для нескольких конкретных AI-инструментов в универсальный model-neutral control interface для совместной работы AI-агентов — без потери производительности и protocol guarantees?»**

Каждый существенный вывод должен подтверждаться:

```text
benchmark
A/B experiment
source-code analysis
contract test
или архитектурным доказательством
```

а не предположением.
