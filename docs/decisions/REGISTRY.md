# Decision Registry

Append-only ledger of architectural decision statuses, freeze baselines, and reopen triggers.

Rules:
- The current status of any decision ID is determined by its **last** recorded row in this file.
- Existing rows are immutable and must never be edited, reordered, or deleted.
- Status transitions (e.g., accepting, freezing, or reopening a decision) are recorded by appending a new row.
- Status values: `accepted`, `frozen`, `reopened`, `superseded`.
- For `superseded` rows the evidence column names the superseding decision ID.

| id | status | reopen-trigger | frozen-at | supersedes | evidence |
|---|---|---|---|---|---|
| DEC-0001 | accepted | none | | | |
| DEC-0002 | accepted | none | | | |
| DEC-0003 | accepted | none | | | |
| DEC-0004 | accepted | none | | | |
| DEC-0005 | accepted | none | | | |
| DEC-0006 | accepted | none | | | |
| DEC-0007 | accepted | none | | | |
| DEC-0008 | accepted | none | | | |
| DEC-0009 | accepted | none | | DEC-0003, DEC-0005, DEC-0008 | |
| DEC-0010 | accepted | none | | | |
| DEC-0011 | accepted | none | | | |
| DEC-0012 | accepted | none | | | |
| DEC-0013 | accepted | none | | | |
| DEC-0014 | accepted | none | | | |
| DEC-0015 | accepted | none | | | |
| DEC-0016 | accepted | none | | | |
| DEC-0017 | accepted | none | | | |
| DEC-0018 | accepted | none | | | |
| DEC-0019 | accepted | none | | | |
| DEC-0020 | accepted | none | | | |
| DEC-0021 | accepted | none | | | |
| PROTO-DEC-0022 | accepted | none | | DEC-0014 | |
| PROTO-DEC-0023 | accepted | none | | | |
| PROTO-DEC-0024 | accepted | none | | | |
| PROTO-DEC-0025 | accepted | none | | | |
| PROTO-DEC-0026 | accepted | none | | | |
| PROTO-DEC-0027 | accepted | none | | | |
| PROTO-DEC-0028 | accepted | none | | | |
| PROTO-DEC-0029 | accepted | none | | | |
| PROTO-DEC-0030 | accepted | none | | | |
| PROTO-DEC-0031 | accepted | none | | | |
| PROTO-DEC-0032 | accepted | none | | | |
| PROTO-DEC-0033 | accepted | none | | | |
| DEC-0003 | superseded | none | | | PROTO-DEC-0009 |
| DEC-0005 | superseded | none | | | PROTO-DEC-0009 |
| DEC-0008 | superseded | none | | | PROTO-DEC-0009 |
| DEC-0014 | superseded | none | | | PROTO-DEC-0022 |
| PROTO-DEC-0034 | accepted | none | | | |
| PROTO-DEC-0035 | accepted | none | | | |
| PROTO-DEC-0036 | accepted | owner-directive | | | |
| PROTO-DEC-0037 | accepted | owner-directive | | | |
| PROTO-DEC-0038 | accepted | owner-directive | | PROTO-DEC-0027 | |
| PROTO-DEC-0039 | accepted | owner-directive | | | |
| PROTO-DEC-0039 | reopened | owner-directive | d38d2f2ae4b4c17fe6c2c18f11215cedb2f10eb1 | | 2026-09-20 RuslanFomenko accepted the paired-cycle audit and directed remediation; PROTO-DEC-0040 |
| PROTO-DEC-0040 | accepted | owner-directive | | PROTO-DEC-0039 (items 1 and 2f; bounded exception only) | .ai/DECISIONS.md; docs/reviews/2026-09-20-codex-paired-cycle-review.md; docs/reviews/2026-09-20-deepseek-gemini-paired-cycle-remediation-prompt.md |
| PROTO-DEC-0039 | accepted | owner-directive | d38d2f2ae4b4c17fe6c2c18f11215cedb2f10eb1 | | Freeze continues with the finite PROTO-DEC-0040 exception; product pilot and post-pilot restrictions unchanged |
| PROTO-DEC-0041 | accepted | owner-directive | d38d2f2ae4b4c17fe6c2c18f11215cedb2f10eb1 | refines PROTO-DEC-0038 item 1 (no supersession) | .ai/DECISIONS.md; docs/research/2026-09-20-cycle-architecture/claude-final-decision.md; docs/reviews/2026-09-20-deepseek-gemini-cycle-architecture-dispatch.md |
| PROTO-DEC-0042 | accepted | owner-directive | d38d2f2ae4b4c17fe6c2c18f11215cedb2f10eb1 | refines PROTO-DEC-0040 item 4 (no supersession) | Receipt freshness bound to the attested task; measured 2026-09-22: producer/controller exit 0, certifiers exit 1 by closure order; cycle-architecture criterion met, product pilots unblocked |
| PROTO-DEC-0043 | accepted | owner-directive | d38d2f2ae4b4c17fe6c2c18f11215cedb2f10eb1 | | Terminal agent-to-agent invocation contract .ai/docs/CLI-AGENTS.md added to managed; roster verified by execution; DeepSeek terminal path measured impossible (context budget); bounded exception to PROTO-DEC-0039 item 1 |
| PROTO-DEC-0044 | accepted | owner-directive | d38d2f2ae4b4c17fe6c2c18f11215cedb2f10eb1 | | Layers A/B/C: session-start inventory, derived decisions index, coverage and duplicate ledger; all advisory under PROTO-DEC-0034 item 1; bounded exception to PROTO-DEC-0039 item 1; validator 0 warnings, suite 315/315 |
