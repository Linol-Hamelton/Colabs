# Current Task

Status: In progress
Owner: RuslanFomenko
Last update: 2026-09-19

## Objective

Implement the approved v1.9.5 plan (revision 2): C0 session-liveness fix, journal-cap invariant, gate freshness, capability/evidence discipline and documentation, under the two-sided gate protocol (Gemini implements, DeepSeek audits).

## Problem

The v1.9.4 hardening left three known gaps: C0 session liveness ignores a live supervisor PID; the completion gate accepts a stale receipt citation; and decisions are re-litigated without triggers.

## Constraints

- Size limits: TASK.md <= 80 lines, journals <= 150 lines, .ai/PLAN.md <= 200 lines.
- ASCII-only in PowerShell (.ps1) files. UTF-8 without BOM, LF in all text files.
- Validator exit 0 with 0 warnings; journals <= 30 by the index rule; full suite green.
- Completion requires independent adversarial review certification or owner sign-off.

## Acceptance criteria

- [x] A1 C0 fix + 11-branch matrix + PROTO-DEC-0029 + PROTOCOL.md liveness text (audited PASS 2026-09-19; owner approved; commit pending the AUD-1 wording fix).
- [ ] A2 journal-cap automation + record-order fix + CI escalation.
- [ ] A4 capability/evidence discipline + REVIEW.md Mode/Receipt-Owner fields (+DEC).
- [ ] A3 gate-check subcommand + validator integration + tests (+DEC).
- [ ] A5 documentation closure.
- [ ] B registry per owner decisions (+DEC if enforced); Track C only on separate dispatch.
- [ ] Whole-scope adversarial certification, freeze, ordered records, commit; tag/push per owner.

## Roles

- gemini: implementer
- deepseek: reviewer, auditor, controller

## Current state

Plan revision 2 approved 2026-09-19; all section-9 recommendations accepted. Track 0 executed (28 journals, 0 warnings). Item 1 (A1) implemented by Gemini and audited PASS by DeepSeek (report docs/reviews/2026-09-19-deepseek-flash-a1-audit.md); PROTO-DEC-0029 recorded in .ai/DECISIONS.md on owner approval. Follow-ups: AUD-1 required before the Item 1 commit; AUD-4 with Item 2. Item 2 dispatch: docs/reviews/2026-09-19-gemini-v1.9.5-item2-prompt.md.

## Next

Gemini applies AUD-1, commits Item 1 atomically, then implements Item 2 (A2); DeepSeek audits Item 2 before its commit.
