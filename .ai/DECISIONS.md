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
