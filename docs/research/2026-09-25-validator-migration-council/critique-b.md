# Critique B: Simplicity, Performance, Implementability and Over-engineering

- Baseline-SHA: a4e6aef86440bc0e8da8f06c8f1d3f65af254367 (Part 1); cd90be1d3c1fede4e02f7ecff5b6507ea1f34338 (Part 2 inputs)
- Model: gemini-3.8-flash
- Model-maker: Google
- Client: agy
- Effort: low
- Task-frame / scope-id: task:vmc-critique-b (parent program:validator-migration-council)
- UTC-date: 2026-09-25
- Mode: ADVISORY
- Independence declaration: Did not open `critique-a.md` before this report was written and completed (PROTO-DEC-0052 item 2; C-critique.md).
- Evaluated document: `docs/research/2026-09-25-validator-migration-council/draft-decision.md` (by Moonshot AI / kimi-k3 via copilot).

---

## Part 1: Validator Migration Critique (D-01 .. D-18)

### D-01 — Timing: AGREE
- FACT: PROTO-DEC-0039 item 3 (`.ai/DECISIONS.md:1709`) binds the validator port to the post-pilot v2.0 roadmap.
- FACT: DBI-02 and DBI-42 (`round1/DECISION-BOUNDARY.md:26,67`) classify timing changes as Class F, strictly requiring an `owner-directive` trigger row.
- INFERENCE: Draft correctly preserves existing timing while formatting sB's bounded early-migration case as an explicit question (D-17 Q1) for the owner. Bounding Phase 0 deliverables to approved plan milestones prevents unapproved pre-implementation scope creep.

### D-02 — Exact migration scope: AGREE
- FACT: `round1/NOT-IN-SCOPE.md:12-42` excludes installer rewrite, suite orchestration rewrite, and launcher inspection.
- INFERENCE: Scope is minimal, sound, and implementable. Adopting sB's tighter boundary (core Node CLI/library + thin wrapper + caller adapter + differential harness + minimal gate leaf) avoids entangling the separate backlog item DBI-19 (handoff decomposition). The requirement to document the DBI-19 interface cleanly prevents architectural rot without premature refactoring.

### D-03 — Behavioural contract and defect dispositions: AGREE
- FACT: `round1/VALIDATOR-CONTRACT-MAP.md:16-89` defines the 49 normative rows and defect table.
- INFERENCE: Preserving baseline defects D-1..D-6 by default with pinned expectations avoids conflating engine migration with unreviewed normative policy changes. Pinning D-1 crash/exception cases as non-zero/stderr fixtures (rather than discarding them) ensures robust qualification without complex error-handling overhauls.

### D-04 — Defect D-2: the Node floor: PARTLY AGREE
- FACT: `validate-protocol.ps1:347-350` checks Node >= 18; `test-protocol.ps1:13` enforces Node >= 22; `.ai/bin/protocol.cjs:43` requires >= 18.
- FACT: M-01/M-05 show qualification and host baseline running on Node 22.21.0.
- INFERENCE: Stating the floor as >= 22 in documentation and fixtures matches reality. However, changing runtime enforcement in installed hosts could break consumers operating on Node 18..21 (H-6).
- CRITIQUE / PROPOSAL: Runtime failure on Node < 22 must remain deferred until parity qualification is complete, qualifying exclusively on the baseline runtime (22.21.0) without unilaterally mutating installed host contracts. What would change my mind: a survey showing zero consumers on Node < 22.

### D-05 — Target architecture: AGREE
- FACT: `round1/B-performance-migration.md:125-133` details Option B.
- INFERENCE: The four-module structure (`repository`, `text`, `governance`, `platform`) aggregated by `protocol-validate.cjs` is clean and cohesive. Strictly forbidding DSLs, plugin frameworks, daemons, and persistent caches directly defends against over-engineering. Assigning line-count logic to text and line-limit enforcement to governance cleanly resolves the ownership ambiguity identified in `round2/challenge-B.md:109-123`.

### D-06 — PowerShell boundary: parser and installer: AGREE
- FACT: PowerShell syntax cannot be parsed natively in JS without building an unmaintainable AST parser (TCB risk; `round1/A-contract-tcb.md:127`).
- FACT: `validate-protocol.ps1:1085-1100` executes the installer self-check to guard against installation false greens.
- INFERENCE: Retaining PS 5.1 as the parser host of record while batching PS parsing into at most one subprocess invocation respects both security and performance constraints (M-07). Moving ASCII byte scans to Node natively (DEC-0001) removes unnecessary subprocess overhead.

### D-07 — Bash severity: AGREE
- FACT: `validate-protocol.ps1:392-418` inspects bash hooks; `.claude/hooks/*.sh` wrappers are currently present in this repository.
- INFERENCE: A deterministic rule that yields `FAIL` when tracked `.sh` hooks exist and capability-conditional `WARN` when no tracked bash hooks exist is simple, implementable, and does not require building complex environment profiling.

### D-08 — A run without PowerShell, and cloud Evidence: AGREE
- FACT: CI (`protocol.yml:28-36`) fails on `WARN`; Evidence receipts attest full protocol compliance (`.ai/DECISIONS.md:1171,1795`).
- INFERENCE: Defaulting to fail-closed (non-zero exit) for certifying Evidence on hosts lacking PowerShell preserves attestation integrity without adding speculative partial-attestation mechanisms. Emitting named `WARN` tokens ensures developer clarity without granting unearned passes. Escalating the policy choice to owner question D-17 Q2 is correct.

### D-09 — Node API and the `record` caller boundary: AGREE
- FACT: `protocol-handoff.cjs:94-106` enforces a 900s timeout and isolates subprocess crashes.
- INFERENCE: The synchronous API `validate(root, options)` is minimal and stateless. Spawning the Node CLI initially from `record` preserves process crash containment and the 900s deadline. Deferring in-process execution until hard isolation is proven avoids complex in-process sandbox engineering.

### D-10 — The record -> validator -> gate-check cycle: AGREE
- FACT: `round1/VALIDATOR-CALL-GRAPH.md:51-53` shows Node gate checks and PowerShell gate checks currently evaluate non-identical rules.
- INFERENCE: Introducing a small, isolated leaf module for gate-structure predicates (imported by both `handoff` and `validator`) breaks the circular dependency without dynamic runtime introspection. Golden fixtures guarding the union of checks prevent regressions.

### D-11 — Differential strategy and mutation scope: PARTLY AGREE
- FACT: `round1/A-contract-tcb.md:70-93` details 12 fixture classes; `round1/VALIDATOR-CONTRACT-MAP.md` contains 49 check rows.
- INFERENCE: Differential execution across 12 fixture classes is necessary. However, requiring manual mutation testing for *every* normative FAIL check across the entire matrix introduces significant authoring friction.
- CRITIQUE / PROPOSAL: High-value sentinel checks (path traversal, decoding, required files, receipt binding, syntax, skip-to-success) must undergo mutation testing at qualification. Expanding mutation to all 49 rows should only occur where branch coverage analysis demonstrates ambiguity. What would change my mind: automated mutation scripts that generate faults without manual intervention.

### D-12 — Quick vs full strategy: AGREE
- FACT: PROTO-DEC-0071 item 1 (`.ai/DECISIONS.md:2858`) established `record --quick` using `PROTOCOL_SKIP_GATE=1` for research frames.
- FACT: Full validation runs tests while quick runs validator only; both avoid gate recursion (`tests/gate.test.cjs:275-311`).
- INFERENCE: Enforcing full `record` on code/implementation frames and `--quick` on advisory research frames, coupled with candidate SHA freeze and start/end identity, prevents fraudulent attestations at zero performance overhead.

### D-13 — Implementation DAG and the test split: AGREE
- FACT: M-11 shows `tests/validator.test.cjs` accounts for 283s of the 309s suite run.
- FACT: PROTO-DEC-0039 item 1 feature freeze binds tooling outside CORE-ARCH.
- INFERENCE: Structuring the test split as the first task under owner authorization (G2/D00) de-confounds performance measurement for the engine port. A two-stream limit (X: repo/text, Y: governance/platform) with a single integrator prevents multi-writer git merge thrashing.

### D-14 — Rollback and retirement: AGREE
- FACT: PROTO-DEC-0042 decouples receipt validity from post-hoc file invalidation.
- INFERENCE: Retaining the PS engine in-tree until explicit two-certifier retirement (D16) provides an instant, zero-cost rollback mechanism (reverting wrapper/caller commits). Adopting sB's rule that defective validator receipts must be superseded by re-running checks after repairs maintains attestation truth without rewriting immutable history.

### D-15 — Acceptance metrics: AGREE
- FACT: M-01 (median ~2.91s), M-05 (309s suite), and M-06/M-07 provide empirical baselines.
- INFERENCE: Non-regression floors (candidate <= baseline) are realistic and falsifiable. Structural thresholds (0 full legacy PS launches in normal path, <=1 parser subprocess, <=1 self-check subprocess) ensure architectural intent is achieved even if raw execution time is neutral. Discarding speculative stretch targets (<=1s) prevents premature micro-optimization.

### D-16 — Certification: AGREE
- FACT: PROTO-DEC-0038, PROTO-DEC-0041 item 2, and PROTO-DEC-0072 dictate two independent T7 certifiers outside execution and control.
- INFERENCE: Checking certifier availability at G0 before code execution prevents stalled pipelines. Hard-blocking rather than permitting self-certification preserves protocol governance integrity.

### D-17 — Genuine owner decisions: AGREE
- FACT: Owner §29 strictly limits questions to non-delegatable policy and trade-offs.
- INFERENCE: Presenting exactly two questions—(1) Timing authorization under the freeze, and (2) Cloud Evidence attestation policy for no-PowerShell environments—correctly filters out technical trivia.

### D-18 — Explicitly rejected alternatives: AGREE
- FACT: `round1/B-performance-migration.md:78-83`, `round1/C-adversarial-simplifier.md:10-18`, and `round2/challenge-C.md` document rejected paths.
- INFERENCE: Explicitly rejecting rule DSLs, daemons, persistent caches, non-Node runtimes (Rust/Python), in-process caller execution, and permanent dual engines prevents over-engineering and keeps the implementation surface bounded.

---

## Part 2: F-3P-1 Critique (F-01 .. F-08)

### F-01 — Threat model: AGREE
- FACT: L3 review (`docs/reviews/2026-09-25-deepseek-core-arch-stage2-review-packageL-third-pass.md:47-98`) demonstrated that `insteadOf` prefix matching is bypassed via `-c` flags and longest-prefix URLs.
- INFERENCE: Establishing one concrete control per threat class (sanitized env for accidental pushes; immutable descriptor + `scopeCheck` for instruction drift; credential scrubbing for tool misuse; post-audit + selective copy-back for malicious repos) covers the attack surface without requiring virtualized containerization.

### F-02 — Divergences that shape the architecture: AGREE
- FACT: External credential helpers consulting OS keychains or SSH agents can provide ambient write authority even if `GH_TOKEN` is unset.
- INFERENCE: Level 1 credential profile (clearing tokens, agent, and pointing `GIT_CONFIG_GLOBAL` to an empty file) is simple, fast, and sufficient for cooperative agents. Conditioning Level 2 (separate OS user) on canary test failures (F-05) strikes the correct balance between simplicity and rigor.

### F-03 — Proposed architecture: AGREE
- FACT: `launch.cjs:428-447` already performs workspace isolation and copy-back.
- INFERENCE: Variant 9 (Hybrid) is highly implementable:
  1. Default-deny git descriptor (`git: {mode: READ_ONLY|...}`).
  2. Credential-stripped execution environment (~50 lines in `launch.cjs`).
  3. Trusted external delivery (orchestrator pushes approved candidate commits; the worker never pushes).
  4. Non-enforcing `ls-remote` audit before/after job execution.
  This introduces zero daily runtime friction for research runs while eliminating accidental remote pollution.

### F-04 — Matrix row justification: AGREE
- FACT: `OWNER-DECISION-R3.md` requires evaluating variants 1-9 across security, complexity, friction, and maintenance.
- INFERENCE: Rows 1-2 (instructions / ls-remote only) fail basic bypass probes. Rows 6-8 (OS identities / VM containers) impose excessive operational friction (~500ms+ per process query, complex multi-user Windows setup). Variant 9 provides maximum protection at minimal operational cost.

### F-05 — Acceptance test (Q8): AGREE
- FACT: Negative probes must test actual bypasses discovered in L3 (flags, config, SSH, alternate remotes).
- INFERENCE: Testing 14 negative cases against local test remotes with synthetic canary credentials ensures thorough coverage without touching production remotes. Requiring exit != 0, untouched ref sets, and zero ambient credential leakage establishes a rigorous, falsifiable gate.

### F-06 — Proportionality (Q9) and decision principle: AGREE
- FACT: Autonomous agents in this repository operate under cooperative supervision; workstation VM sandboxing is not currently provisioned.
- INFERENCE: Applying the formula `Risk = Severity x Probability x Blast Radius` shows that while blast radius is high, the cost of Level 1 mitigation (~50 lines in launcher) is trivial. Mandating standing Level 2/3 OS sandboxing today would violate the owner's decision principle (proportionality, avoiding sandbox bureaucracy).

### F-07 — Q1-Q10 convergence map: AGREE
- FACT: Syntheses A, B, and C converged on trusted external delivery (Q1-B), Level 1 profile with Level 2 canary trigger (Q2), and default-deny modes (Q7).
- INFERENCE: The draft accurately reflects the consensus without smoothing over open conditions.

### F-08 — What stays open: AGREE
- FACT: Open Question L-1 (scope of remote protection vs general data exfiltration) requires an owner risk-boundary determination.
- INFERENCE: Confining package L to protecting repository remotes while leaving network exfiltration to broader platform policy is pragmatic and prevents scope explosion.

---

## Conclusion & Quality Assessment

Drafter quality (draft-decision.md): GOOD - Synthesized all three independent round-3 perspectives into a concrete, highly implementable proposal that strictly balances security, simplicity, and protocol compliance without over-engineering.
