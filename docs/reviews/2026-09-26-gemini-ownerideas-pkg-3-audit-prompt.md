# Unified Adversarial Audit Prompt for PKG-3 RECOVERY

Mode: ADVISORY (audit prompt for stage-12 independent certifiers)
Baseline: 1766126b6d0bbb3e231dff80b8e4d1c0094b9ba7; working tree: dirty (W2 uncommitted candidate)
Author: Gemini 3.8 Flash (route agy, effort high, stream E1), 2026-09-26
Scope: PKG-3 RECOVERY - protocol-dispatch.cjs, model-ladder.json, wake.md, repair.md, CLI-AGENTS.md, protocol-manifest.json, tests
Target certifiers: Kimi K2.7 Code HighSpeed and MiMo-V2.6-Flash (PROTO-DEC-0086 item 1)

## Summary

PKG-3 implements Milestone M1 (Resolver v0 per PROTO-DEC-0079 item 2, PROTO-DEC-0075 item 9, workflowAI 1.5) and Milestone M2 (Supervisor recovery state machine per PROTO-DEC-0075 items 2, 3, 5, 11, launch pinning per PROTO-DEC-0075 item 7, completion contract per PROTO-DEC-0075 item 6, and run records per PROTO-DEC-0075 item 14).

## Adversarial Audit Probes (AC-1 through AC-15)

Certifiers must hunt for bypasses, state corruption, budget leaks, escalation regressions, grammar violations, and unbounded retries:

- **AC-1 (Ladder transcription integrity & staleness check)**: Audit `docs/ops/model-ladder.json` against `MODEL-ECONOMICS.md:28-40` and `MODEL-MATRIX.md:126-135`. Confirm all 11 rungs match verbatim. Test that mutating `sectionSha256` in the ladder file causes `resolve` to immediately exit 1 with `ERROR reason=ladder-stale`.
- **AC-2 (Cheaper-wins ordering & substitute sequence)**: Run resolver on `fixture-ladder.json` with floor T3 and no exclusions. Verify that the primary chosen is the largest admissible rung number (cheapest admissible rung), and that substitute routes ascend the ladder by decreasing rung number then increasing order.
- **AC-3 (Exclusion reasons coverage)**: Test individual exclusion fixtures. Verify each expected exclusion token is emitted: `route-unknown`, `context-window`, `below-floor`, `tier-unknown`, `independence`, `needs-approval`, `unavailable:<class>`. Confirm excluded rungs never appear as primary or substitutes.
- **AC-4 (Null context window preservation)**: Test a rung with `contextWindow: null`. Verify it emits an `UNVERIFIED constraint=contextMin` row, is not excluded, and remains eligible for selection.
- **AC-5 (Shortfall handling per stage kind)**: In a scenario where admissible substitutes are fewer than requested: verify `stageKind = "kernel"` or `"certification"` aborts before launching and exits 1 with `ASK_OWNER reason=shortfall`. Verify `stageKind = "other"` records `shortfall` and proceeds to launch.
- **AC-6 (Owner route bypass)**: Dispatch a slot with an explicit `route` defined. Verify the resolver is bypassed completely, emitting `selection = "owner"` in the resolution object, and primary/substitutes lists remain untouched.
- **AC-7 (Supervisor state machine & budget accounting)**: Drive supervisor through S5 failure classes using fake client modes (`transient-retry`, `crash-resume`, etc.). Verify: (a) primary receives at most 1 retry, (b) substitutes receive at most 2 attempts, (c) at most 6 fresh invocations in total, (d) TIMEOUT results in BLOCKED without session resume, (e) no seventh fresh launch occurs.
- **AC-8 (STALL recovery with pointer wakes)**: Run fake client in STALL mode. Verify supervisor executes up to 3 resume wakes carrying `{message} = "Read and follow the file .ai/docs/dispatch/wake.md"`. Verify that if stall persists after 3 wakes, the attempt is marked fallen, followed by fresh retry and substitute failover; exhausted run terminates FAILED with `fallen = true`.
- **AC-9 (INVALID_OUTPUT repair resume)**: Trigger output validation failure. Verify supervisor synthesizes `.ai/runtime/dispatch-repair-<n>.md` containing the exact bytes of `.ai/docs/dispatch/repair.md` followed by failing check rows. Verify resume is dispatched with pointer to this repair file, followed by re-validation.
- **AC-10 (Launch pinning & revision gate)**: Modify a launch file or `copyIn` source file after the first attempt. Verify supervisor blocks subsequent attempt with `BLOCKED reason=pin-changed <path>`. Verify `--revise` generates a new `runId` and re-computes pins cleanly.
- **AC-11 (Strict completion contract)**: Run a slot to process completion without emitting an `Evidence:` line in the session journal. Verify slot fails completion and does NOT transition to `DONE`. Verify `DONE` requires valid UTF-8 outputs, zero validate exit code, journal `Evidence:` row, and `supervisorDone`.
- **AC-12 (Run record schema conformance & usage reporting)**: Verify every settled step (DONE, BLOCKED, FAILED) appends a run record to `docs/ops/RUNS.jsonl` passing `validateRecord`. Verify `renderUsage` and `report` compute usage and cost summary accurately from these records.
- **AC-13 (Provenance hygiene & pointer templates)**: Verify `.ai/bin/protocol-dispatch.cjs` contains 0 instances of `docs/research/`, 0 inline prompt strings, and the pointer prefix `Read and follow the file ` appears exactly once as a constant. Verify only launch and dispatch message files are pointed to.
- **AC-14 (Integrated protocol validation & full test suite)**: Verify `validate-protocol.ps1` runs clean (Protocol OK). Verify `test-protocol.ps1` runs all 405 tests with 0 failures (`pass 405, fail 0`).
- **AC-15 (Real ladder live cross-check)**: Run `resolve` against `tests/fixtures/resolver/real-ladder.json` for `floor-t7-kernel` (exits 1 `ASK_OWNER reason=shortfall`) and `floor-t3-other` (exits 0 with Gemini 3.7 High primary, Luna XHigh and Gemini 3.8 High substitutes). Confirm output matches live client availability.
