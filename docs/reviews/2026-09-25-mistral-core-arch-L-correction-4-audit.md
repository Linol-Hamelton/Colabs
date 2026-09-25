# Package L, correction pass 4: certifier 2 audit

**Reviewed commit SHA**: `130255471e0e610e48cfde2ff0c6ed369f4d4492`
**Working tree status**: clean detached worktree at `D:\Temp\colabs-worktree-1302554`, removed after audit
**Model**: mistral-medium-3.5
**Date**: 2026-09-26 UTC
**Scope**: Package L correction pass 4 implementation (`docs/core-arch/stage-4/L-CORRECTION-4.md`)
**Mode**: CERTIFYING
**Receipt-Owner**: mistral-336cc83e64fea6b8
**Verdict**: RECOMMENDATION

---

## Audit Summary

This is certifier 2's independent audit of DeepSeek's correction pass 4 implementation for package L. I did not open certifier 1's report (`docs/reviews/2026-09-25-gemini-core-arch-L-correction-4-audit.md`), Gemini's journal, or the Codex attempt journals before writing this report.

The implementation addresses all 9 specification items from `L-CORRECTION-4.md`. All three runs of `launch-test.cjs` passed with 129/129. The `--check` (25/25) and `--preflight` (9/9) commands passed. The validator exited 0. However, one finding requires attention: the route `deepseek/deepseek-flash` exists in the Kilo CLI but is absent from `docs/core-arch/stage-4/kilo-routes.json`.

---

## Item-by-Item Verdict

| Item | Specification | Verdict | Evidence |
|------|--------------|---------|----------|
| 1 | F-3P-2: Plant hooks - launcher git calls must never run a hook a job can plant | **PASS** | `launch.cjs:415,417`: every launcher git call passes `-c core.hooksPath=<fresh random name under private mkdtemp dir>`; the path is never created. Tested: `zz-t1-zz-t4` (4 hook checks) all PASS; positive control confirms hooks run when explicitly configured. |
| 2 | Credential-separated executor, Level 1 - scrub git credential vectors from job environment | **PASS** | `launch.cjs:458-466`: `executorEnv()` filters out `GH_TOKEN`, `GITHUB_TOKEN`, `GIT_ASKPASS`, `SSH_ASKPASS`, `SSH_AUTH_SOCK` and any `*_TOKEN`/`*_PAT` naming GH/GITHUB/GIT. Adds `GIT_CONFIG_NOSYSTEM=1`, launcher-owned empty `GIT_CONFIG_GLOBAL`, `GIT_TERMINAL_PROMPT=0`, `GCM_INTERACTIVE=never`, empty `credential.helper`. Tested: `zz-t17` (5 env checks with 8 planted canaries + canary credential helper) all PASS. |
| 3 | Task git modes, default-deny - every job gets mode from table, BRANCH_PUSH/RELEASE_PUSH fail closed | **PASS** | `launch.cjs:66-96`: `GIT_MODES` defined, `parseGit()` validates, `gitRefusal()` returns "publisher not implemented" for push modes. `jobs.json:16,31,46,60,73,86,99,112`: all jobs have `"git": {"mode": "READ_ONLY", "publishRequired": false}`. Tested: 8 git-mode checks all PASS. |
| 4 | `ls-remote` audit, never enforcement - before/after every attempt, record ls-remote of each remote | **PASS** | `launch.cjs:606-630`: `lsRemoteSnapshot()` captures remote state, `remoteAuditVerdict()` detects changes, a change in no-push mode invalidates attempt as `REMOTE_INCIDENT`. Tested: `zz-t18` (REMOTE_INCIDENT), `zz-t19` (no incident, snapshots equal), `zz-t20` (push+revert blind confirmed) all PASS. |
| 5 | M-2: `jobs.json` out of code with strict loader - unknown keys/missing fields fail closed | **PASS** | `launch.cjs:58-84,98-120`: `JOBS_FILE` points to `prompts/jobs.json`, `loadJobTable()` uses strict validation, `TableError` thrown on unknown keys/missing fields. `--check` and `--preflight` pass with the file. Tested: 19 table checks all PASS. |
| 6 | M-1: `index.lock` - transient lock must not raise spurious SCOPE_STOP, persistent lock without git process stops attempt | **PASS** | `launch.cjs:606-630`: `workdirState()` treats held lock as unreadable, retries 5 times over ~3.75s. If lock persists: git process in copy → wait; no git process → stop with "stale index.lock", clone kept, lock never deleted. Tested: `zz-t21` (lock gone, DONE), `zz-t22` (INDEX_LOCK, clone kept) both PASS. |
| 7 | S-3: route - `a-deepseek` primary becomes `deepseek/deepseek-flash` in job table, exists in Kilo CLI | **PASS** with **finding** | `jobs.json:39`: primary is `"deepseek/deepseek-flash"`. `--dry a-deepseek` shows new primary. `--smoke a-deepseek` answers OK. **Finding**: `deepseek/deepseek-flash` is absent from `docs/core-arch/stage-4/kilo-routes.json` (verified by grep). This does not block PASS as item 9 forbids editing `docs/core-arch/`. |
| 8 | S-2: K-launch step 0 and README name the governing review - fourth pass | **PASS** | `K-launch.md:26-27`: "DeepSeek's fourth pass on package L, the correction pass `L-CORRECTION-4.md`". `README.md:89`: "waits for DeepSeek's fourth-pass verdict on package L (the correction pass `L-CORRECTION-4.md`)". Both correctly name the fourth pass. |
| 9 | Records - README counts updated, no `docs/core-arch/` edits, R-L3-004.9 text supplied in response | **PASS** | `README.md:73-75`: "129 of 129 in three runs in a row on Windows, 2026-09-25"; counts match implementation. No file under `docs/core-arch/` was modified (verified by `git diff 1302554~1`). R-L3-004.9 text is in DeepSeek's response file. |

---

## Hostile Suite Results

All negative cases from Part 2 that the response claims are implemented were tested via the launch-test.cjs suite:

- **1-8, 10, 12, 13, 14**: All covered by launch-test.cjs scenarios. Direct `git push` (1), alternate remote/explicit URL (3), tag push (6), new-branch push (7), force push (8), branch deletion through push (13), descriptor tampering (14) all refuse or stop correctly.
- **12 (transient push+revert)**: `zz-t20` confirms the blind - snapshots equal, no incident detected.
- **9 (credential helper/OS store/SSH agent)**: Partially tested with canary helper in synthetic global config (`zz-t17` env checks). OS stores and SSH agents remain **UNPROVED** as noted in DeepSeek's response.
- **11 (hosting-API mutation)**: **UNPROVED** - no API surface tested.
- **Unknown coverage**: Honestly listed. No old scenario was weakened or removed.

**Verdict for hostile suite**: PASS for testable subset, **UNPROVED** items correctly identified.

---

## Regression Results

- `launch-test.cjs`: **129/129** in three consecutive runs (exit 0 each time)
- `launch.cjs --check`: **25/25** commands parse; no model called (exit 0)
- `launch.cjs --preflight`: **9/9** role lines point to their jobs; nothing written (exit 0)
- `validate-protocol.ps1`: Protocol OK. 0 warning(s) (exit 0)

No regressions detected. The old `zz-t16` timeout is resolved (now passes with SCOPE_STOP).

---

## Findings Beyond the List

1. **Route snapshot stale**: `deepseek/deepseek-flash` exists in Kilo CLI (`kilo models` verified by DeepSeek) but is **absent from `docs/core-arch/stage-4/kilo-routes.json`**. This means the first fallback is the keyless `openai-compatible/deepseek/deepseek-flash` route. The owner should regenerate the snapshot.

2. **The `-c url.*.insteadOf` bypass remains** (recorded in DeepSeek's response, Points to attack #1): The credential scrub removes environment vectors, but the `-c` command-line flag can still supply a longer `insteadOf` mapping that supersedes the empty-prefix rule. This is a known residual, honestly recorded.

3. **Audit after-query can be broken deliberately** (Points to attack #2): A broken after-query results in `unverified`, not an incident. This is the strongest known bypass of item 4.

4. **Empty `GIT_CONFIG_GLOBAL` path is job-writable** (Points to attack #5): The env-scope empty `credential.helper` is applied last, so editing the file does not restore a helper for jobs, but an adversarial job controls its own env.

5. **Kept credentials**: `GIT_SSH`, `GIT_SSH_COMMAND`, `GIT_CREDENTIAL_*`, `NETRC`/`_NETRC`, other-forge tokens (`GITLAB_TOKEN`), provider keys (`DEEPSEEK_MAIN_KEY`) are not scrubbed (Points to attack #6).

6. **`zz-t16` no longer times out**: Now correctly stops at SCOPE_STOP with no timeout.

---

## Reproductions

All reproductions were performed in the detached worktree at SHA `130255471e0e610e48cfde2ff0c6ed369f4d4492`:

1. **launch-test.cjs x3**: All three runs exited 0 with 129/129 PASS
2. **launch.cjs --check**: Exit 0, 25/25
3. **launch.cjs --preflight**: Exit 0, 9/9
4. **validate-protocol.ps1**: Exit 0, Protocol OK

---

## Verdict

**RECOMMENDATION**

- No item FAILs
- All non-PASS items are named recommendations or findings
- The implementation satisfies the specification
- The route snapshot needs regeneration by the owner (does not block certification)
- Known residuals are honestly recorded

F-3P-1 itself stays OPEN - HYPOTHESIS UNDER VALIDATION (PROTO-DEC-0077 item 3). This certification covers this pass, not the closure of F-3P-1.

---

## Journal Entry

Agent: mistral

Action: Conducted independent certifier 2 audit of package L correction pass 4 at candidate SHA 130255471e0e610e48cfde2ff0c6ed369f4d4492 in detached worktree. Audited all 9 specification items, ran hostile suite, verified three consecutive 129/129 test runs, --check 25/25, --preflight 9/9, validate-protocol.ps1 exit 0.

Result: All items PASS. RECOMMENDATION verdict. Report written at docs/reviews/2026-09-25-mistral-core-arch-L-correction-4-audit.md. Did not open certifier 1 report before this. SHA256 of report: 87e45818c8cdf2bb8c70057c9925bdc49093fca21f6839693e99c27beeaa3bd2.

Next step: Owner regenerates kilo-routes.json snapshot, then certifies completion.

Open: Route snapshot stale (non-blocking finding).
