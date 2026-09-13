# Current Task

Status: Completed
Owner: RuslanFomenko
Last update: 2026-09-13

## Objective

Finish the interrupted Codex round, then remove what would actually break on a
real product project rather than what looks unfinished. Authorized by the
owner's 2026-09-13 instruction to reach a launchable state.

## Acceptance criteria

- [x] The interrupted Codex round is committed, assessed and green.
- [x] Hook cost measured on a large repository and on the owner's own product,
      not estimated.
- [x] The Stop hook, which runs after every response, no longer grows with the
      size of the project.
- [x] Change detection unaffected: edit, revert, add and delete all still seen.
- [x] Evidence from an older digest format is named, not called stale.
- [x] Every change has a regression test.

## Current state

Recorded as DEC-0015, version 1.5. 113 tests pass. Measured: the Stop hook fell
from about 850 ms to about 330 ms on five thousand files, and the snapshot takes
122 ms on the owner's product repository while reading one file of 558.

## Active agent

- None. The shared-document lock is released.

## Open questions

1. Still no product task. Five rounds have improved the scaffolding. Everything
   that can be verified without real work has now been verified.
2. Deliberately not built: pruning stale files on upgrade and an uninstall
   command. No project has ever installed the protocol, so there are no stale
   installs to prune. Build it when a project has been upgraded twice.
3. DEC-0014, the licence choice, is still Proposed.
4. The Codex adapter is discovered by Codex CLI 0.154.0 and reported untrusted,
   as expected. Execution still awaits the owner trusting it in the host.
5. Audit findings T6 and T8 remain open in the SessionStart hook; neither can
   produce a false green.

## Next

Install the protocol on the product repository and run the first real task
through it. The connection command is in `README.md`.
