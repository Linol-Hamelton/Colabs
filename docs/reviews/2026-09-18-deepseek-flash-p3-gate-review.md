# DeepSeek (deepseek-flash) - Gate Review of P-3 (Legacy Evidence Scoped Policy)

**Date**: 2026-09-18  
**Reviewed commit**: a6a6d6194e08e313dce1328cc8af971962f91fa5 (a6a6d61)  
**Working tree**: dirty  
**Reviewer**: DeepSeek (model `deepseek/deepseek-flash`, session `deepseek-flash-ebd6eb9397ed3784`)  
**Scope**: legacy Evidence policy | fail-closed verification | regression  
**Verdict**: PASS - P-3 closed; P-4 may start  

> Independent verification. No implementation files were modified by the reviewer.

---

## 1. What was verified

| Requirement (plan P-3 / Addendum A-1) | Independent result |
|---|---|
| `parseEvidenceBlock` exposes `authenticated` | `protocol-handoff.cjs:181,184` |
| `verify --owner` on a legacy newest entry fails without the flag | Probe: exit 1, `evidence is not authenticated (legacy format); re-record to refresh` |
| `--allow-legacy` prints the warning and continues | Probe: exit 0, warning on stderr, `evidence matches the current tree` |
| `--allow-legacy` does not bypass integrity | Tampered legacy body with the flag -> exit 1 (`entry was changed after it was certified`) |
| A format-2 newest entry needs no flag | Probe with a freshly recorded entry: exit 0 |
| No-owner scan never accepts a legacy receipt | Fixture with only a legacy journal -> exit 1 with the exact reason line |
| `doctor` warns and stays exit 0 | Real repo: `[WARN] Legacy unauthenticated Evidence receipts: 25 journal(s)`, `Verdict: Protocol Healthy`, exit 0 |
| Snapshot-format diagnostics preserved | The `evidence.format !== state.format` check runs before the authentication check (`:461-465`) |
| Historical entries are not rewritten | No code path modifies archived/historical receipts; migration is `record` on a new entry |

## 2. Independent verification runs

| Check | Result |
|---|---|
| `validate-protocol.ps1` | exit 0, 0 warnings |
| `node .ai/bin/protocol.cjs doctor` | exit 0, Healthy, 25 legacy journals warned |
| `tests/handoff.test.cjs` | 28/28 |
| `tests/handoff-chain.test.cjs` | 18/18 |
| `tests/lock.test.cjs` | 18/18 |
| `tests/session.test.cjs` | 19/19 |
| `test-protocol.ps1` | **196/196** |

## 3. Notes and residual risks

- The legacy warning count (25) is expected: those journals belong to other
  sessions and must not be rewritten. Scoping the failure to the explicitly
  requested journal and to completion handoffs is exactly Addendum A-1.
- The repository-wide `verify` (no owner) will keep returning non-zero until some
  journal carries a format-2 receipt matching the current tree; that is the
  intended fail-closed semantics, and `record` on the acting session is the
  upgrade path.
- No new attack surface was found: `--allow-legacy` is read-only and still applies
  every body, chain, parent and digest check.

## 4. Gate decision

- **P-3: closed.**
- **Approved to start P-4** (shared `canonicalEntryBody` helper in
  `protocol-hooks.cjs` and anchored field parsing per D4 / Addendum A-2).
- Release tag remains frozen until P-4..P-6 pass and the final adversarial review
  per AGENTS.md section 2 certifies the result.

---

## References

- `docs/reviews/2026-09-18-deepseek-flash-v1.9.4-consolidated-final-plan.md`
- `docs/reviews/2026-09-18-deepseek-flash-p2f3-p1-regate-review.md`
- `.ai/worklog/deepseek-flash-ebd6eb9397ed3784.md`
