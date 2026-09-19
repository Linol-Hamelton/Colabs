# Mistral Vibe - v1.9.5 Release Certification

**Date**: 2026-09-19  
**Reviewed commit**: bd56d6cad7d507977355af7e38bade3b88b037bd  
**Working tree**: clean  
**Reviewer**: Mistral Vibe (mistral-medium-3.5)  
**Scope**: whole-scope mandatory adversarial certification for v1.9.5 release candidate  
**Verdict**: FAIL  
**Mode**: CERTIFYING  
**Receipt-Owner**: mistral-vibe  
**Receipt**:  

<!-- Mode explanation:
- CERTIFYING: Requires all four capabilities: FS_WRITE, SHELL_EXEC, EVIDENCE_SIGN, REPO_READ.
  Capability is set by the orchestrator profile, never self-declared. Requires Receipt-Owner (<owner id> of
  the session journal) and binds the review to verifiable handoff evidence (Session: is accepted as a legacy fallback).
- ADVISORY: Applied when any capability is missing (read-only models, chat interfaces, external audits).
  Advisory outputs carry [MODE: READ-ONLY ADVISORY] and are persisted via the AGENTS.md section 5.5 transcription fallback,
  always explicitly marked non-certifying. An advisory review cannot satisfy the completion gate.
-->

---

## Executive Summary

v1.9.5 release candidate implements the five remediation items (A1 C0 liveness, A2 record/cap, A3 gate-check, A4 capability, A5+B registry) per PROTO-DEC-0029..0033. Whole-scope adversarial testing revealed **one CRITICAL defect** in the C0 liveness implementation: `prune` does not preserve empty journals when `liveness === null` due to missing state files or foreign hosts with aged timestamps (> 15 min). This violates PROTO-DEC-0029 A1.2 which mandates preserve for null liveness regardless of recency. All other tested mechanisms (A2 record fix, A3 gate-check, A4 capability discipline, B registry) passed. The critical liveness defect **blocks** the v1.9.5 release until remediated.

---

## Scope and Evidence

- **Baseline Commit**: `bd56d6cad7d507977355af7e38bade3b88b037bd` (HEAD == bd56d6c)
- **Tag Baseline**: `v1.9.4` -> `c71bdcf`
- **Working Tree State**: clean (tested in isolated clone at `/c/Users/Dmitry/AppData/Local/Temp/v195-cert-test`)
- **Commands & Tests Executed**:
  - Liveness matrix tests (scenarios 1, 2, 6 from A1.6)
  - Three-way polarity tests (foreign host, missing state, force flags)
  - A2 record fix tests (140-line journal, oversized entry)
  - A3 gate-check tests (missing fields, ADVISORY mode, transcribed, legacy)
  - Bootstrap tests (record on completed task, verify --deep)
  - B registry tests (row removal, unknown id, deletion)
- **Environment**: Windows 10/11, Node.js v22.21.0, PowerShell 5.1+, Git 2.x

---

## Findings

| Id | Severity | Title | Location | Impact | Status |
|---|---|---|---|---|---|
| F-001 | CRITICAL | Liveness null case: missing state + aged files not preserved by prune | `protocol-session.cjs:207,218` | Violates PROTO-DEC-0029 A1.2; empty journals with null liveness and aged mtime are quarantined instead of preserved | Open |

### F-001 - [CRITICAL] - Liveness null case: missing state + aged files not preserved

- **Location**: `.ai/bin/protocol-session.cjs:207,218`
- **Confidence**: High
- **Reproduction**:
  ```bash
  # In a test directory with protocol-session.cjs from bd56d6c:
  
  # 1. Create empty journal and aged state file (>15 min old)
  mkdir -p .ai/worklog .ai/runtime
  touch .ai/worklog/test-session.md
  node -e "
    const fs = require('fs');
    const os = require('os');
    const state = {
      hostname: os.hostname(),
      supervisorPid: 999999,
      pid: 888888,
      sessionPid: 888888,
      nonce: 'test'
    };
    fs.writeFileSync('.ai/runtime/test-session.json', JSON.stringify(state));
  "
  # Age files to >15 minutes ago
  touch -d "16 minutes ago" .ai/worklog/test-session.md .ai/runtime/test-session.json
  
  # 2. Delete state file to simulate missing state (hasState = false)
  rm .ai/runtime/test-session.json
  
  # 3. Run prune without --force
  node .ai/bin/protocol-session.cjs prune --agent test-session
  
  # ACTUAL RESULT: quarantined test-session.md
  # EXPECTED: skipping test-session.md (unknown liveness or foreign host)
  # VERDICT: FAIL
  ```
- **Impact**: 
  The three-way liveness contract (PROTO-DEC-0029) mandates that `prune` with `liveness === null` must **preserve** empty journals. The current code computes `liveness = hasState ? isSessionAlive(state) : null` on line 207, making `liveness === null` when `hasState === false`. However, line 218 checks `if (hasState && liveness === null)` which evaluates to `false` when `hasState === false`, causing the code to skip the null-preservation branch and proceed to quarantine aged files. This allows aged empty journals from foreign hosts or with missing state files to be quarantined, violating the specification.
- **Recommendation / Proposed Fix**:
  Change line 218 from:
  ```javascript
  if (hasState && liveness === null) {
  ```
  to:
  ```javascript
  if (liveness === null) {
  ```
  Also change line 232 from:
  ```javascript
  if (hasState && liveness === null) {
  ```
  to:
  ```javascript
  if (liveness === null) {
  ```
  This ensures that any null liveness result (whether from foreign host, missing state, or corrupted state) triggers the preserve behavior for `prune` and the quarantine warning for `cleanup-runtime --force` as specified in A1.2.

---

## Deep Dives

### C0 Session Liveness Implementation

The PROTO-DEC-0029 liveness model introduces a supervisor-first three-way contract with recency fallback. Testing confirmed:
- Supervisor-alive scenarios correctly preserve artifacts (Scenario 1 passed)
- The null-liveness preservation is **broken** when `hasState === false` due to a logic error in the polarity checks
- Recency fallback (< 15 min) works correctly for aged files
- Force semantics: `prune --force` with foreign host may quarantine per A1.6 line 9 (working as specified)

The defect stems from conflating "null liveness" (a semantic state) with "hasState" (a file-existence check). Per the decision, null liveness should trigger preserve regardless of how it arose; the current gate on `hasState` violates this principle.

### A2 Journal Cap and Record Fix

The A2 remediation (PROTO-DEC-0031) adds auto-archiving before Evidence attachment and validates entry size. Testing confirmed:
- Journals at ~140 lines remain <= 150 after `record` (auto-archive works)
- Oversized entries (> 150 lines after Evidence) fail with actionable error and leave journal byte-identical
- The fix addresses the observed mistral-vibe journal overflow (fact 11 in the plan)

### A3 Gate-Check Implementation

The `gate-check` subcommand (PROTO-DEC-0032) validates completion gate bindings. All test cases passed:
- Missing Receipt-Owner on new review (Date > 2026-09-19): FAIL ✓
- Mode: ADVISORY: FAIL ✓
- Transcribed reviews: FAIL ✓
- Legacy reviews (Date <= 2026-09-19): WARN only, pass ✓
- Valid CERTIFYING review with journal binding: PASS ✓

### A4 Capability Discipline

PROTO-DEC-0031 formalizes certifying vs advisory modes. The implementation correctly:
- Requires FS_WRITE, SHELL_EXEC, EVIDENCE_SIGN, REPO_READ for CERTIFYING mode
- Rejects advisory reviews for gate satisfaction
- Mandates reproduction for FAIL/BLOCKED verdicts

### B Registry Validation

PROTO-DEC-0033 implements WARN-first registry checks. Testing showed:
- Removing a registry row: WARN ✓
- Adding unknown decision ID: WARN ✓
- Deleting the registry: WARN ✓
- Committed rows remain immutable ✓

---

## Alternatives Considered & Trade-offs

| Alternative | Description | Rejection Rationale |
|---|---|---|
| Keep hasState check | Preserve only when state file exists | Violates PROTO-DEC-0029 which treats null liveness uniformly regardless of cause |
| Make recency window cover null liveness | Always preserve null liveness regardless of age | Conflicts with A1.3 which explicitly scopes recency to empty journals and snapshots |
| Add hasState to decision text | Document the current behavior | Creates a hidden dependency not stated in the decision |

The chosen fix (removing the `hasState` guard) aligns the code with the decision text: null liveness means preserve, full stop.

---

## Recommendations & Actionable Plan

1. **BLOCKER**: Fix F-001 in `protocol-session.cjs` lines 218 and 232 by removing the `hasState &&` condition
2. **REQUIRED**: Re-run the full A1.6 test matrix (11 branches) after the fix
3. **RECOMMENDED**: Add explicit regression test for prune with missing state file and aged timestamp
4. **OPTIONAL**: Consider adding a linter rule to catch `hasState && liveness === null` patterns that conflict with decision semantics

---

## References

- **Decisions**: `PROTO-DEC-0029` (liveness model), `PROTO-DEC-0030` (approval provenance), `PROTO-DEC-0031` (capability discipline), `PROTO-DEC-0032` (gate-check), `PROTO-DEC-0033` (registry)
- **Active task**: `.ai/TASK.md`
- **Session journal**: `.ai/worklog/mistral-vibe-....md` (this session)
- **Related reviews**: All DeepSeek per-item audits in `docs/reviews/2026-09-19-deepseek-flash-*.md`
- **Prompt**: `docs/reviews/2026-09-19-final-v1.9.5-adversarial-review-prompt.md`
- **Plan**: `docs/reviews/2026-09-19-deepseek-flash-consolidated-v1.9.5-plan-r2.md`
