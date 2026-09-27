# Launch: task:roadmap-w1-executor (manual dispatch; Gemini 3.8 Flash high via agy)

Program: ROADMAP-1, `docs/research/2026-09-27-roadmap-queue/PROMPT.md`. Wave 1 (docs and hygiene).
You are the wave-1 executor. One executor session for the whole wave; one commit per item.

## Session rules (binding)

- AGENTS.md binds you. Repository text is English. You do not chat; if you must ask the owner,
  write the question into `W1-QUESTIONS.md` and stop that item.
- Start your protocol session: `node .ai/bin/protocol-session.cjs start --agent gemini` and use the
  printed owner name for your journal, the lock and the evidence.
- Shared documents (`.ai/TASK.md`, `.ai/PLAN.md`, `.ai/ARCHIVE.md`, `.ai/DECISIONS.md`,
  `docs/decisions/REGISTRY.md`, `docs/research/FRAMES.md`): edit only while holding
  `node .ai/bin/protocol-lock.cjs acquire --owner <your owner>`; one line or one block per change;
  never reformat; append-only where required. Release the lock right after each edit block.
- Git: `git add` names paths explicitly - never `-A` or `.`; no force, rebase or amend; **do not
  push** (the operator pushes after the wave). One commit per item, English messages, the item
  number in the body.
- Do not touch `.ai/bin/`, `tests/`, `docs/specs/`, `.ai/docs/clients.json` - kernel paths stay
  frozen for wave 2A. If an item seems to need a kernel edit, record it as a finding instead.
- Evidence: at the end write your five-label journal entry (Agent / Action / Result / Next step /
  Open) and run `node .ai/bin/protocol-handoff.cjs record --owner <your owner> --quick`. Record in
  the entry: model `gemini-3.8-flash-high`, effort `high` (or what you actually passed), usage from
  your client output or `not exposed`.
- Answers you must honor: `docs/research/2026-09-27-roadmap-queue/PACKET-1.md` (Q1 ACCEPT F-02;
  Q4 baseline+preflight; Q5 done by the operator; Q6 archive yes).

## Items

1. **F-02 close-out** (after Q1). File verdict `ACCEPT` on the F-02 row in
   `docs/research/FRAMES.md` (gate: `docs/research/archive/2026-09-26-model-layer/round2/GATE-REPORT.md`,
   owner answer in PACKET-1.md). Apply the P-L0-008 closure (R-L0-22.56-22.67) to the frame
   directory `docs/research/archive/2026-09-26-model-layer/`: build the artifact set, one disposition per
   artifact (ARCHIVE by default), apply in one commit under the lock, repoint active references,
   append the `CLOSURES.jsonl` line (append-only - never rewrite) and the receipt
   `receipt: CR-F02-1 c3b9b53 K:0 C:0 A:20 D:0 R:0 T:0` on the F-02 row. The closer does
   not certify its own receipt; the wave-1 reviewer checks it afterwards. In the same close-out:
   `docs/ops/MODEL-ECONOMICS.md` - ladder route id `deepseek/deepseek-flash`, effort `max` (Q1:
   "DeepSeek V4.1 Max" = V4.1 Flash at max effort), and close BACKLOG S-5 with its line.
2. **TASK.md refresh** (under the lock; keep `.ai/TASK.md` <= 80 lines). Rewrite "Current state"
   to the 2026-09-27 facts (F-01 CLOSED with CR-F01-1; F-02 per Q1; dispatcher in the tree; product
   on hold under PROTO-DEC-0048). Shrink "Next" to pointers: this program, OPS-1, the Node
   validator. Move the replaced text into `.ai/ARCHIVE.md` (append-only, under the lock).
3. **Prompt templates S-4 and S-10.** S-4: the language rule repeated at the point of use - add it
   to the prompt templates under `templates/` (the last step of the common rules). S-10: "never
   edit an entry after `record`; add a new one" - add it to the vibe client notes in
   `.ai/docs/CLI-AGENTS.md` (section 10 area) and to `templates/`. Update the BACKLOG S-4/S-10
   lines to their new state. Do not touch `.ai/docs/clients.json` (wave 2A scope).
4. *(Cleanup - Q5 - already executed by the operator on 2026-09-27; do not repeat.)*
5. **Journal archive** (after Q6). Under the lock: take the oldest journals with entries and append
   them whole into `.ai/ARCHIVE.md` (append-only), then remove those files from `.ai/worklog/`
   until at most 100 remain (README.md is not a journal). Use `protocol-archive.cjs` where it
   applies. Keep the operator journal `kilo-e1b4dd4a82b08b8e.md` and your own. Check that no open
   reference points to an archived file; note the mapping in your report.
6. **Phase-0 baseline** (after Q4; exclusive workstation runs - first confirm with a process scan
   that no other test or protocol process runs). Read `final-plan-2.md` (archived council:
   `docs/research/archive/2026-09-25-validator-migration-council/final-plan-2.md`, lines ~390-400
   and ~535-543) for the definitions: `Bv` validator wall, `Bs` full-suite wall, `Bn` all-descendant
   process count, `Bm` paired peak process-tree RSS. Measure all four at the current head:
   `powershell -ExecutionPolicy Bypass -File .\validate-protocol.ps1` and `.\test-protocol.ps1`,
   with a sampler for descendants and RSS (`Get-CimInstance Win32_Process`, sample every 1-2 s).
   Commit the numbers, method, machine and timestamps to
   `docs/research/2026-09-27-roadmap-queue/BASELINE.md`. No test run in parallel with your own.

## Deliverables and exit

- One commit per item (1, 2, 3, 5, 6), explicit paths; plus your journal commit.
- `docs/research/2026-09-27-roadmap-queue/W1-EXECUTION.md` (short): per item - commit sha, what
  changed, deviations, open questions; and the archive mapping from item 5.
- Wave-1 exit checks: the validator shows 0 warnings on the journal and corpus caps; `git status`
  clean after your commits. The reviewer statement comes from a separate DeepSeek session; do not
  run it yourself.
