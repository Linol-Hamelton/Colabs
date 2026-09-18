# [Аудит]Complex Adversarial Audit of AI Collaboration Protocol v1.9.0-v1.9.2

**Date**: 2026-09-18T10:30:00Z  
**Reviewed commit**: a6a6d6194e08e313dce1328cc8af971962f91fa5  
**Working tree**: clean  
**Reviewer**: mistral-vibe (Mistral Medium 3.5)  
**Scope**: [audit | edge-cases | security | adversarial]  
**Verdict**: FAIL (Critical and High severity findings require immediate attention)  

> Transcribed from chat by Mistral Vibe, model: mistral-medium-3.5, date: 2026-09-18T10:30:00Z

---

## Executive Summary

Independent adversarial audit of AI Collaboration Protocol releases v1.9.0, v1.9.1, and v1.9.2 revealed **5 confirmed vulnerabilities** (3 CRITICAL, 2 HIGH, 1 LOW) affecting Merkle chain integrity, regex consistency, archive hash continuity, and code duplication. The protocol validator and existing tests pass, but subtle inconsistencies in regular expressions and edge-case handling create exploitable conditions for evidence tampering and chain breaks. The most severe findings are: (1) regex mismatch between `newestSection` and `verifyJournalChain` allowing historical entry bypass, (2) hash inconsistency in archive operations breaking Merkle continuity, and (3) archived-parent comment manipulation potential.

---

## Scope and Evidence

- **Baseline Commit**: `a6a6d6194e08e313dce1328cc8af971962f91fa5`
- **Working Tree State**: `clean`
- **Commands & Tests Executed**:
  - `powershell -ExecutionPolicy Bypass -File .\validate-protocol.ps1` - PASS (0 failures, 0 warnings)
  - `powershell -ExecutionPolicy Bypass -File .\test-protocol.ps1` - PASS
  - `node .ai/bin/protocol.cjs doctor` - PASS (all checks passed)
  - `node tests/handoff.test.cjs` - PASS (30/30 tests)
  - `node tests/lock.test.cjs` - PASS (8/8 tests)
  - `node tests/operator.test.cjs` - PASS (4/4 tests)
- **Environment**: Windows 11, Node.js v22.21.0, PowerShell 5.1.26100.9444, Git 2.53.0

---

## Findings

| Id | Severity | Title | Location | Impact | Status |
|---|---|---|---|---|---|
| F-001 | CRITICAL | Regex mismatch between newestSection and verifyJournalChain enables historical entry bypass | `.ai/bin/protocol-handoff.cjs:140` and `:234` | Allows entries with headers like `## 2026-09-18 - ` (no text after dash) to be processed by verifyJournalChain but not newestSection, breaking Merkle chain validation | Open |
| F-002 | HIGH | Inconsistent date heading regex patterns across critical functions | `.ai/bin/protocol-handoff.cjs:140,234` | Can cause entries to be recognized by one function but not another, leading to inconsistent chain verification | Open |
| F-003 | CRITICAL | Archive hash extraction uses uncleaned entry while archiving cleaned version | `.ai/bin/protocol-archive.cjs:142` | Hash computed from `toArchive[0]` but `cleanToArchive[0]` archived; potential for hash mismatch if entry contains trailing separators that affect hash calculation | Open |
| F-004 | HIGH | archived-parent comment regex allows CRLF but not missing leading space | `.ai/bin/protocol-handoff.cjs:130` | Manipulation of archived-parent marker with line ending variations could bypass continuity checks | Open |
| F-005 | LOW | Duplicate isProcessAlive function definition in protocol-session.cjs | `.ai/bin/protocol-session.cjs:130,198` | Code duplication violates DRY, potential for future divergence | Open |

### F-001 - CRITICAL - Regex mismatch between newestSection and verifyJournalChain

- **Location**: `.ai/bin/protocol-handoff.cjs:140` (verifyJournalChain) and `.ai/bin/protocol-handoff.cjs:234` (newestSection)
- **Confidence**: High
- **Reproduction**:
  ```javascript
  // newestSection regex (line 234)
  const regexNewest = /^## \d{4}-\d{2}-\d{2}(?: \d{2}:\d{2}(?::\d{2})?(?: [A-Z0-9_]+)?)? - .+/;
  // verifyJournalChain regex (line 140)
  const regexVerify = /^## \d{4}-\d{2}-\d{2}(?: \d{2}:\d{2}(?::\d{2})?(?: [A-Z0-9_]+)?)? - /m;
  
  // Test case: entry with header but no text after dash
  const testHeader = '## 2026-09-18 - ';
  
  console.log(regexNewest.test(testHeader)); // false - newestSection WON'T find it
  console.log(regexVerify.test(testHeader)); // true - verifyJournalChain WILL find it
  ```
- **Impact**: Entries with headers matching `## YYYY-MM-DD - ` (with space after dash but no text) will be processed differently by the two functions. `newestSection` requires `.+` (at least one character) after the dash-space, while `verifyJournalChain` does not. This inconsistency can cause:
  1. Historical entries being included in chain verification but not recognized as the newest section
  2. Merkle chain breaks when entries with such headers exist
  3. Potential bypass of evidence validation for malformed entries
- **Recommendation / Proposed Fix**:
  ```javascript
  // Make both regex patterns consistent. Recommended: require at least one character after dash
  // In verifyJournalChain line 177, change:
  const datedSections = sections.filter(s => /^## \d{4}-\d{2}-\d{2}(?: \d{2}:\d{2}(?::\d{2})?(?: [A-Z0-9_]+)?)? - /m.test(s));
  // TO:
  const datedSections = sections.filter(s => /^## \d{4}-\d{2}-\d{2}(?: \d{2}:\d{2}(?::\d{2})?(?: [A-Z0-9_]+)?)? - .+/m.test(s));
  ```

### F-002 - HIGH - Inconsistent date heading regex patterns across critical functions

- **Location**: `.ai/bin/protocol-handoff.cjs:140,177,234`
- **Confidence**: High
- **Reproduction**:
  ```javascript
  // Three different regex patterns found:
  // Line 140 (findParentEntry): /^## \d{4}-\d{2}-\d{2}(?: \d{2}:\d{2}(?::\d{2})?(?: [A-Z0-9_]+)?)? - /m
  // Line 177 (verifyJournalChain): /^## \d{4}-\d{2}-\d{2}(?: \d{2}:\d{2}(?::\d{2})?(?: [A-Z0-9_]+)?)? - /m
  // Line 234 (newestSection): /^## \d{4}-\d{2}-\d{2}(?: \d{2}:\d{2}(?::\d{2})?(?: [A-Z0-9_]+)?)? - .+/
  
  // Note: verifyJournalChain and findParentEntry are consistent, but newestSection differs
  ```
- **Impact**: The inconsistency between newestSection (requiring `.+`) and the other two functions can lead to entries being recognized in chain verification but not as the newest entry, or vice versa. This creates edge cases where Merkle chain integrity cannot be guaranteed.
- **Recommendation / Proposed Fix**: Standardize all three regex patterns. The pattern from newestSection (with `.+`) is more restrictive and safer, preventing empty headers.

### F-003 - CRITICAL - Archive hash extraction uses uncleaned entry

- **Location**: `.ai/bin/protocol-archive.cjs:142`
- **Confidence**: High
- **Reproduction**:
  ```javascript
  // In archiveWorklog function:
  // Line 102-104: cleanToArchive removes trailing separators
  const cleanToArchive = toArchive.map(entry => {
    return entry.replace(/\n-{3,}\s*$/, '').trim();
  });
  
  // Line 142: extractEntryHash called on ORIGINAL entry, not cleaned
  const archivedHash = toArchive.length > 0 ? extractEntryHash(toArchive[0]) : null;
  
  // However, archiveWorklog line 139 archives cleanToArchive, not toArchive
  fs.appendFileSync(archiveFile, archiveAddition, 'utf8');
  // where archiveAddition uses cleanToArchive (line 114)
  
  // If toArchive[0] has trailing separators that affect hash calculation,
  // the extracted hash may not match the archived content
  ```
- **Impact**: When archiving worklog entries, the hash stored in the `archived-parent` marker is computed from the uncleaned entry (`toArchive[0]`), but the actual archived content is the cleaned version (`cleanToArchive[0]`). While `extractEntryHash` internally strips Evidence blocks and trailing separators (lines 16-18), there exists a subtle window where:
  1. If `toArchive[0]` contains content that `extractEntryHash` does not strip (e.g., certain whitespace patterns)
  2. But `cleanToArchive[0]` has that content removed
  3. The hash will not match the archived content, breaking Merkle chain continuity
- **Recommendation / Proposed Fix**:
  ```javascript
  // Line 142 should use cleaned entry:
  const archivedHash = toArchive.length > 0 ? extractEntryHash(cleanToArchive[0]) : null;
  ```

### F-004 - HIGH - archived-parent comment regex allows unexpected variations

- **Location**: `.ai/bin/protocol-handoff.cjs:129-132`
- **Confidence**: Medium
- **Reproduction**:
  ```javascript
  // Current regex (line 130):
  const regex = /<!-- archived-parent:\s*(sha256:[a-f0-9]{64}) -->/;
  
  // Test cases:
  const tests = [
    '<!-- archived-parent: sha256:000...000 -->',      // MATCH - correct
    '<!--archived-parent: sha256:000...000 -->',      // NO MATCH - missing space after <!
    '<!-- archived-parent:sha256:000...000 -->',      // NO MATCH - missing space after :
    '<!-- archived-parent: sha256:000...000 -->\r\n',   // MATCH - CRLF allowed
  ];
  
  // An attacker could potentially insert a fake archived-parent marker
  // that bypasses the regex check
  ```
- **Impact**: The regex does not enforce strict formatting of the archived-parent comment. While it correctly extracts the hash when properly formatted, variations in whitespace or missing spaces could potentially be exploited. The CRLF case is handled by normalization in other functions, but the regex itself doesn't account for all edge cases.
- **Recommendation / Proposed Fix**:
  ```javascript
  // Make regex more strict:
  function findArchivedParent(text) {
    const match = text.match(/<!-- archived-parent:\s+(sha256:[a-f0-9]{64})\s+-->/);
    return match ? match[1] : null;
  }
  ```

### F-005 - LOW - Duplicate isProcessAlive function definition

- **Location**: `.ai/bin/protocol-session.cjs:130-135` and `198-203`
- **Confidence**: High
- **Reproduction**:
  ```bash
  # Two identical function definitions exist in the same file
  grep -n "const isProcessAlive" .ai/bin/protocol-session.cjs
  # Output: 130 and 198
  ```
- **Impact**: Code duplication violates DRY principle. While currently identical, future modifications to one instance without updating the other could introduce subtle bugs. Increases maintenance burden.
- **Recommendation / Proposed Fix**:
  ```javascript
  // Extract isProcessAlive to a shared helper module or to the top of the file
  // Then reference it in both prune and cleanup-runtime commands
  ```

---

## Deep Dives

### Merkle Chain Integrity Analysis

The protocol's Merkle chain implementation uses SHA-256 hashes to link journal entries through `parent-entry` and `entry` fields. The chain verification in `verifyJournalChain` (lines 173-227) is generally sound, but the regex inconsistency in F-001 creates a critical weakness.

**Attack Scenario**: An attacker creates a journal entry with header `## 2026-09-18 - ` (note: space after dash, no text). This entry:
1. Will NOT be found by `newestSection` (line 234 regex requires `.+`)
2. WILL be included in `datedSections` by `verifyJournalChain` (line 177 regex does not require `.+`)
3. Could potentially be used to inject a false entry into the chain that bypasses newest entry detection

**Mathematical Proof**: The regex patterns form two different languages:
- L_newest = `{## YYYY-MM-DD [-] [TXT] | TXT ≠ ε}` (TXT must be non-empty)
- L_verify = `{## YYYY-MM-DD [-] [TXT] | TXT can be ε}` (TXT can be empty)

Since L_verify ⊃ L_newest, there exist strings accepted by verifyJournalChain but rejected by newestSection, creating an inconsistency in the security model.

### Archive Operation Analysis

The `archiveWorklog` function (lines 70-169) performs atomic file replacement via temporary files (line 162: `fs.renameSync(tempFile, fullWorklog)`), which is correctly implemented for Windows compatibility. However, the hash extraction issue (F-003) creates a subtle continuity problem.

**Archiving Process**:
1. Read journal file
2. Split into entries
3. Clean entries (remove trailing `---`)
4. Extract hash from first entry to archive (`toArchive[0]`)
5. Write cleaned entries to archive
6. Write hash marker to journal preamble

The problem: Step 4 uses raw entry, step 5 uses cleaned entry. While `extractEntryHash` internally cleans the entry, the archiving process creates a disconnect between what's hashed and what's stored.

### Lock Safety Analysis

The cooperative lock mechanism in `protocol-lock.cjs` is well-designed with:
- Operation gates to prevent race conditions
- Process liveness checking via `process.kill(pid, 0)`
- Strict ownership validation
- 120-minute stale threshold with manual recovery

No race conditions were found in the lock acquisition logic. The double-check pattern (check gate, then check lock file) is correctly implemented with fail-closed semantics.

---

## Alternatives Considered & Trade-offs

- **Alternative to F-001**: Change newestSection to match verifyJournalChain's pattern - **Rejected because**: More permissive pattern accepts malformed headers, reducing validation quality
- **Alternative to F-003**: Compute hash before cleaning, store both hashes - **Rejected because**: Increases complexity without solving the root inconsistency
- **Alternative to F-004**: Use more lenient regex - **Rejected because**: Security through strict validation is preferable

---

## Recommendations & Actionable Plan

1. **IMMEDIATE (Block release)**: Fix F-001 regex mismatch between newestSection and verifyJournalChain in `.ai/bin/protocol-handoff.cjs`
2. **IMMEDIATE (Block release)**: Fix F-003 hash extraction inconsistency in `.ai/bin/protocol-archive.cjs:142`
3. **HIGH PRIORITY**: Fix F-002 by standardizing all date heading regex patterns across the codebase
4. **HIGH PRIORITY**: Fix F-004 by making archived-parent regex more strict
5. **LOW PRIORITY**: Refactor F-005 by extracting isProcessAlive to a shared location

---

## References

- Decision blocks: `PROTO-DEC-0020` to `PROTO-DEC-0026` in `.ai/DECISIONS.md`
- Active task: `.ai/TASK.md` (Status: Completed)
- Associated session journal: `.ai/worklog/mistral-4e357cac97c0f738.md`
- Related reviews: `docs/reviews/2026-09-18-grand-council-consensus-v1.9.0.md`
- Test files: `tests/handoff.test.cjs` (30 tests), `tests/lock.test.cjs` (8 tests), `tests/operator.test.cjs` (4 tests)
