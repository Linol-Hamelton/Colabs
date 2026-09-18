# deepseek-flash - Measured Performance & Efficiency Analysis of the Protocol

**Date**: 2026-09-18  
**Reviewed commit**: a6a6d6194e08e313dce1328cc8af971962f91fa5  
**Working tree**: dirty (192 tests at measurement time; source changed during the day by the ongoing fix series)  
**Reviewer**: deepseek-flash  
**Scope**: [performance | architecture | build]  
**Verdict**: RECOMMENDATION

Supersedes nothing. Complements and corrects `docs/reviews/2026-09-18-performance-analysis.md`
(Mistral Vibe, unmeasured estimates). Every number below was measured on the
actual repository on 2026-09-18 unless explicitly marked "estimated".

---

## Executive Summary

The dominant cost of an assistant work cycle is the regression suite, not the
kernel scripts. Measured on this machine: the suite takes 404 s sequential
(`--test-concurrency=1`, 186 tests, earlier tree; the current 192-test tree adds
roughly 50-60 s of new tests) and 156.1 s with `--test-concurrency=16`, all 192
tests green. The wall time at 16-way is bounded by the slowest single test file
(`handoff.test.cjs`, ~145 s of aggregated test time), so the next lever after
concurrency is test-file structure: splitting the two big files and removing the
full PowerShell validator from record-mechanics tests can realistically bring the
suite to ~60-80 s. Hooks cost ~0.45-0.47 s per event with 6-9 `git` subprocesses;
`record --quick` costs ~2.6-3.1 s, and `record` (default) costs validator plus
the whole suite. No correctness defect was found in the performance paths; all
findings are bounded, measurable optimizations.

---

## 1. Measured baseline (this machine)

Environment: Windows 11 x64 (10.0.26100), 32 logical processors, Node.js
v22.21.0, Windows PowerShell 5.1.26100.9444, Git 2.53.0.windows.2. Median of 3
runs unless noted; in-process numbers exclude Node startup.

| Operation | Median | Notes |
|---|---:|---|
| `node -e 0` (process spawn floor) | 51 ms | every CLI call pays this |
| `powershell -NoProfile -Command exit` | 138 ms | warm start; cold start is 0.3-1 s with AV |
| `git status --porcelain -z` | 48 ms | |
| `git ls-files --cached --others -z` | 42 ms | |
| `git ls-files --stage -z` | 40 ms | |
| `git config core.filemode` | 39 ms | |
| `git log --oneline -10` | 48 ms | |
| `git hash-object <file>` | 45 ms | |
| `protocol-lock.cjs status` | 53 ms | node startup dominates |
| `protocol-archive.cjs status` | 54 ms | |
| `protocol.cjs telemetry` | 61 ms | |
| `protocol.cjs doctor` (deep Merkle, all journals) | 305 ms | not a bottleneck |
| `protocol-handoff.cjs state` (anchor only) | 451 ms | 8 git subprocesses |
| `protocol-handoff.cjs verify --owner ...` | 429-451 ms | anchor + journal reads |
| `hooks.snapshot` in-process | 214 ms | 5 git subprocesses |
| `handoff.anchor` in-process | 358 ms | 8 git subprocesses |
| `validate-protocol.ps1` (real repo) | 2100-2600 ms | 98 protocol files, decisions, hooks, installer self-check |
| `setup-ai-protocol.ps1 -Target <dir> -InitGit` | 580 ms | install into a clean dir |
| `setup-ai-protocol.ps1 -Target <dir> -Verify` | 550 ms | consumer sync check |
| Hook SessionStart (`protocol-session.cjs start`) | 454 ms | 9 git subprocesses |
| Hook Stop (`protocol-session.cjs stop`) | 473 ms | 6 git subprocesses |
| `makeProtocolFixture` (seed copy + git init + commit) | 213 ms | paid by most of 192 tests |
| Full suite, `--test-concurrency=1` | 404 s (186 tests, earlier tree) | `test-protocol.ps1:26` forces this |
| Full suite, `--test-concurrency=8` | **172.7 s** (192 tests, 192 pass) | measured |
| Full suite, `--test-concurrency=16` | **156.1 s** (192 tests, 192 pass) | measured |

Subprocess counts measured by wrapping `child_process.spawnSync`:

- SessionStart: 9 spawns (rev-parse, ls-files x2, status, config, hash-object, status --short --branch, rev-list, log).
- Stop: 6 spawns (rev-parse, ls-files x2, status, config, hash-object).
- `anchor()`: 8 spawns (rev-list, rev-parse, ls-files x2, status, config, hash-object, status).
- `entryHash()` / `findParentEntry()`: 0 spawns (pure fs).

---

## 2. Where the suite time goes

`node --test` parallelizes at file granularity (one child process per file).
Per-file aggregated test durations from the 16-way TAP run (contention-inflated,
but ranking is stable; 13 dynamically named subtests are not included and add
roughly 15-20 s):

| Test file | Aggregated | Tests | Max single test |
|---|---:|---:|---:|
| `handoff.test.cjs` | 147.2 s | 35 | 11.1 s |
| `validator.test.cjs` | 108.6 s | 21 | 12.5 s |
| `review-findings.test.cjs` | 47.0 s | 15 | 8.9 s |
| `installer.test.cjs` | 43.0 s | 12 | 7.6 s |
| `codex.test.cjs` | 35.4 s | 7 | 15.3 s |
| `hooks.test.cjs` | 34.5 s | 11 | 5.8 s |
| `manifest.test.cjs` | 34.6 s | 18 | 4.5 s |
| `archive.test.cjs` | 28.1 s | 6 | 11.6 s |
| `session.test.cjs` | 25.7 s | 17 | 3.2 s |
| `upgrade.test.cjs` | 19.9 s | 5 | 5.3 s |
| `lock.test.cjs` | 8.0 s | 10 | 1.5 s |
| `operator.test.cjs` | 2.8 s | 4 | 1.1 s |

Root causes, in order of impact:

1. **Full PowerShell validator runs inside ordinary tests.**
   `validate-protocol.ps1` costs 2.1-2.6 s per invocation. The suite invokes it:
   14 times directly from tests, ~33 times as subtests inside
   `validator.test.cjs` (e.g. 11 decision-status cases, 7 encoding cases), and
   **29 times indirectly through `record --quick` in `handoff.test.cjs`** plus 4
   in `review-findings.test.cjs`. That is roughly 75-80 validator invocations,
   i.e. 160-190 s of pure PowerShell time per sequential run. In
   `handoff.test.cjs` alone, 29 record calls at ~2.3 s account for ~65-70 s of
   the file's ~106 s sequential cost.
2. **File-granularity parallelism is capped by 12 files.**
   At concurrency 16 all files run at once, so the wall equals the slowest file
   (`handoff.test.cjs`). That is why 8→16 only moved 172.7→156.1 s. Further
   speedup requires splitting the big files, not raising concurrency.
3. **Fixture cost 213 ms x 161 calls.** `seedProtocol` copies the protocol tree
   and each fixture does `git init` + an empty commit.
4. **CLI spawns in tests.** 33 record + 30 verify calls, each paying node
   startup (51 ms) and `verify` additionally paying `anchor()` (~0.36-0.45 s).
   ~30 verify calls = ~11-13 s of anchor work alone.
5. **Hook overhead per assistant turn.** ~0.45-0.47 s and 6-9 git spawns per
   event, i.e. ~0.5 s per response for hook-enabled assistants.

---

## 3. Corrections to the earlier (Mistral) performance report

| Claim in `2026-09-18-performance-analysis.md` | Measured reality |
|---|---|
| "172 tests / 12 files", suite "~300 s" | 192 tests now; 404 s sequential measured (186-test tree), 156 s at 16-way |
| `validate-protocol.ps1` "~15 s" | 2.1-2.6 s |
| "Single record ~3 s" | `record --quick` 2.6-3.1 s (verified); `record` default = suite-bound |
| "60% faster by concurrency" | 2.3-2.6x measured (404→172.7 s at 8); the ceiling is the slowest file |
| Git output TTL cache (P1B/P2A/P2C) | Rejected: each CLI is a new process, so no cache crosses commands; a TTL inside one process would let Stop/verify miss edits. Correctness risk for ~45 ms x a handful of calls |
| `fs.promises` migration | Rejected: short-lived CLI, no wall-clock gain, async propagation risk across six tools |
| Snapshot `WeakMap`/fixture caching | Rejected: Stop must observe the tree after every response; tests deliberately mutate fixtures |

The one recommendation that is confirmed is concurrency (P1A); the report also
missed the real hotspots (record-driven validator runs, file-granularity
critical path, fixture cost).

---

## 4. Prioritized optimization plan

### P0 - Unblock file-level parallelism (one line, minutes, low risk)

`test-protocol.ps1:26`:

```powershell
$concurrency = [Math]::Max(1, [Math]::Min(8, [Environment]::ProcessorCount))
& $node.Source --test --test-concurrency=$concurrency @tests
```

Measured on this 32-core box: 404 s -> 172.7 s (8-way) -> 156.1 s (16-way),
192/192 pass in both runs. Cap at 8 keeps CI (`windows-latest`, ~4 vCPU) from
thrashing while still parallelizing: `Min(8, ProcessorCount)`. No decision in
`.ai/DECISIONS.md` mandates sequential tests; the flag appears to be historical.

### P1 - Cut validator invocations inside tests (test design, ~1 day, medium risk)

1. **Fast check stub for mechanics tests.** Add an option (e.g.
   `PROTOCOL_TEST_FAST_CHECKS=1` honoured by `tests/helpers.cjs`) that seeds a
   two-line `validate-protocol.ps1` (`exit 0`) into fixtures used by record /
   verify / chain tests. A stub still costs ~0.15-0.2 s per invocation instead
   of 2.3 s. Keep the real validator in the integration tests (installed-project
   record, manifest checks, `validator.test.cjs`). Demonstrated scope:
   `handoff.test.cjs` 29 record calls ~ -60 s, `review-findings.test.cjs` 4
   calls ~ -8 s.
2. **Batch validator subtests.** `validator.test.cjs` spends ~33 full runs in
   per-case subtests. Seed one fixture containing all 11 broken decision blocks
   and assert all expected failure lines from a single run; likewise the 7
   encoding cases (one fixture, 1-2 runs) and the task-status cases. Estimated
   saving 35-45 s with no loss of assertions.
3. **Split the two big files.** `handoff.test.cjs` (35 tests) into 2-3 files and
   `validator.test.cjs` (21 tests) into 2 files, restoring per-file parallelism.
   Expected: critical path drops from ~145 s to the next tier
   (`review-findings`/`installer` ~45 s), so a 16-way suite lands near
   60-80 s.
4. Optional: trim `record --quick`'s anchor cost in tests by allowing
   `--root`-local anchors (already possible) - negligible next to items 1-3.

### P2 - Kernel micro-optimizations (protocol code, ~2 h, low risk)

- `protocol-handoff.cjs` computes `state = anchor(root)` in `main()` before
  dispatch, but `record` never uses it; only `state`/`verify`/`rehash` need it.
  Make it lazy: -0.36 s per record, -0.36 s per hookless record invocation.
- `anchor()` re-runs `git status --porcelain -uall` although `snapshot()`
  already ran `git status --porcelain=v1 -uall -z`. Reuse the snapshot result:
  -45 ms and one less failure mode.
- `anchor()` runs `rev-list --all --count` and then `rev-parse HEAD`; one
  `git rev-parse --verify --quiet HEAD` (exit code based) covers both: -45 ms.
- `hooks.context()` runs `rev-list --all --count` and `log --oneline -10`; the
  log output alone can distinguish an empty repository: -48 ms per
  SessionStart.

Net effect: `record --quick` ~3.0 -> ~2.5 s (validator still dominates);
SessionStart ~0.45 -> ~0.40 s. Worth bundling into the next kernel pass, not
worth a dedicated change on its own.

### P3 - Validator internals (~0.5-1 day, medium risk)

Profile the 2.1-2.6 s: 138 ms is PowerShell startup; the rest is ~98 file
encodings, decision-block parsing, hook/installer checks and the installer
self-check. Likely wins: `[IO.File]::ReadAllBytes` instead of
`Get-Content -Encoding Byte`, batching ignore checks into one
`git check-ignore --stdin`, and skipping PowerShell syntax re-parse when the
parse cache key is unchanged. Target 1.2-1.5 s, which saves 30-50 s per suite
and ~1 s per `record --quick`. If `pwsh` is installed, prefer it:
`test-protocol.ps1` already propagates the invoking shell through
`PROTOCOL_TEST_POWERSHELL`, so running the suite under pwsh automatically uses
the faster host.

### P4 - Workflow changes (immediate, zero code)

- Reviewers and analysis sessions should use `record --quick` (the stamped
  scope says the suite was not run); reserve full `record` for implementers on a
  frozen tree.
- Run the full suite once per frozen tree per review round, not once per model.
  Six models x 7 min of suite becomes six `--quick` records plus one suite run.
- This is the largest wall-clock win in the multi-model loop and needs no code.

### P5 - Environment (optional)

- Add the repository and the Node/Git binaries to Microsoft Defender exclusions
  on Windows dev boxes; process-spawn-bound suites typically gain 20-40%.
- Prefer `pwsh` 7 when available; it starts and parses faster than 5.1 (this
  machine has only 5.1, so all numbers above are the slower baseline).
- Keep fixtures on a local SSD (they already use `%TEMP%`).

---

## 5. Expected outcome

| Stage | Suite wall time | `record` total | Basis |
|---|---:|---:|---|
| Today (sequential) | ~404-460 s | ~7-8 min | measured 404 s on 186 tests |
| P0 only | ~157-175 s | ~3 min | measured 172.7 s / 156.1 s |
| P0 + P1 | ~60-80 s (est.) | ~1.5 min | file split + stub/batched validator |
| P0 + P1 + P3 | ~50-70 s (est.) | ~1.5 min | validator ~1.3 s |

Per-response hook latency stays ~0.4-0.5 s; P2 shaves ~10% and is optional.

---

## 6. Rejected and deferred items

- **Git output caching with TTL** (Mistral P1B/P2A): invalid across processes
  and risks stale Stop/verify verdicts; the measured saving is ~45 ms on 1-2
  calls. Rejected.
- **Async fs conversion**: no wall-clock gain for one-shot CLIs; adds async
  propagation through six tools. Rejected.
- **Snapshot/fixture caching**: Stop must see every edit after every response;
  tests mutate their fixtures by design. Rejected.
- **Dropping tests or the default suite in `record`**: the suite is the
  correctness gate; P0-P1 make it cheap instead. Rejected.
- **`git ls-files`/`status` call fusion in `snapshot()`**: theoretically one
  spawn less (~40 ms), but the parsing becomes index-group dependent; deferred
  unless hooks need to be faster than ~0.4 s.

---

## 7. Observations for the owner (not performance defects)

- `TASK.md` still says "186/186 tests, validator 0 warnings", but the tree now
  has 192 tests and 34 worklog journals (validator warns at >30). The stale
  numbers do not affect speed, but every session pays for the extra journals in
  SessionStart context and hygiene checks.
- The fix series in flight (archive append verification, duplicate detection,
  completion gate) added 11.5 s archive tests and 65 validator lines; the
  measurements above already include them.

---

## References

- Baseline commit: `a6a6d6194e08e313dce1328cc8af971962f91fa5`; suite and probes run on the dirty tree of 2026-09-18.
- Probe scripts: `%TEMP%\kilo\audit\perf-probe.cjs` (micro-timings, hooks, fixture cost), `probe-spawns.cjs` (subprocess counts), `parse-tap.cjs` (per-file aggregation).
- Related: `docs/reviews/2026-09-18-performance-analysis.md` (Mistral Vibe, estimates; corrected above), `docs/reviews/2026-09-18-deepseek-flash-v1.9.3-audit-r2.md`.
- Active task: `.ai/TASK.md`; decision log: `.ai/DECISIONS.md` (no concurrency decision found).
