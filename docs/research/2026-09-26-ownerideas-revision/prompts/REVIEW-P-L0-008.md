# Independent review — P-L0-008 0.2 (research governor), PROTO-DEC-0083

Read `COMMON.md` first (mode ADVISORY, protocol steps, required header). You are the independent
reviewer of the governance change PROTO-DEC-0083 (commits `566debf`, `e68bc58`). The text was
drafted by `claude-b00262b88c55444b` and transcribed by `kilo-f22faac486b5e567`; you are a Mistral
session, so you are an admissible reviewer for this protocol-core change (PROTO-DEC-0038 item 2,
R-L0-17.6). You decide nothing; the owner decides on your report.

## Subjects

- `.ai/DECISIONS.md`: PROTO-DEC-0079..0083, in particular 0082 and 0083.
- `docs/core-arch/stage-1/P-L0-008-research-governor.md` (0.2, status trial).
- `docs/core-arch/stage-1/L0-ROOT.md` (v0.5, R-L0-22).
- `docs/core-arch/CORE-ARCH-6.md` section 6 (M-010) and every other mention of the metric set.
- `docs/core-arch/stage-1/S1-SUMMARY.md` (the L0-ROOT and P-L0-008 rows).
- `docs/research/FRAMES.md` (the transition registry, counters, DEFER backlog, candidates).
- `PROTO-DEC-0052` item 1; `AGENTS.md` sections 2 and 6; `docs/core-arch/stage-1/procedure.schema.md`
  sections 2-3; `docs/core-arch/stage-1/P-L0-001-procedure-lifecycle.md` (steps 7-8).

## Checks (all five required)

1. **Schema compliance.** Front matter against `procedure.schema.md` section 2: every `yes` key
   present; `inputs`/`outputs` are section-2.1 artifact ids or repo paths; `back_edges` form; `trial`
   form (`metric`, `kill`, `until`); `decision` present. The eight required headings present and in
   order (section 3). Rule lines are `R-L0-22.<k>. <sentence>`, the root `R-L0-22` is defined in
   `L0-ROOT.md`, and every id is defined once (LCC-1).
2. **Internal contradictions.** 0083 vs P-L0-008 0.2 vs L0-ROOT vs FRAMES.md: binding-vs-trial
   wording; round budget and back edge `3>2/1/owner`; stream limits; counters (DEFER backlog 2,
   DEFERRED_ACCEPTED 0, frames closed under P-L0-008 = 0); the `until=frames-5` batch.
3. **Consistency with PROTO-DEC-0052, 0079-0083 and AGENTS.md sections 2 and 6.** Authority,
   append-only decisions, the shared-document lock, the registry and the trigger rules.
4. **Loopholes.** Renaming work to escape the limits; DEFER and SUSPENDED as graveyards; authors
   classifying their own blockers; owner override without a recorded pause; DIG/RER gaming; stages
   versus frames; creating a stream to escape a limit; any rule that can be satisfied by prose only.
5. **Work without a decision.** Does any rule create work that serves no decision, or block a path
   with no gate that can release it?

## Output

- One file: `docs/reviews/2026-09-26-mistral-p-l0-008-0.2-review.md`.
- Header per AGENTS.md section 5 item 4: reviewed commit SHA, working tree status, reviewer model,
  date (UTC), scope, verdict. Mode: ADVISORY (non-certifying).
- Verdict: one of `PASS`, `RECOMMENDATION`, `FAIL`. Every `FAIL` claim carries one reproduction
  command and its printed output.
- At most 250 lines. Findings listed with severity (`BLOCKING` / `RECOMMENDATION` / `NOTE`), each
  with `path:line` evidence. State explicitly what you could not check.
- The file must be UTF-8 without BOM with LF line endings (AGENTS.md section 11; `docs/reviews/` is
  protocol-owned and the validator fails on CRLF or a BOM).
- No edits to any other file; no commits, tags, pushes or branches; journal plus
  `record --quick` as `COMMON.md` describes, frame `task:governor-review-mistral`.
