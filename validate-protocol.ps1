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
$script:ProtocolRole = 'source'
$script:SupersedeRefs = @()
$script:Warnings = 0
$taskStatus = $null
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

function Get-Sha256Hex {
    param([string]$Path)
    $sha = [System.Security.Cryptography.SHA256]::Create()
    try {
        $stream = [System.IO.File]::OpenRead($Path)
        try {
            $bytes = $sha.ComputeHash($stream)
            return (($bytes | ForEach-Object { $_.ToString('x2') }) -join '')
        }
        finally { $stream.Dispose() }
    }
    finally { $sha.Dispose() }
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
        # A source repository must carry the installer, the test suite and the
        # templates. An installed project must not: it cannot use them. The
        # manifest says which kind of checkout this is. See DEC-0013.
        $script:ProtocolRole = if ($manifest.PSObject.Properties['role']) { [string]$manifest.role } else { 'source' }
        $Required = @($manifest.managed) + @($manifest.integration) +
            @($manifest.state | ForEach-Object { '.ai/' + $_ })
        if ($script:ProtocolRole -eq 'source') {
            $Required += @($manifest.source) + @($manifest.tests) +
                @($manifest.state | ForEach-Object { 'templates/ai/' + $_ })
        }
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
    foreach ($prefix in @('.ai/', 'templates/ai/', 'templates/reviews/', '.claude/hooks/')) {
        if ($normalized.StartsWith($prefix)) { return $true }
    }
    if ($script:ProtocolRole -eq 'source' -and $normalized.StartsWith('docs/reviews/')) { return $true }
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
$journals = @($paths | Where-Object { $_ -match '^\.ai/worklog/[^/]+\.md$' -and $_ -ne '.ai/worklog/README.md' } | Sort-Object -Unique)
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
        foreach ($module in @('.ai/bin/protocol-hooks.cjs', '.claude/hooks/protocol-hooks.cjs', '.codex/hooks/protocol.cjs')) {
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
        $blocks = [regex]::Matches($decisionText, '(?ms)^### (?<id>(?:PROTO-)?DEC-(?<number>\d+))[^\r\n]*(?:\n|\z)(?<body>.*?)(?=^#{1,3}[ \t]+|\z)')
        $seen = @{}
        foreach ($block in $blocks) {
            $id = $block.Groups['id'].Value
            if ($block.Groups['number'].Value.Length -ne 4) { Write-Result "FAIL" "$id must use four digits" }
            if ($seen.ContainsKey($id)) { Write-Result "FAIL" "duplicate decision: $id" }
            $seen[$id] = $true
            $body = $block.Groups['body'].Value
            # A Supersedes pointing at nothing makes the log unreadable: a
            # reader cannot tell which decision still stands. See DEC-0013.
            foreach ($reference in [regex]::Matches($body, '(?m)^Supersedes:[ \t]*(.*)$')) {
                foreach ($target in [regex]::Matches($reference.Groups[1].Value, '(?:PROTO-)?DEC-\d{4}')) {
                    $script:SupersedeRefs += [pscustomobject]@{ From = $id; To = $target.Value }
                }
            }
            $fields = @{}
            foreach ($field in @('Status', 'Date', 'Approved by')) {
                $values = [regex]::Matches($body, ('(?m)^' + [regex]::Escape($field) + ':[ \t]*(.*)$'))
                if ($values.Count -gt 1) { Write-Result "FAIL" "$id has duplicate $field fields" }
                $fields[$field] = if ($values.Count -gt 0) { $values[0].Groups[1].Value.Trim() } else { '' }
            }
            $status = $fields['Status']
            if ($status -cnotmatch '^(Accepted|Superseded by (?:PROTO-)?DEC-\d{4})$' -and -not ($id -eq 'DEC-0014' -and $status -eq 'Proposed')) {
                Write-Result "FAIL" "$id has missing or invalid Status (Proposed is forbidden; drafts belong in PLAN.md)"
            }
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
        foreach ($reference in $script:SupersedeRefs) {
            if (-not $seen.ContainsKey($reference.To)) {
                Write-Result "FAIL" ("{0} supersedes {1}, which does not exist" -f $reference.From, $reference.To)
            }
            elseif ($reference.To -eq $reference.From) {
                Write-Result "FAIL" ("{0} supersedes itself" -f $reference.From)
            }
        }
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

# A completed task must leave machine-checkable proof that the mandatory
# adversarial review happened. In-progress work remains valid without the
# artifacts, so this gate does not strand an active task. See AGENTS.md.
if ($taskStatus -match '^Completed(?:[ .;:-]|$)') {
    $gate = [regex]::Match($taskText, '(?ms)^## Completion gate[ \t]*\r?\n(?<body>.*?)(?=^## |\z)')
    if (-not $gate.Success) {
        Write-Result "FAIL" "completed task requires a ## Completion gate section with an adversarial prompt and independent review"
    }
    else {
        $gateBody = $gate.Groups['body'].Value
        $promptField = [regex]::Match($gateBody, '(?m)^- Adversarial review prompt:[ \t]*(\S+)[ \t]*$')
        $reviewField = [regex]::Match($gateBody, '(?m)^- Independent review:[ \t]*(\S+)[ \t]*$')
        $gateFiles = @(
            [pscustomobject]@{ Label = 'adversarial review prompt'; Match = $promptField },
            [pscustomobject]@{ Label = 'independent review'; Match = $reviewField }
        )
        if ($promptField.Success -and $reviewField.Success -and
            $promptField.Groups[1].Value.Replace('\', '/') -eq $reviewField.Groups[1].Value.Replace('\', '/')) {
            Write-Result "FAIL" "adversarial prompt and independent review must be separate artifacts"
        }
        foreach ($gateFile in $gateFiles) {
            if (-not $gateFile.Match.Success) {
                Write-Result "FAIL" ("completed task is missing its {0} field" -f $gateFile.Label)
                continue
            }
            $relative = $gateFile.Match.Groups[1].Value.Replace('\', '/')
            if (-not $relative.StartsWith('docs/reviews/') -or $relative.Contains('..')) {
                Write-Result "FAIL" ("{0} must point inside docs/reviews/" -f $gateFile.Label)
                continue
            }
            $full = Join-Path $Root $relative
            if (-not (Test-Path -LiteralPath $full -PathType Leaf)) {
                Write-Result "FAIL" ("completed task {0} is missing: {1}" -f $gateFile.Label, $relative)
                continue
            }
            $content = Read-ProtocolText $full
            if ($null -eq $content -or $content.Trim().Length -eq 0) {
                Write-Result "FAIL" ("completed task {0} must not be empty: {1}" -f $gateFile.Label, $relative)
                continue
            }
            if ($gateFile.Label -eq 'adversarial review prompt') {
                if ($content -notmatch '(?is)(?:unified.{0,80}adversarial|adversarial.{0,80}unified).{0,80}prompt') {
                    Write-Result "FAIL" ("{0} must identify a unified adversarial audit prompt: {1}" -f $gateFile.Label, $relative)
                }
                else { Write-Result "PASS" ("completion gate prompt found: {0}" -f $relative) }
            }
            else {
                $reviewer = [regex]::Match($content, '(?mi)^(?:\*\*)?Reviewer(?:\*\*)?:?[ \t]*(\S.*)$')
                $verdict = [regex]::Match($content, '(?mi)^(?:\*\*)?Verdict(?:\*\*)?:?[ \t]*(PASS|FAIL|BLOCKED|RECOMMENDATION)\b')
                if (-not $reviewer.Success) {
                    Write-Result "FAIL" ("independent review must name a Reviewer: {0}" -f $relative)
                }
                elseif (-not $verdict.Success -or $verdict.Groups[1].Value.ToUpperInvariant() -notin @('PASS', 'RECOMMENDATION')) {
                    Write-Result "FAIL" ("independent review must have a PASS or RECOMMENDATION verdict: {0}" -f $relative)
                }
                else {
                    Write-Result "PASS" ("independent review certified: {0}" -f $relative)
                }
            }
        }
        $citedReviews = @([regex]::Matches($taskText, '(?i)docs/reviews/[a-z0-9._-]+\.md') |
            ForEach-Object { $_.Value.Replace('\', '/') } | Sort-Object -Unique)
        foreach ($citedRelative in $citedReviews) {
            $citedFull = Join-Path $Root $citedRelative
            if (-not (Test-Path -LiteralPath $citedFull -PathType Leaf)) {
                Write-Result "FAIL" ("completed task cites missing review artifact: {0}" -f $citedRelative)
            }
            else {
                $citedContent = Read-ProtocolText $citedFull
                if ($null -eq $citedContent -or $citedContent.Trim().Length -eq 0) {
                    Write-Result "FAIL" ("completed task cites empty review artifact: {0}" -f $citedRelative)
                }
            }
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

# One version, three files. Nothing compared them and they drifted. See DEC-0021.
if ($manifest -and $manifest.PSObject.Properties['protocolVersion']) {
    $declared = [string]$manifest.protocolVersion
    $sources = @{}
    $agentsPath = Join-Path $Root 'AGENTS.md'
    if (Test-Path -LiteralPath $agentsPath -PathType Leaf) {
        $found = [regex]::Match((Read-ProtocolText $agentsPath), '(?m)^##\s+AI Collaboration Protocol\s+v(\S+)\s*$')
        if ($found.Success) { $sources['AGENTS.md'] = $found.Groups[1].Value }
    }
    $installerPathForVersion = Join-Path $Root 'setup-ai-protocol.ps1'
    if (Test-Path -LiteralPath $installerPathForVersion -PathType Leaf) {
        $found = [regex]::Match((Read-ProtocolText $installerPathForVersion), 'protocol v(\d+\.\d+\.\d+)')
        if ($found.Success) { $sources['setup-ai-protocol.ps1'] = $found.Groups[1].Value }
    }
    $drifted = @($sources.Keys | Where-Object { $sources[$_] -ne $declared })
    if ($drifted.Count -eq 0) { Write-Result "PASS" "one protocol version everywhere: $declared" }
    else {
        foreach ($name in $drifted) {
            Write-Result "FAIL" ("{0} says {1}; protocol-manifest.json says {2}" -f $name, $sources[$name], $declared)
        }
    }
}

# A version string is not content. A plain install updates the manifest but
# keeps an older managed copy, so a project could declare v1.9.0 while running
# a previous generation of the engine, and validation stayed green. The
# installed manifest records the hash of the bytes the install delivered; a
# mismatch means a partial upgrade or a hand edit. Documents a host may
# reconcile warn; runtime tooling fails. See TASK 2026-09-17.
if ($script:ProtocolRole -ne 'source' -and $manifest -and
    $manifest.PSObject.Properties['contentDigest'] -and $manifest.contentDigest) {
    $docDigests = @(
        'AGENTS.md',
        'CLAUDE.md',
        '.ai/docs/PROTOCOL.md',
        '.ai/docs/CODEX.md',
        '.ai/docs/COPILOT.md',
        '.ai/docs/GLM.md',
        '.github/copilot-instructions.md'
    )
    $digestsChecked = 0
    foreach ($entry in $manifest.contentDigest.PSObject.Properties) {
        $relative = $entry.Name
        $expected = [string]$entry.Value
        if ($expected -notmatch '^sha256:[a-f0-9]{64}$') {
            Write-Result "FAIL" ("content digest for {0} is malformed" -f $relative)
            continue
        }
        $full = Join-Path $Root $relative
        if (-not (Test-Path -LiteralPath $full -PathType Leaf)) { continue }
        $digestsChecked++
        if (('sha256:' + (Get-Sha256Hex $full)) -eq $expected) { continue }
        if ($docDigests -contains $relative.Replace([char]92, '/')) {
            Write-Result "WARN" ("{0} differs from the installed protocol content; it is a document the host may reconcile. Run -Force to take the canonical copy." -f $relative)
        }
        else {
            Write-Result "FAIL" ("{0} is not the content this protocol version installed; a partial upgrade or a hand edit. Run setup-ai-protocol.ps1 -Force from the protocol source repository." -f $relative)
        }
    }
    Write-Result "PASS" ("verified {0} managed content digest(s)" -f $digestsChecked)
}

# A written decision block is never edited again, says the rule. Nothing checked
# it, so the text could be rewritten and validation still passed. See DEC-0021.
if ($gitCommand -and $script:GitUsable -and (Test-Path -LiteralPath $decisionPath -PathType Leaf)) {
    $committed = Invoke-External $gitCommand.Source @('-C', $Root, 'show', 'HEAD:.ai/DECISIONS.md')
    if ($committed.Code -ne 0) {
        Write-Result "WARN" "no committed .ai/DECISIONS.md to compare against; immutability guarantee is OFF until .ai/ is committed to Git (run: git add .ai && git commit)"
    }
    else {
        $pattern = '(?ms)^### (?<id>(?:PROTO-)?DEC-(?<number>\d{4}))[^\r\n]*(?:\n|\z)(?<body>.*?)(?=^#{1,3}[ \t]+|\z)'
        $before = @{}
        foreach ($block in [regex]::Matches(($committed.Output -replace "`r`n", "`n"), $pattern)) {
            $before[$block.Groups['id'].Value] = $block.Groups['body'].Value.TrimEnd()
        }
        $currentBlocks = @{}
        foreach ($block in [regex]::Matches(($decisionText -replace "`r`n", "`n"), $pattern)) {
            $currentBlocks[$block.Groups['id'].Value] = $block.Groups['body'].Value.TrimEnd()
        }
        $changed = @()
        $deleted = @()
        foreach ($id in $before.Keys) {
            if (-not $currentBlocks.ContainsKey($id)) {
                $deleted += $id
            }
            elseif ($before[$id] -cne $currentBlocks[$id]) {
                $changed += $id
            }
        }
        if ($changed.Count -eq 0 -and $deleted.Count -eq 0) {
            Write-Result "PASS" ("{0} committed decision blocks are unchanged" -f $before.Count)
        }
        else {
            foreach ($id in $changed) {
                Write-Result "FAIL" ("$id was edited after it was written; a decision block is never rewritten")
            }
            foreach ($id in $deleted) {
                Write-Result "FAIL" ("$id was deleted; a decision block is never removed")
            }
        }
    }
}

# A journal belongs to one session. Nothing can enforce that inside one
# checkout, but an entry naming a different agent is worth saying out loud.
if (Test-Path -LiteralPath $worklogDirectory -PathType Container) {
    foreach ($journal in (Get-ChildItem -LiteralPath $worklogDirectory -Filter '*.md' -File)) {
        if ($journal.Name -eq 'README.md') { continue }
        $prefix = ($journal.BaseName -split '-')[0]
        $body = Read-ProtocolText $journal.FullName
        if ($null -eq $body) { continue }
        $agentLine = [regex]::Match($body, '(?m)^Agent:[ \t]*(.+)$')
        if (-not $agentLine.Success) { continue }
        if ($agentLine.Groups[1].Value -notmatch [regex]::Escape($prefix)) {
            Write-Result "WARN" ("{0} holds an entry whose Agent line does not name {1}" -f $journal.Name, $prefix)
        }
    }
}

$installerPath = Join-Path $Root 'setup-ai-protocol.ps1'
if ($script:ProtocolRole -ne 'source') {
    Write-Result "PASS" "installed project; the installer lives in the protocol source repository"
}
elseif (-not (Test-Path -LiteralPath $installerPath -PathType Leaf)) {
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
