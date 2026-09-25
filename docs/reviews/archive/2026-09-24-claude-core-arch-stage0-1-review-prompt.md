# Review prompt: CORE-ARCH stage 0 and stage 1 (for DeepSeek)

- Superseded by: docs/reviews/2026-09-24-claude-core-arch-stage1-control-prompt.md (never launched; replaced after the owner answers recorded in PROTO-DEC-0055)

- Author: Claude Opus 5.5, session `claude-eb97ac9d13050014`, implementer of the CORE-ARCH
  program (PROTO-DEC-0054). The author controls this work and certifies none of it.
- Date: 2026-09-24. Baseline: `4ded1bee1c2acf2392fdeededf50935f59138302`, tree dirty.
- Reviewer: DeepSeek, named by the owner (PROTO-DEC-0054 item 3). Mode: ADVISORY review of a
  design stage. Your verdict decides whether the stage goes to the owner; it fills no
  certification slot (PROTO-DEC-0041 item 1, you control this stage as its reviewer).
- Launch line for Kilo: `Read and follow the file docs/reviews/2026-09-24-claude-core-arch-stage0-1-review-prompt.md`

## Step 0 - check where you are

Run `git rev-parse --show-toplevel`. If it is not the `D:/Colabs` checkout, stop and report.
Then start your session: `node .ai/bin/protocol-session.cjs start --agent deepseek`, and use
the owner name it prints for your journal and Evidence.

## What you review

| # | File | What it is |
|---|---|---|
| 1 | `.ai/DECISIONS.md`, block PROTO-DEC-0054 (last block) | the owner directive as transcribed |
| 2 | `docs/core-arch/CORE-ARCH-1.md` | consolidated synthesis (PROTO-DEC-0053 step b draft), program governance |
| 3 | `docs/core-arch/CORE-ARCH-2.md` | stage 1 plan: L0 and the procedure for procedures |
| 4 | `docs/core-arch/stage-1/procedure.schema.md` | record schema |
| 5 | `docs/core-arch/stage-1/P-L0-001-procedure-lifecycle.md` | the meta-procedure |
| 6 | `docs/core-arch/stage-1/P-L0-002-stop-and-ask.md` | stop-and-ask |
| 7 | `docs/core-arch/stage-1/L0-ROOT.md` | root text |
| 8 | `docs/core-arch/CORE-ARCH-3.md` .. `CORE-ARCH-7.md` | later stages; review at plan level only |

Sources to check claims against: `docs/research/2026-09-24-remediation-mapping/r3-*-synthesis.md`,
`PROCEDURE-MAP.md`, `docs/research/2026-09-23-kernel-architecture/DISCUSSION.md`,
`.ai/DECISIONS.md`, `AGENTS.md`, `docs/specs/2026-09-23-executable-rulebook-spec.md`, and
`https://github.com/graph-memory/graphmemory/blob/main/docs/architecture.md`. The external
synthesis the owner pasted is not in the repository; treat claims resting on it as unverified.

## Part A - critique of the consolidated synthesis (PROTO-DEC-0053 step c)

You wrote one of the three round-3 syntheses. Critique CORE-ARCH-1 as a synthesiser would:
1. For each row of the matrices in section 3, check that the marks for C, X and D match what
   the three syntheses actually say. A wrong mark is a defect; cite the synthesis line.
2. For each resolution in section 3.3 and each pillar in section 4, write one line in the fixed
   form of PROTO-DEC-0048 item 3:
   `Agreement with claude on item <3.3-R-01 | 4.1 | ...>: <degree>.`
   followed by `Justification: <text>` for every degree other than `fully agree`.
3. Name any hypothesis present in the syntheses that the matrix omits.
Do not quote other reports' prose; cite by `path:line`.

## Part B - adversarial review of stage 1

Attack the stage-1 drafts on these angles (CORE-ARCH-2 section 9) and any other you find:
1. Self-application: does each draft pass `procedure.schema.md` as written? Check every
   required and conditional field by hand. Can P-L0-001 retire itself?
2. Evidence: does every `evidence` reference resolve, and does the cited line say what the
   draft claims? The routing round found citations that did not; do not trust them.
3. Root: is `L0-ROOT.md` within 8,000 B, and does it hold any procedural rule that belongs
   in a branch? Any invariant missing from `AGENTS.md` section 12?
4. Authority: can any agent use P-L0-001 to mark a record `active`, skip review, lower a gate
   or grant itself a permission?
5. Loops: is there a back edge without a budget or an exit?
6. Taboo: does the reading rule or the stop rule let an agent avoid fixing a real problem?
7. Loss: name any rule of `AGENTS.md` sections 1-12 that the L0 table in CORE-ARCH-2 section 2
   and the plan for other layers leave without a home.
8. Reference: is any mechanism taken from graphmemory forbidden by PROTO-DEC-0034, 0036 or
   0045 (embeddings, MCP runtime, external memory)?
9. Transcription: does PROTO-DEC-0054 say anything the owner did not direct, or omit a limit
   that still applies? The owner's words are quoted in its `Approved by` line.

## Part C - plan level for stages 2-6

One short section: ordering errors, missing dependencies, anything that contradicts an
accepted decision, and whether the three certification packages in CORE-ARCH-7 section 8 are
sized to finish within three rounds each.

## Rules

- Write exactly one report: `docs/reviews/2026-09-24-deepseek-core-arch-stage0-1-review.md`,
  at most 250 lines, plus your own journal. Edit nothing else: no kernel file, no
  `.ai/TASK.md`, `.ai/PLAN.md`, `.ai/DECISIONS.md`, no draft under review. No commit.
- Header: SHA from `git rev-parse HEAD`, tree clean or dirty, model and client, date UTC,
  scope, `Mode: ADVISORY`, the commands you ran, and one closed verdict token:
  PASS, RECOMMENDATION, FAIL or BLOCKED (PROTO-DEC-0041 item 3).
- Every finding: id `CA-nn`, severity by the rubric of PROTO-DEC-0041 item 4, the file and
  line, and a reproduction or the exact line that shows it. A FAIL without a reproduction per
  claim is advisory.
- Label claims FACT, CLAIM or HYPOTHESIS; a FACT carries a `path:line` you opened.
- Write a checkpoint line in your journal after each part. End with a complete five-label
  entry and `node .ai/bin/protocol-handoff.cjs record --owner <your owner name>`.
- Never write keys, tokens or passwords.
- Without filesystem access, return the report in chat headed `[MODE: READ-ONLY ADVISORY]`;
  the owner persists it (AGENTS.md section 5 item 5).

## What happens next

The implementer answers every finding: fixed, rejected with a reason, or left to the owner,
at most two attempts per root cause. Then the stage goes to the owner. The second critique
of step (c) comes from the participant the owner names (CORE-ARCH-1 question 3).
