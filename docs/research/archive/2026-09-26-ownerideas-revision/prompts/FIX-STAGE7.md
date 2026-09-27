# Stage-7 fix (Claude): correct the package defects the DeepSeek pre-check found

Read `COMMON.md` first. The stage-7 pre-check (`round7/PRE-CHECK-DEEPSEEK.md`) returned
`Verdict: BLOCKING` with three named findings (B1, B2, B3) and one overlap failure
(`protocol-manifest.json` changed by both W1 packages). You fixed the five packages and the
resolution; you own this correction. You decide nothing new: the fix stays inside the accepted
architecture, scope, streams and certification routes.

## Inputs

- `round7/PRE-CHECK-DEEPSEEK.md` (the findings; each has a path, a reproduction and a minimal fix);
- `round6/FINAL-RESOLUTION-CLAUDE.md` and `round6/packages/PKG-1.md` .. `PKG-5.md`;
- `round5/CRITIQUE-KIMI.md`, `round5/CRITIQUE-MIMO.md`; PROTO-DEC-0079..0086;
  `docs/research/FRAMES.md` (F-06 is CLOSED; the archive holds the migrated files);
  `docs/research/2026-09-26-ownerideas-revision/USAGE.md` and
  `docs/research/2026-09-26-model-layer/USAGE.md` (real rows only - no invented values).

## What to do

1. Fix every BLOCKING finding B1..B3 with the minimal edit; keep each package's contract fields
   intact and the text deterministic.
2. Resolve the W1 overlap: `protocol-manifest.json` must not be edited by both packages in the
   same wave. Choose one owner (or move the edit to a later wave) and record the decision in the
   resolution's stream/wave table; the other package gets an integration condition instead of an
   edit.
3. Do not touch the archive: archive paths are provenance-only (PROTO-DEC-0085 item 5). If a
   fixture is needed, require a copy under an Allowed path (for example `tests/fixtures/`), created
   by the package that owns it.
4. Do not change: the five-package count, the E1/E2 assignment, the risk classes, the certification
   routes, the executor dimensions, or PROTO-DEC-0079..0086.
5. Update `round6/FINAL-RESOLUTION-CLAUDE.md` only where the fix changes it (the wave/overlap table
   and any citation), and append a `## Fix log` line per finding: `B<n> -> <file>:<what changed>`.

## Outputs

- The corrected `round6/packages/PKG-*.md` and, if needed, `round6/FINAL-RESOLUTION-CLAUDE.md`;
- `round7/FIX-CLAUDE.md`: one row per finding (B1..B3 and the overlap) with the fix and the
  reproduction that now passes; at most 80 lines; header `Mode: ADVISORY`, `Baseline: d4c8f3c`,
  `Reviewer: Claude Opus 5.5, route claude CLI, effort high`, `Verdict: FIX COMPLETE`.

Protocol: session start, five-label journal, `record --quick`; no commits, no edits outside
`round6/`, `round7/FIX-CLAUDE.md` and your journal.
