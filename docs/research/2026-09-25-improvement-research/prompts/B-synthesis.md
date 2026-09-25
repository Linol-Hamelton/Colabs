# Study B — synthesiser prompt: one execution-depth policy from three

- Frame `task:research-b`. Your one role: synthesiser. You must not be one of the three study-B
  researchers (README dispatch table). You propose; you certify, decide and change nothing.
  Mode: ADVISORY. Directives: PROTO-DEC-0066. Author: `claude-opus-5-5` (coordinator), 2026-09-25.
- Start only when all three researchers' sets exist under `B/` (taxonomy, policy). If one is
  missing or marked incomplete, report it and synthesise the rest; a missing report is pending,
  never agreement (R-L2-S003.6).

## 0. Before anything

1. `git rev-parse --show-toplevel` prints the `D:/Colabs` checkout, or you stop and report.
2. `node .ai/bin/protocol-session.cjs start --agent <the agent name of your job file>`; use the owner name it prints.
3. Journal line 1: `Launch: model=<id> effort=<value|unknown> client=<client>`.
4. Journal line 2: `Orientation: <model> @ task:research-b: synthesiser | rights=read, write one file | limits=section 3 of B-research.md | tools=<...> | success=section 2 | tier=T5`

## 1. Read

`BRIEF.md` (index, then O-02 in full), `prompts/B-research.md` with the sources its section 2
names where you need to check a claim, and the three researchers' files. The limits of section 3
of `B-research.md` bind you too, the floors above all.

## 2. Do

1. One taxonomy. Align the three sets of functional classes; where they differ, choose the
   grouping that keeps different methods apart without adding classes for their own sake, and
   say why. List every task type with the class each researcher gave it.
2. One F-level per class and type. Where the researchers differ by more than one level, show the
   three justifications and decide by the evidence, or leave it to the owner.
3. One matrix of class × F-level × risk → pattern, one escalation rule set and one de-escalation
   rule set. Every rule names its trigger, its stop and its budget, and no de-escalation goes
   below a floor.
4. The link to P-L2-002: how a pattern's roles get their model and effort, and how the F-level
   and the tier rubric relate without merging.
5. The impact estimates side by side, with the basis of each; mark the estimates that no record
   supports.
6. The design input for CORE-ARCH stage 3: what S-001 triage, P-L2-002, the escalation procedure
   P-L2-005 and the audit procedure P-L2-007 would each need to hold. Which parts are a
   deterministic script and which stay a model's judgement.
7. Every place where a researcher proposed going below a floor: the case, the block it names, and
   whether the evidence supports asking the owner.

## 3. Output

- `B/synthesis.md`, at most 250 lines. Header: SHA, tree state, model and effort as launched,
  client, date UTC, the three input sets with their owners. Sections: steps 1 to 7 above, then at
  most ten owner questions. The full taxonomy table may follow the 250 lines as an appendix.
- Label claims FACT, CLAIM or HYPOTHESIS. Do not quote the researchers' prose; cite `path:line`
  (PROTO-DEC-0048 item 3). Never write keys, tokens or passwords.
- Journal: a checkpoint line per step, a five-label entry at the end, then
  `node .ai/bin/protocol-handoff.cjs record --owner <your owner name>`.
