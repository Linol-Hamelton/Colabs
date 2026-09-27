# DIG registry audit - producer Gemini, range PROTO-DEC-0048..0067

Frame F-17 (advisory audit; no verdict, no certification). Baseline commit at audit time: `48194bd`
(branch `roadmap-wave3`). Working tree: dirty (untracked session journals only).

Scope: every numbered item of PROTO-DEC-0048..0067 (91 items) = 91 rows.
Method: each row was checked against the working tree, not against a report; proofs are `path:line`
or a commit sha; `-` means no implementation artifact was found.

## Counts

- Total items: **91**
- Built: **87**
- Partial: **3**
- Not built: **1**

## PROTO-DEC-0048..0067

| Item | Status | Proof (path or commit) | Note |
|---|---|---|---|
| PROTO-DEC-0048 item 1 | built | `.ai/DECISIONS.md:2011` | product work deferred until protocol stable (`.ai/TASK.md:60`); replaced product-first ordering |
| PROTO-DEC-0048 item 2 | built | `.ai/bin/protocol-ledger.cjs:117` | ledger collection bounded to spec set; `protocol-verdict.cjs:1` accepted |
| PROTO-DEC-0048 item 3 | partial | `docs/core-arch/CORE-ARCH-7.md:35` | closed scale grammar specified in `CORE-ARCH-7.md:35` and `gemini-z1-grammar.md:51`; manual enforcement per decision; automated tool (`TOOL-protocol-agree`) not built |
| PROTO-DEC-0048 item 4 | built | `docs/core-arch/stage-2/roles/ROLE-auditor.md:51` | R3-C05 exception accepted; `ROLE-auditor.md:51` triggers on `budget-exhausted`; immutability test in `tests/validator.test.cjs:728` |
| PROTO-DEC-0048 item 5 | built | `.ai/bin/protocol-handoff.cjs:452` | candidate anchor Evidence enforced by `checkOwnerReceipt` (`protocol-handoff.cjs:452`); ledger reproductions must resolve in repo |
| PROTO-DEC-0048 item 6 | built | `docs/core-arch/CORE-ARCH-1.md:1` | critical fixes first, then research/design skeleton realized as CORE-ARCH program |
| PROTO-DEC-0048 item 7 | built | `.ai/TASK.md:46` | 1 coordinator and max 2 active code/kernel edit streams; separate documents for research |
| PROTO-DEC-0048 item 8 | built | `.ai/DECISIONS.md:2027` | binding governance rule; single agent, backup, journal entry, folder record (`docs/research/archive/2026-09-26-ownerideas-revision/round6/packages/PKG-5.md:310`) |
| PROTO-DEC-0049 item 1 | built | `.ai/bin/protocol-handoff.cjs:980` | baseline-diff gate check in `protocol-handoff.cjs:980`; review template header in `templates/reviews/REVIEW.md:4` |
| PROTO-DEC-0049 item 2 | built | `.ai/bin/protocol-scope.cjs:318` | fixed grammar enforced; unresolvable input exits 2 (`protocol-scope.cjs:318,513`; `protocol-signals.cjs:764`) |
| PROTO-DEC-0049 item 3 | built | `docs/research/2026-09-24-remediation-mapping/prompts/launch-round2.cjs:24` | 5-minute zero-token idle exit in `launch-round2.cjs:24`; fixed timeout later superseded by adaptive timers in PROTO-DEC-0067 item 3 |
| PROTO-DEC-0049 item 4 | built | `docs/research/2026-09-24-remediation-mapping/BRIEF.md:20` | risk search serves coverage, not refusal; template in `BRIEF.md:20-31` |
| PROTO-DEC-0049 item 5 | built | `.ai/docs/CLI-AGENTS.md:131` | PreToolUse gate `protocol-gate.cjs` authorizes bypass without interactive CLI prompts (`CLI-AGENTS.md:131`, `.ai/ARCHIVE.md:7422`) |
| PROTO-DEC-0050 item 1 | built | `docs/core-arch/stage-1/L0-ROOT.md:104` | R-L0-13: failure closed by changing its procedure; workarounds temporary; signals recorded |
| PROTO-DEC-0050 item 2 | built | `.ai/bin/protocol-dispatch.cjs:18` | prompt file in repo; fixed line "Read and follow the file <path>" (`protocol-dispatch.cjs:18`); script-assembled command; verified flags |
| PROTO-DEC-0050 item 3 | built | `.ai/docs/clients.json:1` | client registry with command templates, environment (e.g. `PYTHONUTF8=1`), and flags |
| PROTO-DEC-0050 item 4 | built | `.ai/bin/protocol-dispatch.cjs:1` | dispatch procedure in `CLI-AGENTS.md:145`; registry in `clients.json`; generalised dispatch script in `.ai/bin/protocol-dispatch.cjs` |
| PROTO-DEC-0051 item 1 | built | `docs/specs/signals-ledger.md:10` | append-only ledger `.ai/SIGNALS.md` specified in `signals-ledger.md:10`; managed by `.ai/bin/protocol-signals.cjs` |
| PROTO-DEC-0051 item 2 | built | `docs/specs/signals-ledger.md:23` | `procedure-gap` signal type for operational failures, repeated workarounds, missing rules (`protocol-signals.cjs:150`) |
| PROTO-DEC-0051 item 3 | built | `docs/specs/signals-ledger.md:47` | `script-candidate` type; `kept-by-assistant:<n>` names unmet condition (`signals-ledger.md:47`) |
| PROTO-DEC-0051 item 4 | built | `.ai/bin/protocol-dispatch.cjs:1761` | watches progress; resumes session up to 3 times on stall (`protocol-dispatch.cjs:1761`); marks `fallen` on 3rd failure (`:2115`) |
| PROTO-DEC-0051 item 5 | built | `.ai/bin/protocol-signals.cjs:1` | watchdog in `protocol-dispatch.cjs:1761`; signals ledger in `signals-ledger.md` and `protocol-signals.cjs` |
| PROTO-DEC-0052 item 1 | built | `docs/core-arch/stage-1/trial/S-003-research-cycle.md:47` | round 1 zones, round 2 challenges + synthesis, round 3 independent syntheses; scenario S-003 |
| PROTO-DEC-0052 item 2 | built | `docs/research/2026-09-24-remediation-mapping/r3-claude-synthesis.md:1` | written without reading peer syntheses; agreement in fixed form; superseded as to final-plan step by PROTO-DEC-0053 item 1 |
| PROTO-DEC-0052 item 3 | built | `.ai/docs/PAIRED-CYCLE.md:160` | one-synthesis rule restricted to implementation cycles, not research cycles |
| PROTO-DEC-0052 item 4 | built | `docs/core-arch/stage-1/L0-ROOT.md:65` | synthesis/plan is not a decision; binding only through approved decision block |
| PROTO-DEC-0052 item 5 | built | `docs/research/2026-09-24-remediation-mapping/r3-deepseek-synthesis.md:1` | round-3 syntheses produced; closing step superseded by PROTO-DEC-0053 |
| PROTO-DEC-0053 item 1 | built | `docs/core-arch/stage-1/trial/S-003-research-cycle.md:40` | 3 independent syntheses, draft decision, 2 critiques, final plan; roles in `ROLE-drafter.md:4`, `ROLE-critic.md:4` |
| PROTO-DEC-0053 item 2 | built | `docs/core-arch/stage-1/trial/S-003-research-cycle.md:42` | rule R-L2-S003.5: owner adopts, amends or rejects |
| PROTO-DEC-0053 item 3 | built | `docs/core-arch/CORE-ARCH-1.md:300` | CORE-ARCH-1 is step (b) draft; critiques re-assigned to DeepSeek and Gemini by PROTO-DEC-0055 item 2 |
| PROTO-DEC-0053 item 4 | built | `docs/core-arch/stage-1/trial/S-003-research-cycle.md:1` | Scenario S-003 front matter and rules formalize the 4-step closing |
| PROTO-DEC-0054 item 1 | built | `docs/core-arch/CORE-ARCH-1.md:1` | layer-by-layer evolution plan in `CORE-ARCH-<n>.md` |
| PROTO-DEC-0054 item 2 | built | `.ai/TASK.md:17` | exception for CORE-ARCH kernel edits recorded in Constraints; product hold stands |
| PROTO-DEC-0054 item 3 | built | `.ai/TASK.md:46` | role assigned per task; Claude implementer, DeepSeek reviewer; max 2 streams stands |
| PROTO-DEC-0054 item 4 | built | `docs/core-arch/stage-1/P-L0-004-layer-consistency.md:1` | adversarial stage review before owner presentation; P-L0-004 layer consistency check before next layer |
| PROTO-DEC-0054 item 5 | built | `.ai/DECISIONS.md:2247` | owner-only authority, append-only DECISIONS, 2 certifiers for high-risk, no MCP/Graph Memory runtime |
| PROTO-DEC-0054 item 6 | built | `.ai/DECISIONS.md:2248` | full copy of checkout at candidate `4ded1be` before program edits |
| PROTO-DEC-0055 item 1 | built | `docs/core-arch/CORE-ARCH-1.md:213` | remediation items mapped into CORE-ARCH stages; critical items in package I |
| PROTO-DEC-0055 item 2 | built | `docs/core-arch/CORE-ARCH-1.md:300` | CORE-ARCH-1 accepted as step (b); Gemini and DeepSeek assigned step (c) critiques |
| PROTO-DEC-0055 item 3 | built | `.ai/TASK.md:46` | parallel independent certifiers of packages I-III; Claude and DeepSeek certify none |
| PROTO-DEC-0055 item 4 | built | `docs/core-arch/stage-1/L0-ROOT.md:1` | L0 rule-making procedure executed as stage 1 under DeepSeek review |
| PROTO-DEC-0055 item 5 | built | `docs/core-arch/stage-2/P-L2-002-model-selection.md:89` | model and effort chosen before session and fixed at launch; no switching inside session |
| PROTO-DEC-0056 item 1 | built | `docs/core-arch/CORE-ARCH-1.md:300` | closing CA-12 confirmed in decision text and draft |
| PROTO-DEC-0056 item 2 | built | `docs/core-arch/stage-2/P-L2-002-model-selection.md:30` | rule R-L2-002.2: one model does not hold two roles within one task frame |
| PROTO-DEC-0056 item 3 | built | `docs/core-arch/stage-2/P-L2-002-model-selection.md:1` | P-L2-002 draft placed on trial; DeepSeek Flash 4.1 accepted as strong model |
| PROTO-DEC-0056 item 4 | built | `docs/core-arch/stage-1/S1-SUMMARY.md:52` | P-L0-003/004 back edge satisfies S1-T08 acceptance; CA-28 closed |
| PROTO-DEC-0056 item 5 | built | `.ai/TASK.md:22` | active caps raised; WARN-first policy; navigation index planned in package I-a |
| PROTO-DEC-0057 item 1 | built | `.ai/DECISIONS.md:2333` | confirmed CORE-ARCH proposals bind only on owner decision; model/effort fixed at launch |
| PROTO-DEC-0057 item 2 | built | `AGENTS.md:65` | stage review order specific to kernel; standard cycle gives certifier PASS approval authority |
| PROTO-DEC-0057 item 3 | built | `docs/core-arch/stage-2/P-L2-002-model-selection.md:32` | `scope-id` bounds task boundary for one-role-per-model rule |
| PROTO-DEC-0057 item 4 | built | `AGENTS.md:80` | PROTO-DEC-0041 item 1 stands in full across task boundaries |
| PROTO-DEC-0057 item 5 | partial | `validate-protocol.ps1:298` | caps (200 files / 2 MB, 100 journals) built in `validate-protocol.ps1:298` and `AGENTS.md:215`; navigation index over reviews/journals (A-7) not built |
| PROTO-DEC-0058 item 1 | built | `docs/core-arch/stage-2/P-L2-002-model-selection.md:28` | rules R-L2-002.1 to R-L2-002.5 confirmed |
| PROTO-DEC-0058 item 2 | built | `docs/core-arch/stage-2/P-L2-002-model-selection.md:55` | author-suggested cells removed; discovery procedure required |
| PROTO-DEC-0058 item 3 | built | `docs/core-arch/stage-4/P-L3-002-model-discovery.md:1` | steps 1-6 for CLI discovery of providers, models, ranks, and effort levels |
| PROTO-DEC-0058 item 4 | built | `docs/core-arch/stage-4/P-L3-002-model-discovery.md:48` | 3 model ranks x 3 effort levels = 9 tiers (T1 to T9) |
| PROTO-DEC-0059 item 1 | built | `docs/core-arch/stage-4/P-L3-002-model-discovery.md:48` | rule R-L3-002.4: model rank takes precedence over effort |
| PROTO-DEC-0059 item 2 | built | `docs/core-arch/stage-2/P-L2-002-model-selection.md:77` | score to tier conversion and mandatory floors codified in P-L2-002 step 3 |
| PROTO-DEC-0059 item 3 | built | `docs/core-arch/stage-4/P-L3-002-model-discovery.md:44` | middle is upper of two central levels (e.g. a,b,c,d -> b,c,d) |
| PROTO-DEC-0059 item 4 | built | `docs/core-arch/stage-4/P-L3-002-model-discovery.md:45` | 1 level fills all 3 slots; 2 levels repeat upper for mid/max |
| PROTO-DEC-0060 item 1 | built | `docs/reviews/2026-09-24-deepseek-core-arch-stage1-recheck.md:1` | re-checks executed and verified before stage 1 approval |
| PROTO-DEC-0060 item 2 | built | `docs/core-arch/stage-1/P-L0-006-retire-or-improve-candidates.md:1` | procedures P-L0-006 and P-L0-007 written; A/B/C test in `CORE-ARCH-7.md:180` |
| PROTO-DEC-0060 item 3 | not built | `-` | `.ai/core/` directory does not exist in working tree; physical landing deferred to Package I-a per PROTO-DEC-0061 item 2 |
| PROTO-DEC-0060 item 4 | built | `docs/research/2026-09-24-remediation-mapping/external-synthesis.md:1` | transcribed with required non-certifying advisory header |
| PROTO-DEC-0061 item 1 | built | `docs/core-arch/stage-1/L0-ROOT.md:1` | stage-1 records approved as L0 design |
| PROTO-DEC-0061 item 2 | built | `.ai/DECISIONS.md:2108` | procedural sequence established; Package I-a certified by Codex and Gemini |
| PROTO-DEC-0061 item 3 | built | `docs/core-arch/stage-2/roles/ROLE-implementer.md:1` | stage 2 executed; role definitions created in `stage-2/roles/` |
| PROTO-DEC-0062 item 1 | built | `docs/core-arch/stage-4/MODEL-MATRIX.md:1` | P-L3-002 executed on workstation, creating `MODEL-MATRIX.md` |
| PROTO-DEC-0062 item 2 | built | `docs/core-arch/stage-2/P-L2-002-model-selection.md:1` | no separate complexity layer added; L2/L3 retained |
| PROTO-DEC-0062 item 3 | built | `docs/core-arch/stage-2/P-L2-002-model-selection.md:86` | delegation rules codified in P-L2-002 step 5 |
| PROTO-DEC-0062 item 4 | built | `.ai/DECISIONS.md:2137` | implementer designs stage N+1 while stage N under review; max 2 stages under review |
| PROTO-DEC-0063 item 1 | built | `docs/core-arch/stage-4/P-L3-003-model-ranking.md:37` | R-L3-003.1: official provider docs and pricing pages only; leaderboards/memory excluded |
| PROTO-DEC-0063 item 2 | built | `docs/core-arch/stage-4/P-L3-003-model-ranking.md:41` | R-L3-003.3: model bound to maker; clients like copilot/agy are routes |
| PROTO-DEC-0063 item 3 | built | `docs/core-arch/stage-4/MODEL-MATRIX.md:1` | `MODEL-MATRIX.md` completed with provider URLs and dates |
| PROTO-DEC-0064 item 1 | built | `docs/core-arch/stage-4/MODEL-MATRIX.md:62` | owner-settled ranks recorded in `MODEL-MATRIX.md` |
| PROTO-DEC-0064 item 2 | built | `docs/core-arch/stage-4/MODEL-MATRIX.md:49` | workhorse rank recorded in `MODEL-MATRIX.md` |
| PROTO-DEC-0064 item 3 | built | `docs/core-arch/stage-4/MODEL-MATRIX.md:72` | repeat rule codified; deepseek-v4-pro later dropped by PROTO-DEC-0065 item 1 |
| PROTO-DEC-0064 item 4 | built | `docs/core-arch/stage-4/MODEL-MATRIX.md:83` | ranked in `MODEL-MATRIX.md` lines 83-106 |
| PROTO-DEC-0065 item 1 | built | `docs/core-arch/stage-4/MODEL-MATRIX.md:72` | v4-pro marked not used; deepseek-flash 4.1 repeated across all three ranks |
| PROTO-DEC-0065 item 2 | built | `docs/core-arch/stage-4/P-L3-005-client-model-effort.md:1` | procedure P-L3-005 drafted with post-launch instructions referencing `clients.json` |
| PROTO-DEC-0065 item 3 | built | `docs/core-arch/stage-2/P-L2-002-model-selection.md:1` | stage 2 roles drafted in `docs/core-arch/stage-2/roles/` |
| PROTO-DEC-0066 item 1 | built | `docs/research/2026-09-25-improvement-research/BRIEF.md:25` | study briefs and prompts drafted in `docs/research/2026-09-25-improvement-research/` |
| PROTO-DEC-0066 item 2 | built | `docs/research/2026-09-25-improvement-research/BRIEF.md:46` | 10 hypothesis sources and novelty taxonomy codified in `BRIEF.md` section O-03 |
| PROTO-DEC-0066 item 3 | built | `docs/research/2026-09-25-improvement-research/BRIEF.md:65` | multi-stage funnel specified in `BRIEF.md` section O-04 and prompt files |
| PROTO-DEC-0066 item 4 | built | `docs/research/2026-09-25-improvement-research/prompts/jobs.json:1` | job table configured with 8 distinct jobs across makers (`README.md:15`) |
| PROTO-DEC-0066 item 5 | built | `docs/research/2026-09-25-improvement-research/BRIEF.md:95` | read-only constraint enforced in `A-research.md:25` and `B-research.md:25` |
| PROTO-DEC-0066 item 6 | partial | `docs/research/FRAMES.md:28` | results planned as C/D candidates; stage 3 triage waited for Study B, but studies A & B were later suspended under F-04/F-05 |
| PROTO-DEC-0067 item 1 | built | `docs/core-arch/stage-4/P-L3-004-route-failover.md:40` | rules R-L3-004.1-2 in P-L3-004; later suspended by PROTO-DEC-0076 item 1 |
| PROTO-DEC-0067 item 2 | built | `docs/core-arch/stage-4/P-L3-004-route-failover.md:61` | hard failures trigger fallback; codified in P-L3-004:61 and `launch.cjs:410` |
| PROTO-DEC-0067 item 3 | built | `docs/core-arch/stage-4/P-L3-004-route-failover.md:70` | progress-based silence detection in P-L3-004:70 and `launch.cjs:38`; supersedes PROTO-DEC-0049 item 3 fixed bound |
| PROTO-DEC-0067 item 4 | built | `docs/core-arch/stage-4/P-L3-004-route-failover.md:67` | rule R-L3-004.5 in P-L3-004:67 |
| PROTO-DEC-0067 item 5 | built | `docs/core-arch/stage-4/P-L3-004-route-failover.md:63` | 1 automatic fallback attempt in P-L3-004 (later revised to ladder by PROTO-DEC-0075 item 3) |
| PROTO-DEC-0067 item 6 | built | `docs/core-arch/stage-4/P-L3-004-route-failover.md:75` | rule R-L3-004.7: process tree cleanup and mutual exclusion |
| PROTO-DEC-0067 item 7 | built | `docs/core-arch/stage-4/P-L3-004-route-failover.md:1` | P-L3-004 drafted; trialed in `docs/research/2026-09-25-improvement-research/prompts/launch.cjs` |
