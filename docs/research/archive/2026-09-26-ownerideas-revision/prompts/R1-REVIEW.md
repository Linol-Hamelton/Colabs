# Round 1 — independent review of the OwnerIdeas corpus

You are one of four independent reviewers (Gemini 3.8 Flash, Claude Opus 5.5, DeepSeek 4.1 Flash,
Mistral Medium 3.5). Read `COMMON.md` first. This file is your task. Your own conclusions only.

## 1. What you review

The 13 files of the owner's idea corpus (`CORPUS.md`) and their footprint in the current kernel:
decisions in `.ai/DECISIONS.md`; procedures and architecture under `docs/core-arch/`; implementation
(`.ai/bin/`, `validate-protocol.ps1`, `tests/`, `AGENTS.md`, `PROTOCOL.md`, hooks); earlier research
where it is needed to establish a status. Do not judge a document in isolation: for every
substantial idea establish what it became in the product.

## 2. The chain of maturity

    IDEA -> DECISION -> PROCEDURE/ARCHITECTURE -> IMPLEMENTATION -> VALIDATION/TESTS -> END-TO-END USE

A decision block does not mean the mechanism exists. A script does not mean it is wired into the
working cycle. A procedure does not mean the orchestrator calls it. For each idea mark the first
broken link (the break point).

## 3. Task 1 — missed layers, procedures, mechanisms

Find necessary layers, procedures, mechanisms or architectural elements proposed in OwnerIdeas that
were lost or not implemented while the first kernel stages were built. Focus on levels up to and
including L3: links between layers; missing transitions between procedures; undeclared interfaces;
mechanisms that exist as an idea without an end-to-end implementation; half-built workflows (part
of the mechanism exists, the full workflow does not). Do not count an idea as implemented because a
similar document exists.

Check L0–L3 explicitly against the corpus:

- **L0 governance**: base invariants; procedure lifecycle; stop/ask; source conflicts; decision
  changes.
- **L1**: roles; independence; rights; responsibility; ownership.
- **L2**: task characterization; task lifecycle; model/executor selection; acceptance; review;
  repair; workflow; assurance.
- **L3**: execution; dispatch; supervision; model discovery; routing; failover; locks; write
  coordination; tooling; deterministic automation.

For each level ask: is there an OwnerIdeas idea absent from the current architecture, or implemented
only in part?

## 4. Task 2 — cleanup candidates (classify only; delete nothing)

Mark DELETE/ARCHIVE CANDIDATE when the content: is fully implemented; is replaced by a newer
decision; is reflected in canonical kernel documentation or an accepted decision; describes a
finished vote or closed consensus; is an intermediate research artifact of a closed decision; is an
old certification of an accepted, implemented decision; contradicts a newer accepted decision; has
no standalone informational value. Nothing is deleted at this stage — classification and
justification only.

## 5. What stays

KEEP/ACTIVE when the idea is not implemented; remains architecturally relevant; has no canonical
replacement; closes a system gap; contains requirements absent from the kernel; especially L0–L3;
can materially affect later stages. For each: where it should live, which layer it belongs to, what
already exists, what is missing, and whether it needs a decision, research or implementation.

RESEARCH CANDIDATE when the idea looks valuable but lacks sufficient evidence; has several
reasonable architectural options; needs external data, benchmarks, experiments or comparative
tests; contains substantial uncertainty; affects several layers at once. Do not turn it into an
implementation task.

## 6. Reverse problem

Find old representations in OwnerIdeas that already contradict today's kernel. Mark them STALE or
SUPERSEDED with a reference to the current decision. These are dangerous: a new agent may read the
old text as current architecture.

## 7. Classification (exactly one main status per substantial item)

| Status | Meaning |
|---|---|
| `IMPLEMENTED` | fully implemented, with a canonical source |
| `PARTIALLY_IMPLEMENTED` | only part is implemented |
| `ACTIVE` | still relevant and still required |
| `RESEARCH_CANDIDATE` | needs a separate research frame |
| `SUPERSEDED` | replaced by a newer decision |
| `STALE` | obsolete, no longer matches the architecture |
| `DUPLICATE` | duplicates another canonical source |
| `DELETE_CANDIDATE` | can be deleted after confirmation |
| `ARCHIVE_CANDIDATE` | historically useful, must not stay active |
| `UNCLEAR` | not enough evidence to classify |

## 8. Evidence for IMPLEMENTED

Never write only "implemented". Give:

```
OwnerIdeas source: <file / section>
Canonical replacement: <decision / procedure / implementation / documentation>
Evidence: <path(s)>
Status: IMPLEMENTED
```

Without a canonical replacement the idea is not fully implemented.

## 9. Evidence for PARTIALLY_IMPLEMENTED

Show the gap: `Idea`, `Existing`, `Missing`, `Status`. These items matter most.

## 10. Report structure (required, in this order)

```
## 1. Executive summary
## 2. Inventory reviewed
## 3. Implemented ideas
## 4. Partially implemented ideas
## 5. Missing L0–L3 mechanisms
## 6. Research candidates
## 7. Superseded / stale material
## 8. Delete candidates
## 9. Archive candidates
## 10. Contradictions between OwnerIdeas and current kernel
## 11. Highest-value omissions
## 12. Uncertain classifications
## 13. Recommended next actions
```

Put the required header from `COMMON.md` at the top of the file.

## 11. Required summary table

| Source | Idea | Related layer | Current implementation | Canonical source | Status | Action | Confidence |
|---|---|---|---|---|---|---|---|

`Action`: KEEP | RESEARCH | COMPLETE. `Confidence`: high | medium | low, with a one-line reason when
not high.

## 12. Quality bar

- Every idea that matters gets its own row; group only truly identical items.
- Quote the OwnerIdeas source briefly (file + section heading) so a synthesiser can locate it.
- Prefer tables; no filler, no restating the corpus.
- Name minority or uncertain items explicitly; never hide a disagreement you cannot settle.
- Do not read the other reviewers' reports and do not use their conclusions.
