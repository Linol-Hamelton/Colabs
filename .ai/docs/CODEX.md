# Codex project integration

The project `.codex/` configures this repository. The user-level Codex home
holds personal settings, plugins, credentials and session data separately.
`AGENTS.md` is the shared instruction file; `.ai/` holds project state for both
agents. Neither is duplicated in `.codex/`.

## What is configured

- `.codex/hooks.json`: SessionStart and Stop command registrations.
- `.codex/hooks/protocol.cjs`: a thin Codex entrypoint for the shared engine
  in `.ai/bin/protocol-hooks.cjs`. Claude uses that same engine.

The protocol installer does not create or modify `.codex/config.toml`. This
source repository has its own local defaults there; installed projects keep
their existing user/project model, permissions, sandbox and plugin settings.

SessionStart loads bounded project context and creates a journal named
`.ai/worklog/codex-<session-hash>.md`. Stop warns when files changed without a
new complete journal entry. It never blocks or launches the test suite.
Resume and compaction preserve outstanding changes. Claude and Codex get
different snapshots and journals even if their session IDs happen to match.

Use the journal basename (without `.md`) as the lock owner and evidence owner.
If this session began before hooks were configured, keep its existing journal
name; do not create a second journal for that session.

The command resolves its script from the active Git root and works from a
subdirectory or linked worktree. On Windows it runs in PowerShell directly;
the Codex adapter itself does not require Bash. The full protocol checks still
require Git Bash to test the Claude adapter.

## First activation

Open the repository as a trusted Codex project. In the CLI, use `/hooks` to
review and trust the two definitions, then start or resume a session. Codex
tracks trust against the exact hook definition; edited definitions need review
again. Project hooks are skipped in an untrusted project. This is a host trust
step, not something the installer grants on the user's behalf.

Confirm that SessionStart creates `.ai/worklog/codex-...md` and the matching
snapshot under `.ai/runtime/`; the injected context names that journal.
`validate-protocol.ps1` checks repository wiring and syntax, and the regression
suite executes the adapters and the configured commands in isolated fixtures.
Neither proves that a particular running Codex client has trusted these hooks.

See the official [Codex configuration guide](https://learn.chatgpt.com/docs/config-file/config-basic)
and [hook contract](https://learn.chatgpt.com/docs/hooks).

## Installation and local preferences

The installer merges protocol hooks into `.codex/hooks.json`, keeping unrelated
hooks. `.codex/config.toml` is neither installed nor required by Verify.
Existing configuration is kept byte-for-byte, including with `-Force`.
Host config syntax is the Codex client's concern.

Both agents' hook settings and managed text blocks are prepared before any
target writes. Invalid JSON, hook-group structure or managed block markers fail
before a partial upgrade can occur. This is not full host configuration validation.
This preflight does not promise a filesystem transaction for disk or I/O errors.

## Local Claude practices considered

The inspected machine-level Claude settings favor deliberate reasoning and
contain accumulated command permissions plus a Playwright plugin. The Codex
user configuration already specifies its own model and reasoning effort, so
project defaults inherit them. Playwright is useful for a web product task;
this protocol does not need it. Machine-specific permissions and directories
are not portable project defaults.

The reused practices are the project's bounded startup context, per-session
journals, content snapshots and nonblocking handoff reminders. No user-home
configuration, credentials or plugin installation is part of this change.
