# DIG corrected-row recheck — GPT-5.6 Luna

Reviewed commit: `e13cb36b59a188f215b1d81d54a9cfb8c4ee64b2`
Working tree: dirty at review start; only the two producer files named by the launch were inspected for row evidence. Existing journals and `drafts/.ai/` were out of scope.
Reviewer: GPT-5.6 Luna via Codex, effort XHigh. Date: 2026-09-28 UTC.
Scope: only the 107 Mistral correction-log rows and the 11 Gemini correction-log rows in `DIG-MISTRAL-0022-0047.md` and `DIG-GEMINI-0048-0067.md`; DeepSeek was excluded.
Method: resolved each new proof against the tree at the reviewed commit. `CONFIRM` means the cited path/line or commit exists and supports the corrected status; `REJECT` means the new proof does not establish the claimed status. No producer file was edited.
Verdict: RECOMMENDATION — 117/118 corrected rows are proven; one Mistral proof remains insufficient and should be corrected before the packet is treated as fully verified.

## Mistral — corrected rows

| Row | Status | New proof | Result |
|---|---|---|---|
| PROTO-DEC-0025 item 1 | described | `.ai/DECISIONS.md:1159` | CONFIRM |
| PROTO-DEC-0025 item 2 | built | `.ai/bin/protocol-handoff.cjs:321,366` | CONFIRM |
| PROTO-DEC-0025 item 4 | described | `.ai/DECISIONS.md:1168` | CONFIRM |
| PROTO-DEC-0025 item 5 | partial | `docs/research/2026-09-27-roadmap-queue/BASELINE.md:1` | CONFIRM |
| PROTO-DEC-0026 item 1 | described | `AGENTS.md:234` | CONFIRM |
| PROTO-DEC-0026 item 2 | described | `AGENTS.md:239` | CONFIRM |
| PROTO-DEC-0026 item 3 | described | `AGENTS.md:243` | CONFIRM |
| PROTO-DEC-0026 item 4 | built | `templates/reviews/REVIEW.md:4-6` | CONFIRM |
| PROTO-DEC-0026 item 5 | described | `AGENTS.md:253` | CONFIRM |
| PROTO-DEC-0026 item 6 | described | `AGENTS.md:256` | CONFIRM |
| PROTO-DEC-0027 item 1 | described | `AGENTS.md:93` | CONFIRM |
| PROTO-DEC-0027 item 5 | built | `.ai/bin/protocol-handoff.cjs:284,367` | CONFIRM |
| PROTO-DEC-0028 item 3 | built | `.ai/bin/protocol-handoff.cjs:253,291,305` | CONFIRM |
| PROTO-DEC-0028 item 4 | built | `.ai/bin/protocol-hooks.cjs:274` | CONFIRM |
| PROTO-DEC-0028 item 5 | built | `docs/reviews/2026-09-19-final-v1.9.5-adversarial-review-prompt.md:1` | CONFIRM |
| PROTO-DEC-0028 item 6 | built | commit `c71bdcf` | CONFIRM |
| PROTO-DEC-0029 item 1 | built | `.ai/bin/protocol-session.cjs:40` | CONFIRM |
| PROTO-DEC-0029 item 2 | built | `.ai/bin/protocol-session.cjs:212,236,299` | CONFIRM |
| PROTO-DEC-0029 item 3 | built | `.ai/bin/protocol-session.cjs:28,195` | CONFIRM |
| PROTO-DEC-0029 item 4 | built | `.ai/bin/protocol-session.cjs:88` | CONFIRM |
| PROTO-DEC-0031 item 1 | described | `AGENTS.md:127` | CONFIRM |
| PROTO-DEC-0031 item 2 | built | `templates/reviews/REVIEW.md:10-12` | CONFIRM |
| PROTO-DEC-0031 item 3 | described | `AGENTS.md:137` | CONFIRM |
| PROTO-DEC-0032 item 2 | built | `.ai/bin/protocol-handoff.cjs:1287,1302` | CONFIRM |
| PROTO-DEC-0032 item 3 | built | `.ai/bin/protocol-handoff.cjs:1343,1398` | CONFIRM |
| PROTO-DEC-0032 item 4 | built | `.ai/bin/protocol-handoff.cjs:1273,1277,1281` | CONFIRM |
| PROTO-DEC-0032 item 5 | built | `.ai/bin/protocol-handoff.cjs:1146,1244` | CONFIRM |
| PROTO-DEC-0032 item 6 | built | `.ai/bin/protocol-handoff.cjs:1308` | CONFIRM |
| PROTO-DEC-0032 item 7 | built | `validate-protocol.ps1:870` | CONFIRM |
| PROTO-DEC-0032 item 8 | built | `.ai/bin/protocol-handoff.cjs:97` | CONFIRM |
| PROTO-DEC-0033 item 1 | built | `docs/decisions/REGISTRY.md:14` | CONFIRM |
| PROTO-DEC-0033 item 2 | described | `docs/decisions/REGISTRY.md:9` | CONFIRM |
| PROTO-DEC-0033 item 3 | described | `.ai/DECISIONS.md:1522` | CONFIRM |
| PROTO-DEC-0033 item 4 | described | `AGENTS.md:304` | CONFIRM |
| PROTO-DEC-0033 item 5 | built | `validate-protocol.ps1:478,506,531,547` | CONFIRM |
| PROTO-DEC-0033 item 6 | built | `docs/decisions/REGISTRY.md:47-50` | CONFIRM |
| PROTO-DEC-0034 item 2 | built | `tests/context-policy.test.cjs:25,28` | CONFIRM |
| PROTO-DEC-0035 item 2 | built | `docs/reviews/2026-09-19-h1-pilot-design.md:184,188` | CONFIRM |
| PROTO-DEC-0036 item 1 | described | `.ai/DECISIONS.md:1612` | CONFIRM |
| PROTO-DEC-0036 item 2 | described | `.ai/DECISIONS.md:1613` | CONFIRM |
| PROTO-DEC-0036 item 3 | described | `.ai/DECISIONS.md:1614` | CONFIRM |
| PROTO-DEC-0036 item 4 | described | `.ai/DECISIONS.md:1615` | CONFIRM |
| PROTO-DEC-0036 item 5 | described | `.ai/DECISIONS.md:1616` | CONFIRM |
| PROTO-DEC-0037 item 1 | built | `docs/reviews/archive/INDEX.md:3` | CONFIRM |
| PROTO-DEC-0037 item 4 | described | `.ai/DECISIONS.md:1644` | CONFIRM |
| PROTO-DEC-0037 item 5 | described | `.ai/DECISIONS.md:1645` | CONFIRM |
| PROTO-DEC-0038 item 1 | described | `AGENTS.md:93` | CONFIRM |
| PROTO-DEC-0038 item 2 | described | `AGENTS.md:104` | CONFIRM |
| PROTO-DEC-0038 item 3 | described | `AGENTS.md:107` | CONFIRM |
| PROTO-DEC-0038 item 4 | built | `QUICKSTART.md:38` | CONFIRM |
| PROTO-DEC-0038 item 5 | described | `.ai/DECISIONS.md:1675` | CONFIRM |
| PROTO-DEC-0039 item 1 | described | `.ai/TASK.md:17` | CONFIRM |
| PROTO-DEC-0039 item 2 | partial | `.ai/TASK.md:33,34` | CONFIRM |
| PROTO-DEC-0039 item 3 | partial | `.ai/PLAN.md:82` | CONFIRM |
| PROTO-DEC-0039 item 4 | partial | `docs/reviews/2026-09-19-deepseek-flash-certification-adjudication.md:18` | CONFIRM |
| PROTO-DEC-0039 item 5 | partial | `.ai/TASK.md:39` | CONFIRM |
| PROTO-DEC-0040 item 1 | built | `.ai/docs/PAIRED-CYCLE.md:1` | CONFIRM |
| PROTO-DEC-0040 item 2 | described | `.ai/DECISIONS.md:1765` | CONFIRM |
| PROTO-DEC-0040 item 3 | built | `docs/reviews/2026-09-20-deepseek-gemini-paired-cycle-remediation-prompt.md:1` | CONFIRM |
| PROTO-DEC-0040 item 4 | built | `.ai/TASK.md:38,39` | CONFIRM |
| PROTO-DEC-0040 item 5 | described | `.ai/DECISIONS.md:1768` | CONFIRM |
| PROTO-DEC-0040 item 6 | described | `.ai/DECISIONS.md:1769` | CONFIRM |
| PROTO-DEC-0041 item 1 | described | `AGENTS.md:102` | CONFIRM |
| PROTO-DEC-0041 item 2 | described | `AGENTS.md:101` | CONFIRM |
| PROTO-DEC-0041 item 3 | built | `.ai/bin/protocol-verdict.cjs:518,589,595` | CONFIRM |
| PROTO-DEC-0041 item 4 | built | `.ai/bin/protocol-verdict.cjs:521` | CONFIRM |
| PROTO-DEC-0041 item 5 | partial | `.ai/bin/protocol-verdict.cjs:468` | CONFIRM |
| PROTO-DEC-0041 item 6 | described | `.ai/PLAN.md:141` | CONFIRM |
| PROTO-DEC-0042 item 1 | described | `.ai/DECISIONS.md:1822` | CONFIRM |
| PROTO-DEC-0042 item 2 | described | `.ai/DECISIONS.md:1823` | CONFIRM |
| PROTO-DEC-0042 item 3 | described | `.ai/DECISIONS.md:1824` | CONFIRM |
| PROTO-DEC-0042 item 4 | described | `.ai/DECISIONS.md:1825` | CONFIRM |
| PROTO-DEC-0042 item 5 | described | `.ai/DECISIONS.md:1826` | CONFIRM |
| PROTO-DEC-0042 item 6 | partial | `.ai/TASK.md:39,41` | CONFIRM |
| PROTO-DEC-0043 item 2 | described | `.ai/docs/CLI-AGENTS.md:54` | CONFIRM |
| PROTO-DEC-0043 item 3 | described | `.ai/docs/CLI-AGENTS.md:71` | CONFIRM |
| PROTO-DEC-0043 item 4 | described | `.ai/docs/CLI-AGENTS.md:95` | CONFIRM |
| PROTO-DEC-0043 item 5 | described | `.ai/docs/CLI-AGENTS.md:109` | CONFIRM |
| PROTO-DEC-0043 item 6 | described | `.ai/docs/CLI-AGENTS.md:125` | CONFIRM |
| PROTO-DEC-0043 item 7 | described | `.ai/docs/CLI-AGENTS.md:30` | CONFIRM |
| PROTO-DEC-0043 item 8 | described | `.ai/DECISIONS.md:1859` | CONFIRM |
| PROTO-DEC-0044 item 2 | built | `.ai/bin/protocol-index.cjs:17` | CONFIRM |
| PROTO-DEC-0044 item 3 | built | `.ai/bin/protocol-ledger.cjs:101,125` | CONFIRM |
| PROTO-DEC-0044 item 4 | described | `.ai/DECISIONS.md:1887` | CONFIRM |
| PROTO-DEC-0044 item 6 | built | `tests/index.test.cjs:36; tests/ledger.test.cjs:23` | CONFIRM |
| PROTO-DEC-0045 item 1 | described | `.ai/DECISIONS.md:1914` | CONFIRM |
| PROTO-DEC-0045 item 2 | described | `.ai/DECISIONS.md:1915` | CONFIRM |
| PROTO-DEC-0045 item 3 | described | `.ai/DECISIONS.md:1916` | CONFIRM |
| PROTO-DEC-0045 item 4 | described | `.ai/DECISIONS.md:1917` | CONFIRM |
| PROTO-DEC-0045 item 5 | described | `.ai/DECISIONS.md:1918` | CONFIRM |
| PROTO-DEC-0045 item 6 | built | `docs/specs/2026-09-23-executable-rulebook-spec.md:28` | REJECT |
| PROTO-DEC-0046 item 1 | described | `.ai/DECISIONS.md:1944` | CONFIRM |
| PROTO-DEC-0046 item 4 | described | `.ai/DECISIONS.md:1947` | CONFIRM |
| PROTO-DEC-0046 item 5 | built | `tests/rulebook.test.cjs:201,270,293` | CONFIRM |
| PROTO-DEC-0046 item 6 | described | `.ai/DECISIONS.md:1949` | CONFIRM |
| PROTO-DEC-0047 item 1 | described | `.ai/DECISIONS.md:1975` | CONFIRM |
| PROTO-DEC-0047 item 2 | partial | `.ai/bin/protocol-verdict.cjs:521,578` | CONFIRM |
| PROTO-DEC-0047 item 3 | described | `.ai/DECISIONS.md:1977` | CONFIRM |
| PROTO-DEC-0047 item 4 | described | `.ai/DECISIONS.md:1978` | CONFIRM |
| PROTO-DEC-0047 item 5 | described | `.ai/DECISIONS.md:1979` | CONFIRM |
| PROTO-DEC-0047 item 6 | partial | `.ai/bin/protocol-dispatch.cjs:1300,1373` | CONFIRM |
| PROTO-DEC-0047 item 7 | described | `.ai/docs/CLI-AGENTS.md:131` | CONFIRM |
| PROTO-DEC-0047 item 8 | built | `.ai/bin/protocol-verdict.cjs:518,705` | CONFIRM |
| PROTO-DEC-0047 item 9 | partial | `docs/core-arch/stage-4/MODEL-MATRIX.md:108` | CONFIRM |
| PROTO-DEC-0047 item 10 | described | `.ai/DECISIONS.md:1984` | CONFIRM |
| PROTO-DEC-0047 item 11 | described | `.ai/DECISIONS.md:1985` | CONFIRM |
| PROTO-DEC-0047 item 12 | described | `.ai/DECISIONS.md:1986` | CONFIRM |

Mistral: **106 confirmed / 107 checked = 99.1% proven**. Reject: `PROTO-DEC-0045 item 6` — the corrected proof is the specification heading/boundary at `docs/specs/2026-09-23-executable-rulebook-spec.md:28`; it does not prove the claimed built implementation. No UNSURE rows.

## Gemini — corrected rows

| Row | Status | New proof | Result |
|---|---|---|---|
| PROTO-DEC-0048 item 6 | built | `docs/core-arch/CORE-ARCH-1.md:260` | CONFIRM |
| PROTO-DEC-0050 item 3 | built | `.ai/docs/clients.json:2` | CONFIRM |
| PROTO-DEC-0053 item 4 | built | `docs/core-arch/stage-1/trial/S-003-research-cycle.md:40` | CONFIRM |
| PROTO-DEC-0055 item 4 | built | `docs/core-arch/stage-1/L0-ROOT.md:39` | CONFIRM |
| PROTO-DEC-0057 item 4 | described | `.ai/DECISIONS.md:2336` | CONFIRM |
| PROTO-DEC-0060 item 1 | built | `docs/reviews/2026-09-24-deepseek-core-arch-stage1-recheck.md:9` | CONFIRM |
| PROTO-DEC-0062 item 4 | built | `docs/core-arch/stage-2/WORK-CYCLE.md:25` | CONFIRM |
| PROTO-DEC-0065 item 3 | built | `docs/reviews/2026-09-25-deepseek-core-arch-stage2-review.md:12` | CONFIRM |
| PROTO-DEC-0066 item 5 | built | `docs/research/2026-09-25-improvement-research/prompts/A-research.md:51` | CONFIRM |
| PROTO-DEC-0066 item 6 | partial | `docs/research/FRAMES.md:28-30` | CONFIRM |
| PROTO-DEC-0067 item 7 | built | `docs/core-arch/stage-4/P-L3-004-route-failover.md:158` | CONFIRM |

Gemini: **11 confirmed / 11 checked = 100% proven**. Reject: none. UNSURE: none; the former `PROTO-DEC-0066 item 6` uncertainty is resolved by the three-line frame state table.

## Overall disposition

118 corrected rows were checked: **117 CONFIRM, 1 REJECT, 0 UNSURE**. No range is below the 80% owner-escalation threshold. The Mistral range still needs one corrected proof for `PROTO-DEC-0045 item 6`; this report does not edit the producer, reopen a decision, or certify the DIG packet.
