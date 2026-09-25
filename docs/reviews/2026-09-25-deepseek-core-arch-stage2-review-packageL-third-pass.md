# Report L, third pass - the research/launch package at the candidate: verdict FAIL (the push block is defeated by a competing `insteadOf`)

**Date**: 2026-09-25
**Reviewed commit**: `9a936ddf077793a0050597b06947bdd8650bb455` (candidate; HEAD `5ace76c`; the reviewed L paths are byte-identical between candidate, HEAD and the working tree)
**Working tree**: dirty (only unrelated: `docs/research/2026-09-25-validator-migration-council/tools/r2-dispatch.cjs` modified, untracked `round2/` and session journals; no L path differs)
**Reviewer**: DeepSeek, `deepseek/deepseek-flash`, effort unknown, Kilo (mode Code), owner `deepseek-55173c7a252994d3`
**Scope**: package L, third pass - `docs/research/2026-09-25-improvement-research/prompts/{launch.cjs,launch-test.cjs,launch-fake-client.cjs,K-launch.md}`, the package `README.md`, step 1 of `A-research.md`/`B-research.md`/`A-synthesis.md`/`B-synthesis.md`, `docs/core-arch/stage-4/P-L3-004-route-failover.md`
**scope-check**: PASS
**Verdict**: **FAIL**
**Mode**: CERTIFYING
**Receipt-Owner**: `deepseek-55173c7a252994d3`
**Receipt**: `.ai/worklog/deepseek-55173c7a252994d3.md` (this session's entry names this report; recorded with `protocol-handoff.cjs record`)

---

## Executive Summary

The second-pass root causes F-L2..F-L5 and IF-1 are closed: a private clone per attempt replaces the linked
worktree, the scope check reads refs, config and hooks, `zz-t16` reproduces the checkout as untouched, step 1 of
all four prompts now expects the clone, and the counts claimed in the addendum reproduce (`--pure` 55/55, full
self-test 80/80, `--check` 24/24, `--preflight` 9/9). F-L1 is *not* closed. The chosen remedy - an empty-prefix
`insteadOf` rule in the environment and the clone's config - is the shortest possible mapping, so any longer
`url.<url>.insteadOf` supplied on the command line (`git -c`) or by the ambient global/system config supersedes it
and the push succeeds. The bypass leaves **no** trace in the clone (config, refs, files and hooks all unchanged),
so the scope check, the owner's `git status`/`git remote -v`, and the clone diff review cannot see it. That
contradicts R-L3-004.9 ("It rewrites every URL git resolves") and the risk row's residual ("the scope stop comes
after the fact"). PROTO-DEC-0070 item 4 (owner: "push запрещён") is therefore still not implemented by the
control that claims it.

---

## Scope and Evidence

- **Baseline Commit**: `87257cc` (second pass); candidate `9a936dd`. `git diff --quiet 9a936dd HEAD -- <L paths>` exit 0.
- **Environment**: Windows 11, node 22.21.0, git for Windows; clients present, used only for `--help`.
- **Commands executed (exit code)**, from the repository root:
  - `node --check` on `launch.cjs`, `launch-test.cjs`, `launch-fake-client.cjs` (0).
  - `launch-test.cjs --pure` (0, 55 PASS; matches the addendum).
  - `launch-test.cjs` full (0, 80 PASS = 55 pure + 6 push-block + 3 lock + 16 scenarios; matches the addendum's
    first run; `zz-t16` reason: "refs changed ... repository config changed", "checkout config and refs untouched").
  - `launch.cjs --check researchers` (0, 18/18); `launch.cjs --check` all (0, 24/24); no model called.
  - `launch.cjs --preflight` (0, 9/9, "nothing was written"); `--status` (0, all eight "not started");
    `--dry researchers` (0).
  - After the full self-test: no test process, no `%TEMP%\colabs-research\zz-*` directory, no worktree left
    by the run; the checkout had no `evil` remote and no `zz-probe` ref.
  - Scratch probes under `%TEMP%\kilo\` (`l3-probe.cjs`, `l3-probe2.cjs`), repositories and env only.
- **Third-pass questions answered**: (1) the clone reaches the checkout only by absolute path, named as a
  residual; the `--shared` alternates file names the checkout object store (probe P3). (2) yes, a competing longer
  `insteadOf` is a push path (F-3P-1). (3) the scope check over refs/config/hooks is complete for those surfaces;
  the index is not covered (F-3P-3). (4) step 1 holds for the clone and the Kilo fallback (same `cwd`/`--dir`).

---

## Findings Ledger (PROTO-DEC-0041)

| ID | Requirement | Candidate | Reproduction | Actual Result | Severity | Disposition |
|---|---|---|---|---|---|---|
| F-3P-1 | Push is forbidden (PROTO-DEC-0070 item 4); R-L3-004.9: the rule "rewrites every URL git resolves" | `9a936dd` | scratch: `git -c url.file:///<bare>.insteadOf=no-push://blocked push no-push://blocked HEAD:refs/heads/bypass` under `NO_PUSH_ENV` | exit 0, branch created on the remote; nothing in the clone changed, so the scope check cannot see it | HIGH | confirmed |
| F-3P-2 | Isolation must not let a job run code in the launcher (R-L3-004.9) | `9a936dd` | plant `post-checkout` in `%TEMP%\colabs-research\.no-hooks`; run `git -c core.fsmonitor=false -c core.hooksPath=<that dir> checkout -b x` | the planted hook executed (launcher-style call); the dir is shared, writable and outside every scope check | MEDIUM | confirmed |
| F-3P-3 | "Any diff outside the allowed scope is a STOP" | `9a936dd` | `git update-index --assume-unchanged f`; modify `f`; `git status --porcelain=v1 -z --untracked-files=all` | empty status / no diff, so the ticking scope check sees nothing; copy-back is selective so the checkout is not written | LOW | confirmed |
| F-3P-4 | K-launch step 0 and README status name the pass that gates the launch | `9a936dd` | read `K-launch.md:26-31`, `README.md:88` | both still say "DeepSeek's second pass ... non-blocking verdict"; the second pass was FAIL, and this third pass is the governing one | LOW | confirmed |
| F-3P-5 | Scope check must not fail open/closed on transient state | `9a936dd` | read `launch.cjs:375-385,427-437`; a transient `.git/index.lock` from the executor makes `gitIn status` non-zero | `workdirState` returns null, and unreadable state is a violation -> a spurious `SCOPE_STOP` is possible | LOW | recommendation |
| F-3P-6 | Recorded fixes F-L2..F-L5, IF-1 | `9a936dd` | read + self-test + probes | F-L2 root cause closed by the clone; F-L3/F-L4/F-L5 recorded in R-L3-004.9; IF-1 fixed in all four prompts | INFO | fixed-and-verified |

### F-3P-1 - HIGH - The empty-prefix `insteadOf` rule is not the last word git applies

- **Requirement**: PROTO-DEC-0070 item 4 (owner): "commit, tag и push запрещены." R-L3-004.9: "The rule
  `url.no-push://blocked.insteadOf` with an empty value is set in the executor's environment and in the clone's
  own config. It rewrites every URL git resolves: existing remotes, added remotes, explicit push URLs and URLs
  given on the command line."
- **Location**: `launch.cjs:353-354` (`NO_PUSH`, `NO_PUSH_ENV`), `:415` (config form), `:507` (env);
  `P-L3-004:85-88`; risk row `P-L3-004:219`.
- **Reproduction** (scratch, `%TEMP%\kilo\l3-probe.cjs` and `l3-probe2.cjs`; the launcher's own env object):
  - Baseline: `git push <file-url> ...` under `NO_PUSH_ENV` -> exit 128, "remote helper 'no-push' aborted".
  - Bypass A (command line): `git -c url.<file-url>.insteadOf=no-push://blocked push no-push://blocked HEAD:refs/heads/bypass` -> **exit 0**, the remote received `refs/heads/bypass`.
  - Bypass B (ambient config, no config edit by the job): `GIT_CONFIG_GLOBAL=<file with the longer mapping>` plus the launcher's `NO_PUSH_ENV` -> **exit 0**, remote ref created.
  - Both bypasses change nothing in the clone: config hash, refs hash, `HEAD`, status and hooks are unchanged, so `scopeCheck` and the owner's post-run checks cannot detect them. The clone's own config form of the rule does block the direct URL (verified separately), which isolates the defect to the *longest-prefix-wins* semantics.
- **Actual Result**: a job that reads untrusted external content (Study A does) can be steered to exfiltrate the
  checkout's HEAD to any URL in one silent command; a push cannot be undone and leaves no artifact to find.
- **Disposition**: `confirmed`. Not a reopened F-L2..F-L5; it is F-L1 remedy 1 not meeting its own claim.
- **Recommendation / Proposed Fix** (either is acceptable; the first is the honest one):
  1. Record the residual: narrow R-L3-004.9 and the risk row to "the empty-prefix rule blocks every direct URL
     form (`git push <url>`, added remotes, explicit push URLs, config and env forms). It is superseded by any
     longer `url.*.insteadOf` supplied through `-c` or the ambient system/global config, which is silent and not
     seen by the scope check." Add a `launch-test.cjs` push-block check for both variants. Also set
     `GIT_CONFIG_NOSYSTEM=1` and an empty `GIT_CONFIG_GLOBAL` in the executor env to remove the ambient-file
     source; `-c` cannot be neutralised by config, so it stays in the recorded residual.
  2. Or implement a control that cannot be overridden by git config (a git wrapper used only inside the clone);
     this is a larger change and is not required to record the risk honestly.
- **Proof of Closure**: the chosen variant, plus a `launch-test.cjs` line that reproduces the `-c` variant and
  asserts non-zero under the executor env, or an owner-accepted residual row naming it.

### F-3P-2 - MEDIUM - The shared empty-hooks directory is writable and unchecked

- **Requirement**: R-L3-004.9: the launcher's own git calls in a clone run with "an empty `core.hooksPath`"; the
  intent is that nothing a job writes runs in the launcher.
- **Location**: `launch.cjs:345-346` (`EMPTY_HOOKS`, `gitIn`); `:401` (`mkdirSync`), `:413` (`checkout` via `gitIn`).
- **Reproduction**: `%TEMP%\kilo\l3-probe.cjs` P4 - write a `post-checkout` hook into
  `<os.tmpdir()>\colabs-research\.no-hooks`, then run the identical launcher call
  `git -c core.fsmonitor=false -c core.hooksPath=<that dir> checkout -q -b x`: the hook ran.
- **Actual Result**: the directory is fixed, shared by every job, under the same parent the jobs run in, and outside
  every scope check. A job (or a previous attempt) that writes a hook there has it executed inside the *launcher*
  on the next `prepareWorkdir` `checkout`, i.e. code execution in the owner's session, not merely a file write in
  the clone. The existing residual ("a shell command writing by absolute path outside the clone") is not false, but
  it understates the consequence and the owner-facing checks (`git status`, `git remote -v`) do not cover a temp
  path.
- **Disposition**: `confirmed`.
- **Recommendation / Proposed Fix**: use a per-attempt hooks path the job cannot predict or write before creation
  (for example inside the clone, created before the checkout), or a path outside `colabs-research/`, and record the
  residual if neither is possible. No code change is strictly required for a non-hostile threat model.
- **Proof of Closure**: the planted hook no longer runs, or the residual is recorded with the launcher-execution
  consequence named.

### F-3P-3 - LOW - The scope check does not read the index

- **Requirement**: R-L3-004.9 / PROTO-DEC-0070 item 4: any diff outside the allowed scope stops the job.
- **Location**: `launch.cjs:375-385` (`workdirState` hashes files, HEAD, refs, config, hooks - not `.git/index`).
- **Reproduction**: `l3-probe.cjs` P2 - in a clone, `git update-index --assume-unchanged tracked.txt`, then modify
  `tracked.txt`: `git status --porcelain=v1 -z --untracked-files=all` is empty (and `git diff --quiet` exits 0).
- **Actual Result**: an out-of-scope modification can be made undetectable to the ticking scope check. The checkout
  is not harmed because only the declared outputs and new journals are copied back, so this is a detection gap like
  F-L4 (ignored paths), not a leak. It is not recorded next to F-L4.
- **Disposition**: `confirmed`.
- **Recommendation**: state it beside F-L4 in R-L3-004.9 ("index-level concealment such as `assume-unchanged` or
  `skip-worktree` is outside detection; it never reaches the checkout because the copy back is selective"), or add
  `git ls-files -v` / a raw index digest to the scope check.
- **Proof of Closure**: the sentence is present, or the scope check reports the concealment.

### F-3P-4 - LOW - The launch gate still names the superseded pass

- **Requirement**: K-launch step 0 is the owner's gate; it must name the reviewed launcher and the pass that
  cleared it.
- **Location**: `K-launch.md:26-31` ("the owner's launch message says that DeepSeek's second pass on package L has
  a non-blocking verdict"), `README.md:88` ("waits for DeepSeek's second-pass verdict on package L").
- **Reproduction**: read both files; the second pass (`87257cc`) rendered FAIL (`...attempt2.md:9`), and this third
  pass is the one that governs the candidate.
- **Actual Result**: an operator following step 0 literally will not see the required phrase in an owner message
  that quotes the third pass, and will stop and ask (fail-safe, no bypass), but the gate text is stale and the
  README status row is wrong.
- **Disposition**: `confirmed`.
- **Recommendation**: change both to "the latest pass on package L" (or "the third pass"), naming this report and
  the commit it cleared if it clears.
- **Proof of Closure**: the two texts name the governing pass.

### F-3P-5 - LOW (recommendation) - A transient index lock can look like a scope violation

- **Location**: `launch.cjs:375-385` (`workdirState` returns null on any non-zero `gitIn`), `:427-430`
  (`scopeCheck` treats null as a violation).
- **Actual Result**: `git status` may take optional locks and write `.git/index`; if the executor holds
  `.git/index.lock` for a moment, the launcher's `status`/`rev-parse`/`for-each-ref` can fail and the job is
  stopped at `SCOPE_STOP` for no real change. Probability is low (a millisecond window against a 15 s tick) but the
  failure mode is a killed working agent, which is the cost P-L3-004 exists to avoid.
- **Disposition**: `confirmed` by reading; not reproduced deterministically.
- **Recommendation**: add `GIT_OPTIONAL_LOCKS=0` to the launcher's git environment so its own `status` never writes
  the index, and/or retry once before treating unreadable state as a violation.

### F-3P-6 - INFO - Verified bars

- F-L2 root cause: `prepareWorkdir` clones `--shared --no-checkout`, checks out `--detach`, removes remotes and
  writes the no-push key into the clone's config; `zz-t16` reproduced the checkout untouched (`remote evil` false,
  `refs/heads/zz-probe` false). The `--shared` alternates file names the checkout object store (probe P3), which is
  the named absolute-path residual.
- F-L3 (`--trust`), F-L4 (ignored paths), F-L5 (kept/crashed clone lifecycle) are recorded in `P-L3-004:96-100`
  and `K-launch.md:88-92`.
- IF-1: step 1 of all four prompts now expects the job's clone and stops otherwise; the K-launch operator still
  expects `D:/Colabs`.
- Counts: `--pure` 55/55, full 80/80, `--check` 24/24, `--preflight` 9/9; no model called by the checks.

---

## Deep Dives

### Why the empty-prefix rule cannot be made complete by config alone

Git selects a single `url.*.insteadOf` mapping per URL: the longest matching prefix wins. The launcher's rule uses
the empty prefix, so it matches every URL but is always the shortest possible match. Any longer mapping - from a
`-c` flag (highest precedence), from the clone's later config, or from the ambient system/global file - wins and
rewrites the URL to a real destination. Making the rule longer does not help: a longer value stops matching
arbitrary URLs. Neutralising the ambient files (`GIT_CONFIG_NOSYSTEM=1`, empty `GIT_CONFIG_GLOBAL`) closes the
non-hostile variants; `-c` cannot be closed from config, which is exactly why R-L0-11 asks for the residual to be
recorded rather than the claim to be overstated.

### Positive: the clone closes the second-pass root cause

`git clone --shared` gives the attempt its own config, refs and hooks; the scope check hashes all three plus the
working files and HEAD; `zz-t16` showed a job adding a remote and a branch stops at `SCOPE_STOP` while the checkout
keeps its config and refs. F-L2 is materially fixed, not merely recorded. `insteadOf` (not `pushInsteadOf`) is the
right family for the direct forms - it blocked the pre-existing remote, the added remote, the explicit URL and the
explicit push URL in the push-block checks - the remaining hole is the competing longer mapping (F-3P-1).

### Kilo fallback and step 1

Every route is spawned with `cwd` set to the clone (`launch.cjs:553`) and, for Kilo, `--dir "<clone>"`
(`:180`); `--check` confirms the flag parses. `git rev-parse --show-toplevel` inside the clone therefore prints
`.../colabs-research/<job>-...`, which is what step 1 of the four prompts now requires. No mismatch found.

---

## Recommendations & Actionable Plan

1. F-3P-1 (blocking): apply remedy 1 - narrow the R-L3-004.9 claim, add the `-c`/ambient `insteadOf` residual to
   the risk table, and add the two push-block checks; or the owner accepts the residual explicitly. Then the launch
   gate can be satisfied by the new reviewed commit.
2. F-3P-2: move the empty hooks path out of the shared, job-writable location or record the launcher-execution
   consequence in R-L3-004.9.
3. F-3P-3, F-3P-4, F-3P-5: one paragraph each in R-L3-004.9 (index concealment), K-launch.md and README.md (pass
   wording), and `GIT_OPTIONAL_LOCKS=0` in `gitIn`.

## References

- Review prompt / fix response: `docs/reviews/2026-09-25-claude-core-arch-stage2-fix-response-addendum-2.md`.
- Second pass: `docs/reviews/2026-09-25-deepseek-research-launch-review-attempt2.md` (FAIL, F-L1..F-L6).
- First pass: `docs/reviews/2026-09-25-deepseek-research-launch-review.md`.
- Decisions: PROTO-DEC-0066..0072 in `.ai/DECISIONS.md`.
- Associated session journal: `.ai/worklog/deepseek-55173c7a252994d3.md`.
