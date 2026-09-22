# Final Cycle-Architecture Strategy (Proposed for One Council Round)

Reviewer: DeepSeek (deepseek-59c81998639a4feb), controller and independent reviewer
Date: 2026-09-20 (UTC)
Reviewed commit: d38d2f2ae4b4c17fe6c2c18f11215cedb2f10eb1; working tree dirty, snapshot moves
Mode: ADVISORY — analysis and proposal; not a certification
Status: Proposed — requires one adversarial council round and the owner's explicit approval
Verdict: RECOMMENDATION
Scope: working-cycle architecture (phases, rounds, participants, blocks, evidence, authorization); does not authorize Wave C closure, kernel changes, or product work
Sources: `2026-09-20-claude-cycle-architecture-statistical-audit.md` (Claude), `2026-09-20-gemini-cycle-architecture-adversarial-review.md` (Gemini), `2026-09-20-codex-cycle-history-research.md` and `2026-09-20-codex-cycle-improvement-plan.md` (Codex), `2026-09-20-cycle-architecture-council-prompt.md` (owner), plus the owner's 12-stage list in chat.

## 0. What this document decides

1. It fixes the permanent phase sequence and the exit gate of every phase.
2. It replaces numeric folklore ("three reviewers", "two rounds everywhere", "1-2 items per block") with risk-scaled composition, trigger-based repetition and contract-based blocks.
3. It adds the two rules the owner demanded: **authorization of access** and **legitimization of changes**, plus hard anti-idle-loop guards.
4. It keeps every existing binding decision untouched: PROTO-DEC-0038 (risk-scaled review), 0039 (freeze), 0040 (remediation), the append-only ledgers, the frozen product metrics, one-writer/lock discipline.

## 1. Method and my independent verification

I did not accept any of the three analyses at face value. I re-derived the decisive numbers from the tree.

Census command (reproducible; run from the repository root):

```powershell
$files = Get-ChildItem docs/reviews -Recurse -File -Filter *.md | Where-Object { $_.Name -ne 'INDEX.md' }
$files.Count  # 176 today (active + archive)
# first Verdict line per file, exact-token counting, Reviewer/Mode presence
```

Observed today (this is a snapshot; the corpus grows during the discussion):
- 176 Markdown review artifacts (active + archive, INDEX excluded);
- 114 files carry a `Verdict:` line, 107 a `Reviewer:`, 63 a `Mode:`;
- bare exact tokens: RECOMMENDATION 23, FAIL 15, PASS 10, BLOCKED 3; the rest are
  `PASS - <explanation>` / `RECOMMENDATION - <explanation>` forms, historical
  conditional forms, or template placeholders.

Differences from Claude's 167/103/126/55 and Codex's 170/108/103/62 are explained by
tree drift and parsing rules. That is itself the finding: **corpus censuses are not
stable evidence unless the input manifest and parser are published**. No model ranking
may be built on them.

### 1.1 Arithmetic recheck (my own computation)

Cohorts from Claude's table as (n, m) where m = non-blocking verdicts:
(8,4), (5,1), (3,2), (3,2), (5,4), (3,1).

- k=1: mean of m/n = 52.78% — matches Claude.
- k=2: mean of C(m,2)/C(n,2) = 24.68% — matches Claude.
- k=3 over all six cohorts: 7.86% — matches Claude, **but three cohorts have n=3 and
  m=2, where C(2,3)=0 by definition**: the value is an artifact of exhausted samples,
  not a property of trios.
- k=3 and k=4 over the same three cohorts with n>=4: **15.71% and 7.14%** — a gap of
  8.57 percentage points, not 0.8. Codex's correction is arithmetically correct; I
  reproduced both values.

### 1.2 The deeper defect in the "48%" claim

13/27 = 48.15% is the share of **blocking verdicts** among sampled reviews. It is not
the probability that a reviewer detects an existing defect. Counterexample: the
DeepSeek paired-cycle review carries `Verdict: RECOMMENDATION` while listing the same
host-edit, governance and completion gaps that Codex used for FAIL. Verdicts measure
the reviewer's judgement of obligation, not detection. Therefore:

- "one reviewer detects a blocking defect in 48% of cases" (Claude) — **unsupported**;
- "three reviewers give ~92% guarantee, the curve's knee is at three" — **unsupported**;
- what survives is qualitative and strong: **independent review by a non-author finds
  real defects that the author's own pass missed**, and the samples show single-reviewer
  coverage is unreliable.

### 1.3 Cycle outcomes and block sizes

- Second rounds appear in 12 cycles and changed the normalized verdict in 8 (Codex's
  stricter count) to 9 (Claude's broader count). Selection bias is real: only contested
  cycles got a second round, and there is no denominator of single-pass successes. The
  honest statement: **a second pass frequently matters when the first pass returns
  non-PASS or unresolved findings; it is not proven to be needed when the first pass is
  clean and fully evidenced.**
- Wave B contained exactly two items (R5, R8) and its central R5 claim — "identical
  PS/Node semantics" — was overturned by the C40 re-audit. Therefore "1-2 items per
  gate" does not guarantee quality; **contract coupling, not item count, is what makes a
  block safe**.
- A2 was corrected by the same reviewer's addendum (self-correction), not by an external
  detector (Codex's correction to Claude). The two overturned PASSes share a weaker but
  still decisive property: **the certifier belonged to the same execution/control
  arrangement that produced the artifact**. The rule below is a defensive policy derived
  from that pattern, not a statistically measured optimum.

### 1.4 Verdict vocabulary

For **new, gate-cited reviews**, the verdict must be exactly `PASS`, `RECOMMENDATION`,
`FAIL` or `BLOCKED`. Conditional outcomes are expressed as `FAIL` with an explicit list
of conditions; explanations go in the body, never in the token. Historical reviews are
not rewritten. The existing validator's strict comparison already enforces this for the
cited artifact; the process must stop inventing synonyms in new documents.

### 1.5 What was rejected

- Fixed "three reviewers in every round" — no statistical support; cost scales, benefit
  plateaus early (Porter's controlled inspection experiment found no advantage of four
  over two, with coordination overhead).
- Mandatory two rounds on every phase — contradicted by the absence of a denominator;
  scheduling repeats regardless of findings is bureaucratic motion.
- "1-2 items per block" as a quality guarantee — falsified by Wave B.
- Model ranking by FAIL share or by brand (Copilot 80%, Codex 60%, Gemini 13% ...) —
  tasks, phases, rights and criteria differ per participant; `gemini-opus` even shows a
  role named "Gemini" operated by Claude Opus. Ranking by verdict is methodological
  noise.
- Claude's external figures ("+14%", "60-80%", "48% = informal inspection") — not
  linked to primary sources in that report; Codex's cited sources (Porter; Sadowski et
  al. ICSE-SEIP 2018; Bacchelli & Bird ICSE 2013; Kaesberg et al. ACL Findings 2025;
  Choi et al. NeurIPS 2025) support caution about extra debate layers, not a numeric
  norm.

## 2. The fixed cycle: seven phases, one primary pass, repeats on trigger

Phases are logical conditions, not a file per step. Every phase has an output and a
measurable exit gate. "Round" means: a fixed input package, one independent assessment
per participant, one merged disposition. Repetition is never scheduled; it is triggered.

| # | Phase | Output | Exit gate | Primary passes | Trigger for repeat |
|---|---|---|---|---|---|
| 0 | Frame | Problem statement, scope, risk class, success criteria, immutable baseline (40-hex), existing guarantees, owner + executor | Task unambiguous; baseline frozen; forbidden paths listed | 1 | Scope/contract change |
| 1 | Diagnosis and research | Reproduced problem; fact/hypothesis/gap map; external sources where 1a triggers | Key premises checked against the tree; unknowns explicit | 1 | New evidence contradicts a premise |
| 1a | External research (conditional) | Architecture brief with sources, dates, applicability limits | Trigger recorded (new external API/library/crypto/protocol; disputed practice; no reliable local answer) | 0 or 1 | Trigger discovered later |
| 2 | Solution | One recommendation, at most two real alternatives including "do nothing"; costs and constraints | Facts verified; tradeoff list ready for the owner | 1 discussion | Owner asks for another option; fact conflict unresolved |
| 3 | Plan and plan-review | Ordered blocks with per-block contract, tests, rollback; predicted PASS/FAIL; integration checklist | Independent reviewer found no unresolved mandatory contradiction | 1 independent pass | Plan-level blocker found |
| 4 | Implementation "done-checked" | Per block: code/docs + tests + reviewer confirmation; then integration pass | Block evidence closed; integration checks pass | 1 per block + 1 integration | Block test failure; reviewer finding |
| 5 | Final adversarial audit | Findings ledger against the full candidate; scope/binding/freshness check | No unresolved mandatory defect; certifier outside execution and control | 1 | FAIL/BLOCKED; candidate changed |
| 6 | Closure and next backlog | Long-term docs agreed (TASK/registry where required), limits recorded, next questions queued | Owner informed; no new work started without assignment | 1 | New facts reopen the decision |

Rules that apply to every phase:
- One primary pass. A repeat requires a trigger: a confirmed defect, a changed
  candidate/scope, new external information, or an incomplete closure proof.
- After any fix, re-run the original reproduction, the neighbouring negatives and the
  affected regression — not a fresh broad debate.
- Escalation budget: after two failed attempts to fix the same root cause, stop and take
  the area/premise back to the owner instead of opening another general council.
- An unresolved mandatory defect stays FAIL/BLOCKED; a round limit never converts it
  into RECOMMENDATION.
- Discussion without a new fact or counterexample is not scheduled.

## 3. Participants and independence (risk-scaled)

| Risk class | Minimum | Additional check |
|---|---|---|
| Low: docs/config, no core/security/data | Executor + one independent reviewer | Extra participant only on a named uncertainty |
| Standard product code | Executor + independent reviewer per block; independent integration pass | Domain specialist when an uncovered boundary exists |
| Core/security/data, invariants, upgrade/migration | Executor; block reviewers; final certifier outside the execution and control of that change | One more reviewer only on uncovered risk, conflicting reproductions, or owner directive |

Invariants:
1. **Certification independence.** The certifier must not be the author, the executor,
   the controller of that candidate, or a member of the executing pair. This applies to
   every `CERTIFYING` verdict on a high-risk candidate. It follows from the two
   overturned PASSes, both issued inside the pair that produced the artifact.
2. **Controller ≠ certifier.** The coordinator may shape tasks and dispatch waves; it
   may review other independent work; it may not certify what it controlled.
3. **Primary reviewers** of one round receive the same input package and do not read each
   other's new answers before fixing their own.
4. **No brand-based trust or exclusion.** Roles in TASK name a slot, not a guaranteed
   model; capability for CERTIFYING is determined by the environment (repository access,
   execution, evidence signing), never self-declared by the report's header.
5. **Escalation to a fifth voice** only on: unresolved 2-2 conflict with reproductions
   on both sides; missing capability in all available reviewers; explicit owner
   directive. "Another opinion" alone is not a reason.

## 4. Blocks: contract and blast radius, not item count

A block is the smallest coherent change of one verifiable contract with clear
dependencies and a rollback boundary. Every block records: ID, requirement/invariant,
input baseline, touched paths, dependencies, positive test, negative test, reviewer,
closure condition. Guidelines:
- Do not split a contract shared by two engines (e.g., PS/Node parity) into halves that
  are "accepted" independently; verify compatibility with one matrix of the same inputs.
- Do split a block when its parts can be verified and rolled back independently or carry
  different risk.
- Do not create artificial commits/tags per block; use receipt and preserved state as the
  candidate identifier unless the owner says otherwise.
- The final integration checklist covers interactions no single block covers.

## 5. Findings, refutations, dispositions

One ledger per review package: `ID | requirement | candidate | reproduction | observed
result | severity | disposition | closure proof`. Disposition values are analysis
fields, not verdicts: `confirmed / refuted / fixed-and-verified / deferred-by-owner /
unresolved`.
- A refutation must be verified on the same relevant state; a later fix does not refute
  the historical finding.
- **Symmetry rule:** a finding and its refutation carry the same evidence burden. A
  synthesis that dismisses findings is checked exactly like the findings themselves
  (history shows two false refutations: `__dirty` and evidence metadata).
- Duplicates merge by cause with author references preserved. A reviewer's contribution
  is measured by unique confirmed findings, not by volume.
- Contradictory reproductions are resolved by comparing snapshot, environment and
  command, then by a compatible repeat. Majority does not override a reproduction.

## 6. Authorization of access and legitimization of changes (new rule)

Purpose: no agent touches anything it was not explicitly authorized to touch, and every
change is legitimate by construction — this is what stops idle token-burning loops.

**6.1 Tiers**
- **T0 READ** — default for reviewers and analysts; no writes at all.
- **T1 SCOPED WRITE** — implementer; only the paths declared in the block's scope.
- **T2 SHARED DOCUMENTS** — TASK/PLAN/DECISIONS/REGISTRY/ARCHIVE: only the session that
  holds the shared lock.
- **T3 PRODUCT REPOSITORIES** — only product sessions inside that repository; protocol
  sessions never commit or edit there.
- **T4 INSTALL/CONFIG** — installer and environment tests only in disposable TEMP
  fixtures, never in a live project.

**6.2 Block authorization record (BARC)** — before a block starts:
`BlockID | requester | approver (owner or controller per tier) | scope paths | purpose |
baseline SHA | budget (tokens/time) | expiry (single use)`.

**6.3 Legitimization check** — a change is legitimate only if all hold:
1. actual diff is a subset of the authorized scope (git-level path check);
2. no forbidden path (AGENTS.md, QUICKSTART.md, kernel, hooks, gates, manifest, tests,
   decisions/registry) unless the block explicitly targets it under T4/high-risk;
3. author ≠ reviewer of the change;
4. a receipt binds the final tree, and the reviewer's journal cites its own artifact;
5. the ledger entry exists with diff stat and verdict.
Anything else is reverted or reported, not blessed retroactively.

**6.4 Anti-idle-loop guards (hard)**
1. One primary pass per phase; no re-entry without one of the four triggers in §2.
2. Repeat budget: max two remediation attempts per root cause, then stop and escalate.
3. One synthesis and one disposition table per round; no per-phase, per-item or
   "I agree" artifacts. Reserve corpus/journal capacity before creating artifacts.
4. New gate-cited artifacts use the closed verdict vocabulary; non-standard synonyms are
   rejected by the gate.
5. Declare a per-phase budget; on exceed — stop and report instead of silently
   continuing.
6. One writer per repository at a time; nobody writes another session's journal; nobody
   records a receipt for another owner.
7. Background agent processes run persistent so they survive window/session switches
   (learned today: several runs died at process-group switches and were mistaken for
   failures).
8. No new council for a report unless the owner asks or a reproduced blocker remains
   unresolved; optional improvements go to the backlog.
9. "N/A" gates and umbrella `In progress` states are honest states, never converted to
   "Completed" without the full path.

## 7. Relationship to existing decisions

- PROTO-DEC-0038 (risk-scaled review) remains the base; this strategy only refines
  composition and stops without weakening high-risk gates.
- PROTO-DEC-0039 freeze and PROTO-DEC-0040 remediation are unaffected; this document does
  not close Wave C, does not reopen Track C, and does not authorize product work.
- Frozen product metrics (`.ai/PLAN.md`) are unchanged; the strategy is evaluated on the
  already-approved 10-20-task pilot, not by new telemetry, gates or monitoring.
- Append-only ledgers, lock discipline and journal ownership are untouched.

## 8. Questions for the council round (adversarial)

1. Does §2 hide an unconditional "3 reviewers x 2 rounds" requirement anywhere? Show the
   exact line if yes.
2. Does the certification-independence invariant (§3) block useful reviewers or make
   small teams unworkable? Give a concrete case.
3. Is the BARC + legitimization check (§6) implementable with the **existing** validator
   and gate-check, without a new kernel gate? Where exactly would it fail?
4. Does the anti-idle-loop budget risk accepting a real defect? Name the scenario and the
   guard that should catch it.
5. Is the block definition (§4) sufficient to prevent a repeat of Wave B's overturned
   parity claim?
6. Are the four phase-repeat triggers exhaustive? Which real situation is missing?
7. Is the verdict vocabulary rule compatible with historical artifacts and with the
   current gate implementation?
8. What must be changed in this document **before** the owner approves it, versus what is
   optional backlog?

## 9. Owner decisions requested

- D-A: approve the seven-phase sequence and the trigger-based repeat rule (§2).
- D-B: approve the risk-scaled composition and the certification-independence invariant
  (§3).
- D-C: approve the BARC/legitimization and anti-idle-loop guards (§6), or narrow them.
- D-D: approve the verdict vocabulary for new gate-cited artifacts (§1.4).
- D-E: decide whether this strategy is recorded as a new decision block after the council
  round, or stays a PLAN-level policy until the pilot report.

## Appendix A — reproduction

```powershell
# census (see §1)
Get-ChildItem docs/reviews -Recurse -File -Filter *.md | Where-Object { $_.Name -ne 'INDEX.md' } | Measure-Object
# arithmetic recheck: cohorts (8,4),(5,1),(3,2),(3,2),(5,4),(3,1)
# k=3 all six: 7.86% ; k=3 same three (n>=4): 15.71% ; k=4 same three: 7.14%
```

## Appendix B — documents and evidence

- Claude statistical audit: `docs/reviews/2026-09-20-claude-cycle-architecture-statistical-audit.md`
- Gemini adversarial review: `docs/reviews/2026-09-20-gemini-cycle-architecture-adversarial-review.md`
- Codex research: `docs/reviews/2026-09-20-codex-cycle-history-research.md`; script and
  snapshot: `docs/research/2026-09-20-cycle-history/analyze.cjs`, `evidence.json`
- Codex plan P0-P11: `docs/reviews/2026-09-20-codex-cycle-improvement-plan.md`
- Codex council prompt: `docs/reviews/2026-09-20-codex-cycle-final-council-prompt.md`
- Primary external sources cited by Codex: Porter (UMD inspection experiment), Sadowski
  et al. ICSE-SEIP 2018, Bacchelli & Bird ICSE 2013, Kaesberg et al. ACL Findings 2025,
  Choi et al. NeurIPS 2025.
