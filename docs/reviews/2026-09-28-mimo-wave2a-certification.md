# MiMo-V2.6-Pro - ROADMAP-1 wave-2A frozen-candidate certification

**Date**: 2026-09-28 (UTC)
**Reviewed commit**: `5bc9940` (candidate code; full `5bc99407` via `git rev-parse 5bc9940`)
**Working tree**: dirty (only this certifier's untracked journal; no candidate file uncommitted)
**Reviewer**: MiMo-V2.6-Pro, route `xiaomi` provider, model id `mimo-v2.6-pro` (confirmed from client log `C:\Users\Dmitry\.local\share\mimocode\log\2026-09-28T115648194Z-main-24828-4315153a.log`: `providerID=xiaomi modelID=mimo-v2.6-pro`; effort `high` per frozen route). Client usage/effort JSON: `not-exposed` in this harness.
**Scope**: audit (wave 2A kernel batch 1 items A-G plus KNOWN F-2A-01..06 closure check)
**scope-check**: PASS
**Verdict**: RECOMMENDATION
**Mode**: CERTIFYING
**Receipt-Owner**: mimo-370f15396465bd07

Authority: `docs/reviews/2026-09-28-vibe-wave2a-adversarial-prompt.md`, `docs/research/2026-09-27-roadmap-queue/LAUNCH-2A-CERT-MIMO.md` (PROTO-DEC-0090 item 4, PROTO-DEC-0041 item 2, PROTO-DEC-0038 item 1). Independence: outside execution and control of the candidate; did not read the parallel certifier's artifacts before this file.

---

## Executive Summary

All six implementation items and the hygiene surface reproduce as specified. The W0 parser handles colon/NBSP/comma/dot grouping and K/M suffixes and captures the real NBSP pair to `252154`; the 40 fixtures are byte-identical across the range; W1-retire is one header line; the canonical RUNS store validates with two authentic records whose `pins.launchSha256` match the tree; S-7 throttle preserves scenario semantics (55/55 `--pure`); S-10 vibe notes validate. No HIGH or MEDIUM mandatory defect. Residual LOW items remain open (F-2A-01 report text, F-2A-03 literal tracked-tree test write, F-2A-05 default-path coverage) and are backlog, not release blockers. Verdict: **RECOMMENDATION**.

---

## Baseline and Binding

- Frozen candidate `kernel-batch-1` code at `5bc9940`. `git diff 5bc9940..HEAD --stat` shows only docs (launch/recovery files + this audit prompt). Code identical at `48365b2` and `5bc9940` (`git diff 48365b2..5bc9940` = journal + review-2 task + DeepSeek review only).
- Range under audit: `a4312e8..5bc9940` (12 commits; six code items). Six code commits: `fbff763`, `61c7159`, `cf99cdf`, `fde0248`, `653117c`, `fa74541`.
- Working tree at audit start: clean apart from `.ai/worklog/mimo-370f15396465bd07.md`.
- Environment: Windows 10.0.26200, Node v22.21.0, PowerShell 5.1.

---

## Per-item verdicts

| Item | Surface | Verdict |
|---|---|---|
| A | W0 codex usage parser | PASS |
| B | W5 hermetic fixtures | PASS |
| C | W1-retire | PASS |
| D | Item 4 canonical RUNS store | PASS |
| E | Item 5 S-7 throttle | PASS |
| F | Item 6 S-10 vibe note | PASS |
| G | Hygiene `a4312e8..5bc9940` | PASS |
| KNOWN | F-2A-01..06 dispositions | PASS (as a checklist; three residuals stay open, see ledger) |
| **Whole candidate** | | **RECOMMENDATION** |

---

## Commands executed

- `node --test tests/dispatch.test.cjs` -> 28/28 pass (includes W0, T5, T6, T30, Guard)
- `node --test --test-name-pattern="W0|T5|T6|T30|T3" tests/dispatch.test.cjs` -> 5/5 pass
- `node --test tests/resolver.test.cjs` -> 7/7 pass (T3 registry + AC-15)
- `node .ai/bin/protocol-runrecord.cjs validate docs/ops/RUNS.jsonl` -> `records=2 invalid=0`, exit 0
- `node .ai/bin/protocol-dispatch.cjs report docs/research/2026-09-27-cost-routes-research/prompts/DISPATCH.json` -> both records rendered, exit 0
- `node .ai/bin/protocol-dispatch.cjs probe vibe` -> `state=OK`, exit 0
- `node docs/research/2026-09-25-improvement-research/prompts/launch-test.cjs --pure` -> 55 PASS / 0 FAIL, exit 0
- `node docs/research/2026-09-25-improvement-research/prompts/launch-test.cjs --one zz-t1` -> exit 0
- `powershell -ExecutionPolicy Bypass -File .\validate-protocol.ps1` -> exit 0, 1 WARN (journal count; F-2A-06)
- Direct `parseUsageFromLog(..., 'codex-tokens')` probes (12 adversarial inputs)
- `validateDispatch` probes for unsafe `runsFile` values
- Blob-hash comparison of all 40 fixture paths across `a4312e8` and `5bc9940`
- `git reflog show kernel-batch-1`; per-commit `git show --stat` for the six code commits
- `git diff cf99cdf^..cf99cdf -- run-chain.cjs`; grep for live `run-chain` invocations

---

## A. W0 codex usage parser (`fbff763`) - PASS

Named test `W0: codex usage parser with grouping, colon, K/M suffixes, and raw line` passes. Independent probes with `parseUsageFromLog(path, 'codex-tokens')`:

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
| real NBSP pair `252`+U+00A0+`154` | true | **252154** | captured with NBSP |
| `tokens used: 10 644.` (trailing punct) | true | 10644 | captured |
| `tokens used abc` | false | null | null |
| `tokens used: 1.5k extra` | true | 1500 | captured |

Schema agreement: `docs/specs/run-record.schema.md` declares `rawUsage` `string\|null`. `validateRecord` rejects a numeric `rawUsage` with `attempts[0].rawUsage: must be a string or null`; string and null accept. `protocol-runrecord.cjs:385-388` matches behavior.

---

## B. W5 hermetic fixtures (`61c7159`) - PASS

- All 40 paths (`DISPATCH.json` + 39 `run/*`) blob-hash identical across `a4312e8..5bc9940` (40 same, 0 diff, 0 missing). `DISPATCH.json` blob `20577df1874f55dc98fe1afc396f688309de6c79` at both ends (38 slots).
- Old `docs/research/2026-09-26-ownerideas-revision/prompts/` is gone at HEAD; archive copy remains.
- T5 runs the fixture from a temp root and stays green. Guard test (T28) confirms the suite leaves no tracked-file changes after a normal run.
- `git diff a4312e8..5bc9940 -- docs/research/archive/INDEX.md`: exactly one inserted `CR-W5-1` row; `CR-F01-1` byte-identical (still says fixtures "stay in place").
- `getRepoRoot()` (F-2A-02): default `process.cwd()` unchanged; `PROTOCOL_REPO_ROOT` override works and is inert when unset; `opts.repoRoot` wins. 19 call sites use `getRepoRoot`; zero remaining `opts.repoRoot || process.cwd()` inlines. Behavior-preserving.

---

## C. W1-retire (`cf99cdf`) - PASS

`git diff cf99cdf^..cf99cdf` on `run-chain.cjs` is exactly one added header line. Actual text:

```
// RETIRED: New programs use .ai/bin/protocol-dispatch.cjs only (OPS-1 W1). Kept because reviews cite it.
```

File kept; nothing else in the file changed. No active tooling invokes it: remaining `run-chain` mentions are historical reviews, archive docs, frozen test fixtures, and the execution/prompt documents. Note: `W2A-EXECUTION.md:57` quotes a slightly different string (`OPS-1 W1-retire`). — folded into F-2A-01 class (report text).

---

## D. Item 4, canonical RUNS store (`fde0248`) - PASS

- Root cause confirmed: `aa52c42` emptied `docs/ops/RUNS.jsonl`.
- `runsFile` is in `allowedTopKeys` with `isSafeRelativePath`. Probes: `../evil`, `C:/evil`, `C:\evil`, `/evil`, `""` all REJECT. Relative forms pass the path check (empty/absolute rejected first).
- Resolution precedence in `runDispatch`/`reportDispatch`: CLI `--runs-file` > `PROTOCOL_RUNS_FILE` > `dispatch.runsFile` (relative to repoRoot) > default `docs/ops/RUNS.jsonl`.
- Null-safe `sessionId`/`exitCode` on early returns (`executeAttempt` CONFIG_ERROR/prepareWorkdir paths emit `exitCode: null, sessionId: null`) and on record assembly (`sessionId: lastSessionId || null`, `exitCode` coerced to null when undefined). No `undefined` leaks into the record schema.
- Two authentic records validate (`records=2 invalid=0`): `R-20260927T020054Z-cr-collector-a`, `R-20260927T020803Z-cr-collector-b`. Both `pins.launchSha256` match the current tree (`177a1ddd…` / `b7bcb825…` recomputed). `report` renders both, exit 0.
- T30 passes (covers `dispatch.runsFile`). Bare default path is proven by code + the manual `report` run; no dedicated unit assertion (F-2A-05, still open).

---

## E. Item 5, S-7 throttle (`653117c`) - PASS

- `CONCURRENCY = 4` with a `launchNext` queue. Every terminal path routes through `finishScenario` (slot released exactly once); `own` watchdog scenarios still report directly.
- `--pure`: 55 PASS / 0 FAIL, exit 0 (option matrix, error-text classifier, aliveTree, progress, scope, vibe/preflight/copilot checks). `--one zz-t1`: exit 0.
- Scenario semantics (envCanary, audit, stopBefore/stopAfter, imported/orphan assertions, sorting/reporting) unchanged by the throttle.

---

## F. Item 6, S-10 vibe note (`fa74541`) - PASS

Changed fields, verbatim:

- `clients.vibe.resume.note`: `"supports --resume [SESSION_ID]; never edit an entry after record; add a new entry"`
- `clients.vibe.note`: `"never edit an entry after record; add a new entry"`

`loadRegistry`/`validateRegistry` accept the extra key. `probe vibe` exit 0. No other client entry touched (`git diff fa74541^..fa74541` is 2 insertions / 1 deletion on that file only).

---

## G. Hygiene - PASS

- One commit per code item with explicit paths (`fbff763`, `61c7159`, `cf99cdf`, `fde0248`, `653117c`, `fa74541`). Docs commits (`f765aa8`, `ed458ae`, `3fba0d2`, `5a6cad1`, `5bc9940`) carry no code.
- `git reflog show kernel-batch-1`: one `reset: moving to HEAD~1` at `fbff763` (F-2A-04, orphan `21037bf`); final history linear and unpushed. No further force/rebase/amend.
- No `.ps1` file touched in the range. Validator encoding/size checks pass (UTF-8/LF). No scope creep outside the named files.
- `git status` clean apart from this certifier's journal.

---

## Findings Ledger (KNOWN items + residuals)

| ID | Requirement | Candidate | Reproduction | Actual Result | Severity | Disposition | Proof of Closure |
|---|---|---|---|---|---|---|---|
| F-2A-01 | Execution report must describe the change accurately | `3fba0d2` / `W2A-EXECUTION.md:42,57` | `git show 61c7159 -- docs/research/archive/INDEX.md`; `sed -n 3p` of `run-chain.cjs` | Line 42 still claims INDEX line 16 (CR-F01-1) was updated; diff is a pure CR-W5-1 insertion. Line 57 quotes a W1-retire header string that does not match the committed line. Behavior is correct; report text is not | LOW | **confirmed, still open** | Reword item-2 and item-3 summaries |
| F-2A-02 | No undisclosed kernel edits | `61c7159` | `getRepoRoot` probes + call-site count | Behavior-preserving: default `cwd`, `PROTOCOL_REPO_ROOT` inert unless set, `opts.repoRoot` first; 19 call sites, 0 old inlines | LOW | **closed (behavior-preserving verified)**; disclosure gap remains a report note under F-2A-01 | Probes above |
| F-2A-03 | "No test writes into the tracked tree" | `tests/dispatch.test.cjs:217` etc. | write/unlink probe of `.ai/worklog/gemini-0123456789abcdef.md`; Guard test | Literal tracked-tree write remains (`??` while present, clean after unlink/`finally`). Observable clean-after-normal-run holds (Guard). Killed-run window is sub-poll and was previously shown clean | LOW | **confirmed, still open** | Route the imported journal under `.ai/runtime/` |
| F-2A-04 | No force/rebase/amend | branch reflog | `git reflog show kernel-batch-1` | One `reset: moving to HEAD~1` at `fbff763` dropping orphan `21037bf`; linear unpushed history | INFO | **closed (noted)** | n/a |
| F-2A-05 | Default canonical store path covered | `fde0248` T30 | read T30 | T30 sets `dispatch.runsFile`; bare `docs/ops/RUNS.jsonl` append has no direct unit assertion. Manual `report` proof recorded in this review | LOW | **confirmed, still open** | Add a default-path assertion |
| F-2A-06 | Validator clean | tree | `validate-protocol.ps1` | Exit 0, 1 WARN: 104 session journals (cap 100). Environmental | INFO | **open (environmental)** | Archive completed journals |

---

## Alternatives Considered

- **FAIL on F-2A-01**: rejected. The defect is documentation-to-behavior divergence in a report (LOW / backlog per PROTO-DEC-0041). Candidate code behavior is correct; no invariant or protected path is violated. Unreproduced FAIL claims would be advisory anyway; these are reproduced but non-blocking.
- **PASS**: rejected. Three known items remain confirmed and open (F-2A-01, F-2A-03, F-2A-05). Residual non-blocking defects are reported as RECOMMENDATION, consistent with the prior independent review's calibration.

---

## Recommendations & Actionable Plan

1. Correct `W2A-EXECUTION.md` item-2 (INDEX sentence) and item-3 (actual W1-retire header text) (F-2A-01).
2. Move the test-imported journal under `.ai/runtime/` so no test touches the tracked tree (F-2A-03).
3. Add one default-path assertion for `docs/ops/RUNS.jsonl` (F-2A-05).
4. Archive completed journals to clear the F-2A-06 WARN.
5. Pair this report with the second independent certifier (PROTO-DEC-0041 item 2) before any completion gate is marked.

---

## References

- Audit prompt: `docs/reviews/2026-09-28-vibe-wave2a-adversarial-prompt.md`
- Launch: `docs/research/2026-09-27-roadmap-queue/LAUNCH-2A-CERT-MIMO.md`
- Prior advisory review: `docs/reviews/2026-09-27-deepseek-roadmap-2a-review.md`
- Execution report: `docs/research/2026-09-27-roadmap-queue/W2A-EXECUTION.md`
- Schema: `docs/specs/run-record.schema.md`
- Active task: `.ai/TASK.md`
- Journal: `.ai/worklog/mimo-370f15396465bd07.md`
