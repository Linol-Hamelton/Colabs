# Architectural and Technical Decisions

Decisions that are binding for this project. This is not a discussion log.
Discussion belongs in the Open questions section of `.ai/TASK.md`.

Append new blocks at the bottom. Never edit or delete an existing block, not
even its status line. When a decision is replaced, append a new approved block
carrying a `Supersedes:` line that names the old one. The old block keeps the
exact text it had when it was written.

This file is trustworthy only because nothing in it is ever rewritten. To find
whether a decision still stands, read forward for a later block that supersedes
it.

A proposal by an AI agent is not a decision. A decision needs `Approved by:`
with a human name.

---

## Approval note for DEC-0001 through DEC-0007

On 2026-09-11 the owner reviewed an analysis of protocol v0.1 and instructed
that the identified defects and technical debt be removed. These seven blocks
record what was done under that instruction. The owner approved the direction;
the specific technical choices were made by Claude and are all reversible. The
baseline commit `ae5e831` preserves v0.1 verbatim.

---

### DEC-0001

Status: Accepted
Date: 2026-09-11

Context:
`setup-ai-protocol.ps1` was stored as UTF-8 without a byte order mark. Windows
PowerShell 5.1 reads such a file as the system ANSI codepage. The downward
arrows in the AGENTS.md here-string were read as cp1251 and written back as
UTF-8, so the generated `AGENTS.md` contained a cyrillic mojibake sequence
where an arrow belonged. The generator corrupted its own output on every run.

Decision:
Every `.ps1` file in this project is ASCII-only. All generated files are
written as UTF-8 without a byte order mark and with LF line endings, using
`[System.IO.File]::WriteAllText` with an explicit encoding object rather than
`Set-Content -Encoding UTF8`, which emits a byte order mark on PowerShell 5.1.
`validate-protocol.ps1` fails when a non-ASCII byte appears in a `.ps1` file or
a byte order mark appears in any tracked text file.

Reasoning:
An ASCII-only script cannot be corrupted by an encoding mismatch, whatever
interpreter reads it. This removes the failure mode instead of documenting it.

Alternatives rejected:
Saving the script with a byte order mark. It fixes reading but leaves the
output path still emitting a byte order mark, and the next person editing the
file in a byte-order-mark-stripping editor reintroduces the bug silently.

Consequences:
The collaboration diagram in AGENTS.md uses no arrow characters. Comments in
scripts are English-only.

Approved by: RuslanFomenko

---

### DEC-0002

Status: Accepted
Date: 2026-09-11

Context:
The protocol named Claude as a participant but placed its rules in `AGENTS.md`.
Claude Code automatically loads `CLAUDE.md`. No `CLAUDE.md` existed, so Claude
could start a session without ever seeing the protocol.

Decision:
`CLAUDE.md` exists at the repository root, imports `AGENTS.md` with an `@`
import, and adds the Claude-specific details. `AGENTS.md` stays the single
source of the rules. `CLAUDE.md` never restates a rule, it points at one.

Reasoning:
Two copies of a rule diverge. A pointer cannot.

Alternatives rejected:
A symbolic link from CLAUDE.md to AGENTS.md. Symlinks need developer mode or
elevation on Windows and do not survive every clone.

Consequences:
A rule change is made in `AGENTS.md` only.

Approved by: RuslanFomenko

---

### DEC-0003

Status: Accepted
Date: 2026-09-11

Context:
Protocol v0.1 had no enforcement. Every rule depended on an agent voluntarily
opening a file. An agent that skipped `.ai/TASK.md` got no error and no
reminder, so compliance decayed silently.

Decision:
Two Claude Code hooks are configured in `.claude/settings.json`. SessionStart
injects `.ai/TASK.md`, `git status`, and the most recent worklog entries into
context before the first prompt. Stop compares the modification time of
`.ai/worklog/claude.md` against the newest changed file in the working tree and
warns when the worklog is older.

Reasoning:
A protocol nobody can forget to follow beats a protocol written more clearly.
The hooks are the only part of this repository that runs without being asked.

Alternatives rejected:
A blocking Stop hook that refuses to end the session. It fights the user during
exploratory work and trains people to disable hooks entirely. The warning is
the enforcement ceiling worth paying for.

Consequences:
The hooks depend on Git Bash and Node, both present on this machine. They exit
silently and harmlessly when either is missing, so the repository still works
elsewhere. Codex does not read `.claude/`; its compliance stays voluntary.

Approved by: RuslanFomenko

---

### DEC-0004

Status: Accepted
Date: 2026-09-11

Context:
`AGENTS.md` named git state and git history as the second-ranked source of
truth, but the directory was not a git repository. The protocol contradicted
its own environment.

Decision:
The directory is a git repository on branch `main`. Commit `ae5e831` preserves
protocol v0.1 exactly as generated, including the corrupted characters, so the
defect and its fix are both visible in history.

Reasoning:
Every other rule in the protocol assumes a diff exists. Without git there is no
diff, no history, and no recovery from an agent's mistake.

Alternatives rejected:
Removing git from the source-of-truth ranking. That would have discarded the
protocol's strongest mechanism to avoid an infrastructure step.

Consequences:
Agents may now rely on `git status` and `git diff`. No remote is configured;
pushing is a separate decision for the owner.

Approved by: RuslanFomenko

---

### DEC-0005

Status: Accepted
Date: 2026-09-11

Context:
Protocol v0.1 had a single `.ai/WORKLOG.md` shared by every agent. Two agents
running at once would overwrite each other, and the loser's entry would vanish
with no error.

Decision:
Each agent owns one file under `.ai/worklog/`, named for the agent. Entries are
prepended, newest first. No agent writes to another agent's file. `.ai/TASK.md`
and `.ai/DECISIONS.md` stay shared, because they change rarely and, for
decisions, are append-only.

Reasoning:
Partitioning the write set removes the conflict rather than coordinating
around it. No locking protocol is needed because no two writers share a file.

Alternatives rejected:
Append-only discipline on one shared file. It narrows the race window but does
not close it, and two concurrent appends on Windows can still interleave.

Consequences:
Reading recent history means reading several short files instead of one. The
session-start hook concatenates them for Claude.

Approved by: RuslanFomenko

---

### DEC-0006

Status: Accepted
Date: 2026-09-11

Context:
v0.1 said to archive a file "when it becomes too large" without defining large.
An undefined threshold is never crossed, so archiving would never happen and
the working memory files would grow until they crowded out the context window.

Decision:
Hard line limits, listed in section 6 of `AGENTS.md` and checked by
`validate-protocol.ps1`: 80 lines for `.ai/TASK.md`, 150 for each worklog, 200
for `.ai/PLAN.md`. `.ai/DECISIONS.md` and `.ai/ARCHIVE.md` have no limit and
are never trimmed.

Reasoning:
A number a script can check is a rule. An adjective is a suggestion.

Alternatives rejected:
Byte limits. Lines match how the files are actually read and edited, and stay
stable when text is translated.

Consequences:
Overflowing a limit fails validation and forces a real archiving pass. A plan
that cannot fit in 200 lines is a signal that the task should be split.

Approved by: RuslanFomenko

---

### DEC-0007

Status: Accepted
Date: 2026-09-11

Context:
`.ai/DISCUSSION.md` was meant to let agents debate asynchronously. In practice
neither agent can see a reply within its own turn, so the file collects
position statements that no one answers. It cost context on every session and
produced no decisions.

Decision:
`.ai/DISCUSSION.md` is removed. Disagreements and unresolved points go into the
Open questions section of `.ai/TASK.md`, which every agent already reads. A
resolved question moves into `.ai/DECISIONS.md` once the owner approves it.

Reasoning:
Fewer files that are always read beat more files that are read once. The
useful half of the discussion file was the open-questions list, and that half
survives.

Alternatives rejected:
Keeping the file as an append-only message channel. Cross-agent messaging is
better served by the owner relaying, or by real agent-to-agent messaging in
the host tool, than by a document neither agent polls.

Consequences:
`.ai/TASK.md` carries the debate. Its 80-line limit keeps the debate short,
which is the intended pressure. The v0.1 file remains in commit `ae5e831`.

Approved by: RuslanFomenko

---

### DEC-0008

Status: Accepted
Date: 2026-09-11

Context:
v0.1 embedded the full text of every protocol document inside
`setup-ai-protocol.ps1` as here-strings. The repository's own documents and the
script's copies were two versions of the same rule with nothing keeping them
equal. Any edit to `AGENTS.md` silently made the installer ship an older
protocol.

Decision:
The installer copies the canonical files out of this repository instead of
carrying its own copies. `AGENTS.md`, `CLAUDE.md`, the hooks, the settings and
the hygiene files are copied live. The blank working-file skeletons live in
`templates/ai/` because this repository's own `.ai/` holds real project state
that must never be copied into a new project. A `-Verify` mode reports which
target files have drifted from the source.

Reasoning:
One copy cannot disagree with itself. The drift that v0.1 made inevitable is
now structurally impossible, and `-Verify` catches drift in the other
direction, where an installed project edits the protocol locally.

Alternatives rejected:
Keeping the here-strings and adding a test that compares them to the documents.
It detects the divergence instead of preventing it, and the test is one more
thing to keep in sync.

Consequences:
The installer is no longer a single self-contained file. Installing into a new
directory requires this repository to be present. `setup-ai-protocol.ps1` run
with no `-Target` now checks the source directory rather than generating into
it. This repository is the protocol home; new projects are installed from it.

Approved by: RuslanFomenko

---

### DEC-0009

Status: Accepted
Date: 2026-09-11
Supersedes: DEC-0003, DEC-0005, DEC-0008 (only the mechanics clarified below)

Context:
The owner read Codex's repository review and on 2026-09-11 explicitly asked
to fix the identified deficiencies and technical debt and configure this
folder as the default workspace before starting a test project. That request
authorizes the repair scope below. Technical mechanisms are reversible
implementation choices under that instruction, not separate claimed votes.

Decision:
Existing .ai working state is initialization-only and survives every upgrade,
including -Force. Verification of state checks presence, not template equality.
Managed tooling can be updated with backups; unrelated project configuration
is preserved. Verify never creates a missing target.

Hooks remain nonblocking reminders. They use per-session content snapshots
and unique worklog names instead of global modification-time guesses. Agents
own their session journals. One coordinator holds a cooperative filesystem
lock while editing TASK, PLAN, DECISIONS or ARCHIVE; delegates use disjoint
implementation file sets. Tools do not prevent writes by nonparticipants.

Decision blocks remain immutable: a replacement is a new approved block with
an explicit Supersedes field. This supersedes the introductory instruction
to edit an older block's status. New worklog entries are always prepended.
All protocol text, including ASCII-only PowerShell, uses LF as DEC-0001 says.

Reasoning:
These changes directly address reproduced data loss, missed handoffs, invalid
validation results and ambiguous ownership without adding a service or database.

Alternatives rejected:
Resetting working state on upgrade; timestamp-only detection; unsynchronized
shared-file replacement; silent replacement of application settings.

Consequences:
Node.js 22, Git and PowerShell are required for the complete check suite;
Claude shell entrypoints also use Bash. Shared-file locking is cooperative and
interrupted locks require inspection before recovery. Regression tests run
locally and in CI. Existing DEC blocks and journals retain their original text.
The test application's design and live pilot remain future owner-led work.

Approved by: RuslanFomenko

---

### DEC-0010

Status: Accepted
Date: 2026-09-11
Supersedes: nothing; this completes the mechanics DEC-0009 decided

Context:
DEC-0009 introduced per-session journals and a cooperative lock, and the hooks
were changed to match. The documents were not. `AGENTS.md` still described one
journal per agent and never mentioned the lock, the regression suite or
`.ai/runtime`; `CLAUDE.md` named a specific file that the hook no longer
assigns; the introduction to this log still told agents to edit an older
block's status, which DEC-0009 had forbidden. Meanwhile the installer manifest
named `docs/PROTOCOL.md`, a file that was never created, so the installer
failed on every run and took seven regression tests with it, while the
validator still reported the repository healthy.

Decision:
The documents are brought up to the implementation rather than the other way
round. `AGENTS.md` is the single description of session journals, the lock,
the checks, the size limits and the immutability of decision blocks.
`docs/PROTOCOL.md` exists and is the operator guide installed into every
target project. The validator runs the installer's read-only self-check and
fails when the installer cannot run. The lock reports how long it has been
held and whether it is stale, and names the exact recovery command, but still
never steals a lock. The hook command is silent outside a Git checkout and
when the wrapper is absent. Both PowerShell entry points force UTF-8 console
output so non-ASCII paths survive into logs and assertions.

Reasoning:
Every defect in this round came from two sources disagreeing with nothing to
notice the gap. A manifest disagreed with the file system, the documents
disagreed with the hooks, and the health check did not cover the installer at
all. Each fix closes one of those gaps at the point where the disagreement can
be detected mechanically.

Alternatives rejected:
Reverting to one journal per agent. That would have overturned an approved
decision on an agent's own judgment, and the collision it was introduced to
prevent is real. Changing the journal file naming to something sortable was
also rejected for now: the format is pinned by a regression test, the hook
already orders and bounds what it injects, and the validator now warns when
the directory grows past thirty journals.

Consequences:
The journal directory grows by one file per session and needs periodic
archiving; the warning threshold is thirty. Validation now spawns the
installer, so it takes about a second longer and the regression suite about
twenty-five seconds longer. A project that is not a Git repository gets no
protocol context at session start, silently, which is the documented cost of
DEC-0004 requiring Git.

Approved by: RuslanFomenko

---

### DEC-0011

Status: Accepted
Date: 2026-09-12
Supersedes: nothing; it adds a mechanism and closes defects found by the audit

Context:
The 2026-09-12 audit reproduced five cases where a check reported success while
the thing it checked was absent, disabled or ineffective. Deleting the
installer left validation green because the file was not required and the
self-check was wrapped in a test for its own existence. One settings key
switched every hook off with no diagnostic. A later negation pattern cancelled
the canonical ignore rules while their text stayed in place, so session state
could reach a commit. Separately, both agents had written journal entries whose
central claims nobody could check: "59 tests pass" and "no implementation was
changed" were prose, and the next agent had to take them on trust.

Decision:
Two changes, one defensive and one structural.

Validation stops reporting success for a protocol it cannot see. Every runtime
entry point is a required file. A missing installer fails instead of skipping
its self-check. `disableAllHooks` in either settings file fails, because the
owner keeps the right to disable enforcement but not the right to a green
protocol check while it is off. Ignore rules are checked by asking Git what it
actually ignores rather than by reading the file for expected lines.

Handoff carries evidence instead of assertions. `scripts/protocol-handoff.cjs
record` runs the checks, writes their real exit codes into the session journal,
and stamps the entry with a digest of the exact tree they ran against. It exits
non-zero when a check fails, so a failing tree cannot produce a passing
receipt. `verify` recomputes the digest and fails when the tree has moved. The
digest covers file content and mode only, never the Git index, so evidence
recorded before `git add` still verifies after it. `Evidence` is an optional
sixth field in a journal entry; the five required fields are unchanged.

The SessionStart hook now creates the journal it names, and CI runs the
validator, the suite and a clean install on Windows PowerShell 5.1.

Reasoning:
Every defect this protocol has produced so far came from a confident statement
that nothing could contradict. A check that skips silently, a rule whose text
survives its own cancellation, and a journal claim with no anchor are the same
failure in three places. Requiring evidence does not make an agent honest; it
makes the honest answer the only one that survives re-running.

Alternatives rejected:
Warning instead of failing on disabled hooks. A warning leaves the headline at
Protocol OK, which is the exact false signal being removed. Storing evidence in
a separate file: the next agent reads journals, and a second location is a
second thing to fall out of sync. Making Evidence a required sixth field: it
would invalidate every existing entry and force ceremony on read-only sessions.

Consequences:
Validation now spawns Git for three ignore probes and fails on configurations
that previously passed, including any project that legitimately disables hooks.
Recording evidence runs the full suite, which takes roughly two minutes, so it
belongs at handoff rather than after every change. Running `record` without
`--quick` from inside the suite would recurse; the tests use the exported
functions instead. CI results are only visible once the branch is pushed.

Approved by: RuslanFomenko

---

### DEC-0012

Status: Accepted
Date: 2026-09-12
Supersedes: nothing; it removes duplication DEC-0011 left in place

Context:
CI ran for the first time on 2026-09-12 and failed immediately. The validator
required `scripts/protocol-handoff.cjs` while the installer's manifest never
shipped it, so every installed project was born broken. That was the third
instance of one defect: a manifest naming a file that did not exist, a required
file missing from the manifest, and now a required file the installer never
delivered. Three separate lists had to agree and nothing compared them.

Testing the install into a realistic existing project exposed a second problem.
The validator inspected every file Git could see, so a host project whose own
source used CRLF failed validation on the day it adopted the protocol. The
encoding rules exist to stop Windows PowerShell 5.1 corrupting this protocol's
own scripts. Applying them to somebody else's codebase is overreach and makes
the first impression of the protocol a red check for something it does not own.

Decision:
`protocol-manifest.json` is the single definition of what this protocol owns.
The installer copies from it and the validator requires from it; neither keeps
a list of its own. It names the managed files, the test files, the integration
files it merges rather than replaces, and the working state created once per
project. It lists itself, so an install carries it forward. Tests assert that
every entry exists, that every test file on disk is listed, and that an
installed project contains every entry.

Validation inspects protocol-owned files only: the manifest entries plus
`.ai/`, `templates/ai/` and `.claude/hooks/`. A host project's own sources are
not inspected for encoding, line endings or syntax. The rules still apply in
full to everything the protocol ships.

The two seed journals are gone. `claude.md` and `codex.md` were the last
remnant of the one-journal-per-agent model that DEC-0009 replaced; they forced
an exception into four documents and put two placeholder files into every new
project. Their entries moved whole into `.ai/ARCHIVE.md`, which is the first
time the archiving procedure has been exercised. `.ai/worklog/README.md`
explains the convention in their place.

Reasoning:
Every one of these defects is duplication with no reconciliation. Two lists of
files, two models of journal naming, and one rule applied to two different
scopes. Removing the duplicate removes the class, which adding a fourth check
would not.

Alternatives rejected:
Adding the missing file to the installer's list. It fixes the instance and
leaves the next divergence to CI or to a user. Making host-file encoding a
warning: the headline would still be green while the message implied the host
should change its line endings, which is not this protocol's call.

Consequences:
Adding a protocol file now means editing the manifest, and a test fails if it
is forgotten. A host project can hold its own conventions, so the validator no
longer reports anything about files outside the protocol. The archive holds
four journals; the live worklog directory holds two plus its README.

Approved by: RuslanFomenko

---

## Template for new decisions

### DEC-nnnn

Status: Proposed | Accepted
Date:
Supersedes: _the DEC this one replaces, or omit the line_

Context:
_What situation forced a choice._

Decision:
_What was chosen, stated so it can be checked._

Reasoning:
_Why this over the alternatives._

Alternatives rejected:
_What else was on the table and what disqualified it._

Consequences:
_What this costs, and what it now constrains._

Approved by: _a human name; an agent may not fill this in for itself_
