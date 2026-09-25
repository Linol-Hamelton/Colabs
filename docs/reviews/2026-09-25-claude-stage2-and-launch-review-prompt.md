# Review prompt: CORE-ARCH stage 2 (L1), the research package and the launch package

- Author: Claude Opus 5.5 (`claude-opus-5-5`), session `claude-eb97ac9d13050014`, implementer of the
  CORE-ARCH program and coordinator of the research frames. The author certifies none of this work.
- Date: 2026-09-25. Baseline: `4ded1bee1c2acf2392fdeededf50935f59138302`, tree dirty.
- Addressee: the program reviewer, `deepseek-flash` through Kilo, mode Code. Your one role is
  reviewer, in frame `task:review-s2-launch`. You are also the planned researcher of job
  `a-deepseek` in `task:research-a`. That is a different frame; you review the package that will
  launch it, not any output of yours. Say so in your journal.
- Mode: ADVISORY (R-L0-05). A FAIL or BLOCKED you reproduce still blocks (PROTO-DEC-0047 item 2).
- Model by P-L2-002: rubric 2+2+1+0+1+2 = 8, T6. It is T7 if an unlanded kernel draft counts as a
  kernel change (open question В-24). DeepSeek has one model on every tier, so the choice is the
  same either way. Launch line:
  `Read and follow the file docs/reviews/2026-09-25-claude-stage2-and-launch-review-prompt.md`
- This prompt replaces `docs/reviews/2026-09-25-claude-core-arch-stage2-review-prompt.md` as the file
  to launch. That prompt was never run. Its Inputs and Parts 1-3 are part of this review in full.

## Step 0

1. `git rev-parse --show-toplevel` must print the `D:/Colabs` checkout; otherwise stop.
2. `node .ai/bin/protocol-session.cjs start --agent deepseek`; use the owner name it prints.
3. Journal line 1: `Launch: model=<id> effort=<value|unknown> client=Kilo`.
4. Journal line 2: `Orientation: deepseek-flash @ task:review-s2-launch: reviewer | rights=read, run the allowed commands, write three files | limits=Rules | tools=<...> | success=two verdicts and one ledger | tier=T6`

## Scope

| Package | Files | Decisions |
|---|---|---|
| S, stage 2 (L1) | as listed in the Inputs of the stage-2 prompt | PROTO-DEC-0056..0065 |
| R, research | `docs/research/2026-09-25-improvement-research/`: `BRIEF.md`, `README.md`, `prompts/A-research.md`, `B-research.md`, `A-synthesis.md`, `B-synthesis.md`, `prompts/run/*.md`; the notes in `docs/core-arch/CORE-ARCH-4.md` and `.ai/TASK.md` | PROTO-DEC-0066 |
| L, launch | `docs/core-arch/stage-4/P-L3-004-route-failover.md`, `kilo-routes.cjs`, `kilo-routes.json`, the fallback section of `MODEL-MATRIX.md`; `prompts/launch.cjs`, `launch-test.cjs`, `launch-fake-client.cjs`, `K-launch.md` | PROTO-DEC-0067 |

## Rules

- Allowed commands:
  - read-only `git` commands and `validate-protocol.ps1`;
  - `node <prompts>/launch.cjs --check`, `--dry` and `--status`;
  - `node <prompts>/launch-test.cjs`: fake clients only; it cleans its `zz-*` files;
  - `node docs/core-arch/stage-4/kilo-routes.cjs --print`: reads the Kilo catalog, calls no model;
  - any experiment inside a copy under the system temp directory.
- Forbidden: `launch.cjs --smoke`, `--start` and `--stop`. They call models or start the research.
  So is any `codex`, `agy`, `copilot`, `vibe` or `kilo run` call that could reach a model.
- Write only your two reports, the ledger and your journal. No edit, no commit, no lock.
- FAIL or BLOCKED needs one reproduction per claim: a command with its exit, or the exact line.
- Label claims FACT (with a `path:line` you opened), CLAIM or HYPOTHESIS. Do not quote another
  report's prose; cite `path:line` (PROTO-DEC-0048 item 3). Never write keys, tokens or passwords.

## Parts 1-3 (package S)

Run Parts 1, 2 and 3 of the stage-2 prompt as written. That is the transcription check of
PROTO-DEC-0056..0065, its ten angles, and the LCC re-run. One more angle: the implementer has
reported a defect in `SCHEMA-assignment.md` section 2. A program-scope line holds in every task of
the program, which extends R-L2-002.2 beyond one task frame (PROTO-DEC-0057 item 3). Confirm or
refute it, and propose the fix.

## Part 4: transcription of PROTO-DEC-0066 and 0067

Compare each block with the verbatim owner text in `BRIEF.md` O-01..O-11. Answer three questions:
- Does the `Supersedes` line of 0067 (the idle bound of PROTO-DEC-0049 item 3) follow from O-11
  item 4, or does it overreach?
- Which values in P-L3-004 or `launch.cjs` go beyond the owner's words, and is each one marked as
  the implementer's proposal? Candidates: the tie-break order, 16 KB, 0.5 s of CPU, 150 s and
  480 s, the caps of 360 and 180 minutes.
- Does 0066 item 6 match the option the owner chose (O-08)?

## Part 5: the research package

1. Coverage: every requirement of O-02 (required result 1-10 and the critical limits), O-03
   (sections 1-15) and O-04 (funnel stages 1-8, card fields) has a place in the prompts. List any
   requirement that is dropped or distorted.
2. Index: do the BRIEF index lines match their verbatim blocks?
3. Limits: can a researcher who follows its prompt install something, edit outside its own files,
   adopt MCP, or measure with a command that writes tracked state? Test the in-place list: run each
   command it names and compare `git status --porcelain` before and after.
4. Independence: the frames, one role per model per frame, and no synthesiser researching its own
   study. The same model sits in two frames: kimi-k2.7-code in `a-synth` and `b-kimi`, and
   deepseek-flash here and in `a-deepseek`. Is that sound?
5. Hygiene: every launch line and every job file is ASCII. The job files match the `JOBS` table of
   `launch.cjs` (agent, model, outputs).

## Part 6: the launch package (adversarial code review)

1. State machine: every row of the state table in P-L3-004 exists in `launch.cjs`, and the code has
   no transition the table lacks. Find an input that reaches an unintended state.
2. Failover: it switches only on a hard failure before useful work, and only once. It never
   switches after useful work, after an owner stop, or on a route the owner named.
3. Process safety:
   - nothing is stopped by a PID alone; identity is the PID plus its creation time;
   - a descendant counts only if it is no older than its parent;
   - the start lock under simultaneous starts;
   - what happens when a watchdog dies mid-run.
4. Liveness: build one realistic case of a long but working agent that the watchdog would kill,
   and one dead agent it would wait on too long. Judge the defaults against O-11.
5. Error text: for each client, find false positives (normal output that matches before useful
   work) and false negatives (a real limit message the pattern misses). Propose corrections.
6. Commands:
   - quoting through `cmd.exe`;
   - the safe-character guard;
   - flags and values against the client versions the files record;
   - reproduce `--check`: every command must parse, and no model may be called.
7. Permissions: the grants in use are `--approve-for-me`, `--dangerously-skip-permissions`,
   `--allow-all-tools --no-ask-user`, `--auto-approve` and `kilo run --auto`. Check each against
   PROTO-DEC-0047 item 7 and 0049 item 5. Which one has no recorded authority?
8. Routes: rerun `kilo-routes.cjs --print` and compare it with `kilo-routes.json`. Check
   R-L3-004.2-3 by hand on kimi-k2.7-code, kimi-k3 (medium is not offered), claude-haiku-4-5
   (xhigh), mistral-medium-3.5 (no suitable route) and deepseek-flash (level unknown). Confirm the
   MODEL-MATRIX fallback table agrees with them.
9. Self-test: run `launch-test.cjs` at least twice. Report any flaky result, any wrong
   expectation, and any scenario it lacks.
10. `K-launch.md`: could the operator session start research without the owner's confirmation,
    run a client itself, or misread an exit code?

## Part 7: the implementer's incident

Before the identity fix, one self-test run's watchdog looped while stopping processes it had found
by PID alone (journal `claude-eb97ac9d13050014`, entry "PROTO-DEC-0067", Open). Establish what
can still be established from the repository and this machine. Say whether the fix closes that
class of defect.

## Outputs

- Report S: `docs/reviews/2026-09-25-deepseek-core-arch-stage2-review.md`, at most 250 lines,
  covering Parts 1-3, with the header the stage-2 prompt specifies and one verdict token.
- Report L: `docs/reviews/2026-09-25-deepseek-research-launch-review.md`, at most 250 lines,
  covering Parts 4-7, with the same header and its own verdict token.
- Ledger: `docs/reviews/2026-09-25-core-arch-stage2-findings.md`, one ledger for both, in the
  format of the stage-1 ledger. Ids `CB-nn`, root causes `RC-CB-<short>`, `attempt: 1`.
- Journal: a checkpoint line after each part, `Signal:` lines for procedure gaps, a complete
  five-label entry at the end, then `node .ai/bin/protocol-handoff.cjs record --owner <your owner name>`.

## What happens next

The implementer answers each ledger row: fixed, rejected with a reason, or left to the owner.
Your second pass covers only the diff (PROTO-DEC-0049 item 1), with at most two attempts per root
cause. After a PASS or RECOMMENDATION, report S sends stage 2 to the owner (R-L1-reviewer.4).
The owner launches the research only after report L's verdict and the fixes it requires.
