# Control report, third pass - CORE-ARCH stage 1, fix attempt 2 (DeepSeek)

- Reviewed commit SHA: `4ded1bee1c2acf2392fdeededf50935f59138302`; tree dirty; no commit in any pass.
- Reviewer: DeepSeek, owner `deepseek-6db5c8f69f491940`, client Kilo; model `deepseek/deepseek-flash`,
  reasoning effort `unknown` as launched - the fourth launch under the same mismatch the owner was
  asked about (T3 question, still open).
- Date: 2026-09-24 (UTC). Mode: ADVISORY. Scope: fix attempt 2 - only the places
  `docs/reviews/2026-09-24-claude-core-arch-stage1-fix-response-r2.md` names, against CA-21, CA-22,
  CA-23 (attempt 2, last for its root cause) and CA-S1.
- **Verdict: RECOMMENDATION.** Every reviewed item holds. Two cosmetic stale version labels remain
  (below); they are optional improvements, not open defects. The stage can go to the owner with the
  open owner items.
- Method: PROTO-DEC-0049 item 1. Widened reading, with the reason: CORE-ARCH-2 §7/§10 (they restate
  P-L0-001), CORE-ARCH-3 §4/§6 (the scope grammar and `Orientation:` the `scope-id` answer relies on),
  CORE-ARCH-1 §2/§3.1 (the level rule the H-11/H-13 fix depends on) - because the fixes cite them.
- Commands run: `git rev-parse --show-toplevel`, `git rev-parse HEAD`, `Get-ChildItem` (timestamps),
  `node .ai/bin/protocol-session.cjs start --agent deepseek`, `Get-Content` reads of the four drafts
  and the named sections, `Select-String` for old back-edge forms and stale version labels,
  `node .ai/bin/protocol-verdict.cjs` over the ledger, `protocol-handoff.cjs record` at the end.
- Related: ledger row CA-S1 appended; existing rows untouched; the r2 report, the round-1 report and
  the critique are unchanged.

## Results of this pass

| Item | Result | Verified in |
|---|---|---|
| CA-21 | fixed-and-verified | CORE-ARCH-2:239 (owner confirms the minor change), :241 (non-author recount), :248-250 (all four edges with budgets and exits, including `11→1`), :252-253 (P-L0-001 is the home; the file wins on divergence) |
| CA-22 | fixed-and-verified | CORE-ARCH-4:81-84 (`scope-id` in form `kind:name`, issued by the owner or coordinator, one per frame; `parent-scope`; `scope` explicitly the edit paths), CORE-ARCH-1:143 names the `scope-id` field |
| CA-23 | fixed-and-verified (attempt 2 holds; `RC-CA-consolidation-rule` closed) | CORE-ARCH-1:57 (`отклонено ... заменяет любой другой уровень`), :79 H-11 and :81 H-13 carry `отклонено`, their consequences say `не берём`; no other row uses the dash |
| CA-S1 | fixed-and-verified | procedure.schema.md:57 (`<from-step>><to-step>/<budget>/<exit>`); P-L0-001:14 `[5>2/1/owner, 7>4/2/owner, 9>4/1/retire, 11>1/1/owner]`; step mentions :75, :100, :109, :115; Back edges :138-143 and Risks :167 match; no other record uses the old form (P-L0-002 `[]`, root has no `back_edges`) |

Hand re-check against schema 0.3: P-L0-001 0.3 and P-L0-002 0.3 pass (required keys per type,
conditional keys, headings in order, front-matter grammar with the `>` form); schema 0.3 is
self-applicable (class B has `cost_basis`, schema needs only the Change log); L0-ROOT is unchanged
from 0.2 and still passes. The implementer's scratchpad claim "4/4 against 0.3" holds.

Second-pass observations: all four taken - P-L0-002:47-48 (`R-L0-10.8`, scope exceeded, frame widened
only by its issuer); CORE-ARCH-7:87 (branch rule inside P-L9-001); CORE-ARCH-7:138-139 (the I-b
scripts are written by the implementer after S3-T13..T15, reviewed by DeepSeek as a stage);
CORE-ARCH-6:106-112 (artifact names aligned with registry 2.1). Citation ranges declined: reason
accepted - the `evidence` form is `path:line`, a range would be a schema change without a finding
behind it, and the cited lines are the heads of the content.

## Ledger

Appended CA-S1 (root cause `RC-CA-backedge-form`, `fixed-and-verified`, attempt 1). No result rows
for CA-21..CA-23: their root causes already carry a row at the same attempt with another disposition,
and `checkStopRule` rejects a duplicate (root cause, attempt) pair with conflicting dispositions
(`.ai/bin/protocol-verdict.cjs:642-649`); this report is the record of those verifications. Existing
rows were not rewritten. `protocol-verdict.cjs --stop-rule` passes.

## Recommendations (not blocking, fix in the next touch)

1. P-L0-002:24 still reads "Draft 0.2"; the front matter is 0.3 and the change log has a 0.3 line.
2. CORE-ARCH-1:46 still reads "Версия 0.2 (исправлено по CA-10)"; section 2 was touched again by CA-23.

## Owner items (unchanged)

- CA-12 and CA-13: decision blocks are immutable; the owner confirms or corrects, with the Gemini
  acknowledgment (PROTO-DEC-0055 item 3).
- Transcription readings: PROTO-DEC-0054 items 1 and 4, PROTO-DEC-0055 item 5.
- T3 question: every pass so far ran on `deepseek/deepseek-flash`, effort unknown.

## Verdict

**RECOMMENDATION**: fixes of attempts 1 and 2 hold; no mandatory defect remains. Stage 1 is ready
for the owner's decision with the owner items above.
