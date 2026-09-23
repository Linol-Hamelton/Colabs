# Q08 - Cost saving without quality loss

Question: Cost saving without loss of quality; tracking remaining limits to protect scarce participants.
Primary: copilot
Challenger: gemini
Date: 2026-09-23
Commit SHA: b232a9e5e99b51fccf8a1ce2ccfa009c3a204bed
Working-tree state: dirty (pre-existing staged and unstaged changes).
Inventory commands actually run: `git ls-files` in `D:\Colabs`; `git status --short --branch`; `git log --oneline -10`. Attempts for the three secondary repositories were denied before execution; no direct secondary inventory is claimed.

## 1. Decomposition

Minimize expected time to independently accepted completion subject to quality, authorization, independence, and hard money limits. Separate marginal money, subscription/credit units, tokens, wall time, human time, quota, and scarce-role capacity. Reserve mandatory review, one recovery, and handoff before routine work.

## 2. Essential factors

Cost saving is invalid if it increases escaped defects, review omissions, duplicated effects, owner intervention, or exhaustion of a certifier. Track remaining range, unit, source, reset uncertainty, burn rate, concurrency, reservations, queued essential work, and fallback eligibility. Unknown is not zero.

## 3. Blind spots (at least three ways a confident answer here could be wrong)

1. Subscription cost can hide scarce capacity and queue delay.
2. Parallel sessions can lower elapsed time while increasing total consumption.
3. A cheap first pass can create expensive rework or an unavailable reviewer.
4. Provider quotas may correlate, so nominally separate reserves can fail together.
5. Quality loss may surface after the measured window as escaped defects.

## 4. Evidence - from the four repositories; every factual claim with path:line; label each claim FACT / MEASURED / CLAIM / HYPOTHESIS

- **FACT**: routing architecture makes eligibility, quota reserve and a hard money ceiling prerequisites, then minimizes expected time to accepted completion (`docs/reviews/2026-09-23-codex-routing-architecture.md:67-70`).
- **FACT**: it requires quality constraints before elapsed time and cost, and says time includes retries, review and human waiting (`docs/reviews/2026-09-23-codex-routing-architecture.md:41-45`).
- **FACT**: it distinguishes dollars, tokens, subscription windows and AI credits; unknown is not zero (`docs/reviews/2026-09-23-codex-routing-architecture.md:136-141`).
- **FACT**: it recommends reserving mandatory review, one recovery, and handoff before routine work (`docs/reviews/2026-09-23-codex-routing-architecture.md:139-141`).
- **FACT**: PROTO-DEC-0041 requires two independent parallel reviewers for high-risk candidates, so that capacity is not optional cost (`.ai/DECISIONS.md:1792-1793`).
- **FACT**: PROTO-DEC-0038 scales docs/config/one-line work to one independent statement but keeps full pairs for protocol core (`.ai/DECISIONS.md:1660-1678`).
- **MEASURED**: the R0 dataset includes only five explicit round outcomes and says it is not a complete census or complete round count (`docs/research/2026-09-23-r0-decision-dataset/README.md:5`, `:15`).
- **FACT**: existing telemetry records changed files, duration, first edit, handoff status, and git head, but it is runtime telemetry rather than a complete cost ledger (`.ai/DECISIONS.md:1570-1583`).
- **FACT**: the binding external-tool policy forbids external output from gates and requires degradation to normal file operations (`.ai/DECISIONS.md:1552-1556`).
- **FACT**: the owner’s three repositories have different protocol versions according to the recorded decision, which is a fleet confound for uniform cost comparisons (`.ai/DECISIONS.md:1868`).

## 5. What history can and cannot support

History can support observed elapsed time, changed-file counts, explicit review rounds, known findings, and whether a reserve was consumed when those fields exist. The denominator is missing for cost per accepted quality unit: task volume, exact model/effort, token/currency usage, queue delay, human time, and censored failures are incomplete. A share of FAIL verdicts is not a competence score and cannot justify cost cutting.

## 6. Interaction with binding rules

PROTO-DEC-0041 item 1 forbids buying cheap but non-independent certification (`.ai/DECISIONS.md:1792`). Reproduction, not voting or majority, decides defects (`.ai/DECISIONS.md:1795-1796`). PROTO-DEC-0034 makes external tools advisory-only and requires normal-operation fallback (`.ai/DECISIONS.md:1552-1556`). Cost policy may optimize within these floors, never below them.

## 7. Interaction with the other 12 questions

Q01 supplies work units; Q02/Q03 choose qualified routes; Q04 limits remediation; Q05 prices review depth; Q06 may provide offline forecasts; Q07 supplies orchestration/recovery; Q09 forecasts exhaustion; Q10 sets quality/time ordering; Q11 provides deputies; Q12 defines cost and event telemetry; Q13 controls history retention. Q08 aggregates these into reservations and stop rules.

## 8. Options - at most three real ones, including doing less, each with cost, time and risk

1. **Do less: manual accounting.** Cost/time low. Risk: hidden exhaustion, unplanned rework, and no comparable baseline.
2. **Shadow ledger and reservation policy.** Cost: deterministic schema and reporting. Time: one measurement window. Risk: instrumentation overhead and incomplete provider data.
3. **Active cost-aware routing.** Cost: orchestration plus reserve enforcement. Time: after shadow validation. Risk: false savings, starvation, and quality regression if data is sparse.

## 9. Recommendation, and the forks only the owner can decide

Recommend option 2: shadow ledger first, with quality gates and mandatory-review reserves treated as non-discountable. Optimize total accepted-completion time only after measured cost and quality denominators exist. The owner alone decides hard ceilings, reserve percentages, acceptable quality regression, and whether scarce participants may be scheduled ahead of routine work.

## 10. Missing data - what would have to be measured to decide better

Per task/run: exact model/harness/effort, input/output tokens, currency or credits, queue/generation/test/review/human durations, retries and switches, quota source and reset, reservation/consumption, independent review requirement, findings, acceptance, escapes, and owner intervention. Capture remaining capacity snapshots and distinguish unknown from zero; repeat in all four repositories after direct inventory.

## 11. Challenge - leave it as "Challenger: pending" with an empty slot; the challenger fills it later and never averages disagreement away

Challenger: pending

  
