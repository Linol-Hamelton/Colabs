# DeepSeek Flash - A-1 fix review (installed-role advisory completion gate)

**Date**: 2026-09-28
**Reviewed commit**: 7e51b892fa639685a5a93e05b8219347ea0f2a38 (branch `a1-installed-advisory`)
**Working tree**: dirty (branch HEAD `05726f3` is the docs-only review launch; this session adds this file and its journal, untracked)
**Reviewer**: DeepSeek Flash via kilo, session `deepseek-7673879ed0e8fc01` (separate `kilo run`)
**Scope**: [security, edge-cases]
**scope-check**: PASS
**Verdict**: RECOMMENDATION
**Mode**: ADVISORY
**Receipt-Owner**: deepseek-7673879ed0e8fc01
**Receipt**: .ai/worklog/deepseek-7673879ed0e8fc01.md

<!-- This is a fix review, not a certification: it certifies nothing and carries no Evidence
     block authority. It reproduces every claim. Marker/advisory spellings are quoted below. -->

---

## Executive Summary

The candidate `74b46ff..7e51b89` fixes the reported A-1 defect: both validator review parsers now
refuse `Mode: READ-ONLY ADVISORY` and the `[MODE: READ-ONLY ADVISORY]` marker in both roles and on
both paths. I reproduced the defect on the pre-fix tree (2/4 tests fail) and the fix at the
candidate (4/4 pass), rebuilt the parity matrix, and found **no candidate regression**: no
certifying review in `docs/reviews/` is newly refused and no header the old exact rule refused is
now accepted. The verdict is RECOMMENDATION, not FAIL: the residual escapes I found (a marker split
across a newline, table-cell declarations, exotic prefixes) are the pre-existing blacklist
limitation the prompt itself records as R2/R3 (hiding the declaration is no stronger than omitting
it); they are not introduced by A-1 and none is in A-1's allowed file set. I recommend a follow-up
whitelist, not a change to this candidate.

## Scope and Evidence

- **Baseline Commit**: `74b46ff` (base), candidate fix `7e51b89`; branch HEAD `05726f3` (docs-only
  launch `LAUNCH-A1-REVIEW.md`, after the candidate).
- **Working Tree State**: dirty (two untracked files from this session; no candidate file touched).
- **Commands & Tests Executed**:
  - `git diff --stat 74b46ff 7e51b89`
  - `git diff 74b46ff 7e51b89` (read in full)
  - pre-fix tree: `git archive 6f44903` -> `node --test tests/validator-gate.test.cjs`
  - `node --test tests/validator-gate.test.cjs` (candidate)
  - `node --test tests/validator-lightpath.test.cjs`
  - `node --test tests/gate.test.cjs`
  - `node --test tests/validator.test.cjs`
  - `powershell -ExecutionPolicy Bypass -File validate-protocol.ps1`
  - `node .ai/bin/protocol-handoff.cjs verify --owner claude-0ff8b28052330de0 --deep`
  - parity probe (`tests/helpers.cjs`, inline fixture, both roles x both paths x both forms)
  - edge probes (20 header variants) and a corpus scan of 116 `docs/reviews/*.md`
- **Environment**: Windows 10.0.19045, Node.js v22.21.0, PowerShell 5.1 (Windows PowerShell).

## Findings Ledger (PROTO-DEC-0041)

| ID | Requirement | Candidate | Reproduction | Actual Result | Severity | Disposition | Proof of Closure |
|---|---|---|---|---|---|---|---|
| F-001 | Diff is exactly the four named files | `74b46ff..7e51b89` | `git diff --stat` | 4 files, no other path | INFO | confirmed | n/a |
| F-002 | New tests fail pre-fix, pass post-fix | `6f44903`, `7e51b89` | archive + `node --test` | pre-fix 2/4, candidate 4/4 | INFO | confirmed | test output below |
| F-003 | Both roles/paths refuse both forms | `7e51b89` | parity probe | 4/4 combos refuse both; pre-fix accepted | INFO | confirmed | matrix below |
| F-004 | No false positive on certifying corpus; no subset gap | `7e51b89` | corpus + subset scan | 0 certifying reviews refused; 0 subset gaps | INFO | confirmed | scans below |
| F-005 | Marker refused anywhere in the header | `validate-protocol.ps1:601` | fixture `[MODE: READ-ONLY\nADVISORY]` | exit 0 (marker split by newline escapes) | MEDIUM | unresolved (residual, pre-existing R3 class) | hardening recommended |
| F-006 | Same | `validate-protocol.ps1:601` | fixture `\| Mode \| READ-ONLY ADVISORY \|` | exit 0 (table-cell form escapes) | LOW | unresolved (residual) | hardening recommended |
| F-007 | Same | `validate-protocol.ps1:601` | `#Mode: ADVISORY`, fullwidth colon, zero-width | exit 0 (exotic prefixes escape) | LOW | unresolved (residual) | hardening recommended |
| F-008 | Legitimate certifying review is not refused | `validate-protocol.ps1:602` | header comment >4000 chars or fenced block quoting the marker | exit 1 (refused) | LOW | unresolved (residual) | hardening recommended |
| F-009 | Executor evidence verifies | `.ai/worklog/claude-0ff8b28052330de0.md` | `protocol-handoff.cjs verify ... --deep` | exit 1: stale vs current tree | INFO | confirmed | expected; certifiers record own |
| F-010 | Launch source list | `LAUNCH-A1-REVIEW.md:6` | `git grep PROTO-DEC-0107` | no such block exists (max is 0106) | INFO | confirmed | for the operator |
| F-011 | No new validator warning | `validate-protocol.ps1` | `validate-protocol.ps1` | exit 0; WARN 108 journals > cap, predates A-1 | INFO | confirmed | for the operator |

## F-005 - [MEDIUM] - A marker split by a newline still certifies

- **Requirement**: AGENTS.md section 2 / LAUNCH-A1-REVIEW item 1: the `[MODE: READ-ONLY ADVISORY]`
  marker in the review header must fail the completion gate. The attack list names "marker
  splitting" explicitly.
- **Location**: `validate-protocol.ps1:601` (Rule 2, `[^\]\r\n]{0,80}` excludes newlines) and `:594`
  (Rule 1, requires a line whose first token is `Mode`).
- **Confidence**: High.
- **Reproduction** (installed role, strict path, candidate `7e51b89`; review header:
  `Date: 2026-09-28`, `Reviewer: opposing-agent`, then the marker split, `Verdict: PASS`):
  ```text
  [MODE: READ-ONLY
  ADVISORY]
  ```
  `node <probe> <worktree>` -> `ACCEPTED` (validator exit 0), whereas the one-line marker is
  `REFUSED`.
- **Actual Result**: An advisory review that writes the marker with a line break still satisfies the
  installed completion gate, so an advisory output can still certify. This is the same class as R3:
  the marker is only matched in the canonical one-line form.
- **Disposition**: `unresolved` (residual). It is not a regression: the pre-fix gate accepted this
  and every other form. R2 already records that the installed role certifies a review with no Mode
  line at all, so hiding the declaration is no stronger than omitting it (R3).
- **Recommendation / Proposed Fix**: outside A-1's allowed files. A follow-up should make the gate a
  whitelist (require `Mode: CERTIFYING` and `Receipt-Owner:` in both roles, `PROTO-DEC-0078`-style),
  which closes F-005..F-008 and R2 together; alternatively allow `\s` including newlines between the
  marker tokens and strip HTML comments with an unbounded quantifier (watch the cost).
- **Proof of Closure**: candidate plus follow-up test refusing the split marker in both roles.

## Deep Dives

### 1. Scope and diff integrity (F-001)

`git diff --stat 74b46ff 7e51b89` names exactly `.ai/worklog/claude-0ff8b28052330de0.md`,
`docs/reviews/2026-09-28-a1-adversarial-prompt.md`, `tests/validator-gate.test.cjs`,
`validate-protocol.ps1` (355 insertions, 6 deletions). `.ai/bin/protocol-handoff.cjs` is untouched;
the `gate-check` invocation remains guarded by `$script:ProtocolRole -eq 'source'`
(`validate-protocol.ps1:896`). The change is one helper (`Get-ProtocolAdvisoryReason:592`) and its
two call sites (`:763`, `:855`); the Reviewer/Verdict and transcription rules are byte-identical.
`bytes>127` in the `.ps1`: 0. Validator exit 0.

### 2. Test-first, both directions (F-002)

- Pre-fix tree (`git archive 6f44903`, whose `validate-protocol.ps1` is identical to `74b46ff`;
  verified with `git diff 74b46ff 6f44903 -- validate-protocol.ps1` -> empty):
  `node --test tests/validator-gate.test.cjs` -> `# tests 4 # pass 2 # fail 2`.
  `not ok 3` lists `installed/strict/Mode... -> exit 0`, `installed/strict/[MODE... -> exit 0`,
  `installed/light/... -> exit 0`, `source/light/... -> exit 0`; `not ok 4` lists all four
  spellings `-> exit 0`.
- Candidate: `# tests 4 # pass 4 # fail 0` (111.5 s).
- Controls are non-vacuous: the same fixture with `Mode: CERTIFYING` passes; the filled
  `templates/reviews/REVIEW.md` (comments kept) passes; a certifying header quoting both forms
  below its first `---` passes. `a1NotRefused` treats a strict-path fallback that fails on a missing
  prompt as "not refused", so a light-path task cannot pass by accident.

### 3. Parity matrix (F-003), pre-fix vs candidate

Built with `tests/helpers.cjs` (fresh git fixture, `protocol-manifest.json` role switched and
committed, one docs change for the light path). Exit codes:

| role / path / form | `6f44903` (pre-fix) | `7e51b89` |
|---|---|---|
| installed / strict / `Mode: READ-ONLY ADVISORY` | 0 | 1 (advisory refusal) |
| installed / strict / marker | 0 | 1 (advisory refusal) |
| installed / light / either | 0 | 1 (advisory refusal) |
| source / strict / `Mode: READ-ONLY ADVISORY` | 1 (gate-check) | 1 (validator + gate-check) |
| source / strict / marker | 1 (gate-check: missing Mode) | 1 (validator + gate-check) |
| source / light / either | 0 | 1 (advisory refusal) |
| installed / strict / control `Mode: CERTIFYING` | 0 | 0 |

A-1 was wider than its finding: the source light path accepted both forms pre-fix and now refuses.
The source strict control with `Mode: CERTIFYING` but no `Receipt-Owner` exits 1, confirming
`gate-check` still runs only in the source role and is not weakened.

### 4. False positives and subset (F-004)

- Corpus scan of 116 `docs/reviews/*.md` with the extracted helper: 30 refused, all of them reviews
  that themselves declare `Mode: ADVISORY` (or a prompt carrying the marker), plus the *unfilled*
  `templates/reviews/REVIEW.md` (`Mode: CERTIFYING | ADVISORY`). No review with a certifying mode is
  refused; the real CERTIFYING review the prompt names
  (`docs/reviews/2026-09-19-mistral-vibe-v1.9.5-certification.md`) passes, as does
  `.ai/docs/PAIRED-CYCLE.md`.
- Subset check over the same corpus: headers the old exact rule refused but the new helper accepts =
  **0 of 116**. The new Rule 1 (`value.ToUpperInvariant().Contains('ADVISORY')`) is a strict
  superset of the old `-eq 'ADVISORY'`, and it also covers list/quote/emphasis prefixes the old
  regex missed. F-008 is the only false-positive direction and needs a header comment >4000 chars or
  a fenced block in the header region, both unusual for a certifying review.

### 5. Targeted regressions and validator

`validator-lightpath` 14/14, `gate` 34/34, `validator` 13/13, `validator-gate` 4/4. Full suite not
run (the operator ran it: 425/425 per LAUNCH-A1-REVIEW). `validate-protocol.ps1` exit 0, one
pre-existing warning (108 journals > cap 100).

### 6. Residuals and adversarial notes

- R2/R3/R4 are confirmed, not new: the installed role requires neither `Mode: CERTIFYING` nor
  `Receipt-Owner`; the Node `gate-check` still compares Mode exactly; `.ai/docs/PAIRED-CYCLE.md:349`
  still says the Mode is rejected anywhere in the file while both engines read only the header.
- Exotic escapes reproduced as ACCEPTED by the candidate: marker gap >80 chars, zero-width space
  after `Mode`, fullwidth brackets, fullwidth colon, `#Mode:` (F-007). All require an author to
  deliberately malform the declaration; none is a regression.
- Timing claims in the executor journal and prompt were not re-measured in full; the hostile-header
  numbers were not re-run (out of the review's required checks). The design of Rule 1 as a
  zero-width lookahead with a bounded value capture is sound and was confirmed against the
  three-line `- Mode:` / `Mode:` / `ADVISORY` case (refused).
- `LAUNCH-A1-REVIEW.md:6` names `PROTO-DEC-0107`; no such block exists in `.ai/DECISIONS.md`
  (newest is `PROTO-DEC-0106`). Likely a typo for PROTO-DEC-0105 item 2; no impact on the review.

## Alternatives Considered & Trade-offs

- **Require `Mode: CERTIFYING` in the installed role (whitelist)**: closes F-005..F-008 and R2 at
  once; rejected for *this* candidate because it exceeds A-1's allowed file set and its launch
  scope ("keep the source-role gate-check intact", "do not weaken any other rule"). Recommended as
  the follow-up.
- **Unbounded HTML-comment strip / `\s` marker**: removes F-005 and F-008 but reopens the
  quadratic-scan risk the executor bounded; deferred to the follow-up with a cost test.

## Recommendations & Actionable Plan

1. Accept A-1 as fixing the reported defect; no change to `7e51b89` is required for merge.
2. Open a follow-up (owner decision) to whitelist certification in the installed role
   (`Mode: CERTIFYING` + `Receipt-Owner`) and to extend the marker match across line breaks; it
   closes F-005..F-008, R1, R2 and R4 together.
3. Certifiers (Sol and MiMo) should re-run the pre-fix/candidate test pair and the parity matrix on
   the frozen SHA; my probes are reproducible from `tests/helpers.cjs` and the report text.

## References

- Candidate: `74b46ff..7e51b89`; defect finding
  `docs/reviews/2026-09-27-claude-powershell-refactor-assessment.md:140`.
- Adversarial prompt: `docs/reviews/2026-09-28-a1-adversarial-prompt.md`.
- Decisions: `PROTO-DEC-0087` item 4, `PROTO-DEC-0105` item 2, `PROTO-DEC-0038` item 1,
  `PROTO-DEC-0041` items 1-2 (``PROTO-DEC-0107`` does not exist).
- Executor journal: `.ai/worklog/claude-0ff8b28052330de0.md`.
- This session journal: `.ai/worklog/deepseek-7673879ed0e8fc01.md`.
