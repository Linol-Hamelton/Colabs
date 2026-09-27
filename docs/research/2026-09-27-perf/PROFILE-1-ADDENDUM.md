# PROFILE-1 Addendum: Per-File Worker Wall-Time Reconciliation

Frame: Task `task:profile1-addendum-and-report`, PROTO-DEC-0089 item 2 / R8.
Author: wave-1 author session (Gemini via agy), 2026-09-28.
Scope: Reconciling raw per-file worker wall times (`lifeMs`) from PROFILE-1 run data.

## 1. Primary Metrics and Figures

The operator has mechanically re-verified every figure below against the raw files:

- **W = 299.2 s**: the bench wall (raw `PROFILE-1/summary.json` of the run, key `wallS`).
- **`dispatch.test.cjs` = 276.8 s**: raw `PROFILE-1/stats/stats-dispatch.test.cjs-48512.json`, key `lifeMs` = 276814.
- **`hooks.test.cjs` = 252.48 s**: raw `PROFILE-1/stats/stats-hooks.test.cjs-17568.json`, key `lifeMs` = 252480.
- **The next pair**:
  - `gate.test.cjs` = 231.3 s (raw `PROFILE-1/stats/stats-gate.test.cjs-18444.json`, key `lifeMs` = 231295).
  - `validator-lightpath.test.cjs` = 231.2 s (raw `PROFILE-1/stats/stats-validator-lightpath.test.cjs-38476.json`, key `lifeMs` = 231199).

## 2. Condition Evaluation

Using the measured worker wall times as the file-level wall figures:

- **L** (largest file wall, $f^*$): 276.8 s (`dispatch.test.cjs`)
- **L2** (second largest file wall): 252.48 s (`hooks.test.cjs`)
- **L/W**: $276.814 / 299.2 = 0.925$
- **L - L2**: $276.80 - 252.48 = 24.32\text{ s}$
- **V3(a)**: $L / W \ge 0.90 \implies \mathbf{PASS}$ ($0.925 \ge 0.90$)
- **V3(b)**: $L - L2 \ge 20\text{ s} \implies \mathbf{PASS}$ ($24.32\text{ s} \ge 20\text{ s}$)
- **V3(c)/(d)**: **OPEN** (hotspot localisation in $f^*$ or helper, and single bounded test-only removal proposal pending author/owner confirmation)

## 3. Data Provenance and Worker Structure

Every stats file in `PROFILE-1/stats/` at `depth=1` represents exactly one test-file worker process (27 depth=1 entries; one per test file in `tests/`), capturing the `who`, `depth`, and `lifeMs` keys recorded by `preload.cjs` at worker exit. The `lifeMs` metric reflects the true wall-clock lifetime of the test runner worker executing that test file.

## 4. Verbatim Extraction Command

The figures above are derived directly from the raw depth=1 stats files via the following command:

```bash
node -e "const fs=require('fs'),p=require('path'),d='docs/research/2026-09-27-perf/PROFILE-1/stats';fs.readdirSync(d).filter(f=>f.endsWith('.json')).map(f=>JSON.parse(fs.readFileSync(p.join(d,f)))).filter(s=>s.depth===1).sort((a,b)=>b.lifeMs-a.lifeMs).forEach(s=>console.log((s.lifeMs/1000).toFixed(2)+' s '+s.who+' ('+s.lifeMs+' ms)'))"
```

PowerShell equivalent:
```powershell
Get-ChildItem docs/research/2026-09-27-perf/PROFILE-1/stats/*.json | ForEach-Object { Get-Content $_ | ConvertFrom-Json } | Where-Object { $_.depth -eq 1 } | Sort-Object lifeMs -Descending | ForEach-Object { "$([math]::Round($_.lifeMs/1000, 2)) s $($_.who) ($($_.lifeMs) ms)" }
```

## 5. Status

**pending script confirmation** (the figures wait for the improved `report.cjs`).
