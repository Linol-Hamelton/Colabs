# Gemini CI Hotfix Prompt - Fixture Commits Without Git Identity

**Date**: 2026-09-19  
**Implementer**: Gemini  
**Auditor**: DeepSeek - verifies before the commit  
**Trigger**: post-release CI red on `main` since `bd56d6c`; the v1.9.5 tag is **not pushed yet**, so the fix lands before the release ref is published.

## Diagnosis (reproduced)

GitHub runners have no `user.name`/`user.email`. `tests/helpers.cjs` `git()` passes only `-c core.autocrlf=false`, so every fixture `git commit` through the helper fails with "Author identity unknown". HEAD stays empty, and HEAD-dependent validator checks silently disappear:
- `registry check 1` fails (an extra `[WARN] no committed .ai/DECISIONS.md` appears),
- `registry check 5/6/7/8` fail (immutability and new-block trigger warnings never fire).

Reproduced locally by pointing `GIT_CONFIG_GLOBAL` and `GIT_CONFIG_SYSTEM` at an empty file: exactly tests 1, 5, 6, 7, 8 fail (3/8 pass), matching the CI log. `tests/handoff.test.cjs` and `tests/review-findings.test.cjs` already pass identity on their direct spawns; only the shared helper lacks it.

## Fix

1. `tests/helpers.cjs` `git()`: add identity before the caller arguments:
   ```js
   function git(cwd, args) {
     return run('git', ['-c', 'core.autocrlf=false', '-c', 'user.name=Protocol Test',
       '-c', 'user.email=protocol-test@example.invalid', ...args], cwd);
   }
   ```
2. `.github/workflows/protocol.yml` (regression suite step): before running the suite, set `git config --global user.name "Protocol CI"` and `git config --global user.email "protocol-ci@example.invalid"` as defense in depth for any future direct git spawn. Keep the rest of the workflow unchanged.
3. Grep the test suite for any remaining fixture commit path that lacks identity (after 1-2 this should be none; if not, fix it in the same change and report where).

## Verification (evidence required, both modes)

1. **Simulated CI (identity-less)**: set `GIT_CONFIG_GLOBAL` and `GIT_CONFIG_SYSTEM` to an empty file, then run `node --test tests/registry.test.cjs` (expect 8/8) and the full `powershell .\test-protocol.ps1` (expect 241/241). If more latent identity-dependent failures surface, fix them in this change and list them.
2. **Normal environment**: full suite green (241/241).

Note: `.ai/TASK.md` is `Completed` and its certified receipts go stale the moment this fix writes files; the standalone validator will show the expected `gate-check ... stale` failure until the controller re-records after your audit. Do **not** try to silence it by editing TASK.md, journals or receipts.

## Handoff

- Journal entry (five labels), `record --owner gemini-434bcd8012e0f38c`, `verify --deep` exit 0; stop for DeepSeek's audit; no commit, no push.
- After the audit: controller re-runs the ordered record pass (claude-opus, gemini, deepseek), the standalone validator must pass with 0 warnings, then the owner commits, moves the unpublished tag `v1.9.5` to the hotfix commit, and pushes it.
