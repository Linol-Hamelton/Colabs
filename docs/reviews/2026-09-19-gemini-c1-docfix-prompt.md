# Gemini C1 Doc-Fix Prompt - Pilot Design Corrections

**Date**: 2026-09-19  
**Implementer**: Gemini  
**Auditor**: DeepSeek - quick re-verification before the C1 commit  
**Trigger**: `docs/reviews/2026-09-19-deepseek-flash-c1-audit.md` D-1..D-3. The instrumentation code passed; only the document needs changes.

## Corrections (document-only)

1. **D-1**: In `docs/reviews/2026-09-19-h1-pilot-design.md`, replace the review-style header with a design-document header: title, date, `Author: Gemini (implementer)`, `Status: Design - not a review artifact`. Remove `Reviewer`, `Mode`, `Receipt-Owner`, `Receipt` and `Verdict` fields. The document must not look like a gate-eligible review.
2. **D-2**: In the threshold table, restate the handoff row as `R(handoff) >= R(Arm A)` on the same task set (a strict 100% is not required where the Arm A baseline is below it). Keep the "no decrease" requirement consistent between the table and the prose.
3. **D-3**: In the execution procedure, replace the baseline reference `a8f8985` with "the commit that includes this C1 instrumentation (created after the audit)".

## Verification

- Re-read the document end to end after the edits; confirm no `Mode:`/`Verdict:`/`Receipt-Owner:` remain anywhere in it.
- `node --test tests/context-policy.test.cjs` (policy pin must stay green; the design doc is not covered by it, this is a sanity run), full `test-protocol.ps1`, `validate-protocol.ps1` exit 0 with 0 warnings.
- Journal entry (five labels), `record --owner gemini-434bcd8012e0f38c`, `verify --deep` exit 0; stop for the re-verification; no commit, no push.
