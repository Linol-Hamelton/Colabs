# DeepSeek Flash - perf-wave-1 merge-gate independent review

**Date**: 2026-09-27
**Reviewed commit**: `64043a32617838fe3600cc42e3dd2d3db935cc88`
**Reviewed diff**: `606b23a..64043a3` (2 commits: `e752c0c`, `64043a3`)
**Working tree**: dirty (only the reviewer's own untracked journal `.ai/worklog/deepseek-335f0800369818b5.md`; no reviewed file modified)
**Reviewer**: deepseek/deepseek-flash (effort and usage: not exposed by the client; kilo session `deepseek-335f0800369818b5`)
**Scope**: audit (merge gate: fixture-seeding byte-equivalence and the validator test split)
**scope-check**: PASS
**Verdict**: PASS
**Mode**: CERTIFYING
**Receipt-Owner**: `deepseek-335f0800369818b5`
**Receipt**: Evidence block in `.ai/worklog/deepseek-335f0800369818b5.md` (recorded after commit)

---

## Executive Summary

Both perf-wave-1 commits meet the merge gate. `e752c0c` seeds the fixture by writing bytes
collected from `protocol-manifest.json`; an independent reproduction shows the resulting fixture is
**byte- and mode-identical** to the pre-change recursive copy (88 files, 0 byte diffs, 0 mode diffs,
same 19-directory set). `64043a3` splits `validator.test.cjs` into four files as a pure move: the
non-empty body line multiset is identical (590 = 590), all 34 test names are preserved in order-set
equality, and `assert`/`fails`/`succeeds`/`t.skip` counts are unchanged. Protected paths
(`validate-protocol.ps1`, `.ai/bin/*`, `docs/`, hooks) are untouched. No mandatory defect found;
three informational notes below. Verdict: PASS.

---

## Scope and Evidence

- **Baseline commit**: `64043a3`. `git diff --name-status 606b23a 64043a3` = `protocol-manifest.json`,
  `tests/helpers.cjs`, `tests/manifest.test.cjs`, `tests/validator.test.cjs` (M) plus
  `tests/validator-{decisions,gate,lightpath}.test.cjs` (A). Nothing reviewed changed after the
  commit: `git diff --name-status 64043a3 HEAD` is `docs/research/2026-09-27-perf/**` only.
- **Working tree state**: clean except the reviewer journal (untracked).
- **Commands executed**:
  - `git diff --name-status 606b23a 64043a3` and `git diff --name-status 64043a3 HEAD`.
  - `git diff 606b23a 64043a3 -- validate-protocol.ps1 .ai/bin docs/ .claude .codex AGENTS.md` -> empty.
  - `git show <rev>:<file>` comparisons: test-name extraction, normalized body-line multisets,
    preamble word-diffs (base `tests/validator.test.cjs` vs each of the four head files).
  - Independent byte-equivalence reproduction (below) against the real repository -> equivalent.
  - Encoding scan of the 7 changed files: no BOM, 0 CRLF, 0 non-ASCII bytes.
  - `node .ai/bin/protocol-handoff.cjs record --owner deepseek-335f0800369818b5 --quick`
    (the allowed single validator run; `test-protocol.ps1` was not run per the launch rule).
- **Environment**: Windows 11, PowerShell 5.1, Node.js v22.21.0. Only `validate-protocol.ps1` runs
  (via `record --quick`); no suite was started.

---

## Checklist Verdicts

| # | Focus item | Verdict | Basis |
|---|---|---|---|
| 1 | Byte-equivalence of fixture seeding | PASS | Independent repro: 88 files, same set, 0 byte diffs, 0 mode diffs, same 19 dirs; in-repo regression test added in `e752c0c` |
| 2 | Test set and semantics unchanged (420 / 34 validator) | PASS | 416 static `test(` at `e752c0c` = 416 at `64043a3`; validator family 34 = 34; bodies identical; no rename, no dropped assertion |
| 3 | No validator or protocol changes | PASS | `validate-protocol.ps1`, `.ai/bin/*`, `docs/` outside perf research, hooks: untouched. See F-003 for `protocol-manifest.json` |
| 4 | FAIL claims carry a reproduction; ROADMAP review not re-run; M1 not in scope | PASS | No FAIL claims. ROADMAP review untouched; M1 metrics only cited, not measured |

---

## Findings Ledger (PROTO-DEC-0041)

| ID | Requirement | Candidate | Reproduction | Actual Result | Severity | Disposition |
|---|---|---|---|---|---|---|
| F-001 | Focus 1 asks to verify against `tools/perf/fixtures.cjs` evidence | `e752c0c` | `git cat-file -e 64043a3:tools/perf/fixtures.cjs` | Tool and cited assessment exist only on `v2.0.0`; not in this worktree | INFO | confirmed |
| F-002 | Seeding must match the copy API | `e752c0c` | see Deep Dive | Symlink sources now throw; empty dirs are not materialised | LOW | confirmed |
| F-003 | "No validator or protocol changes" (focus 3) | `64043a3` | `git diff 606b23a 64043a3 -- protocol-manifest.json` | `manifest.tests` gains 3 entries (additive test registration, required for the split files to run) | INFO | refuted-as-defect |

### F-001 - [INFO] - Cited perf evidence is not on this branch

- **Requirement**: Focus item 1 names `tools/perf/fixtures.cjs` as the evidence for byte-equivalence.
- **Location**: `tests/helpers.cjs:106` (comment) and `docs/research/2026-09-27-perf/PERF-REVIEW-TASK.md:11`.
- **Confidence**: High.
- **Reproduction**: `git cat-file -e 64043a3:tools/perf/fixtures.cjs` -> `fatal: ... does not exist`.
  `git branch -a --contains 0bd5a5f` -> `v2.0.0` only. The assessment file cited in the comment
  (`docs/reviews/2026-09-27-claude-powershell-refactor-assessment.md`, section H) is likewise absent.
- **Actual Result**: The 1.2 s -> 0.1 s rationale cannot be checked from this branch, and the
  v2.0.0 `fixtures.cjs` "cpSync" arm calls the *new* `seedProtocol`, so it is not a copy-vs-write
  differential. The requirement is met in substance by the independent reproduction and by the new
  committed regression test; only the citation is stale.
- **Disposition**: `confirmed` (informational; no code defect).
- **Recommendation**: Point the comment at the committed regression test, or reference the v2.0.0
  path explicitly; do not rely on `fixtures.cjs` as a byte-equivalence oracle.

### F-002 - [LOW] - Two CP-API behaviours are not reproduced by `seedProtocol`

- **Requirement**: The new seeding must produce what the old recursive copy produced.
- **Location**: `tests/helpers.cjs:85-96`.
- **Confidence**: High (by code reading; no current occurrence).
- **Reproduction**: `collect()` throws `Fixture source is a link: ...` on any symlinked source, where
  `fs.cpSync` (default `dereference:false`) would have created a link at the target; `collect()` also
  never calls `mkdirSync` for a directory with no files, where `cpSync` would have created the empty
  directory. Neither condition occurs in the current set (repro shows identical 19-dir trees).
- **Actual Result**: Divergence is latent only; the current fixture set has no symlinks and no empty
  directories, so equivalence holds. The throw is arguably safer than the old silent link copy.
- **Disposition**: `confirmed` (non-blocking; backlog).
- **Recommendation**: Either document these two intentional differences in the comment, or assert
  "no symlink and no empty directory" over the collected set so the difference is explicit.

### F-003 - [INFO] - `protocol-manifest.json` is edited but focus 3's paths are not

- **Requirement**: Focus item 3 names `validate-protocol.ps1`, `.ai/bin/*`, and `docs/`.
- **Location**: `protocol-manifest.json:76-78`.
- **Confidence**: High.
- **Reproduction**: `git diff 606b23a 64043a3 -- protocol-manifest.json` (3 added `manifest.tests`
  entries); `git diff ... -- validate-protocol.ps1 .ai/bin docs/` (empty).
- **Actual Result**: The manifest is a protocol file, but the edit is purely additive test
  registration: without it the three new files would not be executed by the suite, which would
  *weaken* the test set. No validator logic or managed-file contract changes.
- **Disposition**: `refuted-as-defect` (INFO).
- **Recommendation**: None required; recorded for the merge record.

---

## Deep Dives

### D-1 Byte-equivalence of the fixture seeding (focus 1)

Method: seed one temp dir with the reviewed `seedProtocol(root, { realValidator: true })`, build a
second with the exact pre-change algorithm (`fs.cpSync` per manifest entry in the original order,
then `templates/ai` -> `.ai`), then compare file sets and bytes.

```js
const h = require(path.join(repoRoot, 'tests', 'helpers.cjs'));
h.seedProtocol(A, { realValidator: true });           // new: write collected bytes
oldSeed(B);                                            // old: cpSync per entry + templates/ai
const la = listing(A), lb = listing(B);                // sorted relative file lists
// for every common rel: fs.readFileSync(A/rel).equals(fs.readFileSync(B/rel))
```

Result: `new file count: 88 | old file count: 88 | only in NEW: none | only in OLD: none |
common 88 | byte diffs: 0 | mode diffs: 0`; directory trees also identical (19 = 19, no empty dirs).
The collision rule ("a later entry replaces an earlier one at the same target") is equivalent to the
copy order because all sources are `repoRoot`-relative and targets mirror source paths, so only a
duplicate manifest entry or a dir/child overlap can collide, and both algorithms then keep the last
writer. `e752c0c` also adds a committed regression test
(`seeded fixtures hold exactly the files and bytes of a recursive copy of their sources`) asserting
listing equality, `> 50` files, and per-file byte equality; it is the only test-set addition in the
range and is not weakened.

### D-2 The validator split is a pure move (focus 2)

For base `tests/validator.test.cjs` and each of the four head files: strip the shared preamble, take
the non-empty trimmed lines, and compare multisets.

- base body non-empty lines: **590**; head bodies concatenated: **590**; lines only in base: 0;
  lines only in head: 0.
- `assert.*`: 18 = 18; `fails(`: 46 = 46; `succeeds(`: 18 = 18; `test(`: 34 = 34; `t.skip(`: 3 = 3.
- Test-name sets are equal with no duplicates and no additions; preambles word-diff identical for all
  four files (`validate` still uses `-Quiet` and asserts `result.error === undefined`).
- Repo-wide static `test(` count is **416** at both `e752c0c` and `64043a3`, so the split changes no
  test. The runtime TAP total is 420 at the split state (`PROFILE-1/suite.tap`); the +1 relative to
  `606b23a` is the D-1 regression test introduced by `e752c0c`, not by the split, so "the same 420
  tests" holds for `64043a3` versus its parent. No test was renamed or weakened.

### D-3 Protected paths and encoding (focus 3)

`git diff --name-status 606b23a 64043a3 -- validate-protocol.ps1 .ai/bin docs/ .claude .codex
AGENTS.md` is empty. All seven changed files are UTF-8 without BOM, LF-only, ASCII. The only
protocol-owned edit is the additive `manifest.tests` registration (F-003).

---

## Alternatives Considered & Trade-offs

- **Keeping one `validator.test.cjs` file**: Rejected by the wave because file-level parallelism and
  per-file timing need smaller units; the split preserves the test set, so the trade-off is safe.
- **Caching the collected file set per process** (`protocolFiles`): Chosen for speed. No test writes
  to `repoRoot/protocol-manifest.json` (the three `manifestPath` writes in tests target fixtures), so
  the cache cannot go stale under the current suite.

---

## Recommendations & Actionable Plan

1. (Optional, F-001) Fix the stale citation in `tests/helpers.cjs:106`: reference the committed
   regression test or the v2.0.0 path explicitly; do not cite `fixtures.cjs` as the equivalence oracle.
2. (Optional, F-002) State the two intentional CP-API differences (symlink throw, no empty dirs) in
   the comment, or assert the collected set contains neither.
3. No blocking action. The two perf commits are ready to merge as reviewed.

---

## References

- Decision context: `PROTO-DEC-0088` item 6 and `PROTO-DEC-0087` item 1 live on `v2.0.0`, not in this
  branch's `.ai/DECISIONS.md` (which ends at `PROTO-DEC-0086`); the frame is recorded in
  `docs/research/2026-09-27-perf/PROFILE-1.md:3-4`.
- Launch task: `docs/research/2026-09-27-perf/PERF-REVIEW-TASK.md`.
- Closed predecessor (not re-run): `docs/reviews/2026-09-27-deepseek-roadmap-w1-review.md`.
- Measurements cited, not re-measured: `docs/research/2026-09-27-perf/{M1-REPORT.md,PROFILE-1.md}`.
- Session journal: `.ai/worklog/deepseek-335f0800369818b5.md`.
