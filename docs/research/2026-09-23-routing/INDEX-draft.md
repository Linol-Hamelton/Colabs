# INDEX draft - coordinator working notes (2026-09-23, deepseek)

Not a deliverable. Working notes for the final `INDEX.md` after all 13 documents carry both
primary and challenge. Kept in the repository per owner instruction.

## Pending set (verified against this directory at 2026-09-23T06:38Z)

Existing (9 of 13): Q01, Q02, Q05, Q06, Q08, Q09, Q10, Q11, Q12.
Missing primaries (Gemini, gated on batch remediation step C): Q03, Q04, Q07, Q13.
Pending challenges: Mistral on Q03 and Q07; Copilot on Q04; Gemini on Q01, Q08 and Q09;
DeepSeek on Q13 after Gemini's primary lands.
Completed pairs: Q02, Q05, Q06, Q10, Q11, Q12.

## Cross-cutting finding (reached independently by Q05, Q06, Q11 and Q12)

The measurement layer is not reliable enough for ratings, coefficients or calibration.

Numbers, cited as a snapshot with its timestamp (the metrics file appends a row at every
Stop, so any live count ages immediately):
- `.ai/runtime/metrics/sessions.jsonl`, snapshot 2026-09-23T06:38Z (challenge round):
  77 rows over 26 distinct sessions = 2.96x stop-event overcounting; 30 rows with null
  `firstEditMs`; 60 of 77 rows belong to Claude; zero rows for Mistral.
- R0 dataset (`docs/research/2026-09-23-r0-decision-dataset/`): 3 review-depth rows and
  5 round outcomes, against the 150-200 per surface that Jev calibration needs.

## Label discipline (meta-finding)

A `MEASURED` label without a measurement is itself a finding. Instances from this round:
- Q11's succession table is labelled MEASURED while its challenge shows no measurement
  behind it (Q11 section 11).
- Q02's primary attributes a 7/7 figure to `.ai/DECISIONS.md:1789` where no such wording
  exists, and cites `.ai/DECISIONS.md:1884` for a rule that lives at AGENTS.md:153 (Q02
  section 11).
- Q10's primary states inventory counts (120+ / ~50 / ~50) against measured 307 / 866 /
  593 / 45, and its five secondary-repository citations all point at lines that say
  something else or at facts absent from the file (Q10 section 11).

## Remaining chain (coordinator, 2026-09-23; rebuilt from the assignment table)

State update 2026-09-23T~09:00Z: Codex slot 1 landed (FAIL, ten findings C01-C10, report
copied into the shared tree; corpus mirrored to 57); Claude slot 2 was already FAIL; the
union fix round (one round, Gemini) is running with both reports as inputs; the ledger
docs/reviews/2026-09-23-batch-findings.md and the first real protocol-verdict.cjs run are
part of that round.

Assignment table (primary / challenger) with state at 2026-09-23T06:55Z:
- Q01 DeepSeek / Gemini - primary done; challenge pending (Gemini).
- Q02 Copilot / DeepSeek - complete.
- Q03 Gemini / Mistral - pending both.
- Q04 Gemini / Copilot - pending both.
- Q05 DeepSeek / Copilot - complete.
- Q06 Copilot / Mistral - complete.
- Q07 Gemini / Mistral - pending both.
- Q08 Copilot / Gemini - primary done; challenge pending (Gemini).
- Q09 Mistral / Gemini - primary done; challenge pending (Gemini).
- Q10 Mistral / DeepSeek - complete.
- Q11 Mistral / Copilot - complete.
- Q12 DeepSeek / Mistral - complete.
- Q13 Gemini / DeepSeek - pending both.

Chain:
1. Codex retry on `b232a9e` at 11:36 local; collect its report; union its findings with
   Claude's round-2 findings.
2. One remediation round C, implementer Gemini (ledger
   `docs/reviews/2026-09-23-batch-findings.md`, `protocol-verdict.cjs` run;
   RC-immutability-boundary attempt 2/2 last; RC-ledger-parse attempt 1).
3. As soon as C is handed off (Gemini reports), run IN PARALLEL:
   a. freeze the result (new commit) and re-certify with Codex + a fresh Claude session in
      separate worktrees at that SHA; copy both reports into the shared tree;
   b. Gemini's research primaries **Q03, Q04, Q07, Q13** and its challenges on
      **Q01, Q08, Q09**. Research writes only under `docs/research/2026-09-23-routing/`;
      Gemini pauses research only if re-certification returns a finding that needs it.
4. Dispatch the remaining challenges as their primaries land: **Mistral on Q03 and Q07**,
   **Copilot on Q04**, DeepSeek on Q13.
5. Before writing INDEX: verify against the directory that each of the 13 questions carries
   both a primary and a challenge.
6. Write the final `INDEX.md` from this draft: one row per question with recommendation,
   owner forks and quoted open disagreements; no synthesis, no decision.

