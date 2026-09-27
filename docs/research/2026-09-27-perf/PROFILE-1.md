# PROFILE-1 - profiling run of perf-wave-1 (the M1 follow-up)

Frame: the pre-registered profile rule in **PROTO-DEC-0088 item 3**, block SHA
`79f0c0236ad5ced005f5b7e40f92bffa70d041db` (v2.0.0). Operator: `kilo-e1b4dd4a82b08b8e`,
2026-09-27, window `2026-09-27T20:02Z`.

## Target and window

- Worktree `perf1`, branch `perf-wave-1` at `680349c`; the delta `64043a3..680349c` is docs and
  worklog only (`M1-LAUNCH.md`, `M1-REPORT.md`, the M1 journal) - no tests, no tooling, no
  protocol; tree clean before the run.
- Quiet window: process scan recorded (IDE servers `kilo serve`, chrome-devtools MCP helpers,
  Antigravity profile shells, an idle interactive `vibe.exe`; no test/build/record/LLM sessions).
  The bench ran by script from the v2.0.0 copy of `tools/perf` against the `perf1` root; nothing
  was copied into the 64043a3 tree.
- Command: `node tools/perf/bench.cjs --repo .ai\runtime\perf1 --conc 16 --runs 1 --tag profile1`.
  Raw outputs: `PROFILE-1/` (summary.json, summary.jsonl, samples.json, suite.tap, `stats/`,
  report.txt). Exit 0; **420/420 pass**.

## Metrics (bench and report output only)

| Metric | Value |
|---|---|
| W - run wall | **299.2 s** (TAP duration 299.055 s) |
| L - largest file time, f* | **276.0 s, `dispatch.test.cjs`** |
| L2 - second | **231.2 s** (`gate.test.cjs`; `validator-lightpath.test.cjs` tied at 231.2) |
| T - summed measured process time (all descendants) | **4533.8 s** (git 1510.2 + PowerShell 1513.4 + node CLIs 1480.9 + bash 29.3) |
| P - the PowerShell part of T | **1513.4 s** |
| P/T | **0.334** |
| PS-heavy files (PS time >= 50% of the file's own process time) | **0** (max: `installer.test.cjs` 62/168 = 0.37) |
| CPU average / max | **58% / 88%**; free RAM min 4343 MB |
| Max concurrent processes | node 62, powershell 22, git 23, bash 5, all 525 |
| Fixture churn | rmRecursive 556 x / 32.6 s; makeProtocolFixture 350 x / 386.5 s |
| Slowest tests (TAP) | 191.2 s "completed tasks require a prompt and independent review completion gate"; 128.9 s "decision immutability"; 58.0 s T26 dispatch; 48.6 s validator codex; 46.0 s T21 dispatch |

## Condition checks

- **V2** (first): P/T >= 0.70 - **NO** (0.334). PS-heavy files >= 3 - **NO** (0). **V2 fails.**
- **V3**: (a) L/W >= 0.90 - **YES** (276.0 / 299.2 = 0.923) under the stand's per-file value;
  (b) L - L2 >= 20 s - **YES** (44.8 s); (c) hotspot localised in f* or one common test helper -
  **not confirmed by the profiler** (the rule requires the wave-1 author's one-paragraph proposal
  and the owner's one-line confirmation); (d) removable by ONE bounded test-only change -
  **likewise pending**.
- **`wall_f` in the strict sense (per-file wall time) is NOT emitted by the stand**: the bench
  produces per-file *serial* time (the sum of its tests' durations, `lib.cjs:53`) and per-file
  process seconds; the TAP carries per-test durations and one global duration only. The rule says
  "a metric the bench does not produce also yields INCONCLUSIVE".

## Verdict

**INCONCLUSIVE.** No optimisation by guesswork; the profile and this table go to the owner.
Nothing is implemented. Note for the owner: V2 fails on both counts; under the reading
"serial time := wall_f" the V3 arithmetic is (a) YES, (b) YES, while (c)/(d) still wait for the
wave-1 author's proposal and the owner's one-line confirmation. If the owner rules that the stand's
per-file serial time is the intended file metric, the remaining blockers are only (c) and (d).
