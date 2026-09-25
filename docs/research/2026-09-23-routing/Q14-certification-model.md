# Q14 - Certification model by risk and shadow succession

- Question: two certifiers vs a confirmer reviewing the first report vs one senior expert, by risk; parallel SHADOW certification as a route into succession.
- Primary: codex (GPT-6), session/receipt owner `codex-752016c00210e2f8`.
- Challenger: deepseek.
- Date: 2026-09-23 UTC.
- Commit SHA: `4ded1bee1c2acf2392fdeededf50935f59138302` (`git rev-parse HEAD`).
- Working-tree state: dirty, including concurrent governance, research and certification artifacts; this is research, not candidate certification.
- Inventory commands actually run: `git -C D:\Colabs ls-files | Measure-Object -Line` (325); `git ls-files`; `git status --short --branch`; `git log --oneline -10`.
- Secondary inventory: `git -C <root> ls-files | Measure-Object -Line`, `git -C <root> ls-files .ai docs`, `git -C <root> rev-parse HEAD`, `git -C <root> status --short --branch` for each root below; `rg --files 'D:\Битва за луну/docs'`.
- Secondary snapshots (all dirty, read-only): `D:\Block-Puzzle` 593 tracked, `e5c9382f48705f339250e4df928ffcf89f5df39f`; `D:\VPN` 866, `d560495863ab16c50a87883ca1989aa969b60945`; `D:\Битва за луну` 45, `4f58bfd177071f4826564e88d56b420b6efd9eb8`.
- Citation method: targeted `rg` discovery, source reads, then `& 'C:\Program Files\Git\usr\bin\grep.exe' -n -E '<known anchors>' <paths>`; cited lines are 1-based. Relative paths mean D:/Colabs; secondary citations use absolute paths.
- Source order: binding rules, raw reports/archive/journals and secondary evidence, prior research, routing opinion last. No external/API research or model calls; no product tests or new candidate probes.
- Status: primary research ready for challenge; recommendations below are proposals unless explicitly labelled an existing owner rule.

## 1. Decomposition

Separate five questions: who is eligible, how many reviews the risk requires, what each reviewer inspects, what evidence resolves disagreement, and how a shadow participant becomes eligible for a binding slot.
FACT: the owner amended selection on 2026-09-23: **Codex -> Claude -> DeepSeek is an AVAILABILITY order: first available AND independent of the candidate, not three checks** (`.ai/DECISIONS.md:1975`). It determines selection, not reviewer count or a competence ranking.
FACT: the same approved block already retains two parallel independent certifiers for high risk, permits a fresh-session confirmer for medium risk, retains one reviewer for low risk, and authorizes non-counting parallel shadow certification (`.ai/DECISIONS.md:1977`, `.ai/DECISIONS.md:1978`). Q14 tests the rationale and operational gaps; it does not reopen that ruling.
HYPOTHESIS: the useful unit is a review on an identified candidate plus its finding dispositions, not a model name or a report filename. Three files called round 3 can describe different states.

## 2. Essential factors

Proposed risk application, subject to the binding floors in section 6:

| Risk | Required/allowed review shape | What must be established |
|---|---|---|
| High | Two parallel, independent full candidate examinations | Same frozen package, source completeness, separate attack angles, independently fixed reports and reproductions; no confirmer substitution |
| Medium | Primary reviewer plus independent fresh-session confirmer is permitted | Bounded reversible product behavior outside high-risk paths; confirmer checks source and executions behind the report, omitted requirements and negative controls |
| Low | One independent reviewer statement; no separate prompt/report pair | Narrow blast radius established from behavior and dependencies, not file extension or diff length |

FACT: these review floors follow `.ai/DECISIONS.md:1671`, `.ai/DECISIONS.md:1672`, `.ai/DECISIONS.md:1793`, `.ai/DECISIONS.md:1977`. HYPOTHESIS: the medium-risk eligibility description above is an operational proposal; no complete medium-risk taxonomy is established by those lines.
HYPOTHESIS: a confirmer can save search work but inherits the first report's attention map. Reading the source behind every claim still cannot establish completeness unless the confirmer also inspects requirements and omissions.
HYPOTHESIS: a senior expert may improve diagnosis; seniority alone establishes neither independence nor a bound on omissions. Use a single senior reviewer in the low-risk slot; do not substitute reputation for a required slot.
Proposed common package: candidate SHA and pre-change baseline, complete source inventory, allowed delta, requirements and risk rationale, prior finding ledger, producer/controller identity and receipts, executable reproductions, expected checks, and explicit unknowns. Both full reviewers receive all old findings, but neither new peer report before fixing its own.
FACT: the current batch explicitly requires one committed SHA, separate worktrees and independent verdict fixing (`.ai/DECISIONS.md:1950`). Proposed emphasis: compare the package against inventory; a common incomplete package can make independent sessions repeat one omission.

## 3. Blind spots

1. HYPOTHESIS: selected failure stories overstate the marginal value of the second certifier. Successful one-review tasks and undetected escapes may be absent, and difficult candidates receive more reviews.
2. HYPOTHESIS: different brands may share the same premises, training patterns, source omissions or underlying model. Session separation reduces answer leakage, not every correlation.
3. HYPOTHESIS: a confirmer may rubber-stamp a persuasive report; two full reviewers may both overfit the supplied regression list. Neutral controls and an omission search address different failure modes.
4. HYPOTHESIS: the adjudicated outcome may itself be wrong. Agreement with two binding reviewers is not automatically truth; a shadow-only reproduction could overturn both.
5. HYPOTHESIS: a medium label can hide security/data consequences in a tiny configuration edit. Conversely, treating all product prose as high risk can consume review capacity without useful coverage.
6. HYPOTHESIS: stronger-looking results may come from more time, better tools or a complete package, not a better model. Quota failures and incomplete checks must be censored separately from incorrect verdicts.
7. HYPOTHESIS: later candidate fixes or owner exceptions can contaminate scoring: a PASS on an earlier defective SHA must not become correct because a later SHA ships.

## 4. Evidence - from the four repositories

Labels: FACT means a directly inspected repository record/contract; MEASURED means a calculation or execution in this Q14 session; CLAIM means an earlier author's empirical assertion not replayed here; HYPOTHESIS means an inference. No historical CLI execution is relabelled as a Q14 measurement.

**Colabs, primary evidence.**

- FACT: F-C01's table records ordinary `validate-protocol.ps1` and `protocol-manifest.json` yielding RECOMMENDATION/0; adding `invariant X` changes the former to FAIL/1 (`docs/reviews/2026-09-23-codex-path-contract-assessment.md:64`, `docs/reviews/2026-09-23-codex-path-contract-assessment.md:65`, `docs/reviews/2026-09-23-codex-path-contract-assessment.md:66`). CLAIM: neutral requirements exposed protected-path recognition failure previously masked by the other verdict branch (`docs/reviews/2026-09-23-codex-path-contract-assessment.md:68`). FACT: that assessment expressly fills neither certifier slot (`docs/reviews/2026-09-23-codex-path-contract-assessment.md:19`). HYPOTHESIS: this supports a distinct attack angle, not a clean controlled comparison of one vs two simultaneous certifiers.
- FACT: early DeepSeek round 2 records F-003: editing text after an internal `---` passes unexpectedly (`docs/reviews/2026-09-23-deepseek-batch-certification-round2.md:140`). Early round 3 marks that direction closed with D2a exit 1 (`docs/reviews/2026-09-23-deepseek-batch-certification-round3.md:120`). Later Claude records a remaining normalization hole: inserting/removing an internal separator is invisible (`docs/reviews/2026-09-23-claude-batch-certification.md:98`, `docs/reviews/2026-09-23-claude-batch-certification.md:125`). CLAIM: broad closure was overturned by a different mutation direction. HYPOTHESIS: confirming only D2a would miss the residual; testing edits, insertions and deletions matters more than recounting PASS tokens.
- FACT: those DeepSeek reports concern dirty `82bf99a`, while Claude's later report names frozen `b232a9e` (`docs/reviews/2026-09-23-deepseek-batch-certification-round3.md:4`, `docs/reviews/2026-09-23-claude-batch-certification.md:5`). They are not identical-candidate randomized observations. Do not conflate this early round 3 with the later `4ded1be` round 3.
- FACT: Gemini's layers A/B/C report says PASS while explicitly recording confirmed LOW findings, including the exclusion and symlink defects (`docs/reviews/2026-09-22-gemini-layers-abc-certification.md:9`, `docs/reviews/2026-09-22-gemini-layers-abc-certification.md:81`, `docs/reviews/2026-09-22-gemini-layers-abc-certification.md:82`). DeepSeek records FAIL and confirmed findings on the same tool family (`docs/reviews/2026-09-22-deepseek-layers-abc-certification.md:9`, `docs/reviews/2026-09-22-deepseek-layers-abc-certification.md:42`). FACT: the archive preserves Gemini's PASS/backlog treatment (`.ai/ARCHIVE.md:6735`, `.ai/ARCHIVE.md:6739`). CLAIM: section 0 attributes resolution to applying the existing blocking rule (`docs/specs/2026-09-23-executable-rulebook-spec.md:16`). HYPOTHESIS: this is partly rule-application failure after detection, not simply low detection competence.
- FACT: on `4ded1be`, Mistral's shadow report records PASS (`docs/reviews/2026-09-23-mistral-shadow-certification-round3.md:5`, `docs/reviews/2026-09-23-mistral-shadow-certification-round3.md:14`); Claude records FAIL (`docs/reviews/2026-09-23-claude-batch-certification-round3.md:15`); Codex records five reproduced protected-path defects (`docs/reviews/2026-09-23-codex-batch-certification-round3.md:28`). CLAIM: the explicit negation and Roles-section counterexamples contradict Mistral's blanket checks (`docs/reviews/2026-09-23-codex-batch-certification-round3.md:32`, `docs/reviews/2026-09-23-codex-batch-certification-round3.md:44`, `docs/reviews/2026-09-23-mistral-shadow-certification-round3.md:59`, `docs/reviews/2026-09-23-mistral-shadow-certification-round3.md:60`). This is a concrete provisional shadow miss, not a model-wide failure rate.
- FACT: Mistral's report says the full suite timed out and was not counted as failure (`docs/reviews/2026-09-23-mistral-shadow-certification-round3.md:87`). Its report-time check completeness therefore needs reconciliation with its later receipt before scoring. FACT: Claude also flags missing producer evidence and unresolvable reproduction commands in the frozen package (`docs/reviews/2026-09-23-claude-batch-certification-round3.md:23`, `docs/reviews/2026-09-23-claude-batch-certification-round3.md:26`). These package defects must be recorded separately from reviewer reasoning.
- FACT: the coordinator records the latest round closed with two FAILs and a shadow PASS and returns the batch to the owner (`.ai/worklog/deepseek-face2b2e94e03a81.md:9`). The same journal records an earlier quota/sandbox-blocked Codex slot with no verdict (`.ai/worklog/deepseek-face2b2e94e03a81.md:66`). HYPOTHESIS: an unrun review belongs in availability/completion statistics, not the defect-detection denominator.

**Block-Puzzle, secondary evidence.**

- FACT: the adversarial synthesis identifies the same R8/minify allegation in audits 07 and 08 and cites Flutter plugin defaults against it; its disposition table withdraws D2 in both (`D:/Block-Puzzle/docs/audit/09_ADVERSARIAL_REVIEW_06_07_08_2026-09-21.md:35`, `D:/Block-Puzzle/docs/audit/09_ADVERSARIAL_REVIEW_06_07_08_2026-09-21.md:164`). CLAIM: both initial diagnoses were wrong; Q14 did not execute that SDK. HYPOTHESIS: agreement between reviewers can preserve a shared false premise, while checking an underlying dependency can refute it.
- FACT: that artifact distinguishes an initial one-sided text exercise from subsequently recorded live discussion (`D:/Block-Puzzle/docs/audit/09_ADVERSARIAL_REVIEW_06_07_08_2026-09-21.md:11`, `D:/Block-Puzzle/docs/audit/09_ADVERSARIAL_REVIEW_06_07_08_2026-09-21.md:28`). HYPOTHESIS: report-confirmation and independent examination must be separate labels in the dataset; they are not interchangeable exposures.

**VPN, secondary evidence.**

- FACT: DeepSeek's correction supersedes its own conclusion that one strict-route toggle was sufficient, explicitly marking self-correction after owner tests failed (`D:/VPN/docs/reviews/2026-09-23-deepseek-strict-route-correction.md:5`, `D:/VPN/docs/reviews/2026-09-23-deepseek-strict-route-correction.md:8`, `D:/VPN/docs/reviews/2026-09-23-deepseek-strict-route-correction.md:17`). CLAIM: a second mechanism was not checked before declaring success. HYPOTHESIS: this supports end-to-end falsification and late-outcome tracking; it is not evidence that a second independent certifier actually caught this incident.

**Битва за луну, secondary evidence.**

- FACT: round 6 received a single-review PASS, explicitly classified as low-blast-radius analysis, with a stated two-review requirement if the owner classified it high risk (`D:/Битва за луну/docs/reviews/2026-09-22-claude-round6-certification.md:13`, `D:/Битва за луну/docs/reviews/2026-09-22-claude-round6-certification.md:26`, `D:/Битва за луну/docs/reviews/2026-09-22-claude-round6-certification.md:30`). The method sampled about 20 claims (`D:/Битва за луну/docs/reviews/2026-09-22-claude-round6-certification.md:42`).
- FACT: a later same-session correction admits extrapolating from one source file to the whole repository and records a primary source tracked since the initial commit (`D:/Битва за луну/gameplay/analysis/round7-concept-correction/MISSED-SOURCE-FINDING.md:12`, `D:/Битва за луну/gameplay/analysis/round7-concept-correction/MISSED-SOURCE-FINDING.md:41`). HYPOTHESIS: strong claim-level checking does not ensure source completeness; a confirmer restricted to the first report would inherit that blind spot. This is research/governance evidence, not a measured product-code escape rate.

**Prior research and opinion, lower weight.**

- FACT: the cycle-history research distinguishes 13/27 blocking verdicts from detection and warns that nonblocking verdicts can contain detected defects (`docs/reviews/2026-09-20-codex-cycle-history-research.md:60`, `docs/reviews/2026-09-20-codex-cycle-history-research.md:90`). The R0 dataset expressly lacks a task census or causal review-depth comparison (`docs/research/2026-09-23-r0-decision-dataset/README.md:17`); its single-statement row is policy, not an executed-task result (`docs/research/2026-09-23-r0-decision-dataset/README.md:7`).
- FACT: the routing opinion calls its order provisional, not measured (`docs/reviews/2026-09-23-codex-routing-architecture.md:112`). HYPOTHESIS: its identity/role separation is useful design input, but its ranking adds no empirical weight. The later owner rule, not this opinion, governs selection.

## 5. What history can and cannot support

HYPOTHESIS: these incidents justify guarding source completeness, closure breadth and verdict arithmetic separately, while retaining the existing high-risk minimum. They do not establish that two is statistically optimal or that a confirmer is equivalent to an independent second search.
Missing denominators: all eligible candidates per risk class; which reviewers had an opportunity to see each defect; independently adjudicated unique defects; successes and escapes after PASS; unrun/censored slots; equal budgets; model/harness versions; queue and owner time. A share of FAIL verdicts is not a competence score.
FACT: the historical analysis itself cautions that its selected cohorts lack costs and true-defect overlap labels (`docs/reviews/2026-09-20-codex-cycle-history-research.md:82`). Repeated revisions of one batch are correlated observations, not fresh tasks.
HYPOTHESIS: “the second reviewer found what the first missed three times” is a useful owner rationale, but the three mechanisms above mix advisory assessment, sequential closure testing and detected-but-misclassified defects. They cannot yield a marginal recall percentage for parallel certification.
Proposed comparison: shadow a medium-risk confirmer and an independent examiner on comparable frozen candidates, preserving the approved gate; predeclare budgets and exposure. Count missed mandatory root causes, invalid blocking claims, check completion and time separately. Do not downgrade live high-risk gates to manufacture an experiment.

## 6. Interaction with binding rules

- FACT: PROTO-DEC-0041 item 1 excludes authors, executors, controllers and executing-pair members (`.ai/DECISIONS.md:1792`). A new session name does not erase candidate control. A deputy who repairs the candidate loses eligibility to certify it.
- FACT: item 2 requires two parallel independent reviewers for high risk; the third needs uncovered risk, contradicting reproductions or owner direction (`.ai/DECISIONS.md:1793`). Selection from the availability order fills the required distinct slots; it never converts the order into three serial approvals. If fewer than two eligible certifiers remain, high-risk completion stays blocked.
- FACT: PROTO-DEC-0038 scales artifacts by blast radius, retaining full prompt/report review for protected paths and one independent statement otherwise (`.ai/DECISIONS.md:1671`, `.ai/DECISIONS.md:1672`). A docs/config label cannot downgrade a core, security, data, invariant or migration consequence.
- FACT: PROTO-DEC-0042 binds reviewer evidence to the certification state and producer/controller evidence to the task's final state (`.ai/DECISIONS.md:1822`, `.ai/DECISIONS.md:1823`, `.ai/DECISIONS.md:1824`). Later unrelated tree movement is not an escape or reviewer error. Missing evidence at certification is a different issue.
- FACT: reproductions outrank voting; refutation has the same proof burden on the same relevant state (`.ai/DECISIONS.md:1795`, `.ai/DECISIONS.md:1796`). Under 0047, anyone may supply a reproduced blocker, but only an independent certifier contributes a permissive gate verdict (`.ai/DECISIONS.md:1976`). A shadow finding therefore matters even though its PASS never fills a slot.
- FACT: PROTO-DEC-0034 excludes external tool/MCP outputs from Evidence and gates (`.ai/DECISIONS.md:1553`). Shadow reports must remain repository artifacts with native evidence; no Jev score, external rating or token counter decides certification.
- FACT: 0047 keeps shadow scores outside gates, review of ratings per ten closed tasks, and a separate batch cap (`.ai/DECISIONS.md:1978`, `.ai/DECISIONS.md:1984`, `.ai/DECISIONS.md:1979`). A shadow run is not authorization for another remediation round.

## 7. Interaction with the other 13 questions

Proposed interfaces to Q01-Q13; these are dependencies, not claims that unfinished research has adopted them. Question topics are recorded in `docs/reviews/2026-09-23-codex-routing-architecture.md:36` through `:48` (FACT).

| Question | Q14 constraint/input |
|---|---|
| Q01 provider rotation | Filter independence and required capability before availability; reserve two high-risk slots |
| Q02 specialization | Shadow qualifications are per domain/role/risk and actual model-harness tuple |
| Q03 model tiers | Tier or provider brand cannot replace a required independent certifier |
| Q04 effort | Record requested and observed effort; unknown applied effort stays unknown |
| Q05 attempts/escalation | Keep candidate/root-cause lineage; changing reviewers does not reset remediation budgets |
| Q06 Jev | No predicted probability decides a verdict or lowers a gate; offline proposals only |
| Q07 coordinator | Freeze complete inputs, isolate reports, track eligibility; controller does not self-certify |
| Q08 cost | Reserve mandatory review first; optional shadow uses an explicit remaining budget |
| Q09 leave | A quota-blocked slot is missing coverage; use the next eligible available participant |
| Q10 time | Compare elapsed-to-adjudication including queue, reconciliation and owner intervention |
| Q11 deputies | Shadow qualification supplies succession evidence; an execution deputy may be ineligible |
| Q12 metrics | Join run, candidate, finding, disposition and later outcome; keep missing denominators visible |
| Q13 capacity | Reserve artifact space; retain immutable reports and append adjudications, avoiding live archival |

Additional interface to later-added Q15: shadow uses the same approved tool ceiling; tool experiments do not become certification dependencies (proposal under the 0034 boundary above).

## 8. Options - at most three real ones, including doing less, each with cost, time and risk

HYPOTHESIS/planning model, not measured prices: R1/R2 are full-review costs, C a confirmer cost, S shadow cost; t denotes their elapsed work, q queue delay, a adjudication. No historical estimate establishes C < R2.

| Option | Cost | Time | Risk / admissibility |
|---|---|---|---|
| A. Do less: apply current gate, no additional comparison experiment; single independent senior for low risk, two for high | Low R1; high R1+R2; only owner-scheduled shadow S | Low q+t1; high q+max(t1,t2)+a | Lowest added overhead; little qualification data. Cannot use single senior to close high risk; owner controls shadow cadence |
| B. Risk-scaled route plus bounded parallel shadow (recommended) | Low R1; medium R1+C; high R1+R2; add S only on selected rounds | Medium q+t1+tC+a; high q+max(t1,t2)+a; parallel shadow adds compute and possibly resource contention | Preserves high-risk coverage; medium anchoring and misclassification remain; requires explicit risk and shadow records |
| C. Two full independent reviews for medium as well as high, sampled shadow | R1+R2(+S) on medium/high | q+max(t1,t2)+a, subject to shared-machine/quota contention | Potentially broader coverage, more scarce capacity and artifacts; no measured benefit over B for medium risk |

A confirmer or single senior replacing the second high-risk certifier is not an available option under current rules; it would require an explicit owner rule change, not routing discretion.

## 9. Recommendation, and the forks only the owner can decide

Recommend B as an operational proposal within the existing ruling: protect the two independent high-risk passes, retain the low-risk single statement, and use confirmation only for explicitly bounded medium risk. The confirmer must reproduce the first report's decisive checks, test at least an omission/negative-control direction, and report unexamined scope. Inability to do that is incomplete verification, not implied assent.
Apply Codex -> Claude -> DeepSeek after exclusions, selecting distinct eligible participants until the risk quota is filled. Record unavailable/excluded reasons and actual model/client/session identity. Mistral or Copilot remains SHADOW until the owner promotes a qualified tuple; neither fills a vacancy by default.
Proposed shadow procedure: same frozen package, parallel start, no new peer reports before fixing its own; the controller collects artifacts without certifying them. Register any shadow reproduction for independent adjudication immediately after reports are fixed. Do not wait for a periodic score review to investigate a blocker.

Proposed recording format for owner choice: one immutable Markdown report plus append-only outcome rows in an owner-selected research dataset, linked to Q12; no new gate parser or receipt schema. Minimum fields:

| Record | Required contents |
|---|---|
| Identity/exposure | task, candidate SHA, baseline, package digest, risk/domain, actual model/client/version/effort, session owner, excluded-role check, report exposure and fixed-at time |
| Report | `Mode: SHADOW-CERTIFYING`; `Gate-counted: false`; one existing verdict token; requirement/root-cause IDs, exact commands/expected/actual results, unresolved checks, report and native receipt paths |
| Resources | queued/start/end/fixed timestamps, tokens/cost if observed, environment limitations, retry/timeout status; unknown remains null |
| Outcome append | adjudicator and basis, candidate-specific final disposition/date, reproduction or refutation path, duplicate-root mapping, later escape or owner exception; supersedes-row link rather than overwriting history |

Proposed scoring against final outcomes, not against majority vote:

- Adjudicate the exact SHA. Keep four outcomes distinct: no known mandatory defect after completed checks; reproduced mandatory defect; insufficient evidence/checks; owner acceptance with exceptions. The last does not make an earlier missed defect disappear.
- For each adjudicated mandatory root cause, record detected/missed/not-exposed; for each shadow claim, confirmed/refuted/unresolved. Merge duplicate IDs by root cause. Report precision only over resolved claims, recall only over known adjudicated exposed defects, and label the latter a lower-information proxy for true recall.
- Report a permissive-verdict escape fraction over adjudicated PASS/RECOMMENDATION rounds, false blocking claims separately, completion/abstention rate over all assigned rounds, and incremental confirmed findings beyond binding reviewers. Always show numerator, denominator, pending cases and risk strata; never reward FAIL frequency.
- Keep owner overrides, package omissions, harness failures and quota timeouts separate. A report-time PASS with missing mandatory checks is a procedural calibration issue even if a later receipt completes those checks.
- Treat the current Mistral `4ded1be` PASS as a provisional miss against published counterexamples, pending adjudication/reconciliation, not as a final competence score. Preserve any later correction as another outcome row; do not rewrite the report.
- Promotion requires owner judgment on comparable prospective rounds, known-defect challenge coverage, clean candidates to expose false alarms, acceptable escapes and sufficient uncertainty bounds. Zero observed misses in a small selected sample is not proof of reliability. Ratings remain advisory after promotion.

Owner-only forks: (1) the medium-risk boundary and whether to pilot confirmer coverage there; (2) Markdown-only vs Markdown plus CSV/JSONL outcome rows, location and retention; (3) shadow cadence, cost/time ceiling and whether both Mistral and Copilot get matched exposure; (4) outcome adjudicator, follow-up horizon and handling of unresolved/excepted cases; (5) qualification sample, tolerated error bounds, domain scope, model-version expiry/requalification and promotion into the availability order. These are choices to approve, not thresholds inferred from this history.

## 10. Missing data

- A complete task/candidate census across four repositories, risk labels, eligibility/exposure and successful one-review outcomes; prior corpus counts are not that census.
- Unique defect-to-reviewer joins and independently verified dispositions; retained reproduction scripts and exact historical dirty-tree content where SHA alone is insufficient.
- Matched medium-risk confirmer vs independent-review observations and senior-only comparisons at equal budgets; no causal effect estimate here.
- Full shadow check/receipt reconciliation for `4ded1be`, independent outcome adjudication and later escape follow-up; one shadow PASS/FAIL divergence cannot qualify or permanently disqualify a model.
- Actual model/harness/effort and capability attestations for each slot; advertised provider identity is insufficient.
- Review active time, queue time, adjudication/owner time, tokens and marginal cost joined by candidate; timeout and quota censoring. Parallel compute cost is not parallel elapsed time.
- Owner-approved medium taxonomy, shadow schema/cadence, follow-up horizon and promotion tolerances. No online call, paid experiment or installed tool is needed to acknowledge these gaps.

## 11. Challenge

Challenger: pending

### Challenger's independent blind-spot list (deepseek, saved before reading the primary document)

Disclosure: the coordinator's own tool log exposed this document's text before this list was
saved (a file-read dump); the list below is written from the question and from evidence the
challenger already held, and the attack that follows cites the document explicitly.

1. The unit of comparison is unstated: "two certifiers" vs "a confirmer" vs "a single senior"
   varies reviewer count, exposure (report vs candidate) and model identity at once, so no
   observed outcome can be attributed to the count alone.
2. No census: candidates per risk class, which reviewers saw which defect, and successful
   single-review outcomes are absent; a share of FAIL verdicts is not a competence score.
3. Shared-premise risk: two "independent" reviewers can share one model family, one package
   omission or one attention map; independence of control is not independence of search.
4. Shadow scoring needs adjudication on the exact SHA and must not be contaminated by later
   fixes or owner exceptions; shadow rounds are selected by the owner (selection bias).
5. "Senior" is undefined: no recorded tier registry exists, and one senior expert cannot
   satisfy the high-risk two-review floor - using one would be a rule change, not routing.
6. Cost claims for a confirmer are asserted, not measured; queue and owner-adjudication time
   dominate cycles and are not logged.
7. Succession promotion from small shadow samples invites reputation lock-in; version and
   harness changes under stable names defeat the qualified-tuple idea unless pinned.
8. The availability order fills slots; it says nothing about review count. Conflating the two
   would turn the order into serial approvals.

### Challenger's attack on the primary document (deepseek, after reading)

A1. Label discipline, by the document's own rule: section 9 requires adjudicating the exact
    SHA before outcomes are scored (lines 151-152, 155), yet line 59 concludes "a concrete
    provisional shadow miss" ahead of that adjudication. The defensible label for the same
    SHA is "candidate outcome awaiting adjudication", not "miss". The underlying evidence
    holds: Codex3:28 records five reproduced protected-path defects
    (docs/reviews/2026-09-23-codex-batch-certification-round3.md:28), Claude3:15 FAIL
    (:15), Mistral shadow:5/14 PASS (docs/reviews/2026-09-23-mistral-shadow-certification-round3.md:5,14),
    and the negation/Roles counterexamples (codex-round3.md:32,44 against shadow:59-60) are
    real: the shadow's own probe (shadow:59) tested an adversative conjunction, not Codex's
    stem and prefix cases.
A2. Comparison validity: line 55 honestly concedes the incidents are "not a clean controlled
    comparison", but options A-C (lines 126-130) and the recommendation (line 136) still lean
    on them. Add the explicit sentence that no option is selected by measurement and that
    option B is a governance default until the comparison in line 88 actually runs.
A3. Confirmer budget and consequence: line 136 lists confirmer duties but no time, cost or
    failure consequence. Specify: if the confirmer cannot reproduce the decisive checks and
    test at least one omission direction, the medium gate is NOT satisfied and the item goes
    to the owner (mirroring the high-risk rule in line 132), rather than "incomplete
    verification" alone.
A4. Shadow lifecycle: line 138 says "parallel start" but says nothing about a moved
    candidate. Add: a shadow round binds one SHA; if the candidate is superseded before
    adjudication the round is void for scoring (or is re-run on the new SHA), so a PASS on a
    withdrawn SHA cannot enter the succession record.
A5. Citation check performed (sampled): `.ai/DECISIONS.md` 1975, 1977 and 1978 verified at
    block level (availability order; certifier count by risk; shadow certification); 1984
    carries the "ratings reviewed every ten closed tasks" rule; Claude3:15/23/26 and
    Codex3:28 verified verbatim. No misattribution found in the sampled anchors - recorded
    because label discipline requires saying what was checked.
A6. Line 87's "the second reviewer found what the first missed three times" appears as the
    owner's rationale without a cited source; mark it CLAIM with owner/date, or cite where
    it is recorded.

Disagreement preserved: option B is not disputed; A1-A4 are precision defects that would
otherwise leak into the scoring procedure this document itself defines.
