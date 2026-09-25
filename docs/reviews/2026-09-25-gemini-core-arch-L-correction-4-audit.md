# Package L, correction pass 4: unified adversarial audit (certifier 1)

- Reviewed commit SHA: 130255471e0e610e48cfde2ff0c6ed369f4d4492
- Working tree: clean
- Reviewer: Gemini (gemini-3.8-flash, effort high, Antigravity)
- Date: 2026-09-25
- Scope: package L, correction pass 4 (F-3P-2 hook isolation, Level-1 credential scrub, task git modes, ls-remote audit, external jobs.json, index.lock resilience, route update, references, records)
- Mode: CERTIFYING
- Receipt-Owner: gemini-85778f5b66412208
- Verdict: RECOMMENDATION

---

## 1. Specification Audit (Items 1-9)

| Item | Requirement | Implementation at Candidate | Location | Evidence / Verification | Verdict |
|---|---|---|---|---|---|
| 1 (F-3P-2) | Launcher git calls must never run hooks a job can write | Fresh per-call `core.hooksPath` under private temp `colabs-hooks-*`, never created. Retired shared `.no-hooks` path removed | `launch.cjs:411-417` (`hooksRoot`, `noHooksPath`, `gitOpts`) | Planted hooks in `.no-hooks`, `colabs-research`, `.git/hooks` (`post-checkout`, `pre-commit`, `post-commit`, `reference-transaction`): 0 executions across all launcher calls. Positive control executed | PASS |
| 2 (Cred scrub) | Level-1 executor env: remove git credential vectors; drop ambient configs | `executorEnv()` scrubs `GH_TOKEN`, `GITHUB_TOKEN`, `GIT_ASKPASS`, `SSH_ASKPASS`, `SSH_AUTH_SOCK`, `*_TOKEN`/`*_PAT` naming GH/GIT. Sets `GIT_CONFIG_NOSYSTEM=1`, empty launcher-owned `GIT_CONFIG_GLOBAL`, `credential.helper=""` | `launch.cjs:432-468` (`CRED_ENV_*`, `gitEnv`, `executorEnv`) | Canary probe in clean clone: 8 planted canaries and global canary credential helper absent from `git config --show-origin -l`. Provider keys preserved. Client smoke tested | PASS |
| 3 (Git modes) | Task git modes: default-deny; missing/malformed fail closed; push modes refused | Modes read strictly from job table: `READ_ONLY` allowed, `LOCAL_COMMIT` needs authorisation (none exists), `BRANCH_PUSH`/`RELEASE_PUSH` refused "publisher not implemented" | `launch.cjs:72-96` (`parseGit`, `gitRefusal`), `:704`, `:1094` | Malformed/missing descriptor throws `TableError`; push modes refused in dispatcher (exit 1) and watchdog (`NEEDS_OWNER`, no client spawned). READ_ONLY passes gate | PASS |
| 4 (`ls-remote`) | Audit before/after attempt; difference invalidates attempt | `lsRemoteSnapshot()` records digests before attempt and after tree removal; diff in no-push mode marks `REMOTE_INCIDENT`, zero files imported, clone kept | `launch.cjs:612-638` (`lsRemoteSnapshot`, `remoteAuditVerdict`), `:854-864` | `origin` in tests is temporary local bare repo (`launch-test.cjs:214,484`). Differences trigger `REMOTE_INCIDENT`. Audit blinds honestly recorded | PASS |
| 5 (M-2 table) | Move `JOBS` to `jobs.json` with strict fail-closed loader | `prompts/jobs.json` created; `loadJobTable()` enforces strict schema (unknown keys, missing fields, invalid clients fail closed with exit 2) | `launch.cjs:98-125` (`loadJobTable`), `jobs.json` | `--check` passes 25/25; `--preflight` passes 9/9; broken JSON exits 2. No models or routes hardcoded in `launch.cjs` (PROTO-DEC-0073) | PASS |
| 6 (M-1 lock) | Transient index.lock no SCOPE_STOP; persistent lock stops with "stale index.lock", never deleted | `workdirState` ignores `.git/index.lock`; `readStateRetried()` retries 5 times (~3.75s); if lock persists and no git process active, stops `INDEX_LOCK`, clone kept | `launch.cjs:490-502`, `:543-588` (`readStateRetried`, `gitProcessIn`, `scopeCheck`) | `zz-t21` transient lock (1.2s) passes `DONE`; `zz-t22` persistent lock stops `INDEX_LOCK`, copy kept. Zero unlinks of `index.lock` in repository | PASS |
| 7 (S-3 route) | `a-deepseek` primary becomes `deepseek/deepseek-flash` | Primary set to `deepseek/deepseek-flash` in `jobs.json`. Fallback list reorders | `jobs.json:39`, `launch.cjs` | Rerun `--dry a-deepseek`: primary is `deepseek/deepseek-flash`. Route absent from snapshot `kilo-routes.json` (finding confirmed) | RECOMMENDATION |
| 8 (S-2 refs) | Name governing review (fourth pass, `L-CORRECTION-4.md`) | `K-launch.md` and `README.md` updated to cite fourth pass on package L | `K-launch.md:26-31`, `README.md:89` | References verified in both files; stale second/third pass references removed | PASS |
| 9 (Records) | `docs/core-arch/` untouched; supply R-L3-004.9 text | `docs/core-arch/` has 0 diff lines from baseline; full R-L3-004.9 record text provided in response | `docs/reviews/...L-correction-4-response.md:74-83` | `git diff 2968778 1302554 -- docs/core-arch/` is empty. Text covers items 1-6, `-c` residual, and blinds | PASS |

---

## 2. Hostile Suite & Regressions

### Hostile Cases (Part 2 testable subset)
Verified in disposable detached worktree (`colabs-audit-gemini-1302554`) against local bare remotes and synthetic canaries:
- Cases 1, 3, 5, 6, 7, 8, 10, 13: Direct push, explicit URL, added remote, ambient global config, tag, new branch, force push, branch deletion, and absolute `git.exe` path all fail closed under `NO_PUSH_ENV` / `executorEnv` (exit 128 / refused).
- Case 2 (`-c url.<origin>.insteadOf` bypass): Prevention by config is impossible due to Git longest-prefix-wins semantics; detection verified via `ls-remote` audit (`zz-t18` triggered `REMOTE_INCIDENT`, zero imported files, clone preserved).
- Case 4 (clone config mutation): Triggers `SCOPE_STOP` (`zz-t16`), checkout config and refs remain untouched.
- Case 9 (credential helper): Canary helper in host global config masked by launcher-owned empty global config and empty `credential.helper` in `GIT_CONFIG_COUNT`.
- Case 12 (transient push+revert): Confirmed as an audit blind (`zz-t20`), snapshots equal, no incident.
- Case 14 (descriptor tampering): Missing, malformed, or unauthorised modes fail closed at loader, dispatcher, and watchdog.

### UNPROVED Inventory Verification
All unproved surfaces are honestly listed without false claims:
1. Prevention of `-c url.*.insteadOf` bypass (prevention UNPROVED; detection proved).
2. OS credential stores, SSH agent, and helpers other than config (UNPROVED).
3. Alternate/foreign git implementations (UNPROVED).
4. Hosting API mutations (UNPROVED).
5. Transient push+revert (UNPROVED; verified blind).
6. Failed after-query masking blind (UNPROVED).
7. Webhooks and unlisted remotes (UNPROVED).
8. Live end-to-end execution of Codex/Copilot routes under provider quota exhaustion (UNPROVED).
9. Runtime behavior of `LOCAL_COMMIT` (UNPROVED; unreachable without active authorisation).

### Regression Runs
- `node launch-test.cjs`:
  - Run 1: **129/129 PASS** (exit 0, ~38s)
  - Run 2: **128/129 PASS**, 1 timeout fail on `zz-t16` (`got STARTING` after 120s due to parallel PowerShell CIM query saturation)
  - Run 3: **129/129 PASS** (exit 0, ~36s)
  - Run 4: **129/129 PASS** (exit 0, ~34s)
- `node launch.cjs --check`: exit 0 (25/25 commands parse; no model called).
- `node launch.cjs --preflight`: exit 0 (9/9 role lines point to their jobs).
- `validate-protocol.ps1`: exit 0 (Protocol OK. 0 warning(s)).

---

## 3. Findings Beyond the List

1. **WMI/CIM Concurrency Saturation**: `launch-test.cjs` spawns 20 scenario processes in parallel, each running 1-second ticks invoking `powershell -Command "Get-CimInstance Win32_Process ..."` synchronously via `execFileSync`. Under Windows process table load, CIM queries occasionally stall, causing `L.run` event loop starvation and leading to intermittent timeout (observed in Run 2 on `zz-t16`).
2. **Audit After-Query Failure Blind**: In `launch.cjs:635`, if the after-query fails with an error (e.g. timeout or connection drop), `remoteAuditVerdict` classifies the difference as `unverified` rather than `incident`, so the attempt is not invalidated.
3. **`kilo-routes.json` Snapshot Drift**: `deepseek/deepseek-flash` is configured as primary in `jobs.json`, but is absent from `docs/core-arch/stage-4/kilo-routes.json` (generated 2026-09-24). Consequently, `kiloCandidates` places the keyless `openai-compatible/deepseek/deepseek-flash` as first fallback (`kilo:1`).

---

## 4. Recommendations

1. **Update `kilo-routes.json`**: Regenerate `docs/core-arch/stage-4/kilo-routes.json` (via owner/spec author session) to include `deepseek/deepseek-flash`.
2. **Integrate R-L3-004.9 Record Text**: The spec author should append the record text provided in DeepSeek's response into `docs/core-arch/stage-4/P-L3-004-route-failover.md`.
3. **Stagger Self-Test Scenarios**: Throttle or batch parallel test scenarios in `launch-test.cjs` to eliminate WMI query contention on Windows.

---

## 5. Certification Verdict

**RECOMMENDATION** (No item FAILs; all specification requirements met; recommendations recorded).
F-3P-1 remains `OPEN - HYPOTHESIS UNDER VALIDATION` per PROTO-DEC-0077 item 3.
