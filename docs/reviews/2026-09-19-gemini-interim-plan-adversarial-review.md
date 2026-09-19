# Gemini - Adversarial Peer Review: Interim Council Action Plan (v1.9.4 Follow-up)

**Date**: 2026-09-19  
**Reviewed commit**: `a6dbf8ce18be52c8f5d95ae837d71af5d7c63cac` (HEAD)  
**Release baseline**: `c71bdcf94545c246178b5d75e780f3fd79cb9b5a` (annotated tag `v1.9.4`)  
**Working tree**: dirty (uncommitted certification artifacts, modified TASK.md)  
**Reviewer**: Gemini (Gemini 3.8 Flash, session `gemini-2da9379ddcd247b6`)  
**Conflict of interest**: DECLARED — None. Gemini did not author the interim council plan or the consolidation review. Prior role in the cycle was implementer of v1.9.4 hardening core; this review evaluates the post-release follow-up governance and fix plan authored by DeepSeek.  
**Scope**: Full mandatory adversarial peer review of `docs/reviews/2026-09-19-deepseek-flash-interim-council-plan.md` across all 7 attack vectors (V1–V7), fork evaluations (F1–F6), council questions (Q1–Q6), and acceptance criteria.  
**Verdict**: **RECOMMENDATION** (Plan is grounded and structurally sound; 4 critical design gaps and 2 mechanical hazards require correction before owner finalization)  

---

## Executive Summary

I conducted an adversarial peer review of DeepSeek's Interim Council Action Plan for the v1.9.4 follow-up cycle across all 7 attack vectors (V1–V7). The plan's factual base is largely confirmed, and its identification of C0 as an active, reproducible defect violating PROTO-DEC-0025 item 3 is verified. However, four critical technical and governance issues require resolution before the owner finalizes the plan:
1. **C0 caller gap & CLI restriction**: In addition to `isProcessAlive` reading only `record.pid` (`protocol-session.cjs:28-33`), the callers at `prune:182` and `cleanup-runtime:247,261` fail to consult `supervisorPid`. Furthermore, `protocol-session.cjs:75-76` restricts `--supervisor-pid` strictly to `process.pid` or `process.ppid`, preventing external orchestrators or IDE supervisors from registering.
2. **F6 mechanics clarified**: Auto-archive writes to `.ai/ARCHIVE.md` during `record` do NOT change the anchor digest because `.ai/ARCHIVE.md` is explicitly excluded in `protocol-hooks.cjs:125`. However, an unmentioned hazard exists: any untracked or modified `docs/reviews/*.md` file created after the freeze commit will invalidate all subsequent receipts.
3. **F3 journal cap false dilemma**: The fork omits convention-based segregation (e.g., separating operational session journals from release certification records), framing an artificial choice between raising the cap or manual archiving.
4. **C0 acceptance criteria vulnerability**: The proposed acceptance criteria can be satisfied by a naive implementation that unconditionally skips non-empty journals, permanently leaking dead sessions. A three-branch test matrix is required.

---

## Scope and Evidence

- **Baseline Commit**: `a6dbf8ce18be52c8f5d95ae837d71af5d7c63cac`
- **Working Tree State**: `dirty` (uncommitted certification artifacts and active journals)
- **Commands & Tests Executed**:
  - `node .ai/bin/protocol-handoff.cjs state`
  - `node .ai/bin/protocol-handoff.cjs verify --deep`
  - `node .ai/bin/protocol-handoff.cjs verify --owner <id> --deep` (for claude, mistral, gemini, copilot, deepseek)
  - `powershell -ExecutionPolicy Bypass -File .\validate-protocol.ps1`
  - `node .ai/bin/protocol.cjs doctor`
  - Throwaway fixture isolation probes for C0 (`prune` and `cleanup-runtime --force`)
- **Environment**: Windows 11 (10.0.26100), Node.js v22.21.0, PowerShell 5.1.26100.9444

---

## Findings

| Id | Severity | Title | Location | Impact | Status |
|---|---|---|---|---|---|
| F-001 | HIGH | C0 session liveness defect confirmed; callers and CLI registration restricted | `protocol-session.cjs:28-33, 75-76, 182, 247, 261` | Live sessions under active supervisors are quarantined by `prune` and deleted by `cleanup-runtime` | Open |
| F-002 | MEDIUM | Gate freshness gap enables citation of stale evidence receipts | `AGENTS.md §2`, `.ai/TASK.md:49-53`, plan F2 | Completion gate verifies file existence and PASS text, but not anchor digest validity | Open |
| F-003 | MEDIUM | Untracked `docs/reviews/` hazard threatens F6 freeze-record protocol | `protocol-hooks.cjs:125`, plan F6 | Post-freeze creation of reviews changes digest and stales prior recorded receipts | Open |
| F-004 | MEDIUM | C0 acceptance criteria can be satisfied by defective implementation | Plan §5 (Acceptance Criteria) | Naive skip of non-empty journals satisfies criteria while breaking dead session cleanup | Open |
| F-005 | LOW | F3 journal cap presents false dilemma between cap raise and manual archive | Plan §3 (F3) | Misses convention-based exclusion of certification journals | Open |
| F-006 | LOW | `main` branch 10 commits ahead of `origin/main` without release push policy | Git repository state | Unpushed commits create multi-agent synchronization and diverged history risks | Open |

---

### F-001 - HIGH - C0 Session Liveness Defect & Registration Restriction

- **Location**: `.ai/bin/protocol-session.cjs:28-33, 75-76, 182, 247, 261`
- **Confidence**: High
- **Reproduction**:
  Executed in isolated throwaway fixture with dead transient PID (9999999) and live supervisor PID (`process.pid`):
  ```bash
  node .ai/bin/protocol-session.cjs prune --agent test-c0 --session test-c0 --root <fixture>
  node .ai/bin/protocol-session.cjs cleanup-runtime --agent test-c0 --session test-c0 --root <fixture> --force
  ```
  **Observed Output**:
  `prune` output: `quarantined test-c0-1234567890abcdef.md (1 journal(s) quarantined)`
  `cleanup-runtime` result: runtime state file deleted despite active supervisor process.
- **Impact**: Violates PROTO-DEC-0025 item 3 ("active sessions are never pruned"). Active sessions using CLI wrapper or IDE supervisor can lose worklog files and session context.
- **Root Cause & Discovery**:
  1. `isProcessAlive(record)` (lines 28-33) reads only `record.pid` and never inspects `record.supervisorPid`.
  2. Callers at line 182 (`prune`) and lines 247/261 (`cleanup-runtime`) pass `state` directly into `isProcessAlive` without checking `supervisorPid`.
  3. Additional blocking finding: `start` option validation at lines 75-76:
     ```javascript
     if (supPid !== process.pid && supPid !== process.ppid) {
       throw new Error(`Invalid --supervisor-pid: must be current process PID or parent PID`);
     }
     ```
     This strictly forbids passing an external orchestrator or IDE process PID unless it is the direct immediate parent, crippling supervisor registration in real-world environments.
- **Recommendation**:
  Update `isProcessAlive` to check `record.supervisorPid` before falling back to `record.pid`. Relax line 75-76 to allow any live PID verified via `os.hostname()` and `process.kill(pid, 0)`.

---

### F-002 - MEDIUM - Completion Gate Freshness Gap

- **Location**: `.ai/TASK.md:49-53`, `validate-protocol.ps1:194-206`, plan F2
- **Confidence**: High
- **Reproduction**:
  Verified with `node .ai/bin/protocol-handoff.cjs verify --owner copilot-13595b63-cf45-4860-a3e7-05c7972c5702 --deep`:
  Evidence recorded `sha256:93533bf2...`, tree is now `sha256:1450bc6f...`. Result: exit 1 (stale).
  Yet `validate-protocol.ps1` exits 0 and reports: `[PASS] independent review certified: docs/reviews/2026-09-19-copilot-v1.9.4-release-certification.md`.
- **Impact**: The completion gate certifies completion even when the cited review was recorded against an obsolete tree state.
- **Recommendation**: Adopt F2(a) with a hybrid verification: gate requires `verify --owner <id> --deep` to verify against either the current tree or the target release freeze commit.

---

### F-003 - MEDIUM - Untracked Reviews Hazard in Freeze Protocol

- **Location**: `protocol-hooks.cjs:125`, plan F6
- **Confidence**: High
- **Analysis**:
  Plan F6 assumes: "stop writing reviews/TASK; freeze (commit); then each owner re-records its journal once (journal writes do not change the digest), so all receipts verify simultaneously."
  However, `protocol-hooks.cjs:103` uses `git ls-files --cached --others --exclude-standard`. Any untracked file under `docs/reviews/` is included in the anchor digest. If an agent writes an interim review or untracked file after the freeze commit, the tree digest changes immediately, invalidating all earlier receipts in the re-record pass.
- **Recommendation**:
  Add an explicit gate step to F6: Before executing the re-record pass, verify `git status --porcelain` contains zero untracked or modified files outside `.ai/worklog/`.

---

### F-004 - MEDIUM - Gameable C0 Acceptance Criteria

- **Location**: Plan §5 (Acceptance Criteria)
- **Confidence**: High
- **Analysis**:
  The criterion "prune preserves a live session's journal (with and without a registered supervisor)" can be satisfied by a broken implementation that simply skips any journal file with size > 0. Such an implementation would pass the criterion but permanently prevent dead sessions from being pruned.
- **Recommendation**:
  Replace with a three-branch criterion:
  1. `supervisorPid: alive` + `pid: dead` -> journal and snapshot PRESERVED.
  2. `supervisorPid: dead` + `pid: dead` -> journal and snapshot PRUNED.
  3. `supervisorPid: null` + `pid: dead` + outside recency window -> journal and snapshot PRUNED.

---

## Deep Dives by Attack Vector

### V1 — Factual Base Verification

1. **Receipt Freshness Across Owners**:
   Reproduced at commit `a6dbf8c` with working tree:
   - `claude-123ff4a27989f7af`: STALE (Recorded `sha256:4718e9e7...`, tree is `sha256:1450bc6f...`, exit 1)
   - `mistral-vibe-7d4ebdb4413f0de0`: STALE (Recorded `sha256:1eee0f11...`, tree is `sha256:1450bc6f...`, exit 1)
   - `gemini-2da9379ddcd247b6`: FRESH (Recorded `sha256:1450bc6f...`, tree is `sha256:1450bc6f...`, exit 0)
   - `copilot-13595b63-cf45-4860-a3e7-05c7972c5702`: STALE (Recorded `sha256:93533bf2...`, tree is `sha256:1450bc6f...`, exit 1)
   - `deepseek-flash-ebd6eb9397ed3784`: STALE (Recorded `sha256:1eee0f11...`, tree is `sha256:1450bc6f...`, exit 1)

   *Finding*: DeepSeek's plan asserted that DeepSeek's receipt was fresh while others were stale. That was true when DeepSeek wrote its plan at digest `sha256:1eee0f11...`. However, when Gemini later recorded at `sha256:1450bc6f...`, DeepSeek's receipt became stale as well. This perfectly demonstrates the cascade effect of multi-agent review writes.

2. **Digest Exclusion Rule in Code**:
   Inspected `.ai/bin/protocol-hooks.cjs:125`:
   ```javascript
   if (name.startsWith('.ai/runtime/') || name.startsWith('.ai/worklog/') || name === '.ai/ARCHIVE.md') continue;
   ```
   - `.ai/runtime/` is excluded.
   - `.ai/worklog/` is excluded.
   - `.ai/ARCHIVE.md` is excluded.
   - `docs/reviews/` and `.ai/TASK.md` are **included**.
   *Finding*: Confirmed. The plan's statement that worklog is excluded and reviews/TASK are included is correct, but the plan overlooked that `.ai/ARCHIVE.md` is ALSO excluded.

3. **Journal Count**:
   - Total `.md` files in `.ai/worklog/`: 30 files.
   - Excluding `README.md`: **29 session journals**.
   - `validate-protocol.ps1` run: `Protocol OK. 0 warning(s).`
   *Finding*: The validator warning (34/30) reported in the plan has since been resolved by manual archiving of 6 historical journals into `.ai/ARCHIVE.md` (532 lines added), confirming the archiving mechanism works as intended.

---

### V2 — C0 and F1 Fix Attack

1. **Dead / Stale `supervisorPid`**:
   If a session registers a `supervisorPid` that subsequently crashes or terminates, a naive check could fail. Checking `process.kill(supervisorPid, 0)` correctly returns `false` (or throws `ESRCH`), allowing normal pruning.
2. **Recency Fallback Risks**:
   Using file modification time (`mtime`) for recency fallback is hazardous: calling `stop` touches the file mtime, which would falsely refresh the recency of a cleanly stopped dead session.
   *Improvement*: Use `startTime` from the snapshot JSON payload, or record an explicit `heartbeat` timestamp.
3. **Foreign Host Handling**:
   `isProcessAlive` returns `null` when `record.hostname !== os.hostname()`. Lines 247/261 of `cleanup-runtime` only prune when `isProcessAlive === false`. Sessions from other hosts are safely preserved.
4. **PID Recycling**:
   While Windows PID recycling is possible over extended periods, the probability of a transient supervisor PID being recycled into a live PID within an operational cycle is minimal. Regardless, a maximum session TTL (e.g. 24 hours) eliminates indefinite zombie sessions.
5. **Alternative: Heartbeat Field**:
   Instead of complex supervisor tracking, adding an updated `lastHeartbeat: Date.now()` field in the session snapshot whenever the agent executes a command provides a simple, universal liveness signal for both hooked and hookless sessions.

---

### V3 — Mechanical Attack on F6 Freeze Protocol

1. **Does Auto-Archive Break F6?**:
   DeepSeek raised the concern that `protocol-handoff.cjs record` triggers `autoArchiveWorklog`, which writes to `.ai/ARCHIVE.md`, potentially altering the tree digest mid-pass.
   *Proof of Safety*: As proven in V1, `.ai/ARCHIVE.md` is explicitly excluded from the anchor digest at `protocol-hooks.cjs:125`. Therefore, auto-archive operations during `record` do NOT change the anchor digest.
2. **Does `rehash` Change the Digest?**:
   `rehash` only rewrites the entry hash in `.ai/worklog/<journal>.md`. Since worklogs are excluded, `rehash` is completely digest-neutral.
3. **Does `record --quick` Skip Digest Writes?**:
   No. Line 544 of `protocol-handoff.cjs` executes `anchor(root)` regardless of whether `--quick` is set.
4. **The Real F6 Hazard**:
   If an untracked review file or modified task document is present during the re-record pass, the tree digest diverges. F6 must mandate `git status` cleanliness for tracked/untracked review paths before re-recording.

---

### V4 — Fork Framing Attack

1. **F2 (Gate Freshness)**:
   *Unmentioned failure mode*: A hard requirement for `verify --deep` of the cited review at gate time creates a circular dependency if the act of recording the completion in `.ai/TASK.md` alters the tree digest.
   *Hybrid alternative*: Allow the completion gate to verify against the release commit SHA rather than an uncommitted dirty tree state.
2. **F3 (Journal Cap Policy)**:
   *False dilemma*: Framing choices solely as "keep 30" vs "raise to 40" ignores convention-based segregation.
   *Alternative*: Place release certification journals in `.ai/worklog/certifications/` or exclude files matching `*-release-*.md` from the operational 30-journal cap.
3. **F4 (Legacy Evidence)**:
   Keeping legacy receipts label-only with clear documentation is pragmatic. Requiring universal re-recording violates DEC-0016 immutability.
4. **F5 (Next-Cycle Vehicle)**:
   Addressing C0 in a focused `v1.9.5` patch release is optimal. Delaying C0 into `v2.0` leaves a reproducible violation of PROTO-DEC-0025 in production.
   *Consumer Impact*: Consumers (Block-Puzzle, VPN) run v1.9.4 with C0. However, consumers operate under Claude/Codex hooks where supervisor PIDs are rarely CLI-transient. Impact is LOW. Re-sync order must be source first, tag v1.9.5, then downstream sync.

---

### V5 — Omissions and Priorities

1. **Missing: Relaxation of `--supervisor-pid` restriction**:
   `protocol-session.cjs:75-76` must be modified to allow orchestrators to supply valid supervisor PIDs.
2. **Missing: `git push` synchronization**:
   `main` is ahead of `origin/main` by 10 commits. Multi-agent workflows risk branching divergence without a push policy.
3. **Missing: Validator tests for new gate check**:
   If F2 is implemented, regression tests must be added to `tests/validator.test.cjs`.
4. **Missing: Dedicated Decision Block**:
   C0 warrants `PROTO-DEC-0029` because it directly modifies the binding liveness rules settled in PROTO-DEC-0025.

---

### V6 — Acceptance Criteria Attack

The plan's acceptance criteria state:
`C0 fixed: prune preserves a live session's journal (with and without a registered supervisor); cleanup-runtime preserves a live snapshot; a confirmed-dead session is still prunable; regressions added.`

*Vulnerability*: A bad implementation that simply changes `prune` to never delete non-empty journals would satisfy this criterion while completely breaking the cleanup of orphaned sessions.

*Required Revision*: Specify measurable test cases across all three distinct operational states:
- State A: `supervisorPid` alive, `pid` dead -> preserved.
- State B: `supervisorPid` dead, `pid` dead -> pruned.
- State C: `supervisorPid` null, `pid` dead, outside TTL -> pruned.

*Re-run Scope*: Re-running all 6 vectors is unnecessary. Vector 2 (Session & Lock Liveness) plus the full regression suite (`test-protocol.ps1`) and validator provide 100% coverage of the affected pathways.

---

### V7 — Meta Review

- Council questions Q1–Q6 are well-formulated.
- Additional questions needed:
  - **Q7**: Should `--supervisor-pid` CLI validation allow any live PID on the local host?
  - **Q8**: Should `git push` be integrated into the release ceremony?
  - **Q9**: Should certification journals be segregated from operational journals?
- Plan maintains proper governance etiquette: correctly identifies itself as an INTERIM proposal and defers final authority to the human owner.

---

## Per-Fork Recommendations & Counter-Arguments

| Fork | Choice | Recommendation | Strongest Counter-Argument |
|---|---|---|---|
| **F1** | (a)+ | Supervisor-first liveness + `startTime`-based recency fallback + relax line 75-76 | Two mechanisms increase testing surface; fallback could prolong dead sessions |
| **F2** | (a)+ | Gate freshness required via commit-anchored verify | Increases friction if non-critical docs are edited post-gate |
| **F3** | (a)/(d) | Keep 30 with documented release-gate archival; investigate convention segregation | Manual archival introduces human error unless checked by CI |
| **F4** | (a) | Keep label-only policy for legacy receipts + document explicitly in PROTOCOL.md | Legacy receipts remain susceptible to unnoticed edits |
| **F5** | (a) | Release `v1.9.5` for C0–C3+C5; defer C7 to `v2.0` | Extra tag/release cycle adds release maintenance overhead |
| **F6** | (a)+ | Commit docs freeze first, verify no untracked reviews, then single re-record | Requires strict coordination discipline among all active agents |

---

## Answers to Council Questions

1. **Q1 (F1 mechanism & window)**: Supervisor-first check via `isProcessAlive` checking `record.supervisorPid ?? record.pid`. For hookless sessions with no supervisor, use `startTime` recency fallback with a 60-minute window (or heartbeat mechanism). Relax `protocol-session.cjs:75-76` to permit any verified local process.
2. **Q2 (Stale receipt validity)**: A stale receipt does NOT invalidate a certification that was valid when recorded—the cryptographic entry hash guarantees the findings were unaltered. However, for the completion gate, the receipt must verify against the frozen release commit.
3. **Q3 (Journal cap)**: Keep 30 for active operational journals. Multi-model release councils should archive older entries to `ARCHIVE.md` as part of the release ceremony.
4. **Q4 (Decision block PROTO-DEC-0029)**: YES. C0 directly amends PROTO-DEC-0025 item 3. Any change to binding session liveness semantics must be recorded in an approved decision block.
5. **Q5 (Chat-only artifacts sanction)**: Any audit or review that exists only in chat is NON-COMPLIANT under AGENTS.md §5 and must be excluded from completion gate citations. The validator should verify that all completion gate review paths exist in `docs/reviews/`.
6. **Q6 (Re-run scope post-C0)**: A targeted review focusing on Vector 2 (Session & Lock Liveness) combined with a clean run of `test-protocol.ps1` (200/200) and `validate-protocol.ps1` (0 warnings) is sufficient. Full six-vector re-certification is redundant.

---

## Delta List

1. **ADD**: Fix `--supervisor-pid` restriction in `protocol-session.cjs:75-76` to allow external supervisor PIDs. (*Prerequisite for F1(a) in real orchestrators*)
2. **ADD**: Explicit three-branch test criteria for C0 liveness verification. (*Prevents gaming of acceptance criteria*)
3. **ADD**: Pre-record clean check in F6 requiring zero untracked `docs/reviews/` files. (*Prevents digest divergence*)
4. **ADD**: Decision block `PROTO-DEC-0029` for C0 liveness resolution. (*Maintains binding governance integrity*)
5. **ADD**: Council question Q7 regarding CLI supervisor PID validation. (*Essential for implementation*)
6. **ADD**: Council question Q8 regarding `git push` release synchronization. (*Prevents upstream divergence*)
7. **MODIFY**: Clarify in F6 that auto-archive writes to `ARCHIVE.md` do NOT change digest (hooks:125). (*Corrects false mechanical concern*)
8. **MODIFY**: C0 root cause to include callers at `prune:182` and `cleanup-runtime:247,261`. (*Ensures complete fix*)
9. **MODIFY**: F3 to include option (d) convention-based journal segregation. (*Eliminates false dilemma*)
10. **REMOVE**: Carried hypotheses C7 from v1.9.5 scope. (*Keeps patch release focused on defects*)

---

## Command Output for Reproduced Claims

### 1. Verification of Stale vs Fresh Receipts (V1)
```powershell
PS D:\Colabs> node .ai/bin/protocol-handoff.cjs verify --owner claude-123ff4a27989f7af --deep
AI protocol: .ai\worklog\claude-123ff4a27989f7af.md evidence is stale. Recorded sha256:4718e9e7e2665b95c52c61ec63fb2941c16ff85d87d12ad4aa9ddabc0909e3aa, tree is now sha256:1450bc6f3e3d580b232403fb05e0ece48ea92f8e5b59a4b0e9b573332fc5d7b6.

PS D:\Colabs> node .ai/bin/protocol-handoff.cjs verify --owner deepseek-flash-ebd6eb9397ed3784 --deep
AI protocol: .ai\worklog\deepseek-flash-ebd6eb9397ed3784.md evidence is stale. Recorded sha256:1eee0f11a993794630f891125849cf2e28ed8f58701120fb7789fecd7218f9f9, tree is now sha256:1450bc6f3e3d580b232403fb05e0ece48ea92f8e5b59a4b0e9b573332fc5d7b6.

PS D:\Colabs> node .ai/bin/protocol-handoff.cjs verify --owner gemini-2da9379ddcd247b6 --deep
.ai\worklog\gemini-2da9379ddcd247b6.md: evidence matches the current tree
```

### 2. C0 Reproduction in Isolated Fixture (V2)
```powershell
PS D:\Colabs> node C:\Users\Dmitry\.gemini\antigravity-ide\brain\4bd6d59e-2bc9-4f80-97cc-3a15261516ec\scratch\c0_test.cjs
--- Probing prune on fixture ---
STDOUT: quarantined test-c0-1234567890abcdef.md
1 journal(s) quarantined.
Was journal quarantined to pruned/? true

--- Probing cleanup-runtime on fixture ---
STDOUT: 0 file(s) cleaned.
Does state file still exist? false
```

### 3. Validator Status with 29 Worklog Journals (V1)
```powershell
PS D:\Colabs> (Get-ChildItem -File .ai\worklog\*.md | Where-Object { $_.Name -ne 'README.md' }).Count
29

PS D:\Colabs> powershell -ExecutionPolicy Bypass -File .\validate-protocol.ps1
...
Protocol OK. 0 warning(s).
```

---

## References

- Plan under review: `docs/reviews/2026-09-19-deepseek-flash-interim-council-plan.md`
- Prompt: `docs/reviews/2026-09-19-interim-plan-adversarial-review-prompt.md`
- Supporting review: `docs/reviews/2026-09-19-deepseek-flash-certification-integrity-and-consolidation.md`
- Decision blocks: `PROTO-DEC-0025`, `PROTO-DEC-0028` in `.ai/DECISIONS.md`
- Codebase: `.ai/bin/protocol-session.cjs`, `.ai/bin/protocol-hooks.cjs`, `.ai/bin/protocol-handoff.cjs`
- Session journal: `.ai/worklog/gemini-2da9379ddcd247b6.md`
