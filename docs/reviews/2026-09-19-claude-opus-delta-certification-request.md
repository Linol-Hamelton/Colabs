# Claude Opus Delta Re-Certification Request - v1.9.5

**Date**: 2026-09-19  
**Requester**: DeepSeek (deepseek-flash), controller - non-certifying  
**Reviewer**: Claude Opus 4.6 (your session `claude-opus-0f1b841e5c4c6638`)  
**Context**: Your certification review (`docs/reviews/2026-09-19-claude-opus-v1.9.5-certification.md`, RECOMMENDATION) raised four findings. All four were confirmed by the adjudicator and fixed in the Item 6 remediation, together with a package-level defect (AUD-C1: the prompt lacked the validator-required unified-prompt phrase). DeepSeek audited the fixes: PASS (`docs/reviews/2026-09-19-deepseek-flash-item6-audit.md`).

## What to verify on the fixed HEAD

Review the commit that contains the Item 6 remediation (HEAD; `git log --oneline -3`). Re-run your four reproductions and confirm or refute closure:

1. **F-001** - case-mutated registry row (`dec-0001` / `ACCEPTED`) must now produce warnings (missing entry, unknown id, immutability) instead of passing silently.
2. **F-002** - a body `Date:` after `---` must no longer classify a review as legacy; a review with header `Date: 2026-09-25` and body `Date: 2026-01-01` must fail on missing `Mode`; a review with no header `Date` must fail with `missing or has an invalid Date`.
3. **F-003** - `isSessionAlive` must treat PID 4 as unusable (`supervisorPid: 4` with a dead pid returns `false`).
4. **F-004** - a journal citing `docs/reviews/<review>.md.bak` (or `-draft`) must fail the binding; an exact citation must pass.
5. **AUD-C1** - `validate-protocol.ps1` must pass the completion-gate basic check on a Completed task citing `docs/reviews/2026-09-19-final-v1.9.5-adversarial-review-prompt.md` (the unified-prompt phrase is present).

## Deliverables

1. Delta review `docs/reviews/2026-09-19-claude-opus-v1.9.5-delta-certification.md` following `templates/reviews/REVIEW.md`: `Mode: CERTIFYING`, `Receipt-Owner: claude-opus-0f1b841e5c4c6638`, reviewed commit (the fixed HEAD), per-finding closure results with commands and outputs, an explicit verdict on the release (`PASS` / `RECOMMENDATION` / `FAIL`), and any new findings a `FAIL` must reproduce.
2. Journal entry (five labels) in your journal, `record --owner claude-opus-0f1b841e5c4c6638`, `verify --owner claude-opus-0f1b841e5c4c6638 --deep` (exit 0).
3. Short chat summary: verdict, report path, closure table.

## Constraints

- Do not modify implementation files, decision blocks, the registry, TASK.md or historical reviews; probes in a clone or fixtures.
- No history rewrite; do not touch other sessions' journals.
- If a finding is not closed, or a new release-blocking defect is found, say so explicitly with a reproduction.
