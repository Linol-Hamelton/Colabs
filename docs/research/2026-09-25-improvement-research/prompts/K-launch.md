# Launch the improvement research from a Kilo Code session

- Frame `task:research-dispatch`. Your one role: operator of the launcher
  `docs/research/2026-09-25-improvement-research/prompts/launch.cjs` for the owner. The launcher is
  the dispatcher and makes every routing decision (procedure P-L3-004, trial). You decide nothing,
  certify nothing, and hold no role in the research frames. Mode: ADVISORY.
- Directives: PROTO-DEC-0066 (the research), PROTO-DEC-0067 (routes and failover), PROTO-DEC-0068
  (its timers hold in this launcher only), PROTO-DEC-0069 (the research runs beside the stage-2
  review), PROTO-DEC-0070 (client permissions for this run; every job in a disposable private clone; any
  diff outside a job's scope stops it).
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
   Pre-launch gate: the owner's launch message says that DeepSeek's second pass on package L has a
   non-blocking verdict, and names the commit whose launcher passed that review. If it says neither,
   ask the owner and stop until both are given. The launcher at HEAD must be that launcher, whatever
   else has been committed since:
   `git diff --quiet <that commit> HEAD -- docs/research/2026-09-25-improvement-research/prompts docs/core-arch/stage-4/P-L3-004-route-failover.md docs/core-arch/stage-4/kilo-routes.json`
   must exit 0; otherwise stop. The jobs run on HEAD's tree.
   `git status --porcelain --untracked-files=no` must print nothing; otherwise stop.
1. `node .ai/bin/protocol-session.cjs start --agent kilo`. Use the owner name it prints for your
   journal. Journal line 1: `Launch: model=<id> effort=<value|unknown> client=kilo-code`.
   Journal line 2:
   `Orientation: <model> @ task:research-dispatch: operator | rights=run launch.cjs | limits=Rules 1-4 | tools=terminal | success=six researchers started or each refusal reported | tier=T2`
2. Self-test, no model is called; it starts only fake clients and takes about 20 seconds:
   `node docs/research/2026-09-25-improvement-research/prompts/launch-test.cjs`
   Expected: exit 0 and no line starting with `FAIL`.
   Then the syntax check, no model is called either:
   `node docs/research/2026-09-25-improvement-research/prompts/launch.cjs --check researchers`
   Expected: exit 0 and a last line ending in `commands parse; no model was called`, with no
   `FAIL` line.
   Then the role preflight, read-only:
   `node docs/research/2026-09-25-improvement-research/prompts/launch.cjs --preflight`
   Expected: exit 0 and the last line `9/9 role lines point to their jobs; nothing was written`.
   It shows that no researcher will be told to ask the owner before starting work.
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
   `Owner-confirmed: start researchers` with the owner's words. The launch has two parts.
   a. Canary. Start the two jobs whose client flags PROTO-DEC-0070 changed, b-grok (copilot) and
      b-mistral (vibe):
      `node docs/research/2026-09-25-improvement-research/prompts/launch.cjs --start b-grok,b-mistral`
      Expected: exit 0 with two lines `<job>: started`. Anything else is a stop.
   b. Watch the canary. Run
      `node docs/research/2026-09-25-improvement-research/prompts/launch.cjs --status`
      and then `node -e "setTimeout(()=>{},60000)"` (a one-minute wait), in turn, for up to 15
      minutes, until both canary jobs show `WORKING`.
      - If either shows `NEEDS_OWNER` (a `SCOPE_STOP` included), or neither reaches `WORKING` in 15
        minutes, stop.
      - When you stop, report the status lines and start nothing else. A running canary is not
        stopped unless the owner says so.
   c. Only when both canary jobs show `WORKING`, start the other four:
      `node docs/research/2026-09-25-improvement-research/prompts/launch.cjs --start a-sol,a-gemini,a-deepseek,b-kimi`
      Expected: exit 0 with four lines `<job>: started`, or exit 1 with at least one line
      `<job>: refused, <reason>`; every job without a `refused` line has started and its watchdog
      runs. Exit 1 is not a stop: report which jobs started and which were refused, with each
      reason, and do not retry.
6. `node docs/research/2026-09-25-improvement-research/prompts/launch.cjs --status`
   Expected: exit 0. Report the state of each job as printed. The six watchdogs keep running after your session ends.
   Each running job works in its own private clone under `<system temp>/colabs-research/`; the
   status line names it. A job in `SCOPE_STOP` changed something outside its scope (a file, a ref,
   the clone's config or hooks): nothing was copied back and its clone was kept; report the reasons
   and delete nothing.
7. Tell the owner the later commands; do not run them now:
   - `--status` at any time;
   - `git status --short` and `git remote -v` once every job has settled: anything besides the
     research outputs and new journals, or any remote besides `origin`, goes to the owner, since a
     write by absolute path outside a clone is not seen by the scope check (P-L3-004 risks);
   - clones kept by a `SCOPE_STOP`, or left by a watchdog that died, stay under
     `<system temp>/colabs-research/` until the owner removes them after inspection;
   - `--stop <job>` also settles a job whose watchdog died; a refusal that names an unsettled
     attempt clears only after it;
   - `--start a-synth` once the three `a-` jobs are DONE or NEEDS_OWNER;
   - `--start b-synth` once the three `b-` jobs are;
   - `--stop <job>` to stop a job (no fallback follows a stop);
   - `--start <job> --route kilo:<n>` to name a Kilo route after a NEEDS_OWNER. Add `--takeover` only
     where the owner accepts a new executor over existing output files.
8. Write a complete five-label journal entry (Agent, Action, Result, Next step, Open). List the
   commands you ran with their exit codes. Then run
   `node .ai/bin/protocol-handoff.cjs record --owner <your owner name>`.
