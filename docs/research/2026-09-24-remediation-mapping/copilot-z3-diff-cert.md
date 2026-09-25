# Z3 - Diff-based re-certification, producer Evidence, and reproductions

**Commit SHA**: `4ded1bee1c2acf2392fdeededf50935f59138302`
**Working tree**: dirty
**Model**: GitHub Copilot
**Client**: VS Code
**UTC date**: 2026-09-24
**Zone**: Z3
**Commands actually run**: `git status --short --branch`; `git log --oneline -10`;
`git ls-files ...`; `node .ai/bin/protocol-handoff.cjs state`;
`node docs/research/2026-09-23-claude-round3/probes.cjs producer`;
`node docs/research/2026-09-23-claude-round3/probes.cjs ledgerrepro`.

## Z3-01 - Facts and target

- FACT: PROTO-DEC-0049 requires a second-and-later certification to receive the prior
  candidate/new-candidate diff and the findings it claims to close; whole-tree validator
  and regression results are attached as Evidence, while a reviewer may widen scope.
  `.ai/DECISIONS.md:2050-2052`
- FACT: `record` selects the validator and full regression suite for a source repository,
  runs them, and emits an anchor/digest/check exits into the journal Evidence block.
  `.ai/bin/protocol-handoff.cjs:20-41`, `.ai/bin/protocol-handoff.cjs:99-134`,
  `.ai/bin/protocol-handoff.cjs:704-794`
- FACT: `verify` rejects stale, unauthenticated, changed-entry, broken-chain, or failing
  Evidence. `.ai/bin/protocol-handoff.cjs:452-661`, `.ai/bin/protocol-handoff.cjs:794-850`
- FACT: F-R3-03 found no producer Evidence for `89ce192` or `4ded1be`; F-R3-04 found
  fourteen of seventeen ledger rows naming scripts absent from the repository.
  `docs/reviews/2026-09-23-claude-batch-certification-round3.md:23-26`,
  `docs/reviews/2026-09-23-claude-batch-certification-round3.md:128-148`
- FACT: Both recorded F-R3-03/F-R3-04 probe commands failed here because their cited
  in-repository script is absent. This is a current reproduction limitation, not a new
  verdict. `docs/reviews/2026-09-23-claude-batch-certification-round3.md:16-26`
- CLAIM: The remediation should add one parseable certification package, rather than
  infer a range or a producer from prose or journal modification time.

## Z3-02 - Edit map

| File / function / lines | Change | Tests / documents |
|---|---|---|
| `templates/reviews/REVIEW.md:3-12` | Add required header fields `Baseline`, `Candidate`, `Diff`, `Closes-findings`, `Producer-journal`, and `Producer-Evidence`; retain existing reviewer receipt fields. | Template example and a negative header fixture. |
| `docs/specs/2026-09-23-executable-rulebook-spec.md:60-80` | Define the fixed grammar below for closure IDs and reproduction locators; state exit `2` for malformed, missing, stale, or unsanctioned input. | Spec acceptance examples and negatives. |
| `.ai/bin/protocol-handoff.cjs:20-41,99-134,704-794,934-1420` | Add explicit record metadata; make `gate-check` resolve the producer journal/section, require its Evidence anchor to name `Candidate`, and compare the declared range and closure IDs to the review. `record`, not the certifier, attaches the whole-tree run. | `tests/handoff.test.cjs`, `tests/gate.test.cjs`: mismatch, stale producer receipt, omitted finding, dirty/incorrect candidate. |
| `validate-protocol.ps1:584-900` | Mirror the completion-gate header and producer-Evidence checks so PowerShell and Node reject the same package. | `tests/validator.test.cjs` parity fixtures. |
| `.ai/bin/protocol-scope.cjs:211-...` | Reuse the declared producer journal for independence; fail `2` if its authenticated Evidence does not bind the candidate. | `tests/rulebook.test.cjs`: producer equals reviewer and absent producer Evidence. |
| `.ai/bin/protocol-verdict.cjs:271-487` | Parse and resolve the reproduction locator; hash a sanctioned external file before allowing its command. | New repository fixtures plus path traversal, changed hash, unavailable borrowing, and missing sanction cases. |

### Fixed package proposed

```text
Baseline: 4ded1bee1c2acf2392fdeededf50935f59138302
Candidate: <40-hex commit>
Diff: 4ded1be..<40-hex commit>
Closes-findings: F-R3-03,F-R3-04
Producer-journal: .ai/worklog/<producer-owner>.md
Producer-Evidence: <entry sha256>
```

- CLAIM: The dispatcher produces this package using
  `git diff --no-ext-diff <Baseline>..<Candidate>` and the exact ordered findings list;
  both certifiers receive that byte-identical package with their separate audit prompts.
  Candidate must be an existing commit and Baseline its ancestor, preventing a moving
  dirty worktree from being described as the exact `<new>`.
- CLAIM: The producer invokes `record --owner <producer>` after freezing Candidate.
  Its Evidence must show `anchor: <Candidate>, clean tree`, a passing full-tree
  validator and regression run, and the declared entry hash. `gate-check` resolves that
  exact journal section rather than merely accepting any current-tree receipt.
- FACT: The current gate binds a certifier review to a named Receipt-Owner journal and
  verifies that Evidence against the current tree, but does not parse a baseline/range,
  closure list, or producer receipt field. `.ai/bin/protocol-handoff.cjs:962-1173`,
  `.ai/bin/protocol-handoff.cjs:1296-1420`

## Z3-03 - Options and recommendation

1. **Option A - mandatory structured package (recommended).** Add the header fields and
   the producer Evidence fields above, validate full SHA ancestry, calculate the range
   locally, and use fixed locator grammar for ledger reproductions. It gives each
   certifier exactly the requested input while retaining manual widening.
2. **Option B - review prose plus current receipt.** Keep `Reviewed commit` and ask
   reviewers to state a range and closed findings in narrative. This is cheaper but a
   parser cannot distinguish an omitted finding, swapped baseline, or stale producer
   Evidence. Reject it for F-R3-03/F-R3-04.

- CLAIM: Choose A. It extends existing receipt parsing and check ownership rather than
  adding a second test runner. The automatic full-tree execution remains in `record`,
  whose output is signed into Evidence; the review header points to that Evidence.
- FACT: The review template already has review commit/tree, mode, Receipt-Owner, and
  Receipt fields, so the package is a local header extension. `templates/reviews/REVIEW.md:3-12`

## Z3-04 - Reproduction contract

- FACT: The ledger already requires an exact reproduction command but permits `none`.
  `docs/specs/2026-09-23-executable-rulebook-spec.md:67-80`
- CLAIM: Replace an unconstrained command reference with one fixed locator before its
  command, for example `repo:docs/research/2026-09-24-remediation-mapping/probes.cjs :: node {path} producer`.
  The resolver rejects absolute paths, `..`, missing/non-file targets, and paths outside
  the repository with exit `2`; it then substitutes only `{path}`. This removes shell
  parsing and makes F-R3-04 testable.
- CLAIM: A sanctioned borrowing uses
  `external:<absolute-or-URI-location>; sha256:<64-lowercase-hex>; sanction:<approved-decision-id>`.
  The resolver requires all three: readable location, SHA-256 equality, and an approved
  sanction identifier in `.ai/DECISIONS.md` that names the borrowing. Missing access,
  changed bytes, or absent/malformed sanction is exit `2`; it never silently falls back
  to a repository command. Record all three literal fields in the ledger row.
- HYPOTHESIS: If the organisation needs relocation-stable external artifacts, a copied
  repository fixture with the same SHA should be preferred; this was not verified against
  an approved borrowing because none was identified in the sources read.

## Z3-05 - Risk register

| Risk | Trigger | Likelihood | Impact | Prevention | Compensation | Cost | Residual |
|---|---|---|---|---|---|---|---|
| Unchanged dependency defect | Changed code reaches old branch/API | medium | high | Reviewer expands from diff through callers, contracts, and protected dependencies; record why | Whole-tree Evidence catches executable regressions; issue FAIL with a repository reproduction | Read dependency slice; full suite already required | Semantic defect not covered by tests may remain |
| Baseline laundering | Wrong/non-ancestor SHA or omitted change | low | high | Require 40-hex commits, ancestry, computed range, ordered closure IDs | Gate exits `2`; repackage and recertify | Small parser/tests | A valid but overly broad diff still costs review time |
| Producer receipt from another state | Producer records before/after candidate or tree is dirty | medium | high | Require clean anchor Candidate and entry hash in package | Gate exits `2`; freeze and re-record | One producer record | Deliberate identity fraud is outside local proof |
| Closure claim hides open finding | ID absent, duplicated, or unrelated | medium | medium | Fixed IDs, uniqueness, and comparison to package/ledger | Certifier reports omitted claim; scope expands | Parser plus fixtures | Finding absent from every ledger still needs reviewer judgement |
| Repository reproduction path drifts | Rename/delete/untracked temporary script | high | medium | Repo-relative locator and file check | Exit `2`; commit a stable probe and rerun | Fixtures/probes | Command behaviour can vary by OS |
| External borrowing changes | Path points to a new file/version | medium | high | Require readable path, SHA-256, and approved sanction | Exit `2`; import fixture or renew sanction | Hashing and decision lookup | SHA-256 proves bytes, not safety or suitability |
| Full suite masks a narrow review gap | Green tests but diff logic unread | medium | high | Diff package plus explicit widening obligation | Independent certifier reproduces targeted path; FAIL on evidence | Targeted review time | Untested semantic paths remain possible |

## Z3-06 - Net gain

- CLAIM: After coverage, certifiers receive a bounded, reproducible package for
  `4ded1be..<new>` and only the claimed closures, while `record` preserves whole-tree
  regression evidence. This reduces repeated batch reading without treating the diff as
  a boundary against dependency review.
- CLAIM: The added parsing, SHA calculation, and fixtures are acceptable cost because
  they directly close F-R3-03/F-R3-04 and make missing inputs BLOCKED rather than
  plausible prose. Risks have compensations; no covered risk justifies rejecting the
  owner-directed approach.

## Z3-07 - Not verified

- FACT: I did not run the full validator or regression suite, modify code/tests, create
  a candidate commit, or record certification Evidence; this is advisory research only.
- FACT: I did not locate the cited Round-3 probes in this checkout, so their claimed
  historical exits were not independently reproduced.
- HYPOTHESIS: Exact field names and whether clean producer candidates are operationally
  compatible with the next implementation stream require an implementer test run.