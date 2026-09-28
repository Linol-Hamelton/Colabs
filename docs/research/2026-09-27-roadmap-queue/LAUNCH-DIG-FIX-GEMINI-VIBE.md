# Launch: task:dig-fix-gemini-vibe (vibe, Mistral Medium 3.5; range PROTO-DEC-0048..0067)

Reassignment per PROTO-DEC-0096 item 2: the single agy attempt failed on 2026-09-28
(`streamGenerateContent: Bad Gateway`, grpc code 2, retryable false), so this range moves to vibe.
Work in the worktree `D:\Colabs\.ai\runtime\w3` (branch `roadmap-wave3`).

## Inputs

- `docs/reviews/2026-09-28-gpt-5.6-luna-dig-verification.md` - use ONLY the Gemini section and the
  corpus finding (94 physical rows vs the advertised 91);
- `docs/research/2026-09-27-roadmap-queue/drafts/DIG-GEMINI-0048-0067.md` - the file you correct;
- `drafts/README.md` and `docs/research/2026-09-27-roadmap-queue/DIG-VERIFY-TASK.md`;
- the corrected Mistral file `drafts/DIG-MISTRAL-0022-0047.md` as the style example: `path:line` or
  commit proofs; `described`/`partial` where none exists; a `## Correction log` section; header
  counts synced.

## Task

1. Recompute the range: reconcile the 94 physical rows with the header and `COVER-DUP.md`; remove
   duplicate or extra rows with a recorded reason in the correction log (no silent deletions).
2. Correct ONLY the rows Luna rejected or marked UNSURE: G:48/6,50/3,53/4,55/4,57/4,60/1,62/4,65/3,
   66/5,67/7; UNSURE G:66/6.
3. Proof becomes a `path:line` in code, tests or the validator, or a commit SHA that really contains
   the artefact; where neither exists the status becomes `described` (written rule only) or
   `partial`, with a one-line reason.
4. Append a `## Correction log 2026-09-28` section: one line per changed or removed row. Sync the
   header counts (total, built, partial, described, not built).

## Rules

- No invention; no verdicts; no decisions; do not touch the other producers' files.
- `node .ai/bin/protocol-session.cjs start --agent mistral`; journal with the five labels (model
  honestly: requested `glm-5-3`, ran `mistral-medium-3.5`); `record --quick`.
- Do NOT commit; do not push: the operator collects.
