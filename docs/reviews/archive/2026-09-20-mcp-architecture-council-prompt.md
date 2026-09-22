# MCP / Bounded-Context Architecture Council Prompt

**Date**: 2026-09-20  
**Author**: Codex independent auditor  
**Purpose**: one or two advisory council rounds before any owner-directed reopening of `PROTO-DEC-0036`  
**Mode**: discussion only; no code, installs, configuration, registry rows, or decision transcription  

## PROMPT - COPY FROM HERE

You are an independent architecture and experimental-methods reviewer for `D:\Colabs`, an AI collaboration protocol repository. Do not assume prior consensus is correct. Verify repository claims from files and distinguish measured facts, owner policy, hypotheses, and external-tool marketing.

### Authority and current constraints

1. `.ai/DECISIONS.md` is append-only. `PROTO-DEC-0036` is already Accepted and can be reopened only by `owner-directive`; `PROTO-DEC-0039` freezes protocol feature work until the product-pilot report.
2. This council is advisory. Do not edit files or claim owner approval.
3. External tools and MCP output can never be Evidence or gate inputs (`PROTO-DEC-0034`).
4. Existing policy permits at most one local, sandboxed, pinned MCP server per adoption phase with total schema <=1,500 tokens and graceful fallback to native file operations.

### Required local context

Read:

- `.ai/DECISIONS.md`, blocks `PROTO-DEC-0034..0039`
- `.ai/TASK.md` and `.ai/PLAN.md`
- `docs/reviews/2026-09-19-h1-pilot-design.md`
- `docs/reviews/2026-09-19-h1-pilot-report-correction.md`
- `docs/reviews/archive/2026-09-19-h1-pilot-report.md`
- `docs/reviews/archive/2026-09-19-h1-pilot-postmortem-and-repomix-paths.md`
- `docs/reviews/2026-09-19-codex-trackc-h1-audit.md`
- `docs/reviews/2026-09-20-codex-independent-mcp-architecture-audit.md`

Verify at minimum: tracked file types; whether `.ipynb` exists; which MCP/index configurations and executables are actually present; what each H1 arm did; which candidates were excluded or never run.

For current external capabilities, use primary documentation only: official repositories or official docs for Repomix, Serena, Qdrant, and Kindex. State exact versions when a claim may differ by version.

### Disputed claims to adjudicate

1. Did H1 refute only a full raw-digest workflow, or does it justify calling all Repomix index/MCP patterns empirically refuted?
2. Was cancelling conditional Arm C a valid execution of the pre-registered stop rule? Separately, does that justify permanent closure of B2/B3/B4/C2?
3. Is the Jupyter/notebook diagnosis applicable to this repository? Show the file evidence.
4. Can Serena reliably handle this repository's CJS, PowerShell, and Markdown surfaces on the current Windows host? Distinguish file search, symbol search, and semantic references.
5. Does Repomix MCP grep/partial-read provide value over native `rg` plus direct slices after counting schema, generation, scope-selection, and recovery costs?
6. Can Qdrant be a disposable derived index over review prose without becoming a second source of truth? Specify ingestion, source hashing, payload schema, update/delete, and fallback requirements.
7. Can Kindex fit the one-server / <=1,500-token policy and coexist with `DECISIONS.md` authority? Measure or bound its tool schema; do not call it low complexity without evidence.
8. Is the best current action: (A) keep Track C closed, (B) scope a future experiment but preserve the product freeze, or (C) reopen and test now? Name the cost and falsifier of each.
9. How should the active review-cap breach be resolved without moving live cited/certifying files or invalidating receipts?

### Round 1 - Independent analyses

Each model answers without seeing other answers. Required format:

1. `Verdict`: A, B, or C from question 8.
2. `Claim ledger`: claim | VERIFIED / FALSE / UNTESTED / POLICY | reproduction/source.
3. `Experiment-boundary ruling`: exactly what H1 proves and does not prove.
4. `Candidate matrix`: native baseline, Repomix scoped CLI, Repomix MCP grep/slice, Serena, Qdrant, Kindex; for each give supported surfaces, prerequisites, schema/setup/staleness risks, source-of-truth risk, and recommendation.
5. `Strongest counterargument` against your own verdict.
6. `Minimal experiment`, only if recommending B or C: tasks, arms, repetitions, metrics, thresholds, stop rule, evidence retention, and estimated engineering/session cost.
7. `Governance path`: exact trigger and new-decision mechanics; never edit an accepted block.
8. `Open unknowns`: facts that must be measured rather than inferred.

Every repository finding needs a file/line or command reproduction. Every external capability claim needs a primary-source link. Avoid popularity, star counts, or vendor benchmarks as adoption evidence.

### Round 2 - Adversarial synthesis (optional but recommended)

Provide all Round 1 answers to a separate synthesizer. It must:

1. build an agreement/disagreement table without voting by model count;
2. reject claims lacking reproductions or primary sources;
3. identify shared hidden assumptions and circular citations;
4. compare experiments for construct validity: does each arm test the intended retrieval behavior rather than merely add context?
5. render one recommendation and one minority report;
6. produce a ready-for-owner decision menu, not a decision block with `Approved by:`;
7. state whether discussion alone can proceed under the freeze and whether execution needs an explicit `PROTO-DEC-0039` override.

### Non-negotiable experiment rules

- Native `rg` plus direct reads is the control.
- One candidate/server at a time; no bundled stack.
- Count schema per turn, setup/index generation, scope selection, retrieval, fresh input/output tokens, errors, and retries.
- Use pre-written expected sources and executable checks for quality; no subjective post-hoc scoring.
- Suggested promotion gate: >=25% median broad fresh-token reduction, <=+5% narrow regression, no quality/handoff regression, schema <=1,500 tokens.
- Passing one model/client authorizes replication on a second family, not adoption.
- Notebook preprocessing is out of scope unless the tested repository actually contains notebooks.
- No external cache, graph, or index becomes authoritative; all results must be reproducible from the repository.

### Final council output

Return:

1. executive verdict in <=200 words;
2. corrected factual basis;
3. claim ledger;
4. candidate matrix;
5. recommendation A/B/C with falsifier;
6. if applicable, one-page pre-registration for the smallest valid experiment;
7. owner-only decision menu covering reopening, freeze exception, candidate order, corpus cap, and maximum cost;
8. explicit dissent and unresolved unknowns.

Do not implement, install, configure, commit, append decisions, or claim consensus until the owner rules.

## END PROMPT

