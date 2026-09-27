Mode: CERTIFYING
Reviewed CANDIDATE: 7f199c50589ce3b5b34680e70be21e9a43aeeac1
Actual HEAD: 69449589eeb3f31d4acaea20872a309c22e9caa7
HEAD normative diff: `git diff --stat 7f199c5 HEAD -- .ai/bin tests docs/specs .ai/docs .ai/SIGNALS.md docs/ops protocol-manifest.json` is empty (HEAD later advanced to 9cda8dd with a non-normative journal commit; normative diff remained empty).
Receipt-Owner: kimi-77834798f3f06db8
Reviewer: moonshot-ai/kimi-k2.7-code-highspeed, route kimi, effort high, 2026-09-27
Scope: PKG-2 in full (residuals F-PKG2-R2-1..R2-4); PKG-1 S8; PKG-3 S8 (incl. report reason); PROTO-DEC-0075 item 9; PKG-5 keeps round-1 verdict, not re-opened.
Verdict: PASS

| Package | Verdict | Basis |
|---|---|---|
| PKG-2 | PASS | Residuals R2-1..R2-4 verified resolved; AC-1..AC-10 pass |
| PKG-1 | PASS | S8 usage/cost recording verified; dispatch tests pass |
| PKG-3 | PASS | S8 run records, completion contract, resolver AC-1..AC-15 pass |
| PKG-5 | not re-opened | Round-1 PASS retained; signals/dispatch fall tests pass |

## PKG-2 residuals (round 2 -> round 3)

**F-PKG2-R2-1 (AC-7, S4) — render headers.**
- Reproduction:
  ```
  node -e "const{renderUsage,readRecords}=require('./.ai/bin/protocol-runrecord.cjs');console.log(renderUsage(readRecords('tests/fixtures/runrecord/golden.jsonl')).split('\n')[0])"
  | Run | Slot | Selection | Client | Model ran | Effort used | Fresh/Resume | Wall min | Tokens in/out | Cost | State |
  ```
- CANDIDATE `.ai/bin/protocol-runrecord.cjs:926` uses `['Run', 'Slot', 'Selection', 'Client', 'Model ran', 'Effort used', ...]`. PASS.

**F-PKG2-R2-2 (AC-7/AC-9, S5) — `validate` emits `VALID line=` rows.**
- Reproduction:
  ```
  node .ai/bin/protocol-runrecord.cjs validate tests/fixtures/runrecord/golden.jsonl
  VALID line=1 runId=R-20260926T123940Z-r6-claude-final
  VALID line=2 runId=R-20260926T123940Z-r6-claude-final
  SUMMARY records=2 invalid=0
  exit=0
  ```
- CANDIDATE `case 'validate'` at `protocol-runrecord.cjs:1013` prints one `VALID line=<n> runId=<id>` per valid record. PASS.

**F-PKG2-R2-3 (AC-7) — golden Markdown equality.**
- Reproduction: `node --test tests/runrecord.test.cjs` T13 asserts `assert.strictEqual(rendered, goldenMd)` against committed `tests/fixtures/runrecord/golden.md`. PASS.
- Fixture content (5 lines, LF, no BOM) matches the rendered table exactly.

**F-PKG2-R2-4 (AC-9) — CLI stdout pattern check.**
- Reproduction: `node --test tests/runrecord.test.cjs` includes `testCliPattern_AllCommands` covering no-command, unknown command, validate/append/render/sessions; every non-empty stdout line matches `/^[A-Z][A-Z_]*( |$)/` and exits follow S5.
- `printUsage()` at `protocol-runrecord.cjs:998-999` emits a single conforming `USAGE command=[validate|append|render|sessions] syntax="..."` row. PASS.

## PKG-1 S8 / PKG-3 S8 / PROTO-DEC-0075 item 9

**PKG-1 S8 — state, usage and status.**
- `parseUsageFromLog` at `.ai/bin/protocol-dispatch.cjs:1107` parses `kilo-json`/`copilot-credits`/`codex-tokens` from attempt logs; negative patterns `"line 503"` and `"429 tokens"` are not matched.
- Cost is computed per slot (`actualCost`) and cumulative across the dispatch (`dispatchRunningSum`), null on mixed units (`dispatchMixedUnits`). `estimated` is hard-coded `null`.
- `reportDispatch` at `protocol-dispatch.cjs:2185` prints distinct reasons: `usage=none (client usage=none in clients.json)` and `usage=none (parser <key> found no usage in log)`.
- Verified by `node --test tests/dispatch.test.cjs` T27-T29 (26/26 pass).

**PKG-3 S8 — completion contract and run record.**
- Every settled step appends a run record to `docs/ops/RUNS.jsonl` via PKG-2 `appendRecord`.
- DONE requires process ended, outputs present/non-empty, structural check, validator, Evidence line, supervisor done (T20-T26).
- Launch pinning mismatch gives `BLOCKED pin-changed` (T23); `--revise` starts a new `runId` (T23).
- STALL: three wakes, then `fallen = true` (T21); INVALID_OUTPUT repair resume points at repair file (T22); PROCESS_CRASH resume (T25); PKG-5 fall signal (T26).
- Resolver AC-15 real-ladder cross-check matches package expected output:
  - `floor-t7-kernel`: primary `vibe:mistral-medium-3.5` rung 9, one substitute `agy:gemini-3.8-flash-high` rung 5, `ASK_OWNER reason=shortfall`, exit 1.
  - `floor-t3-other`: primary `vibe:mistral-medium-3.5` rung 9, substitutes `agy:gemini-3.7-flash-high` rung 7 and `codex:gpt-5.6-luna` rung 6, exit 0.

**PROTO-DEC-0075 item 9 — cost recorded from log, never estimated.**
- `cost: { estimated: null, actual: actualCost, cumulative: cumulativeCost, unit: costUnit }` at `protocol-dispatch.cjs:2094`.
- `actual` is the sum of attempt usage amounts only when all numeric attempts share one unit; otherwise `actual=null, unit=null`.
- `cumulative` is the running sum within the dispatch under the same single-unit rule.
- No estimate is produced or recorded.

## PKG-5 (round-1 verdict retained, not re-opened)

- PKG-5 was certified PASS in round 1. No new repair touched PKG-5 paths in round 3.
- T26 in `tests/dispatch.test.cjs` confirms the dispatcher fall signal path still works.
- `node .ai/bin/protocol-signals.cjs check` and `count` pass on the CANDIDATE ledger.

## Evidence

All commands run in a dedicated worktree at CANDIDATE `7f199c5`; no `git checkout` in the shared copy.

| Command | Exit | Notes |
|---|---|---|
| `node --test tests/runrecord.test.cjs` | 0 | 1 test, T1-T14 + CLI pattern PASS |
| `node --test tests/dispatch.test.cjs` | 0 | 26/26 pass, incl. T27-T29 usage/cost/report |
| `node --test tests/resolver.test.cjs` | 0 | 7/7 pass, incl. AC-15 real-ladder |
| `node --test tests/signals.test.cjs` | 0 | 9/9 pass |
| `node .ai/bin/protocol-runrecord.cjs validate tests/fixtures/runrecord/golden.jsonl` | 0 | two VALID rows, SUMMARY records=2 invalid=0 |
| `node .ai/bin/protocol-runrecord.cjs sessions` | 0 | live metrics empty: SUMMARY rows=0 sessions=0 ratio=NaN |
| `node .ai/bin/protocol-dispatch.cjs check docs/research/2026-09-26-ownerideas-revision/prompts/DISPATCH.json` | 0 | CHECK dispatch=... slots=36 |
| `node .ai/bin/protocol-dispatch.cjs check tests/fixtures/dispatch/R3-DISPATCH.json` | 1 | exactly 10 `launch-missing` rows |
| `node .ai/bin/protocol-dispatch.cjs resolve tests/fixtures/resolver/real-ladder.json floor-t7-kernel` | 1 | ASK_OWNER shortfall |
| `node .ai/bin/protocol-dispatch.cjs resolve tests/fixtures/resolver/real-ladder.json floor-t3-other` | 0 | two substitutes |
| `node .ai/bin/protocol-signals.cjs check` | 0 | SUMMARY lines=97 signals=95 invalid=0 |
| `node .ai/bin/protocol-signals.cjs count` | 0 | counts agree with ledger |
| `powershell -ExecutionPolicy Bypass -File .\validate-protocol.ps1` | 0 | Protocol OK, 1 warning (142 journals > cap) |
| `powershell -ExecutionPolicy Bypass -File .\test-protocol.ps1` | 0 | 419/419 pass |

No STOP condition missed. No second source of truth introduced. Allowed-path checks match each package. No commits, tags, pushes or branches by this certifier.
