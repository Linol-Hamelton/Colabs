# Work cycle of a participant — the owner's narrative mapped to procedures

Work product of CORE-ARCH stage 2 (S2-T08), not a kernel record. It holds no rule of its own:
every step points to the record that is the rule's home (R-L0-12). Stage 3 writes the task
lifecycle S-001; this map then becomes its input and is retired as a work product.

Source of the narrative: the owner's directive that opened the program (PROTO-DEC-0054 item 3 and
its Context), refined by PROTO-DEC-0055 item 5 (model and effort chosen before launch),
PROTO-DEC-0057 item 2 (the two review orders) and PROTO-DEC-0062 item 4 (asynchronous review).

## The cycle

| # | Owner's words (paraphrase) | Home | Artifact | State |
|---|---|---|---|---|
| 0 | The task is assessed and the model and effort are chosen before launch | P-L2-002 (R-L2-002.1, .4) | `tier` in the task frame | trial |
| 1 | The executor receives its role in the prompt | P-L2-006 dispatch; SCHEMA-assignment | packet; role line | pending (stage 3); draft |
| 2 | It understands where it is, its rights, duties and limits | P-L1-001 steps 1-6; ROLE-`<slot>` | `Launch:` and `Orientation:` lines | draft |
| 3 | It receives tools, criteria of success and bounds | P-L2-001 task frame and environment manifest | `task-frame`, `environment-manifest` | pending (stage 3) |
| 4 | It checks the complexity against its launch | P-L1-001 step 7; R-L2-002.5 | `Tier-mismatch:` line when they differ | draft; trial |
| 5 | It works by the standard procedure, checkpoint after each block | P-L2-003 execute | journal, tree | pending (stage 3) |
| 6 | It records the process and the cost | P-L2-003; L6 metrics M-001..M-009 | cost fields of the journal entry | pending (stages 3, 5) |
| 7 | It hands the work to review | P-L2-004 accept; P-L2-008 freeze | candidate package | pending; trial |
| 7a | Standard cycle: after the reviewer's PASS or RECOMMENDATION the work goes to a certifier, whose PASS approves it and whose FAIL or RECOMMENDATION sends it to the owner | R-L1-reviewer.4, R-L1-certifier.4 | certifier's verdict | draft |
| 7b | Kernel work: after the reviewer's PASS or RECOMMENDATION the stage goes to the owner | R-L1-reviewer.4; R-L0-19 | owner's decision block | draft; approved (stage 1) |
| 8 | It does not wait for the reviewer: it designs the next stage, lands nothing, at most two stages in review; what is under review is frozen | P-L2-009 pipelined review (freeze: CORE-ARCH-4 section 9 rule 7, CB-11) | reviewed commit SHA or path hashes in the review prompt | pending; pilot running (PROTO-DEC-0062 item 4) |
| 9 | After the cycle it checks for findings and answers them | P-L2-009 "collect verdicts"; S-005 fix round | fix response with a line per finding | pending (stage 3) |

## Checks of this map

- Every step names a home. Seven homes are pending stage 3: P-L2-001, P-L2-003, P-L2-004,
  P-L2-006, P-L2-009, S-005 and the L6 cost fields. They are listed in CORE-ARCH-4 section 2.
- Step 0 was step 4 in the original narrative (the executor chose its own rank). PROTO-DEC-0055
  item 5 moved the choice before launch; the executor now only checks it (step 4).
- Steps 7a and 7b are the two orders of PROTO-DEC-0057 item 2. They are rules of the reviewer and
  certifier roles, not of this map.
- The session that wrote this map follows it only in part. It started before P-L1-001 and
  P-L2-002 existed, so it wrote no `Launch:` or `Orientation:` line (steps 0 and 2); its role
  came from the SessionStart hook. It does follow step 7b (stage 2 goes to DeepSeek, then to the
  owner) and step 8 (stage 3 design starts while stage 2 is under review).
