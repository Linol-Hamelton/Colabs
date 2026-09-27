Mode: CERTIFYING
Reviewed CANDIDATE: b8781ca6fc9d854786cbd7ffc656b8b3c0c2bcde (full SHA; `git rev-parse b8781ca` matches)
Actual HEAD: 6e671d9799bfac1218dd845aa2cf975b7c504e63 (`git rev-parse HEAD` at report time)
HEAD normative diff: `git diff --stat b8781ca HEAD -- .ai/bin tests docs/specs .ai/docs .ai/SIGNALS.md docs/ops protocol-manifest.json` is NOT empty: `tests/fixtures/dispatch/t26-launch.md | 1 +` (operator commit `75452bc`, not PKG-2). PKG-2 package paths vs CANDIDATE are empty.
Receipt-Owner: mimo-6b87e681088760d6
Reviewer: MiMo-V2.6-Pro (owner accepted MiMo-V2.6-Pro in place of MiMo-V2.6-Flash on 2026-09-26, direct owner confirmation, PROTO-DEC-0086 context), route mimo, effort high, 2026-09-27
Scope: PKG-2 round 2 (PKG-1/3/5 from round 1: PASS)
Verdict: FAIL
Working tree: dirty (concurrent `t26-launch.md` delete; USAGE.md). `git worktree add` blocked here; all checks against committed blobs (`git show b8781ca:<path>`, `git cat-file`) and the live tree where PKG-2 paths match CANDIDATE. Did not read `round8/CERT-KIMI-PKG2-R2.md`.

| Package | Verdict | Basis |
|---|---|---|
| PKG-1 | PASS | round 1 (unchanged; not re-opened) |
| PKG-2 | FAIL | F-PKG2-1/2 fixed; residual S4/S5 and AC-7/AC-9 defects below |
| PKG-3 | PASS | round 1 (unchanged; not re-opened) |
| PKG-5 | PASS | round 1 (unchanged; not re-opened) |

## Round-1 FAIL items (re-verified)

**F-PKG2-1 pins — FIXED.** Independent Node hash (no PowerShell pipe): `git cat-file -t fd789acdb6558400576644822622544c41296980` = `commit`; blob `dbac63f4366b5c04358274ed500238dbcf823bb3`, 1147 bytes, SHA-256 `8bcb2e8ddb8708f70ea043a3758680da2fc5d8106a3c8205391fe957c9da59a5`. Both fixtures carry that `head` and `launchSha256`. `verifyPinsAgainstRepo` + `testPinVerification_Negative` reject the invented head and hash (T1 / PIN NEGATIVE PASS).

**F-PKG2-2 golden DONE — FIXED.** `golden.jsonl` line 1: `state=DONE`, 1 fresh attempt, every completion field true. Line 2: real past-failure FAILED, 2 attempts (`first`,`transient-retry`), source comment at `tests/runrecord.test.cjs:163` (`git show 8fca7ae:.../USAGE.md` line 21). `validate` → `SUMMARY records=2 invalid=0` (exit 0).

## Per-criterion table (PKG-2)

| AC | Met? | Reproduction / evidence |
|---|---|---|
| AC-1 | yes | T1 PASS; DONE record fields + fixed-byte serialize match disk (`node --test tests/runrecord.test.cjs` → 0) |
| AC-2 | yes | T2-T8 PASS (extra key, missing key, enum, type, key order, schema, empty attempts); named `jsonPath` in errors |
| AC-3 | yes | T9 PASS (DONE + `processEnded=false` rejected) |
| AC-4 | yes | T10a/T10b PASS. Isolated third fresh on `substitute-1` also rejected: `root.budget: maximum 2 fresh attempts for substitute substitute-1 (has 3)` (T10 does not name that case) |
| AC-5 | yes | T11a/T11b PASS (`tokens.source=none` + number; `end < start`) |
| AC-6 | yes | T12/T12b PASS (`readRecords` names line; `appendRecord` writes nothing) |
| AC-7 | **no** | See F-PKG2-R2-1 / R2-2 |
| AC-8 | yes | Synthetic 77/26 via CLI: `SUMMARY rows=77 sessions=26 ratio=2.96`, 26 `SESSION` rows, exit 0 (T14 also PASS) |
| AC-9 | **no** | See F-PKG2-R2-2 / R2-3 |
| AC-10 | partial | `validate-protocol.ps1` → 0 (1 WARN: 139 journals). `runrecord`/`resolver`/`signals` → 0. `dispatch.test.cjs` 22/23 (guard failed on concurrent `t26-launch.md` delete, not PKG-2). `test-protocol.ps1` not finished this run (timeout) |

## Residual findings (new vs round 1)

**F-PKG2-R2-1 (blocking, AC-7, S4) — render headers violate S4.** S4 names `Model ran` and `Effort used`. Reproduction:

```
node -e "const{renderUsage,readRecords}=require('./.ai/bin/protocol-runrecord.cjs');console.log(renderUsage(readRecords('tests/fixtures/runrecord/golden.jsonl')).split('\n')[0])"
| Run | Slot | Selection | Client | Model | Effort | Fresh/Resume | Wall min | Tokens in/out | Cost | State |
```

Committed `.ai/bin/protocol-runrecord.cjs:926` (`headers = [..., 'Model', 'Effort', ...]`).

**F-PKG2-R2-2 (blocking, AC-7/AC-9, S5) — `validate` omits required `VALID line=` rows.** S5: `VALID line=<n> runId=<id>` or `INVALID ...`, then `SUMMARY`. Reproduction:

```
node .ai/bin/protocol-runrecord.cjs validate tests/fixtures/runrecord/golden.jsonl
SUMMARY records=2 invalid=0
```

Exit 0, but zero `VALID` rows. Source `protocol-runrecord.cjs:1033` prints only `SUMMARY`. `round9/REPAIR-PKG2-GEMINI.md` §2 claims `VALID line=1` / `VALID line=2`; that claimed output is not what the CANDIDATE prints.

**F-PKG2-R2-3 (blocking, AC-7) — no golden Markdown equality.** T13 asserts `includes('| Run | Slot |')`, `includes('FAILED')`, `includes('DONE')` only. No golden Markdown fixture; the render is never byte/line-equal to a golden table.

**F-PKG2-R2-4 (blocking, AC-9) — tests do not pattern-check CLI stdout.** `testPattern_validate` exercises library functions only; no test captures CLI stdout against `^[A-Z][A-Z_]*( |$)`. The no-command `printUsage` help body (`Commands:`, indented command lines) would also fail that pattern if checked.

## STOP / second-source / paths

- No missed STOP from F-PKG2-1/2 repair. STOP 3 not re-triggered: past-failure values come from the package-prescribed defaults, not invention.
- Second source: `docs/specs/run-record.schema.md` does not restate S4 column names or S5 CLI rows (PKG-2.md remains canonical for those).
- Repair touched only `tests/runrecord.test.cjs`, `tests/fixtures/runrecord/*`, plus its report/journal. No `protocol-manifest.json` edit (S6). No commit/tag/push/branch by this certifier.
- Concurrent caveat: dispatch guard `D tests/fixtures/dispatch/t26-launch.md` is operator/journal noise outside PKG-2; PKG-2 paths match CANDIDATE exactly.
