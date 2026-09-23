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

### DEC-0013

Status: Accepted
Date: 2026-09-13
Supersedes: nothing; it narrows what DEC-0012 installs and what the protocol governs

Context:
Installing into a real product repository put 39 files there. Fifteen of them
were the installer, this protocol's own regression suite and its templates,
which a product repository cannot use and should not carry. The install also
wrote a `.codex/config.toml` that sets an approval policy and a sandbox mode,
and a `.gitattributes` containing `* text=auto eol=lf` whenever the project had
none, which changes line-ending normalization for every file the project owns.
An `.editorconfig` with `root = true` did the same for editor settings.

DEC-0012 had already established that this protocol inspects only what it owns.
The installer had not been held to the same boundary: it was still writing
rules for files it does not own.

Decision:
The manifest separates what is installed from what stays here. `managed` is the
runtime a project needs: the rules, the two host adapters, the shared hook
engine, the lock, the handoff tool, the validator and the manifest itself.
`source` is the installer, the test runner and the release documents, which
exist only in this repository. The installed copy of the manifest records
`"role": "installed"` and omits the source lists, so a project's validator
never demands an installer that was deliberately not delivered.

The protocol configures its own hooks and nothing else. `.codex/config.toml` is
no longer written: approval policy and sandbox mode are the host project's
decisions. `.editorconfig` is no longer written at all. A `.gitattributes`
created from scratch now carries the same scoped managed block a merge would
add, naming only protocol paths, instead of a copy of this repository's own
file. An existing hygiene file is merged, never replaced.

A `Supersedes:` naming a decision that does not exist now fails validation,
because a reader otherwise cannot tell which decision still stands.

The repository carries a licence, a contribution guide and a security policy.
The licence choice is recorded separately as DEC-0014 and is not settled here.

Reasoning:
Adoption is the moment a protocol is judged. A tool that drops its own test
suite into a product repository and rewrites that project's line-ending rules
will be removed before it is ever evaluated on its merits. The boundary that
DEC-0012 drew for inspection applies to installation for the same reason.

Alternatives rejected:
Shipping everything and documenting what to delete. It puts the work on every
adopter and leaves the protocol's tests running in projects that did not ask
for them. Keeping `.editorconfig` scoped rather than dropping it: an
`.editorconfig` at a project root with `root = true` stops that project's own
configuration from being found, which is not a side effect worth any benefit.

Consequences:
An install is 22 files instead of 39. A project that installed an earlier
version keeps the extra files until it removes them; nothing deletes them on
its behalf. Upgrading such a project leaves the stale installer and test suite
in place, which is untidy but harmless. Protocol files added in future must be
placed in the right manifest list deliberately, and a test fails when the lists
and the working tree disagree.

Approved by: RuslanFomenko

---

### DEC-0014

Status: Proposed
Date: 2026-09-13

Context:
The repository is public and had no licence, so nobody could legally use,
copy or modify it, including the owner's own later projects under a different
entity. Production readiness cannot mean a repository nobody may use.

Decision:
Proposed: MIT, with copyright held by the repository owner. It is the most
permissive common choice for tooling of this kind and imposes nothing on the
projects that install the protocol.

Reasoning:
The protocol is installed into other repositories and its files are copied
there. A copyleft licence would propagate obligations into every adopting
project, which would defeat the purpose. MIT does not.

Alternatives rejected:
Apache-2.0, which adds an explicit patent grant and attribution requirements.
It is a reasonable choice and the owner may prefer it. No licence at all,
which blocks every use.

Consequences:
`LICENSE` exists so the repository is usable today. If the owner chooses
differently, the file changes and a new decision supersedes this one.

Approved by: _pending; an agent may not choose a licence for its owner_

---

### DEC-0015

Status: Accepted
Date: 2026-09-13
Supersedes: nothing; it changes how the snapshot is computed, not what it means

Context:
Both hooks took a content hash of every file Git could see, on every run. The
Stop hook runs after every response, so that cost is paid continuously. Measured
on a generated five-thousand-file repository: 584 ms of hashing against 70 ms
for Git itself, and the hook as a whole took 800 to 900 ms. The cost is linear
in bytes, which projects to roughly six seconds per response at fifty thousand
files. Measured read-only against the owner's own product repository, which has
558 tracked files but 118 MB of content because of screenshots, hashing alone
took 238 ms.

An agent whose every reply is delayed by seconds will have the hooks removed,
and a protocol whose enforcement has been removed enforces nothing.

Decision:
Git already identifies every tracked file by the blob hash in its index, and
`git status` already says which files differ from it. The snapshot now reads
only what Git reports as changed or untracked; a clean tracked entry is
identified by its index record. Change detection is unaffected: an edit, a
revert, an addition and a deletion are each still detected exactly as before.

Because the identity strings changed, every digest changes with them. The
snapshot format is numbered and the number is recorded in each Evidence block.
Evidence written under an older format is reported as not comparable, naming
the format, instead of being reported as stale. A stale digest and an
incomparable one are different facts and the tool says which it found.

Reasoning:
Recomputing what Git has already computed is the whole of the cost. The index
is authoritative for a clean file by construction: Git decides whether a file
is clean, and its blob hash is the content identity it decided on.

Alternatives rejected:
Caching hashes between runs. It adds a cache to invalidate and would still read
every file the first time. Sampling or capping the file set: it would make the
snapshot silently incomplete, which is the class of defect DEC-0011 removed.
Leaving the digest unversioned: existing evidence would read as stale, which is
a false statement about why it does not match.

Consequences:
On the five-thousand-file repository the hook fell from about 850 ms to about
330 ms, and the remaining time is Git's own three calls rather than anything
that grows with content. On the owner's product repository the snapshot takes
122 ms and reads one file of 558. Evidence recorded before this change cannot
be compared against a tree measured after it, and says so; re-recording
refreshes it.

Approved by: RuslanFomenko

---

### DEC-0016

Status: Accepted
Date: 2026-09-13
Supersedes: nothing; it repairs a property DEC-0015 broke on the way past

Context:
DEC-0011 made the evidence digest independent of the Git index precisely so a
receipt would survive the `git add` and the commit that normally follow it.
DEC-0015 sped the snapshot up by identifying a clean tracked file from its
index record and hashing only what changed. That reintroduced the defect from
the other side: the same file had one identity while untracked, computed with
SHA-256, and another once tracked, taken from the index. Committing the work
therefore moved the digest, and the evidence recorded minutes earlier reported
that it no longer matched.

The final check of the session caught it, on the session's own evidence.

Decision:
A file has one identity in every state: the Git blob hash, in the form
`<mode>:<object id>`. For a clean tracked file it is read from the index. For
anything changed or untracked it is computed here, from the same definition Git
uses, so the two agree by construction rather than by coincidence. A symlink is
identified by the blob of its target path, which is what Git stores.

The snapshot format is 3. Evidence written under an earlier format is reported
as not comparable, as DEC-0015 established.

Reasoning:
Two functions computing the identity of one thing will disagree eventually.
Using Git's own definition on both paths removes the possibility rather than
testing for it, and a regression now asserts the digest is unchanged across
staging and committing.

Alternatives rejected:
Excluding the index state from the identity, as DEC-0011 did. It was what made
DEC-0015's speedup possible to get wrong, because the fast path had nothing to
agree with. Recomputing SHA-256 for clean files as well: that is the cost
DEC-0015 removed.

Consequences:
The identity is a SHA-1 blob hash rather than SHA-256, because that is what Git
stores. This is an integrity check against accidental drift between two
sessions, not a defence against a crafted collision; an agent able to forge a
blob hash could edit the journal directly. A clean, committed tree is now read
zero times during a snapshot, which a test asserts by counting reads.

Approved by: RuslanFomenko

---

### DEC-0017

Status: Accepted
Date: 2026-09-13
Supersedes: nothing; it completes the boundary DEC-0013 drew

Context:
The owner named two candidate repositories for the first product pilot. Both
keep their own `scripts/` and their own `docs/`: one has 8 and 51 files there,
the other 32 and 80. The protocol was installing `scripts/protocol-hooks.cjs`,
`scripts/protocol-lock.cjs` and `scripts/protocol-handoff.cjs` into the first
and `docs/PROTOCOL.md` and `docs/CODEX.md` into the second.

In one candidate `docs/` is a generated documentation site with its own deploy
workflow triggered on `docs/**`. Two protocol documents there would appear in a
published API reference, trigger a deployment on every protocol change, and
risk being removed by the generator.

DEC-0013 stopped the protocol writing rules for files it does not own. It did
not stop it writing files into directories it does not own.

Decision:
Everything the protocol ships now lives in a namespace it owns.
`scripts/protocol-*.cjs` moved to `.ai/bin/` and the two operator documents to
`.ai/docs/`. What an installed project receives is `.ai/`, `.claude/`,
`.codex/`, and four identifiable files at the root: `AGENTS.md`, `CLAUDE.md`,
`protocol-manifest.json` and `validate-protocol.ps1`. `.gitignore` and
`.gitattributes` are merged into whatever is already there.

Historical journals, the archive and earlier decision blocks keep the old
paths. They describe what was true when they were written and are not edited.

Reasoning:
A tool that scatters files through a project's own directories is removed
before it is judged. The host's directories are the host's, for the same reason
its line endings and its approval policy are.

Alternatives rejected:
Namespacing inside the host directories, as `scripts/protocol/`. It still
claims a directory the project owns and still triggers a docs deployment.
A fourth top-level directory such as `.protocol/`: `.ai/` is already the
protocol's namespace in that project, and one namespace is easier to explain
and to delete than two.

Consequences:
The two tools resolve the project root two levels up rather than one; that
broke silently on the move and is now covered by a test that runs them from a
subdirectory of an installed project. Anyone with a pre-1.6 installation has
protocol files in `scripts/` and `docs/` that an upgrade does not remove,
because nothing deletes files on a project's behalf. No such installation
exists today.

Approved by: RuslanFomenko

---

### DEC-0018

Status: Accepted
Date: 2026-09-14
Supersedes: nothing; it repairs an omission in DEC-0017

Context:
DEC-0017 moved the tools to `.ai/bin/` and updated every file that referenced
the old paths, except the three that were moved. By the time the references
were rewritten those files no longer matched the list they were looked up in,
so six instructions inside them still named `scripts/`.

One of them mattered. The SessionStart hook injects "use
scripts/protocol-lock.cjs before editing it" into every agent's context, and in
an installed project that path does not exist. The first agent in the pilot
would have followed the instruction and failed. The evidence block told the
next reader to reproduce with a command that would not run either.

Found by rehearsing a whole session inside a clone of the pilot repository,
not by reading the diff.

Decision:
The six instructions name `.ai/bin/`. Two checks keep it that way: no file the
protocol ships may mention a retired path standing on its own, and every tool
path appearing in the injected context must exist in the installed project it
was injected into.

Reasoning:
A path inside a string is invisible to every check that reasons about files.
The second check is the one that matters, because it tests the thing an agent
actually receives rather than the thing a maintainer meant to write.

Alternatives rejected:
Deriving the paths at runtime from the manifest. It removes the literal, but an
instruction assembled from data is harder to read in a diff, and the reference
would still be a guess about where the reader is standing.

Consequences:
A future move of a tool requires updating its own strings, and the second check
fails if it is forgotten. Renaming a tool requires updating the retired list.

Approved by: RuslanFomenko

---

### DEC-0019

Status: Accepted
Date: 2026-09-16
Supersedes: nothing; it widens who may take part

Context:
The owner intends to widen the council beyond Claude and Codex, starting with
Qwen and DeepSeek, and later Gemini. A proposal arrived describing how to do it.
Applied literally to a copy of this repository it failed at once: the validator
reported two failures, a missing `Status` line in the rewritten `.ai/TASK.md`
and CRLF in a pasted chat log placed under `.ai/knowledge_base/`. Both were
reproduced before this block was written.

Underneath that, the engine could not have served the new assistants at all.
`sessionPaths` accepted only `claude` and `codex` and threw on anything else,
so no other assistant could obtain a journal, an identity or the injected
context. Section 5 described what a hookless agent should do without giving it
any way to do it.

Decision:
Any assistant may take part. The agent name is validated as a slug rather than
matched against a list, because the name becomes a filename and that is the
only property that matters. `.ai/bin/protocol-session.cjs` starts a session for
an assistant without hooks: it creates the journal the hooks would create,
prints the context the hooks would inject, and prints one owner name used for
the journal, the lock and the evidence. `stop` runs the same check the Stop
hook runs.

A project that uses the protocol keeps its own repository, and the protocol is
installed into it. Task documents, knowledge bases and chat logs belong to that
project, not to this one. Raw pasted material does not belong under `.ai/` in
any project, because `.ai/**` is protocol-owned and held to UTF-8 and LF; a log
copied from a browser on Windows will fail validation on arrival.

Reasoning:
The council is worth widening only if a new member is bound by the same rules
as the others. Handing an assistant a paragraph of instructions produces an
unattributed artifact, which is what the first pilot already showed. Handing it
one command produces a journal, an identity and a verifiable handoff.

Alternatives rejected:
Extending the allowlist with each new name. It makes every new member a change
to the engine and a release. Writing a hook adapter for each assistant: most
are reached through a chat panel with no hook contract at all, and the two that
have one are already served.

Consequences:
Agent names are now a naming convention rather than a closed set, so a typo
creates a new identity instead of an error. Journals accumulate one file per
started session whether or not the session did anything; two empty ones already
exist, and the thirty-file limit is the only backstop. The version identifier
moves to 1.7.0, which also closes the 1.6.1 against 1.6.2 mismatch recorded as
an open question.

Approved by: RuslanFomenko

---

### DEC-0020

Status: Accepted
Date: 2026-09-16
Supersedes: nothing; it acts on what the first pilot measured

Context:
The first pilot gave one task to two assistants at once. Both did it. Two
development plans for the same repository arrived ten minutes apart, 225 and
238 lines, covering the same ground. Nothing had collided: the journals were
partitioned and the lock held. What was lost was not a write but an assignment.

A proposal to widen the council repeated the shape, giving one round to two
assistants by name. Asked how roles should work, the owner said they want to
alternate at their own discretion, or by a written priority of roles, or both
at the same time. A fixed rotation was proposed here and the owner rejected it.

Decision:
`.ai/TASK.md` may carry a `## Roles` section, one assistant per line as
`- name: role`. The owner writes it. Nothing assigns, rotates or enforces.
The role is free text, so a priority or a condition lives inside it, and the
owner changes it per task at will. That covers assignment by discretion, by
written priority, and both together, because all three are the same act of
writing a line.

At session start each assistant is told its own role. One the task does not
name is told so and told to ask before starting. The task template ships the
section with the examples in prose rather than as list entries, so a new
project starts with nobody assigned.

The template also lists the statuses the validator accepts. A previous session
discovered them by having its receipt refused.

Reasoning:
The duplicate work was not a concurrency defect and a lock would not have
prevented it. Each agent simply did not know another had the same task. The
cheapest thing that fixes it is telling each one what it is, which is one line
of injected context, and leaving the choice entirely with the owner.

Alternatives rejected:
A fixed rotation of implementer and reviewer. The owner wants to decide per
task, and a protocol that decides for them would be overridden or ignored.
Enforcing that an unnamed assistant may not work: the hooks warn and do not
block by DEC-0003, and an owner sometimes wants a third opinion without
editing the task first.

Consequences:
Roles are advisory. An assistant that ignores the line is not stopped, exactly
as the Stop hook does not stop a missing journal entry. The section is optional,
so a task without it behaves as before and nothing about roles is injected.

Approved by: RuslanFomenko

---

### DEC-0021

Status: Accepted
Date: 2026-09-16
Supersedes: nothing; it repairs what three independent reviews found

Context:
Three assistants that did not build this repository reviewed it: DeepSeek, Qwen
and Gemini. Ten findings survived reproduction. The full account is in
docs/reviews/2026-09-16-council-review.md.

The one that mattered: the evidence digest excluded `.ai/worklog/`, so the
artifact the protocol calls a record could be rewritten after it was certified
and `verify` still reported a match. The exclusion was deliberate, to stop the
evidence invalidating itself the moment it was written, but the consequence was
never closed, never recorded in DEC-0011 and never tested. Six rounds of
internal work had not seen it, because we kept checking the mechanism and never
asked what the mechanism was for.

Decision:
Each Evidence block now carries a hash of its own entry with the block removed,
so the hash covers the claim and not itself. `verify` recomputes it and fails
when the entry changed since it was certified. Evidence recorded before this is
reported as predating entry hashing rather than as stale.

A lock operation gate now records the process that made it. An abandoned gate
is named as abandoned and cleared with `clear-operation`, which refuses while
that process is alive and refuses without `--force` when it cannot tell.
`stop` no longer reports a handoff when no entry was written. Fields parse the
same in any order, so a permuted entry no longer has one field swallow the
rest. The validator compares each committed decision block against `HEAD` and
fails when a written block was edited; it compares the version in the manifest,
the rules and the installer and fails on drift; and it warns when a journal
holds an entry naming a different agent. A field shorter than three characters
no longer counts, which stops a stub but judges nothing. `prune` removes
journals that hold no entry. A `--quick` receipt states that the suite was not
run.

Journal ownership stays unenforced and is now said plainly: nothing inside one
checkout can stop a session writing into another session's journal, and the
warning above catches accident rather than intent.

Reasoning:
Nine of the ten were mechanisms that could be made to disagree with their own
rules, which is the class DEC-0011 exists to remove. The tenth, journal
ownership, cannot be enforced by cooperative tooling in a shared checkout, so
the honest repair is to say so rather than to add a check that pretends.

Alternatives rejected:
Including journals in the digest. That is the cycle the exclusion was there to
break: writing the evidence would invalidate it. Hashing the entry without its
own block gives the same guarantee with no cycle. A length floor high enough to
judge substance: no number distinguishes work from filler, and pretending
otherwise is the false confidence this protocol is built against.

Consequences:
Evidence recorded before today cannot be compared and must be re-recorded; the
tool says which of the two cases it found. The immutability check needs a
committed `.ai/DECISIONS.md` and warns when there is none. A stub entry now
fails the Stop check, which will surface in any session that was writing
placeholders. Ten regressions were added, one per finding, each named for the
finding it holds down.

Approved by: RuslanFomenko

---

### PROTO-DEC-0022

Status: Accepted
Date: 2026-09-18
Supersedes: DEC-0014

Context:
Decisions of the protocol core and product decisions shared the same `DEC-nnnn`
namespace and both started at 0001, causing protocol citations in installed
tooling to collide with unrelated product decisions. Furthermore, the `Proposed`
status in `DECISIONS.md` invited mutable drafts into an append-only log, leaving
DEC-0014 unapproved in the core and causing illegal in-place edits in consumer
projects (VPN DEC-0004).

Decision:
All core decisions in this repository use the `PROTO-DEC-nnnn` prefix starting
with PROTO-DEC-0022. The validator accepts both `DEC-nnnn` and `PROTO-DEC-nnnn`.
The `Proposed` status is strictly forbidden in `DECISIONS.md` across all projects;
decision drafts belong in `.ai/PLAN.md` or `.ai/TASK.md` Open questions and are
recorded in `DECISIONS.md` only once approved by the human owner.
This decision formally supersedes DEC-0014 and ratifies the MIT license for
this repository under copyright of Ruslan Fomenko.

Reasoning:
Separating the namespace eliminates collision between core protocol engineering
and host product decisions without breaking existing history. Forbidding
unapproved blocks guarantees 100% append-only immutability.

Alternatives rejected:
Installing a separate PROTOCOL-DECISIONS.md index into every consumer project:
increases repository footprint unnecessarily. Allowing in-place amendment of
status: weakens the validator's cryptographic immutability guarantees.

Consequences:
New protocol decisions are numbered PROTO-DEC-0022 onward. The validator fails
any decision carrying Status: Proposed. DEC-0014 is closed and replaced.

Approved by: RuslanFomenko

---

### PROTO-DEC-0023

Status: Accepted
Date: 2026-09-18
Supersedes: nothing; it resolves consumer line-limit churn and prune data loss

Context:
In active repositories, the 150-line journal limit forced agents to perform
manual archiving multiple times per day (e.g., 5 manual archives in VPN in a
single day). Additionally, `protocol-session.cjs prune` permanently unlinked
empty journals via `fs.unlinkSync`, which destroyed substantive work when
non-standard headers were encountered.

Decision:
1. `protocol-archive.cjs` provides `autoArchiveWorklog(root, worklogPath, 150, 1)`,
which is automatically called during `protocol-session.cjs stop`, the Stop hook,
and `protocol-handoff.cjs record`. When a journal exceeds 150 lines, its older
entries are automatically moved to `.ai/ARCHIVE.md` while keeping the newest entry,
preventing line-limit failures without manual toil.
2. `protocol-session.cjs prune` moves empty journals to `.ai/runtime/pruned/`
quarantine instead of unlinking them. Live sessions and active lock holders are
preserved. `cleanup-runtime` purges quarantine items older than 30 days.

Reasoning:
Automating repetitive archiving preserves developer and agent focus while
maintaining strictly bounded context sizes. Moving deleted files to a quarantine
directory provides safe, reversible cleanup.

Alternatives rejected:
Raising journal line limits to 300+: increases context consumption on multi-log
reads. Keeping unlink with manual dry-run: prone to permanent data loss on regex
misses.

Consequences:
Journals stay below 150 lines automatically. Pruned journals are recoverable from
`.ai/runtime/pruned/`.

Approved by: RuslanFomenko

---

### PROTO-DEC-0024

Status: Accepted
Date: 2026-09-18
Supersedes: nothing; it resolves credential redaction and expands assistant support

Context:
When an entry is certified with an Evidence block, the entry's content hash is
permanently sealed. If an unredacted secret or sensitive token is later discovered
and redacted, the Evidence block fails verification with "entry was changed after
it was certified". Furthermore, collaborative work requires first-class protocol
infrastructure for additional LLM assistants, specifically GLM and Mistral.

Decision:
1. `protocol-handoff.cjs` introduces `rehash --owner <id> --reason <text>`.
When a certified entry is edited post-hoc to redact credentials, `rehash`
recalculates the entry hash, updates the `entry: sha256:...` line, and appends
`- sanitized: <iso-date> reason: <text>` to the Evidence block, restoring valid
verification while recording the sanitization.
2. Infrastructure and documentation are expanded to natively support GLM (`glm`)
and Mistral (`mistral`) as registered multi-agent assistants alongside Claude,
Codex, DeepSeek, Gemini, and Qwen.

Reasoning:
Credential leaks require immediate scrubbing; invalidating certified handoff history
permanently discourages proper security hygiene. Providing a sanctioned `rehash`
command preserves both cryptographic authenticity and security. Explicitly
supporting GLM and Mistral expands team interoperability.

Alternatives rejected:
Requiring an entirely new session and abandoning previous handoff evidence:
leaves broken records in the audit trail. Hand-editing hashes: violates protocol
verification rules.

Consequences:
Redacted journals can be restored to verified status with full audit provenance.
GLM and Mistral can participate across all protocol commands and roles.

Approved by: RuslanFomenko

---

### PROTO-DEC-0025

Status: Accepted
Date: 2026-09-18
Supersedes: nothing; it establishes consensus rules for releases, Merkle traversal, runtime TTL, and repository isolation

Context:
Consensus review of protocol v1.9.0 across 7 independent assistants (Claude, DeepSeek,
Copilot, Mistral, Qwen, GLM, Gemini) surfaced five architectural forks requiring
formal governance: release commit granularity, Merkle verification depth,
runtime snapshot retention, consumer repository commit isolation, and cross-platform
validator migration.

Decision:
1. Release commits in the protocol source repository are atomic and paired with an
   annotated Git tag (`git tag -a`). Intermediate commits during release transitions
   are prohibited to avoid non-bisectable, broken protocol states.
2. In-journal Merkle verification defaults to complete traversal of the active
   journal file (bounded by the 150-line file limit). Cross-file traversal into
   `.ai/ARCHIVE.md` is explicit via `--deep` and enforced in `protocol.cjs doctor` and CI.
   Evidence recording fails closed if parent tampering is detected.
3. Runtime snapshots in `.ai/runtime/` retain a 24-hour TTL and are pruned lazily only
   when the owning process is confirmed dead. Active sessions are never pruned.
4. The protocol source repository never executes git commits in consumer repositories.
   Consumer projects manage protocol upgrades within their own active sessions under
   their own task context and Evidence blocks.
5. Cross-platform validation engine migration to Node.js is scheduled for the v2.0
   roadmap, requiring differential verification against the PowerShell reference implementation.

Reasoning:
Atomic release commits guarantee that every tagged revision is green and fully
verified. In-journal full verification eliminates historical tampering blind spots
within active journals with negligible runtime overhead (<2ms). 24-hour snapshot
retention guarantees crash recovery without risk of orphaned process interference.
Repository isolation preserves the integrity of foreign working trees and task evidence.

Alternatives rejected:
- Multi-commit releases: rejected due to producing broken, non-bisectable intermediate states.
- O(1) single-entry verification: rejected for permitting undetected tampering inside active journals.
- Immediate runtime deletion on session stop: rejected for destroying crash forensics.
- Automated foreign commits: rejected for violating repository isolation boundaries.

Consequences:
`protocol-handoff.cjs verify` inspects the full active journal by default. `protocol.cjs
clean` respects process liveness and the 24-hour TTL. Consumer upgrade procedures
remain session-driven.

Approved by: RuslanFomenko

---

### PROTO-DEC-0026

Status: Accepted
Date: 2026-09-18

Context:
Session journals are capped at 150 lines by design to maintain lean operational
logs. In-depth architectural evaluations, multi-model consensus deliberative
records, and extensive cryptographic/security audits often exceed 200-500 lines.
Previously, detailed reasoning lived only in chat panels or was lost when journals
were truncated, causing significant knowledge loss between disparate AI assistants.

Decision:
1. Long-form engineering reports, architecture reviews, security audits, and
   council consensus syntheses must be persisted as Git-tracked documents in
   `docs/reviews/YYYY-MM-DD-<agent>-<short-description>.md` using
   `templates/reviews/REVIEW.md`. In host projects, the review path is defined by
   the project owner (DEC-0013/0017).
2. The review document is the primary engineering deliverable. The session
   journal holds a concise entry (<= 150 lines) with all five required labels
   linking to the review file, followed by an anchored Evidence block.
3. Chat panel output is strictly limited to an executive verdict, the review file
   path, and critical blocking findings. Detailed technical essays must not be
   dumped into chat.
4. Every review file must declare a mandatory header specifying:
   - Reviewed commit SHA (`git rev-parse HEAD`)
   - Working tree state (`clean` or `dirty`)
   - Reviewer model name, date (UTC), scope, and verdict
5. For assistants operating through chat interfaces without direct filesystem
   access, the human owner or coordinator persists the text with a transcription
   header (`> Transcribed from chat by <owner/agent>, model: <name>, date: <ISO>`).
6. Review files are immutable historical records. If an analysis is revised or
   superseded, a new review file is published or marked `Superseded by:`.

Reasoning:
Storing reviews directly in Git guarantees permanent, discoverable institutional
memory across all AI coding assistants without burdening the human owner with
repetitive manual copy-pasting. Placing reviews outside `.ai/` prevents churn in
session snapshot working tree digests. Requiring commit SHA and tree status makes
every audit reproducible.

Alternatives rejected:
- Storing reviews in `.ai/reviews/`: rejected because `.ai/` is included in working
  tree snapshot digests, so adding reviews would invalidate active evidence receipts.
- Permitting unconstrained worklog growth: rejected because it degrades context
  window efficiency and breaks the lean operational focus of journals.
- Relying on chat history: rejected because chat history is not shared between
  different assistant families and is lost across sessions.

Consequences:
`templates/reviews/REVIEW.md` is added to the protocol source repository. `AGENTS.md`
and `QUICKSTART.md` mandate this deliverable structure. The Grand Council consensus
is archived in `docs/reviews/2026-09-18-grand-council-consensus-v1.9.0.md`.

Approved by: RuslanFomenko

---

### PROTO-DEC-0027

Status: Accepted
Date: 2026-09-18

Context:
Adversarial peer reviews from the Council of Models (DeepSeek, Copilot, Mistral,
CodeGeeX, Qwen) on releases v1.9.0-v1.9.2 identified six critical kernel edge cases:
(1) `autoArchiveWorklog` blindly cleared cooperative locks held by one-shot CLI
sessions whose PID had exited, permitting lock theft;
(2) Windows `fs.renameSync` in `protocol-archive.cjs` was vulnerable to transient
antivirus/indexing file lock collisions (`EPERM`/`EBUSY`);
(3) Historical journal entries using format < 4 lacking `entry:` lines were
erroneously flagged as `tampered` rather than `legacy`, breaking backward compatibility;
(4) Deep archive Merkle verification (`verify --deep`) only checked string inclusion
rather than cryptographic SHA-256 body integrity of archived entries in `.ai/ARCHIVE.md`;
(5) Date heading regular expressions rejected numeric timezone offsets (e.g. `+03:00`);
(6) Runtime snapshot cleanup under `--force` bypassed process liveness checks for
snapshots whose liveness could not be verified (e.g. foreign hostnames).
Furthermore, post-council implementation phases lacked a formalized, mandatory
peer-review prompt requirement, creating a risk that subsequent code changes could
be marked complete without adversarial validation.

Decision:
1. Mandatory Adversarial Peer Review Prompt: Regardless of who implements changes
   (human developer or AI assistant), upon completing any plan or council decision,
   the implementer MUST formulate an exhaustive, unified adversarial audit prompt
   covering every item of the implementation. No task may be marked `Status: Completed`
   without subjecting it to this multi-model peer review process.
2. Cooperative Lock Preservation: `autoArchiveWorklog` must never steal or clear
   a cooperative lock held by another session; if locked, auto-archiving is skipped
   with a warning on stderr. Support `--session-pid` for lock tracking.
3. Windows Atomic Rename Resilience: `atomicRename` implements 5 retries with
   exponential backoff (50ms base) to absorb transient Windows OS file-system locks.
4. Backward Compatibility for Legacy Evidence: Evidence blocks with format < 4
   lacking `entry:` hashes are classified as `legacy`, not `tampered`.
5. Fail-Closed Deep Archive Cryptographic Audit: `verify --deep` parses `.ai/ARCHIVE.md`,
   locates the archived parent entry, and independently re-hashes its body to ensure
   absolute cryptographic immutability across journal pruning.
6. Unified Heading Regular Expression: Standardize `DATE_HEADING_REGEX` across
   handoff and archive modules, accepting numeric timezone offsets (`+03:00`, `Z`, `UTC`).
7. Liveness-First Runtime Cleanup: `cleanup-runtime --force` preserves snapshots
   unless process liveness is conclusively dead (`isProcessAlive(state) === false`).

Reasoning:
The AI collaboration protocol depends on absolute cryptographic integrity and
strict multi-model consensus. A single implementer (human or AI) must never self-certify
changes without adversarial challenge. Hardening file locks, deep archive verification,
and backward compatibility ensures cross-platform reliability on Windows and Linux.

Alternatives rejected:
- Automatic lock stealing for non-live PIDs: rejected because one-shot CLI commands
  intentionally exit while holding the lock across CLI invocations.
- Optional peer review prompts: rejected because unreviewed implementations accumulate
  silent defects and architectural divergence.
- Shallow archive verification: rejected because string inclusion allows body forging
  while preserving the parent hash label.

Consequences:
`AGENTS.md` and `QUICKSTART.md` mandate the peer-review prompt rule. `validate-protocol.ps1`
enforces text encoding across `docs/reviews/` and `templates/reviews/`. Test suites
`tests/lock.test.cjs`, `tests/handoff.test.cjs`, and `tests/session.test.cjs` enforce
lock preservation, deep archive validation, and snapshot hygiene.

Approved by: RuslanFomenko

---

### PROTO-DEC-0028

Status: Accepted
Date: 2026-09-18

Context:
The v1.9.4 hardening round closed the __dirty collision, Evidence authentication
(format 2), rehash ordering and the transitional archive root, but left three
release-blocking gaps: --session-pid accepts any live PID, allowing lock
squatting (reproduced with Windows PID 4); format-1 Evidence receipts remain
unauthenticated and were silently certified; and the archive terminal rule
accepts a legacy `chain root: transitional` marker at any depth, allowing silent
history truncation. The canonical entry-hash logic is also duplicated between
protocol-handoff.cjs and protocol-archive.cjs.

Decision:
1. Lock liveness binds to a registered session: a nonce is generated at session
   start and stored in .ai/runtime/<owner>.json; --session-pid is accepted only
   for the current PID, the parent PID, or a registered PID presented with the
   matching --session-token. System PIDs (<= 4) are rejected.
2. Legacy Evidence is labelled, never rewritten: verify fails without
   --allow-legacy, doctor counts unauthenticated receipts, and migration means
   recording new evidence.
3. Archive chain verification requires exactly one terminal root and rejects
   orphaned segments; a non-authenticated transitional root is accepted only as
   the unique parentless record.
4. The canonical entry-body hash lives once in protocol-hooks.cjs and is used by
   both handoff and archive.
5. Audit and council participants persist prompt and report under docs/reviews/
   before emitting the chat summary.
6. The release version is bumped to 1.9.4, committed atomically, annotated with
   tag v1.9.4, and the consumers D:\Block-Puzzle and D:\VPN are force-synchronized
   and verified; their own commits remain in their own sessions.

Reasoning:
Each item replaces an unverifiable claim with either a registered secret, an
explicit legacy label, or a graph invariant that can be tested. Fail-closed
behaviour is preserved; no historical text is rewritten.

Alternatives rejected:
Numeric-range-only PID validation (DoS by PID 4); mass re-hashing of historical
journals (breaks the parent chain and immutability); a hardcoded genesis hash
(project constant in protocol source); a blocking Stop hook for missing reports
(contradicts DEC-0003).

Consequences:
Supervisors pass a session token; old receipts report unauthenticated until
re-recorded; archive verification gains orphan/root tests; both consumers receive
the new managed files and commit them in their own sessions.

Approved by: RuslanFomenko

---

### PROTO-DEC-0029

Status: Accepted
Date: 2026-09-19

Context:
In release v1.9.4, session liveness evaluation in protocol-session.cjs (`isProcessAlive`) checked only `record.pid` and `record.hostname`. Registered supervisor processes passed via `--supervisor-pid` (`record.supervisorPid`) were ignored during hygiene passes. As a result, `prune` quarantined empty journals and `cleanup-runtime --force` deleted session snapshots even when a live supervisor process was actively running (defect C0, violating PROTO-DEC-0025 item 3). Furthermore, `--supervisor-pid` artificially restricted registration to `process.pid` or `process.ppid`, preventing shell-spawned and external orchestrators from managing session lifecycles. In addition, `prune`'s binary polarity (`=== true`) incorrectly treated unknown liveness (such as foreign hostnames) as prunable, and lacked a recency window to protect legitimate hookless sessions between `start` and initial journal authoring.

Decision:
1. Unified Three-Way Liveness Contract: Replace `isProcessAlive` across `protocol-session.cjs` and `protocol-lock.cjs` with centralized `isSessionAlive(record)` and `checkProcessAlive(pid)`. Evaluation proceeds supervisor-first:
   - Foreign host mismatch (`hostname !== os.hostname()`): returns `null`.
   - `supervisorPid` integer > 0 and alive: returns `true`.
   - `supervisorPid` integer > 0 and dead: falls through to `pid`/`sessionPid`.
   - `pid`/`sessionPid` integer > 0 and alive: returns `true`.
   - `pid`/`sessionPid` integer > 0 and dead: returns `false`.
   - No usable PID fields (legacy null state): returns `null`.
2. Explicit Call-Site Polarity:
   - `prune` (:182): `true` skips (even with `--force`); `false` quarantines aged empty journals; `null` preserves during standard runs and quarantines only under `--force` with an explicit audit warning.
   - `cleanup-runtime` live check (:247): `true` skips (even with `--force`).
   - `cleanup-runtime` orphan / foreign check: non-orphan snapshots with `null` liveness are preserved (even with `--force`).
   - `cleanup-runtime` dead check (:261): `false` follows existing 24h / `--force` removal rules.
   - `cleanup-runtime` stale check (:272): `false` follows existing 7d removal rules.
3. Recency Heuristic Fallback: When liveness is `false` or `null`, empty journals and snapshots are treated as active while within a 15-minute `RECENT_WINDOW` (`mtime >= now - 15min`), protecting hookless sessions during initial task ingestion. `--force` overrides the recency fallback, but never overrides confirmed live sessions (`true`). Content-bearing journals remain protected unconditionally by `holdsContent`.
4. Relaxed Supervisor Registration: Accept any live integer PID > 4 for `--supervisor-pid` at session start. Registration functions as an anti-accident mechanism preventing accidental quarantine by external supervisors, rather than a privilege boundary. Lock commands require `--session-token` to bind to registered non-parent PIDs.

Reasoning:
Supervisor-first liveness restores the guarantee that active multi-process AI sessions are never pruned. Three-way polarity prevents accidental destruction of foreign-host artifacts. The 15-minute recency window bridges the operational gap between session initialization and first handoff entry without preventing cleanup of genuinely abandoned sessions. Centralizing process liveness logic in `protocol-session.cjs` eliminates duplication across protocol tools.

Alternatives rejected:
- Supervisor-only without recency: rejected because hookless interactive CLI sessions would remain vulnerable to immediate pruning prior to first entry write.
- Recency-only without supervisor check: rejected because long-running tasks exceeding the window would be quarantined while actively supervised.
- Restricting `--supervisor-pid` to `own`/`ppid`: rejected because shell-spawned CLI wrappers run with transient shell parent PIDs that detach immediately.

Consequences:
`protocol-session.cjs` and `protocol-lock.cjs` share liveness helpers. Test suite `tests/session.test.cjs` validates the 11-branch matrix. Protocol documentation in `.ai/docs/PROTOCOL.md` reflects the supervisor-first model, three-way polarity, and recency window.

Approved by: RuslanFomenko (direct owner confirmation in chat, 2026-09-19; transcribed by deepseek-flash)

---

### PROTO-DEC-0030

Status: Accepted
Date: 2026-09-19

Context:
AGENTS.md section 2 said only that `Approved by:` carries a human name and that an agent may not fill the line in for itself; the `.ai/DECISIONS.md` template repeats the rule. That left the transcription of a direct owner approval ambiguous: an agent could not tell whether recording an approval the owner had just given in conversation was self-authorization or legitimate recording, and an unrecorded approval violated the rule that chat history is not project memory.

Decision:
An owner approval given in a direct conversation may be transcribed into a decision block by the session that holds the lock, with a provenance note: `Approved by: <name> (direct owner confirmation, YYYY-MM-DD, transcribed by <agent>)`. An agent must never write the `Approved by:` line without a direct owner confirmation, and a proposal stays a proposal until then. AGENTS.md section 2 carries the same rule.

Reasoning:
AGENTS.md section 0 says chat history is not project memory and only the repository counts. Without a stated transcription rule, a genuine owner approval could not be recorded at all, or would be recorded without provenance. The provenance note separates recording from self-authorization and keeps the decision log auditable.

Alternatives rejected:
- Leaving the rule implicit: rejected because it forces every agent to guess, and guessing about authority is what the protocol forbids.
- Requiring the owner to edit DECISIONS.md personally: rejected because the file is covered by the shared-doc lock and approvals are commonly given in conversation; the record must still be written by a session.
- Accepting approvals without provenance: rejected because an audit could no longer distinguish a recorded confirmation from an agent's assumption.

Consequences:
Transcribed approvals name the date and the transcribing agent. The decision log remains append-only; the provenance note does not weaken the rule that only the owner can approve. PROTO-DEC-0029 is the first block recorded under this rule.

Approved by: RuslanFomenko (direct owner confirmation in chat, 2026-09-19; transcribed by deepseek-flash)

---

### PROTO-DEC-0031

Status: Accepted
Date: 2026-09-19

Context:
In adversarial reviews, models without tool access, read-only external interfaces, or web chat panels can emit review verdicts without the ability to execute code, run tests, or sign handoff receipts. Previously, no formal distinction existed between an advisory review and a certifying review, allowing unverified claims or claims without reproduction to be cited as release-blocking completion gates.

Decision:
1. Four Required Capabilities: A certifying review requires four orchestrator-verified capabilities:
   - FS_WRITE: direct local filesystem write capability for project and review artifacts.
   - SHELL_EXEC: ability to invoke local terminal commands and reproduction test scripts.
   - EVIDENCE_SIGN: ability to generate, compute, and certify tamper-evident Evidence receipts via protocol tooling.
   - REPO_READ: ability to inspect repository code and working tree state directly.
   Capability is determined by the orchestrator profile and environment, never self-declared by the model.
2. Review Mode and Header Fields:
   - `Mode: CERTIFYING`: declared only when all four capabilities are present. Requires `Receipt-Owner: <owner-id>` (with legacy `Session:` accepted as a fallback) and an associated verifiable handoff receipt citing the review path.
   - `Mode: ADVISORY`: assigned when any required capability is missing. Advisory reviews carry `[MODE: READ-ONLY ADVISORY]`, are persisted exclusively through the AGENTS.md section 5.5 chat transcription fallback, and are explicitly designated non-certifying. An advisory review cannot satisfy the independent-review completion gate.
3. Defect Reproduction Mandate: A `FAIL` or `BLOCKED` verdict requires at least one concrete reproduction command, test, or proof per claim. Unreproduced claims remain advisory findings and cannot block completion or reopen approved decisions.

Reasoning:
Separating certifying verdicts from advisory commentary protects the protocol from unsubstantiated blocks by models operating without execution or verification capabilities, while preserving the valuable insights of advisory models via the transcription route. Requiring reproducible proof for FAIL/BLOCKED verdicts enforces objective technical truth over conversational assertion.

Alternatives rejected:
- Allowing self-declared certification: rejected because models routinely overestimate or hallucinate their tool access.
- Banning advisory models from reviews entirely: rejected because non-executing models provide valuable analytical, linguistic, and structural critiques.
- Allowing FAIL verdicts without reproduction: rejected because speculative or hallucinated failure claims could indefinitely paralyze progress on approved work.

Consequences:
`templates/reviews/REVIEW.md` includes `Mode`, `Receipt-Owner`, and `Receipt` header fields. AGENTS.md and `.ai/docs/PROTOCOL.md` define the four capabilities, the transcription route for advisory reviews, and the reproduction rule. Automated enforcement of the certifying receipt binding is checked by `gate-check` (A3).

Approved by: RuslanFomenko (direct owner confirmation in chat, 2026-09-19; transcribed by deepseek-flash)

---

### PROTO-DEC-0032

Status: Accepted
Date: 2026-09-19

Context:
In protocol v1.9.4, completion gate validation verified the physical existence and header syntax of the independent review artifact but did not bind the cited review to a verified session journal or verify tree freshness. A completed task could cite an obsolete or detached review without detection.

Decision:
1. Introduce the `node .ai/bin/protocol-handoff.cjs gate-check` subcommand, invoked by `validate-protocol.ps1` in `role: source` whenever `.ai/TASK.md` is marked `Status: Completed`.
2. The independent review cited under `## Completion gate` must declare `Mode: CERTIFYING` and specify `Receipt-Owner: <owner-id>` (or legacy `Session:`).
3. The specified owner's session journal (`.ai/worklog/<owner-id>.md`) must contain at least one dated entry explicitly referencing the cited review path (normalized forward slashes) whose Evidence block passes deep receipt verification against the current working tree.
4. A cited independent review must carry a valid ISO `Date`. Reviews with a Date after `2026-09-19` strictly require `Mode: CERTIFYING` and `Receipt-Owner`; a missing or invalid Date fails the gate. Legacy reviews (a present Date on or before `2026-09-19`) emit non-blocking `[WARN]` notices for missing fields.
5. Reviews carrying `Mode: ADVISORY` or transcription fallback notices cannot satisfy the independent review gate.
6. The `Receipt:` field in review headers is optional and informational only.
7. In `role: installed`, `gate-check` is skipped by the validator because consumer checkouts do not retain session journals.
8. Evidence recording runs its internal validator with `PROTOCOL_SKIP_GATE=1` so the cited owner's receipt can be produced on a completed task; the standalone validator and CI enforce the gate against the frozen tree without that flag.

Reasoning:
A completion gate is only as strong as the binding between the cited review and a verifiable handoff receipt. Binding the review path to the owner's certified entry closes the stale-citation gap found in v1.9.4, while the legacy cutoff avoids invalidating pre-existing reviews. The recording exemption exists because the gate otherwise deadlocks the very receipt it requires, and CI remains the enforcement point.

Alternatives rejected:
- Trusting header existence and verdict only: rejected because the v1.9.4 gate accepted a stale Copilot receipt.
- Treating a missing Date as legacy: rejected because it allowed a new review to bypass the certifying requirements wholesale (reproduced defect A3-2).
- Running the gate during evidence recording: rejected because it makes the cited owner's receipt unreachable (reproduced deadlock A3-1).

Consequences:
`gate-check` runs in the source role and in CI; consumer repositories skip it. Reviews carry Mode, Receipt-Owner and an optional Receipt; the first block recorded under this rule is enforcement of the completed task's gate. Local runs can set `PROTOCOL_SKIP_GATE=1` manually, which is visible in the validator output; CI never sets it.

Approved by: RuslanFomenko (direct owner confirmation in chat, 2026-09-19; transcribed by deepseek-flash)

---

### PROTO-DEC-0033

Status: Accepted
Date: 2026-09-19
Reopen-trigger: none

Context:
Architectural decisions in `.ai/DECISIONS.md` are permanent and immutable, but tracking whether a decision remains active, is frozen against further changes, or is reopened due to new evidence or broken invariants lacked a machine-checkable registry. Superseded decisions were visible only through the successor's `Supersedes:` line, and nothing checked that a newly appended decision block declared how it could legitimately be reopened.

Decision:
1. Maintain `docs/decisions/REGISTRY.md` as an append-only markdown table recording decision lifecycle status. The current status of any decision id is its last row; existing rows are never edited, reordered or deleted; status transitions are appended as new rows.
2. Status values: `accepted`, `frozen`, `reopened`, `superseded`.
3. Reopen triggers form a closed taxonomy: `invariant-broken`, `metric-drop`, `new-external-data`, `security-finding`, `owner-directive`, `higher-source-contradiction`, and `none`. Reopening an accepted decision strictly requires an appended row carrying an authorized trigger; without a trigger row no decision may be reopened, and any doubt remains a note in `.ai/TASK.md` or a session journal.
4. `docs/decisions/REGISTRY.md` is covered by the shared-document cooperative lock (AGENTS.md section 6).
5. `validate-protocol.ps1` enforces WARN-first checks in `role: source`: registry presence; full id coverage against `.ai/DECISIONS.md`; immutability of committed rows against `git show HEAD:docs/decisions/REGISTRY.md`; and a valid `Reopen-trigger:` field on newly introduced decision blocks. Enforcement may be upgraded from WARN to FAIL by a later decision.
6. Legacy decision ids are seeded as `accepted`; the superseded ids `DEC-0003`, `DEC-0005`, `DEC-0008` (superseded by `PROTO-DEC-0009`) and `DEC-0014` (superseded by `PROTO-DEC-0022`) are recorded with the `superseded` status.

Reasoning:
A decision log without lifecycle status invites silent re-litigation: nothing distinguishes an active decision from a frozen or superseded one, and reopening can be asserted without evidence. A registry makes lifecycle machine-checkable while DECISIONS.md remains the immutable text. WARN-first enforcement lets installed repositories migrate without breaking, and the closed trigger taxonomy forces a reopening claim to name the kind of evidence that justifies it.

Alternatives rejected:
- A JSON-only registry: rejected because reviewers read Markdown directly and a hand-maintained twin drifts; a generated twin can be added later in CI if wanted.
- FAIL-level enforcement from day one: rejected because installed projects need a migration window (owner decision D3: WARN-first).
- Validating status vocabulary in the validator now: rejected because coverage, immutability and trigger checks already catch the dangerous cases; the vocabulary is documented and review-checked.

Consequences:
The registry becomes the lifecycle source of truth for decision status while DECISIONS.md stays the immutable text log. Superseded ids are explicit; new decision blocks must declare `Reopen-trigger:` or produce a warning. The registry is under the shared-document lock, so transitions are single-writer and auditable.

Approved by: RuslanFomenko (direct owner confirmation in chat, 2026-09-19; transcribed by deepseek-flash)

---

### PROTO-DEC-0034

Status: Accepted
Date: 2026-09-19
Reopen-trigger: none

Context:
Whole-kernel reading across multiple AI assistants creates token overhead. The analysis in `docs/reviews/2026-09-19-deepseek-flash-mcp-selection-analysis.md` confirmed that external MCP servers incur significant schema taxes (roughly 600-8,650 tokens per turn) and that half of the participating assistants have no MCP client. A deterministic, MCP-free filesystem digest provides a universal baseline, while strict policies are required for external tooling.

Decision:
1. Universal context digest (M0): pinned to `repomix@1.18.0`, generated strictly on demand into `.ai/runtime/kernel-digest.xml` (disposable, excluded from Git and from tree digests). Advisory only: never auto-injected into SessionStart, never cited in Evidence, never a gate input. Lossy `--compress` is permitted strictly for orientation, never for audits or implementation.
2. MCP and external tooling policy (C2): external tool or MCP output is never Evidence and never influences completion gates. At most one MCP server per adoption phase, local-only, workspace-sandboxed (`--sandbox`), version-pinned, with a total tool-schema budget of 1500 tokens or less. Hooks must never auto-install or spawn MCP servers. When a server is unavailable the workflow degrades to normal file operations without gate or weight differences.

Reasoning:
The digest layer must work for every assistant, including web panels that cannot consume MCP; a deterministic file under `.ai/runtime/` costs nothing until requested and never becomes a gate dependency. The policy keeps external state strictly advisory so that no server, index or cache can become a second source of truth or a hidden prerequisite for validation.

Alternatives rejected:
- MCP-only context economy: rejected because half of the participating assistants have no MCP client and per-client configuration drifts.
- Automatic digest injection at SessionStart: rejected because it taxes every session with the measured compressed size (about 18.2k tokens) including narrow edits that need one file.
- A persistent memory outside the repository: rejected because the filesystem remains the only project memory.

Consequences:
The digest is an on-demand helper; no dependency, no package.json entry and no network call is added. Policy-pin tests protect the wording. Adoption of any MCP server remains an owner-approved, phased decision with a schema budget, and the completion gate never depends on external state.

Approved by: RuslanFomenko (direct owner confirmation in chat, 2026-09-19; transcribed by deepseek-flash)

---

### PROTO-DEC-0035

Status: Accepted
Date: 2026-09-19
Reopen-trigger: none

Context:
In accordance with owner decisions M1-M5 and plan revision 2 section 6 (C1), evaluating the empirical utility of a universal repository digest layer requires telemetry that is independent of handoff evidence, alongside pre-registered thresholds that prevent confirmation bias or schema-tax creep.

Decision:
1. Stop telemetry instrumentation: extend the Stop hook return object with additive fields - `changedFiles` (integer), `durationSec` (integer wall time), `firstEditMs` (earliest filesystem mtime among changed files minus `startTime`, or `null` when clean; mtime is an upper bound of the true first edit), and `handoffComplete` (boolean). `protocol-session.cjs stop` prints these fields without destabilizing the existing message prefix. Fail-safe machine-readable metrics: one JSONL record per Stop event to `.ai/runtime/metrics/sessions.jsonl` (`{ts, session, agent, changedFiles, durationSec, firstEditMs, handoffComplete, gitHead}`) with rotation at 1 MB to `sessions.1.jsonl`; metrics are never written into journals or committed files.
2. Pilot design and pre-registered adoption thresholds: the experimental protocol in `docs/reviews/2026-09-19-h1-pilot-design.md` across three isolated arms (Arm A control, Arm B Repomix CLI on demand, Arm C Repomix MCP sandboxed) over ten crossed tasks (five broad audits, five narrow edits).
   - Adoption gate (Arm B): adopt the universal CLI digest layer (M1) only if median total session tokens drop by at least 25% on broad tasks, narrow-task token growth stays within 5%, and the handoff-completeness rate does not decrease relative to the Arm A baseline.
   - MCP gate (Arm C): adopt the sandboxed Repomix MCP (M2) only if Arm B passes and tool-schema overhead stays within 1500 tokens without quality regression.
   - Stop rule: if Arm B breaches any threshold, document the negative result and terminate without MCP adoption.
   - Projections: the 35%/50%/65% savings forecast remains an unverified hypothesis and is not established fact until the pilot verifies it.

Reasoning:
Telemetry that does not depend on handoff Evidence enables objective measurement without disturbing the certified audit chain, and runtime-only metrics keep the completion gate independent of external state as required by PROTO-DEC-0034. Pre-registering the thresholds prevents post-hoc goalpost shifting: the pilot can only confirm or refute the hypothesis, not redefine it.

Alternatives rejected:
- Measuring resource usage from handoff Evidence: rejected because Evidence certifies content, not consumption, and lives inside the journal format.
- Deciding adoption without pre-registered thresholds: rejected because the unverified projections would harden into conclusions.
- Writing metrics into journals or committed files: rejected because it would pollute the audit chain and the tree digest.

Consequences:
Telemetry is backward-compatible and available to all participating models; the pilot produces an objective basis for M1-M3; no external dependency, network call or gate change is introduced.

Approved by: RuslanFomenko (direct owner confirmation in chat, 2026-09-19; transcribed by deepseek-flash)

---

### PROTO-DEC-0036

Status: Accepted
Date: 2026-09-19
Reopen-trigger: owner-directive

Context:
H1 (Arm B) failed the pre-registered thresholds under every cohort interpretation: broad total +72.79%, broad fresh +9.10%, narrow total +60.20%, narrow fresh +42.76% (`docs/reviews/2026-09-19-h1-pilot-report-correction.md`). The raw digest is ~88k tokens while control sessions used 45-73k fresh tokens, so the index is larger than the work it was meant to save. The `PROTO-DEC-0035` stop rule was executed as written; the post-mortem's B2/B3/B4/C2 follow-on is sunk-cost escalation, not a violated rule.

Decision:
1. Track C / Repomix is closed permanently for this repository. No B2, B3, B4 or C2 runs; no MCP adoption; no further index experiments.
2. `PROTO-DEC-0034` (M0 context digest and C2 external tooling policy) remains recorded policy and in full force: the on-demand digest is advisory, never Evidence, never a gate input, and no workflow may depend on it.
3. Local 8B/9B models stay on disk but are never subjects of a pilot or benchmark; further pulls are aborted. `ollama rm` is the owner's call.
4. If the owner reopens this track by directive, the pre-registered rules apply unchanged: fresh tokens (`in + out`) primary and total secondary; the pre-registered thresholds of 25% median broad total-token reduction and <= +5% narrow bound stand for any future candidate; "tokens per accepted finding" rejected; free/local subjects for tests, paid for analysis/coding, Gemini exception via `agy`; borrowed HF credits are not free; remote route `agy`/Gemini only.
5. Reversal evidence is the closure falsifier only: a pre-registered controlled run on this repository showing >= 25% median broad total-token reduction and <= +5% narrow regression against a matched control, on a second model family, with scope-selection cost counted in the total - or a genuine repository-shape change making search impractical.

Reasoning:
The arithmetic is decisive without another run; `rg`/targeted reads are O(relevant) with zero generation latency. The escalation is named as sunk cost so future sessions do not replay it, and the measurement rules are kept conditional rather than erased.

Alternatives rejected:
B2-first reinterpretation (reintroduces the cost being optimized and re-litigates a pre-registered stop); lowering thresholds to 20%/+3% (goalpost-shifting); full erasure of the measurement policy (a future legitimate run would rebuild it from scratch).

Consequences:
No further index/MCP spend; context effort moves to corpus retention. `PROTO-DEC-0035` stands as executed history.

Approved by: RuslanFomenko (direct owner confirmation in chat, 2026-09-19, transcribed by gemini-b67e88f213c39b83)

---

### PROTO-DEC-0037

Status: Accepted
Date: 2026-09-19
Reopen-trigger: owner-directive

Context:
`PROTO-DEC-0026` created `docs/reviews/` as permanent, unbounded, Git-tracked history with no budget; it reached 138 files / ~1.47 MB against a 2,826-line kernel, and it is the dominant context cost. `PROTO-DEC-0032` binds `gate-check` to review paths cited in certified receipts, so a blind move can break an active binding.

Decision:
1. Two-tier corpus: the active window is `docs/reviews/` minus `docs/reviews/archive/`; it holds the current release's certifying documents plus every path cited by a live (verifying) receipt, an open task or an open decision. Everything else moves to `docs/reviews/archive/`.
2. Classify-first only. Run `node .ai/bin/protocol.cjs doctor` and `node .ai/bin/protocol-handoff.cjs gate-check` before and after; keep an append-only `docs/reviews/archive/INDEX.md` mapping old -> new path per file; if any verification fails, restore the moved file to its cited path.
3. Hard cap in `AGENTS.md` section 8: active `docs/reviews/` <= 60 files and 600 KB (recommended, owner-tunable), overflow archived at release close; validator WARN at the cap and FAIL one release after adoption (registry migration style).
4. The synthesis section 5 keep-list is adopted as a hard constraint on any cleanup or refactor: append-only `DECISIONS.md`/`REGISTRY.md`/`ARCHIVE.md`; no receipt invalidation; the four earned fixes; lock discipline; secret scanning; no protocol commits in consumer repositories.
5. Never-touch list: `.ai/DECISIONS.md`, `docs/decisions/REGISTRY.md`, and `.ai/ARCHIVE.md` are never touched by the archive pass; archiving moves text, never deletes it.

Reasoning:
The corpus is the problem, not the kernel; a cap plus receipt-aware archiving recovers context without destroying history or breaking gates. The keep surface is derivable from live citations and active certification headers.

Alternatives rejected:
Mass-move everything non-active (Gemini) can break receipt bindings; keep only the last 5-10 files (GLM) has no receipt awareness; delete spent data violates the archive-never-delete rule.

Consequences:
Active corpus falls toward ~50-60 files; archived files stay tracked under `archive/` with one index lookup; future overflow is mechanical.

Approved by: RuslanFomenko (direct owner confirmation in chat, 2026-09-19, transcribed by gemini-b67e88f213c39b83)

---

### PROTO-DEC-0038

Status: Accepted
Date: 2026-09-19
Supersedes: PROTO-DEC-0027 (item 1 only)
Reopen-trigger: owner-directive

Context:
The mandatory adversarial prompt caught F-001..F-004 in the last round and ten reproduced findings in DEC-0021, so it pays for itself on the protocol core. A 10-page prompt+report pair for every docs or one-line change is the artifact-inflation driver. The prompt's s.2 ID reference to `PROTO-DEC-0021` is corrected here to `DEC-0021`.

Decision:
1. Full adversarial prompt+report pairs remain mandatory for protocol core: anything under `.ai/`, `.claude/`, hooks, validator and gates, plus consumer security/data paths. This explicitly supersedes PROTO-DEC-0027 item 1 only; items 2 through 7 of PROTO-DEC-0027 remain in full force.
2. Docs, config and one-line fixes require one independent reviewer statement (a review file or a journal-visible verdict); no prompt+report pair.
3. Prompt and report artifacts are size-capped unless an incident warrants more: prompt <= 150 lines, report <= 250 lines (owner-tunable).
4. `AGENTS.md` section 2 mandatory-prompt language and `QUICKSTART.md` section 2 are updated to this scale.
5. No new monitoring or enforcement layers (D9); C1a (`d38d2f2`) is a bug fix, not a precedent for instrumentation.

Reasoning:
Scale by blast radius keeps the defect class the protocol exists to catch while removing the volume driver. One reviewer statement is a deliberately lower bar for low-blast-radius changes.

Alternatives rejected:
Full suspension except major releases (GLM) drops the mechanism that caught real defects; status quo keeps unbounded review artifacts.

Consequences:
Review artifact volume drops sharply; core review rigor is unchanged; the lighter path is explicitly recorded so it cannot be confused with no review.

Approved by: RuslanFomenko (direct owner confirmation in chat, 2026-09-19, transcribed by gemini-b67e88f213c39b83)

---

### PROTO-DEC-0039

Status: Accepted
Date: 2026-09-19
Reopen-trigger: owner-directive

Context:
The mission in `.ai/PLAN.md:51-54` was never executed and all five `## Review` boxes are unchecked; consumer repositories have had no product work while the protocol audited itself. The audit round is substantively closed except for the Qoder downgrade, the Codex receipt and the record pass. Per owner ruling Q4, the pilot will execute across both consumer repositories (`D:\Block-Puzzle` and `D:\VPN`).

Decision:
1. Feature freeze: protocol work is limited to P0 defects (data loss, security, false green, broken install) and audit closure until the product-pilot report exists.
2. Product pilot per `.ai/PLAN.md` across both `D:\Block-Puzzle` and `D:\VPN`:
   a. Triage each consumer repository first: read the parked diff (43 dirty files in Block-Puzzle, 34 in VPN), finish-or-revert, run the product's own tests, make one commit; no new task over a dirty tree.
   b. Two disjoint sessions, one per repository; no shared agent or task (`DEC-0020` duplicate-assignment failure is the named risk).
   c. One owner-named objective and pre-agreed metrics from `PLAN.md:63-68` per repository before its first task; the 10-20 task pilot budget is split across both repositories.
   d. Control arm: "one task file + one handoff note" (`PLAN.md:67-68`) applied in both repositories.
   e. Protocol sessions never commit inside consumer repositories (PROTO-DEC-0025 item 4); consumers are upgraded from v1.9.4 inside their own sessions.
   f. No protocol changes during the pilot except P0.
   g. Kill criterion: if the protocol arm does not beat the "one task file + one handoff note" control on the pre-agreed metrics, report it and move the v2.0 decision to reduction/retirement.
3. v2.0 scope, scheduled after the pilot report: a single Node validator per `PROTO-DEC-0025` item 5 with differential verification against the PowerShell reference; extract process liveness into a leaf module to break the require cycle (`protocol-lock.cjs:10` -> `protocol-session.cjs:26` -> `protocol-hooks.cjs:553` -> `protocol-archive.cjs:11-12` -> lock); split `protocol-handoff.cjs` (1,047 lines) into snapshot/evidence/gate; no new gates; existing hashes and receipt formats are frozen, not deleted.
4. Audit closure: Qoder -> advisory (header `Receipt-Owner: qoder-86c43a9a02fd9789` does not match journal `qoder-4d1795a4ffecb995`; the review file remains immutable); Codex receipt re-recorded at the freeze; C1a accepted; `.ai/TASK.md` reconciled; journals restored to <= 30 files.
5. Record pass: one lock holder, order Gemini -> DeepSeek -> Codex (if available); receipts recorded only after the tree is final; CI green on the frozen tree. Agent Manager and CLI/`agy` are both recorded execution vectors, chosen per task.

Reasoning:
The pilot is the highest-value action available and the only test of the protocol's consumer value. v2.0 before that data would repeat the current mistake at lower cost. Running both repositories honors the owner's directive while the structural mitigations prevent duplicate-assignment failures and dirty-tree contamination.

Alternatives rejected:
Continuing protocol work first (S1 scenario rejected); running v2.0 immediately (non-urgent, unverifiable against product value); treating C1a as a precedent for more instrumentation (D9); running unmitigated parallel pilots without triage.

Consequences:
Consumer repositories receive the next full work window; v2.0 becomes a reduction, not an expansion; this task's completion gate follows PROTO-DEC-0038.

Approved by: RuslanFomenko (direct owner confirmation in chat, 2026-09-19, transcribed by gemini-b67e88f213c39b83)

---

## Template for new decisions

### DEC-nnnn

Status: Accepted
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

---

### PROTO-DEC-0040

Status: Accepted
Date: 2026-09-20
Supersedes: PROTO-DEC-0039 (items 1 and 2f only, solely for the bounded paired-cycle exception below)
Reopen-trigger: owner-directive

Context:
The owner confirmed the initial docs-only paired-cycle exception and then accepted the independent audit `docs/reviews/2026-09-20-codex-paired-cycle-review.md` (FAIL for accepting the runbook). The owner explicitly requested: "Принял. Зафиксируй доработки во все необходимые докуенты репозитория и подготовь промт для тандема дипсик-гемини для полного устранения всех недостатков. При необходимости со сстыками на отчеты." This records authorization to document and dispatch remediation, not a claim that the defects have been fixed.

Decision:
1. Authorize the existing `.ai/docs/PAIRED-CYCLE.md` managed deliverable and the coordinated 1.9.6 working-tree version, plus narrowly bounded remediation of the accepted audit findings. The exception now explicitly includes the required validator/handoff tests and fixes; it is no longer described as docs-only. This is not permission to commit, tag, push or install into consumer repositories.
2. Scope: host-edit digest classification; complete core review/closure ordering; executable prompt templates, deep verification and session ownership; durable review/evidence sequencing; manifest/template regression coverage; a separately reviewed correction of the existing PROTO-DEC-0038 risk-scaling mismatch; reconciliation of source/installed review-path documentation and already-approved corpus/journal budget handling. Preserve full review for core/security/data changes and existing evidence integrity guarantees. Missing or ambiguous risk classification must not weaken the core path.
3. Codex records governance, task, plan and dispatch now. Gemini implements within the dispatch. DeepSeek controls scope and independently reproduces/verifies each finding; if DeepSeek authors a fix, an independent reviewer must certify that fix. Further reviewers are used only for unresolved disagreement or an explicit high-risk review need. Historical reviews remain immutable.
4. This task uses the full core prompt+report process. An implementer-authored unified adversarial prompt must be saved before final independent review. Mandatory unresolved fixes require FAIL; RECOMMENDATION is reserved for optional improvements. Record final-tree receipts after all relevant artifacts/state changes; verify with --deep and run the applicable gate. An In progress gate-check result is not a completed-task certification.
5. Existing PROTO-DEC-0037 retention rules remain binding: classify before archiving, preserve active/cited evidence and live or unknown-liveness sessions, and never delete history. Review-corpus archiving must not rewrite the decision/registry/archive ledgers. Journal archival uses the existing append-only archive mechanism under the lock. Any implementation of the already-approved budget warning stays in the existing validator; no new monitoring service, gate or receipt format is authorized.
6. PROTO-DEC-0039 remains in force outside this finite exception; PROTO-DEC-0036 is not reopened. Frozen product objectives and five metric categories remain unchanged. Return to the product pilots after independent remediation acceptance; v2.0, MCP/index experiments and unrelated refactors remain deferred. A release commit and annotated tag require a separate owner instruction under PROTO-DEC-0025; absence of a tag for this dirty candidate is not itself a defect.

Reasoning:
The audit reproduced integration and process defects that a green existing suite missed. A finite correction with negative regression tests is warranted; a new protocol architecture or another open-ended council is not. The owner acceptance supplies the dated exception provenance that was missing from TASK alone.

Alternatives rejected:
Calling validator edits docs-only; marking the runbook accepted with mandatory fixes open; dropping the version solely because an unreleased tag is absent; weakening core certification to make low-risk tasks pass; reopening all feature work; changing product metrics or executing product upgrades from this session.

Consequences:
Implementation is pending. `.ai/PLAN.md` maps the findings to acceptance tests and `docs/reviews/2026-09-20-deepseek-gemini-paired-cycle-remediation-prompt.md` is the dispatch. Registry rows record the narrow reopening and return to Accepted with this exception. No prior decision block is rewritten.

Approved by: RuslanFomenko (direct owner acceptance and remediation-dispatch instruction, 2026-09-20; transcribed by Codex session codex-0ac708f2c86fbf4c)

### PROTO-DEC-0041

Status: Accepted
Date: 2026-09-20
Reopen-trigger: owner-directive

Context:
Four independent analyses of the repository's own history were produced on 2026-09-20: a statistical audit (Claude), an adversarial review of it (Gemini), research plus a P0-P11 plan (GPT/Codex), and a consolidating strategy (DeepSeek). Cross-checking found that four quantitative claims of the first audit were wrong and they were corrected by independent recomputation: the reviewer-count curve was averaged over mismatched cohort sets (on matched cohorts with n>=4 the miss rates are 50.00 / 27.14 / 15.71 / 7.14 percent for k=1..4, so the k=3 to k=4 gap is 8.57 points, not 0.8, and no knee exists); the "48 percent detection" figure was the share of blocking verdicts, not detection; the "one to two items per block" rule was falsified by Wave B, whose two items were both overturned; and the A2 case was a self-correction by the same reviewer rather than an external catch. A further measurement, not made by any of the four analyses, compared the finding lists rather than the verdicts in the paired-cycle cohort: all three reviewers independently reported 7 of 7 identical defects and diverged only on severity, with the entire verdict turning on one item rated HIGH by one reviewer and MEDIUM by two. Two primary sources were verified directly: Kaesberg et al., Findings of ACL 2025, states that increasing the number of agents improves performance while more discussion rounds before voting reduce it; Porter's 88-inspection study finds one reviewer less effective than two but two no less effective than four. The owner approved a hybrid recording form in direct conversation: only the rules already derivable from binding decisions and demonstrated by this history are recorded here, while the phase sequence, round counts and access-authorization scheme remain PLAN-level policy until the pilot report.

Decision:
1. Certification independence. A CERTIFYING verdict on a high-risk candidate may not be issued by the author, the executor, the controller of that candidate, or any member of the executing pair. The coordinator may shape tasks, dispatch waves and review other independent work, but may not certify what it controlled. This refines PROTO-DEC-0038 item 1 and weakens no existing gate.
2. Minimum independent review for high-risk. The final check of a high-risk candidate (protocol core, security, data, invariants, upgrade and migration paths) requires no fewer than two parallel independent reviewers. They receive the same input package, work simultaneously, do not read each other's new answers before fixing their own, and each is given a distinct angle of attack. A third reviewer is added only for an uncovered risk, contradicting reproductions, or an explicit owner directive.
3. Closed verdict vocabulary, forward only. A review artifact cited by a completion gate and dated after 2026-09-20 carries exactly one verdict token: PASS, RECOMMENDATION, FAIL or BLOCKED. Conditional outcomes are expressed as FAIL with an explicit list of conditions; explanations belong in the body, never in the token. A mandatory open defect is FAIL; a missing required check or capability is BLOCKED; RECOMMENDATION covers only optional improvements. Artifacts dated 2026-09-20 or earlier keep their historical forms and are never rewritten. Measured scale at the time of this decision: of 115 artifacts carrying a Verdict line, 56 (48.7 percent) match the closed set and 59 (51.3 percent) deviate across 57 distinct forms.
4. Objective blocking rule and severity rubric. Any reproduced defect that violates a recorded invariant or contract, or that lies on a protected path (core, security, data, gates, hooks, validator, manifest), blocks regardless of the severity label the reviewer chose; its verdict is FAIL and it may not be lowered to RECOMMENDATION. The rubric orders work inside the findings ledger and does not decide blocking by itself: HIGH is a violated invariant, a bypassed gate, or lost data or evidence; MEDIUM is a violated contract or documented behaviour without a bypassed gate, blocking when it lies on a protected path; LOW is a documentation-to-behaviour divergence or incomplete coverage and goes to the backlog; INFO is an observation and is not a defect of the candidate.
5. Symmetry of evidence. A refutation of a finding carries the same burden of proof as the finding and is verified on the same relevant state. A synthesis that dismisses findings is checked exactly as the findings are. A later fix does not refute a historical finding, and a majority does not override a reproduction.
6. Not recorded here and remaining PLAN-level policy until the pilot report: the seven-phase sequence, the one-primary-pass rule with its four repeat triggers, the block definition, the access tiers T0-T4 and the block authorization record. These are unvalidated by any completed cycle and are deliberately left reversible.

Reasoning:
Items 1, 3, 4 and 5 are each demonstrated by an event in this repository's history, and items 1 to 3 only make explicit what PROTO-DEC-0038 and the existing completion gate already require. Item 4 is the cheapest available fix for the failure mode actually measured: reviewers detected every defect and disagreed only on whether it blocked, so an objective blocking criterion removes the divergence without adding a single reviewer or round. Item 2 follows Porter's only statistically significant step and the largest observed drop in this repository's own cohorts, and stops short of a third reviewer because the data identifies no optimum and the owner set the budget. Recording the validated rules while leaving the untested structure at PLAN level keeps the irreversible append-only ledger free of an unproven architecture.

Alternatives rejected:
Recording the full seven-phase architecture as a decision block before any cycle has run under it; keeping every rule at PLAN level, where AGENTS section 1 ranks it below DECISIONS and the anti-idle rules could be argued away by citing a higher source; mandating three reviewers or two rounds per phase, which the corrected arithmetic does not support and which Kaesberg's verified result contradicts for rounds; ranking participating models by their share of FAIL verdicts, which conflates model, assigned role, task and phase and was withdrawn after a report whose header reads "Gemini (Claude Opus 4.6 Thinking, operating in gemini role)"; rewriting historical verdicts to fit the closed vocabulary.

Consequences:
`.ai/PLAN.md` carries the PLAN-level policy named in item 6. `docs/reviews/2026-09-20-deepseek-gemini-cycle-architecture-dispatch.md` is the implementation dispatch and is bound by this block. The full analysis, corrections and verified sources are in `docs/research/2026-09-20-cycle-architecture/claude-final-decision.md`. PROTO-DEC-0038, 0039 and 0040 stay in force and are not weakened; no new kernel gate is authorized, and the scope and forbidden-path checks described in the PLAN policy are manual reviewer duties recorded in the findings ledger. By item 1 this decision's own implementation cannot be certified by the DeepSeek-Gemini pair.

Approved by: RuslanFomenko (direct owner confirmation, 2026-09-20, hybrid recording form and the two-reviewer high-risk budget chosen in conversation; transcribed by claude-b33fa6764f37f5ae)

---

### PROTO-DEC-0042

Status: Accepted
Date: 2026-09-22
Reopen-trigger: owner-directive

Context:
`.ai/TASK.md` carried the open acceptance criterion "Final-tree receipts for both owners verify --deep", and it blocked the product pilots for two days. Nobody ran the check. Measured on 2026-09-22 against the tree at anchor d38d2f2: the paired-cycle producer `gemini-927b6b871251a111` and controller `deepseek-59c81998639a4feb` both return exit 0, "evidence matches the current tree"; the two certifier receipts `claude-cf505493500f999e` and `codex-eb8786999ebfc7c2` return exit 1, stale, recorded sha256:8c81dff7... against tree sha256:2241e32e.... They are stale for a structural reason, not a defect: the controller wrote the closure line into `.ai/TASK.md` after both certifications, which is the intended closure order recorded in `deepseek-59c81998639a4feb`. Two parallel independent certifiers required by PROTO-DEC-0041 item 2, combined with a digest bound to the whole tree, make the criterion as written unsatisfiable by construction: whoever records last invalidates the others. The wording "both owners" was the only ambiguity.

Decision:
1. Receipt freshness is bound to the task a receipt attests, never to the repository's later history. A receipt is fresh if its digest matched the tree at the moment the closure artifacts of its own task were complete. A later, unrelated task that moves the tree does not retroactively invalidate a closed task's receipts.
2. A certifying reviewer's receipt binds the tree as of its certification. The producer's receipt binds the final tree of its own task and is recorded after all of that task's artifacts and state changes, as PROTO-DEC-0040 item 4 already requires.
3. Therefore "final-tree receipts for both owners" in a paired cycle means the producer and the controller. Certifier receipts staled by the controller's own closing edit are not a defect, are not a finding against the candidate, and never block completion.
4. `verify --deep` exit 1 on a receipt belonging to a closed task is evidence about the current tree, not a finding against that task. No reviewer may reopen a closed task on that basis alone; reopening still requires a trigger row under AGENTS section 6.
5. This refines the freshness semantics of PROTO-DEC-0040 item 4 and supersedes nothing. PROTO-DEC-0038, 0039, 0040 and 0041 stay in force in full, the freeze is unchanged, and no code, gate, kernel or tooling change is authorized by this block.
6. Consequently the cycle-architecture acceptance criterion is satisfied and the product pilots are unblocked.

Reasoning:
The criterion could not be met by any sequence of re-recording, so the alternative to a semantic ruling was an unbounded series of coordinated re-records. The chosen rule is the one the tooling already implements for the producer and the one the closure order already assumes for certifiers; it removes an unsatisfiable gate without weakening any check, because a certifier still has to match the tree it certified and the producer still has to match the final tree.

Alternatives rejected:
Freezing the tree while both certifiers re-record, which costs a coordinated window and breaks again on the next edit; dropping the criterion silently; treating the stale certifier receipts as a defect of the candidate and opening another remediation round; changing `protocol-handoff.cjs` freshness logic, which the freeze forbids and which is unnecessary once the semantics are stated.

Consequences:
`.ai/TASK.md` records the criterion as met with the measured exit codes. The next protocol change remains limited by PROTO-DEC-0039 item 1. Product work proceeds in its own sessions: VPN (G2 CI gates, then D4 revocation with packet-level proof), Block-Puzzle (triage to one clean commit, DEC-0024 Step 3 open items), and the newly added third repository as a clean control arm with zero protocol edits. The five frozen metric categories are recorded as a by-product of those tasks from `git diff --numstat`, reviewer verdicts and journals; no new pilot activity, telemetry, instrument or review artifact is created for them. The kernel automation package (root-cause stop bound to one findings ledger, executable scope check, author-not-reviewer check) is deferred until after those product tasks and is decided on their measured numbers.

Approved by: RuslanFomenko (direct owner confirmation, 2026-09-22, "подтверждаю трактовку"; transcribed by claude-ebd3e8a8eb29a6d7)

---

### PROTO-DEC-0043

Status: Accepted
Date: 2026-09-22
Reopen-trigger: owner-directive

Context:
Agents in this fleet are started directly from terminals, and until now nothing recorded which commands exist, what a call transfers, or who owns the session that results. The owner directed on 2026-09-22 that the rules for direct agent-to-agent invocation be fixed at the repository architecture level and follow from project to project, and named the roster. The roster was then verified by running each binary on the owner's workstation rather than transcribed from the instruction: `agy` (Gemini 3.8/3.7/3.6 Flash in High/Medium/Low plus Gemini 3.1 Pro, `-p`), `codex` (GPT-6 Astra, `codex exec`), `claude` (Opus 5, `-p`), `copilot` (`-p`, `--model auto`), `vibe` (Mistral 2, `-p`). DeepSeek has no terminal client, and the two obvious substitutions were tested and failed measurably: Codex CLI 0.154.0 has dropped `wire_api = "chat"` and accepts only `responses`, while DeepSeek's API is chat-completions; routed through OpenRouter with `wire_api = "responses"` the session authenticates and then fails with `context_length_exceeded`, 181,577 input tokens against a 163,840 limit, with `--ignore-user-config` already removing the local MCP stack. This is a context-budget mismatch in the harness, not a configuration error.

Decision:
1. `.ai/docs/CLI-AGENTS.md` is the contract for calling another agent from a terminal and is added to `managed` in `protocol-manifest.json`, so the installer delivers it to every project and an upgrade refreshes it. `AGENTS.md` carries a pointer to it.
2. A call is a dispatch and transfers no authority. A caller cannot grant an approval it does not hold, cannot authorize skipping the completion gate or a `Status: Completed`, and cannot widen the freeze, the forbidden paths or a task's scope by writing a wider scope into a prompt. A called agent refuses the forbidden part, does the rest and records the refusal.
3. The called agent starts its own session with `protocol-session.cjs start --agent <name>` in the target repository and uses that owner name for its journal, its lock and its evidence. No session writes another session's journal and no caller records a receipt for a callee. Print mode is not a reason to skip the journal.
4. Terminal output is not Evidence. A result existing only as stdout or in a chat panel is advisory and is persisted, if it matters, through the section 5.5 transcription fallback, marked non-certifying. No agent copies a callee's claimed check result into its own entry as if it had run it.
5. Invoking an agent and writing its prompt is control of that work. By PROTO-DEC-0041 item 1 the caller may not then issue a CERTIFYING verdict on the result; cheap dispatch does not manufacture independence.
6. Least privilege is the default: sandboxed or read-only runs where the task only reads, explicit workspace scoping, bounded runs where the CLI supports it, and no permission-bypass flag without owner authorization recorded in the entry. No key, token or password is ever placed in a prompt or on a command line.
7. DeepSeek participates through its IDE or chat interface under the section 5.5 fallback until a larger-context DeepSeek model or a smaller harness makes a terminal client work; a re-test records the measurement, not an impression.
8. This is a bounded owner-directed exception to the PROTO-DEC-0039 item 1 freeze, limited to this documentation and the one `managed` list entry. No kernel, hook, validator, gate or behavioural change is authorized, and no existing rule is weakened. PROTO-DEC-0038, 0039, 0040, 0041 and 0042 stay in force.

Reasoning:
The rules being written down already followed from `AGENTS.md`; what was missing was a place where an agent about to call another one would find them, and a delivery mechanism that carries them into host projects. Recording the roster from measurement rather than from the instruction also produced the DeepSeek finding, which would otherwise have been repeated as an assumption. The change is additive documentation plus one manifest list entry, so it adds no execution path and can be reverted by removing the file and the entry.

Alternatives rejected:
Leaving the convention in chat history, which `AGENTS.md` already rules out as project memory; writing it only into this repository's `AGENTS.md`, which does not reach host projects; adding a kernel gate that checks invocations, which the freeze forbids and which nothing yet justifies; recording DeepSeek as unsupported without testing, or as supported through an untested wrapper.

Consequences:
Installed projects receive the file on install or upgrade. The fleet is split - VPN and Block-Puzzle are at committed `protocolVersion` 1.9.0 while this repository and `D:\Битва за луну` are at 1.9.6 - so those two do not have these rules until they are upgraded or the file is copied in deliberately. That upgrade remains deferred until after the product tasks, because a fleet-wide change during the current measurement adds a confound. This decision's own implementation still needs an independent reviewer statement before any task citing it is marked Completed; the implementing session does not certify it.

Approved by: RuslanFomenko (direct owner directive, 2026-09-22, roster and the project-to-project propagation requirement named in conversation; transcribed by claude-ebd3e8a8eb29a6d7)

---

### PROTO-DEC-0044

Status: Accepted
Date: 2026-09-22
Reopen-trigger: owner-directive

Context:
Two failures in this fleet were measured on 2026-09-22 rather than supposed. First, omission: in `D:\Битва за луну` the primary source of the game concept, `chat-history-6ab1a8fc/`, was tracked from the initial commit and never opened, because `git status` shows only what changed and the section 3 checklist had no inventory step, while each analysis round inherited its source list from the previous prompt instead of from the repository. Seven rounds, four expert reports and a PASS certification were produced on a concept missing both ends of the owner's arc. Second, copying: three assistants mapped `D:\opus_orchestrator` under one contract, and one submission proved to be a byte-identical copy of another's - all 95 records matching by sha256, with modification times equal to the 100-nanosecond tick - which nothing in the protocol could have noticed. A third measurement is the driver behind both: the invariant governance corpus a reviewer must hold is 236,198 B, of which `.ai/DECISIONS.md` alone is 117,321 B and grows about 14,000 B a day under an append-only rule that forbids trimming. The owner directed a three-layer response, A then B then C, and approved it in conversation.

Decision:
1. Layer A, inventory at session start. `.ai/bin/protocol-hooks.cjs` reads `git ls-files`, keeps document extensions outside `.ai/`, `.claude/`, `.codex/`, `.github/` and `node_modules/`, drops anything under 50,000 B, and injects the eight largest as a bounded `Large tracked documents` block. `AGENTS.md` section 3 carries the matching duty as step 3: take the inventory, not just the diff, and check a task's named sources against it before trusting the list. A scope inherited from a previous prompt is not a verified scope.
2. Layer B, an addressable index of the decision log. `.ai/bin/protocol-index.cjs` derives `.ai/runtime/decisions-index.md`: one deterministic first-sentence norm per block, and a reverse index from path to the decisions that name it. It carries the sha256 of its source, and `--check` reports staleness without rewriting. `.ai/DECISIONS.md` remains append-only and untouched; the index points at blocks and never restates them.
3. Layer C, coverage and independence over a corpus. `.ai/bin/protocol-ledger.cjs cover` accounts for every unit of a corpus with a record or an explicit absence, and `dup` reports records shared between producers, by content hash and modification time. Both derive the corpus from the repository and not from the prompt, and both work where the corpus is not a git repository, which is the case already encountered.
4. All three outputs are derived and disposable, live under `.ai/runtime/`, and are advisory under PROTO-DEC-0034 item 1: never Evidence, never a gate input, never a verdict. A unit without a record is a question, not a defect, because it may be a declared classification; a record with no unit behind it is always a defect. Absence of any of these tools degrades to the existing workflow with identical gate semantics.
5. `.ai/bin/protocol-index.cjs` and `.ai/bin/protocol-ledger.cjs` join `managed` in `protocol-manifest.json` and propagate to every project; `tests/index.test.cjs` and `tests/ledger.test.cjs` join the test list.
6. This is a bounded owner-directed exception to the PROTO-DEC-0039 item 1 freeze, limited to the three layers above. PROTO-DEC-0034, 0036, 0038, 0039, 0040, 0041, 0042 and 0043 stay in force in full and none is weakened. No gate, verdict vocabulary, receipt format or completion requirement changes.

Reasoning:
Each layer answers a failure that happened, at the smallest surface that answers it. Layer A is the cheapest: the missed source was 35,600 tokens of normalised text, so nothing failed to fit; what failed was that nobody knew it existed. Layer B attacks the one cost that grows without bound by design, and does it without touching the append-only ledger, because the index is derived and its staleness is detectable. Layer C automates checks that were performed by hand three times in one day and that caught two defects no self-report contained. Making all three advisory keeps the completion gate independent of external state, so a missing tool changes nothing about what completion requires.

Alternatives rejected:
Buying larger context or a higher tier to hold the corpus, which would not have opened a file nobody knew about; a vector or semantic memory layer, which cannot surface an omission because the query is never asked - the existing `D:\mcp-memory-data` stack holds 7.2 GB across five populated stores with an empty SQLite memory layer and would not have caught either failure; summarising or trimming `.ai/DECISIONS.md`, which the size-limit table forbids; making any of these tools a gate input, which PROTO-DEC-0034 forbids and which would let external state decide completion; recording three decision blocks for one owner directive.

Consequences:
Measured at acceptance: the decisions index is 13,932 B against a 117,321 B source, 8.4x, covering 43 blocks and 72 bound paths; the inventory block surfaces the previously missed `chat-history-6ab1a8fc/raw-conversation.json` and `conversation.md` in `D:\Битва за луну`, `docs/design/04_DEC0024_ACCEPTANCE_CRITERIA.md` in `D:\Block-Puzzle`, and nothing in this repository, where no tracked document qualifies; `dup` reproduces the arena finding as 95 cross-set duplicates with identical modification times and zero for the independent run. `validate-protocol.ps1` exits 0 with 0 warnings and `test-protocol.ps1` passes 315/315. Installed projects receive the two new tools on install or upgrade, so VPN and Block-Puzzle, both at committed `protocolVersion` 1.9.0, do not have them until upgraded; that fleet upgrade stays deferred until after the product tasks. All three layers touch protocol-core paths, so PROTO-DEC-0038 item 1 applies: an adversarial prompt and two independent certifiers are required before any task citing this block is marked Completed, and the implementing session certifies none of it.

Approved by: RuslanFomenko (direct owner directive, 2026-09-22, "одобряю все! A -> B(L0) -> C"; transcribed by claude-ebd3e8a8eb29a6d7)

---

### PROTO-DEC-0045

Status: Accepted
Date: 2026-09-23
Reopen-trigger: owner-directive

Context:
Two independent evaluations converged that the legacy tooling question can be settled without any experiment. `docs/research/2026-09-22-kilo-candidate-tool-evaluation.md` found that no candidate is adopted, that the measured bottleneck was S3 (prose and governance) rather than S1 (symbol navigation), that S3 was already closed deterministically by the decisions index at 117,321 B to 13,932 B, and that the omission and copy failure classes are caught by Layers A and C while an LLM memory cannot catch them by construction. The Jev evaluation found the cost sits in whole review rounds and owner attention rather than per-decision latency, and that Jev cannot certify, cannot be a gate input and cannot lower a human gate. Measured on this workstation: `D:\mcp-memory-data` holds 7.2 GB across five populated stores (qdrant 4,065 MB, meili 2,999 MB, etcd 202 MB, minio 50 MB, meilisearch 34 MB) with milvus empty and both `sqlite/memory_*.db` at 0 bytes; `D:\mcp-stack` holds 719 MB and is not a git repository. A grep of the live Codex configuration found exactly two references into either tree: `~/.codex/mcp-memory-stack/run-dbhub-l4-a.cmd` and `-b.cmd` name `D:/mcp-memory-data/sqlite/memory_a.db` and `memory_b.db`. Nothing in that configuration references `vector-stack/` or `D:\mcp-stack`.

Decision:
1. No memory engine and no graph backend is adopted. PROTO-DEC-0034 and PROTO-DEC-0036 stand, the MCP council's native-only ruling stands, and no council is reopened. Graphiti, Cognee, Mem0 and Letta are refused for the protocol on the recorded ground that non-deterministic external memory outside the repository is already excluded; a product-side experiment is a separate product decision and does not reopen PROTO-DEC-0036.
2. CodeGraph is recorded as an alternative S1 arm of the already preregistered experiment, not as an adoption. It becomes available only on the triggers in section 6 of the evaluation: a reproducible S1 bottleneck in real product work plus an owner directive.
3. Jev is advisory only and stays outside the gate. It may never issue a verdict, satisfy a completion gate, lower a human gate or replace a reproduction. The only authorised next step is offline replay over historical decisions with no change to this repository.
4. Legacy disposition, by measured reference rather than by size: `D:\mcp-memory-data\sqlite\` is referenced by the live Codex configuration and is kept, even though both databases are empty. `D:\mcp-memory-data\vector-stack\` (7.2 GB) is referenced by nothing in that configuration and is delete-eligible. `D:\mcp-stack` is not referenced by the Codex configuration but its own `continue-with-mcp.yaml` names its servers, so it may be live for another client; its code is kept and only its `database-storage/` and `logs/` are delete-eligible.
5. No deletion is executed by this decision. An owner instruction naming the specific path executes it, because the two trees are outside version control and there is no undo.
6. The expensive resource is the review round and owner attention, not the code and not the token. Mechanically checkable recorded rules are therefore converted into deterministic checks over repository state; judgement stays with models and the owner. `docs/specs/2026-09-23-executable-rulebook-spec.md` is that specification and remains a specification until implemented and certified.

Reasoning:
Every candidate was refused on a rule already recorded rather than on preference, so nothing here needs a new council. The legacy split is drawn by what the live configuration actually references, which is checkable, rather than by which directory is largest, which is not a reason. Declining to execute the deletion inside a decision block keeps the irreversible act attached to an explicit owner instruction naming a path.

Alternatives rejected:
Adopting a memory engine on the strength of a bottleneck that was measured to be S3 and is already closed; deleting both trees wholesale, which would have removed the two SQLite paths the live Codex stack names; treating Jev as a decision fabric, which contradicts the advisory rule and would create a single point of failure; opening another council to restate refusals that recorded decisions already imply.

Consequences:
`docs/research/2026-09-22-kilo-candidate-tool-evaluation.md` is the evidence base and stays. The Jev evaluation exists only outside the repository at the time of writing and must be persisted under the section 5.5 transcription fallback before it can be cited as anything. The deferred DeepSeek mapping run over `D:\mcp-stack` stays postponed under its recorded triggers. Layers A/B/C remain FAIL and uncertified, and the executable rulebook is specified but unwritten; both are certified together in one batched round under the PLAN batching rule.

Approved by: RuslanFomenko (direct owner directive, 2026-09-23, keep-or-delete on the legacy stack and the work split approved in conversation; transcribed by claude-ebd3e8a8eb29a6d7)

---

### PROTO-DEC-0046

Status: Accepted
Date: 2026-09-23
Reopen-trigger: owner-directive

Context:
The executable-rulebook batch failed certification round 3 (`docs/reviews/2026-09-23-deepseek-batch-certification-round3.md`) with F-001 partly open: after two remediation attempts, absolute and parent forms (`D:/Colabs/.ai/bin/x`, `C:/Colabs/.ai/bin/x`, `../.ai/bin/x`, `x/../.ai/bin/x`) still downgrade a confirmed protected-path defect to RECOMMENDATION with exit 0. The owner's condition returned the premise to the owner. An owner-requested Codex assessment (`docs/reviews/2026-09-23-codex-path-contract-assessment.md`) then found F-C01: with a neutral requirement, the ordinary relative paths `validate-protocol.ps1` and `protocol-manifest.json` also yield RECOMMENDATION with exit 0, so a path contract alone would not close the defect. Reproduced independently by claude-ebd3e8a8eb29a6d7, which also found the cause: `docs/specs/2026-09-23-executable-rulebook-spec.md` line 89 took the protected list "verbatim from PROTO-DEC-0038 item 1", while check 1 executes PROTO-DEC-0041 item 4, whose list adds `manifest` and `core`; and every recorded list names concepts rather than paths, so `validator` never matched `validate-protocol.ps1`. A probe that names an invariant in its `requirement` masks all of this, because rule 3 of the check then yields FAIL off protected paths too.

Decision:
1. New premise for root cause F-001/F-C01, replacing the exhausted one. The history of F-001 is preserved: remediation attempts 1 and 2 on the old premise stand as recorded and are not renumbered.
2. Ledger path contract. The `paths` field holds repository-root-relative paths. Backslashes are normalised to `/` and a leading `./` is stripped. Any absolute form - POSIX `/`, a Windows drive `X:` including drive-relative `X:path`, and UNC `\` or `//` - and any `..` segment, before or after normalisation, makes the row unparseable and the check exits 2 (BLOCKED). No lexical canonicalisation against a root is performed. This is a clarification of the ledger contract recorded here by the owner, not a rule the specification already implied.
3. Protected set for check 1, executing PROTO-DEC-0041 item 4. It is read at run time from repository state: every entry of `managed` and of `source` in `protocol-manifest.json`, plus anything under `.ai/`, `.claude/` and `.codex/`. That maps item 4's `core`, `manifest`, `validator`, `hooks` and `gates` onto the recorded definition of what the protocol owns (DEC-0013). This repository declares no consumer security or data paths; an installed project declares its own separately. `tests/` is not in this set; it stays protected for scope purposes by the standing default forbidden list in `.ai/docs/PROTOCOL.md`. Matching is on normalised whole paths and directory prefixes, never on a substring or a concept name.
4. Remediation budget on this premise: at most two attempts, counted in the findings ledger by `root-cause` and `attempt`, not by the number of reports.
5. Tests: one negative test per protected-path class with a neutral `requirement` that names no invariant or contract, including `validate-protocol.ps1` and `protocol-manifest.json`, plus one test per rejected path form expecting exit 2.
6. Certification. DeepSeek coordinates this work and dispatches it, so by PROTO-DEC-0041 item 1 it certifies none of it. The two parallel independent certifiers are Codex and a Claude session that neither authored nor controlled the candidate; `claude-ebd3e8a8eb29a6d7` authored the specification and is excluded. Gemini implements and is excluded. The candidate is committed before certification; each certifier works on that one SHA in its own worktree, records `git rev-parse HEAD` at start and end, and measures scope from the pre-change baseline. Neither reads the other's report before fixing its own verdict. The Codex assessment of 2026-09-23 was advisory and fills no slot.
7. This refines PROTO-DEC-0044 and PROTO-DEC-0045 and supersedes nothing. The freeze, PROTO-DEC-0034, 0038 and 0041 stand unchanged; no gate, verdict vocabulary, receipt format or completion requirement changes.

Reasoning:
Rejecting non-canonical paths can only err toward BLOCKED, which costs a human glance, whereas the failure item 4 exists to prevent is an erroneous RECOMMENDATION. Resolving concepts through the manifest uses the one recorded artifact that already enumerates the protocol's files, so the set is deterministic, repository-only and reproducible by hand, and it updates when the manifest does. Keeping `tests/` out holds check 1 to what item 4 actually names instead of widening it.

Alternatives rejected:
Canonicalising through `path.resolve` against the checkout, which makes the checkout location an input and gives a different verdict for the same ledger on another machine; lexical normalisation of `..`, which adds a transformation a hand check must replicate; matching concept names as path segments, which is what produced F-C01; a new hand-maintained concept-to-path table, which is a new rule with manual upkeep; counting this premise as a third attempt on the old one; letting the coordinator certify what it dispatched.

Consequences:
Gemini implements under DeepSeek's coordination and aligns `docs/specs/2026-09-23-executable-rulebook-spec.md` with items 2 and 3, correcting line 89. The certification prompt must use neutral-requirement probes, or rule 3 hides the result. Journals stand above their cap and are unloaded before the round. The Jev evaluation still exists only outside the repository.

Approved by: RuslanFomenko (direct owner confirmation, 2026-09-23: reject `..` with exit 2, protected set from the manifest's managed and source lists, certifiers Codex and a fresh Claude session, budget of at most two; transcribed by claude-ebd3e8a8eb29a6d7)
