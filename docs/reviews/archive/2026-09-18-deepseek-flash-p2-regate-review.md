# DeepSeek (deepseek-flash) - Re-Gate Review of P-2 (P2-F1 / P2-F2)

**Date**: 2026-09-18  
**Reviewed commit**: a6a6d6194e08e313dce1328cc8af971962f91fa5 (a6a6d61)  
**Working tree**: dirty  
**Reviewer**: DeepSeek (model `deepseek/deepseek-flash`, session `deepseek-flash-ebd6eb9397ed3784`)  
**Scope**: archive integrity | adversarial chain attacks | regression  
**Verdict**: CONDITIONAL PASS - P2-F1 fixed, P2-F2 fixed for the reported vector, one bypass remains (P2-F3)  

> Second independent pass after the implementer's fixes. Read together with
> `docs/reviews/2026-09-18-deepseek-flash-p2-gate-review.md`, which remains the
> record of the original findings.

---

## 1. P2-F1 (multi-chain false positive) - FIXED, verified

- `verifyArchivedChain` now returns early when `archivedParent` is null
  (`protocol-handoff.cjs:215`) and no longer enforces global terminal uniqueness.
- Probe: two independent valid chains in one archive, each ending in
  `parent-entry: root` -> `verifyArchivedChain` returns ok for chain A, chain B,
  and for `archivedParent === null`.
- Live: `node .ai/bin/protocol.cjs doctor` -> exit 0, `Protocol Healthy`; the
  30-failure red state from the first review is gone. `.ai/ARCHIVE.md` has 27
  dated sections, 12 with `- entry:`, all 12 with `- digest format:`.

## 2. P2-F2 (fail-open truncation) - FIXED for the reported vector

- `hasEvidence` is required for `isTerminal`, and the walk fails a reached record
  without recognized Evidence (`protocol-handoff.cjs:201-204,251-258,276-278`).
- Per-chain orphan rule added (`:305-312`): any record outside the reached set
  whose `parentEntry` points into it fails.
- Probe: re-root a middle record to `parent-entry: root` and repoint the older
  record to it -> `ok: false`, `archive contains an orphaned segment`. The
  3-link chain with a walked record carrying empty Evidence also fails.

## 3. P2-F3 (residual bypass) - NOT FIXED

- **Reproduction** (legacy record, Evidence is outside the entry hash):
  ```
  chain: e1 -> e2 -> e3(chain root: transitional)
  attack: delete only the "- digest format: 4" line from e2's Evidence,
          keep e2's parent-entry.
  result: verifyArchivedChain(e1) -> ok: true; e3 is never reached.
  ```
- **Root cause**: `parseEvidenceBlock` still defaults a missing
  `- digest format:` line to `1`
  (`protocol-handoff.cjs:181-183`: `format: format ? Number(format[1]) : 1`).
  `archiveEntryRecords` therefore never sees `null` for a record that has
  Evidence, so `isTerminal` treats a stripped middle record as `format < 4`
  (`:253`) and stops the walk. The implementer's report statement "при отсутствии
  блока format устанавливается в null" is not true at the parser level.
- **Impact**: same class as P2-F2 - a legacy-only History Truncation Attack; the
  older segment is hidden while every link that remains still exists. It requires
  the archive to contain an unauthenticated record, which is the current state of
  the repository (all 12 real records are unauthenticated).
- **Required fix**: in `archiveEntryRecords`, detect the explicit
  `digest format:\s*\d+` line in the Evidence text and set `format: null` when it
  is absent (do not change the legacy default for journal entries). `isTerminal`
  already guards `r.format !== null`, so a format-less middle record will no
  longer terminate the walk and will either continue to its parent or fail with
  `no parent-entry`.
- **Regression to add**: a middle record without the format line must not
  terminate the walk; prove the older record is still examined (for example, make
  the older record's body tampered and expect the `was tampered` failure, or strip
  the older record's terminal marker and expect the orphan failure).

## 4. Verification runs (independently reproduced)

| Check | Result |
|---|---|
| `validate-protocol.ps1` | exit 0, 0 warnings |
| `node .ai/bin/protocol.cjs doctor` | exit 0, Healthy |
| `test-protocol.ps1` | exit 0, **191/191** |
| Multi-chain probe | ok for both chains and for null |
| Re-root/orphan probe | rejected |
| Format-line deletion probe | **accepted (P2-F3)** |

## 5. Gate decision

- **P2-F1: closed. P2-F2: closed for the reported vector.**
- **P2-F3 open**: land the one-line parser fix plus the regression; this is small
  and stays inside `protocol-handoff.cjs`.
- Recommended order: P2-F3 fix -> P1-F1/P1-F2 (lock supervisor path and token
  model) -> P-3. P-3 must not start before P-1 closes; no v1.9.4 tag while P-1 or
  P2-F3 is open.

---

## References

- `docs/reviews/2026-09-18-deepseek-flash-p2-gate-review.md` (original findings)
- `docs/reviews/2026-09-18-deepseek-flash-p1-gate-review.md` (P-1 carry-over)
- `.ai/worklog/deepseek-flash-ebd6eb9397ed3784.md`
