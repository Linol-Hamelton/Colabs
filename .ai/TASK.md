# Current Task

Status: Completed
Owner: RuslanFomenko
Last update: 2026-09-11

## Objective

Make this repository a working default AI collaboration workspace, with the
documents, tooling and enforcement agreeing with each other, before the owner
starts a test project on it.

## Acceptance criteria

- [x] The installer runs and installs into a clean directory.
- [x] The regression suite passes in full.
- [x] The validator fails when the installer cannot run.
- [x] The shared-document lock reports staleness and a recovery command.
- [x] Documents, hooks and templates agree on journals, locking and checks.
- [x] Hooks stay silent outside a Git checkout instead of printing errors.

## Current state

Branch `harden-protocol-defaults`, uncommitted. 59 of 59 tests pass, the
validator exits 0 with no warnings, the installer self-check exits 0.
Recorded as DEC-0010. Nothing is committed: section 4 of AGENTS.md leaves that
to the owner.

## Active agent

- None. The shared-document lock is released.

## Open questions

1. `.ai/worklog/codex.md` states "No implementation, decision, other agent's
   worklog, index entry, or commit was changed". The working tree contradicts
   it: that session went on to rewrite the installer and validator, add eight
   files and append DEC-0009, with no second journal entry. A journal belongs
   to its own session, so this was not corrected from outside. The next Codex
   session should add the missing entry and correct the claim.
2. Codex does not read `.claude/`, so it has no equivalent of the hooks. That
   asymmetry is still untested.
3. The protocol has never run against a real product task. Everything verified
   so far is the scaffolding checking itself.
4. The journal directory grows by one file per session. The validator warns
   past thirty; no archiving pass has ever been exercised.

## Next

Owner supplies the test project's first objective.
