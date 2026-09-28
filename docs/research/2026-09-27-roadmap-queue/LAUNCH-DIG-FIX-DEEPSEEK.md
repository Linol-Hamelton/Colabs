# Launch: task:dig-fix-deepseek (DeepSeek via kilo; range PROTO-DEC-0068..0086 + A-1..A-14)

PROTO-DEC-0096 item 2 (DIG option (b), one targeted correction). Work in the worktree
`D:\Colabs\.ai\runtime\w3` (branch `roadmap-wave3`).

## Inputs

- `docs/reviews/2026-09-28-gpt-5.6-luna-dig-verification.md` - use ONLY the DeepSeek section and the
  evidence standard it applied;
- `docs/research/2026-09-27-roadmap-queue/drafts/DIG-DEEPSEEK-0068-0086.md` - the file you correct;
- `drafts/README.md` and `docs/research/2026-09-27-roadmap-queue/DIG-VERIFY-TASK.md` - the row
  format and the proof standard.

## Task

Correct ONLY the rows Luna rejected or marked UNSURE (the escalation list, `D:x/y` = PROTO-DEC-00x
item y): D:72/4,74/2,75/1,75/6,75/12,76/2,76/5,77/1,79/1,79/8,80/1,83/7,85/4,86/4.

For each corrected row set the proof to:

- a `path:line` in code, tests or the validator, or a commit SHA that really contains the artefact; or
- if neither exists: change the status to `described` (the decision exists only as a written rule)
  or `partial` (partly implemented), with a one-line reason.

Do not invent proofs; do not touch non-rejected rows except to keep the file consistent. Add a
`## Correction log 2026-09-28` section at the end: one line per changed row (old status/proof ->
new status/proof). Keep the file's header counts in sync and state them.

## Session rules

- Start your protocol session (`node .ai/bin/protocol-session.cjs start --agent deepseek` unless a
  journal is already injected); use the printed owner name.
- Journal with the five labels; record model, effort and usage (or `not-exposed`); then
  `record --quick`.
- Do NOT commit; do not push: the operator collects and commits. No verdicts, no decisions.
