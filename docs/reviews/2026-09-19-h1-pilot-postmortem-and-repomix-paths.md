# H1 Pilot Post-Mortem and Repomix Value Paths

**Date**: 2026-09-19  
**Author**: DeepSeek (deepseek-flash), controller  
**Status**: analysis for the owner and the council; no decisions taken here.

## 1. What the pilot actually tested

Arm B asked the model to generate the raw digest and then "you may read it". Every B session **read the whole digest** (~88k tokens) and *additionally* explored the repository, because nothing required substitution. The measured +72.8% (broad) is therefore the cost of an **additional all-files read**, not the value of an index. The correct pattern was never tested.

## 2. Confirmed setup errors (critical assessment)

1. **Read-all prompt**: the digest was offered as context instead of as a *searchable index*. No substitution rule, no budget cap.
2. **Wrong scope**: the digest packed the whole kernel plus all tests; a task-relevant subset (3-6 files) would be 5-15k tokens instead of 88k.
3. **Raw-only rule**: audits need raw text *at the suspected lines*; that does not require raw text of *everything*. Compressed orientation + targeted raw reads was never allowed.
4. **One repetition, parallel launch, flagship subject**: expensive and confounded; the cost policy now forbids this for tests.
5. **Metric dominated by cache reads**: total tokens (in + cache + out) is comparable across arms but inflates both; the fresh-only view agrees in direction, so the conclusion stands, but v2 must pre-register both and report costs per scenario.
6. **Heterogeneous subjects**: `agy` print mode produced text-only audits without tools or journals (handoff false), a different workflow from Agent Manager/codex runs; cross-subject pooling is invalid.
7. **Telemetry gap (F-001)**: failed handoffs were invisible; being fixed as C1a.
8. **Data hygiene (F-002/F-003)**: cohorts were mixed and fields lost; fixed in the correction addendum, and v2 must build rows programmatically from archived evidence with mandatory cost cards.

## 3. Repomix value paths worth testing (pilot v2 arms)

| Arm | Pattern | Expected effect | Notes |
|---|---|---|---|
| **B2 - Index, not context** | digest stays on disk; the agent may only `rg`/`Select-String` it and read targeted slices (fixed line budget); reading the whole file is forbidden | removes the 88k read; retrieval cost ~tens-hundreds of tokens per query | works for every CLI/agent without MCP |
| **B3 - Scoped pack** | per-task `--include` list (the 3-6 files the task concerns) | digest 5-15k; direct substitution for exploration | needs per-task include lists in the pre-registration |
| **B4 - Compressed orientation + targeted raw** | `--compress` map (~4k) plus raw reads of at most N files | cheap map, precise detail | compressed is lossy; never the sole source for audit claims |
| **C2 - MCP grep** (MCP clients only) | repomix MCP `--sandbox`: `pack_codebase` plus `grep_repomix_output` / `read_repomix_output` slices | the digest never enters context whole | schema cost measured; only after B2/B3/B4 show promise |

Pre-registration for v2 (before any run): same thresholds as `PROTO-DEC-0035` (>= 25% median broad total-token reduction, <= +5% narrow regression, handoff completeness not below control, schema <= 1500 for C2), plus a new secondary metric **tokens per accepted finding** to prevent "cheaper because less work" artifacts.

## 4. Local and free subjects (per the owner run policy)

- **Ollama is installed** (v0.30.7; existing model: MiniCPM-V 4.5). GPU: RTX 4060 Laptop, **8 GB VRAM**, 31.7 GB RAM. Disk free: C 144 GB, D 386 GB.
- Recommended local pulls (tool-capable, fit 8 GB at Q4): `qwen3:8b`, `glm4:9b`; optionally `qwen2.5-coder:7b`. GLM-5.3-flash GGUF: the HF repo returned 401 (likely gated) and a 5.3-tier model likely exceeds 8 GB VRAM - not the first choice.
- Integration paths: (a) `@qwen-code/qwen-code@0.24.1` (npm, Apache-2.0; supports Ollama/local providers, needs no account in local mode); (b) `codex exec --oss --local-provider ollama` (already installed); (c) a minimal API runner against `http://localhost:11434/api/chat`, whose responses carry `prompt_eval_count`/`eval_count` - exact token accounting without provider cards.
- Free remote subject: `agy` (Antigravity, Gemini) with usage in JSON; note the print-mode workflow caveat (section 2.6).

## 5. What success and failure would mean

- **Adopt** Repomix (M1) only if B2/B3/B4 beat the thresholds on broad tasks with quality parity; M2 (MCP) only if C2 adds value over B2 within the schema budget.
- **Keep as optional documentation** (the current `PROTO-DEC-0034` state) if the index patterns also fail; the digest then remains a manual tool, not a protocol mechanism.
- **Stop permanently** if the failure is attributable to the repository's shape (small kernel, prose-heavy history) rather than to the setup - then effort moves to the history/search side (Qdrant candidates) instead.
