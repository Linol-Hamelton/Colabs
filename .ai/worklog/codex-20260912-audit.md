# Worklog: codex-20260912-audit

Session journal. Owned by this session. No other session writes here.

## 2026-09-12 - Audit of the published Claude follow-up

Agent:
GPT/Codex, session codex-20260912-audit, with three read-only review delegates.

Action:
Verified origin/main equals local commit 0b3b0947593bcac9c6981a01ad8e0080dc6fe69d.
Read the protocol, all journals and templates, code, tests and Git history.
Audited Claude's work, documentation fidelity, discussion handling and the
next development priorities. Executed the full suite, validator, installer
verification and targeted negative cases in temporary repositories.
Prepared docs/reviews/2026-09-12-claude-v1.2-audit.md and a draft next-wave plan.
Used the shared-document lock for TASK/PLAN; old decisions/journals were kept.

Retrospective handoff for the interrupted Codex hardening round:
The dated entry in codex.md describes the earlier review only; its statement
that no implementation changed remains true for that review. The subsequent
implementation round lacked its own completed journal and left its lock held.
DEC-0009, the former PLAN and Claude's follow-up journal record that incomplete
state. Claude completed the missing operator guide and other integration work.
This records the missing handoff without rewriting either agent's history.
No retrospective test results are claimed. Commit 79b3f28 combines both rounds,
so per-line authorship before that checkpoint cannot be recovered from Git.
CI remains unimplemented, despite DEC-0009's wording; this is unfinished work,
not evidence that CI ran. The report preserves this distinction.

Result:
Published code passed 59 tests (0 failures/skips, 110.34 seconds), validator
exit 0 with no warnings, installer -Verify exit 0 and git diff HEAD --check 0.
The initial tree was clean and the lock free. Additional isolated reproductions
found missing-installer and disabled-hook false successes, a deleted journal
entry accepted as new, partial upgrades on invalid hook structure, ineffective
ignore-rule overrides, and narrower encoding/reference/context checks than
their broad descriptions imply. Exact findings are T1-T9 in the report.
Claude documented useful repairs and a lock-rule lapse. Its journal filenames
do not match the hook-assigned paths; task/plan/CI/archive rules still disagree.
DEC-0007 deliberately uses TASK for discussion; no full chat archive exists.
Current OpenAI docs describe project hooks, making a Codex adapter a feasible
proposal. Host integration and platform versions still require actual testing.

Next step:
Owner reviews the proposed wave 1 in PLAN: truthful health checks, safe upgrade
preflight, CI and aligned handoff documentation. Further waves cover session
lifecycle, archival, Claude/Codex parity and a measured product pilot.

Open:
Recommendations are not approved decisions. No implementation, existing DEC
block or another session's journal was changed during this audit. No commit or
push was made. New artifacts are on audit/claude-v1.2-20260912. Actual Claude UI
execution, Codex hooks, other operating systems, GitHub branch protections and
real product outcomes remain unverified. The public repo has no LICENSE file,
release tags, CI workflow or contribution/security process documents yet.
