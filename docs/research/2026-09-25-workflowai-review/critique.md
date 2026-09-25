# Critique of the two positions and the subject

- Frame: `task:wai-critique`. Mode: ADVISORY (COMMON.md).
- Reviewer: `deepseek/deepseek-flash`, owner-run Kilo chat, effort unknown (the launch names "DeepSeek V4.1"; see Run note).
- Baseline: `cdf4864308ec19da8ab90e553edb884f6de0b77f`; tracked tree unchanged; `positions/A.md`, `positions/B.md`, `USAGE.md` are untracked step outputs read from the working tree.
- Method: every claim re-read against `workflowAI.md`, PROTO-DEC-0073..0076, `MODEL-ECONOMICS.md` and the ops files at that baseline.

## 1. Position A: per-finding verdicts

1. No terminal state when no rung meets the floor - **CONFIRMED as a gap; the "0075 item 9 violation" framing is WRONG; class OVERSTATED**.
   FACT: `workflowAI.md:39` skips unavailable rungs; `:43-44` demands the primary be at or above the floor; no case exists when no rung qualifies. The gap is real.
   WRONG part: in the ordinary skip case "the owner is not asked" does not violate PROTO-DEC-0075 item 9, which speaks of "no model at or above the floor fits the budget" (`.ai/DECISIONS.md:3121-3128`). The conflict holds only in the terminal case.
   Triage: `blocking` (`A.md:62-65`) is unsupported - nothing currently runs the unwritten resolver (`workflowAI.md:107-108`). Correct class **medium**. Fix: "if no rung at or above the floor is available, the stage is BLOCKED before start and the owner is asked".

2. Group tie by headroom - **CONFIRMED; class CONFIRMED (complex-non-blocking)**.
   FACT: headroom units differ by route (rolling window, prepaid balance, monthly allowance, unreadable) - `MODEL-ECONOMICS.md:67-77`, `workflowAI.md:36-38,47-48`; no secondary key when headroom is equal or unreadable. A's fix shape (normalized metric + deterministic secondary key) is correct.

3. Independence applied only to substitutes - **CONFIRMED; class CONFIRMED (medium)**.
   FACT: `workflowAI.md:43-46` filters the primary not at all and substitutes only by "preferring another family"; 0075 item 13 makes the constraint binding once the workflow chooses one (`.ai/DECISIONS.md:3153-3156`). A understates it: see 3.4.

4. H-WAI-6 "already decided" - **OVERSTATED**.
   FACT: 0074 item 4 and 0075 item 10 decide role semantics and the escalation chain (`.ai/DECISIONS.md:3012-3020,3130-3136`); they do not test "functional categories add value over one ordered ladder" (`workflowAI.md:94-95`). Striking it or moving it to Undisputed (`A.md:74-77`) would present a frozen hypothesis as settled (`BACKLOG.md:54-58`). At most a cross-reference note; class simple.

5. Row 2 self-citation - **overstated; reasoning WRONG**.
   FACT: the source cell cites the file itself (`workflowAI.md:70`). But AGENTS.md section 2 is not violated: the row restates the owner-instructed procedure of 0076 item 2 (`.ai/DECISIONS.md:3226-3231`). The nit is class **simple**, not medium; the fix should cite 0076 item 2, not demote the point as A proposes (`A.md:81`).

6. "only accumulates statuses" - **CONFIRMED as an ambiguity; the fix over-resolves**.
   FACT: `workflowAI.md:58` compresses the owner's line in 0076 item 3 (`.ai/DECISIONS.md:3230-3231`); 0075 item 11 assigns the supervisor recovery and transitions (`:3137-3145`). Class simple. But this is a tension between two accepted blocks: COMMON rule 4 says report it, do not resolve it; A's replacement text (`A.md:85`) picks a side. Open question O1.

7. Section 1.3 vs Kilo gateway - **WRONG**.
   FACT: 1.3 already names the exception (`workflowAI.md:32-33`), as does 0076 item 1 (`.ai/DECISIONS.md:3221-3225`); `MODEL-ECONOMICS.md:34` is that exception's route. No conflict exists at `:32-33`; A's fix is unnecessary. The real issue is the untriaged guard (see 3.3).

8. Triage coverage gap in A: three of its own analysis points are never classified - tool/context/budget omission (`A.md:26`), approval-gated rung (`A.md:28`), exhausted or unreadable limits (`A.md:15`). Two are real defects (3.1, 3.3).

## 2. Position B: per-finding verdicts

1. Runner does not read the ladder - **CONFIRMED as the subject's own note, class WRONG** (`B.md:69`): it repeats `workflowAI.md:105-108`, and the fix is the kernel resolver scripting, tracked as C-3 (`BACKLOG.md:50-51`), not a "simple" along-the-way fix.
2. Missing terminal case - **CONFIRMED; class medium** (`B.md:13`), but B also calls the same defect simple (`B.md:70`); resolve to **medium**. The only B triage class I confirm.
3. Group tie "covers the case" - **WRONG** (`B.md:15`): same evidence as A-2; "most headroom" is undefined when units differ or are unreadable.
4. Independence "covers constraints" - **WRONG** (`B.md:17`): 1.5.3 says "preferring", not a constraint, and reaches only substitutes (`workflowAI.md:43-46`; `.ai/DECISIONS.md:3153-3156`).
5. Exhausted limits "covered" - **OVERSTATED** (`B.md:19`): only "where readable" (`workflowAI.md:37`); unreadable limits and the terminal case stay open.
6. "1.5 implements exactly 0075's order; consistent" - **OVERSTATED** (`B.md:29`): item 9's order includes a compatibility gate and a step budget (`.ai/DECISIONS.md:3119-3128`); 1.5 has neither (3.1). Its "conflict summary: none" (`B.md:37`) is not supported.
7. Supervision script resume-first/error taxonomy - **CONFIRMED in substance, misattributed**: it is open item **M-4** (`BACKLOG.md:32-33`), not a defect of section 2, which binds 0075 by reference (`workflowAI.md:16-17`); B itself calls section 2 "fully scriptable" (`B.md:65`), contradicting the defect. Class medium (as M-4).
8. "Section 2 fully scriptable" - **OVERSTATED** (`B.md:63-65`): the accumulate/report sentence is scriptable, but it cannot discharge 0075 item 6's completion contract or item 11's logged transitions (`.ai/DECISIONS.md:3097-3102,3137-3145`); no reference gap is flagged.
9. Section 3 "12 points correctly sourced, no misclassification" - **WRONG count, OVERSTATED sourcing** (`B.md:41,55-57`): the table has 11 rows (`workflowAI.md:69-79`); row 2 cites the file itself (`:70`); H-WAI-6 overlaps 0074 item 4. "Fully correct" is not supported.
10. Evidence hygiene: B's `path:line` refs do not point at the quoted claims - `B.md:25` "workflowAI.md:45-47" (1.4 is `:34-39`), `B.md:27` ":13-15" (1.2 is `:23-25`), `B.md:31` ":19-23,27-29" (1.3 is `:30-33`, section 2 `:55-61`), `B.md:33` ":45-53" (section 2 `:55-61`), `B.md:70` ":51-55" (1.5.2 is `:43-44`). Quotes are accurate; refs are not. Class simple, but a reader cannot verify B from its citations.

## 3. What both positions missed

### 3.1 Selection omits 0075 item 9's compatibility and budget gates - **medium**
FACT: item 9's order is floor -> technical compatibility -> quality/reliability/availability/latency/cost -> step budget, with ASK OWNER or BLOCKED_BUDGET before start and no silent downgrade (`.ai/DECISIONS.md:3121-3128`); context, modality and tools are hard constraints (`:3119-3120`). Section 1.5 has no compatibility step and no budget step; "Cheaper wins" (`workflowAI.md:44`) is a price preference, not a budget check; no budget-failure terminal exists.
A saw the omission once, untriaged (`A.md:26`); B judged 1.5 consistent (`B.md:29`).
Fix: add "exclude rungs that fail the stage's tool/context/modality constraints; compare the rest with the step budget; on no fit, ASK OWNER or BLOCKED_BUDGET before start" to 1.5.

### 3.2 Fewer than two admissible substitutes - **medium**
FACT: 1.5.3 returns "the next available admissible rungs" (`workflowAI.md:45-46`); nothing defines a one- or zero-substitute outcome, while 0074 item 3 and 0075 item 3 fix the primary + two substitutes shape (`.ai/DECISIONS.md:3011,3079-3082`).
Fix: define per criticality - record the shortfall and continue, or ASK OWNER for high-criticality stages.

### 3.3 The approval-gated rung is selectable automatically - **medium**
FACT: rung 5 DeepSeek V4.1 Max is "on approval" (`MODEL-ECONOMICS.md:34`); 1.4's checks (client, id, readable limit) carry no approval state, and 1.5.4's headroom tie can pick it (`workflowAI.md:34-38,47-48`); 0076 item 1 requires the owner's approval before long tasks (`.ai/DECISIONS.md:3221-3225`).
A stated it untriaged (`A.md:28`); B missed it.
Fix: 1.4 maps "on approval" to not available; 1.5 admits the rung only with a recorded owner approval.

### 3.4 Independence has four forms; 1.5.3 uses one - **medium**
FACT: 0075 item 13 allows a different model, family or provider, no self-certification, and not being sole reviewer of one's own synthesis (`.ai/DECISIONS.md:3153-3156`); 1.5.3 expresses only "another family", only for substitutes, only as a preference.
Fix: make the stage's declared constraints (`:3130-3136`) filters over primary and substitutes alike.

### 3.5 Section 5 under-reports the supervision breach - **simple**
FACT: section 5 records only the resolver breach (`workflowAI.md:105-108`), while section 4 names run-chain as the current supervisor (`:102-103`) and M-4 records its missing resume-first, error classes, hard ceiling and pinning (`BACKLOG.md:32-33`).
Fix: add the M-4 sentence (or its id) to section 5.

### 3.6 The report promises "usage" unconditionally - **simple**
FACT: every stage report carries "usage" (`workflowAI.md:57-60`), but a client may print none (`USAGE.md:4`: "A blank figure means the client printed none").
Fix: "usage where the client reports it, else the reason it is unavailable".

### 3.7 Tech-debt boundary: TD-MODEL-QUALIFICATION is untracked - **medium**
FACT: 0076 item 2 declares the qualification procedure debt (`.ai/DECISIONS.md:3226-3229`); section 6 lists its missing parts under that label (`workflowAI.md:110-122`); no BACKLOG or PROBLEMS entry names the TD, so it has no id, closure owner or acceptance criteria (`BACKLOG.md:14-58`; `PROBLEMS.md:1-36`). Its parts overlap M-4/M-5/C-3 with no mapping, and section 6's "until closed" names no closure condition.
Fix: add a backlog line `TD-MODEL-QUALIFICATION` with owner, closure criteria and links to M-4/M-5/C-3.

### 3.8 Tech-debt boundary: "stale-data handling" names no artifact - **simple**
FACT: 1.1 handles a stale lower layer via client listings (`workflowAI.md:23-25`) and 1.4 re-checks limits; no freshness rule exists for the ladder snapshot itself, while section 6 defers "stale-data handling" (`:118-119`) without naming the artifact; `MODEL-ECONOMICS.md:9-13` has only an update rule.
Fix: name the ladder snapshot in that TD item and state its freshness rule (snapshot date carried into the launch record; re-taken at the owner's next snapshot).

## Open questions

- O1: 0076 item 3 ("the script accumulates statuses") vs 0075 item 11 (supervisor recovery and transitions): which governs section 2's wording? Reported, not resolved.
- O2: DeepSeek Max - exclude it from the resolver entirely, or admit it only with a per-task recorded approval (3.3)?
- O3: Should TD-MODEL-QUALIFICATION become a backlog item with closure criteria, or stay inside M-6/C-3 (3.7)?

## Run note

- OPEN QUESTION: the launch names "DeepSeek V4.1 (owner-run, Kilo chat)"; this session reports the model `deepseek/deepseek-flash` (effort unknown). The record should name what actually ran (COMMON rule 1); the journal records the difference.

Triage bottom line: none of the findings above is blocking - nothing stops a named piece of current work, so no `PROBLEMS.md` entry is required by PROTO-DEC-0076 item 5.

Critic verdict: RECOMMENDATION - A-1, A-3, A-6 and B-2, B-7 hold with corrected classes; A-4, A-5, A-7 and B-3..B-6, B-8, B-9 misstate the subject; B's citations and its medium/simple classes disagree with themselves; and both leave the item 9 gates, the substitute shortfall, the approval gate and the untracked TD outside the triage. Synthesize from the corrected finding set above, not from the raw positions.
