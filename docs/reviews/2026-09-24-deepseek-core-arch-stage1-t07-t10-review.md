# Independent review, fourth pass - CORE-ARCH stage 1, S1-T07..S1-T10 and the L0 LCC (DeepSeek)

- Reviewed commit SHA: `4ded1bee1c2acf2392fdeededf50935f59138302`; tree dirty; no commit in any pass.
- Reviewer: DeepSeek, owner `deepseek-1e398b568bb78796`, client Kilo; model `deepseek/deepseek-flash`,
  reasoning effort `unknown` as launched (the T3 question, still open).
- Date: 2026-09-24 (UTC). Mode: ADVISORY - stage controller and reviewer (PROTO-DEC-0054); certifies
  nothing in the program (PROTO-DEC-0055 item 3).
- Scope: `docs/reviews/2026-09-24-claude-core-arch-stage1-t07-t10-review-prompt.md` - RULE-MAP (S1-T07),
  the trial (S1-T08), P-L0-003/004/005 (S1-T09), the SPEC (S1-T10), the L0 LCC (S1-T11).
- **Verdict: FAIL.** Three mandatory reproduced defects (CA-24, CA-25, CA-26) and five lesser confirmed
  defects (CA-27..CA-31). Everything else checked holds.
- Labels: FACT carries a `path:line` I opened; CLAIM/HYPOTHESIS where noted.
- Commands run: `git rev-parse --show-toplevel`, `git status --short --branch`, `git log --oneline -10`,
  `node .ai/bin/protocol-session.cjs start --agent deepseek`, `git show 4ded1be:.ai/DECISIONS.md`,
  `git show 4ded1be:AGENTS.md`, three `node` scratch scripts (RULE-MAP line check; rule-id/back-edge/LCC-9
  scan; packet byte sums) written outside the repository, `Select-String` and `Get-Content` reads,
  `protocol-handoff.cjs record` at the end.

## 1. RULE-MAP coverage (check 1)

FACT `docs/core-arch/stage-1/RULE-MAP.md:19-80` - I re-ran the line check (my own script, not the
author's): 60 rows parsed, 326 non-blank non-heading non-`---` lines of `AGENTS.md`, **uncovered 0,
multi-covered 0**; layer counts L0 17, L1 4, L2 18, L3 2, L5 9, L7 5, L9 5 match RULE-MAP.md:84.
Line 43 lies in AR-009 alone. Note: `AGENTS.md` has 467 lines, not the 468 claimed at RULE-MAP.md:5
(trivial; every range ends inside the file).

Spot-checks against the layer test of P-L0-001:72-77, 14 rows:

| Row (lines) | Home | Verified in |
|---|---|---|
| AR-004 (18-26) | L0 R-L0-03 | root :47-48 carries the ranking; holds for every role - correct |
| AR-008 (39-42) | P-L0-005 | R-L0-18.1 = AGENTS.md:39-42 - correct |
| AR-013 (56-71) | ASSIGNMENT-GRAMMAR, L1 | CORE-ARCH-3:77-99; D,E (0049 item 2, 0054 item 3) - correct |
| AR-014 (73-75) | P-L1-001, L1 | CORE-ARCH-3:23 - correct |
| AR-015 (77-79) | ROLE-implementer, L1 | CORE-ARCH-3:64 - correct |
| AR-018 (91-103) | P-L2-004 + R-L0-05 | CORE-ARCH-4:39 - correct |
| AR-020 (107-108) | P-L7-001, L7 | CORE-ARCH-7:17-29; class B (268-line incident) - correct |
| AR-022 (127-131) | ROLE-certifier, L1 | CORE-ARCH-3:66 (all four capabilities) - correct |
| AR-042 (258-263) | TOOL-protocol-ledger, L3 | stage 4 S4-T05 covers TOOL records - correct |
| AR-047 (327-346) | P-L2-010 + TOOL-validate | CORE-ARCH-4:45 - correct |
| AR-052 (378-379) | P-L3-001 new, L3 | CORE-ARCH-5:126-134 policy; record id is new - correct |
| AR-053 (385-408) | P-L5-002, L5 | CORE-ARCH-6:123 - correct |
| AR-059 (445-455) | P-L9-002 new, L9 | CORE-ARCH-7:90 names encodings; record id is new - correct |
| AR-060 (461-467) | L0 R-L0-07 | root :66-69 - correct |

No row that should be `out` or `E` is marked `A`; AR-013 is the only D/E row, AR-016 the only pointer.
The four `**new**` homes are declared as unplanned (RULE-MAP.md:12, :89-91).

## 2. The three new L0 procedures (check 2)

FACT - hand-check against `procedure.schema.md` 0.4 (:41-121): P-L0-003, P-L0-004 and P-L0-005 each
carry every `yes` key of their type, the conditional keys (`cost_basis` in 003/005, `enforced_by` in
005), the eight body headings in order, valid back-edge forms and registry-clean
`inputs`/`outputs`/`stages`/`roles`. 3/3 pass.

FACT - P-L0-005 against its named sources: R-L0-18.1..18.5 match `AGENTS.md:39-47`, `:48-49`,
`:306-309`, `:311-321` and the blocks PROTO-DEC-0030 (:1425) and PROTO-DEC-0033 (:1520-1524) with no
substance added or dropped. R-L0-18.6 (`P-L0-005:49-50`) goes beyond those four sources; it is backed
by the record's own class-B evidence (CA-12) and closes the measured transcription class, which
P-L0-001 step 3 allows. The 18.3 wording "never appears in a new block" reconciles `AGENTS.md:48`
with the immutable historical blocks. No defect; the "no more" reading is answered by the class-B line.

FACT - `P-L0-003:41-42` R-L0-03.5 ("within one rank, a more specific record does not override a
general one by itself") appears nowhere else in the repository (repo-wide search); the record's
evidence (`:17`, `:71-75`) is the ranking rule, K3/K4 and the eight-round failure class, none of
which states it. A new normative rule inside a record classed A and B - **CA-25, mandatory**.

FACT - P-L0-004 against CORE-ARCH-1 §6.3: eight of the nine checks carry over. LCC-2 diverges -
`CORE-ARCH-1:247` makes a reference down to another layer's rule a defect; `P-L0-004:48` passes it
when "declared as a forward reference with its stage", and the deviation is not recorded anywhere
(**CA-30**). LCC-7 (`:53`) guards only R-L0-04..R-L0-08; L0-ROOT's invariants section also carries
R-L0-03 (`L0-ROOT.md:45-48`) (**CA-31**). And `P-L0-004:36-38` defines R-L0-19.1..R-L0-19.3 while
**no record defines the root rule R-L0-19**: L0-ROOT.md defines R-L0-01..R-L0-18 only, and it already
anchors R-L0-17 for P-L0-001, R-L0-18 for P-L0-005 and R-L0-03 for P-L0-003 (**CA-24, mandatory**).
The LCC line cannot see this: LCC-1 checks duplicates, LCC-9 checks RULE-MAP rows.

## 3. The trial (check 3)

FACT - the three records follow P-L0-001's steps and carry their dossier elements: P-L5-001:61-66
(two class A events), P-L2-008:70-77 (class B incident, cost, class closure), S-003:84-91 (class D
old version, difference, why worse); each carries metric, kill and deadline in `trial:`. The step
table in TRIAL-NOTES.md:17-25 matches the records. The hand-lint claim was re-checked independently:
the ten stage-1 records pass schema 0.4 (keys, headings, grammar, `legacy:` and back-edge forms).

- Back edges: TRIAL-NOTES.md:27-30 is accurate that none was taken. "Met for FAIL" is overstated:
  the step-4 hand-lint failure (:22) is repaired inside step 4 and is not the step-7 review FAIL /
  back edge 7>4; steps 7-11 are pending (:25), so the S1-T08 acceptance (CORE-ARCH-2:266) is met
  for neither half yet - **CA-28**.
- G1 real: `cover` mirrors corpus files, one row per file, records as path mirrors
  (`protocol-ledger.cjs:101-117`); it cannot count lines of a document.
- G2, G3, G4 real and visibly closed: schema 0.4 `legacy:` (:66) and stage registry (:86-90);
  P-L0-001 0.4 fallback (:68-69).
- G5 real, but the count at TRIAL-NOTES.md:42 is wrong ("three of four B records"): seven records
  carry class B (`L0-ROOT.md:14`, `procedure.schema.md:8`, `P-L0-001:17`, `P-L0-002:16`,
  `P-L0-003:16`, `P-L0-005:17`, `P-L2-008:17`) and every one carries `cost_basis: unknown` or
  `owner=unknown` - **CA-29**.
- G6 real (class A "what it saved" is nowhere recorded; P-L5-001:61-66 states the events only).
- G7 real in the journal (claude-eb97ac9d13050014:26 "fixed after it lost its regex escapes once").
- G8 real: CA-08 and the K1 146->144 self-correction are in the same journal (:22-24); CA-08 is in
  the findings ledger (:19).

## 4. The specification (check 4)

FACT - form: the four conditions of spec §1 (`docs/specs/2026-09-23-executable-rulebook-spec.md:30-39`)
are stated at SPEC-protocol-core.md:10-17; every PROTO-DEC-0047 item 8 element is present in SPEC
section 3 (:78-87); the not-mechanised list (:19-20) matches spec:41-50. Inputs are repository state;
no network, no model.

- Judgement leaks: LCC-2 (`P-L0-004:48`) passes a down reference "declared as a forward reference
  with its stage", but no field or place for that declaration exists, so `lcc` cannot check it
  mechanically; `check-links --design` (SPEC:60-62) needs "the stage that owns its id (from
  CORE-ARCH stage tables)" and no machine-readable ownership table exists. Each needs a fixed form
  or must go back to the reviewer's hand.
- Exit codes are consistent across the four commands (0 pass, 1 defect, 2 unknown/unparseable), but
  lint's F2 clashes with the schema it enforces: `procedure.schema.md:38` makes a missing required
  key exit 2, `SPEC-protocol-core.md:42` puts F2 - the same class - in exit 1; `schema:38` ("a type
  error exits 1") also contradicts the schema's own example `:165` (`roles: certifier` -> 2); and
  the spec's F-list leaves unknown keys - exit 2 at `schema:38` - without a code - **CA-26, mandatory**.

## 5. LCC re-run (check 5)

Re-ran seven checks of the author's LCC line (journal claude-eb97ac9d13050014:28-34):

- LCC-1 **confirmed**: script scan of the seven L0 files finds 50 defined rule ids, zero duplicates.
- LCC-2 **partially refuted**: the conclusion is defensible, the stated evidence is not - no
  `P-L2/L5/L7/L9` id occurs in any L0 record (search over the six files); the actual downward
  references are TOOL-* (`P-L0-001:13`) and M-001/M-002 (`P-L0-001:20`, `P-L0-002:19`,
  `P-L0-004:18`). P-L0-004's M-001 says "until L6 defines it" without the stage P-L0-001:157 and
  P-L0-002:94 carry - **CA-27**.
- LCC-4 **confirmed**: every slot used by L0 records (`all`, procedure-author, reviewer, coordinator)
  exists in CORE-ARCH-3 §3 (:58-75); L1 pending is declared.
- LCC-6 **confirmed**: forms parse as `<from>><to>/<budget>/<exit>`; `P-L0-001:14` =
  {5>2/1/owner, 7>4/2/owner, 9>4/1/retire, 11>1/1/owner}; prose matches (:137-144, P-L0-004:69-72).
- LCC-7 **confirmed as a result** (no record lets an agent break R-L0-04..R-L0-08), with the scope
  gap of CA-31.
- LCC-8 **partially refuted**: the root figure 6,356 B (:33) is exact, but 38,207 B is not
  reproducible: the only subset of the stage-1 files summing to it is
  L0-ROOT+schema+P-L0-001+P-L0-002+P-L0-004; the packet rule (CORE-ARCH-7:97-101) gives 37,655 B
  (root + the five L0 procedures, `all` counted), and no composition is documented - **CA-27**.
- LCC-9 **confirmed**: the 17 L0-homed RULE-MAP rows each have an L0 record (script listing);
  none is `out`.

## 6. Citations (check 6)

All 17 `path:line` items in the evidence fields of the six new records were opened; every one is
within its file and non-blank, and each supports its claim: AGENTS.md:28, :39, :269, :306, :311;
PROCEDURE-MAP.md:144 (K1), :148 (K2), :150 (K3), :153 (K4); DISCUSSION.md:46 (eight rounds), :85
(meta-root phrase); CORE-ARCH-1.md:240; findings:20 (CA-09), :30 (CA-19); PAIRED-CYCLE.md:160
(S-003 legacy). Two notes, neither blank nor unsupporting: CORE-ARCH-1.md:240 is the §6.3 heading
(the nine checks follow at :244-254) - a section pointer, not a content line; and P-L0-005:80's
"46 committed blocks" is exact (`git show 4ded1be:.ai/DECISIONS.md` has 46 decision blocks).

## Findings appended to the ledger

| id | severity | defect | anchor |
|---|---|---|---|
| CA-24 | MEDIUM | R-L0-19 has no root rule | P-L0-004:36-38; L0-ROOT.md:107-114 |
| CA-25 | MEDIUM | R-L0-03.5 is an unsourced new rule in an A/B record | P-L0-003:41-42, :17 |
| CA-26 | MEDIUM | lint exit codes conflict schema vs SPEC; unknown keys have no code | schema:38; SPEC:42 |
| CA-27 | LOW | LCC-8 figure unreproducible; LCC-2 evidence misdescribes the id families | journal:28-34 |
| CA-28 | LOW | "met for FAIL" overstates; no review FAIL or back edge exercised | TRIAL-NOTES:22, :27-30 |
| CA-29 | LOW | "three of four B records" contradicts the tree (seven, all unknown) | TRIAL-NOTES:42 |
| CA-30 | LOW | LCC-2 softens CORE-ARCH-1 §6.3 without a note | CORE-ARCH-1:247; P-L0-004:48 |
| CA-31 | LOW | LCC-7 scope omits R-L0-03, an L0 invariant | P-L0-004:53; L0-ROOT.md:47-48 |

Existing ledger rows were not rewritten; `protocol-verdict.cjs --stop-rule` applies.

## Owner items (unchanged)

- CA-12 and CA-13: decision blocks are immutable; the owner confirms or corrects, with the Gemini
  acknowledgment (PROTO-DEC-0055 item 3).
- Transcription readings: PROTO-DEC-0054 items 1 and 4, PROTO-DEC-0055 item 5.
- T3 question: every pass so far ran on `deepseek/deepseek-flash`, effort unknown.

## Verdict

**FAIL**: CA-24, CA-25 and CA-26 are mandatory, reproduced defects in the stage deliverables, and
the LCC line that should have caught two of them does not. The fixes are targeted edits (add the
missing root rule or re-anchor the rules; source R-L0-03.5 or reclassify it with a trial; align the
lint exit codes across schema and spec) plus the LOW items CA-27..CA-31. Everything else in
S1-T07..S1-T10 and the LCC re-run holds; the stage returns with these eight rows.
