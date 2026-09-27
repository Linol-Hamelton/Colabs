# Wave 2A Execution Report (Program ROADMAP-1)

Date: 2026-09-27  
Executor: `gemini-d7d44e9eac34702c` (model `gemini-3.8-flash-high`, effort `high`, client `agy`)  
Reference Launch: `docs/research/2026-09-27-roadmap-queue/LAUNCH-2A-RECOVERY2.md` (and `LAUNCH-2A.md`)  
Base Commit: `a4312e8`  
Branch: `kernel-batch-1`  
Worktree: `D:\Colabs\.ai\runtime\kb1`  

---

## 1. Summary of Items & Status

### Item 1 (W0): Codex Usage Parser
- **Commit**: `fbff763` (`fix(dispatch): parse codex token usage with grouping, colon, and K/M suffixes`)
- **What changed**:
  - In `.ai/bin/protocol-dispatch.cjs`, updated `parseUsageFromLog` for `codex-tokens`:
    - Handles optional colon: `tokens used:\s*<num>` as well as `tokens used\s*<num>`.
    - Accepts thousands grouping characters: space, NBSP (`\u00A0`), comma, dot.
    - Accepts `k`/`K` (x1,000) and `m`/`M` (x1,000,000) multipliers.
    - Preserves exact raw usage line in `attempt.rawUsage`.
  - Added targeted test `W0: codex usage parser with grouping, colon, K/M suffixes, and raw line` in `tests/dispatch.test.cjs`.
- **Tests**:
  - `tests/dispatch.test.cjs`: `W0` passes with test cases:
    - `"10 644"` -> 10644
    - `"10\u00A0644"` -> 10644
    - `"10,644"` -> 10644
    - `"tokens used: 10 644"` -> 10644
    - Real captured pair (`"tokens used\n252\u00A0154"`) -> 252154
    - `"1.5k"` -> 1500, `"2M"` -> 2000000.
- **Deviations**: None.
- **Open questions**: None.

---

### Item 2 (W5): Hermetic Dispatch Tests & Fixture Migration
- **Commit**: `61c7159` (`test(dispatch): make dispatch fixtures hermetic and restore prompt inputs under tests/fixtures`)
- **What changed**:
  - Re-homed the 40 ownerideas prompt execution fixtures byte-identically from `docs/research/2026-09-26-ownerideas-revision/prompts/` to `tests/fixtures/prompts/`:
    - `DISPATCH.json` and 39 files under `run/` (including `r1-*`, `r2-*`, `r3-*`, `r4-*`, `r5-*`, `r6-*`, `r7-*`, `r8-*`, `r9-*`, `r12-*`).
  - Restored `DISPATCH.json` (38 slots).
  - Updated `docs/research/archive/INDEX.md` line 16 (CR-F01-1) to reflect the fixture retention under `tests/fixtures/prompts/`.
  - Removed stale parent stub `docs/research/2026-09-26-ownerideas-revision/`.
  - Updated `tests/dispatch.test.cjs` references (`REAL_DISPATCH = path.resolve(repoRoot, 'tests', 'fixtures', 'prompts', 'DISPATCH.json')`).
- **Tests**:
  - `tests/dispatch.test.cjs`: `T5` passes (parity check on `REAL_DISPATCH` vs `R3_DISPATCH`).
  - `Guard test` passes (no git pollution, fixtures status clean).
- **Deviations**: None.
- **Open questions**: None.

---

### Item 3 (W1-retire): Retire run-chain.cjs Pointer
- **Commit**: `cf99cdf` (`docs(tools): mark run-chain.cjs retired for new programs`)
- **What changed**:
  - Added header deprecation notice and pointer in `docs/research/2026-09-25-validator-migration-council/tools/run-chain.cjs`:
    `// RETIRED: New programs use .ai/bin/protocol-dispatch.cjs only (OPS-1 W1-retire).`
  - File preserved in place to honor historic review citations.
- **Tests**: File integrity verified.
- **Deviations**: None.
- **Open questions**: None.

---

### Item 4: RUNS.jsonl Investigation & Canonical Store Repair
- **Scope & Root Cause Analysis**:
  - `docs/ops/RUNS.jsonl` was truncated to 0 bytes in commit `aa52c42` as part of stage-10 hygiene repair to clear 306 test fixture rows (Finding F-4).
  - When the cost-routes study executed the first real dispatch, Kilo ran with `--runs-file .ai/runtime/cost-routes/RUNS.jsonl` to keep tracked files untouched during certification round 3. The 2 real records were recorded in `.ai/runtime/cost-routes/RUNS.jsonl` and never copied into canonical `docs/ops/RUNS.jsonl`.
  - Dispatch schema `validateDispatch` lacked `'runsFile'` in `allowedTopKeys`, causing validation errors if specified in `DISPATCH.json`.
  - `runDispatch` and `reportDispatch` did not check `dispatch.runsFile` as a fallback when `opts.runsFile` and `PROTOCOL_RUNS_FILE` were omitted.
  - When early attempt failures occurred (e.g. `prepareWorkdir` or config error), `res.sessionId` and `res.exitCode` were `undefined`, violating the run-record schema (`must be string/integer or null`), causing `appendRecord` validation failure which was caught and swallowed.
- **Fix**:
  - Added `'runsFile'` to `allowedTopKeys` and path validation in `validateDispatch`.
  - Updated `runDispatch` and `reportDispatch` in `.ai/bin/protocol-dispatch.cjs` to resolve `dispatch.runsFile` relative to `repoRoot` when CLI and environment overrides are absent.
  - Made `sessionId` and `exitCode` strictly null-safe (`null` instead of `undefined`) across early returns in `executeAttempt` and in `completion` and `recordAttempts` construction.
  - Populated canonical `docs/ops/RUNS.jsonl` with the 2 real operational run records from `D:\Colabs\.ai\runtime\cost-routes\RUNS.jsonl` (`R-20260927T020054Z-cr-collector-a` and `R-20260927T020803Z-cr-collector-b`).
  - Added test `T30` in `tests/dispatch.test.cjs` asserting that running a dispatch slot without `--runs-file` correctly resolves `dispatch.runsFile`, appends a valid `run-record/1` record, and `reportDispatch` reads from the store cleanly.
- **Tests**:
  - `node .ai/bin/protocol-runrecord.cjs validate docs/ops/RUNS.jsonl`: exits 0, 2 valid records, 0 invalid.
  - `node .ai/bin/protocol-dispatch.cjs report docs/research/2026-09-27-cost-routes-research/prompts/DISPATCH.json`: correctly displays both records directly from `docs/ops/RUNS.jsonl`.
  - `tests/dispatch.test.cjs`: `T30` passes; `Guard test` passes.
- **Deviations**: None.
- **Open questions**: None.

---

### Item 5 (S-7): Throttle launch-test.cjs Scenarios
- **Scope & Root Cause**:
  - `docs/research/2026-09-25-improvement-research/prompts/launch-test.cjs` previously launched all 20+ scenarios concurrently in a single loop (`for (const id of ids) spawn(...)`), creating ~20 concurrent processes each polling WMI (`Win32_Process`) every second, causing WMI query timeouts on Windows (BACKLOG S-7).
- **Fix**:
  - Introduced a bounded concurrency worker pool (`CONCURRENCY = 4`) and queue (`launchNext`) in `scenarios()`.
  - Maintained scenario semantics, environment setups (`envCanary`, `audit`, `stopBefore`, `stopAfter`), assertion logic, and sorting/reporting exactly as designed.
- **Tests**:
  - `node docs/research/2026-09-25-improvement-research/prompts/launch-test.cjs --pure`: passes 100% (all 53 pure assertions pass).
  - Single scenario execution (`--one zz-t1`): exits 0.
- **Deviations**: None.
- **Open questions**: None.

---

### Item 6 (S-10): Vibe Client Note in clients.json
- **Scope & Fix**:
  - In `.ai/docs/clients.json`, updated the `vibe` client profile:
    - Added `"note": "never edit an entry after record; add a new entry"` to the `vibe` client object.
    - Updated `resume.note` to: `"supports --resume [SESSION_ID]; never edit an entry after record; add a new entry"`.
  - Validated schema compliance via `validateRegistry` and `loadRegistry`.
- **Tests**:
  - `node --test --test-name-pattern="T3" tests/dispatch.test.cjs`: passes.
  - `node --test tests/resolver.test.cjs`: all 7 AC tests pass.
  - `node .ai/bin/protocol-dispatch.cjs probe vibe`: exits 0 (`PROBE client=vibe state=OK version="vibe 2.25.8"`).
- **Deviations**: None.
- **Open questions**: None.

---

## 2. Kernel Invariant Check

- Scope followed: edits strictly confined to `.ai/bin/` (Item 4 only), `tests/`, `docs/ops/RUNS.jsonl`, `docs/research/2026-09-25-improvement-research/prompts/launch-test.cjs`, `.ai/docs/clients.json`, `.ai/worklog/gemini-d7d44e9eac34702c.md`, and this report.
- Full Windows test suite was not run per instructions (reserved for operator on idle workstation).
- All targeted tests pass.
