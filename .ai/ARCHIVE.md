# Worklog Archive

Cold storage for worklog entries moved out of `.ai/worklog/`. Never trimmed,
never summarized away.

Entries keep the exact text they had when they were current. Add the agent name
and the date they were archived; change nothing else.

Information needed to understand an accepted decision belongs in
`.ai/DECISIONS.md`, not here. This file is history, not authority.

---

## Archive

### claude.md

Archived 2026-09-12 by claude-20260912-cleanup.

## 2026-09-11 - Protocol v0.1 to v1.0 rework

Agent: Claude (Opus 5)

Action:
Ran `git init` and committed v0.1 verbatim as `ae5e831` before changing
anything. Rewrote `AGENTS.md` as an executable protocol: ranked sources of
truth, a write partition per agent, numeric size limits, an encoding rule.
Added `CLAUDE.md` so Claude Code actually loads the rules. Split the shared
worklog into `.ai/worklog/<agent>.md`. Removed `.ai/DISCUSSION.md` and moved
open questions into `.ai/TASK.md`. Rewrote `setup-ai-protocol.ps1` as a copier
over the canonical files instead of a generator carrying its own copies. Wrote
`validate-protocol.ps1` and the two hooks. Added `README.md`.

Result:
Recorded as DEC-0001 through DEC-0008. The v0.1 encoding bug is gone at its
root: every `.ps1` file is ASCII-only and the validator fails the build if that
stops being true. Verified by installing into two empty directories and
running the validator there.

Two bugs found and fixed during the work, both my own:
- The Stop hook missed changes because `git status --porcelain` collapses an
  untracked directory into one entry. Fixed with `-uall`.
- Both scripts died on a repository with no commits, because Windows
  PowerShell 5.1 turns a native command's stderr into a terminating error when
  `ErrorActionPreference` is `Stop`. Replaced `rev-parse --verify HEAD` with
  `rev-list --all --count`, which writes nothing to stderr.

Next step:
Owner starts the test project. The first real task goes into `.ai/TASK.md`,
and this protocol gets its first run against actual work rather than its own
scaffolding.

Open:
- Codex does not read `.claude/`, so it has no equivalent of the hooks. Its
  compliance is voluntary and that asymmetry is untested.
- v1.0 has never been exercised on a real task. Every claim about it being
  workable is untested until that happens.
- Not committed. AGENTS.md section 4 says the owner decides when to commit.

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

---

### codex.md

Archived 2026-09-12 by claude-20260912-cleanup.

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

---

### claude-20260911-followup.md

Archived 2026-09-12 by claude-20260912-cleanup.

## 2026-09-11 - Review of the Codex round, then repair

Agent: Claude (Opus 5), session claude-20260911-followup

Action:
Reviewed the state left by the Codex hardening round, then fixed what was
broken. Found the installer dead: its manifest named `docs/PROTOCOL.md`, a
file that never existed, so it threw on every run including its own
self-check, and seven of its own regression tests failed with it. Wrote
`docs/PROTOCOL.md` as the operator guide installed into target projects.
Fixed the eighth failing test by forcing UTF-8 console output in both
PowerShell entry points; PowerShell 5.1 had been emitting non-ASCII file
names in the OEM codepage, so a Cyrillic filename reached the test as
mojibake. Added an installer self-check to the validator, which had been
reporting the repository healthy while the installer could not run. Released
the shared-document lock left held by `codex-20260911-hardening` since
15:18 UTC, after confirming no operation was in progress and the journal it
named had never been created; then taught the lock to report how long it has
been held, whether it is past a 120-minute stale threshold, and the exact
release command, without ever stealing a lock. Rewrote `AGENTS.md` and
`CLAUDE.md` to describe per-session journals, the lock, the checks and the
immutability of decision blocks, none of which the documents mentioned after
DEC-0009 changed them. Fixed the introduction to `.ai/DECISIONS.md`, which
still told agents to edit an older block's status. Moved DEC-0009 above the
template block where it belonged. Made the hook command silent outside a Git
checkout and when the wrapper is missing, keeping the subdirectory fix that
Codex added. Added a validator warning when the journal directory passes
thirty files. Rewrote `README.md`.

Result:
59 of 59 tests pass, up from 51 of 59. The validator exits 0 with no
warnings, and now fails when the installer is broken: verified by deleting
`docs/PROTOCOL.md` and watching it report the exact cause. The hook command
was checked from the repository root, from a subdirectory and from a
directory outside any repository; the first two inject context, the third is
silent with empty stderr. Stale-lock detection was checked against a fixture
whose lock was 403 minutes old. Recorded as DEC-0010.

Next step:
Owner supplies the first objective for the test project. That is the first
time this protocol will be measured against real work rather than against
its own scaffolding.

Open:
- `.ai/worklog/codex.md` claims no implementation or decision was changed,
  which the working tree contradicts. A journal belongs to its own session,
  so I recorded the discrepancy in `.ai/TASK.md` instead of editing theirs.
- The journal file name is still a hash, pinned by a regression test. It is
  unique and the hook orders what it injects, but the directory does not sort
  chronologically. Changing it means changing the test; I left the decision
  to the owner rather than overturning it myself.
- Nothing is committed. Section 4 of `AGENTS.md` leaves that to the owner.
- The validator now spawns the installer, so the suite runs about 25 seconds
  longer.
- Protocol lapse of my own, recorded rather than hidden: after releasing the
  shared-document lock I edited `.ai/ARCHIVE.md` and the templates without
  re-acquiring it. The file was empty of archived entries and nothing was
  lost, verified by reading it back, but section 6 of `AGENTS.md` required
  the lock and I did not take it. The rule needs no change; I broke it.

---

### claude-20260911-publish.md

Archived 2026-09-12 by claude-20260912-cleanup.

## 2026-09-11 - Published to GitHub

Agent: Claude (Opus 5), session claude-20260911-publish

Action:
Owner supplied the repository `https://github.com/Linol-Hamelton/Colabs.git`
and asked for a push. Checked first, because the repository is public and a
push cannot be taken back: scanned every tracked file for key patterns and
credential assignments, confirmed the ignore rules keep `.ai/runtime/`,
`.claude/settings.local.json` and `.ai/scratch/` out, and confirmed no tracked
file is unexpectedly large. Verified the GitHub account matches the repository
owner. Found the v1.2 work already committed as `79b3f28` by the owner and the
tree clean. Added the remote, fast-forwarded `main` onto the work so the
default branch shows the real protocol rather than the corrupted v0.1
baseline, and pushed both branches.

Result:
The protocol is published. `main` and `harden-protocol-defaults` both point at
the v1.2 work; `ae5e831` keeps v0.1 verbatim in history, corruption included.
No secret was found and none was pushed.

Next step:
Owner supplies the first objective for the test project.

Open:
- The repository is public. Everything committed here is world-readable, which
  was not stated when the protocol was designed for a local folder.
- DEC-0009 records that regression tests run "locally and in CI". No CI
  workflow exists. With a GitHub remote now configured the claim can be made
  true, or the decision superseded to drop it. I did not add a workflow: the
  owner asked for a push, not for CI.
- Merging into `main` was my judgment call, on the reading that a repository
  created to store results should show them on its default branch. It is
  reversible.


---

## Archiving procedure

Two different limits, two different operations.

A journal passed its 150-line limit:

1. Cut its oldest entries.
2. Paste them below, under a heading naming the journal and the archive date.
3. Leave the newest entries in place, enough to explain the current state.

`.ai/worklog/` passed 30 files:

1. Pick the oldest journals whose sessions have ended. A journal is closed when
   no lock names it and its newest entry carries evidence or a Next step that
   the following session already acted on.
2. Move each closed journal here whole, heading and all, then delete the file.
   Moving entries out of a journal never reduces the file count; only this does.
3. Ownership does not block this. The rule against writing to another session's
   journal protects a live session; a closed journal is archived by whoever
   holds the shared-document lock.

Never rewrite an entry while moving it.

## From .ai/worklog/claude-5b5c238fef561932.md, archived 2026-09-16

Moved when the journal reached its 150-line limit. Text unchanged.

### 2026-09-16 - Widening the council, and what the proposal actually does

Agent: Claude (Opus 5), session claude-5b5c238fef561932

Action:
Tested the proposal instead of reasoning about it. Applied its two files
verbatim to a throwaway clone of this repository and ran the validator. It
failed twice: the rewritten `.ai/TASK.md` has no `Status` line, and a chat log
pasted under `.ai/knowledge_base/` carries CRLF, which `.ai/**` does not allow
because that tree is protocol-owned. Followed literally, the instructions break
the repository at step one.

Then looked for the real blocker and found it in the engine: `sessionPaths`
accepted only `claude` and `codex` and threw on anything else. Section 5 of
AGENTS.md described what an assistant without hooks should do but gave it no
way to do it, so Qwen and DeepSeek could not have joined at all.

Replaced the allowlist with a slug rule and added
`.ai/bin/protocol-session.cjs`, which starts a session for any named assistant:
it creates the journal the hooks create, prints the context the hooks inject,
and prints one owner name used for the journal, the lock and the evidence.
`stop` runs the same check the Stop hook runs. Aligned the version to 1.7.0,
which also closes the 1.6.1 against 1.6.2 mismatch Codex recorded.

Result:
Started real sessions as `qwen` and as `deepseek` and confirmed each received
the same context a hooked session receives, with a journal and an identity the
lock accepts. Path traversal and malformed names are refused and create
nothing. 130 tests pass, eight of them new. Recorded as DEC-0019.

Next step:
Owner decides where the simulation project lives. It needs its own repository
with the protocol installed, as Block-Puzzle has, and its task and chat logs
belong there rather than here.

Open:
- The proposal's split of gross value added sums to exactly 1.0, leaving
  nothing for intermediate consumption or capital expenditure. I am not an
  economist and this is the owner's field, but it is a modelling assumption
  presented as an invariant to encode, and it belongs in that project's
  DECISIONS before any code assumes it.
- The proposal gives one round to two assistants at once. The first pilot
  measured that outcome already: two plans for one task.
- Codex and Kimi are at their weekly limit and Gemini is not connected, so the
  three-round cascade cannot run as written today.
- Journals accumulate one file per started session even when the session does
  nothing. Two empty ones exist now. The thirty-file limit is the only backstop
  and no archiving pass has run in this repository.

Evidence:
- anchor: 2f42f7eec67b01c1bb952e3ddfbaac4725c9c94b, uncommitted changes present
- digest: sha256:3be8a36170a707d2fee1e16e674501dc451d5f972f16e7bb4ddd6ed465a666fb over 46 tracked and untracked files
- digest format: 4
- recorded: 2026-09-15T22:07:12.717Z by claude-5b5c238fef561932
- scope: protocol checks only; host-project tests run separately
- validate-protocol.ps1: exit 0 in 2s
- test-protocol.ps1: exit 0 in 255s
- reproduce: node .ai/bin/protocol-handoff.cjs verify
