Baseline-SHA: a4e6aef86440bc0e8da8f06c8f1d3f65af254367
Model: deepseek-flash
Model-maker: DeepSeek
Client: Kilo (agent name `deepseek`)
Effort: unknown (not exposed by this route; README table slot r2-c, T6)
Task-frame / scope-id: task:vmc-r2-c (parent-scope program:validator-migration-council)
UTC-date: 2026-09-25
Mode: ADVISORY
Target: C (author Gemini 3.1 Pro, agy; another maker, owner §23)
Round-1 corpus: frozen at commit 5ace76c6ed76500740f22a7649c1cf9e535541b3. Baseline paths below are read
at a4e6aef; round-1 files are cited as `round1/<file>:<line>`.

Method: every major proposal of zone C is challenged with the fifteen §23 questions, each answer one
line. Labels: FACT / INFERENCE / HYPOTHESIS / OPEN QUESTION; n/a carries its reason. Nothing here
resolves a cross-zone disagreement; the issue matrix and round 3 do.

## P1 — "Test splitting collapses the critical path, so full migration now is not strictly necessary" (round1/C-adversarial-simplifier.md:10-13): PARTLY AGREE

1. Measured? FACT for the bottleneck (M-11 283 s of 309 s; M-04 workers); "not necessary now" is a value judgement, not measured.
2. Causal? M-11 -> wall time is causal; "latency pain -> no migration needed" is correlation plus a policy conclusion.
3. Necessary? Test splitting is the right fix for latency; migration necessity is a separate, already-decided matter (DBI-01).
4. Simpler sufficient? Yes for latency only: PROPOSAL option B itself proposes the split (docs/core-arch/PROPOSAL-node-validator.md:83-86); B agrees it is the strongest code-level experiment (round1/B-performance-migration.md:83).
5. Accepted decision settles it? PROTO-DEC-0025 item 5 and PROTO-DEC-0039 item 3 settle that the migration happens; only timing is open (round1/DECISION-BOUNDARY.md:25-26, DBI-01 A / DBI-02 D).
6. Reopens a decision? Yes — "full migration now is not strictly necessary" reads against DBI-01 (class A) without an owner trigger row (AGENTS.md §6; DBI-42 F).
7. Semantic behaviour lost? The split itself loses none; the conclusion drops the migration's non-latency contract (cloud Evidence, three hand-parity copies: PROPOSAL:26-30).
8. Silent migration failure? n/a — this proposal is about not migrating; it names no migration failure mode.
9. Differential sufficient? n/a — no differential design proposed in this section.
10. Shared wrong assumption? n/a.
11. Rollback possible? n/a — a test split is trivially revertible.
12. Integration risk? Yes: it touches suite selection/helpers, owned by the integrator (round1/IMPLEMENTATION-DAG.md:74) and the manifest-equality test (round1/IMPLEMENTATION-DAG.md:26).
13. Owner asked something machines can settle? No; the OPEN QUESTION is the legitimate timing question DBI-02, which the owner owns.
14. Model decides owner-only matter? Only if the inference were used to halt a decided migration; as an advisory inference it stays within §33.
15. Falsifier? A measured split suite that stays far above the latency target, or a ruling that cloud/parity drivers are binding, falsifies the simplification.

## P2 — "80-90% of the wall-time benefit via test splitting plus --quick" (round1/C-adversarial-simplifier.md:15-18): DISAGREE

1. Measured? No: the section labels itself HYPOTHESIS; no split suite and no defined "benefit" is measured (round1/B-performance-migration.md:83 says exactly this is unsupported until measured).
2. Causal? Test splitting does reduce the serial tail; the 80-90% share is asserted, not derived.
3. Necessary? n/a — this is the simplifying proposal, not a requirement.
4. Simpler sufficient? It is the simpler option; sufficiency is unproven, and it fixes no cloud/parity property (PROPOSAL:83-86).
5. Decision settles it? PROTO-DEC-0071 item 1 already grants --quick to research/design frames (DBI-17); it is not a general agent-work rule.
6. Reopens a decision? No.
7. Semantic behaviour lost? Splitting the stateful completion-gate test (tests/validator.test.cjs:40-137, ~20 mutate/validate cycles) drops state-transition semantics unless scenarios are reconstructed (round1/B-performance-migration.md:49; round1/IMPLEMENTATION-DAG.md:109).
8. Silent failure? A split can drop scenarios with no visible failure unless a coverage map is kept (round1/IMPLEMENTATION-DAG.md:74-75; round1/B-performance-migration.md:143).
9. Differential sufficient? n/a — not a parity proposal.
10. Shared wrong assumption? n/a.
11. Rollback possible? Yes, by reverting the split.
12. Integration risk? Yes — helper/manifest surface is single-writer (round1/IMPLEMENTATION-DAG.md:74,26).
13. Owner asked something machines can settle? No owner question raised.
14. Model decides owner-only matter? No.
15. Falsifier? B's own optimistic model is ~94 s (unsplit syntax file lower bound), not a promised <120 s (round1/B-performance-migration.md:78); a measured split above 120 s or one that drops scenarios falsifies the claim.

## P3 — "A Node validator could silently stop checking Windows/OS filesystem behaviour; it might skip the PowerShell syntax check" (round1/C-adversarial-simplifier.md:20-22): PARTLY AGREE

1. Measured? The parser check exists (validate-protocol.ps1:243); the claimed silent loss is HYPOTHESIS with no reproduction.
2. Causal? Not established; "could" is a possibility, not a demonstrated path.
3. Necessary? The mitigation is necessary for any port; the proposal offers no mechanism beyond keeping checks.
4. Simpler sufficient? Yes and already present: capability-conditional WARN plus independent fixtures and mutation tests (round1/A-contract-tcb.md:44-48,111-117).
5. Decision settles it? PROPOSAL:54-57 commits the parser check to stay as a spawned check reporting WARN "not run"; A's boundary item 1 agrees (round1/A-contract-tcb.md:127).
6. Reopens a decision? No.
7. Semantic behaviour lost? The listed behaviours (path case, separators, reparse) are load-bearing and already mapped (round1/A-contract-tcb.md:208-211) with mandatory fixtures (round1/A-contract-tcb.md:80-82,133).
8. Silent failure? That is the failure mode; A's mutation set is the guard (round1/A-contract-tcb.md:44).
9. Differential sufficient? No — A states differential alone cannot prove a check exists (round1/A-contract-tcb.md:44); C does not say this.
10. Shared wrong assumption? Yes, a real risk: the old engine itself carries defects D-1..D-6 (round1/VALIDATOR-CONTRACT-MAP.md:84-89), so parity can preserve them.
11. Rollback possible? n/a.
12. Integration risk? n/a per check.
13. Owner asked something machines can settle? No owner question here.
14. Model decides owner-only matter? No.
15. Falsifier? A mutation that removes a Windows/reparse check while both engines stay green.

## P4 — "Differential parity gives false confidence" (round1/C-adversarial-simplifier.md:24-25): PARTLY AGREE

1. Measured? No — stated as HYPOTHESIS; A offers no measurement either, so it is a design risk, not a finding.
2. Causal? In principle yes: same host, same blind spots.
3. Necessary? Handling the risk is necessary; stopping at the warning is not.
4. Simpler sufficient? Independent expected results plus mutation plus a narrow reviewed normalizer (round1/A-contract-tcb.md:43-45,95-117).
5. Decision settles it? PROTO-DEC-0025 item 5 mandates differential, not that it is sufficient; PROTO-DEC-0038/0041 mandate independent certification (round1/A-contract-tcb.md:47).
6. Reopens a decision? No.
7. Semantic behaviour lost? None from this proposal.
8. Silent failure? Yes, and it is the point; A designs goldens and mutations against it.
9. Differential sufficient? No, and A already says so; C mis-describes the mechanism — A normalizes OLD/NEW inside a reviewed allowlist and compares to independently authored EXPECTED (round1/A-contract-tcb.md:95-109), it does not "normalise against expected output".
10. Shared wrong assumption? C's own question; A supplies the stronger evidence (paired-cycle drift, round1/A-contract-tcb.md:32-35), C supplies none.
11. Rollback possible? n/a.
12. Integration risk? n/a.
13. Owner asked something machines can settle? No.
14. Model decides owner-only matter? No.
15. Falsifier? A fixture whose normalised OLD and NEW agree while an OS-dependent case is wrong; A's classes 7 and 12 cover it (round1/A-contract-tcb.md:82,93).

## P5 — "Cloud compatibility weakens the PowerShell syntax check; a cloud agent could land invalid .ps1 that silently breaks Windows" (round1/C-adversarial-simplifier.md:27-28): PARTLY AGREE

1. Measured? The parser check and the WARN plan are FACT (validate-protocol.ps1:243; PROPOSAL:54-57); the consequence is HYPOTHESIS.
2. Causal? Plausible chain, untested.
3. Necessary? The chosen capability boundary is intentional; whether a WARN suffices is the open policy DBI-24.
4. Simpler sufficient? Keep the ASCII scan unconditional (it is: validate-protocol.ps1:237-240; DEC-0001) and keep a Windows CI lane (.github/workflows/protocol.yml uses windows-latest; round1/A-contract-tcb.md:82 H-4).
5. Decision settles it? No — the no-PowerShell required-check policy is open (DBI-24; round1/B-performance-migration.md:184).
6. Reopens a decision? No.
7. Semantic behaviour lost? The parser check is not run; the byte/ASCII check remains.
8. Silent failure? Not "silent": PROPOSAL:54-57 and A's rule say the absence emits a named WARN that is never a PASS (round1/A-contract-tcb.md:153-155).
9. Differential sufficient? n/a.
10. Shared wrong assumption? Yes, but it is environment incompleteness, handled by A's matrix (round1/A-contract-tcb.md:143-155).
11. Rollback possible? n/a.
12. Integration risk? n/a.
13. Owner asked something machines can settle? Set the no-PowerShell required-check policy first (round1/B-performance-migration.md:184); only a residual policy gap reaches the owner.
14. Model decides owner-only matter? Declaring a WARN-only cloud record acceptable Evidence is policy; not C's to settle.
15. Falsifier? A no-PowerShell fixture with a broken .ps1 that still exits 0 on required checks.

## P6 — "A complete Node rewrite is over-engineered; tests could just be parallelised" (round1/C-adversarial-simplifier.md:30-31): DISAGREE

1. Measured? The pain is measured (M-11); "over-engineered" is a cost/value judgement with no measured migration cost.
2. Causal? Correlation only: latency pain does not imply migration need, nor its absence.
3. Necessary? Migration is required by DBI-01/0025 item 5; test parallelism is required by no decision.
4. Simpler sufficient? For latency only; it leaves cloud Evidence, hand-parity and duplication untouched (PROPOSAL:26-30).
5. Decision settles it? PROTO-DEC-0025 item 5 and PROTO-DEC-0039 item 3 settle the destination.
6. Reopens a decision? Yes — "over-engineered" implies not doing a decided migration, i.e. DBI-01/DBI-42 (F) without a trigger row.
7. Semantic behaviour lost? n/a.
8. Silent failure? n/a.
9. Differential sufficient? n/a.
10. Shared wrong assumption? n/a.
11. Rollback possible? n/a.
12. Integration risk? n/a.
13. Owner asked something machines can settle? No.
14. Model decides owner-only matter? Yes if the conclusion were acted on: halting a scheduled migration is an owner decision (DBI-42 F).
15. Falsifier? If owner §13 cloud Evidence and the TCB/duplication drivers are judged out of scope — but owner §0 and §13 keep them in.

## P7 — "The PowerShell parser check must remain a PowerShell subprocess; .ps1 stay ASCII-only" (round1/C-adversarial-simplifier.md:33-34): AGREE

1. Measured? FACT: validate-protocol.ps1:243 (native parser); :237-240 (ASCII scan).
2. Causal? Yes — only PowerShell's own grammar parses PowerShell (round1/A-contract-tcb.md:127).
3. Necessary? Yes, and it survives the port.
4. Simpler sufficient? No simpler path; a Node reimplementation adds a new TCB (round1/A-contract-tcb.md:127).
5. Decision settles it? PROPOSAL:54-57 and A boundary item 1; DEC-0001 for ASCII-only.
6. Reopens a decision? No.
7. Semantic behaviour lost? None; these are the retained semantics.
8. Silent failure? Only if dropped silently; A's named-WARN rule prevents that.
9. Differential sufficient? n/a.
10. Shared wrong assumption? n/a.
11. Rollback possible? n/a.
12. Integration risk? n/a.
13. Owner asked something machines can settle? No.
14. Model decides owner-only matter? No.
15. Falsifier? A Node parser proven grammar-exact and certified; C offers no such evidence and A rejects the idea as brittle.

## P8 — "Common-mode failure: both suites use the Node runner and the 120 s spawnSync timeout, so CPU saturation can cause timeouts" (round1/C-adversarial-simplifier.md:36-39): PARTLY AGREE

1. Measured? FACT for the timeout (tests/helpers.cjs:10-15) and load (M-15); timeout-caused failure under load is HYPOTHESIS.
2. Causal? Plausible from M-15, but M-14 shows three concurrent suites passed 376/376 with no timeout (round1/B-performance-migration.md:68), which weakens it.
3. Necessary? Bounded concurrency is already the rule (COMMON §5; owner §6), so no new change is needed.
4. Simpler sufficient? Run one suite at a time and keep the timeout; no port required.
5. Decision settles it? COMMON §5 and PROTO-DEC-0071 already serialise expensive runs (round1/B-performance-migration.md:155).
6. Reopens a decision? No.
7. Semantic behaviour lost? n/a.
8. Silent failure? A timeout can look like a logic failure or flake; B flags this too (round1/B-performance-migration.md:186).
9. Differential sufficient? n/a — harness failure is outside parity.
10. Shared wrong assumption? Yes, exactly §23 q10; A's paired-cycle drift evidence (round1/A-contract-tcb.md:32-35) is stronger than C's conjecture.
11. Rollback possible? n/a.
12. Integration risk? n/a.
13. Owner asked something machines can settle? No.
14. Model decides owner-only matter? No.
15. Falsifier? Reproduce a timeout at <=3 concurrent suites; M-14's 376/376 result presently refuses it.

## Cross-zone contradictions (recorded, not resolved)

- round1/C-adversarial-simplifier.md:13 (migration now unnecessary) vs round1/A-contract-tcb.md:25 / round1/DECISION-BOUNDARY.md:25-26 (DBI-01 is class A; only timing DBI-02 is open). Also vs round1/B-performance-migration.md:19 (recommends B, conditional on timing).
- round1/C-adversarial-simplifier.md:31 (rewrite over-engineered) vs round1/B-performance-migration.md:19,89 (B is the recommended architecture) and vs DBI-01.
- round1/C-adversarial-simplifier.md:17 (<120 s) vs round1/B-performance-migration.md:78 (94 s is an optimistic model, not a promise).
- round1/C-adversarial-simplifier.md:37 ("both engines rely on ... spawnSync") is imprecise: the old engine is PowerShell; the shared dependency is the Node test harness + helpers timeout (tests/helpers.cjs:10-15), not the engines.
- round1/NOT-IN-SCOPE.md:29 (Rust: NEVER / NO EVIDENCE) vs round1/DECISION-BOUNDARY.md:27,52 (another engine is class F, reopen-required with an owner trigger, not never).
- round1/NOT-IN-SCOPE.md:14 ("installer rarely run, 86 calls") vs M-07 (86 calls and 95.9 s in a single suite) and round1/B-performance-migration.md:59 (~8-14% of measured cost); the LATER disposition may hold, the "rarely run" reason does not.
- round1/NOT-IN-SCOPE.md:22 attributes "process liveness extraction" to PROTO-DEC-0039 item 3; that item names the `isProcessAlive` require-cycle leaf module (.ai/DECISIONS.md:1709), not the research launcher's `Get-CimInstance` table. LATER may still be right; the cited authority is not.

## Overall verdict on zone C

Zone C is strongest where it repeats already-mapped ground (P7 agrees with A's platform boundary; P4/P5/P8 restate A's common-mode and cloud risks, but with weaker evidence and a wrong description of A's normalizer). Its two falsification attempts aimed at stopping or discouraging the migration (P1, P6) do not survive the decision boundary: the Node destination is DBI-01 class A, only timing is open, and its own simpler option is already PROPOSAL option B. Its quantitative claim (P2) is explicitly a HYPOTHESIS, and B's own arithmetic caps it at ~94 s, not a delivered <120 s. No part of zone C supplies a reproduction that reopens a decision; the durable value is the test-split recommendation and the shared timeout risk, both already present in B (round1/B-performance-migration.md:49,78,186).

Nothing here is a decision or certification; it is an advisory challenge for round 2 synthesis (PROTO-DEC-0052 item 4).
