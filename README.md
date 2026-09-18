# AI Collaboration Protocol

A file-based protocol that lets several AI coding assistants work on the same
repository without sharing chat history. GPT/Codex, Claude, and any other agent
coordinate through the filesystem, which is the only channel all of them see.

This repository is the protocol home. Install it into a project from here.
See [QUICKSTART.md](QUICKSTART.md) for the 1-page onboarding and quick reference guide.

---

## What it is

Agents do not remember each other's conversations. Anything that must survive a
session has to be written down. The protocol defines where.

| File                      | Holds                                            |
| ------------------------- | ------------------------------------------------ |
| `AGENTS.md`               | the rules; the only place a rule is defined      |
| `QUICKSTART.md`           | 1-page onboarding guide and runbook              |
| `CLAUDE.md`               | a pointer so Claude Code loads those rules       |
| `.ai/docs/PROTOCOL.md`    | the operator guide installed into every project  |
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

## Handoff carries evidence, not assertions

The protocol's first two rounds both produced journal entries whose central
claim nobody could check. "The suite passes" and "no implementation changed"
were prose, and the next agent had to take them on trust.

```powershell
node .ai/bin/protocol-handoff.cjs record --owner <session-id>
node .ai/bin/protocol-handoff.cjs verify
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

You need Git for Windows (including Git Bash), Node.js 22 or later, and Windows
PowerShell 5.1. Clone this repository somewhere; it stays the source you install
and upgrade from.

### A new project

```powershell
cd D:\path\to\Colabs
powershell -ExecutionPolicy Bypass -File .\setup-ai-protocol.ps1 -Target D:\path\to\new-project -InitGit
cd D:\path\to\new-project
powershell -ExecutionPolicy Bypass -File .\validate-protocol.ps1
```

Two warnings are expected and correct: no decisions yet, no active task. Write
the first objective into `.ai/TASK.md`, then open the project in Claude Code
or Codex. For Codex, review and trust the project hooks in `/hooks` first;
see [activation](.ai/docs/CODEX.md). An active SessionStart hook loads the state
and creates the session journal.

### An existing repository

Same command without `-InitGit`, because the repository already exists.

```powershell
powershell -ExecutionPolicy Bypass -File .\setup-ai-protocol.ps1 -Target D:\path\to\existing-project
```

Existing files are kept on a normal install; integration files merge the
protocol settings. If a managed path such as `AGENTS.md` already contains your
own rules, inspect the reported drift and reconcile those rules before using
`-Force`, which replaces managed files. Verified against a project that
already had its own README, ignore rules, Claude permissions and a
`PostToolUse` hook:

| Yours                       | What happens                                      |
| --------------------------- | ------------------------------------------------- |
| `README.md`, source, config | untouched; the protocol installs none of these     |
| `.gitignore`                | your rules kept, protocol rules appended below     |
| `.claude/settings.json`     | your permissions and hooks kept, two hooks added   |
| `.codex/hooks.json`         | merged the same way                                |
| `.codex/config.toml`        | never written; approval policy is your decision    |
| `.editorconfig`             | never written; indentation is your decision        |
| `.gitattributes`            | a scoped block naming protocol paths only          |
| line endings in your code   | not inspected; the protocol checks its own files   |

The protocol configures its own hooks and nothing else. It installs the rules,
the host adapters, the shared hook engine, the lock, the handoff tool, the
operator CLI and the validator. The installer, this test suite and the templates stay
in this repository, because a product repository cannot use them.

Review `git status` before committing.

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
node .ai/bin/protocol-lock.cjs acquire --owner <session-id>   # before editing TASK, PLAN, DECISIONS, ARCHIVE
node .ai/bin/protocol-lock.cjs release --owner <session-id>
node .ai/bin/protocol-handoff.cjs record --owner <session-id> # before handing off
node .ai/bin/protocol-handoff.cjs verify                      # when picking work up
```

### Operator CLI

```powershell
node .ai/bin/protocol.cjs doctor      # full diagnostic health check
node .ai/bin/protocol.cjs status      # inspect lock status and document limits
node .ai/bin/protocol.cjs clean       # clean empty journals and stale runtime state
node .ai/bin/protocol.cjs telemetry   # view collaboration metrics and agent activity
```

With active Claude/Codex hooks, use the assigned journal basename (without
`.md`) as the lock and evidence owner. Otherwise pick one session id and use
it for both. See [Codex setup](.ai/docs/CODEX.md) for the host activation step.

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

Claude and Codex each register SessionStart and Stop hooks using one shared
engine in `.ai/bin/protocol-hooks.cjs`.

- **SessionStart** injects the task, Git status, recent commits, the decision
  headings and the newest journal entries, and names the journal file for this
  session. The injection is bounded, so it is a starting point, not a
  substitute for reading.
- **Stop** compares a content snapshot taken at session start against the tree
  now. When files changed and the session journal has no new complete entry,
  it says so. It warns and never blocks, because a hook that blocks gets
  disabled and a disabled hook enforces nothing.

Claude registers them in `.claude/settings.json`; Codex uses
`.codex/hooks.json`. Each product gets its own session journal and snapshot.
Codex hooks require a trusted project and review of the exact definitions in
`/hooks`; see [activation and validation limits](.ai/docs/CODEX.md). Until activated,
Codex follows `AGENTS.md` without automatic reminders. Repository checks verify
the configured adapter, not the client trust store.

---

## Shared documents have one writer

`.ai/TASK.md`, `.ai/PLAN.md`, `.ai/DECISIONS.md` and `.ai/ARCHIVE.md` are
edited under a cooperative lock. Session journals need no lock, because no
session writes to another session's file.

```powershell
node .ai/bin/protocol-lock.cjs status
node .ai/bin/protocol-lock.cjs acquire --owner <your-session-id>
node .ai/bin/protocol-lock.cjs release --owner <your-session-id>
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

## Licence, contributing, security

MIT, in `LICENSE`. The choice is recorded as DEC-0014 and is still marked
Proposed: an agent may not pick a licence for the repository owner.

`CONTRIBUTING.md` covers the working loop and where a new protocol file belongs
in the manifest. `SECURITY.md` covers what the hooks execute on your machine and
what to check before adopting the protocol.

---

## History

Commit `ae5e831` holds protocol v0.1 exactly as it was generated, corruption
included. Everything since, and the reasoning behind each change, is recorded
in `.ai/DECISIONS.md` and the per-session journals in `.ai/worklog/`.
