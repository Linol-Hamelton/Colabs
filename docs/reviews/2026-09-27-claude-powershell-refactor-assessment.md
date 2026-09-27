# Colabs performance audit: PowerShell, Node, Git and the test architecture (measured)

- Reviewer: Claude Opus 5.5 (`claude-opus-5-5`), session `claude-e108f8be9e0e2049`
- Mode: READ-ONLY ADVISORY (owner-requested audit against the owner's 105-section criteria; certifies nothing)
- Date (UTC): 2026-09-27
- Reviewed commit: `606b23a88ba17bfd1ad7f751f7d3f01916cd7cd4` (branch `v2.0.0`), working tree clean apart from this file and the session journal
- Environment: i9-13900HX, 32 logical CPUs (`os.availableParallelism()` = 32), ~32 GB RAM (1.3-4.2 GB free during runs), Windows 11 26200 ru-RU, PS 5.1.26100, Node 22.21.0, npm 10.9.4, git 2.53; Defender real-time and on-access ON; an unrelated `vibe` session (D:/SiteMVP) ran throughout
- Verdict: RECOMMENDATION - Balanced option (section I); the first steps need no language change
- Supersedes the unpublished first draft of this file (errors listed in section M)

## Summary

| Metric (one full suite at current HEAD) | Baseline (measured) | Prototype (measured) | Projected, Balanced |
|---|---:|---:|---:|
| Full suite wall, 5 runs (c16, c8, c24, c16, c8) | 543 / 610 / 585 / 600 / 664 s; median 600, CV 7.3 %, max/median 1.11 | - | M1 <= 300 s, M2 <= 120 s, M3 P90 <= 60 s (section K) |
| Historical `test-protocol.ps1` since 09-25 (n=49) | median 318, P90 526, P95 571 s | - | - |
| Validator, one run | 5.7 s (real tree), 4.8 s P50 / 9.0 s P95 in suite | gate slice 23 ms for 17 steps vs 71.5 s | ~0.3 s in-process |
| PowerShell processes | 291 seen from Node + ~125 nested installer self-checks | 0 in the gate slice | < 20 (wrapper E2E only) |
| Git processes | 3,375 seen from Node + ~1,500 inside PS runs | - | ~1,500-2,000 |
| Temp repositories (`git init`) | 391 | - | ~390, or ~30 with template repos |
| Files / bytes copied into fixtures | 30,272 files / 408 MB | - | same count, written not copied |
| Fixture seed + first read | 1,323 ms (cpSync) | 120 ms (read-once + writeFileSync) | 120 ms |

## A. Hypotheses

| # | Verdict | Evidence |
|---|---|---|
| H1 process/fixture | CONFIRMED | Summed child-process time from test files (2,108 s) exceeds summed test time (2,043 s at c8): tests almost only wait on processes. In-process fs work adds cpSync 88 s + rmSync 32 s. Markdown/regex work is < 0.1 s per validation (Node prototype). |
| H2 Node core | PARTIALLY CONFIRMED | Gate slice: 71.5 s -> 23 ms with identical FAIL sets on all 17 steps. Per-validation cost prototype: 5.4 s -> 1.6-2.1 s on fresh fixtures, 5.7 s -> 0.4 s on the real tree. Suite-level speedup not measured. |
| H3 fixture >= language | PARTIALLY REFUTED | 2x2 per iteration (git repo + seed + validate + clean; `tools/perf/fixtures.cjs factorial`, N=3): PS+cpSync 5,673 ms, PS+written 4,377, Node+cpSync 1,962, Node+written 806. Language/process effect ~3.6 s, seeding effect ~1.2 s, nearly additive (-86 % together). Seeding is about a third of the language effect, independent of it, and needs no semantic change. |
| H4 < 60 s | NOT ENOUGH DATA | Not demonstrated. Projection in K. Binding constraints: the longest serial test file and deliberate time-based dispatch tests. |
| H5 stability | NOT ENOUGH DATA | Controlled baseline CV 7.3 % (5 runs); historical P95/median 1.8-3.4 comes from suite growth (median 103 s on 09-18 to 526 s on 09-27) and concurrent sessions, not run noise. |
| H6 16 -> 24 cores | CONFIRMED | c8 610/664 s, c16 543/600 s, c24 585 s. At c24 CPU peaks 100 %, free RAM 1.27 GB, and the longest file slows from 446 s (c8) to 584 s (c24). |
| H7 Rust | CONFIRMED (not needed) | No CPU-bound hotspot: scan + parse + hash of 426 files in Node < 100 ms. All top costs are process starts, file-system churn and deliberate waits. |

## B. Bottleneck ranking (one c8 run, summed seconds; items overlap where noted)

| Rank | Operation | Summed | Class |
|---|---|---:|---|
| 1 | Real PowerShell validator runs from tests: 125 x 5.9 s, plus 73 via `record` | 829 s | process-startup + interpreter |
| 2 | Node CLI spawns from tests: handoff 179 (321 s), dispatch 39 (211 s), `node -e` 10 (116 s), hooks 58 (84 s), session 73 (68 s), verdict, lock, scope | ~870 s (contains 3, 9) | process-startup, git |
| 3 | First read of files created by `fs.cpSync` (on-access scan): ~1.1 s x ~350 fixtures | ~400 s (inside 1, 2) | filesystem / AV |
| 4 | Installer: 86 direct (119 s) + ~125 nested self-checks (~1.1 s each) | ~255 s | process-startup |
| 5 | `git commit` 497 x 0.30 s + `git init` 391 x 0.20 s + `git add` 112 x 0.59 s | 291 s | git |
| 6 | Nested git inside Node CLIs: ls-files 587, status 418, rev-parse 443, config 249, hash-object 212, ls-remote 48 (1.06 s each), checkout 27 | ~430 s (inside 2) | git |
| 7 | Deliberate waits in `dispatch.test.cjs` (T26 43 s, T12/13 39 s, T21 34 s, T7-10 25 s under load) | ~150 s on one file | wait-bound |
| 8 | `fs.cpSync` 26,752 calls in `seedProtocol` | 88 s | filesystem |
| 9 | Recursive cleanup 548 x (P50 44, P95 170 ms) | 32 s | filesystem |
| 10 | File order: Node 22 `--test` sorts files by name whatever the CLI order (checked), so `validator.test.cjs` starts 24th of 24; at c8 wall exceeds that file by 120-170 s | unverified share | scheduling |

## C. Execution graph (measured counts)

`record` (full) = anchor (git rev-parse + `snapshot`: ls-files x2, status, config, batched hash-object; 0.27-0.44 s) -> `powershell validate-protocol.ps1` -> `powershell test-protocol.ps1` -> `node --test` (one process per file) -> anchor again. Checks run in sequence; running the 6 s validator beside the 550 s suite would save at most 6 s.

One validator run, logged at `Invoke-External`: 18 children - git x10 (`show HEAD:.ai/DECISIONS.md` twice, lines 535 and 991), node x4 (`--version`, `--check` x3), bash x3, powershell x1 (installer: 2 git). In a source-role fixture with `Status: Completed` it adds `node protocol-handoff.cjs gate-check` (+ its git). One logical validator assertion therefore costs 22-24 OS processes.

## D. Critical path

Per-file serial time (sum of its test durations): `validator.test.cjs` 446 s (c8), 489 s (c16), 554-584 s (c16/c24), then `dispatch` 211-234 s, `gate` 157-199 s, `handoff` 141-184 s, `hooks` 140-173 s, `validator-syntax` 119-199 s. Suite wall ~= start delay + `validator.test.cjs`. Its two heaviest tests: the completion gate (17 validator runs, 128 s in suite, 71.5 s alone) and decision immutability (12 runs, 78 s). Only 36 of 418 tests finish under 0.5 s; 176 take over 5 s.

## E. PowerShell findings

- `validate-protocol.ps1` (1,109 lines; 777 at `d38d2f2`): text inspection 2.3-2.4 s on the real tree (426 files, 5.3 MB), of which the ASCII check `$bytes | Where-Object { $_ -gt 127 }` costs 776-818 ms for 84 KB (strict .NET decoder: 6-9 ms) and `-contains 0/13` 157 ms per 885 KB (`Array.IndexOf`: 5 ms). Subprocesses ~1.9 s. No subprocess timeout. Duplicate `git show`.
- `setup-ai-protocol.ps1` (412 lines): every mode 1.05-1.36 s (self-check, install, `-Verify`, reinstall, `-Force`); cost spread over process start ~0.4 s, manifest `ConvertFrom-Json` ~0.1 s, merges + SHA-256 ~0.15 s, git x2, `Same-Bytes` ~0.14 s. Per section 14, `Same-Bytes` (0.16 s for 25 files, ~13 % of wall) is not worth optimising alone. In self-install `Prepare-ManifestWrite` hashes 24 managed files and discards the result.
- `test-protocol.ps1` (36 lines): wrapper; `--test-concurrency = min(16, 32) = 16`; file order alphabetical.
- `cleanup-pilot-data.ps1` (53 lines): manual, untested, cwd-relative `Remove-Item -Recurse -Force`.
- Untracked `.ps1` on disk (runtime copies, `.ai/runtime/pilot-data/cli/*.ps1`, npm shims in `.mimocode/node_modules`) are git-ignored and not inspected.

## F. Node findings

- `tests/helpers.cjs`: `run()` is the single `spawnSync` funnel (exported calls: run 569, git 250, runPowerShell 211 = 858 s). `makeProtocolFixture` 350 x P50 744 ms = 261 s. Each fixture copies 86 files / 1.13 MB, of which `tests/*.cjs` is 496 KB (44 %) that no fixture executes. The fast-check stub is itself a `.ps1`, so a stubbed validation still starts PowerShell (~1.2 s under load). The real validator runs in 8 files (`validator`, `validator-syntax`, `installer`, `upgrade`, `manifest`, `review-findings`, `codex`, `registry`; filename rule in `shouldUseFastValidator`); the other 16 get the stub.
- Cleanup is not guaranteed: every clean, passing run leaves ~28 temp directories (~23 empty `colabs-hooks-*`, one each of `colabs-test-*`, `disp-suite-*`, `disp-viol-{write,commit,remote}-escape-*`; ~26 MB); 493 older `colabs-test-*` directories (23,318 files, 165 MB) date from 2026-09-17; a killed dispatch run leaves `tests/fixtures/dispatch/t25-launch.md` in the tracked tree (reproduced; W5 class).
- `protocol-handoff.cjs`: `verify` 0.64-0.74 s; `record --quick` ~6.5-7 s (validator 5.7 s). Two anchors per record are the documented invariant; keep.
- `protocol-hooks.cjs` `snapshot()`: already index-based with batched `hash-object`; leave as is (section 28).
- `dispatch.test.cjs`: deliberate stall/timeout tests plus `taskkill` (23 x ~0.5 s); `git ls-remote` 48 x 1.06 s is worth a look.
- `lock.test.cjs`: deliberate 500 ms waits; not a target.

## G. Git findings

3,375 git processes seen from Node (804 s summed; idle cost ~50-100 ms each, 170-600 ms under suite load) plus ~12 per real validator run inside PowerShell. `git init --template=` (no hook samples) gives no gain (65 vs 64 ms). Validator batching: rev-parse x2 -> 1, show x3 -> one `cat-file --batch`, check-ignore x3 -> 1.

## H. Fixture findings

`git init` P50 167 / P95 338 ms, `git commit` P50 283 / P95 547 ms under load (65 / 100 ms idle). Seeding by `fs.cpSync` (CopyFile) makes the first read of those 85 files cost 1,141 ms (second read 32 ms); writing the same bytes with `writeFileSync` from a once-read cache: create 57 ms + first read 55 ms. Defender stays on; the fix is less copy churn, not exclusions.

## I. Options

| | Conservative | Balanced (recommended) | Aggressive |
|---|---|---|---|
| Content | split the longest files (names decide the order); seed via writeFile cache; split `validator.test.cjs`; .NET calls for ASCII/CR/NUL; git batching; PS core kept | Node validator + installer cores as importable modules, `.ps1` thin wrappers; tests call APIs in-process with a CLI/wrapper E2E layer; Node stub validator; Conservative fixture work; split long files | Balanced + shared repository-state object, rule IDs and structured results, DI boundaries, fake clock for dispatch timing, test-pyramid migration of all 418 tests |
| Wall (projection) | 150-250 s | 60-120 s | 30-60 s |
| Risk | low; no product semantics | medium; parity program of `final-plan-2.md` | high; large test migration |

## J. Recommended migration (each step: small commit, suite green, benchmark, rollback possible)

Wave 1 is two commits that must not be mixed, so a regression can be attributed:

- **Commit A - performance only, no semantic change.** (a) `seedProtocol` writes the same bytes
  from a once-per-process cache with `writeFileSync` instead of `fs.cpSync` (keep executable mode
  bits where the source has them; assert byte identity against the current fixture in a test);
  (b) split `validator.test.cjs` into independent files by test family (gate, decisions, git/paths,
  encoding, light path). Argument order is not a lever: the runner sorts files by name. Benchmark
  after (a) and after (b) separately, then 5 full runs at c16.
- **Commit B - correctness fix A-1, separate.** A regression test that fails first on the current
  validator (installed role, `Mode: READ-ONLY ADVISORY` and the `[MODE: ...]` marker), then the fix,
  then source/installed parity. It changes security semantics, so it takes the high-risk review path.

Later steps, each small, green, benchmarked and reversible:
3. Extract the completion-gate leaf to Node (prototype parity 17/17 steps), then the Node validator
   core per `final-plan-2.md` G1-G5 behind the unchanged `validate-protocol.ps1` CLI; tests call
   `validate(root)`; a real-CLI parity lane stays.
4. Node stub validator for `record` in tests; installer core in Node only after an installer
   equivalence suite (section 47 scenarios).
5. Handoff/session/hooks/gate tests: in-process API where the CLI is not the subject; split
   `dispatch.test.cjs` so its deliberate waits run in parallel (fake clock only where it keeps fidelity).
6. Retire the PowerShell engine to a frozen reference (plan G8).
Not in the plan: raising `--test-concurrency` to 24 (measured no gain, RAM near exhaustion); Rust.

## K. Projection (estimates from the measured components; not demonstrated)

Milestones, each gated on 5 full runs at c16 on an otherwise idle workstation:

| Milestone | After | Target | Why this number |
|---|---|---|---|
| M1 | Commit A | median <= 300 s | once `validator.test.cjs` is split, the next serial files are `dispatch` 211-234 s, `gate` 157-199 s, `validator-syntax` 119-199 s |
| M2 | steps 3-4 | median <= 120 s | those files lose PowerShell starts (validator and stub) and cold reads |
| M3 | step 5 | P90 <= 60 s | needs every test file under ~50 s: `dispatch` waits split, CLI spawns in-process |

Stop rule: if M1 is missed, stop and re-measure the model before step 3; do not proceed on the
projection. No probability is attached to M3: the evidence shows the speedup is of the right order
(gate slice 71.5 s -> 23 ms), and that each removed bottleneck exposes the next one; M3 is a design
target, not a forecast. Below 30 s needs the Aggressive option; git-based snapshot tests keep a floor
of process starts.
- Interactive SLO candidates (current -> target): Stop 0.56 s -> < 1 s; `verify` 0.7 s -> < 1 s; `record --quick` 7 s -> < 2 s; full record ~600 s -> < 90 s.

## L. Correctness and security

| # | Finding | Status |
|---|---|---|
| A-1 | Installed role certifies reviews marked `Mode: READ-ONLY ADVISORY` or `[MODE: READ-ONLY ADVISORY]`; only `Mode: ADVISORY` fails, and `gate-check` (CERTIFYING, Receipt-Owner) runs only in the source role (`validate-protocol.ps1:736-738, 828-830, 869`) | REPRODUCED on a scratch installed fixture |
| A-2 | Duplicated rules: completion gate in PS and `gate-check`; safe path x3; decision regex x2 in the validator plus `protocol-index.cjs` | code reading |
| A-3 | Decision/registry immutability compared with `HEAD` only; a committed rewrite passes | code reading |
| A-4 | No subprocess timeout in `Invoke-External` | code reading |
| A-5 | Case-insensitive PS operators (`Sort-Object -Unique`, `-contains`, `-match`) | code reading |
| A-6 | Installer writes in place, no staging or automatic rollback | code reading |
| A-7 | Fixture cleanup not guaranteed; killed tests leak into the tracked tree | REPRODUCED |
| A-8 | Node 22 `spawnSync('git')` with a planted `git.exe` in cwd runs the PATH git | checked, not an issue |

Migration risks: parity drift and the preserved defects D-1..D-6; real-validator coverage when stubs replace spawns; Defender-dependent timings; any cache must be keyed to tree identity (record re-anchors after checks); source vs installed role semantics; fixture reuse without isolation.

## M. Method, limits and corrections

Harness: `tools/perf/` (README there): `bench.cjs` (suite runs with resource sampling and the `preload.cjs` counters, output outside the repository), `report.cjs`, `evidence-history.cjs`, `ps-profile.cjs` (instrumented `.ps1` copies in a temp directory; installer only with `-Verify`; aborts if the repository changes), `gate-slice.cjs` (prototype + parity), `fixtures.cjs` (cold read, factorial). The baseline numbers above were taken with its scratch predecessors; the persisted tools reproduce them (gate slice 17/17, cold read 1,407 vs 117 ms, 18 validator subprocesses).
Not done against the criteria: the full concurrency matrix with 3-5 runs per level, 10-run stability, cold/warm separation, per-test UNIT/INTEGRATION/E2E map of all 418 tests, mutation equivalence beyond the gate slice, installer equivalence, minimal fixture profiles.
A longest-first experiment (c8, 664 s) was void: the runner re-sorted the files, so it is a fifth alphabetical baseline run.
Corrections to the first draft: `Same-Bytes` is ~0.16 s, not ~1 s (interactive microbenchmarks overstate compiled script loops); the Node cost prototype is 1.6-2.1 s on fresh fixtures, not 0.4 s, because of the cold-read effect; the earlier suite projection is replaced by K.
Incident: an instrumented installer copy (path spelling defeated `$SelfInstall`) overwrote `protocol-manifest.json` for ~3 minutes (18:22-18:25 local); restored from HEAD, the backup was byte-identical; `.ai/backups/` removed.

## N. Answer to the main question (section 101)

The measured components support designing for P90 <= 60 s on this workstation without weakening
any check, but it is not demonstrated; the path goes through M1 (<= 300 s) and M2 (<= 120 s), with a
stop at M1 if the model is wrong. The measurements say the lever is the process and fixture
architecture of the tests, with the PowerShell engine as its largest single part: remove PowerShell
from the hot test path (in-process Node validator/installer with thin `.ps1` wrappers kept as the
public CLI), stop copying fixtures with the copy API, and split the longest serial files. The binding
constraints for <60 s are the per-file serial time (`dispatch.test.cjs` holds ~150 s of deliberate
waits) and the Node CLI spawns in `handoff`/`gate`/`hooks`/`session` tests; Rust changes neither.

Definition of Done (section 104): done - 1, 2, 3, 5, 6, 7, 8, 9, 10, 11, 12, 14, 16, 18, 19, 20, 21, 22;
partial - 4 (5 runs, not 5-10 at one setting), 13 (seeding method, not minimal profiles), 15 (gate
slice only), 17 (5 runs, no 10-run series). Next measurements, in order: 10 runs at c16 (stability);
the factorial with writeFile seeding; the per-test UNIT/INTEGRATION/E2E map.
