# Launch: task:A-1 (Claude Opus 5.5, effort max; installed-role advisory review fix)

Executor: Claude Code, Opus 5.5, effort **max**; a separate session (not the advisor, not the
finalizer). Worktree `.ai/runtime/a1`, branch `a1-installed-advisory`, cut from the `v2.0.0` commit
that contains this file. cwd = the worktree; paths below are relative to it.

Context: PROTO-DEC-0087 item 4 fixes A-1 as its own high-risk task: the installed-role path that
accepts a review marked `READ-ONLY ADVISORY`; first a regression test that fails on the current
validator, then the fix; source/installed parity; one unified adversarial prompt; two independent
certifiers. Reproduction: `docs/reviews/2026-09-27-claude-powershell-refactor-assessment.md:140`
(REPRODUCED on a scratch installed fixture). Code: `validate-protocol.ps1:736-738` and `:828-830`
compare `Mode` exactly against `ADVISORY`, so `Mode: READ-ONLY ADVISORY` slips through; the
`[MODE: READ-ONLY ADVISORY]` marker is checked nowhere; the stricter `gate-check` (CERTIFYING +
Receipt-Owner) runs only in the source role (`:869`). AGENTS.md section 2 is the contract: advisory
outputs carry `[MODE: READ-ONLY ADVISORY]`, are explicitly non-certifying, and an advisory review
cannot satisfy the independent-review completion gate.

## Task (exactly this; nothing else)

1. **Failing regression test first** (separate commit). On the existing test harness, build the
   minimal fixture that today reproduces the defect in the installed role: a completion-gate review
   whose header carries `Mode: READ-ONLY ADVISORY` (variant 2: the `[MODE: READ-ONLY ADVISORY]`
   marker) with a `Reviewer:` and a `Verdict: PASS`. On the CURRENT validator the gate accepts it
   (the defect). The new test asserts the required behavior (rejection) and therefore FAILS before
   the fix. Commit the test alone; the message names A-1 and PROTO-DEC-0087 item 4.
2. **Fix `validate-protocol.ps1`.** Both header-parsing paths (`:736-738`, `:828-830`) must treat
   any `Mode` value that normalizes to `ADVISORY` in any form (at least `ADVISORY`,
   `READ-ONLY ADVISORY`) as non-certifying -> FAIL with a message mirroring the existing one; the
   `[MODE: READ-ONLY ADVISORY]` marker anywhere in the header region must likewise FAIL, by the
   same mechanism as the existing transcription check (`:732`, `:824`). Keep the source-role
   `gate-check` (`:869`) intact. Do not weaken any other rule; the `.ps1` stays strictly ASCII.
3. **Parity evidence**: run the same fixture in both roles (source, installed) before/after the
   fix; after it, both reject both forms. Capture the raw outputs.
4. **Unified adversarial prompt** (<= 150 lines) in
   `docs/reviews/2026-09-28-a1-adversarial-prompt.md` for the two certifiers: exact scope (the
   diff), the reproduction, the required checks. No verdict.
5. **Journal** (five labels) + `node .ai/bin/protocol-handoff.cjs record --quick --owner <your session>`.
6. **Commit** the fix + prompt + journal with explicit paths on this branch. Do NOT push. Do NOT
   merge into `v2.0.0`. No F-C01. No files outside: `validate-protocol.ps1`, `tests/**`,
   `docs/reviews/**`, `.ai/worklog/**`.
7. **Liveness** (PROTO-DEC-0047 item 6): 15 minutes without a tree write or journal update =
   stalled; write one checkpoint line to your journal after each block.

## Required checks (raw outputs into the journal)

- the new test fails before / passes after;
- the targeted gate/validator test family passes after (`node --test tests/gate.test.cjs`, and/or
  `tests/validator-gate.test.cjs` / `tests/validator.test.cjs` as applicable); the full suite is
  NOT run here (the operator runs it in a quiet window);
- `powershell -ExecutionPolicy Bypass -File validate-protocol.ps1` on the worktree after the fix
  (expect exit 0; its ASCII check covers the edited script);
- the source/installed parity runs of step 3.

## Stop / escalate

- Defect not reproducible with the existing harness: STOP, journal the blocker, do not improvise a
  harness rewrite.
- A file outside the allowed set must change: STOP and journal it.
