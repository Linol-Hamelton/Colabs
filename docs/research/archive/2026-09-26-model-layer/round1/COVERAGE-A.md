# COVERAGE-A - Collector A Coverage Draft (Round 1)

Frame: `task:f02-collector-a` (parent frame: F-02, `docs/research/2026-09-26-model-layer/README.md`)  
Collector: `gemini` (Gemini 3.8 Flash high via agy)  
Date: 2026-09-26 (UTC)  
Scope: Per-dimension and per-model benchmark coverage audit based on `benchmark-registry.json` and Collector B's `model-benchmark-evidence.jsonl`.

This is the Collector A coverage audit draft. Collector B composed `round1/COVERAGE-B.md` in parallel; the unified cross-verified audit and profile computations will be assembled at Round 2. All classifications follow the strict thresholds of the Frame F-02 Contract (`README.md`).

---

## 1. Executive Summary

- **6 Core Benchmark Dimensions Evaluated**:
  - **1 COVERED** (`D-TERM`);
  - **3 WEAK** (`D-IMPL`, `D-ALGO`, `D-EDIT`);
  - **2 MISSING** (`D-ARCH`, `D-REV`).
- **3 Local/Auxiliary Dimensions Evaluated**:
  - **3 MISSING** (`D-DOC`, `D-CRIT`, `D-SYN`).
- **Benchmark Registry Status**:
  - 14 benchmarks processed: 12 RETAINED, 2 EXCLUDED (`rulebench-doc`, `multidoc-syn`).
  - Total public evidence rows available across all 11 frozen working rungs: 53 rows (collected in `model-benchmark-evidence.jsonl`).
- **Core Structural Finding**:
  The public benchmark ecosystem exhibits severe temporal misalignment with frontier model generations. For 5 of the 9 dimensions (`D-ARCH`, `D-REV`, `D-CRIT`, `D-DOC`, `D-SYN`), exactly **zero public benchmark observations exist** for any model in the frozen 2026-09 working ladder. Only `D-TERM` (Terminal-Bench) possesses sufficient cross-model density to achieve `COVERED`.

---

## 2. Per-Dimension Coverage Audit

The Frame Contract defines coverage thresholds as:
- `COVERED`: At least 1 RETAINED benchmark with strength `HIGH`, and comparable rows for at least half of the frozen working models ($\ge 6$ of 11).
- `WEAK`: Some evidence, below that threshold, or proxy evidence only (`evidence_type: proxy`).
- `MISSING`: None.

| Id | Dimension | Retained Benchmark(s) | Frozen Models with Rows ($n/11$) | Verdict | Detailed Reason & Contamination / Comparability Notes |
|---|---|---|---|---|---|
| **D-IMPL** | Repository implementation & bug fixing | `swe-bench-pro`, `swe-bench-pro-v2`, `swe-lancer-ic` | 5 / 11 (`swe-bench-pro` public split: Opus 5.5, Sol, Terra, Luna, Gemini 3.6) | **WEAK** | Below the $\ge 6/11$ threshold on the primary split. `swe-bench-pro-v2` adds Gemini 3.8 but uses a different task split/protocol that cannot be pooled with V1. OpenAI's 2026-07-08 audit found 27.4–34.1% broken tasks on public SWE-bench Pro. SWE-Lancer IC has 0 frozen rows. |
| **D-ARCH** | Architecture & repository comprehension | `repoprobe`, `archbench` | 0 / 11 | **MISSING** | RepoProbe (ASE 2026) evaluates models only up to GPT-5.4 / Opus 4.6; ArchBench evaluates older models (GPT-4, DeepSeek-V2.5). Neither contains public evaluation rows for the 11 frozen 2026-09 ladder rungs. |
| **D-REV** | Code review | `aacr-bench` | 0 / 11 | **MISSING** | AACR-Bench evaluates Claude 4.5 Sonnet, GPT-5.2, DeepSeek V3.2, GLM 4.7, and Qwen 480B Coder. No public evaluation results exist for current frozen rungs. |
| **D-TERM** | Terminal, debugging & autonomous execution | `terminal-bench-4.0`, `terminal-bench-2.1`, `terminal-bench-hard` | 11 / 11 (all frozen rungs have rows) | **COVERED** | All 11 rungs possess comparable rows across Terminal-Bench releases. TB 4.0 covers 6 rungs directly (including all 3 Opus 5.5 tiers); TB 2.1 and vendor cards cover the rest. Caution: vendor vs. independent (AA) harness gap spans 7–10 percentage points. |
| **D-ALGO** | Algorithmic coding | `livecodebench` | 5 / 11 (Gemini 3.8, 3.7, 3.6, Terra, Sol) | **WEAK** | Below the $\ge 6/11$ threshold. Current evidence relies solely on the Vals AI evaluation window. Algorithmic puzzles offer only weak proxy correlation for multi-file repository maintenance. |
| **D-EDIT** | Code editing & patch instruction following | `aider-polyglot` | 5 / 11 (Sol, Terra, Luna, Gemini 3.8, DeepSeek V4.1) | **WEAK** | Below the $\ge 6/11$ threshold. Maintainer board has not updated for 2026 frontier models; available rows stem from third-party replications with unverified scaffold settings. |
| **D-DOC** | Document & rule comprehension | None (Candidate `rulebench-doc` EXCLUDED) | 0 / 11 | **MISSING** | Bounded candidate pass confirms no public benchmark evaluates repository-level rulebooks, protocol adherence, or multi-file architectural constraints. Local evaluation only. |
| **D-CRIT** | Adversarial review & critical analysis | `swe-lancer-manager` (proxy only, capped at WEAK) | 0 / 11 | **MISSING** | Capped at `WEAK` by contract definition. No public evaluations exist on the Manager track for any frozen model. With 0 rows, the operational status is `MISSING`. Local evaluation only. |
| **D-SYN** | Multi-document synthesis | None (Candidate `multidoc-syn` EXCLUDED) | 0 / 11 | **MISSING** | Bounded candidate pass confirms no public benchmark evaluates multi-document architectural synthesis, change coordination, or protocol ledger consolidation. Local evaluation only. |

---

## 3. Per-Model Evidence Status (Provisional Read)

The Frame Contract defines evidence status per model as:
- `SUFFICIENT`: COVERED-level rows on at least 4 of the 6 benchmark dimensions;
- `PARTIAL`: 1–3;
- `INSUFFICIENT`: 0.

*Note: Since only 1 benchmark dimension (`D-TERM`) meets the `COVERED` threshold at the dimension level, strictly speaking no model achieves 4 COVERED-level dimensions. If evaluated against available raw rows (as Collector B explored), three models provisionally show rows across 4 dimensions, but these rest on `WEAK` dimensions and non-frozen effort configurations.*

| Frozen Ladder Rung | Dimensions with Raw Rows | Dimension Count | Provisional Status | Critical Caveats |
|---|---|---|---|---|
| **Opus 5.5 XHigh** | `D-IMPL`, `D-TERM` | 2 | **PARTIAL** | SBP row is at Max effort (vendor card); TB 4.0 has both vendor (66.4%) and AA (59.6%) rows. |
| **Opus 5.5 High** | `D-TERM` | 1 | **PARTIAL** | TB 4.0 AA row (56.6%). |
| **Opus 5.5 Medium** | `D-TERM` | 1 | **PARTIAL** | TB 4.0 AA row (52.5%). |
| **GPT-5.6 Sol Medium** | `D-IMPL`, `D-TERM`, `D-ALGO`, `D-EDIT` | 4 | **PARTIAL (Provisional SUFFICIENT)** | SBP row effort unstated; D-ALGO and D-EDIT rows use Max effort; TB 4.0 medium is 14.7%. |
| **DeepSeek V4.1 Max** | `D-TERM`, `D-EDIT` | 2 | **PARTIAL** | Identity mapping assumes V4.1 Flash at maximum reasoning effort; TB 4.0 vendor vs AA discrepancy (31.2% vs 26.8%). |
| **Gemini 3.8 Flash High** | `D-IMPL`, `D-TERM`, `D-ALGO`, `D-EDIT` | 4 | **PARTIAL (Provisional SUFFICIENT)** | D-IMPL rests on SWE-bench Pro V2 (94.86%), which is not comparable to V1; TB 4.0 AA row (19.7%). |
| **GPT-5.6 Terra High** | `D-IMPL`, `D-TERM`, `D-ALGO`, `D-EDIT` | 4 | **PARTIAL (Provisional SUFFICIENT)** | SBP row unstated effort; TB 4.0 AA high-effort row is anomalously low (1.5%) vs vendor card (23.6%) and AA max (35.4%). |
| **GPT-5.6 Luna XHigh** | `D-IMPL`, `D-TERM`, `D-EDIT` | 3 | **PARTIAL** | SBP row unstated effort; TB 4.0 row is at max effort. |
| **Gemini 3.7 Flash High** | `D-TERM`, `D-ALGO` | 2 | **PARTIAL** | TB 2.1 and LiveCodeBench rows only. |
| **Gemini 3.6 Flash High** | `D-IMPL`, `D-TERM`, `D-ALGO` | 3 | **PARTIAL** | SBP aggregator row (58.7%); TB 2.1 row (65.2%). |
| **Mistral Medium 3.5** | `D-TERM` | 1 | **PARTIAL** | TB 2.1 row (52.8%); no verifiable Aider row found. |

---

## 4. Alignment with Collector B

- **Schema & Identifier Alignment**:
  Collector A's `round1/benchmark-registry.json` adopts the exact IDs used in Collector B's `round1/model-benchmark-evidence.jsonl`:
  - `swe-bench-pro`
  - `swe-bench-pro-v2`
  - `terminal-bench-4.0`
  - `terminal-bench-2.1`
  - `terminal-bench-hard`
  - `livecodebench`
  - `aider-polyglot`
  Plus unpopulated registry entries for `swe-lancer-ic`, `repoprobe`, `archbench`, `aacr-bench`, and `swe-lancer-manager`.
- **Exclusions**:
  The 2 excluded benchmarks (`rulebench-doc`, `multidoc-syn`) have no evidence rows in `model-benchmark-evidence.jsonl`, maintaining total consistency.

---

## 5. Strategic Recommendations for Round 2 & The Gate

1. **Gate Acceptance of Asymmetric Portfolio**:
   The owner should anticipate that external benchmarks cannot provide full coverage for Model Resolver v1. The public benchmark ecosystem serves almost exclusively `D-TERM`, `D-IMPL` (partially), and `D-ALGO`. 
2. **Local Evaluation Mandate for Critical Roles**:
   `D-ARCH` (architects), `D-REV` (reviewers), `D-DOC` (protocol/rule checkers), and `D-CRIT` (adversarial certifiers) cannot be selected based on external public benchmarks today. Selection for these roles must rely on local repository probes and verified paired-cycle performance ledgers.
3. **Rejection of SWE-Bench Pro / Pro-V2 Pooling**:
   The Round 2 verifier must strictly reject any normalization that pools `swe-bench-pro` (731 tasks) and `swe-bench-pro-v2` (642 tasks). They are distinct distributions.
4. **Scrutiny of Effort Normalization**:
   Many independent benchmark leaderboards (e.g. Artificial Analysis, Vals AI) report only `max` reasoning effort rather than the specific `High` or `Medium` rungs in the owner's frozen ladder. These rows must remain flagged as `comparability: partial`.
