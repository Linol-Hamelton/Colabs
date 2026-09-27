# Worklog: gemini-d7d44e9eac34702c

Session journal. Owned by this session. No other session writes here.

Newest entry first. Limit 150 lines.

---

## 2026-09-27 - ROADMAP-1 wave 2A: Items 4, 5, 6 completed & report written

Agent: gemini (gemini-d7d44e9eac34702c; model `gemini-3.8-flash-high`; effort high; client agy)

Action: Executed ROADMAP-1 wave 2A remaining items on branch `kernel-batch-1`:
- Item 4: Root cause found for `docs/ops/RUNS.jsonl` (empty file due to prior clean-up and missing `runsFile` support in `protocol-dispatch.cjs`). Added `runsFile` top-key and resolution logic, null-safe exit/session codes on early failures, restored 2 real run records to `docs/ops/RUNS.jsonl`, and added failing test `T30` first in `tests/dispatch.test.cjs`.
- Item 5 (S-7): Throttled scenario execution in `docs/research/2026-09-25-improvement-research/prompts/launch-test.cjs` using a bounded worker pool (`CONCURRENCY = 4`) to prevent WMI query timeouts while preserving scenario semantics.
- Item 6 (S-10): Updated `vibe` profile in `.ai/docs/clients.json` with note "never edit an entry after record; add a new entry" and refreshed `resume.note`.
- Execution Report: Documented all wave 2A tasks, tests, root cause, and invariants in `docs/research/2026-09-27-roadmap-queue/W2A-EXECUTION.md`.

Result: All 28 tests in `tests/dispatch.test.cjs` pass (including W0 and T30); `launch-test.cjs --pure` passes (53/53 assertions); `resolver.test.cjs` (7/7 pass); `protocol-runrecord.cjs validate` passes (2 valid records). Changes staged for operator commit.

Next step: Operator runs `test-protocol.ps1` on idle workstation and commits staged checkpoints.

Open: None for wave 2A.

Evidence:
- anchor: ed458ae619caae0c3ad63a576b369b9b8fa633c0, uncommitted changes present
- digest: sha256:9854cfd6c8d257d44d4939246feb25f142a42fb97829196c6a0e0da22e41afa0 over 748 tracked and untracked files
- digest format: 4
- recorded: 2026-09-27T20:47:52.171Z by gemini-d7d44e9eac34702c
- entry hash format: 2
- entry: sha256:42070429db5032a4be715f80572cbbb00fac5ce465017131940a85509f5aab33 of this entry without this block
- parent-entry: sha256:bd3c2a30e0f38cdd8f87e4a53d31929300d8906f1453a34aff3e74ed16467d56
- scope: validator only; the regression suite was NOT run; host-project tests run separately
- validate-protocol.ps1: exit 0 in 6s
- reproduce: node .ai/bin/protocol-handoff.cjs verify

---


## 2026-09-27 - ROADMAP-1 wave 2A: W0, W5, W1-retire completed

Agent: gemini (gemini-d7d44e9eac34702c; model `gemini-3.8-flash-high`; effort high; usage not exposed by the client; client agy)

Action: Executed ROADMAP-1 wave 2A items W0, W5, and W1-retire on branch `kernel-batch-1`:
- W0 (`fbff763`): failing tests first in `tests/dispatch.test.cjs`, updated codex usage parser in `.ai/bin/protocol-dispatch.cjs` and `.ai/bin/protocol-runrecord.cjs` to handle colons, grouping spaces, NBSP, commas, dots, and K/M suffixes, preserved raw usage line in attempt record per `docs/specs/run-record.schema.md`.
- W5 (`61c7159`): hermetic dispatch test execution using temp root without tracked tree leaks; byte-identical re-homing of 40 fixture files (`prompts/DISPATCH.json` and `prompts/run/*`) into `tests/fixtures/prompts/`; byte-restored `DISPATCH.json`; archived leftover `docs/research/2026-09-26-ownerideas-revision/` with new INDEX mapping in `docs/research/archive/INDEX.md`; updated test paths in `tests/dispatch.test.cjs` and fake client.
- W1-retire (`cf99cdf`): marked `docs/research/2026-09-25-validator-migration-council/tools/run-chain.cjs` retired with pointer to `protocol-dispatch.cjs`.

Result: All 27 tests in `tests/dispatch.test.cjs` pass hermetically; working tree clean; commits `fbff763`, `61c7159`, `cf99cdf` in place on `kernel-batch-1`.

Next step: Execute Item 4 (`RUNS.jsonl` investigation, failing test, fix), Item 5 (S-7 throttling in `launch-test.cjs`), Item 6 (S-10 vibe client profile note in `.ai/docs/clients.json`), and produce `W2A-EXECUTION.md`.

Open: Item 4, Item 5, and Item 6 remaining for wave 2A.

Evidence:
- anchor: ed458ae619caae0c3ad63a576b369b9b8fa633c0, uncommitted changes present
- digest: sha256:0098d88fe2a90b50743a2ac6115f5ccdce14aa572908c8fe225eecfaeec9285c over 747 tracked and untracked files
- digest format: 4
- recorded: 2026-09-27T20:14:20.403Z by gemini-d7d44e9eac34702c
- entry hash format: 2
- entry: sha256:bd3c2a30e0f38cdd8f87e4a53d31929300d8906f1453a34aff3e74ed16467d56 of this entry without this block
- parent-entry: root
- scope: validator only; the regression suite was NOT run; host-project tests run separately
- validate-protocol.ps1: exit 0 in 8s
- reproduce: node .ai/bin/protocol-handoff.cjs verify
