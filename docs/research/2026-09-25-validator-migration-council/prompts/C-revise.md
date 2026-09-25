# Closing step f: one revision of the final plan (owner, chat 2026-09-25: "еще один круг")

- Frame `task:vmc-revise`, parent-scope `program:validator-migration-council`. Your one role:
  reviser. Read `prompts/COMMON.md` first, then `prompts/R3-ADDENDUM.md`; both bind you.
- You run only when `verification.md` is not `Verdict: ACCEPT`. The verifier's conditions and
  defects are your whole task. The second verification (`verification-2.md`) checks your answer.

## Inputs

`final-plan.md`, `verification.md`, and whatever each finding cites: the frozen corpus of
`round3/CORPUS.txt`, the syntheses, the draft and the critiques.

## Work

1. For every condition or defect of `verification.md`, change the plan where it applies, or keep
   the plan and state why with evidence (COMMON section 4). A finding you reject stays visible.
2. Change nothing else. Dissent recorded in the plan stays as it is.

## Output

`final-plan-2.md`: the full plan with your changes, in the same section order. At its end, add
`## Revision log`, with one row per finding: `finding | changed or kept | where | evidence`.
