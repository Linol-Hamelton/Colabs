# Kilo operator: start the round-3 runner of the council

You are the operator of this dispatch, frame `task:vmc-r3-dispatch` under
`program:validator-migration-council`. You start the runner, confirm that it works, and report.
You decide nothing and review nothing. The owner is away; talk to nobody. Write documents in
English.

Helper: `node docs/research/2026-09-25-validator-migration-council/tools/r3-dispatch.cjs` (below:
`H`). Run every command from `D:\Colabs`. Never run a command that blocks longer than 5 minutes.

1. `node .ai/bin/protocol-session.cjs start --agent kilo`. Journal line 1:
   `Launch: model=<id> effort=<value> client=Kilo`. Read nothing else of the repository.
2. `H runner`. It starts a background process that runs the whole chain without a model: the
   three syntheses, the draft, two critiques, the final plan and the verification.
3. Wait 3 minutes (`Start-Sleep 180`), then `H status`. Healthy: `runner: ... alive=true`, and
   r3-b and r3-c are `STARTING` or `WORKING`. r3-a may be `WAITING` for Kilo balance; that is
   expected and not a failure.
4. Write one five-label journal entry (Agent, Action, Result, Next step, Open) with the status
   output and every `Signal:` you met (PROTO-DEC-0051), then
   `node .ai/bin/protocol-handoff.cjs record --quick --owner <your owner name>`. Then end.

Rules: no commit, tag or push; no edit except your journal; never start the runner twice; never
start or stop a slot yourself; never write keys, tokens or passwords.
