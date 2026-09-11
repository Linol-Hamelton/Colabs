# Development Plan

Status: In progress
Task: Harden the default collaboration workspace before the test project.
Author: GPT/Codex
Date: 2026-09-11

## Authorization

The owner requested implementation of the review's repairs on 2026-09-11.
DEC-0009 records the approved repair scope and implementation boundaries.
This plan tracks work; it does not independently approve new decisions.

## Approach

1. Separate install-time state from upgradeable protocol files. Verify only
   checks working-state presence; Force never overwrites accumulated memory.
   Preserve existing application configuration and back up managed replacements.
2. Validate Git-visible text and required protocol files, strict UTF-8/LF,
   decision blocks, hook configuration, dependencies and exact line limits.
3. Replace path/mtime heuristics with Git NUL-delimited records and per-session
   content snapshots; inject complete recent entries and a unique worklog path.
4. Serialize shared metadata edits with an explicit cooperative writer lock.
   Delegate implementation through disjoint file sets; no claim of OS-wide
   protection against non-participating writers.
5. Reconcile instructions, preserve old decisions, and document local defaults.
6. Add dependency-free Node regression tests, a PowerShell test entrypoint,
   and a Windows CI workflow. Exercise installation, upgrades, negative checks,
   hook shell entrypoints and lock contention in isolated temporary fixtures.

## Alternatives considered

- Keep timestamps: cannot reliably detect deletion, touch-only logs or edits
  within one clock tick. Content snapshots fit the existing Node dependency.
- Add a database/server: unnecessary for a local handoff protocol. Atomic local
  lock operations plus explicit ownership keep the workflow inspectable.
- Overwrite all settings: would lose project permissions and unrelated hooks.
  Preserve project configuration and update only managed protocol entries.

## Validation

Run test-protocol.ps1, validate-protocol.ps1, setup-ai-protocol.ps1 -Verify
through powershell -NoProfile -ExecutionPolicy Bypass -File.
Run git diff HEAD --check.

## Remaining practical validation

The future test project should measure missing handoff context, repeated work,
owner clarification requests and time spent maintaining protocol documents.
This task does not claim to establish those product outcomes.
