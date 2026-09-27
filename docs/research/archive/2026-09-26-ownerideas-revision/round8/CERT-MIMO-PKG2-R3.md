Mode: CERTIFYING
Reviewed CANDIDATE: 7f199c50589ce3b5b34680e70be21e9a43aeeac1 (full SHA; freeze commit of `r9g-freeze-candidate`, carrying r9e + r9f)
Actual HEAD: aa5ac9d1c918a6fe325da3fbf39d85a6ad906b98 (`git rev-parse HEAD` at report time; later journal/operator commits only)
HEAD normative diff: `git diff --stat 7f199c5 HEAD -- .ai/bin tests docs/specs .ai/docs .ai/SIGNALS.md docs/ops protocol-manifest.json` is empty
Receipt-Owner: mimo-07aa87d3db94ee8d
Reviewer: MiMo-V2.6-Pro (owner accepted MiMo-V2.6-Pro in place of MiMo-V2.6-Flash on 2026-09-26, direct owner confirmation, PROTO-DEC-0086 context), route mimo, effort high, 2026-09-27
Scope: PKG-2 in full including F-PKG2-R2-1..R2-4; PKG-1 and PKG-3 in full with named criteria PKG-1 S8, PKG-3 S8 (including the `report` reason) and PROTO-DEC-0075 item 9; PKG-5 keeps its round-1 verdict (not re-opened)
Verdict: PASS
Working tree: dirty (USAGE.md, untracked journals). Package paths match CANDIDATE (normative diff empty). `git worktree add` is blocked in this tool environment; checks against the live tree where it matches CANDIDATE and against committed blobs via `git show 7f199c5:<path>`. Did not read the Kimi report of this round.

| Package | Verdict | Basis |
|---|---|---|
| PKG-1 | PASS | AC-1..AC-16 met; named S8 met (usage/cost per attempt from the log) |
| PKG-2 | PASS | F-PKG2-R2-1..R2-4 fixed and re-verified; AC-1..AC-10 met |
| PKG-3 | PASS | AC-1..AC-15 met; named S8 met (report reasons) |
| PKG-5 | PASS | round-1 verdict; not re-opened by this round |

## Shared evidence (exit codes as printed)

- `node --test tests/runrecord.test.cjs` -> 0 (T1-T14, PIN NEGATIVE, PATTERN, CLI PATTERN).
- `node --test tests/dispatch.test.cjs` -> 0 (26/26, incl. T27-T29 usage/cost).
- `node --test tests/resolver.test.cjs` -> 0 (7/7, incl. AC-15).
- `node --test tests/signals.test.cjs` -> 0 (9/9).
- `powershell -ExecutionPolicy Bypass -File .\validate-protocol.ps1` -> 0 (Protocol OK; 1 WARN: 145 journals vs cap 100, WARN-first).
- `powershell -ExecutionPolicy Bypass -File .\test-protocol.ps1` -> 0 (419/419).
- `check prompts/DISPATCH.json` -> 0 (`CHECK ... slots=36`); `check tests/fixtures/dispatch/R3-DISPATCH.json` -> 1, exactly ten `ERROR reason=launch-missing` rows; fixture sha256 `2af348353dbe3d0ff5182d7893f63399ec3d6a1b1dfac6d361d15ee22b245b7f` (matches S3).
- `probe` -> 0, eight clients `state=OK`.
- `protocol-runrecord.cjs validate tests/fixtures/runrecord/golden.jsonl` -> 0 (`VALID line=1`, `VALID line=2`, `SUMMARY records=2 invalid=0`).
- `protocol-runrecord.cjs sessions` -> 0 (`SUMMARY rows=284 sessions=47 ratio=6.04`).
- `protocol-signals.cjs check` -> 0 (`lines=97 signals=95 invalid=0`); `count` -> 0.
- `resolve tests/fixtures/resolver/real-ladder.json floor-t7-kernel` -> 1 `ASK_OWNER reason=shortfall`; floor-t3-other -> 0 (AC-15 rows match).

## F-PKG2-R2-1..R2-4 re-verification (this round's residuals)

**F-PKG2-R2-1 (S4 headers) — FIXED.** Reproduction:

```
node -e "const{renderUsage,readRecords}=require('./.ai/bin/protocol-runrecord.cjs');console.log(renderUsage(readRecords('tests/fixtures/runrecord/golden.jsonl')).split('\n')[0])"
| Run | Slot | Selection | Client | Model ran | Effort used | Fresh/Resume | Wall min | Tokens in/out | Cost | State |
```

Matches PKG-2 S4 exactly. Committed `protocol-runrecord.cjs` `headers` carry `Model ran` and `Effort used`.

**F-PKG2-R2-2 (S5 VALID rows) — FIXED.** Reproduction:

```
node .ai/bin/protocol-runrecord.cjs validate tests/fixtures/runrecord/golden.jsonl
VALID line=1 runId=R-20260926T123940Z-r6-claude-final
VALID line=2 runId=R-20260926T123940Z-r6-claude-final
SUMMARY records=2 invalid=0
```

Exit 0. S5 `VALID line=<n> runId=<id>` rows are present.

**F-PKG2-R2-3 (golden Markdown equality) — FIXED.** Independent byte check:

```
node -e "const{renderUsage,readRecords}=require('./.ai/bin/protocol-runrecord.cjs');const fs=require('fs');const r=renderUsage(readRecords('tests/fixtures/runrecord/golden.jsonl'));const g=fs.readFileSync('tests/fixtures/runrecord/golden.md','utf8');console.log('equal='+(r===g))"
equal=true
```

T13 asserts `assert.strictEqual(rendered, goldenMd)` against committed `tests/fixtures/runrecord/golden.md` (443 bytes, LF, no BOM).

**F-PKG2-R2-4 (CLI stdout pattern) — FIXED.** Reproduction:

```
node .ai/bin/protocol-runrecord.cjs
USAGE command=[validate|append|render|sessions] syntax="node .ai/bin/protocol-runrecord.cjs <command> [args]"
```

Exit 2. Single `USAGE ` row matches `^[A-Z][A-Z_]*( |$)`. `testCliPattern_AllCommands` captures CLI stdout for no-args, unknown, validate valid/invalid, append valid/invalid, render --out and sessions, and asserts the pattern plus S5 exits.

## PKG-2 per-criterion table

| AC | Met? | Reproduction / evidence |
|---|---|---|
| AC-1 | yes | T1 PASS; golden DONE + past-failure FAILED validate and serialise to fixed bytes; pins verify against repository (`verifyPinsAgainstRepo`; head `fd789acdb6558400576644822622544c41296980`, launchSha256 `8bcb2e8d...`); PIN NEGATIVE rejects invented pins |
| AC-2 | yes | T2-T8 PASS (extra key, missing key, enum, type, key order, schema, empty attempts); named `jsonPath` |
| AC-3 | yes | T9 PASS (DONE + `processEnded=false` rejected) |
| AC-4 | yes | T10a/T10b PASS (3rd primary fresh; 7th fresh) |
| AC-5 | yes | T11a/T11b PASS (`tokens.source=none` + number; `end < start`) |
| AC-6 | yes | T12/T12b PASS (`readRecords` names line; `appendRecord` writes nothing) |
| AC-7 | yes | T13 PASS with byte equality to `golden.md` (F-PKG2-R2-3 fixed) |
| AC-8 | yes | T14 PASS (`SUMMARY rows=77 sessions=26 ratio=2.96` on synthetic fixture); live `sessions` ratio=6.04 |
| AC-9 | yes | CLI PATTERN PASS; S5 exits; F-PKG2-R2-2 and R2-4 fixed |
| AC-10 | yes | validator 0; full suite 419/419 |

## PKG-1 full and named S8

AC-1..AC-16 met (dispatch T1-T19 plus T20-T29 and the suite/validator exits above). AC-15: `probe` level 0 OK for all eight clients; registry flags from recorded `--help` (executor journal). AC-14: T19 (no `docs/research/` path, pointer template once). Allowed paths: implementation stays in package Allowed paths; `protocol-manifest.json` is operator-owned (S11).

**Named S8 (State, usage and status) — met.** `parseUsageFromLog(logPath, clientCfg.usage)` reads each attempt's log with the registry parser (`kilo-json`, `copilot-credits`, `codex-tokens`, `none`). Independent reproduction on committed fixtures:

| Fixture / parser | tokens in/out | usage amount/unit |
|---|---|---|
| kilo.log / kilo-json | 200/100 `client-output` | 0.005 USD |
| mimo.log / kilo-json | 450/150 `client-output` | 0.02 USD |
| copilot.log / copilot-credits | null | 12.5 credits |
| codex.log / codex-tokens | null | 12345 tokens |
| negative.log / kilo-json | null | null (bare-number guards) |
| no-usage.log / codex-tokens | null | null |
| codex.log / `usage=none` | null | null |

T27 covers all parsers and negatives. Every attempt is recorded (not only the last).

## PROTO-DEC-0075 item 9 (cost recorded from the log, never estimated) — met

Cost object is always `cost: { estimated: null, actual: actualCost, cumulative: cumulativeCost, unit: costUnit }`. `estimated` is hardcoded null: no estimate is ever invented. `actual` is the sum of attempt amounts when all numbered attempts share one unit; mixed units give `actual=null`, `cumulative=null`, `unit=null`. `cumulative` is the running sum within the dispatch under the same single-unit rule. Independent T28 evidence: two attempts 1000+2500 tokens -> `actual=3500, cumulative=3500, unit=tokens, estimated=null`; mixed 10 USD + 5 credits -> all null. Feeds the run record of PKG-2 S1 `cost`.

## PKG-3 full and named S8 (including the `report` reason)

AC-1..AC-15 met (resolver 7/7, dispatch T20-T26, AC-15 real-ladder rows match the package table). AC-13: source still free of prompt text / `docs/research/`; pointers are launch + `wake.md`/`repair.md`.

**Named S8 `report` reason — met.** Two distinct missing-usage reasons, old wording removed:

```
REPORT ... usage=none (client usage=none in clients.json)
REPORT ... usage=none (parser codex-tokens found no usage in log)
```

T29 asserts both strings and asserts stdout contains no `client reported no tokens/cost`. Present-usage form is `usage=<amount> <unit>` (e.g. `12.5 credits`). A slot with no run record prints `usage=none (no-run-record)`.

## PKG-5

Round-1 verdict **PASS** stands. This round does not re-open PKG-5. No PKG-5 path is in the CANDIDATE repair diff (`b8781ca..7f199c5` touches only `protocol-dispatch.cjs`, `protocol-runrecord.cjs`, dispatch/runrecord tests and fixtures). Live `protocol-signals.cjs check` still `invalid=0` (non-blocking spot-check only).

## STOP / second-source / paths

- No missed STOP. Transient `t20-/t24-/...-launch.md` fixtures are pre-existing PKG-1 test design (freeze addendum 2026-09-27), not a defect.
- Second source: `docs/specs/run-record.schema.md` does not restate S4 column names or S5 CLI rows (PKG-2.md remains canonical). `docs/specs/bin-output-schema.md` does not restate the two `usage=none` reason strings (PKG-3.md S8 remains canonical).
- Repair path set (`b8781ca..7f199c5`): `.ai/bin/protocol-dispatch.cjs`, `.ai/bin/protocol-runrecord.cjs`, `tests/dispatch.test.cjs`, `tests/runrecord.test.cjs`, `tests/fixtures/dispatch/usage/*`, `tests/fixtures/runrecord/golden.md` — all inside package Allowed paths. No `protocol-manifest.json` edit by the repair. No commit/tag/push/branch by this certifier.
- Concurrent caveat: first `record` stamped `test-protocol.ps1: exit 1` under concurrent suite pressure; independent re-run immediately after is 419/419 (see Shared evidence). No fixture/dispatch FAIL in any of this certifier's own runs. `git worktree add` blocked, so re-verification is the repeated suite run in this copy (normative paths match CANDIDATE).
