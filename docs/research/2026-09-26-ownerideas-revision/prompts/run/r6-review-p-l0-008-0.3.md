# Launch: task:review-p-l0-008-0.3

- Frame: `task:review-p-l0-008-0.3`. Role: independent reviewer, minor path (P-L0-001 steps 7-8).
  You decide nothing; the owner decides on your report.
- Agent name for the protocol: `mistral`. Model and route (fixed): Mistral Medium 3.5, effort max
  (client configuration), through vibe.
- Read first: `docs/research/2026-09-26-ownerideas-revision/prompts/COMMON.md` (protocol steps), then
  the subjects:
  - `docs/core-arch/stage-1/P-L0-008-research-governor.md` (0.3, R-L0-22.55);
  - `.ai/DECISIONS.md` PROTO-DEC-0084 (and 0079..0083 it refines);
  - `docs/research/2026-09-26-model-layer/README.md` (the F-02 admission);
  - `docs/research/FRAMES.md` (the F-02 row and the counters).
- Review: schema compliance of 0.3 against `procedure.schema.md` (R-L0-22.55 appended at the end of
  the Rules list; front matter; change log), consistency of PROTO-DEC-0084 with P-L0-008, FRAMES.md
  and the F-02 README (caps, dimensions, deadline, executor rule), and any contradiction or gap.
- Output (exactly one file):
  `docs/reviews/2026-09-26-mistral-p-l0-008-0.3-f02-admission-review.md`.
  - At most 60 lines; header per AGENTS.md section 5 item 4 with `Baseline: b007e23` (the reviewed
    commit, not older); `Mode: ADVISORY`.
  - Verdict: `PASS`, `RECOMMENDATION` or `FAIL`; every FAIL claim carries a reproduction command and
    its output.
  - UTF-8 without BOM, LF line endings (`docs/reviews/` is protocol-owned).
- No commits, tags, pushes or branches; edit nothing except your journal and that one file. Close
  with a five-label journal entry and `record --quick`.
