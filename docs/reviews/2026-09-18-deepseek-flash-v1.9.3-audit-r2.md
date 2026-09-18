# deepseek-flash - Independent Adversarial Audit r2 of Protocol Kernel v1.9.3 (PROTO-DEC-0027)

**Date**: 2026-09-18  
**Reviewed commit**: a6a6d6194e08e313dce1328cc8af971962f91fa5  
**Working tree**: dirty (source files unchanged during this audit; concurrent agents edited `.ai/worklog/` while it ran)  
**Reviewer**: deepseek-flash (Kilo Code CLI, session `deepseek-flash-0a05beefb1dffcb2`)  
**Scope**: [audit | security | edge-cases]  
**Verdict**: **FAIL** (2 high, 3 medium, 3 low, 3 informational; every defect is a bounded patch)

This report supersedes `docs/reviews/2026-09-18-deepseek-flash-v1.9.3-audit.md`
(round 1), which measured an earlier dirty tree: the kernel files were modified
at 06:50-07:07Z after that report was recorded at 05:55Z, and round-1 findings
F-01 (missing `path` require) and F-06 (unvalidated `--session-pid`) no longer
reproduce. Round 1's F-03 (duplicate masking) and F-07 (7-day foreign snapshot)
do reproduce and are re-filed below with fresh evidence.

---

## Executive Summary

The eight PROTO-DEC-0027 items are present in code and the mandated regression
suite passes 186/186 (exit 0), but three stated invariants are still falsified.
F-001: `verify --deep` accepts a forged archive entry whenever an intact copy of
the same `entry:` hash appears first, so the check is order-dependent and not
fail-closed. F-002: deep verification never walks the archived chain, so an
archived ancestor can be rewritten without any signal (probed: exit 0). F-003:
the liveness model still rests on the transient PID of a one-shot CLI/hook
process; `--session-pid` has no caller, and the PID `protocol-session.cjs start`
advertises is already dead when printed, so every CLI session is "dead" to
`cleanup-runtime` and to the lock model. F-004: the separate 7-day rule still
deletes foreign-host snapshots whose liveness is unknown, contradicting
"conclusively dead". F-005: `protocol.cjs doctor` fails its deep Merkle audit on
a committed audit journal, and F-006: the validator now reports 1 warning
(31/30 journals), not the mandated 0.

---

## Scope and Evidence

- **Baseline Commit**: `a6a6d6194e08e313dce1328cc8af971962f91fa5` (deliverables uncommitted)
- **Working Tree State**: `dirty`; tracked-source diff stat identical before and after the audit; `.ai/worklog/*` changed concurrently (another session added `qwen-adversarial-audit.md` and quarantined empty journals)
- **Commands & Tests Executed**:
  - `powershell -ExecutionPolicy Bypass -File .\validate-protocol.ps1` -> exit 0, `Protocol OK. 1 warning(s).` (31 session journals)
  - `powershell -ExecutionPolicy Bypass -File .\test-protocol.ps1` -> exit 0, `# tests 186 # pass 186 # fail 0`, `duration_ms 404159.67`
  - `node .ai/bin/protocol.cjs doctor` -> exit 0 but `Verdict: Issues Found (1 failure(s))` (F-005)
  - Standalone probes on throwaway fixtures (rebuilt from `protocol-manifest.json`): deep-verify duplicate and ancestor forgeries, archive rename failure, atomicRename backoff, lock/liveness identity, cleanup-runtime age rules, ReDoS timing. Scripts: `%TEMP%\kilo\audit\probe-lock.cjs`, `probe-deep.cjs`, `probe-archive.cjs`, `probe-fork2.cjs`.
- **Environment**: Windows 11 x64 (10.0.26100), Node.js v22.21.0, Windows PowerShell 5.1.26100.9444, Git 2.53.0.windows.2.

---

## Findings

| Id | Severity | Title | Location | Impact | Status |
|---|---|---|---|---|---|
| F-001 | HIGH | `verify --deep` accepts a forged duplicate when a valid copy comes first | `.ai/bin/protocol-handoff.cjs:227-242` | Order-dependent fail-open: archive can be rewritten in one place while an intact copy elsewhere satisfies verification | Open |
| F-002 | MEDIUM | Deep verification does not walk the archived chain | `.ai/bin/protocol-handoff.cjs:216-247` | An archived ancestor (`parent-entry` link) can be rewritten while `verify --deep` exits 0; "absolute immutability" holds only for the newest archived entry | Open |
| F-003 | HIGH | Liveness rests on transient PIDs; `--session-pid` has no caller and advertises a dead PID | `.ai/bin/protocol-session.cjs:75`, `.ai/bin/protocol-hooks.cjs:405`, `.ai/bin/protocol-lock.cjs:139,164` | Every CLI session looks dead: locks are treated as abandoned for `--force` recovery, and `cleanup-runtime --force` can delete the live session snapshot | Open |
| F-004 | MEDIUM | 7-day rule deletes foreign-host snapshots of unknown liveness | `.ai/bin/protocol-session.cjs:249-256` | Contradicts liveness-first: a foreign snapshot is destroyed on age alone even though `isProcessAlive` returned `null` | Open |
| F-005 | MEDIUM | `doctor` deep Merkle audit fails on a committed journal | `.ai/worklog/copilot-20260918-audit.md:20` | The tree ships a certified entry that was edited after certification; release-readiness claim is false until resolved | Open |
| F-006 | LOW | Validator reports 1 warning; acceptance required 0 | `.ai/worklog/` (31 journals), `validate-protocol.ps1:214-216` | `Protocol OK. 1 warning(s)` violates the task constraint; the audit round itself caused the overflow | Open |
| F-007 | LOW | Heading-regex unification incomplete in hook archive ledger | `.ai/bin/protocol-hooks.cjs:320` | Timestamped/timezone archived headings are not counted in injected context (probe: literal count 1, canonical count 2) | Open |
| F-008 | LOW | `--session-pid` accepts out-of-range values | `.ai/bin/protocol-lock.cjs:164-169` | `Number.isInteger(1e21)` is true, so `--session-pid 999999999999999999999` is accepted and stored; no upper bound | Open |
| F-009 | INFO | Archive append and journal rewrite are still two operations | `.ai/bin/protocol-archive.cjs:179-186,188-195` | A rename failure leaves the entry in ARCHIVE.md and in the journal; probed retry heals without duplication and deep verify stays green | Open |
| F-010 | INFO | Version drift: v1.9.0 declared everywhere, work labelled v1.9.3 | `protocol-manifest.json:3`, `AGENTS.md`, `.ai/bin/protocol.cjs:4,270` | Consumers cannot pin the hardening by version; validator only checks self-consistency | Open |
| F-011 | INFO | Impossible timezone offsets accepted; ReDoS not reproducible | `.ai/bin/protocol-hooks.cjs:216-217` | `+99:99` matches (cosmetic); 200k-char adversarial inputs ran 0.10-0.41 ms | Open |

### F-001 - [HIGH] - Deep verify accepts a forged duplicate when a valid copy comes first

- **Location**: `.ai/bin/protocol-handoff.cjs:227-242`
- **Confidence**: High (reproduced end-to-end)
- **Reproduction** (fixture: certified journal whose oldest entry was archived, then duplicate the archived section and edit only the copy):
  ```bash
  # journal deep-dupe.md has entry 2 (newest) + archived entry 1 in .ai/ARCHIVE.md
  node .ai/bin/protocol-handoff.cjs verify --owner deep-dupe --deep   # exit 0 (clean)
  # append a second copy of the archived section with "archive me" -> "FORGED body text"
  node .ai/bin/protocol-handoff.cjs verify --owner deep-dupe --deep   # exit 0 (!)
  # put the forged copy first:
  node .ai/bin/protocol-handoff.cjs verify --owner deep-dupe --deep   # exit 1 (hash mismatch)
  ```
- **Observed**: `{"valid copy first + forged duplicate after": {"status":0}}`, `{"forged copy first": {"status":1}}`, `{"only the forged copy": {"status":1}}`.
- **Impact**: The loop `break`s on the first section whose `entry:` equals `archivedParent` and whose body re-hashes clean. Any later section carrying the same label is never examined. An attacker (or a careless merge/duplicate) can keep a pristine copy for the checker while the visible record is rewritten. This is exactly the duplicate-masking vector PROTO-DEC-0027 item 5 claims to close; the check answers "does some clean copy exist", not "is the archived record intact".
- **Recommendation / Proposed Fix**:
  ```javascript
  // Collect every section carrying the parent hash; fail if ANY copy mismatches.
  const copies = archiveSections.filter(s => (s.match(/entry:\s*(sha256:[a-f0-9]{64})/) || [])[1] === archivedParent);
  if (copies.length === 0) return { ok: false, reason: `archived parent ${archivedParent} not found in .ai/ARCHIVE.md.` };
  for (const copy of copies) {
    const h = hashArchivedBody(copy); // existing normalization
    if (h !== archivedParent) return { ok: false, reason: `archived parent ${archivedParent} was tampered in .ai/ARCHIVE.md (hash mismatch: expected ${archivedParent}, computed ${h}).` };
  }
  // Optional: treat duplicates as a failure in their own right.
  ```

### F-002 - [MEDIUM] - Deep verification does not walk the archived chain

- **Location**: `.ai/bin/protocol-handoff.cjs:220-247` (only the current archived parent is re-hashed)
- **Confidence**: High (reproduced)
- **Reproduction** (three certified entries; E1 archived, then E2 archived; E2's Evidence records `parent-entry: <hash of E1>`):
  ```bash
  # ARCHIVE.md: entry 1, entry 2 (parent-entry: sha256:6e6a4063... = entry 1)
  # replace "archive me one" inside archived entry 1 with "TAMPERED ANCESTOR BODY"
  node .ai/bin/protocol-handoff.cjs verify --owner deep-chain --deep   # exit 0 (!)
  ```
- **Observed**: `P4 clean deep verify: {"status":0}`; after tampering entry 1: `{"changed":true,"status":0,"stderr":""}`. Archived entry 1 still claims `entry: sha256:6e6a4063...` while its body no longer hashes to it, and entry 2's `parent-entry` link to that hash is never checked.
- **Impact**: After pruning, the archive is the only durable copy. Deep verification stops at the newest archived entry, so every older archived entry is unauthenticated; the Merkle chain exists in the data but is not verified. "Absolute cryptographic immutability across journal pruning" is therefore not delivered for the archive as a whole.
- **Recommendation / Proposed Fix**: In deep mode, verify the whole archived chain: for each archived section, recompute its `entry:` body hash, then resolve its `parent-entry` to the matching archived section and continue until `root`/`legacy`; fail on any missing link, mismatch, or cycle. At minimum, re-hash every archived section that carries an `entry:` label, not only the parent.

### F-003 - [HIGH] - Liveness rests on transient PIDs; `--session-pid` has no caller and advertises a dead PID

- **Location**: `.ai/bin/protocol-session.cjs:75` (`Session PID for lock calls: ${process.pid}`), `.ai/bin/protocol-hooks.cjs:403-411` (`pid: process.pid` stored in the snapshot), `.ai/bin/protocol-lock.cjs:139,164-169`
- **Confidence**: High (reproduced + grep)
- **Reproduction**:
  ```bash
  node .ai/bin/protocol-session.cjs start --agent probe --session sid-1 --root <fixture>
  # prints: Session PID for lock calls: 33536
  # after the command returns:
  node -e "try{process.kill(33536,0);console.log('alive')}catch(e){console.log(e.code)}"   # ESRCH
  node .ai/bin/protocol-lock.cjs acquire --owner <owner> --session-pid 33536 --root <fixture>
  node .ai/bin/protocol-lock.cjs status --root <fixture>   # pid 33536, alive:false
  # a second session is now told: "process is no longer running ... Pass --force"
  ```
- **Observed**: `P1 printed pid alive after start exited: false`; `P1 lock acquired with printed session pid: {"storedPid":33536,"alive":false}`; the snapshot `.ai/runtime/probe-500350f230ef17d0.json` stores the same dead `"pid":33536`; `--force` therefore steals the lock with no confirmation. `grep -R "session-pid"` finds only the parser, the usage string, PROTO-DEC-0027 and review prose: no shipped caller (`protocol-session.cjs`, `protocol-handoff.cjs`, `protocol-archive.cjs`, installer) passes it.
- **Impact**: The decision's "Support `--session-pid` for lock tracking" and item 7's liveness-first cleanup are inert in production: hook processes (Claude/Codex) and `start`/`stop` CLI invocations are all one-shot, so the PID recorded in a snapshot is dead by the time any other command reads it. Consequences: (a) CLI-held locks always present as abandoned to `acquire --force`/`clear-lock`; (b) `cleanup-runtime --force` sees `isProcessAlive(state) === false` for a *live* CLI session and deletes its baseline snapshot (the tests only pass because they inject `process.pid` manually); (c) `prune` protects live sessions by PID and therefore also cannot recognize them. The protective parts that do work rely on the owner string (lock-holder skip in `archiveWorklog`, `activeLockOwner` in prune/cleanup), not on liveness.
- **Recommendation / Proposed Fix**: Stop presenting a transient PID as the session PID. Record a PID only when it belongs to a long-lived supervisor (e.g. have the host/session wrapper pass its own PID through `start --session-pid` and store it in the snapshot), validate the range (`v >= 1 && v <= 2**31-1`), and document the flag in QUICKSTART/AGENTS. Alternatively accept that PID liveness cannot model one-shot sessions, store `pid: null` explicitly, and make `--force` require an owner confirmation instead of a liveness verdict.

### F-004 - [MEDIUM] - 7-day rule deletes foreign-host snapshots of unknown liveness

- **Location**: `.ai/bin/protocol-session.cjs:249-256`; orphan branch `.ai/bin/protocol-session.cjs:229-236`
- **Confidence**: High (reproduced)
- **Reproduction**:
  ```bash
  # runtime/<owner>.json with hostname "other-machine-xyz", journal present, mtime 8 days old
  node .ai/bin/protocol-session.cjs cleanup-runtime --root <fixture>
  # -> "removed stale <owner>.json"
  # same state, mtime fresh, --force -> preserved (24h branch requires isProcessAlive === false)
  ```
- **Observed**: `P5 foreign-host snapshot, 8 days old, no --force: {"removed":true}`; `P5 live same-host snapshot, 8 days old: {"removed":false}`; `P5 fresh foreign orphan snapshot: {"removed":true}`.
- **Impact**: A session on another host sharing the checkout loses its snapshot on age alone although liveness was never proven (`null`). DEC-0027 item 7 promises snapshots are preserved "unless process liveness is conclusively dead"; this branch treats unknown as dead. Snapshots are disposable by design, so the damage is bounded, but the invariant as written is false.
- **Recommendation / Proposed Fix**: In the stale branch require `isProcessAlive(state) === false` as well, or exempt `null` (foreign host / no PID) from age-based removal and require `--force` plus explicit host confirmation. Apply the same rule to orphan snapshots of unknown liveness.

### F-005 - [MEDIUM] - `doctor` deep Merkle audit fails on a committed journal

- **Location**: `.ai/worklog/copilot-20260918-audit.md:20`
- **Confidence**: High (doctor output)
- **Reproduction**:
  ```bash
  node .ai/bin/protocol.cjs doctor
  # [FAIL] .ai/worklog/copilot-20260918-audit.md: historical entry at index 0 was changed
  # after certification. Recorded sha256:7d0aeb17..., computed sha256:889d3291...
  ```
- **Impact**: The repository currently ships a certified entry whose body no longer matches its receipt, and `TASK.md` simultaneously states all items are verified. Any release claim is unverifiable until this journal is re-recorded (or rehashed with a documented reason). It also shows that a red `record` (the block itself notes `validate-protocol.ps1: exit 1`) can coexist with later edits.
- **Recommendation / Proposed Fix**: Re-record or `rehash` the journal with a reason, then re-run `doctor`; add `doctor` to the release checklist so a red Merkle audit blocks handoff.

### F-006 - [LOW] - Validator reports 1 warning; acceptance required 0

- **Location**: `.ai/worklog/` (31 journals at audit time), `validate-protocol.ps1:214-216`
- **Confidence**: High (command output)
- **Reproduction**: `powershell -ExecutionPolicy Bypass -File .\validate-protocol.ps1` -> `[WARN] 31 session journals in .ai/worklog; archive the oldest into .ai/ARCHIVE.md`, `Protocol OK. 1 warning(s).`
- **Impact**: The task constraint "validator must pass with 0 warnings" is not met right now. The overflow is a direct consequence of the multi-model audit round (each session creates a journal; empty ones are pruned by other sessions). The fix is mechanical.
- **Recommendation / Proposed Fix**: Archive the oldest journals into `.ai/ARCHIVE.md` (respecting the one-writer lock) until the directory holds <= 30 files, then re-run the validator before the release tag.

### F-007 - [LOW] - Heading-regex unification incomplete in the hook archive ledger

- **Location**: `.ai/bin/protocol-hooks.cjs:320`
- **Confidence**: High (probe + code)
- **Reproduction**:
  ```js
  const hooks = require('./.ai/bin/protocol-hooks.cjs');
  const sample = '## 2026-09-18 11:30:00 +03:00 - t\n\n## 2026-09-17 - plain\n';
  sample.match(/^## \d{4}-\d{2}-\d{2} - [^\r\n]+/mg).length;                                  // 1
  sample.match(new RegExp(hooks.DATE_HEADING_M_REGEX.source, 'mg')).length;                   // 2
  ```
- **Impact**: The SessionStart context line "Archive ledger: .ai/ARCHIVE.md holds N archived entry(s)" undercounts archives written with timestamp/timezone headings. `protocol.cjs:208` also keeps a literal splitter, but it is a superset filtered by the canonical regex, so it is harmless.
- **Recommendation / Proposed Fix**: Use `hooks.DATE_HEADING_M_REGEX` at `protocol-hooks.cjs:320`; keep `DATE_HEADING_REGEX` exported from one module only.

### F-008 - [LOW] - `--session-pid` accepts out-of-range values

- **Location**: `.ai/bin/protocol-lock.cjs:164-169`
- **Confidence**: High (probe)
- **Reproduction**: `node .ai/bin/protocol-lock.cjs acquire --owner probe-a --session-pid 999999999999999999999` -> exit 0, stored `"pid": 1e+21`.
- **Impact**: `Number.isInteger(1e21)` is true, so absurd values pass the "positive integer" check and are stored; `process.kill(1e21, 0)` then degrades to "dead". Cosmetic today, but the validation message promises an integer PID.
- **Recommendation / Proposed Fix**: Bound the value: `Number.isInteger(v) && v > 0 && v <= 0x7fffffff`.

### F-009 - [INFO] - Archive append and journal rewrite remain two operations

- **Location**: `.ai/bin/protocol-archive.cjs:179-186` (append) and `:186` (atomic rename)
- **Confidence**: High (probe)
- **Reproduction**: monkeypatch `fs.renameSync` to throw `EPERM`; call `archiveWorklog` directly. After the failure ARCHIVE.md holds the entry and the journal still holds it; `verify --deep` stays green (no marker was written because the journal rewrite never happened), and the next successful call heals without duplication (idempotent hash filter): `retry heals: {archiveAlphaSections:1, journalSections:1, deepStatus:0}`.
- **Impact**: No integrity loss; a crash between append and retry leaves the archive holding an entry that is also still in the journal (duplicate content until the next archive). Worth documenting rather than fixing urgently.
- **Recommendation / Proposed Fix**: Optionally skip the append when the journal temp file cannot be written/renamed, or keep the current idempotent-append design and document the transient duplicate.

### F-010 - [INFO] - Version drift

- **Location**: `protocol-manifest.json:3`, `AGENTS.md`, `.ai/bin/protocol.cjs:4,270`
- **Confidence**: High (validator output)
- **Impact**: `node .ai/bin/protocol.cjs doctor` and the validator both report protocol version 1.9.0 while the work is presented as v1.9.3. The validator only checks that the declared version agrees across files, so the hardening is invisible to consumers.
- **Recommendation / Proposed Fix**: Bump the declared version once, when this batch is released.

### F-011 - [INFO] - Impossible offsets accepted; ReDoS not reproducible

- **Location**: `.ai/bin/protocol-hooks.cjs:216-217`
- **Confidence**: High (measurement)
- **Impact**: `+99:99` matches the heading regex (cosmetic; no downstream use of the offset value). Adversarial 200k-character inputs (`9*n`, `+03`+`0*n`, named zone + letters, prefix+`!`) completed in 0.10-0.41 ms for both regexes; the earlier ecosystem-wide ReDoS concern does not reproduce.
- **Recommendation / Proposed Fix**: Optional tightening to `(?:[01]\d|2[0-3]):?[0-5]\d` if strict offsets are desired; otherwise leave as is.

---

## Deep Dives

### D-01 - Deep verification adversary model (F-001, F-002)

Two independent forgeries were mounted against a fixture whose journal had one
certified entry and whose archive held the certified parent:

1. **Duplicate with valid twin**: pristine section retained, second copy edited.
   Exit 0. The loop's first-match/`break` semantics are the cause; the result is
   order-dependent (forged-first exits 1).
2. **Ancestor rewrite**: with a three-entry chain (E3 -> E2 -> E1, E1 and E2 both
   archived), editing E1's body leaves every checked invariant intact: E3's
   `archived-parent` matches E2, and E2 re-hashes to its own `entry:` label. The
   `parent-entry: <hash of E1>` recorded inside E2's Evidence is never resolved.
   Exit 0.

Fail-closed would require: (a) every section carrying the parent hash re-hashes
to it, and (b) the archived chain is walked link by link to `root`/`legacy`.
Both are small, local changes in `verifyJournalChain`.

### D-02 - Liveness architecture (F-003, F-004)

The protocol stores `pid: process.pid` in each session snapshot, but every
writer of that snapshot is a short-lived child process (`SessionStart`/`Stop`
hooks, `protocol-session.cjs start`). Probe evidence: the PID printed for lock
calls and stored in the snapshot was already gone when the command returned.
Therefore `isProcessAlive(state) === true` is effectively unreachable for real
sessions, and every liveness-gated path (snapshot retention, `prune` session
protection, `cleanup-runtime` dead-session branch) degrades to owner-string
matching or to age. The parts of the hardening that do work as intended are the
owner-based ones: `autoArchiveWorklog` refuses to touch a lock held by another
owner (verified: returns false, warning on stderr, lock and archive untouched)
and proceeds when the caller itself holds the lock without releasing it.

### D-03 - Windows atomic rename (Point 2)

`atomicRename` retries `EPERM`/`EBUSY`/`EACCES` five times with
`Math.floor(50 * 1.5^i)` ms floors; measured 442 ms for four failures followed by
success, 443 ms for five failures, no `worklog-atomic-*.tmp` left in either case
(the `finally` unlinks it and `cleanup-runtime` sweeps leftovers after 1 hour).
`EXDEV` is not retried but is cleaned. No handle leak observed. This item passes.

### D-04 - Legacy Evidence and real-archive false positives (Point 3)

A format-3 parent entry is classified `legacy` and recording succeeds
(probe + test 42 for handoff). A format-4 block missing the `entry:` line is
classified `tampered` and `record` refuses (probe: exit 1). Deep verification of
the one real journal that carries an `archived-parent` marker
(`gemini-381fc7800a864cde.md`) produced no chain error, only the expected
"evidence is stale" (tree moved since certification), so no false FAIL was
observed on historical archives. The one real FAIL (F-005) is an in-journal
post-certification edit, not an archive-format artifact.

### D-05 - CRLF normalization (Point 4)

`record` on an LF journal followed by CRLF conversion still verifies (exit 0);
a CRLF `.ai/ARCHIVE.md` passes `verify --deep` (exit 0). Body hashing strips the
Evidence block and trailing separators after `\r\n -> \n` normalization, so
line-ending changes are not mistaken for tampering. Note that the validator
itself rejects CRLF inside protocol-owned files, so CRLF journals are a
robustness path, not a supported format.

### D-06 - Governance rule (Point 7)

`AGENTS.md` carries the "Mandatory Adversarial Peer Review Prompt" subsection in
section 2, and section 4 step 4 now requires composing/dispatching the prompt
before `Status: Completed`; `QUICKSTART.md` carries Rule 7;
`.ai/DECISIONS.md` records PROTO-DEC-0027 item 1 with `Approved by:
RuslanFomenko`. The rule is textual, not validator-enforced, which is consistent
with the rest of the process rules.

### D-07 - Round-1 finding status

| Round-1 finding | Current state |
|---|---|
| F-01 `path.basename` without `node:path` (dead stop-branch) | Fixed: module-level `require('node:path')` at `protocol-session.cjs:25`; stop branch works |
| F-02 `--session-pid` inert, no validation | Half fixed: NaN/0/negative now rejected; caller and PID semantics still broken -> F-003 |
| F-03 deep verify accepts forged duplicate | Still open -> F-001 |
| F-04 hooks reject timestamp/timezone headings | Mostly fixed: hooks/handoff/archive use the canonical regex; ledger line remains -> F-007 |
| F-05 archive append precedes journal rename | Mitigated: temp journal written first, idempotent append, deep verify stays green -> F-009 (info) |
| F-06 invalid `--session-pid` silently accepted | Fixed for NaN/0/negative; range bound missing -> F-008 |
| F-07 7-day stale rule deletes foreign snapshots | Still open -> F-004 |

---

## Item Verdicts (mandated checklist)

| # | PROTO-DEC-0027 / mandate item | Verdict |
|---|---|---|
| 1 | Cooperative lock preservation + `--session-pid` | PARTIAL: skip rule works (PASS); flag validation works for NaN/0/negative but the flag has no caller and its advertised PID is dead -> F-003, F-008 |
| 2 | Atomic rename retry (Windows) | PASS (backoff, retry set, temp cleanup; transient append/rename fork is F-009) |
| 3 | Legacy Evidence (< 4 = legacy), no false FAIL | PASS (probe + test 42; real archive deep check clean) |
| 4 | Fail-closed deep archive verification, LF/CRLF | FAIL (duplicate masking F-001, ancestor chain gap F-002); CRLF handling PASS |
| 5 | Unified DATE_HEADING_REGEX, ReDoS safe | PARTIAL: canonical export + handoff/archive/protocol.cjs consumption, ReDoS clean; `protocol-hooks.cjs:320` still literal -> F-007 |
| 6 | Liveness-first snapshot cleanup | FAIL: recorded PIDs are transient (F-003); 7-day rule deletes unknown-liveness foreign snapshots (F-004) |
| 7 | Mandatory adversarial review prompt | PASS (AGENTS.md 2/4, QUICKSTART rule 7, PROTO-DEC-0027 item 1) |
| 8 | Tests and validator | Tests PASS (186/186, exit 0); validator exit 0 with 1 warning -> F-006; `doctor` FAIL -> F-005 |

**Overall verdict: FAIL** - the hardening is close, and every blocking item is a
bounded patch; but the two integrity questions the mandate asks about deep
verification both fail, the liveness/`--session-pid` mechanism remains
non-functional in production, and the repository is not currently in the
"0 warnings, doctor green" state the task claims.

---

## Alternatives Considered & Trade-offs

- **Alternative A (F-001): reject any duplicate `entry:` label outright.** Strongest, but legitimate archives never duplicate an `entry:` hash, so it costs nothing; keep the "fail on any mismatching copy" rule even if duplicates are tolerated for readability.
- **Alternative B (F-002): hash the entire ARCHIVE.md into the journal marker.** Detects every rewrite including ancestors, but turns each legitimate append into a mismatch and needs a second durable artifact. Rejected in favour of walking the existing `parent-entry` links.
- **Alternative C (F-003): store `pid: null` for one-shot sessions.** Honest, but makes `--force` recovery mandatory for every CLI lock. Rejected as a replacement for fixing the PID source; the correct fix is a long-lived supervisor PID (or documented `null` semantics plus owner confirmation).
- **Alternative D (F-004): exempt foreign snapshots from all cleanup.** Preserves the invariant, risks unbounded runtime growth on shared checkouts. The proposed `isProcessAlive === false` requirement for the 7-day branch keeps collection working while honouring liveness-first.

---

## Recommendations & Actionable Plan

1. **(F-001/F-002) Close deep verification**: fail on any archive section carrying `archivedParent` that does not re-hash to it; walk the archived `parent-entry` chain to `root`/`legacy` with cycle detection. Add regression tests for both forgeries (valid-first duplicate, tampered ancestor).
2. **(F-003) Make session identity real**: have a long-lived session process pass `--session-pid`; stop printing a dead PID from `start`; store the same PID in the snapshot; document the flag. If one-shot sessions cannot supply one, store `null` and require owner confirmation for `--force`.
3. **(F-004) Require conclusive death in the 7-day branch** (or explicit host confirmation) and align the comment with the code.
4. **(F-005/F-006) Restore a green repository**: re-record/rehash the copilot journal with a reason, archive the oldest journals until `.ai/worklog/` is <= 30 files, re-run validator + `doctor` before tagging.
5. **(F-007/F-008) Finish the edges**: use the canonical regex at `protocol-hooks.cjs:320`; bound `--session-pid`.
6. **(F-010) Bump the declared version** when releasing this batch so consumers can pin v1.9.3.

---

## References

- Decision blocks: `PROTO-DEC-0027`, `PROTO-DEC-0026` in `.ai/DECISIONS.md`
- Active task: `.ai/TASK.md` (In Progress; one acceptance box open)
- Associated session journal: `.ai/worklog/deepseek-flash-0a05beefb1dffcb2.md`
- Superseded review: `docs/reviews/2026-09-18-deepseek-flash-v1.9.3-audit.md` (round 1, earlier dirty tree)
- Related reviews: `docs/reviews/2026-09-18-claude-v1.9.3-audit.md`, `docs/reviews/2026-09-18-qwen-hostile-audit-v1.9.3.md`, `docs/reviews/2026-09-18-mistral-vibe-v1.9.3-audit.md`
- Probe artifacts: `%TEMP%\kilo\audit\probe-lock.cjs`, `probe-deep.cjs`, `probe-archive.cjs`, `probe-fork2.cjs` (standalone, rebuild fixtures from `protocol-manifest.json`)
