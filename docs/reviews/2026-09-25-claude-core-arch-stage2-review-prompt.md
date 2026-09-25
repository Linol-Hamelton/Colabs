# Review prompt: CORE-ARCH stage 2 (L1, roles) - for the stage reviewer

- Superseded by: `docs/reviews/2026-09-25-claude-stage2-and-launch-review-prompt.md` as the file to
  launch (2026-09-25, before this prompt was run). Its Inputs and Parts 1-3 stay in force through it.

- Author: Claude Opus 5.5 (`claude-opus-5-5`), session `claude-eb97ac9d13050014`, implementer of
  the CORE-ARCH program (PROTO-DEC-0054 item 3). The author certifies none of this work.
- Date: 2026-09-25. Baseline: `4ded1bee1c2acf2392fdeededf50935f59138302`, tree dirty.
- Addressee: the program reviewer, `deepseek-flash` through Kilo (PROTO-DEC-0054 item 3, 0065 item 1).
  One role in this task: reviewer. No critique is asked here.
- Mode: ADVISORY. As controller of the stage you certify nothing (R-L0-05); a FAIL or BLOCKED you
  reproduce still blocks the stage (PROTO-DEC-0047 item 2).
- Model and effort by P-L2-002 (trial): rubric 2+1+1+0+1+1 = 6, T5; T7 if drafting and reviewing
  unlanded kernel records counts as a kernel change (open question В-24). The DeepSeek matrix
  holds `deepseek-flash` on every tier (MODEL-MATRIX, PROTO-DEC-0065 item 1), so the model is the
  same either way. Kilo mode Code; effort as Kilo offers it. Launch line:
  `Read and follow the file docs/reviews/2026-09-25-claude-core-arch-stage2-review-prompt.md`
- Asynchronous-review pilot (PROTO-DEC-0062 item 4): while you review, the implementer designs
  stage 3 and lands nothing. Stage-3 drafts are out of your scope.

## Step 0 - where you are, what you run on, what you may do

1. `git rev-parse --show-toplevel` must print the `D:/Colabs` checkout; otherwise stop and report.
2. `node .ai/bin/protocol-session.cjs start --agent deepseek`; use the owner name it prints.
3. First journal line: `Launch: model=<id> effort=<value|unknown> client=Kilo`, the values you
   actually run with (R-L2-002.5).
4. Second journal line, as a live trial of P-L1-001 step 4:
   `Orientation: deepseek-flash @ task:core-arch-stage2-review: reviewer | rights=<ids> | limits=<ids> | tools=<ids> | success=<ids> | tier=<Tn>`
   Fill it from ROLE-reviewer and this prompt. Say in your report where the grammar did not fit.

## Inputs

| # | Path | What it is |
|---|---|---|
| 1 | `docs/core-arch/CORE-ARCH-3.md` | stage 2 plan; the state block at the top maps planned names to files |
| 2 | `docs/core-arch/stage-2/roles/ROLE-*.md` (14) | role records (S2-T02) |
| 3 | `docs/core-arch/stage-2/P-L1-001-orientation.md` | orientation (S2-T06) |
| 4 | `docs/core-arch/stage-2/P-L1-002-independence.md` | independence (S2-T03) |
| 5 | `docs/core-arch/stage-2/SCHEMA-assignment.md` | assignment grammar, participant, fixtures, migration (S2-T04, T05) |
| 6 | `docs/core-arch/stage-2/P-L2-002-model-selection.md` 0.4 | model selection, trial (S2-T07) |
| 7 | `docs/core-arch/stage-2/WORK-CYCLE.md` | the owner's cycle mapped to homes (S2-T08) |
| 8 | `docs/core-arch/stage-2/trial/P-L2-002-rubric-trial.md` | rubric on ten past tasks (S2-T07) |
| 9 | `docs/core-arch/stage-2/trial/S2-T10-packet-trial.md` | packet against the stage-1 control prompt (S2-T10) |
| 10 | `docs/core-arch/stage-1/RULE-MAP.md` 0.2 | one row renamed (AR-013) |
| 11 | `.ai/DECISIONS.md` PROTO-DEC-0056 to 0065 | owner directives as transcribed by the implementer |

Check against: the stage-1 records (`docs/core-arch/stage-1/`), `docs/core-arch/stage-4/MODEL-MATRIX.md`,
`AGENTS.md`, `.ai/bin/protocol-hooks.cjs`, the round-3 reports named in SCHEMA-assignment section 4,
and the implementer's journal entry of 2026-09-25, which holds the LCC line and the packet sizes.

## Part 1 - transcription check

For each of PROTO-DEC-0056 to 0065: does the block state anything the quoted owner words do not
direct, or drop a standing limit? Cite `path:line`.

## Part 2 - adversarial review of stage 2

Each angle needs a verdict with evidence.
1. Rights: can an assignment or a delegation give a slot rights its role record does not grant,
   or let anyone but the owner approve (R-L0-04, R-L1-owner.2)?
2. Identity: can a participant wash out its past role by changing session, client alias, effort,
   frame or scope (R-L1-002.1, R-L1-002.2, SCHEMA-assignment sections 1-3)?
3. Grammar: do fixtures F1-F8 follow from the grammar and reading rules as written, and do they
   close R3-C01, R3-C02, R3-C03 and F-R3-02 by construction? Find an input the rules leave open.
4. Scope merge: does the parent-scope rule contradict PROTO-DEC-0055 item 3 anywhere, and is the
   reason given in SCHEMA-assignment section 6 sound?
5. One home (R-L0-12): the implementer turned restatements into pointers (role records, P-L1-001,
   P-L1-002). Find any rule still stated in two records, stage 1 included.
6. Capabilities: is any slot's right wider than its capabilities (PROTO-DEC-0031)?
7. Rubric: re-score at least three rows of the rubric trial. Where does the rubric under-rate
   protected work? Are signals S-1 to S-5 correct?
8. Packet trial: re-check at least eight rows of S2-T10 section 2, including every "carried"
   row that cites a stage-2 rule. Is any hand-written instruction missing from the table?
9. Pipelined review: where could "do not wait for the reviewer" (WORK-CYCLE step 8) break
   independence or create two writers?
10. Citations: the implementer's recurring defect is a wrong `path:line` (G8). Open at least ten
   citations in the stage-2 files and report each wrong one.

## Part 3 - LCC re-run (R-L0-19.2)

Re-run LCC-7 and at least three other checks of P-L0-004 for L1, and confirm or refute the
implementer's LCC line. LCC-8 is recorded as failed and sent to the owner (В-26); say whether
the measurement or the proposed remedy is wrong.

## Outputs and rules

- Report: `docs/reviews/2026-09-25-deepseek-core-arch-stage2-review.md`, at most 250 lines. Header:
  SHA from `git rev-parse HEAD`, tree clean or dirty, model and effort as launched, client, date
  UTC, scope, `Mode: ADVISORY`, commands run, and one verdict token: PASS, RECOMMENDATION, FAIL or
  BLOCKED (PROTO-DEC-0041 item 3).
- Ledger: `docs/reviews/2026-09-25-core-arch-stage2-findings.md`, in the format of the stage-1
  ledger (`docs/reviews/2026-09-24-core-arch-stage1-findings.md`). Ids `CB-nn`; root causes
  `RC-CB-<short>`; paths repository-relative; `attempt: 1`.
- A FAIL or BLOCKED needs one reproduction per claim: a command with its exit, or the exact line.
- Label claims FACT, CLAIM or HYPOTHESIS; a FACT carries a `path:line` you opened.
- Do not quote another report's prose; cite by `path:line` (PROTO-DEC-0048 item 3).
- Write only the two files above and your own journal. Edit no draft, kernel file, `.ai/TASK.md`,
  `.ai/PLAN.md` or `.ai/DECISIONS.md`. No commit. No lock needed.
- Journal: a checkpoint line after each part; `Signal:` lines for procedure gaps (P-L0-002 step 3);
  a complete five-label entry at the end, then
  `node .ai/bin/protocol-handoff.cjs record --owner <your owner name>`.
- Never write keys, tokens or passwords.
- Without filesystem access, return the outputs in chat headed `[MODE: READ-ONLY ADVISORY]`; the
  owner persists them (AGENTS.md section 5 item 5).

## What happens next

The implementer answers each ledger row: fixed, rejected with a reason, or left to the owner.
Your second pass reviews only the diff of the fixes (PROTO-DEC-0049 item 1), at most two attempts
per root cause (R-L0-11). After your PASS or RECOMMENDATION stage 2 goes to the owner, as kernel
work does (PROTO-DEC-0057 item 2, R-L1-reviewer.4).
