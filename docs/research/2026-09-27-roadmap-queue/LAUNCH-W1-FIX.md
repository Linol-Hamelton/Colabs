# Launch: task:roadmap-w1-fix (one fix round; Gemini 3.8 Flash high via agy)

Program: ROADMAP-1, wave 1. The independent review returned `RECOMMENDATION`:
`docs/reviews/2026-09-27-deepseek-roadmap-w1-review.md`. You execute the wave's single fix round
(PROMPT.md budget: review plus at most one fix round). Read that review file first - it is the
spec for F-001, F-002, F-004 and F-006.

## Session rules (same as the wave)

- `node .ai/bin/protocol-session.cjs start --agent gemini`; use the printed owner name.
- `.ai/ARCHIVE.md` is edited only under `protocol-lock.cjs acquire --owner <your owner>, and
  append-only: add at the END of the file, never modify existing archived text.
- Do not touch `.ai/bin/`, `tests/`, `docs/specs/`, `.ai/docs/clients.json`, `CLOSURES.jsonl`
  (append-only ledger; leave F-003 as a note), `FRAMES.md`, or any review file.
- `git add` names explicit paths; no force/rebase/amend; do not push. One commit for the fix round,
  message: `fix(research): ROADMAP-1 wave-1 fix round - restore archived journal preambles and report wording`.
- End: five-label journal entry + `record --quick`; run `validate-protocol.ps1` once and confirm
  `0 warning(s)`.

## Fixes

1. **F-001 (MEDIUM, the main fix).** `.ai/ARCHIVE.md` kept only the dated entries of the 28 archived
   journals; the per-journal preamble (the `# Worklog:` header and boilerplate, and for seven
   journals the `Launch:`/`Orientation:` model-effort-route lines) was dropped when the source files
   were removed - against "archived whole" and AGENTS.md section 8.
   - Under the lock, append ONE new section at the end of `.ai/ARCHIVE.md`, e.g.
     `## Restored journal preambles (2026-09-27, wave-1 fix round)`.
   - For each of the 28 journals listed in `W1-EXECUTION.md` section 2, take its preamble from git:
     `git show f4e95c7^:.ai/worklog/<name>` - everything before its first dated entry.
   - Add a subsection per journal (`### <journal-name>`) with the preamble text verbatim (the seven
     `Launch:`/`Orientation:` provenance lines must be preserved); if a preamble is boilerplate
     only, still record it - nothing is dropped.
   - Do not restructure or rewrap; append only.
2. **F-002.** In `BASELINE.md`, correct the sampler-interval claim (the review measured about
   1.21 s per sample): state the requested 800-1000 ms sleep and the observed mean including scan
   overhead, or simply reword to the observed figure.
3. **F-004.** In `W1-EXECUTION.md`, the archived-journal count text is off by one (the review names
   it); correct the numbers to the true worklog counts (126 before the archive, 99 after;
   100 including the reviewer journal).
4. **F-006 (minor).** Remove the double blank lines the review names in the worklog README
   (`worklog/README.md`) if present; leave any text intact.

The review's F-003 (a blank line in `CLOSURES.jsonl`) and F-005 (the LAUNCH-W1 receipt placeholder)
are left as noted; do not edit those files.

## Deliverable

- One commit with the fix; `W1-EXECUTION.md` gets a short "Fix round" note (what changed for
  F-001/F-002/F-004/F-006) as part of the same commit, or a separate short section appended to it.
- Journal + record --quick; no push (the operator pushes).
