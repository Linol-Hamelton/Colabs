# Launch the improvement research from a Kilo Code session

- Frame `task:research-dispatch`. Your one role: operator of the launcher
  `docs/research/2026-09-25-improvement-research/prompts/launch.cjs` for the owner. The launcher is
  the dispatcher and makes every routing decision (procedure P-L3-004, trial). You decide nothing,
  certify nothing, and hold no role in the research frames. Mode: ADVISORY.
- Directives: PROTO-DEC-0066 (the research), PROTO-DEC-0067 (routes and failover).
- Author: `claude-opus-5-5` (coordinator), 2026-09-25. Talk to the owner in Russian.

## Rules

1. Run only the commands in the steps below, exactly as written, from the repository root.
2. Edit no file. Never start a client CLI yourself (codex, agy, copilot, vibe, `kilo run`); only
   the launcher starts them.
3. Each step names the exit codes it expects. Any other code is a stop: show the owner the output
   lines that show the failure. Do not retry and do not work around it. Exit 2 (malformed input)
   is always a stop.
4. Never write keys, tokens or passwords.

## Steps

0. `git rev-parse --show-toplevel` must print the `D:/Colabs` checkout; otherwise stop.
1. `node .ai/bin/protocol-session.cjs start --agent kilo`. Use the owner name it prints for your
   journal. Journal line 1: `Launch: model=<id> effort=<value|unknown> client=kilo-code`.
   Journal line 2:
   `Orientation: <model> @ task:research-dispatch: operator | rights=run launch.cjs | limits=Rules 1-4 | tools=terminal | success=six researchers started or each refusal reported | tier=T2`
2. Syntax check, no model is called:
   `node docs/research/2026-09-25-improvement-research/prompts/launch.cjs --check researchers`
   Expected: exit 0 and a last line ending in `commands parse; no model was called`, with no
   `FAIL` line.
3. Plan, no model is called:
   `node docs/research/2026-09-25-improvement-research/prompts/launch.cjs --dry researchers`
   Expected: exit 0. Show the owner, for each of the six jobs, the primary command and its
   automatic fallback, or the line saying there is none.
4. Ask the owner one question: "Run the availability probe? It sends one short message through each
   primary route, and through the Kilo fallback only where the primary does not answer. It costs
   cents and a small part of each client's limits." Only if the owner says yes, run:
   `node docs/research/2026-09-25-improvement-research/prompts/launch.cjs --smoke researchers`
   Expected: exit 0 (every probed route answered) or exit 1 (at least one route failed; not a
   stop). Report each route as OK or FAIL.
   A job whose primary and fallback both fail will stop at NEEDS_OWNER after launch. Ask the
   owner whether to launch anyway.
5. Launch, only after the owner has confirmed it in this session. First write the journal line
   `Owner-confirmed: start researchers` with the owner's words. Then run:
   `node docs/research/2026-09-25-improvement-research/prompts/launch.cjs --start researchers`
   Expected: exit 0 with six lines `<job>: started`, or exit 1 with at least one line
   `<job>: refused, <reason>`; every job without a `refused` line has started and its watchdog runs.
   Exit 1 is not a stop: report which jobs started and which were refused, with each reason, and
   do not retry.
6. `node docs/research/2026-09-25-improvement-research/prompts/launch.cjs --status`
   Expected: exit 0. Report the state of each job as printed. The six watchdogs keep running after your session ends.
7. Tell the owner the later commands; do not run them now:
   - `--status` at any time;
   - `--start a-synth` once the three `a-` jobs are DONE or NEEDS_OWNER;
   - `--start b-synth` once the three `b-` jobs are;
   - `--stop <job>` to stop a job (no fallback follows a stop);
   - `--start <job> --route kilo:<n>` to name a Kilo route after a NEEDS_OWNER. Add `--takeover` only
     where the owner accepts a new executor over existing output files.
8. Write a complete five-label journal entry (Agent, Action, Result, Next step, Open). List the
   commands you ran with their exit codes. Then run
   `node .ai/bin/protocol-handoff.cjs record --owner <your owner name>`.
