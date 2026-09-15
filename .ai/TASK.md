# Current Task

Status: Pending - owner decides the council's first shared task
Owner: RuslanFomenko
Last update: 2026-09-16

## Objective

Assess the proposal to widen the council to Qwen, DeepSeek and later Gemini,
and build whatever that requires of this repository. The proposal's own subject
matter, a macroeconomic simulation, is a separate project and is not started
here.

## What was done

Reproduced the proposal in a throwaway copy: it fails validation immediately,
on a missing Status line and on CRLF in a pasted log under `.ai/`. Underneath
that, the engine refused every agent except Claude and Codex, so neither Qwen
nor DeepSeek could have taken part at all.

Participation is now open to any named assistant, and
`.ai/bin/protocol-session.cjs` gives one without hooks the same journal,
identity and context the hooks give. Recorded as DEC-0019. Version 1.7.0, which
also closes the 1.6.1 against 1.6.2 mismatch.

## Open questions

1. Where does the simulation project live? It needs its own repository with the
   protocol installed, as Block-Puzzle has. Its task, its knowledge base and its
   chat logs belong there, outside `.ai/`.
2. The proposal's split 0.43 / 0.2451 / 0.3249 sums to exactly 1.0 of gross
   value added, leaving nothing for intermediate consumption, materials or
   capital expenditure. It is presented as an invariant to encode. It is a
   modelling assumption and belongs in that project's DECISIONS before any code
   assumes it.
3. The proposal assigns one round to two assistants at once. The first pilot
   measured what that produces: two plans for one task. One implementer and one
   reviewer per round instead.
4. Codex and Kimi are at their weekly limit and Gemini is not connected, so the
   proposed three-round cascade cannot run as written today.
5. Journals accumulate one file per started session regardless of whether the
   session did anything. Two empty ones exist now; the limit of thirty is the
   only backstop.

## Next

Owner decides the simulation project's repository, then gives one bounded task
to one assistant with another reviewing.
