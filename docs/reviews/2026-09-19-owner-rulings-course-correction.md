# Owner Rulings - Course Correction Package (2026-09-19)

**Date**: 2026-09-19
**Recorded by**: deepseek-flash, controller session
**Authority**: direct owner confirmation in chat, 2026-09-19, given as answers to the
structured decision menu presented after the four-prompt evaluation round (P1-P4).
These rulings are binding; the implementing session transcribes them per PROTO-DEC-0030.
**Baseline**: `d38d2f2`, working tree dirty.

## Rulings

| # | Decision | Owner's ruling |
|---|---|---|
| Q1 | Close Track C / Repomix and record PROTO-DEC-0036 | **Approve with corrections**: close permanently; wording "stop rule executed", not "violated"; `Reopen-trigger: owner-directive`; PROTO-DEC-0034 advisory helper remains; no goalpost shift. |
| Q2 | Review-corpus cleanup depth | **Moderate: ~50 files kept.** Keep-set derived from live citations (38 paths cited in worklogs + 17 `Mode: CERTIFYING`, overlap 5); move ~80 to `docs/reviews/archive/` with `INDEX.md`; `doctor` + `gate-check` before and after; never touch `DECISIONS.md`, `REGISTRY.md`, `.ai/ARCHIVE.md`. |
| Q3 | Closing `.ai/TASK.md` | **Keep the task line moving**: record the completed items (C1a, F-001..F-004, Track C closure) and replace TASK with the recovery package as a new task; do not spend a round on a certifying review merely to mark `Status: Completed`. |
| Q4 | First product pilot (H3) | **Both products at once** (`Block-Puzzle` AND `VPN`), against the council recommendation of one. Owner's decision stands. |
| Q5 | Mandatory adversarial review | **Scale by blast radius** (PROTO-DEC draft 0038): full prompt + independent review for protocol core (`.ai/`, `.claude/`, hooks, validator, gates) and consumer security/data paths; one reviewer statement for docs/config/one-line fixes; artifact size caps. |
| Q6 | v2.0 and record pass | **Scope now, code after the pilot**; lock holder and transcriber: **Gemini** (`gemini-434bcd8012e0f38c` or its new session id); DeepSeek reviews; Codex if available. |
| Q7 | `2026-09-19-grand-consensus-systemic-course-correction.md` | **Reissue correctly**: the original stays immutable as history; a corrected superseding file removes the unverified `Approved by` and `Status: Accepted`, fixes the cp1251 mojibake, and does not claim certification without a receipt. |

## Deviation from the council recommendation (recorded honestly)

H3 was the only item where the owner overrode all four evaluations. The council's
argument for one product first was: `.ai/PLAN.md:98-101` requires one owner-named
objective with pre-agreed metrics; `DEC-0020` records the first pilot's failure of
exactly the duplicate-assignment kind; and `Block-Puzzle` (43 dirty files) and `VPN`
(34 dirty files) both need a triage commit before any new task. The owner chose both,
so the mitigation is structural and mandatory:

1. Triage first in each repository (finish-or-revert the parked work, product tests,
   one commit) before the first pilot task.
2. Two disjoint sessions, one per repository; no agent and no task shared between them.
3. One owner-named objective and pre-agreed metrics per repository before its first
   task; the 10-20 task pilot budget is split across the two.
4. The `PLAN.md:63-68` metrics and the "one task file + one handoff note" control
   apply in both repositories, measured per repository.

## Transcription basis

The implementing lock holder may append the decisions with the provenance line:

`Approved by: RuslanFomenko (direct owner confirmation in chat, 2026-09-19, transcribed by gemini-<session-id>)`

The confirmation is the table above, recorded in the controller session on
2026-09-19 and relayed in the implementation dispatch
`docs/reviews/2026-09-19-gemini-course-correction-implementation-prompt.md`.
No agent may extend these approvals to items not listed here.

## Next step

Gemini executes the dispatch under the shared-document lock; DeepSeek audits the
implementation with a unified adversarial review before the pilot sessions start.
