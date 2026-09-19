# Gemini Stop-Path Fix Prompt - Circular Dependency in protocol-session.cjs

**Date**: 2026-09-19  
**Implementer**: Gemini  
**Auditor**: DeepSeek - verifies before the pilot starts  
**Trigger**: found by the controller's telemetry dry run after C1 (`5b34ae0`).

## Defect

Running `node .ai/bin/protocol-session.cjs stop ...` prints Node warnings:

```
Warning: Accessing non-existent property 'isSessionAlive' of module exports inside circular dependency
Warning: Accessing non-existent property 'checkProcessAlive' of module exports inside circular dependency
```

Root cause: `protocol-session.cjs` invokes `main()` before assigning `module.exports`. In the `stop` path the lazy `require('./protocol-archive.cjs')` (line ~155) loads `protocol-archive` -> `protocol-lock`, and `protocol-lock` top-level destructures `{ isSessionAlive, checkProcessAlive }` from `protocol-session`, whose exports are still `{}` at that moment. Lock captures `undefined`, and because the auto-archive call sits inside `try { ... } catch { }`, **auto-archive silently no-ops when invoked from the CLI stop path** (hook-driven stops are unaffected because hooks load session before lock).

## Fix

1. In `.ai/bin/protocol-session.cjs`, move the `module.exports = { ... }` assignment **before** the `if (require.main === module) { ... }` block so exports exist while the CLI runs. Do not change any function body.
2. Apply the same ordering in `.ai/bin/protocol-hooks.cjs` (`module.exports` before `if (require.main === module) main();`) for symmetry and to remove the same latent hazard.
3. Regression tests (extend `tests/session.test.cjs` and/or `tests/hooks.test.cjs`):
   - Spawn `node .ai/bin/protocol-session.cjs stop ...` in a fixture with a >150-line journal and assert: exit 0, stderr contains no `circular dependency` warning, and the auto-archive actually moved older entries (the silent no-op is fixed).
   - Keep a cheap cycle guard: a test that `require('./.ai/bin/protocol-session.cjs')` then `require('./.ai/bin/protocol-lock.cjs')` exposes callable `isSessionAlive`/`checkProcessAlive` (no undefined).
4. Do not touch telemetry semantics, the metrics file, decision blocks, journals of other sessions, or the pilot design.

## Verification

- New tests green; `tests/hooks.test.cjs`, `tests/session.test.cjs`, `tests/codex.test.cjs`; full `test-protocol.ps1`; `validate-protocol.ps1` exit 0 with 0 warnings.
- Manual reproduction transcript (before/after) in your report.
- Journal (five labels), `record --owner gemini-434bcd8012e0f38c`, `verify --deep` exit 0; stop for the audit; no commit, no push.
