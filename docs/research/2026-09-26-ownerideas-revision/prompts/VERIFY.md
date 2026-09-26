# Stage 11 — independent verification (GPT-5.6 Sol) of the repaired candidate

Read `COMMON.md` first. Mode ADVISORY. You are the independent verifier named by the owner
(PROTO-DEC-0086 item 2; replaces the former Mistral step). Verify; decide nothing; fix nothing.
Output: `round9/VERIFY-SOL.md`.

## Inputs

- `round8/IMPLEMENTATION-REVIEW-DEEPSEEK.md`, `round8/CERT-KIMI.md`, `round8/CERT-MIMO.md` (the
  original findings and FAIL claims);
- `round9/REPAIR-GEMINI.md` (what the repair changed or refuted);
- the repaired working tree; `round6/packages/PKG-1..5.md` and
  `round6/FINAL-RESOLUTION-CLAUDE.md`; PROTO-DEC-0079..0086.

## Checks

1. Every original finding: resolved (reproduce the fix), or refuted with evidence, or still open
   (a BLOCKING finding). Re-run the original reproductions yourself.
2. No new regressions from the repair: `powershell -ExecutionPolicy Bypass -File .\validate-protocol.ps1`
   and `test-protocol.ps1`, real exit codes and output; the packages' own validation commands.
3. Conformity of the repaired state to the packages and the resolution (allowed paths, no scope
   widening, no second source of truth).
4. Verdict: `PASS` (no BLOCKING remains) or `FAIL` (with the open BLOCKING list, each with a
   reproduction). At most 250 lines; tables preferred.
- No commits, tags, pushes or branches; no edits outside that file and your journal; five-label
  journal and `record --quick` with `Orientation: ... @ task:ownerideas-r9-verify-codex`.
