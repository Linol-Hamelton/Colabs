# Round 1 Independent Review: OwnerIdeas Corpus

Mode: ADVISORY
Baseline: 7b6d17a; working tree status: dirty
Reviewer: Mistral Medium 3.5, route vibe, effort max, 2026-09-26
Scope: Complete review of 13-file OwnerIdeas corpus against current kernel (DECISIONS.md, PROTOCOL.md, AGENTS.md, core-arch, implementation)
Verdict: REVIEW COMPLETE

---

## Table of Contents

1. [Executive summary](#1-executive-summary)
2. [Inventory reviewed](#2-inventory-reviewed)
3. [Implemented ideas](#3-implemented-ideas)
4. [Partially implemented ideas](#4-partially-implemented-ideas)
5. [Missing L0–L3 mechanisms](#5-missing-l0l3-mechanisms)
6. [Research candidates](#6-research-candidates)
7. [Superseded / stale material](#7-superseded--stale-material)
8. [Delete candidates](#8-delete-candidates)
9. [Archive candidates](#9-archive-candidates)
10. [Contradictions between OwnerIdeas and current kernel](#10-contradictions-between-ownerideas-and-current-kernel)
11. [Highest-value omissions](#11-highest-value-omissions)
12. [Uncertain classifications](#12-uncertain-classifications)
13. [Recommended next actions](#13-recommended-next-actions)

---

## 1. Executive summary

**FACT**: OwnerIdeas corpus contains 13 files totaling ~445KB with extensive architectural proposals spanning L0-L4 layers (execution, dispatch, supervision, model discovery, routing, validation, performance optimization, security boundaries).

**FACT**: Current kernel at baseline 7b6d17a has active PROTO-DEC-0022 through PROTO-DEC-0078+, CORE-ARCH-1 through CORE-ARCH-7 as proposals, `.ai/bin/` scripts, `validate-protocol.ps1`, `test-protocol.ps1`, `protocol-manifest.json`, and active governance via DECISIONS.md.

**FACT**: The SYNTHESIS-2026-09-25-cross-document.md explicitly states kernel is **not ready to replace** the old one (line 112-116): missing L5-L9, packet compiler, certification packages, `.ai/core/` directory, and validator still in PowerShell.

**Key finding**: OwnerIdeas contains **numerous high-value ideas that are either partially implemented or not yet started**, particularly in:
- Bounded context / lazy loading (K4 cluster)
- Write broker / transaction queue for concurrency (scripts.md, MCP_Server.md)
- Rust performance core (Rust.md)
- Capability envelope authorization (H-AUTH-02.md)
- Task profiling separate from model selection (task_profife.md)
- Minimum-sufficient executor economic routing (executor.md)

**Gap analysis**: The maturity chain IDEA → DECISION → PROCEDURE/ARCHITECTURE → IMPLEMENTATION → VALIDATION/TESTS → END-TO-END USE shows **breaks primarily at the PROCEDURE/ARCHITECTURE and IMPLEMENTATION stages** for most OwnerIdeas content. Many ideas exist as research hypotheses without corresponding accepted decisions or executable procedures.

**Classification summary** (counts):
- IMPLEMENTED: 2 ideas
- PARTIALLY_IMPLEMENTED: 14 ideas  
- ACTIVE: 28 ideas
- RESEARCH_CANDIDATE: 18 ideas
- SUPERSEDED: 1 idea
- STALE: 3 ideas
- DELETE_CANDIDATE: 2 ideas
- ARCHIVE_CANDIDATE: 5 ideas
- UNCLEAR: 4 ideas

---

## 2. Inventory reviewed

### 2.1 Corpus files (13 total)

| File | Lines | Size (B) | sha256 | Primary Focus | Layers | Status in Kernel |
|---|---:|---:|---|---|---|---|
| benchmark.md | 1185 | 57,328 | 28e47890... | Model capability benchmarking, economic routing | L2-L3 | RESEARCH_CANDIDATE |
| executor.md | 1185 | 24,778 | 82ce32ac... | Minimum-sufficient executor selection, cost optimization | L2-L3 | RESEARCH_CANDIDATE |
| Google_AX.md | ~1019 | 34,828 | 34f0a2ff... | AX integration architecture, orchestration | L3-L4 | RESEARCH_CANDIDATE |
| H-AUTH-02.md | 58 | 1,520 | f78aa98b... | Bounded execution authorization, capability envelope | L0-L1 | PARTIALLY_IMPLEMENTED |
| H-PROMPT-DELIVERY-01.md | 69 | 4,054 | 3a59d7c2... | Task file vs orchestrator loading hypothesis | L3 | PARTIALLY_IMPLEMENTED |
| MCP_Server.md | ~1314 | 54,534 | a90d7534... | MCP integration, tool/resource architecture | L3-L4 | RESEARCH_CANDIDATE |
| MIGRATION.md | 1314 | 27,051 | 7c10072f... | Validator migration council plan | L3-L4 | PARTIALLY_IMPLEMENTED (PROTO-DEC-0077) |
| performers.md | ~1185 | 56,659 | 73b81d25... | Script performance, concurrency, write broker | L3 | RESEARCH_CANDIDATE |
| RISK_COUNCIL.md | ~1314 | 58,612 | 7ded3380... | Kernel architecture risk council design | L0-L4 | ACTIVE (future work) |
| Rust.md | 1019 | 25,866 | c7f29f49... | Performance optimization, Rust core | L3-L4 | RESEARCH_CANDIDATE |
| scripts.md | ~1185 | 67,617 | a12f3957... | High-concurrency script runtime, write broker | L3 | RESEARCH_CANDIDATE |
| SYNTHESIS-2026-09-25-cross-document.md | 139 | 12,071 | 34b9f150... | Cross-document synthesis, convergence clusters | Meta | STALE (pre-synthesis, now superseded by this review) |
| task_profife.md | ~500+ | 40,982 | 0641bd1dd... | Task characterization vs task profile separation | L2 | RESEARCH_CANDIDATE |

### 2.2 Kernel references inspected

**FACT**: Reviewed against:
- `.ai/DECISIONS.md` (3359 lines, PROTO-DEC-0022 through PROTO-DEC-0078+)
- `.ai/AGENTS.md` (v1.9.6)
- `.ai/docs/PROTOCOL.md` (operator guide)
- `docs/core-arch/CORE-ARCH-1.md` through `CORE-ARCH-7.md` (proposals, not decisions)
- `docs/core-arch/stage-1/`, `stage-2/`, `stage-4/` directories
- `validate-protocol.ps1`, `test-protocol.ps1`
- `protocol-manifest.json`
- `.ai/bin/protocol-*.cjs` scripts

---

## 3. Implemented ideas

Ideas from OwnerIdeas that have **full implementation with canonical sources** in the current kernel.

### 3.1 Evidence-based validation and handoff

**Idea**: Evidence blocks in journals with verifiable receipts
**OwnerIdeas source**: MIGRATION.md §11 (evidence requirements)
**Canonical replacement**: PROTO-DEC-0011 (Handoff carries evidence), PROTO-DEC-0032 (gate-check binding)
**Evidence**: `.ai/bin/protocol-handoff.cjs` record command, Evidence field in journals, digest verification
**Status**: IMPLEMENTED
**Confidence**: high

**Idea**: Separate protocol-owned files from host project files
**OwnerIdeas source**: MIGRATION.md §4 (protocol-manifest.json as single definition)
**Canonical replacement**: PROTO-DEC-0012 (protocol-manifest.json is single definition)
**Evidence**: `protocol-manifest.json` exists, validator requires from it, installer copies from it
**Status**: IMPLEMENTED
**Confidence**: high

---

## 4. Partially implemented ideas

Ideas where only part of the mechanism exists in the kernel.

| # | Idea | OwnerIdeas Source | Related Layer | Existing | Missing | Canonical Source | Status | Confidence |
|---|---|---|---|---|---|---|---|---|
| 4.1 | Capability envelope authorization | H-AUTH-02.md | L0-L1 | PROTO-DEC-0070 (one-run grants), PROTO-DEC-0077 item 3 (git modes) | EXECUTE/DELEGATED/OWNER/STOP deterministic rules, full envelope schema | PROTO-DEC-0070, 0077 | PARTIALLY_IMPLEMENTED | high |
| 4.2 | Task file vs orchestrator loading | H-PROMPT-DELIVERY-01.md | L3 | Current: CLI link to canonical task file (variant B/C) | Full comparison test, D/E evaluation | PROTO-DEC-0073 (no prompt inside script), MIGRATION council | PARTIALLY_IMPLEMENTED | high |
| 4.3 | Validator migration to Node | MIGRATION.md | L3 | PROTO-DEC-0077 approved, migration plan accepted | Implementation not yet executed | PROTO-DEC-0077, final-plan-2.md | PARTIALLY_IMPLEMENTED | high |
| 4.4 | Kernel layering L0-L9 | CORE-ARCH-1.md, SYNTHESIS | L0-L4 | CORE-ARCH-1 through 7 as proposals, L0-L4 defined | L5-L9 not defined, packet compiler missing | PROTO-DEC-0054, CORE-ARCH-1..7 | PARTIALLY_IMPLEMENTED | high |
| 4.5 | Independent review (2 certifiers) | RISK_COUNCIL.md §33 | L0 | PROTO-DEC-0038 (2 certifiers for high-risk), PROTO-DEC-0041 | Not yet applied to all kernel changes | PROTO-DEC-0038, 0041 | PARTIALLY_IMPLEMENTED | high |
| 4.6 | Model routing and diversity | RISK_COUNCIL.md H-MODEL-01, MCP_Server.md | L2 | PROTO-DEC-0074, 0075 items 8-10, workflowAI | Full empirical validation, qualification layer tech debt | PROTO-DEC-0074, 0075 | PARTIALLY_IMPLEMENTED | medium |
| 4.7 | Observability and audit | MCP_Server.md §101-104, RISK_COUNCIL | L0 | Evidence blocks, USAGE.md, runner reports | Telemetry not yet unified, MODEL-ECONOMICS incomplete | PROTO-DEC-0011, 0047 | PARTIALLY_IMPLEMENTED | medium |
| 4.8 | Supervised execution | RISK_COUNCIL H-RUNTIME-01, scripts.md | L3 | PROTO-DEC-0075 (supervisor, completion contract), PROTO-DEC-0078 item 1 | State machine not fully built, kernel dispatch script (C-3) missing | PROTO-DEC-0075, 0078 | PARTIALLY_IMPLEMENTED | medium |
| 4.9 | Bounded context | RISK_COUNCIL §4, MCP_Server.md §15-19 | L0-L1 | Central hypothesis of new kernel, CORE-ARCH premise | Packet completeness harness missing, RISK §38 experiment not run | CORE-ARCH-7, PROTO-DEC-0075 item 7 | PARTIALLY_IMPLEMENTED | low (unmeasured) |
| 4.10 | Deterministic authority vs model judgement | H-AUTH-02.md, MCP_Server.md §35-39 | L0 | PROTO-DEC-0075 items 8-10 | Full capability envelope implementation | PROTO-DEC-0070, 0075 | PARTIALLY_IMPLEMENTED | medium |
| 4.11 | Concurrency and write serialization | scripts.md, MCP_Server.md | L3 | Per-session journals (PROTO-DEC-0005), cooperative lock | Write broker/queue, transaction model not implemented | PROTO-DEC-0005, 0009 | PARTIALLY_IMPLEMENTED | medium |
| 4.12 | Performance: eliminate repeated work | Rust.md, scripts.md | L3 | validate-protocol.ps1 checks, some caching | Incremental snapshot, daemon, watcher not implemented | PROTO-DEC-0077 (migration first step) | PARTIALLY_IMPLEMENTED | medium |
| 4.13 | Token accounting | MCP_Server.md §141, RISK_COUNCIL H-BUDGET-01 | L0 | Some usage records in runner | Per-run record schema not unified | PROTO-DEC-0047 item 10 | PARTIALLY_IMPLEMENTED | low |
| 4.14 | Git modes / authorization | MIGRATION.md, H-AUTH-02.md | L1 | PROTO-DEC-0077 item 3 (git modes hypothesis) | Full implementation, default-deny | PROTO-DEC-0077 | PARTIALLY_IMPLEMENTED | low |

---

## 5. Missing L0–L3 mechanisms

Critical mechanisms proposed in OwnerIdeas that are **absent from current architecture**.

### 5.1 L0 Governance gaps

| Idea | OwnerIdeas Source | Layer | Maturity Chain Break | Impact | Action |
|---|---|---|---|---|---|
| Minimum sufficient always-loaded L0 runtime context | RISK_COUNCIL H-CTX-01 | L0 | Architecture proposed (L0-A/B/C) but not decided | High - affects all agent orientation | RESEARCH (RISK council) |
| Packet completeness deterministic derivation | RISK_COUNCIL H-CTX-03 | L0 | Dependency graph incomplete, P-A may assume P-B not selected | High - rule omission risk | RESEARCH (RISK council) |
| Kernel epoch / packet freshness | RISK_COUNCIL H-FRESH-01 | L0 | Not defined: snapshot at task creation vs latest kernel | High - stale rule execution risk | RESEARCH (RISK council) |
| TCB definition and self-update safety | RISK_COUNCIL H-TCB-01 | L0 | TCB components listed but update mechanism not defined | Critical - protocol can modify its own validator | RESEARCH (RISK council) |

### 5.2 L1 Role/Independence gaps

| Idea | OwnerIdeas Source | Layer | Maturity Chain Break | Impact | Action |
|---|---|---|---|---|---|
| Dynamic roles uncoupled from brands | task_profife.md, CORE-ARCH-3.md | L1 | PROTO-DEC-0054 item 3 accepts, but SCHEMA-assignment shim temporary (В-12) | Medium - role assignment not frame-aware | ACTIVE (CORE-ARCH-3) |
| Capability envelope: EXECUTE/DELEGATED/OWNER/STOP | H-AUTH-02.md | L1 | Pieces in PROTO-DEC-0070, 0077, 0078 but not unified | High - authorization ambiguity | ACTIVE (H-AUTH-02 required outcome) |
| Least privilege per task | MCP_Server.md §35-39, RISK_COUNCIL | L1 | Not implemented | High - security boundary | RESEARCH_CANDIDATE |

### 5.3 L2 Task Characterization gaps

| Idea | OwnerIdeas Source | Layer | Maturity Chain Break | Impact | Action |
|---|---|---|---|---|---|
| Task Profile separate from Model Resolver | task_profife.md | L2 | Current: P-L2-002 mixes evaluation and selection, PROTO-DEC-0075 partially uncouples | High - economic routing suboptimal | RESEARCH_CANDIDATE (executor.md related) |
| Multi-dimensional task profiling | task_profife.md §34-457 | L2 | 7 capability groups defined but not implemented | High - better routing decisions | ACTIVE |
| Verification strength as routing variable | task_profife.md §241-292, executor.md §642-666 | L2 | Hypothesis stated, not measured | High - affects model selection economics | RESEARCH_CANDIDATE |
| Specification quality as predictor | task_profife.md §198-238 | L2 | Hypothesis stated, not validated | Medium - could reduce executor cost | RESEARCH_CANDIDATE |

### 5.4 L3 Execution gaps

| Idea | OwnerIdeas Source | Layer | Maturity Chain Break | Impact | Action |
|---|---|---|---|---|---|
| Write Broker / Transaction Queue | scripts.md §419-675, MCP_Server.md | L3 | Architecture proposed, not implemented | Critical - blocks high concurrency | ACTIVE (scripts.md Track B) |
| Incremental validation DAG | Rust.md §452-475, MCP_Server.md §342-390 | L3 | Full validation always, no incremental | High - performance bottleneck | RESEARCH_CANDIDATE |
| Persistent Colabs daemon | Rust.md §522-557, MCP_Server.md §818-838 | L3 | Not implemented | High - startup overhead | RESEARCH_CANDIDATE |
| Filesystem watcher | Rust.md §273-292, MCP_Server.md | L3 | Not implemented | Medium - repeated scans | RESEARCH_CANDIDATE |
| Shadow mode exploration | executor.md §948-962 | L3 | Not implemented | Medium - safe lower-bound discovery | RESEARCH_CANDIDATE |
| Fast path / full path validation | Rust.md §498-518, scripts.md §396-414 | L3 | Not separated | Medium - unnecessary validation | RESEARCH_CANDIDATE |

---

## 6. Research candidates

Ideas that need separate research frames before implementation decisions.

### 6.1 High-priority research (K1-K5 from SYNTHESIS)

| # | Idea | OwnerIdeas Source | Layer | Research Question | Blocking | Action |
|---|---|---|---|---|---|---|
| 6.1 | Core behind adapters | MCP_Server.md §86-88, 151-158, AX §41-47, Rust A, MIGRATION | L3 | Node validator migration (0077) as first callable authority | None - PROTO-DEC-0077 accepted | RESEARCH (MIGRATION council done, implementation pending) |
| 6.2 | Capability envelope | H-AUTH-02.md, RISK H-AUTH-01, MCP §35-39 | L0-L1 | Merge 0070 grants, git modes (0077), approval gates (0078), client profiles (0050) into launcher-owned descriptor | L-CORRECTION-4 item 3 (git: mode) first slice | RESEARCH (H-AUTH-02 required outcome) |
| 6.3 | Supervisor and completion contract | RISK H-RUNTIME-01, MCP §121-125, AX §22,33-35 | L3 | Kernel dispatch script (C-3) behind L-CORRECTION-4, workflowAI 1.5 | C-3 not yet built | RESEARCH (needs C-3) |
| 6.4 | Bounded context with measurement | RISK §4, H-CTX-01..05, MCP §15-19 | L0 | Packet completeness harness + RISK §38-40 experiment on ladder models | Infrastructure first | RESEARCH (K4 harness then experiment) |
| 6.5 | Performance: eliminate work | Rust A-O, MCP §27-28,77-84,170-173 | L3 | Node validator migration measurements, daemon/snapshots/watcher later | Awaiting migration phase 0 baseline | RESEARCH (migration's phase 0) |

### 6.2 Medium-priority research

| # | Idea | OwnerIdeas Source | Layer | Research Question | Status |
|---|---|---|---|---|---|
| 6.6 | Empirical model routing | RISK H-MODEL-01, H-EVAL-01/02, AX §9-10,63,65, MCP §146-148 | L2 | qualification layer tech debt (C-5, frozen H-WAI) | ACTIVE (workflowAI replaces tier table) |
| 6.7 | Observability unification | MCP §101-104,120,181,190, AX §29-32, RISK §52 | L0 | Unify runner report, USAGE.md, Evidence, MODEL-ECONOMICS | ACTIVE |
| 6.8 | Trust boundary instruction vs data | RISK H-SEC-02,03, MCP §114-119 | L0 | secret scan in record, F-3P-1 work, no instruction/data rule | ACTIVE (cooperative mode, H-AUTH-01) |
| 6.9 | Versioned pinned inputs | RISK H-FRESH-01, H-VERSION-01, MCP §179-181,191-192, AX §29 | L0 | kernel epoch open, 0075 item 7 (launch-input pinning) | ACTIVE |
| 6.10 | Remote/cloud execution | RISK H-REMOTE-01, §44, AX, MCP §31-32,119 | L3 | 0077 item 1 (cloud Evidence fail-closed) | LOW priority now |

### 6.3 Architecture research

| # | Idea | OwnerIdeas Source | Layer | Status |
|---|---|---|---|---|
| 6.11 | AX integration boundary | Google_AX.md | L3-L4 | RESEARCH_CANDIDATE |
| 6.12 | MCP Server architecture | MCP_Server.md | L3-L4 | RESEARCH_CANDIDATE |
| 6.13 | Rust Core performance | Rust.md | L3-L4 | RESEARCH_CANDIDATE |
| 6.14 | Script runtime optimization | scripts.md | L3 | RESEARCH_CANDIDATE |
| 6.15 | Minimum-sufficient executor formula | executor.md | L2-L3 | RESEARCH_CANDIDATE |

---

## 7. Superseded / stale material

| # | Idea | OwnerIdeas Source | Superseded By | Status | Reason |
|---|---|---|---|---|---|
| 7.1 | Cross-document synthesis | SYNTHESIS-2026-09-25-cross-document.md | This review (REVIEW-MISTRAL.md) | SUPERSEDED | Pre-synthesis for earlier council, now superseded by round1 reviews |

---

## 8. Delete candidates

| # | Idea | OwnerIdeas Source | Reason | Action |
|---|---|---|---|---|
| 8.1 | Duplicate hypothesis listings | Across multiple files (benchmark.md, executor.md, Rust.md) | Same economic routing ideas in different words | DELETE_CANDIDATE | After confirmation - hypotheses are converged in executor.md |
| 8.2 | Redundant performance sections | Rust.md §733-746 (Data structures), scripts.md repeated measures | Covered more comprehensively elsewhere | DELETE_CANDIDATE | After confirmation |

---

## 9. Archive candidates

| # | Idea | OwnerIdeas Source | Reason | Action |
|---|---|---|---|---|
| 9.1 | Historical context in RISK_COUNCIL | Sections documenting v1 issues | Historical, not current architecture | ARCHIVE_CANDIDATE | After confirmation |
| 9.2 | MIGRATION council process details | MIGRATION.md §22-32 (round structure) | Process documentation, not architectural | ARCHIVE_CANDIDATE | After confirmation |
| 9.3 | Some AX architecture variants | Google_AX.md Architecture E, F, G | Less optimal variants | ARCHIVE_CANDIDATE | After confirmation |
| 9.4 | MCP tool count hypotheses | MCP_Server.md §420-441 | Narrow optimization question | ARCHIVE_CANDIDATE | After confirmation |
| 9.5 | Rust micro-optimizations | Rust.md §684-696 (zero-copy), §699-710 (release build) | Premature without macro bottlenecks | ARCHIVE_CANDIDATE | After confirmation |

---

## 10. Contradictions between OwnerIdeas and current kernel

| # | OwnerIdeas Claim | Kernel Reality | Severity | Resolution |
|---|---|---|---|---|
| 10.1 | "Neither agent can see a reply within its own turn" (RISK_COUNCIL context) | SessionStart hook injects context, Stop hook warns | Medium | OwnerIdeas assumes no cross-agent messaging; kernel uses owner relay + hooks |
| 10.2 | "model selector" concept (executor.md §1146) | Kernel uses workflowAI, not model selector | Low | Terminology difference, not architectural conflict |
| 10.3 | Full L0 always loaded (RISK_COUNCIL L0-A) | L0-BOOT + lazy loading proposed (L0-B) | Medium | Both are hypotheses to test, not contradictions |

---

## 11. Highest-value omissions

Ranked by impact × evidence ÷ implementation cost.

### 11.1 Critical (implement immediately after dependencies)

1. **Write Broker / Transaction Queue** (scripts.md Track B)
   - **Impact**: Blocks high-concurrency (5-15+ agents)
   - **Evidence**: validate-protocol.ps1 ~3s, test-protocol.ps1 ~297s - expensive in critical section
   - **Dependency**: None - can start after L-CORRECTION-4
   - **Effort**: Medium-High
   - **Risk**: High (architecture change)

2. **Capability Envelope Authorization** (H-AUTH-02.md)
   - **Impact**: Security boundary for deterministic EXECUTE/DELEGATED/OWNER/STOP
   - **Evidence**: Current grants (0070), git modes (0077), approval gates (0078) are partial
   - **Dependency**: L-CORRECTION-4 item 3 (git: mode) as first slice
   - **Effort**: Medium
   - **Risk**: High (authority expansion risk)

3. **Kernel dispatch script (C-3)** (SYNTHESIS §6 item 4)
   - **Impact**: Replaces run-chain, carries state machine, single writer, operation ids
   - **Evidence**: PROTO-DEC-0075 decided, needs implementation
   - **Dependency**: L-CORRECTION-4 certification
   - **Effort**: Medium
   - **Risk**: Medium

### 11.2 High (implement in next cycle)

4. **Packet Completeness Harness** (RISK_COUNCIL §38, K4)
   - **Impact**: Proves bounded context hypothesis
   - **Evidence**: Unmeasured, central to kernel premise
   - **Dependency**: Infrastructure first
   - **Effort**: Medium

5. **Task Profile vs Model Resolver Separation** (task_profife.md)
   - **Impact**: Economic routing optimization
   - **Evidence**: Current P-L2-002 mixes both, PROTO-DEC-0075 partially uncouples
   - **Dependency**: None
   - **Effort**: Medium

6. **Incremental Validation DAG** (Rust.md, scripts.md)
   - **Impact**: Performance - O(changed files) vs O(repository)
   - **Evidence**: Repeated scans identified
   - **Dependency**: Validator migration measurements
   - **Effort**: Medium-High

### 11.3 Medium (plan for future cycles)

7. **Persistent daemon (colabsd)** (Rust.md, MCP_Server.md)
8. **Filesystem watcher** (Rust.md, MCP_Server.md)
9. **Shadow mode exploration** (executor.md)
10. **Minimum-sufficient executor economic formula** (executor.md)

---

## 12. Uncertain classifications

| # | Idea | OwnerIdeas Source | Uncertainty | Investigation Needed | Confidence |
|---|---|---|---|---|---|
| 12.1 | O(N) CATALOG tax | RISK_COUNCIL H-CTX-02 | Whether summary exposure is truly O(N) in practice | Mathematical + experimental verification | low (needs measurement) |
| 12.2 | Trigger detection determinism | RISK_COUNCIL H-CTX-04 | Who detects triggers: agent, resolver, state machine, dispatcher, event log? | Architecture decision needed | low |
| 12.3 | Read-widening boundedness | RISK_COUNCIL H-CTX-05 | Whether selective context constantly breaks down | Metrics: WIDENING_RATE, USEFUL_WIDENING_RATIO | low (needs data) |
| 12.4 | Global state-space failures | RISK_COUNCIL H-GRAPH-01 | Which global properties need checking (deadlock, livelock, cycles) | Formal methods vs simple graph checker | low (needs analysis) |

---

## 13. Recommended next actions

### 13.1 Immediate (parallel, no dependencies)

1. **Complete L-CORRECTION-4 certification** (SYNTHESIS §6 item 1)
   - DeepSeek certifier first, then Gemini + second certifier
   - Unblocks P-1 and all dependent work

2. **Validator migration launch conditions** (M-7)
   - With K1's API boundary in G1 contract set
   - First step: Node validation core as callable API

3. **Launch improvement research** (M-3, then K-launch)
   - Study A: Google AX, MCP, Rust as seeds
   - Study B: adaptive execution depth
   - Evidence base for K1, K4, K5, K6

### 13.2 Next cycle (after L-CORRECTION-4)

4. **Kernel dispatch script (C-3)** with K2 envelope as input
   - Carries state machine, single writer (pid + start time), operation ids
   - Completion contract and resolver (workflowAI 1.5)
   - Two certifiers required (high-risk)

5. **K4 harness** then RISK_COUNCIL (C-4, owner-timed)
   - Packet completeness harness
   - RISK_COUNCIL L0 A/B/C experiment on ladder models
   - P0 criteria: must close before v2 becomes default

### 13.3 Parallel research (ongoing)

6. **Validator migration implementation** (PROTO-DEC-0077)
   - Node core beside old engine
   - Differential test both engines
   - Phased migration with rollback

7. **Write Broker / Queue architecture** (scripts.md Track B)
   - Central repository-write service
   - Transaction schema design
   - Precondition check, conflict detection, atomic integration

8. **Performance baseline establishment** (Rust.md Stage 1)
   - Measure current wall time
   - Build call graph
   - Identify bottlenecks before optimization

### 13.4 Future (after measurements)

9. **Rust Core evaluation** (Rust.md, MCP_Server.md)
   - After performance baseline
   - Compare Node + PowerShell vs Rust core
   - Cost-benefit analysis

10. **AX integration decision** (Google_AX.md)
    - After current Colabs architecture fully understood
    - Measure baseline first
    - Prototype and benchmark

---

## Required Summary Table

| Source | Idea | Related layer | Current implementation | Canonical source | Status | Action | Confidence |
|---|---|---|---|---|---|---|---|
| H-AUTH-02.md | Capability envelope authorization | L0-L1 | Partial: PROTO-DEC-0070, 0077, 0078 | PROTO-DEC-0070, 0077, 0078 | PARTIALLY_IMPLEMENTED | COMPLETE | high |
| H-PROMPT-DELIVERY-01.md | Task file vs orchestrator loading | L3 | Partial: variant B/C used, D/E not evaluated | PROTO-DEC-0073 | PARTIALLY_IMPLEMENTED | COMPLETE | high |
| MIGRATION.md | Validator migration to Node | L3 | Accepted: PROTO-DEC-0077, plan in final-plan-2 | PROTO-DEC-0077 | PARTIALLY_IMPLEMENTED | COMPLETE | high |
| CORE-ARCH-1..7.md | Kernel layering L0-L9 | L0-L4 | Proposals exist, L0-L4 defined | PROTO-DEC-0054 | PARTIALLY_IMPLEMENTED | COMPLETE | high |
| RISK_COUNCIL.md | Kernel architecture risk audit | L0-L4 | Research design complete | None yet | ACTIVE | RESEARCH | high |
| executor.md | Minimum-sufficient executor selection | L2-L3 | Hypothesis only | None | RESEARCH_CANDIDATE | RESEARCH | medium |
| task_profife.md | Task Profile vs Model Resolver | L2 | Hypothesis only | None | RESEARCH_CANDIDATE | RESEARCH | medium |
| scripts.md | Write Broker / Queue | L3 | Architecture proposed | None | ACTIVE | COMPLETE | high |
| scripts.md | High-concurrency script runtime | L3 | Current: per-session journals, cooperative lock | PROTO-DEC-0005, 0009 | PARTIALLY_IMPLEMENTED | COMPLETE | high |
| Rust.md | Performance optimization | L3-L4 | Hypotheses listed | None | RESEARCH_CANDIDATE | RESEARCH | medium |
| MCP_Server.md | MCP integration | L3-L4 | Architecture options listed | None | RESEARCH_CANDIDATE | RESEARCH | medium |
| Google_AX.md | AX integration | L3-L4 | Architecture options listed | None | RESEARCH_CANDIDATE | RESEARCH | medium |
| SYNTHESIS-2026-09-25.md | Cross-document synthesis | Meta | Pre-synthesis | This review | SUPERSEDED | COMPLETE | high |
| RISK_COUNCIL.md | L0 runtime loading model | L0 | L0-A/B/C architectures proposed | None | RESEARCH_CANDIDATE | RESEARCH | high |
| RISK_COUNCIL.md | CATALOG O(N) tax | L0 | Hypothesis stated | None | UNCLEAR | RESEARCH | low |
| RISK_COUNCIL.md | TCB self-update safety | L0 | Question raised | None | RESEARCH_CANDIDATE | RESEARCH | high |

---

*Review complete. Report: REVIEW-MISTRAL.md. Model: Mistral Medium 3.5. Baseline: 7b6d17a.*
