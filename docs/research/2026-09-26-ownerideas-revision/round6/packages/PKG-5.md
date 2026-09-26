# PKG-5 SIGNALS - one signals ledger with its script, and the per-client model and effort procedure

Mode: ADVISORY (a package prompt, not a decision). Author: `claude-e59d6a50882e9e39` (stage 5-6
resolver, resumed session of `claude-b68b3491ee12ebd9`), 2026-09-26. Resolution:
`../FINAL-RESOLUTION-CLAUDE.md`. The executor implements this file; it does not redesign it.

## ID

`PKG-5` (program `ownerideas-revision`, stage 8). Items:
- A-5: the signals ledger `.ai/SIGNALS.md`, its script, its grammar spec, its procedure section in
  `.ai/docs/CLI-AGENTS.md`, the import of interim `Signal:` lines, and the dispatcher's fall signal
  (PROTO-DEC-0051 items 1-5);
- A-12: the per-client procedure for setting the model and effort, P-L3-005 (PROTO-DEC-0065 item 2).

## Goal

- **A-5.** Every signal of PROTO-DEC-0051 lands in one append-only ledger with a fixed grammar, so
  a script can count, group and export it. The interim `Signal:` lines of journals and ARCHIVE are
  brought in once each, by hash, without editing any journal. A fallen attempt of the kernel
  dispatcher becomes a `fall` signal by itself.
- **A-12.** One procedure says how the model and the effort are set for each kind of client, reading
  the verified client registry and never restating it.

## Scope

In scope: S1-S9 below.

Out of scope, never done here:
- the maturity ladder M0-M5 and shadow promotion of P-9 (research seed `OwnerIdeas/scripts.md`;
  no accepted block; R-5, FRAMES C-R5);
- deciding a script candidate (the four-condition test stays with the coordinator, 0051 item 3);
- any change to the Stop hook, the validator, `protocol-hooks.cjs` or `protocol-handoff.cjs`;
- any change to the grammar or keys of `.ai/docs/clients.json` (PKG-1 owns them; S8 allows one
  value field only);
- editing any journal, `.ai/ARCHIVE.md`, P-L0-001, P-L0-002 or P-L0-006;
- installing anything into host projects (owner question OQ-4).

## Stream and wave

E2, wave W3. E1 is idle in W3, so this package is the only writer of every file it touches.

## Inputs

- Decisions: PROTO-DEC-0051 (read the whole block); 0049 item 2; 0047 items 8-9; 0048 item 8;
  0050 items 2-3; 0055 item 5; 0065 (whole block, including the transcriber's reading in
  Consequences); 0078 item 5; 0073 items 2-3.
- `docs/core-arch/CORE-ARCH-6.md:77-98`: the ledger design this package fixes (a proposal, not a
  decision; S1 below is the binding form).
- `docs/core-arch/stage-1/P-L0-001-procedure-lifecycle.md` and `P-L0-006-...md` (the procedures
  that consume signals; read only).
- `docs/core-arch/stage-1/procedure.schema.md` (the P-L3-005 shape).
- `docs/core-arch/stage-4/MODEL-MATRIX.md:108-122` (effort levels; comparison only),
  `docs/core-arch/stage-4/P-L3-004-route-failover.md` (a sibling L3 record, for form).
- PKG-1's `.ai/docs/clients.json`, `docs/specs/bin-output-schema.md` and `protocol-dispatch.cjs`;
  PKG-3's supervisor (its STALL handling, PKG-3 S5); PKG-2's run-record spec.
- `tests/helpers.cjs`; `tests/manifest.test.cjs:68-72`; `protocol-manifest.json`.

## Allowed paths

Create:
- `.ai/SIGNALS.md`
- `.ai/bin/protocol-signals.cjs`
- `docs/specs/signals-ledger.md`
- `docs/core-arch/stage-4/P-L3-005-client-model-effort.md`
- `tests/signals.test.cjs`
- `tests/fixtures/signals/` (non-`.cjs` fixture files only)
- `docs/reviews/2026-09-2?-<your-agent>-ownerideas-pkg-5-audit-prompt.md` (one file)

Change:
- `.ai/docs/CLI-AGENTS.md`: append section 10 only (S7)
- `.ai/docs/clients.json`: only `effort.note` values (S8)
- `.ai/bin/protocol-dispatch.cjs` and `tests/dispatch.test.cjs`: the fall hook only (S6)
- `protocol-manifest.json`: insert entries only (S9)
- your own journal

## Forbidden paths

Everything not listed above, including: every journal but yours; `.ai/ARCHIVE.md`;
`.ai/TASK.md`, `.ai/PLAN.md`, `.ai/DECISIONS.md`, `docs/decisions/REGISTRY.md`;
`.ai/bin/protocol-hooks.cjs`, `protocol-handoff.cjs`, `protocol-runrecord.cjs` and every other
existing script; `.claude/`, `.codex/`; the validator and `test-protocol.ps1`; `docs/ops/**`
(including `RUNS.jsonl` and `model-ladder.json`); `docs/core-arch/**` other than the new P-L3-005;
`docs/research/**`; `OwnerIdeas/`. No commit, tag, push or branch.

## Dependencies

- W2 integrated and committed: PKG-1 (registry), PKG-2 (run records) and PKG-3 (supervisor) exist.
- The import (S5) reads HEAD. Run it after the W2 commit so the program's journals are included.

## Required outputs

1. `docs/specs/signals-ledger.md` stating S1-S2 exactly (at most 120 lines).
2. `.ai/bin/protocol-signals.cjs` meeting S3-S5.
3. `.ai/SIGNALS.md`: the S2 header plus the lines written by one `import` run (S5).
4. The dispatcher's fall hook (S6).
5. `docs/core-arch/stage-4/P-L3-005-client-model-effort.md` (S8).
6. `.ai/docs/CLI-AGENTS.md` section 10 (S7).
7. `tests/signals.test.cjs` covering AC-1..AC-9, and the fall test of AC-10 in
   `tests/dispatch.test.cjs`.
8. The `protocol-manifest.json` entries (S9).
9. The audit-prompt file: at most 150 lines, one adversarial probe per acceptance criterion.
10. A five-label journal entry with a full `record` Evidence block.

## Specification (binding)

### S1 Line grammar (`signals/1`)

One signal state per line, fields separated by exactly ` | `, LF-terminated, no trailing space:

```
Signal: <id> | <type> | <date> | <participant> | <evidence> | <cost> | <disposition> | rc=<rc> | batch=<batch> | src=<src>
id          ::= "sig-" YYYYMMDD "-" DDD                       (DDD = 001..999)
type        ::= "procedure-gap" | "script-candidate" | "fall"
date        ::= YYYY-MM-DD, a real calendar date
participant ::= [A-Za-z0-9._:/@-]{1,80}
evidence    ::= decision | sigref | relpath [":" N ["-" N]] ["#" anchor]
decision    ::= "PROTO-DEC-" DDDD | "DEC-" DDDD
sigref      ::= id
relpath     ::= [A-Za-z0-9._/-]{1,200}, not starting with "/", no ".." segment, no ":" drive
anchor      ::= [A-Za-z0-9._:-]{1,80}
cost        ::= "unknown" | item { "," item }      item ::= ("attempts"|"minutes"|"owner") "=" N
disposition ::= "open" | "grouped:G-" N | "procedure:" recid | "script:" relpath
              | "kept-by-assistant:" ("1"|"2"|"3"|"4") | "rejected:" token | "closed:" evidence
recid       ::= a record id of procedure.schema.md section 2 (e.g. P-L2-006, S-001)
token       ::= [A-Za-z0-9._:/#-]{1,80}
rc          ::= "-" | [a-z0-9-]{1,40}
batch       ::= "-" | [A-Za-z0-9._-]{1,40}
src         ::= "-" | 64 lowercase hex characters
```

- The fields are those of PROTO-DEC-0051 item 1 (type, date, participant, evidence, cost,
  disposition) plus four keys: the id, the root cause and the batch of CORE-ARCH-6 section 4, and
  `src`, the sha256 of an imported interim line (S5). No other field exists: a description lives at
  the evidence path.
- **Last line wins.** A later line with the same id is the new state of that signal. `type`, `date`,
  `participant`, `evidence` and `src` must equal those of the id's first line. A difference is an
  invalid line.
- `kept-by-assistant:<n>` names the unmet condition of section 1 of
  `docs/specs/2026-09-23-executable-rulebook-spec.md` (0051 item 3).

### S2 File `.ai/SIGNALS.md`

The first four lines are fixed, byte for byte, each ending in LF:
1. `# Signals ledger`
2. an empty line
3. ``Append-only. Written only by `node .ai/bin/protocol-signals.cjs`. Grammar: `docs/specs/signals-ledger.md`.``
   (the text between the outer double backticks)
4. an empty line

Every later line is a `Signal:` line of S1. Nothing is ever deleted or rewritten (0051 item 1).
Each write is one `fs.appendFileSync` of whole lines.

### S3 Library (`module.exports`)

- `parseLine(text) -> {fields} | throws` and `validateFile(path) -> string[]` (empty = valid; each
  message `line <n>: <rule>`).
- `readLedger(path) -> Map<id, {first, latest, lines: [n...], batches: Set}>` (strict: throws on any
  invalid line, naming it).
- `addSignal(path, {type, date?, participant, evidence, cost, disposition?, rc?, batch?, src?}) -> id`.
  - `date` defaults to today in UTC; `disposition` to `open`; `rc`, `batch` and `src` to `-`.
  - The id is the next free `DDD` for that date: one plus the largest existing for the date.
  - Past 999: throws `id-space-exhausted`.
- `updateSignal(path, id, {disposition?, rc?, batch?}) -> void`: appends a copy of the id's latest
  line with the given fields changed. An unknown id throws.
- **Lock.** Every write (add, update, import, `plan --stamp`) holds an exclusive lock file
  `<dirname(ledger)>/runtime/<basename(ledger)>.lock`. It is created with the `wx` flag and holds
  the writer's pid.
  - The writer retries every 100 ms for 10 s, then throws `ledger-busy`.
  - A lock whose pid is not alive is removed once, and the removal is printed as
    `WARN reason=stale-lock pid=<n>`.
  - The ledger is re-read under the lock before the id is computed.
  - For `.ai/SIGNALS.md` the lock is `.ai/runtime/SIGNALS.md.lock`, which Git ignores.

### S4 CLI (A-14 rows `TOKEN key=value`; exits 0 ok, 1 refusal, 2 unknown or malformed)

`node .ai/bin/protocol-signals.cjs <command> [--file <ledger>]`. The default ledger is `.ai/SIGNALS.md`
under the repository root.

| Command | Rows | Exit |
|---|---|---|
| `init` | `WROTE path=<p>` (header only) | 0; 1 if the file exists |
| `check` | `INVALID line=<n> error="<msg>"` per problem, then `SUMMARY lines=<n> signals=<ids> invalid=<m>` | 0 if m = 0; 2 otherwise |
| `add --type T --participant P --evidence E --cost C [--disposition D] [--rc R] [--batch B] [--date YYYY-MM-DD]` | `ADDED id=<id>` | 0; 2 on a field outside S1; 1 if the ledger is missing or busy |
| `update <id> [--disposition D] [--rc R] [--batch B]` | `UPDATED id=<id>` | 0; 1 on an unknown id; 2 on a malformed field |
| `list [--type T] [--open]` | one `SIGNAL id=.. type=.. date=.. participant=.. disposition=.. rc=.. batch=..` per id (latest state) | 0 |
| `count` | one `COUNT type=<t> total=<n> open=<m>` per type in S1 order, then `SUMMARY total=<n> open=<m>` | 0 |
| `plan --batch B [--stamp]` | per root cause of the open signals: `GROUP rc=<rc> ids=<a,b,..>`; `ESCALATE id=<id> batches=<b1,b2,..>` for an open signal stamped by two or more distinct batches; with `--stamp`, `STAMPED id=<id> batch=B` for each open signal whose latest batch is not B | 0 |
| `export --json` | a JSON array of the latest states (the one stdout exempt from the row rule, like `render`) | 0 |
| `import` | S5 rows | 0; 1 if any line was skipped |
| none, or unknown command or flag | `USAGE ...` or `ERROR reason=...` | 2 |

- "Open" means that the latest disposition is `open` or `grouped:*`.
- `plan` without `--stamp` writes nothing. With `--stamp`, the coordinator's run at batch planning
  gives the escalation rule of 0051 item 2: a signal still open at a second planning is escalated.
  This reads "two consecutive batches" as two batch plannings that stamped it [I].
- The disposition of a group, a procedure or a script is the coordinator's judgement, recorded by
  `update` (0051 items 2-3). The script decides no disposition.

### S5 Import of interim `Signal:` lines (0051 item 5; imported once each, by hash)

1. **Corpus.** `.ai/ARCHIVE.md` and every `.ai/worklog/*.md` except `README.md`, read as tracked
   at HEAD (`git ls-files` and `git show HEAD:<path>`). Untracked journals of live sessions are not
   read; a later `import` brings their lines in once they are committed. Files are taken in
   ascending path order, and lines in ascending order.
2. **Interim line.** A line matching `^\s*(?:-\s+)?Signal:\s`. Its text `t` is the line with the
   leading space, `- ` and `Signal:` removed and trimmed. `src` = sha256 of `t` in UTF-8.
3. **Duplicate.** A `src` already present in the ledger prints `DUPLICATE src=<hex> path=<p> line=<n>`
   and writes nothing. The same text archived later from a journal into ARCHIVE is therefore never
   imported twice.
4. **Fields.** Drop a leading `sig-...` token and the `|` after it, if present.
   - `type`: `t` must then begin with `procedure-gap`, `script-candidate` or `fall`, followed by
     the end of the text, a space or one of `|.,:;`. Otherwise `SKIPPED reason=type-unknown`.
   - Pipe form (the text contains ` | `): the second field is the date if it is a valid date; the
     third is the participant if it matches S1; the fifth is the cost if it matches S1.
   - `date` otherwise: the date of the nearest preceding line `^## (\d{4}-\d{2}-\d{2})` in the same
     file. With none, `SKIPPED reason=date-unknown`.
   - `participant` otherwise: in a journal, the file's basename without `.md`. In ARCHIVE, the
     value of the nearest preceding `Agent:` line below the nearest preceding `## ` heading, cut at
     the first character outside S1's set; `unknown` when that is empty.
   - `cost` otherwise: `unknown`.
   - `evidence`: always `<path>:<line>` of the interim line, never the interim line's own evidence
     text. The original stays readable there.
   - `disposition`: in the pipe form, a sixth field beginning `closed` gives
     `closed:<path>:<line>`, and one beginning `rejected` gives `rejected:interim`. Everything else
     is `open`.
   - `rc`, `batch`: `-`.
5. **Write.** Every imported line is appended under one lock, as `IMPORTED id=<id> src=<hex>
   path=<p> line=<n>`. Then `SUMMARY found=<n> imported=<m> duplicate=<d> skipped=<k>`.
6. **Skipped lines** stay where they are and are never lost. The coordinator may add one by hand
   with `add ... --evidence <path>:<line>`, and records in its journal why it chose that type.
7. **Journals and ARCHIVE are only read.** The import never writes them.

### S6 Fall signal from the dispatcher (0051 item 4)

- Find the single point where PKG-3's supervisor ends an attempt as fallen: no progress after the
  third wake, or the first stall of a client whose registry `resume.command` is null. There, call
  `addSignal` on `.ai/SIGNALS.md` under the same repository root the dispatcher uses for
  `docs/ops/RUNS.jsonl`, with:
  - `type`: `fall`;
  - `participant`: `<client>:<model>` of the attempt, with every character outside S1's set
    replaced by `-`;
  - `evidence`: `docs/ops/RUNS.jsonl#<runId>`;
  - `cost`: `minutes=<n>`, where n is the time from the attempt's start to its kill, in whole
    minutes rounded down.
- When the fall was the first stall of a client without `resume.command`, also add a
  `procedure-gap` signal with the same participant and evidence and cost `unknown`. The inability
  to resume is itself a gap (0051 item 4, last bullet).
- A failure of `addSignal` does not change the step's state or its run record. It prints
  `ERROR reason=signal-append-failed runId=<id> error="<msg>"` and the step continues.
- No other failure class creates a signal automatically.
- If PKG-3's code has no single such point, go to STOP 3.

### S7 `.ai/docs/CLI-AGENTS.md` section 10

Append `## 10. Signals ledger (source repository only)`, at most 40 lines, stating:
- the ledger `.ai/SIGNALS.md`, append-only, written only through `protocol-signals.cjs`; the
  grammar lives in `docs/specs/signals-ledger.md` (one home; R-L0-12);
- when each type is recorded, as pointers to PROTO-DEC-0051 items 2-4;
- `add` for any participant; a `Signal:` journal line is still accepted from a participant that
  cannot run the script, and the next `import` brings it in once;
- at batch planning, the coordinator runs `plan --batch <id> --stamp` and records groups and
  dispositions with `update`; an `ESCALATE` row goes to the owner (0051 item 2);
- a `script-candidate` is tested against the four conditions and recorded as `script:<path>` or
  `kept-by-assistant:<n>` (0051 item 3);
- falls come from the dispatcher (S6);
- consumers are P-L0-001 and P-L0-006; M-008 counts come from `count`;
- this file is installed into host projects, but the ledger and the script are not (they are
  registered as `source`), and the section says so.

### S8 P-L3-005 per-client model and effort (A-12; PROTO-DEC-0065 item 2)

Create `docs/core-arch/stage-4/P-L3-005-client-model-effort.md`. Its front matter is exactly:

```
---
id: P-L3-005
version: 0.1
title: Set the model and effort of a client before the task begins
layer: L3
type: procedure
status: draft
roles: [coordinator, dispatcher, implementer]
stages: [dispatch, execute]
triggers: [dispatch, stage-enter:execute]
inputs: [task-frame, .ai/docs/clients.json]
outputs: [journal, signals]
back_edges: []
enforcement: S~
enforced_by: [.ai/bin/protocol-dispatch.cjs]
script_candidate: yes
evidence_class: [B, C]
evidence: [PROTO-DEC-0047, PROTO-DEC-0050, PROTO-DEC-0065, PROTO-DEC-0078, docs/core-arch/stage-4/MODEL-MATRIX.md:108-122]
cost_basis: unknown
---
```

Body: the eight headings of `procedure.schema.md` section 3, in order. The rules, exactly:

> - R-L3-005.1. How a client sets its model and effort is registry data in `.ai/docs/clients.json`
>   (`model.how`, `effort.how`, `effort.values`, `effort.note`), verified from the client's own
>   `--help` with its version and date (PROTO-DEC-0047 item 9; 0050 item 3). This procedure never
>   restates it (R-L0-12).
> - R-L3-005.2. The model and the effort are set before the task begins: at launch, or with the
>   client's own command right after launch and before the first task action, which counts as at
>   launch (PROTO-DEC-0055 item 5; 0065 Consequences, transcriber's reading).
> - R-L3-005.3. `flag` and `model-id`: the dispatcher builds them into the command from the
>   registry template; nobody types them by hand (PROTO-DEC-0050 item 2).
> - R-L3-005.4. `config`: the value is set in the client's own configuration, as `effort.note`
>   says, before the launch, by one agent only, which keeps a backup, writes a journal entry and a
>   record in the folder of the change (PROTO-DEC-0048 item 8).
> - R-L3-005.5. `post-launch`: the executor's first action after orientation is the client command
>   that `effort.note` names; the Launch line follows it.
> - R-L3-005.6. `none`: the effort cannot be set; the Launch line says `effort=unknown` and the run
>   record's `effortUsed` is null.
> - R-L3-005.7. A value outside the client's `effort.values` is never requested. The value that
>   actually ran is recorded, not the requested one: in the Launch line (P-L2-002 R-L2-002.5) and in
>   the run record's `modelRan` and `effortUsed` (PROTO-DEC-0047 item 9; 0078 item 5).

- Steps:
  1. **Read** (coordinator): the client's registry entry.
  2. **Choose** (coordinator): the value from `effort.values`, per P-L2-002.
  3. **Apply** (dispatcher, or the agent named by R-L3-005.4-5): the rule of its `how`.
  4. **Confirm** (implementer): the Launch line.
  5. **Mismatch** (coordinator): P-L2-002 back edge `7>5`.
- Stop conditions, each going to P-L0-002 with a `procedure-gap` signal:
  - the client is absent from the registry, or `present: false`;
  - `probe` prints `VERSION_CHANGED` (re-verify the registry, 0050 item 3);
  - `how` is `config` or `post-launch` and `effort.note` names no instruction.
- Back edges: none; P-L2-002 owns the relaunch.
- Evidence: B, PROTO-DEC-0065 Context (clients differ; some take the model after start); B, the
  effort-unknown DeepSeek passes (P-L2-002 Evidence); C, the owner's words in 0065.
- Risks: two rows. A note that is out of date: covered by the version probe. A config change that
  leaks into other sessions: covered by the backup and the record of R-L3-005.4.
- Change log: `- 0.1 — <YYYY-MM-DD> — <your session owner name> — first draft, A-12 (PROTO-DEC-0065 item 2) — review pending (PKG-5).`

**Registry notes.** For each client whose `effort.how` is `config` or `post-launch` and whose
`effort.note` is null or names no instruction:
- run that client's `--help` (and `help config` where it exists);
- write the instruction it shows into `effort.note`, one line;
- list the command and the date in your journal.
Change no other field. When `--help` shows no instruction, leave the note null; that client's stop
condition then applies. This is a finding, not a failure.

### S9 `protocol-manifest.json`

- Insert `.ai/SIGNALS.md`, `.ai/bin/protocol-signals.cjs` and `docs/specs/signals-ledger.md` into
  `source`.
- Insert `tests/signals.test.cjs` into `tests`, keeping alphabetical order.
- One edit, the last of the package, after re-reading the file.

## Acceptance criteria

| # | Criterion | Check |
|---|---|---|
| AC-1 | A golden ledger (header plus one line of each type, one update, one import line) passes `check`; the header altered by one byte fails | T |
| AC-2 | Each production of S1 has a negative fixture failing with its line number: a wrong separator, an extra field, a missing field, an unknown type, a bad date (2026-02-30), a bad cost, a bad disposition, a `..` path, a changed immutable field on a later line. Silent pass-through is tested (PROTO-DEC-0047 item 8) | T |
| AC-3 | `add` assigns `sig-<date>-001`, then `-002`; `update` appends one line and `list` shows the latest state; `update` of an unknown id exits 1 | T |
| AC-4 | Two processes, each adding 50 signals at once to one ledger, give 100 valid lines with 100 distinct ids | T |
| AC-5 | A stale lock with a dead pid is removed once with a `WARN` row; a live lock makes `add` exit 1 `ledger-busy` after the timeout (test timeout option allowed) | T |
| AC-6 | `import` on a fixture repository with journal and ARCHIVE lines in the three observed interim forms (pipe, dash, id-prefixed) gives the expected fields; `type-unknown` and `date-unknown` lines are SKIPPED with exit 1; a second `import` imports 0; a line moved from a journal into ARCHIVE is DUPLICATE; no journal or ARCHIVE byte changes | T |
| AC-7 | `plan --batch B1 --stamp`, then `plan --batch B2` prints `ESCALATE` for a signal still open, and not for one closed in between | T |
| AC-8 | `count` and `export --json` agree with `list` on the golden ledger | T |
| AC-9 | Every stdout line in the tests matches `^[A-Z][A-Z_]*( |$)`, apart from `export --json` | T |
| AC-10 | The dispatcher fall test: a STALL fake client exhausting its wakes adds one `fall` line with `evidence=docs/ops/RUNS.jsonl#<runId>`; a fake client without `resume.command` adds `fall` and `procedure-gap`; a failing ledger leaves the run record unchanged and prints the ERROR row | T (`tests/dispatch.test.cjs`) |
| AC-11 | The real `.ai/SIGNALS.md` passes `check`. Its import SUMMARY is in the journal with every SKIPPED line listed. `found` equals `git grep -c` of the interim pattern over the same corpus at HEAD | C |
| AC-12 | P-L3-005 front matter is exactly S8's; its headings follow schema section 3; it contains no flag string, effort value or model id (search for `--` and for the effort words of `effort.values`) | F |
| AC-13 | CLI-AGENTS gains section 10 only; sections 1-9 are byte-identical | C (`git diff`) |
| AC-14 | In `clients.json` only `effort.note` values changed, and PKG-1's registry loader test still passes | C |
| AC-15 | The validator and the full suite pass on the integrated tree | C |

## Validation commands

```
node --test tests/signals.test.cjs
node --test tests/dispatch.test.cjs
node .ai/bin/protocol-signals.cjs check
node .ai/bin/protocol-signals.cjs count
git grep -c -E "^[[:space:]]*(-[[:space:]]+)?Signal:[[:space:]]" HEAD -- .ai/ARCHIVE.md ".ai/worklog/*.md"
git diff -- .ai/docs/clients.json .ai/docs/CLI-AGENTS.md
powershell -ExecutionPolicy Bypass -File .\validate-protocol.ps1
powershell -ExecutionPolicy Bypass -File .\test-protocol.ps1
node .ai/bin/protocol-handoff.cjs record --owner <your owner name>
```

The `git grep` count excludes `.ai/worklog/README.md` in the comparison of AC-11. Report every exit
code.

## Integration conditions

- The W3 gate: the operator runs the validator, the suite and the full `record` with E2 at rest,
  then commits PKG-5 path-scoped. After the commit, `.ai/SIGNALS.md` is the ledger that PROTO-DEC-0051
  item 5 waited for.
- After W3, `Signal:` journal lines stay valid input for `import`. The operator runs `import` again
  at the first batch planning after W3, which brings in the lines written by W3's own sessions.
- Stage 9 onward (DeepSeek review) starts after the W3 gate (resolution section 6).

## Risk class and certification route

- **High** (PROTO-DEC-0038 item 1): a new ledger under `.ai/`, a new `.ai/bin` script, and a change
  to the kernel dispatcher.
- Two parallel independent certifiers: Kimi K2.7 Code HighSpeed and MiMo-V2.6-Flash (PROTO-DEC-0086
  item 1). They use output 9 on the frozen candidate after stage 12. P-L3-005 and the section-10
  text are reviewed inside that certification.
- The executor, Claude and DeepSeek certify nothing here.

## Artifact plan

| Path | Action | Disposition at program closure |
|---|---|---|
| `.ai/SIGNALS.md` | created (header plus the import) | KEEP_ACTIVE (canonical ledger, append-only data) |
| `.ai/bin/protocol-signals.cjs` | created | KEEP_ACTIVE |
| `docs/specs/signals-ledger.md` | created | KEEP_ACTIVE (canonical grammar); CORE-ARCH-6 section 4 stays a proposal and is realigned by F-03 |
| `docs/core-arch/stage-4/P-L3-005-client-model-effort.md` | created (0.1 draft) | KEEP_ACTIVE |
| `tests/signals.test.cjs`, `tests/fixtures/signals/*`; `tests/dispatch.test.cjs` | created or changed | KEEP_ACTIVE |
| `.ai/bin/protocol-dispatch.cjs` | changed (fall hook) | KEEP_ACTIVE |
| `.ai/docs/CLI-AGENTS.md` | changed (section 10) | KEEP_ACTIVE |
| `.ai/docs/clients.json` | changed (`effort.note` values only) | KEEP_ACTIVE |
| `protocol-manifest.json` | changed (entries) | KEEP_ACTIVE |
| audit-prompt file under `docs/reviews/` | created | KEEP_ACTIVE (immutable review record) |
| interim `Signal:` lines in journals and ARCHIVE | read, not edited | stay where they are (immutable history, PROTO-DEC-0085 item 4) |

## Executor requirements

| Dimension | Level | Why |
|---|---|---|
| D-IMPL | MEDIUM | a parser, a locked appender and an importer, about 500 lines, fully specified |
| D-ARCH | LOW | the structure is fixed here |
| D-REV | LOW | |
| D-TERM | MEDIUM | parallel writers and lock files on Windows; `git show` of HEAD; running client `--help` |
| D-ALGO | LOW | |
| D-EDIT | MEDIUM | a small hook inside another package's dispatcher; exact grammar |
| D-DOC | MEDIUM | the spec, section 10, and a kernel record in schema form |
| D-CRIT | MEDIUM | negative fixtures that really exercise every production; not over-reading interim lines |
| D-SYN | LOW | |

Minimum tier: **T7** (PROTO-DEC-0059 item 2, kernel change; 0072 item 3). The owner named E2 =
Mistral Medium 3.5 max (0086 item 2), which fills T1-T9 of its provider (`MODEL-MATRIX.md:132`).

## STOP conditions

Block, record a finding and a `Signal:` line, and do not decide, when:
1. An interim line cannot be read into S1 by the S5 rules. Never widen the rules to take it in: it
   is SKIPPED, and more than ten SKIPPED lines is a finding for the owner.
2. A decided signal field (0051 item 1) cannot be expressed in S1 as written.
3. PKG-3's supervisor has no single point where an attempt is ended as fallen, or reaching it
   needs a change to PKG-3's interfaces or to PKG-2's library.
4. A client's `effort.note` would need a field or a key the PKG-1 registry grammar does not have.
5. The validator rejects a tracked `.ai/SIGNALS.md` or the new manifest entries.
6. The suite is red before your first edit.
7. Any edit outside Allowed paths would be needed.
8. A new idea or an unresolved design question arises, for example the maturity ladder, automatic
   grouping, a description field or new signal types. It becomes a finding (a candidate, cap 5, or
   a question to the owner) and never widens this package.

## Evidence and closing steps

1. Start your own session: `node .ai/bin/protocol-session.cjs start --agent <name>`.
   - Line 1: `Launch: model=<id> effort=<value|unknown> client=<client>`.
   - Line 2: `Orientation: <model> @ task:ownerideas-pkg-5 (parent program:ownerideas-revision):
     executor E2 | success=PKG-5 AC-1..AC-15`.
2. Write a checkpoint line after each of S1-S9.
3. At the end: `git diff`, then a five-label entry listing each AC, the import SUMMARY and the
   SKIPPED lines. Do not write new `Signal:` lines into your journal after the import: use `add`.
4. Run `record --owner <owner>` (full) and report the exit codes.
5. Last chat message: a short report to the owner in Russian.
