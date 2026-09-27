# Launch: task:roadmap-w3-dig-deepseek (DeepSeek Flash via kilo, its own session)

Frame F-17, the DIG registry audit (advisory; no verdict, no certification). Work in the worktree
`D:\Colabs\.ai\runtime\w3` (branch `roadmap-wave3`). Your producer range:
**PROTO-DEC-0068..0086 and A-1..A-14** (every numbered item of every decision, plus every A-item).

## Output

- `docs/research/2026-09-27-roadmap-queue/drafts/DIG-DEEPSEEK-0068-0086.md` - one row per numbered
  item: `| Item | Status | Proof (path or commit) | Note |` with Status built / partial / not built;
  the proof is a real `path:line` or commit sha (`-` when not built); counts at the top. Read the
  row format in `drafts/README.md`.
- Nothing else: no edits outside your drafts file, your journal and your evidence.

## Rules

- `node .ai/bin/protocol-session.cjs start --agent deepseek`; use the printed owner name. This
  session is yours alone; the operator session is not involved.
- Read-only on the repository: never edit `.ai/DECISIONS.md`, `docs/research/FRAMES.md` or any
  historical record. Verify every claim with a real path or commit; an invented path is the worst
  possible defect.
- Do **not** run `test-protocol.ps1` (no full suite); you may run `validate-protocol.ps1` once and
  `record --quick` at the end.
- Commit your files on this branch with explicit paths; do **not** push (the operator pushes).
- Journal: five labels plus your model/effort and usage.

## Sources

- `.ai/DECISIONS.md` for PROTO-DEC-0068..0086 (numbered items per block).
- The A-items A-1..A-14: the table in
  `docs/research/archive/2026-09-26-ownerideas-revision/round6/FINAL-RESOLUTION-CLAUDE.md`
  (section 5; section 7 carries the RESOLUTION notes). Classify each A-item the same way.
