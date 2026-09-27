# Launch: task:roadmap-2a-reviewer (DeepSeek Flash via kilo, its own session)

Program: ROADMAP-1, wave 2A (kernel batch 1). You are the adversarial reviewer of the batch before
the CANDIDATE freeze. Work in the worktree `D:\Colabs\.ai\runtime\kb1` (branch `kernel-batch-1`).
The diff under review is `a4312e8..HEAD` - the base is `a4312e8`, not `fbc3ce4` (that was the
pre-task base; the branch was cut after the task file landed).

## Session

- Start: `node .ai/bin/protocol-session.cjs start --agent deepseek`; use the printed owner name.
- Read: `LAUNCH-2A.md`, `W2A-EXECUTION.md`, `PACKET-1.md` (Q3), and the diff itself.
- Expected environment fact: the branch shows 101 journals and one validator WARN - expected, do
  not archive journals here.
- Read-only on the reviewed files; you write your review file, your journal and your evidence,
  committed on the branch with explicit paths; do not push. Reproduce every FAIL claim.

## Checklist (per item, with verdict lines)

1. **W0 parser**: raw line kept in the attempt record; colon-optional, space/NBSP/comma/dot
   grouping, K/M suffixes; the five named tests exist and fail before the fix; the real captured
   pair (`252`+U+00A0+`154`) parses to `252154`.
2. **W5**: see the mandatory checks a, b, d below.
3. **W1-retire**: `run-chain.cjs` marked retired with the one-line pointer, not deleted.
4. **RUNS.jsonl**: root cause identified; a real dispatch attempt appends a row (check e).
5. **S-7**: `launch-test.cjs` throttled, WMI scenarios still meaningful.
6. **S-10**: the vibe note added to `.ai/docs/clients.json`; the file validates.
7. **Hygiene**: failing-test-first per item; one commit per item; explicit paths; no force/rebase/
   amend; no edits outside the named items; encodings (`.ps1` ASCII, LF, UTF-8 no BOM).

## Mandatory checks (owner-relayed; violations of a-c are BLOCKING and go to the single fix pass)

- **a. Fixture move byte-identical.** The 40 files of `prompts/DISPATCH.json` + `prompts/run/*`
  are executed inputs under owner decision A (`CLOSURES.jsonl` CR-F01-1;
  `docs/reviews/2026-09-27-claude-f01-stage12-closure.md` lines 86-89). They must move as a
  byte-identical `git mv`; build a sha256 list before (`git show a4312e8:<path>` for every file)
  and after (working file), and FAIL on any content change.
- **b. T5 stays green without editing the fixture.** The test must copy the fixture into a
  temporary root that recreates the original relative layout
  (`docs/research/2026-09-26-ownerideas-revision/prompts/...`) and run the dispatcher against that
  root. Editing `DISPATCH.json` to make T5 pass is a FAIL.
- **c. Forbidden edits.** `docs/reviews/*`, `docs/research/CLOSURES.jsonl`, `.ai/DECISIONS.md` and
  the existing CR-F01-1 archive INDEX row are untouched. The move gets a NEW archive INDEX row.
  Historical records in `tests/fixtures/runrecord/*.jsonl` keep their original path strings; only
  where the tests read from disk may change.
- **d. Hermeticity.** After a killed `node tests/dispatch.test.cjs`, `git status` in the worktree
  is clean (no `t20-launch.md`-class leaks).
- **e. RUNS.jsonl.** The test proves the append with a temporary root and checks the row's shape.

## Deliverable

- `docs/reviews/2026-09-27-deepseek-roadmap-2a-review.md` (<= 250 lines): header with the reviewed
  commit, tree status, reviewer model, date (UTC), scope; one line per item; explicit
  `PASS` / `RECOMMENDATION` / `FAIL` / `BLOCKED` verdict; BLOCKING list if any.
- Journal entry + `record --quick`; commit your files on the branch, explicit paths, no push.
- The flow after you: one fix pass (if needed), CANDIDATE freeze, owner-lane full suite, the
  unified audit prompt, then the MiMo and Sol certifiers in parallel.
