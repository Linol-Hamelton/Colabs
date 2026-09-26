# OwnerIdeas cleanup index

Append-only ledger of OwnerIdeas material taken out of the active corpus by the cleanup approved in
`docs/research/2026-09-26-ownerideas-revision/round3/RESOLUTION-CLAUDE.md` section 5. Line numbers
are those of the frozen baseline 7b6d17a; `git show 7b6d17a:<path>` returns the original text.

| Original | Action | Text now at | Line map |
|---|---|---|---|
| OwnerIdeas/MIGRATION.md | DELETE, content-identical copy | docs/research/2026-09-25-validator-migration-council/OWNER-PROMPT.md | line n -> line n |
| OwnerIdeas/SYNTHESIS-2026-09-25-cross-document.md | ARCHIVE, moved unchanged | docs/research/2026-09-26-ownerideas-revision/archive/SYNTHESIS-2026-09-25-cross-document.md | line n -> line n |
| OwnerIdeas/performers.md lines 138-1344 | DELETE, copy of benchmark.md | OwnerIdeas/benchmark.md lines 949-2154 | line n (139-1344) -> benchmark.md line n+810; lines 1-137 stay |
| OwnerIdeas/scripts.md lines 1-1515 | DELETE, truncated first copy | OwnerIdeas/scripts.md lines 1-1514 (formerly 1516-3029) | line n (1-1514) -> line n; line n (1516-3029) -> line n-1515 |
