# Stage 5-6 — Claude final resolution and the five deterministic packages

Read `COMMON.md` first. You are the resolver of the plan critique and the author of the packages.
You decide the boundary; you certify nothing. Output: `round6/FINAL-RESOLUTION-CLAUDE.md` plus one
file per package under `round6/packages/`.

## Inputs

- `round4/PLAN-DEEPSEEK.md` (the plan); `round5/CRITIQUE-KIMI.md` and `round5/CRITIQUE-MIMO.md`
  (both CONFIRM_WITH_CHANGES);
- `round3/RESOLUTION-CLAUDE.md` sections 4-10; `prompts/PLAN-AMENDMENT.md` (Appendix B);
- `prompts/CLEANUP.md` and the executed cleanup (commit b929ba9);
- `.ai/DECISIONS.md` PROTO-DEC-0079..0085; `docs/core-arch/stage-1/P-L0-008-research-governor.md`
  0.4; `docs/research/FRAMES.md`;
- the frozen corpus list `round3/CORPUS.txt` as needed.

## Stage 5 requirements (DISPATCH-OWNER "Этап 5")

1. Accept or reject each remark of both critiques with a reason. Every BLOCKING item of either
   critique gets an explicit accept or reject, including Kimi's M-7 scheduling gap for A-4 and the
   unscheduled dependencies of A-9 and A-11.
2. Fix the final implementation scope.
3. Exclude duplication.
4. Establish dependencies.
5. Define acceptance criteria.
6. Split the implementation into exactly five packages, sequenced into at most two concurrent edit
   streams E1 and E2 (PROTO-DEC-0079 D6; PROTO-DEC-0048 item 7). Do not confuse E1/E2 with the
   frame streams S1-S3 of P-L0-008. Resolve CRITIQUE-KIMI's concurrency finding (PKG-4 and PKG-5 in
   one stream in Wave 2) explicitly.

## Stage 6 requirements (DISPATCH-OWNER "Этап 6")

Each package is a deterministic implementation prompt: the executor implements the accepted
decision and does not redesign it. Per package:

- the dispatch fields: ID, goal, scope, inputs, allowed paths, forbidden paths, dependencies,
  required outputs, acceptance criteria, validation commands, integration conditions;
- plus: its edit stream (E1/E2) and wave; its risk class and certification route (PROTO-DEC-0038;
  a high-risk package - anything under `.ai/`, `.claude/`, hooks, validator, gates - needs two
  parallel independent certifiers outside execution and control, named later by the owner); its
  artifact plan (files created, changed or superseded, and their intended disposition); its
  executor requirements as capability dimensions (D-IMPL, D-ARCH, D-REV, D-TERM, D-ALGO, D-EDIT,
  D-DOC, D-CRIT, D-SYN), each HIGH/MEDIUM/LOW, plus the minimum tier under PROTO-DEC-0059 floors,
  so the owner (or later the resolver) can name the cheapest sufficient executor; and a STOP
  condition: when the executor must block and return a finding instead of deciding.

If an executor finds a contradiction it cannot resolve inside the approved specification, it
blocks the package and returns a finding instead of changing the architecture.

## Appendix A - stage-5 amendment (binding; overrides the dispatch where they differ)

1. **Two edit streams, not five parallel executors** (PROTO-DEC-0079 D6; PROTO-DEC-0048 item 7).
   - Sequence the five packages into at most two concurrent edit streams, named E1 and E2. Do not
     confuse them with the frame streams S1-S3 of P-L0-008.
   - Resolve CRITIQUE-KIMI's concurrency finding (PKG-4 and PKG-5 in one stream in Wave 2)
     explicitly.
2. **CLOSED is not certification** (PROTO-DEC-0079 D7).
   - Mark each package's risk class (PROTO-DEC-0038).
   - A high-risk package (anything under `.ai/`, `.claude/`, hooks, validator, gates) needs two
     parallel independent certifiers outside execution and control, named later by the owner.
   - Claude and DeepSeek never certify packages they resolved, planned or pre-checked.
3. **Priority** (PROTO-DEC-0079 D1): route stabilization with tests first, then the run record
   (A-10), then resolver v0 inside the dispatcher (A-3), then the rest.
4. **F-02 runs in parallel** in frame stream S2. Resolver v0 uses defaults and provider pages and
   never waits for F-02 data. No package edits `docs/ops/model-evidence/`, P-L2-002 task
   requirements or F-02 files.
5. **Governor** (P-L0-008): packages are implementation, not frames.
   - No research inside a package.
   - An executor's new idea or unresolved design question is returned as a finding and becomes a
     candidate (cap 5) or goes to the owner. It never widens scope.
6. **Closure** (P-L0-008 R-L0-22.56-22.71; the closure decision): stage 12 CLOSED requires a closure
   receipt for the program's own artifacts. Each package therefore declares an artifact plan.
7. **Each of the five packages gives:**
   - the dispatch fields: ID, goal, scope, inputs, allowed paths, forbidden paths, dependencies,
     required outputs, acceptance criteria, validation commands, integration conditions;
   - plus:
     - its edit stream (E1/E2) and wave;
     - its risk class and certification route;
     - its artifact plan (files created, changed or superseded, and their intended disposition);
     - its executor requirements, as capability dimensions (D-IMPL, D-ARCH, D-REV, D-TERM,
       D-ALGO, D-EDIT, D-DOC, D-CRIT, D-SYN), each HIGH, MEDIUM or LOW, plus the minimum tier
       under PROTO-DEC-0059 floors, so that the owner (or later the resolver) can name the
       cheapest sufficient executor;
     - a STOP condition: when the executor must block and return a finding instead of deciding.
8. **Every BLOCKING item in both critiques gets an explicit accept or reject with a reason**,
   including Kimi's M-7 scheduling gap for A-4 and the unscheduled dependencies of A-9 and A-11.
9. **Out of scope for stage 5:** new decisions, new frames, model assignments, and any change to
   PROTO-DEC-0079..0085. Anything needing one is listed as an owner question.

## Output structure

```
Mode: ADVISORY
Baseline: <reviewed commits>
Reviewer: Claude Opus 5.5, route claude CLI, effort xhigh, <UTC date>
Scope: stage 5-6 - final resolution and five deterministic packages
Verdict: RESOLUTION COMPLETE
```

`round6/FINAL-RESOLUTION-CLAUDE.md`: the critique-item table (accept/reject with reasons), the
final scope, the stream/wave table for E1/E2, the five package summaries, the owner questions.
`round6/packages/PKG-1..PKG-5.md`: each package with every field above, deterministic and
self-contained.

At most 250 lines per critique/review file you cite; the resolution itself has no line cap but no
filler. Protocol: session start, five-label journal, `record --quick`; no commits, no edits outside
`round6/` and your journal.
