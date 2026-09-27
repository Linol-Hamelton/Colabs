# Launch: task:roadmap-w1-reviewer (DeepSeek Flash via kilo, its own session)

Program: ROADMAP-1. Wave 1 (docs and hygiene). You are the independent opposing reviewer for the
whole wave. You produce ONE statement: PASS or RECOMMENDATION (PROTO-DEC-0038 item 2; the wave
budget is one review plus at most one fix round). Review is not certification (PROTO-DEC-0041
item 1). You never certify work you authored or controlled.

## Session

- Start: `node .ai/bin/protocol-session.cjs start --agent deepseek`; use the printed owner name for
  your journal, the lock (only if you must edit a shared document - prefer not to) and evidence.
- Read first: `AGENTS.md`, `PROMPT.md` (wave 1), `PACKET-1.md`, `LAUNCH-W1.md`,
  `W1-EXECUTION.md`, `BASELINE.md`.
- The wave under review is the diff `f2d33fb..531e872` on `v2.0.0` (nine commits, all pushed).
- Read-only on the reviewed files. You write only: your review file, your journal, your evidence.
  Do not fix anything - findings go into the report. Reproduce every FAIL claim.

## Checklist (every item gets a verdict line)

1. **F-02 closure** (`c3b9b53`, `3dc7de5`, `aac9681`): the disposition (`20 files` to
   `docs/research/archive/2026-09-26-model-layer/`, all ARCHIVE) matches the artifact set; the
   `FRAMES.md` F-02 row shows `CLOSED`, verdict `ACCEPT at the round-2 gate (PACKET-1 Q1)` and
   `receipt: CR-F02-1 c3b9b53 K:0 C:0 A:20 D:0 R:0 T:0`; the `CLOSURES.jsonl` line is appended
   (never rewritten) and consistent with the FRAMES row; every active reference to the old path is
   repointed (`PROMPT.md`, `LAUNCH-W1.md`, `FRAMES.md`, `docs/research/archive/INDEX.md` row); zero
   dangling references. The closer did not certify its own receipt - that is exactly this review.
2. **TASK.md refresh** (`793a825`): `.ai/TASK.md` is <= 80 lines, "Current state" matches the
   2026-09-27 facts, "Next" is pointers, and the replaced text is preserved in `.ai/ARCHIVE.md`
   (compare against the previous revision - no text lost).
3. **Template notes S-4/S-10** (`2a5f67b`): the language rule sits at the point of use in
   `templates/`; the "never edit an entry after record" rule is in `.ai/docs/CLI-AGENTS.md` and
   `templates/`; `.ai/docs/clients.json` is untouched.
4. **Journal archive** (`f4e95c7`): 28 journals archived whole into `.ai/ARCHIVE.md`; spot-check
   at least 3 against `git show <sha>^:<path>` for byte-in-text preservation; no open reference
   points to an archived file; <= 100 journals remain; the operator and executor journals stay.
5. **Baseline** (`654a104`): method plausible (exclusive runs, sampler, Bn counted as distinct
   descendant PIDs, Bm as peak tree RSS); numbers internally consistent with the telemetry
   excerpts; suite 24/24; validator `0 warning(s)` at the head.
6. **S-5 route note** (`aac9681`): the verbatim 2026-09-25 ladder section is preserved (the
   `tests/resolver.test.cjs` anchor); the 2026-09-27 route note names `deepseek/deepseek-flash`,
   effort `max`; BACKLOG S-5 closed.
7. **Hygiene**: no edits under `.ai/bin/`, `tests/`, `docs/specs/` or `.ai/docs/clients.json` in
   the diff; commits name explicit paths; `git status` clean; the executor journal carries a
   `record --quick` evidence block; encodings sane (UTF-8, LF; `.ps1` ASCII).
8. **Red flags**: invented numbers, self-certification, scope creep, lost text, dangling
   references, prompt caps exceeded.

## Deliverable

- `docs/reviews/2026-09-27-deepseek-roadmap-w1-review.md` (<= 250 lines) with the mandatory header:
  reviewed commit (`git rev-parse HEAD`), tree status, reviewer model, date (UTC), scope, verdict.
- Your five-label journal entry + `node .ai/bin/protocol-handoff.cjs record --owner <your owner>
  --quick`.
- Commit your files with explicit paths; do not push (the operator pushes). Record your model
  `deepseek/deepseek-flash`, effort and usage from your client output.
