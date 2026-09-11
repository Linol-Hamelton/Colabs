# Worklog: claude-20260911-followup

Session journal. Owned by this session. No other session writes here.

Newest entry first. Limit 150 lines.

---

## 2026-09-11 - Review of the Codex round, then repair

Agent: Claude (Opus 5), session claude-20260911-followup

Action:
Reviewed the state left by the Codex hardening round, then fixed what was
broken. Found the installer dead: its manifest named `docs/PROTOCOL.md`, a
file that never existed, so it threw on every run including its own
self-check, and seven of its own regression tests failed with it. Wrote
`docs/PROTOCOL.md` as the operator guide installed into target projects.
Fixed the eighth failing test by forcing UTF-8 console output in both
PowerShell entry points; PowerShell 5.1 had been emitting non-ASCII file
names in the OEM codepage, so a Cyrillic filename reached the test as
mojibake. Added an installer self-check to the validator, which had been
reporting the repository healthy while the installer could not run. Released
the shared-document lock left held by `codex-20260911-hardening` since
15:18 UTC, after confirming no operation was in progress and the journal it
named had never been created; then taught the lock to report how long it has
been held, whether it is past a 120-minute stale threshold, and the exact
release command, without ever stealing a lock. Rewrote `AGENTS.md` and
`CLAUDE.md` to describe per-session journals, the lock, the checks and the
immutability of decision blocks, none of which the documents mentioned after
DEC-0009 changed them. Fixed the introduction to `.ai/DECISIONS.md`, which
still told agents to edit an older block's status. Moved DEC-0009 above the
template block where it belonged. Made the hook command silent outside a Git
checkout and when the wrapper is missing, keeping the subdirectory fix that
Codex added. Added a validator warning when the journal directory passes
thirty files. Rewrote `README.md`.

Result:
59 of 59 tests pass, up from 51 of 59. The validator exits 0 with no
warnings, and now fails when the installer is broken: verified by deleting
`docs/PROTOCOL.md` and watching it report the exact cause. The hook command
was checked from the repository root, from a subdirectory and from a
directory outside any repository; the first two inject context, the third is
silent with empty stderr. Stale-lock detection was checked against a fixture
whose lock was 403 minutes old. Recorded as DEC-0010.

Next step:
Owner supplies the first objective for the test project. That is the first
time this protocol will be measured against real work rather than against
its own scaffolding.

Open:
- `.ai/worklog/codex.md` claims no implementation or decision was changed,
  which the working tree contradicts. A journal belongs to its own session,
  so I recorded the discrepancy in `.ai/TASK.md` instead of editing theirs.
- The journal file name is still a hash, pinned by a regression test. It is
  unique and the hook orders what it injects, but the directory does not sort
  chronologically. Changing it means changing the test; I left the decision
  to the owner rather than overturning it myself.
- Nothing is committed. Section 4 of `AGENTS.md` leaves that to the owner.
- The validator now spawns the installer, so the suite runs about 25 seconds
  longer.
- Protocol lapse of my own, recorded rather than hidden: after releasing the
  shared-document lock I edited `.ai/ARCHIVE.md` and the templates without
  re-acquiring it. The file was empty of archived entries and nothing was
  lost, verified by reading it back, but section 6 of `AGENTS.md` required
  the lock and I did not take it. The rule needs no change; I broke it.
