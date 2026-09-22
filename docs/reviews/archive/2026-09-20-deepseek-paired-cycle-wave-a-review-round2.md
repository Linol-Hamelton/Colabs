# Certifying Review Round 2: Paired-Cycle Wave A (W-A1 closure)

Reviewer: DeepSeek (controller, independent reviewer)
Date: 2026-09-20 (UTC)
Reviewed commit: d38d2f2ae4b4c17fe6c2c18f11215cedb2f10eb1
Working tree: dirty (uncommitted remediation set)
Mode: CERTIFYING
Receipt-Owner: deepseek-59c81998639a4feb
Scope: re-certification of Wave A after the W-A1 remediation and the W-A2 test-fixture fix; R1, R2, R3, R4, R7.
Verdict: PASS

## What was re-run

1. **Junction-escape probe (W-A1): RESOLVED.** `.ai/runtime/wave-a-probe.cjs` on a TEMP
   installed fixture: host edit of `.ai/docs/PAIRED-CYCLE.md` -> exit 0; deleted
   managed file -> exit 1 (`Protocol BROKEN`, missing managed file); completion gate
   routed through an in-root junction to files outside the repository -> **exit 1**
   with `[FAIL] independent review must be a safe path inside the repository root`.
   `Test-ProtocolSafePath` now walks the path segments and rejects
   `FileAttributes::ReparsePoint` (1024), keeping the `..`, absolute and root-escape
   checks; the Node `isSafeInRoot` realpath semantics remain the stricter reference.
2. **Red regression test (W-A2): RESOLVED.** The new junction test failed on its
   normal in-root case because the fixture declared `Receipt-Owner: session-audit`
   without a journal; the fixture no longer declares that binding, and the junction
   case still asserts exit 1 with the safe-path failure.
3. **Full regression suite: 262/262 pass**, 0 fail, 124.5 s (255 baseline + 7 new).
4. **Source validator**: exit 0 with the single expected journal-budget warning
   (R8, Wave B).

## Findings status

- W-A1 (MEDIUM, junction escape in the PowerShell validator): **CLOSED** - reproduction
  now fails as required; PS/Node parity restored on this criterion.
- W-A2 (MEDIUM, red regression test): **CLOSED** - suite green.
- N-A1 (implementer `record --quick`): still pending; final-tree receipts are recorded
  in the closure sequence (implementer, then reviewer), so this is handled there.
- N-A2 (stray `protocol-manifest-temp.json` in the repository root): handed to Wave B
  housekeeping (verify unreferenced, move to `.ai/runtime/`).
- N-A3 (journal count warning): R8/Wave B scope.

## Scope note

This round certifies Wave A only. R5 (risk-scaled completion), R8 (operational
budgets) and the final R1-R8 unified prompt remain Wave B; the final CERTIFYING report
for the whole PROTO-DEC-0040 remediation follows after Wave B and its own review.
