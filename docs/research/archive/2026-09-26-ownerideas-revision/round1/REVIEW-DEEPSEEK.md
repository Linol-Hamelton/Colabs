# OwnerIdeas revision — Round 1 independent review (DeepSeek)

```
Mode: ADVISORY
Baseline: 7b6d17a; working tree status: dirty (untracked research frame, worklogs of running sessions)
Reviewer: DeepSeek 4.1 Flash, route kilo run -m deepseek/deepseek-flash, effort unknown, 2026-09-26
Scope: 13-file OwnerIdeas corpus against the current kernel: implemented / partial / missing L0–L3 mechanisms, cleanup classification, reverse contradictions.
Verdict: REVIEW COMPLETE
```

Labels: **FACT** = `path:line` or decision id opened; **INFERENCE** = my reading; **OPEN QUESTION** = cannot settle here.
`OwnerIdeas/*.md` is read from the working tree at `7b6d17a` (CRLF); line numbers are Working-Tree lines.
This report used only the corpus, the kernel and earlier research named as inputs. I did not open any
file under `round1/`; at session start no other reviewer report existed in that directory (FACT: directory listing).

---

## 1. Executive summary

- The corpus is **not a second source of truth for implemented kernel rules**. It is predominantly
  *research-program prose* (benchmark, executor, task profile, MCP, AX, Rust, scripts, RISK_COUNCIL)
  plus four short hypotheses (`H-AUTH-02`, `H-PROMPT-DELIVERY-01`, `SYNTHESIS`) and one already-run
  council prompt (`MIGRATION.md`). No corpus file is a decision.
- **The strongest finding is the reverse of the owner's question**: the kernel does *not* contain most
  of the corpus's mechanisms, and several corpus blocks now contradict accepted decisions
  (`MCP_Server.md`, `Rust.md` in part, the "current mechanism" descriptions in `benchmark.md`/`executor.md`).
- **Four corpus files are already absorbed or duplicated**: `MIGRATION.md` is a byte-identical copy of
  the closed validator-migration council prompt; `performers.md` duplicates `benchmark.md`;
  `scripts.md` contains its own program twice; `SYNTHESIS-2026-09-25` is an intermediate synthesis of
  a step this revision supersedes.
- **Highest-value un-run idea frame**: `RISK_COUNCIL.md` (23 `H-*` hypotheses: TCB, exactly-once
  single writer, global graph correctness, freshness/epoch, security/trust boundary, calibration).
  It is recorded in backlog `C-4` and has not been dispatched.
- **Highest-value missing L0–L3 mechanisms**, in order: capability envelope / bounded execution
  authorization (`H-AUTH-02`); write broker & conflict classes (`scripts.md` Track B); task
  characterization vector separated from resolver and assurance (`task_profife.md`); empirical model
  qualification / economics (`benchmark.md`, `executor.md`, `workflowAI.md` TD-MODEL-QUALIFICATION);
  TCB and self-hosting safety (`RISK_COUNCIL.md` §15).
- **No corpus file should be deleted before its active content gets a canonical destination**; the
  cleanup is mostly `DUPLICATE`/`ARCHIVE_CANDIDATE`, with `scripts.md`'s duplicate block and
  `MIGRATION.md` the clearest immediate `ARCHIVE`/`DELETE` candidates.

---

## 2. Inventory reviewed

| Corpus file | Nature | Kernel counterparts read |
|---|---|---|
| `benchmark.md` (2157+ lines) | benchmark-driven model-selection research program + benchmark list | `docs/core-arch/stage-4/MODEL-MATRIX.md`, `P-L3-002/003`, `P-L2-002`, `docs/ops/MODEL-ECONOMICS.md` |
| `performers.md` (1344+ lines) | "MODEL PROFILE" inventory (L1–138) + byte-identical copy of `benchmark.md` L949–2154 (L139–1344) | as above |
| `executor.md` (1185+ lines) | minimum-sufficient executor / economics research program | `PROTO-DEC-0074/0075`, `workflowAI.md`, `P-L3-004` |
| `task_profife.md` (1582+ lines) | task-characterization vector research program | `P-L2-002` 0.4, `PROTO-DEC-0075` |
| `scripts.md` (3029 lines, program twice) | high-concurrency runtime / write broker / procedure-to-script | `protocol-lock.cjs`, `PROTO-DEC-0028/0029`, `0047` item 8, `CORE-ARCH-5`, `CORE-ARCH-6` |
| `Rust.md` (1019+ lines) | runtime performance hypotheses (Rust/daemon/cache/DAG) | `PROTO-DEC-0025` item 5, `0039` item 3, `0077`, `PROPOSAL-node-validator.md` |
| `MCP_Server.md` (3452+ lines) | MCP transformation research program | `PROTO-DEC-0034/0036/0045`, `.ai/docs/PROTOCOL.md` MCP policy, MCP council ruling |
| `Google_AX.md` (2085+ lines) | Google AX integration research program | `PROTO-DEC-0066` study A, `improvement-research/README.md` |
| `MIGRATION.md` (1314+ lines) | validator-migration council prompt | `validator-migration-council/` package, `PROTO-DEC-0025` item 5, `0077` |
| `RISK_COUNCIL.md` (3115 lines) | kernel risk-audit research program (23 hypotheses) | `CORE-ARCH-1..7`, `docs/ops/BACKLOG.md` C-4 |
| `SYNTHESIS-2026-09-25-cross-document.md` | intermediate cross-document synthesis | this revision frame |
| `H-AUTH-02.md` (58 lines) | bounded-execution-authorization hypothesis | `PROTO-DEC-0070/0077/0078`, `PROTOCOL.md` T0–T4 |
| `H-PROMPT-DELIVERY-01_...md` (69 lines) | canonical task file vs orchestrator loading | `PROTO-DEC-0073`, `run-chain.cjs`, `0076` item 4 |

Kernel surface actually checked: `.ai/DECISIONS.md` (78 blocks), `.ai/TASK.md`, `.ai/PLAN.md`,
`docs/core-arch/` (CORE-ARCH-1..7 + stage-1..4), `.ai/docs/PROTOCOL.md`, `.ai/docs/PAIRED-CYCLE.md`,
`.ai/docs/CLI-AGENTS.md`, `.ai/bin/*.cjs`, `.ai/worklog`, `docs/ops/BACKLOG.md`, `docs/ops/MODEL-ECONOMICS.md`,
`docs/research/2026-09-25-validator-migration-council/`, `docs/research/2026-09-25-improvement-research/README.md`.

---

## 3. Implemented ideas

### 3.1 Multi-round research cycle (four researchers → synthesis → certification → draft/critiques/final)

```
OwnerIdeas source: benchmark.md L1607 (Раунд 1), L1801 (Раунд 2), L1936/L1941 (Раунд 3, FINAL CERTIFICATION);
                   performers.md L797/L991/L1126 (same text)
Canonical replacement: PROTO-DEC-0052 (research cycles: rounds + syntheses), PROTO-DEC-0053 (draft decision,
                   two critiques, final plan), PROTO-DEC-0066 (frame identities); PROTO-DEC-0058/0059/0065
                   (research launch practice); CORE-ARCH-4 §7 S-003 (proposed but consistent)
Evidence: .ai/DECISIONS.md:2168-2232; docs/core-arch/CORE-ARCH-4.md:148-163;
                   docs/research/2026-09-25-validator-migration-council/ (round1/, round2/, round3/,
                   draft-decision.md, critique-a.md, critique-b.md, final-plan-2.md, verification-2.md)
Status: IMPLEMENTED
```

FACT: the council package has three rounds, a draft, two critiques, a final plan and two verification
passes; the same shape ran in `docs/research/2026-09-24-remediation-mapping/`. The corpus only supplies
the *template*; the kernel's own instruction (`research cycle`) is 0052/0053.

### 3.2 Script-vs-model boundary ("deterministic before probabilistic")

```
OwnerIdeas source: scripts.md §32 L912-940 ("Deterministic before probabilistic"), §36 L1017-1028 (fail closed)
Canonical replacement: PROTO-DEC-0047 item 8 (four conditions; fail closed, exit 2, named decision,
                   golden corpus, shadow run); PROTO-DEC-0049 item 2 (fixed grammar, unknown exits 2);
                   AGENTS.md §7 checks and evidence
Evidence: .ai/DECISIONS.md:1982, :2053; .ai/bin/protocol-lock.cjs (exit codes); validate-protocol.ps1
Status: IMPLEMENTED (the principle); the maturity ladder M0–M5 below is NOT
```

### 3.3 "Script that fails closed and prints the rows behind its result"

`PROTO-DEC-0047` item 8 is the canonical, implemented version of `scripts.md` §35–§36. FACT: the
validator and `.ai/bin` scripts exit 2 on unknown input. I mark the *full* M0–M5 conversion workflow
`PARTIALLY_IMPLEMENTED` (§4).

### 3.4 Model discovery/ranking from the provider's own data

```
OwnerIdeas source: benchmark.md (external benchmarks), performers.md MODEL PROFILE L74
Canonical replacement: PROTO-DEC-0058, 0059, 0063, 0064, 0065; P-L3-002 (discovery, trial), P-L3-003
                   (ranking, draft); docs/core-arch/stage-4/MODEL-MATRIX.md
Evidence: docs/core-arch/stage-4/MODEL-MATRIX.md:22-135; docs/core-arch/stage-4/P-L3-002-model-discovery.md
Status: PARTIALLY_IMPLEMENTED (see §4.1): provider positioning + price, no benchmark capability
```

### 3.5 Client registry as data (models, effort, routes, limits)

`PROTO-DEC-0047` item 9, `PROTO-DEC-0050` item 3, `kilo-routes.json`/`kilo-routes.cjs`,
`docs/core-arch/stage-4/workflowAI.md`, `docs/ops/MODEL-ECONOMICS.md`. This is the kernel's answer to
`performers.md`'s "MODEL PROFILE" idea, but only the *economic/availability* half. Evidence:
`docs/core-arch/stage-4/MODEL-MATRIX.md:108-135`, `docs/core-arch/stage-4/workflowAI.md:21-75`.
Status: PARTIALLY_IMPLEMENTED (no capability profile).

### 3.6 Independence, certification, concurrency and one-writer rules

`AGENTS.md` §2/§6 and `PROTO-DEC-0028/0029` (one writer for shared documents, cooperative lock),
`PROTO-DEC-0038` (risk-scaled review), `PROTO-DEC-0041` (independence, closed verdicts, parallel
certifiers), `PROTO-DEC-0047` items 1–5, `.ai/docs/CLI-AGENTS.md` §5. These already implement the
"roles not brands", "controller ≠ certifier" and "author never certifies own work" ideas that recur in
`RISK_COUNCIL.md` §22 (H-IND-01) and `SYNTHESIS` K2/K3. Status: IMPLEMENTED (governance), with the
*diversity* half of H-IND-01 explicitly not adopted (see §4.6).

### 3.7 Validator migration program (already run and decided)

```
OwnerIdeas source: MIGRATION.md (entire file)
Canonical replacement: PROTO-DEC-0025 item 5, PROTO-DEC-0039 item 3, PROTO-DEC-0077; the council package
                   docs/research/2026-09-25-validator-migration-council/ (final-plan-2.md sections A–AC)
Evidence: .ai/DECISIONS.md:3258-3318; docs/core-arch/PROPOSAL-node-validator.md
Status: IMPLEMENTED as research+decision; NOT IMPLEMENTED as code (`.ai/bin/protocol-validate.cjs` absent)
```

FACT: `Test-Path .ai/bin/protocol-validate.cjs` = False at `7b6d17a`; backlog `M-7` keeps the launch
conditions open. So the chain breaks at **IMPLEMENTATION**.

---

## 4. Partially implemented ideas (highest priority)

### 4.1 Empirical model capability / benchmark vector

- Idea: `benchmark.md` (Benchmark Vector L284, formula L385, expected cost L644, final resolver L696,
  contextual bandit L821, "which benchmark data is needed" L878; Master Research Brief L996; external
  benchmark profile L1292; role-specific routing L1522); `performers.md` MODEL PROFILE L74.
- Existing: provider positioning, tier table T1–T9, owner ladder, prices, per-model effort
  (`MODEL-MATRIX.md:124-135`, `MODEL-ECONOMICS.md:13-44`); resolver order in `PROTO-DEC-0075` items 8–9.
- Missing: a Benchmark Vector; any benchmark (SWE-Bench Pro, SWE-Lancer IC, RepoProbe, ArchBench,
  AACR-Bench, Terminal-Bench, LiveCodeBench, Aider Polyglot — `benchmark.md` §2–§7); benchmark→task
  weighting/aggregation; local-evidence learning; end-to-end use of benchmark data in the resolver.
- Status: PARTIALLY_IMPLEMENTED; Action: RESEARCH.

### 4.2 Task characterization layer separate from resolver and assurance

- Idea: `task_profife.md` (three-layer split L468; seven groups L36; factors §1–§9; vector replaces
  "complexity" L416; measurement classes L1397; weight validation L1521).
- Existing: `P-L2-002` rubric (Size, Protected paths, Novelty, Reversibility, Ambiguity, Coupling →
  T1–T9); `workflowAI.md` \(1.5\) maps floor/uncertainty/consequence to rungs.
- Missing: specification-strength, verification/testability, determinism (solution vs verification),
  static context estimation, coupling/volume as *separate* outputs, assurance depth as its own layer.
- Note: the corpus itself dates this gap (`task_profife.md:8` names `PROTO-DEC-0075` and says the
  existing layer is conceptually split but not formalized). Status: PARTIALLY_IMPLEMENTED; Action: RESEARCH.

### 4.3 Minimum-sufficient executor and escalation economics

- Idea: `executor.md` (minimum-sufficient executor L244; EAC/EAT recursion L209-236; exploration §9, §31,
  §32; regret L1000; chain as optimization unit L756; outcome learning L901; MVP no-ML L1075).
- Existing: capability floor → primary + two substitutes, no silent downgrade, error-aware recovery
  (`PROTO-DEC-0075` items 2–3, 8–10; `workflowAI.md` 1.5); route failover `P-L3-004`.
- Missing: `P_accept`, expected-cost/time recursion, escalation-chain optimization, exploration policy,
  regret metric, outcome-based recalibration/feedback loop (also `workflowAI.md` TD-MODEL-QUALIFICATION
  §6).
- Status: PARTIALLY_IMPLEMENTED; Action: RESEARCH.

### 4.4 Capability envelope / bounded execution authorization

- Idea: `H-AUTH-02.md` (envelope L24; seven checks L39; EXECUTE/DELEGATED/OWNER/STOP L50).
- Existing: one-run/one-worktree isolation (`PROTO-DEC-0070`), default-deny git modes and
  credential-separated executor (`PROTO-DEC-0077` item 3, `P-L3-004` R-L3-004.9), approval gate
  (`PROTO-DEC-0078` item 4), narrow permission profiles (`PROTO-DEC-0047` item 7), five access tiers
  (`.ai/docs/PROTOCOL.md:97-116`).
- Missing: one machine-readable envelope descriptor, and a deterministic decision procedure for the
  four outcomes (today it is scattered across decisions and the launcher); the "stale/superseded
  authorization" and "resume inherits permission" checks have no single home. Backlog `C-4` keeps
  H-AUTH-02 sequencing to the owner.
- Status: PARTIALLY_IMPLEMENTED; Action: KEEP (needs a decision + implementation).

### 4.5 Write coordination beyond the shared-document lock

- Idea: `scripts.md` Track B (write broker L419; request schema L469; conflict classes L565; optimistic
  concurrency L595; lease/single supervisor L755; idempotency L542; backpressure L1227).
- Existing: cooperative lock for the four shared documents (`protocol-lock.cjs`,
  `PROTO-DEC-0028/0029`, `P-L5-001` proposal); per-attempt private clone in the research launcher;
  one-writer rules in `PAIRED-CYCLE.md` §6.
- Missing: a broker/queue for many concurrent writers, conflict classification, idempotency keys,
  operation IDs, dependency-aware integration, backpressure, validation farm.
- Status: PARTIALLY_IMPLEMENTED (shared docs only); Action: RESEARCH (do not implement directly).

### 4.6 Procedure-to-script conversion maturity ladder

- Idea: `scripts.md` §29–§31 (M0–M5 L853-883; shadow conversion L887-908; CONVERT NOW/SHADOW/KEEP L1352).
- Existing: `PROTO-DEC-0047` item 8 script standard; `CORE-ARCH-2` §3 evidence classes A–E and the four
  conditions (spec §1); `P-L0-001` step 6.
- Missing: a per-procedure maturity state, an explicit shadow-run promotion criterion, and a registry
  of converted procedures.
- Status: PARTIALLY_IMPLEMENTED; Action: KEEP (small; joins P-L0-001).

### 4.7 Removing PowerShell from the hot path / work elimination

- Idea: `Rust.md` §B (remove PowerShell), §Z (eliminate work first), `scripts.md` §6–§11 (script
  performance, fast/slow path).
- Existing: measured cost (PROPOSAL-node-validator §1: validator 3 s/run, suite 224 s avg, 300 PS
  processes/run); decisions `PROTO-DEC-0025` item 5, `0039` item 3, `0077`; `stats`/hooks snapshot
  incremental behavior.
- Missing: the Node validator itself, test-suite split, fast/full path separation, snapshot/cache.
- Status: PARTIALLY_IMPLEMENTED; Action: COMPLETE for the already-decided Node port; the rest RESEARCH.

### 4.8 Route failover and single-active-executor identity

- Idea: `scripts.md` §25 (lease-based single supervisor), `Google_AX.md` §33–34 (failure recovery).
- Existing: `P-L3-004` trial implements state machine, PID+creation-time identity, one Kilo fallback,
  no two live executors, scope check; `run-chain.cjs` implements part; `PROTO-DEC-0075` items 2–3, 11.
- Missing: this is launcher code, not the kernel dispatch script (`BACKLOG C-3`, `M-4`); exactly-once
  semantics for kernel tasks and a lease abstraction are unproven.
- Status: PARTIALLY_IMPLEMENTED; Action: KEEP.

---

## 5. Missing L0–L3 mechanisms (Task 1)

For each level, the corpus idea that is absent or only partial. Chain marker = first broken link.

**L0 — governance, invariants, lifecycle, TC B**
- **GLOBAL-CORRECTNESS / derived graph** (`RISK_COUNCIL.md` H-GRAPH-01 L894; §42): kernel checks are
  local (LCC-1..9); no check for global deadlock, unreachable procedures, role dead-ends, missing
  exits. Missing. Link broken at IMPLEMENTATION.
- **TCB and self-hosting safety** (`RISK_COUNCIL.md` H-TCB-01 L845, §45): no declared trusted computing
  base, no N-1/differential bootstrap for the machinery that validates kernel changes. Missing
  (partially touched by the validator migration's differential design). Link broken at DECISION.
- **Packet freshness / kernel epoch** (`RISK_COUNCIL.md` H-FRESH-01 L778, H-VERSION-01 L1383):
  `PROTO-DEC-0075` item 7 pins launch inputs; there is no kernel-epoch/version compatibility rule for
  artifacts consumed under a newer kernel. Missing.
- **Instruction/data trust boundary and secret propagation** (`RISK_COUNCIL.md` H-SEC-02 L1074,
  H-SEC-03 L1132): only a pattern-based secret scanner in `record` and cooperative-mode assumptions;
  no trust classification, tainting, or provenance for untrusted text. Missing.
- **Bounded L0 loading** (`RISK_COUNCIL.md` H-CTX-01 L449): the always-loaded root is a *proposal*
  (`CORE-ARCH-2` §2.1, ≤8 000 B); the L0 A/B/C and boot-minimization experiments are unrun. Missing.
- **Owner as SPOF / delegable vs owner-only** (`H-OWNER-01` L1440): partially addressed by
  `PROTO-DEC-0062` item 3 delegation and `0078` item 3, but no explicit owner-only boundary. Partial.

**L1 — roles, independence, rights, responsibility**
- **Epistemic diversity, not only procedural independence** (`H-IND-01` L1164): the kernel removed
  the "one certifier from another family" rule (`CORE-ARCH-3` §5, "снято"); common-mode failure is
  not covered. Missing (deliberate owner choice; still an open risk).
- **Independence judged by model lineage** (`CORE-ARCH-3` §2/§5, R-L1-002.1/.2): proposed, not landed;
  the current check is still prose-based `protocol-scope.cjs`. Partial (implementation).

**L2 — task characterization, lifecycle, selection, acceptance, review, repair, assurance**
- **Task characterization vector** (§4.2 above): Missing.
- **Assurance depth as its own layer** (`task_profife.md` §3, §9 L382): today risk raises model tier
  (`P-L2-002`), not review/certification depth per task class. Partial (`PROTO-DEC-0047` item 3 is
  risk-scaled, but not derived from task characterization).
- **Assurance/acceptance pipeline with an evidence contract per artifact** (`RISK_COUNCIL.md`
  H-STATE-01 L810; `CORE-ARCH-4` §5 candidate package): candidate package is a design, not built.
  Missing.
- **Repair economics** (`executor.md` §30; `scripts.md` §43 conflict repair): repair is bounded
  (`PROTO-DEC-0075` item 12) but not cost-measured or fed back. Partial.

**L3 — execution, dispatch, supervision, discovery, routing, failover, locks, tooling**
- **Kernel dispatch script** (resolver + supervisor): `workflowAI.md` §2 and `PROTO-DEC-0050` item 4,
  `0074`–`0076`; only `run-chain.cjs` exists, partial (`BACKLOG C-3`, `M-4`). Missing.
- **Write broker / queue / conflict classes** (`scripts.md` Track B): Missing.
- **Model qualification layer** (`workflowAI.md` §6 TD-MODEL-QUALIFICATION; `BACKLOG C-5`): the
  AVAILABLE→WORKING move is owner-by-hand; frozen hypothesis H-WAI-2..5. Missing.
- **Test/validation farm and incremental post-integration validation** (`scripts.md` §41–§42):
  Missing.
- **Persistent daemon, filesystem watcher, multi-level cache, validation DAG, worklog index**
  (`Rust.md` §D–§T): Missing; `Rust.md` is hypothesis-space, not decided.
- **Idempotency/operation IDs in mutations** (`scripts.md` §16, §123; `MCP_Server.md` §120–126):
  Missing.

---

## 6. Research candidates (do not turn into implementation tasks)

1. `RISK_COUNCIL.md` — the whole frame (23 hypotheses, rounds, 8 experiments, P0/P1/P2). Highest value.
2. `benchmark.md` — benchmark-driven capability/selection; needs external data + local measurement.
3. `executor.md` — minimum-sufficient-executor economics; needs experiments and outcome data.
4. `task_profife.md` — factor predictive power and weight validation.
5. `scripts.md` — write-broker A/B/C/D experiment before any broker is built (§47 falsification is explicit).
6. `Google_AX.md` — already routed into `PROTO-DEC-0066` study A (`improvement-research`), not started.
7. `MCP_Server.md` generic mechanisms — only after the MCP council's native-only ruling is revisited;
   per `PROTO-DEC-0047` item 11, a description justifies a trial, never activation.
8. `Rust.md` K5 — performance hypotheses; the already-decided Node port (0077) must be measured first.
9. `H-PROMPT-DELIVERY-01` — frozen hypothesis (`PROTO-DEC-0076` item 4); needs the B/C/E test.

---

## 7. Superseded / stale material (reverse problem)

- **`MCP_Server.md` (STALE architecture)** — its central question (Colabs → one/many MCP servers) is
  closed: `PROTO-DEC-0034` (advisory only, ≤1 server, ≤1500 schema tokens, no auto-install),
  `PROTO-DEC-0036` (Track C closed; repomix MCP not adopted), `PROTO-DEC-0045` item 1 (no memory
  engine/graph backend), and the MCP council ruling (native-only now). FACT: `.ai/TASK.md` says the
  MCP council remains closed. The generic mechanisms (typed schemas, structured errors, idempotency,
  authz, audit) survive only as requirements in `H-AUTH-02`/`P-L3-004`, not as MCP architecture.
- **`Rust.md` framing (STALE in part)** — `PROPOSAL-node-validator.md:38` states Rust appears only in
  `OwnerIdeas/` seeds and is not a decision; `RISK_COUNCIL.md` §48 says "do not assume Rust"; the
  decided runtime is Node (`PROTO-DEC-0025` item 5, `0039` item 3, `0077`). The *hypotheses* are live,
  the "Rust is the answer" framing is not.
- **`benchmark.md` / `executor.md` "current mechanism" passages (STALE)** — they describe a resolver
  that evaluates complexity, assigns a tier and a model. FACT: at `7b6d17a` the kernel has a *tier
  table + owner ladder + resolver order* (`PROTO-DEC-0075` items 8–9, `workflowAI.md`), no automatic
  task→model resolver, and `PROTO-DEC-0075` item 8 already narrowed tiering. A new agent reading
  `executor.md`/`benchmark.md` could believe the resolver exists.
- **`MIGRATION.md` (SUPERSEDED/DUPLICATE)** — it is the pre-council prompt; the council finished and
  `PROTO-DEC-0077` replaced its timing. Reading it as open architecture is reading a closed step.
- **`SYNTHESIS-2026-09-25-cross-document.md` (SUPERSEDED)** — an intermediate synthesis of an earlier
  step, by its own header advisory; this revision supersedes it.

---

## 8. Delete candidates (classification only — nothing deleted)

| Item | Why | Confidence |
|---|---|---|
| `scripts.md` second copy L1516–3029 | Byte-identical program text repeated (only the trailing sentence differs by 2 chars) | high |
| `MIGRATION.md` | Byte-identical to `validator-migration-council/OWNER-PROMPT.md` (council README line 5) and superseded by `final-plan-2.md` + `PROTO-DEC-0077` | high |
| `performers.md` L139–1344 (the brief portion) | Byte-identical to `benchmark.md` L949–2154 (862 matched non-blank lines); only `performers.md` L1–138 ("MODEL PROFILE" inventory, tree, notes) is unique | high |
| `SYNTHESIS-2026-09-25-cross-document.md` | Intermediate synthesis of a closed step; no standalone value after this revision | medium |
| `MCP_Server.md` | Stale central hypothesis; mechanism inventory already represented in `H-AUTH-02`/`P-L3-004`; keep only if the owner wants the raw hypothesis list | medium (explicitly: extract the mechanism list first) |

---

## 9. Archive candidates (keep as provenance, remove from active corpus)

- `executor.md`, `task_profife.md` — after their active factors are moved into a research frame
  (they are the only source of the task-characterization vector).
- `benchmark.md` — after the benchmark list is registered as a research input.
- `Rust.md`, `Google_AX.md` — after study A / the Node port produce a decided outcome.
- `RISK_COUNCIL.md` — only after the council runs (until then it is ACTIVE, not archive).
- `MIGRATION.md` — archive even if not deleted (provenance of the validator decision).
- `H-AUTH-02.md`, `H-PROMPT-DELIVERY-01...md` — keep active until their frames close.

---

## 10. Contradictions between OwnerIdeas and the current kernel

1. **MCP as central runtime vs `PROTO-DEC-0034/0036/0045`** (`MCP_Server.md` §6 L254, §27–29 L818-881,
   §197–199 L3006). The corpus proposes MCP architecture candidates including "MCP as main runtime";
   the kernel makes MCP advisory-only with a one-server/1500-token cap and closed the repomix/Track-C
   line. Reported, not resolved.
2. **Rust rewrite as goal vs decided Node runtime** (`Rust.md` §A L148, §B L184; `PROTO-DEC-0025` item 5,
   `0077`). The kernel keeps Rust as an owner hypothesis, not a direction.
3. **AX as execution plane vs `PROTO-DEC-0076` item 1 CLI-only routes** (`Google_AX.md` §5 L175,
   §44–47). The kernel's current route rule is makers' CLIs with one DeepSeek-Max exception; AX is
   study-A material only.
4. **`H-PROMPT-DELIVERY-01` variant D vs `PROTO-DEC-0073`** (orchestrator injecting task text). The
   corpus itself flags this; variant C's routing file is the unresolved point. OPEN QUESTION.
5. **Implied existing resolver vs tier table + owner ladder** (`benchmark.md`, `executor.md`): stale
   description of "current" behavior, not a decision conflict.
6. **`RISK_COUNCIL.md` §32 assignment via `P-L2-002` vs `SYNTHESIS` K6 / `workflowAI.md`**: the
   tier table is being replaced by the owner ladder in practice. Tension, not contradiction.

---

## 11. Highest-value omissions (ranked)

1. **Capability envelope / bounded execution authorization** (`H-AUTH-02`): closes the owner-SPOF and
   permission-drift class; pieces exist (`0070`, `0077` item 3, `0078` item 4) with no single home.
2. **Write broker + conflict classes** (`scripts.md` Track B): the kernel is designed for 2–3 writers;
   the corpus targets 10–15; the one-writer lock protects only four files.
3. **Task-characterization vector + assurance-depth separation** (`task_profife.md`): the current
   rubric is acknowledged incomplete and mixes characterization with model choice.
4. **Empirical model qualification + economics** (`benchmark.md`, `executor.md`; `workflowAI.md`
   TD-MODEL-QUALIFICATION): decisions exist for the *floor* and *no silent downgrade*, none for
   measured capability or the feedback loop.
5. **TCB and self-hosting safety** (`RISK_COUNCIL.md` H-TCB-01): the validator migration already has a
   differential design; TCB as a general concern has no home.
6. **Single-active-writer / exactly-once** (`H-RUNTIME-01`): the launcher has a running record, the
   kernel task model does not.
7. **Security trust boundary and secret propagation** (`H-SEC-02/03`): cooperative mode is assumed;
   the owner's own `D:\mcp-stack` incident (`.ai/TASK.md` Open questions) shows the class is real.
8. **Global graph correctness** (`H-GRAPH-01`): local consistency checks miss cross-layer cycles.

---

## 12. Uncertain classifications

- **`RISK_COUNCIL.md`**: ACTIVE vs RESEARCH_CANDIDATE. It is a ready research *program*, and
  `PROTO-DEC-0066` studies A/B partially pre-empt parts of it. I classify it RESEARCH_CANDIDATE and
  recommend one owner sequencing decision (`BACKLOG C-4`). Confidence: medium.
- **`MCP_Server.md`**: STALE vs DELETE_CANDIDATE. The architecture is stale; the 200-point mechanism
  inventory may still be useful. I did not verify each of the ~200 sections line-by-line. Confidence:
  medium.
- **`Rust.md`**: some hypotheses are already satisfied by the Node port direction (remove PowerShell,
  incremental snapshot via `handoff state`), so treating the file as wholly live would mislead.
  Confidence: medium.
- **`Google_AX.md`**: ACTIVE vs RESEARCH_CANDIDATE — it is already dispatched as study A, so it is
  "active" only inside that frame. Confidence: high.
- **`scripts.md`**: the write-broker need is real, but the file's own §53 falsification list warns the
  bottleneck may not exist. Cannot settle from the tree; needs the A/B/C/D experiment. Confidence: low.

---

## 13. Recommended next actions

1. **Do not delete anything yet.** Move the clear duplicates (`scripts.md` L1516–3029, `MIGRATION.md`,
   `performers.md` brief) to an archive/delete list for the Gemini cleanup stage, with the evidence above.
2. **Register the active gaps as canonical destinations** (owner choice: decision, research, or backlog):
   - H-AUTH-02 envelope → one decision candidate; input to backlog `C-3` (dispatch script).
   - `task_profife.md` vector + `executor.md` economics + `benchmark.md` benchmark set → **one**
     research frame on task characterization & model qualification (do not split into three).
   - `scripts.md` Track B → separate research frame with the A/B/C/D experiment; do not implement a broker.
   - `RISK_COUNCIL.md` (incl. H-TCB-01, H-RUNTIME-01, H-SEC-02/03) → the next council; sequencing is
     the owner's (`BACKLOG C-4`).
3. **Fix the stale readings**: add "superseded/stale" headers to `MCP_Server.md`, the `Rust.md` framing,
   and the "current resolver" passages of `benchmark.md`/`executor.md`, so a new agent does not read
   them as current architecture.
4. **Keep `H-PROMPT-DELIVERY-01` frozen** until its B/C/E test runs (`PROTO-DEC-0076` item 4).
5. **Do not create a second source of truth**: any corpus block that becomes a decision must be reduced
   to a pointer.

---

## 14. Required summary table

| Source | Idea | Related layer | Current implementation | Canonical source | Status | Action | Confidence |
|---|---|---|---|---|---|---|---|
| benchmark.md L996-2157 | Benchmark-driven selection research program | L2/L3 | none (owner ladder + tier table only) | — | RESEARCH_CANDIDATE | RESEARCH | high |
| benchmark.md L284/385/644/696 | Benchmark Vector, cost/resolver formula | L2/L3 | none | — | ACTIVE | RESEARCH | high |
| benchmark.md L1292 | External benchmark portfolio (8 benchmarks) | L2 | none | — | RESEARCH_CANDIDATE | RESEARCH | high |
| benchmark.md L1607-1960 | Multi-round research + certification template | L0/L2 | rounds 1–3, draft/critique/final | PROTO-DEC-0052/0053; council package | IMPLEMENTED | COMPLETE | high |
| benchmark.md L2157 | ADDENDUM performance/throughput metrics | L3/L6 | telemetry only, flawed (2.96×) | PROTO-DEC-0044; PROTOCOL.md telemetry | PARTIALLY_IMPLEMENTED | RESEARCH | medium |
| performers.md L52-186 | MODEL PROFILE essence | L2/L3 | MODEL-MATRIX (availability/price only) | P-L3-002/003 | PARTIALLY_IMPLEMENTED | KEEP | medium |
| performers.md L186-1314 | duplicate of benchmark brief | — | — | benchmark.md | DUPLICATE | COMPLETE | high |
| executor.md L244 | Minimum-sufficient executor | L2/L3 | capability floor, primary+2 substitutes | PROTO-DEC-0075 items 8-10; workflowAI 1.5 | PARTIALLY_IMPLEMENTED | RESEARCH | high |
| executor.md L209-236 | EAC/EAT recursion, P_accept | L2 | none | — | RESEARCH_CANDIDATE | RESEARCH | high |
| executor.md L756 | Execution policy chain as unit | L2/L3 | error-aware recovery, not cost-optimised | PROTO-DEC-0075 items 2-3 | PARTIALLY_IMPLEMENTED | RESEARCH | medium |
| executor.md L948/L1000/L901 | Shadow exploration, regret, outcome learning | L2 | none; TD-MODEL-QUALIFICATION | workflowAI §6, BACKLOG C-5 | PARTIALLY_IMPLEMENTED | RESEARCH | high |
| executor.md L966 | 5-strategy comparison experiment | L2 | none | — | RESEARCH_CANDIDATE | RESEARCH | high |
| task_profife.md L468 | Task Characterizer / Resolver / Assurance split | L2 | rubric mixes them | P-L2-002 0.4 | PARTIALLY_IMPLEMENTED | RESEARCH | high |
| task_profife.md L36/L52/L196/L241 | Factor vector (spec, verification, determinism, …) | L2 | partial (novelty/ambiguity/coupling) | P-L2-002; PROTO-DEC-0075 item 8 | PARTIALLY_IMPLEMENTED | RESEARCH | high |
| task_profife.md L1043 | Static context estimator script | L2/L3 | none | — | RESEARCH_CANDIDATE | RESEARCH | high |
| task_profife.md L1521 | Weight validation plan | L2 | none | — | RESEARCH_CANDIDATE | RESEARCH | high |
| scripts.md L419 | Write broker / queue | L3 | shared-doc cooperative lock only | PROTO-DEC-0028/0029; P-L5-001 (proposal) | PARTIALLY_IMPLEMENTED | RESEARCH | high |
| scripts.md L565 | Conflict classes (path/hunk/semantic/protocol/baseline) | L3 | none | — | ACTIVE | RESEARCH | high |
| scripts.md L595 | Optimistic concurrency | L3 | none (pessimistic lock) | — | RESEARCH_CANDIDATE | RESEARCH | medium |
| scripts.md L755 | Lease-based single supervisor | L3 | P-L3-004 running record; launcher only | P-L3-004 R-L3-004.7 | PARTIALLY_IMPLEMENTED | KEEP | high |
| scripts.md L853 | M0–M5 scriptability + shadow conversion | L0/L2 | four-condition script standard; no ladder | PROTO-DEC-0047 item 8; CORE-ARCH-2 §3 | PARTIALLY_IMPLEMENTED | KEEP | medium |
| scripts.md L912 | Deterministic before probabilistic | L0/L3 | implemented in scripts/validator | PROTO-DEC-0047 item 8; AGENTS §7 | IMPLEMENTED | COMPLETE | high |
| scripts.md L1143/L1227 | Validation farm, backpressure | L3 | none | — | RESEARCH_CANDIDATE | RESEARCH | medium |
| scripts.md L1516-3029 | duplicate program copy | — | — | scripts.md L1-1515 | DUPLICATE | COMPLETE | high |
| Rust.md L184/L733 | Remove PowerShell; work-elimination | L3 | decided Node port, not built | PROTO-DEC-0025 item 5; 0039 item 3; 0077 | PARTIALLY_IMPLEMENTED | COMPLETE | high |
| Rust.md L237-746 | Snapshot, watcher, cache, daemon, DAG, index | L3 | none | — | RESEARCH_CANDIDATE | RESEARCH | high |
| Rust.md L148 | Rust core / colabs binary | L3 | not decided; Node chosen | PROPOSAL-node-validator:38 | STALE | RESEARCH | medium |
| MCP_Server.md L254-364 | MCP architecture candidates A–J | L3 | MCP advisory-only, ≤1 server | PROTO-DEC-0034/0036/0045 | STALE | KEEP (extract list) | medium |
| MCP_Server.md L963-1048/L1571-1606 | authz, idempotency, batching, error taxonomy | L1/L3 | scattered in 0047 item 7, 0070, 0077, P-L3-004 | PROTO-DEC-0070/0077; P-L3-004 | PARTIALLY_IMPLEMENTED | KEEP | medium |
| Google_AX.md L175-269 | AX boundary architectures A–I | L2/L3 | study A dispatched, not started | PROTO-DEC-0066; improvement-research README | RESEARCH_CANDIDATE | RESEARCH | high |
| Google_AX.md L540-617 | Routing / multi-model consensus primitives | L2 | routing in workflowAI; consensus = review/council | PROTO-DEC-0074/0075; 0041/0052 | PARTIALLY_IMPLEMENTED | RESEARCH | medium |
| MIGRATION.md (all) | Validator migration council prompt | L0/L3 | council done; decision 0077; code not built | PROTO-DEC-0077; final-plan-2.md | DUPLICATE | COMPLETE | high |
| RISK_COUNCIL.md L845 | H-TCB-01 TCB / self-hosting | L0 | none | — | ACTIVE | RESEARCH | high |
| RISK_COUNCIL.md L934 | H-RUNTIME-01 exactly-once single writer | L3 | launcher running record only | P-L3-004 R-L3-004.7 | PARTIALLY_IMPLEMENTED | RESEARCH | high |
| RISK_COUNCIL.md L894 | H-GRAPH-01 global correctness | L0 | LCC local only (proposal) | CORE-ARCH-1 §6.3 | PARTIALLY_IMPLEMENTED | RESEARCH | high |
| RISK_COUNCIL.md L778/L1383 | H-FRESH-01 / H-VERSION-01 freshness, epoch | L0/L5 | 0075 item 7 pins launch inputs | PROTO-DEC-0075 item 7 | PARTIALLY_IMPLEMENTED | RESEARCH | medium |
| RISK_COUNCIL.md L1074/L1132 | H-SEC-02/03 trust boundary, secrets | L0/L3 | pattern scanner in record only | AGENTS §5/§7 | PARTIALLY_IMPLEMENTED | RESEARCH | high |
| RISK_COUNCIL.md L1164 | H-IND-01 independence vs diversity | L1 | procedural independence only | PROTO-DEC-0041; CORE-ARCH-3 §5 | PARTIALLY_IMPLEMENTED | RESEARCH | medium |
| RISK_COUNCIL.md L449 | H-CTX-01 L0 loading; §38–§40 experiments | L0 | L0 is a proposal | CORE-ARCH-2 §2 | PARTIALLY_IMPLEMENTED | RESEARCH | high |
| RISK_COUNCIL.md L1440 | H-OWNER-01 owner SPOF | L0/L1 | delegation rules partial | PROTO-DEC-0062 item 3; 0078 item 3 | PARTIALLY_IMPLEMENTED | RESEARCH | medium |
| RISK_COUNCIL.md (whole) | Risk-audit frame: rounds, H-*, experiments | L0–L3 | not run; backlog C-4 | docs/ops/BACKLOG.md:100 | RESEARCH_CANDIDATE | RESEARCH | high |
| H-AUTH-02.md L24/L50 | Capability envelope + 4-way decision | L1/L3 | pieces in 0070/0077/0078, no single home | PROTO-DEC-0070/0077/0078; P-L3-004.9 | PARTIALLY_IMPLEMENTED | KEEP | high |
| H-PROMPT-DELIVERY-01.md L22 | Delivery variants A–E | L3 | 0073 in force; variant B built | PROTO-DEC-0073; 0076 item 4 | ACTIVE | KEEP | high |
| SYNTHESIS-2026-09-25-cross-document.md (all) | K1–K10 synthesis, next-cycle order | L0–L3 | intermediate artifact | — | ARCHIVE_CANDIDATE | COMPLETE | medium |
| .ai/DECISIONS.md:3258-3318 | 0077 migration decision + F-3P-1 open | L0/L3 | decided, launch conditions open (M-7) | PROTO-DEC-0077 | PARTIALLY_IMPLEMENTED | KEEP | high |
| .ai/bin/protocol-validate.cjs | Node validator port (from Rust.md §B) | L3 | file absent | PROTO-DEC-0025 item 5; 0077 | PARTIALLY_IMPLEMENTED | COMPLETE | high |

---

## 15. Open questions (no answer given during this run)

1. Does the owner intend `RISK_COUNCIL.md` to run as its own council now, or is `PROTO-DEC-0066`
   study A/B the intended path? (`BACKLOG C-4` is owner-sequenced.)
2. Should `MCP_Server.md` keep its ~200-point mechanism inventory, or is the MCP line closed enough
   to archive the whole file?
3. Is a write broker in scope at all, or does the owner prefer the current 2–3-stream model
   (`PROTO-DEC-0048` item 7) indefinitely?
4. For the "duplicate" files (`scripts.md` copy 2, `MIGRATION.md`, `performers.md` brief): delete or
   archive? I classify, I do not decide.
