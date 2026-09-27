Mode: ADVISORY
Baseline: 7b6d17a; working tree status: dirty
Reviewer: DeepSeek 4.1 Flash, route `kilo run -m deepseek/deepseek-flash`, effort unknown (route exposes none, frozen as unknown), 2026-09-26
Scope: single plan for the OwnerIdeas revision resume - active items A-1..A-14, research frames R-1..R-7, two edit streams, order D1
Verdict: PLAN COMPLETE

# Plan: OwnerIdeas revision resume (DeepSeek)

- Frame `task:ownerideas-r3-plan-deepseek` (parent program `ownerideas-revision`); role: author of the
  single plan, not decider and not certifier. Session `deepseek-d08af75d8444685c`.
- Boundary [F]: RESOLUTION-CLAUDE sections 4-8 (active A-1..A-14, research R-1..R-7, unresolved
  U-1..U-14); PROTO-DEC-0079..0082 and the blocks they name; PROTO-DEC-0082's governor P-L0-008.
  OwnerIdeas files are seeds, never requirements (`RESOLUTION-CLAUDE.md:547-549`).
- Order [F]: PLAN-AMENDMENT overrides RESOLUTION section 10's suggested order. D1 is binding on this
  plan: Wave 1 route stabilization + tests + A-10; Wave 2 resolver v0 inside A-3, then the rest of
  A-3; A-5, A-6, A-12 fill the second stream. Wave 0 is already resolved (U-1/D6, U-2/D7, U-9/D8,
  A-2/D9); D6 requires the five packages to fit two streams (`PLAN-AMENDMENT.md:13-30`).
- Labels: [F] fact with `path:line` or decision id; [I] inference or plan design; [Q] open question.
  Nothing here is a decision (AGENTS.md section 2).

## Task one - DIG baseline count (R-L0-33)

Method [I], chosen to be reproducible by hand until the ledger exists (R-L0-36): count every item in
RESOLUTION section 6 whose maturity chain has an accepted decision and has not reached test and
end-to-end use; exclude research frames (not accepted implementations), DEFER items, and the
`IMPLEMENTED` rows of section 4.1.

| Bucket | Items | Count |
|---|---|---|
| Stream 1: kernel, runtime, routes | A-3, A-4, A-7, A-8, A-9, A-10, A-11, A-13, A-14, A-1 | 10 |
| Stream 2: model/task routing and records | A-5, A-6, A-12 | 3 |
| Source/governance (L0) | A-2 | 1 |
| **DIG baseline (this program)** | | **14** |

[I] Of the 14, thirteen rest on an accepted block; A-11 needs a small owner decision before its code
(RESOLUTION section 6). A-1's design is unblocked by PROTO-DEC-0081; only its enforcement waits for A-3
(PROTO-DEC-0081 Consequences). Not counted: the section 4.2 partially-implemented rows P-17..P-19,
P-25 (they are RESEARCH_CANDIDATE, mapped to R-1), P-23 (CORE-ARCH stage 2, another program), and
R-1..R-7 (frames, not accepted implementations). [Q] A program-wide DIG must also count
accepted-not-implemented items outside this program (for example the P-L0-008 validator checks,
R-L0-36, and the stage-2 role approval); this plan fixes only the OwnerIdeas-revision contribution.
Report RER together with backlog growth (R-L0-33).

## Boundary and hard constraints (assumptions stated)

- **Two-stream cap** [F]: PROTO-DEC-0048 item 7 allows one coordinator and at most two active edit
  streams for code, kernel and main documents, exempting research. U-1 is resolved by PROTO-DEC-0079
  item 5: the five packages are sequenced into at most two edit streams, so no new owner exemption is
  sought. This plan carries one active package per stream at a time.
- **Freeze** [F]: PROTO-DEC-0076 item 4 stays for every hypothesis except R-3, which PROTO-DEC-0080
  item 1 lifts for exactly one frame. R-3 is that frame.
- **No separate characterization layer** [F]: PROTO-DEC-0062 item 2 stands (PROTO-DEC-0079 item 3);
  task characterization stays a component inside P-L2-002.
- **Roles, not models** [F]: tasks and dispatch files name roles (PROTO-DEC-0074 item 2), except the
  frozen model assignment of this program (DISPATCH-OWNER section 20; `README.md:25-41`). This plan's
  own dispatch files are inside that exception; any file the kernel keeps names roles.
- **No prompt text in scripts** [F]: PROTO-DEC-0073 items 1-3. Every prompt stays a file named on the
  command line.
- **Kernel changes** [F]: stay inside CORE-ARCH (PROTO-DEC-0054 item 2; PROTO-DEC-0077 item 2) and are
  certified as high risk by two parallel independent reviewers outside execution and control
  (PROTO-DEC-0038 item 1; PROTO-DEC-0041 items 1-2).
- **Independence** [F]: Claude writes and launches the packages; DeepSeek writes this plan, pre-checks
  and later reviews. By PROTO-DEC-0079 item 6 neither certifies what it wrote, planned, launched or
  controlled; U-2 is closed (CLOSED closes the program, it is not a certification). Certification
  reviewers for the implementation must therefore come from outside that chain (Gemini, Mistral, Kimi,
  MiMo, Codex, subject to PROTO-DEC-0047 item 1 availability and independence).
- **Reopen nothing** [F]: a reopened decision needs a trigger row in `docs/decisions/REGISTRY.md`.
- **Research Evidence** [F]: research and design frames record with `record --quick` (PROTO-DEC-0071);
  any code, kernel or tooling change keeps a full `record`.

## D1 waves (this plan's order)

| Wave | Stream 1 (kernel, runtime, routes) | Stream 2 (model/task routing, records) |
|---|---|---|
| 1 | Route stabilization, its tests, and the A-10 run record | A-12 per-client procedure; A-6 alignments (no ruling needed) |
| 2 | Resolver v0 inside A-3, then the rest of A-3 | A-5 signals ledger; A-6 continues; R-3 frame opens (stream 2, major) |
| 3 | A-4 (after M-7); A-7, A-8, A-9, A-11; A-1 enforcement in A-3 | A-2 status-rule application; R-3 continues |
| Research (exempt from the edit cap) | R-1 (K4 harness first), R-5 after U-3, R-6 after K-launch, R-7 last | R-3 (only after its contract-first step); R-4 after K-launch, sequenced behind R-3's major slot |

[I] Wave 1 begins with route stabilization because PROTO-DEC-0079 item 1 puts route stability before
new capability, and because every later stage is dispatched through those routes.

## Five packages, two streams (D6)

[I] Proposed stage-5 decomposition; Claude owns the final split (DISPATCH-OWNER stages 5-6). Each row
covers A-items only; R-3 is a frame, not a package.

| Package | Stream | Contents (A-IDs) | Wave | Concurrent with |
|---|---|---|---|---|
| PKG-1 ROUTES | S1 | route stabilization + A-10 + A-14 | 1 | PKG-4 |
| PKG-2 DISPATCH | S1 | A-3 (resolver v0, then supervisor/watchdog/pinning/filters) + A-13 + A-11 | 2 | PKG-4, PKG-5 |
| PKG-3 KERNEL-TOOLS | S1 | A-4 (after M-7) + A-7 + A-8 + A-9 + A-1 enforcement (an increment to A-3) | 3 | PKG-5 |
| PKG-4 LEDGER+ALIGN | S2 | A-5 + A-6 | 1-2 | PKG-1, then PKG-2 |
| PKG-5 GOVERN | S2 | A-12 + A-1 design block and L0 procedure + A-2 | 2-3 | PKG-2, then PKG-3 |

At most one package per stream runs at a time; the table never shows more than two active. PKG-5's A-1
design may start in wave 2 while PKG-4 still holds stream 2 only if the stream limit is read per active
edit task and the two do not touch the same records; otherwise A-1 waits for PKG-4. [Q] This is a
stream-admission reading (R-L0-28), not a decision; flag if the owner or the gate disagrees.

## A-items

Risk class is PROTO-DEC-0038: **H** = protocol core or protected path (full adversarial prompt+report,
two parallel independent certifiers, 0041 item 2); **M** = docs/config/kernel record (one independent
reviewer statement, 0038 item 2, but a candidate kernel record takes the T7 floor, 0072); **L** =
low-blast-radius documentation.

### A-1 - Capability envelope and the four-outcome rule
- Goal/layer [F: RESOLUTION:363]: one kernel-wide capability envelope and the EXECUTE /
  DELEGATED-JUDGEMENT / OWNER-DECISION / STOP rule; permission inheritance on resume and fallback,
  expiry and supersession, delegated-judgement bounds, a delegation artifact. L0/L1.
- Home [I]: a design decision block (owner) + an L0 procedure extending P-L0-002 under
  `docs/core-arch/stage-1/`; enforcement inside A-3.
- Rests on [F]: PROTO-DEC-0081 (the no-repeat-confirmation principle of 0070 items 5-6 becomes
  general); also 0070 items 4-6, 0077 item 3, 0078 items 3-4, 0047 item 7, 0062 item 3.
- Blocked by [Q]: none for design. Enforcement waits for A-3.
- Scope/allowed paths [I]: the new L0 procedure record, the design block (owner), later the dispatcher.
- Dependencies [I]: design parallel to PKG-2; enforcement in PKG-3.
- Acceptance [I]: the L0 procedure lists the four outcomes and exactly-one-admissible-transition rule;
  the seven H-AUTH-02 checks (`H-AUTH-02.md:41-48`) become acceptance tests; a dispatcher test proves
  an action already allowed under a recorded delegation is not re-confirmed and an authority gap stops.
- Validation [I]: `powershell -ExecutionPolicy Bypass -File .\validate-protocol.ps1` plus the A-3
  dispatcher tests; full `record` for the code part.
- Risk/certification: **H**; two independent certifiers outside author/controller (0079 item 6).
- Stream: S1.

### A-2 - Status rule for OwnerIdeas
- Goal/layer [F: RESOLUTION:364]: an L0 source rule - OwnerIdeas files are advisory seeds ranked below
  PLAN; a file leaves the active corpus when the frame consuming it closes; agents never write their
  outputs into `OwnerIdeas/`. L0 (source conflicts).
- Home [I]: AGENTS.md section 1 and/or `L0-ROOT.md`; the rule itself is already decided by PROTO-DEC-0079
  item 7 (D9), so what remains is transcription.
- Scope/allowed paths [I]: `AGENTS.md` section 1, `docs/core-arch/stage-1/L0-ROOT.md`; plus the U-12
  status line already approved (PROTO-DEC-0079 item 8, executed cleanup).
- Dependencies [I]: none; can land in wave 1-2 as a doc alignment.
- Acceptance [I]: one rule text states all three clauses and ranks OwnerIdeas below PLAN; the dispatch
  closing condition "no second active source of truth" (`DISPATCH-OWNER.md:975`) is satisfiable by
  citation.
- Validation [I]: validator green; one independent reviewer statement (0038 item 2).
- Risk/certification: **M**; `AGENTS.md` is in `managed` (`protocol-manifest.json`), so [Q] whether a
  managed root document forces the protected-path pair under 0046 item 3 rather than the one-statement
  rule of 0038 item 2 is flagged, not solved.
- Stream: S2.

### A-3 - Kernel dispatch script (C-3)
- Goal/layer [F: RESOLUTION:365]: the kernel dispatcher and supervisor - workflowAI section 1.5 resolver
  (P-5, P-22), a supervisor per 0075/0078, the 0051 item 4 watchdog, launch pinning (0075 item 7,
  P-16), hard-constraint filters (P-6), M-8 Level-1, tests under `tests/*.test.cjs`. L3.
- Home [I]: a kernel dispatch script under `.ai/bin/` (proposal: `.ai/bin/protocol-dispatch.cjs`) plus
  the registry file of PROTO-DEC-0050 item 4 and `.ai/docs/CLI-AGENTS.md`.
- Rests on [F]: 0050 item 4; 0051 item 4; 0075 items 1-7, 9-11; 0076 item 3; 0078 item 1; resolver
  order 0079 item 2 (hard constraints -> 0059 floors -> cheapest live tier -> escalation only on a
  verified failure).
- Scope/allowed paths [I]: `.ai/bin/`, `.ai/docs/CLI-AGENTS.md`, the route registry data file, and
  `tests/`; no product code.
- Dependencies [I]: PKG-1's route registry and A-10 schema; R-3 fills resolver values later, so v0 runs
  on defaults and provider pages (PROTO-DEC-0080 Consequences).
- Acceptance [I]: the resolver assigns a primary and two substitutes by role; the supervisor implements
  the 0075 item 11 states and resume-first; error classes per 0075 item 4; hard ceiling per 0075 item 5;
  launch pinning per 0075 item 7 (input changed after pinning stops the launch or opens a revision); a
  script, not a model, owns statuses (0076 item 3); the watchdog wakes by session id up to three times
  then records FALLEN (0051 item 4).
- Validation [I]: `node tests/dispatch.test.cjs` (new) + `powershell -ExecutionPolicy Bypass -File
  .\validate-protocol.ps1` + full `test-protocol.ps1`; full `record`.
- Risk/certification: **H** (kernel, `.ai/`); two independent certifiers outside execution and control.
- Stream: S1.

### A-4 - Node validator
- Goal/layer [F: RESOLUTION:366]: the Node validator per `final-plan-2.md`, with the test-suite split
  (section M) and the validator API (P-20). L3.
- Home [I]: `.ai/bin/protocol-validate.cjs` and its PowerShell wrapper.
- Rests on [F]: 0077 items 1-2; 0025 item 5; 0039 item 3; gated by M-7 launch conditions
  (`docs/ops/BACKLOG.md:69-77`; `final-plan-2.md:533-543`).
- Scope/allowed paths [I]: `.ai/bin/`, `tests/validator*.test.cjs`, `validate-protocol.ps1` wrapper;
  design stays `final-plan-2.md`.
- Dependencies [I]: M-7 items 2-6 (certifier preflight, phase-0 baseline, oracle cohort, L correction
  pass); starts only after they hold.
- Acceptance [I]: differential parity with the PowerShell reference on one matrix (PLAN batching rule);
  suite split per section M; no gate weaker than today's.
- Validation [I]: `node tests/validator.test.cjs` + the differential check + full `record`.
- Risk/certification: **H**; two independent certifiers; the certifier preflight is an M-7 condition.
- Stream: S1.

### A-5 - Signals ledger
- Goal/layer [F: RESOLUTION:367]: one append-only signals ledger with the script-candidate and maturity
  ladder (P-9). L2/L3.
- Home [I]: `.ai/SIGNALS.md` (absent today, RESOLUTION:81) with the grammar of 0049 item 2, plus the
  procedure in `.ai/docs/CLI-AGENTS.md` (0051 item 5).
- Rests on [F]: 0045 item 6; 0047 item 8; 0051 items 1-3, 5.
- Scope/allowed paths [I]: the ledger file, `.ai/docs/CLI-AGENTS.md`, a processing script/tests.
- Dependencies [I]: none; fills stream 2 in wave 1-2.
- Acceptance [I]: fixed grammar, unparseable line exits 2 (0049 item 2); types procedure-gap,
  script-candidate, fall; a script counts by type; the 41 interim `Signal:` lines in active journals
  are migrated, never deleted.
- Validation [I]: a ledger grammar test with a silent-pass-through negative case (0047 item 8) +
  validator.
- Risk/certification: **H** (kernel under `.ai/`); two independent certifiers.
- Stream: S2.

### A-6 - Apply decided but unapplied rules
- Goal/layer [F: RESOLUTION:368]: P-L2-002 without Size (P-4, M-5); S-001 artifact validity (P-8);
  R-L3-004.4-5 against 0075 (M-5); research-cycle steps in S-003 (P-12). L2/L3.
- Home [I]: the records themselves - `docs/core-arch/stage-2/P-L2-002-model-selection.md`,
  `docs/core-arch/stage-4/P-L3-004-route-failover.md`, and the S-003 research-cycle record.
- Rests on [F]: 0074/0075 Consequences; 0072 (T7 floor follows the frame action).
- Scope/allowed paths [I]: those records only.
- Dependencies [I]: the next stage-2 fix round, or this program's PKG-4, whichever runs first
  (PROTO-DEC-0075 Consequences).
- Acceptance [I]: each record cites the block it applies; P-L2-002 scores no Size factor; R-L3-004.4-5
  reflect 0075 items 2-3 and 7; S-003 carries the research-cycle steps.
- Validation [I]: validator green; one independent reviewer statement per record (0038 item 2); a
  candidate kernel record edit also takes the T7 floor (0072).
- Risk/certification: **M** for the record edits; **H** if an edit changes an invariant.
- Stream: S2.

### A-7 - Navigation index over reviews and journals
- Goal/layer [F: RESOLUTION:369]: extend the index to reviews and journals. L3.
- Home [I]: `.ai/bin/protocol-index.cjs`, `tests/index.test.cjs`; package I-a (0057 item 5).
- Rests on [F]: 0057 item 5; 0044 item 2.
- Dependencies [I]: none beyond the current index.
- Acceptance [I]: `--check` reports staleness without rewriting; pointers only, never restating
  decisions; a review/journal unit that has no record is a question, a record with no unit is a defect
  (0044 item 4).
- Validation [I]: `node tests/index.test.cjs` + `node .ai/bin/protocol-index.cjs --check`.
- Risk/certification: **H** (kernel tool); two certifiers.
- Stream: S1.

### A-8 - protocol-core local checks
- Goal/layer [F: RESOLUTION:370]: local checks per `SPEC-protocol-core.md` (S3-T13). L0/L3.
- Home [I]: `docs/core-arch/stage-1/SPEC-protocol-core.md` is the spec; the code home is
  `.ai/core/`/`.ai/bin/` per the spec; shadow-only until P-L0-004 is approved (SPEC section 1).
- Rests on [F]: `SPEC-protocol-core.md:3` says "specification, not code"; P-L0-004 draft.
- Dependencies [I]: none to start; stays shadow.
- Acceptance [I]: local checks run in shadow beside the manual check and never gate; results advisory
  (0034 item 1).
- Validation [I]: a dedicated test plus validator.
- Risk/certification: **H** (kernel); two certifiers.
- Stream: S1.

### A-9 - `record --candidate` and the candidate package
- Goal/layer [F: RESOLUTION:371]: the candidate package (P-11). L2/L5.
- Home [I]: `.ai/bin/protocol-handoff.cjs`.
- Rests on [F]: Evidence and receipts exist; `--candidate` is absent; designed in CORE-ARCH-6 section 2
  (per review).
- Blocked by [Q]: its CORE-ARCH package must be scheduled first (RESOLUTION:371).
- Acceptance [I]: the flag creates a verifiable candidate package without weakening existing receipts.
- Validation [I]: `tests/handoff*.test.cjs` + full `record`.
- Risk/certification: **H**; two certifiers.
- Stream: S1.

### A-10 - One run-record schema
- Goal/layer [F: RESOLUTION:372]: one schema for the decided fields - cost and tries (0075 item 9),
  completion (item 6), a correct token count (P-7); quality-outcome fields wait for R-3. L2/L3.
- Home [I]: written and read by A-3 (the run state and the report of 0076 item 3); row grammar per
  0047 item 8.
- Rests on [F]: Launch line; Evidence; `USAGE.md`; Stop telemetry over-counts 2.96x
  (`CORE-ARCH-6.md:26`); 0075 item 9.
- Scope/allowed paths [I]: the run-record schema in the dispatch script, its state, and the handoff
  telemetry fix.
- Dependencies [I]: PKG-1 (route stabilization) ships it; PKG-2 consumes it.
- Acceptance [I]: a completed run record carries run id, frame/scope-id, role, resolved model/route/
  effort, tries, error classes, estimated/actual/cumulative cost, token count, completion, outputs and
  the Evidence path; the token count is validated against a measured baseline and the 2.96x over-count
  is removed; no quality field is invented before R-3.
- Validation [I]: a run-record test in `tests/`, `USAGE.md` cross-check, full `record`.
- Risk/certification: **H**; two certifiers.
- Stream: S1.

### A-11 - Secret redaction beyond journals
- Goal/layer [F: RESOLUTION:373]: extend redaction to runner logs, `USAGE.md` and copied-back
  transcripts (P-15). L3.
- Home [I]: `protocol-handoff.cjs` and the dispatcher.
- Rests on [F]: I-9 (journal scan, AGENTS section 7); L-CORRECTION-4 job credential scrub (per review).
- Blocked by [F]: a small owner **D** (RESOLUTION:373) before code.
- Acceptance [I]: a scan rule covers logs and copied transcripts; a negative test plants a fake token
  and expects a block.
- Validation [I]: `tests/handoff*.test.cjs` + full `record`.
- Risk/certification: **H**; two certifiers.
- Stream: S1.

### A-12 - Per-client procedure for setting model and effort
- Goal/layer [F: RESOLUTION:374]: a per-client procedure for setting the model and effort after launch
  (0065 item 2; P-24). L3.
- Home [I]: `docs/core-arch/stage-4/` as a new L3/L4 procedure record (CORE-ARCH-5).
- Rests on [F]: PROTO-DEC-0065 item 2.
- Dependencies [I]: none; fills stream 2 in wave 1.
- Acceptance [I]: for each client, the exact way to set model/effort after launch, taken from `--help`
  and a verification date (0047 item 9); no brand hardcoded as a reason (0058 rule 5).
- Validation [I]: validator green; one independent reviewer statement.
- Risk/certification: **M**; one statement (raise to **H** if it becomes kernel-enforced).
- Stream: S2.

### A-13 - First real launch of the private-clone launcher; run-chain Level-1
- Goal/layer [F: RESOLUTION:375]: the first real launch and the Level-1 environment (P-10). L3.
- Home [I]: `launch.cjs`, or folded into A-3 / the unified dispatch script.
- Rests on [F]: `launch.cjs` certified RECOMMENDATION (BACKLOG C-7); never launched; run-chain runs in
  the checkout with the owner's credentials (M-8).
- Dependencies [I]: route stabilization (PKG-1/PKG-2); M-3 re-resolution before K-launch.
- Acceptance [I]: one job runs in a disposable private clone with the Level-1 environment; any diff
  outside scope is a STOP; `ls-remote` audit only.
- Validation [I]: the launch's own journal plus a full `record` for any code change.
- Risk/certification: **H** for code/runtime; two certifiers for the code part; the launch itself is an
  operation whose evidence is its journal.
- Stream: S1.

### A-14 - One output and error schema across `.ai/bin`
- Goal/layer [F: RESOLUTION:376]: one output/error schema (P-21). L3.
- Home [I]: a convention adopted inside A-3 and A-4; low priority.
- Rests on [F]: exit 2 (0049 item 2); rows (0047 item 8); error classes (0075 item 4).
- Acceptance [I]: every script prints rows and exits 2 on unknown input; one documented schema.
- Validation [I]: validator + the existing rulebook tests.
- Risk/certification: **L-M**, folded into A-3/A-4 reviews; no separate certification.
- Stream: S1.

## R-items

Each R-item states stream and size (R-L0-23) and can end only in ACCEPT, REJECT, EXPERIMENT or DEFER
(R-L0-26); the gate owner records which. No R-item is an implementation task before its synthesis and a
decision (RESOLUTION:565).

### R-1 - K4 packet-completeness harness, then the RISK council
- Question [F: RESOLUTION:386]: does bounded context hold at scale; which TCB, epoch, trust-boundary,
  data-read, graph and diversity rules does v2 need?
- Evidence gap [F]: packets 43-63 KB against a 40 KB hypothesis, never measured end to end; no PoC for
  H-SEC-02; no TCB list beyond the validator.
- Gate [F]: owner sequencing (BACKLOG C-4; U-10); the >=6-makers condition (U-11).
- Inputs [F]: `OwnerIdeas/RISK_COUNCIL.md`, `OwnerIdeas/H-AUTH-02.md`.
- Expected output [I]: measured K4 results, then a council synthesis feeding a decision.
- Stop criteria [I]: stop when the harness yields a decision-relevant number or the owner sequences the
  council; the frame goes to its gate.
- Stream 1, **major**. Terminal verdict [I]: EXPERIMENT (harness), then ACCEPT/REJECT the v2 rules.

### R-2 - Epistemic diversity (inside R-1 or alone)
- Question [F: RESOLUTION:387]: when is a different family or provider mandatory for high risk?
- Evidence gap [F]: common-mode failure is unmeasured.
- Gate [F]: owner decision after R-1.
- Inputs [F]: RISK H-IND-01.
- Expected output [I]: a rule with a measured basis or a DEFER.
- Stop criteria [I]: no new evidence after R-1 -> DEFER to the backlog with a reopen trigger.
- Stream 1, **minor**. Terminal verdict [I]: DEFER now, then ACCEPT/REJECT.

### R-3 - One model-layer frame
- Question [F: RESOLUTION:388]: which task factors predict success; does a local-outcome loop beat the
  owner's ladder; when do local results outweigh priors (H-WAI-3)?
- Evidence gap [F]: 10 dangling source markers; no run records (A-10); conflicts with 0062 item 2 and
  0063 item 1.
- Gate [F]: PROTO-DEC-0080 item 1 lifts PROTO-DEC-0076 item 4 for this one frame; H-WAI-2..5 stay
  frozen; U-5, U-6, U-7 are resolved (0079 items 3-4; 0080 item 2).
- Inputs [F]: `benchmark.md`, `executor.md`, `task_profife.md`, `performers.md:1-137`.
- Contract-first steps [F: PROTO-DEC-0080 item 1]: fix the TaskProfile, ModelProfile and resolver-output
  schemas; fix one shared capability-dimension set from `benchmark.md` sections 2-8; research fills
  values and never changes a schema without an owner decision; step one recovers or removes the 10
  `:chatgpt-content-reference` markers. No separate characterization layer (0062 item 2; 0079 item 3).
- Link to v0 [F: PROTO-DEC-0080 Consequences]: R-3 fills values; resolver v0 runs on defaults and
  provider pages until then.
- Expected output [I]: recovered citations, the fixed schemas/dimensions, filled capability values, and
  evidence on the H-WAI hypotheses.
- Stop criteria [I]: stop at the gate when no new decision-relevant evidence appears (R-L0-31); if a
  hypothesis cannot be given thresholds, DEFER it with a reopen trigger.
- Stream 2, **major**. Terminal verdict [I]: EXPERIMENT for the hypotheses; ACCEPT for the
  schema/dimension design if the owner approves; DEFER for any part without measurable thresholds.

### R-4 - Study B, adaptive execution depth
- Question [F: RESOLUTION:389]: as PROTO-DEC-0066 item 1 frames it.
- Evidence gap [F]: not started.
- Gate [F]: decided; waits for K-launch after M-3.
- Inputs [F]: the 0066 package.
- Expected output [I]: an adaptive-depth policy proposal.
- Stop criteria [I]: owner gate after the study; no prototype before priorities are approved (0066 item 5).
- Stream 2, **major**. Terminal verdict [I]: ACCEPT or REJECT the policy; EXPERIMENT if it needs an A/B.

### R-5 - Write coordination and scale
- Question [F: RESOLUTION:390]: does a real write bottleneck exist above two streams; if so, broker,
  optimistic concurrency, lease/fencing, or the lock?
- Evidence gap [F]: `scripts.md:1436-1450` asks for falsification; no workload above two streams exists
  under 0048 item 7.
- Gate [F]: U-3 (is a write broker in scope at all), 0076 item 4.
- Inputs [F]: `OwnerIdeas/scripts.md` (after cleanup).
- Expected output [I]: a falsification result or a measured bottleneck.
- Stop criteria [I]: a falsification list that shows no bottleneck -> REJECT/DEFER.
- Stream 1, **minor**. Terminal verdict [I]: EXPERIMENT or DEFER; REJECT if U-3 declares it out of scope.

### R-6 - Study A
- Question [F: RESOLUTION:391]: as PROTO-DEC-0066 item 1 frames it; Rust only if Node misses the target.
- Evidence gap [F]: AX existence unverified; no Node baseline yet.
- Gate [F]: decided; waits for K-launch after M-3; U-4 (MCP facade).
- Inputs [F]: `Google_AX.md`, `MCP_Server.md`, `Rust.md`.
- Expected output [I]: a funnel/priority set feeding decisions.
- Stop criteria [I]: owner gate; Rust DEFERred until a Node baseline exists.
- Stream 1, **major**. Terminal verdict [I]: ACCEPT/REJECT per candidate; DEFER for Rust.

### R-7 - Delivery B against C; script and hook performance
- Question [F: RESOLUTION:392]: as `H-PROMPT-DELIVERY-01` section 4 and Track A ask.
- Evidence gap [F]: only one B and one C run are on record; hooks are unmeasured.
- Gate [F]: frozen hypothesis (`BACKLOG.md:109`); the Node phase-0 baseline first.
- Inputs [F]: `H-PROMPT-DELIVERY-01…md`, `scripts.md` Track A.
- Expected output [I]: a B-vs-C comparison and hook timings.
- Stop criteria [I]: if the phase-0 baseline is absent, DEFER.
- Stream 1, **minor**. Terminal verdict [I]: EXPERIMENT or DEFER.

## Governor admission flags (flagged, not solved)

[Q] Under R-L0-28 (at most 1 major and 1 minor ACTIVE per stream), several openings collide:
- Stream 1 majors: R-1 and R-6 cannot both be ACTIVE; sequence them or take an owner override.
- Stream 2 majors: R-3 occupies the stream-2 major slot; R-4 must wait for R-3 to close unless the
  owner overrides.
- Stream 2 minors: R-2 (if opened) shares the stream-2 minor slot with anything else there.
- The DEFER backlog cap, the resolver metric and the cost-versus-latency tie-break, the Kernel v1 scope
  and the operating threshold are owner-open (PROTO-DEC-0079 Open; R-L0-33/R-L0-35) and are not
  designed here.

## Flag, do not solve (PROTO-DEC-0079 Open; PLAN-AMENDMENT)

- The resolver metric (proposed: cost per accepted result including rework) and the cost-versus-latency
  tie-break.
- The DEFER cap; the Kernel v1 scope; the operating threshold.
- U-3 (write-broker scope), U-4 (MCP facade), U-8 (data-read authority), U-10 (RISK council
  sequencing), U-11 (council makers), U-13 ("M3"), U-14 (the fallback rule).
- [Q] A-2's risk class (managed root document), A-11's small decision, and A-9's scheduling question are
  returned as open, not designed.

## Critique and closure

- This plan gets one critique [F: R-L0-22; PLAN-AMENDMENT:31]: stage 4, the two independent critiques by
  Kimi and MiMo in parallel (DISPATCH-OWNER stage 4), each returning CONFIRM /
  CONFIRM_WITH_CHANGES / REJECT with specific findings.
- Then Claude resolves the critiques and fixes the scope and the five packages (stage 5); DeepSeek
  pre-checks (stage 7); the five executors run (stage 8); DeepSeek reviews the implementation, Gemini
  repairs, Mistral verifies, DeepSeek then Claude close (stages 9-12). `CLOSED` is not a certification
  (PROTO-DEC-0079 item 6).

## Open questions encountered

- [Q] The program-wide DIG count beyond the 14 items here (see Task one).
- [Q] Whether A-6's kernel-record edits and A-2's managed-path edit take the high-risk pair or the
  one-statement rule (0038 item 2 vs 0046 item 3) - flagged for the gate owner.
- [Q] Whether PKG-4 and PKG-5 may share stream 2 concurrently under R-L0-28 - flagged.
- [Q] A-8's exact code home (SPEC-protocol-core.md names `.ai/core/` per 0060 item 3) - flagged.
