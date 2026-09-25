# Study B — researcher prompt: an adaptive policy for the depth of agent execution

- Frame `task:research-b`. Your one role: researcher (ROLE-researcher, draft). You propose; you
  certify, decide and change nothing. Mode: ADVISORY. Directives: PROTO-DEC-0066.
- Author: `claude-opus-5-5` (coordinator), 2026-09-25. Baseline `4ded1be`, working tree dirty.
- Owner's words: `docs/research/2026-09-25-improvement-research/BRIEF.md`. Read its index, then
  O-02 in full: it is your specification, including the required result and the critical limits.
  Also read O-03 section 11 and O-07. Where this prompt and the brief differ, the brief wins,
  except for the limits in section 3, which come from accepted decisions.

## 0. Before anything

1. `git rev-parse --show-toplevel` prints your job's working copy: a directory `colabs-research/<job>-...` under the
   system temp directory, a private clone of the checkout that the launcher made for this job
   (PROTO-DEC-0070, R-L3-004.9). Your outputs and journal are copied back when you finish. If it
   prints anything else, stop and report.
2. `node .ai/bin/protocol-session.cjs start --agent <the agent name of your job file>`; use the owner
   name it prints for your journal.
3. Journal line 1: `Launch: model=<id> effort=<value|unknown> client=<client>` (the values you run with).
4. Journal line 2: `Orientation: <model> @ task:research-b: researcher | rights=read, measure, write own files | limits=section 3 | tools=<what you have> | success=section 5 | tier=T6`
5. Do not open other researchers' files under `B/` until both of yours are written. Say so in your
   journal when you finish.

## 1. Question

The main question of O-02: how should Colabs build an adaptive policy in which the task type sets
a base frequency F1-F5, risk and complexity escalate the depth, the execution pattern sets the
number and roles of independent agents, and the models are chosen separately through P-L2-002?
The five entities stay separate: task classification, frequency, risk, execution depth, model
ranking. F1-F5 is not importance.

## 2. What already exists (read it; the policy must fit it or say where it cannot)

- Model choice: `docs/core-arch/stage-2/P-L2-002-model-selection.md` (tiers T1-T9, rubric, floors),
  `docs/core-arch/stage-4/MODEL-MATRIX.md`, and the rubric trial
  `docs/core-arch/stage-2/trial/P-L2-002-rubric-trial.md` (signals S-1 to S-5).
- Roles and independence: `docs/core-arch/stage-2/roles/`, `P-L1-002-independence.md`
  (R-L1-002.3 and R-L1-002.4: checks by risk), `WORK-CYCLE.md`.
- Cycles: `docs/core-arch/stage-1/trial/S-003-research-cycle.md`, `.ai/docs/PAIRED-CYCLE.md`, and the
  plan for layer L2 in `docs/core-arch/CORE-ARCH-4.md` (S-001 task lifecycle, triage, escalation
  P-L2-005, audit P-L2-007, pipelined review P-L2-009). Your policy is the input for that design.
- Decisions: PROTO-DEC-0038 (review scaled by blast radius), 0041 items 1-2, 0046 item 6, 0047
  items 1-6, 0049 item 1, 0052, 0053, 0056 item 2, 0057 items 2-4, 0059 (floors).
- Evidence on what depth has bought: the findings ledgers `docs/reviews/*findings*.md` (who found
  what, in which round), `docs/reviews/2026-09-20-codex-cycle-history-research.md`,
  `docs/research/2026-09-20-cycle-history/` (`evidence.json`, `analyze.cjs`),
  `docs/research/2026-09-20-cycle-architecture/claude-final-decision.md`, and the routing study
  `docs/research/2026-09-23-routing/` (Q01, Q02, Q05, Q08, Q10, Q14 above all).
- Your inventory starts from `git ls-files`; say in your journal which of these you could not read.

## 3. Limits (accepted decisions)

- Write only your two files under `B/` and your own journal. No edit to the kernel, `.ai/`,
  `docs/core-arch/`, shared documents or `OwnerIdeas/`. No commit. Install nothing.
- The policy may escalate freely. It may not go below a recorded floor. Three such floors:
  - two parallel independent certifiers for high-risk work (R-L0-05, PROTO-DEC-0041 item 2);
  - the full prompt-and-report review for protocol core (PROTO-DEC-0038 item 1);
  - T7 for a kernel change or a certification (PROTO-DEC-0059 item 2).

  Where your analysis says a floor costs more than it buys, keep the floor in the policy and write
  the case as a separate proposal for the owner, naming the block.
- Label claims FACT (with a `path:line` you opened or a count you ran), CLAIM or HYPOTHESIS. A
  number about cost, latency or defects found comes from the repository's records with its
  source, or it is an estimate and says so. Do not quote other reports' prose; cite `path:line`.
- Never write keys, tokens or passwords.

## 4. Method

1. Collect every task type of O-02 and every type the repository shows was actually run (reviews,
   certifications, research rounds, audits, syntheses, fix rounds, dispatches). Normalise into
   functional classes as O-02 asks: merge duplicates, keep different methods apart, add missing
   useful types, no class for its own sake.
2. Assign F1-F5 by how often a method should be considered in a normal lifecycle, never by
   importance. Justify each assignment.
3. Evaluate every execution pattern O-02 lists, plus any you find, per class: what it catches,
   what it costs in agent calls, latency and tokens, and when it has paid off here. Use the ledgers
   to count where a second independent pass found a defect the first missed.
4. Build the escalation rules from the modifiers of O-02 with explicit triggers, including
   escalation after execution (disagreement, failed test, low confidence), each with a stop:
   escalation also has a budget (R-L0-11). Then de-escalation, only where justified, never below a
   floor.
5. Link to P-L2-002. The pattern sets roles and counts, and P-L2-002 sets model and effort per
   role. Say whether the tier rubric and the F-level overlap, and where one should feed the other
   without merging them.
6. Estimate the effect on latency, cost, tokens, quality, correctness, errors and needless agent
   calls against how the repository has actually been run. Every estimate carries its basis.
7. Propose how it fits Colabs: which kernel layer and record would hold each part (the task
   classifier, the frequency table, the escalation rules, the pattern catalogue), and what can be
   a deterministic script rather than a model's judgement (PROTO-DEC-0045 item 6).

## 5. Outputs (file names use your model id)

- `B/<model>-taxonomy.md`: the table of all task types. Columns: type, functional class, base F,
  justification, default pattern, escalation triggers, roles, allowed parallelism, independent
  review (yes/no/when), synthesis (yes/no/when), certification (yes/no/when), source of the type
  (owner list, repository `path:line`, or added by you).
- `B/<model>-policy.md`, at most 250 lines. Header: SHA, tree state, model and effort as launched,
  client, date UTC. Then items 2 and 5 to 10 of the O-02 required result:
  - functional classes;
  - the matrix task class × F-level × risk → pattern;
  - escalation and de-escalation rules;
  - the link to P-L2-002;
  - the impact estimates;
  - the proposal for Colabs;
  - the floors kept, and any separate proposal against a floor;
  - open questions for the owner.

## 6. Journal and hand-off

- One checkpoint line per method step; `Signal:` lines for procedure gaps you meet.
- More than five minutes with no reading, writing or reasoning is a stall (PROTO-DEC-0049 item 3).
- If your context runs short, finish the file you are on, mark in it what is incomplete, and hand
  off. Never leave an unmarked partial file.
- End with a complete five-label entry, then
  `node .ai/bin/protocol-handoff.cjs record --quick --owner <your owner name>` (the validator only; PROTO-DEC-0071).
