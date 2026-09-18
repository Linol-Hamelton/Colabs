# Copilot - Adversarial Audit v1.9.3 Hardening & Performance Optimization

**Date**: 2026-09-18  
**Reviewed commit**: a6a6d61  
**Working tree**: dirty  
**Reviewer**: Copilot (Opposing Adversarial Reviewer)  
**Scope**: security, architecture, performance, edge-cases  
**Verdict**: BLOCKED  

## Executive Summary

The mandatory checks and downstream verification complete successfully, but the
release is not safe to certify. The handoff verifier hashes the journal body
while excluding the Evidence block, yet trusts security-relevant Evidence
fields; a stale or failed receipt can therefore be rewritten into a green
receipt without changing the certified entry hash. Deep verification also
rejects an existing transitional format-4 archive entry, and `doctor` reports
Merkle failures while exiting zero.

## Scope and Evidence

- **Baseline Commit**: `a6a6d61`
- **Working Tree State**: dirty
- **Commands & Tests Executed**:
  - `powershell -ExecutionPolicy Bypass -File .\validate-protocol.ps1` —
    PASS, 0 warnings, exit 0.
  - `powershell -ExecutionPolicy Bypass -File .\test-protocol.ps1` —
    PASS, 176 tests, exit 0.
  - `node .ai/bin/protocol-handoff.cjs verify --owner gemini-381fc7800a864cde`
    — FAIL because the existing Evidence digest is stale after the working tree
    changed.
  - `node .ai/bin/protocol-handoff.cjs verify --owner
    gemini-381fc7800a864cde --deep` — FAIL: an archived parent has no
    `parent-entry`.
  - `node .ai/bin/protocol.cjs doctor` — prints two Merkle failures but exits
    `0`.
  - `setup-ai-protocol.ps1 -Target D:\Block-Puzzle -Verify` — PASS.
  - `setup-ai-protocol.ps1 -Target D:\VPN -Verify` — PASS.
- **Environment**: Windows, Node.js v22.21.0, Windows PowerShell 5.1.26100.9444,
  Git 2.53.0.windows.2.

## Findings

| Id | Severity | Title | Location | Impact | Status |
|---|---|---|---|---|---|
| F-001 | HIGH | Evidence metadata is outside the authenticated entry hash | `.ai/bin/protocol-handoff.cjs:343-355, 409-438` | A certified receipt can be changed from failed/stale to green by editing only `digest`, `parent-entry`, or recorded exit codes; `entryHash()` remains unchanged. This defeats the handoff integrity claim. | Open |
| F-002 | MEDIUM | `doctor` has a success exit code on integrity failure | `.ai/bin/protocol.cjs:33-148` | CI or operators that gate on the exit code can accept a repository after Merkle failures are printed. | Open |
| F-003 | MEDIUM | Metadata key collision can disable snapshots | `.ai/bin/protocol-hooks.cjs:149-153` | A tracked or untracked file named exactly `__dirty` causes `Object.defineProperty` to redefine a non-configurable property and aborts snapshotting. Hook enforcement then degrades to a warning path. | Open |
| F-004 | MEDIUM | Lock reentrancy is authenticated only by owner text | `.ai/bin/protocol-lock.cjs:113-116`; `.ai/bin/protocol-archive.cjs:149-154` | Any second process that knows an owner string is treated as the same holder; concurrent archive operations can bypass the operation gate and lose journal/archive updates. | Open |
| F-005 | MEDIUM | Deep verification rejects a valid transitional format-4 genesis | `.ai/bin/protocol-handoff.cjs:261-310`; `.ai/ARCHIVE.md` archived parent | `verify --deep` fails on an untampered archived entry without `parent-entry`, so deep verification cannot be used reliably during the recorded migration state. | Open |
| F-006 | LOW | Fast-validator coverage is opt-out for non-validator tests | `tests/helpers.cjs:61-70`; `test-protocol.ps1:23-35` | Most fixture-based tests replace `validate-protocol.ps1` with an unconditional success stub. The named exclusions cover current validator-focused files, but a future or overlooked test can exercise protocol behavior while never running validator logic. | Open |

### F-001 - HIGH - Evidence metadata is outside the authenticated entry hash

- **Location**: `.ai/bin/protocol-handoff.cjs:343-355, 409-438`
- **Confidence**: High
- **Reproduction**:
  ```text
  1. Record a journal containing an Evidence block.
  2. Edit only the Evidence digest, parent-entry, or check exit-code lines.
  3. entryBody() removes the complete Evidence block before entryHash().
  4. The stored entry hash is unchanged, while reportOne() trusts those fields.
  ```
- **Impact**: A handoff can claim that checks passed against the current tree
  even when the original receipt was stale or recorded failures. This is a
  direct break in the protocol's evidence chain and is release-blocking.
- **Recommendation / Proposed Fix**:
  Hash the full receipt metadata, excluding only a narrowly defined
  self-referential field. Require every format-4 field, including
  `parent-entry`, to be present and validate its value before accepting the
  receipt.

### F-002 - MEDIUM - `doctor` has a success exit code on integrity failure

- **Location**: `.ai/bin/protocol.cjs:130-148`
- **Confidence**: High
- **Reproduction**:
  ```text
  node .ai/bin/protocol.cjs doctor
  # Output contains "[FAIL]" and "Issues Found (2 failure(s))."
  # Process exit code: 0
  ```
- **Impact**: A shell, CI job, or release script using only `$LASTEXITCODE`
  treats a failed integrity audit as successful.
- **Recommendation / Proposed Fix**:
  Return `issues === 0 ? 0 : 1` from `doctor()` and assign that result to
  `process.exitCode` in the CLI entry point. Add a failing-fixture regression
  test.

### F-003 - MEDIUM - Metadata key collision can disable snapshots

- **Location**: `.ai/bin/protocol-hooks.cjs:149-153`
- **Confidence**: High
- **Reproduction**:
  ```text
  Create a repository file named "__dirty" and call snapshot(root).
  The file map first defines "__dirty" as an enumerable file identity, then
  line 153 attempts to redefine it without configurable:true.
  ```
- **Impact**: Session-start/stop change detection can throw for a valid
  repository layout. The surrounding hook behavior reports a warning rather
  than enforcing the normal snapshot flow.
- **Recommendation / Proposed Fix**:
  Return dirty state as a separate value, or store it under a private Symbol
  outside the file-name namespace. Add a regression test for a `__dirty` path.

### F-004 - MEDIUM - Lock reentrancy is authenticated only by owner text

- **Location**: `.ai/bin/protocol-lock.cjs:113-116`; `.ai/bin/protocol-archive.cjs:149-154`
- **Confidence**: High
- **Reproduction**:
  ```text
  Start two archive operations with the same --owner value.
  The second operation observes the same owner and skips acquisition of the
  operation gate, allowing overlapping read/append/rename transactions.
  ```
- **Impact**: Concurrent writers can overwrite a trimmed worklog, append
  duplicate or incomplete archive sections, or release a lock still used by
  another process. Owner IDs are labels, not process authentication.
- **Recommendation / Proposed Fix**:
  Bind ownership to a process/session nonce and keep an operation gate for the
  complete archive transaction, including the reentrant-owner path. Validate
  the nonce on release.

### F-005 - MEDIUM - Deep verification rejects a valid transitional format-4 genesis

- **Location**: `.ai/bin/protocol-handoff.cjs:261-310`; `.ai/ARCHIVE.md`
- **Confidence**: High
- **Reproduction**:
  ```text
  node .ai/bin/protocol-handoff.cjs verify \
    --owner gemini-381fc7800a864cde --deep
  # historical link was broken:
  # archived parent ... has no parent-entry link
  ```
- **Impact**: The repository's own archived history contains a transitional
  format-4 entry that is not tampered with but cannot pass the deep audit.
  Operators cannot distinguish migration state from corruption.
- **Recommendation / Proposed Fix**:
  Encode an explicit genesis/transitional marker and accept that marker only
  at the permitted boundary, or migrate the historical entry once under a
  documented decision. Do not infer that every format-4 entry must have a
  parent link.

### F-006 - LOW - Fast-validator coverage is opt-out for non-validator tests

- **Location**: `tests/helpers.cjs:61-70`; `test-protocol.ps1:23-35`
- **Confidence**: High
- **Impact**: The environment variable is restored after the runner exits, so
  no persistent environment leak was observed. However, the default fixture
  path installs a validator stub for every test file not matching the current
  exclusion regex. This creates a false-green risk when a test indirectly
  depends on validator semantics or when a new validator-sensitive test is
  added without updating the exclusion list.
- **Recommendation / Proposed Fix**:
  Make fast validation explicit per fixture or maintain a positive allowlist of
  tests permitted to stub the validator. Add a test asserting that every
  validator-sensitive suite runs with the real script.

## Deep Dives

### False-green and concurrency review

The current named validator exclusions correctly cover the validator, syntax,
installer, manifest, upgrade, review-findings, and Codex suites. The runner
also restores `PROTOCOL_TEST_FAST_CHECKS` in `finally`, so the process-level
environment does not leak after `test-protocol.ps1`. The concern is coverage
discipline rather than an observed runtime leak: the default is still to stub,
and the exclusion is filename-based.

The 176-test run completed successfully under the 16-way runner, and fixture
helpers create isolated temporary roots. No deterministic port or shared
resource collision was observed. Windows rename retry handling appears
appropriate for the exercised cases.

### Regex, completion gate, and liveness review

The date-heading expressions are bounded and linear; no catastrophic ReDoS
pattern was demonstrated. Completion-gate parsing is anchored to a single
section and the negative/positive validator tests pass. Runtime cleanup now
deletes stale snapshots only when liveness is explicitly `false`, preserving
unknown foreign-host status as intended.

### Cryptographic and empty-repository review

The lazy anchor correctly falls back to a null HEAD for an unborn repository,
and the single HEAD probe does not itself weaken the tree digest. The
`__dirty` metadata collision is the concrete failure in the adjacent snapshot
optimization. Deep archive body re-hashing detects ordinary body tampering and
duplicate masking in the tested path, but the transition/genesis rule and
Evidence exclusion still prevent a clean end-to-end integrity claim.

## Alternatives Considered & Trade-offs

- **Keep Evidence outside the entry hash**: Rejected because it leaves the
  security decision fields unauthenticated.
- **Treat every format-4 entry without a parent as tampered**: Rejected because
  the repository already contains a documented migration-era genesis entry.
- **Use only textual owner IDs for lock reentrancy**: Rejected because labels
  are discoverable and do not identify a process.

## Recommendations & Actionable Plan

1. Fix F-001 before any release or evidence certification.
2. Make `doctor` fail closed and add tests for F-002.
3. Remove the `__dirty` namespace collision and test F-003.
4. Bind lock reentrancy to process/session identity and serialize archive
   transactions for F-004.
5. Define and migrate the format-4 genesis rule for F-005.
6. Narrow fast-validator stubbing to an explicit allowlist and add coverage
   checks for F-006.

## References

- Decision blocks: `PROTO-DEC-0027` in `.ai/DECISIONS.md`
- Active task: `.ai/TASK.md`
- Related reviews: `docs/reviews/2026-09-18-*-audit*.md`
