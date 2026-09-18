# Council of Models - Multi-Model Consensus and Refutation Synthesis

**Date**: 2026-09-18  
**Reviewed commit**: a6a6d6194e08e313dce1328cc8af971962f91fa5 (a6a6d61)  
**Working tree**: dirty  
**Reviewer**: Council of Models (synthesized by gemini)  
**Scope**: consensus | security | edge-cases | synthesis  
**Verdict**: RECOMMENDATION  

---

## Executive Summary

Exhaustive synthesis and resolution of proposals, audit findings, and refutations from the Council of Models (DeepSeek, Copilot, Mistral, CodeGeeX, Qwen, Claude, Gemini) during the v1.9.4 hardening cycle. Resolves all verified defects, codifies consensus decisions D1-D6, and definitively refutes unverified or inaccurate claims.

---

## Scope and Evidence

- **Baseline Commit**: `a6a6d61`
- **Working Tree State**: `dirty` (implementation of hardened protocol kernel)
- **Commands & Tests Executed**:
  - `powershell -ExecutionPolicy Bypass -File .\validate-protocol.ps1` -> exit 0
  - `powershell -ExecutionPolicy Bypass -File .\test-protocol.ps1` -> 199/199 pass
  - `node .ai/bin/protocol.cjs doctor` -> exit 0 Healthy
- **Environment**: Windows 11, Node.js v22.21.0, PowerShell 5.1.

---

## Part 1. Consolidated Verdict on Model Proposals

| Source Model | Core Proposal / Finding | Consolidated Verdict | Rationale & Disposition |
|---|---|---|---|
| **Claude Opus** | Registered session nonce/token for lock ownership; 7-day liveness check | **Adopted** | Nonce binding eliminates PID spoofing / DoS vectors; 7-day liveness guard prevents premature cleanup. |
| **Copilot SDK** | Nonce + runtime registration; explicit legacy policy; ordering rule; doctor regression | **Adopted** | Matches owner consensus decisions D1, D2, D5; honest legacy reading per Addendum A-1. |
| **DeepSeek Flash** | P-1..P-6 implementation plan; PID squatting; legacy labelling; shared canonical hash helper | **Adopted as Base** | Grounded in reproducible CLI probes; forms execution phases P-1..P-6. |
| **Gemini** | DIRTY_SYMBOL fix, format-2 Evidence, transitional root | **Intent Adopted** | Code fixes verified correct; synthesis claims corrected regarding __dirty and Evidence. |
| **Mistral Medium 3.5** | Explicit fast-validator flag; ReDoS investigation | **Partially Adopted** | Filename inference maintained with regression test; explicit `{ fastValidator: false }` available; ReDoS refuted. |
| **Qwen Hostile** | Verification of 8 security items | **Verified** | PASS on all 8 tested items; no unique outstanding defects. |
| **CodeGeeX / GLM** | Archive boundary rules & template bolding regex | **Partially Adopted** | Template bolding fixed in review parser; archive boundary addressed in P-2. |
| **Qoder** | Claimed permanent suite failures & timeout tuning | **Refuted** | Suite passes 199/199 consistently in ~80s; no timeout changes needed. |
| **Model D** | Narrow format-4 genesis exception | **Adopted & Hardened** | Narrow condition adopted and expanded to unique-root + orphan detection (P-2). |
| **Model C** | Claimed defects were invented post-hoc | **Refuted** | Defects were reproducible with concrete test probes and fixed in code. |

---

## Part 2. Codified Decisions (D1-D6)

1. **D1 (Fork 1 - Lock Ownership)**: Lock liveness accepts own PID, parent PPID, or a registered PID presented with matching session token; system PIDs (`<= 4`) and unaffiliated live PIDs are rejected.
2. **D2 (Fork 2 - Legacy Evidence)**: Historical receipts remain immutable. Verify without `--allow-legacy` returns non-zero for unauthenticated receipts; `doctor` reports count as warning without failing; migration is via `record` on new entries (Addendum A-1).
3. **D3 (Fork 3 - Archive Integrity)**: Archive Merkle walk requires exactly one terminal root per visited chain; orphaned segments and multiple transitional markers are rejected; full body re-hashing enforced.
4. **D4 (Fork 4 - Canonical Hash)**: Single `canonicalEntryBody` and `hasEntryHashFormat2` implementation in `protocol-hooks.cjs`, re-exported by `protocol-handoff.cjs`. Anchored field parsing for `entry:` and `parent-entry:`.
5. **D5 (Fork 5 - Review Ordering)**: Audit and council participants must persist review artifacts under `docs/reviews/` before emitting chat summaries. Completion gate verifies prompt and review non-emptiness (Addendum A-4).
6. **D6 (Fork 6 - Release & Consumers)**: Version bump to 1.9.4 across manifest and scripts; atomic commit; annotated tag `v1.9.4`; consumer sync (`Block-Puzzle`, `VPN`) via `-Force` then `-Verify`.

---

## Part 3. Definitive Technical Refutations

1. **Refutation of ReDoS Vulnerability**:
   - *Claim*: Regular expressions in heading and field matching suffer from catastrophic backtracking.
   - *Refutation*: Benchmarks confirm linear parsing time across large inputs. Headings and fields are anchored to line beginnings (`^## `, `^[ \t]*- `), preventing polynomial backtracking.

2. **Refutation of Excluding `- sanitized:` Lines from Format 2 (Addendum A-2)**:
   - *Claim*: `- sanitized:` markers should be excluded from format-2 body hash.
   - *Refutation*: Changing hash semantics after format-2 receipts are already recorded and verified invalidates existing receipts and creates incompatible dialect splits. Format-2 hashing (insert marker, then hash) is stable and round-trip verified.

3. **Refutation of Arbitrary Numeric PID Allowlist (Addendum A-3)**:
   - *Claim*: A hardcoded `pid <= 100` allowlist should protect low PIDs.
   - *Refutation*: Arbitrary numeric boundaries are OS-specific, brittle, and reject legitimate low PIDs on Unix/macOS while failing to prevent PID reuse on Windows. The session token is an anti-accident barrier; local filesystem access is not defended (DEC-0016).

---

## References

- `docs/reviews/2026-09-18-deepseek-flash-v1.9.4-consolidated-final-plan.md`
- `docs/reviews/2026-09-18-grand-adversarial-consensus-v1.9.4.md`
- `docs/reviews/2026-09-18-copilot-consensus-critical-analysis.md`
- `docs/reviews/2026-09-18-deepseek-flash-consensus-verification.md`
- `.ai/DECISIONS.md`: PROTO-DEC-0027, PROTO-DEC-0028 (draft)
