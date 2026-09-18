# DeepSeek (deepseek-flash) - Gate Review of P-2 (Archive Terminal Uniqueness & Orphan Detection)

**Date**: 2026-09-18  
**Reviewed commit**: a6a6d6194e08e313dce1328cc8af971962f91fa5 (a6a6d61)  
**Working tree**: dirty  
**Reviewer**: DeepSeek (model `deepseek/deepseek-flash`, session `deepseek-flash-ebd6eb9397ed3784`)  
**Scope**: archive integrity | adversarial chain attacks | regression  
**Verdict**: FAIL - P-2 is not accepted; do not start P-3 until P2-F1 and P2-F2 are fixed  

> Independent verification of the implementer's P-2 report. Reviewer modified no
> implementation files. Probes built throwaway fixtures only.

---

## 1. Positive results verified

| Claim | Result |
|---|---|
| Single `chain root: transitional` root accepted | Probe: ok |
| Second transitional marker rejected | Probe: rejected (`multiple transitional root markers`) |
| Stripped middle link rejected | Suite test passes (`orphaned segment`) |
| `format >= 4` without parent and without marker rejected | Suite test passes |
| Anchored field parsing | Code uses `^[ \t]*-[ \t]+entry:` etc. |
| `verifyJournalChain` fails an authenticated non-oldest section without parent-entry | Code at `protocol-handoff.cjs:357-360` |
| Validator / doctor / suite | exit 0 / Healthy / **189/189** (independently reproduced) |

The implementer's reported numbers are accurate. The defects below are invariant
holes that the new tests do not cover, which is why the suite is green.

---

## 2. Findings

### P2-F1 - [HIGH] Global terminal/transitional uniqueness breaks a legitimate multi-journal archive

- **Location**: `.ai/bin/protocol-handoff.cjs:258-274` (`transitionalRecords.length > 1`,
  `terminalRoots.length > 1` computed over **all** records, not over the chain
  reached from `archivedParent`).
- **Reproduction** (two independent, individually valid chains, as produced when
  two different journals archive independently):
  ```
  chain A: aTop -> aRoot (parent-entry: root)
  chain B: bTop -> bRoot (parent-entry: root)
  verifyArchivedChain(root, aTop.hash)  -> false
    "archive contains an orphaned segment; history may have been truncated."
  ```
- **Why it is a real false positive**: `ARCHIVE.md` is designed to accumulate
  entries from all journals. `archiveWorklog` appends one chain per journal, and
  the oldest entry of each fresh journal carries `parent-entry: root`. The moment
  a second journal archives, `terminalRoots.length` becomes 2 and every
  `verify --deep` and `doctor` run fails for everyone. The current repository is
  green only because a single journal (gemini) has archived so far.
- **Live confirmation in this repository**: during this review, `record`
  auto-archived five entries from the reviewer's journal, which created a second
  independent chain (`5c03cb73` <- `c8b791ca` <- ... <- `7696ed70`). `doctor`
  immediately reported **30 failures**, one per journal, all
  `archive contains an orphaned segment; history may have been truncated.`, even
  for journals with no archived entries, because the global checks run before the
  `!archivedParent` early return (`protocol-handoff.cjs:251-283`). No fixture is
  needed to reproduce P2-F1: the repository is red now, and must stay red until
  P-2 is corrected. The reviewer's receipt remains valid non-deep; `verify --deep`
  is blocked repository-wide by this defect.
- **Required fix**: make uniqueness **per chain**. Scope terminal/transitional
  checks to the records reachable from the requested `archivedParent`; keep only
  the global duplicate-hash checks. Do not require one global terminal root.

### P2-F2 - [HIGH] Fail-open truncation on legacy archives: a re-rooted middle record hides older history

- **Location**: `.ai/bin/protocol-handoff.cjs:276-316` (orphan check verifies only
  that a parent **exists**, not that every record belongs to the reached chain).
- **Reproduction** (all records legacy/body-only, which is the state of the
  current `.ai/ARCHIVE.md` - all seven real records have `authenticated: false`):
  ```
  before: e1 -> e2 -> e3(chain root: transitional)      verify ok
  attack: rewrite e2 Evidence to "- parent-entry: root"
          rewrite e3 Evidence to "- parent-entry: <e2 hash>"
          (legacy Evidence is outside the entry hash, so both edits are free)
  after:  e1 -> e2(root terminal); e3 unreachable        verify ok  <-- FAIL-OPEN
  ```
- **Impact**: this is exactly the History Truncation Attack the P-2 claim says it
  closes. Older history remains in the file but is no longer part of any verified
  chain, and `verify --deep` reports success. Deleting the old segment entirely is
  the documented out-of-scope case; silently orphaning it while all links still
  "exist" is not, and it is undetected today.
- **Aggravating factor**: a record whose whole `Evidence:` block is deleted has
  `format` defaulting to 1 and therefore counts as a terminal root
  (`protocol-handoff.cjs:203,244-249`). That gives a second way to manufacture a
  mid-chain terminal.
- **Required fix**: after the walk from `archivedParent`, compute the reached set
  and reject any record outside it whose `parentEntry` points into it
  (`archive contains an orphaned segment`). Require the walk to end at a terminal,
  and treat a record with no parsed Evidence as untrusted rather than as a
  `format < 4` terminal. Add regressions for both the re-root attack and the
  Evidence-deletion variant.

### P2-F3 - [LOW] Test gap

The new tests cover the single-chain happy path, a second transitional marker, a
stripped middle record, and a missing-parent format-4 record. They do not cover a
second independent chain or an unreachable record that still has an existing
parent. Add both fixtures; they are the two invariants above.

---

## 3. Gate decision

- **P-2 is not accepted.** P2-F1 (false positive that will break normal
  multi-journal operation) and P2-F2 (fail-open truncation on the current,
  entirely legacy archive) must be fixed and re-tested.
- **Do not start P-3.** P-3 touches the same module (`protocol-handoff.cjs`) and
  would compound changes; land the P-2 corrections first.
- **P-1 remains open** as recorded in the P-1 gate review (P1-F1 registered
  supervisor path, P1-F2 nonce handling). Recommended order: P-2 corrections
  (same module, fresh context), then P1-F1/P1-F2, then P-3.
- No v1.9.4 tag while P-1 or P-2 is open.

---

## References

- `docs/reviews/2026-09-18-deepseek-flash-p1-gate-review.md`
- `docs/reviews/2026-09-18-deepseek-flash-v1.9.4-consolidated-final-plan.md` (P-2/D3)
- `.ai/worklog/deepseek-flash-ebd6eb9397ed3784.md`
