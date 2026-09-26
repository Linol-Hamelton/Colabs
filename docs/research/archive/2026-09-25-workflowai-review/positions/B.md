# Position B: workflowAI.md independent review

## 1. Admissible choice in every case (section 1)

**FACT**: Section 1.4 states: "An unavailable rung is skipped and the skip is recorded. The owner is not asked."

**FACT**: Section 1.5.2: "the primary is the lowest available rung at or above the floor. Cheaper wins among admissible rungs."

**FACT**: Section 1.5.3: substitutes 1 and 2 are "the next available admissible rungs, preferring another family when the stage has an independence constraint."

**FACT**: Section 1.5.4: "rungs of one group [...] are interchangeable, and the tie goes to the one with the most headroom in its limit."

**INFERENCE**: For a stage whose floor rung is unavailable: section 1.4 skips it, then section 1.5.2 selects the next available rung at or above the floor. If no rung meets the floor, section 1.5.2's requirement that the primary be "at or above the floor" cannot be satisfied. However, PROTO-DEC-0075 item 9 explicitly states: "If no model at or above the floor fits the budget, the answer is ASK OWNER or BLOCKED_BUDGET, before the start." workflowAI.md section 1 does not explicitly cover the case where no rung meets the capability floor at all (regardless of budget). This is a **medium** defect.

**FACT**: For a group tie: section 1.5.4 resolves it by selecting the rung with the most headroom in its limit. This covers the group tie case.

**FACT**: For an independence constraint: section 1.5.3 explicitly prefers "another family" for substitutes. This covers independence constraints.

**FACT**: For an exhausted limit: section 1.4 checks "the limit is not exhausted, where readable" and skips unavailable rungs. This covers exhausted limits.

**VERDICT**: The procedure gives one admissible choice in most cases. The **medium** defect is the missing explicit handling of "no rung meets the capability floor" (not just budget).

## 2. Consistency with PROTO-DEC-0073 to 0076 and MODEL-ECONOMICS

**FACT**: PROTO-DEC-0073: "no model or prompt in scripts." workflowAI.md section 2 states: "Supervision is a script" and "processes are checked by a script, never by a model." Section 1.4 uses a script to check availability. This is **consistent** (FACT: workflowAI.md:45-47).

**FACT**: PROTO-DEC-0074: "roles, not models." workflowAI.md section 1.2: "A model not observed there is not available" and the ladder is data in MODEL-ECONOMICS.md. Section 1.5 selects models dynamically. This is **consistent** (FACT: workflowAI.md:13-15).

**FACT**: PROTO-DEC-0075: capability floor, resolver order, primary+two substitutes, independence constraints. workflowAI.md section 1.5 implements exactly this order: floor first (1.5.1), then cheapest among admissible (1.5.2), then substitutes with family preference (1.5.3). This is **consistent** (FACT: workflowAI.md:51-61, PROTO-DEC-0075:9-10,13).

**FACT**: PROTO-DEC-0076: CLI-only routes except DeepSeek V4.1 Max with manual approval. workflowAI.md section 1.3 states this rule verbatim. Section 2 states scripts supervise, not models. This is **consistent** (FACT: workflowAI.md:19-23,27-29).

**FACT**: PROTO-DEC-0076 item 2: "script supervision" includes "liveness, completion, failures, retries." workflowAI.md section 2 lists: "liveness, completion, failures, retries" and "hands them over with a report." However, PROTO-DEC-0075 requires resume-first (item 1 of Answer 1) and error classification (B4), which workflowAI.md section 2 does not explicitly implement. This is a **medium** defect: partial implementation of PROTO-DEC-0075 in the supervision script (FACT: workflowAI.md:45-53 vs PROTO-DEC-0075:Answer1, B4).

**FACT**: MODEL-ECONOMICS.md holds the ladder as data. workflowAI.md section 1.2 explicitly references MODEL-ECONOMICS.md as the source of the owner's working ladder. This is **consistent** (FACT: workflowAI.md:13-15, MODEL-ECONOMICS.md:3-5).

**CONFLICT SUMMARY**: None. The two medium defects are implementation gaps, not contradictions.

## 3. Section 3: undisputed points and hypotheses

**FACT**: Section 3 table lists 12 "Undisputed" points with sources.

**VERIFICATION**:
- "Model names are data, not protocol constants" -> PROTO-DEC-0073, 0074 item 2: **FACT** (PROTO-DEC-0073:Decision, PROTO-DEC-0074:item 2)
- "AVAILABLE and WORKING are separate" -> this file sections 1.1-1.2: **FACT** (workflowAI.md:27-35)
- "AVAILABLE -> WORKING is a separate qualification step, and it is tech debt" -> owner, 2026-09-25 (section 6): **FACT** (workflowAI.md:103-105)
- "Tier by uncertainty x consequence" -> 0074 item 4, 0075 item 8: **FACT** (PROTO-DEC-0074:item 4, PROTO-DEC-0075:item 8)
- "The decomposition senior spec -> worker -> middle -> senior escalation" -> 0074 item 4: **FACT** (PROTO-DEC-0074:item 4)
- "Capability floor before price; no silent downgrade; owner gate on budget" -> 0075 item 9: **FACT** (PROTO-DEC-0075:item 9)
- "A primary plus two substitutes, chosen per role" -> 0074 item 3, 0075 item 10: **FACT** (PROTO-DEC-0074:item 3, PROTO-DEC-0075:item 10)
- "Independence constraints in selection" -> 0075 item 13: **FACT** (PROTO-DEC-0075:item 13)
- "Explicit owner override" -> section 1.2; 0075 item 10: **FACT** (workflowAI.md:31-33, PROTO-DEC-0075:item 10)
- "Telemetry per stage" -> 0075 items 6, 9-10; runner usage records: **FACT** (PROTO-DEC-0075:items 6,9-10)

**INFERENCE**: All 12 undisputed points are correctly sourced. None of the hypotheses H-WAI-1..6 are already decided (they are explicitly marked as hypotheses in section 3). None of the undisputed points are actually hypotheses.

**VERDICT**: Section 3 is **correct**. No misclassification found.

## 4. Section 2 as a script

**FACT**: Section 2 states: "processes are checked by a script, never by a model: liveness, completion, failures, retries. The script only accumulates statuses while the chain runs, then hands them over with a report of the work done: per stage, the model, route, tries, state, outputs, usage and the reasons for any manual acceptance."

**INFERENCE**: All described actions (check liveness, completion, failures, retries; accumulate statuses; hand over with report) are mechanical operations on process metadata and file system state. No model judgment is required. A script can fully implement section 2 as written.

**VERDICT**: Section 2 is **fully scriptable** (FACT: workflowAI.md:45-53).

## 5. Defects triaged (COMMON rule 3)

- **simple**: workflowAI.md section 5 notes the runner does not yet read the ladder (line 97-98). This is a transitional breach of PROTO-DEC-0074 item 2. Fix: make the resolver of section 1.5 scripted to read MODEL-ECONOMICS.md. path:line: workflowAI.md:97-98. one-line fix: Implement ladder reader in run-chain.cjs or kernel dispatch script.
- **simple**: The missing explicit handling of "no rung meets capability floor" in section 1.5. path:line: workflowAI.md:51-55. one-line fix: Add explicit ASK OWNER or BLOCKED_FLOOR case when no available rung meets the floor.
- **medium**: Section 2's supervision script does not implement resume-first and error classification from PROTO-DEC-0075. path:line: workflowAI.md:45-53. one-line fix: Extend run-chain.cjs with resume-first recovery and error taxonomy per PROTO-DEC-0075 Answer 1 and B4.
