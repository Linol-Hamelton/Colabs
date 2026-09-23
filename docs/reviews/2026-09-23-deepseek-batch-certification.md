# DeepSeek - Batch certification: executable rulebook, layers A/B/C, immutability fix

**Date**: 2026-09-23
**Reviewed commit**: 82bf99a8e2bfcde3ff375b9995f3ab45edb7ddc5
**Working tree**: dirty (other sessions' uncommitted work present; tree moved during the review, see F-004)
**Reviewer**: DeepSeek (deepseek-flash), session `deepseek-db22ebbd5fd21de8`
**Scope**: architecture
**scope-check**: FAIL
**Verdict**: FAIL
**Mode**: CERTIFYING
**Receipt-Owner**: deepseek-db22ebbd5fd21de8
**Receipt**: `node .ai/bin/protocol-handoff.cjs record --owner deepseek-db22ebbd5fd21de8` at session end; the journal entry names this path.

---

## Executive Summary

The batch under certification does not exist in the tree. Two of its three declared parts are
absent: the executable-rulebook implementation required by
`docs/specs/2026-09-23-executable-rulebook-spec.md` (no `protocol-verdict.cjs`, no
`protocol-scope.cjs`, no findings-ledger check, no manifest or test entries), and the fix to the
decision-block immutability check. The unified adversarial prompt the dispatch names does not
exist either, so the section-1 boundary and the verdict arithmetic could not be attacked at all.
The immutability defect is reproduced **open** on the validator, a protected path, exit `1`,
which blocks regardless of severity (PROTO-DEC-0041 item 4). The layers A/B/C fixes are present
and their six new negative tests pass (321/321), but the batch is incomplete and one of its
promised fixes is missing. Verdict: **FAIL**.

---

## Scope and Evidence

- **Baseline commit**: `82bf99a8e2bfcde3ff375b9995f3ab45edb7ddc5`
- **Working tree state**: `dirty`; other sessions wrote during the review (F-004)
- **Commands executed**:
  - `powershell -ExecutionPolicy Bypass -File .\validate-protocol.ps1 -Quiet` -> exit `0`,
    `Protocol OK. 0 warning(s).` (a first run 20 minutes earlier exited `1`; see F-004)
  - `powershell -ExecutionPolicy Bypass -File .\test-protocol.ps1` -> exit `0`;
    TAP `1..321`, `# tests 321`, `# pass 321`, `# fail 0`, 294 s
  - `git rev-parse HEAD`, `git status --porcelain`, `git ls-files`
- **Environment**: Windows, Node v22.21.0, PowerShell 5.1.26100.9444

---

## Findings Ledger (PROTO-DEC-0041)

| ID | Requirement | Candidate | Reproduction | Actual Result | Severity | Disposition |
|---|---|---|---|---|---|---|
| F-001 | Spec section 8 acceptance: the rulebook checks ship with negative tests registered in the manifest | dispatch names Gemini's implementation | see F-001 | No implementation exists anywhere in the tree | HIGH | confirmed |
| F-002 | Dispatch: execute the unified adversarial prompt at a named path | `docs/reviews/2026-09-23-gemini-batch-adversarial-prompt.md` | see F-002 | The prompt does not exist; the section-1 boundary is untestable | HIGH | confirmed |
| F-003 | DEC-0021 / TASK open question: a written decision block is never rewritten, and appending a new block is not an edit | `validate-protocol.ps1:996-1024` | see F-003 | Appending a new block after the last committed block reports a false edit, exit `1`; the fix is absent | MEDIUM (protected path) | confirmed |
| F-004 | Tree state; acceptance: validator stays at 0 warnings | other sessions' untracked work | see F-004 | First run red (8 encoding failures), later green after another session re-encoded the files; the tree is not frozen | INFO | observation |

---

## F-001 - HIGH - The executable-rulebook implementation is absent

- **Requirement**: the batching rule in `.ai/PLAN.md` and spec section 8 define the certified
  round as this package plus the five layers A/B/C fixes; the package is
  `protocol-verdict.cjs` (checks 1, 2), `protocol-scope.cjs` (checks 3, 4), the
  `docs/reviews/<date>-<task>-findings.md` ledger, and its negative tests in the manifest.
- **Reproduction**:
  ```powershell
  PS> Test-Path .ai/bin/protocol-verdict.cjs
  False
  PS> Test-Path .ai/bin/protocol-scope.cjs
  False
  PS> git ls-files | Select-String -Pattern 'protocol-(verdict|scope)'
  # no output
  PS> Get-ChildItem docs/reviews -Filter '2026-09-23*'
  # no output
  ```
  Only `docs/specs/2026-09-23-executable-rulebook-spec.md` matches `2026-09-23` in `git ls-files`.
  `protocol-manifest.json` lists neither tool and no `tests/verdict*` or `tests/scope*` file.
  `.ai/bin/` holds only the eight pre-existing tools.
- **Actual Result**: the batch's core deliverable does not exist. The load-bearing boundary claim
  of section 1 ("only recorded, repository-only, deterministic, hand-reproducible rules become
  checks") has no artifact to attack, and the four negative tests section 8 requires
  (C-quoted path, LOW-`.ai/bin/` ledger, third attempt, owner-equals-producer) do not exist.
- **Disposition**: `confirmed`.
- **Proof of Closure**: both tools exist, are listed in the manifest with their tests, and their
  negative tests fail when the guards are removed.

## F-002 - HIGH - The named adversarial prompt is absent, so the dispatch cannot be executed

- **Requirement**: the dispatch instructs the certifier to execute the unified adversarial
  prompt Gemini writes at `docs/reviews/2026-09-23-gemini-batch-adversarial-prompt.md`.
- **Reproduction**:
  ```powershell
  PS> Test-Path docs/reviews/2026-09-23-gemini-batch-adversarial-prompt.md
  False
  ```
- **Actual Result**: no such file exists, and no `2026-09-23-*` review exists at all. The
  section-1 boundary attack, the verdict-arithmetic attack, and the scope/independence attacks
  cannot be executed against a prompt that was never written. A missing required check is
  `BLOCKED`-grade on its own (PROTO-DEC-0041 item 3); combined with F-003 it is `FAIL`.
- **Disposition**: `confirmed`.
- **Proof of Closure**: the prompt exists and names each claim, input and expected failure.

## F-003 - MEDIUM - The decision-block immutability false positive is reproduced open

- **Requirement**: "a written decision block is never edited again" (DEC-0021; open question in
  `.ai/TASK.md`). The rule must still catch a genuine edit and must not fire when a genuinely
  new block is appended.
- **Location**: `validate-protocol.ps1:996-1024`. The block-body regex
  `(?ms)^### (?<id>...)[^\r\n]*(?:\n|\z)(?<body>.*?)(?=^#{1,3}[ \t]+|\z)` terminates the body
  only at a heading, so a `---` separator appended before the next block is attributed to the
  preceding committed block and reported as an edit.
- **Reproduction** (fixture git repo, real validator; script
  `%TEMP%\kilo\immutability-repro.cjs`):
  ```
  commit DEC-0001; then append "\n---\n\n### DEC-0002\n\nStatus: Accepted\n..."
  git diff HEAD -- .ai/DECISIONS.md   -> addition only (+11 lines)
  validate-protocol.ps1 -Quiet        -> exit 1
    [FAIL] DEC-0001 was edited after it was written; a decision block is never rewritten
    Protocol BROKEN. 1 failure(s), 2 warning(s).
  ```
- **Control** (rule not weakened; script `%TEMP%\kilo\immutability-edit-control.cjs`):
  ```
  edit "The original reasoning." -> "Rewritten after the fact."; no append
  validate-protocol.ps1 -Quiet        -> exit 1
    [FAIL] DEC-0001 was edited after it was written; a decision block is never rewritten
  ```
- **Actual Result**: the rule is intact (a genuine edit is still caught), but the batch's
  promised fix is not present, so the false positive remains on a protected path and blocks the
  ordinary commit-then-append order. `validate-protocol.ps1:996-1024` is byte-identical to the
  pre-batch `d38d2f2` version.
- **Disposition**: `confirmed`.
- **Proof of Closure**: the append fixture exits `0`; the genuine-edit fixture still exits `1`.

## F-004 - INFO - The tree is not frozen; the validator state moved during the review

- First validator run (01:1x local): exit `1`, eight failures, all byte-order-mark/CRLF on
  untracked `.ai/local-qwen/{qwen-colabs,qwen-colabs-v1,qwen-colabs-v2}.mjs` and
  `tool-test.txt` (another session's local tooling, not the candidate).
- A session rewrote those files at 01:23:55; the next run returned `Protocol OK. 0 warning(s).`,
  exit `0`. Two `claude-*` journals were also deleted from `.ai/worklog/` mid-review.
- **Actual Result**: the working tree changed under the review. The final validator state is
  green, which is recorded here for completeness; the acceptance criterion cannot be evaluated
  against a frozen tree because no candidate commit exists.
- **Disposition**: `observation` (not a candidate defect).

---

## Requested attacks and their outcome

| Attack (dispatch) | Result |
|---|---|
| Section-1 boundary: find a check reading outside repo state, non-deterministic, inventing a rule, or not hand-recomputable | **Not executable.** No check exists (F-001). The load-bearing claim is unverified, not verified. |
| Verdict arithmetic: LOW-but-`.ai/bin/` ledger still FAIL; confirmed-with-no-reproduction capped at RECOMMENDATION; severity must not change a verdict | **Not executable.** `protocol-verdict.cjs` does not exist (F-001). Neither ledger can be constructed; the severity-independence property is untested. Inferring success from the spec text would be treating a proposal as verified. |
| Immutability: rule not weakened; append is not an edit; genuine edit still caught | **Executed** (F-003). Genuine edit still caught (control), append false-positives (defect open). |
| Layers A/B/C fixes in the tree | **Executed.** The five fixes exist in `82bf99a` (`protocol-hooks.cjs` `ls-files -z`; `protocol-index.cjs` `looksLikePath`/`*?`/missing-source diagnosis; `protocol-ledger.cjs` `-z`, trailing-slash excludes, `skipped` reporting, `requireDir`, duplicate-directory refusal) with six negative tests; `test-protocol.ps1` 321/321 pass, 0 fail. |

---

## Limits of This Certification

- The peer certifier's report (Copilot) was not read before this verdict was fixed.
- Two thirds of the batch could not be reviewed at all; this report certifies the *absence*, not
  any implementation. It is not evidence that a future implementation is correct.
- The layer A/B/C fixes were verified by suite result and source reading, not by a fresh
  re-derivation of each of the five finding reproductions; that re-derivation belongs to a
  certifying round after the batch lands.
- The transient validator state in F-004 is another session's work and is outside the candidate.

---

## References

- Specification: `docs/specs/2026-09-23-executable-rulebook-spec.md`
- Batching rule and candidate list: `.ai/PLAN.md`; commit `82bf99a`
- Decisions: `PROTO-DEC-0038`, `PROTO-DEC-0041` (items 1-4), `DEC-0021` in `.ai/DECISIONS.md`
- Open question (immutability defect): `.ai/TASK.md`
- Fixtures: `%TEMP%\kilo\immutability-repro.cjs`, `%TEMP%\kilo\immutability-edit-control.cjs`
- Associated journal: `.ai/worklog/deepseek-db22ebbd5fd21de8.md`
