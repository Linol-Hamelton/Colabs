# Round 1, researcher B: performance, test architecture, migration

- Frame `task:vmc-r1-b`, parent-scope `program:validator-migration-council`. Your one role: researcher, owner of zone B (owner §22 "Researcher B").
  Read `prompts/COMMON.md` first; it binds you.
- Your model and effort are in the README model table (P-L2-002; the owner approves the table once). Round-1 researchers are of different makers (owner §22).

## Your sections of the owner's text

§6 (reuse measurements), §8 (root-cause performance analysis), §9 (the central architectural
question and its alternatives), §14 (quick versus full validation), §15 (implementation DAG), §16
(module decomposition), §17 (public API), §18 (performance targets), §19 (migration phases), and
the "Researcher B" focus in §22. Read §0-§3 and §33 as well; they bind every role.

## Required inputs

All at the baseline, more than 15 files:
- `validate-protocol.ps1`, `test-protocol.ps1`, `tests/helpers.cjs` and every `tests/*.test.cjs`;
- `.ai/bin/protocol-handoff.cjs`;
- `MEASUREMENTS.md` and `docs/core-arch/PROPOSAL-node-validator.md`;
- `.ai/DECISIONS.md`: PROTO-DEC-0025, 0039 and 0071.

## Outputs, all under `round1/`

1. `B-performance-migration.md`, the prose report (at most 250 lines):
   - §8: every question answered from `MEASUREMENTS.md` and repository evidence, with the
     fractions §8 asks for where the data allows them and "not measured" where it does not.
     No pseudo-precision.
   - §8 item 4 asks about 2, 3, 6 and 8 concurrent agents. One and three concurrent suites are
     measured; 6 and 8 are INFERENCE from them, labelled so. Any fresh run goes through COMMON
     section 5.
   - §9: alternatives A to D, and E only if evidence gives a reason, each on the fourteen criteria.
   - §14: what `--quick` proves and does not prove. PROTO-DEC-0071 already settles it for
     research frames (COMMON section 5), so answer for the other task classes.
   - §16 and §17: the minimum decomposition and the API and CLI contract.
   - §18: baseline, target, why it matters, measurement method and fail threshold, separating
     the required threshold from the stretch target.
   - §19: the phases, each with the seven properties §19 lists.
2. `IMPLEMENTATION-DAG.md`, per §15: one row per future task with the fields §15 lists, and one
   owner per shared integration surface. This is a round-1 draft; the final DAG is in the final
   plan.

## Do not

- Derive the behavioural contract or the decision boundary yourself: zone A owns them. Before you
  propose an architecture, list in a short section of your report the decisions and constraints
  your proposal relies on, each in a class of §4.
- Treat `docs/core-arch/PROPOSAL-node-validator.md` as settled: it is one input.
- Open `round1/A-*` or `round1/C-*` before your two files are finished (COMMON section 6).
