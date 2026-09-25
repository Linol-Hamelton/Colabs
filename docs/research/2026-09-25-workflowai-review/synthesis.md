# Synthesis: dispositions and the revision proposal for workflowAI.md

- Frame: `task:wai-synthesis`. Mode: ADVISORY (COMMON.md). Nothing here is a decision.
- Synthesiser: `claude-opus-5-5`, effort high, client claude (run-chain `synthesis-1.cmd`).
- Baseline: `cdf4864308ec19da8ab90e553edb884f6de0b77f`. The subject, PROTO-DEC-0073..0076 and the
  ops files are unchanged from `0200730` to it. `positions/A.md`, `positions/B.md`, `critique.md`,
  `USAGE.md` are untracked step outputs read from the working tree.
- Method: every finding re-read against the cited lines; the critique is checked, not trusted.
  Line refs below are to `docs/core-arch/stage-4/workflowAI.md` (WAI) unless named.

## 1. Dispositions

Classes per PROTO-DEC-0076 item 5. "Dissent" names who classed it otherwise.

| # | Finding (origin) | Disposition | Class | Reason |
|---|---|---|---|---|
| D1 | No terminal case when no rung meets the floor (A-1, B-2, critique A-1) | ACCEPT | medium | FACT WAI:43-44 needs a rung at or above the floor; nothing covers none. FACT the owner already rules the case: "если заместителя нужного capability class нет — `BLOCKED` и вопрос владельцу" (`OWNER-DECISION-execution-model-2026-09-25.md:105`); budget case in `.ai/DECISIONS.md:3127-3128`. Not blocking: C-3 is unscripted and the only hand use, M-3, feeds K-launch, already blocked by P-1. Dissent: A blocking, B also simple. |
| D2 | "Owner is not asked" violates 0075 item 9 in the plain skip case (A-1, A §2.1) | REJECT | - | Item 9 speaks of no model fitting the budget (`.ai/DECISIONS.md:3127`); a skip with others left is not that case. Wording clarified in R1. |
| D3 | Group tie by headroom undefined across units or when unreadable (A-2; B-3 says covered) | ACCEPT, DEFER the rule to the owner | complex-non-blocking | FACT units differ: rolling %, prepaid $, monthly allowance (`MODEL-ECONOMICS.md:69-77`). R2 proposes a rule; owner question Q2. B's "covered" is wrong. |
| D4 | Independence only a preference, only for substitutes (A-3; B-4 says covered; critique 3.4) | ACCEPT | medium | FACT WAI:45-46 "preferring another family"; 0075 item 13 names five constraint forms (`.ai/DECISIONS.md:3153-3156`; owner text `OWNER-DECISION...md:999-1017`: declared per workflow, not needed for cheap low-risk work). Fix: declared constraints are filters on primary and substitutes. |
| D5 | Resolver omits the compatibility and budget gates of 0075 item 9 (critique 3.1; A §2.2 untriaged; B-6 "consistent") | ACCEPT | medium | FACT item 9 order floor -> compatibility -> quality..cost -> step budget (`.ai/DECISIONS.md:3121-3128`); hard constraints `:3119-3120`. WAI 1.5 has neither gate. |
| D6 | Fewer than two admissible substitutes (critique 3.2) | ACCEPT, fix differs | medium | FACT 1.5.3 undefined below two; item 10 lets the dispatch file state the number (`.ai/DECISIONS.md:3132`). Synthesis fix: record the shortfall, start, BLOCKED plus owner question when recovery needs a substitute that is not there (OWNER-DECISION:105). Dissent: critique asks the owner at launch for high-criticality stages. Q3. |
| D7 | Approval-gated DeepSeek V4.1 Max can be picked automatically (critique 3.3; A §2.4 untriaged) | ACCEPT | medium | FACT rung 5 "on approval" (`MODEL-ECONOMICS.md:34`); 1.4 has no approval state (WAI:34-38); 0076 item 1 (`.ai/DECISIONS.md:3221-3225`). Q4 on scope. |
| D8 | Unreadable limit (A-1.4; B-5 "covered") | ACCEPT | simple | FACT "where readable" (WAI:37). INFERENCE run-time exhaustion is QUOTA_EXHAUSTED, handled by 0075 item 4 and OWNER-DECISION:99-105; say so in 1.4. B overstated. |
| D9 | Section 1.3 conflicts with the Kilo route (A-7) | REJECT | - | FACT WAI:32-33 names the exception, as 0076 item 1 does; `MODEL-ECONOMICS.md:34` is its route. |
| D10 | Row 2 cites the file itself (A-5; B says correct) | ACCEPT with critique's fix | simple | FACT WAI:70. Cite 0076 item 2 (`.ai/DECISIONS.md:3226-3229`), do not demote. Dissent: A medium, demote. Synthesiser adds: row 3 (WAI:71) and row 9 (WAI:77) have the same weak source; 0075 item 10 records reasons but says nothing of an override. |
| D11 | H-WAI-6 already decided, move to Undisputed (A-4) | REJECT the move; ACCEPT a note | simple | FACT 0074 item 4 decides role semantics, not "categories over one ladder" (WAI:94-95); frozen (`BACKLOG.md:57`, 0076 item 4). |
| D12 | H-WAI-4 partly decided (A §3) | REJECT | - | Role tiering is decided; per-class ladders are not. Frozen; no change. |
| D13 | "only accumulates statuses" vs active recovery (A-6) | ACCEPT the wording; the conflict stays open | simple | FACT the block text has no "only" (`.ai/DECISIONS.md:3230-3231`); the owner's "лишь" is at `:3212`; 0075 item 11 gives the supervisor recovery (`:3137-3145`). R4 aligns to the block and cites both. Q1. A's text picks a side and is not used. |
| D14 | Script cannot "formulate" manual-acceptance reasons (A §4.2) | REJECT, clarify | simple | INFERENCE the script records the coordinator's reasons (0075 Consequences, `.ai/DECISIONS.md:3185-3187`). R4 says so. |
| D15 | Section 2 "fully scriptable" (B-8) and resume-first missing (B-7) | ACCEPT as the critique corrects it | medium (as M-4) | FACT M-4 already tracks it (`BACKLOG.md:32-33`); section 2 is silent on 0075 items 6 and 11. Fix: cite them in section 2, name M-4 in section 5 (critique 3.5, simple). |
| D16 | Runner does not read the ladder (B-1, "simple") | REJECT as new | - | It is WAI:107-108 itself, tracked as C-3 (`BACKLOG.md:50-51`); a scripted resolver, not an along-the-way fix. R7 names C-3. |
| D17 | Section 3 "12 rows, fully correct" (B-9) | REJECT | - | FACT 11 rows, WAI:69-79; see D10, D11. |
| D18 | B's `path:line` refs miss their quotes (critique B-10) | ACCEPT as a note | - | Checked: B.md:25,27,31,33 point outside the quoted sections. B's claims were verified here from the subject. |
| D19 | Report promises "usage" unconditionally (critique 3.6) | ACCEPT | simple | FACT WAI:59-60; `USAGE.md:4`. |
| D20 | TD-MODEL-QUALIFICATION has no backlog id (critique 3.7) | ACCEPT | simple (the line); the TD is complex-non-blocking | FACT no line names it (`BACKLOG.md:1-58`). Synthesiser adds: its parts (WAI:115-120) overlap H-WAI-2..5, frozen, so it cannot close while 0076 item 4 stands. Dissent: critique medium. |
| D21 | "stale-data handling" names no artefact (critique 3.8) | ACCEPT, smaller fix | simple | FACT WAI:119. Name the ladder snapshot and record its date at launch (0075 item 7). No age limit is proposed: that would be a new rule. |
| D22 | Semantic failure needs a reviewer (A §4.1) | ACCEPT as a note | - | 0075 item 12; stated in R4. |

## 2. Revision proposal for workflowAI.md (the implementer applies it; this file edits nothing)

R1. Replace section 1 item 4 (WAI:34-39) with:

```markdown
4. Rung availability is checked by a script before a launch:
   - the client is present;
   - the model id is in the client's listing;
   - the limit is not exhausted, where readable. An unreadable limit counts as available;
     exhaustion found at run time is QUOTA_EXHAUSTED under PROTO-DEC-0075 item 4;
   - a rung the ladder marks "on approval" is available only for a task the owner approved, and
     the approval is recorded with the resolution (PROTO-DEC-0076 item 1).

   An unavailable rung is skipped and the skip is recorded. The owner is not asked about a skip;
   the owner is asked only in the terminal cases of item 5.
```

R2. Replace section 1 item 5 (WAI:40-48) with:

```markdown
5. Selection for a stage, the layer above, in the order of PROTO-DEC-0075 item 9:
   1. the stage's capability floor, by uncertainty and consequence (0075 item 8), maps to the
      highest rung it needs; rungs below it are out;
   2. technical compatibility: rungs failing the stage's context window, modality, tools, route
      capability or language are out (0075 item 8);
   3. independence: the constraints the dispatch file declares (0075 item 13: another model,
      family or provider; no certifying one's own work; not the sole reviewer of one's own
      synthesis) are filters on the primary and the substitutes alike, checked against the
      models recorded for the work the stage judges;
   4. the primary is the lowest remaining rung. Cheaper wins among admissible rungs; the owner's
      order already weighs quality against cost;
   5. substitutes are the next remaining rungs, as many as the dispatch file asks, two by
      default (0075 item 10);
   6. rungs of one group (the owner's "group" of equals) are interchangeable. The tie goes to the
      one with the most headroom when both limits are readable in the same unit, else to the
      rung the owner wrote first in the snapshot;
   7. where the dispatch file declares a step budget, rungs whose estimate exceeds it are out;
   8. terminal cases, settled before the start, never by a silent downgrade:
      - no rung passes 1-3: BLOCKED, and the owner is asked;
      - none of them fits the budget: ASK OWNER or BLOCKED_BUDGET (0075 item 9);
      - fewer substitutes than asked: the shortfall is recorded and the stage starts; when
        recovery needs a substitute that does not exist, the stage is BLOCKED and the owner is
        asked, as for exhausted quota (`OWNER-DECISION-execution-model-2026-09-25.md`, recovery
        rule 4).
```

R3. Replace section 1 item 6 (WAI:49-51) with:

```markdown
6. Recording. The runner writes into its state and its report: the date of the ladder snapshot
   used, the resolved primary and substitutes, the skipped and excluded rungs with their reasons,
   any owner approval, and any shortfall or terminal case. Evidence of the stage names the model
   that actually ran.
```

R4. Replace the first two bullets of section 2 (WAI:57-60) with:

```markdown
- Processes are checked by a script, never by a model: liveness, completion, failures, retries.
- The script accumulates statuses while the chain runs, then hands them over with a report of the
  work done (PROTO-DEC-0076 item 3): per stage, the model, route, tries, state, outputs, usage
  where the client reports it (else why it is missing), and the reasons for any manual acceptance
  as the coordinator recorded them.
- When a stage counts as done, and which recovery transitions are allowed, is set by
  PROTO-DEC-0075 items 2-6 and 11; this file does not restate them. Semantic judgement is a
  reviewer stage (item 12), not the script's.
```

R5. Replace the source cells of three rows in the section 3 table:

```markdown
| AVAILABLE and WORKING are separate, and the user sees both | 0076 item 2 (the layer between the table of available models and the choice of executors); sections 1.1-1.2 |
| AVAILABLE -> WORKING is a separate qualification step, and it is tech debt | 0076 item 2 (TD-MODEL-QUALIFICATION); section 6 |
| Explicit owner override, recorded as such | section 1.2 (a model named for one task); 0076 item 1 (the approval-gated rung); 0075 item 10 (the resolution and its reasons go into Evidence) |
```

R6. Replace H-WAI-6 (WAI:94-95) with:

```markdown
- H-WAI-6: functional categories of the working pool (senior, worker, reviewer, verifier, and so
  on) add value over one ordered ladder. The role semantics and the escalation chain are decided
  (PROTO-DEC-0074 item 4); only a categorised pool, as against one ladder, is open.
```

R7. Replace section 5 (WAI:107-108) with:

```markdown
- The runner does not yet read the ladder: its dispatch file names models. That is a transitional
  breach of 0074 item 2, and it closes when the resolver of section 1.5 is scripted (BACKLOG C-3).
- The runner implements only part of PROTO-DEC-0075: resume-first, error classes, the hard ceiling
  and launch-input pinning are missing (BACKLOG M-4). Section 2 describes the target.
```

R8. In section 6, replace the bullet "stale-data handling;" (WAI:119) with the first block below,
and append the second block after WAI:122:

```markdown
  - stale-data handling, starting with the ladder snapshot in `MODEL-ECONOMICS.md`, which today
    only a newer owner snapshot replaces (section 1.7);
```

```markdown
- Tracked as BACKLOG C-5. Its parts overlap H-WAI-2..5, which are frozen (PROTO-DEC-0076 item 4),
  so it is not worked while that freeze stands.
```

## 3. Backlog delta

`docs/ops/BACKLOG.md` (under the lock rules of the file's owner session):

- S-4 (new, Simple): run-chain records a manual step's wall time as `-29839289` and its model as
  the launch's name ("DeepSeek V4.1"), while the step ran on `deepseek/deepseek-flash`
  (`USAGE.md:9`; `critique.md:4,92`). Source: workflowAI review cycle. Open.
- M-6 (changed): "`workflowAI.md` findings: synthesis done
  (`docs/research/2026-09-25-workflowai-review/synthesis.md`); R1-R8 to apply between rounds after
  the owner answers Q1-Q4. Source: this cycle. Open."
- C-5 (new, Complex non-blocking): TD-MODEL-QUALIFICATION (PROTO-DEC-0076 item 2; `workflowAI.md`
  section 6). Parts overlap H-WAI-2..5 (frozen) and C-3. Closure criteria: owner, when the freeze
  lifts. State: recorded, not worked.
- C-6 (new, Complex non-blocking): the group tie-break of `workflowAI.md` 1.5 (D3). Owner decides
  Q2. Source: this cycle.

`docs/ops/PROBLEMS.md`: no change. No finding stops a named piece of work (D1 reasoning).

## 4. Owner questions

- Q1: does "Скрипт лишь копит статусы" (0076 item 3) exclude the supervisor's recovery of 0075
  items 2-4 and 11? R4 cites both and decides neither; if "лишь" excludes recovery, drop R4's
  last bullet and record a superseding block.
- Q2: the group tie-break of R2 step 6: headroom in one unit, else the owner's written order. Or
  another rule?
- Q3: a substitute shortfall: start and record it (synthesis), or ask the owner at launch for
  high-criticality stages (critique)?
- Q4: DeepSeek V4.1 Max: approval for every resolver pick (R1, since a script cannot tell a long
  task), or only for long tasks, as 0076 item 1 reads?
- Q5: the critique ran on `deepseek/deepseek-flash`, outside the ladder (`MODEL-ECONOMICS.md:28-44`).
  Is the owner-run step the owner naming it for one task (section 1.2)? Its findings were
  re-verified here, so the synthesis does not depend on the answer.

Synthesis verdict: APPLY WITH OWNER QUESTIONS
