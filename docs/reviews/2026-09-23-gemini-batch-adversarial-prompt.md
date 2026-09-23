# Unified Adversarial Audit Prompt: Executable Rulebook, Immutability Fix, Layers A/B/C Batch

- Date: 2026-09-23
- Author: Gemini (Gemini Flash), session `gemini-8a06ba8cb343bedc`
- Role: implementer
- Target Certifiers: DeepSeek and Copilot (outside execution and control per PROTO-DEC-0041 item 1)
- Scope: protocol core, validator, executable rulebook (`protocol-verdict.cjs`, `protocol-scope.cjs`), immutability fix, layers A/B/C fixes
- Baseline Commit: 82bf99a8e2bfcde3ff375b9995f3ab45edb7ddc5
- Working Tree: dirty
- Corpus Reservation: active docs/reviews 53 files / 514,094 B before prompt; +1 file / ~7 KB -> 54 files / ~521 KB (budget <= 60 files / 614,400 B)

---

## 1. Batch Overview

This unified adversarial audit prompt covers the entire batch for certification under the PLAN batching rule:
1. Executable rulebook implementation (`.ai/bin/protocol-verdict.cjs`, `.ai/bin/protocol-scope.cjs`) and its regression suite `tests/rulebook.test.cjs` (20/20 pass).
2. Decision-block immutability fix in `validate-protocol.ps1:424,996-1004` and its bidirectional regression in `tests/validator.test.cjs`.
3. Five layers A/B/C root-cause fixes already committed in the tree (`82bf99a` / `f68b502`).

---

## 2. Implementations to Attack

### Check 1: Spec Section 1 Boundary & Findings Ledger Semantics
- **Rulebook Spec Section 1**: Checks enforce ONLY recorded, deterministic repository rules. No model consultation, no network, visible hand-reproducibility.
- **Findings Ledger**: `docs/reviews/<date>-<task>-findings.md` requiring 9 columns: `id`, `root-cause`, `requirement`, `paths`, `reproduction`, `exit`, `severity`, `disposition`, `attempt`.
- **Attack Target**: Attempt to construct a malformed table (missing columns, duplicate IDs, invalid severity/disposition) and verify `protocol-verdict.cjs` exits 2 (BLOCKED) without silent acceptance.

### Check 2: Verdict Arithmetic Severity-Independence
- **Requirement (PROTO-DEC-0041 item 4)**: `severity` is recorded for human ordering and is NEVER an input to the verdict.
- **Protected Paths**: `.ai/`, `.claude/`, hooks, validator, gates, consumer security/data paths.
- **Attack Target**:
  - Confirmed finding on protected path with `severity: LOW` or `INFO` must evaluate to `FAIL` (exit 1).
  - Confirmed finding off protected path without invariant/contract must evaluate to `RECOMMENDATION` (exit 0).
  - Confirmed finding with `reproduction: none` cannot exceed `RECOMMENDATION` (advisory by AGENTS sec 2).
  - Unresolved finding or unrunnable check must evaluate to `BLOCKED` (exit 2).

### Check 3: Root-Cause Stop Rule (`--stop-rule`)
- **Requirement**: Group findings by `root-cause`; max attempt >= 3 triggers STOP (exit 1). Non-contiguous attempts (e.g. 1, 3) must be caught as a ledger defect (exit 2).
- **Attack Target**: Test attempt counting, edge cases with mixed dispositions, and non-contiguous attempt gaps.

### Check 4: Scope & Author-Not-Reviewer Independence
- **Scope Check**: `protocol-scope.cjs --baseline <sha> --scope <paths-file>` parses `git diff -z`, normalizes trailing slashes, prevents prefix matching from acting as directory matching, and enforces forbidden paths.
- **Independence Check**: `protocol-scope.cjs --independence <review-path>` verifies `Receipt-Owner` != candidate producer and reviewer is not listed as implementer in `.ai/TASK.md` roles.
- **Attack Target**: Pass non-ASCII paths (e.g. Russian filenames), path traversal attempts, or self-certification reviews to verify exit codes 1 and 2.

### Immutability Boundary Fix (validate-protocol.ps1:424, 996-1004)
- **Defect (F-003)**: Appending a decision block after the committed last block was previously attributed to the preceding block due to regex heading termination, exiting 1 on clean additions.
- **Fix**: Pattern updated to `(?ms)^### (?<id>(?:PROTO-)?DEC-(?<number>\d{4}))[^\r\n]*(?:\n|\z)(?<body>.*?)(?=^(?:#{1,3}[ \t]+|---[ \t]*$)|\z)` with `.TrimEnd()` normalization.
- **Attack Target**:
  - Direction A: Appending a new decision block after committed HEAD exits 0 (tested with and without `---` separators).
  - Direction B: Genuine tampering with an existing committed decision block is caught and exits 1.
  - Direction C: Deletion of a committed block is caught and exits 1.

### Five Layers A/B/C Root-Cause Fixes (Tree Checkpoint)
- **RC-1 (Unsafe git output parsing)**: Handled via NUL-delimited `-z` across tooling.
- **RC-2 (Silent empty on missing input)**: Missing baseline or scope file exits 2, never empty set.
- **RC-3 (Too narrow path-token filter)**: Valid path tokens properly delimited without truncation.
- **RC-4 (Non-git walk skipping symlinks/junctions)**: Reparse points explicitly rejected / guarded.
- **RC-5 (Exclusion matching vs trailing slash)**: Trailing slash normalizations properly applied.

---

## 3. Specific Claims to Attack

1. **Claim 1**: In `protocol-verdict.cjs`, the verdict arithmetic is strictly severity-independent. No combination of LOW/INFO labels can downgrade a confirmed defect on a protected path.
2. **Claim 2**: In `validate-protocol.ps1`, the decision block regex reliably distinguishes the boundary between the last committed decision block and an appended block separated by `---`, without weakening detection of modifications within the committed block.
3. **Claim 3**: In `protocol-scope.cjs`, non-ASCII repository paths (e.g. Cyrillic directory or file names) are never C-quoted or dropped, and prefix overlap without separator never passes as a subtree match.
4. **Claim 4**: `tests/rulebook.test.cjs` and `tests/validator.test.cjs` prevent regressions across all four checks and both immutability directions.

---

## 4. Claims I Am Least Sure Of

1. **Cross-platform newline edge cases in decision block boundary regex**: While `\r?\n` normalization and `.TrimEnd()` handle standard LF and CRLF, unexpected combinations of whitespace and horizontal rules between decision blocks could theoretically impact boundary detection.
2. **Review header metadata parsing across legacy vs certifying formats**: `protocol-scope.cjs --independence` expects standard YAML-like headers (`Receipt-Owner: ...` or `Session: ...`). If a review formats headers inside code blocks or body text, strict header-region truncation must not produce a false PASS.
3. **Escalation attempt grouping with multiple root-causes**: In `--stop-rule`, if multiple root-causes appear in interleaved order with different attempt counts, ensure the maximum attempt per root cause is strictly isolated.
