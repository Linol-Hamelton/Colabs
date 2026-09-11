# AI Collaboration Protocol

A file-based protocol that lets several AI coding assistants work on the same
repository without sharing chat history. GPT/Codex, Claude, and any other agent
coordinate through the filesystem, which is the only channel all of them see.

This repository is the protocol home. Install it into a project from here.

---

## What it is

Agents do not remember each other's conversations. Anything that must survive a
session has to be written down. The protocol defines where.

| File                      | Holds                                            |
| ------------------------- | ------------------------------------------------ |
| `AGENTS.md`               | the rules; the only place a rule is defined      |
| `CLAUDE.md`               | a pointer so Claude Code loads those rules       |
| `docs/PROTOCOL.md`        | the operator guide installed into every project  |
| `.ai/TASK.md`             | the current task and the open questions          |
| `.ai/PLAN.md`             | the proposed approach for larger work            |
| `.ai/DECISIONS.md`        | approved decisions; append-only, never rewritten |
| `.ai/worklog/`            | one journal per session, so writers never collide|
| `.ai/ARCHIVE.md`          | cold storage for old journal entries             |
| `.ai/runtime/`            | disposable session state and the lock, untracked |

Two rules carry most of the weight. A proposal by an agent is not a decision: a
decision exists only when it carries a human name under `Approved by:`. And a
written decision block is never edited again, not even its status, so the log
can be trusted without reading the diff history.

---

## Install into a project

```powershell
.\setup-ai-protocol.ps1 -Target D:\my-project -InitGit
```

Existing files are kept and `.gitignore` is merged, so the project's own
entries survive. Upgrade the managed tooling later with `-Force`, which keeps
backups and never resets populated `.ai` state.

Report what has drifted from the canonical version, changing nothing:

```powershell
.\setup-ai-protocol.ps1 -Target D:\my-project -Verify
```

Running it with no arguments is a read-only self-check of this checkout.

---

## Checks

```powershell
powershell -ExecutionPolicy Bypass -File .\validate-protocol.ps1
powershell -ExecutionPolicy Bypass -File .\test-protocol.ps1
```

The validator checks what prose cannot: required files, byte order marks,
non-ASCII bytes in PowerShell scripts, CRLF in shell scripts, invalid UTF-8,
PowerShell and shell and JavaScript syntax, the size limits from section 8 of
`AGENTS.md`, a real Git working tree, hook wiring, and that the installer can
still run. That last check exists because the installer once could not run at
all while validation still reported the repository healthy.

The suite is a regression test for the tooling itself. Run it after changing a
hook, the installer, the validator or the lock. It needs Node.js 22 or later.

---

## What actually enforces the protocol

Documents do not enforce themselves. Two Claude Code hooks do.

- **SessionStart** injects the task, Git status, recent commits, the decision
  headings and the newest journal entries, and names the journal file for this
  session. The injection is bounded, so it is a starting point, not a
  substitute for reading.
- **Stop** compares a content snapshot taken at session start against the tree
  now. When files changed and the session journal has no new complete entry,
  it says so. It warns and never blocks, because a hook that blocks gets
  disabled and a disabled hook enforces nothing.

Both are wired in `.claude/settings.json` and stay silent where Git, Node or
the wrapper script is unavailable.

Codex does not read `.claude/`. Its compliance rests on `AGENTS.md` alone,
which is the protocol's remaining asymmetry.

---

## Shared documents have one writer

`.ai/TASK.md`, `.ai/PLAN.md`, `.ai/DECISIONS.md` and `.ai/ARCHIVE.md` are
edited under a cooperative lock. Session journals need no lock, because no
session writes to another session's file.

```powershell
node scripts/protocol-lock.cjs status
node scripts/protocol-lock.cjs acquire --owner <your-session-id>
node scripts/protocol-lock.cjs release --owner <your-session-id>
```

The lock is cooperative, not an operating system barrier. It reports how long
it has been held and whether it is past the stale threshold, and it never
steals a lock on its own.

---

## Encoding

Windows PowerShell 5.1 reads a `.ps1` file with no byte order mark as the
system ANSI codepage. Protocol v0.1 was stored that way, so the arrows in one
document were read as cp1251 and written back as UTF-8, and the installer
corrupted its own output on every run.

Every `.ps1` file here is ASCII-only, which makes that failure impossible
rather than merely documented. The validator enforces it. See DEC-0001.

---

## History

Commit `ae5e831` holds protocol v0.1 exactly as it was generated, corruption
included. Everything since, and the reasoning behind each change, is recorded
as DEC-0001 through DEC-0010 in `.ai/DECISIONS.md`.
