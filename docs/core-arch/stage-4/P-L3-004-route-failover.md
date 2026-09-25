---
id: P-L3-004
version: 0.5
title: Route failover - the maker's CLI first, Kilo as the fallback router, liveness before any switch
layer: L3
type: procedure
status: trial
roles: [coordinator, dispatcher]
stages: [dispatch, execute]
triggers: [dispatch, route-failure]
inputs: [task-frame, docs/core-arch/stage-4/MODEL-MATRIX.md, docs/core-arch/stage-4/kilo-routes.json]
outputs: [journal, signals]
back_edges: [4>2/1/owner]
enforcement: S~
enforced_by: [docs/research/2026-09-25-improvement-research/prompts/launch.cjs]
script_candidate: yes
evidence_class: [B, C]
evidence: [PROTO-DEC-0049, PROTO-DEC-0050, PROTO-DEC-0065, PROTO-DEC-0067, PROTO-DEC-0068, PROTO-DEC-0070, docs/research/2026-09-24-remediation-mapping/prompts/launch-round2.cjs:11]
cost_basis: unknown
trial: metric=M-007; kill=a working agent stopped as hung, or two executors live on one task; until=CORE-ARCH package I-a
---

# P-L3-004 Route failover

Draft 0.1 of a CORE-ARCH stage-4 record, put into trial use by the owner on 2026-09-25
(PROTO-DEC-0067). `S~`: the launcher of the improvement research implements it; the kernel
dispatch script of PROTO-DEC-0050 item 4 takes it over when it is written.

## Purpose

A task is launched with a model and an effort chosen by P-L2-002. The route to that model can
fail: limits run out, authorisation lapses, a provider is down. This procedure decides when a
route has failed, which route replaces it, and when no automatic replacement is allowed. The
two costs it balances are killing a long but working agent, and losing time on a dead one. A
third cost it never accepts is two executors doing one task.

## Rules

- R-L3-004.1. The primary route of a model is its maker's official CLI as the model matrix
  records it. A maker without a CLI has the route the matrix names (DeepSeek: Kilo, with the
  owner's own key).
- R-L3-004.2. When the primary route is unavailable, Kilo is the fallback router. Within Kilo, the
  cheapest suitable route of the same model is taken, by output price and then input price, as
  the recorded Kilo catalog gives them. Ties go to the maker's own provider, then alphabetically
  by provider (the tie-break is the implementer's proposal, not the owner's words).
- R-L3-004.3. A route is suitable when:
  - its model is active and can call tools;
  - it can set the effort of the tier. That is the level the primary cell names or, failing that,
    the lowest higher level the route offers, which counts as a stronger route.

  A route that cannot reach the level, or cannot set any effort when the cell names one, is not
  suitable. Only pinned model ids are used: no `-latest` aliases, no `-fast` or `-pro` serving
  variants. Where the primary cell's effort is unknown, the level is the tier's position (minimum,
  middle, maximum) in the route's own list, by PROTO-DEC-0059 items 3-4.
- R-L3-004.4. An automatic switch happens only on a hard failure before useful work. There is
  exactly one automatic Kilo attempt; if it fails as well, the task stops and goes to the owner.
- R-L3-004.5. Once useful work has started, no other executor is started automatically. Useful
  work means a file or journal of the task changed, or substantial output appeared. The state is
  saved, the process is stopped if it is hung, and the owner decides.
- R-L3-004.6. Silence is judged by the liveness signals, with a soft and a hard timer. Both are
  configurable, and any progress resets both.
- R-L3-004.7. A task never has two live executors. A new route starts only after the previous
  process tree is confirmed gone, and a running record blocks a second start. A start is refused
  while the previous watchdog lives, or while any process the job's record names is alive by
  identity (each attempt's root and recorded descendants, and their children), whatever state the
  record was left in: a dead watchdog does not release the job. Running the
  primary and the fallback in parallel needs an explicit owner decision. A process is
  identified by its PID together with its creation time, and nothing is stopped by a PID alone:
  Windows reuses PIDs, and the parent id of a live process can name a long-dead parent. A tree is
  stopped leaf first: each descendant by its PID only right after its identity was confirmed in a
  fresh process table, the root through the dispatcher's own child handle, and never by a tree
  kill that selects children by parent linkage (`taskkill /T`). The tree is first recorded one and
  three seconds after the spawn, then on every tick. A watchdog that died before its attempt
  settled blocks every new start until the owner's stop settles that attempt, because processes it
  never recorded cannot be named later by any process table; the stop warns when the attempt was
  never scanned (CB-17).
- R-L3-004.8. The total cap of PROTO-DEC-0050 item 2 stays. Reaching it saves the state and goes
  to the owner; it never starts another route.
- R-L3-004.9. Isolation and scope (PROTO-DEC-0070). The owner named the terms; this mechanism is the
  implementer's reading of them.
  - The copy. Each attempt runs in a disposable private clone of HEAD (`git clone --shared`)
    under `<system temp>/colabs-research/`, with the research package copied in, and that clone is
    the executor's working directory. A clone, unlike a linked worktree, shares no config, refs or
    hooks with the checkout. It has no remote.
  - Push. The rule `url.no-push://blocked.insteadOf` with an empty value is set in the executor's
    environment and in the clone's own config. It blocks every direct URL form: existing remotes,
    added remotes, explicit URLs, explicit push URLs and typed URLs. A network fetch fails too.
    A longer `url.*.insteadOf` given through `-c` (command scope) or an ambient file supersedes
    it (longest prefix wins). `GIT_CONFIG_NOSYSTEM=1` and an empty launcher-owned
    `GIT_CONFIG_GLOBAL` remove the ambient-file source. The `-c` form remains a residual that only
    the audit covers.
  - Credentials, Level 1 (PROTO-DEC-0077 item 3). The executor's environment is built without git
    credential vectors: `GH_TOKEN`, `GITHUB_TOKEN`, `GIT_ASKPASS`, `SSH_ASKPASS`,
    `SSH_AUTH_SOCK`, and `*_TOKEN` and `*_PAT` names that mention GH, GITHUB or GIT. It also gets
    an empty `credential.helper`, `GIT_TERMINAL_PROMPT=0` and `GCM_INTERACTIVE=never`. Model
    clients keep their own keys in their config files.
  - Git mode, default-deny. Each job's `git: {mode, target?, publishRequired}` is read only from
    `prompts/jobs.json`, never from the job. `READ_ONLY` runs. `LOCAL_COMMIT` needs an
    authorisation naming the decision that permits commits; none exists today. `BRANCH_PUSH` and
    `RELEASE_PUSH` fail closed with "publisher not implemented". No publisher exists.
  - Audit, never enforcement. Before and after every attempt, the launcher records `git ls-remote`
    of each remote configured in the checkout (the owner's repositories only, L-1). A change in a
    no-push mode is an incident: it invalidates the attempt, nothing is copied back, and the clone
    is kept. The audit is blind to:
    - a transient push that is reverted;
    - an after-query that fails, which is recorded as `unverified`, not as an incident;
    - webhook and CI side effects;
    - remotes outside the configured list.
  - The scope check. It runs on every tick and again before the copy back. It compares the working
    files, HEAD, every ref, the clone's config and its hooks with the state at preparation. Any
    change other than the job's outputs and new journals stops the job at once (`SCOPE_STOP`).
  - The launcher's own git calls run with `core.fsmonitor=false` and, per call, `core.hooksPath` set
    to a random path that does not exist, under a private temp directory. No hook file exists to
    run (F-3P-2). An adversarial job that predicts the path inside the call window is outside the
    threat model.
  - `index.lock`. A held lock makes the state unreadable. The read retries 5 times over about 4 s.
    If the lock persists and a git process works in the copy, the tick waits for the next scan. If
    none does, the attempt stops with "stale index.lock", nothing is copied back, and the clone is
    kept. The lock is never deleted.
  - The job table is `prompts/jobs.json` (PROTO-DEC-0073), with a strict loader: unknown keys or a
    missing field fail closed.
  - The copy back. When the tree is gone, only the job's outputs and new journals are copied back
    into the checkout.
  - What the check does not read. Git-ignored paths (`.ai/runtime/`, scratch) are not read. They
    are never copied back and are deleted with the clone.
  - Lifecycle. A settled clone is deleted. A clone kept by `SCOPE_STOP`, or left by a watchdog
    that died, stays under `<system temp>/colabs-research/` until the owner removes it.
  - vibe runs with `--trust`, which only skips the trust prompt for the clone. It adds no tool.

## Steps

1. **Resolve** (dispatcher). Take the task's primary route from the model matrix. Then order the
   Kilo candidates from `kilo-routes.json` by R-L3-004.2-3, each with its effort level or the
   reason it is unsuitable.
2. **Launch** (dispatcher). Start the route with one fixed ASCII line naming a prompt file
   (PROTO-DEC-0050 item 2). Record the route, the level, the process id, and a baseline of the
   task's files and the agent's journals.
3. **Watch** (dispatcher). Every tick, read the liveness signals and apply the state table below.
4. **Fail over** (dispatcher). On `FAILED_EARLY` of the primary, confirm the process tree is gone,
   then start the first suitable Kilo candidate once (back edge `4>2/1/owner`).
5. **Hand off** (dispatcher). Every other terminal state writes a snapshot and asks the owner:
   `NEEDS_OWNER`, with the reason, the files changed and the log path.

### Liveness signals

| # | Signal | Counts as progress | Counts as useful work |
|---|---|---|---|
| L1 | the process is alive | no, it only allows waiting | no |
| L2 | bytes of stdout and stderr | growth with at least one new line that is neither an error text nor a retry notice | 16 KB or more in total, while the log carries no error text |
| L3 | the client's own log files, where the client writes them | any growth, except in a tick whose new L2 lines are all error or retry lines | no |
| L4 | the task's output files (size, time) | any change | any change |
| L5 | journals of the task's agent created after the launch | creation or growth | creation |
| L6 | CPU time of the process tree | 0.5 s or more per tick | no |
| L7 | the set of child processes | a command started or ended | no |

A hard failure is one of:
- a non-zero exit before useful work;
- an exit without useful work;
- before useful work, an error text in L2 followed by soft silence. The error texts are: the
  status codes 401, 403, 429, 500, 502, 503, 504 and 529, but only after an HTTP, status, error or
  code word or before their reason phrase (a bare number is normal output); authorisation
  errors; a rate limit, quota, credit or usage limit reached; a model not found or unavailable;
  network, provider and overload errors (`ERROR_TEXT` in the launcher, probes in its self-test).

### Timers (defaults; the launcher takes other values as options)

| Timer | Default | On expiry | Source of the value |
|---|---|---|---|
| soft | 150 s without progress | inspect: record alive, CPU, children and the last log lines; no switch | the owner's "2-3 min" (O-11) |
| hard | 480 s without progress | before useful work: hard failure; after it: `HUNG` | the owner's "7-10 min" (O-11) |
| cap | 360 min for a researcher, 180 min for a synthesiser | `OVER_CAP` | implementer's proposal; PROTO-DEC-0050 item 2 names a cap but no value |
| tick | 15 s | read the signals | implementer's proposal |
| smoke | 180 s per probe (launcher `--smoke`) | the probe counts as failed | implementer's proposal |

### State table

`SUSPECT` is one state with two phases: before useful work and after it. Every transition the
launcher makes is a row (CB-15).

| State | Event | Next |
|---|---|---|
| (not launched) | the owner's stop request is already recorded | `NEEDS_OWNER`, nothing launched |
| `STARTING` | useful work | `WORKING` |
| `STARTING` | soft silence, no error text | `SUSPECT` (inspection recorded) |
| `STARTING`, `SUSPECT` before useful work | hard failure (an exit without useful work, error text with soft silence, or hard silence) | `FAILED_EARLY` |
| `SUSPECT` before useful work | progress, still no useful work | `STARTING` |
| `SUSPECT` | useful work, or progress after useful work | `WORKING` |
| `WORKING` | soft silence | `SUSPECT` (inspection recorded) |
| `SUSPECT` after useful work | hard silence | `HUNG`: stop the tree, snapshot, `NEEDS_OWNER`; FALLEN without wakes (see "Divergence") |
| `WORKING`, `SUSPECT` after useful work | exit 0, all outputs present | `DONE` |
| `WORKING`, `SUSPECT` after useful work | exit 0, outputs missing | `INCOMPLETE`, then `NEEDS_OWNER` |
| `WORKING`, `SUSPECT` after useful work | exit not 0 | `CRASHED`, then `NEEDS_OWNER` |
| `FAILED_EARLY` | primary, a suitable Kilo route, no automatic switch yet, tree confirmed gone | `STARTING` on that route |
| `FAILED_EARLY` | otherwise | `NEEDS_OWNER` |
| any running state | cap reached | `OVER_CAP`: stop the tree, snapshot, `NEEDS_OWNER` |
| any running state | the owner's stop request | `STOPPED`: stop the tree, no fallback, `NEEDS_OWNER` |
| (not launched) | the clone cannot be created | `NEEDS_OWNER`, nothing launched |
| any running state, or any end state before the copy back | a change outside the job's scope in its clone, a moved HEAD, a changed ref, config or hook | `SCOPE_STOP`: stop the tree, copy nothing back, keep the clone, `NEEDS_OWNER` |
| (dead watchdog) | a start while the last attempt never settled | refused until the owner's `--stop` settles it |

When the hard timer is less than one tick above the soft timer, `WORKING` can reach `HUNG` in one
tick without a recorded `SUSPECT`; the launcher requires soft below hard, not a tick apart.

## Stop conditions

- Every `NEEDS_OWNER`. The owner may start a named route explicitly. Where outputs already exist,
  the dispatcher requires an explicit takeover by the owner (R-L3-004.7).

### Divergence from PROTO-DEC-0051 item 4 (CB-22)

PROTO-DEC-0051 item 4 wakes a stalled agent up to three times, by resuming its session by id,
before it records FALLEN. This launcher resumes no session by id, so `HUNG` stops the tree at
once. Under that item this is the case of a client that cannot resume by id: `HUNG` counts as
FALLEN on the first stall, the launcher's reason says so, and the owner records a `Signal:` line
of type fall until the signals ledger exists. The kernel dispatch script of PROTO-DEC-0050 item 4
implements the wakes and does not inherit this path.

## Back edges

- `4>2/1/owner`: one automatic relaunch on the first suitable Kilo route; a second failure goes to
  the owner (PROTO-DEC-0050 item 2).

## Evidence

- B - agents lost attempts to hand-quoted commands and to silent stalls; the one-line prompt file
  and the idle exit were introduced for that (`launch-round2.cjs:11`, PROTO-DEC-0049 item 3,
  PROTO-DEC-0050 item 2). Clients set model and effort differently (PROTO-DEC-0065 item 2).
  Cost unknown.
- C - the owner's failover policy and route order of 2026-09-25 (PROTO-DEC-0067). The signal
  set, the thresholds and the state table are the implementer's proposal under that policy, and
  so are four values the owner did not name: the price tie-break of R-L3-004.2, the caps, the
  tick and the smoke timeout (the "Source" column of the timer table). They are on trial,
  measured by M-007 and by the kill condition in the front matter; the owner may replace any of
  them.

## Risks

| Risk | Likelihood | Impact | Coverage | Cost | Residual |
|---|---|---|---|---|---|
| A long silent command is taken for a hang | medium | high | CPU and child signals L6-L7 count as progress; hard timer 8 min | slower detection | a command that waits without CPU for more than 8 min |
| A retry loop after a provider error looks like work | medium | medium | log volume is not useful work while the log carries error text; new log lines that are all error or retry lines are not progress (L2, L3), so the loop reaches soft silence: before useful work a hard failure, after it `SUSPECT` then `HUNG` | one soft wait | a loop that is silent on stdout while its client log grows, or that starts a process per retry (L7) |
| An unrelated process is stopped | low | high | identity by PID and creation time; descendants must be younger than their parent | one process-table read per tick | none known |
| An error text appears in normal output before work starts | low | medium | switch only after soft silence as well | one wrong fallback | the owner sees it in the state file |
| The Kilo fallback spends money | medium | low | one attempt; the cheapest suitable route; the owner's own providers first when prices tie | route price | a costly model on its cheapest route |
| Two executors on one task | low | high | R-L3-004.7: confirmed-dead check, running record, a start refused while any recorded process lives or while an attempt of a dead watchdog is unsettled, takeover only by the owner | one process-table read per start | a descendant no scan saw before the watchdog died: the owner's stop cannot name it and warns; under load one process-table read took seconds on Windows, so the first three seconds after a spawn can pass without a record |
| An executor writes outside its scope | medium | high | R-L3-004.9: a private clone per attempt (its config, refs and hooks are its own), a scope check on every tick and before the copy back that covers files, HEAD, refs, config and hooks, only outputs and new journals copied | one clone per attempt, three git calls per tick | a shell command writing by absolute path outside the clone, for example into the checkout itself, is not seen by the check; the owner's `git status` and `git remote -v` after the run and the certifiers' diff review cover it |
| An executor pushes | low | high | the no-push rule in the environment and in the clone's config blocks every direct URL form; the executor has no git credential in its environment (Level 1); the job's git mode is READ_ONLY and push modes fail closed; `ls-remote` before and after each attempt turns a remote change into an incident (L-CORRECTION-4, certified by two certifiers 2026-09-26) | a network fetch also fails; clients that call git lose `user.name` and `safe.directory` | a `-c` `insteadOf` push with credentials reachable outside the environment (OS store, SSH agent, sibling process); a hosting-API mutation; a transient push that is reverted. These are UNPROVED in the hostile suite, and F-3P-1 stays OPEN - HYPOTHESIS UNDER VALIDATION (PROTO-DEC-0077 item 3). Local cooperative mode is assumed |
| A legitimate client file stops a job | low | medium | none: a file the client creates in its working directory (a cache or a config) is outside the scope and stops the job | a relaunch | the reason names the path; the owner decides |

## Change log

- 0.1 — 2026-09-25 — claude-eb97ac9d13050014 — first draft, trial by owner directive (PROTO-DEC-0067); identity by creation time, retry-loop rule and owner stop added after the launcher's test found the gaps — review pending.
- 0.2 — 2026-09-25 — claude-ad7cc4169e888ea8 — review fixes: CB-14 (values the owner did not name are marked as the implementer's proposal), CB-20 (error texts need an error context; missing phrases added), CB-19 (a retry loop is not progress), CB-24 (leaf-first stop by identity, no tree kill), CB-17 (a dead watchdog does not release the job), CB-15 (every launcher transition is a row), CB-22 (the HUNG path is recorded as a divergence from PROTO-DEC-0051 item 4) — second pass pending.
- 0.4 — 2026-09-25 — claude-c73232724159e5bd — second-pass findings of report L: F-L1 (push through an added remote or explicit URL: `insteadOf` rule in the environment and the clone's config), F-L2 (a linked worktree shares config, refs and hooks: a private clone instead, and the scope check reads refs, config and hooks), F-L3 (`--trust` recorded here), F-L4 (ignored paths stated), F-L5 (lifecycle of kept clones stated) — third pass pending.
- 0.5 — 2026-09-26 — claude-c73232724159e5bd — L-CORRECTION-4 (implemented by DeepSeek in 1302554, certified RECOMMENDATION by Gemini and Mistral): R-L3-004.9 gains credentials Level 1, git mode, the `ls-remote` audit, per-call hooks path (F-3P-2), the `index.lock` policy and the job table; the `-c` residual is recorded; push risk row updated. Text from the implementer's response, written by the spec author (L-CORRECTION-4 item 9).
- 0.3 — 2026-09-25 — claude-c73232724159e5bd — CB-17 reopened by a Windows self-test failure (zz-t12, 3/3 runs): early scans, and an unsettled attempt of a dead watchdog blocks starts until the owner's stop; R-L3-004.9 isolation and scope under PROTO-DEC-0070 (disposable worktree, SCOPE_STOP, push blocked); three state rows and two risk rows added — second pass pending.
