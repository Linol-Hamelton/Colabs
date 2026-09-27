# Phase-0 Baseline Measurements (Program ROADMAP-1, Wave 1)

Date: 2026-09-27  
Executor: `gemini-64401c9d1745781d` (Gemini 3.8 Flash high via agy)  
Baseline commit anchor: `aac9681` (clean working tree prior to baseline doc)  
References: `docs/research/2026-09-25-validator-migration-council/final-plan-2.md` (Sections V and AC), `docs/research/2026-09-27-roadmap-queue/LAUNCH-W1.md` (Item 6), `PACKET-1.md` (Q4).

---

## 1. Machine & Environment Specifications

- **OS**: Microsoft Windows 11 Pro (10.0.26200, Build 26200)
- **CPU**: 13th Gen Intel(R) Core(TM) i9-13900HX (24 cores, 32 logical processors)
- **Memory**: 31.70 GB total physical RAM
- **PowerShell**: 5.1.26100.9444 (Windows PowerShell 5.1 desktop edition)
- **Node.js**: v22.21.0 (x64)
- **Git HEAD**: `aac9681f21db59762691fa0be98939c32f8ebf5c`

---

## 2. Measurement Methodology

1. **Pre-flight isolation**: Verified via full WMI process scan (`Get-CimInstance Win32_Process`) that no concurrent test, benchmark, or protocol sessions were executing on the workstation. Runs were completely exclusive.
2. **Measurement harness**: Executed via `.ai/runtime/measure-baseline.ps1` using native Windows high-resolution timers (`System.Diagnostics.Stopwatch`) and asynchronous process-tree tracking.
3. **Process-tree sampling**: Requested sleep interval 800–1000 ms; observed mean sampling interval ~1.21 s (including WMI/CIM scan overhead via `Get-CimInstance Win32_Process -Property ProcessId, ParentProcessId, WorkingSetSize`). At each sample interval:
   - Evaluated the dynamic process hierarchy originating from the root PowerShell process.
   - Identified all active tree members and calculated the instantaneous aggregate Working Set (`WorkingSetSize`).
   - Tracked all distinct process IDs spawned during execution to compute total descendant process count `Bn`.
   - Recorded peak combined tree Working Set `Bm`.

---

## 3. Core Baseline Results

| Metric | Target | Value | Units | Samples | Description |
|---|---|---:|---|---:|---|
| **Bv** | `validate-protocol.ps1` | **6.182** | seconds | 5 | Real-tree validator wall time |
| **Bn (val)** | `validate-protocol.ps1` | **4** | processes | - | Distinct descendant processes (5 total including root) |
| **Bm (val)** | `validate-protocol.ps1` | **230.38** | MB (241,569,792 B) | 5 | Peak combined process-tree RSS |
| **Bs** | `test-protocol.ps1` | **590.781** | seconds | 488 | Real-tree full regression suite wall time |
| **Bn (suite)** | `test-protocol.ps1` | **2,370** | processes | - | Distinct descendant processes (2,371 total including root) |
| **Bm (suite)** | `test-protocol.ps1` | **2,575.15** | MB (2,700,238,848 B) | 488 | Peak combined process-tree RSS |

Both benchmark runs exited with exit code `0`:
- `validate-protocol.ps1`: `Protocol OK. 0 warning(s).`
- `test-protocol.ps1`: Full suite passed cleanly (duration_ms 590,158.32 ms).

---

## 4. Telemetry Details

### 4.1 Validator (`validate-protocol.ps1`)
```json
{
  "TargetScript": ".\\validate-protocol.ps1",
  "ExitCode": 0,
  "LastOutput": "Protocol OK. 0 warning(s).",
  "StartUtc": "2026-09-27T08:16:17.7379554Z",
  "EndUtc": "2026-09-27T08:16:23.9246044Z",
  "WallTimeSeconds": 6.182,
  "WallTimeMs": 6182,
  "SampleCount": 5,
  "DescendantProcessCount_Bn": 4,
  "TotalProcessCount": 5,
  "PeakTreeRssBytes_Bm": 241569792,
  "PeakTreeRssMB": 230.38
}
```

### 4.2 Full Regression Suite (`test-protocol.ps1`)
```json
{
  "TargetScript": ".\\test-protocol.ps1",
  "ExitCode": 0,
  "LastOutput": "# duration_ms 590158.3155",
  "StartUtc": "2026-09-27T08:06:14.1554200Z",
  "EndUtc": "2026-09-27T08:16:04.9459801Z",
  "WallTimeSeconds": 590.781,
  "WallTimeMs": 590780,
  "SampleCount": 488,
  "DescendantProcessCount_Bn": 2370,
  "TotalProcessCount": 2371,
  "PeakTreeRssBytes_Bm": 2700238848,
  "PeakTreeRssMB": 2575.15
}
```
