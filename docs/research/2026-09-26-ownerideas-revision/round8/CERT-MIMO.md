# CERT-MIMO — high-risk package certification (stage 8)

Mode: ADVISORY
Baseline: 7b6d17a (corpus freeze); HEAD 93634438fbdaeb30cf733f0aee4c5e8e59d01f59; working tree status: dirty
Reviewer: MiMo-V2.6-Pro (`xiaomi/mimo-v2.6-pro`), route mimo, effort high (variant), 2026-09-26
Scope: PKG-1, PKG-2, PKG-3, PKG-5 against the implemented working tree and `round8/IMPLEMENT-E1-GEMINI.md`, `round8/IMPLEMENT-E2-MISTRAL.md`
Frame: task:ownerideas-r8-cert-mimo (parent program: ownerideas-revision)
Verdict: REVIEW COMPLETE

Independence: this report is my own reading. I did not open `round8/CERT-KIMI.md`.

## Verdicts

| Package | Verdict |
|---|---|
| PKG-1 ROUTES | **FAIL** |
| PKG-2 RUN-RECORD | **PASS** |
| PKG-3 DISPATCH | **FAIL** |
| PKG-5 SIGNALS | **FAIL** |

## PKG-1 ROUTES — FAIL

### Acceptance criteria (commands run by me)

| # | Result | Evidence |
|---|---|---|
| AC-1 | MET | `node .ai/bin/protocol-dispatch.cjs` → `USAGE ...` exit 2; `bogus` → `ERROR reason=unknown-command` exit 2 |
| AC-2 | MET | `node --test tests/dispatch.test.cjs` T3 ok; committed registry loads |
| AC-3 | MET | T4 ok |
| AC-4 | MET | `check .../DISPATCH.json` exit 0 `slots=23`; `check tests/fixtures/dispatch/R3-DISPATCH.json` exit 1, exactly 10 `ERROR reason=launch-missing` rows, no grammar row. Fixture sha256 `2af348353dbe3d0ff5182d7893f63399ec3d6a1b1dfac6d361d15ee22b245b7f` equals S3 and the archived source |
| AC-5 | MET | T6 ok |
| AC-6 | MET | T7-T10 ok |
| AC-7 | MET | T11 ok |
| AC-8 | MET | T12, T13 ok |
| AC-9 | MET | T14 ok (12 S6 classes; bare-number guards) |
| AC-10 | MET | T15 ok |
| AC-11 | MET | T16 ok |
| AC-12 | MET | T17 ok. Live `probe`: 7 OK; `vibe state=VERSION_CHANGED expected="vibe 2.25.5" actual="vibe 2.25.8"` exit 1 (workstation drift, not a package defect) |
| AC-13 | MET | T18 ok |
| AC-14 | MET | T19 ok; `Read and follow the file` template once at `protocol-dispatch.cjs:697` |
| AC-15 | MET | Spot-check: `claude --help` shows `--effort`, `--model`, `--permission-mode`, `--allowedTools` as recorded in `clients.json` |
| AC-16 | MET (pre-gate) | `validate-protocol.ps1` exit 0 (1 WARN: 107 journals). Full suite: only `manifest.test.cjs` 209 fails, naming exactly `dispatch-fake-client.cjs`, `dispatch.test.cjs`, `runrecord.test.cjs` — the S11/S6 expected pre-W1-gate set. No other failure observed in the run window |

`node --test tests/dispatch.test.cjs`: 15/15 pass.

### Paths
Allowed set covers every PKG-1 artifact present (`protocol-dispatch.cjs`, `clients.json`, `bin-output-schema.md`, CLI-AGENTS section 9 + section-1 pointer, `tests/dispatch*.cjs`, `tests/fixtures/dispatch/R3-DISPATCH.json`, audit prompt). No PKG-1 edit to old runners or `protocol-manifest.json`. `USAGE.md` rows `r8-exec-e1`/`r8-exec-e2` come from the stage launcher, not this package.

### STOP conditions
None reported by E1. None missed by me: fixture hash matches; DISPATCH.json accepted; suite pre-state only the declared manifest gap; no network/real-model test.

### FAIL findings

**F-1 (second source of truth / S9 false claim on PROTO-DEC-0075 item 4).**
`docs/specs/bin-output-schema.md:27-31` says `class=` must be one of "the twelve canonical classes established by PROTO-DEC-0075 item 4" and lists 12 names (missing `VALIDATION_FAILURE`, `SEMANTIC_FAILURE`, `DEPENDENCY_FAILURE`).
FACT: `.ai/DECISIONS.md:3087-3090` (PROTO-DEC-0075 item 4) names **fifteen** classes.
FACT: `docs/specs/run-record.schema.md:91` correctly says "one of fifteen names from PROTO-DEC-0075 item 4".
INFERENCE: the two specs the same wave ships disagree on the class enum; S9 required the schema to state that `class=` takes only the decision's names, not a reduced invented set.
Repro:
```
# shows 15 names in the decision, 12 in bin-output-schema.md, 15 claimed in run-record.schema.md
Select-String -Path .ai/DECISIONS.md -Pattern 'VALIDATION_FAILURE|SEMANTIC_FAILURE|DEPENDENCY_FAILURE'
Select-String -Path docs/specs/bin-output-schema.md -Pattern 'twelve|VALIDATION_FAILURE|SEMANTIC_FAILURE|DEPENDENCY_FAILURE'
Select-String -Path docs/specs/run-record.schema.md -Pattern 'fifteen'
```
Observed: decision lists all three missing names (`DECISIONS.md:3090`); bin-output-schema has none of them and asserts twelve; run-record.schema asserts fifteen.

**F-2 (S9 inventory of the ten existing `.ai/bin` scripts is wrong).**
`docs/specs/bin-output-schema.md:40` lists `protocol-telemetry.cjs` and `protocol-audit.cjs` (absent) and omits `protocol-scope.cjs` and `protocol-verdict.cjs` (present).
Repro:
```
git ls-files .ai/bin
Get-Content docs/specs/bin-output-schema.md | Select-Object -Last 1
```
Observed tracked pre-existing set: `protocol.cjs`, `protocol-archive.cjs`, `protocol-handoff.cjs`, `protocol-hooks.cjs`, `protocol-index.cjs`, `protocol-ledger.cjs`, `protocol-lock.cjs`, `protocol-scope.cjs`, `protocol-session.cjs`, `protocol-verdict.cjs`.

Because required output 3 (S9) is not faithful to its sources and the package introduces a conflicting class enum, PKG-1 cannot be PASS.

## PKG-2 RUN-RECORD — PASS

### Acceptance criteria

| # | Result | Evidence |
|---|---|---|
| AC-1 | MET | `node --test tests/runrecord.test.cjs` T1 PASS; `validate tests/fixtures/runrecord/golden.jsonl` → `SUMMARY records=1 invalid=0` exit 0 |
| AC-2 | MET | T2-T8 PASS (extra key, missing key, wrong enum, wrong type, key order, schema, empty attempts) |
| AC-3 | MET | T9 PASS |
| AC-4 | MET | T10a (3 primary fresh) and T10b (7 fresh) PASS |
| AC-5 | MET | T11a, T11b PASS |
| AC-6 | MET | T12, T12b PASS |
| AC-7 | MET | T13 PASS |
| AC-8 | MET | T14 PASS (`ratio=2.96` on 77/26 fixture) |
| AC-9 | MET | CLI exits 2 on no command (`USAGE ...`); T2-T14 pattern-checked |
| AC-10 | MET (pre-gate) | Same S11/S6 expected manifest-only suite gap; validator exit 0. Live `sessions` measurement (not acceptance): `SUMMARY rows=281 sessions=46 ratio=6.11` exit 0 |

Library exports match S4 exactly: `appendRecord`, `collapseSessions`, `readRecords`, `renderUsage`, `serializeRecord`, `validateRecord`.

### Paths
Only allowed creates (`run-record.schema.md`, `protocol-runrecord.cjs`, `tests/runrecord.test.cjs`, `tests/fixtures/runrecord/*`, audit prompt 133 lines ≤ 150). No edit to hooks, `protocol-manifest.json`, or PKG-1 files.

### STOP conditions
None reported for PKG-2. None missed: golden corpus is a valid record; no extra field invented; suite was green on package tests.

### Second source of truth
`docs/specs/run-record.schema.md` is the single run-record canon. No competing field list found. Class-enum wording here matches PROTO-DEC-0075 (see F-1 against PKG-1).

## PKG-3 DISPATCH — FAIL

Not implemented. Wave W2 is gated on the operator W1 gate (E1 report: WAITING_W1_GATE). Every required artifact is absent.

Repro:
```
Test-Path .ai/bin/protocol-signals.cjs, docs/ops/model-ladder.json, docs/specs/signals-ledger.md, tests/resolver.test.cjs, docs/core-arch/stage-4/P-L3-005-client-model-effort.md, .ai/docs/dispatch/wake.md
```
Observed: all `False`. No AC-1..AC-15 can be verified. Unverified criteria cannot be PASS → **FAIL**.

## PKG-5 SIGNALS — FAIL

Not implemented. Depends on W2 (PKG-1 registry, PKG-2 records, PKG-3 supervisor). No `protocol-signals.cjs`, no `.ai/SIGNALS.md`, no `signals-ledger.md`, no P-L3-005, no fall hook. Same repro as PKG-3 (all `False`). All AC-1..AC-15 unverified → **FAIL**.

## Cross-cutting notes (not package FAILs)

- E2 report claims "PKG-1 does not exist in the working tree"; FACT: `protocol-dispatch.cjs` is present now (streams raced; W1 not yet gated).
- `docs/core-arch/stage-2/P-L2-002-model-selection.md` is dirty (PKG-4 S1 partial). Outside these four packages.
- Manifest insertion of the eight W1 entries remains the operator's W1-gate act (S11/S6).

## Top blocking findings

1. F-1 — class enum 12 vs 15 (bin-output-schema vs PROTO-DEC-0075 / run-record.schema).
2. F-2 — wrong "ten existing scripts" inventory in bin-output-schema.
3. PKG-3 and PKG-5 have no implementation in this tree.
