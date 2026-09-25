# Round 1 B: performance, test architecture and migration

Baseline-SHA: a4e6aef86440bc0e8da8f06c8f1d3f65af254367
Reviewed commit SHA: a4e6aef86440bc0e8da8f06c8f1d3f65af254367
Model: gpt-6-astra (launch assignment)
Model-maker: OpenAI
Client: Codex
Effort: unknown to the session; README launch assignment is xhigh
Task-frame / scope-id: task:vmc-r1-b; parent program:validator-migration-council
UTC-date: 2026-09-25
Working tree: clean detached baseline; delivery checkout dirty
Mode: ADVISORY
Verdict: RECOMMENDATION
Receipt-Owner: codex-b21040e3f1a34b22
Scope: owner sections 6, 8, 9, 14-19, 22; no implementation or certification

## Conclusion and evidence boundary

**INFERENCE / proposal:** Prefer B, a Node library and CLI with a PowerShell compatibility wrapper, introduced beside a frozen reference and switched in stages. Recommend a bounded early migration only after the timing authority and zone A's contract/platform decisions are settled. Performance supports removing repeated whole-validator work and the serial test tail; it does not establish that replacing the language alone delivers the proposed speedup. While approval is pending, use the already-approved research quick-record rule. Do not launch a rewrite from this report.

**FACT:** `MEASUREMENTS.md` M-03/M-11 give 302-322 s for recent full suites and 283 s for the serial validator test file in a 309 s run. `git diff e44686b <baseline> -- validate-protocol.ps1 test-protocol.ps1 tests .ai/bin/protocol-handoff.cjs protocol-manifest.json` is empty. Thus these measurements apply to the same code, with workload/environment limits, not to an invented newer implementation. `B-baseline-check.json` records this check, 29 input blob identities, clean start/end SHA and one permitted baseline validator run: exit 0, zero warnings. No full suite was run here.

**FACT:** All 20 tracked `tests/*.test.cjs` were included in source inspection; see the corpus table in `IMPLEMENTATION-DAG.md`. M-01/M-02 are historical aggregates, not a controlled baseline. M-16's screenshot is not stored in the repository; use the persisted samples M-15 for load claims. All `path:line` references below mean the baseline. `MEASUREMENTS.md` and `tools/ps-probe.cjs` are relative to this council directory; other paths are repository-relative. Own observation artifacts are explicitly new research outputs.

**FACT / POST-BASELINE OBSERVATION:** Delivery HEAD was `9a936ddf077793a0050597b06947bdd8650bb455`, with other sessions' changes. It was not used as the analytical baseline. No other round-1 participant's output was opened before finishing this report and the DAG.

## Constraints consumed, not a replacement for zone A's boundary

**FACT unless marked INFERENCE:** The classes below are owner section 4 classes; zone A remains responsible for the complete decision boundary and behavioural contract.

| Issue | Class | Authority / constraint used |
|---|---|---|
| Node destination and differential verification | C: approved direction, implementation open | PROTO-DEC-0025 item 5, `.ai/DECISIONS.md:1171`; do not reopen Node versus another language. |
| Advancing the scheduled port | F: reopen would be required | 0039 item 3, `.ai/DECISIONS.md:1709`; 0054's exception names 0039 item 1 and 0048 item 6, not this timing clause (`:2245`). INFERENCE: obtain a narrow timing decision; research permission alone is insufficient. |
| Research-only writes and quick Evidence | A: already decided | Owner sections 0/3; 0071 items 1-2, `.ai/DECISIONS.md:2858`; no implementation here, full record remains required for code/kernel/tooling. |
| High-risk review and independence | A | 0038 item 1 (`.ai/DECISIONS.md:1671`), 0041 items 1-2 (`:1792`), 0057 item 4 (`:2336`): unified audit and two independent parallel certifiers outside execution/control. |
| Receipt formats and hashes | A | 0039 item 3 (`.ai/DECISIONS.md:1709`): frozen; this design does not silently introduce evidence reuse/import or a new receipt schema. |
| Task-scoped historical freshness | A | 0042 items 1-5 (`.ai/DECISIONS.md:1822`): later unrelated changes do not invalidate closed tasks; current verify still checks current tree. |
| Model selection | B: active trial | 0056 item 3 (`.ai/DECISIONS.md:2305`); 0072 item 3 (`:2908`) supplies the implementation/certification T7 floor. Final task packets must be scored. |
| Two implementation streams | A | 0048 item 7 (`.ai/DECISIONS.md:2024`) retained by 0054 item 3 (`:2246`); research concurrency is a separate rule. |
| Library boundaries, scheduling and targets | D: open architecture | This report proposes them; `PROPOSAL-node-validator.md:3` is explicitly a proposal. |
| Missing-PowerShell outcome and parser/installer completeness | D | Zone A supplies approved policy. WARN plus successful certification is not assumed. |
| Per-check cost, all-descendant process count, isolated peak RAM | H: unknown | M-05/M-12/M-15 do not measure these quantities. Measurement tasks resolve them; they are not opinion polls for the owner. |

## Section 8: root cause and attribution

**FACT:** The suite discovers test files, sets `PROTOCOL_TEST_FAST_CHECKS=1`, and uses at most 16 file workers (`test-protocol.ps1:17-31`). Each helper invocation spawns synchronously, with a 120 s timeout (`tests/helpers.cjs:10-27`). Fixture construction initializes/commits Git and copies the manifest-selected runtime, tests and templates (`:40-59`, `:73-88`). Real-validator families are exempt from stubbing by filename (`:62-71`); several other tests explicitly demand real validation (`tests/gate.test.cjs:275`, `tests/registry.test.cjs:26`). This is repeated integration work, not 376 independent pure functions.

**FACT:** One completion-gate test performs many successive mutations and validations on one fixture (`tests/validator.test.cjs:40-137`). Splitting files alone does not subdivide this serial unit. Its scenarios must retain their state-transition semantics or be reconstructed as independent fixtures.

| Requested component | Measured quantity / defensible fraction | What is not measured |
|---|---|---|
| PowerShell startup | FACT: idle 162-342 ms, typically ~170 ms, five samples, M-12. INFERENCE: 300 x 0.17 is ~51 summed seconds, ~7% of M-05 or ~4% of M-09. | This is a scale estimate, not loaded startup attribution or a wall-time fraction; nested shell starts are omitted. |
| Validator work | FACT: 201 observed calls, 584.2 summed seconds, M-06; INFERENCE: ~85% of 686.4 observed PowerShell seconds, ~46% of 1,263 test-seconds. | Pure computation versus Git, I/O, child startup, parser and installer self-check is not separated. Calling all 584 s CPU computation would be false. |
| Repeated spawning | FACT: 300 observed PowerShell calls, 686.4 summed seconds, M-05; INFERENCE: ~54% of M-09. | The timer includes execution and waiting. This is not an additional disjoint category to add to the validator/installer rows. |
| Serial tests / critical path | FACT: validator file 283 s, M-11. INFERENCE: its duration is ~92% of the 309 s elapsed interval. | Other files overlap it; this is not a claim that 92% of all CPU work is serial. |
| Git | FACT: multiple discovery, history, ignore and HEAD queries occur (`validate-protocol.ps1:168-182,517-535,913,991`). | Time and fraction not measured. Fixture Git setup adds a separate cost (`tests/helpers.cjs:51-58`). |
| Filesystem I/O | FACT: repeated byte reads, text reads and corpus traversal (`validate-protocol.ps1:60-85,218-246,258-301,1063-1074`). | Time, bytes read and fraction not measured. |
| Installer tests | FACT: 86 direct calls, 95.9 summed seconds, M-07. INFERENCE: ~14% of M-05, ~8% of M-09. | This excludes installer work nested inside validator calls; it is not all installation-related cost. |
| Other components | FACT: M-08 totals ~6.3 s (~1% of M-05); M-10 gives the next-longest file at 94 s. | M-09 minus M-05 is about 577 s, an accounting remainder, not an identified component; M-10 leaves 54 s unmatched. |

**FACT:** M-05's probe wraps Node `child_process` entry points only (`tools/ps-probe.cjs:15-34`). The validator itself launches another PowerShell process for the source-role installer self-check through .NET (`validate-protocol.ps1:30-57,1077-1101`). **INFERENCE:** "300 processes" is an observed Node-to-PowerShell count, not an all-descendant census; installer work is also inside M-06. The proposal's "only syntax needs PowerShell" premise is incomplete (`PROPOSAL-node-validator.md:53-56`). Removing that self-check changes tested behaviour (`tests/validator-syntax.test.cjs:83-88`), even if syntax parsing remains.

| Simultaneous agents each requesting a suite | Finding |
|---|---|
| 1 | FACT: M-03 302-322 s; unrelated applications present. |
| 2 | OPEN QUESTION: not measured. INFERENCE: contention likely below or comparable to three at equivalent load; neither latency nor a linear interpolation is established. |
| 3 | FACT: M-14 445/447/450 s, all 376 tests passed. INFERENCE: ~1.4-1.5x individual latency versus M-03; about 2.0-2.1x aggregate throughput versus running three serially, at a substantial resource cost. |
| 6 | INFERENCE, unmeasured: up to 96 nominal file workers (6 x 16) competing on 32 logical CPUs; longer parallel phase and greater memory pressure likely. No numeric completion forecast. |
| 8 | INFERENCE, unmeasured: up to 128 nominal workers; the same risk is greater, including helper timeouts. These are worker limits, not measured OS process counts. |

**FACT:** M-15 sampled CPU at 100% repeatedly and free RAM as low as 3.4 GB, followed by a 15-30% CPU tail. **INFERENCE:** CPU is a demonstrated early bottleneck and file-level serial work explains the tail; RAM is a headroom risk. There is no evidence separating I/O saturation, paging or a process-count limit. Idle CIM timing M-13 concerns the launcher, not a measured validator bottleneck; do not migrate that subsystem here.

| Change | Specific benefit and limits |
|---|---|
| Node CLI replaces PS CLI | INFERENCE: idle startup difference is only ~70-95 ms per call; roughly 14-19 summed seconds for 201 validator calls if portable to this workload. Node computation speed and surviving subprocess cost are unmeasured. |
| In-process validate() | INFERENCE: removes even the Node CLI boundary for these callers, enables direct module tests and a single per-invocation read context. Does not remove Git, parser or installer checks automatically. |
| Split slow tests | INFERENCE: directly attacks M-11 without an engine rewrite. With unchanged per-test costs, 1,263/16 is ~79 s of ideal balanced worker time; an unsplit 94 s syntax file remains a lower bound, plus overhead. Therefore ~94 s is an optimistic model, not a promised result. |
| Eliminate duplicate validation logic | INFERENCE: primarily reduces drift and review cost; no measured latency saving. `protocol-handoff.cjs:889` explicitly duplicates the path contract. Keep the frozen PS oracle independent until parity/certification; do not make both engines call the new implementation to manufacture parity. |
| Cache | HYPOTHESIS: memoizing repeated reads within one invocation helps. Reject persistent result caches initially: filenames, contents, HEAD, ignore rules, environment and symlink targets all affect checks. Benefits are unmeasured; cache cannot substitute for a stable candidate. |
| Reduce full-suite frequency | FACT: 0071 already permits research quick records. INFERENCE: avoids roughly five minutes per such record (M-03), without a port. No measured number of avoidable research runs exists; 12.1 historical hours is not all reclaimable. |

**INFERENCE:** The largest independently available change is applying 0071; the strongest code-level experiment is splitting validator workloads and making fixture intent explicit, under the full tooling review requirements. Neither provides cross-platform completeness. A claim that either yields 80-90% of migration's benefit is unsupported until the relevant benefit and candidate are measured.

## Section 9: alternatives on all fourteen criteria

**INFERENCE / design comparison:** A is an interim optimisation, not repudiation of the approved Node direction. C means prolonged maintenance of two complete engines, not B's temporary frozen oracle. D means a separate language-neutral rule representation/execution layer plus platform adapters; merely separating Node modules is already B. No evidence warrants E.

| Criterion | A: optimise PS/tests | B: Node library + CLI + PS wrapper | C: long-lived dual engines | D: neutral core + adapters |
|---|---|---|---|---|
| Correctness | Preserves engine, scheduling still needs checks | Single normative implementation after proved cutover | Detects some divergence, retains common-mode risk | Adds rule interpreter/schema correctness burden |
| Behavioural compatibility | Closest existing behaviour | Requires frozen A contract and differential fixtures | Easy legacy route, risk of differing authority | Requires semantic translation and adapter parity |
| Migration risk | Lowest immediate scope | Bounded staged changes | Higher ongoing synchronization risk | Largest novel abstraction |
| TCB size | Existing PS/Node duplication remains | Eventually smaller semantic engine; external checks remain | Largest executable duplication | Interpreter, rule data and adapters all trusted |
| Cloud compatibility | Still needs PS | Core works without PS; required external checks constrain completion | Node path usable, reference needs PS | Portable core, same external-check constraint |
| Windows compatibility | Existing path | Keep wrapper, PS5.1/parser and real installer integration | Existing PS fallback available | Adapter implementation and test burden |
| Performance | Scheduling gain; same per-call work | Removes repeated CLI/runtime work when callers migrate | Differential operation slower during overlap | Unmeasured; abstraction does not imply speed |
| Testability | Strong black-box tests, coarse isolation | Direct rule tests plus CLI/platform/installed integration | Broad matrix but duplicated fixtures/runs | Good rule isolation plus interpreter tests |
| Maintainability | Monolith remains | Five cohesive modules, one authority | Fixes must be kept consistent twice | More framework concepts to maintain |
| Duplication | Present duplication remains | Temporary oracle, then remove only covered copies | Deliberate long-term duplication | Risk of duplicated adapter logic |
| Rollback | Revert test changes | Restore whole pre-switch release/cohort | Route back only if artefacts remain compatible | Must roll back rule data and adapters together |
| Review burden | Lower scope, still protected tooling | Concentrated equivalence/caller/platform review | Permanent two-engine reviews | New language/schema and migration review |
| Context complexity | Current large validator | Small fixed dependency graph | Two implementations plus divergence ledger | Rule representation plus host implementations |
| Long-term cost | Delays approved consolidation | Lowest plausible maintenance after measured transition | High recurring parity and maintenance cost | Unjustified framework investment for this corpus |

## Section 14: quick, full and shared results

**FACT:** `checksFor()` selects only validation for quick; source full adds the suite; installed full omits source tooling; both full roles add configured `testCommand` (`.ai/bin/protocol-handoff.cjs:25-47`). Quick explicitly records that regressions were not run (`:109-133`). Both quick and full record set `PROTOCOL_SKIP_GATE=1` for the validator check (`:94-103`), omitting its recursive receipt-freshness call while retaining structural completion checks (`validate-protocol.ps1:583-868,869-888`). Full does not mean that this recursive gate ran.

**INFERENCE:** Quick attests the actually-run validator outcome and an entry/tree digest. It does not prove regression behaviour, host tests, differential parity, independent certification, or fresh completion receipts. A successful quick record is not sufficient evidence of candidate acceptance. Preserve the separate `verify --deep` and `gate-check` closure steps and the deadlock regression (`tests/gate.test.cjs:275-311`).

| Task class | Current permitted treatment (FACT from 0071 / AGENTS section 7 unless noted) |
|---|---|
| This research/design/council frame | Quick; no fresh full-suite run is needed for these reports. |
| Code, kernel records, protocol tooling, validator, wrappers, test helpers | Full record; targeted development checks do not replace it. A test-only scheduling change is tooling work. |
| Other documentation/configuration outside a research frame | No general quick exemption established by 0071. Use the ordinary required checks; risk-scaled peer review does not itself waive testing. |
| Installed product code | Full installed record plus native host tests; source suite remains in the source repository. Missing `testCommand` does not mean no product tests are required. |
| Multiple researchers | Share the coordinator's measured result as cited research input; each writes its own quick receipt. |
| Multiple implementers/certifiers | No existing imported-result option in `record` (`protocol-handoff.cjs:676-718`). Do not copy another owner's Evidence or silently replace mandatory full records with quick. Serialize expensive runs on this workstation while independent analysis proceeds in parallel. |

**INFERENCE / future extension, excluded from this migration:** A shared test attestation would need code/test/fixture/manifest digests, command/flags, toolchain, OS, relevant environment, full logs, exit and skip inventory, and identical start/end state. Rerun after any relevant change. **FACT:** current `record` takes its anchor after checks (`protocol-handoff.cjs:717-721`); it does not prove the tested tree was stable throughout. Use an isolated unchanged candidate and explicit start/end checks; neither a matching SHA alone nor a later digest fixes a moving-tree test. PROTO-DEC-0042's historical freshness rule is not permission to reuse results for changed candidates.

## Sections 16-17: minimum modules and proposed API

**INFERENCE / proposal, conditional on A's contract:** Keep five modules and one one-way dependency graph. No new rule language, daemon, persistent cache or dependency package is justified. Module ownership and exact future task paths are in the DAG.

| Proposed file | Responsibility and baseline cohesion |
|---|---|
| `.ai/bin/protocol-validate.cjs` | Public synchronous API, fixed check order and CLI renderer; no auto-run on require. Calls the four modules below. |
| `.ai/bin/validator/repository.cjs` | Manifest/ownership, Git discovery and history, safe paths, read context and installed digests (`validate-protocol.ps1:88-214,948-986`). |
| `.ai/bin/validator/text.cjs` | Pure byte/UTF-8/BOM/NUL/LF/ASCII and line-count rules (`:60-72,215-247,304-316`); reports PS files to platform module. |
| `.ai/bin/validator/governance.cjs` | Decisions, registry, task/review structure and document budgets (`:249-315,420-890,988-1074`); consumes read context, delegates receipt verification. |
| `.ai/bin/validator/platform.cjs` | Hook configuration/imports, Node/Bash probes and syntax, PS parser and source installer self-check (`:318-419,893-946,1077-1101`). No new cross-platform framework. |

**INFERENCE / API draft:** `validate(root, options = {}) -> ValidationResult` is synchronous because existing callers are synchronous; no benefit for asynchronous complexity is measured. `root` is an explicit absolute repository root, never process-wide `chdir`. `options.env` is an invocation-local copy of the environment; CLI defaults to a snapshot of `process.env`, preserving existing relevant inputs including `PROTOCOL_SKIP_GATE` and the selected PowerShell executable. Options cannot silently skip rules. A trusted integration adapter supplies the existing gate callback; record uses the current recursion-suppression mode. The validation modules do not import handoff, lock or session code. Default standalone CLI invokes the gate tool at its existing boundary, preventing a new require cycle.

**INFERENCE / result draft:** `{diagnostics, counts:{pass,warn,fail}, exitCode, coverage}`; a diagnostic is `{id, status:'PASS'|'WARN'|'FAIL', path?, message}`. IDs are stable per frozen contract check; `coverage` records executed/unavailable checks, not a new success authority. Exit 0 means no failing required check; exit 1 means validation failure, invalid invocation or required execution failure. Do not borrow the verdict tool's unrelated exit-2 semantics. A's approved missing-capability rule must be encoded before exposing no-PowerShell success. In its absence, required unavailable checks fail closed rather than inventing a warning exemption.

**INFERENCE / boundaries:** The library returns diagnostics without printing, changing environment, writing files, exiting, or retaining cross-call mutable state. Expected filesystem/process errors become named diagnostics; programming faults throw and the CLI returns nonzero. Internals receive a narrow reader/runner for unit fault injection, not an arbitrary public plugin API. Real Git argv arrays, NUL path lists and real symlink/reparse checks remain integration-tested. Read each file at most once per invocation where consistent with A's semantics; this is a read cache, not an atomic filesystem snapshot.

**INFERENCE / CLI draft:** `node .ai/bin/protocol-validate.cjs [--root <absolute-path>] [--quiet]`, defaulting to its installed repository root; the legacy `powershell -File validate-protocol.ps1 [-Quiet]` still uses its own script root and forwards arguments and exit. Return existing headers, `[PASS]/[WARN]/[FAIL]` messages and summary grammar in UTF-8; quiet suppresses PASS lines only, not warnings/failures/root/summary (`validate-protocol.ps1:19-27,124-125,1104-1109`). No JSON CLI, streaming callback or additional success mode is necessary now. Ordering/locale normalization is A's parity contract, not an excuse to discard diagnostics. Legacy receipts keep their check labels and format unless separately approved.

**INFERENCE / tests:** Move byte/grammar/path scenarios to direct module tests; split integration families into encoding/runtime, governance/decisions and completion/reviews with explicit real-validator fixture intent. Preserve every scenario through a coverage map, including stateful mutation sequences, installed-role digest/upgrade tests, source self-check failure, Unicode paths, actual protected filenames, negative subprocess failures and the real record/gate cycle. Keep CLI/wrapper smoke tests and actual PS parser/installer tests. Use injected boundaries only for unit tests, never label stubbed validation as real parity. Existing filename-based stubbing makes renames hazardous (`tests/helpers.cjs:62-91`).

## Section 18: targets and acceptance experiment

**INFERENCE / proposed gates, not measurements:** Freeze measurement commands and the acceptance workload in phase 0, before optimisation. Let Bv/Bs/Bp/Bn/Bm be paired reference medians for validator/suite/observed PS calls/all children/peak process-tree memory. Existing evidence sets scale, not precision; unavailable baselines below must be measured by the coordinator before their gate is claimed. Compare three matched reference/candidate pairs, one suite at a time, same workstation/toolchain/corpus/flags, with load, skips and failures logged. Benchmark the normal full suite separately from the deliberately expensive differential qualification lane; report both costs. Never meet a target by reducing required scenario/platform coverage.

| Metric | Baseline | Required target and fail threshold | Stretch target | Method / purpose |
|---|---|---|---|---|
| Real-tree validator wall | M-01 coarse ~3 s, 2-12 s; Bv not yet isolated | Candidate median <= Bv; >Bv fails non-regression | <=1 s, HYPOTHESIS | Same required checks and real tree, monotonic timing; distinguish library from CLI. Protect frequent handoff latency. |
| Full normal suite wall | M-03 302-322 s; M-05 309 s | Candidate median <= Bs; >Bs fails; demonstrate reduced validator serial tail | <=120 s, HYPOTHESIS | Same logical scenarios, fixed worker cap, per-file durations; qualify differential lane separately. |
| Observed Node-to-PS calls | M-05 300 = 201+86+13 | <=300 on comparable baseline workload; added qualification-only cases reported separately | <=120 after module-test conversion; not a promise | Same preload boundary and category ledger. No test deletion to reduce count. <=20 is incompatible with 86 retained installer calls alone. |
| All descendant children | Not measured; Bn required | Candidate <=Bn on equivalent workload; an unknown Bn prevents this claim | No number justified yet | Coordinator process-start tracing plus parent IDs, including .NET-launched PS/Git/Node; distinguish concurrent peak from total births. |
| Concurrent agents | M-14 three suites 445-450 s, all pass; 2/6/8 unknown | Research uses quick; one full suite at a time. Zero overlap in prescribed schedule, zero timeout/OOM | Better throughput after controlled 2/3 run; 6/8 deferred | Compare queue wait plus execution, never queue time alone. New concurrent suites require coordinator approval under COMMON section 5. |
| Memory | M-15 workstation minimum 3.4 GB free at three suites; isolated Bm unknown | Candidate median peak tree RSS <=Bm; any OOM fails | Additional headroom, no invented MB target | Process-tree/OS measurements with unrelated load reported; 88% workstation usage is not suite-only RAM. |
| No-PowerShell execution | Handoff always spawns PS (`protocol-handoff.cjs:89-105`); source self-check and parser need it | Library/import and portable checks run; required unavailable capabilities visible and non-green unless A/owner authorizes an exact alternative. Hidden skips fail | Complete allowed cloud record, after approved platform contract | Hermetic missing-executable fixture, source and installed separately, invalid PS fixture; full suite also retains installer/PS requirements. |
| Differential mismatch | No Node candidate; not measured, not zero | 0 unexplained mismatches and 0 missing required fixtures/platform checks; any fails | Same zero | Independently run frozen reference and candidate per A's normalizer and defect-disposition ledger; retain all raw outputs. |

**INFERENCE:** Non-regression is a conservative mandatory performance floor; 120 s/1 s remain stretch goals rather than fabricated forecasts. Early migration must also deliver the structural benefit of one callable engine and an approved portable-check boundary. If a shorter payback is made a launch condition, its numerical budget belongs in the final owner-approved plan. Current evidence cannot compute engineering/review break-even cost. Differential migration initially costs more test time, not less.

**INFERENCE / measurement boundary:** During overlap, qualification includes both ordinary regressions and the differential lane; record their combined elapsed cost as well. The <=120 s target refers to the eventual normal regression workload, not a claim about dual-engine qualification. The baseline runner discovers every `*.test.cjs` (`test-protocol.ps1:17`), so any future lane selection must be explicit, independently checked, and preserve all pre-existing scenarios in the normal lane; omitting the new parity lane can never qualify a migration candidate. Do not compare a new subset command against the old full-suite time without this coverage accounting.

## Section 19: phased migration

**INFERENCE / draft:** Each row has the seven requested properties. The old engine is authoritative until an explicitly qualified switch. Source-of-truth here means operational engine; approved behavioural rules always outrank either implementation. All phases retain the frozen contract, receipt format and independent reference. "Two certifiers" always means two parallel independent sessions outside authorship/execution/control, not two full suites fighting for the workstation.

| Phase | Entry | Allowed changes | Exit | Rollback point | Old/new authority | Verification | Certification requirement |
|---|---|---|---|---|---|---|---|
| 0: freeze | Timing/scope decision and A deliverables accepted | Contract, fixture map, API, measurement plan; no active runtime switch | Every caller/platform/side effect mapped; oracle SHA+hashes and exception ledger frozen | Unchanged baseline | Old | Scenario inventory and oracle placement preserve root/Git/installed-digest semantics; no shared new-rule helper | Plan adversarial review; no completion claim for runtime |
| 1: beside old | Interfaces and file owners frozen | Four modules, entry API, own tests in isolated candidate | Direct tests and import purity pass; no active caller change | Drop candidate branch; retain records | Old; Node experimental | Unit tests, actual integration boundaries, explicit real/stub labels | Reviewer checks stage; two-certifier gate before any operational adoption |
| 2: differential | Both engines and independent fixtures available | Test harness/fixtures, fixes explicitly tied to mismatch rows | Zero unexplained mismatch and complete A-required platform coverage | Phase 0 old release | Old; Node shadow | Positive/negative corpus, real tree, source/installed, mutation/false-green tests; timeout or skip is not equality | Reviewer closes defects; preserve exhaustive raw package for final certifiers |
| 3: direct callers | Phase 2 exit | Candidate-only test/handoff caller adapters; no evidence-format change | Same full/quick selection, failure propagation, fresh gate and no cycle | Whole pre-switch cohort, including manifest/callers | Candidate uses Node; deployed old remains | Full record, verify/gate, installed host test selection; compare outputs/digests | Unified review covers adapters; no deployment before phase 5 certification |
| 4: wrapper/package | Phase 3 exit and approved PS boundary | ASCII compatibility wrapper, manifest-managed modules and test runner adapter if in approved scope | Clean install/upgrade/partial-upgrade/rollback fixtures pass | Whole pre-wrapper release; not wrapper-only downgrade | Candidate Node with explicit PS boundary; old reference frozen | Windows PS5.1, available pwsh, Node CLI, subdirectory/Unicode roots, unavailable runtimes | Both certifiers receive this final candidate plus phases 1-4 evidence |
| 5: qualify/observe | Integrated candidate frozen | Qualification reports; after approval, bounded source and disposable installed use | Correctness, performance floor, rollback drill and independent acceptance satisfied | Previously accepted full release | Switch operational authority only after acceptance; never run-time roulette | Full and differential lanes, negative cases, start/end identity, approved no-PS contract; real consumer upgrade stays in its own task | At least two independent parallel certifiers; controller cannot sign either |
| 6: retire copies | Phase 5 accepted and observation cases complete | Remove only covered duplicated production logic; retain historical oracle and logs | One production semantic authority; active runner no longer needs dual engine on every ordinary edit | Accepted pre-retirement candidate | Node; frozen PS remains test/history reference, not second production engine | Re-run parity and full suite; prove retained negatives and failure paths; rollback drill | Retirement is a new protected candidate and needs its own/batched two-certifier acceptance before landing |

**INFERENCE / observations and stop rules:** Require successful fresh source validation, default/quiet CLI, research quick record, full source record, installed full record with a deliberately failing host command, actual PS parser failure, installed upgrade/partial-upgrade and rollback cases. No arbitrary week-long wait is justified. A P0 change to the reference creates a new declared baseline and invalidates affected parity/performance results; re-review that delta without erasing prior attempts. Stop on unexplained mismatch, false green, missing required capability or a test run over a changing candidate. Freeze does not authorize hiding an existing defect; A adjudicates whether its fix is separate.

## Handoff and remaining questions

**INFERENCE:** `IMPLEMENTATION-DAG.md` is the dependency/ownership draft. It honours two edit streams, assigns every shared integration surface to one integrator, and keeps independent qualification/certification outside that integrator. It is not a dispatch or authority to edit those files now.

**OPEN QUESTION for zone A / later synthesis:** Set the exact required-check policy without PowerShell, including the source installer self-check and full-suite/doctor callers, not only syntax. Decide accepted defects and parity normalization. Until then no claim of complete no-PowerShell Evidence is justified. These are pending independent inputs, never presumed agreement.

**OPEN QUESTION for coordinator, not owner:** Before implementation performance gates, measure per-check and all-descendant costs/isolated RAM in one approved instrumented run. No fresh suite is needed to support this round's qualitative choice: the static code matches the measured code. If requested later, the baseline suite command is `powershell -NoProfile -ExecutionPolicy Bypass -File .\test-protocol.ps1` from an isolated frozen checkout; use the existing probe for comparable direct PS counts and a separately specified OS process trace for descendants. Do not call the former an all-process measurement.

**OPEN QUESTION surviving the owner filter:** Whether to advance the Node migration timing before the pilot report, with the exact bounded scope accepted by the final council. This report raises no request to reapprove Node, research quick records or independent certification. Library module names, task scheduling and target instrumentation are technical proposals to resolve in synthesis, not extra owner polls.
