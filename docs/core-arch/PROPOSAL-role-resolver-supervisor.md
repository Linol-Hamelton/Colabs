# Proposal: roles, model resolver and execution supervisor

- Author: claude-c73232724159e5bd (claude-opus-5-5), CORE-ARCH implementer. Certifies nothing.
- Date (UTC): 2026-09-25. Baseline: 88376ed. Mode: synthesis of three positions, for the owner.
- Sources:
  - the owner's chat message of 2026-09-25 on dispatch, roles and seniority;
  - another agent's answer to it, pasted by the owner;
  - this session's round-2 and round-3 runs.
- Status per item: AGREED (recorded in PROTO-DEC-0074), FOR APPROVAL, FORK, DISAGREE or ALTERNATIVE.

## 0. What already binds, so nothing is decided twice

- PROTO-DEC-0050 item 2 already requires:
  - every prompt is a file;
  - the agent receives one fixed line, `Read and follow the file <path>`;
  - the command line is assembled by a script from recorded client data;
  - a failed agent is restarted once, and a second failure goes to the owner.

  PROTO-DEC-0073 partly restates this. Its new part is item 2: no prompt or task path inside the
  script.
- PROTO-DEC-0067 and P-L3-004 (trial):
  - the maker's CLI first, then exactly one automatic Kilo attempt (R-L3-004.4);
  - no automatic new executor once useful work has started (R-L3-004.5);
  - liveness by signals, with a soft and a hard timer (R-L3-004.6).

  0067 rejected "unlimited automatic retries across routes".
- P-L2-002 (trial) already picks a model per task from a six-factor rubric (size, protected,
  novelty, reversibility, ambiguity, coupling) and the MODEL-MATRIX cells. It does not hardcode
  models, but its size factor raises the tier by volume.
- Deviation to own up to: the research runner `run-chain.cjs` restarts a STALLED step, including
  after useful work. That goes beyond R-L3-004.5. It is a research tool, not the kernel.

## 1. AGREED (owner, the other agent and this synthesis) -> PROTO-DEC-0074

| Id | Point | Layer |
|---|---|---|
| A1 | The CLI bootstrap stays one pointer line to a file (0050 item 2, confirmed). | L3 dispatch |
| A2 | A task and a schedule name a role, never a model. Steps and slots are named by role; a model name in a slot name ("Fable slot") is a defect. | L1 roles |
| A3 | The model is resolved at launch: a primary and two substitutes. | L2 selection |
| A4 | Seniority follows uncertainty x the cost of an error, not the volume of work. The owner's list (strategy, roadmaps, architecture, high-responsibility synthesis, certification, specifications, audits, hard code, hard debugging) goes to senior models. Bulk implementation from a precise specification goes to a worker model, with the escalation ladder worker -> middle reviewer -> senior hint -> senior fix. | L2 selection |
| A5 | Timeouts are judged by observable progress: files appearing or being written. Waiting without a reason is a defect, not caution. | L3 supervision |

## 2. FOR APPROVAL (the direction is agreed; the concrete rule is new)

| Id | Proposal | Why | Cost |
|---|---|---|---|
| B1 | P-L2-002: size stops raising the tier. It becomes a filter on the model's context window. The tier comes from uncertainty (novelty, ambiguity, coupling) and consequence (protected, reversibility). | A4 says so; today a 20-file mechanical edit scores like an architecture task. | Rubric text and fixtures in the next stage-2 round |
| B2 | A hard ceiling per step, next to the liveness timer. A step whose files keep changing but never finish stops at the ceiling. Until data exists: 3x the median duration of that role in the usage records, or 120 minutes. | A model in a loop can keep writing. | One number per role |
| B3 | Completion = the process ended, plus the exit code captured, plus the declared outputs exist and are non-empty, plus a minimal structural check (header, required verdict line), plus a journal entry with Evidence. An exit code alone never completes a step. | The runners already do most of this; the exit code is not captured yet. | Small |
| B4 | A compact error classification from client output: AUTH, QUOTA/RATE, MODEL_UNAVAILABLE, CONFIG (a flag the model rejects), TRANSPORT, CRASH, STALL, TIMEOUT, INVALID_OUTPUT. Each class maps to one recovery action (section 3). Measured this session: 401 with no key, "model not available", "does not support reasoning effort", an empty exit without a console. | Different failures need different actions. | Regexes per client profile (0050 item 3) |
| B5 | Pin the launch file: the runner refuses a launch file with uncommitted changes and records its blob id. The agent still gets the plain pointer line. | The other agent's version pin, without burdening the agent. | Small |
| B6 | A cost cap per step: the resolver estimates the cost from the usage records and skips cells above the cap. If no eligible cell fits, it asks the owner before the start, not after. | The $50 Fable estimate of this session was caught only by hand. | Needs usage history; USAGE.md starts it |

## 3. FORK: how many automatic attempts, and on which failures

| Option | Rule | Wasted time and cost | Lost partial work | Complexity | Conflicts with |
|---|---|---|---|---|---|
| F-a (owner) | For any failure: primary restarted once, substitute 1 twice, substitute 2 twice, then the owner. | High on failures that cannot heal (auth, config): up to 6 useless launches. | Every restart starts clean. | Lowest | 0050 item 2 (one restart), R-L3-004.4 and .5 |
| F-b (other agent) | An attempt budget; the error class decides how it is spent. | Lowest | Depends on the rules | Medium: needs B4 | same |
| F-c (recommended) | F-a's ladder as the maximum. B4 decides the step: AUTH, CONFIG, MODEL_UNAVAILABLE and QUOTA go to the next substitute at once; TRANSPORT, CRASH and STALL retry on the same route along the ladder. After useful work, resume the same session (copilot `--resume`, kilo `-s`, agy `--continue`) before a clean start. INVALID_OUTPUT gets one repair on the same model with the check's message, then escalates a tier, not sideways. | Low | Kept by resume | Medium | same |

Every option needs a block that supersedes 0050 item 2 (its restart part) and states the change to
R-L3-004.4-5. The one-restart rule was written for hand-run dispatches, before a supervisor
existed.

## 4. DISAGREE, with the argument

- D1: a mandatory heartbeat file written by the agent (the other agent's point 6).
  - Every heartbeat is a tool call, so it costs tokens.
  - Agents skip mandatory steps: the r1-c participant skipped the session start.
  - A looping model keeps writing heartbeats, so a heartbeat proves no progress.
  - Passive signals are free and already observed: the client's event stream (kilo JSON, codex and
    copilot stdout), writes to the task's outputs and journal, and child processes.

  Proposal: passive signals by default. A heartbeat only for a client that emits nothing while
  working.
- D2: "the validator accepts" as a general completion rule for research outputs. A content
  validator per output type is bureaucracy. B3's structural check is enough; content is judged by
  the next reviewer, as now.

## 5. ALTERNATIVES to consider

- E1: tests as the cheapest escalation judge. In the ladder of A4 the senior model writes the
  specification and its acceptance tests. The worker loops until the tests pass. A reviewer model
  is called only when the tests pass but a criterion is not testable, or when the worker fails
  twice. This moves judgement from models to tests.
- E2: the resolver learns from usage records. Each role keeps its cheapest cell that reached DONE
  with no INVALID_OUTPUT and a GOOD or ADEQUATE quality line. The next run starts there and
  escalates only on failure.
- E3: a data format for the schedule. JSON when a script reads it: no parser dependency, and it
  can be checked strictly. Prose stays in a markdown file next to it. The owner allowed either.

## 6. Layer map and timing

- L1: roles. The role catalogue, and slot names by role (A2).
- L2: model selection, P-L2-002. The resolver (A3), seniority (A4), B1, B6, E2.
- L3: execution, P-L3-004 and the dispatch script of 0050 item 4. Supervision (A5), B2-B5, the
  fork, D1, E1.
- Delivery policy (git modes, F-3P-1): a separate layer. Council round 3 is testing it; nothing is
  proposed here.
- Candidate records are not edited now: stage 2 is under review, and a change takes the T7 floor
  (PROTO-DEC-0072 item 3). The changes go into the next stage-2 fix round and the stage-4 dispatch
  script, whichever the owner schedules first.
