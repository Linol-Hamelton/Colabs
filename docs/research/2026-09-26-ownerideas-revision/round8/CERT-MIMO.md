Mode: ADVISORY
Baseline: 0680b6fc369e10f9ff7926ebda7af56a8fcbc265 (corpus freeze 7b6d17a); working tree status: dirty (stage-8 implementation uncommitted)
Reviewer: MiMo-V2.6-Pro, route mimo, effort high, 2026-09-26
Scope: independent certification of high-risk packages PKG-1, PKG-2, PKG-3, PKG-5 (stage 8)
Verdict: REVIEW COMPLETE

# CERT-MIMO — high-risk packages (PKG-1, PKG-2, PKG-3, PKG-5)

Independence: I did not read `round8/CERT-KIMI.md`. I executed nothing in these packages and
control none of them. Every command below was run in this session on the tree named above.
Labels: **[F]** fact checked here with `path:line` or command output; **[I]** inference;
**[Q]** open question.

## PKG-1 ROUTES — **FAIL**

| AC | Result | Evidence |
|---|---|---|
| AC-1 | MET | T1, T2 pass (`node --test tests/dispatch.test.cjs`) |
| AC-2 | MET | T3 pass; `probe` loads the committed registry |
| AC-3 | MET | T4 pass |
| AC-4 | MET | T5 pass; live: `check DISPATCH.json` exit 0 slots=27; `check R3-DISPATCH.json` exit 1, exactly 10 `ERROR reason=launch-missing`, no grammar row. sha256 `2af348353dbe3d0ff5182d7893f63399ec3d6a1b1dfac6d361d15ee22b245b7f` matches S3 |
| AC-5 | MET | T6 pass |
| AC-6 | MET | T7-T10 pass (SCOPE_STOP/POLICY_FAILURE, clone kept) |
| AC-7 | MET | T11 pass (canaries absent; `GIT_CONFIG_NOSYSTEM=1`) |
| AC-8 | MET | T12, T13 pass |
| AC-9 | MET | T14 pass (12 S6 classes in code table as S6 specifies; bare-number guards) |
| AC-10 | MET | T15 pass |
| AC-11 | MET | T16 pass |
| AC-12 | MET | T17 pass; live `probe` exit 1 `VERSION_CHANGED` for vibe (expected re-verify, not a defect) |
| AC-13 | MET | T18 pass |
| AC-14 | MET | T19 pass; live source grep: `docs/research/`=0, `Read and follow`=1, `wake.md`=1, `repair.md`=1 |
| AC-15 | MET | flags checked by executor; registry loads; note: vibe/kimi `effort.note` were set to `null` (see PKG-5 AC-14) |
| AC-16 | **NOT MET** | `validate-protocol.ps1` exit 0 (1 WARN journals 119>100). Full suite is red: T26 (PKG-5) and T20 flake (PKG-3). Reproduction below |

**F1-P1 (blocking).** `docs/specs/bin-output-schema.md` still says "the twelve canonical classes"
and lists 12 names, omitting `VALIDATION_FAILURE`, `DEPENDENCY_FAILURE`, `SEMANTIC_FAILURE`
required by PROTO-DEC-0075 item 4 (15 names). E1 claimed F-1 fixed this; it did not.
```
PS> node -e "const t=require('fs').readFileSync('docs/specs/bin-output-schema.md','utf8'); console.log(t.includes('VALIDATION_FAILURE'), t.includes('DEPENDENCY_FAILURE'), t.includes('SEMANTIC_FAILURE'), t.includes('fifteen'), t.includes('twelve'))"
false false false false true
```

**F2-P1 (blocking).** Same file names `protocol-telemetry.cjs` and `protocol-audit.cjs` as the
ten existing scripts; neither exists in `git ls-files`. Real scripts include
`protocol-scope.cjs` and `protocol-verdict.cjs`, which are not named. E1 claimed F-2 fixed this.
```
PS> node -e "const t=require('fs').readFileSync('docs/specs/bin-output-schema.md','utf8'); console.log(t.match(/protocol-\w+\.cjs/g))"
# ... protocol-telemetry.cjs, protocol-audit.cjs ... (absent from git ls-files)
```

**F3-P1 (blocking).** S10 requires the section-9 bullet "the old runners are superseded for new
dispatches". The working-tree diff **removed** it (also removed "Recovery arrives with PKG-3",
which S10 of PKG-3 correctly replaces).
```
PS> node -e "const t=require('fs').readFileSync('.ai/docs/CLI-AGENTS.md','utf8'); console.log(t.includes('old runners') && t.includes('superseded'))"
false
```

## PKG-2 RUN-RECORD — **FAIL** (single unmet criterion)

| AC | Result | Evidence |
|---|---|---|
| AC-1 | MET | T1 pass; golden validates `SUMMARY records=1 invalid=0`; keys in S1 order |
| AC-2 | MET | T2-T8 pass (extra/missing key, enum, type, order, schema, empty attempts) |
| AC-3 | MET | T9 pass |
| AC-4 | MET | T10a, T10b pass |
| AC-5 | MET | T11a, T11b pass |
| AC-6 | MET | T12, T12b pass |
| AC-7 | MET | T13 pass |
| AC-8 | MET | T14 pass (`SUMMARY rows=77 sessions=26 ratio=2.96`) |
| AC-9 | MET | row grammar enforced; S5 exits observed |
| AC-10 | **NOT MET** | validator exit 0; `test-protocol.ps1` / `dispatch.test.cjs` red on T26 and flaky T20. Reproduction below |

Own suite is green: `node --test tests/runrecord.test.cjs` → `# fail 0` (T1-T14). Live
`sessions` measurement (not an acceptance number): `SUMMARY rows=281 sessions=46 ratio=6.11`.
Audit prompt 133 lines (<=150). No second run-record source: `docs/specs/run-record.schema.md`
is the only schema; golden fixture is `run-record/1` with `state=FAILED` as S1 requires.

```
PS> powershell -ExecutionPolicy Bypass -File .\test-protocol.ps1
# ... ok 1..38 except: not ok 39 - T26: AC-10: PKG-5 dispatcher fall signal test
# error: must add exactly 1 signal line on wake exhaustion / 2 !== 1
# (suite also flaked T20 once: expected /^RUN slot=t20-slot attempt=2/m, got attempt=1 then DONE)
```

## PKG-3 DISPATCH — **FAIL**

| AC | Result | Evidence |
|---|---|---|
| AC-1 | MET | resolver T1 pass; stale `sectionSha256` → `ladder-stale` |
| AC-2 | MET | resolver T2 pass |
| AC-3 | MET | resolver T3 pass (7 exclusion reasons) |
| AC-4 | MET | resolver T4 pass |
| AC-5 | MET | resolver T5 pass |
| AC-6 | MET | resolver T6 pass |
| AC-7 | **NOT MET** | T20 flaked: expected `attempt=2`, observed `attempt=1` then `DONE`. T25 (PROCESS_CRASH resume) passes. Reproduction below |
| AC-8 | MET | T21 pass (3 wakes, fallen, fresh, substitutes; `fallen=true`) |
| AC-9 | MET | T22 pass (repair resume + repair file) |
| AC-10 | MET | T23 pass (`pin-changed`, `--revise` new runId) |
| AC-11 | MET | T24 pass (missing Evidence line blocks DONE) |
| AC-12 | MET | T20 covers record/usage when it passes; records validate |
| AC-13 | MET | T19 + live grep (0 prompt text, 0 `docs/research/`, pointer targets only) |
| AC-14 | **NOT MET** | suite red (T26) + T20 flake |
| AC-15 | MET (difference recorded) | live rows below; package allows a recorded difference |

AC-15 live rows (clients probed levels 0-1; vibe `VERSION_CHANGED`):
```
RESOLVE slot=floor-t7-kernel primary=agy:gemini-3.8-flash-high rung=5
EXCLUDED rung=1..3 reason=below-floor ... rung=4 tier-unknown ... rung=5 route-unknown DeepSeek
EXCLUDED rung=5 tier-unknown Terra ... rung=6..7 below-floor ... rung=8 tier-unknown
SKIPPED rung=9 reason=unavailable label="Mistral Medium 3.5"
ASK_OWNER reason=shortfall
EXIT=1
RESOLVE slot=floor-t3-other primary=agy:gemini-3.7-flash-high rung=7
SUBSTITUTE n=1 route=codex:gpt-5.6-luna rung=6
SUBSTITUTE n=2 route=agy:gemini-3.8-flash-high rung=5
SKIPPED rung=9 reason=unavailable label="Mistral Medium 3.5"
EXIT=0
```
Difference from the AC-15 table: primary is Gemini 3.8 High (rung 5), not Mistral Medium 3.5
(rung 9), because rung 9 is unavailable on this workstation (vibe 2.25.8 != registry 2.25.5).
Substitute count 0 vs expected 1 → `ASK_OWNER`, as specified. [I] Not a code defect; registry
re-verification is an operator act (0050 item 3). Resolver tests 7/7 pass.

**F1-P3 (blocking, flake).** T20 is not deterministic:
```
PS> node --test tests/dispatch.test.cjs
# run 1: not ok 16 - T20 ... expected /^RUN slot=t20-slot attempt=2/m
#         actual: 'RUN slot=t20-slot attempt=1 route=fake:test\nDONE slot=t20-slot\n'
# run 2/3: ok 16 - T20
```
AC-7/AC-12 require the transient-retry path; a flaky retry test leaves the criterion unverified.

## PKG-5 SIGNALS — **FAIL**

| AC | Result | Evidence |
|---|---|---|
| AC-1 | **NOT MET** | `node .ai/bin/protocol-signals.cjs check` → `INVALID header line 4 mismatch`, exit 2. Header is 4 content lines with a Signal on line 4; S2 requires title, blank, text, blank, then signals. Live file also holds a test-generated `fall` with `participant=fake:test` and `evidence=docs/ops/RUNS.jsonl#R-20260926T201853Z-timed-silent` |
| AC-2 | UNVERIFIED | fixtures exist under `tests/fixtures/signals/` (10 files) but `tests/signals.test.cjs` is **missing**; no negative-fixture runner |
| AC-3..AC-9 | UNVERIFIED | same missing test file |
| AC-10 | **NOT MET** | `T26: must add exactly 1 signal line on wake exhaustion / 2 !== 1` |
| AC-11 | **NOT MET** | real `.ai/SIGNALS.md` fails `check` (see AC-1) |
| AC-12 | MET | `P-L3-005-client-model-effort.md` front matter matches S8 exactly; no flag/effort/model strings (search `--`, effort words: only table rules) |
| AC-13 | MET | CLI-AGENTS diff adds section 10 only (plus PKG-3's section-9 edits) |
| AC-14 | **NOT MET** | `clients.json` `effort.note` for vibe and kimi were changed to `null` (were `"configured via agent toml"` / `"thinking effort from config.toml"`). S8 requires writing the client's own instruction into `effort.note`, never erasing one |
| AC-15 | **NOT MET** | suite red (T26); manifest missing SIGnals entries |

```
PS> node .ai/bin/protocol-signals.cjs check
INVALID header line 4 mismatch
SUMMARY lines=INVALID signals=0 invalid=1
CHECK_EXIT=2
PS> Get-ChildItem tests -Filter signals*   # fixtures/signals exists; signals.test.cjs MISSING
PS> node -e "const m=require('./protocol-manifest.json'); ..."
MISSING .ai/SIGNALS.md / .ai/bin/protocol-signals.cjs / docs/specs/signals-ledger.md / tests/signals.test.cjs
```

**F1-P5 (blocking).** `.ai/SIGNALS.md` violates S2 byte layout (missing blank line 4).
**F2-P5 (blocking).** Required outputs 7 (`tests/signals.test.cjs`) and 9 (audit prompt) absent.
**F3-P5 (blocking).** S9 manifest entries for the three signals artifacts not inserted.
**F4-P5 (blocking).** Fall hook emits two lines where S6/AC-10 require one.
**F5-P5 (blocking).** Registry `effort.note` values nulled (AC-14).

Present and in scope: `docs/specs/signals-ledger.md` (53 lines <=120), `.ai/bin/protocol-signals.cjs`,
`.ai/docs/dispatch/wake.md` (5 lines), `repair.md` (7 lines <=8). P-L3-005 body uses the schema
headings. CLI-AGENTS section 10 is the single home for the procedure text (R-L0-12).

## Allowed / forbidden paths

Changed-file set is inside the packages' Allowed paths plus PKG-4's medium-risk core-arch files
(out of my subject). No edits to old runners, hooks, validator, shared documents, FRAMES.md,
OwnerIdeas/. `protocol-manifest.json` was edited (PKG-3 S9 / operator W1 gate); PKG-5 S9 entries
are missing. No commit, tag, push or branch by me.

## STOP conditions

No missed STOP found in PKG-1/2/3 executors' reports. PKG-5's partial state was reported as
blocked/partial by E2; the post-repair tree still fails AC-1, AC-10, AC-11, AC-14, AC-15, so the
repair is incomplete rather than a missed STOP.

## Second sources of truth

- Ladder: `MODEL-ECONOMICS.md` canonical; `model-ladder.json` derived with `sectionSha256` — OK.
- Clients: `clients.json` canonical; CLI-AGENTS section 1 keeps a pointer — OK.
- Run record: one schema; USAGE.md is render-only for new runs — OK.
- Signals: one ledger grammar (`signals-ledger.md`); interim `Signal:` lines remain history — OK.
- Failure classes: `bin-output-schema.md` (12 names) **disagrees** with PROTO-DEC-0075 item 4
  (15 names) and with PKG-2 S3 — recorded as F1-P1, not resolved by me.

## Verdicts

| Package | Verdict |
|---|---|
| PKG-1 ROUTES | **FAIL** (F1-P1, F2-P1, F3-P1; AC-16) |
| PKG-2 RUN-RECORD | **FAIL** (AC-10 only; AC-1..AC-9 all MET) |
| PKG-3 DISPATCH | **FAIL** (F1-P3 flake; AC-7, AC-14) |
| PKG-5 SIGNALS | **FAIL** (F1-P5..F5-P5; AC-1, AC-2..9, AC-10, AC-11, AC-14, AC-15) |

Nothing here is a decision (AGENTS.md section 2). I fix nothing.

[Q] PROTO-DEC-0086 item 1 names certifier MiMo-V2.6-**Flash**; this launch freezes
MiMo-V2.6-**Pro** (`r8-cert-mimo.md`). Confirm the override is intended.
[Q] Who re-verifies `clients.json` after vibe 2.25.8 (0050 item 3), and should the nulled
`effort.note` values be restored from the previous registry text?
