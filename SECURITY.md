# Security

## Scope

This protocol installs hooks that run on your machine whenever an agent starts
or finishes a session, plus scripts that read and write files in the project.
It runs no network requests of its own and sends nothing anywhere.

## Reporting

Report a suspected vulnerability privately through GitHub's security advisory
form on this repository rather than opening a public issue. Include the commit,
the platform, and the smallest reproduction you have.

## What to check before adopting it

- The hooks execute `.ai/bin/protocol-hooks.cjs` from your checkout. Read it.
  A hook runs with your permissions every session.
- `.claude/settings.json` and `.codex/hooks.json` are merged into whatever you
  already have. Review the diff; the protocol's entries are the only ones it
  adds.
- Codex will not run project hooks until you trust them in the host. That step
  is yours, and the installer cannot take it for you.
- Nothing in `.ai/runtime/` is trusted input. It is session scratch space and
  is excluded from Git.

## Secrets

The protocol never reads credentials and stores none. `.gitignore` gains rules
for `.env`, key and certificate files so that session tooling does not commit
them by accident. That is a convenience, not a guarantee: review `git status`
before you commit, as you would anyway.
