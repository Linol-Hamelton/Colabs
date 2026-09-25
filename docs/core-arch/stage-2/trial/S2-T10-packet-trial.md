# Trial S2-T10 — a packet compiled by hand for a past task, against that day's prompt

Work product of CORE-ARCH stage 2, not a kernel record. Produced by `claude-eb97ac9d13050014` on
2026-09-25; rows 3 and 5 corrected by `claude-ad7cc4169e888ea8` on 2026-09-25 (CB-08). Past task: the stage-1 control, dispatched on 2026-09-24 with the hand-written prompt
`docs/reviews/2026-09-24-claude-core-arch-stage1-control-prompt.md` (115 lines). The packet uses
the format of CORE-ARCH-3 section 6 and the records of stages 1 and 2 as they stand today.

Acceptance (CORE-ARCH-3 section 9): no rule of the hand-written prompt is missing from the
packet, or its absence has become a signal.

## 1. The packet compiler refuses the task as dispatched

The prompt gave one model two roles in one task: critic of CORE-ARCH-1 (Part 1, PROTO-DEC-0053
step c) and controller of stage 1 (Parts 2-4). Under R-L2-002.2 and P-L1-001 step 5 that is exit 1.
The rule is later than the prompt (PROTO-DEC-0056 item 2), so this is no defect of that day's
work, but a compiler would split it into two frames:

```
PACKET task:ca1-critique-deepseek critic deepseek-flash
Root: docs/core-arch/stage-1/L0-ROOT.md
Role: docs/core-arch/stage-2/roles/ROLE-critic.md
Stage: research  Procedures (full): P-L1-001, S-003 (trial)  Catalog (summary): all other records
Task frame: Part 1 of the prompt (inputs 1-2, the three r3 syntheses, output path, 250 lines)
Tools granted: shell read-only, git read-only  Success: every 3.3 resolution and 4.x pillar answered in the agreement form
Budgets: attempts=2, idle=5m, cap=<owner>

PACKET task:stage1-control reviewer deepseek-flash
Root: docs/core-arch/stage-1/L0-ROOT.md
Role: docs/core-arch/stage-2/roles/ROLE-reviewer.md
Stage: accept  Procedures (full): P-L1-001, P-L1-002, P-L0-001, P-L0-004  Catalog (summary): all other records
Task frame: Parts 2-4 of the prompt (inputs 1-8, the nine angles, output paths)
Tools granted: shell read-only, git read-only, protocol-session, protocol-handoff record
Success: a verdict token; one reproduction per FAIL claim; the ledger in spec section 2 format
Budgets: attempts=2 per root cause, idle=5m, cap=<owner>
```

Both frames name the same model. That is allowed: two frames, one role each. Whether a critic of
the draft may control the stage built on it is not a question of R-L2-002.2, and no rule forbids
it (PROTO-DEC-0055 item 2 named DeepSeek for both).

## 2. Every instruction of the prompt, and where the packet carries it

Carried: a record in the packet holds the rule. Frame: task-specific, belongs in the task frame
(P-L2-001, stage 3). Pending: the rule's home is planned (named) but not yet written.

| # | Prompt instruction (line) | Where in the packet | State |
|---|---|---|---|
| 1 | the author certifies none of this work (3-4) | R-L0-05 | carried |
| 2 | Mode ADVISORY; the controller never certifies (8-10) | R-L1-reviewer.5 with R-L0-05 | carried |
| 3 | a reproduced FAIL or BLOCKED still blocks (9-10) | R-L1-reviewer.2, which names PROTO-DEC-0041 items 3-5 and `AGENTS.md:137-138` (R-L1-002.3 only says who may report; corrected by CB-08) | carried |
| 4 | model and effort named at launch; tier (11-13) | R-L2-002.4, .5 through P-L1-001 step 2 | carried after fix T-1 |
| 5 | launch line "Read and follow the file ..." (14) | only PROTO-DEC-0050 item 2 today; home planned in P-L2-006, which R-L1-dispatcher.2 names without carrying the line (corrected by CB-08) | pending (stage 3) |
| 6 | check the repository root (18) | P-L1-001 step 1 | carried |
| 7 | `protocol-session start`; owner name for journal and Evidence (19-20) | P-L2-010 (RULE-MAP AR-033) | pending (stage 3) |
| 8 | first journal line `Launch:` with actual values (21-22) | R-L2-002.5 | carried after fix T-1 |
| 9 | do not open the other critique first; record that (23-24) | R-L2-S003.4 through R-L1-critic.1 | carried |
| 10 | inputs and their roles (26-37) | task frame | frame |
| 11 | check claims against sources; unpersisted synthesis is unverified (39-43) | R-L0-08, R-L0-16 | carried |
| 12 | Part 1 output path and 250 lines (47) | frame; cap in P-L7-001 (AR-020) | frame; pending (stage 6) |
| 13 | marks checked against the cited synthesis (48-49) | task frame | frame |
| 14 | the fixed agreement form (50-52) | R-L2-S003.4; the form itself P-L7-002 | carried; pending (stage 6) |
| 15 | name omitted hypotheses (53) | task frame | frame |
| 16 | do not quote another report; cite by `path:line` (54) | P-L7-002 (CORE-ARCH-7 section 2); detector CORE-ARCH-4 section 8 | pending (stages 3, 6) — signal T-3 |
| 17 | Part 2 transcription check (56-61) | task frame | frame |
| 18 | Part 3 nine angles (63-77) | task frame; angle 1 also P-L0-004 | frame |
| 19 | Part 4 tasks, budget ≤ 2 attempts per root cause (79-87) | frame; R-L0-11 | frame; carried |
| 20 | report path, 250 lines, header fields, one verdict token (91-94) | P-L2-004 (token, through R-L1-reviewer.2); P-L7-001 (header, AR-039) | pending (stages 3, 6) |
| 21 | ledger format of spec section 2; ids; attempt 1 (95-97) | findings-ledger schema (L5) | pending (stage 5) |
| 22 | one reproduction per FAIL or BLOCKED claim (98-99) | P-L2-004 through R-L1-reviewer.2 (RULE-MAP AR-024) | pending (stage 3) |
| 23 | label claims FACT, CLAIM, HYPOTHESIS (100) | R-L0-06 | carried |
| 24 | write only three files and the journal; edit no draft or shared file (101-102) | frame scope; R-L1-reviewer.3 | frame; carried |
| 25 | no commit (102) | R-L0-07 | carried |
| 26 | no lock needed (102) | P-L5-001 (trial) | carried |
| 27 | checkpoint after each part (103) | P-L2-003 | pending (stage 3) — signal T-4 |
| 28 | `Signal:` lines for procedure gaps (103) | P-L0-002 step 3 (interim, until the signals ledger) | carried |
| 29 | five-label entry, then `record` (103-105) | P-L2-010, P-L2-011 (AR-030, AR-037, AR-048) | pending (stage 3) |
| 30 | never write secrets (106) | R-L0-07 | carried |
| 31 | without filesystem access, chat transcription (107-108) | P-L7-001 (AR-040) | pending (stage 6) |
| 32 | fixes answered per row; diff-only second pass (112-114) | S-005; PROTO-DEC-0049 item 1 | pending (stage 3) |
| 33 | the stage goes to the owner after PASS or RECOMMENDATION (115) | R-L1-reviewer.4 | carried |

Count over 37 parts (rows 12, 14, 19 and 24 have two each): 17 carried, two of them after fix T-1;
8 frame; 12 pending with a named home; 0 without a home. Four of the pending parts (rows 14, 16,
20 and 22) are rules a reviewer or critic needs at once; until stage 3 and stage 6
write their homes, the hand-written prompt still has to carry them.

## 3. What the packet adds that the prompt lacked

- The orientation line (P-L1-001 step 4): the prompt never asked the reviewer to state its rights
  and limits before starting.
- The tier check (P-L1-001 step 7): the prompt asked for "T3, the strongest model at the highest
  setting", which no procedure then defined; the control ran on `deepseek/deepseek-flash`, effort
  unknown (`docs/reviews/2026-09-24-deepseek-core-arch-stage1-control.md:7`).
- The split into two frames (section 1).

## 4. Signals

- **T-1 (fixed in this stage).** P-L2-002 step 7 is done by the executor, but the record's `roles`
  named only coordinator and owner, so a reviewer's packet would not load it and would miss the
  `Launch:` grammar. P-L2-002 0.4 sets `roles: [all]`, so every packet lists it at summary level,
  and P-L1-001 step 2 points the session to R-L2-002.5. A `session-start` trigger was tried and
  dropped: it loads 7,310 B in full into every packet (LCC-8 of L1).
- **T-2.** A hand-written prompt of 2026-09-24 gave one model two roles in one task. Stage 3's
  dispatch procedure (P-L2-006) should refuse such a frame, not merely the session (P-L1-001).
- **T-3.** The no-quoting rule of PROTO-DEC-0048 item 3 has no written home yet; it is planned in
  P-L7-002 (CORE-ARCH-7 section 2, stage 6), with its detector applied in CORE-ARCH-4 section 8
  (stage 3). Until stage 6 only a hand-written prompt carries it, although critics and
  synthesisers need it from stage 3 on.
- **T-4.** The reviewer role has no checkpoint duty; only ROLE-implementer has one. The liveness
  rule (PROTO-DEC-0047 item 6) applies to every executor, so its home should be P-L2-003 with
  `roles: [all]`, not a role record.
