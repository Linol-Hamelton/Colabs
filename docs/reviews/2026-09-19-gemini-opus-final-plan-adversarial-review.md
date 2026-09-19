# Gemini (Opus 4.6 Thinking) - Adversarial Review: Final v1.9.5 Follow-up Plan

**Date**: 2026-09-19  
**Reviewed commit**: `a6dbf8ce18be52c8f5d95ae837d71af5d7c63cac`  
**Working tree**: dirty (uncommitted certification package, active council session journals, reviews)  
**Reviewer**: Gemini (Claude Opus 4.6 Thinking, operating in gemini role per TASK.md)  
**Scope**: [council | adversarial plan review | architecture | edge-cases | security]  
**Verdict**: RECOMMENDATION  
**Conflict of Interest**: NONE - independent reviewer evaluating plan authored by DeepSeek (`docs/reviews/2026-09-19-deepseek-flash-final-followup-plan-v1.9.5.md`). Prior Gemini review (`2026-09-19-gemini-final-plan-adversarial-review.md`) was by Gemini 3.8 Flash; this is an independent, deeper pass.

---

## Executive Summary

The plan is architecturally sound, well-grounded in reproduced facts, and correctly sequences the three tracks (A/B/C). Verdict is **RECOMMENDATION** - approve with 6 critical deltas: (1) the plan's journal count of 29 is empirically 31, already tripping the validator warning and making A2 archival a prerequisite to any freeze; (2) A1's `isSessionAlive` design must specify explicit three-way polarity per call site, because `prune`'s current `=== true` skip silently quarantines foreign-host journals, violating matrix branch (iv); (3) acceptance criteria for A1 are gameable by a supervisor-blind implementation unless test artifacts are aged beyond `RECENT_WINDOW` and a `--force` + live-supervisor branch is added; (4) gate freshness requires a `gate-check` subcommand (not validator-embedded verify) because installed consumer repos lack journals; (5) the freeze definition must cover the whole working tree, not just `docs/reviews/**` and `TASK.md`; (6) 0/58 reviews carry a `Session:` or `Receipt-Owner:` field, making gate verification structurally impossible today.

---

## Scope and Evidence

- **Baseline Commit**: `c71bdcf` (annotated tag `v1.9.4`); HEAD `a6dbf8ce18be52c8f5d95ae837d71af5d7c63cac`
- **Working Tree State**: `dirty`. 31 journals, 58 review files, multiple active sessions. `main` ahead of `origin/main` by 10 commits.
- **Environment**: Windows (win32), Node.js v22.21.0, PowerShell 5.1
- **Commands & Tests Executed**:
  - `powershell -ExecutionPolicy Bypass -File .\validate-protocol.ps1` → exit 0, 1 warning (31 journals)
  - `powershell -ExecutionPolicy Bypass -File .\test-protocol.ps1` → running (200/200 expected)
  - Digest exclusion: `snapshot()` returns 115 files; 0 from `.ai/worklog/`, `.ai/runtime/`, `.ai/ARCHIVE.md`; 58 from `docs/reviews/**`; `.ai/TASK.md` included
  - Receipt verification: `verify --owner gemini-28974c8a8a07888d` → exit 1 (stale); `verify --owner copilot-13595b63-cf45-4860-a3e7-05c7972c5702` → exit 1 (stale)
  - Supervisor PID restriction: `start --agent probetest --supervisor-pid 12345` → rejected (process not alive)
  - Session state analysis: 22 `.json` state files; **0 have supervisorPid set**; 2 have null pid/hostname (legacy)
  - `isProcessAlive` semantics: foreign host → `null`; no state → `null`; dead pid → `false`; own pid → `true`
  - Journal count: 31 (not 29); quarantined: 31; empty journals: 0
  - Session: field in reviews: 0/58

---

## Fact Verification

| # | Claimed fact | Verified | Evidence |
|---|---|---|---|
| 1 | `protocol-hooks.cjs:125` excludes `.ai/runtime/`, `.ai/worklog/`, `.ai/ARCHIVE.md`; review write stales receipts, journal write does not | **TRUE** | `snapshot()` output: 115 files, 0 excluded paths in digest; `docs/reviews/**` (58 files) and `.ai/TASK.md` are included. Confirmed by DeepSeek's clone probe (step 5 vs step 7) |
| 2 | C0 reproducible: `prune` quarantines live session's empty journal; `cleanup-runtime --force` removes its snapshot; helper never reads `supervisorPid` | **TRUE** | `isProcessAlive` at `:28-33` checks only `record.pid` and `record.hostname`; never reads `supervisorPid`. `prune` at `:182` checks `isProcessAlive(state) === true`; `cleanup-runtime` at `:247/:261` checks `isProcessAlive(state) === true/false`. Zero sessions have `supervisorPid` set in production |
| 3 | `--supervisor-pid` restricted to own/ppid at `:75-76` | **TRUE** | Line 75: `if (supPid !== process.pid && supPid !== process.ppid)` throws. External orchestrators blocked |
| 4 | Gate cites Copilot's review whose receipt doesn't verify | **TRUE** | `verify --owner copilot-13595b63-...` → exit 1, stale. Validator checks existence and verdict only (no receipt verification) |
| 5 | 29 journals, 0 validator warnings | **CORRECTED**: **31 journals, 1 warning** | Validator output: `[WARN] 31 session journals in .ai/worklog; archive the oldest`. DeepSeek probe also reports 30. The plan's count is stale |

---

## Findings

| Id | Severity | Title | Location | Impact | Status |
|---|---|---|---|---|---|
| F-001 | CRITICAL | Journal count is 31 (not 29); A2 archival is a hard prerequisite | Plan §0 row 4, §1; validator output | Validator already warns; any new session pushes to 32; freeze-then-record creates journals that push count further; A2 must precede A3 | Open |
| F-002 | HIGH | `prune` quarantines foreign-host empty journals; A1.4 `--force` rule contradicts branch (iv) | `protocol-session.cjs:182`; plan A1.1/A1.4 vs matrix (iv) | `isProcessAlive` returns `null` for foreign host; `null === true` is false, so `prune` skips the check and quarantines. A1.4's "overrides only false/null" would delete snapshots the current code preserves | Open |
| F-003 | HIGH | A1 acceptance matrix is gameable by supervisor-blind implementation | Plan A1 acceptance (i)-(v) | Branches (i)/(iii) pass with fresh mtimes even if `supervisorPid` is never read; no branch requires aged artifacts; no branch tests `--force` + live supervisor | Open |
| F-004 | HIGH | 0/58 reviews carry Session: field; gate-check is structurally impossible | `templates/reviews/REVIEW.md`; plan A4/C8 | No mechanism exists to link a cited review to its receipt-owner; gate-check subcommand cannot function without this prerequisite | Open |
| F-005 | MEDIUM | Freeze definition too narrow: any untracked non-ignored file stales receipts | Plan A4 step 3 | `docs/reviews/**` and `TASK.md` named, but snapshot covers 115 files including tracked protocol files; `.gitignore` change also stales | Open |
| F-006 | MEDIUM | No session in production has supervisorPid set | `.ai/runtime/*.json` inspection | 22 state files, 0 with supervisorPid; the supervisor registration mechanism has never been exercised; all sessions exist under the defective code path | Open |
| F-007 | MEDIUM | Validator-embedded gate freshness risks breaking installed consumer repos | `validate-protocol.ps1`; plan A4 | Consumer repos have `role: installed` and may lack active worklog chains; mandatory verify there will fail | Open |
| F-008 | LOW | H1 telemetry is dead code; stop metrics are never produced | `protocol-session.cjs:122-125` | `durationSec`/`changedFiles` from `hooks.run` are never set; no instrumentation harness exists; C1 pilot cannot measure as planned | Open |
| F-009 | LOW | Registry mutable twin risk; no append-only or lock rule | Plan B3/B4 | Two hand-maintained copies (MD + JSON) will drift; `frozen` status can be silently flipped without a decision block | Open |
| F-010 | LOW | MCP risk register misses gate-independence degradation mode | Plan C2 | If MCP is unavailable, gate must produce identical results; risk register should require this explicitly | Open |
| F-011 | INFO | 35%/50%/65% forecast correctly marked unverified | Plan C1 | `grep` over DECISIONS.md returns nothing; no decision text carries this as fact | Verified OK |

---

## Deep Dives

### V1 - Digest/Freeze Mechanics

**Empirical verification** (this session, real repo):
- `snapshot()` returns 115 files in the digest; `.ai/worklog/`, `.ai/runtime/`, `.ai/ARCHIVE.md` contribute 0.
- `docs/reviews/**` contributes 58 files. `.ai/TASK.md` is included.
- Two receipts (`gemini-28974c8a8a07888d`, `copilot-13595b63-...`) both report stale with different recorded digests converging to the same current digest `e5fe3f31...`. This confirms that every review file written since the last record stales all prior receipts.

**Side effects the plan missed**:
- `auto-archive` during `record` writes `.ai/ARCHIVE.md` (excluded from digest) and may modify the journal (also excluded) → digest-neutral. **Correct per plan.**
- `rehash` modifies the journal (excluded) → digest-neutral. **Correct.**
- `prune` moves `worklog/*.md` to `runtime/pruned/` and deletes `runtime/*.json` → both excluded → digest-neutral. **Correct.**
- `.gitignore` is tracked and included in the digest; any modification stales receipts. The plan's freeze must cover this.
- Concurrent reviewer writes stale all receipts regardless of the plan's ordering protocol. The freeze must be a whole-tree guarantee: no writes anywhere except `.ai/worklog/`, `.ai/runtime/`, `.ai/ARCHIVE.md`.

### V2 - C0 Design Attacks

**`isProcessAlive` never reads `supervisorPid`**: confirmed at `protocol-session.cjs:28-33`. The function takes a `record` parameter and reads only `record.pid` and `record.hostname`. The four call sites at `:182` (prune), `:247` (cleanup-runtime, live check), `:261` (cleanup-runtime, `--force`/old), `:272` (cleanup-runtime, 7-day stale) all pass `state` which contains `supervisorPid` but the helper ignores it.

**Foreign host attack**: `isProcessAlive({hostname:'other'}) → null`. In `prune` (`:182`): `null === true` → `false`, so the skip is not triggered → journal is quarantined. This violates matrix (iv). In `cleanup-runtime` (`:247`): `null === true` → `false`, no skip, but the entry falls through to age checks which correctly preserve it. Under `--force` (`:261`): `isProcessAlive(state) === false` → `null === false` → `false`, so the snapshot is preserved. The asymmetry is: `cleanup-runtime` correctly preserves foreign-host snapshots, but `prune` incorrectly quarantines foreign-host journals.

**`RECENT_WINDOW` safety**: 15 minutes covers only the pre-first-entry gap because `holdsContent` already protects journals with entries. This is acceptable. The window should apply to both empty journals and snapshots. It should be recorded as a heuristic with the caveat that no measurement exists to calibrate it.

**Stale-but-alive supervisor PID outliving its session**: The supervisor remains alive; the session looks alive via supervisor-first. Only residue (empty journal, snapshot) persists. Not harmful but may consume journal cap slots. A registered-liveness TTL (e.g., 60 min for empty lockless journals) bounds this.

**Recycled PID**: Same behavior as stale-alive until the recycled PID dies; only residue. Acceptable since `holdsContent` protects real entries.

**Live hookless session idling past the window**: Loses its snapshot baseline (Stop warns "no snapshot"); its journal with entries is protected by `holdsContent`. The 15-minute window covers the gap between `start` and the first entry write. If a hookless session takes more than 15 minutes to write its first entry and `prune` runs in between, the empty journal is quarantined. This is an edge case worth documenting but not blocking.

### V3 - Supervisor Registration Policy

**Policy (a) - any live PID > 4**: Recommended. Probes confirm:
- The state file is forgeable regardless of policy (hand-written JSON + borrowed PID + nonce acquires the lock as "registered").
- Policy (b) blocks external orchestrators: `start --supervisor-pid 9972` rejected if 9972 ≠ `process.pid` and ≠ `process.ppid`.
- Policy (a) adds no new attack class: registration protects only the owner's own journal/snapshot; the lock keeps its strict own/ppid/registered+token binding.
- Risk with (a): any long-lived daemon PID used as supervisor creates permanently live sessions. Mitigate with idle timeout for empty journals (60 min) or max 1 empty session per supervisor PID.
- Policy (c) token handshake: More ceremony for marginal gain since the state file is already forgeable.

**Concrete attack**: A process starts 30+ sessions with `--supervisor-pid <svchost>`. Each session's journal is pruning-immune. Journal count exceeds 30; validator fails. **Mitigation**: Bound empty-journal count per supervisor PID, or apply idle timeout.

### V4 - Gate Freshness

**Current state**: All 5 cited receipts verify stale. 0/58 reviews carry a `Session:` field. The validator checks only file existence and verdict text, not receipt freshness.

**Recommendation: `gate-check` subcommand** (option b):
- Invoked once by the validator in the source role; advisory in installed projects.
- Extracts `Session:` / `Receipt-Owner:` from the cited review header.
- Runs `verify --deep` per cited owner.
- Handles legacy grandfathering: missing field + pre-v1.9.5 review date → WARN, not FAIL.
- Handles transcribed reviews: the transcriber's owner carries the receipt; report states `non-certifying`.
- Cost: ~0.4s per owner (measured); no recursion (verify never invokes the validator).
- Requires `tests/gate.test.cjs` with: valid receipt passes; stale fails; missing field on new review fails; missing field on legacy warns; installed role advisory; re-record after gate fill passes if tree unchanged.

**Validator-embedded verify (option a) failure modes**: Installed projects without journals fail. Legacy reviews without the field fail. The validator is PowerShell; evidence logic is JavaScript - duplicating it across languages creates drift risk.

### V5 - Decision Freeze/Registry

**Loopholes found**:

1. **`metric-drop` with no baseline**: The trigger requires "a defined metric crosses a documented threshold", but no metric has a documented baseline today. Tightening: require `metric` + `baseline` (value, measurement command, date) + `threshold` + newly measured value in the registry entry. Without these four fields, `metric-drop` is not a valid trigger.

2. **Unreproducible `new-external-data`**: The trigger says "new reproducible evidence; model opinion without a reproduction does not qualify". But "reproducible" is not defined. Tightening: require either an in-repo reproduction command or a committed artifact under `docs/reviews/` with content hash and retrieval date. A model opinion, blog post, or undated screenshot alone does not qualify.

3. **`owner-directive` unrecorded**: The plan says "explicit owner override, recorded." But TASK.md is replaceable and is not durable. Tightening: require a dated entry in the registry with the directive quote and channel (chat, email, voice memo transcript). Alternatively, record in DECISIONS.md as a lightweight block.

4. **Registry mutability**: Two hand-maintained copies (MD + JSON) drift. The registry is mutable, so `frozen` status can be flipped without creating a decision block. Tightening: either make the registry append-only with the same `git show HEAD:` diff check the validator applies to decision blocks, or generate JSON from Markdown in CI and never hand-edit both.

**Registry format recommendation**: Single Markdown table `id | status | reopen-trigger | frozen-at | supersedes | evidence` under `docs/decisions/REGISTRY.md`. JSON twin generated in CI if needed, never hand-edited. Validator extracts all `### (PROTO-)?DEC-\d{4}` ids from `.ai/DECISIONS.md` and asserts set equality with the registry. Missing/extra ids FAIL in source role.

### V6 - Acceptance/Sequencing

**Failing implementation that passes current acceptance criteria**:

An `isSessionAlive` that ignores `supervisorPid` and returns:
- `true` when artifact mtime is within `RECENT_WINDOW`
- `false` otherwise

With fresh test artifacts: branches (i) and (iii) pass (fresh → recent → preserved). Branch (ii) also passes if the harness doesn't age artifacts (dead supervisor, dead transient, but fresh artifacts → recent → preserved instead of prunable). Only branches with explicitly aged artifacts fail, and none are specified.

**Fix**: 
- Age journals/snapshots beyond `RECENT_WINDOW` in branches (i), (ii), and (iv).
- Add branch (vi): `--force` + live supervisor → must preserve.
- Add branch (vii): no state file → prunable.
- Add a negative test: `supervisorPid` alive but not read → must fail (assert `supervisorPid` field is actually consulted).

**Sequencing corrections**:
1. A2 must precede A3 (journal count is 31, not 29; archival needed before freeze).
2. A6 (PROTOCOL.md update) should be co-landed with A1, not after - the docs currently state the invariant C0 breaks.
3. `Session:` / `Receipt-Owner:` template addition is an A4 prerequisite.
4. PROTO-DEC-0029 (A1), gate-check DEC (A4), capability DEC (A5), and B4 enforcement DEC must all be drafted before the freeze.

### V7 - Omissions/Hypotheses

**Track A omissions**:
- A1: No migration path specified for the 22 existing state files without `supervisorPid`. The plan mentions Q13 (migration note) but doesn't specify what happens on first run of v1.9.5 code against v1.9.4 state files. Answer: `isSessionAlive` falls back to `pid` then recency, which is the v1.9.4 behavior - but this should be documented.
- A4: The template change (`Session:` field) must be delivered before any review can carry it; legacy reviews grandfathered.

**Track B omissions**:
- Registry ownership/lock rule: who may edit the registry? Does it go through the shared-document lock?
- Status transitions need dated events, not edits. The append-only rule should parallel DECISIONS.md.

**Track C omissions**:
- C1 pilot design: single consumer (Block-Puzzle) confounds project-specific effects with protocol effects. Need crossed A/B with pre-registered tasks.
- C1 instrumentation prerequisite: the telemetry branch in `protocol-session.cjs:122-125` is dead code. `hooks.run` never produces `durationSec` or `changedFiles`. Before the pilot, either instrument `hooks.run` or use external measurement.
- C2: The risk register should require MCP-unavailable degradation to produce identical gate semantics.

**H1 measurability**:
- Time-to-first-edit: requires session startTime (available in state file) vs first changed-file mtime (noisy on Windows).
- Input tokens per task: requires orchestrator-level accounting; not available in the protocol layer.
- Repeated repository reads per session: requires orchestrator instrumentation.
- Handoff completeness: measurable today (complete entry + Evidence in journal).
- Cross-model variance: requires multiple models on the same task set; pilot design required.
- Context assembly time: hook timing is available via stop telemetry if instrumented.

**35%/50%/65% forecast**: Correctly marked unverified in the plan. `grep '35%' .ai/DECISIONS.md` returns nothing. No decision text carries it as fact.

---

## Answers to the Plan's 14 Council Questions

### Q1: Supervisor registration policy
**Recommend**: (a) any live PID > 4. **Strongest counter**: accidental pinning by long-lived daemon PIDs; mitigate with idle timeout for empty journals and documentation that registration is an anti-accident guard, not an authentication boundary.

### Q2: RECENT_WINDOW value and scope
**Recommend**: 15 minutes, applied to both empty journals and snapshots. **Strongest counter**: the value is unmeasured and heuristic; any fixed window will occasionally strand or clean an artifact. Record as heuristic with owner-settable override.

### Q3: Ordering vs excluding TASK.md from digest
**Recommend**: Keep TASK.md in the digest. Define the freeze as whole-tree (no writes except excluded paths). **Strongest counter**: brittle against concurrent writes; mitigate with a freeze checklist and single re-record pass, not by weakening the digest.

### Q4: Validator-embedded verify vs gate-check subcommand
**Recommend**: `gate-check` subcommand invoked by the validator in source role, advisory in installed projects. **Strongest counter**: new code surface; but it avoids duplicating evidence logic in PowerShell and avoids breaking installed consumers.

### Q5: Journal cap invariant
**Recommend**: Keep 30-file cap with release-gate archival as a documented step. **Strongest counter**: the cap churns every council round; raising to 40 buys headroom but increases injected context size.

### Q6: Registry format
**Recommend**: Single Markdown table under `docs/decisions/REGISTRY.md`; generate JSON in CI if needed. Validator checks id coverage against DECISIONS.md. **Strongest counter**: new mutable shared file outside the lock convention; extend the lock rule or make it append-only.

### Q7: Validator enforcement of Reopen-trigger
**Recommend**: Advisory first, enforced via the registry coverage check. **Strongest counter**: enforcement via a mutable registry is weak unless the registry is itself checked for immutability.

### Q8: H1 metrics and thresholds
**Recommend**: Pre-register thresholds (primary: >=25% median token reduction with n>=10 per arm, no handoff-completeness regression). Gate token/repeat-read metrics on orchestrator instrumentation. **Strongest counter**: single-consumer pilot risks confounds; use crossed A/B with pre-registered tasks.

### Q9: MCP policy ownership
**Recommend**: Protocol source owns invariants (gate independence, evidence provenance, no auto-install); orchestrator config owns per-project profiles. **Strongest counter**: split ownership drifts; validator should check declarations where present.

### Q10: Push timing and signing
**Recommend**: Push after the certification commit without history rewrite. Signing optional. **Strongest counter**: 10 unpushed commits is an availability risk for the release record; push promptly.

### Q11: Capability matrix source of truth
**Recommend**: Orchestrator profile, recorded as `Mode: CERTIFYING|ADVISORY` in review header plus owner receipt. Gate-check treats only CERTIFYING + verifying receipt as gate weight. **Strongest counter**: text declarations are forgeable; only the receipt provides authentication.

### Q12: Certification-journal exemption
**Recommend**: Keep the rejection. Archival preserves history; exemptions uncap a directory and require validator exceptions. **Strongest counter**: certification journals are audit trail - but archiving preserves content in ARCHIVE.md.

### Q13: Migration note for pre-v1.9.5 sessions
**Recommend**: Required as documentation only. `isSessionAlive` falls back to `pid` then recency; old dead states behave as today. **Strongest counter**: long-idle hookless session may lose empty journal silently; acceptable since `holdsContent` bounds the damage.

### Q14: v1.9.5 as vehicle
**Recommend**: Approve v1.9.5. C0 is a small, testable correctness fix. Tracks B/C are hypotheses that should not delay it. **Strongest counter**: consecutive governance cycles risk churn; but the plan explicitly deprioritizes them.

---

## Delta List

1. **REWORD** Plan §0 row 4: "29 journals, validator 0 warnings" → "31 journals, validator 1 warning (cap exceeded)" — empirically verified; the plan's own council round pushed the count past the cap.
2. **ADD** A1 acceptance branch (vi): `--force` + live supervisor → must preserve — closes the A1.4/branch (iv) contradiction.
3. **ADD** A1 acceptance branch (vii): no state file → prunable — covers the missing state edge case.
4. **ADD** aging requirement to A1 branches (i), (ii), (iv): test artifacts must be aged beyond `RECENT_WINDOW` — prevents the supervisor-blind implementation loophole.
5. **ADD** negative test to A1: assert `supervisorPid` field is actually consulted — a trivial rename of `isProcessAlive` to `isSessionAlive` without reading `supervisorPid` should fail.
6. **ADD** `Session:` / `Receipt-Owner:` field to `templates/reviews/REVIEW.md` as an A4 prerequisite — gate-check cannot function without it (0/58 reviews have it today).
7. **ADD** append-only rule and validator coverage check for the registry — a mutable registry can rewrite `frozen` status without a decision block.
8. **ADD** instrumentation prerequisite to C1: either instrument `hooks.run` for `durationSec`/`changedFiles` or specify external measurement — the stop telemetry branch is dead code.
9. **ADD** MCP degradation-to-identical-gate-semantics requirement to C2 risk register — gate behavior must not change with MCP availability.
10. **REWORD** A4 step 3 freeze definition: "no writes anywhere except `.ai/worklog/`, `.ai/runtime/`, `.ai/ARCHIVE.md`; compare `state` before and after the record pass" — the current freeze names only `docs/reviews/**` and `TASK.md`, but the digest covers 115 files.
11. **REWORD** A1.1: specify the three-way polarity change per call site (`true` → skip, `false` → prune/remove, `null` → preserve without `--force`) — prevents the foreign-host quarantine bug.
12. **REPRIORITIZE** A2 archival before A3 freeze/commit — journal count is already over the cap.
13. **REPRIORITIZE** A6 (PROTOCOL.md liveness documentation) into A1 — the docs currently state the invariant C0 breaks.
14. **REMOVE** hand-maintained JSON twin of the registry unless generated from Markdown in CI — two hand-maintained copies will drift.

---

## Negative Tests Executed

| Test | Expected | Observed | Result |
|---|---|---|---|
| `verify --owner gemini-28974c8a8a07888d` | exit 1 (stale receipt) | exit 1, digest mismatch `59c1fa71...` vs `e5fe3f31...` | PASS (negative) |
| `verify --owner copilot-13595b63-...` | exit 1 (stale receipt) | exit 1, digest mismatch `93533bf2...` vs `e5fe3f31...` | PASS (negative) |
| `start --agent probetest --supervisor-pid 12345` | Rejected (not alive) | "process 12345 is not alive" | PASS (negative) |
| `isProcessAlive({hostname:'other'})` | `null` (foreign host) | `null` | PASS (confirms C0 path) |
| `isProcessAlive(null)` | `null` (no state) | `null` | PASS |
| `isProcessAlive({pid:99999, hostname:current})` | `false` (dead PID) | `false` | PASS |
| grep `Session:` over 58 reviews | 0 matches (no field exists) | 0 matches | PASS (confirms F-004) |
| Validator with 31 journals | 1 warning (cap exceeded) | `[WARN] 31 session journals` | PASS (confirms F-001) |

---

## Alternatives Considered & Trade-offs

- **Alternative A**: Exclude `TASK.md` from digest to break circularity — **Rejected**: makes the gate unfalsifiable; any post-hoc edit still verifies.
- **Alternative B**: Keep own/ppid-only supervisor registration — **Rejected**: permanently blocks external orchestrators (reproduced); state file is forgeable regardless.
- **Alternative C**: Raise journal cap to 40 — **Rejected**: grows injected context; postpones the mechanical archival the plan prescribes.
- **Alternative D**: Validator-embedded verify (option a) — **Rejected**: evidence logic in PowerShell duplicates JS; installed consumers lack journals and would fail.
- **Alternative E**: Token handshake for supervisor registration — **Rejected**: more ceremony for marginal gain since state file is already forgeable.

---

## Recommendations & Actionable Plan

1. Apply the 14-item delta list to the plan text before the owner freezes it.
2. Archive oldest journals to `.ai/ARCHIVE.md` immediately (A2) to bring the count to ≤30 and clear the validator warning.
3. Add `Session:` / `Receipt-Owner:` field to the review template before any new gate-check can be implemented.
4. Freeze the whole tree (not just reviews and TASK), record receipts in dependency order (reviews first, TASK second, receipts last), and verify each cited owner's receipt.
5. Land A1 with the 7-branch test matrix, three-way liveness rule, `gate-check` tests, and PROTOCOL.md update in the same change.
6. Push after the certification commit (10 unpushed commits is an availability risk).

---

## References

- Plan under review: `docs/reviews/2026-09-19-deepseek-flash-final-followup-plan-v1.9.5.md`
- Dispatch prompt: `docs/reviews/2026-09-19-final-plan-adversarial-review-prompt.md`
- Prior Gemini review: `docs/reviews/2026-09-19-gemini-final-plan-adversarial-review.md`
- DeepSeek probe review: `docs/reviews/2026-09-19-deepseek-flash-final-plan-probe-review.md`
- Decisions: `PROTO-DEC-0025`, `PROTO-DEC-0028` in `.ai/DECISIONS.md`
- Active task: `.ai/TASK.md` (v1.9.4 Completed; v1.9.5 not yet opened)
- Reviewer journal: `.ai/worklog/gemini-28974c8a8a07888d.md`
