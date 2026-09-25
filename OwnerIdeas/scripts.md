Да. Здесь уже вырисовывается отдельная **исследовательская программа по script/runtime layer**, и она напрямую связана с возможностью перейти от 2–3 параллельных агентов к условным 10–15 и более.

Причём я бы немного уточнил вашу формулировку архитектуры. Главная цель — не просто «поставить lock на репозиторий», а сделать так, чтобы **канонический repository имел одного арбитра записи, а агенты никогда не конкурировали за него напрямую**:

```text
15 AGENTS
   │
   ├─ read freely
   ├─ work in isolated/private workspace
   └─ submit WRITE REQUEST
              ↓
       WRITE BROKER / QUEUE
              ↓
      validate transaction
              ↓
       conflict detection
              ↓
        canonical write
              ↓
          ACK / result
```

И ещё важнее: **дорогие проверки нельзя без необходимости выполнять внутри write-lock**. Иначе мы просто заменим конфликт агентов одной огромной последовательной пробкой. Из уже зафиксированных запусков Colabs видно, что `validate-protocol.ps1` проходил примерно за 3 секунды, тогда как полный `test-protocol.ps1` занимал около 297 секунд. Значит, вопрос «что действительно должно происходить в критической секции?» — один из центральных вопросов исследования, а не деталь реализации. Эти цифры зафиксированы, например, в журнале коммита `4a85a23`; текущие соответствующие скрипты — `validate-protocol.ps1`, `test-protocol.ps1`, `.ai/bin/protocol-lock.cjs`, `protocol-handoff.cjs`, `protocol-ledger.cjs`, `protocol-verdict.cjs`, `protocol-archive.cjs` и др.

Ниже я бы дал исследовательской группе такой master prompt.

```markdown
# RESEARCH PROGRAM
## High-Concurrency Script Runtime, Single-Writer Integration and Procedure Automation

**Status:** RESEARCH
**Mode:** measurement-first, adversarial, architecture-producing
**Target:** Colabs protocol/runtime layer
**Primary objective:** enable many concurrent AI agents to work safely and efficiently without repository write contention, unnecessary serialized waiting, or repeated LLM work that deterministic code can perform better.

---

# 1. Research goal

Design the script/runtime architecture required for high-concurrency multi-agent operation.

The target operating regime is not 1–2 agents.

Assume that the system may need to support approximately:

5
10
15
or more

simultaneously active agents.

Reading repository state may remain highly concurrent.

Canonical repository mutation must remain controlled, reproducible and conflict-safe.

The research must address three related but distinct problems:

1. SCRIPT PERFORMANCE
   Find and optimize scripts/checks that currently dominate wall-clock time or hold shared resources for too long.

2. WRITE SERIALIZATION / TRANSACTION QUEUE
   Design a central mechanism through which concurrent agents submit completed changes for safe integration rather than competing for canonical repository writes themselves.

3. PROCEDURE → SCRIPT CONVERSION
   Identify mature, deterministic, repeatedly executed instructions that are now sufficiently stable to be converted from model reasoning into fast deterministic scripts.

Do not assume the proposed architecture is optimal.
Test alternatives.

---

# 2. Overall optimization objective

The target is:

MAXIMIZE:
- useful concurrent agent throughput;
- accepted work completed per unit time;
- deterministic work performed by scripts rather than models;

MINIMIZE:
- repository lock time;
- queue wait time;
- repeated validation;
- duplicate reads;
- duplicate computation;
- model tokens spent on deterministic operations;
- merge/write conflicts;
- human intervention;
- unnecessary serialization.

SUBJECT TO:
- correctness;
- integrity;
- reproducibility;
- safety;
- evidence requirements;
- protocol invariants.

---

# 3. Core architectural hypothesis

Investigate this architecture:

```text
                    READ PLANE
              concurrent / mostly free
                       │
       ┌───────────────┼───────────────┐
       ▼               ▼               ▼
    Agent A          Agent B          Agent N
       │               │               │
       │ private work / isolated state │
       └───────────────┬───────────────┘
                       │
                WRITE REQUESTS
                       ↓
             WRITE BROKER / QUEUE
                       ↓
                PRECONDITION CHECK
                       ↓
               CONFLICT DETECTION
                       ↓
              ATOMIC INTEGRATION
                       ↓
                CANONICAL REPO
```

Main hypothesis:

> Agents should not independently acquire and hold the canonical repository for ordinary writes.
> They should submit bounded write transactions to a deterministic integration service.

The service should acknowledge:

- request accepted;
- request id;
- queue state/position if useful;
- dependencies;
- eventual result.

Example interaction:

Agent:
"I finished candidate X. Submit it for integration."

Broker:
"Accepted: write-request WR-142. State=QUEUED."

The agent should not sit inside an LLM loop continuously asking whether the lock is free.

---

# 4. Critical distinction: agent workspace vs canonical repository

Research whether agents should be allowed to write freely inside isolated/private workspaces while being forbidden from directly mutating canonical shared state.

Potential model:

```text
CANONICAL REPOSITORY
    single controlled writer

AGENT WORKSPACE A
    private writable

AGENT WORKSPACE B
    private writable

AGENT WORKSPACE N
    private writable
```

The write broker receives:

- patch;
- commit;
- change bundle;
- declared outputs;
- baseline SHA;
- expected target hashes;
- evidence;
- validation receipt;

and integrates it into the canonical repository.

Compare:

- disposable clones;
- git worktrees;
- branch-per-agent;
- patch bundles;
- temporary directories;
- in-memory transactions.

Determine which gives the best safety/performance ratio on Windows and the project's real tooling.

---

# 5. Do not confuse single writer with global long lock

This is a critical research question.

A naive design:

```text
take global lock
↓
run five-minute tests
↓
write
↓
release lock
```

may destroy concurrency.

Investigate a design where expensive work happens BEFORE the critical section:

```text
candidate prepared privately
↓
expensive validation privately
↓
enqueue transaction
↓
wait
↓
SHORT CRITICAL SECTION:
    verify baseline/preconditions
    detect conflicting changes
    apply transaction
    perform minimal integration checks
    record mutation
↓
release writer
↓
post-integration checks if needed
```

Research exactly which operations MUST occur under exclusive mutation ownership and which must not.

---

# 6. TRACK A — Script Performance Audit and Optimization

Measure current script performance before redesign.

Do not optimize from intuition.

Inventory at least:

- validate-protocol.ps1
- test-protocol.ps1
- protocol-lock.cjs
- protocol-handoff.cjs
- protocol-hooks.cjs
- protocol-ledger.cjs
- protocol-verdict.cjs
- protocol-scope.cjs
- protocol-session.cjs
- protocol-archive.cjs
- protocol-index.cjs
- dispatch/supervisor scripts
- relevant test harnesses
- validators invoked transitively by these scripts.

Build the actual call graph.

---

# 7. Performance measurements

For every important script measure:

- cold start time;
- warm execution time;
- median;
- p90;
- p95;
- worst observed;
- CPU time;
- wall time;
- filesystem I/O;
- files scanned;
- bytes read;
- subprocess count;
- child-process time;
- Git command count;
- repeated parsing;
- repeated hashing;
- repeated repository scans;
- lock acquisition time;
- lock hold time;
- time waiting for another process;
- test time;
- validation time.

Separate:

EXECUTION TIME

from:

SHARED-RESOURCE HOLD TIME.

A 30-second script holding no shared resource may be less damaging than a 3-second operation holding a global writer lock under high concurrency.

---

# 8. Concurrency-weighted bottleneck metric

Research a metric stronger than simple duration.

Candidate:

ContentionCost =
LockHoldTime
× NumberOfBlockedWorkers

or more generally:

SerializedAgentSeconds =
Σ wait_time_of_every_blocked_agent

Example:

one script takes 20 seconds

but blocks 15 agents

→ effective concurrency cost may be approximately 300 agent-seconds.

Determine a useful metric.

This should help prioritize optimization.

---

# 9. Find repeated work

Search for scripts repeatedly performing the same expensive operations:

- repository inventory;
- full tree hashing;
- Markdown parsing;
- decision parsing;
- manifest reading;
- git status;
- git ls-files;
- file enumeration;
- schema loading;
- source hashing;
- test discovery.

Determine which results can safely be:

- cached;
- incrementally updated;
- memoized;
- shared between processes;
- invalidated by file/hash/version changes.

Do not cache anything without a clear invalidation rule.

---

# 10. Incremental validation

Research replacing full rescans with:

changed files
↓
dependency / rule impact map
↓
only affected validators/tests

while retaining full validation at defined assurance boundaries.

Compare:

FULL VALIDATION EVERY TIME

against:

INCREMENTAL FAST PATH
+
FULL VALIDATION AT CERTIFICATION / RELEASE / PERIODIC GATE.

Quantify expected speedup and risk.

---

# 11. Fast path / slow path

Consider a two-level script architecture:

FAST PATH

- syntax;
- schema;
- direct invariants;
- touched-file checks;
- write transaction validation;

SLOW PATH

- complete protocol suite;
- expensive cross-repository checks;
- exhaustive invariants;
- release/certification tests.

Research when each path is required.

---

# 12. TRACK B — Write Broker / Queue Architecture

Design a central repository-write service.

Possible names:

WRITE BROKER
INTEGRATION BROKER
MUTATION COORDINATOR
TRANSACTION QUEUE

The name is secondary.

Its semantics are critical.

---

# 13. Basic request lifecycle

Candidate state machine:

```text
CREATED
↓
QUEUED
↓
PRECHECKING
↓
READY
↓
INTEGRATING
↓
COMMITTED
```

Possible alternate terminal states:

```text
CONFLICT
STALE
REJECTED
FAILED
CANCELLED
BLOCKED_DEPENDENCY
```

Every state transition must have a machine-readable reason.

---

# 14. Write request schema

Research a minimal transaction envelope such as:

```yaml
request_id:
agent_id:
task_id:
stage_id:

baseline_sha:

operation:
outputs:
paths:

expected_preconditions:
expected_file_hashes:

change_bundle:
patch_or_commit:

validation_receipts:

dependencies:

priority:

idempotency_key:

submitted_at:
```

Do not overdesign the schema.

Determine the minimum fields required for:

- safety;
- conflict detection;
- idempotency;
- reproducibility;
- debugging.

---

# 15. Immediate acknowledgement

Submission should be cheap.

Example:

```text
SUBMIT
↓
ACK:
request_id=WR-142
state=QUEUED
```

An agent should not need to hold an interactive model turn open while waiting for mutation rights.

Research:

- callback;
- status file;
- event;
- supervisor notification;
- dependency trigger;

instead of repeated model polling.

---

# 16. Idempotency

A network retry or crashed client must not apply the same mutation twice.

Every request needs a deterministic idempotency mechanism.

Investigate:

idempotency_key =
hash(
  task_id

+ stage_id
+ baseline
+ change_bundle
  )

or superior alternatives.

Repeated submission of the same transaction should return the existing result, not create another write.

---

# 17. Conflict detection

Two agents may independently produce valid changes against the same baseline.

Research detection at several levels:

### Path conflict

both modify same file.

### Hunk conflict

same file, different/non-overlapping regions.

### Semantic dependency conflict

different files but one change invalidates assumptions of the other.

### Protocol-state conflict

both update the same registry/ledger/decision sequence.

### Baseline staleness

canonical HEAD changed since candidate creation.

Determine what can be resolved deterministically and what requires model/human intervention.

---

# 18. Optimistic concurrency

Investigate:

```text
agent works without global write lock
↓
records baseline
↓
submits candidate
↓
broker checks baseline/preconditions
↓
if unchanged:
    integrate
else:
    rebase/revalidate/conflict path
```

Compare with pessimistic global locking.

The target is maximum parallel work with minimum unsafe integration.

---

# 19. Granularity of serialization

Do NOT assume that every canonical mutation must share one global mutex forever.

Compare:

1. one global writer queue;
2. one integration broker with path-level locks;
3. namespace-level locks;
4. metadata queue + independent product-file writes;
5. Git-based transaction ordering.

Important:

A single logical authority does NOT necessarily require one physically serialized queue for all non-conflicting files.

Research whether:

```text
one authoritative broker
+
multiple non-conflicting transactions
```

can preserve invariants safely.

---

# 20. Special treatment of shared protocol metadata

Some files may genuinely require strict serialization:

- decision ledger;
- registry;
- shared journal indexes;
- global manifests;
- version counters;
- task registry.

Identify SINGLETON MUTATION RESOURCES.

Those may use strict FIFO/transaction semantics even if ordinary code changes can integrate more flexibly.

---

# 21. Queue scheduling

Compare:

- FIFO;
- priority;
- shortest-job-first;
- dependency-aware;
- critical-path-first;
- fairness-aware;
- transaction-size-aware.

Do not let a huge low-priority transaction starve many small high-value writes.

Also prevent permanent starvation of large requests.

---

# 22. Dependency-aware integration

Example:

```text
A produces specification
B implements against A
C reviews B
```

B's write should not integrate before the required A state exists.

Queue must understand at least explicit dependencies.

Research whether DAG scheduling is justified.

---

# 23. Agent count scaling

Test experimentally:

1 agent
2
5
10
15
20 if practical

Measure:

- completed tasks/hour;
- mean queue wait;
- p95 queue wait;
- write throughput;
- conflict rate;
- validation throughput;
- serialized agent-seconds;
- CPU;
- disk I/O;
- repository corruption/invariant failures.

Identify where scaling stops being useful.

---

# 24. Crash recovery

The broker itself becomes infrastructure.

Research behavior if it:

- crashes while request is queued;
- crashes during validation;
- crashes after applying files but before receipt;
- crashes after commit but before ACK;
- restarts with stale lock state.

Use durable transaction state.

No ambiguous:

"maybe written."

After recovery each transaction must be classifiable as:

NOT_APPLIED
APPLIED
or safely RECONCILABLE.

---

# 25. Single authoritative supervisor

Only one active mutation authority may own a given canonical repository generation unless a formally safe distributed protocol exists.

Research a lease containing at least:

- broker instance id;
- PID/process identity;
- creation time;
- repository root;
- HEAD/generation;
- started_at;
- heartbeat/lease expiry.

Avoid PID-only ownership.

A restarted broker must perform controlled takeover.

---

# 26. Security / policy boundary

Agents must not be able to bypass the broker by simply executing:

git commit
git push
direct write to protected shared metadata

if the workflow says those mutations belong to the broker.

Determine the minimum enforcement required.

Do NOT automatically jump to heavy VM/container isolation if simpler capability separation is sufficient.

---

# 27. Git delivery remains separate

Do not conflate:

CANONICAL LOCAL INTEGRATION

with:

REMOTE PUSH / RELEASE.

The broker may integrate locally.

Remote publication remains governed by delivery policy.

---

# 28. TRACK C — Procedure-to-Script Conversion

The third research track asks:

> Which current model instructions have become sufficiently deterministic, mature and stable that using an LLM to execute them is now unnecessary overhead?

Inventory procedures/instructions across the repository.

Candidates may include:

- structural validation;
- file presence checks;
- Evidence format checking;
- task-frame parsing;
- role/assignment checking;
- model availability discovery;
- context/token calculation;
- dependency inventory;
- queue submission;
- completion contract checks;
- routine status synthesis;
- deterministic error classification;
- journal/index maintenance.

Do not assume every detailed procedure should become code.

---

# 29. Scriptability criteria

A procedure is a strong script candidate when:

1. inputs are observable;
2. outputs are precisely defined;
3. decision branches are finite;
4. ambiguity is low;
5. expected result is deterministic;
6. error cases are enumerable;
7. false positives/negatives can be tested;
8. behaviour has been stable across enough real executions;
9. no semantic judgement is essential.

Research quantitative thresholds where possible.

---

# 30. Instruction maturity

Create a maturity model.

Possible levels:

### M0 — exploratory

procedure is still changing.

### M1 — documented

human/model can follow it.

### M2 — repeated

same procedure has been used successfully multiple times.

### M3 — stable

branches and failure modes are known.

### M4 — shadow-scriptable

script can run beside model procedure.

### M5 — deterministic authority

script replaces model execution for its bounded domain.

Do not promote directly from prose to authoritative script without shadow validation.

---

# 31. Shadow conversion

Preferred migration:

```text
MODEL PROCEDURE
      +
SHADOW SCRIPT
      ↓
compare results
      ↓
measure disagreements
      ↓
fix script/procedure
      ↓
sufficient agreement
      ↓
SCRIPT becomes primary
MODEL becomes exception/escalation
```

Determine promotion criteria.

---

# 32. Deterministic before probabilistic

Test the architectural principle:

> If a decision can be made cheaply and correctly by deterministic code, do not spend model reasoning on it.

Examples:

```text
Does file exist?
→ script

Is JSON valid?
→ script

Did tests pass?
→ script

Did required Evidence section exist?
→ script

Is the evidence semantically convincing?
→ model

Is architecture correct?
→ model/reviewer
```

The research should identify the exact boundary.

---

# 33. Script as tool, not duplicated instruction

When a procedure becomes script-backed, the model should not independently reproduce the same deterministic work.

Preferred interaction:

```text
model needs answer
↓
calls script
↓
script returns bounded structured result
↓
model continues semantic work
```

Avoid:

```text
model manually reads 50 files
+
script independently reads same 50 files
```

unless redundancy is deliberately required for certification.

---

# 34. Machine-readable script outputs

Scripts intended for agent use should prefer bounded structured output.

Example:

```json
{
  "status": "PASS",
  "checked": 14,
  "failed": 0,
  "evidence": [...]
}
```

rather than pages of prose.

This reduces:

- context usage;
- parsing ambiguity;
- model tokens;
- follow-up errors.

Research output schemas.

---

# 35. Script performance budget

Every script moved into the runtime hot path should have explicit performance targets.

Potential metrics:

- p50;
- p95;
- maximum expected time;
- bytes scanned;
- cache hit rate;
- lock hold time.

A script that is correct but destroys concurrency is not necessarily a successful runtime component.

---

# 36. Scripts must fail closed where appropriate

For safety/protocol enforcement:

unknown input
unsupported state
parse ambiguity
missing required state

must not silently become PASS.

Research where fail-closed is mandatory and where graceful degradation is preferable.

---

# 37. Avoid script monoculture risk

Replacing model procedures with code creates a new failure mode:

one incorrect deterministic script can reproduce the same mistake across every agent.

Therefore every promoted script should have:

- golden regression corpus;
- negative cases;
- historical failures;
- mutation tests where justified;
- versioning;
- rollback;
- independent audit before authority.

---

# 38. Script dependency graph

Produce:

```text
AGENT ACTION
   ↓
SCRIPT A
   ↓
SCRIPT B
   ↓
GIT
   ↓
VALIDATOR
```

for current runtime.

Identify:

- duplicate calls;
- cyclic dependencies;
- unnecessarily repeated full validation;
- scripts invoking expensive scripts internally;
- locks held across child calls.

This is required for optimization.

---

# 39. Critical-section audit

For every lock/lease/mutation path record:

```text
LOCK ACQUIRED
    ↓
operation 1
operation 2
...
    ↓
LOCK RELEASED
```

Measure every operation inside.

Ask:

> Does this operation actually require exclusive ownership?

Move anything unnecessary outside.

This is one of the primary optimization targets.

---

# 40. Candidate architecture to evaluate

Research this end-state:

```text
                ORCHESTRATOR
                     │
        ┌────────────┼─────────────┐
        ▼            ▼             ▼
      Agent        Agent          Agent
        │            │             │
        └── private workspaces ─────┘
                     │
                 candidate
                     ↓
             PREVALIDATION FARM
             parallel scripts/tests
                     ↓
                WRITE QUEUE
                     ↓
             INTEGRATION BROKER
                     ↓
          short atomic mutation
                     ↓
              canonical repo
                     ↓
          post-integration events
                     ↓
        reviewers / next workflow stage
```

Do not accept it merely because it appears in this prompt.

Compare credible alternatives.

---

# 41. Important research question: validation farm

If 15 agents finish near the same time, one serial validator may become the next bottleneck.

Investigate whether validation can be parallelized in private snapshots:

```text
candidate A → validation worker
candidate B → validation worker
candidate C → validation worker
```

and only integration itself serialized.

Determine:

- CPU limits;
- disk limits;
- test interference;
- cache sharing;
- test isolation.

---

# 42. Incremental post-integration validation

A candidate may pass on its own baseline and still conflict semantically with changes integrated before it.

Research:

PREVALIDATION
+
SHORT REVALIDATION AFTER REBASE/APPLY

instead of rerunning the entire expensive suite unnecessarily.

Define which checks must be repeated after integration.

---

# 43. Conflict repair workflow

When integration finds conflict:

do not simply reject and make the original agent start from zero.

Possible:

```text
CONFLICT
↓
generate compact conflict packet
↓
resume original agent
or
dispatch cheap repair agent
↓
resubmit
```

Study cost/time trade-offs.

---

# 44. Queue observability

Required metrics may include:

- current queue depth;
- oldest request age;
- median wait;
- p95 wait;
- integration throughput;
- conflict rate;
- rejected/stale rate;
- broker utilization;
- validation utilization.

But apply the usefulness rule:

do not collect metrics that do not change decisions.

---

# 45. Backpressure

If agents produce work faster than integration can consume it, the system needs backpressure.

Research:

- queue-depth threshold;
- launch throttling;
- task prioritization;
- pause low-value agent launches;
- allocate agents to research/read-only work while writes drain.

Without this, concurrency can produce latency rather than throughput.

---

# 46. Performance objective

The key metric should not merely be:

number of simultaneous agents.

Use:

**Accepted Work Throughput**

for example:

accepted stages / hour

plus:

**Resource Efficiency**

and:

**p95 completion latency**.

A system with 30 agents and a 90-minute write queue may be worse than one with 8 agents.

---

# 47. Experimental plan

Benchmark at minimum:

## Baseline

current direct-write / current locking behaviour.

## Architecture A

global single writer queue.

## Architecture B

single authoritative broker + optimistic private work + short critical section.

## Architecture C

broker + parallel prevalidation + incremental integration checks.

If justified:

## Architecture D

path/resource-aware parallel mutation under one authority.

Run reproducible workloads with:

1
2
5
10
15

concurrent synthetic or historical tasks.

---

# 48. Required measurements

For every configuration measure:

- completed accepted work;
- total elapsed time;
- agent idle time;
- queue wait;
- lock wait;
- serialized agent-seconds;
- conflicts;
- retries;
- stale candidates;
- test invocations;
- validation time;
- duplicated computation;
- disk/CPU pressure;
- invariant failures;
- human interventions.

---

# 49. Current-script optimization must not wait for the entire redesign

The research must identify QUICK WINS.

If a current script demonstrably dominates runtime and can be safely optimized independently:

classify:

OPTIMIZE NOW

Do not defer obvious performance work merely because the final broker architecture is unfinished.

For every quick win provide:

- measured bottleneck;
- proposed optimization;
- expected benefit;
- correctness risk;
- regression tests;
- rollback.

---

# 50. Procedure conversion must also identify immediate candidates

Produce three groups:

### CONVERT NOW

stable + deterministic + high repetition + measurable.

### SHADOW SCRIPT

likely deterministic but insufficient evidence.

### KEEP AS MODEL PROCEDURE

semantic judgement still material.

---

# 51. Required research outputs

Produce at least:

`SCRIPT-RUNTIME-PERFORMANCE.md`

containing:

- current script inventory;
- timings;
- call graph;
- lock/critical-section graph;
- bottlenecks;
- repeated work;
- immediate optimization candidates.

`WRITE-BROKER-ARCHITECTURE.md`

containing:

- transaction model;
- queue semantics;
- concurrency control;
- conflict detection;
- crash recovery;
- idempotency;
- state machine;
- scaling tests.

`PROCEDURE-TO-SCRIPT.md`

containing:

- instruction inventory;
- scriptability scoring;
- convert-now list;
- shadow candidates;
- procedures that must remain semantic.

And finally:

`HIGH-CONCURRENCY-RUNTIME-SYNTHESIS.md`

that combines all three tracks into one proposed architecture.

---

# 52. Mandatory decision table

For every existing expensive script:

| Script | p50 | p95 | Lock hold | Blocks others? | Duplicate work | Optimization | Expected gain | Priority |
| ------ | --: | --: | --------: | -------------- | -------------- | ------------ | ------------: | -------- |

For every candidate procedure:

| Procedure | Determinism | Frequency | Model cost | Scriptability | Failure risk | Recommendation |
| --------- | ----------: | --------: | ---------: | ------------: | -----------: | -------------- |

For every broker alternative:

| Architecture | Safety | Throughput | p95 wait | Complexity | Recovery | Scalability | Main weakness |
| ------------ | -----: | ---------: | -------: | ---------: | -------: | ----------: | ------------- |

---

# 53. Falsification

Explicitly look for evidence that falsifies the proposed architecture.

Examples:

- writes are not actually the dominant scaling bottleneck;
- filesystem/Git allows safer useful parallel mutation than expected;
- broker becomes a worse bottleneck than current locking;
- conflicts dominate even with private workspaces;
- validation CPU/disk is the real bottleneck;
- procedure-to-script conversion creates excessive maintenance cost;
- incremental validation misses important cross-cutting defects.

Do not force the answer toward a central queue if measurements reject it.

---

# 54. Final target

The final runtime should ideally let a large number of agents:

- read concurrently;
- reason concurrently;
- research concurrently;
- implement concurrently in isolated state;
- validate concurrently where safe;

while canonical mutation is:

- short;
- transactional;
- conflict-aware;
- deterministic;
- recoverable;
- centrally observable.

The question is not:

"How do we safely run 15 agents?"

The question is:

> "What architecture maximizes accepted work throughput as concurrency increases, while preserving repository integrity and minimizing model, CPU, I/O and human cost?"

```

Я бы ещё добавил к этому исследованию **один очень важный инвариант**, который у вас сейчас фактически рождается:

> **LLM не должен ждать право на запись. LLM должен завершить интеллектуальную работу, передать готовую транзакцию инфраструктуре и освободиться для следующей работы.**

Это существенно. Если модель после 15 минут reasoning ещё 4 минуты держится живой только потому, что ждёт `lock`, вы оплачиваете оркестрационный дефект модельными ресурсами.

Поэтому правильная схема скорее такая:

```text
AGENT
  │
  ├─ сделал интеллектуальную работу
  │
  ├─ создал candidate
  │
  └─ SUBMIT → WR-142
                 │
        "accepted into queue"
                 │
AGENT FREE       │
                 ▼
          deterministic runtime
                 │
          integration / conflict
                 │
                 ▼
        event запускает следующий stage
```

И я бы отдельно поставил исследователям задачу проверить ещё одну вещь: **нужен ли физически один writer или достаточно одного authoritative transaction coordinator**. Это не одно и то же. Вполне возможно, что `DECISIONS.md` и registry должны строго сериализоваться, а два агента, меняющие независимые исходники, смогут интегрироваться параллельнее. Лучше не зацементировать глобальный mutex до измерений.

А третья ваша идея — превращение зрелых инструкций в код — здесь особенно хорошо замыкается: постепенно получается архитектура **«модель делает только то, где нужен интеллект; всё остальное поглощает быстрый детерминированный runtime»**. Это, вероятно, второй крупный источник ускорения после экономического выбора моделе

Да. Здесь уже вырисовывается отдельная **исследовательская программа по script/runtime layer**, и она напрямую связана с возможностью перейти от 2–3 параллельных агентов к условным 10–15 и более.

Причём я бы немного уточнил вашу формулировку архитектуры. Главная цель — не просто «поставить lock на репозиторий», а сделать так, чтобы **канонический repository имел одного арбитра записи, а агенты никогда не конкурировали за него напрямую**:

```text
15 AGENTS
   │
   ├─ read freely
   ├─ work in isolated/private workspace
   └─ submit WRITE REQUEST
              ↓
       WRITE BROKER / QUEUE
              ↓
      validate transaction
              ↓
       conflict detection
              ↓
        canonical write
              ↓
          ACK / result
```

И ещё важнее: **дорогие проверки нельзя без необходимости выполнять внутри write-lock**. Иначе мы просто заменим конфликт агентов одной огромной последовательной пробкой. Из уже зафиксированных запусков Colabs видно, что `validate-protocol.ps1` проходил примерно за 3 секунды, тогда как полный `test-protocol.ps1` занимал около 297 секунд. Значит, вопрос «что действительно должно происходить в критической секции?» — один из центральных вопросов исследования, а не деталь реализации. Эти цифры зафиксированы, например, в журнале коммита `4a85a23`; текущие соответствующие скрипты — `validate-protocol.ps1`, `test-protocol.ps1`, `.ai/bin/protocol-lock.cjs`, `protocol-handoff.cjs`, `protocol-ledger.cjs`, `protocol-verdict.cjs`, `protocol-archive.cjs` и др.

Ниже я бы дал исследовательской группе такой master prompt.

```markdown
# RESEARCH PROGRAM
## High-Concurrency Script Runtime, Single-Writer Integration and Procedure Automation

**Status:** RESEARCH
**Mode:** measurement-first, adversarial, architecture-producing
**Target:** Colabs protocol/runtime layer
**Primary objective:** enable many concurrent AI agents to work safely and efficiently without repository write contention, unnecessary serialized waiting, or repeated LLM work that deterministic code can perform better.

---

# 1. Research goal

Design the script/runtime architecture required for high-concurrency multi-agent operation.

The target operating regime is not 1–2 agents.

Assume that the system may need to support approximately:

5
10
15
or more

simultaneously active agents.

Reading repository state may remain highly concurrent.

Canonical repository mutation must remain controlled, reproducible and conflict-safe.

The research must address three related but distinct problems:

1. SCRIPT PERFORMANCE
   Find and optimize scripts/checks that currently dominate wall-clock time or hold shared resources for too long.

2. WRITE SERIALIZATION / TRANSACTION QUEUE
   Design a central mechanism through which concurrent agents submit completed changes for safe integration rather than competing for canonical repository writes themselves.

3. PROCEDURE → SCRIPT CONVERSION
   Identify mature, deterministic, repeatedly executed instructions that are now sufficiently stable to be converted from model reasoning into fast deterministic scripts.

Do not assume the proposed architecture is optimal.
Test alternatives.

---

# 2. Overall optimization objective

The target is:

MAXIMIZE:
- useful concurrent agent throughput;
- accepted work completed per unit time;
- deterministic work performed by scripts rather than models;

MINIMIZE:
- repository lock time;
- queue wait time;
- repeated validation;
- duplicate reads;
- duplicate computation;
- model tokens spent on deterministic operations;
- merge/write conflicts;
- human intervention;
- unnecessary serialization.

SUBJECT TO:
- correctness;
- integrity;
- reproducibility;
- safety;
- evidence requirements;
- protocol invariants.

---

# 3. Core architectural hypothesis

Investigate this architecture:

```text
                    READ PLANE
              concurrent / mostly free
                       │
       ┌───────────────┼───────────────┐
       ▼               ▼               ▼
    Agent A          Agent B          Agent N
       │               │               │
       │ private work / isolated state │
       └───────────────┬───────────────┘
                       │
                WRITE REQUESTS
                       ↓
             WRITE BROKER / QUEUE
                       ↓
                PRECONDITION CHECK
                       ↓
               CONFLICT DETECTION
                       ↓
              ATOMIC INTEGRATION
                       ↓
                CANONICAL REPO
```

Main hypothesis:

> Agents should not independently acquire and hold the canonical repository for ordinary writes.
> They should submit bounded write transactions to a deterministic integration service.

The service should acknowledge:

- request accepted;
- request id;
- queue state/position if useful;
- dependencies;
- eventual result.

Example interaction:

Agent:
"I finished candidate X. Submit it for integration."

Broker:
"Accepted: write-request WR-142. State=QUEUED."

The agent should not sit inside an LLM loop continuously asking whether the lock is free.

---

# 4. Critical distinction: agent workspace vs canonical repository

Research whether agents should be allowed to write freely inside isolated/private workspaces while being forbidden from directly mutating canonical shared state.

Potential model:

```text
CANONICAL REPOSITORY
    single controlled writer

AGENT WORKSPACE A
    private writable

AGENT WORKSPACE B
    private writable

AGENT WORKSPACE N
    private writable
```

The write broker receives:

- patch;
- commit;
- change bundle;
- declared outputs;
- baseline SHA;
- expected target hashes;
- evidence;
- validation receipt;

and integrates it into the canonical repository.

Compare:

- disposable clones;
- git worktrees;
- branch-per-agent;
- patch bundles;
- temporary directories;
- in-memory transactions.

Determine which gives the best safety/performance ratio on Windows and the project's real tooling.

---

# 5. Do not confuse single writer with global long lock

This is a critical research question.

A naive design:

```text
take global lock
↓
run five-minute tests
↓
write
↓
release lock
```

may destroy concurrency.

Investigate a design where expensive work happens BEFORE the critical section:

```text
candidate prepared privately
↓
expensive validation privately
↓
enqueue transaction
↓
wait
↓
SHORT CRITICAL SECTION:
    verify baseline/preconditions
    detect conflicting changes
    apply transaction
    perform minimal integration checks
    record mutation
↓
release writer
↓
post-integration checks if needed
```

Research exactly which operations MUST occur under exclusive mutation ownership and which must not.

---

# 6. TRACK A — Script Performance Audit and Optimization

Measure current script performance before redesign.

Do not optimize from intuition.

Inventory at least:

- validate-protocol.ps1
- test-protocol.ps1
- protocol-lock.cjs
- protocol-handoff.cjs
- protocol-hooks.cjs
- protocol-ledger.cjs
- protocol-verdict.cjs
- protocol-scope.cjs
- protocol-session.cjs
- protocol-archive.cjs
- protocol-index.cjs
- dispatch/supervisor scripts
- relevant test harnesses
- validators invoked transitively by these scripts.

Build the actual call graph.

---

# 7. Performance measurements

For every important script measure:

- cold start time;
- warm execution time;
- median;
- p90;
- p95;
- worst observed;
- CPU time;
- wall time;
- filesystem I/O;
- files scanned;
- bytes read;
- subprocess count;
- child-process time;
- Git command count;
- repeated parsing;
- repeated hashing;
- repeated repository scans;
- lock acquisition time;
- lock hold time;
- time waiting for another process;
- test time;
- validation time.

Separate:

EXECUTION TIME

from:

SHARED-RESOURCE HOLD TIME.

A 30-second script holding no shared resource may be less damaging than a 3-second operation holding a global writer lock under high concurrency.

---

# 8. Concurrency-weighted bottleneck metric

Research a metric stronger than simple duration.

Candidate:

ContentionCost =
LockHoldTime
× NumberOfBlockedWorkers

or more generally:

SerializedAgentSeconds =
Σ wait_time_of_every_blocked_agent

Example:

one script takes 20 seconds

but blocks 15 agents

→ effective concurrency cost may be approximately 300 agent-seconds.

Determine a useful metric.

This should help prioritize optimization.

---

# 9. Find repeated work

Search for scripts repeatedly performing the same expensive operations:

- repository inventory;
- full tree hashing;
- Markdown parsing;
- decision parsing;
- manifest reading;
- git status;
- git ls-files;
- file enumeration;
- schema loading;
- source hashing;
- test discovery.

Determine which results can safely be:

- cached;
- incrementally updated;
- memoized;
- shared between processes;
- invalidated by file/hash/version changes.

Do not cache anything without a clear invalidation rule.

---

# 10. Incremental validation

Research replacing full rescans with:

changed files
↓
dependency / rule impact map
↓
only affected validators/tests

while retaining full validation at defined assurance boundaries.

Compare:

FULL VALIDATION EVERY TIME

against:

INCREMENTAL FAST PATH
+
FULL VALIDATION AT CERTIFICATION / RELEASE / PERIODIC GATE.

Quantify expected speedup and risk.

---

# 11. Fast path / slow path

Consider a two-level script architecture:

FAST PATH

- syntax;
- schema;
- direct invariants;
- touched-file checks;
- write transaction validation;

SLOW PATH

- complete protocol suite;
- expensive cross-repository checks;
- exhaustive invariants;
- release/certification tests.

Research when each path is required.

---

# 12. TRACK B — Write Broker / Queue Architecture

Design a central repository-write service.

Possible names:

WRITE BROKER
INTEGRATION BROKER
MUTATION COORDINATOR
TRANSACTION QUEUE

The name is secondary.

Its semantics are critical.

---

# 13. Basic request lifecycle

Candidate state machine:

```text
CREATED
↓
QUEUED
↓
PRECHECKING
↓
READY
↓
INTEGRATING
↓
COMMITTED
```

Possible alternate terminal states:

```text
CONFLICT
STALE
REJECTED
FAILED
CANCELLED
BLOCKED_DEPENDENCY
```

Every state transition must have a machine-readable reason.

---

# 14. Write request schema

Research a minimal transaction envelope such as:

```yaml
request_id:
agent_id:
task_id:
stage_id:

baseline_sha:

operation:
outputs:
paths:

expected_preconditions:
expected_file_hashes:

change_bundle:
patch_or_commit:

validation_receipts:

dependencies:

priority:

idempotency_key:

submitted_at:
```

Do not overdesign the schema.

Determine the minimum fields required for:

- safety;
- conflict detection;
- idempotency;
- reproducibility;
- debugging.

---

# 15. Immediate acknowledgement

Submission should be cheap.

Example:

```text
SUBMIT
↓
ACK:
request_id=WR-142
state=QUEUED
```

An agent should not need to hold an interactive model turn open while waiting for mutation rights.

Research:

- callback;
- status file;
- event;
- supervisor notification;
- dependency trigger;

instead of repeated model polling.

---

# 16. Idempotency

A network retry or crashed client must not apply the same mutation twice.

Every request needs a deterministic idempotency mechanism.

Investigate:

idempotency_key =
hash(
  task_id

+ stage_id
+ baseline
+ change_bundle
  )

or superior alternatives.

Repeated submission of the same transaction should return the existing result, not create another write.

---

# 17. Conflict detection

Two agents may independently produce valid changes against the same baseline.

Research detection at several levels:

### Path conflict

both modify same file.

### Hunk conflict

same file, different/non-overlapping regions.

### Semantic dependency conflict

different files but one change invalidates assumptions of the other.

### Protocol-state conflict

both update the same registry/ledger/decision sequence.

### Baseline staleness

canonical HEAD changed since candidate creation.

Determine what can be resolved deterministically and what requires model/human intervention.

---

# 18. Optimistic concurrency

Investigate:

```text
agent works without global write lock
↓
records baseline
↓
submits candidate
↓
broker checks baseline/preconditions
↓
if unchanged:
    integrate
else:
    rebase/revalidate/conflict path
```

Compare with pessimistic global locking.

The target is maximum parallel work with minimum unsafe integration.

---

# 19. Granularity of serialization

Do NOT assume that every canonical mutation must share one global mutex forever.

Compare:

1. one global writer queue;
2. one integration broker with path-level locks;
3. namespace-level locks;
4. metadata queue + independent product-file writes;
5. Git-based transaction ordering.

Important:

A single logical authority does NOT necessarily require one physically serialized queue for all non-conflicting files.

Research whether:

```text
one authoritative broker
+
multiple non-conflicting transactions
```

can preserve invariants safely.

---

# 20. Special treatment of shared protocol metadata

Some files may genuinely require strict serialization:

- decision ledger;
- registry;
- shared journal indexes;
- global manifests;
- version counters;
- task registry.

Identify SINGLETON MUTATION RESOURCES.

Those may use strict FIFO/transaction semantics even if ordinary code changes can integrate more flexibly.

---

# 21. Queue scheduling

Compare:

- FIFO;
- priority;
- shortest-job-first;
- dependency-aware;
- critical-path-first;
- fairness-aware;
- transaction-size-aware.

Do not let a huge low-priority transaction starve many small high-value writes.

Also prevent permanent starvation of large requests.

---

# 22. Dependency-aware integration

Example:

```text
A produces specification
B implements against A
C reviews B
```

B's write should not integrate before the required A state exists.

Queue must understand at least explicit dependencies.

Research whether DAG scheduling is justified.

---

# 23. Agent count scaling

Test experimentally:

1 agent
2
5
10
15
20 if practical

Measure:

- completed tasks/hour;
- mean queue wait;
- p95 queue wait;
- write throughput;
- conflict rate;
- validation throughput;
- serialized agent-seconds;
- CPU;
- disk I/O;
- repository corruption/invariant failures.

Identify where scaling stops being useful.

---

# 24. Crash recovery

The broker itself becomes infrastructure.

Research behavior if it:

- crashes while request is queued;
- crashes during validation;
- crashes after applying files but before receipt;
- crashes after commit but before ACK;
- restarts with stale lock state.

Use durable transaction state.

No ambiguous:

"maybe written."

After recovery each transaction must be classifiable as:

NOT_APPLIED
APPLIED
or safely RECONCILABLE.

---

# 25. Single authoritative supervisor

Only one active mutation authority may own a given canonical repository generation unless a formally safe distributed protocol exists.

Research a lease containing at least:

- broker instance id;
- PID/process identity;
- creation time;
- repository root;
- HEAD/generation;
- started_at;
- heartbeat/lease expiry.

Avoid PID-only ownership.

A restarted broker must perform controlled takeover.

---

# 26. Security / policy boundary

Agents must not be able to bypass the broker by simply executing:

git commit
git push
direct write to protected shared metadata

if the workflow says those mutations belong to the broker.

Determine the minimum enforcement required.

Do NOT automatically jump to heavy VM/container isolation if simpler capability separation is sufficient.

---

# 27. Git delivery remains separate

Do not conflate:

CANONICAL LOCAL INTEGRATION

with:

REMOTE PUSH / RELEASE.

The broker may integrate locally.

Remote publication remains governed by delivery policy.

---

# 28. TRACK C — Procedure-to-Script Conversion

The third research track asks:

> Which current model instructions have become sufficiently deterministic, mature and stable that using an LLM to execute them is now unnecessary overhead?

Inventory procedures/instructions across the repository.

Candidates may include:

- structural validation;
- file presence checks;
- Evidence format checking;
- task-frame parsing;
- role/assignment checking;
- model availability discovery;
- context/token calculation;
- dependency inventory;
- queue submission;
- completion contract checks;
- routine status synthesis;
- deterministic error classification;
- journal/index maintenance.

Do not assume every detailed procedure should become code.

---

# 29. Scriptability criteria

A procedure is a strong script candidate when:

1. inputs are observable;
2. outputs are precisely defined;
3. decision branches are finite;
4. ambiguity is low;
5. expected result is deterministic;
6. error cases are enumerable;
7. false positives/negatives can be tested;
8. behaviour has been stable across enough real executions;
9. no semantic judgement is essential.

Research quantitative thresholds where possible.

---

# 30. Instruction maturity

Create a maturity model.

Possible levels:

### M0 — exploratory

procedure is still changing.

### M1 — documented

human/model can follow it.

### M2 — repeated

same procedure has been used successfully multiple times.

### M3 — stable

branches and failure modes are known.

### M4 — shadow-scriptable

script can run beside model procedure.

### M5 — deterministic authority

script replaces model execution for its bounded domain.

Do not promote directly from prose to authoritative script without shadow validation.

---

# 31. Shadow conversion

Preferred migration:

```text
MODEL PROCEDURE
      +
SHADOW SCRIPT
      ↓
compare results
      ↓
measure disagreements
      ↓
fix script/procedure
      ↓
sufficient agreement
      ↓
SCRIPT becomes primary
MODEL becomes exception/escalation
```

Determine promotion criteria.

---

# 32. Deterministic before probabilistic

Test the architectural principle:

> If a decision can be made cheaply and correctly by deterministic code, do not spend model reasoning on it.

Examples:

```text
Does file exist?
→ script

Is JSON valid?
→ script

Did tests pass?
→ script

Did required Evidence section exist?
→ script

Is the evidence semantically convincing?
→ model

Is architecture correct?
→ model/reviewer
```

The research should identify the exact boundary.

---

# 33. Script as tool, not duplicated instruction

When a procedure becomes script-backed, the model should not independently reproduce the same deterministic work.

Preferred interaction:

```text
model needs answer
↓
calls script
↓
script returns bounded structured result
↓
model continues semantic work
```

Avoid:

```text
model manually reads 50 files
+
script independently reads same 50 files
```

unless redundancy is deliberately required for certification.

---

# 34. Machine-readable script outputs

Scripts intended for agent use should prefer bounded structured output.

Example:

```json
{
  "status": "PASS",
  "checked": 14,
  "failed": 0,
  "evidence": [...]
}
```

rather than pages of prose.

This reduces:

- context usage;
- parsing ambiguity;
- model tokens;
- follow-up errors.

Research output schemas.

---

# 35. Script performance budget

Every script moved into the runtime hot path should have explicit performance targets.

Potential metrics:

- p50;
- p95;
- maximum expected time;
- bytes scanned;
- cache hit rate;
- lock hold time.

A script that is correct but destroys concurrency is not necessarily a successful runtime component.

---

# 36. Scripts must fail closed where appropriate

For safety/protocol enforcement:

unknown input
unsupported state
parse ambiguity
missing required state

must not silently become PASS.

Research where fail-closed is mandatory and where graceful degradation is preferable.

---

# 37. Avoid script monoculture risk

Replacing model procedures with code creates a new failure mode:

one incorrect deterministic script can reproduce the same mistake across every agent.

Therefore every promoted script should have:

- golden regression corpus;
- negative cases;
- historical failures;
- mutation tests where justified;
- versioning;
- rollback;
- independent audit before authority.

---

# 38. Script dependency graph

Produce:

```text
AGENT ACTION
   ↓
SCRIPT A
   ↓
SCRIPT B
   ↓
GIT
   ↓
VALIDATOR
```

for current runtime.

Identify:

- duplicate calls;
- cyclic dependencies;
- unnecessarily repeated full validation;
- scripts invoking expensive scripts internally;
- locks held across child calls.

This is required for optimization.

---

# 39. Critical-section audit

For every lock/lease/mutation path record:

```text
LOCK ACQUIRED
    ↓
operation 1
operation 2
...
    ↓
LOCK RELEASED
```

Measure every operation inside.

Ask:

> Does this operation actually require exclusive ownership?

Move anything unnecessary outside.

This is one of the primary optimization targets.

---

# 40. Candidate architecture to evaluate

Research this end-state:

```text
                ORCHESTRATOR
                     │
        ┌────────────┼─────────────┐
        ▼            ▼             ▼
      Agent        Agent          Agent
        │            │             │
        └── private workspaces ─────┘
                     │
                 candidate
                     ↓
             PREVALIDATION FARM
             parallel scripts/tests
                     ↓
                WRITE QUEUE
                     ↓
             INTEGRATION BROKER
                     ↓
          short atomic mutation
                     ↓
              canonical repo
                     ↓
          post-integration events
                     ↓
        reviewers / next workflow stage
```

Do not accept it merely because it appears in this prompt.

Compare credible alternatives.

---

# 41. Important research question: validation farm

If 15 agents finish near the same time, one serial validator may become the next bottleneck.

Investigate whether validation can be parallelized in private snapshots:

```text
candidate A → validation worker
candidate B → validation worker
candidate C → validation worker
```

and only integration itself serialized.

Determine:

- CPU limits;
- disk limits;
- test interference;
- cache sharing;
- test isolation.

---

# 42. Incremental post-integration validation

A candidate may pass on its own baseline and still conflict semantically with changes integrated before it.

Research:

PREVALIDATION
+
SHORT REVALIDATION AFTER REBASE/APPLY

instead of rerunning the entire expensive suite unnecessarily.

Define which checks must be repeated after integration.

---

# 43. Conflict repair workflow

When integration finds conflict:

do not simply reject and make the original agent start from zero.

Possible:

```text
CONFLICT
↓
generate compact conflict packet
↓
resume original agent
or
dispatch cheap repair agent
↓
resubmit
```

Study cost/time trade-offs.

---

# 44. Queue observability

Required metrics may include:

- current queue depth;
- oldest request age;
- median wait;
- p95 wait;
- integration throughput;
- conflict rate;
- rejected/stale rate;
- broker utilization;
- validation utilization.

But apply the usefulness rule:

do not collect metrics that do not change decisions.

---

# 45. Backpressure

If agents produce work faster than integration can consume it, the system needs backpressure.

Research:

- queue-depth threshold;
- launch throttling;
- task prioritization;
- pause low-value agent launches;
- allocate agents to research/read-only work while writes drain.

Without this, concurrency can produce latency rather than throughput.

---

# 46. Performance objective

The key metric should not merely be:

number of simultaneous agents.

Use:

**Accepted Work Throughput**

for example:

accepted stages / hour

plus:

**Resource Efficiency**

and:

**p95 completion latency**.

A system with 30 agents and a 90-minute write queue may be worse than one with 8 agents.

---

# 47. Experimental plan

Benchmark at minimum:

## Baseline

current direct-write / current locking behaviour.

## Architecture A

global single writer queue.

## Architecture B

single authoritative broker + optimistic private work + short critical section.

## Architecture C

broker + parallel prevalidation + incremental integration checks.

If justified:

## Architecture D

path/resource-aware parallel mutation under one authority.

Run reproducible workloads with:

1
2
5
10
15

concurrent synthetic or historical tasks.

---

# 48. Required measurements

For every configuration measure:

- completed accepted work;
- total elapsed time;
- agent idle time;
- queue wait;
- lock wait;
- serialized agent-seconds;
- conflicts;
- retries;
- stale candidates;
- test invocations;
- validation time;
- duplicated computation;
- disk/CPU pressure;
- invariant failures;
- human interventions.

---

# 49. Current-script optimization must not wait for the entire redesign

The research must identify QUICK WINS.

If a current script demonstrably dominates runtime and can be safely optimized independently:

classify:

OPTIMIZE NOW

Do not defer obvious performance work merely because the final broker architecture is unfinished.

For every quick win provide:

- measured bottleneck;
- proposed optimization;
- expected benefit;
- correctness risk;
- regression tests;
- rollback.

---

# 50. Procedure conversion must also identify immediate candidates

Produce three groups:

### CONVERT NOW

stable + deterministic + high repetition + measurable.

### SHADOW SCRIPT

likely deterministic but insufficient evidence.

### KEEP AS MODEL PROCEDURE

semantic judgement still material.

---

# 51. Required research outputs

Produce at least:

`SCRIPT-RUNTIME-PERFORMANCE.md`

containing:

- current script inventory;
- timings;
- call graph;
- lock/critical-section graph;
- bottlenecks;
- repeated work;
- immediate optimization candidates.

`WRITE-BROKER-ARCHITECTURE.md`

containing:

- transaction model;
- queue semantics;
- concurrency control;
- conflict detection;
- crash recovery;
- idempotency;
- state machine;
- scaling tests.

`PROCEDURE-TO-SCRIPT.md`

containing:

- instruction inventory;
- scriptability scoring;
- convert-now list;
- shadow candidates;
- procedures that must remain semantic.

And finally:

`HIGH-CONCURRENCY-RUNTIME-SYNTHESIS.md`

that combines all three tracks into one proposed architecture.

---

# 52. Mandatory decision table

For every existing expensive script:

| Script | p50 | p95 | Lock hold | Blocks others? | Duplicate work | Optimization | Expected gain | Priority |
| ------ | --: | --: | --------: | -------------- | -------------- | ------------ | ------------: | -------- |

For every candidate procedure:

| Procedure | Determinism | Frequency | Model cost | Scriptability | Failure risk | Recommendation |
| --------- | ----------: | --------: | ---------: | ------------: | -----------: | -------------- |

For every broker alternative:

| Architecture | Safety | Throughput | p95 wait | Complexity | Recovery | Scalability | Main weakness |
| ------------ | -----: | ---------: | -------: | ---------: | -------: | ----------: | ------------- |

---

# 53. Falsification

Explicitly look for evidence that falsifies the proposed architecture.

Examples:

- writes are not actually the dominant scaling bottleneck;
- filesystem/Git allows safer useful parallel mutation than expected;
- broker becomes a worse bottleneck than current locking;
- conflicts dominate even with private workspaces;
- validation CPU/disk is the real bottleneck;
- procedure-to-script conversion creates excessive maintenance cost;
- incremental validation misses important cross-cutting defects.

Do not force the answer toward a central queue if measurements reject it.

---

# 54. Final target

The final runtime should ideally let a large number of agents:

- read concurrently;
- reason concurrently;
- research concurrently;
- implement concurrently in isolated state;
- validate concurrently where safe;

while canonical mutation is:

- short;
- transactional;
- conflict-aware;
- deterministic;
- recoverable;
- centrally observable.

The question is not:

"How do we safely run 15 agents?"

The question is:

> "What architecture maximizes accepted work throughput as concurrency increases, while preserving repository integrity and minimizing model, CPU, I/O and human cost?"

```

Я бы ещё добавил к этому исследованию **один очень важный инвариант**, который у вас сейчас фактически рождается:

> **LLM не должен ждать право на запись. LLM должен завершить интеллектуальную работу, передать готовую транзакцию инфраструктуре и освободиться для следующей работы.**

Это существенно. Если модель после 15 минут reasoning ещё 4 минуты держится живой только потому, что ждёт `lock`, вы оплачиваете оркестрационный дефект модельными ресурсами.

Поэтому правильная схема скорее такая:

```text
AGENT
  │
  ├─ сделал интеллектуальную работу
  │
  ├─ создал candidate
  │
  └─ SUBMIT → WR-142
                 │
        "accepted into queue"
                 │
AGENT FREE       │
                 ▼
          deterministic runtime
                 │
          integration / conflict
                 │
                 ▼
        event запускает следующий stage
```

И я бы отдельно поставил исследователям задачу проверить ещё одну вещь: **нужен ли физически один writer или достаточно одного authoritative transaction coordinator**. Это не одно и то же. Вполне возможно, что `DECISIONS.md` и registry должны строго сериализоваться, а два агента, меняющие независимые исходники, смогут интегрироваться параллельнее. Лучше не зацементировать глобальный mutex до измерений.

А третья ваша идея — превращение зрелых инструкций в код — здесь особенно хорошо замыкается: постепенно получается архитектура **«модель делает только то, где нужен интеллект; всё остальное поглощает быстрый детерминированный runtime»**. Это, вероятно, второй крупный источник ускорения после экономического выбора моделей.
