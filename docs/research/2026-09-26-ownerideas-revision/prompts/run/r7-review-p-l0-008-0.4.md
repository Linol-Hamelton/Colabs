# Launch: task:review-p-l0-008-0.4

- Frame: `task:review-p-l0-008-0.4`. Role: independent reviewer of the closure disposition. You
  decide nothing; the owner decides on your report.
- Agent name for the protocol: `mistral`. Model and route (fixed): Mistral Medium 3.5, effort max
  (client configuration), through vibe.
- Read first: `docs/research/2026-09-26-ownerideas-revision/prompts/COMMON.md` (protocol steps), then
  the subjects:
  - `.ai/DECISIONS.md` PROTO-DEC-0085;
  - `docs/core-arch/stage-1/P-L0-008-research-governor.md` 0.4, rules R-L0-22.56-22.71;
  - `docs/research/2026-09-26-ownerideas-revision/directives/CLOSURE-DISPOSITION-0085-PROMPT.md`
    Appendix C (the dry-run manifest method);
  - `docs/research/FRAMES.md` (counters and the receipt format note).
- Review:
  1. schema compliance of 0.4 against `procedure.schema.md`;
  2. internal consistency of R-L0-22.56-22.71 with PROTO-DEC-0085 and with the earlier rules;
  3. **first check for any way a closure could lose text that exists nowhere else** (immutable
     records, DELETE restrictions, ARCHIVE default, TRANSFER targets, archive-index resolution);
  4. the Appendix C method against R-L0-22.57/22.66: can an artifact escape the set, can a
     referenced artifact move without REPAIR, can a receipt misstate the check;
  5. any contradiction with AGENTS.md sections 8 and 12 and PROTO-DEC-0037.
- Output (exactly one file):
  `docs/reviews/2026-09-26-mistral-p-l0-008-0.4-closure-review.md`.
  - At most 250 lines; header per AGENTS.md section 5 item 4 with `Baseline: 0b379ea` (the reviewed
    commit, not older); `Mode: ADVISORY`.
  - Verdict: `PASS`, `RECOMMENDATION` or `FAIL`; every FAIL claim carries a reproduction command and
    its output.
  - UTF-8 without BOM, LF line endings.
- No commits, tags, pushes or branches; edit nothing except your journal and that one file. Close
  with a five-label journal entry and `record --quick`.
