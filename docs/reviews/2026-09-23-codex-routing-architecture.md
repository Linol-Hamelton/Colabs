# Codex - Adaptive provider routing and continuous coordination

**Date**: 2026-09-23 UTC
**Reviewed commit**: 82bf99a8e2bfcde3ff375b9995f3ab45edb7ddc5
**Working tree**: dirty; concurrent 0046 remediation/governance and staged archival
**Reviewer**: Codex (GPT-6), session codex-8e80a2ebf8f9bb8c
**Scope**: architecture, owner-requested discussion of thirteen directions
**scope-check**: PASS
**Verdict**: RECOMMENDATION
**Mode**: ADVISORY
**Receipt-Owner**: codex-8e80a2ebf8f9bb8c
**Receipt**: own worklog, protocol-handoff.cjs record

## Executive recommendation

Build a small durable dispatcher around existing CLI clients, a versioned routing policy, and capability-aware adapters. DeepSeek/Kilo is the initial planning coordinator; restart,
quota accounting, task ownership and enforcement belong to deterministic code. Optimize time to independently accepted result within a money ceiling and quality constraints.
Start with one complete workflow and failover exercise; avoid thirteen parallel projects. Everything below is Proposed unless explicitly identified as existing policy.

## Evidence and boundaries

Read AGENTS/TASK, status/log/inventory, recent journals, CLI-AGENTS, relevant PLAN policy, PROTO-DEC-0041/0043/0045/0046, historical research and its evidence.json. Inventory includes
the unchanged 97 KB historical dataset and 52 KB architecture analysis; the dataset was inspected rather than omitted because it is absent from git diff. Candidate code stays untouched.
Historical snapshot 2026-09-20: 170 review Markdown files, 108 verdict fields, 103 reviewer fields, 62 mode fields. Its extractor explicitly is NOT a model-ranking estimator.
Missing reliable candidate identity, task denominator, exact models, efforts and cycle costs prevent a defensible domain leaderboard today. More reports do not fix this.
The recent F-001/F-C01 chain is direct evidence that green tests and confident reviewers can miss the same input-contract problem. Score confirmed findings, not FAIL frequency.

Existing constraints: 0041 requires two independent parallel certifiers for high risk; 0043 dispatch transfers no authority; 0045 permits only offline Jev replay, no gate role;
0046 assigns DeepSeek coordination, Gemini implementation, Codex plus uninvolved Claude certification for that candidate. This discussion changes none of those assignments.
Implementation, persistent orchestration/telemetry and changed caps need a bounded owner decision addressing 0039's freeze and applicable policy. Do not interpret discussion as approval.

## Coverage of the thirteen directions

| # | Proposed mechanism | Acceptance observation |
|---|---|---|
| 1 | Route each task phase by domain, role, difficulty, risk and available qualified pool | Record selected route and rejected alternatives |
| 2 | Competence matrix per exact model, harness, domain and role; external evidence is a prior | Adjudicated local outcomes and sample counts |
| 3 | Small/balanced/frontier tiers mapped separately per provider | Actual resolved model recorded, not just alias |
| 4 | Effort profiles with supported per-model settings | Requested and applied effort distinguishable |
| 5 | Failure taxonomy and one root-cause attempt ledger across providers | Swapping provider never resets attempts |
| 6 | Optional Jev advisory prediction on bounded outcomes | Held-out calibration and measured net time benefit |
| 7 | DeepSeek planner plus durable queue/supervisor and checkpoints | Resume after extension/worker loss without duplicate work |
| 8 | Task-level total cost and quota reserve for scarce roles | Quality maintained; mandatory review still affordable |
| 9 | Estimate exhaustion window and finish scarce-role dependencies early | Handoff precedes unavailable period |
| 10 | Quality constraints, then elapsed time, then cost within ceiling | Time includes retries, review and human waiting |
| 11 | Three qualified candidates per role/domain plus conflict checks | Deputy inherits packet and remaining budget |
| 12 | Structured run events and periodic evidence-based re-ranking | Every rating traceable to comparable outcomes |
| 13 | Separate active context, retained history and machine events | Capacity does not force live-session archival |

## Architecture and execution contract

Flow: approved task -> dependency queue -> eligibility filter -> route -> bounded worker
-> deterministic checks -> independent review -> integration/closure -> next approved task.
The LLM proposes task decomposition and diagnoses ambiguity; code checks scope, budgets, ownership, dependencies and independence. If a filter fails, no clever model may override it.
Persist task ID, approval/policy version, baseline and candidate hashes, scope, dependencies, acceptance checks, role assignments, exact model/harness/effort, attempts and remaining budgets.
Use states ready/running/checking/review/accepted/blocked, with an explicit failure reason. External-effect retries need idempotency/reconciliation; CLI exit 0 is never proof of completion.
Give each worker its own session/journal/worktree; serialize shared metadata/integration. Supervisor recovery must confirm worker termination or fence an old writer before replacement;
a timeout alone is not proof it stopped. Checkpoint diff and tests before provider handoff. Persist durable task/approval history in the repository. Disposable runtime indexes may be
rebuilt; they cannot be the sole plan, result or ownership record. Define event storage and receipt scope explicitly so live telemetry does not perpetually stale candidate evidence.
Use explicit session IDs, not global `--last`/`--continue`, in automated concurrent dispatch. Provider change starts from a compact transfer packet: facts, open hypotheses, changes,
commands/results, constraints and next action. Do not transplant hidden reasoning or a whole unbounded transcript. Context handoff cost belongs in the routing decision.
The coordinator may implement separate tasks; those require independent acceptance. Reserve certifiers BEFORE assigning implementers/controllers so the roster remains feasible.
Stop on completed approved queue, exhausted budget, no qualified route, permission requirement, or no progress. A blocked task need not stop independent already-approved queue items.

## Routing objective, model tiers and effort

Eligibility first: authorization, capabilities, domain competence, context fit, privacy, independence, account entitlement, availability, quota reserve and hard money ceiling.
Among eligible routes minimize expected time to accepted completion, including queue delay, handoff, generation, tests, review and rework; use money to break near-equivalent time choices.
This implements the owner's time-over-money preference without implying unlimited spend. Unknown success estimates use conservative qualification rules, not fabricated percentages.

| Task class | Initial route hypothesis | Escalation |
|---|---|---|
| Mechanical bounded operation | Deterministic tool; small model only if interpretation needed | Standard model on genuine ambiguity |
| Local change with clear checks | Qualified balanced model, normal effort | Stronger effort OR model after diagnosis |
| Multi-component debugging/research | Strong model, high effort, staged evidence gathering | Different qualified specialist on missing progress |
| Architecture/security/data/core | Qualified frontier specialist, high effort | Max effort only for an identified reasoning need; full independent review |

Risk and difficulty are distinct. A one-line security change is not automatically a cheap task. Evaluate (model, effort, harness, domain, role) as the unit; effort names are not comparable
between providers. Do not silently coerce unsupported effort to maximum or default. Pin resolved model IDs for accepted runs; aliases/auto routers can change behind stable names.
Record a fallback's actual model. Keep a route stable within a coherent step unless a trigger justifies switching; per-message provider churn can lose cache, context and accountability.

## Local capability inspection and external checks

Read-only `--help` succeeded for codex, claude, agy, copilot and vibe; no inference was launched. Installed Kilo extension directory/package identifies version 7.7.7. Documentation can describe
features not verified in that installation; no claim of configured operational failover is made.

| Client | Observed controls | Remaining verification |
|---|---|---|
| Codex | --model, config overrides, --json, output schema, explicit worktree/root | Entitled models, applied effort and quota source |
| Claude | --model, --effort, --fallback-model, print/background interfaces | Applied caps, entitlement and cost/usage fields |
| agy | --model, --effort low/medium/high, print timeout, JSON/stream output | Resolve live account catalog; docs roster is dated 2026-09-22 |
| Copilot | --model, --reasoning-effort, --auto-tier, --max-ai-credits, usage JSON file | Organization policy and actual underlying model |
| Vibe | --agent, max turns/price/tokens, worktree, streaming | Model via profile/config; no universal effort flag verified |
| DeepSeek/Kilo | Existing coordinator channel; Kilo package installed | Reliable lifecycle, resume, usage and effort telemetry in this version |

[Codex configuration](https://learn.chatgpt.com/docs/config-file/config-reference) documents model-specific reasoning levels and Responses-only custom provider protocol. Do not reuse
Codex as a generic DeepSeek adapter; repository CLI-AGENTS records its failed compatibility probe. [Claude configuration](https://code.claude.com/docs/en/model-config) documents per-model effort
and administrative caps, including silent clamping in structured/background output: requested effort is not proof of applied effort. Capture what is observable, otherwise mark unknown.
[Kilo Auto Model](https://kilo.ai/docs/code-with-ai/agents/auto-model) already offers routing tiers and exact model/thinking-variant pools. Its underlying choices can change. This may supply an
optional worker router; it does not establish cross-CLI subscription accounting or repository certification independence. Avoid competing outer and inner routers making opaque choices.

## Competence, reputation and three-deep succession

Keep expert (diagnosis/decision), implementer (correct change), researcher (source/evidence), reviewer (independent defect detection), and coordinator (throughput/ownership) separate.
Domains start with protocol/governance, application code, infrastructure/security, and research. Provider is not the unit of competence: Claude via Copilot and Claude Code can share a model
but differ in tools, context and quota. They are not automatically diverse expert opinions. Rank using independently adjudicated outcomes on comparable candidate/difficulty/risk strata:
first-pass acceptance, escaped defects, confirmed-finding precision, unsupported claims, elapsed-to-acceptance and owner interventions. Include successes, failures and censored runs.
Separate model mistakes from flawed prompts, missing inputs, tooling failures and auth outages. Use shrinkage/uncertainty intervals and model-version aging; no permanent winner from n=2.
Prior evidence order: matched local trials; reproducible external domain evaluations; dated provider capability claims; community reports as hypotheses. Do not invent weighted scores.
[SWE-bench](https://www.swebench.com/) separates model and agent and offers common-harness comparisons; its rankings cannot establish protocol-audit or product-specific competence here.
Community reports should carry version, environment, task and reproduction; popularity is not correctness. No exhaustive community survey or historical error re-annotation was completed
in this discussion, so the following is a provisional selection order, not a measured ranking.

| Role/domain seed | First | Second | Third | Basis/limit |
|---|---|---|---|---|
| Coordination | DeepSeek/Kilo | Claude | Codex | Owner preference plus existing role experience |
| Protocol diagnosis/expertise | Codex | Claude | DeepSeek | Reproduced local findings; no comparative rate |
| Bounded implementation | Gemini | Codex | Claude | Existing dispatch experience; acceptance tests mandatory |
| Research/synthesis | Claude | Gemini | Codex | Trial pool; source-quality comparison still needed |
| Independent review | Codex | Uninvolved Claude | Qualified DeepSeek | Remove anyone who controlled the candidate |

For security/platform/language specialties, rank remains UNQUALIFIED until a relevant sample is reviewed. Mistral, Copilot's resolved models and other providers enter qualification, not
automatic exclusion. If fewer than two eligible high-risk certifiers remain, stop that task; three names on a role card cannot manufacture independent capability. Prefer deputies with
different quota/failure domains when competence is comparable. Re-evaluate on version change.

## Failure policy and finite budgets

Classify failure before spending another run. Network/rate-limit -> bounded transport retry with provider reset/backoff, then eligible failover. Authorization/policy denial -> blocked
route, never a permissions bypass. Missing evidence -> gather it; more effort is not the fix. Reasoning failure -> one targeted remediation, then qualified escalation for the second if
needed. Existing maximum remains TWO remediation attempts per root cause, across all models, providers and sessions; initial implementation is separately identified. Stop and return the
premise to the owner afterward. Explicit task-level time/cost/total-attempt caps also apply, so splitting one problem into new root-cause labels cannot create an endless workflow.
Reviewer disagreement -> compare reproductions and requirements, then one synthesis; optional specialist only for unresolved risk. Majority and expert status cannot erase a reproduction.

## Quotas, forecast absences and money

Track each account/plan/quota pool separately: remaining range, unit, observed time, source, reset time if known, reliability, concurrent reservations and queued essential work.
API dollars, tokens, subscription windows and AI credits are distinct units; unknown is not 0. Use supported usage/status outputs where available; do not promise a universal remaining-quota API.
Estimate exhaustion from remaining capacity and measured burn rate, with an uncertainty band; mark reset or remaining unknown when not observable. Shared provider/model limits may correlate.
Reserve the forecast cost of mandatory review, one recovery and handoff before routine work. Schedule scarce-expert decisions on the dependency critical path early, leave transfer packets,
and let other qualified workers continue. A voluntary reserve is not an actual provider vacation. Do not rotate accounts to evade imposed limits; use entitled approved routes within their terms.
Log real marginal cost separately from allocated subscription cost and scarce-capacity use. The owner was asked for plans, providers and additional monthly ceiling; these remain unknown
until answered. No paid call, subscription change or credential lookup is needed for this proposal.

## Jev: bounded advisory role

[Vercel introduction](https://vercel.com/changelog/typesafe-ai-jev-now-available-on-ai-gateway) describes typed Choice, Score and Boolean outputs. Jev does not generate the consensus plan;
a generative participant must first write a concrete alternative. Keep author identities out of the initial comparison where feasible, to reduce anchoring on rank or majority.
For each original, consensus and expert plan ask the SAME bounded Boolean outcome: accepted within deadline D and budget B under constraints C, with explicit tests and executor assumptions.
Several plans can all succeed: Choice probabilities over alternatives are not their separate success probabilities and must not be presented as such. Distinguish forecast from fact.
[Probability guidance](https://vercel.com/i/jev-probabilities-and-thresholds) calls for labeled, held-out cases and warns against treating normalized scores as success probabilities.
[TypeSafe confidence](https://docs.typesafe.ai/confidence) describes confidence separately from probability. Evaluate local calibration/Brier score against simple baselines, abstention
and decision regret, plus total latency/cost. Use time-separated holdouts and information available at decision time only. Unexecuted alternative plans have no observed counterfactual
outcome; never label all rejected plans failures or consensus acceptance as ground truth. Start with the offline replay already allowed by 0045, then propose shadow operation that
cannot change routing. Online use requires the owner to revise that boundary explicitly. On timeout, missing distribution or stale context, use the deterministic approved fallback.
Jev can suggest routing/investigation; never write PASS, override a gate or settle reproduced defects. [Listed promotion](https://vercel.com/ai-gateway/models/jev) ends 2026-09-25; do not base
long-term economics on temporary zero price or vendor maximum-speedup claims.

## Metrics, capacity and staged rollout

One event schema: task/run/parent/root-cause IDs; policy/model/harness versions; requested and applied effort; role/domain/risk/difficulty; queue/start/end/review timestamps; tokens/cache/
cost/quota observations; switches and reasons; tests; candidate hash; findings/disposition; acceptance, escaped defects and owner interventions. Missing values stay null; redact secrets.
Separate elapsed, compute and human-active time. Parallel durations do not sum to cycle time. Review after each incident/model update and periodically by comparable completed tasks; do not
oscillate leaders after every result. Preserve the five frozen pilot success metrics; new diagnostics must not silently redefine their denominator or baseline.
Capacity proposal: keep TASK 80, journal 150, prompt 150 and review 250 lines by default; split technical appendices from active context. Initially test journals 30->60 and active
reviews 60->90 / 600 KB->1.2 MB, with reserved slots for planned sessions. These are tentative capacity values, not measured optima. Owner-approved implementation would change validator,
docs and tests together. Archive only completed eligible artifacts; never active journals. Do not load more context just because storage caps rose. Machine events need a separate
retention/size policy and should not become one Markdown review per model turn.

Rollout: (0) finish 0046 separately; approve one bounded orchestration slice and its ceiling. (1) Inventory actual accounts/capabilities and prepare task packets + provisional role pools.
(2) Shadow routing on labeled historical and a small representative prospective task set. (3) One live reversible task with worker-loss, rate-limit and coordinator-restart exercises.
(4) Expand by domain only after accepted results, safe recovery and lower end-to-end time. Use the existing 10-20 task pilot scale for operational learning if the owner preserves it;
that sample cannot certify fine-grained model superiority or rare-error probabilities. Acceptance: no duplicated writer/effect, attempts never reset, permissions preserved, no
unqualified failover, mandatory reviews retained, and measured time benefit against manual routing on comparable work. Roll back to manual dispatch when these fail. No new general council.

## Deliverable and verification limits

Owner follow-up supplied a distributed source map: Get-Command/install directories, actual print/exec success/failure, CLI versions, Codex config/error output, agy logs/history/
brain transcripts, and per-agent protocol documents. These are complementary evidence. Rechecked versions: agy 1.2.8, Vibe 2.25.5, Codex 0.154.0; installation locations and agy
history/log/brain existence confirmed. No raw transcript or credential contents were copied. At this inspection, both C:/Users/Dmitry/.codex/config.toml and D:/codex/config.toml declare
gpt-6-astra/high, with no model_provider in the inspected settings; project config also has none. AI_GATEWAY_API_KEY is absent in the inspecting shell. The owner's earlier vercel-route
failure remains a historical observation, not a reproduced failure of the current default. CLI arguments, process environment and session settings can select a different effective route.
No fresh inference smoke run was made, and catalog/account health remains unverified. Add a derived provider registry with source path, observed_at, version and health expiry;
separate declared/installed/launchable/inference-healthy/task-qualified. A help/version exit establishes only launchability. Preserve failure type and route, not a permanent brand ban.
The missing agy/Antigravity integration document is confirmed by .ai/docs inventory. A future bounded adapter contract should specify session start/stop, exact model/effort, output parsing,
timeouts/resume, permissions, usage signals and evidence. Do not create conflicting rules: AGENTS/CLI-AGENTS remain authoritative; the registry indexes evidence rather than replacing it.

Only this proposal, its prompt and own journal were written; no routing configuration, provider selection, role assignment, existing gate or limit changed. Before writing:
58 active review files / 556625 B, leaving two slots for this pair. Full protocol checks are recorded in the session journal; a passing suite does not validate this proposed system.
No model contest, inference benchmark, Jev call, quota API probe or paid operation was run.
