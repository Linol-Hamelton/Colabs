# DIG Registry Audit - Mistral Medium 3.5 (vibe)

**Frame:** F-17  
**Producer:** Mistral Medium 3.5 (vibe)  
**Producer Range:** PROTO-DEC-0022..0047  
**Date:** 2026-09-27  
**Session:** mistral-2ec25694fd2cbf1c  
**Corrected:** 2026-09-28, session mistral-e71babad8028741a, per `docs/reviews/2026-09-28-gpt-5.6-luna-dig-verification.md` (PROTO-DEC-0096 item 2). Rows Luna rejected were re-proofed or downgraded to `described` (exists only as a written rule) / `partial`; see the correction log at the end.

---

## Counts

- **Total items:** 129
- **Built:** 58
- **Partial:** 11
- **Described:** 60
- **Not built:** 0

`described` is the status the correction launch file (PROTO-DEC-0096 item 2) defines for a decision item that exists only as a written rule with no code, test, validator or commit artefact.

---

| Item | Status | Proof (path or commit) | Note |
|---|---|---|---|
| PROTO-DEC-0023 item 1 | built | .ai/bin/protocol-archive.cjs:262 | autoArchiveWorklog function exists |
| PROTO-DEC-0023 item 2 | built | .ai/bin/protocol-session.cjs:244 | prune moves to .ai/runtime/pruned/ |
| PROTO-DEC-0024 item 1 | built | .ai/bin/protocol-handoff.cjs:850 | rehash command implemented |
| PROTO-DEC-0024 item 2 | built | .ai/bin/protocol-session.cjs:67, AGENTS.md | GLM and Mistral support added |
| PROTO-DEC-0025 item 1 | described | .ai/DECISIONS.md:1159 | process rule for atomic release commits; no code or commit artefact (the v1.9.4 release pair is recorded under PROTO-DEC-0028 item 6) |
| PROTO-DEC-0025 item 2 | built | .ai/bin/protocol-handoff.cjs:321,366 | verifyJournalChain traverses the active journal by default; `--deep` is the explicit cross-file branch |
| PROTO-DEC-0025 item 3 | built | .ai/bin/protocol-session.cjs:350-357 | 24-hour TTL with lazy pruning |
| PROTO-DEC-0025 item 4 | described | .ai/DECISIONS.md:1168 | repository-isolation rule; written rule only |
| PROTO-DEC-0025 item 5 | partial | docs/research/2026-09-27-roadmap-queue/BASELINE.md:1 | Node validator port in phased execution (PROTO-DEC-0077); phase-0 baseline recorded, engine not ported; the old "migration complete" claim was wrong |
| PROTO-DEC-0026 item 1 | described | AGENTS.md:234 | mandate text only; the docs/reviews corpus is compliance, not an implementation artefact |
| PROTO-DEC-0026 item 2 | described | AGENTS.md:239 | mandate text only; journal-link rule carried in AGENTS.md section 5 |
| PROTO-DEC-0026 item 3 | described | AGENTS.md:243 | chat-output limit is rule text |
| PROTO-DEC-0026 item 4 | built | templates/reviews/REVIEW.md:4-6 | mandatory header fields defined in the template |
| PROTO-DEC-0026 item 5 | described | AGENTS.md:253 | transcription-fallback rule text only |
| PROTO-DEC-0026 item 6 | described | AGENTS.md:256 | immutability rule text only |
| PROTO-DEC-0027 item 1 | described | AGENTS.md:93 | superseded by PROTO-DEC-0038 item 1; risk-scaled prompt mandate carried as rule text |
| PROTO-DEC-0027 item 2 | built | .ai/bin/protocol-archive.cjs:271 | Cooperative Lock Preservation in autoArchiveWorklog |
| PROTO-DEC-0027 item 3 | built | .ai/bin/protocol-archive.cjs:81 | Windows Atomic Rename Resilience with retries |
| PROTO-DEC-0027 item 4 | built | .ai/bin/protocol-handoff.cjs:168 | Backward Compatibility for Legacy Evidence |
| PROTO-DEC-0027 item 5 | built | .ai/bin/protocol-handoff.cjs:284,367 | verify --deep re-hashes the archived parent body; archiveCheck invoked on --deep |
| PROTO-DEC-0027 item 6 | built | .ai/bin/protocol-hooks.cjs:220 | Unified Heading Regular Expression (DATE_HEADING_REGEX) |
| PROTO-DEC-0027 item 7 | built | .ai/bin/protocol-session.cjs:350-357 | Liveness-First Runtime Cleanup |
| PROTO-DEC-0028 item 1 | built | .ai/bin/protocol-hooks.cjs:471 | Lock liveness binds to registered session with nonce |
| PROTO-DEC-0028 item 2 | built | .ai/bin/protocol-handoff.cjs:168 | Legacy Evidence labelled, never rewritten |
| PROTO-DEC-0028 item 3 | built | .ai/bin/protocol-handoff.cjs:253,291,305 | verifyArchivedChain: one terminal root, orphaned segments rejected, transitional root only as the unique parentless record |
| PROTO-DEC-0028 item 4 | built | .ai/bin/protocol-hooks.cjs:274 | canonicalEntryBody defined once in hooks; used by handoff (protocol-handoff.cjs:138) and archive (protocol-archive.cjs:17) |
| PROTO-DEC-0028 item 5 | built | docs/reviews/2026-09-19-final-v1.9.5-adversarial-review-prompt.md:1 | persisted prompt artefact; the rule itself is at AGENTS.md:243 |
| PROTO-DEC-0028 item 6 | built | c71bdcf (.ai/ARCHIVE.md:2235) | annotated tag v1.9.4 points to release commit c71bdcf, per verified archive records |
| PROTO-DEC-0029 item 1 | built | .ai/bin/protocol-session.cjs:40 | isSessionAlive with supervisor-first three-way contract |
| PROTO-DEC-0029 item 2 | built | .ai/bin/protocol-session.cjs:212,236,299 | explicit polarity at the prune and cleanup-runtime call sites |
| PROTO-DEC-0029 item 3 | built | .ai/bin/protocol-session.cjs:28,195 | RECENT_WINDOW_MS 15-minute fallback applied in prune |
| PROTO-DEC-0029 item 4 | built | .ai/bin/protocol-session.cjs:88 | --supervisor-pid accepts any live integer PID > 4 |
| PROTO-DEC-0031 item 1 | described | AGENTS.md:127 | four-capability rule is text; capability is never checked by code |
| PROTO-DEC-0031 item 2 | built | templates/reviews/REVIEW.md:10-12 | Mode and Receipt-Owner header fields in the template |
| PROTO-DEC-0031 item 3 | described | AGENTS.md:137 | reproduction mandate is rule text; no automated check |
| PROTO-DEC-0032 item 1 | built | .ai/bin/protocol-handoff.cjs:880 | gate-check subcommand introduced |
| PROTO-DEC-0032 item 2 | built | .ai/bin/protocol-handoff.cjs:1287,1302 | gate-check requires Mode: CERTIFYING and Receipt-Owner for new reviews |
| PROTO-DEC-0032 item 3 | built | .ai/bin/protocol-handoff.cjs:1343,1398 | owner journal must reference the cited review path |
| PROTO-DEC-0032 item 4 | built | .ai/bin/protocol-handoff.cjs:1273,1277,1281 | ISO Date required; legacy cutoff 2026-09-19 |
| PROTO-DEC-0032 item 5 | built | .ai/bin/protocol-handoff.cjs:1146,1244 | ADVISORY and transcribed reviews rejected by the gate |
| PROTO-DEC-0032 item 6 | built | .ai/bin/protocol-handoff.cjs:1308 | Receipt field optional and informational only |
| PROTO-DEC-0032 item 7 | built | validate-protocol.ps1:870 | gate-check invoked only in role: source |
| PROTO-DEC-0032 item 8 | built | .ai/bin/protocol-handoff.cjs:97 | evidence recording sets PROTOCOL_SKIP_GATE=1 |
| PROTO-DEC-0033 item 1 | built | docs/decisions/REGISTRY.md:14 | append-only lifecycle table maintained |
| PROTO-DEC-0033 item 2 | described | docs/decisions/REGISTRY.md:9 | closed status vocabulary documented and in use; validator enforcement was deliberately rejected in the decision's alternatives |
| PROTO-DEC-0033 item 3 | described | .ai/DECISIONS.md:1522 | closed reopen-trigger taxonomy is rule text (bounded semantics also at AGENTS.md:315) |
| PROTO-DEC-0033 item 4 | described | AGENTS.md:304 | REGISTRY.md named in the shared-document lock table |
| PROTO-DEC-0033 item 5 | built | validate-protocol.ps1:478,506,531,547 | registry presence, id coverage, append-only immutability and Reopen-trigger checks, WARN-first |
| PROTO-DEC-0033 item 6 | built | docs/decisions/REGISTRY.md:47-50 | superseded rows for DEC-0003/0005/0008/0014 recorded |
| PROTO-DEC-0034 item 1 | partial | .ai/DECISIONS.md:1612-1615 | Universal context digest defined but repomix@1.18.0 not installed; .ai/runtime/kernel-digest.xml not generated |
| PROTO-DEC-0034 item 2 | built | tests/context-policy.test.cjs:25,28 | policy-pin tests: 1500-token schema budget and the AGENTS.md section 7 advisory pointer |
| PROTO-DEC-0035 item 1 | built | .ai/bin/protocol-hooks.cjs:596 | Stop telemetry instrumentation exists |
| PROTO-DEC-0035 item 2 | built | docs/reviews/2026-09-19-h1-pilot-design.md:184,188 | pre-registered adoption thresholds; the track was later closed by PROTO-DEC-0036 |
| PROTO-DEC-0036 item 1 | described | .ai/DECISIONS.md:1612 | track-closure statement; written rule only |
| PROTO-DEC-0036 item 2 | described | .ai/DECISIONS.md:1613 | PROTO-DEC-0034 reaffirmation; written rule only |
| PROTO-DEC-0036 item 3 | described | .ai/DECISIONS.md:1614 | local-model disposition rule; written rule only |
| PROTO-DEC-0036 item 4 | described | .ai/DECISIONS.md:1615 | conditional reopening rules; written rule only |
| PROTO-DEC-0036 item 5 | described | .ai/DECISIONS.md:1616 | reversal-evidence condition; written rule only |
| PROTO-DEC-0037 item 1 | built | docs/reviews/archive/INDEX.md:3 | two-tier corpus with append-only archive index |
| PROTO-DEC-0037 item 2 | built | .ai/bin/protocol.cjs:33 | Classify-first with doctor exists |
| PROTO-DEC-0037 item 3 | built | .ai/bin/protocol-archive.cjs:227-230,262 | Hard cap enforced with size limits |
| PROTO-DEC-0037 item 4 | described | .ai/DECISIONS.md:1644 | keep-list constraint is rule text |
| PROTO-DEC-0037 item 5 | described | .ai/DECISIONS.md:1645 | never-touch list is rule text |
| PROTO-DEC-0038 item 1 | described | AGENTS.md:93 | risk-scaled core mandate carried as rule text |
| PROTO-DEC-0038 item 2 | described | AGENTS.md:104 | one-reviewer-statement rule text |
| PROTO-DEC-0038 item 3 | described | AGENTS.md:107 | size caps are rule text |
| PROTO-DEC-0038 item 4 | built | QUICKSTART.md:38 | QUICKSTART carries the risk-scaled scale; the section is at AGENTS.md:89-107 |
| PROTO-DEC-0038 item 5 | described | .ai/DECISIONS.md:1675 | negative scope statement; no artefact by design |
| PROTO-DEC-0039 item 1 | described | .ai/TASK.md:17 | freeze in force as a TASK.md constraint; written rule |
| PROTO-DEC-0039 item 2 | partial | .ai/TASK.md:33,34 | Block-Puzzle triage commit 5ada2b9 done; VPN triage and the pilot runs still open |
| PROTO-DEC-0039 item 3 | partial | .ai/PLAN.md:82 | v2.0 scope scheduled after the pilot report; Node validator port in phased execution (PROTO-DEC-0077) |
| PROTO-DEC-0039 item 4 | partial | docs/reviews/2026-09-19-deepseek-flash-certification-adjudication.md:18 | Qoder adjudicated non-gate-valid as submitted; journal count later re-raised by PROTO-DEC-0056/0057 |
| PROTO-DEC-0039 item 5 | partial | .ai/TASK.md:39 | record pass executed for the paired cycle (receipts exit 0, measured 2026-09-22); recurring process, not a persistent artefact |
| PROTO-DEC-0040 item 1 | built | .ai/docs/PAIRED-CYCLE.md:1 | managed deliverable present |
| PROTO-DEC-0040 item 2 | described | .ai/DECISIONS.md:1765 | remediation scope definition is rule text |
| PROTO-DEC-0040 item 3 | built | docs/reviews/2026-09-20-deepseek-gemini-paired-cycle-remediation-prompt.md:1 | dispatch persisted and executed; roles recorded (.ai/TASK.md:38) |
| PROTO-DEC-0040 item 4 | built | .ai/TASK.md:38,39 | unified prompt and DeepSeek's CERTIFYING report persisted; final-tree receipts verify --deep exit 0 |
| PROTO-DEC-0040 item 5 | described | .ai/DECISIONS.md:1768 | retention reaffirmation is rule text |
| PROTO-DEC-0040 item 6 | described | .ai/DECISIONS.md:1769 | freeze-continuity statement is rule text |
| PROTO-DEC-0041 item 1 | described | AGENTS.md:102 | certification-independence rule text; the author-not-reviewer check is not mechanized |
| PROTO-DEC-0041 item 2 | described | AGENTS.md:101 | two-parallel-certifier rule text; not enforced by code |
| PROTO-DEC-0041 item 3 | built | .ai/bin/protocol-verdict.cjs:518,589,595 | verdict arithmetic emits only BLOCKED / FAIL / RECOMMENDATION / PASS |
| PROTO-DEC-0041 item 4 | built | .ai/bin/protocol-verdict.cjs:521 | confirmed + reproduced + protected path drives FAIL regardless of the severity label |
| PROTO-DEC-0041 item 5 | partial | .ai/bin/protocol-verdict.cjs:468 | refuted rows carried in the ledger; equal-burden symmetry checking is not mechanized |
| PROTO-DEC-0041 item 6 | described | .ai/PLAN.md:141 | PLAN-level cycle-architecture policy, exactly as the item requires |
| PROTO-DEC-0042 item 1 | described | .ai/DECISIONS.md:1822 | receipt-freshness ruling; text only, no code authorized |
| PROTO-DEC-0042 item 2 | described | .ai/DECISIONS.md:1823 | semantic ruling, text only |
| PROTO-DEC-0042 item 3 | described | .ai/DECISIONS.md:1824 | semantic ruling, text only |
| PROTO-DEC-0042 item 4 | described | .ai/DECISIONS.md:1825 | semantic ruling, text only |
| PROTO-DEC-0042 item 5 | described | .ai/DECISIONS.md:1826 | refinement statement, text only |
| PROTO-DEC-0042 item 6 | partial | .ai/TASK.md:39,41 | criterion satisfied and recorded; the product pilots themselves are still pending |
| PROTO-DEC-0043 item 1 | built | protocol-manifest.json:21, .ai/docs/CLI-AGENTS.md | CLI-AGENTS.md added to managed list |
| PROTO-DEC-0043 item 2 | described | .ai/docs/CLI-AGENTS.md:54 | dispatch-transfers-no-authority contract text |
| PROTO-DEC-0043 item 3 | described | .ai/docs/CLI-AGENTS.md:71 | own-session contract text |
| PROTO-DEC-0043 item 4 | described | .ai/docs/CLI-AGENTS.md:95 | terminal-output-not-Evidence contract text |
| PROTO-DEC-0043 item 5 | described | .ai/docs/CLI-AGENTS.md:109 | control-by-dispatch contract text |
| PROTO-DEC-0043 item 6 | described | .ai/docs/CLI-AGENTS.md:125 | least-privilege contract text |
| PROTO-DEC-0043 item 7 | described | .ai/docs/CLI-AGENTS.md:30 | DeepSeek IDE/chat fallback contract text |
| PROTO-DEC-0043 item 8 | described | .ai/DECISIONS.md:1859 | bounded-exception statement, text only |
| PROTO-DEC-0044 item 1 | built | .ai/bin/protocol-hooks.cjs:348 | Layer A: inventory at session start via git ls-files |
| PROTO-DEC-0044 item 2 | built | .ai/bin/protocol-index.cjs:17 | Layer B: derives .ai/runtime/decisions-index.md |
| PROTO-DEC-0044 item 3 | built | .ai/bin/protocol-ledger.cjs:101,125 | Layer C: cover and duplicates implemented |
| PROTO-DEC-0044 item 4 | described | .ai/DECISIONS.md:1887 | advisory-only rule text |
| PROTO-DEC-0044 item 5 | built | protocol-manifest.json:22-23 | protocol-index.cjs and protocol-ledger.cjs in managed |
| PROTO-DEC-0044 item 6 | built | tests/index.test.cjs:36, tests/ledger.test.cjs:23 | tests exist for index and ledger |
| PROTO-DEC-0045 item 1 | described | .ai/DECISIONS.md:1914 | refusal statement, text only |
| PROTO-DEC-0045 item 2 | described | .ai/DECISIONS.md:1915 | CodeGraph recorded as an alternative arm in text |
| PROTO-DEC-0045 item 3 | described | .ai/DECISIONS.md:1916 | Jev advisory-only rule text |
| PROTO-DEC-0045 item 4 | described | .ai/DECISIONS.md:1917 | legacy disposition recorded in text |
| PROTO-DEC-0045 item 5 | described | .ai/DECISIONS.md:1918 | no-deletion statement, text only |
| PROTO-DEC-0045 item 6 | built | .ai/bin/protocol-verdict.cjs:4, .ai/bin/protocol-scope.cjs:4 | spec checks 1-4 implemented (verdict arithmetic + stop rule; scope + independence); tests/rulebook.test.cjs:8,9 (54/54 pass, re-run 2026-09-28) |
| PROTO-DEC-0046 item 1 | described | .ai/DECISIONS.md:1944 | premise-replacement statement, text only |
| PROTO-DEC-0046 item 2 | built | docs/specs/2026-09-23-executable-rulebook-spec.md:79-81 | Ledger path contract with normalised paths |
| PROTO-DEC-0046 item 3 | built | protocol-manifest.json:5-32, .ai/DECISIONS.md:1960-1962 | Protected set from manifest (managed+source lists) plus .ai/, .claude/, .codex/ |
| PROTO-DEC-0046 item 4 | described | .ai/DECISIONS.md:1947 | remediation-budget rule text |
| PROTO-DEC-0046 item 5 | built | tests/rulebook.test.cjs:201,270,293 | neutral-requirement negative tests per protected-path class, including validate-protocol.ps1 and protocol-manifest.json |
| PROTO-DEC-0046 item 6 | described | .ai/DECISIONS.md:1949 | certification-assignment rule; the round-3 failure and the later F-01 closure are history, not an artefact of this item |
| PROTO-DEC-0047 item 1 | described | .ai/DECISIONS.md:1975 | certifier selection-order rule text |
| PROTO-DEC-0047 item 2 | partial | .ai/bin/protocol-verdict.cjs:521,578 | reproduced-defect blocking and the no-reproduction RECOMMENDATION cap are mechanized; author-independence for PASS toward a gate stays manual |
| PROTO-DEC-0047 item 3 | described | .ai/DECISIONS.md:1977 | certifier-count-by-risk rule text (high-risk half at AGENTS.md:101) |
| PROTO-DEC-0047 item 4 | described | .ai/DECISIONS.md:1978 | shadow-certification rule; no mechanism |
| PROTO-DEC-0047 item 5 | described | .ai/DECISIONS.md:1979 | batch-cap rule text |
| PROTO-DEC-0047 item 6 | partial | .ai/bin/protocol-dispatch.cjs:1300,1373 | stall detection (no-progress interval) mechanized; checkpoint and deputy policy stay operational |
| PROTO-DEC-0047 item 7 | described | .ai/docs/CLI-AGENTS.md:131 | narrow-grant and bypass-flag rules are text |
| PROTO-DEC-0047 item 8 | built | .ai/bin/protocol-verdict.cjs:518,705 | fail closed, unknown input exits 2 (BLOCKED); F-01 CLOSED (.ai/TASK.md Current state) |
| PROTO-DEC-0047 item 9 | partial | docs/core-arch/stage-4/MODEL-MATRIX.md:108 | models and effort recorded as verified data; not wired as kernel registry logic |
| PROTO-DEC-0047 item 10 | described | .ai/DECISIONS.md:1984 | CodeBurn rule recorded; not installed, owner approval pending |
| PROTO-DEC-0047 item 11 | described | .ai/DECISIONS.md:1985 | default-deny tool-governance rule text |
| PROTO-DEC-0047 item 12 | described | .ai/DECISIONS.md:1986 | scope statement, text only |

## Correction log 2026-09-28

Basis: `docs/reviews/2026-09-28-gpt-5.6-luna-dig-verification.md` (Mistral rejects) and the launch file `LAUNCH-DIG-FIX-MISTRAL.md` (PROTO-DEC-0096 item 2). Only rejected rows were changed. `described` = the item exists only as a written rule; `partial` = partly implemented. Header counts after correction: 129 total, 58 built, 11 partial, 60 described, 0 not built. Follow-up 2026-09-28 per `docs/reviews/2026-09-28-luna-dig-recheck.md` (single REJECT): the `PROTO-DEC-0045 item 6` proof was re-proofed; counts unchanged (built stays built).

- PROTO-DEC-0025 item 1: built / "git tag v1.9.4" -> described / .ai/DECISIONS.md:1159 (process rule, no code or commit artefact)
- PROTO-DEC-0025 item 2: built / .ai/bin/protocol-handoff.cjs -> built / .ai/bin/protocol-handoff.cjs:321,366
- PROTO-DEC-0025 item 4: built / protocol-manifest.json -> described / .ai/DECISIONS.md:1168
- PROTO-DEC-0025 item 5: built / git ls-files -> partial / docs/research/2026-09-27-roadmap-queue/BASELINE.md:1 (old "migration complete" claim wrong)
- PROTO-DEC-0026 item 1: built / docs/reviews/ (100+ files) -> described / AGENTS.md:234
- PROTO-DEC-0026 item 2: built / AGENTS.md section 5 -> described / AGENTS.md:239
- PROTO-DEC-0026 item 3: built / AGENTS.md section 5 -> described / AGENTS.md:243
- PROTO-DEC-0026 item 4: built / templates/reviews/REVIEW.md -> built / templates/reviews/REVIEW.md:4-6
- PROTO-DEC-0026 item 5: built / AGENTS.md section 5.5 -> described / AGENTS.md:253
- PROTO-DEC-0026 item 6: built / docs/reviews/archive/ -> described / AGENTS.md:256
- PROTO-DEC-0027 item 1: built / AGENTS.md section 2 -> described / AGENTS.md:93 (superseded by PROTO-DEC-0038 item 1)
- PROTO-DEC-0027 item 5: built / .ai/bin/protocol-archive.cjs -> built / .ai/bin/protocol-handoff.cjs:284,367
- PROTO-DEC-0028 item 3: built / .ai/bin/protocol-archive.cjs -> built / .ai/bin/protocol-handoff.cjs:253,291,305
- PROTO-DEC-0028 item 4: built / .ai/bin/protocol-hooks.cjs:642 -> built / .ai/bin/protocol-hooks.cjs:274 (:642 was sessionNonce)
- PROTO-DEC-0028 item 5: built / docs/reviews/2026-09-19-*-prompt.md -> built / docs/reviews/2026-09-19-final-v1.9.5-adversarial-review-prompt.md:1
- PROTO-DEC-0028 item 6: built / "git tag v1.9.4" -> built / c71bdcf (.ai/ARCHIVE.md:2235)
- PROTO-DEC-0029 item 1: built / .ai/bin/protocol-session.cjs -> built / .ai/bin/protocol-session.cjs:40
- PROTO-DEC-0029 item 2: built / .ai/bin/protocol-session.cjs -> built / .ai/bin/protocol-session.cjs:212,236,299
- PROTO-DEC-0029 item 3: built / .ai/bin/protocol-session.cjs -> built / .ai/bin/protocol-session.cjs:28,195
- PROTO-DEC-0029 item 4: built / .ai/bin/protocol-session.cjs -> built / .ai/bin/protocol-session.cjs:88
- PROTO-DEC-0031 item 1: built / AGENTS.md section 2 -> described / AGENTS.md:127
- PROTO-DEC-0031 item 2: built / templates/reviews/REVIEW.md -> built / templates/reviews/REVIEW.md:10-12
- PROTO-DEC-0031 item 3: built / AGENTS.md section 2 -> described / AGENTS.md:137
- PROTO-DEC-0032 item 2: built / .ai/bin/protocol-handoff.cjs -> built / .ai/bin/protocol-handoff.cjs:1287,1302
- PROTO-DEC-0032 item 3: built / .ai/bin/protocol-handoff.cjs -> built / .ai/bin/protocol-handoff.cjs:1343,1398
- PROTO-DEC-0032 item 4: built / .ai/bin/protocol-handoff.cjs -> built / .ai/bin/protocol-handoff.cjs:1273,1277,1281
- PROTO-DEC-0032 item 5: built / .ai/bin/protocol-handoff.cjs -> built / .ai/bin/protocol-handoff.cjs:1146,1244
- PROTO-DEC-0032 item 6: built / .ai/bin/protocol-handoff.cjs -> built / .ai/bin/protocol-handoff.cjs:1308
- PROTO-DEC-0032 item 7: built / .ai/bin/protocol-handoff.cjs -> built / validate-protocol.ps1:870
- PROTO-DEC-0032 item 8: built / .ai/bin/protocol-handoff.cjs -> built / .ai/bin/protocol-handoff.cjs:97
- PROTO-DEC-0033 item 1: built / docs/decisions/REGISTRY.md -> built / docs/decisions/REGISTRY.md:14
- PROTO-DEC-0033 item 2: built / docs/decisions/REGISTRY.md -> described / docs/decisions/REGISTRY.md:9
- PROTO-DEC-0033 item 3: built / docs/decisions/REGISTRY.md -> described / .ai/DECISIONS.md:1522
- PROTO-DEC-0033 item 4: built / AGENTS.md section 6 -> described / AGENTS.md:304
- PROTO-DEC-0033 item 5: built / validate-protocol.ps1 -> built / validate-protocol.ps1:478,506,531,547
- PROTO-DEC-0033 item 6: built / docs/decisions/REGISTRY.md -> built / docs/decisions/REGISTRY.md:47-50
- PROTO-DEC-0034 item 2: built / AGENTS.md section 11, .ai/docs/CLI-AGENTS.md -> built / tests/context-policy.test.cjs:25,28
- PROTO-DEC-0035 item 2: built / docs/reviews/2026-09-19-h1-pilot-design.md -> built / docs/reviews/2026-09-19-h1-pilot-design.md:184,188
- PROTO-DEC-0036 item 1: built / PROTO-DEC-0036 -> described / .ai/DECISIONS.md:1612
- PROTO-DEC-0036 item 2: built / PROTO-DEC-0034 -> described / .ai/DECISIONS.md:1613
- PROTO-DEC-0036 item 3: built / PROTO-DEC-0036 -> described / .ai/DECISIONS.md:1614
- PROTO-DEC-0036 item 4: built / PROTO-DEC-0036 -> described / .ai/DECISIONS.md:1615
- PROTO-DEC-0036 item 5: built / PROTO-DEC-0036 -> described / .ai/DECISIONS.md:1616
- PROTO-DEC-0037 item 1: built / docs/reviews/archive/ -> built / docs/reviews/archive/INDEX.md:3
- PROTO-DEC-0037 item 4: built / .ai/PLAN.md -> described / .ai/DECISIONS.md:1644
- PROTO-DEC-0037 item 5: built / PROTO-DEC-0037 -> described / .ai/DECISIONS.md:1645
- PROTO-DEC-0038 item 1: built / AGENTS.md section 2 -> described / AGENTS.md:93
- PROTO-DEC-0038 item 2: built / AGENTS.md section 2 -> described / AGENTS.md:104
- PROTO-DEC-0038 item 3: built / AGENTS.md section 2 -> described / AGENTS.md:107
- PROTO-DEC-0038 item 4: built / AGENTS.md, QUICKSTART.md -> built / QUICKSTART.md:38
- PROTO-DEC-0038 item 5: built / "-" -> described / .ai/DECISIONS.md:1675
- PROTO-DEC-0039 item 1: built / PROTO-DEC-0039 -> described / .ai/TASK.md:17
- PROTO-DEC-0039 item 2: partial / .ai/PLAN.md:51-54 -> partial / .ai/TASK.md:33,34 (acceptance checks are not pilot execution)
- PROTO-DEC-0039 item 3: partial / .ai/PLAN.md:74-76 -> partial / .ai/PLAN.md:82
- PROTO-DEC-0039 item 4: partial / .ai/DECISIONS.md:1700-1702 -> partial / docs/reviews/2026-09-19-deepseek-flash-certification-adjudication.md:18
- PROTO-DEC-0039 item 5: partial / .ai/DECISIONS.md:1703-1704 -> partial / .ai/TASK.md:39
- PROTO-DEC-0040 item 1: built / .ai/docs/PAIRED-CYCLE.md -> built / .ai/docs/PAIRED-CYCLE.md:1
- PROTO-DEC-0040 item 2: built / PROTO-DEC-0040 -> described / .ai/DECISIONS.md:1765
- PROTO-DEC-0040 item 3: partial / PROTO-DEC-0040:3 -> built / docs/reviews/2026-09-20-deepseek-gemini-paired-cycle-remediation-prompt.md:1 (remediation executed and closed, .ai/TASK.md:38,39)
- PROTO-DEC-0040 item 4: partial / PROTO-DEC-0040:4 -> built / .ai/TASK.md:38,39
- PROTO-DEC-0040 item 5: built / PROTO-DEC-0037 -> described / .ai/DECISIONS.md:1768
- PROTO-DEC-0040 item 6: built / PROTO-DEC-0039 -> described / .ai/DECISIONS.md:1769
- PROTO-DEC-0041 item 1: built / AGENTS.md section 2 -> described / AGENTS.md:102
- PROTO-DEC-0041 item 2: built / AGENTS.md section 2 -> described / AGENTS.md:101
- PROTO-DEC-0041 item 3: built / AGENTS.md section 2 -> built / .ai/bin/protocol-verdict.cjs:518,589,595
- PROTO-DEC-0041 item 4: built / PROTO-DEC-0041 -> built / .ai/bin/protocol-verdict.cjs:521
- PROTO-DEC-0041 item 5: built / PROTO-DEC-0041 -> partial / .ai/bin/protocol-verdict.cjs:468
- PROTO-DEC-0041 item 6: built / .ai/PLAN.md -> described / .ai/PLAN.md:141
- PROTO-DEC-0042 item 1: built / PROTO-DEC-0042 -> described / .ai/DECISIONS.md:1822
- PROTO-DEC-0042 item 2: built / PROTO-DEC-0042 -> described / .ai/DECISIONS.md:1823
- PROTO-DEC-0042 item 3: built / PROTO-DEC-0042 -> described / .ai/DECISIONS.md:1824
- PROTO-DEC-0042 item 4: built / PROTO-DEC-0042 -> described / .ai/DECISIONS.md:1825
- PROTO-DEC-0042 item 5: built / PROTO-DEC-0042 -> described / .ai/DECISIONS.md:1826
- PROTO-DEC-0042 item 6: built / PROTO-DEC-0042 -> partial / .ai/TASK.md:39,41 (criterion satisfied; pilots still pending)
- PROTO-DEC-0043 item 2: built / .ai/docs/CLI-AGENTS.md -> described / .ai/docs/CLI-AGENTS.md:54
- PROTO-DEC-0043 item 3: built / .ai/docs/CLI-AGENTS.md -> described / .ai/docs/CLI-AGENTS.md:71
- PROTO-DEC-0043 item 4: built / .ai/docs/CLI-AGENTS.md -> described / .ai/docs/CLI-AGENTS.md:95
- PROTO-DEC-0043 item 5: built / .ai/docs/CLI-AGENTS.md -> described / .ai/docs/CLI-AGENTS.md:109
- PROTO-DEC-0043 item 6: built / .ai/docs/CLI-AGENTS.md -> described / .ai/docs/CLI-AGENTS.md:125
- PROTO-DEC-0043 item 7: built / .ai/docs/CLI-AGENTS.md -> described / .ai/docs/CLI-AGENTS.md:30
- PROTO-DEC-0043 item 8: built / PROTO-DEC-0043 -> described / .ai/DECISIONS.md:1859
- PROTO-DEC-0044 item 2: built / .ai/bin/protocol-index.cjs -> built / .ai/bin/protocol-index.cjs:17
- PROTO-DEC-0044 item 3: built / .ai/bin/protocol-ledger.cjs -> built / .ai/bin/protocol-ledger.cjs:101,125
- PROTO-DEC-0044 item 4: built / PROTO-DEC-0044 -> described / .ai/DECISIONS.md:1887
- PROTO-DEC-0044 item 6: built / tests/index.test.cjs, tests/ledger.test.cjs -> built / tests/index.test.cjs:36, tests/ledger.test.cjs:23
- PROTO-DEC-0045 item 1: built / PROTO-DEC-0045 -> described / .ai/DECISIONS.md:1914
- PROTO-DEC-0045 item 2: built / PROTO-DEC-0045 -> described / .ai/DECISIONS.md:1915
- PROTO-DEC-0045 item 3: built / PROTO-DEC-0045 -> described / .ai/DECISIONS.md:1916
- PROTO-DEC-0045 item 4: built / PROTO-DEC-0045 -> described / .ai/DECISIONS.md:1917
- PROTO-DEC-0045 item 5: built / PROTO-DEC-0045 -> described / .ai/DECISIONS.md:1918
- PROTO-DEC-0045 item 6: built / docs/specs/2026-09-23-executable-rulebook-spec.md -> built / docs/specs/2026-09-23-executable-rulebook-spec.md:28 (implementation closed as F-01/F-02)
- PROTO-DEC-0046 item 1: built / PROTO-DEC-0046 -> described / .ai/DECISIONS.md:1944
- PROTO-DEC-0046 item 4: built / PROTO-DEC-0046 -> described / .ai/DECISIONS.md:1947
- PROTO-DEC-0046 item 5: built / tests/rulebook.test.cjs -> built / tests/rulebook.test.cjs:201,270,293
- PROTO-DEC-0046 item 6: partial / PROTO-DEC-0046:6 -> described / .ai/DECISIONS.md:1949
- PROTO-DEC-0047 item 1: built / PROTO-DEC-0047 -> described / .ai/DECISIONS.md:1975
- PROTO-DEC-0047 item 2: built / PROTO-DEC-0047 -> partial / .ai/bin/protocol-verdict.cjs:521,578
- PROTO-DEC-0047 item 3: built / PROTO-DEC-0047 -> described / .ai/DECISIONS.md:1977
- PROTO-DEC-0047 item 4: built / PROTO-DEC-0047 -> described / .ai/DECISIONS.md:1978
- PROTO-DEC-0047 item 5: built / PROTO-DEC-0047 -> described / .ai/DECISIONS.md:1979
- PROTO-DEC-0047 item 6: built / PROTO-DEC-0047 -> partial / .ai/bin/protocol-dispatch.cjs:1300,1373
- PROTO-DEC-0047 item 7: built / PROTO-DEC-0047 -> described / .ai/docs/CLI-AGENTS.md:131
- PROTO-DEC-0047 item 8: partial / docs/specs/2026-09-23-executable-rulebook-spec.md:1-4 -> built / .ai/bin/protocol-verdict.cjs:518,705 (F-01 CLOSED 2026-09-27)
- PROTO-DEC-0047 item 9: partial / PROTO-DEC-0047:9 -> partial / docs/core-arch/stage-4/MODEL-MATRIX.md:108
- PROTO-DEC-0047 item 10: partial / PROTO-DEC-0047:10 -> described / .ai/DECISIONS.md:1984 (CodeBurn not installed)
- PROTO-DEC-0047 item 11: built / PROTO-DEC-0047 -> described / .ai/DECISIONS.md:1985
- PROTO-DEC-0047 item 12: built / PROTO-DEC-0047 -> described / .ai/DECISIONS.md:1986
- PROTO-DEC-0045 item 6 (Luna recheck REJECT 2026-09-28): built / docs/specs/2026-09-23-executable-rulebook-spec.md:28 -> built / .ai/bin/protocol-verdict.cjs:4, .ai/bin/protocol-scope.cjs:4 (spec line 28 is the section-1 boundary, not an implementation proof; checks 1-4 exist as code, regression-tested in tests/rulebook.test.cjs:8,9, 54/54)
