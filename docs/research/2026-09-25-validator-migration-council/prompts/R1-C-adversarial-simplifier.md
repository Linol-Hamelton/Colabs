# Round 1, researcher C: adversary and simplifier

- Frame `task:vmc-r1-c`, parent-scope `program:validator-migration-council`. Your one role: researcher, owner of zone C (owner §22 "Researcher C").
  Read `prompts/COMMON.md` first; it binds you.
- Your model and effort are in the README model table (P-L2-002; the owner approves the table once). Round-1 researchers are of different makers (owner §22).

## Your sections of the owner's text

The "Researcher C" goal and questions in §22, alternative A of §9 (keep the PowerShell engine
and optimise the tests), §21 (what not to migrate yet), and §33 (the acceptable outcomes include
"optimise without migration" and "keep current timing"). Read §0-§3 as well; they bind every role.

## Target

Try to falsify the migration as `docs/core-arch/PROPOSAL-node-validator.md` states it. Test the
central hypothesis of §9 as well. Answer every question of the §22 list for zone C, with
evidence. In particular:
- whether 80-90% of the benefit comes from something simpler, such as test splitting, in-process
  calls without a rewrite, `--quick` where it is valid, or running the full suite less often. Use
  `MEASUREMENTS.md`, and state what each simpler step would not fix, for example cloud Evidence;
- what a new validator could silently stop checking;
- where differential parity gives false confidence;
- which failure is common to both engines' tests.

## Required inputs

All at the baseline:
- `docs/core-arch/PROPOSAL-node-validator.md` and `MEASUREMENTS.md`;
- `validate-protocol.ps1` and `tests/helpers.cjs`;
- `.ai/DECISIONS.md`: PROTO-DEC-0025, 0039 and 0071.

Read more wherever a claim needs it.

## Outputs, all under `round1/`

1. `C-adversarial-simplifier.md`, the prose report (at most 250 lines).
2. `NOT-IN-SCOPE.md`, per §21: every item §21 lists, as NOW, LATER or NEVER / NO EVIDENCE, with
   the reason for each.

## Do not

- Argue from taste: evidence and reproduction count (owner §27). A risk you cannot back is a
  HYPOTHESIS.
- Open `round1/A-*` or `round1/B-*` before your two files are finished (COMMON section 6).
