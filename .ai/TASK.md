# Current Task

Status: Completed
Owner: RuslanFomenko
Last update: 2026-09-12

## Objective

Wave 1 of the audit roadmap: stop the checks from reporting success for a
protocol that is not running, and make handoff carry evidence instead of
assertions. Authorized by the owner's 2026-09-12 instruction to continue with
the most valuable work.

## Acceptance criteria

- [x] Removing any runtime entry point fails validation.
- [x] Globally disabled hooks fail validation with the reason.
- [x] Ineffective ignore rules fail validation, checked through Git itself.
- [x] An empty final field no longer counts as a completed journal entry.
- [x] Handoff records real exit codes anchored to a tree digest.
- [x] Evidence survives `git add` and fails when the tree moves.
- [x] Every counterexample above has a regression test.
- [x] CI runs the validator, the suite and a clean install on Windows.
- [x] Lock field names, version identifier, decision template and the
      archiving procedure match what the tooling actually does.

## Current state

Branch `wave1/verifiable-state`. Recorded as DEC-0011. The Codex audit is
preserved as its own commit `8d71e78` so per-round authorship stays
recoverable.

## Active agent

- None. The shared-document lock is released.

## Open questions

1. CI has never executed. The workflow is verified only by its own shape and
   by the commands it runs passing locally. It proves nothing until pushed.
2. The protocol still has no product task. Three rounds have now improved the
   scaffolding. Wave 3 of the audit roadmap is the decisive evidence and it is
   blocked only on the owner naming a first objective.
3. Codex has no hook adapter, so evidence and journals stay voluntary there.
   Upstream documents `.codex/hooks.json`; an adapter needs testing in a real
   host before it is worth writing.
4. Archiving a closed journal whole is now specified but has never been run.
   No journal directory has reached the thirty-file limit.
5. The public repository still has no licence, release tags or contribution
   process. Wave 4 of the roadmap.

## Next

Owner names the first product task, or authorizes the push that lets CI run.
