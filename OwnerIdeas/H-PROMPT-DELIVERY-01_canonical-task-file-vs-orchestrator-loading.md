# H-PROMPT-DELIVERY-01: a canonical task file vs orchestrator loading

- Status: OPEN, a hypothesis that needs testing. It is not a decision.
- Raised by: the owner, in chat on 2026-09-25, after PROTO-DEC-0073. The owner asked what the
  orchestrator's reading of a task file gains, and why the task is not written in the CLI or given
  by the CLI as a link to a file.
- Written by: claude-c73232724159e5bd, at the owner's request.
- Relation: PROTO-DEC-0073 (no prompt or task path inside a script) stays in force. This hypothesis
  can reopen it only through a trigger row in `docs/decisions/REGISTRY.md`.

## 1. What was actually built, so the variants are not confused

- The council's round-3 runner (`tools/run-chain.cjs`) does not load the task text and does not
  inject it.
- On its command line it takes one routing file (`prompts/R3-DISPATCH.json`). That file lists
  which step runs when, on which client and model, and which launch file the step gets.
- To each agent it sends one line: `Read and follow the file <launch file>`. The launch file points
  to the role file, which is the canonical task text.
- So the delivery to the agent is already the CLI link of variant B below. What the orchestrator
  adds is timing: it starts ten steps over hours, in dependency order, unattended.

## 2. The variants to compare

| Id | How the task reaches the agent | Who sequences the steps |
|---|---|---|
| A | the full task text in the CLI message | the owner, by hand |
| B | the CLI message is a link to a canonical task file | the owner, by hand |
| C | B, with an orchestrator issuing the same CLI links on a schedule from a routing file (the current build) | a script |
| D | the orchestrator reads the task file and injects its content into the message | a script |
| E | a single agent session (for example Kilo) issues the CLI links itself, with no script | a model |

## 3. Questions

1. Does an agent follow a linked file as faithfully as inline text? Measure skipped steps: the
   COMMON section 3 start, wrong paths, skipped outputs. The agy participant of r1-c skipped the
   session start under B.
2. What does each variant cost in tokens and in wall time? Consider the link's extra file-read
   calls, the model polling of E, and the zero model cost of C's polling.
3. Auditability and drift. Is the task that ran reproducible from the repository? In A and D the
   text can differ from the file; in B and C it cannot.
4. Does D's injection defeat the independence rules, for example quoting other participants'
   outputs? Does it exceed CLI length limits or run into Windows quoting?
5. What does C's routing file buy over E? Determinism, no model cost for waiting, and restart after
   a crash, weighed against one more artefact to maintain.
6. Is a routing file itself "a task inside a script" in the sense of PROTO-DEC-0073, or only a
   schedule?
7. Where is the break-even? A one-off step may be simplest by hand (A or B), a ten-step unattended
   chain may favour C. Find the number of steps or hours where the answer changes.

## 4. Test design (proposal)

- Take one small council-like chain of 3 to 4 steps and run it under B (by hand), C and E, and
  D if it is cheap to add. Keep the model and the inputs the same in every run.
- Per run, record:
  - the steps completed without owner intervention;
  - the protocol deviations found in the journals (start, Orientation, outputs, Evidence);
  - tokens and credits;
  - wall time;
  - the owner's minutes spent;
  - whether the executed task can be reconstructed from the repository alone.
- Advisory until measured. The measurements go under `docs/research/` and do not become Evidence.

## 5. Observations already on record (2026-09-25)

- Round 2 under E, with a Kilo operator polling by model: done. The operator cost about $0.42 in
  Kilo balance for about 30 minutes.
- Round 3 under C: in progress. Its costs will appear in `round3/USAGE.md`.
- Round 1 under B, launched by hand: one participant skipped the session start, and the owner
  corrected it by message.
