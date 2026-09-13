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
| `docs/PROTOCOL.md`         | this guide                                          |
| `.ai/TASK.md`              | the current task and the open questions             |
| `.ai/PLAN.md`              | the proposed approach for larger work               |
| `.ai/DECISIONS.md`         | approved decisions, append-only                     |
| `.ai/worklog/`             | one journal per session, never shared               |
| `.ai/ARCHIVE.md`           | cold storage for old journal entries                |
| `.ai/runtime/`             | disposable session state and the lock, not tracked  |
| `.claude/`                 | hooks and settings that enforce the protocol        |
| `.codex/`                  | Codex hooks; see CODEX.md for activation            |
| `scripts/protocol-hooks.cjs` | shared hook engine for Claude and Codex           |
| `scripts/protocol-lock.cjs`| cooperative ownership of the shared documents       |
| `validate-protocol.ps1`    | health check                                        |
| `scripts/protocol-handoff.cjs` | records and verifies protocol check evidence    |

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
node scripts/protocol-lock.cjs status
```

---

## Editing the shared documents

`.ai/TASK.md`, `.ai/PLAN.md`, `.ai/DECISIONS.md` and `.ai/ARCHIVE.md` have one
writer at a time. Take the lock first, edit, then release it.

```powershell
node scripts/protocol-lock.cjs acquire --owner <your-session-id>
node scripts/protocol-lock.cjs release --owner <your-session-id>
```

A session journal needs no lock. Each session writes only its own file.

If `acquire` reports another owner, do not steal the lock. Run `status` and
look at `stale` and `heldForMinutes`. Age means the lock needs checking, not
that it may be taken: a slow live holder looks the same as a dead one. Once you
have confirmed the session is over, release it with the same
owner name, which is the documented recovery path:

```powershell
node scripts/protocol-lock.cjs release --owner <the-reported-owner>
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
node scripts/protocol-handoff.cjs record --owner <your-session-id>
```

In an installed project it runs the validator. In the protocol source repository
it also runs the protocol regression suite. It writes the actual exit codes
into your journal and records a digest of the tree. Product tests must be run
separately and described in the journal; protocol evidence does not certify
them. A failing protocol check makes `record` fail. Use `--quick` to run only
the validator while iterating in the source repository.

The next agent, or you after a break, confirms it:

```powershell
node scripts/protocol-handoff.cjs verify
```

Without a target this asks whether any journal holds evidence for the current
tree; if none matches, it reports each recorded mismatch. Add `--owner <session-id>` to judge
one journal on its own. It fails when no evidence matches the current tree, or
when the matching evidence records a failing check. `node scripts/protocol-handoff.cjs state` prints the current anchor
without running anything.

The digest covers file content and mode, never the Git index, so evidence
recorded before `git add` still verifies afterwards. Session journals and
runtime state are excluded, so writing the evidence does not invalidate it.

Never hand-write an Evidence block. A hand-written one is a claim again.

---

## Installing and upgrading

Run installation and upgrade commands from the protocol source repository;
the installed project deliberately has no installer. For a new project:

```powershell
.\setup-ai-protocol.ps1 -Target D:\my-project -InitGit
```

For an existing Git repository use the same command without `-InitGit`. Then
open that repository in your agent, follow [Codex hook activation](CODEX.md)
when applicable, and fill `.ai/TASK.md` with the first product objective.

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
node scripts/protocol-handoff.cjs state
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
