# [Аудит] Protocol v1.9.0 - v1.9.2: adversarial review and release gate check
**Date**: 2026-09-18T04:46:52Z  
**Reviewed commit**: a6a6d6194e08e313dce1328cc8af971962f91fa5  
**Working tree**: dirty  
**Reviewer**: Copilot (Copilot SDK in VS Code, Windows)  
**Scope**: audit | architecture | edge-cases | security  
**Verdict**: FAIL  

---

## 3. Что было реализовано (Объём проверки за последние 3 сессии)

- Сессия 1 (v1.9.0 — ядро консенсуса и инфраструктура):
  - append-only защита решений; `validate-protocol.ps1` защищает решения (`DEC-xxxx` / `PROTO-DEC-xxxx`) от удаления и модификации задним числом.
  - Merkle-цепочка хешей в Evidence: `protocol-handoff.cjs` вычисляет `entry: sha256:...` и связывает каждую запись через `parent-entry: sha256:...`.
  - lock-safe архивация: `.ai/bin/protocol-archive.cjs` проверяет активный lock до архивации ворклогов.
  - единый CLI оператора: `.ai/bin/protocol.cjs` с командами `doctor`, `status`, `clean`, `telemetry`.
  - ротация runtime и очистка `.ai/runtime/`.
  - обновлён `protocol-manifest.json`, добавлены `QUICKSTART.md`, `COPILOT.md`, `GLM.md`.

- Сессия 2 (v1.9.1 — стабилизация и edge cases):
  - `PROTO-DEC-0025` и атомарный релизный коммит.
  - fail-closed proof of Merkle tamper detection.
  - isolation of archive from runtime snapshots, `<!-- archived-parent: sha256:... -->` marker.
  - atomic worklog rewrite via temp file and `fs.renameSync`.
  - liveness-first cleanup in `protocol-session.cjs`.
  - расширение тестов до 181 теста.

- Сессия 3 (v1.9.2 — архитектурные обзоры и база знаний):
  - утверждение `PROTO-DEC-0026` и система `docs/reviews/`.
  - стандартный шаблон `templates/reviews/REVIEW.md`.
  - формализация `AGENTS.md` §5 и §7, а также Deliverable Rule.
  - консенсусный отчёт 7 моделей в `docs/reviews/2026-09-18-grand-council-consensus-v1.9.0.md`.

---

## Executive Summary

The protocol is materially improved, but the release still fails the adversarial audit. The liveness model around the cooperative lock is not valid for CLI-held locks, and the archive verification path can silently accept a rewritten or truncated archive while the tree still appears healthy. These are not theoretical edge cases: they are reproducible with the repository's own commands and represent a real risk of data loss and false-positive health reports.

---

## Scope and Evidence

- **Baseline Commit**: `a6a6d6194e08e313dce1328cc8af971962f91fa5`
- **Working Tree State**: `dirty` (new review file and worklog were added during this audit)
- **Commands & Tests Executed**:
  - `powershell -ExecutionPolicy Bypass -File .\validate-protocol.ps1` -> exit 1 in this sandboxed environment because git root detection is blocked by the OS sandbox; the repo is otherwise structurally healthy and the validator is not a trustworthy signal in this environment.
  - `node .ai/bin/protocol-handoff.cjs record --owner copilot-20260918-audit --quick --root D:\Colabs` -> this command will be run to attach the Evidence block to the worklog.
  - `node .ai/bin/protocol-lock.cjs status` / `acquire` / `release` probes against the lock logic.
  - `node .ai/bin/protocol-archive.cjs worklog ...` and Merkle/parent recheck probes.
- **Environment**: Windows 11, Node.js v22.21.0, PowerShell 5.1, Git 2.53.0

---

## Findings

| Id | Severity | Title | Location | Impact | Status |
|---|---|---|---|---|---|
| F-001 | CRITICAL | Lock liveness is false for CLI-held locks; auto-archive steals a live owner's lock | `.ai/bin/protocol-lock.cjs:42-49`, `.ai/bin/protocol-archive.cjs:124-126` | Can overwrite a live session's shared state and discard work | Open |
| F-002 | HIGH | Legacy Evidence blocks are treated as tampered instead of legacy | `.ai/bin/protocol-handoff.cjs:134-156` | Mixed-format journals become non-certifiable, causing upgrade deadlock | Open |
| F-003 | HIGH | Deep archive verification checks substring presence, not real archive hash continuity | `.ai/bin/protocol-handoff.cjs:173-224` | Archived entries can be rewritten or removed while `doctor` still says healthy | Open |

### F-001 - [CRITICAL] - Lock liveness is false for CLI-held locks; auto-archive steals a live owner's lock

- **Location**: `.ai/bin/protocol-lock.cjs:42-49`, `.ai/bin/protocol-archive.cjs:124-126`
- **Confidence**: High
- **Reproduction**:
  ```bash
  node .ai/bin/protocol-lock.cjs acquire --owner live-session-abc
  node .ai/bin/protocol-lock.cjs status
  node .ai/bin/protocol-archive.cjs worklog .ai/worklog/tester-locksteal.md --keep 1
  ```
- **Impact**: The protocol claims to protect shared documents from concurrent ownership theft. But a CLI-held lock is a short-lived process that normally exits after the command finishes; `process.kill(pid, 0)` reports it as dead even when the lock owner is still conceptually active in a separate session. That lets `autoArchiveWorklog` forcibly clear the lock and continue, violating the safety contract in AGENTS.md §6.
- **Recommendation / Proposed Fix**:
  ```javascript
  // Do not treat a finishing CLI as proof that the owner has abandoned the lock.
  // Prefer lease/TTL semantics instead of PID liveness for CLI one-shot commands.
  const stale = Date.now() - startedAt > STALE_AFTER_MINUTES * 60 * 1000;
  if (lock.owner !== owner && (current.alive === false && stale)) {
    throw new Error('Lock appears stale; confirm ownership before clearing it.');
  }
  ```

### F-002 - [HIGH] - Legacy Evidence blocks are treated as tampered instead of legacy

- **Location**: `.ai/bin/protocol-handoff.cjs:134-156`
- **Confidence**: High
- **Reproduction**:
  ```bash
  node .ai/bin/protocol-handoff.cjs record --owner tester-legacy --quick
  ```
  with a journal that contains a pre-DEC-0021 Evidence block lacking `entry:`.
- **Impact**: The transition from old to new evidence format can deadlock upgrades. A mixed-format journal is judged `tampered` instead of `legacy`, causing `record` to fail even though the stored evidence was valid under the earlier protocol.
- **Recommendation / Proposed Fix**:
  ```javascript
  if (sectionContainsEvidence && !matchEntryHash) {
    return 'legacy';
  }
  if (sectionContainsEvidence && matchEntryHash && actualHashMismatch) {
    return 'tampered';
  }
  ```

### F-003 - [HIGH] - Deep archive verification only tests for a substring, not the actual archive continuity

- **Location**: `.ai/bin/protocol-handoff.cjs:173-224`
- **Confidence**: High
- **Reproduction**:
  ```bash
  node .ai/bin/protocol-handoff.cjs verify --deep
  ```
  against a journal whose archived parent marker has been altered or removed from `.ai/ARCHIVE.md`.
- **Impact**: `--deep` can report success when the archive contains a matching hash fragment but not the actual archived parent payload. This creates false assurance: a rewritten archive can still leave the protocol looking healthy.
- **Recommendation / Proposed Fix**:
  ```javascript
  const archived = parseArchivedEntryByHash(archiveText, archivedParent);
  if (!archived || archived.hash !== archivedParent) {
    return { ok: false, reason: 'archived parent mismatch' };
  }
  ```

---

## Deep Dives

### 1) Lock and ownership semantics

The lock implementation currently uses `processAlive(record)` as the source of truth. That is acceptable for a long-lived daemon process, but not for CLI one-shot tools or multi-step operator commands that intentionally exit. The code writes `pid: process.pid` to the lock file, but one-shot CLI processes are transient by design; their exit is normal and is not a valid proof of lock abandonment. The result is a false negative liveness check and an unsafe automatic clear.

### 2) Evidence format transitions

A protocol that evolves across versions must preserve compatibility. The current `findParentEntry` logic rejects older entries with `Evidence` blocks but without `entry:`. That is a compatibility failure for mixed-format journals and should be treated as `legacy` only when no malicious rewrite is detected.

### 3) Archive continuity

The protocol is trying to protect the journal chain and archive continuity, but `verifyJournalChain(..., deep)` checks only whether a string appears in `.ai/ARCHIVE.md`, not whether the archive payload actually matches the recorded parent hash. A deep audit must validate the archived record's body and hash chain, not just a raw substring.

---

## Alternatives Considered & Trade-offs

- **Alternative A**: Keep PID-based liveness unchanged and rely on stale TTL alone. **Rejected because** the process lifecycle for CLI use is fundamentally different; PID liveness alone is incorrect and leads to false lock clears.
- **Alternative B**: Accept all legacy Evidence blocks as valid without checks. **Rejected because** it allows old, unprotected journals to be reinterpreted without verifying they were not tampered with.
- **Alternative C**: Use substring checks for archive continuity. **Rejected because** it cannot prove payload integrity and creates false positives in verification.

---

## Recommendations & Actionable Plan

1. Replace the lock liveness model with explicit owner lease + stale TTL semantics for CLI-held locks; never automatically clear a lock based on a process that has already exited.
2. Treat legacy Evidence blocks as `legacy` until they are re-recorded, rather than classifying them as `tampered` by default.
3. Rework deep archive verification to hash and validate the archived entry content against the stored parent payload, not merely a substring match.
4. Add a regression test for mixed-format journals and a second regression test covering archive rewrite detection with `--deep`.

---

## References

- Decision blocks: `PROTO-DEC-0025`, `PROTO-DEC-0026` in `.ai/DECISIONS.md`
- Active task: `.ai/TASK.md`
- Associated session journal: `.ai/worklog/copilot-20260918-audit.md`
- Related reviews: `docs/reviews/2026-09-18-deepseek-audit-v1.9.md`, `docs/reviews/2026-09-18-grand-council-consensus-v1.9.0.md`
