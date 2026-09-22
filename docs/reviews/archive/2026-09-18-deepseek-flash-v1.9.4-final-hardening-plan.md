# DeepSeek (deepseek-flash) - Point-by-Point Verdict on the Critical Review and Final v1.9.4 Hardening Plan

**Date**: 2026-09-18  
**Reviewed commit**: a6a6d6194e08e313dce1328cc8af971962f91fa5 (a6a6d61)  
**Working tree**: dirty (v1.9.4 patch partially applied, tree RED)  
**Reviewer**: DeepSeek (model `deepseek/deepseek-flash`, session `deepseek-flash-ebd6eb9397ed3784`)  
**Scope**: consensus verification | integrity | security | release planning  
**Verdict**: FAIL  
**Status of this document**: PROPOSED for owner approval. It is not an approved decision.

> Every claim below was re-probed against the working tree at the time above. The
> tree changed during the audit: items 1-3 of the proposed v1.9.4 patch round are
> already present in code, and they introduced five test regressions plus a red
> `doctor`. This document is the final, ordered plan to reach a green, verified
> v1.9.4.

---

## Part 0. Current tree health (measured)

| Check | Result |
|---|---|
| `validate-protocol.ps1` | exit 0, `Protocol OK. 0 warning(s)` |
| `node .ai/bin/protocol.cjs doctor` | **exit 1**: `[FAIL] .ai/worklog/gemini-381fc7800a864cde.md: archived parent null is missing from .ai/ARCHIVE.md.` |
| `test-protocol.ps1` | **exit 1**: 178 tests, 173 pass, **5 fail** |
| `verify --owner gemini-381fc7800a864cde --deep` | exit 1 (broken archived chain) |
| `verify --owner copilot-20260918-audit` | exit 1 (stale tree after rehash) |

The five failing tests: `archive append is verified before pruning and retries
remain idempotent`, `verify --deep re-hashes archived entry body and fails when
body in ARCHIVE.md is tampered`, `verify --deep traverses archived parent links
and detects missing links and cycles`, `rehash command updates entry hash after
secret redaction with sanitized marker`, `snapshot metadata does not collide with
a file named __dirty`.

---

## Part 1. Verdict on Goal 1 (discipline and document limits)

### 1.1 "Only DeepSeek Flash persisted its audit; all others dumped to chat" - FALSE as stated

The repository contains model-authored review files with proper headers for
Gemini (`2026-09-18-gemini-v1.9.4-adversarial-audit.md`), Copilot
(`2026-09-18-copilot-sdk-adversarial-audit-v1.9.4.md`), Qoder
(`2026-09-18-adversarial-audit-v1.9.4.md`), Mistral
(`2026-09-18-mistral-medium-3.5-adversarial-audit-v2.md`), plus earlier files by
Claude, CodeGeeX, Qwen and others. Each header names its own Reviewer and Verdict
and none carries a "Transcribed from chat" note. The blanket claim is refuted by
the filesystem. A narrower claim - that some chat-only answers were never
persisted for a specific model (e.g. no v1.9.4 file exists for Claude) - is
plausible but was not demonstrated.

### 1.2 "docs/reviews has no line limit" - TRUE

`validate-protocol.ps1:220-222` limits only `.ai/TASK.md` (80), `.ai/PLAN.md`
(200) and `.ai/worklog/*.md` (150). `docs/reviews/**` is encoding-checked in the
source role but never length-checked; a 29 KB review passes.

### 1.3 "The real cause is models not calling the write tool" - PARTIALLY TRUE, but the rule already exists

`AGENTS.md` section 5 already requires: save the full report under
`docs/reviews/`, link it from the session journal, keep chat to the executive
verdict, and include the mandatory header (`AGENTS.md:196-213`). PROTO-DEC-0026
likewise mandates the review file, and the Completion gate
(`validate-protocol.ps1:407-462`) already makes completion impossible without it.
So the proposed new sentence in section 5 is redundant; what is missing is
enforcement and a per-model checklist, not rule text.

### 1.4 "Created docs/reviews/2026-09-18-multi-model-consensus-refutation.md" - FALSE

`Test-Path` returns false and the file is absent from `git status` and from the
working tree. The claimed consolidated file does not exist. The individual model
reviews do exist; the synthesis artifact referenced by this claim does not.

---

## Part 2. Verdict on Goal 2 (the four defects and the refutations)

### 2.1 `__dirty` collision - TRUE (defect real), fix applied, test broken

Reproduced on the pre-patch code: a file named `__dirty` made `hooks.snapshot`
throw `TypeError: Cannot redefine property: __dirty`, because
`Object.defineProperty(files, name, {...})` defaults `configurable` to `false`
and the later boolean define cannot replace it. The critique's additional claim
that the flag "overwrote the file hash" describes the alternate failure mode, not
the observed one.

Current code is fixed: `protocol-hooks.cjs:47,156` uses
`Symbol('protocol snapshot dirty')` and `configurable: true`,
`protocol-handoff.cjs:76` reads `files[hooks.DIRTY_SYMBOL]`. Probe: a `__dirty`
file no longer throws. However the regression test is broken: `tests/hooks.test.cjs:58`
calls `hooks.snapshot` but the file never imports `hooks`, so test 52 fails with
`hooks is not defined`. This is a test bug, not a code bug.

### 2.2 Evidence authentication hole - TRUE (defect real), fixed for format 2 only

Pre-patch reproduction: record a failing `test-protocol.ps1` (`exit 7`), rewrite
the Evidence line to `exit 0`, and `verify` returned 0 - the receipt certified a
failed run. The critique's framing is correct: the tree digest proves tree
identity, not that the recorded checks ran. Current code fixes it for new
evidence: `renderEvidence` writes `- entry hash format: 2`
(`protocol-handoff.cjs:123`) and `canonicalEntryBody` (`:344-353`) keeps the
Evidence block in the hash except the `- entry:` line. Probe: after forging the
exit code, `verify` fails with `entry was changed after it was certified`.

Gaps remain: (a) all existing journals are format 1 and stay forgeable; (b)
`rehash` is broken for format 2 (see 3.2); (c) `protocol-archive.cjs` was not
migrated (see 3.2); (d) `parseEvidenceBlock.entry` and `findParentEntry` use the
unanchored regex `/entry:\s*(sha256:...)/`, which can capture `parent-entry`
when the `- entry:` line is absent or reordered.

### 2.3 Too-wide format-4 genesis bypass - TRUE (old defect), the prescribed fix is over-strict

Pre-patch, `verifyArchivedChain` accepted `!record.parentEntry` for any record
(`format < 4 || !record.parentEntry || root || legacy`). Since `parent-entry`
lives in Evidence, which legacy records do not hash, deleting that line turned any
archived record into an accepted root and silently truncated all older history.
Reproduced by inspection and consistent with the red `doctor` on the pre-patch
tree.

The current fix narrows it via `record.chainRoot === 'transitional' && current === archivedParent`
(`protocol-handoff.cjs:252-253`). That condition is wrong: the transitional
genesis is reached after several parent hops in the real archive
(`gemini archived-parent -> 5529d721 -> 3f73a82a -> 9aa71f14 -> d8ff25fb ->
eceab02a -> 1963b334 -> f5fdb3be`), so `current !== archivedParent` and the walk
continues to `current = null`, producing the live failure
`archived parent null is missing from .ai/ARCHIVE.md` and `doctor` exit 1. The
correct rule is terminal-based, not position-based (see Part 3, P-1).

### 2.4 Lock squatting via `--session-pid` - TRUE, still unfixed

Reproduced on the current tree: `acquire --owner squat-session --session-pid 4`
returns 0 and records `"pid": 4`; `clear-lock` then returns 1 with
`Process 4 still holds the lock`. On Windows PID 4 is System and never exits, so
the shared-document lock can be pinned permanently by any participant with no
parentage check. The critique is correct. The current test
(`tests/lock.test.cjs:146-163`) asserts the vulnerable behavior as if it were
desired.

### 2.5 "Model C claimed Gemini invented everything; post-hoc fallacy" - UNSUBSTANTIATED / misattributed

No review file contains such a claim (searched all of `docs/reviews/` for
"invented", "never existed", "already there", "post-hoc", Russian equivalents).
The closest real document is
`docs/reviews/2026-09-18-deepseek-flash-consensus-verification.md`, which states
that the five consensus defects were real and were already fixed in the tree - the
opposite of "invented". The methodological warning (do not evaluate a patched
tree and conclude a defect never existed) is valid in general, but the specific
attribution is not supported by the repository and should not enter the decision
record as a finding against a model.

### 2.6 Duplicate masking / ancestor traversal refutation - TRUE

Confirmed independently: `verifyArchivedChain` counts every `- entry:` label
(`protocol-handoff.cjs:215-222`), rejects any duplicate hash before traversal
(`:230-234`), and walks parent links with cycle detection (`:237-256`). The
DeepSeek r2 F-001/F-002 and Claude F-001 claims are correctly refuted for the
current code.

### 2.7 No ReDoS in `DATE_HEADING_REGEX` - TRUE

Confirmed: 200k-character adversarial inputs return in 0-1 ms; the pattern has no
nested unbounded quantifier. Refutation correct.

---

## Part 3. Verdict on Goal 3 (the proposed fixes)

### 3.1 Symbol isolation - CORRECT and applied

`DIRTY_SYMBOL` is the right mechanism: symbol keys are ignored by
`Object.keys` and `JSON.stringify`, so `changedFiles` and the digest are
unaffected, and a real file named `__dirty` remains visible. Only the test needs
the missing import.

### 3.2 "entry hash format: 2" - CORRECT DIRECTION, INCOMPLETE AND BROKEN AS LANDED

Implemented in `protocol-handoff.cjs` but not finished:

- `protocol-archive.cjs:14-28` still uses its private legacy `entryBody` that
  drops the whole Evidence block. For a format-2 entry, `extractEntryHash`
  therefore recomputes the wrong hash, returns `null`, so `archiveWorklog` writes
  **no** `archived-parent` marker and `parseArchiveEntryHashes` returns an empty
  set. Reproduced: after archiving a format-2 entry, `verify --deep` fails with
  `Recorded parent ... , expected root`, and the archive-append test fails
  `expected 1, actual 0`.
- `rehash` is broken: `canonicalEntryBody` does not strip the `- sanitized:` line,
  so `rehash` computes the hash before adding the marker and verification then
  recomputes with the marker. Reproduced: `rehash` exits 0, `verify` still fails
  `entry was changed after it was certified`. The plan's own text required
  excluding `- sanitized:`, but the code does not.
- Legacy coverage: every existing journal is format 1, so the exact forgery the
  fix closes still succeeds on them until re-recorded. The chain format cannot be
  retrofitted in place: a `parent-entry` hash is computed under the parent's own
  format, so adding the marker to an old entry would break every child link and
  the `archived-parent` marker. Migration must be "new evidence only"; historical
  entries stay legacy and must be labelled, not rewritten.
- Unanchored `entry:` parsing (see 2.2d).

### 3.3 `chainRoot: 'transitional'` - CORRECT IDEA, WRONG CONDITION

The marker is present on the real genesis (`ARCHIVE.md:432`,
`chain root: transitional`) and is the right way to name a legitimate root. The
`current === archivedParent` restriction must be removed and replaced by a
terminal + graph-consistency rule.

### 3.4 `--session-pid` ppid / system-PID restriction - CORRECT but NOT IMPLEMENTED

The current code still accepts any live PID. The proposal is the right one and
needs to be strengthened: parentage or registered-session binding, not a numeric
range heuristic alone.

### 3.5 Tests - INSUFFICIENT, one broken, one asserting the vulnerability

Only one new regression exists (`__dirty`), and it does not compile (missing
import). There are no tests for format-2 tamper resistance, format-2
archive round-trip, transitional-root depth, `rehash` after sanitization, or
foreign-PID rejection. The session-pid test asserts the vulnerable behavior.

---

## Part 4. FINAL v1.9.4 HARDENING PLAN (proposed for approval)

Order is mandatory: P-1..P-3 restore green; P-4..P-6 close the remaining
integrity holes; P-7..P-9 verify and release. No task may be marked
`Status: Completed` until the Mandatory Adversarial Review (AGENTS.md section 2)
re-certifies this plan's output.

### P-1 (BLOCKER) - Correct archive chain termination and orphan detection

File: `.ai/bin/protocol-handoff.cjs`, `verifyArchivedChain` (lines 207-257).

Replace the position check with an authenticated, terminal-based rule:

1. Parse every record with `hash`, `valid`, `parentEntry`, `chainRoot`,
   `authenticated` (`/- entry hash format:\s*2/`), `format`.
2. Walk parents from `archivedParent` with the existing cycle guard.
3. A record terminates the walk successfully only if it is one of:
   - `parentEntry === 'root'` or `'legacy'`, and the record is authenticated or
     has `format < 4`; or
   - `authenticated && chainRoot === 'transitional'` (any position); or
   - `format < 4` (legacy digest boundary).
   For a non-authenticated record, a `chain root: transitional` marker is
   accepted only if the record is the unique parentless record of the archive
   (see step 4) — this keeps the historical genesis working without letting a
   forged marker on an arbitrary legacy record terminate a chain.
4. Orphan/truncation check: compute every record whose `parentEntry` is
   null/`root`/`legacy`. The walk must terminate at exactly one of them, and no
   other parentless record may exist unless it is a `format < 4` legacy boundary.
   More than one unexpected root fails with
   `archive contains an orphaned segment; history may have been truncated`.
5. A record whose `parentEntry` is `null` and which is not a valid terminal is a
   hard failure (message names the record hash), not `current = null`.
6. Scope note in the code: this detects accidental/partial truncation, orphan
   segments and cycles. It is not a defence against an actor who rewrites or
   deletes whole archive segments, which no self-contained log can detect
   (consistent with DEC-0016's stated threat model).

Acceptance: `doctor` exits 0 on the repository; a fixture with a middle record's
`parent-entry` deleted fails with the orphan/terminal error; the real
7-record chain terminates at `f5fdb3be`.

### P-2 (BLOCKER) - Migrate the archive module to the shared canonical hash

Files: `.ai/bin/protocol-hooks.cjs` (new shared helper), `.ai/bin/protocol-handoff.cjs`,
`.ai/bin/protocol-archive.cjs`.

1. Move `canonicalEntryBody` (and `ENTRY_HASH_FORMAT = 2` plus a
   `hasEntryHashFormat2(section)` helper) into `protocol-hooks.cjs`; export them.
   `protocol-handoff.cjs` re-exports for compatibility.
2. In `protocol-archive.cjs`, delete the private `entryBody` and use the shared
   canonical body in `extractEntryHash`. This makes `extractEntryHash`,
   `parseArchiveEntryHashes` and `archivedHash` correct for format 2, restoring
   the `archived-parent` marker and deduplication.
3. Ensure `archiveWorklog` strips only trailing separators before hashing so the
   canonical body matches after archiving (add a test).
4. If a require cycle appears, keep archive's top-level require of hooks only;
   never require handoff from archive at module scope.

Acceptance: archive a format-2 entry, then `verify --deep` passes; the
`archived-parent` marker is present; a second archive run is idempotent (one
`- entry:` label); a tampered archived body fails.

### P-3 (BLOCKER) - Repair `rehash` for format 2

File: `.ai/bin/protocol-handoff.cjs` (`canonicalEntryBody`, `rehash`).

1. In `canonicalEntryBody`, when format 2, strip `- entry:` and every
   `- sanitized:` line before hashing. Keep `- entry hash format: 2`, `- parent-entry:`,
   `- digest:`, `- recorded:`, `- owner`/scope and every check line inside the hash.
2. In `rehash`, compute the hash under that rule, then write the hash line and add
   the marker; repeated `rehash` is idempotent.
3. Keep the legacy path unchanged for format 1.

Acceptance: body edit -> `rehash` -> `verify` passes; a second body edit fails; a
second `rehash` is idempotent; deleting the `- entry hash format: 2` marker fails
verification.

### P-4 (HIGH) - Bind `--session-pid` to a real caller, not to any live PID

File: `.ai/bin/protocol-lock.cjs` (`main`, `operate`) and `tests/lock.test.cjs`.

Accepted values for `--session-pid`:
1. `process.pid` (in-process call), or
2. `process.ppid` (the supervisor that spawned this CLI), or
3. a PID recorded in `.ai/runtime/<owner>.json` for the same `--owner`.

Reject: non-integers, `pid <= 4`, PIDs that are not alive (`process.kill(pid,0)`
fails without `EPERM`), and any PID that does not satisfy 1-3. Store `pid`
(actual process) and `sessionPid` (declared supervisor) separately in the lock
record; `clear-lock`/`acquire --force` must treat a live `sessionPid` as held by a
live owner. Document that a CLI-only session holds the lock cooperatively by
`owner`, not by PID.

Acceptance: `--session-pid 4` is rejected; a foreign unrelated live PID is
rejected; `--session-pid <ppid>` is accepted and stored; `--force` cannot steal a
lock whose `sessionPid` is alive.

### P-5 (HIGH) - Label unauthenticated legacy Evidence instead of certifying it

Files: `.ai/bin/protocol-handoff.cjs`, `.ai/bin/protocol.cjs`, docs.

1. `reportOne`: if the newest entry has no `- entry hash format: 2`, keep the
   body-hash check but return a distinct non-zero result:
   `evidence is not authenticated (legacy format); re-record to refresh`. Add
   `verify --allow-legacy` for read-only historical review that reports the same
   fact as a warning and exits 0.
2. The no-owner `verify` scan must not count a legacy newest entry as a match for
   a successful handoff.
3. `doctor` prints the count of unauthenticated entries and treats a non-zero
   count as a warning (source repo) — not a silent pass.
4. Do not rewrite historical entries. Migration is "record new evidence".

Acceptance: a freshly recorded entry passes without the flag; an old format-1
entry fails `verify` without `--allow-legacy` and is counted by `doctor`.

### P-6 (HIGH) - Anchor Evidence field parsing

File: `.ai/bin/protocol-handoff.cjs` (`parseEvidenceBlock`, `findParentEntry`).

Use `/^[ \t]*-[ \t]+entry:[ \t]*(sha256:[a-f0-9]{64})\b/m` so the capture cannot
match `- parent-entry:`. Add a test where `- parent-entry:` precedes `- entry:`.

### P-7 (MEDIUM) - Tests and CI

1. Fix `tests/hooks.test.cjs`: import the hooks module before using
   `hooks.snapshot` (currently `hooks is not defined`).
2. Add regressions:
   - `handoff-chain.test.cjs`: every Evidence field tamper (`exit`, `digest`,
     `parent-entry`, `recorded`, scope) fails format 2; `rehash` round-trip;
     deleting the format marker fails.
   - `archive.test.cjs`: format-2 archive round-trip, marker present, dedup, and
     tampered archived body fails.
   - `lock.test.cjs`: reject PID 4 and an unrelated live PID; accept `ppid`.
   - `handoff.test.cjs`: `verify` refuses a legacy newest entry without
     `--allow-legacy`.
3. Add `node .ai/bin/protocol.cjs doctor` to `.github/workflows/protocol.yml`
   and require exit 0.
4. Acceptance: `test-protocol.ps1` 0 failures, 0 warnings; `validate-protocol.ps1`
   exit 0; `doctor` exit 0.

### P-8 (MEDIUM) - Release hygiene

1. After P-1..P-7 are green, bump `protocolVersion` to `1.9.4` in
   `protocol-manifest.json`, `AGENTS.md`, `setup-ai-protocol.ps1`, and any doc
   carrying the version, in one atomic commit.
2. Create the annotated tag `v1.9.4` (PROTO-DEC-0025 item 1).
3. Re-record the affected session journals to format 2 and re-run the consumer
   `-Verify` for `D:\Block-Puzzle` and `D:\VPN`.

### P-9 (LOW) - Governance and artifact integrity

1. Do not add redundant rule text to `AGENTS.md` section 5; instead add one line
   to the Completion gate checklist requiring that every cited review file exists
   and is model-authored. The gate already enforces file existence.
2. The claimed `docs/reviews/2026-09-18-multi-model-consensus-refutation.md` does
   not exist. Either create it as a real synthesis of the model verdicts or strike
   the reference from the consensus document; do not cite an absent artifact.
3. Record the correct ownership of findings: this round's defects are Copilot
   F-001/F-003, DeepSeek R-1/R-2, and the archive-chain regression introduced by
   the fix itself. The "Model C post-hoc fallacy" claim is unsupported and should
   not be part of the record.

---

## Part 5. Approval requested

I request owner approval of P-1..P-9 as the final v1.9.4 hardening plan, in the
stated order, with the stated acceptance criteria. P-1, P-2 and P-3 are release
blockers because they restore a green tree; P-4, P-5 and P-6 close the remaining
integrity holes; P-7 and P-8 gate the release; P-9 corrects the record. Until
then the correct release status is FAIL, not RECOMMENDATION.

---

## References

- `docs/reviews/2026-09-18-grand-adversarial-consensus-v1.9.4.md`
- `docs/reviews/2026-09-18-deepseek-flash-consensus-verification.md`
- `docs/reviews/2026-09-18-copilot-sdk-adversarial-audit-v1.9.4.md`
- `docs/reviews/2026-09-18-gemini-v1.9.4-adversarial-audit.md`
- `.ai/DECISIONS.md`: PROTO-DEC-0021, PROTO-DEC-0025, PROTO-DEC-0026, PROTO-DEC-0027
- `.ai/worklog/deepseek-flash-ebd6eb9397ed3784.md`
