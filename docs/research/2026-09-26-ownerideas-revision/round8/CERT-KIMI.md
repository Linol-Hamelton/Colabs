Mode: ADVISORY
Baseline: 7b6d17a; working tree status: dirty
Reviewer: Kimi K2.7 Code HighSpeed, route kimi CLI, effort unknown, 2026-09-26
Scope: stage 8 independent certification of PKG-1, PKG-2, PKG-3, PKG-5
Verdict: REVIEW COMPLETE

# Certification report — high-risk packages (Kimi)

Independent certifier, outside execution and control (PROTO-DEC-0086 item 1). I ran every validation command myself and inspected the working tree. No commit, tag, push or branch was created. I restored `.ai/SIGNALS.md` to its pre-test header-only state after the import test.

## Summary

| Package | Verdict | Key evidence |
|---|---|---|
| PKG-1 ROUTES | **PASS** | `tests/dispatch.test.cjs` 21/21; `check` parity correct; `validate-protocol.ps1` 0; `test-protocol.ps1` 405/405 |
| PKG-2 RUN-RECORD | **PASS** | `tests/runrecord.test.cjs` 14/14; golden validates; `test-protocol.ps1` 405/405 |
| PKG-3 DISPATCH | **PASS** | `tests/resolver.test.cjs` 7/7; `tests/dispatch.test.cjs` 21/21; `test-protocol.ps1` 405/405 |
| PKG-5 SIGNALS | **FAIL** | `tests/signals.test.cjs` missing; P-L3-005 missing; `protocol-signals.cjs` parse bug; CLI-AGENTS section 10 missing; manifest entries missing |

## PKG-1 ROUTES — PASS

All 16 acceptance criteria verified.

- AC-1..AC-15: `node --test tests/dispatch.test.cjs` passes 21 subtests.
- AC-4 parity: `check` on `DISPATCH.json` exits 0 (`slots=26`); on `tests/fixtures/dispatch/R3-DISPATCH.json` exits 1 with exactly ten `ERROR reason=launch-missing` rows. Fixture sha256 is `2af348353dbe3d0ff5182d7893f63399ec3d6a1b1dfac6d361d15ee22b245b7f` (matches S3).
- AC-15: registry flags were verified by the executor against `--help`; I spot-checked `.ai/docs/clients.json` and the recorded `source` fields.
- AC-16: `validate-protocol.ps1` exit 0; `test-protocol.ps1` exit 0, 405 pass / 0 fail.
- `probe` reports 7 clients OK; `vibe` reports `VERSION_CHANGED` because the workstation has `vibe 2.25.8` while the registry records `vibe 2.25.5`. This is a workstation drift, not an implementation defect; the script behaves as S7 requires.
- Allowed-path compliance: only `.ai/bin/protocol-dispatch.cjs`, `.ai/docs/clients.json`, `docs/specs/bin-output-schema.md`, `.ai/docs/CLI-AGENTS.md`, `tests/dispatch.test.cjs`, `tests/dispatch-fake-client.cjs` and fixture files under `tests/fixtures/dispatch/` are changed or created.
- Observation: `docs/specs/bin-output-schema.md` lists 12 failure classes, while PROTO-DEC-0075 item 4 names 15. The mapping in PKG-1 S6 collapses the extra names into those 12, so the script output is consistent; the schema should still enumerate the canonical 15 names because it also applies to `protocol-runrecord.cjs`.

## PKG-2 RUN-RECORD — PASS

All 10 acceptance criteria verified.

- AC-1..AC-9: `node --test tests/runrecord.test.cjs` passes all T1-T14 checks.
- AC-7: the render table matches the golden Markdown.
- AC-8: synthetic fixture produces `SUMMARY rows=77 sessions=26 ratio=2.96`.
- AC-10: `validate-protocol.ps1` 0; `test-protocol.ps1` 405/405.
- Live `sessions` ratio is `6.11` (281 rows / 46 sessions), recorded as a measurement only; AC-8 uses the synthetic fixture.
- Allowed-path compliance: only `docs/specs/run-record.schema.md`, `.ai/bin/protocol-runrecord.cjs`, `tests/runrecord.test.cjs` and `tests/fixtures/runrecord/` are created.

## PKG-3 DISPATCH — PASS

All 15 acceptance criteria verified.

- AC-1..AC-6: `node --test tests/resolver.test.cjs` passes 7 subtests.
- AC-7..AC-13: `node --test tests/dispatch.test.cjs` passes 21 subtests (T20-T25 cover PKG-3).
- AC-14: `validate-protocol.ps1` 0; `test-protocol.ps1` 405/405.
- AC-15 real-ladder cross-check: the code printed rows that differ from the package's expected table because the workstation `vibe` version changed (`VERSION_CHANGED` / `SKIPPED unavailable`). The resolver correctly excluded the unavailable rung and produced the consequent shortfall/primary. I record the actual output below.
- Allowed-path compliance: only `.ai/bin/protocol-dispatch.cjs`, `docs/ops/model-ladder.json`, `.ai/docs/dispatch/wake.md`, `.ai/docs/dispatch/repair.md`, `tests/resolver.test.cjs`, `tests/fixtures/resolver/`, `tests/dispatch.test.cjs`, `tests/dispatch-fake-client.cjs`, `.ai/docs/CLI-AGENTS.md` section 9 and `protocol-manifest.json` are changed.

Actual `resolve` output on this workstation:

```
$ node .ai/bin/protocol-dispatch.cjs resolve tests/fixtures/resolver/real-ladder.json floor-t7-kernel
RESOLVE slot=floor-t7-kernel primary=agy:gemini-3.8-flash-high rung=5
EXCLUDED rung=1 reason=below-floor label="Opus 5.5 XHigh"
EXCLUDED rung=2 reason=below-floor label="Opus 5.5 High"
EXCLUDED rung=3 reason=below-floor label="Opus 5.5 Medium"
EXCLUDED rung=4 reason=tier-unknown label="GPT-5.6 Sol Medium"
EXCLUDED rung=5 reason=route-unknown label="DeepSeek V4.1 Max"
EXCLUDED rung=5 reason=tier-unknown label="GPT-5.6 Terra High"
EXCLUDED rung=6 reason=below-floor label="GPT-5.6 Luna XHigh"
EXCLUDED rung=7 reason=below-floor label="Gemini 3.7 High"
EXCLUDED rung=8 reason=tier-unknown label="Gemini 3.6 High"
SKIPPED rung=9 reason=unavailable label="Mistral Medium 3.5"
ASK_OWNER reason=shortfall
exit code: 1

$ node .ai/bin/protocol-dispatch.cjs resolve tests/fixtures/resolver/real-ladder.json floor-t3-other
RESOLVE slot=floor-t3-other primary=agy:gemini-3.7-flash-high rung=7
SUBSTITUTE n=1 route=codex:gpt-5.6-luna rung=6
SUBSTITUTE n=2 route=agy:gemini-3.8-flash-high rung=5
EXCLUDED rung=4 reason=tier-unknown label="GPT-5.6 Sol Medium"
EXCLUDED rung=5 reason=route-unknown label="DeepSeek V4.1 Max"
EXCLUDED rung=5 reason=tier-unknown label="GPT-5.6 Terra High"
EXCLUDED rung=8 reason=tier-unknown label="Gemini 3.6 High"
SKIPPED rung=9 reason=unavailable label="Mistral Medium 3.5"
exit code: 0
```

## PKG-5 SIGNALS — FAIL

The package is not complete and the shipped `protocol-signals.cjs` is broken. Findings:

1. `tests/signals.test.cjs` does not exist. AC-1..AC-9 and AC-10 (in dispatch tests) cannot be verified.
2. `docs/core-arch/stage-4/P-L3-005-client-model-effort.md` does not exist. AC-12 not met.
3. `.ai/docs/CLI-AGENTS.md` has no `## 10` section. AC-13 not met.
4. `protocol-manifest.json` has no entries for `.ai/SIGNALS.md`, `.ai/bin/protocol-signals.cjs`, `docs/specs/signals-ledger.md` or `tests/signals.test.cjs`. AC-15 not met.
5. `.ai/bin/protocol-dispatch.cjs` contains no fall hook (`addSignal` is not called). AC-10 not met.
6. `tests/dispatch.test.cjs` has no PKG-5 fall-signal subtest.
7. `.ai/SIGNALS.md` has only 3 header lines; S2 requires 4 lines. AC-1 not met.
8. `protocol-signals.cjs` line 36 uses `line.slice(9)` to remove the `Signal: ` prefix, but the prefix is 8 characters, so every valid line is parsed with id `ig-...` and fails validation with `invalid id format: ig-YYYYMMDD-NNN`. This breaks `check`, `count`, `list`, `plan`, `export`, `update`, and `import`.
9. The `count`, `list`, `plan` and `export` commands are also broken by a `let`/`const` temporal-dead-zone across `switch` cases: `Error: Cannot access 'signals' before initialization`.
10. `import` produced `SUMMARY found=101 imported=2 duplicate=1 skipped=99`, multiple `ERROR importing ... invalid id format` lines, and wrote two lines with the same id but different types, violating the immutable-fields rule. AC-6 and AC-11 not met.
11. `.ai/docs/clients.json` `effort.note` values were not updated for config/post-launch clients. AC-14 not met.

Because the core script cannot parse or write a valid ledger, PKG-5 cannot be certified. The remaining defects (missing tests, P-L3-005, section 10 and manifest entries) are unimplemented outputs.

Reproduction of the parse bug:

```
$ echo 'Signal: sig-20260926-001 | fall | 2026-09-26 | test | docs/ops/RUNS.jsonl#R-1 | minutes=1 | open | rc=- | batch=- | src=-' | node -e "const {parseLine}=require('./.ai/bin/protocol-signals.cjs'); const l=require('fs').readFileSync(0,'utf8'); console.log(parseLine(l));"
Error: invalid id format: ig-20260926-001
```

## Open questions

- The workstation `vibe` version (2.25.8) differs from the registry (2.25.5). This is not a package defect, but it changes the real-ladder AC-15 rows and the `probe` result. The registry should be re-verified before the W3 gate.
- `docs/specs/bin-output-schema.md` should enumerate all 15 canonical class names from PROTO-DEC-0075 item 4 because the schema applies to `protocol-runrecord.cjs` as well as `protocol-dispatch.cjs`.

## Certification verdicts

- PKG-1: PASS
- PKG-2: PASS
- PKG-3: PASS
- PKG-5: FAIL (must be re-implemented and re-certified)
