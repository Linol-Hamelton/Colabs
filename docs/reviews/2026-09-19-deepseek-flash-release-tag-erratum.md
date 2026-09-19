# v1.9.5 Published Tag - Erratum

**Date**: 2026-09-19  
**Author**: DeepSeek (deepseek-flash), controller/auditor  
**Status**: For the record; no action required for protocol consumers.

## What happened

- The annotated tag `v1.9.5` was published pointing at `1b1deab` (the CI-identity hotfix commit). Its CI run `35426557990` failed in 28 seconds: `gate-check` reported Claude Opus's receipt as stale because that tree does not contain `docs/reviews/2026-09-19-gemini-trackc-m0-c2-prompt.md`, which was present in the working tree when the final receipts were recorded.
- The next commit on `main`, `b8f8c4c` ("docs: Track C dispatch prompt and delta receipt"), restores the recorded tree; its CI run `35426648648` is **green** (3m31s, validator with the gate active plus the 241-test suite).
- The local tag was re-pointed to `b8f8c4c`; the remote tag push was rejected because the published ref already existed; the remote `refs/tags/v1.9.5` remains at `1b1deab`.

## Root cause

A controller freeze-ordering error: the confirmatory record pass ran while an untracked but digest-visible file (the Track C dispatch prompt) was in the working tree, and the release commit pathspec excluded that file. The committed tree therefore differed from the tree the receipts anchored (digest `98a8061f`), so `gate-check` correctly refused it in CI.

## Impact

Docs-only. The tagged commit contains the same managed protocol files as the certified release candidate `28f1e01` plus the CI-identity hotfix; `docs/reviews/**` is repository history, not part of the installed protocol set. No consumer-facing behavior differs between `1b1deab` and `b8f8c4c`.

## Resolution

- Per AGENTS.md section 10, a published ref is not rewritten: `v1.9.5` stays at `1b1deab`. `main` carries the corrected tree at `b8f8c4c` with a green CI run.
- The next release (planned `v1.9.6`, after Track C) will be the clean tagged ref with a full version bump, freeze and record pass.
- If the owner instead chooses to re-point the published tag to `b8f8c4c`, that is an explicit owner exception; it must be recorded with the rationale, and the tag force-push is the only operation needed.

## Lessons recorded

1. The freeze checklist must enumerate **every digest-visible file, including untracked ones**, in the commit pathspec; trimming the commit set after the record pass invalidates the receipts.
2. CI must be checked to completion for every release-line push; a green local run and a green intermediate run do not prove the tagged commit.

## References

- Hotfix audit: `docs/reviews/2026-09-19-deepseek-flash-ci-hotfix-audit.md`
- CI runs: `35426557990` (failure, `1b1deab`), `35426648648` (success, `b8f8c4c`)
- Receipt digest at the corrected tree: `sha256:98a8061f...`
