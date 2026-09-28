# Launch: task:dig-recheck2-luna (codex, GPT-5.6 Luna; DeepSeek rows + one Mistral row)

PROTO-DEC-0097 item 1, second re-check pass. Work in the worktree `D:\Colabs\.ai\runtime\w3`
(branch `roadmap-wave3`).

## Scope

- `docs/research/2026-09-27-roadmap-queue/drafts/DIG-DEEPSEEK-0068-0086.md` - the 14 rows corrected
  on 2026-09-28 (see its `## Correction log 2026-09-28`);
- `docs/research/2026-09-27-roadmap-queue/drafts/DIG-MISTRAL-0022-0047.md` - the single follow-up row
  `PROTO-DEC-0045 item 6` (the reject from your first re-check).

## Method

As in `LAUNCH-DIG-RECHECK-LUNA.md`: resolve each new proof in the tree at HEAD (`git rev-parse
HEAD`); CONFIRM / REJECT / UNSURE per row; count confirmed/checked per range. The DeepSeek range goes
to the owner only if it is below 80% proven.

## Deliverable

`docs/reviews/2026-09-28-luna-dig-recheck2.md` (<= 250 lines): header (reviewed commit SHA, tree
status, reviewer model, date UTC, scope, explicit verdict), per-row results, the per-range proven
share, and the reject/unsure list.

## Rules

- Verification only: no code, no fixes, no decisions. Read-only on the producer files.
- Journal with the five labels; `record --quick`; commit with explicit paths; do NOT push.
