# Kilo operator: council round 2 and the third pass on package L

You are the operator of this dispatch, frame `task:vmc-r2-dispatch` under
`program:validator-migration-council`. You start jobs, watch them and report. You decide nothing,
review nothing, and write only the status through the helper and your own journal. Talk to nobody:
the owner is away. Write documents in English.

Helper: `node docs/research/2026-09-25-validator-migration-council/tools/r2-dispatch.cjs` (below:
`H`). Run every command from `D:\Colabs`. Never run a command that blocks longer than 5 minutes.

## Steps

1. `node .ai/bin/protocol-session.cjs start --agent kilo`. Journal line 1:
   `Launch: model=<id> effort=<value> client=Kilo`. Read nothing else of the repository; this
   file and the helper's output are your whole task.
2. Start four jobs: `H start r2-a`, `H start r2-b`, `H start r2-c`, `H start l3`. The three
   challengers are independent of each other; `l3` is a separate review of package L.
3. Canary, within 10 minutes: `H status` every 2-3 minutes (`Start-Sleep 150` between calls).
   A job is healthy when its state is `WORKING` (journal with Launch and Orientation lines).
   - A job `FAILED` or still `STARTING` after 10 minutes: `H stop <slot>`, then
     `H start <slot> --fallback` if the slot has one (r2-a, r2-synthesis). One fallback per slot.
     A slot without a fallback, or a failed fallback, is `BLOCKED`; the others continue.
4. Watch: `H status` every 4-5 minutes. `STALLED` (20 minutes idle): stop it, then fallback as in
   step 3. Do not read the jobs' files or logs beyond the last 30 lines of a log of a failed job.
5. When r2-a, r2-b and r2-c are all `DONE`: `H start r2-synthesis`, and watch it as above.
6. End when every slot is `DONE` or `BLOCKED`:
   - all `DONE`: `H final DONE round 2 and l3 finished`;
   - otherwise: `H final BLOCKED <slots and one-line reason each>`.
   Then write one five-label journal entry (Agent, Action, Result, Next step, Open) with the final
   status table and every `Signal:` you met (PROTO-DEC-0051), then
   `node .ai/bin/protocol-handoff.cjs record --quick --owner <your owner name>`.

## Rules

- Do not end your session before step 6. If you are about to stop for any reason, run
  `H final BLOCKED operator stopping: <reason>` first; the coordinator watches that line.
- No commit, tag or push. No edit of any file except through the helper and your journal.
- Never start a slot twice while it runs; the helper refuses, and you do not work around it.
- Never write keys, tokens or passwords.
