# Round 2 — two independent syntheses of the frozen OwnerIdeas revision

Read `COMMON.md` first (mode, language, protocol, required header). This file is your task. You are
one of two synthesisers: Synthesis A is Kimi K2.7 Code HighSpeed; Synthesis B is MiMo-V2.6-Pro.
Work only from the frozen corpus. Do not read the other synthesiser's output, and do not read
anything under `round2/` except `CORPUS.txt` and the files it lists.

## Frozen corpus

`round2/CORPUS.txt` lists 17 files with their sha256: the 13 `OwnerIdeas/` sources and the four
round-1 reviews (`round1/REVIEW-CLAUDE.md`, `-DEEPSEEK.md`, `-GEMINI.md`, `-MISTRAL.md`). Verify the
hash of every file before using it. If a file does not match, do not synthesise: write an OPEN
QUESTION with the mismatch and stop.

## Task

For every substantial item in the union of the four reviews' summary tables, build one row and show:

- the OwnerIdeas source (file + section) and the layer;
- each reviewer's status and action, quoted from that reviewer's own table;
- how many reviewers agree and the agreement category;
- whether there is consensus or substantial disagreement;
- the quality of the underlying evidence (a canonical path or decision id, or only a claim);
- your own assessment and what you would do with the item.

Agreement categories (use exactly):

    4/4 CONSENSUS
    3/4 STRONG CONSENSUS
    2/4 SPLIT
    1/4 MINORITY FINDING
    UNRESOLVED

Rules:

1. `4/4` or `3/4` does not replace evidence. Mark any consensus that rests only on the same weak
   source.
2. Never silently drop a minority: if one reviewer presents stronger evidence, preserve it and say
   so.
3. Where reviewers contradict each other on a classification, show both sides and the evidence each
   cites; do not invent a middle ground without evidence.
4. Do not decide cleanup; this stage aggregates. Claude resolves the boundary later.
5. Do not add new hypotheses about the OwnerIdeas content.
6. Spot-check canonical sources that the reviews cite (a path exists, a decision block exists) and
   mark the check result.

## Required output structure

```
Mode: ADVISORY
Baseline: 7b6d17a; working tree status: <clean|dirty>
Reviewer: <model>, route <client>, effort <value|unknown>, <UTC date>
Scope: <one line>
Verdict: REVIEW COMPLETE
```

    ## 1. Executive summary
    ## 2. Frozen corpus and method (hash-check result)
    ## 3. Consensus register (4/4 and 3/4), with evidence quality
    ## 4. Splits (2/4) and minority findings (1/4), preserved with evidence
    ## 5. Unresolved items
    ## 6. Aggregated classification counts per status and per L0–L3 level
    ## 7. Contradictions between the four reviews
    ## 8. Cleanup signals (aggregate only; no decisions)
    ## 9. Active and research signals for the next stages
    ## 10. Own assessment and open questions
    ## Full item table

## Full item table (required; one row per substantial item)

| # | Source | Idea | Layer | Gemini | Claude | DeepSeek | Mistral | Agreement | Evidence quality | Own assessment |
|---|---|---|---|---|---|---|---|---|---|---|

The four reviewer columns carry the exact status labels from the reviews.

## Quality bar

- Every number in the counts must be reproducible from your table.
- Cite paths and decision ids; label claims FACT / INFERENCE / OPEN QUESTION as in `COMMON.md`.
- Prefer tables; no filler, no restating the reviews.
- Write exactly one output file, the path your launch file names.
