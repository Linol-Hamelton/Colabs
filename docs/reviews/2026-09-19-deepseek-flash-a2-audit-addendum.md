# DeepSeek (deepseek-flash) - A2 Audit Addendum: CI Coverage Regression

**Date**: 2026-09-19  
**Reviewed commit**: `ebd777e` (Item 2, B5 and docs committed; CI run `35414724280` success)  
**Supersedes**: section 3 ("CI workflow review") of `docs/reviews/2026-09-19-deepseek-flash-a2-audit.md`  
**Reviewer**: DeepSeek (deepseek-flash), auditor/controller  
**Scope**: correction to the Item 2 CI assessment  
**Conflict declaration**: authored the Item 2 specification and the dispatch prompt that caused the regression; no implementation role.  
**Verdict**: **CORRECTION REQUIRED** before the final certification - the Item 2 record fix and its tests remain PASS; only the CI review was incomplete.

---

## 1. What happened

My Item 2 dispatch prompt stated "No CI workflow exists today (`.github/workflows/` is absent). Create a minimal `.github/workflows/protocol.yml`". That was wrong: `glob .github/workflows/*` returned no files because the glob implementation hides dot-directories, while `git ls-tree 6624c8c -- .github` proves `.github/workflows/protocol.yml` existed and was committed. The implementer modified the existing workflow to match the prompt instead of flagging the discrepancy.

The modification (commit `366519c`, `8beca2b -> 366519c` for this file) removed:

| Removed | Why it mattered |
|---|---|
| `push: branches: ['**']` -> `branches: [main]` | CI no longer runs on feature-branch pushes |
| `workflow_dispatch:` | manual runs removed |
| The DEC-0009 comment | the record of why CI exists was deleted |
| Step `Tree anchor` (`node .ai/bin/protocol-handoff.cjs state`) | the digest was visible on every run |
| Step `Install into a clean directory and validate there` | end-to-end installer check on a clean runner (the local suite mocks fixtures; this exercised the real installer) |
| Step `Reinstall is idempotent and preserves project state` | the upgrade/state-preservation guarantee was only covered by unit tests afterwards |

The one addition - the `[WARN]` escalation wrapper - is correct and was independently verified by simulation.

Evidence: `git show 8beca2b:.github/workflows/protocol.yml` versus the committed version. The earlier CI run on `6624c8c` (4m31s, success) included the removed steps; the current run (`ebd777e`, 3m0s, success) does not. A green run with reduced scope does not certify the removed coverage.

## 2. Correction required (fold into the Item 3 dispatch as Step 0)

Restore the workflow to the original scope **plus** the escalation wrapper, in one commit, without rewriting history:

```yaml
name: protocol

# DEC-0009 recorded that the regression suite runs locally and in CI. Only the
# local half was true until this workflow existed. Windows PowerShell 5.1 is
# the documented baseline, so the checks run on the interpreter that the
# encoding rules in AGENTS.md section 11 are written for.

on:
  push:
    branches: ['**']
  pull_request:
  workflow_dispatch:

permissions:
  contents: read

jobs:
  checks:
    runs-on: windows-latest
    timeout-minutes: 30
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '22'

      - name: Protocol validation (escalate warnings and failures)
        shell: powershell
        run: |
          $output = powershell -ExecutionPolicy Bypass -File .\validate-protocol.ps1
          Write-Host ($output -join [Environment]::NewLine)
          if ($LASTEXITCODE -ne 0 -or ($output -match '\[WARN\]') -or ($output -match '\[FAIL\]')) {
            Write-Error "Protocol validation failed or produced warnings"
            exit 1
          }

      - name: Regression suite
        shell: powershell
        run: powershell -ExecutionPolicy Bypass -File .\test-protocol.ps1

      - name: Tree anchor
        shell: powershell
        run: node .ai/bin/protocol-handoff.cjs state

      - name: Install into a clean directory and validate there
        shell: powershell
        run: |
          $target = Join-Path $env:RUNNER_TEMP 'protocol-install'
          .\setup-ai-protocol.ps1 -Target $target -InitGit
          if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
          & (Join-Path $target 'validate-protocol.ps1')
          if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

      - name: Reinstall is idempotent and preserves project state
        shell: powershell
        run: |
          $target = Join-Path $env:RUNNER_TEMP 'protocol-install'
          Set-Content -LiteralPath (Join-Path $target '.ai/TASK.md') -Value "# Current Task`n`nStatus: In progress`n`nSTATE MARKER" -Encoding utf8
          .\setup-ai-protocol.ps1 -Target $target -Force
          if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
          if (-not (Select-String -LiteralPath (Join-Path $target '.ai/TASK.md') -Pattern 'STATE MARKER' -Quiet)) {
            Write-Error 'Force overwrote accumulated project state'
            exit 1
          }
```

Acceptance: the file matches the block above; `validate-protocol.ps1` remains exit 0 with 0 warnings; the change is one new commit; no history rewrite; the owner pushes when ready and the re-run includes the restored steps.

## 3. Process lesson (recorded for the record)

- A dispatch prompt is an instruction, not a fact; an implementer who finds reality contradicting the prompt must stop and ask (this was in the Item 2 prompt's stop conditions, and it did not happen).
- The controller must verify existence with `git ls-tree` / explicit dot-path checks, not a glob that hides dot-directories.
- An audit that does not diff a modified file against its previous committed state is incomplete. This addendum corrects that.

## 4. References

- Original audit: `docs/reviews/2026-09-19-deepseek-flash-a2-audit.md` (section 3 superseded)
- Workflow before: `git show 8beca2b:.github/workflows/protocol.yml`
- Item 3 prompt (updated with Step 0): `docs/reviews/2026-09-19-gemini-v1.9.5-item3-prompt.md`
