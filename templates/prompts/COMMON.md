# Common prompt rules for participants

Mode: ADVISORY. Write documents in English; talk to the owner in Russian (a short final message).
Nothing you write is a decision (AGENTS.md section 2).

## Frame and baseline

Your launch file names your frame, role, model, route, and output. Read every repository input from
the working tree; read earlier-step outputs from the working tree only when your prompt names them as
inputs.

## Independence

Reviewers work independently. Do not open another reviewer's uncommitted work or parallel report,
do not ask another agent, and do not read later-step outputs. Your report must be entirely your own.
If you find a document that claims to be another reviewer's result, ignore it and note the encounter
as an OPEN QUESTION.

## Truth discipline

Label every substantial claim FACT (with `path:line` or a decision id), INFERENCE, or OPEN QUESTION.
An idea is not implemented because a similar document exists: follow the chain

    IDEA -> DECISION -> PROCEDURE/ARCHITECTURE -> IMPLEMENTATION -> VALIDATION/TESTS -> END-TO-END USE

and name the first missing link. Cite the canonical source for anything you call implemented. A
conflict with an accepted decision is reported, not resolved.

## Protocol

1. Start: `node .ai/bin/protocol-session.cjs start --agent <your agent name>`, unless a hook already
   created your journal.
2. Write only your assigned output file and your own session journal. Edit nothing else unless
   explicitly instructed. No unauthorized commit, tag, push, or new branch.
3. Nobody answers questions during this run: write an OPEN QUESTION in your report and continue.
4. End: a five-label journal entry (Agent, Action, Result, Next step, Open), then
   `node .ai/bin/protocol-handoff.cjs record --quick --owner <your owner name>`.
   Never edit an entry after `record`; add a new one.
5. Last chat message: a short report to the owner in Russian — verdict, your output path, the top
   findings.
