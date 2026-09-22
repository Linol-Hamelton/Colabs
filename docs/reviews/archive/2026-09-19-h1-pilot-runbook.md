# H1 Repomix Pilot - Runbook and Data Protocol

**Date**: 2026-09-19  
**Author**: DeepSeek (deepseek-flash), controller  
**Companion**: `docs/reviews/2026-09-19-h1-pilot-design.md` (design); `PROTO-DEC-0035` (pre-registered thresholds)  
**Status**: operational runbook; no protocol changes during the pilot.

## 1. Baseline and isolation

- Baseline = the commit that includes the stop-path fix (the last commit before the first trial); record `git rev-parse HEAD` as the first row of the data file.
- Every trial runs in a **fresh disposable clone**: `git clone --depth 1 file:///D:/Colabs <temp>\h1\<arm>\<task>\<rep>`. Never execute pilot tasks in `D:\Colabs`.
- Narrow tasks (6-10) modify code only inside their clone; each repetition starts from a fresh clone so no trial inherits another's state.

## 2. Session protocol per trial

1. `node .ai/bin/protocol-session.cjs start --agent pilot --session <arm>-<task>-<rep> --root <clone>`; keep the printed owner id.
2. Execute the task prompt verbatim; the agent works only inside the clone.
3. `node .ai/bin/protocol-session.cjs stop --agent pilot --session <arm>-<task>-<rep> --root <clone>`.
4. Copy `<clone>/.ai/runtime/metrics/sessions.jsonl` to `pilot-data/metrics-<arm>-<task>-<rep>.jsonl` and append the trial row to `pilot-data/trials.jsonl`.
5. Delete the clone after the data copy (or keep the last repetition's clone for spot audits).

Data root: `D:\Colabs\.ai\runtime\pilot-data\` (git-ignored, digest-excluded) or any external folder; never inside committed paths.

## 3. Arm instructions (what the agent receives)

- **Arm A (control)**: the task prompt only; standard exploration (read/grep/git).
- **Arm B (CLI digest)**: the task prompt plus the digest path and the rule that it exists. Generate it first:
  `npx -y repomix@1.18.0 --include ".ai/bin/**,validate-protocol.ps1,test-protocol.ps1,tests/**" --no-git-sort-by-changes --style xml --output .ai/runtime/kernel-digest.xml` (raw). Orientation-only variant may add `--compress`; audits/implementation must use raw. Never auto-inject.
- **Arm C (MCP)**: Arm B plus the sandboxed server for MCP-capable clients only (`npx -y repomix@1.18.0 --mcp --sandbox <clone>`); one server, record the schema-token measurement for the report.

## 4. Metrics and trial record

Per trial, append one JSON line:

```json
{"arm":"A|B|C","task":1,"rep":1,"model":"<id>","provider":"<id>","tokens_in":0,"tokens_out":0,"token_source":"orchestrator|bytes4","files_read":0,"firstEditMs":null,"durationSec":0,"handoffComplete":true,"quality_pass":null,"notes":""}
```

- `tokens_in/out`: orchestrator-reported usage; when unavailable, set `token_source: "bytes4"` and record `ceil(total_request_response_bytes / 4)` in `tokens_in + tokens_out` with the raw byte count in `notes`.
- `files_read`: count of distinct files the agent opened (from the session transcript; approximate counts are acceptable if noted).
- `firstEditMs`/`durationSec`/`handoffComplete`: from the copied `sessions.jsonl`.
- `quality_pass`: filled by the controller per section 6.

## 5. Schedule and order

- Ten tasks, three repetitions, three arms. Pre-registered rotation, identical across arms per repetition: rep 1 = tasks 1-10; rep 2 = 6-10 then 1-5; rep 3 = 3-10 then 1-2. (This resolves the design's section 4 "identical order" vs section 8 "randomize" wording: the rotation is fixed and recorded here before any trial.)
- Fixed model IDs for all arms; if a provider changes a model mid-pilot, stop, note it, and restart that model's completed trials.

## 6. Quality rubric (binary, controller-adjudicated)

- Narrow tasks: pass = the task's own acceptance (its tests green) and no out-of-scope edits in the clone diff.
- Broad tasks: pass = the audit output names at least one genuine issue with reproduction/evidence, or cleanly refutes the stated concern with evidence; controller adjudicates against the task text.
- Verification gate applies to every trial: any suite regression in a clone fails the trial and halts the pilot.

## 7. Stop rules and reporting

- Stop rules and thresholds exactly as `PROTO-DEC-0035` (Arm B >= 25% median broad reduction; narrow regression <= +5%; schema <= 1500 tokens for Arm C; handoff rate not below Arm A; any breach = negative result, no MCP adoption).
- Report: `docs/reviews/2026-09-19-h1-pilot-report.md` with per-arm medians and IQR, the threshold table with pass/fail, raw data paths, quality outcomes, and a final recommendation. The 35%/50%/65% forecast stays an unverified hypothesis.

## 8. Roles and dry run

- Owner orchestrates sessions and model availability; the controller collects data, adjudicates quality, computes medians and writes the report; no protocol file changes during the pilot.
- Dry run (2026-09-19): the telemetry line was verified end to end in a clone. The dry run exposed a stop-path circular dependency that silently disabled CLI auto-archive; it is fixed before the pilot per `docs/reviews/2026-09-19-gemini-stop-cycle-fix-prompt.md`.
