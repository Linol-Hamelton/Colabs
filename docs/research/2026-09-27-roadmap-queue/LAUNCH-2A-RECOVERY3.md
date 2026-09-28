# Launch: task:roadmap-2a-recovery3 (Gemini 3.8 Flash high via agy; recovery 3 of 3)

Continue in the EXISTING journal `.ai/worklog/gemini-d7d44e9eac34702c.md` (owner
`gemini-d7d44e9eac34702c`); do not start a second journal. Worktree `D:\Colabs\.ai\runtime\kb1`,
branch `kernel-batch-1`, HEAD = candidate `5bc9940` (pushed; clean). This is the third attempt
(PROTO-DEC-0051 item 4): a third fall means FALLEN and the owner decides.

## Deliverable (ONLY this; no code, no tests)

ONE unified adversarial audit prompt for the wave-2A candidate, per AGENTS.md section 2
(PROTO-DEC-0038 item 1), at most 150 lines, saved as
`docs/reviews/2026-09-28-gemini-wave2a-adversarial-prompt.md`, last line `STATUS: READY`.

The prompt must:

1. Bind to the candidate: branch `kernel-batch-1` @ `5bc9940`, reviewed range `a4312e8..5bc9940`,
   with the working-tree requirement (clean candidate; the certifiers' own artifacts excepted).
2. Cover every item of the implementation, each with named attack surfaces and the evidence a
   certifier must produce (commands, artifacts, reproductions):
   - W0 parser `fbff763`: optional colon, space/NBSP/comma/dot grouping, K/M suffixes, the real
     captured NBSP pair `252`+U+00A0+`154` -> `252154`, `rawUsage`, the schema and its validator;
   - W5 hermetic fixtures `61c7159`: 40 files byte-identical across the range, `DISPATCH.json`
     unchanged, T5 temp-root recreation, the archive INDEX `CR-W5-1` row and untouched `CR-F01-1`,
     and the `getRepoRoot()` refactor itself;
   - W1-retire `cf99cdf`: the one-line retired pointer, the file kept;
   - item 4 `fde0248`: the root cause (emptied `docs/ops/RUNS.jsonl`), the `runsFile` top-key and
     `isSafeRelativePath` validation, null-safe early returns, the two authentic records, schema match;
   - item 5 S-7 `653117c`: bounded concurrency 4, exactly-once slot release on every terminal path,
     unchanged scenario semantics;
   - item 6 S-10 `fa74541`: the vibe `note` and refreshed `resume.note`; the file validates;
   - hygiene: one commit per item; explicit paths; no force/rebase/amend; `.ps1` ASCII; UTF-8/LF.
3. Carry the DeepSeek review (commit `5bc9940`,
   `docs/reviews/2026-09-27-deepseek-roadmap-2a-review.md`) as KNOWN items - recorded notes to
   verify for closure, not to rediscover and not to waive:
   - F-2A-01 (LOW): the W2A report sentence misdescribes the INDEX edit;
   - F-2A-02 (LOW): the undisclosed behaviour-preserving `getRepoRoot()` refactor in the W5 commit;
   - F-2A-03 (LOW): tests transiently write `.ai/worklog/gemini-0123456789abcdef.md` into the
     tracked tree;
   - F-2A-04 (INFO): the `reset: moving to HEAD~1` reflog note;
   - F-2A-05 (LOW): T30 does not exercise the bare default `docs/ops/RUNS.jsonl` path;
   - F-2A-06 (INFO): validator WARN, 102 session journals against the cap 100.
4. Require the certifiers to render an explicit verdict per item and per overall candidate
   (PASS / FAIL / BLOCKED / RECOMMENDATION), with at least one reproduction per FAIL claim. The
   prompt is the audit artifact for the two independent certifiers of wave 2A (MiMo-V2.6-Pro and
   GPT-5.6 Sol, PROTO-DEC-0090 item 4).
5. Add no new decision and change no code: this is an audit prompt, not a fix.

## Rules

- Read-only on the candidate files; write only the prompt file and your journal.
- No code changes, no test runs, no full suite.
- Journal entry with the five labels; then
  `node .ai/bin/protocol-handoff.cjs record --quick --owner gemini-d7d44e9eac34702c`.
- `git add` explicit paths (the prompt file and the journal); commit on `kernel-batch-1`; do NOT push.
- Finish with a short journal update naming the prompt path.
