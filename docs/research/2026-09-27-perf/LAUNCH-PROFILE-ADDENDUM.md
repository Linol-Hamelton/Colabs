# Launch: task:profile1-addendum-and-report (the wave-1 author session; Gemini via agy)

You are the author of the perf stand (wave 1). Two steps, in order. Work in `D:\Colabs\.ai\runtime\perf1`
(branch `perf-wave-1`) for step A, and in the main checkout `D:\Colabs` (branch `v2.0.0`) for step B.
The operator has mechanically re-verified every figure below against the raw files; cite them
exactly as given.

## Step A - the Addendum

Create `docs/research/2026-09-27-perf/PROFILE-1-ADDENDUM.md` on `perf-wave-1` with:

- W = 299.2 s (the bench wall; raw `PROFILE-1/summary.json` of the run, key `wallS`).
- `dispatch.test.cjs` = 276.8 s: raw `PROFILE-1/stats/stats-dispatch.test.cjs-48512.json`, key
  `lifeMs` = 276814.
- `hooks.test.cjs` = 252.48 s: raw `PROFILE-1/stats/stats-hooks.test.cjs-17568.json`, `lifeMs` =
  252480.
- the next pair: `gate.test.cjs` = 231.3 s (231295) and `validator-lightpath.test.cjs` = 231.2 s
  (231199).
- L/W = 0.925; L - L2 = 24.32 s; V3(a) PASS; V3(b) PASS; V3(c)/(d) OPEN.
- the verbatim extraction command that derives each figure from the raw (a shell/Node/PowerShell
  one-liner reading depth=1 `lifeMs` from `stats/*.json`).
- a statement that every stats file is one test-file worker at depth=1 (27 depth=1 entries; one
  per test file), with the `who`/`depth`/`lifeMs` keys.
- the mark: **pending script confirmation** (the figures wait for the improved `report.cjs`).

Commit it on `perf-wave-1` with an explicit path; do not push.

## Step B - the report.cjs improvement (PROTO-DEC-0089 item 2 / R8)

In `D:\Colabs` (v2.0.0): make `tools/perf/report.cjs` aggregate the depth=1 worker `lifeMs` into a
per-file wall figure (the file's wall), and - if the data allows - cross-check it against the
file-level `duration_ms` in the TAP. Separate commit on v2.0.0 in `tools/perf/` only, explicit
path.

Acceptance test: run the improved `report.cjs` against
`.ai/runtime/perf1/docs/research/2026-09-27-perf/PROFILE-1/stats/` (or the run dir as its interface
requires) and show that it prints exactly the Addendum figures. If it matches, append ONE line at
the END of the Addendum - `confirmed by report.cjs @ <SHA>` - with the enhancement's commit SHA,
as a new commit on `perf-wave-1` (the old text stays untouched). If it does not match: stop, write
the mismatch into the Addendum's tail as a finding, and report to the operator (V3(a)/(b) are
revisited by the owner).

## Rules

- No full suite, no `record` inside any other window; `validate-protocol.ps1` once is fine;
  finish with a five-label journal entry (new journal in `perf1/.ai/worklog/`) and
  `record --quick`; model/effort/usage recorded.
- `git add` explicit paths only; no force/rebase/amend; do not push. One commit per step.
- The operator runs nothing else on `agy` while you work (R5).
