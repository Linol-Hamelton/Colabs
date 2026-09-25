# workflowAI review: rules for every participant

Mode: ADVISORY. Talk to the owner in Russian; write documents in English. Nothing you write is a
decision (AGENTS.md section 2).

## Subject

`docs/core-arch/stage-4/workflowAI.md`: the kernel-layer procedure for choosing owner-defined
models, including its section 3, which sorts a pasted proposal into undisputed points and
hypotheses. It was written by claude-c73232724159e5bd, who takes no part in this cycle.

## Baseline

Read every input at the commit that adds this package:
`git log -1 --format=%H -- docs/research/2026-09-25-workflowai-review/prompts`. Outputs of earlier
steps of this cycle are read from the working tree.

## Inputs

- `docs/core-arch/stage-4/workflowAI.md`;
- `docs/ops/MODEL-ECONOMICS.md`, whose top snapshot is the owner's ladder;
- PROTO-DEC-0073 to 0076 in `.ai/DECISIONS.md`;
- `docs/core-arch/OWNER-DECISION-execution-model-2026-09-25.md`;
- `docs/ops/BACKLOG.md` and `docs/ops/PROBLEMS.md`.

## Rules

1. Start: `node .ai/bin/protocol-session.cjs start --agent <your agent name>`, unless a hook already
   created your journal. Journal line 1: `Launch: model=<id> effort=<value|unknown>
   client=<client>`. Line 2: `Orientation: <model> @ <your frame> (parent
   program:workflowai-review): <role> | success=<your output>`.
2. The owner's rule (PROTO-DEC-0076 item 4): no new hypotheses. Judge what is there.
3. Classify every defect you report as simple, medium, complex-non-blocking or blocking
   (PROTO-DEC-0076 item 5), with `path:line` and a one-line fix.
4. Label claims FACT (with `path:line`), INFERENCE or OPEN QUESTION. Settled decisions are not
   re-argued. A conflict with an accepted block is reported, not resolved.
5. Write your output with your file-writing tool. Text in a chat reply is not an output. Your output
   is at most 150 lines.
6. End: a five-label journal entry (Agent, Action, Result, Next step, Open), then
   `node .ai/bin/protocol-handoff.cjs record --quick --owner <your owner name>`.
7. Write only your output and your journal. No commit, tag or push. Nobody answers questions during
   this run: write an OPEN QUESTION and continue.
