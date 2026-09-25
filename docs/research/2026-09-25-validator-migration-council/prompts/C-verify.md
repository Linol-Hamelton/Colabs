# Closing step e: independent verification of the final plan (owner decision of 2026-09-25)

- Frame `task:vmc-verify`, parent-scope `program:validator-migration-council`. Your one role:
  verifier. Read `prompts/COMMON.md` first, then `prompts/R3-ADDENDUM.md`; both bind you.
- Why this step exists: Fable wrote synthesis A, the draft and the final plan, so it must not be the
  only reviewer of its own synthesis (`OWNER-DECISION-R3.md`, "INDEPENDENCE REQUIREMENT"). You are
  of another model family and took no earlier part in this council.

## Inputs

`final-plan.md`; the frozen corpus of `round3/CORPUS.txt`, whose sha256 values you check at your
start; the three `round3/synthesis-*.md`, `draft-decision.md` and both `critique-*.md`; and the
F-3P-1 inputs of `R3-ADDENDUM.md` section 1.

## Work

Check at least the owner's seven points, each with a verdict (PASS, PARTIAL or FAIL) and evidence
cited by `path:line`:

1. every row of `round2/ISSUE-MATRIX.md` is covered by the final plan;
2. the round-2 carry-forward requirement (matrix row 14) is not lost;
3. every major claim of the final plan has evidence (COMMON section 4);
4. dissent of the syntheses and the critiques is not erased by the synthesis;
5. no unsupported conclusion appears;
6. the proposed F-3P-1 resolution answers the threat model of Q3;
7. the complexity of that resolution is proportionate to the risk (Q9, the decision principle).

Do not rewrite the plan and do not propose a new one. Name each defect with its location.

## Output

`verification.md` (at most 200 lines). Its header is COMMON section 3 step 4. Its first line after
the header is exactly one of `Verdict: ACCEPT`, `Verdict: ACCEPT WITH CONDITIONS` (then list the
conditions) or `Verdict: REJECT` (then list the blocking defects). It ends with the Fable quality
line of `R3-ADDENDUM.md` section 2.
