# OWNER DECISION — ROUND 3 / PACKAGE L

## 1. F-3P-1 НЕ СЧИТАТЬ ЗАКРЫТЫМ РЕШЕНИЕМ

Finding:

**F-3P-1 — задача способна обойти декларативный запрет `git push`, если процесс обладает write-capable Git credentials.**

Известные примеры обхода:

- `git -c url.<other>.insteadOf=... push`;
- изменение global/local Git configuration;
- альтернативный remote;
- прямое использование credential helper;
- использование иного Git transport/path, если credentials доступны процессу.

Простая проверка:

`git ls-remote before / after`

не должна автоматически считаться достаточным security boundary, поскольку она проверяет главным образом итоговое состояние refs и потенциально может не обнаружить transient push или связанные побочные эффекты.

При этом **не считать заранее доказанным**, что правильным решением является полная sandbox/container/VM isolation.

Это новая архитектурная гипотеза, которую Round 3 и последующие исследования должны проверить.

---

# HYPOTHESIS L-GIT-01

## Capability-based Git Delivery может закрыть F-3P-1 без чрезмерной изоляции и операционной бюрократии

Предварительная идея:

разделить две разные характеристики задачи:

### A. Permission to push
Имеет ли execution context техническую возможность публиковать изменения.

### B. Requirement to push
Требует ли сама задача публикации результата после успешного выполнения.

Они не должны считаться одним и тем же свойством.

---

# ПРЕДПОЛАГАЕМАЯ МОДЕЛЬ

Исследовать возможность введения task-level Git mode.

Минимальный кандидат:

### `READ_ONLY`

Назначение:

- research;
- council;
- audit;
- review;
- adversarial analysis;
- planning.

Ожидаемое поведение:

- repository read: YES;
- edit: возможно NO или disposable;
- local commit: необязательно;
- remote push: NO.

---

### `LOCAL_COMMIT`

Назначение:

- экспериментальная реализация;
- подготовка patch;
- implementation до review;
- challenge tasks.

Ожидаемое поведение:

- edit: YES;
- test: YES;
- local commit: YES;
- push: NO.

---

### `BRANCH_PUSH`

Назначение:

- утверждённая implementation task;
- изменение, которое после validation должно быть опубликовано в выделенную ветку.

Ожидаемое поведение:

- edit: YES;
- local commit: YES;
- validation: REQUIRED;
- push approved target branch: YES;
- push protected/unapproved targets: NO.

---

### `RELEASE_PUSH`

Назначение:

- final delivery;
- merge/release operations;
- отдельные специально разрешённые publish stages.

Ожидаемое поведение:

- доступ разрешается только после release gates;
- разрешённые refs/targets должны быть явными.

---

# ОСНОВНАЯ ГИПОТЕЗА

Возможно, оптимальная архитектура выглядит не так:

`Agent decides when to push`

и не так:

`All agents are always fully sandboxed`

а так:

`Task declares delivery mode → agent performs work → validator/tests → trusted delivery layer performs allowed publication`.

Пример:

```text
TASK
  ↓
declared git mode
  ↓
agent work
  ↓
local result
  ↓
validator
  ↓
tests
  ↓
delivery policy
  ↓
push only if explicitly required and permitted
```

---

# ЧТО НУЖНО ПРОВЕРИТЬ

Round 3 НЕ должен автоматически принять эту модель.

Необходимо исследовать следующие вопросы.

## Q1. Действительно ли push должен выполнять сам агент?

Сравнить:

### Variant A
Agent выполняет:

`git push`

самостоятельно.

### Variant B
Agent заканчивает работу локальным commit, а push выполняет launcher/orchestrator.

### Variant C
Гибрид:

- некоторые task types разрешают agent push;
- остальные используют external delivery.

Сравнить:

- simplicity;
- safety;
- latency;
- failure recovery;
- auditability;
- token/agent overhead;
- implementation complexity.

---

## Q2. Нужна ли sandbox isolation для каждого режима?

Проверить как минимум три уровня.

### Level 0 — Policy only

Только инструкция:

`do not push`.

Определить, считается ли это приемлемым хоть для каких-либо задач.

---

### Level 1 — Credential profile

Для no-push task:

- не передавать `GH_TOKEN`;
- не передавать GitHub write PAT;
- отключать GitHub write credentials;
- ограничивать доступ к SSH agent;
- использовать отдельный Git config/environment.

Проверить:

достаточно ли этого для текущей threat model проекта.

---

### Level 2 — Process/user isolation

Например:

- отдельный Windows identity;
- sandbox;
- container;
- disposable execution environment.

Определить:

когда это оправдано.

---

### Level 3 — Strong isolation

VM / hardened container / network boundary.

Определить, является ли такой уровень в текущем проекте:

- необходимым;
- преждевременным;
- избыточным.

---

# Q3. Какова реальная threat model?

Не проектировать безопасность в вакууме.

Определить, от чего именно Package L должен защищаться.

Разделить:

### Accidental violation
Модель ошибочно выполнила push.

### Instruction drift
Модель неправильно поняла ограничения.

### Tool misuse
Модель выбрала альтернативную Git command/configuration.

### Autonomous adversarial behavior
Agent сознательно пытается обойти ограничения.

### Malicious repository content
Repository prompt/code пытается заставить agent выполнить публикацию.

### Compromised external tool/model
Не доверяем execution source.

Для каждого уровня определить необходимый security control.

---

# Q4. Является ли `ls-remote before/after` полезным?

Не отвергать механизм полностью.

Определить правильную роль.

Возможные варианты:

- primary enforcement;
- secondary invariant;
- tripwire;
- audit evidence;
- postcondition check.

Проверить сценарии:

- push new ref;
- force push;
- push + revert;
- tag push;
- branch creation/deletion;
- webhook/CI side effect;
- remote other than expected origin.

---

# Q5. Может ли delivery policy быть очень маленькой?

Предпочтение проекта:

минимум бюрократии.

Исследовать возможность descriptor уровня:

```yaml
git:
  mode: LOCAL_COMMIT
```

или:

```yaml
git:
  mode: BRANCH_PUSH
  target: agent/fix-validator
```

Не вводить длинную policy DSL без доказанной необходимости.

---

# Q6. Как должен определяться режим?

Сравнить:

### Owner-defined
Режим задаётся task author.

### Procedure-derived
Режим выводится из типа procedure.

### Agent-requested escalation
Agent может запросить upgrade:

`LOCAL_COMMIT → BRANCH_PUSH`.

### Automatic classifier
Launcher сам определяет режим.

Оценить риск неправильной классификации.

---

# Q7. Нужен ли принцип default-deny?

Проверить гипотезу:

если task не говорит о публикации явно, default:

`NO REMOTE MUTATION`.

Определить, не создаст ли это лишнюю операционную нагрузку.

---

# Q8. Как должен выглядеть успешный acceptance test?

Не считать F-3P-1 закрытым просто потому, что обычный `git push` заблокирован.

Hostile test suite должен попробовать минимум:

1. direct `git push`;
2. `git -c url.<x>.insteadOf=<origin> push`;
3. alternate remote;
4. global git config mutation;
5. tag push;
6. new branch push;
7. force push;
8. credential helper path;
9. push через другой Git executable/path, если применимо.

Для push-enabled mode одновременно проверить:

- разрешённый target работает;
- запрещённый target блокируется;
- publication происходит только в разрешённой стадии.

---

# Q9. Не является ли сам finding слишком строгим?

Round 3 обязан рассмотреть и обратную гипотезу:

> Возможно, для данного проекта security impact от неправильного push настолько ограничен, что полноценная isolation architecture стоит дороже риска.

Если да — доказать это.

Требуется явная оценка:

`risk × probability × blast radius`

против:

`implementation + maintenance + execution friction`.

---

# Q10. Не следует ли разделить safety boundary и workflow boundary?

Возможная модель:

### Workflow boundary
Описывает, когда push разрешён процессом.

### Security boundary
Физически ограничивает возможность push там, где его быть не должно.

Определить, нужен ли проекту один или оба слоя.

---

# REQUIRED OUTPUT FOR F-3P-1

Round 3 должен вернуть не просто рекомендацию, а comparison matrix.

| Variant | Security | Complexity | Runtime friction | Maintenance | Failure recovery | Fit for current project |
|---|---:|---:|---:|---:|---:|---|

Минимум варианты:

1. instructions only;
2. `ls-remote` monitoring;
3. credential profiles;
4. task Git modes;
5. external trusted push;
6. Windows user/process isolation;
7. container;
8. VM/strong isolation;
9. hybrid approach.

---

# DECISION PRINCIPLE

Предпочитать:

> минимальный механизм, который действительно закрывает текущую threat model.

Не предпочитать:

> максимальную изоляцию просто потому, что она теоретически безопаснее.

Безопасность должна быть пропорциональна реальному риску и не превращать protocol в систему, где контроль начинает стоить больше, чем сама работа.

---

# STATUS F-3P-1

На начало Round 3:

`OPEN — HYPOTHESIS UNDER VALIDATION`

Не:

`ACCEPTED RISK`

Не:

`FIXED`

Не:

`MANDATORY SANDBOX`

Round 3 должен собрать evidence и предложить финальную архитектуру.

---

# 2. ROUND 3 — FABLE AUTHORIZATION

Разрешено использовать:

`kilo/anthropic/claude-fable-5.1`

за баланс Kilo для предусмотренных Fable slots:

- `r3-a`;
- draft;
- final plan.

Цель — одновременно проверить:

1. качество Fable на данном классе council/synthesis задач;
2. устойчивость reasoning на длинном corpus;
3. usefulness в роли промежуточного и финального synthesizer;
4. фактический расход Kilo tier/balance.

---

# FABLE USAGE MEASUREMENT

Для каждого Fable invocation желательно сохранить:

- slot;
- model route;
- input size, если доступно;
- output size;
- wall time;
- Kilo tier/balance consumption до;
- Kilo tier/balance consumption после;
- estimated cost/usage delta, если интерфейс это предоставляет;
- retry count;
- failures;
- quality verdict следующего reviewer.

Цель — получить не ощущение:

`Fable дорогая / дешёвая`

а реальные наблюдения по использованию.

---

# INDEPENDENCE REQUIREMENT

Поскольку Fable участвует в нескольких стадиях одного Round 3, она не должна быть единственным reviewer собственного synthesis.

После `final plan` требуется independent verifier другого model family.

Verifier должен работать от зафиксированного corpus/evidence и проверить минимум:

1. все строки ISSUE-MATRIX покрыты;
2. Round-2 carry-over requirement не потерян;
3. все major claims имеют Evidence;
4. dissent не был затёрт synthesis;
5. не появились unsupported conclusions;
6. proposed F-3P-1 resolution действительно отвечает threat model;
7. complexity предлагаемого решения пропорциональна риску.

Verifier возвращает:

`ACCEPT`

или

`ACCEPT WITH CONDITIONS`

или

`REJECT`.

---

# 3. МЕЛКИЕ FINDINGS PACKAGE L

В следующем correction pass также проверить:

### K-launch / README
Устранены ли устаревшие ссылки на second pass.

### DeepSeek route
Исправлен ли:

`openai-compatible/deepseek`

на фактически рабочий route:

`deepseek/deepseek-flash`

там, где это требуется.

### `index.lock`
Определить правильную policy для transient:

`.git/index.lock`.

Не считать любой кратковременный lock автоматически fatal.

Исследовать:

- retry;
- bounded backoff;
- stale lock detection;
- active Git process detection.

Не удалять lock вслепую, если другой Git process действительно работает.

---

# 4. ОБЩИЙ ПРИНЦИП ROUND 3

Не превращать Package L в security framework.

Цель — получить:

- предсказуемое поведение;
- достаточную защиту;
- минимальную бюрократию;
- малое количество специальных случаев;
- понятный execution model.

Особенно избегать ситуации:

> мера безопасности снижает скорость и автономность системы сильнее, чем предотвращаемый риск оправдывает.

Round 3 должен искать баланс:

**Safety × Autonomy × Simplicity × Throughput.**

Финальное решение должно быть доказано сравнением альтернатив, а не принято заранее.
