# Validator migration council: rules for every participant

Read this file first, then your role file, then the sections of the owner's text your role file
names. Mode: ADVISORY. Talk to the owner in Russian; write documents in English.

## 1. Authority of the texts

- `OWNER-PROMPT.md` in this directory is a byte-for-byte copy of the owner's
  `OwnerIdeas/MIGRATION.md` of 2026-09-25. It is the specification of this council. "§N" in
  every file here means its heading "# N.".
- The role files only distribute its sections among the roles and add what the protocol
  requires. Where a role file and the owner's text differ, the owner's text wins.
- An accepted block in `.ai/DECISIONS.md` outranks both. If one conflicts with them, record the
  conflict (class G, §4) and do not resolve it yourself.
- Two paste artefacts in the owner's text: `<full sha></full>` reads as `<full sha>`, and
  `<DATE></date>-validator-migration-council` is this directory.
- Nothing you write is a decision: PROTO-DEC-0052 item 4, PROTO-DEC-0053 item 2, owner §3 and
  §33. NO IMPLEMENTATION of the new validator in any step (owner §0, "NO IMPLEMENTATION IN THIS
  RUN").
- What binds this council:
  - AGENTS.md;
  - PROTO-DEC-0052 and 0053 (the cycle), 0055 item 5 (model and effort named at launch), 0056
    item 2 (one role per model in a task), 0057 (one task, one frame), 0067 item 1 (route order)
    and 0071 (`record --quick`);
  - P-L2-002 (model selection), which is in trial use.

  The new kernel is not in force yet: `.ai/core/` does not exist, and the L0 records land with
  package I-a. This package borrows practice from drafts that bind nothing: S-003 (the research
  cycle), P-L1-001 (the Orientation line) and P-L1-002 (independence). Where such a draft and a
  binding source differ, the binding source holds.

## 2. Procedure

The council is a research cycle under PROTO-DEC-0052 (three rounds), closed by the four steps of
PROTO-DEC-0053.

| Step | Owner's text | Role file | Output (in this directory) |
|---|---|---|---|
| Round 1, one owner per zone | §22 | `R1-A-contract-tcb.md`, `R1-B-performance-migration.md`, `R1-C-adversarial-simplifier.md` | `round1/` |
| Round 2, challenges | §23 | `R2-challenge.md` | `round2/challenge-{A,B,C}.md` |
| Round 2, the round's one synthesis (0052 item 1, S-003 R-L2-S003.2) | §23 ("ISSUE-MATRIX") | `R2-issue-matrix.md` | `round2/ISSUE-MATRIX.md`, a status per issue |
| Round 3, three independent syntheses (0053 a) | §24 | `R3-synthesis.md` | `round3/synthesis-{A,B,C}.md` |
| Draft decision (0053 b) | §25 | `C-draft.md` | `draft-decision.md` |
| Two critiques (0053 c) | §26 | `C-critique.md` | `critique-{A,B}.md` |
| Final plan (0053 d) | §27-§33 | `C-final-plan.md` | `final-plan.md` |

Alignment with PROTO-DEC-0053, recorded so that nobody has to ask about it:
- the drafter of step (b) is one of the three round-3 synthesisers;
- the critics of step (c) are the two other synthesisers;
- the final plan is written by one of the three.

The owner's text names the Anthropic flagship for (b) and for the final plan, so a fresh session
of that model is one of the three synthesisers. Owner §26 asks for critics "independent of the
drafter": the two other synthesisers are.

Frames (PROTO-DEC-0057). Every step is its own child task frame, `task:vmc-<step>`, with
`parent-scope: program:validator-migration-council`; the README lists them. One model holds one
role within one frame (PROTO-DEC-0056 item 2), so the same model may hold roles in several frames
one after another. For example, synthesiser, drafter and final synthesiser are three frames. Each
step runs in a new session (PROTO-DEC-0056 item 2).

## 3. Start of every session

1. `node .ai/bin/protocol-session.cjs start --agent <name>`, unless a hook already created your
   journal. Use the owner name it prints for your journal and for `record`. The start prints the
   `## Roles` line of `.ai/TASK.md` for your agent name.
   - That line carries a temporary compatibility shim that bridges to frame-aware assignment
     (SCHEMA-assignment, В-12). Inside a research frame, it points you to your launch file.
   - Inside this council, the source of truth for your slot is the README model table together
     with your launch file. It holds for your frame only; standing roles outside it are unchanged.
   - If the start says you are "not among them", your name has no line: stop and tell the owner
     (AGENTS.md section 2).
2. Journal line 1: `Launch: model=<id> effort=<value|unknown> client=<client>`.
   Journal line 2: `Orientation: <model> @ task:vmc-<step> (parent program:validator-migration-council):
   <role> | rights=read, write own files | limits=COMMON section 5 | tools=<what you have> |
   success=<your outputs> | tier=<the README table's tier>`.
   If the model or effort you actually run differs from the README table, write
   `Tier-mismatch: <table> vs <actual>` and ask for a relaunch (P-L2-002 R-L2-002.5, trial).
3. Baseline (owner §2). The owner's launch message names `Baseline: <full SHA>`, one SHA for the
   whole council. If it names none, ask the owner and stop until it is given.
   - Read every path at that SHA: `git show <SHA>:<path>`, or a detached worktree of it under the
     system temp directory, removed when you finish.
   - A later commit may be cited only as `POST-BASELINE OBSERVATION`, and it changes no conclusion
     silently.
4. Every report starts with the owner's §2 header: Baseline-SHA, Model, Model-maker, Client,
   Effort, Task-frame / scope-id, UTC-date. Add `Mode: ADVISORY`.

## 4. Evidence

- Label every claim FACT, INFERENCE, HYPOTHESIS or OPEN QUESTION (owner §22). A FACT about the
  repository carries `path:line` at the baseline. A FACT about time or load carries a row id of
  `MEASUREMENTS.md`, or a measurement of yours recorded as section 5 allows.
- Settled matters are not re-asked (owner §1). An owner question passes the filter of owner §29
  first; zero owner questions is a valid result.
- "Obvious", "rational", "equivalent" or "surely intended" is not authority (owner §1).
- Quote no other report's prose; cite it by `path:line` (PROTO-DEC-0048 item 3).
- A missing report is pending, never agreement (S-003 R-L2-S003.6).

## 5. Limits

- Write only your own files in this directory, your own journal and protocol runtime state (owner
  §3). No edit to validator code, the kernel, tests, the installer, shared documents or
  `OwnerIdeas/`. No commit, tag or push.
- Measurements (owner §6, PROTO-DEC-0071):
  - start from `MEASUREMENTS.md`;
  - do not run `test-protocol.ps1` yourself. If a conclusion needs a fresh full-suite run, write
    the exact command and why as an OPEN QUESTION. The coordinator runs it once, alone on the
    workstation, and adds it to `MEASUREMENTS.md`;
  - single `validate-protocol.ps1` runs and read-only `git` and `node` commands are allowed.
- End with a complete five-label journal entry (Agent, Action, Result, Next step, Open), then
  `node .ai/bin/protocol-handoff.cjs record --quick --owner <your owner name>` (PROTO-DEC-0071).
- More than five minutes with no reading, writing or reasoning is a stall (PROTO-DEC-0049 item 3).
- Write a `Signal:` line in your journal for every procedure gap you meet: `procedure-gap`,
  `script-candidate` or `fall` (PROTO-DEC-0051; the signals ledger does not exist yet).
- Never write keys, tokens or passwords.

## 6. Independence

- Within a round, open no other participant's output of that round until your own is finished.
  Then write in your journal the sha256 of your file and the words "did not open the other <round>
  outputs before this" (PROTO-DEC-0052 item 2).
- One model holds one role in a frame (PROTO-DEC-0056 item 2). Every step is its own frame
  `task:vmc-<step>`, with parent-scope `program:validator-migration-council`.
- A session that wrote `docs/core-arch/PROPOSAL-node-validator.md` or this package takes no part in
  the council (the precedent of PROTO-DEC-0053 item 3). The proposal is an input to test, not a
  decision.

## 7. Sizes

Prompts in this package are capped at 150 lines, and prose reports at 250 (PROTO-DEC-0038 item 3).
The owner's data artefacts are tables, not prose, and are not capped: DECISION-BOUNDARY,
VALIDATOR-CALL-GRAPH, VALIDATOR-CONTRACT-MAP, IMPLEMENTATION-DAG and NOT-IN-SCOPE. `final-plan.md`
has the 29 sections of owner §28; its length is the owner's to accept (the cap is
owner-tunable).
