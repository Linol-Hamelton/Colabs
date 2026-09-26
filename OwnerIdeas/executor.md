Advisory seed; consumed by R-3; status: RESOLUTION-CLAUDE.md section 4.4

Да. Теперь слой становится гораздо яснее: **это уже не оценщик задачи и не каталог моделей, а экономический decision layer**, который связывает профиль задачи с профилями доступных исполнителей и выбирает **минимально достаточного**.

Я бы зафиксировал главную гипотезу исследования так:

> **Рациональный resolver должен начинать поиск исполнителя снизу по стоимости/ресурсоёмкости и подниматься вверх только тогда, когда есть доказательство или достаточно сильный прогноз, что нижний уровень не даст приемлемого результата.**

При этом это именно гипотеза исследования. Надо проверить, где `cheap-first` действительно оптимален, а где цена заведомого провала, handoff и повторной работы делает разумным старт чуть выше.

Ниже готовый prompt.

```markdown
# RESEARCH PROGRAM
## Minimum-Sufficient Executor Selection:
## Formula for Economically Optimal Model Routing

**Status:** RESEARCH
**Mode:** evidence-seeking, quantitative, adversarial
**Target:** software-engineering agent orchestration

---

# 1. Research goal

Design the decision formula and routing policy that connects:

1. measured characteristics of a task;
2. measured capability profile of available models;
3. benchmark evidence;
4. local empirical performance;
5. execution speed;
6. monetary/resource cost;
7. probability and cost of failure, repair and escalation;

and selects the executor expected to produce an acceptable result with the lowest total resource consumption.

The desired system should optimize:

> **the best acceptable result for the least total cost and time.**

Do NOT optimize:
- generic model intelligence;
- prestige of a model;
- provider rank;
- nominal task "difficulty";
- first-attempt success at any price.

Optimize the full path to accepted completion.

---

# 2. Central hypothesis

Investigate the following hypothesis critically:

> For most software-engineering work, executor selection should start from the least expensive sufficiently plausible candidate and escalate upward only when evidence indicates that additional capability is required.

Conceptually:

CHEAPEST PLAUSIBLE EXECUTOR
        ↓
accepted?
├── YES → DONE
└── NO
     ↓
diagnose failure
     ↓
next stronger / more appropriate executor
     ↓
repeat within bounded escalation policy

This is the **bottom-up escalation hypothesis**.

It MUST be tested rather than assumed.

Determine:

- where it dominates strong-first routing;
- where it does not;
- when starting too low creates more total cost;
- how far below the estimated optimum it is rational to probe;
- when probing should be forbidden.

---

# 3. Architecture boundary

This research concerns the layer:

TASK PROFILE
      +
MODEL / ROUTE PROFILE
      +
ECONOMICS
      +
EMPIRICAL EVIDENCE
      ↓
EXECUTOR SELECTION FORMULA
      ↓
PRIMARY + FALLBACK / ESCALATION PATH

Upstream systems already provide or will provide:

### Task Characterizer
Describes:
- type of work;
- capability requirements;
- determinism;
- specification quality;
- testability;
- reasoning demand;
- context size;
- execution volume;
- risk;
- coupling;
- technical constraints;
- benchmark proximity.

### Model Capability Layer
Describes:
- benchmark performance;
- local performance;
- role/task competence;
- context capability;
- tools;
- speed;
- cost;
- reliability;
- effort levels;
- route availability.

This research designs the layer that combines them.

---

# 4. Primary economic objective

Research the most appropriate optimization target.

Candidate:

MINIMIZE

    Expected Total Cost to Accepted Completion

while also minimizing:

    Expected Time to Accepted Completion

subject to:

- minimum acceptable quality;
- mandatory technical compatibility;
- independence constraints;
- safety/policy constraints;
- maximum task budget.

Do not assume that cost and time should simply be added linearly.

Compare:

1. lexicographic optimization;
2. constrained optimization;
3. weighted expected utility;
4. Pareto optimization;
5. dynamic-programming / escalation-path optimization;
6. probabilistic decision theory.

---

# 5. Main quantities to predict

For every candidate executor E and task T estimate, where possible:

P_first(E,T)
= probability of accepted completion on first attempt

P_repair(E,T)
= probability of accepted completion after bounded repair

P_escape(E,T)
= probability that a semantic defect survives available validation

C_run(E,T)
= direct execution cost

T_run(E,T)
= execution time

C_review(E,T)
= expected review cost

C_repair(E,T)
= expected repair cost

C_handoff(E,T)
= expected context-transfer / executor-switch cost

C_escalation(E,T)
= expected later escalation cost

T_recovery(E,T)
= expected additional time after failure

The research must determine which of these are useful enough to justify measuring.

---

# 6. Core formula candidate

Investigate a recursive formulation such as:

EAC(E_i, T) =
    C_run(E_i,T)
  + C_required_review(E_i,T)
  + P_fail(E_i,T) *
      (
        C_failure_processing
        + C_handoff
        + EAC(E_next,T)
      )

where:

EAC = Expected Accepted Completion Cost.

Similarly:

EAT(E_i,T) =
    T_run(E_i,T)
  + P_fail(E_i,T) *
      (
        T_failure_processing
        + T_handoff
        + EAT(E_next,T)
      )

Do NOT assume this formulation is correct.

Compare it against alternatives.

---

# 7. Minimum-sufficient executor principle

Investigate whether the resolver should choose:

> the cheapest executor whose estimated probability of acceptable completion exceeds a task-specific threshold.

Candidate:

choose cheapest E such that:

P_accept(E,T) >= Q_min(T)

where Q_min may depend on:

- consequence of error;
- verification strength;
- determinism;
- reversibility;
- deadline;
- cost of escalation.

Investigate whether this is superior to a global capability tier.

---

# 8. Bottom-up search

Study a deliberate bottom-up policy.

Example:

L1 cheapest plausible worker
↓
L2 stronger worker
↓
L3 strong specialist
↓
L4 senior
↓
L5 frontier / highest-cost expert

The route should normally begin at the lowest economically rational level.

But determine objective conditions for skipping levels.

Possible reasons:

- probability of success below threshold;
- failure is expensive;
- handoff cost is extreme;
- task is poorly verifiable;
- error can remain silent;
- irreversible external effect;
- deadline makes retry impossible.

---

# 9. Exploration of the lower boundary

A major research target:

> Can the system intentionally try slightly weaker/cheaper executors to discover the true minimum sufficient capability?

This should be treated as controlled exploration.

Study policies such as:

### Conservative exploration
Try one level below the predicted optimum only when:
- task is reversible;
- validation is strong;
- failure is cheap;
- time budget allows it.

### Aggressive exploration
Occasionally try lower-cost executors in shadow or parallel mode.

### No exploration
For tasks where:
- failure cannot be reliably detected;
- consequence is high;
- rollback is difficult;
- deadline is hard.

Determine the optimal exploration rate.

---

# 10. Boundary-learning objective

The system should learn not merely:

"Model X succeeds on coding."

It should learn:

> Where is the lower capability boundary for this class of task?

For a given task cluster:

cheap model A → succeeds
cheaper model B → succeeds
cheaper model C → fails repeatedly

Then the system has discovered an empirical boundary.

Research how to represent this.

Potential concept:

Minimum Proven Capability

or:

Minimum Proven Executor Class.

---

# 11. Task-to-model matching

Do not compare generic task complexity against generic model intelligence.

Compare task requirements against model capability vectors.

Example:

TASK:

repository implementation     0.8
debugging                     0.4
architecture                  0.1
long-horizon agentic          0.6

MODEL:

repository implementation     0.9
debugging                     0.8
architecture                  0.4
long-horizon agentic          0.85

Research suitable similarity / fit functions.

Candidates:

- weighted cosine similarity;
- weighted distance;
- geometric mean;
- minimum-dimension bottleneck;
- hard capability floors;
- learned success probability.

---

# 12. Benchmark proximity

Benchmark performance must influence routing in proportion to how transferable that benchmark is to the actual task.

For task T and benchmark B investigate:

Similarity(T,B)

using dimensions such as:

- task type;
- repository level;
- language;
- tool environment;
- context size;
- autonomy level;
- execution horizon;
- verification method;
- output structure;
- required reasoning.

Candidate:

EffectiveBenchmarkEvidence =
    BenchmarkScore
  × BenchmarkConfidence
  × TaskBenchmarkSimilarity
  × HarnessSimilarity
  × EnvironmentSimilarity

Do NOT use a coding benchmark as a universal intelligence score.

---

# 13. Benchmark mixture

A real task may resemble multiple benchmarks.

Example:

TASK:
- 50% SWE-Bench-like;
- 30% Terminal-Bench-like;
- 15% RepoProbe-like;
- 5% architecture benchmark.

Research how these components should be combined.

Determine whether weights should come from:

- deterministic task classification;
- semantic classification;
- learned historical relationships;
- hybrid methods.

---

# 14. Input-context volume

Input size should be treated explicitly.

Known before launch may include:

- task prompt;
- mandatory instructions;
- referenced files;
- dependency-linked files;
- protocol context.

Potential values:

PromptTokens
ExpectedContextTokens
MaxRelevantContextTokens
ContextFragmentation
DependencyDensity

Research how these affect:

- candidate eligibility;
- reading time;
- execution cost;
- attention degradation;
- success probability;
- optimal effort.

Do NOT automatically translate large context into high model rank.

---

# 15. Task volume

Measure separately:

- expected files read;
- expected files modified;
- LOC;
- commands;
- tool calls;
- expected output size;
- expected validation passes.

Research whether task volume should influence:

- model selection;
- context selection;
- decomposition;
- parallelism;
- expected price/time.

Volume should not automatically mean intelligence.

---

# 16. Speed

"Faster is better" only when quality remains acceptable.

Study at least:

- input processing speed;
- TTFT;
- output tokens/sec;
- time to first useful action;
- time to first edit;
- tool-call latency;
- total stage wall-clock time;
- accepted-completion time.

The resolver should primarily care about:

**Time to Accepted Completion**

rather than raw token throughput.

Research whether speed should influence routing differently for:

- interactive tasks;
- unattended background jobs;
- deadline-constrained tasks.

---

# 17. Cost

Study all economically relevant forms of cost:

- API dollars;
- subscription credits;
- scarce quota;
- token usage;
- reviewer consumption;
- repair consumption;
- escalation consumption;
- human attention;
- wall-clock delay.

Determine which belong in the live formula.

Do not make the formula unnecessarily complex if a variable has negligible decision value.

---

# 18. Resource scarcity

$1 of API spend and 1% of a scarce weekly senior-model quota may not be economically equivalent.

Research shadow prices / scarcity multipliers.

Possible concept:

EffectiveCost =
DirectCost × ScarcityMultiplier

where scarcity may depend on:

- remaining quota;
- reset horizon;
- expected future demand;
- role uniqueness;
- availability of substitutes.

Determine whether this complexity is justified.

---

# 19. Determinism

Investigate how task determinism changes optimal routing.

Possible relationship:

high determinism
+
high verification
+
low failure cost
→ stronger preference for cheap-first

low determinism
+
weak verification
+
high silent-error risk
→ higher initial executor capability

Determine whether determinism is:

- a direct weight;
- a threshold;
- a modifier of failure cost;
- a modifier of exploration permission.

---

# 20. Specification quality

Investigate:

strong specification
→ lower required executor capability?

Potential dimensions:

- completeness;
- exact acceptance criteria;
- implementation guidance;
- examples;
- negative cases;
- precedent.

Test whether senior intelligence can often be moved upstream:

senior specification
→ cheap implementation
→ deterministic checks
→ independent review

instead of:

senior specification
→ senior implementation.

---

# 21. Verification strength

This may be one of the strongest routing variables.

Study:

high verification strength
→ ability to safely use weaker executor

because failure is quickly detected.

Potential formula interaction:

AllowedExploration ∝
Determinism
× VerificationStrength
× Reversibility

and inversely:

AllowedExploration ∝
1 / ConsequenceOfUndetectedError

Treat this only as a hypothesis.

---

# 22. Risk and consequence

Determine precisely where risk should act.

Possible effects:

### Option A
Raise initial executor capability.

### Option B
Keep cheap executor but raise review/certification depth.

### Option C
Both.

### Option D
Depends on verification/determinism.

Research which policy minimizes total expected cost without increasing unacceptable escaped-error risk.

---

# 23. Hard constraints vs weighted variables

Some attributes should never be averaged.

Examples:

- insufficient context window;
- missing required tools;
- unavailable route;
- forbidden provider;
- independence conflict.

These should eliminate a candidate.

Research which factors belong to:

HARD FILTER

and which belong to:

SOFT OPTIMIZATION.

---

# 24. Formula structure

Do not assume the final formula is a simple weighted sum.

Compare at least:

## A. Weighted score

Score =
Σ w_i x_i

## B. Weighted geometric score

Score =
Π x_i ^ w_i

## C. Constraint + utility

filter hard constraints
then maximize expected utility

## D. Probability model

estimate P_accept directly

## E. Escalation-chain optimization

choose the whole expected sequence:

cheap → medium → senior

rather than one isolated model.

## F. Contextual bandit

future learned routing policy.

Provide strengths and failure modes of each.

---

# 25. The routing decision may be a chain, not a model

This is critical.

Instead of asking:

"Which model should do this?"

research whether the correct optimization unit is:

EXECUTION POLICY

Example:

Policy A:
DeepSeek → Gemini → Opus

Policy B:
Gemini → Opus

Policy C:
Opus directly

Calculate expected:

cost
time
quality
failure probability

for the whole policy.

The best initial executor may only make sense as part of an escalation path.

---

# 26. Example

Suppose:

Model A:
cost = 0.1
P_accept = 0.75

Model B:
cost = 0.5
P_accept = 0.90

Model C:
cost = 3.0
P_accept = 0.97

Do not automatically choose C.

Compare:

A → B → C

against:

B → C

against:

C immediately.

Include:

- retry cost;
- handoff;
- review;
- latency;
- deadline;
- probability of escaped defects.

---

# 27. Weights

Every retained factor should eventually have a measured degree of influence.

However, avoid one permanent global weight table.

Research:

w_i =
f(
 task class,
 role,
 verification,
 risk,
 local evidence
)

For every factor determine:

- main effect;
- interactions;
- nonlinearities;
- thresholds;
- confidence in its weight.

---

# 28. Search for additional variables

Researchers MUST actively search for factors not listed here.

Explore literature on:

- LLM routing;
- cascade models;
- mixture-of-experts routing;
- speculative execution;
- adaptive compute;
- selective prediction;
- cost-sensitive classification;
- contextual bandits;
- active learning;
- dynamic algorithm selection;
- portfolio scheduling;
- empirical software engineering.

Look for mechanisms already proven in other domains.

---

# 29. Avoid useless complexity

For every metric ask:

> If this metric changed, could the optimal routing decision realistically change?

If not:

remove it from live routing.

It may remain in inventory/telemetry.

The goal is not maximum data collection.

The goal is maximum decision quality per unit of measurement complexity.

---

# 30. Outcome-based learning

After every task, compare:

predicted:
- P_accept;
- cost;
- time;
- required capability;

against actual:

- accepted first pass?
- repair needed?
- escalation needed?
- final cost;
- final time;
- reviewer findings;
- escaped defects.

Use prediction error to recalibrate the resolver.

---

# 31. Exploration vs exploitation

The resolver should eventually balance:

EXPLOITATION:
use the currently known cheapest reliable executor

and:

EXPLORATION:
occasionally test whether an even cheaper executor can succeed.

Research safe exploration strategies.

Exploration should preferably occur where:

- task is reversible;
- strong deterministic validation exists;
- failure cost is low;
- deadline permits retry.

---

# 32. Shadow-mode exploration

For higher-risk tasks, investigate:

primary executor performs real work

while:

cheaper candidate independently attempts the same task in shadow mode

without affecting the result.

This can collect evidence about the lower boundary without risking production quality.

Determine when the extra cost is justified.

---

# 33. Required experiments

Design experiments comparing at least:

### Strategy 1
Current tier-first routing.

### Strategy 2
Strong-first.

### Strategy 3
Cheapest-qualified-first.

### Strategy 4
Predicted-optimum.

### Strategy 5
One-step-below predicted optimum with escalation.

Measure:

- final acceptance rate;
- escaped defect rate;
- total dollars;
- total tokens;
- wall time;
- number of model calls;
- escalations;
- repairs;
- reviewer cost;
- human intervention.

---

# 34. Important metric: regret

Investigate routing regret.

For completed task T:

RegretCost =
ActualTotalCost
-
LowestObservedCostThatWouldHaveSucceeded

and similarly:

RegretTime.

This can quantify how much resource the resolver wasted through overqualification.

Also measure the opposite:

UnderqualificationPenalty =
extra cost/time caused by starting too low.

This directly captures the trade-off under investigation.

---

# 35. Required output

Produce:

`EXECUTOR-SELECTION-FORMULA-RESEARCH.md`

containing:

1. formal decision problem;
2. bottom-up escalation analysis;
3. strong-first vs cheap-first evidence;
4. candidate task-model fit functions;
5. benchmark-transfer model;
6. context-volume treatment;
7. speed model;
8. cost model;
9. scarcity model;
10. determinism treatment;
11. specification-quality treatment;
12. verification treatment;
13. risk treatment;
14. hard filters;
15. retained routing features;
16. rejected routing features;
17. factor interactions;
18. formula alternatives;
19. recommended MVP formula;
20. recommended mature formula;
21. escalation-chain optimizer;
22. lower-bound exploration policy;
23. shadow exploration policy;
24. calibration mechanism;
25. telemetry requirements;
26. validation experiment;
27. rollback criteria;
28. unresolved questions;
29. technical debt.

---

# 36. Mandatory final comparison table

| Formula / Policy | Quality | Expected cost | Expected time | Data need | Explainability | Exploration support | Main failure mode |
|---|---:|---:|---:|---:|---:|---:|---|

Do not select a winner without supporting evidence.

---

# 37. MVP requirement

The final recommendation MUST contain a version that can be implemented without machine learning.

Prefer:

- transparent;
- inspectable;
- deterministic where possible;
- small;
- measurable;
- recalibratable.

Do not require hundreds of historical observations before the system becomes useful.

---

# 38. Mature-system direction

Separately describe what becomes possible after sufficient telemetry exists:

- calibrated probability models;
- dynamic task clusters;
- learned feature weights;
- contextual bandit;
- automatic lower-bound exploration;
- route-specific success models;
- model-version decay;
- Bayesian updating.

These are future stages, not MVP requirements.

---

# 39. Falsification criteria

Explicitly identify evidence that would falsify:

> "bottom-up escalation is economically superior."

Examples might include:

- rework consistently dominates model-price savings;
- cheap-first significantly increases escaped semantic defects;
- handoff destroys too much context;
- task classification is too inaccurate;
- strong models reduce total completion time enough to dominate price differences.

If only certain task classes falsify the hypothesis, identify those classes rather than rejecting the whole approach.

---

# 40. Final question

The research must ultimately answer:

> Given a characterized software-engineering task and a set of available model+effort+route candidates, what execution policy is expected to achieve an acceptable result with the minimum total resources, and how confidently do we know that?

The answer may be:

one model

or:

a bottom-up escalation chain.

The objective is minimum sufficient intelligence, not maximum available intelligence.
```

### Один момент я бы особенно сохранил

У вас возникает не просто **model selector**, а потенциально **optimizer всей цепочки исполнения**:

```text
не:
TASK → MODEL

а:

TASK
 ↓
candidate models
 ↓
possible escalation paths
 ↓
calculate expected total cost/time of each path
 ↓
choose cheapest rational POLICY
```

Например, система может обнаружить, что:

```text
DeepSeek → Gemini → Opus
```

имеет ожидаемую стоимость `$0.42` и 14 минут,

а:

```text
Opus immediately
```

— `$2.70` и 9 минут.

Тогда при обычной фоновой задаче берём первый путь. При срочной — второй. **То есть объект оптимизации — уже не модель, а стратегия прохождения задачи.**

И ваша идея «немного прижать снизу, чтобы найти реальную границу» тоже сюда очень хорошо встраивается. Я бы назвал это **controlled lower-bound exploration**: система понемногу исследует, насколько дешёвого исполнителя она может использовать, но только там, где ошибка обнаружима и обратима.

Это, по-моему, уже существенно сильнее нынешней концепции `T1–T9 → model`. Здесь `T1–T9` постепенно могут вообще перестать быть центральной сущностью и остаться разве что грубым safety prior.
