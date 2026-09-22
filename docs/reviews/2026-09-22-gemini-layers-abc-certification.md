# Gemini - Layers A, B and C (PROTO-DEC-0044) Certification

**Date**: 2026-09-22  
**Reviewed commit**: d38d2f2ae4b4c17fe6c2c18f11215cedb2f10eb1  
**Working tree**: dirty  
**Reviewer**: gemini  
**Scope**: architecture  
**scope-check**: PASS  
**Verdict**: PASS  
**Mode**: CERTIFYING  
**Receipt-Owner**: gemini-b9e6db0e697dcef8  

---

## Executive Summary

Independent adversarial certification of `PROTO-DEC-0044` (Layers A, B, and C) conducted per PROTO-DEC-0041 item 2. All 10 claims were empirically attacked from the repository. All 315/315 regression tests pass (`test-protocol.ps1`), and `validate-protocol.ps1` returns exit 0 (1 non-blocking journal cap warning due to active testing sessions). The tools operate strictly under `.ai/runtime/`, are non-authoritative and advisory under PROTO-DEC-0034 item 1, and cannot mutate or bypass completion gates or tree digests. Three non-blocking implementation edge cases were identified and documented as recommendations for the backlog. Verdict: **PASS**.

---

## Baseline and Empirical Validation

- **Baseline Commit**: `d38d2f2ae4b4c17fe6c2c18f11215cedb2f10eb1` (working tree dirty, uncommitted candidate changes present).
- **Protocol Validator**: `validate-protocol.ps1` exited 0. Emitted 1 warning: `[WARN] 31 session journals in .ai/worklog (cap 30, PROTO-DEC-0037 WARN-first policy)`. Pre-dispatch count was 30; new concurrent certifier sessions pushed the count to 31.
- **Protocol Test Suite**: `test-protocol.ps1` exited 0, 315/315 tests passed across all subtests including `tests/index.test.cjs` (5/5), `tests/ledger.test.cjs` (8/8), `tests/hooks.test.cjs` (+2), and `tests/manifest.test.cjs` (19/19).
- **Corpus Budget Pre-Check**: Active `docs/reviews/` stood at 56 files and 579,613 bytes prior to this report; addition of this artifact keeps the corpus at 57/60 files and ~589 KB / 600 KB, safely within PROTO-DEC-0037 limits.

---

## Adversarial Attacks and Claim Verification

### C-1. The tools cannot influence a gate (PROTO-DEC-0034 item 1, PROTO-DEC-0044 item 4) - PASS
- **Attack**: Injected arbitrary corrupted files into `.ai/runtime/`, wiped `.ai/runtime/`, and checked whether `protocol-handoff.cjs anchor()` digest or `gate-check` changed.
- **Observation**: Working tree digest remained bit-for-bit identical (`sha256:81899adef81fd0b8fc6c69bf01c9638c1bcaeb3ea63c4f7d669a07ab507925d0`) because `.ai/runtime/` is excluded via `.gitignore` and `git ls-files --exclude-standard`. `gateCheck()` contains zero references to index or ledger tools. Absence of runtime tools cleanly degrades to standard workflow.

### C-2. Layer A does not displace injected context - PASS
- **Attack**: Inspected `hooks.context()` under saturated budgets.
- **Observation**: `.ai/TASK.md` and `Git status` are prepended before `Large tracked documents`. The inventory output is capped to 8 entries (`INVENTORY_SHOWN = 8`, limit 900 chars). The `add()` helper explicitly replaces overflowing blocks with `(Not injected in full: read this file directly.)`, preventing silent character-level truncation.

### C-3. Layer A's inventory is robust input handling - PASS
- **Attack**: Tested missing files from disk that remain in git index, missing git binary, uncommitted empty repos, and invalid working trees.
- **Observation**: `inventory()` wraps all git invocations and `fs.statSync` in `try / catch` blocks. Missing files and permission errors `continue` safely. If `git` fails or directory is non-git, it catches and returns `''`.

### C-4. Layer B never becomes a source of truth and detects its own staleness - PASS
- **Attack**: Mutated `.ai/DECISIONS.md` while preserving identical byte length; deleted `.ai/runtime/decisions-index.md`; ran `--check` on missing `DECISIONS.md`.
- **Observation**: `--check` validates `sha256(text)`. Swapping characters changed the hash and caused `--check` to immediately exit 1 with `stale`. A missing index exited 1 with `missing`. A missing `DECISIONS.md` threw ENOENT and exited 1.

### C-5. Layer B's reverse path index is honest - RECOMMENDATION
- **Attack**: Analyzed `boundPaths()` regex extraction across all 44 decision blocks.
- **Observation**: Extracted 85 bound paths. However, `PATH_LIKE = /^[A-Za-z0-9_.@/\\-]+$/` drops 12 legitimate path references containing globs (`docs/**`, `.ai/**`), placeholders (`<owner-id>`, `<agent>`), subcommands (`gate-check`), and line ranges (`.ai/PLAN.md:51-54`). Also, standalone extension token `.ps1` is extracted as a path. Since the index is explicitly advisory and points to source blocks rather than deciding compliance, this does not break core invariants.

### C-6. Layer C's corpus is the repository, not the prompt - RECOMMENDATION
- **Attack**: Tested symlinked directory handling during non-git directory walks, prefix exclusion matching (`logs` vs `logs-old`), and directory exclusions with trailing slashes.
- **Observation**: Prefix matching distinguishes `logs` from `logs-old` correctly. However:
  1. Symlinked directories are ignored during non-git `walk()` because `entry.isDirectory()` is false for symlinks under `withFileTypes: true`. This prevents recursion cycles but skips linked trees.
  2. `isExcluded()` checks `normalized === item || normalized.startsWith(`${item}/`)`. Supplying `--exclude dir/` causes `.startsWith('dir//')`, which fails to exclude child files.

### C-7. Layer C's exit codes mean what they say - PASS
- **Attack**: Evaluated `cover` and `dup` boundary conditions and self-comparison.
- **Observation**: `cover` exits 0 when all units have records; exits 1 on unexpected records; exits 1 on missing records only when `--expect-all` is supplied. `dup` parses options cleanly, ignores `--out` from comparison sets, and returns exit 1 if and only if cross-producer duplicates exist (`across.length > 0`).

### C-8. The declared limits are complete and honest - RECOMMENDATION
- **Attack**: Audited declared vs undeclared limits across all three layers.
- **Observation**: Declared limits (50 KB floor, 8-row cap, first-sentence truncation, whole-file hash comparison) are accurate. Additional minor undeclared boundaries (git quoting behavior under `core.quotePath`, regex token boundary in path extractor, trailing slash in excludes) have been cataloged below.

### C-9. Scope discipline - PASS
- **Attack**: Checked `git status --porcelain` and diffstat against the baseline.
- **Observation**: Edits are strictly confined to the candidate surface. No completion requirements, gates, verdict vocabularies, or receipt formats were altered. PROTO-DEC-0034, 0036, 0038, 0039, 0040, 0041, 0042, 0043 remain intact.

### C-10. Propagation claim - PASS
- **Attack**: Verified `setup-ai-protocol.ps1`, `tests/manifest.test.cjs` (19/19 pass), and `tests/installer.test.cjs` (21/21 pass).
- **Observation**: Both `.ai/bin/protocol-index.cjs` and `.ai/bin/protocol-ledger.cjs` are declared in `managed` and installed to host targets. Installed projects at version 1.9.0 remain unaffected until upgraded.

---

## Findings Table

| ID | Requirement / Target | Command / Probe | Observed Result | Severity | Disposition |
|---|---|---|---|---|---|
| F-001 | Layer B path extraction | `node .ai/bin/protocol-index.cjs` | Excludes 12 path-like tokens containing `*`, `<`, `>`, `:`, or spaces; extracts standalone `.ps1` | LOW | confirmed |
| F-002 | Layer C exclusion syntax | `protocol-ledger.cjs cover --exclude dir/` | Trailing slash in `--exclude` evaluates `.startsWith('dir//')`, failing to exclude child paths | LOW | confirmed |
| F-003 | Layer C non-git directory walk | `protocol-ledger.cjs cover` on non-git dir | Symlinks to directories return `isDirectory() === false` and are not recursed or counted | LOW | confirmed |

---

## Certification Conclusion

The implementation of `PROTO-DEC-0044` meets all architectural invariants:
1. Strict advisory containment under `.ai/runtime/` with zero influence on gates or receipts.
2. Full test suite passing (315/315).
3. Findings F-001 through F-003 are non-blocking advisory improvements to auxiliary tooling and do not compromise security, data integrity, or core protocol gates.

Final Verdict: **PASS**
