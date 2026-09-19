# H1 Pilot Trial Prompt - Template

**Date**: 2026-09-19  
**Baseline commit**: `b587dc1` (the stop-path fix; the last commit before the first trial)  
**Runbook**: `docs/reviews/2026-09-19-h1-pilot-runbook.md`  
**Design**: `docs/reviews/2026-09-19-h1-pilot-design.md` (verbatim task prompts in section 4)

Fill the placeholders and send the filled prompt to **one fresh session of one model per trial**: `<ARM>` (A|B|C), `<TASK_ID>` (1-10), `<REP>` (1-3), `<TRIAL_ID>` (`<arm>-<task>-<rep>`), `<WORKTREE>` (the disposable clone path for this trial), `<MODEL>` (fixed model id).

---

## Trial prompt (copy everything below the line)

---

You are a subject in the H1 context-economy pilot (a controlled experiment, not normal repository work).

**Trial**: `<TRIAL_ID>` - arm `<ARM>`, task `<TASK_ID>`, repetition `<REP>`, model `<MODEL>`.

**Work only inside** `<WORKTREE>` (a fresh clone of the repository). Never touch `D:\Colabs`. Do not commit, do not push, do not modify files outside the task scope.

1. **Start a protocol session** in the clone and keep the printed owner id:
   `node .ai/bin/protocol-session.cjs start --agent pilot-<ARM> --session <TRIAL_ID> --root <WORKTREE>`
2. **Arm instructions**:
   - **Arm A (control)**: no digest, no MCP. Explore the repository normally.
   - **Arm B (CLI digest)**: before starting the task, generate the digest and you may read it; it is advisory only and must not be auto-injected anywhere:
     `npx -y repomix@1.18.0 --include ".ai/bin/**,validate-protocol.ps1,test-protocol.ps1,tests/**" --no-git-sort-by-changes --style xml --output .ai/runtime/kernel-digest.xml`
     Use the raw digest for audits and code work; never use `--compress` output for audit or implementation decisions.
   - **Arm C (MCP)**: as Arm B, and, only if your client supports MCP, start the single sandboxed server `npx -y repomix@1.18.0 --mcp --sandbox <WORKTREE>`; exactly one server, no other MCP.
3. **Task** (verbatim):
   > `<TASK PROMPT>`
4. **Finish the session**:
   `node .ai/bin/protocol-session.cjs stop --agent pilot-<ARM> --session <TRIAL_ID> --root <WORKTREE>`
5. **Report back in your final message** (short, machine-readable):
   - `TRIAL_ID`
   - task outcome (done / blocked) and, for narrow tasks, the test command and exit code
   - the list of files you read (paths; or an explicit count if the transcript is long)
   - whether you used the digest and/or MCP (arm B/C)
   - any token usage your client or harness can display (input/output), plus the model id
   - anything unusual that could bias the measurement

---

## Dispatcher notes

- One fresh session per trial; never reuse a session across tasks or arms. Sessions run in that trial's clone and are deleted after the data copy.
- Subjects: at least three distinct fixed models across the pilot; the same model set for every arm.
- Controller (DeepSeek) collects `trials.jsonl`, copies each clone's `.ai/runtime/metrics/sessions.jsonl`, adjudicates quality and writes `docs/reviews/2026-09-19-h1-pilot-report.md`.
- Arm C runs only if Arm B passes all thresholds (`PROTO-DEC-0035`).
- Token fallback when the harness shows no usage: record request/response bytes and use `ceil(bytes/4)`, noting `token_source: "bytes4"`.

## Appendix - the ten verbatim task prompts (from the design, section 4)

**T1 (broad)**: Audit the session liveness determination logic in .ai/bin/protocol-session.cjs (isSessionAlive) and .ai/bin/protocol-hooks.cjs. Evaluate: (1) supervisor PID inheritance vs transient process PID tracking across Windows (PowerShell/CMD) and POSIX shells; (2) zombie process and PID recycling vulnerabilities; (3) behavior when hostname mismatches occur (remote worktrees/containers). Identify edge cases where a live session could be mistakenly quarantined by prune, or where a dead session permanently blocks cleanup-runtime. Propose minimal hardening fixes.

**T2 (broad)**: Perform an adversarial audit of the cooperative locking mechanism in .ai/bin/protocol-lock.cjs. Analyze: (1) race conditions during atomic lock acquisition; (2) recovery paths when an operation gate is abandoned due to SIGINT or abrupt termination; (3) stale lock resolution rules (heldForMinutes heuristic vs process liveness verification); (4) multi-agent collision handling when two CLI sessions acquire simultaneously. Render a verdict with concrete reproduction steps for any race condition discovered.

**T3 (broad)**: Audit the handoff certification and verification chain in .ai/bin/protocol-handoff.cjs. Evaluate: (1) transition and backward compatibility between entry format 1 and authenticated entry format 2; (2) canonical entry body normalization and resilience against whitespace/BOM manipulation; (3) git tree SHA computation fidelity across platforms; (4) effectiveness and leak risks of secret pattern redaction during record and rehash. Verify that an entry cannot be modified after certification without breaking verify --deep.

**T4 (broad)**: Audit the journal lifecycle, 150-line limit enforcement, and automatic archiving in .ai/bin/protocol-archive.cjs and .ai/bin/protocol-hooks.cjs. Analyze: (1) auto-archive invocation triggers during stop and record; (2) atomic transfer of oldest entries into .ai/ARCHIVE.md without data corruption; (3) preservation of the latest entry baseline across SessionStart compact and resume events; (4) multi-session journal count limits (30-file cap). Determine if any scenario allows silent loss of historical journal entries.

**T5 (broad)**: Audit cross-assistant protocol hook execution parity between Claude Code, Codex CLI, and non-hook CLI assistants (Qwen, DeepSeek, GLM, Mistral). Verify: (1) session identity isolation and nonce generation across independent assistants running in the same checkout; (2) worktree awareness and project root resolution when commands are executed from subdirectories; (3) behavior under identity-less CI environments; (4) consistency of Stop telemetry across all execution vectors.

**T6 (narrow)**: In .ai/bin/protocol-lock.cjs, declare and export a named constant LOCK_ACQUIRE_TIMEOUT_MS = 5000 representing the default lock acquisition timeout. Add a unit test in tests/lock.test.cjs verifying that the constant is exported, is an integer, and equals 5000. Run the test to ensure it passes. Do not modify any other file or change lock acquisition logic.

**T7 (narrow)**: In .ai/bin/protocol-archive.cjs, extract the worklog entry counting logic into a reusable function countWorklogEntries(text). The function should count headings matching /^## \d{4}-\d{2}-\d{2}/m and return a non-negative integer. Export this function. Add a unit test in tests/archive.test.cjs verifying its behavior with 0, 1, and 3 entries. Ensure existing tests remain green.

**T8 (narrow)**: In .ai/bin/protocol-hooks.cjs, inspect the computation of durationSec in run('Stop'). Add an explicit defensive guard ensuring that if system clock drift or NTP adjustments produce a negative elapsed time, durationSec evaluates to 0. Add a unit test in tests/hooks.test.cjs simulating a future startTime and verifying durationSec === 0. Keep all existing hook tests green.

**T9 (narrow)**: In .ai/bin/protocol-session.cjs, update the whoami command handler to include the current machine hostname in the printed JSON object under the key 'hostname' (using os.hostname()). Update tests/session.test.cjs to assert that whoami output includes 'hostname' matching os.hostname(). Ensure all other whoami fields remain intact.

**T10 (narrow)**: In tests/helpers.cjs, update seedProtocol() so that when reading paths from protocol-manifest.json, any path string is normalized to strip accidental trailing forward slashes or backslashes before checking existence. Add a unit test in tests/manifest.test.cjs verifying that trailing slash paths in manifest mocks are safely normalized.
