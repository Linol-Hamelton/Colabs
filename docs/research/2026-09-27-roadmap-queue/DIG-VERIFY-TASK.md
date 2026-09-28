# Launch: task:dig-verify (GPT-5.6 Luna via codex, effort XHigh)

DIG registry verification (frame F-17). Work in the worktree `D:\Colabs\.ai\runtime\w3` (branch
`roadmap-wave3`, HEAD `6ff869d`). Owner decision PROTO-DEC-0093: the verifier is GPT-5.6 Luna
(codex, effort XHigh) instead of GPT-5.6 Sol; Sol's quota is preserved for the 2A and A-1
certification.

## Inputs

- `docs/research/2026-09-27-roadmap-queue/drafts/README.md` - frame, row format, counts;
- producer files: `drafts/DIG-MISTRAL-0022-0047.md`, `drafts/DIG-GEMINI-0048-0067.md`,
  `drafts/DIG-DEEPSEEK-0068-0086.md`;
- `drafts/COVER-DUP.md` - cover/dup results, including the 4/4/5 convention note;
- `.ai/DECISIONS.md` - the decision texts under audit (PROTO-DEC-0022..0086 and A-1..A-14).

## Scope (fixed by the owner)

1. A 20% sample of each producer's rows. Method: every 5th row in the file's order, starting from
   the first row; if the count is not a multiple of five, add the last row. State the method and the
   selected count in the report.
2. EVERY "not built" row (per the COVER-DUP counts).
3. EVERY "partial" row.
4. EVERY "built" row whose proof is prose only (no `path:line`, no commit).

For every selected row verify in the tree at HEAD:

- a `path:line` proof exists and supports the claimed status;
- a commit proof exists and contains what the row claims;
- for "not built", the claim is not contradicted by the tree (check the obvious paths the decision
  names).

Record per row: `id | producer | selected-by | verdict CONFIRM/REJECT/UNSURE | one-line reason |
evidence`.

## Escalation

Rows where you are UNSURE, or where you REJECT the collector on the evidence, go into a dedicated
section `## Escalation candidates` (id plus one line each). They will go to ONE short Sol call made
by the operator. Do not call Sol yourself.

## Deliverable

- `docs/reviews/2026-09-28-gpt-5.6-luna-dig-verification.md` (<= 250 lines): header (reviewed commit
  `6ff869d`, tree status, reviewer model, date UTC, scope, an explicit verdict line), the per-row
  table, the escalation list, and the S4 rejection rate (rows rejected / rows checked; threshold
  20%).
- Journal entry with the five labels; then
  `node .ai/bin/protocol-handoff.cjs record --quick --owner <your session>`.
- Commit on `roadmap-wave3` with explicit paths; do NOT push.

Rules: verification only - no code, no fixes, no test runs. Read-only on all inputs; you write only
your review file and your journal. No edits to the producer files; the verifier's artifacts are the
only uncommitted files allowed.
