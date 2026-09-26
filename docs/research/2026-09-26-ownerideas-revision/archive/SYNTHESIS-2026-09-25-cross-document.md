# Cross-document synthesis of OwnerIdeas: the strongest hypotheses for the kernel, and kernel readiness

- Author: claude-c73232724159e5bd (claude-opus-5-5), at the owner's request, 2026-09-25. Advisory; it
  decides nothing. Saved in `OwnerIdeas/` until the Gemini-DeepSeek cycle of package L closes; then it
  moves to the working area.
- Baseline: 2968778 (origin/v2.0.0).
- Corpus: all seven files of `OwnerIdeas/`:
  - Google_AX, 2085 lines;
  - MCP_Server, 3452;
  - RISK_COUNCIL, 3115;
  - Rust, 1019;
  - MIGRATION, 1314;
  - H-AUTH-02, 58;
  - H-PROMPT-DELIVERY-01, 69.
- Read depth, honestly:
  - read in full: H-AUTH-02 and H-PROMPT-DELIVERY-01. MIGRATION was worked by the council, whose
    final plan is accepted (PROTO-DEC-0077);
  - read by outline and their hypothesis blocks: RISK_COUNCIL (all H-* sections, P0 criteria),
    MCP_Server, Google_AX and Rust (all section headings, the priority and tier sections, the AX
    boundary sections).

  Claims about sections I did not read in full are INFERENCE, marked where it matters.
- Checked against: PROTO-DEC-0050, 0066, 0070 and 0073-0078; CORE-ARCH-1..7; the stage-1, 2 and 4
  records.

## 1. Convergence clusters

"Synonymous" means the same idea in other words; "compatible" means different ideas that fit
together without conflict.

| # | Cluster | Where it appears | Relation | Status in the repository | Kernel impact now |
|---|---|---|---|---|---|
| K1 | One deterministic core behind thin adapters (CLI, MCP, AX, cloud); the core owns protocol guarantees, adapters own transport | MCP §86-88, 93, 135, 151-158 (ports and adapters, "MCP must not own domain logic", shared CLI+MCP core, no big bang, shadow mode); AX §41-47 (no duplication, "don't give AX the intelligence of Colabs", backend abstraction, local-first); Rust A, Z (Rust core, eliminate work); RISK §48 ("do not assume Rust/MCP/AX"); MIGRATION (one callable validation authority) | synonymous | first step accepted: the Node validator migration (0077) makes validation a callable API | **highest** |
| K2 | Deterministic authority, not model judgement: a capability envelope per task (paths, tools, commands, network, secrets, git, expiry), least privilege, and EXECUTE / DELEGATED / OWNER / STOP | H-AUTH-02 (all); RISK H-AUTH-01, H-SEC-01, H-OWNER-01; MCP §35-39, 114-117 (authorisation, role-specific, least privilege, safety annotations, human confirmation, typed commands); AX §14-15 (gateway, least-privilege agents); final-plan-2 Part 2 (git modes, default-deny) | synonymous | pieces decided separately: 0070 (one-run grants), 0077 item 3 (git modes, hypothesis), 0078 item 4 (approval gate), 0050 item 3 (client profiles); no single envelope | **highest** |
| K3 | Supervised execution: single active writer, process identity, state machine, idempotent retries, completion is more than "the artefact exists" | RISK H-RUNTIME-01 (names pid plus creation time), H-STATE-01, H-GRAPH-01; AX §22, 33-35 (state machine, failure recovery, retry, suspend); MCP §121-125, 53-56 (idempotency, retry safety, operation ids, concurrency, stale-state, long-running operations, cancellation, progress) | synonymous | decided: 0075 (supervisor, completion contract, error classes) and 0078 item 1; run-chain implements part (M-4); kernel dispatch script not built (C-3) | **high** |
| K4 | Bounded active context: lazy loading, packet precision and recall, token accounting, freshness | RISK §4 (central hypothesis), H-CTX-01..05, H-BUDGET-01, H-FRESH-01, §38-40 (packet completeness, L0 A/B/C experiments); MCP §15-19, 141-143 (lazy loading, precision, contamination, token accounting, instruction reduction); AX §38-39 (token optimisation, context reconstruction); Rust G (repeated reads); H-PROMPT-DELIVERY-01 | synonymous | central CORE-ARCH premise (packet compiler, CORE-ARCH-7); unmeasured | **high, but a measurement comes first** |
| K5 | Performance by eliminating work: persistent process, incremental snapshot, caches, PowerShell out of the hot path, validation DAG, fast/full paths | Rust A-O, Z; MCP §27-28, 77-84, 170-173; AX §6 (persistent environments, prewarming, caching); MIGRATION | synonymous | the Node validator is the accepted first step (0077); a daemon and snapshots are later | medium now, high later |
| K6 | Empirical model routing and independence by diversity | RISK H-MODEL-01, H-EVAL-01/02, H-IND-01; AX §9-10, 63, 65 (dynamic model, consensus, dynamic council, routing); MCP §146-148 | synonymous | decided in part: 0074, 0075 items 8-10, workflowAI; the qualification layer is tech debt (C-5, frozen H-WAI) | medium |
| K7 | Observability and audit: telemetry, traces, audit log, reproducible review | MCP §101-104, 120, 181, 190; AX §29-32; RISK H-EVAL, §52 (primary metrics) | compatible | pieces exist: Evidence, USAGE.md, the runner report, MODEL-ECONOMICS | medium |
| K8 | Trust boundary for instructions versus data, and secret propagation | RISK H-SEC-02, H-SEC-03; MCP §114-119 (path traversal, command injection, secret handling); final-plan-2 threat model ("malicious repository content") | compatible | secret scan in `record`; F-3P-1 work; no instruction/data rule | medium (cooperative mode, H-AUTH-01) |
| K9 | Versioned, pinned inputs: kernel epoch, stable ids, in-flight compatibility | RISK H-FRESH-01, H-VERSION-01; MCP §179-181, 191-192; AX §29 | synonymous | decided in part: 0075 item 7 (launch-input pinning); kernel epoch open | medium |
| K10 | Remote and cloud execution without a shared filesystem | RISK H-REMOTE-01, §44; AX (workspaces), MCP §31-32, 119 | compatible | 0077 item 1 (cloud Evidence fail-closed) | low now |

## 2. The strongest hypotheses for the kernel at this stage

Ranked by impact on kernel formation, times the evidence already in hand, divided by cost. Each has
one next action.

1. **K1: core behind adapters.**
   - Already started: the validator migration (0077) is its first callable authority.
   - Action: add to the migration's G1 contract set an explicit internal API boundary. Name the
     calls the CLI, a future MCP facade and the dispatcher will use, so that no adapter owns domain
     logic.
   - Certification: part of the migration's own certification (final-plan-2 section W).
2. **K2: capability envelope.**
   - Merge 0070 grants, git modes (0077 item 3), approval gates (0078 item 4) and client profiles
     (0050 item 3) into one launcher-owned task descriptor. L-CORRECTION-4 item 3 is its first
     slice (`git:` mode).
   - Action: a design note next cycle, H-AUTH-02's required outcome, with deterministic EXECUTE /
     DELEGATED-JUDGEMENT / OWNER-DECISION / STOP rules.
   - Certification: high-risk (0038 item 1), two certifiers.
3. **K3: supervisor.**
   - Decided (0075, 0078). Needs the kernel dispatch script (C-3), which replaces run-chain and
     `launch.cjs` and carries the state machine, single writer (pid plus start time), operation
     ids, completion contract and resolver (workflowAI 1.5).
   - Action: include C-3 in the next cycle, behind L-CORRECTION-4.
   - Certification: high-risk, two certifiers.
4. **K4: bounded context.**
   - The premise of the new kernel, and unmeasured. Infrastructure first: a packet-completeness
     harness (RISK §38) and token accounting per run (MCP §141). Its seed exists in the runner's
     usage records.
   - Action: build the harness, then run the RISK_COUNCIL L0 A/B/C experiment (RISK §39-40) on the
     ladder models.
   - Certification: the experiment's own A/B rules (P-L0-007 comparative test).
5. **K5: performance.**
   - Keep to the accepted migration. The daemon, snapshots and watcher wait for the migration's
     measurements (Rust tiers C-D, MCP tier C).
   - Action: none beyond the migration's phase 0 baseline.

K6-K10 stay as they are: decided in part, frozen (0076 item 4), or later-stage.

## 3. Infrastructure to prepare now for later-stage decisions

- Unblock the improvement research (PROTO-DEC-0066). Study A takes Google AX, MCP and Rust as its
  seeds, and study B is adaptive execution depth; both are the evidence base for K1, K4, K5 and K6.
  They are blocked only by P-1 (package L). Once L-CORRECTION-4 is certified, re-resolve its jobs to
  the ladder (M-3) and launch.
- One run-record schema. Unify the runner report, USAGE.md, Evidence and MODEL-ECONOMICS
  measurements into one per-run record (model, route, tokens or credits, wall time, retries, result,
  reviewer verdict). That record feeds K3, K4, K6 and TD-MODEL-QUALIFICATION.
- The RISK_COUNCIL as the next council. It is the designed audit of the whole v2 kernel (P0 means
  "must close before v2 becomes the default kernel"). The council package, the runner and the
  ladder now exist to run it cheaply. Timing is the owner's call (C-4).

## 4. Kernel procedures that can join the working workflow before the next cycles

| Procedure (record) | State | Integrate now? | How |
|---|---|---|---|
| Orientation line (P-L1-001) | stage 2, under review | yes, already used | every council and runner launch writes it; keep as practice |
| Independence (P-L1-002) | stage 2 | yes, already used | the runner and synthesis prompts apply it; aligned with 0075 item 13 |
| Model selection (P-L2-002) | stage 2 trial | partly | replace its tier table in practice by workflowAI 1.5 and the ladder; rubric realignment M-5 |
| Assignment (SCHEMA-assignment) | stage 2 | bridge only | the Roles shim stands until frame-aware assignment lands (В-12) |
| Route failover (P-L3-004) | stage 4 trial | yes, within package L | after L-CORRECTION-4 and its certification |
| Model discovery and ranking (P-L3-002/003) | stage 4 | as the "available" layer only | workflowAI sits on top; ranking is replaced by the owner ladder |
| Stop and ask (P-L0-002) | stage 1 trial | yes | the terminal cases of workflowAI 1.5.8 and 0075 are its instances; a K2 envelope makes it deterministic |
| Comparative test (P-L0-007) | stage 1 trial | yes | the rule set for the K4 experiment |
| Decision change and source conflict (P-L0-003, P-L0-005) | stage 1 trial | already de facto | the Supersedes and trigger-row practice of today's blocks |
| Work cycle (WORK-CYCLE) | stage 2 | yes | discussion, critique, synthesis and certification, as run today |

## 5. Readiness of the new kernel to replace the old one

- Verdict: **not ready to replace**. Four things are missing:
  - layers L5-L9 and the packet compiler (CORE-ARCH-6/7), which are proposals only;
  - the five certification packages I-a..III-b, none passed;
  - `.ai/core/`, which does not exist;
  - the validator, which is still PowerShell, with its migration just approved.
- Recommended path: **merge by strangling, new kernel first where it exists**.
  - Every new-kernel rule that is decided and exercised already binds through decision blocks
    (0073-0078), and newer blocks win by Supersedes.
  - The old enforcement layer (AGENTS.md, `.ai/bin`, the validator) stays the gate until the new
    kernel's certified replacement of each part exists: validator via 0077, dispatcher via C-3,
    packet compiler via CORE-ARCH-7.
  - Each replacement lands behind shadow mode and differential verification (MIGRATION's method,
    MCP §158-159).
- Swap criterion: all P0 of the RISK_COUNCIL closed, packages I-a..III-b certified, and the K4
  measurement showing bounded context without a rise in protocol errors (RISK §4, the four
  conditions).

## 6. Proposed order for the next cycle (for the owner's approval)

1. Close L-CORRECTION-4: DeepSeek, then Gemini and a second certifier. This unblocks P-1.
2. In parallel, the validator migration launch conditions (M-7), with K1's API boundary in G1.
3. Launch the improvement research (M-3, then K-launch).
4. C-3, the kernel dispatch script (K3), with the K2 envelope as its input.
5. The K4 harness, then RISK_COUNCIL (C-4), timed by the owner.

Kept frozen by PROTO-DEC-0076 item 4: H-WAI-1..6, H-PROMPT-DELIVERY-01, and every hypothesis of the
seed documents not named above. They re-enter only through the research of step 3 or the
RISK_COUNCIL.
