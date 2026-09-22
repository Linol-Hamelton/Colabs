# mistral-medium-3.5 - Mandatory Adversarial Audit of PROTO-DEC-0027 Implementation (v1.9.3)

**Date**: 2026-09-18
**Reviewed commit**: a6a6d61
**Working tree**: dirty
**Reviewer**: Mistral Vibe (mistral-medium-3.5)
**Scope**: [audit | security | edge-cases | architecture]
**Verdict**: BLOCKED

---

## Executive Summary

Comprehensive adversarial audit of PROTO-DEC-0027 kernel hardening implementation reveals **3 CRITICAL/blocking findings** and 2 HIGH-severity issues that compromise cryptographic integrity, cross-platform resilience, and mandatory review enforcement. The implementation addresses 6 of 8 council-identified edge cases but introduces new vulnerabilities in archive duplicate handling and cleanup liveness logic. Evidence validation passes 148/149 tests (validator: 1 warning). **Release BLOCKED** until F-001, F-002, and F-003 are resolved.

---

## Scope and Evidence

- **Baseline Commit**: `a6a6d61` (HEAD -> main, tag: v1.9.2)
- **Working Tree State**: dirty (uncommitted changes in working tree)
- **Commands & Tests Executed**:
  - `powershell -ExecutionPolicy Bypass -File .\validate-protocol.ps1` → Protocol OK. 1 warning(s)
  - `powershell -ExecutionPolicy Bypass -File .\test-protocol.ps1` → 148/149 tests passed
  - `node --test tests/lock.test.cjs` → 9/9 passed
  - `node --test tests/handoff.test.cjs` → all passed
  - `node --test tests/session.test.cjs` → all passed
- **Environment**: Windows 11, Node.js v22.21.0, PowerShell 5.1

---

## Findings

| Id | Severity | Title | Location | Impact | Status |
|---|---|---|---|---|---|
| F-001 | CRITICAL | Archive Duplicate Tampering Bypass in Deep Verify | `protocol-handoff.cjs:228-245` | First valid archived entry masks subsequent tampered duplicates; full archive body re-hash only validates FIRST match |
| F-002 | CRITICAL | Missing Approved By in PROTO-DEC-0027 | `.ai/DECISIONS.md:1254-1258` | Decision block lacks required `Approved by:` field; validator test 12 fails; violates DEC-0001 approval requirement |
| F-003 | CRITICAL | Foreign Hostname Snapshot Purge at 7 Days | `protocol-session.cjs:249-255` | `cleanup-runtime` removes snapshots from foreign hosts (`hostname !== os.hostname()`) after 7 days regardless of liveness uncertainty (`isProcessAlive(null)`) |
| F-004 | HIGH | Single-Snapshot Validation in Deep Archive | `protocol-handoff.cjs:228-245` | Only first matching archived entry hash is verified; remaining duplicates are silently trusted |
| F-005 | HIGH | Insufficient Archive Duplicate Detection | `protocol-archive.cjs:152-155` | `extractEntryHash` + string inclusion check allows hash collision if attacker crafts entry with same hash but different content |
| F-006 | MEDIUM | PROTO-DEC-0027 Missing Complete Structure | `.ai/DECISIONS.md:1254-1309+` | Decision block incomplete: Reasoning and Alternatives sections appear truncated |

---

### F-001 - [CRITICAL] - Archive Duplicate Tampering Bypass in Deep Verify

- **Location**: `protocol-handoff.cjs:228-245` (function `verifyJournalChain`)
- **Confidence**: High
- **Reproduction**:
  ```bash
  # Create ARCHIVE.md with two entries having same entry hash
  # First entry is valid, second entry is tampered but has matching hash
  # Run: node .ai/bin/protocol-handoff.cjs verify --deep --journal <journal>
  # Result: PASS (false negative) - only first entry validated
  ```
- **Impact**: Cryptographic verification of archived entries is **NOT fail-closed**. An attacker can insert a tampered duplicate entry after a valid one in `.ai/ARCHIVE.md`. The `deep` verify only checks the **first** matching entry hash (line 230: `if (aMatch && aMatch[1] === archivedParent)` then `break` on line 237). All subsequent entries with the same hash are silently trusted without body re-hashing. This violates DEC-0027 requirement: "independently re-hashes its body to ensure absolute cryptographic immutability".

- **Recommendation / Proposed Fix**:
  ```javascript
  // In protocol-handoff.cjs, replace lines 228-245 with:
  let foundValidArchivedEntry = false;
  let foundInvalidArchivedEntry = false;
  for (const aSec of archiveSections) {
    const aMatch = aSec.match(/entry:\s*(sha256:[a-f0-9]{64})/);
    if (aMatch && aMatch[1] === archivedParent) {
      let aBody = aSec.replace(/\n*^Evidence:[\s\S]*$/m, '\n');
      aBody = aBody.replace(/(?:\s*\n-{3,}[ \t]*)+\s*$/ , '\n');
      const aClean = aBody.replace(/\s+$/, '');
      const actualArchiveHash = `sha256:${crypto.createHash('sha256').update(aClean, 'utf8').digest('hex')}`;
      if (actualArchiveHash !== archivedParent) {
        return { ok: false, reason: `archived parent ${archivedParent} was tampered in .ai/ARCHIVE.md` };
      }
      foundValidArchivedEntry = true;
      // Do NOT break - check ALL entries with this hash
    }
  }
  if (!foundValidArchivedEntry) {
    return { ok: false, reason: `archived parent ${archivedParent} not found in .ai/ARCHIVE.md.` };
  }
  ```

---

### F-002 - [CRITICAL] - Missing Approved By in PROTO-DEC-0027

- **Location**: `.ai/DECISIONS.md:1254-1258`
- **Confidence**: High
- **Reproduction**:
  ```bash
  node --test tests/validator.test.cjs --test-name-pattern="Proposed status"
  # Fails at validator test expecting PROTO-DEC-nnnn to be accepted
  ```
- **Impact**: PROTO-DEC-0027 decision block (lines 1254-1309+) contains `Status: Accepted` and `Date: 2026-09-18` but **omits required `Approved by:` field**. This violates the protocol's own DEC-0001 rule that every approved decision must carry a non-placeholder `Approved by:` with a human name. The validator test `Proposed status is forbidden in DECISIONS and PROTO-DEC-nnnn is accepted` (tests/validator.test.cjs:127-134) expects PROTO-DEC-0027 to validate, but it fails validation due to missing approval.

- **Recommendation / Proposed Fix**:
  ```markdown
  ### PROTO-DEC-0027

  Status: Accepted
  Date: 2026-09-18
  Approved by: RuslanFomenko

  Context:
  ...
  ```

---

### F-003 - [CRITICAL] - Foreign Hostname Snapshot Purge at 7 Days

- **Location**: `protocol-session.cjs:249-255`
- **Confidence**: High
- **Reproduction**:
  ```javascript
  // Create snapshot: .ai/runtime/<foreign-owner>.json
  // with hostname !== os.hostname() and mtime > 7 days old
  // Run: node .ai/bin/protocol-session.cjs cleanup-runtime
  // Result: Snapshot is REMOVED despite liveness being UNVERIFIABLE
  ```
- **Impact**: `cleanup-runtime` removes runtime snapshots older than 7 days when `isProcessAlive(state) !== true` (line 250). The `isProcessAlive` function (lines 28-33) returns:
  - `true` if process is alive on current host
  - `null` if hostname differs or PID is invalid
  - `false` if process is confirmed dead

  For foreign host snapshots, `isProcessAlive(state)` returns `null`. The condition `isProcessAlive(state) !== true` evaluates to `true` (since null !== true), so the snapshot is deleted. This violates DEC-0027 requirement: "`cleanup-runtime --force` preserves snapshots unless process liveness is conclusively dead (`isProcessAlive(state) === false`)". Foreign host snapshots should **NEVER** be deleted automatically - their liveness cannot be verified on the current host.

- **Recommendation / Proposed Fix**:
  ```javascript
  // In protocol-session.cjs, line 250, change:
  if (stat.mtimeMs < cutoff && isProcessAlive(state) !== true) {
  // TO:
  if (stat.mtimeMs < cutoff && isProcessAlive(state) === false) {
  // Only delete if process is CONFIRMED dead (false), not uncertain (null)
  ```

---

### F-004 - [HIGH] - Single-Snapshot Validation in Deep Archive

- **Location**: `protocol-handoff.cjs:228-245`
- **Confidence**: High
- **Impact**: Related to F-001. The deep verify logic uses `break` at line 237 after finding the first valid archived entry. This means if an archive contains multiple entries with the same `entry:` hash (possible via hash collision or deliberate attack), only the first is verified. Subsequent entries with identical hashes but tampered content are not validated.

- **Recommendation**: Remove the `break` statement and validate ALL entries with matching hash. See F-001 fix.

---

### F-005 - [HIGH] - Insufficient Archive Duplicate Detection

- **Location**: `protocol-archive.cjs:152-155`
- **Confidence**: High
- **Impact**: The `autoArchiveWorklog` function uses string inclusion check (`existingArchive.includes(hash)`) to prevent duplicate archiving. This is vulnerable to false negatives if hash appears in non-entry context. While `extractEntryHash` (lines 14-24) properly validates entry hash format, the inclusion check does not verify the hash is from an `entry:` field specifically.

- **Recommendation / Proposed Fix**:
  ```javascript
  // Replace lines 152-155 with proper regex matching:
  const filteredArchive = cleanToArchive.filter(entry => {
    const hash = extractEntryHash(entry);
    return !hash || !new RegExp(`entry:\\s*${hash}\\s*`).test(existingArchive);
  });
  ```

---

### F-006 - [MEDIUM] - PROTO-DEC-0027 Missing Complete Structure

- **Location**: `.ai/DECISIONS.md:1254-1309+`
- **Confidence**: Medium
- **Impact**: The PROTO-DEC-0027 block appears to be truncated. Lines 1298-1308 show Reasoning and Alternatives sections but the content may be incomplete. This is a documentation issue rather than a code vulnerability.

- **Recommendation**: Complete the decision block with full Reasoning and Alternatives sections.

---

## Deep Dives

### Archive Cryptographic Integrity Analysis

The Merkle chain verification in `protocol-handoff.cjs` implements a parent-child linking system where each entry's Evidence block records `parent-entry: sha256:<hash>`. The `verify --deep` flag extends this to archived entries in `.ai/ARCHIVE.md`.

**Current behavior**:
1. Finds `archived-parent` marker in journal preamble (line 136)
2. Locates first archive entry with matching `entry:` hash (line 230)
3. Re-hashes that entry's body (lines 231-234)
4. If hash matches, sets `foundValidArchivedEntry = true` and **breaks** (line 237)

**Problem**: The `break` statement means only the FIRST matching entry is validated. If an attacker:
1. Appends a valid archived entry
2. Later appends a tampered entry with the SAME entry hash (via content manipulation)

The verification passes because it only checks the first (valid) occurrence. This is a **fail-open** vulnerability in what should be a fail-closed system.

**Mathematical consideration**: SHA-256 collision resistance makes accidental duplicates vanishingly unlikely, but the protocol's own logic flaw creates a bypass regardless of cryptographic strength.

### Lock Theft Protection Analysis

**Status**: PASS - The `autoArchiveWorklog` function (protocol-archive.cjs:236-250) correctly:
1. Checks if lock is held by another session (line 134-139)
2. Throws error if lock owner differs from archive owner (line 138)
3. Allows archive if lock owner matches archive owner (line 135-136)
4. Acquires new lock if no lock exists (line 140-143)

The `--session-pid` flag in `protocol-lock.cjs` (lines 164-169) validates input properly.

### Windows Atomic Rename Analysis

**Status**: PASS - The `atomicRename` function (protocol-archive.cjs:71-84) correctly implements:
- 5 retries with exponential backoff (base 50ms, factor 1.5)
- Handles EPERM, EBUSY, EACCES errors
- Uses `Atomics.wait` for timing (cross-platform)
- Proper cleanup in finally block (lines 188-195)

### Legacy Evidence Compatibility Analysis

**Status**: PASS - The `findParentEntry` function (protocol-handoff.cjs:140-168) correctly:
- Returns 'tampered' for format >= 4 without entry hash
- Returns 'legacy' for format < 4 or missing entry
- Only returns 'tampered' if parent explicitly marked

### DATE_HEADING_REGEX Universality Analysis

**Status**: PASS - All modules import canonical regex from `protocol-hooks.cjs`:
- Pattern: `/^## \d{4}-\d{2}-\d{2}(?: \d{2}:\d{2}(?::\d{2})?(?: (?:[A-Za-z0-9_]+|[+-]\d{2}(?::?\d{2})?|Z))?)? - .+/`
- Supports: YYYY-MM-DD, HH:MM[:SS], timezone offsets (+03:00, Z, UTC)

### Liveness-First Cleanup Analysis

**MIXED**:
- CORRECT: Line 226 - Active processes protected (`isProcessAlive(state) === true`)
- CORRECT: Line 240 - Confirmed dead processes removed with --force (`isProcessAlive(state) === false`)
- INCORRECT: Line 250 - Foreign host snapshots deleted after 7 days (`isProcessAlive(state) !== true` evaluates true for null)

The liveness-first principle requires treating UNKNOWN (null) as SAFE (don't delete), not as eligible for deletion.

---

## Alternatives Considered & Trade-offs

- **Alternative to F-001**: Hash all archived entries during verify --deep regardless of parent link. **Rejected because**: Performance impact on large archives; targeted re-hashing of linked entries is sufficient if implemented correctly.
- **Alternative to F-003**: Add hostname field to snapshot and check during cleanup. **Rejected because**: Existing isProcessAlive already checks hostname; the bug is in the boolean logic.
- **Alternative to F-002**: Make Approved by optional for PROTO-DEC-*. **Rejected because**: Violates protocol's core principle that all decisions require human approval.

---

## Recommendations & Actionable Plan

1. **CRITICAL**: Fix F-001 by removing `break` in deep archive verification and validating ALL entries with matching hash
2. **CRITICAL**: Fix F-002 by adding `Approved by: RuslanFomenko` to PROTO-DEC-0027 block
3. **CRITICAL**: Fix F-003 by changing `isProcessAlive(state) !== true` to `isProcessAlive(state) === false` in stale snapshot cleanup (line 250)
4. **HIGH**: Fix F-004 by removing break as part of F-001 resolution
5. **HIGH**: Fix F-005 by using proper regex matching instead of string inclusion
6. **MEDIUM**: Complete F-006 PROTO-DEC-0027 decision block
7. Re-run full test suite: `powershell -ExecutionPolicy Bypass -File .\test-protocol.ps1`
8. Re-run validator: `powershell -ExecutionPolicy Bypass -File .\validate-protocol.ps1`

---

## References

- Decision blocks: `PROTO-DEC-0027`, `DEC-0001`, `DEC-0021` in `.ai/DECISIONS.md`
- Active task: `.ai/TASK.md`
- Associated session journal: `.ai/worklog/mistral-vibe-v1.9.3-audit.md`
- Related reviews: `docs/reviews/2026-09-18-<agent>-<topic>.md` (multi-model council reports)
- Test files: `tests/lock.test.cjs`, `tests/handoff.test.cjs`, `tests/session.test.cjs`, `tests/validator.test.cjs`
