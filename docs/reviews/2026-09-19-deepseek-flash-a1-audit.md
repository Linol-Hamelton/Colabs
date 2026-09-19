# DeepSeek (deepseek-flash) - Item 1 (A1) Adversarial Audit

**Date**: 2026-09-19  
**Reviewed state**: anchor `6624c8c` plus the uncommitted Item 1 working-tree changes (`protocol-session.cjs`, `protocol-lock.cjs`, `.ai/docs/PROTOCOL.md`, `tests/session.test.cjs`, `tests/review-findings.test.cjs`); implementer receipt digest `c74f96bf...` over 124 files  
**Reviewer**: DeepSeek (deepseek-flash), auditor/controller per the owner's two-sided dispatch  
**Scope**: Item 1 (A1) - C0 session liveness fix, tests, docs, PROTO-DEC-0029 draft  
**Conflict declaration**: this reviewer authored the specification (plan revision 2, A1) that the implementer executed; the reviewer has no part in the implementation. The per-item gate audit is assigned by the owner. The whole-plan completion certification (AGENTS.md section 2) still requires a reviewer other than the specification author and the implementer.  
**Mode**: CERTIFYING (FS_WRITE, SHELL_EXEC, EVIDENCE_SIGN, REPO_READ)  
**Verdict**: **PASS** with two required follow-ups (AUD-1 documentation wording, AUD-4 two missing regression tests), neither of which blocks correctness or the C0 fix.

---

## 1. Executive summary

The C0 fix is real and correctly implemented. Supervisor-first liveness, the three-way polarity per call site, the 15-minute recency window, the relaxed supervisor registration (D1) and the shared helper reuse all match the approved specification, and I reproduced each branch independently against a throwaway clone carrying the new code - including cases the implementer's tests do not cover. The handoff package is clean: 31/31 session tests, 212/212 suite, validator exit 0 with 0 warnings, and the implementer's `verify --deep` receipt is fresh.

Two follow-ups are required before or with Item 2: one documentation wording that contradicts observed behavior for missing/corrupt state (AUD-1), and two regression tests for behaviors I verified by hand but the suite does not pin (AUD-4). One robustness note (AUD-2) is advisory.

---

## 2. Independent verification (my commands, not the implementer's)

| Check | Result |
|---|---|
| `node --test tests/session.test.cjs` | 31/31 pass, exit 0 |
| `powershell .\test-protocol.ps1` | 212/212 pass, exit 0 |
| `powershell .\validate-protocol.ps1` | exit 0, 0 warnings |
| `node .ai/bin/protocol-handoff.cjs verify --owner gemini-434bcd8012e0f38c --deep` | exit 0, evidence matches the current tree |
| Module graph | no cycles: lock -> session -> hooks; archive -> lock + hooks; hooks lazy-requires archive inside functions |

### Adversarial fixture probe (clone with the new code; every artifact aged 30 minutes)

| # | Fixture | Command | Observed | Expected by plan | Verdict |
|---|---|---|---|---|---|
| 1 | supervisor alive (live child PID), transient PID dead | `prune` | `skipping pa-alive.md (active session process ...)` | preserved, supervisor consulted (not recency) | PASS |
| 2 | same | `cleanup-runtime --force` | snapshot preserved | preserved even with force | PASS |
| 3 | supervisor dead, transient dead | `prune` / `cleanup-runtime --force` | quarantined / `removed dead session snapshot` | prunable/removable | PASS |
| 4 | foreign host, aged | `prune` (no force) | `skipping pa-foreign.md (unknown liveness or foreign host)` | preserved | PASS |
| 5 | foreign host, aged | `cleanup-runtime --force` | snapshot preserved | preserved even with force | PASS |
| 6 | corrupt state JSON, aged | `prune` | quarantined | branch 10 equivalent (missing/unusable state + aged) | PASS |
| 7 | live supervisor, aged | `prune --force` | `skipping ... (active session process ...)` | never destroyed | PASS |
| 8 | active lock holder, aged | `prune --force` | `skipping pa-lock.md (active lock holder)` | preserved even with force (new, docs updated) | PASS |
| 9 | content-bearing journal, dead, aged | `prune --force` | untouched (`holdsContent`) | never quarantined | PASS |
| 10 | foreign host, aged | `prune --force` | `[AUDIT WARN] ... quarantined` | may quarantine with audit | PASS |

Everything matches the A1.2 call-site polarity table and A1.6 matrix. Test quality is good: branch 1 ages artifacts with `fs.utimesSync` and asserts the `active session` message, so a recency-only implementation cannot pass; live PIDs come from spawned child processes; the 6-state unit test imports the exported helper directly.

---

## 3. Findings

| Id | Severity | Finding | Evidence | Required action |
|---|---|---|---|---|
| AUD-1 | LOW (docs) | `PROTOCOL.md` says "If liveness cannot be verified (foreign host or unknown PID state), the journal is preserved during standard runs". Observed: a **missing or corrupt** state file with an aged empty journal is quarantined during a standard run without an audit warning (the preserved case is a state file present with foreign-host/unknown liveness). The plan (A1.6 branch 10) requires the quarantine, so the text is wrong, not the code. | probe rows 4 and 6; `protocol-session.cjs` prune `hasState && liveness === null` skip vs missing/corrupt falling to recency | Reword to "a state file present with unverifiable liveness (e.g. foreign host) is preserved; a missing/corrupt state falls to the recency window, then prune" |
| AUD-2 | LOW (robustness) | `prune` calls `fs.statSync(journalPath)` on every empty candidate; a journal deleted between the `readdir`/`holdsContent` read and the stat (or during a concurrent prune) throws and aborts the command. Pre-existing race, slightly widened. | code at the prune loop; not triggerable deterministically in a fixture | Advisory: wrap in try/catch and skip vanished files |
| AUD-3 | INFO | `prune --force` on a foreign-host empty journal quarantines the journal **and deletes its state snapshot**, while `cleanup-runtime --force` alone preserves that snapshot. Both are per plan; the combined effect should be stated so nobody reads the two rules as contradictory. | probe rows 5 vs 10 (`pa-foreign` snapshot absent after `prune --force`) | Optional wording note in DEC-0029 |
| AUD-4 | LOW (test gap) | Two behaviors verified by hand are not pinned by the suite: (a) corrupt/missing state JSON (aged) is quarantined; (b) an active lock holder's empty journal survives `prune --force`. | my probe rows 6 and 8; `grep` over the new tests | Add both tests in Item 1 before commit or as the first change of Item 2 |
| AUD-5 | INFO | DEC-0029 item 3 attributes the recency window to snapshots; snapshots receive equivalent protection implicitly from the existing 24h rule (no explicit `RECENT_WINDOW` check in `cleanup-runtime`). Behavior matches (force overrides), but the decision text should not imply code that does not exist. | cleanup diff | Optional: reword to "subsumed by the existing 24-hour rule" |

No BLOCKING or FAIL-severity findings. Security invariants hold: the lock still requires `--session-token` for non-parent registered PIDs; `clear-lock` force still requires `--reason`; no gate or Evidence input changed; no unrelated files touched; no history rewritten.

---

## 4. Specification conformance (plan revision 2, A1)

| Spec | Status | Note |
|---|---|---|
| A1.1 `isSessionAlive` contract (6 states) | MET | unit test asserts all six |
| A1.2 per-call-site polarity | MET | verified in code and by probe rows 1-10 |
| A1.3 recency fallback + `holdsContent` | MET | journals; snapshots implicit via 24h rule (AUD-5) |
| A1.4 D1 registration policy | MET | `--supervisor-pid` accepts any live PID > 4; docs updated |
| A1.5 shared helper reuse | MET | lock imports `isSessionAlive`/`checkProcessAlive`; duplication removed; no cycles |
| A1.6 11-branch matrix | MET with AUD-4 gaps | plus 6-state unit test |
| A1.7 PROTOCOL.md update + DEC draft | PARTIAL | docs updated (AUD-1 wording); DEC-0029 draft accurate apart from AUD-5 |

**PROTO-DEC-0029 draft review**: structure, statuses and content are consistent with the implementation; the `Approved by: RuslanFomenko` line must only be inserted after the owner explicitly approves the block (the owner's D1/D2 acceptance covers the substance, not the compiled text). Two wording fixes above (AUD-3, AUD-5) are optional.

---

## 5. Recommendation to the owner

1. Approve Item 1 with the two follow-ups: AUD-1 (one-line doc fix, implementer) before the Item 1 commit, and AUD-4 (two tests) before or with Item 2.
2. Commit Item 1 atomically after the AUD-1 fix, per the agreed audit-then-commit policy.
3. Approve PROTO-DEC-0029 for insertion when the owner's `Approved by:` line is added (either with the Item 1 commit or with the A2 decision batch).
4. Note for the record: the implementer's receipt is a point-in-time handoff anchor; publishing this audit moved the tree digest, so a fresh ordered re-record pass will be needed at the final certification, as the plan already prescribes.

## 6. References

- Plan: `docs/reviews/2026-09-19-deepseek-flash-consolidated-v1.9.5-plan-r2.md` (A1, sections 3-4)
- Implementer handoff: `.ai/worklog/gemini-434bcd8012e0f38c.md` (32/150 lines, entry hash format 2)
- Probe fixture: `C:\Users\Dmitry\AppData\Local\Temp\kilo\v195probe3\repo` (throwaway clone with the new code; not part of the repository)
- This audit's evidence: `.ai/worklog/deepseek-flash-8a681a17d5224abf.md`
