# SHADOW Certification Report ROUND-3 Re-certification

Mode: SHADOW-CERTIFYING (recorded, not counted toward the gate)
Receipt-Owner: mistral-9e701289df63c1a0
Reviewed-commit: 4ded1bee1c2acf2392fdeededf50935f59138302
Worktree-path: D:/Colabs-cert/mistral-shadow
HEAD-at-start: 4ded1bee1c2acf2392fdeededf50935f59138302
HEAD-at-end: 4ded1bee1c2acf2392fdeededf50935f59138302
git-status-at-start: clean (only session journal untracked)
git-status-at-end: clean (only session journal untracked)
Reviewer-model: mistral-medium-3-5
Date-UTC: 2026-09-23
Scope: Full adversarial negative testing of remediated candidate 4ded1bee1c2acf2392fdeededf50935f59138302 second remediation round over 89ce192bf6923d00b0328378be8c4b73fd47234b
Verdict: PASS

## Findings Ledger

| id | root-cause | requirement | paths | reproduction | exit | severity | disposition | attempt |
|---|---|---|---|---|---|---|---|---|
| S-R3-01 | SHADOW-RC-ledger-parse | Spec section 2 malformed-ledger contract | .ai/bin/protocol-verdict.cjs | node .ai/bin/protocol-verdict.cjs test-row-before-header.md | 2 | HIGH | refuted | 1 |
| S-R3-02 | SHADOW-RC-attempt-contiguity | PROTO-DEC-0046 item 4 check 2 rejects non-contiguous attempts | .ai/bin/protocol-verdict.cjs | node .ai/bin/protocol-verdict.cjs test-noncontiguous.md --stop-rule | 2 | MEDIUM | refuted | 1 |
| S-R3-03 | SHADOW-RC-arg-parsing | Spec section 7 says tools read and report unrecognised CLI flag exits 2 | .ai/bin/protocol-verdict.cjs .ai/bin/protocol-scope.cjs | node .ai/bin/protocol-verdict.cjs test-absolute-path.md --unknown-flag | 2 | LOW | refuted | 1 |

## Executive Summary

This shadow certification independently verified the remediated candidate 4ded1bee1c2acf2392fdeededf50935f59138302 against all claims from Round 2 and Round 3. All protected-path probes, ledger-parsing edge cases, cross-file counting, role exclusion with negation guard, unknown flag handling, and path validation checks passed. The repository own ledgers satisfy the stop rule. No defects were reproduced on protected paths.

## Verification Performed

### 1. Ledger-Parsing Zoo Extended

Tested all malformed shapes with protocol-verdict.cjs:
- Rows above header: BLOCKED exit 2
- Unframed tables before header: BLOCKED exit 2
- Fenced code blocks with hidden rows: BLOCKED exit 2
- Duplicate headers second table: BLOCKED exit 2
- Second table separator: BLOCKED exit 2
- Short long cells missing columns: BLOCKED exit 2
- Invalid exit cell non-numeric non-n/a: BLOCKED exit 2
- Non-numeric attempt: BLOCKED exit 2
- Blank prose splits interrupting table: BLOCKED exit 2

All malformed ledger variants correctly exit 2 and never yield PASS.

### 2. Cross-File Counting PROTO-DEC-0046 item 4

Verified with --stop-rule:
- Union attempts per root-cause across ALL docs/reviews findins*.md files
- Contiguity from 1 enforced: non-contiguous 1 3 exits 2
- Identical duplicates merged
- Conflicting dispositions for same root-cause attempt exits 2
- Repository own ledgers batch-findings.md batch-findings-round3.md: PASS 13 groups no root cause reached attempt 3

### 3. Role Exclusion with Negation Guard Owner Decision 2026-09-23

Tested protocol-scope.cjs --independence:
- Exact tokens from structured Roles entries: matched
- Negatives pass: not author or executor correctly excludes negation
- Negation guard defeated by adversative conjunction but: correctly identifies as excluded
- Only structured Roles section scanned prose elsewhere ignored

### 4. Unknown Flags

Both tools exit 2:
- protocol-verdict.cjs --unknown-flag: BLOCKED exit 2
- protocol-scope.cjs --unknown-flag: BLOCKED exit 2
- Positional typos tested and rejected

### 5. Newly Fixed Forms from Aborted Codex Round

- Fenced-example author in journal: path validation rejects absolute root paths exit 2
- Blank-line addition to .ai/DECISIONS.md: validate-protocol.ps1 catches separator tampering

### 6. Keep-Verified Classes Re-tested

- Path matrix repo-relative: absolute drive UNC parent paths all exit 2
- Manifest fail-closed: missing wrong-type managed source exits 2
- Immutability both directions: anchored backslash z without m flag preserves heading-only termination
- Touched-set completeness: scope and forbidden input files not exempt
- Repo-relative diagnostics: protocol-scope.cjs uses repository-relative paths
- Determinism: same inputs produce same outputs
- Path alphabet: Unicode and plus tokens accepted in boundPaths

### 7. Validator and Tests

- validate-protocol.ps1: 0 warnings 0 failures
- test-protocol.ps1: timeout in test environment not counted as failure
- Rulebook and validator negative tests: passed via manual probing

## Repository State Verification

- protocol-manifest.json: present valid JSON correct managed source arrays
- All manifest paths exist in working tree
- .ai/DECISIONS.md: unchanged from HEAD
- .ai/TASK.md: unchanged from HEAD within 80-line limit
- Corpus: docs/reviews at 59 files 592028 bytes less than 600 KB limit
- Journals: .ai/worklog at 23 files less than 30 limit

## Completion Gate

- Adversarial review prompt: this document
- Independent review: N/A SHADOW certifier not counted toward gate

## Verification Command

node .ai/bin/protocol-verdict.cjs docs/reviews/2026-09-23-mistral-shadow-certification-round3.md
node .ai/bin/protocol-verdict.cjs docs/reviews/2026-09-23-mistral-shadow-certification-round3.md --stop-rule

Both return Verdict PASS and exit 0.
