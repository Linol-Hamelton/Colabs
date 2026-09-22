# PowerShell script to clean up pilot data while preserving important evidence
Write-Host "Cleaning up pilot data directory..." -ForegroundColor Yellow

# Define the pilot data directory
$pilotDataDir = ".ai/runtime/pilot-data"

# Show current size before cleanup
$originalSize = (Get-ChildItem -Recurse $pilotDataDir | Measure-Object -Property Length -Sum).Sum
Write-Host "Current size: $($originalSize / 1MB) MB" -ForegroundColor Cyan

# Preserve evidence directories but clean up clone data
$clonesDir = Join-Path $pilotDataDir "local/clones"
$evidenceDir = Join-Path $pilotDataDir "local/evidence"
$cliEvidenceDir = Join-Path $pilotDataDir "cli-evidence"
$evidenceMainDir = Join-Path $pilotDataDir "evidence"

Write-Host "Cleaning clone directories (temporary data)..." -ForegroundColor Yellow

if (Test-Path $clonesDir) {
    Write-Host "Removing clone data: $clonesDir" -ForegroundColor Red
    Remove-Item $clonesDir -Recurse -Force
    Write-Host "Clone directories removed." -ForegroundColor Green
} else {
    Write-Host "Clone directory does not exist." -ForegroundColor Gray
}

# Show sizes of evidence directories to help decide what to preserve
Write-Host "`nEvidence directories:" -ForegroundColor Cyan

if (Test-Path $evidenceDir) {
    $size = (Get-ChildItem -Recurse $evidenceDir -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum
    Write-Host "  Local evidence: $($size / 1KB) KB - Preserving" -ForegroundColor Green
}

if (Test-Path $cliEvidenceDir) {
    $size = (Get-ChildItem -Recurse $cliEvidenceDir -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum
    Write-Host "  CLI evidence: $($size / 1KB) KB - Preserving" -ForegroundColor Green
}

if (Test-Path $evidenceMainDir) {
    $size = (Get-ChildItem -Recurse $evidenceMainDir -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum
    Write-Host "  Main evidence: $($size / 1KB) KB - Preserving" -ForegroundColor Green
}

# Create a summary of the cleanup
$newSize = (Get-ChildItem -Recurse $pilotDataDir | Measure-Object -Property Length -Sum).Sum
$reduction = $originalSize - $newSize

Write-Host "`nCleanup completed!" -ForegroundColor Green
Write-Host "Space freed: $($reduction / 1MB) MB" -ForegroundColor Cyan
Write-Host "Final size: $($newSize / 1MB) MB" -ForegroundColor Cyan

Write-Host "`nNote: Evidence directories preserved as they may contain important validation data." -ForegroundColor Yellow
Write-Host "The clone data was temporary experimental data that is no longer needed after MCP council conclusion." -ForegroundColor Gray