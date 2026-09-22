# Final Certifying Report: Paired-Cycle Remediation R1-R8 (PROTO-DEC-0040)

Reviewer: DeepSeek (controller, independent reviewer)
Date: 2026-09-20 (UTC)
Reviewed commit: d38d2f2ae4b4c17fe6c2c18f11215cedb2f10eb1
Working tree: dirty (uncommitted remediation set, no commit authorized)
Mode: CERTIFYING
Receipt-Owner: deepseek-59c81998639a4feb
Scope: full remediation R1-R8 from `.ai/PLAN.md`, wave reviews
`2026-09-20-deepseek-paired-cycle-wave-a-review.md` (round 1 FAIL),
`...-wave-a-review-round2.md` (PASS) and `...-wave-b-review.md` (PASS).
Verdict: PASS

## Disposition

| Item | Source findings | Status | Evidence |
|---|---|---|---|
| R1 | F-001, F-007 | RESOLVED | `.ai/docs/PAIRED-CYCLE.md` added to `$docDigests`; host edit WARN / missing FAIL reproduced in a TEMP install; `tests/manifest.test.cjs` pins the managed entry and fails if it is removed |
| R2 | F-002 | RESOLVED | runbook phases reordered: implementer persists the Unified Adversarial Audit Prompt before independent review; no Completed before core review + gate; Phase 6 is handoff/stop only; template-title test enforces the exact header |
| R3 | F-003, F-004 | RESOLVED | four templates fixed: exact `Unified Adversarial Audit Prompt` title, `verify --deep`, CERTIFY output header and journal path binding, Owner name vs Session id, active-journal reuse, source `test-protocol.ps1` vs host `testCommand` |
| R4 | F-008 | RESOLVED | artifact/receipt ordering documented: persist prompt, review, TASK and archival before final record; producer receipt verified before consumer edits; sequential re-record on the same final tree; `--quick` explicitly validator-only |
| R5 | F-006 | RESOLVED | conservative risk-scaled completion implemented in `validate-protocol.ps1` and `protocol-handoff.cjs` gate-check with identical semantics; controller probes: docs light path exit 0 in both, core-under-docs / unknown scope / ADVISORY / traversal / empty change set exit 1 in both |
| R6 | F-005 | RESOLVED | PROTO-DEC-0040 and the registry transitions are recorded append-only; validator's decision-immutability check passes (no historical block rewritten); the earlier exception is durable, not TASK-only |
| R7 | B, G, H | RESOLVED | owner-selected in-root review paths with reparse-point rejection and PS/Node parity; managed docs carry no source-only prerequisites; measured upgrade guidance (plain install restores the file and reaches manifest 1.9.6 but needs `-Force` for full parity) proven by v1.9.4/v1.9.5 tag fixtures |
| R8 | H, F-010 | RESOLVED | 8 completed journals archived and pruned (15 entries appended to `.ai/ARCHIVE.md`); validator **0 warnings**; 27 session journals (cap 30, PROTO-DEC-0037 WARN-first wording); corpus 58 files / ~545 KB |

Secondary audit items: F-009 (release tag) confirmed FALSE for an uncommitted candidate and
deliberately not "fixed" by reverting the version; F-010 (state drift) resolved by
re-measurement, not by rewriting history.

## Verification actually run

- `validate-protocol.ps1`: exit 0, **0 warnings**.
- `test-protocol.ps1`: **270/270 pass**, 0 fail, 147.5 s.
- `.ai/runtime/wave-a-probe.cjs` (installed fixtures): host edit exit 0; missing managed
  file exit 1; junction escape exit 1.
- `.ai/runtime/wave-b-probe.cjs` (installed fixtures): six R5 cases as tabulated above.
- PS/Node path and gate semantics inspected side by side; strict path unchanged.

## Limits and disclosures

- The R8 housekeeping, the final prompt refresh and the temp-file move were executed by the
  controller after the implementer's runs terminated early; disclosed in the Wave B review.
- Containment trusts git metadata; `git update-index --assume-unchanged` could hide a core
  edit. Threat model is accidental drift between cooperating sessions, not adversarial
  manipulation by a user with direct filesystem access.
- No I/O-fault rollback test of the installer and no new gate/classifier were added, per the
  dispatch's explicit non-goals.
- Receipts: recorded after this report and the TASK acceptance update, on the same final
  tree - implementer first, reviewer second - then `verify --deep`.

## Verdict

PASS. No mandatory R1-R8 finding remains open; the optional improvements surface as the
disclosed limits above. Product pilots may resume after the final-tree receipts verify.
