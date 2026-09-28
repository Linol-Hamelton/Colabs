# MiMo-V2.6-Pro - ROADMAP-1 wave-2A frozen-candidate certification (round 2)

**Date**: 2026-09-28 (UTC)
**Reviewed commit**: `9bf15ae46d444d583c0760e52435e1ab427e2c6e` (candidate code tree)
**Working tree HEAD**: `9eb8643` = `9bf15ae` + two round-2 launch docs only (`git diff 9bf15ae..HEAD --stat` = 2 files). Candidate code is the tree at `9bf15ae`.
**Working tree**: dirty only with this certifier's untracked journal and this review; no candidate file uncommitted
**Reviewer**: MiMo-V2.6-Pro. Route: provider `xiaomi`, model id `mimo-v2.6-pro`. Client log evidence: `C:\Users\Dmitry\.local\share\mimocode\log\2026-09-28T115648194Z-main-24828-4315153a.log` (`modelID=mimo-v2.6-pro`, `providerID=xiaomi`, variant `high`); same route recorded on `2026-09-27T014907592Z-main-3060-db4c917a.log`. This harness exposes no per-call usage/effort JSON: `not-exposed`.
**Scope**: full certification of frozen tree `9bf15ae`, emphasis on fix delta `5ce5219..9bf15ae`; re-run of unified audit items A-G; round-1 closure of Sol B/E and MiMo F-2A-01/03/05
**scope-check**: PASS
**Verdict**: RECOMMENDATION
**Mode**: CERTIFYING
**Receipt-Owner**: mimo-695fcfb3b47f3125

Authority: `docs/research/2026-09-27-roadmap-queue/LAUNCH-2A-CERT2-MIMO.md` (PROTO-DEC-0090 item 4, PROTO-DEC-0041 item 2), `docs/reviews/2026-09-28-vibe-wave2a-adversarial-prompt.md` (PROTO-DEC-0038 item 1). Independence: outside execution and control of the candidate; did not read the parallel certifier's round-2 artifacts before this file. DeepSeek fix review used for comparison only; every claim re-verified below.

---

## Executive Summary

Both reproduced round-1 blockers are closed on the candidate code. W5 hermeticity now binds discovered journal imports to `PROTOCOL_JOURNAL_IMPORT_ROOT` (tests use a suite temp root); a killed mid-suite probe left `git status` free of the fake journal; the new `W5 (F-2A-03)` test and the Guard test assert the binding. S-7 bounds every `--one` child to four: the rebuilt instrumented probe prints `PROBE_MAX_ONE=4`, and both `own` watchdog scenarios go through the same pool. Items A-G re-run as PASS against `9bf15ae`. Residuals: F-2A-01 (report sentence) and F-2A-05 (default-path unit assertion) remain open LOW and do not block; a declared-output journal can still land in `repoRoot` despite the override (theoretical). Verdict: **RECOMMENDATION** (same calibration as round 1: confirmed open LOW residuals; no HIGH/MEDIUM mandatory defect; no residual blocks).

---

## Baseline and Binding

- Candidate code `9bf15ae`. `git diff 5ce5219..9bf15ae` = fix delta + docs (code: `.ai/bin/protocol-dispatch.cjs`, `tests/dispatch.test.cjs`, `launch-test.cjs` via `6364322` and `b26b177` only). Code at `5bc9940` plus those two fixes is the candidate, matching the launch freeze note.
- Launch baseline check said HEAD=`9bf15ae`; actual HEAD is `9eb8643` (two launch docs). Recorded as a freeze-note drift, not a code finding: `git diff 9bf15ae..HEAD` is docs-only.
- Fix commits: `6364322` (W5, failing test first) and `b26b177` (S-7). Pre-fix blobs lack `PROTOCOL_JOURNAL_IMPORT_ROOT` / `W5 (F-2A-03)` / `TEST_JOURNAL` and still have `for (const id of own) deadWatchdog(id, report)` outside the pool.
- Environment: Windows 10.0.26200, Node v22.21.0, PowerShell 5.1.

---

## Per-item verdicts (re-run of A-G at `9bf15ae`)

| Item | Surface | Verdict |
|---|---|---|
| A | W0 codex usage parser | PASS |
| B | W5 hermetic fixtures (+ F-2A-03 fix) | PASS |
| C | W1-retire | PASS |
| D | Item 4 canonical RUNS store | PASS |
| E | Item 5 S-7 throttle (+ bound-of-four fix) | PASS |
| F | Item 6 S-10 vibe note | PASS |
| G | Hygiene (original range + fix delta) | PASS |
| KNOWN | F-2A-01..06 dispositions | PASS as checklist; F-2A-01 and F-2A-05 stay open (see ledger) |
| **Whole candidate** | | **RECOMMENDATION** |

---

## Commands executed (tree at HEAD=`9eb8643`, code-identical to `9bf15ae`)

- `node --test tests/dispatch.test.cjs` -> **29/29 pass** (includes W0, T5, T6, T30, W5 (F-2A-03), Guard)
- `node --test --test-name-pattern="W0" tests/dispatch.test.cjs` -> 1/1 pass
- `node --test tests/resolver.test.cjs` -> 7/7 pass
- `node docs/research/2026-09-25-improvement-research/prompts/launch-test.cjs --pure` -> **55 PASS / 0 FAIL**, exit 0
- `node docs/research/2026-09-25-improvement-research/prompts/launch-test.cjs --one zz-t1` -> exit 0
- Instrumented full scenario run (spawn wrapper counting `--one`) -> `PROBE_ACTIVE_ONE=1..4`, `PASS S-7: at most 4 simultaneous --one children (PROBE_MAX_ONE=4)`, all scenarios PASS, `PROBE_MAX_ONE=4`
- Killed mid-suite probe (`spawnSync` timeout 25 s) -> `git status --porcelain` only `?? .ai/worklog/mimo-695fcfb3b47f3125.md`; no `gemini-0123456789abcdef` path
- `node .ai/bin/protocol-runrecord.cjs validate docs/ops/RUNS.jsonl` -> `records=2 invalid=0`
- `node .ai/bin/protocol-dispatch.cjs report docs/research/2026-09-27-cost-routes-research/prompts/DISPATCH.json` -> both records rendered
- `node .ai/bin/protocol-dispatch.cjs probe vibe` -> `state=OK version="vibe 2.25.8"`
- `powershell -ExecutionPolicy Bypass -File .\validate-protocol.ps1` -> exit 0, 1 WARN (108 journals, cap 100; F-2A-06)
- Direct `parseUsageFromLog` probes (13 inputs), `validateRecord` rawUsage probes, `validateDispatch` runsFile probes, `getRepoRoot` probes, `importResults` binding probes (discovered + declared), blob-hash of 40 fixtures across `a4312e8`/`5bc9940`/`9bf15ae`, `git reflog show kernel-batch-1`, per-commit `git show --stat`

---

## A. W0 codex usage parser - PASS

Named test passes. Independent `parseUsageFromLog(..., 'codex-tokens')` probes (`usage.amount`):

| Input | found | amount | rawUsage |
|---|---|---|---|
| `tokens used: 10 644` | true | 10644 | captured |
| `tokens used\n10 644` | true | 10644 | captured |
| `tokens used\n10\u00A0644` | true | 10644 | captured |
| `tokens used\n10,644` | true | 10644 | captured |
| `tokens used: 10.644` | true | 10644 | captured |
| `tokens used: 10k` | true | 10000 | captured |
| `tokens used: 1.5K` | true | 1500 | captured |
| `tokens used: 2.5M` | true | 2500000 | captured |
| real NBSP pair `252`+U+00A0+`154` | true | **252154** | captured |
| `tokens used: 10 644.` | true | 10644 | captured |
| `tokens used abc` | false | null | null |
| `tokens used: 1.5k extra` | true | 1500 | captured |
| `tokens used 42` (no colon) | true | 42 | captured |

Schema: `validateRecord` on an authentic `docs/ops/RUNS.jsonl` record — `rawUsage` number/object -> `root.attempts[0].rawUsage: must be a string or null`; string and null -> 0 errors. Matches `docs/specs/run-record.schema.md`.

---

## B. W5 hermetic fixtures + F-2A-03 fix - PASS

- All 40 paths (`DISPATCH.json` + 39 `run/*`) blob-hash identical: `a4312e8` old prefix vs `5bc9940` `tests/fixtures/prompts` = 40 same / 0 diff; `5bc9940` vs `9bf15ae` = 40 same. `DISPATCH.json` unchanged (38 slots).
- Old `docs/research/2026-09-26-ownerideas-revision/prompts/` gone; archive copy intact. INDEX: exactly one inserted `CR-W5-1` row; `CR-F01-1` byte-identical (still says fixtures "stay in place" — F-2A-01).
- `getRepoRoot()`: default `process.cwd()`; `PROTOCOL_REPO_ROOT` override works and is inert when unset; `opts.repoRoot` wins. 19 call sites use `getRepoRoot`; zero remaining `opts.repoRoot || process.cwd()` inlines. Behavior-preserving (F-2A-02 closed).
- **Hermeticity fix verified independently**: `journalImportRoot(repoRoot)` returns `repoRoot` when `PROTOCOL_JOURNAL_IMPORT_ROOT` is unset. On a git workdir with a discovered untracked journal: env UNSET -> journal lands in `repoRoot`; env SET -> journal lands in the override, **not** in `repoRoot`. New test `W5 (F-2A-03)` asserts journal in temp root, absent from repo root, and clean `git status`. Guard test fails on any `gemini-0123456789abcdef` path in the real tree. Killed mid-suite probe: porcelain clean of the fake journal.
- Residual (LOW, theoretical): the declared-outputs loop still copies declared paths to `repoRoot` unconditionally; a dispatch that declares a `JOURNAL_RE` path as an output bypasses the override. Reproduced with `importResults(dir, ['.ai/worklog/gemini-declared.md'], repoRoot)` under the override -> file in `repoRoot`, not in the override. No test or config does this. Not blocking.

---

## C. W1-retire - PASS

`git diff cf99cdf^..cf99cdf` on `run-chain.cjs` is exactly one added header line: `// RETIRED: New programs use .ai/bin/protocol-dispatch.cjs only (OPS-1 W1). Kept because reviews cite it.` File kept. Remaining `run-chain` mentions are historical reviews, archive docs, frozen fixtures, and execution/prompt documents — no active tooling invokes it. (`W2A-EXECUTION.md:57` quotes `OPS-1 W1-retire`; actual text is `OPS-1 W1` — folded into F-2A-01.)

---

## D. Item 4, canonical RUNS store - PASS

- `validate docs/ops/RUNS.jsonl`: `records=2 invalid=0` (`R-20260927T020054Z-cr-collector-a`, `R-20260927T020803Z-cr-collector-b`). `report` renders both, exit 0.
- `runsFile` is in `allowedTopKeys` with `isSafeRelativePath`. Probes: `../evil.jsonl`, `..\\evil`, `a/../../evil.jsonl`, `C:/evil.jsonl`, `C:\evil.jsonl`, `/evil.jsonl`, `""` all REJECT. `docs/ops/../../escape.jsonl` and `foo/../bar.jsonl` normalize to in-repo relative names (`escape.jsonl`, `bar.jsonl`) and correctly ACCEPT — `path.resolve(repoRoot, ...)` stays inside the repo.
- Precedence CLI > `PROTOCOL_RUNS_FILE` > `dispatch.runsFile` > default `docs/ops/RUNS.jsonl` unchanged in this delta. T30 passes (covers `dispatch.runsFile` only).
- F-2A-05: bare default `docs/ops/RUNS.jsonl` append still has **no dedicated unit assertion** (T30 title mentions it; body only exercises `dispatch.runsFile`). Manual `report` proof is not a test. Still open.

---

## E. Item 5, S-7 throttle + bound-of-four fix - PASS

- Instrumented full run: `PROBE_ACTIVE_ONE` peaks at 4; `PASS S-7: at most 4 simultaneous --one children (PROBE_MAX_ONE=4)`; `PROBE_MAX_ONE=4` on process exit. This replaces Sol's reproduced `PROBE_MAX_ONE=6`.
- Both `own` watchdog scenarios now enter via `queue = [...own, ...ids]` and `runOne` -> `deadWatchdog(id, report, onSlotFree)` / `runScenario`, both through `spawnOne` (the only `--one` spawner). The pre-fix `for (const id of own) deadWatchdog(id, report)` outside the pool is gone.
- Slot released exactly once: `spawnOne`'s `release` is guarded by `released` and bound to `exit` and `error`; `onSlotFree` is that same callback. Probe counter and pool counter change at the same events.
- Semantics preserved: `--pure` 55 PASS / 0 FAIL; `--one zz-t1` exit 0; full scenario suite PASS (env, git-mode, hook, push-block, table, zz-t1..t22).

---

## F. Item 6, S-10 vibe note - PASS

Unchanged from round 1 and re-checked: `clients.vibe.note` = `"never edit an entry after record; add a new entry"`; `clients.vibe.resume.note` = `"supports --resume [SESSION_ID]; never edit an entry after record; add a new entry"`. `probe vibe` -> `state=OK version="vibe 2.25.8"`. Resolver 7/7.

---

## G. Hygiene - PASS

- Original six code commits (`fbff763`, `61c7159`, `cf99cdf`, `fde0248`, `653117c`, `fa74541`) remain one-per-item with explicit paths. Fix delta adds exactly two code commits (`6364322` W5: dispatcher+tests; `b26b177` S-7: launcher only) plus journals/docs.
- `git reflog show kernel-batch-1`: known `reset: moving to HEAD~1` at `fbff763` (F-2A-04) and two `cherry-pick` entries bringing the round-1 reports onto this branch; no force/rebase/amend in the fix range. History linear and unpushed.
- No `.ps1` file touched in `5ce5219..9bf15ae`. Validator encoding/size checks pass (UTF-8/LF). No scope creep outside named files.

---

## Fix-delta verification (claims re-checked, not adopted)

| DeepSeek claim | Independent result |
|---|---|
| W5 override binds discovered journals | **Confirmed** — env UNSET -> `repoRoot`; env SET -> override, not `repoRoot` |
| Killed run leaves no fake journal | **Confirmed** — 25 s kill; porcelain clean |
| New W5 test absent pre-fix | **Confirmed** — no `JOURNAL_IMPORT_ROOT` / `W5 (F-2A-03)` / `TEST_JOURNAL` at `6364322^` |
| S-7 `PROBE_MAX_ONE=4` | **Confirmed** — measured 4 |
| `own` scenarios pooled | **Confirmed** — `queue = [...own, ...ids]`; `runOne` routes both kinds |
| Declared-output residual | **Confirmed** — declared journal path still copies to `repoRoot` under the override |
| Round-1 reports missing from candidate branch (N-1) | **Superseded by freeze** — `9bf15ae` includes `2026-09-28-sol-wave2a-certification.md` and `2026-09-28-mimo-wave2a-certification.md` |
| `--pure` count 53 vs 55 (N-4) | **55 measured**; Sol's 53 is inconsistent with the frozen file |

---

## Round-1 closure table

| ID | Source | Requirement | Disposition | Blocks? | Proof |
|---|---|---|---|---|---|
| Sol B | Sol FAIL item B | No test writes into the tracked tree | **CLOSED** | no | temp-root binding + W5 test + Guard + killed-run clean |
| Sol E | Sol FAIL item E | S-7 concurrent scenario bound is four | **CLOSED** | no | `PROBE_MAX_ONE=4`; own pooled; slot released once |
| F-2A-01 | MiMo R1 | Execution report must describe the change accurately | **OPEN** (LOW) | **no** | `W2A-EXECUTION.md:42` still claims CR-F01-1 updated; `:57` quotes `OPS-1 W1-retire` vs `OPS-1 W1`. Report text only; code behavior correct. Forward artifact may reword; do not rewrite frozen history |
| F-2A-03 | MiMo R1 | Literal tracked-tree test write | **CLOSED** | no | `PROTOCOL_JOURNAL_IMPORT_ROOT` + `TEST_JOURNAL` retarget; discovered imports never hit the tracked tree |
| F-2A-05 | MiMo R1 | Default canonical store path covered by a test | **OPEN** (LOW) | **no** | T30 body exercises `dispatch.runsFile` only; bare `docs/ops/RUNS.jsonl` still lacks a unit assertion |

Also noted: F-2A-02 closed (behavior-preserving `getRepoRoot`); F-2A-04 closed (known reflog reset); F-2A-06 open environmental (108 journals / cap 100).

---

## Findings Ledger (this round)

| ID | Severity | Requirement | Reproduction | Actual Result | Disposition |
|---|---|---|---|---|---|
| R2-01 | LOW | Declared outputs must honor the journal-import override | `importResults(dir, ['.ai/worklog/gemini-declared.md'], repoRoot)` with `PROTOCOL_JOURNAL_IMPORT_ROOT` set | declared journal lands in `repoRoot`, not the override | confirmed; theoretical (no test/config declares a journal output); optional hardening |
| R2-02 | LOW | New production-honoured env contracts should be documented | `protocol-dispatch.cjs` `journalImportRoot` | `PROTOCOL_JOURNAL_IMPORT_ROOT` exists only as a code comment | confirmed; document in the next forward artifact |
| R2-03 | INFO | Freeze note should match the worktree | `git rev-parse HEAD` | HEAD is `9eb8643`, not the launch's `9bf15ae`; delta is the two launch docs | noted; candidate code correctly taken as `9bf15ae` |

---

## Alternatives Considered

- **FAIL on F-2A-01 / F-2A-05**: rejected. Both are LOW documentation/coverage residuals already judged non-blocking in round 1; code behavior is correct and re-verified. Unreproduced FAIL would be advisory; these are reproduced but non-blocking.
- **PASS**: rejected under the round-1 calibration. F-2A-01 and F-2A-05 remain confirmed and open; residual non-blocking defects are reported as RECOMMENDATION.
- **BLOCKED**: rejected. All required checks ran with shell and filesystem access.

---

## Recommendations & Actionable Plan

1. Correct `W2A-EXECUTION.md` item-2 (INDEX sentence) and item-3 (actual W1-retire header text) in a forward artifact (F-2A-01).
2. Add one default-path unit assertion for bare `docs/ops/RUNS.jsonl` (F-2A-05).
3. Optionally extend the journal-import override to the declared-outputs loop (R2-01) and document `PROTOCOL_JOURNAL_IMPORT_ROOT` (R2-02).
4. Archive completed journals to clear the F-2A-06 WARN.
5. Pair this report with the second independent certifier (PROTO-DEC-0041 item 2) before any completion gate is marked.

---

## References

- Launch: `docs/research/2026-09-27-roadmap-queue/LAUNCH-2A-CERT2-MIMO.md`
- Audit prompt: `docs/reviews/2026-09-28-vibe-wave2a-adversarial-prompt.md`
- Round-1 MiMo report: `docs/reviews/2026-09-28-mimo-wave2a-certification.md`
- Round-1 Sol report: `docs/reviews/2026-09-28-sol-wave2a-certification.md`
- Fix journal: `.ai/worklog/mistral-e5b0a7370dee2904.md`
- DeepSeek fix review (comparison only): `docs/reviews/2026-09-28-deepseek-2a-fix-review.md`
- Schema: `docs/specs/run-record.schema.md`
- Journal: `.ai/worklog/mimo-695fcfb3b47f3125.md`
