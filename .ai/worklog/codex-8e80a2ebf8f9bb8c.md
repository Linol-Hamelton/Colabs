# Worklog: codex-8e80a2ebf8f9bb8c

Session journal. Owned by this session. No other session writes here.

Newest entry first. Limit 150 lines.

---

## 2026-09-23 - Thirteen-direction routing and coordination proposal

Agent: codex-8e80a2ebf8f9bb8c (Codex, GPT-6)

Action: Read session-start sources, full git inventory, current 0046 ruling, CLI-AGENTS,
PLAN policy, recent journals and the historical cycle dataset/research. Checked named
sources against tracked inventory, including the large unchanged historical dataset.
Inspected CLI help, versions, installation locations and allowed nonsecret configuration
fields. Read official Jev/TypeSafe, Kilo, Codex and Claude documentation and SWE-bench
methodology. Incorporated the owner's follow-up source map, distinguishing installation,
launchability, historical inference results, current route config and task qualification.
Published own prompt and docs/reviews/2026-09-23-codex-routing-architecture.md; finalized
the draft before handoff. No inference, paid call or provider configuration change made.

Result: RECOMMENDATION, ADVISORY. Proposed a durable dispatcher with DeepSeek/Kilo as
initial coordinator, separate capability adapters, risk/difficulty-aware routing,
finite cross-provider attempts, qualified deputies, quota reserves and time-first
selection under quality constraints and a money ceiling. Historical evidence does not
support quantitative provider rankings; provisional role pools are labeled hypotheses.
Jev needs outcome-specific calibration and stays outside certification; online use needs
an explicit change to 0045's offline-only boundary. Verified agy 1.2.8, Vibe 2.25.5,
Codex 0.154.0, Kilo package 7.7.7. Missing agy integration document confirmed.
Current inspected Codex configs do not reproduce the owner's earlier vercel selection;
AI_GATEWAY_API_KEY absence alone does not establish failure of another route.

Next step: Discuss/approve one bounded operational slice, actual account roster and
spend ceiling, then qualify routes and measure end-to-end accepted-task time.

Open: Exact subscriptions, quota observability and spend ceiling; effective runtime model
catalog and inference health; historical task/error labeling; domain qualifications;
Jev calibration; approved cap/telemetry changes. All proposed assignments and capacities
remain unapproved. No existing decision, role, scope, limit, candidate code/test, shared
metadata, other session journal, commit or push changed by this session. Full protocol
check results are recorded below; they do not validate an unimplemented architecture.

Evidence:
- anchor: 82bf99a8e2bfcde3ff375b9995f3ab45edb7ddc5, uncommitted changes present
- digest: sha256:28e21749438c76e7e0d947de4f42a74a1bfe8989a0b111ac63d834d8d4dfa943 over 319 tracked and untracked files
- digest format: 4
- recorded: 2026-09-23T04:42:26.800Z by codex-8e80a2ebf8f9bb8c
- entry hash format: 2
- entry: sha256:0037d440ae9ad6a55d001de44ce34802453a20c142fd912413d4f1d1c4e5555d of this entry without this block
- parent-entry: root
- scope: protocol checks only; host-project tests run separately
- validate-protocol.ps1: exit 0 in 3s
- test-protocol.ps1: exit 0 in 299s
- reproduce: node .ai/bin/protocol-handoff.cjs verify
