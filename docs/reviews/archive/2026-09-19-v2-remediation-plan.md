# v2 Remediation Plan (Consolidated After the Council Round) - Proposal

**Date**: 2026-09-19  
**Author**: DeepSeek (deepseek-flash), controller  
**Status**: proposal for owner approval; supersedes the ad-hoc remediation list in chat.  
**Inputs**: `2026-09-19-h1-pilot-postmortem-and-repomix-paths.md`, the correction addendum, `2026-09-19-remediation-council-prompt.md`, and the council answers from Qoder, CodeGeeX and Gemini (`2026-09-19-gemini-remediation-advice.md`).

## 0. State of play

- v1.9.5 released; Track C delivered M0/C2/C1; C1a fixed the F-001 telemetry gap (audited PASS, committed `d38d2f2`, CI expected green).
- The pilot's negative result stands under every cohort interpretation; external audits Codex and Gemini confirmed the stop rule; their package-acceptance findings F-002/F-003/F-004 are fixed, F-001 is fixed by C1a.
- Audit closure pending: Qoder downgrade (owner decision, all three council members agree), Codex stale receipt (re-record at the freeze), final ordered record pass.
- The council converged on: **B2 first** ("index, not context"), local subjects via Ollama, metric redesign (fresh tokens, tokens per finding), and several process/risk additions.

## 1. Step 1 - local and free subject stack

| Item | Decision | Command / note |
|---|---|---|
| Local agentic subject | Pull `carstenuhlig/omnicoder-2-9b` (Qwen3.5-9B, stable tool-calling; ~5.5-6 GB at Q4, fits 8 GB VRAM) | `ollama pull carstenuhlig/omnicoder-2-9b` |
| Second local subject | `qwen3:8b` (tool-calling baseline) | `ollama pull qwen3:8b` |
| Optional | `glm4:9b`; GLM-5.3-flash GGUF is **gated (401)** and likely exceeds VRAM - skip unless the owner supplies the file (the committed root `Modelfile` references `./glm-5.3-flash-Q4_K_M.gguf`, which is absent; move the Modelfile out of the repository or gitignore it) | owner choice |
| Integration | `@qwen-code/qwen-code@0.24.1` with the Ollama provider (no account needed in local mode); fallback `codex exec --oss --local-provider ollama`; raw `/api/chat` runner for exact `prompt_eval_count`/`eval_count` | `npm install -g @qwen-code/qwen-code` |
| Remote free subject | `agy` (Antigravity, Gemini) inside the Gemini-exception quota; print-mode workflow caveat documented | existing |

## 2. Step 2 - data pipeline (kills F-002/F-003 recurrence)

Create `.ai/runtime/pilot-data/build-trials.cjs` (runtime-only) that:

1. enumerates evidence directories and reads the **first** metrics row per trial;
2. joins a cost card per trial (mandatory; a missing card fails the build, not the report);
3. enforces **bijective coverage** (one evidence dir <-> one card <-> one row);
4. filters cohorts strictly by `rep` (smoke `rep 0` and retry `rep 2` never enter `rep 1` statistics);
5. emits `trials.jsonl` and a manifest with the source digests of evidence and cards.

Pre-registration hygiene: the threshold table and metric definitions are recorded in `docs/decisions/REGISTRY.md` with a `frozen-at` commit SHA **before** any v2 trial data exists (council: prevents HARKing). The v2 report must be reproducible by an automated verifier that rebuilds every published table cell from the raw artifacts.

## 3. Step 3 - pilot v2 arms (pre-registered)

| Arm | Pattern | Hypothesis |
|---|---|---|
| A | control | baseline |
| **B2** | digest on disk; only `rg`/`Select-String` over it plus targeted slice reads (fixed line budget); whole-file read forbidden | removes the 88k read; retrieval is tens-hundreds of tokens |
| B3 | per-task scoped pack (3-6 relevant files) | 5-15k digest substitutes exploration |
| B4 | compressed map (~4k, lossy) + raw reads of at most N files | cheap orientation, precise detail |
| C2 | Repomix MCP `--sandbox` with `grep_repomix_output`/`read_repomix_output` (MCP clients only) | digest never enters context whole; schema <= 1500 |

Order: B2 -> B3 -> B4 -> C2 (council consensus). Thresholds: unchanged from `PROTO-DEC-0035` (>= 25% median broad total-token reduction, <= +5% narrow regression, handoff completeness not below control), plus new secondary metrics: **tokens per accepted finding**, **tool-call success rate**, and fresh-token view reported alongside total. Subjects: `omnicoder-2-9b`, `qwen3:8b` (narrow + broad), `agy` Gemini for cross-model breadth; paid subjects prohibited for tests by the owner policy. Adversarial tests before the audit round: (1) threshold-tampering detection (post-hoc file edit rejected by the pipeline), (2) placebo arm with a dummy index (if it shows "gains", the protocol/prompt is steering the result).

## 4. Step 4 - telemetry hardening (small, after v2 runs)

Council additions to consider as one item: monotonic timestamps, atomic rotation, per-tool-call counters, and detection of process-kill gaps (an out-of-band supervisor is out of scope). None blocks v2.

## 5. Step 5 - audit closure

1. Qoder's Track C report: **downgrade to advisory** in the round record (its own advice agrees); TASK note updated.
2. Codex receipt: re-record at the freeze (quota permitting; otherwise cite as advisory anchored to `001af50` with the mismatch acknowledged).
3. Final ordered record pass: Gemini -> DeepSeek -> Codex (if available); then standalone validator with the gate active when the next task completes.

## 6. Step 6 - repository cleanup vs v2.0

- Do **ref-surface cleanup now**: delete stale/experimental branches and tags (owner-approved list), prune worktrees (`discovered-block` was found and removed), purge `.ai/runtime/pruned` quarantines, keep `.ai/runtime/pilot-data` evidence until the v2 report is certified, and resolve the stray root `Modelfile`.
- Preserve absolutely: `.ai/DECISIONS.md`, `docs/decisions/REGISTRY.md`, all certifying reviews under `docs/reviews/`, and the `.ai/ARCHIVE.md` chain.
- v2.0 history freeze: only as an owner decision after v2 closes; criteria: (a) receipts cited by then-current decisions must be re-recordable in the new line, (b) `DECISIONS.md`/`REGISTRY.md` carry over unchanged, (c) the v1.x repository remains as the archive. Do not delete history.

## 7. Owner decisions requested

| # | Decision | Recommendation |
|---|---|---|
| R1 | Local pulls: `omnicoder-2-9b` + `qwen3:8b` (and optionally `glm4:9b`) | approve |
| R2 | Install `qwen-code` (npm) for local-provider agent runs | approve |
| R3 | GLM GGUF: gated/too large - skip unless the owner supplies the file | skip |
| R4 | Root `Modelfile`: move out of the repo or gitignore | move out |
| R5 | Pilot v2 arms and thresholds as pre-registered (B2..C2, DEC-0035 thresholds + new secondary metrics) | approve |
| R6 | Qoder downgrade to advisory | approve |
| R7 | Cleanup scope (branches/tags list) and v2.0 timing | ref-surface now, v2.0 later |

## 8. Council risk register additions

| Risk | Mitigation |
|---|---|
| Concurrent writer during the freeze | freeze checklist: no active sessions; verify `git status` unchanged across the record pass |
| Environment drift (Node/PowerShell/model versions) | pin versions in the pre-registration; record them in the report |
| Dangling locks / OS sleep corrupting timings | pre-run process/lock sweep; note power state in the report |
| Model deprecation mid-pilot | pin model versions; a deprecated subject aborts its arm only |
| Evaluator drift (silent provider-side changes) | multiple model families; report provider versions and dates |
| Protocol ossification | keep gates proportional: v2 additions are advisory-only unless evidence demands otherwise |
