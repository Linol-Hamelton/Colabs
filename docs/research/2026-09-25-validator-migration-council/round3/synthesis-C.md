# Round 3 Synthesis C: Validator Migration and F-3P-1 Resolution

Baseline-SHA: a4e6aef86440bc0e8da8f06c8f1d3f65af254367
Model: gemini-3.8-flash
Model-maker: Google
Client: agy
Effort: low
Task-frame / scope-id: task:vmc-r3-c
UTC-date: 2026-09-25
Mode: ADVISORY

---

## Part 1: Validator Migration Synthesis (§24 Answers)

### 1. Migrate now or preserve current timing?
- **Resolution**: Preserve scheduled timing (`PROTO-DEC-0039` item 3: post-pilot report) unless the owner issues an explicit trigger directive (DBI-02/DBI-42, class F).
- **Evidence**: PROTO-DEC-0025 item 5 (`.ai/DECISIONS.md:1171`) schedules Node migration for v2.0 roadmap; PROTO-DEC-0039 item 3 (`:1709`) anchors it "after the pilot report". PROTO-DEC-0071 item 1 (`:2858`) already resolved immediate researcher pain via `record --quick` (~3s, `MEASUREMENTS.md` M-01). The critical path bottleneck (283s, M-11) is driven by sequential test architecture in `tests/validator.test.cjs`, which can be split without altering the engine language. Reopening timing without a measured pilot report requires an explicit owner trigger row under AGENTS.md §6.

### 2. Exact migration scope
- **Resolution**: Port strictly `validate-protocol.ps1` and its internal verification rules into an in-process Node library and CLI, accompanied by a PowerShell compatibility wrapper.
- **Evidence**: `round1/DECISION-BOUNDARY.md:25` (DBI-01); `round1/NOT-IN-SCOPE.md:12-42`. NOT IN SCOPE (LATER/NEVER): `setup-ai-protocol.ps1` (installer self-check retained via platform boundary; full installer migration LATER, NIS:13), `test-protocol.ps1` full orchestration (LATER, NIS:17), launcher inspection (`Get-CimInstance`, LATER, NIS:21), Rust rewrite (NEVER, NIS:29), and general build system (NEVER, NIS:41).

### 3. Behavioural contract
- **Resolution**: Full normative contract freeze CM-01..CM-49 (`round1/VALIDATOR-CONTRACT-MAP.md:16-81`). Freeze observable outputs: diagnostic status tokens (`[PASS]`, `[WARN]`, `[FAIL]`), `-Quiet` suppression semantics, header and summary grammar, exit codes (0 = success, 1 = failure), and Evidence line formats (`.ai/bin/protocol-handoff.cjs:62-87`).
- **Evidence**: Consumer contracts in CI (`.github/workflows/protocol.yml:31-36`) and `tests/validator.test.cjs:18-29`. Defects D-1..D-6 (`VALIDATOR-CONTRACT-MAP.md:84-89`) are preserved by default during migration until explicit dual-engine fixes are approved via exception ledger (OQ-4).

### 4. Target architecture
- **Resolution**: Modular in-process Node library + CLI + PowerShell wrapper (Option B from `round1/B-performance-migration.md:125-133`).
- **Evidence**: Four cohesive modules under `.ai/bin/validator/`: `repository.cjs` (manifest, git, paths), `text.cjs` (byte, UTF-8, BOM, line counts), `governance.cjs` (decisions, registry, limits, tasks), `platform.cjs` (hooks, syntax, runtime probes); aggregated by `.ai/bin/protocol-validate.cjs` exposing synchronous `validate(root, options)`. Decoupled from `protocol-handoff.cjs` to eliminate require-cycles.

### 5. PowerShell boundary
- **Resolution**: Retain native PowerShell subprocess invocation exclusively for PowerShell syntax checking (`validate-protocol.ps1:243`) and installer self-check execution (`:1085-1102`).
- **Evidence**: PowerShell AST/grammar cannot be soundly parsed in JS without creating an unverified parallel TCB (`round1/A-contract-tcb.md:127`). Byte-level checks (`.ps1` ASCII-only, DEC-0001) run natively in Node `text.cjs`. On platforms lacking PowerShell, report named `WARN` ("PowerShell parser not available; syntax check skipped") while keeping byte/ASCII checks strictly enforced (A:127-129, B:137).

### 6. Node API
- **Resolution**: Synchronous function `validate(root, options = {}) -> ValidationResult`.
- **Evidence**: `round1/B-performance-migration.md:135-141`. `root` is explicit absolute path; options pass invocation-local env without mutating `process.env` or changing `process.cwd()`. Shape: `{diagnostics: [{id, status, path, message}], counts: {pass, warn, fail}, exitCode, coverage}`. Thrown unexpected runtime exceptions fail closed (exit 1).

### 7. Differential strategy
- **Resolution**: 12 fixture classes (`round1/A-contract-tcb.md:70-93`), independent expected results authored outside implementer/controller (0041 item 1), strict normalization allowlist (paths, line-endings, elapsed timestamps), and mutation tests for every NORMATIVE check capable of failing.
- **Evidence**: Parity alone is insufficient as it preserves common-mode blind spots and historical defects D-1..D-6 (A:30-35, C:24-25). Mutation testing (dropping individual check rules to assert fixture failure) is mandatory to verify rule presence (A:44).

### 8. Quick vs full strategy
- **Resolution**: Retain PROTO-DEC-0071 distinction: research/design frames use `record --quick` (`PROTOCOL_SKIP_GATE=1`, validator only); implementation/code frames require full `record`.
- **Evidence**: `.ai/bin/protocol-handoff.cjs:25-28,97`; `validate-protocol.ps1:870`. Reconciles challenge findings E-2 and X-1: both modes bypass gate recursion via `PROTOCOL_SKIP_GATE=1`, but full mode executes the entire test suite while quick executes the isolated validator.

### 9. Implementation DAG
- **Resolution**: Phased DAG with strict two-stream concurrency limit (PROTO-DEC-0048 item 7 / 0054 item 3; `round1/IMPLEMENTATION-DAG.md:36-64` D00..D18b) and anti-big-bang single-ownership boundaries.
- **Evidence**: D00 (owner authorization) -> D01 (oracle/contract freeze, T) -> D02 (interfaces, I) -> D03 (fixtures/harness, T) -> Parallel Streams: Stream 1 (X: D04 repo -> D05 text) || Stream 2 (Y: D06 governance -> D07 platform) -> D08 (assembly, I) -> D09 (differential parity gate, T) -> D10 (caller integration, I) -> D11 (wrapper & manifest packaging, I) -> D12 (qualification & rollback drill, T) -> D13 (unified audit prompt/report, I & R) -> D14a/b (two independent certifiers C1/C2) -> D15 (operational observation) -> D16..D18 (retirement of legacy PS production code).

### 10. Rollback
- **Resolution**: Multi-layer reversible checkpoints anchored to Git commit tags (`v1.9.5` baseline); wrapper routing fallback for phase 4; full release rollback for phase 5 (B:174).
- **Evidence**: Reverting caller switch (D10) or wrapper (D11) restores PowerShell engine execution without schema migration or repository state invalidation (`round1/A-contract-tcb.md:167-186`). Historical Evidence receipts remain valid across rollbacks under PROTO-DEC-0042.

### 11. Acceptance metrics
- **Resolution**: Mandatory non-regression floors: candidate validator wall-time <= reference median Bv (~3s, M-01); full normal suite wall-time <= Bs (309s, M-05); zero unexplained differential mismatches; zero OOM/timeouts.
- **Evidence**: `round1/B-performance-migration.md:147-158`. Stretch targets (<=1s validator, <=120s full suite) remain advisory hypotheses, not binding pass/fail criteria.

### 12. Certification
- **Resolution**: PROTO-DEC-0038 item 1 and PROTO-DEC-0041 items 1-2 bind certification: exhaustive unified audit prompt (<=150 lines), adversarial controller review (<=250 lines), followed by two independent parallel certifiers (C1 semantics/TCB, C2 platform/performance) outside execution/control holding T7+ capability.
- **Evidence**: `.ai/DECISIONS.md:1671,1792-1793,2336`. Single reviewer cannot certify high-risk kernel migrations.

### 13. Genuine owner decisions
- **Resolution**: Exactly ONE owner decision survives the §29 filter:
  - **Decision**: Does the owner approve advancing the validator migration ahead of the pilot report (reopening PROTO-DEC-0039 item 3 via an owner directive trigger row in `REGISTRY.md`), or shall execution remain scheduled post-pilot?
- **Evidence**: All technical choices (module layout, API shape, parser boundary, fixture taxonomy, defect preservation) are deterministically resolved by repository evidence and binding protocol rules.

### 14. Explicitly rejected alternatives
- **Resolution**:
  1. *Immediate full rewrite in Node to fix test suite latency*: Rejected; root cause is serial test suite file execution (M-11), solvable via test splitting.
  2. *Rewriting PowerShell parser in Node*: Rejected; brittle, unverified parallel TCB (A:127).
  3. *Pure differential parity without mutation/goldens*: Rejected; blind to common-mode omissions and defect classes D-1..D-6 (A:44).
  4. *Rust / Python runtime rewrite*: Rejected; Python rejected by CORE-ARCH-1 H-13; Rust lacks repository runtime presence (NIS:29).
  5. *Silently skipping checks or passing with unrecorded warnings on cloud*: Rejected; violates fail-closed security boundary (A:153-155, B:137).

---

## Part 2: F-3P-1 Resolution (Package L Remote Push Prevention)

### Threat Model & Controls (Q3)
- **Accidental violation** (model calls push by mistake): Blocked by removing default remotes from workdir (`prepareWorkdir`, `launch.cjs:414`) and setting local config `url.no-push://blocked.insteadOf`.
- **Instruction drift** (misinterpreting scope/instructions): Blocked by deterministic delivery layer; task declaration does not give agent push capability.
- **Tool misuse** (agent invokes alternate git commands/flags like `-c`): Blocked by credential profile isolation (no write token in env) and git wrapper / alias enforcement.
- **Autonomous adversarial behavior** (deliberately crafting bypasses like F-3P-1 `-c url.<x>.insteadOf`): Blocked by physical absence of push credentials (`GH_TOKEN`, SSH keys, git credential helpers) in execution environment.
- **Malicious repository content** (prompt injection via tracked code): Blocked by read-only credential boundary and post-run scope verification.
- **Compromised external tool/model**: Blocked by running unprivileged without write tokens; output publication handled exclusively by launcher post-validation.

### Comparison Matrix

| Variant | Security | Complexity | Runtime Friction | Maintenance | Failure Recovery | Fit for Current Project |
|---|---:|---:|---:|---:|---:|---|
| 1. Instructions only | None | None | None | None | Poor (silent leak) | Unacceptable (violates PROTO-DEC-0070) |
| 2. `ls-remote` monitoring | Low | Low | Low | Low | Detects after fact | Tripwire only (not a boundary) |
| 3. Credential profiles | High | Low | Low | Low | High (fails closed) | Excellent (best fit) |
| 4. Task Git modes | Med-High | Med | Low | Med | High (declarative) | Recommended workflow layer |
| 5. External trusted push | High | Med | Low | Med | High | Recommended delivery layer |
| 6. Windows user isolation | Very High | High | High | High | Complex | Premature / excessive friction |
| 7. Container | Very High | High | Med-High | High | Moderate | Premature for Windows workstation |
| 8. VM / Strong isolation | Extreme | Extreme | High | High | Complex | Rejected as disproportionate |
| 9. Hybrid (3 + 4 + 5 + 2) | High | Med | Low | Low-Med | High | **Optimal candidate** |

### Answers to Questions Q1–Q10

- **Q1 (Agent vs Orchestrator push)**: Variant B (external delivery). The agent never pushes; it completes local commits/patches. The trusted orchestrator validates, runs gates, and executes push if required.
- **Q2 (Sandbox levels)**: Level 1 (Credential profile) is sufficient for current workstation threat model. Stripping `GH_TOKEN`, git credential helpers (`GIT_CONFIG_NOSYSTEM=1`, custom empty `GIT_CONFIG_GLOBAL`), and SSH auth prevents network push regardless of `-c insteadOf` bypasses. Levels 2 & 3 are premature.
- **Q3 (Threat model controls)**: See Threat Model section above.
- **Q4 (`ls-remote` role)**: Secondary invariant / tripwire. Useful for detecting unexpected remote mutation or verifying postcondition cleanliness, but insufficient as primary enforcement against transient push.
- **Q5 (Delivery policy size)**: Minimal descriptor:
  ```yaml
  git:
    mode: LOCAL_COMMIT # or READ_ONLY, BRANCH_PUSH
  ```
- **Q6 (Mode derivation)**: Owner-defined in task specification, validated by launcher against procedure rules. Agent escalation prohibited.
- **Q7 (Default-deny)**: YES. If a task does not explicitly declare a publish requirement, remote mutation is physically impossible (no write credentials provided).
- **Q8 (Acceptance suite)**: Hostile test suite executing all 9 vectors from OWNER-DECISION-R3 §Q8: direct push, `-c url.insteadOf`, alternate remote, global config edit, tag push, new branch push, force push, credential helper query, alternate git binary.
- **Q9 (Reverse hypothesis / Risk evaluation)**:
  - `Risk × Probability × Blast Radius`: Unintended branch mutation or leak via public remote is Moderate × Low (accidental) / Low (adversarial) × High (repository contamination).
  - `Cost of Container/VM`: Implementation (High on Windows) + Maintenance (High) + Friction (Severe latency/setup).
  - `Cost of Credential Stripping + Orchestrator Push`: Implementation (Low, ~50 lines in `launch.cjs`) + Maintenance (Low) + Friction (Zero).
  - *Conclusion*: Credential stripping + external delivery provides equal security against remote exfiltration without the disproportionate overhead of VMs.
- **Q10 (Safety vs Workflow boundary)**: Both are required and separated. Workflow boundary = Task Git modes (`READ_ONLY`, `LOCAL_COMMIT`, `BRANCH_PUSH`). Security boundary = Stripped credential environment (`NO_WRITE_CREDENTIALS`).
