# Stage 3 — Claude resolution over the frozen OwnerIdeas revision

Read `COMMON.md` first. Your inputs are frozen in `round3/CORPUS.txt`: the 13 `OwnerIdeas/` sources,
the four round-1 reviews (`round1/REVIEW-*.md`) and the two round-2 syntheses
(`round2/SYNTHESIS-KIMI.md`, `round2/SYNTHESIS-MIMO.md`). Verify every hash before use. You are the
resolver: you fix which classifications stand, which uncertainties stay open, and what work follows.

## Method

1. Both syntheses are advisory and independent; neither saw the other.
2. Check every consensus claim against the four reviews. Where a synthesis drops or weakens a
   minority finding, restore it with its evidence.
3. Resolve label conflicts by evidence rules, not by vote: a canonical path or decision id beats
   prose; an accepted decision beats an unbuilt idea; `PARTIALLY_IMPLEMENTED` wins over
   `IMPLEMENTED` whenever the end-to-end chain is broken - state the break point.
4. Do not add new hypotheses about the OwnerIdeas content; judge what is there.
5. Name what you could not verify; never guess.

## Required decisions

- **Cleanup list.** For every candidate: DELETE, ARCHIVE or KEEP, with paths, a one-line
  justification and the canonical replacement where one exists. Separate whole-file actions from
  intra-file duplicate blocks (for example near-copies inside `performers.md` and `scripts.md`):
  for a cut, give the exact path and line range plus the evidence that it is a duplicate.
  Gemini executes only what this list approves; nothing is deleted by this stage.
- **Active list.** Ideas that stay active, each with its layer (L0-L3), where it should live, what
  already exists, what is missing, and whether it needs a decision, research or implementation.
- **Research list.** Ideas that go to separate research frames, each with the open question and the
  evidence gap, and the layers it touches.
- **Unresolved questions.** Preserve genuine disagreement verbatim; do not paper over it.
- **Handoff briefs.** One for Gemini (cleanup: bounded, no new architecture decisions, check for
  dangling references after removal, keep canonical sources). One for DeepSeek (a single executable
  plan: active ideas, L0-L3 gaps, approved research directions, dependencies, implementation order).

## Required output structure

```
Mode: ADVISORY
Baseline: 7b6d17a; working tree status: <clean|dirty>
Reviewer: Claude Opus 5.5, route claude CLI, effort xhigh, <UTC date>
Scope: <one line>
Verdict: REVIEW COMPLETE
```

    ## 1. Executive summary
    ## 2. Inputs and verification (hash checks)
    ## 3. Synthesis comparison (where the two agree and disagree)
    ## 4. Corrected consensus register with surviving evidence
    ## 5. Final cleanup list (DELETE / ARCHIVE / KEEP, paths and line ranges)
    ## 6. Final active list (L0-L3)
    ## 7. Research list
    ## 8. Unresolved questions
    ## 9. Handoff to Gemini (cleanup brief)
    ## 10. Handoff to DeepSeek (plan brief)

## Quality bar

- Every decision cites evidence (path, decision id or hash-checked input).
- No new hypotheses; minority findings preserved.
- The cleanup list must be executable by a bounded agent with no architectural judgement.
