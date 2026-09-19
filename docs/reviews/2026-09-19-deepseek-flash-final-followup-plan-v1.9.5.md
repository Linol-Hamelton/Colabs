# Final Follow-up Plan (v1.9.5 Cycle) - Consolidated After the Last Council Round

**Date**: 2026-09-19  
**Author**: DeepSeek (deepseek-flash), plan author  
**Conflict of interest**: DECLARED - author of the interim plan and phase gate reviews; this is a proposal, the owner fixes the final text.  
**Release baseline**: `c71bdcf` (annotated tag `v1.9.4`); HEAD `a6dbf8c` plus uncommitted certification artifacts  
**Supersedes as the working draft**: `docs/reviews/2026-09-19-deepseek-flash-interim-council-plan.md` and its Addendum D2  
**Inputs**: owner hypotheses; Gemini review (`2026-09-19-gemini-interim-plan-adversarial-review.md`, RECOMMENDATION); Mistral Vibe review (`2026-09-19-mistral-vibe-interim-council-plan-review.md`, RECOMMENDATION); DeepSeek autonomous review (`2026-09-19-deepseek-flash-interim-council-plan-review.md`, RECOMMENDATION); Qoder and GLM responses to the capability analysis.

---

## 0. Corrections to the interim plan (facts re-verified in code)

| Interim claim | Verified fact |
|---|---|
| "`.ai/ARCHIVE.md` is included in the digest, so auto-archive can stale receipts" | FALSE. `protocol-hooks.cjs:125` excludes `.ai/runtime/`, `.ai/worklog/` **and `.ai/ARCHIVE.md`**. Auto-archive during `record` does **not** change the anchor digest. The real freeze hazard is untracked/modified `docs/reviews/**` and `.ai/TASK.md` after the freeze |
| "C0 root cause is `protocol-session.cjs:28-33`" | PARTIAL. `isProcessAlive` is a generic helper; it is correct for `pid`. The defect is that it never consults `supervisorPid`, and the callers (`prune` around `:182`, `cleanup-runtime` around `:247/:261`) pass only the raw state. The fix belongs in the helper plus the call sites |
| "`--supervisor-pid` is usable" | NOT for external orchestrators: `protocol-session.cjs:75-76` accepts only `process.pid` or `process.ppid`, which blocks an IDE or daemon that spawns `start` through a shell. This is a prerequisite for any F1 fix |
| Journal count 34/35/36 | Re-verified: **29 journals, validator 0 warnings** after proper archival; emptied journals were quarantined (header-only files, no content lost). The policy must be invariant-based, not count-based |
| F2 gate freshness has a circular dependency (TASK is inside the digest) | TRUE, and solvable by ordering, see A4 |
| Pipeline passes all receipts at once | TRUE only with the corrected ordering below: docs and TASK first, receipts last (journal writes are digest-neutral) |

## 1. Verified release state

- Tag `v1.9.4` -> `c71bdcf`; post-tag diff is documentation only; versions `1.9.4` uniform.
- Suite 200/200; doctor Healthy; consumers 18/18 SHA-256 match, trees uncommitted (DEC-0025 item 4); `main` is ahead of `origin/main` by 10 commits (no push).
- Certification package (5 reviews, journals, TASK, receipts) uncommitted; the gate cites Copilot's review, whose receipt was stale at check time; Claude/Mistral/Gemini/DeepSeek receipts also went stale as newer artifacts were written.
- Chat-only artifacts remain in the record's shadow: Qoder FAIL, GLM explanation, `cleanup_and_decisions.md`, Claude Code's `v1.9.4_audit_synthesis.md`.

## 2. Track A - v1.9.5 remediation (code and gate)

### A1 - C0 session liveness (HIGH, release blocker for the next cycle)

**Defect**: `prune` quarantines a live session's empty journal and `cleanup-runtime --force` removes its snapshot, even when a registered supervisor is alive. Violates PROTO-DEC-0025 item 3.

**Fix design** (owner chooses the supervisor policy, see Q12):
1. Add `isSessionAlive(state)` in `protocol-session.cjs` mirroring the lock's `processAlive`: prefer `supervisorPid` when it is a valid live PID; else `pid`; else `null` for a foreign host. Replace the four `isProcessAlive(state)` call sites.
2. Recency fallback for sessions with no live registered supervisor: an empty journal and a snapshot whose mtime is within `RECENT_WINDOW` are treated as active. Recommended window: 15 minutes (Gemini proposed 5; the window only covers the pre-first-entry gap because `holdsContent` already protects journals with entries). Owner sets the final value.
3. Supervisor registration policy (prerequisite; Q12): recommended - accept any live PID `> 4` for `--supervisor-pid`, because registration only protects the *owner's own* journal and snapshot; lock acquisition keeps the strict own/ppid/registered+token binding. Alternatives: keep own/ppid only (external orchestrators stay unsupported) or token handshake (more ceremony).
4. `cleanup-runtime` must never delete a snapshot while `isSessionAlive` is `true` or `RECENT`; `--force` overrides only `false`/`null`, with the existing audit message.

**Acceptance - three-branch matrix (mandatory, closes the gameable criterion)**:
- (i) `supervisorPid` alive + transient PID dead -> journal preserved, snapshot preserved.
- (ii) `supervisorPid` dead + transient PID dead -> journal prunable, snapshot removable.
- (iii) no `supervisorPid`, snapshot older than `RECENT_WINDOW` -> prunable/removable; within the window -> preserved.
- (iv) foreign host -> `null` liveness, preserved without `--force`.
- (v) journal with entries (`holdsContent`) -> never quarantined by `prune` regardless of liveness.

**Decision**: add `PROTO-DEC-0029` (C0 fix, liveness model, supervisor policy, window).

### A2 - Journal cap invariant (C1/F3)

- Policy: the release gate requires **0 warnings and <= 30 journals**; archival of the oldest journals (append to `.ai/ARCHIVE.md` via `protocol-archive.cjs worklog`, then `prune` the emptied header-only file) is a documented release-gate step.
- Rejected: raising the cap (grows the operational surface) and convention-based segregation of certification journals (moves history or requires a validator exemption; ownership paths must not change). Reconsider only if a future council documents a measurable need.
- Automation: CI check that treats the journal warning as an error at gate time (C10), not a silent warning.

### A3 - Certification package freeze, commit, push

- Freeze order (see A4), then commit all certification artifacts (reviews, journals, TASK, receipts) as one record.
- `git push` is an owner decision (Q13); `main` is ahead of origin by 10 commits, which is an availability risk for an unbacked release record. Recommendation: push after the commit, without history rewrite.

### A4 - Gate freshness (C3/F2) with the circular-dependency fix

- **Supported ordering (mandatory)**:
  1. All review files written and final.
  2. `TASK.md` completion gate filled with the cited prompt and review paths.
  3. Freeze: no further writes under `docs/reviews/**` or to `TASK.md`.
  4. Each owner records its receipt (`record`), newest owner last if desired; **journal writes do not change the digest**, so every receipt verifies simultaneously.
  5. Run `verify --deep` for every cited owner; require exit 0.
  6. Commit the package; committing does not change file identities, so receipts stay valid.
- **Enforcement (C8)**: a new check that the cited independent review has a verifying receipt at gate time. Implementation options: (a) validator extracts a `Session:` field from the cited review header and calls `protocol-handoff.cjs verify --owner <session> --deep`; (b) a new `gate-check` subcommand invoked by the validator in the source role. Requires validator tests, a DEC entry, and must remain advisory in installed projects.
- Evidence standard for certification: only a CERTIFYING review with a verifying receipt carries gate weight; stale = no weight; re-record restores it.

### A5 - Capability matrix and evidence discipline (C4a-e, accepted by Qoder and GLM)

- Roles: `CERTIFYING` requires `FS_WRITE`, `SHELL_EXEC`, `EVIDENCE_SIGN`, `REPO_READ`; `ADVISORY` is anything less. Capability is determined by the orchestrator/agent profile, never self-declared.
- Advisory outputs start with `[MODE: READ-ONLY ADVISORY]`; persistence uses the existing AGENTS.md section 5.5 transcription fallback; the transcriber records its own receipt and the report states `non-certifying`. No `- original-author:` field in Evidence (schema change rejected; provenance lives in the report header).
- Any `FAIL`/`BLOCKED` verdict requires at least one reproduction per claim; otherwise it is advisory and cannot reopen a decision (ties to B2).
- Orchestrator pre-flight filters certifying invitations by capability. Validator enforcement of mode fields would itself require a decision and tests.

### A6 - Documentation accuracy (C5/C11)

- `.ai/docs/PROTOCOL.md`: state the liveness model (supervisor PID, recency window, `holdsContent` protection) and that legacy Evidence receipts are editable/not tamper-evident; format 2 is the only authenticated format.
- Remove "clean tree" wording where untracked artifacts exist; correct the stale 16-byte nonce note if it reappears.
- Record the deviation history (P5-F2 boundary canonicalization) in one place so it is not rediscovered.

### A7 - Deprioritized (carried, not blocking)

- fastValidator exclusion-set regression (C6); `nonceHash` storage for the lock token (v2.0); `doctor` in CI is folded into C10.

## 3. Track B - decision freeze and registry (owner's "stop re-litigating" requirement)

### B1 - Statuses and fields
Statuses: `accepted`, `frozen`, `reopened` are process states; `DECISIONS.md` stays append-only. New blocks optionally carry `Reopen-trigger:` and `Frozen-at:`; existing 28 blocks are never edited.

### B2 - Reopen triggers (Colabs-tailored)
- `invariant-broken`: a reproducible probe or failing test shows a binding invariant does not hold.
- `metric-drop`: a defined metric crosses a documented threshold (metrics must exist first; see C1).
- `new-external-data`: new *reproducible* evidence; model opinion without a reproduction does not qualify (the Qoder case).
- `security-finding`: a reproducible exploit or DoS with PoC.
- `owner-directive`: explicit owner override, recorded.
- `higher-source-contradiction`: contradiction with a higher-ranked source (working tree, git history, decisions).
**Rule**: doubt without a documented trigger stays an advisory note in the journal or TASK open questions; it does not restart a cycle. Challenges remain a right under AGENTS.md section 2.

### B3 - Registry
`docs/decisions/REGISTRY.md` (human) plus a JSON twin (machine): `id -> status, reopen-trigger, frozen-at, supersedes`. All 28 existing decisions are annotated there without touching their blocks. ARCHIVE annotation rejected as semantically muddy (ARCHIVE is worklog history).

### B4 - Enforcement
Orchestrator pre-check (no trigger, no reopening) plus an optional validator rule that new decision blocks carry `Reopen-trigger:`; the validator rule needs its own decision and tests.

## 4. Track C - measurement and tooling (hypotheses only)

### C1 - Context-economy experiment H1
- Metrics: time-to-first-edit; input tokens per task; repeated repository reads per session; handoff completeness; cross-model variance; context assembly time.
- Pilot on `D:\Block-Puzzle`; A/B over a fixed task list; thresholds defined **before** the pilot (e.g., >=25% token reduction with no quality regression).
- The 35%/50%/65% forecast is recorded as an unverified hypothesis and must not appear in any decision text as fact.

### C2 - MCP policy if H1 succeeds
Minimal universal base (filesystem, git read); per-project profiles as recommendations gated by policy/compatibility; no auto-install; capability declarations feed A5; gate must never depend on external state; derived indexes are disposable (`.ai/runtime/` or regenerated); risk register: staleness, secrets, reproducibility, agent asymmetry, complexity.

## 5. Sequencing (dependency order)

1. **A1 C0 fix** + three-branch tests + `PROTO-DEC-0029` (blocker; fastest value).
2. **A4 ordering + gate freshness** (freeze protocol, C8 tests).
3. **A3 freeze, commit, push decision**.
4. **A2 archival automation + CI escalation** (C10).
5. **A5 capability/evidence rules** (+DEC).
6. **B1-B4 decision freeze + registry** (+DEC for validator enforcement).
7. **C1 H1 pilot**, then C2 policy if positive.
8. Re-run the six v1.9.4 vectors only for the areas touched by A1/A4/A5; full re-run is optional if those areas are isolated (Q6).

## 6. Consolidated council questions (final round)

1. A1: supervisor registration policy - any live PID>4 (recommended), own/ppid only, or token handshake?
2. A1: `RECENT_WINDOW` value (recommended 15 min) and whether the fallback applies to snapshots, journals, or both.
3. A4: is the ordering protocol sufficient, or must the digest also exclude `TASK.md`?
4. A4/C8: validator-embedded verify vs a `gate-check` subcommand for freshness?
5. A2: keep the 30 cap with a release-gate archival step, or a different stable invariant?
6. B3: registry format - Markdown, JSON twin, or both; and should it live under `docs/decisions/`?
7. B4: validator enforcement of `Reopen-trigger:` - yes, or advisory only?
8. C1: H1 metrics and thresholds - are the six metrics right, and what minimum justifies MCP adoption?
9. C2: MCP policy ownership - protocol source vs global orchestrator config?
10. A3: push timing and whether the certification commit should be signed.
11. A5: capability matrix source of truth, and how to record capability in session context.
12. A2: should certification-session journals be exempt from the cap (rejected here; confirm)?
13. A1: does the fix need a migration note for sessions started before v1.9.5 (state without supervisorPid)?
14. Overall: approve v1.9.5 as the vehicle (recommended) or fold Track A into v2.0?

## 7. Acceptance criteria (measurable)

- A1: the five-branch matrix passes; `prune`/`cleanup-runtime` regressions added; `PROTO-DEC-0029` recorded.
- A4: after the freeze protocol, every cited receipt verifies at gate time; a stale citation fails the gate check; validator tests included.
- A2: validator 0 warnings and journals <= 30 at gate time; CI fails on regression.
- A3: certification package committed; push decision recorded.
- A5: an advisory-only artifact cannot carry gate weight in any test scenario; a FAIL without PoC is advisory.
- B: reopening without a trigger is refused by the orchestrator pre-check; registry covers all decisions.
- C1: pilot report with measured metrics; decision to adopt or reject MCP profiles is evidence-based.

## 8. Residual risks

| Risk | Mitigation |
|---|---|
| Recency fallback keeps a dead session for the window | Window kept short; `holdsContent` and supervisor-first remain primary |
| Gate freshness check is gamed by re-recording stale evidence | Re-record only after the freeze; digest-neutral journals make the pass legitimate; a re-record does not change content, only the receipt |
| Decision freeze slows legitimate change | Trigger taxonomy keeps every evidence-backed reopening; owner-directive is a standing trigger |
| MCP adoption shifts the protocol's center of gravity out of Git | C2 policy and risk register; gate independence rule |
| Journal cap churn repeats every council | Archival is part of the release checklist; CI escalates |

---

## References

- `docs/reviews/2026-09-19-deepseek-flash-interim-council-plan.md` and Addendum D2
- `docs/reviews/2026-09-19-gemini-interim-plan-adversarial-review.md`
- `docs/reviews/2026-09-19-mistral-vibe-interim-council-plan-review.md`
- `docs/reviews/2026-09-19-deepseek-flash-interim-council-plan-review.md`
- `.ai/DECISIONS.md`: PROTO-DEC-0025, PROTO-DEC-0028; `.ai/TASK.md`
