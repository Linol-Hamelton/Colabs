# Owner resume directive - OwnerIdeas revision, after stage 3 (2026-09-26)

To: the program operator (`kilo-f22faac486b5e567`). You transcribe, launch and record; you decide
and certify nothing.

Authority: the owner, RuslanFomenko, confirmed every decision below on 2026-09-26 and hands you this
prompt himself. That is a direct owner confirmation in the sense of AGENTS.md section 2. The text
was drafted in the advisory Claude session `claude-b00262b88c55444b`, which wrote nothing to the
repository. Use this provenance on every block:

`Approved by: RuslanFomenko (direct owner confirmation, 2026-09-26; decision text drafted by claude-b00262b88c55444b; transcribed by <your session>)`

Input the decisions answer: `docs/research/2026-09-26-ownerideas-revision/round3/RESOLUTION-CLAUDE.md`
(commit 7f64d2a), sections 5-10.

## Owner decisions

D1. Priority of the whole program, highest order:
    1. stabilize every route to the assistants: one launch path instead of two (`run-chain.cjs`
       and `improvement-research/prompts/launch.cjs`), a route registry with a liveness probe
       before dispatch, liveness per PROTO-DEC-0075 item 5, and tests under `tests/*.test.cjs`;
    2. the run record (A-10);
    3. resolver v0 inside the kernel dispatcher (A-3);
    4. then the other A-items.
    The executor rule, in the owner's words: "При назначении исполнителя в потоке работы роя
    агентов, для каждого отдельного подзадания, мы должны выбирать самую дешевую и быструю модель,
    возможности которой необходимы и достаточны для выполнения поставленного задания."
    It refines PROTO-DEC-0075 items 8-10 and replaces nothing. Resolver v0 order: hard constraints,
    then the 0059 floors, then the cheapest live tier, then escalation only on a verified failure.
    Sufficiency is judged by verification, not predicted.
D2. PROTO-DEC-0076 item 4 is lifted for exactly one frame: R-3, the model-layer frame
    (`benchmark.md`, `executor.md`, `task_profife.md`, `performers.md:1-137`), run as one major
    frame. Contract first:
    - fix the schemas TaskProfile, ModelProfile and the resolver output;
    - fix one shared set of capability dimensions, taken from the benchmark classes of
      `benchmark.md` sections 2-8;
    - research fills values and never changes a schema without an owner decision;
    - step one recovers or removes the 10 `:chatgpt-content-reference` markers in `benchmark.md`.
    All other frozen hypotheses stay frozen.
D3. U-7: task characterization is a component inside P-L2-002, not a separate layer.
    PROTO-DEC-0062 item 2 stands.
D4. U-6: verified public benchmarks, each with an address and a date, may serve as the prior for a
    model's capability vector. Provider pages stay the only source for rank and price. This scopes
    PROTO-DEC-0063 item 1 to rank and price.
D5. U-5: PROTO-DEC-0075 item 8 and the 0059 floors stand. Assurance may be raised in addition.
    Revisit with R-3 data.
D6. U-1: the five implementation packages are sequenced into at most two edit streams.
    PROTO-DEC-0048 item 7 stands.
D7. U-2: `CLOSED` closes the program and is not a certification. High-risk kernel packages are
    certified by two parallel independent reviewers outside execution and control
    (PROTO-DEC-0038 item 1, 0041 items 1-2). Claude and DeepSeek certify nothing they wrote,
    planned, launched or controlled.
D8. U-9: the no-repeat-confirmation principle of PROTO-DEC-0070 items 5-6 becomes a general kernel
    rule and the basis of A-1, the capability envelope: a design block plus an L0 procedure that
    extends P-L0-002.
D9. A-2: OwnerIdeas files are advisory seeds ranked below PLAN. A file leaves the active corpus when
    the frame that consumes it closes. Agents never place their outputs in `OwnerIdeas/`.
D10. Cleanup C-1..C-5 is approved exactly as RESOLUTION sections 5 and 9 list it, plus U-12: one
     status line at the top of each kept OwnerIdeas file, "Advisory seed; consumed by <frame>; status:
     RESOLUTION-CLAUDE.md section 4.4". Gemini executes, commits nothing, and reports dangling
     references.
D11. RESEARCH-GOVERNOR is adopted as a trial policy (Appendix A). It refines PROTO-DEC-0052 item 1
     and applies to this program from now on.

Open, not blocking the plan: U-3, U-4, U-8 (security: waits inside R-1, never DEFER), U-10, U-11,
U-13, U-14. Also open: the resolver metric (proposed: cost per accepted result, including rework),
the cost-versus-latency tie-break, the DEFER backlog cap, the Kernel v1 scope and the operating
threshold.

## Steps, in order

1. `node .ai/bin/protocol-lock.cjs acquire --owner <your session>`.
2. Append the decision blocks to `.ai/DECISIONS.md` with the next free numbers, grouped as you
   judge. Each block names what it refines. Suggested grouping:
   - D1, D3, D5, D6, D7, D9, D10;
   - D2 with D4;
   - D8;
   - D11.
3. Append `owner-directive` trigger rows to `docs/decisions/REGISTRY.md` for the partial lift of
   0076 item 4 (D2), the scoping of 0063 item 1 (D4), and the refinement of 0052 item 1 (D11).
4. Write Appendix A as a trial L0 procedure under `docs/core-arch/stage-1/`, using the next free
   P-L0 id, with `status: trial`.
5. Replace the stale round-2 note in `.ai/TASK.md` with one line: stage 3 closed; decisions
   recorded; cleanup and plan running; priority per D1.
6. Release the lock.
7. Launch the Gemini cleanup per RESOLUTION section 9 plus D10.
8. Write `docs/research/2026-09-26-ownerideas-revision/prompts/PLAN-AMENDMENT.md` from Appendix B.
   Point the DeepSeek plan launch file at RESOLUTION section 10 and this amendment, then resume the
   plan slot.
9. Housekeeping:
   - commit `.ai/worklog/mimo-0e0610cd95c1e83e.md`. It is not an empty failed attempt: it holds a
     full entry with Evidence, recorded at 09:01Z outside the runner;
   - in your next journal entry, record that Synthesis B is the work of two sessions.
10. Run the validator, then `protocol-handoff.cjs record`, and write your journal entry. Commit
    per the owner's standing instruction for this program.

## Appendix A - RESEARCH-GOVERNOR (trial)

Law: research exists to close a decision; new research is not a research output.

1. **Frame.** A frame is bounded work whose main purpose is to reduce uncertainty, compare
   alternatives, produce a recommendation, or form or change a decision, an architecture or a
   plan. The name does not matter.
   - Not frames: fact-gathering and measurement; implementing an accepted decision; testing a
     defined implementation; review or certification of a frozen artifact that does not widen scope.
   - The stages of one program are one frame.
   - After ACCEPT, an implementation plan is preparation, not a frame, unless it reopens
     architecture. A plan is critiqued once.
2. **Size.**
   - Minor, all of: one question, one executor, one round, no kernel-architecture change, no new
     permanent mechanism, within a small budget.
   - Major: everything else.
3. **Streams.** Streams are fixed by the owner:
   1. kernel, runtime and routes;
   2. model and task routing (schemas, profiles, calibration);
   3. product pilots.

   A new stream needs an owner decision naming the stream it closes, merges or pauses.
4. **Admission.** Five fields go in the frame README: decision, question, alternatives, budget,
   exit condition. If they cannot be filled, the item goes to implementation, EXPERIMENT or DEFER.
5. **Verdicts.** Only four:
   - ACCEPT: a DEC block and a linked implementation task, then CLOSED.
   - REJECT: a tombstone with the decision and the evidence, then CLOSED.
   - EXPERIMENT: hypothesis, baseline, thresholds, budget and deadline. Holds a slot.
     KEEP leads to DEC, implementation and CLOSED. ROLLBACK leads to CLOSED.
   - DEFER: summary, reason, reopen trigger and canonical source. Goes to the backlog, out of
     agent context.

   "More research is needed" is not a verdict.
6. **Rounds.** At most two reasoning rounds, then the gate. A third round only by owner decision,
   with five justifications. No fourth round. Experiment iterations are bounded by budget.
7. **Limits.**
   - Per stream: at most 1 major and 1 minor ACTIVE. An owner override names the frame it pauses.
   - SUSPENDED: after 24 h in BLOCKED or waiting for a gate. A suspended frame records its reason,
     its resume condition, an owner and a review date. At most 1 suspended major per stream.
   - The DEFER backlog cap is set by the owner after the cleanup.
8. **Findings.**
   - Findings are BLOCKING, RELATED or FUTURE, classified by the gate owner, not the author.
   - Only BLOCKING findings widen a frame. There are no child frames until the parent closes.
   - P0/P1, security and data-loss findings are never DEFERred without an owner decision.
9. **Gate.** The owner decides. Low-risk gates may be delegated (0062 item 3, 0078). A delegate
   never closes a frame it authored (0057).
10. **Stop.** Any one of these sends a frame to its gate:
    - no new decision-relevant evidence;
    - an implementation is the cheaper test;
    - the choice is reversible with a shown rollback;
    - the question is optimization, not correctness.

    Stability is judged by evidence, not votes.
11. **Complexity.** A new layer, procedure, role, state machine, store or scoring model must show
    that the simpler option fails. This does not apply to accepted decisions. Full pre-registration
    and holdout apply only to kernel, certification and protected paths.
12. **DIG ratchet.**
    - DIG counts accepted-not-implemented items. An item is implemented when its maturity chain
      reaches test and end-to-end use. DEFER items are excluded, and moving an item from ACCEPT to
      DEFER needs the owner.
    - While DIG > DIG_FLOOR, optional frames do not open. P0/P1 and security still pass.
    - A new minimum becomes the floor. Only the owner raises the floor.
    - The ratchet is inactive until a status ledger exists; the first baseline count is task one
      of the plan.
    - Report RER together with backlog growth.
13. **External texts.** External texts are advisory only. Empty citation markers are replaced by a
    verified source with an address and a date, or removed together with the claim they supported.
14. **Transition and trial.**
    - On adoption, every open frame gets "continues to round X" or a verdict.
    - The trial runs for 3-5 closed frames, then a short operational review: did it obstruct, was
      it bypassed, did it add false bureaucracy, did branches drop?
    - The trial is reviewed if the governor itself blocks a slot for more than 24 h twice.
    - Leaving the mode needs a Kernel v1 completion contract; its scope and operating threshold are
      open for the owner.
15. **Validator checks** (to build):
    - ACTIVE and SUSPENDED limits per stream;
    - the five admission fields;
    - a verdict and its fields on every closed frame;
    - SUSPENDED after 24 h;
    - no empty citation markers;
    - DIG once the ledger exists.

## Appendix B - plan amendment for DeepSeek

This amendment overrides the "Suggested dependency order" in RESOLUTION section 10. Everything
else in section 10 stands.

- **Order: D1.**
  - Wave 1: route stabilization, with its tests, and the A-10 run record.
  - Wave 2: resolver v0 inside A-3, then the rest of A-3.
  - Items that need no ruling (A-5, A-6, A-12) fill the second stream where they do not collide.
- **Wave 0 is resolved:** U-1 by D6, U-2 by D7, U-9 by D8, A-2 by D9. For D6, show how the five
  packages fit two streams.
- **R-3 is unblocked** as one major frame in stream 2 (D2).
  - Plan its contract-first steps: schemas, dimensions, citation recovery.
  - Its link to resolver v0 is that R-3 fills values, and v0 runs on defaults and provider pages
    until then.
  - The constraint "no separate characterization layer" stays (D3).
- **Every R-item** ends in one of the four verdicts, and each item states its stream and whether it
  is major or minor (Appendix A).
- **Task one** of the plan: count the DIG baseline.
- **Flag, do not solve:**
  - the resolver metric and the cost-versus-latency tie-break;
  - the DEFER cap, the Kernel v1 scope and the operating threshold;
  - U-3, U-4, U-8, U-10, U-11, U-13, U-14.
- **Stage 4**, the Kimi and MiMo critiques in parallel, is this plan's single critique.
