# DeepSeek (deepseek-flash) - Gate Review of P-4 (Canonical Hash Helper Deduplication)

**Date**: 2026-09-18  
**Reviewed commit**: a6a6d6194e08e313dce1328cc8af971962f91fa5 (a6a6d61)  
**Working tree**: dirty  
**Reviewer**: DeepSeek (model `deepseek/deepseek-flash`, session `deepseek-flash-ebd6eb9397ed3784`)  
**Scope**: refactor safety | hash semantics | parsing anchors | regression  
**Verdict**: PASS - P-4 closed; P-5 may start  

> Independent verification. No implementation files were modified by the reviewer.

---

## 1. Refactor verified

- `protocol-hooks.cjs` defines and exports `ENTRY_HASH_FORMAT = 2`,
  `hasEntryHashFormat2(section)` and `canonicalEntryBody(section)`
  (`:264-281`, export at `:513`).
- `canonicalEntryBody` semantics are unchanged (Addendum A-2): for format 2 it
  strips only the `- entry:` line; for legacy it strips the whole `Evidence:`
  block; then trailing separators and whitespace. No `- sanitized:` exclusion was
  introduced.
- `protocol-archive.cjs` no longer has a private `entryBody`; it calls
  `hooks.canonicalEntryBody` (`:17`). `protocol-handoff.cjs` re-exports the shared
  helpers.
- Field captures are anchored: `findParentEntry` (`:153`), `parseEvidenceBlock`
  (`:178-179`), `archiveEntryRecords` (`:191`), the archive label counter
  (`:226`), and `doctor`'s parent-entry detection (`protocol.cjs:241`).

## 2. Adversarial probes (all independent)

| Probe | Result |
|---|---|
| Two independent archive chains accepted | ok / ok |
| Re-root a middle record + older record pointing into the reached chain | rejected: `orphaned segment` |
| `- digest format:` line removed from a legacy middle record | full walk, older terminal reached |
| `parent-entry` placed before `entry`, with a `- sub-entry:` decoy | `findParentEntry` returns the correct older hash; parsed `entry` is the real one; `authenticated: true` |
| `rehash` round-trip after the refactor | edit -> fail; rehash -> 0; verify -> 0 |
| Real repository | `doctor` exit 0; 25 legacy WARN; validator 0 warnings |

The refactor preserved every P-2/P-3 invariant and did not change hash semantics.

## 3. Independent verification runs

| Check | Result |
|---|---|
| `validate-protocol.ps1` | exit 0, 0 warnings |
| `node .ai/bin/protocol.cjs doctor` | exit 0, Healthy, `[WARN] Legacy unauthenticated Evidence receipts: 25 journal(s)` |
| `tests/archive.test.cjs` | 7/7 |
| `tests/handoff.test.cjs` | **30/30** |
| `test-protocol.ps1` | **199/199** |

Reporting note: the implementer's report states `tests/handoff.test.cjs` at
37/37. The actual count is 30/30 (28 from P-3 plus the 2 new P-4 tests). The
suite total 199/199 is correct, so this is a reporting inaccuracy only.

## 4. Residual notes

- Parsing is now stricter: any `entry:` label not on a `- ` line is ignored. The
  real archive, journals and `doctor` remain green, so no legitimate artifact
  depends on the removed fallbacks.
- No new attack surface found.

## 5. Gate decision

- **P-4: closed.**
- **Approved to start P-5** (review-artifact ordering rule, completion-gate
  non-empty check per Addendum A-4, and the missing
  `docs/reviews/2026-09-18-multi-model-consensus-refutation.md` decision).
- The v1.9.4 tag remains frozen until P-5 and P-6 pass and the final adversarial
  review per AGENTS.md section 2 certifies the result.

---

## References

- `docs/reviews/2026-09-18-deepseek-flash-v1.9.4-consolidated-final-plan.md`
- `docs/reviews/2026-09-18-deepseek-flash-p3-gate-review.md`
- `.ai/worklog/deepseek-flash-ebd6eb9397ed3784.md`
