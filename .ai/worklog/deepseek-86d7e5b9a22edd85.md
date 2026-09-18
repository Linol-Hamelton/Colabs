# Worklog: deepseek-86d7e5b9a22edd85

Session journal. Owned by this session. No other session writes here.

Newest entry first. Limit 150 lines.

---

## 2026-09-17 - Three-repository review and fix round

Agent: deepseek (deepseek-flash), session deepseek-86d7e5b9a22edd85

Action:
- Read AGENTS.md, TASK, PLAN, DECISIONS and the protocol tooling (installer,
  validator, hooks, lock, handoff, session, archive), then the journals of
  D:\Block-Puzzle and D:\VPN. Ran both validators, the full source suite, and
  the installer -Verify against both products. Two exploratory subagents had
  shell access denied, so every load-bearing command here was re-run directly.
- Wrote docs/reviews/2026-09-17-three-repository-review.md and rewrote TASK
  under the lock, recovering an abandoned gemini lock with --force after the
  tool reported its process dead.
- Fixed six reproduced defects: the version-without-content upgrade gap
  (manifest contentDigest plus a validator comparison), the destructive prune
  heuristic, installed CLAUDE.md ordering the source-only suite, the
  archive/validator limit mismatch, the .editorconfig claim, and a stale
  version pinned in PROTOCOL.md.
- Added tests/upgrade.test.cjs with four regressions and two prune
  regressions, and listed the new test file in the manifest.

Result:
- Both products declare 1.9.0 and pass validation while -Verify reports 9 and
  10 differing managed files: the installed content is one generation behind
  the version string. Reproduced and closed by content digest.
- prune deleted qwen's full audit in VPN because its heading carried a time
  stamp; the fixed heuristic keeps it. The regression fails on the old code.
- VPN keeps .ai untracked at 216 commits, so decision immutability is inert
  and DEC-0004 was edited Proposed to Accepted in place. Recorded as an open
  question; not fixed here.
- Full suite 164 pass / 0 fail (158 before); validator exit 0 in the source
  repository with no warnings.
- No file in either product repository was changed and neither was upgraded.

Next step: owner reviews the report, rules on the five open questions, and
decides whether to fold this round into v1.9.0 or tag it separately.

Open: DEC namespace collision across repositories; line-limit churn; post-hoc
redaction versus the entry hash; VPN .ai untracked; consumer -Force upgrades
pending owner approval.

Evidence:
- anchor: cb27c76da5d11d7ed502160f858c370bd72ce453, uncommitted changes present
- digest: sha256:a2404754ae3c0ba31048d4da8d52173697d02e06e7f619ae756dfb0daa79ad41 over 52 tracked and untracked files
- digest format: 4
- recorded: 2026-09-17T22:28:42.404Z by deepseek-86d7e5b9a22edd85
- entry: sha256:c2839718b6377407b879d6cd89577b3887908dc3ad741734ffe6d9dc52be5b5d of this entry without this block
- scope: protocol checks only; host-project tests run separately
- validate-protocol.ps1: exit 0 in 4s
- test-protocol.ps1: exit 0 in 322s
- reproduce: node .ai/bin/protocol-handoff.cjs verify
