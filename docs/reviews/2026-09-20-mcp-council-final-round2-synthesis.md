# MCP Architecture Council - Final Round-2 Synthesis (Owner-Ordered Protocol Closure)

**Date**: 2026-09-20 (UTC)
**Baseline**: `d38d2f2ae4b4c17fe6c2c18f11215cedb2f10eb1`; working tree dirty, uncommitted
**Mode**: FINAL SYNTHESIS (advisory; not a certification; produces no new Evidence)
**Supersedes for decision purposes**: the disposition sections of `docs/reviews/2026-09-20-mcp-council-round2-synthesis.md` (that file remains active evidence with its own certification)
**Reopening**: none. `PROTO-DEC-0036` and `PROTO-DEC-0039` remain Accepted and are not reopened. No DECISIONS block and no registry trigger is created by this closure.

## Input register (valid independent Round-1/2 answers)

| # | Voice | Artifact | Status of artifact | Notes |
|---|---|---|---|---|
| 1 | DeepSeek | `2026-09-20-mcp-research-consolidation.md` (moved by this closure to `archive/2026-09-20-mcp-research-consolidation.md`) | Round-1 consolidated analysis | Role card set, risk ledger, thresholds |
| 2 | GLM 5.1 | Owner-supplied attachment, SHA-256 `80C54811C06C60B75B8E19E9C829BFAB75EDAA6A119870B2B584C7AA5654785C`, 7,429 bytes | Adjudicated in the prior synthesis; no repository file | Cited here by hash; its corrected claims are folded into section 1 |
| 3 | GPT/Codex | `2026-09-20-codex-independent-mcp-architecture-audit.md` (kept) and `2026-09-20-mcp-stack-council-round1-prompt.md` (kept) | CERTIFYING / ADVISORY | Supplied the claim-boundary correction and the minimal falsifiable experiment |
| 4 | Gemini | `2026-09-19-gemini-mcp-candidates-deep-research.md` (moved by this closure to `archive/2026-09-19-gemini-mcp-candidates-deep-research.md`) plus the Round-2 synthesizer answer quoted in section 3 | Advisory | Provided the layer stack and the final decision architecture |
| - | Qoder | Inline owner-supplied summary | **Advisory summary, not a quorum member** | No verdict, no reproduction; recorded separately, given no weight |

No model count is treated as a vote. Dissent is preserved in section 4.

## 1. Factual consensus and corrected contradictions

1. H1 empirically refuted **only** the tested additive full-raw-digest workflow (Arm B, ~88k tokens read in addition to normal exploration). It did not test grep/slice retrieval, scoped packing, symbol navigation, filtered retrieval, or MCP server mode; Arm C/D/E never ran.
2. The notebook diagnosis (`.ipynb`, `nbstripout`, CUDA/Drive) is inapplicable: zero `.ipynb` in the repository.
3. `rg` availability and MCP support are host-specific (Codex host: rg 15.2.0; the DeepSeek host reported no rg). Never universalize one client's surface.
4. Qoder is not a quorum member: its answer restates the prompt without a verdict or reproduction.
5. Candidate versions must not be mixed: Serena 1.5.3 vs 1.7.0; Qdrant default payload schema vs configurable `filterable_fields`. PowerShell support in Serena requires `pwsh`, which is absent on this host; JavaScript/TypeScript symbol support is the relevant surface.
6. Kindex Lite, the Qdrant ingestion pipeline, a profile router and `protocol-context.cjs` are **not stock**; each is custom software with maintenance cost. Stock Kindex 0.36.0 (50+ tools, writable `.git`-tracked `.kin/` graph) conflicts with the one-server / <=1,500-token policy and with repository authority.
7. "JIT Copipe" and any new component are SPECULATION until measured.
8. Native verification after any MCP result must be a small confirming slice (<=30-50 lines), never a second broad search.
9. The active corpus exceeded its own cap (61 files / 606,871 B before this closure). This closure resolves it by classification (appendix A), not by raising the cap.

## 2. Admissible architectures (only two)

**A. Native-only (control).** `rg`/grep plus targeted file reads plus Git. Cost: 0 schema tokens, 0 daemons; O(relevant files). Failure mode: on a large codebase, multi-hop symbol tracing reads many irrelevant files. Falsifier: a product-pilot report showing a reproducible retrieval bottleneck where native search cost stably exceeds a candidate's overhead.

**B. Routed policy.** Zero MCP by default; at most one backend activated by a deterministic trigger (explicit task directive or task class), replacement-only (no additive second path), then a targeted native slice. Cost: <=1,500 schema tokens (host-visible), daemon and LSP/index startup. Failure modes: additive duplication; index desync with the uncommitted tree; daemon crash without fallback. Falsifier: broad fresh-token gain <25%, narrow regression >+5%, or any quality/handoff regression.

## 3. Recommendation for NOW (unambiguous)

**A - resume native-only product pilots.** No MCP experiment now. `PROTO-DEC-0039` mandates testing the protocol's practical value on real product code first; the Colabs self-audit is closed (PASS). The owner's preferred fork is confirmed by the Gemini synthesizer ("ПОЛНОЕ СОГЛАСИЕ") and fact-checked by DeepSeek: no measured evidence yet justifies an exception.

## 4. First candidate if an experiment is ever allowed

**Serena, minimal read-only profile - candidate 1. Repomix - candidate 2, conditional.**

Reason: Repomix duplicates text retrieval, where native `rg` is already effective; Serena offers a different modality (symbol/reference graph), unavailable to text search, and the product repositories are where it can pay: **Block-Puzzle is predominantly Dart; VPN is a mixed Dart/Kotlin/Swift/Python project**. They must not be described as JS/TS codebases. Serena's real effectiveness on these languages is **UNKNOWN** until the experiment.

**Visible dissent (not hidden):** the prior Codex synthesis and the DeepSeek consolidation placed Repomix MCP grep/slice first, arguing it directly replaces reads. That position remains credible; if the pilot bottleneck is prose/section retrieval rather than symbol navigation, Serena's LSP/setup costs will not pay and the candidate order must flip. Serena prerequisites (Python/`uv`, GPL-3.0 application, language servers, Windows weight) are costs, and `tools/list` plus host-visible schema must be measured, not estimated.

## 5. Pre-registered experiment specification (if and only if the owner later directs it)

- **Replaces**: `rg <symbol>` -> full-file reads for definitions, implementations, references. Replacement-only; duplicate native re-reading of MCP-returned content is a counted failure.
- **Targeted native verification**: read-only slice of the target range (<=30-50 lines) before any edit.
- **Task strata**: S1 broad multi-hop symbol navigation; S2 narrow localized edits; S3 prose/governance retrieval (negative control; native must win here). Minimum 6 tasks (2 per stratum) x 3 repetitions on one pinned model/client; 10 tasks only after a first-family pass. No pooling across clients.
- **Schema measurement**: raw `tools/list` bytes and tokens + host-visible injection/caching/billing effect per client; policy limit <=1,500 tokens; unmeasured = UNKNOWN.
- **Provenance**: every result carries relative path + Git blob SHA (or content hash) + `startLine:endLine`; output is advisory and never Evidence or a gate input; immutable trial manifest.
- **Accounting**: fresh tokens (in+out) primary; total (with schema), wall time, quality (pre-written expected sources plus executable tests), fallback rate, duplicate-read volume, installation/setup amortization.
- **Thresholds**: median broad fresh-token reduction >=25%; narrow regression <=+5%; schema <=1,500; no quality or handoff regression.
- **Stop rule**: immediate stop on any breach, daemon crash without fallback, or product test failure.
- **Replication**: a first-family pass authorizes replication by a second independent model family only - never adoption.

## 6. Owner decisions

1. Reopening `PROTO-DEC-0036`: **not required now**.
2. Exception to `PROTO-DEC-0039`: **not required now**; the freeze holds.
3. Return to `Block-Puzzle` / `VPN` objectives and frozen metrics: the ruling below is **approved** and the council is closed; the owner must still name one objective and five frozen metrics per repository before any product task starts.
4. Corpus cap: resolved by this closure through classification and archiving; no further decision needed unless the owner disagrees with the dispositions in appendix A.

## 7. Owner ruling (approved 2026-09-20)

**Approved by the owner on 2026-09-20 (direct confirmation in chat), with two mandatory corrections applied:** (1) product repositories are Block-Puzzle (predominantly Dart) and VPN (mixed Dart/Kotlin/Swift/Python), not JS/TS; Serena remains the first conditional candidate because of its modality, with effectiveness on those languages UNKNOWN until measured; (2) section 6 stands as listed.

> MCP Architecture Council Round 2 is accepted in substance. The existing PROTO-DEC-0036 and PROTO-DEC-0039 are preserved; MCP experiments and adoption are not permitted until the product-pilot report. Product pilots resume in native-only mode after the protocol closure of the council and the owner's approval of one objective and five metrics per repository. If the pilots reveal a measurable symbolic-navigation bottleneck, a separate owner-directive may authorize one pre-registered experiment with a minimal read-only Serena profile; PASS authorizes replication only, not adoption.

## Appendix A - Classification registry (61 files before closure)

Categories: A KEEP-BINDING; B KEEP-ACTIVE EVIDENCE; C KEEP-OPEN; D ARCHIVE-SUPERSEDED; E ARCHIVE-REJECTED/CLOSED; F AMBIGUOUS-OWNER REVIEW.
Method: certifying header check `Mode\s*\*{0,2}:\s*\*{0,2}CERTIFYING`; binding citations from TASK/PLAN/DECISIONS/REGISTRY/AGENTS/QUICKSTART/.ai/docs/tests and from current-cycle governance documents. All moved files go to `docs/reviews/archive/` with exact rows in `archive/INDEX.md`; history is preserved, nothing is deleted.

| Path | Cat | Active dependencies | Disposition | Reason |
|---|---|---|---|---|
| 2026-09-16-council-review.md | A | cited by binding docs | keep | binding reference |
| 2026-09-17-three-repository-review.md | A | tests/upgrade.test.cjs, DECISIONS | keep | F-4 restorations |
| 2026-09-18-copilot-audit-v1.9.3-audit.md | D | none | archive | superseded historical audit |
| 2026-09-18-copilot-audit-v1.9.md | D | journals only | archive | superseded v1.9 audit |
| 2026-09-18-deepseek-flash-p5-gate-review.md | A | DECISIONS | keep | cited by accepted decision |
| 2026-09-18-grand-council-consensus-v1.9.0.md | A | PROTO-DEC-0026 | keep | cited by accepted decision |
| 2026-09-19-claude-opus-v1.9.5-certification.md | B | certifying | keep | active evidence |
| 2026-09-19-claude-opus-v1.9.5-delta-certification.md | B | certifying | keep | active evidence |
| 2026-09-19-codex-trackc-h1-audit.md | B | certifying, binding | keep | active evidence |
| 2026-09-19-codex-trackc-h1-probes.cjs | E | journals only | archive | closed H1 instrumentation |
| 2026-09-19-council-synthesis-course-correction.md | D | none | archive | superseded by this synthesis |
| 2026-09-19-course-correction-adversarial-audit-prompt.md | D | none | archive | audit completed; prompt closed |
| 2026-09-19-deepseek-course-correction-certification.md | B | certifying, binding | keep | active evidence |
| 2026-09-19-deepseek-course-correction-certification-round2.md | B | certifying | keep | active evidence |
| 2026-09-19-deepseek-flash-a1-audit.md | B | certifying | keep | active evidence |
| 2026-09-19-deepseek-flash-a2-audit.md | B | certifying | keep | active evidence |
| 2026-09-19-deepseek-flash-a3-audit.md | B | certifying | keep | active evidence |
| 2026-09-19-deepseek-flash-a3-reaudit.md | B | certifying | keep | active evidence |
| 2026-09-19-deepseek-flash-a4-audit.md | B | certifying | keep | active evidence |
| 2026-09-19-deepseek-flash-a5-b-audit.md | B | certifying | keep | active evidence |
| 2026-09-19-deepseek-flash-a5-b-audit-addendum.md | B | certifying | keep | active evidence |
| 2026-09-19-deepseek-flash-c1a-audit.md | B | certifying | keep | active evidence |
| 2026-09-19-deepseek-flash-c1-audit.md | B | certifying | keep | F-001 restoration |
| 2026-09-19-deepseek-flash-c1-audit-addendum.md | B | certifying | keep | active evidence |
| 2026-09-19-deepseek-flash-certification-adjudication.md | B | certifying | keep | active evidence |
| 2026-09-19-deepseek-flash-ci-hotfix-audit.md | B | certifying | keep | active evidence |
| 2026-09-19-deepseek-flash-interim-council-plan.md | D | journals only | archive | interim plan superseded |
| 2026-09-19-deepseek-flash-interim-plan-addendum-context-and-decision-freeze.md | D | journals only | archive | interim addendum superseded |
| 2026-09-19-deepseek-flash-item6-audit.md | B | certifying | keep | active evidence |
| 2026-09-19-deepseek-flash-mcp-selection-analysis.md | A | PROTO-DEC-0034 | keep | cited by accepted decision |
| 2026-09-19-deepseek-flash-stop-cycle-fix-audit.md | B | certifying | keep | active evidence |
| 2026-09-19-deepseek-flash-trackc-audit.md | B | certifying | keep | active evidence |
| 2026-09-19-eval-p2-decision-maker.md | D | none | archive | draft inputs superseded by rulings |
| 2026-09-19-final-course-decision-prompt.md | D | none | archive | executed; closed |
| 2026-09-19-final-v1.9.5-adversarial-review-prompt.md | B | certifying, binding | keep | active evidence |
| 2026-09-19-gemini-course-correction-implementation-prompt.md | A | current-cycle governance | keep | dispatch of the accepted package |
| 2026-09-19-gemini-course-correction-implementation-report.md | B | binding, journals | keep | current-cycle evidence |
| 2026-09-19-gemini-mcp-candidates-deep-research.md | D | journals only | archive | Round-1 input; registered above |
| 2026-09-19-gemini-remediation-advice.md | B | certifying | keep | active evidence |
| 2026-09-19-gemini-systemic-repository-audit.md | B | certifying | keep | active evidence |
| 2026-09-19-gemini-trackc-h1-audit.md | B | certifying | keep | active evidence |
| 2026-09-19-grand-consensus-systemic-course-correction-v2.md | A | current-cycle governance | keep | corrected reissue referenced by rulings |
| 2026-09-19-h1-pilot-design.md | A | PROTO-DEC-0035 | keep | cited by accepted decision |
| 2026-09-19-h1-pilot-report-correction.md | A | current-cycle governance | keep | H1 boundary correction |
| 2026-09-19-mcp-context-layer-discussion-basis.md | D | none | archive | superseded by council closure |
| 2026-09-19-mistral-mcp-candidates-research.md | D | journals only | archive | Round-0 input superseded |
| 2026-09-19-mistral-vibe-v1.9.5-certification.md | B | certifying | keep | active evidence |
| 2026-09-19-owner-rulings-course-correction.md | A | binding | keep | owner confirmation record |
| 2026-09-19-qoder-trackc-h1-audit.md | B | certifying | keep | active evidence |
| 2026-09-19-qoder-v1.9.5-certification.md | B | certifying | keep | active evidence |
| 2026-09-19-track-c-h1-external-audit-prompt.md | B | certifying, binding | keep | active evidence |
| 2026-09-19-universal-council-prompt-mcp-context-layer.md | D | none | archive | superseded by the executed council |
| 2026-09-20-codex-independent-mcp-architecture-audit.md | B | certifying, binding | keep | active evidence; dissent source |
| 2026-09-20-deepseek-cycle-closure-review.md | B | certifying, binding | keep | round-1 closure review |
| 2026-09-20-deepseek-cycle-closure-review-round2.md | B | certifying | keep | PASS certification |
| 2026-09-20-deepseek-gemini-cycle-resume-prompt.md | A | TASK Next | keep | current task dispatch |
| 2026-09-20-gemini-cycle-closure-report.md | B | binding | keep | current-cycle evidence |
| 2026-09-20-mcp-architecture-council-prompt.md | A | certified by Codex audit | keep | Round-1 instrument cited by active evidence |
| 2026-09-20-mcp-council-round2-synthesis.md | B | certifying, binding | keep | prior synthesis; retained evidence |
| 2026-09-20-mcp-research-consolidation.md | D | none | archive | Round-1 input; registered above |
| 2026-09-20-mcp-stack-council-round1-prompt.md | A | current-cycle governance | keep | Round-1 preflight; input register |
| 2026-09-20-mcp-council-final-round2-synthesis.md | A | this file | keep | final closure record |

**Ambiguous (F) for owner review: none.** Every path had a determinable status from TASK, DECISIONS, certification headers, binding citations or receipts.

**Result:** 14 files archived (D/E), zero deleted; 48 files active after adding this synthesis; expected ~444 KB, within the 60-file / 600 KiB cap; journals unchanged at 30; all moved paths recorded in `archive/INDEX.md`.
