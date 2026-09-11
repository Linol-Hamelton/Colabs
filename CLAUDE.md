# CLAUDE.md

This repository runs a shared multi-agent protocol. The rules live in
`AGENTS.md` and bind Claude exactly as written there. Read them.

@AGENTS.md

## Claude-specific notes

- Your journal is one file per session in `.ai/worklog/`. The SessionStart
  hook prints its name in the injected context. Create it if it does not
  exist yet, and write only to that file.
- `.ai/worklog/claude.md` is a seed file with history from before per-session
  journals. Read it; do not rewrite it.
- The injected context is bounded. It is a starting point, not the whole
  picture. Read `.ai/DECISIONS.md` yourself when the task touches
  architecture, data, or external contracts.
- Take the lock before editing `.ai/TASK.md`, `.ai/PLAN.md`,
  `.ai/DECISIONS.md` or `.ai/ARCHIVE.md`, and release it when you finish.
  See section 6 of `AGENTS.md`.
- The Stop hook warns when files changed but your journal has no new complete
  entry. An entry counts only with all five labels: Agent, Action, Result,
  Next step, Open.
- Before handing off, run both checks and report what they actually printed:

```powershell
powershell -ExecutionPolicy Bypass -File .\validate-protocol.ps1
powershell -ExecutionPolicy Bypass -File .\test-protocol.ps1
```
