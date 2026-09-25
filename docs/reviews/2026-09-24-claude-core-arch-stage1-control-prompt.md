# Control prompt: CORE-ARCH stage 1 (L0) - for DeepSeek as stage controller

- Author: Claude Opus 5.5, session `claude-eb97ac9d13050014`, implementer of the CORE-ARCH
  program (PROTO-DEC-0054 item 3). The author certifies none of this work.
- Date: 2026-09-24. Baseline: `4ded1bee1c2acf2392fdeededf50935f59138302`, tree dirty.
- Addressee: DeepSeek, controller and reviewer of every CORE-ARCH stage (PROTO-DEC-0054 item 3),
  and one of the two critics of step (c) of PROTO-DEC-0053 (PROTO-DEC-0055 item 2).
- Mode: ADVISORY. As controller you never certify; packages I-III are certified by Codex and
  Gemini (PROTO-DEC-0055 item 3). A FAIL or BLOCKED you reproduce still blocks the stage
  (PROTO-DEC-0047 item 2).
- Launch in Kilo with the model and reasoning effort named at launch (PROTO-DEC-0055 item 5).
  Tier T3 (kernel change plus control): DeepSeek's strongest reasoning model at the highest
  reasoning setting Kilo offers. Launch line:
  `Read and follow the file docs/reviews/2026-09-24-claude-core-arch-stage1-control-prompt.md`

## Step 0 - where you are and what you run on

1. `git rev-parse --show-toplevel` must print the `D:/Colabs` checkout; otherwise stop and report.
2. `node .ai/bin/protocol-session.cjs start --agent deepseek`; use the owner name it prints
   for your journal, your files and your Evidence.
3. First journal line: `Launch: model=<exact model id> effort=<exact setting> client=Kilo`, the
   values you actually run with, not the ones requested. Unknown means `unknown`.
4. Independence: do not open `docs/research/2026-09-24-remediation-mapping/r3c-gemini-critique.md`
   before your own critique is written. Record in your journal that you did not.

## Inputs

| # | Path | Role in this control |
|---|---|---|
| 1 | `.ai/DECISIONS.md` - blocks PROTO-DEC-0054 and PROTO-DEC-0055 (the last two) | owner directives as transcribed |
| 2 | `docs/core-arch/CORE-ARCH-1.md` | draft decision, step (b); consolidated synthesis; program governance |
| 3 | `docs/core-arch/CORE-ARCH-2.md` | stage 1 plan: L0, the five evidence classes, dossier, tasks S1-T01..T12 |
| 4 | `docs/core-arch/stage-1/procedure.schema.md` | record schema |
| 5 | `docs/core-arch/stage-1/P-L0-001-procedure-lifecycle.md` | the procedure for creating procedures |
| 6 | `docs/core-arch/stage-1/P-L0-002-stop-and-ask.md` | stop and ask |
| 7 | `docs/core-arch/stage-1/L0-ROOT.md` | root text |
| 8 | `docs/core-arch/CORE-ARCH-3.md` .. `-7.md` | later stages, plan level only |

Check claims against: the three `r3-*-synthesis.md` files and `PROCEDURE-MAP.md` in
`docs/research/2026-09-24-remediation-mapping/`, `docs/research/2026-09-23-kernel-architecture/DISCUSSION.md`,
`.ai/DECISIONS.md`, `AGENTS.md`, `docs/specs/2026-09-23-executable-rulebook-spec.md`, and
`https://github.com/graph-memory/graphmemory/blob/main/docs/architecture.md`. The external
synthesis the owner pasted is not in the repository; claims resting on it are unverified.

## Part 1 - critique of the draft decision (PROTO-DEC-0053 step c)

Output: `docs/research/2026-09-24-remediation-mapping/r3c-deepseek-critique.md`, at most 250 lines.
1. Check every C, X and D mark in CORE-ARCH-1 sections 3.1 and 3.2 against the synthesis it
   cites. A wrong mark is a finding; cite the synthesis `path:line`.
2. For each resolution in section 3.3 and each pillar in section 4, one line in the fixed form
   of PROTO-DEC-0048 item 3, then `Justification: <text>` for any degree except `fully agree`:
   `Agreement with claude on item <3.3-R-01 | 4.1 | ...>: <degree>.`
3. Name any hypothesis of the three syntheses that the matrices omit.
4. Do not quote another report's prose; cite by `path:line`.

## Part 2 - transcription check

Compare PROTO-DEC-0054 and PROTO-DEC-0055 with the owner words quoted in their `Approved by`
lines. Report anything they state that the owner did not direct, and any standing limit they
drop. In particular: does 0055 item 2 read more into the owner's answer to question 3 than it
says? Does 0055 item 3 keep Gemini independent of any candidate it would certify?

## Part 3 - adversarial review of the stage-1 drafts

Each angle needs a verdict with evidence:
1. Self-application: every draft passes `procedure.schema.md` as written; check each required
   and conditional field by hand. Can P-L0-001 retire itself?
2. Evidence: each `evidence` reference resolves, and the cited line says what the draft claims.
3. Root: `L0-ROOT.md` within 8,000 B (`wc -c`); no procedural rule that belongs in a branch;
   nothing in `AGENTS.md` section 12 missing.
4. Authority: no path through P-L0-001 lets an agent mark a record `active`, skip review, lower
   a gate or grant itself a permission.
5. Loops: no back edge without a budget and an exit.
6. Taboo: the reading rule and the stop rule do not let an agent avoid a real problem.
7. Loss: rules of `AGENTS.md` sections 1-12 that neither L0 nor any later layer's plan homes.
8. Reference: nothing taken from graphmemory is forbidden by PROTO-DEC-0034, 0036 or 0045.
9. The five evidence classes (CORE-ARCH-2 section 3): can class C become `active` on opinion alone?

## Part 4 - stage control

As controller you shape what follows:
1. Accept, reorder or change tasks S1-T06..S1-T12 of CORE-ARCH-2 section 8. For each task you
   keep, state its acceptance check and budget (attempts per root cause at most 2).
2. Check the stage-1 exit criteria (CORE-ARCH-2 section 11) for gaps.
3. Plan level for stages 2-6: ordering errors, missing dependencies, contradictions with
   accepted decisions, and whether each certification package in CORE-ARCH-7 section 8 can
   finish within three rounds.

## Outputs and rules

- Control report: `docs/reviews/2026-09-24-deepseek-core-arch-stage1-control.md`, at most 250
  lines, with Parts 2-4. Header: SHA from `git rev-parse HEAD`, tree clean or dirty, model and
  effort as launched, client, date UTC, scope, `Mode: ADVISORY`, commands you ran, and one
  verdict token: PASS, RECOMMENDATION, FAIL or BLOCKED (PROTO-DEC-0041 item 3).
- Findings ledger: `docs/reviews/2026-09-24-core-arch-stage1-findings.md` in the exact format of
  section 2 of the spec (one table; preamble only headings, `Key: Value` lines and blanks).
  Ids `CA-nn`; `root-cause` ids `RC-CA-<short>`; `paths` repository-relative; `attempt: 1`.
- A FAIL or BLOCKED needs one reproduction per claim: a command with its exit, or the exact
  line that shows it. Without one it is advisory.
- Label claims FACT, CLAIM or HYPOTHESIS; a FACT carries a `path:line` you opened.
- Write only the three files above and your own journal. Edit no draft, no kernel file, no
  `.ai/TASK.md`, `.ai/PLAN.md` or `.ai/DECISIONS.md`. No commit. No lock needed.
- Journal: a checkpoint line after each part; `Signal:` lines for any procedure gap you meet;
  a complete five-label entry at the end, then
  `node .ai/bin/protocol-handoff.cjs record --owner <your owner name>`.
- Never write keys, tokens or passwords.
- Without filesystem access, return the three outputs in chat headed `[MODE: READ-ONLY ADVISORY]`;
  the owner persists them (AGENTS.md section 5 item 5).

## What happens next

The implementer answers each ledger row: fixed, rejected with a reason, or left to the owner.
Your second pass reviews only the diff of the fixes (PROTO-DEC-0049 item 1), at most two
attempts per root cause. Gemini's critique arrives independently; the owner then names the
fixer of step (d). Stage 1 goes to the owner after your PASS or RECOMMENDATION.
