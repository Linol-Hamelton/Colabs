# Report L, second pass - the research/launch package at the fix-response candidate: verdict FAIL (one reproduced push-control bypass)

**Date**: 2026-09-25
**Reviewed commit**: `87257ccea610a7bec29ae6d46b55c50635854650` (candidate; HEAD `a4e6aef`, reviewed paths byte-identical between the two)
**Working tree**: clean (untracked: this session's journal only)
**Reviewer**: DeepSeek, `deepseek/deepseek-flash`, effort unknown, Kilo (mode Code), owner `deepseek-2c5353485fab789c`
**Scope**: package L - `docs/research/2026-09-25-improvement-research/prompts/launch.cjs`, `launch-test.cjs`, `launch-fake-client.cjs`, `K-launch.md`, the package `README.md`, `docs/core-arch/stage-4/P-L3-004-route-failover.md`; plus the rows report L owns (CB-12..CB-26), PROTO-DEC-0068..0070, the Roles shim, `--preflight` and the K-launch gate
**scope-check**: PASS
**Verdict**: **FAIL**
**Mode**: CERTIFYING
**Receipt-Owner**: deepseek-2c5353485fab789c
**Receipt**: `.ai/worklog/deepseek-2c5353485fab789c.md` (this session's entry names both second-pass reports; recorded with `protocol-handoff.cjs record`)

---

## Executive Summary

The CB-17 attempt 2 fix reproduces as closed on Windows: the full self-test is 70/70 (73 lines
including the lock checks), `--pure` 55/55, `--preflight` 9/9, `--check` 24/24, and every row
CB-12..CB-26 is `fixed-and-verified` except one. The failing item is new, not a reopened root
cause: the record and the launcher claim "every git the executor runs sees an unusable push URL"
(`P-L3-004:84`, `launch.cjs:344-349`), but the override covers only the remotes that exist at
launch. A job that runs `git remote add x <url>` and `git push x` succeeds with the launcher's
environment, in a linked worktree, and the write lands in the shared `.git/config` of the
checkout, which no scope check reads (reproduced below). The recorded owner term "push
запрещён" (PROTO-DEC-0070 item 4) is therefore not implemented by the control that claims it.
Two remedies are acceptable and each is small; until one is in the reviewed tree, the launch
gate in `K-launch.md` step 0 is not satisfied.

Everything else this pass looked for - scope copy-back, the unsettled-attempt refusal, `SAFE`
with parentheses under `cmd.exe`, the `GIT_CONFIG_COUNT` override, worktree lifecycle, the
Roles shim - reproduced as the fix response describes.

---

## Scope and Evidence

- **Baseline Commit**: `87257cc`; paths read from that commit; `git diff --quiet 87257cc HEAD -- <reviewed paths>` exit 0.
- **Environment**: Windows 11, node 22.21.0, PowerShell 5.1; clients present and used only for `--help`: codex, agy 1.2.x, copilot 1.0.88, vibe 2.25.5, kilo.
- **Commands executed (exit code)**, all from the repository root:
  - `node --check` on the three launcher files (0).
  - `launch-test.cjs --pure` (0, 55/55). `launch-test.cjs` full (0, 73 PASS lines: 15 scenarios, 55 pure, 3 lock).
  - `launch.cjs --preflight` (0, 9/9, "nothing was written"); `git status --porcelain --untracked-files=no` empty after it.
  - `launch.cjs --dry researchers` (0); `--status` (0, all eight jobs "not started"); `--check researchers` (0, 18/18); `--check` all (0, 24/24); no model was called.
  - `git diff --quiet 87257cc HEAD -- <K-launch step 0 paths>` (0).
  - Scratch probes under `%TEMP%\kilo\` (repos, worktrees and env only; nothing in the checkout): push block A-N/O-Q, `cmd.exe` parentheses probe.
- After the full self-test: no `zz-*` file, no `colabs-research` worktree, no test process left; only the session journal is untracked.

---

## Findings Ledger (PROTO-DEC-0041)

| ID | Requirement | Candidate | Reproduction | Actual Result | Severity | Disposition |
|---|---|---|---|---|---|---|
| F-L1 | Push is forbidden (PROTO-DEC-0070 item 4); R-L3-004.9 claims every git sees an unusable push URL | `87257cc` | scratch: worktree of a repo with one remote, launcher env `GIT_CONFIG_COUNT/KEY/VALUE`; `git remote add x <bare>`; `git push x HEAD:refs/heads/probe` | exit 0, branch created; the remote landed in the shared `.git/config`; the env blocked only the pre-existing remote | HIGH | confirmed |
| F-L2 | A change outside the job's scope stops the job (R-L3-004.9); the scope check must read what the run can change | `87257cc` | scratch linked worktree: `git update-ref refs/heads/zz-probe HEAD`; `git remote add wt-evil <bare>` | main repo `for-each-ref` shows `refs/heads/zz-probe`; `.git/config` gains `[remote "wt-evil"]`; worktree HEAD and `tag --list` unchanged, `git status` empty, `scopeCheck` sees nothing | MEDIUM | confirmed |
| F-L3 | A record's claims match the implementation (R-L0-12-adjacent, one-home) | `87257cc` | `launch.cjs:157-160,173` adds `--trust`; PROTO-DEC-0070 decision items 2-3 name no such flag | vibe 2.25.5 help: `--trust` only skips the trust prompt, adds no tool; the reading is in a code comment, not in the block or P-L3-004 | LOW | confirmed |
| F-L4 | "Any diff outside the allowed scope is a STOP" | `87257cc` | `workdirState` uses `--untracked-files=all` without `--ignored` | writes to git-ignored paths are invisible to the scope check; they are never copied back, so checkout impact is none, but detection is not complete | LOW | confirmed |
| F-L5 | Worktree lifecycle is accounted for | `87257cc` | read + self-test cleanup | a worktree of a crashed watchdog, and a kept `SCOPE_STOP` worktree, are never removed by the launcher; they accumulate under the temp directory; K-launch tells the operator to delete nothing | LOW | confirmed |
| F-L6 | The two-executor invariant holds after a dead watchdog (CB-17) | `87257cc` | `zz-t12`, `zz-t15` on Windows | before `--stop`: refused; after: allowed; a recorded grandchild is stopped by `--stop`; an unscanned one survives and the launcher warns (recorded residual, risk row `P-L3-004:202`) | INFO | fixed-and-verified |

### F-L1 - HIGH - The push block covers only existing remotes, and nothing detects the difference

- **Requirement**: PROTO-DEC-0070 item 4 (owner, quoted): "commit, tag и push запрещены. Любой
  diff вне разрешённого scope → STOP." R-L3-004.9: "Every git the executor runs sees an unusable
  push URL." `launch.cjs:343` calls the override "No push (item 4)".
- **Location**: `launch.cjs:343-349` (`noPushEnv`), `:474` (`env` passed to every spawn);
  `P-L3-004:84`; risk row `P-L3-004:203` ("push blocked").
- **Reproduction** (scratch repositories, `%TEMP%\kilo\l-probes.cjs`; the launcher's own env):
  - A: `git push origin HEAD:main` -> exit 128, "remote helper 'no-push' aborted session" (control works for a known remote).
  - C: `git remote add evil <bare>; git push evil HEAD:main` -> **exit 0**, new branch on the remote.
  - E/F in a `git worktree add` tree, as the launcher builds it: `git remote add wt-evil` -> exit 0; `git push wt-evil HEAD:refs/heads/wt-probe` -> **exit 0**.
  - G: `[remote "wt-evil"]` is present in the **main checkout's** `.git/config` afterwards.
  - N: a parent `GIT_CONFIG_COUNT` with a real pushurl at a higher index does not survive the override (this attack point is closed).
- **Actual Result**: an executor with shell access can push anything reachable from its worktree
  HEAD to any URL, including a new remote, in one command sequence; the scope check cannot see it
  (F-L2), `git status` cannot see it (K-launch step 7), and a push is irreversible. Study A reads
  untrusted external content, so the injection path is live.
- **Recommendation / Proposed Fix** (either is acceptable):
  1. Harden, one env entry: `GIT_CONFIG_KEY_n = 'url.no-push://blocked.insteadOf'` with an empty
     value rewrites every URL that git resolves. Verified with `insteadOf` alone: origin push 128,
     new-remote push 128, explicit-URL push 128, `git status` still 0 (`l-probes2.cjs`,
     `l-probes3.cjs`). Cost: a job that legitimately fetches over the network would fail closed.
  2. Or narrow the claim in R-L3-004.9 and the risk row to "pushes to remotes configured at launch
     are blocked; a deliberately added remote or explicit URL is a recorded residual", and record
     the residual for the owner (R-L0-11), whose K-launch step 7 then needs a `git remote -v` /
     `git for-each-ref` check. This is the honest fallback; it does not close the hole.
- **Proof of Closure**: the chosen variant re-run, plus: `git remote add x <bare> && git push x` exits non-zero under the executor env, or the record states the residual and the owner confirms it.

### F-L2 - MEDIUM - The scope check does not read the shared git directory

- **Requirement**: R-L3-004.9: "Any other change in the worktree, a moved HEAD or a changed tag list stops the job." The worktree shares `.git/config`, all refs and hooks with the checkout.
- **Location**: `launch.cjs:367-373` (`workdirState`: status, `rev-parse HEAD`, `tag --list`), `:403-410` (`scopeCheck`).
- **Reproduction**: `l-probes.cjs` H/I/J - in a linked worktree: `git update-ref refs/heads/zz-probe HEAD` exits 0; the main repo then lists `refs/heads/zz-probe`; `remote add` writes the main config (G); worktree HEAD and tags stay unchanged, so `workdirState` returns exactly its baseline. `git status` in the checkout does not show refs or config either.
- **Actual Result**: refs, the shared config and `.git/hooks` are outside every check; a hook
  installed there would execute in the owner's later git commands. The residual the record names
  ("a shell command writing by absolute path outside the worktree") understates this: it is not
  only the working tree but the shared git directory, and the two owner-facing checks (git status,
  diff review) do not cover it.
- **Recommendation**: hash `git for-each-ref` output and the `.git/config` bytes into
  `workdirState` and stop on a change, or record the residual explicitly as in F-L1.2.

### F-L3/F-L4/F-L5 - LOW - Record and lifecycle hygiene

- F-L3: `--trust` is the implementer's reading, needed for non-interactive vibe; add it to the
  Consequences of PROTO-DEC-0070 or to R-L3-004.9. No behaviour change requested.
- F-L4: either add `--ignored=matching` to the status call or state in R-L3-004.9 that ignored
  paths are outside detection and are never copied back.
- F-L5: state in R-L3-004.9 or K-launch step 7 where kept/crashed worktrees live and who removes
  them (the owner, since the launcher deletes nothing on `SCOPE_STOP`).

---

## Verified rows (second pass, CB-12..CB-26, report L)

| Row | Disposition | Evidence |
|---|---|---|
| CB-12 | fixed-and-verified | PROTO-DEC-0068 in `.ai/DECISIONS.md:2683-2717` narrows the 0067 Supersedes line exactly as offered; "A: сузить" recorded with the owner; registry row `docs/decisions/REGISTRY.md:87`. No code change, as the block states. |
| CB-13 | fixed-and-verified | PROTO-DEC-0069 (`.ai/DECISIONS.md:2721-2746`) adds the two O-08 sentences; `BRIEF.md` O-08 unchanged; registry row `:88`. |
| CB-14 | fixed-and-verified | P-L3-004 timer table "Source" column (`:124-131`); `launch.cjs:36-39` comment names the implementer's values. |
| CB-15 | fixed-and-verified | State table (`P-L3-004:137-159`) now carries `STARTING -> SUSPECT`, `SUSPECT -> STARTING`, both SUSPECT phases, the pre-launch stop row and the worktree row. |
| CB-16 | fixed-and-verified | `--pure` 11/11 malformed option cases exit 2, 4 valid forms parse; `--hard-seconds -5` and `--cap-minutes 0` now rejected. |
| CB-17 | fixed-and-verified (residual recorded) | see F-L6; `launch.cjs:250-264` `startBlockers`, `:540-549` scans, `:867-899` `stop`; `zz-t12` refused→allowed, `zz-t15` refused→allowed with the never-scanned warning; risk row `P-L3-004:202`. Attempt 2 closes the two-executor hole; the unscanned-orphan residual cannot be closed by any process table and is explicitly recorded, so R-L0-11 does not send it back. |
| CB-18 | fixed-and-verified | `zz-t10` passes; `run()` keeps the marker (`:476-477,634-638`), `startJobs` clears it under the lock (`:850-851`). |
| CB-19 | fixed-and-verified | `chunkIsProgress` (`:138-143`), tick use (`:580-589`); `zz-t9` rate-limit loop reaches FAILED_EARLY; pure checks. |
| CB-20 | fixed-and-verified | `ERROR_TEXT` (`:42-50`); 17 detected / 6 not-flagged probes pass, including the 8 misses and 3 false hits of pass 1. |
| CB-21 | fixed-and-verified with F-L1 | PROTO-DEC-0070 quotes the owner in full (`.ai/DECISIONS.md:2750-2835`); implementation: vibe minimal list + `--auto-approve` (`launch.cjs:161,173`), copilot `-C <worktree> --allow-all-tools --no-ask-user` + deny list, no `--add-dir` (`:163-164,172`), disposable worktree and `SCOPE_STOP` (`:336-430`), push block (F-L1). copilot 1.0.88 help lists `--no-ask-user`; the deny patterns parse but their effect remains unverified (as the addendum says). |
| CB-22 | fixed-and-verified | Divergence section `P-L3-004:166-173`; HUNG reason text `launch.cjs:624`. |
| CB-23 | fixed-and-verified | `K-launch.md` rule 3, steps 4 (0/1), 5 (0/1, `Owner-confirmed:` line), 6, 7; step 0 gate and step 2 `--preflight`. |
| CB-24 | fixed-and-verified | `killExact` without `/T` (`:210-212`), `aliveTree` (`:219-234`); no `taskkill /T` remains; `zz-t11` grandchild gone. |
| CB-25 | fixed-and-verified | `MODEL-MATRIX.md:17` records both agy versions; notes numbered 1-4 (`:171-179`). |
| CB-26 | fixed-and-verified | `BRIEF.md` O-06 index line now carries "of different makers" and "a synthesiser who is not one of the researchers". |
| Roles shim | verified | `git show 87257cc -- .ai/TASK.md`: six new lines (copilot, grok, kimi, mistral, agy, kilo), research-frame condition on gemini/deepseek/codex/claude, two pairs joined; three closed Open-questions lines moved; TASK 80 lines; `--preflight` 9/9 with the hook's own parser. |
| `--preflight` | verified | read-only (no tracked change after it), 9/9; three pure checks; `K-launch` step 2 gate in place. |
| K-launch canary | verified | step 5a starts only b-grok and b-mistral, waits for `WORKING`, then the other four; step 0 requires this verdict and the reviewed commit. |

---

## Deep dives

### Self-test and the environment it ran in

Full run: `PASS` on all lines, exit 0, on Windows 11 with node 22.21.0. `zz-t12` reasons:
"a process of an earlier attempt is still alive (pid ...)" before `--stop`, `null` after; the
grandchild is gone. `zz-t15` reasons: "its watchdog died before attempt 1 settled, before it
recorded any process tree ... run --stop" before; `null` after; the grandchild stays alive -
the test then stops its own grandchild so nothing outlives the run. `zz-t14` keeps the worktree
and copies nothing; `zz-t13` copies the output back. This matches three claimed runs, and my
run adds a fourth independent one on the owner's machine.

### `SAFE` with parentheses under `cmd.exe`

`checkCommand` now admits `()`. The copilot deny list needs them (`shell(git commit)`).
Probe: spawn with `shell: true` of a command containing `"shell(git commit)" "x(y)" "a b(c)"`
returns exit 0 and the arguments intact (`%` and `^` and `&` remain rejected by `SAFE`). No
injection through this widening was found; the message text itself is built from fixed job ids.

### The `GIT_CONFIG_COUNT` override when the parent sets it

Probe N: parent `GIT_CONFIG_COUNT=2` with a real `remote.origin.pushurl` at index 1; the
launcher's `{...process.env, ...noPushEnv()}` replaces `COUNT` and `KEY_0/VALUE_0`, so index 1 is
unreachable and the push is blocked. Closed.

---

## Recommendations & Actionable Plan

1. F-L1: apply remedy 1 (empty-prefix `insteadOf`) or remedy 2 (narrow the claim, record the
   residual, owner acceptance) and re-run `launch-test.cjs` and `--check`; then the K-launch gate
   can be satisfied by a new reviewed commit.
2. F-L2: extend the scope check or record the residual; both owner-facing checks in `K-launch`
   step 7 cannot see refs, config or hooks.
3. F-L3..F-L5: one paragraph each, in `P-L3-004` or `K-launch`; no code change needed.

## References

- Review prompt: `docs/reviews/2026-09-25-claude-core-arch-stage2-fix-response-addendum-1.md`.
- Fix response: `docs/reviews/2026-09-25-claude-core-arch-stage2-fix-response.md`; first-pass
  reports: `docs/reviews/2026-09-25-deepseek-research-launch-review.md` (L),
  `docs/reviews/2026-09-25-deepseek-core-arch-stage2-review.md` (S),
  `docs/reviews/2026-09-25-core-arch-stage2-findings.md` (ledger).
- Decisions: PROTO-DEC-0066..0072 in `.ai/DECISIONS.md`; registry `docs/decisions/REGISTRY.md`.
- Associated session journal: `.ai/worklog/deepseek-2c5353485fab789c.md`.
