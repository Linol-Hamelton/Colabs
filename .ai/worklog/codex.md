# Worklog: GPT/Codex

Short-term working memory. Owned by GPT/Codex. No other agent writes here.

Newest entry first. Limit 150 lines. On overflow, move the oldest entries to
`.ai/ARCHIVE.md` without changing their text.

---

## 2026-09-11 - Repository and idea review

Agent: GPT/Codex (with independent script and hook review subagents)

Action:
Reviewed the current v1.0 working tree, all protocol documents, installer,
validator, hooks, templates, and the staged changes against baseline ae5e831.
The owner explicitly requested a repository/idea assessment; treated that as
the review task despite the initial TASK.md placeholder. No implementation,
decision, other agent's worklog, index entry, or commit was changed.

Result:
The file-based handoff design is useful, but reliable upgrades and concurrent
writes are not established. Confirmed in isolated temporary repositories:
- Fresh install with -InitGit, target validation, and -Verify all returned 0.
- Repeating the install kept all 22 files; hashes were unchanged.
- Editing TASK, DECISIONS, and the Codex worklog made -Verify return 1;
  its recommended -Force erased the added project-state markers.
  See setup-ai-protocol.ps1:128,251,321.
- An ignored .ai/scratch/thirdparty.ps1 containing a non-ASCII comment
  made validation fail; scanning includes ignored files. See validator:86.
- An Accepted DEC block with no Approved by field passed with no approval
  warning. Invalid UTF-8 bytes in a Markdown file also passed.
  See validate-protocol.ps1:102,297.
- Stop warned for an ordinary file edit but missed a path containing spaces,
  deletion-only changes, a staged rename, a newest edit beyond the first
  60 paths, and a worklog/edit pair within the same second.
  See .claude/hooks/stop-worklog-check.sh:24,32.
- The configured SessionStart command emitted context from a project root
  but silently skipped it from a subdirectory. See .claude/settings.json:17.

Root checks before this entry: validate-protocol.ps1 returned 0 with the
expected no-active-task warning; git diff HEAD --check returned 0.
Hook cases used Git Bash; installer/validator cases used Windows PowerShell
5.1. Reproductions used unique OS-temp directories, not project state.

Next step:
Owner prioritizes findings recorded in TASK.md. Proposed order: protect state
on upgrade, add regression coverage, define shared-file ownership, then pilot
real handoffs and measure missing context, rework, and documentation cost.

Open:
Recommendations are proposals, not approved decisions. DEC-0005's no-shared-
writers rationale conflicts with shared TASK/DECISIONS/ARCHIVE ownership;
per-product worklog names also leave simultaneous same-product sessions
ambiguous. Other rule inconsistencies: append/prepend worklogs, immutable
decision blocks versus editing superseded status, and LF prose versus CRLF
PowerShell configuration. No full Claude UI session or live concurrent agent
write test was run. The v1.0 changes remain staged and uncommitted as found.

---

## Entry template

## YYYY-MM-DD - short title

Agent:

Action:
_What you did._

Result:
_What is now true that was not before._

Next step:
_What the next session should pick up._

Open:
_Assumptions made, and anything left unverified._
