# Launch: task:H1 (vibe executor; installed-role protected set fix; PROTO-DEC-0107 item 1)

Executor: vibe `-p` (Mistral route; the log MUST be checked for "falling back" - if present the model
is recorded as mistral-medium-3.5). Worktree `.ai/runtime/h1`, branch
`h1-installed-protected-set`, cut from the `v2.0.0` commit that contains this file. cwd = the
worktree; paths below are relative to it. One session; no sub-sessions.

Context: PROTO-DEC-0107 item 1: the remaining F-C01 work is H1 only - for `role=installed` the
protected set is `managed` + `.ai/`, `.claude/`, `.codex/`; `source` is required only for
`role=source`; H2 goes to 2B. Reproduced by the ADV-001-2 probe (verbatim): in a fresh temp install
(`setup-ai-protocol.ps1 -Target ...\probe-fc01-install -InitGit`) the installed
`.ai/bin/protocol-verdict.cjs` on a one-row ledger (requirement `CLI check`, paths
`validate-protocol.ps1`, disposition confirmed, exit 1) printed nothing to stdout, wrote to stderr
`BLOCKED: Cannot load protocol-manifest.json at run time: source must be a non-empty array`, and
exited **2**; the installed manifest is `role=installed`, `hasSource=false`. Code:
`.ai/bin/protocol-verdict.cjs:65-134` (`loadProtectedSet` reads `managed` and `source` and fails
closed). The executable-rulebook spec paragraph on the protected set is
`docs/specs/2026-09-23-executable-rulebook-spec.md`.

## Allowed files (nothing else; STOP if another file is needed)

- `.ai/bin/protocol-verdict.cjs`
- `tests/rulebook.test.cjs` (tests 0046 and `makeProtocolFixture` live there)
- `docs/specs/2026-09-23-executable-rulebook-spec.md` (only the paragraph about the protected set)
- `docs/reviews/2026-09-28-h1-adversarial-prompt.md` (new)
- `.ai/worklog/**` (your journal)

Do NOT touch `tests/validator-gate.test.cjs` (the A-1 session is editing it), `validate-protocol.ps1`,
`setup-ai-protocol.ps1`, `protocol-manifest.json`.

## Required semantics (ADV-002-3; PROTO-DEC-0047 item 8: unknown -> exit 2)

1. `role` = `"source"` OR missing (legacy) -> unchanged: `managed` and `source` both mandatory.
2. `role` = `"installed"` -> protected set = `managed` + `.ai/`, `.claude/`, `.codex/`.
   `managed` must be present and non-empty. If a `source` key is present -> exit 2 (the form
   contradicts the installer; silently dropping protection is forbidden).
3. Any other `role` value (not a string, `"host"`, etc.) -> exit 2.

## Test matrix (ADV-002-4): all new tests in `tests/rulebook.test.cjs`, name prefix `PROTO-DEC-0107 H1:`

Fixture: `makeProtocolFixture`, then rewrite the manifest into the installer form
`{role:"installed", managed:[...the original managed...], integration, state}`. Every case uses a
one-row neutral ledger (requirement `CLI check`, disposition `confirmed`, exit 1), same as the probe.
Host cases 1-3 and 9 FAIL (exit 1) before the fix; cases 4, 6-8 return 2 both before and after (they
pin the closed form); case 5 returns 0 (RECOMMENDATION) before and after.

1. host + paths `validate-protocol.ps1` -> `Verdict: FAIL`, exit 1;
2. host + paths `protocol-manifest.json` -> `Verdict: FAIL`, exit 1 (separate case: the original
   F-C01 class; the manifest protects itself through `managed`);
3. host + paths `.ai/bin/protocol-verdict.cjs` -> `Verdict: FAIL`, exit 1 (prefix rule);
4. control host + paths `docs/x.md` -> `Verdict: RECOMMENDATION`, exit 0;
5. host + paths `setup-ai-protocol.ps1` (source-only) -> `Verdict: RECOMMENDATION`, exit 0 (pins
   that the host set does not include `source`);
6. host manifest without `managed`, and with empty `managed` -> exit 2, stderr contains
   `Cannot load protocol-manifest.json`;
7. host manifest with a present `source` key -> exit 2;
8. `role:"host"` and `role:42` -> exit 2;
9. end-to-end: temp folder + the real installer (`setup-ai-protocol.ps1 -Target <tmp> -InitGit`),
   the installed `protocol-verdict.cjs`, case 1 -> FAIL/1. Reuse the installer helper from
   `tests/installer.test.cjs` if one exists.

## Steps (in order)

1. Write the tests; run `node --test tests/rulebook.test.cjs`; capture the failures of cases 1, 2, 3,
   5, 9 verbatim. Commit the tests ALONE (message names H1 and PROTO-DEC-0107).
2. Fix `.ai/bin/protocol-verdict.cjs` per the semantics above. Do not weaken any other check; no
   new dependency.
3. `node --test tests/rulebook.test.cjs` -> all green; then
   `powershell -ExecutionPolicy Bypass -File validate-protocol.ps1` -> exit 0.
4. Update only the protected-set paragraph of the spec to match the implemented semantics.
5. Write the unified adversarial prompt (<= 150 lines) to
   `docs/reviews/2026-09-28-h1-adversarial-prompt.md` for the two certifiers (the diff, the
   reproduction, the required checks); no verdict.
6. Journal entry (five labels) with the raw outputs; `node .ai/bin/protocol-handoff.cjs record
   --quick --owner <your session>`.
7. Commit the fix + spec + prompt + journal with explicit paths on this branch. Do NOT push. Do NOT
   merge into `v2.0.0`. Do NOT run the full suite (the operator runs it in a quiet window).

## Liveness and time bound

- 15 minutes without a tree write or journal update = stalled (PROTO-DEC-0047 item 6); write one
  checkpoint line after each step.
- The session is bounded by `--max-turns`; if you are near the bound, finish the current file and
  write the blocker to the journal instead of starting another step.
