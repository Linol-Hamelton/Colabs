# Stage 8 certification — high-risk packages (Kimi / MiMo), CERTIFYING mode

Read `COMMON.md` first (protocol steps; talk to the owner in Russian; repository files in English).
You are an independent certifier (PROTO-DEC-0038 item 1, 0041 items 1-2, 0086 item 1). You did not
execute and do not control the work; you certify. You fix nothing and decide nothing.

## Subject

The committed CANDIDATE `f3ab4b8` (`f3ab4b8b299c3fc783d9b6e22b61d1cdcfb15dcc`). Verify with `git rev-parse HEAD` and
`git show`; the tracked working tree must show no changes. Certify all four high-risk packages:
**PKG-1, PKG-2, PKG-3 and PKG-5** (`round6/packages/PKG-1.md`, `PKG-2.md`, `PKG-3.md`, `PKG-5.md`).
PKG-3 shares `.ai/bin/protocol-dispatch.cjs` with PKG-1, and the repair touched its items (F1-P3,
AC-7, AC-14), so it is certified in full.

- One of the two certifiers also gives the independent statement for **PKG-4** (PROTO-DEC-0079 D6
  medium-risk step). DeepSeek wrote the plan, so its review is not a certification; state clearly in
  your report if you are the one providing the PKG-4 statement.
- Neither certifier reads the other's report (`round8/CERT-KIMI.md` / `CERT-MIMO.md`).
- MiMo's report header states that the owner accepted MiMo-V2.6-Pro in place of MiMo-V2.6-Flash on
  2026-09-26 (direct owner confirmation, PROTO-DEC-0086 context).
- **HEAD line (owner amendment, 2026-09-27).** State in your report the actual
  `git rev-parse HEAD` of this repository and the result of
  `git diff --stat f3ab4b8 HEAD -- .ai/bin tests docs/specs .ai/docs .ai/SIGNALS.md docs/ops protocol-manifest.json`,
  which must be empty. **Do NOT run `git checkout` in this shared copy** - it detaches the branch and
  reverts shared files. For any check that needs the clean CANDIDATE tree, create your own worktree:
  `git worktree add .ai/runtime/cert-<your name> f3ab4b8` - run there, then `git worktree remove`.
- **Concurrent-test caveat (owner amendment, 2026-09-27).** Both certifiers may run the suite at the
  same time in the same copy. Any FAIL that concerns fixtures or the dispatch tests must be
  re-verified in your own worktree at `f3ab4b8` before you report it; the worktree run is the
  evidence.

## What to certify

For each of the four packages, on the committed CANDIDATE:

1. Each acceptance criterion: inspect the implementation (the committed blobs, not the dirty tree),
   run the package's validation commands yourself, and mark the criterion met or not, citing the
   real command output as evidence.
2. Allowed/forbidden paths: check the actual changed-file set of the package's commits against the
   package.
3. STOP conditions: check any STOP the executors/repair reported; a missed STOP is a FAIL.
4. No second source of truth for anything the package canonicalizes.

A certification round is this run; at most three rounds per batch (PROTO-DEC-0047 item 5); a fourth
is a STOP for the owner. If a repair commit follows, it becomes the new CANDIDATE and only the
touched packages are re-certified.

## Verdicts and output

- One verdict per package: **`PASS` or `FAIL` only** (no other tokens). Every `FAIL` claim carries a
  reproduction command and its output, run against the CANDIDATE. A package with an unverified
  criterion cannot be PASS.
- Report at most 150 lines. Required header:

```
Mode: CERTIFYING
Reviewed CANDIDATE: f3ab4b8b299c3fc783d9b6e22b61d1cdcfb15dcc (full SHA; confirm with git rev-parse HEAD)
Receipt-Owner: <your protocol session owner name>
Reviewer: <your model>, route <client>, effort <value>, <UTC date>
Scope: certification of PKG-1, PKG-2, PKG-3, PKG-5 (<PKG-4 statement: yes/no>)
Verdict: PASS | FAIL   (one overall verdict; the per-package table carries the details)
```

- You certify only your own reading; never rely on the other certifier's file.
- No commits, tags, pushes or branches; edit nothing outside your report and journal.
- Five-label journal entry, then **full** `node .ai/bin/protocol-handoff.cjs record --owner <your
  owner name>` (not `--quick`), with the frame line `Orientation: ... @ <your frame>`.
