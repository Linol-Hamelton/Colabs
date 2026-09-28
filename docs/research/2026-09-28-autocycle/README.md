# AUTOCYCLE: a reusable pattern for unattended consensus cycles

Status: in use for the night of 2026-09-28 (AUTOCYCLE-1). Not a decision; the binding text for the
night is `AUTOCYCLE-PROMPT.md`, recorded as a decision block by the operator in Part A.

## The pattern in one paragraph

An operator runs cycles. Each cycle:
1. executes the prompt that opened it;
2. reports, and turns open questions into points;
3. lets 2-4 cheap-but-sufficient models propose and vote in rounds;
4. applies a fixed, scripted acceptance rule (`tools/mailbox.cjs tally`);
5. hands the result to one finalizer, which writes the next prompt.

Context travels in one small capsule (`STATE.md`) with a single writer. Every call is measured.
Anything reserved goes to `OWNER-QUEUE.md` instead of being decided.

## Why these pieces

| Piece | Prevents |
|---|---|
| `STATE.md`, one writer, read first | agents re-deriving or contradicting context; write conflicts |
| scripted tally | percentages computed by a model that also has an opinion |
| closed stance scale, silence = no | inflated consensus from vague or missing answers |
| reserved list | a night of consensus quietly changing certifiers, decisions or budget |
| delegated merge with six conditions | work piling up unmerged, or merging uncertified work |
| mailbox + READY line + timeouts | waiting forever on a participant without a CLI |
| memory gate | measuring the operating system instead of the repository |
| shadow cost in E | division by zero on subscription routes |
| empty-cycle stop | cycles for the sake of cycles |

## Files

- `AUTOCYCLE-PROMPT.md`: the operator prompt (binding tonight).
- `OWNER-DRAFT.md`: the owner's original draft, verbatim.
- `CLAUDE-FINALIZER-START.md`: the first message for the finalizer session.
- `STATE.md`, `OWNER-QUEUE.md`, `MEASUREMENTS.jsonl`: live files, operator-written.
- `cycles/C<NN>/`: per-cycle prompt, report, proposals, syntheses, tallies, final request, final prompt.
- `tools/mailbox.cjs`: mailbox waits and the consensus rule engine.

## Owner checklist before sleeping (AUTOCYCLE-1)

1. Send the operator the launch line (the owner has it in chat).
2. Wait for «готово к перезагрузке» (Part A, about 10-15 minutes).
3. Windows power settings: no sleep on AC.
4. VS Code user settings: exclude `**/.ai/runtime/**` from watcher, search and files.
5. Reboot. Then:
   - start the operator with «Продолжай AUTOCYCLE-1 с Части B»;
   - open Claude Code (Opus 5.5, effort High) and paste `CLAUDE-FINALIZER-START.md`.
6. Sleep. In the morning read `MORNING-REPORT.md`, then `OWNER-QUEUE.md`.
