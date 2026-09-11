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

---

## Handoff carries evidence, not assertions

The protocol's first two rounds both produced journal entries whose central
claim nobody could check. "The suite passes" and "no implementation changed"
were prose, and the next agent had to take them on trust.

```powershell
node scripts/protocol-handoff.cjs record --owner <session-id>
node scripts/protocol-handoff.cjs verify
```

`record` runs the checks, writes their real exit codes into the session
journal, and stamps the entry with a digest of the exact tree they ran
against. It exits non-zero when a check fails, so a red tree cannot produce a
green receipt. `verify` recomputes the digest and fails when the tree has
moved, when the entry has no evidence, or when the evidence records a failure.

That is the difference between telling the next agent something and letting
them confirm it.

---

## The checks refuse to be green for a protocol that is not running

Validation used to pass when the installer was deleted, when every hook was
switched off by one settings key, and when a later negation pattern cancelled
the ignore rules that keep session state out of commits. Each of those now
fails with the reason, and each has a regression test. See DEC-0011.

---

## Connecting the protocol to a project

You need Git, Node.js 22 or later, and Windows PowerShell 5.1. Clone this
repository somewhere; it stays the source you install and upgrade from.

### A new project

```powershell
cd D:\path\to\Colabs
.\setup-ai-protocol.ps1 -Target D:\path\to\new-project -InitGit
cd D:\path\to\new-project
powershell -ExecutionPolicy Bypass -File .\validate-protocol.ps1
```

Two warnings are expected and correct: no decisions yet, no active task. Write
the first objective into `.ai/TASK.md`, then open the project in Claude Code.
The SessionStart hook loads the state and creates the session journal.

### An existing repository

Same command without `-InitGit`, because the repository already exists.

```powershell
.\setup-ai-protocol.ps1 -Target D:\path\to\existing-project
```

Nothing of yours is replaced. Verified against a project that already had its
own README, ignore rules, Claude permissions and a `PostToolUse` hook:

| Yours                       | What happens                                    |
| --------------------------- | ----------------------------------------------- |
| `README.md`, source, config | untouched; the protocol installs none of these   |
| `.gitignore`                | your rules kept, protocol rules appended below   |
| `.claude/settings.json`     | your permissions and hooks kept, two hooks added |
| line endings in your code   | not inspected; the protocol checks its own files |

The protocol does add `.gitattributes` and `.editorconfig` at the root. If your
repository already has either, review the result: those files change how Git
normalizes line endings for everything, not just for protocol files. The
previous versions are saved under `.ai/backups/`.

Review `git status` before committing. The install adds about 30 files.

### Upgrading a project later

```powershell
.\setup-ai-protocol.ps1 -Target D:\path\to\project -Verify
.\setup-ai-protocol.ps1 -Target D:\path\to\project -Force
```

`-Verify` changes nothing and reports what has drifted. `-Force` replaces the
managed tooling, keeps backups in `.ai/backups/`, and never touches the task,
plan, decisions, archive or journals your project has accumulated.

### The daily loop

```powershell
node scripts/protocol-lock.cjs acquire --owner <session-id>   # before editing TASK, PLAN, DECISIONS, ARCHIVE
node scripts/protocol-lock.cjs release --owner <session-id>
node scripts/protocol-handoff.cjs record --owner <session-id> # before handing off
node scripts/protocol-handoff.cjs verify                      # when picking work up
```

For Claude the session id and journal come from the hook. For other agents,
pick one id per session and use it for both the lock and the journal name.

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
as DEC-0001 through DEC-0011 in `.ai/DECISIONS.md`.
