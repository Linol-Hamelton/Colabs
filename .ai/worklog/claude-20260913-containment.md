# Worklog: claude-20260913-containment

Session journal. Owned by this session. No other session writes here.

Newest entry first. Limit 150 lines.

---

## 2026-09-13 - Everything the protocol ships lives where the protocol lives

Agent: Claude (Opus 5), session claude-20260913-containment

Action:
Committed the interrupted Codex round first, then verified what it claimed but
had not finished checking. Both defects were real. On the unmodified v1.5.1
base, a CRLF file under the protocol's own `.gitattributes` hashed to
`cf9b2a85` while Git stored `e5c5c558`: in any Windows project every such file
would have looked permanently changed, so no evidence would ever verify. Its
repair, taking identities from `git hash-object`, produces exactly what the
index holds, and 118 tests passed.

Then looked at the two pilot candidates the owner named. Both keep their own
`scripts/` and `docs/`, with 8 and 51 files in one and 32 and 80 in the other,
and in one of them `docs/` is a generated documentation site with a deploy
workflow that triggers on `docs/**`. The protocol was installing three scripts
and two documents straight into those directories.

Moved them to `.ai/bin/` and `.ai/docs/`. An installed project now receives
three dot-directories and four identifiable root files. Updated every live
reference and left the journals, the archive and earlier decision blocks with
the old paths, because they describe what was true when they were written.

Result:
Both tools broke silently on the move: they resolved the project root one level
up, which had been right in `scripts/`. The handoff tool reported a file count
of 12 instead of 24 and the lock refused to run at all. Found by installing
into a host project rather than by reading the diff. Fixed, and covered by a
test that runs both from a subdirectory of an installed project. 120 tests
pass. Version 1.6.0, recorded as DEC-0017.

Next step:
Owner writes the first product objective in the chosen pilot repository.

Open:
- I recommended jtcsv over Block-Puzzle on the evidence below; the choice is
  the owner's. jtcsv has 59 TypeScript test files, zero runtime dependencies
  and a toolchain already present, so a task's completion is a fact rather than
  an opinion. It is also a published library at v5.0.0, which is the argument
  against it.
- Nothing removes protocol files from a pre-1.6 installation. None exists.
- Codex hook execution still awaits the owner's host trust review.

Evidence:
- anchor: 39262c1c1484826222179214e79ba9c74d1f4475, uncommitted changes present
- digest: sha256:c154d02cfb95f102703b470ab3dcce7132b3e1a9c960cb10b706367028bebe6c over 44 tracked and untracked files
- digest format: 4
- recorded: 2026-09-13T20:59:13.330Z by claude-20260913-containment
- scope: protocol checks only; host-project tests run separately
- validate-protocol.ps1: exit 0 in 2s
- test-protocol.ps1: exit 0 in 260s
- reproduce: node scripts/protocol-handoff.cjs verify
