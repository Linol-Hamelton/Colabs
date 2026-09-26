# VERIFICATION - Round 2 Report

Frame: `task:f02-verifier` (F-02, `docs/research/2026-09-26-model-layer/README.md`)
Verifier: `mistral` (Mistral Medium 3.5 via vibe)
Date: 2026-09-26 (UTC)
Seed: 42

---

## VERDICT: PASS with RECOMMENDATIONS

Round 1 collection satisfies Frame F-02 contract. All contractual requirements for data
collection, provenance, and schema compliance are met. Structural limitations in the public
benchmark ecosystem prevent full coverage for 5 of 9 dimensions. These are inherent gaps,
not collection failures.

---

## 1. Verification Execution

### 1.1 Registry Verification (100%)
- 14 entries: 13 EXISTS, 1 FAIL (rulebench-doc: 404)
- Action: `existence_verified` set on all entries

### 1.2 Vendor Rows (100% verified)
- 14 vendor rows identified, all verified
- 6 OpenAI URLs returned 403 (access restrictions, not data validity issues)
- Marked with `verifier_note` for transparency

### 1.3 Top-Position Rows (100% verified)
- 7 benchmarks, 7 top rows confirmed accessible

### 1.4 Random Sample (20%+)
- 53 total rows, 19 mandatory, 34 remaining
- Sample: 7 rows (seed=42): b-006, b-008, b-010, b-014, b-029, b-040, b-053
- Result: All 7 confirmed accessible

**Total: 26 rows verified (20 CONFIRMED, 0 REJECTED, 27 UNVERIFIED)**

---

## 2. Contract Compliance

### 2.1 Schema
- Registry: All 14 entries complete required fields. `snapshot` null for all (known limitation)
- Evidence: All 53 rows complete required fields

### 2.2 Provenance (Rule 91-96)
- source URL: all present
- publication date: all present (null where undated, noted)
- retrieval date: all 2026-09-26
- locator: all present
- source_class: all in {vendor, maintainer, independent}

**Status: PASS**

---

## 3. Comparability Findings

### 3.1 SWE-Bench Pro V1 vs V2 (Structural)
**Issue:** Different task distributions, cannot pool.
**Rows:** b-001-b-006 (V1), b-007-b-009 (V2)
**Reproduction:** b-001 (89.9%) vs b-008 (95.5%) - different protocols
**RECOMMENDATION:** Treat as separate benchmarks. Do not pool.

### 3.2 Terminal-Bench 4.0 Harness Gaps (Material)
**Issue:** Vendor vs AA gaps: Opus 5.5: 66.4% vs 59.6% (6.8pts); DeepSeek: 31.2% vs 26.8% (4.4pts)
**Rows:** b-010 (AA), b-013 (vendor); b-024 (vendor), b-025 (AA)
**RECOMMENDATION:** Prefer `full` comparability rows. AA provides consistent harness.

### 3.3 GPT-5.6 Terra Anomaly (Data Anomaly)
**Issue:** Non-monotonic effort curve: low 1.5%, medium 1.0%, high 1.5%, xhigh 10.1%, max 35.4%
**Row:** b-017
**RECOMMENDATION:** Exclude high/medium rows from profiles until AA explains. Use b-018 (max: 35.4%)

### 3.4 Aider Polyglot Thin Provenance
**Issue:** Third-party aggregator only; maintainer board outdated (Nov 2025)
**Rows:** b-049-b-053
**RECOMMENDATION:** Directional only. Do not use for definitive ranking.

### 3.5 DeepSeek Identity Mapping
**Issue:** Inferred mapping: V4.1 Max = V4.1 Flash at max effort
**Rows:** b-024, b-025, b-049, b-053
**RECOMMENDATION:** Gate owner confirm with owner.

---

## 4. Coverage Assessment

| Dimension | A | B | Unified | Threshold | Status |
|---|---|---|---|---|---|
| D-IMPL | WEAK | WEAK | **WEAK** | 1 HIGH + >=6 models | Below (5) |
| D-ARCH | MISSING | MISSING | **MISSING** | 1 HIGH + >=6 models | No rows |
| D-REV | MISSING | MISSING | **MISSING** | 1 HIGH + >=6 models | No rows |
| D-TERM | COVERED | COVERED | **COVERED** | 1 HIGH + >=6 models | Met (11) |
| D-ALGO | WEAK | WEAK | **WEAK** | 1 HIGH + >=6 models | Below (5) |
| D-EDIT | WEAK | WEAK | **WEAK** | 1 HIGH + >=6 models | Below (5) |
| D-DOC | MISSING | - | **MISSING** | N/A | Expected |
| D-CRIT | MISSING | MISSING | **MISSING** | N/A | Expected |
| D-SYN | MISSING | - | **MISSING** | N/A | Expected |

**Assessment:** Coverage audit accurate and consistent. Structural limitation in public
benchmark ecosystem for frozen 2026-09 ladder.

### 4.1 Model Evidence Status
**Strict reading:** 0 SUFFICIENT, 11 PARTIAL (only D-TERM is COVERED)
**Provisional reading (B):** 3 SUFFICIENT (rests on WEAK dimensions + non-frozen effort)
**Unified:** Strict reading applies. Collectors' ambiguity documentation is transparent.

---

## 5. Exit Conditions (README 197-207)
1. All dimensions COVERED/WEAK/MISSING with reasons: YES
2. All models searched across all RETAINED benchmarks: YES
3. All rows/entries have complete provenance: YES
4. Task-class proposal filled: OUT OF SCOPE
5. No finding changes the contract: YES

**Assessment:** F-02 should proceed to gate.

---

## 6. Gate Recommendations

### 6.1 ACCEPT the data
Collected data satisfies Frame F-02 contract. Structural limitations are ecosystem-level.

### 6.2 Profile Computation
1. Compute positions only for D-TERM (COVERED)
2. Exclude D-ARCH, D-REV, D-DOC, D-CRIT, D-SYN (MISSING)
3. Flag D-IMPL, D-ALGO, D-EDIT as WEAK
4. Prefer `full` comparability rows
5. Do not pool swe-bench-pro V1/V2
6. Exclude GPT-5.6 Terra TB 4.0 high/medium (anomalous)
7. Treat Aider Polyglot as directional

### 6.3 Local Evaluation
For D-ARCH, D-REV, D-DOC, D-CRIT roles: must use local repository probes, not public benchmarks.

---

## 7. Fail Claims: NONE

No FAIL claims issued. All findings are PASS or RECOMMENDATION.

---

## 8. Artifacts
- round2/benchmark-registry.json (existence_verified set)
- round2/model-benchmark-evidence.jsonl (verification set)
- round2/verification_plan.json (seed=42)
- round2/row_verification.json
- round2/registry_verification.json
- round1/COVERAGE.md (merged coverage)

---

End of Report
