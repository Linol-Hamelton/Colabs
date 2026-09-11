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
$env:PROTOCOL_TEST_POWERSHELL = (Get-Process -Id $PID).Path
try {
    & $node.Source --test --test-concurrency=1 @tests
    $testExit = $LASTEXITCODE
}
finally {
    $env:PROTOCOL_TEST_POWERSHELL = $previousShell
}
exit $testExit
