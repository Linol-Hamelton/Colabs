# Launch: task:dig-fix-mistral (vibe, Mistral Medium 3.5; range PROTO-DEC-0022..0047)

PROTO-DEC-0096 item 2 (DIG option (b), one targeted correction). Work in the worktree
`D:\Colabs\.ai\runtime\w3` (branch `roadmap-wave3`).

## Inputs

- `docs/reviews/2026-09-28-gpt-5.6-luna-dig-verification.md` - use ONLY the Mistral section, the
  escalation list and the evidence standard it applied;
- `docs/research/2026-09-27-roadmap-queue/drafts/DIG-MISTRAL-0022-0047.md` - the file you correct;
- `drafts/README.md` and `docs/research/2026-09-27-roadmap-queue/DIG-VERIFY-TASK.md` - the row
  format and the proof standard.

## Task

Correct ONLY the rows Luna rejected (the escalation list, `M:x/y` = PROTO-DEC-00x item y):
M:25/1,25/2,25/4,25/5,26/1-6,27/1,27/5,28/3-6,29/1-4,31/1-3,32/2-8,33/1-6,34/2,35/2,36/1-5,37/1,
37/4-5,38/1-5,39/1-5,40/1-6,41/1-6,42/1-6,43/2-8,44/2-4,44/6,45/1-6,46/1,46/4-6,47/1-12.

For each corrected row set the proof to:

- a `path:line` in code, tests or the validator, or a commit SHA that really contains the artefact; or
- if neither exists: change the status to `described` (the decision exists only as a written rule)
  or `partial` (partly implemented), with a one-line reason.

Do not invent proofs; do not touch non-rejected rows except to keep the file consistent. Add a
`## Correction log 2026-09-28` section at the end: one line per changed row (old status/proof ->
new status/proof). Keep the file's header counts in sync and state them.

## Session rules

- `node .ai/bin/protocol-session.cjs start --agent mistral`; use the printed owner name.
- Journal with the five labels; model honestly: requested `glm-5-3`, ran `mistral-medium-3.5`
  while the alias is unresolved; then `record --quick`.
- Do NOT commit; do not push: the operator collects and commits. No verdicts, no decisions.
