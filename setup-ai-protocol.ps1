# ============================================================
# AI Collaboration Protocol — Initial Setup
# Version: 0.1
#
# Создаёт структуру для совместной работы GPT/Codex и Claude
# в любой папке, где находится этот скрипт.
#
# Повторный запуск НЕ перезаписывает существующие файлы.
# ============================================================

$ErrorActionPreference = "Stop"

# ------------------------------------------------------------
# Определяем папку, в которой находится сам скрипт
# ------------------------------------------------------------

$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$AiDir = Join-Path $Root ".ai"

Write-Host ""
Write-Host "AI Collaboration Protocol Setup" -ForegroundColor Cyan
Write-Host "Root: $Root"
Write-Host ""

# ------------------------------------------------------------
# Создаём .ai
# ------------------------------------------------------------

if (-not (Test-Path $AiDir)) {
    New-Item -ItemType Directory -Path $AiDir | Out-Null
    Write-Host "[+] Created .ai directory" -ForegroundColor Green
}
else {
    Write-Host "[=] .ai directory already exists" -ForegroundColor Yellow
}

# ------------------------------------------------------------
# Функция безопасного создания файла
# ------------------------------------------------------------

function New-SafeFile {
    param (
        [string]$Path,
        [string]$Content
    )

    if (Test-Path $Path) {
        Write-Host "[=] Exists: $Path" -ForegroundColor Yellow
    }
    else {
        Set-Content -Path $Path -Value $Content -Encoding UTF8
        Write-Host "[+] Created: $Path" -ForegroundColor Green
    }
}

# ============================================================
# 1. AGENTS.md
# ============================================================

$Agents = @'
# AGENTS.md

## AI Collaboration Protocol

This repository may be worked on by multiple AI coding assistants,
including GPT/Codex and Claude.

The assistants do NOT share chat history.

The shared source of truth is:

1. The actual files in the repository.
2. Git state and Git history.
3. Files inside `.ai/`.
4. Explicitly approved decisions.

AI assistants must not assume that another assistant's intentions
are known unless those intentions are documented.

---

## Roles

Each AI assistant acts as an independent engineering agent.

An assistant may:

- analyse the current implementation;
- propose solutions;
- identify bugs;
- challenge another assistant's proposal;
- modify files when explicitly instructed;
- review modifications made by another assistant.

The human owner of the project has final authority.

AI agents must not treat their own proposal as an approved decision.

---

## Source of Truth

When determining the current state of the project, inspect:

1. Current files.
2. `git status`.
3. Relevant `git diff`.
4. Relevant Git history.
5. `.ai/TASK.md`.
6. `.ai/PLAN.md`.
7. `.ai/DECISIONS.md`.
8. `.ai/WORKLOG.md`.

Do not rely exclusively on previous chat messages.

---

## Before Making Changes

Before modifying code:

1. Understand the current task.
2. Inspect the relevant implementation.
3. Check the current Git state.
4. Read the relevant AI context files.
5. Identify existing constraints.
6. State assumptions when they matter.

Do not make broad unrelated changes.

---

## After Making Changes

After modifying code:

1. Inspect the resulting diff.
2. Check for obvious regressions.
3. Run relevant tests or validation.
4. Update `.ai/WORKLOG.md` when the work materially changes the task.
5. Do not commit or push unless explicitly instructed.

---

## Collaboration Principle

AI assistants communicate through the shared project state.

The communication hierarchy is:

    Current files
          ↓
       Git diff
          ↓
    TASK / PLAN
          ↓
      WORKLOG
          ↓
     DECISIONS
          ↓
       History

Chat messages are not considered persistent project memory.

---

## GitHub

GitHub is primarily the persistent version-control and collaboration
layer.

Intermediate experimentation should normally remain local.

Do NOT push every intermediate change.

Push or commit when:

- a meaningful checkpoint has been reached;
- the human owner requests it;
- a stable version needs to be preserved;
- a branch/PR workflow explicitly requires it.

---

## Important

Do not delete historical information merely to reduce context size.

Use archival files and checkpoints instead.

The human owner decides when a checkpoint becomes authoritative.
'@

New-SafeFile (Join-Path $Root "AGENTS.md") $Agents

# ============================================================
# 2. TASK.md
# ============================================================

$Task = @'
# Current Task

## Status

No active task.

---

## Objective

Describe the specific task currently being worked on.

---

## Problem

Describe the problem that needs to be solved.

---

## Constraints

List technical, architectural, business or compatibility constraints.

---

## Acceptance Criteria

Define what must be true for the task to be considered complete.

---

## Current State

Short description of the current implementation.

---

## Assigned / Active Agent

- Agent:
- Started:
- Last update:

---

## Notes

Keep this file short.

It describes the CURRENT task, not the complete project history.
'@

New-SafeFile (Join-Path $AiDir "TASK.md") $Task

# ============================================================
# 3. PLAN.md
# ============================================================

$Plan = @'
# Development Plan

## Status

Draft

## Purpose

This document contains the current proposed implementation plan.

The plan is NOT automatically authoritative.

It must be reviewed and approved by the human project owner.

---

## Objective

Describe the desired result.

---

## Proposed Approach

Describe the proposed technical approach.

---

## Alternatives Considered

### Alternative 1

Description:

Advantages:

Disadvantages:

### Alternative 2

Description:

Advantages:

Disadvantages:

---

## Risks

List known technical or architectural risks.

---

## Implementation Steps

1. 
2. 
3. 
4. 

---

## Validation

Describe how the result will be tested.

---

## Approval

Status:

- [ ] Draft
- [ ] Reviewed by GPT/Codex
- [ ] Reviewed by Claude
- [ ] Disagreements resolved
- [ ] Approved by human
- [ ] Implemented
- [ ] Validated

Approved by:

Date:
'@

New-SafeFile (Join-Path $AiDir "PLAN.md") $Plan

# ============================================================
# 4. DISCUSSION.md
# ============================================================

$Discussion = @'
# AI Discussion

## Purpose

This file is a temporary shared discussion space for AI agents.

It allows GPT/Codex and Claude to communicate through the filesystem
without requiring access to each other's chat history.

---

## Rules

Each contribution should contain:

- Agent
- Date/time
- Topic
- Position
- Reasoning
- Proposed action

Agents should challenge ideas when appropriate.

Agreement is not required.

The purpose of discussion is to improve the technical result.

---

## Discussion

### [GPT/Codex]

Date:

Topic:

Position:

Reasoning:

Proposed action:


### [Claude]

Date:

Topic:

Position:

Reasoning:

Proposed action:


---

## Open Questions

1.
2.
3.

---

## Resolved Questions

1.
2.
3.

---

## Conclusion

Do not treat this document as the final project decision.

Once a decision is accepted, record the resulting decision in
`.ai/DECISIONS.md`.

Old discussions may later be archived.
'@

New-SafeFile (Join-Path $AiDir "DISCUSSION.md") $Discussion

# ============================================================
# 5. WORKLOG.md
# ============================================================

$Worklog = @'
# Current Worklog

## Purpose

Short-term working memory shared between AI assistants.

This file should remain small.

Do NOT use it as a complete historical record.

---

## Current Context

Current project state:

Current task:

Current blocker:

Current hypothesis:

---

## Recent Actions

### Entry

Agent:
Date/time:

Action:

Result:

Next step:


---

## Handoff

### From

Agent:

### To

Agent:

### Summary

What was done:

What remains:

Important findings:

Files changed:

Tests performed:

Potential risks:


---

## Checkpoint

Checkpoint ID:

Date:

Summary:

Approved:

---

## Maintenance Rule

When this file becomes too large:

1. Preserve important information.
2. Move completed historical entries to the history archive.
3. Keep only relevant current context here.
4. Never silently delete important decisions.
'@

New-SafeFile (Join-Path $AiDir "WORKLOG.md") $Worklog

# ============================================================
# 6. DECISIONS.md
# ============================================================

$Decisions = @'
# Architectural and Technical Decisions

## Purpose

This file contains decisions that have been accepted as authoritative
for the project.

It is NOT a discussion log.

---

## Decision Format

Each decision should contain:

- ID
- Date
- Context
- Decision
- Reasoning
- Alternatives rejected
- Consequences
- Approval

---

## Decisions

### DEC-0001

Status: Template

Date:

Context:

Decision:

Reasoning:

Alternatives rejected:

Consequences:

Approved by:

---

## Rule

A proposal discussed by AI agents does NOT become a decision
automatically.

A decision becomes authoritative only after explicit approval.

Previous decisions should normally remain in this file even when
later decisions supersede them.

When a decision is superseded, mark it accordingly instead of deleting
its history.
'@

New-SafeFile (Join-Path $AiDir "DECISIONS.md") $Decisions

# ============================================================
# 7. WORKLOG_HISTORY.md
# ============================================================

$History = @'
# Worklog History

This file contains archived historical worklog information.

It is intentionally separated from `.ai/WORKLOG.md`.

The current worklog should contain only information relevant to
the current development context.

---

## Archive

No archived entries yet.

---

## Archiving Rule

When a checkpoint is completed:

1. Preserve the relevant historical worklog entries here.
2. Keep `.ai/WORKLOG.md` focused on the current state.
3. Do not remove information that is necessary to understand an
   accepted architectural or technical decision.
4. Authoritative decisions belong in `.ai/DECISIONS.md`.
'@

New-SafeFile (Join-Path $AiDir "WORKLOG_HISTORY.md") $History

# ============================================================
# Завершение
# ============================================================

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "AI collaboration protocol created." -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Created structure:"
Write-Host ""
Write-Host "  AGENTS.md"
Write-Host "  .ai\TASK.md"
Write-Host "  .ai\PLAN.md"
Write-Host "  .ai\DISCUSSION.md"
Write-Host "  .ai\WORKLOG.md"
Write-Host "  .ai\WORKLOG_HISTORY.md"
Write-Host "  .ai\DECISIONS.md"
Write-Host ""
Write-Host "Existing files were NOT overwritten." -ForegroundColor Yellow
Write-Host ""
Write-Host "Next step: review the protocol with GPT/Codex and Claude."
Write-Host ""