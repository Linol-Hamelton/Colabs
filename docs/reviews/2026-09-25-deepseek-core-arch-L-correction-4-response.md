# Package L, correction pass 4 - implementer response

**Date**: 2026-09-25
**Candidate**: the working tree of `D:\Colabs` after this pass - **not committed**; the owner commits after review.
**Implementer**: DeepSeek, `deepseek/deepseek-flash`, effort unknown, client Kilo, owner `deepseek-a3813c0b8b1bb117`.
**Task**: `docs/core-arch/stage-4/L-CORRECTION-4.md` (authority PROTO-DEC-0077 item 3; owner-approved as a declared long task, PROTO-DEC-0078 item 4).
**Baseline**: HEAD `2968778`, working tree clean except the untracked session journals.
**Changed**: `docs/research/2026-09-25-improvement-research/prompts/{jobs.json (new),launch.cjs,launch-test.cjs,launch-fake-client.cjs,K-launch.md}`, the package `README.md`. No file under `docs/core-arch/`, nothing in `.ai/`, no validator, no other program.

## Items 1-9

| Item | Finding | Fix | Where | Test |
|---|---|---|---|---|
| 1 (F-3P-2) | shared, predictable, job-writable hooks path `<temp>/colabs-research/.no-hooks`; a planted hook ran in the launcher | every launcher git call passes `-c core.hooksPath=<fresh random name under a private mkdtemp dir>`; the path is never created, so git resolves no hook; the old shared dir is retired and the `mkdirSync` removed | `launch.cjs` `hooksRoot`/`noHooksPath`/`gitOpts`/`git`/`gitIn` | `hook:` 4 checks: positive control runs a planted hook (1 execution), then 0 executions across checkout/status/rev-parse/for-each-ref/config/commit and `prepareWorkdir`, with hooks planted in the retired dir and in a copy's `.git/hooks` |
| 2 (credential-separated executor, Level 1) | the job inherited all of `process.env`, including git credentials | `executorEnv()` = `process.env` minus `GH_TOKEN`, `GITHUB_TOKEN`, `GIT_ASKPASS`, `SSH_ASKPASS`, `SSH_AUTH_SOCK` and any `*_TOKEN`/`*_PAT` naming GH/GITHUB/GIT; plus `GIT_CONFIG_NOSYSTEM=1`, a launcher-owned empty `GIT_CONFIG_GLOBAL` outside every clone, `GIT_TERMINAL_PROMPT=0`, `GCM_INTERACTIVE=never`, and an empty `credential.helper` in the `GIT_CONFIG_COUNT` block next to the no-push rule; `--smoke` now probes under the same environment | `launch.cjs` `executorEnv`/`gitEnv`/`emptyGlobalConfig`; used in `run` and `smoke` | `env:` 5 checks with 8 planted canaries + a canary credential helper in a host global config; scenario `zz-t17` dumps the real job env and `git config --show-origin -l` inside the clone: no canary, kept tokens survive |
| 3 (task git modes, default-deny) | no mode existed; any job could in principle be given any capability | every job carries `git: {mode, publishRequired}` in `jobs.json`, read only from the table; `READ_ONLY` runs; `LOCAL_COMMIT` needs `git.authorisation` (none today); `BRANCH_PUSH`/`RELEASE_PUSH` are refused with "publisher not implemented" at the dispatcher and again in the watchdog before any client starts; the mode is recorded on the attempt | `launch.cjs` `parseGit`/`gitRefusal`/`startJobs`/`run`; `jobs.json` | `git-mode:` 8 checks: each mode, a missing descriptor, dispatcher refusal with nothing spawned, watchdog refusal with no client run, and a READ_ONLY job passing the gate |
| 4 (`ls-remote` audit, never enforcement) | no before/after remote record existed | before every attempt and after the tree is gone, `ls-remote` of each remote configured in the checkout (L-1) is recorded on the attempt; a digest change in a no-push mode is an incident: attempt invalidated, nothing copied back, clone kept (`REMOTE_INCIDENT`); a change between a digest and an error string is recorded as `unverified`, not an incident | `launch.cjs` `lsRemoteSnapshot`/`remoteAuditVerdict`/`start`/`settle` | `zz-t18` a fake client pushes through the `-c` bypass to a temp bare remote → incident, refs differ; `zz-t19` READ_ONLY positive → no push, snapshots equal; `zz-t20` push+revert → audit blind confirmed |
| 5 (M-2, job table out of code) | `JOBS` was a literal in `launch.cjs` | `prompts/jobs.json` + a strict loader: unknown top-level/job/primary/git keys, missing fields, unknown client/position/mode, a non-boolean `publishRequired`, `LOCAL_COMMIT` without authorisation, a push mode without a target, unknown `needs` and unknown group members all fail closed; the CLI exits 2 on a broken file; groups stay in code | `launch.cjs` `loadJobTable`/`TableError`/`table`/`main`; `jobs.json` | `table:` 19 checks including `--dry`, `--check` and `--preflight` passing with the file and the CLI exiting 2 on a broken one |
| 6 (M-1, `index.lock`) | a transient `.git/index.lock` could stop a working attempt as a scope violation | the state read treats a held lock as unreadable and retries 5 times over ~3.75 s; if the lock persists: a git process in the copy (command line names it, or its parent is a recorded process) → wait for the next tick; no git process → stop with reason `stale index.lock`, nothing copied back, clone kept; the lock is never deleted | `launch.cjs` `workdirState`/`readStateRetried`/`gitProcessIn`/`scopeCheck`/tick/`settle` | `zz-t21` a client holds the lock 1.2 s → DONE, lock gone, clone removed; `zz-t22` a client leaves it → `INDEX_LOCK`, lock still present, clone kept, no import |
| 7 (S-3, route) | `a-deepseek` primary `openai-compatible/deepseek/deepseek-flash` has no key in the Kilo CLI | primary becomes `deepseek/deepseek-flash` in `jobs.json`; `--smoke a-deepseek` now answers OK | `jobs.json` | before/after `--dry a-deepseek` below; smoke OK |
| 8 (S-2, F-3P-4) | K-launch step 0 and the README named the superseded second pass | both now name the fourth pass on package L (the correction pass `L-CORRECTION-4`) as the governing review | `K-launch.md:25-30`, `README.md` status row | read back |
| 9 (records) | README counts stale; records under `docs/core-arch/` must not be edited by this pass | README counts updated (25/25 check; 129 self-test checks, categories named); no record touched; the text R-L3-004.9 needs is in "Record text" below; `kilo-routes.json` is stale and is **not** edited (a finding, below) | `README.md` | the three suite runs and the `--check`/`--preflight` runs below |

## Measurement of item 1

- Mechanism: a per-call `core.hooksPath` that cannot exist - `path.join(hooksRoot(), 'none-<16 hex>')` under a launcher-private `fs.mkdtempSync(<temp>/colabs-hooks-)`, chosen at call time and never created. The path is not predictable before the call and does not exist at any point, so git resolves no hook file.
- Measurement: the positive control (planted `post-checkout`, explicit `core.hooksPath=<planted>`) executed the hook in 1 of 1 runs; with the launcher's own calls, planted hooks (`post-checkout`, `pre-commit`, `post-commit`, `pre-push`) executed 0 times across `checkout`, `status`, `rev-parse`, `for-each-ref`, `config`, `commit` and `prepareWorkdir` (clone + checkout), with hooks present in the retired shared directory, in a copy's `.git/hooks`, and while `colabs-research/` itself was writable. Two fresh `noHooksPath()` calls both reported "does not exist".

## `--dry a-deepseek` before / after (item 7)

Before (old primary, old fallback list):

```
a-deepseek (research, deepseek-flash, level unknown, position max, agent deepseek)
  primary: kilo run -m openai-compatible/deepseek/deepseek-flash --auto --dir "D:\Colabs" --format json --title a-deepseek "..."
  kilo:1 (automatic fallback): kilo run -m openrouter/deepseek/deepseek-v4.1-flash --variant max ...
  kilo:2: kilo run -m huggingface/deepseek-ai/DeepSeek-V4.1-Flash --variant xhigh ...
  kilo:3: kilo run -m vercel/deepseek/deepseek-v4.1-flash --variant max ...
```

After (new primary; the old primary re-enters the fallback list because `kiloCandidates` only excludes the current primary):

```
a-deepseek (research, deepseek-flash, level unknown, position max, agent deepseek)
  primary: kilo run -m deepseek/deepseek-flash --auto --dir "D:\Colabs" ...
  kilo:1 (automatic fallback): kilo run -m openai-compatible/deepseek/deepseek-flash ...   [$0/$0, effort not settable]
  kilo:2: kilo run -m openrouter/deepseek/deepseek-v4.1-flash --variant max ...
  kilo:3: kilo run -m huggingface/deepseek-ai/DeepSeek-V4.1-Flash --variant xhigh ...
  kilo:4: kilo run -m vercel/deepseek/deepseek-v4.1-flash --variant max ...
```

- `--smoke a-deepseek` with the new primary: `primary kilo:deepseek/deepseek-flash: OK` (exit 0); with the old primary: `FAIL exit 1` (no key), the S-3 premise confirmed.
- **Finding**: `deepseek/deepseek-flash` exists in the Kilo CLI (`kilo models`, verified 2026-09-25) but is **absent from `docs/core-arch/stage-4/kilo-routes.json`** (generated 2026-09-24, which lists only `openai-compatible/deepseek/deepseek-flash`). Item 9 forbids this pass editing `docs/core-arch/`, so the snapshot needs regeneration by the owner; until then the first fallback is the keyless route and `--check` reports 25/25 (was 24/24) because the old primary joined the fallback list.

## Smoke under the executor environment (item 2)

- OK: `a-gemini` (agy), `b-mistral` (vibe), `a-deepseek` (kilo, new primary), and the Kilo fallback `openrouter/deepseek/deepseek-v4.1-flash` - so the credential separation does not break the Kilo client on a working route.
- codex (`a-sol`): `FAIL exit 1 (hit your usage limit)`; Kilo fallback `openai/gpt-5.6-sol`: `FAIL exit 1 (401)` - both provider-side, not caused by the scrub.
- copilot (`a-synth`): `FAIL exit 1` twice - `--reasoning-effort medium` is rejected for `kimi-k2.7-code` ("does not support reasoning effort configuration"), reproduced with the plain environment too, so it is a pre-existing command bug, not the scrub; and separately "You have exceeded your monthly quota". The Kilo fallback `vercel/moonshotai/kimi-k2.7-code` answered OK.
- Old `a-deepseek` primary `openai-compatible/deepseek/deepseek-flash`: `FAIL exit 1` (no key).

## UNPROVED (section 2, unknown coverage is not a pass)

- (2) `git -c url.<x>.insteadOf=<origin> push`: prevention is impossible by config; detection is covered (`zz-t18`), **prevention UNPROVED**.
- (9) OS credential stores, SSH agents and credential helpers other than the canary config: **UNPROVED**; only the env scrub and a canary helper in a synthetic global config are tested.
- (10) a foreign git implementation (libgit2, JGit, a portable git that ignores `GIT_CONFIG_*`): **UNPROVED**; only an absolute path to the same `git.exe` is tested.
- (11) hosting-API mutation: **UNPROVED**; no API surface is reachable or tested.
- (12) transient push+revert: the audit is blind (`zz-t20` shows equal snapshots and no incident) - **UNPROVED**; nothing detects it.
- The after-query can be made to fail (unreachable host, remote deleted, network cut): recorded as `unverified`, the attempt is **not** invalidated - a masking blind.
- Webhook/CI side effects and remotes not configured in the checkout: outside the recorded list by design, **UNPROVED**.
- codex and copilot routes cannot be shown working now (quota); their jobs' end-to-end behaviour is **UNPROVED**.
- `LOCAL_COMMIT` is unreachable (no job has an authorisation); its runtime behaviour in a run is **UNPROVED**.

## Record text for R-L3-004.9 (items 1-6, the `-c` residual, the audit blinds) - for the spec author

- Push: the empty-prefix `url.no-push://blocked.insteadOf` rule blocks every direct URL form (existing remotes, added remotes, explicit URLs, explicit push URLs, typed URLs) and makes a network fetch fail. It is superseded by any longer `url.*.insteadOf` supplied through `-c` (command scope) or an ambient file. `GIT_CONFIG_NOSYSTEM=1` and the empty launcher-owned `GIT_CONFIG_GLOBAL` remove the ambient-file source; the `-c` form stays a residual, covered only by the audit (§ item 4 below). The credential scrub removes the environment vectors (`GH_TOKEN`, `GITHUB_TOKEN`, `GIT_ASKPASS`, `SSH_ASKPASS`, `SSH_AUTH_SOCK`, `*_TOKEN`/`*_PAT` naming GH/GITHUB/GIT) and sets an empty `credential.helper`; clients keep their own keys in config files.
- Hooks: the launcher's own git calls pass `-c core.hooksPath=<random non-existent path under a private temp dir>` per call, so no hook file exists to run. Residual: none measured for a cooperative job; an adversarial job that predicts the random path inside the call window is outside the documented threat model.
- Git modes: default-deny; a job's mode is read from `prompts/jobs.json` only; `READ_ONLY` runs; `LOCAL_COMMIT` needs an authorisation naming the decision that permits commits (none today); `BRANCH_PUSH` and `RELEASE_PUSH` fail closed with "publisher not implemented" - no publisher is built.
- Audit: before and after every attempt, `git ls-remote` of each remote configured in the checkout (L-1) is recorded on the attempt. A digest change is an incident that invalidates the attempt (nothing copied back, clone kept). Blinds: transient push+revert, an after-query that fails (recorded as `unverified`, not an incident), webhook/CI side effects, and remotes outside the configured list. `ls-remote` is audit, never enforcement.
- `index.lock`: a held lock makes the state read unreadable; the read retries 5 times over ~3.75 s. If the lock persists and a git process works in the copy, the tick waits for the next scan; if none does, the attempt stops with the reason "stale index.lock", nothing is copied back and the clone is kept. The lock is never deleted.
- Job table: `prompts/jobs.json`, strict loader; unknown keys or a missing field fail closed (exit 2); `--check` 25/25, `--preflight` 9/9, self-test 129/129 in three runs.
- Route: `a-deepseek` primary is `deepseek/deepseek-flash` (exists in the Kilo CLI, absent from the stale `kilo-routes.json` snapshot; regenerate the snapshot).

## Points to attack (fourth pass)

1. The `-c url.*.insteadOf` bypass remains: the credential scrub raises its cost for owner remotes (no key) but does not block a push to a destination reachable without credentials.
2. The audit's after-query can be broken deliberately (firewall, blocked host, deleted local remote) and the result is `unverified`, not an incident - the strongest known bypass of item 4.
3. The audit is a network call at attempt start and end (30/60 s timeouts); a slow remote delays dispatch. Only remotes configured in the checkout are audited.
4. `gitProcessIn` recognises a git process only by a command line naming the copy or by a recorded parent; an unrecorded git process could be missed and its lock declared stale.
5. The empty `GIT_CONFIG_GLOBAL` path is in the job's environment and job-writable; the env-scope empty `credential.helper` is applied last, so editing the file does not restore a helper for jobs, but a deliberate job controls its own env (adversarial class out of scope, `P-L3-004:219`).
6. Kept by design: `GIT_SSH`, `GIT_SSH_COMMAND`, `GIT_CREDENTIAL_*`, `NETRC`/`_NETRC`, other-forge tokens (`GITLAB_TOKEN`), provider keys (`DEEPSEEK_MAIN_KEY`); none is in the spec's list.
7. `--smoke` now runs under the executor environment; the codex/copilot quota failures and the copilot effort-flag bug are pre-existing and outside this pass.
8. `prompts/jobs.json` is read once per process and cached; editing it does not affect a running watchdog.
9. The hooks parent directory is predictable (`<temp>/colabs-hooks-*`); the leaf is chosen and used inside one synchronous call and never created - no measured race.
10. The `workdirState` gate treats any `.git/index.lock` as an unreadable read: a legitimate long git operation makes a tick wait up to ~3.75 s; a lock held past the cap ends the attempt at `OVER_CAP`.

## Verification (all from the repository root, 2026-09-25)

- `node docs/research/2026-09-25-improvement-research/prompts/launch-test.cjs` → exit 0, **129/129**, three consecutive runs (`r1`, `r2`, `r3` in this session).
- `node ... launch.cjs --check` → exit 0, `25/25 commands parse; no model was called`.
- `node ... launch.cjs --preflight` → exit 0, `9/9 role lines point to their jobs; nothing was written`.
- `powershell -ExecutionPolicy Bypass -File .\validate-protocol.ps1` → exit 0, `Protocol OK. 0 warning(s).`
- `protocol-handoff.cjs record --owner deepseek-a3813c0b8b1bb117` runs after the journal entry; the evidence block is in `.ai/worklog/deepseek-a3813c0b8b1bb117.md`.
