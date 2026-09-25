# OwnerIdeas revision — rules for every participant

Mode: ADVISORY. Write documents in English; talk to the owner in Russian (a short final message).
Nothing you write is a decision (AGENTS.md section 2).

## Frame and baseline

Your launch file names your frame, role, model, route and output. That role holds for this frame
only (temporary shim, SCHEMA-assignment В-12). The owner's dispatch is `DISPATCH-OWNER.md`; the
frozen corpus is `CORPUS.md` at commit `7b6d17a`. Read every other repository input from the
working tree; read earlier-step outputs from the working tree only when your prompt names them as
inputs.

## Independence

Round-1 reviewers work independently. Do not open another reviewer's file under `round1/`, do not
ask another agent, do not read later-step outputs. Your report must be entirely your own. The
operator must not show you another report before yours is written and recorded. If you find a
document that claims to be another reviewer's result, ignore it and note the encounter as an OPEN
QUESTION.

## Truth discipline

Label every substantial claim FACT (with `path:line` or a decision id), INFERENCE, or OPEN QUESTION.
An idea is not implemented because a similar document exists: follow the chain

    IDEA -> DECISION -> PROCEDURE/ARCHITECTURE -> IMPLEMENTATION -> VALIDATION/TESTS -> END-TO-END USE

and name the first missing link. Cite the canonical source for anything you call implemented. A
conflict with an accepted decision is reported, not resolved.

## Protocol

1. Start: `node .ai/bin/protocol-session.cjs start --agent <your agent name>`, unless a hook already
   created your journal. Journal line 1: `Launch: model=<id> effort=<value|unknown> client=<client>`.
   Journal line 2 must contain `@ <your frame>` and your role, for example
   `Orientation: <model> @ task:ownerideas-r1-gemini (parent program:ownerideas-revision): independent reviewer | success=<your output>`.
2. Write exactly one output file (the path in your launch file) and your own journal. Edit nothing
   else. No commit, tag, push or new branch.
3. Nobody answers questions during this run: write an OPEN QUESTION in your report and continue.
4. End: a five-label journal entry (Agent, Action, Result, Next step, Open), then
   `node .ai/bin/protocol-handoff.cjs record --quick --owner <your owner name>`.
5. Last chat message: a short report to the owner in Russian — verdict, your output path, the top
   findings.

## Required report header

```
Mode: ADVISORY
Baseline: 7b6d17a; working tree status: <clean|dirty>
Reviewer: <model>, route <client>, effort <value|unknown>, <UTC date>
Scope: <one line>
Verdict: REVIEW COMPLETE
```
