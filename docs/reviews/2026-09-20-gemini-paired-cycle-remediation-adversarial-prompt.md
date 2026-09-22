# Unified Adversarial Audit Prompt: Paired-Cycle Remediation (Wave C, C40-01..C40-08)

- **Date**: 2026-09-20 (UTC)
- **Target Reviewer**: DeepSeek (owner `deepseek-59c81998639a4feb`, Controller & Independent Reviewer)
- **Implementer**: Gemini (owner `gemini-927b6b871251a111`)
- **Mode**: CERTIFYING / ADVERSARIAL CHALLENGE
- **Baseline**: Anchor `d38d2f2ae4b4c17fe6c2c18f11215cedb2f10eb1`, working tree dirty
- **Scope**: full PROTO-DEC-0040 Wave C remediation addressing findings C40-01..C40-08 from `docs/reviews/2026-09-20-codex-paired-cycle-remediation-reaudit.md`, authorized in `docs/reviews/2026-09-20-deepseek-gemini-wave-c-remediation-prompt.md`, and updated for external re-review fix round (F-1..F-5).

## Context, Changes & Wave C Remediation (C40-01..C40-08)

1. **C40-01 & C40-05 (Protected Paths Priority & Strict Allowlist)**:
   - Evaluated in strict order in BOTH engines: raw changed set (excluding strictly `.ai/worklog/**`, `.ai/runtime/**`, `.ai/TASK.md`) checked against all protected paths (`.ai/**` [except the 3], `.claude/**`, `.github/**`, `.codex/**`, `tests/**`, `templates/**`, `docs/decisions/**`, root `AGENTS.md`, `CLAUDE.md`, `protocol-manifest.json`, `validate-protocol.ps1`, `setup-ai-protocol.ps1`, `test-protocol.ps1`, and executable extensions `.ps1`, `.psm1`, `.cjs`, `.mjs`, `.js`, `.ts`, `.sh`, `.bat`, `.cmd`, `.py`).
   - Only after protected check passes, review artifact is removed from changed set. Remaining non-empty set must match scope allowlists (`docs`: `.md`, `.txt`, `.rst` under `docs/` or root `README.md`/`CHANGELOG.md`; `config`: `.gitattributes`, `.gitignore`, `.editorconfig`). Empty remainder forces strict path.
   - Tested: protected core named as review artifact fails (`CLAUDE.md`); executable under `docs/` fails (`docs/auth.js`).

2. **C40-02 (Immutable 40-Hex Baseline & Post-Commit Stability)**:
   - `- Baseline: <40-hex sha>` is required for light path. Validated against regex `^[0-9a-f]{40}$` BEFORE invoking Git in BOTH engines. `HEAD`, branch names, tags, short SHAs, and moving refs immediately force the strict path.
   - Checked via `git rev-parse --verify <sha>^{commit}` and `git merge-base --is-ancestor <sha> HEAD`.
   - Verified that ordinary commit of completed docs work retains the same baseline and yields `PASS/PASS` in both engines.

3. **C40-04 & C40-06 (Engine Parity, Header Contract, Path Safety & Fix Round)**:
   - Review parsing parity: header region strictly text before first `---` or `## `; `Reviewer:` and `Verdict:` must be in header. Both Node strict and light paths now require `Reviewer:`, matching PowerShell. `Verdict:` trimmed must strictly equal `PASS` or `RECOMMENDATION`; `Mode: ADVISORY` and transcription markers are rejected everywhere.
   - PowerShell `headerEnd` bounds fix: when header terminator is line 0 (`$headerEnd -le 0`), evaluates to empty header region `""` rather than `0..-1` splicing the file's last line.
   - Path normalization parity: leading `./` normalization is identical in both engines (`-replace '^\./', ''` in PowerShell, `.replace(/^\.\//, '')` in Node) across both light and strict paths.
   - Path containment parity: `isSafeInRoot` and `Test-ProtocolSafePath` reject any segment that is a reparse point or symlink (in-root and out-of-root).
   - Manifest role: `source` requires prompt/review under `docs/reviews/`; `installed` permits any safe in-root path.

4. **C40-07 (Corpus Accounting & Safe Non-Reparse Traversal)**:
   - `validate-protocol.ps1` recursively inspects `docs/reviews/` (excluding `docs/reviews/archive/`) using queue-based traversal that does not follow reparse points or symlinks.
   - Counts all files and cumulative bytes; triggers WARN if files > 60 or bytes > 600 KB.
   - Real measurement: active review corpus is currently 56 files / 579,991 bytes (~566.4 KB), within the 60 files / 600 KB cap. Validator reports 1 warning (31 session journals, cap 30).

5. **C40-08 (Docs, Contract & PATH-Independent Upgrade Suite)**:
   - Fixed CERTIFY template outer fences in `.ai/docs/PAIRED-CYCLE.md` with 4 backticks; regression test verifies header template parsed from real file.
   - Documented full light-gate contract (`Scope`, immutable 40-hex `Baseline`, evaluation order, allowlists) in `.ai/docs/PAIRED-CYCLE.md` and `.ai/docs/PROTOCOL.md`.
   - `tests/upgrade.test.cjs`: extraction is PATH-independent (prefers `C:\Windows\System32\tar.exe` when present, runs with `cwd = tmp`, relative archive name `release.tar` and extract target `-C old-src`); asserts `git archive` and `tar` exit statuses (no silent continue).
   - Per-tag coverage test in `tests/upgrade.test.cjs`: depends strictly on `passedTags` results from per-tag upgrade tests (`v1.9.4`, `v1.9.5`), preventing any false `PASS verified` diagnostic if per-tag tests fail or skip.
   - Full test suite green at 300/300 tests.

## Adversarial Audit Challenge Questions (C40-01..C40-08 & Fix Round)

1. **C40-01**: Can a core file modification be hidden from gate enforcement by naming it as the `Independent review:` artifact under `Scope: docs`?
2. **C40-02**: Does the light path remain `PASS/PASS` in both PowerShell and Node after completing work and running `git commit` against the original baseline?
3. **C40-02**: Does declaring `Baseline: HEAD` or a short SHA bypass gate checks or invoke Git without 40-hex validation?
4. **C40-04**: Do both engines require `Reviewer:` in strict and light paths, and reject `PASS WITH BLOCKERS`, transcription markers, and body-only fields?
5. **C40-04**: Does a line-0 header terminator evaluate safely to an empty header region without splicing the last line of the file in PowerShell?
6. **C40-05**: Does adding an executable (`.js`, `.ps1`) under `docs/` force the strict path and fail without an adversarial prompt?
7. **C40-06**: Do both engines normalize leading `./` identically in prompt and review paths? Does an in-root junction review fail safe-path checks in both engines?
8. **C40-07**: Does the corpus budget count non-`.md` files, exclude `docs/reviews/archive/`, and refuse to follow symlinks/junctions outside root?
9. **C40-08**: In `tests/upgrade.test.cjs`, is tar extraction PATH-independent, are exit statuses asserted, and is the coverage test strictly bound to `passedTags` results?

Verify against the current tree using `validate-protocol.ps1` and `test-protocol.ps1`. Output an independent CERTIFYING review (`Mode: CERTIFYING`).
