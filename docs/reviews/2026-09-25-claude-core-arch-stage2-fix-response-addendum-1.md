# Fix response, addendum 1: CB-17 attempt 2 and the owner's answers to CB-12, CB-13 and CB-21

- Author: Claude, session `claude-c73232724159e5bd`, CORE-ARCH implementer (PROTO-DEC-0054).
  Certifies nothing. Model and effort: `claude-opus-5-5`, set at launch. Client: Claude Code in
  VS Code on the owner's Windows workstation.
- Date (UTC): 2026-09-25. Mode: IMPLEMENTER addendum (not a review, no verdict token).
- Baseline: `e44686b`, the head of `docs/reviews/2026-09-25-claude-core-arch-stage2-fix-response.md`,
  pulled locally after a pre-pull review. Candidate: the last commit that changes this file
  (`git log -1 --format=%H -- <this file>`). The owner's launch message names its full SHA; read
  every path from that commit (CORE-ARCH-4 section 9 rule 7). `docs/core-arch/PROPOSAL-node-validator.md`,
  in the same commit, is a proposal for the owner and outside this review.
- Diff under review: `ab23c63..<candidate>`, that is the 24 commits of the fix response plus this
  one. The fix response stays the answer for every other row, and its "Re-review instructions"
  apply, with the order and the additions below. Paths are repository-relative.

## Order of the second pass

1. Package L first: `docs/research/2026-09-25-improvement-research/prompts/launch.cjs`,
   `launch-test.cjs`, `launch-fake-client.cjs`, `K-launch.md`, the package `README.md`, and
   `docs/core-arch/stage-4/P-L3-004-route-failover.md`. The research launch waits only for this
   verdict (README "Status").
2. Then package S (stage 2), as the fix response lists it.

Report the two verdicts separately, so that L can release the launch while S is still under review.

## What changed since e44686b

| Item | Outcome | What changed | Where |
|---|---|---|---|
| CB-17 | fix attempt 2 | Reopened by the implementer: at `e44686b` the Windows self-test gave 60/61 in three of three runs; `zz-t12` said "refused before --stop (null)", and one grandchild outlived the run. An instrumented copy showed the record at the check as `known: {}`, status `STARTING`. Under the suite's load the watchdog died before its first tick recorded any descendant, and `throughDead` walks only one dead level. Fix: (1) the tree is scanned one and three seconds after the spawn, then on every tick, and each scan is written to the record. (2) An attempt whose watchdog died before it settled blocks every start until the owner's `--stop`. (3) `--stop` settles such an attempt and warns when it was never scanned. Residual: a descendant no scan saw cannot be named later; recorded as a risk row. Under R-L0-11, if the second pass finds this unresolved, it goes to the owner. | `launch.cjs` `startBlockers`, `run` (`scan`, tick), `stop`; P-L3-004 R-L3-004.7, state table, risks |
| CB-17 test | changed | `zz-t12` now kills the watchdog at 6 s, after the tree was recorded, and requires `--stop` to stop the grandchild. The new `zz-t15` kills it at 2.5 s, maybe before any record. It requires the refusal, then the start allowed after `--stop`; a grandchild left alive is stopped by the test itself. The `orphan-exit` client of `zz-t11` lives 6 s instead of 2.5 s, so the scans see its grandchild under load. | `launch-test.cjs`, `launch-fake-client.cjs` |
| CB-12 | owner: A | PROTO-DEC-0068 narrows how far the Supersedes line of PROTO-DEC-0067 reaches. No code change. | `.ai/DECISIONS.md`, `docs/decisions/REGISTRY.md` |
| CB-13 | owner: confirmed | PROTO-DEC-0069 adds the missing O-08 sentences. | same |
| CB-21 | owner: new terms | PROTO-DEC-0070 quotes the owner's words in full. Implementation, which is the implementer's reading and is so marked in the block and in R-L3-004.9: (a) vibe `--enabled-tools` for read_file, grep, write_file, edit and powershell, then `--auto-approve --trust`. The tool names are vibe 2.25.5's tool classes; `--trust` only skips the trust prompt. (b) copilot `-C <worktree>` with `--allow-all-tools --no-ask-user`. `--no-ask-user` is listed by copilot 1.0.88 `--help`. Commit, push and tag are denied through `--deny-tool "shell(...)"`, and `--add-dir <temp>` is dropped. (c) Every attempt runs in a disposable git worktree of HEAD under the system temp directory, with the research package copied in. (d) A scope check runs on every tick and again before the copy back: only the job's outputs and new journals may change, HEAD may not move, and the tag list may not change. Otherwise `SCOPE_STOP`: nothing is copied back and the worktree is kept. (e) Every git the executor runs gets an unusable push URL through `GIT_CONFIG_COUNT`. (f) `SAFE` admits parentheses for (b). | `launch.cjs` (commands, worktree section, `run`, `settle`, `status`); P-L3-004 R-L3-004.9 |
| K-launch | extended | Directives 0068-0070. Step 0: the launcher files at HEAD must equal those of the reviewed commit the owner's message names (`git diff --quiet`), so later unrelated commits do not block the launch, and no tracked file may be changed. Step 2: the self-test runs before `--check`. Step 6: worktrees and `SCOPE_STOP`. Step 7: `git status --short` after every job settles, and `--stop` for an unsettled attempt. | `K-launch.md` |
| Records | updated | P-L3-004 0.3; the package README states the test counts and the launch condition; `.ai/TASK.md` gets one "Next" paragraph under the lock. | as named |

## Verified here, and how

- Pre-pull, the owner's workstation: I exported the three launcher files at `e44686b` into a
  scratch directory with `git archive` and ran them. `--pure` gave 46/46. The full self-test gave
  60/61 in three runs of three, always with `zz-t12` failing. The instrumented copy is described
  above. This is the reproduction for CB-17 attempt 1.
- Candidate, the same machine (Windows 11, node 22.21.0):
  - `node --check` passes on the three files, and `--pure` gives 52/52.
  - The first three full runs after the fix gave 68/69 with one `zz-t11` failure, then 69/69 twice.
    The early scans had not completed under load, and `zz-t12` was never scanned in any run. That
    is why the tests were split as in the table.
  - After the split, three consecutive full runs gave 70/70, exit 0, about 17 s each. One more fix
    followed: a fresh worktree name on each retry in `prepareWorkdir`. Three more runs then gave
    70/70, and `--pure` 52/52. After every run, no test process, no `colabs-research` worktree and
    no `zz-*` file was left in the checkout.
- `launch.cjs --check`, all jobs: 24/24 commands parse through each client's own help; no model
  was called.
- Push block: `git push --dry-run origin v2.0.0`, with the launcher's environment, exits 128
  ("remote helper 'no-push' aborted session").
- `validate-protocol.ps1` and `test-protocol.ps1`: results in this session's journal Evidence
  block, recorded over the candidate tree.

## Not verified

- `--smoke` and `--start`: both call models; they are the owner's steps in K-launch.
- Real clients in a worktree. Nobody has seen yet whether codex, agy, copilot, vibe or kilo create
  files in their working directory, which would stop them as out of scope (a P-L3-004 risk row).
  `--smoke` runs in a plain temp directory, so it does not test this.
- The effect of copilot's `--deny-tool "shell(git ...)"` patterns (only parsing is checked), and
  the availability of vibe's `powershell` tool on this machine.

## Points to attack in package L

1. Scope bypasses: a write by absolute path outside the worktree (named as a residual); writes to
   git-ignored paths, which `git status` does not show; the journal pattern `JOURNAL_RE`; the
   baseline hashes of the copied package; renames in `parsePorcelainZ`.
2. `importResults`: are only fixed output paths and new journals copied? Can anything else reach
   the checkout?
3. The unsettled-attempt refusal: can it block a job forever, or be passed without `--stop`?
4. `SAFE` with parentheses, under `cmd.exe` through `shell: true`.
5. The `GIT_CONFIG_COUNT` override, when the parent environment already sets it.
6. The worktree lifecycle: removal only when the tree is gone and there was no scope stop; worktrees
   left by a crashed watchdog; six `git worktree add` calls at once.

## Launch line for DeepSeek (model and effort named at launch, as in round 1)

`Read and follow the file docs/reviews/2026-09-25-claude-core-arch-stage2-fix-response-addendum-1.md`
with, in the same message, `Candidate: <full SHA of the last commit that changes this file>`.
