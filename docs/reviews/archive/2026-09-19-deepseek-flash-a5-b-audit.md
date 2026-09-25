# DeepSeek (deepseek-flash) - Item 5 (A5 + Track B Registry) Adversarial Audit

**Date**: 2026-09-19  
**Reviewed state**: anchor `032efeb` plus the uncommitted Item 5 changes; implementer receipt fresh at handoff  
**Reviewer**: DeepSeek (deepseek-flash), auditor/controller  
**Scope**: A5 documentation closure; B1-B4 registry, trigger taxonomy, WARN-first validator checks, tests; R-1 micro-fix  
**Conflict declaration**: authored the A5/B specification; no implementation role.  
**Mode**: CERTIFYING  
**Verdict**: **PASS** - no blocking findings. One accuracy amendment is recommended for the owner before `PROTO-DEC-0033` is transcribed.

---

## 1. Independent verification

| Check | Result |
|---|---|
| `node --test tests/registry.test.cjs` | 7/7 pass |
| `node --test tests/archive.test.cjs` | 8/8 pass (including P5-F2) |
| `node --test tests/gate.test.cjs` | 12/12 pass |
| `node --test tests/validator.test.cjs` | 12/12 pass |
| `powershell .\test-protocol.ps1` | 236/236 pass, exit 0 |
| `powershell .\validate-protocol.ps1` | exit 0, 0 warnings, `[PASS] inspected decision registry with 32 entries` |
| `verify --owner gemini-434bcd8012e0f38c --deep` | exit 0, matches the current tree |
| A5 greps | `nonce` hits in canonical docs: 0; `clean tree`/`clean working`: 0 |

### Independent registry probe (clone with the registry committed to HEAD)

| Case | Observed |
|---|---|
| baseline | exit 0, no warnings |
| A: remove the `PROTO-DEC-0032` row | exit 0; `[WARN] missing entry for decision PROTO-DEC-0032` + `[WARN] ... modified or removed existing rows from HEAD` |
| B: append an unknown row `DEC-9999` | exit 0; `[WARN] unknown decision DEC-9999` |
| C: new decision block without `Reopen-trigger` | exit 0; `[WARN] new decision block PROTO-DEC-0099 missing Reopen-trigger field` |
| D: registry absent | exit 0; `[WARN] docs/decisions/REGISTRY.md is missing` |
| restored | exit 0, no warnings |

Every check is WARN-first as decided (D3); nothing is destructive; the immutability comparison is positional on committed rows, so appends are safe and middle-insertions warn.

## 2. Content review

- **A5**: PROTOCOL.md now states that legacy receipts are editable and not tamper-evident and that `entry hash format: 2` is the only authenticated form; the P5-F2 batch-boundary deviation paragraph references the pinned test and the historical review. Nonce and clean-tree concerns are verifiably closed by grep.
- **B1/B3 registry**: append-only header rules, 32 seeded rows, supersedes links preserved from the blocks. The registry is a new file; `.ai/DECISIONS.md` was not edited.
- **B2**: AGENTS.md section 6 adds the registry to the lock list and writing-rules table and states the reopening rule with the complete trigger taxonomy and its proof requirements.
- **B4 validator**: coverage, immutability, new-block trigger and missing-file checks match the approved rules; `docs/decisions/` is now protocol-owned in the source role; the registry never gets edited by the validator.
- **R-1**: `PROTOCOL_SKIP_GATE` is now set only for `check.quick === true` (the validator check); the regression suite and custom host checks run unmodified.
- **Tests/manifest**: `tests/registry.test.cjs` covers all seven branches with the real validator; registered in `protocol-manifest.json`; the fast-validator exemption matches the established pattern.

## 3. Findings

| Id | Severity | Finding | Disposition |
|---|---|---|---|
| AUD5-1 | LOW (accuracy) | The registry records `DEC-0014` as `accepted`, but its block reads `Status: Proposed` (a grandfathered exception in the validator) and it is superseded by `PROTO-DEC-0022`; the other superseded ids (`DEC-0003`, `DEC-0005`, `DEC-0008`) also read `accepted` although effective status is superseded. Recommendation: add `superseded` to the registry status enum and append one row per superseded id (`DEC-0003`, `DEC-0005`, `DEC-0008`, `DEC-0014`). No code change: the validator does not validate status values. The controller applies this during the `PROTO-DEC-0033` transcription under the lock, together with the PROTOCOL.md wording update and the `PROTO-DEC-0033` registry row | Owner confirmation requested |
| AUD5-2 | INFO | The implementer's `record` auto-archived the Item 1-4 entries into `.ai/ARCHIVE.md` (journal now 34 lines, ARCHIVE +137). Protocol-normal; receipts are preserved in the archive | No action |
| AUD5-3 | INFO | The added legacy sentence reads redundantly ("legacy unauthenticated receipts" repeated) | Cosmetic; skip or fix in a later touch |
| AUD5-4 | INFO | Positional immutability comparison has no false positives for appends; a legitimate re-seed would warn | Intended |

## 4. Recommendation

1. Owner approves `PROTO-DEC-0033` and, preferably, the AUD5-1 amendment (`superseded` status; four appended rows).
2. Controller transcribes `PROTO-DEC-0033` (normalized: `### PROTO-DEC-0033`, `Status: Accepted`, `Reopen-trigger: none`) with provenance, appends the registry rows (including `PROTO-DEC-0033` itself and the four `superseded` rows), updates the registry header enum and the PROTOCOL.md status list, then runs the validator (expect 0 warnings) and records.
3. Owner commits and pushes Item 5; then the final v1.9.5 certification cycle begins.

## 5. References

- Item 5 prompt: `docs/reviews/2026-09-19-gemini-v1.9.5-item5-prompt.md`
- Implementer handoff: `.ai/worklog/gemini-434bcd8012e0f38c.md` (Item 5 entry) and `.ai/ARCHIVE.md`
- Probes: clone `C:\Users\Dmitry\AppData\Local\Temp\kilo\v195probe7\repo` (`probe-reg.cjs`)
