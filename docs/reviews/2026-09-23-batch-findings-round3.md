# Union Findings Ledger: Round 3 Remediation

Date: 2026-09-23
Task: PROTO-DEC-0046 remediation round 2/3
Candidate SHA: 89ce192bf6923d00b0328378be8c4b73fd47234b
Sources: docs/reviews/2026-09-23-claude-batch-certification-round2.md, D:/Colabs-cert/codex2/docs/research/2026-09-23-codex-round2/

| id | root-cause | requirement | paths | reproduction | exit | severity | disposition | attempt |
|---|---|---|---|---|---|---|---|---|
| C07a | RC-immutability-boundary | AGENTS section 6 and DEC-0021 immutability contract | validate-protocol.ps1 | powershell -ExecutionPolicy Bypass -File ./validate-protocol.ps1 | 0 | HIGH | fixed-and-verified | 1 |
| C07b | RC-immutability-boundary | AGENTS section 6 and DEC-0021 immutability contract | validate-protocol.ps1 | powershell -ExecutionPolicy Bypass -File ./validate-protocol.ps1 | 0 | HIGH | fixed-and-verified | 2 |
| C01 | RC-ledger-parse | Spec section 2 malformed-ledger contract | .ai/bin/protocol-verdict.cjs | node docs/research/2026-09-23-codex-certification/probes.cjs verdict | 0 | HIGH | fixed-and-verified | 1 |
| F-R2-01 | RC-ledger-parse | Spec section 2 says a malformed ledger is not a pass; a framed row above the header is dropped and the run reports PASS | .ai/bin/protocol-verdict.cjs | node docs/research/2026-09-23-claude-round2/probes.cjs rowdrop | 0 | HIGH | fixed-and-verified | 2 |
| F-R2-02 | RC-role-prose-substring | Spec section 6 item 3 and PROTO-DEC-0041 item 1; role exclusion is a bare substring over TASK.md prose, excluding designated certifier | .ai/bin/protocol-scope.cjs | node docs/research/2026-09-23-claude-round2/probes.cjs roleprose | 1 | MEDIUM | fixed-and-verified | 1 |
| F-R2-03 | RC-attempt-contiguity | Spec section 4 and PROTO-DEC-0046 item 4; check 2 rejects candidate's own union ledger because its first recorded attempt is 2 | .ai/bin/protocol-verdict.cjs, docs/reviews/2026-09-23-batch-findings.md | node docs/research/2026-09-23-claude-round2/probes.cjs contiguity | 2 | MEDIUM | fixed-and-verified | 1 |
| F-R2-04 | RC-arg-parsing | Spec section 7 says tools read and report; unrecognised CLI flag is accepted in silence | .ai/bin/protocol-scope.cjs | node docs/research/2026-09-23-claude-round2/probes.cjs flags | 0 | LOW | fixed-and-verified | 1 |

## Finding Notes and History

- C07a: Carried history for RC-immutability-boundary attempt 1, referencing round-1 F-S2-02/C07 evidence.
- C07b: Carried history for RC-immutability-boundary attempt 2 from 2026-09-23-batch-findings.md.
- C01: Carried history for RC-ledger-parse attempt 1 from 2026-09-23-batch-findings.md.
- F-R2-01: Round-2 slot-2 finding on RC-ledger-parse attempt 2.
- F-R2-02: Round-2 slot-2 finding on RC-role-prose-substring attempt 1.
- F-R2-03: Round-2 slot-2 finding on RC-attempt-contiguity attempt 1.
- F-R2-04: Round-2 slot-2 finding on RC-arg-parsing attempt 1.
