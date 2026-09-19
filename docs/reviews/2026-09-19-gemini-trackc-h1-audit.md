# Gemini - Track C Package and H1 Pilot Adversarial Audit

**Date**: 2026-09-19  
**Reviewed commit**: 001af5005e490423c79f7f92919e0c204cf2ad4e  
**Working tree**: dirty  
**Reviewer**: Gemini (Advanced Agentic Assistant), independent certifying auditor  
**Scope**: audit  
**Verdict**: FAIL  
**Mode**: CERTIFYING  
**Receipt-Owner**: gemini-4fdb6bf8604a4646  
**Receipt**: .ai/worklog/gemini-4fdb6bf8604a4646.md  

---

## Executive Summary

Audit verdict is **FAIL** for formal acceptance of the Track C package and preliminary pilot report as currently delivered:
1. Telemetry in `protocol-hooks.cjs` drops uncompleted Stop events, making initial failure invisible in `.ai/runtime/metrics/sessions.jsonl`.
2. The published H1 pilot report aggregates an undisclosed mixed cohort for narrow tasks and batch costs (silently including smoke and retry observations).
3. The raw trial data table `trials.jsonl` directly contradicts its underlying archived metric regarding handoff completion for task A-T9 and nullifies collected timing metrics.

Crucially, **the substantive stop-rule decision remains unconditionally justified**: under every mathematical cohort interpretation (repetition-1 only, all rows, or retry-replaced), Arm B (Repomix universal digest) drastically increases token consumption (+72.8% total on broad tasks, +60.2% to +83.9% on narrow tasks) and breaches all pre-registered efficiency thresholds. The governance directive **do not adopt MCP and do not proceed to Arm C** is fully supported. This audit authorizes no code modification or decision reopening.

---

## Scope and Evidence

- **Baseline Commit**: `001af5005e490423c79f7f92919e0c204cf2ad4e` (HEAD == origin/main).
- **Working Tree State**: `dirty` (uncommitted pilot reports, runbooks, external audit prompts, and multi-model journals).
- **Environment**: Windows 11, Node.js v22.21.0, Windows PowerShell 5.1.26100.9444, Git 2.53.0.windows.2.
- **Commands & Tests Executed**:
  - `node --test tests/hooks.test.cjs tests/session.test.cjs tests/codex.test.cjs`: **PASS** (63/63 subtests passed in 91.8s).
  - `powershell -ExecutionPolicy Bypass -File .\test-protocol.ps1`: **PASS** (250/250 tests passed in 153.2s).
  - `powershell -ExecutionPolicy Bypass -File .\validate-protocol.ps1`: **PASS** with 1 warning (`35 session journals in .ai/worklog; archive the oldest into .ai/ARCHIVE.md`).
  - `node .ai/bin/protocol-handoff.cjs gate-check`: **PASS** (`not applicable: task status is In progress`).
  - `node .ai/bin/protocol.cjs doctor`: **PASS** (Health diagnostic green; notes 16 legacy format-1 receipts and journal count limit).
  - `git worktree list`: **PASS** (Single main worktree `D:/Colabs 001af50 [main]`; all 22 pilot trial worktrees cleaned up).
  - `git branch --list`: **PASS** (Only branch `main` exists; temporary trial branches removed).

---

## Findings

| Id | Severity | Title | Location | Impact | Status |
|---|---|---|---|---|---|
| F-001 | HIGH | Stop telemetry omits unsuccessful handoffs from `sessions.jsonl` | `.ai/bin/protocol-hooks.cjs:463-481`, `:535` | Incomplete handoffs, missing baselines, and secret leaks exit before telemetry write; biases metrics | Open (Blocker) |
| F-002 | HIGH | Narrow medians and batch costs mix smoke and retry observations | `docs/reviews/2026-09-19-h1-pilot-report.md:21-24`, `trials.jsonl` | Published narrow figures use n=7 vs n=5; cost claims 9 cards but sums 11 cards | Open (Blocker) |
| F-003 | MEDIUM | Trial row 10 in `trials.jsonl` contradicts archived evidence metric | `.ai/runtime/pilot-data/trials.jsonl:10`, `evidence/a-t9-deepseek/metrics.jsonl` | Row 10 claims `handoffComplete: true` while metric recorded `false`; timing nullified | Open (Blocker) |
| F-004 | LOW | Session journal count exceeds storage limit | `.ai/worklog/` | 35 journals present vs 30 limit; causes 1 validator warning | Open (Hygiene) |

---

### F-001 - HIGH - Stop telemetry omits unsuccessful handoffs from `sessions.jsonl`

- **Location**: `.ai/bin/protocol-hooks.cjs:463-481`, `:535`
- **Confidence**: High
- **Reproduction**:
  Run a test in a fresh temporary fixture where a session modifies a file but terminates Stop without writing a complete journal entry:
  ```javascript
  const hooks = require('./.ai/bin/protocol-hooks.cjs');
  // In a clean fixture:
  // 1. SessionStart -> creates snapshot
  // 2. Modify tracked file 'test.txt'
  // 3. Invoke Stop hook
  const res = hooks.run('Stop', { cwd: root, session_id: 'test-session' }, 'agent');
  // res.systemMessage is returned ("AI protocol: 1 file(s) changed... no new complete entry")
  // Check .ai/runtime/metrics/sessions.jsonl: 0 bytes / 0 lines!
  ```
- **Impact**:
  `recordSessionMetric()` at line 535 is bypassed by early returns on:
  1. Missing baseline (`!previous`, line 463)
  2. Secret leak detected (`secretLeak`, line 471)
  3. Incomplete journal entry (`changed.length && !complete`, line 476)
  Consequently, if an agent fails its initial handoff, gets rejected, repairs the journal, and runs Stop again, only the successful second Stop is recorded. This violates the `PROTO-DEC-0035` specification ("Fail-safe machine-readable metrics: one JSONL record per Stop event") and prevents measuring the pre-registered initial handoff completion rate.
- **Recommendation**:
  Ensure a fail-safe telemetry record is recorded for *every* Stop invocation prior to early return, capturing `handoffComplete: false` and the specific failure reason.

---

### F-002 - HIGH - Narrow medians and batch costs mix smoke and retry observations

- **Location**: `docs/reviews/2026-09-19-h1-pilot-report.md:21-24`, `.ai/runtime/pilot-data/trials.jsonl`
- **Confidence**: High
- **Reproduction**:
  Independent calculation from `.ai/runtime/pilot-data/trials.jsonl`:
  1. The report's reported Arm A narrow median total tokens (493,922) and fresh tokens (44,728) only emerge when pooling all 7 records in Arm A:
     - Task 6 (rep 0, smoke batch)
     - Task 6, 7, 8, 9, 10 (rep 1)
     - Task 9 (rep 2, repeat)
  2. The pre-registered Repetition 1 design requires matching task cohorts (n=5 each).
  3. The cost calculation in the report claims: `Arm A: $0.349 (9 cards)`.
     However, the sum of the 9 available Repetition 1 cards is **$0.307026**.
     The sum of all 11 available cards (including smoke $0.023464 and retry $0.018480) is **$0.348970**.
- **Impact**:
  Reporting mixed-cohort statistics without clear labeling creates methodological ambiguity and internal inconsistencies in cost/token tables.
- **Cohort Sensitivity Table**:

  | Cohort Definition | Arm A Median | Arm B Median | Relative Delta (B vs A) |
  |---|---:|---:|---:|
  | **Broad Tasks - Total Tokens** (A n=4, B n=5) | 846,291 | 1,462,335 | **+72.79% (B worse)** |
  | **Broad Tasks - Fresh Tokens** (A n=4, B n=5) | 73,269 | 79,935 | **+9.10% (B worse)** |
  | **Narrow Tasks - Repetition 1 only** (n=5 each) Total | 566,954 | 908,268 | **+60.20% (B worse)** |
  | **Narrow Tasks - Repetition 1 only** (n=5 each) Fresh | 45,470 | 64,913 | **+42.76% (B worse)** |
  | **Narrow Tasks - Retry replacing A-T9** (n=5 each) Total | 566,954 | 908,268 | **+60.20% (B worse)** |
  | **Narrow Tasks - Retry replacing A-T9** (n=5 each) Fresh | 44,728 | 64,913 | **+45.13% (B worse)** |
  | **Narrow Tasks - All rows** (A n=7, B n=5) Total | 493,922 | 908,268 | **+83.89% (B worse)** |
  | **Narrow Tasks - All rows** (A n=7, B n=5) Fresh | 44,728 | 64,913 | **+45.13% (B worse)** |

- **Recommendation**:
  Publish an addendum/erratum to `docs/reviews/2026-09-19-h1-pilot-report.md` separating Repetition 1 matched medians from the smoke and retry trials, and correcting the card count formula.

---

### F-003 - MEDIUM - Trial row 10 in `trials.jsonl` contradicts archived evidence metric

- **Location**: `.ai/runtime/pilot-data/trials.jsonl` (line 10), `.ai/runtime/pilot-data/evidence/a-t9-deepseek/metrics.jsonl`
- **Confidence**: High
- **Reproduction**:
  Inspect Row 10 in `trials.jsonl`:
  ```json
  {"arm":"A","task":9,"rep":1,"type":"narrow","handoffComplete":true,"durationSec":null,"firstEditMs":null,"notes":"narrow FAIL: telemetry anomaly, empty journal"}
  ```
  Inspect `.ai/runtime/pilot-data/evidence/a-t9-deepseek/metrics.jsonl`:
  ```json
  {"ts":"2026-09-19T15:14:07.269Z","session":"A-9-1-deepseek","agent":"pilot-a","changedFiles":0,"durationSec":90,"firstEditMs":null,"handoffComplete":false,"gitHead":"001af5005e490423c79f7f92919e0c204cf2ad4e"}
  ```
- **Impact**:
  The row states `handoffComplete: true` despite the trial notes identifying it as a FAIL with an empty journal, and despite the raw metric file recording `handoffComplete: false`. Furthermore, all 22 rows in `trials.jsonl` have `durationSec: null` and `firstEditMs: null`, throwing away the collected wall-clock durations (e.g. 90s, 225s, 134s, 2306s) present in the per-trial metric files.
- **Recommendation**:
  Reconcile `trials.jsonl` row 10 to reflect `handoffComplete: false` and populate the actual measured duration fields.

---

### F-004 - LOW - Session journal count exceeds storage limit

- **Location**: `.ai/worklog/`
- **Confidence**: High
- **Reproduction**:
  Running `validate-protocol.ps1` yields:
  ```text
  [WARN] 35 session journals in .ai/worklog; archive the oldest into .ai/ARCHIVE.md
  Protocol OK. 1 warning(s).
  ```
- **Impact**:
  Non-zero warning count prevents strict 0-warning protocol health assertions.
- **Recommendation**:
  Run `protocol-archive.cjs worklog` on historical journals of completed sessions to restore the journal count below the 30-file threshold.

---

## Deep Dives and Security / Policy Probes

### 1. Pre-Registration Integrity
- Commit `5b34ae0` (containing `PROTO-DEC-0035` and `docs/reviews/2026-09-19-h1-pilot-design.md`) was committed at **2026-09-19T13:33:28Z**.
- Commit `001af50` (pilot trial prompt template) was committed at **2026-09-19T14:19:25Z**.
- In the archived trial metrics (`.ai/runtime/pilot-data/evidence/*/metrics.jsonl`), the earliest recorded timestamp is **2026-09-19T14:40:55.580Z** (smoke trial `a-6-1-deepseek`), and all 23 metric records reference `gitHead: 001af5005e490423c79f7f92919e0c204cf2ad4e`.
- **Verdict**: The pre-registered thresholds and task battery indisputably preceded the experimental data generation.

### 2. Telemetry Fault & Attack Matrix
- **Spoofed / Future `startTime`**: When `startTime` is set in the future, `durationSec` safely clamps to `0` via `Math.max(0, ...)`.
- **Malformed / String `startTime`**: When `startTime` is a non-number, `durationSec` defaults safely to `0` and `firstEditMs` evaluates to `null`.
- **Frozen Clock**: When `Date.now()` is frozen, execution completes safely with `0` duration without throwing.
- **Stop Twice**: Running Stop twice in succession records `handoffComplete: false` on the second run because `current.entryHash === previous.entryHash`. This highlights that downstream consumers must evaluate session identity rather than treating raw rows as independent sessions.
- **Metrics File Rotation**: When appending to a file at or above 1 MB (`METRICS_MAX_BYTES`), rotation to `sessions.1.jsonl` executes properly on the boundary crossing.
- **Filesystem Permission / Missing Directory Denial**: Injected `EACCES` or replacing `.ai/runtime/metrics/` with a non-directory file is handled safely by the outer `try/catch` in `recordSessionMetric()`, guaranteeing that metrics write failures cannot fail agent hooks.

### 3. Policy & Governance Bypass Attacks
- **Unapproved `.mcp.json` Config**: Placing an unauthorized `.mcp.json` file in the repository root causes no failure in `validate-protocol.ps1` or `tests/context-policy.test.cjs` (as those tests only check text anchors in markdown files). This confirms the MCP policy is currently procedural/normative rather than syntactically enforced by the validator.
- **Tool State Leaks Outside `.ai/runtime/`**: Placing auxiliary files outside `.ai/runtime/` immediately mutates the working tree snapshot, invalidates `protocol-handoff.cjs state`, and causes `protocol-handoff.cjs verify --deep` to reject existing evidence as stale.
- **Decision Reopening Without Trigger**: Appending a `reopened` row in `docs/decisions/REGISTRY.md` without an authorized trigger passes basic syntax validation, confirming that trigger semantics are governed cooperatively rather than by automated AST gates.

---

## Alternatives Considered & Trade-offs

- **Alternative A: Proceed to Arm C (Repomix MCP sandboxed)**
  - *Rejected*: Arm B violated the primary pre-registered broad-task efficiency threshold (+72.8% vs required >= 25% reduction) and narrow-task threshold (+60.2% to +83.9% vs required <= +5%). Incurring additional schema tax (estimated 600-1500 tokens/turn) on an already failing digest approach would be irresponsible and contrary to `PROTO-DEC-0035`.
- **Alternative B: Accept the Pilot Report As-Is**
  - *Rejected*: Overlooking cohort mixing (smoke/retry included in narrow medians, card count mismatch) compromises scientific auditability, even though the ultimate qualitative decision is unaffected.

---

## Actionable Plan & Recommendations

1. **Telemetry Hardening**:
   Refactor `protocol-hooks.cjs` Stop hook to record telemetry before early returns on failed journal checks, accurately logging incomplete handoffs with `handoffComplete: false`.
2. **Report Addendum**:
   Publish an erratum/addendum for `docs/reviews/2026-09-19-h1-pilot-report.md` reporting the clean Repetition 1 matched medians alongside the smoke and retry trials, and clarifying the $0.307 (9 cards) vs $0.349 (11 cards) cost breakdown.
3. **Pilot Data Reconciliation**:
   Correct Row 10 in `trials.jsonl` (`handoffComplete: false`) and backfill the measured `durationSec` values from the archived trial metrics.
4. **Worklog Archiving**:
   Archive completed session journals from `.ai/worklog/` into `.ai/ARCHIVE.md` to restore the journal count below 30.
5. **Proceed with Stop Rule**:
   Formally confirm termination of the MCP investigation and proceed with the owner-directed repository cleanup / v2.0 roadmap discussion.

---

## References

- Prompt: `docs/reviews/2026-09-19-track-c-h1-external-audit-prompt.md`
- Pilot report: `docs/reviews/2026-09-19-h1-pilot-report.md`
- Decisions: `.ai/DECISIONS.md` (`PROTO-DEC-0034`, `PROTO-DEC-0035`)
- Registry: `docs/decisions/REGISTRY.md`
- Telemetry & Hooks: `.ai/bin/protocol-hooks.cjs`, `.ai/bin/protocol-session.cjs`
- Companion audit: `docs/reviews/2026-09-19-codex-trackc-h1-audit.md`
- Associated session journal: `.ai/worklog/gemini-4fdb6bf8604a4646.md`
