# Remediation Mapping Round 2: Gemini Challenge (Z4 & Z2)

- Commit SHA: 4ded1bee1c2acf2392fdeededf50935f59138302
- Tree: dirty
- Model: Gemini 3.8 Flash (High)
- Client: agy (Antigravity CLI)
- UTC Date: 2026-09-24
- Zones: Z4 (qwen-z4-idle-exit.md) and Z2 (mistral-z2-budget-scope.md)
- Commands run: `git rev-parse --show-toplevel`, `node .ai/bin/protocol-session.cjs start --agent gemini`, `git status --short --branch`, `git log --oneline -10`, `Test-Path` checks on transcript and client paths.

---

## 1. Challenge of Zone Z4 (Qwen: Five-Minute Idle Exit)

### Agreement Lines and Fact Verification

- Item Z4-01 (Edit Map):
  Agreement with qwen on item Z4-01: agree with reservations.
  Justification: Creating `protocol-watchdog.cjs` is necessary, but modifying `protocol-session.cjs` and `protocol-hooks.cjs` without integrating client lifecycle hooks misses the actual execution signals.
- Items Z4-02 through Z4-07 (Observable Signals across Clients):
  Agreement with qwen on item Z4-02: categorically disagree, with reasons.
  Agreement with qwen on item Z4-03: categorically disagree, with reasons.
  Agreement with qwen on item Z4-04: categorically disagree, with reasons.
  Agreement with qwen on item Z4-05: categorically disagree, with reasons.
  Agreement with qwen on item Z4-06: categorically disagree, with reasons.
  Agreement with qwen on item Z4-07: categorically disagree, with reasons.
  Justification: The claimed signals are identical copy-paste assertions and factually false:
  1. FACT: Journal mtime (`.ai/worklog/<agent>.md`) does not update per turn; `protocol-hooks.cjs:523-525` and `AGENTS.md:143-157` verify journals update only on explicit handoff/checkpoint writes.
  2. FACT: Session state (`.ai/runtime/<agent>-<id>.json`) is written only at `SessionStart` and `Stop` (`protocol-hooks.cjs:615`, `protocol-session.cjs:96-100`); it records no tool events.
  3. FACT: For agy, the agent name is `gemini` (CLI `agy`), not `agi`. True signals are transcript growth at `transcriptPath` and hook events (`hooks.md:85-98, 144-158`).
- Item Z4-08 (Watchdog Inputs):
  Agreement with qwen on item Z4-08: partially agree.
  Justification: Target PID and timeout threshold are valid inputs, but session state and worklog files remain static during active reasoning and cannot serve as liveness indicators.
- Item Z4-09 (Actions on Stall):
  Agreement with qwen on item Z4-09: categorically disagree, with reasons.
  Justification: Host environments are Windows (`ROUND2.md:84-85`). Windows lacks POSIX SIGTERM/SIGKILL; Node `process.kill()` invokes `TerminateProcess` immediately without graceful flush. Termination must use process-tree commands (`taskkill /PID <pid> /T /F`) and follow PROTO-DEC-0047:1980 deputy escalation.
- Item Z4-10 (Exit Codes):
  Agreement with qwen on item Z4-10: disagree.
  Justification: PROTO-DEC-0049:2053 establishes that unknown inputs exit 2 (BLOCKED). A separate code 3 violates kernel conventions.
- Item Z4-11 (False Stall - Long Test Suite):
  Agreement with qwen on item Z4-11: disagree.
  Justification: Qwen claims the test suite runs in 270s and won't exceed 5 minutes. FACT: `copilot-2db59a7f7eba7f43.md:38` measured `test-protocol.ps1` at 315s (>300s). Relying on filesystem updates falsely flags running test suites as stalled.
- Item Z4-12 (False Stall - Slow Model Turn):
  Agreement with qwen on item Z4-12: agree with reservations.
  Justification: Model latency is real, but session state files do not reflect ongoing model activity; hook event triggers are required.
- Item Z4-13 (False Stall - Waiting Permission Prompt):
  Agreement with qwen on item Z4-13: categorically disagree, with reasons.
  Justification: Qwen proposes a heartbeat to keep interactive prompt waits alive. FACT: PROTO-DEC-0049:2054 and PROTO-DEC-0047:1980 define waiting on an interactive prompt for >5 minutes as an actual stall, not a false stall. Executors must run non-interactively with pre-granted permissions.
- Item Z4-14 (Solution Options and Recommendation):
  Agreement with qwen on item Z4-14: disagree.
  Justification: Option 1 fails because repository files are static during turns. Option 3 (hybrid: process-tree activity, transcript growth, hook heartbeats) is required.
- Item Z4-15 (Risk Register and Net Gain):
  Agreement with qwen on item Z4-15: agree with reservations.
  Justification: Net gain is positive, but Qwen omitted Windows process termination, test suites exceeding 300s, and out-of-repo execution risks.

### agy First-Hand Verification (Read-Only)

1. Turn progress observable signals:
   FACT: In `C:\Users\Dmitry\.gemini\antigravity-cli\builtin\skills\agy-customizations\docs\hooks.md:144-158`, hook payloads deliver `transcriptPath`. On this machine, verified live: `transcriptPath` is at `C:\Users\Dmitry\.gemini\antigravity-cli\brain\<id>\.system_generated\logs\transcript.jsonl`. It grows with each step. Hook events (`PreInvocation`, `PreToolUse`, `PostToolUse`, `PostInvocation`, `Stop`) fire sequentially (`hooks.md:85-98`).
2. Heartbeat capability in PreInvocation and PostToolUse:
   FACT: In `hooks.md:85-98, 120-130`, `PreInvocation` and `PostToolUse` execute shell commands (`type: "command"`). A hook script can write a heartbeat file (e.g., `.ai/runtime/heartbeat-<sessionId>.json`). `PreInvocation` marks model invocation start; `PostToolUse` marks tool completion.
3. Out-of-repository execution:
   FACT: In `hooks.md:126`, hooks execute with Cwd set to the directory containing `hooks.json`. In tool execution (`run_command`), tools execute with specified Cwd. A watchdog checking only repository-root mtime falsely treats out-of-repo tool runs as stalls.

### Z4 Corrections and Risk Coverage (BRIEF Form)

- Risk Z4-CR01: Watchdog kills active test suite exceeding 300s.
  Trigger: `test-protocol.ps1` runs for 315s without touching root tracking files.
  Likelihood: High. Impact: Premature abortion of valid test runs.
  Prevention: Watchdog samples process tree: active CPU consumption by child processes (`powershell.exe`, `node.exe`) resets the timer.
  Compensation: Watchdog logs child process activity before terminating.
  Cost: Low (process polling every 15s). Residual: Low.
- Risk Z4-CR02: Tool execution outside repository flagged as idle.
  Trigger: agy runs a tool outside `D:\Colabs` or updates user-profile transcript.
  Likelihood: High. Impact: False stall termination.
  Prevention: PreInvocation and PostToolUse hooks touch a heartbeat file; watchdog monitors `transcriptPath` mtime.
  Compensation: Process tree verification prevents kill if agent process is active.
  Cost: Low (~20ms per tool). Residual: Very low.
- Risk Z4-CR03: Windows process kill leaves orphaned child processes.
  Trigger: Watchdog invokes `process.kill(pid)` on Windows.
  Likelihood: High. Impact: Orphaned processes lock files.
  Prevention: Use `taskkill /PID <pid> /T /F` or Windows Job Objects to terminate tree.
  Compensation: Session cleanup routine in `protocol-session.cjs cleanup-runtime`.
  Cost: Low. Residual: None.

### Zone Z4 Closing Lists

- Points to carry into round 3:
  1. Standalone watchdog (`protocol-watchdog.cjs`) combining process tree CPU, transcript growth, and hook heartbeats.
  2. PreInvocation and PostToolUse hook handlers for lightweight heartbeat updates.
  3. Windows process-tree termination via `taskkill /PID <pid> /T /F`.
  4. Child process CPU monitoring to cover operations running >300s.
  5. Treating interactive prompt waits >5 minutes as actual stalls (PROTO-DEC-0049:2054).
- Points to drop:
  1. Monitoring worklog mtime or session state files as per-turn activity signals.
  2. POSIX signal termination (SIGTERM/SIGKILL) on Windows.
  3. Keep-alive heartbeats for interactive permission prompts.
  4. Watchdog exit code 3 (must use exit 2 for invalid input).
- Questions only the owner can answer:
  1. Should the watchdog run as an external process spawned by CLI wrappers or via background OS scheduling?
  2. Should agy's PreToolUse gate (`~/.gemini/config/protocol-gate.cjs`) host the heartbeat writer, or should it stay in `.ai/` scripts?

---

## 2. Challenge of Zone Z2 (Mistral: Budget Exhaustion & Scope)

### Agreement Lines and Fact Verification

- Item Z2-01 (Edit Map Z2-01 / Collection Scope R3-C04):
  Agreement with mistral on item Z2-01: fully agree.
  Justification: Removing the two unrecorded directories in `protocol-verdict.cjs:729-733` aligns collection with `docs/specs/2026-09-23-executable-rulebook-spec.md:134-135` (`docs/reviews/*findings*.md` plus target).
- Item Z2-02 (Edit Map Z2-02 / Immutability R3-C05):
  Agreement with mistral on item Z2-02: categorically disagree, with reasons.
  Justification: PROTO-DEC-0048:2021 explicitly records R3-C05 as an accepted exception with no third attempt. Scheduling code edits in `validate-protocol.ps1:1030-1045` violates this decision.
- Item Z2-03 (Options and Recommendation):
  Agreement with mistral on item Z2-03: partially agree.
  Justification: Option 1 is correct. Option 3 is an unauthorized third attempt on R3-C05 and must be dropped from remediation code; raw byte comparison belongs strictly in advisory audit input.
- Item Z2-04 (Budget-Exhaustion Procedure):
  Agreement with mistral on item Z2-04: partially agree.
  Justification: The procedure concept is sound, but item 4 names DeepSeek and Copilot as certifiers, contradicting PROTO-DEC-0046:1949 (DeepSeek certifies nothing) and PROTO-DEC-0047:1978 (Copilot is shadow only). Binding certifiers must follow PROTO-DEC-0047:1975 and PROTO-DEC-0041:1754.
- Item Z2-05 (Proposal Location):
  Agreement with mistral on item Z2-05: disagree.
  Justification: `.ai/ARCHIVE.md` is cold history (`AGENTS.md:20`, `ROUND2.md:63`) and must never receive proposals. Active proposals belong in `.ai/PLAN.md` (or a dedicated spec in `docs/specs/` or `docs/research/` referenced from a compacted PLAN.md).
- Item Z2-06 (Risk Register and Net Gain):
  Agreement with mistral on item Z2-06: agree with reservations.
  Justification: Net gain is positive for collection scope narrowing and budget exhaustion, but implementing Option 3 introduces severe governance violation risks.

### Analysis of checkStopRule Terminal Emission

FACT: In `protocol-verdict.cjs:675-689` and `774-776`, `checkStopRule` checks `maxAttempt >= 3` and prints the stop requirement with exit code 1.
For attempt 2 failures (budget exhaustion), `checkStopRule` can programmatically verify whether an attempt 2 finding has an unresolved disposition without an approved exception, immediately emitting exit code 1 with a terminal status message. This enforces automatic cycle closure without relying on manual agent self-discipline.

### Z2 Corrections and Risk Coverage (BRIEF Form)

- Risk Z2-CR01: Reopening exhausted root cause R3-C05 via Option 3.
  Trigger: Modifying `validate-protocol.ps1` for blank-line immutability.
  Likelihood: High if Mistral's recommendation is followed. Impact: Violation of PROTO-DEC-0048:2021.
  Prevention: Exclude Option 3 from remediation; retain raw comparison as advisory audit input only.
  Compensation: Existing validator check stands; R3-C05 remains recorded exception.
  Cost: Zero. Residual: None.
- Risk Z2-CR02: Non-independent or shadow agent assigned to verify exhaustion.
  Trigger: Assigning DeepSeek or Copilot to binding verification in budget exhaustion.
  Likelihood: Medium. Impact: Rejection under PROTO-DEC-0041:1754.
  Prevention: Dispatch prompt selects certifiers strictly per PROTO-DEC-0047:1975 availability and independence rules.
  Compensation: Verification reviews rejected if reviewer is in coordinator/shadow role.
  Cost: None. Residual: None.
- Risk Z2-CR03: Target ledger omitted when collection scope is narrowed.
  Trigger: Narrowing candidateDirs in `protocol-verdict.cjs:729-733`.
  Likelihood: Low. Impact: Target ledger ignored by `--stop-rule`.
  Prevention: `protocol-verdict.cjs:726` explicitly adds `absLedger` directly to `targetFiles` Set before scanning candidate directories.
  Compensation: Unit tests verify target ledger inclusion.
  Cost: Zero. Residual: None.

### Zone Z2 Closing Lists

- Points to carry into round 3:
  1. Narrowing `protocol-verdict.cjs:729-733` candidateDirs to `path.join(root, 'docs', 'reviews')` plus target file (Option 1).
  2. Extending `protocol-verdict.cjs --stop-rule` to programmatically exit 1 on unresolved attempt 2 findings.
  3. Framing raw byte comparison strictly as advisory audit input.
  4. Hosting budget-exhaustion proposals in `docs/research/` or `docs/specs/`, linked from `.ai/PLAN.md`.
- Points to drop:
  1. Option 3 / Item Z2-02 code edits to `validate-protocol.ps1` (forbidden by PROTO-DEC-0048:2021).
  2. Naming DeepSeek or Copilot as binding certifiers.
  3. Appending proposals to `.ai/ARCHIVE.md`.
- Questions only the owner can answer:
  1. Should `protocol-verdict.cjs` output an automated audit dispatch template upon budget exhaustion?
  2. Does the owner prefer archiving older PLAN sections to fit the budget procedure in `.ai/PLAN.md`, or keeping it in a separate spec under `docs/specs/`?
