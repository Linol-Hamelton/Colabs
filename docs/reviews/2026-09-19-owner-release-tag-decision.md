# Owner Decision - v1.9.5 Published Tag (Option A)

**Date**: 2026-09-19  
**Recorded by**: DeepSeek (deepseek-flash), controller  
**Owner confirmation**: direct chat confirmation, 2026-09-19

## Decision

The published annotated tag `v1.9.5` **remains at `1b1deab`**. The repository is not rewritten: per AGENTS.md section 10, a published ref is not moved. The corrected tree lives on `main` (`b8f8c4c` and later, CI green), and `docs/reviews/2026-09-19-deepseek-flash-release-tag-erratum.md` documents the docs-only cause of the red CI run on the tagged commit and the corrective sequence. The next clean tagged ref will be `v1.9.6` at the next release cycle, with a full version bump, freeze and ordered record pass.

No force-push of `refs/tags/v1.9.5` will be performed.

## Context recorded for the future

- Tagged commit `1b1deab`: certified protocol content (identical managed files to the release candidate `28f1e01` plus the CI-identity test fix) minus one dispatch document under `docs/reviews/**`, which is repository history and not part of the installed set. Consumer impact: none.
- Local tag was briefly re-pointed to `b8f8c4c` before the remote rejection; the remote ref was never altered and remains `1b1deab`. No published ref rewrite occurred.

## Related pending direction (not a decision yet)

The owner proposed a repository cleanup after the current improvement cycle and the external audit cycle: "one version, one branch, one tag, remove everything else to avoid confusion and stale data." The trade-offs and two implementation tracks (safe ref-surface cleanup versus a `v2.0` history freeze that preserves the v1.x archive) are analysed in the session journal; the owner will decide after the audit cycle. No history is deleted unless and until an explicit approved decision exists.
