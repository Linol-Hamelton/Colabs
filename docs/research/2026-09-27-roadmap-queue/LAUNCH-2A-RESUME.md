# Launch: task:roadmap-2a-resume (Gemini 3.8 Flash high via agy; recovery 1 of 2)

The previous 2A session died on a provider EOF (`streamGenerateContent: EOF`) mid-W5. W0 is
committed (`fbff763`). The tree holds the staged W5 progress: 40 renames of `prompts/DISPATCH.json`
and `prompts/run/*` into `tests/fixtures/prompts/...`, the README stub deletion, edits to
`tests/dispatch.test.cjs`, `tests/dispatch-fake-client.cjs`, `docs/research/archive/INDEX.md`,
`.ai/bin/protocol-dispatch.cjs` and the ops README, and an untracked session journal
(`gemini-d7d44e9eac34702c.md`). Resume from the repository state, not from memory. The branch base
is `a4312e8` (the `fbc3ce4` wording in `LAUNCH-2A.md` is stale). Follow `LAUNCH-2A.md` for items
3-6 and for the session rules (no push, explicit paths, one commit per item, failing test first).

## Immediate task: finish W5 to the strict standard

1. **Byte-identity of the 40 moved files.** For every old path, compare
   `git show HEAD:<old-path>` against the current file (sha256): all 40 must be identical.
   `DISPATCH.json` currently shows as rename + modification (`RM`) - restore its bytes from HEAD.
   FAIL condition for the reviewer: any content change in these 40 files.
2. **T5 without editing the fixture.** T5 must stay green by copying the fixture into a temporary
   root that recreates the original relative layout
   (`docs/research/2026-09-26-ownerideas-revision/prompts/...`) and running the dispatcher against
   that root. Never edit `DISPATCH.json` to make a test pass.
3. **Hermeticity.** Launch files and state go into a temporary root; after a killed
   `node tests/dispatch.test.cjs` the worktree `git status` is clean (no `t20-launch.md`-class
   leaks).
4. **Leftover directory.** The archived-away `docs/research/2026-09-26-ownerideas-revision/`
   (README stub) gets archived with a NEW `docs/research/archive/INDEX.md` row; the existing
   CR-F01-1 row is untouched; references to the fixture paths are repointed where the tests read
   them.
5. Commit W5 as its own item commit; then continue W1-retire, the RUNS.jsonl investigation,
   S-7 and S-10 per `LAUNCH-2A.md`, one commit per item, failing test first.
6. Finish: one full `test-protocol.ps1` run (exclusive - scan first), `W2A-EXECUTION.md`, your
   five-label journal entry, `record --quick`; write one checkpoint line to your journal after each
   block; no push.

If the provider errors again at start, exit and report; the operator retries.

Session identity: continue in the existing journal `.ai/worklog/gemini-d7d44e9eac34702c.md` (same
owner name `gemini-d7d44e9eac34702c`); do not start a second journal.
