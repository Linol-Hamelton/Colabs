# S1-T08 trial notes: P-L0-001 run on three real procedures

A stage work product, not a kernel record. Author: `claude-eb97ac9d13050014`, 2026-09-24.
Purpose: check that the procedure for making procedures works on live material before any
layer is built on it (CORE-ARCH-2 §8).

## The three records

| Record | Class | Why chosen | File |
|---|---|---|---|
| P-L5-001 Shared documents: one writer | A | a rule that has worked since the first pilot | `P-L5-001-shared-documents.md` |
| P-L2-008 Freeze a candidate | B | a rule that exists only in a decision's Consequences, after measured harm | `P-L2-008-freeze-candidate.md` |
| S-003 Research cycle | D | a change of an older rule (one synthesis → three, then draft and critiques); tests the `scenario` type | `S-003-research-cycle.md` |

## P-L0-001 steps as run

| Step | P-L5-001 | P-L2-008 | S-003 |
|---|---|---|---|
| 1 Intake | trigger: RULE-MAP AR-043 homeless before CA-15; no CATALOG yet, grep over drafts found only plan mentions → new | trigger: 0047 Consequences; grep found the rule only there and in 0046 item 6 → new | trigger: 0052/0053/0055; grep found `PAIRED-CYCLE.md:160` as old version → change (D) |
| 2 Classify, place | A; L5 (defines an artifact's write discipline); DECISIONS and REGISTRY rows point to P-L0-005 | B; L2 (orders work); the commit authorisation belongs to L9 and the root, so R-L2-008.4 is a pointer | D; L2 scenario |
| 3 Dossier | two A events (DEC-0020 pilot, this session's two lock cycles) | two B sources; cost unknown | old version, K1, CA-09..CA-11 and CA-19 as evidence the critique step works |
| 4 Draft | passed the hand lint first time | passed the hand lint first time | **failed** the hand lint: `supersedes` held a path; schema had no form for pre-kernel text → schema 0.4 `legacy:`; then passed |
| 5 Place, LCC | LCC-4 `all`; LCC-5 `TOOL-protocol-lock` pending (stage 4) | LCC-5 `TOOL-protocol-handoff` pending | LCC-4: stage `research` not defined anywhere → schema 0.4 §2.2 stage registry |
| 6 Script test | `no:4` (a holder being gone is judgement), `S~` for the lock script | `no:4`; the mechanical part goes to the package builder (S3-T14) | `no:4` |
| 7-11 | pending: review in S1-T11, owner in S1-T12, landing in stages 3 and 5 | same | same, plus a trial (M-003) |

Back edges: none was taken inside the trial. The step-4 hand-lint failure of S-003 is repaired
inside step 4; it is not the review FAIL of step 7 that the acceptance means. The S1-T08
acceptance "one exercise covers a FAIL and a back edge" is therefore **not met by the three trial
records** (corrected by CA-28; the earlier wording "met for FAIL" overstated it).

Afterwards, the S1-T11 review failed two of the three S1-T09 records produced through the same
P-L0-001 (P-L0-003: CA-25; P-L0-004: CA-24, CA-30, CA-31; P-L0-005 held), and those two went
back from step 7 to step 4:
back edge 7>4, attempt 1. The three trial records themselves were re-anchored in that round
because the CA-24 root cause applied to them too. The owner accepted this as meeting S1-T08
(PROTO-DEC-0056 item 4).

## Gaps found

Each is a `Signal:` line in the journal of `claude-eb97ac9d13050014` (sig-local-4..sig-local-10).

| Gap | What happened | Disposition |
|---|---|---|
| G1 | `protocol-ledger.cjs cover` counts files, so the RULE-MAP acceptance could not run | fixed in plan: a line check replaces it (CORE-ARCH-2 §8); script candidate for stage 6 |
| G2 | no `supersedes` form for pre-kernel text | fixed: schema 0.4 `legacy:<path>:<line>` |
| G3 | no stage-id registry | fixed: schema 0.4 §2.2 |
| G4 | step 1 names CATALOG, which does not exist yet | fixed: P-L0-001 0.4 fallback search |
| G5 | class B cost is `unknown` or `owner=unknown` in all seven B records of stage 1 (corrected by CA-29): nothing in decisions or journals prices an incident | open: cost recording is L6 (M-007, M-008, stage 5) |
| G6 | class A asks "what it saved", which is never recorded | open: same home as G5 |
| G7 | the throwaway lint script lost its escapes once and reported 36 false errors | open: evidence that lint must be a certified script (S1-T10, PROTO-DEC-0047 item 8) |
| G8 | wrong `path:line` citations kept appearing in my own drafts (CA-08, K1 146→144 here) | open: script candidate for `check-links` (exists and non-blank); "says what it claims" stays judgement |

## Result

- The procedure produced three records of three classes and one type it had not seen (scenario)
  with four small repairs to itself or its schema (G1-G4). It did not need a workaround.
- Weakest part: steps 3 and 11 depend on cost and use data nobody records (G5, G6).
- The ten stage-1 records pass the hand lint (scratchpad script, re-run after G7 was fixed).
