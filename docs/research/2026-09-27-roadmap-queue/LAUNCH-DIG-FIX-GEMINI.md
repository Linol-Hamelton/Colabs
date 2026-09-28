# Launch: task:dig-fix-gemini (agy, one attempt; range PROTO-DEC-0048..0067)

PROTO-DEC-0096 item 2 (DIG option (b), one targeted correction). One agy attempt only; if it fails,
the operator reassigns this range to vibe. Work in the worktree `D:\Colabs\.ai\runtime\w3` (branch
`roadmap-wave3`).

## Inputs

- `docs/reviews/2026-09-28-gpt-5.6-luna-dig-verification.md` - use ONLY the Gemini section and the
  corpus finding (the file has 94 physical rows while the header and `COVER-DUP.md` say 91);
- `docs/research/2026-09-27-roadmap-queue/drafts/DIG-GEMINI-0048-0067.md` - the file you correct;
- `drafts/README.md` and `docs/research/2026-09-27-roadmap-queue/DIG-VERIFY-TASK.md`.

## Task

1. Recompute the range: reconcile the physical row count with the header; remove any duplicate or
   extra rows with a recorded reason (in the correction log). No silent deletions.
2. Correct ONLY the rows Luna rejected or marked UNSURE: G:48/6,50/3,53/4,55/4,57/4,60/1,62/4,65/3,
   66/5,67/7; UNSURE G:66/6.
3. For each corrected row the proof becomes a `path:line` in code, tests or the validator, or a
   commit SHA that really contains the artefact; if neither exists, the status becomes `described`
   or `partial` with a one-line reason.
4. Add a `## Correction log 2026-09-28` section: one line per changed/removed row. Keep the header
   count consistent.

## Rules

- No invention; no verdicts; no decisions; do not touch the other producers' files.
- Journal and `record --quick`; do NOT commit; do not push (the operator collects).
