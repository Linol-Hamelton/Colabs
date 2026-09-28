# Launch: task:bench-catalog-B (codex, GPT-5.6 Luna; collector B of 2)

Frame F-18 (S2 minor; admission in `docs/research/2026-09-28-bench-catalog/README.md`). Work in the
worktree `D:\Colabs\.ai\runtime\catalog` (branch `bench-catalog`).

## Scope (collector B: implementation, code quality, security, review)

The HumanEval/MBPP line and its successors, RepoBench, BigCodeBench, Codeforces/CodeElo, security
benchmarks (Cybench, SecBench and successors), review and verification benchmarks, plus
contamination studies for the above.

## Output

`docs/research/2026-09-28-bench-catalog/CATALOG-B.jsonl` - one JSON object per line, keys:
`id`, `benchmark`, `url`, `accessed` (date), `maintainer`, `status`
(`active` | `stale` | `unknown`), `measures` (what it measures), `dimension`
(`D-IMPL` | `D-ARCH` | `D-DEBUG` | `D-SEC` | `D-REVIEW` | `D-SYN` | `POSSIBLE_FUTURE_DIMENSION`),
`contamination_risk` (`low` | `medium` | `high` | `unknown`), `scores` (array of
`{"model", "score", "source_url"}` - the model id exactly as the source writes it), `notes`.

Also write `docs/research/2026-09-28-bench-catalog/COVER-B.md`: one line per benchmark with its
evidence (file or URL), so the cover check can run.

## Rules

- Public sources only (paper page, leaderboard, repository, model card). No invention: a value that
  is not in a source stays `unknown`.
- Every score carries its source URL and access date; vendor claims are marked as vendor claims in
  `notes`.
- No web tooling beyond plain HTTP where the environment allows; if a source is unreachable, record
  the benchmark with `status: unknown` and the attempted URL in `notes`.

## Session rules

- Start your protocol session (hooks may have done it); use the printed or injected owner name.
- Journal with the five labels plus model/effort/usage; then
  `node .ai/bin/protocol-handoff.cjs record --quick --owner <owner>`.
- Do NOT commit: the operator collects and commits both collectors' files. Do not push.
- No decisions, no verdicts: collection only.
