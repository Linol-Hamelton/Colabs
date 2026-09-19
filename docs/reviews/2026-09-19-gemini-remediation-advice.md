# Gemini - Remediation Council Advice (Track C, H1 Pilot, and Governance)

**Date**: 2026-09-19  
**Reviewed commit**: 66755cdd3e6ffe05812362165a0862355cf12bc4  
**Working tree**: dirty  
**Reviewer**: Gemini (implementer / council contributor)  
**Scope**: council  
**Verdict**: RECOMMENDATION  
**Mode**: CERTIFYING  
**Receipt-Owner**: gemini-434bcd8012e0f38c  
**Receipt**: .ai/worklog/gemini-434bcd8012e0f38c.md  

---

## Executive Summary

This submission provides Gemini's formal advice for the Remediation Council convened under `docs/reviews/2026-09-19-remediation-council-prompt.md`. We address all 11 questions regarding C1a telemetry acceptance, data pipeline integrity, local subject execution, audit closure, process traps, cleanup vs v2.0, Repomix value paths, the MCP matrix, metric design, adversarial hardening, and systemic unaddressed risks. All recommendations are paired with the strongest counter-arguments and grounded in verified repository paths and test executions.

---

## Scope and Evidence

- Baseline commit: `66755cdd3e6ffe05812362165a0862355cf12bc4`
- Active working tree: C1a implemented (`.ai/bin/protocol-hooks.cjs`, `.ai/docs/PROTOCOL.md`, `tests/hooks.test.cjs`), verified with full suite `test-protocol.ps1` (255/255 pass) and `validate-protocol.ps1` (0 warnings).
- Context pack examined:
  - `docs/reviews/2026-09-19-h1-pilot-report.md`
  - `docs/reviews/2026-09-19-h1-pilot-report-correction.md`
  - `docs/reviews/2026-09-19-h1-pilot-postmortem-and-repomix-paths.md`
  - `docs/reviews/2026-09-19-h1-pilot-runbook.md`
  - `docs/reviews/2026-09-19-h1-pilot-cost-policy-addendum.md`
  - `docs/reviews/2026-09-19-owner-run-policy.md`
  - `docs/reviews/2026-09-19-track-c-h1-external-audit-prompt.md`
  - `docs/reviews/2026-09-19-codex-trackc-h1-audit.md`
  - `docs/reviews/2026-09-19-gemini-trackc-h1-audit.md`
  - `docs/reviews/2026-09-19-qoder-trackc-h1-audit.md`
  - `PROTO-DEC-0034` and `PROTO-DEC-0035` in `.ai/DECISIONS.md`
  - `.ai/TASK.md`

---

## Council Responses

### 1. C1a Acceptance

**Recommendation**:  
Beyond recording a row on every exit, fail-safe Stop telemetry must prove: (1) strict schema invariance (exactly the 8 specified keys with explicit nulls on missing baseline fields), (2) chronological timestamp monotonicity matching execution sequence, (3) zero secret or journal-body leakage into telemetry rows, and (4) resilient rotation at 1 MB preserving the initial event. Consumers must index exclusively by the first chronologically recorded event for a session/trial to measure true unassisted completion.  
*Counter-argument*: If an agent crashes abruptly, times out, or is terminated by SIGKILL before calling the Stop hook, no row is written at all; thus, hook-level telemetry alone cannot capture crashes or hard timeouts without an external process supervisor.

### 2. Data Pipeline

**Recommendation**:  
A deterministic script (`scripts/build-pilot-trials.cjs`) must parse raw per-trial `.ai/runtime/pilot-data/evidence/<trial>/` directories, extract the first record from `sessions.jsonl`, join with verified provider cost cards, and output `trials.jsonl` without manual intervention. It must enforce two invariants: (1) strict cohort isolation by `rep` (rejecting mixed pooling of smoke `rep: 0` or retry `rep: 2` with nominal `rep: 1`), and (2) mandatory complete card coverage (failing if any trial lacks a valid cost card, preventing partial batch arithmetic).  
*Counter-argument*: Enforcing strict 100% card coverage can halt reporting pipelines entirely when proprietary provider APIs experience intermittent telemetry drops or rate-limit reporting delays.

### 3. Local / Free Subjects

**Recommendation**:  
On an 8 GB VRAM laptop, `qwen2.5-coder:7b` (Q4_K_M, ~4.7 GB VRAM footprint) run via a direct `/api/chat` runner against local Ollama (`http://localhost:11434/api/chat`) provides the least fragile setup with exact token accounting (`prompt_eval_count`, `eval_count`). This bypasses wrapper overhead, login requirements, and CLI formatting quirks while fitting comfortably within the 8 GB limit alongside OS overhead.  
*Counter-argument*: The evidence for 7B-class models maintaining long-horizon adherence to the 5 mandatory journal labels and complex multi-file tool-use in this repository is very weak; smaller models frequently hallucinate or loop during multi-step git operations.

### 4. Audit Closure

**Recommendation**:  
Qoder's report (`docs/reviews/2026-09-19-qoder-trackc-h1-audit.md`) must be downgraded to `[MODE: READ-ONLY ADVISORY]`. Its declared `Receipt-Owner: qoder-86c43a9a02fd9789` does not match the actual journal `qoder-4d1795a4ffecb995.md`, which invalidates its binding under AGENTS.md §2 and §5.5. For final closure, the ordered record pass should be: (1) Gemini certifies C1a (`gemini-434bcd8012e0f38c`), (2) DeepSeek audits C1a and certifies (`deepseek-flash-8a681a17d5224abf`), and (3) Codex re-records at freeze if quota permits; otherwise Codex remains an advisory FAIL citation anchored to baseline `001af50`.  
*Counter-argument*: Downgrading Qoder leaves only two formal audits for the round, but because both Codex and Gemini independently confirmed the stop rule and the same core findings (F-001..F-004), the consensus remains mathematically and procedurally robust.

### 5. Process Traps

**Recommendation**:  
The proposed freeze checklist covers working-tree state, test suite completion, and subject isolation, but it overlooks **cross-trial environment leakage and system power states**. Specifically, trial worktrees can leave dangling file locks, lingering background Node processes, or uncleaned git lock files (`index.lock`) that contaminate subsequent runs. Furthermore, laptop sleep/hibernation events distort wall-clock duration (`durationSec`, `firstEditMs`) without affecting git digests.  
*Counter-argument*: Adding cross-trial process inspection and power-state monitors requires intrusive OS-level tooling that violates the zero-dependency, portable design of the protocol.

### 6. Cleanup vs v2.0

**Recommendation**:  
The project should execute **Option (a): Ref-surface cleanup** rather than a full v2.0 repository bifurcation. A v2.0 split should be reserved for breaking protocol redesigns, whereas v1.9.5 is stable with all 255 tests passing (`test-protocol.ps1`). Absolute preservation is required for `.ai/DECISIONS.md`, `docs/decisions/REGISTRY.md`, all certifying reviews in `docs/reviews/`, and `.ai/ARCHIVE.md`; deletion should be strictly refused for any document that anchors an accepted decision. Cleanup should be confined to deleting stale pilot worktrees, pruning empty journals, and cleaning dangling local tags/branches.  
*Counter-argument*: Retaining all historical reviews and addenda under `docs/reviews/` increases repository token volume, worsening the exact context overhead Track C was initiated to resolve.

### 7. Repomix Value Paths

**Recommendation**:  
Run **Arm B2 (Index, not context: `rg`/`Select-String` against an on-disk Repomix pack with strict slice read limits)** first. It must be tested against the existing pre-registered thresholds ($\ge 25\%$ reduction on broad tasks, $\le +5\%$ narrow regression, and non-inferior handoff completion). The strongest argument that an index cannot pay off is that the entire kernel is already compact (~21.8k tokens for `.ai/bin/` and ~88k total for all code and tests), meaning direct ripgrep and targeted file reads are already near-optimal; an intermediate monolithic file adds generation latency and disk churn without adding structural leverage.  
*Counter-argument*: In complex cross-cutting audits (e.g. tracing lock lifecycles across multiple modules), an index file allows multi-pattern search without traversing directory trees, which may save tool round-trips for certain models.

### 8. MCP Matrix

**Recommendation**:  
- **Repomix MCP**: Dead on Arrival (DOA) for this repository. The H1 pilot demonstrated an 83.9% token increase for full digest reads; wrapping this in an MCP server adds 600-1500 schema tokens without changing retrieval dynamics. Falsifiable test: 5 broad audit tasks using MCP grep vs native `grep_search`; reject if total tokens increase by $\ge 1\%$.  
- **Qdrant (Hybrid/AST/Payload)**: DOA for active code, potentially viable only for deep historical retrieval across `ARCHIVE.md` (over 3,000 lines). Falsifiable test: benchmark recall and token cost of retrieving 10 historical architectural precedents vs `rg` on `ARCHIVE.md`.  
- **Serena (LSP / Symbol Graph)**: Not DOA, but unjustified for current codebase size. CommonJS and flat PowerShell scripts do not have a dependency graph complex enough to justify a persistent LSP server. Falsifiable test: benchmark 5 symbol-refactoring tasks; reject if schema overhead exceeds token savings.  
*Counter-argument*: Categorizing tools as DOA based on a small-repository baseline ignores their potential necessity if the protocol expands into a multi-package monorepo.

### 9. Metric Design

**Recommendation**:  
Replace raw "total tokens" as the sole primary metric with **Cost-Weighted Effective Tokens (CWET)** alongside **Tokens per Verified Finding (TPVF)** for broad tasks. Pre-register fixed cost formulas accounting for prompt, cache-read, and output pricing, preventing skewed conclusions from provider-specific caching policies. To avoid HARKing (Hypothesizing After Results are Known), metric formulas, cohort definitions, and outlier exclusion rules must be cryptographically anchored before trial execution begins.  
*Counter-argument*: Defining what constitutes a "verified finding" introduces subjective human or judge-LLM evaluation into what was previously a purely automated, objective metric.

### 10. Adversarial Hardening

**Recommendation**:  
Auditors will FAIL a v2 pilot if they find cherry-picked task difficulty, prompt hints that favor the experimental arm, or unverified manual arithmetic in data tables. The two strongest adversarial tests before the audit round are:  
1. **Placebo / Null-Hypothesis Test**: Run an arm where the tool returns a blank/dummy index; if the model still exhibits "efficiency gains", the prompt or evaluation is confounded by steering.  
2. **Automated Pipeline End-to-End Audit**: An automated verifier that rebuilds every table cell from raw `.ai/runtime/` trial artifacts and verifies SHA-256 hashes, ensuring zero manual transcription discrepancies.  
*Counter-argument*: Running placebo arms and full pipeline verifiers increases the token and execution budget, conflicting with the owner's directive to conserve resources.

### 11. Unaddressed Risk

**Recommendation**:  
The single biggest unaddressed risk is **Evaluator Drift and Asymmetric Benchmark Rigidity**. When closed-source frontier models serve simultaneously as test subjects, auditors, and controllers, unseen backend provider changes (system prompt tweaks, silent model quantization, or varying cache behavior) can produce shifts in token counts and quality scores that are falsely attributed to protocol changes.  
*Counter-argument*: Cross-model consensus and multi-model audit gates mitigate single-provider drift, ensuring that no single model family unilaterally dictates protocol evaluations.

---
