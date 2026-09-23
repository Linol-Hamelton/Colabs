# DeepSeek (deepseek-flash) - Item 3 (A4) and CI Restoration Audit

**Date**: 2026-09-19  
**Reviewed state**: anchor `ebd777e` plus the uncommitted Step 0 + Item 3 changes; implementer receipt `verify --deep` exit 0 (fresh at audit time)  
**Reviewer**: DeepSeek (deepseek-flash), auditor/controller  
**Scope**: Step 0 CI restoration (per the A2 audit addendum) and Item 3 / A4 capability and evidence discipline  
**Conflict declaration**: authored the A4 specification and the addendum; no implementation role; whole-plan certification still requires a different reviewer.  
**Mode**: CERTIFYING  
**Verdict**: **PASS** - no blocking findings. `PROTO-DEC-0031` awaits the owner's explicit approval; it must not be inserted with the pending placeholder.

---

## 1. Step 0 - CI restoration verified

The workflow now matches the addendum's section 2 YAML: the DEC-0009 comment, `push: branches: ['**']`, `pull_request`, `workflow_dispatch`, the `[WARN]`/`[FAIL]` escalation wrapper, the regression suite, the tree anchor, the clean-directory install + validation and the reinstall idempotency/state-preservation steps are all present. Independent check of the step list:

```
- name: Protocol validation (escalate warnings and failures)
- name: Regression suite
- name: Tree anchor
- name: Install into a clean directory and validate there
- name: Reinstall is idempotent and preserves project state
```

No history rewrite: the restoration is a working-tree change on top of `ebd777e`. The strengthened workflow has not run yet; it will run on the owner's next push (the previous push ran the reduced version).

## 2. Item 3 (A4) verification

| Check | Result |
|---|---|
| `node --test tests/review-findings.test.cjs` | 16/16 pass (includes the A4 policy-pin test) |
| `powershell .\test-protocol.ps1` | 217/217 pass, exit 0 |
| `powershell .\validate-protocol.ps1` | exit 0, 0 warnings, 29 journals |
| `verify --owner gemini-434bcd8012e0f38c --deep` | exit 0, matches the current tree |

Content review:

- `templates/reviews/REVIEW.md` adds `Mode`, `Receipt-Owner` and `Receipt` with an explanatory comment covering the four capabilities, the orchestrator-profile rule and the advisory route. The fields sit in the header block; the transcription note remains below.
- `AGENTS.md` section 2 adds two paragraphs: the capability requirement with `Mode: CERTIFYING` + `Receipt-Owner`; the advisory `[MODE: READ-ONLY ADVISORY]` rule with the section 5.5 route and the gate exclusion; the FAIL/BLOCKED reproduction rule. Existing mandate text is untouched; the B5 approval-provenance wording from `PROTO-DEC-0030` remains intact.
- `.ai/docs/PROTOCOL.md` gains a "Review modes and capability model" subsection consistent with the mandate.
- `tests/review-findings.test.cjs` pins the template fields, the four capability tokens, `Mode: CERTIFYING`, `Receipt-Owner` and `[MODE: READ-ONLY ADVISORY]` in AGENTS.md - a static policy test, appropriate for a text-only change.
- Scope: no unrelated files; `gate-check` code is correctly deferred to Item 4.

### Findings (non-blocking)

| Id | Severity | Finding | Disposition |
|---|---|---|---|
| A4-1 | INFO | The template's `Receipt` field is optional in the design but renders as a fill-in placeholder; `gate-check` must treat an absent value as allowed | Item 4 must accept an empty `Receipt` |
| A4-2 | INFO | PROTOCOL.md phrases the advisory mode as "`Mode: ADVISORY` (or `[MODE: READ-ONLY ADVISORY]`)"; the tag is the transcription marker, the field is the mode | Harmless redundancy |
| A4-3 | INFO | The A4 test would fail on a legitimate template reformat (for example an HTML-comment rewrite) | Acceptable for a policy pin |

## 3. PROTO-DEC-0031 draft review

The draft matches the implemented policy: the four capabilities, orchestrator-profile determination, the two modes with the receipt-owner binding, the advisory transcription route, and the reproduction mandate for FAIL/BLOCKED. The `Approved by: <owner approval pending>` placeholder must never be committed: the validator rejects placeholder approvers. After the owner confirms in chat, the controller transcribes the block under the `PROTO-DEC-0030` rule with a provenance line.

## 4. Recommendation

1. Owner approves `PROTO-DEC-0031` (or requests wording changes).
2. Commits, no push by the implementer:
   - CI restoration: `.github/workflows/protocol.yml`, `docs/reviews/2026-09-19-deepseek-flash-a2-audit-addendum.md`, `docs/reviews/2026-09-19-deepseek-flash-a2-audit.md` (superseded header), `.ai/worklog/*`; message `ci: restore full protocol workflow coverage`.
   - A4: `templates/reviews/REVIEW.md`, `AGENTS.md`, `.ai/docs/PROTOCOL.md`, `tests/review-findings.test.cjs`, `docs/reviews/2026-09-19-deepseek-flash-a4-audit.md`, `.ai/DECISIONS.md` (once `PROTO-DEC-0031` is transcribed), `.ai/worklog/*`; message `docs(policy): review capability and evidence discipline (A4)`.
3. Owner pushes; the strengthened workflow runs for the first time.
4. Next item: A3 `gate-check` (Item 4). A dispatch prompt can be prepared on request; it must implement the A4-1 note (empty `Receipt` accepted).

## 5. References

- Addendum: `docs/reviews/2026-09-19-deepseek-flash-a2-audit-addendum.md`
- Plan revision 2, section 4.A4; `PROTO-DEC-0030`; `PROTO-DEC-0031` draft in the Item 3 dispatch result
- Implementation handoff: `.ai/worklog/gemini-434bcd8012e0f38c.md`
