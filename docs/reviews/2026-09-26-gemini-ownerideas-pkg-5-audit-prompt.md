# Unified Adversarial Audit Prompt for PKG-5 SIGNALS

Mode: ADVISORY (audit prompt for stage-12 independent certifiers)
Baseline: 1fd27ce093155f9fbeee15d97f2be7bbab6e574f; working tree: dirty (W3 repair candidate)
Author: Gemini 3.8 Flash (route agy, effort high), 2026-09-26
Scope: PKG-5 SIGNALS - .ai/SIGNALS.md, .ai/bin/protocol-signals.cjs, docs/specs/signals-ledger.md, tests/signals.test.cjs, P-L3-005, CLI-AGENTS.md, clients.json, protocol-manifest.json, dispatcher fall hook
Target certifiers: Kimi K2.7 Code HighSpeed and MiMo-V2.6-Flash (PROTO-DEC-0086 item 1)

## Summary

PKG-5 implements the operational signals ledger per PROTO-DEC-0051 (items 2-5) and PROTO-DEC-0085 (items 2-4), procedure P-L3-005 (client model and effort mapping), Section 10 of CLI-AGENTS.md, dispatcher fall hook (S6), negative fixtures, manifest entries, and integration tests.

## Adversarial Audit Probes (AC-1 through AC-15)

Certifiers must hunt for grammar escapes, race conditions, silent pass-throughs, data corruption, and manifest omissions:

- **AC-1 (Golden ledger & header byte tamper)**: Validate `tests/fixtures/signals/golden.md` using `protocol-signals.cjs check`. Mutate line 1 `# Signals ledger` to `# Xignals ledger` or omit line 4 blank line; verify `check` immediately fails with exit code 2 and identifies the exact line.
- **AC-2 (Negative fixtures & silent pass-through prevention)**: Run `check` against each negative fixture in `tests/fixtures/signals/`: `bad-cost.md`, `bad-date.md` (e.g. 2026-02-30), `bad-disposition.md`, `dotdot-path.md`, `extra-field.md`, `immutable-field.md`, `missing-field.md`, `unknown-type.md`, `wrong-separator.md`. Verify each reports an error with its exact line number and does not silently pass through (PROTO-DEC-0047 item 8).
- **AC-3 (Sequential ID allocation & update append)**: Call `add` sequentially on a clean ledger; verify IDs follow `sig-<date>-001`, `sig-<date>-002`. Call `update` on an existing ID; verify it appends an update record, updates the state in `list`, and attempting to update a non-existent ID exits 1.
- **AC-4 (Parallel concurrency stress)**: Spawn two processes concurrently each adding 50 signals to the same ledger. Verify the final ledger contains exactly 100 valid lines with 100 distinct sequential IDs without collision or race corruption.
- **AC-5 (Lock stale recovery & busy timeout)**: Create a stale lock file with a non-existent PID; verify `add` logs a WARN row, safely removes the lock, and proceeds. Hold a live lock with an active process; verify concurrent `add` times out and exits 1 with `ledger-busy`.
- **AC-6 (Interim journal/archive import fidelity)**: Run `import` against tracked journals and `.ai/ARCHIVE.md`. Verify observed interim formats (pipe, dash, id-prefixed) parse correctly, `type-unknown`/`date-unknown` lines are reported as SKIPPED with exit 1, subsequent `import` adds 0 (deduplication by content hash), and zero journal or archive bytes are mutated.
- **AC-7 (Plan batch escalation)**: Run `plan --batch B1 --stamp`, followed by `plan --batch B2`. Verify signals remaining open emit an `ESCALATE` row for the owner, while signals closed between runs do not escalate.
- **AC-8 (Count, export, and list coherence)**: Execute `count`, `export --json`, and `list` on a known ledger. Verify total, open, closed counts and field values agree exactly across all formats.
- **AC-9 (Structured CLI output format)**: Verify every stdout line emitted by `protocol-signals.cjs` (except `export --json`) matches `^[A-Z][A-Z_]*( |$)`.
- **AC-10 (Dispatcher fall hook integration)**: In `tests/dispatch.test.cjs` (T26), run a STALL fake client exhausting its wake limit; verify exactly one `fall` signal is recorded pointing to `docs/ops/RUNS.jsonl#<runId>`. Verify a fake client without `resume.command` records both `fall` and `procedure-gap`. Verify a ledger error does not corrupt the run record.
- **AC-11 (Canonical ledger check & import count parity)**: Run `check` on `.ai/SIGNALS.md`; verify exit 0 with 0 invalid lines. Verify total signal count matches `git grep -c -E "^[[:space:]]*(-[[:space:]]+)?Signal:[[:space:]]" HEAD -- .ai/ARCHIVE.md ".ai/worklog/*.md"`.
- **AC-12 (P-L3-005 schema & text constraints)**: Audit `docs/core-arch/stage-4/P-L3-005-client-model-effort.md`. Verify front matter matches S8 verbatim, headings follow procedure schema section 3, and body contains zero occurrences of `--`, zero effort value keywords, and zero model IDs.
- **AC-13 (CLI-AGENTS.md section 10 isolation)**: Inspect `git diff HEAD -- .ai/docs/CLI-AGENTS.md`. Verify sections 1-9 are byte-identical and only section 10 is appended (<= 40 lines).
- **AC-14 (Clients registry effort note hygiene)**: Verify in `.ai/docs/clients.json` that only `effort.note` fields were modified per S8, and PKG-1 registry tests pass cleanly.
- **AC-15 (Validator & test suite green)**: Verify `validate-protocol.ps1` reports `Protocol OK` and `test-protocol.ps1` passes all test cases with 0 failures on the integrated tree.
