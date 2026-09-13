# Worklog: codex-20260912-adapter

Session journal. Owned by this session, resumed on 2026-09-13.

## 2026-09-13 - Finish against Claude v1.5.1 and repair Windows handoff

Agent:
GPT/Codex, session codex-20260912-adapter, with adapter_review on the isolated
reproductions, shared hook repair and regression tests.

Action:
Resumed from clean cdcca4b and verified Claude's latest evidence before edits.
The earlier entry's repairs are now committed in 54c0623. Claude's subsequent
DEC-0015/0016 changes are preserved, including reuse of clean index entries.
Confirmed two remaining identity mismatches in temporary repositories: Git
normalizes CRLF before storing a blob, and core.filemode=false preserves a
tracked executable mode that the Windows filesystem does not report.

Prepared v1.5.2 with Git-normalized dirty file identities and format 4, removed
obsolete index-prefix stripping from handoff, and corrected current-state and
adoption docs. A preexisting AGENTS.md needs rule reconciliation before Force.
The earlier branch/file cleanup remains intact; history and approved decisions
are preserved. The source repository retains its installer, templates and tests.

Result:
Both defects reproduced on the unmodified v1.5.1 base. Verification of the
repair and final automated evidence are pending; no green result is claimed yet.

Next step:
Run targeted regressions and full source checks, record evidence for the final
tree, verify it and release the shared-document lock.

Open:
Assumption: this is a mechanical repair of DEC-0016's promised stable Git
identity, within the owner's adoption-workflow request. Advancing the digest
format follows DEC-0015; no new approval or product scope is inferred. Prior
evidence is preserved and must be refreshed for format 4. No commit or push
requested. Codex hook execution still requires the owner's host trust review.
T6/T8, licence DEC-0014 and the first product objective remain open.

## 2026-09-13 - Resume interrupted adapter work and verify adoption

Agent:
GPT/Codex, session codex-20260912-adapter, with bounded implementation/review delegates.

Action:
Resumed against clean main at a00c275. Claude preserved the interrupted Codex
adapter in 3b3a973 and then implemented v1.4. The earlier Codex round ended
without its journal or final evidence; this entry records the missing handoff
without changing another agent's journal or retroactively claiming tests.

Inspected tracked artifacts and local/remote branches. GitHub connector branch
pagination confirmed only main remains remotely; shell GitHub access failed.
All old commits remain reachable from main. Kept the historical audit and
journals. Removed only this session's disposable generated Codex schemas and
host-inspection helper from .ai/runtime after their use.

Fixed default handoff in installed projects: select protocol checks by manifest
role instead of invoking a source-only test runner that was never installed.
Source repositories still require the full suite. Evidence explicitly covers
protocol checks; product tests remain separately reported by the agent.
An explicit missing owner now fails instead of stamping another journal.
Added integration files to scoped Git attributes so host CRLF rules do not
break hook JSON after checkout. Updated AGENTS, operator/Codex guides, TASK
and PLAN to match the current source/installed boundary and actual progress.

Read-only Codex CLI 0.154.0 app-server hooks/list discovered both project hooks
with no errors, enabled=true, trustStatus=untrusted, timeout=30s. No model turn
was started and no trust settings or user-home configuration were changed.

Result:
Targeted handoff tests: 13/13 passed. The additional CRLF checkout regression
passed against an actual isolated installed repository. Full Windows PowerShell
checks: validator exit 0 with no warnings; suite 109 passed, 0 failed/skipped,
237.57 seconds. This includes clean install, existing-project merge, upgrade,
state preservation, both host adapters and default installed record/verify.
git diff --check passed. The tooling attaches the final automated rerun below.

Next step:
Owner reviews the two Codex hooks in /hooks, opens the target repository and
supplies its first product objective in .ai/TASK.md. Connection commands are in
docs/PROTOCOL.md. This resumed session's changes are on
codex/finish-handoff-20260913; no commit or push was requested or performed.

Open:
Assumption: the owner's request authorizes completing the adapter and fixing
the reproduced adoption workflow; no new product or licence choice is inferred.
Automatic Codex execution awaits host trust review; discovery is not execution.
T6/T8, the first product pilot and proposed DEC-0014 remain open. Pre-v1.4
installations retain source leftovers and need target-specific inspection before
removal. No approved decision, another agent's journal or Git history was edited.

Evidence:
- anchor: a00c275873f40c0b98fb8edc7098da2668779204, uncommitted changes present
- digest: sha256:9cd461d672c3303146b77f641e9bdfe3e19db54af483a9793b4e3177f96e98a9 over 44 tracked and untracked files
- recorded: 2026-09-13T12:01:10.399Z by codex-20260912-adapter
- scope: protocol checks only; host-project tests run separately
- validate-protocol.ps1: exit 0 in 2s
- test-protocol.ps1: exit 0 in 237s
- reproduce: node scripts/protocol-handoff.cjs verify
