# Signals Ledger Specification

Mode: ADVISORY (a specification, not a decision). Author: mistral-dbafced31ad20a45 (PKG-5 executor, E2).
Parent program: ownerideas-revision, stage 8, wave W3.

## Overview

This document specifies the grammar for the signals ledger file `.ai/SIGNALS.md`, which implements PROTO-DEC-0051 items 1-3, 5.

## Line Grammar (`signals/1`)

One signal state per line, fields separated by exactly ` | `, LF-terminated, no trailing space:

```
Signal: <id> | <type> | <date> | <participant> | <evidence> | <cost> | <disposition> | rc=<rc> | batch=<batch> | src=<src>
```

### Field Definitions

| Field | BNF | Description |
|---|---|---|
| id | `"sig-" YYYYMMDD "-" DDD` (DDD = 001..999) | Unique signal identifier |
| type | `"procedure-gap"` \| `"script-candidate"` \| `"fall"` | Signal classification |
| date | `YYYY-MM-DD` | Real calendar date |
| participant | `[A-Za-z0-9._:/@-]{1,80}` | Who raised or owns the signal |
| evidence | decision \| sigref \| relpath `[":" N ["-" N]] ["#" anchor]` | Source of the signal |
| cost | `"unknown"` \| item `{ "," item }` | Cost accounting |
| disposition | `"open"` \| `"grouped:G-" N` \| `"procedure:" recid` \| `"script:" relpath` \| `"kept-by-assistant:" ("1"\|"2"\|"3"\|"4")` \| `"rejected:" token` \| `"closed:" evidence` | Current status |
| rc | `"-"` \| `[a-z0-9-]{1,40}` | Root cause identifier |
| batch | `"-"` \| `[A-Za-z0-9._-]{1,40}` | Planning batch identifier |
| src | `"-"` \| 64 lowercase hex characters | SHA-256 of imported interim line |

### Sub-productions

- **decision**: `"PROTO-DEC-" DDDD` or `"DEC-" DDDD`
- **sigref**: id (another signal)
- **relpath**: `[A-Za-z0-9._/-]{1,200}`, not starting with `"/"`, no `".."` segment, no `":"` drive
- **anchor**: `[A-Za-z0-9._:-]{1,80}`
- **item**: `(="attempts"\|"minutes"\|"owner") "=" N`
- **token**: `[A-Za-z0-9._:/#-]{1,80}`
- **recid**: record id per `procedure.schema.md` section 2 (e.g., P-L2-006, S-001)

### Rules

1. **Last line wins**: A later line with the same id is the new state of that signal.
2. **Immutable fields**: `type`, `date`, `participant`, `evidence` and `src` must equal those of the id's first line. A difference is an invalid line.
3. **kept-by-assistant:<n>** names the unmet condition of section 1 of `docs/specs/2026-09-23-executable-rulebook-spec.md` (PROTO-DEC-0051 item 3).

## File Structure

The file `.ai/SIGNALS.md` contains:

1. Header line 1: `# Signals ledger`
2. Header line 2: empty line
3. Header line 3: `Append-only. Written only by \`node .ai/bin/protocol-signals.cjs\`. Grammar: \`docs/specs/signals-ledger.md\`.`
4. Header line 4: empty line
5. Zero or more signal lines, each conforming to the grammar above

Every line is LF-terminated. Nothing is ever deleted or rewritten (PROTO-DEC-0051 item 1). Each write is one `fs.appendFileSync` of whole lines.

## Validation

A signal line is invalid if:
- It does not match the line grammar
- Any field exceeds its maximum length
- The date is not a valid ISO date
- The id does not match the pattern
- For lines after the first with a given id: type, date, participant, evidence, or src differ from the first
- The disposition is not one of the allowed values
- Any field contains characters outside its allowed set

A file is invalid if any of its signal lines is invalid.
