# Gemini - Course Correction Implementation Dispatch (Owner-Approved)

**Date**: 2026-09-19
**From**: deepseek-flash, controller session
**To**: Gemini (implementer, lock holder per the owner's Q6 ruling)
**Baseline**: `d38d2f2ae4b4c17fe6c2c18f11215cedb2f10eb1`, working tree dirty
**Authority**: owner rulings recorded in `docs/reviews/2026-09-19-owner-rulings-course-correction.md` (direct owner confirmation in chat, 2026-09-19)
**Goal**: execute the approved recovery package, then stop for DeepSeek's independent adversarial audit. No commits, no consumer-repository writes.

## 0. Preconditions and lock

1. Confirm no other writer is active; run `node .ai/bin/protocol-lock.cjs status`.
2. Start your session: `node .ai/bin/protocol-session.cjs start --agent gemini` and note the printed owner id.
3. Acquire the shared-document lock with that owner id before editing `.ai/TASK.md`, `.ai/PLAN.md`, `.ai/DECISIONS.md`, `docs/decisions/REGISTRY.md`, `AGENTS.md` or `QUICKSTART.md`.
4. Read first: the four evaluation reports `docs/reviews/2026-09-19-eval-p1..p4-*.md` (P2 has the ready decision-block drafts and the TASK/PLAN text; P4 has the exact command sequence and the receipt-safe ordering), the owner rulings file, and `.ai/DECISIONS.md` tail (`PROTO-DEC-0030..0035`).

## 1. Owner rulings (binding, verbatim summary)

- Q1: close Track C/Repomix permanently; record PROTO-DEC-0036 with `Reopen-trigger: owner-directive`; wording "stop rule executed", not "violated"; no threshold lowering; PROTO-DEC-0034 advisory helper stays.
- Q2: moderate archive - keep ~50 files derived from live citations; move ~80 to `docs/reviews/archive/` with `INDEX.md`; `doctor` + `gate-check` before and after; never touch `.ai/DECISIONS.md`, `docs/decisions/REGISTRY.md`, `.ai/ARCHIVE.md`.
- Q3: do NOT mark the current task Completed; record what was completed and replace TASK with the recovery package as a new task (no certifying review for the closure).
- Q4: pilot runs in **both** `D:\Block-Puzzle` and `D:\VPN` (owner override of the council; mitigation in §3.7 is mandatory).
- Q5: risk-scaled adversarial review (PROTO-DEC-0038).
- Q6: v2.0 scope now, code after the pilot; Gemini is the lock holder; DeepSeek audits.
- Q7: reissue the corrupted grand-consensus file correctly; original stays immutable.

## 2. Deliverables in required order

### 3.1 Baseline evidence
Run and capture exit codes and output: `powershell -ExecutionPolicy Bypass -File .\validate-protocol.ps1`, `node .ai/bin/protocol.cjs doctor`, `node .ai/bin/protocol-handoff.cjs gate-check`, `git status --short`, file counts of `docs/reviews/` (files, bytes), journal count from `protocol-archive.cjs status`.

### 3.2 Review-corpus archive (moderate keep-set)
1. Re-derive the keep-set at execution time with a read-only scan: every `docs/reviews/*.md` path cited anywhere under `.ai/worklog/*.md`, plus every file whose header carries `Mode: CERTIFYING`, plus the current decision basis files (this dispatch's dependencies: owner rulings, council synthesis, Gemini systemic audit, DeepSeek systemic response, H1 report + correction, open-disagreements prompt, v2 remediation plan, the four eval files, and the two new artifacts from 3.4/3.6).
2. Move everything else with `git mv` (tracked) or `Move-Item` (untracked, one operation per file) into `docs/reviews/archive/`, keeping basenames.
3. Write `docs/reviews/archive/INDEX.md` (append-only, UTF-8 no BOM, LF): one row `old path -> new path` per moved file.
4. Re-run `doctor` and `gate-check`; on any failure restore the moved file to its cited path and stop.
5. Never move or edit `2026-09-19-owner-rulings-course-correction.md`, the synthesis, the final-course-decision prompt, or the files named in the Q1/Q4 decisions.

### 3.3 Decision blocks (append-only)
Append PROTO-DEC-0036, 0037, 0038, 0039 to `.ai/DECISIONS.md` using the drafts in `docs/reviews/2026-09-19-eval-p2-decision-maker.md` section 4, with these corrections:
- All four: `Reopen-trigger: owner-directive` (the P4 `new-external-data` option is rejected as semantically wrong; the falsifier text stays in the block body).
- All four: `Approved by: RuslanFomenko (direct owner confirmation in chat, 2026-09-19, transcribed by gemini-<your-session-id>)`.
- 0036: include the corrected cohort numbers (+72.79% broad total, +9.10% broad fresh, +60.20% narrow total, +42.76% narrow fresh), state that the stop rule was executed, that PROTO-DEC-0034 remains in force, and that 25%/+5% stands for any future candidate.
- 0037: corpus policy with the active cap (recommended 60 files / 600 KB, owner-tunable), classify-first rule, INDEX requirement, keep-list from synthesis section 5 as a hard constraint, and the never-touch list.
- 0038: risk-scaled review; explicitly supersede **PROTO-DEC-0027 item 1 only**, leave the rest of 0027 in force; update AGENTS.md section 2 and, if it repeats the mandate, `QUICKSTART.md`, to the same scale.
- 0039: feature freeze (P0 + audit closure only) until the pilot report; v2.0 scope (single Node validator with differential verification per PROTO-DEC-0025 item 5, liveness leaf module to break the require cycle, `protocol-handoff.cjs` split into snapshot/evidence/gate, no new gates); pilot structure per §3.7 including the kill criterion: if the protocol arm does not beat the "one task file + one handoff note" control on the pre-agreed metrics, report it and move the v2.0 decision to reduction/retirement.
- After the blocks: append four registry rows to `docs/decisions/REGISTRY.md` (append-only, never edit existing rows), matching ids, `accepted`, and the exact trigger.

### 3.4 Grand-consensus reissue
Create `docs/reviews/2026-09-19-grand-consensus-systemic-course-correction-v2.md` with `Supersedes: docs/reviews/2026-09-19-grand-consensus-systemic-course-correction.md` in the header, the cp1251 mojibake fixed, the unverified `Approved by` line and any `Status: Accepted` removed, `Mode: ADVISORY`, and a one-line note that the original is preserved immutable and superseded. Do not edit the original. Archive it per §3.2 only after the reissue exists.

### 3.5 `.ai/TASK.md` replacement (<= 80 lines)
Use `docs/reviews/2026-09-19-eval-p2-decision-maker.md` section 5 as the base, adapted: `Status: In progress` (NOT Completed, no completion gate), Objective = execute the owner-approved recovery package (PROTO-DEC-0036..0039), Current state = Track C closed, C1a/F-001..F-004 recorded as completed, corpus archived, freeze active; `## Roles` stays `gemini: implementer`, `deepseek: reviewer, auditor, controller`; Next = DeepSeek adversarial audit of this implementation, then the two product pilots; Open questions = Codex receipt re-record, pilot objectives/metrics per repo.

### 3.6 `.ai/PLAN.md` rewrite (<= 200 lines, target ~120)
Follow `docs/reviews/2026-09-19-eval-p2-decision-maker.md` section 6 with the both-repos delta: two parallel pilot streams (`D:\Block-Puzzle`, `D:\VPN`), each with its own owner-named objective, pre-agreed metrics from `PLAN.md:63-68`, and the control arm; the 10-20 task budget split across them; triage-first rule for each repository (43 and 34 dirty files respectively; finish-or-revert and commit before the first pilot task); the freeze and the kill criterion from 0039. Keep the `## Objective` and the five metrics verbatim.

### 3.7 Freeze and pilot structure (recorded in 0039 and PLAN.md)
1. Protocol feature work frozen except P0 defects (data loss, security, false green, broken install) and audit closure.
2. Triage each consumer repository first: read the parked diff, finish-or-revert, run the product's own tests, one commit; no new task over a dirty tree.
3. Two disjoint sessions, one per repository; no shared agent or task; `DEC-0020` duplicate-assignment failure is the named risk.
4. One owner-named objective and metrics per repository before its first task; no protocol changes during the pilot except P0.
5. Protocol sessions never commit inside the consumer repositories (PROTO-DEC-0025 item 4); consumers are upgraded from v1.9.4 inside their own sessions.

### 3.8 Verification and record pass (last)
1. Run `validate-protocol.ps1` (expect 0 warnings), `test-protocol.ps1` (expect all tests pass), `doctor`, `gate-check`.
2. Write the implementation report `docs/reviews/2026-09-19-gemini-course-correction-implementation-report.md` (what changed, exact commands and results, corpus counts before/after, the moved-file list summary, open items) before the record.
3. Write the mandatory adversarial audit prompt `docs/reviews/2026-09-19-course-correction-adversarial-audit-prompt.md` covering every item of this dispatch (PROTO-DEC-0038 class: protocol core).
4. Journal entry with all five labels per AGENTS.md section 5, referencing the report and the audit prompt.
5. Record evidence once on the final tree: `node .ai/bin/protocol-handoff.cjs record --owner <your-session-id>`; then `verify`. Keep the journal entry short so auto-archive does not move text.
6. Release the lock. Do not commit or push (no owner instruction to commit); leave the tree for DeepSeek's audit and the owner's review.

## 3. Hard constraints

- Append-only: never edit an existing decision block or registry row, not even a status line.
- UTF-8 no BOM, LF, everywhere; `.ps1` files stay ASCII-only if touched at all.
- No new gates, metrics, monitors or enforcement layers; no protocol work beyond this dispatch.
- Do not install or pull models; do not run the local 8B/9B models.
- Do not modify the consumer repositories from this session.
- Shared-document lock only for the shared documents; release it when done.
- If a step fails a check, stop and report; do not improvise around the protocol.

## 4. Stop point

After the record pass and lock release: stop and hand off to DeepSeek for the independent adversarial audit. The pilot sessions start only after that audit returns PASS or RECOMMENDATION and the owner confirms the audit outcome.

---

**Expected new files**: the reissue (§3.4), the implementation report (§3.8.2), the adversarial prompt (§3.8.3), and `docs/reviews/archive/INDEX.md` (§3.2.3). Nothing else outside the edited shared documents and the archive directory.
