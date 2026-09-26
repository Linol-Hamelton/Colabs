# Unified Adversarial Audit Prompt for PKG-1 ROUTES

Mode: ADVISORY (audit prompt for stage-12 independent certifiers)
Baseline: 7b6d17a; working tree: dirty (W1 uncommitted candidate)
Author: Gemini 3.8 Flash (route agy, effort high, stream E1), 2026-09-26
Scope: PKG-1 ROUTES - protocol-dispatch.cjs, clients.json, bin-output-schema.md, CLI-AGENTS.md, tests
Target certifiers: Kimi K2.7 Code HighSpeed and MiMo-V2.6-Flash (PROTO-DEC-0086 item 1)

## Summary

PKG-1 replaces legacy research launch paths (`run-chain.cjs`, `launch.cjs`) with a unified kernel dispatcher (`.ai/bin/protocol-dispatch.cjs`), a verified client registry (`.ai/docs/clients.json`), Level-1 private clone isolation, progress-based liveness monitoring (PROTO-DEC-0075 item 5), and standard token-based CLI output schema (`docs/specs/bin-output-schema.md`).

## Adversarial Audit Probes (AC-1 through AC-16)

Certifiers must hunt for bypasses, regressions, unhandled exceptions, and grammar violations:

- **AC-1 (CLI invocation grammar)**: Invoke dispatch with 0 args, unknown command `bogus`, and unknown flag `--fake`. Verify exit code 2 and first row matches `USAGE` or `ERROR reason=unknown-flag|unknown-command`.
- **AC-2 (Registry loader robustness)**: Inject malformed registry (extra unknown key, missing `command`/`flags`, wrong types). Verify exit code 2. Verify `.ai/docs/clients.json` parses all 8 workstation clients.
- **AC-3 (Dispatch loader & safety)**: Feed dispatch with unknown key, traversal paths (`../outside`), out-of-range timeouts (`stallMin: 0`). Verify exit code 2. Missing launch path must exit 1 (`ERROR reason=launch-missing`).
- **AC-4 (Parity check on golden fixtures)**: Run `check` on `DISPATCH.json` -> must exit 0 (23 slots). Run `check` on `tests/fixtures/dispatch/R3-DISPATCH.json` -> must exit 1 with exactly 10 `ERROR reason=launch-missing` rows and no grammar errors.
- **AC-5 (Clean clone lifecycle)**: Run end-to-end attempt with fake client (`work` mode). Verify only declared outputs and new session journal are copied back to main tree; clone directory is cleanly removed.
- **AC-6 (Level-1 containment & policy enforcement)**: Run fake client with: (a) undeclared file write, (b) git commit (`HEAD moved`), (c) git config/remote edit, (d) push attempt. Verify each is caught with `SCOPE_STOP` or `POLICY_FAILURE`, nothing copied to parent, and dirty clone preserved for operator triage.
- **AC-7 (Credential stripping)**: Inspect child environment during execution. Verify `GH_TOKEN`, `GITHUB_TOKEN`, `X_GIT_TOKEN`, `SSH_AUTH_SOCK` are scrubbed; `GIT_CONFIG_NOSYSTEM=1` is injected.
- **AC-8 (Liveness watchdog & process termination)**: Run silent fake client (`silent`) -> verify `STALL` at `--stall-seconds`. Run noisy non-progress fake client (`always-talking`) -> verify `TIMEOUT` at `--hard-seconds`. Confirm process trees are completely terminated.
- **AC-9 (Failure classification & numeric guards)**: Feed error text samples. Verify all 12 S6 classes are correctly classified. Ensure "line 503" and "429 tokens" do NOT trigger false-positive classification.
- **AC-10 (Dependency DAG & when skipping)**: Verify slots with unsatisfied `needs` remain BLOCKED until dependency is DONE. Verify `when.notMatch` condition skips slot cleanly.
- **AC-11 (Start lock concurrency)**: Start a running slot and attempt a concurrent second `run` on the same slot. Verify second process exits 1 with start-lock error.
- **AC-12 (Client probing)**: Test `probe` against present, absent, and version-mismatched binaries. Verify correct state rows (`OK`, `ABSENT`, `VERSION_MISMATCH`) and exit codes.
- **AC-13 (Standard CLI row format)**: Verify every stdout line emitted matches uppercase token pattern `^[A-Z][A-Z_]*( |$)`.
- **AC-14 (Provenance hygiene)**: Scan `.ai/bin/protocol-dispatch.cjs`. Verify 0 occurrences of `docs/research/`, 0 prompt text strings, and pointer template appears exactly once.
- **AC-15 (Client registry flag verification)**: Audit all 8 entries in `.ai/docs/clients.json`. Confirm each CLI flag matches current tool `--help` output.
- **AC-16 (Regression & protocol integrity)**: Verify `validate-protocol.ps1` passes (0 errors). Verify full test suite passes with only expected manifest mismatch prior to operator W1 gate.
