# PKG-1 ROUTES - one kernel launch path, a verified client registry, a liveness probe

Mode: ADVISORY (a package prompt, not a decision). Author: `claude-b68b3491ee12ebd9` (stage 5-6
resolver), 2026-09-26. Resolution: `../FINAL-RESOLUTION-CLAUDE.md`. The executor implements this
file; it does not redesign it.

## ID

`PKG-1` (program `ownerideas-revision`, stage 8). Items: route stabilization (PROTO-DEC-0079 item
1(1)), A-13, A-14 (spec and new scripts).

## Goal

Replace the two research launch paths (`docs/research/2026-09-25-validator-migration-council/tools/run-chain.cjs`
and `docs/research/2026-09-25-improvement-research/prompts/launch.cjs`) with one kernel dispatch
script. The script:
- reads a dispatch file and a verified client registry;
- probes a route's liveness before it launches;
- runs every attempt in a private clone with the Level-1 environment;
- judges liveness by progress under PROTO-DEC-0075 item 5;
- is covered by tests under `tests/`.

## Scope

In scope:
- the script `.ai/bin/protocol-dispatch.cjs`, its commands, dispatch-file loader, launch sequence,
  liveness watch and failure classification (spec S1-S8);
- the registry `.ai/docs/clients.json` (S2);
- the output schema `docs/specs/bin-output-schema.md` (S9);
- `.ai/docs/CLI-AGENTS.md` section 9 and a pointer line in section 1 (S10);
- tests.

Out of scope, and never implemented here:
- automatic recovery: resume, retry, substitutes and the watchdog wake (PKG-3);
- the resolver (PKG-3);
- run records (PKG-2, PKG-3);
- signals (PKG-5);
- any change to the old runners or their dispatch files;
- switching any running program to the new script.

## Stream and wave

E1, wave W1. It runs concurrently with PKG-2 (E2), whose files are disjoint except for
`protocol-manifest.json` (see Integration conditions).

## Inputs

Read these before writing code. Each is binding where cited.
- Decisions: PROTO-DEC-0047 items 6-9; 0049 items 2-3; 0050 items 1-4; 0051 item 4; 0070 items
  4-7; 0073 items 1-4; 0074 items 1, 5; 0075 items 4-5, 7; 0076 items 1, 3; 0077 item 3; 0079
  item 1.
- `docs/research/2026-09-25-validator-migration-council/tools/run-chain.cjs`: the reference for the
  dispatch-file keys, the client adapters, `needs`/`when`/`fallback`/`accept`, usage writing and
  status.
- `docs/research/2026-09-25-improvement-research/prompts/launch.cjs`: the reference for the private
  clone and the Level-1 environment. The functions are `gitOpts`, `git`, `NO_PUSH`, `gitEnv`,
  `executorEnv`, `parsePorcelainZ`, `workdirState`, `scopeViolations`, `prepareWorkdir`,
  `readStateRetried`, `gitProcessIn`, `scopeCheck`, `importResults`, `lsRemoteSnapshot`,
  `remoteAuditVerdict`, `dropWorkdir`, `procTable`, `tree`, `killExact`, `sameProcess`,
  `takeStartLock`, `startBlockers`, `chunkIsProgress`, `ERROR_TEXT`, `RETRY_TEXT` and
  `checkCommand`.
- `docs/research/2026-09-25-improvement-research/prompts/launch-test.cjs` and
  `launch-fake-client.cjs`: test patterns to port.
- `docs/research/2026-09-26-ownerideas-revision/prompts/DISPATCH.json` and
  `docs/research/2026-09-25-validator-migration-council/prompts/R3-DISPATCH.json`: dispatch files
  the new loader must accept unchanged.
- `.ai/docs/CLI-AGENTS.md`; `docs/core-arch/stage-4/MODEL-MATRIX.md:11-20,108-120` (client
  versions and effort scales, for comparison only); `protocol-manifest.json`;
  `tests/helpers.cjs`; `tests/manifest.test.cjs:68-72`.

## Allowed paths

Create:
- `.ai/bin/protocol-dispatch.cjs`
- `.ai/docs/clients.json`
- `docs/specs/bin-output-schema.md`
- `tests/dispatch.test.cjs`
- `tests/dispatch-fake-client.cjs`
- `tests/fixtures/dispatch/` (non-`.cjs` fixture files only)
- `docs/reviews/2026-09-2?-<your-agent>-ownerideas-pkg-1-audit-prompt.md` (one file)

Change:
- `.ai/docs/CLI-AGENTS.md`: append section 9, and add one pointer line at the end of section 1.
  Nothing else in the file.
- `protocol-manifest.json`: insert entries only (S11).
- your own journal.

## Forbidden paths

Everything not listed above, including:
- the old runners and their tests: `run-chain.cjs`, `launch.cjs`, `launch-test.cjs`,
  `launch-fake-client.cjs`, `jobs.json`, and every `DISPATCH.json`;
- `.ai/bin/*` other than your new script; `.claude/`, `.codex/`, hooks; `validate-protocol.ps1`,
  `test-protocol.ps1`, `setup-ai-protocol.ps1`;
- `.ai/TASK.md`, `.ai/PLAN.md`, `.ai/DECISIONS.md`, `.ai/ARCHIVE.md`,
  `docs/decisions/REGISTRY.md`, `docs/research/FRAMES.md`, `docs/ops/`, `docs/core-arch/`,
  `OwnerIdeas/`;
- PKG-2's files: `.ai/bin/protocol-runrecord.cjs`, `docs/specs/run-record.schema.md`,
  `tests/runrecord.test.cjs`;
- another session's journal.

No commit, tag, push or branch.

## Dependencies

- Starts after stage 7 (DeepSeek pre-check) passes. There is no package dependency.
- PKG-3 builds on this package's script and registry. Keep the internal functions named below
  (S4-S7) and export them through `module.exports` for its tests.

## Required outputs

1. `.ai/bin/protocol-dispatch.cjs` meeting S1-S8.
2. `.ai/docs/clients.json` meeting S2, with one entry per client in S2's list.
3. `docs/specs/bin-output-schema.md` meeting S9.
4. `.ai/docs/CLI-AGENTS.md` section 9 and the section 1 pointer (S10).
5. `tests/dispatch.test.cjs` and `tests/dispatch-fake-client.cjs` covering T1-T19.
6. The `protocol-manifest.json` entries of S11.
7. The audit-prompt file: at most 150 lines, one adversarial probe per acceptance criterion
   (AGENTS.md section 2).
8. A five-label journal entry with a full `record` Evidence block.

## Specification (binding)

### S1 Commands and exits

`node .ai/bin/protocol-dispatch.cjs <command> ...`, Node 22 or later, CommonJS, no npm dependency,
UTF-8 without BOM, LF. The commands:

| Command | Effect |
|---|---|
| `probe [--registry <file>] [--model <id>] [--smoke <prompt-file>] [client...]` | S7 |
| `check <dispatch-file> [--registry <file>]` | parse and validate only; no process, no git write |
| `run <dispatch-file> [slot...] [--registry <file>] [--stall-seconds N] [--hard-seconds N]` | the foreground runner loop until every named slot (default: all) is settled |
| `start <dispatch-file> [slot...]` | the same loop, detached; its pid goes into the state |
| `status <dispatch-file>` | one `SLOT` row per slot |
| `stop <dispatch-file> <slot>` | kill that slot's recorded process tree (`killExact`/`tree`) |
| `accept <dispatch-file> <slot> <reason...>` | record the operator's acceptance, as in run-chain |
| `report <dispatch-file>` | the work-done report (PROTO-DEC-0076 item 3): per slot the route, attempts, state, outputs, and the usage the client printed or why it is missing |

Exit codes:
- 0: done, or nothing to do;
- 1: a refusal the owner or operator can resolve (a missing launch file, a required client absent,
  a registry version mismatch, a slot BLOCKED, a start lock held);
- 2: unknown or malformed input (unknown command, key or flag; grammar violation; unsafe
  character). Unknown input is never guessed.

`--stall-seconds` and `--hard-seconds` exist for tests and the operator. When used they are
recorded in the state.

### S2 Client registry `.ai/docs/clients.json`

The grammar is fixed. Unknown keys exit 2; so do missing required keys and wrong types.

```
{ "schema": "clients/1",
  "clients": { "<name>": {
      "binary": "<command name>", "present": true|false,
      "version": "<text printed by --version>" | null, "verifiedOn": "YYYY-MM-DD",
      "source": "<the commands you ran, e.g. 'claude --version; claude --help'>",
      "command": [ <token or {"if": "<field>", "args": [tokens]}>, ... ],
      "model":  { "how": "flag"|"config"|"post-launch"|"none", "listing": [argv] | null },
      "effort": { "how": "flag"|"config"|"model-id"|"none", "values": [..] | null, "note": "<text>" | null },
      "env": { "<NAME>": "<value>" },
      "resume": { "command": [tokens] | null, "sessionId": "<where the client prints it>" | null, "note": "<text>" },
      "usage": "kilo-json"|"codex-tokens"|"copilot-credits"|"none",
      "failureModes": [ { "pattern": "<JS regex source>", "class": "<S6 class>", "cause": "<text>", "countermeasure": "<text>" } ] } } }
```

- Template tokens: `{message}`, `{model}`, `{effort}`, `{workdir}`, `{title}`, `{logdir}`. An
  `{"if": "effort", ...}` group is emitted only when the route names that field.
- Clients: `claude`, `codex`, `agy`, `copilot`, `vibe`, `kilo`, `kimi`, `mimo`. These are the eight
  adapters of `run-chain.cjs:31-43`, which ran this program's slots (`USAGE.md`).
- Filling rule, per client:
  1. Run `<binary> --version` and `<binary> --help`, plus the listing command where one exists
     (`agy models`, `kilo models`), on the workstation. Record `version`, `verifiedOn` and `source`.
  2. Take `command` from `run-chain.cjs` `CLIENTS`: the same flags, the same order and the same
     permission flags. Replace `--dir`/`-C`/`--workdir`/`--add-dir` targets with `{workdir}`. Add
     the workdir flag from `launch.cjs` `primaryCommand` where run-chain has none (codex `-C`,
     copilot `-C`, agy `--add-dir`).
  3. Every flag in `command` must appear in the `--help` text you recorded. If it does not, go to
     STOP 1.
  4. `env`: `vibe` gets `PYTHONUTF8=1` and `PYTHONIOENCODING=utf-8` (`run-chain.cjs:46`).
     Other clients get `{}` unless their `--help` or a failure mode in the old runners requires
     more.
  5. `effort.how`, from what you observe: `flag` (claude `--effort`, copilot
     `--reasoning-effort`), `config` (codex `-c model_reasoning_effort=`; vibe and kimi thinking
     from config), `model-id` (agy ids such as `gemini-3.8-flash-high`) or `none`. Take `values`
     from `--help`. Never invent a value.
  6. `resume.command`: only a resume or continue form shown by that client's `--help`. Otherwise
     `null`, with a `note` saying so.
  7. `failureModes`: the client-specific failures recorded in the old runners' comments (vibe
     'charmap'; kimi refusing `--auto`; S-10 journal edits after record are a prompt rule, not a
     pattern). Each gets a class from S6.
- An absent binary is recorded with `"present": false` and the rest `null`. That is not a STOP.

### S3 Dispatch file

- Accept every key of `run-chain.cjs:8-10` with the same meaning: `stateDir`, `usageFile`,
  `startLimitMin`, `stallMin`, `runLimitHours`, and per slot `id`, `frame`, `out`, `launch`,
  `needs`, `when {file, notMatch}`, `adopted`, `route {client, model, effort, minBalance}`,
  `fallback`.
- New optional keys:
  - top level: `version` (1) and `hardMin`;
  - per slot: `outputs` (array of repository-relative file paths, merged with `out`), `copyIn`
    (array of paths, default `[launch]`), and `git {mode, publishRequired}`.
- `git.mode` is one of `READ_ONLY` or `LOCAL_COMMIT`. `BRANCH_PUSH` and `RELEASE_PUSH` exit 1
  with "no publisher exists" (`launch.cjs` GIT_MODES comment). The default is
  `{READ_ONLY, false}`.
- Defaults and ranges:
  - `stallMin`: default 10, integer 5-120, otherwise exit 2 (PROTO-DEC-0075 item 5; owner
    question OQ-3);
  - `hardMin`: default 120, integer 10-720;
  - `runLimitHours`: the runner's lifetime, as in run-chain.
- Paths must be relative, with no `..`, no absolute or UNC form and no shell metacharacter
  (`/["%^&|<>']/`, `run-chain.cjs:49`). A violation exits 2. A missing `launch` file exits 1.
- PKG-3 adds resolver keys later. In PKG-1 a slot without `route` exits 1 with
  `ERROR reason=no-route-resolver-not-installed`.

### S4 Launch sequence (one attempt)

In this order. Port each function from `launch.cjs` unchanged unless this list says otherwise.
1. `takeStartLock`: two executors never run on one slot.
2. The route's probe (S7 levels 0-1). On failure no process starts; the attempt ends with class
   `CONFIG_ERROR` (binary absent or version changed) or `MODEL_UNAVAILABLE` (model not in the
   listing).
3. `prepareWorkdir`: a private clone (`git clone --shared --no-checkout`), HEAD detached, remotes
   removed, `NO_PUSH` in the clone config. Put it under `<system temp>/colabs-dispatch/`, not
   `colabs-research/`. Then copy each `copyIn` path from the checkout into the clone.
4. `lsRemoteSnapshot` of the checkout: before.
5. Spawn, with `executorEnv()` plus the registry `env`. The message is exactly
   `Read and follow the file <launch>` (PROTO-DEC-0050 item 2; 0073 item 3). The command comes
   from the registry template and passes `checkCommand` (`launch.cjs:245-250`).
6. Watch (S5) every 15 s until exit, STALL or TIMEOUT.
7. On exit: `scopeCheck` against the slot's outputs.
   - A violation is `SCOPE_STOP`: nothing is copied and the clone is kept.
   - Otherwise `importResults`: the declared outputs plus new journals.
8. `lsRemoteSnapshot` after, then `remoteAuditVerdict`. An `incident` makes the attempt class
   `POLICY_FAILURE`, state BLOCKED. `unverified` is recorded as an audit blind.
9. `dropWorkdir` (not after a SCOPE_STOP).

### S5 Liveness (PROTO-DEC-0075 item 5; 0074 item 5)

- Progress signals, all read in the clone:
  - growth of the attempt log in lines that are neither error nor retry text (`chunkIsProgress`);
  - a change to a declared output;
  - a new or changed journal.
- Useful work: an output or a journal changed, or 16384 bytes of progress output
  (`launch.cjs` DEFAULTS).
- Tick states: `STARTING`, `WORKING`, `STALL` (no progress for `stallMin`), `TIMEOUT` (elapsed
  reaches `hardMin`, whatever the heartbeat), `FAILED_EARLY` (error text before useful work, then
  exit, or 60 s with only error text).
- On STALL or TIMEOUT: kill the recorded process tree and record the class. **No automatic
  recovery in PKG-1.** The slot ends FAILED, or BLOCKED for a policy class. A manual
  `run <dispatch> <slot>` with the slot's `fallback` route stays available, as in run-chain.

### S6 Failure classes (PROTO-DEC-0075 item 4 names only)

Check the registry's `failureModes` for the client first, then this generic table. The table is
tooling, so it lives in code (PROTO-DEC-0073 item 4). Split `ERROR_TEXT` (`launch.cjs:38-45`) by
its alternation groups:

| Class | Source group |
|---|---|
| AUTH_ERROR | 401/403 codes; unauthorized, not logged in, authentication failed, invalid key/token/credentials |
| RATE_LIMIT | 429; rate limit; too many requests |
| QUOTA_EXHAUSTED | quota exceeded/exhausted/reached; insufficient credit/balance/funds/quota; credit balance is too low; usage limit reached; limit reached/exceeded; hit your limit; RESOURCE_EXHAUSTED |
| MODEL_UNAVAILABLE | model ... not found/not available/unavailable/does not exist/unsupported; unknown model |
| NETWORK_ERROR | ENOTFOUND, ECONNRESET, ECONNREFUSED, ETIMEDOUT, EAI_AGAIN, fetch failed, socket hang up, network error |
| PROVIDER_ERROR | 500/502/503/504/529; provider error; service unavailable; overloaded |
| PROCESS_CRASH | non-zero exit after useful work |
| INVALID_OUTPUT | exit 0 with a declared output missing or empty |
| STALL, TIMEOUT | S5 |
| CONFIG_ERROR | S4 step 2; a registry failure mode of that class |
| POLICY_FAILURE | SCOPE_STOP; ls-remote incident; push mode requested |

The bare-number guards of `ERROR_TEXT` stay: "line 503" and "429 tokens" match nothing. When more
than one class matches, the first row of the table wins.

### S7 Probe (a route registry with a liveness probe before dispatch; PROTO-DEC-0079 item 1)

- Level 0: the binary resolves on PATH and `--version` equals the registry `version`. A difference
  prints `PROBE client=<c> state=VERSION_CHANGED` and exits 1, because the registry needs
  re-verification (0050 item 3).
- Level 1: when `--model` is given and the registry has `model.listing`, the id appears in the
  listing output.
- Level 2: only with `--smoke <prompt-file>`, a real one-attempt run of that file through S4. It
  costs tokens and is never automatic.
- `run` performs levels 0-1 before every attempt.

### S8 State, usage and status

- State lives in `<stateDir>/state.json`, which is runtime and untracked: per slot the attempts,
  pids, clone path, class, state and timestamps.
- `usageFile`: the same table and columns as run-chain's `writeUsage` (port `usageOf`). Record
  every attempt, not only the last (BACKLOG S-1). Record wall minutes as end minus start, never
  negative (BACKLOG S-6). The model is the route's model id, never the launch file's name
  (BACKLOG S-6).

### S9 `docs/specs/bin-output-schema.md` (A-14)

Write a spec of at most 80 lines stating:
- every stdout line is `TOKEN key=value ...`, where TOKEN is an uppercase word from the script's
  documented set and a value holding a space is double-quoted;
- the first line of a command names it;
- exits are 0/1/2 as in S1;
- unknown input gives exit 2 with an `ERROR reason=...` row (PROTO-DEC-0049 item 2);
- `class=` takes only the PROTO-DEC-0075 item 4 names;
- a script prints the rows behind its result (PROTO-DEC-0047 item 8).

It applies to `protocol-dispatch.cjs`, `protocol-runrecord.cjs` and `protocol-signals.cjs`. It
lists the ten existing `.ai/bin` scripts as "not yet conforming; retrofit with CORE-ARCH package
II".

### S10 `.ai/docs/CLI-AGENTS.md`

- Append `## 9. Kernel dispatch (source repository only)`, covering:
  - prompts are files;
  - the one pointer line;
  - commands are built only by `.ai/bin/protocol-dispatch.cjs` from `.ai/docs/clients.json`;
  - flags only as verified from `--help`, with version and date;
  - a new failure mode goes into the registry, not only into the run (0050 item 3);
  - every attempt runs in a private clone with the Level-1 environment (0070; 0077 item 3);
  - liveness per 0075 item 5;
  - the old runners are superseded for new dispatches;
  - recovery arrives with PKG-3;
  - it is not installed into host projects until the owner decides.
- At the end of section 1, add one line: "The verified per-client data is
  `.ai/docs/clients.json` (section 9); the table above is the 2026-09-22 snapshot."

### S11 `protocol-manifest.json`

- Insert `.ai/bin/protocol-dispatch.cjs`, `.ai/docs/clients.json` and
  `docs/specs/bin-output-schema.md` into `source`.
- Insert `tests/dispatch.test.cjs` and `tests/dispatch-fake-client.cjs` into `tests`, keeping
  alphabetical order.
- Make it one edit, the last of the package, after re-reading the file. Never rewrite it whole.

## Acceptance criteria

Each one maps to a test (T), a command (C) or a file check (F).

| # | Criterion | Check |
|---|---|---|
| AC-1 | No arguments, an unknown command, or an unknown flag exits 2 with a USAGE or ERROR row | T1, T2 |
| AC-2 | The registry loader: an unknown key, a missing key or a wrong type exits 2; the committed registry loads | T3 |
| AC-3 | The dispatch loader: an unknown key exits 2; an unsafe path exits 2; a missing launch file exits 1; `stallMin` or `hardMin` out of range exits 2 | T4 |
| AC-4 | `check` exits 0 on this program's `DISPATCH.json` and on `R3-DISPATCH.json` (run-chain parity) | T5, C |
| AC-5 | End to end with the fake client: the declared output and the new journal are copied back, nothing else changes in the checkout, and the clone is removed | T6 |
| AC-6 | A write outside the outputs, a commit (HEAD moved), a config or remote change, or a push attempt each ends in SCOPE_STOP or POLICY_FAILURE, with nothing copied and the clone kept | T7-T10 |
| AC-7 | Credential canaries (`GH_TOKEN`, `GITHUB_TOKEN`, `X_GIT_TOKEN`, `SSH_AUTH_SOCK`) are absent from the child environment; `GIT_CONFIG_NOSYSTEM=1` is present | T11 |
| AC-8 | A silent fake client is STALL at `--stall-seconds`; an always-talking one is TIMEOUT at `--hard-seconds`; both process trees are gone afterwards | T12, T13 |
| AC-9 | Each S6 class row is recognised from a sample text, and "line 503" and "429 tokens" are not | T14 |
| AC-10 | `needs` blocks until the dependency is DONE; `when.notMatch` skips as in run-chain | T15 |
| AC-11 | A second `run` of a live slot exits 1 (start lock) | T16 |
| AC-12 | `probe`: a present, an absent and a version-changed fake binary give the right rows and exits | T17 |
| AC-13 | Every stdout line in the tests matches `^[A-Z][A-Z_]*( |$)` | T18 |
| AC-14 | The script source contains no `docs/research/` path, no prompt text, and the pointer template exactly once | T19 |
| AC-15 | Every registry `command` flag appears in the `--help` text recorded in `source` (the executor's own check, listed in the journal per client) | F |
| AC-16 | The validator and the full suite pass on the integrated tree | C |

## Validation commands

```
node --test tests/dispatch.test.cjs
node .ai/bin/protocol-dispatch.cjs check docs/research/2026-09-26-ownerideas-revision/prompts/DISPATCH.json
node .ai/bin/protocol-dispatch.cjs check docs/research/2026-09-25-validator-migration-council/prompts/R3-DISPATCH.json
node .ai/bin/protocol-dispatch.cjs probe
powershell -ExecutionPolicy Bypass -File .\validate-protocol.ps1
powershell -ExecutionPolicy Bypass -File .\test-protocol.ps1
node .ai/bin/protocol-handoff.cjs record --owner <your owner name>
```

Report the exit code each command printed. `probe` may exit 1 when a client is absent or has
changed: record its rows, do not "fix" the workstation.

## Integration conditions

- The W1 gate: the operator runs the validator and the full suite with both streams at rest, then
  each executor's full `record` in turn, then commits PKG-1 path-scoped to its artifact plan.
- No program stage moves from `run-chain.cjs` to this script before PKG-1 and PKG-3 are certified
  and the owner switches it (resolution section 8).
- A-13's first real launch is the operator's act after the W1 gate. It is one smoke dispatch on a
  route the owner names, and its evidence is the operator's journal. The executor does not launch a
  real model.
- `tests/` may not call a network or a real model. The fake client only.

## Risk class and certification route

- **High** (PROTO-DEC-0038 item 1): `.ai/bin/`, `.ai/docs/`, and the launch path of every agent.
- Two parallel independent certifiers outside execution and control: Kimi K2.7 Code HighSpeed and
  MiMo-V2.6-Flash (PROTO-DEC-0086 item 1). They use the audit prompt of output 7 on the frozen
  candidate after stage 12.
- The executor, Claude and DeepSeek certify nothing here (0079 item 6).

## Artifact plan

| Path | Action | Disposition at program closure |
|---|---|---|
| `.ai/bin/protocol-dispatch.cjs` | created | KEEP_ACTIVE (canonical launch path) |
| `.ai/docs/clients.json` | created | KEEP_ACTIVE (canonical client registry, 0047 item 9) |
| `docs/specs/bin-output-schema.md` | created | KEEP_ACTIVE |
| `tests/dispatch.test.cjs`, `tests/dispatch-fake-client.cjs`, `tests/fixtures/dispatch/*` | created | KEEP_ACTIVE |
| `.ai/docs/CLI-AGENTS.md` | changed (section 9, one pointer line) | KEEP_ACTIVE |
| `protocol-manifest.json` | changed (entries) | KEEP_ACTIVE |
| audit-prompt file under `docs/reviews/` | created | KEEP_ACTIVE (review record, immutable; PROTO-DEC-0037) |
| `run-chain.cjs`, `launch.cjs`, `launch-test.cjs`, `launch-fake-client.cjs` | superseded for new dispatches, not edited | TRANSFER (the closures of F-06, and of F-04/F-05, which own them) |

## Executor requirements

| Dimension | Level | Why |
|---|---|---|
| D-IMPL | HIGH | about 1,500 lines of Node ported and merged from two runners |
| D-ARCH | MEDIUM | the structure is fixed here; the module boundaries are left to you |
| D-REV | LOW | |
| D-TERM | HIGH | Windows process trees, git plumbing, detached runners, environment hygiene |
| D-ALGO | LOW | |
| D-EDIT | HIGH | a faithful port of named functions with listed changes only |
| D-DOC | MEDIUM | the S9 spec and the S10 section |
| D-CRIT | MEDIUM | spotting where the two runners disagree, and stopping instead of choosing |
| D-SYN | MEDIUM | one dispatch-file grammar from two |

Minimum tier: **T7** (PROTO-DEC-0059 item 2, kernel change; 0072 item 3). The owner named E1 =
Gemini 3.8 Flash high (0086 item 2), which is Google T9 (`MODEL-MATRIX.md:130`); tiers are
provider-relative (0086 item 5).

## STOP conditions

Block the package, write the finding in your journal and a `Signal:` line (PROTO-DEC-0051 item 5),
and do not decide, when:
1. A flag in a `run-chain.cjs` adapter is missing from that client's current `--help`, or a client
   needs a model or effort mechanism that S2 has no value for.
2. A named `launch.cjs` function cannot be ported without a behaviour change this file does not
   list.
3. `check` rejects this program's `DISPATCH.json` or `R3-DISPATCH.json` because of a key or
   meaning S3 does not cover.
4. The suite is red before your first edit. Report the failing tests; do not fix code you do not
   own.
5. A test would need a network call or a real model.
6. Any edit outside Allowed paths would be needed, including a change to an old runner or to
   PKG-2's files.
7. You find a new idea or an unresolved design question. It becomes a finding: a candidate (cap 5)
   or a question to the owner. It never widens this package.

## Evidence and closing steps

1. Start your own session:
   `node .ai/bin/protocol-session.cjs start --agent <name>`, unless a hook made your journal.
   - Line 1: `Launch: model=<id> effort=<value|unknown> client=<client>`.
   - Line 2: `Orientation: <model> @ task:ownerideas-pkg-1 (parent program:ownerideas-revision):
     executor E1 | success=PKG-1 acceptance AC-1..AC-16`.
2. Write a checkpoint line to your journal after each spec section (PROTO-DEC-0047 item 6).
3. At the end: `git diff`, then a five-label entry (Agent, Action, Result, Next step, Open). The
   entry lists each AC with its result, and each client's `--help` check (AC-15).
4. Run `record --owner <owner>` (full, not `--quick`) and report the printed exit codes.
5. Last chat message: a short report to the owner in Russian.
