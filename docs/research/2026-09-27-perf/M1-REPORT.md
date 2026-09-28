# Perf Wave 1 Measurement Campaign (M1) Report

**Frame**: PROTO-DEC-0087 item 1 (`task:perf-wave-1-m1`)  
**Date**: 2026-09-27  
**Session Agent**: Gemini 3.8 Flash high (via agy CLI)  
**Session ID**: `b708cec06c059aa7`  
**Receipt Owner**: `gemini-b569642056824e5c`  

---

## 1. Machine Specifications

- **OS**: Microsoft Windows 11 Pro (10.0.26200)
- **CPU**: 13th Gen Intel(R) Core(TM) i9-13900HX (24 physical cores: 8 P-cores + 16 E-cores, 32 logical processors)
- **RAM**: 32 GB Physical Memory
- **Node.js**: v22.21.0
- **PowerShell**: 5.1.26100.9444
- **Test Concurrency**: 16 (configured via `[Math]::Max(1, [Math]::Min(16, [Environment]::ProcessorCount))` in `test-protocol.ps1`)
- **System State**: Workstation idle; background processes monitored and no concurrent test or record sessions.

---

## 2. Measurement Campaign

### 2.1 Diagnostic Run (Baseline in `perf1a` at `e752c0c`)

Worktree: `D:\Colabs\.ai\runtime\perf1a`  
Commit: `e752c0c45818baf294d97c2bad845a3dc861d7d3` ("perf(tests): seed fixtures by writing the protocol file set instead of copying it")  
Suite structure: Single sequential `validator.test.cjs` running 34 tests in sequence.

- **Start Time**: `2026-09-27T21:19:02.784+03:00`
- **End Time**: `2026-09-27T21:27:15.855+03:00`
- **Exit Code**: `0`
- **Test Results**: 420 passed / 0 failed (100% pass)
- **Node Test Duration**: 492.62 s (`492624.05 ms`)
- **Diagnostic Wall Time**: **493.12 s**

---

### 2.2 Five Full Runs (`perf1` at `64043a3`)

Worktree: `D:\Colabs\.ai\runtime\perf1`  
Branch: `perf-wave-1`  
Commit: `64043a32617838fe3600cc42e3dd2d3db935cc88` ("perf(tests): split validator.test.cjs into four files by test family") with M1 launch docs commit `14bc608`  
Suite structure: `validator.test.cjs` split into 4 parallel files (`validator-gate.test.cjs`, `validator-decisions.test.cjs`, `validator-lightpath.test.cjs`, `validator.test.cjs`) executed across 16 concurrency workers.

| Run # | Start Timestamp | End Timestamp | Exit Code | Tests Passed | Node Duration (s) | Wall Time (s) |
| :---: | :--- | :--- | :---: | :---: | :---: | :---: |
| **1** | `2026-09-27T21:27:31.316+03:00` | `2026-09-27T21:32:36.493+03:00` | 0 | 420 / 420 | 304.78 | 305.23 |
| **2** | `2026-09-27T21:32:47.170+03:00` | `2026-09-27T21:38:02.434+03:00` | 0 | 420 / 420 | 314.86 | 315.31 |
| **3** | `2026-09-27T21:38:13.494+03:00` | `2026-09-27T21:43:19.697+03:00` | 0 | 420 / 420 | 305.78 | 306.24 |
| **4** | `2026-09-27T21:43:31.572+03:00` | `2026-09-27T21:48:29.155+03:00` | 0 | 420 / 420 | 297.15 | 297.63 |
| **5** | `2026-09-27T21:48:40.305+03:00` | `2026-09-27T21:53:48.458+03:00` | 0 | 420 / 420 | 307.77 | 308.20 |

---

## 3. Analysis & Statistics

- **Sorted Wall Times**:
  1. `297.63 s` (Run 4)
  2. `305.23 s` (Run 1)
  3. `306.24 s` (Run 3) — **Median**
  4. `308.20 s` (Run 5)
  5. `315.31 s` (Run 2)

- **Sorted Node Durations**:
  1. `297.15 s` (Run 4)
  2. `304.78 s` (Run 1)
  3. `305.78 s` (Run 3) — **Median**
  4. `307.77 s` (Run 5)
  5. `314.86 s` (Run 2)

- **Mean Wall Time**: `306.52 s`
- **Median Wall Time**: **306.24 s**
- **Median Node Test Duration**: `305.78 s`
- **Reduction vs Baseline (`perf1a` 493.12 s)**: -186.88 s (-37.9%)

---

## 4. Acceptance Evaluation

- **Acceptance Criterion**: Median of the five `64043a3` runs **<= 300 s**.
- **Measured Median**: **306.24 s** (exceeds 300 s threshold by +6.24 s).
- **Campaign Rule**: "If the median is above 300 s, the campaign fails: write the numbers, mark the verdict `M1 MISSED`, stop; nothing is merged."

### Verdict

**`M1 MISSED`**

---

## 5. Next Steps & Operator Notes

1. In accordance with `docs/research/2026-09-27-perf/M1-LAUNCH.md`, because the verdict is `M1 MISSED`, execution stops and **nothing is merged**.
2. If an operator review or relaxed threshold were ever applied, the operator must verify merge overlaps between `perf-wave-1` and `kernel-batch-1` (`git diff --name-only`) prior to any merge action. Under current campaign rules, the branch remains unmerged.
