# Unified Adversarial Audit Prompt for PKG-2 RUN-RECORD

Mode: ADVISORY
Baseline: 7b6d17a; working tree status: clean at start of implementation
Reviewer: Mistral Medium 3.5, route vibe, effort max, 2026-09-26
Scope: PKG-2 RUN-RECORD - run-record schema, library, CLI, tests, fixtures

## Package Summary

PKG-2 implements A-10: one run-record schema (`run-record/1`), its validating library (`.ai/bin/protocol-runrecord.cjs`), and a session-true telemetry reader. It provides:
- Schema specification in `docs/specs/run-record.schema.md`
- Library with `validateRecord`, `serializeRecord`, `appendRecord`, `readRecords`, `renderUsage`, `collapseSessions`
- CLI with `validate`, `append`, `render`, `sessions` commands
- Comprehensive test suite covering T1-T14
- Fixtures including golden record from real past failure

## Acceptance Criteria Probes

Each probe is an adversarial test designed to verify the corresponding acceptance criterion.

### AC-1: Golden valid record validates and serializes to fixed bytes

**Probe:** Given the golden record built from the r6-claude-final FAILED row (commit 8fca7ae:21), verify:
1. `validateRecord(GOLDEN_RECORD)` returns an empty array
2. `serializeRecord(GOLDEN_RECORD)` produces identical output on repeated calls
3. The serialized bytes match the golden fixture in `tests/fixtures/runrecord/golden.jsonl`
4. The record expresses every field from S1-S3 without invented values

**Verification:** 
- Source: `git show 8fca7ae:docs/research/2026-09-26-ownerideas-revision/USAGE.md:21`
- Fields mapped: runId, slot, frame from row; head, launchSha256, dispatchVersion from fd789ac; timestamps from committer time
- BACKLOG S-1 defect: row was rewritten by run-chain.cjs; schema prevents this by requiring evidence

### AC-2: Negative fixtures for each rule

**Probe:** For each validation rule in S1-S3:
1. Extra key: record with unknown key → error
2. Missing required key: record missing any KEY_ORDER key → error
3. Wrong enum: selection="invalid", state="invalid", etc. → error
4. Wrong type: runId=123, schema=123, etc. → error
5. Key order: keys in wrong order → error
6. Schema version: schema="run-record/2" → error
7. Empty attempts: attempts=[] → error

**Verification:** T2-T8 test each case with specific error messages

### AC-3: DONE with any completion field false is invalid

**Probe:** Create a record with state="DONE" and:
- processEnded=false
- exitCode=null
- outputsPresent=false
- outputsNonEmpty=false
- structuralCheck="fail"
- validator="fail"
- evidence=null
- supervisorDone=false

Each should fail validation with error mentioning PROTO-DEC-0075 item 6.

**Verification:** T9 tests all completion fields; DONE requires all to be valid per 0075 item 6

### AC-4: Budget over-runs are invalid

**Probe:** Create records that violate budget constraints (PROTO-DEC-0075 items 3, 5):
1. Three fresh attempts with routeRole="primary" → error
2. Three fresh attempts for a single substitute → error
3. Seven fresh attempts total → error
4. budget.freshUsed != actual fresh count → error
5. budget.resumes != actual resume count → error

**Verification:** T10a, T10b test constraints; validation enforces limits

### AC-5: tokens.source="none" with number is invalid; end < start is invalid

**Probe:** 
1. Attempt with tokens={source:"none", in:100, out:50} → error
2. Attempt with end timestamp before start → error (BACKLOG S-6 regression)

**Verification:** T11a, T11b enforce these constraints

### AC-6: readRecords names the line of an invalid record

**Probe:** Create a JSON Lines file with:
1. Line 1: valid record
2. Line 2: invalid JSON (unquoted value, missing brace, etc.)

`readRecords` must throw with error message containing "line 2".

**Verification:** T12 tests unparseable line detection

### AC-7: Render of two-record fixture equals golden Markdown

**Probe:** Given two records (one FAILED, one DONE), `renderUsage` must produce:
- Markdown table with headers matching S5
- Separator line with `| --- |` for each column
- One row per record
- Correct values extracted from last attempt
- Wall time calculated from first start to last end

**Verification:** T13 checks table structure and content

### AC-8: sessions on synthetic fixture prints ratio=2.96

**Probe:** Create 77 rows across 26 sessions (mimicking the historical ratio from `docs/research/archive/2026-09-23-routing/INDEX-draft.md:21-22`). `collapseSessions` must return:
- sessions.length = 26
- rows = 77
- ratio = 77/26 = 2.96

**Verification:** T14 reproduces the historical count; PROTO-DEC-0085 item 5

### AC-9: Every CLI stdout line matches pattern

**Probe:** Run each CLI command and verify:
1. `validate`: outputs `VALID line=n runId=id`, `INVALID line=n error="msg"`, `SUMMARY records=N invalid=M`
2. `append`: outputs `APPENDED runId=id`
3. `render`: outputs markdown table or `WROTE path=p`
4. `sessions`: outputs `SESSION ...` rows and `SUMMARY rows=N sessions=M ratio=X.XX`

All lines must match `^[A-Z][A-Z_]*` except render's table output.

**Verification:** T2-T14 implicitly test this; CLI uses A-14 row format

### AC-10: Validator and suite pass on integrated tree

**Probe:** After all PKG-2 files are in place:
1. `node --test tests/runrecord.test.cjs` exits 0
2. `node .ai/bin/protocol-runrecord.cjs validate tests/fixtures/runrecord/golden.jsonl` exits 0
3. `node .ai/bin/protocol-runrecord.cjs sessions` exits 0
4. Validator and test-protocol pass

**Verification:** CI/CD integration; this prompt itself

## Implementation Details

### Files Created/Modified

- `docs/specs/run-record.schema.md` - Schema documentation with all keys, types, enums
- `.ai/bin/protocol-runrecord.cjs` - Library and CLI (36KB, fully specified)
- `tests/runrecord.test.cjs` - Test suite (18KB, T1-T14)
- `tests/fixtures/runrecord/golden.jsonl` - Golden fixture from real failure
- `docs/reviews/2026-09-26-mistral-ownerideas-pkg-2-audit-prompt.md` - This file

### Key Design Decisions

1. **Strict key order**: Keys must appear in KEY_ORDER sequence; serialization enforces this
2. **No unknown keys**: Extra keys make records invalid (prevents schema drift)
3. **Budget constraints enforced**: Maximum attempts validated at record level
4. **DONE state strict**: All completion fields must be valid per PROTO-DEC-0075 item 6
5. **Serial number stabilization**: Attempt n values must be sequential from 1
6. **Slot-runId consistency**: Slot extracted from runId and verified
7. **end >= start**: BACKLOG S-6 regression prevented

### Integration Points

- PKG-3 consumes this library (`appendRecord`, `validateRecord`, `renderUsage`)
- PKG-1 provides bin-output-schema.md for CLI row format (A-14)
- Operator inserts manifest entries at W1 gate (PKG-2 S6)
- Both W1 packages' entries inserted together

## Attack Surface

1. **Schema drift**: New keys, wrong enums, type confusion
2. **Key order bypass**: JSON doesn't enforce order; validation does
3. **Budget limit bypass**: Attempt counting, routeRole tracking
4. **DONE state falsification**: All completion fields must be checked
5. **Token source confusion**: "none" vs actual values
6. **Time inversion**: end before start (historical bug)
7. **Line number reporting**: Off-by-one errors in file parsing
8. **Session collapsing**: Duplicate counting, wrong grouping

## Certification Checklist

- [ ] All 10 acceptance criteria have probes
- [ ] Probes cover positive and negative cases
- [ ] Historical defects (B2, B3, BACKLOG S-1, S-6) are addressed
- [ ] Integration conditions met (W1 gate, manifest entries)
- [ ] No forbidden paths touched
- [ ] File ≤ 150 lines (for certifier review)
- [ ] One probe per AC as required

---

*This audit prompt is part of PKG-2 RUN-RECORD implementation for the ownerideas-revision program, stage 8, edit stream E2 (Mistral).*
