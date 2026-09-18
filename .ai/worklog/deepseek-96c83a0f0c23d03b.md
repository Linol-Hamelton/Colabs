# Worklog: deepseek-96c83a0f0c23d03b

Session journal. Owned by this session. No other session writes here.

Newest entry first. Limit 150 lines.

---

## 2026-09-18 - Adversarial audit of v1.9.0-v1.9.2, verdict FAIL, review file published

Agent: deepseek

Action:
- Read the full delta bed0d70..a6a6d6194e08e313dce1328cc8af971962f91fa5: protocol-handoff.cjs, protocol-archive.cjs, protocol-session.cjs, protocol-hooks.cjs, protocol.cjs, validate-protocol.ps1, manifest, AGENTS.md, QUICKSTART.md, PROTO-DEC-0025/0026, tests/operator.test.cjs and the new handoff regressions.
- Ran debug probes on throwaway fixtures from tests/helpers.cjs: lock steal via CLI (4 commands), archive round trip, forged ARCHIVE.md with --deep and doctor, legacy Evidence parent, cleanup --force with unknown liveness, live 8-day snapshot, timezone-offset heading, hand-written Evidence, 8 concurrent acquires.
- Wrote the full report to docs/reviews/2026-09-18-deepseek-audit-v1.9.md (template templates/reviews/REVIEW.md) and recorded this entry with protocol-handoff.cjs.

Result:
- Verdict FAIL. Verified fixed at v1.9.1: archive/digest interaction, record-archive-verify round trip with archived-parent marker, timestamped UTC headings, fail-closed on real tamper, live 8-day snapshot survives.
- Reproduced release blockers: F-001 CRITICAL lock liveness is false for every CLI-held lock and autoArchiveWorklog clears and releases a live session's lock; F-002 HIGH legacy Evidence without an entry hash is classified tampered, so record hard-fails on mixed-format journals; F-003 HIGH verify --deep and doctor trust a bare hash string in ARCHIVE.md, so archived entries can be rewritten or erased.
- Also reproduced: cleanup-runtime --force deletes snapshots of unknown liveness; a fully hand-written Evidence block verifies; +03:00 headings are rejected.
- Validator exit 0 and the full regression suite exit code for this tree are in the Evidence block below.

Next step:
- Owner decision: fix F-001..F-003 with regression tests before tagging, or accept them explicitly; F-004..F-009 belong to the next stabilization round.

Open:
- Lock liveness model (one-shot CLI PID) is architectural, not a one-line patch; it needs a lease/TTL decision in DECISIONS.md.

Evidence:
- anchor: a6a6d6194e08e313dce1328cc8af971962f91fa5, uncommitted changes present
- digest: sha256:a5b040d3f615a4c6fb9b7d9889a18ce414254f42bcd9d9e9585b9c73c67e5e18 over 60 tracked and untracked files
- digest format: 4
- recorded: 2026-09-18T04:44:15.323Z by deepseek-96c83a0f0c23d03b
- entry: sha256:be8f30fe80c63fcfe309c160137f2c94fb190921cc97019eb1e48da53712df31 of this entry without this block
- parent-entry: root
- scope: protocol checks only; host-project tests run separately
- validate-protocol.ps1: exit 0 in 2s
- test-protocol.ps1: exit 0 in 350s
- reproduce: node .ai/bin/protocol-handoff.cjs verify
