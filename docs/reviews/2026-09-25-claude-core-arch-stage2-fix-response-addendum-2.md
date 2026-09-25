# Fix response, addendum 2: report L second pass (F-L1..F-L5) and one implementer finding

- Author: Claude, session `claude-c73232724159e5bd`, CORE-ARCH implementer (PROTO-DEC-0054).
  Certifies nothing. Model and effort: `claude-opus-5-5`, set at launch. Client: Claude Code in
  VS Code on the owner's Windows workstation.
- Date (UTC): 2026-09-25. Mode: IMPLEMENTER addendum (not a review, no verdict token).
- Answers `docs/reviews/2026-09-25-deepseek-research-launch-review-attempt2.md` (report L, second
  pass, FAIL). Report S of the second pass
  (`docs/reviews/2026-09-25-deepseek-core-arch-stage2-review-attempt2.md`) gave RECOMMENDATION
  with no mandatory defect. Its four notes go to the next stage-2 round and are not answered here.
- Baseline: `87257cc`, the candidate of the second pass. Candidate: the last commit that changes
  this file (`git log -1 --format=%H -- <this file>`). The owner's launch message names its full
  SHA; read every path from it (CORE-ARCH-4 section 9 rule 7).
- Scope of the third pass: package L only. That is `launch.cjs`, `launch-test.cjs`,
  `launch-fake-client.cjs`, `K-launch.md`, the package `README.md`, step 1 of `A-research.md`,
  `B-research.md`, `A-synthesis.md` and `B-synthesis.md`, and `P-L3-004-route-failover.md`.

## Owner decisions this round (chat, 2026-09-25)

- The owner assigned the F-L1 fix to this session: "исправления вносишь ты". Under PROTO-DEC-0072
  item 3, a change to protocol tooling takes the T7 floor, whose Anthropic cell is
  claude-fable-5-1. This session runs claude-opus-5-5. The mismatch was accepted by the owner and
  is recorded in the journal.
- Outside L's scope, the owner lifted the council's pre-launch gate item 1, on the condition that
  the second pass had finished and its processes had ended; both held. The Roles shim, which is
  why the council waited for L, was verified by the second pass.

## Answers

| Id | Outcome | What changed | Where |
|---|---|---|---|
| F-L1 | fixed (attempt 1 of this root cause) | The push block no longer depends on the remotes that exist at launch. The executor's environment carries `url.no-push://blocked.insteadOf` with an empty value, the second pass's remedy 1, and the same rule is written into each copy's own config. It rewrites every URL git resolves. Measured before choosing: `pushInsteadOf` misses a remote with an explicit push URL (that push succeeded), while `insteadOf` blocks existing remotes, added remotes, explicit URLs and explicit push URLs alike. Deleting the rule from the config changes the config, which is a scope stop (F-L2). | `launch.cjs` `NO_PUSH`, `NO_PUSH_ENV`, `prepareWorkdir`; `launch-test.cjs` `pushBlockChecks` |
| F-L2 | fixed at the root | A linked worktree shares config, refs and hooks with the checkout. Each attempt now runs in a private clone of HEAD (`git clone --shared --no-checkout`, then `checkout --detach`) under `<system temp>/colabs-research/`, with every remote removed, so nothing a job does to its repository reaches the checkout. `workdirState` also hashes `for-each-ref`, the clone's `.git/config` and its hooks directory; a change to any of them is `SCOPE_STOP`. The launcher's own git calls in a clone run with `core.fsmonitor=false` and an empty `core.hooksPath`. New scenario `zz-t16`: a job adds a remote and creates a branch in its copy; the job stops with "refs changed", and the checkout's config and refs are unchanged. | `launch.cjs` `gitIn`, `workdirState`, `scopeCheck`, `prepareWorkdir`, `dropWorkdir`; `launch-fake-client.cjs` mode `git-escape`; `launch-test.cjs` `zz-t16` |
| F-L3 | recorded | `--trust` is stated in R-L3-004.9 as the implementer's reading: it only skips the trust prompt for the clone and adds no tool. | `P-L3-004` R-L3-004.9 |
| F-L4 | recorded | Stated in R-L3-004.9: git-ignored paths are not read by the check, are never copied back, and are deleted with the clone. Inside a private clone they cannot reach the checkout. | `P-L3-004` R-L3-004.9; `launch.cjs` comment on `workdirState` |
| F-L5 | recorded | Stated in R-L3-004.9 and K-launch step 7: settled clones are deleted; a clone kept by `SCOPE_STOP`, or left by a dead watchdog, stays under `<system temp>/colabs-research/` until the owner removes it after inspection. K-launch step 7 also adds `git remote -v`. | `P-L3-004`; `K-launch.md` steps 6-7 |
| IF-1 (implementer) | fixed | Found by the implementer and missed by both passes. Step 1 of the four researcher and synthesiser prompts required `git rev-parse --show-toplevel` to print `D:/Colabs`, or else stop. Under PROTO-DEC-0070 every job runs in a copy, so every researcher would have stopped at step 1. Step 1 now expects the job's copy under `colabs-research/` and stops on anything else. K-launch's operator still runs in `D:/Colabs`. | `A-research.md`, `B-research.md`, `A-synthesis.md`, `B-synthesis.md` step 1 |
| Records | updated | P-L3-004 0.4: the rule is rewritten as a list (copy, push, scope check, copy back, ignored paths, lifecycle, `--trust`); state rows name the clone; a new risk row "An executor pushes" states the residual. README states the test counts. | as named |

Divergence recorded, not hidden. The Consequences of PROTO-DEC-0070 describe the mechanism as "a
disposable git worktree per job attempt". That sentence was the implementer's reading, not the
owner's words, and the block is immutable. The mechanism is now a private clone, for F-L2, and its
current home is R-L3-004.9.

## Verified here, and how

On Windows 11, node 22.21.0, git for Windows:
- `node --check` on the three launcher files passes. `--pure` gives 55/55.
- Full self-test: 80/80 in three consecutive runs, exit 0, about 17 s each. The 80 are 16
  scenarios, 55 pure checks, 6 push-block checks and 3 lock checks. After every run: no test
  process, no copy under `colabs-research/zz-*` and no worktree was left; the checkout had no
  remote `evil` and no `refs/heads/zz-probe`.
- `launch.cjs --check`: 24/24, no model called. `launch.cjs --preflight`: 9/9, nothing written.
- The `pushInsteadOf` versus `insteadOf` probe on scratch repositories, as in the F-L1 row.
- `validate-protocol.ps1` and `test-protocol.ps1`: in this session's journal Evidence over the
  candidate tree.

## Not verified

- Real clients in a clone: `--smoke` runs in a plain temp directory. Whether a client creates
  files in its working directory, and so meets `SCOPE_STOP`, shows only in the canary of K-launch
  step 5.
- The effect of `insteadOf` on a client's own network use of git. The jobs need none; a client
  that fetched would fail closed.

## Points to attack in package L

1. Can a job reach the checkout's repository from its clone? Consider the `--shared` alternates
   file, writes into the checkout's `.git` by absolute path (named as a residual), and hooks or
   fsmonitor on the launcher's own git calls.
2. Is there a push path around a rule that sits in both the environment and the config? Consider a
   job that clears both in one command (named as a residual), and git protocols or helpers that
   `insteadOf` does not rewrite.
3. Is the scope check complete over refs, config and hooks? A `SCOPE_STOP` that should have fired
   and did not?
4. Does step 1 of the four prompts hold for the real launch path, including a Kilo fallback?

## Launch line for DeepSeek (model and effort named at launch)

`Read and follow the file docs/reviews/2026-09-25-claude-core-arch-stage2-fix-response-addendum-2.md`
with, in the same message, `Candidate: <full SHA of the last commit that changes this file>`.
