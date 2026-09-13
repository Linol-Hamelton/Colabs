# Current Task

Status: In progress
Owner: RuslanFomenko
Last update: 2026-09-13

## Objective

Finish the interrupted Codex session against Claude's latest commits, check
repository cleanup and adoption in new/existing projects, and provide the
connection instructions. Authorized by the owner's 2026-09-13 request.

## Acceptance criteria

- [x] Resume from actual Git state and preserve Claude's committed changes.
- [x] Audit obsolete files and branches without removing project history.
- [x] Check and document new install, existing install and upgrade workflows.
- [ ] Evidence survives commits of CRLF files and tracked executable files
      when core.filemode=false, while real edits are still detected.
- [ ] Preserve clean-index optimization and identify older digest formats.
- [ ] Full validator/suite pass; final journal evidence verifies.

## Current state

Resumed from clean cdcca4b (v1.5.1); its evidence verified before edits.
Claude committed the earlier Codex repairs in 54c0623, then DEC-0015/0016
added snapshot speed and stable identities (115 tests in Claude's journal).
The adoption check reproduced two Windows exceptions to that identity rule.
The bounded v1.5.2 repair keeps the clean-index path and uses Git normalization
for changed files. Format 4 follows the digest-versioning rule in DEC-0015.

## Active agent

- Codex, codex-20260912-adapter, owns the shared-document lock.
- Branch: codex/windows-handoff-fix. No commit or push requested.

## Open questions

1. No first product objective or target repository has been selected yet.
2. Deliberately not built: pruning stale files on upgrade and an uninstall
   command. Pre-v1.4 installs need target-specific inspection of files that
   newer versions no longer ship; their project state must be preserved.
3. DEC-0014, the licence choice, is still Proposed.
4. The Codex adapter is discovered by Codex CLI 0.154.0 and reported untrusted,
   as expected. Execution still awaits the owner trusting it in the host.
5. Audit follow-ups: T6 concerns validator text-extension coverage; T8 concerns
   ordering journals with equal modification times in SessionStart context.

## Next

Install the protocol on the product repository and run the first real task
through it. The connection command is in `README.md`.
