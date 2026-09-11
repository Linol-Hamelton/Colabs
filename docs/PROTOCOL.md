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
| `scripts/protocol-lock.cjs`| cooperative ownership of the shared documents       |
| `validate-protocol.ps1`    | health check                                        |
| `test-protocol.ps1`        | regression suite for the protocol tooling           |

---

## Daily commands

Check that the protocol is healthy. Run this before handing off.

```powershell
powershell -ExecutionPolicy Bypass -File .\validate-protocol.ps1
```

Run the regression suite for the tooling itself. Needed after changing a hook,
the installer, the validator or the lock.

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

For Claude the SessionStart hook creates the file and prints its name in the
injected context. For other agents the name is the session id chosen when
taking the lock.

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

It runs the validator and the regression suite, writes their real exit codes
into the newest entry of your journal, and stamps that entry with a digest of
the exact tree they ran against. It exits non-zero when a check fails, so a
failing tree cannot produce a passing receipt. Use `--quick` to run only the
validator while iterating.

The next agent, or you after a break, confirms it:

```powershell
node scripts/protocol-handoff.cjs verify
```

Without a target this asks whether any journal holds evidence for the tree as
it is now, and names the ones that do not. Add `--owner <session-id>` to judge
one journal on its own. It fails when no evidence matches the current tree, or
when the matching evidence records a failing check. `node scripts/protocol-handoff.cjs state` prints the current anchor
without running anything.

The digest covers file content and mode, never the Git index, so evidence
recorded before `git add` still verifies afterwards. Session journals and
runtime state are excluded, so writing the evidence does not invalidate it.

Never hand-write an Evidence block. A hand-written one is a claim again.

---

## Installing and upgrading

Install into a new project from the protocol repository:

```powershell
.\setup-ai-protocol.ps1 -Target D:\my-project -InitGit
```

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
