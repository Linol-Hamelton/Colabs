# DIG registry audit - cover and dup checks (operator, 2026-09-28)

Mandated by the wave-3 chain (PACKET-1 amendments): `protocol-ledger.cjs cover` and `dup` are run
by the operator over the producers' outputs after all three finish. The tool output is advisory
(PROTO-DEC-0034 item 1) - it reports, it does not decide.

## Producer files and counts

| Producer | Range | Rows | Built | Partial | Not built |
|---|---|---:|---:|---:|---:|
| Mistral Medium 3.5 (vibe) | PROTO-DEC-0022..0047 | 129 | 118 | 11 | 0 |
| Gemini 3.8 Flash high (agy) | PROTO-DEC-0048..0067 | 91 | 87 | 3 | 1 |
| DeepSeek Flash (kilo) | PROTO-DEC-0068..0086 + A-1..A-14 | 111 | 87 | 15 | 9 |

Totals: 331 rows, 292 built, 29 partial, 10 not built.

## cover

The tool's record convention mirrors a corpus unit path with a suffix (`record = records/<unit><suffix>`).
The audit's units are the three producer files themselves; run over a mirror corpus
(`.ai/runtime/cover-check/units/<name>` without extension, records in `cover-check/records/<name>.md`):

    .ai/runtime/coverage-ledger.md: units 3, without record 0, unexpected 0

A direct run over the drafts directory (corpus = the .md files themselves, which the mirror
convention cannot express because the units would need their own extension appended) reports:

    .ai/runtime/coverage-ledger.md: units 4, without record 4, unexpected 5

That second number is the known convention mismatch, not an omission: row-level coverage of the
decision ranges is asserted by each producer file's own counts (the table above) and is what the
GPT-5.6 Sol verifier samples (20% + every "not built" row). Nothing here is Evidence.

## dup

Cross-producer byte comparison (each producer's file isolated in its own directory):

    .ai/runtime/duplicate-report.md: across 0, within 0

No producer's output is a byte-identical copy of another's.
