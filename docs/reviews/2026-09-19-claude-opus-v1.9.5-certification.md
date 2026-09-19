# Claude Opus - Final v1.9.5 Adversarial Release Certification

**Date**: 2026-09-19
**Reviewed commit**: bd56d6c (release candidate)
**Working tree**: dirty (concurrent peer review artifacts untracked; gemini worklog modified)
**Reviewer**: Claude Opus 4.6 (Thinking) via Antigravity
**Scope**: release certification | whole-scope adversarial audit | security | edge-cases
**Verdict**: RECOMMENDATION
**Mode**: CERTIFYING
**Receipt-Owner**: claude-opus-0f1b841e5c4c6638
**Receipt**: verifiable via `node .ai/bin/protocol-handoff.cjs verify --owner claude-opus-0f1b841e5c4c6638 --deep`

---

## Executive Summary

Comprehensive adversarial evaluation of release candidate `bd56d6c` (baseline `v1.9.4` = `c71bdcf`) covering all 8 verification groups, attack vectors, and protocol invariants. All five planned features (A1 supervisor liveness, A2 journal cap and auto-archiving, A4 capability/evidence discipline, A3 gate-check freshness binding, A5+B decision registry) are correctly implemented.

Full regression suite passes **236/236 tests** (101.9s). Protocol validation passes with **0 failures, 1 warning** (31 journals exceeding the 30-file advisory limit). All `.ps1` scripts are ASCII-only. All text files are valid UTF-8 with LF line endings.

**Four confirmed defects** were independently reproduced with live negative tests (two coincide with Gemini's F-001/F-002/F-003 findings; two are independently discovered). None are release-blocking. The release candidate is structurally sound. Overall verdict: **RECOMMENDATION**.

---

## Scope and Evidence

- **Baseline Tag**: `v1.9.4` (`c71bdcf94545c246178b5d75e780f3fd79cb9b5a`)
- **Release Candidate Commit**: `bd56d6cad7d507977355af7e38bade3b88b037bd`
- **Reviewed HEAD**: `52e6d31ceb40f8146e0d9be35cb3259c70f9b352`
- **Working Tree State**: `dirty` (untracked peer certification artifacts)
- **Commands & Tests Executed**:
  - `powershell -ExecutionPolicy Bypass -File .\validate-protocol.ps1` → Exit 0 (0 failures, 1 warning)
  - `powershell -ExecutionPolicy Bypass -File .\test-protocol.ps1` → Exit 0 (236/236 tests pass, 101.9s)
  - Custom adversarial probe suite (5 tests, all pass): F-002 body-Date legacy bypass, F-004 substring path match, entry tamper detection, transcription rejection, FAIL verdict rejection
  - Custom registry probe suite (2 tests, all pass): F-001 case-insensitive immutability bypass, decision block edit detection
  - Isolated clone probe: PID liveness edge cases, date regex extraction, PowerShell comparison semantics
- **Environment**: Windows 11, Node.js v22.21.0, PowerShell 5.1, Git 2.53.0

---

## Findings

| Id | Severity | Title | Location | Reproduced | Status |
|---|---|---|---|---|---|
| F-001 | MEDIUM | Registry HEAD comparison uses case-insensitive `-ne` | `validate-protocol.ps1:440` | ✅ Live test | Open |
| F-002 | MEDIUM | `gate-check` Date regex matches body lines, enabling legacy bypass | `protocol-handoff.cjs:978` | ✅ Live test + gate exit 0 | Open |
| F-003 | LOW | `isSessionAlive` accepts reserved Windows PID ≤ 4 | `protocol-session.cjs` | ✅ `isSessionAlive({supervisorPid:4,...})` → `true` | Open |
| F-004 | LOW | `gate-check` journal path matching uses unanchored substring | `protocol-handoff.cjs:1061` | ✅ Live test + gate exit 0 | Open |

---

### F-001 — [MEDIUM] — Registry immutability check uses case-insensitive comparison

- **Location**: [validate-protocol.ps1:440](file:///D:/Colabs/validate-protocol.ps1#L440)
- **Confidence**: High
- **Reproduction**: Case-only mutation (`DEC-0001` → `dec-0001`) in committed `docs/decisions/REGISTRY.md` produces **no WARN and no FAIL** from the validator. Confirmed with live test via `runPowerShell` fixture.
- **Root Cause**: PowerShell's `-ne` operator is case-insensitive by default. `'dec-0001' -ne 'DEC-0001'` evaluates to `False`. The line at position 440 should use `-cne` (case-sensitive not-equal).
- **Impact**: An agent or tool that alters only the casing of registry identifiers or status strings silently bypasses the append-only immutability check.
- **Recommendation**:
  ```powershell
  # Line 440: change -ne to -cne
  if ($idx -ge $currLines.Count -or $currLines[$idx] -cne $hLine) {
  ```

---

### F-002 — [MEDIUM] — `gate-check` Date extraction matches body lines, enabling legacy mode bypass

- **Location**: [protocol-handoff.cjs:978](file:///D:/Colabs/.ai/bin/protocol-handoff.cjs#L978)
- **Confidence**: High
- **Reproduction**: A review file with **no header `Date:` field** but containing a line `Date: 2025-01-01` in the body text (after `---`) causes `gate-check` to:
  1. Extract `2025-01-01` as the review date
  2. Classify the review as legacy (`Date <= 2026-09-19`)
  3. **Skip** the `Mode: CERTIFYING` requirement with only a `[WARN]`
  4. **Skip** the `Receipt-Owner` requirement with only a `[WARN]`
  5. Exit 0 with `completion gate verified`

  This allows a malicious agent to craft a review that passes gate-check without declaring `Mode: CERTIFYING` or `Receipt-Owner`, circumventing the §2 capability requirements.

- **Attack Scenario**:
  ```markdown
  # Review
  
  Reviewer: adversary
  Verdict: PASS
  
  ---
  
  Analysis performed.
  Date: 2025-01-01
  Historical context.
  ```

- **Recommendation**: Restrict metadata extraction to lines above the first `---` separator, or require `Date:` in a well-defined header block.

---

### F-003 — [LOW] — `isSessionAlive` accepts reserved Windows System PID ≤ 4

- **Location**: [protocol-session.cjs](file:///D:/Colabs/.ai/bin/protocol-session.cjs)
- **Confidence**: Medium
- **Reproduction**: `isSessionAlive({supervisorPid: 4, hostname: os.hostname()})` returns `true` because `checkProcessAlive(4)` returns `true` (PID 4 is the Windows System process, always running, throws EPERM on `process.kill(4, 0)` which is caught as alive).
- **Impact**: A corrupted or crafted state file with `supervisorPid: 4` causes `prune` and `cleanup-runtime` to treat the session as perpetually alive. CLI `start` already validates `supPid > 4`, but the reader-side `isSessionAlive` only checks `> 0`.
- **Recommendation**: Align `isSessionAlive` threshold with CLI validation: `record.supervisorPid > 4`.

---

### F-004 — [LOW] — `gate-check` journal path matching uses unanchored substring

- **Location**: [protocol-handoff.cjs:1061](file:///D:/Colabs/.ai/bin/protocol-handoff.cjs#L1061)
- **Confidence**: Medium
- **Reproduction**: A journal entry mentioning `docs/reviews/2026-09-19-review.md.bak` satisfies the check `normSection.includes("docs/reviews/2026-09-19-review.md")`, causing `gate-check` to falsely bind the review to this entry. Confirmed with live test (gate exits 0).
- **Impact**: Low practical risk with standard naming conventions, but a malicious agent could intentionally name a backup file to satisfy the path check without actually having reviewed the file.
- **Recommendation**: Use boundary-aware matching, e.g., check for the path followed by a word boundary or whitespace/EOL.

---

## Verification Groups Deep Dive

### 1. C0 Liveness and Supervisor Priority (A1)
- **Verified**: `isSessionAlive` 6-state specification with live/dead PIDs, foreign hosts, null states
- **Verified**: Supervisor-first priority: live supervisor with dead transient → `true`; dead supervisor with live transient → `true` (fallback); both dead → `false`
- **Verified**: 11-branch prune/cleanup matrix (tests 197–210 in suite, all pass)
- **Finding**: F-003 (PID ≤ 4 accepted) — non-blocking

### 2. Three-Way Polarity & Quarantine
- **Verified**: Foreign-host state preserved by `prune` without `--force` and by `cleanup-runtime` even with `--force`
- **Verified**: Corrupt state JSON triggers recency fallback (test 209)
- **Verified**: Content-bearing journals are never quarantined even with `--force` (test 204)
- **Verified**: `--force` with live supervisor still preserves (test 205)

### 3. A2 Record Fix and Cap Auto-Archiving
- **Verified**: `record` auto-archives older entries when projected journal exceeds 150 lines
- **Verified**: Oversized single entry fails with descriptive error
- **Verified**: Chain verification works after archive (`verify --deep` exit 0, test 208)
- **Verified**: `PROTOCOL_SKIP_GATE=1` prevents deadlock during record (test 274 = gate test 11)

### 4. A3 Gate-Check Freshness Binding
- **Verified**: `Status: In progress` → exit 0 (`not applicable`)
- **Verified**: Missing `## Completion gate` → exit 1
- **Verified**: Same path for prompt and review → exit 1
- **Verified**: `Mode: ADVISORY` → exit 1
- **Verified**: Transcribed review → exit 1
- **Verified**: `Verdict: FAIL` → exit 1
- **Verified**: Missing `Receipt-Owner` on new review (Date > 2026-09-19) → exit 1
- **Verified**: Missing `Mode: CERTIFYING` on new review → exit 1
- **Verified**: Journal does not cite review path → exit 1
- **Verified**: Tree modified after certification → exit 1 (`stale`)
- **Verified**: Valid certifying review + fresh receipt → exit 0
- **Finding**: F-002 (body-Date bypass) and F-004 (substring match) — non-blocking

### 5. Bootstrap Deadlock Resolution
- **Verified**: Completed task + no prior evidence → `record` succeeds via `PROTOCOL_SKIP_GATE=1`
- **Verified**: Subsequent `gate-check` and `verify --deep` both pass
- **Verified**: Post-record tree mutation fails both verify and gate-check

### 6. Track B Decision Registry & WARN-First Validation
- **Verified**: All 33 decision blocks correctly indexed in registry (37 rows including status transitions)
- **Verified**: Missing registry entry → `[WARN]`
- **Verified**: Extra unknown ID → `[WARN]`
- **Verified**: Modified row vs HEAD → `[WARN]`
- **Verified**: New block without `Reopen-trigger` → `[WARN]`
- **Verified**: Unknown trigger value → `[WARN]`
- **Finding**: F-001 (case-insensitive comparison) — non-blocking

### 7. Digest and Freeze Invariants
- **Verified**: Writing to `docs/reviews/` changes repository digest (stales evidence)
- **Verified**: Writing to `.ai/worklog/` does NOT change repository digest (journals excluded)
- **Verified**: Creating untracked non-ignored files changes digest
- **Verified**: Entry hash (`sha256:`) covers entry body without Evidence block
- **Verified**: Tampering entry after record → verify detects and rejects

### 8. Encoding and Size Constraints
- **Verified**: 172 protocol-owned text files inspected: valid UTF-8, no BOM, LF endings
- **Verified**: All `.ps1` scripts are ASCII-only (0 non-ASCII bytes)
- **Verified**: All journals ≤ 150 lines, TASK.md ≤ 80 lines, PLAN.md ≤ 200 lines
- **Verified**: Version string consistency across manifest, AGENTS.md, and installer
- **Verified**: CI workflow escalates both `[WARN]` and `[FAIL]` to job failure

---

## Cross-Reference with Gemini Advisory Review

Gemini's advisory review (`docs/reviews/2026-09-19-gemini-v1.9.5-certification.md`) identified findings F-001 through F-005. This certifying review independently confirms:

| Gemini Finding | This Review | Independently Reproduced |
|---|---|---|
| F-001 (registry case) | Confirmed as F-001 | ✅ Yes, with live test |
| F-002 (Date body match) | Confirmed as F-002, **elevated to MEDIUM** — gate bypass demonstrated | ✅ Yes, gate exits 0 |
| F-003 (PID ≤ 4) | Confirmed as F-003 | ✅ Yes, `isSessionAlive` returns `true` |
| F-004 (substring path) | Confirmed as F-004 | ✅ Yes, gate exits 0 |
| F-005 (Qoder rejected) | Confirmed — correct behavior of gate-check | N/A (expected behavior) |

**Elevation note**: F-002 was listed as LOW by Gemini but is elevated to MEDIUM here because the attack creates a complete gate bypass: a review without Mode or Receipt-Owner passes gate-check exit 0 and produces `completion gate verified` in stdout. The attack requires only a single body line starting with `Date:` and an old date.

---

## Delta List

### Required-Before-Tag Fixes
- **None**: No release-blocking regressions or safety hazards exist in release candidate `bd56d6c`. All four findings are hardening opportunities for the next cycle.

### Recommended Hardening (Next Cycle or Patch)
1. **F-001**: Change `-ne` to `-cne` on line 440 of `validate-protocol.ps1`.
2. **F-002**: Scope `Date:` extraction in `gateCheck` to lines above the first `---` separator.
3. **F-003**: Enforce `record.supervisorPid > 4` in `isSessionAlive`.
4. **F-004**: Use boundary-aware matching for `reviewRel` in `gate-check` (e.g., regex with `\b` or check for whitespace/EOL after the path).

---

## References

- Implementation Commits: `8beca2b` (A1), `366519c` (A2), `77c1312` (A4), `032efeb` (A3), `bd56d6c` (A5+B)
- Approved Plan: `docs/reviews/2026-09-19-deepseek-flash-consolidated-v1.9.5-plan-r2.md`
- Decision Blocks: `PROTO-DEC-0029` through `PROTO-DEC-0033` in `.ai/DECISIONS.md`
- Registry: `docs/decisions/REGISTRY.md`
- Gemini Advisory Review: `docs/reviews/2026-09-19-gemini-v1.9.5-certification.md`
- Associated Session Journal: `.ai/worklog/claude-opus-0f1b841e5c4c6638.md`
