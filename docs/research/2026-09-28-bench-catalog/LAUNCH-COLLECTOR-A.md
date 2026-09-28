# Launch: task:bench-catalog-A (vibe, Mistral Medium 3.5; collector A of 2)

Frame F-18 (S2 minor; admission in `docs/research/2026-09-28-bench-catalog/README.md`). Work in the
worktree `D:\Colabs\.ai\runtime\catalog` (branch `bench-catalog`).

## Scope (collector A: general, reasoning, agentic)

MMLU-Pro and successors, GPQA, ARC-AGI, HLE, AIME/OMEGA-style math, SWE-bench Verified and its
variants, LiveCodeBench, SWE-Lancer, OSWorld, tau-bench, GAIA.

## Output

`docs/research/2026-09-28-bench-catalog/CATALOG-A.jsonl` - one JSON object per line, keys:
`id`, `benchmark`, `url`, `accessed` (date), `maintainer`, `status`
(`active` | `stale` | `unknown`), `measures` (what it measures), `dimension`
(`D-IMPL` | `D-ARCH` | `D-DEBUG` | `D-SEC` | `D-REVIEW` | `D-SYN` | `POSSIBLE_FUTURE_DIMENSION`),
`contamination_risk` (`low` | `medium` | `high` | `unknown`), `scores` (array of
`{"model", "score", "source_url"}` - the model id exactly as the source writes it), `notes`.

Also write `docs/research/2026-09-28-bench-catalog/COVER-A.md`: one line per benchmark with its
evidence (file or URL), so the cover check can run.

## Rules

- Public sources only (paper page, leaderboard, repository, model card). No invention: a value that
  is not in a source stays `unknown`.
- Every score carries its source URL and access date; vendor claims are marked as vendor claims in
  `notes`.
- Check the vibe log for "falling back" before recording a model label; record the model honestly
  (requested `glm-5-3`, ran `mistral-medium-3.5` while the alias is unresolved; PROTO-DEC-0094 B.1).

## Session rules

- `node .ai/bin/protocol-session.cjs start --agent mistral`; use the printed owner name.
- Journal with the five labels plus model/effort/usage; then
  `node .ai/bin/protocol-handoff.cjs record --quick --owner <owner>`.
- Do NOT commit: the operator collects and commits both collectors' files. Do not push.
- No decisions, no verdicts: collection only.
