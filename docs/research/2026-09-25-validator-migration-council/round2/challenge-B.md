# Round 2: challenge of zone B (performance, test architecture, migration)

- Baseline-SHA: a4e6aef86440bc0e8da8f06c8f1d3f65af254367
- Model: claude-opus-5.5 (route `kilo/anthropic/claude-opus-5.5`; README cell r2-b claude-opus-5-5 / xhigh)
- Model-maker: Anthropic
- Client: Kilo, agent name `claude` (PROTO-DEC-0067 fallback named in the launch message)
- Effort: xhigh as named at launch; not observable inside the session
- Task-frame / scope-id: task:vmc-r2-b (parent-scope program:validator-migration-council)
- UTC-date: 2026-09-25
- Mode: ADVISORY
- Target: zone B, written by gpt-6-astra (OpenAI, Codex) per B:5-7. The challenger is of another maker (owner §23).
- Round-1 corpus: `round1/` read with `git show 5ace76c6ed76500740f22a7649c1cf9e535541b3:<path>`. POST-BASELINE
  OBSERVATION: `git diff a4e6aef 5ace76c -- validate-protocol.ps1 test-protocol.ps1 tests .ai/bin setup-ai-protocol.ps1
  protocol-manifest.json .github` is empty, so no cited code moved after the baseline.
- Independence: no other `round2/` file was opened before this one was finished (COMMON section 6).

## Conventions

- Labels: FACT (repository, `path:line` at the baseline, or an M row), INFERENCE, HYPOTHESIS, OPEN QUESTION.
- Round-1 citations: `B:n` = `round1/B-performance-migration.md:n`, `DAG:n` = `round1/IMPLEMENTATION-DAG.md:n`,
  `A:n` = `round1/A-contract-tcb.md:n`, `DB:n` = `round1/DECISION-BOUNDARY.md:n`, `CG:n` =
  `round1/VALIDATOR-CALL-GRAPH.md:n`, `CMAP:n` = `round1/VALIDATOR-CONTRACT-MAP.md:n`, `C:n` =
  `round1/C-adversarial-simplifier.md:n`, `NIS:n` = `round1/NOT-IN-SCOPE.md:n`. `M-nn` = `MEASUREMENTS.md` row.
  `MEASUREMENTS.md` and `tools/` are relative to this council directory; other paths are repository paths. All are
  read at the baseline, in a detached temp worktree.
- Method: every zone-B citation that carries a conclusion was re-read at the baseline; the arithmetic of B:53-78
  was recomputed from the M rows. No suite and no validator run were made for this analysis (none was needed).

## Evidence found in this challenge (referenced below)

- E-1 (M-06 mixes stub and real runs). FACT: the probe names a spawn by the basename of its `-File` argument
  (`docs/research/2026-09-25-validator-migration-council/tools/ps-probe.cjs:9-10`). FACT: under fast checks every
  fixture outside the exempt files (`tests/helpers.cjs:67`), unless its test opts out (`:63`), gets a three-line stub
  under the same name `validate-protocol.ps1` (`tests/helpers.cjs:89-92`). INFERENCE: M-06's 201 calls and 584.2 s mix stubs and real
  validator runs in an unknown ratio. Supporting static count, not an execution count: about 68 `record` call sites
  sit in stubbed files (archive, gate, handoff-chain, handoff, session); `tests/validator.test.cjs` has 68 validator
  call sites against 283 s (M-10), about 4 s per call including fixture setup, above the 2.91 s mean of M-06.
- E-2 (gate skip in both record modes). FACT: the environment is chosen by the check's own `quick` property, which is
  `true` for the validator check in every record (`.ai/bin/protocol-handoff.cjs:25-28,97`). Quick and full record
  both set `PROTOCOL_SKIP_GATE=1`; the only consumer is `validate-protocol.ps1:870`. This confirms B:108.
- E-3 (self-check execution untested). FACT: a grep of `tests/` at the baseline finds no assertion of
  `installer cannot run` (`validate-protocol.ps1:1100`) or `installer self-check runs` (`:1094`);
  `tests/validator-syntax.test.cjs:83-88` covers only the absent-installer branch (`validate-protocol.ps1:1083`).
- E-4 (host-dependent PowerShell checks). FACT: the syntax check uses the running host's parser
  (`validate-protocol.ps1:243`) and the self-check runs the host's own executable (`:1090-1092`); CI runs Windows
  PowerShell 5.1 as the documented baseline (`.github/workflows/protocol.yml:3-6,28-31`); `record` picks
  `powershell.exe` on Windows and `pwsh` elsewhere (`.ai/bin/protocol-handoff.cjs:89-92`). HYPOTHESIS (outside
  knowledge, to be pinned by a fixture): pwsh 7 accepts syntax that 5.1 rejects, so the parser host decides a verdict.
- E-5 (probe visibility). FACT: the probe wraps only `spawnSync`, `execFileSync`, `execSync` and `spawn` (`tools/ps-probe.cjs:15-34`); the
  validator's children start through .NET `Process` (`validate-protocol.ps1:37-49`) and are invisible to it.
- E-6 (checks of B's own facts). FACT: B:21's diff is empty; the ratios in B:53-60, B:68, B:76 and B:78 recompute
  correctly from M-05..M-14. Citation slips: the 0054 freeze exception is item 2 at `.ai/DECISIONS.md:2244` (B:34
  gives `:2245`); 0054 item 3 is at `:2245` (B:40 and DAG:20 give `:2246`). Content is right in both.

## Challenges, one block per major proposal

**P1** `B:19; B:87-104; B:160; B:188` (Node library + CLI + PowerShell wrapper beside a frozen reference, staged; a
bounded early migration once timing is authorised; timing as the only owner question): PARTLY AGREE.
1. FACT: the pain is measured (suite 302-322 s, M-03; serial tail 283 s, M-11); portability failure is one observed session (`docs/core-arch/PROPOSAL-node-validator.md:26-27`; DB:81); a Node engine's speed is not measured (`MEASUREMENTS.md:40`).
2. INFERENCE: the serial tail is causal (tests in one file run in sequence, `test-protocol.ps1:28-29`, M-04); the engine language is not shown to be, as B states itself (B:19, B:76).
3. INFERENCE: B as the target is not the open point (PROTO-DEC-0025 item 5, `.ai/DECISIONS.md:1171-1172`, worded as cross-platform, not speed); the case for doing it early rests on structure and cloud (B:160) and on the proposal's unmeasured premise that later validator edits are then written once (`docs/core-arch/PROPOSAL-node-validator.md:44-46`).
4. INFERENCE: for speed, yes: 0071 and a validator-test split need no port (B:78, B:81, B:83; C:13-18), yet the DAG has no independent split node and folds the split into the caller switch D10 (DAG:54). No zone names a simpler route to cloud Evidence.
5. FACT: the Node direction is settled (0025 item 5; 0039 item 3, `.ai/DECISIONS.md:1709`); B's class table (B:31-43) agrees with zone A's (DB:25-27, DB:42, DB:66).
6. FACT: early timing needs an owner block superseding 0039 item 3 as to timing (B:34; DB:66). INFERENCE: B omits a second dependency: outside CORE-ARCH, the feature freeze of 0039 item 1 (`.ai/DECISIONS.md:1700`) also stops a non-P0 validator change, and 0054 item 2 lifts it only for work inside that program (`:2244`); the proposal's draft block supersedes item 3 only (`docs/core-arch/PROPOSAL-node-validator.md:100`).
7. INFERENCE: the wrapper keeps the documented commands; the semantic risk sits in the API (P5) and the platform boundary (E-4).
8. HYPOTHESIS: the likeliest silent failure is on the platform side, not in rule logic: parser host (E-4) and the untested self-check execution (E-3).
9. INFERENCE: B adds independent fixtures and mutation to the differential run (B:172), which is necessary; sufficiency depends on the unowned mutation task (P9, question 9).
10. INFERENCE: yes: the contract both engines are compared against is derived from a full read of the old engine (CMAP:12-13); a requirement missing from both stays invisible unless expected results are also derived from the binding sources.
11. INFERENCE: yes in Git terms (B:170-176); unproven until the D12 drill (DAG:56).
12. INFERENCE: see P4 (check order across modules) and P9 (staffing, mutation owner).
13. FACT: B's only owner question is timing (B:188), and it passes owner §1 (a proposed reopening); INFERENCE: it must also state the freeze basis of question 6, which adds no new question.
14. INFERENCE: no: B:19 recommends, B:188 leaves timing to the owner.
15. INFERENCE: a per-check profile (DB:79, H-1) showing that the time goes into subprocesses a Node core keeps (`validate-protocol.ps1:168-182,351-357,405-414,1090-1092`) falsifies any speed benefit; a cloud-host inventory with PowerShell present (DB:81, H-3) weakens the portability case.

**P2** `B:45-83` (root cause and attribution of owner §8): PARTLY AGREE.
1. FACT: the rows cite M-05..M-15 correctly; INFERENCE: the validator row (B:54) rests on M-06, which mixes stubs and real runs (E-1), so its per-call cost and its 85% and 46% shares are neither the real per-run cost nor the real share.
2. FACT: B keeps the categories non-additive and calls the remainder an accounting gap (B:55, B:60): correct.
3. n/a: section 8 is diagnosis; the one action it names, 0071, is already decided (`.ai/DECISIONS.md:2858-2862`).
4. FACT: B itself names the simpler levers and refuses the 80-90% claim without measurement (B:83).
5. FACT: 0071 covers research frames only and keeps full record for code (`.ai/DECISIONS.md:2861-2862`); B:81 respects it.
6. n/a: no decision touched.
7. FACT: a split must keep stateful sequences; one test makes 17 successive validator calls on one fixture (`tests/validator.test.cjs:40-137`, static count): B:49 is right.
8. FACT: the probe cannot see .NET-launched children (E-5), so B:62's point that 300 is not a census holds.
9. n/a: no differential claim in this section.
10. INFERENCE: one instrument applied to reference and candidate counts different things (P7, question 8).
11. n/a: no change proposed.
12. n/a: no decomposition in this section.
13. FACT: per-check and descendant measurement goes to the coordinator, not the owner (B:186): correct under owner §29.
14. n/a.
15. INFERENCE: a probe run that tags stub vs real runs (OQ-1) can move the rows B:53-55 materially; the ranking (serial tail first) survives unless real runs are few.

**P3** `B:106-121` (quick vs full, task-class table, no imported results): AGREE.
1. FACT: `checksFor` (`.ai/bin/protocol-handoff.cjs:30-48`), the quick scope line (`:112-113`) and the gate skip (E-2) confirm B:108-110.
2. n/a: semantics, not causation.
3. INFERENCE: nothing unnecessary: B changes nothing now and excludes a shared attestation (B:121).
4. n/a: the status quo is already the simplest option.
5. FACT: 0071 items 1-2 settle research vs code (`.ai/DECISIONS.md:2858-2862`); the other rows follow AGENTS section 7 and 0042 (`:1822-1826`).
6. FACT: none; the shared attestation is marked future and out of this migration (B:121).
7. FACT: neither mode proves completion-receipt freshness (E-2); B keeps `verify --deep`, `gate-check` and the deadlock regression (`tests/gate.test.cjs:275-311`).
8. FACT: the anchor is taken only after the checks (`.ai/bin/protocol-handoff.cjs:717-721`); HYPOTHESIS: a tree that changes and reverts during the run goes unseen; B's isolated-candidate rule (B:121) covers it.
9. n/a.
10. n/a.
11. n/a: no change.
12. n/a.
13. FACT: no owner question is raised; correct.
14. n/a.
15. FACT: a baseline path on which full `record` runs the validator without `PROTOCOL_SKIP_GATE=1` would falsify B:108; there is none (E-2). Contradiction with zone A: X-1.

**P4** `B:125-133; DAG:28` (five modules, one one-way dependency graph): PARTLY AGREE.
1. n/a: a cohesion proposal read from line ranges, not a measurement.
2. n/a.
3. INFERENCE: four modules and an entry fit two writers under the 0048 item 7 cap (DAG:24; `.ai/DECISIONS.md:2024-2025`); fewer serialise, more fragment (owner §16).
4. INFERENCE: no smaller split supports two streams.
5. FACT: the approved split of `protocol-handoff.cjs` into snapshot, evidence and gate (0039 item 3, `.ai/DECISIONS.md:1709`; DB:43, class C) is neither scheduled nor excluded by B or the DAG.
6. n/a.
7. FACT: B's ranges overlap: text claims `validate-protocol.ps1:304-316` (B:131) and governance `:249-315` (B:132), both covering the line-limit check whose counting is shared by hand with `protocol-archive.cjs` (CG:54); INFERENCE: two module owners for one normative check (CMAP:53).
8. INFERENCE: the light/strict gate (`validate-protocol.ps1:583-868`) moves to governance while `gateCheck` stays (`.ai/bin/protocol-handoff.cjs:934-1412`), so three implementations coexist during the overlap, the drift class zone A cites (A:32-35); retirement D16 is optional (DAG:36).
9. n/a.
10. INFERENCE: B's no-import rule (B:135) prevents self-agreement with `gateCheck` but keeps the duplication.
11. FACT: module rollback is a revert of one owner's files (DAG:48-51).
12. FACT, from B's own ranges: the check order alternates modules about ten times (repository, text, governance, text or governance, platform, governance, platform, repository, governance, platform over `validate-protocol.ps1:88-1101`), and line order is normative (CMAP:34); INFERENCE: modules must export per-check functions and the entry must own the sequence, which K1 (DAG:30) implies but does not state.
13. n/a.
14. n/a.
15. INFERENCE: a coverage map in which one CMAP row falls in two modules or in none falsifies the decomposition.

**P5** `B:135-141` (synchronous API, result shape, exit mapping, CLI, missing-capability default): PARTLY AGREE.
1. FACT: synchronous because `record` is synchronous (`.ai/bin/protocol-handoff.cjs:101-103`); no measured need for async.
2. n/a.
3. FACT: record without PowerShell needs a non-PowerShell call path; today it always spawns a shell (`:89-105`).
4. INFERENCE: spawning the Node CLI from `record` would also remove PowerShell with fewer shared-process risks (question 8); B does not weigh that option.
5. FACT: B keeps header, status tokens, summary, `-Quiet` and receipt labels (B:141), as the contract requires (CMAP:33-34, CMAP:76; 0039 item 3).
6. INFERENCE: pinning exit 1 for an invalid invocation (B:137) fixes behaviour zone A classes ACCIDENTAL (CMAP:30); not a reopen.
7. FACT: the parser and self-check follow the running host today (E-4), and B's selected-executable input (B:135) does not say which executable replaces it. FACT: turning expected filesystem errors into diagnostics (B:139) changes defect D-1 (CMAP:84); B leaves that to zone A (B:178).
8. INFERENCE: in-process, a thrown fault aborts `record` with no Evidence, where today a crashed validator is recorded as a non-zero exit (`.ai/bin/protocol-handoff.cjs:105-106,130-132`); the 900 s check timeout (`:103`) has no stated in-process replacement for a hung child.
9. n/a.
10. n/a.
11. INFERENCE: with the check label unchanged (B:141), a receipt does not name its engine; after a rollback, receipts of a defective candidate are found only through the anchor commit (`.ai/bin/protocol-handoff.cjs:121`). Owner §20 bullet 4 is not answered in zone B (zone A answers it: A:171-174).
12. n/a.
13. OPEN QUESTION: the missing-PowerShell outcome is sent to zone A (B:184); if round 3 keeps two options (X-2), it is a policy trade-off of owner §13, not a machine choice.
14. INFERENCE: B's fail-closed default (B:137, B:157) is a placeholder until zone A rules, not a decision; flagged because zone A proposes the opposite (X-2).
15. HYPOTHESIS: a fixture that pwsh 7 accepts and Windows PowerShell 5.1 rejects, run through the candidate on a host with both, shows whether executable selection weakens validation.

**P6** `B:143; DAG:52; DAG:54; DAG:74; DAG:109` (module tests, split integration families, explicit fixture intent): PARTLY AGREE.
1. FACT: `tests/validator.test.cjs` is the critical path (M-11) and the main split candidate (DAG:109).
2. FACT: causal: tests inside one file run in sequence (`test-protocol.ps1:28-29`).
3. INFERENCE: necessary for the tail with either engine.
4. INFERENCE: the split does not need the port (`docs/core-arch/PROPOSAL-node-validator.md:83-85`; C:17); placing it inside D10 (DAG:54) couples a performance change with the caller switch and confounds the D12 comparison B asks for (B:152).
5. FACT: a test-only change is tooling and needs a full record (B:115; 0071 item 2).
6. n/a.
7. FACT: stub selection is by file-name prefix (`tests/helpers.cjs:66-68`); INFERENCE: once `record` calls validate() in-process, the `.ps1` stub (`:89-92`) is bypassed and every stubbed suite that records runs the real engine, changing cost and possibly verdicts; B plans explicit fixture modes (DAG:52), zone A keeps the stub (X-6).
8. INFERENCE: module tests with injected readers can stay green while CLI coverage shrinks; B's coverage map (B:143) is the guard, and only the integrator owns it.
9. n/a.
10. HYPOTHESIS: more real-validator files running at once raise peak load, and the 120 s helper timeout (`tests/helpers.cjs:12`) fails both engines alike (C:36-39).
11. FACT: the split cohort is one integrator-owned revert (DAG:74).
12. FACT: one owner for helpers and splits (DAG:74).
13. n/a.
14. n/a.
15. INFERENCE: if after the split the wall time stays near the 283 s tail, or far above the ~94 s next-file bound (M-10), its premise fails.

**P7** `B:145-162` (baselines, required floors, stretch targets): PARTLY AGREE.
1. FACT: every baseline is an M row or named unknown (B:147); no number is invented.
2. n/a.
3. INFERENCE: non-regression floors are necessary; the stretch targets are labelled HYPOTHESIS (B:151-152).
4. n/a.
5. n/a: no decision sets targets.
6. n/a.
7. n/a.
8. INFERENCE: the observed-PowerShell-call metric (B:153) is not engine-invariant: the reference's nested installer shell is invisible to the probe (E-5), while a Node candidate's parser and self-check shells are Node spawns it counts; a correct candidate can fail it, and a rise in non-PowerShell children stays invisible to it. Only the all-descendant metric (B:154) compares like with like.
9. n/a.
10. INFERENCE: yes: a shared instrument with asymmetric visibility (question 8).
11. n/a.
12. n/a.
13. FACT: B leaves any payback budget to the owner-approved plan (B:160); INFERENCE: a legitimate policy threshold, not a poll.
14. n/a.
15. INFERENCE: every required floor can pass with zero speed gain, so the targets cannot falsify the performance motive; coherent only because B's case is structural (B:160). The concurrency row (B:155) is a scheduling rule, not the validator target owner §18 asks for.

**P8** `B:164-178` (phases 0-6 with the seven properties): PARTLY AGREE.
1. n/a: a plan, not a measured claim.
2. n/a.
3. INFERENCE: an authoritative old engine until a qualified switch follows from the differential requirement of 0025 item 5.
4. INFERENCE: no simpler staging is apparent; separating phases 3 and 4 isolates caller risk from wrapper risk.
5. FACT: 0038 item 1, 0041 items 1-2 and 0057 item 4 (`.ai/DECISIONS.md:1671,1792-1793,2336`) are applied correctly (B:166, B:175).
6. INFERENCE: the switch authority is left to the owner or a procedure (DAG:60); ambiguous, not a reopen.
7. FACT: a candidate that checks installer presence but never runs the self-check passes every current test (E-3); the platform acceptance adds that negative (DAG:51), but B:62 overstates current coverage.
8. INFERENCE: freezing the reference except for P0, with a new declared baseline after a P0 (B:178), closes the moving-oracle failure.
9. INFERENCE: mutation is a verification item (B:172) with no task that mutates candidate code (P9, question 9).
10. n/a: covered in P1, question 10.
11. INFERENCE: B's whole-release rollback (B:174) is stricter than zone A's wrapper routing (A:164-168) and safer for manifest-managed modules in installed hosts, where a wrapper-only downgrade keeps the new manifest entries (X-3).
12. FACT: caller switch D10 and wrapper D11 are separate integrator tasks (DAG:54-55).
13. n/a.
14. OPEN QUESTION: retirement needs two certifiers in B (B:176) and explicit owner authority in zone A (A:169-170, A:230) (X-4).
15. INFERENCE: a D12 rollback drill that leaves an installed host failing validation, or with orphaned modules, falsifies the rollback column.

**P9** `DAG:16-82` (D00-D18, role IDs, two streams, one writer per shared surface): PARTLY AGREE.
1. n/a: a plan.
2. n/a.
3. INFERENCE: the review and certification nodes (D13-D14, D17-D18) are required by 0038 and 0041.
4. INFERENCE: missing: an independent test-split node before D00 under ordinary tooling rules (P6, question 4).
5. FACT: the two-stream cap and the T7 floor are cited correctly (DAG:20; `.ai/DECISIONS.md:2024-2025,2908`), with the line slips of E-6.
6. n/a.
7. n/a.
8. FACT: `tests/manifest.test.cjs:68-72` compares every `tests/*.cjs`, helpers included, with `manifest.tests`; D03's new files fail it until D08, as DAG:26 says, and DAG:28 must not be read as exempting helpers.
9. FACT: no row owns mutation of candidate modules: D03 perturbs outputs (DAG:47), D09 and D12 list no mutation (DAG:53, DAG:56); zone A asks for one mutation per normative check (A:111-117).
10. INFERENCE: T alone writes fixtures, expected results and the normaliser (DAG:47, DAG:77): independent of X and Y, but one author for all three is a common-mode point; zone A leaves the author open (A:53-55).
11. FACT: each row names a rollback that never rewrites history (DAG:40).
12. OPEN QUESTION: eight role holders, with C1 and C2 outside all execution (DAG:22), need enough independent executors; availability is unknown (DB:34).
13. FACT: closure granularity is left to the final plan (DAG:26), a delegated choice, not an owner poll.
14. FACT: roles are IDs and models come from the selection procedure (DAG:22); the floors follow 0072 item 3 (`.ai/DECISIONS.md:2908`).
15. INFERENCE: a shared surface with two writers, or a CMAP row with no fixture and no mutation owner, falsifies the DAG.

## Contradictions with other zones (recorded, not resolved)

- X-1 Gate skip scope: B:108 (quick and full) vs DB:41 and CG:31 (quick only). Code evidence: E-2.
- X-2 Missing PowerShell: B:137, B:157 (non-green or fail-closed without an approved rule) vs A:127, A:129, A:149,
  A:153 (named WARN, run passes) and `docs/core-arch/PROPOSAL-node-validator.md:54-56`.
- X-3 Rollback granularity: B:174 (whole release, not wrapper-only) vs A:164-168 (wrapper routes back; switch is one commit).
- X-4 Retirement authority: B:176, DAG:61 (new protected candidate, two certifiers) vs A:169-170, A:230 (owner authority).
- X-5 Necessity and simpler route: B:19 and B:83 (bounded early migration; 80-90% claim unsupported) vs C:13,
  C:16-18, C:31 (not needed now; split plus quick give most of the benefit, wall under 120 s).
- X-6 Fast-check stub: B:143, DAG:52 (explicit fixture modes replace the file-name stub) vs A:196-197 (keep the stub hook).
- X-7 Gate cycle: B:135 and DAG:36 (gate callback kept at its boundary; retirement optional) vs CG:95 (the port must
  decide how the record, validator, gate-check cycle collapses).
- X-8 Runner scope: DAG:55 (test runner and a Node runner in D11 if approved) vs NIS:16-18 (orchestration LATER).

## Open questions

- OQ-1 (coordinator, measurement; not needed for round 3): the instrumented run B:186 asks for should also tag stub
  and real validator spawns, for example by logging the byte size or sha256 of the `-File` target in a probe variant.
  Command: the M-05 command of `MEASUREMENTS.md:46-47` with that variant, run once, alone on the workstation. Why: E-1
  leaves the real per-run cost and share unknown before any D03 baseline is set.
- OQ-2 (synthesis): does the migration run inside CORE-ARCH, where 0054 item 2 lifts the 0039 item 1 freeze, or as a
  separate task, where the freeze needs its own authority? It can ride on B's single owner question (P1, question 6).
- OQ-3 (synthesis): which PowerShell executable parses scripts and runs the self-check in the candidate, and whether
  Windows PowerShell 5.1 stays the parser of record on Windows (E-4).
- OQ-4 (synthesis): who writes expected results, as distinct from the normaliser's author (P9, question 10; A:53-55).
- OQ-5 (synthesis): the missing-PowerShell outcome (X-2); it reaches the owner only if round 3 leaves two materially
  different options (owner §29).
- Owner questions raised by this challenge: zero.
