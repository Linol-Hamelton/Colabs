# Q06 - Jev offline decision forecast

Question: Jev for simple decisions and model disagreements: success probability per position, for the consensus option, and for the lead expert's option. OFFLINE ANALYSIS ONLY.
Primary: copilot
Challenger: mistral
Date: 2026-09-23
Commit SHA: b232a9e5e99b51fccf8a1ce2ccfa009c3a204bed
Working-tree state: dirty (pre-existing staged and unstaged changes).
Inventory commands actually run: `git ls-files` in `D:\Colabs`; `git status --short --branch`; `git log --oneline -10`. Attempts for the three secondary repositories were denied before execution; their inventories are not claimed.

## 1. Decomposition

Jev can be evaluated as an offline typed forecaster over a frozen state and identical questions: (a) consensus option, (b) lead-expert option, and (c) each candidate position. “Success” must be defined before replay as accepted within a deadline and budget under explicit constraints. Rejected options have no observed counterfactual outcome.

## 2. Essential factors

Use the R0 dataset and recorded history only. Keep Jev outside routing, gates, verdicts, approvals, and paid calls. Hold out by time, task family, and information available at decision time. Measure calibration (Brier/ECE), selective accuracy and abstention, regret against executed outcomes, latency, and the cost of preparing state/questions. Compare against deterministic/base-rate and human/lead baselines.

## 3. Blind spots (at least three ways a confident answer here could be wrong)

1. Consensus is selected after discussion and is not an independent ground truth.
2. Lead-expert options are observed selectively; rejected alternatives are censored.
3. Small R0 labels can produce impressive but unstable calibration.
4. A typed probability may be confidence or normalized preference, not a success probability.
5. State construction can leak the outcome or omit the decisive evidence.

## 4. Evidence - from the four repositories; every factual claim with path:line; label each claim FACT / MEASURED / CLAIM / HYPOTHESIS

- **FACT**: PROTO-DEC-0045 allows Jev only as advisory offline replay and forbids it from issuing a verdict, satisfying a gate, lowering a human gate, or replacing reproduction (`.ai/DECISIONS.md:1911-1916`).
- **FACT**: PROTO-DEC-0034 says external output is never Evidence or a gate input and permits at most one local, sandboxed, version-pinned MCP server with a 1,500-token schema budget (`.ai/DECISIONS.md:1552-1556`).
- **MEASURED**: R0 has 17 explicit findings/dispositions and 5 explicit round outcomes, but only 3 review-depth rows (`docs/research/2026-09-23-r0-decision-dataset/README.md:5`).
- **FACT**: R0 says it is not a complete census, recall estimate, causal comparison, or complete round count (`docs/research/2026-09-23-r0-decision-dataset/README.md:13-15`).
- **FACT**: the Jev research recommends the same bounded Boolean outcome for original, consensus, and expert plans, held-out calibration, and never treating rejected plans as failures (`docs/reviews/2026-09-23-codex-routing-architecture.md:144-155`).
- **FACT**: the routing research says no Jev call or paid operation was run (`docs/reviews/2026-09-23-codex-routing-architecture.md:189`).
- **CLAIM**: the Jev evaluation document reports vendor/API properties and third-party calibration observations, but labels itself advisory and was transcribed from an external model (`docs/research/2026-09-22-jev-decision-fabric-evaluation.md:1-8`).
- **FACT**: the history decision says an earlier “48 percent detection” number was actually the share of blocking verdicts and rejects ranking models by FAIL share (`.ai/DECISIONS.md:1789-1803`).
- **FACT**: the secondary repository inventory requirement is binding, but this session could not execute those commands; no secondary raw record is used as a measured Jev label.

## 5. What history can and cannot support

The denominator is missing for success probability: there is no complete set of attempted positions, no outcome for every rejected plan, no stable task strata, and no counterfactual execution for consensus or lead alternatives. A share of FAIL verdicts is not a competence score, and a Jev distribution is not validated probability until held-out outcomes calibrate it. R0 supports schema/provenance checks and an offline prototype, not a live forecast claim.

## 6. Interaction with binding rules

PROTO-DEC-0041 item 1 means Jev cannot manufacture independence or certify a result (`.ai/DECISIONS.md:1792`). Reproduction outranks consensus voting (`.ai/DECISIONS.md:1795-1796`). PROTO-DEC-0034/0045 keep external tools advisory-only and offline (`.ai/DECISIONS.md:1552-1556`, `.ai/DECISIONS.md:1911-1916`). No online or paid Jev/model API call is authorized by this document.

## 7. Interaction with the other 12 questions

Q01 defines the decision packet; Q02 supplies declared role/domain strata; Q03 supplies exact model identity; Q04/Q05 define escalation and review outcomes; Q07 supplies coordinator context; Q08/Q09 provide cost, quota and scarce-capacity features; Q10 defines quality-first objective; Q11 supplies lead/deputy alternatives; Q12 supplies event logging and temporal holdouts; Q13 controls retained history. Q06 consumes these fields and changes none of them.

## 8. Options - at most three real ones, including doing less, each with cost, time and risk

1. **Do less: no Jev.** Cost/time near-zero. Risk: no forecast signal, but no leakage or external dependency.
2. **Offline replay.** Cost: dataset cleaning and scoring. Time: bounded analysis. Risk: selection bias and low power; safe if no operational effect.
3. **Shadow advisory after owner approval.** Cost: state/question pipeline and monitoring. Time: only after offline calibration. Risk: anchoring, leakage, and policy drift; never gate-affecting.

## 9. Recommendation, and the forks only the owner can decide

Recommend option 2 now, using R0 as input and recording every missing denominator. Treat Jev outputs as hypotheses; compare against base rates and lead/consensus labels with time-held-out calibration. The owner alone decides whether to authorize any shadow call, the success threshold, the abstention policy, and any reopening of the offline-only boundary.

## 10. Missing data - what would have to be measured to decide better

Freeze decision-time state, option text, lead identity, consensus formation time, task stratum, deadline/budget, actual acceptance, defects, retries, owner intervention, rejected-option censoring, Jev model/version, latency, token/cost, abstention, and calibration split. Add secondary-repository records only after their inventories and outcomes are directly collected.

## 11. Challenge - leave it as "Challenger: pending" with an empty slot; the challenger fills it later and never averages disagreement away

Challenger: pending

  

### Challenger's independent blind-spot list (mistral, saved before reading the primary document)

- PROTO-DEC-0045 item 3 requires offline-only compliance; no evidence that the JEV mechanism itself is offline-only or that its inputs are pre-computed and immutable.
- "Success probability" is ambiguous: is it empirically grounded (frequentist) or a subjective forecast (Bayesian)? The R0 dataset may lack the volume and label quality to calibrate either.
- Calibration presupposes a well-defined ground truth and sufficient trials per position; the R0 dataset structure and size are unspecified, so calibration feasibility is unproven.
- Abstention/fallback mechanism is not specified: what triggers abstention, how is fallback selected, and what is the cost model?
- The consensus option and lead expert's option may have different success probability semantics; mixing them without a denominator (per-position vs per-decision) creates incomparable metrics.
- No baseline comparison: how does JEV compare to simple majority or weighted voting on the same offline dataset?

### Challenger's attack on the primary document (mistral, after reading)

- Line 31: R0 has only 3 review-depth rows, making per-position calibration statistically impossible; success probability per position cannot be estimated with this sample size.
- Line 32: R0 is explicitly "not a complete census"; the primary's recommendation (line 59) to use R0 for offline replay contradicts this — incomplete data cannot validate success probability claims.
- Line 41: "denominator is missing for success probability" is admitted but not resolved; without a denominator, "success probability" is undefined. The primary recommends proceeding anyway.
- Line 13: success is circularly defined as "accepted within a deadline and budget under explicit constraints" — but acceptance itself may depend on the same Jev outputs, creating a bootstrap problem.
- Line 33: cites Jev research recommending bounded Boolean outcomes, but R0 lacks Boolean labels for all candidate positions (line 31-32), making this recommendation's applicability questionable.
- Line 54: offline replay cost is understated; "dataset cleaning and scoring" on R0's 3-row sample is trivial, but generalizing requires defining the denominator that line 41 admits is missing.
- The primary does not address PROTO-DEC-0045 item 3's requirement that the mechanism itself be offline-only, not just its execution context.
