# Union Findings Ledger: PROTO-DEC-0046 Candidate Batch Remediation

Date: 2026-09-23
Task: PROTO-DEC-0046 executable rulebook and immutability remediation
Candidate SHA: b232a9e5e99b51fccf8a1ce2ccfa009c3a204bed
Sources: docs/reviews/2026-09-23-codex-batch-certification.md, docs/reviews/2026-09-23-claude-batch-certification.md

| id | root-cause | requirement | paths | reproduction | exit | severity | disposition | attempt |
|---|---|---|---|---|---|---|---|---|
| C01 | RC-ledger-parse | Spec section 2 malformed-ledger contract | .ai/bin/protocol-verdict.cjs | node docs/research/2026-09-23-codex-certification/probes.cjs verdict | 0 | HIGH | fixed-and-verified | 1 |
| C02 | RC-manifest-schema | PROTO-DEC-0046 item 3 protected-set contract; spec section 7 | .ai/bin/protocol-verdict.cjs | node docs/research/2026-09-23-codex-certification/probes.cjs verdict | 0 | HIGH | fixed-and-verified | 1 |
| C03 | RC-manifest-root-discovery | Spec section 1 repository-only and deterministic contract | .ai/bin/protocol-verdict.cjs | node docs/research/2026-09-23-codex-certification/probes.cjs verdict | 0 | HIGH | fixed-and-verified | 1 |
| C04 | RC-touched-input-exemption | Spec section 5 complete touched-set contract | .ai/bin/protocol-scope.cjs | node docs/research/2026-09-23-codex-certification/probes.cjs scope | 0 | HIGH | fixed-and-verified | 1 |
| C05 | RC-owner-source-guessing | Spec section 6 header and producer receipt contract | .ai/bin/protocol-scope.cjs | node docs/research/2026-09-23-codex-certification/probes.cjs scope | 0 | HIGH | fixed-and-verified | 1 |
| C06 | RC-spec-controller-omission | PROTO-DEC-0041 item 1 independence contract | docs/specs/2026-09-23-executable-rulebook-spec.md, .ai/bin/protocol-scope.cjs | node docs/research/2026-09-23-codex-certification/probes.cjs scope | 0 | HIGH | fixed-and-verified | 1 |
| C07 | RC-immutability-boundary | AGENTS section 6 and DEC-0021 immutability contract | validate-protocol.ps1 | powershell -ExecutionPolicy Bypass -File ./validate-protocol.ps1 | 0 | HIGH | fixed-and-verified | 2 |
| C08 | RC-text-as-judgement | PROTO-DEC-0041 item 4 and spec section 1 boundary | docs/specs/2026-09-23-executable-rulebook-spec.md, .ai/bin/protocol-verdict.cjs | node docs/research/2026-09-23-codex-certification/probes.cjs verdict | 0 | MEDIUM | fixed-and-verified | 1 |
| C09 | RC-path-alphabet | PROTO-DEC-0044 item 2 reverse-path-index contract | .ai/bin/protocol-index.cjs | node docs/research/2026-09-23-codex-certification/probes.cjs layers | 0 | MEDIUM | fixed-and-verified | 1 |
| C10 | RC-absolute-diagnostics | Spec section 1 item 3 same-output contract | .ai/bin/protocol-scope.cjs | node docs/research/2026-09-23-codex-certification/probes.cjs boundary | 0 | LOW | fixed-and-verified | 1 |

## Finding Notes and Union Mapping

- C01 (RC-ledger-parse, attempt 1): Unifies Codex C01 with Claude F-S2-01 (dropped rows outside `|...|`), F-S2-03 (exit cell validation against integer or `n/a`), and F-S2-04 disposition vocabulary (`unrunnable` removed from disposition domain). All malformed shapes must exit 2.
- C02 (RC-manifest-schema, attempt 1): Codex C02. Missing, empty, or wrong-type `managed` or `source` keys must fail closed (exit 2).
- C03 (RC-manifest-root-discovery, attempt 1): Codex C03. Manifest discovery must be repository-only without ancestor traversal past repository boundary or nested manifest shadowing; missing manifest exits 2.
- C04 (RC-touched-input-exemption, attempt 1): Codex C04. Scope and forbidden input files must not exempt themselves from the touched set.
- C05 (RC-owner-source-guessing, attempt 1): Codex C05. Producer identity must be derived only from declared repository inputs; no basename fallback, no body/fenced-example scanning, no 40-hex commit SHA as owner.
- C06 (RC-spec-controller-omission, attempt 1): Codex C06. Spec line 167 and `protocol-scope.cjs` line 301 enforce PROTO-DEC-0041 item 1: author, executor, controller, and executing pair are excluded from certifying.
- C07 (RC-immutability-boundary, attempt 2 of 2, LAST): Unifies Codex C07 and Claude F-S2-02. Fixes regex boundary at `\z` without `m`, preserves heading-only termination, strips a single trailing separator only, and detects internal `---` additions/removals, heading alterations, and trailing whitespace tampering.
- C08 (RC-text-as-judgement, attempt 1): Unifies Codex C08 and Claude F-S2-04 reproduction substring rule. Replaces text heuristic with recorded invariant violation rule under PROTO-DEC-0041 item 4, and eliminates substring/filename heuristics that turned valid fixed/refuted findings into BLOCKED.
- C09 (RC-path-alphabet, attempt 1): Codex C09. `boundPaths` in `protocol-index.cjs` accepts Unicode (e.g. Cyrillic) and `+` tokens.
- C10 (RC-absolute-diagnostics, attempt 1): Codex C10. Diagnostics in `protocol-scope.cjs` use repository-relative paths instead of absolute filesystem paths to guarantee identical output across checkout locations.
- Claude F-S2-05 (RC-test-gap): Test coverage gaps are closed by negative test cases for each fixed class across `tests/rulebook.test.cjs` and `tests/validator.test.cjs`.
