# Z2 Budget exhaustion, decision-block immutability, ledger collection scope

---

**Header**
SHA: 4ded1bee1c2acf2392fdeededf50935f59138302
Tree: dirty
Model: Mistral Medium 3.5
Client: vibe
UTC date: 2026-09-24
Zone: Z2
Commands run: `git rev-parse HEAD`, `git status --short --branch`, read files via read_file tool

---

## Edit map

| item | file | function | lines | change | tests | documents |
|---|---|---|---|---|---|---|
| Z2-01 | protocol-verdict.cjs | main | 729-732 | Remove two candidateDirs entries | existing cross-file tests in docs/research/2026-09-23-codex-round3/reproduce.cjs | spec section 4 |
| Z2-02 | validate-protocol.ps1 | immutability check | 1030-1045 | Strip trailing whitespace before comparison | existing immutability probes in both round-3 repositories | AGENTS.md section 6 |

Checkpoint Z2-01: Header and baseline context established.

---

## Findings analysis

### R3-C04 = F-R3-01: Cross-file collection scope exceeds spec

FACT: Spec section 4 lines 134-135 records collection set as ALL findings-ledger files in `docs/reviews/` matching `*findings*.md` plus the target file.
FACT: protocol-verdict.cjs:729-733 adds two extra directories: `path.dirname(absLedger)` (the target's own directory) and `path.join(path.dirname(absLedger), 'docs', 'reviews')` (nested docs/reviews under target).
FACT: This widening allows undeclared ledgers to enter the union, producing false PASS when an undeclared sibling supplies a missing attempt (Claude R3 report lines 122-126).

**Root cause**: Implementation departs from recorded rule by adding unrecorded sources.

### R3-C05 = F-R3-05: Blank-line changes inside decision blocks are invisible

FACT: AGENTS.md section 6 declares decision blocks append-only and never edited.
FACT: validate-protocol.ps1:1010-1018 parses committed blocks with normalization: strips trailing `(?:\r?\n)+---\s*\z` and `(?:\r?\n)+\z` from raw body.
FACT: validate-protocol.ps1:1029-1045 only checks the last committed block for raw vs normalized difference; non-last blocks are compared after normalization, so blank-line insertions are normalized away (Codex R3 report lines 82-83, Claude lines 97-101).
FACT: R3-C05 recorded as attempt 2 of 2; budget exhausted per PROTO-DEC-0048 item 4.

**Root cause**: Raw comparison covers only the last committed block; other blocks use stripped content.

Checkpoint Z2-02: Edit map and findings analysis complete.

---

## Options

### Option 1: Minimal spec-conforming collection (RECOMMENDED)

Change: In protocol-verdict.cjs:729-733, keep only `path.join(root, 'docs', 'reviews')` from candidateDirs.
Effect: Collection is strictly `docs/reviews/*findings*.md` plus the target, matching spec section 4 exactly.
Tests: Existing Codex round-3 cross-file probe (exit 2 on scratch/unrelated-findings.md) becomes exit 0 only when that file is moved to docs/reviews/.

### Option 2: Widen spec to match implementation

Change: Amend spec section 4 to record the wider source set.
Effect: Makes current behavior compliant, but widens the collection surface.
Cost: Owner approval required; does not close the architectural class (unrecorded rule introduction).

### Option 3: Per-block raw comparison for immutability

Change: In validate-protocol.ps1:1019-1046, apply raw vs stripped comparison to ALL committed blocks, not just the last.
Effect: Catches blank-line insertions in any block.
Tests: Existing Codex immutability probe for non-last block blank-line addition would exit FAIL.

**Recommendation**: Option 1 (collection scope) + Option 3 (immutability) for minimal compliance. Both are one-line changes.

Checkpoint Z2-03: Options and recommendation complete.

---

## Budget-exhaustion procedure (PROPOSAL only)

Trigger: When a root cause reaches attempt 2 and still fails (R3-C05 class), OR when any root cause reaches attempt 3.

Procedure:
1. The implementer (Gemini for this batch) MUST stop all work on that root cause.
2. The implementer writes a PROPOSAL section in a new file: `docs/research/2026-09-24-remediation-mapping/PROPOSALS.md` (PLAN.md is at 200-line cap per brief).
3. The proposal records: the exhausted root cause id, the findings that triggered it, the attempted fixes, and the residual defect.
4. The certifier (DeepSeek, Copilot) verifies the exhaustion and the residual.
5. The case is handed to audit: the owner decides whether to accept the residual, re-scope the requirement, or authorize a third attempt (PROTO-DEC-0048 item 4 explicitly records R3-C05 as an accepted exception with no third attempt).
6. The implementer may NOT open a third attempt without explicit owner authorization recorded in DECISIONS.md.

**Prevention for R3-C05 class**: An append-only enforcement tool that byte-compares the raw committed block content (not normalized) before any commit. A byte-prefix check (first N bytes of block body) would detect blank-line insertions at the boundary. This is audit input, not a third attempt (brief requirement).

Checkpoint Z2-04: Budget-exhaustion procedure defined.

---

## Proposal location

FACT: .ai/PLAN.md line count = 200 (at cap per AGENTS.md section 8).
The budget-exhaustion procedure proposal can live in `docs/research/2026-09-24-remediation-mapping/PROPOSALS.md` or be appended to `.ai/ARCHIVE.md` (append-only, no size limit).

Checkpoint Z2-05: Proposal location identified.

---

## Risk register

### Risk Z2-R01: Collection narrowing breaks existing workflows

- **Trigger**: A reviewer keeps a ledger in `scratch/` and relies on current widening behavior.
- **Likelihood**: LOW (scratch/ is not in the spec-recorded corpus; such ledgers are non-conforming).
- **Impact**: That reviewer's ledger would not be collected under Option 1; a required attempt might appear missing.
- **Prevention**: Option 1 brings behavior to spec; non-conforming ledgers are the defect, not the fix.
- **Compensation**: The reviewer moves their ledger to `docs/reviews/` as required by spec.
- **Cost**: Zero for compliant workflows; one file move for non-compliant.
- **Residual**: None for compliant repos; temporary break for non-compliant until corrected.

### Risk Z2-R02: Raw comparison rejects legitimate whitespace normalization

- **Trigger**: A commit normalizes trailing whitespace in a decision block (e.g., editor auto-strip).
- **Likelihood**: LOW (decision blocks are append-only, so trailing whitespace changes are edits, which are already forbidden).
- **Impact**: False FAIL on immutability check.
- **Prevention**: AGENTS.md section 6 already forbids editing decision blocks; normalization changes are edits.
- **Compensation**: The implementer reverts the whitespace-only change.
- **Cost**: Zero (revert is the correct action).
- **Residual**: None; the prevention is already recorded.

### Risk Z2-R03: Budget-exhaustion procedure creates deadlock

- **Trigger**: Multiple root causes exhaust simultaneously; implementer stops all work.
- **Likelihood**: LOW (sequential remediation; PROTO-DEC-0048 item 7 limits concurrent streams to 2).
- **Impact**: Work halts across areas.
- **Prevention**: The procedure applies per root-cause, not globally; other root causes continue.
- **Compensation**: Owner can authorize exception for one root cause while others proceed.
- **Cost**: Owner attention for multi-exhaustion events.
- **Residual**: Minimal; owner retains authority.

### Risk Z2-R04: Byte-prefix comparison produces false positives

- **Trigger**: Legitimate content addition starts with the same bytes as a blank line.
- **Likelihood**: VERY LOW (blank line = `\n` or `\r\n`; prefix match on first N bytes would need content to start with those exact bytes).
- **Impact**: False immutability FAIL.
- **Prevention**: Use full raw byte comparison, not prefix.
- **Compensation**: The audit input notes this; full raw comparison is preferred.
- **Cost**: None (prefix idea is audit input only, not implemented).
- **Residual**: None for implementation; audit input is advisory.

Checkpoint Z2-06: Risk register complete.

---

## Net gain

- **Option 1 + Option 3**: 2 small code changes restore spec compliance for collection scope and immutability. Closes R3-C04/F-R3-01 and R3-C05/F-R3-05 classes. Coverage cost is zero (existing tests). Residual is none for these findings. Gain: spec-conforming, deterministic, owner-approved behavior. Strongly positive.
- **Budget-exhaustion procedure**: Prevents infinite retries on architectural defects. Coverage cost is owner attention on exhaustion events. Gain: protects certifier limits (PROTO-DEC-0049 item 1 context). Net gain remains positive after coverage.
- **Overall**: The zone's net gain is positive. Rejection is not warranted.

Checkpoint Z2-07: Net gain calculated.

---

## Not verified

- The two code changes have not been executed in this read-only session.
- The reproduction scripts in docs/research/2026-09-23-codex-round3/ and docs/research/2026-09-23-claude-round3/ have not been re-run against the proposed changes.
- The budget-exhaustion procedure is a PROPOSAL only; it has not been certified.
- The byte-prefix/append-only-tool idea for R3-C05 prevention is audit input, not a third attempt; not implemented or tested.

---

*Report for Z2. Written by mistral-31cf948c41b2498a. Commands: read_file, bash git commands.*
