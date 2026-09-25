Baseline-SHA: a4e6aef86440bc0e8da8f06c8f1d3f65af254367
Model: Gemini 3.1 Pro (High)
Model-maker: Google
Client: agy
Effort: High
Task-frame / scope-id: task:vmc-r1-c
UTC-date: 2026-09-25
Mode: ADVISORY

## Is migration now actually necessary?
[OPEN QUESTION] Is a rewrite genuinely required now?
[FACT] M-11 states `tests/validator.test.cjs` takes 283s (91% of suite wall time) sequentially on the real validator.
[INFERENCE] This test file creates a massive bottleneck. Splitting this file across multiple workers (which M-04 shows are available) would collapse the critical path without any validator code changes. Therefore, full migration now is not strictly necessary to solve the most pressing performance pain point.

## Can 80-90% of the benefit be obtained more simply?
[HYPOTHESIS] 80-90% of the wall time benefit can be achieved by:
1. **Test splitting**: Running `validator.test.cjs` in parallel across the 16 workers would slash the 283s sequentially blocked time. [FACT] The sum of per-test durations is 1,263s over 376 tests, wall time is 309s (M-09). Splitting the 283s sequential block could bring wall time under 120s.
2. **--quick**: [FACT] PROTO-DEC-0071 limits research tasks to `record --quick`, which runs only the validator (~3s per M-01) and bypasses the suite entirely. [INFERENCE] This already drastically reduces iteration delay for most agent work.

## What could the new validator silently stop checking?
[HYPOTHESIS] A Node validator could silently drop Windows-specific or OS-level file system validation (e.g., Windows path capitalization, `\` / `/` normalization, or specific symlink/reparse behavior) because Node abstracts FS idiosyncrasies differently than PowerShell.
[FACT] `validate-protocol.ps1:243` explicitly uses PowerShell's own parser to check PowerShell syntax. [INFERENCE] A Node replacement might mock or skip this check.

## Where can differential parity give false confidence?
[HYPOTHESIS] Differential parity gives false confidence because both engines might run in the same test environment (e.g., same OS/filesystem), masking cross-platform bugs. Parity normalized against expected output strips away differences that actually reveal underlying OS integration defects (e.g. carriage returns, path separators).

## What does cloud compatibility accidentally weaken?
[INFERENCE] Running the validator in a cloud environment where PowerShell is absent weakens the strict PowerShell syntax checks (`validate-protocol.ps1:243`). [FACT] PROPOSAL section 3 item 3 notes this check would report `WARN` instead of failing. [HYPOTHESIS] A cloud agent could introduce invalid `.ps1` code that passes the cloud validator with a `WARN` but silently breaks the protocol for Windows users.

## What is over-engineered?
[INFERENCE] A complete Node rewrite is over-engineered if the primary pain point is test suite latency. Writing a completely new validator just to bypass subprocess spawning in tests is over-engineering when the tests themselves could simply be parallelized to hide the spawning cost.

## What should NOT be changed?
[FACT] `validate-protocol.ps1:243` PowerShell syntax check relies on the native parser. [INFERENCE] This must remain a PowerShell subprocess; rewriting this logic in Node would be highly brittle and error-prone. [FACT] Per DEC-0001, `.ps1` files must stay ASCII-only.

## What common-mode failure affects both old and new tests?
[INFERENCE] Both engines rely on Node's test runner and `spawnSync` for validation orchestration.
[FACT] The `spawnSync` timeout is 120s (`tests/helpers.cjs:10-15`).
[HYPOTHESIS] High CPU load (M-15: 100% saturation) could cause both the old and new engines' tests to sporadically fail from timeout exhaustion rather than logic flaws. This is a failure common to both test suites under load.
