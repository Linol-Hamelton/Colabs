# Reusable Paired Work Cycle

This specification defines the reusable paired work cycle for multi-assistant collaboration under the AI Collaboration Protocol, incorporating PROTO-DEC-0041 and the owner-approved cycle architecture policy.

## 1. Roles and Responsibilities (PROTO-DEC-0041, B2)

Roles are configured per task in `.ai/TASK.md` under `## Roles` by the human owner. Roles designate functional operational slots, not model brands; capability is determined by the execution environment, never auto-assigned:
- **Implementer** (e.g., Gemini): Owns bounded execution, file modifications within declared scope, local test and validation checks, authoring the implementation note or report, authoring and persisting the Unified Adversarial Audit Prompt prior to handoff, and the initial verifiable evidence receipt. Rule: The implementer never marks the task Completed in `.ai/TASK.md`. Unilateral completion is strictly forbidden; prompt-first authoring is mandatory and its removal is forbidden.
- **Reviewer / Controller** (e.g., DeepSeek): Owns dispatch scoping, coordination, remediation tracking, and independent adversarial review. Invariant: **Controller ≠ certifier**. The controller shapes tasks and dispatches waves, but may never issue a `CERTIFYING` verdict on what it controlled. (This resolves the DeepSeek-as-interface dilemma: interface role is preserved, but self-certification is denied).
- **Independent Certifying Reviewers** (e.g., Claude, GPT/Codex): Independent assistants outside execution and control, issuing `CERTIFYING` verdicts.

### Review composition by risk class
- **Low risk** (documentation, config outside core/security/data): Implementer + 1 independent reviewer. Additional participants require a named uncertainty.
- **Normal risk** (product code outside high risk): Implementer + independent reviewer per block + independent integration pass.
- **High risk** (protocol core, security, data, invariants, upgrade/migration paths): Implementer + block reviewers + **no fewer than two parallel independent** reviewers on final verification; certifier outside execution and control.

### Independence and parallelism invariants
1. **Certification independence**: A `CERTIFYING` verdict on a high-risk candidate may not be issued by the author, the executor, the controller of that candidate, or any member of the executing pair.
2. **Controller ≠ certifier**: The coordinator shapes tasks, dispatches waves, and may review other independent work, but may not certify what it directed or controlled.
3. **Mandatory parallelism**: Primary reviewers within a verification pass receive the identical input package, work concurrently, and do not read each other's findings before recording their own. (Kaesberg et al., ACL Findings 2025: response diversity enhances accuracy, whereas discussion rounds before voting reduce it).
4. **Distinct mandates**: When two or more parallel reviewers are assigned, each is given a distinct angle of attack (e.g., reproducibility and evidence; contracts and edge-case boundaries; governance and scope compliance). Identical mandates duplicate findings and waste resources.
5. **No brand trust**: Roles in `.ai/TASK.md` designate functional slots, not model brands. Capability for `CERTIFYING` is determined by operational environment (filesystem access, shell execution, evidence signing), never by the model title in a report header.
6. **Third reviewer rule**: A third reviewer is added only for an uncovered risk, contradicting reproductions, or an explicit owner directive (PROTO-DEC-0041 item 2). General curiosity is not a valid basis.
- **Core team**: DeepSeek, Claude, GPT/Codex, Gemini (operational rationale: three CLIs, DeepSeek as user interface, all four integrated; owner budget decision, not a claimed statistical optimum).

## 2. Seven Phases, Artifacts, and Acceptance (PROTO-DEC-0041, PLAN Policy, B1)

A phase is a logical condition with a defined output and a checkable transition gate, not a file per step or a separate model per pass. For a compact documentation task, Phases 0–3 may be captured in a single TASK/PLAN entry while preserving mandatory independent review.

### Closed dictionary of terms
- **Phase (Фаза)**: Bounded stage of work with a defined output and a checkable transition gate.
- **Primary pass (Первичный проход)**: A single evaluation of a specific artifact version against the agreed scope.
- **Discussion round (Круг обсуждения)**: Participants submit their position once on a common input packet; the controller issues a disposition.
- **Remediation**: Modification addressing a confirmed defect. Verification of this fix is the subsequent pass, never an unconstrained general council.
- **Independence (Независимость)**: The reviewer is not the author of the change; for high-risk final verification, the reviewer is additionally neither the author of disputed premises nor the controller of execution.
- **Defect (Дефект)**: A unique violation of a verifiable requirement. A verdict, a finding count, or a document count is not a defect.
- **Uncertainty (Неопределённость)**: Incomplete data or missing capability. Yields `BLOCKED` or an explicit open inquiry, never a confirmed defect and never `PASS`.
- **Verification version (Версия проверки)**: Concrete Git commit SHA plus working tree status and Evidence receipt digest. A raw `HEAD` reference on a dirty tree is insufficient.

### Seven phases table
| # | Phase | Output | Transition Gate | Primary Passes | Repeat Triggers |
|---|---|---|---|---|---|
| 0 | Frame (Рамка) | Problem statement, scope, risk class, success criteria, immutable 40-hex baseline, forbidden paths, owner, executor | Task unambiguous; baseline recorded; guarantees listed | 1 | Scope or contract change |
| 1 | Diagnosis (Диагностика) | Reproduced problem; fact/hypothesis/gap map | Core premises verified against tree; unknowns named | 1 | New evidence contradicts premise |
| 1a | External research (Внешнее исследование, conditional) | Architecture brief: citation, verification date, supported claim, applicability boundary | Trigger recorded | 0 or 1 | Trigger discovered later |
| 2 | Solution (Решение) | One recommendation, at most two real alternatives including doing nothing; costs and constraints | Factual dispute settled by check; tradeoff presented to owner | 1 discussion | Owner requests alternative; factual conflict unresolved |
| 3 | Plan and adversarial review (План и враждебное ревью) | Ordered blocks with contracts, tests, rollback; expected PASS/FAIL; integration checklist | Independent reviewer leaves no unresolved mandatory objection | 1 independent pass | Plan-level blocker discovered |
| 4 | Implementation done-checked (Реализация сделано-проверено) | Per block: change + tests + reviewer signoff; then integration pass | Block proof closed; integration checks pass | 1 per block + 1 integration | Test failure; reviewer finding |
| 5 | Final adversarial audit (Итоговый враждебный аудит) | Findings ledger against complete candidate; scope, binding, freshness checks | No unresolved mandatory defect; certifier outside execution and control | 1 | FAIL/BLOCKED; candidate changed |
| 6 | Closure and backlog (Закрытие и бэклог) | Reconciled long-term docs, recorded constraints, next backlog queue | Owner informed; new work not started without assignment | 1 | New facts reopen decision |

### Execution rules and basis
- **One primary pass per phase**: A repetition is strictly forbidden unless triggered by one of exactly four conditions: (1) confirmed defect; (2) changed candidate or scope; (3) new external information; (4) incomplete closure proof. Repetition is never scheduled in advance.
- **Mapping of owner's 12 stages**: The owner's operational stages map directly onto these seven phases:
  - "Поиск проблем" (Problem search) -> Phase 1.
  - "Исследование практик" (Practice research) -> Phase 1a.
  - "Выработка решений" + "обсуждение решений" (Solution development & discussion) -> Phase 2 (single discussion round).
  - "Выработка плана" + "обсуждение плана" + "составление плана" (Plan formulation & review) -> Phase 3.
  - "Реализация сделано-проверено" (Done-checked implementation) -> Phase 4.
  - "Аудит итогов" and "корректирующие циклы" (Results audit & corrective cycles) -> **repeats of Phases 4 and 5 upon trigger, not separate phases**.
  - "Враждебный аудит итога" (Adversarial audit of results) -> Phase 5.
  - "Постановка задач нового цикла" (Next cycle tasking) -> Phase 6.
- **Scientific foundation**: Kaesberg et al. (ACL Findings 2025: increasing the number of agents improves performance, while more discussion rounds before voting reduce it); Porter (88 inspections: one reviewer is less effective than two, but two reviewers are no less effective than four; sequential inspections double calendar interval without effectiveness gains). Principle: **pay for width (parallel independent review), not for depth (sequential discussion rounds)**. Nowhere is there an arbitrary requirement for "3 reviewers x 2 rounds"; every phase has an explicit named output and checkable transition gate.

### Phase details

#### Phase 0: Frame (Рамка)
- **Action**: The human owner or coordinator initiates work by defining the objective, constraints, risk class, forbidden paths, and assigned operational roles in `.ai/TASK.md`, establishing an immutable 40-hex baseline.
- **Artifacts**: Updated `.ai/TASK.md` (`## Roles`, `## Objective`, `## Acceptance criteria`, `## Constraints`), launch directive.
- **Gate**: Task scope unambiguous; immutable 40-hex baseline recorded; safety invariants listed.

#### Phase 1: Diagnosis (Диагностика)
- **Action**: Investigate repository state against tree and history; reproduce reported issues; produce fact/hypothesis/gap map.
- **Artifacts**: Diagnostic findings or reproduction notes.
- **Gate**: Key premises verified against repository tree; unknowns explicitly identified.

#### Phase 1a: External Research (Внешнее исследование, conditional)
- **Action**: Conduct external research only upon a recorded trigger (e.g. protocol gap, conflicting external claims, novel tooling requirement).
- **Artifacts**: Architecture brief citing primary source, date of access, claim supported, and boundary of applicability.
- **Gate**: Research trigger recorded; claims verified against primary sources.

#### Phase 2: Solution (Решение)
- **Action**: Formulate exactly one recommendation and at most two realistic alternatives (including "do nothing"), comparing costs and trade-offs in a single discussion round.
- **Artifacts**: Solution proposal or architectural recommendation.
- **Gate**: Factual disputes settled by empirical test; trade-offs submitted for owner decision.

#### Phase 3: Plan and Adversarial Review (План и враждебное ревью)
- **Action**: Structure work into verifiable blocks with dependencies, tests, rollback boundaries, and expected outcomes; submit plan for independent adversarial review.
- **Artifacts**: Plan document or `.ai/PLAN.md` section, adversarial plan review.
- **Gate**: Independent reviewer confirms no unresolved mandatory design defects.

#### Phase 4: Implementation Done-Checked (Реализация сделано-проверено)
- **Action**: Implementer executes changes block by block under the shared lock (`protocol-lock.cjs`). Each block carries positive and negative tests and reviewer signoff. After all blocks, execute an integration pass.
- **Artifacts**: Scoped modifications, tests, implementation report, persisted Unified Adversarial Audit Prompt, journal entry with five labels, evidence receipt.
- **Gate**: All block criteria satisfied, integration tests pass, validator reports 0 warnings, task status remains `In progress`.

#### Phase 5: Final Adversarial Audit (Итоговый враждебный аудит)
- **Action**: Independent parallel reviewers outside execution and control inspect the complete candidate against the persisted Unified Adversarial Audit Prompt, verifying scope, receipts, and edge cases. Produce findings ledger with explicit verdict.
- **Artifacts**: Certifying review documents (`Mode: CERTIFYING`), session journals citing reviews, deep verification receipts.
- **Gate**: Zero unresolved mandatory defects (`PASS` or `RECOMMENDATION`), completion gate satisfies strict/light path requirements.

#### Phase 6: Closure and Backlog (Закрытие и бэклог)
- **Action**: Reconcile long-term documentation (`PROTOCOL.md`, `PAIRED-CYCLE.md`), append decisions and registry rows where required, record deferred items in backlog, safely stop sessions.
- **Artifacts**: Updated long-term documentation, updated registry, stopped sessions.
- **Gate**: Repository clean and consistent; owner informed; no new work begun without assignment.

## 3. Severity Rubric and Objective Blocking Rule (PROTO-DEC-0041, B3)

A primary failure mode identified in repository history was calibration divergence: reviewers detected identical defects but assigned conflicting severity labels, leading to split verdicts and redundant discussion rounds. PROTO-DEC-0041 resolves this with an objective blocking rule.

### Objective blocking rule
> Any **reproduced defect** that (a) violates a recorded invariant or contract, OR (b) lies on a protected path (core, security, data, gates, hooks, validator, manifest), **blocks regardless of the severity label the reviewer chose**; its verdict is `FAIL`, and lowering to `RECOMMENDATION` under "not critical" is strictly prohibited.

### Severity rubric
The rubric orders work inside the findings ledger and does not decide blocking by itself:

| Severity | Definition | Blocks? |
|---|---|---|
| **HIGH** | Violated recorded invariant, bypassed gate, or lost data/evidence | **Yes** (FAIL) |
| **MEDIUM** | Violated contract or documented behavior without a bypassed gate | **Yes**, if on protected path; No, otherwise |
| **LOW** | Documentation-to-behavior divergence, test coverage gap | No; goes to backlog |
| **INFO** | Observation, state drift, not candidate defect | No |

### Historical application
In the paired-cycle review cohort, all three reviewers (Codex, DeepSeek, Gemini) independently discovered **7 of 7 identical defects** (100% detection parity). However, Codex issued `FAIL` while DeepSeek and Gemini issued `RECOMMENDATION`. The entire verdict turned on a single finding: Phase 3 bypassing the completion gate of PROTO-DEC-0038 (PAIRED-CYCLE missing from `$docDigests`). Codex labeled it `HIGH`, whereas the other two labeled it `MEDIUM`. Under the objective blocking rule:
- A bypassed gate violates a recorded invariant -> rated `HIGH` -> **blocks automatically**.
- Even if labeled `MEDIUM`, it lies on a protected path (`.ai/docs/` and gate checks) -> **blocks automatically**.
Thus, the objective blocking rule eliminates verdict divergence without requiring additional reviewers or repetitive discussion rounds.

## 4. Blocks, Findings Ledger, and Symmetry of Evidence (PROTO-DEC-0041, PLAN Policy, B5)

### Block definition
A block is the smallest coherent change of **one verifiable contract** with clear dependencies and a rollback boundary. Arbitrary item counts do not guarantee quality (Wave B contained two items, R5 and R8, and both were overturned during re-audit).

Every block specification must declare:
`ID | requirement/invariant | input baseline | touched paths | dependencies | positive test | negative test | reviewer | closure condition`.

**Shared contract rule**:
> **A contract shared by two engines (PowerShell and Node) is NEVER split into independently accepted halves.** PowerShell and Node compatibility must be verified using one unified test matrix on identical inputs. (Violating this rule produced historical defects C40-04 and C40-06).

### Findings ledger format
Every review report records findings in a unified ledger:
`| ID | Requirement | Candidate | Reproduction | Actual Result | Severity | Disposition | Proof of Closure |`

**Disposition analysis fields** (analysis categories, not verdicts):
- `confirmed`: Defect reproduced and verified against the candidate state.
- `refuted`: Claim disproven with counter-evidence on the same state.
- `fixed-and-verified`: Defect resolved by remediation and confirmed by re-test.
- `deferred-by-owner`: Non-blocking item assigned to backlog by explicit owner decision.
- `unresolved`: Finding under investigation or blocked by missing capability.

### Symmetry of evidence
A refutation of a finding carries the **exact same burden of proof** as the finding itself, and must be verified on the same relevant state. A synthesis that dismisses findings is checked with the same rigor as the findings. A subsequent fix does not refute a historical finding, and a **majority vote does not override an empirical reproduction**. (Historical basis: in the v1.9.4 council, consensus dismissed findings regarding `__dirty`, but subsequent audit proved that `__dirty` indeed broke `hooks.snapshot`).

## 5. Anti-Idle Execution Rules (PROTO-DEC-0041, PLAN Policy, B7)

To prevent unproductive cycles, token waste, and process thrashing:
1. **One primary pass per phase**: Repetition is permitted strictly upon the four recorded triggers (confirmed defect, changed candidate/scope, new external information, incomplete proof of closure).
2. **Escalation budget**: Maximum two remediation attempts per root cause. If unresolved after two attempts, work stops and the issue is returned to the owner rather than convening a third council.
3. **One synthesis and one disposition table per round**: Eliminate per-item, per-phase, or "I agree" artifacts.
4. **Reserve corpus and journal capacity before creating artifacts** (classify-first archiving).
5. **Declare phase budget in advance**: If token or time budget is exceeded, stop and report immediately.
6. **One writer per repository**: Nobody writes to another session's journal or records a receipt for another owner.
7. **Background agent processes run persistent**: Long-running tests and tools must survive process group and session window transitions.
8. **No new council is convened** without an explicit owner directive or an unresolved reproduced blocker.
9. **`N/A` and `In progress` are honest states**: A gate check marked `not applicable` on an incomplete task certifies nothing and never falsely becomes `Completed`.
10. **A mandatory defect cannot be renamed to a recommendation** either by round limits or by voting.

## 6. Core Guardrails

1. **One Writer Under Shared Lock**: Shared documents (`.ai/TASK.md`, `.ai/PLAN.md`, `.ai/DECISIONS.md`, `.ai/ARCHIVE.md`, and in the protocol source repository `docs/decisions/REGISTRY.md`) require acquiring the lock via `node .ai/bin/protocol-lock.cjs acquire --owner <owner-name>` before editing, and releasing immediately after. Session journals require no lock.
2. **Chat and `.ai/runtime` Are Not Durable Memory**: Chat history and `.ai/runtime/` are disposable. If an agreement, decision, finding, or justification is not in the repository, it did not happen.
3. **Artifact & Receipt Lifecycle and Ordering (R4)**:
   - `protocol-handoff.cjs record` hashes the exact working tree. Session journals (`.ai/worklog/**`) and runtime state (`.ai/runtime/**`) are excluded from the tree digest; all tracked artifacts (`docs/reviews/**`, `.ai/TASK.md`, `.ai/PLAN.md`, etc.) are included.
   - Ordering rule: Persist all prompts, reviews, TASK updates, and archival moves **before** recording final receipts.
   - Verify producer receipts before consumer edits.
   - When multiple agents contribute to a deliverable, re-record each owner sequentially on the same final tree so that receipts do not become stale.
   - Quick vs full honesty: `--quick` is validator-only and never substitutes for running the full test suite. Final core receipts must use full `record`.
4. **Safe Review Paths for Installed Hosts (R7)**:
   - In the protocol source repository, review documents are located under `docs/reviews/`.
   - In installed host repositories, the host owner selects an in-repository review path (e.g., `reviews/`, `audit/`, `docs/reviews/`). Safe path rules require that review paths resolve inside the repository root without traversal (`..`), absolute paths, or link escapes.
5. **Owner Name vs Session ID (R3)**:
   - `protocol-session.cjs start` prints both a Session ID and an Owner name (e.g., `gemini-ceed538477bc3230`). Lock acquisition, handoff receipts (`--owner`), and completion gate checks bind to the **Owner name**, not the Session ID.
6. **Reuse Active Hook Journal (R3)**:
   - If an assistant operates in an environment where the `SessionStart` hook has already run and created an active session journal, it must reuse that active journal rather than running `protocol-session.cjs start` again (which would spawn a redundant session and journal).
7. **Human Language Preference Taken from TASK**: Honor the human-facing language defined in `.ai/TASK.md` (e.g., Russian `ru-RU`) for user interaction and explanations. Internal agent-to-agent prompts, cycle runbooks, and repository documentation may use English.
8. **Corpus Cap Protection**: Active review documents in `docs/reviews/` must not exceed 60 files or 600 KB. Reserve capacity before creating new artifacts. Archive older reviews when approaching the cap without rewriting immutable decision or archive ledgers.
9. **No Commits Unless Owner Instructs**: AI assistants must not run `git commit`, `git tag`, or `git push` unless explicitly instructed by the human owner.

## 7. Prompt Templates

### Template 1: OWNER-LAUNCH (Owner to Controller)
```markdown
# Owner Launch Directive: [TASK TITLE]

- **Date**: [YYYY-MM-DD]
- **Controller**: [e.g., DeepSeek]
- **Implementer**: [e.g., Gemini]
- **Language**: User-facing: [e.g., ru-RU]; Prompts/docs: English permitted.

## Objective
[Describe high-level objective and acceptance criteria.]

## Constraints & Freezes
- Feature freeze / scope bounds: [specify active constraints, e.g., PROTO-DEC-0039]
- No commits without owner instruction; one lock writer; receipts only after final tree.

## Instructions
1. Review .ai/TASK.md, .ai/PLAN.md, and git status.
2. Dispatch Phase 1 instructions to implementer using CONTROLLER-DISPATCH.
```

### Template 2: CONTROLLER-DISPATCH (Controller to Implementer)
```markdown
# Controller Dispatch: [SUBTASK TITLE]

- **Target Implementer**: [e.g., Gemini]
- **Role**: Implementer (Phase 2)
- **Session Prerequisite**: Start session via `node .ai/bin/protocol-session.cjs start --agent [agent]` OR reuse active session from SessionStart hook.

## Scope of Work
[Exact list of changes, files to touch, and boundaries.]

## Required Verification
1. Run `powershell -ExecutionPolicy Bypass -File .\validate-protocol.ps1`.
2. Run relevant tests:
   - For protocol source: `powershell -ExecutionPolicy Bypass -File .\test-protocol.ps1`.
   - For installed host: run project testCommand: [specify host test command].
3. Ensure validator reports 0 warnings and tests pass.

## Guardrails
- Acquire shared lock (`node .ai/bin/protocol-lock.cjs acquire --owner [owner-name]`) before editing shared docs (.ai/TASK.md, .ai/PLAN.md).
- Write session journal with all five labels (Agent, Action, Result, Next step, Open).
- Author and persist Unified Adversarial Audit Prompt (exact title `# Unified Adversarial Audit Prompt: [SUBTASK TITLE]`, <= 150 lines) before handoff.
- Record evidence receipt via `node .ai/bin/protocol-handoff.cjs record --owner [owner-name] [--quick]`.
- NEVER mark the task Completed in .ai/TASK.md.
- Release lock and halt for certifying review.
```

### Template 3: CERTIFY (Controller to Reviewer)
````markdown
# Certifying Review Request: [PHASE / DELIVERABLE TITLE]

- **Target Reviewer**: [e.g., DeepSeek]
- **Session Prerequisite**: Start fresh session via `node .ai/bin/protocol-session.cjs start --agent [reviewer]` OR reuse active session from SessionStart hook.
- **Mode**: CERTIFYING

## Review Target
- Implementer Owner Name: [implementer-owner-name]
- Journal Entry: [.ai/worklog/[implementer-owner-name].md]
- Implementation Report / Diffs: [paths or git diff summary]
- Persisted Prompt: [path to persisted Unified Adversarial Audit Prompt]

## Verification Directives
1. Verify implementer deep receipt: `node .ai/bin/protocol-handoff.cjs verify --owner [implementer-owner-name] --deep`.
2. Re-run `powershell -ExecutionPolicy Bypass -File .\validate-protocol.ps1` and test suite:
   - Protocol source suite: `powershell -ExecutionPolicy Bypass -File .\test-protocol.ps1`.
   - Installed host suite: [specify host testCommand].
3. Inspect diff for scope adherence, regressions, and guardrail compliance.
4. Persist certifying review output with mandatory header:
   ```markdown
   # Certifying Review: [TITLE]

   Reviewer: [reviewer name / model]
   Date: [YYYY-MM-DD]
   Reviewed commit: [commit hash]
   Working tree: [clean | dirty]
   Mode: CERTIFYING
   Receipt-Owner: [reviewer-owner-name]
   Scope: [scope description]
   scope-check: [PASS | FAIL]
   Verdict: [PASS | FAIL | BLOCKED | RECOMMENDATION]
   ```
5. Reviewer journal entry MUST explicitly cite the review path (e.g. `Action: reviewed [path]`).
6. Record certifying evidence receipt in reviewer journal: `node .ai/bin/protocol-handoff.cjs record --owner [reviewer-owner-name]`.
````

### Template 4: Unified Adversarial Audit Prompt (For Peer Models)
```markdown
# Unified Adversarial Audit Prompt: [TASK / COMPONENT TITLE]

- **Target Reviewers**: [e.g., Claude, GPT/Codex, GLM, Qwen]
- **Mode**: ADVISORY / ADVERSARIAL CHALLENGE (or CERTIFYING if primary reviewer)
- **Reference State**: Anchor [commit-hash / working tree summary]

## Context & Changes
- Implemented Changes: [summary of files changed and architectural intent]
- Relevant Docs: [.ai/TASK.md, .ai/PLAN.md, .ai/docs/PAIRED-CYCLE.md]
- Verification Baseline: [validator status, test suite totals]
- Test Command:
  - Protocol source: `powershell -ExecutionPolicy Bypass -File .\test-protocol.ps1`
  - Host project: [host test command]

## Adversarial Challenge Questions
1. Concurrency & Contention: Are lock acquisition, release, and session invariants preserved under edge cases?
2. Scope & Drift: Does this change introduce undeclared behavioral drift, regression, or violate freeze constraints?
3. Edge Cases: Identify failure modes, corrupt states, or platform-specific quirks (e.g., Windows PS 5.1 vs Core).
4. Evidence Integrity: Are verification receipts sound, reproducible, and resistant to false green?
5. Lifecycle & Ordering: Are prompts, reviews, and task states persisted before receipts are recorded?

Provide itemized critical findings with reproduction steps and suggested remediation.
```

## 8. Completion Gate and Risk-Scaled Light-Path Contract (PROTO-DEC-0038, Wave C)

Tasks marked `Status: Completed` in `.ai/TASK.md` must satisfy the completion gate evaluated by both PowerShell (`validate-protocol.ps1`) and Node (`node .ai/bin/protocol-handoff.cjs gate-check`).

### Strict Path (Default)
Required for any changes touching core protocol files, hooks, gates, validators, tests, decisions, or consumer security/data paths.
- Fields in `## Completion gate`:
  ```markdown
  - Adversarial review prompt: docs/reviews/<prompt>.md
  - Independent review: docs/reviews/<review>.md
  ```
- In `role: source`, prompt and review paths must be under `docs/reviews/`. In `role: installed`, any safe in-root path is allowed.
- Independent review requires `Mode: CERTIFYING`, `Receipt-Owner: <owner-name>`, header region containing `Reviewer:` and `Verdict:` (`PASS` or `RECOMMENDATION`), and verifiable deep evidence binding in the owner's session journal.
- The final check of a high-risk candidate requires no fewer than two parallel independent certifiers (PROTO-DEC-0041 item 2), a single reviewer cannot close a high-risk Completed task, and the certifiers must be outside execution and control (item 1).

### Light Path (Risk-Scaled)
Available only for low-blast-radius documentation and configuration edits under PROTO-DEC-0038.
- Fields in `## Completion gate`:
  ```markdown
  - Scope: docs | config
  - Baseline: <40-hex sha>
  - Independent review: docs/reviews/<review>.md
  ```
- **Baseline Requirement**:
  - The baseline must be an **immutable** identifier: exactly 40 lowercase hexadecimal characters matching regex `^[0-9a-f]{40}$`. Moving references (`HEAD`, branch names, tags, short SHAs, or relative refs like `HEAD~1`) are rejected before calling Git; any non-40-hex reference forces the strict path.
  - The SHA must resolve via `git rev-parse --verify <sha>^{commit}` and be confirmed as an ancestor of HEAD via `git merge-base --is-ancestor <sha> HEAD`.
  - The baseline is fixed **before** implementation begins and recorded in the task dispatch. The reviewer separately confirms that this baseline covers the full scope of the task's work.
  - An absent, unresolved, non-ancestor baseline, or an empty changed set forces the strict path (an empty diff does not bypass gate verification).
- **Evaluation Order (Strict in both engines)**:
  1. **Raw Changed Set**: Computed against the declared baseline via `git diff --name-only <sha>` plus untracked files via `git ls-files --others --exclude-standard`. Excludes strictly and only `.ai/worklog/**`, `.ai/runtime/**`, and `.ai/TASK.md`. The review artifact is **not** excluded at this step.
  2. **Protected Paths Priority**: The raw set is immediately verified against all protected paths:
     - Directory trees: `.ai/**` (except worklog/runtime/TASK.md), `.claude/**`, `.github/**`, `.codex/**`, `tests/**`, `templates/**`, `docs/decisions/**`.
     - Root files: `AGENTS.md`, `CLAUDE.md`, `protocol-manifest.json`, `validate-protocol.ps1`, `setup-ai-protocol.ps1`, `test-protocol.ps1`.
     - Any path with an executable extension: `.ps1`, `.psm1`, `.cjs`, `.mjs`, `.js`, `.ts`, `.sh`, `.bat`, `.cmd`, `.py`.
     *Any match immediately forces the strict path.* A core modification can never be disguised by naming it as the review artifact.
  3. **Review Exclusion and Scope Check**: Only after protected path checks pass, the declared independent review artifact is removed from the changed set. The remaining set is checked against the declared scope:
     - `Scope: docs`: Every remaining file must be under `docs/` (excluding `docs/decisions/`) with extension `.md`, `.txt`, or `.rst`, OR be a root `README.md` / `CHANGELOG.md`. Files with other extensions (e.g. `.png`, `.svg`, `.js`) trigger the strict path.
     - `Scope: config`: Every remaining file must be in the allowlist `.gitattributes`, `.gitignore`, `.editorconfig`.
  4. **Fail-Safe Non-Empty Check**: If the remaining set after excluding the review artifact is empty, the strict path is forced.
- **Review Artifact Requirements**:
  - Header region is defined as text before the first line equal to `---`, or before the first `## ` heading, or the whole file.
  - `Reviewer:` and `Verdict:` must reside in the header region.
  - `Verdict:` must be strictly `PASS` or `RECOMMENDATION` (`PASS WITH BLOCKERS` is rejected).
  - `Mode: ADVISORY` and transcription markers (`transcribed ... by`, `transcription fallback`) are rejected anywhere in the file.
  - In `role: source`, the review path must be under `docs/reviews/`.
- **Residual Risk Note**: The declared baseline commit is a self-declaration. If an implementer commits core modifications and declares that commit as baseline, the diff against baseline will not reveal them. In Wave C, the gate prints the verified baseline upon success, and the baseline must be cited in the session journal and review.
