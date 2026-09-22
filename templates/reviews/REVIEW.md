# {Model / Council} - {Analysis Title}

**Date**: YYYY-MM-DD  
**Reviewed commit**: <git rev-parse HEAD>  
**Working tree**: clean / dirty  
**Reviewer**: <model name>  
**Scope**: [audit | council | architecture | consensus | security | edge-cases]  
**scope-check**: [PASS | FAIL]  
**Verdict**: [PASS | RECOMMENDATION | FAIL | BLOCKED]  
**Mode**: CERTIFYING | ADVISORY  
**Receipt-Owner**: <owner id>  
**Receipt**: <path or digest>  

<!-- Verdict vocabulary (PROTO-DEC-0041, forward-only for Date > 2026-09-20):
- Exactly one token: PASS | RECOMMENDATION | FAIL | BLOCKED
- Explanations belong in the body, never appended to the verdict token.
- Conditional outcomes are FAIL with explicit conditions in the body.
- Mandatory open defect -> FAIL.
- Missing required check or capability -> BLOCKED.
- RECOMMENDATION covers only optional improvements.
- PASS only when zero mandatory defects remain unresolved.
- Grandfathering: Historical reviews (Date <= 2026-09-20) keep historical forms (56/115 matched closed set; 59/115 deviated across 57 forms).
-->

<!-- Mode explanation:
- CERTIFYING: Requires all four capabilities: FS_WRITE, SHELL_EXEC, EVIDENCE_SIGN, REPO_READ.
  Capability is set by the orchestrator profile, never self-declared. Requires Receipt-Owner (<owner id> of
  the session journal) and binds the review to verifiable handoff evidence (Session: is accepted as a legacy fallback).
- ADVISORY: Applied when any capability is missing (read-only models, chat interfaces, external audits).
  Advisory outputs carry [MODE: READ-ONLY ADVISORY] and are persisted per section 5.5 non-certifying rules.
  Chat-supplied content is not accepted as an independent review; the review must be produced by the
  named reviewer with repository access.
-->

---

## Executive Summary

[1-3 sentences summarizing the key finding, verdict, and release-blocking recommendations.]

---

## Scope and Evidence

- **Baseline Commit**: `<sha>`
- **Working Tree State**: `clean` / `dirty`
- **Commands & Tests Executed**:
  - `powershell -ExecutionPolicy Bypass -File .\validate-protocol.ps1`
  - `powershell -ExecutionPolicy Bypass -File .\test-protocol.ps1`
  - `node .ai/bin/protocol.cjs doctor`
- **Environment**: OS version, Node.js version, PowerShell version.

---

## Findings Ledger (PROTO-DEC-0041)

| ID | Requirement | Candidate | Reproduction | Actual Result | Severity | Disposition | Proof of Closure |
|---|---|---|---|---|---|---|---|
| F-001 | Requirement or invariant violated | Candidate commit/diff | Concrete command/test | Actual observed behavior | HIGH / MEDIUM / LOW / INFO | confirmed / refuted / fixed-and-verified / deferred-by-owner / unresolved | Path/test confirming resolution |

<!-- Severity Rubric (PROTO-DEC-0041):
- HIGH: Violated recorded invariant, bypassed gate, lost data/evidence -> BLOCKS (FAIL).
- MEDIUM: Violated contract or documented behavior without gate bypass -> BLOCKS on protected paths; otherwise backlog.
- LOW: Documentation-to-behavior divergence, test coverage gap -> Backlog.
- INFO: Observation, state drift, not candidate defect.
Objective Blocking Rule: Any reproduced defect violating an invariant/contract or lying on a protected path blocks regardless of reviewer severity label; verdict is FAIL and cannot be lowered to RECOMMENDATION.
-->

### F-001 - [SEVERITY] - Title

- **Requirement**: Concrete requirement, contract, or invariant violated.
- **Location**: `path/to/file:line`
- **Confidence**: [High | Medium | Low]
- **Reproduction**:
  ```bash
  # Concrete command or test script reproducing the issue
  ```
- **Actual Result**: Detailed explanation of consequence, vulnerability, or edge-case failure.
- **Disposition**: `confirmed` | `refuted` | `fixed-and-verified` | `deferred-by-owner` | `unresolved`
- **Recommendation / Proposed Fix**:
  ```javascript
  // Suggested patch or algorithm change
  ```
- **Proof of Closure**: Command or test verifying the fix.

---

## Deep Dives

### [Topic / Scenario 1]

[Detailed analysis, probe scenarios, edge-case failure matrix, mathematical or cryptographic proofs, architectural trade-offs.]

### [Topic / Scenario 2]

[Further technical elaboration.]

---

## Alternatives Considered & Trade-offs

- **Alternative A**: [Description] - **Rejected because**: [Concrete rationale]
- **Alternative B**: [Description] - **Rejected because**: [Concrete rationale]

---

## Recommendations & Actionable Plan

1. [Step 1: Concrete action]
2. [Step 2: Concrete action]
3. [Step 3: Concrete action]

---

## References

- Decision blocks: `PROTO-DEC-xxxx` in `.ai/DECISIONS.md`
- Active task: `.ai/TASK.md`
- Associated session journal: `.ai/worklog/<agent>-<id>.md`
- Related reviews: `docs/reviews/YYYY-MM-DD-<agent>-<topic>.md`
