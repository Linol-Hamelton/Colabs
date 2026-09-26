# Closure disposition dry-run manifest - 2026-09-26 (P-L0-008 R-L0-22.56-22.71)

Owner directive PROTO-DEC-0085 section 4. Method: Appendix C of the closure directive.
This is a dry run: nothing has moved. Apply only what the owner confirms, one commit per frame.
Grouping note: rows are one frame artifact set; files that need their own disposition or that carry
a known dependency get their own row. Groups with more than one file list the count.

**Active corpus before:** 4,463,598 bytes (4.26 MB) - command:
`node .ai/runtime/closure-scan.cjs` (tracked files under `docs/research/`, `docs/reviews/`,
`OwnerIdeas/`, `docs/core-arch/`, `docs/ops/`, `.ai/docs/`, plus `.ai/TASK.md`, `.ai/PLAN.md`,
`AGENTS.md`; working-tree sizes).

## Manifest

| Frame | Artifact | Referenced by (active) | Proposed | Destination | Canonical replacement / target | Reason | Confidence |
|---|---|---|---|---|---|---|---|
| F-06 | `docs/research/2026-09-25-validator-migration-council/` (61 files, 769 KB), minus `final-plan-2.md` | `L-CORRECTION-4.md` (3x), `L-CORRECTION-4-AUDIT.md` (2x), `.ai/TASK.md` (1x), `BACKLOG.md` (1x), `MODEL-ECONOMICS.md` (1x), `FRAMES.md` (1x); immutable records listed for information only | ARCHIVE + REPAIR | `docs/research/archive/2026-09-25-validator-migration-council/` | PROTO-DEC-0077 | frame CLOSED; the active references are repointed to the archive path as provenance pointers in the same commit | MEDIUM |
| F-06 | `final-plan-2.md` | design input of A-4 (RESOLUTION section 6; FRAMES F-06 note) | TRANSFER | stays in place until A-4 opens | target A-4 (open task) | named design input of an accepted plan item | HIGH |
| F-07 | `docs/research/2026-09-20-cycle-architecture/` (1 file, 53 KB) | `.ai/PLAN.md` (1x); `evidence.json` (F-08), r0 csv (F-12), B-research (F-04 SUSPENDED), FRAMES (registry) | ARCHIVE + REPAIR | `docs/research/archive/2026-09-20-cycle-architecture/` | PROTO-DEC-0041 | frame CLOSED; one active reference in PLAN.md repointed | LOW - editing PLAN.md at its line cap during a closure; owner decides |
| F-09 | `docs/research/2026-09-22-jev-decision-fabric-evaluation.md` (1 file, 98 KB) | `Q06` (inside F-13, archived in the same pass); FRAMES (registry) | ARCHIVE | `docs/research/archive/2026-09-22-jev-decision-fabric-evaluation.md` | PROTO-DEC-0045 item 3 | frame CLOSED (REJECT of adoption); remaining references are inside sets archived in this pass | MEDIUM |
| F-10 | `docs/research/2026-09-22-kilo-candidate-tool-evaluation.md` (1 file, 22 KB) | F-09 file (archived same pass); FRAMES | ARCHIVE | `docs/research/archive/2026-09-22-kilo-candidate-tool-evaluation.md` | PROTO-DEC-0045 item 1 | frame CLOSED (REJECT of adoption) | MEDIUM |
| F-11 | `docs/research/2026-09-23-kernel-architecture/` (2 files, 30 KB) | `P-L0-001` (6x), `P-L0-002` (8x), `P-L0-003` (4x), `procedure.schema.md` (4x), `ROLE-researcher`/`ROLE-reviewer` (4x each), `CORE-ARCH-1` (2x), `PROCEDURE-MAP` (4x), TASK (2x) | KEEP_ACTIVE | - | - | cited as evidence by active stage-1 procedures and roles; archive under F-03's closure instead | MEDIUM |
| F-13 | `docs/research/2026-09-23-routing/` (12 files, 188 KB) | `FRAMES.md` (D-02, 5x), `BRIEF.md` (F-11 kept, 3x), `CORE-ARCH-6.md` (2x), `PROCEDURE-MAP` (2x), `OwnerIdeas/RISK_COUNCIL.md` (1x), B-research (F-04 SUSPENDED, 1x) | ARCHIVE + REPAIR | `docs/research/archive/2026-09-23-routing/` | PROTO-DEC-0047 (the accepted part); D-02 repointed to the archive path | frame CLOSED; the DEFER row is repointed (explicitly allowed: DEFER items are out of agent context); CORE-ARCH-6 and RISK_COUNCIL references repointed | MEDIUM |
| F-14 | `PROCEDURE-MAP.md` (1 of 22 files, 288 KB total) | `PROTO-DEC-0053` names it as F-03's input map (then `P-L0-001` 6x, `P-L0-003` 6x, `CORE-ARCH-1` 6x, other stage-1 docs) | KEEP_ACTIVE | - | PROTO-DEC-0053 | named input of the ACTIVE CORE-ARCH program (F-03) | HIGH |
| F-14 | rest of `docs/research/2026-09-24-remediation-mapping/` (21 files, ~272 KB) | heavily cited by active stage-1 docs (see scan) | LOW - owner decides | `docs/research/archive/2026-09-24-remediation-mapping/` (suggested) | decisions 0048-0054 | citations are dense and partly in ACTIVE procedures; a REPAIR pass would touch many kernel docs | LOW |
| F-15 | `docs/research/2026-09-25-workflowai-review/` (14 files, 52 KB) | `docs/core-arch/stage-4/workflowAI.md` (1x), FRAMES (registry) | ARCHIVE + REPAIR | `docs/research/archive/2026-09-25-workflowai-review/` | PROTO-DEC-0078 | frame CLOSED; the one active reference is repointed | MEDIUM |
| F-16 | `docs/reviews/2026-09-20-codex-cycle-history-research.md`, `-cycle-improvement-plan.md`, `-cycle-final-council-prompt.md` | `.ai/PLAN.md` (3x), `Q14` (2x), TASK (1x), B-research (1x), FRAMES (registry) | KEEP_ACTIVE | - | D-01 canonical source | review files are not moved by a closure (R-L0-22.63; PROTO-DEC-0037 governs `docs/reviews`) | HIGH |
| F-08 | `docs/research/2026-09-20-cycle-history/` (2 files, 105 KB) | F-16 files (kept), PLAN (1x), Q02, B-research, FRAMES | owner decides (suggested ARCHIVE) | `docs/research/archive/2026-09-20-cycle-history/` | input of PROTO-DEC-0041 / F-07 | not a frame (measurement); owner named it "owner decides" | LOW |
| F-12 | `docs/research/2026-09-23-r0-decision-dataset/` (5 files, 45 KB) | Q02/Q06/Q14 (inside F-13, archived same pass), INDEX-draft (archived), FRAMES | owner decides (suggested ARCHIVE) | `docs/research/archive/2026-09-23-r0-decision-dataset/` | measurement dataset | not a frame (measurement; README:13-17); owner named it "owner decides" | LOW |

## Summary

- Artifacts examined: 11 sets, ~123 files, ~1.64 MB.
- Totals per disposition: KEEP_ACTIVE 6 files (F-11 2, F-14 PROCEDURE-MAP 1, F-16 3); TRANSFER 1
  file (`final-plan-2.md` to A-4); ARCHIVE 90 files as proposed (F-06 61, F-07 1, F-09 1, F-10 1,
  F-13 12, F-15 14); AMBIGUOUS/owner-decides 28 files (F-14 rest 21, F-08 2, F-12 5).
- Unexpected git-delta files: not computed in this pass; the sets were built from frame paths and
  declared artifacts (R-L0-22.57); the git-delta cross-check is deferred to the apply pass and
  listed as a check there.
- Open dependencies detected: F-06 -> A-4 (`final-plan-2.md`, TRANSFER); F-14 -> F-03
  (`PROCEDURE-MAP.md`, KEEP_ACTIVE); F-13 -> D-02 repoint; F-11 and F-14 rest -> dense core-arch
  citations (KEEP or owner decision).
- Broken references in the active corpus: 0 before; 0 expected after the REPAIRs in the same
  commits.
- FRAME_STATUS_CONFLICT: none found.
- Expected active-corpus bytes after (if all MEDIUM/HIGH proposals apply): ~3,289,000 (-26%);
  with F-08, F-12 and F-14 rest archived: ~3,139,000 (-30%).
- LOW-confidence rows for the owner: F-07 (PLAN.md repair), F-14 rest, F-08, F-12.

## Owner decisions requested (STOP-2)

1. Confirm the MEDIUM/HIGH rows as proposed (F-06, F-09, F-10, F-13, F-15 archived with the named
   REPAIRs; F-06 `final-plan-2.md` TRANSFER(A-4); F-11, F-14 `PROCEDURE-MAP.md`, F-16 KEEP_ACTIVE).
2. Decide the four LOW rows: F-07 (archive + repoint PLAN.md?), F-14 rest, F-08, F-12.
