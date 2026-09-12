# Contributing

This repository is the source of the AI collaboration protocol. Projects
install from it; they do not carry the installer or this test suite.

## Before you change anything

Read `AGENTS.md`. It binds contributors and AI agents alike. The two rules that
matter most here: a proposal is not a decision until it carries a human name
under `Approved by:` in `.ai/DECISIONS.md`, and a written decision block is
never edited again.

## The loop

```powershell
powershell -ExecutionPolicy Bypass -File .\validate-protocol.ps1
powershell -ExecutionPolicy Bypass -File .\test-protocol.ps1
node scripts/protocol-handoff.cjs record --owner <your-session-id>
```

The validator must exit 0 and the suite must pass before you hand off. The
handoff command writes the real exit codes into your session journal, anchored
to a digest of the tree they ran against. Do not write an Evidence block by
hand; a hand-written one is a claim, not a record.

## Adding a file to the protocol

Add it to `protocol-manifest.json`. That file is the only definition of what
the protocol owns, and tests fail if it and the working tree disagree. Choose
the list deliberately:

| List          | Meaning                                                     |
| ------------- | ----------------------------------------------------------- |
| `managed`     | installed into every project; keep this set small            |
| `source`      | stays here; a product repository cannot use it               |
| `tests`       | the protocol's own regression suite                          |
| `integration` | merged into what a project already has, never replaced       |
| `state`       | created once per project from `templates/ai/`                |

## What the protocol may not do to a host project

Configure its own hooks and nothing else. It does not set line endings for a
project's own source, indentation for its editors, or approval and sandbox
policy for its agents. Every rule it enforces applies to files it owns.

## Style

Every `.ps1` file is ASCII-only. Windows PowerShell 5.1 reads a file without a
byte order mark as the system ANSI codepage, so a non-ASCII character in a
script is silently corrupted. All other text is UTF-8 without a byte order
mark, with LF endings. The validator enforces both.

## Reporting a problem

Open an issue with the output of both checks and the commit you ran them on.
For anything security-related, see `SECURITY.md` instead.
