# Current Task

Status: Completed
Owner: RuslanFomenko
Last update: 2026-09-19

## Objective

v1.9.5 remediation: C0 session liveness, record/cap ordering, gate freshness binding, capability/evidence discipline, documentation closure and the decision registry, per the approved plan revision 2.

## Problem

The v1.9.4 hardening left C0 liveness, stale-receipt gate citations and decision re-litigation without triggers; the v1.9.5 cycle closed them.

## Constraints

- Size limits: TASK.md <= 80 lines, journals <= 150 lines, .ai/PLAN.md <= 200 lines.
- ASCII-only PowerShell (.ps1); UTF-8 without BOM, LF everywhere.
- Validator exit 0 with 0 warnings; journals <= 30; suite green.

## Acceptance criteria

- [x] A1 C0 fix + 11-branch matrix + PROTO-DEC-0029 + PROTOCOL.md liveness text.
- [x] A2 journal-cap invariant + record-order fix + CI escalation.
- [x] A4 capability/evidence discipline + REVIEW.md Mode/Receipt-Owner fields (PROTO-DEC-0031).
- [x] A3 gate-check + validator integration + tests (PROTO-DEC-0032).
- [x] A5 documentation closure.
- [x] B decision registry with WARN-first validation (PROTO-DEC-0033).
- [x] Whole-scope adversarial certification, delta re-certification, freeze and ordered records.
- [ ] Tag v1.9.5 and push (owner decision); Track C on separate dispatch.

## Roles

- gemini: implementer
- deepseek: reviewer, auditor, controller

## Current state

All items implemented, audited and committed (`1fb0580`). Certification: Claude Opus independent review RECOMMENDATION and delta re-certification PASS with all findings closed; Qoder and Mistral reports are non-gate-valid as submitted; CodeGeeX/GLM advisory output was rejected as not reproducible against this repository. Journals 29/30; validator 0 warnings after the freeze and record pass.

## Completion gate

- Adversarial review prompt: docs/reviews/2026-09-19-final-v1.9.5-adversarial-review-prompt.md
- Independent review: docs/reviews/2026-09-19-claude-opus-v1.9.5-delta-certification.md

## Next

Owner approves the release commit and the annotated tag `v1.9.5`; push and consumer re-sync per owner decision.
