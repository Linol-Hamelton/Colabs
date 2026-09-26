# Discussion Position A: workflowAI Review

- Frame: `task:wai-discuss-a`
- Baseline: `0200730326d107ad76f706e05762adea161ee603`
- Author: gemini-3.8-flash-high (agy)

## 1. Procedure Admissibility (Section 1)

- FACT (`docs/core-arch/stage-4/workflowAI.md:39`): Section 1.4 states unavailable rungs are skipped and the owner is not asked.
- FACT (`docs/core-arch/stage-4/workflowAI.md:43-44`): Section 1.5.2 sets primary as lowest available rung at or above floor.
- INFERENCE: The procedure does NOT yield an admissible choice in every case:
  1. Floor unavailable: If all rungs at or above the capability floor are unavailable, section 1 defines no terminal state. It lacks an escalation or stop mechanism, risking either silent downgrade or unhandled failure, contradicting PROTO-DEC-0075 item 9.
  2. Group tie: Section 1.5.4 awards ties to "most headroom in its limit" (`docs/core-arch/stage-4/workflowAI.md:47-48`). Headroom units across routes in `docs/ops/MODEL-ECONOMICS.md:69-77` are non-comparable (% rolling window in Codex, prepaid USD in DeepSeek/Kilo, monthly USD allowance in Mistral, unreadable in others). No secondary tie-breaker exists if headroom is identical or unreadable.
  3. Independence constraint: Section 1.5.2 does not apply independence filtering to the primary model; section 1.5.3 only considers it as a "preference" for substitutes (`docs/core-arch/stage-4/workflowAI.md:45-46`), violating mandatory independence (PROTO-DEC-0075 item 13).
  4. Exhausted limit: If limits are unreadable (`docs/core-arch/stage-4/workflowAI.md:37`), the model is assumed available until runtime failure; if all limits are exhausted, no fallback or ASK OWNER trigger is defined.
- OPEN QUESTION: Should the resolver fall back to `BLOCKED_BUDGET` or immediately notify the owner when all floor-satisfying rungs are exhausted?

## 2. Consistency with Decisions and MODEL-ECONOMICS

- FACT (`.ai/DECISIONS.md:3127`): PROTO-DEC-0075 item 9 mandates `ASK OWNER or BLOCKED_BUDGET` when no model at or above floor fits the budget, and forbids silent downgrade.
- FACT (`.ai/DECISIONS.md:3133`): PROTO-DEC-0075 item 10 requires resolution based on tools, context, modality, and budget, not merely capability floor.
- FACT (`.ai/DECISIONS.md:3153-3156`): PROTO-DEC-0075 item 13 makes independence constraints binding per workflow and criticality.
- FACT (`docs/ops/MODEL-ECONOMICS.md:34`): DeepSeek V4.1 Max routes via Kilo with owner key on manual approval.
- INFERENCE: Conflicts identified:
  1. Conflict with PROTO-DEC-0075 item 9: Section 1.4 skipping without asking owner conflicts with mandatory `ASK OWNER / BLOCKED_BUDGET`.
  2. Conflict with PROTO-DEC-0075 item 10: Section 1.5 resolves solely via rung rank, omitting tool compatibility, context limits, and budget caps.
  3. Conflict with PROTO-DEC-0075 item 13: Section 1.5.3 treats independence as a preference ("preferring another family") and omits it from primary selection.
  4. Conflict with PROTO-DEC-0076 item 1 and MODEL-ECONOMICS: PROTO-DEC-0076 item 1 requires makers' CLIs only, but `MODEL-ECONOMICS.md:34` routes DeepSeek V4.1 Max via Kilo gateway. Furthermore, Group 5 contains DeepSeek V4.1 Max (manual approval required) alongside autonomous CLI models, but section 1.5.4 provides no guard preventing automated selection of DeepSeek Max.
- OPEN QUESTION: Will DeepSeek direct API/CLI replace Kilo to eliminate the aggregator exception under PROTO-DEC-0076 item 1?

## 3. Section 3 Analysis: Undisputed Points and Hypotheses

- FACT (`docs/core-arch/stage-4/workflowAI.md:70`): Row 2 cites "this file, sections 1.1-1.2" for separating AVAILABLE and WORKING.
- FACT (`.ai/DECISIONS.md:15`): AGENTS.md section 2 dictates that AI proposals are not decisions.
- INFERENCE on Undisputed points:
  1. Row 2 is NOT covered by an approved decision. Self-citation of a candidate file violates AGENTS.md authority rules; this is a proposed architecture point, not an undisputed settled fact.
  2. Other rows (1, 3-11) are legitimately supported by PROTO-DEC-0073 to 0076 and owner statements.
- FACT (`.ai/DECISIONS.md:3012-3020`): PROTO-DEC-0074 item 4 establishes functional categories (senior for strategy/architecture/audit; worker for implementation from spec; middle for fix).
- FACT (`.ai/DECISIONS.md:3131-3136`): PROTO-DEC-0075 item 10 binds dispatch to role and responsibility outliving models.
- INFERENCE on Hypotheses:
  1. H-WAI-6 ("functional categories of the working pool add value over one ordered ladder", `docs/core-arch/stage-4/workflowAI.md:94-95`) is ALREADY DECIDED by PROTO-DEC-0074 item 4 and PROTO-DEC-0075 item 10. Listing it as an open hypothesis contradicts binding protocol decisions.
  2. H-WAI-4 ("price and performance differ enough by task class to justify per-class ladders", `docs/core-arch/stage-4/workflowAI.md:90-91`) is partly decided: role-based tiering is adopted, though quantitative per-class ladder tuning remains empirical.
  3. H-WAI-1, H-WAI-2, H-WAI-3, and H-WAI-5 remain valid unproven hypotheses.
- OPEN QUESTION: Can H-WAI-6 be formally struck and incorporated directly into the Undisputed table?

## 4. Script Execution Feasibility of Section 2

- FACT (`docs/core-arch/stage-4/workflowAI.md:57-60`): Section 2 requires the script to check liveness, completion, failures, retries, and provide reasons for manual acceptance.
- FACT (`.ai/DECISIONS.md:3097-3102`): PROTO-DEC-0075 item 6 defines completion contract by exit code, output non-emptiness, structural validation, and Evidence.
- INFERENCE: A deterministic script CAN execute:
  1. Liveness checks (process status, heartbeat, output modification timestamps).
  2. Structural completion checks (exit code 0, file existence, schema/section presence, Evidence check).
  3. Bounded transient retries and failover execution based on classified error codes (PROTO-DEC-0075 item 4).
- INFERENCE: A script CANNOT execute without model or human judgement:
  1. Semantic failure detection (`docs/core-arch/OWNER-DECISION-execution-model-2026-09-25.md:221-238`), which requires a reviewer model.
  2. Generating "reasons for any manual acceptance" (`docs/core-arch/stage-4/workflowAI.md:60`): manual acceptance originates from human coordinator decisions, which the script can only record, not formulate.
  3. Passive accumulation contradiction: Section 2 states the script "only accumulates statuses" (`docs/core-arch/stage-4/workflowAI.md:58`), which contradicts active retry and fallback management.
- OPEN QUESTION: Will the script runner enforce machine-readable review verdicts (e.g. PASS/FAIL tokens) to bridge semantic evaluation into deterministic branching?

## 5. Defect Triage

1. `docs/core-arch/stage-4/workflowAI.md:39` & `docs/core-arch/stage-4/workflowAI.md:43-44`
   - Classification: blocking
   - Defect: Missing BLOCKED/terminal state when no available model meets the capability floor; "owner is not asked" violates PROTO-DEC-0075 item 9.
   - One-line fix: Terminate with status BLOCKED_BUDGET and prompt owner if all rungs at or above floor are unavailable.
2. `docs/core-arch/stage-4/workflowAI.md:47-48`
   - Classification: complex-non-blocking
   - Defect: Group tie-breaking by "headroom in limit" lacks normalized comparison across disjoint quotas and has no secondary tie-breaker.
   - One-line fix: Add a normalized quota metric and secondary deterministic tie-breaker (e.g. lower token price, then alphabetical route id).
3. `docs/core-arch/stage-4/workflowAI.md:43-46`
   - Classification: medium
   - Defect: Section 1.5 ignores stage independence constraints for the primary model and treats them only as a preference for substitutes.
   - One-line fix: Apply mandatory exclusion filters based on stage independence rules before picking primary and substitute models.
4. `docs/core-arch/stage-4/workflowAI.md:94-95`
   - Classification: medium
   - Defect: H-WAI-6 treats functional role categorization as an unproven hypothesis despite being decided in PROTO-DEC-0074 item 4 and 0075 item 10.
   - One-line fix: Remove H-WAI-6 from hypotheses and move functional categorization to the Undisputed table citing PROTO-DEC-0074 and 0075.
5. `docs/core-arch/stage-4/workflowAI.md:70`
   - Classification: medium
   - Defect: Undisputed row 2 cites candidate file itself (`workflowAI.md:1.1-1.2`) instead of an approved owner decision block.
   - One-line fix: Reclassify row 2 as an adopted design proposal under TD-MODEL-QUALIFICATION rather than an undisputed settled decision.
6. `docs/core-arch/stage-4/workflowAI.md:58`
   - Classification: simple
   - Defect: Script described as "only accumulates statuses", contradicting active execution of retries and fallbacks.
   - One-line fix: Change "only accumulates statuses" to "executes bounded recovery transitions and accumulates execution telemetry".
7. `docs/core-arch/stage-4/workflowAI.md:32-33`
   - Classification: simple
   - Defect: Section 1.3 maker CLI rule conflicts with DeepSeek V4.1 Max routing via Kilo gateway in `MODEL-ECONOMICS.md:34`.
   - One-line fix: Note Kilo as an authorized exception for DeepSeek V4.1 Max under owner approval until a direct CLI route is available.
