# Current Task

Status: In progress
Owner: RuslanFomenko
Last update: 2026-09-27

## Objective

Close the paired-cycle audit findings through the DeepSeek-Gemini tandem under PROTO-DEC-0040, then return to the native-only product pilots in `D:\Block-Puzzle` and `D:\VPN` with the already frozen objectives and metrics.

## Problem

The owner accepted `docs/reviews/2026-09-20-codex-paired-cycle-review.md`: the runbook is not ready for acceptance despite 255/255 passing tests. It mishandles host document edits, core completion and prompt validation; the earlier risk-scaling implementation also needs correction. The MCP council remains closed; its ruling is `docs/reviews/2026-09-20-mcp-council-final-round2-synthesis.md`.

## Constraints

- Feature freeze remains in force except P0/audit closure, the finite paired-cycle remediation authorized by PROTO-DEC-0040 (including the necessary validator/tests, not merely docs), and kernel work inside the CORE-ARCH program (PROTO-DEC-0054 item 2).
- PROTO-DEC-0036 stays closed; PROTO-DEC-0039 is Accepted with the recorded narrow exception. No MCP, v2.0 refactor, product upgrade, commit, tag or push is authorized by this dispatch.
- Corpus: active docs/reviews/ <= 60 files / 600 KB; classify-first archival; immutable historical reviews/decision blocks; journal archival appends history under lock. Review-corpus cleanup never rewrites ledgers (PROTO-DEC-0037).
- Review scale: full pairs for protocol core and consumer security/data paths; one reviewer statement otherwise (PROTO-DEC-0038).
- No protocol session commits in Block-Puzzle/VPN; one lock holder; receipts only after the tree is final (PROTO-DEC-0025 item 4).
- TASK <= 80 lines. Caps raised instead of archived (PROTO-DEC-0056 item 5, 0057 item 5): journals <= 100 files, active docs/reviews <= 200 files / 2 MB, WARN-first; navigation index in package I-a.
- Human-facing language: Russian (`ru-RU`); agent-to-agent prompts and repository documentation may use English. This project preference is replaceable here; a kernel setting is deferred by the feature freeze.

## Acceptance criteria

- [x] Recovery/closure cycle independently certified PASS.
- [x] MCP council Round 1 fact-checked; four valid inputs registered (DeepSeek, GLM 5.1, GPT/Codex, Gemini); Qoder recorded as advisory summary only.
- [x] Round 2 closed: at most two architectures (native-only; routed policy), one primary recommendation (native-only now), one first candidate (Serena) with preregistered experiment spec and thresholds.
- [x] Final Round-2 synthesis persisted with the classification registry; D/E corpus archived with INDEX mappings; cap met; no decisions reopened.
- [x] Owner approved the ruling with corrections: product repositories are Dart (Block-Puzzle) and mixed Dart/Kotlin/Swift/Python (VPN); Serena effectiveness there is UNKNOWN until measured.
- [x] Owner named objectives and five frozen metrics per repository (2026-09-20); frozen in `.ai/PLAN.md`.
- [x] Triage commit completed in Block-Puzzle (`5ada2b9`; analyze 0 issues; 380/380 tests).
- [ ] Triage commit completed in VPN.
- [x] Initial paired-cycle document and managed entry created; this records existence, not audit acceptance.
- [x] Owner accepted the independent audit; bounded remediation and roles recorded in PROTO-DEC-0040 and the registry (2026-09-20).
- [x] PLAN R1-R8 resolved with targeted regressions; R5 risk-scaling change reviewed separately; confirmed secondary risks have explicit dispositions.
- [x] Gemini's unified adversarial prompt and DeepSeek's independent CERTIFYING report persisted (round-2 reissue covers the fix round); no mandatory finding remains open.
- [x] Final-tree receipts for both owners verify --deep (PROTO-DEC-0042: producer `gemini-927b6b871251a111` and controller `deepseek-59c81998639a4feb` exit 0, measured 2026-09-22), and the independent re-review returned PASS twice (Claude round 3, Codex round 5).
- [x] Final validator 0 warnings, full suite green, corpus/journal budgets restored safely; source and installed completion paths tested.
- [ ] Pilots run native-only in two disjoint sessions after triage; comparative report published.
- [ ] v2.0 simplification scope executed after the pilot report (PROTO-DEC-0039 item 3).

## Roles

- gemini: CORE-ARCH second critic of the draft decision (PROTO-DEC-0053 step c) and certifier of packages I-III with Codex (PROTO-DEC-0055); not the step (d) fixer and edits no program candidate; later Block-Puzzle pilot role resumes in its separate product session; research frames: job a-gemini (PROTO-DEC-0066); the validator migration council: the slot its launch file names, if any; temporary compatibility shim until frame-aware assignment (SCHEMA-assignment, В-12): inside a research or design frame whose launch file names a role, that role holds for that frame only; standing roles outside it are unchanged
- deepseek: paired-cycle controller and independent adversarial reviewer; does not certify its own patches; remains cross-pilot controller afterward; CORE-ARCH reviewer (PROTO-DEC-0054): adversarial review of every stage before it goes to the owner; as the stages' controller it certifies none of them; research frames: job a-deepseek (PROTO-DEC-0066); the validator migration council: the slot its launch file names, if any; temporary compatibility shim until frame-aware assignment (SCHEMA-assignment, В-12): inside a research or design frame whose launch file names a role, that role holds for that frame only; standing roles outside it are unchanged
- codex: CORE-ARCH certifier of packages I-III with Gemini (PROTO-DEC-0055); escalation certifier. Fills the second slot on an owner decision or a model consensus, for architecture of special importance or high complexity. The cycle-architecture dispatch qualifies, so both slots are filled there by Claude and Codex; research frames: job a-sol (PROTO-DEC-0066); the validator migration council: the slot its launch file names, if any; temporary compatibility shim until frame-aware assignment (SCHEMA-assignment, В-12): inside a research or design frame whose launch file names a role, that role holds for that frame only; standing roles outside it are unchanged
- deepseek (VPN stream): named by the owner 2026-09-20 as the VPN pilot implementer, in its own product session; this does not relax PROTO-DEC-0041 item 1 for anything it controls
- claude: CORE-ARCH implementer (PROTO-DEC-0054), owner-named 2026-09-24; certifies nothing in that program. Outside it: standing default certifier, first slot of PROTO-DEC-0041 item 2, for any candidate it neither authored nor controlled; research frames: the validator migration council: the slot its launch file names, if any; temporary compatibility shim until frame-aware assignment (SCHEMA-assignment, В-12): inside a research or design frame whose launch file names a role, that role holds for that frame only; standing roles outside it are unchanged
- copilot: research frames only: job a-synth (PROTO-DEC-0066); the validator migration council: the slot its launch file names, if any; temporary compatibility shim until frame-aware assignment (SCHEMA-assignment, В-12): inside a research or design frame whose launch file names a role, that role holds for that frame only; standing roles outside it are unchanged
- grok: research frames only: job b-grok (PROTO-DEC-0066); the validator migration council: the slot its launch file names, if any; temporary compatibility shim until frame-aware assignment (SCHEMA-assignment, В-12): inside a research or design frame whose launch file names a role, that role holds for that frame only; standing roles outside it are unchanged
- kimi: research frames only: job b-kimi (PROTO-DEC-0066); the validator migration council: the slot its launch file names, if any; temporary compatibility shim until frame-aware assignment (SCHEMA-assignment, В-12): inside a research or design frame whose launch file names a role, that role holds for that frame only; standing roles outside it are unchanged
- mistral: research frames only: job b-mistral (PROTO-DEC-0066); the validator migration council: the slot its launch file names, if any; temporary compatibility shim until frame-aware assignment (SCHEMA-assignment, В-12): inside a research or design frame whose launch file names a role, that role holds for that frame only; standing roles outside it are unchanged
- agy: research frames only: job b-synth (PROTO-DEC-0066); the validator migration council: the slot its launch file names, if any; temporary compatibility shim until frame-aware assignment (SCHEMA-assignment, В-12): inside a research or design frame whose launch file names a role, that role holds for that frame only; standing roles outside it are unchanged
- kilo: operator of K-launch only (task:research-dispatch); decides and certifies nothing; temporary compatibility shim until frame-aware assignment (SCHEMA-assignment, В-12): inside a research or design frame whose launch file names a role, that role holds for that frame only; standing roles outside it are unchanged

## Current state

F-01 CLOSED at stage 12 on 2026-09-27 (receipt CR-F01-1). F-02 CLOSED with receipt CR-F02-1 (verdict ACCEPT per PACKET-1 Q1; 20 files archived). Dispatcher (`.ai/bin/protocol-dispatch.cjs`, `protocol-runrecord.cjs`, `protocol-signals.cjs`) and specs in the tree. Product work on hold under PROTO-DEC-0048 pending protocol stability and measurability.

## Next

- **ROADMAP-1 queue**: wave 1 (hygiene, F-02 close-out, baseline, archive), wave 2A (kernel batch 1), wave 2B (Node validator port, `docs/research/archive/2026-09-25-validator-migration-council/final-plan-2.md`), wave 2C (CORE-ARCH stage 3 design S3-T01..S3-T15), wave 3 (drafts and DIG registry).
- **OPS-1 program**: operations layer (Telegram owner channel, L0-L3 escalation, cost-aware routing), `docs/research/2026-09-27-ops-layer/README.md`.
- **Node validator port**: PROTO-DEC-0077, phased execution per `final-plan-2.md` starting at G0 after phase-0 baseline.

## Open questions

- F-C01: STALE ORIGINAL, host path open (ADV-001, 2026-09-28): the 2026-09-23 form is closed - neutral-requirement probes on `validate-protocol.ps1`/`protocol-manifest.json` now return FAIL/1 via `.ai/bin/protocol-verdict.cjs` (PROTO-DEC-0046 item 3, PROTO-DEC-0048 item 2; `tests/rulebook.test.cjs:270,293`). Remaining host path (inferred from code, ADV-001): H1 - installed manifest has no `source` key, so `loadProtectedSet` exits 2 (BLOCKED) in every host project; H2 - no host consumer-path declaration exists (PROTO-DEC-0046 item 3 "declares its own separately"). Target and certifiers await the owner (OWNER-QUEUE Q-A/Q-B); no implementation is authorized.
- Cycle architecture: RESOLVED 2026-09-20. The owner chose the hybrid recording form: binding rules are in PROTO-DEC-0041, the reversible structure is PLAN-level policy, and the high-risk budget is two parallel independent reviewers. Dispatch: `docs/reviews/2026-09-20-deepseek-gemini-cycle-architecture-dispatch.md`. Certifiers named 2026-09-20: Claude as standing default plus Codex on escalation; the pair cannot certify it. Residual for the owner, now sharper: the owner reported 2026-09-22 that Codex has exhausted its limits, so the escalation slot has no occupant at all and the second reviewer required by PROTO-DEC-0041 item 2 must come from Copilot, DeepSeek or Gemini, subject to item 1 independence. This constrains any future high-risk kernel work, including the deferred automation package.
- Post-pilot owner decision: whether a measured retrieval bottleneck justifies requesting an owner-directive to reopen PROTO-DEC-0036 for the single preregistered Serena experiment. Measured 2026-09-22 against that experiment's premise: the bottleneck that materialised is stratum S3 (prose and governance retrieval), which the council designated a negative control where native must win, not the S1 symbol navigation the Serena candidate targets.
- DeepSeek mapping run over `D:\mcp-stack`: postponed, not cancelled, with two triggers - (1) before acting materially on the Gemini map, since a keep-or-delete decision on 8 GB would rest on one arm verified only by the checker; (2) if Gemini's certification performance contradicts its mapping performance, which would put that map back in question.
- `D:\mcp-stack` holds hardcoded credential literals in six files, and the one at `mcp-gateway.js:37` was verified byte-equal to the owner's live `DEEPSEEK_MAIN_KEY`. Not a git repository, so nothing reached history. Rotation and a move to environment variables are an owner decision; no value is reproduced in any protocol artifact.
- Kernel-level language preference (`.ai/PREFERENCES.json` proposal) waits for the pilot report or an explicit freeze exception.
- Owner-requested cycle-history research: `docs/reviews/2026-09-20-codex-cycle-history-research.md` challenges the claimed three-reviewer/two-round optimum; its one-round policy proposal is recorded as DEFER D-01 (frame F-16) in `docs/research/FRAMES.md` - reason: certification-cycle policy, decided after the pilots report; reopen trigger: publication of the comparative pilots report. This research does not certify Wave C.
- DeepSeek must document the conservative risk-classification and host review-path contract before Gemini changes the existing gates; no label-only downgrade of core work.
- `.ai/local-qwen/` is untracked inside the protected `.ai/` path: a Node package with `node_modules`, `package.json` and three `qwen-colabs-*.mjs` files. It was not authorised by any decision and needs an owner ruling on whether it belongs there at all; the protected-path rules of PROTO-DEC-0038 apply to it.
