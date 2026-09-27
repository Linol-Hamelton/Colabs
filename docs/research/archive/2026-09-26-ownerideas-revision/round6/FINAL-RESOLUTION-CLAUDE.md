Mode: ADVISORY
Baseline: 4905f86 (inputs read at e40c250..4905f86: b929ba9 cleanup, f965cde and 20d04e6 decisions); working tree status: dirty
Reviewer: Claude Opus 5.5, route claude CLI, effort high (DISPATCH.json after owner cap e40c250; the launch file still says xhigh), 2026-09-26
Scope: stage 5-6 - final resolution and five deterministic packages
Verdict: RESOLUTION COMPLETE

# Final resolution of the OwnerIdeas implementation plan (stage 5)

- Frame `task:ownerideas-r6-claude-final` (parent program `ownerideas-revision`, FRAMES F-01); role:
  resolver and package author. Session `claude-b68b3491ee12ebd9`. Nothing here is a decision
  (AGENTS.md section 2). I certify nothing (PROTO-DEC-0079 item 6; Appendix A item 2).
- Labels: **[F]** fact with `path:line` or a decision id, checked in this session; **[I]**
  inference or resolver design; **[Q]** open question for the owner.
- Packages: `round6/packages/PKG-1.md` .. `PKG-5.md`. Each carries every field of Appendix A item 7
  under a fixed heading, so the STOP-3 check of PROTO-DEC-0086 item 3 can be done by reading
  headings.
- A binding input arrived during this run [F]: PROTO-DEC-0086 (`.ai/DECISIONS.md:3766-3804`, commit
  20d04e6) names the certifiers (Kimi K2.7 Code HighSpeed, MiMo-V2.6-Flash), two stage-8 executors
  (E1 Gemini 3.8 Flash high, E2 Mistral Medium 3.5 max) and the stage-11 verifier (GPT-5.6 Sol).
  The stream split below is built for those two executors.

## 1. Executive summary

- **Scope.** The five packages implement the owner's order of PROTO-DEC-0079 item 1: routes first,
  then the run record, then resolver v0 inside the dispatcher, then the rest. They carry nine of the
  fourteen A-items in full or in part. Five items leave the package scope, each with a target
  (section 4.2).
  - A-4 (Node validator) is its own G0-G8 migration under PROTO-DEC-0077.
  - A-7, A-8 and A-9 already belong to CORE-ARCH packages I-a and I-b by accepted decisions.
  - A-11 has no decision yet.
- **Streams.** Two edit streams, three waves. A stream never holds two packages at once.
  - E1 (Gemini): PKG-1 routes (W1), then PKG-3 resolver and supervisor (W2).
  - E2 (Mistral): PKG-2 run record (W1), then PKG-4 kernel-record alignments (W2), then PKG-5
    signals ledger and the per-client procedure (W3).
- **Critiques.** All seven BLOCKING items are accepted. Two are accepted with a different fix than
  the critic asked:
  - MiMo B1 (the R-3 freeze wording) is overtaken by PROTO-DEC-0084 item 1;
  - Kimi B-1 (M-7) is resolved by taking A-4 out of the package scope and scheduling M-7 after W3.
- **DIG baseline: 13.** The count covers the A-items with an accepted block. A-11 is reported
  beside it as pending a decision (MiMo B2, Kimi R-2).
- **Risk.** PKG-1, PKG-2, PKG-3 and PKG-5 are high risk. They go to the two parallel certifiers of
  PROTO-DEC-0086 item 1. PKG-4 is medium: one independent reviewer statement, T7 floor.
- **Owner questions:** eleven in section 9, three of them material to execution: OQ-1 A-11, OQ-2
  the A-1 design block, OQ-3 the stall threshold.

## 2. Inputs and checks

[F] Read in full or at the cited lines:
- `round4/PLAN-DEEPSEEK.md`; `round5/CRITIQUE-KIMI.md`; `round5/CRITIQUE-MIMO.md`;
- `round3/RESOLUTION-CLAUDE.md` sections 1-10; `prompts/PLAN-AMENDMENT.md`;
  `prompts/FINAL-RESOLUTION.md`; `directives/MASTER-RESUME-AFTER-STAGE4.md`;
- `DISPATCH-OWNER.md:725-1104`;
- PROTO-DEC-0079..0086, and the blocks they cite: 0038, 0041, 0047-0051, 0054, 0055, 0057 item 5,
  0059, 0061, 0065, 0070, 0072-0078;
- `P-L0-008-research-governor.md` 0.4; `docs/research/FRAMES.md`; `docs/ops/BACKLOG.md`;
  `docs/ops/MODEL-ECONOMICS.md`; `workflowAI.md`; `MODEL-MATRIX.md:1-60,112-168`;
- `P-L2-002` 0.4; `P-L3-004:50-62`; `P-L0-002` 0.4; `L0-ROOT.md`; `procedure.schema.md:1-40`;
- `CORE-ARCH-4.md:51-80`; `CORE-ARCH-6.md:1-100,140-150`; `CORE-ARCH-7.md:128-197`;
  `SPEC-protocol-core.md:1-35`; `final-plan-2.md:292-376,533-543`;
- `OWNER-DECISION-execution-model-2026-09-25.md:55-305`; `OwnerIdeas/H-AUTH-02.md`;
- `.ai/docs/CLI-AGENTS.md`; `protocol-manifest.json`; `tests/manifest.test.cjs:68-72`;
- `run-chain.cjs` (the adapters and the tick loop); `launch.cjs:1-250,405-654`;
- `.ai/bin/protocol-hooks.cjs:600-640`; `.ai/bin/protocol.cjs:212-288`.

Checks run in this session [F]:
- `.ai/bin/` holds ten scripts. There is no dispatch, run-record or signals script, and no
  `.ai/SIGNALS.md`.
- `tests/` holds 21 `.cjs` files. `tests/manifest.test.cjs:68-72` requires every one to be listed in
  `protocol-manifest.json` `tests`.
- `recordSessionMetric` (`protocol-hooks.cjs:621-641`) appends one row per Stop. Stop runs after
  every response (`:614`), so rows outnumber sessions. That is the 2.96x of
  `docs/research/archive/2026-09-23-routing/INDEX-draft.md:21-22` (archived; provenance only,
  PROTO-DEC-0085 item 5; PKG-2 quotes the figure). Nothing in `.ai/bin` reads
  `sessions.jsonl` (`protocol.cjs telemetry` counts journal entries only, `:212-288`).
- Interim `Signal:` lines: 35 in 19 active journals and 58 in `.ai/ARCHIVE.md` at 4905f86. The
  count moves; PKG-5 counts at run time.
- MODEL-MATRIX tier cells [F: `MODEL-MATRIX.md:130,132`]:
  - `3.8-flash / high` is Google T9 (E1 executor);
  - `medium-3.5 / max` fills T1-T9 (E2 executor).
  Both meet the T7 floor of PROTO-DEC-0059 item 2, read as within-provider ranks (PROTO-DEC-0086
  item 5).
- `run-chain.cjs:31-46` and `launch.cjs:228-243` assemble client commands in code, and they
  disagree on flags. For example, agy gets `--mode accept-edits` in one and
  `--dangerously-skip-permissions` in the other. This is the "two launch paths" of PROTO-DEC-0079
  item 1.

Independence [F]: no stage-7 or later output exists. `round6/` did not exist before this run.

## 3. Critique items: accept or reject with a reason

### 3.1 BLOCKING items (seven; Appendix A item 8)

| Item | Claim | Ruling | Reason and where it lands |
|---|---|---|---|
| Kimi B-1 | A-4 waits for M-7, and no wave schedules M-7 | **ACCEPT the defect; the fix differs** | [F] A-4 is the whole validator migration, phases 0-6 with its own DAG and two write streams (`final-plan-2.md:292-304,338`). No single package can hold it without breaking the stream cap. M-7's condition (4) needs *exclusive* workstation runs (`final-plan-2.md:539-540`), which cannot overlap E1/E2. So: A-4 leaves the package scope with TRANSFER(BACKLOG C-2/M-7), and **M-7 is scheduled as milestone W4-M7, after W3 integration** (section 6). Its conditions (3)-(6) are owner and coordinator acts, not executor work. |
| Kimi B-2 | PKG-4 and PKG-5 share stream 2 in wave 2 | **ACCEPT** | [I] No stream ever holds two packages. In this resolution E2 runs PKG-4 in W2 and then PKG-5 in W3; E1 runs PKG-3 in W2. The plan's "per active edit task" reading (`PLAN-DEEPSEEK.md:96-99`) is **rejected**: PROTO-DEC-0048 item 7 counts streams, not tasks. The requested owner-override route (R-L0-22.25) does not apply: packages are not frames (R-L0-22.4; Appendix A item 5), and the frame-stream limits R-L0-22.24-22.28 do not govern E1/E2. |
| Kimi B-3 | A-9 sits in wave 3, but its CORE-ARCH package is unscheduled | **ACCEPT** (move A-9 out) | [F] `record --candidate` is CORE-ARCH package I-b. Its design is task S3-T14 of stage 3 (`CORE-ARCH-6.md:31-54`; `CORE-ARCH-7.md:133`). Stage 3 waits for study B (FRAMES F-03, F-05). Putting it in a package now would design inside an implementation. TRANSFER(F-03, package I-b). |
| MiMo B1 | The R-3 gate says H-WAI-2..5 stay frozen, yet the plan promises evidence on them | **ACCEPT the inconsistency; REJECT the requested rewrite** | [F] PROTO-DEC-0084 item 1 (later than both the plan and the critique) gives F-02 = R-3 one primary question. It states that "H-WAI-1..6 are not researched in F-02; they stay DEFERred" (FRAMES D-03). The critique asked for "unfrozen inside R-3 only", which would contradict 0084. The final text: R-3 is F-02 with the single question of 0084 item 1; H-WAI-1..6 are D-03. No package touches R-3 (Appendix A item 4). |
| MiMo B2 | The DIG baseline counts A-11, which has no accepted block | **ACCEPT** | [F] RESOLUTION:373 marks A-11 **D**, then I. R-L0-22.41 counts accepted items only. Baseline = **13**; A-11 is reported beside it (section 5). |
| MiMo B3 | The wave table and the package table disagree (A-11, A-12); A-13 and A-14 have no wave | **ACCEPT** | [I] One table only (section 6) places every A-item: in a package with a wave, or out of scope with a target. A-13 and A-14 are in PKG-1; A-12 is in PKG-5 (W3); A-11 is out of scope (OQ-1). |
| MiMo B4 | A-6's dependency misquotes PROTO-DEC-0075 and is circular through PKG-4 | **ACCEPT** | [F] 0075 Consequences: "the next stage-2 fix round or in the stage-4 dispatch script, whichever the owner schedules first" (`DECISIONS.md:3179-3182`). PROTO-DEC-0079 item 1(4) schedules the A-items in this program, which makes this program the first scheduling. A-6's P-L3-004 part therefore depends on the dispatch script (PKG-1 for the path; PKG-3 for the behaviour), not on itself. PKG-4 integrates that part only after PKG-3 passes its tests (PKG-4 integration conditions). |

### 3.2 Kimi RECOMMENDATION and NOTE items

| Item | Ruling | Reason |
|---|---|---|
| R-1 R-items lack alternatives and budget | ACCEPT as a record, no package change | [F] R-items are frames or candidates, not packages. Their admission fields are written at admission (R-L0-22.13). FRAMES.md already carries them: F-02 admitted with a budget (0084 item 7), F-04/F-05 SUSPENDED, C-R1/C-R5/C-R7 candidates. They stay `admission: PENDING` until then. |
| R-2 DIG counts A-11 | ACCEPT | = MiMo B2. |
| R-3 wave-by-wave table | ACCEPT | Section 6. |
| R-4 A-2 on S2 | ACCEPT in substance | [F] S1/S2 are frame streams (R-L0-22.9). Packages are not frames, so frame-stream labels are dropped from packages. A-2 sits in PKG-4 on edit stream E2, and its files are disjoint from E1. |
| N-1 R-3 compound verdict | Moot | [F] 0084 item 1 gives F-02 one question; its gate returns one verdict. |
| N-2 A-10 schema versus populated record | ACCEPT | PKG-2 ships the schema and library in W1. PKG-3 writes real records in W2. |
| N-3 A-8 code home | Moot here | [F] A-8 moves to CORE-ARCH I-a. `SPEC-protocol-core.md:3`: "Built in S3-T13 before package I-a"; home `.ai/core/` (PROTO-DEC-0060 item 3). |
| N-4 A-2 risk class | ACCEPT, resolved | [I] A-2 is written into `L0-ROOT.md`, not `AGENTS.md`. `AGENTS.md` is `managed` (`protocol-manifest.json:7`) and would install a source-repository rule into every host, and PROTO-DEC-0083 item 7 kept it unchanged for the governor. The 0046 item 3 question therefore does not arise. Class M; the executor takes the T7 floor (0072 item 3, transcriber's reading). |

### 3.3 MiMo RECOMMENDATION and NOTE items

| Item | Ruling | Reason |
|---|---|---|
| R1 R-5 size | ACCEPT FRAMES.md | [F] FRAMES.md is the only candidate registry (0084 item 10). It records C-R5 as **major**; the plan's "minor" is stale. |
| R2 admission fields | ACCEPT | = Kimi R-1. |
| R3 S2 widened | ACCEPT | = Kimi R-4. No package carries an S-label. |
| R4 R-3 minority inputs | ACCEPT the homes; REJECT adding them to F-02 | [F] F-02's contract is frozen (0084 items 1-3). Reviewer precision and recall is D-CRIT/D-REV evidence inside F-02's frozen dimensions. Verification strength is a task-characterization factor, owned by P-L2-002 (0084 item 5). RESOLUTION section 3.3 items 8-9 stay their record. No package change. |
| R5 P-6 context-window data | ACCEPT, moved | [I] The hard-constraint *data* goes into PKG-3's ladder data (`contextWindow` per rung, with its source or null) and filter rule. It does not go into A-12. |
| R6 U-8 never DEFER | ACCEPT | Restated in OQ-11. |
| R7 which items rest on which block | ACCEPT | Section 5 table. |
| N1 citation `:41-48` | ACCEPT | The seven checks are `H-AUTH-02.md:42-49` (read in this session); PKG-4 cites that range. |
| N2, N4, N5 | Noted | No change. |
| N3 critics as certifiers | Noted | [F] PROTO-DEC-0057 item 3 allows a critic of one frame to certify in another; PROTO-DEC-0086 item 1 named Kimi and MiMo-V2.6-Flash (a model other than the MiMo-Pro that critiqued). |

### 3.4 The plan's own open flags

| Plan flag | Resolution |
|---|---|
| Program-wide DIG (`PLAN-DEEPSEEK.md:39-41`) | Out of scope. Section 5 fixes this program's 13. |
| A-2 / A-6 risk class (`:434-436`) | A-2 and A-6 are M: `docs/core-arch/` is not a protected path of PROTO-DEC-0038. The executor floor is T7 (0072 item 3). |
| PKG-4/PKG-5 concurrency (`:437`) | Kimi B-2. |
| A-8 code home (`:438`) | Kimi N-3. |
| A-11 small decision, A-9 scheduling (`:419-420`) | OQ-1; Kimi B-3. |

## 4. Final implementation scope

### 4.1 In the five packages

| A-item | Part implemented | Package | Rests on [F] |
|---|---|---|---|
| Route stabilization (D1-1) | one kernel launch path in place of `run-chain.cjs` and `launch.cjs`; a verified client registry; a liveness probe before dispatch; liveness per 0075 item 5; tests | PKG-1 | 0079 item 1(1); 0050 items 2-4; 0047 item 9; 0070; 0077 item 3 |
| A-13 | the private-clone, Level-1 launch as the only launch mode (closes M-8 for the new path); the first real launch is an integration step | PKG-1 | 0070; 0077 item 3; BACKLOG M-8 |
| A-14 | one output and exit-code schema, written as a spec and applied to every new script | PKG-1 (spec), PKG-2/3/5 (apply) | 0047 item 8; 0049 item 2; 0075 item 4 |
| A-10 | the run-record schema, a validating library, the usage rendering, and a Stop-telemetry reader that counts sessions (the 2.96x fix, read side) | PKG-2 | 0075 items 3, 6, 7, 9, 10; 0078 item 5; 0084 item 9; 0047 item 9 |
| A-3 | resolver v0 (milestone M1), then the supervisor, watchdog, pinning, completion contract and filters (milestone M2) | PKG-3 | 0079 item 2; 0075 items 1-14; 0076 item 3; 0078 items 1-4; 0051 item 4; workflowAI section 1.5 |
| P-6 data | a context-window field with its source; unknown never fails silently | PKG-3 | 0075 item 8 |
| A-6 (part) | P-L2-002 without Size, the 0072 floor text and the 0086 item 5 note; P-L3-004 R-L3-004.4-5 aligned to 0075 items 2-3 and 7, with `enforced_by` updated; S-001 completion (CORE-ARCH-4 section 3) aligned to 0075 item 6; CORE-ARCH-3 section 12 B-24 marked closed | PKG-4 | 0074 item 4; 0075 items 2-3, 6-8; 0072; 0086 item 5 |
| A-2 | the L0 root rule for OwnerIdeas | PKG-4 | 0079 item 7 |
| A-1 (part a) | the L0 procedure P-L0-009: the four outcomes transcribed from 0070 items 5-6 and P-L0-002; the undecided envelope parts listed as OPEN | PKG-4 | 0081; 0070 items 5-6; P-L0-002 |
| A-5 | the signals ledger `.ai/SIGNALS.md`, its script, its procedure section, and the one-time import of interim `Signal:` lines | PKG-5 | 0051 items 1-3, 5; 0049 item 2; 0047 item 8; grammar `CORE-ARCH-6.md:79-97` |
| A-12 | the per-client procedure for setting the model and effort (P-L3-005); it reads the PKG-1 registry | PKG-5 | 0065 item 2 |

### 4.2 Out of the packages, with a target (no silent drop)

| Item | Target | Reason [F] |
|---|---|---|
| A-1 part b (the design block: envelope descriptor, inheritance on resume and fallback, expiry and supersession, the delegation artifact) | owner, OQ-2 | 0081 requires "a design block". Its content is design, not transcription, and a package may not design (Appendix A item 5). |
| A-1 part c (enforcement in the dispatcher) | the dispatcher increment after OQ-2 is approved | 0081 Consequences: "enforcement still waits for the dispatcher". It also needs part b. |
| A-4 Node validator | BACKLOG C-2/M-7; milestone W4-M7 | Kimi B-1 above. |
| A-6 part (S-003 research-cycle steps) | F-03, CORE-ARCH stage 3 (S-003 "lands in stage 3", `S-003-research-cycle.md:25`) | S-003 describes the three-round cycle of 0052. PROTO-DEC-0083 has since capped reasoning rounds at two (R-L0-22.21). Aligning S-003 means reconciling two designs, which is not an edit. |
| A-7 navigation index | F-03, CORE-ARCH package I-a | PROTO-DEC-0057 item 5: "built in CORE-ARCH package I-a". |
| A-8 `protocol-core.cjs` local checks | F-03, package I-a (S3-T13) | `SPEC-protocol-core.md:3`; PROTO-DEC-0061 item 2. |
| A-9 `record --candidate` | F-03, package I-b (S3-T14) | Kimi B-3. |
| A-11 redaction beyond journals | owner, OQ-1; afterwards a dispatcher increment | No block exists (RESOLUTION:373). |
| A-14 retrofit of the existing ten `.ai/bin` scripts | F-03, CORE-ARCH package II | Their outputs change only when they are next recertified; the new scripts comply from the start. |

### 4.3 Duplication excluded

- **One launch path.** After PKG-1 the old runners are superseded for new dispatches. They are not
  deleted: they are artifacts of other frames (F-06 CLOSED; F-04/F-05 SUSPENDED) and leave through
  those frames' closures (R-L0-22.57).
- **One client registry.** `.ai/docs/clients.json` becomes the verified per-client data
  (0047 item 9; 0050 items 3-4). The roster in `CLI-AGENTS.md` section 1, a 2026-09-22 snapshot,
  gets a pointer to it instead of a second table. The adapters in both runners are superseded by it.
- **One ladder.** `docs/ops/MODEL-ECONOMICS.md` stays the owner's canonical ladder.
  `docs/ops/model-ladder.json` (PKG-3) is a derived transcription. It carries a hash of the ladder
  section, and the resolver refuses to run when that hash no longer matches. A drifting copy
  therefore cannot become a second source.
- **One run record.** `USAGE.md` tables become renderings of the run record
  (`protocol-runrecord.cjs render`), not a second ledger.
- **One signals ledger.** Interim `Signal:` lines are imported once by hash. Journals and ARCHIVE
  are never edited.
- **No second governor.** No package touches P-L0-008, FRAMES.md, CLOSURES.jsonl,
  `docs/ops/model-evidence/` or F-02 files.

## 5. DIG baseline (task one of the plan; R-L0-22.41, 22.45)

| A-item | Accepted block it rests on [F] | In DIG |
|---|---|---|
| A-1 | PROTO-DEC-0081 | yes |
| A-2 | PROTO-DEC-0079 item 7 | yes |
| A-3 | 0050 item 4; 0051 item 4; 0075; 0079 items 1-2 | yes |
| A-4 | PROTO-DEC-0077 items 1-2 | yes |
| A-5 | 0051 items 1-3, 5 | yes |
| A-6 | 0072; 0074/0075 Consequences | yes |
| A-7 | 0057 item 5 | yes |
| A-8 | 0061 item 1 (SPEC-protocol-core approved as L0 design) | yes |
| A-9 | 0048 item 5 (producer Evidence anchoring the candidate); design in CORE-ARCH-6 section 2 | yes |
| A-10 | 0075 items 6, 9; 0079 item 1(2) | yes |
| A-11 | none | **no: pending decision (OQ-1)** |
| A-12 | 0065 item 2 | yes |
| A-13 | 0070; 0077 item 3 | yes |
| A-14 | 0047 item 8; 0049 item 2 (the convention's parts) | yes |

**DIG = 13; pending decision beside it: 1 (A-11); DEFERRED_ACCEPTED = 0.** This is this program's
contribution only. The program-wide count also needs the other programs' accepted items (the plan's
own flag) and is not made here. After the five packages, an item leaves DIG only when its whole
chain reaches test and end-to-end use. A partly implemented item (A-1, A-6, A-14) stays counted.
The gate owner records the number in FRAMES.md; this file does not edit FRAMES.md.

## 6. Streams and waves (E1/E2; not the frame streams S1-S3)

| Wave | E1 (executor Gemini 3.8 Flash high, 0086 item 2) | E2 (executor Mistral Medium 3.5 max) | Start condition | Wave-end gate |
|---|---|---|---|---|
| W1 | **PKG-1** ROUTES: launch path, registry, probe, liveness, A-13, A-14 spec | **PKG-2** RUN-RECORD: A-10 schema, library, render, telemetry reader | stage 7 PASS (0086 item 3 conditions) | both packages meet their own acceptance; then the operator's one `protocol-manifest.json` edit (PKG-1 S11 + PKG-2 S6 entries); then the integration check below |
| W2 | **PKG-3** DISPATCH: resolver v0 (M1), then the supervisor (M2) | **PKG-4** RECORDS: A-6 part, A-2, A-1 part a | W1 integrated and committed by the operator | same |
| W3 | none | **PKG-5** SIGNALS: A-5 and A-12 | W2 integrated and committed | same |
| after W3 | W4-M7 milestone (not a package): certifier preflight, exclusive phase-0 baseline runs, oracle cohort into G1, L-pass check (`final-plan-2.md:535-543`); then A-4 G0 under 0077 | none | owner | stage 9 onward (DeepSeek review) runs after W3, per the dispatch |

- **One writer per file per wave** [I]. The files each wave touches are disjoint, with no
  exception (stage-7 fix B3). `protocol-manifest.json` has one writer per wave:
  - W1: the operator, at the W1 gate, not an executor. Both W1 packages need entries, and neither
    can own the edit while the other runs: [F] the validator fails on a listed file that does not
    exist yet (`validate-protocol.ps1:142-158`), and `tests/manifest.test.cjs:68-72` fails on a
    test file that is not listed. So the operator inserts the eight entries named exactly in PKG-1
    S11 and PKG-2 S6 in one edit, with both streams at rest, before the integration check, and
    confirms each is present once. Each W1 package carries this as an integration condition.
    Before the gate, the manifest-listing test failing on the new W1 test files only is expected.
  - W2: PKG-3 (S9); PKG-4 does not touch it. W3: PKG-5 (S9).
  `.ai/docs/CLI-AGENTS.md` has one writer per wave: PKG-1 (W1), PKG-3 (W2), PKG-5 (W3).
- **Wave integration check** (the operator runs it at a quiet point, with both streams at rest,
  after the W1 manifest edit above):
  `powershell -ExecutionPolicy Bypass -File .\validate-protocol.ps1`;
  `powershell -ExecutionPolicy Bypass -File .\test-protocol.ps1`; then each executor's full
  `record` in turn, never two at once. The operator commits each package separately, path-scoped to
  its artifact plan (PROTO-DEC-0047 Consequences), before the next wave starts. A red check stops
  the next wave. The failing package's executor returns a finding; nobody repairs another stream's
  package.
- **Priority** (Appendix A item 3) holds: routes and their tests (PKG-1) and the run record (PKG-2)
  are W1, and resolver v0 is the first milestone of W2.
- **F-02 in parallel** (Appendix A item 4): resolver v0 reads defaults, MODEL-MATRIX (provider
  pages) and the ladder, and never F-02 outputs.

## 7. The five packages (summaries; the package files are binding for executors)

| Package | Goal | Stream / wave | Risk; certification | Minimum tier | Depends on |
|---|---|---|---|---|---|
| PKG-1 ROUTES | one kernel launch path `.ai/bin/protocol-dispatch.cjs`, run in a private clone with the Level-1 environment; the verified registry `.ai/docs/clients.json`; `probe`; liveness per 0075 item 5; `docs/specs/bin-output-schema.md` | E1 / W1 | H; two parallel certifiers (0086 item 1) | T7 | none |
| PKG-2 RUN-RECORD | `docs/specs/run-record.schema.md`; `.ai/bin/protocol-runrecord.cjs` (validate, append, read, render, sessions) | E2 / W1 | H; two parallel certifiers | T7 | none |
| PKG-3 DISPATCH | resolver v0 (M1) and supervisor (M2) inside `protocol-dispatch.cjs`; `docs/ops/model-ladder.json`; run records written through PKG-2 | E1 / W2 | H; two parallel certifiers | T7 | PKG-1, PKG-2 |
| PKG-4 RECORDS | P-L2-002 0.5; P-L3-004 0.6; CORE-ARCH-4 section 3; CORE-ARCH-3 section 12; L0-ROOT 0.6 (R-L0-37, R-L0-38); new P-L0-009 (draft); S1-SUMMARY row | E2 / W2 | M; one independent reviewer statement (0038 item 2) | T7 (0072 item 3) | PKG-1 (the path exists); P-L3-004 integration after PKG-3 |
| PKG-5 SIGNALS | `.ai/SIGNALS.md`; `.ai/bin/protocol-signals.cjs`; `docs/specs/signals-ledger.md`; CLI-AGENTS section 10; one-time import; new P-L3-005 (per-client model and effort) | E2 / W3 | H; two parallel certifiers | T7 | PKG-1 (registry), for P-L3-005; PKG-3 (the fall hook in the dispatcher) |

Common to every package (written into each file):
- The executor implements; it does not design (DISPATCH-OWNER "Этап 6"). A contradiction it cannot
  resolve inside the package blocks the package and becomes a finding.
- A new idea becomes a candidate (cap 5; FRAMES shows 4/5) or goes to the owner, and never widens
  scope (Appendix A item 5).
- Session start, one journal, no commits, and a full `record` for any code or kernel-record change.
- Terminal output is not Evidence (CLI-AGENTS section 4).

## 8. Integration, certification and closure

- **Stage 7** (DeepSeek pre-check) may start automatically only if the three conditions of
  PROTO-DEC-0086 item 3 hold. The headings of each package file map one to one to Appendix A
  item 7.
- **The running program stays on `run-chain.cjs`** [I]. Stages 7-12 are dispatched by the research
  runner that dispatched stages 1-6. No program stage moves to `protocol-dispatch.cjs` before PKG-1
  and PKG-3 are certified. The switch is an owner act after certification. Reason: an uncertified
  kernel dispatcher must not carry the certification of itself.
- **A-13 first real launch** is an operation, not executor work. After PKG-1 passes the W1 check,
  the operator dispatches one smoke job through `protocol-dispatch.cjs` on a route the owner names.
  Its evidence is the operator's journal (RESOLUTION A-13; 0076 item 3).
- **Certification** (Appendix A item 2; 0079 item 6; 0086 item 1):
  - Kimi K2.7 Code HighSpeed and MiMo-V2.6-Flash certify PKG-1, 2, 3 and 5 in parallel and
    independently, on the frozen candidate after stage 12. PKG-4 needs one independent reviewer
    statement, and either certifier satisfies it.
  - The unified adversarial audit prompt (AGENTS.md section 2) is the set of four package prompt
    files that the H-package executors write as a required output, each at most 150 lines. Together
    they cover every acceptance criterion. Reports stay within 250 lines and carry `Mode:
    CERTIFYING` and a `Receipt-Owner`.
  - Neither certifier executes (0086 item 1). Claude (resolver, launcher, closer) and DeepSeek
    (planner, pre-checker, reviewer) certify nothing.
- **Closure** (R-L0-22.56-22.71; PROTO-DEC-0085) [I]:
  - Each package declares its artifact plan. Created code, specs, data and records are
    KEEP_ACTIVE: they are the canonical implementation.
  - The superseded runners are TRANSFER(their owning frames' closures), never moved by this program.
  - `round6/` (this file and the packages) is ARCHIVE at F-01's closure, because the implemented
    specs and code carry the normative content.
  - BACKLOG lines this work closes (C-3, M-4, M-8, S-1, S-6) are updated by the operator at closure,
    not by executors.

## 9. Owner questions (Appendix A item 9: nothing here is decided)

- **OQ-1 (A-11).** What does redaction beyond journals cover (runner logs, `USAGE.md`,
  copied-back transcripts), and does a hit block or redact? Until answered, A-11 is outside DIG and
  outside the packages.
- **OQ-2 (A-1 design block, 0081).** Who drafts the envelope design (the fields of
  `H-AUTH-02.md:27-38`, inheritance on resume and fallback, expiry and supersession, the delegation
  artifact), and in which frame? [I] Recommendation: inside F-03, because S1 has no free major slot
  while F-03 is ACTIVE (R-L0-22.24). PKG-4 delivers the part that needs no design.
- **OQ-3 (stall threshold).** PROTO-DEC-0051 item 4 (five minutes) and PROTO-DEC-0075 item 5
  ("starting at 10-15 minutes") conflict. PKG-1 defaults to 10 minutes, from the later block, and
  accepts a dispatch value of 5-120; this program's DISPATCH.json uses 60. Confirm, or name the
  default. [F] This is a conflict between accepted blocks, reported and not resolved.
- **OQ-4 (installation scope).** The three new scripts, the registry and the signals ledger are
  registered as `source` in `protocol-manifest.json`, so they stay in this repository and are not
  installed into hosts (the P-L0-008 precedent, 0083 item 1). Promoting them to `managed` needs an
  owner decision.
- **OQ-5 (P-L2-002 "next revision").** PKG-4 makes P-L2-002 0.5 without F-02's task requirements
  (Appendix A item 4). Confirm that PROTO-DEC-0084 item 5's "next revision" means the first revision
  after the F-02 gate.
- **OQ-6 (certifier floor), a reported conflict.** PROTO-DEC-0059 item 2 sets certification at T7
  or higher. PROTO-DEC-0086 item 1 names Kimi K2.7 Code HighSpeed (MODEL-MATRIX: `kimi-k2.7-code`
  is second and workhorse rank, T1-T6, `:98`) and MiMo-V2.6-Flash (not in the matrix). 0086 is the
  later, specific owner block, and 0086 item 5 makes tiers provider-relative. [I] Recorded as an
  owner assignment (selection = owner, 0084 item 9); confirm it is intended as an override.
- **OQ-7 (Gemini and CORE-ARCH certification), a reported conflict.** PROTO-DEC-0055 item 3 names
  Gemini a certifier of CORE-ARCH packages I-III, on the condition that it "edits no program
  candidate". Under 0086 item 2 Gemini writes the dispatcher, which is CORE-ARCH package II content
  (`CORE-ARCH-7.md:134`). Decide who certifies package II's dispatcher parts when package II lands,
  or whether the 0086 item 1 certification of these packages discharges it.
- **OQ-8 (run-record store).** PKG-3 appends run records to `docs/ops/RUNS.jsonl`, tracked and
  append-only, because `.ai/runtime/` is disposable (AGENTS.md section 1) and D-03's reopen trigger
  needs accumulated records. Confirm the location.
- **OQ-9 (the dispatcher's first use).** After certification, does the owner switch the program's
  remaining dispatches (and K-launch, BACKLOG M-3) to `protocol-dispatch.cjs`?
- **OQ-10 (DIG).** Transcribe DIG = 13 (A-11 pending, beside it) into FRAMES.md counters at the next
  gate.
- **OQ-11 (carried, flagged, not solved; PLAN-AMENDMENT).** U-3, U-4, U-8 (security: waits inside
  R-1 and is **never DEFERred** without an owner decision, 0079 Open; R-L0-22.33), U-10, U-11, U-13,
  U-14; the resolver metric and the cost-versus-latency tie-break; the Kernel v1 scope; the
  operating threshold. BACKLOG C-8 (the implementation tier under a senior spec) stays open, so the
  T7 floor applies to every package here.

## 10. What this resolution does not do

- It opens no frame, writes no decision block and changes nothing in PROTO-DEC-0079..0086.
- It edits nothing outside `round6/` and its journal. It commits nothing.
- It assigns no model: the executors and certifiers are the owner's (0086), and the packages state
  requirements only.

## Resume log

- **2026-09-26, session `claude-e59d6a50882e9e39`** (route claude CLI, Claude Opus 5.5, effort high
  per DISPATCH.json). This slot was interrupted by the Claude session limit, and this session
  resumed it under the launch file's resume rule.
  - Existing at resume: this file, `packages/PKG-1.md`, `PKG-2.md` and `PKG-3.md`. I read them and
    did not rewrite them. Sections 1-10 above are unchanged.
  - Completed now: `packages/PKG-4.md` and `packages/PKG-5.md`.
- **Refinements made while writing PKG-4 and PKG-5.** They are recorded here because sections 4.1 and
  7 are not rewritten; the package files are binding for executors.
  1. **Root rule ids** [F]. A-2 becomes R-L0-37 and the P-L0-009 anchor becomes R-L0-38, not the
     "R-L0-23" of section 7. P-L0-008 0.1 used R-L0-23..36 as root-level ids, and its change log
     maps them away (`P-L0-008-research-governor.md:261`). Old citations such as
     `PLAN-DEEPSEEK.md:317` would otherwise point at new rules.
  2. **P-L2-002 rubric** [I]. Removing Size alone would shrink the sum to 0-10 and silently change
     the PROTO-DEC-0059 mapping (T9 would become unreachable). PKG-4 therefore replaces Size with
     the fourth parameter of 0075 item 8, "independent judgement". Its scale follows the seniority
     list of 0074 item 4. See OQ-12.
  3. **P-L3-004 scope** [F]. The R-L3-004.4-5 alignment alone would leave the record contradicting
     itself. So PKG-4 also aligns:
     - R-L3-004.6 and .8 (the timers against 0075 item 5);
     - a suspension note on R-L3-004.2-3 (0076 item 1: Kilo is not a fallback router);
     - a new R-L3-004.10 (0075 item 7).
     The launcher's state table stays as that launcher's record.
  4. **PKG-5 fall hook** [F]. PROTO-DEC-0051 item 4 ("every FALLEN outcome is appended to the
     signals ledger") is carried by no package, and PKG-3 does not append signals. PKG-5 adds the
     hook to the dispatcher in W3, so it also depends on PKG-3. The wave order already satisfies
     that. PKG-5 may also change `effort.note` values in `clients.json` for P-L3-005, and nothing
     else in that file.
  5. **Signals grammar** [I]. PKG-5 fixes the CORE-ARCH-6 section 4 proposal as `signals/1`, with
     one added key `src` (the hash that makes the import idempotent). The grammar lives in
     `docs/specs/signals-ledger.md`. That is beside, not inside, the rulebook spec that PROTO-DEC-0049
     item 2 names for the grammars it lists; the signals grammar is not among those.
- **New owner questions** (Appendix A item 9; nothing decided):
  - **OQ-12.** Confirm PKG-4's replacement of the Size factor with "independent judgement"
    (0/1/2 = precise specification / checked review / relied-on judgement), or name another way to
    keep the 0059 mapping.
  - **OQ-13** [F]. `.ai/docs/CLI-AGENTS.md` is `managed` (`protocol-manifest.json:14`), so sections 9
    (PKG-1) and 10 (PKG-5) are installed into host projects as text. The scripts, registry and
    ledger they describe are `source` only. Both sections say "source repository only". Confirm
    that, or move the text to a source-only file. This extends OQ-4.
- **STOP-3 self-check** (PROTO-DEC-0086 item 3) [F]:
  - there are exactly five package files;
  - each carries the headings ID, Goal, Scope, Stream and wave, Inputs, Allowed paths, Forbidden
    paths, Dependencies, Required outputs, Acceptance criteria, Validation commands, Integration
    conditions, Risk class and certification route, Artifact plan, Executor requirements and STOP
    conditions;
  - all seven BLOCKING items are ruled in section 3.1.
  PKG-4 has no audit-prompt output, because it is medium risk (one reviewer statement).

## Fix log

Stage-7 fix, session `claude-d990acada995d601` (frame `task:ownerideas-r7b-claude-fix`), against
`round7/PRE-CHECK-DEEPSEEK.md`; details and reproductions in `round7/FIX-CLAUDE.md`.

- B1 -> `packages/PKG-1.md`: Inputs, S3, AC-4, validation command and STOP 3 now name the fixture
  `tests/fixtures/dispatch/R3-DISPATCH.json`, a byte-identical copy (sha256 pinned in S3) of the
  archived file, which is read once as provenance; `check` on it expects ten `launch-missing` rows
  and exit 1, the row format now fixed in S3.
- B2 -> `packages/PKG-2.md`: the golden row is cited by commit (`git show 8fca7ae:...USAGE.md`,
  line 21), because the live row was rewritten to DONE (BACKLOG S-1); the required fields the row
  lacks now have named sources. The resolution never restated that row (pre-check's `:345`), so
  nothing changed here for B2.
- B3 -> section 6 table and "One writer per file per wave"; `packages/PKG-1.md` and `PKG-2.md`
  (Stream and wave, Allowed paths, Required outputs, S11/S6, Integration conditions, Artifact plan):
  the operator is the only W1 writer of `protocol-manifest.json`, at the W1 gate; both packages
  carry the edit as an integration condition.
- N-1 (RECOMMENDATION, applied) -> section 2 and `packages/PKG-2.md` Inputs: archived paths marked
  provenance; PKG-2 quotes 77/26/2.96 inline.
- N-2 (applied) -> section 7 PKG-4 row: R-L0-37, R-L0-38.
- N-3 (applied) -> `packages/PKG-4.md` S1: the six-to-four factor mapping onto 0075 item 8.
- N-4 (applied) -> section 7 PKG-5 row: PKG-3 added.
- N-5 (applied) -> `packages/PKG-4.md` S3: the sentence wrap at `CORE-ARCH-4.md:75-76` is named.
- N-6 (applied) -> `packages/PKG-1.md` S2 items 2 and 5: kilo/mimo `--variant` flags; codex `-C`
  kept from run-chain.
- N-7 (applied) -> `packages/PKG-1.md` AC-15 and `packages/PKG-4.md` AC-5 marked reviewer checks.
