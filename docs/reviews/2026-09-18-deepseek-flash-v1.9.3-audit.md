# DeepSeek Flash - Adversarial Audit of Protocol v1.9.3 (PROTO-DEC-0027 implementation)

**Date**: 2026-09-18  
**Reviewed commit**: a6a6d6194e08e313dce1328cc8af971962f91fa5  
**Working tree**: dirty  
**Reviewer**: deepseek-flash (DeepSeek, Kilo Code terminal session)  
**Scope**: [audit | security | edge-cases]  
**Verdict**: **FAIL** (4 defects, 3 recommendations; none release-blocking alone, but F-01/F-02 falsify stated invariants)  
**Superseded by**: `docs/reviews/2026-09-18-deepseek-flash-v1.9.3-audit-r2.md` (round 1 measured an earlier dirty tree, 05:55Z; kernel files changed at 06:50-07:07Z)

---

## Executive Summary

The eight PROTO-DEC-0027 items exist in code and the full regression suite passes (186/186, exit 0), yet two stated invariants are falsified. F-01: `protocol-session.cjs` and `protocol-handoff.cjs` call `path.basename(...)` without ever requiring `node:path` in that scope; every such call throws a `ReferenceError` that the surrounding empty `catch {}` swallows, so the CLI auto-archive wiring is dead code. F-02: `--session-pid` is parsed and stored but passed by no caller in the repository, and invalid values silently fall back to the live CLI process PID, so the feature's claimed protection is inert. F-03: `verify --deep` accepts a forged archive when a pristine copy of the parent exists anywhere else in `.ai/ARCHIVE.md`, so it is not fail-closed. F-04: the regex unification covers only 2 of 5 heading parsers; the Stop/SessionStart hooks still reject timestamped and timezone-offset headings that `record` writes.

---

## Scope and Evidence

- **Baseline Commit**: `a6a6d6194e08e313dce1328cc8af971962f91fa5` (v1.9.2 tag content; deliverables uncommitted)
- **Working Tree State**: `dirty` (15 modified + 12 untracked protocol files at review time)
- **Commands & Tests Executed**:
  - `powershell -NoProfile -ExecutionPolicy Bypass -File .\validate-protocol.ps1` -> exit 0, `Protocol OK. 0 warning(s).`
  - `powershell -NoProfile -ExecutionPolicy Bypass -File .\test-protocol.ps1` -> exit 0, `# tests 186 # pass 186 # fail 0`, `duration_ms 481836.75`
  - Targeted probes on throwaway fixtures (see Findings; all reproducible standalone)
- **Environment**: Windows 11 x64 (10.0.26100), Node.js v22.21.0, Windows PowerShell 5.1.26100.9444, Git 2.x, `core.autocrlf` default.

---

## Findings

| Id | Severity | Title | Location | Impact | Status |
|---|---|---|---|---|---|
| F-01 | HIGH | CLI stop/record auto-archive throws ReferenceError swallowed by empty catch | `.ai/bin/protocol-session.cjs:112`, `.ai/bin/protocol-handoff.cjs:414` | CLI-hookless sessions get no auto-archive from the CLI path; failure is invisible; hook path masks it | Open |
| F-02 | HIGH | `--session-pid` has no caller and no validation; garbage PID silently becomes the live process PID | `.ai/bin/protocol-lock.cjs:139,164` | The claimed persistent-CLI-lock protection is inert; a supposed "unknown liveness" lock is recorded as a live PID that dies with the one-shot command | Open |
| F-03 | HIGH | Deep archive verification accepts a forged duplicate entry anywhere in ARCHIVE.md | `.ai/bin/protocol-handoff.cjs:220-245` | `verify --deep` is not fail-closed against archive manipulation: tampered archived body still verifies if a pristine copy exists elsewhere in the archive | Open |
| F-04 | MEDIUM | Heading regex unification covers 2 of 5 parsers; hooks still reject timestamp/timezone headings | `.ai/bin/protocol-hooks.cjs:245,315`, `.ai/bin/protocol.cjs:207,209,236` | `record` accepts `## 2026-09-18 11:30:00 +03:00 - t`, but Stop/SessionStart classify the same entry as incomplete; test 41 gives false confidence | Open |
| F-05 | MEDIUM | Archive append precedes the journal rewrite; rename failure forks ARCHIVE.md from the journal | `.ai/bin/protocol-archive.cjs:148,171` | A failed `atomicRename` (5 retries exhausted) leaves the entry appended to ARCHIVE.md while it remains in the journal; a later archive duplicates it | Open |
| F-06 | LOW | Invalid `--session-pid` accepted silently (NaN/0/negative) | `.ai/bin/protocol-lock.cjs:164` | Junk input is not rejected; it silently degrades to `process.pid`, contradicting the "unknown liveness" premise | Open |
| F-07 | LOW | Stale-snapshot rule (7 days) still removes foreign-host snapshots without a liveness check | `.ai/bin/protocol-session.cjs:251-257` | A remote session's snapshot is destroyed after 7 days despite `--force` protection | Open |

### F-01 - [HIGH] - CLI stop/record auto-archive throws ReferenceError swallowed by empty catch

- **Location**: `.ai/bin/protocol-session.cjs:112` (`const owner = path.basename(paths.worklog, '.md');`), `.ai/bin/protocol-handoff.cjs:414` (passes `options.owner` only; `path` is required at module top there, so this call site is safe)
- **Confidence**: High (instrumented probe)
- **Reproduction**:
  ```bash
  # In a fixture: seed protocol, write a >150-line complete journal, then:
  node .ai/bin/protocol-session.cjs stop --agent probe --session <sid>
  # Instrumented copy of the same module prints: "INSTRUMENT typeof path = undefined"
  ```
  `protocol-session.cjs` requires `node:path` only inside the `prune` (line 127) and `cleanup-runtime` (line 185) branches. The `stop` branch added `path.basename` without a module-level require. `typeof path === 'undefined'`, `path.basename` throws `ReferenceError`, and the empty `catch {}` at line 114 swallows it. The archive still happens in practice because `hooks.run('Stop')` (line 80) already calls `autoArchiveWorklog` with its own `path.basename` at `.ai/bin/protocol-hooks.cjs:453`; the CLI line is dead code whose failure is undetectable.
- **Impact**: Any refactor that removes or reorders the hook-side call silently disables auto-archiving for CLI sessions while `stop` keeps exiting 0. A latent trap invisible to the test suite: no test covers `stop`-branch auto-archival.
- **Recommendation / Proposed Fix**:
  ```javascript
  // protocol-session.cjs, module top:
  const path = require('node:path');
  // and delete the now-shadowing local requires in prune/cleanup-runtime.
  // Or, if the hook call is authoritative, delete the CLI block entirely:
  //   try { const archive = require('./protocol-archive.cjs');
  //         archive.autoArchiveWorklog(realpathSync(input.cwd), paths.worklog, 150, 1, owner); } catch {}
  ```

### F-02 - [HIGH] - `--session-pid` has no caller and no validation

- **Location**: `.ai/bin/protocol-lock.cjs:139` (`pid: ... forceOrOptions.sessionPid ? ... : process.pid`), `:164` (`sessionPid = Number(options[i + 1])`)
- **Confidence**: High (grep + probe)
- **Reproduction**:
  ```bash
  node .ai/bin/protocol-lock.cjs acquire --owner sess-garbage --session-pid abc
  # -> exit 0; shared-writer.json stores pid = <the live one-shot CLI pid>, not null/absent
  node .ai/bin/protocol-lock.cjs status   # later: alive=false, "held by a dead process"
  ```
  `grep -R "session-pid"` finds it only in `protocol-lock.cjs` (`:164` parser), `:139` (storage), the usage string (`:166`), and PROTO-DEC-0027's prose. No shipped call site passes it: not `protocol-session.cjs`, not `protocol-handoff.cjs`, not `protocol-archive.cjs`, not any automated install step. Consequently every CLI-acquired lock still records the ephemeral one-shot PID, exactly the condition the decision was written to fix. The declared protection ("CLI-held locks are preserved") is delivered only by the new unconditional skip in `archiveWorklog`, not by the flag.
- **Impact**: The feature is documentation, not mechanism. A one-shot CLI lock remains `alive:false` to every other session, so `acquire --force` or `clear-lock` steals it without consulting the lock liveness model. The decision's "Support `--session-pid` for lock tracking" is unimplemented at the system level.
- **Recommendation / Proposed Fix**:
  ```javascript
  // protocol-session.cjs start: print and persist the session's own PID for later lock calls
  process.stdout.write(`Session PID for lock calls: ${process.pid}\n`);
  // and have any lock acquire performed on behalf of a session pass --session-pid.
  // protocol-lock.cjs: validate before storing:
  //   if (!Number.isInteger(sessionPid) || sessionPid <= 0) throw new Error('--session-pid must be a positive integer');
  // or store null explicitly, which isProcessAlive() already maps to "unknown".
  ```

### F-03 - [HIGH] - Deep archive verification accepts a forged duplicate

- **Location**: `.ai/bin/protocol-handoff.cjs:220-245` (`verifyJournalChain`, deep block)
- **Confidence**: High (probe N)
- **Reproduction**:
  ```bash
  # In a fixture with a certified + archived entry (deep verify exit 0):
  cp .ai/ARCHIVE.md /tmp/clean.md
  cat /tmp/clean.md /tmp/clean.md | sed 's/archive me/forged content/' >> .ai/ARCHIVE.md   # keep original too
  node .ai/bin/protocol-handoff.cjs verify --owner deep --deep   # exit 0
  ```
  The loop scans all `## ` sections, takes the first whose `entry:` equals `archivedParent`, re-hashes its body, and `break`s on match. A second, tampered copy of the same entry anywhere else in the file is never examined. Erasing the pristine copy and keeping only the forged one is also detected (hash mismatch -> fail), and an absent archive now fails (fail-closed improvement). But the `any clean copy anywhere` acceptance rule means archive content can be silently rewritten in one place while an intact copy remains in another - e.g. by duplicating a section and editing the duplicate used for human reading, or by keeping both.
- **Impact**: Partial falsification of the "absolute cryptographic immutability across journal pruning" claim. The integrity check answers "does some copy exist" instead of "is the archived record intact". With `.ai/ARCHIVE.md` the only durable copy after journal pruning, an attacker with write access (already out of scope) plus a saved copy can forge the visible record while verification stays green.
- **Recommendation / Proposed Fix**:
  ```javascript
  // Collect every section whose entry: equals archivedParent.
  const copies = archiveSections.filter(s => (s.match(/entry:\s*(sha256:[a-f0-9]{64})/) || [])[1] === archivedParent);
  if (copies.length === 0) return { ok: false, reason: `archived parent ${archivedParent} not found in .ai/ARCHIVE.md.` };
  for (const copy of copies) {
    const h = hashArchivedBody(copy);
    if (h !== archivedParent) {
      return { ok: false, reason: `archived parent ${archivedParent} was tampered in .ai/ARCHIVE.md (hash mismatch: expected ${archivedParent}, computed ${h}).` };
    }
  }
  // Optionally warn on duplicates: an archived entry must occur once.
  ```

### F-04 - [MEDIUM] - Heading regex unification covers 2 of 5 parsers

- **Location**: `.ai/bin/protocol-hooks.cjs:245` (`/^## \d{4}-\d{2}-\d{2} - .+/`), `:315`, `.ai/bin/protocol.cjs:207,209,236`; new definitions at `.ai/bin/protocol-handoff.cjs:129-130` and `.ai/bin/protocol-archive.cjs:95`
- **Confidence**: High (probe Q)
- **Reproduction**:
  ```bash
  node -e "const h=require('./.ai/bin/protocol-hooks.cjs');
  console.log(h.latestCompleteEntry('## 2026-09-18 11:30:00 +03:00 - t\n\nAgent: a\n\nAction: abc\n\nResult: abc\n\nNext step: abc\n\nOpen:\nNone.\n'))"
  # -> null: the hook does not count a heading that protocol-handoff.cjs accepted and recorded
  ```
  The three new regex constants all accept the extended forms; the hook-side `latestCompleteEntry` (used by SessionStart context and the Stop check) and `protocol.cjs` (doctor/archive ledger) still use the legacy `YYYY-MM-DD - ` shape. The test `numeric timezone offset in entry heading is supported and verified` only exercises `record`/`verify`, so it does not catch the divergence.
- **Impact**: A session using the documented timestamp/timezone heading can record evidence that verifies, while the Stop check reports "no new complete entry" and SessionStart omits the entry from injected context. PROTO-DEC-0027 item 6's "Standardize `DATE_HEADING_REGEX` across handoff and archive modules" is met literally, but the protocol still lacks one authoritative heading pattern.
- **Recommendation / Proposed Fix**:
  ```javascript
  // Export DATE_HEADING_REGEX from a single module (protocol-handoff.cjs or a new shared module)
  // and consume it in protocol-hooks.cjs (latestCompleteEntry, archive ledger) and protocol.cjs.
  // Add a test asserting that a timezone heading is a complete entry for latestCompleteEntry too.
  ```

### F-05 - [MEDIUM] - Archive append precedes the journal rewrite

- **Location**: `.ai/bin/protocol-archive.cjs:148` (`fs.appendFileSync(archiveFile, ...)`), `:171` (`atomicRename(tempFile, fullWorklog)`)
- **Confidence**: High (probe O5 and O3)
- **Reproduction**:
  ```bash
  # Make the worklog read-only / rename-proof, then archive a >keep-entry journal:
  # ARCHIVE.md grows by one entry, archiveWorklog throws EPERM, journal unchanged.
  # Restore permissions and archive again -> the same entry is appended a second time.
  ```
  The two-file commit is not atomic: entries are appended to `.ai/ARCHIVE.md` first, then the journal is atomically rewritten. If the rewrite fails after retries, the archive gains the entry while the journal keeps it. A later successful archive then duplicates the same entry (probe O5: archive length 1496 -> 1638 with the identical section twice).
- **Impact**: Duplicate archived sections; `verify --deep` still passes (the first valid copy wins), so the duplication is silent. Space growth and ambiguous archive history, not integrity loss.
- **Recommendation / Proposed Fix**:
  ```javascript
  // Write the new journal to the temp file FIRST, verify it, then append to ARCHIVE.md,
  // then rename. If the append fails, only the temp file is lost.
  // Or make the archive append idempotent: skip an entry whose entry: hash already exists.
  ```

### F-06 - [LOW] - Invalid `--session-pid` accepted silently

- **Location**: `.ai/bin/protocol-lock.cjs:164`, `:139`
- **Confidence**: High (probe C1/C2)
- **Reproduction**:
  ```bash
  node .ai/bin/protocol-lock.cjs acquire --owner s --session-pid abc   # exit 0, pid = current CLI pid
  node .ai/bin/protocol-lock.cjs acquire --owner s2 --session-pid 0    # exit 0, pid = current CLI pid
  ```
  `Number('abc')` is `NaN`, `Number('0')` is `0`; both are falsy in the ternary at line 139, so the live one-shot PID is stored. A caller who intends "PID unknown" gets exactly the ephemeral-PID failure mode the flag was meant to avoid.
- **Recommendation / Proposed Fix**: validate with `Number.isInteger(v) && v > 0`, otherwise throw; or accept an explicit `unknown` keyword that stores `null`.

### F-07 - [LOW] - Stale-snapshot rule removes foreign snapshots without a liveness check

- **Location**: `.ai/bin/protocol-session.cjs:251-257`
- **Confidence**: High (code inspection; `--force` path probed clean)
- **Reproduction**:
  ```bash
  # foreign-hostname snapshot older than 7 days:
  node .ai/bin/protocol-session.cjs cleanup-runtime --force   # survives (isProcessAlive -> null at line 241)
  # with mtime older than cutoff, control falls to line 251 and it is removed anyway.
  ```
  The liveness-first gate protects unknown owners only inside the 24h/`--force` branch. The separate 7-day rule below it still deletes any snapshot of unknown liveness.
- **Impact**: After 7 days a session on a shared network host loses its snapshot despite never being proven dead. Bounded by the cutoff, and snapshots are disposable by design, but it contradicts the "conclusively dead" wording in PROTO-DEC-0027 item 7.
- **Recommendation / Proposed Fix**: require `isProcessAlive(state) === false` for the stale branch too, or exempt `null` (unknown host) snapshots from age-based removal and require `--force` plus an explicit host confirmation.

---

## Deep Dives

### D-01 - What was actually verified green

- Validator: 87 protocol-owned text files inspected for UTF-8/BOM/LF/PowerShell syntax, 27 decision blocks, version coherence, installer self-check -> exit 0, 0 warnings. `docs/reviews/` and `templates/reviews/` are now inside protocol encoding scope (`validate-protocol.ps1:171-174`), and `docs/reviews/` is gated to `role: source`, so installed projects are not affected.
- Full suite: 186 tests, 0 fail, exit 0 (481.8 s on this machine). New tests 41-44, 89, 143 pass. The legacy (<4) classification (test 42) and the in-journal chain checks (tests 37-40) are sound.
- Positive deep verification was independently reproduced with hand-certified evidence: `verify --deep` exit 0 on a clean archive, CRLF-normalized archive, and after archiving; tampering the archived body yields the explicit "was tampered in .ai/ARCHIVE.md" failure (probe N, E2). The fail-closed improvement for a missing `ARCHIVE.md` is real (exit 1 with a precise reason).
- Lock preservation in `autoArchiveWorklog` is effective in isolation: while another owner holds the lock, the function returns `false`, writes `[WARN] autoArchiveWorklog skipped: Cannot archive: shared documents lock is held by session <owner>` to stderr, and leaves both journal and archive untouched (probe P). `acquire` by the same owner is now idempotent and returns the existing record (probe C4).
- `atomicRename` backoff is real and bounded: 5 attempts, measured 422 ms total for a permanently failing rename (50+75+112+168+250 ms floor, `Math.floor(delayMs * 1.5^i)`), `EPERM` propagates after the last attempt, and the caller's `finally` removes the `.tmp` file (probes E1, O2, O3). No `.tmp` leak observed.
- `cleanup-runtime --force`: same-host dead PID snapshot removed; foreign-host snapshot preserved even with `--force` (probe C5, test 143).

### D-02 - ReDoS assessment of the heading regexes

Measured on Node 22 with 200k-character adversarial inputs (`9`*n, `Z`*n, `+03`+`0`*n, `+03:`+`0`*n): every evaluation completed in 0.1-0.7 ms. The pattern has no nested quantifier over the same class; the only unbounded tail is a single `.+`. The previous ecosystem-wide warning about these regexes does not reproduce. Both new regexes accept impossible offsets such as `+99:99` (probe D4) - cosmetic, not exploitable, but a stricter `[01]\d|2[0-3]` class would be free.

### D-03 - Cross-platform matrix

- Windows: `fs.renameSync` over a plain file succeeds even while the destination is open (probe D1), so the retry path is only exercised under external sharing locks (AV/indexer). The `EPERM/EBUSY` filter excludes `EACCES`, which Windows can also return for transient locks; adding `EACCES` to the retry set would widen coverage at no cost.
- POSIX: `atomicRename` degenerates to a single `renameSync`; no behavioural risk. `Atomics.wait` is a synchronous sleep and blocks the event loop for at most ~660 ms - acceptable for a CLI, wrong if this module is ever imported into a server process.
- `EXDEV` (runtime dir on another filesystem, e.g. a junction) is not retried and propagates; the temp file is still removed by `finally`.
- The archive/handoff normalization (`\r\n` -> `\n`, strip trailing `-{3,}` runs, `\s+$` trim) makes deep verification CRLF-tolerant (probe E2 CRLF variant passed).

### D-04 - Governance items (Point 1)

`AGENTS.md` §2 gains the mandatory-prompt subsection; `QUICKSTART.md` gains Rule 7; `PROTO-DEC-0027` records it as an Accepted decision with `Approved by: RuslanFomenko`. The rule itself is consistent with §2's existing completion gate ("Completion requires independent verification"). There is one tension: §4 "Session end" still tells the implementer to run the validator and record evidence but does not restate the mandatory-prompt step, so a reader following only the checklist can still mark the task complete without composing the prompt. The mandate explicitly cited AGENTS.md §4 as a file to change; it was not changed. That is a completeness gap in Point 1, item F-08 below.

### D-05 - Version drift (incidental)

`protocol-manifest.json` and `AGENTS.md` both say v1.9.0 while the work is presented as v1.9.3; `TASK.md` says "v1.9.3". The validator only asserts the declared version agrees across files, so this is self-consistent and green, but consumers cannot detect the kernel hardening by version. Matches the owner's v1.9.0 release plan only if the bump is scheduled separately.

---

## Alternatives Considered & Trade-offs

- **Alternative A (F-02): store `null` instead of `process.pid` when the session PID is unknown.** Simpler than plumbing a real session PID, and `isProcessAlive()` already returns `null` for non-integer PIDs. Rejected because it makes CLI locks permanently "unknown", removing `--force` recovery even for truly abandoned locks; the persistent session PID is the correct model.
- **Alternative B (F-01): remove the CLI stop-branch auto-archive entirely and document the hook as authoritative.** Smaller code, no shadow logic, no dead throw. Rejected only if hookless CLI sessions must archive when hooks are absent; if they must, add `const path = require('node:path')` and a regression test.
- **Alternative C (F-03): hash the entire `.ai/ARCHIVE.md` into a side ledger.** Detects any rewrite but turns every legitimate append into an evidence mismatch and requires a second durable file. Rejected as disproportionate; the duplicate-scan fix achieves fail-closed without a new artifact.
- **Alternative D (F-05): keep the append-first order but write the journal temp file and verify it before the append.** Cheapest partial fix; still not atomic across two files. Full atomicity needs one file or a WAL. Rejected as the immediate fix; the idempotent-append check is the smallest safe step.

---

## Recommendations & Actionable Plan

1. **(F-01/F-02) Make the CLI path real**: add the module-level `path` require (or delete the dead branch), pass `--session-pid` end-to-end, and validate it as a positive integer. Add regression tests: `stop` auto-archives a >150-line journal in a hookless fixture; `acquire --session-pid abc` exits non-zero.
2. **(F-03) Close the duplicate hole**: scan all archive sections with the parent hash, fail on any copy that does not re-hash to the parent, and report duplicates explicitly.
3. **(F-04) Finish the unification**: export one heading regex from a shared location and consume it in `protocol-hooks.cjs` and `protocol.cjs`; extend the timestamp test to assert `latestCompleteEntry` agrees.
4. **(F-05) Reorder or make idempotent**: skip appending an entry whose `entry:` hash already exists in `.ai/ARCHIVE.md`; move the append after the temp-file verification.
5. **(F-06/F-07) Tighten the edges**: reject non-integer `--session-pid`; require conclusive death (or explicit host confirmation) for the 7-day snapshot rule.
6. **(Point 1) Add the mandatory-prompt step to AGENTS.md §4's session-end checklist** so the rule is not only in §2.
7. **Bump the declared version** (`protocol-manifest.json`, `AGENTS.md`) when this batch is released, so consumers can pin the hardening.

---

## References

- Decision blocks: `PROTO-DEC-0027` (Accepted 2026-09-18), `PROTO-DEC-0026` in `.ai/DECISIONS.md`
- Active task: `.ai/TASK.md` (In Progress; two acceptance boxes open)
- Associated session journal: `.ai/worklog/deepseek-flash-411196c44afa7cfc.md`
- Related reviews: `docs/reviews/2026-09-18-deepseek-audit-v1.9.md`, `docs/reviews/2026-09-18-gemini-v1.9.3-audit.md`, `docs/reviews/2026-09-18-qwen-hostile-audit-v1.9.3.md`
- Probe artifacts (throwaway fixtures used for every reproduction): `%TEMP%\kilo\probe-*.cjs` in this session; each is standalone and rebuilds its fixture from `protocol-manifest.json`.

### Item Verdicts

| # | PROTO-DEC-0027 item | Verdict |
|---|---|---|
| 1 | Mandatory Adversarial Peer Review Prompt | RECOMMENDATION (rule present in §2/QUICKSTART; §4 checklist not updated) |
| 2 | Cooperative Lock Preservation (+ `--session-pid`) | FAIL (skip rule works; flag inert and unvalidated; CLI path dead) |
| 3 | Atomic Rename Retry (Windows) | RECOMMENDATION (backoff verified, EACCES not retried, append-before-rename fork F-05) |
| 4 | Legacy Evidence (<4 = legacy) | PASS (probe + test 42; false positives on v4+ still detected) |
| 5 | Fail-Closed Deep Archive Verification | FAIL (real tamper caught, but forged duplicate accepted -> not fail-closed) |
| 6 | Unified Heading Regex | RECOMMENDATION (ReDoS-free, offsets parsed; hooks/protocol.cjs not unified -> F-04) |
| 7 | Liveness-First Cleanup | PASS with note (force path correct; 7-day rule F-07) |
| 8 | Tests and Validator Scope | PASS (186/186, validator 0 warnings, new encoding scope correct) |

**Overall verdict: FAIL** - the deliverable is close, and every defect above is a bounded, directly actionable patch; two of them (F-02, F-03) falsify the guarantees the decision text advertises.
