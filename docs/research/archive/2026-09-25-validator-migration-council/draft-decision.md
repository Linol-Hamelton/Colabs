# Draft decision: validator migration (PROTO-DEC-0053 step b)

- Baseline-SHA: a4e6aef86440bc0e8da8f06c8f1d3f65af254367 (Part 1); cd90be1d3c1fede4e02f7ecff5b6507ea1f34338 (ODR and Part 2 inputs)
- Model: kimi-k3
- Model-maker: Moonshot AI
- Client: copilot
- Effort: high
- Task-frame / scope-id: task:vmc-draft (parent-scope program:validator-migration-council)
- UTC-date: 2026-09-25
- Mode: ADVISORY
- Owner override (chat 2026-09-25): this slot runs kimi-k3 / high through copilot instead of claude-fable-5-1 (README model table; R3-ADDENDUM section 2). Recorded; no relaunch requested.
- Corpus integrity: all 13 sha256 of `round3/CORPUS.txt` verified against the working tree at session start (own check). All three syntheses and the frozen corpus were read; divergences were resolved against corpus evidence, not by majority vote.
- Citations: `sA/sB/sC §n` = `round3/synthesis-{A,B,C}.md`, the section answering owner §24 question n; `Part 2 Qn` = its F-3P-1 answer n. `A:`/`B:`/`C:`/`DB:`/`CG:`/`CMAP:`/`DAG:`/`NIS:`/`IM:`/`chA/chB/chC:`/`M-nn` as defined in synthesis-A. `ODR` = `OWNER-DECISION-R3.md`; `L3` = `docs/reviews/2026-09-25-deepseek-core-arch-stage2-review-packageL-third-pass.md`; `launch.cjs`, `P-L3-004` and `.ai/DECISIONS.md` citations in Part 2 are at cd90be1.

A draft is not a decision (owner §25, §33; PROTO-DEC-0053 item 2). Critics answer point by point (D-01..D-18, F-01..F-08).

## Part 1: the validator migration

### D-01 — Timing (§24.1; IM row 1)
- ISSUE: migrate now or preserve the accepted schedule.
- SYNTHESIS A: keep current timing; the destination is settled, the date is not; phase-0 artefacts (contract freeze, fixtures, measurement plan) are research-grade and may be prepared any time; launch authority is the owner's.
- SYNTHESIS B: recommend a bounded early migration inside CORE-ARCH with an explicit timing supersession and registry trigger before code; until then preserve operational timing.
- SYNTHESIS C: preserve the scheduled timing unless the owner issues an explicit trigger directive.
- AGREEMENT: the Node destination is not re-asked (DBI-01 class A); timing is open and owner-owned (DBI-02 class D); nobody implements in this council.
- DIVERGENCE: sB actively recommends advancing (with freeze basis); sA/sC recommend preserving; sA would let phase-0 artefacts precede the answer, sB warns even the test split is not free tooling work outside the freeze.
- EVIDENCE: PROTO-DEC-0025 item 5 and 0039 item 3 (`.ai/DECISIONS.md:1171,1709`); DBI-42 (class F: moving the date needs an `owner-directive` trigger row); DB G-2 (the pilot that triggers v2.0 is itself deferred by 0048 item 1, so the accepted trigger is undated); chB P1.6 (outside CORE-ARCH the 0039 item 1 feature freeze also binds; 0054 item 2 lifts it only inside that program).
- PROPOSED RESOLUTION: preserve current timing; carry one timing question to the owner (D-17) with sB's bounded-early recommendation and its full freeze basis attached; phase-0 artefacts may be prepared only as deliverables of the approved plan, not before it.
- WHY: crossing DBI-42 without an owner-directive row is the one move the council may not make (owner §1; AGENTS §2); sB's recommendation is the strongest evidenced case for asking and is preserved verbatim in the question.
- WHAT WOULD FALSIFY IT: an owner directive approving early migration (sB's bounded scope then applies); a per-check profile (H-1) showing the port buys nothing — which would weaken the latency driver, not the cloud-Evidence and hand-parity drivers.

### D-02 — Exact migration scope (§24.2; IM row 12)
- ISSUE: what is IN/OUT of the port.
- SYNTHESIS A: engine CM-01..49 as Node library + CLI + thin wrapper; caller switch in `record` and test helpers (D10); wrapper/manifest packaging (D11); differential harness (D03); retirement of duplicated logic (D16) as a separate certified step; installer LATER (the "rarely run" rationale is falsified by M-07: 86 calls / 95.9 s; the disposition holds on M-11 and PROPOSAL 3.6); suite orchestration LATER; launcher inspection LATER but not under 0039 item 3 (chC's correction); the plan must state the relation of the DBI-19 handoff split to D10/D16.
- SYNTHESIS B: the same core, plus a minimal handoff caller adapter, explicit fixture modes, and narrowly necessary gate deduplication; the full handoff split stays a separate approved-direction backlog item (DBI-19 class C); only the shared completion predicates and the safe-path check are a migration dependency.
- SYNTHESIS C: strictly `validate-protocol.ps1` + wrapper; NIS list for the rest.
- AGREEMENT: core = engine + CLI + wrapper + harness + caller switch; installer, suite orchestration, launcher introspection, other scripts, MCP, AX, build system = LATER; Rust/another engine = class F reopen, not "never" (chC's correction to NIS:29).
- DIVERGENCE: how much handoff work is in scope — sB names a minimal dependency; sA leaves DBI-19 unscheduled but demands the plan state the relation.
- EVIDENCE: NIS:12-42; DBI-19 (class C, approved but unscheduled); M-07; chB E-6.
- PROPOSED RESOLUTION: scope = sB's list (the tightest set that still closes the gate cycle, D-10); DBI-19's full split stays unscheduled; the final plan states its relation to D10/D16 (sA's requirement kept).
- WHY: minimal scope that satisfies the decided cycle collapse without pulling a class-C project into this migration.
- WHAT WOULD FALSIFY IT: evidence that the gate dedup cannot be built without the full handoff split — then scope grows to DBI-19 and the plan must say so.

### D-03 — Behavioural contract and defect dispositions (§24.3; IM row 13)
- ISSUE: what freezes, and what happens to defects D-1..D-6.
- SYNTHESIS A: CMAP's 49 rows plus 18 hidden dependencies are the contract; defects default to PRESERVE under an explicit disposition ledger; a deliberate fix lands in both engines with fixtures, never opportunistically.
- SYNTHESIS B: CMAP is a coverage seed, not an infallible specification; per-row dispositions for D-1..D-6 (its table); crash cases stay in qualification with the crash pinned as expected output — never excluded; a reproduced protected-path false green blocks the candidate (0041 item 4).
- SYNTHESIS C: freeze observable outputs (tokens, Quiet semantics, header/summary grammar, exit 0/1, Evidence line formats); D-1..D-6 preserved by default until dual-engine fixes are approved via an exception ledger.
- AGREEMENT: freeze CM-01..49; preserve defects by default; any fix is a dual-engine, fixture-pinned, reviewed delta; EXPECTED results authored independently of both engines.
- DIVERGENCE: D-1 crash fixtures — CMAP's confound column allows keeping them out of the parity corpus OR pinning the crash; sB mandates pinning; sA accepts either.
- EVIDENCE: CMAP:16-81 (rows), CMAP:84-89 (defect table with confound flags); A:188-220 (hidden dependencies); A:225-227 (no opportunistic fixes); `.ai/DECISIONS.md:1795` (0041 item 4).
- PROPOSED RESOLUTION: freeze all 49 rows and the hidden dependencies; per-row defect dispositions follow sB's table; crash cases are pinned as expected output, never excluded (sB); the disposition/exception ledger (sA/sC — same artefact) is part of the certified set.
- WHY: sB's table is the only fully testable per-row disposition set, and CMAP's confound column requires exactly such per-row decisions before fixtures are authored.
- WHAT WOULD FALSIFY IT: a preserved defect that blocks a mandatory security fix — then a reviewed dual-engine delta with fixtures, never a silent change.

### D-04 — Defect D-2: the Node floor (§24.3 sub-point; DBI-23)
- ISSUE: three Node floors in the tree; which one the validator states.
- SYNTHESIS A: the floor becomes the strictest active consumer's (the suite's >= 22), pinned in fixtures, basis recorded — delegated judgement under owner §29.
- SYNTHESIS B: do not silently raise installed-host requirements; keep the suite's >= 22 and existing runtime acceptance during parity; qualify on baseline Node 22.21.0; any new runtime floor only in a separate compatibility decision.
- SYNTHESIS C: preserve by default (no specific rule).
- AGREEMENT: no silent change; pin in fixtures; qualification on 22.21.0.
- DIVERGENCE: adjudicate now by recorded delegation (sA) vs defer to a separate decision (sB).
- EVIDENCE: DBI-23 (class D, "candidate for delegated resolution once stated"); CMAP D-2 ("decide the floor once... pin it in fixtures"); `validate-protocol.ps1:347-350`; `test-protocol.ps1:13`; `.ai/bin/protocol.cjs:43`; H-6 (consumers at protocolVersion 1.9.0).
- PROPOSED RESOLUTION: state the floor once as the strictest active consumer (suite >= 22) with the basis recorded (sA's delegated resolution, which DBI-23 explicitly names as the route); enforcement changes nothing during parity — the statement lands with fixtures at qualification (sB's constraint).
- WHY: DBI-23 makes this delegatable once stated; deferring it re-lists a resolvable row as open.
- WHAT WOULD FALSIFY IT: an installed host on Node 18-21 that must keep passing validation (H-6) — then the floor becomes an owner-visible compatibility decision after all.

### D-05 — Target architecture (§24.4)
- ISSUE: the shape of the Node validator.
- SYNTHESIS A: Option B — Node core as in-process library + stable CLI + thin PowerShell wrapper; five modules maximum, one-way dependencies; no rule language, daemon or persistent cache.
- SYNTHESIS B: entry module + four cohesive modules (repository, text, governance, platform) + one small gate-structure leaf; entry owns ordered per-check calls and rendering; no DSL or plugin framework.
- SYNTHESIS C: the same four modules under `.ai/bin/validator/` aggregated by `.ai/bin/protocol-validate.cjs`, decoupled from `protocol-handoff.cjs`.
- AGREEMENT: Option B, entry + repository/text/governance/platform, one-way dependency graph; CM-24 line-limits get one owner (text owns the count, governance consumes it — chB P4.7).
- DIVERGENCE: only the gate-structure leaf (sB has it, sA defers the collapse) — resolved in D-10.
- EVIDENCE: the fourteen-criterion comparison B:87-104 (round 1), unrefuted in round 2 (chB P1); DBI-01.
- PROPOSED RESOLUTION: entry `.ai/bin/protocol-validate.cjs` + repository + text + governance + platform + gate-structure leaf; dependencies entry -> modules -> leaf, nothing imports upward.
- WHY: the minimum sufficient form of the already-decided Node direction; the leaf is the decided cycle collapse (D-10).
- WHAT WOULD FALSIFY IT: a module boundary that forces a cycle in implementation — re-plan the decomposition under the same frozen contract.

### D-06 — PowerShell boundary: parser and installer (§24.5; IM row 6)
- ISSUE: which operations remain PowerShell.
- SYNTHESIS A: the parser check stays a PowerShell subprocess (only PowerShell parses PowerShell); the ASCII byte scan moves to Node unconditionally (DEC-0001); the installer self-check is invoked when PowerShell exists — the false-green gap it closes is NORMATIVE; absence is a named WARN, never silent, never PASS; Windows PowerShell 5.1 is the parser host of record.
- SYNTHESIS B: the same, plus: the wrapper forwards the actual invoking shell path; pwsh is an explicit measured lane that never substitutes for 5.1; batch PS parsing into one subprocess per invocation if parity proves identical diagnostics; source self-check runs at most once.
- SYNTHESIS C: parser + installer self-check exclusively in PowerShell; byte checks native in Node; named WARN when PowerShell is absent.
- AGREEMENT: parser and installer self-check stay PowerShell; byte scan moves; absence is named, never silent; PS 5.1 on Windows is the acceptance lane.
- DIVERGENCE: sB's refinements (shell-path forwarding, pwsh lane, batching) — additions, not contradictions.
- EVIDENCE: A:120-149 (per-operation table); `validate-protocol.ps1:237-245,1086-1089`; chC P7 AGREE; chB OQ-3, E-3; `protocol.yml:3-6,28-31`; M-07 (per-call 1.11 s vs the 2.91 s validator mean of M-06 — scale argument, INFERENCE).
- PROPOSED RESOLUTION: adopt sB's refined boundary (it contains sA/sC and answers chB OQ-3): PS 5.1 host of record, pwsh explicit and measured, at most one parser and one self-check subprocess per validation, subject to parity-identical diagnostics.
- WHY: it is the only version that pins the parser host, the fallback order and the subprocess budget that D-15's metrics enforce.
- WHAT WOULD FALSIFY IT: pwsh fixtures showing grammar drift (the pwsh lane cannot claim 5.1 compatibility); a per-check profile (H-1) showing the self-check dominates run cost — retention is still NORMATIVE, so the remedy would be batching, not removal.

### D-07 — Bash severity (§24.5 sub-point; IM row 4; DBI-25)
- ISSUE: is missing GNU bash a FAIL, and does that conflict with PROTO-DEC-0019 (any assistant may take part)?
- SYNTHESIS A: deterministic rule — FAIL while `.claude/hooks/*.sh` wrappers are present, capability-conditional WARN when they are absent; the tree decides; no owner question.
- SYNTHESIS B: keep the current contract (FAIL); a hookless installation profile would be a separate policy change; no owner poll is needed to preserve current checks.
- SYNTHESIS C: not addressed beyond retaining the boundary.
- AGREEMENT: no owner question; the FAIL stays wherever tracked bash hooks exist.
- DIVERGENCE: tree-conditional downgrade (sA) vs unconditional preservation (sB).
- EVIDENCE: `validate-protocol.ps1:392-418`; A:134-136 (the wrappers are the only unasked enforcement); DBI-25 (class D).
- PROPOSED RESOLUTION: sA's rule bounded by sB: FAIL whenever any tracked bash hook exists in the tree; a WARN naming the skipped check only in a tree with no bash hooks; creating a hookless profile is out of scope (sB).
- WHY: repository evidence decides it (owner §29 first filter); an unconditional FAIL in a hookless tree would fail hosts where nothing needs bash, with no protocol benefit.
- WHAT WOULD FALSIFY IT: a tracked bash dependency outside `.claude/hooks/` that the trigger set misses — extend the set.

### D-08 — A run without PowerShell, and cloud Evidence (§24.5/§24.13; IM row 5; X-2; DBI-24)
- ISSUE: what a no-PowerShell run reports, and whether it can attest Evidence.
- SYNTHESIS A: named WARN plus an explicit not-run listing inside the Evidence block, with Windows CI as the parser enforcement lane; the policy choice is a genuine owner question.
- SYNTHESIS B: fail-closed — nonzero exit with named unavailable-check diagnostics and coverage; no green Evidence or certifying PASS from omitted required checks; not an owner question because this proposal does not permit partial-check receipts.
- SYNTHESIS C: named WARN ("parser not available; syntax check skipped") with byte/ASCII checks still enforced; silent skipping or unrecorded warnings rejected.
- AGREEMENT: never silent, never PASS-when-not-run; the two PowerShell-dependent checks are named; Windows PS 5.1 stays the acceptance lane.
- DIVERGENCE: the run's exit/attestation: PASS-with-named-WARNs (sA; sC's wording) vs nonzero fail-closed (sB); and whether the policy is an owner question (sA yes; sB/sC no).
- EVIDENCE: DBI-24 (class D; constraint: capability absence must not silently weaken checks; the observed `spawnSync pwsh ENOENT` session that could not record at all); `protocol.yml:28-36` (CI fails on WARN); CMAP CM-47 (exit codes are 0/1 only); A:127-155 (round-1 environment matrix: PASS with named WARNs); chA P4.6 (a WARN-token PASS changes what a receipt attests); IM row 5 ("evidence-conflict").
- PROPOSED RESOLUTION: the plan default is fail-closed for certifying Evidence (sB): a no-PS run exits nonzero with the two checks named as not run plus coverage — this preserves current attestation semantics and needs no decision amendment; the validator's diagnostics still name the skipped checks as WARNs (sA/sC content), so output stays informative. Whether a WARN-token PASS may ever attest Evidence equal to a full record goes to the owner (D-17 question 2).
- WHY: the conservative option needs no authority and keeps DBI-24's constraint; the permissive option amends what a receipt attests (0024/0032 territory, class A) — exactly the trade-off owner §29 reserves.
- WHAT WOULD FALSIFY IT: an owner directive authorising WARN-PASS no-PS receipts; or an H-3 measurement showing every target cloud host has PowerShell — the question then empties.

### D-09 — Node API and the `record` caller boundary (§24.6)
- ISSUE: the programmatic contract and how `record` calls the new engine.
- SYNTHESIS A: `validate(root, options) -> {diagnostics, counts:{pass,warn,fail}, exitCode, coverage}`, synchronous, explicit absolute root, invocation-local env, no global state, no auto-run, the library never prints; CLI `node .ai/bin/protocol-validate.cjs [--root <abs>] [--quiet]`; the legacy wrapper forwards byte-compatibly; `record` keeps a subprocess boundary (spawning the Node CLI) until an in-process adapter with a timeout/fault wrapper is separately qualified; exit 0/1, no exit-2 borrowing; coverage is not a success authority.
- SYNTHESIS B: the same API, plus: diagnostic `{id,status,path?,message}`; no stdout/writes/exit/cwd/env mutation, no persistent cache, no import-time execution; unknown arguments fail; Quiet suppresses PASS only; `record` initially spawns the CLI to keep the 900 s deadline, crash containment and nonzero capture; API-in-`record` deferred until measured benefit justifies equivalent hard containment; unexpected faults throw and exit 1.
- SYNTHESIS C: the same API shape; thrown unexpected exceptions fail closed (exit 1).
- AGREEMENT: complete on the API, the CLI, the wrapper contract and the subprocess-first caller integration.
- DIVERGENCE: none material; sB's text is the superset.
- EVIDENCE: B:135-141 (round 1); `protocol-handoff.cjs:94-106` (the 900 s deadline and nonzero capture), `:101-103` (synchronous callers); CMAP CM-04/05/47.
- PROPOSED RESOLUTION: sB's API and containment text; sA's rule that the in-process adapter is a separate qualification gate with a replacement for the 900 s deadline.
- WHY: the subprocess boundary is the only design that preserves the existing fault containment without new mechanism.
- WHAT WOULD FALSIFY IT: a measured in-process benefit with proven hard containment — the qualification gate is then met and `record` may call in-process.

### D-10 — The record -> validator -> gate-check cycle (§24.6 sub-point; IM row 11; X-7)
- ISSUE: the port must decide how the cycle collapses (CG §8).
- SYNTHESIS A: the Node validator consumes the gate through the existing callback boundary and never re-implements it; `gateCheck` in handoff stays the runtime receipt authority until D16; three gate implementations coexist during the overlap, bounded by phase gates; D16 is the exit.
- SYNTHESIS B: a small shared gate-structure leaf; dependencies entry -> modules -> leaf, and handoff's gate-check -> the same leaf plus its existing receipt verifier; the leaf imports nothing; standalone validation may invoke gate-check as a child for receipt binding (a bounded runtime round trip, not a require cycle); duplicate production predicates retire before the migration is declared complete.
- SYNTHESIS C: decouple from `protocol-handoff.cjs` to eliminate require cycles (no mechanism named).
- AGREEMENT: the cycle must be decided (CG §8); no require cycle; the two current implementations are not interchangeable (CG §3 row 2: Node adds receipt binding, PS adds the unified-adversarial and TASK-cited-review checks), so consolidation takes the union under golden fixtures.
- DIVERGENCE: collapse mechanism — shared leaf during the port (sB) vs bounded coexistence until retirement (sA).
- EVIDENCE: CG §8 ("any port... must decide how this cycle collapses"; the drift findings F-3/F-4 of the wave-C re-review); CG §3 row 2; chB P4.8.
- PROPOSED RESOLUTION: sB's shared leaf as the decided collapse, under sA's phase bound: the leaf is built in the module stream; the legacy PS gate code retires only with the PS engine at D16; during the overlap the frozen legacy implementations remain the oracle and the union-of-checks fixtures guard the consolidation.
- WHY: the leaf is the only proposal that removes the hand-parity drift driver without a require cycle; sA's coexistence survives as the transition state, not the end state.
- WHAT WOULD FALSIFY IT: the leaf cannot express the PS-only/Node-only check union, or forces a cycle — fall back to sA's bounded coexistence with the drift risk recorded.

### D-11 — Differential strategy and mutation scope (§24.7; IM row 3)
- ISSUE: how equivalence is proved, and how much mutation testing is mandatory.
- SYNTHESIS A: the old engine is the behaviour oracle during migration only, never the correctness oracle; per-fixture INPUT/OLD/NEW/NORMALISED/EXPECTED/DIFF with EXPECTED authored independently; the twelve fixture classes staged — required classes before any shadow run, the full matrix before the caller switch; a closed normalisation allowlist as part of the certified set; one forced mutation per NORMATIVE FAIL check at qualification time; determinism ordinal-pinned; any unexplained semantic difference FAILs; a timeout or skip is not equality.
- SYNTHESIS B: the same harness, plus raw stdout/stderr capture, capability and parser-version records; targeted mutation of a required sentinel list (path containment, strict decoding, required-file checks, protected-path forcing, receipt binding, native syntax, installer execution, skip-to-success, normaliser corruption), each killed by independent expectations; every other normative branch tested normally; no unproved obligation to mutate every cosmetic WARN; a separate adversarial reviewer checks expectation authority and the normaliser before qualification; mutations only in disposable candidate copies with before/after hashes.
- SYNTHESIS C: the twelve fixture classes, independent expected results authored outside implementer/controller, a strict normalisation allowlist, and mutation tests for every NORMATIVE check capable of failing.
- AGREEMENT: oracle roles, independent EXPECTED, closed allowlist, fixture classes and staging, determinism, fail-on-unexplained-difference, T owns mutations in disposable copies.
- DIVERGENCE: mutation breadth — every NORMATIVE FAIL check (sA, sC) vs the sentinel list only (sB).
- EVIDENCE: owner §23 q10 (common-mode); A:44-46; chA P1.3 (the cost objection); CMAP D-1..D-6 (parity alone preserves defects); IM row 3 ("challenged").
- PROPOSED RESOLUTION: one forced mutation per NORMATIVE FAIL check at qualification time (sA/sC), with sB's sentinel list as the mandatory minimum and his hardening kept (disposable copies, hashes, adversarial normaliser review); WARN-class checks are covered by branch fixtures, not mutation — sB's "cosmetic WARN" objection does not conflict with the FAIL-scoped rule.
- WHY: differential execution cannot prove a check exists; a silently absent non-sentinel FAIL check would pass a sentinel-only qualification; running at qualification only, not per commit, bounds the cost chA feared.
- WHAT WOULD FALSIFY IT: a measured qualification cost showing per-check mutation is infeasible — fall back to the sentinel minimum with the residual recorded.

### D-12 — Quick vs full strategy (§24.8; IM row 10; X-1)
- ISSUE: which Evidence mode each frame uses, and what each proves.
- SYNTHESIS A: settled by PROTO-DEC-0071; both modes set `PROTOCOL_SKIP_GATE=1` (FACT E-2), so round-1 zone A's "quick only" was wrong; `verify --deep` and gate-check closure stay; no imported or shared attestations; performance gates run on an isolated, unchanged candidate with start/end identity.
- SYNTHESIS B: the same, plus: quick proves the recorded validator outcome and tree identity, not regressions; a post-run anchor alone cannot prove an unchanged run — freeze the candidate and verify start/end tree as well as SHA.
- SYNTHESIS C: the same reconciliation of E-2 and X-1.
- AGREEMENT: complete.
- DIVERGENCE: none.
- EVIDENCE: DBI-17 (class A); `protocol-handoff.cjs:25-28,94-103,109-133,676-721`; `validate-protocol.ps1:869-885`; `tests/gate.test.cjs:275-311`.
- PROPOSED RESOLUTION: as agreed — research/design frames record `--quick`; the migration's implementation frames take full record; sB's start/end identity rule is added to every performance gate.
- WHY: binding decision plus a hole (anchor timing) closed at zero cost.
- WHAT WOULD FALSIFY IT: a decision amending 0071.

### D-13 — Implementation DAG and the test split (§24.9; IM row 2)
- ISSUE: the execution order under the anti-big-bang rule, and where the validator-test split lands.
- SYNTHESIS A: D00-D18 as in the DAG with ordered resolutions, and an independent test-split task BEFORE D00 as ordinary tooling work with a full record — it needs no port, attacks the 283 s serial tail directly and de-confounds the D12 performance comparison; stateful sequences preserved under a scenario coverage map.
- SYNTHESIS B: the same graph re-tabled as G0-G8 + X/Y/T streams with explicit owned/forbidden paths and per-task acceptance/rollback; the test split is an independently reversible predecessor (G2) but not free tooling work outside the freeze — a qualified experiment under the same bounded authorization; the matrix's class-A treatment of splitting is not an approved decision.
- SYNTHESIS C: the same phased DAG, two-stream cap, single-ownership boundaries.
- AGREEMENT: graph shape; two-write-stream cap; single integrator; mutation owned by T; EXPECTED for the defect/security classes counter-signed by a second party; the entry owns check order; CM-24 single owner; manifest equality — no leaf claims Completed over it; the fast-check stub stays until D10 replaces it with explicit fixture modes in the same integrator-owned change; §31 caps parallelism at two writers.
- DIVERGENCE: the test split's authorization — startable any time as ordinary tooling (sA) vs requiring the migration's (or its own) authorization first (sB).
- EVIDENCE: M-11 (283 s serial tail); IM row 2 (confirmed); chB P1.6/E-6 (the 0039 item 1 freeze covers non-P0 tooling changes outside CORE-ARCH; 0054 item 2 is the exception); `tests/validator.test.cjs:40-137` (stateful sequences); `tests/manifest.test.cjs:68-72`; `tests/helpers.cjs:89-92`.
- PROPOSED RESOLUTION: the test split is the DAG's first task, executed under the same owner authorization as the migration (or a standalone one if the owner grants it), with a full record; it is independently reversible and de-confounds D12; sB's packet table (G0..G8, X/Y/T roles, owned/forbidden paths) is the skeleton for the owner §30 task packets.
- WHY: `tests/` changes are protocol tooling (full record per 0071) and the freeze covers them (chB P1.6) — starting "any time" risks a freeze violation; sequencing first keeps the measured benefit and the de-confounding.
- WHAT WOULD FALSIFY IT: an owner directive granting the split standalone tooling status — it may then start before the timing answer.

### D-14 — Rollback and retirement (§24.10; IM rows 7-8; X-3, X-4)
- ISSUE: revert units, anchors, retirement authority, and what receipts mean after a rollback.
- SYNTHESIS A: anchors are tag `v1.9.5` plus a named frozen implementation baseline SHA; the PS engine stays in-tree until phase 6; whole-release rollback (X-3 resolved against wrapper-only routing: a wrapper-only downgrade keeps the new manifest entries in installed hosts); retirement needs explicit owner authority AND its own two-certifier acceptance (X-4 = both); the D12 drill re-runs the old path on the same fixtures; new-engine receipts stay valid under 0042, no re-record.
- SYNTHESIS B: the same, stricter on receipts — a cryptographically valid receipt from a defective validator is not proof of correctness: append the affected candidate/receipt identities and rerun the required checks after repair; never rewrite or bless old receipts; freeze the actual pre-switch release SHA, manifest and file inventory before integration; retirement scope is included in the original approved plan so it needs no redundant owner question later.
- SYNTHESIS C: multi-layer checkpoints anchored to `v1.9.5`; wrapper routing fallback for phase 4; full release rollback for phase 5.
- AGREEMENT: anchors; PS engine in-tree until retirement; frozen public command and summary/exit contract; no schema migration; one revertible commit per caller switch; retirement = owner authority AND two certifiers.
- DIVERGENCE: receipts after rollback — sA's "stay valid, no re-record" vs sB's "valid as history, correctness re-established by rerun"; sC's wrapper-routing fallback is superseded by the whole-cohort resolution.
- EVIDENCE: A:167-186; B:170-176 (round 1); chB P8.11 (manifest coupling); chA P5.9 (a git-cleanliness claim is not a drill); CG §3 rows 4-5; CMAP CM-46/47; `.ai/DECISIONS.md` 0042.
- PROPOSED RESOLUTION: whole-cohort rollback with the pre-switch SHA/manifest/inventory frozen before integration; retirement with both authorities; sB's receipt correction adopted verbatim; the D12 drill re-runs the old path on the same fixtures.
- WHY: 0042 binds receipts to tasks and forbids rewriting, but "valid record" is not "correct result" — the distinction costs one clause and closes a real attestation hole.
- WHAT WOULD FALSIFY IT: evidence that the cohort cannot restore installed-host digests — the cohort definition is then wrong.

### D-15 — Acceptance metrics (§24.11)
- ISSUE: what the candidate must measurably satisfy.
- SYNTHESIS A: non-regression floors (candidate median <= baseline median for validator wall, suite wall, all-descendant children, peak RSS); 0 unexplained mismatches; 0 missing required fixtures; stretch targets stay HYPOTHESIS; the all-descendant census is the binding process metric (the probe is blind to .NET children — E-5); floors alone cannot falsify the motive, so structural deliverables co-gate (chB P7.15); unmeasured baselines are measured once by the coordinator in phase 0.
- SYNTHESIS B: the same floors, plus structural thresholds: zero launches of the full legacy PS validator in the new normal path; parser <= 1 and self-check <= 1 subprocess per validation; paired peak-memory measurement; 2-3 concurrent validator-only requests in qualification (no 6/8-suite prerequisite); neutral speed is reportable if the structural consolidation holds; a claimed speedup is falsified by matched no-gain results.
- SYNTHESIS C: floors only (validator <= ~3 s median, suite <= 309 s, zero unexplained mismatches, zero OOM/timeouts).
- AGREEMENT: floors, not forecasts; zero-tolerance correctness gates; stretch targets non-binding; phase-0 baseline measurement by the coordinator; differential lane cost reported separately; coverage is never reduced to hit a number.
- DIVERGENCE: how much structural instrumentation is binding (sB's subprocess budgets and concurrency rows vs sC's minimal set).
- EVIDENCE: B:145-162 (round 1); M-01, M-03, M-05, M-11, M-15; chB P7.8, P7.15, E-5 (`tools/ps-probe.cjs:15-34` vs `validate-protocol.ps1:30-57`); DB H-1.
- PROPOSED RESOLUTION: sB's metric table plus sA's structural deliverables as co-gates.
- WHY: only this set is engine-invariant (E-5) and motive-falsifiable (P7.15).
- WHAT WOULD FALSIFY IT: matched no-gain results falsify a faster claim (neutral speed is then reported and the justification rests on structure); a required capability loss falsifies the architecture regardless of speed.

### D-16 — Certification (§24.12)
- ISSUE: how the candidate and the retirement are certified.
- SYNTHESIS A: binding procedure, no design freedom — unified adversarial prompt/report (0038), two parallel independent certifiers outside execution and control for the switch and again for retirement (0041), author/executor/controller never certify (0041, 0057 item 4), names from the 0047 item 1 availability order, at most three rounds then the owner (0047 item 5); a conditional gap exists (DBI-10: Codex's limits were recorded exhausted).
- SYNTHESIS B: the same, plus the T7 floor for candidate edits and certification (0072), certifier availability checked before implementation starts, separate quiet checkouts with start/end identity, and: a missing slot blocks certification — it never justifies self-certification.
- SYNTHESIS C: the same binding core.
- AGREEMENT: everything procedural.
- DIVERGENCE: only the framing of the slot gap (sA: conditional owner question; sB: hard block). Compatible.
- EVIDENCE: `.ai/DECISIONS.md:1671,1792-1796,1975-1981,2336,2858-2862,2908-2910`; DBI-09, DBI-10.
- PROPOSED RESOLUTION: as binding; availability checked at G0 (sB); if no independent certifier exists at implementation time, the gap goes to the owner (sA's conditional question) and certification waits.
- WHY: both readings are the same rule applied at two times.
- WHAT WOULD FALSIFY IT: a decision amending 0038/0041/0047.

### D-17 — Genuine owner decisions (§24.13; owner §29)
- ISSUE: what survives the §29 filter.
- SYNTHESIS A: two questions — timing (with its freeze basis stated) and the cloud Evidence policy (X-2); plus one conditional (the certifier slot gap).
- SYNTHESIS B: one — timing (O-1, with the supersession, registry trigger and CORE-ARCH freeze cover named); no cloud question, because this proposal permits no partial-check receipts; a raised Node floor or a requested partial-check receipt would create a separate policy question.
- SYNTHESIS C: one — timing.
- AGREEMENT: timing is genuine (DBI-02 class D; DBI-42 requires an `owner-directive` trigger row; the question must state the 0039 item 3 timing clause and the 0039 item 1 / 0054 item 2 freeze basis); everything else the corpus raised is settled, delegated or measurable.
- DIVERGENCE: whether the cloud Evidence policy is asked (sA) or foreclosed by the plan's fail-closed default (sB/sC).
- EVIDENCE: §29; DBI-02, DBI-23, DBI-24, DBI-42; chB P1 question 13 (B's round-1 owner question passes owner §1).
- PROPOSED RESOLUTION: carry TWO questions. (1) Timing — with sB's bounded-early recommendation, the supersession scope and the freeze basis attached. (2) Cloud Evidence policy — "may a no-PowerShell run that names its not-run checks attest Evidence equal to a full Windows record?" The plan proceeds fail-closed regardless (D-08); a "yes" amends attestation semantics, a "no" confirms the default. Plus the conditional certifier-gap question, asked only if it materialises. Zero further questions.
- WHY: question 2 is not strictly dominated — it trades what a receipt attests (chA P4.6) against blocking cloud recording entirely (the ENOENT incident, DBI-24) — so §29 reserves it; foreclosing it by design would still leave the owner unaware that the trade-off exists.
- WHAT WOULD FALSIFY IT: an H-3 measurement showing all target cloud hosts have PowerShell (question 2 empties); any owner directive.

### D-18 — Explicitly rejected alternatives (§24.14)
- ISSUE: the union of alternatives the council refuses, kept visible.
- SYNTHESIS A: optimise-only as end state; "not strictly necessary now" as a halt; the 80-90 %-benefit claim; long-lived dual engines; neutral core + adapters and a fifth architecture; Rust/non-Node; zero-PowerShell; per-test dual execution; persistent result caching; imported attestations; coverage reduction for performance.
- SYNTHESIS B: permanent dual engines; a rule DSL; replacing PS parsing; immediate in-process record; automatic WARN-only no-PS acceptance; persistent caches; full suite-runner/installer rewrite; parallel shared-file editing; performance targets from mismatched instrumentation; re-asking the Node destination; the test split is NOT rejected — it is the interim experiment, scheduled DAG-first.
- SYNTHESIS C: immediate full rewrite to fix test latency; a Node PowerShell parser; parity without mutation/goldens; Rust/Python; silent skips or unrecorded warnings on cloud.
- AGREEMENT: the union is consistent; no synthesis defends any rejected alternative.
- DIVERGENCE: none.
- EVIDENCE: B:78-83, 87-104 (round 1); C:10-18 (round 1); chC P1.6/P2.15/P6.6; DBI-03.
- PROPOSED RESOLUTION: adopt the union as the rejected list, with sB's note that the test split survives as a scheduled experiment, not an alternative.
- WHY: each rejection carries corpus evidence; the list is the critics' checklist against scope creep.
- WHAT WOULD FALSIFY IT: any alternative returning with new evidence through a REGISTRY trigger row.

## Part 2: F-3P-1 — how package L prevents a job from publishing to a remote

Status at start: `OPEN - HYPOTHESIS UNDER VALIDATION` (ODR STATUS). This part proposes one architecture with its justifying matrix row and the Q8 acceptance test (R3-ADDENDUM §1); it decides nothing, and nothing here changes a Part-1 conclusion. Hypothesis L-GIT-01 (task git modes, trusted delivery) is tested, not assumed.

### F-01 — Threat model: one minimum control per class (Q3)

| Threat class | Minimum control (converged) | Evidence |
|---|---|---|
| Accidental violation | Declared git mode + clone with no remote + the empty-prefix `insteadOf` rule in env and clone config | Direct forms blocked, exit 128 (L3 F-3P-1 baseline probe; `launch.cjs:353-354,415,507`) |
| Instruction drift | Launcher-owned immutable descriptor; the ticking `scopeCheck` (config/refs/hooks change = SCOPE_STOP); no mode upgrade from prose | `launch.cjs:428-437`; L3 F-3P-6 |
| Tool misuse (`-c`, ambient config, alternate remote/helper/executable) | Credential profile: no write-capable credential reachable from the executor env; `GIT_CONFIG_NOSYSTEM=1`, empty `GIT_CONFIG_GLOBAL`; the `insteadOf` rule stays as defence in depth with its `-c` residual recorded | Longest-prefix-wins defeats the empty prefix (L3 F-3P-1 bypasses A and B, exit 0; sB's independent `ls-remote --get-url` probe; git-config documentation) |
| Autonomous adversarial agent | Credential non-reachability enforced by a separate principal where the profile cannot prove it (Level 2); admitting this class at all is the owner's policy call | R-L3-004.9 assumes local cooperative mode (`P-L3-004:219`); L3 recommends recording the residual |
| Malicious repository content (injection steers the agent) | The same credential profile (no authority to misuse) + post-run `ls-remote` audit + selective copy-back that never imports refs/config | Study A reads untrusted content; a push "cannot be undone and leaves no artifact" (L3 F-3P-1); `launch.cjs:439-447` |
| Compromised external tool/model | Not addressable by package L config; Level 2-3 isolation — premature today (F-06) | sA/sB/sC Part 2 Q9 converge |

### F-02 — Divergences that shape the architecture

1. **Is the Level-1 credential profile sufficient?** sA and sC: yes for the current threat model — stripping `GH_TOKEN`/write PATs/SSH-agent plus config hygiene removes the precondition; Levels 2-3 premature. sB: only if write authority is genuinely unreachable — environment scrubbing does not cover git credential helpers that consult OS stores (external source: gitcredentials), sibling processes, APIs or writable publisher inputs; Level 2 (a separate Windows identity) is required where non-reachability cannot be enforced. Resolution: adopt the profile AND make its sufficiency a measured gate (F-05 canary tests), with Level 2 as the pre-named escalation — sB's condition becomes an acceptance test instead of an assumption.
2. **What is the protected boundary?** sB's OPEN QUESTION L-1: owner/project remote mutation only (all three syntheses' actual target), or every external publication/exfiltration destination (which needs egress control and changes cost materially)? This is the owner's risk-boundary choice; the draft targets the former and says so.
3. **Q9 wording.** sA/sC call the reverse hypothesis rejected for Level 1 (friction far below the irreversibility risk; ~50 lines in `launch.cjs` by sC's estimate); sB corrects the arithmetic frame (sum over threats of severity x probability x blast radius x job count vs implementation + maintenance + friction; the corpus establishes bypass feasibility, not attack frequency — "low probability" is not a measured rate). Resolution: adopt sB's formula and UNKNOWN probabilities; the qualitative verdict (minimum mechanism, no VM mandate) stands because the Level-1 cost is small under every probability.

### F-03 — Proposed architecture (variant 9, hybrid)

1. **Task git modes, default-deny (Q5-Q7).** A two-to-four-line descriptor: `git: {mode: READ_ONLY|LOCAL_COMMIT|BRANCH_PUSH|RELEASE_PUSH, target?, publishRequired:false}`. No declared publication = NO REMOTE MUTATION. Modes are procedure-derived with owner override at dispatch; agent escalation follows PROTO-DEC-0070 item 6 (to the owner, never self-approval); an automatic classifier may restrict, never grant (sB), and silent misclassification is rejected (sA). Unknown modes/refs/remotes are rejected; the descriptor is launcher-owned and immutable to the job (sB).
2. **Credential-separated executor (Q2, Level 1).** Every job runs with no write-capable git credential: no `GH_TOKEN`/write PAT, no SSH agent, `GIT_CONFIG_NOSYSTEM=1`, an empty launcher-owned `GIT_CONFIG_GLOBAL`; the existing `insteadOf` rule stays as defence in depth with its `-c` residual honestly recorded in R-L3-004.9 (L3 remedy 1). Sufficiency is proved by the F-05 canary tests; if any write route survives, the executor moves to a separate Windows identity (Level 2) — the pre-named escalation, not a redesign.
3. **Trusted external delivery (Q1 variant B; Q10).** The agent never pushes. For BRANCH_PUSH/RELEASE_PUSH the launcher/orchestrator — the only holder of write-capable credentials — publishes the approved immutable commit to the approved ref after validation passes, from a trusted clean context with an allowlisted exact refspec and expected old target OID; fast-forward only, deletion/force/tags only under explicit release authority (sB). The publisher consumes an approved result, never an agent's shell command. The F-3P-2 dependency (a job-writable shared hooks directory executes under launcher credentials, L3 F-3P-2) is closed before the publisher holds credentials (sB's condition).
4. **`ls-remote` before/after as audit, never enforcement (Q4).** Run after every job in every mode; before/after ref sets logged as audit evidence; a difference in a no-push mode is an incident invalidating the run. Known blinds recorded: transient push+revert, webhook/CI side effects, remotes outside the recorded list (sA's scenario table; sB's receiver-log recommendation).
5. **Research mode today.** Current research runs stay READ_ONLY/LOCAL_COMMIT under PROTO-DEC-0070 item 4 (commit, tag and push forbidden; out-of-scope diff = STOP) — the architecture adds the credential profile and the audit to what already exists, per the ODR decision principle (minimum mechanism that actually closes the threat model; no sandbox bureaucracy; safety x autonomy x simplicity x throughput balanced).

### F-04 — The matrix row that justifies it (ODR REQUIRED OUTPUT)

| Variant | Security | Complexity | Runtime friction | Maintenance | Failure recovery | Fit for current project |
|---|---|---|---|---|---|---|
| 9. Hybrid = 3 + 4 + 5 + 2 (credential profile + task modes + trusted publisher + ls-remote audit) | One control per threat class of the current model (F-01); defeats all URL-level bypasses by removing the precondition, not by chasing transports (L3 F-3P-1) | Low-medium combined (sA); medium, bounded (sB); med (sC) — ~50 lines in `launch.cjs` plus a delivery step (sC) | Negligible for research modes; one extra logged step for the rare publishing job (all three) | Single default path; isolation escalates only on measured need (sB) | Prevention plus an audit trail; delivery is retryable on the immutable request (sB) | RECOMMENDED by all three syntheses; sB conditions closure on L-1 and the F-05 acceptance |

Rows 1-2 are insufficient alone (instructions fall to one command, L3; ls-remote misses transient push); rows 6-8 are premature under the ODR decision principle (no measured incident, high friction — M-13's 519 ms idle process-table query prices per-job identity/container overhead).

### F-05 — Acceptance test (Q8): the hostile suite

Negative suite, no-push mode (sA's ten attempts, extended by sB): (1) direct `git push`; (2) `git -c url.<x>.insteadOf=<origin> push` (L3 bypass A); (3) an added alternate remote / explicit push URL; (4) clone config mutation (already SCOPE_STOP, `launch.cjs:434-435`); (5) ambient global config via `GIT_CONFIG_GLOBAL` (L3 bypass B); (6) tag push; (7) new-branch push; (8) force push; (9) the credential-helper / OS-store / SSH-agent route; (10) another git executable or absolute path; plus (11) hosting-API mutation, (12) transient push+revert, (13) branch deletion, (14) tampering with the descriptor, the publisher's executable/config/hooks or the approved candidate objects (sB). Environment rules (sB): disposable local/test remotes and synthetic canary credentials, never owner production targets; each authenticated transport and helper surface tested separately; credentials never printed; unknown coverage is BLOCKED, not passed.
Acceptance per attempt: exit != 0 AND identical before/after `ls-remote` ref sets AND no credential material reachable from the executor env (canary assertions) AND trusted receiver logs showing zero forbidden events (equal final refs alone do not prove absence — sB).
Positive suite, push-enabled modes: the approved target + stage + exact candidate succeeds; the same candidate to a wrong remote/ref fails; protected refs/tags/force/delete fail without explicit authority; publication before a passed validation fails; `publishRequired=false` never auto-pushes; READ_ONLY and LOCAL_COMMIT never publish; interrupted delivery resolves by exact remote/ref query — desired OID = recorded success, old OID = retry, third OID = conflict (sB).
Closure rule (sA, aligned with L3's proof-of-closure): F-3P-1 closes only when variants (2), (5) and (9) fail for lack of credentials even though git resolves a real URL — recording the residual alone does not close it; and only after the F-3P-2 publisher dependency is fixed (sB).

### F-06 — Proportionality (Q9) and the decision principle

Risk x probability x blast radius (sB's formula, summed per threat over the workload): an unauthorized push is irreversible and artifact-free (L3 F-3P-1; AGENTS §10), blast radius = every credential reachable from the job plus CI/webhook side effects; probabilities are UNKNOWN (bypass feasibility is established, attack frequency is not — sB). Cost of F-03: env sanitisation, a descriptor check, one ref-set diff per job, one delivery code path — low implementation and maintenance, zero friction in no-push modes (all three). Cost of Level 2-3 as a standing requirement: per-job identities or containers on this workstation — high, unmeasured, and unjustified while the current model is cooperative-plus-injection (sA's M-13 scale argument; sC's severity verdict). Verdict: the reverse hypothesis ("the finding is too strict") is REJECTED for the Level-1 profile (all three converge) and ACCEPTED for standing Level 2-3 isolation (all three converge; sB keeps it credible for bounded offline/no-authority tasks); Level 2 enters only through the F-05 gate. This follows the ODR decision principle: the minimum mechanism that actually closes the current threat model, security proportional to real risk, package L not turned into a security framework.

### F-07 — Q1-Q10 convergence map

| Q | Converged answer | Dissent / condition |
|---|---|---|
| Q1 | Variant B, external trusted delivery; the agent never pushes | none |
| Q2 | Level 1 credential profile now; Level 2 only on failed non-reachability; Level 3 rejected today | sB: Level 1 sufficiency is a measured gate, not an assumption |
| Q3 | F-01 table, one control per class | adversarial-agent class admission is the owner's call |
| Q4 | `ls-remote` = secondary invariant / tripwire / audit; never primary | sB adds receiver-side logs and explicit transient tests |
| Q5 | Tiny descriptor, four modes, no policy DSL | sB adds `publishRequired`, approved remote identity, full target ref, expected old OID |
| Q6 | Procedure-derived, owner override; escalation per 0070 item 6; classifier never grants | sB: unresolved classification fails closed |
| Q7 | Default-deny: no declared publication = no remote mutation; zero common-case load | none |
| Q8 | F-05 hostile suite with closure rule | none |
| Q9 | Reverse hypothesis rejected for Level 1, accepted for standing Level 2-3 | sB: probabilities UNKNOWN, formula corrected; no ACCEPTED-RISK marking |
| Q10 | Both boundaries, separate layers; the trusted publisher is where they meet | sB: the publisher sits inside the trust boundary — F-3P-2 first |

### F-08 — What stays open

- L-1 (owner policy): the protected boundary — owner/project remotes only, or all external publication destinations (sB's OPEN QUESTION; this draft targets the former).
- L-2 (measurement, not owner): credential-reachability proof under the actual configured identity, client compatibility with a separated identity, remote ACL coverage, and friction numbers (sB) — run as part of the F-05 gate.
- The adversarial-agent and compromised-tool classes stay open by design; admitting them is the owner's threat-model change and re-opens Level 2.
- ODR section 3's minor findings (stale second-pass references, the DeepSeek route, the `index.lock` policy) belong to the implementer's correction pass of package L; this answer does not depend on them (R3-ADDENDUM §1).
- Status if the critiques concur: resolved-by-design, pending owner approval; implementation is a separately authorised package-L correction pass (sA's proposed status).

---

*Nothing here is a decision (owner §25, §33; PROTO-DEC-0052 item 4; PROTO-DEC-0053 item 2). The two critics (synthesisers B and C) answer D-01..D-18 and F-01..F-08 point by point (owner §26).*
