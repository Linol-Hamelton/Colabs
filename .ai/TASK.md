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
identity and context the hooks give. A `## Roles` section in this file names
who does what, written by the owner and injected into each session; nothing
assigns or rotates. Recorded as DEC-0019 and DEC-0020. Version 1.8.0, which
also closes the 1.6.1 against 1.6.2 mismatch.

## Roles

_Not yet assigned. The owner writes one line per assistant when a task starts._

## Open questions

1. The macroeconomic simulation came from a proposal written in another
   discussion and is not this project's goal. The goal is this tool itself: a
   collegial instrument for cross-review by several assistants. Nothing about
   the simulation was built or started.
2. Codex and Kimi are at their weekly limit and Gemini is not connected, so
   only Qwen and DeepSeek can take part today.
3. Journals accumulate one file per started session regardless of whether the
   session did anything. Two empty ones exist now; the limit of thirty is the
   only backstop and no archiving pass has run here.
4. The role line is advisory. An assistant that ignores it is not stopped,
   exactly as a missing journal entry is not stopped.

## Next

Owner names the first task for the council and writes the Roles section for it.
Qwen and DeepSeek are available now.
