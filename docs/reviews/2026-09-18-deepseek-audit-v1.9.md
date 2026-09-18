# DeepSeek - Adversarial Audit: Protocol v1.9.0 - v1.9.2

**Date**: 2026-09-18T04:40:00Z
**Reviewed commit**: a6a6d6194e08e313dce1328cc8af971962f91fa5
**Working tree**: clean at baseline; dirty afterwards only with this review's own files
**Reviewer**: DeepSeek (deepseek-flash, VS Code/Kilo CLI, Windows)
**Scope**: audit | edge-cases | security
**Verdict**: FAIL

---

## Executive Summary

The v1.9.1 stabilization fixes do close four of the defects I reported at v1.9.0 (archive/digest interaction, archive/chain interaction, legacy timestamp headings, fail-closed tamper detection), and I verified each one by reproduction. However, three release-blocking defects remain, all reproduced: the cooperative lock's liveness model is inert for CLI use, and `autoArchiveWorklog` silently clears and releases a live session's lock (F-001, CRITICAL); a journal holding any pre-DEC-0021 Evidence block is now classified as tampered, so `record` hard-fails on mixed-format journals (F-002, HIGH); and `verify --deep` never re-hashes archived content - it only tests whether a hash string appears somewhere in `.ai/ARCHIVE.md`, so archived history can be rewritten or erased while `doctor` still prints "Protocol Healthy" (F-003, HIGH).

---

## Scope and Evidence

- **Baseline Commit**: `a6a6d6194e08e313dce1328cc8af971962f91fa5` (v1.9.2; worktree clean at start)
- **Working Tree State**: `clean` baseline; the review file and the session journal are added after that baseline
- **Commands & Tests Executed**:
  - `powershell -ExecutionPolicy Bypass -File .\validate-protocol.ps1` -> exit 0, 0 warnings
  - `node .ai/bin/protocol.cjs doctor` -> Protocol Healthy on the clean tree
  - `git diff bed0d70..a6a6d61` full read of every changed tool, manifest, document and test
  - Nine adversarial probe scripts on throwaway fixtures built from `tests/helpers.cjs`; the decisive ones are reproduced under F-001 to F-006
  - `protocol-handoff.cjs record --owner deepseek-...` at handoff runs the validator and `test-protocol.ps1`; their real exit codes are in the Evidence block of `.ai/worklog/deepseek-*.md`
- **Environment**: Windows 11 (10.0.26100), Node.js v22.21.0, Windows PowerShell 5.1.26100.9444, Git 2.53.0

---

## Findings

| Id | Severity | Title | Location | Impact | Status |
|---|---|---|---|---|---|
| F-001 | CRITICAL | Lock liveness is always false for CLI-held locks; auto-archive steals them | `.ai/bin/protocol-lock.cjs:137`, `.ai/bin/protocol-archive.cjs:124-126` | A live session's lock is silently cleared, and shared documents can be overwritten | Open |
| F-002 | HIGH | Legacy Evidence (no `entry:` hash) is classified as `tampered` | `.ai/bin/protocol-handoff.cjs:152-154` | `record` refuses to certify any mixed-format journal; upgrade deadlock | Open |
| F-003 | HIGH | `--deep` archive verification is a substring test, not a hash check | `.ai/bin/protocol-handoff.cjs:213-221` | Archived entries can be rewritten or erased; deep audit and `doctor` stay green | Open |
| F-004 | MEDIUM | `cleanup-runtime --force` deletes snapshots with unknown liveness | `.ai/bin/protocol-session.cjs:243-244` | Contradicts liveness-first protection for foreign-host snapshots | Open |
| F-005 | MEDIUM | Hand-written Evidence verifies; the documented claim is false | `.ai/docs/PROTOCOL.md:154-155` | The receipt proves internal consistency, not that checks ran | Open |
| F-006 | LOW | Numeric timezone offsets in headings are rejected | `.ai/bin/protocol-handoff.cjs:234`, `.ai/bin/protocol-archive.cjs:80` | Misleading "Write the entry first" on a valid entry | Open |
| F-007 | LOW | Atomic replace has no retry on transient Windows locks | `.ai/bin/protocol-archive.cjs:157-162` | EPERM/EBUSY from AV/indexer fails the archive; temp residue | Open |
| F-008 | LOW | `docs/reviews/` is outside validator scope | `validate-protocol.ps1` (protocol-owned paths only) | Review immutability and encoding are prose, not checks | Open |
| F-009 | LOW | `findArchivedParent` scans the whole journal, not the preamble | `.ai/bin/protocol-handoff.cjs:129-132` | A quoted marker inside an entry can hijack parent resolution | Open |

### F-001 - [CRITICAL] - Lock liveness is inert for CLI-held locks; auto-archive silently steals them

- **Location**: `.ai/bin/protocol-lock.cjs:137` (`pid: process.pid`), `.ai/bin/protocol-lock.cjs:42-49` (`processAlive`), `.ai/bin/protocol-archive.cjs:124-126` (`clear-lock` + `acquire` on `alive === false`), callers `.ai/bin/protocol-handoff.cjs:389`, `.ai/bin/protocol-hooks.cjs:453`, `.ai/bin/protocol-session.cjs:104` (all omit `owner`)
- **Confidence**: High (reproduced end-to-end)
- **Reproduction**:
  ```text
  # 1. Session A takes the lock exactly as documented (one-shot CLI process):
  node .ai/bin/protocol-lock.cjs acquire --owner live-session-abc
  node .ai/bin/protocol-lock.cjs status        # -> alive: false, pid 38024 (the exited CLI)
  # 2. Session B runs any record/stop on an oversized journal, which auto-archives:
  node .ai/bin/protocol-archive.cjs worklog .ai/worklog/tester-locksteal.md --keep 1
  # -> archived 1 entry(s) ... (no error, no warning)
  node .ai/bin/protocol-lock.cjs status        # -> lock: null  (A's lock was cleared and released)
  node .ai/bin/protocol-lock.cjs release --owner live-session-abc
  # -> Error: No shared-document owner is recorded
  ```
  Observed: `acquire` exit 0; `status` immediately after reports `alive: false`; the archive run clears the lock, writes `ARCHIVE.md` and the journal, and releases a temporary lock; the owner can no longer release. In a parallel probe, 7 of 8 concurrent `acquire` calls were told the holder process was already dead moments after it was taken.
- **Impact**: The core safety property of section 6 of `AGENTS.md` ("do not steal; releasing a live holder's lock destroys their work") is violated by the protocol's own tooling. Any `record`/`stop` on a journal over 150 lines clears the lock of another session that is in the middle of editing `TASK.md`, `PLAN.md` or `DECISIONS.md`. The v1.9.1 claim "Lock-safe архивация ... предотвращает обрыв чужих сессий" does not hold for the CLI workflow it was written for. The in-process unit test passes only because it acquires and archives in the same PID.
- **Recommendation / Proposed Fix**: Two changes, both needed.
  ```javascript
  // 1. protocol-lock.cjs: do not record the PID of the one-shot CLI process.
  //    Either accept a --session-pid from the caller, or make liveness advisory:
  //    the lock is a lease with owner + acquiredAt, and staleness is a TTL,
  //    not a PID probe that is wrong by construction for CLI use.
  // 2. protocol-archive.cjs: never clear a lock whose owner is not confirmed dead.
  } else if (lockStatus.lock.alive === false) {
    // Keep the current owner's lock. Skip the archive instead of stealing.
    throw new Error(`Cannot archive: ${lockStatus.lock.owner} still owns the lock ` +
      '(liveness of a CLI-held lock cannot be proven); retry after that session releases it');
  }
  // 3. Thread the session owner through every call site:
  archive.autoArchiveWorklog(root, journalPath, 150, 1, owner);
  ```
  Until (1) is fixed, `clear-lock`/`--force` should refuse to clear a lock acquired by a CLI owner younger than the stale TTL, because "the process exited" is the normal state of a CLI-held lock, not evidence of abandonment.

### F-002 - [HIGH] - Legacy Evidence is classified as `tampered`

- **Location**: `.ai/bin/protocol-handoff.cjs:139-156` (the `findParentEntry` branch), specifically `:152-154`
- **Confidence**: High (reproduced)
- **Reproduction**:
  ```text
  Journal with an older entry in pre-DEC-0021 format (an Evidence block with
  "- digest:" and no "- entry:" line) plus a new dated entry:
  node .ai/bin/protocol-handoff.cjs record --owner tester-legacy --quick
  # -> exit 1: "historical entry link is tampered. Previous entry hash does not
  #            match its contents."
  ```
- **Impact**: Any journal that spans the v1.9.0 -> v1.9.1 boundary (exactly the mixed-format journals the three-repository review measured: "Evidence blocks mixed formats" in the source repository) can never record a new handoff again. The legitimate workaround is to rewrite or abandon the journal, which destroys history, or to strip Evidence blocks by hand. The misclassification also feeds `record`'s new fail-closed check, which then refuses with a false accusation.
- **Recommendation / Proposed Fix**:
  ```javascript
  // In findParentEntry, distinguish "legacy" from "tampered" by the declared format:
  const ev = parseEvidenceBlock(section);
  if (ev && ev.entry) { /* compare as today */ }
  if (ev) return ev.format >= 4 ? 'tampered' : 'legacy';
  return 'legacy';
  ```
  A format-4 block without an `entry:` line remains a hard failure; a format-1/2/3 block is legacy and keeps the old `'legacy'` semantics. Add a regression with a real format-3 Evidence parent.

### F-003 - [HIGH] - `--deep` never verifies archived content

- **Location**: `.ai/bin/protocol-handoff.cjs:213-221` (`archiveText.includes(archivedParent)`), surfaced by `.ai/bin/protocol.cjs` doctor (Merkle audit section, deep=true)
- **Confidence**: High (reproduced)
- **Reproduction**:
  ```text
  1. record entry A, prepend entry B, record it.
  2. node .ai/bin/protocol-archive.cjs worklog <journal> --keep 1   # A moves to ARCHIVE.md
  3. Edit ARCHIVE.md: replace the body of A ("did new" -> "FORGED") but keep its "- entry: sha256:..." line.
  4. node .ai/bin/protocol-handoff.cjs verify --owner <owner> --deep   -> exit 0
     node .ai/bin/protocol.cjs doctor                                    -> "Protocol Healthy"
  5. Stronger variant: delete A's archived body entirely and leave only a comment
     containing the hash string. verify --deep and doctor remain green.
  ```
- **Impact**: The archived tail of the chain is unprotected. An agent can erase or rewrite any archived entry, plant the declared hash string anywhere in `ARCHIVE.md`, and both the deep audit and `doctor` report full health. The claim that v1.9.1 provides "полная проверка цепочки ворклога по умолчанию" and "глубокий Merkle-аудит" is not delivered: the check is a substring search, not a hash recomputation.
- **Recommendation / Proposed Fix**:
  ```javascript
  // Parse ARCHIVE.md into dated sections, find the section whose Evidence
  // declares entry === archivedParent, recompute its body hash exactly as
  // verifyJournalChain does for live sections, and fail on mismatch or absence.
  // A bare includes() must not satisfy the check.
  ```
  While `ARCHIVE.md` stays outside the snapshot digest (correct, per the v1.9.1 fix), the only anchor for archived text is this hash recomputation; it must actually be performed.

### F-004 - [MEDIUM] - `cleanup-runtime --force` deletes snapshots with unknown liveness

- **Location**: `.ai/bin/protocol-session.cjs:243-244` (`isProcessAlive(state) === false || options.force`)
- **Confidence**: High (reproduced)
- **Reproduction**:
  ```text
  Snapshot ghost-0123456789abcdef.json with hostname "some-other-host" and a
  matching journal file, mtime fresh:
  node .ai/bin/protocol-session.cjs cleanup-runtime            # survives
  node .ai/bin/protocol-session.cjs cleanup-runtime --force    # removed
  ```
- **Impact**: Before v1.9.1, `--force` removed a snapshot only when the recorded process was confirmed dead (`alive === false`). Now it also removes snapshots whose liveness is `null` - another host, an unparseable state file, or a record without a PID - which the same release notes describe as protected. `protocol.cjs clean --force` propagates this. The opposite fix (liveness-first) is verified working: a live 8-day-old snapshot survives.
- **Recommendation / Proposed Fix**: Drop `|| options.force` from the inner condition; `--force` should bypass the 24 h age gate only, never the liveness verdict:
  ```javascript
  if (isProcessAlive(state) === false) { /* remove */ }
  ```

### F-005 - [MEDIUM] - Hand-written Evidence verifies; the documented claim is false

- **Location**: `.ai/docs/PROTOCOL.md:154-155` ("a hand-written one is a claim again, and its entry hash will not match")
- **Confidence**: High (reproduced)
- **Reproduction**:
  ```text
  Write an entry, compute entryHash via the exported function, read the current
  anchor with `state`, then attach() a fully hand-written Evidence block with the
  correct digest, format 4, entry hash, parent-entry: root and "exit 0" lines.
  node .ai/bin/protocol-handoff.cjs verify --owner tester-handmade  -> exit 0
  ```
- **Impact**: `entry:` covers the entry body, not the Evidence block (by design, to avoid the self-reference cycle), and nothing binds an Evidence block to an actual execution of the checks. An agent that never ran the validator can produce a receiving green receipt, contrary to the operator guide's warning. This is a threat-model documentation defect more than a new bug, but the sentence is wrong and gives false assurance.
- **Recommendation / Proposed Fix**: Correct the wording: the entry hash makes the *entry* tamper-evident; it does not attest that any command ran, because check execution cannot be proven without a secret (which this cooperative protocol deliberately does not have). The only accepted provenance is the `record` command and the Git history around it. Add the `entry` hash and check replay to the `reproduce` guidance.

### F-006 - [LOW] - Numeric timezone offsets in headings are rejected

- **Location**: `.ai/bin/protocol-handoff.cjs:234` and `:140`, `.ai/bin/protocol-archive.cjs:80`
- **Confidence**: High (reproduced); severity Low (VPN's real format uses `UTC`)
- **Reproduction**:
  ```text
  Heading: ## 2026-09-18 04:12:00+03:00 - Offset heading
  node .ai/bin/protocol-handoff.cjs record --owner tester-tz --quick
  # -> exit 1: "No dated entry ... Write the entry first" (the entry exists)
  ```
  The optional-offset group is `(?: [A-Z0-9_]+)?` (space + word characters); `+03:00` and `GMT+3` do not match. The error message sends the agent to rewrite a valid entry.
- **Recommendation / Proposed Fix**: Widen the suffix group, e.g. `(?: [A-Za-z0-9_+:-]+)?`, in all four places (handoff `newestSection`, handoff `findParentEntry`, handoff `verifyJournalChain`, archive `entryRegex`). Centralize the pattern in one exported constant so the four copies cannot drift.

### F-007 - [LOW] - Atomic replace has no retry on transient Windows locks

- **Location**: `.ai/bin/protocol-archive.cjs:157-162`
- **Confidence**: Medium (analysis; not reproduced on demand)
- **Impact**: `fs.renameSync(temp, journal)` can fail with `EPERM`/`EBUSY` when an antivirus, the search indexer, or another session's Stop hook holds the journal open. The `finally` releases the lock, but the journal rewrite is skipped while `ARCHIVE.md` already received the entries - the crash-consistency problem Copilot reported is narrowed, not closed. The temp file remains until `cleanup-runtime` removes it after an hour.
- **Recommendation / Proposed Fix**: Retry the rename a few times with a short backoff on `EPERM`/`EBUSY`, as atomic-write libraries do; on final failure, log the temp path and make the duplication in `ARCHIVE.md` explicit (the next archive run would re-append the same entries, since the journal was never truncated). Consider making the archive append idempotent per provenance header.

### F-008 - [LOW] - `docs/reviews/` is outside validator scope

- **Location**: `validate-protocol.ps1` (only manifest entries, `.ai/`, `templates/ai/`, `.claude/hooks/` are inspected)
- **Confidence**: High (verified by reading the ownership filter and checking all four files: no BOM, no CRLF, valid UTF-8)
- **Impact**: AGENTS.md section 5 declares review files permanent and immutable, and the repo-wide encoding rules claim to cover all text files, but nothing checks a review file after it lands: it can be rewritten, re-encoded or BOM'd without a signal. Current files happen to conform.
- **Recommendation / Proposed Fix**: In the `source` role only, add a WARN when a tracked file under `docs/reviews/` differs from its `HEAD` version (mirroring the decision-block check, but warn-level because reviewers may legitimately fix a typo under owner instruction), and include `docs/reviews/*.md` in the encoding scan. Keep host-project paths out of scope (DEC-0013/0017).

### F-009 - [LOW] - `findArchivedParent` is not anchored to the preamble

- **Location**: `.ai/bin/protocol-handoff.cjs:129-132`
- **Confidence**: Medium (code reading; contrived input)
- **Impact**: The marker regex is applied to the whole journal text. Any entry body that quotes `<!-- archived-parent: sha256:<64 hex> -->` (for example, a session journal discussing this mechanism) will be taken as the journal's archive marker and can break or redirect parent resolution for the oldest entry.
- **Recommendation / Proposed Fix**: Search only the preamble (text before the first dated section) for the marker, and require it to appear at most once.

---

## Deep Dives

### 1. The lock liveness model is wrong by construction for CLI use

`protocol-lock.cjs` writes `pid: process.pid` into `shared-writer.json` (line 137). The documented workflow acquires the lock by running the CLI once: `node .ai/bin/protocol-lock.cjs acquire --owner <session>`. That node process exits immediately, so from the next command onwards the lock reports `alive: false`. Every consumer of `alive` then reasons about a process that was never the session:

- `acquire` tells a newcomer "that process is no longer running ... Pass --force" - an invitation to steal a live session's lock.
- `archiveWorklog` (lines 124-126) treats `alive === false` as abandonment, calls `clear-lock` with force, acquires its own temporary lock, archives, and releases. The session that took the lock never learns its lock is gone; its later `release` fails.
- `prune` and `cleanup-runtime` protect "the active lock owner" by comparing owner strings, which still works; but the lock file itself can be replaced underneath.

This is not a small race: the window is the entire duration of the session, bounded only by when the next auto-archive happens. The v1.9.0 test that covers lock-safe archiving passes because it calls `lockModule.operate(..., 'acquire', 'other-live-session')` in-process, where `process.pid` is the test runner and stays alive. A regression test must acquire through the CLI in a child process and then attempt the archive from another process.

### 2. What the Merkle chain actually pins, and what it does not

Verified by probes:

- The newest entry's body is pinned by its own `entry:` hash (`reportOne` recomputes it). Confirmed: rewriting a certified entry fails verification.
- Older entries' bodies are pinned forward: entry *i*'s `parent-entry` equals the recomputed body hash of entry *i+1*. Confirmed: tampering three entries back fails verification.
- A recorded parent that was archived is resolved through `<!-- archived-parent: sha256:... -->`, and record -> archive -> verify round-trips. Confirmed fixed at v1.9.1.
- The archived tail itself is **not** pinned: `--deep` only checks that the hash string occurs in `ARCHIVE.md`. Confirmed: forged body, removed body with planted hash - both verify and `doctor` stay green (F-003).
- The Evidence block itself is outside the entry hash by design. A fully hand-written block with a correctly computed `entry:` hash and the current anchor digest verifies (F-005). The receipt proves internal consistency of the claim and the tree digest; it does not prove that any check executed. That is inherent to a cooperative protocol without a secret, and the documentation should say so instead of claiming the opposite.

---

## Alternatives Considered & Trade-offs

- **Making the lock PID a long-lived session process** (for example the shell that launched the session): rejected as fragile - the CLI has no reliable way to know the session process, and a shell PID is not stable across resume or compaction. A lease with owner + TTL and an explicit confirm-before-clear is the honest model for a cooperative lock.
- **Removing the lock from auto-archive entirely** (archive only when the lock is provably free): safe, but it leaves journals over the 150-line limit, so the next validation fails. Threading the session owner through and skipping with a clear warning is the better middle ground: the journal stays valid until the owner releases.
- **Trusting `ARCHIVE.md` because it is local history**: rejected; the deep audit exists precisely to make the archived tail checkable, and a substring check undermines the guarantee the release advertises.
- **Hard-failing on any legacy Evidence**: rejected (F-002); it would strand every mixed-format journal. Legacy must stay distinguishable from tampered.

---

## Recommendations & Actionable Plan

1. **F-001 (blocker)**: change lock liveness to a lease/TTL model or accept an explicit session PID; make `archiveWorklog` skip instead of clearing an unconfirmed lock; thread `owner` through `autoArchiveWorklog` at all three call sites; add a child-process CLI regression test.
2. **F-002 (blocker)**: classify format < 4 Evidence without `entry:` as legacy in `findParentEntry`; add a mixed-format regression test.
3. **F-003 (blocker)**: make `--deep` recompute the archived entry body hash from `ARCHIVE.md`; add a forged-archive regression test that must fail `verify --deep` and `doctor`.
4. **F-004**: remove `|| options.force` from the liveness condition; add a foreign-host `--force` regression.
5. **F-005**: correct the hand-written-Evidence wording in `.ai/docs/PROTOCOL.md` and AGENTS.md section 7.
6. **F-006/F-009**: centralize the heading regex; anchor the archived-parent marker to the preamble.
7. **F-007/F-008**: add rename retry with backoff; add a source-role check for `docs/reviews/` encoding and immutability.
8. Re-run `validate-protocol.ps1` and `test-protocol.ps1` after the fixes; the release tag should not be created before F-001 to F-003 are closed and independently re-verified.

---

## References

- Decision blocks: `PROTO-DEC-0021` (entry hash, lock gate), `PROTO-DEC-0023` (auto-archive, quarantine), `PROTO-DEC-0024` (rehash, new assistants), `PROTO-DEC-0025` (v1.9.1 stabilization), `PROTO-DEC-0026` (review system) in `.ai/DECISIONS.md`
- Active task: `.ai/TASK.md`
- Associated session journal: `.ai/worklog/deepseek-<id>.md` (Evidence block records the validator and suite exit codes for this tree)
- Related reviews: `docs/reviews/2026-09-16-council-review.md`, `docs/reviews/2026-09-17-three-repository-review.md`, `docs/reviews/2026-09-18-grand-council-consensus-v1.9.0.md`
- Predecessor audit of the v1.9.0 tree: this reviewer's findings were delivered in chat only and are superseded by this file; they were not persisted, which is the failure mode PROTO-DEC-0026 addresses
- Protocol versions audited: `bed0d70` (v1.9.0), `2e951d6` (v1.9.1), `a6a6d61` (v1.9.2)
