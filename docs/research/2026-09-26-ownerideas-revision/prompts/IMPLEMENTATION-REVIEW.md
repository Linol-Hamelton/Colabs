# Stage 9 — implementation review (DeepSeek)

Read `COMMON.md` first. Mode ADVISORY; you verify, you decide nothing. You did not plan or write
these packages (the plan was yours, so you certify nothing here: PROTO-DEC-0079 D7, 0086). Output:
`round8/IMPLEMENTATION-REVIEW-DEEPSEEK.md`.

## Inputs

- `round6/FINAL-RESOLUTION-CLAUDE.md` and `round6/packages/PKG-1..5.md` (the contract);
- the implemented working tree (uncommitted changes of both executors);
- `round8/IMPLEMENT-E1-GEMINI.md` and `round8/IMPLEMENT-E2-MISTRAL.md` (the executor reports);
- `round3/RESOLUTION-CLAUDE.md` section 6 (active list A-1..A-14), PROTO-DEC-0079..0086,
  `docs/core-arch/stage-1/P-L0-008-research-governor.md`.

## Checks

1. Completeness: every required output of every package exists; every acceptance criterion is
   demonstrable; every validation command was run (re-run them yourself where cheap).
2. Conformity: no package exceeded its allowed paths; forbidden paths untouched; no scope widening;
   no new decisions, frames or model assignments.
3. Integration: the packages work together; the W1 `protocol-manifest.json` single-owner rule held;
   no same-wave path collisions; dependencies from the resolution's table are satisfied.
4. Regressions: run `powershell -ExecutionPolicy Bypass -File .\validate-protocol.ps1` and
   `test-protocol.ps1`; report their real exit codes and output; check L0-L3 consistency and the
   docs against the implementation.
5. Duplicate sources of truth: no second active canonical source for anything the packages
   canonicalize.
6. Findings list: severity (BLOCKING / RECOMMENDATION / NOTE), `path:line`, reproduction, minimal
   fix requested. Verdict: `PASS` (no BLOCKING) or `FINDINGS` (with the BLOCKING list).
7. Stop conditions the executors returned: verify each claimed STOP; a wrong STOP is a finding.

At most 250 lines; no commits; no edits outside your output and journal; five-label journal and
`record --quick`.
