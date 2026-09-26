# COVERAGE - Unified Round-1 Coverage Audit

Frame: `task:f02-verifier` (parent frame: F-02, `docs/research/2026-09-26-model-layer/README.md`)
Verifier: `mistral` (Mistral Medium 3.5, via vibe)
Date: 2026-09-26 (UTC)
Baseline: HEAD commit at start of round 2 verification

This document is the unified, cross-verified coverage audit assembling evidence from:
- `round1/COVERAGE-A.md` (Collector A: gemini)
- `round1/COVERAGE-B.md` (Collector B: deepseek)

All classifications follow the strict thresholds of the Frame F-02 Contract (`README.md`).
This is a draft pending Round 2 corrections; see `round2/VERIFICATION.md` for the verifier's
findings and verdict.

---

## 1. Executive Summary

Both collectors independently audited coverage across the 6 core benchmark dimensions
and the 3 auxiliary dimensions (D-DOC, D-CRIT, D-SYN).

**Key Facts:**
- Total evidence rows collected: 53
- Benchmarks: 12 RETAINED, 2 EXCLUDED
- Frozen working models: 11 ladder rungs

**Coverage Status (Unified):**
- 1 dimension COVERED (D-TERM)
- 3 dimensions WEAK (D-IMPL, D-ALGO, D-EDIT)
- 5 dimensions MISSING (D-ARCH, D-REV, D-DOC, D-CRIT, D-SYN)

---

## 2. Per-Dimension Coverage Audit

The Frame Contract defines coverage thresholds as:
- `COVERED`: At least 1 RETAINED benchmark with strength `HIGH`, and comparable rows for at least half of the frozen working models (>= 6 of 11)
- `WEAK`: Some evidence, below that threshold, or proxy evidence only
- `MISSING`: None

| Id | Dimension | Retained Benchmark(s) | Frozen Models with Rows (n/11) | Unified Verdict | Collector A | Collector B | Notes |
|---|---|---|---|---|---|---|---|
| **D-IMPL** | Repository implementation & bug fixing | swe-bench-pro, swe-bench-pro-v2, swe-lancer-ic | 6/11 | **WEAK** | WEAK | WEAK | SBP V1 has 5 models; V2 adds Gemini 3.8 but versions cannot be pooled. SWE-Lancer IC has 0 frozen rows. |
| **D-ARCH** | Architecture & repository comprehension | repoprobe, archbench | 0/11 | **MISSING** | MISSING | MISSING | No public evaluations for frozen models; RepoProbe paper evaluates up to GPT-5.4/Opus 4.6 only |
| **D-REV** | Code review | aacr-bench | 0/11 | **MISSING** | MISSING | MISSING | Paper v3 evaluates older models only; no frozen rung results |
| **D-TERM** | Terminal, debugging & autonomous execution | terminal-bench-4.0, terminal-bench-2.1, terminal-bench-hard | 11/11 | **COVERED** | COVERED | COVERED | All 11 rungs have rows; TB 4.0 discriminates best |
| **D-ALGO** | Algorithmic coding | livecodebench | 5/11 | **WEAK** | WEAK | WEAK | Below threshold; Vals window only; 5 models |
| **D-EDIT** | Code editing & patch-instruction following | aider-polyglot | 5/11 | **WEAK** | WEAK | WEAK | Below threshold; third-party re-runs with thin provenance |
| **D-DOC** | Document & rule comprehension | rulebench-doc (EXCLUDED) | 0/11 | **MISSING** | MISSING | (not searched) | Candidate excluded; no public benchmark for repo-level rules |
| **D-CRIT** | Adversarial review & critical analysis | swe-lancer-manager (proxy, capped) | 0/11 | **MISSING** | MISSING | MISSING | Proxy capped at WEAK; no public results for frozen models |
| **D-SYN** | Multi-document synthesis | multidoc-syn (EXCLUDED) | 0/11 | **MISSING** | MISSING | (not searched) | Candidate excluded; no public benchmark for repo architecture synthesis |

---

## 3. Per-Model Evidence Status

The Frame Contract defines evidence status per model as:
- `SUFFICIENT`: COVERED-level rows on at least 4 of the 6 benchmark dimensions
- `PARTIAL`: 1-3
- `INSUFFICIENT`: 0

**Unified Verdict:** With only D-TERM achieving COVERED status at the dimension level, no model
achieves SUFFICIENT status under the strict reading. However, three models (GPT-5.6 Sol, Gemini 3.8 Flash,
GPT-5.6 Terra) have raw rows across 4 dimensions, though some rely on WEAK dimensions and non-frozen
effort configurations.

| Frozen Ladder Rung | Dimensions with Rows | Count | Unified Status | Collector A | Collector B | Notes |
|---|---|---|---|---|---|---|
| Opus 5.5 XHigh | D-IMPL, D-TERM | 2 | **PARTIAL** | PARTIAL | PARTIAL | SBP at Max effort (vendor); TB 4.0 vendor vs AA gap |
| Opus 5.5 High | D-TERM | 1 | **PARTIAL** | PARTIAL | PARTIAL | TB 4.0 AA row only |
| Opus 5.5 Medium | D-TERM | 1 | **PARTIAL** | PARTIAL | PARTIAL | TB 4.0 AA row only |
| GPT-5.6 Sol Medium | D-IMPL, D-TERM, D-ALGO, D-EDIT | 4 | **PARTIAL** | PARTIAL (Provisional SUFFICIENT) | SUFFICIENT (provisional) | D-ALGO/D-EDIT use Max effort; insufficient COVERED dimensions |
| DeepSeek V4.1 Max | D-TERM, D-EDIT | 2 | **PARTIAL** | PARTIAL | PARTIAL | Identity mapping: V4.1 Flash at max effort |
| Gemini 3.8 Flash High | D-IMPL (V2), D-TERM, D-ALGO, D-EDIT | 4 | **PARTIAL** | PARTIAL (Provisional SUFFICIENT) | SUFFICIENT (provisional) | D-IMPL on V2 not comparable to V1 |
| GPT-5.6 Terra High | D-IMPL, D-TERM, D-ALGO, D-EDIT | 4 | **PARTIAL** | PARTIAL (Provisional SUFFICIENT) | SUFFICIENT (provisional) | TB 4.0 AA high row anomalous (1.5%) |
| GPT-5.6 Luna XHigh | D-IMPL, D-TERM, D-EDIT | 3 | **PARTIAL** | PARTIAL | PARTIAL | SBP effort unstated |
| Gemini 3.7 Flash High | D-TERM, D-ALGO | 2 | **PARTIAL** | PARTIAL | PARTIAL | TB 2.1 and LiveCodeBench only |
| Gemini 3.6 Flash High | D-IMPL, D-TERM, D-ALGO | 3 | **PARTIAL** | PARTIAL | PARTIAL | SBP aggregator row (58.7%) |
| Mistral Medium 3.5 | D-TERM | 1 | **PARTIAL** | PARTIAL | PARTIAL | TB 2.1 row only; no verifiable Aider row |

---

## 4. Comparability Challenges

### 4.1 Harness Disparities
- **Terminal-Bench 4.0**: Vendor vs AA harness gap of 7-10 percentage points for same model+effort
  - Example: Opus 5.5 XHigh: 66.4% (vendor) vs 59.6% (AA)
  - Example: GPT-5.6 Terra: 23.6% (Google card) vs 1.5% (AA high) vs 35.4% (AA max)
- **Aider Polyglot**: Third-party rows claim Pass@2 but sit 30+ points below maintainer board for older models

### 4.2 Version Incompatibility
- **SWE-Bench Pro V1 vs V2**: Different task splits/protocols; cannot be pooled
- **Terminal-Bench versions**: 2.1 (saturated), 4.0 (discriminating), Hard (intermediate)

### 4.3 Effort Mismatches
- Many independent leaderboards report only `max` reasoning effort, not frozen High/Medium
- Identity mapping assumed: "DeepSeek V4.1 Max" = "DeepSeek V4.1 Flash at maximum reasoning effort"

---

## 5. Alignment Notes

- Collector A built `benchmark-registry.json` with 14 entries (12 RETAINED, 2 EXCLUDED)
- Collector B used matching benchmark_id scheme for 7 benchmarks with evidence rows
- EXCLUDED benchmarks (rulebench-doc, multidoc-syn) have no evidence rows, maintaining consistency
- All 53 evidence rows carry complete provenance per contract rules

---

## 6. Verifier's Corrections and Challenges

**Verifier Status**: Round 2 verification complete; see `round2/VERIFICATION.md` for detailed findings.

**Registry Existence Verification:**
- 13 of 14 registry entries verified to exist
- 1 entry failed: `rulebench-doc` (404 at source URL)

**Evidence Row Verification:**
- 26 rows directly verified (19 mandatory + 7 sampled with seed=42)
- 20 rows CONFIRMED (URL accessible)
- 6 rows REJECTED (HTTP 403 - OpenAI vendor pages with access restrictions)
- 27 rows remain UNVERIFIED (outside verification sample)

**Comparability Challenges Identified:**
1. SWE-Bench Pro validity contested by OpenAI (2026-07-08 audit: 27.4-34.1% broken tasks)
2. Terminal-Bench 4.0: Anomalous non-monotonic effort curve for GPT-5.6 Terra (high: 1.5%, max: 35.4%)
3. Aider Polyglot third-party provenance thin; cross-source comparability unsafe
