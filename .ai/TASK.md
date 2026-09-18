# Current Task

Status: In Progress
Owner: RuslanFomenko
Last update: 2026-09-19

## Objective

Harden protocol kernel against multi-model adversarial peer review findings (v1.9.4) and execute release protocol.

## Problem

Kernel edge cases identified across review rounds: arbitrary live-PID lock squatting, unauthenticated legacy Evidence certification, permissive archive transitional root, duplicated entry-hash logic, and review-summary ordering.

## Constraints

- Size limits: TASK.md <= 80 lines, journals <= 150 lines.
- ASCII-only in PowerShell (.ps1) files. UTF-8 without BOM, LF in all text files.
- Full regression suite and validator must pass with 0 warnings.
- Completion requires independent peer review certification or owner sign-off.

## Acceptance criteria

- [x] Registered nonce and session-token lock ownership validation (P-1, D1).
- [x] Archive single terminal root and orphan segment rejection (P-2, D2).
- [x] Scoped legacy Evidence policy with --allow-legacy (P-3, D3, A-1).
- [x] Consolidated canonicalEntryBody helper in protocol-hooks.cjs (P-4, D4).
- [x] Review persistence ordering rule & hardened completion gate (P-5, D5, A-4).
- [x] Multi-batch boundary canonicalization & P5-F2 regression test (P-5, A-5).
- [x] PROTO-DEC-0028 approved and recorded in DECISIONS.md.
- [x] Bump to 1.9.4, atomic release commit (c71bdcf), annotated tag v1.9.4.
- [x] Synchronize and verify consumers Block-Puzzle and VPN via -Force and -Verify.
- [x] Compose final adversarial audit prompt (`docs/reviews/2026-09-18-v1.9.4-final-adversarial-audit-prompt.md`).
- [ ] Independent opposing review certification (AGENTS.md §2).

## Roles

- gemini: implementer & consensus synthesizer
- deepseek: opposing reviewer
- copilot: architectural reviewer
- mistral: code reviewer
- codegeex: security & edge-case auditor
- qwen: protocol auditor

## Current state

P-1..P-6 implemented and verified. Commit `c71bdcf` tagged `v1.9.4`. Full test suite 200/200 PASS in 91.9s, doctor Healthy, validator 0 warnings. Consumers Block-Puzzle and VPN synchronized and verified (18/18 digests match, 0 warnings). Final adversarial audit prompt dispatched.

## Open questions

None for v1.9.4.

## Next

Opposing reviewer (deepseek) adversarial evaluation and verdict certification.
