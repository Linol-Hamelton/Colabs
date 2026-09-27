# Owner master directive - resume the OwnerIdeas program after stage 4 (2026-09-26)

To: the program operator (`kilo-f22faac486b5e567`). This directive replaces every pending
instruction in your queue. It carries all current owner decisions and the full order of work up to
the next owner stop. You transcribe, commit, prepare and launch slots. You decide nothing and
certify nothing. At each STOP you report and wait.

Authority: the owner confirmed everything below on 2026-09-26 and hands you this directive himself
(AGENTS.md section 2). Drafted in the advisory session `claude-b00262b88c55444b`, which wrote
nothing to the repository. Provenance for any block you write from it:
`Approved by: RuslanFomenko (direct owner confirmation, 2026-09-26, master resume directive; text drafted by claude-b00262b88c55444b; transcribed by <your session>)`

## 0. State you start from (verify, do not assume)

- Stage 4 is DONE: both plan critiques are CONFIRM_WITH_CHANGES,
  `round5/CRITIQUE-KIMI.md` (Kimi K2.7) and `round5/CRITIQUE-MIMO.md` (MiMo-V2.6-Pro). They and
  their journals are not committed yet.
- MiMo-V2.6-Pro finished its slot, and MiMo has no role after stage 4 (DISPATCH-OWNER stages
  5-12). The owner still replaces it with Flash for any future assignment (O-1).
- `docs/research/2026-09-26-ownerideas-revision/directives/` holds the owner directives
  (untracked).
  - Two are executed: RESUME-OWNERIDEAS-AFTER-STAGE3 → PROTO-DEC-0079..0082;
    RESEARCH-GOVERNOR-0.2-PROMPT → PROTO-DEC-0083.
  - Pending: this file, F-02-ADMISSION-PROMPT and CLOSURE-DISPOSITION-0085-PROMPT.
  - `OwnerIdeas/new/` no longer exists.
- The five owner items of the previous message are not applied: the FRAMES.md cap is still
  "pending", the BACKLOG "Frozen hypotheses" are not migrated, and there are 108 journals.

If any of this differs, report the difference before acting.

## 1. Owner decisions in this directive

- **O-1. MiMo-V2.6-Flash replaces MiMo-V2.6-Pro, for financial reasons.**
  - It covers every MiMo assignment of this program from now on: `mimo` CLI,
    `xiaomi/mimo-v2.6-flash`, the same Xiaomi credential, effort high unchanged.
  - The completed stage-4 Pro critique stands and is **not rerun**; a rerun would spend what the
    change saves.
  - No MiMo slot remains in stages 5-12, so nothing running changes.
  - MiMo is not on the owner's working ladder (MODEL-ECONOMICS.md), so the F-02 frozen set is
    unaffected.
  - Record it as its own decision block **after** the closure block (step 5a), so that the F-02
    block keeps PROTO-DEC-0084 and closure keeps 0085. Update the README assignment table and
    DISPATCH.json route entries for MiMo.
  - Do not stop or reset any slot.
- **O-2. Backlog caps.** DEFER cap = 5; candidates cap = 5 (at the cap no new candidate until one is
  merged, removed or opened). Put them now in the FRAMES.md counters only. The decision text lands
  inside the F-02 admission block (its item 10), not in a separate block.
- **O-3. Migrate `docs/ops/BACKLOG.md` "Frozen hypotheses" into FRAMES.md.**
  - H-WAI-1..6 become one DEFER entry, with the trigger "run records accumulated (A-10)".
  - H-PROMPT-DELIVERY-01 merges into candidate C-R7.
  - L-GIT-01 becomes CLOSED (answered by the council, C-1).
  - A pointer to FRAMES.md stays in BACKLOG.md.
  - Resulting DEFER entries: 3 of 5.
- **O-4. Mistral review of P-L0-008 0.2.**
  - Its length of 293 lines (over 250) is accepted by owner exception, with no rerun.
  - Its `Baseline: 7b6d17a` is a clerical error. The review cites R-L0-22.40-22.54 (9x) and
    PROTO-DEC-0083 (21x), which exist only in 0.2, so it reviewed the 0.2 tree (566debf/e68bc58).
  - Record the corrected baseline and this evidence in your journal. Do not edit the review.
- **O-5. Journals.** Run `node .ai/bin/protocol-session.cjs prune`, then archive the oldest
  journals under the lock with `protocol-archive.cjs` until there are 100 or fewer. Never touch a
  journal of a running session.
- **O-6. Directive files leave `OwnerIdeas/`.** 0079 D9 forbids agent outputs there, and executed
  directives would compete with the canon.
  - Already done, uncommitted, by the drafting session on the owner's instruction:
    `OwnerIdeas/new/` is removed, and the directives (including this one) and
    `directives/README.md` are in `docs/research/2026-09-26-ownerideas-revision/directives/`.
  - You verify and commit them.
  - Never edit a directive file after it is sent. Corrections live in the README or a later
    directive.
- **O-7. The 0085 directive in `directives/` is already the corrected version.** Its step 0.1
  checks by content, not number: the F-02 admission block (whose Decision item 1 states the F-02
  primary question) and P-L0-008 0.3 (R-L0-22.55) must be committed first. Use the actual decision
  numbers everywhere.

  With the O-1 block written last, the F-02 block is expected to be PROTO-DEC-0084, closure
  PROTO-DEC-0085, and the MiMo change 0086. Verify before writing.
- **O-8. Stage 5 resumes** with the amendment in Appendix A. Slot and model are frozen per the
  dispatch: Claude Opus 5.5, effort xhigh, claude CLI. Stage 6 (the deterministic packages) is
  produced in the same slot.
- **O-9. Certifiers.** High-risk kernel packages need two parallel independent certifiers outside
  execution and control (PROTO-DEC-0038 item 1, 0041 items 1-2, 0079 D7). Claude and DeepSeek are
  excluded as authors and planners. The owner names the certifiers at STOP-3, before stage 7.
- **O-10. Executors.** The five stage-8 executors are named by the owner before stage 8 (dispatch
  section 8), until automatic executor selection works. The owner's standing override stands (F-02
  block item 9).

## 2. Order of work

The lock is taken for each shared-document step and released after it. Steps 1-5 are strictly
sequential. Validator after each commit; `record` and a five-label journal entry after each group.

1. **Commit stage 4.** Check both critique headers and verdicts. Commit `round5/`, the two critic
   journals (`kimi-4056c8cfeceed587`, `mimo-9ff25216f4c36caf`) and USAGE.md in one commit.
2. **O-2 to O-5.** One commit for FRAMES.md and BACKLOG.md (O-2, O-3). One commit for the journal
   work (O-5). O-4 goes into your journal.
3. **O-6.** Verify that the five directive files and `directives/README.md` are in place and
   `OwnerIdeas/new/` is gone. Commit them in one commit.
4. **Execute `directives/F-02-ADMISSION-PROMPT.md` in full**, sections 0-3.
   - **STOP-1:** report and ask the owner for the models and efforts of F-02 collector A,
     collector B and the verifier. Do not launch F-02 before the answer.
   - While waiting, continue with steps 5 and 6.
5. **Execute `directives/CLOSURE-DISPOSITION-0085-PROMPT.md`** sections 0-3 (with O-7), then
   section 4 up to the manifest.
   - **STOP-2:** show the manifest summary and its LOW-confidence rows. Move nothing before the
     owner answers.
   - After the answer: apply one commit per frame, sequentially, and report active-corpus bytes
     before and after.
5a. **O-1 block.** Once the closure block is committed, append the MiMo change block (next free
    number; Refines: DISPATCH-OWNER section 20 as to MiMo only), plus its REGISTRY row. Update the
    README assignment table and DISPATCH.json. Commit.
6. **Prepare and launch stage 5.** Start only after the closure block of step 5 is committed; the
   manifest may still be pending.
   - Write `prompts/FINAL-RESOLUTION.md`:
     - the stage-5 and stage-6 requirements of DISPATCH-OWNER ("Этап 5", "Этап 6");
     - plus Appendix A verbatim.
   - Write `prompts/run/r6-claude-final.md` in the pattern of `r3-claude.md`, with inputs:
     - PLAN-DEEPSEEK, CRITIQUE-KIMI, CRITIQUE-MIMO;
     - RESOLUTION-CLAUDE and PLAN-AMENDMENT;
     - PROTO-DEC-0079..0085 and P-L0-008;
     - FRAMES.md.
   - Add slot `r6-claude-final` to DISPATCH.json:
     - `claude-opus-5-5`, effort xhigh;
     - needs `r5-kimi-critique`, `r5-mimo-critique`;
     - out `round6/FINAL-RESOLUTION-CLAUDE.md`;
     - packages under `round6/packages/`.
   - Commit, then launch the runner.
7. **STOP-3,** when r6 is DONE. Verify:
   - its outputs exist;
   - every critique BLOCKING item has an explicit accept or reject with a reason;
   - there are exactly five packages, each with every field of Appendix A item 7.

   Then report and ask the owner for:
   - (a) the two certifiers of the high-risk packages (O-9);
   - (b) the five stage-8 executors with efforts (O-10);
   - (c) permission to launch stage 7 (DeepSeek pre-check).

   Prepare the stage-7 slot, but do not launch it.

## 3. Never, in this directive

- Change any assigned model or effort, except MiMo per O-1.
- Open a new frame.
- Edit an existing DECISIONS block, a review file or a directive file.
- Launch F-02, stage 7 or stage 8 without the owner's answer at its STOP.
- Run two lock-holding steps at once.
- Move any file outside the confirmed manifest.

## 4. Report at each STOP (short, in chat)

- commits;
- the validator output verbatim;
- counters (DEFER n/5, candidates n/5, journals);
- what is running;
- the exact question for the owner.

---

## Appendix A - stage-5 amendment (include verbatim in `prompts/FINAL-RESOLUTION.md`)

Since the owner's dispatch was written, these binding changes apply to stages 5-12. Where they
differ from the dispatch text, they win.

1. **Two edit streams, not five parallel executors** (PROTO-DEC-0079 D6; PROTO-DEC-0048 item 7).
   - Sequence the five packages into at most two concurrent edit streams, named E1 and E2. Do not
     confuse them with the frame streams S1-S3 of P-L0-008.
   - Resolve CRITIQUE-KIMI's concurrency finding (PKG-4 and PKG-5 in one stream in Wave 2)
     explicitly.
2. **CLOSED is not certification** (PROTO-DEC-0079 D7).
   - Mark each package's risk class (PROTO-DEC-0038).
   - A high-risk package (anything under `.ai/`, `.claude/`, hooks, validator, gates) needs two
     parallel independent certifiers outside execution and control, named later by the owner.
   - Claude and DeepSeek never certify packages they resolved, planned or pre-checked.
3. **Priority** (PROTO-DEC-0079 D1): route stabilization with tests first, then the run record
   (A-10), then resolver v0 inside the dispatcher (A-3), then the rest.
4. **F-02 runs in parallel** in frame stream S2. Resolver v0 uses defaults and provider pages and
   never waits for F-02 data. No package edits `docs/ops/model-evidence/`, P-L2-002 task
   requirements or F-02 files.
5. **Governor** (P-L0-008): packages are implementation, not frames.
   - No research inside a package.
   - An executor's new idea or unresolved design question is returned as a finding and becomes a
     candidate (cap 5) or goes to the owner. It never widens scope.
6. **Closure** (P-L0-008 R-L0-22.56-22.71; the closure decision): stage 12 CLOSED requires a closure
   receipt for the program's own artifacts. Each package therefore declares an artifact plan.
7. **Each of the five packages gives:**
   - the dispatch fields: ID, goal, scope, inputs, allowed paths, forbidden paths, dependencies,
     required outputs, acceptance criteria, validation commands, integration conditions;
   - plus:
     - its edit stream (E1/E2) and wave;
     - its risk class and certification route;
     - its artifact plan (files created, changed or superseded, and their intended disposition);
     - its executor requirements, as capability dimensions (D-IMPL, D-ARCH, D-REV, D-TERM,
       D-ALGO, D-EDIT, D-DOC, D-CRIT, D-SYN), each HIGH, MEDIUM or LOW, plus the minimum tier
       under PROTO-DEC-0059 floors, so that the owner (or later the resolver) can name the
       cheapest sufficient executor;
     - a STOP condition: when the executor must block and return a finding instead of deciding.
8. **Every BLOCKING item in both critiques gets an explicit accept or reject with a reason**,
   including Kimi's M-7 scheduling gap for A-4 and the unscheduled dependencies of A-9 and A-11.
9. **Out of scope for stage 5:** new decisions, new frames, model assignments, and any change to
   PROTO-DEC-0079..0085. Anything needing one is listed as an owner question.
