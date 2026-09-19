# Interim Council Action Plan - v1.9.4 Follow-up Cycle

**Date**: 2026-09-19  
**Release baseline**: `c71bdcf` (annotated tag `v1.9.4`); HEAD `a6dbf8c` plus uncommitted certification artifacts  
**Reviewer**: DeepSeek (deepseek-flash, session `deepseek-flash-ebd6eb9397ed3784`)  
**Conflict of interest**: DECLARED - author of the consolidated plan and the phase gate reviews.  
**Status**: INTERIM, for council review. Not a decision; the final plan is fixed after the council round.  
**Addendum D2**: `docs/reviews/2026-09-19-deepseek-flash-interim-plan-addendum-context-and-decision-freeze.md` (owner-supplied hypotheses: decision freeze and reopen triggers, registry, context-economy experiment, MCP policy).

---

## 1. Verified state at plan time

| Fact | Evidence |
|---|---|
| Tag `v1.9.4` -> `c71bdcf`; versions `1.9.4` | git, manifest, AGENTS, installer |
| Post-tag diff = documentation only, 0 code files | `git diff --name-only c71bdcf..HEAD` |
| Suite 200/200; doctor Healthy; consumers 18/18 byte-identical | independent runs |
| Validator exit 0 **with 1 warning** (34 journals > 30) | `validate-protocol.ps1` |
| TASK `Completed`; gate cites Copilot's certification | `.ai/TASK.md:3,49-52` |
| Receipt freshness at this writing | **deepseek-flash exit 0; claude, mistral-vibe, gemini-2da, copilot-135 all exit 1 (stale)** |
| Digest dynamics | `.ai/worklog/**` is excluded from the anchor digest; `docs/reviews/**` and `TASK.md` are included. Writing a review/TASK therefore stales every prior receipt; recording a journal does not |

The stale receipts are a churn artifact of a multi-model session, not a
falsification: each review was valid when recorded. The current gate nonetheless
cites a review whose receipt no longer verifies.

## 2. Open items

| Id | Sev | Item | Evidence |
|---|---|---|---|
| C0 | HIGH | Session liveness cleanup still broken: `prune` quarantines a live transient session's journal and `cleanup-runtime --force` removes its snapshot, even with a registered live supervisor. Root cause: `protocol-session.cjs:28-33` reads only `record.pid` and ignores `supervisorPid`. Violates PROTO-DEC-0025 item 3 | zondy: journal quarantined with/without supervisor; snapshot removed |
| C1 | MED | Journal count 34/30; every certification session adds journals, so the validator cannot stay at 0 warnings without an archival step | validator warning |
| C2 | MED | Certification artifacts (5 reviews, 5 journals, TASK, receipts) are uncommitted; no freeze point | `git status` |
| C3 | MED | The completion gate cites a stale receipt; the validator checks existence and verdict, not receipt freshness | TASK gate vs verify |
| C4 | MED | Evidence discipline: Qoder's FAIL and Claude Code's `v1.9.4_audit_synthesis.md` exist only in chat; AGENTS.md section 5 ordering rule unmet | no files in repo |
| C5 | LOW | Documentation accuracy: state explicitly that legacy receipts are editable (not tamper-evident); remove "clean tree" claims while artifacts are untracked; the "16-byte nonce" note has no live source | report/header review |
| C6 | LOW | `{ fastValidator }` exists in `tests/helpers.cjs:61-63`; no regression asserts the excluded-suite set; deferral stands | code read |
| C7 | INFO | Carried hypotheses: store `nonceHash` instead of the raw nonce; run `doctor` and a receipt-freshness check in CI | design backlog |

## 3. Forks for the council (recommended option first)

**F1 - C0 design.** (a) *Recommended*: supervisor-first liveness plus a conservative recency fallback for sessions that never register (`mtime` within the session window), so hookless live sessions are protected. (b) supervisor-only: strictly fail-closed, but hookless sessions stay prunable; (c) recency-only: no registration needed, but dead sessions linger until the window expires.
Consequences: (a) two mechanisms to test, best coverage; (b) smallest change, leaves the documented gap; (c) simplest, weakens the "liveness not age" principle of DEC-0025.

**F2 - Gate freshness.** (a) *Recommended*: the completion gate additionally requires `verify --owner <reviewer> --deep` exit 0 for the cited independent review at gate time. (b) status quo: existence + verdict only.
Consequences: (a) closes the stale-certification class, adds a freeze/re-record step; (b) keeps the gap.

**F3 - Journal cap policy.** (a) *Recommended*: keep 30 and make archival of the oldest journals a documented release-gate step. (b) raise the cap to 40 now that every release has a multi-model council. (c) auto-quarantine above the cap.
Consequences: (a) preserves history in ARCHIVE.md, adds one manual step; (b) removes the warning but grows the operational surface; (c) risks quarantining content automatically.

**F4 - Legacy Evidence.** (a) *Recommended*: keep label-only policy and document that legacy receipts are unauthenticated and can be edited; require format 2 only for gate-cited certifier journals. (b) add a re-record helper for active journals. (c) require re-record for everyone.
Consequences: (a) honest and low-risk; (b) more tooling; (c) breaks other owners' journals and violates immutability.

**F5 - Next-cycle vehicle.** (a) *Recommended*: patch release `v1.9.5` for C0 + C1-C3 + C5, then a separate `v2.0` discussion for C7. (b) one combined v2.0 cycle. (c) hotfix C0 only.
Consequences: (a) fast remediation, keeps v2.0 scope clean; (b) long wait for a real defect fix; (c) leaves governance items open.

**F6 - Evidence freeze protocol.** (a) *Recommended*: stop writing reviews/TASK; freeze (commit); then each owner re-records its journal once (journal writes do not change the digest), so all receipts verify simultaneously. (b) keep incremental recording.
Consequences: (a) mutually consistent release record, one extra pass; (b) receipts remain stale in the record forever.

## 4. Explicit council questions

1. F1: which liveness mechanism, and what recency window if used?
2. Does a stale receipt invalidate a certification that was valid when recorded, or is the review file plus a post-freeze re-record sufficient (F2/F6)?
3. F3: is the 30-journal cap still right for multi-model councils, or should it rise?
4. C0 is a defect against a binding decision (PROTO-DEC-0025 item 3): does it warrant its own decision block in the next cycle (`PROTO-DEC-0029`) or a change only?
5. C4: what is the sanction for chat-only audit artifacts, and should the ordering rule become a validator check?
6. Should the council re-run the six vectors after C0 is fixed, or is a targeted liveness + regression review sufficient?

## 5. Acceptance criteria for the follow-up cycle

- C0 fixed: `prune` preserves a live session's journal (with and without a registered supervisor); `cleanup-runtime` preserves a live snapshot; a confirmed-dead session is still prunable; regressions added.
- Validator 0 warnings; journals <= 30 after archival.
- Certification package committed; the gate cites a review whose receipt verifies at gate time.
- Every cited artifact exists in the repository; no chat-only certifications.
- Docs state the legacy-receipt and liveness models explicitly.

---

## References

- `docs/reviews/2026-09-19-deepseek-flash-certification-integrity-and-consolidation.md` (sections 1.1, C0)
- All `docs/reviews/2026-09-19-*` certification artifacts
- `.ai/DECISIONS.md`: PROTO-DEC-0025, PROTO-DEC-0028
- `.ai/worklog/deepseek-flash-ebd6eb9397ed3784.md`
