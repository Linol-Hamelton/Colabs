# Gemini - Council Audit: Reusable Paired Cycle (v1.9.6, Freeze Exception)

**Date**: 2026-09-20  
**Reviewed commit**: d38d2f2ae4b4c17fe6c2c18f11215cedb2f10eb1  
**Working tree**: dirty  
**Reviewer**: Gemini 3.8 Flash (High)  
**Scope**: council | architecture | edge-cases  
**Verdict**: RECOMMENDATION  
**Mode**: CERTIFYING  
**Receipt-Owner**: gemini-e4d65c510f35d0bc  
**Receipt**: .ai/worklog/gemini-e4d65c510f35d0bc.md  

---

## Executive Summary

The paired work cycle implementation (`.ai/docs/PAIRED-CYCLE.md`, manifest entry, 1.9.6 bump) is functionally sound and passes the full test suite (255/255). However, it cannot be certified PASS due to three non-blocking issues: (F-001) `.ai/docs/PAIRED-CYCLE.md` is omitted from `$docDigests` in `validate-protocol.ps1`, causing installed projects that modify/reconcile it to fail validation; (F-002) the freeze exception and version bump reside only in `.ai/TASK.md`, violating rank-1 authority rules (`PROTO-DEC-0039`); (F-003) Phase 3 completion path allows marking tasks complete without the mandatory PROTO-DEC-0038 adversarial prompt/report pair and completion gate.

---

## Scope and Evidence

- **Baseline Commit**: `d38d2f2ae4b4c17fe6c2c18f11215cedb2f10eb1`, dirty working tree.
- **Commands Executed**:
  - `powershell -ExecutionPolicy Bypass -File .\validate-protocol.ps1`: exit 0, 1 warning (33 session journals; 0 warnings claim refuted by journal drift).
  - `powershell -ExecutionPolicy Bypass -File .\test-protocol.ps1`: exit 0, 255/255 tests passed.
  - `node .ai/bin/protocol-handoff.cjs verify --owner gemini-8f96a135c4637578`: exit 1 (stale, digest changed from 218 to 220 files).
  - `node .ai/bin/protocol-handoff.cjs verify --owner deepseek-flash-b46d113672e9d5fc`: exit 0 (verified against 220 files).
  - `git diff --numstat d38d2f2ae4b4c17fe6c2c18f11215cedb2f10eb1 -- .ai/DECISIONS.md docs/decisions/REGISTRY.md .ai/ARCHIVE.md`: 124/0, 4/0, 394/0 (append-only intact).
- **Environment**: Windows, PowerShell 5.1, Node.js v22.21.0.

---

## Findings

| Id | Severity | Title | Location | Impact | Status |
|---|---|---|---|---|---|
| F-001 | MEDIUM | New managed doc missing from validator `$docDigests` | `validate-protocol.ps1:657-665` | Host edits to `.ai/docs/PAIRED-CYCLE.md` yield FAIL (exit 1) instead of WARN | Open |
| F-002 | MEDIUM | Freeze exception and bump recorded only in TASK.md | `.ai/TASK.md:35,47`; `AGENTS.md` §1, §2, §6 | Outranked by `PROTO-DEC-0039`; missing REGISTRY row and DECISIONS block | Open |
| F-003 | MEDIUM | Runbook completion bypasses PROTO-DEC-0038 and completion gate | `.ai/docs/PAIRED-CYCLE.md:47,59-62` | Allows core tasks to complete after one review without adversarial pair | Open |
| F-004 | LOW | Template 3 references "Verify deep receipt" but omits `--deep` | `.ai/docs/PAIRED-CYCLE.md:134` | Executes shallow chain check rather than deep historical verification | Open |
| F-005 | LOW | Manifest managed entry not asserted by any regression test | `tests/manifest.test.cjs` | Removing the file from manifest breaks 0 tests (one-way coverage) | Open |
| F-006 | LOW | Version bump to 1.9.6 uncoupled from release tag | `protocol-manifest.json:3` | Non-atomic version advance without release tag or formal release decision | Open |
| F-007 | INFO | "0 warnings" state drift (33 journals in worklog) | `validate-protocol.ps1:215-218` | Warning present due to parallel sessions added after receipt | Open |
| F-008 | INFO | Active corpus headroom and worklog cap pressure | `docs/reviews/`, `.ai/worklog/` | Paired cycle produces 3-5 artifacts per task; worklog already over 30 cap | Open |

---

## Detailed Findings

### F-001 - MEDIUM - Validator `$docDigests` list omits `.ai/docs/PAIRED-CYCLE.md`
- **Location**: `validate-protocol.ps1:657-665`
- **Reproduction**: In an installed project, modifying `.ai/docs/PAIRED-CYCLE.md` causes validator to execute the tooling mismatch branch (lines 681-683), issuing `[FAIL]` and exit 1. Reconciling `AGENTS.md` or `COPILOT.md` correctly issues `[WARN]` and exit 0.
- **Impact**: Host repositories adapting paired cycle roles or rules will experience broken builds.
- **Fix**: Add `'.ai/docs/PAIRED-CYCLE.md'` to `$docDigests` in `validate-protocol.ps1`.

### F-002 - MEDIUM - Missing formal decision and registry entry for freeze exception
- **Location**: `.ai/TASK.md:35,47`; `AGENTS.md` §1, §2; `docs/decisions/REGISTRY.md`
- **Reproduction**: `grep -E "PROTO-DEC-00(39|40)" docs/decisions/REGISTRY.md` shows no entry authorizing exceptions to `PROTO-DEC-0039`.
- **Impact**: Rank-3 `TASK.md` contradicts Rank-1 `DECISIONS.md`. Violates protocol authority hierarchy.
- **Fix**: Append an `owner-directive` row in `REGISTRY.md` and an approved decision block in `DECISIONS.md`.

### F-003 - MEDIUM - Runbook Phase 3 omits risk scaling and completion gate
- **Location**: `.ai/docs/PAIRED-CYCLE.md:47,59-62` vs `AGENTS.md` §2 (`PROTO-DEC-0038`)
- **Reproduction**: Inspection of `PAIRED-CYCLE.md` reveals no mention of `## Completion gate` or blast-radius distinction between docs/config and protocol core.
- **Impact**: Protocol-core tasks following the runbook could be closed after Phase 3, violating PROTO-DEC-0038.
- **Fix**: Add explicit branching in Phase 3/6 distinguishing core (requires adversarial prompt+report and completion gate) from docs/config.

---

## Point-by-Point Results (A–I)

- **A. Contradictions**: Core guardrails (shared lock, final tree receipt, worklog ownership) are consistent. Contradiction verified on completion gate and PROTO-DEC-0038 risk scaling (F-003).
- **B. Prompt Templates**: Self-contained in fresh installed sessions. CLI flag `--journal` is valid and supported by `protocol-handoff.cjs:686`. Bug verified: Template 3 line 134 labels command "deep receipt" but omits `--deep` (F-004); Template 3 says "and test suite" which is ambiguous for installed hosts.
- **C. Manifest & Install**: Managed entry added; version 1.9.6 consistent across `protocol-manifest.json`, `setup-ai-protocol.ps1`, `AGENTS.md`. Defect verified: host reconciliation fails validation due to missing `$docDigests` entry (F-001).
- **D. Tests**: `validate-protocol.ps1` exit 0 (1 warning); `test-protocol.ps1` 255/255 PASS. No test verifies that `.ai/docs/PAIRED-CYCLE.md` is in manifest. If removed from manifest, 0 tests fail (F-005). If removed from disk while in manifest, 4 tests fail.
- **E. Diff Discipline**: Append-only files strictly respected (`ARCHIVE.md` +394/-0, `DECISIONS.md` +124/-0, `REGISTRY.md` +4/-0). Zero kernel `.cjs` modified. `TASK.md` remains `Status: In progress`.
- **F. Governance**: Insufficient. Recording freeze exception in `TASK.md` without `REGISTRY.md` row and `DECISIONS.md` approved block violates `AGENTS.md` §1 and §2 (F-002).
- **G. Upgrade Path**: On 1.9.4/1.9.5 hosts, `-Force` installs the file and updates digests. Plain install without `-Force` correctly triggers digest mismatch by design. Deleting the file triggers `[FAIL] missing file`. Editing triggers false `[FAIL]` (F-001).
- **H. Unmentioned Risks**: Uncoupled 1.9.6 version bump inside freeze (F-006); default role hardcoding (`gemini`/`deepseek`); rapid consumption of review corpus cap (49/60 files) and worklog cap (33/30 journals) under paired cycle iterations; Phase 6 stops at prompt without automated host verification.
- **I. Falsification**: Claimed "0 warnings" is FALSE (reproduced 1 warning: 33 journals). Claimed receipt verification for `gemini-8f96a135c4637578` is FALSE (reproduced exit 1, stale tree). Claimed 255/255 tests is VERIFIED.

---

## Minimal Fixes (Advisory)

1. `validate-protocol.ps1`: add `'.ai/docs/PAIRED-CYCLE.md'` to `$docDigests` array (lines 657-665).
2. `docs/decisions/REGISTRY.md` & `.ai/DECISIONS.md`: append `owner-directive` row and approved exception decision block.
3. `.ai/docs/PAIRED-CYCLE.md`: add risk-scaling branch in Phase 3/6 citing PROTO-DEC-0038 and `## Completion gate`; add `--deep` to Template 3 line 134.
