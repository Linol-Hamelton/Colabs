# Final plan: validator migration (PROTO-DEC-0053 step d)

- Baseline-SHA: a4e6aef86440bc0e8da8f06c8f1d3f65af254367 (Part 1); cd90be1d3c1fede4e02f7ecff5b6507ea1f34338 (ODR and Part 2 inputs)
- Model: deepseek-v4-pro (route `deepseek/deepseek-v4-pro`)
- Model-maker: DeepSeek
- Client: Kilo
- Effort: unknown (the dispatch fallback route specifies no effort level)
- Task-frame / scope-id: task:vmc-final (parent-scope program:validator-migration-council)
- UTC-date: 2026-09-25
- Mode: ADVISORY
- Model route note (POST-BASELINE OBSERVATION): this slot was launched as kimi-k3 / high through copilot
  (`prompts/run-r3/final.md`; the owner override of COMMON-LAUNCH), and that run was marked FAILED in
  `round3/USAGE.md`. The coordinator then substituted `deepseek/deepseek-v4-pro` through Kilo as the
  fallback for the final and revise slots (commit `4a85a23`, `docs/ops/MODEL-ECONOMICS.md`, the
  `fallback` entry of `prompts/R3-DISPATCH.json`). This is a Tier-mismatch against the README table
  (final = T8 claude-fable-5-1 / high) and against the launch file; recorded here and in the session
  journal, no relaunch requested (COMMON-LAUNCH: "nobody answers questions during this run").
- Corpus integrity: all 13 sha256 of `round3/CORPUS.txt` verified against the working tree
  (LF-normalised blobs) at session start (0 mismatches). All of round 1, round 2, round 3,
  `draft-decision.md` and both critiques were read before this document was frozen.
- Citations: `sA/sB/sC` = `round3/synthesis-{A,B,C}.md`; `A:`/`B:`/`C:`/`DB:`/`CG:`/`CMAP:`/`DAG:`/
  `NIS:`/`IM:`/`chA/chB/chC:`/`M-nn` = the frozen round-1/round-2 corpus and `MEASUREMENTS.md`;
  `ODR` = `OWNER-DECISION-R3.md`; `L3` = `docs/reviews/2026-09-25-deepseek-core-arch-stage2-review-packageL-third-pass.md`;
  `CA-nn` = critique-A findings; `crB` = critique-B.
- Nothing here is a decision (owner §3, §33; PROTO-DEC-0052 item 4; PROTO-DEC-0053 item 2). Binding
  only through the owner's approval of section AB.

## Critic-finding dispositions (owner §27 step 1; C-final-plan step 1)

Critic A (synthesiser B's model, gpt-6-astra via Codex; correctness / TCB / security; verdict FAIL,
findings CA-01..CA-10) and critic B (synthesiser C's model, gemini-3.8-flash via agy; simplicity /
performance; 16 AGREE, 2 PARTLY AGREE). Every point below is ACCEPTED, REJECTED, or OWNER DECISION
REQUIRED. Both critics shaped this plan, so per S-003 step 7 neither is independent of it when the
implementation is certified.

| Finding | Verdict | Resolution carried into this plan |
|---|---|---|
| CA-01: D-04 derives an installed-runtime floor (>= 22) from the suite's floor without authority (DBI-23 names delegation a candidate, not a grant) | ACCEPTED | The validator's baseline runtime acceptance is preserved unchanged; qualification runs on the baseline Node 22.21.0; the suite floor stays the suite's; any new validator runtime floor is a separate compatibility decision. D-2 stays a documented preserved defect. Verified: `test-protocol.ps1:13` rejects majors < 22; the validator accepts any running Node (`validate-protocol.ps1:344-360`). crB's D-04 partially agrees with the same resolution. |
| CA-02: D-07's tracked-hook predicate is a contract change (baseline FAILs on missing GNU bash at `validate-protocol.ps1:408` before any hook test) | ACCEPTED | Preserve baseline behaviour exactly: missing GNU bash is FAIL wherever the check runs; a hookless-installation profile is a separate policy change, out of scope. sA's tree-conditional WARN rule is dropped. Verified (`:392-418`). |
| CA-03: D-08's "nonzero with WARNs" contradicts the exit contract (exit 1 iff failures > 0, CM-47); source/installed roles conflated; "fail-closed blocks recording entirely" is wrong (`protocol-handoff.cjs:94-106` captures a child's nonzero) | ACCEPTED | A no-PowerShell run emits named required-capability FAIL diagnostics so counts, summary and exit 1 agree; informational WARN detail may accompany. Installed role lacks the required syntax capability; source role additionally lacks installer execution. Fail-closed runs record honestly as failures; recording itself is not blocked. |
| CA-04: D-10 freezes the oracle script but not its executable dependencies; a moved OLD would execute candidate gate predicates through its `gate-check` child | ACCEPTED | The OLD engine runs in an isolated reference cohort containing its original `.ai/bin/protocol-handoff.cjs` and transitive executable dependencies, manifest, fixture Git history and controlled environment; the dependency closure is hashed. Standalone-gate and record-skip fixtures stay distinct; the cohort is retained after retirement. |
| CA-05: D-16 misstates the batch budget — PROTO-DEC-0047 item 5 caps a batch at three certification rounds on distinct frozen candidates, no per-candidate reset | ACCEPTED | Verified (`.ai/DECISIONS.md:1979`). The plan carries the binding wording: at most three certification rounds on distinct frozen candidates per batch, per-root-cause remediation history preserved, owner escalation after the cap; no reset by re-freezing. |
| CA-06: F-01's control table reads more conclusively than the evidence; credential non-reachability is unproved; injected and deliberate agents run the same commands | ACCEPTED | Part 2 states each control as conditional: named protected assets, denied capabilities, the actual enforcement boundary and the recorded residual per class; the hostile suite tests injection-driven and deliberate bypass identically. |
| CA-07: F-03 item 5 permits LOCAL_COMMIT to current research; PROTO-DEC-0070 item 4 forbids commit/tag/push for the research run | ACCEPTED | Verified (`.ai/DECISIONS.md:2796-2799`). Current research runs are READ_ONLY with their explicitly permitted artifact writes. LOCAL_COMMIT belongs only to a task whose own authorisation permits commits. A mode restricts an authorised task; it never creates authority. |
| CA-08: F-04/F-06 overstate security and measured cost (M-13 prices a CIM query, not identity/container setup; "low cost wins under every probability" fails at p=0) | ACCEPTED | Part 2 marks runtime friction, maintenance and isolation overhead unmeasured; the reverse hypothesis stands as credible for bounded no-authority tasks and unresolved for the actual credential-bearing configuration; the qualitative minimum-mechanism recommendation is kept on conditional grounds only. |
| CA-09: F-05's closure sentence singles out attempts 2/5/9; an API route or publisher-input write could succeed meanwhile | ACCEPTED | Closure requires the whole conjunction: every applicable negative and positive case, declared-boundary acceptance, independent verification and actual F-3P-2 prevention; untestable routes leave closure unproved. |
| CA-10: F-08's "resolved-by-design when critics concur" would close an untested finding | ACCEPTED | F-3P-1 stays `OPEN - HYPOTHESIS UNDER VALIDATION`. This plan marks the architecture proposal ready for owner consideration; closure requires the approved implementation plus the full independent acceptance of section U / Part 2. |
| crB D-11 (mutation breadth): per-FAIL-check mutation is heavy; prefer sentinels, expand by coverage analysis | REJECTED as default, ACCEPTED as contingency governance | Per-NORMATIVE-FAIL-check mutation runs once at qualification, not per commit, which bounds the cost chA P1.3 feared; differential execution cannot prove a silently absent check exists, and a sentinel-only qualification would pass such an omission. If measured qualification cost makes the full set infeasible, lowering the mandatory gate requires re-approval under its delegated authority with the residual recorded (critic A's D-11 condition) — never a silent fallback. |

No finding is REJECTED outright except the default of crB D-11 (which survives as a cost-contingency
rule), and no finding is OWNER DECISION REQUIRED; the two/three owner questions in section AA and
Part 2 are policy questions raised by the corpus itself, not by a critic finding.

## Part 1: the validator migration

## A. Executive conclusion

The destination is already decided (Node engine with differential verification, PROTO-DEC-0025 item 5;
PROTO-DEC-0039 item 3) and is not re-asked. The evidence supports: KEEP CURRENT TIMING as the default,
with one owner question carrying sB's bounded-early recommendation (section AA); a bounded scope
(engine + CLI + wrapper + differential harness + caller switch + minimal gate-leaf dedup); a 49-row
frozen behavioural contract with preserved defects; staged migration with whole-cohort rollback and
two-certifier certification; two owner questions plus one conditional. Outcome class of owner §33:
KEEP CURRENT TIMING unless the owner directs otherwise — an evidence-supported outcome of the listed
set. Part 2 resolves F-3P-1 as a validated architecture proposal (variant 9, hybrid), status unchanged:
OPEN pending implementation and independent acceptance.

## B. What is already binding

- DBI-01 (class A): Node + differential verification is decided (`.ai/DECISIONS.md:1171-1172`; `:1709`).
  Reopening needs a trigger row; none exists.
- DBI-02 / DBI-42 (class D / F): timing "after the pilot report" is open; changing it needs an
  `owner-directive` row in `docs/decisions/REGISTRY.md` (PROTO-DEC-0033 item 3; AGENTS §6). The pilot
  that triggers v2.0 is itself deferred (0048 item 1; DB G-2), so the accepted trigger is undated.
- DBI-03: another engine is class F, not "never" (chC's correction to NIS:29).
- DBI-04: differential verification against the PowerShell reference is mandatory (0025 item 5; 0039 item 3).
- DBI-07/09/10: the validator is TCB; certification = PROTO-DEC-0038 item 1 unified prompt + report,
  0041 items 1-2 two parallel independent certifiers outside execution and control, 0057 item 4 author
  never certifies, 0047 item 5 batch cap (CA-05 wording).
- DBI-17 (class A): PROTO-DEC-0071 — research/design frames record `--quick`; code/tooling frames take
  full record.
- DBI-18 (class A): receipt formats and hashes frozen (0039 item 3); the Evidence line
  `- <check>: exit N in Ns` is a measurement interface (240 historical lines, M-01).
- DBI-19 (class C): the handoff snapshot/evidence/gate split is approved but unscheduled; it is not in
  this migration's scope (section F states the relation).
- DBI-21 (class C): documented commands keep working (owner §17).
- PROTO-DEC-0072: the T7 floor follows the frame's action; implementation and certification frames take it.
- 0048 item 7 / 0054 item 3: at most two active write streams; 0054 item 2 lifts the 0039 item 1
  feature freeze only inside CORE-ARCH (chB P1.6).

## C. Measured current bottleneck

- Full suite: 302-322 s today (M-03), 309 s instrumented (M-05); historical mean 224 s (M-02).
- Critical path: `tests/validator.test.cjs`, 283 s of the 309 s wall, 34 tests in sequence against the
  real validator (M-10, M-11; M-04: tests inside one file run in sequence).
- Spawn census: 300 observed Node→PowerShell spawns, 686.4 summed seconds (M-05); of which 201
  `validate-protocol.ps1` calls at 2.91 s mean (M-06) and 86 installer calls at 1.11 s (M-07).
  Caveats: M-06 mixes stub and real invocations in unknown ratio (chB E-1); the probe is blind to
  .NET-launched children (chB E-5), so 300 is not an all-descendant census.
- Validator alone: historical ~3 s median, range 2-12 s (M-01); per-check cost never measured (H-1).
- Cold start: PowerShell ~170 ms idle, Node ~80-99 ms (M-12).
- Concurrency: three suites in parallel pass 376/376 at 445-450 s each (M-14) with CPU at 100 % for
  ~3 minutes and free RAM down to 3.4 GB (M-15); 2, 6, 8 concurrent suites unmeasured.

## D. Root cause

FACT: the serial tail is causal for suite wall time — one file's tests run sequentially
(`test-protocol.ps1:28-29`) and the validator file dominates (M-11). FACT: the engine's language is not
shown to be causal for speed; Node-candidate speed is unmeasured (B:19, B:76). The port's real drivers
are structural, and all three are evidence-backed: (1) cloud/no-PowerShell recording — the observed
`spawnSync pwsh ENOENT` session that could not record at all (DBI-24); (2) the hand-parity drift class —
three re-implementations kept in step by comment already drifted once (CG §3; the 2026-09-20 wave-C
re-review findings F-3/F-4, cited at A:32-35); (3) TCB self-hosting — the validator participates in
certifying its own replacement (DBI-07). Performance relief alone does not need the port (test split,
section M); the port alone does not guarantee performance (floors, section V).

## E. Should migration happen now?

Default: preserve current timing. The port crosses two freezes — 0039 item 3's timing clause
(class F, DBI-42) and, outside CORE-ARCH, the 0039 item 1 feature freeze (chB P1.6; 0054 item 2 covers
that program only). sB's bounded-early recommendation is the strongest evidenced case and is carried to
the owner verbatim in section AA question 1. No phase-0 code artefacts start before the owner answers;
research-grade preparation (this plan, the frozen corpus, the measurement plan) is complete with this
document.

## F. Exact migration scope

IN: (1) the validator engine CM-01..CM-49 as a Node library + stable CLI; (2) the thin PowerShell
compatibility wrapper forwarding to it; (3) the caller switch in `record` and the test helpers, with
explicit real/stub fixture modes; (4) the differential harness, fixtures, normaliser and independent
EXPECTED results; (5) the minimal gate-structure leaf that removes the record→validator→gate-check
cycle (CG §8), consolidating the union of the two current, non-interchangeable gate implementations
(CG §3 row 2); (6) wrapper and manifest packaging; (7) retirement of the duplicated legacy logic as a
separately certified final step. Relation to DBI-19: only the shared completion predicates and the
safe-path check are extracted, because the gate cycle forces them; the full snapshot/evidence/gate
split of `protocol-handoff.cjs` stays an unscheduled approved direction. OUT: everything in section G.

## G. Explicit non-scope

- `setup-ai-protocol.ps1` migration: LATER. The NIS "rarely run" rationale is falsified (M-07: 86 calls /
  95.9 s per suite); the disposition holds on the critical path (M-11) and PROPOSAL 3.6. Its self-check
  invocation stays in the validator contract (section K).
- `test-protocol.ps1` orchestration: LATER (NIS:16-18); a Node runner enters only under separate approval
  (IM row 12 resolution).
- Launcher process inspection (`Get-CimInstance`): LATER, but not under 0039 item 3 as NIS:22 claims —
  that item names the `isProcessAlive` leaf, not the CIM table (chC's correction).
- Other PowerShell scripts, MCP (closed by 0045 item 1), AX, build-system rewrite: NO EVIDENCE.
- Rust / any non-Node engine: class F reopen (DBI-03), not "never".
- The full DBI-19 handoff split: unscheduled backlog.
- Per owner §21 last line: this migration does not expand into a general infrastructure rewrite.

## H. Current behavioural contract

The frozen contract is CMAP CM-01..CM-49 (INPUT / STATE / CHECK / OUTPUT / EXIT / SIDE EFFECTS /
CALLERS / AUTHORITY, classified NORMATIVE / ACCIDENTAL / CURRENT DEFECT) plus the 18 hidden
dependencies (A:188-220): status tokens and summary grammar parsed by CI and suites; the
`PROTOCOL_SKIP_GATE=1` handshake (0032 item 8); the gate-check last-non-empty-line interface; the
Evidence line format; `PROTOCOL_TEST_POWERSHELL`; the fast-check stub; the manifest as single
required-set source; installed `contentDigest`; WARN-first registry; `-Quiet` suppressing PASS only;
ordinal enumeration; the 2097152-byte corpus threshold; strict calendar dates. Defects D-1..D-6 are
preserved by default under an explicit disposition ledger with sB's per-row table; crash cases (D-1)
are pinned as expected output in qualification, never excluded; any deliberate fix is a reviewed
dual-engine delta with fixtures, never opportunistic (A:225-227). D-2 resolution per CA-01: runtime
acceptance preserved; floors are not harmonised by this migration. EXPECTED results are authored
independently of both engines; CMAP is a coverage seed, not an infallible specification — its normative
claims are checked against decisions, code and callers at contract freeze.

## I. Target architecture

Option B (owner §9), its minimum sufficient form: entry `.ai/bin/protocol-validate.cjs` plus four
cohesive modules `.ai/bin/validator/{repository,text,governance,platform}.cjs` plus one small
gate-structure leaf. Dependencies: entry → modules → leaf; nothing imports upward; the leaf imports
neither handoff, session nor entry (enforced by a future dependency test). The entry owns the exact
check order and rendering; modules export per-check functions (chB P4.12). Line limits have one owner:
text owns the count, governance consumes it (chB P4.7). No rule DSL, plugin framework, daemon, worker
pool or persistent cache. The fourteen-criterion comparison (B:87-104) stands unrefuted (chB P1);
alternatives are in section Y.

## J. Public Node API

`validate(root, options) -> {diagnostics: [{id, status, path?, message}], counts: {pass, warn, fail},
exitCode, coverage}` (sB's superset text, adopted). Synchronous (callers are synchronous,
`protocol-handoff.cjs:101-103`); explicit absolute root; invocation-local `options.env`; no global
state, no import-time execution, no printing, no cwd/env mutation, no persistent cache. Exit 0 = no
failing required check; 1 = validation failure, invalid invocation or required execution failure; no
exit-2 borrowing; coverage names executed/unavailable checks and is not a success authority. CLI:
`node .ai/bin/protocol-validate.cjs [--root <abs>] [--quiet]`; unknown arguments fail; Quiet suppresses
PASS lines only. The legacy `powershell -File validate-protocol.ps1 [-Quiet]` forwards byte-compatibly
(header, tokens, summary grammar, exit 0/1; CMAP CM-04/05/47). `record` keeps a subprocess boundary
(spawning the Node CLI), preserving the 900 s deadline, crash containment and nonzero capture; an
in-process adapter is a separate qualification gate requiring an equivalent hard timeout/fault wrapper —
not justified by a measured speed benefit alone.

## K. PowerShell compatibility boundary

- The PowerShell parser check (`validate-protocol.ps1:237-245`) stays a PowerShell subprocess: only
  PowerShell parses PowerShell (chC P7 AGREE). Windows PowerShell 5.1 on Windows is the parser host of
  record and the acceptance lane (CI, `protocol.yml:3-6,28-31`); pwsh is an explicit, separately measured
  lane that never substitutes for 5.1 (grammar-drift fixtures required, chB E-4/OQ-3).
- The installer self-check (`:1077-1102`) stays: the false-green gap it closes is NORMATIVE
  (`:1086-1089`); the wrapper forwards the actual invoking shell path; source role runs it at most once
  per validation; installed role keeps its existing non-installer path.
- At most one parser and one self-check subprocess per validation (batching allowed only where parity
  proves identical diagnostics).
- The ASCII byte scan moves to Node unconditionally (DEC-0001).
- Bash (CA-02): baseline behaviour preserved — missing GNU bash is FAIL; a hookless installation profile
  is a separate policy change, not this migration.
- PowerShell absent: named required-capability FAIL diagnostics per CA-03; never silent, never
  PASS-when-not-run; `.ps1` byte/ASCII checks still enforced.

## L. Differential verification architecture

The old engine is the behaviour oracle during migration only, never the correctness oracle (0025 item 5;
D-1..D-6). Per fixture: INPUT, OLD_RESULT, NEW_RESULT, NORMALISED_OLD/NEW, EXPECTED_RESULT, DIFF, with
raw stdout/stderr, capability and parser-version records. EXPECTED authored independently of both
engines; for the defect/security classes the expectations are counter-signed by a second party
independent of the fixture author (chB P9.10). Fixture classes: A's twelve, staged — FAIL/WARN branches,
path, encoding, gate, installed and capability classes before any shadow run; the full matrix before the
caller switch; plus the installer-present-but-execution-fails negative (chB E-3). Normalisation: a
closed, reviewed allowlist (absolute root, CRLF→LF on output transport, trailing whitespace, ANSI
escapes, version/executable-path tokens with presence preserved); never status tokens, message text,
ordering, counts, levels, relative paths, exit code, or input bytes (critic A D-11 condition).
Determinism: ordinal-pinned ordering; two runs of one engine on one fixture byte-identical after
normalisation; locale pinned. Mutation: one forced mutation per NORMATIVE FAIL check at qualification
time, with sB's sentinel list (path containment, strict decoding, required-file checks, protected-path
forcing, receipt binding, native syntax, installer execution, skip-to-success, normaliser corruption) as
the mandatory minimum; mutations only in disposable candidate copies with before/after hashes; a missed
mutant requires investigation, not automatically a new production defect; a separate adversarial
reviewer checks expectation authority and the normaliser before qualification. Cost contingency per the
crB D-11 disposition above. The oracle runs in the isolated, hash-verified dependency cohort of CA-04.
Any unexplained semantic difference FAILs; a timeout or skip is not equality.

## M. Test architecture

- Module unit tests with injected narrow reader/runner boundaries (internal test plumbing, never a
  production skip API); integration tests keep real Git argv, NUL path lists, real symlink/reparse
  checks and real parser/installer negatives.
- The validator-test split is the DAG's first implementation task (G2, section S), executed under the
  same owner authorisation as the migration (or a standalone tooling authorisation if the owner grants
  one), with a full record: it is protocol tooling (0071) and the 0039 item 1 freeze covers it outside
  CORE-ARCH (chB P1.6). It attacks the 283 s serial tail directly and de-confounds the G6/D12
  performance comparison. It preserves the stateful sequences (`tests/validator.test.cjs:40-137`) under
  a scenario coverage map; the changed test inventory and the explicit real/stub fixture modes are
  packaged together.
- The filename-based fast-check stub stays until the caller switch replaces it with explicit fixture
  modes in the same integrator-owned change (`tests/helpers.cjs:89-92`; chB P6.7); the split-only
  measured baseline is frozen, then port benefit is attributed against it (critic A D-13 condition).
- New test files fail manifest equality until the integrator packages them (`tests/manifest.test.cjs:68-72`);
  no leaf task claims Completed over that failure; the manifest gate is never disabled.

## N. quick vs full validation policy

Settled by PROTO-DEC-0071 (class A, DBI-17). FACT (chB E-2): both record modes set
`PROTOCOL_SKIP_GATE=1` (`protocol-handoff.cjs:25-28,94-103`; sole consumer `validate-protocol.ps1:870`);
round-1 zone A's "quick only" was wrong. Quick proves the recorded validator outcome plus tree
identity — not regressions, host tests, parity or receipt freshness; full adds the suite; `verify
--deep` and `gate-check` closure stay (`tests/gate.test.cjs:275-311`). No imported or shared
attestations; researchers cite the coordinator's measured suite result as input only; implementers
serialise expensive runs on this workstation. Performance gates additionally require an isolated,
unchanged candidate with start/end tree identity, because the record anchor is taken after the checks
(`protocol-handoff.cjs:717-721`; chB P3.8). Research/design frames (this council) record `--quick`; the
migration's implementation frames take full record.

## O. Cloud / no-PowerShell behaviour

Plan default (no decision amendment needed): fail-closed. A run without PowerShell executes every
portable check and emits named required-capability FAIL diagnostics for the checks that could not run —
syntax capability on both roles, installer execution additionally on source role — with coverage
listed; counts, summary and exit 1 agree (CA-03; CM-47). Such a run records honestly as a failure
(CA-03 correction: `record` captures the child's nonzero). Whether a WARN-token PASS may ever attest
Evidence equal to a full Windows record is owner question 2 (section AA) — it changes what a receipt
attests (chA P4.6; 0024/0032 territory), so owner §29 reserves it. Environment matrix (A:151-165,
corrected): Windows PS 5.1 full lane; Windows pwsh explicit plus the 5.1 compatibility lane;
Node/no-PS source and installed lanes with the fail-closed rule; linked worktrees unchanged. If a
required environment cannot be tested, that support claim is BLOCKED, not passed. H-3/H-4 (cloud
capability set, installer under pwsh/Linux) stay measurement tasks.

## P. TCB/self-update safety

The validator is inside the TCB (DBI-07); it participates in deciding whether its own replacement is
valid. The mechanism set (A §1, amended): old implementation as behaviour oracle during migration only;
differential fixtures with independent EXPECTED; golden fixtures for the defect/security classes;
mutation per section L; old/new dual execution on the real tree at phase gates and in CI on the frozen
tree, never per-test (M-06 cost); independent certification per section W; the N-1 role held by the
frozen reference cohort (CA-04) and git history plus tag `v1.9.5`, not by a second permanent production
engine; a frozen compatibility layer as an interface freeze (public command, Quiet, tokens, summary,
exit 0/1, Evidence line) — not frozen code. Distinction kept throughout: same-implementation agreement
is not independent evidence of correctness; parity preserves defects unless expectations are authored
from the binding sources (chB P1.10). A newly reproduced protected-path false green blocks the
candidate under 0041 item 4 even if OLD reproduces it.

## Q. Migration phases

Phase table per sB's section 10, adopted:

| Phase | Content | Old/new authority | Exit | Rollback |
|---|---|---|---|---|
| 0 (G0-G1, T0, G2) | authority recorded; contract/interfaces/ownership/scenario specification frozen; oracle cohort and EXPECTED/normaliser built; split-only baseline measured | old | every contract row has an owner, platform result, fixture and defect disposition; baselines Bv/Bs/Bn/Bm measured once by the coordinator | unchanged baseline |
| 1 (G3, X1-X2, Y1-Y2, G4) | modules and entry built beside the old engine; no caller change | old; Node experimental | module tests, import purity, no cycles, manifest complete | drop candidate branch |
| 2 (G5) | differential parity + mutation qualification | old; Node shadow | zero unexplained mismatches; sentinels killed; both platform/role matrices | stop; return the exact mismatch to its module task |
| 3 (G6) | caller adapters, wrapper, gate leaf, manifest, narrow CI wiring inside the candidate | old reference frozen; candidate not deployed | quick/full selection, failure propagation, no recursion, install/upgrade/rollback fixtures | whole pre-switch cohort |
| 4 (R1, C1, C2) | unified adversarial audit and two independent certifications | unchanged | both certifiers PASS/RECOMMENDATION on the frozen candidate | bounded remediation; batch cap applies |
| 5 (G7) | authorised adoption and bounded observation | switch operational authority only after acceptance | the observation case list of section U | whole-release rollback to the frozen pre-switch cohort |
| 6 (G8, R2, C1b, C2b) | retirement of duplicated production logic | Node; frozen PS remains test/history reference | its own protected-delta acceptance (owner authority AND two certifiers) | restore the pre-retirement release |

At no point may both engines silently diverge; a P0 change to the reference creates a new declared
baseline and invalidates affected parity/performance results.

## R. Rollback plan

- Anchors: tag `v1.9.5` (newest at baseline; manifest declares 1.9.6 uncommitted) plus the actual
  pre-switch release SHA, manifest and file inventory, frozen before integration (sB; a version name
  alone is insufficient).
- Revert unit: the whole pre-switch cohort — wrapper, modules, callers, manifest and packaged host
  files — never a wrapper-only downgrade (chB P8.11: an installed host would keep the new manifest
  entries). One revertible commit per caller switch (A:176).
- Drills: the D12/G6 drill re-runs the old path on the same fixtures; source and installed drills must
  pass the old commands and digests without deleting user state; a git-cleanliness claim is not a drill
  (chA P5.9).
- Artefacts after rollback: receipts stay valid as history under 0042 (engine-independent tree digest),
  but sB's correction is adopted verbatim: a cryptographically valid receipt from a defective validator
  is not proof of correctness — append the affected candidate/receipt identities and rerun the required
  checks after repair; never rewrite or bless old receipts.
- No schema migration; receipt and hash formats frozen (0039 item 3); user commands unchanged.
- Not safely reversible: deleting the PS engine before observation completes; renaming the Evidence
  check; changing gate-check semantics for existing journals. Each needs explicit owner authority before
  crossing.
- Retirement: explicit owner authority AND its own two-certifier acceptance (X-4 = both), with the
  bounded retirement scope included in the original approved plan so no redundant owner question arises
  later.

## S. Parallel implementation DAG

Anti-big-bang rule applied (owner §31): independent modules + frozen interfaces + one integrator +
differential verification; at most two write streams (0048 item 7); swarm size is not a metric. Graph
(sB's G-table, amended by CA-04/CA-05 and the test-split ruling):

`G0 → G1 → {G2, T0} → G3 → {X1 → X2, Y1 → Y2} → G4 → G5 → G6 → R1 → {C1, C2} → G7 → G8 → R2 → {C1b, C2b}`

Task packets (owner §30 fields, compressed; full field semantics as in DAG:40-82, which this table
refines):

| TASK-ID / ROLE | GOAL / NON-GOALS | INPUTS / BASELINE | OWNED PATHS | FORBIDDEN PATHS | DEPENDENCIES / WAITS FOR | EXPECTED OUTPUT / ACCEPTANCE / TESTS | RISK / TIER | PARALLEL WITH / HANDOFF TO |
|---|---|---|---|---|---|---|---|---|
| G0 / CO | Record approved timing/scope/assignments; NON-GOAL: runtime edits | Owner answer to AB; binding decisions | DECISIONS/REGISTRY append, TASK/PLAN under lock | runtime, tests, old decision blocks | council closure + owner approval | authorised frame, scope, budgets; append-only checks pass | unauthorised early start / rubric | none / G1 |
| G1 / I then T | Freeze contract, interfaces, ownership, scenario spec; NON-GOAL: engine code | K0 (CMAP + call graph + defect ledger), this plan, baseline a4e6aef | `docs/specs/validator-migration/{contract,scenarios,interfaces,ownership,performance}.md`, `oracle.json` | active validator/tooling, shared metadata outside lock | G0 | every CM row → owner, fixture, platform result, disposition; no dependency cycle | freezing a bug silently / T7 | none / G2, T0 |
| G2 / I | Independently reversible test split + explicit real/stub modes; NON-GOAL: engine changes | baseline tests; scenario map | `tests/helpers.cjs`, redistributed `tests/*.test.cjs`, manifest test inventory | engine, handoff, installer | G1; owner authorisation (migration or standalone) | split suite with identical scenario coverage; stateful sequences preserved; full record; split-only baseline frozen | coverage loss confounding G6 / T7 | T0 (disjoint paths) / G3 |
| T0 / T | Independent EXPECTED, normaliser, probe variants, oracle cohort | K0/K3; frozen PS tree incl. its handoff dependency closure (CA-04) | `docs/specs/validator-migration/qualification/`, fixture corpus | candidate code, helper/manifest edits | G1 | runnable corpus; hashed oracle cohort; counter-signed defect/security expectations; stub/real-tagging probe variant | common-mode authorship / T7 | G2 / G3 |
| G3 / T | Source-only differential harness against frozen interfaces | G2, T0 | harness under qualification/ | candidate modules | G2, T0 | harness runs OLD cohort vs stub NEW; self-perturbation fails as designed | oracle drift / T7 | none / X1, Y1 |
| X1, X2 / X | `validator/repository.cjs` then `validator/text.cjs` + own tests; NON-GOAL: other modules, shared files | K1/K2, contract | the two module files and their two test files | entry, governance, platform, shared helpers/manifest | G3; X2 after X1 (one writer) | path/role/digest and byte/count negatives pass; root/worktree/Unicode/junction fixtures | path escape, silent decoding / T7 | Y1→Y2 / G4 |
| Y1, Y2 / Y | `validator/governance.cjs` + `validator/gate-structure.cjs`, then `validator/platform.cjs` + own tests | K1/K2, contract | those module files and their test files | X and I paths | G3; Y2 after Y1 | governance negatives; real parser/installer failure fixtures; no hidden skips | cloud false green, parser drift / T7 | X1→X2 / G4 |
| G4 / I | Assemble `protocol-validate.cjs` entry/CLI; manifest and helper integration | finished X/Y | entry, API/CLI tests, manifest, helpers | worker module internals (reviewed integration fixes only) | X1-Y2 done | import purity, two roots, repeated calls, no require cycle, entry owns order | hidden global state / T7 | none / G5 |
| G5 / T | Differential + mutation qualification of the frozen candidate | G4, oracle cohort | qualification outputs | candidate edits | G4 | zero unexplained mismatches; every sentinel and per-FAIL-check mutation killed; both role/platform matrices; unknown coverage = not passed | equal false greens / T7 | R read-only / G6 |
| G6 / I | Handoff Node-CLI adapter, PS wrapper, gate leaf adapter, manifest, narrow CI wiring | G5, K4/K5 | `protocol-handoff.cjs`, `validate-protocol.ps1`, manifest, declared test/CI wiring | installer implementation, unrelated tooling | G5 | unchanged Evidence bytes, 900 s deadline kept, no recursion; install/upgrade/partial-upgrade/rollback fixtures; failing-host-command case | Evidence deadlock, broken installs / T7 | none / R1 |
| R1 / R | Unified adversarial audit (prompt ≤ 150 lines by I, report ≤ 250 by R) | G6 + qualification package | the two review files | candidate edits, certifier reports | G6 | complete scope/caller/platform/rollback audit; reproduced findings closed | incomplete audit / rubric | none / C1, C2 |
| C1, C2 / certifiers | Independent certification, semantics/TCB and platform/performance angles | frozen R1 package | own certification reports + journals | candidate, each other's output until frozen | R1; availability preflight passed at G0 | explicit verdicts with receipts; negative gate/receipt/path/installed tests; start/end identity | common-mode, self-certification / T7 always | each other (analysis; suites serialised) / G7 |
| G7 / CO+I | Authorised adoption + bounded observation | accepted C1/C2 pair | closure records, `observation.md` | consumer repos, new feature work | C1, C2 | observation cases of section U pass | unapproved deployment / rubric; T7 if tooling candidate applied | ordinary research only / G8 |
| G8 / I | Retire proved duplicate production paths | G7 + observation complete; retirement authorisation in plan | declared obsolete files, `retirement-map.md` | historical oracle/logs, unlisted helpers | G7 | each deletion mapped to replacement/caller/test; full + differential + rollback still pass | removing a rollback asset / T7 | none / R2 → C1b/C2b |

T finishes its artifact writes before simultaneous X/Y work or occupies one of the two writer slots
(critic A D-13). D09/D12/G5 failures return only the named defective task to remediation; the 0047
item 5 batch cap (three rounds on distinct frozen candidates, then the owner) applies across
certification (CA-05).

## T. File/module ownership map

Exactly one writer per shared surface (DAG, adopted): public API/ordering/CLI renderer and all shared
interfaces — I; `protocol-manifest.json` — I; `tests/helpers.cjs`, test splits and suite selection — I;
`protocol-handoff.cjs`, record path — I; the PS wrapper and CI wiring — I; oracle, fixtures, normaliser,
qualification artefacts — T; `validator/repository.cjs` + `text.cjs` — X;
`validator/governance.cjs` + `gate-structure.cjs` + `platform.cjs` — Y; TASK/PLAN/DECISIONS/REGISTRY/
ARCHIVE — CO under lock; review files and journals — their named sessions only. Globally forbidden:
other owners' files/journals, owner inputs, append-only history, consumer repositories, and
`setup-ai-protocol.ps1`, launcher, ledger/verdict/session code (no migration writer).

## U. Acceptance criteria

Correctness gates (any violation fails): zero unexplained differential mismatches; zero missing
required fixtures; zero lost scenarios in the split (coverage map); zero hidden required skips; zero
surviving required sentinel mutations and the per-FAIL-check mutation set (section L); preserved
receipt bytes/hash behaviour; verified install/upgrade/partial-upgrade/rollback including a deliberately
failing host command; a reproduced protected-path false green blocks (0041 item 4). Structural co-gates
(chB P7.15): one callable engine; zero launches of the full legacy PS validator in the new normal path;
≤ 1 parser and ≤ 1 self-check subprocess per validation; retirement of the hand-parity copies at G8;
the approved no-PowerShell boundary with named diagnostics. Observation cases (G7): fresh source
validation, default/quiet CLI, research quick record, full source record, installed full record with a
failing host command, actual PS parser failure, installed upgrade/partial-upgrade and rollback.
Performance floors: section V.

## V. Performance targets

Gates, not forecasts. Before any candidate is measured, the coordinator freezes the workload, sample
sizes (three matched reference/candidate pairs, one suite at a time), noise treatment and tolerances
(critic A D-15 condition); unmeasured baselines are measured once in phase 0 with the stub/real-tagging
probe variant (chB OQ-1). Required (fail thresholds): candidate median ≤ reference median for real-tree
validator wall (Bv; M-01 ~3 s is context, not the baseline); full-suite wall (Bs; M-03 302-322 s
context); all-descendant process count (Bn; not yet measured — the binding process metric, since the
probe is blind to .NET children, chB E-5); paired peak process-tree RSS (Bm; M-15 is workstation load,
not suite memory). Zero unexplained mismatches; zero OOM/timeouts. Concurrency: qualification measures
2 and 3 concurrent validator-only requests (p95, throughput, peak memory vs reference); no 6/8-suite
prerequisite (M-14 context). Structural thresholds as in section U. Stretch, non-binding HYPOTHESIS:
≤ 1 s validator, ≤ 120 s suite (the arithmetic caps a pure split at the ~94 s next-file bound, B:78).
The differential lane's cost is reported separately and never omitted from qualification; a claimed
speedup is falsified by matched no-gain results — neutral speed is then reported and the justification
rests on the structural deliverables; a required capability loss falsifies the architecture regardless
of speed.

## W. Certification plan

Binding procedure, no design freedom. Unified adversarial prompt (≤ 150 lines) and report (≤ 250 lines)
covering every implementation item (0038 items 1, 3); two parallel independent certifiers outside
execution and control for the switch (C1 semantics/TCB, C2 platform/performance) and again for
retirement (C1b/C2b); author, executor, controller and benchmark author never certify (0041 items 1-2;
0057 item 4); certifier names from the 0047 item 1 availability order after the independence filter;
T7 floor for candidate edits and certification (0072). Batch budget per 0047 item 5 with the CA-05
wording: at most three certification rounds on distinct frozen candidates per batch, per-root-cause
remediation history preserved, then the owner decides to narrow, accept with recorded exceptions, or
continue; no reset by re-freezing. Certifier availability is checked at G0 before implementation starts
(sB); a missing slot blocks certification — it never justifies self-certification — and reaches the
owner only if it materialises (conditional question, section AA). Certifiers use separate quiet
checkouts with start/end identity and freeze their verdicts before peer access; expensive suites are
serialised on this workstation. Independence note: both critics shaped this plan (dispositions table),
so neither may certify the resulting implementation (S-003 step 7).

## X. Risks and residual risks

- Common-mode omission: fixtures derived only from the old engine miss requirements both lack —
  mitigated by independent EXPECTED from binding sources, counter-signing and mutation; residual
  recorded.
- Oracle drift / wrong oracle: a moved old script is not a reference run (sB) — mitigated by the CA-04
  dependency-closure cohort.
- Instrumentation asymmetry (chB E-5): a metric that counts different things for OLD and NEW —
  mitigated by the all-descendant census requirement.
- Measurement gaps: H-1 (per-check cost), H-2 (pwsh), H-3 (cloud capability set), H-4 (installer under
  pwsh/Linux), H-5 (culture/ANSI/binding-error behaviours), H-6 (consumer fleet at protocolVersion
  1.9.0) — phase-0 measurement tasks, not owner questions.
- Concurrency: 120 s helper timeout under saturation (`tests/helpers.cjs:10-15`; M-15) — mitigated by
  the one-full-suite rule; 6/8 suites unmeasured and unplanned.
- Certifier availability (DBI-10): conditional owner question.
- Timing answer "no": the plan's design artefacts (contract, fixtures spec, measurement plan) remain
  valid preparation for the scheduled post-pilot port.
- Part 2 residual: the "What stays open" list there.

## Y. Rejected alternatives

Union of D-18, each with corpus evidence: optimise-only as the end state (leaves cloud Evidence, TCB
drift and three hand-parity copies unresolved; accepted only as the G2 pre-step); "not strictly
necessary now" as a halt (reopens DBI-01 without a trigger row, chC P1.6/P6.6); the 80-90 %-benefit
claim (unsupported HYPOTHESIS, B:83; capped at ~94 s by B:78); long-lived dual engines (permanent
parity burden, contradicts 0039 item 3's end-state); neutral core + adapters / a fifth architecture (no
evidence, B:87-104); Rust or any non-Node engine (class F reopen without a trigger); zero-PowerShell
(technology purity; owner §12); per-test dual execution (doubles the critical path, M-06); persistent
result caching (unsound invalidation surface); imported/shared attestations (no mechanism exists,
`protocol-handoff.cjs:676-718`); coverage reduction to hit a performance number (forbidden outright,
B:147); a Node PowerShell parser (unverified parallel TCB, A:127); parity without mutation/goldens
(blind to common-mode omissions and D-1..D-6); immediate full rewrite to fix test latency (root cause
is serial file execution, M-11); silent skips or unrecorded warnings on cloud (fail-closed boundary);
a policy DSL for delivery modes (Part 2, Q5); automatic mode classifiers granting publication (Part 2,
Q6). The test split is NOT rejected — it is the scheduled G2 experiment. Re-entry of any rejected
alternative requires new evidence through a REGISTRY trigger row.

## Z. Decisions already delegated / no owner question needed

Bash severity (baseline preserved, CA-02 — repository evidence decides, owner §29 first filter); defect
dispositions D-1..D-6 (ledger + dual-engine rule); module names and boundaries; API/CLI shape;
normalisation allowlist contents; rollback granularity (whole cohort); the fast-check stub's fate
(ordered replacement at G6); quick/full policy (0071); closure granularity of leaf tasks (DAG:26,
delegated to the plan: aggregate candidate closure, no leaf claims Completed over expected integration
failures); mutation ownership (T, disposable copies); the Node floor (preserved, not harmonised —
CA-01); retirement scope included in the approved plan (no redundant later question, sB);
coordinator-side measurement questions (H-1 probe variant, baseline runs) are the coordinator's, not
the owner's (owner §29 "measure instead").

## AA. Genuine owner decisions

Filter of owner §29 applied; two questions survive, plus one conditional. Zero further questions.

1. **Timing** (DBI-02, class F). Advance the validator migration ahead of the pilot report, or preserve
   the accepted timing? Basis the answer must cover: it reopens PROTO-DEC-0039 item 3's timing clause
   via an `owner-directive` row in `docs/decisions/REGISTRY.md`; outside CORE-ARCH the 0039 item 1
   feature freeze also binds (0054 item 2 lifts it only inside that program); the pilot that triggers
   v2.0 is itself deferred (0048 item 1, DB G-2), so the accepted trigger is undated. Attached
   recommendation (sB, preserved per owner §27): approve a bounded early migration inside CORE-ARCH
   with this plan's contract/rollback/retirement scope, on the structural grounds (one callable
   validation authority; cloud Evidence; hand-parity drift removal) — speed alone does not establish
   urgency. If the answer is "preserve", sections Q/S/T stand unchanged as the post-pilot design
   baseline and nothing starts.
2. **Cloud Evidence policy** (DBI-24; IM row 5). May a no-PowerShell run that names its not-run checks
   as WARN ever attest Evidence equal to a full Windows record? The plan proceeds fail-closed regardless
   (section O); a "yes" amends attestation semantics (0024/0032 territory), a "no" confirms the default.
   Not strictly dominated: WARN-token PASS changes what a receipt attests (chA P4.6); fail-closed means
   cloud agents record failures, not green receipts, until the Windows lane validates the tree (CA-03
   correction: recording itself is not blocked). Empties if an H-3 measurement shows every target cloud
   host has PowerShell.

Conditional, asked only if it materialises: the certifier-slot gap (section W; DBI-10 records Codex's
limits exhausted at the baseline). Part 2 adds one more owner question (L-1), listed there.

## AB. Proposed decision block

For `.ai/DECISIONS.md`, appended only on owner approval; the `Approved by:` line is the owner's to fill
(COMMON: an agent never writes it without direct owner confirmation).

```markdown
### DEC-nnnn

Context:
> The validator migration council (docs/research/2026-09-25-validator-migration-council/)
> completed rounds 1-3, a draft, two critiques and a final plan under PROTO-DEC-0052/0053.
> Its final plan is `final-plan.md` in that directory; nothing in it was binding before
> this block.

Decision:
> 1. The final plan (sections A-AC and Part 2) is approved as the design baseline for the
>    validator migration. Section AA question 1 is answered: <timing answer>. Section AA
>    question 2 is answered: <cloud Evidence answer>. Part 2 question L-1 is answered:
>    <boundary answer>.
> 2. <If early timing approved:> The validator migration starts inside CORE-ARCH with the
>    plan's bounded scope; PROTO-DEC-0039 item 3 is superseded as to timing only, and the
>    trigger row of PROTO-DEC-0033 item 3 is recorded in docs/decisions/REGISTRY.md.
>    <If timing preserved:> Timing is preserved; the plan is the design baseline for the
>    scheduled post-pilot port; no implementation starts.
> 3. F-3P-1 remains OPEN - HYPOTHESIS UNDER VALIDATION. The Part 2 architecture is the
>    approved hypothesis to implement in a separately authorised package-L correction pass;
>    closure requires the hostile acceptance suite and independent verification of Part 2.

Supersedes: <nothing, if timing preserved | PROTO-DEC-0039 item 3 as to timing only, if
early migration is approved>

Approved by: <owner's words, date; transcribed by ...>
```

## AC. Exact implementation launch conditions

All must hold before G0 runs: (1) the owner has appended section AB with the three answers filled;
(2) the timing answer names the freeze cover (inside CORE-ARCH under 0054 item 2, or a separate
0039 item 1 cover); (3) certifier availability preflight passed — two certifiers independent of the
candidate and of this council's drafting chain exist under the 0047 item 1 order, or the conditional
question of section AA has been answered; (4) the coordinator has scheduled the phase-0 baseline
measurements (Bv/Bs/Bn/Bm, stub/real tagging) as exclusive workstation runs; (5) the oracle dependency
cohort of CA-04 is specified in G1's contract set; (6) for Part 2, the package-L correction pass is
authorised separately, with F-3P-2 (job-writable shared hooks under launcher credentials, L3) fixed
before any publisher holds credentials. No launch condition is met by this document existing.

---

## Part 2: F-3P-1 — how package L prevents a job from publishing to a remote

Status: `OPEN - HYPOTHESIS UNDER VALIDATION` (ODR; CA-10: critique agreement does not close it).
Nothing here changes a Part-1 conclusion. The architecture below is a validated proposal ready for owner
consideration; closure requires the authorised implementation, the full hostile acceptance conjunction
and independent verification.

### Resolution (Q1-Q10 converged, amended by CA-06..CA-09)

Variant 9, hybrid, with conditional controls: (1) **task git modes, default-deny** (Q5-Q7): a
two-to-four-line launcher-owned immutable descriptor `git: {mode: READ_ONLY|LOCAL_COMMIT|BRANCH_PUSH|
RELEASE_PUSH, target?, publishRequired: false}`; no declared publication = NO REMOTE MUTATION; modes are
procedure-derived with owner override, escalation follows PROTO-DEC-0070 item 6 and never self-grants,
unresolved classification fails closed, no policy DSL, no automatic classifier granting. A mode
restricts an authorised task; it never creates authority (CA-07): current research runs are READ_ONLY
under 0070 item 4 (commit, tag and push forbidden; verified `.ai/DECISIONS.md:2796-2799`), LOCAL_COMMIT
only where the task's own authorisation permits commits. (2) **credential-separated executor** (Q2,
Level 1): every job runs with no write-capable git credential in its environment — no `GH_TOKEN`/write
PAT, no SSH agent, `GIT_CONFIG_NOSYSTEM=1`, an empty launcher-owned `GIT_CONFIG_GLOBAL` (today the
worker inherits all of `process.env`, `launch.cjs:499-507` at cd90be1); the existing empty-prefix
`insteadOf` rule stays as defence in depth with its `-c` residual honestly recorded in R-L3-004.9
(longest-prefix-wins defeats it, L3 F-3P-1 bypasses A/B). Level 1's sufficiency is a measured gate, not
an assumption (sB; CA-06): environment scrubbing does not by itself prove non-reachability through OS
credential stores, helpers, sibling processes, APIs or writable publisher inputs; Level 2 (a separate
Windows identity with tested ACL/broker/client boundaries) is the pre-named escalation when
non-reachability cannot be enforced, not a redesign and not automatically sufficient by username alone.
(3) **trusted external delivery** (Q1 variant B; Q10): the agent never pushes; for
BRANCH_PUSH/RELEASE_PUSH the launcher/orchestrator — the only holder of write-capable credentials —
publishes the approved immutable commit to the approved exact ref after validation passes, from a
trusted clean context with an allowlisted exact refspec and expected old target OID; fast-forward only;
deletion/force/tags only under explicit release authority; the publisher consumes an approved result,
never an agent's shell command; the F-3P-2 dependency (a job-writable shared hooks directory executing
under launcher credentials, L3 F-3P-2) is closed before any publisher holds credentials. (4)
**`ls-remote` before/after as audit, never enforcement** (Q4): run after every job in every mode;
before/after ref sets logged; a difference in a no-push mode is an incident invalidating the run, with
known blinds recorded (transient push+revert, webhook/CI side effects, remotes outside the recorded
list). The comparison matrix row that justifies this is variant 9 (the hybrid), with its figures marked
conditional/unmeasured per CA-08 (see "Proportionality" below).

### Comparison matrix (ODR "REQUIRED OUTPUT FOR F-3P-1"; figures conditional/unmeasured per CA-08)

| Variant | Security | Complexity | Runtime friction | Maintenance | Failure recovery | Fit for current project |
|---|---|---|---|---|---|---|
| 1. Instructions only | none vs F-3P-1 (L3 bypasses) | trivial | none | none | none (undetectable) | insufficient alone |
| 2. `ls-remote` monitoring | detective only; blind to transient push and side effects (Q4) | low | one remote call per job | low | after the fact; a push is unrecoverable | audit, never a boundary |
| 3. Credential profiles | strong only where all write capabilities are genuinely unreachable (CA-06) | low-medium; host-dependent | profile setup; runtime unmeasured | track helper/SSH/API surfaces | revoke/rebuild profile | first tested candidate; env scrub alone insufficient |
| 4. Task Git modes | workflow intent only; no security without capability control | low | descriptor validation | small schema | reject bad descriptor, rerun | adopt the minimal vocabulary |
| 5. External trusted push | separates publication only if the worker cannot reach broker credentials/control | medium | one delivery stage, unmeasured | small broker + protected policy | immutable request + target comparison | preferred publication path |
| 6. Windows user/process isolation | separate identity/ACL can protect credentials | medium-high | identity/profile provisioning, unmeasured | OS permissions, client profiles | recreate worker identity | pre-named escalation when owner credentials stay reachable |
| 7. Container | depends on secret/host mounts, daemon, network policy | medium-high | client/Windows integration unknown | images/patching/tool parity | recreate container | candidate only if the existing environment makes it cheaper |
| 8. VM / strong isolation | broadest host boundary; still needs credential/egress design | high | startup/resources, unmeasured | images/patching/network | snapshot/recreate | reserve for a stronger threat or failure of smaller controls |
| 9. Hybrid (3+4+5+2) | one control per threat class of the current model, conditional on non-reachability (CA-06/CA-09) | medium, bounded | zero in no-push modes (unmeasured); one logged delivery step | single default path; escalate isolation only by measured need | profile recovery + exact-request delivery recovery | RECOMMENDED, conditional on the hostile-suite closure |

Rows 1-2 are insufficient alone (instructions fall to one command, L3; ls-remote misses transient push);
rows 6-8 are premature under the ODR decision principle (no measured incident; M-13 prices a process
query, not identity/container setup — CA-08).

### Threat model (Q3): one minimum control per class, residuals named (CA-06)

| Threat class | Protected asset / denied capability | Minimum control | Residual |
|---|---|---|---|
| Accidental violation | owner/project refs / incidental push | declared mode + clone with no remote + `insteadOf` in env and clone config | direct forms blocked, exit 128 (L3 baseline probe); config-level only |
| Instruction drift | delivery authority / prose upgrades | launcher-owned immutable descriptor + ticking `scopeCheck` (config/refs/hooks change = SCOPE_STOP) | none known for local state; remote state not covered |
| Tool misuse (`-c`, ambient config, alternate remote/helper/executable) | write credentials / every reachable route | Level-1 credential profile; `insteadOf` as defence in depth | unproved until the canary suite passes: OS stores, helpers, sibling processes, APIs, publisher inputs (git-config documentation; sB) |
| Autonomous adversarial agent | owner credentials / profile search | not admitted in the current model (`P-L3-004:219` cooperative assumption); admitting it is the owner's policy change and re-opens Level 2 | entire class open by design |
| Malicious repository content (injection steers the agent) | same as tool misuse — an injected agent runs the same commands as a deliberate one | credential profile + post-run audit + selective copy-back that never imports refs/config (`launch.cjs:439-447`) | same unproved routes; acceptance tests injection and deliberate bypass identically |
| Compromised external tool/model | host beyond package L | not addressable by package L config; Level 2-3 isolation premature today | entire class open by design |

### Hostile acceptance suite (Q8; closure = the whole conjunction, CA-09)

Negative suite, no-push mode, on disposable local/test remotes with synthetic canary credentials, never
owner production targets; each authenticated transport and helper surface tested separately; credentials
never printed; untestable routes leave closure unproved, unknown coverage is BLOCKED: (1) direct
`git push`; (2) `git -c url.<x>.insteadOf=<origin> push` (L3 bypass A); (3) alternate remote / explicit
push URL; (4) clone config mutation (already SCOPE_STOP); (5) ambient global config via
`GIT_CONFIG_GLOBAL` (L3 bypass B); (6) tag push; (7) new-branch push; (8) force push; (9)
credential-helper / OS-store / SSH-agent route; (10) another git executable or absolute path; (11)
hosting-API mutation; (12) transient push+revert; (13) branch deletion; (14) tampering with the
descriptor, the publisher's executable/config/hooks, or the approved candidate objects; plus cross-job
writes, failed audit queries, interrupted delivery and concurrent third-party ref changes. Acceptance
per attempt: prevention before remote mutation by any justified enforcement control (not one expected
error string) AND identical before/after trusted receiver state with zero forbidden events in
receiver-side logs (equal final refs alone prove nothing) AND no credential material reachable from the
executor context (canary assertions across env, files, OS stores, agents, sibling processes, publisher
controls). Positive suite: approved target + stage + exact candidate succeeds; wrong remote/ref fails;
protected refs/tags/force/delete fail without explicit authority; publication before passed validation
fails; `publishRequired=false` never auto-pushes; READ_ONLY and LOCAL_COMMIT never publish; interrupted
delivery resolves by exact remote/ref query (desired OID = recorded success, old OID = retry, third OID
= conflict, no blind force/replay). Closure rule: F-3P-1 closes only on the whole conjunction — every
applicable negative and positive case, declared-boundary acceptance, independent verification and
actual F-3P-2 prevention; recording the `-c` residual alone does not close it.

### Proportionality (Q9) and the decision principle (CA-08)

Formula (sB): expected loss = sum over threats of severity × probability × blast radius × job count,
against implementation + maintenance + execution friction over the workload. Severity/blast radius: an
unauthorised push is irreversible and artefact-free (L3; AGENTS §10), spanning every credential
reachable from the job plus CI/webhook side effects. Probabilities: UNKNOWN — the corpus establishes
bypass feasibility, not attack frequency; "low probability" in the existing risk row is not a measured
rate. Costs of the proposed controls: unmeasured in detail (CA-08); M-13's 519 ms idle CIM query prices
a process-table read, not identity/container setup or publisher delivery; the ~50-line estimate is a
source author's hypothesis, not a bound. Verdict (conditional, not categorical): the reverse hypothesis
is credible for bounded offline/no-authority tasks and remains available there; it is unresolved for
the actual credential-bearing research configuration; the recommendation is to test the smallest
sufficient control and reserve stronger isolation for demonstrated need. This follows the ODR decision
principle (minimum mechanism that actually closes the current threat model; safety × autonomy ×
simplicity × throughput) without marking the finding ACCEPTED RISK and without a VM mandate.

### What stays open

- **L-1 (owner policy question, the third genuine owner question of this plan):** does the protected
  boundary cover owner/project remote mutation only (this proposal's target), or every external
  publication/exfiltration destination? The latter needs egress control and changes cost materially;
  denying owner credentials cannot prevent a job with Internet access from publishing with
  attacker-supplied credentials (sB). This plan targets the former and says so.
- **L-2 (measurement, not an owner question):** credential-reachability proof under the actual
  configured identity, client compatibility with a separated identity, remote ACL coverage and friction
  numbers — run as part of the hostile-suite gate.
- The adversarial-agent and compromised-tool classes stay open by design; admitting either is the
  owner's threat-model change and re-opens Level 2-3.
- ODR section 3's minor findings (stale second-pass references, the DeepSeek route, the `index.lock`
  policy) belong to the implementer's correction pass of package L; this answer does not depend on
  them, except F-3P-2, which is a precondition here.
- Q1-Q10 map: Q1 = variant B, no dissent; Q2 = Level 1 conditional on enforced non-reachability,
  Level 2 pre-named escalation, Level 3 rejected today; Q3 = the table above; Q4 = secondary
  invariant/tripwire/audit plus receiver logs, never primary; Q5 = tiny descriptor with
  `publishRequired`, approved remote identity, full target ref, expected old OID; Q6 = procedure-derived,
  owner override, non-self-granting escalation, fail-closed on unresolved classification; Q7 =
  default-deny, zero common-case load; Q8 = the suite above; Q9 = conditional verdict above; Q10 = both
  boundaries as separate layers, the trusted publisher where they meet, with the publisher inside the
  trust boundary (F-3P-2 first).

---

*Success criteria of owner §32: the decision boundary (B), contract (H), root cause (C/D), justified
architecture (I, F), TCB-safe strategy (P, Q, W), deterministic differential design (L), rollback (R),
concrete DAG (S), measurable acceptance (U, V), independent adversarial challenge (both critiques,
dispositioned above), rejected alternatives (Y), minimal owner questions (AA: two, plus one conditional,
plus L-1), and no implementation performed. Final rule §33: the outcome is KEEP CURRENT TIMING unless
the owner directs otherwise — an evidence-supported outcome of the listed set. Nothing here is binding
until the owner approves a block.*
