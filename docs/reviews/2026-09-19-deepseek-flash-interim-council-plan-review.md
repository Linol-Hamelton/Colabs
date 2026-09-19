# DeepSeek (deepseek-flash) - Adversarial Review of the Interim Council Action Plan

**Date**: 2026-09-19  
**Reviewed commit**: `c71bdcf94545c246178b5d75e780f3fd79cb9b5a` (annotated tag `v1.9.4`)  
**Working tree**: dirty (this review package and journal are being added)  
**Reviewer**: DeepSeek (deepseek-flash)  
**Conflict of interest**: DECLARED — author of the interim council plan and of the preceding phase-gate reviews. This is an adversarial, non-certifying review of the plan before the owner fixes it.  
**Scope**: interim plan review, plan quality, factual correctness, omissions, fork quality, acceptance criteria  
**Verdict**: RECOMMENDATION  

---

## Executive Summary

The plan is directionally useful and materially grounded in the real defects the v1.9.4 cycle surfaced, but it is not yet ready to be adopted as a final council decision. The strongest issue is C0: a live session can still be quarantined and its snapshot removed when the registered supervisor PID is alive but the dead transient PID is the only value checked. The plan also leaves a stale-receipt gating gap, a release freeze gap, and a journal-count governance gap. I recommend a revised plan that fixes C0 before adoption, requires gate freshness for any cited review, and explicitly freezes the certification package before re-recording receipts.

---

## Scope and Evidence

- **Baseline Commit**: `c71bdcf94545c246178b5d75e780f3fd79cb9b5a`
- **Working Tree State**: `dirty` because the review package and journal are being created
- **Commands and probes executed**:
  - `node .ai/bin/protocol-session.cjs prune --agent qwen --session test-c0 --root <temp-fixture>`
  - `node .ai/bin/protocol-session.cjs cleanup-runtime --agent qwen --session test-c0 --root <temp-fixture> --force`
  - `node .ai/bin/protocol-handoff.cjs record --owner deepseek-flash-20260919-plan-review --root D:\Colabs`
  - `node .ai/bin/protocol-handoff.cjs verify --owner deepseek-flash-20260919-plan-review --root D:\Colabs --deep`
  - `powershell -ExecutionPolicy Bypass -File .\validate-protocol.ps1`
- **Environment**: Windows 11, Node.js v22.21.0, PowerShell 5.1.26100.9444

---

## Findings

| Id | Severity | Title | Location | Impact | Status |
|---|---|---|---|---|---|
| F-001 | HIGH | Live session liveness bug is still reproducible | `protocol-session.cjs` and the plan's C0 | Dead transient PID can still trigger quarantine or snapshot deletion even when a live supervisor is registered | Open |
| F-002 | MEDIUM | Gate freshness is not enforced | `AGENTS.md`, `.ai/TASK.md`, plan's F2 | A review can be cited even after the receipt goes stale | Open |
| F-003 | MEDIUM | Journal cap and archival gate are under-specified | validator, plan's F3 | 0-warning gate cannot remain stable without a release archival step | Open |
| F-004 | MEDIUM | Certification package can be stale and non-committed | plan's C2/C3/C5 | A review package may be valid when recorded yet stale by the time the gate is checked | Open |
| F-005 | LOW | Chat-only artifacts violate ordering and evidence discipline | plan's C4 | Non-repository artifacts bypass the required review persistence rule | Open |
| F-006 | LOW | Acceptance criteria need explicit pass/fail instrumentation | plan's Section 5 | A plan can claim success without measurable gate checks | Open |

### F-001 - HIGH - Live session liveness bug is still reproducible

- **Location**: `D:\Colabs\.ai\bin\protocol-session.cjs` (`isProcessAlive`, `prune`, `cleanup-runtime`)
- **Confidence**: High
- **Reproduction**:
  ```powershell
  $root = 'D:\tmp\session-c0-min'
  # state.pid is dead, but state.supervisorPid is the active current shell PID
  node D:\Colabs\.ai\bin\protocol-session.cjs prune --agent qwen --session test-c0 --root $root
  ```
- **Observed output**:
  ```text
  quarantined qwen-1234567890abcdef.md
  1 journal(s) quarantined.
  ```
- **Impact**: The plan is correct to flag C0. The root cause is exactly what the plan states: `isProcessAlive(state)` checks only `state.pid` and ignores the registered `supervisorPid` that the protocol already uses for the lock semantics. This violates the binding intent of PROTO-DEC-0025 item 3.
- **Recommendation / Proposed Fix**:
  ```javascript
  const isProcessAlive = record => {
    if (!record || record.hostname !== os.hostname()) return null;
    const candidate = record.supervisorPid ?? record.pid;
    if (typeof candidate !== 'number' || !Number.isInteger(candidate) || candidate <= 0) return null;
    try { process.kill(candidate, 0); return true; }
    catch (error) { return error.code === 'EPERM'; }
  };
  ```

### F-002 - MEDIUM - Gate freshness is not enforced

- **Location**: `.ai/TASK.md`, `AGENTS.md`, plan's F2
- **Confidence**: High
- **Reproduction**: The plan itself states the gate cites a stale receipt; a stale reviewer evidence record remains valid for the tree recorded at that time, but it is no longer fresh enough to certify the current gate state.
- **Impact**: The current completion gate checks existence and verdict but not fresh receipt verification. The plan is right to propose a stronger gate: the review cited by the gate should be re-verified at gate time with `verify --owner <reviewer> --deep`.
- **Recommendation / Proposed Fix**: Add a gate step that requires the cited review to verify fresh at the moment the task is marked `Completed`.

### F-003 - MEDIUM - Journal cap and archival are under-specified

- **Location**: plan's F3 and validator output
- **Confidence**: High
- **Reproduction**:
  ```powershell
  powershell -ExecutionPolicy Bypass -File .\validate-protocol.ps1
  ```
- **Observed output**: `[WARN] 31 session journals in .ai/worklog; archive the oldest into .ai/ARCHIVE.md`
- **Impact**: The validator emits a warning at 31 files; the gate cannot remain at 0 warnings if every release adds multi-model review journals. The plan's recommendation to keep the journal cap with a documented archival gate is sound but incomplete unless the archival step is explicit and enforced.

### F-004 - MEDIUM - Certification package drift and stale receipts are not fully handled

- **Location**: plan's C2, C3, C5, F6
- **Confidence**: High
- **Impact**: The plan correctly names the “dirty tree with stale evidence” problem. The issue is not that a review was fake, but that the time-anchored receipt no longer matches the expanded tree once the review file or TASK file is written. A final gate can be fixed only by a disciplined freeze, then a single re-record of each certifier journal.

### F-005 - LOW - Chat-only artifacts violate ordering and evidence discipline

- **Location**: plan's C4
- **Confidence**: High
- **Impact**: Where a reviewer writes content only in the chat and never persists it under `docs/reviews/`, the repository loses audit evidence and breaks AGENTS.md section 5. The plan correctly flags this as a real governance mistake.

### F-006 - LOW - Acceptance criteria need measurable gates

- **Location**: Section 5, “Acceptance criteria for the follow-up cycle”
- **Confidence**: Medium
- **Impact**: The criteria are directionally correct but still allow a “looks good on paper” pass unless they specify the exact commands and expected outputs that constitute pass and fail. This is especially important for the liveness regression and the final gate verification.

---

## Deep Dives

### 1) C0 root cause is real and should be fixed before the plan is adopted

The root cause is in `isProcessAlive` and is not a theory: it checks only `record.pid`, while the protocol already tracks `supervisorPid` for sessions that are run under a supervisor or outer CLI shell. The plan's proposed F1 fork is therefore not speculative — it is the minimum practical design change to make the liveness and cleanup behavior conform to the design intent.

### 2) F2/F6 are the correct governance fix

A stale receipt does not necessarily mean the earlier review was fabricated; it means the evidence no longer matches the current tree due to a later write. To preserve trust, the final gate must freeze the certification package and re-record only after the set of review files and task files is stable. The plan correctly identifies this as the missing discipline.

### 3) F3 does not need a new policy only; it needs an explicit release gate

The 30-file maximum is not itself wrong, but without an explicit archival-and-prune release gate, each multi-model council will keep producing warnings. The plan's `keep 30 and archive as a release gate` recommendation is the right trade-off, because it preserves evidence history without silently dropping files.

---

## Per-fork answers

### F1 - C0 design

**Recommendation**: adopt supervisor-first liveness, with a conservative recency fallback only for sessions that never register a supervisor and only within a tightly bounded session window.  
**Strongest counter-argument**: conservative recency checks can mistakenly retain a dead session or prune a live idle session if the timeline is misread. This is why the fallback must be narrow and policy-limited.  
**Verdict**: the concept is sound, but the implementer must test both with and without a registered supervisor and document the window.

### F2 - Gate freshness

**Recommendation**: require the cited review to verify fresh with `verify --owner <reviewer> --deep` at gate time.  
**Strongest counter-argument**: a stale receipt is not inherently a falsification, so a strict fresh verification step may be operationally expensive.  
**Verdict**: still correct because it closes the specific stale-certificate class without rehashing history.

### F3 - Journal cap

**Recommendation**: keep 30 and make archival part of the release gate.  
**Strongest counter-argument**: a higher cap reduces operational friction.  
**Verdict**: choose the lower leak surface and document the archival step; this is the safer governance rule.

### F4 - Legacy Evidence

**Recommendation**: keep the label-only policy, but document exactly that legacy receipts are unauthenticated.  
**Strongest counter-argument**: re-recording everything is more strict and easier to reason about.  
**Verdict**: maintain the current policy; the issue is governance transparency, not the underlying compatibility strategy.

### F5 - Next-cycle vehicle

**Recommendation**: `v1.9.5` for C0 + C1–C3 + C5, then separate `v2.0` discussion for C7.  
**Strongest counter-argument**: a single `v2.0` bucket keeps the plan simpler.  
**Verdict**: the recommended split is cleaner because C0/C1/C2/C3 are concrete blocking defects. C7 is design backlog, not release-blocking protocol correctness.

### F6 - Freeze-then-single-re-record

**Recommendation**: freeze the plan package, then re-record a certifier's journal exactly once after all artifacts are stable.  
**Strongest counter-argument**: incremental recording is cheaper and less disruptive.  
**Verdict**: the freeze protocol is safer and consistent with the evidence model; it prevents the stale-certification problem without rewriting history.

---

## Answers to the council questions

1. **F1 mechanism and window**: Use `supervisorPid` first, then a conservative recency fallback only when the supervisor is absent or the state is unknown. Window: short, explicit, and bounded to the session's active lifetime.  
2. **Does stale receipt invalidate a previous valid certification?**: It does not falsify the earlier receipt, but it does invalidate the gate's use of that receipt unless the cited review is re-verified fresh after the tree freeze.  
3. **Is 30 the right journal cap?**: Yes, if archival is part of the release gate; otherwise the validator warning becomes a permanent noise source.  
4. **Does C0 warrant its own decision block?**: Yes, because it violates a substantive bound in PROTO-DEC-0025 and impacts the cleanup of active sessions. A dedicated PROTO-DEC-0029 is appropriate.  
5. **Sanction for chat-only artifacts?**: The sanction should be rejection of the artifact from the gate and a requirement to re-persist it under `docs/reviews/` before it can be cited as evidence.  
6. **After C0, re-run all six vectors or targeted liveness review?**: Re-run the six-vector suite after the C0 fix, but keep the liveness and stale-gate checks as the first-class regression set. A targeted liveness review is not enough for release closure because the final plan includes archive, evidence, and governance changes.

---

## Delta list

- **Add**: explicit `supervisorPid`-first liveness policy in the final plan.  
  - Justification: this is the actual defect root cause.
- **Add**: gate freshness check for every cited independent review.  
  - Justification: stale receipt logic is a real governance gap.
- **Add**: freeze-then-single-re-record step for certifier journals and TASK/docs/reviews set.  
  - Justification: this removes multi-model churn from the evidence trail.
- **Reword**: the “clean tree” phrasing in certification notes should become “tree was stable at the time of recording” or “this package was uncommitted at estimate time.”  
  - Justification: it matches the actual evidence semantics.
- **Remove**: chat-only audit artifact references from the final plan.  
  - Justification: they violate AGENTS.md section 5 and are not repository evidence.
- **Reprioritize**: C0 before any journal cap or CI policy enhancement.  
  - Justification: it is the only direct protocol correctness defect still reproduced.

---

## Command output for reproduced claims

```powershell
$root = 'D:\tmp\session-c0-min'
node D:\Colabs\.ai\bin\protocol-session.cjs prune --agent qwen --session test-c0 --root $root
```

```text
quarantined qwen-1234567890abcdef.md
1 journal(s) quarantined.
```

```powershell
$root = 'D:\tmp\session-c0-cleanup'
node D:\Colabs\.ai\bin\protocol-session.cjs cleanup-runtime --agent qwen --session test-c0 --root $root --force
```

```text
(no matching output; the file is removed silently because the live supervisor is ignored)
```

The second reproduction was the minimal proof of the cleanup defect: the state file was removed even though `supervisorPid=$PID` remained alive. The file no longer existed after the command, which is exactly the failure mode the plan is naming.

---

## References

- `docs/reviews/2026-09-19-deepseek-flash-certification-integrity-and-consolidation.md`
- `docs/reviews/2026-09-19-deepseek-flash-interim-council-plan.md`
- `.ai/DECISIONS.md` (`PROTO-DEC-0025`, `PROTO-DEC-0028`)
- `.ai/TASK.md`
- `D:\Colabs\.ai\bin\protocol-session.cjs`
