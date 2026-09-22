# Development Plan

Status: Approved
Task: Bounded paired-cycle remediation, then product pilots in Block-Puzzle and VPN
Author: GPT/Codex, revised by Claude; remediation dispatch added by Codex
Date: 2026-09-20
Approval: RuslanFomenko (pilot 2026-09-19; audit accepted and remediation dispatch authorized 2026-09-20, PROTO-DEC-0040)

Historical waves are recorded in `.ai/DECISIONS.md`. Approved scope now includes the finite remediation below; implementation details remain subject to independent review. The frozen product metrics are preserved.

## Objective

Remove the reproduced paired-cycle defects within PROTO-DEC-0040, then find out whether this protocol reduces rework and context loss on real product work. Do not turn remediation into another architecture project.

## Accepted audit and remediation dispatch

Primary evidence: `docs/reviews/2026-09-20-codex-paired-cycle-review.md` (Codex F-identifiers below). Corroborating inputs: `docs/reviews/2026-09-20-deepseek-flash-paired-cycle-review.md` and `docs/reviews/2026-09-20-gemini-paired-cycle-review.md`; their F-identifiers differ. Preserve all reviews as historical records.
Launch: `docs/reviews/2026-09-20-deepseek-gemini-paired-cycle-remediation-prompt.md`. Gemini implements; DeepSeek dispatches and independently certifies. Codex only records the accepted governance and handoff in this step.

| Item | Finding / scope | Required outcome and verification | State |
|---|---|---|---|
| R1 | F-001, F-007: managed integration | PAIRED-CYCLE host edits WARN, missing file FAIL; mandatory managed membership pinned; source/installed digest behavior tested without a version-number pin | Pending |
| R2 | F-002: closure ordering | Implementer-authored persisted unified prompt precedes independent CERTIFYING review; remediation loop; explicit final-state/gate check; no completion at prompt-only stop | Pending |
| R3 | F-003, F-004 and B: template portability | Unified marker, --deep, output Reviewer/Date/Mode/Receipt-Owner, journal review-path binding; owner vs session id explained; reuse active hook journal; exact source/host tests; filled templates pass existing checks | Pending |
| R4 | F-008 and A/H: artifact/evidence lifecycle | Persist before recording; verify producer before consumer changes; re-record relevant owners on the same final tree; accurately distinguish journal/runtime exclusions, staging/commit stability, quick vs full evidence | Pending |
| R5 | F-006: existing risk-scaling mismatch | Separately reviewed change to existing PS/Node checks; ordinary low-risk docs/config statement accepted; core/security/data retains full pair/fresh binding; unknown or misleading labels cannot downgrade risk | Pending |
| R6 | F-005: governance | PROTO-DEC-0040 + appended registry transition + TASK/PLAN/dispatch; independently confirm scope and provenance; no edits to old decisions | Recorded; verification pending |
| R7 | B/G/H: host contracts | Roles are examples, never auto-assigned; owner-selected safe review paths for installed hosts; no source-only prerequisites; actual 1.9.4/1.9.5 fixture upgrades and new install pass with Force; ordinary install limitations explicit | Pending |
| R8 | H/F-010: operational budgets | Restore <=30 journals through safe existing mechanisms; project corpus stays <=60 files/600 KB; reconcile existing validator budget claims with 0037 WARN-first policy; reserve room before artifacts; no new monitoring layer | Pending |

Every item needs a concrete reproduction/test and an independent disposition. R5 is a separate wave, not optional or silently deferred. No known mandatory defect may remain under a RECOMMENDATION verdict.

### Allowed implementation surface

`.ai/docs/PAIRED-CYCLE.md`, `.ai/docs/PROTOCOL.md`, `AGENTS.md`, `QUICKSTART.md`; `validate-protocol.ps1` and narrowly necessary `.ai/bin/protocol-handoff.cjs` risk/path checks; related existing tests and test fixtures. Change `protocol-manifest.json` only where delivery/test registration requires it; keep 1.9.6 declarations consistent. No installer algorithm rewrite, new service, receipt format, telemetry layer, network dependency or cross-repository write.
Administrative state: TASK/PLAN and this session's journal under their ownership rules; new prompts/reports; safe retention work using the existing tools. Existing decision/registry records are append-only, and review-corpus archiving never edits those ledgers or ARCHIVE. Journal archival may append history to ARCHIVE under lock; never edit another live session's journal.
Operational guides must describe implemented behavior, not silently claim that pending fixes already work. Update all relevant guides together with their tested implementation, not by copying source-only task/review links into managed host documents.

### Waves and closure

1. DeepSeek reads governance/reviews/current diff, reproduces failures, reserves artifact/journal capacity, and scopes R1-R4/R7. Gemini implements docs/integration/tests, saves implementation evidence and a unified adversarial prompt; DeepSeek certifies or returns explicit failed checks.
2. For R5 DeepSeek documents a conservative contract and adversarial cases in its dispatch/implementation note; Gemini implements it in existing checks. A one-line gate/config/security change is not low risk. Missing/ambiguous classification keeps the strict path. Test both source and installed behavior, including host-selected in-repository paths, traversal rejection and stale/missing review evidence.
3. Resolve R8 with classify-first housekeeping before final receipts; retain cited/active evidence and unknown-liveness sessions. If no eligible history can be archived safely, report the exact constraint instead of deleting or force-clearing live work. Implement only the already-approved budget check in the existing validator; document the warning/migration stage without inventing a past release milestone.
4. Gemini persists the final unified adversarial prompt covering R1-R8; DeepSeek publishes an independent CERTIFYING review (PASS only when mandatory items are resolved; RECOMMENDATION only for optional improvements). A review after further edits needs re-certification, not an edit of the old report. This authoring/dispatch step is not implementation completion.
5. Finalize reports, TASK acceptance fields, retention moves and other hashed artifacts before receipt recording. Each owner records its own final-tree receipt in sequence, then --deep verification. Run validator without a gate-bypass environment setting; no manual Evidence blocks. Product milestones keep the umbrella TASK In progress; prove Completed-path enforcement in isolated fixtures and report a live gate-check of In progress as N/A, not PASS certification.
6. Return to the preserved pilots below. Do not repeat a broad council or begin v2.0/MCP work.

### Required acceptance checks

- Full source validator (0 warnings at final acceptance) and `test-protocol.ps1`; tests run by full `record` need not be repeated absent changes/failure. New regressions must increase meaningful coverage, not preserve a hardcoded 255 count.
- Positive cases: canonical fresh install; host-edit WARN; valid strict core pair; low-risk independent statement; filled templates; owner-selected host review path; v1.9.4/v1.9.5 Force upgrades.
- Negative cases: missing managed file/entry, malformed title/header, absent or stale binding, advisory report in certifying slot, premature Completed, core/config/security edits disguised as docs, unknown risk, out-of-root paths. Preserve active-journal versus archived --deep semantics.
- Check cap accounting before artifact creation and after housekeeping; no removal of live/cited history. Preserve byte prefixes of append-only ledgers and immutable reports. Record actual current counts, version/commit/digest and independently verified scope.
- Do not "fix" F-009 (no unreleased tag): keep release instructions explicit. F-010 is state drift, not proof of fabricated tests; distinguish current measurements and historical claims. Preflight tests do not establish transactional installer rollback; document that limit without expanding this task.

## Proposed approach

Run 10 to 20 comparable product tasks split across two parallel pilot streams (`D:\Block-Puzzle` and `D:\VPN`), with handoffs between distinct assistants. Include a defect fix, a decision that gets superseded, two agents touching the same area, and a task resumed after an interruption.

Measure, per task: constraints lost between sessions, work redone, questions
the owner had to answer, time for the next agent to become productive, and the
share of effort spent maintaining protocol documents rather than the product.

Compare against the cheapest alternative that could work: one task file and one
handoff note, with no lock, no hooks and no evidence.

## Product pilot scope and structure

Per owner ruling Q4 and PROTO-DEC-0039, the pilot executes in both consumer repositories with mandatory structural mitigations:

1. **Triage First**: Each consumer repository must triage its parked working tree before any pilot task begins (Block-Puzzle: 43 dirty files; VPN: 34 dirty files). Sessions must read the diff, finish-or-revert, run the product's own test suite, and record one clean triage commit. No new task may start over a dirty tree.
2. **Disjoint Sessions**: Two completely disjoint sessions, one per repository. No agent and no task are shared between them, eliminating the DEC-0020 duplicate-assignment failure mode.
3. **Owner Objectives and Pre-Agreed Metrics**: The owner names one concrete objective and pre-agrees the five metrics for each repository before task 1. The 10-20 task budget is split across both streams.
4. **Boundary Isolation**: Protocol sessions never commit inside consumer repositories (PROTO-DEC-0025 item 4). Consumers run protocol v1.9.4 and are upgraded inside their own product sessions.
5. **Feature Freeze**: Protocol feature work is frozen except P0 defects, audit closure and the finite PROTO-DEC-0040 remediation above; the ordinary freeze resumes fully after that remediation. The pilot report still gates v2.0.
6. **Kill Criterion**: If the protocol arm does not beat the "one task file + one handoff note" control on the pre-agreed metrics, report the negative result honestly and move the v2.0 decision to reduction or retirement.
7. **Human-Facing Language**: User-facing communication for the current owner is Russian (`ru-RU`). Agent-to-agent prompts and repository documentation may remain English. A kernel-level configurable preference is deferred until after the pilot report or an explicit freeze exception.

## Alternatives considered

Pilot v2 / Repomix follow-ons remain closed by owner policy (PROTO-DEC-0036). H1 empirically refuted only the tested additive full raw-digest workflow; any future scoped retrieval experiment requires an owner-directed reopening and remains deferred until after this product-pilot report.
v2.0 architectural simplification (single Node validator with differential verification, liveness leaf module, protocol-handoff decomposition) is scheduled strictly after this pilot report exists (PROTO-DEC-0039).

## Risks

The pilot measures a protocol used by its own authors, who know it well. The numbers will flatter it. Agree the target metrics before starting, not after seeing the result; metrics are frozen before task 1.

A product task large enough to need handoffs is also large enough to hide whether the protocol or ordinary care produced the outcome. Prefer several small comparable tasks over one large one.

## Validation

A published table of tasks and outcomes per repository, including failures and control comparisons, showing which parts of the protocol earned their cost and which can be dropped.

## Frozen objectives and metrics (owner-named 2026-09-20)

Named by the owner by direct instruction on 2026-09-20 ("зафиксируем метрики"); operational definitions consolidated by the controller from the owner-supplied proposals and PLAN.md lines 20-25. Any change requires a new owner decision before task 1 of the affected stream. The five metric categories are frozen; product-specific guardrails are stop rules, not value metrics.

### Block-Puzzle (predominantly Dart; branch `dec-0024/av-polish`; 43 dirty files)
- **Objective**: triage the parked tree to one clean commit; close DEC-0024 Step 3 open items (p.2 continuity, p.7a dependency, p.7d focus; review 14); then complete Step 4c device verification and continue toward Stage B.
- **Metrics (five frozen categories)**: lost constraints 0 per task; rework <=10% of task lines changed; blocking owner questions <=1 per task; median time-to-first-correct-edit <= control; protocol share <=20% (>35% means the protocol does not pay).
- **Guardrails**: `flutter analyze` clean; product test suite green (re-measure at triage; 389/389 is a claim to verify); render baseline 26.1 ms / 38 fps not regressed.

### VPN (mixed Dart/Kotlin/Swift/Python; branch `master`; 34 dirty files)
- **Objective**: triage the parked tree to one clean commit; make release 2.6.7 verifiable: execute the CI gates (G2, currently 0 runs), produce SHA-256 manifests for real release binaries (G3.1), fix D4 (revocation never reaches nodes; packet-level proof required), and bring G3.2 to an owner decision.
- **Metrics (five frozen categories)**: lost constraints 0 per task; rework <=10% of task lines changed; blocking owner questions <=1 per task; median time-to-first-correct-edit <= control; protocol share <=20% (>35% means the protocol does not pay).
- **Guardrails**: product test suite green (17 passed baseline); routing claims need packet/connection-level evidence; no `.env` or key commits; no production changes.

### Method
Two disjoint streams; within each repository alternate protocol and control tasks (control = one task file plus one handoff note); measure per task from `git diff --numstat`, hook `firstEditMs` where available (transcript timestamps otherwise, method fixed in advance), reviewer verdicts and journals; report medians with n≈5 per repository as a descriptive comparison, never as significance.

## Review

- [x] Owner names objective and pre-agreed metrics for D:\Block-Puzzle (2026-09-20)
- [x] Owner names objective and pre-agreed metrics for D:\VPN (2026-09-20)
- [x] Triage commit completed in D:\Block-Puzzle (5ada2b9, recorded in TASK; not reverified in this documentation session)
- [ ] Triage commit completed in D:\VPN
- [x] Target metrics agreed before the first task (owner-named 2026-09-20 above)
- [ ] Paired-cycle R1-R8 independently accepted; full evidence and safe budgets recorded
- [x] Approved by owner (2026-09-19)

### Wave C: re-audit remediation (C40-01..C40-08)

Owner-ordered limited fix after the independent re-audit FAIL (docs/reviews/2026-09-20-codex-paired-cycle-remediation-reaudit.md). No new gate, classifier or architecture; only the reproduced defects.

1. C40-01/C40-05: protected paths are evaluated before the review-artifact exclusion; a review file can never hide a core change. The docs scope accepts only document extensions (.md, .txt, .rst) under docs/ plus root README.md and CHANGELOG.md; executable or other file types force the strict path.
2. C40-02: the light path requires `- Baseline: <commit-sha>`; the changed set is computed against that baseline (`git diff --name-only <sha>` plus untracked files). Missing or unresolvable baseline, git failure or an empty set keeps the strict path; committed work no longer flips a previously valid classification.
3. C40-04/C40-06: one header contract in both engines - Reviewer and Verdict in the top-level block before the first heading, verdict exactly PASS or RECOMMENDATION, ADVISORY and transcription markers rejected; reparse points rejected by both engines; the source role keeps docs/reviews/ for the strict and light paths, the installed role allows safe in-root paths.
4. C40-07: the corpus counter counts every file under docs/reviews (recursively) excluding docs/reviews/archive/, plus total bytes; WARN-first per PROTO-DEC-0037.
5. C40-08: CERTIFY template fences fixed; a filled-template gate test uses the real document; the historical upgrade test skips explicitly when release tags are absent; the light-gate contract is documented in .ai/docs/PAIRED-CYCLE.md and .ai/docs/PROTOCOL.md; TASK/PLAN dispositions match reality.
6. C40-03: the implementer and the reviewer each write their own journal entry citing their own review artifact; full records are made on the same final tree afterwards, then --deep verify.
7. Acceptance (closed 2026-09-20): the matrix is green 10/10 in BOTH engines; suite 300/300; validator 0 warnings; corpus 57 files / 607,450 B; journals 30. External re-review: Claude round-2 verified F-1..F-5 fixed and raised process items F-6..F-9, all closed; the external final spot (Claude) returned FAIL on state items S-1..S-4 (now fixed via the DeepSeek addendum), S-5 (implementer receipt pending a Gemini pass) and S-6/S-8 (moving-tree capacity events, resolved with the quiet tree; a re-spot runs when reviewer quota returns).

## Proposed cycle architecture (owner-requested research, 2026-09-20)

This section is Proposed, not approved by the approval of the earlier pilot/remediation plan. It does not supersede the freeze, Wave C acceptance or frozen product metrics.
Independent research and critique: `docs/reviews/2026-09-20-codex-cycle-history-research.md`; reproducible inventory and arithmetic: `docs/research/2026-09-20-cycle-history/`.
Candidate final policy: `docs/reviews/2026-09-20-codex-cycle-improvement-plan.md` (P0-P11): seven fixed phases, risk-scaled independent checks, conditional remediation, coherent implementation blocks, no universal three-reviewer/two-round rule.
One-round discussion dispatch: `docs/reviews/2026-09-20-codex-cycle-final-council-prompt.md`. One disposition pass and targeted fact checks precede the owner's explicit approval; no new general council by default.
Open: arithmetic and outcome-label corrections refute the claimed empirical optimum in the Claude study; policy choices remain proposals. No implementation of this process or release certification is claimed by the research session.

## Cycle architecture policy (owner-approved 2026-09-20; PLAN-level until the pilot report)

Binding rules are in PROTO-DEC-0041: certification independence, two parallel independent reviewers for high-risk,
closed verdict vocabulary forward of 2026-09-20, objective blocking rule with severity rubric, symmetry of evidence.
This section holds the parts the owner deliberately left reversible. Full analysis and verified sources:
`docs/research/2026-09-20-cycle-architecture/claude-final-decision.md`. Dispatch:
`docs/reviews/2026-09-20-deepseek-gemini-cycle-architecture-dispatch.md`.

Seven phases, each with an output and a checkable exit gate; a phase is a logical condition, not a file per step:
0 Frame (problem, scope, risk class, success criteria, immutable 40-hex baseline, forbidden paths, owner, executor);
1 Diagnosis (reproduced problem; fact/hypothesis/gap map); 1a External research, conditional on a recorded trigger;
2 Solution (one recommendation, at most two real alternatives including doing nothing); 3 Plan and its adversarial
review; 4 Implementation done-checked per block plus one integration pass; 5 Final adversarial audit outside
execution and control; 6 Closure, registry where required, next backlog.

One primary pass per phase. A repeat requires one of exactly four triggers: a confirmed defect; a changed candidate
or scope; new external information; an incomplete closure proof. Repetition is never scheduled in advance. The
owner's 12 stages map onto these: "audit of results" and "corrective cycles" are repeats of phases 4 and 5, not
phases of their own. Basis: Kaesberg et al., Findings of ACL 2025 - more agents improve performance while more
discussion rounds before voting reduce it; Porter's 88-inspection study - a sequential second inspection doubled the
interval without an effectiveness gain. Pay for width, not for depth.

Escalation budget: at most two remediation attempts per root cause, then stop and return the area or premise to the
owner rather than opening another general council. One synthesis and one disposition table per round. Reserve corpus
and journal capacity before creating artifacts. Declare a phase budget in advance; on exceed, stop and report. One
writer per repository; nobody writes another session's journal or records a receipt for another owner. Background
agent processes run persistent. No new council without an owner directive or an unresolved reproduced blocker.
`N/A` and `In progress` are honest states and never become Completed.

A block is the smallest coherent change of one verifiable contract with clear dependencies and a rollback boundary,
carrying ID, requirement, input baseline, touched paths, dependencies, positive test, negative test, reviewer and
closure condition. Item count is not a quality guarantee: Wave B held two items and both were overturned. A contract
shared by two engines is never split into independently accepted halves; PS/Node compatibility is verified with one
matrix of the same inputs. Findings ledger disposition values are analysis fields, not verdicts:
confirmed / refuted / fixed-and-verified / deferred-by-owner / unresolved.

Access tiers: T0 READ (reviewers, no writes); T1 SCOPED WRITE (implementer, only declared paths); T2 SHARED
DOCUMENTS (TASK/PLAN/DECISIONS/REGISTRY/ARCHIVE, lock holder only); T3 PRODUCT REPOSITORIES (product sessions only);
T4 INSTALL/CONFIG (disposable TEMP fixtures only). Block authorization record before a block starts: BlockID,
requester, approver, scope paths, purpose, baseline SHA, budget, single-use expiry. Legitimization: diff is a subset
of the authorized scope; no forbidden path touched; author is not the reviewer; a receipt binds the final tree and
the reviewer's journal cites its own artifact; the ledger entry exists. The first two checks have no executor in the
current tooling and the freeze forbids a new kernel gate, so they are a manual reviewer duty: run
`git diff --name-only <baseline>`, compare against the block scope, and record `scope-check: PASS|FAIL` with the path
list in the ledger. No automation is promised; it is a backlog candidate after the freeze lifts.

Evaluation uses the already-approved 10-20 task pilot and the five frozen metric categories unchanged. Added fields
are diagnostic only - task and risk class, phase, candidate, reviewer role and actual model where known, pass number,
what changed between passes, unique confirmed findings, disposition - and are not new success criteria. At this
sample size results are descriptive; no statistical optimum for the number of models is claimed. No new telemetry,
metric or gate is introduced.
