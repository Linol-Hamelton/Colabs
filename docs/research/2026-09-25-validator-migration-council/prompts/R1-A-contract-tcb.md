# Round 1, researcher A: semantics, contract, trusted computing base

- Frame `task:vmc-r1-a`, parent-scope `program:validator-migration-council`. Your one role: researcher, owner of zone A (owner §22 "Researcher A").
  Read `prompts/COMMON.md` first; it binds you.
- Your model and effort are in the README model table (P-L2-002; the owner approves the table once). Round-1 researchers are of different makers (owner §22).

## Your sections of the owner's text

§4 (decision boundary), §5 (source corpus, call graph, contract map), §7 (behavioural contract),
§10 (TCB and self-hosting), §11 (differential verification design), §12 (the PowerShell-specific
boundary), §13 (cloud and cross-platform contract), §20 (rollback), and the "Researcher A" focus
in §22. Read §0-§3 and §33 as well; they bind every role.

## Required inputs

The corpus of owner §5, at the baseline, and `MEASUREMENTS.md`: more than 15 files.

## Outputs, all under `round1/`

1. `DECISION-BOUNDARY.md`, per §4: every relevant issue in exactly one class, A to H, with the
   block and item or the `path:line` that puts it there.
   - Inspect at least the topics §4 lists.
   - PROTO-DEC-0025 item 5 and PROTO-DEC-0039 item 3 are the starting points for "Node or not" and
     "when".
   - PROTO-DEC-0071 settles quick versus full Evidence for research frames only; code and kernel
     changes keep the full `record`.
2. `VALIDATOR-CALL-GRAPH.md`, per §5: every code path that invokes `validate-protocol.ps1`,
   duplicates its behaviour, parses its output or exit codes, or calls PowerShell only to reach
   validation logic. Start from `git grep` at the baseline. Code comments that state a parity by
   hand are part of the graph.
3. `VALIDATOR-CONTRACT-MAP.md`, per §7: one row per behaviour, with the eight fields §7 lists,
   covering at least the list in §7. Mark each row NORMATIVE, ACCIDENTAL or CURRENT DEFECT. For a
   defect, say whether fixing it during the migration would confound the equivalence test.
4. `A-contract-tcb.md`, the prose report (at most 250 lines):
   - the TCB question of §10, answered explicitly: which of the §10 mechanisms the migration
     needs, and why the others are not needed;
   - the parity design of §11, with its fixture classes and its normalisation rules;
   - the PowerShell boundary of §12, with a decision per operation;
   - the environment matrix of §13;
   - the rollback answers of §20;
   - the hidden semantic dependencies you found.

## Tools

- `node .ai/bin/protocol-index.cjs` writes an index into `.ai/runtime/`: which decision blocks
  name a given path. It points at blocks and restates none, and it is never Evidence. On a hash
  mismatch, read `.ai/DECISIONS.md` itself (AGENTS.md section 9).
- `git grep` at the baseline for the call graph; `git ls-files` for the inventory (AGENTS.md
  section 3).

## Do not

- Propose the target architecture as your conclusion: that belongs to zone B, and zone C tests
  it. Record the architectural constraints your contract implies.
- Open `round1/B-*` or `round1/C-*` before your four files are finished (COMMON section 6).
