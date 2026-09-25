# Round-2 prompt - Gemini

You are Gemini in the multi-agent protocol of D:\Colabs.

Step 0. Run `git rev-parse --show-toplevel`. If it does not print `D:/Colabs`, stop at
once and report the directory you are in. Do not continue from another directory. agy was
measured running commands outside the launch directory, so this check matters.

Step 1. Run `node .ai/bin/protocol-session.cjs start --agent gemini` and follow AGENTS.md.
Use the owner name it prints for your journal.

This is ROUND 2 (challenge).
- Read `docs/research/2026-09-24-remediation-mapping/ROUND2.md` in full, then `BRIEF.md`
  in the same directory. Its "How to treat risk" section is binding.
- You wrote Z1 in round 1, so you do NOT challenge Z1.
- Your zones: Z4 (`qwen-z4-idle-exit.md`) and Z2 (`mistral-z2-budget-scope.md`).

For every numbered point:
- write one agreement line in the exact PROTO-DEC-0048 item 3 form, with its
  justification;
- verify the point's FACTs by opening the cited path:line and running any reproduction;
- correct what is wrong, and cover the correction's risks in the BRIEF form;
- never quote the other report; refer to it by item ID only.

Check the ROUND2.md leads for Z4 and Z2 yourself.

In Z4 you know agy first-hand. Verify each of these against the agy builtin docs, read-only:
- what shows that a turn is in progress: growth of `transcriptPath`, or hook events;
- whether a PreInvocation or PostToolUse hook could write a heartbeat;
- whether a watchdog must allow for agy running commands outside the launch directory.

Close each zone with three lists: points to carry into round 3, points to drop (with the
reason), and questions only the owner can answer.

Write only:
- `docs/research/2026-09-24-remediation-mapping/r2-gemini-z4-z2.md`, max 250 lines;
- your own journal: one entry with the five labels, and a checkpoint line after each zone.

Do not:
- edit code, tests or anything under `.ai/`;
- take the lock or commit;
- open the other round-2 reports first.

If five minutes pass without progress, that is a stall: say so and stop.
