# PKG-3 DISPATCH - resolver v0, then the execution supervisor, inside the kernel dispatcher

Mode: ADVISORY (a package prompt, not a decision). Author: `claude-b68b3491ee12ebd9` (stage 5-6
resolver), 2026-09-26. Resolution: `../FINAL-RESOLUTION-CLAUDE.md`. The executor implements this
file; it does not redesign it.

## ID

`PKG-3` (program `ownerideas-revision`, stage 8). Item: A-3, in two milestones in this order:
- **M1** resolver v0 (PROTO-DEC-0079 item 1(3), item 2);
- **M2** the supervisor, watchdog, launch pinning, completion contract and hard-constraint filter
  (PROTO-DEC-0075; 0051 item 4; P-6 data).

## Goal

- **M1.** The dispatcher chooses the executor of a slot mechanically. Hard constraints come first,
  then the PROTO-DEC-0059 floor, then the cheapest live rung of the owner's ladder. It picks a
  primary and two substitutes, records every exclusion, and never picks against an owner
  assignment.
- **M2.** The dispatcher recovers only mechanically, by failure class and within the decided
  budget. It resumes first after useful work, wakes a stalled session at most three times, pins
  its inputs, and calls a step DONE only under the completion contract. Every settled step becomes
  a run record.

## Scope

In scope:
- extend `.ai/bin/protocol-dispatch.cjs` (from PKG-1);
- create `docs/ops/model-ladder.json`;
- create the two message files `.ai/docs/dispatch/wake.md` and `.ai/docs/dispatch/repair.md`;
- write run records through PKG-2's library to `docs/ops/RUNS.jsonl`;
- tests;
- the resolver and supervisor text in `.ai/docs/CLI-AGENTS.md` section 9.

Out of scope, never implemented here:
- A-1 enforcement (it waits for the design block, OQ-2);
- A-11 redaction (OQ-1);
- money budgets and cost estimates: `budget` stays unsupported in v0 (S1);
- semantic judgement (PROTO-DEC-0078 item 1);
- the resolver metric and the cost-versus-latency tie-break (owner-open);
- any change to `.ai/docs/clients.json` (PKG-1 owns it);
- reading F-02 outputs (Appendix A item 4).

## Stream and wave

E1, wave W2. It runs concurrently with PKG-4 (E2), whose files are disjoint.

## Inputs

- Decisions:
  - PROTO-DEC-0074 items 2-5; 0075 items 1-14 (read the whole block); 0076 items 1, 3; 0078 items
    1-4; 0079 items 1-2; 0084 item 9;
  - 0051 item 4; 0049 item 3; 0059 items 1-2; 0086 item 5 (tiers are provider-relative);
  - 0073 items 2-3 (no prompt text in scripts).
- `docs/core-arch/OWNER-DECISION-execution-model-2026-09-25.md` sections 1-13, lines 55-305. This
  is the owner's authority for the per-class behaviour. Where it and 0075 differ, the owner text
  wins (0075 Context).
- `docs/core-arch/stage-4/workflowAI.md` section 1, steps 4-6.
- `docs/ops/MODEL-ECONOMICS.md` lines 13-44: the ladder, with its rung table and exclusions.
- `docs/core-arch/stage-4/MODEL-MATRIX.md` lines 112-168: effort scales, the tier table and the
  flagship routes.
- PKG-1's script, registry and `docs/specs/bin-output-schema.md`; PKG-2's
  `docs/specs/run-record.schema.md` and library.
- `docs/ops/BACKLOG.md` M-4, S-5.

## Allowed paths

Create:
- `docs/ops/model-ladder.json`
- `.ai/docs/dispatch/wake.md`
- `.ai/docs/dispatch/repair.md`
- `tests/resolver.test.cjs`
- `tests/fixtures/resolver/` (non-`.cjs` files only)
- `docs/reviews/2026-09-2?-<your-agent>-ownerideas-pkg-3-audit-prompt.md` (one file)

Change:
- `.ai/bin/protocol-dispatch.cjs`
- `tests/dispatch.test.cjs`
- `tests/dispatch-fake-client.cjs` (new failure modes and resume)
- `.ai/docs/CLI-AGENTS.md` section 9 only
- `protocol-manifest.json` (insert entries only, S9)
- your own journal

`docs/ops/RUNS.jsonl` is written only by the dispatcher at run time, never by hand. Tests write to
temporary directories.

## Forbidden paths

- `.ai/docs/clients.json`; `docs/ops/MODEL-ECONOMICS.md`; `docs/core-arch/**`;
  `docs/ops/model-evidence/`; F-02 files (`docs/research/2026-09-26-model-layer/`);
- PKG-2's files (use its library, do not edit it); PKG-4's files: `docs/core-arch/**`;
- the old runners; hooks; the validator; the shared documents of AGENTS.md section 6; FRAMES.md;
  `OwnerIdeas/`; another session's journal.

No commit, tag, push or branch.

## Dependencies

- PKG-1 and PKG-2 are committed (the W1 gate passed).
- M2 starts only after M1's tests pass and a journal checkpoint records it.

## Required outputs

1. M1: `resolve` and the resolver path in `run` (S1-S4); `docs/ops/model-ladder.json` (S2);
   `tests/resolver.test.cjs`.
2. M2: the supervisor (S5-S8), the two message files, and the extended `tests/dispatch.test.cjs`.
3. CLI-AGENTS section 9 additions (S10); manifest entries (S9).
4. The audit-prompt file: at most 150 lines, one probe per acceptance criterion.
5. A five-label journal entry with a full `record` Evidence block.

## Specification (binding)

### S1 Dispatch-file keys added (per slot)

| Key | Rule |
|---|---|
| `role` | a string. Required when the slot has no `route` |
| `floor` | `"T1"`..`"T9"`. Required when the slot has no `route` |
| `constraints` | `{contextMin: int}` only. Any other constraint key exits 2, "not supported in v0": fail closed, never ignored |
| `independence` | `{excludeModels: [], excludeFamilies: [], excludeProviders: []}`, all optional |
| `substitutes` | an integer 0-2, default 2 (0075 item 10) |
| `stageKind` | `"kernel"`, `"certification"` or `"other"`, default `"other"` (0078 item 3) |
| `long` | a boolean, default `true` (0078 item 4: a task without a declaration counts as long) |
| `approval` | a string or null: the owner's recorded approval for an approval-gated rung (0076 item 1) |
| `validate` | an argv array or null: the slot's specialised validator, run in the checkout after copy-back; exit 0 = pass |
| `budget` | exits 2, "not supported in v0" (estimates do not exist yet; the resolver metric is owner-open) |

A slot with `route` is `selection = "owner"` (0084 item 9). The resolver does not run for it. Its
`fallback` routes, at most two, are the owner's substitutes.

### S2 `docs/ops/model-ladder.json` (the ladder as data)

```
{ "schema": "ladder/1",
  "source": { "path": "docs/ops/MODEL-ECONOMICS.md", "heading": "<the exact heading line of the ladder section>",
              "sectionSha256": "<sha256 of the section: from its heading line up to the line before the next '## ' line, LF-normalised>",
              "snapshot": "2026-09-25" },
  "matrix": { "path": "docs/core-arch/stage-4/MODEL-MATRIX.md", "lines": "126-135" },
  "rungs": [ { "rung": <int>, "order": <int, position in the snapshot text>, "label": "<as written>",
               "client": "<registry client>" | null, "model": "<id>" | null, "effort": "<value>" | null,
               "provider": "<maker>", "family": "<model family>",
               "tiers": [<ints from the tier table cell(s) that name this model/effort>],
               "approval": "none" | "owner-long-task",
               "contextWindow": <int> | null, "contextSource": "<path:line or URL with date>" | null } ] }
```

Transcription rules. Nothing comes from memory:
- One entry per rung of the rung table (`MODEL-ECONOMICS.md:28-40`), in table order. A group
  keeps one `rung` number, and `order` preserves the written order (0078 item 2).
- `client` is the CLI the route column names (`claude`, `codex`, `agy`, `vibe`, `kilo`).
- `model` is the id the route column names, for example `claude-opus-5-5` or
  `gemini-3.8-flash-high`. If the column names none, use the API id that MODEL-MATRIX's model
  tables list for the label's model name, provided exactly one matches (for example "GPT-5.6
  Luna" gives `gpt-5.6-luna`, `MODEL-MATRIX.md:45`). If neither source gives exactly one id, null.
- `effort` is the label's effort word, lower-cased ("XHigh" gives `xhigh`). For agy the effort is
  part of the model id, so `effort` is null.
- DeepSeek V4.1 Max is null (client `kilo`, model null), because BACKLOG S-5 is open: "Max" may
  name an effort, not a model.
- `tiers` come from the tier table (`MODEL-MATRIX.md:128-135`). The cell must match both model and
  effort; for an agy id, the base name and the suffix (`gemini-3.8-flash-high` matches
  `3.8-flash / high`). No matching cell gives `[]`. A model that fills every cell of its provider gives
  `[1,...,9]`.
- `approval`: `"owner-long-task"` for the rung marked "on approval"; `"none"` otherwise.
- `contextWindow`: only a value with a source in the repository or on a provider page, with a
  date. Otherwise null.

The resolver recomputes `sectionSha256`. A mismatch exits 1 with `ERROR reason=ladder-stale`: the
owner changed the ladder and the data must be transcribed again. It is never guessed.

### S3 Resolver v0 order (PROTO-DEC-0079 item 2; 0075 item 9; workflowAI 1.5)

For a slot without `route`, over the ladder rungs:
1. **Route data.** A rung with a null client or model is excluded, `route-unknown`.
2. **Hard constraints** (0075 item 8).
   - `contextMin` against `contextWindow`: a known value below it excludes the rung,
     `context-window`.
   - A null value keeps the rung and adds `{rung, constraint: "contextMin"}` to `unverified`.
3. **Floor** (0059 item 2). `max(tiers) >= floor`, otherwise excluded `below-floor`. `[]` is
   excluded `tier-unknown`. Tiers are compared as written; the provider-relative caveat of 0086
   item 5 is noted in the report header.
4. **Independence** (0075 item 13). A model, family or provider in the slot's lists is excluded,
   `independence`.
5. **Approval** (0076 item 1; 0078 item 4). An `owner-long-task` rung with `long = true` and a
   null `approval` is skipped, `needs-approval`.
6. **Liveness.** PKG-1 probe levels 0-1 for the rung's client and model. A failure is skipped,
   `unavailable:<class>`. Skips are recorded, and the owner is not asked (workflowAI 1.4).
7. **Primary.** The admissible rung with the **largest rung number**, the bottom of the ladder
   ("cheaper wins", workflowAI 1.5 step 4). Inside a group, the lowest `order` wins: the rung the
   owner wrote first, since v0 cannot read limits in one unit (0078 item 2).
8. **Substitutes.** The next admissible rungs moving **up** the ladder, by decreasing rung number
   and then increasing `order`, up to `substitutes`.
9. **Terminal cases**, settled before the start (workflowAI 1.5 step 8):
   - no admissible rung: `BLOCKED`, exit 1, `ERROR reason=no-admissible-rung`;
   - fewer substitutes than asked: with `stageKind` `kernel` or `certification`, exit 1,
     `ASK_OWNER reason=shortfall`, and nothing starts (0078 item 3). Otherwise record `shortfall`
     and start.

"Escalation only on a verified failure" (0079 item 2): the supervisor moves to a substitute only
after a classified failure (S5). The resolver never starts at a higher rung on a prediction.

`resolve <dispatch> <slot>` prints `RESOLVE ...`, `SUBSTITUTE n=...`, `EXCLUDED rung=... reason=...`,
`SKIPPED ...` and `UNVERIFIED ...` rows. It exits 0, or 1 on a terminal case. It writes nothing.

### S4 Recording the resolution

The resolution object of PKG-2 S2 goes into the run record: `ladderSnapshot`, primary,
substitutes, excluded, skipped, unverified, approval and shortfall. With `selection = "owner"`,
primary and substitutes are the owner's routes, and the lists are empty.

### S5 Supervisor: action per failure class (the owner text sections cited; the owner text wins)

Budget (0075 item 3):
- primary: the first attempt plus one retry on a retryable class;
- each substitute: two attempts;
- at most six fresh invocations in all;
- resumes counted apart: at most three wakes per attempt (0051 item 4), and one resume per crash
  or per repair.

The step's hard ceiling `hardMin` runs from the step's first launch (0075 item 5 "per step"). When
it is reached, the step is BLOCKED (0075 item 3).

| Class | Action | Owner text |
|---|---|---|
| AUTH_ERROR | never the same route again; the next substitute at once; none left is BLOCKED | section 1 |
| CONFIG_ERROR | never the unchanged command again; v0 has no normaliser, so the next substitute; an error in the dispatch file itself is BLOCKED | section 2 |
| MODEL_UNAVAILABLE | no retry (v0 cannot prove "explicitly transient"); the next substitute | section 3 |
| QUOTA_EXHAUSTED | the next substitute at once; none left is BLOCKED and `ASK_OWNER` | section 4 |
| RATE_LIMIT | wait 60 s, then the route's one retry if unused; otherwise the next substitute | section 5 |
| NETWORK_ERROR, PROVIDER_ERROR | wait 30 s, then the route's one retry if unused; otherwise the next substitute | section 6 |
| PROCESS_CRASH | if a session id and a registry `resume.command` exist, one resume; then a fresh retry of the route if unused; then the next substitute | section 7 |
| STALL | wake by resume with the pointer to `.ai/docs/dispatch/wake.md`, up to three times; no progress after the third wake ends the attempt as fallen; then a fresh retry, then substitute 1, then substitute 2; exhausted is FAILED with `fallen = true` | section 8; 0051 item 4 |
| TIMEOUT | the step ceiling is reached, so BLOCKED; never a resume of the same session | section 9; 0075 item 5 |
| INVALID_OUTPUT, VALIDATION_FAILURE | one repair by resume, with the pointer to a repair file (S6); validate again; still failing goes to the next substitute | section 10 |
| DEPENDENCY_FAILURE | WAITING_DEPENDENCY; no budget spent; no model change | section 12 |
| POLICY_FAILURE | BLOCKED; no model change; the operator restores the invariant | section 13 |
| SEMANTIC_FAILURE | never produced by the supervisor. A reviewer stage outside the budget (0075 item 12; 0078 item 1) | section 11 |

- **Resume-first** (0075 item 2). After useful work has started, a crash or a stall is resumed
  before any fresh attempt.
- **Reasons.** Every attempt carries a reason from PKG-2 S3; repeating a known-failing operation
  is forbidden.
- **States** (0075 item 11). Every transition is logged with its reason in `transitions`.

### S6 Messages are pointers to files (0073 items 2-3; 0051 item 4)

- The script holds no prompt text. A wake sends the registry `resume.command` with
  `{message}` = `Read and follow the file .ai/docs/dispatch/wake.md`.
- `wake.md` holds one instruction, at most five lines: continue from your last journal checkpoint;
  do not restart the task.
- A repair writes `<clone>/.ai/runtime/dispatch-repair-<n>.md`. Its content is the bytes of
  `.ai/docs/dispatch/repair.md` followed by the failing check rows, as data. The message points at
  that file.
- `repair.md` says, in at most eight lines: repair only the named outputs; the rows follow; do not
  widen scope.

### S7 Launch pinning (0075 item 7)

- Before the first attempt the supervisor records `pins`: HEAD, the launch file path and sha256,
  and the sha256 of every `copyIn` file. `dispatchVersion` is the sha256 of the dispatch file.
  `roleSha256` and `corpusHash` are null in v0.
- Before every later attempt or resume it recomputes the launch, copyIn and dispatch hashes. A
  mismatch starts nothing: the step is BLOCKED with reason `pin-changed <path>`.
- `run <dispatch> <slot> --revise` starts a new launch revision: a new `runId` and new pins.
- A HEAD change alone does not block ("unrelated uncommitted changes do not block").

### S8 Completion contract and run record (0075 items 6, 14; 0076 item 3)

- DONE requires all of these:
  - the process ended with its exit code recorded;
  - every declared output exists, is non-empty and decodes as UTF-8 without U+FFFD;
  - the slot's `validate` (if any) exits 0;
  - a copied-back journal contains a line starting `Evidence:`; its path becomes `evidence`;
  - the supervisor sets `supervisorDone`.
- `needs` is satisfied only by a DONE step under this contract (a replacement of PKG-1's
  run-chain parity rule).
- Each settled step (DONE, BLOCKED or FAILED) is appended to `docs/ops/RUNS.jsonl` by PKG-2's
  `appendRecord`.
- The `usageFile` becomes `renderUsage` over the records of the dispatch's frames. PKG-1's
  run-chain-format writer is removed.
- `report` prints, per slot, the records' route, attempts, state, outputs and usage, and why usage
  is missing.

### S9 `protocol-manifest.json`

- Insert `docs/ops/model-ladder.json`, `.ai/docs/dispatch/wake.md` and
  `.ai/docs/dispatch/repair.md` into `source`.
- Insert `tests/resolver.test.cjs` into `tests`.
- One edit, the last of the package, after re-reading the file.

### S10 `.ai/docs/CLI-AGENTS.md` section 9

Append, inside section 9:
- the resolver order of S3, in one paragraph with the decisions it rests on;
- the class table of S5, by reference to the owner text;
- launch pinning, the completion contract, and where run records live.

The sentence "recovery arrives with PKG-3" from PKG-1 becomes "recovery follows PROTO-DEC-0075 as
implemented here".

## Acceptance criteria

| # | Criterion | Check |
|---|---|---|
| AC-1 | The ladder file matches S2 for every rung (the executor lists each rung with its source cell in the journal), and a stale `sectionSha256` exits 1 `ladder-stale` | T, F |
| AC-2 | Fixture ladder, floor T3, no exclusions: the primary is the largest admissible rung number and the substitutes go up the ladder in order | T |
| AC-3 | Each exclusion reason is produced by its own fixture: route-unknown, context-window, below-floor, tier-unknown, independence, needs-approval, unavailable | T |
| AC-4 | A null context window produces an `UNVERIFIED` row and keeps the rung | T |
| AC-5 | Shortfall: kernel or certification exits 1 `ASK_OWNER` and starts nothing; other starts and records the shortfall | T |
| AC-6 | A slot with `route` never runs the resolver (`selection = owner`) | T |
| AC-7 | Each S5 class row is driven by a fake-client mode, with the expected transitions, reasons and budget counts; there is no seventh fresh invocation, no third primary attempt, and no resume after TIMEOUT | T |
| AC-8 | STALL: three wakes, each a resume carrying the wake pointer, then fallen, then fresh, then substitutes; exhausted records `fallen = true` | T |
| AC-9 | INVALID_OUTPUT: one repair resume whose message points at a repair file holding `repair.md` plus the rows | T |
| AC-10 | A launch or copyIn file changed between attempts gives BLOCKED `pin-changed`; `--revise` gives a new runId | T |
| AC-11 | DONE only under S8; a missing Evidence line keeps the step out of DONE | T |
| AC-12 | Every settled step appends one valid record (PKG-2 `validateRecord` returns `[]`); the usage table renders from the records | T |
| AC-13 | The script source still contains no prompt text or `docs/research/` path, and the only pointer targets are the launch file and the two message files | T |
| AC-14 | Validator and full suite pass on the integrated tree | C |
| AC-15 | The real-ladder cross-check prints the rows below, or the executor reports the difference as a finding without changing code to match | C |

AC-15 is the expected output of `resolve` on the real ladder, derived by the resolver from
`MODEL-ECONOMICS.md:28-40` and `MODEL-MATRIX.md:128-132`, with all clients live. It checks the
transcription, not the code. Test dispatch `tests/fixtures/resolver/real-ladder.json` has two slots:

| Slot | Expected |
|---|---|
| floor T7, `stageKind = kernel` | primary Mistral Medium 3.5 (rung 9); one substitute, Gemini 3.8 High (rung 5); shortfall 1, so `ASK_OWNER`, exit 1. Excluded: tier-unknown for Sol Medium, Terra High and Gemini 3.6 High; below-floor for the Opus rungs, Luna XHigh and Gemini 3.7 High; route-unknown for DeepSeek V4.1 Max |
| floor T3, `stageKind = other` | primary Mistral Medium 3.5 (rung 9); substitutes Gemini 3.7 High (rung 7), then GPT-5.6 Luna XHigh (rung 6); exit 0 |

## Validation commands

```
node --test tests/resolver.test.cjs
node --test tests/dispatch.test.cjs
node .ai/bin/protocol-dispatch.cjs resolve tests/fixtures/resolver/real-ladder.json floor-t7-kernel
node .ai/bin/protocol-dispatch.cjs resolve tests/fixtures/resolver/real-ladder.json floor-t3-other
node .ai/bin/protocol-runrecord.cjs validate <temp RUNS.jsonl written by the tests>
powershell -ExecutionPolicy Bypass -File .\validate-protocol.ps1
powershell -ExecutionPolicy Bypass -File .\test-protocol.ps1
node .ai/bin/protocol-handoff.cjs record --owner <your owner name>
```

The two `resolve` commands probe the real clients (levels 0-1 only, no model call). If a client
is absent on the day, its rung is `SKIPPED unavailable` and the rows differ from AC-15. Record the
rows as printed.

## Integration conditions

- The W2 gate: the operator runs the validator, the suite and each full `record` in turn with both
  streams at rest, then commits PKG-3 path-scoped.
- PKG-4's P-L3-004 edit (its `enforced_by` and R-L3-004.4-5) is integrated only after this package
  passes AC-7 to AC-11.
- No running program switches to this dispatcher before certification and an owner act
  (resolution OQ-9). BACKLOG M-3 (re-resolving the study-A/B jobs) and K-launch become possible
  after that switch. The owner schedules them.

## Risk class and certification route

- **High** (PROTO-DEC-0038 item 1): kernel dispatcher, model selection and recovery.
- Two parallel independent certifiers: Kimi K2.7 Code HighSpeed and MiMo-V2.6-Flash (PROTO-DEC-0086
  item 1). They use output 4 on the frozen candidate after stage 12.
- The executor, Claude and DeepSeek certify nothing here.

## Artifact plan

| Path | Action | Disposition at program closure |
|---|---|---|
| `.ai/bin/protocol-dispatch.cjs` | changed | KEEP_ACTIVE |
| `docs/ops/model-ladder.json` | created | KEEP_ACTIVE: a derived transcription; `MODEL-ECONOMICS.md` stays canonical, and the hash check prevents drift |
| `.ai/docs/dispatch/wake.md`, `.ai/docs/dispatch/repair.md` | created | KEEP_ACTIVE |
| `tests/resolver.test.cjs`, `tests/fixtures/resolver/*`; `tests/dispatch.test.cjs`, `tests/dispatch-fake-client.cjs` | created or changed | KEEP_ACTIVE |
| `.ai/docs/CLI-AGENTS.md` | changed (section 9) | KEEP_ACTIVE |
| `protocol-manifest.json` | changed (entries) | KEEP_ACTIVE |
| `docs/ops/RUNS.jsonl` | created by the first real dispatch, not by the executor | KEEP_ACTIVE (append-only data; OQ-8) |
| audit-prompt file under `docs/reviews/` | created | KEEP_ACTIVE (immutable review record) |

## Executor requirements

| Dimension | Level | Why |
|---|---|---|
| D-IMPL | HIGH | state machine, budget accounting, resume paths |
| D-ARCH | MEDIUM | fitting M1 and M2 into PKG-1's structure without changing its interfaces |
| D-REV | LOW | |
| D-TERM | HIGH | process control, resume by session id, per-client differences |
| D-ALGO | MEDIUM | the ordering rules of S3, budget counters |
| D-EDIT | MEDIUM | |
| D-DOC | MEDIUM | the S2 transcription with sources; section 9 |
| D-CRIT | MEDIUM | noticing when a rule has no data and stopping instead of assuming |
| D-SYN | MEDIUM | the Russian owner text, 0075 and workflowAI read together |

Minimum tier: **T7** (PROTO-DEC-0059 item 2; 0072 item 3). Owner-named E1 = Gemini 3.8 Flash high
(0086 item 2), Google T9 (`MODEL-MATRIX.md:130`).

## STOP conditions

Block, record a finding and a `Signal:` line, and do not decide, when:
1. A rung's model, effort or tier cannot be read from the sources exactly as S2 requires, and
   leaving it null would change AC-15. Report both readings.
2. The owner text and PROTO-DEC-0075 disagree on a class action in a way S5 does not settle.
3. A client needed for resume has no `resume.command` in the registry while the owner text requires
   a resume. The rule is fresh retry, so this is a STOP only if the fake-client tests cannot
   express it.
4. PKG-1's interfaces or PKG-2's library would have to change. Do not edit them; report.
5. The suite is red before your first edit, or M1's tests are red when M2 would start.
6. Any edit outside Allowed paths would be needed, including `clients.json` or
   `MODEL-ECONOMICS.md`.
7. A new idea or an unresolved design question arises (a metric, a budget estimator, a
   tie-break). It becomes a finding (a candidate, cap 5, or a question to the owner).

## Evidence and closing steps

1. Start your own session.
   - Line 1: `Launch: ...`.
   - Line 2: `Orientation: <model> @ task:ownerideas-pkg-3 (parent program:ownerideas-revision):
     executor E1 | success=PKG-3 AC-1..AC-15`.
2. Write journal checkpoints: after S2 (the ladder transcription with a source per rung), after M1
   (resolver tests green), and after each of S5-S8.
3. At the end: `git diff`, then a five-label entry listing each AC and the AC-15 rows as printed.
4. Run `record --owner <owner>` (full) and report the exit codes.
5. Last chat message: a short report to the owner in Russian.
