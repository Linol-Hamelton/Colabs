# AI Collaboration Protocol - operator guide

This file is installed into every project that uses the protocol. It explains
how to run and maintain the protocol in that project. The rules themselves are
in `AGENTS.md`, which is the only place a rule is defined.

---

## What is installed

| Path                       | Purpose                                            |
| -------------------------- | -------------------------------------------------- |
| `AGENTS.md`                | the rules, shared by every agent                    |
| `CLAUDE.md`                | pointer so Claude Code loads those rules            |
| `.ai/docs/PROTOCOL.md`         | this guide                                          |
| `.ai/TASK.md`              | the current task and the open questions             |
| `.ai/PLAN.md`              | the proposed approach for larger work               |
| `.ai/DECISIONS.md`         | approved decisions, append-only                     |
| `.ai/worklog/`             | one journal per session, never shared               |
| `.ai/ARCHIVE.md`           | cold storage for old journal entries                |
| `.ai/runtime/`             | disposable session state and the lock, not tracked  |
| `.claude/`                 | hooks and settings that enforce the protocol        |
| `.codex/`                  | Codex hooks; see CODEX.md for activation            |
| `.ai/bin/protocol-hooks.cjs` | shared hook engine for Claude and Codex           |
| `.ai/bin/protocol-lock.cjs`| cooperative ownership of the shared documents       |
| `validate-protocol.ps1`    | health check                                        |
| `.ai/bin/protocol-handoff.cjs` | records and verifies protocol check evidence    |
| `.ai/bin/protocol-archive.cjs` | automated archiving and storage status tool     |

The installer, `test-protocol.ps1`, tests and templates stay in the protocol
source repository. They are not part of an installed project's daily commands.

---

## Daily commands

Check that the protocol is healthy. Run this before handing off.

```powershell
powershell -ExecutionPolicy Bypass -File .\validate-protocol.ps1
```

Run the host project's own test command for product changes. After changing
protocol tooling, run its regression suite from the protocol source repository:

```powershell
powershell -ExecutionPolicy Bypass -File .\test-protocol.ps1
```

Inspect who owns the shared documents right now.

```powershell
node .ai/bin/protocol-lock.cjs status
```

---

## Editing the shared documents

`.ai/TASK.md`, `.ai/PLAN.md`, `.ai/DECISIONS.md` and `.ai/ARCHIVE.md` have one
writer at a time. Take the lock first, edit, then release it.

```powershell
node .ai/bin/protocol-lock.cjs acquire --owner <your-session-id>
node .ai/bin/protocol-lock.cjs release --owner <your-session-id>
```

For long-lived supervisor processes, pass `--session-pid <pid>`. A supervisor PID can
be registered at session start via `protocol-session.cjs start --supervisor-pid <pid>`
(accepts any live integer PID > 4; registration protects the session's empty journal and
snapshot from premature pruning by external orchestrators, functioning as an anti-accident
guard). The lock command accepts `--session-pid <pid>` when it matches `process.pid`,
`process.ppid`, or the registered supervisor/session PID authenticated with
`--session-token <token>`. Reserved system PIDs (`pid <= 4`) and unaffiliated PIDs are
rejected. The session token is an anti-accident barrier (preventing accidental PID
collision and lock squatting in cooperative environments, not an anti-adversary barrier
against local filesystem access). Clearing an abandoned lock from a confirmed dead
process uses `clear-lock` or `acquire --force`. Forcefully clearing a live registered
lock requires `--force` and `--reason "<explanation>"` with an audit record.

A session journal needs no lock. Each session writes only its own file.

If `acquire` reports another owner, do not steal the lock. Run `status` and
look at `stale` and `heldForMinutes`. Age means the lock needs checking, not
that it may be taken: a slow live holder looks the same as a dead one. Once you
have confirmed the session is over, release it with the same
owner name, which is the documented recovery path:

```powershell
node .ai/bin/protocol-lock.cjs release --owner <the-reported-owner>
```

Releasing someone else's live lock loses their work. Check that the session is
really over first.

---

## Session journals

Each session writes exactly one file in `.ai/worklog/`. No session writes to
another session's file, so two agents can never overwrite each other.

With active Claude/Codex hooks, SessionStart creates the journal and prints its
name. Use its basename without `.md` as the lock and evidence owner. Without
active hooks, choose one session id for both. Keep an existing journal if hooks
are configured midway through the session. See [Codex activation](CODEX.md).

`README.md` in that directory is not a journal; it explains the convention.

An entry needs all five labels, or the Stop hook will not count it:

```markdown
## YYYY-MM-DD - short title

Agent:

Action:

Result:

Next step:

Open:
```

---

## Handing off with evidence

A journal entry is a claim. An Evidence block is a record. Before handing off,
let the tooling write the record instead of typing it:

```powershell
node .ai/bin/protocol-handoff.cjs record --owner <your-session-id>
```

In an installed project it runs the validator. In the protocol source repository
it also runs the protocol regression suite. It writes the actual exit codes
into your journal and records a digest of the tree. Product tests must be run
separately and described in the journal; protocol evidence does not certify
them. A failing protocol check makes `record` fail. Use `--quick` to run only
the validator while iterating in the source repository.

The next agent, or you after a break, confirms it:

```powershell
node .ai/bin/protocol-handoff.cjs verify
```

Without a target this asks whether any journal holds evidence for the current
tree; if none matches, it reports each recorded mismatch. Add `--owner <session-id>` to judge
one journal on its own. It fails when no evidence matches the current tree, or
when the matching evidence records a failing check. `node .ai/bin/protocol-handoff.cjs state` prints the current anchor
without running anything.

The digest covers Git-normalized content and mode. Clean files reuse their
index identity; changed files use Git's path-specific normalization and mode
rules. Evidence therefore survives staging and committing unchanged work,
including CRLF files in Windows projects. Session journals and runtime state
are excluded, so writing the evidence does not invalidate it.

Digest format 4 is current. Evidence recorded under an earlier format remains
in the journals but is reported as not comparable rather than stale; run
`record` again to refresh it.

The block carries a hash of the entry with the block removed, so rewriting the
entry afterwards makes `verify` fail. Authenticated receipts carry `- entry hash format: 2`
covering certified Evidence metadata. Receipts lacking this marker are classified as legacy
unauthenticated receipts: legacy unauthenticated receipts are editable and not tamper-evident;
`- entry hash format: 2` is the only authenticated format; upgrade by recording a new entry.
`verify --owner <id>` fails closed unless `--allow-legacy` is passed
for read-only review, and no-owner `verify` excludes legacy receipts from matching handoffs.
`doctor` reports the legacy count and exits 0. To upgrade a journal to format 2, record a
new entry with `record`; historical entries are never rewritten. Never hand-write an Evidence
block: a hand-written one is a claim again, and its entry hash will not match.

If an entry was edited after certification to redact an accidental secret or token,
refresh its entry hash legitimately with:

```powershell
node .ai/bin/protocol-handoff.cjs rehash --owner <session-id> --reason "<explanation>"
```

It updates the entry hash and stamps a `- sanitized:` marker.

If a lock operation is interrupted, `acquire` says so and names the recovery:

```powershell
node .ai/bin/protocol-lock.cjs clear-operation
```

It refuses while the process that made the gate is still running.

```powershell
node .ai/bin/protocol-session.cjs prune
```

moves empty journals left by idle sessions into `.ai/runtime/pruned/` quarantine
instead of deleting them permanently. An active live session (evaluated supervisor-first,
falling through to the transient process PID) or active lock holder is never pruned,
even with `--force`. If the session state is present but liveness cannot be verified (for
example a foreign host), the journal is preserved during standard runs and quarantined
only under `--force` with an explicit audit warning. If the state file is missing or
unreadable, the empty journal is treated as unknown liveness and falls back to the
recency window; once it is older than `RECENT_WINDOW` it is quarantined. Content-bearing
journals are always protected by `holdsContent` and never quarantined.

Automatic archiving runs on `stop` and `record` whenever a journal exceeds 150 lines,
moving older entries into `.ai/ARCHIVE.md` while keeping the newest entry. During
`record`, the final line count is computed with the fresh Evidence block *before*
writing; if the projected journal exceeds 150 lines, older entries are auto-archived
first. If the single newest entry plus preamble and fresh Evidence still exceeds 150
lines, `record` exits non-zero with an actionable error and leaves the journal unmodified,
guaranteeing that `record` never produces an invalid journal over 150 lines.

The 30-journal cap is evaluated across the Git index (`git ls-files --cached --others --exclude-standard`).
Decommissioning a session journal is a three-step procedure:
1. `node .ai/bin/protocol-archive.cjs worklog <path> --keep 0` (move all entries to `.ai/ARCHIVE.md`)
2. `node .ai/bin/protocol-session.cjs prune` (quarantine the empty journal)
3. `git add -A -- <removed-path>` (stage the removal in the index, keeping the index count <= 30)

If the emptied journal is still inside `RECENT_WINDOW`, `prune` defers it (recent empty journals are preserved); for a deliberate removal of a journal you have just emptied, run `prune --force`, which overrides the recency window for empty, non-live journals.

When a second batch is archived into an existing `.ai/ARCHIVE.md`, the boundary entry's canonicalized body must hash-match its `- entry:` label. This boundary canonicalization deviation was resolved and is pinned by `tests/archive.test.cjs` ("P5-F2: second batch boundary in ARCHIVE.md remains valid across archive batches and verify --deep"). For historical context and proofs, see `docs/reviews/2026-09-18-deepseek-flash-p5-gate-review.md`.

### Review modes and capability model

Reviews under `docs/reviews/` operate in one of two modes:
- **CERTIFYING**: Requires four orchestrator-verified capabilities: `FS_WRITE`, `SHELL_EXEC`, `EVIDENCE_SIGN`, and `REPO_READ`. The review header declares `Mode: CERTIFYING` and identifies its session via `Receipt-Owner: <owner-id>` (or legacy `Session:`). The reviewer binds its verdict by recording verifiable handoff evidence in its session journal mentioning the review document path.
- **ADVISORY**: Applied whenever any capability is absent (e.g. read-only models, chat panels, or external audits). Advisory reviews carry `Mode: ADVISORY` (or `[MODE: READ-ONLY ADVISORY]`), are persisted via the section 5.5 chat transcription fallback, and are explicitly marked non-certifying. An advisory review cannot satisfy the independent-review completion gate.

### Gate freshness check

When a task is marked `Status: Completed`, `node .ai/bin/protocol-handoff.cjs gate-check` (invoked by `validate-protocol.ps1` in `role: source`) enforces that the completion gate's independent review is genuinely bound to a verified session:
- **Binding rule**: The review header specifies `Receipt-Owner: <owner-id>` (or `Session:`). That owner's journal (`.ai/worklog/<owner-id>.md`) must contain a dated entry explicitly mentioning the cited review path (normalized forward slashes), and that entry's Evidence block must verify against the current tree via deep receipt check (`verify --deep`).
- **Legacy cutoff (`2026-09-19`)**: Legacy grandfathering applies strictly to reviews with a valid, present `Date <= 2026-09-19`; omitting `Mode` or `Receipt-Owner` emits a warning (`[WARN]`) rather than failing validation, provided their evidence verifies. Reviews dated after `2026-09-19` strictly require `Mode: CERTIFYING` and `Receipt-Owner`. A missing or invalid `Date` fails the gate immediately.
- **Installed role**: In `role: installed`, `gate-check` is skipped by the validator because consumer repositories do not retain protocol session journals.
- **Empty Receipt field**: The `Receipt:` field in the review header is optional and informational; an empty or omitted field passes verification.

### Decision registry

The repository maintains an append-only decision ledger at `docs/decisions/REGISTRY.md` mapping every decision ID to its current lifecycle status (`accepted`, `frozen`, `reopened`, `superseded`), reopen trigger, freeze commit, supersedes link, and evidence reference:
- **Format and status**: The table follows `| id | status | reopen-trigger | frozen-at | supersedes | evidence |`. The effective status of any decision ID is strictly its last appended row. Existing rows are never modified or removed.
- **Trigger taxonomy**: Reopening an accepted decision strictly requires an appended row with an authorized reopen-trigger: `invariant-broken`, `metric-drop`, `new-external-data`, `security-finding`, `owner-directive`, or `higher-source-contradiction` (or `none` for standard acceptance).
- **WARN-first validation**: In `role: source`, `validate-protocol.ps1` runs non-blocking checks emitting warnings (`[WARN]`):
  1. Missing registry (`docs/decisions/REGISTRY.md`).
  2. Incomplete coverage (missing registry entries for IDs in `.ai/DECISIONS.md`, or unrecognized IDs in the registry).
  3. Immutability violation (modifications or deletions of existing rows relative to `HEAD:docs/decisions/REGISTRY.md`).
  4. New decision block without `Reopen-trigger:` (any new decision ID present in working copy `.ai/DECISIONS.md` but not in `HEAD` must declare `Reopen-trigger:`).
- **Shared-document lock**: Modifications to `docs/decisions/REGISTRY.md` are covered by the shared-document lock protocol (`protocol-lock.cjs`).

---

## Installing and upgrading

Run installation and upgrade commands from the protocol source repository;
the installed project deliberately has no installer. For a new project:

```powershell
powershell -ExecutionPolicy Bypass -File .\setup-ai-protocol.ps1 -Target D:\my-project -InitGit
```

For an existing Git repository use the same command without `-InitGit`. Then
open that repository in your agent, follow [Codex hook activation](CODEX.md)
when applicable, and fill `.ai/TASK.md` with the first product objective.

If `AGENTS.md` already holds project-specific rules, normal installation keeps
it. Reconcile those rules with the protocol before using `-Force`; managed
files are replaced on upgrade, with backups. Review `git diff` after installing.

Report what has drifted from the canonical version without changing anything:

```powershell
.\setup-ai-protocol.ps1 -Target D:\my-project -Verify
```

Upgrade the managed tooling, keeping the project's own `.ai` state:

```powershell
.\setup-ai-protocol.ps1 -Target D:\my-project -Force
```

`-Force` replaces managed files and keeps backups. It never resets populated
`.ai` state and never discards unrelated project configuration.

---

## What the hooks cost

SessionStart runs once per session. Stop runs after every response, so its cost
is paid continuously and is the one that matters.

Both ask Git what changed and read only those files. A clean tracked file is
identified by the blob hash already in the Git index and is never opened. On a
five-thousand-file repository the Stop hook takes about a third of a second,
nearly all of it Git's own calls. On a repository of 558 files holding 118 MB
the snapshot takes about 120 ms and opens one file.

If a session feels slow, measure before assuming:

```
node .ai/bin/protocol-handoff.cjs state
```

It prints the file count and the digest without running any checks.

---

## Encoding

Every `.ps1` file is ASCII-only. Windows PowerShell 5.1 reads a file with no
byte order mark as the system ANSI codepage, so a non-ASCII character in a
script is silently corrupted, and a script that writes files spreads that
corruption. All other text is UTF-8 without a byte order mark, with LF
endings. `validate-protocol.ps1` enforces both.

---

## When something is wrong

| Symptom                                   | Where to look                          |
| ----------------------------------------- | -------------------------------------- |
| validator reports a failure               | the named file; fix, then rerun         |
| installer refuses to run                  | a missing source file in the manifest   |
| `acquire` reports another owner           | `status`, then the recovery path above  |
| Stop hook keeps asking for an entry       | the entry is missing one of five labels |
| hook says no snapshot for this session    | start or resume the session in this checkout |
