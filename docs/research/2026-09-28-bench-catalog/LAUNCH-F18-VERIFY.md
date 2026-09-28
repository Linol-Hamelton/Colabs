# Launch: F-18 verification (MiMo-V2.6-Pro, 20% sample; frame F-18)

Verifier: you (MiMo-V2.6-Pro via the mimo CLI, variant high, auto-approval in this disposable
worktree). Worktree `.ai/runtime/catalog`, branch `bench-catalog`; cwd = this folder's repository
root. One session; no sub-sessions. You are the independent verifier of frame F-18
(`docs/research/2026-09-28-bench-catalog/README.md`); you are not a producer of the catalog and you
edit none of the CATALOG files.

## Context

The exit artifact is `docs/research/2026-09-28-bench-catalog/CATALOG.jsonl` (48 rows = the
mechanical merge of CATALOG-A.jsonl, 18 rows by vibe/Mistral Medium 3.5, and CATALOG-B.jsonl,
30 rows by codex/GPT-5.6 Luna; merge note in `MERGE-NOTE.md`; the operator's cover/dup check in
`COVER-DUP.md` found 0 duplicate ids and 0 duplicate normalized names). The frame rules: public
sources only; a model score is recorded only when the source states it, with the model id exactly
as the source writes it; no value is invented - unknown stays unknown.

## Task

Verify a **20% sample = 10 rows** of `CATALOG.jsonl`, chosen deterministically by file order: rows
5, 10, 15, 20, 25, 30, 35, 40, 45 and the final row (48). For each sampled row:

1. Open the row's `url` and every `scores[].source_url` (public web sources; if a fetch tool is
   unavailable, say so and verify what the repository holds instead: COVER-A.md / COVER-B.md).
2. Judge: the benchmark's existence, owner/maintainer, active/stale, what it measures, the
   dimension classification and the contamination risk - and every recorded score: is the value
   and the model id actually stated by the cited source?
3. Verdict per row: **CONFIRM** (value and source check out), **REJECT** (wrong; cite the
   counter-evidence URL and what is wrong), **UNSURE** (source unreachable or ambiguous; give the
   HTTP status or the reason). One line of reasoning per row.
4. A REJECT requires the counter-evidence; do not invent values; "unknown" is a valid outcome.

## Deliverable

- `docs/reviews/2026-09-28-mimo-bench-catalog-verification.md`, at most 250 lines: header per
  `templates/reviews/REVIEW.md` (baseline = `git rev-parse HEAD` of `bench-catalog` when you start,
  which is the commit that adds this file; Mode: CERTIFYING with your
  `Receipt-Owner` from `node .ai/bin/protocol-session.cjs start --agent mimo`), the sampled rows,
  per-row verdicts with the evidence URLs you actually opened, the totals
  (CONFIRM / REJECT / UNSURE), and an explicit overall verdict: RECOMMENDATION if no sample row has
  a wrong value, FAIL if any does. Then your journal entry (five labels) and
  `node .ai/bin/protocol-handoff.cjs record --quick --owner <your session>`.
- Commit on `bench-catalog` with explicit paths (the review + your journal). Do NOT push; do not
  edit CATALOG.jsonl, CATALOG-A/B.jsonl, COVER files or `MERGE-NOTE.md`; no merge into `v2.0.0`.
- If you need a file outside `docs/reviews/` and `.ai/worklog/`, STOP and write the blocker to your
  journal.
