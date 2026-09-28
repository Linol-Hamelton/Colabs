# Launch: task:dig-recheck-luna (codex, GPT-5.6 Luna; corrected rows only)

PROTO-DEC-0096 item 2, second pass. Work in the worktree `D:\Colabs\.ai\runtime\w3` (branch
`roadmap-wave3`).

## Scope

ONLY the rows corrected on 2026-09-28, in two files:

- `docs/research/2026-09-27-roadmap-queue/drafts/DIG-MISTRAL-0022-0047.md` - the 107 rejected rows
  from your first review (`docs/reviews/2026-09-28-gpt-5.6-luna-dig-verification.md`); consult its
  `## Correction log 2026-09-28`;
- `docs/research/2026-09-27-roadmap-queue/drafts/DIG-GEMINI-0048-0067.md` - the 10 rejected plus
  1 UNSURE row; consult its correction log.

The DeepSeek range is NOT part of this pass (its correction is pending an owner decision).

## Method

For every corrected row resolve the NEW proof in the tree at HEAD (`git rev-parse HEAD`): a
`path:line` exists and supports the claimed status, or the commit exists and contains the artefact.
Verdict per row: CONFIRM / REJECT / UNSURE. Report per range: confirmed / checked and the proven
share; a range below 80% proven goes to the owner (the 20% S4 rule applies to the first pass; this
pass checks the corrected rows directly).

## Deliverable

`docs/reviews/2026-09-28-luna-dig-recheck.md` (<= 250 lines): header (reviewed commit SHA, tree
status, reviewer model, date UTC, scope, explicit verdict), per-row results, the per-range proven
share, and the reject/unsure list.

## Rules

- Verification only: no code, no fixes, no decisions. Read-only on the producer files.
- Journal with the five labels; `record --quick`; commit with explicit paths; do NOT push.
