# Launch: task:roadmap-w3-dig-gemini (Gemini 3.8 Flash high via agy, its own session)

Frame F-17, the DIG registry audit (advisory; no verdict, no certification). Work in the worktree
`D:\Colabs\.ai\runtime\w3` (branch `roadmap-wave3`). Your producer range:
**PROTO-DEC-0048..0067** (every numbered item of every decision in the range).

DISPATCH NOTE for the operator: do not start this session while the wave-2A agy executor runs; it
shares the client/quota and must not disturb the executor's exclusive suite scan.

## Output

- `docs/research/2026-09-27-roadmap-queue/drafts/DIG-GEMINI-0048-0067.md` - one row per numbered
  item: `| Item | Status | Proof (path or commit) | Note |` with Status built / partial / not built;
  the proof is a real `path:line` or commit sha (`-` when not built); counts at the top. Read the
  row format in `drafts/README.md`.
- Nothing else: no edits outside your drafts file, your journal and your evidence.

## Rules

- `node .ai/bin/protocol-session.cjs start --agent gemini`; use the printed owner name.
- Read-only on the repository: never edit `.ai/DECISIONS.md`, `docs/research/FRAMES.md` or any
  historical record. Verify every claim with a real path or commit; an invented path is the worst
  possible defect.
- Do **not** run `test-protocol.ps1` (no full suite); you may run `validate-protocol.ps1` once and
  `record --quick` at the end.
- Commit your files on this branch with explicit paths; do **not** push (the operator pushes).
- Journal: five labels plus your model/effort and usage.

## Method hint

`.ai/DECISIONS.md` is the source; each PROTO-DEC block lists numbered items. Classify each item:
"built" when the implementation exists in the tree (name the path or the commit), "partial" when
only part exists (say what is missing), "not built" otherwise. Where a decision names an artifact,
check it with `git grep`/`git log`; when a decision was superseded, say so in the note.
