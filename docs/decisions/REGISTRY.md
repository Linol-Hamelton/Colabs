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
