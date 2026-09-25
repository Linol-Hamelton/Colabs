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

---

### PROTO-DEC-0047

Status: Accepted
Date: 2026-09-23
Reopen-trigger: owner-directive

Context:
The executable-rulebook batch, the 13-question routing research and the owner's discussion with Claude and Codex produced a set of operating rules that the owner accepted in conversation on 2026-09-23. They answer failures measured this week rather than preferences: a certification round that reviewed a tree before its candidate existed; a batch that produced 13 root causes across two fix rounds while no single root cause reached its two-attempt budget; an implementer (Gemini via Antigravity) that stalled twice, 40 and 25 minutes without a write, and lost one resume to a provider EOF; scripts that needed some twenty reproduced defects before they could be trusted, the four worst of which all passed silently; telemetry in which 61 of 78 rows come from Claude and none from Mistral; and a user-level Codex configuration whose MCP schemas cost 8,627 input tokens per call (190,204 with it, 181,577 with `--ignore-user-config`), about 5.7 times the 1,500-token budget of PROTO-DEC-0034 item 2. Effort scales and permission flags were read from each CLI's `--help` on 2026-09-23 rather than assumed.

Decision:
1. Certifier selection. The owner's order Codex, then Claude, then DeepSeek is an availability order, applied as "the first available participant that is independent of the candidate". It is not three sequential checks. Independence is filtered by PROTO-DEC-0041 item 1 before availability is considered.
2. Verdict asymmetry. Any participant, including the coordinator and the implementer, may report a FAIL or BLOCKED with a reproduction, and a reproduced defect blocks as PROTO-DEC-0041 items 4 and 5 already require. Only an independent certifier may issue PASS or RECOMMENDATION toward a completion gate. This refines PROTO-DEC-0041 item 1 and weakens nothing.
3. Certifier count by risk. High-risk candidates keep two parallel independent certifiers. A confirmer that re-checks the first certifier's report in a new session is acceptable for medium risk only; a single reviewer remains the rule for low risk (PROTO-DEC-0038 item 2). Recorded ground: in this batch the second independent reviewer found what the first missed three times (F-C01; the round-3 F-003 closure later overturned; the PASS given over an existing blocker).
4. Shadow certification. A participant not yet trusted for a binding slot (currently Mistral, Copilot) may certify in shadow: the same package, in parallel, independently, with its verdict recorded but never counted toward a gate, and scored against the final outcome. A record of accurate shadow rounds is the route into the succession order.
5. Batch cap. The per-root-cause budget cannot bound a batch whose rounds keep finding new root causes. For the executable-rulebook batch, the certification of the freeze that follows the current remediation round is the last automatic round; if it finds new blocking root causes, the coordinator returns the list to the owner instead of opening another round. In general a batch gets at most three certification rounds on distinct frozen candidates before the owner decides whether to narrow, accept with recorded exceptions, or continue.
6. Executor liveness. Liveness is progress, not process: no tree write, no journal update and no output for a set interval (15 minutes for an implementation step) means stalled. Executors write one checkpoint line to their journal after each block so that a fresh session resumes from the repository, not from lost context. Steps are verifiable from the tree so that re-running them is harmless. Two recoveries per executor; on the third the task passes to a deputy that is not a certifier of the same candidate, instead of raising a warning. Executors run non-interactively with a narrow pre-granted permission set and a time bound, because an interactive permission prompt and an unbounded wait both look like a hang. Measured from `--help`: agy `--print-timeout` defaults to 0s, which waits forever.
7. Permission grants. Prefer narrow grants: agy `--print --mode accept-edits --sandbox --print-timeout`; claude `-p --allowedTools`; vibe `-p --enabled-tools --max-turns`; codex `exec --approve-for-me`. Copilot's `--allow-all-tools` is required for its non-interactive mode and is compensated by a narrow working directory. Full bypass flags (`--dangerously-skip-permissions`, `--yolo`, `--dangerously-bypass-approvals-and-sandbox`) are used only inside a disposable worktree and only with the owner's authorisation recorded in the journal, as `.ai/docs/CLI-AGENTS.md` section 6 already requires. Kilo's auto-approval lives in its own interface and is the coordinator's to configure.
8. Script standard. Checks, analyses, tests and validations that meet the four conditions of section 1 of `docs/specs/2026-09-23-executable-rulebook-spec.md` are moved from assistants to scripts. Every such script must: fail closed, with unknown input exiting 2 and a test aimed specifically at silent pass-through; name the recorded decision it enforces; print the rows behind its result; carry a golden corpus of real past failures as regression tests; run in shadow beside the manual check before it is trusted; be certified like kernel code; and be re-verified when an input format it reads changes. Work that fails those four conditions stays with assistants.
9. Client registry. Models, effort and permission settings are recorded as verified data, not hard-coded in kernel logic: per client and provider, every main model, the native effort values, a normalised tier mapping, the permission and time-bound flags, the CLI version and the verification date, all taken from `--help` and `models` output. Logs record the value actually used, not the one requested. Measured 2026-09-23: claude `--effort` low|medium|high|xhigh|max; copilot `--reasoning-effort` none|minimal|low|medium|high|xhigh|max; agy `--effort` low|medium|high; codex has no effort flag, only `-c model_reasoning_effort`; vibe exposes neither effort nor model in `--help`.
10. Cost measurement. CodeBurn (npm `codeburn`) may serve as a local, read-only source of token, cost and time per task and model, joined to the findings ledger by session. It is not a quality measure: quality comes from ledger outcomes, escaped defects and owner interventions. Its hook installer (`codeburn guard`) is not used, and installing CodeBurn needs the owner's explicit approval under PROTO-DEC-0034. Reports are produced per closed task, with ratings reviewed every ten closed tasks rather than per session. Ratings stay advisory and never enter a gate.
11. Tool governance. Skills, MCP servers and connectors are default-deny: a project allowlist is the ceiling, a task class decides what is activated, a session loads the union of its tasks lazily. Forced use applies only to the protocol's own deterministic tools and procedural lookups, never to an external tool in a gate path. A description justifies a trial, never activation. Trials reuse the MCP council's preregistered template, generalised: paired A/B on one frozen SHA in separate worktrees, with schema tokens, invocation rate, fallback rate and duplicate reads measured alongside quality, time and cost. A metric that changes no decision over successive reviews is dropped.
12. Scope. This block records operating rules and direction. Items 1-7 apply from now. Items 8-11 are implemented as kernel changes under the PLAN batching rule, each certified under PROTO-DEC-0038 item 1; nothing here authorises an uncertified kernel change. `.ai/docs/CLI-AGENTS.md` is updated with the item 6-7 facts in the next kernel batch, not in the batch now being certified. PROTO-DEC-0034, 0038, 0041, 0045 and 0046 stand; this block supersedes nothing.

Reasoning:
Each item answers a measured loss this week. The asymmetry keeps every defect DeepSeek or any other participant can find in play while keeping self-approval out, which is the whole purpose of independence. The batch cap closes the loophole that per-root-cause counting leaves open. The liveness, permission and time-bound rules convert silent stalls into exits that a coordinator can act on. The script standard targets the one failure class all four of the worst script defects shared.

Alternatives rejected:
Letting the coordinator certify what it dispatched; a single senior certifier or a confirming second for high-risk work; activating tools on the strength of their descriptions; scoring quality from token spend; per-session ratings; full permission bypass outside disposable worktrees; hard-coding model names or a brand order in kernel logic.

Consequences:
The coordinator applies items 1-7 to the current batch and research. Q03/Q04 carry the registry of item 9, Q12 the cost measurement of item 10, Q14 the certification model of items 3-4, Q15 the tool governance of item 11. Freeze commits must be path-scoped to the candidate's declared scope, since unrelated work in the tree otherwise enters the candidate and fails its scope check.

Approved by: RuslanFomenko (direct owner confirmation, 2026-09-23, "принимаю все твои рекомендации"; transcribed by claude-ebd3e8a8eb29a6d7)

---

### PROTO-DEC-0048

Status: Accepted
Date: 2026-09-24
Reopen-trigger: owner-directive

Context:
The third certification round of the executable-rulebook batch, the last automatic one under PROTO-DEC-0047 item 5, failed in both binding slots on candidate `4ded1be`: Codex R3-C01..R3-C05 and Claude F-R3-01..F-R3-05. Mistral's shadow verdict was PASS against five reproduced defects. The deterministic parts had converged. The new root causes concentrated in `.ai/bin/protocol-scope.cjs`, which infers roles and identities from free prose in `.ai/TASK.md`. Across two rounds that produced five root causes. Its contract is spec section 6 of `docs/specs/2026-09-23-executable-rulebook-spec.md`. Claude recommended narrowing the batch and returning to product work. The owner rejected both. The owner's reason: participants' limits, Codex's above all, are spent almost at once, and the empty rounds are consequences of architectural defects. Product work on an unstable protocol, with no working metrics, would produce cycles for the sake of cycles.

Decision:
1. Batch disposition. The owner exercises the "continue" branch of PROTO-DEC-0047 item 5. The batch is not narrowed and not accepted with open defects. It is finished by removing the procedural and architectural defects behind the empty rounds. Product work does not resume until the protocol is stable and its metrics are measurable. This replaces the product-first ordering in the Next section of `.ai/TASK.md`.
2. Converged parts accepted. Layers A/B/C, `.ai/bin/protocol-ledger.cjs` and `.ai/bin/protocol-verdict.cjs` are accepted as converged. The one finding found independently in both slots, R3-C04 = F-R3-01, is authorised for a fix: ledger collection must stay inside the set that spec section 4 records.
3. Independence check weakened, not removed. Reports by different participants may not quote each other directly. Prose that matches between two reports is a citation defect. A participant may still endorse another's point, but only in a fixed form: agreement with `<model>` on item N, with one degree from a closed scale. The scale, from lowest to highest:
   - categorically disagree, with reasons;
   - disagree;
   - partially agree;
   - agree with reservations;
   - fully agree;
   - absolutely agree, with additional confirmation found.
   Any degree other than full agreement carries the additions that justify the deviation, in either direction. The exact grammar and the matching rule are defined in the spec and certified like kernel code. Until then the check is applied by hand.
4. Budget exhaustion. R3-C05, a blank line added inside a committed decision block that the validator does not see (RC-immutability-boundary, attempt 2), is recorded as an accepted exception. No third attempt is opened. A procedure is created that either prevents this behaviour or, when a root cause exhausts its budget, closes the cycle as failed at once and hands the case to an audit. It is designed as a proposal in `.ai/PLAN.md` and certified before use.
5. Producer record and reproductions. A producing session writes a journal entry with an Evidence block anchoring the candidate it produced (F-R3-03). A ledger reproduction must resolve to a script inside the repository (F-R3-04). Exception: a sanctioned borrowing of a proven practice may reference an external script, provided the sanction and the script's location are recorded.
6. Scope of kernel work now. Only critical failures that obstruct work are fixed now. Afterwards come research and design, with drawings and a skeleton of the architectural, semantic and meaning-level prototype, before any rebuild of the kernel.
7. Concurrency.
   - Edits to code, the kernel and the main documents (`.ai/TASK.md`, `.ai/PLAN.md`) have one coordinator and at most two active streams. At the current stage those streams are DeepSeek and Gemini.
   - The limit does not apply to research, heuristic discussion, or the development of concepts, plans and proposals. There every participant writes a separate document of its own.
8. Edits outside the repository. A change to a client's settings, or to anything else outside the repository, is made by one agent only. It keeps a backup, writes a journal entry, and writes a record in the folder where the change was made.

Reasoning:
Each empty round cost the full review budget of two certifiers, so the rounds spent the scarcest resource, Codex's limit, on defects that came from one design choice: parsing free prose. A fixed form for agreement turns an open text surface into a closed grammar while keeping legitimate endorsement. Recording the exhausted root cause as an exception and moving budget exhaustion to audit stops the same implementer from retrying past the budget. Separate documents for exploratory work keep independent reasoning, which a two-stream cap would otherwise suppress.

Alternatives rejected:
Narrowing the batch; accepting it with open defects; returning to product work now; removing the independence check from the script; a third attempt on RC-immutability-boundary; applying the two-stream cap to research and discussion.

Consequences:
The coordinator dispatches a remediation round covering items 2-5, with certification under PROTO-DEC-0038 item 1 and PROTO-DEC-0041 item 2. Items 3 and 4 need a spec change before code. `.ai/TASK.md` Next is replaced accordingly. PROTO-DEC-0034, 0038, 0041, 0045, 0046 and 0047 stand; this block supersedes nothing.

Approved by: RuslanFomenko (direct owner confirmation, 2026-09-24, replies to Claude's regrouping proposal: "одобряю" on item 2, "проверку ослабить, но не убирать" on item 3, "подтверждаю" on item 4, "отказ. доработать и устранить процедурные и архитектурные недостатки" on the batch; transcribed by claude-ebd3e8a8eb29a6d7)

---

### PROTO-DEC-0049

Status: Accepted
Date: 2026-09-24
Reopen-trigger: owner-directive

Context:
Each re-certification round of the executable-rulebook batch had both certifiers re-read and re-probe the whole batch, although each fix round changed a small part of it. That is the main reason Codex's limit is exhausted within a round or two. The round-3 failures in `.ai/bin/protocol-scope.cjs` came from guessing roles out of free prose. Executor stalls this week sat for 25 and 40 minutes with no reads, writes or reasoning before anyone acted. Earlier research, the MCP council among it, treated a found risk, or a poor measurement of an untuned setup, as grounds to drop an approach rather than to cover the risk. agy in headless mode soft-denies every command outside its allow-list. Measured 2026-09-24: its PreToolUse hook is loaded and invoked, but neither a hook `allow` nor `permissionOverrides` satisfies its own permission check.

Decision:
1. Diff-based re-certification. From the second round of a batch onward, a certifier reviews the diff between the previous certified-against candidate and the new one, together with the findings that diff claims to close. The validator and the full regression suite run automatically over the whole tree and are attached as Evidence. Reading beyond the diff is never forbidden. The certifier widens it when the changed code depends on unchanged code, and records why. The first round of a batch still reviews the whole candidate.
2. Fixed grammar, unknown exits 2. Every script check that reads human-written input — the roles in `.ai/TASK.md`, agreement lines between reports under PROTO-DEC-0048 item 3, and ledger rows — reads only lines in a fixed grammar. Anything it cannot parse exits 2 as unknown. It is never guessed. The grammar is defined in `docs/specs/2026-09-23-executable-rulebook-spec.md` and certified with the script.
3. Idle exit. At any stage, more than five minutes with no reading, no writing and no reasoning, zero tokens, is a stall and not a wait. The executor or its watchdog exits and the run resumes or escalates under PROTO-DEC-0047 item 6. This refines the 15-minute interval of that item for idle time.
4. Risk-seeking serves coverage. Risks are searched and forecast in order to prevent and compensate for them and to judge whether the expected gain can be reached. A found risk does not by itself reject a solution. A poor measurement of an untuned or undifferentiated setup is not evidence against the approach. It is evidence against that configuration. A solution is rejected only when its risks cannot be covered at acceptable cost, or when the net gain after coverage is negative. Each research report states, per risk, how it can be covered, what the coverage costs, and what residual remains.
5. Executor permissions for agy. The owner authorises agy to run without CLI permission prompts, with full approval for all edits within the regulation of the procedure and the task. Violations are handled by the owner.
   - Irreversible operations are hard-blocked by the PreToolUse gate `~/.gemini/config/protocol-gate.cjs`. Its list is recorded beside it in `~/.gemini/config/PROTOCOL-CHANGES.md`.
   - Prompts are removed with `--dangerously-skip-permissions`, only after the owner has verified that the gate's deny path holds under that flag.
   - This refines PROTO-DEC-0047 item 7 for agy only. The disposable-worktree condition is replaced by the gate.

Reasoning:
The diff is where new defects can be, and the automatic full-tree run keeps regressions visible. Reviewing the whole batch again spends a certifier's limit on code already certified. Guessing from prose produced five root causes in two rounds, and a closed grammar with an explicit unknown ends that class. An executor that burns no tokens for five minutes is not working. Risk search that ends in refusal forfeits the gain the work was meant to deliver.

Alternatives rejected:
Full re-review every round; heuristic prose parsing; a fixed 15-minute bound for idle stalls; rejecting solutions on the first risk found; interactive approvals for agy; a full bypass for agy without a gate.

Consequences:
The remediation round of PROTO-DEC-0048 is certified on its diff against `4ded1be`. Items 2 and 3 enter the spec and scripts in that round. The watchdog of item 3 is a kernel change and is certified. The research brief for junior models under item 4 is `docs/research/2026-09-24-remediation-mapping/BRIEF.md`. PROTO-DEC-0038, 0041, 0047 and 0048 stand; this block supersedes nothing.

Approved by: RuslanFomenko (direct owner confirmation, 2026-09-24: "да, записывай" on diff-only certification, "применяй, но вопросы в CLI надо отключить и дать полное одобрение на все правки в рамках регламента процедуры и задания", "да" on fixed grammar with exit 2 for roles, the five-minute zero-token exit, and the principle that risks are sought to cover them and gain, not to justify refusal; transcribed by claude-ebd3e8a8eb29a6d7)

---

### PROTO-DEC-0050

Status: Accepted
Date: 2026-09-24
Reopen-trigger: owner-directive

Context:
Round 2 of the remediation-mapping research was dispatched through one launcher command, with each prompt kept in a file, and it ran without quoting refusals. Earlier dispatches of the same kind lost three to five attempts per agent to shell quoting and wrong flags. In the same round Mistral failed twice at its first output character. vibe is a Python program, and with stdout redirected to a file on Windows it encoded in the ANSI code page and died on U+2192. Both failures were fixed in the launcher, `docs/research/2026-09-24-remediation-mapping/prompts/launch-round2.cjs`. The owner's ruling was that each such break is a missing procedure. Plugging it locally with a workaround is not enough, and concentrating on procedures is the route to results.

Decision:
1. Failures become procedures. Every operational failure is classified by its root cause and closed by changing the procedure or registry entry it belongs to, so that the class cannot recur for any participant. A local workaround is allowed only to finish the work in hand. It is recorded as temporary, and the procedure change follows in the next kernel batch. The journal entry that reports a failure names the procedure it changes, or states that none exists yet.
2. Dispatch procedure. A dispatcher does not compose a CLI command by hand. Specifically:
   - Every prompt is a file in the repository.
   - The dispatched agent receives one fixed ASCII line naming that file: "Read and follow the file <repo-relative path>".
   - The command line is assembled by a script from recorded client data.
   - Flags are used only as verified from the client's own `--help` and recorded with the CLI version and date.
   - Every prompt begins by checking that the working tree is the intended repository, and stops if it is not.
   - The dispatch script enforces the idle exit of PROTO-DEC-0049 item 3 and the hard time cap.
   - A failed agent is restarted once. A second failure goes to the owner, unless the first failure was the dispatcher's own defect and that defect has been fixed.
3. Client execution profiles. The client registry of PROTO-DEC-0047 item 9 records, for each client:
   - the command template;
   - the required environment, for example UTF-8 for Python-based clients: `PYTHONUTF8=1` and `PYTHONIOENCODING=utf-8` for vibe;
   - the permission and time-bound flags;
   - the known failure modes with their cause and countermeasure.
   A task written for a client is written against its profile. A new failure mode found in any run is added to the profile, not only fixed in the run.
4. Home and timing. The dispatch procedure and the profiles belong in `.ai/docs/CLI-AGENTS.md`, together with a registry file that the dispatch script reads. The research launcher is generalised into a kernel dispatch script. Both are kernel changes. They enter the current remediation round, because dispatch failures spend the same limits PROTO-DEC-0048 set out to save. They are certified under PROTO-DEC-0038 item 1 on the diff, as PROTO-DEC-0049 item 1 provides.

Reasoning:
The two failures of one evening share a pattern. Each was invisible until it cost attempts, and each would have recurred for the next dispatcher and the next Python-based client. A procedure change removes the class, while a workaround removes one instance. The launcher and the environment fix have already worked once, so the procedure records something measured rather than something designed.

Alternatives rejected:
Leaving the fixes inside a research-directory script; hand-quoted commands with more careful instructions; per-incident notes in journals without a procedure home; deferring the registry to the kernel redesign.

Consequences:
The coordinator adds the dispatch script, the registry file and the `.ai/docs/CLI-AGENTS.md` update to the remediation round of PROTO-DEC-0048. Until they are certified, `docs/research/2026-09-24-remediation-mapping/prompts/launch-round2.cjs` is the recorded temporary workaround. PROTO-DEC-0047, 0048 and 0049 stand; this block supersedes nothing.

Approved by: RuslanFomenko (direct owner confirmation, 2026-09-24: "вот тебе еще одна процедура для ядра. может немного доработать и зафиксировать"; "это процедура написания задач для мистраль"; "если каждое падение и поломку не затыкать пальцем и не лечить костылем, а сосредоточиться на процедурах, мы быстро придем к успеху"; transcribed by claude-ebd3e8a8eb29a6d7)

---

### PROTO-DEC-0051

Status: Accepted
Date: 2026-09-24
Reopen-trigger: owner-directive

Context:
PROTO-DEC-0050 made failures into procedures, but nothing yet notices a failure class early, records it in one place, or routes it into a procedure. The same holds for mechanical work that assistants keep getting wrong. This week's instances:
- line citations that do not say what they claim, as in GLM's Z1 answer and the Q02 and Q10 challenges;
- unmeasured MEASURED labels;
- a hash comparison done with the wrong offset;
- signals for four clients described without being measured.
Each would have been deterministic as a script. Idle detection under PROTO-DEC-0049 item 3 stops a stalled agent outright. Yet every client in use can resume its own session by id, so a stalled agent can often be woken rather than lost.

Decision:
1. One signals ledger. The kernel keeps one append-only signals ledger. Its lines follow a fixed grammar under PROTO-DEC-0049 item 2, so a script can count them. Each signal records:
   - its type: procedure-gap, script-candidate or fall;
   - the date and the participant;
   - the evidence path;
   - the cost it caused (attempts, minutes or owner interventions);
   - its disposition.
   Any participant or script may append a signal. None may delete one.
2. Procedure-gap signals. A signal of this type is recorded when:
   - an operational failure costs an attempt or an owner intervention;
   - the same workaround is used a second time;
   - a rule is missing, so that "rule not found" applies;
   - a dispatch or client breaks in a way no procedure foresaw.
   One signal is enough to open a candidate. At batch planning the coordinator groups open signals by root cause and proposes, for each group, the procedure or registry change under PROTO-DEC-0050 item 1. The owner decides adoption. A group left open for two consecutive batches is escalated to the owner.
3. Script-candidate signals. A signal of this type is recorded when either of these holds:
   - an assistant performs the same check, count, comparison, parse or measurement on repository inputs a second time;
   - an assistant's result on such work is found wrong.
   The coordinator tests each candidate against the four conditions of section 1 of `docs/specs/2026-09-23-executable-rulebook-spec.md`. A candidate that meets them is scheduled as a script or an existing library under the script standard of PROTO-DEC-0047 item 8. One that does not stays with assistants, and the unmet condition is recorded.
4. Wake-then-fail watchdog. It refines PROTO-DEC-0049 item 3.
   - The dispatch script watches each agent's reasoning artifact: its streamed output, its transcript, its report and its journal.
   - The artifact is stalled when its size does not change, or it does not appear, for five minutes.
   - On a stall the watchdog wakes the agent by resuming the same session by id, with a fixed line telling it to continue from its last journal checkpoint. It does this up to three times.
   - If the agent does not resume progress after the third wake, the watchdog ends the process and records it as FALLEN, with its logs, its session id and the wake history.
   - A client that cannot resume by id skips the wakes and is recorded as FALLEN on the first stall. That gap is itself a procedure-gap signal.
   - Every FALLEN outcome is appended to the signals ledger as type fall. A fall is investigated for its cause, and closed either by a bug fix or by a new procedure.
5. Home and timing. The watchdog belongs to the dispatch script of PROTO-DEC-0050 item 4 and enters the current remediation round with it. The signals ledger and the processing of items 2 and 3 are specified in `.ai/docs/CLI-AGENTS.md` and a kernel procedure document, and are certified under PROTO-DEC-0038 item 1. Until the ledger exists, signals are recorded in the reporting journal under a line beginning "Signal:".

Reasoning:
Failures this week were noticed only when they had already cost a round, and the evidence for a procedure lay scattered over journals. One ledger with a grammar makes recurrence countable. The script-candidate signal targets the one kind of error that scripts remove entirely. Waking by session resume keeps an agent's accumulated context, which a fresh restart discards. The fall record turns a silent loss into an investigation.

Alternatives rejected:
Killing on the first stall; unlimited wakes; signals kept only in journals; letting each participant decide alone what becomes a procedure or a script.

Consequences:
The remediation round of PROTO-DEC-0048 now also carries the wake-then-fail watchdog and the signals ledger specification. PROTO-DEC-0047, 0049 and 0050 stand; this block supersedes nothing.

Approved by: RuslanFomenko (direct owner confirmation, 2026-09-24: "надо в ядро добавить еще 2 процедуры ... процедура отслеживания сигналов на создание новых процедур и процедура отслеживания сигнала перевода обработки данных с нейросетей на скрипты или библиотеки ... скрипт с таймером, который отслеживает артефакт рассуждения ... будит ассистента 3 раза ... завершает процесс с флагом что он упал ... упавший флаг это сигнал на расследование причин и устранение бага или написание новой процедуры"; transcribed by claude-ebd3e8a8eb29a6d7)

---

### PROTO-DEC-0052

Status: Accepted
Date: 2026-09-24
Reopen-trigger: owner-directive

Context:
Research programs consumed most of this week and have no kernel procedure. The remediation-mapping cycle already runs under a structure the owner set: round 1 zone reports, one owner per zone; round 2 challenges, where nobody challenges their own zone, followed by DeepSeek's synthesis of that round; round 3 three independent syntheses by DeepSeek, Claude and Codex; then a final implementation plan by Claude or Codex. `.ai/docs/PAIRED-CYCLE.md:160` requires one synthesis and one disposition table per round. That rule was written for implementation cycles, and it conflicts with the third round (conflict K1 in `docs/research/2026-09-24-remediation-mapping/PROCEDURE-MAP.md`).

Decision:
1. Research cycle structure. A research or design cycle that the owner opens runs in up to three rounds:
   - round 1: primary reports, exactly one owner per zone;
   - round 2: challenges, where no participant challenges its own zone, plus one synthesis of the round;
   - round 3: independent syntheses by the participants the owner names, followed by one final plan written by a participant the owner names.
2. Independence of round-3 syntheses. Each round-3 synthesiser writes its synthesis without reading the other round-3 syntheses, and records in its journal that it did not open them. The final plan is written only after all syntheses exist. It states where the syntheses agree, where they diverge, and which divergence it resolves and why. Agreement with another synthesis is expressed only in the fixed form of PROTO-DEC-0048 item 3.
3. Scope of the one-synthesis rule. `.ai/docs/PAIRED-CYCLE.md` section 5 item 3 continues to govern implementation and certification cycles. It does not apply to research cycles under item 1. The kernel text is aligned in the current remediation round.
4. Research outputs are advisory. No synthesis or final plan is a decision. The owner adopts, amends or rejects the final plan, and only an approved block makes it binding.
5. For the remediation-mapping cycle now running, the round-3 synthesisers are DeepSeek, Claude and Codex. The final plan is written by Claude or Codex, as the owner names. The research-cycle procedure is written into the kernel as a scenario, and is certified with the other kernel changes of this round.

Reasoning:
The cycle has already produced corrections that one synthesis would have absorbed, for example GLM's rejected answer and the defects found in the Gemini and Mistral reports. Independent syntheses expose disagreement while it is still cheap. Limiting the one-synthesis rule to implementation cycles keeps its original purpose, which is to stop per-item artifacts during remediation.

Alternatives rejected:
One synthesis in every round; syntheses written after reading each other; leaving research cycles without a procedure.

Consequences:
Conflict K1 is resolved. The research-cycle scenario is added to the remediation round alongside PROTO-DEC-0050 and 0051. PROTO-DEC-0041 and 0048 stand; this block supersedes nothing.

Approved by: RuslanFomenko (direct owner confirmation, 2026-09-24: "да" to recording the three-synthesis research-cycle structure above PAIRED-CYCLE section 5 item 3 for research cycles; the structure itself was set by the owner earlier the same night; transcribed by claude-ebd3e8a8eb29a6d7)

---

### PROTO-DEC-0053

Status: Accepted
Date: 2026-09-24
Reopen-trigger: owner-directive
Supersedes: PROTO-DEC-0052 items 2 and 5, as to the final-plan step only

Context:
PROTO-DEC-0052 recorded the research cycle with one final plan written after three independent syntheses. The same night the owner refined the closing step, and made the procedure the one for changes to the kernel: a draft decision built on the syntheses must be criticised by the other two synthesisers before any plan is fixed.

Decision:
1. Kernel-change decision procedure. Every change to the protocol kernel, and every research cycle that prepares one, closes in four steps after the rounds of PROTO-DEC-0052 item 1:
   - (a) three independent syntheses, each written without reading the others;
   - (b) one draft decision built on all three, written by the synthesiser the owner names. It states where the syntheses agree, where they diverge, and how each divergence is resolved;
   - (c) a critique of that draft by each of the two other synthesisers, written independently of each other, using the fixed agreement form of PROTO-DEC-0048 item 3 for each point of the draft;
   - (d) the final plan, fixed by whichever of the three the owner names. It answers every point of both critiques by accepting it, rejecting it with a reason, or leaving it to the owner.
2. Nothing in steps (a) to (d) is a decision. The owner approves, amends or rejects the final plan, and only an approved block makes it binding.
3. For the remediation-mapping cycle now running, the synthesisers are DeepSeek, Claude and Codex. The owner names the drafter of step (b) and the fixer of step (d) when the syntheses are in. The Claude synthesis is written by a fresh Claude session, not by the session that wrote the cycle's briefs, leads and procedure map.
4. The kernel scenario required by PROTO-DEC-0052 item 5 records this four-step closing.

Reasoning:
A draft written from three syntheses can still inherit its drafter's blind spots. Two independent critiques before fixing put every choice in the draft under challenge from both of the other perspectives. Naming the fixer only at the end keeps the choice with the owner.

Alternatives rejected:
The final plan written directly after the syntheses; a single critic; the drafter always fixing its own plan.

Consequences:
The closing step of PROTO-DEC-0052 is replaced by items 1 to 3. PROTO-DEC-0052 items 1, 3 and 4 stand.

Approved by: RuslanFomenko (direct owner confirmation, 2026-09-24: "новая процедура на правки в ядро. три синтеза, решение на их основе критика от двух оставшихся и после любой из трех фиксирует по указанию человека итоговый план"; transcribed by claude-ebd3e8a8eb29a6d7)

---

### PROTO-DEC-0054

Status: Accepted
Date: 2026-09-24
Reopen-trigger: owner-directive

Context:
The round-3 syntheses of the remediation-mapping cycle are in: Claude (`r3-claude-synthesis.md`), Codex (`r3-codex-synthesis.md`) and DeepSeek (`r3-deepseek-synthesis.md`), plus one external synthesis the owner supplied in conversation, which proposes Graph Memory as a reference architecture. The owner then directed, in conversation: finalize one consolidated synthesis on the hypotheses with the widest agreement; build around it a staged strategic plan for the evolution of the kernel, saved as `CORE-ARCH-1.md`, `CORE-ARCH-2.md` and so on; make the first stage a procedure for creating procedures, built from the most basic layer L0 up, with `https://github.com/graph-memory/graphmemory/blob/main/docs/architecture.md` as the reference; stop binding roles to model brands and assign any role to any participant per task; run the kernel work as code is run, with Claude as implementer and DeepSeek as reviewer; check before each next layer that the architecture of processes and procedures is consistent; temporarily lift the ban on kernel edits and on brand-dependent roles; make a backup of the repository and start.

Decision:
1. The CORE-ARCH program is opened: a layer-by-layer evolution of the protocol kernel, planned in `docs/core-arch/CORE-ARCH-<n>.md`. The plan files are proposals. The content of each stage becomes binding only through an approved block.
2. Temporary freeze exception. For work inside the CORE-ARCH program, neither the feature freeze of PROTO-DEC-0039 item 1 nor the ordering in PROTO-DEC-0048 item 6 blocks kernel edits. The exception lasts until the owner revokes it or the program closes. The product hold of PROTO-DEC-0048 item 1 stands.
3. Roles are not bound to brands in this program. Any role may be assigned to any participant per task. The brand-per-line practice of DEC-0020 and the naming of DeepSeek and Gemini as the edit streams in PROTO-DEC-0048 item 7 do not bind CORE-ARCH work. The owner's assignment now: Claude is the implementer and DeepSeek the reviewer. The cap of PROTO-DEC-0048 item 7, one coordinator and at most two edit streams, stands.
4. Workflow. Each stage produces a candidate that DeepSeek reviews adversarially, with the closed verdict vocabulary of PROTO-DEC-0041 item 3, before the stage is presented to the owner. Before work on the next layer starts, the implementer checks the new layer's processes and procedures against the layers already built, and records the check.
5. What stands unchanged: owner-only authority and transcription (PROTO-DEC-0030); the append-only decision log; no commit, tag or push without the owner; PROTO-DEC-0038 and PROTO-DEC-0041, so the final check of a high-risk kernel candidate needs two parallel independent certifiers, and Claude and DeepSeek, as its author and controller, certify none of it; PROTO-DEC-0034, 0036 and 0045, so Graph Memory is a design reference and is not adopted as a runtime, memory engine or MCP server.
6. Backup. A full copy of the checkout, including `.git`, the dirty tree and untracked files, was made before any program edit at `D:\Colabs-backup-2026-09-24-pre-core-arch`, at HEAD `4ded1be`. No tag was created.

Reasoning:
The owner judged that the kernel's defects are architectural, and that more remediation inside the current structure repeats empty rounds. A layer-by-layer rebuild that starts from the rule for making rules addresses the cause: every later procedure is written, checked and retired by one procedure. Keeping the certification rules intact keeps the program's own output under independent review, while the exception frees the design work that PROTO-DEC-0048 item 6 had postponed.

Alternatives rejected:
Continuing the remediation round unchanged before any redesign; lifting the certification rules together with the freeze; adopting Graph Memory as a runtime service, which PROTO-DEC-0045 item 1 refuses; recording the program only in PLAN, which ranks below the freeze it must lift.

Consequences:
`docs/core-arch/CORE-ARCH-1.md` carries the consolidated synthesis, the program and the owner questions. It proposes how the consensus items of the remediation round (PROTO-DEC-0048 to 0053) are re-homed into the program's stages; the owner decides that re-homing. `.ai/TASK.md` Roles and Next are updated accordingly. PROTO-DEC-0038, 0041, 0048 items 1-5 and 7-8, and 0049-0053 stand; this block supersedes nothing.

Approved by: RuslanFomenko (direct owner directive, 2026-09-24: "Временно надо по решению владельца снять запрет на правки ядра и роли в зависимости от бренда, возможно сделать резервную копию репозитория и приступать к работе"; "имплементатором я хотел бы назначить тебя, а ревьюером дипсик"; "Сейчас первым этапом самым главным будет написать процедуру на создание процедуры"; transcribed by claude-eb97ac9d13050014)

---

### PROTO-DEC-0055

Status: Accepted
Date: 2026-09-24
Reopen-trigger: owner-directive
Supersedes: PROTO-DEC-0053 item 1 step (c) and item 3, for the remediation-mapping cycle only, as to who writes the two critiques

Context:
`docs/core-arch/CORE-ARCH-1.md` listed questions only the owner can answer. The owner answered four of them in conversation on 2026-09-24: re-home the remediation items into the program's stages (question 2); the second critique comes from Gemini (question 3); Codex and Gemini certify the program's packages (question 4); and, since no vote on the base layer exists outside the repository, the consensus base layer can be built now (question 9). The owner also stated how model and effort are chosen: each task is run in a session launched with the model and reasoning effort named explicitly.

Decision:
1. Re-homing. The remediation items that PROTO-DEC-0048 to 0053 placed in the current remediation round (R-01 to R-19 of `docs/core-arch/CORE-ARCH-1.md` section 3.2) are carried out inside the CORE-ARCH stages, as mapped in section 7 of that file. No separate DeepSeek-Gemini remediation round runs. Items marked critical there land first, in certification package I. The obligations themselves stand: this changes where and by whom they are done, not what they require.
2. Research-cycle closing for the remediation-mapping cycle. `docs/core-arch/CORE-ARCH-1.md` is step (b), the draft decision, of PROTO-DEC-0053 item 1. Its two critiques in step (c) are written by DeepSeek and Gemini, independently of each other, in the fixed agreement form of PROTO-DEC-0048 item 3. Gemini replaces Codex as a critic because Codex's limits are exhausted. The fixer of step (d) is named by the owner later.
3. Certifiers of the program. The final checks of CORE-ARCH certification packages I, II and III are made by Codex and Gemini, in parallel and independently (PROTO-DEC-0041 item 2). Claude, as author and implementer, and DeepSeek, as controller and reviewer, certify none of them. Gemini's critique of a design draft is neither authorship nor control of a kernel candidate; to keep that true, Gemini is not the fixer of step (d) and edits no program candidate. If either certifier is unavailable, PROTO-DEC-0047 item 1 applies and the owner confirms the replacement.
4. Base layer. No vote on the base layer exists outside the repository. L0, the meta-root whose core is the procedure for creating procedures, is the base layer, and stage 1 proceeds now under DeepSeek's control.
5. Model and effort. Every program session is launched with its model and reasoning effort named explicitly at launch, chosen before launch from the task's complexity. The session records in its journal the model and effort it actually ran with. An agent does not switch models inside a session; a mismatch is reported for a relaunch.

Reasoning:
Running the remediation items inside the layer that owns them avoids building on the structure the program replaces, and keeps one edit stream. Gemini is the available participant outside both the drafting and the review of the program, which is what an independent critique and an independent certifier need. Choosing model and effort at launch matches how every client in use is invoked non-interactively.

Alternatives rejected:
A separate Gemini-DeepSeek remediation round in parallel with the program; waiting for Codex to write the second critique; letting Claude or DeepSeek certify a package; letting a session choose its own model after launch.

Consequences:
`.ai/TASK.md` Roles and Next are updated. `docs/core-arch/CORE-ARCH-1.md`, `-2.md` and `-3.md` record the answers. DeepSeek's stage-1 control prompt replaces the earlier review prompt, which is archived. PROTO-DEC-0038, 0041, 0047, 0048 items 1-5 and 8, 0049-0052, 0053 items 1 (a), (b), (d) and 2, and 0054 stand.

Approved by: RuslanFomenko (direct owner answers, 2026-09-24: to question 2 "да"; to question 3 "вторую критику дает Gemini"; to question 4 "именно так, Codex и Gemini!"; to question 9 "значит это можно реализовать уже сейчас"; on model choice "для задачи будет запускаться сессия с прямым указанием модели и уровнем усилий"; transcribed by claude-eb97ac9d13050014)

---

### PROTO-DEC-0056

Status: Accepted
Date: 2026-09-24
Reopen-trigger: owner-directive

Context:
Stage 1 of the CORE-ARCH program left owner questions open: whether CORE-ARCH-1 counts as step (b) of PROTO-DEC-0053 (finding CA-12); whether Gemini keeps its certifier independence after critiquing the design (CA-13); how to treat reviews that ran on `deepseek/deepseek-flash` instead of the requested tier; whether the back edge taken by P-L0-003 and P-L0-004 after a review FAIL satisfies the S1-T08 acceptance (CA-28); and whether to archive or raise the corpus limits (`docs/reviews/` at 70 files and 695 KB against 60 and 600 KB; 47 journals against 30). The owner answered on 2026-09-24.

Decision:
1. `docs/core-arch/CORE-ARCH-1.md` is step (b), the draft decision, of PROTO-DEC-0053 for the remediation-mapping cycle. This confirms the reading recorded in PROTO-DEC-0055 item 2 and closes CA-12.
2. Executors, not brands. Roles are reasoned about in terms of executors, not model brands. Each task runs in a new terminal session, launched after an executor suited to the task and its complexity has been chosen. Rotating models from one step to the next is intended: models trained on different data, with different resulting weights, cover each other's blind spots. The one general rule is that the same model does not hold two roles within one task.
3. Model selection. The model and effort for a task are chosen by the model-selection procedure. Until that procedure is approved, the draft `docs/core-arch/stage-2/P-L2-002-model-selection.md` is used as a trial. The owner records `deepseek-flash`, version 4.1, as a strong model; the stage-1 review passes that ran on it stand.
4. The back edge from review to drafting taken by P-L0-003 and P-L0-004 after the S1-T11 FAIL satisfies the S1-T08 acceptance "one exercise covers a FAIL and a back edge". CA-28 is closed.
5. Corpus limits. The review corpus and the journals are not archived to meet the current caps; the caps are raised instead. Navigation over the corpus must work as a pointer to the data a reader needs, without reading all of it; that navigation is what makes larger caps workable. The new numbers are set by the owner. Until then the current caps stay warnings under the WARN-first policy of PROTO-DEC-0037, and no archiving is done to meet them.

Reasoning:
Brand identity says nothing about what a session will do; the model, the task and the role do. Keeping one role per model per task preserves independence, and rotation between steps adds the diversity that different training brings. A procedure, not a request in a prompt, decides the model. Archiving to satisfy a cap moves material out of sight, while an index lets a reader reach it without the cost the cap was meant to limit.

Alternatives rejected:
Binding roles or certifier slots to brands; asking for "the strongest model" in a prompt without a procedure; archiving active reviews and journals to meet the old caps.

Consequences:
Open questions for the owner, recorded by the transcriber and not decided here: what counts as one task for item 2, and whether PROTO-DEC-0041 item 1 (an author, executor or controller never certifies its candidate) still applies when certification runs as a separate task; the new cap numbers and the form of the corpus navigation index for item 5. `.ai/TASK.md` and CORE-ARCH-1, -3 are updated. PROTO-DEC-0037, 0041, 0053, 0054 and 0055 stand; this block supersedes nothing.

Approved by: RuslanFomenko (direct owner answers, 2026-09-24: to CA-12 "да!"; to CA-13 "я вообще не хочу привязываться к брендам. Надо рассуждать в категирии исполнителей. Если каджая следующая задача запускается в новом терминале после выбора подходящего исполнителя с подходящей сложностью, какое значение имеет кто эта модель??? Ротация моделей от одного шагу к другому обоснованна разницей в тех данных на которых обучались модели и того, какие веса они по итогу построили. Что компенсирует слепые зоны других бренов. Общее правило лишь в том, что одна и та же модель не может иметь две роли в рамках одной задачи."; to the tier question "deepseek-flash(версии 4.1 -сильная модель) должно решаться согласно процедуре выбора модели(если такой процедуры пока нет, надо ее описать и начать использовать)"; to CA-28 "да"; to the limits question "нет, надо повысить лимиты. навигация по корпусу должна работать как указатель на нужные данные, без необходимости чтения всех данных. это делается как раз для того, чтобы увеличить лимиты корпуса данных в ревью и журналах."; transcribed by claude-eb97ac9d13050014)

---

### PROTO-DEC-0057

Status: Accepted
Date: 2026-09-24
Reopen-trigger: owner-directive
Supersedes: PROTO-DEC-0037 item 3, as to the numbers of the review-corpus cap only

Context:
PROTO-DEC-0056 left four points open, and the owner was asked to confirm three transcriber's readings in plain words. The owner answered in a structured poll on 2026-09-24.

Decision:
1. Readings confirmed. PROTO-DEC-0054 item 1 means: the CORE-ARCH program is open; everything in `docs/core-arch/CORE-ARCH-1.md` to `-7.md` is a proposal; anything becomes binding only when the owner approves it in a decision block. PROTO-DEC-0055 item 5 means: model and reasoning effort are chosen before a session and set at launch; the model is not changed inside a session; if it does not suit the task, the session is relaunched with another model.
2. Stage review order. The order of PROTO-DEC-0054 item 4 - the reviewer checks each stage first, and only after its PASS or RECOMMENDATION does the stage go to the owner; before the next layer the implementer checks and records that the new layer is consistent with those already built - applies only to work on the kernel. In the standard work cycle, after the reviewer's PASS or RECOMMENDATION the work goes to the certifier. A PASS from the certifier approves the work on the certifier's authority. A FAIL or RECOMMENDATION from the certifier sends it to the owner.
3. One task is one task frame, identified by its `scope-id`. The rule of PROTO-DEC-0056 item 2, that the same model does not hold two roles within one task, applies within one frame.
4. The author, executor or controller of a candidate never certifies it, even when the certification runs as a task of its own. PROTO-DEC-0041 item 1 stands in full.
5. Corpus caps. Active `docs/reviews/` is capped at 200 files and 2 MB; `.ai/worklog/` at 100 journal files. The 150-line cap per journal is unchanged. The caps stay warnings under the WARN-first policy of PROTO-DEC-0037. A navigation index over the reviews and journals, pointing a reader at the data it needs without reading the whole corpus, is built in CORE-ARCH package I-a.

Reasoning:
Items 3 and 4 together close CA-13: a model that critiqued the design in one frame may certify a package in another, because it is neither the author, the executor nor the controller of that candidate. Item 4 keeps the one-role rule from being bypassed by splitting work into separate tasks. Raising the caps instead of archiving keeps active material in place, and the navigation index keeps the cost of reading it bounded.

Alternatives rejected:
Treating the whole program as one task; allowing an author to certify its own candidate in a separate task; the 500-file and uncapped options offered in the poll.

Consequences:
CA-13 is closed. `validate-protocol.ps1`, its tests in `tests/validator.test.cjs`, `AGENTS.md` section 8 and `.ai/docs/PAIRED-CYCLE.md` guardrail 8 are updated to the new numbers inside the CORE-ARCH program (PROTO-DEC-0054 item 2); these are protected paths, so the change is reviewed and lands for certification with package I-a. The certifier count for high-risk work stays as PROTO-DEC-0041 item 2 sets it; this block changes no count. PROTO-DEC-0037 items 1, 2, 4 and 5, 0041, 0054, 0055 and 0056 stand.

Approved by: RuslanFomenko (direct owner answers in a structured poll, 2026-09-24: 0054 item 1 "Верно"; 0054 item 4 "Верно, но только лишь для работ над ядром. В стандартном рабочем цикле после PASS или RECOMENDATION идет к сертификатору. Если он накладывект PASS - одобряется от имени сертификатора. Если FAIL или RECOMENDATION, тогда идет ко мне"; 0055 item 5 "Верно"; one task = "Одна рамка задачи"; author certifying its candidate as a separate task = "Нет, никогда"; caps = "200 / 2 MB и 100"; transcribed by claude-eb97ac9d13050014)

---

### PROTO-DEC-0058

Status: Accepted
Date: 2026-09-24
Reopen-trigger: owner-directive

Context:
The model-selection procedure `docs/core-arch/stage-2/P-L2-002-model-selection.md` (draft 0.1, in trial under PROTO-DEC-0056 item 3) was summarised for the owner. It held five rules and an interim tier table with three tiers, most of whose cells were the author's suggestion. The owner confirmed the rules, rejected the suggested cells, and set how the table is to be built.

Decision:
1. The five rules of P-L2-002 are confirmed as written: the tier is computed before launch and written into the task frame; one model holds one role in a task, a task being one frame with its own `scope-id`; models rotate between steps, because different training data and weights cover each other's blind spots; model and effort are set at launch and do not change inside a session; a brand is never the reason for a choice, the reasons are the tier, the ban on a second role, and the rotation.
2. Table cells filled from the author's suggestion are not accepted. The interim tier table of P-L2-002 draft 0.1 is withdrawn.
3. The participants of the tier table are determined by this procedure, recorded as `docs/core-arch/stage-4/P-L3-002-model-discovery.md`:
   - (1) in any project, when Colabs is deployed, the available AI assistant providers are checked through the command line;
   - (2) for each available provider, the list of available models is obtained by a request that returns the provider's own help;
   - (3) candidates are selected from the available models: the flagship, the strongest; the second, next after the flagship; the workhorse, the model with the best price to quality per token;
   - (4) the selected candidates are recorded in a candidate matrix;
   - (5) the effort levels that exist for each model in the matrix are determined by queries to it;
   - (6) minimum, middle and maximum effort are taken as the three levels nearest the centre of the list.
4. The tier table grows to nine tiers: three for the rank of a model from one provider, times three for the effort level, giving T1 to T9.

Reasoning:
A table built from what each provider reports in the project at hand holds only models and effort levels that exist there. Three model ranks times three effort levels give each provider the same shape of table, so the rubric can point at a tier without naming a brand.

Alternatives rejected:
A tier table filled from the author's suggestion; three tiers only.

Consequences:
Open for the owner, recorded by the transcriber and not decided here: how the rubric's sum of 0 to 12 maps onto T1 to T9, and the hard floors for kernel changes, certifications and protected paths; the order of the nine tiers within a provider; which three levels are taken when a list has an even number of levels or fewer than three. P-L3-002 lands with CORE-ARCH package II and is run by the installer. The draft tier table was never a decision; PROTO-DEC-0056 item 3 stands and this block supersedes nothing.

Approved by: RuslanFomenko (direct owner directive, 2026-09-24: on the five rules "Это идеально"; on the table "Ячейки с пометкой «моё предложение» будут перемерены на этапе 4. - предложение не принимается. Необходимо зафиксировать процедуру определения участников таблицы рангов: 1. В любом проекте, при разворачивании решения Colabs происходит через CLI проверка доступных провайдеров ИИ Ассистентов. 2. После определения доступных провайдеров через запрос с получением справки от правайдера определяется список доступных моделей от каждого провайдера. 3. Кандидаты из доступных моделей отбираются по принципу: флагман - самый сильный, следующий на флагманом - второй по силе, рабочая лошадка - модель с наилучшим соотношением цена/качество за токен. 4. Фиксируем в матрицу отобраных кандидатов. 5. Запросами к моделям из матрицы отобраных кандидатов, определяем варианты существующих у них уровней усилий. 6. Определяем минимальный, средний и максимальный, как три ближайших к центру списка. Таблицу рангов увеличиваем до 9 вариантов: три отвечают за ранг модели от одного поставщика, три за уровень усилий итого T1, Т2, ... Т9"; "Зафиксируй это вместо старого решения"; transcribed by claude-eb97ac9d13050014)

---

### PROTO-DEC-0059

Status: Accepted
Date: 2026-09-24
Reopen-trigger: owner-directive

Context:
PROTO-DEC-0058 left four points of the nine-tier table open. The owner answered them in a structured poll on 2026-09-24.

Decision:
1. Order of the nine tiers within one provider: the model rank comes first. Workhorse at minimum, middle and maximum effort is T1, T2, T3; the second model is T4, T5, T6; the flagship is T7, T8, T9.
2. The rubric's sum of 0 to 12 maps onto the tiers as: 0 to T1; 1-2 to T2; 3 to T3; 4-5 to T4; 6 to T5; 7-8 to T6; 9 to T7; 10-11 to T8; 12 to T9. A kernel change or a certification is at least T7; a protected path is at least T4.
3. When a model has an even number of effort levels, the three levels nearest the centre are shifted up: the middle is the upper of the two central levels (for a, b, c, d: b, c, d).
4. When a model has fewer than three effort levels, the available levels are repeated: one level fills all three slots; with two, the minimum is the lower and the middle and maximum are the upper.

Reasoning:
Putting the model rank first keeps a stronger model above any effort setting of a weaker one. The floors keep kernel changes and certifications on a flagship and protected paths off the workhorse.

Alternatives rejected:
Effort before model rank; the stricter floors of T9 and T5; shifting the centre down; leaving models with fewer than three effort levels out of the table.

Consequences:
`docs/core-arch/stage-2/P-L2-002-model-selection.md` 0.3 and `docs/core-arch/stage-4/P-L3-002-model-discovery.md` 0.2 carry these rules. PROTO-DEC-0056 item 3 and PROTO-DEC-0058 stand; this block supersedes nothing.

Approved by: RuslanFomenko (direct owner answers in a structured poll, 2026-09-24: tier order "Сначала модель"; score mapping and floors "Вариант А" (0→T1, 1–2→T2, 3→T3, 4–5→T4, 6→T5, 7–8→T6, 9→T7, 10–11→T8, 12→T9; kernel change or certification not below T7, protected path not below T4); even number of levels "Сдвиг вверх"; fewer than three levels "Повторять имеющиеся"; transcribed by claude-eb97ac9d13050014)

---

### PROTO-DEC-0060

Status: Accepted
Date: 2026-09-24
Reopen-trigger: owner-directive

Context:
Stage 1 of the CORE-ARCH program (layer L0) reached RECOMMENDATION from its reviewer, and its package was put to the owner (`docs/core-arch/stage-1/S1-SUMMARY.md`) together with three open program questions: the fifth evidence class E with a three-batch disuse threshold, the home of the new kernel, and persisting the external synthesis the owner supplied in conversation. The owner answered in a structured poll on 2026-09-24.

Decision:
1. Stage 1 is approved only after a re-check: the reviewer first re-checks the last fixes (CA-32 to CA-35, two of them the second attempt of their root cause) and the changes this block requires.
2. The proposed class E rule is rejected: disuse over three batches is not a reason to retire a procedure, because the architecture expects some procedures to go unused for many rounds when the work does not call for them. Instead:
   - a procedure is written for identifying candidates for retirement or for improvement of a procedure;
   - a procedure is written for A/B testing a candidate for retirement;
   - after the work on the kernel is finished, A/B/C tests are run: A the new kernel, B the old kernel, C no kernel at all; two or three tasks are run with one model in a clone of some repository.
3. The new kernel lives in `.ai/core/`.
4. The external synthesis the owner supplied in conversation is persisted in `docs/research/2026-09-24-remediation-mapping/external-synthesis.md` with a transcription header.

Reasoning:
In a layered kernel a procedure is loaded when its role, stage or trigger comes up, so a long gap is expected and says nothing about its value. Retirement needs a finding and a test, not a count. Comparing the new kernel with the old one and with none measures whether the program produced a gain at all.

Alternatives rejected:
Retirement after three batches without use; keeping the new kernel in `.ai/docs/`; leaving the external synthesis only in chat history.

Consequences:
P-L0-001, the schema, the root and CORE-ARCH-2 drop the disuse trigger; the two procedures are drafted in stage 1 as L0 records and go to the reviewer's re-check with the fixes; CORE-ARCH-7 adds the A/B/C test to the program's exit. PROTO-DEC-0054 to 0059 stand; this block supersedes nothing.

Approved by: RuslanFomenko (direct owner answers in a structured poll, 2026-09-24: stage 1 "Сначала перепроверка"; class E "Нет. Сама арзитектура нашего решения подразумевает, что некоторые процедуры могут не использоваться много кругов, если работа не подразумевает их использование. Вывод с 3 пакетами некоректный. Надо описать процедуру определения кандидатов на вывод или улучшение процедуры. Также надо описать процедуру по A/В тестированию кандидата на выбывание. А после завершения над доработкой ядра, запустить A/B/C тесты. А - новое ядро / B -старое ядро / C - без ядра вообще. Задачи 2-3 прогнать с одной моделью в клоне какого-нибудь репозитория."; kernel home ".ai/core/"; external synthesis "Да, сохранить"; transcribed by claude-eb97ac9d13050014)

---

### PROTO-DEC-0061

Status: Accepted
Date: 2026-09-24
Reopen-trigger: owner-directive

Context:
PROTO-DEC-0060 item 1 made the approval of CORE-ARCH stage 1 (layer L0) wait for a re-check. The re-check returned RECOMMENDATION (`docs/reviews/2026-09-24-deepseek-core-arch-stage1-recheck.md`). The owner then answered the approval poll with "Одобряю после ещё одной перепроверки". The second re-check returned RECOMMENDATION (`docs/reviews/2026-09-24-deepseek-core-arch-stage1-recheck2.md`), with two LOW findings, CA-41 and CA-42, fixed afterwards.

Decision:
1. Stage 1 of the CORE-ARCH program is approved. The records under `docs/core-arch/stage-1/` - the root `L0-ROOT.md`, `procedure.schema.md`, P-L0-001 to P-L0-007, `RULE-MAP.md`, the trial records and notes, and `SPEC-protocol-core.md` - are the approved design of layer L0.
2. They are not yet the kernel. They land in `.ai/core/` with certification package I-a, certified by Codex and Gemini (PROTO-DEC-0055 item 3), after stages 2 and 3.
3. Stage 2, layer L1 (roles), opens.

Reasoning:
The owner's condition was one more re-check; it returned RECOMMENDATION with no blocking finding, and the three root causes that used both attempts closed on their second.

Alternatives rejected:
Approving before the second re-check; landing the L0 records in the kernel before stages 2 and 3 and their certification.

Consequences:
`.ai/TASK.md` Next records stage 2 as open; CORE-ARCH-2 section 11 and `docs/core-arch/stage-1/S1-SUMMARY.md` mark the approval. PROTO-DEC-0054 to 0060 stand; this block supersedes nothing.

Approved by: RuslanFomenko (direct owner answer in a structured poll, 2026-09-24: "Одобряю после ещё одной перепроверки"; the condition was met by the RECOMMENDATION of the second re-check the same day; transcribed by claude-eb97ac9d13050014)

---

### PROTO-DEC-0062

Status: Accepted
Date: 2026-09-24
Reopen-trigger: owner-directive

Context:
With stage 1 approved (PROTO-DEC-0061), the owner was asked whether to start stage 2 (layer L1, roles) and three open program questions that affect it: where complexity assessment and model choice live (В-13), who assigns roles when the owner is not available (В-14), and whether to run the asynchronous-review pilot (В-7). The owner answered in a structured poll on 2026-09-24.

Decision:
1. Model discovery comes first: `docs/core-arch/stage-4/P-L3-002-model-discovery.md` is run on this workstation to build the tier table, and stage 2 starts after it.
2. Complexity assessment and model choice stay where they are: the selection procedure P-L2-002 in layer L2, the tier table and the discovery procedure P-L3-002 in layer L3. No separate layer is added.
3. When the owner is not available, the coordinator assigns roles, only within a delegation the owner has recorded (to whom, which task frames, until which date), under the one-role-per-model rule (PROTO-DEC-0056 item 2) and P-L2-002; every assignment is recorded.
4. The asynchronous-review pilot runs from stage 2: while the reviewer checks stage N, the implementer may design stage N+1 but lands nothing in the kernel; at most two stages are under review at once; if stage N fails, stage N+1 is reworked where the failure touches it.

Reasoning:
A tier table built from the providers really available makes every later model choice checkable instead of `table-pending`. Keeping model choice in L2 and L3 keeps one home per rule. Delegation within a recorded scope keeps work moving without transferring the owner's authority. The pilot removes the idle wait between review passes and is measured by the rework it causes.

Alternatives rejected:
Starting stage 2 before discovery; a separate complexity layer; assigning roles only when the owner is present; sequential stages without the pilot.

Consequences:
The discovery result is written to `docs/core-arch/stage-4/MODEL-MATRIX.md`. CORE-ARCH-1 В-7 and CORE-ARCH-3 В-13, В-14 are closed. PROTO-DEC-0054 to 0061 stand; this block supersedes nothing.

Approved by: RuslanFomenko (direct owner answers in a structured poll, 2026-09-24: stage 2 "Сначала подбор моделей"; В-13 "L2 + L3, как сейчас"; В-14 "Координатор по делегированию"; В-7 "Да, с этапа 2"; transcribed by claude-eb97ac9d13050014)

---

### PROTO-DEC-0063

Status: Accepted
Date: 2026-09-24
Reopen-trigger: owner-directive

Context:
The first run of P-L3-002 (`docs/core-arch/stage-4/MODEL-MATRIX.md`) could settle flagship, second and workhorse only for codex; the other clients reported model names only, and no provider reported prices. The implementer asked the owner to pick the ranks. The owner pointed out that the kernel has no procedure for that choice. The implementer drafted `docs/core-arch/stage-4/P-L3-003-model-ranking.md`, and the owner answered a structured poll on it on 2026-09-24.

Decision:
1. When a client's own catalog does not settle a model's strength or price, both are taken from the provider's official pages on its own domain (model overview and prices per million tokens), each value with its address and date. The flagship is the model the provider calls its most capable; the second is the next one in the provider's own line; the workhorse is the model with the lowest output price among those the provider offers for general and coding work. Third-party leaderboards and a model's memory are not sources. The owner is asked only for what this leaves unsettled.
2. A model belongs to the matrix of the provider that makes it. Clients that reach other providers' models, such as copilot and agy, are recorded as routes to them, with no ranks of their own. The one-role-per-model rule of PROTO-DEC-0056 item 2 applies to the model, whatever client runs it.
3. P-L3-003 is run now, as a trial, to complete the tier table before stage 2.

Reasoning:
A provider ranks and prices its own models more reliably than any memory of them, and a route through another client does not change which model is working. Running the procedure now turns the owner questions of the first run into recorded evidence.

Alternatives rejected:
The CLI as the only source; measuring model strength with our own test runs at this step; giving every client ranks of its own over all the models it reaches.

Consequences:
MODEL-MATRIX.md is completed by P-L3-003 with sources and dates. PROTO-DEC-0058 and 0059 stand; this block supersedes nothing.

Approved by: RuslanFomenko (direct owner remark, 2026-09-24: "в нашем ядре нет процедуры описыващей выбор из твоекго ответа"; then answers in a structured poll: sources "Принять"; other providers' models "Принять"; run now "Да, сейчас"; transcribed by claude-eb97ac9d13050014)

---

### PROTO-DEC-0064

Status: Accepted
Date: 2026-09-25
Reopen-trigger: owner-directive

Context:
P-L3-003 (PROTO-DEC-0063) ranked Anthropic and part of OpenAI from the providers' official pages and left four points to the owner (`docs/core-arch/stage-4/MODEL-MATRIX.md`): the Google flagship, the OpenAI workhorse, DeepSeek's two models and makers with fewer than three reachable models, and whether to rank the models reached only through copilot. The owner answered a structured poll.

Decision:
1. Google: the flagship is gemini-3.8-flash; the second is gemini-3.1-pro; the workhorse is gemini-3.7-flash.
2. OpenAI: the workhorse is gpt-5.6-luna.
3. DeepSeek: the flagship is deepseek-flash 4.1 and the second is deepseek-v4-pro. When a maker has fewer than three reachable models, the models it has are repeated: the higher-ranked one above, the lower one filling the lower ranks. For DeepSeek the workhorse is therefore deepseek-v4-pro; for Mistral, mistral-medium-3.5 fills all three ranks.
4. The models of xAI, Moonshot and Microsoft reached through copilot are ranked now under P-L3-003.

Reasoning:
Where the providers' pages did not settle a rank, the owner settled it, which is P-L3-003 step 5. One repeat rule for model ranks mirrors the rule for effort levels (PROTO-DEC-0059 item 4).

Alternatives rejected:
gemini-3.1-pro as the Google flagship; gpt-5.6-terra or gpt-5.3-codex as the OpenAI workhorse; deepseek-v4-pro as the DeepSeek flagship; leaving makers with fewer than three models out of the table; keeping the copilot-only makers as routes without ranks.

Consequences:
P-L3-003 gains the repeat rule; MODEL-MATRIX.md is completed. Recorded while applying item 4: Moonshot's page calls Kimi K3 "Kimi's most capable flagship model to date", so K3 is the flagship and K2.7 Code the second and, by item 3, the workhorse; xAI (grok-4.5) and Microsoft (mai-code-1.1-flash) each have one model reachable through copilot, which fills all three ranks. PROTO-DEC-0058, 0059 and 0063 stand; this block supersedes nothing.

Approved by: RuslanFomenko (direct owner answers in a structured poll, 2026-09-24/25: Google "gemini-3.8-flash"; OpenAI "gpt-5.6-luna"; fewer models "Flash 4.1 — флагман; повторять" (option text: flash 4.1 flagship, v4-pro second, repeat as in the first option: the higher above, the lower filling the lower ranks); copilot-only makers "Ранжировать сейчас"; transcribed by claude-eb97ac9d13050014)

---

### PROTO-DEC-0065

Status: Accepted
Date: 2026-09-25
Reopen-trigger: owner-directive

Context:
Under PROTO-DEC-0064 item 3 the DeepSeek workhorse became deepseek-v4-pro, a model with 3.3 times the output price of deepseek-flash whose availability in Kilo was not confirmed. The implementer also noted that clients do not report whether each model accepts each effort level. The owner answered on 2026-09-25 and told the implementer to start stage 2.

Decision:
1. deepseek-v4-pro is not used. DeepSeek has one model in the matrix, deepseek-flash 4.1, which fills all three ranks by the repeat rule of PROTO-DEC-0064 item 3.
2. Clients differ in how a model and an effort level are set: some take them before the CLI starts, others after it has started. A separate procedure is written with per-client instructions for setting the model and effort after launch.
3. Stage 2 of the CORE-ARCH program (layer L1, roles) starts now, under the asynchronous-review pilot of PROTO-DEC-0062 item 4.

Reasoning:
A model the owner does not want in use should not appear in a table that selects models. Setting the model is a client-specific act, so its steps belong in a procedure, not in each prompt.

Alternatives rejected:
Keeping deepseek-v4-pro as the DeepSeek workhorse; relying on the first launch alone to discover how each client sets its model.

Consequences:
`docs/core-arch/stage-4/MODEL-MATRIX.md` drops deepseek-v4-pro. The per-client procedure is a stage-4 task (L3/L4, CORE-ARCH-5). Transcriber's reading, not an owner statement: setting the model and effort through the client's own command right after launch and before the task begins counts as setting them at launch under PROTO-DEC-0055 item 5. PROTO-DEC-0055, 0062 and 0064 stand; this block supersedes nothing.

Approved by: RuslanFomenko (direct owner answers, 2026-09-25: "v4-pro вообще не хочу использовать"; "у всех разный воркфлоу. одни принимают комаду о модели перед запуском CLI другие после. На это нужно будет составить отдельную процедуру с инструкциями после запуска."; "Сейчас начинай: ... этап 2 (роли) с пилотом асинхронного ревью."; transcribed by claude-eb97ac9d13050014)

---

### PROTO-DEC-0066

Status: Accepted
Date: 2026-09-25
Reopen-trigger: owner-directive

Context:
The owner asked for a prompt that works through as many hypotheses as possible for what AX can give Colabs, with the options explained simply and settled in a poll. In two polls on 2026-09-25 the owner defined AX as the integration of Google AX, replaced the question of who runs the prompt with a request for an adaptive policy of execution depth, and specified a multi-source model of hypothesis generation and a funnel format. The owner left the layout of the work to the implementer and pointed to seed hypotheses written as prompts in `OwnerIdeas/`. The full wording is persisted in `docs/research/2026-09-25-improvement-research/BRIEF.md` (O-01 to O-08).

Decision:
1. Two research studies run now: study A, what integrating Google AX and any other improvement can give Colabs in speed, agent accuracy, context quality, convenience, architecture, security, scalability, fault tolerance and cost, seeded by `OwnerIdeas/Google_AX.md`, `MCP_Server.md` and `Rust.md`; study B, an adaptive policy for the depth of agent execution, in which the task type sets a base frequency F1-F5, risk and complexity escalate the depth, the execution pattern sets the number and roles of independent agents, and models are chosen separately through P-L2-002. Their specifications are the owner's answers O-01 to O-04 of the brief.
2. Hypotheses come from several sources with separate functions: repository evidence, external sources, systematic derivation, measurements, failures, contrarian, cross-domain, combinatorial and negative hypotheses. Each carries its provenance and novelty class. An external practice is a source of an idea, not proof that it helps Colabs.
3. The output is a funnel: broad discovery, normalisation, fast screening, deep cards, a backlog, a rejected list, synergies and a priority set by the owner's value formula. Measurements take precedence over subjective scores.
4. Each study runs as three independent researchers of different makers and one synthesiser who is not one of them. Models are chosen through P-L2-002.
5. In this run researchers read and measure only. Prototypes and A/B tests are later, separate tasks under P-L0-007, in a disposable clone, after the owner approves the priorities.
6. The results enter the CORE-ARCH program as candidates of classes C and D. The triage and escalation part of stage 3 waits for the synthesis of study B; the rest of stage 3 proceeds.

Reasoning:
One fixed execution scheme either wastes strong models on simple tasks or under-checks risky ones, so depth should follow the task. Several independent researchers of different makers widen the search, which is the purpose of the funnel. Measuring without prototyping keeps the kernel and the repository safe while still grounding the screening in numbers.

Alternatives rejected:
One execution scheme for every task; choosing between repository and internet sources; choosing between many short hypotheses and few detailed cards; a single researcher, or one researcher escalated only on failure; building prototypes inside the research run; running the research after the program or as a separate backlog.

Consequences:
`docs/research/2026-09-25-improvement-research/` holds the brief, a README with the dispatch table and four prompts; the owner launches the sessions. No decision is reopened: adopting MCP, Google AX, a Rust core or a memory engine stays governed by PROTO-DEC-0034 item 2, PROTO-DEC-0036, PROTO-DEC-0039 item 3 and PROTO-DEC-0045, and nothing from the research lands in the kernel without an approved block. Transcriber's reading, not an owner statement: the layout (one brief, one prompt per study, one per synthesis) is the implementer's choice, which the owner left open.

Approved by: RuslanFomenko (direct owner answers in two polls, 2026-09-25: "интеграция Google AX может дать Colabs по скорости, точности работы агентов, качеству контекста, удобству, архитектуре, безопасности, масштабируемости, отказоустойчивости и стоимости."; "Количество исполнителей, независимых прогонов, глубина критики, необходимость синтеза и полный цикл проверки должны зависеть от ТИПА ЗАДАЧИ."; "Нужна многоисточниковая модель генерации гипотез"; "Используй многоступенчатый funnel."; "Оформь как удобнее всего нейросетям для чтения и памяти о ответах."; "3 независимых + синтез (Recommended)"; "Замеры сейчас, тесты потом (Recommended)"; "Сейчас, в CORE-ARCH (Recommended)"; full wording in docs/research/2026-09-25-improvement-research/BRIEF.md; transcribed by claude-eb97ac9d13050014)

---

### PROTO-DEC-0067

Status: Accepted
Date: 2026-09-25
Reopen-trigger: owner-directive
Supersedes: PROTO-DEC-0049 item 3, as to the idle bound a dispatch watchdog applies before it stops an executor

Context:
Before launching the improvement research of PROTO-DEC-0066 through a Kilo Code session, the owner
asked for two things. First, fallback routes in the table of models and efforts, without new
candidates. Second, one rule: the launch workflow the procedures already describe comes first, and
Kilo is used when models are unavailable there. The implementer recorded, read-only, the Kilo
7.7.9 routes, effort variants and prices for every ranked model. Two questions went to the owner:
the order of routes inside Kilo, and when to switch. The owner answered both and asked for a
concrete state machine and set of liveness signals. The full wording is persisted as O-09 to O-11
in `docs/research/2026-09-25-improvement-research/BRIEF.md`.

Decision:
1. Route order. The maker's official, authorised CLI is always the primary route. When it is
   unavailable, Kilo is the fallback router. Inside Kilo, the cheapest suitable route is taken; if
   it lacks the capabilities or the reasoning effort, a stronger route. This change adds routes
   only; no new model candidates are considered.
2. When to switch. Kilo is only a fallback. An immediate switch happens only on a hard failure
   before useful work: a non-zero exit or crash, an authorisation error, an exhausted limit, an
   unavailable model or provider, or an explicit network or provider error.
3. Silence. Silence is judged by liveness and progress signals, not by one timeout. While there is
   progress, the wait extends. A soft timer of about 2-3 minutes without progress leads only to an
   inspection of the process. A hard idle timer of about 7-10 minutes of absolute silence, with the
   process alive, marks a probable hang and allows the fallback. Both values are configurable and
   are later to be adapted by task type and historical metrics.
4. Useful work. Once an executor has started useful work, no other executor is started
   automatically. Useful work is changed files, written state or journal, artifacts, or a
   substantial intermediate result. The state is saved; handoff or recovery follows, and the owner
   decides when needed.
5. One attempt. Where a fallback is allowed: the official CLI, then one automatic launch through
   Kilo. If Kilo does not start either, the task stops and the owner decides.
6. No parallel runs. The primary and the fallback model never run on one task in parallel
   without an explicit decision of the orchestration layer.
7. The state machine, the liveness signals and the default timer values proposed by the
   implementer are recorded as `docs/core-arch/stage-4/P-L3-004-route-failover.md`. They are put
   on trial in the launcher of the improvement research.

Reasoning:
A fixed silence rule either kills long reasoning or waits too long on a dead process. Liveness
signals separate the two. Forbidding an automatic second executor once work has started removes the
risk of two executors writing one task. A single automatic Kilo attempt keeps cost and surprises
bounded.

Alternatives rejected:
A fixed "ten minutes of silence is a failure" rule; switching whenever the primary is slow;
unlimited automatic retries across routes; running the primary and the fallback in parallel by
default; adding new model candidates while adding routes.

Consequences:
The following were written:
- `docs/core-arch/stage-4/kilo-routes.cjs` and `kilo-routes.json` (the recorded Kilo catalog);
- a fallback section in `docs/core-arch/stage-4/MODEL-MATRIX.md`;
- `P-L3-004` (trial);
- `docs/research/2026-09-25-improvement-research/prompts/launch.cjs`, its job files and the Kilo
  Code prompt `K-launch.md`.

The total cap of PROTO-DEC-0050 item 2 and its one-restart rule stand. The Supersedes line is the
transcriber's reading, not an owner statement: the owner's hard idle timer replaces the five-minute
idle bound of PROTO-DEC-0049 item 3 for dispatch watchdogs. The rest of item 3, that a stall at
zero activity is not a wait, stands. Mistral has no Kilo route that reaches its tier's effort
(max), so a failure of its primary route goes to the owner.

Approved by: RuslanFomenko (direct owner answers, 2026-09-25: "Сначала приоритет запуска у текущего воркфлоу уже опиманого в процедуре инструкциями. А если по этим путям модели не доступны, используются лимиты kilo."; "Сейчас мы не рассатриваем новых кандидатов для таблицы. Только прописываем дополнения в виде новых маршрутов при недоступности нашего основного маршрута."; "Внутри Kilo: самый дешёвый подходящий маршрут ↓ если не хватает capabilities / reasoning effort 4. Более сильный маршрут"; "hard failure → immediate fallback; тишина без progress → adaptive timeout; есть progress → ждать; уже есть полезные изменения → никакого автоматического failover."; "Предложи конкретный алгоритм state machine и набор сигналов liveness"; full wording in docs/research/2026-09-25-improvement-research/BRIEF.md O-09 to O-11; transcribed by claude-eb97ac9d13050014)

---

### PROTO-DEC-0068

Status: Accepted
Date: 2026-09-25
Reopen-trigger: owner-directive
Supersedes: PROTO-DEC-0067, as to the scope of its Supersedes line only

Context:
The launch-package review (`docs/reviews/2026-09-25-deepseek-research-launch-review.md`, Part 4
item 1; ledger row CB-12) found the Supersedes line of PROTO-DEC-0067 broader than the owner's
answer O-11. PROTO-DEC-0049 item 3 (zero activity) measures something other than O-11 (no progress
of a live process), and `launch-round2.cjs` still enforces five minutes. The fix response
`docs/reviews/2026-09-25-claude-core-arch-stage2-fix-response.md` offered two options; the owner
chose A.

Decision:
1. The soft and hard timers of PROTO-DEC-0067 item 3 replace the idle bound of PROTO-DEC-0049
   item 3 only in `docs/research/2026-09-25-improvement-research/prompts/launch.cjs` and in P-L3-004
   while it is on trial.
2. Elsewhere, including `launch-round2.cjs` and the kernel dispatch script of PROTO-DEC-0050
   item 4 until an approved block adopts P-L3-004 there, PROTO-DEC-0049 item 3 stands in full.

Reasoning:
The two rules measure different things, so one should not silently replace the other outside the
launcher where the owner's timers were asked for.

Alternatives rejected:
Keeping the Supersedes line wide and moving `launch-round2.cjs` to the O-11 timers in a separate
change (option B of CB-12).

Consequences:
No code change. The text of PROTO-DEC-0067 is not edited; this block narrows only how far its
Supersedes line reaches.

Approved by: RuslanFomenko (direct owner answer in chat, 2026-09-25: chose "A: сузить" on the CB-12 question; transcribed by claude-c73232724159e5bd)

---

### PROTO-DEC-0069

Status: Accepted
Date: 2026-09-25
Reopen-trigger: owner-directive

Context:
Ledger row CB-13: item 6 of PROTO-DEC-0066 omits two sentences of the option the owner chose in
O-08 (`docs/research/2026-09-25-improvement-research/BRIEF.md`). The fix response offered this
block for confirmation; the owner confirmed it.

Decision:
1. As chosen in O-08, the improvement research of PROTO-DEC-0066 runs in parallel with the stage-2
   review, does not count under the two-stream limit of PROTO-DEC-0048 item 7, and touches no
   kernel record. This adds to PROTO-DEC-0066 item 6 and changes nothing else in it.

Reasoning:
The decision block should carry the whole option the owner chose, not part of it.

Alternatives rejected:
Leaving the gap between PROTO-DEC-0066 item 6 and O-08 as an open question.

Consequences:
None beyond the record. PROTO-DEC-0066 is not edited.

Approved by: RuslanFomenko (direct owner answer in chat, 2026-09-25: chose "Подтвердить" on the CB-13 question; transcribed by claude-c73232724159e5bd)

---

### PROTO-DEC-0070

Status: Accepted
Date: 2026-09-25
Reopen-trigger: owner-directive

Context:
Ledger row CB-21: the research launcher ran `vibe --auto-approve` and copilot with
`--allow-all-tools --no-ask-user` from the repository root, and no block authorised either. The
fix response offered two options (authorise the flags as they were, or narrow them). The owner
answered with new terms instead, quoted here in full:

> Разрешить на весь прогон PROTO-DEC-0066 один раз, без повторных подтверждений уже разрешённых
> действий. Для vibe использовать --enabled-tools <минимально необходимый список>; --auto-approve
> разрешён только для этого ограниченного набора инструментов. Для copilot разрешить
> --allow-all-tools в non-interactive режиме, как предусмотрено PROTO-DEC-0047 п.7, при явно
> ограниченной рабочей директории; --no-ask-user использовать только если этот флаг подтверждён
> текущим copilot --help. Исследователи вправе читать репозиторий, выполнять необходимые для
> исследования измерительные и read-only команды и записывать только назначенные им
> research-артефакты, собственный journal и служебное runtime-state. Изменения kernel, product
> code и shared governance documents, а также commit, tag и push запрещены. Любой diff вне
> разрешённого scope → STOP.
> Повторное подтверждение владельца не требуется, если действие уже однозначно разрешено
> действующим approved decision, active procedure, task-frame, этим разрешением или иным
> записанным delegation и не расширяет scope, authority или permissions. Если из действующих
> правил и текущего состояния следует ровно одно допустимое действие, агент выполняет его и
> фиксирует основание, а не спрашивает владельца повторно.
> Обращение к владельцу требуется только если: отсутствует необходимая authority; требуется
> расширение scope/permissions/delegation; нужен exception к действующему правилу; есть
> неразрешённый конфликт binding sources; остаются несколько существенно различных допустимых
> вариантов, между которыми процедура не делегирует выбор; требуется ранее не разрешённое
> необратимое действие; исчерпан предусмотренный budget/back-edge; либо действующие правила дают
> UNKNOWN, а не однозначный результат. Локальный выбор между вариантами, который уже явно
> делегирован роли или процедуре, не требует owner confirmation.
> Эти разрешения действуют только в рамках PROTO-DEC-0066 и прекращаются с завершением
> соответствующего research run; они не становятся постоянным профилем клиентов и не расширяют
> полномочия за пределы этого scope.

Decision:
1. The authorisation is given once for the whole research run of PROTO-DEC-0066. Actions it
   already allows are not confirmed again.
2. vibe runs with `--enabled-tools <the minimal necessary list>`; `--auto-approve` is allowed only
   for that limited tool set.
3. copilot runs with `--allow-all-tools` in non-interactive mode, as PROTO-DEC-0047 item 7
   provides, with an explicitly limited working directory. `--no-ask-user` is used only if the
   current `copilot --help` confirms the flag.
4. Researchers may read the repository, run the measurement and read-only commands the research
   needs, and write only their assigned research artefacts, their own journal and service runtime
   state. Changes to the kernel, product code and shared governance documents are forbidden, and
   so are commit, tag and push. Any diff outside the allowed scope is a STOP.
5. No owner re-confirmation is needed when an action is already unambiguously allowed by an
   approved decision, an active procedure, a task frame, this authorisation or another recorded
   delegation, and does not widen scope, authority or permissions. When the rules and the current
   state admit exactly one admissible action, the agent takes it and records the basis instead of
   asking the owner again.
6. The owner is asked only when: authority is missing; scope, permissions or delegation would
   widen; an exception to a rule is needed; binding sources conflict unresolved; several
   materially different admissible options remain and no procedure delegates the choice; a
   previously unauthorised irreversible action is needed; a provided budget or back-edge is
   exhausted; or the rules give UNKNOWN rather than a definite result. A local choice already
   delegated to a role or a procedure needs no owner confirmation.
7. These permissions hold only within PROTO-DEC-0066 and end with its research run. They do not
   become a standing client profile and grant nothing beyond this scope.

Reasoning:
The research needs autonomous clients; the owner bounds them by a minimal tool set, a limited
working directory, a write scope and a stop on any diff outside it, instead of per-action
confirmations.

Alternatives rejected:
Option A of CB-21 as drafted (the flags as they were, repository root as working directory) and
option B as drafted (narrowed flags only, no scope stop).

Consequences:
Implementer's reading, not the owner's words, recorded in P-L3-004 and the launcher:
- vibe's minimal list is `read_file`, `grep`, `write_file`, `edit`, `powershell`, read from the
  installed vibe 2.25.5 tool classes; study B needs no web tool.
- copilot 1.0.88's `--help` lists `--no-ask-user` ("Disable the ask_user tool"), so it is used.
- copilot's path check cannot grant read-only access to a directory, so a working directory
  narrower than the repository would stop the researchers reading it. The explicitly limited
  working directory is therefore a disposable git worktree per job attempt under the system temp
  directory, the place PROTO-DEC-0047 item 7 names for broad grants. Every job runs there.
- The launcher copies back into the checkout only the job's outputs and its new journals. Any
  other change in the worktree, a moved HEAD or a new tag stops the job, and nothing is copied.

Approved by: RuslanFomenko (direct owner answer in chat, 2026-09-25, quoted in Context; transcribed by claude-c73232724159e5bd)

---

### PROTO-DEC-0071

Status: Accepted
Date: 2026-09-25
Reopen-trigger: owner-directive

Context:
One full `record` runs the validator and the regression suite. The implementer measured it on
2026-09-25, in session `claude-c73232724159e5bd`, on the owner's workstation (i9-13900HX, 32
threads, 31.7 GB):
- the validator takes about 3 s;
- the suite takes 302-322 s on 16 workers;
- three full suites at once took 445-450 s each, with the CPU at 100% for about three minutes.
Every researcher and synthesiser of the improvement research ended with a full `record`, and the
validator migration council adds more participants. Research participants change only their own
documents and journal, while the regression suite tests protocol code, which they do not touch.
The owner was asked whether research frames may record Evidence with `record --quick`.

Decision:
1. In a research or design cycle, researchers, synthesisers and the other participants of a
   council record their Evidence with `node .ai/bin/protocol-handoff.cjs record --quick`, which
   runs the validator only.
2. A full `record` (the validator and the regression suite) stays mandatory for any change to
   code, to the kernel or to protocol tooling.

Reasoning:
The suite proves properties of protocol code that a research frame cannot change. Concurrent full
suites each cost minutes of saturated CPU.

Alternatives rejected:
Keeping the full `record` for research frames.

Consequences:
The researcher and synthesiser prompts of the improvement research (A-research, B-research,
A-synthesis, B-synthesis) use `--quick`, and so do the prompts of the validator migration council.
The launch operator of K-launch is not a research participant and keeps the full `record`; this is
the transcriber's reading, not the owner's words.

Approved by: RuslanFomenko (direct owner answer in chat, 2026-09-25: chose "Да, для исследований" on the question "Разрешить исследовательским рамкам фиксировать Evidence через record --quick?", whose option read "Исследователи, синтезаторы и участники совета записывают Evidence через record --quick (только валидатор, ~3 с). Полный record остаётся обязательным для правок кода и ядра."; transcribed by claude-c73232724159e5bd)

---

### PROTO-DEC-0072

Status: Accepted
Date: 2026-09-25
Reopen-trigger: owner-directive

Context:
Open owner question В-24 (`docs/core-arch/CORE-ARCH-3.md` section 12; trial S2-T07 rows 7 and 8,
signal S-3) asks whether drafting or reviewing a kernel record that has not landed counts as a
"kernel change" for the T7 floor of P-L2-002 step 3. It came up again when the models of the
validator migration council were computed by P-L2-002. The owner answered in chat, quoted in full:

> Нет для чистого research/design/review frame, который создаёт только advisory research/review
> artifacts и не изменяет candidate kernel records, kernel code или protocol tooling. Такой frame не
> наследует T7 только потому, что его результат впоследствии может привести к изменению ядра.
> T7 применяется с момента, когда task непосредственно создаёт, изменяет или применяет candidate
> kernel record / kernel code / protocol tooling, а также всегда к certification.
> То есть floor определяется действием текущего task frame, а не downstream purpose. Review-only
> task автоматически kernel-change не считается; его tier определяется rubric, если отдельное
> правило не устанавливает более высокий floor.

Decision:
1. The T7 floor of P-L2-002 is set by what the current task frame does, not by the purpose its
   result may later serve.
2. A research, design or review frame that produces only advisory research or review artefacts,
   and does not change candidate kernel records, kernel code or protocol tooling, does not take the
   T7 floor merely because its result may later lead to a kernel change.
3. The T7 floor applies from the moment a task directly creates, changes or applies a candidate
   kernel record, kernel code or protocol tooling, and always to certification.
4. A review-only task is not a kernel change by itself. Its tier is set by the rubric, unless a
   separate rule sets a higher floor.

Reasoning:
The floor protects the kernel from under-powered changes. An advisory frame changes nothing that
the floor protects, and its result reaches the kernel only through a later task that takes the
floor itself.

Alternatives rejected:
Applying the T7 floor to every frame whose result may lead to a kernel change.

Consequences:
- В-24 is closed. The model table of the validator migration council
  (`docs/research/2026-09-25-validator-migration-council/README.md`) stands without the floor.
- The texts of P-L2-002 step 3 and CORE-ARCH-3 section 12 are aligned in the next stage-2 fix
  round. They are under review now, and the review candidate is not changed.
- Transcriber's reading, not the owner's words: the CORE-ARCH stage records under `docs/core-arch/`
  are candidate kernel records. A task that writes or edits them therefore takes the floor, and so
  does a task that changes the research launcher, since it is the `enforced_by` of P-L3-004.

Approved by: RuslanFomenko (direct owner answer in chat, 2026-09-25, quoted in Context; transcribed by claude-c73232724159e5bd)

### PROTO-DEC-0073

Status: Accepted
Date: 2026-09-25
Reopen-trigger: owner-directive

Context:
The round-3 dispatcher of the validator migration council (`tools/r3-dispatch.cjs`, commit
cd90be1) held its launch messages, model assignments, task file paths and output names inside its
code, as did the round-2 dispatcher. The owner rejected this in chat, quoted in full:

> И еще есть вопрос, детерминированный скрипт. Это что такое? Скрипт сам содержит промпт. Если это
> так, то это против логики самого проекта. Все скрипты и все инструкции должны быть на высоком
> уровне абстракции. Если он ссылается на файл, который вводится в чат, можно подумать. Типа,
> запусти файл и контролируй выполнение. Это одно дело. Но если он содержит захардкоженный файл
> внутри скрипта или промпт внутри скрипта, это непорядок, так не должно быть. Если этого нету в
> правилах репозитория, надо это записать.

No accepted block stated this rule before.

Decision:
1. Scripts and instructions stay at a high level of abstraction.
2. A script that dispatches, runs or controls agent work contains no prompt text, no task
   instruction and no task-specific file path in its code. It takes them from a file named when it
   is run (on its command line or in the chat that starts it): it runs that file and controls the
   execution.
3. A message a script sends to an agent is a pointer to a file ("Read and follow the file
   <path>"), and nothing more.
4. Knowledge of a client's command syntax (flags, the way a model or an effort is passed) is
   tooling, not task content, and may stay in the script.

Reasoning:
A prompt or a task path inside a script is a second, hidden copy of the task. It cannot be reviewed
with the task, and it silently drifts when the task files change.

Alternatives rejected:
Task-specific dispatch scripts with embedded launch messages, as in r2-dispatch.cjs and
r3-dispatch.cjs.

Consequences:
- `r3-dispatch.cjs` is replaced by a generic runner that reads a dispatch file. `r2-dispatch.cjs`
  stays as a record of round 2, which it already ran.
- Transcriber's reading, not the owner's words: the job table of
  `docs/research/2026-09-25-improvement-research/prompts/launch.cjs` holds models, routes and
  output paths in code. It moves to a file in the correction pass of package L.

Approved by: RuslanFomenko (direct owner answer in chat, 2026-09-25, quoted in Context; transcribed by claude-c73232724159e5bd)

### PROTO-DEC-0074

Status: Accepted
Date: 2026-09-25
Reopen-trigger: owner-directive

Context:
On 2026-09-25 the owner sent another agent a message on dispatch, roles and seniority. The other
agent answered, and the owner asked for a synthesis. The rule: record what all agree on, and send
doubts, forks and disagreements back with criteria. The synthesis is
`docs/core-arch/PROPOSAL-role-resolver-supervisor.md`. This block records its AGREED part. The
owner's words, quoted:

> агент получает из CLI одну строку Read and follow the file <файл запуска>; - отличная практика!
> [...] роли должны быть прописаны в файле, а модели подбираться динамически с 2-мя заместителями.
> [...] Но хардкодить модель на задачу - неправильно.
> Более того, надо переделать правило так, что самые старшие модели: пишут стратегические планы,
> дорожные карты, строят архитектуру, сертифицируют изменения архитектуры, делают синтезы повышеной
> ответственности, делают сертификации повышеной ответственности, пишут спецификации повышеной
> ответственности, пишут сложные куски кода, проводят аудит повышеной ответственности, сложные
> дебаги. Но не так чтобы это сложная часть работы напиши кода на 50$. Если будет точная спека этот
> код напишет даже рабочая лошадка. а если ошибется, среднячек его поправит, а если оба
> промахнуться, старшая модель подскажет, а если не понимают, исправит.
> [...] таймаут должен контролироваться через появление файла или запись файла. Необоснованное
> ожидание - это жизнь потраченая впустую.

Decision:
1. The CLI bootstrap of a dispatched agent stays one pointer line to a file (PROTO-DEC-0050 item 2,
   confirmed).
2. A task, a schedule or a dispatch file names a role, never a model. Steps and slots are named by
   role.
3. The model for a role is resolved when the step is launched: one primary and two substitutes.
4. Seniority follows uncertainty and the cost of an error, not the volume of work.
   - The most senior models are for:
     - strategic plans and roadmaps;
     - architecture, and certifying changes to it;
     - high-responsibility syntheses, certifications, specifications and audits;
     - hard pieces of code and hard debugging.
   - Implementation from a precise specification goes to a worker model. The escalation ladder is:
     a worker; then a middle model corrects it; then a senior model advises; then a senior model
     fixes it.
5. A step's timeout is judged by observable progress, a file appearing or being written, not by
   waiting a fixed time.

Reasoning:
A model name in a task goes stale as models change. Spending senior models on volume buys little
when a precise specification exists, while their judgement is worth most where an error is
expensive or the answer is uncertain. Waiting without a signal wastes the run.

Alternatives rejected:
A model hardcoded per task or slot; seniority by task size; fixed wall-clock timeouts.

Consequences:
- Not decided here; they stay FOR APPROVAL or FORK in the proposal:
  - the number and kind of automatic retries. PROTO-DEC-0050 item 2 (one restart) and
    R-L3-004.4-5 stand until the owner chooses;
  - the P-L2-002 rubric weights;
  - the hard ceiling;
  - the error classes;
  - the per-step cost cap.
- P-L2-002, the role catalogue and P-L3-004 are aligned in the next stage-2 fix round or the
  stage-4 dispatch script, whichever the owner schedules first. The records under review are not
  changed now.
- Transcriber's reading: "с 2-мя заместителями" is read as two substitute models, in addition to
  the primary.

Approved by: RuslanFomenko (direct owner answer in chat, 2026-09-25, quoted in Context; transcribed by claude-c73232724159e5bd)
