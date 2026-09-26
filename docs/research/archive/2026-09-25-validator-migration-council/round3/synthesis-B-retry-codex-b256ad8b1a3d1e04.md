# Round 3: independent synthesis B, separate retry

Baseline-SHA: a4e6aef86440bc0e8da8f06c8f1d3f65af254367
Part-2-input-SHA: cd90be1d3c1fede4e02f7ecff5b6507ea1f34338
Reviewed commit SHA: a4e6aef86440bc0e8da8f06c8f1d3f65af254367 (Part 1); cd90be1d3c1fede4e02f7ecff5b6507ea1f34338 (Part 2)
Model: gpt-6-astra; actual route kilo/openai/gpt-6-astra
Model-maker: OpenAI
Client: Kilo; launch file requested codex
Effort: unknown to this session; requested high, not independently attested
Task-frame / scope-id: task:vmc-r3-b; parent program:validator-migration-council
UTC-date: 2026-09-25
Working tree: dirty before this session; delivery HEAD 4a85a23fcf597acc80b4cf3af2acf1a26a3a9e07
Mode: ADVISORY
Verdict: RECOMMENDATION
Receipt-Owner: codex-b256ad8b1a3d1e04
Scope: independent retry of synthesiser B; no implementation, certification, publication or replacement of an existing report

## Evidence And Independence

FACT: All 13 files in `round3/CORPUS.txt` matched their byte SHA-256 values at entry. Every listed file was read. No existing round-3 synthesis, draft, critique or final plan was opened. The pre-existing `round3/synthesis-B.md` remains unread and unchanged; this version does not silently become its replacement.
FACT: `git show` comparisons found 35 of 36 inspected input files byte-identical to their specified commit, including all 20 baseline test files and all four Part-2 sources. The remaining file, `.ai/DECISIONS.md`, has later additions; the 15 cited/constraint PROTO blocks were separately checked unchanged at both commits. `git diff --exit-code e44686b a4e6aef -- validate-protocol.ps1 test-protocol.ps1 tests .ai/bin/protocol-handoff.cjs protocol-manifest.json` returned 0. This verifies measurement-code identity, not identical workstation load.
FACT / POST-BASELINE OBSERVATION: Delivery HEAD and the launch/common files govern this retry's operation, not baseline product behaviour. PROTO-DEC-0074/0075 add role resolution and supervised-attempt provenance after the frozen subject. This session neither relaunches workers nor registers the council stage DONE.
OPEN QUESTION (operational): The requested client/effort are not the observed client/attested effort. Per `prompts/run-r3/COMMON-LAUNCH.md:14-15`, record and continue; coordinator selection of this retry and acceptance of its launch provenance remain open. No capabilities or permissions were expanded.
Citation key: V=`validate-protocol.ps1`; H=`.ai/bin/protocol-handoff.cjs`; DEC=`.ai/DECISIONS.md`; all three mean the Part-1 baseline unless Part 2 says otherwise. R1A/B/C=`round1/{A-contract-tcb,B-performance-migration,C-adversarial-simplifier}.md`; R2A/B/C=`round2/challenge-{A,B,C}.md`; CM=`round1/VALIDATOR-CONTRACT-MAP.md`; IM=`round2/ISSUE-MATRIX.md`. Council-relative paths are rooted in `docs/research/2026-09-25-validator-migration-council/`. M-nn means the row in `MEASUREMENTS.md`, not a new measurement.

## Part 1: Validator Migration

### 1. Migrate Now Or Preserve Timing

INFERENCE / recommendation: Authorise a bounded early Node migration inside CORE-ARCH, with contract-first shadow execution and staged adoption, rather than an immediate deployed rewrite. Until an approved timing block exists, preserve the current operational engine and schedule. Research permission is not implementation authority.
FACT: Node plus differential verification is already decided (DEC:1171-1172,1709). Advancing the port reopens only the timing of 0039 item 3; record an owner-directive trigger and approved block. Place it explicitly inside CORE-ARCH so 0054 item 2 supplies the feature-freeze exception (DEC:2242-2247). A separate non-P0 task outside that program would need a further freeze exception.
FACT: M-03/M-11 record 302-322 s full suites and a 283 s serial validator-test tail; M-14 records 445-450 s per suite at concurrency three. The measured cloud failure is one session, not a fleet census (`.ai/worklog/claude-ad7cc4169e888ea8.md:42-46`).
INFERENCE: The best justified early-migration case is a callable, eventually single semantic engine, not a promised language speedup or unconditional cloud Evidence. Apply 0071 now. Make test splitting an independently reversible experiment before the port comparison, not part of the caller-switch diff. Its execution is still protected tooling work requiring authority and full checks.
INFERENCE: Resolve R2C:24,114 narrowly: questioning *early timing* does not reopen the approved Node destination. Preserve R1C's cheaper-latency alternative while rejecting its unmeasured 80-90% benefit estimate. Engineering/review payback and avoided future double-edits remain HYPOTHESES, not measured savings.

### 2. Exact Scope

INFERENCE / proposal: NOW after approval: the validator's rule engine, importable API and Node CLI; ASCII legacy wrapper; manifest packaging; direct rule tests, differential harness and explicit fixture modes; narrow handoff invocation/gate adapters; reviewed consolidation of duplicated completion/path rules before declaring the single-engine end state.
INFERENCE / proposal: LATER, not a prerequisite: installer rewrite, whole test-runner rewrite, doctor portability, broad snapshot/evidence/gate refactoring and process-liveness extraction. The existing installer still runs its self-check; leaving its implementation alone does not remove that call. Keep the existing PowerShell suite orchestrator with only necessary inventory/qualification wiring.
INFERENCE / proposal: NO EVIDENCE within this migration for Rust, MCP, AX, other-script rewrites, a rule DSL, a general build system, persistent result caches or a daemon. This is not a permanent prohibition on future owner-authorised work. F-3P-1 remains a separate Part 2, with no validator scope expansion.
FACT: Required assets and test inventory come from `protocol-manifest.json:5-75`; source and installed sets differ. Installed content hashes are produced by `setup-ai-protocol.ps1:240-262`. Packaging is part of correctness, not optional cleanup.

### 3. Behavioural Contract And Defect Dispositions

INFERENCE / proposal: Use CM:30-78 as the initial 49-row inventory, not as unquestionable normative authority. Freeze each row's input/precondition/check/output/exit/side effects/callers/authority and a scenario ID. Reconcile baseline behaviour with decisions before implementation; a test alone does not authorise weakening a binding rule.
FACT: Preserve root-at-script semantics, UTF-8 output, status tokens, counters, summary, exit 0/1 and Quiet hiding PASS only (V:3-27,124-125,1104-1109). Preserve role-specific required files, Git root checks, NUL-delimited inventory, ignored-journal inclusion and ownership exclusions (V:130-227).
FACT: Preserve BOM/strict UTF-8/NUL/CR/ASCII/syntax checks; symlink/reparse treatment; 80/200/150 line limits; 100 journals and 200 files/2097152 bytes as warning budgets (V:222-315). Preserve hooks/Bash, decision/calendar/supersedes/registry semantics, task status, light-before-strict classification, protected-path evaluation before review exclusion, reviews and receipt binding (V:318-923).
FACT: Preserve installed digest severity, decision immutability and its recorded exception, journal attribution, source installer execution, and no repository writes by validation (V:948-1109; DEC:2021). A successful record is not independent certification.
INFERENCE / proposed D-1..D-6 ledger: retain baseline observations in the reference; never exclude inconvenient fixtures or silently teach both engines a new behaviour. The following are dispositions, not declarations that every item is a proven defect.

| Item | Disposition for parity phase | Evidence / acceptance obligation |
|---|---|---|
| D-1 | Keep process-level non-success/crash observable; no green after unreadable input. Structured-error improvement is a separate explicit delta. | V:6,74-85,221,1090; retain ACL/read failure fixtures, stderr, exit and whether a summary exists. Never omit them as CM:84 suggests. |
| D-2 | No incidental new installed-host floor. Record the runtime inconsistency and qualify on Node 22; resolve enforcement as a distinct compatibility delta if needed. | V:344-350; `test-protocol.ps1:12-15`; DEC-0009 already names Node 22 (DEC:337-341). Do not infer an unapproved downgrade from doctor text. |
| D-3 | Preserve rejection of any `..` substring for this port. Relaxation is not required to replace the runtime. | V:88-120; H:890-931. Pin benign `notes..md` and actual traversal separately. |
| D-4 | Preserve the selection predicate; do not call every unlisted extension a demonstrated bypass. | V:215-244. `x.ps1.txt` is not automatically an executed PS script; a concrete execution path/invariant is needed before fixing. |
| D-5 | Preserve current heading/field parsing; unusual-body false positives remain explicit compatibility cases. | V:424-459,996-1017. A fourth-level heading may be body content, not a new decision boundary. No opportunistic Markdown redesign. |
| D-6 | Preserve the digest counter and missing-file handling, with separate missing-required-file negatives. | V:154-159,967-985. Required-file protection covers required entries only; do not generalise it to arbitrary non-required digest keys. |

INFERENCE: A reproduced protected-path invariant violation cannot be dismissed merely because OLD equals NEW. Give it a separate approved correction/rebaseline or an explicit existing exception; otherwise it blocks operational adoption under 0041 item 4. The table is not permission to accept an unapproved false green.

### 4. Target Architecture

INFERENCE / proposal: Choose B: one Node engine, synchronous library plus CLI, legacy PS wrapper and native platform checks. A (test optimisation) is an independent short-term experiment. C (permanent dual engines) multiplies authority and drift. D is acceptable only as an ordinary internal split between portable rules and platform checks, not as a new language-neutral rule interpreter.
INFERENCE / module ownership: use `.ai/bin/protocol-validate.cjs` plus `validator/{repository,text,governance,platform}.cjs`. Entry owns the exact check sequence and rendering. Repository owns manifest/Git/paths/read context/digests. Text owns pure decoding and line counting. Governance alone owns limit *policies*, decisions, registry and completion structure. Platform owns actual runtime/hook/parser/installer probes. Export check-sized functions so historical output phases need not follow module grouping.
FACT: R1B's text/governance ranges overlap at line limits; V:304-316 is one policy using V:66-72's counter. The assignment above removes the overlap instead of assigning two implementations (R2B:116-124).
INFERENCE / gate design: retain current receipt verification and the recording skip handshake. At the single-engine end state, `gate-check` and validation use one completion/path analyser; gate-check adds existing receipt checks, never invokes full validate. The CLI can call gate-check as a bounded child without a validator-to-handoff require cycle. The old reference keeps its own old gate implementation in its isolated tree; never route it through the candidate.
INFERENCE: Consolidation is mandatory to claim the single-engine end state, but follows behavioural qualification. No broad handoff decomposition or new gate is necessary. Cost: a narrowly reviewed adapter/deletion cohort; residual: receipt verification remains separately trusted code, not magically proved by the port.

### 5. PowerShell And Environment Boundary

FACT: Native parsing and source installer execution are two PS dependencies, not one (V:237-245,1077-1100). Retaining the installer check is supported by DEC-0010's explicit decision (DEC:365-375), not just a cost preference. `tests/validator-syntax.test.cjs:83-88` covers absence, not a present installer returning failure.
INFERENCE / proposal: Preserve both checks. Batch native parsing where semantics match; never replace PowerShell grammar with regex. Missing required PowerShell means explicit unavailable-check diagnostics and nonzero full-validation result, not successful WARN-only Evidence. Portable checks still run and help a cloud worker, but partial analysis cannot certify completeness.

| Environment | Proposed behaviour / qualification |
|---|---|
| Windows + PS5.1 | Compatibility/reference lane; actual parser and self-check execute. |
| Windows + pwsh | Preserve wrapper host identity by forwarding the invoking executable; qualify separately. pwsh success is not evidence of PS5.1 compatibility. |
| Direct Node on Windows | Explicit test-host selection when supplied; otherwise PS5.1 default, matching H:89-91. No silent fallback to a different parser dialect. |
| Node, Git, Bash; no PowerShell | Portable checks return results; unavailable parser/source self-check makes full result incomplete and nonzero. Installed role lacks the installer check but still has managed PS parsing obligations. |
| Cloud with PowerShell | Qualify source/installed and actual supported parser/installer combinations; no fleet-wide claim from one host. |
| Linked worktree | Keep Git-derived root checks and `.git` file support, not directory-only assumptions (V:161-178). |

INFERENCE: Bash absence remains FAIL (V:392-418). DEC-0019 permits any assistant to participate; it does not authorise a package with broken installed hooks. No owner poll is needed to preserve this behaviour. Optional hook packaging or successful partial cloud attestation is a different future policy change.
HYPOTHESIS to test before cutover: parser-version-sensitive scripts can distinguish pwsh and PS5.1. Add a version-specific positive/negative fixture and record host identity, not a cross-host normalizer that conceals a changed verdict.

### 6. Node API And Caller Isolation

INFERENCE / proposal: `validate(root, options = {}) -> {diagnostics, counts, exitCode, coverage}`. Root is explicit and absolute; diagnostics are `{id,status,path?,message}` with stable IDs and PASS/WARN/FAIL status. Coverage names performed and unavailable required checks. Zero means no failures and complete required coverage; one means invalid invocation, failed check or unavailable required execution. BLOCKED remains a review verdict, not a new validator exit code.
INFERENCE / proposal: Library calls are synchronous, return without printing/exiting/writing/chdir, and retain no cross-call state. Use an invocation-local environment, selected PS executable and bounded internal reader/runner. Preserve `PROTOCOL_SKIP_GATE` semantics; provide no arbitrary public callback or skip list that can manufacture coverage. Programming faults throw; CLI catches at its outer boundary, records stderr and returns nonzero.
INFERENCE / proposal: CLI `node .ai/bin/protocol-validate.cjs [--root <absolute>] [--quiet]`; default root is derived from installed location. The ASCII PS wrapper forwards Quiet, host executable and exit. Existing receipt check labels and hash formats stay unchanged; the checked tree/anchor identifies the implementation.
INFERENCE / resolution of R2B:134: migrate rule tests to in-process calls first, but have production `record` invoke the **Node CLI** initially, retaining its 900000 ms process deadline and failed-child handling (H:94-106). A synchronous in-process call cannot enforce an outer deadline against a CPU loop or process exit. Direct in-process record is an optional later optimisation requiring an equivalent fault/timeout boundary, not a condition for this migration.
FACT: A child that returns nonzero produces a failed check; a spawn error throws before Evidence (H:105-106,717-718). Preserve this distinction. All retained child calls get bounded timeouts; qualification tests cover signal exit, hang, missing executable, truncated output and invalid result, not just normal success.

### 7. Differential And TCB Verification

INFERENCE / proposal: Freeze the entire reference dependency tree at a named SHA plus file hashes, including its handoff/gate companions. A reference copied into the candidate root is not independent if it resolves candidate helpers. Run old/new on equivalent isolated fixture states with pinned Git history, manifest role, environment and parser host. Store INPUT, raw OLD/NEW, NORMALISED_OLD/NEW, independently EXPECTED, DIFF and side-effect snapshots.
INFERENCE: Derive expected outcomes from decisions and consumer contracts independently of implementation; a separate harness author owns normalization. Both are candidate contributors, neither a final certifier. Review each other's contract/harness before freeze, while final certifiers remain outside execution/control. Old self-comparison validates the harness, not the new engine.
INFERENCE / normalizer allowlist: replace only the known absolute fixture-root field, output transport CRLF and colour escapes; isolate explicit runtime-version fields within a pinned host lane. Do not alter fixture bytes, relative path spellings, counts, severities, missing diagnostics, exit codes, evidence labels or semantic error details. Retain raw streams and diagnostic multiplicity.
FACT: V:306 iterates hashtable keys and V:1021/1051 iterates maps/collected keys; R1A's blanket line-order equality can conflate unordered enumeration with workflow sequencing. INFERENCE: self-compare the old engine repeatedly; if order varies, canonicalise only the documented independent enumeration group by ID/path/status/message, keeping inter-phase order and counts. An unrecognised output is a harness failure, not a line to drop.
INFERENCE / required corpus: all CM families with positives, each failure/warning branch, at/over thresholds, malformed inputs, roles, worktrees/no-history/dirty state, Unicode and NUL-listed filenames, traversal/drive/UNC/junction cases, encoding, dates/duplicates/supersedes, protected/light/strict gates, receipt tampering, host-command failure, missing capabilities and installed partial upgrades. Include D cases, actual PS parser failure and a present installer that exits nonzero.
INFERENCE / mutation budget: reject a universal mutation of every cosmetic PASS. Require omission/severity-inversion mutants for each security/false-green family (required files, UTF-8/ASCII/syntax, path containment, protected classification, immutability, receipt binding, digest and installer execution) plus each corrected defect. Each must be killed by an independently expected negative; zero unexplained survivors. Every remaining normative WARN/FAIL branch still needs an expected-outcome fixture.
INFERENCE: Harness self-tests drop/duplicate a diagnostic, change a counter, downgrade FAIL, corrupt a path and timeout a subprocess. They must fail. Qualified same-host differential equality, independent expectations, mutation and Windows/cloud boundary tests are complementary, not substitutes. The last accepted verifier and frozen reference check the replacement; the replacement never certifies itself.

### 8. Quick, Full And Shared Results

FACT: The validator CHECKS entry always has `quick:true`; both record modes therefore set `PROTOCOL_SKIP_GATE=1` (H:25-47,94-106). This skips the recursive freshness invocation, not structural gate checks (V:583-889). IM row 10 resolves to R2B's E-2, correcting DBI-17/call-graph shorthand.
FACT: Research/design uses quick under 0071 (DEC:2858-2862); it attests validator outcome plus entry/tree identity, explicitly not regressions or host tests (H:109-133). Full source adds the suite; full installed does not acquire source tooling; configured host tests run in full mode (H:30-47).
INFERENCE: Code, wrappers, helpers, tests and kernel/tooling retain full record. Analyse independently in parallel but serialise full suites on this workstation. Researchers cite a shared measured run; no participant imports another owner's receipt or converts a full-record requirement to quick. Keep explicit verify/deep/gate closure checks outside the recording recursion.
FACT: H:717-721 anchors after checks, not before. INFERENCE: qualify an isolated nonmoving candidate and record start/end identities; report concurrent-change uncertainty rather than claiming matching final hashes prove temporal stability. No shared-attestation schema is introduced.

### 9. Implementation DAG And Ownership

INFERENCE / proposal: CO coordinates authority; I is the single integrator; X/Y implement disjoint modules; E authors expected fixtures; T implements the harness/measurements; R reviews; C1/C2 independently certify. These are roles, not fixed brands. Candidate authors/controllers, including E/T, cannot fill C1/C2. Selection must also meet the current role-resolution decisions at actual launch.
INFERENCE / schedule: `P0 -> S -> F -> {X || Y} -> A -> Q -> R -> {C1 || C2} -> O -> D -> R -> {C1 || C2}`. At most two code write streams; I-owned shared-file work pauses module writers. E then T prepare sequentially before X/Y. C1/C2 work independently in parallel; their required expensive checks use the single suite slot.
INFERENCE / proposed packets (all paths relative to the repository; all unowned paths and all other journals forbidden):

| ID / role | Goal, inputs and owned paths | Dependency / acceptance / rollback |
|---|---|---|
| P0 / CO | Owner-approved timing/scope; locked DECISIONS/REGISTRY/TASK/PLAN only. | No implementation before authority. Verify provenance; amend future authority by new block, never erase history. |
| S / I | Independent PS-only test-split experiment; owns declared validator-test replacements, `tests/helpers.cjs`, manifest. | P0 or separate explicit tooling authorisation. Preserve every stateful scenario and real/stub identity; full checks, own qualification. Revert this cohort independently; no caller change. |
| F / E then T then I | E: `tests/validator-expected.cjs`, frozen scenario/defect spec. T: differential harness, baseline/mutant experiment plan and raw results under `docs/research/validator-migration-qualification/`. I: API/ordering spec and inventory packaging. | S measured first; freeze reference, expectations and interfaces before port. Harness fault-injection passes. No green leaf closure until its required manifest entries are integrated. |
| X / implementer | `.ai/bin/validator/repository.cjs`, `text.cjs`, own module tests. | F; parallel Y only. Paths/Git/roles/bytes/counter negatives and import purity. Old engine stays active; discard candidate cohort to roll back. |
| Y / implementer | `.ai/bin/validator/governance.cjs`, `platform.cjs`, own module tests. | F; parallel X only. Limit policies, gate/decision/platform negatives including present-but-failing installer. Rollback as X. |
| A / I | `.ai/bin/protocol-validate.cjs`, wrapper, H's invocation/gate adapters, helper fixture modes, manifest, declared CLI/gate tests and CI wiring. | X/Y finish. Ordered results, repeated-root isolation, unchanged receipts, real/stub identity, install/upgrade and bounded CLI errors. Whole integration-cohort rollback. |
| Q / T | Qualification reports plus `tests/validator-mutations.cjs` mutation driver; never edits canonical candidate modules. Mutate disposable candidate copies. | A frozen. Differential/expected/mutant/platform/performance/rollback tests; hash every mutant and record killed/surviving. Failure returns named defect, not a broad rewrite. |
| R / I then reviewer R | Unified prompt and R's separate controller review under owner-approved source review paths. | Q. Exhaustive scope, differences, defects and evidence; no mandatory unresolved issue. Stop for bounded correction; neither author certifies. |
| C1/C2 / certifiers | Separate immutable reports and own Evidence only; identical frozen input, distinct TCB vs platform/performance angles. | R; parallel independent analysis. Full and differential checks, complete required capabilities, rollback; FAIL/BLOCKED prevents adoption. |
| O / CO then I | Approved adoption metadata and bounded source/disposable-installed observation record. | Pair accepted and applicable owner deployment authority. Quick/full/failed-host-command/PS-negative/upgrade cases. Restore whole prior package on regression. |
| D / I | Declared duplicate structural/path removal and retirement map; same shared surfaces as A. | O. One semantic owner per retained rule, no active old-engine route, reference retained in test/history. New protected delta repeats Q/R/C1/C2 before landing. |

INFERENCE: Every executable/candidate-kernel packet and certification observes the binding T7 floor (0072), then current launch-time uncertainty/risk selection; advisory review-only packets use their rubric. Each packet fixes exact filenames before execution, not glob-based permission to edit another writer's tests. Keep the suite orchestrator; F/Q run qualification commands explicitly in addition to the ordinary full suite.
INFERENCE: S is optional evidence gathering, not an excuse to defer the decided destination indefinitely. If no independently green split can be integrated cheaply, stop S, retain its result, and compare the unchanged ordinary workload. F must not inherit an untested split silently.

### 10. Rollback And Phases

INFERENCE / proposal: Freeze a currently verified full pre-switch package as rollback anchor; neither the latest tag nor this analytical baseline is automatically that package. Shadow Node never replaces operational PS until qualification, two-certifier acceptance and applicable owner authority. Then observe finite source/installed cases; retire duplication only as an authorised, separately qualified protected delta.
INFERENCE: Rollback restores engine, adapters, wrapper, manifest and installed managed bytes together using the supported upgrade/reconciliation path; preserve host-owned TASK/PLAN/DECISIONS/journals. Wrapper-only routing is insufficient once helpers or asset inventory changed. No consumer repository is upgraded from this research session.
INFERENCE: Qualify forward install, Force, partial upgrade and backward package restoration; verify both required files and contentDigest. New files not removed by the old installer need an explicit retirement inventory, not blind deletion of unknown host files. Re-run old validation and failed-case tests after restoration. No receipt/schema migration is needed.
FACT: Task-scoped historical receipts are not retroactively invalidated by unrelated later changes (DEC:1822-1826). INFERENCE: If rollback is caused by a false green, identify affected anchors/checks and revalidate dependent acceptance claims; do not treat cryptographic integrity as correctness or erase historical Evidence. Record a new disposition/receipt where required.

### 11. Acceptance Metrics And Causal Limits

FACT: The probe labels calls by `-File` basename (`tools/ps-probe.cjs:7-20`); `tests/helpers.cjs:62-92` installs a same-name stub. M-06 therefore cannot establish 201 real checks or a 2.91 s real-engine mean. V:37-54,1090-1092 launches descendants outside that Node probe. The 300 count is neither all children nor an engine-invariant metric.
INFERENCE: Sum-of-duration ratios do not allocate wall time or CPU. Serial test design is a supported critical-path explanation; pure validator computation, Git, IO and loaded startup fractions remain UNKNOWN. M-15 demonstrates CPU saturation and memory pressure, not a measured IO/process-limit bottleneck. Concurrency 2/6/8 has no measured forecast.
INFERENCE / preregistered qualification: use three matched baseline/candidate pairs on the same logical scenario set, toolchain, host and worker cap; full suites never overlap. Measure normal workload separately from total qualification cost. A scheduling-only split and an engine change get separate comparisons. Rerun a noisy pair under recorded controlled load; do not retroactively change thresholds.

| Metric | Baseline | Required target / failure rule | Method and optional stretch |
|---|---|---|---|
| Real-tree validator wall | M-01 ~3 s historical; matched median Bv still needed | Median <= Bv with identical required checks; unsupported comparison blocks claim | Monotonic CLI/library timings separately; <=1 s is unproven stretch. |
| Ordinary full suite | M-03 302-322 s; matched Bs needed | Median <= Bs; no missing scenario/skip disguised as speed | Same scenario map; report serial tail and end-to-end record cost. <=120 s stretch, not a prediction. |
| PS births / all child births | M-05 300 observed only; true Bps/Ball unknown | Candidate <= matched Bps/Ball on equivalent normal workload, or explicitly justified reviewed structural exception before acceptance | OS parent-child process tracing including nested PS; label real/stub targets. No <=20 or <=300 gate from the old probe. |
| Peak memory | M-15 whole-machine minimum 3.4 GB free at three suites; candidate-process Bmem unknown | Matched peak tree memory <= Bmem; any OOM or orphaned child fails | Same process-tree accounting, unrelated load recorded. No invented MB target. |
| Parallel validators | No matched 2/3/6/8 validator baseline | At each preregistered concurrency, zero timeout/OOM/output contamination; candidate p95 latency and batch wall <= reference under matched load | Read-only validator batches distinct from full suites; collect baseline first. Do not extrapolate M-14 to validator batches. |
| No-PS behaviour | H:89-105 cannot launch the validator without PS | API imports and portable checks execute; missing required checks are explicit and non-green | Hermetic no-PS fixtures for source/installed; successful partial Evidence is not a goal of this plan. |
| Correctness/parity | No Node candidate, hence no measured zero | Zero unexplained semantic differences, missing required cases or surviving required mutants | Raw plus normalised outputs; complete platform lanes and negative checks. Any omission blocks cutover. |

INFERENCE: Non-regression alone does not prove the speed motive. Claim a speed benefit only when it exceeds measured reference variability. If no gain appears, the owner can still judge the already-approved structural destination, but the report must not call performance successful. Record engineering/review hours and total qualification cost so early-timing value is assessable.
OPEN QUESTION (measurement work, not owner policy): T must capture real/stub tags, all-descendant births, per-check costs and isolated RAM before numerical qualification. The coordinator alone may run `powershell -NoProfile -ExecutionPolicy Bypass -File .\test-protocol.ps1` with the named instrumentation. No new full suite was needed or run in this research.

### 12. Certification And Residual Risks

FACT: 0038/0041 require the unified audit package and at least two parallel independent certifiers; authors/executors/controllers remain excluded even in another frame (DEC:1792-1796,2336). Research quick Evidence certifies neither the proposed design nor a future implementation.
INFERENCE / launch gates: adopted timing/scope; frozen contract/reference/expected/platform boundary; named file owners; two eligible independent certifiers available; unchanged receipt format; exact qualification commands; reversible package and ordinary/full plus differential acceptance. Missing capability is BLOCKED, reproduced mandatory defect FAIL; neither is downgraded by a majority.

| Risk | Coverage / cost | Residual |
|---|---|---|
| Shared wrong contract | Independent expected author, targeted mutants and two certifiers; extra fixture/review work | Unexercised behaviours; trace every normative family. |
| Platform false green | Native parser and installer negatives, PS5.1 lane, no-PS failure; platform execution cost retained | Cloud cannot complete all checks without PS. |
| Fixture/stub substitution | Explicit modes, target identity logged, scenario mapping; one helper migration | Unit isolation never replaces CLI/integration proof. |
| Moving reference or candidate | Immutable dependency trees/start-end hashes; temporary storage and rebaseline cost | External environment noise must still be measured. |
| Rollback leaves invalid installation | Whole-package drill and asset inventory; installer test cost | Host-specific histories need their own upgrade tasks. |
| Coordination exceeds benefit | Two write streams, one integrator, S separate; bounded remediation | Port/review cost unmeasured; no claimed break-even. |

### 13. Genuine Owner Decisions

OPEN QUESTION O1: Approve advancing the bounded validator migration inside CORE-ARCH, with its sequencing relative to package I-a and the scope/acceptance/retirement envelope above, by superseding only 0039 item 3's timing for this work. Recommendation: approve the staged route, not immediate deployment. Existing freeze exception applies only because the work is explicitly inside CORE-ARCH.
INFERENCE / filter: Do not re-ask Node, differential verification, two-certifier independence, research quick/full rules, installer retention or receipt formats. Module layout, fixture staffing separation, CLI-first record, measurement commands and minimal mutation coverage are technical synthesis proposals resolved here. Do not ask for missing-PS green Evidence: this plan rejects weakening it. Actual staffing unavailability is escalated only if launch preflight establishes it, not speculated now.

### 14. Rejected Alternatives And Issue Closure

INFERENCE: Reject immediate big-bang adoption, multiple writers on shared core files, permanent dual authority, self-parity using candidate helpers, gate weakening to get cloud success, receipt-schema changes, unconditional in-process record without crash isolation, broad runner/installer rewrites and unmeasured speed/process promises. Retain PS-only test optimisation as a valid interim experiment, not a replacement for the decided destination.
INFERENCE / explicit IM dispositions:

| IM row | Resolution in this synthesis |
|---|---|
| 1 Timing | Section 1/O1: recommend bounded early move, no implementation before authority; Node itself stays decided. |
| 2 Test split | Sections 1/9/11: isolated S experiment, stateful coverage preserved; latency gain not yet confirmed by measurement. |
| 3 Mutation | Section 7: mandatory targeted false-green/security mutants, not every cosmetic line; Q owns disposable mutations. |
| 4 Bash | Section 5: preserve failure; assistant eligibility is not a hook-dependency waiver. |
| 5 No PS | Sections 5/6: partial analysis available, full success/Evidence not fabricated. |
| 6 Installer | Sections 2/5: keep execution under DEC-0010; add present-but-failing negative, no installer rewrite. |
| 7 Rollback | Section 10: whole package and installed-state drill, not wrapper alone. |
| 8 Retirement | Sections 9/10/12: explicit approved scope plus independent certification are complementary, not alternative authorities. |
| 9 Stub | Sections 6/9: preserve isolation intent via explicit fixture modes; a legacy filename stub is not the invariant. |
| 10 Gate skip | Section 8: both quick/full record skip recursive freshness only; directly checked in H. |
| 11 Gate cycle | Section 4: one structural analyser, separate receipt adapter, no whole-validator recursion; old oracle independent. |
| 12 Runner | Sections 2/9: keep PS orchestration, only necessary selection/wiring; a Node runner is not required. |
| 13 D-1..D-6 | Section 3: explicit case-by-case ledger, no excluded crash fixtures or unapproved defect repair/acceptance. |
| 14 Carry-forward | The later final plan still owes all owner section 28 A-AC sections and section 32's 13 success criteria, including an unapproved decision draft and exact launch conditions. A 14-answer synthesis is not that final deliverable. |

## Part 2: F-3P-1

### Evidence And Proposed Resolution

FACT: Starting status remains OPEN - HYPOTHESIS UNDER VALIDATION (`OWNER-DECISION-R3.md:460-478`). Neither accepted residual risk, a completed fix nor mandatory full sandboxing was authorised. Part 2 changes no Part-1 conclusion.
Part-2 aliases at cd90be1: L=`docs/research/2026-09-25-improvement-research/prompts/launch.cjs`; P=`docs/core-arch/stage-4/P-L3-004-route-failover.md`; Review-L=`docs/reviews/2026-09-25-deepseek-core-arch-stage2-review-packageL-third-pass.md`.
FACT: L:353-354 supplies an empty-prefix URL rewrite, L:407 a private shared-object clone, L:428-436 compares local files/HEAD/refs/config/hooks, and L:507 inherits the parent environment. None of these is a demonstrated write-credential boundary. Review-L:73-77 records a successful command-line and ambient-config bypass against disposable local bare repositories; that is cited prior reproduction, not a new remote test by this session.
FACT / own non-network reproduction: on Git 2.53.0.windows.2, the following two commands both exited 0. `--get-url` resolved URLs only; no credentials were read and no fetch/push was performed.

```text
git -c url.no-push://blocked.insteadOf= ls-remote --get-url https://example.invalid/repo.git
=> no-push://blockedhttps://example.invalid/repo.git
git -c url.no-push://blocked.insteadOf= -c url.https://example.invalid/repo.git.insteadOf=no-push://blocked ls-remote --get-url no-push://blocked
=> https://example.invalid/repo.git
```

INFERENCE: This confirms the URL-selection defect, not a fresh authenticated-publication result. A same-user Git wrapper or cleared environment is not proof against an arbitrary executable using accessible credentials. An external publisher is also not a security boundary if the executor can read its credentials or modify its code/config/hooks.
INFERENCE / recommended candidate: a small hybrid. Keep disposable job copies and selective export; use a default-no-publication task mode; put project write credentials and publication authority in a trusted delivery context inaccessible to job processes. A credential profile is sufficient only when its *effective inaccessibility* is tested, not when a few variables are deleted. Use a separate restricted OS principal/process boundary when same-user credential stores, SSH agents or launcher surfaces remain accessible.
INFERENCE: Protecting project remotes from unauthorised writes and preventing publication to **any** remote are different guarantees. Credential isolation can cover the first only where server authentication denies writes. It cannot prevent upload to an anonymous writable destination or a writable local bare repository. To promise the second under arbitrary shell execution, mediate/restrict outbound network access and filesystem access as well, or restrict tools to an enforced broker. Do not label the narrower guarantee as F-3P-1 closed.
OPEN QUESTION (policy): Adopt the threat coverage and pilot budget for this hybrid, including whether the no-publication requirement covers arbitrary external destinations. Recommended interpretation: retain the broad prohibition; test an enforced boundary for jobs with untrusted content. No unilateral risk acceptance or scope narrowing. Whether an existing client profile can satisfy it at acceptable friction is an empirical preflight, not a reason to assume a VM.

### Q1. Who Pushes

INFERENCE: Prefer external trusted publication for approved delivery tasks; research exports only allowed reports/journals and does not create commits. Agent push is one fewer handoff but repeats target/gate/recovery decisions in every agent and requires exposing publication capability. A trusted publisher costs one deterministic handoff yet centralises exact target, content and audit checks. A hybrid that lets arbitrary job types self-publish adds exceptions without measured need; reserve direct owner/release operation for an explicitly authorised context.
INFERENCE: Publisher validates an immutable local artifact/commit identity, repository identity, approved ref and expected remote base, plus gate results bound to that identity. It must not run job hooks/config or untrusted validation code with its write credentials loaded. Run tests in the job/credentialless verification context, then perform delivery separately; stop on artifact change between verification and publication.

### Q2. Isolation Levels

INFERENCE: Level 0 (instruction) is workflow guidance only. Level 1 (credential profile) reduces accidents but is not sufficient against a process sharing the owner's credential/file/socket access. Level 2 (restricted identity/process plus enforced resource access) is the candidate for repository writes and malicious-content exposure. Level 3 (hardened container/VM/network boundary) is reserved for stronger untrusted-code/tool threats or where level 2 cannot demonstrate the required isolation. Labels alone prove nothing; a container with host credentials or a writable broker mount fails the same tests.
HYPOTHESIS: A restricted Windows identity plus narrow brokered network/tool access will be cheaper here than universal VM execution. This has not been implemented or measured; client authentication and necessary provider traffic may constrain it. Test before selecting a universal execution substrate.

### Q3. Threat Model: One Primary Control Per Class

INFERENCE / proposed controls and residuals; threat probabilities are not measured:

| Threat class | Primary control | Verification / residual cost |
|---|---|---|
| Accidental push | Default-deny task mode enforced at delivery | An unapproved job cannot invoke publisher; low descriptor cost, raw shell remains separate. |
| Instruction drift | Immutable task authorisation separate from agent-editable output | Modified mode/target is rejected; low workflow cost, no self-escalation. |
| Tool misuse / alternate Git path | Effective removal of project write capability from executor | Test helpers, SSH agents, alternate binary and HTTPS paths; config cleanup alone is insufficient. |
| Autonomous adversarial behaviour | Enforced identity/process/filesystem and egress boundary | Attempts to reach owner/broker credentials, config and remote transports denied; higher setup cost. Kernel/admin escape is not claimed covered. |
| Malicious repository content | Untrusted code remains inside the credentialless execution boundary | Prompt/code-induced publication receives the same denial; publisher never executes repository hooks with credentials. Adds broker/export checks. |
| Compromised external tool/model | Separate least-privilege execution substrate and delivery trust domain | Revocable profile, isolated tools, no host credential mounts; strongest isolation only where lower controls fail. Host/hypervisor compromise remains outside the tested model. |

INFERENCE: F-3P-2 matters to this design despite being a different finding: Review-L:93-111 shows a job-writable shared hook path executing in the launcher. A publisher in that same writable trust domain is not trusted. Fix/verify that dependency before claiming external delivery isolation; do not turn this council into the correction pass for unrelated launcher issues.

### Q4. Correct Role Of ls-remote

INFERENCE: Keep before/after snapshots as a secondary tripwire/postcondition, obtained by the trusted controller with read-only credentials and all intended refs. A read failure is UNKNOWN, never evidence of unchanged refs. It is not primary prevention and not a complete event log.

| Scenario | Snapshot usefulness / blind spot |
|---|---|
| New ref, tag, branch create/delete, force update | Detects a lasting difference if the ref is included and readable. |
| Push then restore/delete | Same final snapshot is possible; intermediate objects/publication may remain. |
| Webhook/CI side effect | Effects may have occurred despite restored refs; only server-side event/audit evidence can corroborate them. |
| Alternate remote | A check of origin says nothing about another destination. |

FACT: These are specifically required scenarios in `OWNER-DECISION-R3.md:284-306`; CI in the baseline triggers on push (`.github/workflows/protocol.yml:8-12`). INFERENCE: unchanged final refs cannot prove that no CI-triggering transition occurred. Future acceptance must inspect receive events/side-effect counters as well as final refs.

### Q5. Minimal Delivery Descriptor

INFERENCE / proposal: Keep an enum, not a DSL: `git.mode = READ_ONLY | LOCAL_COMMIT | BRANCH_PUSH | RELEASE_PUSH`. READ_ONLY describes remote capability and may still permit named disposable report writes; it is not a blanket filesystem grant. LOCAL_COMMIT permits commits only where the task independently grants them. Push modes express delivery intent plus authorised targets, not credentials handed to the model.
INFERENCE: No-push descriptors need only the mode. A publishing descriptor also fixes a trusted repository ID, exact full ref(s) and authorised stage; the publisher binds expected old OID and approved new OID at delivery time. Release multi-ref publication requires explicit ref/action lists. Agent-editable remote names, wildcards, arbitrary shell snippets and free-text scope inference are rejected. Requirement to publish and capability to publish stay distinct.

### Q6. Who Selects The Mode

INFERENCE: Task author selects inside existing authority; an approved procedure can deterministically choose an equal or narrower mode. Agent requests escalation without receiving it automatically. A classifier may suggest a mode but cannot mint publication authority. Unknown/missing/invalid mode fails closed for delivery. PROTO-DEC-0070 forbids commits/tags/push for its research scope (DEC at cd90be1:2796-2812); a new mode does not override that decision.

### Q7. Default Deny

INFERENCE: Yes: absence of explicit publication authority means no remote mutation. This follows the existing no-push boundary rather than adding an owner confirmation to every allowed read or report write. Templates/procedures fill repeatable modes once; an approved publisher can deliver without repeatedly asking after its exact gates pass. Do not extend 0070's one-run client grants into a permanent global profile (DEC:2811-2812; 0047 item 7 at DEC:1981).

### Comparison Matrix

INFERENCE / relative design assessment, not measured cost or certified strength. Every security entry is conditional on the stated threat and configuration.

| Variant | Security | Complexity | Runtime friction | Maintenance | Failure recovery | Fit for current project |
|---|---|---|---|---|---|---|
| Instructions only | No prevention against tool misuse | Lowest | Lowest | Low | Detect/dispose incident after publication | Guidance only; not F-3P-1 closure. |
| ls-remote monitoring | Lasting known-ref detection, no prevention | Low | Read calls/authentication | Low | Investigate differences; transient blind spot | Secondary tripwire only. |
| Credential profiles | Reduces accidental authority; strong only if credentials really inaccessible | Low to medium | Client auth setup | Credential-store/platform drift | Revoke/rebuild profile | Necessary candidate; same-user env-only profile insufficient. |
| Task Git modes | Workflow authorisation, no physical barrier alone | Low | One enum/target record | Small schema | Fail closed on invalid/escalated mode | Use for predictable delivery, not sandbox claims. |
| External trusted push | Central target/stage enforcement if separately protected | Medium | Artifact handoff/gate lookup | Small publisher plus auth | Retry by exact OIDs after remote readback | Preferred delivery route; executor must lack bypass capability. |
| Windows user/process isolation | Can restrict host stores/sockets/files and broker tampering | Medium | Client profile/bootstrap | ACL and process-boundary checks | Dispose identity/profile, preserve result | First platform-specific experiment; egress still needed for broad no-publication. |
| Container | Conditional credential/FS/process isolation | Medium to high | Images and client compatibility | Image/mount/network policy | Rebuild image/run | Alternative where toolchain fits; host credential mounts defeat claim. |
| VM/strong isolation | Stronger boundary, still configuration-dependent | High | Boot/resource and artifact transfer | OS images/network policies | Snapshot/rebuild | Reserve for threats not covered below; not default by assertion. |
| Hybrid | Modes + proven credential/resource boundary + trusted publisher + tripwire | Medium if kept small | One preflight, normal local work, one delivery step | Targeted hostile regression set | No auto-retry on policy failure; inspect/repair boundary | Recommended hypothesis for a bounded experiment, not yet a fix. |

### Q8. Hostile Acceptance Suite

INFERENCE / required future test protocol: run only against disposable controlled local/server targets with synthetic credentials and receive-event logging, never owner production remotes. Exercise the actual launch profile including primary/fallback clients; do not test only a shell wrapper. A successful URL-resolution probe above is not this suite.
INFERENCE / no-push cases: direct push; longer `git -c url.*.insteadOf`; ambient and global/local config mutation; alternative remote and explicit push URL; tag; new branch; force update; credential-helper invocation; SSH-agent access; alternate Git executable/path; authenticated non-Git API transport; anonymous writable destination; accessible local bare target. Test network and local filesystem surfaces separately.
INFERENCE / pass rule: every forbidden attempt has no successful receive/publication event, no new remote ref/object accepted under the test contract, and no webhook/CI counter increment; not merely a nonzero client exit. A push-plus-revert fixture must be caught in event logs. The executor cannot access synthetic owner/broker write credentials, alter delivery descriptors or plant launcher/publisher hooks. An unreadable event log makes the case unproven.
INFERENCE / push-enabled cases: exact approved repository/ref/new OID works only after bound gates; before-gate, alternate repository/ref, tag, delete, force, changed artifact, stale expected old OID and replay with changed content fail. Simulate crash before delivery and after remote acceptance: reconcile remote identity before a retry; never blindly push again. Keep required read/auth/model execution and local tests working.
INFERENCE / falsifiers: any path publishes outside authority, same-user credentials remain recoverable, job code executes in credentialled delivery, or required clients cannot work inside the tested profile. Cost acceptance records setup, p50/p95 launch/delivery latency, extra owner interventions, authentication failures and ongoing maintenance against baseline. No invented latency threshold substitutes for an approved experiment budget.

### Q9. Reverse Hypothesis And Cost

HYPOTHESIS: Pure policy could be cheaper than prevention when all possible destinations are harmless disposable stores, no credential/valuable data is accessible and no side-effectful automation exists. That would be a bounded owner-accepted environment/risk, not a repair of the existing general claim.
INFERENCE / explicit comparison: define expected loss over N jobs as `N x risk severity x probability of violation x blast radius`; compare with `implementation cost + maintenance over that period + N x execution friction`. Keep dimensions consistent, e.g. owner-valued incident cost/time, and avoid multiplying probability twice. No measured incident probability, asset valuation or isolation cost is in this corpus, so neither inequality is established.
FACT: The bypass has a reproduction (Review-L:73-77) and repository pushes trigger CI (workflow:8-12). INFERENCE: branch restoration cannot bound blast radius to a reversible ref edit; publication and triggered actions can survive. This defeats an unsupported zero-impact assumption, not proof that universal VMs have positive value.
INFERENCE: Run the smallest effective hybrid experiment and measure the right-hand costs. If an existing low-cost enforced profile passes the hostile suite, reject extra isolation without added threat coverage. If the cheapest verified boundary costs more than the owner-valued risk, only the owner can accept a precisely described exception; do not close F-3P-1 by an agent's cost intuition.

### Q10. Safety Boundary Versus Workflow Boundary

INFERENCE: Both are needed for the claimed autonomous workflow: the task mode/stage says when publication is authorised; a separately protected capability boundary prevents publication when it is not. Correct scheduling with accessible write credentials is unsafe; isolated execution without task-bound delivery can still publish the wrong approved-looking artifact.
INFERENCE / final status: L-GIT-01 is a plausible compositional design, not demonstrated closure. Keep F-3P-1 OPEN until the scope of the guarantee is explicit, the chosen profile passes Q8, costs are measured and the protected implementation receives its required independent review. Do not edit package L, accept its residual, invoke a publisher or change client permissions in this research.
