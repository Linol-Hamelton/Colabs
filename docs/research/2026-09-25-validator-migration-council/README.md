# Validator migration council (research, 2026-09-25)

The owner's research and decision-design cycle on the migration of `validate-protocol.ps1`.
There is no implementation in this cycle. The specification is `OWNER-PROMPT.md`, a
byte-for-byte copy of the owner's `OwnerIdeas/MIGRATION.md`. This package only does four things:
- splits the specification into role files of at most 150 lines (PROTO-DEC-0038 item 3);
- aligns its steps with PROTO-DEC-0052, PROTO-DEC-0053 and S-003;
- assigns models by P-L2-002;
- records the measurements already taken.

## Files

| File | For | Content |
|---|---|---|
| `OWNER-PROMPT.md` | everyone, by the sections their role names | the owner's full text; it wins over every other file here |
| `prompts/COMMON.md` | everyone, read first | authority, frames, procedure map, start, evidence, limits, independence, sizes |
| `prompts/R1-A-contract-tcb.md` | round-1 researcher A | decision boundary, call graph, contract map, TCB, parity, PowerShell boundary, cloud, rollback |
| `prompts/R1-B-performance-migration.md` | round-1 researcher B | root cause, architectures, quick/full, modules, API, targets, phases, DAG |
| `prompts/R1-C-adversarial-simplifier.md` | round-1 researcher C | falsification, simpler alternatives, not-in-scope |
| `prompts/R2-challenge.md` | three challengers | the fifteen questions of owner §23, per proposal |
| `prompts/R2-issue-matrix.md` | the round-2 synthesiser | `round2/ISSUE-MATRIX.md`, the round's one synthesis, with a status per issue |
| `prompts/R3-synthesis.md` | three synthesisers | the fourteen answers of owner §24 |
| `prompts/C-draft.md`, `C-critique.md`, `C-final-plan.md` | PROTO-DEC-0053 steps b, c, d | draft decision, two critiques, `final-plan.md` (sections A-AC) |
| `MEASUREMENTS.md` | everyone | 16 measured rows with methods; the evidence owner §6 says to reuse |
| `tools/ps-probe.cjs` | the coordinator | the spawn probe behind M-05 to M-10 |

## Frames (PROTO-DEC-0057: one task, one frame)

The parent research scope is `program:validator-migration-council`. Every step is its own child
task frame with `parent-scope: program:validator-migration-council`:
- `task:vmc-r1-a`, `task:vmc-r1-b`, `task:vmc-r1-c`;
- `task:vmc-r2-a`, `task:vmc-r2-b`, `task:vmc-r2-c`, `task:vmc-r2-synthesis`;
- `task:vmc-r3-a`, `task:vmc-r3-b`, `task:vmc-r3-c`;
- `task:vmc-draft`, `task:vmc-critique-a`, `task:vmc-critique-b`, `task:vmc-final`.

One model holds one role within one task frame (PROTO-DEC-0056 item 2), so the same model may
hold roles in several frames, one after another. For example, one Anthropic model is synthesiser
A, then drafter, then final synthesiser, as PROTO-DEC-0053 steps a, b and d expect.

Inside the council, the source of truth for who holds which slot is this table together with the
launch file. `## Roles` in `.ai/TASK.md` only carries a temporary compatibility shim that points
each agent name to its launch file. That shim bridges to frame-aware assignment (SCHEMA-assignment,
В-12); it is not a source of truth.

## Roles and models (P-L2-002, trial)

Scoring. The six factors of P-L2-002 step 2 are scored with the conventions of trial S2-T07
(`docs/core-arch/stage-2/trial/P-L2-002-rubric-trial.md`), so that anyone who recomputes gets the
same numbers:

| Factor | Convention |
|---|---|
| Size (Sz) | the files in the "Inputs" or "Required inputs" section of the frame's role file, counting the frozen corpus of `round3/CORPUS.txt` as its 12 files (8 of round 1, 4 of round 2): 3 or fewer is 0, 4-15 is 1, more than 15 is 2 (S2-T07 signal S-4, row 8) |
| Protected paths (Pr) | the frame's subject: validator, gate and `.ai/` code is 2 (row 9); only the council's own reports is 1 (row 8) |
| Novelty (No) | new analysis without precedent is 2; a challenge or critique of an existing text is 1 (rows 8, 9) |
| Reversibility (Rv) | 0: documents in a git repository (signal S-5) |
| Ambiguity (Am) | 3 or more open questions, or conflicting sources, is 2; otherwise 1 |
| Coupling (Cp) | a subject that spans the validator, tests, handoff tooling and the installer is 2; the council's own reports is 1 |

- Frames with the same function over the same input get the same scores. That holds for the three
  round-3 syntheses, and likewise for the three challenges and for the two critiques. No tier is
  raised or lowered by hand.
- Choice within a tier (P-L2-002 step 5, delegated to the coordinator): take the first maker, in
  the row order of the tier table of `MODEL-MATRIX.md`, that satisfies the constraints below.

Constraints:
- **(i)** Distinct makers within a round (owner §22, §24).
- **(ii)** A challenger is of another maker than the author of its target (owner §23).
- **(iii)** A model different from the previous step's models, where one exists (R-L2-002.3).
- **(iv)** The Anthropic flagship is a round-3 synthesiser, because it drafts and writes the final
  plan (owner §25, §27; PROTO-DEC-0053 steps b, d).
- **(v)** The critics are the two other synthesisers, as the same models (PROTO-DEC-0053 step c).
  If the computed tier had no cell of that model, the effort would come from the model's nearest
  cell at or above that tier. Here it has: the critiques compute to T7.
- **(vi)** The round-2 synthesiser wrote no challenge and holds no round-3 role.
- **(vii)** No session that wrote the proposal or this package takes part.

| Frame | Sz Pr No Rv Am Cp = sum | Tier | Model / effort (client, agent name) | Constraint that decided |
|---|---|---|---|---|
| r1-a | 2 2 2 0 2 2 = 10 | T8 | claude-fable-5-1 / high (claude, `claude`) | first maker |
| r1-b | 2 2 2 0 2 2 = 10 | T8 | gpt-6-astra / xhigh (codex, `codex`) | (i) |
| r1-c | 1 2 1 0 2 2 = 8 | T6 | gemini-3.1-pro / high (agy, `gemini`) | (i) |
| r2-a (target A) | 1 2 1 0 2 2 = 8 | T6 | gpt-5.6-sol / max (codex, `codex`) | (ii) not Anthropic; (iii) |
| r2-b (target B) | 1 2 1 0 2 2 = 8 | T6 | claude-opus-5-5 / xhigh (claude, `claude`), a fresh session | (ii) not OpenAI; (iii) |
| r2-c (target C) | 1 2 1 0 2 2 = 8 | T6 | deepseek-flash-4.1 / unknown (Kilo, `deepseek`) | (ii) not Google; (i) |
| r2-synthesis | 1 1 1 0 1 1 = 5 | T4 | gemini-3.1-pro / low (agy, `gemini`) | (vi): sol and opus wrote challenges |
| r3-a | 1 2 2 0 2 2 = 9 | T7 | claude-fable-5-1 / medium (claude, `claude`) | (iv) |
| r3-b | 1 2 2 0 2 2 = 9 | T7 | gpt-6-astra / high (codex, `codex`) | (i), (iii) |
| r3-c | 1 2 2 0 2 2 = 9 | T7 | gemini-3.8-flash / low (agy, `gemini`) | (i), (iii) |
| draft | 1 2 2 0 2 2 = 9 | T7 | claude-fable-5-1 / medium (claude, `claude`) | (iv) |
| critique-a | 2 2 1 0 2 2 = 9 | T7 | gpt-6-astra / high (codex, `codex`) | (v): synthesiser B; correctness, TCB, security |
| critique-b | 2 2 1 0 2 2 = 9 | T7 | gemini-3.8-flash / low (agy, `gemini`) | (v): synthesiser C; simplicity, performance |
| final | 2 2 2 0 2 2 = 10 | T8 | claude-fable-5-1 / high (claude, `claude`) | (iv) |

- The Anthropic flagship of owner §25 and §27 comes out of the computation: T7 and T8 are
  claude-fable-5-1 cells. Owner §25's "highest appropriate effort under P-L2-002" is read as the
  effort of the computed tier.
- A zone author may later synthesise (r1-a and r3-a are the same model). PROTO-DEC-0052 allows it,
  as in the remediation-mapping cycle.
- Floor (PROTO-DEC-0072, closing В-24): the T7 floor follows what the current frame does, not the
  purpose its result may later serve. Every council frame writes advisory research artefacts only
  and changes no candidate kernel record, kernel code or protocol tooling, so no council frame takes
  the floor. The rubric sets its tier.
- Quotas: the improvement research uses sol, gemini-3.1-pro and deepseek-flash, among others. If a
  client's limit binds, start round 1 after those researchers finish.

PROTO-DEC-0052 item 1 and PROTO-DEC-0053 item 1 leave naming the participants to the owner. The
owner named them by approving this table on 2026-09-25.

## Launch

In the table's client, with its model and effort set at launch, send one line:
`Read and follow the file docs/research/2026-09-25-validator-migration-council/prompts/<file>.md`

Add to the same message:
- every step: `Baseline: <full SHA>`, the same SHA for the whole council;
- a challenge: `Target: <A|B|C>`;
- a synthesis: `Slot: <A|B|C>`;
- a critique: `Slot: <A|B>`.

Pre-launch gate. No live run of the council before all three hold:
1. DeepSeek's second pass on package L has a non-blocking verdict. The `## Roles` shim is in its
   scope.
2. The role preflight passes for every agent name in the table (`claude`, `codex`, `gemini`,
   `deepseek`):
   - `node .ai/bin/protocol-session.cjs start --agent <name>` prints a role line pointing to the
     council, and not "Ask the owner before starting work";
   - only the journal and runtime file the preflight created are removed afterwards.
3. `node docs/research/2026-09-25-improvement-research/prompts/launch-test.cjs` exits 0, and so
   does `launch.cjs --check`.

Canary. Round 1 starts with r1-a alone. Once its journal shows the Launch and Orientation lines,
and its session start printed its council role, start r1-b and r1-c. Each later step starts only
when the previous step is complete.

- Evidence: `record --quick` (PROTO-DEC-0071), so concurrent participants do not run the full suite.
- Route (PROTO-DEC-0067 item 1): the maker's CLI first, as in the table. If that CLI is
  unavailable, use Kilo on a route that reaches the table's effort (R-L3-004.3). This council has
  no launcher: the owner launches each step in its client.
- Permissions: PROTO-DEC-0070 grants its flags to the improvement research only. Launch the council
  interactively, with the client's own approvals, or with the narrow grants of PROTO-DEC-0047
  item 7. A broader non-interactive grant needs an owner authorisation.

## Relation to other work

- Inputs: PROTO-DEC-0025 item 5, PROTO-DEC-0039 item 3, PROTO-DEC-0071, and
  `docs/core-arch/PROPOSAL-node-validator.md`. The proposal is a proposal, and this council tests
  it.
- `OwnerIdeas/RISK_COUNCIL.md` (the kernel risk council) is a separate, larger cycle. Its H-TCB-01
  asks this council's §10 question for every TCB component. The intended link: this council
  answers it for the validator, the first component to be replaced, and its final plan becomes an
  input to H-TCB-01. The owner decides the risk council's timing.
- The improvement research and the stage-2 review run in parallel. The two-stream limit of
  PROTO-DEC-0048 item 7 does not apply to research.

## Status

| Step | State |
|---|---|
| Round 1 | done 2026-09-25, baseline a4e6aef. Owner override: r1-a ran deepseek-flash-4.1 (Kilo, `deepseek`), not claude-fable-5-1 (no Fable credits); recorded in its journal. The outputs are frozen in the commit that adds `round1/` |
| Round 2 | dispatched by a Kilo operator: `prompts/K-dispatch-r2.md` with `tools/r2-dispatch.cjs`. Owner override: r2-a runs grok-4.5 / high (copilot, `grok`), not gpt-5.6-sol / max, for cost; same tier T6. r2-b runs its table cell through Kilo (`kilo/anthropic/claude-opus-5.5` xhigh), because the claude CLI shares the coordinator's limit (PROTO-DEC-0067 fallback) |
| Round 2 result | done 2026-09-25: `round2/challenge-{A,B,C}.md`, `round2/ISSUE-MATRIX.md`; the frozen corpus is `round3/CORPUS.txt` |
| Round 3, closing | owner decision of 2026-09-25, verbatim in `OWNER-DECISION-R3.md`, read through `prompts/R3-ADDENDUM.md`: a second question, F-3P-1 of package L, answered in a separate Part 2 of every step; Fable 5.1 through Kilo (`kilo/anthropic/claude-fable-5.1`) for r3-a, the draft and the final plan, measured in `round3/FABLE-USAGE.md`; a new closing step e, `prompts/C-verify.md`, an independent verifier of another family (kimi-k2.7-code / high, copilot, `kimi`; implementer's choice by the owner's criteria: a family with no earlier part in this council). Dispatched by `prompts/K-dispatch-r3.md` and `tools/r3-dispatch.cjs`, which waits for Kilo balance before each Fable step |
