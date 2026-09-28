# Launch: DeepSeek fix review - H1 (installed protected set)

Reviewer: DeepSeek Flash via kilo, a separate session (`kilo run`). You review; you certify nothing
and edit only your review file and your journal. cwd = this worktree, branch
`h1-installed-protected-set`. Read first: `LAUNCH-H1.md`,
`docs/reviews/2026-09-28-h1-adversarial-prompt.md`, PROTO-DEC-0107 item 1, PROTO-DEC-0047 item 8,
`docs/specs/2026-09-23-executable-rulebook-spec.md` (protected-set paragraph).

## Context and scope

- Defect (reproduced in the ADV-001-2 probe): in a fresh install `role=installed` has no `source`
  key, so `.ai/bin/protocol-verdict.cjs` check 1 exits 2 (`BLOCKED ... source must be a non-empty
  array`) in every host project. Required semantics (owner, PROTO-DEC-0107 item 1): for
  `role=installed` the protected set is `managed` + `.ai/`, `.claude/`, `.codex/`; `source` is
  required only for `role=source`; a present `source` key in installed form exits 2; any other role
  value exits 2; missing/empty `managed` exits 2.
- Candidate: `28d13cc` (tests alone, nine `PROTO-DEC-0107 H1:` cases) + `d31ebb6` (fix
  `.ai/bin/protocol-verdict.cjs`, spec paragraph, adversarial prompt, journal). Base `606fcc5`.
- Operator full suite on this branch (main tree log `D:\Colabs\.ai\runtime\h1-suite.log`):
  `validate-protocol.ps1` exit 0; `test-protocol.ps1` **432/432 PASS**, 311.2 s,
  2026-09-28T19:33:13-19:38:36Z. The vibe executor reported 63/63 for `tests/rulebook.test.cjs`.
- `v2.0.0` has since advanced by `c554d17` (docs-only F-18 merge); no file of this candidate is in
  that merge.

## Task (adversarial)

Review the diff `606fcc5..d31ebb6` against `LAUNCH-H1.md`, the adversarial prompt and PROTO-DEC-0107
item 1:

1. Semantics: source or missing role unchanged; installed set exact; prefix vs whole-path matching;
   the legacy no-role path (`tests/handoff.test.cjs` fixture); case/spacing variants; manifest
   shapes (extra keys, non-array `managed`, non-string role); the exit codes and stderr.
2. Cross-check the end-to-end case: temp folder + `setup-ai-protocol.ps1 -Target <tmp> -InitGit`,
   installed `protocol-verdict.cjs` on a neutral ledger -> FAIL/1 (the probe that failed before).
3. The new tests fail on the pre-fix tree (`git show 606fcc5:.ai/bin/protocol-verdict.cjs`) and pass
   now; prove it. No other rule weakened.
4. Regressions you run yourself: `node --test tests/rulebook.test.cjs`; `powershell
   -ExecutionPolicy Bypass -File validate-protocol.ps1`. Do NOT run the full suite (the operator ran
   it).
5. Report file: `docs/reviews/2026-09-28-deepseek-h1-fix-review.md`, at most 250 lines, header per
   `templates/reviews/REVIEW.md`: reviewed commit, working tree state, Reviewer, scope,
   `Mode: ADVISORY` (a fix review, not certification), `Receipt-Owner: <your session>`, verdict
   PASS / RECOMMENDATION / FAIL; every FAIL/BLOCKED claim carries a reproduction.
6. Journal entry (five labels) + `node .ai/bin/protocol-handoff.cjs record --quick --owner
   <your session>`; commit the review and the journal with explicit paths on this branch.
   Do NOT push, do NOT merge, do NOT edit candidate files or `.ai/DECISIONS.md`.
