# PKG-2 RUN-RECORD - one run-record schema, its library, and a session-true telemetry reader

Mode: ADVISORY (a package prompt, not a decision). Author: `claude-b68b3491ee12ebd9` (stage 5-6
resolver), 2026-09-26. Resolution: `../FINAL-RESOLUTION-CLAUDE.md`. The executor implements this
file; it does not redesign it.

## ID

`PKG-2` (program `ownerideas-revision`, stage 8). Item: A-10, including the read-side fix of the
2.96x Stop-telemetry over-count.

## Goal

Fix one schema for the record of a dispatched step, with the decided fields and no invented ones,
and ship a library and CLI that validate, append, read and render those records. Also add a reader
that counts Stop telemetry per session instead of per Stop event.

## Scope

In scope:
- the schema spec `docs/specs/run-record.schema.md`;
- `.ai/bin/protocol-runrecord.cjs` (library and CLI);
- tests with a golden corpus;
- the `sessions` reader.

Out of scope:
- writing real records from a dispatcher (PKG-3);
- any quality or outcome field (these wait for run records and a later EXPERIMENT: PROTO-DEC-0084
  item 3; FRAMES D-03);
- any change to the Stop hook or `protocol-hooks.cjs` (the writer stays as it is);
- creating `docs/ops/RUNS.jsonl` (PKG-3 creates it with its first real record).

## Stream and wave

E2, wave W1. It runs concurrently with PKG-1 (E1), and the files are disjoint. No W1 executor
edits `protocol-manifest.json`: the operator inserts both packages' entries at the W1 gate (S6).

## Inputs

- Decisions: PROTO-DEC-0075 items 2-4, 6, 7, 9-11 (fields and states); 0078 item 5 (the model that
  actually ran); 0084 item 9 (`selection = owner`, never evidence about the resolver); 0047 items 8
  (script standard) and 9 (logs record the value actually used); 0049 item 2 (exit 2); 0051 item 4
  (FALLEN); 0079 item 1(2).
- `docs/core-arch/stage-4/workflowAI.md` section 1 step 6 (what a resolution records).
- `docs/research/2026-09-26-ownerideas-revision/USAGE.md`: today's usage table, written by
  `run-chain.cjs`, which your render replaces for new runs.
- `.ai/bin/protocol-hooks.cjs:603-641`: the Stop telemetry row and `recordSessionMetric`. Read only.
- The over-count figure, quoted here so you need no archived file: 77 Stop rows over 26 sessions =
  2.96x (provenance only: `docs/research/archive/2026-09-23-routing/INDEX-draft.md:21-22`;
  PROTO-DEC-0085 item 5).
- `docs/ops/BACKLOG.md` S-1 and S-6 (usage defects this schema must make impossible).
- `tests/helpers.cjs`; `tests/manifest.test.cjs:68-72`; `protocol-manifest.json`.

## Allowed paths

Create:
- `docs/specs/run-record.schema.md`
- `.ai/bin/protocol-runrecord.cjs`
- `tests/runrecord.test.cjs`
- `tests/fixtures/runrecord/` (non-`.cjs` fixture files only)
- `docs/reviews/2026-09-2?-<your-agent>-ownerideas-pkg-2-audit-prompt.md` (one file)

Change:
- your own journal.

`protocol-manifest.json` is not an Allowed path for this package (S6).

## Forbidden paths

Everything not listed above, including:
- `.ai/bin/protocol-hooks.cjs`, `.ai/bin/protocol.cjs` and every other existing script;
  `.claude/`, `.codex/`;
- PKG-1's files: `.ai/bin/protocol-dispatch.cjs`, `.ai/docs/clients.json`, `.ai/docs/CLI-AGENTS.md`,
  `docs/specs/bin-output-schema.md`, `tests/dispatch*.cjs`;
- `docs/ops/`, including `RUNS.jsonl`; every `USAGE.md`; the shared documents of AGENTS.md
  section 6; `docs/research/FRAMES.md`; `OwnerIdeas/`; another session's journal.

No commit, tag, push or branch.

## Dependencies

- Starts after stage 7 passes. There is no package dependency.
- PKG-3 consumes this library (`appendRecord`, `validateRecord`, `renderUsage`). Keep those names
  and signatures.
- A-14: the CLI follows `docs/specs/bin-output-schema.md` from PKG-1. It lands in the same wave. If
  that file is not yet present when you start, follow the rule text quoted in S5 below, which is
  the same.

## Required outputs

1. `docs/specs/run-record.schema.md`, stating S1-S3 exactly.
2. `.ai/bin/protocol-runrecord.cjs` meeting S4-S5.
3. `tests/runrecord.test.cjs` covering T1-T14, with fixtures.
4. The three `protocol-manifest.json` entries of S6, listed in your journal entry for the operator
   (you do not edit the manifest).
5. The audit-prompt file: at most 150 lines, one probe per acceptance criterion.
6. A five-label journal entry with a full `record` Evidence block.

## Specification (binding)

### S1 Record, one JSON object per line, schema `run-record/1`

The keys, in this order. The library serialises in this order, so the same record always gives the
same bytes. An unknown key is invalid.

| Key | Type and rule | Source |
|---|---|---|
| `schema` | `"run-record/1"` | - |
| `runId` | `R-<YYYYMMDDTHHMMSSZ>-<slot>`, where slot matches `[A-Za-z0-9._-]{1,64}` | - |
| `frame` | a non-empty string (task frame or scope id) | 0057 item 1 |
| `slot` | a string matching the slot part of `runId` | - |
| `role` | string or null (null until the dispatch file names roles) | 0074 item 2 |
| `selection` | `"owner"` or `"resolver"` | 0084 item 9 |
| `resolution` | the object of S2 | 0075 item 10; workflowAI 1.6 |
| `pins` | `{head: 40-hex, launchFile: path, launchSha256: 64-hex, roleSha256: 64-hex or null, corpusHash: 64-hex or null, dispatchVersion: string}` | 0075 item 7 |
| `attempts` | an array of at least one S3 attempt, in time order | 0075 items 2-3 |
| `budget` | `{freshUsed: int, resumes: int, stallMin: int, hardMin: int}` | 0075 items 3, 5 |
| `cost` | `{estimated: number or null, actual: number or null, cumulative: number or null, unit: "USD" or "credits" or "tokens" or null}`; `unit` is required when any number is present | 0075 item 9 |
| `completion` | `{processEnded: bool, exitCode: int or null, outputsPresent: bool, outputsNonEmpty: bool, structuralCheck: "pass" or "fail" or "none", validator: "pass" or "fail" or "n/a", evidence: path or null, supervisorDone: bool}` | 0075 item 6 |
| `state` | `"DONE"`, `"BLOCKED"` or `"FAILED"` (a record is written when a step settles) | 0075 item 11 |
| `fallen` | bool; true only with `state = "FAILED"` and the last attempt class `STALL` | 0051 item 4 |
| `transitions` | an array of `{from, to, at: ISO-8601 UTC, reason: non-empty string}`, where `from` and `to` are among the eleven states of 0075 item 11 | 0075 item 11 |
| `outputs` | an array of repository-relative paths | - |

### S2 `resolution`

`{ladderSnapshot: "YYYY-MM-DD" or null, primary: route, substitutes: [route], excluded: [{rung: string, reason: string}], skipped: [{rung: string, reason: string}], unverified: [{rung: string, constraint: string}], approval: string or null, shortfall: string or null}`

- A route is `{client: string, model: string, effort: string or null}`.
- With `selection = "resolver"`, `ladderSnapshot` is not null.
- With `selection = "owner"`, `excluded`, `skipped` and `unverified` are empty arrays.
- `unverified` lists hard constraints that could not be checked because the data is missing. They
  are recorded, never assumed met in silence (PROTO-DEC-0075 item 8).

### S3 Attempt

`{n: int >= 1, kind: "fresh" or "resume", reason, routeRole: "primary" or "substitute-1" or "substitute-2", route, effortUsed: string or null, modelRan: {id: string or null, source: "client-output" or "requested" or "unknown"}, sessionId: string or null, start: ISO, end: ISO or null, exitCode: int or null, class, tokens: {in: int or null, out: int or null, source: "client-output" or "none"}, usage: {amount: number or null, unit: "USD" or "credits" or "tokens" or null}}`

- `reason` is one of: `first`, `transient-retry`, `resume`, `route-change`, `model-change`,
  `repair`, `quality-escalation` (0075 item 2).
- `class` is `NONE`, one of the fifteen names of PROTO-DEC-0075 item 4, or `UNCLASSIFIED`.
  `UNCLASSIFIED` is a failure whose cause the supervisor could not read. It is allowed only on an
  attempt that is not the last of a DONE record: the cause is recorded as unknown, never guessed
  (PROTO-DEC-0049 item 2).
- `tokens.source = "none"` requires `in = out = null`. A token count is never estimated (P-7: "a
  correct token count").
- `end >= start`. A negative duration is invalid (BACKLOG S-6).
- Budget checks (0075 item 3):
  - fresh attempts with `routeRole = primary`: at most 2;
  - fresh attempts per substitute: at most 2;
  - all fresh attempts: at most 6 (the first launch plus five);
  - `budget.freshUsed` equals the count of fresh attempts, and `budget.resumes` the count of
    resumes.
- Completion (0075 item 6): `state = "DONE"` requires `processEnded`, `exitCode` not null,
  `outputsPresent`, `outputsNonEmpty`, `structuralCheck = "pass"`, `validator` not `"fail"`,
  `evidence` not null and `supervisorDone`. Otherwise the record is invalid.

### S4 Library (`module.exports`)

- `validateRecord(obj) -> string[]`: an empty array means valid. Each message is
  `<json-path>: <rule>`.
- `serializeRecord(obj) -> string`: one line, key order of S1-S3, no spaces, `\n` appended.
- `appendRecord(file, obj)`: validates first and throws on any error. Then one
  `fs.appendFileSync` of one line, creating the parent directory if needed.
- `readRecords(file) -> obj[]`: strict. It throws on an unparseable or invalid line and names the
  line number.
- `renderUsage(records, {frame}) -> string`: a Markdown table.
  - Columns: `Run | Slot | Selection | Client | Model ran | Effort used | Fresh/Resume | Wall min | Tokens in/out | Cost | State`.
  - One row per record. The client is the last attempt's route client.
  - Wall min is first start to last end, rounded to whole minutes; blank when `end` is null.
  - Blank figures are written `-`.
- `collapseSessions(rows) -> {sessions: [{session, agent, stops, lastTs, changedFiles, handoffComplete}], rows: int}`.
  - Group by `session`; a null `session` groups under `unknown`.
  - `stops` is the row count of the group.
  - The other fields come from the group's row with the latest `ts`.
  - `changedFiles` is the maximum over the group.

### S5 CLI (A-14 rule: rows `TOKEN key=value`; exits 0 ok, 1 refusal, 2 unknown or malformed)

| Command | Output rows | Exit |
|---|---|---|
| `validate <file.jsonl>` | `VALID line=<n> runId=<id>` or `INVALID line=<n> error="<msg>"`, one per problem; then `SUMMARY records=<n> invalid=<m>` | 0 if m = 0; 2 otherwise |
| `append <file.jsonl> <record.json>` | `APPENDED runId=<id>` | 0; 2 if invalid |
| `render <file.jsonl> [--frame <id>] [--out <path.md>]` | the table to stdout, or `WROTE path=<p>` | 0; 2 on any invalid line |
| `sessions [--dir <metrics-dir>]` | one `SESSION ...` row per session, then `SUMMARY rows=<n> sessions=<m> ratio=<n/m to 2 decimals>` | 0; 2 on an unparseable line |
| no command, or unknown | `USAGE ...` or `ERROR reason=...` | 2 |

`sessions` reads `sessions.1.jsonl` and then `sessions.jsonl` from `--dir`. The default directory
is `.ai/runtime/metrics/` under the repository root. It never writes.

### S6 `protocol-manifest.json`

One writer (stage-7 fix B3). In W1 the operator is the only writer of this file, at the W1 gate
(resolution section 6); neither W1 executor edits it. This package's entries, exactly:
- into `source`: `.ai/bin/protocol-runrecord.cjs`, `docs/specs/run-record.schema.md`;
- into `tests`, in alphabetical order: `tests/runrecord.test.cjs`.

Until the gate inserts them, `tests/manifest.test.cjs` ("every protocol test file is listed in the
manifest") fails, naming only the new W1 test files of PKG-1 and PKG-2. That one failure is
expected before the gate: it is not a STOP 4 red and not a defect of this package. Report it with
the exit code; any other failure counts.

## Acceptance criteria

| # | Criterion | Check |
|---|---|---|
| AC-1 | A golden valid record (one fresh attempt, DONE, every completion field true) validates, and serialises to fixed bytes (the golden file) | T1 |
| AC-2 | Each rule of S1-S3 has a negative fixture that fails with the named path. Silent pass-through is tested: an extra key, a missing key, a wrong enum, a wrong type (PROTO-DEC-0047 item 8) | T2-T8 |
| AC-3 | DONE with any completion field false is invalid | T9 |
| AC-4 | Budget over-runs are invalid: a third primary fresh attempt, a third fresh attempt on one substitute, a seventh fresh attempt | T10 |
| AC-5 | `tokens.source = "none"` with a number is invalid; `end < start` is invalid (BACKLOG S-6 regression) | T11 |
| AC-6 | `readRecords` names the line of an invalid record; `appendRecord` writes nothing on an invalid record | T12 |
| AC-7 | The render of a two-record fixture equals the golden Markdown | T13 |
| AC-8 | `sessions` on a synthetic fixture of 77 rows over 26 sessions prints `SUMMARY rows=77 sessions=26 ratio=2.96` and 26 `SESSION` rows | T14 |
| AC-9 | Every CLI stdout line in the tests matches `^[A-Z][A-Z_]*( |$)`, apart from `render`'s table; exits follow S5 | T2-T14 |
| AC-10 | The validator and the full suite pass on the integrated tree | C |

The golden corpus holds at least one fixture built from a real past failure: the
`r6-claude-final` FAILED row as committed at `8fca7ae`, read with
`git show 8fca7ae:docs/research/2026-09-26-ownerideas-revision/USAGE.md` (line 21:
`| r6-claude-final | claude | claude-opus-5-5 | high | 0 | 0 | 0.00 | 0/0 | 0.00 | 0 | 1 | FAILED |`).
The live file now shows that slot DONE: `run-chain.cjs` rewrote the row with the later attempt,
which is the BACKLOG S-1 defect this schema removes. Cite the row only by that commit, never by the
live file. Build it by hand as a FAILED record with two fresh primary attempts. Where the row gives
no value, use null, `UNCLASSIFIED` or `"none"`. The fields the schema requires but the row lacks
take these values, each from git, from DISPATCH.json at `fd789ac`, or from a stated default:
- `head` = `fd789ac` in full (the commit that added the slot to DISPATCH.json); `launchSha256` =
  the sha256 of `launchFile` = `docs/research/2026-09-26-ownerideas-revision/prompts/run/r6-claude-final.md`
  at that commit; `roleSha256` and `corpusHash`
  null; `dispatchVersion` = `"git:fd789ac"` (that DISPATCH.json has no `version` key);
- `frame` and `outputs` from that slot (`task:ownerideas-r6-claude-final`; its `out` path);
- the `runId` time and both attempts' `start` = the committer time of `fd789ac` in UTC,
  `2026-09-26T12:39:40Z` (the row records no time); both `end` = null;
- route from the row (`claude`, `claude-opus-5-5`, `high`); `selection = "owner"`; `modelRan`
  `{id: "claude-opus-5-5", source: "requested"}`; attempt reasons `first`, then `transient-retry`
  (the row's one retry); `transitions` = `[]`;
- `budget` = `{freshUsed: 2, resumes: 0, stallMin: 60, hardMin: 120}` (`stallMin` from that
  DISPATCH.json; `hardMin` is the PKG-1 S3 default for a file without the key);
- `completion`: every boolean false, `exitCode` null, `structuralCheck: "none"`,
  `validator: "n/a"`, `evidence` null.

It must validate. The test that loads the fixture carries a comment naming its source row and
commit. JSON Lines hold no comments.

## Validation commands

```
node --test tests/runrecord.test.cjs
node .ai/bin/protocol-runrecord.cjs validate tests/fixtures/runrecord/golden.jsonl
node .ai/bin/protocol-runrecord.cjs sessions
powershell -ExecutionPolicy Bypass -File .\validate-protocol.ps1
powershell -ExecutionPolicy Bypass -File .\test-protocol.ps1
node .ai/bin/protocol-handoff.cjs record --owner <your owner name>
```

`sessions` on the live `.ai/runtime/metrics/` prints the current ratio. Record it in your journal
as a measurement; it is not an acceptance number.

## Integration conditions

- The W1 gate, as for PKG-1: with both streams at rest, the operator first inserts the W1 manifest
  entries of PKG-1 S11 and PKG-2 S6 in one edit and confirms each of the eight is present exactly
  once; then runs the validator, the suite and each full `record` in turn, then commits PKG-2
  path-scoped.
- PKG-3 may start only after this package is committed.

## Risk class and certification route

- **High** (PROTO-DEC-0038 item 1): a new `.ai/bin` script whose records feed the resolver (0075
  item 9).
- Two parallel independent certifiers: Kimi K2.7 Code HighSpeed and MiMo-V2.6-Flash (PROTO-DEC-0086
  item 1). They use output 5 on the frozen candidate after stage 12.
- The executor, Claude and DeepSeek certify nothing here.

## Artifact plan

| Path | Action | Disposition at program closure |
|---|---|---|
| `docs/specs/run-record.schema.md` | created | KEEP_ACTIVE (canonical schema) |
| `.ai/bin/protocol-runrecord.cjs` | created | KEEP_ACTIVE |
| `tests/runrecord.test.cjs`, `tests/fixtures/runrecord/*` | created | KEEP_ACTIVE |
| `protocol-manifest.json` | changed (entries, by the operator at the W1 gate; S6) | KEEP_ACTIVE |
| audit-prompt file under `docs/reviews/` | created | KEEP_ACTIVE (immutable review record) |
| usage tables written by `run-chain.cjs` (`USAGE.md` files) | superseded for new runs by `render`; not edited | stay with their frames (their closures decide) |

## Executor requirements

| Dimension | Level | Why |
|---|---|---|
| D-IMPL | MEDIUM | a validator and serialiser of about 400 lines, fully specified |
| D-ARCH | LOW | the schema is fixed here |
| D-REV | LOW | |
| D-TERM | LOW | |
| D-ALGO | LOW | |
| D-EDIT | MEDIUM | exact key order and enums |
| D-DOC | MEDIUM | the spec file |
| D-CRIT | MEDIUM | negative fixtures that really exercise every rule |
| D-SYN | LOW | |

Minimum tier: **T7** (PROTO-DEC-0059 item 2, kernel change; 0072 item 3). The owner named E2 =
Mistral Medium 3.5 max (0086 item 2), which fills T1-T9 of its provider (`MODEL-MATRIX.md:132`).

## STOP conditions

Block, record a finding and a `Signal:` line, and do not decide, when:
1. A field a decision requires (S1-S3 sources) cannot be expressed in the schema as written, or
   two sources give it different meanings.
2. You feel the need for a field that is not in S1-S3, for example quality, rating or confidence.
   Do not add it; it is a finding (PROTO-DEC-0084 item 3).
3. A real past row (the golden corpus) cannot be expressed as a valid record without inventing a
   value.
4. The suite is red before your first edit.
5. Any edit outside Allowed paths would be needed, including the Stop hook.
6. You find a new idea or an unresolved design question. It becomes a finding (a candidate, cap 5,
   or a question to the owner).

## Evidence and closing steps

1. Start your own session: `node .ai/bin/protocol-session.cjs start --agent <name>`.
   - Line 1: `Launch: model=<id> effort=<value|unknown> client=<client>`.
   - Line 2: `Orientation: <model> @ task:ownerideas-pkg-2 (parent program:ownerideas-revision):
     executor E2 | success=PKG-2 AC-1..AC-10`.
2. Write a checkpoint line after each of S1-S6.
3. At the end: `git diff`, then a five-label entry listing each AC and the measured live
   `sessions` ratio.
4. Run `record --owner <owner>` (full) and report the exit codes.
5. Last chat message: a short report to the owner in Russian.
