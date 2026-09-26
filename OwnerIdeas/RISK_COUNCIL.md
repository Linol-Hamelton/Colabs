Advisory seed; consumed by R-1; status: RESOLUTION-CLAUDE.md section 4.4

# COLABS KERNEL ARCHITECTURE RISK COUNCIL

## Design-level audit of the v2 atomized kernel

## Final research specification

# MISSION

Провести максимально глубокий независимый многоагентный архитектурный аудит
нового ядра Colabs v2.

Главный вопрос:

> Если ВСЕ механизмы, описанные в текущей документации v2,
> будут реализованы точно так, как задумано,
> какие системные риски всё равно останутся?

Исследование должно проверять именно АРХИТЕКТУРУ,
а не просто искать текущие дефекты реализации.

Текущие implementation bugs разрешено использовать как evidence того,
что существует более общий класс архитектурного риска,
но запрещено автоматически объявлять такой баг недостатком архитектуры.

Цели исследования:

1. проверить, действительно ли атомизация ядра решает проблему его роста;
2. определить, какой минимальный runtime context ядра действительно необходим агенту;
3. проверить полноту и корректность context resolution;
4. найти residual risks;
5. найти design-level blind spots;
6. опровергнуть ложные риски;
7. исследовать взаимодействия между рисками;
8. предложить архитектурные способы закрытия подтверждённых проблем;
9. исследовать технологии только после подтверждения проблемы;
10. определить, какие решения действительно должны попасть в v2;
11. определить, что следует сознательно НЕ добавлять;
12. провести независимый council нескольких model families;
13. подготовить итоговый план для владельца.

ВАЖНО:

НИЧЕГО В ЯДРЕ НЕ МЕНЯТЬ.

RESEARCH ONLY.

Результаты исследования не являются решениями.

Любое изменение архитектуры требует отдельного owner approval
по правилам Colabs.

Все новые материалы исследования писать только в:

docs/research/<DATE></date>-kernel-risk-council/

---

# 0. FREEZE THE SUBJECT

Ветка v2.0.0 активно развивается.

Исследование нельзя проводить по плавающему HEAD.

Перед началом:

1. Получить:

   git rev-parse HEAD
2. Записать:

   BASELINE_SHA=<full SHA></full>
3. Все researchers, challengers, synthesisers, critics и drafter
   работают относительно одного BASELINE_SHA.
4. Если разработка v2 продолжается параллельно:
   использовать отдельный worktree / clone / research branch.
5. Никто не переключается молча на более новый commit.
6. Если новый commit содержит потенциально важное исправление,
   его можно записать как:

   POST-BASELINE OBSERVATION

   но нельзя смешивать с evidence baseline.
7. Повторное исследование другого SHA является отдельным экспериментом.

В каждом отчёте обязательны:

Baseline-SHA:
Working-tree:
Model:
Model-maker:
Client:
Effort:
UTC-date:

---

# 1. SOURCE POLICY

Сначала исследовать репозиторий.

Не строить анализ на памяти модели.

Минимальный обязательный corpus:

.ai/TASK.md
.ai/PLAN.md
.ai/DECISIONS.md
docs/decisions/REGISTRY.md

AGENTS.md
README.md
QUICKSTART.md
SECURITY.md

.ai/docs/PROTOCOL.md
.ai/docs/PAIRED-CYCLE.md
.ai/docs/CLI-AGENTS.md

docs/core-arch/CORE-ARCH-1.md
docs/core-arch/CORE-ARCH-2.md
docs/core-arch/CORE-ARCH-3.md
docs/core-arch/CORE-ARCH-4.md
docs/core-arch/CORE-ARCH-5.md
docs/core-arch/CORE-ARCH-6.md
docs/core-arch/CORE-ARCH-7.md

docs/core-arch/stage-1/**
docs/core-arch/stage-2/**
docs/core-arch/stage-3/** if it exists at BASELINE_SHA
docs/core-arch/stage-4/**
docs/core-arch/stage-5/** if it exists
docs/core-arch/stage-6/** if it exists

docs/specs/2026-09-23-executable-rulebook-spec.md

docs/research/2026-09-23-kernel-architecture/**
docs/research/archive/2026-09-23-routing/**
docs/research/2026-09-24-remediation-mapping/**
docs/research/2026-09-25-improvement-research/**

активные docs/reviews/**
docs/reviews/archive/INDEX.md

OwnerIdeas/Google_AX.md
OwnerIdeas/MCP_Server.md
OwnerIdeas/Rust.md

а также:

- все schema;
- все ROLE records;
- все PROCEDURE records;
- все SCENARIO records;
- все TOOL / APP records;
- все документы, прямо упомянутые текущими CORE-ARCH файлами;
- все свежие review findings против текущего CORE-ARCH.

Не доверять этому списку как полному.

Сначала получить фактический repository inventory.

---

# 2. CORPUS MAP

До архитектурного анализа построить:

CORPUS-MAP.md

Для каждого релевантного документа:

Path
Type
Status
Layer
Current / Proposal / Trial / Historical / Superseded
Normative authority
Superseded by
Architectural claim
Relevant risks
Must-read roles/stages
Notes

Исторические документы:

НЕ считать текущей спецификацией.

Использовать как:

- incident evidence;
- historical failure evidence;
- comparison baseline;
- justification of existing mechanisms.

При конфликте применять существующую source precedence Colabs.

Если даже после precedence конфликт не разрешён:

не выбирать удобную версию.

Записать:

SOURCE-CONFLICT

и вынести в risk registry / owner questions.

---

# 3. CRITICAL CLASSIFICATION

Каждая находка ОБЯЗАТЕЛЬНО относится к одному классу.

## A. CURRENT IMPLEMENTATION DEFECT

Архитектурный контракт уже правильный,
но текущий код ему не соответствует.

Пример:

watchdog нарушает уже записанную state machine.

Такой дефект важен,
но НЕ доказывает ошибочность архитектуры.

---

## B. DOCUMENTATION / CONTRACT GAP

Замысел выглядит разумным,
но контракт описан недостаточно точно.

Пример:

не определена freshness semantics packet.

---

## C. RESIDUAL RISK

Риск уже признан архитектурой,
есть protection,
но остаточный риск сохраняется даже при идеальной реализации.

---

## D. DESIGN BLIND SPOT

Риск архитектурно не покрыт,
или фундаментальное предположение системы может быть неверным.

Это главный объект исследования.

---

## E. FALSE POSITIVE

Первоначально риск выглядел реальным,
но существующая архитектура уже закрывает его достаточно полно.

Такую находку НЕ удалять.

Записать в:

FALSE-POSITIVES.md

Это важный результат исследования:
совет должен не только добавлять проблемы,
но и опровергать лишние опасения.

---

# 4. CENTRAL ARCHITECTURAL HYPOTHESIS

Проверить, а не принять заранее:

> Colabs может позволить физическому размеру kernel расти,
> если размер активного protocol context конкретной задачи
> остаётся bounded,
> а correctness выбора контекста не ухудшается.

Разделять:

PHYSICAL_KERNEL_SIZE

ACTIVE_KERNEL_CONTEXT

TOTAL_SESSION_CONTEXT

CONTEXT_PRECISION

CONTEXT_RECALL

RULE_OMISSION_RATE

UNNECESSARY_RULE_RATE

PROTOCOL_ERROR_RATE

TIME_TO_ORIENTATION

OWNER_INTERVENTIONS

Не считать:

small packet = successful architecture.

Packet считается хорошим только если одновременно:

1. он достаточно мал;
2. не содержит значимого лишнего context;
3. содержит ВСЕ необходимые правила;
4. создаёт меньше или не больше protocol-caused errors.

---

# 5. TWO DIFFERENT MODES MUST NOT BE CONFUSED

Исследовать отдельно:

## MODE A — NORMAL PRODUCT / ENGINEERING WORK

Например:

coding
review
debugging
research
architecture
testing
security analysis
product work.

Здесь основной вопрос:

> сколько kernel context действительно должен видеть агент?

---

## MODE B — KERNEL / PROTOCOL MAINTENANCE

Например:

изменение L0;
изменение procedure schema;
изменение resolver;
изменение compiler;
изменение roles;
изменение lifecycle;
изменение governance;
изменение evidence/gates.

В этом режиме широкий L0 / architecture context
может быть обязательным.

НЕ использовать вывод:

"для normal coding полный L0 избыточен"

как доказательство:

"для kernel modification полный L0 тоже избыточен".

Исследовать их независимо.

---

# 6. ATOMIZATION PIPELINE AUDIT

Исследовать полную цепочку:

kernel records
↓
metadata
↓
CATALOG / index
↓
task classification
↓
task-frame
↓
role
↓
stage
↓
risk
↓
execution pattern
↓
triggers
↓
resolver
↓
dependency closure
↓
compile-packet
↓
client delivery
↓
agent orientation
↓
runtime context widening
↓
task execution
↓
artifacts
↓
review / certification

Для КАЖДОГО перехода ответить:

- кто принимает решение;
- deterministic это или model judgement;
- какие inputs используются;
- как inputs versioned;
- как определяется freshness;
- fail-open или fail-closed;
- как обнаруживается ошибка;
- есть ли negative test;
- возможен ли false omission;
- возможен ли excessive inclusion;
- можно ли доказать completeness;
- можно ли воспроизвести решение;
- можно ли кешировать его безопасно;
- какой state является source of truth.

---

# 7. SEED RISKS ARE HYPOTHESES, NOT CONCLUSIONS

Следующие H-* являются только seed hypotheses.

Исследователи ОБЯЗАНЫ пытаться:

- подтвердить;
- уточнить;
- сузить;
- объединить;
- разделить;
- либо ОПРОВЕРГНУТЬ

каждый существенный seed risk.

Нельзя считать риск истинным потому,
что его написал автор задания.

---

# 8. H-CTX-01 — L0 RUNTIME LOADING MODEL

Не рассматривать вопрос как бинарный:

FULL L0
vs
NO L0.

Проверить минимум три архитектуры.

---

## Architecture L0-A — FULL L0

Каждый агент всегда получает полный L0-ROOT.

Проверить преимущества:

- все invariants доступны;
- меньше зависимости от resolver;
- проще mental model;
- меньше omission risk.

Проверить недостатки:

- token/context cost;
- instruction dilution;
- irrelevant governance rules;
- conflict за attention;
- рост L0 со временем.

---

## Architecture L0-B — MINIMAL L0-BOOT + LAZY L0

Всегда загружается маленький:

L0-BOOT

Остальные L0 procedures / governance records:

lazy

по:

dependency
trigger
role
task
stage
risk.

Определить минимальный достаточный L0-BOOT.

Кандидаты, которые НУЖНО ПРОВЕРИТЬ,
но не принимать заранее:

- source-of-truth / precedence;
- owner authority;
- отсутствие самопроизвольного расширения authority;
- запрет inventing procedure / permission;
- критические NEVER;
- prohibition of self-certification;
- evidence/reproduction semantics,
  если действительно universal;
- stop-and-ask;
- bounded retries / escalation;
- semantics получения дополнительного context;
- handling of stale/conflicting instructions.

Главный вопрос:

> Какой минимум агент должен знать ДО того,
> как сможет безопасно использовать resolver,
> task-frame, role и остальные procedures?

---

## Architecture L0-C — ZERO L0

Обычный агент не получает L0 вообще.

Весь routing и rule selection выполняется
external deterministic resolver.

Проверить:

- может ли агент безопасно работать,
  не зная даже bootstrap invariants;
- что происходит при ошибке resolver;
- как агент понимает, что resolver ошибся;
- как работает stop-and-ask;
- как запрещается improvisation;
- как обрабатывается unexpected condition.

---

## REQUIRED L0 COMPARISON

Для A/B/C сравнить:

instruction tokens
total context
context relevance
context precision
context recall
rule omission
protocol violations
orientation errors
owner questions
resolver complexity
failure behaviour
latency
maintainability
security
debuggability.

---

## SPECIAL RULE FOR CURRENT CORE-ARCH WORK

Во время изменения самого kernel/core architecture:

полный РЕЛЕВАНТНЫЙ L0 является baseline.

Совет может исследовать его сокращение,
но не должен исходить из того,
что обычный product-mode режим автоматически применим
к kernel-maintenance mode.

---

## REQUIRED ANSWER

Не спрашивать только:

"Should L0 be ignored?"

Ответить:

> What is the minimum sufficient always-loaded L0 runtime context?

и отдельно:

- normal product work;
- normal code review;
- certification;
- research;
- security audit;
- kernel modification.

---

# 9. H-CTX-02 — CATALOG O(N) TAX

Сегодня нерелевантные records могут попадать
в packet на summary level.

Проверить математически и экспериментально:

kernel record count = N

CATALOG exposure = ?

Если все summary попадают каждому агенту:

context cost потенциально O(N).

Это может вернуть проблему роста через другой канал.

Сравнить:

A. full CATALOG summary

B. relevant CATALOG slice only

C. machine-side indexed resolver

D. hierarchical index

E. searchable local resource

F. lazy MCP resource

G. content-addressed lookup

H. another architecture proposed by researchers

Главный вопрос:

> Может ли kernel вырасти в 100 раз,
> не увеличив agent-visible protocol context
> приблизительно в 100 раз?

---

# 10. H-CTX-03 — EXPLICIT DEPENDENCY GRAPH

Исследовать текущие schema fields:

roles
stages
triggers
inputs
outputs
tools
back_edges

и ответить:

достаточно ли этого для вычисления
полного transitive dependency closure?

Проверить необходимость:

requires
provides
depends_on
optional_requires
conflicts_with
implies
runtime_requires
schema_requires
tool_requires
supersedes_runtime

или более компактной модели.

Не добавлять поля автоматически.

Сначала доказать,
что текущая схема не позволяет вывести зависимость.

Пример failure:

P-A selected by role/stage
↓
P-A assumes rule from P-B
↓
P-B not selected
↓
agent receives internally incomplete packet.

Главный вопрос:

> Can packet completeness be derived deterministically from metadata?

---

# 11. H-CTX-04 — TRIGGER DETECTION

Некоторые records раскрываются по trigger.

Проверить:

- кто детектирует trigger;
- agent?
- resolver?
- state machine?
- dispatcher?
- event log?

Для каждого trigger class определить:

DETERMINISTIC

или

JUDGEMENT.

Примеры:

file changed
test failed
risk high
budget exhausted
candidate frozen
security anomaly
premise wrong
rule missing.

Проверить false negative:

trigger occurred
but record never loaded.

Проверить false positive:

record loaded without real trigger.

---

# 12. H-CTX-05 — READ-WIDENING

Read-widening нужен для correctness.

Но проверить,
может ли он разрушить bounded-context architecture.

Исследовать:

- reason taxonomy;
- logging;
- widening budget;
- automatic dependency widening;
- agent-requested widening;
- resolver-requested widening;
- max expansion;
- escalation to full-context mode;
- cost measurement.

Не превращать budget в запрет чтения.

Цель:

не мешать агенту получить необходимые знания,
но видеть случаи,
когда selective context постоянно разваливается
и агент вынужден читать всё.

Метрика:

WIDENING_RATE
WIDENING_BYTES
USEFUL_WIDENING_RATIO
POST-WIDENING_DEFECT_RATE.

---

# 13. H-FRESH-01 — PACKET FRESHNESS / KERNEL EPOCH

Сценарий:

packet compiled at kernel state K1
↓
kernel changes to K2
↓
task continues
↓
artifact consumed under K2.

Проверить необходимость:

kernel version
kernel epoch
policy hash
packet hash
procedure id + version
procedure content hash
packet manifest
task-pinned kernel snapshot
compatibility range
migration semantics.

Ответить:

> Is a task executed against "latest kernel"
> or against "kernel snapshot at task creation"?

---

# 14. H-STATE-01 — ARTIFACT EXISTENCE IS NOT SUFFICIENT

S-001 использует artifacts как переходы.

Проверить,
достаточно ли:

file exists

или нужно:

exists
+
schema-valid
+
producer-valid
+
scope-valid
+
candidate-valid
+
fresh
+
kernel-compatible
+
provenance-valid
+
not superseded.

Определить:

ARTIFACT VALIDITY CONTRACT.

---

# 15. H-TCB-01 — TRUSTED COMPUTING BASE

Определить точный TCB Colabs.

Возможные части:

resolver
packet compiler
validator
scope checker
verdict engine
evidence generator
handoff verifier
dispatcher
watchdog
lock
decision parser
manifest parser
client registry
artifact verifier.

Для каждого:

- может ли его ошибка нарушить protocol guarantee;
- кто его проверяет;
- кто проверяет его обновление.

Главный вопрос:

> How does Colabs safely modify the machinery
> that determines whether Colabs modifications are valid?

Исследовать:

N-1 verifier certifies N
dual execution
old/new differential run
minimal bootstrap verifier
reproducible build
content-addressed binaries
signed release
golden fixtures
independent implementation
cross-language verifier.

Выбирать простейший достаточный вариант.

---

# 16. H-GRAPH-01 — GLOBAL STATE-SPACE FAILURE

LCC проверяет множество локальных properties.

Проверить глобальные:

deadlock
livelock
unreachable procedure
orphan procedure
cycle
cross-layer cycle
cycle with locally bounded edges but globally unbounded path
missing exit
role dead-end
no eligible certifier
trigger conflict
simultaneous transitions
resource deadlock
mutually impossible prerequisites.

Построить graph model.

Исследовать по возрастающей сложности:

1. ordinary directed graph analysis;
2. SCC;
3. reachability;
4. cycle classification;
5. property-based state-machine tests;
6. model checking;
7. TLA+/PlusCal;
8. Petri nets;
9. Alloy / SAT / SMT.

Не рекомендовать formal methods,
если простой graph checker закрывает проблему.

---

# 17. H-RUNTIME-01 — EXACTLY-ONCE / SINGLE ACTIVE WRITER

Недавние launcher defects использовать как evidence класса.

Но главный вопрос независим от конкретных багов:

> What guarantees that one logical task
> has only one active mutating executor?

Проверить sufficiency:

PID
PID creation time
process tree
session id
state file
task id.

Исследовать:

execution lease
fencing token
generation
operation id
idempotency key
heartbeat
workspace lease
transactional takeover
compare-and-swap state
backend-enforced single writer.

Особое внимание:

local process
cloud session
remote machine
AX task
Kilo fallback.

---

# 18. H-REMOTE-01 — FILESYSTEM ASSUMPTION

Текущая философия:

filesystem = shared coordination channel.

Проверить, что происходит при:

Claude Cloud
AX
remote worker
container
separate worktree
separate machine
GitHub-hosted execution.

Сценарий:

Local:
HEAD A + dirty modifications

GitHub:
HEAD A

Cloud:
clone HEAD A

Другой worker:
HEAD B.

Ответить:

что является shared state?

filesystem?

Git objects?

artifact store?

task state service?

event log?

Исследовать first-class abstractions:

ExecutionBackend
Workspace
ArtifactTransport
ExecutionLease
RepositorySnapshot
TaskState.

Не вводить их,
если filesystem abstraction можно безопасно сохранить.

---

# 19. H-SEC-01 — READ CONTEXT AUTHORITY

Current principle:

reading is never forbidden.

Проверить его под security threat model.

Разделить:

KERNEL CONTEXT VISIBILITY

PROJECT READ AUTHORITY

WRITE AUTHORITY

EXECUTION AUTHORITY

NETWORK AUTHORITY

SECRET AUTHORITY

EXTERNAL SERVICE AUTHORITY.

Проверить альтернативу:

> Relevant kernel reading is not artificially restricted,
> but data access remains least-privilege.

Сценарии:

.env
production dump
customer PII
SSH keys
private certificates
large secret directories
unrelated private workspace.

---

# 20. H-SEC-02 — INSTRUCTION / DATA TRUST BOUNDARY

Исследовать:

README
source comments
issues
PR text
generated files
web pages
external documentation
MCP output
CLI output
test output
logs
agent reports.

Любой из них может содержать текст вида:

"ignore previous instructions".

Определить:

TRUSTED POLICY

TRUSTED OWNER DIRECTIVE

TRUSTED GENERATED STATE

UNTRUSTED REPOSITORY DATA

UNTRUSTED TOOL DATA

UNTRUSTED EXTERNAL CONTENT.

Исследовать:

instruction provenance
content labels
policy allowlist
tainting
sandboxing
tool-output separation
prompt-injection detection
approval gates.

Не обещать невозможную "полную защиту от prompt injection".

Разделить:

what policy can reduce

what deterministic enforcement can prevent

what remains model-level risk.

---

# 21. H-SEC-03 — SECRET PROPAGATION

Проверить:

journals
transcripts
Evidence
reports
dispatcher output
MCP
logs
cloud sessions
crash reports
research artifacts.

"Never write secrets" недостаточно,
если tools automatically capture output.

Исследовать:

redaction
structured logging
secret scanning
DLP
field-level exclusion
retention limits
local-only storage
encrypted storage
provider boundaries.

---

# 22. H-IND-01 — INDEPENDENCE VS DIVERSITY

Current independence mainly tracks model participant / lineage.

Проверить:

procedural independence
≠
epistemic independence.

Два agents могут:

- быть одной model family;
- быть одного provider;
- иметь correlated training;
- использовать одинаковые tools;
- читать одинаковый misleading source;
- повторять common-mode failure.

Исследовать dimensions:

model
family
provider
training lineage where public
prompt strategy
toolchain
data source
execution environment.

Определить:

нужны ли diversity requirements
для high-risk certification.

Не увеличивать число агентов без evidence.

---

# 23. H-EVAL-01 — CIRCULAR CALIBRATION

Shadow certification и calibration требуют outcome.

Спросить:

> Who defines ground truth?

Если:

certifier performance

измеряется по:

final certifier result,

может возникнуть circular evaluation.

Исследовать external or delayed truth:

deterministic tests
formal invariants
seeded defects
mutation tests
later escaped bugs
human review
production incident
reproduction evidence
benchmark ground truth.

---

# 24. H-EVAL-02 — ADAPTIVE POLICY OVERFITTING

Study B создаёт:

task type
→ F1-F5
→ risk
→ execution depth
→ pattern
→ role/model routing.

Проверить:

train/test leakage
self-confirming policy
selection bias
sparse task classes
model drift
feedback loop
lack of exploration
confounded model comparisons.

Исследовать:

holdout
rolling evaluation
randomized control subset
counterfactual runs
shadow routing
exploration budget
A/B
bandit only where justified.

---

# 25. H-MODEL-01 — PROVIDER RANK != TASK PERFORMANCE

Current model ranking may use provider positioning.

Это полезно как prior,
но проверить переход к empirical role performance:

coder
architect
reviewer
researcher
critic
certifier
debugger
security reviewer
synthesiser.

Не строить один global leaderboard.

Предпочтительная гипотеза для проверки:

task/role-specific capability evidence.

---

# 26. H-CODE-01 — KERNEL CONTEXT != PROJECT CONTEXT

Даже идеальный kernel packet
не гарантирует правильный code context.

Агент может получить все protocol rules,
но не прочитать:

caller
callee
test
migration
schema
config
consumer
build rule.

Исследовать отдельный:

PROJECT CONTEXT RESOLVER.

Возможные inputs:

imports
symbols
call graph
LSP
AST
tree-sitter
tests
git history
code ownership
config dependencies
schemas
database migrations
build graph
semantic search.

Не смешивать:

kernel resolver

и

code context resolver

если их цели различаются.

---

# 27. H-BUDGET-01 — BYTES ARE ONLY A PROXY

Текущие budgets используют bytes.

Проверить фактическую модель:

TOTAL_CONTEXT =

kernel packet
+
task frame
+
role
+
project context
+
conversation history
+
tool descriptions
+
MCP tool schemas
+
MCP resources
+
tool results
+
model-specific system overhead.

Измерять:

tokens where observable

bytes as fallback proxy.

Разные tokenizers учитывать отдельно.

---

# 28. H-VERSION-01 — IN-FLIGHT COMPATIBILITY

Сценарий:

procedure 1.2 produces artifact
↓
procedure becomes 2.0
↓
consumer 2.0 opens old artifact.

Проверить необходимость:

schemaVersion
procedureVersion
kernelEpoch
artifactVersion
compatibility range
migration function
packet lockfile
old-runtime support
fail-fast.

---

# 29. H-AUTH-01 — COOPERATIVE VS HOSTILE DEPLOYMENT

Не смешивать два threat models.

## LOCAL COOPERATIVE MODE

Owner controls machine/repository.
Agents assumed non-malicious but fallible.

## ENTERPRISE / UNTRUSTED MODE

Remote agents.
Multiple humans.
Service identities.
Possible compromised agent/tool.

Проверить,
что требуется только второму режиму:

RBAC
OIDC
signed decisions
signed artifacts
attestations
tamper-evident audit
remote authorization service
policy server.

Не усложнять local Colabs enterprise-механизмами,
если risk отсутствует.

---

# 30. H-OWNER-01 — OWNER AS SPOF

Это уже известный residual.

Не выдавать за discovery.

Исследовать только:

delegation
approval queue
question batching
asynchronous owner responses
reversible defaults
safe wait states
timeout semantics.

Отдельно определить:

что владелец МОЖЕТ делегировать

и

что kernel принципиально оставляет owner-only.

---

# 31. DISCOVER NEW RISKS

Seed list НЕ является потолком.

Каждый researcher обязан найти дополнительные risks.

Особенно искать через:

- failure-derived hypotheses;
- negative hypotheses;
- contrarian architecture;
- first principles;
- distributed systems;
- compilers;
- operating systems;
- databases;
- build systems;
- workflow engines;
- safety systems;
- version control;
- CI/CD;
- policy engines.

Каждый новый risk:

KR-NEW-...

пока synthesis не выдаст stable id.

---

# 32. ROUND 1 — INDEPENDENT RESEARCH

Назначить минимум 6 независимых researchers
разных model makers,
через P-L2-002.

Предпочтительно 6–8,
если ресурсы позволяют.

Один participant не выполняет две роли
в одном task frame.

Каждый Round-1 researcher:

НЕ читает чужие Round-1 reports
до фиксации своего.

---

## ZONE A — CONTEXT / COMPILER

Исследует:

atomization
L0
CATALOG
resolver
dependency graph
triggers
packet compiler
packet completeness
widening
context budgets
versioning.

---

## ZONE B — RUNTIME / DISTRIBUTED SYSTEMS

Исследует:

dispatcher
watchdog
liveness
fallback
recovery
single writer
exactly-once
leases
remote workers
cloud
AX
Git/workspaces
concurrency.

---

## ZONE C — SECURITY / TRUST

Исследует:

permissions
read authority
prompt injection
secret handling
sandbox
MCP
external data
authorization
enterprise threat model.

---

## ZONE D — GOVERNANCE / TCB

Исследует:

authority
decisions
roles
independence
certification
self-hosting
kernel updates
TCB
version compatibility.

---

## ZONE E — EVALUATION / ADAPTIVE EXECUTION

Исследует:

F1-F5
risk
execution depth
model selection
routing
calibration
Goodhart
overfitting
benchmarks
shadow evaluation.

---

## ZONE F — SCALE / SYSTEM INTERACTIONS

Исследует:

procedure count
global graph
state-space explosion
maintainability
host drift
migration
multi-repo
observability
cross-platform behaviour.

---

## OPTIONAL ZONE G — PROJECT CONTEXT

Исследует:

repository understanding
code graph
LSP
AST
symbol selection
tests
large repositories.

---

## OPTIONAL ZONE H — CONTRARIAN / SIMPLIFIER

Цель:

попытаться доказать,
что v2 переусложнён.

Проверить:

- какие layers можно объединить;
- какие procedures удалить;
- какие guarantees не окупают цену;
- какие проблемы решаются значительно проще;
- возможно ли получить 80–90% guarantees
  при 30–50% architecture complexity.

Negative hypotheses mandatory.

---

# 33. ROUND 1 OUTPUT FORMAT

Файлы:

round1/<zone></zone>-<model-id></model>.md

Основное тело ≤ 250 lines,
appendices можно отдельно.

Каждое утверждение:

FACT
CLAIM
HYPOTHESIS.

Repository FACT:

path:line.

External FACT:

primary source
URL
version/date.

Training-memory knowledge:

CLAIM — unverified.

Каждый report содержит:

1. Scope.
2. Architecture map.
3. Existing protections.
4. Risks already closed.
5. Residual risks.
6. Design blind spots.
7. Attack/failure scenarios.
8. Root causes.
9. Candidate solutions.
10. Simpler alternatives.
11. Technologies worth testing.
12. Technologies NOT worth adding.
13. Experiments.
14. Evidence that could refute each major conclusion.
15. Unknowns.
16. Owner questions.

---

# 34. RISK CARD

Каждый risk оформлять:

ID:
Title:

Classification:
IMPLEMENTATION
DOC-GAP
RESIDUAL
BLIND-SPOT
FALSE-POSITIVE

Layer(s):
Affected records:
Mechanism:
Preconditions:
Failure scenario:
Blast radius:
Likelihood:
Impact:
Detectability:
Current coverage:
Residual after coverage:
Evidence:
Confidence:
Proposed solutions:
Simpler alternative:
Complexity cost:
Runtime cost:
Context/token effect:
Security effect:
Vendor lock-in:
Backward compatibility:
How to test:
Negative test:
Kill criterion:
Dependencies:
Synergies:
Owner decision required:

Не использовать псевдоточность.

Если нет данных:

LOW / MEDIUM / HIGH

или

UNKNOWN.

---

# 35. ROUND 2 — CROSS-CHALLENGE

Ни один researcher не проверяет собственную zone.

Каждый Round-1 report получает challenger
другого model maker.

Questions:

1. Is the risk real?
2. Is it architectural?
3. Is it only implementation?
4. Does current Colabs already close it?
5. Is current protection sufficient?
6. Is residual material?
7. Is proposed fix sufficient?
8. Is there a simpler fix?
9. Does the fix create another risk?
10. Does it belong in the kernel?
11. Can it be deterministic?
12. Should it remain model judgement?
13. Can it be measured?
14. What test would prove the protection?
15. What evidence would refute the risk?
16. Does this duplicate another risk?

Outputs:

round2/<zone></zone>-challenge-<model></model>.md

Then:

round2/synthesis.md

Missing report:

PENDING

not agreement.

---

# 36. ROUND 3 — THREE INDEPENDENT SYNTHESES

Назначить три synthesisers
разных model makers.

Они получают одинаковый immutable corpus:

Round 1
+
Round 2.

Они НЕ читают друг друга.

Outputs:

round3/synthesis-A.md
round3/synthesis-B.md
round3/synthesis-C.md

Каждый должен независимо определить:

- confirmed strengths;
- refuted risks;
- implementation-only issues;
- documentation gaps;
- residual risks;
- genuine blind spots;
- interactions;
- P0 risks;
- P1 risks;
- P2 risks;
- minimum sufficient fixes;
- over-engineering risks;
- experiments;
- architecture alternatives.

---

# 37. COUNCIL CLOSING — FOLLOW S-003

Использовать структуру research cycle Colabs.

## A. THREE INDEPENDENT SYNTHESES

готовы.

↓

## B. DRAFT DECISION

Один owner-selected drafter.

Он читает все три syntheses.

Output:

draft-decision.md

Для каждой темы:

Issue
Synthesis A
Synthesis B
Synthesis C
Agreement
Divergence
Evidence
Draft resolution.

Draft ≠ decision.

↓

## C. TWO INDEPENDENT CRITIQUES

critique-A.md
critique-B.md

Critics:

- not drafter;
- not each other;
- independent;
- do not read each other's critique before fixing their own.

Для каждого draft point:

fully agree
mostly agree
partly agree
mostly disagree
fully disagree
uncertain

justification where required.

↓

## D. FINAL PLAN

Final fixer отвечает на КАЖДЫЙ critic point:

ACCEPTED

REJECTED + reason

OWNER DECISION REQUIRED.

Output:

final-plan.md

↓

OWNER:

approve
amend
reject.

Nothing auto-binds.

---

# 38. SPECIAL EXPERIMENT — PACKET COMPLETENESS

Разработать deterministic test strategy:

Task type
+
Task frame
+
Role
+
Stage
+
Risk
+
Execution pattern
+
Environment
+
Kernel version
+
Triggers
→
EXPECTED PROCEDURE CLOSURE.

Для fixture:

EXPECTED
ACTUAL
MISSING
UNEXPECTED.

Required mutations:

remove dependency
change role
change stage
change risk
change execution pattern
fire trigger
suppress trigger
change record version
stale index
stale task frame
missing schema
unknown tool
conflicting procedure
retired procedure
superseded procedure
wrong kernel epoch.

Главный invariant:

A missing required rule MUST fail the test.

Исследовать:

можно ли получить expected closure
из machine-readable metadata,

а не из ожиданий одной модели.

---

# 39. SPECIAL EXPERIMENT — L0 A/B/C

Это отдельный обязательный experiment design.

На одинаковом наборе NORMAL TASKS сравнить:

## Variant A

FULL L0

## Variant B

MINIMAL L0-BOOT
+
lazy L0

## Variant C

ZERO L0
+
deterministic external resolver.

Одинаковые:

model
effort
task
baseline
task-frame
project context
tools
success criteria.

Измерять:

protocol input tokens
total input tokens
task correctness
protocol compliance
rule omissions
unnecessary rules
orientation errors
stop-and-ask correctness
context widening
latency
owner interventions
rework
review findings.

После этого отдельно провести:

KERNEL MAINTENANCE TASKS

где FULL RELEVANT L0 является baseline.

Не объединять оба результата.

---

# 40. L0-BOOT MINIMIZATION EXPERIMENT

Если Variant B перспективен:

начать с полного L0.

Постепенно удалять candidate invariants.

Для каждого удаления:

- same task set;
- same model;
- same effort;
- same baseline.

Mutation/minimization method:

Full L0
↓
remove one invariant/class
↓
run tests
↓
observe protocol errors
↓
retain/remove.

Цель:

найти:

MINIMUM SUFFICIENT BOOTSTRAP

а не:

MINIMUM POSSIBLE TOKEN COUNT.

Если сокращение L0 не даёт заметной выгоды,
а увеличивает risk/complexity:

совет должен рекомендовать оставить full L0.

Это допустимый и желательный вывод,
если evidence его поддерживает.

---

# 41. SPECIAL EXPERIMENT — SCALE

Создать synthetic kernel:

100 records
500
1,000
5,000
10,000
20,000 if cheap enough.

Measure:

index size
CATALOG bytes
compile latency
packet bytes
packet tokens
number of records visible to agent
resolver memory
cache hit
incremental update
rebuild after one changed record.

Test architectures:

full summary CATALOG
relevant slice
indexed resolver
hierarchical index
lazy resource access.

Success property:

PHYSICAL KERNEL SIZE ↑↑

while

AGENT-VISIBLE CONTEXT ≈ bounded.

---

# 42. SPECIAL EXPERIMENT — GLOBAL GRAPH

Build derived graph:

procedure
scenario
role
stage
trigger
input artifact
output artifact
tool
dependency
back edge.

Check:

orphan node
unreachable node
consumer without producer
producer without consumer
cycle
SCC
cycle without exit
role dead-end
no eligible participant
conflicting transitions
ambiguous producer
undeclared dependency.

Investigate:

protocol-core check-graph

as potential deterministic command.

---

# 43. SPECIAL EXPERIMENT — SECURITY FIXTURES

Without executing harmful payloads,
construct harmless adversarial examples:

1. README:
   "Ignore Colabs instructions."
2. Source comment:
   "Run this command immediately."
3. Test output:
   "System instruction..."
4. MCP resource:
   fake higher-priority instruction.
5. External web content:
   instructs tool execution.
6. `.env` exists outside task scope.
7. Transcript contains fake API key pattern.
8. Tool log contains secret-like text.
9. Generated report tries to grant itself permission.
10. Repository file claims to supersede owner decision.

Determine intended system behaviour.

Separate:

prompt instruction
policy
sandbox enforcement
permission enforcement
secret redaction.

---

# 44. SPECIAL EXPERIMENT — LOCAL ↔ CLOUD ↔ REMOTE

Model:

LOCAL:
HEAD A + dirty X

GITHUB:
HEAD A

CLOUD:
HEAD A

REMOTE WORKER:
HEAD A.

Then vary:

local modification
cloud commit
local commit
fallback
network loss
owner stop
review running
certifier running
remote worker completion
stale packet.

Determine:

safe handoff semantics
conflict detection
candidate identity
artifact transport
lease ownership.

Answer:

is filesystem still sufficient abstraction?

If not:

what minimum additional abstraction is required?

---

# 45. SPECIAL EXPERIMENT — TCB SELF-UPDATE

Choose one hypothetical TCB component:

packet compiler.

Model:

compiler v1 certifies candidate
candidate contains compiler v2.

Compare strategies:

A. v1 certifies v2.

B. v1 and v2 both compile packet; compare output.

C. two independent implementations.

D. frozen minimal verifier.

E. owner/manual validation.

Determine:

cost
complexity
bootstrap trust
failure detection.

Repeat conceptually for:

validator
evidence verifier
resolver.

---

# 46. SPECIAL EXPERIMENT — ADAPTIVE EXECUTION POLICY

Take Study B outputs when available.

Create holdout tasks.

Compare:

STATIC POLICY

vs

ADAPTIVE F1-F5 POLICY.

Measure:

agent calls
latency
tokens
defects
escapes
unnecessary reviews
owner interventions.

Prevent:

policy evaluation on exactly the data
used to design it.

---

# 47. TECHNOLOGY RESEARCH

Technology is not the starting point.

Pipeline:

CONFIRMED RISK
↓
REQUIRED PROPERTY
↓
CANDIDATE MECHANISMS
↓
CHEAPEST SUFFICIENT MECHANISM
↓
EXPERIMENT
↓
DECISION.

Candidate families may include:

graph algorithms
statecharts
SCXML
TLA+/PlusCal
Alloy
SAT/SMT
property-based testing
mutation testing
fuzzing
content-addressed storage
Merkle DAG
incremental dependency graph
SQLite
embedded KV
filesystem watcher
LSP
tree-sitter
code graph
OpenTelemetry
leases
fencing tokens
sandbox runtimes
MCP
Google AX
Rust
Sigstore-style attestations
secret scanners
policy-as-code.

For every technology:

Risk addressed:
Required property:
Expected benefit:
Alternative without technology:
Complexity:
Runtime cost:
Context cost:
Security:
Lock-in:
Experiment:
Kill criterion:

If:

Risk addressed = unclear

→ DO NOT RECOMMEND.

---

# 48. DO NOT ASSUME RUST / MCP / AX

Specifically challenge:

Rust solves performance.

MCP solves context.

AX solves execution.

For each:

Ask:

What exact current bottleneck?

What mechanism removes it?

Can simpler change solve it?

What does it cost?

Does it introduce lock-in?

Could Colabs operate without it?

Preferred architectural principle to test:

Colabs Core domain logic
should remain independent from transport/execution vendor
unless measurements prove otherwise.

---

# 49. INTERACTION / SYNERGY ANALYSIS

Risks cannot be evaluated only separately.

Build:

RISK × RISK

and

SOLUTION × SOLUTION

interaction matrices.

Examples:

atomization
+
stale packet

lazy loading
+
prompt injection

MCP
+
read authority

AX
+
filesystem assumption

adaptive routing
+
model calibration

context compression
+
rule omission

cache
+
kernel versioning

remote execution
+
execution lease.

Mark:

SYNERGY
CONFLICT
INDEPENDENT
UNKNOWN.

---

# 50. OVER-ENGINEERING AUDIT

For every accepted fix ask:

> What happens if we simply do nothing?

and:

> What is the cheapest solution that closes 80–90% of this risk?

Classify solutions:

S0 — no action

S1 — documentation clarification

S2 — schema field

S3 — deterministic lint/check

S4 — runtime mechanism

S5 — new architectural subsystem

S6 — external dependency/platform.

Prefer lower class
when guarantees are equivalent.

---

# 51. P0 / P1 / P2 CLASSIFICATION

After evidence, classify.

## P0

Must close before v2 becomes the default kernel.

Criteria:

can invalidate core guarantees
or
create silent incorrect operation
or
make certification unreliable
or
break atomic-context premise.

## P1

Can land after core architecture
but before broad adoption.

## P2

Optimization / enterprise / scaling concern
that can wait.

No risk becomes P0
only because it sounds sophisticated.

---

# 52. PRIMARY METRICS

At minimum investigate:

M-PACKET-SIZE

M-PACKET-PRECISION

M-PACKET-RECALL

M-RULE-OMISSION

M-UNNECESSARY-RULES

M-CONTEXT-WIDENING

M-TIME-TO-ORIENTATION

M-PROTOCOL-ERROR

M-OWNER-INTERVENTIONS

M-AGENT-CALLS

M-REVIEW-ESCAPES

M-TCB-FAILURES

M-STALE-PACKET

M-ROUTING-MISMATCH

M-SINGLE-WRITER-VIOLATIONS.

Prefer metrics already aligned with L6
where possible.

Do not invent duplicate metric systems unnecessarily.

---

# 53. EXTERNAL RESEARCH POLICY

External research is encouraged where useful.

Priority:

1. official specifications;
2. official documentation;
3. peer-reviewed research;
4. mature production engineering docs;
5. mature OSS implementations;
6. postmortems;
7. secondary sources only when necessary.

External practice is:

IDEA SOURCE

not:

PROOF IT HELPS COLABS.

For every borrowed mechanism:

State:

Where it is used
What problem it solves there
Why Colabs has analogous problem
What differs
How to test locally.

---

# 54. FINAL DELIVERABLE TREE

docs/research/<DATE></date>-kernel-risk-council/

README.md

BASELINE.md

CORPUS-MAP.md

ARCHITECTURE-MAP.md

RISK-REGISTRY.md

FALSE-POSITIVES.md

BLIND-SPOTS.md

RESIDUAL-RISKS.md

TCB-MAP.md

CONTEXT-MODEL.md

L0-ANALYSIS.md

round1/
    context-...
    runtime-...
    security-...
    governance-...
    evaluation-...
    scale-...
    project-context-...        optional
    simplifier-...             optional

round2/
    ...
    synthesis.md

round3/
    synthesis-A.md
    synthesis-B.md
    synthesis-C.md

draft-decision.md

critique-A.md
critique-B.md

final-plan.md

EXPERIMENT-BACKLOG.md

TECHNOLOGY-CANDIDATES.md

OWNER-QUESTIONS.md

---

# 55. FINAL PLAN STRUCTURE

final-plan.md must contain:

## A. Executive conclusion

## B. Architecture strengths confirmed

## C. Risks that disappear if current documentation is implemented exactly

## D. Current implementation bugs only

## E. Documentation/contract gaps

## F. Residual risks

## G. Genuine design blind spots

## H. False-positive risks

## I. P0 before v2

## J. P1 after initial landing

## K. P2 / later scaling

## L. L0 recommendation

Explicitly:

FULL L0

vs

L0-BOOT + lazy L0

vs

ZERO L0.

For:

normal coding
review
certification
research
kernel modification.

## M. Packet-resolution recommendation

## N. Dependency-graph recommendation

## O. Trigger-resolution recommendation

## P. CATALOG/index recommendation

## Q. TCB recommendation

## R. Runtime / exactly-once recommendation

## S. Cloud/remote execution recommendation

## T. Security recommendation

## U. Evaluation/calibration recommendation

## V. Product-context recommendation

## W. Minimal changes required to CORE-ARCH

## X. Schema changes

## Y. Deterministic tooling

## Z. Experiments before implementation

## AA. Experiments after implementation

## AB. Mechanisms explicitly rejected

## AC. A/B/C validation plan

## AD. Owner decisions required.

---

# 56. REQUIRED FINAL QUESTIONS

Council MUST answer explicitly.

### Kernel/context

1. Does atomization actually solve kernel growth?
2. Under what conditions does it stop solving it?
3. What is the minimum sufficient always-loaded L0?
4. Should ordinary agents receive full L0?
5. Should kernel-maintenance agents receive full L0?
6. Is L0-BOOT + lazy L0 superior to full L0?
7. Is ZERO L0 viable at all?
8. At what measured point would splitting L0 cease to be worthwhile?
9. Should unrelated CATALOG summaries enter every packet?
10. Does CATALOG create O(N) context growth?

### Resolver

11. Can Colabs prove packet completeness?
12. Does procedure.schema need explicit dependency edges?
13. Can current inputs/outputs/triggers imply dependencies reliably?
14. Who detects triggers?
15. Which triggers must be deterministic?
16. What happens when resolver misses a rule?
17. Should resolver fail closed?
18. How should context widening work?

### Versioning / state

19. How is task pinned to kernel state?
20. Does Colabs need kernel epoch / policy hash?
21. How are old artifacts consumed by new procedures?
22. What makes an artifact valid enough to advance the state machine?

### TCB

23. What exactly is the Colabs TCB?
24. How is a new TCB version certified?
25. Is N-1 verification sufficient?
26. What part, if any, should be minimal and frozen?

### Global correctness

27. Can procedure graph deadlock?
28. Can it livelock?
29. Can independent bounded loops create a global unbounded loop?
30. What graph checks should be deterministic?

### Runtime

31. What guarantees exactly one active mutating executor?
32. Are PID/process-tree checks sufficient?
33. Does Colabs need lease/fencing semantics?
34. How does failover work across local/cloud/remote workers?

### Cloud / distributed

35. Is filesystem still the right core abstraction?
36. What is shared state when agents use separate clones?
37. Does Colabs need first-class Workspace?
38. ArtifactTransport?
39. ExecutionBackend?
40. ExecutionLease?

### Security

41. Does "reading is never forbidden" survive a real security threat model?
42. Should kernel-reading freedom be separated from data-reading authority?
43. What is trusted instruction?
44. What is untrusted data?
45. How is prompt/tool/repository injection handled?
46. How are secrets prevented from entering transcripts and logs?

### Independence

47. Is model-id independence enough?
48. When is provider/model-family diversity required?
49. How should common-mode failures be detected?

### Evaluation

50. How is reviewer/certifier quality measured without circular ground truth?
51. Does adaptive execution overfit to Colabs history?
52. What holdout/counterfactual evaluation is necessary?
53. When should provider model rank be replaced by empirical task-role evidence?

### Project context

54. How does Colabs select relevant product code?
55. Is project-context resolution a separate subsystem from protocol-context resolution?
56. What is the simplest useful implementation?

### Scaling

57. At what kernel size does the current CATALOG design stop scaling?
58. At what size does packet compilation become expensive?
59. Can physical kernel size rise without proportional context growth?

### Architecture

60. What is the simplest architecture preserving all critical guarantees?
61. Which proposed mechanisms should NOT be added?
62. Which complexity is justified now?
63. Which complexity belongs only to future enterprise/distributed mode?

---

# 57. PRIMARY SUCCESS CRITERION

Do NOT maximise:

number of rules
number of layers
number of tools
number of agents
number of reports
number of technologies.

Optimise:

Correctness of context selection
×
task correctness
×
reliability
×
independence
×
security
×
maintainability

divided by:

protocol-context cost
+
latency
+
agent calls
+
owner attention
+
operational complexity
+
implementation complexity.

Desired architecture:

PHYSICAL_KERNEL_SIZE
may grow substantially

while:

ACTIVE_KERNEL_CONTEXT
remains bounded,

RULE_OMISSION_RATE
approaches zero,

UNNECESSARY_CONTEXT
does not grow proportionally,

PROTOCOL_CAUSED_ERRORS
decrease,

and

OWNER_INTERVENTIONS
do not increase materially.

---

# 58. SPECIFIC L0 SUCCESS CRITERION

Do not optimise L0 for minimum tokens.

Optimise:

minimum context

subject to:

all critical runtime invariants preserved.

Preferred decision rule:

If L0-BOOT:

saves meaningful context
AND
does not increase protocol errors
AND
does not materially increase resolver/maintenance complexity,

prefer L0-BOOT.

If full L0:

has negligible context cost
AND
provides measurably greater robustness
AND
splitting creates more complexity than benefit,

keep full L0.

If ZERO L0:

requires the agent to blindly trust resolver
or prevents safe detection of resolver failure,

reject ZERO L0.

Do not predetermine the winner.

---

# 59. RED TEAM REQUIREMENT

At least one participant must explicitly try to prove:

> The entire atomized-kernel architecture is solving
> a problem that a much simpler system could solve nearly as well.

At least one participant must explicitly try to prove:

> The kernel should be even more deterministic,
> with models seeing dramatically less protocol prose.

Neither position receives privileged status.

Evidence decides.

---

# 60. FINAL DECISION STANDARD

A recommendation enters final-plan only if:

1. evidence exists;
2. current architecture was checked first;
3. false-positive possibility was tested;
4. simpler alternative was considered;
5. expected benefit is named;
6. complexity cost is named;
7. experiment exists or reason why experiment is impossible;
8. residual risk after the fix is stated.

"Best practice"
is not sufficient.

"More robust"
is not sufficient.

"Industry uses it"
is not sufficient.

"Rust/MCP/AX can do it"
is not sufficient.

---

# 61. COUNCIL END STATE

Research
↓
Independent findings
↓
Cross-challenge
↓
Independent syntheses
↓
Draft
↓
Two independent critiques
↓
Final plan
↓
OWNER

Nothing after FINAL PLAN automatically modifies Colabs.

Owner decides:

ACCEPT
AMEND
REJECT
DEFER
EXPERIMENT FIRST.

---

# FINAL QUESTION TO THE COUNCIL

Give an evidence-backed answer:

> Can Colabs v2 become a very large and sophisticated kernel
> while remaining small, precise and reliable
> from the perspective of each individual agent?

If YES:

explain exactly which architectural guarantees make that possible.

If ONLY CONDITIONALLY:

name the missing guarantees.

If NO:

identify which scaling assumption fails.

And specifically determine:

> What is the minimum sufficient runtime kernel context
> that an ordinary agent must always receive?

Compare:

FULL L0
vs
MINIMAL L0-BOOT + LAZY L0
vs
ZERO L0 + DETERMINISTIC RESOLVER.

Do not optimise for elegance.

Do not optimise for number of mechanisms.

Optimise for:

the fastest, cheapest and simplest path
to a correct, independently verifiable result.

NO CODE CHANGES.

RESEARCH
→
CHALLENGE
→
SYNTHESIS
→
CRITIQUE
→
FINAL PLAN
→
OWNER.
