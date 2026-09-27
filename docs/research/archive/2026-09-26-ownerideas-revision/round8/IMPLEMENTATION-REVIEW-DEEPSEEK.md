Mode: ADVISORY
Baseline: 7b6d17a (frozen corpus); reviewed implementation tree HEAD 1fd27ce, working tree dirty
Reviewer: DeepSeek 4.1 Flash, route kilo, effort unknown, 2026-09-26 (UTC)
Scope: stage-9 implementation review of PKG-1..PKG-5 (OwnerIdeas revision, parent ownerideas-revision)
Verdict: REVIEW COMPLETE

Findings verdict: **FINDINGS** (5 BLOCKING). I planned nothing here; I certify nothing (PROTO-DEC-0079
item 6, 0086).

## 0. Baseline, concurrency, method

- [F] The tree was **not frozen while I reviewed**. Between 20:08Z and 20:41Z the operator committed
  `1fd27ce` ("checkpoint ... stages 8-11 in flight") and two other sessions kept writing:
  `task:ownerideas-r9b-repair-pkg5` (Gemini) and `r8-cert-mimo`. The runner's `STATUS.md` shows all
  three (`r8-review-deepseek`, `r8-cert-mimo`, `r9b-repair-pkg5`) WORKING simultaneously.
- [F] Reviewed state: HEAD `1fd27ce` plus the then-live working delta; the PKG-5 repair report
  `round9/REPAIR-PKG5-GEMINI.md` appeared at 20:5xZ. Digest of the reviewed implementation files:
  `fa713cd52b22b918dfce37ba427da53bfd9712c66e96cad8ded29c41b498e972` (per-file hashes in the journal
  entry). A later edit by the repairer/certifier invalidates the affected item; re-verify against the
  digest.
- [F] Method: read the contract (`round6/FINAL-RESOLUTION-CLAUDE.md`, `round6/packages/PKG-1..5.md`),
  both executor reports, the working tree, PROTO-DEC-0079..0086; re-ran the cheap validation commands
  myself; ran `validate-protocol.ps1` and `test-protocol.ps1`.

## 1. Completeness (required outputs)

| Package | Outputs | Result |
|---|---|---|
| PKG-1 | `protocol-dispatch.cjs`, `clients.json`, `bin-output-schema.md`, CLI-AGENTS §9+§1 pointer (`:50`), tests, 5 manifest entries, audit prompt | present, except F-3/F-5/F-6 defects |
| PKG-2 | `run-record.schema.md`, `protocol-runrecord.cjs`, tests, 3 manifest entries, audit prompt | present, except F-2 |
| PKG-3 | `model-ladder.json`, `wake.md`, `repair.md`, resolver tests, CLI-AGENTS §9, manifest, audit prompt | present; AC-15 differs by F-6 |
| PKG-4 | 6 changed records + new `P-L0-009` | present and conformant (see §2) |
| PKG-5 | `SIGNALS.md`, `protocol-signals.cjs`, `signals-ledger.md`, `P-L3-005`, `tests/signals.test.cjs`, manifest, fall hook | present, **except the audit prompt (F-1)** |

## 2. Conformity and scope

- [F] PKG-4 conforms: `P-L2-002` 0.5 has no `Size`, `Independent judgement` is the sixth row
  (`stage-2/P-L2-002-model-selection.md:67`), the 0072 floor text and the 0086 item 5 paragraph are
  present; `P-L3-004` 0.6 has `enforced_by: [.ai/bin/protocol-dispatch.cjs]`, R-L3-004.4/.5/.6/.8/.10
  and the suspension paragraph (`:58`); CORE-ARCH-4 §3 and CORE-ARCH-3 В-24 carry the new text;
  L0-ROOT defines R-L0-37 (`:50`) and R-L0-38 (`:86`) once; `P-L0-009` matches PKG-4 S6 (front
  matter, six headings order, R-L0-38.1-.6). No new decision, frame or model assignment was written;
  `.ai/DECISIONS.md` is untouched.
- [F] Allowed paths respected; the old runners (`run-chain.cjs`, `launch.cjs`, their tests) are
  untouched; only the designed writers touched `protocol-manifest.json` (operator at W1, PKG-3 S9,
  PKG-5 S9). No scope widening beyond the packages.
- [F] The executor reports are stale against the reviewed tree: `IMPLEMENT-E1-GEMINI.md` claims
  "405/405" and "F-1 already fixed"; `IMPLEMENT-E2-MISTRAL.md` still says PKG-4 BLOCKED and PKG-5
  S6-S9 not started. The tree carries PKG-4/PKG-5 from the continuation and the repair.
- [Q] `IMPLEMENT-E1-GEMINI.md` cites `round8/IMPLEMENTATION-REVIEW-DEEPSEEK.md` (findings F-1/F-2) as
  its source. That file does not exist in the tree and never existed in git history
  (`git log --all -- <path>` is empty). Its provenance is unverifiable in-repository.

## 3. Integration and duplicate sources of truth

- [F] W1 single-owner rule held: the eight W1 manifest entries were inserted by the operator in one
  edit (`78a22f0`). Waves are file-disjoint; PKG-3/PKG-5 in-place manifest inserts are sequential.
- [F] Dependency order held (PKG-3 after PKG-1/2; PKG-5 after PKG-2/3).
- [F] One launch path, one registry, one ladder (derived with `sectionSha256`; `ladder-stale` is
  tested), one signals grammar; CLI-AGENTS §1 now points at `clients.json` (`:50`). No second active
  canonical source was created.
- [F] `docs/ops/RUNS.jsonl` should be created by the first real dispatch (PKG-3.md:373). It exists,
  but **254 of 254 committed records are test fixtures** (F-4).

## 4. Regressions (real exit codes, this tree)

- `powershell -ExecutionPolicy Bypass -File .\validate-protocol.ps1` -> **exit 0**,
  `Protocol OK. 1 warning(s)` (119 journals over the cap 100; WARN-first per PROTO-DEC-0057/0037).
- `powershell -ExecutionPolicy Bypass -File .\test-protocol.ps1` -> **exit 0**, `# tests 415 /
  # pass 415 / # fail 0`.
- Package tests: `tests/dispatch.test.cjs` 22/22, `tests/resolver.test.cjs` 7/7,
  `tests/signals.test.cjs` 9/9, `tests/runrecord.test.cjs` 1/1 (wrapper), all exit 0.
- `check` parity holds: program `DISPATCH.json` exit 0 (slots=27); `R3-DISPATCH.json` exit 1 with
  exactly ten `launch-missing` rows and no grammar row; the fixture sha256 equals PKG-1 S3's
  `2af348...b7f`.
- An earlier full-suite run on the pre-checkpoint tree returned exit 1 (T6, `dispatch.test.cjs:179`);
  on the reviewed tree it is green. The difference is the checkpoint's test changes, but the
  non-hermetic defect (F-4) also makes the suite order/concurrency sensitive.

## 5. Findings

Severity: BLOCKING / RECOMMENDATION / NOTE.

**F-1 BLOCKING - the PKG-5 adversarial audit prompt does not exist.**
`round6/packages/PKG-5.md:101` (required output 9) and AGENTS.md §2 / PROTO-DEC-0086 item 1 require
`docs/reviews/2026-09-2?-<agent>-ownerideas-pkg-5-audit-prompt.md` (<=150 lines, one probe per
acceptance criterion). Only PKG-1/2/3 prompts exist.
Repro: `Get-ChildItem docs/reviews -Filter *pkg-5*` -> empty. `round9/REPAIR-PKG5-GEMINI.md:140-142`
claims "all confirmed PKG-5 findings are repaired"; it does not create this output.
Minimal fix: author the PKG-5 audit prompt before the PKG-5 certification; the repair's
"REPAIR COMPLETE" does not cover it.

**F-2 BLOCKING - the run-record `class` enum contradicts the schema and PROTO-DEC-0075 item 4.**
`docs/specs/run-record.schema.md:91` says `class` is `NONE`, one of the fifteen names of
PROTO-DEC-0075 item 4, or `UNCLASSIFIED`. `protocol-runrecord.cjs:69-73` validates a different set
(`NONE, STALL, TIMEOUT, FATAL, RESOURCE, PERMISSION, CONFIG, INPUT, OUTPUT, QUALITY, CHECK,
VALIDATOR, SCOPE, DEPENDENCY, CONFLICT, UNKNOWN_ERROR, UNCLASSIFIED`); `protocol-dispatch.cjs:996-1017`
(`mapClassForRunRecord`) writes those names.
Repro: `node -e` validating the first `RUNS.jsonl` record with `attempts[0].class='AUTH_ERROR'`
returns `must be one of NONE, STALL, TIMEOUT, FATAL, ...`; with `class='SCOPE'` it returns `[]`.
`RUNS.jsonl` contains `SCOPE` (95), `FATAL` (51), `OUTPUT` (24).
Minimal fix: make the record enum the 15 canonical names + `NONE` + `UNCLASSIFIED`; make
`mapClassForRunRecord` pass the canonical class through (a record is written on settlement, not on
mapping); update the golden fixture/tests that assert the wrong enum.

**F-3 BLOCKING - `bin-output-schema.md` lists twelve classes, not the fifteen of PROTO-DEC-0075 item 4.**
`docs/specs/bin-output-schema.md:27` says "twelve canonical classes established by PROTO-DEC-0075
item 4" and `:29-31` lists 12, omitting `VALIDATION_FAILURE`, `SEMANTIC_FAILURE`,
`DEPENDENCY_FAILURE`. PKG-1.md:321 (S9) requires "`class=` takes only the PROTO-DEC-0075 item 4
names", and the dispatcher itself produces `VALIDATION_FAILURE`/`DEPENDENCY_FAILURE`
(`protocol-dispatch.cjs:1012,1014`). The E1 report's F-1 claim ("updated to all 15 verbatim") is not
true of the committed file.
Repro: `git show HEAD:docs/specs/bin-output-schema.md` lines 27-31.
Minimal fix: state fifteen and list all fifteen.
(Related, **RECOMMENDATION**: `:40` names `protocol-telemetry.cjs` and `protocol-audit.cjs`, which do
not exist, and omits `protocol-scope.cjs` and `protocol-verdict.cjs`, which do; correct the inventory.)

**F-4 BLOCKING - the dispatch tests are not hermetic; they write into the canonical store.**
PKG-3.md:84-85 ("tests write to temporary directories") and PKG-5 AC-10 are violated. Several tests
invoke `run` without `--runs-file`/`--signals-file`, so the default `docs/ops/RUNS.jsonl` and
`.ai/SIGNALS.md` receive fixture data: T6 `tests/dispatch.test.cjs:174`, T23 `:769,:776,:781`, T24
`:847` (and the T7-T13 blocks). Only T20-T22/T25/T26 pass the overrides.
Repro (deterministic, this tree): before `node --test tests/dispatch.test.cjs` signals=113 / runs=268
/ `fake:test` signals=18; after 22/22 pass: signals=123 / runs=283 / `fake:test`=28 (delta +10
signals, +15 records). Consequence: commit `1fd27ce` carries 254/254 test run records and fake
`fall`/`procedure-gap` signals (participant `fake:test`) in the canonical ledger; PKG-5 AC-11's
"real `.ai/SIGNALS.md`" claim is undermined.
Minimal fix: pass `--runs-file`/`--signals-file` under the test temp dir on every invocation (or
default both under `stateDir`); reset `docs/ops/RUNS.jsonl` and `.ai/SIGNALS.md` to real content
under owner authority (they are canonical, append-only data).

**F-5 BLOCKING (registry freshness / AC-15 not reproducible) - `vibe` is pinned to a stale version.**
`.ai/docs/clients.json` records `vibe` version `"vibe 2.25.5"` (verifiedOn 2026-09-26); the
workstation reports `vibe 2.25.8`. `node .ai/bin/protocol-dispatch.cjs probe` exits 1 with
`PROBE client=vibe state=VERSION_CHANGED`. Consequently the resolver skips rung 9 (Mistral Medium
3.5, the E2 executor) and PKG-3's AC-15 expected rows cannot be reproduced:
`resolve tests/fixtures/resolver/real-ladder.json floor-t7-kernel` -> exit 1 `ASK_OWNER shortfall`
with `SKIPPED rung=9 reason=unavailable`; `floor-t3-other` -> primary `agy:gemini-3.7-flash-high`
instead of the contract's Mistral primary. The executor reported the difference (PKG-3 AC-15 permits
reporting), but the committed registry does not match the workstation it was verified on.
Minimal fix: re-verify `clients.json` on the workstation (PROTO-DEC-0050 item 3), re-run `probe` and
the two `resolve` commands, and record the new rows.

**F-6 NOTE - `clients.json` `effort.note` was nulled for `vibe` and `kimi`.**
`round9/REPAIR-PKG5-GEMINI.md:25` sets both to `null` because their `--help` shows no instruction.
PKG-5 S8 permits this, but then P-L3-005's stop condition fires for both (`how: config`, note null):
their model/effort cannot be set by the procedure. Ensure the journal records this as the S8 "finding,
not a failure", and that P-L3-005's `## Stop conditions` remain reachable for them.

**F-7 NOTE - `protocol-signals.cjs check` line accounting.** `SUMMARY lines=<n>` reported 115 while
`.ai/SIGNALS.md` then held 117 lines (4 header + 113 signals). If `lines` is meant to be the file
length, the two header blank lines are not counted. Confirm the intended meaning in
`docs/specs/signals-ledger.md`.

## 6. STOP verification

- E1's first stop (PKG-3 `WAITING_W1_GATE`) is legitimate: W2 starts after the W1 commit. E2's stops
  (PKG-4/PKG-5 blocked on PKG-1/PKG-3) were legitimate at that time. The repair's `REPAIR COMPLETE` is
  wrong on one required output (F-1). No executor stopped to avoid an enumerated STOP.
- F-3 ("check rejects ...") did not trigger: parity holds (see §4).

## 7. Open questions (no participant answers during this run)

- Whether `docs/ops/RUNS.jsonl` and `.ai/SIGNALS.md` should be reset now or left as owner data
  (F-4); the minimal fix touches canonical append-only files.
- Whether the PKG-2 schema, not the library, is authoritative for `class` (F-2); I read PKG-2 S3 as
  binding and the library as the defect.
- The provenance of `round8/IMPLEMENTATION-REVIEW-DEEPSEEK.md` cited by E1 (§2).
- Because the candidate moved during the review, any finding above must be re-checked against the
  digest `fa713cd5...e972`; a later repair/certifier edit invalidates the affected item.
