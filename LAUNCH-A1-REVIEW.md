# Launch: DeepSeek fix review - A-1 (installed-role advisory review fix)

Reviewer: DeepSeek Flash via kilo, a separate session (`kilo run`). You review; you certify nothing
and edit only your review file and your journal. cwd = this worktree, branch
`a1-installed-advisory`. Read first: `LAUNCH-A1.md`, `docs/reviews/2026-09-28-a1-adversarial-prompt.md`,
PROTO-DEC-0087 item 4, PROTO-DEC-0105 item 2, PROTO-DEC-0107, `AGENTS.md` section 2.

## Context and scope

- Defect (reproduced in `docs/reviews/2026-09-27-claude-powershell-refactor-assessment.md:140`): the
  installed-role completion gate certifies reviews marked `Mode: READ-ONLY ADVISORY` or
  `[MODE: READ-ONLY ADVISORY]`; only the exact `Mode: ADVISORY` failed. Required (AGENTS.md
  section 2): an advisory review cannot satisfy the independent-review completion gate.
- Candidate: `6f44903` (failing regression, tests alone) + `7e51b89` (fix `validate-protocol.ps1`,
  a control test, the unified adversarial prompt, the executor journal). Base `74b46ff`.
- Operator full suite on this branch (main tree log `D:\Colabs\.ai\runtime\a1-suite.log`):
  `validate-protocol.ps1` exit 0; `test-protocol.ps1` **425/425 PASS**, 304.5 s,
  2026-09-28T19:27:46-19:32:57Z.
- `v2.0.0` has since advanced by `c554d17` (docs-only F-18 merge); no file of this candidate is in
  that merge.

## Task (adversarial)

Review the diff `74b46ff..7e51b89` against the adversarial prompt and AGENTS.md section 2:

1. Both header-parsing paths (around `validate-protocol.ps1:736` and `:828`) must reject `Mode`
   values `ADVISORY`, `READ-ONLY ADVISORY` and the `[MODE: READ-ONLY ADVISORY]` marker, in both
   roles; find false positives: legitimate `CERTIFYING` reviews, the `templates/reviews/REVIEW.md`
   HTML comment, real reviews under `docs/reviews/`; find false negatives: other spellings/casing,
   markers outside the header region, marker splitting, the transcribed-check interaction.
2. Source/installed parity; `gate-check` stays source-only; no other rule weakened; `.ps1`
   ASCII-only.
3. The new tests fail on the pre-fix tree (`git show 74b46ff:validate-protocol.ps1`) and pass now;
   prove it.
4. Regressions you run yourself: `node --test tests/validator-gate.test.cjs` and
   `node --test tests/validator-lightpath.test.cjs`; `powershell -ExecutionPolicy Bypass -File
   validate-protocol.ps1`. Do NOT run the full suite (the operator ran it).
5. Report file: `docs/reviews/2026-09-28-deepseek-a1-fix-review.md`, at most 250 lines, header per
   `templates/reviews/REVIEW.md`: reviewed commit, working tree state, Reviewer, scope,
   `Mode: ADVISORY` (a fix review, not certification), `Receipt-Owner: <your session>`, verdict
   PASS / RECOMMENDATION / FAIL; every FAIL/BLOCKED claim carries a reproduction.
6. Journal entry (five labels) + `node .ai/bin/protocol-handoff.cjs record --quick --owner
   <your session>`; commit the review and the journal with explicit paths on this branch.
   Do NOT push, do NOT merge, do NOT edit candidate files or `.ai/DECISIONS.md`.
