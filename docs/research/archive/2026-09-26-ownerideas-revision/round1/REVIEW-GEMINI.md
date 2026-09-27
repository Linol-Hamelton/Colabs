Mode: ADVISORY
Baseline: 7b6d17a; working tree status: dirty
Reviewer: Gemini 3.8 Flash, route agy, effort high, 2026-09-26
Scope: Full revision of OwnerIdeas corpus (13 files) against current Colabs kernel (L0-L3)
Verdict: REVIEW COMPLETE

# Round 1 Review — OwnerIdeas Corpus Revision (Gemini)

---

## 1. Executive summary

FACT: This review evaluates the complete 13-file `OwnerIdeas/` corpus (465,920 bytes across 13 files, synced at baseline `7b6d17a` per `CORPUS.md`) against the active Colabs kernel architecture spanning L0 to L3 (`.ai/DECISIONS.md` up to PROTO-DEC-0078, `docs/core-arch/`, `.ai/bin/`, hooks, and regression tests).

The revision establishes three primary findings:

1. **Strategic Provenance vs Active Kernel Gaps**:
   The corpus contains two distinct strata of material:
   - *Executed and Canonicalized Seeds*: Several major files have already fulfilled their lifecycle. Most prominently, `OwnerIdeas/MIGRATION.md` served as the charter for the Validator Migration Council, which concluded with `docs/research/2026-09-25-validator-migration-council/final-plan-2.md` and accepted decision PROTO-DEC-0077. Similarly, core concepts from `performers.md` and `task_profife.md` directly seeded the model-layer decisions PROTO-DEC-0074, PROTO-DEC-0075, and `docs/core-arch/stage-4/workflowAI.md`.
   - *Unimplemented High-Value Architectural Foundations*: Crucial architectural layers and mechanisms conceptualized with great depth in `OwnerIdeas` were lost, deferred, or only partially implemented during the initial construction of CORE-ARCH stages 1-4. Most notably:
     - **L0 Governance**: Bounded execution authorization and capability envelopes (`H-AUTH-02.md`, `RISK_COUNCIL.md` H-AUTH-01/H-SEC-01) remain completely absent as machine-enforced barriers;
     - **L1 Roles**: Frame-aware role assignment (`SCHEMA-assignment.md`, В-12) and single-active-supervisor process identity (`RISK_COUNCIL.md` H-RUNTIME-01) remain transitional shims;
     - **L2 Task & Model Lifecycle**: The independent `TASK CHARACTERIZATION / TASK PROFILE` diagnostic layer (`task_profife.md`) was never built, leaving `P-L2-002` stuck in a conflated rubric. The multidimensional model capability vector (`benchmark.md`), minimum-sufficient executor optimization (`executor.md`), and empirical Bayesian learning loop remain unbuilt, acknowledged as tech debt `TD-MODEL-QUALIFICATION` in `workflowAI.md`;
     - **L3 Coordination & Execution**: The Write Broker / Queue Architecture (`scripts.md` Track B) was entirely bypassed in favor of a coarse cooperative lock (`protocol-lock.cjs`), severely restricting multi-agent concurrency. The deterministic Kernel Dispatch Script (`workflowAI.md`, PROTO-DEC-0050 item 4, BACKLOG C-3) remains unwritten.

2. **Corpus Cleanup & De-duplication**:
   `OwnerIdeas` must not remain an uncurated second source of truth. Materials that are fully superseded or historical charters (such as `MIGRATION.md` and `SYNTHESIS-2026-09-25-cross-document.md`) are classified as `ARCHIVE_CANDIDATE`. Ideas frozen by prior council rulings (such as direct in-process MCP server adoption from `MCP_Server.md`, closed by PROTO-DEC-0036) are classified as `SUPERSEDED` / `RESEARCH_CANDIDATE` (for Study A under PROTO-DEC-0066).

3. **Maturity Breakpoints**:
   Applying the required maturity chain (`IDEA -> DECISION -> PROCEDURE/ARCHITECTURE -> IMPLEMENTATION -> VALIDATION/TESTS -> END-TO-END USE`), the majority of active proposals in `OwnerIdeas` break at the **DECISION -> PROCEDURE** or **PROCEDURE -> IMPLEMENTATION** boundaries. Concepts exist in decision prose (e.g. PROTO-DEC-0075 recovery rules, PROTO-DEC-0074 role decomposition), but lack concrete procedural schemas, deterministic tools, or automated test harnesses.

---

## 2. Inventory reviewed

FACT: All 13 files specified in `CORPUS.md` at baseline commit `7b6d17a` were reviewed in full against the current repository state:

| # | File Path | Bytes | Primary Architectural Subject | Status in Kernel |
|---|---|---:|---|---|
| 1 | `OwnerIdeas/benchmark.md` | 57,328 | Multidimensional model capability vectors; authoritative benchmark portfolio; geometric mean fit formula; Bayesian outcome updating; Expected Cost/Time optimization | Partially Implemented / Research Candidate |
| 2 | `OwnerIdeas/executor.md` | 24,778 | Minimum-sufficient executor principle; cheap-first exploration under strong verification; execution chains; regret minimization | Partially Implemented / Research Candidate |
| 3 | `OwnerIdeas/Google_AX.md` | 34,828 | Google AX integration; thin runtime adapter vs protocol core; state machine; event-driven DAG scheduler; persistent agent memory | Research Candidate (Seed for Study A, PROTO-DEC-0066) |
| 4 | `OwnerIdeas/H-AUTH-02.md` | 1,520 | Bounded execution authorization; capability envelopes; machine-verifiable state transitions; deterministic EXECUTE / DELEGATED / OWNER / STOP | Active (Critical L0/L1 omission) |
| 5 | `OwnerIdeas/H-PROMPT-DELIVERY-01_canonical-task-file-vs-orchestrator-loading.md` | 4,054 | Task delivery mechanisms (inline CLI vs file link vs orchestrator injection vs model operator); cost, auditability, drift trade-offs | Research Candidate (Frozen hypothesis) |
| 6 | `OwnerIdeas/MCP_Server.md` | 54,534 | MCP server architecture; tools vs resources vs prompts; ports and adapters; shadow mode; optimistic concurrency; caching | Superseded / Research Candidate (Study A) |
| 7 | `OwnerIdeas/MIGRATION.md` | 27,051 | Colabs Validator Migration Council charter; behavioral contracts; differential verification; Node.js migration | Archive Candidate / Superseded (PROTO-DEC-0077) |
| 8 | `OwnerIdeas/performers.md` | 56,659 | 13 model information groups; comprehensive `MODEL PROFILE` schema; AVAILABLE vs WORKING pool qualification | Partially Implemented / Active (Stage 4) |
| 9 | `OwnerIdeas/RISK_COUNCIL.md` | 58,612 | Kernel Architecture Risk Council charter; 18 risk hypotheses (H-CTX, H-FRESH, H-STATE, H-SEC, H-IND, etc.); L0 A/B/C experiments | Active / Research Candidate |
| 10 | `OwnerIdeas/Rust.md` | 25,866 | Colabs performance profiling; work elimination; persistent daemon (`colabsd`); incremental snapshots; native validation DAG | Research Candidate (Study A, PROTO-DEC-0066) |
| 11 | `OwnerIdeas/scripts.md` | 67,617 | Track A script performance; Track B Write Broker & Queue Architecture; Track C Procedure-to-Script conversion pipeline | Active (Track B & C missing in L3) |
| 12 | `OwnerIdeas/SYNTHESIS-2026-09-25-cross-document.md` | 12,071 | Intermediate cross-document synthesis of 7 earlier corpus files; convergence clusters K1-K10; kernel readiness evaluation | Archive Candidate (Superseded by 13-file review) |
| 13 | `OwnerIdeas/task_profife.md` | 40,982 | Standalone Task Characterization / Profile layer; 7 diagnostic dimensions; decoupling diagnosis from model pricing/selection | Active (Critical L2 omission) |

---

## 3. Implemented ideas

FACT: The following substantial ideas from `OwnerIdeas` have achieved complete or verified canonical realization in the current Colabs kernel:

### 1. Colabs Validator Migration to Node.js
- **OwnerIdeas source**: `OwnerIdeas/MIGRATION.md` (complete document, §§0-33).
- **Canonical replacement**: Decision block PROTO-DEC-0077 (`.ai/DECISIONS.md:3258-3315`) and `docs/research/2026-09-25-validator-migration-council/final-plan-2.md`.
- **Evidence**: The migration council executed three full rounds, produced `final-plan-2.md` with behavioral contracts, differential verification (shadow mode), and phased rollback, which was formally approved by the owner in PROTO-DEC-0077.
- **Status**: IMPLEMENTED (as a ratified design baseline and accepted decision; implementation packets pending launch).

### 2. Decoupling Model Names from Protocol Constants & Moving to Dynamic Data
- **OwnerIdeas source**: `OwnerIdeas/performers.md` §§8-38, `OwnerIdeas/MCP_Server.md` §135.
- **Canonical replacement**: Decision blocks PROTO-DEC-0073 and PROTO-DEC-0074 item 2 (`.ai/DECISIONS.md:2980-3020`), `docs/core-arch/stage-4/workflowAI.md:18-20`.
- **Evidence**: Model names, pricing, limits, and routes are strictly forbidden from script code and protocol constants; they reside exclusively in dynamic operational data files (`docs/ops/MODEL-ECONOMICS.md` and `docs/core-arch/stage-4/MODEL-MATRIX.md`).
- **Status**: IMPLEMENTED

### 3. Role-Based Governance Independent of Model Brands
- **OwnerIdeas source**: `OwnerIdeas/performers.md` §1, `OwnerIdeas/benchmark.md` §1.
- **Canonical replacement**: Decision blocks PROTO-DEC-0056 and PROTO-DEC-0074 items 1-4 (`.ai/DECISIONS.md:2250-2290`, `3010-3045`).
- **Evidence**: Kernel execution roles are formally specified as structural archetypes (`docs/core-arch/stage-2/roles/`), tasks are assigned to roles rather than brands, and rotation between steps is mandatory.
- **Status**: IMPLEMENTED

### 4. Three-Level Execution Model (Workflow vs Stage vs Invocation)
- **OwnerIdeas source**: `OwnerIdeas/RISK_COUNCIL.md` §17 (H-RUNTIME-01), `OwnerIdeas/executor.md` §25.
- **Canonical replacement**: Decision block PROTO-DEC-0075 item 1 (`.ai/DECISIONS.md:3068-3073`).
- **Evidence**: The protocol explicitly separates workflow/task completion, stage/role completion, and individual execution attempts. Artifact existence alone does not constitute completion.
- **Status**: IMPLEMENTED

### 5. Error-Aware Bounded Recovery and Substitution
- **OwnerIdeas source**: `OwnerIdeas/Google_AX.md` §§33-34, `OwnerIdeas/performers.md` §§47-50.
- **Canonical replacement**: Decision blocks PROTO-DEC-0075 items 2-5, PROTO-DEC-0078 item 1 (`.ai/DECISIONS.md:3074-3098`, `3333-3335`).
- **Evidence**: Recovery within a stage follows explicit error classifications (transient retry, resume-first, route substitution, model substitution, repair). Hard ceiling limits recovery to 1 primary retry and 2 attempts per substitute (max 5 invocations). Mechanical recovery is assigned to scripts, semantic recovery to reviewers.
- **Status**: IMPLEMENTED

### 6. Strict Independence & Conflict of Interest Barriers for Certifiers
- **OwnerIdeas source**: `OwnerIdeas/RISK_COUNCIL.md` §22 (H-IND-01), `OwnerIdeas/performers.md` §§67-69.
- **Canonical replacement**: Decision blocks PROTO-DEC-0041 item 1, PROTO-DEC-0057 item 2, PROTO-DEC-0075 item 13 (`.ai/DECISIONS.md:1200-1230`, `2295-2310`, `3130-3140`), `docs/core-arch/stage-2/P-L1-002-independence.md`.
- **Evidence**: Implementers and controllers are barred from certifying their own candidates. High-risk candidates require two parallel independent certifiers with verified receipt cryptographic hashes (`protocol-handoff.cjs verify --deep`).
- **Status**: IMPLEMENTED

### 7. Disposable Isolated Worktree/Clone Execution per Agent Task
- **OwnerIdeas source**: `OwnerIdeas/Google_AX.md` §§11, 16, 28; `OwnerIdeas/scripts.md` §4.
- **Canonical replacement**: Decision block PROTO-DEC-0070 (`.ai/DECISIONS.md:2750-2790`).
- **Evidence**: Multi-agent concurrent tasks are dispatched to disposable private clones/worktrees with `insteadOf` push blocks, preventing shared ref contamination and out-of-scope mutations.
- **Status**: IMPLEMENTED

### 8. Secret Scanning at Protocol Boundary
- **OwnerIdeas source**: `OwnerIdeas/RISK_COUNCIL.md` §21 (H-SEC-03), `OwnerIdeas/MCP_Server.md` §118.
- **Canonical replacement**: `AGENTS.md` section 7, implemented in `.ai/bin/protocol-handoff.cjs:140-165`.
- **Evidence**: `protocol-handoff.cjs record` automatically scans session journals and worklogs for credential/token patterns and aborts handoff upon detection.
- **Status**: IMPLEMENTED

---

## 4. Partially implemented ideas

FACT: The following core concepts from `OwnerIdeas` have achieved decision or draft procedure status, but have broken maturity chains prior to full implementation, test automation, or end-to-end operational use:

### 1. Multidimensional Model Resolver & Automated Qualification
- **Idea**: Replacing static scalar tiers (T1-T9) with a multidimensional Model Profile vector, evaluating external benchmark capabilities (SWE-Bench Pro, RepoProbe, AACR-Bench), and selecting executors dynamically via expected cost/time minimization (`benchmark.md`, `performers.md`, `executor.md`).
- **Existing**:
  - `workflowAI.md` (bootstrap procedure) implements owner ladder selection, capability floors by uncertainty x consequence, primary + 2 substitutes, and route failover (`P-L3-004`).
  - Decisions PROTO-DEC-0074 and PROTO-DEC-0075 define the selection invariants.
- **Missing**:
  - Full 13-group `MODEL PROFILE` schema (`performers.md`).
  - Authoritative external benchmark portfolio integration (`benchmark.md`).
  - Mathematical Expected Cost formula: $E[Cost] = (Cost_{direct} + P_{fail} \times Cost_{fail}) / P_{success}$.
  - Empirical Bayesian feedback loop from local task execution telemetry to model capability weights.
  - Formally acknowledged as tech debt in `workflowAI.md:142-157` (`TD-MODEL-QUALIFICATION`).
- **Break Point**: PROCEDURE -> IMPLEMENTATION.
- **Status**: PARTIALLY_IMPLEMENTED

### 2. Autonomous Script Supervisor & Deterministic Dispatcher
- **Idea**: A single authoritative supervisor process managing task state machines, operation IDs, mechanical retries, resume-first execution, and telemetry recording without human intervention (`Google_AX.md` §22, `RISK_COUNCIL.md` H-RUNTIME-01, `scripts.md` Track B).
- **Existing**:
  - Decisions PROTO-DEC-0075 and PROTO-DEC-0076 establish supervisor requirements and mechanical recovery rules.
  - Research runner `tools/run-chain.cjs` (or `prompts/launch.cjs`) provides transitional execution of multi-step chains.
- **Missing**:
  - The canonical Kernel Dispatch Script (`workflowAI.md:131`, PROTO-DEC-0050 item 4, BACKLOG C-3) is not built.
  - `run-chain.cjs` does not implement resume-first, error-class taxonomy routing, substitute failover, or launch-input pinning (BACKLOG M-4).
  - Supervisor identity is not bound to PID + start timestamp; dead-holder recovery in `protocol-lock.cjs` relies on manual cooperative clearing.
- **Break Point**: DECISION -> IMPLEMENTATION.
- **Status**: PARTIALLY_IMPLEMENTED

### 3. Runtime Performance Optimization & Work Elimination
- **Idea**: Eliminating cold PowerShell execution overhead, caching immutable repository invariants, implementing an incremental snapshot engine, and fast-path validation DAG (`Rust.md`, `scripts.md` Track A, `MCP_Server.md` §§77-84).
- **Existing**:
  - Node validator migration is designed and approved (`docs/research/2026-09-25-validator-migration-council/final-plan-2.md`, PROTO-DEC-0077).
  - `protocol-handoff.cjs record --quick` bypasses full test suites for intermediate research frames (PROTO-DEC-0071).
- **Missing**:
  - Node validator implementation has not landed.
  - Validation remains bounded by PowerShell execution latency in `validate-protocol.ps1` (5-15 seconds per call).
  - No incremental validation cache or filesystem watcher exists.
- **Break Point**: DECISION -> IMPLEMENTATION.
- **Status**: PARTIALLY_IMPLEMENTED

### 4. Bounded Execution Capability Envelopes
- **Idea**: Strict machine-enforced capability envelope per agent session (scope-id, allowed read/write paths, allowed tools, command classes, network/secret authority, expiry) (`H-AUTH-02.md`, `RISK_COUNCIL.md` H-SEC-01).
- **Existing**:
  - One-run disposable git clones (PROTO-DEC-0070).
  - Client execution profiles (`.ai/docs/CLI-AGENTS.md`, PROTO-DEC-0050 item 3).
  - Approval-gated rungs (PROTO-DEC-0078 item 4).
  - Read-only tool constraints in subagent definitions (`research` subagent).
- **Missing**:
  - A unified task capability descriptor format (`H-AUTH-02.md`).
  - Machine-enforced path-level read/write boundary enforcement outside of git status checks.
  - Deterministic evaluation of `EXECUTE` vs `DELEGATED-JUDGEMENT` vs `OWNER-DECISION` vs `STOP`.
- **Break Point**: ARCHITECTURE -> IMPLEMENTATION.
- **Status**: PARTIALLY_IMPLEMENTED

### 5. Context Bounding & Active Context Management
- **Idea**: Minimizing active context tax through lazy loading, token accounting, instruction reduction, and packet completeness verification (`RISK_COUNCIL.md` H-CTX-01..05, `MCP_Server.md` §§141-143).
- **Existing**:
  - Hard line caps on session journals (150 lines), `.ai/TASK.md` (80 lines), and review reports (250 lines) (`AGENTS.md` section 8).
  - Automatic worklog archiving via `protocol-archive.cjs`.
  - Telemetry recording of token/credit usage in `USAGE.md`.
- **Missing**:
  - Packet compiler (`CORE-ARCH-7`).
  - Packet completeness test harness (`RISK_COUNCIL.md` §38).
  - L0 A/B/C context minimization experiment (`RISK_COUNCIL.md` §39-40).
  - Static context estimator (`task_profife.md` §6).
- **Break Point**: PROPOSAL -> ARCHITECTURE.
- **Status**: PARTIALLY_IMPLEMENTED

---

## 5. Missing L0–L3 mechanisms

INFERENCE: Auditing the active kernel stages (`stage-1/`, `stage-2/`, `stage-4/`) against the 13 `OwnerIdeas` documents reveals substantial missing layers, interfaces, and transitions across L0 to L3:

### Level L0: Governance & Invariants
1. **Deterministic Bounded Authorization Engine (`OwnerIdeas/H-AUTH-02.md`)**:
   - *The Missing Mechanism*: An envelope parser and state-transition verifier that enforces:
     $$\text{Authorized Envelope} + \text{Machine-Verifiable State} + \text{1 Permitted Transition} \longrightarrow \text{EXECUTE}$$
     without relying on free-form LLM judgement of "implied" or "rational" authority.
   - *Current Gap*: The kernel relies entirely on prompt instructions and post-facto git diff inspection. If an agent executes an unapproved tool call, network request, or out-of-scope write, no L0 guard blocks it.
2. **Instruction vs Data Trust Boundary (`OwnerIdeas/RISK_COUNCIL.md` §20, H-SEC-02)**:
   - *The Missing Mechanism*: A structural parser that strictly tags and isolates repository file contents and external data from protocol instructions.
   - *Current Gap*: External repository text, issue contents, or corpus files can inject adversarial instructions directly into agent reasoning context.
3. **Kernel Epoch & In-Flight Invariant Pinning (`OwnerIdeas/RISK_COUNCIL.md` §13, H-FRESH-01, H-VERSION-01)**:
   - *The Missing Mechanism*: A monotonic `kernel_epoch` counter stamped into task launch files and checked on handoff.
   - *Current Gap*: If kernel rules or decisions change during a long-running multi-stage task, in-flight agents operate against stale invariants with no deterministic invalidation trigger.

### Level L1: Roles & Authority
1. **Frame-Aware Dynamic Role Assignment Engine (`docs/core-arch/stage-2/SCHEMA-assignment.md`, В-12)**:
   - *The Missing Mechanism*: An automated assignment resolver that binds model sessions to roles within specific task frames, validating capabilities (`FS_WRITE`, `SHELL_EXEC`, `EVIDENCE_SIGN`, `REPO_READ`).
   - *Current Gap*: L1 role assignments currently operate via a temporary text shim in `.ai/TASK.md` (lines 46-56).
2. **Authoritative Process Identity & Liveness Binding (`OwnerIdeas/RISK_COUNCIL.md` §17, H-RUNTIME-01)**:
   - *The Missing Mechanism*: Binding the cooperative lock and session ownership to OS process identity (`PID + start_time`).
   - *Current Gap*: `protocol-lock.cjs` checks only a static session-id string. If an agent process crashes or is killed, the lock remains orphaned and requires manual intervention or `--force` recovery.
3. **Delegated Authority vs Owner Bottleneck Resolution (`OwnerIdeas/RISK_COUNCIL.md` §30, H-OWNER-01; `H-AUTH-02.md`)**:
   - *The Missing Mechanism*: Formal delegation contracts permitting coordinator agents to resolve non-critical ambiguities within bounded operational budgets.
   - *Current Gap*: The owner remains a synchronous single point of failure (SPOF) for every unexpected deviation, leading to multi-hour stalls.

### Level L2: Task Characterization, Lifecycle & Assurance
1. **Independent Task Characterization / Profile Layer (`OwnerIdeas/task_profife.md`)**:
   - *The Missing Mechanism*: A diagnostic module that evaluates tasks along 7 orthogonal dimensions (Task class capabilities mixture, Cognitive difficulty / reasoning depth, Consequence / blast radius, Technical constraints, Structural coupling, Verification strength, Specification quality) and outputs a normalized `TASK PROFILE` YAML/JSON object.
   - *Current Gap*: `P-L2-002-model-selection.md` conflates task diagnosis with model scoring and tier assignment. The kernel cannot represent a task that has massive volume (35 files) but trivial reasoning depth (rename field), or a task that touches 5 lines but has extreme cognitive difficulty.
2. **Minimum-Sufficient Executor Formula & Optimization (`OwnerIdeas/executor.md`)**:
   - *The Missing Mechanism*: An objective solver calculating the expected cost of candidate executors:
     $$\mathbb{E}[\text{Cost}] = \frac{\text{Cost}_{\text{direct}} + P_{\text{fail}} \times \text{Cost}_{\text{failure}}}{P_{\text{success}}}$$
     and selecting the minimum-sufficient model/harness tuple.
   - *Current Gap*: `workflowAI.md` relies entirely on a subjective owner ladder in `MODEL-ECONOMICS.md`.
3. **Verification-Coupled Executor Elasticity (`OwnerIdeas/task_profife.md` §5, `OwnerIdeas/executor.md` §21)**:
   - *The Missing Mechanism*: A rule modulating executor selection based on the strength of available automated verification. If deterministic unit tests and formal validators have 100% coverage, executor selection can safely down-shift to a fast, cheap model; if verification is subjective or weak, executor selection must escalate to senior models.
   - *Current Gap*: Verification strength is ignored during model selection.
4. **Code Reviewer Competence Profiling (Precision vs Recall) (`OwnerIdeas/benchmark.md` §4)**:
   - *The Missing Mechanism*: Disentangling code reviewer profiles into Precision (avoiding false alarms) vs Recall (catching all defects). Certifiers must be gated on high recall; iterative reviewers can tolerate lower recall in exchange for high precision.
   - *Current Gap*: The kernel treats all reviewer models as generic "reviewers".

### Level L3: Coordination, Dispatch & Automation
1. **Write Broker & Queue Architecture (`OwnerIdeas/scripts.md` Track B)**:
   - *The Missing Mechanism*: A centralized write coordinator managing concurrent write requests from parallel agents via an optimistic concurrency queue, detecting file-level and AST-level conflicts, and executing atomic integration commits.
   - *Current Gap*: Colabs is strictly constrained by a single coarse global lock (`protocol-lock.cjs`). Parallel agent execution is bottlenecked because agents cannot coordinate writes to shared repository areas.
2. **Deterministic Kernel Dispatcher (`workflowAI.md`, PROTO-DEC-0050 item 4, BACKLOG C-3)**:
   - *The Missing Mechanism*: A standalone script daemon that ingests task routing descriptors, monitors agent process lifecycles, collects exit codes, triggers automated retries and substitutions by error class, and compiles handoff reports.
   - *Current Gap*: Execution is manually driven via CLI commands or ad-hoc test scripts (`run-chain.cjs`).
3. **Systematic Procedure-to-Script Conversion Pipeline (`OwnerIdeas/scripts.md` Track C)**:
   - *The Missing Mechanism*: A formal maturity pipeline evaluating procedures against scriptability criteria (determinism, machine-readable inputs/outputs, bounded execution time) and converting stabilized prose rules into compiled, tested CLI tools.
   - *Current Gap*: Procedures accumulate as prose in `docs/core-arch/` with no systematic path to deterministic automation.

---

## 6. Research candidates

FACT: The following concepts in `OwnerIdeas` represent high-value architectural hypotheses that carry significant uncertainty, lack empirical verification, or affect multiple layers simultaneously. They must be handled as formal research programs rather than direct implementation tasks:

1. **Multidimensional External Benchmark Portfolio & Vector Weighting (`OwnerIdeas/benchmark.md`)**:
   - *Research Questions*: Which external benchmarks (SWE-Bench Pro, RepoProbe, SWE-Lancer IC, AACR-Bench, Terminal-Bench) correlate with real agent success in the Colabs repository? Does geometric mean aggregation prevent fatal capability blindspots compared to linear weighted scoring?
   - *Harness*: Candidate evaluation using the benchmark harness tuple: `(model, effort, harness, tools, benchmark_version)`.
2. **Empirical Bayesian Outcome Learning Loop & Contextual Bandit Routing (`OwnerIdeas/benchmark.md` §§15-24, `OwnerIdeas/executor.md` §30-34)**:
   - *Research Questions*: How many local repository runs ($N$) are required before local outcome evidence outweighs external benchmark priors? Does a contextual bandit policy converge to lower total task cost without exceeding safety error budgets?
3. **Task Delivery Mechanism Trade-offs (`OwnerIdeas/H-PROMPT-DELIVERY-01...`)**:
   - *Research Questions*: What is the empirical error rate, token cost, and auditability drift when agents receive inline CLI task descriptions (Variant A) vs linked canonical task files (Variant B) vs orchestrator script injection (Variant C) vs autonomous model polling (Variant E)?
4. **Colabs Kernel Architecture Risk Council (`OwnerIdeas/RISK_COUNCIL.md`)**:
   - *Research Questions*: Systematic audit of the 18 seed hypotheses across L0-L3 (specifically H-CTX-01 runtime loading tax, H-SEC-02 instruction/data boundaries, H-GRAPH-01 global state-space failure, and H-TCB-01 self-hosting verification). Includes the L0 A/B/C comparative experiment (new kernel vs old kernel vs no kernel).
5. **Runtime Framework Integration & Local-First Backend Abstraction (`OwnerIdeas/Google_AX.md`, PROTO-DEC-0066 Study A)**:
   - *Research Questions*: Can Google AX or similar runtime frameworks provide workspace sandboxing, event-driven DAG scheduling, and distributed telemetry without compromising Colabs' fundamental principle of protocol independence and local-first repository authority?
6. **Rust Core Work Elimination & Persistent Daemon (`OwnerIdeas/Rust.md`, PROTO-DEC-0066 Study A)**:
   - *Research Questions*: Does a persistent daemon (`colabsd`) and incremental file snapshot engine provide sufficient latency reduction over the Node.js validator to justify introducing a compiled systems programming language into the protocol TCB?
7. **Write Broker Concurrency & Optimistic Serialization (`OwnerIdeas/scripts.md` Track B)**:
   - *Research Questions*: Can an optimistic write queue successfully resolve merge conflicts among 3-5 concurrent worker agents in a shared project repository without introducing silent semantic regressions?

---

## 7. Superseded / stale material

FACT: The following representations in `OwnerIdeas` directly contradict current accepted decisions or represent obsolete architectural baselines. Retaining them as active guidance creates severe risks of agent confusion:

1. **Direct Full-Scale MCP Server Adoption (`OwnerIdeas/MCP_Server.md`)**:
   - *Stale Conception*: Building a monolithic in-process MCP server exposing Colabs state and protocol controls as primary agent interfaces.
   - *Superseded By*: Decision block PROTO-DEC-0036 (accepted MCP council ruling: "native-only now; Serena first candidate with preregistered thresholds; no MCP server integration"). Re-affirmed under PROTO-DEC-0039 and PROTO-DEC-0048.
   - *Disposition*: Stale as active architecture; retained strictly as an advisory idea pool for Study A under PROTO-DEC-0066.
2. **Validator Migration Council Charter (`OwnerIdeas/MIGRATION.md`)**:
   - *Stale Conception*: The charter, voting rules, and proposal rounds for the Validator Migration Council.
   - *Superseded By*: Decision block PROTO-DEC-0077 and `docs/research/2026-09-25-validator-migration-council/final-plan-2.md`.
   - *Disposition*: Fully superseded historical document. The council has concluded; the canonical specification is `final-plan-2.md`.
3. **Monolithic Scalar Model IQ Hierarchy (`OwnerIdeas/benchmark.md` §1, older notes)**:
   - *Stale Conception*: Linear ranking of models by general brand intelligence (e.g. `Opus > Sol > Gemini > DeepSeek`).
   - *Superseded By*: Decision blocks PROTO-DEC-0056, PROTO-DEC-0074, and PROTO-DEC-0075 item 8.
   - *Disposition*: Obsolete. Model selection is governed by capability floors (uncertainty x consequence), technical compatibility, and role specialization.
4. **Volume-Based Task Complexity Scoring (`OwnerIdeas/task_profife.md` §8 commentary on old `P-L2-002`)**:
   - *Stale Conception*: Increasing model intelligence tiers based on the number of files or lines touched (`Size -> T7/T8`).
   - *Superseded By*: Decision blocks PROTO-DEC-0074 item 4 and PROTO-DEC-0075 item 8 ("Volume does not increase model intelligence; large mechanical edits belong to worker models with clear specifications").
   - *Disposition*: Superseded by uncertainty/consequence rubric.
5. **Immediate Rust Daemon Implementation (`OwnerIdeas/Rust.md`)**:
   - *Stale Conception*: Prioritizing an immediate Rust rewrite (`colabsd`) to fix validator and runtime latency.
   - *Superseded By*: Decision blocks PROTO-DEC-0039 item 3, PROTO-DEC-0048, and PROTO-DEC-0077 (authorizing the Node.js validator migration inside CORE-ARCH as Phase 1; Rust is deferred to Phase 3 / Tier C-D).
   - *Disposition*: Deferred / Superseded as immediate work.
6. **Autonomous Model-Run Supervisor Sessions (`OwnerIdeas/H-PROMPT-DELIVERY-01...` Variant E)**:
   - *Stale Conception*: Employing an LLM agent session (e.g. Kilo Code operator) to continuously poll, monitor, and supervise background task chains.
   - *Superseded By*: Decision blocks PROTO-DEC-0076 item 3 and PROTO-DEC-0078 item 1 ("Supervision is a script, never a model. The script accumulates statuses and recovers only mechanically by PROTO-DEC-0075 rules").
   - *Disposition*: Rejected architectural variant.

---

## 8. Delete candidates

FACT: In strict accordance with the owner dispatch (§5, §14), no files are physically deleted during Round 1. Furthermore, historical provenance must be preserved.

However, the following internal sections within `OwnerIdeas/` files represent pure duplication or discarded artifacts that have zero standalone evidentiary value and should be purged if files are cleaned:

1. **Redundant Duplicate Research Brief in `OwnerIdeas/benchmark.md`**:
   - Lines 1400–2201 contain verbatim repetitions of research brief sections that duplicate the text in `OwnerIdeas/performers.md` and `OwnerIdeas/executor.md`.
2. **Identical Research Program Headers in `OwnerIdeas/scripts.md`**:
   - Lines 1–54 and lines 55–108 duplicate the research track outlines.
3. **Outdated Council Candidate Rosters**:
   - Old model rosters in `benchmark.md` and `MIGRATION.md` naming deprecated API routes or decommissioned models.

---

## 9. Archive candidates

FACT: The following complete files in `OwnerIdeas/` have concluded their operational lifecycle, have been superseded by canonical repository assets, or serve strictly as historical records. They must not remain in the active `OwnerIdeas/` directory where they can be mistaken for active requirements:

1. **`OwnerIdeas/MIGRATION.md`**:
   - *Reason*: The Validator Migration Council has completed all rounds; its final plan (`final-plan-2.md`) is approved by PROTO-DEC-0077. Retaining `MIGRATION.md` in active ideas creates a duplicate, competing source of truth for validator specifications.
   - *Target*: `docs/archive/ownerideas/MIGRATION.md`.
2. **`OwnerIdeas/SYNTHESIS-2026-09-25-cross-document.md`**:
   - *Reason*: This was an intermediate analytical snapshot reviewing only 7 of the 13 files as of commit `2968778`. It is fully superseded by the comprehensive 13-file Round 1 reviews and subsequent Stage 2 syntheses.
   - *Target*: `docs/archive/ownerideas/SYNTHESIS-2026-09-25-cross-document.md`.
3. **`OwnerIdeas/MCP_Server.md`**:
   - *Reason*: In-process MCP server implementation was formally rejected by the MCP council (PROTO-DEC-0036). The valuable architectural patterns (ports & adapters, shadow mode, caching) have been extracted into PROTO-DEC-0066 Study A and the Node validator migration. Keeping this 3,452-line file active creates confusion regarding repository feature freeze.
   - *Target*: `docs/archive/ownerideas/MCP_Server.md`.

---

## 10. Contradictions between OwnerIdeas and current kernel

FACT: The following direct architectural contradictions exist between proposals in `OwnerIdeas/` and the binding invariants of the active Colabs kernel:

| # | Topic | OwnerIdeas Position | Current Kernel Binding Position | Conflict Nature & Canonical Source |
|---|---|---|---|---|
| 1 | **External Framework Dependency** | `Google_AX.md` and `MCP_Server.md` propose tightly integrating Colabs workflow execution with Google AX runtimes, workspaces, and MCP gateway processes. | Colabs protocol invariants must be 100% self-contained and enforceable via native repository scripts and standard git mechanisms. External frameworks are strictly advisory. | Direct conflict with PROTO-DEC-0036 (Native-only), PROTO-DEC-0045, and PROTO-DEC-0048 (Feature freeze until protocol stability). |
| 2 | **Concurrency Coordination Model** | `scripts.md` Track B rejects global long locks ("do not confuse single writer with global long lock") and specifies an optimistic Write Broker with request queues. | Colabs currently enforces write coordination exclusively via a coarse, cooperative file lock (`protocol-lock.cjs`) covering shared documents (`TASK.md`, `PLAN.md`, `DECISIONS.md`). | Direct operational contradiction. The active kernel relies on the very pattern `scripts.md` identifies as a concurrency bottleneck. |
| 3 | **Task Diagnosis vs Model Selection** | `task_profife.md` mandates that Task Characterization must be strictly independent: it must diagnose task dimensions without knowing model identities, prices, or availability. | `P-L2-002-model-selection.md` conflates evaluation and selection into a single monolithic scoring rubric that immediately maps task features to a T1-T9 tier and model. | Direct architectural contradiction between desired clean separation (`task_profife.md`) and legacy kernel procedure (`P-L2-002`). |
| 4 | **Execution Supervision Model** | `H-PROMPT-DELIVERY-01...` Variant E explores autonomous agent sessions (e.g. Kilo Code operator) acting as orchestrator and supervisor. | Supervision must be strictly mechanical and executed by deterministic scripts, never by an LLM agent. | Direct conflict with PROTO-DEC-0076 item 3 and PROTO-DEC-0078 item 1. |
| 5 | **Complexity vs Volume Relationship** | `executor.md` and `task_profife.md` notes discuss size/lines as complexity factors. | Volume is explicitly decoupled from intelligence; volume alone cannot justify escalating model capability floors. | Resolved by PROTO-DEC-0074 item 4 and PROTO-DEC-0075 item 8. |

---

## 11. Highest-value omissions

INFERENCE: The following five mechanisms from `OwnerIdeas` represent the highest-value omissions from the current Colabs kernel. Implementing or formalizing these five items will yield the greatest immediate improvement in kernel reliability, speed, and multi-agent scalability:

### 1. Standalone Task Characterization / Profile Layer (`OwnerIdeas/task_profife.md`)
- **Layer**: L2 (Task Lifecycle & Characterization).
- **Why Critical**: The current kernel lacks an objective diagnostic language for tasks. `P-L2-002` conflates task assessment with model choice, leading to either over-spending senior models on large mechanical edits or under-powering cognitively demanding micro-edits. Building an explicit `TASK PROFILE` schema (evaluating reasoning depth, consequence, verifiability, and specification quality independently of model brands) is the single necessary precursor to a functioning model resolver.

### 2. Machine-Enforced Capability Envelopes & Bounded Authorization (`OwnerIdeas/H-AUTH-02.md`)
- **Layer**: L0 / L1 (Governance & Authority).
- **Why Critical**: Current security and execution boundaries depend entirely on prompt compliance and manual post-facto git diff reviews. A machine-enforced capability envelope (declaring exact permitted read/write paths, command classes, network flags, and deterministic `EXECUTE` vs `STOP` criteria) closes the critical vulnerability where agents operate with ambient CLI authority.

### 3. Write Broker & Optimistic Concurrency Architecture (`OwnerIdeas/scripts.md` Track B)
- **Layer**: L3 (Write Coordination & Tooling).
- **Why Critical**: The current cooperative lock (`protocol-lock.cjs`) serializes all agent work touching shared protocol metadata. As multi-agent sessions scale (e.g. paired cycles, councils, parallel implementation packages), global lock contention causes idle waiting and aborted handoffs. A write broker with atomic file-level write requests and conflict detection unlocks true multi-agent parallelism.

### 4. Deterministic Kernel Dispatcher & Script Supervisor (`workflowAI.md`, PROTO-DEC-0050 item 4, BACKLOG C-3)
- **Layer**: L3 (Execution & Supervision).
- **Why Critical**: Multi-step council and implementation workflows currently require continuous human oversight or fragile ad-hoc runner scripts (`run-chain.cjs`). Implementing the kernel dispatch script with mechanical error-class recovery (transient retry, resume-first, substitute failover) automates long-running tasks without risking uncontrolled model loops.

### 5. Context Bounding & Packet Completeness Harness (`OwnerIdeas/RISK_COUNCIL.md` §§4, 38; H-CTX-01..05)
- **Layer**: L0 / L2 (Context Architecture).
- **Why Critical**: Active context bloat is the primary driver of agent latency, token expense, and instruction-skipping errors. Building the packet-completeness test harness and executing the L0 A/B/C experiment will quantify the exact minimum context required for deterministic agent compliance.

---

## 12. Uncertain classifications

OPEN QUESTION: The following classifications contain residual uncertainty requiring empirical measurement or owner clarification:

1. **`OwnerIdeas/H-PROMPT-DELIVERY-01...` (Delivery Mechanism Efficiency)**:
   - *Uncertainty*: Whether passing task file links (Variant B) creates a measurable risk of models skipping instructions compared to direct CLI prompt injection (Variant A/D). Initial evidence showed one agy session skipped session start under Variant B, but Variant D risks Windows command-line quoting limits and token inflation.
   - *Status*: Classified as `RESEARCH_CANDIDATE` pending the comparative test proposed in §4 of that file.
2. **`OwnerIdeas/Google_AX.md` (Runtime Utility vs TCB Expansion)**:
   - *Uncertainty*: Whether the workspace isolation and event-driven state machine benefits of AX can be adopted via thin CLI wrappers without violating the local-first, zero-external-dependency rule of the Colabs protocol.
   - *Status*: Classified as `RESEARCH_CANDIDATE` (under PROTO-DEC-0066 Study A).
3. **`OwnerIdeas/Rust.md` (Phase 3 Performance Threshold)**:
   - *Uncertainty*: Whether the Node.js validator (`final-plan-2.md`) will achieve the required <500ms execution target across 500+ files on Windows. If Node.js meets the target, a Rust rewrite has negative ROI; if Node.js falls short, Rust validation becomes an active requirement.
   - *Status*: Classified as `RESEARCH_CANDIDATE` (deferred until Node validator baseline is measured).

---

## 13. Recommended next actions

INFERENCE: Based on the Round 1 findings, the following sequence of actions is recommended for the subsequent stages of the OwnerIdeas revision program:

1. **Stage 2 (Syntheses)**:
   - Provide this report alongside the independent reports of Claude, DeepSeek, and Mistral to synthesizers Kimi K2.7 and MiMo-V2.6-Pro.
   - Synthesizers must cross-reference findings against the 4/4, 3/4, 2/4 consensus rubric without erasing strong minority technical evidence.
2. **Stage 3 (Resolution, Archival & Planning)**:
   - *Claude Resolution*: Confirm the final disposition of materials.
   - *Gemini Clean / Archive*: Relocate `OwnerIdeas/MIGRATION.md`, `OwnerIdeas/SYNTHESIS-2026-09-25-cross-document.md`, and `OwnerIdeas/MCP_Server.md` to `docs/archive/ownerideas/`. Verify no broken links in the active repository.
   - *DeepSeek Plan*: Structure the 5 implementation packages around the top missing mechanisms:
     - Package 1: Standalone `TASK PROFILE` Schema & Diagnostic Procedure (L2);
     - Package 2: Bounded Capability Envelope Specification & State Engine (L0/L1);
     - Package 3: Deterministic Kernel Dispatch Script with PROTO-DEC-0075 Recovery (L3);
     - Package 4: Model Qualification Telemetry Schema & Competence Matrix (L2/L4);
     - Package 5: Write Broker & Queue Architecture Specification (L3).
3. **Sequencing with Ongoing Kernel Tasks**:
   - Maintain the freeze on external product work (`D:\Block-Puzzle`, `D:\VPN`) per PROTO-DEC-0048.
   - Complete the L-CORRECTION-4 certification and launch the Node Validator Migration Phase 1 (`final-plan-2.md`, PROTO-DEC-0077) before attempting to implement the Write Broker.

---

## 14. Required summary table

FACT / INFERENCE: Comprehensive classification of all substantial ideas from the 13 `OwnerIdeas` files:

| Source | Idea | Related layer | Current implementation | Canonical source | Status | Action | Confidence |
|---|---|---|---|---|---|---|---|
| `OwnerIdeas/MIGRATION.md` | Colabs Validator Migration Council charter and differential verification design | L0 / Tooling | Migration council complete; final plan approved | PROTO-DEC-0077, `docs/research/2026-09-25-validator-migration-council/final-plan-2.md` | `IMPLEMENTED` / `SUPERSEDED` | COMPLETE (Archive) | high |
| `OwnerIdeas/MIGRATION.md` | Node.js validator callable API and differential test harness | L0 / Tooling | Designed in `final-plan-2.md`; implementation pending launch | PROTO-DEC-0077 | `PARTIALLY_IMPLEMENTED` | KEEP (Implement) | high |
| `OwnerIdeas/performers.md` | Decoupling model names from protocol constants | L2 / L4 | Model names restricted to dynamic operational data | PROTO-DEC-0073, PROTO-DEC-0074 item 2, `docs/ops/MODEL-ECONOMICS.md` | `IMPLEMENTED` | COMPLETE | high |
| `OwnerIdeas/performers.md` | 13-group `MODEL PROFILE` comprehensive schema | L2 / L4 | Basic fields in `MODEL-MATRIX.md`; tech debt TD-MODEL-QUALIFICATION | `workflowAI.md:142-157` | `PARTIALLY_IMPLEMENTED` | KEEP (Spec/Implement) | high |
| `OwnerIdeas/performers.md` | Working pool qualification separate from discovered available models | L2 / L4 | Owner working ladder in `MODEL-ECONOMICS.md` serves as bootstrap | PROTO-DEC-0076 item 2, `workflowAI.md:21-44` | `PARTIALLY_IMPLEMENTED` | KEEP (Implement) | high |
| `OwnerIdeas/task_profife.md` | Standalone `TASK CHARACTERIZATION / TASK PROFILE` layer (7 diagnostic dimensions) | L2 | Conflated rubric in `P-L2-002`; uncertainty x consequence principles in 0075 | PROTO-DEC-0074 item 4, PROTO-DEC-0075 item 8 | `ACTIVE` | KEEP (Design & Implement) | high |
| `OwnerIdeas/task_profife.md` | Decoupling task diagnosis from model pricing and availability | L2 | Not enforced; `P-L2-002` mixes diagnosis with model assignment | None (Gap in L2) | `ACTIVE` | KEEP (Implement) | high |
| `OwnerIdeas/task_profife.md` | Static context volume estimator for task inputs | L2 / L3 | None; byte checks in validator only | None (Gap in L2) | `ACTIVE` | RESEARCH | medium (Needs formula validation) |
| `OwnerIdeas/benchmark.md` | Abandoning scalar IQ rankings for multidimensional capability vectors | L2 / L4 | Decided in principle; operationalized via capability floors | PROTO-DEC-0074, PROTO-DEC-0075 item 8 | `PARTIALLY_IMPLEMENTED` | COMPLETE (Policy) | high |
| `OwnerIdeas/benchmark.md` | Authoritative external benchmark portfolio (SWE-Bench Pro, RepoProbe, AACR-Bench) | L2 / L4 | None; provider positioning and owner heuristics used | None (Tech debt TD-MODEL-QUALIFICATION) | `RESEARCH_CANDIDATE` | RESEARCH | high |
| `OwnerIdeas/benchmark.md` | Geometric mean benchmark fit formula with authority/freshness weighting | L2 / L4 | None | None | `RESEARCH_CANDIDATE` | RESEARCH | high |
| `OwnerIdeas/benchmark.md` | Empirical Bayesian outcome updating from local repository execution runs | L2 / L4 | Telemetry partially gathered in `USAGE.md`; no updating algorithm | None | `RESEARCH_CANDIDATE` | RESEARCH | high |
| `OwnerIdeas/executor.md` | Minimum-Sufficient Executor Principle | L2 | Partially embodied in `workflowAI.md` lowest admissible rung rule | PROTO-DEC-0075 item 9, `workflowAI.md:54` | `PARTIALLY_IMPLEMENTED` | KEEP (Implement formula) | high |
| `OwnerIdeas/executor.md` | Expected Total Cost optimization formula ($E[\text{Cost}]$) | L2 | None; manual owner economic ordering | None | `RESEARCH_CANDIDATE` | RESEARCH | high |
| `OwnerIdeas/executor.md` | Cheap-first bottom-up exploration under strong verification | L2 | Escalation chains exist; systematic cheap-first policy not formalized | PROTO-DEC-0074 item 4 | `ACTIVE` | KEEP (Procedure) | high |
| `OwnerIdeas/executor.md` | Execution chain/pipeline routing (cheap drafter + senior certifier) | L1 / L2 | Multi-step paired cycle and stage workflows in practice | PROTO-DEC-0040, PROTO-DEC-0074 item 4 | `IMPLEMENTED` | COMPLETE | high |
| `OwnerIdeas/H-AUTH-02.md` | Bounded execution capability envelope per task session | L0 / L1 | Disposable clones (0070); client profiles (0050); no envelope | None (Major L0/L1 gap) | `ACTIVE` | KEEP (Design & Implement) | high |
| `OwnerIdeas/H-AUTH-02.md` | Deterministic `EXECUTE` / `DELEGATED` / `OWNER` / `STOP` transition engine | L0 | Stop/ask procedure `P-L0-002` (trial); prompt-level only | `docs/core-arch/stage-1/P-L0-002-stop-and-ask.md` | `PARTIALLY_IMPLEMENTED` | KEEP (Implement) | high |
| `OwnerIdeas/H-PROMPT-DELIVERY-01...` | Evaluation of task delivery mechanisms (CLI inline vs link vs script vs operator) | L3 | Variant B (link) and C (script link) used; unmeasured trade-offs | PROTO-DEC-0076 item 4 (Frozen) | `RESEARCH_CANDIDATE` | RESEARCH | high |
| `OwnerIdeas/scripts.md` | Track A: Script performance audit and work elimination | L3 | Node validator port approved (0077); PowerShell remains slow | PROTO-DEC-0077 | `PARTIALLY_IMPLEMENTED` | KEEP (Implement 0077) | high |
| `OwnerIdeas/scripts.md` | Track B: Write Broker & Queue Architecture (optimistic concurrency) | L3 | Cooperative global file lock (`protocol-lock.cjs`) only | None (Major L3 concurrency gap) | `ACTIVE` | KEEP (Design & Implement) | high |
| `OwnerIdeas/scripts.md` | Track C: Procedure-to-Script systematic conversion pipeline | L3 | Ad-hoc conversions; dispatch script in backlog | PROTO-DEC-0050 item 4 | `ACTIVE` | KEEP (Procedure) | high |
| `OwnerIdeas/RISK_COUNCIL.md` | Kernel Architecture Risk Council charter (18 seed hypotheses) | L0-L3 | Awaiting scheduling; some risks addressed individually | `.ai/TASK.md:68` | `ACTIVE` / `RESEARCH_CANDIDATE` | RESEARCH (Execute Council) | high |
| `OwnerIdeas/RISK_COUNCIL.md` | Single active writer / process identity binding (`PID + start_time`) | L1 / L3 | Cooperative session-id string in `protocol-lock.cjs` | PROTO-DEC-0075 item 1 | `PARTIALLY_IMPLEMENTED` | KEEP (Implement) | high |
| `OwnerIdeas/RISK_COUNCIL.md` | Instruction vs data trust boundary (H-SEC-02) | L0 | None; raw text ingested into context | None (Critical L0 security gap) | `ACTIVE` | KEEP (Design/Implement) | high |
| `OwnerIdeas/RISK_COUNCIL.md` | Packet completeness test harness and L0 A/B/C experiment | L0 / L2 | None; proposed in CORE-ARCH-7 | None | `RESEARCH_CANDIDATE` | RESEARCH | high |
| `OwnerIdeas/Google_AX.md` | Google AX runtime integration (workspaces, sandboxing, tracing) | L3 | Framework adoption frozen; seed for Study A | PROTO-DEC-0066, `docs/research/2026-09-25-improvement-research/` | `RESEARCH_CANDIDATE` | RESEARCH (Study A) | high |
| `OwnerIdeas/Google_AX.md` | Event-driven DAG execution scheduler & retry state machine | L3 | Transitional `run-chain.cjs`; dispatch script in backlog | PROTO-DEC-0075, PROTO-DEC-0076 | `PARTIALLY_IMPLEMENTED` | KEEP (Implement in C-3) | high |
| `OwnerIdeas/Rust.md` | Rust native performance core (`colabsd`, memory-mapped state) | L3 | Deferred; Node validator first step (0077); seed for Study A | PROTO-DEC-0066, PROTO-DEC-0077 | `RESEARCH_CANDIDATE` | RESEARCH (Study A) | high |
| `OwnerIdeas/MCP_Server.md` | Direct in-process Colabs MCP Server implementation | L3 | Rejected by MCP council ruling (native-only now) | PROTO-DEC-0036 | `SUPERSEDED` | COMPLETE (Archive) | high |
| `OwnerIdeas/MCP_Server.md` | Ports and adapters architecture (shared CLI + facade core) | L0 / L3 | Core protocol logic separated from CLI wrappers | `docs/core-arch/stage-1/SPEC-protocol-core.md` | `IMPLEMENTED` | COMPLETE | high |
| `OwnerIdeas/SYNTHESIS-2026-09-25-cross-document.md` | Cross-document synthesis of 7 earlier files (K1-K10) | Meta | Intermediate analysis superseded by 13-file Round 1 review | None | `ARCHIVE_CANDIDATE` | COMPLETE (Archive) | high |
