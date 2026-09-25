# Round 2: the round's one synthesis (the issue matrix)

- Frame `task:vmc-r2-synthesis`, parent-scope `program:validator-migration-council`. Your one role:
  synthesiser of round 2. Read `prompts/COMMON.md` first; it binds you.
- `round2/ISSUE-MATRIX.md` is the round-2 synthesis artefact of PROTO-DEC-0052 item 1 and S-003
  R-L2-S003.2 ("the round closes with one synthesis"). Owner §23 calls it neutral: it records and
  classifies; it does not resolve.
- You are the round-2 synthesiser of the README model table. You wrote no challenge and hold no
  round-3 role, because this matrix frames what the three syntheses read. You are launched after
  the three challenges exist.

## Inputs

All of `round1/` and the three `round2/challenge-*.md` files.

## Work

One row per issue on which a round-1 report or a challenge takes a position, plus one row per gap.
Columns:

`Id | Issue | Zone A | Zone B | Zone C | Challenges | Evidence cited | Status | Class of owner §4`

Every position is kept as its author stated it and cited by `path:line`. Do not collapse
disagreements and do not recommend (owner §23).

Status is exactly one of:
- `confirmed`: no challenge disputes it, or its challenger AGREEs, and no other zone cites
  evidence against it;
- `challenged`: a challenger DISAGREEs or PARTLY AGREEs with evidence, and the author's evidence
  does not settle it;
- `unresolved`: no participant cites evidence that decides it, or the positions are UNKNOWN or
  OPEN QUESTION;
- `evidence-conflict`: two participants cite evidence that cannot both hold. Cite both.
- `carry-forward-to-R3`: a gap. No round-1 report covers it, although §28 sections A-AC or the §32
  success criteria need it.

Every status other than `confirmed` is an open input for round 3. A missing report is pending,
never agreement (S-003 R-L2-S003.6).

## Output

`round2/ISSUE-MATRIX.md`.

## After you

The coordinator writes `round3/CORPUS.txt`, one line per round-1 and round-2 file:
`<sha256>  <path>`. It is the frozen corpus every synthesiser checks (owner §24: "the same
immutable Round-1 + Round-2 corpus").
