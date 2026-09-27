Mode: CERTIFYING
Reviewed CANDIDATE: b8781ca6fc9d854786cbd7ffc656b8b3c0c2bcde (full SHA; git rev-parse b8781ca matches)
Actual HEAD: 6e671d9799bfac1218dd845aa2cf975b7c504e63 (git rev-parse HEAD)
HEAD normative diff: `git diff --stat b8781ca HEAD -- .ai/bin tests docs/specs .ai/docs .ai/SIGNALS.md docs/ops protocol-manifest.json` shows `tests/fixtures/dispatch/t26-launch.md | 1 +` (PKG-1 test fixture, outside PKG-2 scope)
Receipt-Owner: kimi-45cb92f3f5122329
Reviewer: Kimi K2.7 Code HighSpeed, route kimi, effort high, 2026-09-27
Scope: PKG-2 round 2 (PKG-1/3/5 from round 1: PASS)
Verdict: PASS

| Criterion | Verdict | Evidence (run in worktree at b8781ca) |
|---|---|---|
| AC-1 | PASS | Golden DONE record + real past failure record; `node --test tests/runrecord.test.cjs` T1 PASS; pins verified with `git cat-file -t` and `git cat-file -p` |
| AC-2 | PASS | T2-T8 negative fixtures pass |
| AC-3 | PASS | T9 DONE with invalid completion rejected |
| AC-4 | PASS | T10a/T10b budget over-runs rejected |
| AC-5 | PASS | T11a tokens.source=none with number rejected; T11b end<start rejected |
| AC-6 | PASS | T12 readRecords names invalid line; T12b appendRecord writes nothing on invalid |
| AC-7 | PASS | T13 render matches golden Markdown for DONE and FAILED |
| AC-8 | PASS | T14 sessions on synthetic fixture prints ratio=2.96 |
| AC-9 | PASS | All CLI stdout lines match `^[A-Z][A-Z_]*( |$)`; exits follow S5 |
| AC-10 | PASS | `validate-protocol.ps1` exit 0 (1 WARN: 137 journals); `test-protocol.ps1` exit 0 (416/416) |

## Shared evidence (exit codes as printed, worktree at b8781ca)

- `node --test tests/runrecord.test.cjs` -> 0 (T1-T14 + pin negative + pattern validate)
- `node .ai/bin/protocol-runrecord.cjs validate tests/fixtures/runrecord/golden.jsonl` -> 0 (records=2 invalid=0)
- `node .ai/bin/protocol-runrecord.cjs sessions` -> 0 (ratio=NaN on empty worktree metrics; not an acceptance number)
- `powershell -ExecutionPolicy Bypass -File ./validate-protocol.ps1` -> 0 (Protocol OK, 1 WARN)
- `powershell -ExecutionPolicy Bypass -File ./test-protocol.ps1` -> 0 (416/416)

## PKG-2 round-2 verification

- F-PKG2-1 (MiMo round 1): fixed. `head` = `fd789acdb6558400576644822622544c41296980` (full SHA, valid commit); `launchSha256` = `8bcb2e8ddb8708f70ea043a3758680da2fc5d8106a3c8205391fe957c9da59a5` (matches `git cat-file -p fd789ac:docs/research/2026-09-26-ownerideas-revision/prompts/run/r6-claude-final.md`, 1147 bytes LF).
- F-PKG2-2 (MiMo round 1): fixed. `tests/fixtures/runrecord/golden.jsonl` line 1 is a golden valid DONE record (one fresh attempt, every completion field true); line 2 is the real past failure record.
- `tests/runrecord.test.cjs` calls `verifyPinsAgainstRepo` on fixture records and rejects invented heads/hashes in `testPinVerification_Negative`.

## Allowed/forbidden paths

Repair commit b8781ca changed only:
- `tests/fixtures/runrecord/golden.jsonl`
- `tests/fixtures/runrecord/pattern-test.jsonl`
- `tests/runrecord.test.cjs`
All are within PKG-2 Allowed paths. Journals and the repair report are frame outputs.

## STOP / second source of truth

No missed STOP. The golden corpus uses real git objects; no values are invented. No second source of truth for canonicalized fields.

## PKG-1 / PKG-3 / PKG-5 round-1 verdicts

Per this frame's dispatch, PKG-1, PKG-3 and PKG-5 keep their round-1 verdicts: PASS on all three.

## Notes

- Main working tree shows `tests/fixtures/dispatch/t26-launch.md` deleted; this is a T26 test cleanup side-effect (`tests/dispatch.test.cjs:990`), not a source change. I temporarily restored it so `protocol-handoff.cjs record` could run against a clean tree; record exited 0.
- All PKG-2 evidence was first run in a clean worktree at b8781ca and then verified against committed blobs.
- Did not read `round8/CERT-MIMO-PKG2-R2.md`.
