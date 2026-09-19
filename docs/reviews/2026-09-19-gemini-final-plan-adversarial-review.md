# Gemini - Adversarial Review: Final v1.9.5 Follow-up Plan

**Date**: 2026-09-19  
**Reviewed commit**: a6dbf8ce18be52c8f5d95ae837d71af5d7c63cac  
**Working tree**: dirty (uncommitted certification package and working sessions)  
**Reviewer**: Gemini (Gemini 3.8 Flash)  
**Scope**: [council | architecture | edge-cases | security]  
**Verdict**: RECOMMENDATION  
**Conflict of Interest**: NONE - Gemini is an independent council participant and opposing reviewer evaluating the follow-up plan authored by DeepSeek (`docs/reviews/2026-09-19-deepseek-flash-final-followup-plan-v1.9.5.md`).  

---

## Executive Summary

The final follow-up plan for v1.9.5 (`docs/reviews/2026-09-19-deepseek-flash-final-followup-plan-v1.9.5.md`) successfully consolidates the architectural consensus from the prior review rounds, correctly identifies the C0 liveness defect in `protocol-session.cjs`, and proposes an executable freeze ordering to eliminate receipt churn. The verdict is **RECOMMENDATION** (approval subject to targeted hardening): (1) `isSessionAlive` must explicitly handle foreign host status (`null`) in `prune` to prevent accidental quarantine; (2) supervisor registration (`PID > 4`) must include an idle inactivity threshold to prevent empty-journal accumulation attacks; (3) gate freshness enforcement should be implemented via a dedicated `gate-check` subcommand rather than overloading validator checks in consumer checkouts; (4) sequencing must place the final release freeze/commit/push (A3) as the concluding step after Tracks A and B.

---

## Scope and Evidence

- **Baseline Commit**: `c71bdcf` (annotated release tag `v1.9.4`), HEAD `a6dbf8c`
- **Working Tree State**: `dirty` (uncommitted certification package, peer reviews, active worklogs)
- **Environment**: Windows 11, Node.js v22.21.0, PowerShell 5.1
- **Empirical Command Verifications**:
  1. Digest exclusion verified: `.ai/worklog/`, `.ai/ARCHIVE.md`, `.ai/runtime/` are digest-neutral; `docs/reviews/**` and `.ai/TASK.md` alter the anchor digest.
  2. C0 defect reproduced: `prune` quarantines empty journals and `cleanup-runtime --force` destroys state even when `supervisor_pid` is actively running.
  3. `--supervisor-pid` restriction verified: rejected with exit 1 if PID is not `process.pid` or `process.ppid`.
  4. Completion gate freshness gap verified: `validate-protocol.ps1` returns exit 0 with 0 warnings while the cited Copilot receipt fails with exit 1.
  5. Quarantined journals verified: 31 pruned journals are confirmed header-only (0 lost data lines); active journals <= 30.

---

## Findings and Vector Attacks

| Id | Severity | Title | Location | Impact | Status |
|---|---|---|---|---|---|
| F-001 | HIGH | `prune` quarantines foreign host empty journals due to strict boolean check | `protocol-session.cjs:182` | Acceptance matrix item (iv) fails: foreign host session empty journals are deleted without `--force` | Open |
| F-002 | MEDIUM | Supervisor registration PID > 4 lacks idle timeout, enabling empty journal accumulation | `protocol-session.cjs:65-78` | Malicious or buggy process could register system PID and exhaust the 30-journal cap with unprunable empty files | Open |
| F-003 | MEDIUM | Validator-embedded gate check risks breaking `installed` role projects | `validate-protocol.ps1:450-462` | Consumer repositories lacking active worklogs fail validation if gate verification is unconditionally embedded | Open |
| F-004 | LOW | A3 release freeze sequenced prematurely before Track A/B implementation completes | Plan Section 5: Step 3 | Committing certification package before A2/A5/B creates immediate dirty tree and stales receipts | Open |

---

### F-001 - HIGH - `prune` Quarantines Foreign Host Empty Journals

- **Location**: `protocol-session.cjs:182`
- **Confidence**: High
- **Reproduction**:
  ```bash
  # In throwaway environment with state containing hostname: 'other-machine'
  node .ai/bin/protocol-session.cjs prune --root <tempDir>
  ```
  **Observed Output**:
  ```text
  Foreign host prune stdout: quarantined foreign-agent-1234.md
  1 journal(s) quarantined.
  Foreign host journal quarantined? true
  ```
- **Impact**: In `protocol-session.cjs:182`, the check is strictly `if (isProcessAlive(state) === true) continue;`. When a session originated on another machine, `isProcessAlive` returns `null`. Because `null === true` evaluates to `false`, `prune` does not skip it and renames the empty journal to quarantine. This directly violates Acceptance Criterion (iv) ("foreign host -> null liveness, preserved without --force").
- **Recommendation**: Update `isSessionAlive(state)` to return `null` for foreign hosts, and ensure `prune` preserves sessions unless `isSessionAlive(state) === false` (or requires `--force` to remove `null` foreign host sessions).

---

### F-002 - MEDIUM - Supervisor Registration (PID > 4) Allows Empty Journal Accumulation Without Idle Timeout

- **Location**: `protocol-session.cjs:65-78`, Plan Section 2 (A1.3)
- **Confidence**: High
- **Reproduction**:
  A process can start 35 sessions passing an arbitrary living system daemon PID (`--supervisor-pid 1200`). Since PID 1200 remains alive indefinitely, `isSessionAlive` returns `true` for all 35 sessions, preventing `prune` from quarantining any of them. The journal count immediately exceeds 30, failing the validator gate.
- **Impact**: Opening `--supervisor-pid` to any live PID `> 4` is essential for external orchestrators (solving Fact 3), but without a maximum idle threshold on empty journals, abandoned sessions under long-lived supervisors permanently bloat `.ai/worklog/`.
- **Recommendation**: Retain the recommended `PID > 4` policy, but add an idle expiration (e.g. 60 minutes) for empty, lockless journals even if their supervisor PID is alive, or bound empty uncommitted sessions to 1 per agent/supervisor pair.

---

### F-003 - MEDIUM - Validator-Embedded Gate Freshness Risks Breaking Installed Consumer Repositories

- **Location**: `validate-protocol.ps1:410-465`, Plan Section 2 (A4)
- **Confidence**: High
- **Analysis**:
  Installed consumer repositories (`role: installed` in `protocol-manifest.json`) do not have active `.ai/worklog/` session chains and may not track peer review journals. If `validate-protocol.ps1` runs a mandatory `verify --owner <session> --deep` on completion gates, consumer checks will fail.
- **Recommendation**: Implement gate freshness verification as a dedicated CLI subcommand: `node .ai/bin/protocol-handoff.cjs gate-check`. In `validate-protocol.ps1`, call this check only when `protocol-manifest.json` indicates `role: source`.

---

### F-004 - LOW - Premature Release Freeze Sequencing

- **Location**: Plan Section 5 (Sequencing), Steps 2 & 3
- **Confidence**: High
- **Analysis**:
  The plan sequences: 1. A1 C0 fix -> 2. A4 ordering & gate freshness -> 3. A3 freeze, commit, push -> 4. A2 archival automation -> 5. A5 capability rules -> 6. B1-B4 decision freeze.
  Executing A3 (freeze, commit, push) at Step 3 freezes the repository before A2, A5, and B are implemented. Any subsequent edits to implement Track B or A2 would immediately dirty the tree, invalidate the commit hash, and stale the recorded receipts.
- **Recommendation**: Reorder sequencing: implement all code changes (A1, A2, A5, A4, B1-B4), execute test suites, and only then execute A3 (package freeze, evidence recording, commit, push).

---

## Detailed Vector Attacks & Empirical Verifications

### Vector 1: Digest and Freeze Mechanics (Order Testing)

Empirical testing confirmed the digest properties on throwaway git repositories:
```text
Base digest:                7753aae41f5074a834d8840345fa43ef3d440d072a2109a01e9900905b8ddeae
Digest after journal write: 7753aae41f5074a834d8840345fa43ef3d440d072a2109a01e9900905b8ddeae Matches base? true
Digest after ARCHIVE write: 7753aae41f5074a834d8840345fa43ef3d440d072a2109a01e9900905b8ddeae Matches base? true
Digest after runtime write: 7753aae41f5074a834d8840345fa43ef3d440d072a2109a01e9900905b8ddeae Matches base? true
Digest after review write:  502431bfb30c3e29f45b121fded6338989906c9567f243237eda624dfe7e6287 Matches base? false
Digest after TASK write:    0e05fde697ada88ae3d4850216bddb1cfca13e3588baa411b9ba6a1539d803b2 Matches base? false
```
**End-to-End Pipeline Verification**:
1. Review write -> Anchor digest changes from base (prior receipts stale).
2. Journal write -> Anchor digest remains unchanged (`Stale? false`).
3. Git commit of review & journal -> Anchor digest remains unchanged (`Stale? false`).
4. Untracked file leak (not gitignored) -> Anchor digest changes (`Stale? true`).
5. `.gitignore` alteration -> Anchor digest changes (`Stale? true`).

*Conclusion*: The freeze ordering defined in A4 is sound. As long as review files and `TASK.md` are frozen prior to running `record`, journal updates do not mutate the anchor digest, and git commits preserve object identities.

---

### Vector 2: Break the C0 Liveness Design

1. **Stale supervisor PID outliving session**: If a supervisor daemon crashes or is killed, its PID disappears; `isSessionAlive` returns `false`, allowing normal cleanup. However, if a supervisor stays alive while an agent session was abandoned without writing entries, the empty journal is retained indefinitely. Mitigation: 60-minute idle window.
2. **Foreign host**: Confirmed that `null` liveness is currently quarantined by `prune`. Fix must check `!== false`.
3. **Recycled PID**: Possible false positive (preserves snapshot/journal). This is fail-safe; data is never deleted prematurely.
4. **Window scope**: `RECENT_WINDOW` must apply to the snapshot creation/mtime, requiring the journal to exist. Recommended window: **30 minutes** (15 minutes is too tight for comprehensive multi-file LLM analysis prior to first journal entry).

---

### Vector 3: Supervisor Registration Evaluation

- **Option (a) (Any live PID > 4)**: Recommended. Since registration only prevents the owner's own journal/snapshot from being pruned, it does not confer lock rights (lock acquisition strictly validates session tokens and registered nonces per PROTO-DEC-0028).
- **Option (b) (own/ppid only)**: Defective for external orchestrators (IDE / shell wrappers make `ppid` point to transient sub-shells).
- **Option (c) (Token handshake)**: Unnecessary complexity for local processes where OS-level PID liveness is sufficient.

---

### Vector 4: Gate Freshness & Failure Modes

- **Empirical Gap Demonstration**:
  ```bash
  # Copilot receipt verification fails:
  node .ai/bin/protocol-handoff.cjs verify --owner copilot-13595b63-cf45-4860-a3e7-05c7972c5702
  # Output: exit 1 (stale evidence against current tree)

  # Yet validator passes:
  powershell -ExecutionPolicy Bypass -File .\validate-protocol.ps1
  # Output: [PASS] independent review certified: docs/reviews/2026-09-19-copilot-v1.9.4-release-certification.md
  # Protocol OK. 0 warning(s).
  ```
- **Recommended Enforcement**: Add `node .ai/bin/protocol-handoff.cjs gate-check`. It parses `.ai/TASK.md`, extracts cited review files, resolves their corresponding session receipts (via a `Session: <id>` header in the review), and runs `verify --owner <id> --deep`. In `validate-protocol.ps1`, run `gate-check` only when `manifest.role === 'source'`.

---

### Vector 5: Decision Freeze Loopholes and Registry Architecture

Loopholes identified in Section 3 (B2):
1. `metric-drop` without baseline: Exploitable by arbitrarily defining new metrics. *Tightening*: Must cite an existing, committed baseline artifact and pre-registered threshold.
2. `new-external-data` without code reproduction: Exploitable via unverified assertions. *Tightening*: Must include an in-repo reproducible script or test case.
3. `owner-directive` unrecorded: Exploitable via unverified chat claims. *Tightening*: Must be recorded in git commit history or `.ai/TASK.md` signed by the owner.

**Registry Architecture**:
- Human: `docs/decisions/REGISTRY.md` (tabular status, freeze date, supersedes/superseded-by links).
- Machine: `docs/decisions/registry.json` (keyed by decision ID).
- Validator check: In `role: source`, validator verifies that all decision IDs extracted from `DECISIONS.md` exist in `registry.json`. No existing decision block in `DECISIONS.md` is ever edited.

---

## Answers to the 14 Council Questions

1. **A1 Supervisor registration policy**:
   - *Recommendation*: Option (a) Any live PID > 4 (`supPid > 4 && supPid <= 0x7fffffff`), combined with an idle timeout.
   - *Strongest counter-argument*: An agent could register a long-running system PID to prevent `prune` from ever cleaning up its abandoned empty sessions.
   - *Resolution*: The lock remains protected by PROTO-DEC-0028 nonces; adding an idle threshold (e.g. 60 min) prevents empty session hoarding.

2. **A1 `RECENT_WINDOW` value & scope**:
   - *Recommendation*: **30 minutes**; applies to snapshot mtime in `.ai/runtime/`.
   - *Strongest counter-argument*: 30 minutes delays cleaning dead CLI runs during fast automated testing.
   - *Resolution*: 15 minutes is too brief for an agent conducting deep multi-file codebase analysis before writing its first journal entry. 30 minutes is completely safe against the 24-hour cleanup cycle.

3. **A4 Ordering vs excluding `TASK.md` from digest**:
   - *Recommendation*: Keep `TASK.md` in the digest; ordering protocol is sufficient.
   - *Strongest counter-argument*: Retaining `TASK.md` requires freeze discipline; any late typo fix to `TASK.md` invalidates all receipts.
   - *Resolution*: `TASK.md` holds the completion gate and objective. Excluding it would allow tampering with task scope and completion gates after evidence certification.

4. **A4/C8 Freshness check implementation**:
   - *Recommendation*: Dedicated `protocol-handoff.cjs gate-check` subcommand, invoked by `validate-protocol.ps1` in source role only.
   - *Strongest counter-argument*: Adds another subcommand to the CLI.
   - *Resolution*: Prevents crashes in `installed` role consumers where journals do not exist, and isolates receipt verification logic cleanly.

5. **A2 Journal cap invariant (30)**:
   - *Recommendation*: Keep the 30 cap and enforce manual/scripted archival via `protocol-archive.cjs worklog` as part of the release checklist.
   - *Strongest counter-argument*: Frequent multi-agent council rounds churn journals quickly, causing frequent cap warnings.
   - *Resolution*: Archival preserves 100% of history in `.ai/ARCHIVE.md` with cryptographic hash chaining; raising the cap encourages repository bloat.

6. **B3 Registry format & location**:
   - *Recommendation*: Both Markdown (`docs/decisions/REGISTRY.md`) and JSON twin (`docs/decisions/registry.json`).
   - *Strongest counter-argument*: Dual formats introduce potential drift between markdown and JSON.
   - *Resolution*: A unit test verifies exact parity between the markdown table and JSON twin.

7. **B4 Validator enforcement of `Reopen-trigger:`**:
   - *Recommendation*: Advisory for historical decisions (`DEC-0001` through `PROTO-DEC-0028`); mandatory for new decisions appended after `PROTO-DEC-0028`.
   - *Strongest counter-argument*: Adds syntactic constraints on emergency fixes.
   - *Resolution*: Without machine enforcement for new decisions, the freeze policy degrades into unenforced advice.

8. **C1 H1 Metrics & thresholds**:
   - *Recommendation*: The 6 proposed metrics are sound. Adoption requires >=20% reduction in task input tokens, >=25% reduction in time-to-first-edit, and exactly 0 test/validation regressions.
   - *Strongest counter-argument*: High thresholds may reject tooling that improves developer experience without massive token reductions.
   - *Resolution*: Protocol kernel simplicity is paramount; external dependencies must justify their added complexity with substantial measured gains.

9. **C2 MCP policy ownership**:
   - *Recommendation*: Protocol source defines security/integrity policies; global orchestrator config handles daemon lifecycle and connection transports.
   - *Strongest counter-argument*: Multi-repo divergence if orchestrator configuration drifts.
   - *Resolution*: Protocol source must remain self-contained and host-agnostic.

10. **A3 Push timing & commit signing**:
    - *Recommendation*: Commit and push immediately upon completing and verifying the certification package. Signing optional per owner preference.
    - *Strongest counter-argument*: Immediate push leaves no soak time for local inspection.
    - *Resolution*: Main is currently 10 commits ahead of origin; delaying push leaves critical protocol work vulnerable to local disk failure.

11. **A5 Capability matrix source of truth**:
    - *Recommendation*: Stored in `.ai/runtime/<owner>.json` at session creation based on orchestrator runtime environment; reflected in review header.
    - *Strongest counter-argument*: Self-declaration in prompts is simpler.
    - *Resolution*: Self-declarations are unverified claims; runtime capability must be asserted by the environment that controls execution.

12. **A2 Certification journal exemption**:
    - *Recommendation*: Confirm rejection. No exemptions from the 30-journal cap.
    - *Strongest counter-argument*: Parallel certifying agents can trigger warnings during release rounds.
    - *Resolution*: Exemptions create leaky invariants; archive older sessions before launching certification rounds.

13. **A1 Migration note for pre-v1.9.5 sessions**:
    - *Recommendation*: Yes, document in `.ai/docs/PROTOCOL.md`. Ensure `isSessionAlive(state)` handles undefined `supervisor_pid` gracefully.
    - *Strongest counter-argument*: Runtime state is disposable, so legacy sessions quickly drain.
    - *Resolution*: Backward-compatibility prevents runtime crashes when inspecting older active checkouts.

14. **Overall vehicle approval**:
    - *Recommendation*: Approve v1.9.5 as the vehicle for Tracks A and B. Keep Track C as an experimental pilot.
    - *Strongest counter-argument*: Rapid release cycle after v1.9.4.
    - *Resolution*: C0 is an active defect violating PROTO-DEC-0025, and gate freshness is an open governance gap. Shipping v1.9.5 hardens the foundation cleanly.

---

## Delta List for Final Plan Text

1. **A1.1 (Reword)**: Specify that `isSessionAlive(state)` returns `null` for foreign hosts, and `prune` skips sessions unless liveness is strictly `false`. *(Fixes F-001 foreign host accidental quarantine)*.
2. **A1.2 (Reword)**: Set `RECENT_WINDOW` to 30 minutes, applying to snapshot creation/mtime. *(Provides safe thinking window for deep audit sessions)*.
3. **A1.3 (Add)**: Add a 60-minute idle threshold for empty, lockless sessions with live supervisor PIDs. *(Mitigates F-002 empty journal accumulation)*.
4. **A4 (Reword)**: Implement gate freshness as `protocol-handoff.cjs gate-check`, executed by `validate-protocol.ps1` only when `role === 'source'`. *(Mitigates F-003 consumer repository failures)*.
5. **B2 (Reword)**: Require `metric-drop` triggers to cite pre-registered baseline artifacts, and `owner-directive` to cite committed git/task records. *(Closes decision reopening loopholes)*.
6. **B3 (Add)**: Add unit test verifying 1:1 synchronization between `REGISTRY.md` and `registry.json`. *(Prevents dual-format documentation drift)*.
7. **Section 5 (Reprioritize)**: Move Step 3 (A3 freeze, commit, push) to Step 7 (final step before tag). *(Fixes F-004 premature freeze sequence)*.

---

## References

- Plan under review: `docs/reviews/2026-09-19-deepseek-flash-final-followup-plan-v1.9.5.md`
- Active task: `.ai/TASK.md`
- Associated session journal: `.ai/worklog/gemini-28974c8a8a07888d.md`
- Referenced reviews: `docs/reviews/2026-09-19-gemini-interim-plan-adversarial-review.md`, `docs/reviews/2026-09-19-copilot-v1.9.4-release-certification.md`
