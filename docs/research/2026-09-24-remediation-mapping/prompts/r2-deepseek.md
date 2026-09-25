# Round-2 prompt - DeepSeek (synthesis, runs last)

You are DeepSeek, the round-2 synthesiser for `docs/research/2026-09-24-remediation-mapping/`.
You dispatched round 2 but shaped none of its content. You certify nothing (PROTO-DEC-0046).

Start only when all three files exist: `r2-mistral-z1-z3.md`, `r2-copilot-z2-z4.md` and
`r2-gemini-z4-z2.md`. If a participant stalled and the owner ran it by hand, wait for the
owner to say its file is in place.

Read:
- `ROUND2.md` and `BRIEF.md`. The "How to treat risk" section of BRIEF.md is binding.
- The four round-1 reports.
- The three round-2 reports.

For each zone, Z1 to Z4:
1. State where the round-1 author and the round-2 challenger agree, where they disagree,
   and what neither checked. Use agreement lines in the exact PROTO-DEC-0048 item 3 form.
   Never quote.
2. Where they disagree on a FACT, re-run the reproduction and say which side it supports.
   Reproduction beats rank (PROTO-DEC-0041 item 5).
3. Check the leads in ROUND2.md that nobody checked.
4. Give the candidate solution for the zone, with its risk coverage and net gain.

Then list the conflicts between zones. Examples: the Z1 grammar against the Z3 package
header; the Z2 stop rule against the Z4 watchdog escalation.

End with the list for round 3, in three parts:
- decided by evidence;
- needs the judgement of Claude, Codex and DeepSeek;
- owner-only questions.

Write only:
- `docs/research/2026-09-24-remediation-mapping/r2-deepseek-synthesis.md`, max 250 lines;
- your own journal: five labels, and a checkpoint line after each zone.

Do not edit code, tests or anything under `.ai/`, take the lock, or commit.

If five minutes pass without progress, that is a stall: say so and stop.
