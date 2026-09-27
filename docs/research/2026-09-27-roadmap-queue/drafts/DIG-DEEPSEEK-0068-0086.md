# DIG registry audit - producer DeepSeek, range PROTO-DEC-0068..0086 + A-1..A-14

Frame F-17 (advisory audit; no verdict, no certification). Baseline commit at audit time: `66a3437`
(branch `roadmap-wave3`). Working tree: dirty (untracked session journals only).

Scope: every numbered item of PROTO-DEC-0068..0086 (97 items) plus A-1..A-14 (14 items) = 111 rows.
Method: each row was checked against the working tree, not against a report; proofs are `path:line`
or a commit sha; `-` means no implementation artifact was found. The five-package implementation
(PKG-1..5) was executed as stages 4-12 of F-01 under PROTO-DEC-0079..0086; its independent review is
`docs/research/archive/2026-09-26-ownerideas-revision/round9/FINAL-DEEPSEEK.md`.

## Counts

- Total items: **111**
- Built: **87**
- Partial: **15**
- Not built: **9**

## PROTO-DEC-0068..0086

| Item | Status | Proof (path or commit) | Note |
|---|---|---|---|
| PROTO-DEC-0068 item 1 | built | `docs/research/2026-09-25-improvement-research/prompts/launch.cjs:38` | soft/hard timers replace the idle bound in launch.cjs; recorded in `docs/core-arch/stage-4/P-L3-004-route-failover.md:189` |
| PROTO-DEC-0068 item 2 | built | `docs/research/2026-09-24-remediation-mapping/prompts/launch-round2.cjs:24` | no-op elsewhere; PROTO-DEC-0049 item 3 (5 min idle) still stands in launch-round2.cjs |
| PROTO-DEC-0069 item 1 | built | `.ai/DECISIONS.md:2733` | record-only correction of PROTO-DEC-0066 item 6; nothing to build; the research run is SUSPENDED (F-04/F-05) |
| PROTO-DEC-0070 item 1 | built | `.ai/DECISIONS.md:2789` | record-only one-time authorisation for the PROTO-DEC-0066 run |
| PROTO-DEC-0070 item 2 | built | `docs/research/2026-09-25-improvement-research/prompts/launch.cjs:235` | vibe runs with `--enabled-tools` list; `--auto-approve` only for that set |
| PROTO-DEC-0070 item 3 | built | `docs/research/2026-09-25-improvement-research/prompts/launch.cjs:234` | copilot `-C <dir> --allow-all-tools --no-ask-user` in the job copy |
| PROTO-DEC-0070 item 4 | built | `docs/research/2026-09-25-improvement-research/prompts/launch.cjs:432` | credential-separated executor env; write scope and STOP on out-of-scope diff |
| PROTO-DEC-0070 item 5 | built | `docs/core-arch/stage-1/P-L0-009-authorised-action.md:42` | generalised as R-L0-38.4 (EXECUTE) by PROTO-DEC-0081 |
| PROTO-DEC-0070 item 6 | built | `docs/core-arch/stage-1/P-L0-009-authorised-action.md:33` | generalised as R-L0-38.2 (OWNER-DECISION closed list) |
| PROTO-DEC-0070 item 7 | built | `.ai/DECISIONS.md:2811` | record-only scope limit of the authorisation to the PROTO-DEC-0066 run |
| PROTO-DEC-0071 item 1 | built | `.ai/bin/protocol-handoff.cjs:680` | `record --quick` (validator only); research prompts use it (`docs/research/2026-09-25-improvement-research/prompts/A-research.md:130`) |
| PROTO-DEC-0071 item 2 | built | `.ai/bin/protocol-handoff.cjs:26` | full `record` still runs the suite for code/kernel changes |
| PROTO-DEC-0072 item 1 | built | `docs/core-arch/stage-2/P-L2-002-model-selection.md:79` | T7 floor text realised in P-L2-002 0.5 |
| PROTO-DEC-0072 item 2 | built | `docs/core-arch/CORE-ARCH-3.md:206` | B-24 closed; only advisory frames do not inherit the floor |
| PROTO-DEC-0072 item 3 | built | `docs/core-arch/stage-2/P-L2-002-model-selection.md:79` | floor applies when a task creates/changes/applies kernel records and for certification |
| PROTO-DEC-0072 item 4 | built | `docs/core-arch/stage-2/P-L2-002-model-selection.md:83` | review-only task is not a kernel change; tier by rubric |
| PROTO-DEC-0073 item 1 | built | `docs/research/2026-09-25-improvement-research/prompts/launch.cjs:58` | job table moved out of code to `prompts/jobs.json` |
| PROTO-DEC-0073 item 2 | built | `docs/research/2026-09-25-validator-migration-council/tools/run-chain.cjs:16` | generic runner takes the dispatch file from argv |
| PROTO-DEC-0073 item 3 | built | `.ai/bin/protocol-dispatch.cjs:18` | dispatch message is `Read and follow the file <path>` |
| PROTO-DEC-0073 item 4 | built | `docs/research/2026-09-25-validator-migration-council/tools/run-chain.cjs:35` | client CLI syntax stays in tooling (adapters) |
| PROTO-DEC-0074 item 1 | built | `.ai/bin/protocol-dispatch.cjs:1273` | bootstrap message is a pointer line to the launch file |
| PROTO-DEC-0074 item 2 | partial | `.ai/bin/protocol-dispatch.cjs:504` | dispatcher slots name a `role` and resolve models, but the research job table still names models per job (`docs/research/2026-09-25-improvement-research/prompts/jobs.json:6`) |
| PROTO-DEC-0074 item 3 | built | `.ai/bin/protocol-dispatch.cjs:708` | resolver returns one primary + up to two substitutes |
| PROTO-DEC-0074 item 4 | built | `docs/core-arch/stage-2/P-L2-002-model-selection.md:67` | tier follows uncertainty/consequence; `Independent judgement` sixth row |
| PROTO-DEC-0074 item 5 | built | `.ai/bin/protocol-dispatch.cjs:1373` | stall judged by observable progress, not fixed wait |
| PROTO-DEC-0075 item 1 | built | `.ai/bin/protocol-dispatch.cjs:1727` | attempt/stage/task levels kept apart; attempt history in `docs/specs/run-record.schema.md:72` |
| PROTO-DEC-0075 item 2 | built | `.ai/bin/protocol-dispatch.cjs:1761` | error-aware resume/retry by class (STALL, PROCESS_CRASH, INVALID_OUTPUT) |
| PROTO-DEC-0075 item 3 | partial | `.ai/bin/protocol-dispatch.cjs:1804` | retry ladder implemented (primary 2 fresh, 2 per substitute, `:1812`); per-step money/token budget not in v0 (`:540` rejects slot `budget`) |
| PROTO-DEC-0075 item 4 | built | `docs/specs/bin-output-schema.md:27` | fifteen canonical classes; record enum `docs/specs/run-record.schema.md:91` |
| PROTO-DEC-0075 item 5 | built | `.ai/bin/protocol-dispatch.cjs:1300` | stall default 600 s (`stallMin` 5-120 at `:489`); hard ceiling at `:1737` |
| PROTO-DEC-0075 item 6 | built | `.ai/bin/protocol-dispatch.cjs:991` | completion contract: exit code, non-empty outputs, structural check, evidence, supervisor done |
| PROTO-DEC-0075 item 7 | built | `docs/specs/run-record.schema.md:57` | pins: HEAD, launch sha256, role sha256, corpus hash, dispatch version |
| PROTO-DEC-0075 item 8 | built | `docs/core-arch/stage-2/P-L2-002-model-selection.md:71` | uncertainty/reversibility/coupling/independent judgement; context window a hard constraint (`protocol-dispatch.cjs:745`) |
| PROTO-DEC-0075 item 9 | built | `.ai/bin/protocol-dispatch.cjs:702` | resolver order: floor, constraints, independence, liveness, approval, then cheapest sufficient rung |
| PROTO-DEC-0075 item 10 | built | `.ai/bin/protocol-dispatch.cjs:819` | resolution (primary/substitutes/excluded/skipped) written into the run record |
| PROTO-DEC-0075 item 11 | built | `.ai/bin/protocol-dispatch.cjs:1727` | supervisor states and every transition logged with a reason |
| PROTO-DEC-0075 item 12 | partial | `.ai/bin/protocol-dispatch.cjs:1727` | stage-scope boundary held (repair/resume inside one stage); the four `max_*` template parameters exist only in the decision text (`.ai/DECISIONS.md:3151`), not in code |
| PROTO-DEC-0075 item 13 | built | `.ai/bin/protocol-dispatch.cjs:764` | independence by model/family/provider per slot |
| PROTO-DEC-0075 item 14 | partial | `.ai/bin/protocol-dispatch.cjs:991` | step-level completion implemented; no workflow-level task-completion aggregate found |
| PROTO-DEC-0076 item 1 | built | `docs/ops/MODEL-ECONOMICS.md:13` | routes via makers' CLIs; DeepSeek V4.1 Max approval-gated (route note `:46`) |
| PROTO-DEC-0076 item 2 | built | `docs/core-arch/stage-4/workflowAI.md:1` | workflowAI.md the kernel-layer procedure; TD-MODEL-QUALIFICATION `:142` |
| PROTO-DEC-0076 item 3 | built | `.ai/bin/protocol-dispatch.cjs:2185` | script accumulates statuses and emits `REPORT` rows |
| PROTO-DEC-0076 item 4 | built | `docs/research/FRAMES.md:49` | frozen hypotheses moved to DEFER D-03; lifted for R-3 only |
| PROTO-DEC-0076 item 5 | built | `docs/ops/PROBLEMS.md` | problems file exists for blocking defects |
| PROTO-DEC-0076 item 6 | built | `docs/research/archive/2026-09-26-ownerideas-revision/round9/FINAL-DEEPSEEK.md:5` | work carried to certification; final verdict PASS |
| PROTO-DEC-0077 item 1 | built | `docs/research/2026-09-25-validator-migration-council/final-plan-2.md:1` | final-plan-2 is the design baseline; timing/boundary answers recorded |
| PROTO-DEC-0077 item 2 | partial | `docs/research/2026-09-27-roadmap-queue/BASELINE.md:1` | phase-0 baseline done; no migration phase started (certifier preflight, oracle cohort open) |
| PROTO-DEC-0077 item 3 | partial | `docs/research/2026-09-25-improvement-research/prompts/launch.cjs:64` | variant 9 implemented (default-deny git modes `:66`, credential separation `:432`, push fail-closed `:65`); closure conjunction / independent verification open |
| PROTO-DEC-0078 item 1 | built | `.ai/bin/protocol-dispatch.cjs:1761` | supervisor recovers mechanically by class; judgement stays a reviewer stage |
| PROTO-DEC-0078 item 2 | built | `.ai/bin/protocol-dispatch.cjs:795` | equal-rung tie-break by first-written `order`; the headroom branch is not present (no headroom data in the ladder) |
| PROTO-DEC-0078 item 3 | built | `.ai/bin/protocol-dispatch.cjs:813` | kernel/certification shortfall -> ASK_OWNER; other stages record it (`:1669`) |
| PROTO-DEC-0078 item 4 | built | `.ai/bin/protocol-dispatch.cjs:778` | approval-gated rung needs `slot.approval`; undeclared tasks count as long (`:721`) |
| PROTO-DEC-0078 item 5 | built | `docs/ops/MODEL-ECONOMICS.md:48` | owner-run step records the model that ran (route note) |
| PROTO-DEC-0079 item 1 | partial | `.ai/bin/protocol-dispatch.cjs:1` | priorities 1-3 built (dispatch path, run record, resolver v0); priority 4 (other A-items) partially built (A-4, A-7..A-9, A-11 open) |
| PROTO-DEC-0079 item 2 | built | `.ai/bin/protocol-dispatch.cjs:795` | cheapest sufficient live tier first, escalation only on failure |
| PROTO-DEC-0079 item 3 | not built | - | P-L2-002 0.5 carries no task-characterization component (searched `docs/core-arch`; no match) |
| PROTO-DEC-0079 item 4 | built | `docs/core-arch/stage-2/P-L2-002-model-selection.md:79` | PROTO-DEC-0059 floors stand; assurance may be raised |
| PROTO-DEC-0079 item 5 | built | `docs/research/archive/2026-09-26-ownerideas-revision/round6/FINAL-RESOLUTION-CLAUDE.md:217` | two edit streams E1/E2 (PROTO-DEC-0048 item 7 held) |
| PROTO-DEC-0079 item 6 | built | `docs/research/archive/2026-09-26-ownerideas-revision/round8/CERT-KIMI.md:1` | `CLOSED` is not certification; two parallel independent certifiers used |
| PROTO-DEC-0079 item 7 | built | `docs/core-arch/stage-1/L0-ROOT.md:50` | R-L0-37; advisory-seed banners on `OwnerIdeas/*.md:1` |
| PROTO-DEC-0079 item 8 | built | `docs/research/archive/2026-09-26-ownerideas-revision/round4/CLEANUP-GEMINI.md:1` | cleanup C-1..C-5 + U-12 executed; banners recorded |
| PROTO-DEC-0080 item 1 | partial | `OwnerIdeas/benchmark.md` | `:chatgpt-content-reference` markers removed (0 found); capability dimensions in F-02, but canonical TaskProfile/ModelProfile/resolver-output schemas were not created (`docs/ops/model-evidence/` absent) |
| PROTO-DEC-0080 item 2 | built | `docs/ops/MODEL-ECONOMICS.md:13` | provider pages are the source for rank and price; public benchmarks only as prior (0084 item 2) |
| PROTO-DEC-0081 item 1 | partial | `docs/core-arch/stage-1/P-L0-009-authorised-action.md:42` | A-1 part a built (P-L0-009, draft); capability-envelope design block and dispatcher enforcement open (`:79`) |
| PROTO-DEC-0082 item 1 | built | `docs/core-arch/stage-1/P-L0-008-research-governor.md:19` | RESEARCH-GOVERNOR adopted as trial P-L0-008; rewritten 0.2 by 0083 |
| PROTO-DEC-0083 item 1 | built | `docs/core-arch/stage-1/P-L0-008-research-governor.md:39` | 0.2 binds every frame of the source repository; not installed into hosts |
| PROTO-DEC-0083 item 2 | built | `docs/core-arch/stage-1/P-L0-008-research-governor.md:25` | functional frame definition; one program = one frame; plan is preparation |
| PROTO-DEC-0083 item 3 | built | `docs/core-arch/stage-1/P-L0-008-research-governor.md:79` | kernel-completion parameters (two rounds) recorded; caps in `docs/research/FRAMES.md:16` |
| PROTO-DEC-0083 item 4 | built | `docs/core-arch/stage-1/P-L0-008-research-governor.md:260` | edits to 0.1 applied in the 0.2 changelog |
| PROTO-DEC-0083 item 5 | built | `docs/research/FRAMES.md:24` | every frame has one row; transition inventory present; frame without a row is not open |
| PROTO-DEC-0083 item 6 | built | `docs/core-arch/stage-1/P-L0-008-research-governor.md:143` | Kernel v1 completion contract R-L0-22.53; Kernel v1 scope left to a separate owner decision (by design) |
| PROTO-DEC-0083 item 7 | partial | `docs/core-arch/stage-1/P-L0-008-research-governor.md:232` | manual enforcement during the trial; the mechanisable validator checks are not built (PROTO-DEC-0077 / A-4) |
| PROTO-DEC-0084 item 1 | built | `docs/research/FRAMES.md:27` | F-02 closed on its single primary question; H-WAI-1..6 DEFERred (D-03) |
| PROTO-DEC-0084 item 2 | built | `docs/research/archive/2026-09-26-model-layer/round2/benchmark-registry.json:1` | six benchmark + three local dimensions frozen in the F-02 artifacts |
| PROTO-DEC-0084 item 3 | built | `docs/research/archive/2026-09-26-model-layer/round2/GATE-REPORT.md:36` | no local evaluations built; dimensions reported MISSING/WEAK honestly |
| PROTO-DEC-0084 item 4 | built | `docs/research/archive/2026-09-26-model-layer/README.md:45` | working-model set frozen with `source_commit` and `source_blob` |
| PROTO-DEC-0084 item 5 | not built | - | canonical `docs/ops/model-evidence/` was not created; F-02 evidence was ARCHIVEd under `docs/research/archive/2026-09-26-model-layer/` (closure receipt CR-F02-1) |
| PROTO-DEC-0084 item 6 | built | `docs/research/archive/2026-09-26-model-layer/round1/methodology.md:1` | task relates to dimensions; benchmark-to-dimension mapping lives in the registry |
| PROTO-DEC-0084 item 7 | built | `docs/research/archive/2026-09-26-model-layer/round1/CITATIONS.md:1` | round 1 two collectors, round 2 one verifier; deadline honoured (frame closed 2026-09-27) |
| PROTO-DEC-0084 item 8 | built | `docs/research/archive/2026-09-26-model-layer/round2/VERIFICATION.md:1` | owner-named executors; verifier family differs from the collectors and is not Claude/DeepSeek |
| PROTO-DEC-0084 item 9 | built | `docs/specs/run-record.schema.md:24` | owner override recorded via `selection = "owner"`; never counted as resolver evidence |
| PROTO-DEC-0084 item 10 | built | `docs/research/FRAMES.md:16` | DEFER cap 5 (3/5), candidate cap 5 (4/5); FRAMES is the only DEFER/candidate registry |
| PROTO-DEC-0085 item 1 | built | `docs/research/CLOSURES.jsonl:12` | frame CLOSED only after disposition + receipt (CR-F01-1, CR-F02-1) |
| PROTO-DEC-0085 item 2 | built | `docs/research/CLOSURES.jsonl:12` | artifact set declared/attributable in the F-01 receipt |
| PROTO-DEC-0085 item 3 | built | `docs/research/CLOSURES.jsonl:13` | dispositions applied (F-02: 20 ARCHIVE rows) |
| PROTO-DEC-0085 item 4 | built | `docs/research/archive/2026-09-26-ownerideas-revision/round9/FINAL-DEEPSEEK.md:116` | DECISIONS/ARCHIVE/REGISTRY/journals/review content never changed by closure |
| PROTO-DEC-0085 item 5 | built | `docs/research/archive/INDEX.md:1` | every move indexed; immutable citations resolve through the index |
| PROTO-DEC-0085 item 6 | built | `docs/research/CLOSURES.jsonl:12` | receipt is one append-only line; FRAMES carries the receipt id (`docs/research/FRAMES.md:26`) |
| PROTO-DEC-0085 item 7 | partial | `docs/core-arch/CORE-ARCH-6.md:144` | M-011 defined; no leak detector/scanner exists (manual, scanner deferred to A-4) |
| PROTO-DEC-0085 item 8 | built | `docs/research/CLOSURES.jsonl:12` | first application: closed frames without a receipt received one (CR-F01-1, CR-F02-1) |
| PROTO-DEC-0085 item 9 | not built | - | attention/storage budget numbers still line-based; new byte numbers await a later owner decision |
| PROTO-DEC-0085 item 10 | not built | - | general closure procedure, L0 invariant and scanner carried by F-03 stage 3; not started |
| PROTO-DEC-0086 item 1 | built | `docs/research/archive/2026-09-26-ownerideas-revision/round8/CERT-MIMO.md:1` | Kimi K2.7 and MiMo-V2.6 certify; neither executed stage 8 |
| PROTO-DEC-0086 item 2 | built | `docs/research/archive/2026-09-26-ownerideas-revision/round8/IMPLEMENT-E1-GEMINI.md:1` | stage-8 executors E1 Gemini / E2 Mistral; stage-11 verifier GPT-5.6 Sol (`docs/research/archive/2026-09-26-ownerideas-revision/round9/VERIFY-SOL.md:1`) |
| PROTO-DEC-0086 item 3 | built | `docs/research/archive/2026-09-26-ownerideas-revision/round7/PRE-CHECK-DEEPSEEK.md:1` | stage 7 launched under the conditional gate |
| PROTO-DEC-0086 item 4 | built | `docs/research/archive/2026-09-26-model-layer/round2/GATE-REPORT.md:1` | F-02 gate list of downgraded/rejected rows grouped by model |
| PROTO-DEC-0086 item 5 | built | `docs/core-arch/stage-2/P-L2-002-model-selection.md:100` | T1-T9 provider-relative note recorded as input to the next P-L2-002 revision |

## A-items A-1..A-14

| Item | Status | Proof (path or commit) | Note |
|---|---|---|---|
| A-1 | partial | `docs/core-arch/stage-1/P-L0-009-authorised-action.md:42` | part a built (P-L0-009 draft, R-L0-38.1-.6); part b design block and part c enforcement open (`:79`; owner OQ-2) |
| A-2 | built | `docs/core-arch/stage-1/L0-ROOT.md:50` | R-L0-37 OwnerIdeas seeds below the plan; banners on `OwnerIdeas/*.md:1` |
| A-3 | built | `.ai/bin/protocol-dispatch.cjs:702` | resolver v0 (M1) and supervisor (M2) inside the dispatcher; tests `tests/resolver.test.cjs`, `tests/dispatch.test.cjs` |
| A-4 | not built | - | Node validator port not started; planned as BACKLOG C-2/M-7, W4-M7 after W3 |
| A-5 | built | `.ai/SIGNALS.md:5` | signals ledger, `docs/specs/signals-ledger.md`, `.ai/bin/protocol-signals.cjs`, one-time `Signal:` import |
| A-6 | partial | `docs/core-arch/stage-2/P-L2-002-model-selection.md:149` | P-L2-002 0.5 + P-L3-004 0.6 + CORE-ARCH-4 §3 + CORE-ARCH-3 B-24 aligned; S-003 research-cycle steps moved to F-03 stage 3 (not started) |
| A-7 | not built | - | navigation index over reviews/journals built in CORE-ARCH package I-a (PROTO-DEC-0057 item 5); not started |
| A-8 | not built | - | `protocol-core.cjs` is a specification only (`docs/core-arch/stage-1/SPEC-protocol-core.md:3`); code planned S3-T13 |
| A-9 | not built | - | `record --candidate` not implemented in `protocol-handoff.cjs`; planned F-03 package I-b (S3-T14) |
| A-10 | built | `.ai/bin/protocol-runrecord.cjs:862` | schema `docs/specs/run-record.schema.md:1`, library, `renderUsage`, `sessions` Stop-telemetry reader (`:1130`) |
| A-11 | not built | - | redaction beyond journals has no accepted block; owner OQ-1, outside DIG and the packages |
| A-12 | built | `docs/core-arch/stage-4/P-L3-005-client-model-effort.md:1` | per-client model/effort procedure P-L3-005; reads the PKG-1 registry |
| A-13 | partial | `.ai/bin/protocol-dispatch.cjs:235` | private-clone Level-1 launch implemented; the first real launch is an owner act and has not run (`docs/ops/RUNS.jsonl` empty) |
| A-14 | partial | `docs/specs/bin-output-schema.md:36` | spec written and applied to the three new scripts; retrofit of the ten existing `.ai/bin` scripts pending (`:41`, CORE-ARCH package II) |
