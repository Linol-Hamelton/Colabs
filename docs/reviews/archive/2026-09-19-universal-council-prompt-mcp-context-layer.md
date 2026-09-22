# Universal Council Prompt - MCP / Context Layer (1-2 Rounds)

**Date**: 2026-09-19
**Prepared by**: deepseek-flash, controller session
**Purpose**: one self-contained prompt for the owner to dispatch to every participating
assistant. The council decides nothing; it produces evidence-graded opinions that the
two main experts (Gemini and DeepSeek) will reconcile into one consensus for the owner.
**Basis file (read or paste alongside)**: `docs/reviews/2026-09-19-mcp-context-layer-discussion-basis.md`

---

## PROMPT - copy from here

**Role**: You are one independent participant in a universal audit council for the
repository `D:\Colabs` (remote `github.com/Linol-Hamelton/Colabs`), home of the AI
Collaboration Protocol - a multi-assistant coordination process installed into the
owner's product repositories. The owner has reopened, as a question, the earlier
decision to close the Repomix/MCP track (`PROTO-DEC-0036`), because he believes the MCP
context layer was never implemented or tested as he originally designed it.

**Your task**: answer the eight questions below independently, with evidence and
explicit uncertainty. You may read any file in the repository if you have filesystem
access. Do not install anything, do not modify the repository, do not commit. If you
have no filesystem access, answer from the material in this prompt and say so.

### 1. Verified context (do not re-litigate without evidence)

| Fact | Value |
|---|---|
| Repository | AI Collaboration Protocol; kernel `.ai/bin/*.cjs` 2,826 lines; `validate-protocol.ps1` 778 lines; tests 4,544 lines / 255 subtests |
| H1 pilot arms | A control; B Repomix CLI raw digest (ran); C Repomix MCP `--sandbox` (**never ran**); D Serena (never); E review index vs Qdrant (never) |
| Arm B result | broad total tokens +72.79% (fresh +9.10%); narrow +60.20% (fresh +42.76%) vs control |
| Stop rule | executed as written: no MCP adoption, Arm C cancelled; `PROTO-DEC-0036` closed Track C, `Reopen-trigger: owner-directive`; `PROTO-DEC-0034` advisory CLI helper remains |
| Kernel size | 88,082 raw tokens / 18,223 compressed for the full kernel+tests set; core4 21,797 / 3,909 |
| Real context pool | prose history dominated (`docs/reviews/**` was ~228k tokens before the archive; now 62 files / ~784 KB, bounded and indexed); `ARCHIVE.md` ~37k; journals ~25k |
| Repo content | no `.ipynb`, `.csv`, `.h5` files (verified); this is not a notebook repository |

**What was falsified**: a raw, whole-kernel, pre-generated monolithic digest used as the
primary orientation artifact, on the 12-task H1 set, for the tested subjects.
**What was never tested**: selective `--include` packaging; compressed digest for
orientation; MCP server mode (Arm C); Serena symbolic navigation; a Kindex-style
decision graph; Qdrant with payload filters; the enforced overview->detail habit;
digest staleness discipline.

### 2. The owner's design intent (as he states it)

A structured, layered context system - not a repository dump:
(1) selective packaging with preprocessing; (2) symbolic navigation (Serena) for
overview->detail; (3) filtered semantic retrieval (Qdrant, payload filters by
path/language); (4) long-term decision memory (Kindex). Three chat analyses he collected
agree that "Repomix full-repo" was the wrong application and propose these layers.
**Note for honesty**: the third, which the owner identifies with, diagnoses the problem
as notebook bloat (`nbstripout`, `jupytext`, T4/Drive, experiment isolation). That
diagnosis does not apply to this repository (no notebooks). Assess the layer
architecture, not the notebook story.

### 3. Questions (answer all eight)

- **Q1.** Did H1 Arm B validly test the owner's intended design, or was it a strawman?
  State exactly what the data falsifies and what it cannot touch.
- **Q2.** For each layer (selective pack / symbolic navigation / decision graph /
  filtered search): on THIS repository, what is the plausible mechanism of a net
  token-or-accuracy win over `rg` + targeted reads + the new bounded, indexed corpus?
  Predict magnitude and name the tasks where it would show.
- **Q3.** Design the minimal cheap experiment that could settle it: arms, task set,
  pre-registered acceptance thresholds, model subjects, cost ceiling, wall time.
  Constraints: free/local subjects for test runs; at most one MCP server live at a
  time; total tool-schema <= 1,500 tokens; no auto-install in hooks; tool output is
  advisory and can never be Evidence or a gate input; nothing committed before the
  owner rules.
- **Q4.** Serena: is LSP symbol navigation worth it for a 2,826-line JS kernel plus a
  778-line PowerShell validator on Windows? Address PowerShell LSP weight, the GPL-3.0
  application license, and that kernel edits are few and surgical.
- **Q5.** Kindex: what does a decision graph add over `rg` across a deterministic
  `DECISIONS.md`/`PLAN.md`/INDEX corpus of ~15k tokens? Give a concrete scenario where
  it changes an outcome, or say it does not.
- **Q6.** Qdrant: is semantic retrieval justified over a bounded, indexed archive?
  Specify payload filters and a staleness rule that make it trustworthy, or show that
  a deterministic index file is sufficient.
- **Q7.** Governance: if reopening is warranted, what is the correct path (new
  PROTO-DEC superseding 0036 with `owner-directive`, revised falsifiers/thresholds)?
  What must stay frozen regardless (PROTO-DEC-0039 freeze, consumer pilots, no new
  gates)?
- **Q8.** Falsifiers both ways: what evidence would prove the intended stack works, and
  what would close the question for good? Name the cost ceiling beyond which the answer
  is "not worth it" on a single-developer repository.

### 4. Rules for your answer

1. Evidence first: cite paths, commands, measured numbers; mark every projection as a
   projection. "I agree with the majority" is not an answer.
2. Distinguish: measured / inferred / unknown. No invented tool capabilities - if you
   cannot verify a tool, say so.
3. Prefer small numbers: if you recommend an experiment, state its token/time cost and
   what a null result would mean.
4. Do not propose new protocol gates, monitors, or mandatory tooling. Advisory only.
5. Output: one file (if you have filesystem access) named
   `docs/reviews/2026-09-19-council-mcp-<your-name>.md`, marked
   `Mode: ADVISORY`, with your verdict on reopening Track C
   (`REOPEN` / `KEEP CLOSED` / `REOPEN ONLY IF <condition>`), answers to Q1-Q8,
   uncertainty list, and <= 250 lines. Without filesystem access, return the same
   content as text for the owner to transcribe with a provenance note.

### 5. Round structure

- **Round 1**: every participant answers independently; do not read other Round-1
  answers.
- **Round 2**: Gemini and DeepSeek each read all Round-1 answers and write their own
  consolidated position (agreements; disagreements with evidence; recommendation), then
  reconcile into a single consensus document with explicit open items. The owner makes
  the final ruling; nothing is recorded in `DECISIONS.md` before that.

## END OF PROMPT

---

## Owner notes (do not paste)

- Dispatch Round 1 to: DeepSeek, Gemini, GPT/Codex, GLM, Qwen, Mistral (and any other
  participant with repository access). The parallel Codex task owns only its own files;
  other participants must not overwrite `codex-*` artifacts.
- After Round 1, give Gemini and DeepSeek the collected answers and this file's section 5
  for Round 2; the consensus goes to you for the ruling on `PROTO-DEC-0036`.
- The technical implementation audit of the course-correction package is a separate
  track (`2026-09-19-course-correction-adversarial-audit-prompt.md`, round 1 FAIL,
  round 2 in progress) and does not substitute for this council.
