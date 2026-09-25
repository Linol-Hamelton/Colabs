---
id: P-L3-004
version: 0.2
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
evidence: [PROTO-DEC-0049, PROTO-DEC-0050, PROTO-DEC-0065, PROTO-DEC-0067, docs/research/2026-09-24-remediation-mapping/prompts/launch-round2.cjs:11]
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
  process tree is confirmed gone, and a running record blocks a second start. Running the
  primary and the fallback in parallel needs an explicit owner decision. A process is
  identified by its PID together with its creation time, and nothing is stopped by a PID alone:
  Windows reuses PIDs, and the parent id of a live process can name a long-dead parent.
- R-L3-004.8. The total cap of PROTO-DEC-0050 item 2 stays. Reaching it saves the state and goes
  to the owner; it never starts another route.

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
| L2 | bytes of stdout and stderr | any growth | 16 KB or more in total, while the log carries no error text |
| L3 | the client's own log files, where the client writes them | any growth | no |
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

| State | Event | Next |
|---|---|---|
| `STARTING` | useful work | `WORKING` |
| `STARTING` | hard failure | `FAILED_EARLY` |
| `WORKING` | soft silence | `SUSPECT` (inspection recorded) |
| `SUSPECT` | progress | `WORKING` |
| `SUSPECT` | hard silence | `HUNG`: stop the tree, snapshot, `NEEDS_OWNER` |
| `WORKING`, `SUSPECT` | exit 0, all outputs present | `DONE` |
| `WORKING`, `SUSPECT` | exit 0, outputs missing | `INCOMPLETE`, then `NEEDS_OWNER` |
| `WORKING`, `SUSPECT` | exit not 0 | `CRASHED`, then `NEEDS_OWNER` |
| `FAILED_EARLY` | primary, a suitable Kilo route, no automatic switch yet | `STARTING` on that route |
| `FAILED_EARLY` | otherwise | `NEEDS_OWNER` |
| any running state | cap reached | `OVER_CAP`: stop the tree, snapshot, `NEEDS_OWNER` |
| any running state | the owner's stop request | `STOPPED`: stop the tree, no fallback, `NEEDS_OWNER` |

## Stop conditions

- Every `NEEDS_OWNER`. The owner may start a named route explicitly. Where outputs already exist,
  the dispatcher requires an explicit takeover by the owner (R-L3-004.7).

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
| A retry loop after a provider error looks like work | medium | medium | log volume is not useful work while the log carries error text; the loop ends in a non-zero exit | one wasted wait | a client that retries forever |
| An unrelated process is stopped | low | high | identity by PID and creation time; descendants must be younger than their parent | one process-table read per tick | none known |
| An error text appears in normal output before work starts | low | medium | switch only after soft silence as well | one wrong fallback | the owner sees it in the state file |
| The Kilo fallback spends money | medium | low | one attempt; the cheapest suitable route; the owner's own providers first when prices tie | route price | a costly model on its cheapest route |
| Two executors on one task | low | high | R-L3-004.7: confirmed-dead check, running record, takeover only by the owner | none | a process that escapes the tree kill |

## Change log

- 0.1 — 2026-09-25 — claude-eb97ac9d13050014 — first draft, trial by owner directive (PROTO-DEC-0067); identity by creation time, retry-loop rule and owner stop added after the launcher's test found the gaps — review pending.
- 0.2 — 2026-09-25 — claude-ad7cc4169e888ea8 — review fixes: CB-14 (values the owner did not name are marked as the implementer's proposal), CB-20 (error texts need an error context; missing phrases added) — second pass pending.
