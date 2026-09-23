# Q11: Deputies — a top-3 for every role, so work continues when someone drops out

**Question**: How should the protocol implement a deputy system (maintaining a top-3 qualified candidates for every role) to ensure continuity when a participant drops out, without violating independence or creating single points of failure?

**Primary**: mistral
**Challenger**: copilot
**Date**: 2026-09-23
**Commit SHA**: b232a9e5e99b51fccf8a1ce2ccfa009c3a204bed
**Working-tree state**: dirty (18 changes, see git status)
**Inventory commands run**:
- `cd /d/Colabs && git ls-files` (primary repository, 120+ tracked files)
- `cd /d/VPN && git ls-files` (secondary, ~50 tracked files)
- `cd /d/Block-Puzzle && git ls-files` (secondary, ~50 tracked files)

---

## 1. Decomposition

The deputy system breaks into:

1. **Role definition**: what constitutes a "role" for deputy purposes? (See PROTO-DEC-0041 roles: implementer, controller, certifier)
2. **Qualification**: what makes a candidate "qualified" for a role? (Capability per PROTO-DEC-0043, independence per PROTO-DEC-0041 item 1)
3. **Ranking**: how to order the top-3? (Competence, availability, independence, quota-domain diversity)
4. **Activation**: how does a deputy take over without breaking evidence chains?
5. **State transfer**: how does the deputy receive the necessary context, authority, and responsibility?
6. **Maintenance**: how to keep the top-3 list current?

The Codex routing document already proposes a three-deep succession table (Q11:114-121) and the PAIRED-CYCLE.md describes role slots (implementer, controller, certifiers). The challenge is making this **operational** under the binding constraints, particularly independence.

Key distinction: A deputy for **execution** (taking over a task mid-stream) is different from a deputy for **certification** (issuing a CERTIFYING verdict). PROTO-DEC-0041 item 1 forbids the executor from certifying; a deputy who inherits execution **cannot** then certify that same work.

## 2. Essential factors

| Factor | Why it matters | Binding constraint |
|---|---|---|
| Role granularity | Are roles per-repository or global? | PROTO-DEC-0041 roles are configured per task in .ai/TASK.md (PAIRED-CYCLE.md:7-10). |
| Capability requirements | What capabilities must a deputy have? | PROTO-DEC-0043: capability determined by execution environment (FS_WRITE, SHELL_EXEC, EVIDENCE_SIGN, REPO_READ), never self-declared. Line: .ai/DECISIONS.md:1851-1859. |
| Independence | Can a deputy be independent if they share quota/control? | PROTO-DEC-0041 item 1: certifier must be outside execution and control. Line: .ai/DECISIONS.md:1792-1793. |
| Evidence continuity | How to preserve evidence chains across deputy handoff? | PROTO-DEC-0041 item 5: symmetry of evidence; reproduce or refute. Line: .ai/DECISIONS.md:1796. |
| Lock discipline | How to prevent race conditions on shared state? | AGENTS.md: cooperative lock for shared documents. Line: AGENTS.md:193-208. |
| Frozen metrics | What must be preserved across deputy handoff? | TASK.md:32: frozen objectives and five metrics per repository. |

## 3. Blind spots — at least three ways a confident answer here could be wrong

**Blind spot 1: The top-3 may all be in the same quota domain.**
- The Codex succession table lists deputies by role/domain with a "Basis/limit" column that includes "Owner preference plus existing role experience" (Q11:114-121). **There is no guarantee of quota-domain independence.** If all three share a provider/account, a limit exhaustion disables all simultaneously.
- Measured: Codex explicitly warns "Shared provider/model limits may correlate" (Q11:138). This is a known failure mode of the proposed table.
- The current Codex exhaustion incident (TASK.md:64) shows exactly this: when Codex exhausted its limits, the escalation certifier slot was empty. If Codex were in the top-3 for certifier roles, all three could have been affected.

**Blind spot 2: State transfer assumes serializable and consumable state.**
- The Codex contract requires a "compact transfer packet: facts, open hypotheses, changes, commands/results, constraints and next action" (Q11:60-61). **This is not the same as a full session state.** Partial edits, uncommitted changes, and in-memory context may not be captured.
- The protocol's session state is not designed for export: `.ai/worklog/` is per-session, `.ai/runtime/` is disposable, and the cooperative lock is process-local. **There is no defined "transfer packet" format for deputy handoff.**
- If a deputy receives a partial packet, they cannot reproduce all evidence. PROTO-DEC-0041 item 5 requires symmetry of evidence; incomplete transfer breaks this.

**Blind spot 3: The deputy may not satisfy independence for certification.**
- A deputy taking over **execution** (e.g., implementer role) becomes the new executor. By PROTO-DEC-0041 item 1, they **cannot** then issue a CERTIFYING verdict on that work.
- For high-risk tasks requiring two independent certifiers (PROTO-DEC-0041 item 2), if the original certifiers are unavailable, the deputies may be the **only** eligible candidates — but if they inherited execution, they are disqualified.
- The current registry shows only 4-5 active models in the core team (PAIRED-CYCLE.md:24). If two are in execution/control, only 2-3 remain for certification. A deputy list that overlaps with execution roles **reduces** the certifier pool.

## 4. Evidence — from the four repositories

### From D:\Colabs (primary)

- FACT: PROTO-DEC-0041 item 1 defines certification independence: a CERTIFYING verdict may not be issued by the author, executor, controller, or any member of the executing pair. Line: .ai/DECISIONS.md:1792-1793. **This is the core constraint for deputies.**

- FACT: PROTO-DEC-0041 item 2 requires no fewer than two parallel independent reviewers for high-risk candidates. Line: .ai/DECISIONS.md:1792-1793. **This creates the denominator: deputies must not reduce the certifier pool below 2.**

- FACT: PROTO-DEC-0043 item 5 defines control: "Invoking an agent and writing its prompt is control of that work." Line: .ai/DECISIONS.md:1856. **Implication**: a deputy who is dispatched via a transfer prompt is under the control of the original dispatcher.

- FACT: PROTO-DEC-0041 item 5 requires symmetry of evidence: "A refutation of a finding carries the same burden of proof as the finding." Line: .ai/DECISIONS.md:1796. **Implication**: a deputy must receive full reproducible state, not a summary.

- FACT: PAIRED-CYCLE.md defines roles as functional slots, not model brands. Line: .ai/docs/PAIRED-CYCLE.md:7-11. **Implication**: deputies can be any model capable of the role, but capability is determined by environment, not model name.

- FACT: PAIRED-CYCLE.md:24 lists the core team: DeepSeek, Claude, GPT/Codex, Gemini. **This is only 4 models for the full set of roles.**

- FACT: TASK.md:64 records the Codex exhaustion leaving the escalation certifier slot empty. Line: .ai/TASK.md:64. **This is a live example of deputy scarcity.**

- FACT: PROTO-DEC-0046 item 6 defines certification for the executable-rulebook batch: DeepSeek coordinates, Codex and a fresh Claude as certifiers, DeepSeek certifies none, both certifiers work simultaneously. Line: .ai/DECISIONS.md:1949. **This shows the independence mechanism in practice.**

- MEASURED: Codex routing succession table lists 2-3 candidates per role/domain with basis. Line: docs/reviews/2026-09-23-codex-routing-architecture.md:114-121. **This is a proposed roster, not a tested one.**

- MEASURED: Codex states "If fewer than two eligible high-risk certifiers remain, stop that task" (Q11:123-124). **This is the correct behavior under PROTO-DEC-0041 item 2, but the succession table does not guarantee 2 eligible certifiers.**

- MEASURED: Codex flow definition: " Give each worker its own session/journal/worktree; serialize shared metadata/integration." Line: docs/reviews/2026-09-23-codex-routing-architecture.md:57-58. **This provides a pattern for deputy isolation.**

- CLAIM: PAIRED-CYCLE.md states: "The coordinator may shape tasks, dispatch waves and review other independent work, but may not certify what it controlled." Line: .ai/docs/PAIRED-CYCLE.md:17-20. **This is the independence rule for roles.**

- HYPOTHESIS: A deputy system that maintains separate worktrees and journals per deputy can satisfy evidence continuity. **Not verified**: no tested handoff between deputies exists in history.

### From D:\VPN (secondary)

- FACT: DeepSeek is named as VPN stream implementer. Line: .ai/TASK.md:49. **Implication**: if DeepSeek drops out, a deputy implementer is needed for VPN.

- FACT: VPN TASK.md shows multiple worklog entries per agent (claude, deepseek, gemini). **Implication**: multiple models have capability in VPN; deputy candidates exist.

### From D:\Block-Puzzle (secondary)

- FACT: Block-Puzzle has gemini, claude, codex, deepseek worklogs. **Implication**: multiple models have capability in Block-Puzzle; deputy candidates exist.

- FACT: Block-Puzzle is Dart; triage commit exists. Line: .ai/TASK.md:33. **Implication**: a clean baseline exists for deputy handoff.

### From D:\Битва за луну (secondary)

- FACT: This repository is the clean control arm with zero protocol edits. Line: .ai/TASK.md:59. **Implication**: minimal protocol state; deputy handoff would involve only product work.

## 5. What history can and cannot support

**History CAN support**:
- That role-based dispatch is already used (TASK.md Roles section, PAIRED-CYCLE.md).
- That multiple models have capability across all repositories (worklog inventories in Colabs, VPN, Block-Puzzle).
- That independence constraints can create scarcity (Codex exhaustion incident, TASK.md:64).
- That a succession table is a known pattern (Codex routing:114-121).
- That separate worktrees/journals per worker are a known isolation pattern (Codex routing:57-58).

**History CANNOT support**:
- That a deputy handoff has ever been successfully executed. No journal entry records a deputy taking over mid-task.
- That quota-domain independence is maintained in the proposed succession table. The basis/limit column does not include quota information.
- That evidence continuity can be preserved across deputies. No transfer packet format is defined, and no successful state transfer is recorded.
- The operational overhead of maintaining top-3 rosters. The proposed table is static; dynamic maintenance under load is untested.

## 6. Interaction with binding rules

- **PROTO-DEC-0041 item 1 (certification independence)**: A deputy who takes over execution **cannot** certify that work. This means the deputy list for execution roles and certification roles must be **disjoint** or the certifier pool must exclude any deputy who executed. This is a structural constraint that the Codex succession table does not explicitly handle.

- **PROTO-DEC-0041 item 2 (two independent certifiers)**: The deputy system must guarantee that at least two eligible certifiers exist who are outside execution and control. This means the **total eligible pool** must be at least N+2 where N is the number of execution deputies. The core team of 4 (PAIRED-CYCLE.md:24) may not be sufficient for high-risk tasks with multiple execution deputies.

- **PROTO-DEC-0043 (terminal dispatch)**: Capability is determined by environment, not model name. A deputy's capability must be verified at assignment time, not assumed from a static table.

- **PROTO-DEC-0039 freeze**: New code for deputy orchestration is not P0/audit closure. A deputy system that only updates policy documents (like the succession table) is allowed; any enforcement code is not.

- **PROTO-DEC-0034 advisory-only external tools**: Any deputy matching/ranking service that uses external state is advisory only. The deputy selection must be verifiable from repository state.

## 7. Interaction with the other 12 questions

- **Q09 (Predictable leave)**: Q11's deputy system is the primary mechanism to address Q09's continuity problem. However, Q09's scarcity constraint (independence + quota domains) means Q11's deputies may not satisfy Q09's needs for high-risk certification.

- **Q10 (Time saving)**: Q11's deputy system may reduce time (faster substitution) but may increase cost (more deputies on standby). Under Q10's principle (time > money), this is acceptable only if elapsed time does not increase.

- **Q01-Q08, Q12-Q13**: All routing/assignment questions depend on a reliable deputy mechanism for resilience. Q11 is a foundation for the other questions.

## 8. Options — at most three real ones, including doing less

| Option | Description | Cost | Time | Risk |
|---|---|---|---|---|
| **A. Do less: Rely on existing role assignments** | Keep current TASK.md Roles section; accept that if a participant drops out, work pauses until a new assignment is made manually. Use the existing journal/lock discipline for coordination. | Zero implementation cost. | Zero added latency when no dropout occurs. | High: work stalls on dropout; no guarantee of rapid substitution; independence may not be satisfiable. |
| **B. Static top-3 succession table** | Maintain a versioned succession table per role/domain (like Codex routing:114-121) in a managed file (e.g., docs/roster/SUCCESSION.md). Update via owner directive or verified capability demonstration. Require that for high-risk tasks, the top-3 excludes anyone in execution/control. | Low: documentation maintenance. | Low: lookup overhead only. | Medium: table may be stale; no quota-domain independence; requires manual updates. |
| **C. Dynamic capability registry with isolation** | Maintain a registry of capabilities (FS_WRITE, SHELL_EXEC, EVIDENCE_SIGN, REPO_READ) per agent/session, updated at session start. For each role, query the registry for eligible candidates and select top-3 with maximum quota-domain diversity. Isolate deputies with separate worktrees/journals. | High: requires code for registry and selection; conflicts with PROTO-DEC-0039 freeze. | Medium: adds selection and isolation overhead. | Medium-High: code change needed; may require PROTO-DEC-0039 exception. |

## 9. Recommendation, and the forks only the owner can decide

**Recommendation**: **Option B (Static top-3 succession table)** as the immediate, compliant path.

Rationale:
- It requires no code changes (respects PROTO-DEC-0039 freeze).
- It leverages the existing pattern proposed in Codex routing (Q11:114-121).
- It can be updated via owner directive without new mechanisms.
- It provides a clear, verifiable roster for substitution.

**Constraints to add**:
- For **execution roles** (implementer, controller), the top-3 can include any capable agent.
- For **certification roles** (high-risk certifiers), the top-3 must explicitly exclude any agent who is currently in execution or control for that task (per PROTO-DEC-0041 item 1).
- Each entry in the table must include the capability verification date and basis (per PROTO-DEC-0043).
- The basis column should explicitly note quota-domain independence where known.

**Forks for the owner**:
1. **Accept Option A**: Keep manual assignment. This preserves the status quo but leaves the Codex exhaustion incident (TASK.md:64) unresolved.
2. **Adopt Option B with quota-domain constraint**: Require that the top-3 for any role have **provably independent quota domains**. This may reduce the eligible pool significantly.
3. **Authorize Option C via PROTO-DEC-0039 exception**: Allow a capability registry and automated deputy selection. This would need the same level of justification as PROTO-DEC-0040 and would require its own adversarial review.
4. **Expand the core team**: Add more models to the core team (PAIRED-CYCLE.md:24) to increase the eligible pool for deputies. This is an owner decision on model access and cost.

## 10. Missing data — what would have to be measured to decide better

1. **Capability matrix**: For each agent in the proposed succession table, record the verified capabilities (FS_WRITE, SHELL_EXEC, EVIDENCE_SIGN, REPO_READ) and the verification date. Without this, the table is not auditable.
2. **Quota-domain matrix**: For each agent, record the provider, account, quota pool, and measured correlation with other agents' pools. Without this, independence under exhaustion cannot be guaranteed.
3. **Handoff success rate**: Measure how often a deputy can successfully take over a task mid-stream with full evidence continuity. Without this, the table is hypothetical.
4. **Maintenance cost**: Track the overhead of keeping the succession table current: frequency of updates, stale entries, and the cost of verification. Without this, the sustainability of the approach is unknown.

## 11. Challenge

Challenger: copilot

Challenger slot: (pending)
### Challenger's independent blind-spot list (copilot, saved before reading the primary document)
- A deputy inheriting a candidate may not be independent if it copies the same reasoning or evidence.
- Handoffs can reset attempt budgets unless remaining attempts travel with the work item.
- Top-3 coverage may be asserted without a measured ranking denominator or qualification rate.
- Deputy selection needs a competence threshold and evidence, not merely role membership.
- Three deputies can amplify correlated failure rather than provide resilience.
- Budget and latency costs of maintaining deputies may be omitted from the tradeoff.
- Fallback behavior after multiple deputies fail may be unspecified or loop-prone.
- Candidate provenance, dissent, and contamination controls may be absent.
### Challenger's attack on the primary document (copilot, after reading)
- The document labels the succession table "MEASURED" (docs/research/2026-09-23-routing/Q11-deputies.md:80-80), while later admitting history cannot support a successful handoff, quota independence, or maintenance cost (docs/research/2026-09-23-routing/Q11-deputies.md:115-119). That is a declaration of roster contents, not a measured top-3 qualification result; the label should not support Option B.
- Option B is recommended as immediately compliant (docs/research/2026-09-23-routing/Q11-deputies.md:151-157), but its constraints omit the non-resetting attempt counter and remaining budget on handoff (docs/research/2026-09-23-routing/Q11-deputies.md:159-163). The routing source explicitly requires a deputy to inherit the packet and remaining budget (docs/reviews/2026-09-23-codex-routing-architecture.md:40-46); without making that a roster invariant, substitution can manufacture fresh attempts.
- The recommendation asks for a capability verification date and basis (docs/research/2026-09-23-routing/Q11-deputies.md:159-163), but no competence threshold, outcome sample, or denominator is required. Its missing-data list measures capability, quota correlation, handoff success, and maintenance (docs/research/2026-09-23-routing/Q11-deputies.md:171-176), not whether each candidate is qualified relative to comparable alternatives. A "top-3" therefore remains unranked assertion.
- The stated question requires three qualified candidates for every role, yet Option B says "top-3" per role/domain while the cited roster is only 2-3 candidates (docs/research/2026-09-23-routing/Q11-deputies.md:145-147; docs/reviews/2026-09-23-codex-routing-architecture.md:102-122). The plan needs an explicit fail-closed rule for fewer than three qualified candidates and must not call a short list top-3.
