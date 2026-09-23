# Current Task

Status: In progress
Owner: RuslanFomenko
Last update: 2026-09-22

## Objective

Close the paired-cycle audit findings through the DeepSeek-Gemini tandem under PROTO-DEC-0040, then return to the native-only product pilots in `D:\Block-Puzzle` and `D:\VPN` with the already frozen objectives and metrics.

## Problem

The owner accepted `docs/reviews/2026-09-20-codex-paired-cycle-review.md`: the runbook is not ready for acceptance despite 255/255 passing tests. It mishandles host document edits, core completion and prompt validation; the earlier risk-scaling implementation also needs correction. The MCP council remains closed; its ruling is `docs/reviews/2026-09-20-mcp-council-final-round2-synthesis.md`.

## Constraints

- Feature freeze remains in force except P0/audit closure and the finite paired-cycle remediation authorized by PROTO-DEC-0040 (including the necessary validator/tests, not merely docs).
- PROTO-DEC-0036 stays closed; PROTO-DEC-0039 is Accepted with the recorded narrow exception. No MCP, v2.0 refactor, product upgrade, commit, tag or push is authorized by this dispatch.
- Corpus: active docs/reviews/ <= 60 files / 600 KB; classify-first archival; immutable historical reviews/decision blocks; journal archival appends history under lock. Review-corpus cleanup never rewrites ledgers (PROTO-DEC-0037).
- Review scale: full pairs for protocol core and consumer security/data paths; one reviewer statement otherwise (PROTO-DEC-0038).
- No protocol session commits in Block-Puzzle/VPN; one lock holder; receipts only after the tree is final (PROTO-DEC-0025 item 4).
- Validator 0 warnings; journals <= 30 files; TASK <= 80 lines.
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

- gemini: paired-cycle remediation implementer; no unilateral Completed; later Block-Puzzle pilot role resumes in its separate product session
- deepseek: paired-cycle controller and independent adversarial reviewer; does not certify its own patches; remains cross-pilot controller afterward
- codex: record accepted audit/governance and prepare tandem dispatch; implementation is assigned to Gemini
- deepseek (VPN stream): named by the owner 2026-09-20 as the VPN pilot implementer, in its own product session; this does not relax PROTO-DEC-0041 item 1 for anything it controls
- claude: standing default certifier. Fills the first of the two independent reviewer slots required by PROTO-DEC-0041 item 2, for any candidate it neither authored nor controlled
- codex: escalation certifier. Fills the second slot on an owner decision or a model consensus, for architecture of special importance or high complexity. The cycle-architecture dispatch qualifies, so both slots are filled there by Claude and Codex

## Current state

PROTO-DEC-0040 remediation certified (matrix 10/10; F-1..F-9 closed; Wave C implementer receipt S-5 closed in gemini-927b6b871251a111). Cycle architecture (B1-B8 per dispatch) implemented across PROTOCOL.md, PAIRED-CYCLE.md, templates/reviews/REVIEW.md and AGENTS.md; remediation rounds closed (F1 template, F-001..F-005). Certified by two parallel independent reviewers per PROTO-DEC-0041 item 2: Claude round-3 **PASS** (receipt claude-cf505493500f999e) and Codex round-5 **PASS** (receipt codex-eb8786999ebfc7c2). Standing after closure: validator **0 warnings**, corpus **60 files / 606,295 B**, **27 journals**. Cycle-architecture task CLOSED 2026-09-21. The last blocking criterion is resolved by **PROTO-DEC-0042** (owner ruling 2026-09-22): receipt freshness is bound to the attested task, so the producer/controller receipts (exit 0) satisfy it and the certifier receipts staled by the controller's closing edit (exit 1) are not a defect. **Product work is unblocked and is the only authorized activity**; the next protocol change stays limited by PROTO-DEC-0039 item 1. Block-Puzzle triage: 5ada2b9 (task 1 pending); VPN stream implementer: DeepSeek.

## Next

Product first, in separate sessions: VPN G2 (execute the CI gates at 0 runs), then VPN D4 (revocation with packet-level proof); Block-Puzzle triage to one clean commit plus DEC-0024 Step 3 open items; the third repository (`D:\Битва за луну`, 1.9.6, 2 commits) as the clean control arm with zero protocol edits. The five frozen metric categories are recorded as a by-product from `git diff --numstat`, verdicts and journals - no separate pilot activity, instrument or review artifact. The kernel automation package (root-cause stop bound to one findings ledger, executable scope check, author-not-reviewer check) is deferred until after those tasks and decided on their numbers. **Layers A/B/C (PROTO-DEC-0044) are implemented and dispatched for certification**: prompt `docs/reviews/2026-09-22-claude-layers-abc-adversarial-prompt.md`, certifiers DeepSeek and Gemini in parallel; Claude authored the package and certifies none of it. Reserve before writing: corpus stands at 56/60 files, 579,613/614,400 B.

## Open questions

- Owner-requested Codex assessment (2026-09-23): `docs/reviews/2026-09-23-codex-path-contract-assessment.md` supports an explicit relative-path contract A but rejects closure by A alone: neutral-requirement CLI probes on `validate-protocol.ps1` and `protocol-manifest.json` return RECOMMENDATION/0 instead of FAIL/1 (F-C01). F-001 absolute/parent forms also reproduced. The new premise/budget and frozen-candidate certification arrangement await the owner; this advisory assessment fills no certifier slot and authorizes no implementation.
- Cycle architecture: RESOLVED 2026-09-20. The owner chose the hybrid recording form: binding rules are in PROTO-DEC-0041, the reversible structure is PLAN-level policy, and the high-risk budget is two parallel independent reviewers. Dispatch: `docs/reviews/2026-09-20-deepseek-gemini-cycle-architecture-dispatch.md`. Certifiers named 2026-09-20: Claude as standing default plus Codex on escalation; the pair cannot certify it. Residual for the owner, now sharper: the owner reported 2026-09-22 that Codex has exhausted its limits, so the escalation slot has no occupant at all and the second reviewer required by PROTO-DEC-0041 item 2 must come from Copilot, DeepSeek or Gemini, subject to item 1 independence. This constrains any future high-risk kernel work, including the deferred automation package.
- VPN stream implementer: RESOLVED 2026-09-20 - DeepSeek, in its own product session.
- Post-pilot owner decision: whether a measured retrieval bottleneck justifies requesting an owner-directive to reopen PROTO-DEC-0036 for the single preregistered Serena experiment. Measured 2026-09-22 against that experiment's premise: the bottleneck that materialised is stratum S3 (prose and governance retrieval), which the council designated a negative control where native must win, not the S1 symbol navigation the Serena candidate targets.
- DeepSeek mapping run over `D:\mcp-stack`: postponed, not cancelled, with two triggers - (1) before acting materially on the Gemini map, since a keep-or-delete decision on 8 GB would rest on one arm verified only by the checker; (2) if Gemini's certification performance contradicts its mapping performance, which would put that map back in question.
- `D:\mcp-stack` holds hardcoded credential literals in six files, and the one at `mcp-gateway.js:37` was verified byte-equal to the owner's live `DEEPSEEK_MAIN_KEY`. Not a git repository, so nothing reached history. Rotation and a move to environment variables are an owner decision; no value is reproduced in any protocol artifact.
- Kernel-level language preference (`.ai/PREFERENCES.json` proposal) waits for the pilot report or an explicit freeze exception.
- Owner-requested cycle-history research: `docs/reviews/2026-09-20-codex-cycle-history-research.md` challenges the claimed three-reviewer/two-round optimum; the one-round policy proposal is linked in PLAN and remains Proposed pending owner approval. This research does not certify Wave C.
- DeepSeek must document the conservative risk-classification and host review-path contract before Gemini changes the existing gates; no label-only downgrade of core work.
- Validator defect, reproduced 2026-09-23, belongs to the batched round: the decision-block immutability check attributes the `---` separator to the preceding block, so appending a new decision after the previous one was committed as the last block reports `PROTO-DEC-0044 was edited after it was written`. Reproduce: `git show HEAD:.ai/DECISIONS.md | tail -3` ends at `Approved by:`; the working tree adds a `---` separator line before the next heading; `validate-protocol.ps1` exits 1 with the content of the block unchanged (`git diff HEAD -- .ai/DECISIONS.md` shows only the addition). It is on a protected path and blocks the ordinary commit-then-append order; the immutability rule itself must not be weakened to fix it.
- Batch certification is stale, not failed, measured 2026-09-23 by file mtime: `docs/reviews/2026-09-23-deepseek-batch-certification.md` was written 01:29:34, while `.ai/bin/protocol-scope.cjs` landed 01:35:48, `.ai/bin/protocol-verdict.cjs` 01:36:45 and Gemini's adversarial prompt 01:42:44. Its F-001/F-002 ("the implementation is absent") describe a tree that predates the candidate by 6-13 minutes; F-004 already records that the tree was not frozen. The candidate now exists and passes: rulebook tests 20/20, both tools in `protocol-manifest.json`, immutability fix present, validator 0 warnings. Re-certification is required against a frozen candidate; the dispatch that caused this named no ordering constraint, which is a defect of the dispatch and not of any participant.
- `.ai/local-qwen/` is untracked inside the protected `.ai/` path: a Node package with `node_modules`, `package.json` and three `qwen-colabs-*.mjs` files. It was not authorised by any decision and needs an owner ruling on whether it belongs there at all; the protected-path rules of PROTO-DEC-0038 apply to it.
- Copilot's dispatch has not run: `docs/research/2026-09-22-jev-decision-fabric-evaluation.md` and `docs/research/2026-09-23-r0-decision-dataset/` are both absent, so the Jev evaluation is still only in a temp directory.
- 2026-09-23: new premise for F-001/F-C01 recorded as PROTO-DEC-0046 - repo-relative ledger paths, protected set from the manifest, certifiers Codex + fresh Claude, DeepSeek coordinates and certifies nothing, budget <=2.
