# Copilot - v1.9.3 Adversarial Audit

**Date**: 2026-09-18  
**Reviewed commit**: a6a6d61  
**Working tree**: dirty  
**Reviewer**: copilot-audit  
**Scope**: audit / architecture / edge-cases / security  
**Verdict**: FAIL

## Executive Summary

The v1.9.3 hardening is not release-safe. The archive implementation still
allows false-positive deduplication and order-dependent deep verification, and
deep verification does not validate the complete archived parent chain. The
mandatory adversarial-review rule is present in documentation but is not an
enforced completion gate. The validator also reports one warning, contrary to
the task acceptance criterion of zero warnings.

## Scope and Evidence

- **Baseline Commit**: `a6a6d61`
- **Working Tree State**: dirty
- **Commands & Tests Executed**:
  - `powershell -ExecutionPolicy Bypass -File .\validate-protocol.ps1`
  - `powershell -ExecutionPolicy Bypass -File .\test-protocol.ps1`
  - Source inspection of lock, archive, handoff, session, hooks, validator,
    `AGENTS.md`, `QUICKSTART.md`, and `PROTO-DEC-0027`.
- **Environment**: Windows, Node.js v22.21.0, PowerShell.
- **Observed validation**: regression suite completed successfully (186 tests);
  the direct validator invocation reported `Protocol OK. 1 warning(s)` because
  32 journals exceed the 30-file limit, while the handoff recorder correctly
  captured validator exit 1 and test exit 0. An initial sandboxed run was not
  used as evidence because filesystem access was denied.

## Findings

| Id | Severity | Title | Location | Impact | Status |
|---|---|---|---|---|---|
| F-001 | HIGH | Archive deduplication trusts substring presence | `.ai/bin/protocol-archive.cjs:152-154` | A hash in unrelated text can suppress archiving, while the journal is still pruned; the only copy can be lost. | Open |
| F-002 | HIGH | Deep verification accepts the first valid duplicate | `.ai/bin/protocol-handoff.cjs:226-242` | A valid first copy masks a later forged duplicate, so verification is order-dependent rather than fail-closed. | Open |
| F-003 | MEDIUM | Deep verification does not traverse archive ancestors | `.ai/bin/protocol-handoff.cjs:216-247` | An older archived parent can be rewritten without detection when the newest referenced entry remains valid. | Open |
| F-004 | MEDIUM | Mandatory peer review is not an executable completion gate | `AGENTS.md:76-92`, `validate-protocol.ps1:392-398` | A task can be marked completed without a review artifact, independent reviewer, verdict, or linkage; the governance control is bypassable. | Open |
| F-005 | MEDIUM | `--session-pid` accepts an unrelated live PID | `.ai/bin/protocol-lock.cjs:159-165`, `protocol-lock.cjs:139-141` | A caller can pin a lock to another process, causing false liveness and denial of recovery; PID ownership is not established. | Open |
| F-006 | LOW | Acceptance criterion is not met by the validator state | `.ai/worklog/` and validator output | 32 journals produce one warning; the stated requirement is `0 warning(s)`, so release evidence is inconsistent with acceptance. | Open |

## Deep Dives

### Archive identity and duplicate handling

`autoArchiveWorklog` filters entries with `existingArchive.includes(hash)`.
This is not parsing an authenticated archive record: the hash may occur in a
different entry's `parent-entry`, prose, or attacker-controlled text. The
function then rewrites the journal and records `archived-parent` from the
removed entry. Deduplication must be based on exact parsed `entry:` fields in
complete archive sections, followed by a read-back verification.

`verify --deep` stops after the first matching section whose recomputed body
matches the marker. It must reject duplicate matching sections and inspect all
copies, otherwise a clean copy can mask a tampered copy later in the file.
It also validates only the directly referenced archived entry and never
follows its `parent-entry` links to `root`/`legacy`, leaving historical
ancestors outside the integrity boundary.

### Lock and platform behavior

The retry loop covers `EPERM`, `EBUSY`, and `EACCES`, and temporary-file
cleanup is present. However, `--session-pid` is merely parsed as a positive
integer and stored without proving it is the invoking session's PID or that
the PID belongs to the declared owner. This is a liveness oracle supplied by
the caller, not an authenticated process identity.

### Review governance

The wording in `AGENTS.md` and `QUICKSTART.md` is correct and the decision
record exists, but the validator checks only the task status string. No
machine-checkable review artifact, independent reviewer identity, or verdict
is required before completion.

## Recommendations & Actionable Plan

1. Parse archive sections and deduplicate only on exact, valid `entry:` hashes;
   verify the appended section before pruning the journal.
2. Make deep verification reject duplicate target hashes, validate every
   matching copy, and recursively traverse archived `parent-entry` links with
   cycle and missing-link checks.
3. Bind `--session-pid` to the current process or require an explicit,
   authenticated session record; reject arbitrary foreign PIDs.
4. Add a completion gate requiring a review document with the mandated prompt,
   independent reviewer, and explicit verdict.
5. Reduce `.ai/worklog/` to the configured limit and rerun validation until it
   reports zero warnings.

## References

- `PROTO-DEC-0027` in `.ai/DECISIONS.md`
- Active task in `.ai/TASK.md`
- Associated session journal: `.ai/worklog/copilot-audit-89ed62083755ca53.md`
