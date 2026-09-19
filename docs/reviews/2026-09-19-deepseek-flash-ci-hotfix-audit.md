# DeepSeek (deepseek-flash) - CI Hotfix Audit

**Date**: 2026-09-19  
**Reviewed state**: release tag candidate `28f1e01` plus the uncommitted CI hotfix (`tests/helpers.cjs`, `.github/workflows/protocol.yml`)  
**Reviewer**: DeepSeek (deepseek-flash), auditor/controller  
**Scope**: fixture git identity + workflow hardening for GitHub runners  
**Conflict declaration**: authored the hotfix prompt; no implementation role.  
**Mode**: CERTIFYING  
**Verdict**: **PASS** - the CI-invisible failure is fixed under simulated runner conditions; ready to re-record, commit and move the unpublished tag.

---

## 1. Independent verification

| Check | Result |
|---|---|
| `tests/helpers.cjs` diff | identity `-c user.name=Protocol Test -c user.email=protocol-test@example.invalid` injected before caller args |
| `.github/workflows/protocol.yml` diff | regression-suite step sets a global identity before running the suite |
| Identity-less registry tests (`GIT_CONFIG_GLOBAL`/`GIT_CONFIG_SYSTEM` -> empty file) | 8/8 pass (was 3/8 pass before the hotfix) |
| Identity-less full suite (same simulation) | **241/241 pass**, exit 0 |
| Implementer receipt | `verify --deep` exit 0, matches the current tree |
| Journal size | 99/150 lines after the `record` auto-archive (the A2 fix operated in production: the journal was at 148 lines before the record) |

The simulation is the decisive check: it reproduces the runner environment that produced 5 failures on `28f1e01`, and the same five tests now pass.

## 2. Notes (non-blocking)

| Id | Note |
|---|---|
| H-1 | The implementer's report says `hooks.test.cjs` and `codex.test.cjs` "supply explicit author flags"; those files actually use the shared helper (no direct `run('git', ...)` commit path), which is why the helper fix covers them. Outcome is correct; wording inaccurate |
| H-2 | The standalone validator currently fails `gate-check` (Claude's receipt is stale after the hotfix writes) - expected; the ordered record pass follows and must restore `[PASS] completion gate verified fresh` with 0 warnings |
| H-3 | Protocol behavior is unchanged; no runtime file was touched. After re-record and a green CI run on the hotfix commit, moving the unpublished `v1.9.5` tag to it keeps the release ref honest |

## 3. Recommendation

1. Ordered record pass on the hotfix tree: claude-opus, gemini, deepseek; then `verify --deep` for all three.
2. Standalone `validate-protocol.ps1` with the gate active must report 0 failures and 0 warnings.
3. Owner commit: `ci: fixture git identity for runner environments (v1.9.5 hotfix)` including the workflow, the helper, both journals, this report and the hotfix prompt; push `main`.
4. Move the unpublished tag: `git tag -f v1.9.5 <hotfix commit>`, `git push origin main`, `git push -f origin v1.9.5` (force is acceptable only because the tag was never published).
5. Dispatch Track C (M0 + C2) from `docs/reviews/2026-09-19-gemini-trackc-m0-c2-prompt.md` after the tag move.

## 4. References

- Hotfix prompt: `docs/reviews/2026-09-19-gemini-ci-hotfix-prompt.md`
- CI failure evidence: run `35424755683` (registry tests 1, 5, 6, 7, 8) and the local identity-less reproduction in this session's journal
