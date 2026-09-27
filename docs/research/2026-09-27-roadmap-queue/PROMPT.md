# PROGRAM ROADMAP-1: the open-work queue, from simple to hard (operator prompt)

Owner request 2026-09-27, cloud advisory session `claude-ad7cc4169e888ea8`. Status: QUEUED. Nothing
here is a decision. It starts on the owner's go, and the owner answers packet 1 first.

## Goal

Clear every open item found by the 2026-09-27 inventory. The inventory read `.ai/TASK.md`,
`docs/research/FRAMES.md`, `docs/ops/BACKLOG.md`, `docs/ops/PROBLEMS.md`, the cost-routes `GAPS.md`,
F-02, PROTO-DEC-0048 and 0077, `final-plan-2.md` and `OwnerIdeas/`.

The order is fixed: defined and simple first; defined but harder next; undefined but light after
that; undefined and heavy last. The program ends with a finite, reviewed result. It does not run
forever.

## Standing rules

- AGENTS.md binds every session. Human-facing text is Russian; repository text is English.
- **Roles** (confirm in packet 1, Q2):
  - Operator: DeepSeek Flash (kilo). It dispatches, relays and commits the files of sessions that
    ask it to. It authors and certifies nothing.
  - Executor: Gemini 3.8 Flash high (agy), in its own session.
  - Reviewer: DeepSeek Flash, in its own session, never the operator session.
  - Certifiers for high-risk candidates: the pair the owner names in Q2.
  - Owner lane: the owner or the operator runs the Windows suite. The cloud has no PowerShell.
- **Git.**
  - Name paths in `git add`; never `-A` or `.`.
  - Before every push: `git fetch origin`, then `git pull --ff-only` if origin moved.
  - No force, rebase or amend of pushed commits. No PR, tag or merge into `main`.
- **Shared documents** (`.ai/TASK.md`, `.ai/PLAN.md`, `.ai/DECISIONS.md`, `.ai/ARCHIVE.md`,
  `docs/decisions/REGISTRY.md`, `docs/research/FRAMES.md`): edited only under `protocol-lock.cjs`.
  Change one line or one block at a time, and never reformat.
- **Decision blocks.** A decision block is written only after a direct owner answer. It is
  transcribed with provenance (AGENTS.md section 2) and appended, never edited.
- **Evidence** comes only from `protocol-handoff.cjs record`. A hand-written Evidence block is
  forbidden. A working record may use `--quick` (PROTO-DEC-0071); a frozen CANDIDATE needs the full
  lane.
- **Stop and ask the owner** on:
  - any contradiction with a higher source;
  - a FAIL after the round budget;
  - a quota with no admissible substitute;
  - anything this prompt does not settle.

  Never guess.
- **Cost.** Every session records its model, effort and usage (PROTO-DEC-0075 item 9). A certifier
  slot never moves to another model without an owner record.

## Cycle budget (rational: one review per wave, one certification per candidate)

| Wave | Kind | Checks | Rounds |
|---|---|---|---|
| 0 | owner packet 1 | the owner answers | 1 |
| 1 | docs and hygiene, low risk | one reviewer statement for the whole wave (PROTO-DEC-0038 item 2) | review plus at most 1 fix round |
| 2A | kernel batch (`.ai/bin`, `tests/`) | DeepSeek adversarial review, then a frozen CANDIDATE, the owner lane, then 2 certifiers in parallel (0038 item 1, 0041 item 2) | at most 3 (0047 item 5), then the owner |
| 2B | Node validator port | the gates of `final-plan-2.md`, with its own 2 certifiers | per plan, at most 3 per gate |
| 3 | drafts and a narrow audit, docs only | one verifier from another family; the owner decides | 1 plus 1 targeted correction |
| 4 | not executed here | each item gets its own launch after packet 2 | - |

**Parallelism.**
- Wave 3 runs in parallel with waves 1 and 2. It is research and drafts in its own folder and its
  own worktree, so the two-stream cap does not apply (PROTO-DEC-0048 item 7).
- Waves 2A and 2B are sequential: at most two edit streams.

**Batching.** All kernel edits of wave 2A go into one candidate, following the batching rule in
`.ai/PLAN.md`. A round opens when the batch is ready, never per file.

## Wave 0. Owner packet 1: quick answers, sent as one message

The operator sends Q1-Q7 at once and waits. Each answer is transcribed with provenance.

- **Q1. F-02 gate.**
  - Your verdict on `docs/research/archive/2026-09-26-model-layer/round2/` (verifier: PASS with
    recommendations; 20 CONFIRMED, 27 UNVERIFIED, 0 REJECTED).
  - Confirm that DeepSeek V4.1 Max is V4.1 Flash at max effort. This one answer also closes
    BACKLOG S-5.
  - Deadline 2026-09-29.
- **Q2. Roles and certifiers.**
  - Confirm the roles above.
  - Name the certifier pair for waves 2A and 2B. Proposed: MiMo-V2.6-Pro and GPT-5.6 Sol (OPS-1
    D5).
- **Q3. Kernel batch 1 scope.** Pull the defined defects W0, W1-retire and W5 forward from OPS-1
  into wave 2A, under PROTO-DEC-0048 item 6 (critical failures that obstruct work). Yes or no.
- **Q4. Node validator launch conditions** (`final-plan-2.md` section AC):
  - approve the exclusive workstation runs for the phase-0 baseline (Bv/Bs/Bn/Bm);
  - accept the Q2 pair as the section AC item-3 preflight.
- **Q5. Cleanup.**
  - May the operator delete the branch `claude/f01-closure-script`?
  - May it remove the stale workstation worktrees `Colabs-cert/*` (PROTO-DEC-0046, 09-23) and
    `equinox-path` (09-19), after listing each one's `git status`?
- **Q6. Journals** (125 against the cap of 100). May the oldest journals with entries be archived
  whole into `.ai/ARCHIVE.md` (append-only, under the lock), then removed from `.ai/worklog/`?
- **Q7 (optional now, otherwise in wave 3).** The four premises of cost-routes `GAPS.md` section 6.

## Wave 1. Defined and simple: done on the fly

One executor session. One commit per item. One reviewer statement at the end.

1. **F-02 close-out** (after Q1). Record the gate verdict in FRAMES F-02. If the verdict is ACCEPT,
   apply the P-L0-008 closure: artifact set, dispositions, apply commit, CLOSURES.jsonl append and
   receipt. The closer never certifies its own receipt. Record the ladder route id and effort in
   `docs/ops/MODEL-ECONOMICS.md`, which closes S-5.
2. **TASK.md refresh** (under the lock, at most 80 lines).
   - Rewrite "Current state" to the facts of 2026-09-27: F-01 CLOSED, F-02 per Q1, the dispatcher
     is in the tree, product on hold under 0048.
   - Shrink "Next" to pointers: this program, OPS-1, and the Node validator.
   - Move the old text to `.ai/ARCHIVE.md`; archiving moves text and never deletes it.
3. **Prompt templates.** S-4 (the language rule repeated at the point of use) and S-10 ("never edit
   an entry after `record`; add a new one") go into `templates/` and the vibe client notes in
   `.ai/docs/CLI-AGENTS.md`. The change to `.ai/docs/clients.json` waits for wave 2A.
4. **Cleanup** (after Q5): delete the branch and remove the worktrees. Record what was removed and
   its last SHA in the journal.
5. **Journal archive** (after Q6): archive the oldest journals until at most 100 remain, using
   `protocol-archive.cjs` where it applies. Check that no open reference points to an archived
   file.
6. **Phase-0 baseline** (after Q4, on the workstation, exclusive). Measure Bv/Bs/Bn/Bm per
   `final-plan-2.md` at the current head, before any wave-2 change. Commit the numbers to
   `docs/research/2026-09-27-roadmap-queue/BASELINE.md`.

**Wave-1 exit.**
- One reviewer statement: PASS or RECOMMENDATION.
- A `record --quick` at the wave head.
- The validator shows 0 warnings on the journal and corpus caps.

## Wave 2. Defined, medium to hard

### 2A. Kernel batch 1 (high-risk, one candidate), on branch `kernel-batch-1` cut from `v2.0.0`

Scope, per Q3. Each item is one commit, with a failing test first.
- **W0.** The codex usage parser. Quote the raw "tokens used" line from
  `.ai/runtime/cost-routes-verifier/` first. Then accept an optional colon, and space, NBSP, comma
  and dot as grouping characters, plus K/M suffixes. Keep the raw usage line in the attempt record.
  Tests: `10 644`, `10 644` with NBSP, `10,644`, `tokens used: 10 644`, and one real captured line.
- **W5.**
  - Hermetic dispatch tests: launch files and state go into a temporary root; no test writes to the
    tracked tree; `git status` stays clean after a killed run.
  - Re-home the fixture `prompts/DISPATCH.json` and `prompts/run/*` (40 files, still at
    `docs/research/2026-09-26-ownerideas-revision/`) to `tests/fixtures/`.
  - Archive the leftover directory and add an INDEX row.
- **W1-retire.** New programs use `.ai/bin/protocol-dispatch.cjs` only. Mark `run-chain.cjs`
  retired, with a one-line pointer; do not delete it, because reviews cite it.
- **S-7.** Throttle `launch-test.cjs` scenarios so that WMI queries do not time out.
- **S-10.** The vibe profile note in `.ai/docs/clients.json`.

Flow:
1. The executor implements the batch.
2. DeepSeek reviews it adversarially in its own session.
3. One fix pass.
4. Freeze the CANDIDATE SHA.
5. The owner lane runs the full suite on the CANDIDATE.
6. The executor writes the unified adversarial audit prompt (at most 150 lines).
7. Both certifiers run in parallel.
8. On PASS, merge into `v2.0.0` with a merge commit, and fill the TASK completion gate.

### 2B. Node validator port (PROTO-DEC-0077), after 2A merges

`final-plan-2.md` Part 1 is binding: contract, differential verification against the PowerShell
engine, rollback and retirement. Start at G0 only when all section AC items hold: Q2, Q4 and the
wave-1 baseline. Specify the CA-04 oracle cohort in G1's contract set before G1.

Then take gates in plan order, each gate its own candidate with the Q2 certifiers. Target: `record`
runs the validator without PowerShell. A cloud run stays fail-closed per 0077 item 1 and never
equals a Windows record.

Measure against `BASELINE.md` and put the before/after table in the program report. OPS-1 W8
(parallel suite) is re-scoped by these numbers; it does not start before 2B reports.

## Wave 3. Undefined, light to medium: drafts plus one narrow audit

Runs in parallel from the start, in `docs/research/2026-09-27-roadmap-queue/drafts/`, in its own
worktree. The audit in item 3 is a research frame: register it in `docs/research/FRAMES.md` under
the lock before it starts (P-L0-008 admission, candidate cap).

1. **Exit criterion for PROTO-DEC-0048.** Draft a measurable test for "the protocol is stable and
   its metrics are measurable", after which product pilots resume. Candidates:
   - a full `record` takes at most N minutes;
   - cloud sessions record Evidence (after 2B);
   - K consecutive certification rounds pass with no empty round;
   - run records carry usage for every client.

   Give options with numbers, and a recommendation.
2. **K-launch route (BACKLOG M-3).** Write a one-page memo: run Studies A and B (F-04 and F-05) on
   `protocol-dispatch.cjs` instead of `launch.cjs` plus M-3, or keep the old path. This unblocks
   CORE-ARCH stage 3; the review date of both frames is 2026-10-03.
3. **Narrow audit, "decided but not done".**
   - Collector: Mistral Medium 3.5 (vibe). One row per numbered item of PROTO-DEC-0022..0086:
     implemented, where (path or commit), or not implemented.
   - Verifier: GPT-5.6 Sol. It checks a 20% sample plus every "not implemented" row.
   - Check coverage with `protocol-ledger.cjs cover`.
   - Advisory: no verdict, no certification.
4. **OPS-1 phase A.** Run it exactly as `docs/research/2026-09-27-ops-layer/PROMPT.md` Phase A:
   `DESIGN.md` plus D1-D5. Fold H-AUTH-02 (`OwnerIdeas/H-AUTH-02.md`, bounded execution
   authorisation) into D1 and D3 as the rule for which owner answers may cover a class of actions.
5. **Owner questions carried**, each with a recommended answer:
   - GAPS section 6, if not answered in Q7;
   - BACKLOG C-6 and C-8;
   - OQ-1, OQ-3, OQ-4, OQ-8 and OQ-9 from the OPS-1 README.

The verifier (another family than the drafter) checks the drafts for internal consistency and
against DECISIONS. One targeted correction.

**Owner packet 2.** Send all drafts in one message, with the choices as short options.
Answers become decision blocks, transcribed by the lock holder.

## Wave 4. Undefined and heavy: queued, not executed here

After packet 2, write each item into `.ai/TASK.md` Next as one line with its trigger:
- OPS-1 phases B and C (on D1-D5);
- CORE-ARCH stage 3, and F-04/F-05 resumed (on the wave-3 item 2 decision);
- package I-a, which lands the kernel into `.ai/core/` (after stages 2 and 3; PROTO-DEC-0061);
- C-R7 prompt delivery (on the 2B baseline);
- C-R1 RISK council;
- product pilots Block-Puzzle and VPN (on the exit criterion of wave-3 item 1).

## Finish (the program is DONE when all hold)

- Waves 1 and 2A are merged into `v2.0.0`. Their review and certificates are persisted. The owner
  lane is green on the merged head.
- Wave 2B has reached the gate the owner set in packet 2, or is DONE per `final-plan-2.md`.
- Packet 2 is answered, its decision blocks are appended, and the wave-4 lines are in TASK.md.
- `git status` is clean. `protocol-handoff.cjs verify` matches. The validator shows 0 warnings.
- `docs/research/2026-09-27-roadmap-queue/REPORT.md` is written:
  - what closed;
  - the before/after wall times;
  - usage per session;
  - open items with owners.
