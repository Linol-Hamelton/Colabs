# Worklog: deepseek-e3aa704632940af2

Session journal. Owned by this session. No other session writes here.

Newest entry first. Limit 150 lines.

---

## 2026-09-18 - Copilot review assessment; three reproduced protocol defects

Agent: deepseek

Action:
- Read TASK, AGENTS, PROTOCOL/CODEX/COPILOT docs, DECISIONS, the runtime tools,
  the installer, the validator and the test suite; ran the validator and the
  full regression suite on the current worktree.
- Classified Copilot's evaluation into supported, questionable and wrong; its
  ".ai untracked in a consumer" claim is stale (D:\VPN tracks 34 .ai files),
  and its "version doubles as format identifier" claim contradicts the numbered
  formats in code (snapshot format 4, state VERSION 1).
- Ran three probes with no product changes:
  1. deleted the middle decision block from a committed DECISIONS.md copy in a
     fixture: validator exits 0 and reports success, so block deletion is
     invisible (in-place edits are caught, deletions are not);
  2. edited installed .github/copilot-instructions.md and .ai/docs/COPILOT.md:
     validator FAILs on both, while an AGENTS.md edit only warns;
  3. traced autoArchiveWorklog from stop/Stop hook/record: it rewrites
     .ai/ARCHIVE.md without taking the shared-document lock that AGENTS.md
     section 6 requires for that file.
- Produced a 20-criteria independent scorecard (average 7.2/10) for the owner.

Result:
- validate-protocol.ps1: exit 0, 0 warnings. Regression suite: 168 tests,
  168 pass, 0 fail, 302 s.
- Release state: tags end at v1.8.0; HEAD AGENTS.md says v1.8.0; the worktree
  declares v1.9.0 and is uncommitted. HEAD manifest managed=14, worktree=17,
  so README's "installs 22 files" is stale.
- Reproduced defects above. Also noted: the decision immutability check compares
  the worktree against HEAD only, so an edit committed together with the change
  passes; older journal entries and ARCHIVE.md carry no protocol-level anchor
  beyond Git history.

Next step:
- Owner decides whether to fix the reproduced defects regression-first (delete
  detection, archive locking, Copilot document digest class) and to commit/tag
  v1.9.0.

Open:
- Is Git history the accepted anchor for old entries, or should the evidence
  chain cover archived entries? Not decided.

Evidence:
- anchor: cb27c76da5d11d7ed502160f858c370bd72ce453, uncommitted changes present
- digest: sha256:e390da93e358bc6033edd1f0024ebabf06b77e9960091281c9e2c151754e7b94 over 54 tracked and untracked files
- digest format: 4
- recorded: 2026-09-18T01:27:58.303Z by deepseek-e3aa704632940af2
- entry: sha256:4adfe741b67164c062b4e9e60209a401ffb0cfcc691991189d0688bc6385ef7b of this entry without this block
- scope: protocol checks only; host-project tests run separately
- validate-protocol.ps1: exit 0 in 2s
- test-protocol.ps1: exit 0 in 300s
- reproduce: node .ai/bin/protocol-handoff.cjs verify
