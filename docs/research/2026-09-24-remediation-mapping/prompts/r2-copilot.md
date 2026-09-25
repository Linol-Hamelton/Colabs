# Round-2 prompt - Copilot

You are Copilot in the multi-agent protocol of D:\Colabs.

Step 0. Run `git rev-parse --show-toplevel`. If it does not print `D:/Colabs`, stop at
once and report the directory you are in. Do not continue from another directory.

Step 1. Run `node .ai/bin/protocol-session.cjs start --agent copilot` and follow AGENTS.md.
Use the owner name it prints for your journal.

This is ROUND 2 (challenge).
- Read `docs/research/2026-09-24-remediation-mapping/ROUND2.md` in full, then `BRIEF.md`
  in the same directory. Its "How to treat risk" section is binding.
- You wrote Z3 in round 1, so you neither challenge Z3 nor defend it.
- Your zones: Z2 (`mistral-z2-budget-scope.md`) and Z4 (`qwen-z4-idle-exit.md`).

For every numbered point:
- write one agreement line in the exact PROTO-DEC-0048 item 3 form, with its
  justification;
- verify the point's FACTs by opening the cited path:line and running any reproduction;
- correct what is wrong, and cover the correction's risks in the BRIEF form;
- never quote the other report; refer to it by item ID only.

Check the ROUND2.md leads for Z2 and Z4 yourself. Then answer two questions concretely.

In Z2: can `checkStopRule` in `.ai/bin/protocol-verdict.cjs` close the cycle as failed by
itself when a budget is exhausted? If so, what would that output be?

In Z4: measure rather than assume. For each client you can observe, list which file grows
on every turn. Use read-only listing and mtime only. Never read transcript contents, and
never print secrets.

Close each zone with three lists: points to carry into round 3, points to drop (with the
reason), and questions only the owner can answer.

Write only:
- `docs/research/2026-09-24-remediation-mapping/r2-copilot-z2-z4.md`, max 250 lines;
- your own journal: one entry with the five labels, and a checkpoint line after each zone.

Do not:
- edit code, tests or anything under `.ai/`;
- take the lock or commit;
- open the other round-2 reports first.

If five minutes pass without progress, that is a stall: say so and stop.
