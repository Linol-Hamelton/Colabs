# {Model / Council} - {Analysis Title}

**Date**: YYYY-MM-DD  
**Reviewed commit**: <git rev-parse HEAD>  
**Working tree**: clean / dirty  
**Reviewer**: <model name>  
**Scope**: [audit | council | architecture | consensus | security | edge-cases]  
**Verdict**: [PASS | FAIL | BLOCKED | RECOMMENDATION]  
**Mode**: CERTIFYING | ADVISORY  
**Receipt-Owner**: <owner id>  
**Receipt**: <path or digest>  

<!-- Mode explanation:
- CERTIFYING: Requires all four capabilities: FS_WRITE, SHELL_EXEC, EVIDENCE_SIGN, REPO_READ.
  Capability is set by the orchestrator profile, never self-declared. Requires Receipt-Owner (<owner id> of
  the session journal) and binds the review to verifiable handoff evidence (Session: is accepted as a legacy fallback).
- ADVISORY: Applied when any capability is missing (read-only models, chat interfaces, external audits).
  Advisory outputs carry [MODE: READ-ONLY ADVISORY] and are persisted via the section 5.5 transcription fallback,
  always explicitly marked non-certifying. An advisory review cannot satisfy the completion gate.
-->

<!-- If transcribed from chat or web panel without direct filesystem access: -->
<!-- > Transcribed from chat by <owner/agent>, model: <name>, date: YYYY-MM-DDTHH:MM:SSZ -->

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

## Findings

| Id | Severity | Title | Location | Impact | Status |
|---|---|---|---|---|---|
| F-001 | CRITICAL / HIGH / MEDIUM / LOW | Short Title | `path/to/file:line` | Description | Open / Resolved |

### F-001 - [SEVERITY] - Title

- **Location**: `path/to/file:line`
- **Confidence**: [High | Medium | Low]
- **Reproduction**:
  ```bash
  # Concrete command or test script reproducing the issue
  ```
- **Impact**: Detailed explanation of consequence, vulnerability, or edge-case failure.
- **Recommendation / Proposed Fix**:
  ```javascript
  // Suggested patch or algorithm change
  ```

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
