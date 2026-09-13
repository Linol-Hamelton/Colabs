# Current Task

Status: Completed
Owner: RuslanFomenko
Last update: 2026-09-13

## Objective

Finish the interrupted Codex round, then remove what a real adoption would trip
over, judged against the two repositories the owner named as pilot candidates.

## Acceptance criteria

- [x] The interrupted Codex round is committed, its two defects reproduced on
      the unmodified base, and its repair verified.
- [x] Nothing the protocol ships lands in a directory the host project owns.
- [x] An installed project keeps its own `scripts/` and `docs/` untouched.
- [x] The tools resolve the project root from their new location, including
      from a subdirectory.
- [x] Every change has a regression test.

## Current state

Version 1.6.0, recorded as DEC-0017. 120 tests pass. An install adds three
directories and four identifiable root files, and nothing else.

## Active agent

- None. The shared-document lock is released.

## Open questions

1. The pilot repository is chosen but the first product objective is not
   written. That is the last thing blocking the pilot.
2. DEC-0014, the licence choice, is still Proposed.
3. Codex hook execution still needs the owner to trust the two definitions in
   the host. Discovery is verified; execution is not.
4. Audit findings T6 and T8 remain open; neither can produce a false green.
5. Nothing removes protocol files from a pre-1.6 installation. None exists.

## Next

Owner writes the first product objective for the chosen pilot repository.
