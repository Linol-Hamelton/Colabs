# Current Task

Status: Completed
Owner: RuslanFomenko
Last update: 2026-09-13

## Objective

Bring the stack to a state that can be installed on a real product repository:
finish the Codex adapter round that stopped mid-way, remove everything a
product repository cannot use, and stop the protocol from configuring anything
it does not own. Authorized by the owner's 2026-09-13 instruction.

## Acceptance criteria

- [x] The interrupted Codex round is committed, assessed and green.
- [x] An install delivers the runtime only; source tooling stays behind.
- [x] No approval policy, editor settings or repository-wide line-ending rule
      is written into a host project.
- [x] An installed project validates without the installer present.
- [x] A Supersedes naming no decision fails validation.
- [x] Licence, contribution guide and security policy exist.
- [x] Every change above has a regression test.

## Current state

Recorded as DEC-0013, with the licence choice open as DEC-0014. 103 tests pass
and the evidence on this session's journal anchors that to the tree.

## Active agent

- None. The shared-document lock is released.

## Open questions

1. DEC-0014 is Proposed, not Accepted. MIT is in place so the repository is
   usable; the owner confirms or replaces it.
2. The Codex adapter has never run inside a real Codex host. Its cost of being
   wrong is that the hooks do not fire, which is where things stood before.
3. The session `codex-20260912-adapter` held the shared lock for 124 minutes
   and never created the journal it named. Stale detection surfaced it and the
   lock was released after inspection. Its round is described from the diff,
   not from its own handoff.
4. Projects installed before v1.4 keep the extra files until removed by hand.
   Nothing deletes them on a project's behalf.
5. Still no product task. That remains the only open question that matters.

## Next

Owner names the first product objective. The stack is ready to be installed on
it.
