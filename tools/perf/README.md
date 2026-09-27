# Performance harness

Measurement tools for the protocol's regression suite, validator and installer. They exist so that
every optimisation is compared against the same baseline with the same instruments. The baseline,
its method and the conclusions are in
`docs/reviews/2026-09-27-claude-powershell-refactor-assessment.md`; the numbers are in
`baseline-2026-09-27.json`.

Nothing here is part of the protocol runtime, the installer or the test suite. The tools read the
repository and write their output outside it (`<tmp>/colabs-perf` by default).

## Rules for a valid measurement

- Run on an otherwise idle workstation: no other suite, validator, `record` or agent session.
- Compare medians of at least 5 runs at the same `--test-concurrency`; report P90 and the
  coefficient of variation, not one lucky run.
- Keep the tree identical between the runs you compare; `bench.cjs` flags a tree that changed.
- The preload adds a little overhead; compare preload runs with preload runs (`--no-preload`
  measures without it).

## Tools

| Command | What it measures |
|---|---|
| `node tools/perf/bench.cjs --conc 16 --runs 5 --tag baseline` | full suite as `test-protocol.ps1` runs it; wall time, CPU, free RAM, concurrent processes, per-file serial time; `--files a.test.cjs,b.test.cjs` for a subset; `--repo <worktree>` to measure a branch |
| `node tools/perf/report.cjs <run-dir>` | one run: spawned processes by kind, git/PowerShell latency distributions, fixture churn, helper calls, critical-path files, slowest tests |
| `node tools/perf/evidence-history.cjs [--since YYYY-MM-DD]` | recorded `validate-protocol.ps1` / `test-protocol.ps1` times from Evidence blocks, by date |
| `node tools/perf/ps-profile.cjs [--runs 3] [--fixture]` | section profile of both `.ps1` scripts and every validator subprocess; the installer copy runs only with `-Verify`, and the run aborts if the repository changes |
| `node tools/perf/gate-slice.cjs` | the completion-gate slice as a pure Node function, replayed against the PowerShell validator step by step; exits 1 on any mismatch |
| `node tools/perf/fixtures.cjs cold-read` | fixture seeding by `fs.cpSync` vs written bytes: creation, first and second read |
| `node tools/perf/fixtures.cjs factorial` | 2x2: validator {PowerShell, Node cost model} x seeding {cpSync, written} |

`preload.cjs` is loaded through `NODE_OPTIONS=--require` by `bench.cjs`; it counts child processes,
`fs.cpSync`/`mkdtempSync`/recursive `rmSync` and exported test-helper calls in memory and writes one
JSON file per process at exit.

## Known limits

- Processes started by PowerShell itself are not seen by the preload; `ps-profile.cjs` covers the
  validator's own children.
- Node 22's test runner sorts test files by name, so argument order does not change scheduling.
- On this workstation the first read of a file created by the copy API triggers on-access
  scanning; treat it as an environment factor and prefer designs that copy less.
