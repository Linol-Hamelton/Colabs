
# COLABS VALIDATOR MIGRATION COUNCIL

## Research, architecture decision and implementation plan

## NO IMPLEMENTATION IN THIS RUN

You are the coordinator and final synthesiser of a high-risk Colabs kernel research cycle.

Your job is NOT to rewrite the validator.

Your job is to determine, from repository evidence and independent adversarial analysis:

1. whether the validator migration should be executed now;
2. what exactly should and should not be migrated;
3. what behavioural contract must remain invariant;
4. what target architecture is sufficient;
5. how equivalence with the existing validator can be demonstrated;
6. how the migration should be decomposed among agents;
7. what acceptance, rollback and certification criteria are required;
8. which questions genuinely require the human owner;
9. which decisions are already settled and MUST NOT be asked again.

The final output must be sufficiently precise that,
after owner approval,
implementation can begin without reopening architecture questions
that this research should have settled.

This is a RESEARCH / DECISION-DESIGN run.

DO NOT IMPLEMENT THE NEW VALIDATOR.

---

# 0. FUNDAMENTAL PRINCIPLE

The following is explicitly prohibited:

"PowerShell is slow → rewrite everything in Node."

The council must establish the causal chain:

MEASURED PROBLEM
→ ROOT CAUSE
→ EXISTING BINDING DECISIONS
→ REQUIRED PROPERTIES
→ MINIMUM SUFFICIENT ARCHITECTURAL CHANGE
→ MIGRATION STRATEGY
→ VERIFICATION STRATEGY
→ IMPLEMENTATION DAG
→ CERTIFICATION
→ OWNER DECISION.

Do not solve a broader problem than the evidence justifies.

Do not preserve an inefficient mechanism merely because it already exists.

Do not replace a mechanism merely because another technology appears cleaner.

---

# 1. OWNER / AUTHORITY MODEL

The owner decides policy.

Agents resolve everything already deterministically or explicitly delegated.

Do NOT ask the owner to reconfirm:

- an accepted decision;
- a consequence uniquely implied by an accepted decision;
- an active procedure;
- an already delegated local choice;
- a deterministic transition;
- an implementation detail whose choice has already been delegated.

Ask the owner only if research leaves:

- a genuinely new policy decision;
- a required authority expansion;
- an unresolved conflict between binding sources;
- multiple materially different architectures with real trade-offs;
- a proposed reopening of an accepted decision;
- a previously unauthorised irreversible action;
- an UNKNOWN that materially changes architecture.

"Obvious", "rational", "equivalent", "surely intended"
or similar LLM judgement is NOT deterministic authority.

Before producing OWNER QUESTIONS,
try to resolve each question from:

binding decisions
→ active procedures
→ repository evidence
→ deterministic derivation
→ delegated judgement.

Only unresolved policy choices reach the owner.

---

# 2. FREEZE THE SUBJECT

The branch may continue moving during this research.

At start:

1. run:

   git rev-parse HEAD
2. record:

   BASELINE_SHA=<full sha></full>
3. all analysis refers to this BASELINE_SHA;
4. create/use an isolated research worktree if needed;
5. do not silently follow newer HEAD;
6. later commits may be recorded only as:

   POST-BASELINE OBSERVATION
7. a material post-baseline change does not silently alter conclusions.

Every report must state:

Baseline-SHA:
Model:
Model-maker:
Client:
Effort:
Task-frame / scope-id:
UTC-date:

---

# 3. RESEARCH WRITE SCOPE

Research may write only:

docs/research/<DATE></date>-validator-migration-council/**

plus:

the participant's own journal
and protocol-required runtime state.

No validator code changes.

No kernel changes.

No production code changes.

No installer changes.

No behavioural changes.

No commit/tag/push unless an already binding Colabs procedure
explicitly requires it for this research frame.

The research result is advisory until owner approval.

---

# 4. COMPUTE WHAT IS ALREADY DECIDED

This step is mandatory and occurs BEFORE proposing architectures.

Build:

DECISION-BOUNDARY.md

Classify every relevant issue as exactly one of:

A. ALREADY DECIDED
B. ACTIVE TRIAL
C. APPROVED DIRECTION, IMPLEMENTATION OPEN
D. OPEN ARCHITECTURAL QUESTION
E. IMPLEMENTATION DETAIL ALREADY DELEGATED
F. REOPEN WOULD BE REQUIRED
G. SOURCE CONFLICT
H. UNKNOWN

At minimum inspect all decisions concerning:

- validator implementation/runtime;
- v2 timing;
- CORE-ARCH exceptions;
- certification of protocol-core changes;
- independent certification;
- differential verification;
- PowerShell compatibility;
- Node/runtime requirements;
- cloud execution;
- Evidence / protocol-handoff;
- quick vs full validation;
- scope and permissions;
- current research execution rules.

Do NOT treat a proposal as a decision.

Do NOT reopen accepted decisions merely because another design
would be aesthetically preferable.

If an accepted decision already says that the validation engine
moves to Node in v2, then "Node or not Node?" is not an open question
unless a valid reopen trigger exists.

The real question may instead be:

"When?"
"How?"
"Which boundaries?"
"What remains PowerShell-specific?"
"How is equivalence proven?"
"How is the TCB migrated safely?"

---

# 5. REQUIRED SOURCE CORPUS

Start from repository inventory.

Do not rely on model memory.

At minimum inspect:

.ai/DECISIONS.md
.ai/TASK.md
.ai/PLAN.md

AGENTS.md

.ai/docs/PROTOCOL.md
.ai/docs/CLI-AGENTS.md
.ai/docs/PAIRED-CYCLE.md

protocol-manifest.json

validate-protocol.ps1
test-protocol.ps1

.ai/bin/protocol-handoff.cjs
.ai/bin/protocol-archive.cjs
all validator-related .ai/bin modules

tests/validator.test.cjs
all validator / handoff / installer tests

setup-ai-protocol.ps1

docs/specs/2026-09-23-executable-rulebook-spec.md

docs/core-arch/CORE-ARCH-*.md
docs/core-arch/stage-1/**
docs/core-arch/stage-2/**
docs/core-arch/stage-4/**

docs/core-arch/PROPOSAL-node-validator.md

relevant current reviews

relevant journals / Evidence blocks containing
validator and suite measurements.

Find all additional code paths which:

- invoke validate-protocol.ps1;
- duplicate validator behaviour;
- depend on its exact output;
- depend on its exit codes;
- parse PASS/WARN/FAIL;
- perform overlapping validation;
- call PowerShell merely to reach validation logic.

Produce:

VALIDATOR-CALL-GRAPH.md

and:

VALIDATOR-CONTRACT-MAP.md

---

# 6. DO NOT REPEAT EXPENSIVE MEASUREMENTS WITHOUT NEED

Existing empirical measurements are evidence.

First locate and assess them.

Only repeat a benchmark when:

- the current baseline materially differs;
- the measurement is missing;
- its methodology is invalid;
- freshness matters to the decision;
- independent reproduction is necessary.

Research agents use:

protocol-handoff record --quick

where current procedure permits it.

Do NOT launch full test-protocol.ps1 concurrently from several researchers.

If a full suite must be rerun:

- justify why;
- run at most one full suite simultaneously on this workstation;
- record wall time, CPU, RAM and result;
- reuse the result across the research corpus.

Do not turn research itself into the performance bottleneck.

---

# 7. START WITH THE BEHAVIOURAL CONTRACT

Before discussing implementation architecture,
derive the current validator's observable contract.

For every behaviour determine:

INPUT
STATE/PRECONDITION
EXPECTED CHECK
EXPECTED OUTPUT CLASS
EXPECTED EXIT CODE
SIDE EFFECTS
CALLERS DEPENDING ON IT
SOURCE OF AUTHORITY.

At minimum cover:

- manifest validation;
- required-file validation;
- source vs installed role;
- Git worktree validation;
- tracked/untracked enumeration;
- protocol-owned files;
- encoding;
- BOM;
- UTF-8;
- CR/LF;
- PowerShell syntax;
- safe paths;
- symlink / reparse behaviour;
- journal limits;
- review corpus limits;
- decisions;
- supersedes;
- gates;
- evidence;
- review/certification semantics;
- protected paths;
- any environment-dependent behaviour.

Distinguish:

NORMATIVE BEHAVIOUR

from:

ACCIDENTAL CURRENT IMPLEMENTATION BEHAVIOUR.

Do not preserve bugs merely for byte-for-byte parity.

But a behavioural difference cannot be silently introduced either.

If current behaviour appears wrong:

classify it separately as:

CURRENT DEFECT

and determine whether fixing it during migration
would confound equivalence testing.

---

# 8. ROOT-CAUSE PERFORMANCE ANALYSIS

Answer from measured evidence:

1. What consumes the current wall time?
2. What fraction comes from:
   - PowerShell process startup;
   - validator computation;
   - repeated process spawning;
   - serial tests;
   - Git;
   - filesystem IO;
   - installer tests;
   - other components?
3. What is the critical path?
4. What happens under 2, 3, 6 and 8 concurrent agents?
5. Is RAM, CPU, process count or IO the binding resource?
6. What benefit comes specifically from:
   - Node CLI instead of PowerShell CLI;
   - in-process validate();
   - test splitting;
   - eliminating duplicate validators;
   - caching;
   - reducing full-suite frequency?
7. Which changes give most benefit independently of a rewrite?

No pseudo-precision.

Reuse existing measurements where sufficient.

---

# 9. CENTRAL ARCHITECTURAL QUESTION

The council must test, not assume:

> Is the minimum sufficient v2 architecture a Node validation core
> exposed both as an in-process library and a stable CLI,
> with PowerShell retained only as a compatibility wrapper
> and for genuinely PowerShell-specific syntax validation?

Compare that against credible alternatives.

At minimum:

A. Keep current PowerShell engine and optimise tests.

B. Node engine + compatibility PowerShell wrapper.

C. Node engine while keeping both complete engines for longer.

D. Split validator into language-neutral core +
   platform-specific checks.

E. Another architecture, only if evidence provides a reason.

For each:

Correctness
Behavioural compatibility
Migration risk
TCB size
Cloud compatibility
Windows compatibility
Performance
Testability
Maintainability
Duplication
Rollback
Review burden
Context complexity
Long-term cost.

Do not invent an alternative merely to fill the table.

---

# 10. TCB / SELF-HOSTING QUESTION

Treat the validator as part of the Trusted Computing Base
if repository evidence supports that classification.

Answer explicitly:

> How do we safely replace machinery that participates
> in deciding whether its own replacement is valid?

Evaluate at minimum:

OLD VALIDATOR → NEW VALIDATOR

versus:

OLD + NEW DIFFERENTIAL EXECUTION.

Determine whether migration needs:

- old implementation as oracle;
- differential tests;
- golden fixtures;
- mutation tests;
- independent expected-results fixtures;
- old/new dual execution on real repository state;
- independent certification;
- an N-1 verifier;
- a frozen compatibility layer.

Distinguish:

same implementation agrees with itself

from:

independent evidence of correctness.

---

# 11. DIFFERENTIAL VERIFICATION DESIGN

Design a deterministic parity system.

For each fixture:

INPUT
OLD_RESULT
NEW_RESULT
NORMALISED_OLD
NORMALISED_NEW
EXPECTED_RESULT
DIFF.

Determine what is legitimately normalised:

- paths?
- timestamps?
- ordering?
- runtime-specific messages?
- colours?
- whitespace?

Do NOT normalise away semantically meaningful differences.

Any unexplained semantic difference must FAIL.

Required fixture classes should include:

positive fixtures
negative fixtures
boundary fixtures
malformed files
Git-state variants
path variants
encoding variants
manifest variants
decision/supersede variants
review/gate variants
installed/source variants.

Also determine whether mutation testing is useful:

change implementation so one check is missing
→ differential/expected fixture MUST fail.

---

# 12. POWERHELL-SPECIFIC BOUNDARY

Identify every operation that genuinely requires PowerShell.

Especially examine:

PowerShell parser validation of *.ps1/*.psm1/*.psd1.

For each such behaviour decide:

1. retain PowerShell subprocess;
2. move to another parser;
3. make capability conditional;
4. WARN when unavailable;
5. fail when unavailable;
6. another mechanism.

Do not remove PowerShell-specific validation
merely to achieve "zero PowerShell".

Goal:

minimum necessary platform dependency,

not:

technology purity.

---

# 13. CLOUD / CROSS-PLATFORM CONTRACT

Current validator architecture must be evaluated on at least:

Windows with Windows PowerShell 5.1
Windows with pwsh
environment with Node but no PowerShell
cloud agent
linked git worktree.

Determine:

- what validate() can always perform;
- what needs an optional capability;
- what Evidence can be recorded without PowerShell;
- what constitutes PASS / WARN / BLOCKED if platform capability is absent.

Do not silently weaken validation merely to support cloud execution.

---

# 14. QUICK VS FULL VALIDATION

Investigate the semantics of:

record --quick

versus:

full record / full regression suite.

Determine:

- what --quick proves;
- what it explicitly does NOT prove;
- which task classes may use it;
- when a full suite is mandatory;
- whether research-only changes need a full suite;
- whether multiple agents can safely share one full-suite result;
- freshness requirements of such shared evidence.

Goal:

avoid repeatedly proving properties
that a task cannot have changed,

without weakening required evidence.

---

# 15. PARALLELISM ARCHITECTURE FOR IMPLEMENTATION

The future implementation must NOT be:

N agents editing the same core file.

Design a dependency DAG.

Prefer:

DISCOVERY
↓
FROZEN CONTRACT
↓
FROZEN MODULE BOUNDARIES
↓
PARALLEL NON-OVERLAPPING IMPLEMENTATION
↓
SINGLE INTEGRATOR
↓
DIFFERENTIAL VERIFICATION
↓
INDEPENDENT CERTIFICATION.

Produce:

IMPLEMENTATION-DAG.md

For each future implementation task state:

Task-ID
Goal
Inputs
Owned files
Forbidden files
Interface consumed
Interface produced
Dependencies
Can run in parallel with
Must run after
Acceptance tests
Required model tier
Role
Risk
Rollback.

There must be exactly one owner for each shared integration surface.

Parallelism is permitted only where file/interface ownership is clear.

---

# 16. CANDIDATE MODULE DECOMPOSITION

Research possible decomposition such as:

validator/
    index / public API
    manifest
    repository
    paths
    text
    git
    governance
    decisions
    reviews
    evidence
    platform-specific checks

This is only a candidate.

Derive boundaries from cohesion and tests.

Do NOT fragment the validator into dozens of tiny modules
if that increases cognitive or integration cost.

Prefer the minimum decomposition that:

- permits useful parallel implementation;
- creates clear contracts;
- isolates platform-specific behaviour;
- is directly testable;
- avoids duplicated state reads.

---

# 17. PUBLIC API CONTRACT

Determine whether the Node core should expose something like:

validate(root, options)

and if so specify:

arguments
return value
diagnostic representation
exit-code mapping
streaming vs returned results
quiet mode
environment handling
pure vs impure boundaries
filesystem abstraction if needed
Git invocation abstraction if needed.

Also determine CLI contract.

Existing documented commands should keep working
unless an approved decision explicitly changes them.

---

# 18. PERFORMANCE TARGETS

Do not choose targets merely because they sound good.

Use current measurements to establish baseline.

Define at minimum:

validator real-tree wall time
full suite wall time
PowerShell process count
total child process count
parallel-agent behaviour
memory use
cloud/no-PowerShell ability
differential mismatch count.

For each target:

BASELINE
TARGET
WHY TARGET MATTERS
MEASUREMENT METHOD
FAIL THRESHOLD.

Separate:

required acceptance threshold

from:

stretch optimisation target.

---

# 19. MIGRATION PHASES

Produce a staged migration.

Evaluate a sequence similar to:

PHASE 0
freeze behavioural contract and fixtures

PHASE 1
implement Node core beside old engine

PHASE 2
differential test both engines

PHASE 3
switch in-process callers to Node

PHASE 4
PowerShell becomes compatibility wrapper

PHASE 5
observe certification / real usage

PHASE 6
retire duplicated old logic

but alter it if evidence justifies a better sequence.

For every phase:

entry criteria
allowed changes
exit criteria
rollback point
old/new source of truth
verification
certification requirement.

At no point may both engines silently diverge.

---

# 20. ROLLBACK

Design rollback before implementation.

Answer:

- What is the last known-good implementation?
- Can wrapper routing return to old engine?
- Which commits/phases are independently reversible?
- How are artifacts produced by new validator treated after rollback?
- Is any schema migration involved?
- Can rollback occur without changing user commands?

If a phase is not safely reversible,
state why and require explicit authority before crossing it.

---

# 21. WHAT NOT TO MIGRATE YET

The council MUST produce:

NOT-IN-SCOPE.md

Evaluate separately:

setup-ai-protocol.ps1
full test-protocol.ps1 orchestration
launcher process inspection
other PowerShell scripts
Rust rewrite
MCP integration
AX integration
general build-system rewrite.

For each:

NOW
LATER
NEVER / NO EVIDENCE

with reason.

Do not expand the validator migration
into a general infrastructure rewrite.

---

# 22. ROUND 1 — THREE INDEPENDENT RESEARCHERS

Use three independent participants,
preferably different model makers as current Colabs procedure requires.

Select through P-L2-002 / current model policy.

They work independently and do not read each other's reports
before freezing their own.

## Researcher A — SEMANTICS / CONTRACT / TCB

Focus:

- binding decisions;
- behavioural contract;
- source of truth;
- TCB/self-update;
- parity;
- certification;
- rollback;
- hidden semantic dependencies.

Output:

round1/A-contract-tcb.md

## Researcher B — PERFORMANCE / TEST ARCHITECTURE / MIGRATION

Focus:

- measurements;
- root cause;
- process explosion;
- in-process API;
- quick/full validation;
- test decomposition;
- implementation DAG;
- migration phases.

Output:

round1/B-performance-migration.md

## Researcher C — ADVERSARIAL / SIMPLIFIER

Goal:

try to falsify the migration plan.

Questions:

- Is migration now actually necessary?
- Can 80–90% of the benefit be obtained more simply?
- What could the new validator silently stop checking?
- Where can differential parity give false confidence?
- What does cloud compatibility accidentally weaken?
- What is over-engineered?
- What should NOT be changed?
- What common-mode failure affects both old and new tests?

Output:

round1/C-adversarial-simplifier.md

Each report must distinguish:

FACT
INFERENCE
HYPOTHESIS
OPEN QUESTION.

Repository FACTS require path:line evidence.

---

# 23. ROUND 2 — CROSS-CHALLENGE

Each Round-1 report is challenged by another participant/model family.

No one challenges their own report.

For every major proposal ask:

1. Is the claimed problem measured?
2. Is it causal or merely correlated?
3. Is the proposed change necessary?
4. Is a simpler solution sufficient?
5. Does an accepted decision already settle this?
6. Does this accidentally reopen a decision?
7. What semantic behaviour could be lost?
8. How can the migration fail silently?
9. Is differential verification sufficient?
10. Could old and new share the same incorrect assumption?
11. Is rollback actually possible?
12. Does the decomposition create integration risk?
13. Is the owner being asked something machines can settle?
14. Is the model deciding something only the owner may decide?
15. What evidence would falsify the recommendation?

Outputs:

round2/challenge-A.md
round2/challenge-B.md
round2/challenge-C.md

Then produce a neutral:

round2/ISSUE-MATRIX.md

Do not collapse disagreements yet.

---

# 24. ROUND 3 — INDEPENDENT SYNTHESES

Follow the current Colabs kernel-research procedure.

Produce three independent syntheses,
without reading each other's synthesis before freezing it.

Each receives the same immutable Round-1 + Round-2 corpus.

Outputs:

round3/synthesis-A.md
round3/synthesis-B.md
round3/synthesis-C.md

Each must answer:

1. migrate now or preserve current timing?
2. exact migration scope;
3. behavioural contract;
4. target architecture;
5. PowerShell boundary;
6. Node API;
7. differential strategy;
8. quick/full strategy;
9. implementation DAG;
10. rollback;
11. acceptance metrics;
12. certification;
13. genuine owner decisions;
14. explicitly rejected alternatives.

---

# 25. DRAFT DECISION

The coordinator/drafter now reads all three syntheses.

Use the currently ranked Anthropic flagship
at the highest appropriate effort under P-L2-002.

Produce:

draft-decision.md

For every decision point:

ISSUE
SYNTHESIS A
SYNTHESIS B
SYNTHESIS C
AGREEMENT
DIVERGENCE
EVIDENCE
PROPOSED RESOLUTION
WHY
WHAT WOULD FALSIFY IT.

Do not hide minority objections.

Draft ≠ accepted decision.

---

# 26. TWO INDEPENDENT CRITIQUES

Two critics independent of the drafter
review draft-decision.md.

They do not read each other's critique first.

Critic 1 emphasis:

CORRECTNESS / TCB / SECURITY / CERTIFICATION.

Critic 2 emphasis:

SIMPLICITY / PERFORMANCE / IMPLEMENTABILITY / OVER-ENGINEERING.

For every draft point use:

AGREE
PARTLY AGREE
DISAGREE
UNKNOWN

and provide evidence.

Outputs:

critique-A.md
critique-B.md

---

# 27. FINAL SYNTHESIS

The flagship Claude acts as final synthesiser.

Read:

all Round 1
all Round 2
all Round 3
draft decision
both critiques.

For every critic finding explicitly state:

ACCEPTED
or
REJECTED + evidence/reason
or
OWNER DECISION REQUIRED.

Produce:

final-plan.md

The goal is not compromise.

The goal is the strongest solution supported by evidence.

A critic can be rejected.

A majority can be wrong.

Reproduction and evidence outrank vote count.

---

# 28. REQUIRED FINAL PLAN

final-plan.md must contain exactly these major sections:

## A. Executive conclusion

## B. What is already binding

## C. Measured current bottleneck

## D. Root cause

## E. Should migration happen now?

## F. Exact migration scope

## G. Explicit non-scope

## H. Current behavioural contract

## I. Target architecture

## J. Public Node API

## K. PowerShell compatibility boundary

## L. Differential verification architecture

## M. Test architecture

## N. quick vs full validation policy

## O. Cloud / no-PowerShell behaviour

## P. TCB/self-update safety

## Q. Migration phases

## R. Rollback plan

## S. Parallel implementation DAG

## T. File/module ownership map

## U. Acceptance criteria

## V. Performance targets

## W. Certification plan

## X. Risks and residual risks

## Y. Rejected alternatives

## Z. Decisions already delegated / no owner question needed

## AA. Genuine owner decisions

## AB. Proposed decision block

## AC. Exact implementation launch conditions

---

# 29. REQUIRED OWNER-QUESTION FILTER

Before placing anything in section AA,
apply this test:

Can repository evidence answer it?
→ do not ask owner.

Can an accepted decision answer it?
→ do not ask owner.

Can an active procedure answer it?
→ do not ask owner.

Can deterministic measurement answer it?
→ measure instead.

Has the choice already been delegated?
→ delegatee decides and records basis.

Is one option strictly dominated
with no policy/value trade-off?
→ do not manufacture a poll.

Only unresolved authority/policy/trade-off questions remain.

Target:

as few owner questions as correctness permits.

Zero owner questions is valid.

---

# 30. PROPOSED IMPLEMENTATION TASK PACKETS

Even though no implementation happens now,
final-plan.md must make the future execution concrete.

For every future agent task specify:

TASK-ID
ROLE
GOAL
NON-GOALS
BASELINE
INPUTS
OWNED PATHS
FORBIDDEN PATHS
DEPENDENCIES
EXPECTED OUTPUT
ACCEPTANCE
TESTS
RISK
MODEL TIER
CAN RUN IN PARALLEL WITH
MUST WAIT FOR
HANDOFF TO.

The implementation plan should be executable
without asking "who edits what?" after owner approval.

---

# 31. ANTI-BIG-BANG RULE

The final plan must explicitly reject a migration architecture
where several implementers simultaneously modify
the same shared core files without ownership boundaries.

Preferred pattern:

independent modules
+
frozen interfaces
+
one integrator
+
differential verification.

If the council concludes that parallel implementation
would create more coordination cost than benefit,
it must say so and reduce parallelism.

Swarm size is not a success metric.

Correct certified result per unit cost/time is.

---

# 32. SUCCESS CRITERIA FOR THIS RESEARCH

Research succeeds only if it produces:

1. an evidence-backed decision boundary;
2. a complete behavioural contract;
3. a root-cause performance explanation;
4. a justified target architecture;
5. a TCB-safe migration strategy;
6. deterministic differential verification;
7. a rollback path;
8. a concrete implementation DAG;
9. measurable acceptance criteria;
10. an independent adversarial challenge;
11. explicit rejected alternatives;
12. minimal owner questions;
13. no implementation performed prematurely.

The research fails if it ends with:

"rewrite in Node because it is faster"

or:

"let the implementer decide the architecture later."

---

# 33. FINAL RULE

Do not optimise for producing a migration.

Optimise for determining whether the migration,
its timing, its boundaries and its architecture
are actually justified.

The acceptable final result may be:

MIGRATE NOW

MIGRATE PARTIALLY NOW

KEEP CURRENT TIMING

OPTIMISE WITHOUT MIGRATION

or another evidence-supported outcome,

subject to existing binding decisions
and valid reopen rules.

Nothing becomes binding until owner approval.
