Mode: ADVISORY
Baseline: 9363443; working tree status: dirty
Reviewer: Kimi K2.7 Code HighSpeed, route kimi CLI, effort unknown, 2026-09-26 UTC
Scope: Stage 8 independent certification of high-risk packages PKG-1..PKG-5 for ownerideas-revision
Verdict: REVIEW COMPLETE

## Method

- Read `round6/packages/PKG-1.md`, `PKG-2.md`, `PKG-3.md`, `PKG-5.md`; `round6/FINAL-RESOLUTION-CLAUDE.md`; `round8/IMPLEMENT-E1-GEMINI.md`; `round8/IMPLEMENT-E2-MISTRAL.md`.
- Ran every package validation command myself on the working tree.
- Did not read `round8/CERT-MIMO.md`.
- No code edits; only this report and the session journal were written.

## PKG-1 ROUTES — PASS

Required artifacts present and within allowed paths:
- `.ai/bin/protocol-dispatch.cjs` (1332 lines)
- `.ai/docs/clients.json` (446 lines)
- `docs/specs/bin-output-schema.md` (40 lines)
- `tests/dispatch.test.cjs`, `tests/dispatch-fake-client.cjs`
- `tests/fixtures/dispatch/R3-DISPATCH.json`
- `docs/reviews/2026-09-26-gemini-ownerideas-pkg-1-audit-prompt.md` (32 lines)
- `.ai/docs/CLI-AGENTS.md`: only the section-1 pointer and section-9 append were changed.

Validation commands run by this certifier:

| Command | Exit | Result |
|---|---|---|
| `node --test tests/dispatch.test.cjs` | 0 | 15/15 pass |
| `node .ai/bin/protocol-dispatch.cjs check docs/research/2026-09-26-ownerideas-revision/prompts/DISPATCH.json` | 0 | `CHECK ... slots=23` |
| `node .ai/bin/protocol-dispatch.cjs check tests/fixtures/dispatch/R3-DISPATCH.json` | 1 | Exactly 10 `ERROR reason=launch-missing` rows, one per slot |
| `node .ai/bin/protocol-dispatch.cjs probe` | 1 | `vibe` reports `VERSION_CHANGED` (expected: `vibe 2.25.5`, actual: `vibe 2.25.8`); all other 7 clients OK |

R3 fixture sha256 matches `2af348353dbe3d0ff5182d7893f63399ec3d6a1b1dfac6d361d15ee22b245b7f` (PKG-1 S3). The `vibe` version change is a registry re-verification signal per S7, not a package defect.

`protocol-manifest.json` was not edited by the executor; the expected pre-gate `manifest.test.cjs` failure is noted below under "Tree-wide suite".

Verdict: **PASS**.

## PKG-2 RUN-RECORD — PASS

Required artifacts present and within allowed paths:
- `.ai/bin/protocol-runrecord.cjs` (1173 lines)
- `docs/specs/run-record.schema.md` (209 lines)
- `tests/runrecord.test.cjs`, `tests/fixtures/runrecord/golden.jsonl`
- `docs/reviews/2026-09-26-mistral-ownerideas-pkg-2-audit-prompt.md` (184 lines)

Validation commands run by this certifier:

| Command | Exit | Result |
|---|---|---|
| `node --test tests/runrecord.test.cjs` | 0 | T1-T14 pass |
| `node .ai/bin/protocol-runrecord.cjs validate tests/fixtures/runrecord/golden.jsonl` | 0 | `SUMMARY records=1 invalid=0` |
| `node .ai/bin/protocol-runrecord.cjs sessions` | 0 | 46 sessions, 281 rows, ratio 6.11 (live measurement, not an acceptance number) |

Verdict: **PASS**.

## PKG-3 DISPATCH — FAIL

Required artifacts are **absent** from the working tree. `round8/IMPLEMENT-E1-GEMINI.md` states PKG-3 is `WAITING_W1_GATE`.

Reproduction:
```
$ test -f docs/ops/model-ladder.json && echo exists || echo MISSING
MISSING
$ test -f tests/resolver.test.cjs && echo exists || echo MISSING
MISSING
$ test -f .ai/docs/dispatch/wake.md && echo exists || echo MISSING
MISSING
$ test -f .ai/docs/dispatch/repair.md && echo exists || echo MISSING
MISSING
```

Because no implementation exists, no acceptance criterion can be verified. Verdict: **FAIL**.

## PKG-5 SIGNALS — FAIL

Required artifacts are **absent** from the working tree. `round8/IMPLEMENT-E2-MISTRAL.md` states PKG-5 is `BLOCKED` pending PKG-1 and PKG-3.

Reproduction:
```
$ test -f .ai/SIGNALS.md && echo exists || echo MISSING
MISSING
$ test -f .ai/bin/protocol-signals.cjs && echo exists || echo MISSING
MISSING
$ test -f docs/specs/signals-ledger.md && echo exists || echo MISSING
MISSING
$ test -f tests/signals.test.cjs && echo exists || echo MISSING
MISSING
$ test -f docs/core-arch/stage-4/P-L3-005-client-model-effort.md && echo exists || echo MISSING
MISSING
```

Because no implementation exists, no acceptance criterion can be verified. Verdict: **FAIL**.

## Tree-wide suite

| Command | Exit | Note |
|---|---|---|
| `powershell -ExecutionPolicy Bypass -File ./validate-protocol.ps1` | 0 | Protocol OK; 1 pre-existing warning (107 worklog journals vs cap 100) |
| `powershell -ExecutionPolicy Bypass -File ./test-protocol.ps1` | 1 | 391 pass, 1 fail: `tests/manifest.test.cjs` reports unlisted `tests/dispatch-fake-client.cjs` and `tests/dispatch.test.cjs` — the expected pre-W1-gate failure named in PKG-1 S11 and PKG-2 S6 |

## Open questions

1. PKG-3 and PKG-5 were dispatched for certification but their executors halted at dependency gates. Was this certification frame intended to run before the W1/W2 gates, or should it be re-run after those packages are implemented?
2. `vibe` registry version is stale (`2.25.5` recorded, `2.25.8` installed). The executor verified against the installed version; re-verification is needed before a real `vibe` dispatch.
