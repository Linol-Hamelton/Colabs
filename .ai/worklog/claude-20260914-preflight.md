# Worklog: claude-20260914-preflight

Session journal. Owned by this session. No other session writes here.

Newest entry first. Limit 150 lines.

---

## 2026-09-14 - Pre-flight against the pilot repository

Agent: Claude (Opus 5), session claude-20260914-preflight

Action:
Checked `D:\Block-Puzzle` itself rather than the GitHub clone. It is clean, on
`feat/match3-domain`, and holds none of the files the protocol would write, so
an install is purely additive. Measured the hook against it read-only: 114 ms
over 409 entries, and none of its multi-megabyte screenshots or audio is
opened.

Rehearsed the whole thing in a clone: installed, validated, ran both adapters,
took the lock, wrote a journal entry, recorded evidence, verified it, released
the lock. Ran their own suite: 196 Flutter tests pass in 16 seconds. Simulated
a build to confirm artifacts stay invisible to Git, then ran a real one to
confirm it again.

Result:
The rehearsal found a defect DEC-0017 left behind. Moving the tools to
`.ai/bin/` updated every file that referenced the old paths except the three
that moved, because by then they no longer matched the list. Six instructions
inside them still said `scripts/`, and one of those is injected into every
agent's context at session start: the first agent in the pilot would have been
told to run a path that does not exist in an installed project.

Fixed, and covered by two checks: no shipped file may name a retired path, and
every tool path in the injected context must exist in the project it reached.
122 tests pass. Version 1.6.1, recorded as DEC-0018.

Next step:
Install into `D:\Block-Puzzle` and write the first objective.

Open:
- Their `.gitignore` scopes `.dart_tool/` and `build/` to `apps/mobile/`. A
  dart or flutter command run at the repository root would leave artifacts Git
  can see, and the Stop hook would report them as changes. Their file, their
  call; two lines fix it.
- The repository sits on `feat/match3-domain`, three months old. Worth deciding
  which branch the pilot starts from before the first task.
- The Stop hook costs about 450 ms per response there, of which about 130 ms is
  the shell wrapper resolving a path that the engine resolves again itself. I
  left it alone: the pilot should say whether it is worth removing.

Evidence:
- anchor: 2cd5e7a3cb788f7f03e4895a9556adfe67547252, uncommitted changes present
- digest: sha256:7669ea0fcb7810ceb318cffc53cf99be949edf760c15746b3317691d8a3f2837 over 44 tracked and untracked files
- digest format: 4
- recorded: 2026-09-13T21:39:20.348Z by claude-20260914-preflight
- scope: protocol checks only; host-project tests run separately
- validate-protocol.ps1: exit 0 in 2s
- test-protocol.ps1: exit 0 in 261s
- reproduce: node .ai/bin/protocol-handoff.cjs verify
