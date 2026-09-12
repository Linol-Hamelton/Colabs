# AI Collaboration Protocol validator. ASCII-only; PowerShell 5.1 compatible.
# Validates repository-owned text and protocol state without changing files.
[CmdletBinding()]
param([switch]$Quiet)

$ErrorActionPreference = "Stop"
# PowerShell 5.1 writes the console in the OEM codepage, which mangles
# non-ASCII file names in this report and in any captured output. Force UTF-8
# so a name stays readable in logs, in CI and in test assertions.
try { [Console]::OutputEncoding = New-Object System.Text.UTF8Encoding($false) } catch { }
$Root = $PSScriptRoot
$script:Failures = 0
$script:Warnings = 0
$StrictUtf8 = New-Object System.Text.UTF8Encoding($false, $true)

function Write-Result {
    param([string]$Status, [string]$Message)
    $color = "Gray"
    if ($Status -eq "PASS") { $color = "Green" }
    if ($Status -eq "FAIL") { $color = "Red"; $script:Failures++ }
    if ($Status -eq "WARN") { $color = "Yellow"; $script:Warnings++ }
    if (-not ($Quiet -and $Status -eq "PASS")) {
        Write-Host ("[{0}] {1}" -f $Status, $Message) -ForegroundColor $color
    }
}

function Invoke-External {
    param([string]$Executable, [string[]]$Arguments)
    # PS 5.1 treats redirected native stderr as PowerShell errors. Capture
    # streams separately and preserve NUL-delimited Git paths as one string.
    $quoted = foreach ($argument in $Arguments) {
        '"' + [regex]::Replace([regex]::Replace($argument, '(\\*)"', '$1$1\"'), '(\\+)$', '$1$1') + '"'
    }
    $info = New-Object System.Diagnostics.ProcessStartInfo
    $info.FileName = $Executable
    $info.Arguments = $quoted -join ' '
    $info.WorkingDirectory = $Root
    $info.UseShellExecute = $false
    $info.CreateNoWindow = $true
    $info.RedirectStandardOutput = $true
    $info.RedirectStandardError = $true
    $info.StandardOutputEncoding = [System.Text.Encoding]::UTF8
    $info.StandardErrorEncoding = [System.Text.Encoding]::UTF8
    $process = New-Object System.Diagnostics.Process
    $process.StartInfo = $info
    try {
        [void]$process.Start()
        $outputTask = $process.StandardOutput.ReadToEndAsync()
        $errorTask = $process.StandardError.ReadToEndAsync()
        $process.WaitForExit()
        return @{ Code = $process.ExitCode; Output = $outputTask.Result; Error = $errorTask.Result }
    }
    catch { return @{ Code = -1; Output = ""; Error = $_.Exception.Message } }
    finally { $process.Dispose() }
}

function Read-ProtocolText {
    param([string]$Path)
    try { return [System.IO.File]::ReadAllText($Path, $StrictUtf8) }
    catch { Write-Result "FAIL" ("cannot read UTF-8 text: {0}" -f $Path); return $null }
}

function Get-LineCount {
    param([string]$Text)
    if ($Text.Length -eq 0) { return 0 }
    $count = ([regex]::Matches($Text, "`n")).Count
    if (-not $Text.EndsWith("`n")) { $count++ }
    return $count
}

Write-Host "AI Collaboration Protocol - validation"
Write-Host "Root: $Root"

# The required set comes from protocol-manifest.json, the same file the
# installer copies from. Two lists that had to agree failed three times; see
# DEC-0012. A missing or malformed manifest is itself a failure.
$Required = @()
$manifestPath = Join-Path $Root 'protocol-manifest.json'
if (-not (Test-Path -LiteralPath $manifestPath -PathType Leaf)) {
    Write-Result "FAIL" "missing file: protocol-manifest.json"
}
else {
    try {
        $manifest = Get-Content -LiteralPath $manifestPath -Raw | ConvertFrom-Json
        $Required = @($manifest.managed) + @($manifest.tests) + @($manifest.integration) +
            @($manifest.state | ForEach-Object { '.ai/' + $_ })
    }
    catch {
        Write-Result "FAIL" ("protocol-manifest.json is not valid JSON: " + $_.Exception.Message)
        $Required = @()
    }
}
foreach ($relative in $Required) {
    if (Test-Path -LiteralPath (Join-Path $Root $relative) -PathType Leaf) {
        Write-Result "PASS" "present: $relative"
    }
    else { Write-Result "FAIL" "missing file: $relative" }
}

# Git selects tracked and untracked nonignored paths. A linked worktree has a
# .git file; merely finding a .git directory accepts corrupt repositories.
$gitCommand = Get-Command git -CommandType Application -ErrorAction SilentlyContinue | Select-Object -First 1
$paths = @($Required)
$script:GitUsable = $false
if (-not $gitCommand) { Write-Result "FAIL" "git is unavailable; install Git and add it to PATH" }
else {
    $inside = Invoke-External $gitCommand.Source @('-C', $Root, 'rev-parse', '--is-inside-work-tree')
    $top = Invoke-External $gitCommand.Source @('-C', $Root, 'rev-parse', '--show-toplevel')
    if ($inside.Code -ne 0 -or $inside.Output.Trim() -ne 'true' -or $top.Code -ne 0) {
        Write-Result "FAIL" "not a valid Git working tree at the protocol root"
    }
    elseif ([System.IO.Path]::GetFullPath($top.Output.Trim()) -ne [System.IO.Path]::GetFullPath($Root)) {
        Write-Result "FAIL" "protocol root is inside another repository; initialize or use its actual root"
    }
    else {
        Write-Result "PASS" "valid Git working tree"
        $script:GitUsable = $true
        $listing = Invoke-External $gitCommand.Source @('-C', $Root, 'ls-files', '--cached', '--others', '--exclude-standard', '-z')
        if ($listing.Code -ne 0) { Write-Result "FAIL" ("cannot enumerate Git files: " + $listing.Error.Trim()) }
        else { $paths += $listing.Output.Split([char]0) | Where-Object { $_.Length -gt 0 } }
        $history = Invoke-External $gitCommand.Source @('-C', $Root, 'rev-list', '--all', '--count')
        if ($history.Code -ne 0 -or $history.Output.Trim() -notmatch '^\d+$') {
            Write-Result "FAIL" ("cannot read Git history: " + $history.Error.Trim())
        }
        elseif ([long]$history.Output.Trim() -eq 0) { Write-Result "WARN" "no commits yet; Git history is empty" }
        else { Write-Result "PASS" ("commits on record: " + $history.Output.Trim()) }
    }
}

# Check core state even if ignored. Never crawl ignored dependency/cache trees.
$worklogDirectory = Join-Path $Root '.ai/worklog'
if (Test-Path -LiteralPath $worklogDirectory -PathType Container) {
    $paths += Get-ChildItem -LiteralPath $worklogDirectory -Filter '*.md' -File -Force | ForEach-Object { '.ai/worklog/' + $_.Name }
}
# Only protocol-owned files are inspected. Applying these rules to everything
# Git can see meant an installed project failed validation because its own
# source used CRLF, which is the host project's business and not this
# protocol's. Ownership is the manifest plus the directories it creates.
function Test-ProtocolOwned {
    param([string]$Relative)
    # Initialized once and then owned by the host, including its formatting.
    if ($Relative.Replace([char]92, '/') -eq '.codex/config.toml') { return $false }
    if ($Required -contains $Relative) { return $true }
    # Protocol-specific by name, and not installed into host projects.
    if ($Relative -eq '.github/workflows/protocol.yml') { return $true }
    $normalized = $Relative.Replace([char]92, '/')
    foreach ($prefix in @('.ai/', 'templates/ai/', '.claude/hooks/')) {
        if ($normalized.StartsWith($prefix)) { return $true }
    }
    return $false
}

$textExtensions = @('.md', '.txt', '.json', '.jsonc', '.sh', '.ps1', '.psm1', '.psd1', '.cjs', '.mjs', '.js', '.jsx', '.ts', '.tsx', '.yml', '.yaml', '.toml', '.ini', '.xml', '.html', '.css', '.scss', '.svg', '.py', '.rb', '.go', '.rs', '.sql', '.csv')
$textNames = @('.editorconfig', '.gitattributes', '.gitignore', '.npmrc', '.nvmrc', 'Dockerfile', 'Makefile')
$textCount = 0
foreach ($relative in ($paths | Sort-Object -Unique)) {
    $full = Join-Path $Root $relative
    if (-not (Test-Path -LiteralPath $full -PathType Leaf)) { continue }
    $file = Get-Item -LiteralPath $full -Force
    if (($file.Attributes -band [System.IO.FileAttributes]::ReparsePoint) -ne 0) {
        Write-Result "WARN" "symlink content not inspected: $relative"
        continue
    }
    if (-not (Test-ProtocolOwned $relative)) { continue }
    if ($textExtensions -notcontains $file.Extension -and $textNames -notcontains $file.Name) { continue }
    $textCount++
    $bytes = [System.IO.File]::ReadAllBytes($full)
    if ($bytes.Length -ge 3 -and $bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF) {
        Write-Result "FAIL" "byte order mark present: $relative"
    }
    try { [void]$StrictUtf8.GetString($bytes) }
    catch { Write-Result "FAIL" "invalid UTF-8: $relative" }
    if ($bytes -contains 0) { Write-Result "FAIL" "NUL byte in text (possibly UTF-16): $relative" }
    if ($bytes -contains 13) { Write-Result "FAIL" "CR/CRLF found; use LF line endings: $relative" }
    if ($file.Extension -in @('.ps1', '.psm1', '.psd1')) {
        if (@($bytes | Where-Object { $_ -gt 127 }).Count -gt 0) {
            Write-Result "FAIL" "non-ASCII byte in PowerShell script: $relative"
        }
        $tokens = $null
        $parseErrors = $null
        [void][System.Management.Automation.Language.Parser]::ParseFile($full, [ref]$tokens, [ref]$parseErrors)
        foreach ($parseError in $parseErrors) { Write-Result "FAIL" ("PowerShell syntax in {0}: {1}" -f $relative, $parseError.Message) }
    }
}
Write-Result "PASS" "inspected $textCount protocol-owned text files for UTF-8, BOM, LF and PowerShell syntax"

# One journal per session keeps writers from colliding, but the directory grows
# without bound unless old journals are archived. See AGENTS.md section 8.
$journals = @($paths | Where-Object { $_ -match '^\.ai/worklog/[^/]+\.md$' } | Sort-Object -Unique)
if ($journals.Count -gt 30) {
    Write-Result "WARN" ("{0} session journals in .ai/worklog; archive the oldest into .ai/ARCHIVE.md" -f $journals.Count)
}

$limits = @{ '.ai/TASK.md' = 80; '.ai/PLAN.md' = 200 }
foreach ($relative in ($paths | Where-Object { $_ -match '^\.ai/worklog/[^/]+\.md$' } | Sort-Object -Unique)) { $limits[$relative] = 150 }
foreach ($relative in $limits.Keys) {
    $full = Join-Path $Root $relative
    if (-not (Test-Path -LiteralPath $full -PathType Leaf)) { continue }
    $content = Read-ProtocolText $full
    if ($null -eq $content) { continue }
    $lines = Get-LineCount $content
    if ($lines -gt $limits[$relative]) {
        Write-Result "FAIL" ("{0}: {1} lines exceeds limit of {2}" -f $relative, $lines, $limits[$relative])
    }
    else { Write-Result "PASS" ("{0}: {1}/{2} lines" -f $relative, $lines, $limits[$relative]) }
}

$claudePath = Join-Path $Root 'CLAUDE.md'
if (Test-Path -LiteralPath $claudePath -PathType Leaf) {
    $claudeText = Read-ProtocolText $claudePath
    if ($claudeText -match '(?m)^@(?:\./)?AGENTS\.md[ \t]*$') { Write-Result "PASS" "CLAUDE.md imports AGENTS.md" }
    else { Write-Result "FAIL" "CLAUDE.md must import @AGENTS.md on its own line" }
}

$settingsPath = Join-Path $Root '.claude/settings.json'
if (Test-Path -LiteralPath $settingsPath -PathType Leaf) {
    try {
        $settings = (Read-ProtocolText $settingsPath) | ConvertFrom-Json
        foreach ($event in @('SessionStart', 'Stop')) {
            $wrapper = if ($event -eq 'SessionStart') { 'session-start.sh' } else { 'stop-worklog-check.sh' }
            # Silent outside a Git checkout and when the wrapper is absent, so a
            # project that is not a repository does not print Git errors on start.
            $expected = 'r="$(git -C "${CLAUDE_PROJECT_DIR:-.}" rev-parse --show-toplevel 2>/dev/null)"'
            $expected += ' && [ -f "$r/.claude/hooks/' + $wrapper + '" ]'
            $expected += ' && bash "$r/.claude/hooks/' + $wrapper + '" || true'
            $matching = @($settings.hooks.$event | ForEach-Object { $_.hooks } | Where-Object { $_.type -eq 'command' -and $_.command -ceq $expected })
            if ($matching.Count -eq 1) { Write-Result "PASS" "$event protocol hook command configured" }
            else { Write-Result "FAIL" "$event must configure exactly one canonical protocol hook command" }
        }
    }
    catch { Write-Result "FAIL" ("invalid Claude settings JSON: " + $_.Exception.Message) }
}

$nodeCommand = Get-Command node -CommandType Application -ErrorAction SilentlyContinue | Select-Object -First 1
if (-not $nodeCommand) { Write-Result "FAIL" "node is unavailable; protocol hooks require Node.js on PATH" }
else {
    $nodeVersion = Invoke-External $nodeCommand.Source @('--version')
    if ($nodeVersion.Code -ne 0) { Write-Result "FAIL" "Node.js cannot run" }
    else {
        Write-Result "PASS" ("Node.js available: " + $nodeVersion.Output.Trim())
        foreach ($module in @('scripts/protocol-hooks.cjs', '.claude/hooks/protocol-hooks.cjs', '.codex/hooks/protocol.cjs')) {
            $engine = Join-Path $Root $module
            if (Test-Path -LiteralPath $engine -PathType Leaf) {
                $syntax = Invoke-External $nodeCommand.Source @('--check', $engine)
                if ($syntax.Code -ne 0) { Write-Result "FAIL" ("hook module syntax: " + $syntax.Error.Trim()) }
                else { Write-Result "PASS" "hook module JavaScript syntax: $module" }
            }
        }
    }
}

# This checks the repository definition, not the user's Codex trust store.
# Host activation must still be reviewed with /hooks in a trusted project.
$codexSettingsPath = Join-Path $Root '.codex/hooks.json'
if (Test-Path -LiteralPath $codexSettingsPath -PathType Leaf) {
    try {
        $codexSettings = (Read-ProtocolText $codexSettingsPath) | ConvertFrom-Json
        $expected = 'node -e "require(require(''node:path'').join(require(''node:child_process'').execFileSync(''git'',[''rev-parse'',''--show-toplevel''],{encoding:''utf8'',windowsHide:true}).trim(),''.codex/hooks/protocol.cjs'')).main()"'
        foreach ($event in @('SessionStart', 'Stop')) {
            $matching = @()
            foreach ($group in $codexSettings.hooks.$event) {
                foreach ($handler in $group.hooks) {
                    if ($handler.type -eq 'command' -and $handler.command -ceq $expected) {
                        $matching += $handler
                        if ($group.matcher -and $group.matcher -notin @('*', '.*')) {
                            throw "$event protocol hook must match all sources, including resume and compact"
                        }
                        if ($handler.commandWindows -or $handler.command_windows -or $handler.async -eq $true -or
                            $handler.timeout -ne 30) {
                            throw "$event protocol hook has unsupported execution overrides"
                        }
                    }
                }
            }
            if ($matching.Count -ne 1) { throw "$event must configure exactly one canonical Codex protocol hook command" }
            Write-Result "PASS" "Codex $event protocol hook configured (host trust checked separately)"
        }
    }
    catch { Write-Result "FAIL" ("invalid Codex hooks: " + $_.Exception.Message) }
}

# Windows system32 bash.exe may be WSL with no installed distro. Prefer Git
# for Windows' Bash, then probe PATH. A version check must actually succeed.
$bashCandidates = @()
if ($env:OS -eq 'Windows_NT' -and $gitCommand) {
    $gitDirectory = Split-Path -Parent $gitCommand.Source
    $gitBase = Split-Path -Parent $gitDirectory
    $bashCandidates += (Join-Path $gitBase 'bin/bash.exe'), (Join-Path $gitBase 'usr/bin/bash.exe')
}
$bashCommand = Get-Command bash -CommandType Application -ErrorAction SilentlyContinue | Select-Object -First 1
if ($bashCommand) { $bashCandidates += $bashCommand.Source }
$bashExecutable = $null
foreach ($candidate in ($bashCandidates | Select-Object -Unique)) {
    if (-not (Test-Path -LiteralPath $candidate -PathType Leaf)) { continue }
    $bashVersion = Invoke-External $candidate @('--version')
    if ($bashVersion.Code -eq 0 -and $bashVersion.Output -match 'GNU bash') { $bashExecutable = $candidate; break }
}
if (-not $bashExecutable) { Write-Result "FAIL" "working Bash unavailable; install Git Bash and configure Claude to use it" }
else {
    Write-Result "PASS" "Bash available: $bashExecutable"
    foreach ($wrapper in @('session-start.sh', 'stop-worklog-check.sh')) {
        $wrapperPath = Join-Path $Root ('.claude/hooks/' + $wrapper)
        if (-not (Test-Path -LiteralPath $wrapperPath -PathType Leaf)) { continue }
        $syntax = Invoke-External $bashExecutable @('-n', $wrapperPath.Replace('\', '/'))
        if ($syntax.Code -ne 0) { Write-Result "FAIL" ("hook shell syntax in {0}: {1}" -f $wrapper, $syntax.Error.Trim()) }
        else { Write-Result "PASS" "hook shell syntax: $wrapper" }
    }
}

$decisionPath = Join-Path $Root '.ai/DECISIONS.md'
if (Test-Path -LiteralPath $decisionPath -PathType Leaf) {
    $decisionText = Read-ProtocolText $decisionPath
    if ($null -ne $decisionText) {
        $blocks = [regex]::Matches($decisionText, '(?ms)^### DEC-(?<number>\d+)[^\r\n]*(?:\n|\z)(?<body>.*?)(?=^#{1,3}[ \t]+|\z)')
        $seen = @{}
        foreach ($block in $blocks) {
            $id = 'DEC-' + $block.Groups['number'].Value
            if ($block.Groups['number'].Value.Length -ne 4) { Write-Result "FAIL" "$id must use four digits" }
            if ($seen.ContainsKey($id)) { Write-Result "FAIL" "duplicate decision: $id" }
            $seen[$id] = $true
            $body = $block.Groups['body'].Value
            $fields = @{}
            foreach ($field in @('Status', 'Date', 'Approved by')) {
                $values = [regex]::Matches($body, ('(?m)^' + [regex]::Escape($field) + ':[ \t]*(.*)$'))
                if ($values.Count -gt 1) { Write-Result "FAIL" "$id has duplicate $field fields" }
                $fields[$field] = if ($values.Count -gt 0) { $values[0].Groups[1].Value.Trim() } else { '' }
            }
            $status = $fields['Status']
            if ($status -cnotmatch '^(Proposed|Accepted|Superseded by DEC-\d{4})$') { Write-Result "FAIL" "$id has missing or invalid Status" }
            $parsedDate = [datetime]::MinValue
            if (-not [datetime]::TryParseExact($fields['Date'], 'yyyy-MM-dd', [System.Globalization.CultureInfo]::InvariantCulture, [System.Globalization.DateTimeStyles]::None, [ref]$parsedDate)) {
                Write-Result "FAIL" "$id requires a valid Date: YYYY-MM-DD"
            }
            if ($status -eq 'Accepted' -or $status -like 'Superseded by *') {
                $approver = $fields['Approved by']
                if ([string]::IsNullOrWhiteSpace($approver) -or $approver -match '^(?:[_<{\[]|[-?]+$|(?:TBD|TODO|pending|unknown|none|n/a|a human name|human name|your name)(?:\b|$))') {
                    Write-Result "FAIL" "$id requires a non-placeholder Approved by field"
                }
            }
        }
        if ($blocks.Count -eq 0) { Write-Result "WARN" "no numbered decisions recorded yet" }
        else { Write-Result "PASS" ("inspected {0} decision blocks; approval text is not proof of human authorization" -f $blocks.Count) }
    }
}

$taskPath = Join-Path $Root '.ai/TASK.md'
if (Test-Path -LiteralPath $taskPath -PathType Leaf) {
    $taskText = Read-ProtocolText $taskPath
    if ($null -ne $taskText) {
        $statuses = [regex]::Matches($taskText, '(?m)^Status:[ \t]*(.*)$')
        if ($statuses.Count -ne 1) { Write-Result "FAIL" ".ai/TASK.md requires exactly one Status line" }
        else {
            $taskStatus = $statuses[0].Groups[1].Value.Trim()
            if ($taskStatus -match '^No active task(?:[ .;:-]|$)') { Write-Result "WARN" "no active task; owner supplies the next objective" }
            elseif ($taskStatus -match '^(In progress|Active|Completed|Blocked|Planned|Pending|Ready)(?:[ .;:-]|$)') { Write-Result "PASS" "task status: $taskStatus" }
            else { Write-Result "FAIL" ".ai/TASK.md has an invalid Status; use In progress, Completed, Blocked, Planned or No active task" }
        }
    }
}

# T2: hooks are the only part of this protocol that runs without being asked.
# A single settings key switches them all off, and validation used to stay
# green while nothing was enforced. The owner keeps the right to disable them;
# they do not keep a green protocol check while enforcement is off.
foreach ($settingsName in @('.claude/settings.json', '.claude/settings.local.json')) {
    $settingsFile = Join-Path $Root $settingsName
    if (-not (Test-Path -LiteralPath $settingsFile -PathType Leaf)) { continue }
    try { $parsed = Get-Content -LiteralPath $settingsFile -Raw | ConvertFrom-Json }
    catch { continue }
    if ($null -eq $parsed) { continue }
    $property = $parsed.PSObject.Properties['disableAllHooks']
    if ($property -and $property.Value -eq $true) {
        Write-Result "FAIL" ("$settingsName sets disableAllHooks; protocol enforcement is off while this check would otherwise pass")
    }
}

# T5: the installer checks that the canonical ignore lines are present. A later
# negation pattern can cancel them while the text is still there, so ask Git
# what it actually does instead of reading the file.
if ($gitCommand -and $script:GitUsable) {
    foreach ($probe in @('.ai/runtime/shared-writer.json', '.claude/settings.local.json', '.ai/scratch/probe.txt')) {
        $ignored = Invoke-External $gitCommand.Source @('-C', $Root, 'check-ignore', '-q', '--no-index', $probe)
        if ($ignored.Code -eq 0) { continue }
        if ($ignored.Code -eq 1) {
            Write-Result "FAIL" ("Git does not ignore $probe; session state can reach a commit")
        }
        else {
            Write-Result "WARN" ("cannot determine the ignore rule for $probe")
        }
    }
}

$installerPath = Join-Path $Root 'setup-ai-protocol.ps1'
if (-not (Test-Path -LiteralPath $installerPath -PathType Leaf)) {
    # Skipping silently is how a deleted installer used to pass validation.
    Write-Result "FAIL" "installer absent; its self-check cannot run and was not skipped quietly"
}
else {
    # The installer's no-argument mode is a read-only self-check. Running it
    # here closes the gap that let this validator report "Protocol OK" while
    # the installer could not run at all: its manifest named a source file
    # that did not exist, and nothing compared the two lists.
    $shell = (Get-Process -Id $PID).Path
    if ([string]::IsNullOrWhiteSpace($shell)) { $shell = 'powershell.exe' }
    $selfCheck = Invoke-External $shell @('-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', $installerPath)
    if ($selfCheck.Code -eq 0) {
        Write-Result "PASS" "installer self-check runs"
    }
    else {
        $detail = @(($selfCheck.Output + "`n" + $selfCheck.Error) -split "`r?`n" |
            Where-Object { $_ -match '\S' })
        $last = if ($detail.Count -gt 0) { $detail[-1].Trim() } else { "exit code $($selfCheck.Code)" }
        Write-Result "FAIL" ("installer cannot run: {0}" -f $last)
    }
}

if ($script:Failures -eq 0) {
    Write-Host ("Protocol OK. {0} warning(s)." -f $script:Warnings) -ForegroundColor Green
    exit 0
}
Write-Host ("Protocol BROKEN. {0} failure(s), {1} warning(s)." -f $script:Failures, $script:Warnings) -ForegroundColor Red
exit 1
