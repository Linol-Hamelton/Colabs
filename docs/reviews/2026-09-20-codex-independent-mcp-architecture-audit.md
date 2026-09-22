# Codex - Independent MCP and Context Architecture Audit

**Date**: 2026-09-20  
**Reviewed commit**: `d38d2f2ae4b4c17fe6c2c18f11215cedb2f10eb1`  
**Working tree**: dirty (109 changed/untracked paths observed; parallel work in progress)  
**Reviewer**: GPT-6 / Codex, independent of the Gemini implementation and DeepSeek review  
**Scope**: audit, architecture, experimental validity, external-tool fit  
**Verdict**: **RECOMMENDATION - CORRECT THE CLAIM BOUNDARY; DO NOT ADOPT YET**  
**Mode**: CERTIFYING  
**Receipt-Owner**: `codex-1d88d4ac0104f8a6`  
**Receipt**: `.ai/worklog/codex-1d88d4ac0104f8a6.md`  

---

## Executive Summary

The owner's concern is substantiated: H1 did not test the proposed MCP retrieval architecture. It tested an extra read of a full raw Repomix digest; Serena and Qdrant were explicitly excluded, and Arm C (Repomix MCP) was never run. The evidence supports rejecting that Arm B workflow and executing the pre-registered stop rule, but it does not empirically refute grep/slice MCP retrieval, scoped packing, Serena symbol navigation, Qdrant payload-filtered retrieval, or Kindex.

The three supplied opinions are not safe as a decision basis without correction. The third is factually inapplicable: this repository has zero tracked `.ipynb` files. The first two contain useful hypotheses but overstate readiness and understate integration cost. The correct disposition is: no immediate adoption, preserve the product-pilot feature freeze, and—only after an owner-directed reopening—test narrowly isolated retrieval candidates against native `rg`/direct reads.

---

## Scope and Evidence

- Local sources: `PROTO-DEC-0034..0039`, H1 design/report/correction/post-mortem, prior Codex H1 audit, current `TASK.md` and `PLAN.md`.
- Reproductions:
  - `git ls-files '*.ipynb'` -> no output.
  - tracked extensions -> 156 Markdown, 19 CJS, 3 PowerShell, 1 JSON; no notebooks.
  - `Get-Command repomix,serena,kin,kin-mcp,qdrant-client,pwsh` -> all absent.
  - no tracked `.mcp.json`, `.serena/**`, `.kin/**`, `qdrant_data/**`, or `.vscode/mcp.json`.
  - active reviews observed: 63 files / 791,493 bytes; journals: 30.
- Primary external documentation checked:
  - [Repomix MCP server](https://repomix.com/guide/mcp-server): sandbox mode exposes read-only packing, grep, and partial-read tools; MCP remains experimental.
  - [Serena README](https://github.com/oraios/serena/blob/main/README.md?plain=1) and [language support](https://oraios.github.io/serena/01-about/020_programming-languages.html): symbol navigation is supported across many languages, but PowerShell requires PowerShell 7+ and extra language-server setup.
  - [Qdrant filtering](https://qdrant.tech/documentation/search/filtering/) and [hybrid queries](https://qdrant.tech/documentation/search/hybrid-queries/): payload filters and hybrid retrieval exist, but indexing, payload schema, ingestion, and staleness management remain application responsibilities.
  - [Kindex repository](https://github.com/wandercom/kindex): Kindex is a persistent weighted knowledge graph with a tracked `.kin/` surface and 50+ MCP tools, not a zero-cost SQLite lookup helper.

---

## Findings

| Id | Severity | Finding | Status |
|---|---|---|---|
| A-001 | HIGH | H1 result was generalized beyond the tested treatment | Open |
| A-002 | HIGH | The notebook-based diagnosis targets a repository that does not exist here | Rejected premise |
| A-003 | MEDIUM | Serena is useful but the proposed calls and readiness claims are inaccurate | Untested |
| A-004 | HIGH | Kindex/Qdrant complexity and source-of-truth risks are understated | Untested |
| A-005 | MEDIUM | Repomix does not erase file roles; it imposes selection and attention costs | Corrective framing |
| A-006 | HIGH | Existing accepted decisions require an explicit reopening path | Binding constraint |
| A-007 | MEDIUM | The active-review cap is currently breached and is orthogonal to MCP choice | Open owner ruling |

### A-001 - H1 did not test the intended MCP architecture

`docs/reviews/2026-09-19-h1-pilot-report.md:11,31` records a full raw digest and an all-files read. The post-mortem states that every Arm B session read the whole ~88k-token digest and additionally explored the repository. The design explicitly excluded Serena and Qdrant, while Arm C was conditional and never ran.

Therefore:

- Valid conclusion: the raw whole-digest Arm B failed; under `PROTO-DEC-0035`, do not proceed to its conditional Arm C.
- Invalid empirical claim: all index, MCP, symbol-navigation, or filtered-retrieval designs were refuted.
- Valid governance choice: the owner may still close all follow-on work because its expected value is below product work. That is a portfolio decision, not an experimental result.

### A-002 - The third opinion is factually inapplicable

The claim that Colabs is a Jupyter/experiment repository is inferred from the name, not the tree. No `.ipynb` is tracked or present in the scoped scan. `nbstripout`, Jupytext, output stripping, GPU/CUDA memory, and per-notebook path isolation may be appropriate in a consumer repository that actually contains notebooks, but they are not a remedy for this Colabs repository.

### A-003 - Serena is a candidate, not an installed low-cost layer

Serena's symbol overview, symbol lookup, and reference tools are relevant to the CJS kernel. However:

- `find_symbol("AGENTS.md")` is conceptually wrong: a filename is not a symbol. Use file read/search or a Markdown outline.
- `find_referencing_symbols("DEC-0011")` is not a reliable substitute for text search; a decision ID in prose is usually a text occurrence, not an LSP reference.
- Markdown support must be explicitly enabled; PowerShell support requires `pwsh`, which is absent on this host.
- Serena does not enforce Colabs authority ranking, approval provenance, append-only decisions, or lock ownership. Those remain protocol rules.

### A-004 - Kindex and Qdrant are new subsystems

Neither is currently configured. Qdrant needs a deterministic ingestion/chunking pipeline, embeddings, source hashes, deletion/update handling, payload indexes, and a rule that retrieved text is advisory. Kindex maintains another durable semantic graph and exposes 50+ MCP tools; this is likely incompatible with the current one-server / <=1,500-schema-token policy unless a sharply restricted mode is demonstrated. A writable knowledge graph can also contradict `DECISIONS.md`; it must be derived or explicitly subordinate, never authoritative.

The proposed "Serena metadata -> Qdrant symbol graph" is custom integration work, not a built-in consequence of installing either tool.

### A-005 - Correct diagnosis of Repomix

Repomix preserves paths and file contents; it does not literally erase governance roles. The failure mechanism is that a monolithic representation makes irrelevant text consume attention and tokens and encourages treating heterogeneous artifacts as one reading unit. Scoped packs and MCP grep/slices are real features, but their scope-selection, schema, generation, and retrieval costs must be counted against the simpler native baseline (`rg` plus direct slices).

### A-006 - Governance state is already beyond "before accepting"

`PROTO-DEC-0036` is recorded as Accepted with `Reopen-trigger: owner-directive`, and `PROTO-DEC-0039` freezes protocol features until the product-pilot report. This audit must not edit or silently reinterpret those append-only blocks. If the owner wishes to reconsider, the compliant path is:

1. record an `owner-directive` trigger row in `docs/decisions/REGISTRY.md` under the shared lock;
2. run the council as advisory analysis only;
3. append a new decision that supersedes or narrows `PROTO-DEC-0036`; and
4. either preserve the feature freeze or state an explicit owner-approved exception.

### A-007 - Corpus cap is a separate unresolved decision

At observation time active `docs/reviews/` was 63 files / 791,493 bytes, above 60 / 600 KB. MCP selection cannot solve a contradictory keep-set/cap. Choose explicitly between: raising the owner-tunable cap, reducing live citation surface through a new compatible receipt/path design, or archiving only after bindings are migrated. Do not move live cited or certifying files merely to make the counter green.

---

## Proposed Decision Basis for the Council

These are propositions for discussion, not approved decisions:

1. **Evidence boundary**: H1 refuted only the full raw-digest treatment that was run.
2. **No immediate adoption**: do not install or configure Repomix MCP, Serena, Qdrant, or Kindex during the current feature freeze.
3. **Candidate order after an owner-approved reopening**:
   - Control: native `rg` plus direct file slices.
   - Candidate 1: Repomix MCP grep/partial-read and scoped pack, compared directly with native search.
   - Candidate 2: Serena on CJS symbol tasks; PowerShell only after its prerequisites are installed and measured.
   - Candidate 3: Qdrant only for the large review/archive prose corpus, with source hash and strict path/type payload filters.
   - Candidate 4: Kindex only after demonstrating a read-only/derived mode, schema pruning, deterministic provenance, and no conflict with repository authority.
4. **Notebook preprocessing**: exclude from the Colabs decision; evaluate separately only in repositories containing notebooks.
5. **One variable at a time**: one server, one candidate, matched tasks, immutable trial manifest, and no pooling across incompatible clients.

## Minimum Falsifiable Experiment

- Six pre-registered tasks: two CJS symbol/reference tasks, two governance/prose retrieval tasks, two narrow edits.
- At least three repetitions on one pinned model/client; a second model family only after the first passes.
- Count all costs: tool schemas per turn, installation/setup amortization, index/pack generation, scope selection, retrieval, fresh input/output tokens, and failure recovery.
- Quality is determined by pre-written expected sources and executable reproductions, not by subjective "accepted findings".
- Promotion gate: >=25% median broad fresh-token reduction, <=+5% narrow regression, no quality or handoff regression, and schema <=1,500 tokens.
- Immediate stop on any gate breach. Passing only authorizes a second-family replication, not adoption.

## Independent Recommendation

Keep the current no-adoption state and product-pilot priority. Correct the historical interpretation from "all MCP/index approaches were empirically refuted" to "the tested whole-digest workflow failed; follow-ons were closed by owner priority." Run the attached council prompt now if desired, but defer any tooling experiment until the product-pilot report unless the owner explicitly overrides `PROTO-DEC-0039`.

## References

- Council prompt: `docs/reviews/2026-09-20-mcp-architecture-council-prompt.md`
- Decisions: `PROTO-DEC-0034..0039` in `.ai/DECISIONS.md`
- H1 artifacts: `docs/reviews/2026-09-19-h1-pilot-design.md`, `docs/reviews/2026-09-19-h1-pilot-report-correction.md`, and archived report/post-mortem
- Prior independent audit: `docs/reviews/2026-09-19-codex-trackc-h1-audit.md`

