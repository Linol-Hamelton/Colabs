# Q02 - Domain role specialisation

Question: Lead experts, lead executors, and lead researchers per domain: declared specialisations, this project's history of who erred where, expert reputation, and community feedback.
Primary: copilot
Challenger: deepseek
Date: 2026-09-23
Commit SHA: b232a9e5e99b51fccf8a1ce2ccfa009c3a204bed
Working-tree state: dirty (pre-existing staged and unstaged changes).
Inventory commands actually run: `git ls-files` in `D:\Colabs`; `git status --short --branch`; `git log --oneline -10`. Attempts to run `git ls-files` after changing to `D:\VPN`, `D:\Block-Puzzle`, and `D:\Битва за луну` were denied by the execution environment before execution, so no direct secondary-repository inventory is claimed.

## 1. Decomposition

Separate five roles: domain expert (diagnosis), executor (correct change), researcher (source synthesis), independent reviewer (defect detection), and coordinator (ownership/throughput). A “lead” is a conditional route preference, not authority or certification power. Score the tuple (model, harness, version, effort, domain, role), not a provider name.

## 2. Essential factors

Eligibility precedes ranking: authorization, capability, context fit, privacy, independence, availability, quota reserve, and cost ceiling. Comparable outcomes need task difficulty, risk, exact model/harness, prompt, attempts, tests, review result, owner intervention, and censoring reason. Community reputation is a prior only when version, environment, task and reproduction are supplied.

## 3. Blind spots (at least three ways a confident answer here could be wrong)

1. A high FAIL share can mean harder assignments or reviewer role, not low competence.
2. A “lead” may be a role label hiding a changed model, effort, context, or tool failure.
3. PASS history can reflect easy tasks, self-correction, or missing denominator rather than reliable diagnosis.
4. Community popularity can measure visibility, not correctness in this repository.
5. A specialist can be unavailable or non-independent exactly when a high-risk task needs them.

## 4. Evidence - from the four repositories; every factual claim with path:line; label each claim FACT / MEASURED / CLAIM / HYPOTHESIS

- **FACT**: PROTO-DEC-0041 separates independence, requiring at least two parallel independent reviewers for high-risk candidates; majority cannot override reproduction (`.ai/DECISIONS.md:1792-1796`).
- **FACT**: the same decision says the historical paired-cycle reviewers agreed on 7/7 defects and diverged on severity, so verdict counts are not competence scores (`.ai/DECISIONS.md:1789`).
- **MEASURED**: R0 contains 180 archive mappings, 3 review-depth rows, 17 finding/disposition rows, and 5 explicit round outcomes (`docs/research/2026-09-23-r0-decision-dataset/README.md:5`).
- **FACT**: R0 explicitly cannot support a complete task census, reviewer-recall estimate, causal comparison, or complete round count (`docs/research/2026-09-23-r0-decision-dataset/README.md:13-15`).
- **MEASURED**: the historical evidence snapshot reports 170 Markdown files, 108 verdict fields, 103 reviewer fields, and 62 mode fields, while warning it is not a model-ranking estimator (`docs/research/2026-09-20-cycle-history/evidence.json:3-8`).
- **FACT**: the routing architecture recommends ranking by independently adjudicated comparable outcomes, separating model mistakes from prompt, tooling, authorization, and network failures, and re-evaluating after version changes (`docs/reviews/2026-09-23-codex-routing-architecture.md:102-124`).
- **FACT**: it records missing candidate identity, task denominator, exact models, efforts, and cycle costs as blockers to a defensible domain leaderboard (`docs/reviews/2026-09-23-codex-routing-architecture.md:20-28`).
- **FACT**: the binding inventory rule says a scope inherited from a prompt is not verified until `git ls-files` is checked (`.ai/DECISIONS.md:1884`).
- **FACT**: the same decision records a missed tracked source in `D:\Битва за луну` and a copied record set in another repository, demonstrating omission and copying risks rather than role competence (`.ai/DECISIONS.md:1881-1884`).
- **CLAIM**: the Codex routing document offers provisional role seeds, but explicitly says they are not measured rankings (`docs/reviews/2026-09-23-codex-routing-architecture.md:111-126`).
- **FACT**: direct inventories for the three secondary repositories were not executable in this session; therefore their raw histories are not independently evaluated here.

## 5. What history can and cannot support

History can support a provenance-preserving roster of declared experience, exact reproduced findings, role/assignment metadata, and calibration of route eligibility. It cannot support “best expert” from FAIL frequency, PASS frequency, reputation, or a share of blocking verdicts. The denominator is missing: task population, assignment difficulty, exposure, censored runs, and independent ground truth are not complete. A share of FAIL verdicts is not a competence score.

## 6. Interaction with binding rules

PROTO-DEC-0041 item 1 forbids an author, executor, controller, or executing-pair member from certifying its own candidate (`.ai/DECISIONS.md:1792`). Reproduction outranks voting and a synthesis has the same proof burden (`.ai/DECISIONS.md:1795-1796`). PROTO-DEC-0034 makes external tools advisory, never Evidence or a gate input (`.ai/DECISIONS.md:1552-1556`). Any role matrix must preserve these constraints; it cannot turn reputation into authority.

## 7. Interaction with the other 12 questions

Q01 supplies task packets and eligibility; Q03 supplies model/harness identity; Q04 supplies escalation and attempts; Q05 supplies review depth; Q06 is a bounded forecast, not a lead selector; Q07 supplies coordinator lifecycle; Q08 supplies cost and scarce-capacity accounting; Q09 supplies exhaustion forecasts; Q10 orders quality before time and cost; Q11 supplies deputies; Q12 supplies event schema and re-ranking; Q13 separates active history from retained history. This question supplies role/domain labels and priors only.

## 8. Options - at most three real ones, including doing less, each with cost, time and risk

1. **Do less: declared roster only.** Cost: near-zero. Time: one inventory pass. Risk: routing remains manual and anecdotal.
2. **Shadow competence matrix.** Cost: schema and adjudication effort. Time: several matched tasks per role/domain. Risk: small samples create false leaders; no gate impact.
3. **Live lead/deputy routing.** Cost: orchestration, quota reservations, and independent-review coordination. Time: after shadow data. Risk: premature labels amplify bias and can strand high-risk certification.

## 9. Recommendation, and the forks only the owner can decide

Recommend option 2, offline/shadow only: record exact tuple identity, assignment, outcome, defect taxonomy, and exposure; use conservative qualification bands and no permanent lead until matched data exists. The owner alone decides whether to authorize live routing, what minimum sample and uncertainty threshold qualify a lead, and whether community evidence may change a local route.

## 10. Missing data - what would have to be measured to decide better

For every run: task/domain/risk/difficulty, role, exact model and harness, effort requested/applied, baseline, prompt/context version, attempts, wall and human time, tests, independent findings, acceptance, escaped defects, owner intervention, quota/cost, and reason for censoring. For secondary repositories, repeat `git ls-files` and collect the same event schema in their own sessions.

## 11. Challenge - leave it as "Challenger: pending" with an empty slot; the challenger fills it later and never averages disagreement away

Challenger: deepseek (independent list above; attack below)

  

### Challenger's independent blind-spot list (deepseek, saved before reading the primary document)

1. Unit confusion: a "lead expert" can be a model, a harness, a provider account or a
   session identity; a ranking that mixes units is not comparable (CLI-AGENTS separates
   client from provider).
2. No task denominator: without task ids, difficulty and role, any leaderboard mixes task
   mix with competence; review header drift (REVIEW.md:22) further breaks joins.
3. Self-declared specialisations are claims; the record holds role text, not measured domain
   scores. "Declared" must never be reported as measured.
4. Attribution limits: a failed output may be caused by the prompt, missing inputs, tooling
   or quota; assigning it to the model is a hypothesis at best.
5. Survivorship: only sessions that reach Stop appear in telemetry; quota/auth failures
   leave no row, so the most-limited participants can look the most reliable.
6. Reputation inertia: models change under stable names and no version id is recorded; an
   old win/loss record must expire with the version.
7. Independence overrides ranking: the best expert may be ineligible as certifier on a given
   candidate (PROTO-DEC-0041 item 1); a top-3 that ignores eligibility is operationally wrong.
8. Community feedback is untrusted input by policy; it may inform priors only with version
   context and reproduction. Popularity is not correctness.
9. Domain taxonomy is undefined: no agreed partition of work into domains exists, so
   "per domain" expertise cannot be scoped or measured today.

### Challenger's attack on the primary document (deepseek, after reading)

P1. Citation integrity:
- The claim at line 30 attributes to PROTO-DEC-0041 (`.ai/DECISIONS.md:1789`) that
  "reviewers agreed on 7/7 defects and diverged on severity". That wording exists nowhere
  in `.ai/DECISIONS.md` (searches for `7/7`, `seven defects`, `diverged on severity`
  return nothing); `.ai/DECISIONS.md:1789` is the Context line about four 2026-09-20
  analyses, and the only `7/7` strings in the repository are test counts in
  `.ai/ARCHIVE.md:2892,2919`. Either cite the real source or mark this CLAIM.
- The inventory rule at line 36 is attributed to `.ai/DECISIONS.md:1884`; the rule -
  "A scope inherited from a previous prompt is not a verified scope" - is AGENTS.md:153.
  `.ai/DECISIONS.md:1884` describes the Layer A `git ls-files` inventory instead.
P2. Section 7 swaps question identities: "Q04 supplies escalation and attempts; Q05
  supplies review depth" is inverted - Q04 is effort-level rotation and Q05 is escalation
  and attempt cycles; review depth belongs to PROTO-DEC-0038/0041, not to Q05.
P3. Section 4 is labelled "from the four repositories" while lines 9 and 39 concede that
  the three secondary repositories were never inventoried. Only D:\Colabs evidence is
  present; the label overstates coverage.
P4. The R0 README cited as dataset evidence carries a formatting defect:
  `docs/research/2026-09-23-r0-decision-dataset/README.md:5` holds literal `\n` escape
  sequences instead of line breaks (the row counts 180/3/17/5 do match). R0 feeds Q06;
  the dataset file should be fixed, and until then it is a shaky source.
P5. Gap: no operational definition of "domain" exists in the record, so a per-domain
  matrix has no domain axis. The decomposition asserts five roles but never states where
  domain boundaries come from; that partition is an owner decision.
P6. Option 2 has no stopping rule: no minimum sample, no uncertainty threshold, no plan
  for censored runs (which the primary itself names as a bias). Add one, e.g. "no lead is
  promoted before N matched outcomes with a stated interval".

Disagreement preserved: the recommendation's direction (shadow-only, no permanent lead)
is not disputed; P1-P4 must be repaired before the document is used, because its citations
are its only evidence.
