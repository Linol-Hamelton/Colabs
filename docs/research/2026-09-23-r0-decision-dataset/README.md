# R0 offline decision dataset

This dataset is a conservative extraction of existing Colabs history. Every data row carries a source path; archive rows also carry the source line in `INDEX.md`. CSV files are UTF-8 with a header.

## Files and row counts\n\n- `archive_classification.csv`: **180 rows**.\n- `review_depth.csv`: **3 rows**.\n- `findings.csv`: **17 rows**.\n- `round_outcomes.csv`: **5 rows**.\n
- `archive_classification.csv`: archive-index mappings parsed from `docs/reviews/archive/INDEX.md` (including duplicate historical mappings).
- `review_depth.csv`: only explicit depth statements and observed certifier counts. `single_statement` is included once as a policy statement, not as proof of a completed task-level application.
- `findings.csv`: explicit finding/disposition rows transcribed from the Codex paired-cycle audit and DeepSeek R1-R8 disposition table.
- `round_outcomes.csv`: explicit round/wave labels and terminal outcomes found in review artifacts. Labels such as “final report after Waves A/B/C” are preserved instead of converted to an invented integer.

## What it can support

The dataset supports provenance-aware inspection of archived-versus-active review records, a small labeled sample of review-depth policy/application, known findings with recorded dispositions, and explicit historical round outcomes. It can support schema design, source traceability checks, and offline evaluator prototyping where missing labels are treated as missing.

## What it cannot support

It is not a complete task census, a reliable estimate of reviewer recall, a causal comparison of full-pair versus single-statement review, or a complete count of rounds for every task. The archive index records movement, not the substantive classification rationale. Review files are heterogeneous and many do not state depth or a terminal round count. Findings are sampled from explicit tables, not exhaustively reconstructed from every review. No model is called, no outcome is evaluated, and no row without a source is included.
