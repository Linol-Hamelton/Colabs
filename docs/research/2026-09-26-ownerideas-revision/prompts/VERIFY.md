# Stage 11 — independent verification (GPT-5.6 Sol) of the committed CANDIDATE

Read `COMMON.md` first. You are the independent verifier named by the owner (PROTO-DEC-0086 item 2).
You verify; you decide nothing; you fix nothing. Mode: CERTIFYING.

## Subject

The committed CANDIDATE `f3ab4b8` (`f3ab4b8b299c3fc783d9b6e22b61d1cdcfb15dcc`; confirm with `git rev-parse HEAD`);
the tracked working tree shows no changes. Verify on the committed blobs.

## Inputs

- `round8/IMPLEMENTATION-REVIEW-DEEPSEEK.md` (stage-9 findings F-1..F-5);
- `round9/REPAIR-HYGIENE-GEMINI.md` (the repair) and the repair commits
  (`aa52c42`, `f3ab4b8` and any later repair CANDIDATE);
- `round8/CERT-KIMI.md` and `round8/CERT-MIMO.md` (certification verdicts for this CANDIDATE);
- `round6/packages/PKG-1..5.md` and `round6/FINAL-RESOLUTION-CLAUDE.md`; PROTO-DEC-0079..0086.

## Checks

1. Every stage-9 finding F-1..F-5 and every repair claim: resolved (reproduce the fix), or refuted
   with evidence, or still open (a BLOCKING finding). Re-run the original reproductions yourself.
2. No regressions: `powershell -ExecutionPolicy Bypass -File .\validate-protocol.ps1` and
   `test-protocol.ps1`, real exit codes and output; the packages' own validation commands; the guard
   test; after the runs `git status --porcelain` must show no tracked changes.
3. Conformance to the approved plan and packages (allowed paths, no scope widening, no second
   source of truth).
4. One closed verdict token: **`PASS` or `FAIL`** (exactly one; no other verdict words). A FAIL
   lists the open BLOCKING items, each with a reproduction.

## Output

- `round9/VERIFY-SOL.md`, at most 250 lines; tables preferred. Required header:

```
Mode: CERTIFYING
Reviewed CANDIDATE: f3ab4b8b299c3fc783d9b6e22b61d1cdcfb15dcc (full SHA; confirm with git rev-parse HEAD)
Receipt-Owner: <your protocol session owner name>
Reviewer: GPT-5.6 Sol, route codex, effort medium, <UTC date>
Scope: stage-11 verification of the repaired implementation
Verdict: PASS | FAIL
```

- No commits, tags, pushes or branches; edit nothing outside that file and your journal; five-label
  journal entry, then **full** `node .ai/bin/protocol-handoff.cjs record --owner <your owner name>`
  (not `--quick`), with `Orientation: ... @ task:ownerideas-r9-verify-codex`.
