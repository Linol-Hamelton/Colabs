# DeepSeek - Round-2 batch certification: executable rulebook, layers A/B/C, immutability fix

**Date**: 2026-09-23
**Reviewed commit**: 82bf99a8e2bfcde3ff375b9995f3ab45edb7ddc5
**Working tree**: dirty; the candidate tools/tests are **untracked** (`.ai/bin/protocol-verdict.cjs`, `.ai/bin/protocol-scope.cjs`, `tests/rulebook.test.cjs`), other sessions active
**Reviewer**: DeepSeek (deepseek-flash), session `deepseek-db22ebbd5fd21de8`
**Scope**: architecture
**scope-check**: FAIL
**Verdict**: FAIL
**Mode**: CERTIFYING
**Receipt-Owner**: deepseek-db22ebbd5fd21de8
**Receipt**: `node .ai/bin/protocol-handoff.cjs record --owner deepseek-db22ebbd5fd21de8` at session end; the journal entry names this path.

---

## Executive Summary

The round-1 absence is closed: the tools, the 20-test regression file, the manifest
registration and the immutability fix all exist, and the suite is green (342/342, 0 fail).
The spec-required arithmetic cases pass: a LOW-labelled confirmed finding on `.ai/bin/`
yields FAIL, a confirmed finding with no reproduction is capped at RECOMMENDATION, and a
malformed ledger exits 2. Severity is genuinely not an input to the verdict.

The batch still fails certification on four independently reproduced defects. The decisive
one is on a protected path: `isProtectedPath()` in `protocol-verdict.cjs` does not implement
the recorded protected-path list, so a confirmed finding on the protected `.ai/bin/` written
as `./.ai/bin/...` or `.AI/bin/...` is arithmetically downgraded to RECOMMENDATION, exit 0 -
exactly the PROTO-DEC-0041 item 4 failure the check exists to prevent. Verdict: **FAIL**.

---

## Scope and Evidence

- **Baseline commit**: `82bf99a8e2bfcde3ff375b9995f3ab45edb7ddc5`
- **Working tree state**: `dirty`; candidate files untracked (not committed)
- **Commands executed**:
  - `powershell -ExecutionPolicy Bypass -File .\validate-protocol.ps1 -Quiet` -> exit `0`,
    `Protocol OK. 0 warning(s).`
  - `powershell -ExecutionPolicy Bypass -File .\test-protocol.ps1` -> exit `0`;
    TAP `1..342`, `# tests 342`, `# pass 342`, `# fail 0`, 306 s
  - `node .ai/bin/protocol-verdict.cjs <ledger>` (A1-A6, A7 `--stop-rule`)
  - `node .ai/bin/protocol-scope.cjs --independence ...` and `--baseline/--scope`
  - Fixture validator runs for the immutability directions
- **Environment**: Windows, Node v22.21.0, PowerShell 5.1.26100.9444
- **Corpus reservation**: 54/60 files, 520,613/614,400 B before this report; +1 file -> 55/60.

---

## Findings Ledger (PROTO-DEC-0041)

| ID | Requirement | Candidate | Reproduction | Actual Result | Severity | Disposition |
|---|---|---|---|---|---|---|
| F-001 | Spec section 3 / PROTO-DEC-0041 item 4: `.ai/` is protected, regardless of how the path is spelled | `.ai/bin/protocol-verdict.cjs:29-41` | A4, A5, A6 | `./.ai/bin/...` and `.AI/bin/...` -> RECOMMENDATION exit 0 (expected FAIL exit 1); `docs/database-notes.md` -> FAIL exit 1 (expected RECOMMENDATION) | HIGH | confirmed |
| F-002 | Spec section 1 rules 2-3: inputs are repository state; output is identical for the same tree | `.ai/bin/protocol-scope.cjs:272-276` | C | The independence check picks the producer journal by filesystem mtime; the same content yields a different result/rule on a different mtime | MEDIUM | confirmed |
| F-003 | DEC-0021: a written decision block is never rewritten (fix must not weaken the rule) | `validate-protocol.ps1:996` | D2a vs D2b | Text after an in-block `---` is no longer compared: editing it exits 0, while editing before the `---` exits 1 | MEDIUM | confirmed |
| F-004 | Spec section 5: "`git diff --name-only` gives the actual touched set"; the diff must be a subset of scope | `.ai/bin/protocol-scope.cjs:100-112` | E | Untracked files are invisible; an untracked forbidden `tests/evil.test.cjs` -> exit 0, "0 touched paths" | MEDIUM | confirmed |

---

## F-001 - HIGH - The protected-path test is not the recorded protected list

- **Requirement**: spec section 3: "Protected paths, taken verbatim from PROTO-DEC-0038
  item 1: anything under `.ai/`, `.claude/`, hooks, validator, gates ...". Rule 2 must return
  FAIL for any confirmed finding with a reproduction whose path lies on that list.
- **Location**: `.ai/bin/protocol-verdict.cjs:29-41` (`isProtectedPath`). For a list entry
  ending in `/` it uses `norm.startsWith(item)` on the raw string; all other entries match by
  substring (`parts.some(...includes...)` and `norm.includes(...)`). It never normalises a
  leading `./`, never normalises case, and never strips an absolute prefix.
- **Reproduction** (fixtures at `%TEMP%\kilo\round2-attacks.cjs`; one ledger row each,
  `reproduction: node x`, `exit: 1`, `disposition: confirmed`, `severity: LOW`):
  ```
  A4  paths = ./.ai/bin/protocol-verdict.cjs
      exit=0  Verdict: RECOMMENDATION
      -> reason: confirmed finding with reproduction off protected paths: 'CLI check'
  A5  paths = .AI/bin/protocol-verdict.cjs
      exit=0  Verdict: RECOMMENDATION
      -> reason: confirmed finding with reproduction off protected paths: 'CLI check'
  A6  paths = docs/database-notes.md      (requirement 'readme improvement', off protected)
      exit=1  Verdict: FAIL
      -> reason: confirmed finding with reproduction touching protected path(s): docs/database-notes.md
  ```
  Control (the same row as A4 with `paths = .ai/bin/protocol-verdict.cjs`):
  ```
  A1  exit=1  Verdict: FAIL   (severity LOW ignored - severity-independence holds)
  ```
- **Actual Result**: the same protected file yields FAIL or RECOMMENDATION depending only on
  how the reviewer spells the path. `./.ai/bin/...` and `.AI/bin/...` (the same file on
  Windows) evade the protected-path rule and downgrade a confirmed protected defect to an
  advisory exit 0, defeating PROTO-DEC-0041 item 4. In the other direction, any path
  containing the substrings `data`, `gate`, `validate`, `security` or `hooks`
  (`docs/database-notes.md`, `src/delegate.js`, `docs/invalidated.md`) is wrongly treated as
  protected and produces a false FAIL, contradicting the recorded list and the spec's
  RECOMMENDATION case. This is an invented matching rule, not the recorded one.
- **Disposition**: `confirmed`.
- **Recommendation / Proposed Fix**: normalise once (strip a leading `./`, normalise `\` to
  `/`, casefold) and then compare path segments against the list; prefix `.ai/` and
  `.claude/` as whole segments, and drop the substring fallback entirely.
- **Proof of Closure**: A4/A5-A6 fixtures return FAIL/RECOMMENDATION as the spec requires;
  a negative test covers the `./`-prefixed and case-varied forms.

## F-002 - MEDIUM - The independence check reads filesystem mtime, so it is not a function of the tree

- **Requirement**: spec section 1 rule 2 ("Its inputs are repository state only") and rule 3
  ("Its output is the same for the same tree, every time, on any machine").
- **Location**: `.ai/bin/protocol-scope.cjs:272-276` - the walk sorts `.ai/worklog` journals
  by `statSync(...).mtimeMs` to choose which implementer journal names the producer.
- **Reproduction** (`%TEMP%\kilo\round2-attacks.cjs`, Part C; identical file contents in both
  runs, only mtimes differ):
  ```
  run1 (alice-1 newest) exit=1 :: Independence violation: Reviewer Receipt-Owner ('alice-1')
                                 is identical to candidate producer owner ('alice-1').
  run2 (alice-2 newest) exit=1 :: Independence violation: Reviewer owner 'alice-1' appears
                                 as implementer (alice) in .ai/TASK.md roles.
  same tree content, output identical: false
  ```
- **Actual Result**: the producer owner and the rule the tool reports are chosen by mtime,
  which git does not track and which differs between two clones of the same tree. The check
  therefore is not hand-reproducible from repository state and can be steered by touching a
  file without changing any content. (In this construction the exit code stayed 1, but the
  reported producer and matched rule changed; the output is not invariant.)
- **Disposition**: `confirmed`.
- **Recommendation / Proposed Fix**: determine the producer only from declared inputs
  (`--producer`, the review's `Candidate`/`Producer` field, or the candidate journal's own
  Evidence owner) and exit 2 when it is absent; never order candidates by mtime.
- **Proof of Closure**: the same fixture run twice returns byte-identical output after the
  mtimes are swapped.

## F-003 - MEDIUM - The immutability fix weakens the rule after an in-block `---`

- **Requirement**: "a written decision block is never edited again" (DEC-0021; the fix must
  not weaken detection).
- **Location**: `validate-protocol.ps1:996` and `:424`. The body terminator is now
  `(?=^(?:#{1,3}[ \t]+|---[ \t]*$)|\z)`: a `---` line ends the body, so anything between a
  `---` and the next heading stops being part of the block.
- **Reproduction** (`%TEMP%\kilo\round2-immutability.cjs`; each case commits a single block
  whose body contains an internal `---`, then edits text on one side of it):
  ```
  D0  append a new block after committed last block        exit=0  Protocol OK.
  D1  plain block, edit body text                          exit=1  [FAIL] DEC-0001 was edited...
  D2a internal ---, edit text AFTER the ---                exit=0  Protocol OK.        <-- not caught
  D2b internal ---, edit text BEFORE the ---               exit=1  [FAIL] DEC-0001 was edited...
  ```
- **Actual Result**: the fix correctly clears the append false positive (D0) and still catches
  an ordinary edit (D1, D2b), but an edit that lands after a `---` inside a block is invisible
  (D2a) because neither the committed nor the current body includes that text. The rule is
  strictly weaker than before the fix (the old heading-only terminator did compare it).
  Latent in the current file - 46 DEC headings, 46 `---` lines, 0 blocks with an internal
  `---` - but the check is generic and the guarantee is broken.
- **Disposition**: `confirmed`.
- **Recommendation / Proposed Fix**: instead of terminating at `---`, keep heading-only
  termination and strip a single trailing `---` separator from each body before comparing
  (or require the `---` separator to be immediately followed by a heading).
- **Proof of Closure**: D2a exits 1 with the edit message; D0 still exits 0.

## F-004 - MEDIUM - The scope check cannot see untracked files

- **Requirement**: spec section 5 step 1: the touched set is "the actual touched set"; step 2:
  "Every touched path must be inside the declared scope"; step 3: no forbidden path is touched.
- **Location**: `.ai/bin/protocol-scope.cjs:100-112` (`git diff --name-only -z <baseline>`).
- **Reproduction** (`%TEMP%\kilo\round2-untracked.cjs`; committed baseline, then an untracked
  file at the forbidden path `tests/evil.test.cjs`):
  ```
  exit=0
  SCOPE CHECK PASS: All 0 touched paths are inside declared scope and none are forbidden.
  git diff --name-only -z <baseline>: ""      (untracked files are absent from the diff)
  ```
- **Actual Result**: a candidate can add any number of forbidden files as long as they are
  untracked, and the scope check reports zero touched paths and passes. This is not academic
  for this batch: the rulebook tools and their test file are themselves untracked, so a scope
  run today would not see the deliverables it is meant to bound. `git status --porcelain`
  (or `git add -N` before the diff) reports them; `git diff` does not.
- **Disposition**: `confirmed`.
- **Recommendation / Proposed Fix**: union `git diff --name-only -z` with
  `git ls-files --others --exclude-standard`, or diff against a temporary index that has
  `git add -N` applied.
- **Proof of Closure**: the untracked forbidden fixture exits 1 naming `tests/evil.test.cjs`.

---

## Requested attacks: outcome

| Attack (dispatch / prompt) | Result |
|---|---|
| Severity-independence: LOW confirmed on `.ai/bin/` must FAIL | **PASS** - A1 exit 1, `Verdict: FAIL`; `computeVerdict` deletes `severity` before arithmetic (`.ai/bin/protocol-verdict.cjs:158-162`). |
| Confirmed, `reproduction: none` cannot exceed RECOMMENDATION | **PASS** - A2 exit 0, `Verdict: RECOMMENDATION`, advisory reason printed. |
| Malformed ledger / missing columns / duplicate id / bad severity -> exit 2 | **PASS** - A3 exit 2; suite covers the other malformed forms. |
| Stop rule: `[1,3]` -> 2, `[1,2,3]` -> 1, contiguous `<=2` -> 0 | **PASS** - A7 exit 2 ("non-contiguous attempts"); suite covers the rest. |
| Protected-path arithmetic cannot be evaded | **FAIL** - F-001 (A4/A5 exit 0 where FAIL is required). |
| Section-1 boundary: repository-only, deterministic, hand-reproducible, no invented rule | **FAIL** - F-001 (invented matching rule), F-002 (mtime outside the tree, non-deterministic). |
| Immutability: append exits 0; genuine edit and deletion exit 1; rule not weakened | **PARTIAL** - D0/D1 pass and deletion is caught by the suite, but F-003 shows the rule is weakened after an in-block `---`. |
| Scope: non-ASCII `-z` path, prefix-not-directory, forbidden path, missing inputs -> 2 | **PASS** - rulebook tests and independent fixture runs; see F-004 for the untracked gap. |
| Layers A/B/C five fixes (RC-1..RC-5) | **PASS** on the suite and source review; `protocol-hooks.cjs` `-z` inventory, `protocol-index.cjs` `looksLikePath`, `protocol-ledger.cjs` `-z`/trailing-slash/`skipped`/`requireDir`, all covered by the six negative tests. |
| No model, no network in the tools | **PASS** - `protocol-verdict.cjs` requires only `node:fs`/`node:path`; `protocol-scope.cjs` shells out to `git` only. |

---

## Limits of This Certification

- The peer certifier's report (Copilot) was not read before this verdict was fixed.
- The candidate is uncommitted; the verdict is against HEAD `82bf99a` plus the working tree as
  measured. Concurrent sessions touched `.ai/worklog` and `.ai/ARCHIVE.md` during the review.
- F-003 is latent in the current `.ai/DECISIONS.md` layout; it is reported because the fix
  weakens the rule's guarantee, and D2a reproduces the gap.
- Nothing here asserts the layers A/B/C findings from round 1 are closed beyond the suite and
  source reading performed.

---

## References

- Specification: `docs/specs/2026-09-23-executable-rulebook-spec.md`
- Adversarial prompt executed: `docs/reviews/2026-09-23-gemini-batch-adversarial-prompt.md`
- Round-1 report (absence): `docs/reviews/2026-09-23-deepseek-batch-certification.md`
- Decisions: `PROTO-DEC-0038`, `PROTO-DEC-0041` (items 1-4), `DEC-0021` in `.ai/DECISIONS.md`
- Fixtures: `%TEMP%\kilo\round2-attacks.cjs`, `round2-immutability.cjs`, `round2-untracked.cjs`
- Associated journal: `.ai/worklog/deepseek-db22ebbd5fd21de8.md`
