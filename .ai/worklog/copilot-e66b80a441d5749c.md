# Worklog: copilot-e66b80a441d5749c

Session journal. Owned by this session. No other session writes here.

Newest entry first. Limit 150 lines.

---
## 2026-09-23 - Write Q02 Q06 Q08 routing research

Agent: copilot

Action: Read AGENTS.md, .ai/TASK.md, binding decisions and protocol docs, Colabs history/research, R0 dataset, and the Codex routing opinion last. Ran `git status`, `git log`, and `git ls-files` in D:\Colabs; attempted secondary-repository inventories but the execution environment denied access before those commands ran. Verified cited anchors with grep -n. Wrote `docs/research/2026-09-23-routing/Q02-domain-role-specialisation.md`, `Q06-jev-offline-decision-forecast.md`, and `Q08-cost-saving-limits.md`.

Result: Three bounded research documents are present, each under 250 lines with the requested headers and eleven sections. Recommendations are shadow/offline only: build a provenance-aware role matrix before live leads (Q02), replay Jev offline without operational effect (Q06), and measure a deterministic cost/quota ledger before active cost-aware routing (Q08). Secondary repositories were not directly inspected; this limitation is stated in each document.

Next step: Owner/challengers review the three documents; no decision or routing change is made here.

Open: Cross-repository raw-history inventory and comparable task/cost/quota denominators remain missing. Challenger slots remain pending by design.

Evidence:
- anchor: b232a9e5e99b51fccf8a1ce2ccfa009c3a204bed, uncommitted changes present
- digest: sha256:f992dd981e5de8931e9a97b5dcb5f48225f23a106b7a0bdc9bbb907c2fb0fa2e over 334 tracked and untracked files
- digest format: 4
- recorded: 2026-09-23T06:00:53.158Z by copilot-e66b80a441d5749c
- entry hash format: 2
- entry: sha256:0a87886918e79025dde7bba54f05e53cffe542adde2cdc6ed4c774d188864ca0 of this entry without this block
- parent-entry: root
- scope: protocol checks only; host-project tests run separately
- validate-protocol.ps1: exit 0 in 4s
- test-protocol.ps1: exit 0 in 377s
- reproduce: node .ai/bin/protocol-handoff.cjs verify
