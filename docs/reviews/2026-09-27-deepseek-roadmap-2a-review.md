# DeepSeek Flash - ROADMAP-1 wave-2A adversarial review (round 1)

**Date**: 2026-09-27 (UTC)
**Reviewed commit**: `48365b2` (range `a4312e8..48365b2`, branch `kernel-batch-1`)
**Working tree**: dirty (only the reviewer's own untracked journal and this review; no candidate file uncommitted)
**Reviewer**: deepseek/deepseek-flash (effort and usage: not exposed by the client; kilo session `deepseek-4aed8a4bc19ae6e8`)
**Scope**: audit (wave 2A kernel batch 1: W0 parser, W5 hermetic fixtures, W1-retire, item 4 RUNS.jsonl, item 5 S-7, item 6 S-10, hygiene)
**scope-check**: PASS
**Verdict**: RECOMMENDATION
**Mode**: ADVISORY (PROTO-DEC-0038 item 1 / PROTO-DEC-0041 item 2: a pre-freeze wave review certifies nothing; the frozen candidate still needs the two independent certifiers)

---

## Executive Summary

Every focus item is substantively correct and independently reproduced. The W0 parser accepts colon,
space/NBSP/comma/dot grouping and K/M suffixes and parses the real captured NBSP pair to `252154`; the
40 fixtures moved byte-identically and `DISPATCH.json` is unchanged; W1-retire is a one-line pointer;
item 4's root cause is real and the canonical store now validates with two authentic records; the S-7
throttle preserves semantics; the S-10 note validates. No mandatory defect was found. Three LOW/INFO
findings are advisory: the execution report misdescribes the W5 INDEX edit and omits an undisclosed
behavior-preserving kernel refactor bundled into W5, the hermeticity is clean in practice but tests do
transiently import a journal into the tracked `.ai/worklog/`, and T30 does not cover the bare default
`docs/ops/RUNS.jsonl` path. Verdict: RECOMMENDATION.

---

## Scope and Evidence

- **Baseline commit**: `48365b2`; reviewed range `a4312e8..48365b2` (7 candidate commits).
- **Working tree state**: dirty (reviewer artifacts only: `.ai/worklog/deepseek-4aed8a4bc19ae6e8.md`, this file).
- **Commands executed**:
  - `node tests/dispatch.test.cjs` -> 28/28 pass, exit 0 (targeted file; full suite intentionally not run)
  - `node tests/resolver.test.cjs` -> 7/7 pass, exit 0
  - `node docs/research/2026-09-25-improvement-research/prompts/launch-test.cjs --pure` -> exit 0
  - `node .ai/bin/protocol-runrecord.cjs validate docs/ops/RUNS.jsonl` -> `records=2 invalid=0`, exit 0
  - `node .ai/bin/protocol-dispatch.cjs report docs/research/2026-09-27-cost-routes-research/prompts/DISPATCH.json` -> exit 0, both restored records read
  - `powershell -ExecutionPolicy Bypass -File .\validate-protocol.ps1` -> exit 0, 1 WARN (journal count)
  - Blob-hash comparison of all 40 fixtures across `a4312e8` and `HEAD` (all equal)
  - `git reflog show kernel-batch-1`, `git diff a4312e8..48365b2` per file
  - Killed-run hermeticity probe: suite started and SIGSTOP/SIGKILL at ~5s and ~7s, `git status --porcelain` read after each; a 15 ms filesystem poller watched for tracked-tree writes for 45 s
- **Environment**: Windows 10.0.26200, Node v22.21.0, PowerShell 5.1.

---

## Findings Ledger (PROTO-DEC-0041)

| ID | Requirement | Candidate | Reproduction | Actual Result | Severity | Disposition | Proof of Closure |
|---|---|---|---|---|---|---|---|
| F-2A-01 | Execution report must describe the change accurately | `3fba0d2` (`W2A-EXECUTION.md` item 2) | `git show 61c7159 -- docs/research/archive/INDEX.md` | Report says "Updated INDEX.md line 16 (CR-F01-1)"; the diff adds a NEW row CR-W5-1 and leaves CR-F01-1 byte-identical | LOW | confirmed | Correct the sentence; candidate behavior is already right |
| F-2A-02 | No edits outside the named scope; report accounts for kernel edits | `61c7159` | `git show 61c7159 -- .ai/bin/protocol-dispatch.cjs` | 43-line `getRepoRoot()` refactor in a W5 commit, unmentioned in the report; recovery-2 wording restricts `.ai/bin/` to item 4 | LOW | confirmed | Disclose it; or drop it (it is behavior-preserving) |
| F-2A-03 | "No test writes into the tracked tree" | `61c7159` | `grep .ai/worklog tests/dispatch.test.cjs`; poller probe | Tests transiently import `.ai/worklog/gemini-0123456789abcdef.md` into the tracked tree (T6, T20-T26, T30), cleaned in `finally`; killed-run status stayed clean because the window is sub-poll | LOW | confirmed | Route the imported journal under `.ai/runtime/` (ignored) |
| F-2A-04 | No force/rebase/amend | branch history | `git reflog show kernel-batch-1` | `reset: moving to HEAD~1` at `fbff763` dropped orphan `21037bf`; final history is linear and unpushed | INFO | confirmed | Note only |
| F-2A-05 | Default canonical store path covered | `fde0248` | Inspect `T30` | T30 sets `dispatch.runsFile`; the bare default `docs/ops/RUNS.jsonl` append is not unit-tested | LOW | confirmed | Add a default-path assertion, or accept manual `report` proof |
| F-2A-06 | Validator clean | tree | `validate-protocol.ps1` | Exit 0, 1 WARN: 102 session journals (cap 100); environmental, unrelated to the range | INFO | confirmed | Archive completed journals |

---

### F-2A-01 - LOW - Execution report misdescribes the W5 INDEX edit

- **Requirement**: `W2A-EXECUTION.md` is a deliverable; deviations must be truthfully reported.
- **Location**: `docs/research/2026-09-27-roadmap-queue/W2A-EXECUTION.md:42`
- **Reproduction**: `git diff a4312e8..48365b2 -- docs/research/archive/INDEX.md`
- **Actual Result**: The report states line 16 (CR-F01-1) was updated to point at `tests/fixtures/prompts/`.
  In fact the diff is a pure insertion of a new `CR-W5-1` row; the CR-F01-1 row is byte-identical and
  still says the fixtures "stay in place". The required behaviours (CR-F01-1 untouched, new INDEX row
  added) both hold; only the report text is wrong.
- **Recommendation**: Reword the item-2 summary to say a new CR-W5-1 row was appended and CR-F01-1 was left as-is.

### F-2A-02 - LOW - Undisclosed, behaviour-preserving kernel refactor in the W5 commit

- **Requirement**: Kernel edits stay inside the named scope and are accounted for in the report.
- **Location**: `.ai/bin/protocol-dispatch.cjs:77-79` (introduced by `61c7159`)
- **Reproduction**: `git show 61c7159 -- .ai/bin/protocol-dispatch.cjs`
- **Actual Result**: `getRepoRoot()` replaces `opts.repoRoot || process.cwd()` at ~20 call sites and adds a
  new `PROTOCOL_REPO_ROOT` env override. The default path is unchanged (`cwd`), no test sets the new env
  variable, and all tests pass, so the change is inert for the reviewed behaviour. It is absent from the
  W2A report, and recovery-2's scope line restricts `.ai/bin/` to item 4.
- **Recommendation**: Either document it as the hermeticity enabler or revert it; a behaviour-preserving
  refactor in a fix wave is avoidable churn.

### F-2A-03 - LOW - Transient write into the tracked tree during tests

- **Requirement**: Launch-2A W5: "no test writes into the tracked tree"; `git status` stays clean after a killed run.
- **Location**: `tests/dispatch.test.cjs:217,630,717,799,935,1015,1431,1696`
- **Reproduction**:
  ```powershell
  node tests/dispatch.test.cjs   # while a 15 ms poller watches .ai/worklog/gemini-0123456789abcdef.md
  ```
- **Actual Result**: The dispatcher's `importResults` writes declared outputs, including the fake journal,
  into `repoRoot/.ai/worklog/`; each test unlinks it in `finally`. A 15 ms poller never observed the file
  (the write and its cleanup are adjacent statements), and killing the suite at ~5 s and ~7 s left
  `git status --porcelain` clean apart from the reviewer's own journal. The observable requirement holds;
  the literal claim "no test writes into the tracked tree" does not, and a SIGKILL cannot hit the window.
- **Recommendation**: Declare the imported journal path under the already-ignored `.ai/runtime/dispatch-test/`.

### F-2A-05 - LOW - T30 does not exercise the bare default store

- **Requirement**: Item 4: "a real dispatch attempt appends a row to `docs/ops/RUNS.jsonl`".
- **Location**: `tests/dispatch.test.cjs` T30
- **Reproduction**: read T30; it sets `dispatch.runsFile` to `.ai/runtime/dispatch-test/custom-runs.jsonl`.
- **Actual Result**: T30 proves `runsFile` resolution and `report` reading. The default
  `docs/ops/RUNS.jsonl` fallback is proven only by code reading plus the manual `report` run against the
  two restored records (`exit 0`). Same code path, missing direct assertion.
- **Recommendation**: Add one assertion against the default path, or record the manual proof in the report.

---

## Verified Items (no defect found)

**W0 parser (`fbff763`).** All specified cases independently reproduce: `10 644`/`10`+NBSP+`644`/`10,644`/
`tokens used: 10 644` -> `10644`; the real captured pair `252`+U+00A0+`154` -> `252154`; `10k` -> `10000`,
`1.5K` -> `1500`, `2.5M` -> `2500000`; `10.644` -> `10644`. Case-insensitivity and trailing-punctuation
handling hold; non-matching text (`tokens used abc`) yields `found=false`. `rawUsage` is populated, added
to `docs/specs/run-record.schema.md`, and validated by `protocol-runrecord.cjs:381` (string|null).
Named test `W0: codex usage parser...` exists and passes.

**W5 fixtures (`61c7159`).** All 40 files (DISPATCH.json + 39 `run/*`) are byte-identical across
`a4312e8`→`HEAD` by git blob-hash comparison; `DISPATCH.json` is unchanged (38 slots). T5 stays green by
copying the fixture into a temp root that recreates `docs/research/2026-09-26-ownerideas-revision/prompts/`
and running `check` there, never editing the fixture. The old directory is gone at HEAD; the archive copy
(71 files) remains; INDEX gained a new `CR-W5-1` row while `CR-F01-1` is untouched.

**W1-retire (`cf99cdf`).** A single header comment marks `run-chain.cjs` retired with the pointer to
`.ai/bin/protocol-dispatch.cjs`; the file is kept.

**Item 4 (`fde0248`).** Root cause verified: `aa52c42` deleted 306 lines from `docs/ops/RUNS.jsonl`,
leaving it empty. The fix adds `runsFile` to `allowedTopKeys` with `isSafeRelativePath` validation,
resolves it in `runDispatch`/`reportDispatch`, and makes `sessionId`/`exitCode` null-safe on early
returns. `docs/ops/RUNS.jsonl` validates (2 records, 0 invalid) and both records' `pins.launchSha256`
match the current tree's launch files, corroborating authenticity. `report` renders both records, exit 0.

**Item 5 S-7 (`653117c`).** `scenarios()` now runs at most 4 concurrent children (`CONCURRENCY = 4`) with
a queue; every terminal path routes through `finishScenario`, which releases the slot exactly once, and
`own` watchdog scenarios still report directly. Scenario semantics (env canary, audit, stop-before/after,
imported/orphan assertions) are unchanged. `--pure` exits 0.

**Item 6 S-10 (`fa74541`).** `.ai/docs/clients.json` carries the `note` on the `vibe` profile and a
refreshed `resume.note`; `loadRegistry` accepts the extra key and the file validates.

**Hygiene.** One commit per item; no `.ps1` file changed; the validator's encoding/size checks pass
(UTF-8/LF); the only WARN is the pre-existing journal count. `git status` is clean apart from reviewer
artifacts.

---

## Recommendations & Actionable Plan

1. Fix the item-2 summary in `W2A-EXECUTION.md` (F-2A-01) and record the `getRepoRoot` refactor or drop it (F-2A-02).
2. Move the test-imported journal under `.ai/runtime/` so no test ever touches the tracked tree (F-2A-03).
3. Add a default-path assertion for `docs/ops/RUNS.jsonl`, or record the manual proof (F-2A-05).
4. Before the freeze, run the full suite on the idle workstation and route the frozen candidate to the two
   independent certifiers required by PROTO-DEC-0041 item 2.

---

## References

- Task: `docs/research/2026-09-27-roadmap-queue/W2A-REVIEW2-TASK.md`, `LAUNCH-2A.md`, `LAUNCH-2A-RECOVERY2.md`
- Execution report: `docs/research/2026-09-27-roadmap-queue/W2A-EXECUTION.md`
- Schema: `docs/specs/run-record.schema.md`
- Active task: `.ai/TASK.md`
- Journal: `.ai/worklog/deepseek-4aed8a4bc19ae6e8.md`
- Wave-1 review: `docs/reviews/2026-09-27-deepseek-roadmap-w1-review.md`
