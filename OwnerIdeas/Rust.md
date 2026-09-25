
Ты работаешь с репозиторием **Colabs** — протоколом координации нескольких AI-агентов. Главная задача этого исследования — найти и проверить **максимально возможное количество практически значимых гипотез ускорения runtime Colabs**, особенно операций, которые сейчас могут занимать десятки секунд.

Не ограничивайся косметической оптимизацией JavaScript. Рассматривай изменения вплоть до переработки runtime-архитектуры и переноса performance-critical частей на Rust.

## Главная цель

Добиться максимально возможного уменьшения:

- wall-clock latency часто выполняемых команд;
- overhead на каждый ход/ответ AI-агента;
- времени SessionStart / Stop / Handoff / Snapshot / Gate / Validate;
- времени полного validation/test pipeline;
- количества повторных filesystem-операций;
- количества запусков внешних процессов;
- количества Git subprocess calls;
- повторного hashing/parsing/scanning;
- времени cold start;
- CPU usage;
- лишнего disk I/O.

Особенно интересуют операции длительностью **30–60 секунд**, а также небольшие операции, которые выполняются много раз за одну AI-сессию и поэтому создают большой суммарный overhead.

---

# Основной принцип исследования

**Не предполагай, что Rust автоматически решит проблему.**

Сначала выясни, куда реально уходит wall-clock time.

Используй принцип:

`measure → decompose → hypothesize → prototype → benchmark → compare`

Не предлагай полный rewrite только потому, что Rust потенциально быстрее Node.js или PowerShell.

Нужно определить:

1. что действительно CPU-bound;
2. что filesystem-bound;
3. что Git-bound;
4. что process-spawn-bound;
5. что PowerShell-bound;
6. что Node-bound;
7. что test-bound;
8. что связано с повторной работой;
9. что можно вообще не выполнять;
10. что можно выполнять incremental;
11. что можно выполнять параллельно;
12. что можно вычислить один раз и переиспользовать.

---

# Этап 1. Построй performance map Colabs

Изучи весь runtime path проекта.

Минимально проанализируй:

- `.ai/bin/protocol.cjs`
- `.ai/bin/protocol-hooks.cjs`
- `.ai/bin/protocol-session.cjs`
- `.ai/bin/protocol-handoff.cjs`
- `.ai/bin/protocol-lock.cjs`
- `.ai/bin/protocol-archive.cjs`
- `validate-protocol.ps1`
- `setup-ai-protocol.ps1`
- `test-protocol.ps1`
- `protocol-manifest.json`
- `tests/*.test.cjs`
- Claude hooks
- Codex hooks
- Git-related code
- snapshot logic
- hashing logic
- worklog handling
- ARCHIVE/DECISIONS/TASK/PLAN handling.

Построй call graph основных команд.

Для каждой часто выполняемой операции установи цепочку наподобие:

`agent hook → Node → Git → filesystem → PowerShell → Node tests → Git → filesystem`

Выяви вложенные subprocess calls.

Отдельно посчитай:

- сколько раз создаётся `node.exe`;
- сколько раз создаётся `powershell.exe/pwsh`;
- сколько раз создаётся `git.exe`;
- сколько файлов читается;
- сколько `stat/lstat`;
- сколько файлов хешируется;
- сколько раз один и тот же файл читается повторно;
- сколько раз вычисляется одинаковое состояние repository;
- сколько раз выполняется `git status`;
- сколько раз выполняются аналогичные Git queries.

---

# Этап 2. Инструментируй runtime

Добавь временную performance instrumentation, не меняя семантику протокола.

Для основных команд получи breakdown вида:

```text
TOTAL                      41.840 s

process startup             1.220 s
Git subprocesses            7.410 s
filesystem traversal        5.800 s
file reads                  2.140 s
hashing                     3.970 s
JSON/Markdown parsing       0.430 s
PowerShell validation      11.900 s
Node tests                  8.500 s
other                       0.470 s
```

Нужны как минимум:

- cold run;
- warm run;
- clean repository;
- dirty repository;
- маленький repository;
- крупный repository;
- большое число worklogs;
- большое количество файлов;
- несколько последовательных protocol calls.

Измеряй не только среднее время, но желательно:

- median;
- p90;
- p95;
- min/max.

---

# Этап 3. Проверь максимально широкий набор гипотез

Ниже — не список обязательных решений, а **пространство гипотез**. Каждую существенную идею нужно проверить или аргументированно исключить.

## A. Rust Core

Проверь перенос performance-critical runtime в один native Rust binary:

`colabs`

с командами типа:

```text
colabs snapshot
colabs status
colabs validate
colabs handoff
colabs session
colabs gate
colabs lock
colabs archive
colabs telemetry
colabs doctor
colabs setup
```

Проверь отдельно:

- полный rewrite;
- постепенную миграцию;
- Rust sidecar;
- Rust CLI, вызываемый из Node;
- Node wrapper + Rust core;
- Rust library с Node N-API binding;
- Rust binary без Node dependency.

Ответь, при какой архитектуре стоимость границы JS↔Rust минимальна.

---

## B. Удаление PowerShell из hot path

Проверь перенос логики:

- `validate-protocol.ps1`;
- `setup-ai-protocol.ps1`;
- других performance-sensitive PowerShell частей

в Rust.

Особенно измерь:

- startup PowerShell;
- parsing;
- filesystem logic;
- SHA;
- JSON;
- process management.

Определи, какие `.ps1` следует:

- полностью удалить;
- заменить Rust;
- оставить только как compatibility wrapper.

---

## C. Сокращение process spawning

Исследуй стоимость многократного:

- `spawnSync`;
- `execSync`;
- `git.exe`;
- `node.exe`;
- `powershell.exe`;
- `bash.exe`.

Проверь гипотезы:

1. один persistent process;
2. daemon/service;
3. IPC между hooks и daemon;
4. один Rust process на AI session;
5. batching нескольких операций;
6. отказ от sync subprocess;
7. объединение нескольких Git запросов в один;
8. прямое использование Git library вместо Git CLI там, где это безопасно.

Рассмотри `git2/libgit2`, но сравни его с оптимизированным Git CLI, а не считай автоматически быстрее.

---

## D. Incremental repository snapshot

Это один из приоритетных блоков.

Проверь возможность отказаться от полного вычисления состояния repository при каждом hook.

Рассмотри:

- last-known snapshot;
- cache по `HEAD + index state + changed paths`;
- Git index metadata;
- mtimes;
- file size;
- inode/file ID там, где возможно;
- Git blob hashes;
- dirty-set;
- changed-file list;
- filesystem watcher;
- журнал изменений.

Цель:

```text
O(repository)
```

заменить на максимально близкое к:

```text
O(changed files)
```

для повторных проверок.

---

## E. Filesystem watcher

Проверь persistent watcher:

- Windows ReadDirectoryChangesW;
- notify crate;
- platform-native backend.

Он должен знать, какие файлы изменились с предыдущей проверки, чтобы не обходить весь repository.

Проверь:

- correctness;
- event loss;
- rename;
- atomic save;
- Git checkout;
- branch switch;
- fallback full scan.

---

## F. Кэширование

Проверь многоуровневый cache.

### L1 — process memory

Для одного запуска.

### L2 — session memory

Для одной AI-сессии.

### L3 — persistent cache

Между запусками.

Возможные cache entries:

- file fingerprint;
- SHA;
- parsed Markdown;
- parsed JSON;
- Git state;
- worklog metadata;
- validation result;
- decisions registry;
- protocol manifest;
- snapshot digest;
- gate result.

Определи корректные invalidation keys.

Cache никогда не должен нарушать correctness протокола.

---

## G. Повторное чтение файлов

Найди случаи:

```text
read → parse
read again → hash
read again → validation
read again → gate
```

и исследуй замену на:

```text
read once
→ bytes
→ hash
→ parse
→ validate
```

с повторным использованием одного Buffer/byte slice.

---

## H. Memory mapping

Проверь, имеет ли смысл `mmap` для:

- больших ARCHIVE;
- DECISIONS;
- больших worklog;
- больших repository metadata.

Не использовать mmap без benchmark.

---

## I. Hashing

Исследуй:

- SHA-1 Git blobs;
- SHA-256 protocol hashes;
- повторное hashing;
- batching;
- parallel hashing;
- SIMD implementations;
- incremental hashing;
- использование уже существующих Git object IDs вместо повторного чтения файла.

Главный вопрос:

**можно ли не читать содержимое файла вообще, если Git уже знает его identity?**

---

## J. Git optimization

Найди все Git commands.

Для каждого установи:

- frequency;
- duration;
- duplicate calls;
- возможность batching.

Проверь использование:

- `git status --porcelain`;
- `git diff`;
- `git diff-index`;
- `git diff-files`;
- `git ls-files`;
- `git hash-object`;
- `git cat-file --batch`;
- `git update-index`;
- index metadata.

Особенно исследуй Git batch protocols:

```text
git cat-file --batch
git cat-file --batch-check
```

и long-lived Git subprocess, если это оправдано.

---

## K. Parallelism

Найди операции, которые сейчас выполняются последовательно, хотя независимы.

Проверь:

```text
A → B → C → D
```

против:

```text
A ─┐
B ─┼→ join
C ─┤
D ─┘
```

Для Rust исследуй:

- Tokio;
- Rayon;
- scoped threads;
- async filesystem только там, где он реально помогает.

Не заменяй последовательный I/O бессмысленным async.

---

## L. Validation DAG

Построй validation не как монолитную процедуру, а как dependency graph.

Например:

```text
             manifest
             /      \
         files       git
          |          |
       encoding     state
          \          /
             gate
              |
           evidence
```

После этого:

- выполнять независимые проверки параллельно;
- cache отдельных nodes;
- повторно запускать только invalidated nodes.

---

## M. Incremental validation

Если изменился один файл:

```text
.ai/TASK.md
```

не должен автоматически запускаться весь validation pipeline, если остальные invariants гарантированно не затронуты.

Создай dependency map:

```text
path / file class
        ↓
affected validators
```

---

## N. Fast path / Full path

Исследуй разделение:

### Fast path

На каждом agent turn.

Цель: сотни миллисекунд.

### Standard validation

При handoff.

### Full certification

Перед merge/release.

Не выполнять дорогостоящую сертификацию там, где достаточно дешёвой проверки.

При этом protocol guarantees должны остаться формально определёнными.

---

## O. Persistent Colabs daemon

Проверь архитектуру:

```text
colabsd
```

который живёт в течение AI-session и хранит:

- repository state;
- parsed documents;
- file fingerprints;
- watcher state;
- Git information;
- cache;
- worklog indexes.

Hooks могут обращаться к нему по:

- named pipe Windows;
- Unix socket;
- stdin/stdout IPC.

Сравни:

```text
cold CLI every time
```

с:

```text
persistent daemon
```

---

## P. Startup optimization

Измерь стоимость запуска:

- Node;
- PowerShell;
- Bash;
- Rust.

Для часто запускаемых hooks cold-start имеет высокое значение.

---

## Q. Tests

Проанализируй `tests/*.test.cjs`.

Определи:

- какие tests самые медленные;
- есть ли artificial sleeps/timeouts;
- создаются ли временные repositories;
- запускается ли Git сотни раз;
- запускаются ли PowerShell/Node recursively;
- можно ли shared fixture создать один раз;
- можно ли тесты запускать параллельно;
- какие test groups конфликтуют;
- какие можно разделить на unit/integration/e2e.

Исследуй:

```text
unit tests         → очень быстро
integration        → отдельно
full regression    → по необходимости
```

Проверь возможность переноса core tests вместе с core implementation на Rust.

---

## R. Data structures

Исследуй лишние:

- array sorting;
- regex scans;
- repeated string split;
- full-file parsing;
- repeated Markdown scanning;
- copies;
- conversions UTF-8 string ↔ bytes;
- JSON serialization/deserialization.

Для больших registries/worklogs рассмотри индексацию.

---

## S. ARCHIVE / DECISIONS scalability

Проверь поведение при росте файлов:

```text
100 KB
1 MB
10 MB
100 MB
```

Если алгоритм каждый раз сканирует весь файл, предложи incremental/indexed architecture.

---

## T. Worklog index

Вместо постоянного чтения всех worklogs проверь компактный индекс:

```text
agent
latest-entry
entry-hash
mtime
size
evidence
parent
certification state
```

Индекс должен быть rebuildable из source-of-truth файлов.

---

## U. Persistent metadata store

Рассмотри только после benchmarking:

- flat binary cache;
- JSON cache;
- MessagePack;
- CBOR;
- SQLite;
- sled/redb;
- RocksDB;

но не добавляй DB просто потому, что она существует.

Source of truth должны оставаться protocol files/Git там, где это является контрактом Colabs.

---

## V. Serialization formats

Для internal cache/IPC сравни:

- JSON;
- MessagePack;
- CBOR;
- bincode/postcard;
- custom binary representation.

Приоритет — correctness и простота, затем performance.

---

## W. Zero-copy / allocation reduction

Для Rust-кандидата проверь:

- borrowing;
- `&[u8]`;
- `Cow`;
- reuse buffers;
- avoiding intermediate String;
- streaming parsing.

Но не занимайся микрооптимизацией до устранения macro bottlenecks.

---

## X. Release build optimization

Проверь параметры Rust release:

- `--release`;
- LTO;
- codegen-units;
- target-cpu=native для локальных benchmark;
- PGO при наличии реального смысла.

Сравни эффект измерениями.

---

## Y. Windows-specific performance

Colabs активно используется на Windows.

Исследуй:

- PowerShell startup;
- process creation;
- Defender/antivirus влияние на тысячи file opens;
- filesystem metadata calls;
- command-line length;
- NTFS characteristics;
- Git for Windows overhead;
- WSL vs native;
- Windows native watcher.

Но не отключай security mechanisms как решение.

---

## Z. Architecture-level elimination of work

Для каждого дорогостоящего действия задавай главный вопрос:

> Можно ли вообще этого не делать?

Приоритет оптимизаций:

1. удалить работу;
2. делать её реже;
3. делать incremental;
4. cache;
5. parallelize;
6. только потом выполнять то же самое быстрее на Rust.

---

# Этап 4. Ищи дополнительные гипотезы самостоятельно

Этот список НЕ исчерпывающий.

После анализа исходного кода сформируй дополнительные гипотезы.

Нужно активно искать:

- duplicated work;
- accidental O(N²);
- repeated repository scans;
- repeated process startup;
- lock contention;
- unnecessary synchronization;
- unnecessary fsync/write;
- repeated parsing;
- poor batching;
- serial bottlenecks;
- overly defensive validation on hot path;
- hidden sleeps/timeouts;
- retry delays;
- test setup overhead;
- Windows-specific process overhead;
- excessive context generation.

Не ограничивай количество гипотез искусственно.

---

# Этап 5. Для каждой гипотезы сделай карточку

Формат:

```text
HYPOTHESIS H-001
Название:

Current behavior:

Suspected bottleneck:

Proposed change:

Why it may help:

Affected files:

Expected speedup:
- local operation:
- full command:
- repeated session:

Expected complexity:
LOW / MEDIUM / HIGH

Risk:
LOW / MEDIUM / HIGH

Correctness risk:

Prototype needed:
YES / NO

Benchmark method:

Measured before:

Measured after:

Result:
CONFIRMED / PARTIALLY CONFIRMED / REJECTED / NOT YET TESTED
```

---

# Этап 6. Раздели гипотезы по масштабу

Создай четыре категории.

## Tier A — практически бесплатные улучшения

Небольшие изменения с заметным результатом.

## Tier B — локальные архитектурные оптимизации

Cache, batching, parallelism, incremental algorithms.

## Tier C — Rust acceleration

Перенос отдельных hot paths.

## Tier D — новая runtime architecture

Например:

```text
single Rust core
+
persistent daemon
+
filesystem watcher
+
incremental validation DAG
+
persistent cache
```

---

# Этап 7. Рассчитай cumulative effect

Не ограничивайся локальными speedup.

Например:

```text
Current

SessionStart       6.0 s
per-turn hook      4.0 s × 30
handoff           25.0 s
validation        35.0 s

TOTAL            186 s
```

После оптимизации:

```text
SessionStart      0.4 s
per-turn hook     0.15 s × 30
handoff           3.0 s
validation        7.0 s

TOTAL            14.9 s
```

То есть:

```text
186 → 14.9 s
≈12.5× overall improvement
```

Именно **session-level cumulative speedup** является главным KPI.

---

# Этап 8. Не ломай guarantees

Colabs — protocol, поэтому производительность вторична по отношению к correctness.

Нельзя незаметно ослабить:

- evidence integrity;
- hash chain;
- dirty-state detection;
- Git state accuracy;
- lock guarantees;
- handoff validation;
- independent review;
- decision immutability;
- session ownership.

Если оптимизация ослабляет guarantee — явно укажи это и не принимай её без альтернативной защиты.

---

# Этап 9. Финальный результат

В конце предоставь:

### 1. Performance baseline

Таблица основных команд и их времени.

### 2. Bottleneck tree

Что реально занимает время.

### 3. Полный registry гипотез

Не только удачные — также отвергнутые.

### 4. Top improvements

Но ранжируй их не субъективно, а по:

```text
measured time saved
×
frequency
/
implementation cost
```

### 5. Target architecture

Покажи архитектуру Colabs после оптимизации.

Особенно оцени вариант:

```text
AI integrations
      ↓
thin wrappers
      ↓
Rust Colabs Core
      ↓
incremental state engine
├── Git state
├── filesystem watcher
├── snapshot cache
├── validation DAG
├── worklog index
├── hashing
├── handoff
└── protocol state
```

### 6. Migration roadmap

Разбей миграцию на безопасные этапы, чтобы после каждого этапа проект оставался рабочим.

### 7. Expected result

Дай три прогноза:

- conservative;
- realistic;
- aggressive.

Например:

```text
Current hot path:       40 s

Conservative:           20 s
Realistic:               5 s
Aggressive:           < 1 s warm path
```

Но цифры должны появиться только после profiling.

---

# Критические ограничения

- **Не использовать Julia.**
- Не считать переписывание на Rust самоцелью.
- Не делать большой rewrite без benchmark justification.
- Не ломать обратную совместимость без серьёзной причины.
- Не жертвовать protocol correctness ради скорости.
- Не оптимизировать только synthetic benchmarks.
- Измерять end-to-end wall-clock.
- Проверять Windows в первую очередь.
- Рассматривать Linux/macOS portability.
- Для каждой крупной оптимизации показывать BEFORE/AFTER.
- Если гипотеза не дала эффекта — зафиксировать её как rejected.
- Предпочитать устранение работы ускорению той же работы.
- Максимально использовать incremental computation.
- Максимально устранять повторное сканирование repository.
- Максимально сокращать количество subprocess starts.
- Максимально исследовать объединение Node + PowerShell runtime в Rust Core.

Главная задача не «написать Rust».

Главная задача:

> **Сделать Colabs настолько быстрым, насколько это практически возможно, сохранив его protocol guarantees, и доказать каждый существенный прирост измерениями.**
