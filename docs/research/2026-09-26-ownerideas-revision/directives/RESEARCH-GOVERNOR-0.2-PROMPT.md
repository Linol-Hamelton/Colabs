# Owner directive - RESEARCH-GOVERNOR 0.2 as a general rule of the Colabs source repository

To: the program operator (`kilo-f22faac486b5e567`, or the session the owner hands this to). You
transcribe, edit the listed files, run the checks and dispatch one review. You decide nothing and
certify nothing.

Authority: the owner confirmed on 2026-09-26, "Согласен по обоим пуектам":
(1) the governor becomes a general rule for every frame of the Colabs source repository, in trial,
not installed into host projects;
(2) the operator transcribes it.
He hands you this prompt himself. That is a direct owner confirmation in the sense of AGENTS.md
section 2. The text was drafted in the advisory session `claude-b00262b88c55444b`, which wrote
nothing to the repository.

Provenance line for the block:
`Approved by: RuslanFomenko (direct owner confirmation, 2026-09-26: "Согласен по обоим пуектам" - general rule for the source repository without hosts, transcribed by the operator; decision text drafted by claude-b00262b88c55444b; transcribed by <your session>)`

Current state you are correcting: PROTO-DEC-0082 and `docs/core-arch/stage-1/P-L0-008-research-governor.md`
0.1 (commit f965cde). Defects of 0.1 that this directive removes:
- **D-a. Scope.** It covers only the OwnerIdeas program.
- **D-b. Contradiction.** 0082 says the rule applies from adoption; P-L0-008:27 says "Not binding
  until the trial review".
- **D-c. Wrong kill criterion.** "A stream holds more than 1 major + 1 minor ACTIVE across two
  gates" is a breach of the governor, not evidence that the governor harms.
- **D-d. Rule ids.** R-L0-22..R-L0-36 are used as root ids that `L0-ROOT.md` does not define.
  `procedure.schema.md` section 3 requires sub-rules `R-L0-<nn>.<k>` of a root rule.
- **D-e. Missing headings.** The required `## Risks` and `## Change log` headings are absent;
  "Evolution log:" is not a heading.
- **D-f. Front-matter values outside the schema.**
  - `inputs`/`outputs` contain `DECISIONS`, `frame-verdict`, `DEC-block` and `backlog-item`. Only
    the ids of schema section 2.1 or repo paths are allowed.
  - `until=3-5 closed frames` is not a date or a batch id.
- **D-g. Metric not defined.** M-010 is not in the metric inventory (`docs/core-arch/CORE-ARCH-6.md`
  section 6). The CA-41 rule requires a record that defines a metric to count it there.
- **D-h. Unstated reasons.** 0082 records "Reasoning: not stated".

## 0. Before you start

1. Read AGENTS.md, `.ai/TASK.md`, PROTO-DEC-0052 and 0079-0082, `procedure.schema.md` sections 2-3,
   `P-L0-001-procedure-lifecycle.md` and the current P-L0-008.
2. Run `git status --short --branch`. Do not touch the running OwnerIdeas slots (the Gemini
   cleanup, the DeepSeek plan) or their files.
3. Journal line first (P-L0-001 step 1): `Intake: owner directive PROTO-DEC-0083 -> change P-L0-008 (class D)`.
4. `node .ai/bin/protocol-lock.cjs acquire --owner <your session>`. If another owner holds the
   lock, stop and report; never steal it.

## 1. Owner decisions (transcribe as PROTO-DEC-0083)

Check that 0083 is the next free number. If it is taken, use the next one and change every
reference in this prompt accordingly.

Append this block verbatim to `.ai/DECISIONS.md`, using the format of 0082:

```
### PROTO-DEC-0083

Status: Accepted
Date: 2026-09-26
Reopen-trigger: owner-directive
Refines: PROTO-DEC-0082 (scope and text); PROTO-DEC-0052 item 1

Context:
PROTO-DEC-0082 adopted the research governor as a trial for the OwnerIdeas revision program only,
as P-L0-008 0.1. Review of 0.1 found a program-only scope, a contradiction on whether it binds, a
kill criterion that measures a breach instead of harm, rule ids and headings outside
procedure.schema.md, and an undefined metric M-010. Two external critiques proposed four edits.
The owner chose a general rule for the source repository.

Decision:
1. P-L0-008 0.2 (research governor) binds every frame of the Colabs source repository
   (protocol-manifest role source) from this block. Its status stays trial: the text may change at
   the trial review, and it is not optional before then. It is not installed into host projects;
   extending it there needs a later owner decision after the trial.
2. A frame is defined by function, not by name: bounded work whose main purpose is to reduce
   uncertainty, compare alternatives, produce a recommendation, or form or change a decision, an
   architecture or a plan. The stages of one program form one frame. A plan that implements
   accepted items is preparation, not a frame, unless it reopens architecture. It is critiqued once.
3. Kernel-completion mode parameters:
   - streams S1 kernel, runtime and routes; S2 model and task routing; S3 product pilots;
   - per stream at most 1 major + 1 minor ACTIVE, and at most 1 SUSPENDED major;
   - SUSPENDED after 24 h BLOCKED or waiting for a gate;
   - at most two reasoning rounds, a third only by owner decision, no fourth;
   - the trial ends at the fifth frame closed under P-L0-008.
   The DEFER backlog cap is set by the owner after the OwnerIdeas cleanup. These parameters stay
   until the owner records steady-state parameters.
4. Edits to 0.1:
   - "within a small budget" is removed from the minor test;
   - a separate frame threshold parameter is not used;
   - an ACCEPT item moved to DEFER (owner decision only) leaves DIG and is counted as
     DEFERRED_ACCEPTED beside DIG until it is implemented or its decision is cancelled;
   - the trial kill criterion is: in two independent cases the governor itself blocks a work
     stream for more than 24 h with no related technical or external blocker. A limit breach is a
     recorded bypass incident, not a kill criterion.
5. Every frame has one row in docs/research/FRAMES.md, edited under the shared-document lock. A
   frame without a row is not open. On adoption, every open frame receives at a transition gate
   either "continues to round X" with its stream and size, or a verdict.
6. Leaving kernel-completion mode requires the Kernel v1 completion contract in P-L0-008. The
   Kernel v1 scope is set by a separate owner decision. There is no universal latency threshold:
   each hot path has its own latency budget, and performance beyond those budgets does not block
   completion.
7. Enforcement during the trial is by hand, by the operator at every gate. After the trial is
   accepted, the mechanisable checks of P-L0-008 go into the Node validator (PROTO-DEC-0077, A-4),
   WARN first. AGENTS.md, .ai/docs, templates, the installer and .ai/bin are not changed by this
   block.

Reasoning:
Research frames multiplied faster than decisions were built: twelve research directories in seven
days, and the OwnerIdeas revision found the kernel decided far more than it built and proposed
seven new research candidates. A rule scoped to one program lapses when that program closes, and
it would leave two research regimes beside PROTO-DEC-0052. A functional frame definition closes
the renaming loophole. The DEFERRED_ACCEPTED counter keeps DIG honest. A kill criterion must
measure harm caused by the governor. Manual enforcement during the trial avoids a high-risk kernel
change while the validator migrates to Node.

Alternatives rejected:
Scope limited to the OwnerIdeas program; installation into host projects now; a pointer in
AGENTS.md now; validator checks in PowerShell now; a further research round on the governor itself.

Consequences:
P-L0-008 is rewritten as 0.2. L0-ROOT gains root rule R-L0-22. CORE-ARCH-6 defines M-010.
S1-SUMMARY lists P-L0-008. docs/research/FRAMES.md is created with the transition inventory. The
trial review follows the fifth closed frame. PROTO-DEC-0082 stands as refined; this block
supersedes nothing.

Approved by: <provenance line from the header of this prompt>
```

## 2. Files to change (exactly these)

1. `.ai/DECISIONS.md`: append PROTO-DEC-0083 (section 1). Never edit 0082 or any other block.
2. `docs/core-arch/stage-1/P-L0-008-research-governor.md`: replace the whole file with Appendix A.
   Fill `<operator session>` and leave `<reviewer>`/`<verdict>` until step 5.
3. `docs/core-arch/stage-1/L0-ROOT.md`:
   - After `R-L0-21` (same section, same style), add:
     `R-L0-22. Research converges: every frame ends in ACCEPT, REJECT, EXPERIMENT or DEFER within bounded rounds and per-stream limits, and new research is never a frame's output (P-L0-008). Why: research frames multiplied faster than decisions were built (PROTO-DEC-0082, 0083).`
   - In "Where to go next", after "Comparative tests: P-L0-007.", add: `Research frames: P-L0-008.`
   - In "Evidence", after the R-L0-20/21 entry, add: `R-L0-22: PROTO-DEC-0082, 0083.`
   - In front matter `evidence`, append `PROTO-DEC-0082, PROTO-DEC-0083`.
   - Set `version: 0.5`.
   - Append the change-log line:
     `- 0.5 — 2026-09-26 — <operator session> (transcription; text by claude-b00262b88c55444b) — R-L0-22 anchors P-L0-008 (PROTO-DEC-0083) — reviewer <reviewer>: <verdict>.`
4. `docs/core-arch/CORE-ARCH-6.md`, section 6 table:
   - After the M-008 row, add:
     `| M-010 | Рамки с записанным вердиктом против открытых, по потокам; случаи обхода; блокировки потока самой уздечкой дольше 24 ч; DIG, DIG_FLOOR, DEFERRED_ACCEPTED; RER вместе с ростом backlog | docs/research/FRAMES.md, DECISIONS, журналы | жива ли P-L0-008 (её `trial`); режим «сначала реализовать» |`
   - Change every inventory mention `M-001..M-009` to `M-001..M-010`: lines 16, 158 and 171,
     exactly as the CA-41 fix did for M-009. Verify with grep that no `M-001..M-009` remains.
5. `docs/core-arch/stage-1/S1-SUMMARY.md`:
   - In the L0-ROOT row, change `0.4` and `21 правило` to `0.5` and `22 правила`.
   - After the P-L0-007 row, add:
     `| \`P-L0-008\` | 0.2 | уздечка исследований: каждая рамка заканчивается решением; потоки, лимиты, вердикты, DIG (PROTO-DEC-0082, 0083) |`
6. `docs/research/FRAMES.md`: create it from Appendix B after the transition gate (section 3).
7. `.ai/TASK.md` (80 lines, which is the limit): state that research frames follow P-L0-008
   (PROTO-DEC-0083) with the registry at docs/research/FRAMES.md. Merge this into the existing
   OwnerIdeas note line so the file stays at 80 lines or fewer, and drop no other information.
8. `docs/decisions/REGISTRY.md`, after the decisions commit, following the 0079-0082 precedent,
   append:
   - `| PROTO-DEC-0083 | accepted | owner-directive | <sha> | none | Research governor P-L0-008 0.2 binds every frame of the source repository (no hosts; trial to the fifth closed frame); functional frame; kernel-completion parameters; DEFERRED_ACCEPTED; kill criterion; FRAMES.md registry; Kernel v1 contract |`
   - `| PROTO-DEC-0082 | accepted | owner-directive | <sha> | none | Refined by PROTO-DEC-0083: scope widened from the OwnerIdeas program to every frame of the source repository; text replaced by P-L0-008 0.2 |`
   - `| PROTO-DEC-0052 | accepted | owner-directive | <sha> | none | Item 1 further refined by PROTO-DEC-0083: P-L0-008 0.2 governs every research frame of the source repository from 2026-09-26 |`
9. References:
   - `git grep -nE "R-L0-(2[2-9]|3[0-6])\b"`.
   - Repoint every mention of an old 0.1 id outside historical records (journals, ARCHIVE,
     reviews, DECISIONS) to its 0.2 sub-rule, using the map in Appendix A's change log.
   - Historical records are not edited.

Do NOT touch: AGENTS.md, CLAUDE.md, `.ai/docs/`, `templates/`, the installer,
`protocol-manifest.json`, `.ai/bin/`, `validate-protocol.ps1`, `tests/`, any host project, or any
existing DECISIONS block.

## 3. Transition gate (owner)

Before you write FRAMES.md, show the owner the proposed inventory in Appendix B and ask for
"confirm" or corrections.
- For each legacy directory marked "operator determines", open its README/INDEX and final output,
  then propose a verdict with a `path:line` or decision id.
- Record the owner's answers verbatim in your journal.
- Rows the owner has not confirmed in this session get status `TRANSITION-PENDING`. They count as
  ACTIVE for the limits until confirmed.
- After the table is filled, check the limits: per stream, ACTIVE majors ≤ 1, ACTIVE minors ≤ 1,
  SUSPENDED majors ≤ 1. Report any breach to the owner; do not resolve it yourself.

## 4. Checks and commit

1. Verify the P-L0-008 front matter and the eight headings in order against
   `procedure.schema.md` sections 2-3.
2. Check that every rule line is `R-L0-22.<k>. <sentence>` and that ids are unique repository-wide
   (LCC-1).
3. `powershell -ExecutionPolicy Bypass -File .\validate-protocol.ps1` must show 0 errors. Report
   warnings verbatim. Check UTF-8 without BOM, LF.
4. `node .ai/bin/protocol-lock.cjs release --owner <your session>`.
5. Commit per the owner's standing instruction for this program. One commit for sections 1-2.1..7
   and FRAMES.md, then one for REGISTRY with the first SHA, following the f965cde/582349b
   precedent. Messages end with the attribution your client requires.
6. `node .ai/bin/protocol-handoff.cjs record --owner <your session>`, then a five-label journal
   entry.

## 5. Independent review (PROTO-DEC-0038 item 2; P-L0-001 steps 7-8)

- **Reviewer:** Mistral Medium 3.5 via vibe, unless the owner names another. Never a Claude-family
  or DeepSeek-family model: they drafted and transcribed this text (R-L0-17.6, R-L1-002.1).
- **Output:** `docs/reviews/2026-09-26-<reviewer>-p-l0-008-0.2-review.md`, with the AGENTS.md
  section 5 item 4 header, at most 250 lines, and a verdict of PASS, RECOMMENDATION or FAIL.
  Every FAIL claim carries a reproduction.
- **The reviewer checks:**
  1. schema compliance;
  2. internal contradictions;
  3. consistency with PROTO-DEC-0052, 0079-0083 and AGENTS.md sections 2 and 6;
  4. the loopholes: renaming, DEFER and SUSPENDED as graveyards, self-classification of blockers,
     owner override, gaming of DIG and RER, stages versus frames, stream creation;
  5. whether any rule creates work without a decision it serves.
- **On PASS or RECOMMENDATION:** fill `<reviewer>`/`<verdict>` in both change logs (P-L0-008,
  L0-ROOT) and commit.
- **On FAIL:** the owner decides. Nothing is rewritten on the reviewer's word alone.

## 6. Report to the owner (in chat, short)

- the commits;
- the validator result verbatim;
- the transition table as confirmed, and any rows still TRANSITION-PENDING;
- any limit breach;
- the review verdict or its status;
- anything you could not do, with the reason.

---

## Appendix A - full text of P-L0-008 0.2 (replace the file with this)

```markdown
---
id: P-L0-008
version: 0.2
title: Research governor - every frame ends in a decision; new research is not an output
layer: L0
type: procedure
status: trial
roles: [all]
stages: [any]
triggers: [frame-open, frame-round, frame-gate, frame-close, owner-directive]
inputs: [journal, decisions-index, docs/research/FRAMES.md, .ai/DECISIONS.md]
outputs: [docs/research/FRAMES.md, .ai/DECISIONS.md, docs/ops/BACKLOG.md, journal, signals]
back_edges: [3>2/1/owner]
enforcement: P
script_candidate: no:1
evidence_class: [B, D]
evidence: [PROTO-DEC-0052, PROTO-DEC-0082, PROTO-DEC-0083, docs/research/2026-09-26-ownerideas-revision/round3/RESOLUTION-CLAUDE.md]
cost_basis: unknown
trial: metric=M-010; kill=in two independent cases the governor itself blocks a work stream for more than 24 h with no related technical or external blocker; until=frames-5
decision: [PROTO-DEC-0082, PROTO-DEC-0083]
---

# P-L0-008 Research governor

Trial 0.2 of CORE-ARCH stage 1, anchored by R-L0-22. Binding for every frame of the Colabs source
repository from PROTO-DEC-0083. `status: trial` means the text may change at the trial review; it is
not optional before then. Not installed into host projects. `until=frames-5` is the batch of the
first five frames closed under this procedure, counted in `docs/research/FRAMES.md`.

## Purpose

Research exists to close a decision; new research is not a research output. Without a bound, frames
multiplied faster than decisions were built. This procedure makes every frame end in ACCEPT, REJECT,
EXPERIMENT or DEFER, within bounded rounds and per-stream limits, and keeps the backlog, the
suspended frames and the accepted-but-unbuilt decisions visible and capped.

## Rules

R-L0-22.1. This procedure binds every frame of the Colabs source repository from PROTO-DEC-0083, and its trial status means its text may change at the trial review, not that it is optional.

R-L0-22.2. It does not apply to installed host projects until an owner decision extends it after the trial.

R-L0-22.3. A frame is bounded work whose main purpose is to reduce uncertainty, compare alternatives, produce a recommendation, or form or change a decision, an architecture or a plan, whatever its name.

R-L0-22.4. Fact-gathering and measurement that recommend nothing, implementation of an accepted decision, testing of a defined implementation, and review or certification of a frozen artifact are not frames.

R-L0-22.5. A review or certification that widens scope or designs something new opens a separate frame for that new part.

R-L0-22.6. All stages of one program, meaning one owner dispatch, form one frame.

R-L0-22.7. After ACCEPT, a plan that implements the accepted items is preparation and not a frame unless it reopens architecture, and it is critiqued once.

R-L0-22.8. A frame is minor only when it has one question, one executor, one reasoning round, no kernel-architecture change and no new permanent mechanism; every other frame is major.

R-L0-22.9. The streams are fixed by the owner: S1 kernel, runtime and routes; S2 model and task routing (schemas, profiles, calibration); S3 product pilots.

R-L0-22.10. Every frame belongs to exactly one stream, named at admission.

R-L0-22.11. A new stream needs an owner decision naming the stream it closes, merges or pauses, and a stream is never created to escape a limit.

R-L0-22.12. Every frame has one row in `docs/research/FRAMES.md`, edited only under the shared-document lock of AGENTS.md section 6, and a frame without a row is not open.

R-L0-22.13. A frame opens only when its README states the decision that depends on it, its one primary question, the alternatives, its budget (participants, rounds, deadline) and its exit condition.

R-L0-22.14. An item whose five admission fields cannot be stated goes to implementation, EXPERIMENT or DEFER, never to research.

R-L0-22.15. A frame ends only in ACCEPT, REJECT, EXPERIMENT or DEFER, and "more research is needed" is not a verdict.

R-L0-22.16. ACCEPT records an approved DEC block and a linked implementation task, and the frame's source material leaves the active corpus once canonicalized.

R-L0-22.17. REJECT records a tombstone with the decision and its main evidence, and the idea reopens only through a trigger row of AGENTS.md section 6.

R-L0-22.18. EXPERIMENT records, before it starts, the hypothesis, baseline, measured variable, success and failure thresholds, budget and deadline, and it holds a slot until it ends.

R-L0-22.19. An experiment ends in KEEP, which proceeds to a DEC block, implementation and CLOSED, or in ROLLBACK, which proceeds to CLOSED.

R-L0-22.20. DEFER records a summary, the reason, a reopen trigger and the canonical source, and the item stays out of agent context until reopened.

R-L0-22.21. A frame runs at most two reasoning rounds and then goes to its gate.

R-L0-22.22. A third round needs an owner decision that states the open blocking question, why two rounds could not answer it, how its answer could change the decision, its scope and its budget.

R-L0-22.23. There is no fourth round, and experiment iterations are bounded by the experiment's budget, not by rounds.

R-L0-22.24. A stream holds at most one major and one minor frame ACTIVE, and an experiment or a BLOCKED frame counts as ACTIVE.

R-L0-22.25. An owner override of a limit is recorded together with the frame it pauses.

R-L0-22.26. A frame BLOCKED or waiting for its gate for more than 24 hours becomes SUSPENDED and frees its slot.

R-L0-22.27. A SUSPENDED frame records its reason, resume condition, responsible party and next review date.

R-L0-22.28. A stream holds at most one SUSPENDED major frame, and beyond that a frame is closed, merged, deferred or replaced before another is suspended.

R-L0-22.29. The DEFER backlog has a cap set by the owner after the OwnerIdeas cleanup, and at the cap no new DEFER is recorded until items are merged, removed, closed or returned to work.

R-L0-22.30. Findings made in a frame are BLOCKING, RELATED or FUTURE, and the gate owner, not the author, assigns the class.

R-L0-22.31. Only BLOCKING findings widen the current frame, and RELATED and FUTURE findings go to the backlog as candidates.

R-L0-22.32. No child frame opens while its parent frame is open.

R-L0-22.33. A P0/P1, security, data-loss or missing-mandatory-capability finding is never DEFERred without an owner decision, and its author never classifies it.

R-L0-22.34. The owner decides every gate, and a low-risk gate may be delegated under PROTO-DEC-0062 item 3 and PROTO-DEC-0078.

R-L0-22.35. A delegate never closes a frame it created or authored (PROTO-DEC-0057).

R-L0-22.36. A frame goes to its gate when its last round added no decision-relevant evidence, or when an implementation, test or experiment answers faster, or when the chosen option is reversible and its rollback is shown, or when the open issue is optimization rather than correctness.

R-L0-22.37. Agreement between models is evidence of robust reasoning, not of truth, and a well-supported minority finding outweighs a weak consensus.

R-L0-22.38. A new proposal that adds a layer, mandatory procedure, permanent role, state machine, store or scoring model shows why the simpler option fails its acceptance criteria.

R-L0-22.39. R-L0-22.38 does not apply to accepted decisions, which reopen only through the triggers of AGENTS.md section 6.

R-L0-22.40. Full pre-registration and holdout apply only to kernel, certification and protected-path experiments, and other experiments state hypothesis, threshold and budget.

R-L0-22.41. DIG counts accepted items not yet implemented, and an item is implemented only when its maturity chain reaches test and end-to-end use.

R-L0-22.42. Moving an item from ACCEPT to DEFER needs an owner decision, removes it from DIG and adds it to DEFERRED_ACCEPTED, which is reported beside DIG until the item is implemented or its decision is cancelled.

R-L0-22.43. While DIG exceeds DIG_FLOOR no optional frame opens, and P0/P1, security and data-loss work still proceed.

R-L0-22.44. When DIG reaches a new minimum that value becomes DIG_FLOOR, and only an owner decision raises the floor.

R-L0-22.45. The DIG ratchet is inactive until a status ledger exists, and the first baseline count is the first task of the OwnerIdeas plan.

R-L0-22.46. RER, new questions opened over questions closed, is reported together with backlog growth at every gate.

R-L0-22.47. Text from outside the repository enters only as advisory input.

R-L0-22.48. An empty citation marker is replaced by a verified source with an address and a date, or removed together with the claim it supported.

R-L0-22.49. On adoption every open frame receives at a transition gate either "continues to round X" with its stream and size, or a verdict.

R-L0-22.50. The trial ends at the fifth frame closed under this procedure, followed by one operational review by a reviewer who neither drafted nor operates it, answering whether it obstructed work, was bypassed, created false bureaucracy, and reduced branches and DIG.

R-L0-22.51. A breach of a limit is recorded as a bypass incident in `docs/research/FRAMES.md` and counted in M-010, and it is not a kill criterion.

R-L0-22.52. These are the kernel-completion mode parameters, and they stay in force until the owner records steady-state parameters.

R-L0-22.53. Kernel-completion mode ends only when the Kernel v1 completion contract holds: the owner-approved Kernel v1 scope has canonical implementations; DIG within that scope is zero or its remainder is DEFERred by the owner; no P0, P1, security, data-loss or architectural-impossibility finding is open; the task lifecycle passes end to end for success, recoverable failure with retry or repair, and blocked-with-escalation; the mandatory validators and tests pass; documentation matches the implementation; no decision has two active sources of truth; every kernel frame has a verdict; and the navigation shows the kernel state and its open items unambiguously.

R-L0-22.54. The Kernel v1 scope is set by a separate owner decision, and performance blocks completion only where a hot path exceeds its own latency budget.

## Steps

Actor slots are defined in L1: `author` (frame author), `coordinator` (operator), `owner`, `reviewer`.

1. **Admission** (author, coordinator). Input: the proposed frame. The author writes the five
   admission fields in the frame README, with its stream and size (R-L0-22.8-22.14). The
   coordinator checks the stream limits and, for an optional frame, the DIG ratchet
   (R-L0-22.24, R-L0-22.43). Output: a FRAMES.md row, ACTIVE or CANDIDATE.
2. **Rounds** (author and participants). Input: the admitted frame. At most two reasoning rounds
   (R-L0-22.21). Findings are recorded without a class. Output: round artifacts and a candidate
   verdict.
3. **Gate** (owner or delegate). Input: the round artifacts. Classify findings (R-L0-22.30-22.33).
   Choose one verdict with its fields (R-L0-22.15-22.20), or grant one third round
   (R-L0-22.22; back edge 3>2). Output: the verdict, transcribed as a DEC block, tombstone,
   experiment record or DEFER entry, and the FRAMES.md row updated.
4. **Suspension** (coordinator). Input: a frame BLOCKED or at its gate for more than 24 h. Set it
   SUSPENDED with reason, resume condition, responsible party and review date
   (R-L0-22.26-22.28). Output: the updated row.
5. **Counters** (coordinator, at every gate). Update DIG, DIG_FLOOR, DEFERRED_ACCEPTED, the DEFER
   backlog size, RER and the closed-frame count in FRAMES.md (R-L0-22.41-22.46). Record every
   limit breach as a bypass incident (R-L0-22.51). Output: the counters block.
6. **Trial review** (reviewer named by the owner). Input: frames-5 reached and M-010. One short
   review file answers the four questions of R-L0-22.50. Output: accept, revise or retire,
   decided by the owner.

## Stop conditions

- The five admission fields cannot be stated: no frame; the item goes to implementation,
  EXPERIMENT or DEFER (R-L0-22.14).
- The stream limit is reached, or DIG exceeds DIG_FLOOR for an optional frame: the item stays
  CANDIDATE.
- A third round is requested: owner decision (R-L0-22.22), otherwise the gate closes the frame.
- A finding is P0/P1, security or data loss: the owner classifies it (R-L0-22.33).
- No rule covers the case: P-L0-002. Two sources conflict: P-L0-003.

## Back edges

- `3>2/1/owner`: from the gate back to the rounds, once, only by an owner decision with the five
  justifications of R-L0-22.22. There is no second use; the exit is the owner's verdict.

## Evidence

- [B] `docs/research/2026-09-26-ownerideas-revision/round3/RESOLUTION-CLAUDE.md` sections 1 and 7:
  the kernel decided far more than it built, and the revision produced seven research candidates.
  `docs/research/` gained twelve frame directories between 2026-09-20 and 2026-09-26. Cost:
  unknown (owner time and model runs not measured).
- [D] PROTO-DEC-0052 item 1 (old: up to three rounds, no terminal verdict, no concurrency limit,
  no registry). This version adds terminal verdicts, per-stream limits, a registry and the DIG
  ratchet. The old rule allowed unlimited parallel frames and treated research as an outcome.
- Decisions: PROTO-DEC-0082 (trial adoption), PROTO-DEC-0083 (general scope, 0.2).
- Trial: M-010 (CORE-ARCH-6 section 6), counted by hand from FRAMES.md until the checks exist;
  kill and until in front matter.
- Enforcement: `P` now. `script_candidate: no:1` because the recorded-rule condition of
  SPEC-protocol-core section 1 is unmet while the status is trial. After the trial is accepted,
  these checks go into the Node validator (PROTO-DEC-0077, A-4), WARN first:
  - per-stream ACTIVE and SUSPENDED limits;
  - the five admission fields;
  - a verdict with its fields on every closed row;
  - SUSPENDED after 24 h;
  - no empty citation markers;
  - DIG once the ledger exists.

## Risks

| Risk | Likelihood | Impact | Coverage | Cost | Residual |
|---|---|---|---|---|---|
| Work renamed to escape the limits | high | high | functional frame R-L0-22.3-22.6; registry R-L0-22.12 | one row per frame | judging a frame's main purpose |
| DEFER and SUSPENDED become graveyards | medium | high | R-L0-22.27-22.29, R-L0-22.42 | fields per item | DEFER cap not yet set |
| Owner gate becomes the bottleneck | high | medium | SUSPENDED R-L0-22.26; delegation R-L0-22.34 | none | owner availability |
| Authors classify their own blockers | medium | high | R-L0-22.30, R-L0-22.33 | gate time | none |
| DIG or RER gamed | medium | medium | R-L0-22.41-22.42, R-L0-22.46 | manual counting | counts by hand until the ledger |
| Bureaucracy for small work | medium | medium | non-frames R-L0-22.4; minor R-L0-22.8 | README fields | the minor line is judged |
| The governor blocks real work | low | high | kill criterion; trial review R-L0-22.50 | one review | none |

## Change log

- 0.1 — 2026-09-26 — kilo-f22faac486b5e567 (transcription; text by claude-b00262b88c55444b) — trial for the OwnerIdeas program only (PROTO-DEC-0082) — no review.
- 0.2 — 2026-09-26 — <operator session> (transcription; text by claude-b00262b88c55444b) — general scope in the source repository; functional frame; minor without "small budget"; DEFERRED_ACCEPTED; kill criterion measures harm; FRAMES.md registry; transition gate; Kernel v1 contract; schema compliance (root R-L0-22 with sub-rules, Risks, Change log, ids of schema 2.1, until=frames-5, M-010 defined). Id map 0.1 to 0.2: R-L0-22 → 22.3-22.7; R-L0-23 → 22.8; R-L0-24 → 22.9-22.11; R-L0-25 → 22.13-22.14; R-L0-26 → 22.15-22.20; R-L0-27 → 22.21-22.23; R-L0-28 → 22.24-22.29; R-L0-29 → 22.30-22.33; R-L0-30 → 22.34-22.35; R-L0-31 → 22.36-22.37; R-L0-32 → 22.38-22.40; R-L0-33 → 22.41-22.46; R-L0-34 → 22.47-22.48; R-L0-35 → 22.49-22.53; R-L0-36 → Evidence (Enforcement) — reviewer <reviewer>: <verdict> — PROTO-DEC-0083.
```

## Appendix B - `docs/research/FRAMES.md`

### Template (create exactly this structure)

```markdown
# Research frames registry (P-L0-008)

One row per frame. A frame without a row is not open (R-L0-22.12). Edited only under the
shared-document lock (AGENTS.md section 6). Statuses: CANDIDATE (not open), ACTIVE, BLOCKED (counts
as ACTIVE), SUSPENDED, CLOSED, TRANSITION-PENDING (counts as ACTIVE until the owner confirms).
Streams: S1 kernel, runtime and routes; S2 model and task routing; S3 product pilots.

## Counters (kernel-completion mode)

| Counter | Value | As of | Source |
|---|---|---|---|
| DIG | not counted (ledger pending; first count is task one of the OwnerIdeas plan) | 2026-09-26 | R-L0-22.45 |
| DIG_FLOOR | - | - | R-L0-22.44 |
| DEFERRED_ACCEPTED | 0 | 2026-09-26 | R-L0-22.42 |
| DEFER backlog / cap | - / set by the owner after the OwnerIdeas cleanup | - | R-L0-22.29 |
| RER at last gate | - | - | R-L0-22.46 |
| Frames closed under P-L0-008 (trial: 5) | 0 | 2026-09-26 | R-L0-22.50 |

## Frames

| ID | Frame | Path | Stream | Size | Status | Round | Opened | Gate owner | Verdict | Record | Suspension: reason; resume; responsible; review date |
|---|---|---|---|---|---|---|---|---|---|---|---|

## Candidates (not open)

| ID | Candidate | Source | Stream | Size | Waits for |
|---|---|---|---|---|---|

## Bypass incidents

| Date | Frame | What happened | Resolution |
|---|---|---|---|
```

### Proposed transition inventory (show to the owner; write only confirmed rows)

| ID | Frame | Path | Stream | Size | Proposed status | Basis |
|---|---|---|---|---|---|---|
| F-01 | OwnerIdeas revision | `docs/research/2026-09-26-ownerideas-revision/` | S1 | major | CLOSED, verdict ACCEPT at the stage-3 gate | PROTO-DEC-0079..0081. Stages 4-12 continue as implementation preparation and implementation (R-L0-22.7); the stage-4 Kimi/MiMo critique is the plan's single critique |
| F-02 | R-3 model layer (task profile, model profile, resolver; contract first) | created by the plan | S2 | major | ACTIVE, round 0 | PROTO-DEC-0080. The README with the five admission fields is written before round 1 |
| F-03 | CORE-ARCH design program | `docs/core-arch/` | S1 | major | ACTIVE, "continues under PROTO-DEC-0053/0054 through the current stage; each later stage is admitted under P-L0-008" | PROTO-DEC-0054. **Owner must confirm or correct**: a multi-stage program exceeds two rounds |
| F-04 | Study A (AX, MCP facade, Rust daemon, incremental validation) | `docs/research/2026-09-25-improvement-research/` | S1 | major | SUSPENDED: reason "waits for K-launch after M-3"; resume "K-launch ready"; responsible owner; review 2026-10-03 | PROTO-DEC-0066; RESOLUTION R-6 |
| F-05 | Study B (adaptive execution depth) | same | S2 | major | SUSPENDED: same fields | PROTO-DEC-0066; RESOLUTION R-4 |
| F-06 | Validator migration council | `docs/research/2026-09-25-validator-migration-council/` | S1 | major | CLOSED, verdict ACCEPT | PROTO-DEC-0077 |
| F-07 | Cycle architecture | `docs/research/2026-09-20-cycle-architecture/` | S1 | major | CLOSED, verdict ACCEPT | PROTO-DEC-0041; TASK open question "RESOLVED 2026-09-20" |
| F-08..F-15 | `2026-09-20-cycle-history`, `2026-09-22-jev-decision-fabric-evaluation.md`, `2026-09-22-kilo-candidate-tool-evaluation.md`, `2026-09-23-kernel-architecture`, `2026-09-23-r0-decision-dataset`, `2026-09-23-routing`, `2026-09-24-remediation-mapping`, `2026-09-25-workflowai-review` | as named under `docs/research/` | operator determines | operator determines | **operator determines from evidence**: CLOSED with a verdict, or not a frame (fact-gathering, R-L0-22.4), or continues | open each README/INDEX and final output; cite `path:line` or the decision id |

Candidates (not open), from RESOLUTION section 7:

| ID | Candidate | Stream | Size | Waits for |
|---|---|---|---|---|
| C-R1 | K4 harness, then the RISK council (with R-2 diversity) | S1 | major | a free S1 slot; owner sequencing U-10, U-11 |
| C-R5 | Write coordination and scale | S1 | major | U-1 and U-3; PROTO-DEC-0076 item 4 |
| C-R7 | Delivery B vs C; script and hook performance | S1 | minor | the Node phase-0 baseline; frozen hypothesis |

Limit check if confirmed as proposed:
- S1: ACTIVE majors F-03 only (F-01 closed); SUSPENDED majors F-04.
- S2: ACTIVE majors F-02; SUSPENDED majors F-05.
- S3: none (pilots are on hold under PROTO-DEC-0048 and are not frames).
- If any of F-08..F-15 ends up ACTIVE, report the breach to the owner.
