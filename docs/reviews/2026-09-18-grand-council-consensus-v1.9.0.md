# Grand Council Consensus & Architecture Review: Protocol v1.9.0 - v1.9.1

**Date**: 2026-09-18T04:10:00Z  
**Reviewed commit**: `bed0d70` (v1.9.0 baseline), `2e951d6` (v1.9.1 stabilization)  
**Working tree**: clean  
**Reviewers**: DeepSeek, Copilot, Mistral, Qwen, GLM, Claude, Gemini (Synthesizer)  
**Scope**: Council audit, architectural consensus, fork resolution, and edge-case verification  
**Verdict**: PASS / APPROVED  

---

## Executive Summary

A comprehensive, multi-model council comprising seven independent AI assistants (Claude, DeepSeek, Copilot, Mistral, Qwen, GLM, Gemini) evaluated protocol release v1.9.0. The council unanimously approved the core architecture (append-only decisions, cooperative locking with operation gates, operator CLI, and tamper-evident Merkle chains).

Five architectural forks were formally settled in binding decision `PROTO-DEC-0025`. Five high-impact edge cases surfaced by independent fault-injection probes were resolved with regression tests in commit `2e951d6` (v1.9.1). Furthermore, all models reached unanimous agreement on formalizing `docs/reviews/` as the primary medium for long-form engineering reports to eliminate context loss.

---

## Scope and Evidence

- **Baseline Commits**:
  - `bed0d70`: Initial v1.9.0 implementation.
  - `2e951d6`: v1.9.1 stabilization and council consensus fixes.
- **Verification Suite**:
  - `validate-protocol.ps1`: Exit 0, 0 warnings across all runs.
  - `test-protocol.ps1`: 181/181 regression tests passing (100% pass, 0 failures).
  - Independent fault-injection probes written and executed across Node.js runtime fixtures.
- **Consumer Projects**:
  - `D:\Block-Puzzle`: Clean install and validation (exit 0, 0 warnings).
  - `D:\VPN`: Clean install and validation (exit 0, 0 warnings).

---

## Findings Matrix

| Id | Severity | Finding | Discoverer | Resolution |
|---|---|---|---|---|
| F-001 | CRITICAL | Tampered parent entries were accepted by `record` without failing closed (Merkle bypass) | DeepSeek (Probe B), confirmed by Gemini | Resolved: Fail-closed verification added in `protocol-handoff.cjs` |
| F-002 | HIGH | Auto-archiving modified `.ai/ARCHIVE.md`, invalidating session snapshot digests | DeepSeek (Probe E) | Resolved: `.ai/ARCHIVE.md` excluded from tree digest calculation in `protocol-hooks.cjs` |
| F-003 | HIGH | Default in-journal verification inspected only the immediate head entry | DeepSeek (Probe G) | Resolved: Default `verify` traverses entire active journal (<2ms); `--deep` traverses archive |
| F-004 | MEDIUM | Worklog auto-archiving wrote in-place, risking corrupted state during sudden crashes | Copilot, DeepSeek (Probe I) | Resolved: Atomic write via temporary file + `fs.renameSync` in `protocol-archive.cjs` |
| F-005 | MEDIUM | Runtime cleanup pruned snapshots purely by 24h age, risking active long-running sessions | Copilot, DeepSeek (Probe J) | Resolved: Enforced `isProcessAlive` guard before applying age threshold in `protocol-session.cjs` |
| F-006 | HIGH | Architectural essays and deep audits lost in chat history or truncated by 150-line journal limits | Gemini, Copilot, DeepSeek, Mistral | Resolved: Formalized `docs/reviews/` and `templates/reviews/REVIEW.md` |

---

## Consensus on Architectural Forks (PROTO-DEC-0025)

The council evaluated five explicit architectural dilemmas, converging on unanimous recommendations:

### Fork 1: Release Commit Granularity
- **Dilemma**: Single atomic release commit with annotated tag vs. intermediate micro-commits.
- **Council Verdict**: **Single atomic commit**.
- **Rationale**: An annotated tag represents a certified, verified protocol state. Intermediate commits introduce broken, non-bisectable states into repository history.

### Fork 2: Merkle Chain Verification Depth
- **Dilemma**: Default verification depth: O(1) head check vs. full active journal vs. deep archive traversal.
- **Council Verdict**: **Full active journal by default; `--deep` for archive traversal**.
- **Rationale**: Traversal of the active journal (bounded by 150 lines) takes <2ms and closes historical tampering blind spots. Deep archive traversal is reserved for `protocol.cjs doctor` and CI.

### Fork 3: Runtime Snapshot Retention Policy
- **Dilemma**: 24-hour TTL vs. immediate deletion on session stop.
- **Council Verdict**: **24-hour TTL with strict process liveness check**.
- **Rationale**: Immediate deletion destroys post-mortem crash forensics. Requiring confirmation that the owning PID is dead before pruning protects active sessions.

### Fork 4: Multi-Repository Synchronization & Commit Isolation
- **Dilemma**: Protocol script commits into consumer repos vs. consumer-local commit control.
- **Council Verdict**: **Strict repository isolation**.
- **Rationale**: The protocol source repository must never create commits or alter Git history in consumer repositories. Upgrades are performed within the consumer's active session.

### Fork 5: Cross-Platform Validator Migration
- **Dilemma**: Rewrite validator in Node.js immediately vs. defer to v2.0 roadmap.
- **Council Verdict**: **Defer to v2.0 roadmap**.
- **Rationale**: Rewriting the core validation engine during stabilization introduces unnecessary regression risk. v2.0 will introduce a cross-platform validator with differential testing.

---

## Resolution of Independent Fault Probes

### Probe B: Parent-Entry Tamper Resistance
- **Vulnerability**: Altering an older entry in an active journal and running `record` stamped a new Evidence block without verifying the integrity of parent entries, effectively laundering tampered records.
- **Fix**: `protocol-handoff.cjs` now performs a full backwards chain verification before generating an Evidence block. If any parent entry hash does not match, recording aborts immediately with a nonzero exit code.

### Probe E: Archive Snapshot Isolation
- **Vulnerability**: When an entry was archived into `.ai/ARCHIVE.md`, the file's digest changed. Because `.ai/` was included in the session snapshot tree digest, existing receipts became invalid.
- **Fix**: `.ai/ARCHIVE.md` was added to the exclusion list in `protocol-hooks.cjs` alongside `.ai/runtime/` and `.ai/worklog/`.

### Probe G: Historical Entry Invalidation
- **Vulnerability**: Running `protocol-handoff.cjs verify` only checked the newest entry in the journal.
- **Fix**: `verify` now scans backwards through every entry in the file, validating `parent-entry` linkage and ensuring the entire chain is unbroken.

### Probe I: Worklog Crash Consistency
- **Vulnerability**: Direct `fs.writeFileSync` to the active journal during archiving could result in zero-byte or truncated files if interrupted by power failure or kill signals.
- **Fix**: Worklog archiving writes to a temporary sibling file (`.ai/worklog/.tmp-<random>`) and replaces the target file via atomic `fs.renameSync`.

### Probe J: Liveness-First Runtime Cleanup
- **Vulnerability**: Time-based pruning removed runtime files older than 24 hours even if the owning agent process was still running.
- **Fix**: `cleanup-runtime` checks `isProcessAlive(pid)` first. If the process is alive, the snapshot is preserved regardless of age.

---

## Formalization of the Architecture & Peer Review System

All seven models agreed that technical essays, audits, and consensus documents must live in Git outside `.ai/`:
1. **Primary Deliverable**: Full report in `docs/reviews/YYYY-MM-DD-<agent>-<topic>.md` using `templates/reviews/REVIEW.md`.
2. **Journal Entry**: Concise summary in `.ai/worklog/<agent>.md` (<= 150 lines) with the five mandatory labels and a verifiable Evidence block.
3. **Chat Response**: Executive verdict, link to review file, and top blockers.
4. **Chat Transcription Fallback**: For models operating through chat panels without direct filesystem access, the human owner or coordinator persists the text with:
   `> Transcribed from chat by <owner/agent>, model: <name>, date: <ISO>`
5. **Consensus Synthesis**: Following multi-model reviews, a designated synthesizer produces a consolidated review report before converting approved items into tasks in `.ai/TASK.md`.

---

## Conclusion & Sign-Off

Protocol v1.9.1 is fully stabilized, verified by 181 passing regression tests, and certified across consumer projects. The Architecture & Peer Review System is formally adopted.

**Sign-off**:
- DeepSeek: Approved
- Copilot: Approved
- Mistral: Approved
- Qwen: Approved
- GLM: Approved
- Claude: Approved
- Gemini: Approved (Consensus Synthesizer)
- Human Owner: RuslanFomenko
