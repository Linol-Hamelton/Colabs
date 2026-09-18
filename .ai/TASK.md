# Current Task

Status: In Progress
Owner: RuslanFomenko
Last update: 2026-09-18

## Objective

Harden protocol kernel against multi-model adversarial peer review findings (v1.9.3) and establish mandatory adversarial review prompt invariant.

## Problem

Adversarial reviews from DeepSeek, Copilot, Mistral, CodeGeeX, and Qwen identified 6 edge cases: CLI lock theft in autoArchiveWorklog, Windows atomic rename collision, legacy Evidence backward compatibility, deep archive hash verification blindspot, timezone offset parsing, and liveness-first cleanup. Furthermore, post-council implementation lacked a mandatory peer review prompt requirement.

## Constraints

- Size limits: TASK.md <= 80 lines, journals <= 150 lines.
- ASCII-only in PowerShell (.ps1) files. UTF-8 without BOM, LF in all text files.
- Full regression suite and validator must pass with 0 warnings.
- Completion requires independent peer review certification or owner sign-off.

## Acceptance criteria

- [x] Transcribe multi-model reviews to `docs/reviews/`.
- [x] Harden lock preservation in `protocol-lock.cjs` and `protocol-archive.cjs`.
- [x] Add Windows `atomicRename` retry with exponential backoff.
- [x] Restore legacy Evidence compatibility (format < 4) in `protocol-handoff.cjs`.
- [x] Implement fail-closed deep archive cryptographic body re-hashing.
- [x] Standardize date heading regex with numeric timezone offsets.
- [x] Guard `cleanup-runtime --force` with liveness-first check in `protocol-session.cjs`.
- [x] Add Mandatory Adversarial Peer Review Prompt rule to `AGENTS.md` and `QUICKSTART.md`.
- [x] Record `PROTO-DEC-0027` in `.ai/DECISIONS.md`.
- [x] Expand test coverage (`handoff.test.cjs`, `lock.test.cjs`, `session.test.cjs`).
- [x] Verify full regression suite and sync consumers (`Block-Puzzle`, `VPN`).
- [x] Compose comprehensive adversarial review prompt for all models (`docs/reviews/2026-09-18-unified-adversarial-audit-prompt.md`).

## Roles

- gemini: implementer & consensus synthesizer
- deepseek: opposing reviewer
- copilot: architectural reviewer
- mistral: code reviewer
- codegeex: security & edge-case auditor
- qwen: protocol auditor

## Current state

Multi-model adversarial audit completed across 7 model families. Grand consensus synthesis published in `docs/reviews/2026-09-18-grand-adversarial-consensus-v1.9.4.md`. All 6 verified defects resolved: completion gate regex bolding, format-4 genesis link in verify --deep, supervisor --session-pid validation, doctor exit code, copilot worklog rehash, and 7-day stale liveness check. Full suite (176/176 pass in 76s), doctor (all clean), and consumers (Block-Puzzle, VPN) verified green with 0 warnings.

## Open questions

Council v2.0 discussion: Evidence metadata signing and lock reentrancy nonces.

## Next

Owner sign-off and release tagging for v1.9.4.

