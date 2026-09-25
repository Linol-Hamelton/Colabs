# Round-2 challenge - Copilot on Z2 and Z4

## Header
- Commit SHA: 4ded1bee1c2acf2392fdeededf50935f59138302
- Tree: dirty (uncommitted changes present, per `git status --short --branch`)
- Model/client: Claude Sonnet 5 (model id claude-sonnet-5) / GitHub Copilot CLI
- UTC date: 2026-09-24
- Zones: Z2, Z4
- Commands actually run: `git rev-parse --show-toplevel`; `node .ai/bin/protocol-session.cjs
  start --agent copilot`; grep/view of `.ai/bin/protocol-verdict.cjs`,
  `validate-protocol.ps1`, `.ai/DECISIONS.md` (PROTO-DEC-0046/0047/0048/0049),
  `docs/specs/2026-09-23-executable-rulebook-spec.md`, `.ai/bin/protocol-hooks.cjs`,
  `.ai/bin/protocol-session.cjs`, `.ai/docs/CLI-AGENTS.md`; `Get-ChildItem` (read-only,
  name/size/mtime only) on `.ai/runtime`, `.ai/runtime/metrics`, `.ai/worklog`; probes of
  paths outside the repo (`$env:USERPROFILE\...`, `C:\Users`).
- Note on assignment: this session's injected Roles list does not name Copilot; the task
  file `docs/research/2026-09-24-remediation-mapping/prompts/r2-copilot.md` is the
  owner-provided dispatch for this exact zone pair and is treated as the authorization to
  proceed (AGENTS.md section 9.5, assumption recorded).

Checkpoint R2-00: header and session recorded.

---

## Zone Z2 - challenge of `mistral-z2-budget-scope.md`

### Item Z2-1 (collection-scope edit map, R3-C04 = F-R3-01)
Agreement with Mistral on item Z2-1: fully agree.
FACT confirmed: `docs/specs/2026-09-23-executable-rulebook-spec.md:134-135` records the
collection set as ALL `*findings*.md` files in `docs/reviews/` plus the target ledger.
FACT confirmed: `.ai/bin/protocol-verdict.cjs:729-733` builds `candidateDirs` with three
entries (`root/docs/reviews`, the target's own `docs/reviews` subdir, and the target's own
directory), two of which are not in the spec's set. Option 1 (keep only
`path.join(root, 'docs', 'reviews')`) closes the gap with a one-line change.

### Item Z2-2 (immutability edit map, R3-C05 = F-R3-05)
Agreement with Mistral on item Z2-2: fully agree.
FACT confirmed at `validate-protocol.ps1:999-1013`: every committed block, including
non-last ones, is stored only in normalized form (`$before[$id]`), stripping trailing
newlines and a trailing `---`. FACT confirmed at `validate-protocol.ps1:1026-1046`: the raw
(un-normalized) vs stripped comparison that would catch a blank-line insertion runs only
for `$lastCommittedId`. A blank line inserted inside any non-last block is invisible, as
claimed.

### Item Z2-3 (Option 1 + Option 3 recommendation)
Agreement with Mistral on item Z2-3: agree with reservations.
Both are minimal, spec-conforming, and match the recorded existing round-3 probes cited.
Reservation: Option 3 (raw comparison for all blocks) adds a regex pass on every block on
every `validate-protocol.ps1` run, against a `.ai/DECISIONS.md` already past 2000 lines.
Risk: trigger - continued decision-log growth; likelihood - low (regex replace on markdown
is cheap at this size); impact - negligible; prevention/compensation - none needed now;
cost - zero; residual - revisit only if run time becomes measurable.

### Item Z2-4 (budget-exhaustion procedure proposal)
Agreement with Mistral on item Z2-4: partially agree.
FACT confirmed at `.ai/DECISIONS.md:2021` (PROTO-DEC-0048 item 4): the exhaustion is
recorded at **attempt 2**, not attempt 3 ("RC-immutability-boundary, attempt 2 ... is
recorded as an accepted exception. No third attempt is opened."). Correction: Mistral's
procedure (new file, manual owner/certifier steps) does not answer the Round-2 lead
question directly. I checked the code:
- `checkStopRule` (`.ai/bin/protocol-verdict.cjs:628-694`) only inspects `attempt` numbers,
  never `disposition`. Its sole trigger is `maxAttempt >= 3` (line ~688). It **can** already
  emit a terminal machine state by itself (`exitCode: 1`, stdout `STOP RULE TRIGGERED (exit
  1):` naming the root cause, its attempts and dispositions, plus the fixed line "Rule
  requirement: stop and return the area or the premise to the owner, not open another
  round." — verified verbatim at `protocol-verdict.cjs:767-775`), but **only after a third
  attempt row already exists in the ledger**. It cannot pre-empt the opening of a third
  attempt, and it cannot recognize a budget as "exhausted" at attempt 2, because attempt 2
  with a `confirmed`/`unresolved` disposition looks identical to any other in-progress
  attempt-2 row.
- The ledger grammar already has the field the fix needs:
  `docs/specs/2026-09-23-executable-rulebook-spec.md:75` lists `disposition` values
  including `deferred-by-owner`, which is exactly the state PROTO-DEC-0048 item 4 records
  for R3-C05. `checkStopRule` does not currently special-case it.
- Correction to the deliverable: extend `checkStopRule` so that when the highest recorded
  attempt for a root-cause carries `disposition: deferred-by-owner`, it emits its own
  terminal state (e.g. a third exit code, say `3`, distinct from the existing `1`/`2`,
  with stdout naming the root cause as "closed by owner exception, no further attempt
  authorised") **without waiting for attempt 3 to appear**. This is a smaller, more
  targeted change than Mistral's manual procedure, reuses an existing grammar field, and
  answers the Round-2 lead's question with a concrete "yes, with this one addition."
- Risk of the correction: trigger - a reviewer sets `deferred-by-owner` prematurely, before
  the owner actually decided; likelihood - low, the disposition is reviewer-written, not
  script-inferred, so the check is only as good as the ledger entry, same trust boundary
  as every other disposition value; impact - a root cause is closed to further attempts
  when the owner did not intend it; prevention - the same rule PROTO-DEC-0048 item 4 states
  in prose, that only an owner decision (via PROTO-DEC-0049 item 2 grammar, once it exists)
  may set that disposition; compensation - `docs/decisions/REGISTRY.md`'s trigger-row
  requirement already gates reopening; cost - none beyond the code change; residual - the
  check enforces a machine state, the authorization to write that state stays a human
  process concern, unchanged from today.

### Item Z2-5 (`.ai/PLAN.md` at cap; proposal location)
Agreement with Mistral on item Z2-5: disagree.
FACT confirmed at `.ai/DECISIONS.md:2021` (PROTO-DEC-0048 item 4, exact text): "It is
designed as a proposal in `.ai/PLAN.md` and certified before use." The decision names
`.ai/PLAN.md` explicitly, not a new file. Mistral's own report also states `.ai/PLAN.md`
is at its 200-line cap (AGENTS.md section 8). These two facts conflict, and Mistral
resolves the conflict unilaterally by picking a location the decision does not name. The
Round-2 lead is right to flag this: `.ai/ARCHIVE.md` is append-only cold history, not a
home for an active proposal awaiting certification, and a new
`docs/research/.../PROPOSALS.md` is neither `.ai/PLAN.md` nor a decision-registry path.
Correction: this is a genuine `.ai/PLAN.md` capacity conflict that only the owner can
resolve (raise the cap for this one case, trim PLAN.md first, or explicitly authorize a
different path) — it is not a call any zone report can make FOR the owner. I carry this to
Round 3 as an open question rather than a corrected deliverable.

### Risk-register items Z2-R01..R04
Agreement with Mistral on item Z2-R01: fully agree (Option 1 narrows to spec; a
non-conforming ledger in `scratch/` is the defect, not the fix).
Agreement with Mistral on item Z2-R02: fully agree (append-only already forbids the
triggering edit).
Agreement with Mistral on item Z2-R03: partially agree. FACT checked: PROTO-DEC-0048 item
7 caps *code/kernel* streams at two (`.ai/DECISIONS.md:2029`), but the budget-exhaustion
procedure is a *research/proposal* stream, which item 7 explicitly exempts ("The limit
does not apply to research, heuristic discussion, or the development of concepts, plans
and proposals."). So concurrent research streams are not capped at 2, weakening the
stated prevention; the residual risk is slightly higher than "low" for research-heavy
exhaustion clusters, though still bounded by reviewer attention.
Agreement with Mistral on item Z2-R04: fully agree (prefix comparison is explicitly
audit input only, not implemented).

### Answer to the Round-2 required Z2 question
Can `checkStopRule` close the cycle as failed by itself when a budget is exhausted?
**Partially, as written; fully with one small addition.** Today it self-emits a terminal
FAIL state (exit 1, "STOP RULE TRIGGERED", naming the root cause/attempts/dispositions,
plus the fixed instruction to stop and return the case to the owner) but only once a
*third* attempt row exists — it is a detector, not a preventer, and it never inspects
`disposition`. It cannot, by itself, close an attempt-2 exhaustion like R3-C05 (which
PROTO-DEC-0048 item 4 records as closed at attempt 2, never reaching 3). Adding a
`disposition === 'deferred-by-owner'` branch (see Z2-4) would let it emit that terminal
state at the correct point without a third attempt ever being opened, with output of the
same shape as today's `STOP RULE TRIGGERED` block, just keyed off disposition instead of
attempt count and using its own exit code so callers can distinguish "hard stop rule" from
"owner-accepted exception."

Checkpoint R2-Z2: zone complete.

**Carry to Round 3**: Z2-1, Z2-2 (both confirmed, minimal, ready); Z2-4's concrete
`checkStopRule` extension (answers the owner's "at once" requirement with code, not
process alone).
**Drop**: Z2-3's Option 3 batching concern is not worth its own workstream at current
`.ai/DECISIONS.md` size; note only. Z2-R03's "low" residual should read "low-medium" but
this is not worth blocking on.
**Owner-only questions**: where does the budget-exhaustion procedure actually live, given
`.ai/PLAN.md` is at its 200-line cap and PROTO-DEC-0048 item 4 names `.ai/PLAN.md`
specifically (raise the cap for this case, trim first, or name a different path)? Should
Z2-4's `deferred-by-owner`-triggered exit code require the same two-certifier
(DeepSeek+Copilot cannot both bind — see PROTO-DEC-0046 item 6, PROTO-DEC-0047 item 4)
review as any other kernel change, or is this small enough for the docs/config path in
PROTO-DEC-0038 item 3 item 2?

---

## Zone Z4 - challenge of `qwen-z4-idle-exit.md`

### Item Z4-1 (identical signal claim across six clients)
Agreement with Qwen on item Z4-1: disagree.
FACT confirmed at `.ai/bin/protocol-session.cjs:6-8` (comment): "Claude and Codex get
their journal and their context from a SessionStart hook... any other agent, without a
hook endpoint, gets nothing: no journal, no injected state, no Stop reminder." FACT
confirmed at `.ai/bin/protocol-hooks.cjs:594` (comment): "Stop runs after every response,"
and `recordSessionMetric` (`protocol-hooks.cjs:614-636`) is called from that same Stop
path, so `.ai/runtime/metrics/sessions.jsonl` grows once per turn **only for clients whose
Stop hook actually fires automatically**, which the same comment names as Claude and
Codex. For agy/Gemini, Kilo, Copilot CLI and vibe, `.ai/bin/protocol-session.cjs stop` must
be invoked explicitly; nothing in this repository wires it to fire per turn. Qwen's
uniform "CLAIM - Yes, through filesystem monitoring" for all six clients overstates this:
the mechanism exists, but is currently a per-turn heartbeat for two of six clients and a
manual/session-boundary-only signal for the other four, unless each CLI wrapper is
separately configured to call `stop` after every turn (unverified; not found in
`.ai/docs/CLI-AGENTS.md`).

Measured (read-only, name/size/mtime only, no content read):
- `.ai/runtime/metrics/sessions.jsonl`: single shared file across all agents, size 25518
  bytes, mtime 2026-09-24 01:56:26 at measurement time.
- `.ai/runtime/<agent>-<id>.json` (session state, one per session, not per turn): sizes
  observed 21604-38413 bytes across `claude-*`, `codex-*`, `copilot-*`, `gemini-*`,
  `deepseek-*`, `mistral-*`, `kilo-*` files; this is a session artifact, not itself a
  per-turn counter — its mtime advances only when `saveState` runs, i.e. on a Stop call.
- `.ai/worklog/*.md`: mtimes are one-per-journal-edit, not one-per-turn; an agent can take
  several turns between journal writes.
- External client transcript paths (`~/.claude/projects/...`, `~/.codex/sessions/`, and
  equivalents for Kilo/Copilot CLI/vibe): **could not be measured**. Every probe outside
  `D:\Colabs` (`$env:USERPROFILE\...`, `C:\Users`) returned "Permission denied and could
  not request permission from user" from this session's shell tool, while the identical
  tool worked normally for paths under `D:\Colabs`. This is itself a FACT worth carrying
  forward: a watchdog built as *this kind of sandboxed agent process* cannot read its own
  or any other client's external transcript directory; it would need to run as a separate,
  unsandboxed process with broader filesystem scope (e.g., an owner-run script, not the
  agent itself).

### Item Z4-2 (watchdog inputs are session-level files)
Agreement with Qwen on item Z4-2: agree with reservations.
The Round-2 lead is right and Qwen's own report does not resolve it: session state and
worklog files are written at session-boundary events (SessionStart, Stop-after-turn for
hook-wired clients only, manual journal edits for others), not as a dedicated per-turn
heartbeat file with a single always-current timestamp. `.ai/runtime/metrics/sessions.jsonl`
is the closest thing to a per-turn signal, and only for Claude/Codex today (see Z4-1).

### Item Z4-3 (kill sequence: SIGTERM/SIGKILL)
Agreement with Qwen on item Z4-3: disagree.
FACT confirmed: `grep` for `SIGTERM|SIGKILL|Stop-Process|taskkill` across `.ai/` returned
no matches — there is no existing process-termination code in this repository to compare
against, so the sketch is unverified against any working implementation. The hosts are
Windows (per this session's own environment and the Round-2 lead). This session's own tool
contract requires `Stop-Process -Id <PID>` for termination and explicitly forbids
name-based or Unix-signal termination; Node's `child_process` on Windows maps
`process.kill('SIGTERM')` to an unconditional `TerminateProcess`, so there is no graceful
SIGTERM step to wait out on Windows the way the sketch assumes (10-second grace, then
SIGKILL). Correction: the exit-code/action list should read as
`taskkill /PID <pid> /T` (or Node's `process.kill(pid)` with no graceful phase) as the only
termination step on Windows, or use each client's own resume flag if one exists, instead of
a two-step POSIX signal sequence.
Risk of the correction: trigger - killing a process tree that has spawned child build/test
processes (the lead's own point 4, unrelated but adjacent); likelihood - medium, given
this batch's own protocol suite spawns subprocesses; impact - orphaned child processes
after `taskkill` without `/T`; prevention - always pass `/T` (or track and kill the full
process tree by PID) as this session's own tooling requires; compensation - a periodic
sweep for orphaned protocol-suite processes; cost - trivial (already the required
pattern); residual - none once `/T` is used consistently.

### Item Z4-4 (false-stall risks and coverage)
Agreement with Qwen on item Z4-4: fully agree.
The long-test-suite and permission-prompt risks are real and match the Round-2 lead
directly: a process waiting on a permission prompt for over five minutes is correctly
named a stall under PROTO-DEC-0049 item 3 (`.ai/DECISIONS.md:2062`, "more than five
minutes with no reading, no writing and no reasoning, zero tokens, is a stall and not a
wait"), not a false stall to be specially exempted — Qwen's own coverage note ("implement
heartbeat... waiting for user input rather than stalled") would need to *not* apply to a
literal blocked permission prompt, since PROTO-DEC-0049 item 3 makes that case a stall by
definition, not an exception.

### Item Z4-5 (Option 1 filesystem-based monitoring, recommended)
Agreement with Qwen on item Z4-5: agree with reservations.
Filesystem monitoring is the right default given the sandbox finding in Z4-1 (no
cross-client transcript access from inside the agent process), but "works across all
clients" is not yet true (Z4-1); the option should be scoped as "works for Claude/Codex
now; needs an explicit per-turn write (e.g., call `protocol-session.cjs stop` or an
equivalent heartbeat write) added to the other four clients' invocation wrappers before it
is uniform," not stated as already uniform.

Checkpoint R2-Z4: zone complete.

**Carry to Round 3**: Z4-1's measured per-client asymmetry (2 of 6 clients have an
automatic per-turn signal today); the sandbox-boundary FACT (external transcript paths are
unreachable from inside this kind of agent process); Z4-3's Windows-only kill-sequence
correction.
**Drop**: the SIGTERM/SIGKILL sketch's specific 10-second grace window — not applicable on
Windows hosts, no working implementation to adapt it from.
**Owner-only questions**: is a heartbeat write added to agy/Kilo/Copilot CLI/vibe's
invocation wrapper in scope for this remediation round, or is Z4 limited to Claude/Codex
until a separate dispatch? Should the watchdog itself run as an unsandboxed supervisor
process (given this session could not read outside `D:\Colabs`), and if so, who owns and
tests that process outside the repository, per AGENTS.md section 2 item 8?

---

## Not verified
- Whether any CLI wrapper (agy, Kilo, Copilot CLI, vibe) calls `protocol-session.cjs stop`
  automatically after each turn; only `.ai/docs/CLI-AGENTS.md` and the two cited source
  comments were checked, not each CLI's own runtime behavior.
- Whether Windows `taskkill /T` reliably reaps every grandchild of a long-running test
  subprocess tree; not executed in this read-only research session.
- The existing round-3 reproduction scripts were not re-run against the Z2-4 correction;
  it is a design proposal, not implemented or tested code.

*Report for Z2/Z4 round-2 challenge. Written by copilot-cff1b8e66362c82f.*
