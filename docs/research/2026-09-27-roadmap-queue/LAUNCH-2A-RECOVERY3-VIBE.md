# Launch: task:roadmap-2a-recovery3-vibe (Mistral Medium 3.5 via vibe, its own session)

Per PROTO-DEC-0095 item 1: the single agy attempt failed (`2A-RECOVERY3-FALLEN.md`, 2026-09-28) and
vibe is the successor with the same narrow task. Work in the worktree `D:\Colabs\.ai\runtime\kb1`
(branch `kernel-batch-1`; the candidate code is `5bc9940`). The model is Mistral Medium 3.5 while
the `glm-5-3` alias stays unresolved - record it as used, and check the vibe log for
"falling back" before claiming any model (PROTO-DEC-0094 B.1).

## Deliverable (ONLY this; no code, no tests)

ONE unified adversarial audit prompt for the wave-2A candidate, per AGENTS.md section 2
(PROTO-DEC-0038 item 1), at most 150 lines, saved as
`docs/reviews/2026-09-28-vibe-wave2a-adversarial-prompt.md`, last line `STATUS: READY`.

The prompt must:

1. Bind to the candidate: branch `kernel-batch-1` @ `5bc9940`, reviewed range `a4312e8..5bc9940`,
   with the working-tree requirement (a clean candidate; the certifiers' own artifacts excepted).
2. Cover every item of the implementation, each with named attack surfaces and the evidence a
   certifier must produce (commands, artifacts, reproductions):
   - W0 parser `fbff763`: optional colon; space/NBSP/comma/dot grouping; K/M suffixes; the real
     captured NBSP pair `252`+U+00A0+`154` -> `252154`; `rawUsage`; the schema and its validator;
   - W5 hermetic fixtures `61c7159`: 40 files byte-identical across the range, `DISPATCH.json`
     unchanged, the T5 temp root, the archive INDEX `CR-W5-1` row and the untouched `CR-F01-1`, and
     the `getRepoRoot()` refactor itself;
   - W1-retire `cf99cdf`: the one-line retired pointer; the file kept;
   - item 4 `fde0248`: the root cause (the emptied `docs/ops/RUNS.jsonl`), the `runsFile` top-key and
     the `isSafeRelativePath` validation, the null-safe early returns, the two authentic records,
     the schema match;
   - item 5 S-7 `653117c`: bounded concurrency 4; exactly-once slot release on every terminal path;
     unchanged scenario semantics;
   - item 6 S-10 `fa74541`: the vibe `note` and the refreshed `resume.note`; the file validates;
   - hygiene: one commit per item; explicit paths; no force/rebase/amend; `.ps1` ASCII; UTF-8/LF.
3. Carry the DeepSeek review (commit `5bc9940`,
   `docs/reviews/2026-09-27-deepseek-roadmap-2a-review.md`) as KNOWN items - recorded notes to verify
   for closure, not to rediscover and not to waive: F-2A-01 (the report sentence), F-2A-02 (the
   undisclosed `getRepoRoot()` refactor), F-2A-03 (the transient test write into `.ai/worklog/`),
   F-2A-04 (INFO, the reflog note), F-2A-05 (T30 and the bare default path), F-2A-06 (INFO, the
   journal-count warning).
4. Require the certifiers to render an explicit verdict per item and for the whole candidate
   (PASS / FAIL / BLOCKED / RECOMMENDATION), with at least one reproduction per FAIL claim. The
   prompt is the audit artifact for the two independent certifiers of wave 2A (MiMo-V2.6-Pro and
   GPT-5.6 Sol, PROTO-DEC-0090 item 4).
5. Add no new decision and change no code: this is an audit prompt, not a fix.

## Inputs

The diff `a4312e8..5bc9940` of `kernel-batch-1`, the DeepSeek review at `5bc9940`, and
`W2A-EXECUTION.md` in this folder.

## Session rules

- `node .ai/bin/protocol-session.cjs start --agent mistral`; use the printed owner name.
- Read-only on the candidate files; write only the prompt file and your journal.
- No code changes, no test runs, no full suite.
- Journal entry with the five labels; then
  `node .ai/bin/protocol-handoff.cjs record --quick --owner <your session>`.
- `git add` explicit paths (the prompt file and the journal); commit on `kernel-batch-1`; do NOT push.
- Finish with a short journal update naming the prompt path.
