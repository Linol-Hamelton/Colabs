# Codex - MCP Stack Council Round 1 Preflight and Prompt

**Date**: 2026-09-20  
**Reviewed commit**: `d38d2f2ae4b4c17fe6c2c18f11215cedb2f10eb1`  
**Working tree**: dirty (shared recovery package; no MCP implementation)  
**Reviewer**: GPT-6 / Codex  
**Scope**: architecture council preflight and reusable Round 1 prompt  
**Verdict**: **RECOMMENDATION - run a docs-first council; do not select or install a stack yet**  
**Mode**: ADVISORY (local facts reproduced; external-product claims require independent verification)  
**Receipt-Owner**: `codex-1d88d4ac0104f8a6`  
**Receipt**: `.ai/worklog/codex-1d88d4ac0104f8a6.md`

## Executive ruling

The owner's intuition is directionally sound: role-specific MCP capabilities may improve real product work. The stronger claim that Colabs must prove a breakthrough on itself is not a valid gate. Colabs is small and prose-heavy; a code-navigation tool can have negative value here and positive value in a large typed product. Colabs can validate policy, safety, client compatibility, schema cost, fallback and handoff behavior. It cannot establish transferable product ROI without a later representative workload.

The four supplied answers are useful as Round 0 hypotheses, not as an architecture decision. Their tool-cost numbers were not measured, two answers misstate the H1 treatment, one assumes nonexistent notebooks, and several treat custom adapters as stock product capabilities.

## Verified baseline that every participant must use

- H1 Arm B was already scoped, not a default full-repository pack. The command included `.ai/bin/**`, `validate-protocol.ps1`, `test-protocol.ps1` and `tests/**`; it excluded TASK, PLAN, DECISIONS, worklogs and review history. See the archived H1 runbook.
- Arm B read an approximately 88k-token raw digest in addition to normal exploration. It failed the registered gates: broad total +72.79%, broad fresh +9.10%, narrow total +60.20%, narrow fresh +42.76%. This refutes that additive treatment, not every retrieval design.
- Current visible tree inventory: 188 files; 164 Markdown, 19 CJS, 3 PowerShell, 0 notebooks. `.ai/bin` has 6 files / 3,101 lines; `tests` has 18 files / 5,304 lines.
- `rg 15.2.0` exists in the current Codex host, while the DeepSeek closure host reported no `rg`. Baselines are client-specific; do not assume a shared executable surface.
- Binding policy remains: external tools are advisory, never Evidence or gate inputs; graceful native fallback; at most one local MCP server per adoption phase; measured tool-schema budget <=1,500 tokens.
- `PROTO-DEC-0036` and `PROTO-DEC-0039` remain binding during discussion. The owner requested analysis, not installation or adoption. A later owner decision and registry transition are required before implementation.

## Corrections to Round 0 candidate claims

- Repomix 1.18.0 sandbox exposes five root-confined read-only tools. Its MCP feature is documented as experimental. C2 slice retrieval remains untested; the raw-digest result cannot be relabelled as a full-repository failure.
- Serena 1.5.3 officially lists JavaScript, Markdown and PowerShell among supported languages, provides Codex-specific contexts, and permits a fixed tool set. This disproves “PowerShell/Markdown unsupported” as a blanket claim, but does not prove useful Markdown symbols or a low schema cost on this repository.
- Official Qdrant MCP exposes `qdrant-store` and `qdrant-find`, supports local storage and `QDRANT_READ_ONLY`, but its documented find schema has no payload-filter argument and it does not automatically ingest the repository. The proposed filtered document index therefore needs a separate, specified ingestion/provenance layer.
- Kindex 0.36.0 is a development preview exposing 50+ native tools and a writable, Git-tracked `.kin/` graph with task, lock, decision and coordination concepts. That overlaps heavily with Colabs. A two-tool read-only “Kindex Lite” is a custom adapter hypothesis, not a documented stock configuration.
- MCP specifies discovery through `tools/list`; it does not specify how each host injects, caches or bills tool definitions. Claims such as “N tokens on every step” must be measured per client, not inferred from JSON size.

## Initial prior to challenge

1. Native file/search/git operations remain the universal control.
2. A profile router is more plausible than a simultaneous stack: zero MCP by default, one task-specific server when its substitution rule applies.
3. Minimal read-only Serena is the strongest code-navigation candidate, especially for larger product repositories; expected value on Colabs itself is low or uncertain.
4. Repomix MCP slice retrieval is a valid distinct hypothesis, but overlaps native search and must replace reads rather than add a second path.
5. Qdrant is only plausible for fuzzy prose/history retrieval after an ingestion, freshness and provenance design exists; exact decision IDs already favor deterministic search.
6. Stock Kindex is currently the weakest Colabs fit because it duplicates source-of-truth, task, lock and coordination surfaces. A custom read-only projection must be costed as maintained software.

---

# Reusable prompt: Round 1 - capabilities, host reality and falsifiable value

You are one independent member of an MCP / bounded-context architecture council. Answer in Russian. Internal notes may be English. Do not read other Round 1 answers and do not optimize for consensus.

## Authority and mode

This is discussion-only. Do not modify files, install packages, configure clients, start MCP servers, append decisions or run product work. Repository facts must come from direct read-only inspection. External capability claims must cite primary sources: official documentation, official repository source, release metadata or the MCP specification. Label every unsupported statement `UNKNOWN`.

The owner has paused transfer of work to `D:\Block-Puzzle` and `D:\VPN` while this council runs. This is not approval to adopt MCP, and it does not yet supersede `PROTO-DEC-0036` or `PROTO-DEC-0039`.

## Required repository evidence

Read `AGENTS.md`, `.ai/TASK.md`, `.ai/PLAN.md`, `PROTO-DEC-0034..0039`, the H1 runbook/report/correction/post-mortem, the 2026-09-20 MCP council synthesis, and this preflight. Verify the exact H1 include scope before explaining its failure. Record commit SHA and dirty status.

## Candidate set

Evaluate at minimum:

1. native file/search/git control;
2. Repomix 1.18.0 scoped CLI and sandboxed MCP as separate treatments;
3. Serena 1.5.3 with the official Codex/client context and the smallest read-only fixed tool set;
4. official `qdrant/mcp-server-qdrant` in local read-only mode, including the missing ingestion layer;
5. Kindex 0.36.0 stock server versus a hypothetical constrained read-only projection;
6. a profile/router architecture that activates zero or one server by task class;
7. project-specific MCP classes only as a later transfer hypothesis, not as evidence about Colabs.

## Required analysis

For every candidate provide a claim ledger with `FACT / INFERENCE / SPECULATION / CONTRADICTED`, the exact primary source and version/date. Distinguish stock capability from custom code.

Build a role card with:

`role -> candidate -> data modality -> exact operation replaced -> trigger frequency -> expected gain -> schema/startup/index/update cost -> security boundary -> freshness/provenance -> fallback -> falsifier`.

Answer these questions:

1. What failure mechanism actually explains H1 after correcting the false “full repository” premise?
2. Which candidate substitutes for native reads rather than adding another retrieval path?
3. Which official tools can be removed server-side, and which “minimal” designs require a proxy or fork?
4. Can the candidate run read-only, local-only and workspace-confined on Windows with this repository's Node/PowerShell mix?
5. What data is indexed, who builds it, how is it invalidated, and how does every result carry source path plus content/tree hash?
6. How does the design preserve Git/DECISIONS as the sole authority and keep MCP output out of Evidence and gates?
7. What is the raw `tools/list` byte/token size, and what is the actual host-visible prompt/token effect? If unmeasured, say `UNKNOWN`; do not invent estimates.
8. Which clients used by this project support the required transport and filtering? Produce a client-capability matrix; absent first-hand evidence, mark unknown.
9. What is the expected value separately for Colabs, Block-Puzzle and VPN? Do not infer product value solely from Colabs self-hosting.
10. Is the best architecture simultaneous, tiered, routed, or no-MCP? Name one leading design and the strongest reason it may still fail.

## Mandatory alternatives

Compare at least: A) native only; B) native + minimal Serena profile; C) native + Repomix MCP profile; D) native + read-only Qdrant profile; E) stock Kindex; F) routed profiles with never more than one active MCP. Reject any option that cannot identify what it replaces.

## Output format (maximum 140 lines)

1. Verdict on the owner's intuition: `CORRECT / PARTLY CORRECT / INCORRECT`, with scope.
2. Five most important corrected facts.
3. Candidate/role matrix.
4. Client and Windows compatibility matrix.
5. Schema/cost ledger with measured values or `UNKNOWN`.
6. Ranked architecture alternatives and one leading architecture.
7. Failure modes and adversarial counterargument.
8. Smallest future experiment, specified but not executed: control, one candidate, substitution rule, task strata, quality judge, token/time accounting, thresholds and stop rule.
9. Governance path: continue discussion, reopen which decision(s), or retain freeze.
10. Open unknowns that Round 2 must resolve.

Do not vote by popularity. A recommendation without primary evidence or a reproducible measurement plan is advisory noise.

## Round sequencing

- Round 1: independent fact and capability audits using this prompt.
- Round 2: coordinator fact-checks all answers, resolves contradictions, and synthesizes at most two architectures; no installation.
- Round 3 only if Round 2 leaves a credible candidate: hostile red team plus preregistered experiment. PASS authorizes replication, not adoption.

## Primary-source starting points

- Serena: https://github.com/oraios/serena and https://oraios.github.io/serena/
- Repomix MCP: https://repomix.com/guide/mcp-server
- Qdrant MCP: https://github.com/qdrant/mcp-server-qdrant
- Kindex: https://github.com/wandercom/kindex
- MCP tools specification: https://modelcontextprotocol.io/specification/2025-11-25/server/tools

