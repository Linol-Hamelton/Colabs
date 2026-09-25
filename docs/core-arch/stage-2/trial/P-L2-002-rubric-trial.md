# Trial S2-T07 — the P-L2-002 rubric scored on ten past tasks

Work product of CORE-ARCH stage 2, not a kernel record. Produced by `claude-eb97ac9d13050014` on
2026-09-25 against P-L2-002 0.3 (rubric of step 2, mapping and floors of step 3, PROTO-DEC-0059).
Scores are the author's judgement from the recorded data named in each row. Size counts files
changed outside `.ai/worklog/` and `docs/reviews/` (`git show --name-status`). A reviewer may
re-score any row; a different score with a reason is a finding against the rubric, not against
the row.

## Scores

Factors: Sz size, Pr protected paths, No novelty, Rv reversibility, Am ambiguity, Cp coupling.

| # | Task (source) | Sz | Pr | No | Rv | Am | Cp | Sum | Rubric | Floor | Tier |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Stop-path circular dependency fix (`b587dc1`: hooks, session, one test) | 0 | 2 | 1 | 0 | 1 | 0 | 4 | T4 | kernel T7 | T7 |
| 2 | Fail-safe Stop telemetry (`d38d2f2`: 6 files, hooks and PROTOCOL.md) | 1 | 2 | 1 | 0 | 1 | 1 | 6 | T5 | kernel T7 | T7 |
| 3 | H1 pilot trial prompt template (`001af50`: one prompt file) | 0 | 0 | 1 | 0 | 0 | 0 | 1 | T2 | — | T2 |
| 4 | H1 telemetry instrumentation (`5b34ae0`: 7 files, code, tests, a decision) | 1 | 2 | 2 | 0 | 1 | 1 | 7 | T6 | kernel T7 | T7 |
| 5 | Executable rulebook spec, PROTO-DEC-0045 (`82bf99a`: 12 files, spec, code, decisions) | 1 | 2 | 2 | 1 | 2 | 2 | 10 | T8 | kernel T7 | T8 |
| 6 | Caps raise, PROTO-DEC-0057 item 5 (this program: validator, test, AGENTS, PAIRED-CYCLE, template) | 1 | 2 | 0 | 0 | 0 | 1 | 4 | T4 | kernel T7 | T7 |
| 7 | Model discovery and ranking run (`stage-4/MODEL-MATRIX.md`, P-L3-002/003) | 0 | 1 | 2 | 0 | 2 | 1 | 6 | T5 | ? (В-24) | T5 or T7 |
| 8 | Stage-1 adversarial review (`docs/reviews/2026-09-24-deepseek-core-arch-stage1-control.md`) | 1 | 1 | 1 | 0 | 1 | 1 | 5 | T4 | ? (В-24) | T4 or T7 |
| 9 | Round-3 certification of `4ded1be` (`docs/reviews/2026-09-23-codex-batch-certification-round3.md`) | 2 | 2 | 1 | 0 | 1 | 2 | 8 | T6 | certification T7 | T7 |
| 10 | Verbatim persistence of the external synthesis (`docs/research/2026-09-24-remediation-mapping/external-synthesis.md`) | 0 | 0 | 0 | 0 | 0 | 0 | 0 | T1 | — | T1 |

Row 5, Rv 1: a decision block reverts only by a superseding block (append-only log). Row 8, Sz 1:
the report cites eleven distinct files it read; see signal S-4 on what Size means for a review.

## Spread

- Rubric alone: T1 1, T2 1, T4 3, T5 2, T6 2, T8 1. Six of nine tiers used; sums 0 to 10.
- After floors: T1 1, T2 1, T4 or T7 1, T5 or T7 1, T7 5, T8 1. The floor decides the tier in five of ten rows
  (1, 2, 4, 6, 9) and possibly two more (7, 8).
- Largest lift: rows 1 and 6, a scored T4 raised to T7.

## Signals for the owner and the reviewer (not decisions)

- **S-1.** In this repository the protected-path floor (≥ T4) never binds by itself: every
  protected path here (`.ai/`, validator, gates, hooks) is also a kernel path, so the T7 floor
  applies first. The T4 floor matters only for host projects (security and data paths).
- **S-2.** The kernel floor lifts a mechanical kernel edit three tiers: row 6 changed numbers set by
  the owner and scores 4. This follows the owner's rule; the cost is recorded as a signal only.
- **S-3 (owner question В-24).** P-L2-002 does not say whether drafting or reviewing a kernel record that
  has not landed is a "kernel change". Rows 7 and 8 are T5 and T4 without the floor and T7 with it. For a
  DeepSeek reviewer the answer changes nothing (one model on every tier, PROTO-DEC-0065 item 1);
  for any other maker it changes the model.
- **S-4.** Size is defined by files changed. For a review or certification, where nothing changes
  but a report, the author scored the files read. The rubric should say which.
- **S-5.** Reversibility is 0 in nine of ten rows: in a git repository nearly everything reverts.
  The factor discriminates only for decision blocks and work outside the repository.

## Acceptance of S2-T07

"The rubric run on ten past tasks; the spread of tiers recorded" (CORE-ARCH-3 section 9): done
above. The rubric's dispute metric M-007 has no data yet: no executor or reviewer has disputed a
computed tier.
