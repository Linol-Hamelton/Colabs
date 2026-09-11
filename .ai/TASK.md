# Current Task

Status: Completed
Owner: RuslanFomenko
Last update: 2026-09-12

## Objective

Clear the repository of leftovers from tested hypotheses, assess what actually
happens when the protocol is installed into a new or an existing project, and
write down how to connect it. Authorized by the owner's 2026-09-12 request,
made before starting the first product task.

## Acceptance criteria

- [x] CI failure on its first real run diagnosed and fixed at the root.
- [x] One manifest defines what the protocol owns; installer, validator and
      test fixtures all derive from it.
- [x] Validation no longer inspects a host project's own source files.
- [x] Seed journals removed and archived; the archiving procedure exercised.
- [x] Dead branches removed; every commit reachable from `main`.
- [x] Install verified against a new project and two existing repositories.
- [x] Connection instructions written from what was observed, not assumed.

## Current state

Recorded as DEC-0012. 79 tests pass, the validator exits 0, and the evidence
block on this session's journal anchors those results to the tree.

## Active agent

- None. The shared-document lock is released.

## Open questions

1. The protocol has still never run a product task. Three rounds have improved
   the scaffolding. `.ai/PLAN.md` proposes the pilot that would settle whether
   any of it earns its cost.
2. Findings T4, T6, T7 and T8 from the audit remain open. None can produce a
   false green, which is why they were deprioritized.
3. Codex has no hook adapter, so evidence and journals stay voluntary there.
4. Installing `.gitattributes` and `.editorconfig` into an existing repository
   changes line-ending normalization for that project as a whole. Backups are
   kept, but this is the one install step that needs a human look.
5. The public repository still has no licence, release tags or contribution
   process.

## Next

Owner names the first product objective for the pilot.
