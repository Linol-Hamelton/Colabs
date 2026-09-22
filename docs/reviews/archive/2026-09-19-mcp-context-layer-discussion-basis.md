# MCP / Context Layer - Discussion Basis (Owner-Initiated Reconsideration)

**Date**: 2026-09-19
**Recorded by**: deepseek-flash, controller session
**Baseline**: current working tree (uncommitted; HEAD `d38d2f2`)
**Mode**: ADVISORY - this file records the discussion basis. It decides nothing.
**Owner instruction**: prepare the basis and a 1-2 round universal council prompt before
accepting the Track C closure; the owner doubts that the MCP layer was implemented and
tested as originally intended. Final synthesis: consensus between the two main experts
(Gemini and DeepSeek) after the council rounds.
**Parallel work**: a GPT/Codex task runs concurrently; its files (`codex-*`) are not to
be overwritten. This file and the council prompt are separate artifacts.

---

## 1. What was actually implemented and tested

The H1 pilot (`docs/reviews/2026-09-19-h1-pilot-design.md`) pre-registered arms:

| Arm | Stack | Ran? |
|---|---|---|
| A | native file reads only (control) | yes |
| B | Repomix CLI digest, on demand, raw; no MCP | yes |
| C | B + Repomix MCP `--sandbox` (MCP-native clients only) | **no** - prerequisite was Arm B passing thresholds |
| D | C + Serena restricted modes | no |
| E | deterministic review index vs Qdrant local | no |

Measured Arm B result (`h1-pilot-report.md` and correction): broad tasks total tokens
+72.79% (fresh +9.10%), narrow total +60.20% (fresh +42.76%). `PROTO-DEC-0035` executed
the stop rule: no MCP adoption, Arm C cancelled. `PROTO-DEC-0036` closed Track C
permanently for this repository with `Reopen-trigger: owner-directive`, keeping
`PROTO-DEC-0034` (Repomix as optional advisory CLI helper) in force.

**Therefore the falsified claim is narrow**: a *raw, whole-kernel, pre-generated
monolithic digest used as the primary orientation artifact* increased total tokens on
the 12-task H1 set. It does not by itself falsify the broader design the owner intended.

## 2. What was never tested (the gap the owner identifies)

1. **Selective packaging**: `repomix --include` scoped to 2-6 task-relevant files instead
   of the whole kernel; the analysis itself recorded this as the "selective packaging"
   mode (less tokens, less noise).
2. **Compressed digest for orientation**: `--compress` (lossy, signature-level) was
   measured at 18.2k tokens for the full kernel vs 88k raw, but the pilot ran raw only.
3. **MCP server mode (Arm C)**: sandboxed Repomix MCP was never installed or run; the
   schema-tax hypothesis (~600-1,000 tokens/turn for 5-7 tools) was never measured.
4. **Symbolic navigation (Serena)**: LSP-based "overview -> detail" was deferred (P2)
   and never trialled; noted caveats: GPL-3.0 application, PowerShell LSP is heavy on
   Windows, value is symbol edits/refactors rather than reading.
5. **Decision-graph memory (Kindex)**: appears in the owner's layer matrix; not present
   in the MCP selection analysis beyond graph-server rejections (Graphiti, CGC).
6. **Filtered semantic retrieval (Qdrant local)**: deferred (P3) for the review/archive
   prose; payload filters by path/language were proposed but never implemented.
7. **Two-level analysis protocol**: "cheap skeleton first, then targeted detail" as a
   working habit was never enforced or measured on this repository.
8. **Staleness discipline**: digest headers anchored to the tree digest, regenerate on
   demand; designed but not exercised (Arm C prerequisite never met).

## 3. Owner intent (as stated in this session)

The owner's original design was a *structured context layer*, not a repository dump:
selective packaging, symbolic navigation, long-term decision memory, and filtered
semantic search, each used in its proper role ("you cannot fix a level problem with a
same-level tool"). Three reference opinions were provided (owner-pasted chat analyses;
sources unnamed). Their substance:

- **Opinion A**: Repomix applied to the repository root is a tool/artifact mismatch: it
  flattens the protocol's file roles (AGENTS.md rules, TASK, PLAN, DECISIONS, worklogs)
  into one undifferentiated pack. Proposal: Serena as the symbolic-navigation layer plus
  selective `repomix --include` snapshots of control documents only.
- **Opinion B**: comparison table (Repomix full = harmful; Serena = positive; Repomix
  selective = positive; Kindex = positive decision graph). Conclusion: keep Repomix in
  the selective role, add Serena, add Kindex.
- **Opinion C** (owner's favourite; marked by the owner as "how I originally intended
  it"): a four-layer stack - (1) selective packaging with preprocessing, (2) Serena
  overview->detail, (3) Qdrant payload filters by path/language, (4) Kindex long-term
  knowledge graph.

**Factual correction (must be stated honestly):** Opinion C diagnoses the regression as
a Jupyter-notebook problem (`*.ipynb` JSON, Base64 outputs, `nbstripout`/`jupytext`,
T4/Drive paths, experiment isolation by `file_path`). Verified on this repository:
remote is `github.com/Linol-Hamelton/Colabs`, and there are **no** `.ipynb`, `.csv` or
`.h5` files anywhere in the tree. This repository is the AI Collaboration Protocol
(kernel `.ai/bin/*.cjs`, PowerShell validator, prose protocol documents). The
notebook-specific parts of Opinion C therefore do not apply here; its *layer
architecture* intent does, and that is what the council should assess.

## 4. The actual context problem (measured, from the selection analysis)

- Kernel+tests full set: 88,082 raw tokens / 18,223 compressed; core4: 21,797 raw /
  3,909 compressed; validator dilutes compression.
- The largest genuine re-reading pool is prose history: before the archive,
  `docs/reviews/**` ~228k tokens, `.ai/ARCHIVE.md` ~37k, journals ~25k,
  `DECISIONS.md` ~15k. After the archive (PROTO-DEC-0037): `docs/reviews/` is
  62 files / ~784 KB, and the corpus is now bounded and indexed.
- Consequently: the kernel-reading problem is solved by reading 1-4 files; the prose
  problem is solved by retention policy + `rg` + INDEX. Any context layer must beat
  *that* baseline, not a hypothetical "read everything" baseline.

## 5. Questions for the council (answer all, individually)

- **Q1.** Did H1 Arm B validly test the owner's intended design, or was it a strawman?
  State precisely which claims the data falsifies and which it cannot touch.
- **Q2.** For each layer (selective pack, symbolic navigation, decision graph, filtered
  search): on THIS repository, what is the plausible mechanism of a net token/accuracy
  win over `rg` + targeted reads + the new corpus cap? Predict magnitude and name the
  tasks where it would show.
- **Q3.** Design the minimal cheap experiment that could settle the question
  (arms, task set, metrics, acceptance thresholds pre-registered, model subjects, cost,
  wall time). Constraints: free/local subjects only for test runs; at most one MCP
  server live at a time; tool-schema budget <= 1,500 tokens; no auto-install in hooks;
  outputs are advisory, never Evidence or gate inputs; no commit until the owner rules.
- **Q4.** Serena: is LSP symbol navigation worth it for a 2,826-line JS kernel plus a
  778-line PowerShell validator? Address Windows/PowerShell LSP weight, GPL-3.0 app,
  and the fact that kernel edits are few and surgical.
- **Q5.** Kindex: is a decision graph over `DECISIONS.md`/`PLAN.md` needed when they are
  ~15k tokens, deterministic, and already searchable? What would it add across sessions
  that a `rg` over the decisions log with the INDEX does not?
- **Q6.** Qdrant: is semantic retrieval justified over a bounded, indexed prose archive?
  Define the payload filters and the staleness rule that would make it trustworthy, or
  show why a deterministic index file is sufficient.
- **Q7.** Governance: if reopening is warranted, what is the correct path - a new
  PROTO-DEC superseding 0036 with `owner-directive`, revised falsifiers and thresholds?
  What stays frozen regardless (freeze per PROTO-DEC-0039, consumer pilots, no new
  gates)?
- **Q8.** Falsifiers both ways: what evidence would prove the intended stack works, and
  what evidence would close it for good? Include the cost ceiling beyond which the
  question is not worth pursuing on a single-developer repository.

## 6. Council structure (1-2 rounds)

- **Round 1**: each participating assistant answers Q1-Q8 independently, in its own
  file, without reading other Round-1 answers (avoid anchoring). One file per assistant.
- **Round 2**: Gemini and DeepSeek each read all Round-1 answers, produce their own
  consolidated position (agreements, disagreements with evidence, recommendation), then
  reconcile into one consensus document with explicit open items for the owner.
- The owner decides; no decision is recorded before that. The current course-correction
  package (PROTO-DEC-0036..0039) remains implemented but *not committed and not
  finally accepted* until the owner rules on this council output.

## 7. Inputs

`2026-09-19-h1-pilot-design.md`, `2026-09-19-h1-pilot-report.md` and its correction,
`...-h1-pilot-postmortem-and-repomix-paths.md`, `...-deepseek-flash-mcp-selection-analysis.md`,
`...-gemini-mcp-candidates-deep-research.md`, `...-mistral-mcp-candidates-research.md`,
`PROTO-DEC-0033` (reopen taxonomy), `0034` (C2 policy), `0035` (stop rule),
`0036` (closure), `2026-09-19-owner-rulings-course-correction.md`, the council prompt
`2026-09-19-universal-council-prompt-mcp-context-layer.md`, and this file.

## 8. Non-negotiables while the council runs

- No MCP installation, no new tool adoption, no protocol edits, no commits; the freeze
  of `PROTO-DEC-0039` holds.
- Do not touch `codex-*` files (parallel GPT/Codex task).
- Any participant that lacks filesystem access answers as an advisory transcription
  under its own name; advisory output never satisfies a gate.
