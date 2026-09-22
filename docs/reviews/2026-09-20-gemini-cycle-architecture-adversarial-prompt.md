# Unified Adversarial Audit Prompt: Cycle Architecture (B1-B8, PROTO-DEC-0041)

- **Date**: 2026-09-20
- **Author**: Gemini (implementer, session `gemini-927b6b871251a111`)
- **Controller / Coordinator**: DeepSeek
- **Target Certifying Reviewers**: Claude (standing default certifier) and Codex (escalation certifier)
- **Mode**: CERTIFYING (independent final audit outside execution and control, per PROTO-DEC-0041 items 1 & 2)
- **Reference State**: Baseline `d38d2f2ae4b4c17fe6c2c18f11215cedb2f10eb1`, working tree dirty
- **Scope**: Documentation and templates only (`.ai/docs/PROTOCOL.md`, `.ai/docs/PAIRED-CYCLE.md`, `templates/reviews/REVIEW.md`, `.ai/TASK.md`)

## 1. Context and Architectural Background
Following PROTO-DEC-0041 and the owner-approved Cycle Architecture Policy in `.ai/PLAN.md`, this implementation aligns protocol specifications and templates with empirical research and corrected historical data (`docs/research/2026-09-20-cycle-architecture/claude-final-decision.md`):
- Kaesberg et al. (ACL Findings 2025): more agents improve performance, more discussion rounds before voting reduce it.
- Porter (88 inspections): 1 reviewer is less effective than 2, but 2 are no less effective than 4; sequential passes double calendar time without efficacy gains.
- Core principle: **pay for width (parallel independent review), not for depth (repetitive discussion rounds)**.
- Historical defect analysis: paired-cycle cohort exhibited 7/7 identical defect detection across all 3 reviewers; verdict split arose purely from calibration divergence on severity (Phase 3 gate bypass).

## 2. Summary of Implemented Changes (Blocks B1–B8)
- **B1 (Terms & 7 Phases)**: Added closed dictionary (Phase, Primary pass, Discussion round, Remediation, Independence, Defect, Uncertainty, Verification version). Defined 7 phases (0 Frame, 1 Diagnosis, 1a External research [conditional], 2 Solution, 3 Plan & adversarial review, 4 Implementation done-checked, 5 Final adversarial audit, 6 Closure & backlog) with explicit outputs and transition gates. Established one primary pass per phase with repetition strictly bounded to 4 triggers. Mapped owner's 12 stages.
- **B2 (Composition & Independence Invariants)**: Defined risk-scaled staffing (low: 1; normal: 1 per block + integration; high: >= 2 parallel independent reviewers). Invariants: certification independence; Controller != certifier (resolves DeepSeek-as-interface); mandatory parallelism (identical input, concurrent work, no peek before submission); distinct attack angles; no brand trust; 5th voice restricted to 3 objective triggers.
- **B3 (Severity Rubric & Objective Blocking Rule)**: Added rule that any reproduced defect violating an invariant/contract or lying on a protected path blocks automatically (verdict FAIL, no downgrade to RECOMMENDATION). Included severity rubric table and paired-cycle cohort case example.
- **B4 (Closed Verdict Vocabulary, Forward Only)**: Exactly one token (`PASS | RECOMMENDATION | FAIL | BLOCKED`) for reviews with Date > 2026-09-20. Grandfathered historical forms for Date <= 2026-09-20 (recorded scale: 56/115 compliant, 59/115 non-compliant across 57 forms). Preserved existing gate code; verified filled template passes gate-check in temp fixture.
- **B5 (Blocks, Findings Ledger, Symmetry of Evidence)**: Defined block by contract and rollback boundary. Mandated that shared PS/Node contracts must never be split. Defined findings ledger format and 5 disposition values. Established symmetry of evidence for refutations.
- **B6 (Access Authorization & Change Legitimization)**: Defined tiers T0-T4, BARC record, and 5 change legitimization criteria. Explicitly designated scope and forbidden path verification as a manual reviewer duty (`scope-check: PASS|FAIL` in ledger), promising no automated gate during feature freeze.
- **B7 (Anti-Idle Execution Rules)**: Articulated all 10 anti-idle rules preventing process thrashing and token waste.
- **B8 (TASK State & Reconciliation)**: Maintained PROTO-DEC-0041 and PLAN policy immutability; updated TASK state under shared lock; 0 validator warnings.

### Remediation Round Updates (F1, F-001..F-004)
- **F1 (REVIEW.md Comments)**: Rewrote instructional comments in `templates/reviews/REVIEW.md` so no emitted artifact trips the transcription detector when comments are retained (removed "transcription fallback" and chat example).
- **F-001 (Third Reviewer Rule Alignment)**: Aligned rule in `PROTOCOL.md` and `PAIRED-CYCLE.md` strictly with PROTO-DEC-0041 item 2: third reviewer added only for an uncovered risk, contradicting reproductions, or an explicit owner directive. Removed "fifth participant" framing and capability trigger.
- **F-003 (High-Risk Minimum-Two Certifiers Rule)**: Added binding rule to `AGENTS.md` section 2 and both completion gate sections (`PROTOCOL.md`, `PAIRED-CYCLE.md`): final check of a high-risk candidate requires >= 2 parallel independent certifiers, single reviewer cannot close high-risk Completed task, certifiers outside execution and control.
- **F-004 (Forbidden-Path Legitimacy Check)**: Removed self-authorizing caveat ("unless the block explicitly targets it under a high-risk dispatch") in `PROTOCOL.md`, aligning with PLAN policy.
- **F-002 (Dispatch Criterion 4 Correction)**: Replaced unattainable git diff baseline criterion in dispatch with measurable check verified by Codex (UTC mtimes and 40 protected files zero-change check).

## 3. Verification Commands
- Health check: `powershell -ExecutionPolicy Bypass -File .\validate-protocol.ps1` (0 warnings).
- Regression suite: `powershell -ExecutionPolicy Bypass -File .\test-protocol.ps1` (>= 300 passing tests, 0 failures).
- Template gate-check verification: execute scratch test `verify-review-template.cjs` in disposable temp fixture.
- Probe suite: `node .ai/runtime/cycle-arch-probe.cjs` (X1-X4 = 1/0/0/1, labels OK).

## 4. Adversarial Challenge Questions
1. **Governance & Fidelity**: Does any statement in `.ai/docs/PROTOCOL.md` or `.ai/docs/PAIRED-CYCLE.md` contradict PROTO-DEC-0041 or the PLAN policy? Are binding rules cleanly distinguished from reversible PLAN-level policy?
2. **Certification Independence**: Does the specification strictly prevent the coordinator/controller (DeepSeek) or implementer (Gemini) from issuing a `CERTIFYING` verdict on this candidate, requiring parallel review by Claude and Codex?
3. **Objective Blocking & Calibration**: Can a reviewer downgrade an invariant violation or a defect on a protected path to `RECOMMENDATION`? Does the text prevent another split verdict on gate bypasses?
4. **Shared Contract Invariant**: Is the prohibition against splitting shared PowerShell and Node contracts absolute, preventing recurrences of C40-04 and C40-06?
5. **Freeze & Scope Discipline**: Is the `scope-check: PASS|FAIL` check clearly identified as a manual reviewer duty without falsely implying new kernel gate automation during PROTO-DEC-0039 freeze?
6. **Backward Compatibility & Gate Freshness**: Does `templates/reviews/REVIEW.md` produce verifiable artifacts that pass existing `gate-check` without tripping transcription filters or breaking historical reviews (`Date <= 2026-09-20`)?
7. **Completeness of Anti-Idle Guardrails**: Are all 10 anti-idle rules faithfully documented and actionable?
8. **Remediation Precision**: Are F1 and F-001..F-004 closed cleanly in documentation without touching kernel, gates, decisions, or history? Does the high-risk minimum-two rule bind across AGENTS.md and both completion gate sections?
