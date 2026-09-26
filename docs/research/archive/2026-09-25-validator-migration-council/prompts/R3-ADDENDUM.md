# Round 3 and closing: the owner's addendum (F-3P-1 and the drafting model)

Binds every step from round 3 on: the three syntheses, the draft, both critiques, the final plan
and the verification. Read it after your role file. `OWNER-DECISION-R3.md` in this directory is the
owner's text of 2026-09-25, verbatim; where this file and it differ, the owner's text wins.

## 1. A second question: F-3P-1

The owner added a second question to this council's round 3: how package L (the research
launcher) should prevent a job from publishing to a remote. Answer it in a separate part of your
own output, `## Part 2: F-3P-1`, after your validator-migration part. Keep the two parts apart:
nothing in Part 2 changes a conclusion of Part 1.

- Status at the start: `OPEN - HYPOTHESIS UNDER VALIDATION` (owner, section 1). It is not an
  accepted risk, not fixed, and not a mandatory sandbox. Hypothesis L-GIT-01 (task Git modes,
  trusted delivery) is to be tested, not assumed.
- Inputs, read at the commit your launch line names:
  - `OWNER-DECISION-R3.md` sections 1 and 4 (questions Q1-Q10, the decision principle);
  - `docs/reviews/2026-09-25-deepseek-core-arch-stage2-review-packageL-third-pass.md` (F-3P-1 and
    its reproductions);
  - `docs/research/2026-09-25-improvement-research/prompts/launch.cjs` (`NO_PUSH`, `prepareWorkdir`,
    `scopeCheck`) and `docs/core-arch/stage-4/P-L3-004-route-failover.md` R-L3-004.9;
  - PROTO-DEC-0070 and PROTO-DEC-0047 item 7 in `.ai/DECISIONS.md`.
- Evidence rules of COMMON section 4 apply. A claim about what git or a client does carries a
  reproduction or a cited source; otherwise label it HYPOTHESIS.
- Required content, by step:
  - each synthesis: the threat model of Q3 (one control per threat class), and the comparison
    matrix of the owner's "REQUIRED OUTPUT" with at least its nine variants. Answer Q1-Q10, one line
    or more each, and the reverse hypothesis of Q9 with `risk x probability x blast radius` against
    `implementation + maintenance + execution friction`;
  - the draft: one proposed architecture for F-3P-1, with the matrix row that justifies it and the
    acceptance test of Q8;
  - critic A attacks its security claims, critic B its complexity and friction;
  - the final plan: the resolution, the hostile acceptance suite of Q8, the role of `ls-remote`
    (Q4), and what stays open.
- Part 2 may take up to 150 lines above your role file's cap.
- The minor findings of section 3 of the owner's text (stale second-pass references, the DeepSeek
  route, the `index.lock` policy) belong to the implementer's correction pass of package L, not to
  this council. Mention them only if your F-3P-1 answer depends on them.

## 2. Measurement and review of the drafting model

- The owner authorised Fable 5.1 for r3-a, the draft and the final plan, then replaced it for cost
  (chat, 2026-09-25): those slots run kimi-k3 / high through copilot. The coordinator's runner records
  client, model, wall time, credits or cost and retries of every run in `round3/USAGE.md`;
  participants do not measure it.
- Each critic ends its critique with one line:
  `Drafter quality (draft-decision.md): <GOOD | ADEQUATE | WEAK> - <one reason with a citation>`.
- The verifier ends with the same line for `final-plan.md`.
