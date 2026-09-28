# DeepSeek Flash - Registry fixture fix review (checks 6/7 synthetic decision id)

**Date**: 2026-09-28
**Reviewed commit**: 0e0d6a7ff48313e8d84969e8d57995e920ead6f6 (range `ad14a14..0e0d6a7`)
**Working tree**: dirty (untracked session journal `.ai/worklog/deepseek-7ca79f41c34b762a.md`; the reviewed fix is committed)
**Reviewer**: DeepSeek Flash (model id `deepseek/deepseek-flash`; provider `deepseek`, per the qualified id surfaced by this session's runtime; no separate call log was exposed, so the provider is recorded from the session context, not a verified log)
**Scope**: edge-cases (single test-file fix; low blast radius)
**scope-check**: PASS
**Verdict**: PASS
**Mode**: ADVISORY
**Receipt-Owner**: deepseek-7ca79f41c34b762a

<!-- A fix review, not certification (launch: Mode: ADVISORY). A single advisory reviewer
cannot satisfy a completion gate. No FAIL/BLOCKED finding; the one RECOMMENDATION is optional
and forward-looking. -->

---

## Executive Summary

The fix is minimal and correct: `tests/registry.test.cjs` now derives the synthetic decision id
as `max(PROTO-DEC-NNNN in .ai/DECISIONS.md) + 1` = `PROTO-DEC-0104` and uses it in exactly the
three places per test (synthetic block, registry row, `assert.match`). The pre-fix failure
reproduces exactly as the journal claims (2 fail, the two cited `[FAIL]` lines), and the fixed
tree is green 8/8. One optional, far-future limitation: the `\d{4}` id regex cannot represent
five-digit ids, so the derivation stops being correct at the 9999/10000 boundary. No mandatory
defect.

---

## Scope and Evidence

- **Baseline commit**: `0e0d6a7` (diff `ad14a14..0e0d6a7`, 2 files in the fix commit:
  `tests/registry.test.cjs` +17/-6, `.ai/worklog/mistral-31c0a7ec3787702f.md` new)
- **Working tree state**: `dirty` (only the untracked reviewer journal; no tracked edits)
- **Commands executed**:
  - `node --test tests/registry.test.cjs` -> `# pass 8 / # fail 0`
  - `node --test .ai/runtime/mistral-repro/registry-prefix.test.cjs` (pre-fix logic, scratch) -> `# pass 6 / # fail 2`
  - `git diff ad14a14..0e0d6a7`; `git show -s --format=... 0e0d6a7`
  - id probe over `.ai/DECISIONS.md` (402 `PROTO-DEC-NNNN` occurrences, max `0103`)
- **Environment**: Windows, Node v22.21.0, PowerShell 5.1.26100.9444

---

## Findings Ledger (PROTO-DEC-0041)

| ID | Requirement | Candidate | Reproduction | Actual Result | Severity | Disposition | Proof of Closure |
|---|---|---|---|---|---|---|---|
| F-001 | Derivation must stay correct across the full id range the corpus can reach | `tests/registry.test.cjs:24-28` | see below | regex `PROTO-DEC-(\d{4})` captures only four digits; at 9999 the next id is the 5-digit `PROTO-DEC-10000`, which a later run re-parses as `1000` | LOW | confirmed | optional hardening; current corpus max is 0103, ~9896 ids away |

No HIGH or MEDIUM finding. Objective blocking rule does not trigger.

### F-001 - [LOW] - Four-digit id regex has no representation above 9999

- **Requirement**: the computed id must remain unique and correctly formatted as `.ai/DECISIONS.md`
  grows (launch item 2: "states what happens at 9999").
- **Location**: `tests/registry.test.cjs:25`
- **Confidence**: High
- **Reproduction**:
  ```text
  /PROTO-DEC-(\d{4})/g against "PROTO-DEC-10000" matches "PROTO-DEC-1000" -> 1000, not 10000.
  Next id from a 9999 maximum is `PROTO-DEC-10000`; padStart(4) does not truncate, so a 5-digit
  id is emitted. The registry row regex /(?:PROTO-)?DEC-\d{4}/ elsewhere does not match it.
  ```
- **Actual Result**: At the 9999 boundary the derivation degrades gracefully but not correctly:
  the immutable `PROTO-DEC-9999` block remains in the corpus, so `max` stays 9999 and every run
  recomputes `PROTO-DEC-10000` (stable, but a 5-digit form the rest of the tooling assumes is
  four-digit). This is a latent, ~9896-decisions-away limitation, not a defect of the fix.
- **Disposition**: `confirmed` (optional)
- **Recommendation / Proposed Fix**: when the corpus approaches 9999, widen to `PROTO-DEC-(\d{4,})`
  and pad to at least four digits, or assert ids stay <= 9999. No action required now.
- **Proof of Closure**: `node -e` regex probe above.

---

## Per-item verdicts (launch "What to verify")

1. **Reproduction claim - PASS.** Running the pre-fix logic (`.ai/runtime/mistral-repro/registry-prefix.test.cjs`,
   byte-faithful to the old test except an absolute `helpers.cjs` require) against the live corpus
   gives `# pass 6 / # fail 2`, with exactly the cited lines:
   `[FAIL] duplicate decision: PROTO-DEC-0099` and
   `[FAIL] PROTO-DEC-0099 was edited after it was written; a decision block is never rewritten`.
   Cause confirmed: `.ai/DECISIONS.md:4519` holds a real `PROTO-DEC-0099`, and the fixture-based
   validator resolves the real corpus.
2. **Minimal and correct - PASS.** The fix commit touches only `tests/registry.test.cjs` and the
   fix journal; the derivation is used in the synthetic block, the registry row and the
   `assert.match` of checks 6 and 7, and nowhere else. No test is skipped, disabled or weakened
   (same assertions, same WARN expectations, only the id is parameterised). Derivation over the
   live corpus yields `0103 -> 0104`; no upper bound break exists until 9999 (see F-001).
3. **Green on the fixed tree - PASS.** `node --test tests/registry.test.cjs` -> `# tests 8 / # pass 8 / # fail 0`.
4. **Regression risk - PASS.** `PROTO-DEC-0104` collides with nothing: not in
   `docs/decisions/REGISTRY.md` (its max row is `0103`), not in `.ai/DECISIONS.md`, not with the
   static ids used by the other tests (`DEC-0001`, `PROTO-DEC-0032`, `DEC-9999`). `expectedEntries`
   (check 1) is computed from `validRegistryContent` alone and is unaffected by the appended row.

---

## Deep Dives

### Derivation scope and semantics

`nextDecId` is a module-load IIFE over `validDecisionsContent`, which every fixture copies into
its temp root, so the computed id always tracks the same corpus the validator will inspect. The
regex `PROTO-DEC-(\d{4})` also matches ids mentioned in prose (not only `###` headings); this can
only raise `max`, never lower it, and the real maximum is a genuine id, so the result stays
collision-free. `Math.max` over ~104 ids is trivial. Bare `DEC-NNNN` forms (the historical
`DEC-0001..0007` approval-note headings) are deliberately not matched, correctly leaving the
`PROTO-DEC` maximum authoritative.

### Journal vs. commit provenance

The fix journal (`.ai/worklog/mistral-31c0a7ec3787702f.md`) records "No commit, no push (not
authorized by this dispatch)" and an Evidence anchor of `268e4fe` with uncommitted changes. The
actual commit `0e0d6a7` is authored by `RuslanFomenko` at 2026-09-28 20:06 +0300, i.e. the owner
committed the session's working tree after the session ended. This is consistent with the launch;
it is noted only so the provenance is explicit. The journal's model disclosure (requested
`glm-5-3`, ran `mistral-medium-3.5`, "falling back" log check denied) is an honest fallback and
outside this diff review's scope.

---

## Alternatives Considered & Trade-offs

- **Hardcode a fixed new id (e.g. `PROTO-DEC-9000`)**: rejected - the original defect was exactly
  a hardcoded id colliding with the growing corpus; any fixed value can collide later.
- **Widen the regex to `\d{4,}` now**: rejected as premature; it changes behaviour only at the
  10000 boundary and the current fix is intentionally minimal.

---

## Recommendations & Actionable Plan

1. No mandatory change. The fix can be accepted as written for the current corpus.
2. Optional (backlog): when `.ai/DECISIONS.md` reaches `PROTO-DEC-0999x`, change the regex to
   `PROTO-DEC-(\d{4,})` and keep `padStart(4, '0')`, or add a guard that the corpus stays <= 9999.
3. This review is ADVISORY and certifies nothing; a separate independent certifier is required if
   the fix is to close a gated task under PROTO-DEC-0038 item 1.

---

## References

- Fix: `0e0d6a7`; base `ad14a14`; launch `docs/research/2026-09-28-autocycle/LAUNCH-REGISTRY-FIX-REVIEW.md`
- Journal: `.ai/worklog/mistral-31c0a7ec3787702f.md`; reviewer journal `.ai/worklog/deepseek-7ca79f41c34b762a.md`
- Corpus: `.ai/DECISIONS.md:4519` (`PROTO-DEC-0099`); max id `PROTO-DEC-0103`
