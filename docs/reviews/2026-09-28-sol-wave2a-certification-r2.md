# ROADMAP-1 wave 2A frozen-candidate certification, round 2 (Sol)

- Reviewed commit SHA: `9bf15ae46d444d583c0760e52435e1ab427e2c6e`
- Current dispatch HEAD: `9eb8643d855a72f4ce1b5f695d6116a9f25b57a7` (two round-2 launch documents only)
- Working tree status: dirty only with this certifier's journal and review while the report was written
- Reviewer: GPT-5.6 Sol; provider OpenAI; client Codex
- Model provenance: active rollout `01a0e89f-9c8e-7c71-ad86-620d85497ffd` records `model=gpt-5.6-sol`, `effort=medium`
- Date (UTC): 2026-09-28
- Scope: independent repeat certification of wave 2A items A-G, fix delta `5ce5219..9bf15ae`, and round-1 closure items
- Mode: CERTIFYING
- Receipt-Owner: `codex-2386381c48088cee`
- Verdict: RECOMMENDATION

## Executive result

The two round-1 blockers are closed on the frozen candidate. W5 test runs no longer import the fake
journal into the tracked checkout: the complete dispatch suite passed 29/29, and an independently
terminated run produced 98 in-run samples with zero journal/status sightings and no residue after
termination. S-7 now bounds every `--one` scenario child, including the two `own` watchdog cases, to
four: an external spawn wrapper measured `EXTERNAL_PROBE_MAX_ONE=4`, the harness reported its own
`PROBE_MAX_ONE=4`, and every scenario passed.

No mandatory defect was reproduced. The remaining findings are LOW documentation/test-coverage
items or INFO/environmental observations. They warrant a RECOMMENDATION rather than FAIL under
PROTO-DEC-0041 item 4.

## Baseline, independence, and authority

- `git diff 9bf15ae..HEAD` contains only `LAUNCH-2A-CERT2-MIMO.md` and
  `LAUNCH-2A-CERT2-SOL.md`; candidate code is exactly the tree at `9bf15ae`.
- Before code inspection, the active rollout confirmed GPT-5.6 Sol, Medium, Codex. This reviewer
  did not read the parallel round-2 certifier's artifact.
- The initial tree was clean except for this session's newly created journal.
- The current branch's `.ai/DECISIONS.md` ends at PROTO-DEC-0086. The launch-cited accepted blocks
  0090, 0096, and 0098 were verified from reachable Git objects `f93ac04`, `78c5acb`, and `ee72107`,
  but are not present in candidate/HEAD. The owner's direct dispatch plus the launch file authorizes
  this certification; bringing those decision blocks into the integration branch remains a
  non-candidate integration recommendation.

## Per-item verdicts

### A. W0 Codex usage parser - PASS

- The W0 test passed in both the focused dispatch run and the 422-test source suite.
- Direct probes produced: `7,654.` -> 7654; `10.644` -> 10644; `1.25k` -> 1250; `2M` ->
  2000000; nonnumeric input -> `found=false`; `5k` plus the real `252` NBSP `154` pair -> 257154
  with exact raw matches preserved.
- Mutating a real record to `rawUsage: 42` produced
  `root.attempts[0].rawUsage: must be a string or null`, agreeing with the schema.

### B. W5 hermetic fixtures and round-2 fix - PASS

- Blob comparison: old fixture paths 40, new paths 40, mismatches 0; `DISPATCH.json` still has 38
  slots. The archive INDEX diff appends only CR-W5-1 and leaves CR-F01-1 untouched.
- Fix `6364322` adds `PROTOCOL_JOURNAL_IMPORT_ROOT`; unset behavior remains `repoRoot`, while the
  suite binds imports to its temporary root. Every prior fake-journal cleanup now targets that root.
- `node --test tests/dispatch.test.cjs`: 29/29 PASS, exit 0. Normal completion left no fake journal.
- Killed-run reproduction: the suite was observed every 200 ms for 25 seconds, then only its exact
  process tree was terminated. Result: 98 samples, `JOURNAL_SEEN=0`, `STATUS_SEEN=0`, and both
  post-kill checks false.
- Sol round-1 item B and F-2A-03 are CLOSED.

### C. W1-retire - RECOMMENDATION

- Commit `cf99cdf` changes only `run-chain.cjs` by one header line and keeps the historical file.
  No active executable invokes it; remaining references are prose, historical records, fixtures,
  and the retired file itself.
- Implementation intent passes. F-2A-01 remains open because `W2A-EXECUTION.md` incorrectly says
  CR-F01-1 was updated and quotes a different retirement line than the committed text.

### D. Canonical RUNS store repair - RECOMMENDATION

- RUNS validation: 2 valid, 0 invalid. Report rendered both records. Both launch SHA-256 pins match
  their current launch files.
- Unsafe `runsFile` values (`../`, absolute POSIX, drive-letter, empty, null) were rejected; the
  safe canonical relative path was accepted. Code and T30 confirm CLI > environment > dispatch >
  default precedence and null-safe early-return fields.
- F-2A-05 remains OPEN, LOW: T30 exercises `dispatch.runsFile`, not a dispatch with no `runsFile`.
  The bare default append path therefore still lacks a direct committed regression assertion.

### E. S-7 throttle and round-2 fix - PASS

- `launch-test.cjs --pure`: 55 PASS, exit 0; `--one zz-t1`: exit 0.
- External full-run instrumentation observed active counts 1 through 4 and
  `EXTERNAL_PROBE_MAX_ONE=4`; the harness also emitted `PASS S-7 ... PROBE_MAX_ONE=4` and every
  scenario line passed.
- Both `own` scenarios now enter the shared queue. `spawnOne` is the single `--one` spawner; its
  guarded release handles `exit` and `error`, and the pool decrements at that same release event.
- Sol round-1 item E is CLOSED.

### F. S-10 vibe registry note - PASS

- Resolver tests: 7/7 PASS. Registry load/validation accepts all eight clients.
- Exact fields are `never edit an entry after record; add a new entry` and
  `supports --resume [SESSION_ID]; never edit an entry after record; add a new entry`.
- The sandbox probe reported ABSENT because child spawn was blocked; the required unsandboxed local
  probe returned `PROBE client=vibe state=OK version="vibe 2.25.8"`.

### G. Range hygiene - RECOMMENDATION

- Fix commits are scoped: `6364322` changes dispatcher plus dispatch tests; `b26b177` changes only
  the launch harness. Later commits through `9bf15ae` are journals, launch/review documents.
- No PowerShell file changed in the candidate range. UTF-8/LF/PowerShell checks pass. Historical
  Markdown trailing-space findings are not code corruption.
- Validator exits 0 with one environmental warning: 108 journals exceed cap 100. Full source suite
  passes 422/422. The fix-range history is linear.

## Known-item closure table

| Item | State | Certification disposition |
|---|---|---|
| Sol B / F-2A-03: tracked-tree fake journal | CLOSED | temp-root binding; normal and killed runs clean |
| Sol E: S-7 measured six children | CLOSED | external and internal probes both measure four |
| F-2A-01: execution-report accuracy | OPEN LOW | INDEX and retirement-line descriptions diverge from tree |
| F-2A-02: undisclosed `getRepoRoot()` refactor | OPEN LOW | behavior independently confirmed; reporting omission remains |
| F-2A-04: local reset in historical reflog | CONFIRMED INFO | final candidate history is linear |
| F-2A-05: no direct bare-default RUNS assertion | OPEN LOW | implementation works; committed coverage remains incomplete |
| F-2A-06: journal-count warning | OPEN INFO | 108 > 100, WARN-first, validator exit 0 |

## Checks run

- `node --test tests/dispatch.test.cjs`: 29/29 PASS, exit 0 (142.4 s).
- Killed dispatch-suite sampler: 98 samples, no tracked-tree fake journal during or after.
- `node --test tests/resolver.test.cjs`: 7/7 PASS.
- `launch-test.cjs --pure`: 55 PASS; `--one zz-t1`: exit 0; externally instrumented full suite:
  all PASS, maximum four simultaneous `--one` children.
- RUNS validator/report, unsafe-path probes, parser/schema probes, 40-blob comparison, pin-hash
  comparison, commit/range/reflog/scope inspection, and registry/probe checks as described above.
- `validate-protocol.ps1`: exit 0, one environmental warning (108 journals).
- `test-protocol.ps1`: 422/422 PASS, exit 0 (509.4 s).

## Final verdict

RECOMMENDATION. The frozen candidate `9bf15ae` has no reproduced mandatory defect and both round-1
blockers are closed. The LOW/INFO residuals should be carried forward without modifying frozen
historical reports. Under PROTO-DEC-0098 item 5, this verdict may be combined only with the other
independent certifier's frozen verdict; this report alone does not authorize merge or completion.
