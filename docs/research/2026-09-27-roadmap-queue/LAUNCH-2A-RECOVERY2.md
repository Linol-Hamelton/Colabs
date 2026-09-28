# Launch: task:roadmap-2a-recovery2 (Gemini 3.8 Flash high via agy; recovery 2 of 3)

Continue in the EXISTING journal `.ai/worklog/gemini-d7d44e9eac34702c.md` (owner
`gemini-d7d44e9eac34702c`); do not start a second one. Worktree `D:\Colabs\.ai\runtime\kb1`,
branch `kernel-batch-1`; the base is `a4312e8`. This is recovery 2 of 3 (PROTO-DEC-0051 item 4);
a third fall means FALLEN and the owner decides.

## First: record what is already done (PROTO-DEC-0048 item 5)

1. Write your journal entry now, covering the completed and committed work: W0 `fbff763`,
   W5 `61c7159`, W1-retire `cf99cdf` (one commit per item; W5 moved the 40 fixture files
   byte-identically into `tests/fixtures/prompts/`, restored `DISPATCH.json`, and the archive INDEX
   row is in place).
2. Run `node .ai/bin/protocol-handoff.cjs record --owner gemini-d7d44e9eac34702c --quick` and
   commit your journal (explicit path).

## Then the remaining items (one commit per item; failing test first)

3. **Item 4**: find why dispatcher runs are not written to `docs/ops/RUNS.jsonl` (the file is
   present and 0 bytes while dispatcher runs exist); a failing test that captures the root cause,
   then the fix so a real dispatch attempt appends a row; keep the store format sane.
4. **Item 5 (S-7)**: throttle `docs/research/2026-09-25-improvement-research/prompts/launch-test.cjs`
   scenarios so the WMI queries do not time out; keep scenario semantics.
5. **Item 6 (S-10)**: add to the vibe client profile in `.ai/docs/clients.json` the note: never
   edit an entry after `record`; add a new entry. The file must still validate.
6. Write `docs/research/2026-09-27-roadmap-queue/W2A-EXECUTION.md` (per item: commit sha, test
   names, deviations, open questions) and commit it.

## Rules

- Do NOT wait on long background tasks and do NOT run the full suite - the operator runs
  `test-protocol.ps1` afterwards on an idle workstation. Targeted test files only.
- `git add` explicit paths; no force/rebase/amend; do not push. Write one checkpoint line to your
  journal after each block. Kernel paths in scope: `.ai/bin/` (item 4 only), `tests/`, `docs/specs/`,
  `.ai/docs/clients.json` (item 6) - nothing else.
- Finish with a short journal update and `record --quick`.
