# Stage 10 Repair Report: Usage and Cost Accounting (r9f)

Mode: ADVISORY
Baseline: 09a51bf; working tree status: dirty
Reviewer: Gemini 3.8 Flash, route agy, effort high, 2026-09-27
Scope: task:ownerideas-r9f-repair-usage - port usageOf, record attempt usage/tokens, record actual/cumulative cost, and report distinct missing reasons
Verdict: REPAIR COMPLETE

## Scope Items

| Item | Scope Description | Reproduction Before | Change Implemented | Reproduction After |
|---|---|---|---|---|
| **a** | Parse each attempt's usage from attempt log dispatched by `clientCfg.usage` (`kilo-json`, `copilot-credits`, `codex-tokens`, none/nothing found). | `.ai/bin/protocol-dispatch.cjs:1785` hardcoded `tokens: { in: null, out: null, source: 'none' }` and `usage: { amount: null, unit: null }`. `clientCfg.usage` was ignored. | Implemented `parseUsageFromLog(logPath, usageParser)` in `.ai/bin/protocol-dispatch.cjs`. Parses `kilo-json` (`part.cost` sum to USD, `part.tokens` to `in`/`out` with `source: 'client-output'`); `copilot-credits` (`AI Credits <num>` sum to `credits`, tokens null); `codex-tokens` (`tokens used\n<num>` sum to `tokens`, tokens null); returns nulls with `source: 'none'` when not found or `usage: 'none'`. Negative strings `"line 503"` and `"429 tokens"` not matched. | Tested in `tests/dispatch.test.cjs` (T27, T28): `kilo.log` parsed 0.005 USD, 200/100 tokens; `mimo.log` parsed 0.02 USD, 450/150 tokens; `copilot.log` parsed 12.5 credits; `codex.log` parsed 12345 tokens; `negative.log` and `no-usage.log` returned nulls. `T27` passes. |
| **b** | Record cost: `actual` = sum of attempts' amounts when all attempts that carry a number share one unit, else actual=null and unit=null; `cumulative` = running sum within dispatch, same rule; `estimated` = null. | `.ai/bin/protocol-dispatch.cjs:1916` hardcoded `cost: { estimated: null, actual: null, cumulative: null, unit: null }` unconditionally. | Computed `actualCost` across `recordAttempts` by summing amounts when all attempts with numbers share a unit. Maintained `dispatchRunningSum` and unit consistency across slots in `runDispatch`. Evaluated `cumulativeCost` and `costUnit` adhering to schema and single-unit constraints. | Tested in `tests/dispatch.test.cjs` (T28): 2-attempt run with 1,000 and 2,500 tokens produced `cost: { estimated: null, actual: 3500, cumulative: 3500, unit: 'tokens' }`. Mixed-unit attempts (10 USD and 5 credits) verified to produce null `actual`, null `cumulative`, null `unit`. `runrecord.validateRecord(...)` returned `[]` in all cases. `T28` passes. |
| **c** | `report` gives two distinct reasons: `"usage=none (client usage=none in clients.json)"` and `"usage=none (parser <key> found no usage in log)"`. Old wording removed. | `.ai/bin/protocol-dispatch.cjs:2036` hardcoded `'none (client reported no tokens/cost)'` whenever amount was null, never checking client registry or parser key. | Updated `reportDispatch` to inspect `clientCfg.usage` from registry: emits `usage=none (client usage=none in clients.json)` if `usageKey === 'none'`, or `usage=none (parser ${usageKey} found no usage in log)` otherwise. Removed old wording. | Tested in `tests/dispatch.test.cjs` (T29): verified stdout matches both reasons for `noneClient` and `codexClient` without usage, matches `12.5 credits` for `copilotClient` with usage, and contains no occurrences of `client reported no tokens/cost`. `renderUsage` verified to display r9e headers and rendered cost (`12.50 credits`). `T29` passes. |

## Validation Commands and Real Output

### 1. Test Suite (`node --test tests/dispatch.test.cjs`)

```
TAP version 13
# Subtest: T1: no arguments exits 2 with USAGE row
ok 1 - T1: no arguments exits 2 with USAGE row
# Subtest: T2: unknown command or flag exits 2 with ERROR row
ok 2 - T2: unknown command or flag exits 2 with ERROR row
# Subtest: T3: registry loader validation
ok 3 - T3: registry loader validation
# Subtest: T4: dispatch loader validation
ok 4 - T4: dispatch loader validation
# Subtest: T5: check parity: DISPATCH.json exits 0, R3-DISPATCH.json exits 1 with 10 launch-missing rows
ok 5 - T5: check parity: DISPATCH.json exits 0, R3-DISPATCH.json exits 1 with 10 launch-missing rows
# Subtest: T6: end-to-end run with fake client in work mode
ok 6 - T6: end-to-end run with fake client in work mode
# Subtest: T7-T10: policy and scope violations end in BLOCKED with clone kept
ok 7 - T7-T10: policy and scope violations end in BLOCKED with clone kept
# Subtest: T11: credential canaries absent from child env, GIT_CONFIG_NOSYSTEM=1 present
ok 8 - T11: credential canaries absent from child env, GIT_CONFIG_NOSYSTEM=1 present
# Subtest: T12, T13: STALL at --stall-seconds and TIMEOUT at --hard-seconds
ok 9 - T12, T13: STALL at --stall-seconds and TIMEOUT at --hard-seconds
# Subtest: T14: failure classification and bare-number guards
ok 10 - T14: failure classification and bare-number guards
# Subtest: T15: needs and when skipping rules
ok 11 - T15: needs and when skipping rules
# Subtest: T16: second run of live slot exits 1 due to start lock
ok 12 - T16: second run of live slot exits 1 due to start lock
# Subtest: T17: probe command output and exits
ok 13 - T17: probe command output and exits
# Subtest: T18: every stdout line matches uppercase token format
ok 14 - T18: every stdout line matches uppercase token format
# Subtest: T19: script source contains no docs/research/ path, no prompt text, and pointer template exactly once
ok 15 - T19: script source contains no docs/research/ path, no prompt text, and pointer template exactly once
# Subtest: T20: AC-7, AC-12: transient retry, run record validation, usage render
ok 16 - T20: AC-7, AC-12: transient retry, run record validation, usage render
# Subtest: T21: AC-8: STALL recovery with wakes and fallen = true
ok 17 - T21: AC-8: STALL recovery with wakes and fallen = true
# Subtest: T22: AC-9: INVALID_OUTPUT repair resume
ok 18 - T22: AC-9: INVALID_OUTPUT repair resume
# Subtest: T23: AC-10: Launch pinning mismatch BLOCKED pin-changed, and --revise starts new run
ok 19 - T23: AC-10: Launch pinning mismatch BLOCKED pin-changed, and --revise starts new run
# Subtest: T24: AC-11: Completion contract requires Evidence line
ok 20 - T24: AC-11: Completion contract requires Evidence line
# Subtest: T25: AC-7: PROCESS_CRASH recovery via resume
ok 21 - T25: AC-7: PROCESS_CRASH recovery via resume
# Subtest: T26: AC-10: PKG-5 dispatcher fall signal test
ok 22 - T26: AC-10: PKG-5 dispatcher fall signal test
# Subtest: T27: AC-usage: parse attempt usage from log across all parsers and negative patterns
ok 23 - T27: AC-usage: parse attempt usage from log across all parsers and negative patterns
# Subtest: T28: AC-usage: two-attempt sum, mixed units giving actual=null, and cost recording
ok 24 - T28: AC-usage: two-attempt sum, mixed units giving actual=null, and cost recording
# Subtest: T29: AC-usage: report distinct reasons and renderUsage table
ok 25 - T29: AC-usage: report distinct reasons and renderUsage table
# Subtest: Guard test: test suite leaves no changes to tracked files
ok 26 - Guard test: test suite leaves no changes to tracked files
1..26
# tests 26
# suites 0
# pass 26
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 134186.0361
```

### 2. Protocol Validation (`powershell -ExecutionPolicy Bypass -File .\validate-protocol.ps1`)

```
[PASS] inspected 86 decision blocks; approval text is not proof of human authorization
[PASS] inspected decision registry with 101 entries
[PASS] task status: In progress
[PASS] one protocol version everywhere: 1.9.6
[PASS] 86 committed decision blocks are unchanged
[PASS] installer self-check runs
Protocol OK. 1 warning(s).
```

## Files Touched

1. `.ai/bin/protocol-dispatch.cjs` — Implemented `parseUsageFromLog`, attached `logPath` to attempt resolution, parsed attempt usage & tokens in `runDispatch`, computed `actual` and `cumulative` cost, updated `reportDispatch` with distinct reasons, exported functions.
2. `tests/dispatch.test.cjs` — Added T27 (parser tests and negative patterns), T28 (two-attempt sum and mixed units), T29 (report reasons and renderUsage verification).
3. `tests/fixtures/dispatch/usage/kilo.log` — Fixture for `kilo-json` parser.
4. `tests/fixtures/dispatch/usage/mimo.log` — Fixture for `kilo-json` parser (MiMo).
5. `tests/fixtures/dispatch/usage/copilot.log` — Fixture for `copilot-credits` parser.
6. `tests/fixtures/dispatch/usage/codex.log` — Fixture for `codex-tokens` parser.
7. `tests/fixtures/dispatch/usage/negative.log` — Negative fixture containing `"line 503"` and `"429 tokens"`.
8. `tests/fixtures/dispatch/usage/no-usage.log` — Fixture without usage strings.
9. `docs/research/2026-09-26-ownerideas-revision/round9/REPAIR-USAGE-GEMINI.md` — This report.
10. `.ai/worklog/gemini-53697fa4d1b45f33.md` — Session journal with required headers, five labels, and Evidence block.
