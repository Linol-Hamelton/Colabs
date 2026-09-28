# DeepSeek Flash - ROADMAP-1 wave-2A fix-diff review (round 2 fixes)

**Date**: 2026-09-28 (UTC)
**Reviewed commit**: `149b19a` (fix range `5ce5219..149b19a`, branch `kernel-batch-1`)
**Working tree**: dirty (reviewer artifacts only: this file and `.ai/worklog/deepseek-b0bee51da3d8e0d2.md`; no candidate file uncommitted). Current HEAD `9512e40` differs from `149b19a` by the launch document alone (`git diff --stat 149b19a..HEAD` = 52 insertions in `LAUNCH-2A-FIX-REVIEW.md`), so the code tree is the reviewed one.
**Reviewer**: DeepSeek Flash (`deepseek/deepseek-flash`), provider `deepseek` (from this session's own model identity)
**Effort / usage / cost**: not exposed by this client (the `step_finish` event stream was searched; no entry attributable to this session was found). Recorded honestly, not estimated.
**Scope**: audit (round-2 fix commits `6364322`, `b26b177`, `149b19a`; closure of Sol findings B/E and MiMo F-2A-03)
**scope-check**: PASS
**Verdict**: PASS
**Mode**: ADVISORY (a fix review, not certification; authorizes no completion and no fix)
**Receipt-Owner**: `deepseek-b0bee51da3d8e0d2`

---

## Executive Summary

Both reproduced round-1 blockers are genuinely fixed on the code tree. W5 hermeticity now binds journal imports to a test-controlled root: the journal never reached the tracked tree across 425 in-run `git status` samples, nor after a killed run, and the prepended failing test (`W5 (F-2A-03)`) is absent from the pre-fix tree. The S-7 scenario bound is four: the rebuilt external instrumented probe prints `PROBE_MAX_ONE=4` with every scenario PASS, and the diff routes both `own` watchdog scenarios through the same bounded pool. No mandatory defect was found. Four INFO/LOW observations follow; all are documentation, integration or coverage notes, none blocks. Closure of the round marker still requires the repeat independent certification and the in-branch round-1 reports.

---

## Scope and Evidence

- **Baseline**: fix range `5ce5219..149b19a`; reviewed SHA `149b19a`.
- **Environment**: Windows 10.0.26200, Node v22.21.0, PowerShell 5.1.
- **Note on the launch's cited evidence**: `docs/reviews/2026-09-28-sol-wave2a-certification.md` and `docs/reviews/2026-09-28-mimo-wave2a-certification.md` do **not** exist in this worktree or on `kernel-batch-1`. They live on branches `cert-2a-sol` (`d23d826`) and `cert-2a-mimo` (`2440fcc`). I read them from those objects (`git show <sha>:<path>`) for the B/E and RECOMMENDATION baselines.
- **Commands executed (all run in `D:\Colabs\.ai\runtime\kb1`)**:
  - `git diff 5ce5219..149b19a`; `git show 6364322`/`b26b177`/`149b19a` (full per-file diffs).
  - `node --test tests/dispatch.test.cjs` under a 250 ms `git status --porcelain` sampler: **29/29 pass, 0 fail, exit 0**; 425 samples all contained only the reviewer's own untracked journal.
  - Killed-suite probe: suite started, `taskkill /T /F` at 25 s; `git status --porcelain` immediately after and 5 s later showed no `gemini-0123456789abcdef` path.
  - `node --test --test-name-pattern="W5|Guard" tests/dispatch.test.cjs`: 2/2 pass, exit 0.
  - `node docs/research/2026-09-25-improvement-research/prompts/launch-test.cjs --pure`: **55 PASS / 0 FAIL, exit 0**.
  - Rebuilt Sol item-E probe (spawn wrapper counting simultaneous `--one` children) over the full scenario suite: `PROBE_MAX_ONE=4`, `PASS S-7: at most 4 simultaneous --one children`, every scenario line PASS.
  - Standalone `importResults` probe with a temp git workdir: env UNSET -> journal lands in `repoRoot`; env SET -> lands in the override, not `repoRoot`.
  - `powershell -ExecutionPolicy Bypass -File .\validate-protocol.ps1`: exit 0, 1 WARN (journal count; pre-existing F-2A-06).
  - Encoding probe of the four changed files: no BOM, LF only, zero non-ASCII bytes. No `.ps1` file is touched by the range.
  - `git reflog` (fix range linear, no reset/force/rebase/amend); `git show --stat` per commit (explicit paths).
  - Pre-fix absence check: `git show 5ce5219:tests/dispatch.test.cjs` contains no `JOURNAL_IMPORT_ROOT`, no `W5 (F-2A-03)` test and no `TEST_JOURNAL`.

---

## Per-item verdicts

### 1. W5 test hermeticity - PASS

- **New test is genuine and asserts the binding.** `W5 (F-2A-03): the imported journal is bound to the test temp root, never the tracked tree` exists only from commit `6364322`; the pre-fix blob has none of its symbols. It runs a real dispatch with `PROTOCOL_JOURNAL_IMPORT_ROOT=journalRoot`, asserts the journal exists under the temp root, asserts it does not exist under `repoRoot`, and asserts `git status` is free of the journal.
- **Tracked tree stays clean during a run.** 425 in-run samples and the post-run status contained only the reviewer's journal. The killed run at 25 s left no `gemini-0123456789abcdef` path.
- **The override is test-only in effect.** `journalImportRoot(repoRoot)` returns `repoRoot` when `PROTOCOL_JOURNAL_IMPORT_ROOT` is unset (probe-confirmed), and the only journal-import writer is `importResults` (`.ai/bin/protocol-dispatch.cjs:320-352`); both journal destinations go through `jRoot`. No second writer exists in the dispatcher.
- **Residual (LOW, theoretical).** The declared-outputs loop at `.ai/bin/protocol-dispatch.cjs:330-338` still copies declared outputs to `repoRoot` unconditionally. A dispatch that declares a path matching `JOURNAL_RE` as an output would bypass the override. No test or config does this; the fix's scope (journals discovered as untracked entries) is correct.

### 2. S-7 scenario bound of four - PASS

- **Probe.** The rebuilt Sol item-E one-liner prints `PROBE_ACTIVE_ONE=1..4` then `PROBE_MAX_ONE=4`, and the harness's own added assertion prints `PASS S-7: at most 4 simultaneous --one children (PROBE_MAX_ONE=4)`. All scenario lines PASS.
- **Both `own` scenarios go through the pool.** `scenarios()` now builds `queue = [...own, ...ids]`, and `runOne` routes `SC[id].own` to `deadWatchdog` and the rest to `runScenario`; both call `spawnOne`, the only `--one` spawner (the sole other `spawn` at line 425 is `--lock`). The pre-fix `deadWatchdog(id, report)` outside the pool is gone.
- **Slot released exactly once.** `active` is incremented only at line 503 and decremented only inside the single callback passed as `onSlotFree`/`onExit`; `spawnOne`'s `release` is guarded by a `released` flag and bound to both `exit` and `error`. Because `oneActive` (probe) and `active` (pool) both change at spawn and at child exit, the probe's maximum and the pool bound cannot diverge — consistent with the measured 4.
- **Semantics preserved.** `--pure` 55 PASS, `--one zz-t1` previously exit 0, and the full scenario suite PASS with unchanged outputs (copy-back, canary, audit, index-lock assertions all PASS).

### 3. Hygiene - PASS (with notes)

- One commit per fix: `6364322` (W5: dispatcher + test) and `b26b177` (S-7: launcher only); the journal is a separate `149b19a`. Explicit paths, no stray files.
- Reflog for the range is linear; no `reset`, no `--amend`, no force, no rebase. Range not pushed.
- No `.ps1` changed; changed files are UTF-8 without BOM and LF.
- Journal spot-check (3 verified): "dispatch tests 29/29" ✓; "`--pure` 55 PASS" ✓; "instrumented full run PASS S-7 PROBE_MAX_ONE=4" ✓.

### 4. Regression risk - PASS

- `launch-test.cjs` is a research/test harness, not production; the pool change cannot affect the dispatcher's runtime semantics.
- The env override is the only production-visible change, and it is inert when unset (verified). Behaviour that could differ outside tests: (a) if an operator sets `PROTOCOL_JOURNAL_IMPORT_ROOT`, dispatched journals are written outside the checkout (or to a chosen directory) instead of `repoRoot/.ai/worklog/` — a deliberate, undocumented new env contract; (b) a relative value resolves against `process.cwd()`, not `repoRoot`. Both are opt-in and match the existing `PROTOCOL_REPO_ROOT` / `PROTOCOL_RUNS_FILE` style.

---

## Closure state

| Item | Source | State |
|---|---|---|
| Sol B (W5 not hermetic while running) | `cert-2a-sol` `d23d826`, item B | **CLOSED** - override + temp-root binding; 425 samples and killed run clean |
| Sol E (S-7 bound is 6, not 4) | `cert-2a-sol` `d23d826`, item E | **CLOSED** - `PROBE_MAX_ONE=4`; own scenarios pooled; slot released once |
| MiMo F-2A-03 (tracked-tree test write) | `cert-2a-mimo` `2440fcc` | **CLOSED** - same fix; MiMo's recommended "route under `.ai/runtime/`" is satisfied via the temp-root override |
| MiMo F-2A-01 / F-2A-05 / F-2A-06 | `cert-2a-mimo` | **OPEN** (out of this fix scope; the launch forbids closing them) |

The round-1 divergence (Sol FAIL vs MiMo RECOMMENDATION) is resolved in the fixes' favour on the two reproduced blockers only; the residual LOW backlog stays.

---

## New findings

| ID | Severity | Requirement | Reproduction | Actual Result | Disposition |
|---|---|---|---|---|---|
| N-1 | INFO | Evidence for a review must be reachable in the reviewed tree | `git ls-files docs/reviews \| findstr 2026-09-28`; `git log --all --oneline -- docs/reviews/2026-09-28-sol-wave2a-certification.md` | The launch cites Sol's and MiMo's reports, but both are only on `cert-2a-sol`/`cert-2a-mimo`; `kernel-batch-1` has neither. A reader of this branch cannot verify the closure baseline. | confirmed; integration note - merge or cite the cert branches before the repeat certification |
| N-2 | LOW | A session journal's claims must match the tree | `git show --stat 6364322 b26b177` vs `.ai/worklog/mistral-e5b0a7370dee2904.md:15-17` | The journal says git was denied and "the tree carries both fixes uncommitted" and asks for four commits; the tree contains the two fixes as two commits (one per fix). The journal was written pre-commit, so this is historical state drift, not a missing commit. | confirmed; no action required beyond noting the divergence |
| N-3 | LOW | New production-honoured env contracts should be documented | `.ai/bin/protocol-dispatch.cjs:318-323` | `PROTOCOL_JOURNAL_IMPORT_ROOT` is honoured by production code but appears in no spec or decision block, only a code comment. | confirmed; document in the next forward artifact |
| N-4 | INFO | Prior reports should be internally consistent | `launch-test.cjs --pure` at `5bc9940`/`5ce5219` (identical blob) | Sol's report states 53/53; MiMo's states 55/55; measured 55/55. The file is byte-identical at both candidate SHAs, so Sol's count is inconsistent. Does not affect Sol's B/E reproductions. | confirmed; noted only (the report is frozen and must not be edited) |

---

## Alternatives Considered & Trade-offs

- **Verdict FAIL**: rejected. Both reproduced round-1 blockers now reproduce as closed; no invariant, gate or protected path is violated by the fix. The observations are documentation/integration notes.
- **Verdict RECOMMENDATION**: rejected as the overall token - the residual items are not optional improvements to the fix; they are process/doc notes. Per-item verdicts are stated explicitly above.
- **Verdict BLOCKED**: rejected. All required checks were run with shell and filesystem access.

---

## Recommendations & Actionable Plan

1. Bring `docs/reviews/2026-09-28-sol-wave2a-certification.md` and `docs/reviews/2026-09-28-mimo-wave2a-certification.md` into the candidate branch (or record an explicit cross-branch citation) before the repeat certification, so the closure evidence is verifiable in-tree (N-1).
2. Document `PROTOCOL_JOURNAL_IMPORT_ROOT` (test-only override; production default `repoRoot`) in the dispatcher spec when the freeze allows (N-3).
3. Consider routing the fake client's journal under `.ai/runtime/` as well, or extending the override to the declared-outputs loop, to remove the theoretical bypass (item-1 residual). Optional; current tests are hermetic.
4. Proceed with the repeat independent certification (MiMo + Sol, Sol at Medium) on the frozen SHA; this advisory review fills no certifier slot.

---

## References

- Fix range: `5ce5219..149b19a` on `kernel-batch-1`; commits `6364322`, `b26b177`, `149b19a`.
- Launch: `docs/research/2026-09-27-roadmap-queue/LAUNCH-2A-FIX-REVIEW.md`.
- Fix task: `docs/research/2026-09-27-roadmap-queue/LAUNCH-2A-FIX-ROUND2.md`.
- Sol report (branch `cert-2a-sol`): `docs/reviews/2026-09-28-sol-wave2a-certification.md` (`d23d826`).
- MiMo report (branch `cert-2a-mimo`): `docs/reviews/2026-09-28-mimo-wave2a-certification.md` (`2440fcc`).
- Fix journal: `.ai/worklog/mistral-e5b0a7370dee2904.md`.
- Session journal: `.ai/worklog/deepseek-b0bee51da3d8e0d2.md`.
