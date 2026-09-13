# AI Collaboration Protocol installer, protocol v1.6.2. ASCII-only for PS 5.1.
# No arguments: read-only check of this checkout.
# -Target <path> [-InitGit]: initialize missing state and merge integration.
# -Force: update managed tooling with backups, preserving existing .ai state.
# -Verify: read-only check; populated state is never compared to templates.
[CmdletBinding()]
param(
    [string]$Target,
    [switch]$Force,
    [switch]$InitGit,
    [switch]$Verify
)

$ErrorActionPreference = 'Stop'
# PowerShell 5.1 writes the console in the OEM codepage, which mangles
# non-ASCII paths in this report and in any captured output. Force UTF-8.
try { [Console]::OutputEncoding = New-Object System.Text.UTF8Encoding($false) } catch { }
$SourceRoot = [System.IO.Path]::GetFullPath($PSScriptRoot)
$TargetRoot = $SourceRoot
if (-not [string]::IsNullOrWhiteSpace($Target)) {
    $TargetRoot = $ExecutionContext.SessionState.Path.GetUnresolvedProviderPathFromPSPath($Target)
}
$TargetRoot = [System.IO.Path]::GetFullPath($TargetRoot)
$SelfInstall = ($TargetRoot.TrimEnd('\', '/') -eq $SourceRoot.TrimEnd('\', '/'))
$CheckOnly = $Verify -or $SelfInstall
$script:Drifted = 0
$script:Created = 0
$script:Updated = 0
$script:Kept = 0
$script:BackupRoot = $null
$Utf8 = New-Object System.Text.UTF8Encoding($false, $true)

function Read-Text([string]$Path) {
    return [System.IO.File]::ReadAllText($Path, $Utf8)
}

function Same-Bytes([string]$A, [string]$B) {
    if (-not [System.IO.File]::Exists($A) -or -not [System.IO.File]::Exists($B)) { return $false }
    $left = [System.IO.File]::ReadAllBytes($A)
    $right = [System.IO.File]::ReadAllBytes($B)
    if ($left.Length -ne $right.Length) { return $false }
    for ($i = 0; $i -lt $left.Length; $i++) {
        if ($left[$i] -ne $right[$i]) { return $false }
    }
    return $true
}

function Assert-SafeDestination([string]$Relative) {
    $candidate = Join-Path $TargetRoot $Relative
    $current = $candidate
    while ($current -and $current.Length -ge $TargetRoot.Length) {
        if (Test-Path -LiteralPath $current) {
            $item = Get-Item -LiteralPath $current -Force
            if ($item.Attributes -band [System.IO.FileAttributes]::ReparsePoint) {
                throw "Refusing a linked destination: $current"
            }
            if (($current -ne $candidate) -and -not $item.PSIsContainer) {
                throw "Destination parent is not a directory: $current"
            }
        }
        $parent = Split-Path -Parent $current
        if ($parent -eq $current) { break }
        $current = $parent
    }
    if ([System.IO.Directory]::Exists($candidate)) {
        throw "Destination file is a directory: $candidate"
    }
}

function Report-Drift([string]$Message) {
    Write-Host "[!=] $Message" -ForegroundColor Yellow
    $script:Drifted++
}

function Backup-File([string]$Relative) {
    if (-not $script:BackupRoot) {
        $stamp = (Get-Date).ToUniversalTime().ToString('yyyyMMddTHHmmssfffZ')
        $script:BackupRoot = Join-Path $TargetRoot ('.ai/backups/' + $stamp + '-' + [guid]::NewGuid().ToString('N'))
    }
    $backup = Join-Path $script:BackupRoot $Relative
    [System.IO.Directory]::CreateDirectory((Split-Path -Parent $backup)) | Out-Null
    [System.IO.File]::Copy((Join-Path $TargetRoot $Relative), $backup, $false)
}

function Write-Bytes([string]$Relative, [byte[]]$Bytes) {
    $destination = Join-Path $TargetRoot $Relative
    if ([System.IO.File]::Exists($destination)) {
        Backup-File $Relative
        $script:Updated++
    }
    else { $script:Created++ }
    [System.IO.Directory]::CreateDirectory((Split-Path -Parent $destination)) | Out-Null
    [System.IO.File]::WriteAllBytes($destination, $Bytes)
    Write-Host "[ok] written: $Relative"
}

function Install-File([string]$Source, [string]$Destination, [switch]$State) {
    $src = Join-Path $SourceRoot $Source
    $dst = Join-Path $TargetRoot $Destination
    if (-not [System.IO.File]::Exists($dst)) {
        if ($CheckOnly) { Report-Drift "Missing: $Destination" }
        else { Write-Bytes $Destination ([System.IO.File]::ReadAllBytes($src)) }
        return
    }
    if ($State -or (Same-Bytes $src $dst)) { $script:Kept++; return }
    if ($CheckOnly) { Report-Drift "Managed file differs: $Destination" }
    elseif ($Force) { Write-Bytes $Destination ([System.IO.File]::ReadAllBytes($src)) }
    else {
        Write-Host "[==] kept local managed file: $Destination (use -Force to update with backup)"
        $script:Kept++
    }
}

function Json-Object([string]$Path) {
    $value = ConvertFrom-Json -InputObject (Read-Text $Path)
    if ($null -eq $value -or $value -isnot [System.Management.Automation.PSCustomObject]) {
        throw "Expected a JSON object: $Path"
    }
    return $value
}

function Set-Property($Object, [string]$Name, $Value) {
    $Object | Add-Member -MemberType NoteProperty -Name $Name -Value $Value -Force
}

function New-MergePlan([string]$Relative, $Bytes, [string]$Message) {
    return [pscustomobject]@{ Relative = $Relative; Bytes = $Bytes; Message = $Message }
}

function Apply-MergePlan($Plan) {
    if ($null -eq $Plan.Bytes) { $script:Kept++; return }
    if ($CheckOnly) { Report-Drift $Plan.Message; return }
    Write-Bytes $Plan.Relative $Plan.Bytes
}

function Assert-HookSettings($Settings, [string]$Path, [switch]$Source) {
    if (-not $Settings.PSObject.Properties['hooks']) {
        if ($Source) { throw "Source settings must provide SessionStart and Stop hooks: $Path" }
        return
    }
    if ($Settings.hooks -isnot [System.Management.Automation.PSCustomObject]) {
        throw "Expected hooks to be a JSON object: $Path"
    }
    if ($Source -and (-not $Settings.hooks.PSObject.Properties['SessionStart'] -or
        -not $Settings.hooks.PSObject.Properties['Stop'])) {
        throw "Source settings must provide SessionStart and Stop hooks: $Path"
    }
    foreach ($event in $Settings.hooks.PSObject.Properties) {
        if ($event.Value -isnot [array]) { throw "Expected hooks.$($event.Name) to be an array: $Path" }
        foreach ($group in $event.Value) {
            if ($group -isnot [System.Management.Automation.PSCustomObject] -or
                -not $group.PSObject.Properties['hooks'] -or $group.hooks -isnot [array]) {
                throw "Expected a hook group with a hooks array: $Path"
            }
            foreach ($handler in $group.hooks) {
                if ($handler -isnot [System.Management.Automation.PSCustomObject]) {
                    throw "Expected each hook handler to be a JSON object: $Path"
                }
            }
        }
    }
}

# Prepare complete integration updates before any target mutation. Parsing JSON
# alone missed valid JSON with invalid hook structure and caused partial upgrades.
function Prepare-SettingsMerge([string]$Relative, [string]$AgentName) {
    $src = Join-Path $SourceRoot $Relative
    $dst = Join-Path $TargetRoot $Relative
    $wanted = Json-Object $src
    Assert-HookSettings $wanted $src -Source
    if (-not [System.IO.File]::Exists($dst)) {
        return New-MergePlan $Relative ([System.IO.File]::ReadAllBytes($src)) "Missing: $Relative"
    }
    $existing = Json-Object $dst
    Assert-HookSettings $existing $dst
    $before = ConvertTo-Json -InputObject $existing -Depth 100 -Compress
    if (-not $existing.PSObject.Properties['hooks']) { Set-Property $existing 'hooks' ([pscustomobject]@{}) }
    # Commands from earlier protocol versions. Installing the canonical command
    # removes these, so an upgrade never leaves two hooks racing on one event.
    $legacy = @{
        SessionStart = @(
            '[ -f .claude/hooks/session-start.sh ] && bash .claude/hooks/session-start.sh || true',
            'bash "$(git -C "${CLAUDE_PROJECT_DIR:-.}" rev-parse --show-toplevel)/.claude/hooks/session-start.sh"'
        )
        Stop = @(
            '[ -f .claude/hooks/stop-worklog-check.sh ] && bash .claude/hooks/stop-worklog-check.sh || true',
            'bash "$(git -C "${CLAUDE_PROJECT_DIR:-.}" rev-parse --show-toplevel)/.claude/hooks/stop-worklog-check.sh"'
        )
    }
    foreach ($event in $wanted.hooks.PSObject.Properties) {
        $commands = @($event.Value | ForEach-Object { $_.hooks } | ForEach-Object { $_.command })
        if ($Relative -eq '.claude/settings.json' -and $legacy.ContainsKey($event.Name)) {
            $commands += @($legacy[$event.Name])
        }
        $groups = @()
        $oldEvent = $existing.hooks.PSObject.Properties[$event.Name]
        if ($oldEvent) {
            foreach ($group in $oldEvent.Value) {
                $remaining = @($group.hooks | Where-Object {
                    # Merely mentioning an adapter path does not make a host
                    # command ours. Codex has no legacy commands to migrate.
                    $owned = if ($Relative -eq '.codex/hooks.json') {
                        $commands -ccontains $_.command
                    }
                    else { $commands -contains $_.command }
                    -not ($_.type -eq 'command' -and $owned)
                })
                if ($remaining.Count -gt 0 -or $group.hooks.Count -eq 0) {
                    Set-Property $group 'hooks' $remaining
                    $groups += $group
                }
            }
        }
        $groups += @($event.Value)
        Set-Property $existing.hooks $event.Name $groups
    }
    $after = ConvertTo-Json -InputObject $existing -Depth 100 -Compress
    if ($before -ceq $after) { return New-MergePlan $Relative $null '' }
    $merged = ((ConvertTo-Json -InputObject $existing -Depth 100) + "`n") -replace "`r`n", "`n"
    return New-MergePlan $Relative ($Utf8.GetBytes($merged)) "$AgentName protocol hooks need merging"
}

function Prepare-ManifestWrite($Manifest) {
    # The installed copy describes an installed project: no installer, no test
    # suite, no templates, so its validator does not demand files that a
    # product repository has no reason to carry.
    $installed = [ordered]@{
        comment = 'Installed copy. The protocol source repository holds the installer, the test suite and the templates; this project holds only the runtime it needs.'
        protocolVersion = $Manifest.protocolVersion
        role = 'installed'
        managed = @($Manifest.managed)
        integration = @($Manifest.integration)
        state = @($Manifest.state)
    }
    # Running the installer against its own repository must never downgrade the
    # source manifest to an installed one: that would delete the record of the
    # installer, the tests and the templates from the only place they exist.
    if ($SelfInstall) {
        return New-MergePlan 'protocol-manifest.json' $null ''
    }
    $json = (ConvertTo-Json -InputObject ([pscustomobject]$installed) -Depth 10) -replace "`r`n", "`n"
    $bytes = $Utf8.GetBytes($json.TrimEnd("`n") + "`n")
    $dst = Join-Path $TargetRoot 'protocol-manifest.json'
    if ([System.IO.File]::Exists($dst)) {
        $current = [System.IO.File]::ReadAllBytes($dst)
        if ($current.Length -eq $bytes.Length) {
            $same = $true
            for ($i = 0; $i -lt $bytes.Length; $i++) { if ($current[$i] -ne $bytes[$i]) { $same = $false; break } }
            if ($same) { return New-MergePlan 'protocol-manifest.json' $null '' }
        }
    }
    return New-MergePlan 'protocol-manifest.json' $bytes 'Manifest needs updating: protocol-manifest.json'
}

function Prepare-HygieneMerge([string]$Relative, [string]$ScopedContent) {
    $src = Join-Path $SourceRoot $Relative
    $dst = Join-Path $TargetRoot $Relative
    $begin = '# BEGIN AI COLLABORATION PROTOCOL'
    $end = '# END AI COLLABORATION PROTOCOL'
    $block = $begin + "`n" + $ScopedContent.TrimEnd() + "`n" + $end + "`n"
    if (-not [System.IO.File]::Exists($dst)) {
        # Copying this repository's own hygiene file would apply its rules to the
        # whole host project: line endings for every source file, indentation for
        # every language. Only the protocol's own paths are ours to govern, so a
        # fresh file gets the same scoped block a merge would add.
        return New-MergePlan $Relative ($Utf8.GetBytes($block)) "Missing: $Relative"
    }
    if (Same-Bytes $src $dst) { return New-MergePlan $Relative $null '' }
    $existing = (Read-Text $dst) -replace "`r`n", "`n"
    $pattern = '(?ms)^' + [regex]::Escape($begin) + '\n.*?^' + [regex]::Escape($end) + '(?:\n|$)'
    $matches = [regex]::Matches($existing, $pattern)
    $beginCount = [regex]::Matches($existing, [regex]::Escape($begin)).Count
    $endCount = [regex]::Matches($existing, [regex]::Escape($end)).Count
    if ($matches.Count -gt 1 -or $beginCount -ne $matches.Count -or $endCount -ne $matches.Count) {
        throw "Malformed managed block in $Relative; preserve the file and repair its markers."
    }
    if ($matches.Count -eq 1) {
        $merged = $existing.Substring(0, $matches[0].Index) + $block + $existing.Substring($matches[0].Index + $matches[0].Length)
    }
    else { $merged = $existing.TrimEnd("`n") + "`n`n" + $block }
    if ($merged -ceq $existing) { return New-MergePlan $Relative $null '' }
    return New-MergePlan $Relative ($Utf8.GetBytes($merged)) "Protocol entries need merging: $Relative"
}

function Prepare-IgnoreMerge {
    $src = Join-Path $SourceRoot '.gitignore'
    $dst = Join-Path $TargetRoot '.gitignore'
    if (-not [System.IO.File]::Exists($dst)) {
        return New-MergePlan '.gitignore' ([System.IO.File]::ReadAllBytes($src)) 'Missing: .gitignore'
    }
    $existing = (Read-Text $dst) -replace "`r`n", "`n"
    $lines = $existing -split "`n"
    $missing = @((Read-Text $src) -split "`r?`n" | Where-Object {
        $_.Trim().Length -gt 0 -and -not $_.TrimStart().StartsWith('#') -and $lines -cnotcontains $_
    })
    if ($missing.Count -eq 0) { return New-MergePlan '.gitignore' $null '' }
    $merged = $existing.TrimEnd("`n") + "`n`n# AI collaboration protocol`n" + ($missing -join "`n") + "`n"
    return New-MergePlan '.gitignore' ($Utf8.GetBytes($merged)) 'Missing protocol ignore entries'
}

function Invoke-Git([string[]]$Arguments) {
    $previous = $ErrorActionPreference
    try {
        $ErrorActionPreference = 'Continue'
        $output = @(& git @Arguments 2>&1)
        if ($LASTEXITCODE -ne 0) { throw "git $($Arguments -join ' ') failed: $($output -join ' ')" }
        return ($output -join "`n")
    }
    finally { $ErrorActionPreference = $previous }
}

try {
    Write-Host "AI Collaboration Protocol installer`nSource: $SourceRoot`nTarget: $TargetRoot"
    # One manifest, read here and by validate-protocol.ps1. Keeping two lists
    # that had to agree failed three times; see DEC-0012.
    $manifestPath = Join-Path $SourceRoot 'protocol-manifest.json'
    if (-not [System.IO.File]::Exists($manifestPath)) { throw "Required source file missing: protocol-manifest.json" }
    $manifest = Json-Object $manifestPath
    # What the target receives. The installer, the protocol's own test suite and
    # the templates stay in this repository: a product repo cannot use them and
    # should not carry them. See DEC-0013.
    $managed = @($manifest.managed)
    $state = @($manifest.state)
    $integration = @($manifest.integration)
    # What must exist here for an install to be possible at all.
    $sourceOnly = @($manifest.source) + @($manifest.tests) +
        @($state | ForEach-Object { 'templates/ai/' + $_ })
    foreach ($relative in ($managed + $integration + $sourceOnly)) {
        if (-not [System.IO.File]::Exists((Join-Path $SourceRoot $relative))) { throw "Required source file missing: $relative" }
    }
    if ([System.IO.File]::Exists($TargetRoot)) { throw "Target is not a directory: $TargetRoot" }
    if ($CheckOnly -and -not [System.IO.Directory]::Exists($TargetRoot)) {
        throw "Target does not exist (verification made no changes): $TargetRoot"
    }
    foreach ($relative in ($managed + $integration + @($state | ForEach-Object { '.ai/' + $_ }) + '.ai/backups/.probe')) {
        Assert-SafeDestination $relative
    }
    # Build every integration update first, including hook structure and managed
    # markers. A preflight failure must not initialize Git, write files or backups.
    # Merged integration files are validated too. Keep their checkout bytes LF
    # even when the host uses a repository-wide CRLF rule. The integration list
    # excludes host Codex/editor preferences; their attributes stay untouched.
    $scopedPaths = @($managed) + @($integration) + @('.ai/**')
    $attributes = ($scopedPaths | ForEach-Object { $_ + ' text eol=lf' }) -join "`n"
    $mergePlans = @(
        (Prepare-SettingsMerge '.claude/settings.json' 'Claude'),
        (Prepare-SettingsMerge '.codex/hooks.json' 'Codex'),
        (Prepare-ManifestWrite $manifest),
        (Prepare-IgnoreMerge),
        (Prepare-HygieneMerge '.gitattributes' $attributes)
    )
    if (-not (Get-Command git -ErrorAction SilentlyContinue)) { throw 'Git is required but is not available.' }
    $gitPath = Join-Path $TargetRoot '.git'
    if (-not (Test-Path -LiteralPath $gitPath)) {
        if ($InitGit -and -not $CheckOnly) {
            [System.IO.Directory]::CreateDirectory($TargetRoot) | Out-Null
            $null = Invoke-Git @('-C', $TargetRoot, 'init', '-b', 'main')
        }
        else { throw 'Target needs its own Git repository. Install with -InitGit, then verify.' }
    }
    $gitRoot = Invoke-Git @('-C', $TargetRoot, 'rev-parse', '--show-toplevel')
    if ([System.IO.Path]::GetFullPath($gitRoot).TrimEnd('\', '/') -ne $TargetRoot.TrimEnd('\', '/')) {
        throw 'Git resolved a different repository root.'
    }
    $null = Invoke-Git @('-C', $TargetRoot, 'status', '--porcelain=v1', '-uno')
    foreach ($relative in $managed) {
        if ($relative -eq 'protocol-manifest.json') { continue }
        Install-File $relative $relative
    }
    foreach ($relative in $state) { Install-File ('templates/ai/' + $relative) ('.ai/' + $relative) -State }
    foreach ($plan in $mergePlans) { Apply-MergePlan $plan }
    if ($script:Drifted -gt 0) {
        Write-Host "$($script:Drifted) difference(s). Install to merge integration; -Force updates managed files with backups. Project state is always kept."
        exit 1
    }
    if ($CheckOnly) { Write-Host 'Structure and integration verified. Project state was checked for existence only.' }
    else { Write-Host "Done: $($script:Created) created, $($script:Updated) updated, $($script:Kept) kept. Existing project state preserved." }
    if ($script:BackupRoot) { Write-Host "Previous versions saved to: $script:BackupRoot" }
    exit 0
}
catch {
    Write-Host "[error] $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
