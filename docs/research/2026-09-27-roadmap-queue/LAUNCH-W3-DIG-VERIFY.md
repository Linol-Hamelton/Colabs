# Launch: task:roadmap-w3-dig-verify (GPT-5.6 Sol via codex, its own session)

Frame F-17 DIG registry audit - verification pass (advisory; no verdict, no certification).
Preconditions: all three drafts exist in `docs/research/2026-09-27-roadmap-queue/drafts/`
(`DIG-MISTRAL-0022-0047.md`, `DIG-GEMINI-0048-0067.md`, `DIG-DEEPSEEK-0068-0086.md`), and the
operator has run `protocol-ledger.cjs cover` and `dup` over the directory (results noted in
`drafts/COVER-DUP.md`). Work in the worktree `D:\Colabs\.ai\runtime\w3` (branch `roadmap-wave3`).

## Scope and method

1. Check a deterministic 20% sample: every 5th row of each file (rows 1, 6, 11, ...).
2. Check **every** row marked `not built` (all of them) and every row marked `partial`.
3. For each checked row, resolve the proof: a `path:line` must exist with the line in range; a
   commit sha must exist (`git cat-file -t`); a tag counts only with a commit.
4. Apply the correction standard: a row whose proof is a decision id, a tag alone, or an
   `AGENTS.md`/prose section without a `path:line` is **built-with-prose-proof** - flag it; the
   correction rules classify such rows as `partial (described, not enforced)`.
5. Produce `drafts/DIG-VERIFICATION-SOL.md`: per producer, the checked rows with agree/disagree,
   the evidence you resolved, the flagged rows, and counts (checked, verified, discrepancies).

## Rules

- `node .ai/bin/protocol-session.cjs start --agent codex`; use the printed owner name.
- Advisory only: no verdicts, no certification, no gate language. Do not edit the DIG files, the
  README, or anything outside your report, journal and evidence.
- Do not run `test-protocol.ps1`; run `validate-protocol.ps1` once and `record --quick` at the end.
- Commit your files on this branch with explicit paths; do not push.
- Journal: five labels plus model/effort and usage.
