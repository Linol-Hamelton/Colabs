# Q09: Predictable "leave" — settling a participant's work in advance when a provider's limit runs out

**Question**: How can the protocol ensure that when a provider's limit (quota, tokens, credits) predictably runs out, that participant's assigned questions are settled in advance so that others can continue without losing pace or quality?

**Primary**: mistral
**Challenger**: gemini
**Date**: 2026-09-23
**Commit SHA**: b232a9e5e99b51fccf8a1ce2ccfa009c3a204bed
**Working-tree state**: dirty (18 changes, see git status)
**Inventory commands run**:
- `cd /d/Colabs && git ls-files` (primary repository, 120+ tracked files)
- `cd /d/VPN && git ls-files` (secondary, ~50 tracked files)
- `cd /d/Block-Puzzle && git ls-files` (secondary, ~50 tracked files)

---

## 1. Decomposition

The problem breaks into four moving parts:

1. **Detection**: how to know a limit will run out, not just that it has
2. **Triage**: which of that participant's work is at risk (in-flight vs. queued vs. pending review)
3. **Handoff**: how to transfer ownership of unfinished work without losing context or quality
4. **Continuity**: how to prevent the gap from stalling dependent work or forcing rework

The owner's framing ("settling that participant's questions in advance") implies a **forward-looking** mechanism: finish or reassign work **before** the limit is exhausted, not after. This is distinct from reactive recovery (PROTO-DEC-0035 telemetry, PROTO-DEC-0042 receipt freshness) which only triggers post-facto.

Key distinction: a "provider's limit" can mean account-level (API credits), model-level (context window, rate limits), or session-level (token budget). Each has different predictability and mitigation windows. The Codex routing document treats all three (Q09:9, Q09:135-142).

## 2. Essential factors

| Factor | Why it matters | Binding constraint |
|---|---|---|
| Predictability horizon | How far ahead we can see exhaustion | PROTO-DEC-0034 item 2 forbids gate dependence on external state; limits are external state |
| Work granularity | Can a task be paused/resumed mid-stream? | PROTO-DEC-0041 item 1: certifier cannot be executor; swapping authors mid-task breaks independence |
| State portability | Can session state (context, partial edits, tests) move to another provider? | PROTO-DEC-0041 item 5: symmetry of evidence; a partial state is not a verifiable receipt |
| Role criticality | Is the participant in a sole-certifier or controller role? | PROTO-DEC-0041 item 2: high-risk tasks need two parallel independent certifiers |
| Denominator of "quality" | What counts as "losing quality"? | Missing: no definition of quality baseline or acceptable regression |
| Dependency chains | Does other work block on this participant's output? | PROTO-DEC-0025 item 4: no protocol commits in product repos; product work is the only authorized activity |

## 3. Blind spots — at least three ways a confident answer here could be wrong

**Blind spot 1: Limits are not all predictable.**
- Rate limits and soft quotas can be pre-empted by provider-side changes (e.g., agy history shows model catalog drift, Q09:91-92). A mechanism that assumes advance notice may fail silently when the notice disappears. 
- Measured: Code x routing document explicitly flags "Shared provider/model limits may correlate" and "reset or remaining unknown when not observable" (Q09:138). This is a gap, not a solved condition.

**Blind spot 2: State portability assumes serializable state.**
- The protocol's session state (context window, partial edits, test runs) is not guaranteed to be exportable or importable across providers. PROTO-DEC-0034 item 2 says external tooling is advisory only; a cross-provider handoff **is** external tooling relative to the departing provider's session.
- The Codex contract requires "provider change starts from a compact transfer packet: facts, open hypotheses, changes, commands/results, constraints and next action" (Q09:60-61), but does not guarantee all providers can consume that packet.

**Blind spot 3: Independence constraints can block any substitute.**
- PROTO-DEC-0041 item 1: the certifier must be outside execution and control. If the departing participant is the **only** eligible certifier for a high-risk task, no substitute satisfies independence. The owner's Open question 2026-09-22 notes: "the escalation slot has no occupant at all" because Codex exhausted its limits (TASK.md:64). This is a structural hole: scarcity of eligible certifiers, not of providers.
- The three-deep succession table (Q09:114-121) shows only 2-3 names per role; if all three share a quota domain, exhaustion is simultaneous.

## 4. Evidence — from the four repositories

### From D:\Colabs (primary)

- FACT: PROTO-DEC-0041 item 2 requires **no fewer than two parallel independent reviewers** for high-risk candidates. Line: .ai/DECISIONS.md:1792-1793. **This creates a denominator problem**: if one certifier's provider runs out, the second must still be available and eligible.

- FACT: PROTO-DEC-0034 item 2 states external tooling is **never Evidence** and **never a gate input**. Line: .ai/DECISIONS.md:1553-1554. **Implication**: any quota-monitoring tool cannot block completion, only advise.

- FACT: TASK.md:64 records owner ruling that Codex exhausted its limits, leaving the escalation certifier slot empty. Line: .ai/TASK.md:64. **This is a current, real instance** of the problem: scarcity of certifiers, not just providers.

- FACT: PROTO-DEC-0039 item 1 imposes feature freeze except for P0/audit closure and the finite paired-cycle remediation. Line: .ai/DECISIONS.md:1700. **Constraint**: new orchestration code for predictable leave is not P0 and not authorized.

- FACT: PROTO-DEC-0046 records a new premise: repo-relative ledger paths, absolute and parent forms exit 2; protected set from manifest. Line: .ai/DECISIONS.md:1946-1949. **Relevance**: protected paths include certifier receipts; if a certifier's provider fails, its receipt may not verify.

- MEASURED: Code x routing document proposes "Estimate exhaustion window and finish scarce-role dependencies early; Handoff precedes unavailable period" (Q09:44, Q09:135-142). **This is a proposed mechanism, not adopted policy.**

- MEASURED: Codex documents "Reserve the forecast cost of mandatory review, one recovery and handoff before routine work" (Q09:139-140). **This is advisory only per PROTO-DEC-0034.**

- MEASURED: The three-deep succession table lists 2-3 candidates per role/domain with basis/limit. Line: docs/reviews/2026-09-23-codex-routing-architecture.md:114-121. **Basis column explicitly includes "Owner preference plus existing role experience" and "Existing dispatch experience" — not quota diversity.**

- CLAIM: Claude's cycle-architecture decision states: "the coordinator shapes tasks, dispatches waves and reviews other independent work, but may not certify what it controlled" (PROTO-DEC-0041:1792-1793). **This is binding.**

- HYPOTHESIS: The current 2-certifier requirement can be satisfied by cross-provider deputies if their quota domains are independent. **Not verified**: no measurement of quota domain independence across the named candidates.

### From D:\VPN (secondary)

- FACT: VPN is a mixed Dart/Kotlin/Swift/Python codebase with DeepSeek named as VPN pilot implementer. Line: .ai/TASK.md:49. **Implication**: if DeepSeek's provider runs out, VPN work must pause or transfer.

- FACT: VPN TASK.md shows triage incomplete (criterion 34 unchecked). Line: .ai/TASK.md:34. **This increases dependency on specific providers.**

### From D:\Block-Puzzle (secondary)

- FACT: Block-Puzzle is predominantly Dart; triage commit 5ada2b9 completed. Line: .ai/TASK.md:33. **Status**: clean commit exists; work can resume from clean state.

- FACT: Block-Puzzle has 43 dirty files at last count. Line: .ai/TASK.md:52. **Implication**: in-flight work exists that may be at risk if a provider limit runs out.

### From D:\Битва за луну (secondary)

- FACT: This repository is the clean control arm with zero protocol edits. Line: .ai/TASK.md:59. **Implication**: minimal risk from provider limits on protocol paths; product work is the only activity.

## 5. What history can and cannot support

**History CAN support**:
- That provider limits have been hit before (Codex exhaustion recorded 2026-09-22, TASK.md:64).
- That cross-provider handoff packets are defined but not guaranteed consumable (Codex routing:60-61).
- That independence constraints can create irreversible scarcity (PROTO-DEC-0041 item 1 + TASK.md:64).
- That the protocol has survived provider outages without permanent damage by using deterministic fallback (PROTO-DEC-0034 item 2 degradation rule).

**History CANNOT support**:
- A denominator for "quality" — there is no measured baseline of quality-without-interruption vs. quality-with-interruption. The frozen metrics (TASK.md:32) are from 2026-09-20 and do not include interruption resilience.
- A success rate for predictable leave — no incident log records a **predicted** limit exhaustion being mitigated. The only recorded exhaustion (Codex) was a posteriori.
- Cross-provider state portability — no evidence of a successful session state transfer between providers exists in the tracked files.
- The cost/benefit of proactive handoff — no measured comparison between finishing early vs. transferring mid-stream.

## 6. Interaction with binding rules

- **PROTO-DEC-0041 item 1 (independence)**: A predictable-leave mechanism cannot violate independence. If the departing participant is the only eligible certifier, **no substitute is valid** regardless of how much notice we have. This is a hard blocker on Q09's premise for high-risk tasks.

- **Reproduction over voting**: PROTO-DEC-0041 item 5 requires symmetry of evidence. A handoff packet must include reproducible artifacts; confidence in the departing participant's claims does not transfer.

- **PROTO-DEC-0034 advisory-only external tools**: Any quota monitoring or prediction service is external state; it can advise but cannot gate. The completion gate must still be met without it.

- **PROTO-DEC-0039 freeze**: New orchestration is not P0/audit closure. A new system for predictable leave would need an owner-directed exception (PROTO-DEC-0040 style).

- **PROTO-DEC-0046**: The new premise explicitly restricts protected-path checks. If a certifier's receipt cannot be verified due to provider failure, the receipt itself is stale (PROTO-DEC-0042), not the work.

## 7. Interaction with the other 12 questions

- **Q10 (Time saving)**: Q09's proactive handoff costs time; Q10 says time is worth more than money. If settling in advance adds latency, it conflicts with Q10 unless it prevents greater latency later. The Codex routing objective explicitly orders: "Quality maintained; mandatory review still affordable" (Q09:83-84) — suggesting quality > cost > time, but owner preference is time > money. **This is a potential ordering conflict.**

- **Q11 (Deputies)**: Q09's core need (substitutes for an unavailable participant) is exactly what Q11 proposes to solve at the role level. Q11's three-deep roster is the candidate solution for Q09's independence constraint. However, Q11 does not guarantee quota-domain independence. The Codex succession table (Q09:114-121) lists deputies but their quota correlation is unknown.

- **Q01-Q08, Q12-Q13**: Not directly read, but Q09's mechanism affects all tasks that might be in-flight when a provider limit runs out. The routing objective (Q09:67-69) applies across all.

## 8. Options — at most three real ones, including doing less

| Option | Description | Cost | Time | Risk |
|---|---|---|---|---|
| **A. Do less: Accept the gap** | No proactive mechanism. Rely on reactive recovery: when a limit runs out, pause that participant's work, reassign what can be reassigned, wait for quota reset. Keep PROTO-DEC-0034 degradation rule. | Zero implementation cost. | Zero added latency when limits are healthy. | High: work stalls; high-risk tasks may have no eligible certifier; no guarantee of continuity. |
| **B. Reserve-based scheduling** | For every task, reserve forecast cost of mandatory review + one recovery + handoff before assigning routine work. Schedule scarce-role dependencies early. Uses Codex proposal (Q09:139-140) within PROTO-DEC-0034 advisory bounds. | Low: changes to dispatch logic only. | Low: scheduling overhead, but prevents mid-stream exhaustion. | Medium: still reactive to unforeseen limits; assumes forecast accuracy. |
| **C. Three-deep quota-independent deputies** | Maintain Q11's three-deep roster per role, but explicitly qualify on quota-domain independence. Requires owner to name deputies from different quota pools. Add explicit quota-domain field to role assignments. | Medium: manual roster maintenance; may reduce eligible pool. | Low: only affects assignment phase. | Medium-High: may be impossible for niche roles; creates pressure to add more providers. |

## 9. Recommendation, and the forks only the owner can decide

**Recommendation**: **Option B (Reserve-based scheduling)** as the immediate, compliant path.

Rationale:
- It respects all binding constraints: independence (PROTO-DEC-0041 item 1), advisory-only external tools (PROTO-DEC-0034), freeze (PROTO-DEC-0039).
- It requires no new code or gates — only policy in dispatch documents.
- It is explicitly proposed and costed in Codex routing (Q09:139-140).
- It directly addresses the **predictable** aspect by finishing scarce work first.

**Forks for the owner**:
1. Accept that high-risk tasks may stall if a certifier's provider runs out and no quota-independent deputy exists. This keeps the freeze but accepts a known failure mode.
2. Authorize an exception to PROTO-DEC-0039 (like PROTO-DEC-0040) to implement Option C with explicit quota-domain tracking in protocol-manifest.json and the validator. This changes the protocol's own tooling.
3. Relax PROTO-DEC-0041 item 1 for certifiers when the only alternative is stalling product work. This weakens a core independence guarantee and would need its own adversarial review.

## 10. Missing data — what would have to be measured to decide better

1. **Quota-domain independence matrix**: For each named deputy in the succession table, record their provider, account, quota pool, and whether exhaustion of one pool correlates with others. Without this, Option C cannot guarantee availability.
2. **Handoff packet success rate**: Measure how often a compact transfer packet (facts, open hypotheses, changes, commands/results, constraints, next action) can be successfully consumed by a substitute provider. Without this, state portability remains hypothetical.
3. **Baseline of quality-with-interruption**: Define and measure quality (e.g., escaped defects rate, owner intervention rate, time-to-acceptance regression) for tasks that experience provider interruption vs. those that do not. Without this denominator, "losing quality" is undefined.
4. **Predictability accuracy**: Track how often limit exhaustion can be forecasted >N hours in advance, and the false positive/negative rates. Without this, proactive mechanisms may trigger unnecessarily or too late.

## 11. Challenge

Challenger: gemini

Challenger slot: (pending)
