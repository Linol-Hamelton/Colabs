# Critique A: correctness, TCB, security and certification

Baseline-SHA: a4e6aef86440bc0e8da8f06c8f1d3f65af254367
Reviewed commit SHA: a4e6aef86440bc0e8da8f06c8f1d3f65af254367 (Part 1); cd90be1d3c1fede4e02f7ecff5b6507ea1f34338 (Part 2 inputs)
Model: gpt-6-astra (launch assignment; system identifies GPT-6)
Model-maker: OpenAI
Client: Codex
Effort: unknown to session; assigned high, no actual-effort mismatch established
Task-frame / scope-id: task:vmc-critique-a; parent program:validator-migration-council
UTC-date: 2026-09-25
Working tree: dirty; delivery HEAD 88376ed1cd1f6f469ac84e419936a36730b8b05c
Scope: advisory critique of D-01..D-18 and F-01..F-08
Mode: ADVISORY
Verdict: FAIL
Receipt-Owner: codex-fda1eee5684e0097

INFERENCE: Revise the draft before promoting it into the final plan. The bounded Node architecture, subprocess-first record adapter, independent expectations, cohort rollback and two-certifier gates are sound proposals. The draft nevertheless changes compatibility while claiming preservation, misstates the batch budget, and overstates the established security and cost of the proposed publication boundary. This is an advisory document verdict, not certification or authority to implement/reopen anything.

## Evidence and independence

FACT: The reviewed draft's SHA-256 is d2be5e2eda0c7248cf891a276bec2012f55836342919d36441a85f94e12b8cf8. All 13 frozen corpus byte hashes matched; draft/synthesis identities and source-contract checks are saved in `docs/research/2026-09-25-validator-migration-council/critique-A-checks.json`. Checked the named sources against `git ls-files`; round-3 outputs and the draft are permitted working-tree inputs, not baseline files.
FACT: Read all three syntheses and consulted the frozen corpus against the cited source passages. Code/decision citations below use the Part-1 baseline unless explicitly Part 2. Frozen round-1/round-2 reports are authorized POST-BASELINE INPUTS identified by CORPUS.txt; the draft and syntheses are authorized working-tree inputs. Did not open critique-B or the other critic's current journal before freezing this report.
FACT / POST-BASELINE OBSERVATION: Another session appended PROTO-DEC-0074 during this review (`.ai/DECISIONS.md:3007-3029`, current working tree). Future dispatches must resolve models from roles at launch. This does not alter the frozen draft's semantics or authorize this session to modify its launch files; validator subprocess containment is distinct from the agent-step progress watchdog.
FACT: Reproductions below are source-contract comparisons or explicitly labelled counterexamples to draft logic. They do not claim execution of a nonexistent Node candidate or credential profile. Existing push/hook reproductions are attributed to the package-L third-pass report; no push, credential inspection or security-profile experiment was performed here.
INFERENCE: Each agreement label is an advisory judgment. FACT establishes an observed source statement; INFERENCE derives its consequence; HYPOTHESIS marks an untested execution outcome. Report hashes/range checks do not establish semantic correctness or certify the draft.

## Part 1: Validator migration

### D-01 — AGREE

FACT: Node plus differential verification is accepted, while after-pilot timing remains explicit (`.ai/DECISIONS.md:1171-1172,1709`). The draft preserves the early-migration minority recommendation and separates recommendation from authority (`docs/research/2026-09-25-validator-migration-council/draft-decision.md:19-29`).
INFERENCE: Preserve operational timing until the timing/freeze authority is recorded. Recommend the bounded early option on its structural merits; a lack of measured speedup does not reverse the Node destination. No code or test split is authorized by this critique.

### D-02 — AGREE

FACT: The proposal limits handoff work to the caller adapter and shared gate predicates, leaving its larger split unscheduled (`docs/research/2026-09-25-validator-migration-council/draft-decision.md:31-41`). The existing validator depends on handoff for source receipt checks (`validate-protocol.ps1:869-885`).
INFERENCE: This is a coherent narrow scope. If the minimal dependency proves impossible, D-02's falsifier requires a new scoped plan/authority check; it must not automatically authorize the whole handoff split. Keep installer execution while deferring installer migration.

### D-03 — PARTLY AGREE

FACT: D-03 adopts synthesis-B's per-defect dispositions, including preserving runtime acceptance, but D-04 then chooses a new floor (`docs/research/2026-09-25-validator-migration-council/draft-decision.md:46-51,58-65`; `docs/research/2026-09-25-validator-migration-council/round3/synthesis-B.md:44-53`).
INFERENCE: Keep crash cases, independent expectations and explicit approved deltas. CMAP is a coverage seed whose normative claims must be checked against decisions/code/callers; it is not independent authority. CA-01 below must be resolved consistently with this disposition ledger. A newly reproduced protected-path false green remains blocking under `.ai/DECISIONS.md:1795`, even if OLD reproduces it.

### D-04 — DISAGREE — CA-01: qualification version becomes an unsupported installed-runtime floor

FACT / reproduction: Compare `git show a4e6aef:validate-protocol.ps1` lines 344-360 with `git show a4e6aef:test-protocol.ps1` lines 7-15. The validator checks that Node runs; the suite explicitly rejects majors below 22. Installed role excludes source tests (`validate-protocol.ps1:138-146`; `.ai/bin/protocol-handoff.cjs:30-48`). Mechanical source checks are CA-01 in the companion JSON.
FACT: The draft sets the strictest consumer's >=22 floor while saying enforcement changes nothing during parity (`docs/research/2026-09-25-validator-migration-council/draft-decision.md:63-65`). DBI-23 calls delegation a candidate, not an existing grant (`docs/research/2026-09-25-validator-migration-council/round1/DECISION-BOUNDARY.md:47`).
INFERENCE: A test-runner requirement does not establish every installed runtime's requirement. Testing on 22.21.0 is valid; changing accepted majors is a distinct compatibility delta. Deferring enforcement until qualification changes when the delta lands, not whether it exists. No installed fleet on 18-21 needs to be discovered before acknowledging that logical difference.
INFERENCE / change-my-mind condition: Preserve runtime acceptance and qualify on 22.21.0, or supply explicit scope/authority for a floor change plus source/installed old-version fixtures and its compatibility disposition. Do not derive that authority from a research table.

### D-05 — AGREE

FACT: D-05 makes the entry, four cohesive modules and a small gate leaf the proposed graph (`docs/research/2026-09-25-validator-migration-council/draft-decision.md:67-77`). The differing gate obligations are documented in `docs/research/2026-09-25-validator-migration-council/round1/VALIDATOR-CALL-GRAPH.md:51-53`.
INFERENCE: Accept the six-file shape without a DSL or plugin framework. Preserve one owner per predicate and ordered emission through the entry. The leaf must not import handoff, session, the entry or a helper that imports them; enforce this in the future dependency test.

### D-06 — PARTLY AGREE

FACT: Parser checking is native PowerShell; source self-check uses the actual invoking shell, while installed role does not execute the installer (`validate-protocol.ps1:237-245,1077-1102`).
INFERENCE: Retain both native operations where applicable, the unconditional ASCII scan, actual-shell forwarding and explicit PS5.1/pwsh qualification. Correct the blanket two-missing-check wording inherited by D-08: an installed no-PS host lacks required syntax capability, not a source-only installer check. The one-parser/one-self-check budgets are proposed structural gates subject to preserved diagnostics, not measured speed claims (`docs/research/2026-09-25-validator-migration-council/draft-decision.md:81-89`).

### D-07 — DISAGREE — CA-02: tracked-hook condition is a contract change

FACT / reproduction: `git show a4e6aef:validate-protocol.ps1`, lines 392-418, emits missing-Bash FAIL at line 408 before inspecting wrapper existence at 411-415. There is no tracked-hook predicate. D-07 adds that predicate and a hookless WARN (`docs/research/2026-09-25-validator-migration-council/draft-decision.md:93-101`; companion JSON CA-02).
INFERENCE: Assistant neutrality does not imply that an installed protocol may lose required hook capabilities. A working-tree wrapper can exist without being tracked; tracking is not the execution dependency. The all-missing-hooks case may also fail required-file checks, so this comparison proves severity drift, not a currently reproduced overall false green.
INFERENCE / change-my-mind condition: Preserve baseline Bash behavior for this port, or explicitly authorize a hookless-profile delta with manifest, wiring, untracked/ignored-wrapper and missing-capability fixtures. A future applicability rule must use the actual declared/installed dependencies, not only tracked names.

### D-08 — PARTLY AGREE — CA-03: specify fail-closed diagnostics and role applicability consistently

FACT / reproduction: Baseline summary/exit is a pure failure-count decision (`validate-protocol.ps1:1104-1109`). D-08 instead asks for nonzero with skipped-check WARNs and calls that preserved semantics (`docs/research/2026-09-25-validator-migration-council/draft-decision.md:108-113`; companion JSON CA-03).
INFERENCE: Accept fail-closed incomplete validation as the proposed no-PS extension. Define a required-capability FAIL diagnostic so counts, summary, coverage and exit 1 agree; informational WARN detail may accompany it. Otherwise a zero-FAIL API result could render Protocol OK while returning failure. This is a draft consistency defect, not an executed candidate failure.
FACT: A launched child returning nonzero is captured; failure to spawn throws (`.ai/bin/protocol-handoff.cjs:94-106`). INFERENCE: A failed quick receipt can record an honest failure after the Node caller adapter; fail-closed does not necessarily prevent all recording. Source/installed required checks must be separate as D-06 specifies.

### D-09 — AGREE

FACT: Existing record checks have a 900000 ms subprocess timeout and distinguish launch error from child exit (`.ai/bin/protocol-handoff.cjs:94-106`). D-09 retains this boundary initially (`docs/research/2026-09-25-validator-migration-council/draft-decision.md:117-125`).
INFERENCE: This avoids pretending a timer can interrupt synchronous in-process validation. Preserve check identity/receipt bytes, import purity, root/env isolation, Quiet semantics and explicit unknown-argument failure. Future direct calls require a separately qualified containment mechanism, not just a measured speed benefit.

### D-10 — PARTLY AGREE — CA-04: freeze the oracle's executable dependencies

FACT / reproduction: Standalone OLD calls `.ai/bin/protocol-handoff.cjs` from its own root for gate-check (`validate-protocol.ps1:869-885`; companion JSON CA-06). D-10 moves the candidate handoff to the new shared leaf while referring to frozen legacy implementations as oracle (`docs/research/2026-09-25-validator-migration-council/draft-decision.md:130-137`).
HYPOTHESIS / counterexample: Run a byte-frozen old PS script in the candidate root after that handoff change. Its gate child now executes candidate predicates, so OLD and NEW can share the same missing receipt predicate. Freezing only the script would not freeze that reference execution.
INFERENCE: Accept the shared production leaf, but explicitly run OLD in an isolated reference cohort containing its original handoff and transitive executable dependencies, manifest, fixture Git history and controlled environment. Hash that dependency closure; keep standalone gate and record-skip fixtures distinct. Synthesis-B already requests equivalent isolated roots (`docs/research/2026-09-25-validator-migration-council/round3/synthesis-B.md:79-84`); preserve this in final task acceptance, including after retirement.

### D-11 — PARTLY AGREE

FACT: D-11 adds per-NORMATIVE-FAIL mutation and retains sentinel, normalizer-review and disposable-copy protections (`docs/research/2026-09-25-validator-migration-council/draft-decision.md:139-149`).
INFERENCE: Accept that broader qualification target as a defensible proposal; my preference for sentinels is not a veto. Define a check by its semantic obligation, and distinguish redundant/equivalent mutants from untested branches. A missed mutant requires investigation, not automatically a new production defect. Mutation and fixture authors must not share an unchecked expectation assumption.
INFERENCE: Require a reviewed allowlist retaining raw stdout/stderr and forbid normalization of input bytes, severity, ordering, counts or required-check presence (`docs/research/2026-09-25-validator-migration-council/round3/synthesis-B.md:79-84`). If cost invalidates the target, reapprove the acceptance revision under its delegated authority; do not silently lower an already approved mandatory gate to a residual note.

### D-12 — AGREE

FACT: Both record modes use the quick-marked validator check and its gate-skip environment (`.ai/bin/protocol-handoff.cjs:25-28,94-103`). Research-only quick Evidence is approved by `.ai/DECISIONS.md:2858-2862`.
INFERENCE: Retain separate deep receipt/gate closure. Start/end SHA alone cannot detect dirty edits or a change reverted during a run; isolated controlled execution plus start/end tree identity provides the required operational argument. Quick remains validator evidence, never a regression-suite attestation (`docs/research/2026-09-25-validator-migration-council/draft-decision.md:151-161`).

### D-13 — PARTLY AGREE

FACT: The draft correctly brings the test split under authorization and adopts the G0..G8 ownership skeleton (`docs/research/2026-09-25-validator-migration-council/draft-decision.md:163-173`). That skeleton puts authorization and contract freeze before the split (`docs/research/2026-09-25-validator-migration-council/round3/synthesis-B.md:101-105`).
INFERENCE: Call the split the first implementation experiment, not a predecessor of authority/contract freeze. Package the changed test inventory and explicit stub modes together, freeze the split-only measured baseline, then attribute port benefit against it. Existing stateful sequences need scenario mapping. T must finish artifact writes before simultaneous X/Y work or occupy one of the two writer slots; read-only review is different from a third test-writing stream.

### D-14 — AGREE

FACT: D-14 adopts cohort rollback, a frozen pre-switch inventory and receipt correction without rewriting history (`docs/research/2026-09-25-validator-migration-council/draft-decision.md:175-185`).
INFERENCE: Keep both source and installed rollback drills, preserved user state and separately reviewed retirement. A historically authentic receipt from a defective validator is not proof that the checks were correct. Record affected identities and rerun after repair. Original explicit retirement authority can suffice without asking for it again; independent certification remains separate.

### D-15 — AGREE

FACT: The draft adopts all-descendant accounting, matched measurements, structural deliverables and correctness co-gates (`docs/research/2026-09-25-validator-migration-council/draft-decision.md:187-197`). M-06 mixes stub/real paths and the probe misses .NET children (`docs/research/2026-09-25-validator-migration-council/round2/challenge-B.md:31-50`).
INFERENCE: Preserve the engine-neutral census, paired peak memory and 2-3 validator-request qualification. The final plan must specify sample count, workload and treatment of measurement noise before results are seen. Historical ~3 s/309 s are context, not an adequate substitute for matched baselines. Report neutral speed honestly; do not use a structural benefit to hide an actual performance regression.

### D-16 — PARTLY AGREE — CA-05: do not reset the batch budget on each candidate

FACT / reproduction: `.ai/DECISIONS.md:1979` caps a batch at three certification rounds on distinct frozen candidates. Compare the per-frozen-candidate account in `docs/research/2026-09-25-validator-migration-council/draft-decision.md:201` and `docs/research/2026-09-25-validator-migration-council/round3/synthesis-A.md:62`; companion JSON CA-04 verifies the binding wording.
INFERENCE: Correct the summary before carrying it into the plan. Three attempts per candidate would restart the batch budget every time a fix creates a new candidate. Keep the binding batch cap, per-root-cause remediation history and owner escalation; no automatic reset by renaming/re-freezing.
INFERENCE: Otherwise agree: two parallel independent certifiers outside execution/control, separate quiet checkouts, T7 floor and availability preflight. A missing slot blocks certification; names are chosen after candidate-specific independence, not by a permanently privileged brand.

### D-17 — PARTLY AGREE

FACT: The owner-question filter prefers evidence/decisions/measurement/delegation before owner escalation (`docs/research/2026-09-25-validator-migration-council/OWNER-PROMPT.md:1175-1205`). D-17 carries timing plus cloud attestation policy (`docs/research/2026-09-25-validator-migration-council/draft-decision.md:211-221`).
INFERENCE: Timing survives. Keep cloud policy as an explicitly optional future departure from the fail-closed plan, and state which capabilities/attestations it would authorize; partial execution cannot factually become full execution by permission. Correct the claim that fail-closed necessarily blocks recording entirely (D-08). No new owner question is needed to preserve the current Node/Bash contract; ask only if a compatibility change is actually proposed. The certifier gap remains conditional, not a fact about future availability.

### D-18 — PARTLY AGREE

FACT: The union rejects using temporary performance relief as the permanent engine architecture (`docs/research/2026-09-25-validator-migration-council/draft-decision.md:223-233`).
INFERENCE: Retain that distinction explicitly: rejecting permanent optimize-only is compatible with deferring the scheduled port and testing the split first. A claim that migration is not necessary now does not itself reopen the Node destination. Only alternatives replacing an accepted decision need its reopening trigger; changing an unapproved module proposal does not require inventing a registry decision. Unsupported numerical benefit estimates stay hypotheses, not refuted measurements.

## Part 2: F-3P-1

FACT / authorized POST-BASELINE INPUTS: This part uses OWNER-DECISION-R3, the third-pass review, launch.cjs and P-L3-004 at cd90be1. It changes no Part-1 conclusion. The owner's opening status is OPEN - HYPOTHESIS UNDER VALIDATION (`docs/research/2026-09-25-validator-migration-council/OWNER-DECISION-R3.md:460-478`).

### F-01 — PARTLY AGREE — CA-06: capability isolation remains unproved

FACT: Current workers inherit `process.env`; scopeCheck compares local state after execution (`docs/research/2026-09-25-improvement-research/prompts/launch.cjs:428-436,499-507`). The previous review records successful override pushes with unchanged local state, and a worker-writable hook running in the launcher (`docs/reviews/2026-09-25-deepseek-core-arch-stage2-review-packageL-third-pass.md:73-91,93-112`). These are prior reproductions, not newly executed probes.
INFERENCE: The six-class inventory is useful. Scope checks and selective copy-back do not prevent publication. Removing environment variables/default helper configuration proves only that particular lookup routes are absent, not that the worker cannot read credential files, invoke a helper directly, use an API or modify a publisher input. The draft partly acknowledges this but its control table still reads more conclusively (`docs/research/2026-09-25-validator-migration-council/draft-decision.md:241-248`).
INFERENCE: Name each protected asset and denied capability, the actual enforcement boundary and residual. A prompt-injected cooperative agent can execute the same credential-recovery command as a deliberate adversary; classifying its intent differently does not remove that command from tool-misuse/injection acceptance. Do not require a VM merely by class name either.

### F-02 — PARTLY AGREE

FACT: The measured sufficiency gate and boundary question are retained (`docs/research/2026-09-25-validator-migration-council/draft-decision.md:250-254`). Synthesis-B conditions profile-only sufficiency on actual non-reachability (`docs/research/2026-09-25-validator-migration-council/round3/synthesis-B.md:198-201`).
INFERENCE: Accept conditional Level 1 with a predeclared Level-2 candidate, not a claim that a finite canary suite proves all future routes absent. Combine hostile route tests with an access/credential inventory and an enforced isolation argument. Unknown coverage stays blocked for closure. A separate identity also needs tested ACL, broker and client boundaries; it is not automatically sufficient merely because it has another username.
INFERENCE: L-1 genuinely changes scope: denying owner/project write authority does not establish prevention of arbitrary publication using another destination's authority. Retain that limitation until resolved. Remove the claim that small cost wins under every probability; CA-08 below gives the counterexample.

### F-03 — PARTLY AGREE — CA-07: current research must not get LOCAL_COMMIT

FACT / reproduction: `.ai/DECISIONS.md:2796-2799` forbids commit, tag and push for the research run; the launcher's HEAD/ref checks enforce that local boundary (`docs/research/2026-09-25-improvement-research/prompts/launch.cjs:432-433`). Yet the draft permits READ_ONLY/LOCAL_COMMIT for research today (`docs/research/2026-09-25-validator-migration-council/draft-decision.md:262`; companion JSON CA-05).
INFERENCE: Current research uses READ_ONLY with its explicitly permitted artifact writes and no commit/tag/ref mutation. LOCAL_COMMIT belongs only to a later task that already has commit authority. A mode can restrict an authorized task; it cannot create authority. This is a concrete authority contradiction, not a reason for another confirmation request.
INFERENCE: Otherwise accept default-deny modes and trusted external delivery as the architecture hypothesis (`docs/research/2026-09-25-validator-migration-council/draft-decision.md:258-261`). Bind task, exact candidate, stage, approved remote/ref and expected old OID in a publisher-owned request. Validate in an unprivileged context; publisher credentials must never reach job tests/hooks/config. Protect executable, state, descriptor and object intake from workers and sibling jobs. F-3P-2 closure must prevent privileged hook execution, not merely document its residual.
INFERENCE: Run audit queries in a trusted context; failed queries mean UNKNOWN. Ref differences require incident investigation and attribution, because another authorized actor may have changed the remote. Neither a difference nor equality alone proves the worker's behavior.

### F-04 — DISAGREE — CA-08: the justification row overstates security and measured cost

FACT / reproduction: Compare `docs/research/2026-09-25-validator-migration-council/draft-decision.md:268-270` with M-13 in `docs/research/2026-09-25-validator-migration-council/MEASUREMENTS.md`. M-13 measures a CIM process-table query, not creation of a Windows identity, container startup, credential provisioning or publisher delivery. The companion JSON CA-07 preserves the actual row.
INFERENCE: Neither that number nor an absence of recorded incidents establishes that isolation costs more than the risk. The draft's unconditional bypass-prevention claim also assumes the capability boundary whose sufficiency it leaves for F-05. Preserve variant 9 as the recommended hypothesis; mark runtime friction, maintenance and isolation overhead unmeasured. A ~50-line estimate is a source author's hypothesis, not a total implementation bound.
INFERENCE / change-my-mind condition: A revised row states conditional security and unknown costs, or a matched profile-only/separate-identity experiment establishes credential denial plus setup, launch, recovery and owner-intervention costs. That suffices; no maximum-isolation mandate follows.

### F-05 — PARTLY AGREE — CA-09: close on the whole acceptance conjunction

FACT: The draft has fourteen negative attempts, positive publication cases, receiver logs and unknown-coverage blocking, but its closure sentence singles out attempts 2, 5 and 9 failing for lack of credentials (`docs/research/2026-09-25-validator-migration-council/draft-decision.md:274-277`). The owner requires the hostile suite and positive target/stage tests (`docs/research/2026-09-25-validator-migration-council/OWNER-DECISION-R3.md:369-389`).
INFERENCE / counterexample: Those three attempts could fail while an API route or worker-writable publisher input succeeds. Therefore they are necessary examples, not a sufficient closure condition. Require every applicable negative/positive case, declared boundary acceptance, independent verification and actual F-3P-2 prevention. An exit code alone is weaker than trusted receiver-side absence of forbidden events; test payloads may conceal a failed inner command's status.
INFERENCE: Keep synthetic canaries, no production targets, transport/helper-specific lanes and no secret output. Non-reachability assertions cover files, OS stores, agents, sibling processes and publisher controls, not just executor environment variables. A disposable local bare remote tests routing; an authenticated test receiver tests denial of credentials. Do not require a nonexistent credential failure from a credentialless transport.
INFERENCE: Add approval-boundary tampering, cross-job writes, failed audit queries, transient push/revert, interrupted delivery and concurrent third-party ref changes. Accept prevention by any justified enforcement control before mutation, not only one expected error string. If a route cannot be tested, closure remains unproved.

### F-06 — DISAGREE — CA-08 continued: reverse hypothesis is not settled

FACT: F-06 states zero no-push friction and unanimous rejection of the reverse hypothesis for Level 1 (`docs/research/2026-09-25-validator-migration-council/draft-decision.md:279-281`). Synthesis-B instead leaves risk/cost unproved for this configuration and calls for measurement (`docs/research/2026-09-25-validator-migration-council/round3/synthesis-B.md:249-261`).
INFERENCE / counterexample: For finite severity, blast radius and workload with probability p=0, expected avoided loss is zero. Any positive implementation/maintenance cost exceeds it. The same holds for sufficiently small positive p. Thus low cost cannot win under every probability when p is UNKNOWN. Before/after network audits also add operations; zero friction is not a measured result.
INFERENCE: Keep the qualitative recommendation to test the smallest sufficient control and reserve stronger isolation for demonstrated need. Restore the minority position: reverse hypothesis credible for bounded no-authority tasks, unresolved for the actual credential-bearing configuration. This does not accept the risk or reopen Part 1.
INFERENCE / change-my-mind condition: Replace categorical risk/cost and consensus claims with that conditional conclusion, or supply a justified probability/impact range and measured workload costs sufficient to establish dominance.

### F-07 — PARTLY AGREE

FACT: The convergence map reduces Q2/Q9 to stronger agreement than synthesis-B gives (`docs/research/2026-09-25-validator-migration-council/draft-decision.md:285-296`; `docs/research/2026-09-25-validator-migration-council/round3/synthesis-B.md:198-201,249-261`).
INFERENCE: Retain Q1 external publisher, Q4 audit-only, Q5 tiny descriptor, Q6 non-self-granting escalation, Q7 default-deny and Q10 separate workflow/security boundaries. Q2 and Q8 are conditional on enforced capability denial and the complete acceptance conjunction; Q3 includes injection using hostile commands even if hostile intent is excluded; Q9 remains unproved rather than unanimous. Neither mode names nor consensus are security evidence.

### F-08 — DISAGREE — CA-10: critique agreement cannot resolve an untested finding

FACT / reproduction: F-08 proposes resolved-by-design when critics concur, while L-1/L-2 remain unresolved (`docs/research/2026-09-25-validator-migration-council/draft-decision.md:298-304`). The owner's status explicitly keeps F-3P-1 a hypothesis to validate (`docs/research/2026-09-25-validator-migration-council/OWNER-DECISION-R3.md:460-478`).
INFERENCE: Agreement can mark the architecture proposal ready for owner consideration. It cannot establish non-reachability, close the finding, accept the residual or determine the protected boundary. Keep F-3P-1 OPEN - HYPOTHESIS UNDER VALIDATION until the authorized implementation and full independent acceptance establish closure. Keep minor package-L corrections with their implementer, except the F-3P-2 dependency explicitly needed here.
INFERENCE / change-my-mind condition: Distinguish proposal status from finding status and retain the latter as OPEN; eventual closure requires the declared boundary, approved architecture, all applicable hostile/positive results and independent verification.

## Handoff

INFERENCE: Final synthesiser should resolve CA-01..CA-10 explicitly, carry corrected minority positions and keep every unresolved implementation measurement attached to an acceptance task. No new implementation, shared-governance edit, permission expansion or full-suite run is needed to make these draft corrections. No other critique was read before this report was frozen.
OPEN QUESTION: Actual reasoning effort is not exposed to this session; high is the assigned value. Per COMMON-LAUNCH, recorded without interrupting the review. L-1 and future cloud attestation policy remain the draft's policy questions; L-2 and performance baselines remain measurement work.

Drafter quality (draft-decision.md): ADEQUATE - preserves substantial dissent and useful acceptance structure, but its certification-budget summary and research-mode permission need correction (`docs/research/2026-09-25-validator-migration-council/draft-decision.md:201,262`).
