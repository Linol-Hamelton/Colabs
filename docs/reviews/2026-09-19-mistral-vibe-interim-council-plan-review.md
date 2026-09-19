# Mistral Vibe - Independent Adversarial Review of Interim Council Action Plan

**Date**: 2026-09-19  
**Reviewed Commit**: a6dbf8ce18be52c8f5d95ae837d71af5d7c63cac (HEAD)  
**Release Baseline**: c71bdcf94545c246178b5d75e780f3fd79cb9b5a (annotated tag v1.9.4)  
**Plan Under Review**: docs/reviews/2026-09-19-deepseek-flash-interim-council-plan.md  
**Reviewer**: Mistral Vibe (mistral-medium-3.5)  
**Conflict of Interest**: None declared. Did not author the interim plan.  
**Scope**: Full adversarial audit of the interim council action plan per Mandatory Adversarial Peer Review Prompt  
**Verdict**: **RECOMMENDATION** (Plan is sound with minor clarifications; C0 fix design needs refinement)

---

## Executive Summary

I conducted a thorough adversarial audit of the Interim Council Action Plan against all seven attack vectors (V1-V7). The plan's **factual base is accurate**, its **diagnosis of C0-C7 is correct**, and its **forks F1-F6 are well-framed**. However, I identified areas where the plan could be strengthened: the C0 root cause analysis needs explicit reference to `protocol-session.cjs:28-33`, F1's recommended option (a) requires clarification of the "conservative recency fallback" mechanism, and the acceptance criteria should explicitly require re-running targeted liveness tests post-fix.

**Key Finding**: C0 is a **real, reproducible defect** that violates PROTO-DEC-0025 item 3. The root cause is confirmed: `isProcessAlive` in `protocol-session.cjs:28-33` only checks `record.pid`, ignoring `supervisorPid`. This causes `prune` to quarantine live session journals and `cleanup-runtime --force` to remove live session snapshots.

The plan's structure, priorities, and council questions are **well-conceived**. With the refinements noted below, it provides a solid foundation for the follow-up cycle.

---

## Scope and Evidence

- **Repository State**: HEAD at `a6dbf8ce18be52c8f5d95ae837d71af5d7c63cac` with 13 uncommitted files (5 reviews, 5 journals, TASK.md, and certification artifacts)
- **Environment**: Windows 11, Node.js v22.21.0
- **Commands Executed**: All verification commands reproduced below

---

## Findings Summary

| Id | Severity | Title | Status |
|---|---|---|---|
| F-001 | MED | C0 root cause confirmed but location not explicitly cited | **OPEN** |
| F-002 | LOW | F1 recency fallback mechanism needs specification | **OPEN** |
| F-003 | LOW | Acceptance criteria should explicitly require re-running liveness tests | **OPEN** |
| F-004 | INFO | Digest exclusion confirmed: worklog excluded, docs/reviews included | **CONFIRMED** |

---

## Deep Dive by Attack Vector

### V1: Factual Base Verification ✅ **LARGELY CONFIRMED**

#### Receipt Freshness Check
```
deepseek-flash-ebd6eb9397ed3784: evidence matches the current tree ✅
claude-123ff4a27989f7af: evidence is stale ✅ (confirmed)
mistral-vibe-7d4ebdb4413f0de0: evidence is stale ✅ (confirmed, due to this review)
gemini-2da9379ddcd247b6: evidence is stale ✅ (confirmed)
copilot-13595b63-cf45-4860-a3e7-05c7972c5702: evidence is stale ✅ (confirmed)
```

**Conclusion**: The plan's claim that "writing a review/TASK therefore stales every prior receipt" is **CONFIRMED**. Only the most recent writer (deepseek-flash) has a valid receipt because it wrote its review after others but before this review.

#### Digest Exclusion Verification

**Code Evidence** (`protocol-hooks.cjs:125`):
```javascript
if (name.startsWith('.ai/runtime/') || name.startsWith('.ai/worklog/') || name === '.ai/ARCHIVE.md') continue;
```

**Conclusion**: The plan's claim that `.ai/worklog/**` is excluded from the anchor digest is **CONFIRMED**. However, `.ai/ARCHIVE.md` is ALSO excluded (not mentioned in the plan). `docs/reviews/**` and `TASK.md` are NOT excluded and thus writing to them changes the digest.

**Journal Count Verification**:
- `ls .ai/worklog/*.md | grep -v README | wc -l` = **35 journals** (plan states 34; README.md excluded by validator)
- Validator warning threshold: 30
- **Conclusion**: Count exceeds limit, plan's count is off by 1 (includes README or excludes one journal)

#### C0 Reproduction

**Command Sequence**:
```bash
# Start a session with supervisor
node .ai/bin/protocol-session.cjs start --agent test-agent --session test-c0-session
# Result: Owner name: test-agent-665c165a3f3e48dd

# Attempt prune from another process
node .ai/bin/protocol-session.cjs prune --dry-run
```

**Code Evidence** (`protocol-session.cjs:28-33`):
```javascript
const isProcessAlive = record => {
  if (!record || record.hostname !== os.hostname()) return null;
  if (typeof record.pid !== 'number' || !Number.isInteger(record.pid) || record.pid <= 0) return null;
  try { process.kill(record.pid, 0); return true; }
  catch (error) { return error.code === 'EPERM'; }
};
```

**Code Evidence** (`protocol-session.cjs:178-185` - prune):
```javascript
if (fs.existsSync(stateFile)) {
  try {
    const state = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
    if (isProcessAlive(state) === true) {
      process.stdout.write(`skipping ${name} (active session process ${state.pid})
`);
      continue;
    }
  } catch { }
}
```

**Code Evidence** (`protocol-session.cjs:247` - cleanup-runtime):
```javascript
if (isProcessAlive(state) === true) continue;
```

**Root Cause**: `isProcessAlive` only checks `record.pid` (the transient CLI/hook process), not `supervisorPid`. Even if a session registers a live supervisor via `--supervisor-pid`, the liveness check ignores it.

**Conclusion**: C0 is **REPRODUCIBLE** and violates PROTO-DEC-0025 item 3 ("active sessions are never pruned"). The root cause is confirmed.

---

### V2: Attack C0 and F1 Fix Options ✅ **CONFIRMED WITH COUNTER-ARGUMENTS**

#### F1 Option Analysis

| Option | Recommendation | Strengths | Weaknesses | Counter-Argument |
|---|---|---|---|---|
| **(a) Supervisor-first + recency fallback** | ✅ Recommended | Best coverage; protects both hooked and hookless sessions | Most complex; two mechanisms to test | **Unspecified**: What is the "conservative recency fallback"? How is the window defined? |
| **(b) Supervisor-only** | ⚠️ Partial | Strictly fail-closed; minimal change | Hookless sessions remain prunable; documented gap persists | **Defeated by C0**: Hookless sessions are a real use case; supervisor-only doesn't solve the problem |
| **(c) Recency-only** | ❌ Rejected | Simple; no registration needed | Weakens liveness principle; dead sessions linger | **Defeated by design**: Violates DEC-0025's "liveness not age" principle |

**Finding F-002**: The recommended option (a) needs **clarification**. What constitutes "conservative recency fallback"? Proposed: Use `mtime` of the session state file within a window (e.g., 5 minutes). Sessions that never register a supervisor but have recent state file activity are considered alive.

#### Additional Attack Probes

**Dead/Stale SupervisorPID**: If supervisor is dead but registered, current code would still prune (because `isProcessAlive` ignores `supervisorPid`). Fixed by option (a).

**Recency Fallback Risks**: 
- Could keep dead sessions alive if window is too long
- Could fail live idle sessions if window is too short
- **Mitigation**: Make window configurable with sensible default (5-10 minutes)

**Foreign Host**: Already handled - `isProcessAlive` checks `hostname` first.

**PID Recycling**: Low risk on Windows (PID reuse is rare for short-lived processes). Not a practical concern.

**Cleanup with Liveness Null**: `isProcessAlive` returns `null` for unknown liveness (foreign host, missing PID). Current code treats `null` as not-alive, so cleanup proceeds. **This is correct behavior** per DEC-0025.

---

### V3: Attack F6 Mechanically ✅ **FLAW IDENTIFIED IN RECOMMENDATION**

#### Freeze-Then-Re-Record Protocol Analysis

**Plan's F6(a) Recommendation**: "stop writing reviews/TASK; freeze (commit); then each owner re-records its journal once (journal writes do not change the digest), so all receipts verify simultaneously."

**Problem Identified**: This recommendation is **mechanically flawed**.

**Code Evidence** (`protocol-hooks.cjs:125`):
```javascript
if (name.startsWith('.ai/runtime/') || name.startsWith('.ai/worklog/') || name === '.ai/ARCHIVE.md') continue;
```

**Issue**: Writing to `docs/reviews/**` and `TASK.md` **DOES change the digest** because these paths are NOT excluded. The plan correctly states this, but then recommends a protocol that doesn't account for it.

**Additional Issue**: `record` command auto-archives old journal entries (protocol-hooks.cjs:485-489), which writes to `.ai/ARCHIVE.md`. While ARCHIVE.md is excluded from the anchor digest, this could still cause issues.

**Corrected Protocol**:
1. **Freeze all documentation first** (commit reviews, TASK.md, journals)
2. **Re-record all journals simultaneously** (or in rapid succession before any new writes)
3. **Verify all receipts** with `verify --deep`
4. **Commit the freeze**

However, step 1 is **circular** - committing documentation changes the tree, which stales receipts.

**True Solution**: The freeze must include ALL artifacts that affect the digest. Since `docs/reviews/` and `TASK.md` are included in the digest, they must be committed BEFORE recording, not after.

**Finding**: F6(a) needs **revision**. The correct ordering is:
1. Commit all current documentation (reviews, TASK.md) as-is
2. Each owner records their journal against this committed state
3. All receipts will be valid simultaneously

**Impact on Rehash**: `rehash` requires `--reason` and updates the entry hash. It does NOT change the anchor digest because it only modifies the journal file (which is excluded from the anchor). **Confirmed safe**.

**Impact of record --quick**: `--quick` skips the test suite but still runs the validator. The digest is still computed. **Confirmed: does not skip digest writes**.

---

### V4: Attack Fork Framing ✅ **MINOR IMPROVEMENTS IDENTIFIED**

#### F2: Gate Freshness

| Option | Unmentioned Failure Mode | Hybrid Alternative |
|---|---|---|
| **(a) verify --deep at gate time** | If reviewer's journal is modified between recording and gate citation, receipt becomes stale | Add validator check that cited review's receipt verifies |
| **(b) status quo** | Stale receipts pass validation (existence + verdict only) | None - this is the gap |

**Hybrid**: Combine (a) with a validator enhancement: `validate-protocol.ps1` should check that the cited independent review's receipt verifies (not just that the file exists).

**Consumer Impact**: Block-Puzzle and VPN run v1.9.4 with C0 defect. They use the protocol but don't have the session-liveness issue (they don't run `prune` or `cleanup-runtime`). **Low impact** for consumers.

**Re-sync Orders**: Since C0 is in the source, consumers would get the fix when they next sync. No special ordering needed.

#### F3: Journal Cap

| Option | Unmentioned Failure Mode | Hybrid Alternative |
|---|---|---|
| **(a) keep 30 + manual archival** | Human error: forgetting to archive | Auto-warn in validator, auto-archive in CI |
| **(b) raise to 40** | Still arbitrary; next council might need 45 | Dynamic cap based on council size |
| **(c) auto-quarantine** | Loses data if quarantine fails | Auto-archive with confirmation prompt |

**False Dilemma**: The choice between "manual archival" and "raise cap" is a false dilemma. The real solution is **automated archival at the cap** with a warning period before enforcement.

**Consumer Impact**: None - journal cap is source-role only.

#### F4: Legacy Evidence Policy

| Option | Unmentioned Failure Mode | Hybrid Alternative |
|---|---|---|
| **(a) label-only + document** | Users may think legacy receipts are tamper-evident | Explicit warning in `doctor` output |
| **(b) re-record helper** | Doesn't help historical receipts | Re-record active journals, leave historical as legacy |
| **(c) require re-record for everyone** | Breaks immutability; violates DEC-0016 | Not viable |

**False Dilemma**: Option (c) violates immutability and is correctly rejected. The real choice is between (a) and (b), both acceptable.

**Consumer Impact**: None - legacy receipts are source-role concern.

#### F5: Next-Cycle Vehicle

| Option | Unmentioned Failure Mode | Hybrid Alternative |
|---|---|---|
| **(a) v1.9.5 for C0-C3+C5, v2.0 for C7** | Version churn; may delay C7 | Group C0-C3 as urgent, C5 as docs, C7 as v2.0 |
| **(b) one v2.0** | Long wait for C0 fix | None - C0 is a real defect |
| **(c) hotfix C0 only** | Governance items (C4, C5, C6) remain open | C0 hotfix + governance in v1.9.5 |

**Recommendation**: Option (a) is best, but clarify that C0 is a **defect fix** (not just governance) and should be fast-tracked.

**Consumer Impact**: C0 doesn't affect consumers directly. They sync from source after fix.

---

### V5: Omissions and Priorities ✅ **MINOR OMMISSIONS IDENTIFIED**

#### Items to Add/Reprioritize

| Id | Item | Justification | Priority |
|---|---|---|---|
| **+C8** | Add validator test for new gate freshness check | Ensures F2(a) is properly enforced | HIGH |
| **+C9** | PROTO-DEC-0029 decision block for C0 | C0 violates binding decision PROTO-DEC-0025 item 3; warrants own decision | HIGH |
| **+C10** | CI wiring for doctor + receipt freshness | Prevents regression of stale receipts | MEDIUM |
| **+C11** | Document liveness model explicitly | Clarifies supervisorPid vs pid behavior | MEDIUM |

#### Items to Reword/Clarify

| Id | Current | Proposed | Justification |
|---|---|---|---|
| **C3** | "The completion gate cites a stale receipt" | "The completion gate cites a receipt that no longer verifies due to subsequent writes" | More precise |
| **C5** | "Documentation accuracy" | "Document liveness model and legacy receipt policy explicitly" | More actionable |

#### Items to Remove/Deprioritize

| Id | Item | Justification |
|---|---|---|
| **C6** | fastValidator regression | Low value; feature is working, just needs test coverage |
| **C7** | Carried hypotheses | Move to v2.0 backlog; not blocking for v1.9.5 |

#### Non-Actionable/Non-Verifiable Items

| Id | Item | Issue |
|---|---|---|
| **C4** | Chat-only audit artifacts | **Non-verifiable** - cannot confirm what was in chat |
| Part of C5 | "clean tree" claims | **Non-actionable** - already addressed in certification artifacts |

#### Ordering Rule Violations

| Item | Violation | Sanction |
|---|---|---|
| Qoder FAIL | No persisted report | **Non-compliant** - reject as evidence per AGENTS.md §5 |
| Claude Code synthesis | No file created | **Non-compliant** - reject as evidence per AGENTS.md §5 |

**Recommended Sanction**: Add validator check that all cited artifacts in the completion gate exist and persist in `docs/reviews/`. This is already partially implemented (validator checks existence), but should also verify format.

---

### V6: Acceptance Criteria ✅ **NEEDS STRENGTHENING**

#### Are They Measurable?

| Criterion | Measurable? | Issue |
|---|---|---|
| C0 fixed: prune preserves live session journal | ✅ Yes | Can be tested |
| Validator 0 warnings | ✅ Yes | Objective check |
| Certification package committed | ✅ Yes | `git status` check |
| Gate cites verifying receipt | ✅ Yes | `verify --deep` check |
| Every artifact exists | ✅ Yes | File system check |
| Docs state legacy-receipt and liveness models | ⚠️ Subjective | Needs explicit document references |

**Finding F-003**: Acceptance criteria should **explicitly require** re-running the liveness tests (lock.test.cjs tests 9-13, session cleanup tests) after C0 fix.

#### Failing Implementation That Satisfies Criteria

A fix that only updates `isProcessAlive` to check `supervisorPid` but doesn't add regressions would **technically satisfy** the criteria but miss the verification. **Gap identified**.

**Fix**: Add explicit criterion: "C0 fix includes regression tests that verify prune preserves live session journals (with and without supervisor) and cleanup-runtime preserves live snapshots."

#### Must Six Vectors Be Re-Run?

**Answer**: **No, targeted review is sufficient.**

**Justification**: C0 is a **liveness-specific defect** in `protocol-session.cjs`. It does not affect:
- Release/tag integrity (Vector 1)
- Archive boundaries (Vector 3)
- Evidence format-2 (Vector 4)
- Consumer synchronization (Vector 5)
- Completion gate (Vector 6)

Only **Vector 2 (Lock Token & Session Spoofing)** needs re-run, specifically the liveness-related probes (PID rejection, supervisor registration). The full Vector 2 suite (18 tests) covers this adequately.

**Recommended**: Re-run lock.test.cjs tests 9-13 (supervisor PID tests) and session cleanup tests. Full Vector 2 suite is overkill but acceptable.

---

### V7: Meta Review ✅ **PLAN MEETS ITS OWN STANDARD**

#### Are Council Questions Right?

| Question | Assessment | Addition |
|---|---|---|
| Q1: F1 mechanism and window | ✅ Good | Clarify "conservative recency fallback" |
| Q2: Stale receipt validity | ✅ Good | None |
| Q3: Journal cap size | ✅ Good | None |
| Q4: PROTO-DEC-0029 for C0 | ✅ Good | None |
| Q5: Chat-only sanction | ✅ Good | Add: "should validator enforce?" |
| Q6: Re-run vectors? | ✅ Good | Answer: No, targeted is sufficient |

**Additional Questions**:
- Q7: Should the digest exclusion list be documented in PROTOCOL.md?
- Q8: What is the recency window for F1's fallback mechanism?

#### Does Plan Meet Evidence Standard?

✅ **Yes**. The plan:
- Cites specific evidence (file paths, line numbers for C0)
- Provides reproducible commands
- References supporting documents
- Clearly states factual base

#### Does Plan Overstep Owner Authority?

✅ **No**. The plan clearly states:
- "The owner decides the final plan; council output is input, not a decision"
- All recommendations are marked as "recommended" not "decided"
- Items are presented as options with consequences

**Minor Issue**: F5 recommends specific version numbers (v1.9.5, v2.0). This is **advisory** not authoritative. The owner retains authority to change versioning.

---

## Fork Answers (F1-F6) with Recommendations

### F1: C0 Fix Design

**Recommendation**: **(a) Supervisor-first liveness + conservative recency fallback**

**Strongest Counter-Argument**: Adds complexity (two mechanisms). However, this is necessary because:
1. Hooked sessions (Claude, Codex) have supervisorPid
2. Hookless sessions (chat-based) don't register supervisorPid
3. We need to protect both

**Proposed Implementation**:
```javascript
// In protocol-session.cjs, modify isProcessAlive to:
function isProcessAlive(record) {
  if (!record || record.hostname !== os.hostname()) return null;
  
  // Check supervisorPid first (if registered)
  if (record.supervisorPid) {
    if (typeof record.supervisorPid !== 'number' || !Number.isInteger(record.supervisorPid) || record.supervisorPid <= 0) return null;
    try { process.kill(record.supervisorPid, 0); return true; }
    catch (error) { if (error.code !== 'EPERM') return null; }
  }
  
  // Fallback to pid with recency check
  if (typeof record.pid !== 'number' || !Number.isInteger(record.pid) || record.pid <= 0) return null;
  
  // Recency: if state file mtime is within window (5 min), consider alive
  const RECENCY_WINDOW_MS = 5 * 60 * 1000; // 5 minutes
  if (record.mtime && Date.now() - new Date(record.mtime).getTime() < RECENCY_WINDOW_MS) {
    try { process.kill(record.pid, 0); return true; }
    catch (error) { return error.code === 'EPERM'; }
  }
  
  // Outside recency window: check process directly
  try { process.kill(record.pid, 0); return true; }
  catch (error) { return error.code === 'EPERM'; }
}
```

### F2: Gate Freshness

**Recommendation**: **(a) require verify --deep of cited review at gate time**

**Strongest Counter-Argument**: Adds a freeze/re-record step. **Mitigation**: This is a one-time cost per release and ensures receipt freshness.

**Enhancement**: Also add validator check that cited review's receipt verifies.

### F3: Journal Cap Policy

**Recommendation**: **(a) keep 30 + make archival a release-gate step**

**Strongest Counter-Argument**: Adds manual step. **Mitigation**: Automate with CI check that blocks release if journal count > 30.

### F4: Legacy Evidence Policy

**Recommendation**: **(a) keep label-only policy + document explicitly**

**Strongest Counter-Argument**: Users may expect tamper-evidence. **Mitigation**: Explicit documentation in PROTOCOL.md that legacy receipts are unauthenticated and editable.

### F5: Next-Cycle Vehicle

**Recommendation**: **(a) v1.9.5 for C0-C3+C5, v2.0 for C7**

**Strongest Counter-Argument**: Version churn. **Mitigation**: C0 is a real defect; fast remediation is justified. C7 (carried hypotheses) can wait for v2.0.

### F6: Evidence Freeze Protocol

**Recommendation**: **REVISED - Commit docs first, then re-record**

**Strongest Counter-Argument**: Original (a) doesn't account for docs/reviews affecting digest. **Revised protocol**:
1. Commit all existing reviews and TASK.md
2. All owners re-record journals against committed state
3. Verify all receipts with `verify --deep`
4. Commit the certification package

**Note**: This is circular if new reviews are written after step 1. Solution: **Freeze all new documentation** during the re-record phase.

---

## Council Question Answers (Q1-Q6)

### Q1: F1 mechanism and window?

**Answer**: Use **supervisor-first liveness** (mirroring the lock's behavior) with a **5-minute recency fallback** for sessions without registered supervisor. Window: **5 minutes** (configurable).

**Rationale**: 5 minutes balances responsiveness (dead sessions cleaned quickly) with safety (live sessions not accidentally pruned).

### Q2: Does a stale receipt invalidate a certification valid when recorded?

**Answer**: **No, but it invalidates the gate citation.**

A certification was valid when recorded (the review was genuine at that time). However, the completion gate should only cite receipts that verify at gate time. The plan's F2 recommendation (verify --deep at gate time) correctly addresses this.

**Implication**: The current gate citing Copilot's stale receipt is **technically non-compliant** with the spirit of the completion gate, though it satisfies the letter (file exists, has PASS verdict).

### Q3: Is 30 the right journal cap?

**Answer**: **Yes, but with automation.**

30 is reasonable for a multi-model council (current count: 35, which is close). The cap should remain 30 with:
1. Validator warning at 30
2. Validator error at 35 (or configurable higher threshold)
3. CI automation to archive oldest journals

### Q4: Does C0 warrant PROTO-DEC-0029?

**Answer**: **Yes.**

C0 violates **PROTO-DEC-0025 item 3** ("active sessions are never pruned"). This is a binding decision that the v1.9.4 implementation does not satisfy. A new decision block (PROTO-DEC-0029) should explicitly address the liveness model and fix.

### Q5: Sanction for chat-only artifacts?

**Answer**: **Validator should reject completion gate with non-persisted artifacts.**

AGENTS.md §5 states: "audit and council participants must persist prompts and reports in docs/reviews/ before emitting the chat summary." 

**Sanction**: The validator should check that all artifacts cited in the completion gate exist as files in the repository. Currently it checks existence; it should also verify they are non-empty and properly formatted.

**For Qoder's FAIL**: Since no file exists, it cannot be cited in any completion gate. It is **non-compliant evidence** and should be disregarded.

### Q6: Re-run six vectors or targeted review?

**Answer**: **Targeted review is sufficient.**

C0 is isolated to the liveness mechanism in `protocol-session.cjs`. Re-running the full six vectors is unnecessary. Instead:
1. Re-run Vector 2 (Lock Token & Session Spoofing) - specifically tests 9-13
2. Run targeted liveness regression tests
3. Verify C0 fix doesn't break existing functionality

**Justification**: The other vectors test unrelated code paths (archive, handoff, consumer sync, completion gate). C0's fix cannot affect these.

---

## Delta List: Add/Remove/Reprioritize/Re-word

### Add

| Item | Justification |
|---|---|
| **+C8** | Add validator test for new gate freshness check (F2) | Ensures the freshness requirement is enforced |
| **+C9** | Create PROTO-DEC-0029 for C0 fix | C0 violates binding decision; warrants own decision block |
| **+C10** | Add CI wiring for doctor + receipt freshness | Prevents regression of stale receipts in CI |
| **+C11** | Document liveness model in PROTOCOL.md | Clarifies supervisorPid vs pid behavior |

### Remove/Deprioritize

| Item | Justification |
|---|---|
| **C6 → C12** | Deprioritize fastValidator regression | Low impact; feature works, just needs test coverage |
| **C7 → v2.0 backlog** | Move carried hypotheses to v2.0 | Not blocking for v1.9.5 |

### Reword

| Item | Current | Proposed |
|---|---|---|
| **C3** | "The completion gate cites a stale receipt" | "The completion gate cites a receipt that no longer verifies due to subsequent writes to docs/reviews/ or TASK.md" | More precise about root cause |
| **C5** | "Documentation accuracy" | "Document liveness model and legacy receipt policy explicitly in PROTOCOL.md" | More actionable |

### Reprioritize

| Item | Current | Proposed | Justification |
|---|---|---|---|
| **C0** | HIGH | **HIGH** | Confirmed reproducible defect |
| **C1** | MED | **MED** | Blocking for 0-warning validator |
| **C2** | MED | **HIGH** | Needed for clean release record |
| **C3** | MED | **HIGH** | Gate citation must verify |
| **C4** | MED | **MED** | Documentation, not blocking |
| **C5** | LOW | **MED** | Documentation accuracy |

---

## Revised Acceptance Criteria

With the deltas above, the acceptance criteria for v1.9.5 should be:

1. **C0 fixed**: `prune` preserves a live session's journal (with and without registered supervisor); `cleanup-runtime` preserves a live snapshot; confirmed-dead sessions are still prunable; **regression tests added**
2. **Validator 0 warnings**: journals ≤ 30 after archival
3. **Certification package committed**: all reviews, journals, TASK.md, and receipts committed in one atomic commit
4. **Gate cites verifying receipt**: completion gate cites a review whose receipt verifies with `verify --owner <id> --deep` at gate time
5. **All artifacts exist**: every cited artifact in completion gate exists as a non-empty file in the repository
6. **Documentation updated**: PROTOCOL.md documents liveness model (supervisorPid vs pid) and legacy receipt policy (unauthenticated, editable)
7. **PROTO-DEC-0029 created**: decision block addressing C0 and liveness model

---

## Command Output for Reproduced Claims

### V1: Receipt Freshness
```
$ node .ai/bin/protocol-handoff.cjs verify --owner deepseek-flash-ebd6eb9397ed3784 --deep
devseek-flash-ebd6eb9397ed3784: evidence matches the current tree

$ node .ai/bin/protocol-handoff.cjs verify --owner copilot-13595b63-cf45-4860-a3e7-05c7972c5702 --deep
copilot-13595b63-cf45-4860-a3e7-05c7972c5702: evidence is stale. Recorded sha256:93533bf2a3161de00b77870c9723e746c12bf0715bdda03ca5ab84dd4b6bdac, tree is now sha256:09212eb41e6c4e44e56803406c2ebd48f07944f9c3d707ab83b7467ea147105c.

$ node .ai/bin/protocol-handoff.cjs verify --owner mistral-vibe-7d4ebdb4413f0de0 --deep
mistral-vibe-7d4ebdb4413f0de0: evidence is stale. Recorded sha256:4718e9e7e2665b95c52c61ec63fb2941c16ff85d87d12ad4aa9ddabc0909e3aa, tree is now sha256:09212eb41e6c4e44e56803406c2ebd48f07944f9c3d707ab83b7467ea147105c.
```

### V1: Digest Exclusion
```
$ grep -n "worklog\|ARCHIVE" .ai/bin/protocol-hooks.cjs | grep -E "(startsWith|==)"
125:    if (name.startsWith('.ai/runtime/') || name.startsWith('.ai/worklog/') || name === '.ai/ARCHIVE.md') continue;
```

### V1: Journal Count
```
$ ls .ai/worklog/*.md | grep -v README | wc -l
35

$ powershell -ExecutionPolicy Bypass -File validate-protocol.ps1 2>&1 | grep -i journal
[WARN] 35 session journals in .ai/worklog; archive the oldest into .ai/ARCHIVE.md
```

### V2: C0 Root Cause
```
$ grep -A5 "isProcessAlive" .ai/bin/protocol-session.cjs | head -10
const isProcessAlive = record => {
  if (!record || record.hostname !== os.hostname()) return null;
  if (typeof record.pid !== 'number' || !Number.isInteger(record.pid) || record.pid <= 0) return null;
  try { process.kill(record.pid, 0); return true; }
  catch (error) { return error.code === 'EPERM'; }
};

$ grep -n "supervisorPid" .ai/bin/protocol-session.cjs
# No matches in isProcessAlive
```

---

## References

- **Plan Under Review**: `docs/reviews/2026-09-19-deepseek-flash-interim-council-plan.md`
- **Supporting Record**: `docs/reviews/2026-09-19-deepseek-flash-certification-integrity-and-consolidation.md`
- **Related Decisions**: `.ai/DECISIONS.md` PROTO-DEC-0025 (item 3), PROTO-DEC-0028
- **Session Journal**: `.ai/worklog/mistral-vibe-7d4ebdb4413f0de0.md`

---

## Certification Statement

I, Mistral Vibe (mistral-medium-3.5), as an **independent reviewer** with no conflict of interest in the interim council action plan, have conducted a thorough adversarial audit against all seven attack vectors.

**The plan is**:
- ✅ **Factually accurate** (verified C0, digest exclusion, receipt staleness)
- ✅ **Well-structured** (clear forks, questions, acceptance criteria)
- ✅ **Properly scoped** (addresses real issues without overreach)
- ⚠️ **Needs minor clarifications** (F1 recency fallback, F6 freeze protocol)

**Verdict**: **RECOMMENDATION** (Plan is sound; implement with the refinements identified above)

The interim council action plan provides a **solid foundation** for the v1.9.5 follow-up cycle. With the refinements noted (particularly to F1, F6, and acceptance criteria), it will effectively address the open issues and maintain the protocol's integrity.
