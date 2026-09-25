# Re-check report before owner approval: CORE-ARCH stage 1 (DeepSeek)

- Reviewed commit SHA: `4ded1bee1c2acf2392fdeededf50935f59138302`; tree dirty; no commit in any pass.
- Reviewer: DeepSeek, owner `deepseek-e37eab7bb9169627`, client Kilo; model `deepseek/deepseek-flash`
  (v4.1), reasoning effort `unknown` as launched (P-L2-002; the tier table is `table-pending`).
- Date: 2026-09-24 (UTC). Mode: ADVISORY - stage-1 reviewer and controller (PROTO-DEC-0054); certifies
  nothing in the program (PROTO-DEC-0055 item 3).
- Scope: `docs/reviews/2026-09-24-claude-core-arch-stage1-recheck-prompt.md`, rows R1-R6.
- **Verdict: RECOMMENDATION.** All four last-pass fixes hold; PROTO-DEC-0060 holds item by item. Five
  new LOW defects (CA-36..CA-40) are appended to the ledger; none is mandatory, none blocks the owner
  package (PROTO-DEC-0060 item 1).
- Labels: FACT carries a `path:line` I opened; CLAIM/HYPOTHESIS where marked.
- Commands run: `git rev-parse --show-toplevel`, `git status --short --branch`, `git log --oneline -10`,
  `node .ai/bin/protocol-session.cjs start --agent deepseek`, `Get-Content`/`Select-String` over the
  named drafts, repo-wide searches (old `R-L2-08` form; disuse wording; `R-L0-20`/`R-L0-21`),
  `node .ai/bin/protocol-verdict.cjs docs/reviews/2026-09-24-core-arch-stage1-findings.md --stop-rule`
  (PASS), `protocol-handoff.cjs record` at the end.

## R1 - the fixes of the last pass (CA-32..CA-35)

- FACT CA-32 fixed. `TRIAL-NOTES.md:20` reads `R-L2-008.4 is a pointer`; `P-L2-008:38-44` defines
  `R-L2-008.1..4`, and `.4` forwards authorisation to P-L9-001 and root R-L0-07. A repo-wide search
  finds the old `R-L2-08` form only in historical reviews, ledger row CA-32 and the archive.
- FACT CA-33 fixed. `TRIAL-NOTES.md:32-36` now counts two failed records (`P-L0-003: CA-25;
  P-L0-004: CA-24, CA-30, CA-31; P-L0-005 held`), matching the ledger; the `7>4, attempt 1` sentence
  matches PROTO-DEC-0056 item 4. This is the second and last attempt of RC-CA-gap-count, and it holds.
- FACT CA-34 fixed in its three named places: `CORE-ARCH-1.md:313-314` (0057 numbers, navigation
  index, one frame, CA-13 closed), `CORE-ARCH-3.md:121-122` (`Решено PROTO-DEC-0057 пп.3-4`),
  `.ai/TASK.md:60` (no pending phrase). A residue of the same class remains in section 9: CA-36.
- FACT CA-35 fixed. `P-L0-004:49` now describes CORE-ARCH-1 section 6.3 as it is ("first had the
  strict form ... was aligned to this row (CA-30) and now points here"); `CORE-ARCH-1.md:246` carries
  the forward-reference exception and `:253-254` names P-L0-004 the home. The quoted sentence survives
  in no current text. This is the second and last attempt of RC-CA-lcc2-divergence, and it holds.
  Same table, a rendering defect: CA-40.

## R2 - PROTO-DEC-0060 against the owner words and the registry

- FACT item by item against the quote at `.ai/DECISIONS.md:2441`: re-check (item 1); the three-batch
  disuse rule rejected, a procedure for retire-or-improve candidates, a procedure for A/B testing a
  retirement candidate, and A/B/C after the kernel work with "2-3 tasks, one model, a clone" (item 2);
  `.ai/core/` (item 3, `:2429`); persisted synthesis (item 4, `:2430`). The item 1 parenthetical
  (CA-32..CA-35, two of them attempt 2) matches the findings ledger.
- FACT the registry row `docs/decisions/REGISTRY.md:79` matches the block: accepted, owner-directive,
  baseline `4ded1be`, supersession "none".
- FACT the consequences are in the tree: the disuse trigger is gone from P-L0-001 0.5, schema 0.6,
  root 0.4 and CORE-ARCH-2; P-L0-006/P-L0-007 exist as stage-1 L0 records; `CORE-ARCH-7.md:156-157`
  adds the A/B/C test to the program exit.

## R3 - retirement by disuse removed; class E

- FACT a repo-wide search for the disuse wording and for "three batches" finds only PROTO-DEC-0060's
  own rejection text and the records that state disuse is not a reason; no trigger, threshold or
  `last_applied`-based retirement remains.
- FACT class E now needs the P-L0-006 finding and the P-L0-007 result: `L0-ROOT.md:113-117` (R-L0-20,
  R-L0-21; evidence `:135`), `P-L0-001.md:85-86` (step 3) and `:115-120` (step 11),
  `procedure.schema.md:73`, `CORE-ARCH-2.md:89-91`, `:99`, `:248`, `:316-317`.

## R4 - P-L0-006 and P-L0-007 (full review)

- FACT schema by hand: both carry every `yes` key of a procedure; the conditional keys match class C
  at `status: draft`; the eight headings are present and in order; P-L0-006 `back_edges: []` with its
  "None" prose, P-L0-007 `5>3/1/owner` with matching prose.
- FACT anchoring: `R-L0-20.1..20.4` hang on root R-L0-20; `R-L0-21.1..21.5` on root R-L0-21; no other
  record defines those ids.
- FACT evidence: `PROTO-DEC-0060`, `0050`, `0051`, `0039` item 2g (`.ai/DECISIONS.md:1708`) and `0047`
  item 11 (`:1985`, paired A/B on one frozen SHA in worktrees). Trial metrics exist: `M-008`
  (`CORE-ARCH-6.md:141`), `M-003` (`:136`) - the second does not fit: CA-39.
- FACT authority and loops: coordinator proposes, owner decides every retirement (`P-L0-006:40`);
  reviewer judges, owner decides (`P-L0-007:43-46`); no loop without a budget and an exit.
- FACT owner A/B/C wording: "A the new kernel, B the old kernel, C no kernel at all"
  (`P-L0-007:30-33`); "two or three tasks ... one model ... in a clone" (`:37-40`). Additions beyond
  the quote - same effort, blinding where files allow, the "not worse" decision rule - are declared
  and do not contradict it.

## R5 - the persisted external synthesis

- FACT form: `external-synthesis.md:1` = `> Transcribed from chat by claude-eb97ac9d13050014 on the
  owner's instruction (PROTO-DEC-0060 item 4), model: not named by the owner (external synthesis),
  date: 2026-09-24`. `AGENTS.md:255` requires the transcriber, a model and an ISO date; the model
  field carries an explanation, not a model name.
- CLAIM wording and verbatimness are not checkable from the repository: I cannot see the chat; per the
  prompt, this pass checks form and references only.
- FACT the citing files point at it: `CORE-ARCH-1.md:34` (source E) and `:40-41` ("Вопрос В-1
  закрыт"); `P-L0-002.md:93` (Evidence C); the file carries "Part 1" and "Part 2". Residue:
  CORE-ARCH-1 section 9 still poses В-1 - CA-36.

## R6 - the owner package

- FACT `S1-SUMMARY.md:7-21` versions match the front matter of every listed record (root 0.4, schema
  0.6, P-L0-001 0.5, P-L0-002 0.4, P-L0-003 0.2, P-L0-004 0.3, P-L0-005 0.1, P-L0-006 0.1, P-L0-007
  0.1; P-L2-002 0.3, P-L3-002 0.2); the root defines 21 rules; RULE-MAP has 60 rows and no `out`.
- FACT the exit-criteria rows match the tree: owner approval open; the kernel row is honestly
  "частично" - `git status` shows the PROTO-DEC-0057 protected-path changes (validator, tests,
  `AGENTS.md` section 8, PAIRED-CYCLE, template).
- Finding: the open-question list omits В-12 and В-13, which `CORE-ARCH-3.md:214-216` still lists
  open - CA-37.

## New findings appended to the ledger

| id | severity | defect | anchor |
|---|---|---|---|
| CA-36 | LOW | plan text keeps В-1 and В-5 open and says "Остальные вопросы открыты" after PROTO-DEC-0060 closed them (CA-34 class, second instance) | CORE-ARCH-1.md:315, :317-318, :324-325 vs :40-41; DECISIONS.md:2429-2430 |
| CA-37 | LOW | the owner package's open-question list omits В-12 and В-13 | S1-SUMMARY.md:61-62 vs CORE-ARCH-3.md:214-216 |
| CA-38 | LOW | a record's own draft label and fix-round list lag its version | P-L0-001.md:25 vs :3, :171-177 |
| CA-39 | LOW | P-L0-007's trial metric (M-003, certification rounds per batch) cannot measure its kill criterion | P-L0-007.md:18 vs CORE-ARCH-6.md:136 |
| CA-40 | LOW | CORE-ARCH-1 section 6.3's LCC table is split by a paragraph; LCC-8/LCC-9 fall out of the table | CORE-ARCH-1.md:251-256 |

Existing rows untouched; `protocol-verdict.cjs --stop-rule` passes.

## Owner items

- CA-36 is attempt 2 of RC-CA-plan-sync: if the next fix does not hold, it goes to the owner, not to a
  third fix (PROTO-DEC-0046 item 4). CA-37..CA-40 are attempt 1.
- Open program questions are the package's list plus В-12/В-13 (CA-37).
- CA-12, CA-13 and the transcription readings are closed by PROTO-DEC-0056/0057; the T3 question by
  0056 item 3. Nothing else is open.

## Verdict

**RECOMMENDATION**: CA-32..CA-35 hold, PROTO-DEC-0060 holds, the two new procedures hold against
their schema, anchoring, evidence, loops and authority, and the owner package reads true except for
CA-37. Stage 1 goes to the owner for approval (PROTO-DEC-0060 item 1) with CA-36..CA-40 open as LOW.
