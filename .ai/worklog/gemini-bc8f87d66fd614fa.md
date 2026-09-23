# Worklog: gemini-bc8f87d66fd614fa

Session journal. Owned by this session. No other session writes here.

Newest entry first. Limit 150 lines.

---

## 2026-09-23 - Remediation round for candidate b232a9e

Agent: gemini-bc8f87d66fd614fa

Action:
Completed ONE remediation round addressing the union findings of Codex slot 1 (C01-C10) and Claude slot 2 (F-S2-01..F-S2-05) across all owner-assigned root-cause classes:
1. Created docs/reviews/2026-09-23-batch-findings.md capturing C01-C10 union findings. Initial protocol-verdict run reported FAIL (exit 1).
2. validate-protocol.ps1 (RC-immutability-boundary C07/F-S2-02): Anchored regex at end of string (\z) without m flag, preserved heading-only termination, stripped only single trailing separator, added heading comparison to catch tampering.
3. .ai/bin/protocol-index.cjs (RC-path-alphabet C09): Updated PATH_LIKE regex to include Unicode and + tokens.
4. docs/specs/2026-09-23-executable-rulebook-spec.md: Updated lines 110-113 to require recorded invariant violation (RC-text-as-judgement C08) and lines 167-169 to exclude author, executor, controller, or executing pair under PROTO-DEC-0041 item 1 (RC-spec-controller-omission C06).
5. .ai/bin/protocol-scope.cjs: Removed scope/forbidden file touched set exemption (RC-touched-input-exemption C04); changed error diagnostics to repo-relative paths (RC-absolute-diagnostics C10); restricted producer derivation to declared inputs, removed basename fallback, rejected SHA as producer owner, and excluded controller/coordinator/author/executor roles from certifying (RC-owner-source-guessing C05, RC-spec-controller-omission C06).
6. .ai/bin/protocol-verdict.cjs: Constrained manifest lookup to candidate repo root without ancestor traversal or nested shadowing (RC-manifest-root-discovery C03); enforced non-empty arrays of strings for managed/source keys (RC-manifest-schema C02); hardened ledger parsing against unframed rows, blank/prose splits, second tables, hidden fenced rows, duplicate headers, extra/short cells, and invalid exits (RC-ledger-parse C01, F-S2-01, F-S2-03); stripped bare unrunnable word/filename matching (RC-text-as-judgement C08).
7. tests/validator.test.cjs & tests/rulebook.test.cjs: Added negative tests for all fixed root causes and classes.
8. Updated docs/reviews/2026-09-23-batch-findings.md dispositions to fixed-and-verified and verified protocol-verdict yields PASS (exit 0).

Result:
- validate-protocol.ps1: 0 warnings, 0 failures.
- test-protocol.ps1: 371/371 tests passed (exit 0).
- tests/rulebook.test.cjs: 49/49 tests passed (exit 0).
- tests/validator.test.cjs: 34/34 tests passed (exit 0).
- protocol-verdict on open ledger: FAIL (exit 1).
- protocol-verdict on closed ledger: PASS (exit 0).

Next step:
Opposing certifiers re-audit the remediated tree; await owner direction.

Open:
None. All 10 root-cause findings closed and verified by automated regression tests.

Evidence:
- anchor: b232a9e5e99b51fccf8a1ce2ccfa009c3a204bed, uncommitted changes present
- digest: sha256:30bf95e88ba49260030c95dff6e0af50231383392dad561b52c773bebff1199a over 337 tracked and untracked files
- digest format: 4
- recorded: 2026-09-23T09:47:59.462Z by gemini-bc8f87d66fd614fa
- entry hash format: 2
- entry: sha256:9a678b98643008e82ac41c9b41887dbf772f66511c5a02ab23db59321779ba02 of this entry without this block
- parent-entry: root
- scope: protocol checks only; host-project tests run separately
- validate-protocol.ps1: exit 0 in 3s
- test-protocol.ps1: exit 0 in 323s
- reproduce: node .ai/bin/protocol-handoff.cjs verify
