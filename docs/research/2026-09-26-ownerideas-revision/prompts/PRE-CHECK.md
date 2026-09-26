# Stage 7 — DeepSeek pre-check of the final resolution and the five packages

Read `COMMON.md` first. Mode ADVISORY. You decide nothing; you verify. The owner pre-approved this
stage (PROTO-DEC-0086 item 3). Output: `round7/PRE-CHECK-DEEPSEEK.md`.

## Inputs

- `round6/FINAL-RESOLUTION-CLAUDE.md` (the resolution: critique table, scope, streams, packages);
- `round6/packages/PKG-1.md` .. `PKG-5.md`;
- `round3/RESOLUTION-CLAUDE.md` sections 6-10; `prompts/PLAN-AMENDMENT.md`;
- `.ai/DECISIONS.md` PROTO-DEC-0079..0086; `docs/core-arch/stage-1/P-L0-008-research-governor.md`;
  `docs/research/FRAMES.md`; `round4/PLAN-DEEPSEEK.md`.

## Checks

1. **Completeness.** Exactly five packages. Every stage-5 amendment item 7 field present in each:
   ID, goal, scope, inputs, allowed paths, forbidden paths, dependencies, required outputs,
   acceptance criteria, validation commands, integration conditions, edit stream and wave, risk
   class and certification route, artifact plan, executor capability dimensions, STOP condition.
2. **Critique coverage.** Every BLOCKING item of `round5/CRITIQUE-KIMI.md` and
   `round5/CRITIQUE-MIMO.md` has an explicit accept or reject with a reason in the resolution;
   check Kimi B-1 (M-7/A-4), B-2 (PKG-4/PKG-5), B-3 (A-9) and MiMo B1..B4 by name.
3. **Dependencies.** Waves are consistent (E1: PKG-1 then PKG-3; E2: PKG-2 then PKG-4 then PKG-5);
   no package starts before its inputs exist; A-4 and A-9 are out of package scope per the
   resolution; A-11's pending state is reported, not silently resolved.
4. **No overlaps.** Allowed/forbidden paths of packages in the same wave do not collide; a path
   that one package changes is not changed by another in the same wave.
5. **Acceptance and verification.** Every acceptance criterion is observable; every validation
   command exists in the repository or is a named command to be created by the package itself;
   a DONE state is checkable without judgement.
6. **Determinism.** Each package can be executed by a bounded agent without re-design; any point
   where the executor must decide is either a STOP condition or a named owner question.
7. **Owner questions.** Section 9 questions (OQ-1 A-11, OQ-2 A-1 design block, OQ-3 stall
   threshold, and the rest) are flagged as context, not solved here.

## Output

- `round7/PRE-CHECK-DEEPSEEK.md`, header `Mode: ADVISORY`, `Baseline: <reviewed commits>`,
  `Reviewer: DeepSeek 4.1 Flash, route kilo, effort max`, date, scope, and one verdict:
  `PASS` or `BLOCKING`.
- Every blocking finding: `PKG-<n>` or resolution `path:line`, the defect, a reproduction command
  where possible, and the minimal fix requested. A PASS with findings lists them as RECOMMENDATION.
- At most 250 lines; tables preferred; no commits, no edits outside your output and journal;
  five-label journal and `record --quick` at the end.
