# Session journals

One file per session lives here. No session writes to another session's file,
so two agents can never overwrite each other and no lock is needed.

For Claude the SessionStart hook creates the file and prints its name in the
injected context. For other agents the name is the session id used to take the
shared-document lock.

This README is not a journal. Every other `.md` in this directory is one.

Each entry needs all five labels, or the Stop hook will not count it:

```markdown
## YYYY-MM-DD - short title

Agent:

Action:

Result:

Next step:

Open:
```

Before handing off, let the tooling attach the sixth, optional field instead of
typing a claim:

```
node scripts/protocol-handoff.cjs record --owner <your-session-id>
```

When this directory passes thirty files, move the oldest closed journals whole
into `.ai/ARCHIVE.md`. Moving entries out of a journal does not reduce the file
count; moving the file does. See section 8 of `AGENTS.md`.
