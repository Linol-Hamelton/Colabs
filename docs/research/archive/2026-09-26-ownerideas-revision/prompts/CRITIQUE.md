# Stage 4 — independent critique of the OwnerIdeas plan (Kimi and MiMo, in parallel)

Read `COMMON.md` first. You are one of the two critics of the single plan; work independently and
do not read the other critique. Per the plan amendment, this is the plan's only critique
(P-L0-008 R-L0-22.7).

## Inputs

- `round4/PLAN-DEEPSEEK.md` — the plan you critique.
- `round3/RESOLUTION-CLAUDE.md` — sections 4-8 (the boundary: active list A-1..A-14, research list
  R-1..R-7, unresolved U-1..U-14) and section 10 (the plan brief).
- `prompts/PLAN-AMENDMENT.md` — Appendix B, which overrides the plan's dependency order.
- `.ai/DECISIONS.md` PROTO-DEC-0079..0083 and the blocks they name; `docs/core-arch/stage-1/P-L0-008-research-governor.md`;
  `docs/research/FRAMES.md`. Check the committed state (commits `f965cde`, `566debf`, `e68bc58`,
  `b929ba9`).

## What to check

1. Gaps: every active item A-1..A-14 and research item R-1..R-7 from RESOLUTION sections 6-7 is
   present and traceable by its ID.
2. Fidelity to the findings: no accepted item dropped, no minority finding from the four reviews or
   the two syntheses silently lost; where the plan simplifies, say what was simplified and why.
3. Dependencies: the D1 wave order (routes and A-10, then resolver v0 inside A-3, then the rest);
   the five packages' fit into two edit streams (D6); R-3 as one major frame in S2 with its
   contract-first steps (D2); no item starts before its inputs exist.
4. Executability: each item has verifiable acceptance criteria and validation commands; items that
   are not verifiable are flagged.
5. Unnecessary work: duplication, items already decided elsewhere, work that serves no decision.
6. Governor admission: every frame names its stream and size; the five admission fields exist or
   are explicitly pending; the plan's task one (DIG baseline) is present.
7. CORE-ARCH boundaries: kernel changes stay inside CORE-ARCH (0054 item 2, 0077 item 2);
   certification routes for high risk (0038 item 1, 0041 items 1-2); no new hypotheses outside R-3;
   no separate characterization layer (0062 item 2).

## Verdict and findings

- Return exactly one verdict: `CONFIRM`, `CONFIRM_WITH_CHANGES` or `REJECT`.
- Every remark: severity (`BLOCKING` / `RECOMMENDATION` / `NOTE`), the plan's `path:line`, the
  evidence, and the concrete change requested.
- `CONFIRM_WITH_CHANGES` and `REJECT` must list their BLOCKING items; a `REJECT` without a
  reproduction of the defect is not admissible.
- Do not solve the plan; do not add new hypotheses; do not rewrite scope.

## Output

- Exactly one file: `round5/CRITIQUE-KIMI.md` or `round5/CRITIQUE-MIMO.md` as your launch file
  names.
- Header: `Mode: ADVISORY`, `Baseline: <reviewed commits>`, `Reviewer: <model>, route <client>,
  effort <value>`, `<UTC date>`, `Scope: critique of PLAN-DEEPSEEK.md`, `Verdict: <one of the
  three>`.
- At most 250 lines; tables preferred; every claim cites `path:line`.
- Protocol: session start, five-label journal, `record --quick`; no commits and no edits outside
  your file and journal.
