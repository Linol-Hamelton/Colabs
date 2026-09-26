# Candidate Tool Evaluation: CodeGraph, Serena, Graphiti, Cognee, Letta, Mem0

**Date**: 2026-09-22 (UTC)
**Baseline**: `f68b50222ba3afa92dd3be36f4197ac8307d9511` (branch `proto-dec-0044/layers-abc-checkpoint`); working tree dirty, a peer session (`claude-ebd3e8a8eb29a6d7`) is active
**Session / reviewer**: `kilo-ddc9014eda60f89b` (Kilo CLI, model `deepseek/deepseek-flash`)
**Mode**: ADVISORY RESEARCH - not a certification, not Evidence, never a gate input (PROTO-DEC-0034 item 1). Creates no decision block, no registry row, no commitment.
**Scope**: evaluate six candidates against the measured plans, experiments and data of this fleet (Colabs, Block-Puzzle, VPN, mcp-stack, mcp-memory-data, opus_orchestrator). No installs, no daemons, no network calls from repository code, no protocol or product changes.

---

## 0. Краткое резюме (RU)

1. **Сейчас не внедряется ни один из шести кандидатов.** Действуют PROTO-DEC-0036 (Track C/Repomix закрыт, MCP-эксперименты не разрешены), PROTO-DEC-0039 (заморозка до отчёта продуктовых пилотов) и решение MCP-совета «native-only сейчас». Любое внедрение требует отдельной owner-директивы.
2. **Замеренное узкое место — S3 (проза/губернанс), а не S1 (навигация по символам).** Именно S1 является предпосылкой предрегистрированного эксперимента с Serena; S3 совет определил как негативный контроль, где native должен победить. Предпосылка Serena/CodeGraph сегодня не подтверждена данными.
3. **Провалы 2026-09-22 уже закрыты детерминированно (PROTO-DEC-0044):** инвентаризация (Layer A) поймала неоткрытый источник, индекс решений (Layer B) сжал 117 321 B до 13 932 B (8,4×), ledger (Layer C) воспроизвёл 95 скопированных записей. LLM-память для этого класса сбоев не нужна: она не может найти пропуск, потому что «запрос никогда не задаётся».
4. **CodeGraph — новый сильный кандидат того же класса, что Serena,** и он лучше отвергнутого CodeGraphContext по всем проверенным признакам (Rust+SQLite, один MCP-инструмент, Windows, Dart/Kotlin/Swift). Но у него демон-наблюдатель, установщик правит файлы инструкций агентов, телеметрия включена и сам производитель признаёт +80% остаточного контекста в конце сессии. Держать как альтернативное плечо S1-эксперимента.
5. **Graphiti, Cognee, Mem0 — недетерминированная внешняя память вне репозитория.** PROTO-DEC-0034 уже отклонил постоянную память вне файловой системы, а в `D:\mcp-memory-data` лежат 7,2 ГБ неиспользуемых хранилищ. Сначала решение keep-or-delete по legacy-стеку, потом (если вообще) эксперимент.
6. **Letta — это не компонент, а полноценный stateful agent runtime/harness.** Он заменяет многомодельную схему Colabs, а не усиливает её; для протокола — отказ, как отдельный продуктовый эксперимент — возможен по решению владельца.

---

## 1. Evidence base (measured, in-repo)

### 1.1 H1 / Track C (Repomix)

`PROTO-DEC-0036` records the decisive negative result: Arm B failed every pre-registered threshold - broad total **+72.79%**, broad fresh **+9.10%**, narrow total **+60.20%**, narrow fresh **+42.76%**; the raw digest is ~88k tokens while control sessions used 45-73k fresh tokens (`docs/reviews/2026-09-19-h1-pilot-report-correction.md`). The refutation is scoped: it tested only the additive full-raw-digest workflow; grep/slice retrieval, symbol navigation, filtered retrieval and MCP mode were never run. Reversal requires a pre-registered controlled run: >=25% median broad total-token reduction and <=+5% narrow regression against a matched control, counted on a second model family, or a genuine repository-shape change.

### 1.2 MCP council (Round 2, closed 2026-09-20)

`docs/reviews/2026-09-20-mcp-council-final-round2-synthesis.md`: only two admissible architectures exist - native-only (control, current) and a routed policy (zero MCP by default, at most one backend, replacement-only, schema budget <=1,500 tokens). The pre-registered experiment spec (section 5) fixes task strata **S1** broad multi-hop symbol navigation, **S2** narrow localized edits, **S3** prose/governance retrieval (negative control where native must win), >=6 tasks x 3 repetitions, fresh tokens primary, thresholds >=25% broad reduction / <=+5% narrow regression / schema <=1,500, stop on any breach, and **PASS authorizes replication only, never adoption**. First candidate: **Serena**, minimal read-only profile; visible dissent favoured Repomix-style grep/slice. The owner-approved correction: product repositories are Block-Puzzle (predominantly Dart) and VPN (mixed Dart/Kotlin/Swift/Python); Serena effectiveness there is **UNKNOWN** until measured.

### 1.3 The bottleneck that actually materialised

`.ai/TASK.md` (2026-09-22): the retrieval bottleneck measured in the pilot context is **stratum S3 - prose and governance retrieval** - not the S1 symbol navigation Serena targets. Consequence, recorded in the same file: the post-pilot question "does a measured bottleneck justify reopening PROTO-DEC-0036 for the Serena experiment?" is currently answered **no** on its own premise.

### 1.4 The deterministic layer already built for exactly those failures (PROTO-DEC-0044, accepted 2026-09-22)

Three failures were measured, not supposed:

| Failure | Measurement | Deterministic response |
|---|---|---|
| Omission: primary source never opened (`D:\Битва за луну`, `chat-history-6ab1a8fc/`) | ~35,600 tokens of normalised text; 7 rounds inherited a stale source list | Layer A: bounded `Large tracked documents` inventory from `git ls-files` (also surfaced `docs/design/04_DEC0024_ACCEPTANCE_CRITERIA.md` in Block-Puzzle) |
| Copying: one agent's map byte-identical to another's (`D:\opus_orchestrator`) | 95 records matching by sha256, mtimes equal to the 100-ns tick | Layer C: `protocol-ledger.cjs cover` / `dup` reproduce the finding and catch the class |
| Unbounded governance corpus | 236,198 B invariant corpus; `.ai/DECISIONS.md` 117,321 B, ~+14,000 B/day, append-only and never trimmed | Layer B: `.ai/runtime/decisions-index.md`, 13,932 B against 117,321 B (**8.4x**), 43 blocks / 72 bound paths, with source sha256 and `--check` staleness |

PROTO-DEC-0044's rejected alternatives state the architectural position verbatim: a vector or semantic memory layer "cannot surface an omission because the query is never asked - the existing `D:\mcp-memory-data` stack holds 7.2 GB across five populated stores with an empty SQLite memory layer and would not have caught either failure".

### 1.5 Legacy memory infrastructure already on disk

Inventory from the Layer-A session (archived 2026-09-22): `D:\mcp-memory-data` **7.2 GB** across five populated stores (qdrant 4,065 MB, meili 2,999 MB, etcd 202 MB, minio 50 MB, meilisearch 34 MB; milvus empty; both `sqlite/memory_*.db` at 0 bytes); `D:\mcp-stack` **719 MB**, not a git repository, with a credential literal verified byte-equal to the owner's live `DEEPSEEK_MAIN_KEY` at `mcp-gateway.js:37`. A keep-or-delete decision on this ~8 GB is pending, and the DeepSeek mapping/verification run over `mcp-stack` is postponed with two recorded triggers. Adding Mem0/Cognee/Graphiti now would stack a new memory store on top of an unmaintained one.

### 1.6 Host and tooling facts (measured this session, read-only)

31.7 GB RAM, i9-13900HX, NVIDIA RTX 4060 Laptop; Docker 28.5.1, `uv` 0.10.3, Python 3.14.0/3.13.13, Node v22.21.0, Ollama present (local 8B/9B models stay on disk but are never pilot subjects per PROTO-DEC-0036 item 3). **`rg` is MISSING on this host**, so the "native-only" arm here runs on PowerShell/git-grep fallbacks - a data point for the native-side cost assumption, and a reminder that host surfaces vary (the council recorded the same for the DeepSeek host).

### 1.7 Binding constraints that any adoption must survive

PROTO-DEC-0034 (external tooling advisory-only, never Evidence or gate input; <=1 MCP server per phase; local-only; workspace-sandboxed; version-pinned; total tool schema <=1,500 tokens; hooks never auto-install; no repository dependency; persistent memory outside the repository rejected), PROTO-DEC-0036 (Track C closed; owner-directive reopening only), PROTO-DEC-0039 (freeze until the product-pilot report), the council ruling (native-only now; no adoption before the pilot report), AGENTS.md (filesystem is the only channel between agents; git is the source of truth; one writer per shared document), corpus budgets (active `docs/reviews/` <=60 files / 600 KB; this document intentionally lives under `docs/research/` and consumes none of that budget).

---

## 2. Candidate facts (verified 2026-09-22 via GitHub API and official READMEs; no installs performed)

| Candidate | What it is | Runtime / prerequisites | License / release / activity | Network & defaults |
|---|---|---|---|---|
| **CodeGraph** (`colbymchenry/codegraph`) | Pre-indexed code knowledge graph; one MCP tool `codegraph_explore`; Rust kernel + bundled Node runtime; SQLite at `.codegraph/codegraph.db`; auto-sync file watcher daemon; Windows/macOS/Linux; 20+ languages incl. **Dart, Kotlin, Swift** (PowerShell not listed) | one-command installer or npm; no Node required for CLI; per-project `codegraph init` | MIT; v1.6.0 (2026-08-26); 71,817 stars, 533 open issues; pushed 2026-09-22 | 100% local; telemetry **on by default** (opt-out); installer rewrites agent instruction files (`CLAUDE.md`/`AGENTS.md`/`GEMINI.md`) and Claude auto-allow permissions |
| **Serena** (`oraios/serena`) | LSP-backed semantic code retrieval/editing/refactoring + optional memory system; MCP; tools configurable per mode | Python 3.11+/`uv`; per-language language servers; JetBrains backend optional and paid | GPL-3.0-or-later app + MIT SolidLSP; v1.7.0 (2026-08-09); 29,719 stars, 191 open issues | local LSP processes; 40+ languages incl. Dart, Kotlin, Swift, Markdown, PowerShell |
| **Graphiti** (`getzep/graphiti`) | Temporal knowledge-graph framework; MCP server and REST (FastAPI); hybrid semantic+keyword+graph retrieval | Python 3.10+; Neo4j 5.26 **or** FalkorDB 1.1.2 **or** Neptune **or** Kuzu (deprecated); **LLM for entity extraction + embeddings** (OpenAI default) | Apache-2.0; v0.30.2 (2026-09-08); 31,081 stars, 503 open issues | graph DB service (Docker possible); telemetry PostHog, opt-out |
| **Cognee** (`topoteretes/cognee`) | "AI memory platform": knowledge graph + vector + session memory; `remember`/`recall`/`improve`/`forget`; MCP server, Claude Code/Codex plugins | Python 3.10-3.14; local models without an LLM key possible (`cognee[gliner]`); default OpenAI for answers/embeddings | Apache-2.0; v1.6.0 (2026-09-18); 30,917 stars, 489 open issues | local-first possible; Docker for its MCP service/UI; Postgres single-store mode is a released demo feature |
| **Letta** (`letta-ai/letta-code`) | Stateful agent **harness/runtime** (MemGPT lineage): memory blocks, git-tracked MemFS, subagents, hooks, crons, channels, desktop/CLI/server | npm `@letta-ai/letta-code`; **Letta Cloud is the default backend at first launch** (local selectable) | Apache-2.0; v0.32.16 (2026-09-22); 3,408 stars on the new repo, 406 open issues; the old `letta-ai/letta` server is retired to an `archive` branch | cloud-or-local; always-on agents, multi-computer routing |
| **Mem0** (`mem0ai/mem0`) | Lightweight memory layer (write/search API, user/session/agent scopes); CLI, SDK, self-hosted server, cloud | Python or Node SDK; self-hosted Docker stack; **LLM + embeddings required** (default gpt-5-mini + text-embedding-3-small) | Apache-2.0; latest tag `openclaw-v1.2.0` (2026-09-18); 65,837 stars, 747 open issues | cloud by default for full features; agent self-signup flow mints API keys; benchmark numbers are from the managed platform (OSS "directionally similar") |

Notes:

- **"CodeGraph" here is `colbymchenry/codegraph`, not `CodeGraphContext`.** CodeGraphContext (4.2k stars, Python, FalkorDB Lite Unix-only, no PowerShell, four self-authored defect reports in its root) was rejected for v1.9.5 on 2026-09-19. That rejection does not transfer to CodeGraph, but neither does CodeGraph inherit an evaluation: its claims are vendor-run (7 repos, median of 4 runs, Claude Opus 4.8) and include an honest caveat that matters here: fewer tokens processed, but **~80% more retrieval context resident at the end of a session** (67k vs 18k tokens on VS Code).
- All benchmark numbers above are self-reported by the vendors. MCP tool-schema sizes are **UNKNOWN** for every candidate until `tools/list` is measured; CodeGraph documents exactly one exposed tool, Serena is configurable, and the Graphiti/Cognee/Mem0 MCP servers are multi-tool surfaces.

---

## 3. Fit against the measured weak spots

| Weak spot (measured) | Candidate that claims it | Evidence status |
|---|---|---|
| S1 broad multi-hop symbol navigation | Serena, CodeGraph | **Not measured as a bottleneck in this fleet.** The preregistered spec exists only for Serena; CodeGraph is a new same-modality alternative. Product-language effectiveness (Dart/Kotlin/Swift) UNKNOWN. |
| S2 narrow localized edits | Serena (symbolic edit), CodeGraph (less) | Native already meets the narrow bound; H1 measured a **+42.76%** narrow fresh-token penalty for the additive digest. Any candidate must show <=+5% narrow regression. |
| S3 prose/governance retrieval | Graphiti/Cognee/Mem0/Serena memory | **Measured bottleneck**, but the council designated S3 the negative control where native must win; the deterministic Layer B already delivered 8.4x on the exact corpus (DECISIONS 117,321 B -> 13,932 B). |
| Omission / unknown tracked sources | none of the six; solved by Layer A | A query-driven memory cannot surface a document nobody knew to ask about (PROTO-DEC-0044 reasoning). |
| Copying / independence between agents | none of the six; solved by Layer C | `dup` detects record-set copying by hash + mtime. A shared memory layer would collect both agents' outputs without adding this check. |
| Cross-session agent state / always-on agents | Letta, Serena memory, Graphiti | The protocol's model is stateless CLI sessions plus filesystem journals; a stateful runtime is an architecture substitution, not a component. No measured demand. |
| Token/schema tax per turn | all | CodeGraph: one tool (favourable, still unmeasured). Serena: configurable (mode-dependent). Graphiti/Cognee/Mem0: multi-tool MCP servers, likely over the 1,500-token budget unless pruned; UNKNOWN. |

---

## 4. Dispositions (advisory)

| Candidate | User priority | Evidence-supported disposition | Condition that would change it |
|---|---|---|---|
| CodeGraph | very high | **DEFER.** Record as the alternative S1 candidate alongside Serena; do not install. New facts since the CGC rejection justify re-evaluation, not adoption. | A measured S1 bottleneck in Block-Puzzle/VPN **and** an owner directive reopening PROTO-DEC-0036; then run the preregistered spec with schema, residual-context and daemon-fallback measurements. |
| Serena | very high | **DEFER (unchanged).** It is already the first preregistered candidate; its trigger (S1) did not materialise and its effectiveness on the product languages is UNKNOWN. | Same as above; the spec is ready, PASS authorizes replication only. |
| Graphiti | very high | **REJECT for protocol memory.** Non-deterministic LLM extraction would restate what `DECISIONS.md`/`ARCHIVE.md` already hold deterministically; adds a graph-DB service, telemetry and a second source of truth; the S3 failure class is already answered deterministically. | A product use case with genuinely conversational, non-repository memory, owner-directed, outside the protocol's gates. |
| Cognee | high | **REJECT now for protocol memory.** Closest fit among the three engines (local no-LLM mode), but still a second store with a plugin that rewrites agent wiring; deterministic layers must be exhausted first. | Same as Graphiti; or a bounded, owner-directed product experiment with a pre-registered question set and a deterministic control. |
| Letta | medium | **REJECT for the protocol.** It is a full agent runtime/harness with a cloud-default backend; adopting it would replace the multi-vendor, filesystem-only, one-writer model rather than strengthen it. | Owner decides to run a standalone always-on-agent experiment in one product repository, isolated from protocol sessions. |
| Mem0 | medium | **REJECT for the protocol.** PROTO-DEC-0034 explicitly rejected persistent memory outside the repository; defaults are external LLM/embeddings; it adds a channel no protocol audit covers. | A product feature that needs user/session memory (e.g., assistant features inside VPN/Block-Puzzle), decided and measured product-side. |

Priority column above is the owner's hypothesis, not measured evidence. Measured evidence currently supports "defer/reject with named triggers" for all six.

---

## 5. If the owner authorises an experiment later

Do not open a new council. Reuse the already-approved preregistered spec (council section 5) unchanged, with these additions:

1. **One candidate per phase**, replacement-only, no gate input, advisory outputs (PROTO-DEC-0034).
2. **Preconditions:** pilot report exists; owner directive explicitly reopens PROTO-DEC-0036; corpus/journal budgets reserved before artifacts; one pinned model/client family.
3. **CodeGraph additions:** measure `tools/list` bytes+tokens; measure end-of-session residual context (its own claimed weakness); test daemon crash/watcher-off fallback; verify it does not rewrite agent instruction files in this repository (manual config only); confirm Dart/Kotlin/Swift graph quality by spot-check against known definitions; telemetry off.
4. **Memory-engine additions (if ever):** pre-register the exact question set and a deterministic control (file reads + Layer B index); score hallucinated/unsupported state as failures, not just token savings; never let any answer become Evidence.
5. **Accounting:** fresh tokens (in+out) primary; schema, wall time, quality against pre-written expected sources; fallback rate; installation/setup amortization; stop on any breach or product test failure.
6. **Article caps:** prompt <=150 lines, report <=250 lines; `docs/research/` for research, `docs/reviews/` only for certifying artifacts.

Before any of that, complete the pending housekeeping that the same evidence base calls for: the **keep-or-delete decision on the ~8 GB legacy stack** (`D:\mcp-memory-data`, `D:\mcp-stack`) and the postponed DeepSeek mapping run.

---

## 6. Verdict-change triggers

- A reproducible **S1** bottleneck in real product tasks (multi-hop symbol tracing where native search cost stably exceeds a candidate's overhead) plus an owner directive -> Serena/CodeGraph single experiment.
- A measured memory-class failure that Layers A/B/C provably cannot close, with a defined question set that native retrieval cannot answer -> memory-engine experiment, one candidate, with the deterministic control.
- A fleet-wide upgrade of Block-Puzzle/VPN to 1.9.6 (post-freeze) that makes any adopted tool installable uniformly; until then the installed-fleet split is itself a confound (PROTO-DEC-0043/0044 facts).
- Product-side needs (user memory, always-on agents) are product decisions; they do not reopen PROTO-DEC-0036.

## 7. Limitations

- No candidate was installed or executed; all properties above are documentation/API-level facts plus vendor benchmarks. MCP schema cost, Windows behavior and product-language quality remain **UNKNOWN until measured**.
- Star counts and release tags are point-in-time (2026-09-22) snapshots from the GitHub API.
- The S3 bottleneck statement is taken from the current `.ai/TASK.md` measurement record; the raw per-task numbers live in the pilot journals and were not re-derived here.
- This document is advisory; it certifies nothing, changes no decision and must not be used as Evidence or a completion-gate input.

## 8. Sources

In-repo: `docs/reviews/2026-09-20-mcp-council-final-round2-synthesis.md`, `docs/reviews/2026-09-19-h1-pilot-report-correction.md`, `docs/reviews/2026-09-19-deepseek-flash-mcp-selection-analysis.md`, `.ai/TASK.md`, `.ai/DECISIONS.md` (PROTO-DEC-0034/0036/0039/0044), `.ai/ARCHIVE.md` (2026-09-22 entries), `.ai/PLAN.md` (frozen objectives and metrics).
External (fetched 2026-09-22): `github.com/colbymchenry/codegraph`, `github.com/oraios/serena`, `github.com/getzep/graphiti`, `github.com/topoteretes/cognee`, `github.com/letta-ai/letta-code`, `github.com/mem0ai/mem0`, GitHub REST API repository metadata.
