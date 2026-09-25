# Measurements for the validator migration council

- Measured by `claude-c73232724159e5bd` (Claude Opus 5.5, Claude Code) on 2026-09-25, on the
  owner's workstation. Cite a row by its id, for example `MEASUREMENTS.md M-07`.
- Machine: Intel i9-13900HX (24 cores, 32 threads), 31.7 GB RAM, NVMe SSD, Windows 11 Pro
  (build 26200). Node v22.21.0. Windows PowerShell 5.1 as `powershell.exe`; `pwsh` not timed.
- Trees: the suite and probe runs are at `e44686b`, whose validator and tests are identical to
  `eb34621`'s. The concurrency run is at `eb34621`.
- Other programs were running on the workstation (VS Code, a browser), and their load was not
  subtracted. The numbers include it.

## Rows

| Id | What | Result | Method |
|---|---|---|---|
| M-01 | `validate-protocol.ps1`, real tree, historical | 3 s average, 2-12 s, 240 runs | every `validate-protocol.ps1: exit N in Ns` line in Evidence blocks of `.ai/worklog/*.md` and `.ai/ARCHIVE.md` |
| M-02 | `test-protocol.ps1`, historical | 224 s average, 70-670 s, 194 runs, 12.1 h in total; recent runs 238-402 s | the same lines for `test-protocol.ps1` |
| M-03 | `test-protocol.ps1`, today | 302, 308 and 309 s at `e44686b`; 322 s at `4c07de4`, which has the same validator and tests; 376/376 each time | `protocol-handoff.cjs record` Evidence and timed runs |
| M-04 | Concurrency of the suite | `--test-concurrency=16` (min(16, logical CPUs)); tests inside one file run in sequence | `test-protocol.ps1:28-29` |
| M-05 | PowerShell processes per suite run | 300 spawns, 686.4 s summed over the 16 workers | the NODE_OPTIONS preload `tools/ps-probe.cjs` logs every `powershell`/`pwsh` spawn with its wall time; one full suite, 376/376, wall 309 s |
| M-06 | of which `validate-protocol.ps1` | 201 calls, 584.2 s, 2.91 s each | M-05 log |
| M-07 | of which `setup-ai-protocol.ps1` | 86 calls, 95.9 s, 1.11 s each | M-05 log |
| M-08 | of which other calls | `test-protocol.ps1` 5 calls, 2.0 s; inline `-Command` 2 calls, 3.3 s; version probes 6 calls, 1.0 s | M-05 log |
| M-09 | Sum of the per-test durations | 1,263 s over 376 tests; the wall time was 309 s | TAP `duration_ms` of every test in the M-05 run |
| M-10 | Per-file sums of M-09 (top 8) | validator 283 s (34 tests); validator-syntax 94 s (9); gate 90 s (34); handoff 78 s (32); hooks 75 s (24); review-findings 68 s (16); rulebook 65 s (54); registry 64 s (8); 54 s not matched to a file | each test name matched to the file containing it |
| M-11 | Critical path | `tests/validator.test.cjs`, 283 s of the 309 s wall, runs its 34 tests in sequence against the real validator (`PROTOCOL_TEST_FAST_CHECKS` does not stub it: `tests/helpers.cjs:62-71`) | M-10 and `tests/helpers.cjs` |
| M-12 | Cold start | `powershell -NoProfile -Command exit`: 162-342 ms, typically about 170; `node -e 0`: 76-99 ms | five runs each, idle machine |
| M-13 | One CIM process-table query (the launcher's `procTable`) | 519 ms idle; under the load of the launcher self-test it took seconds (a first scan did not complete within 2.5 s) | one timed call; self-test observation, `P-L3-004` risk rows |
| M-14 | Three full suites at once, in three detached worktrees of `eb34621` | 445, 447 and 450 s wall; 376/376 in each; no failure | three `test-protocol.ps1` started together |
| M-15 | Load during M-14 | CPU (sampled about every 22 s): 74, 91, 100, 100, 100, 80, 100, 99, 62, 67, 29, 21, 18, 34, 27, 17, 24, 15, 21, 21, 19 %. Free RAM: 5.8 GB at the start, lowest 3.4 GB, 7.4 GB at the end | `Win32_Processor.LoadPercentage` and `Win32_OperatingSystem.FreePhysicalMemory` |
| M-16 | Owner's Task Manager during M-14 | all 32 logical processors near 100% over 60 s; memory 27.9 of 31.7 GB (88%); 640 processes; 10,167 threads | the owner's screenshot in chat, 2026-09-25 (not stored in the repository) |

## Reading, labelled INFERENCE

- In M-14 the parallel phase saturated the CPU for about three minutes. The long tail at 15-30% CPU
  is M-11's sequential file, one per suite.
- Six or eight concurrent suites were not measured. From M-14 and M-15 one would expect the
  parallel phase to take roughly twice as long or more, with less free memory. The per-test
  `spawnSync` timeout of 120 s (`tests/helpers.cjs:10-15`) then becomes a failure risk.
- Not measured at all: where the 3 s of one validator run go, by check; `pwsh` 7 timings; the
  installer outside the suite.

## Reproduce

- M-05 to M-10:
  `PS_PROBE_LOG=<file> NODE_OPTIONS="--require <abs path>/tools/ps-probe.cjs" powershell -NoProfile -ExecutionPolicy Bypass -File ./test-protocol.ps1`,
  then sum the log by its second column.
- M-14: `git worktree add --detach <temp>/colabs-conc-<n> <sha>` for n = 1..3, start
  `test-protocol.ps1` in all three at once, and remove the worktrees afterwards.
  Under PROTO-DEC-0071 and COMMON section 5, only the coordinator runs this, and alone.
