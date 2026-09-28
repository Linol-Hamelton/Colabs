# Launch: task:dig-fix-deepseek-vibe (vibe, Mistral Medium 3.5; range PROTO-DEC-0068..0086 + A-1..A-14)

Reassignment per PROTO-DEC-0097 item 1: the range's own route (the kilo CLI gateway) is blocked by
credits (`402 Add credits`), so the owner moved the range to vibe. Work in the worktree
`D:\Colabs\.ai\runtime\w3` (branch `roadmap-wave3`).

## Inputs

- `docs/reviews/2026-09-28-gpt-5.6-luna-dig-verification.md` - use ONLY the DeepSeek section;
- `docs/research/2026-09-27-roadmap-queue/drafts/DIG-DEEPSEEK-0068-0086.md` - the file you correct;
- `drafts/README.md` and `docs/research/2026-09-27-roadmap-queue/DIG-VERIFY-TASK.md`;
- the corrected `DIG-MISTRAL-0022-0047.md` and `DIG-GEMINI-0048-0067.md` as the style examples:
  `path:line` or commit proofs; `described`/`partial` where none exists; a `## Correction log`;
  header counts synced.

## Task

1. Correct ONLY the rows Luna rejected or marked UNSURE (the escalation list, `D:x/y` =
   PROTO-DEC-00x item y): D:72/4,74/2,75/1,75/6,75/12,76/2,76/5,77/1,79/1,79/8,80/1,83/7,85/4,86/4.
2. Proof becomes a `path:line` in code, tests or the validator, or a commit SHA that really contains
   the artefact; where neither exists the status becomes `described` (written rule only) or
   `partial`, with a one-line reason.
3. Append a `## Correction log 2026-09-28` section: one line per changed row. Sync the header counts
   (total, built, partial, described, not built).

## Rules

- No invention; no verdicts; no decisions; do not touch the other producers' files.
- `node .ai/bin/protocol-session.cjs start --agent mistral`; journal with the five labels (model
  honestly: requested `glm-5-3`, ran `mistral-medium-3.5`); `record --quick`.
- Do NOT commit; do not push: the operator collects. After this range is corrected, Luna re-checks
  only the corrected rows of all three ranges (PROTO-DEC-0097 item 1).
