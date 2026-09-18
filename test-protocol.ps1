# Run the protocol regression suite without installing npm packages.
# ASCII-only, UTF-8 without BOM, LF. Requires Node.js 22 or later.
[CmdletBinding()]
param()
$ErrorActionPreference = "Stop"
$ProtocolRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$node = Get-Command node -ErrorAction SilentlyContinue
if (-not $node) {
    Write-Error "Node.js 22 or later is required for protocol tests."
    exit 1
}
$version = & $node.Source --version
if ($LASTEXITCODE -ne 0 -or $version -notmatch '^v(\d+)\.' -or [int]$Matches[1] -lt 22) {
    Write-Error "Node.js 22 or later is required for protocol tests."
    exit 1
}
$tests = @(Get-ChildItem -LiteralPath (Join-Path $ProtocolRoot "tests") -Filter "*.test.cjs" -File |
    Sort-Object Name | ForEach-Object { $_.FullName })
if ($tests.Count -eq 0) {
    Write-Error "No protocol regression tests were found."
    exit 1
}
$previousShell = $env:PROTOCOL_TEST_POWERSHELL
$previousFastChecks = $env:PROTOCOL_TEST_FAST_CHECKS
$env:PROTOCOL_TEST_POWERSHELL = (Get-Process -Id $PID).Path
$env:PROTOCOL_TEST_FAST_CHECKS = "1"
try {
    $concurrency = [Math]::Max(1, [Math]::Min(16, [Environment]::ProcessorCount))
    & $node.Source --test --test-concurrency=$concurrency @tests
    $testExit = $LASTEXITCODE
}
finally {
    $env:PROTOCOL_TEST_POWERSHELL = $previousShell
    $env:PROTOCOL_TEST_FAST_CHECKS = $previousFastChecks
}
exit $testExit
