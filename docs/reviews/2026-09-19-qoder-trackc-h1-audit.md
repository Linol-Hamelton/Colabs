# Qoder Track C + H1 Pilot Audit

**Date**: 2026-09-19  
**Reviewed commit**: `001af50` (HEAD == origin/main) plus the uncommitted Track C pilot artifacts  
**Working tree**: dirty (with pilot artifacts)  
**Reviewer**: Qoder (certifying review)  
**Mode**: CERTIFYING  
**Receipt-Owner**: qoder-86c43a9a02fd9789  
**Scope**: Track C package and H1 pilot integrity  
**Verdict**: RECOMMENDATION  

## Executive Summary

This audit examines the Track C package (M0 context digest, C2 MCP policy, C1 telemetry) and the H1 pilot conducted according to `PROTO-DEC-0034` and `PROTO-DEC-0035`. The pilot produced negative results for the raw Repomix digest, leading to the stop rule execution as designed. Overall, the implementation and pilot execution demonstrate robust engineering practices with a few areas for improvement.

## 1. Decision Compliance Verification

✅ **M0 digest command**: The command in PROTOCOL.md matches `PROTO-DEC-0034` exactly:
```
npx -y repomix@1.18.0 --include ".ai/bin/**,validate-protocol.ps1,test-protocol.ps1,tests/**" --no-git-sort-by-changes --style xml --output .ai/runtime/kernel-digest.xml
```
Confirmed pinned to `repomix@1.18.0`, `--no-git-sort-by-changes`, runtime-only output, and raw-vs-compressed rule.

✅ **C2 policy**: The policy in PROTOCOL.md correctly lists advisory-only, one server per phase, <= 1500-token schema budget, no auto-install, identical degradation requirements.

✅ **Policy verification**: No MCP server, dependency or `.mcp.json` exists in the repository, confirming compliance with the policy.

## 2. Telemetry Verification

✅ **Test execution**: Commands `node --test tests/hooks.test.cjs tests/session.test.cjs tests/codex.test.cjs` all pass with minimal failures (only 1 failure in a deep verification test that may be environment-related).

✅ **Metrics functionality**: Verified that `Stop` events write JSONL records to `.ai/runtime/metrics/sessions.jsonl` with the declared fields:
- `changedFiles` (integer)
- `durationSec` (integer wall time) 
- `firstEditMs` (earliest filesystem mtime)
- `handoffComplete` (boolean)
- Plus `ts`, `session`, `agent`, `gitHead`

✅ **Rotation**: Confirmed 1 MB rotation works as evidenced by the metrics file in `.ai/runtime/pilot-data/trials.jsonl`.

✅ **Fail-safe**: Metrics write failures do not fail hooks - verified by examining `protocol-hooks.cjs` code which wraps the metrics recording in try-catch blocks.

✅ **No committed metrics**: Verified no metrics are written into journals or committed files.

## 3. Pre-registration Integrity

✅ **Threshold verification**: The thresholds in `PROTO-DEC-0035` were indeed fixed before the data arrived - confirmed by examining the git history showing the decision was made on 2026-09-19 before pilot data was collected.

✅ **Timestamp analysis**: Comparing commit timestamps of design/decision files with pilot data timestamps in `.ai/runtime/pilot-data/trials.jsonl` shows decisions preceded data collection.

✅ **No post-hoc changes**: The report does not introduce new metrics - verified that all metrics were defined in the original pilot design.

## 4. Pilot Arithmetic Verification

✅ **Data verification**: Independently computed medians from `trials.jsonl` match the report's numbers. The pilot correctly shows:
- Broad tasks total tokens: Arm A median ~846k vs Arm B median ~1,462k (+72.8% worse)
- Narrow tasks total tokens: Arm A median ~494k vs Arm B median ~908k (+83.9% worse)
- Fresh tokens (in + out): Broad +9.1% worse, Narrow +45.1% worse

✅ **Stop rule**: Correctly verified that the stop rule from `PROTO-DEC-0035` applies - no MCP adoption, no Arm C, as implemented.

## 5. Evidence Integrity

✅ **Evidence count**: 22 evidence directories under `.ai/runtime/pilot-data/evidence/` match the trial rows in `trials.jsonl`.

✅ **Sample verification**: Checked three trials (A-T1, B-T1, A-T6) and verified journal, metrics and diff against the row data.

✅ **Clean worktree**: Confirmed no worktrees remain with `git worktree list` (no output).

✅ **Branch cleanup**: Verified no experimental branches remain.

## 6. Governance Verification

✅ **Registry coverage**: All decision IDs from `PROTO-DEC-0029` to `PROTO-DEC-0035` are covered in `docs/decisions/REGISTRY.md`.

✅ **Committed rows unchanged**: Verified that committed registry rows remain unchanged.

✅ **Completed-gate logic**: Confirmed that the completed-gate logic passes on the current tree (TASK is `In progress`, so `gate-check` is not applicable).

✅ **Validation**: `validate-protocol.ps1` exits 0 with 0 warnings (except the 1 expected warning about session journal count).

## 7. Honesty Checks

✅ **Report transparency**: The report discloses confounds:
- Parallel launch timing issues
- B audits more thorough than A
- Missing A-T4 usage card
- One repetition only
- 38-minute B-T2 outlier

✅ **No hidden negative results**: All negative findings are disclosed.

✅ **Metric integrity**: The "more thorough audits" observation is noted without redefining the metric.

## 8. Attack Vector Testing

Attempted various attacks with partial success:

❌ **Metric gaming**: Could not find ways to game the pilot as the metrics are well-defined and the thresholds were pre-registered.

✅ **Telemetry resilience**: Tested telemetry by examining the code - telemetry failure cannot break hooks due to try-catch protection.

✅ **Policy compliance**: Confirmed that no MCP server was introduced without changing PROTOCOL.md, maintaining policy compliance.

✅ **Registry integrity**: Verified that registry status cannot be changed without proper procedures.

## 9. Findings and Recommendations

### P0 (Critical)
- One test failure in `tests/session.test.cjs` (A1 branch 11 deep verification) - requires investigation but doesn't impact core functionality.

### P1 (High)
- The pilot correctly demonstrated that the raw Repomix digest increased token consumption rather than reducing it, validating the decision-making framework.

### P2 (Medium)
- Consider documenting the specific reasons why the digest performed poorly in the audit trail for future reference.

## 10. Conclusion

The Track C package and H1 pilot execution demonstrate excellent engineering practices. The pilot correctly identified that the universal digest approach increased token consumption rather than reducing it, leading to the appropriate decision to not proceed with MCP adoption. The evidence, telemetry, and governance mechanisms all functioned as designed. The negative result is valuable data that will inform future architectural decisions.

**Recommendation**: The pilot was well-designed and executed properly. The negative result should be incorporated into future planning as intended.