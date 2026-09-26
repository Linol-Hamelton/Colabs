# Round 3 synthesis B

Baseline-SHA: a4e6aef86440bc0e8da8f06c8f1d3f65af254367
Reviewed commit SHA: a4e6aef86440bc0e8da8f06c8f1d3f65af254367 (Part 1); cd90be1d3c1fede4e02f7ecff5b6507ea1f34338 (Part 2 inputs)
Model: gpt-6-astra (slot assignment; system identifies GPT-6)
Model-maker: OpenAI
Client: Codex
Effort: unknown to session; assigned high in the launch table, not independently observable
Task-frame / scope-id: task:vmc-r3-b; parent program:validator-migration-council
UTC-date: 2026-09-25
Working tree: dirty delivery checkout; HEAD at start cd90be1d3c1fede4e02f7ecff5b6507ea1f34338
Mode: ADVISORY
Verdict: RECOMMENDATION
Receipt-Owner: codex-ebacaa892db4dcce

FACT: All 13 CORPUS.txt byte hashes matched at entry; the end check is in `docs/research/2026-09-25-validator-migration-council/round3/B-input-check.json`. All listed round-1/round-2 inputs were read. Other round-3 syntheses were not opened. This session authored neither the proposal nor council package.
FACT / evidence convention: Code citations in Part 1 refer to the baseline; frozen corpus citations refer to CORPUS.txt identities and are POST-BASELINE INPUTS. Part 2 citations refer to cd90be1, explicitly POST-BASELINE INPUTS. Current Git documentation and this session's read-only probe are external/current observations, not baseline repository facts. No implementation, publication or full suite was performed.
FACT / POST-BASELINE OBSERVATION: During close-out another session appended PROTO-DEC-0073 to the working `.ai/DECISIONS.md` (generic dispatchers take task content from external input files) and changed the drafting-model route in R3-ADDENDUM.md. Neither changes this slot's frozen inputs or conclusions; a future publisher/launcher implementation must obey the new external-task-data rule. No peer synthesis was read while checking this governance delta.
INFERENCE: Recommendations below are proposals for the draft, never approved decisions. A frozen report's assertion is evidence to examine, not authority. Majority support does not resolve a contradiction.

## Part 1: Validator migration

### 1. Timing: bounded early migration, conditional on authority

FACT: Node and differential verification are already scheduled by `.ai/DECISIONS.md:1171-1172`; the after-pilot timing is explicit at `.ai/DECISIONS.md:1709`. CORE-ARCH's freeze exception covers item 1 of 0039, not expressly its item 3 (`.ai/DECISIONS.md:2243-2247`).
INFERENCE: Recommend advancing this bounded migration inside CORE-ARCH, with an explicit timing supersession and registry trigger before code. Until then preserve current operational timing. The structural reason is a callable single validation authority; speed alone does not establish urgency. Research authorization is not implementation authorization.
FACT: M-03/M-11 in `docs/research/2026-09-25-validator-migration-council/MEASUREMENTS.md` report 302-322 s suites and a 283 s serial validator file in a 309 s run. M-12 measures idle runtime startup, not loaded check cost. `tests/helpers.cjs:62-92` puts stubs under the validator filename; M-06 therefore mixes real/stub invocations. The Node probe misses .NET descendants (`docs/research/2026-09-25-validator-migration-council/tools/ps-probe.cjs:15-34`; `validate-protocol.ps1:30-57`).
INFERENCE: Accept challenge-B's attribution correction. Withdraw real-validator cost shares and the call graph's asserted spawn dominance: per-check costs remain unknown. CPU saturation is observed in M-15; RAM is a headroom concern, not an established sole bottleneck. Two/six/eight simultaneous suites remain unmeasured.
INFERENCE: Preserve C's simpler test-split experiment. Its 80-90% benefit and <120 s outcome are unproved. Challenge-C overreaches when it treats questioning timing as reopening the Node destination (`docs/research/2026-09-25-validator-migration-council/round2/challenge-C.md:17-24`): these are distinct propositions. A qualified scheduling experiment can precede porting under the same bounded authorization; it is not free tooling work outside the freeze.

### 2. Exact scope and non-scope

INFERENCE: NOW, after approval: Node core + CLI, compatibility wrapper, minimal handoff caller adapter, explicit fixture modes, preserved test scenarios, manifest packaging, differential harness and narrowly necessary gate deduplication. The test-split experiment is an independently reversible predecessor, not mixed into the caller switch.
INFERENCE: Keep `setup-ai-protocol.ps1` implementation and its source self-check. Installer migration LATER; retaining its invocation is not migrating the installer. Keep `test-protocol.ps1` orchestration; test-file redistribution/qualification wiring NOW, a new general Node suite runner LATER. No unsupported cloud full-suite claim.
INFERENCE: Full snapshot/evidence/gate decomposition of handoff remains a separate approved-direction backlog item under `.ai/DECISIONS.md:1709`; only extracting the shared completion predicates and safe-path check is a migration dependency. Launcher inspection, process-liveness extraction, other PowerShell rewrites, MCP, AX, Rust and build-system redesign are outside this migration. Rust would require reopening the Node decision; lack of evidence is not a permanent NEVER ruling.
FACT: The installer self-check explicitly guards an earlier false green (`validate-protocol.ps1:1085-1100`). M-07 reports 86 calls/95.9 summed seconds; this refutes the frozen non-scope document's rationale that installer calls are rare, without requiring its rewrite.

### 3. Behavioural contract and defect disposition

INFERENCE: Use CM-01..49 as the coverage seed, not as an infallible normative specification (`docs/research/2026-09-25-validator-migration-council/round1/VALIDATOR-CONTRACT-MAP.md:29-78`). Freeze INPUT, precondition, class/message/exit, side effect, caller and authority per row. Independent expected results come from decisions plus real caller/tests, not copying OLD output. Every row has one implementation owner and a fixture or a reviewed non-executable obligation.
INFERENCE: Preserve manifest role/required files; true Git root and linked-worktree behavior; tracked/untracked/ignored journal inclusion; ownership exclusions; strict bytes, UTF-8/BOM/NUL/CR/ASCII; native syntax; safe paths/reparse handling; line/count/byte budgets; decisions/supersedes/registry/immutability; source/installed gates, receipts, protected paths, hook/runtime probes, ignore probes, version coherence and installed digests. Preserve all WARN/FAIL distinctions and counts, output ordering and Quiet semantics for the supported reference environment.
FACT: Root is script-relative, not caller cwd (`validate-protocol.ps1:11`); native checks and source-only installation checks are real behavior (`validate-protocol.ps1:237-245,1077-1109`). CI rejects WARN as well as FAIL/nonzero (`.github/workflows/protocol.yml:28-36`). Therefore exit 0 and certification readiness are not synonyms.

| Frozen defect ID | INFERENCE: explicit migration disposition |
|---|---|
| D-1 unhandled read/process exceptions | Keep crash cases in qualification; never exclude them as A allows. Pin nonzero/no-success outcome and raw stderr. Any new structured error formatting is an explicit reviewed delta, not whitespace normalization. Preserve record's distinction between child nonzero and failure to start. |
| D-2 inconsistent Node floors | Do not silently raise installed-host requirements. Keep suite >=22 and existing runtime acceptance during parity; use baseline Node 22.21.0 for qualification. Choose any new runtime floor only in a separate compatibility decision. |
| D-3 benign `..` substring rejected | Preserve conservative rejection in this port; a later path-contract change needs its own scope and fixtures. No copying a known traversal weakness is authorized. |
| D-4 extension-based inspection | Preserve extension/ownership selection. The corpus has not proved that renaming a script to non-executable text violates the current executable contract; retain this as an exposure to test, not an established bypass. |
| D-5 decision-heading grammar | Preserve baseline parsing and odd-heading fixtures; a grammar redesign is a separate delta. |
| D-6 missing digest entry skipped | Preserve required-file failure and inspected-count semantics; test missing required and non-required digest entries separately. Do not assert every digest key is required without a manifest proof. |

INFERENCE: None of this silently accepts a newly reproduced protected-path false green. Such a finding blocks that candidate under `.ai/DECISIONS.md:1795`; remediate separately, then refreeze the reference and affected expectations with full history. The default is isolated parity, not an exemption from mandatory findings.

### 4. Target architecture and one semantic authority

INFERENCE: Choose Node library + stable CLI + thin PowerShell wrapper, beside a frozen legacy oracle during qualification. Keep an entry module and four cohesive modules: repository, text, governance, platform. Add only the small gate-structure leaf needed to remove duplicate completion predicates; do not introduce a rule DSL or plugin framework.
INFERENCE: Entry owns ordered per-check calls/rendering; modules do not run whole phases in their own order. Repository owns discovery/safe paths/digests; text owns byte rules and the pure line-count function; governance alone owns line-limit decisions, budgets and completion structure; platform owns concrete process checks. This resolves the overlapping line-limit ownership in `docs/research/2026-09-25-validator-migration-council/round2/challenge-B.md:109-123`.
INFERENCE: Dependency direction: entry -> modules -> gate-structure leaf; handoff gate-check -> same leaf + its existing receipt verifier. Leaf imports neither handoff, validator entry, session nor lock. Standalone validation may invoke gate-check as a child for receipt binding; record suppresses that child exactly as today. This is a bounded runtime round trip, not a require cycle. Keep each old path until the union of PS-only prompt/citation checks and Node-only receipt checks has fixtures; retire duplicate production predicates before declaring migration complete.
FACT: The two gate implementations are not interchangeable: the frozen call graph identifies their different checks (`docs/research/2026-09-25-validator-migration-council/round1/VALIDATOR-CALL-GRAPH.md:51-53`). Independent golden fixtures protect the consolidated union; the frozen PS oracle never imports the new leaf.

### 5. PowerShell and platform boundary

INFERENCE: Keep native PowerShell parsing and source installer execution. Batch PS parsing in one subprocess per invocation if parity proves identical diagnostics; always retain the ASCII byte scan. Source self-check runs once; installed role retains its existing non-installer path. Removing these checks for speed is a separate contract change.
INFERENCE: Wrapper forwards the actual invoking shell path to Node for parser/self-check parity; direct CLI defaults to Windows PowerShell 5.1 on Windows and pwsh elsewhere, preserving handoff's selector (`.ai/bin/protocol-handoff.cjs:89-92`). Explicit selection stays visible in qualification. A pwsh run does not prove PS5.1 compatibility: keep the Windows 5.1 acceptance lane and grammar-difference fixtures. Do not substitute parsers silently.
INFERENCE: Without required PowerShell, run portable checks but return nonzero with named unavailable-check diagnostics and coverage. No green Evidence or certifying PASS from omitted required checks. `BLOCKED` belongs to reviewer vocabulary, not a third validator exit. A failed quick receipt may honestly record failure. Propose this fail-closed extension for the approved plan; it does not claim that the old engine already ran without PS.
INFERENCE: Keep existing Bash failure behavior in the migration contract; assistant neutrality does not imply hook capability completeness. A hookless installation profile would be a separate policy change. No owner poll is needed to preserve current checks.
INFERENCE: Qualification matrix: Windows/PS5.1 full; Windows/pwsh explicit plus 5.1 compatibility lane; Node/no-PS source and installed both expose missing syntax capability, with source also missing installer execution; cloud tests actual available capabilities, not the word cloud; linked worktrees preserve root detection on both platforms. If a required environment cannot be tested, report BLOCKED for that claimed support.

### 6. Node API, CLI and containment

INFERENCE: `validate(root, options) -> {diagnostics, counts, exitCode, coverage}` synchronous API; absolute root; invocation-local environment snapshot and explicit platform executable selector. Diagnostic `{id,status,path?,message}`; coverage names executed/unavailable checks. No stdout, writes, process exit, cwd/env mutation, persistent cache or import-time execution. Reader/runner injection is internal test plumbing, never a production skip API.
INFERENCE: CLI `node .ai/bin/protocol-validate.cjs [--root <absolute>] [--quiet]`; default installed root, UTF-8, existing human renderer, exits 0/1. Legacy `validate-protocol.ps1 [-Quiet]` remains. Unknown arguments fail. Quiet suppresses PASS only. Preserve receipt check label and schema even after the runtime changes.
INFERENCE: Use direct API calls for unit/rule tests first; record initially spawns the Node CLI. This keeps its existing 900 s process deadline, crash containment and nonzero result capture (`.ai/bin/protocol-handoff.cjs:94-106`), without assuming an in-process timer can interrupt synchronous execution. API-in-record is deferred until measured benefit justifies equivalent hard containment. No worker pool/daemon is needed.
INFERENCE: Expected filesystem errors cannot become success; unexpected library faults throw, CLI emits nonzero and no success summary. Test throw, child timeout, signal termination, missing executable, Unicode roots, repeated calls and independent roots. Distinguish process-start error (record aborts) from a launched validator returning failure (record captures nonzero), including the normalizer's treatment of D-1.

### 7. Differential and TCB strategy

INFERENCE: Freeze old engine SHA+blob hashes and complete fixture package, independent expected results, normalizer and approved-delta ledger before candidate execution. Run OLD and NEW against equivalent isolated source/installed roots, preserving Git history and required assets. A moved old script with a different PSScriptRoot is not a reference run.
INFERENCE: Each fixture stores INPUT, raw stdout/stderr/exit, OLD_RESULT, NEW_RESULT, NORMALISED_OLD/NEW, independently EXPECTED and DIFF; capture capabilities and parser version. Golden correctness and old/new agreement must both hold, or name the authorized delta. Unexplained mismatch, timeout, hidden skip or nondeterminism fails qualification. Preserve ordering, severity, counts, relative paths and check presence.
INFERENCE: Allow only root substitution, explicitly environment-dependent version/executable strings, output transport CRLF and color removal. Never normalize input CRLF, syntax errors, arbitrary message wording or whole output ordering. Match runtime-specific errors within an explicit typed fixture expectation; retain raw text. Repeat fixtures to test deterministic output and pin locale.
INFERENCE: Required families: positives, each warning/failure branch, exact boundary values, malformed files, Git/no-history/dirty/worktree states, Unicode and safe/unsafe paths, symlinks/junctions, byte encodings, manifest roles/digests, decision grammar/supersedes, light/strict/protected gate cases, receipt freshness and unavailable capabilities. Add the currently uncovered installer-present-but-execution-fails case, not merely installer absence (challenge-B E-3, `docs/research/2026-09-25-validator-migration-council/round2/challenge-B.md:40-45`).
INFERENCE: Use targeted mutation, not an unproved obligation to mutate every cosmetic WARN. Required sentinels remove path containment/reparse rejection, strict decoding, required-file checks, protected-path forcing, receipt binding, native syntax and installer execution; force a skip to success and corrupt normalization. Each must be killed by independent expectations. Test every other normative branch normally. Fixture author writes expectations; a separate adversarial reviewer checks authority and normalizer before qualification. Neither certifies the resulting candidate.
INFERENCE: T owns mutations in disposable candidate copies only; hashes before/after show the frozen candidate unchanged. Certification includes real-tree old/new runs and negative fixtures, not self-agreement. Keep the N-1 reference reproducible in source history/test assets until retirement qualification, not as a second permanent production engine.

### 8. Quick/full and evidence boundaries

FACT: Both record modes set `PROTOCOL_SKIP_GATE=1` because the validator descriptor itself has `quick:true` (`.ai/bin/protocol-handoff.cjs:25-47,94-103`); structural checks remain, recursive receipt checking is omitted (`validate-protocol.ps1:869-885`). Correct the quick-only wording in frozen A companions by this disposition; do not rewrite those historical files.
FACT: Research/design quick Evidence is authorized; code/kernel/tooling still requires full record (`.ai/DECISIONS.md:2858-2862`). Quick explicitly says regressions were not run (`.ai/bin/protocol-handoff.cjs:109-133`).
INFERENCE: Quick proves recorded validator outcome plus the captured journal/tree identity, not regressions, host tests, parity or independence. Full adds selected suite/host command, not an implicit fresh gate. Keep verify --deep and gate-check at closure. No receipt copying or new imported-test authority in this migration. Research may cite one coordinator benchmark; required full records remain each session's actual checks, serialized on this workstation.
INFERENCE: Freeze an isolated candidate and scope before execution; verify start/end tree as well as SHA. Post-run anchor alone (`.ai/bin/protocol-handoff.cjs:717-721`) cannot prove an unchanged run. Historical task freshness does not authorize testing one candidate and certifying another.

### 9. Implementation DAG and ownership

INFERENCE: Future packets below replace optional/ambiguous edges of the frozen DAG. Nothing is dispatched now. All code/candidate-contract/certification tasks use P-L2-002 with T7 minimum; review-only tiers follow the rubric. Assign actual models/efforts/capabilities before launch. At most two edit streams; shared integration surfaces have exactly one writer (`.ai/DECISIONS.md:2245`).
INFERENCE: Roles: CO coordinator, I integrator, X/Y module authors, T fixture/measurement implementer, R adversarial reviewer, C1/C2 independent certifiers. T/R/I/CO/X/Y are excluded from candidate certification. These are role duties, not a demand for eight simultaneous agents. Authority/certifier availability is checked before implementation.
INFERENCE: Graph: G0 -> G1 -> {G2,T0} -> G3 -> {X1 -> X2, Y1 -> Y2} -> G4 -> G5 -> G6 -> R1 -> {C1,C2} -> G7 -> G8 -> R2 -> {C1b,C2b}. G2 and T0 may run in parallel only on disjoint paths; expensive runs never overlap. Stop on named mismatch and remediate its owner; preserve root-cause/attempt history.

| ID / role | Goal, inputs -> output / owned paths (future) | Dependencies / acceptance / rollback |
|---|---|---|
| G0 CO | Approved timing/scope -> append DECISIONS/REGISTRY, task/plan under lock | Council closure and direct owner authority; freeze exception explicit. No runtime edits. Unapproved work remains inactive. |
| G1 I | CM map + this report -> contract/interfaces/ownership/scenario specification in docs/specs/validator-migration/ | G0; every row/caller has owner, platform result, expected fixture and defect disposition. Version specs, never erase history. |
| G2 I | Baseline tests -> independently reversible test split, tests/helpers.cjs explicit real/stub modes, manifest test inventory | G1; preserve stateful scenarios and all coverage; full ordinary checks and tooling review. Revert whole test/manifest cohort. |
| T0 T | Approved contract -> independent expectations/normalizer/probe artifacts in docs/specs/validator-migration/qualification/ | G1; R reviews expected authority independently; no candidate implementation imports. Supersede artifacts on correction. |
| G3 I then T | Frozen interfaces/fixtures -> source-only differential tests and manifest packaging; matched baseline measurements | G2,T0; I alone edits shared manifest/helper; T owns new harness tests after handoff. Capture split-only performance before port. Revert harness/packaging cohort. |
| X1/X2 X | Contract -> validator/repository.cjs then validator/text.cjs and own tests | G3; path/role/digest and byte/count negatives; forbid entry/governance/platform/shared paths. Revert module cohort. |
| Y1/Y2 Y | Contract -> validator/governance.cjs plus validator/gate-structure.cjs, then validator/platform.cjs and own tests | G3; ordered governance/structure and real parser/installer failures; forbid X/I paths. Revert module cohort. |
| G4 I | Modules -> .ai/bin/protocol-validate.cjs; CLI/API tests; shared manifest/helper integration | X/Y finished; entry owns order; explicit real/stub identity, no cycles/import effects. Revert assembly cohort. |
| G5 T | Frozen candidate -> differential/targeted mutation outputs in qualification/; disposable mutated copies only | G4; zero unexplained mismatches, sentinels killed; both platform/role matrices. No active candidate edits. Failure returns to exact module task. |
| G6 I | Qualified core -> handoff Node-CLI adapter, PS wrapper, gate leaf adapter, manifest and narrow CI integration | G5; unchanged Evidence, hard timeout, no recursive record; install/upgrade/partial-upgrade/rollback and failing host command. Revert entire release cohort. |
| R1 R | Integrated frozen candidate -> unified adversarial report; I owns its <=150-line prompt | G6 plus T qualification; complete scope/caller/platform/rollback audit, reproduced findings closed. No candidate edits. |
| C1/C2 | Same input, different attack angles -> separate certifying reports/journals | R1; parallel independent analysis, serialized full checks; semantic/TCB and platform/performance angles. Any mandatory defect/capability gap stops adoption. |
| G7 CO/I | Accepted candidate -> authorized adoption and finite source/installed observation record | Both certifiers; actual quick/full, default/quiet, parser-negative, upgrade and rollback cases. Whole-release rollback. |
| G8 I | Observation + union coverage -> remove old production engine and duplicate handoff predicates | G7; preserve independent oracle/receipts/history. R2 and C1b/C2b qualify this protected delta before retirement lands; restore pre-retirement release if rejected. |

INFERENCE: Global forbidden paths: other owners' files/journals, owner inputs, historical decisions/reviews, consumer repositories, unrelated installer/lock/archive/session/launcher code. I alone owns entry/order, manifest, helpers, existing test redistribution, wrapper, handoff and CI. Workers export checks and never fix shared files opportunistically. T alone owns qualification fixtures/mutations; R reviews but does not rewrite T's expectations.
INFERENCE: Leaf readiness is not independently green integrated completion. New tests can violate manifest equality until I packages them (`tests/manifest.test.cjs:68-72`). Choose aggregate candidate closure: leaf full-check failures are recorded honestly; no leaf claims Completed on expected integration failures. Pause workers at packaging checkpoints if independent leaf closure is needed; never disable the manifest gate.

### 10. Rollback and phases

INFERENCE: Phase 0 G0-G3 freezes authority/contracts/reference; old engine operational. Phase 1 X/Y/G4 adds candidate without caller change; delete candidate branch to withdraw. Phase 2 G5 proves differential behavior; old remains authority. Phase 3 G6 integrates callers/wrapper inside the candidate; no deployment before R1/C1/C2. Phase 4 G7 adopts then observes finite cases. Phase 5 G8 retires duplicate production logic only after its own protected-delta acceptance. Every phase exits on its table checks; a failure keeps the last accepted operational release.
INFERENCE: Freeze the actual pre-switch release SHA, manifest and file inventory before G6, not merely a version name. Restore wrapper, modules, callers, manifest and packaged host files as one cohort; wrapper-only routing is insufficient. Source and installed rollback drills must pass the old commands/digests without deleting user state. No schema migration is proposed.
INFERENCE: Old/new Evidence remains immutable historical evidence of the tree/checks actually run. A cryptographically valid receipt from a defective validator is not proof of correctness: append affected candidate/receipt identities and rerun required checks after repair. Do not rewrite or automatically bless such receipts. This corrects the overly broad no-rerecord assurance in `docs/research/2026-09-25-validator-migration-council/round1/A-contract-tcb.md:171-174`.
INFERENCE: Retirement authority and two-certifier acceptance are cumulative, not alternatives. Include the bounded retirement scope in the original approved plan, so it needs no redundant owner question later; require new authority only if scope/compatibility changes. Removing duplicated production code must not remove recoverable reference artifacts.

### 11. Acceptance and measurement

INFERENCE: Required correctness thresholds are zero unexplained semantic differences, zero lost scenarios, zero hidden required skips, zero surviving required sentinel mutations, preserved receipt bytes/hash behavior, verified install/upgrade/rollback, and two independent eligible certifiers. Any violation fails. These gates outrank time/cost.

| Metric | FACT baseline / INFERENCE proposed criterion and method |
|---|---|
| Real-tree validator wall | M-01 historical ~3 s, not a paired baseline. T records three matched old/new pairs; candidate median <= reference median at equal coverage. <=1 s is stretch only. |
| Normal full suite wall | M-03 302-322 s. Compare original, split-only and final normal lanes with identical scenario coverage and worker cap; final median <= original and report incremental gain over split-only. <=120 s is stretch. Differential lane costs reported separately and required for qualification. |
| PS/all child processes | M-05 counts 300 observed Node-to-PS starts, not all descendants. Do not use <=300 as a cross-engine gate. Require zero launches of the full legacy PS validator in the new normal path; parser batch <=1 and source self-check <=1 per validation. Obtain comparable OS parent/child census; candidate total <= paired reference at equivalent coverage or return trade-off to review. |
| Memory | M-15 workstation free minimum 3.4 GB at three suites; isolated peak unknown. Measure full descendant peak memory with unrelated load recorded; no OOM; candidate paired peak <= reference for non-regression claim. Unknown baseline cannot be called PASS. |
| Parallel-agent behavior | M-14 three suites 445-450 s each, all pass; 2/6/8 not measured. One full-suite slot remains. Qualification measures 2 and 3 concurrent validator-only requests, per-request p95/total throughput/peak memory against reference; fail on errors, missing coverage or regression. No 6/8-suite stress prerequisite. |
| Capability/portability | Node import/portable checks execute without PS, but missing required checks yield nonzero and named coverage. Windows PS5.1 remains acceptance platform; pwsh is measured explicitly. Complete cloud certification is not a promised property. |

OPEN QUESTION (measurement task, not owner policy): T/coordinator must capture missing per-check costs, real/stub identity, all descendants and isolated memory before claiming gates. Command for one exclusive baseline suite: `powershell -NoProfile -ExecutionPolicy Bypass -File .\test-protocol.ps1`, with the M-05 probe augmented to identify fixture hashes and OS tracing of descendants. No new full-suite run is needed for this synthesis.
INFERENCE: Freeze workloads and tolerances before measurement; do not tune them after observing a candidate. If performance is neutral, structural consolidation may still justify the approved migration, but report neutral speed. A claimed faster port is falsified by matched no-gain results; required capability loss falsifies the architecture regardless of speed.

### 12. Certification and independence

FACT: The high-risk pair, independence filter and verdict rules are binding (`.ai/DECISIONS.md:1792-1796,1975-1979`); candidate edits/certification take T7 floor (`.ai/DECISIONS.md:2908-2910`). A benchmark author/controller cannot occupy either final slot.
INFERENCE: Package includes frozen candidate SHA and scope digest, oracle hashes, all CM dispositions/fixtures, caller map, raw ordinary/differential/platform/mutation results, normalizer audit, performance workloads and rollback evidence. Certifiers use separate quiet checkouts, record start/end identity, test neutral requirements against actual protected filenames, and freeze answers before peer access. Parallel independence does not require concurrent resource-heavy suites.
INFERENCE: Each required full record runs honestly; coordinated serialization is logistical, not receipt reuse. Unified prompt covers the entire integrated implementation; retirement has its own delta pair or is batched into a candidate before any adoption. Preserve attempted fixes and apply existing root-cause/batch limits; absence of a slot blocks certification, not justification for author self-certification.

### 13. Genuine owner decisions after the filter

OPEN QUESTION O-1: Approve early migration inside CORE-ARCH, before the pilot report, with this bounded contract/rollback/retirement scope, or preserve after-pilot timing? Record a narrow supersession of 0039 item 3 and owner-directive registry trigger; identify CORE-ARCH coverage of the feature-freeze exception. Evidence supports the recommendation, but cannot confer this authority.
INFERENCE: No separate owner questions for Node choice, quick research, reviewer count, test/module names, fixture staffing or retained Bash/installer checks: decisions/procedure or this proposed technical design resolve them. Missing measurement/effort visibility is an operational OPEN QUESTION, not an architecture poll. No extra ask to certify incomplete cloud validation: this proposal does not permit it. A requested successful partial-check receipt or raised Node floor would create a separate policy question.

### 14. Rejected alternatives and complete issue coverage

INFERENCE: Reject permanent dual engines (recurring semantic drift); neutral rule DSL (new interpreter/TCB without evidence); replacing PS parsing (unproved grammar compatibility); immediate in-process record (hard timeout gap); automatic WARN-only no-PS acceptance (weakened coverage); persistent validation caches (freshness complexity); full suite-runner/installer rewrite (unnecessary scope); parallel shared-file editing (no ownership); performance targets based on mismatched process instrumentation; and re-asking the Node destination. PS/test optimization remains a valid interim experiment, not the final single-Node destination.

| ISSUE-MATRIX row | INFERENCE: disposition and resolving section |
|---|---|
| 1 timing | Recommend bounded early, authority pending O-1; preserve C's timing dissent, sections 1/13. |
| 2 test splitting | Accept mechanism, not claimed speed; independent G2 and matched experiment, sections 1/9/11. |
| 3 mutation | Targeted safety sentinels plus all-branch fixtures; broad mandatory mutation not proved, section 7. |
| 4 Bash absence | Preserve current contract; no new hookless policy, section 5. |
| 5 no-PS Evidence | Reject unqualified green/WARN; explicit incompleteness/nonzero, sections 5/8. |
| 6 installer | Retain execution, add missing negative; migration deferred, sections 2/5/7. |
| 7 rollback | Whole release/installed cohort, not wrapper alone; section 10. |
| 8 retirement | Plan authorization AND independently certified delta, sections 9/10/12. |
| 9 stub | Preserve fast-test purpose, replace filename heuristics with explicit mode before caller switch; sections 6/9. |
| 10 gate skip | Both record modes skip recursive check; baseline code decides, section 8. |
| 11 gate cycle | Small shared structure leaf plus separate receipt layer; no require cycle, eventual dedup mandatory; section 4. |
| 12 runner scope | Existing orchestrator retained, narrowly scoped test/CI changes only; section 2. |
| 13 D-1..D-6 | Individual dispositions, no exclusion of crash fixtures or automatic bug blessing; section 3. |
| 14 carry-forward | All 14 synthesis questions answered; final plan must retain full 29-section owner format, per-task packets, independent critique and owner approval. This report is not that final plan. |

INFERENCE: Preserve additional challenge-B carry-over beyond the short matrix: mixed probe attribution, parser host, source self-check negative, CLI containment, receipt validity after rollback, line-limit ownership/order, independent expectations, explicit mutation owner, manifest/helper closure and freeze authority are resolved in sections 1, 3-12. The matrix's confirmed/class-A treatment of splitting is not an approved decision; classification alone cannot create authority.

## Part 2: F-3P-1

### Status, evidence and recommendation

FACT / POST-BASELINE INPUT: Status remains OPEN - HYPOTHESIS UNDER VALIDATION, per `docs/research/2026-09-25-validator-migration-council/OWNER-DECISION-R3.md:1-25` and its STATUS section. No accepted residual, fix or mandatory sandbox follows from this synthesis. Part 2 changes no Part 1 conclusion.
FACT / POST-BASELINE INPUT: The launcher spreads `process.env` into every job then adds its URL rewrite (`docs/research/2026-09-25-improvement-research/prompts/launch.cjs:348-354,499-507`). The clone removes named remotes but the scope check observes local state only (`docs/research/2026-09-25-improvement-research/prompts/launch.cjs:400-435`). These facts prove neither removal nor presence of actual owner write credentials; no secrets were inspected.
FACT: The review records successful local-bare-remote pushes through command-line and ambient-config overrides, with unchanged clone state (`docs/reviews/2026-09-25-deepseek-core-arch-stage2-review-packageL-third-pass.md:72-102`). I independently checked URL selection without contacting a remote: `git -c url.no-push://blocked.insteadOf= -c url.file:///nonexistent-local-proof.insteadOf=no-push://blocked ls-remote --get-url no-push://blocked` returned `file:///nonexistent-local-proof`, exit 0. This reproduces rewrite precedence, not an authenticated network push; the push reproduction remains the cited prior evidence.
FACT / external primary source: Git selects the longest matching insteadOf prefix; `ls-remote --get-url` expands the URL without contacting a remote. Sources: [git-config](https://git-scm.com/docs/git-config#Documentation/git-config.txt-urlltbasegtinsteadOf), [git-ls-remote](https://git-scm.com/docs/git-ls-remote). These semantics agree with the local probe.
INFERENCE: Prefer variant 9 below: task mode + truly credential-separated execution + small trusted external publisher, with isolation chosen by demonstrated credential reachability. Do not claim a new Git setting can contain arbitrary shell execution under the owner's credential-bearing identity. A wrapper/PATH restriction is only an accidental-use guard if another executable/helper/API is reachable.

### Q1. Who performs push?

| Variant | INFERENCE: simplicity / safety / latency / recovery / audit / token overhead / implementation |
|---|---|
| A agent pushes | Few components; mixes work with publication authority. Lowest immediate dispatch latency; retries/targets left to agent; audit distributed over transcripts; recurring reasoning/tool overhead; small implementation but weakest predictable boundary. |
| B external delivery | One bounded publisher; worker never needs publication credentials. One extra process/hand-off, latency unmeasured; retry by expected old ref + immutable commit; explicit target/result log; no publication reasoning loop; moderate one-time implementation. Preferred default. |
| C hybrid by task type | Useful only where direct push is explicitly justified; otherwise two enforcement paths and a classifier increase recovery/audit complexity. No evidence here that direct-agent publication merits an exception. |

INFERENCE: Research emits scoped artifacts, not a local commit: current 0070 still forbids commit/tag/push (`.ai/DECISIONS.md:2796-2799`). A future implementation task may create a local commit only when its own authorization permits it. The publisher consumes the approved immutable result, never an agent's arbitrary shell command.

### Q2. Isolation levels and capability boundary

INFERENCE: Level 0 instructions are acceptable workflow reminders for cooperative tasks only; they do not close F-3P-1. Level 1 removes inherited tokens, write PATs, SSH-agent access, write helpers and ambient Git configuration, preserving only necessary read credentials and model access. It is sufficient only if the job cannot reacquire write authority through files, OS vaults, agents, sibling processes, APIs or writable publisher inputs.
FACT / external source: Git credential helpers are external programs and can consult OS or other credential storage; clearing environment variables is not the complete credential surface ([gitcredentials](https://git-scm.com/docs/gitcredentials)).
INFERENCE: Level 2 is required for this proposal when Level 1's non-reachability cannot be enforced: a separate Windows identity or existing suitable sandbox with protected credential/profile/broker boundaries. Merely spawning another process under the same unrestricted identity provides no such argument. Choose the smallest available mechanism that passes hostile tests; a separate identity is a candidate, not yet measured as sufficient.
INFERENCE: Level 3 VM/hardened isolation or enforced egress is justified only when the required boundary includes hostile tooling with broader host reach or publication to arbitrary attacker-owned destinations. Containers with owner credentials, host mounts or SSH agent forwarding can still fail the intended boundary. No universal container/VM mandate is established by the corpus.

### Q3. Threat model: one primary control per class

| Threat class | INFERENCE: asset/attack / primary control / limit |
|---|---|
| Accidental violation | Wrong push during research / default no-remote task mode plus no worker publication credential / instruction and log alone do not enforce it. |
| Instruction drift | Model interprets work as permission to publish / launcher-owned validated descriptor, immutable to job / no automatic mode upgrade from prose. |
| Tool misuse | Alternate remote, -c, helper, API or executable / actual denial of write capability to the job / local URL rules and snapshots are insufficient. |
| Autonomous adversarial agent | Searches owner profile, credential store or publisher control / enforce separate credential principal and protected publisher inputs / arbitrary Internet exfiltration is a broader boundary. |
| Malicious repository content | Prompt injection or executable hook/config reaches publication privilege / treat workspace as data; trusted publisher uses trusted code/config/hooks and approved immutable object / never run job tests/hooks with publisher credentials. |
| Compromised external tool/model | Untrusted client attempts host/broker escape or exports data / restrict host access and, where required, network destinations using Level 2/3 / token scrubbing alone does not cover host compromise. |

INFERENCE: Proposed current protection objective is unauthorized mutation of owner/project remotes using owner authority, including credential recovery through alternate tools. It is stronger than the draft cooperative assumption yet narrower than prevention of all data exfiltration. A job with Internet access could publish to an attacker-controlled service using an attacker-supplied credential; denying owner credentials cannot prevent that. If the owner means all remote publication, enforce egress with mediated research/model access and reassess cost before claiming closure.
INFERENCE: The publisher itself is in the trust boundary. The cited F-3P-2 shared-hook reproduction (`docs/reviews/2026-09-25-deepseek-core-arch-stage2-review-packageL-third-pass.md:104-122`) matters here: separation is defeated if job-written hooks run under publishing credentials. Fix that dependency in the implementer's pass; this council does not implement its other minor findings.

### Q4. ls-remote before/after

FACT / source: `ls-remote` reports available refs and object IDs, not an event history ([git-ls-remote](https://git-scm.com/docs/git-ls-remote)).
INFERENCE: Keep it as a secondary postcondition/tripwire and delivery retry aid, using a trusted query context and explicit approved remote. It detects persistent new branch/tag, deletion or changed tip/force push if included in the query and no read failure is hidden. Query failures mean UNKNOWN, not unchanged.
INFERENCE: It cannot establish no publication: push+revert can restore all sampled refs; CI/webhooks may already have fired; another remote is outside the sample. Test these cases explicitly. Receive-side mutation/audit logs improve acceptance evidence, but prevention must occur before unauthorized mutation. Do not turn repeated polling into the primary control.

### Q5. Small delivery descriptor

INFERENCE: Keep the four modes as a small vocabulary, with task scope separately defining edit/commit rights. READ_ONLY means no remote mutation and no commits unless explicitly allowed; disposable research outputs remain permitted. LOCAL_COMMIT adds authorized local commits only. BRANCH_PUSH permits a publisher to one approved repository/ref after validation; RELEASE_PUSH has separately authorized refs/stage. None grants an agent a general write token.
INFERENCE: `git: {mode: LOCAL_COMMIT}` is sufficient for no publication. A publish task minimally needs `mode`, an approved remote identity, full target ref and `publishRequired` (default false); e.g. BRANCH_PUSH does not by itself require delivery. Immutable commit ID, expected old target OID, task ID and stage are derived into the trusted delivery request, not a policy DSL or values guessed from workspace config.
INFERENCE: Reject unknown modes/refs/remotes; do not let job edits modify the authoritative descriptor. Resolve aliases through launcher-owned configuration. Default to fast-forward publication; deletion, force and tags require explicit authorized release operations. Target restrictions must be enforced by publisher and preferably remote ACL, not assumed from a repository-wide write token.

### Q6. Assignment and escalation

INFERENCE: Owner/task author establishes maximum rights; an approved procedure derives a narrower default. Launcher validates the resulting mode and records its authority. Agent-requested upgrade is a proposal tied to the existing owner/delegation rules, never self-approval. Automatic classification may recommend/restrict a mode but cannot grant publication. False negatives delay delivery; false positives publish irreversibly, so unresolved classification fails closed.
FACT: Permission/delegation boundaries are already described by `.ai/DECISIONS.md:2796-2812` and narrow client grants by `.ai/DECISIONS.md:1981`. These decisions do not authorize future BRANCH_PUSH merely because this report describes it.

### Q7. Default deny and workflow cost

INFERENCE: Default NO REMOTE MUTATION is appropriate. Research tasks need no new fields beyond existing scope/default mode; publish authorization is captured once per task, not per Git command. Retry of the same authorized immutable request does not need repeated owner approval; a new target/stage/authority does. Credentials can be read-only where repository reads are required.
HYPOTHESIS: This can reduce interactive approvals and token overhead, but launch delay, credential provisioning and failure recovery cost have not been measured. Acceptance must measure end-to-end task time and owner interventions, not only push milliseconds.

### Q8. Hostile acceptance and recovery

INFERENCE: Implementer creates disposable local/test remotes and synthetic credentials, never owner production targets. Independent reviewers run tests under the actual configured execution identity/profile/client. A local-bare push proves Git routing behavior, not HTTPS/SSH credential isolation; test each supported authenticated transport and helper surface separately. Never print credentials.
INFERENCE: Nine mandatory no-push attempts: direct push; competing `-c url.*.insteadOf`; alternate remote/explicit push URL; global/local config mutation (including clearing inherited settings); tag; new branch; force update; direct credential-helper/OS-store or SSH-agent route; another Git executable/absolute path. Add hosting API mutation, transient push+revert, deletion and alternate remote. Every attempt must fail before remote mutation, with trusted receiver logs proving zero forbidden events, not just equal final refs.
INFERENCE: Prove credential non-reachability using synthetic canaries and allowed/denied access results; no plaintext output. Try modifying delivery descriptor, publisher executable/config/hooks, replacing candidate objects after approval, inherited config, and cross-job access. Close the F-3P-2 trust dependency before giving publisher credentials. Unknown access or missing route coverage is BLOCKED, not passed by absence of a successful attack.
INFERENCE: Positive tests for BRANCH_PUSH/RELEASE_PUSH: only approved target + stage + exact candidate works; same candidate on wrong remote/ref fails; protected refs/tags/force/delete fail without explicit authority; publication before validation fails; `publishRequired=false` never auto-pushes. READ_ONLY and LOCAL_COMMIT never publish. Tests/workspace code never execute with publisher credentials.
INFERENCE: Publisher operates from a trusted clean context, allowlisted exact refspec, trusted executable, and expected old target value. No workspace-controlled URLs, hooks or configs. On interrupted delivery, query exact remote/ref: desired OID -> record prior success, old OID -> retry same request, third OID -> conflict requiring new evaluation. Do not blindly force or replay side effects. Persist task/candidate/target/stage/result for audit; protect that state from the job.
INFERENCE: F-3P-1 closure requires both negative/positive acceptance, independent verification of the declared threat boundary and owner-approved architecture. No claim of closure is made now. Retain scope checks for local writes and ls-remote as secondary evidence; neither substitutes for denied publication capability.

### Q9. Reverse hypothesis and proportionality

INFERENCE: Evaluate expected loss over a fixed workload as sum over threats of `risk severity x probability per job x blast radius x job count`, against `implementation + maintenance over that workload + execution friction`. Avoid multiplying two quantities both already defined as expected risk. The corpus establishes bypass feasibility, not attack frequency, credential reachability, monetary impact or isolation overhead; a numeric break-even claim would be invented.

| Scenario | HYPOTHESIS: risk x probability x blast radius | HYPOTHESIS: control cost / conclusion |
|---|---|---|
| Disposable offline fixture, no sensitive data/production credentials | Low severity x low accidental publication opportunity x disposable scope | Per-task VM likely costs more than benefit; policy plus real absence of authority can suffice for this scope. This is not the current unrestricted launcher's proved state. |
| Research client under credential-bearing owner identity | Potential unauthorized branch/tag/CI event x probability UNKNOWN x every reachable credential's scope | Scrubbing plus external publication offers a small workflow, but shared-identity recoverability can require Level 2. A low-probability label in the existing risk row is not a measured rate. |
| Untrusted tooling with owner release/admin credentials reachable | High consequence x probability UNKNOWN x repositories/release/CI privileges | Removing those capabilities is strongly justified; VM/egress becomes a candidate only if weaker separation fails the stated boundary. |

INFERENCE: The reverse hypothesis is credible for bounded offline/no-authority tasks and must remain available. It is unproved for this project launch configuration because credential surface, target protection and event losses were not measured. Do not mark the finding ACCEPTED RISK on that basis. Compare profile-only versus separate-identity pilot on identical hostile tests; record provisioning time, median/p95 launch overhead, recovery steps, false stops and owner interventions. If profile-only passes the required boundary, extra isolation lacks demonstrated necessity.

### Q10. Workflow versus safety; comparison matrix

INFERENCE: Both layers are needed for the proposed objective. Workflow determines authorized candidate/target/stage and whether publication is required. Capability separation makes an unauthorized worker unable to exercise owner write authority. Task labels without enforcement are workflow only; credentials without stage/target checks are insufficient workflow control.

| Variant | INFERENCE: security | Complexity | Runtime friction | Maintenance | Failure recovery | Fit for current project |
|---|---|---|---|---|---|---|
| 1 Instructions only | Cooperative mistake reduction; no enforced boundary | Very low | Very low | Low | Discover/repair after event | Reminder only; does not close finding |
| 2 ls-remote monitoring | Detects sampled persistent ref differences, misses transient/other targets | Low | Network queries | Low | Identifies some end-state conflicts | Secondary tripwire, never enforcement |
| 3 Credential profiles | Strong only when all write capabilities are genuinely unreachable | Low-medium; host dependent | Profile setup; runtime unknown | Track helper/SSH/API surfaces | Revoke/rebuild profile | First tested candidate; env scrub alone insufficient |
| 4 Task Git modes | Exact workflow intent; no security without capability control | Low | Descriptor validation | Small schema | Reject bad descriptor, rerun task | Adopt minimal vocabulary if approved |
| 5 External trusted push | Separates publication only if worker cannot access broker credentials/control | Medium | One delivery stage, unmeasured | Small broker + protected policy | Immutable request + target comparison | Preferred publication path; not needed during research |
| 6 Windows identity/process isolation | Separate identity/ACL can protect credentials; same-identity process alone cannot | Medium | Identity/profile provisioning | OS permissions and client profiles | Recreate worker identity/session | Preferred escalation when owner credentials remain reachable |
| 7 Container | Depends on secret/host mounts, daemon access and network policy | Medium-high | Client/Windows integration unknown | Images/patching/tool parity | Recreate container; preserve approved artifact | Candidate if existing environment makes it cheaper than identity isolation |
| 8 VM/strong isolation | Broader host boundary; still requires credential/egress design | High | Startup/resources; unmeasured | Images/patching/network | Snapshot/recreate | Reserve for stronger threat or failure of smaller controls |
| 9 Hybrid modes + credential separation + trusted publisher | Addresses authorized remote mutation if non-reachability and broker integrity tests pass | Medium, bounded | One worker profile and occasional delivery | Single default path; escalate isolation only by need | Profile recovery plus exact-request delivery recovery | Recommended architecture hypothesis, conditionally Level 1 or Level 2 |

OPEN QUESTION L-1 (owner policy, recorded only): Does the required boundary cover owner/project remote mutation, or every external publication/exfiltration destination? The former is this recommendation's target; the latter changes egress/client architecture and cost materially. Neither local code nor Git documentation can choose that risk boundary for the owner.
OPEN QUESTION L-2 (implementation evidence, not owner poll): Determine credential reachability without revealing secrets, client compatibility with separated identity, remote ACL coverage and measured friction. These determine whether variant 3 is enough inside variant 9 or Level 2 is necessary. Until proved, current F-3P-1 remains OPEN.
INFERENCE: Decision draft should select variant 9 conditional on L-1 and explicit Q8 acceptance, not proclaim task modes alone a fix. No risk acceptance, remote mutation or platform isolation was performed during this run.
