# Independent review r2: CORE-ARCH stage 1 fix round (CA-24..CA-31, CA-S2) and addendum A1-A4 (DeepSeek)

- Reviewed commit SHA: `4ded1bee1c2acf2392fdeededf50935f59138302`; tree dirty; no commit in any pass.
- Reviewer: DeepSeek, owner `deepseek-16f781043961697d`, client Kilo; model `deepseek/deepseek-flash`
  (v4.1), reasoning effort `unknown` as launched (P-L2-002 R-L2-002.5; the T3 question is closed by
  PROTO-DEC-0056 item 3).
- Date: 2026-09-24 (UTC). Mode: ADVISORY - stage controller and reviewer (PROTO-DEC-0054); certifies
  nothing in the program (PROTO-DEC-0055 item 3).
- Scope: `docs/reviews/2026-09-24-claude-core-arch-stage1-t07-t10-fix-response.md` - the nine rows
  CA-24..CA-S2, widened where a fix depends on unchanged text; addendum A1-A4. Ledger rows only for
  open causes (PROTO-DEC-0049 item 1).
- **Verdict: RECOMMENDATION.** The three mandatory rows and all five lesser rows are fixed and
  reproduced; four LOW defects remain (CA-32..CA-35). Nothing mandatory is open.
- Labels: FACT carries a `path:line` I opened; CLAIM/HYPOTHESIS where noted.
- Commands run: `git rev-parse --show-toplevel`, `git status --short --branch`, `git log --oneline -10`,
  `node .ai/bin/protocol-session.cjs start --agent deepseek`, `validate-protocol.ps1` (exit 0,
  "Protocol OK. 0 warning(s)"), `node --test --test-name-pattern=C40-07 tests/validator.test.cjs`
  (4/4 pass), three scratch scripts outside the repository (anchoring over ten records + P-L2-002;
  packet byte sums; stale-reference scans), `Select-String`/`Get-Content` reads,
  `protocol-verdict.cjs --stop-rule`, `protocol-handoff.cjs record` at the end.

## 1. Mandatory rows: CA-24, CA-25, CA-26

- FACT CA-24, fixed as a class. `L0-ROOT.md:110-111` defines R-L0-19; `P-L0-004:37-39` uses
  R-L0-19.1..3; `procedure.schema.md:103-109` defines the anchor per layer (in L0 the root rule, whose
  sub-rules a procedure's rules are; elsewhere the record's own id); `SPEC-protocol-core.md:43-44` adds
  F9 and `:45-47` maps F9 to exit 2. My script over the ten records: 64 rule ids, each defined once,
  none unanchored; on a negative sample the same logic flags `R-L0-29.1` (no root rule). The trial
  records carry `R-L5-001.k` (`P-L5-001:36-40`), `R-L2-008.k` (`P-L2-008:38-44`), `R-L2-S003.k`
  (`S-003:36-43`).
- FACT CA-25, fixed. `P-L0-003:35-40` defines R-L0-03.1..03.4 only; `R-L0-03.5` survives nowhere as a
  rule (repository search: change log `P-L0-003:86`, historical reviews and the archive only). Step 3
  (`:48-50`) already covers two accepted blocks that conflict.
- FACT CA-26, fixed. `procedure.schema.md:38-42` states the one exit rule; `SPEC-protocol-core.md:45-47`
  gives the identical split (F2/F3/F7/F8 -> 1; F1/F4/F5/F6/F9 -> 2); unknown keys are inside F1
  (`SPEC:29-30`); the §5 table (`schema:183-188`) matches the rule, `roles: certifier` -> 2. The old
  "type error exits 1" and the uncoded unknown-key case are gone.

## 2. Lesser rows: CA-27..CA-31

- FACT CA-27. The corrected LCC line is in `.ai/ARCHIVE.md:7952-7995` (entry "Fix round for the
  S1-T11 review..."), because the journal kept only its newest entry (`claude-eb97ac9d13050014`, the
  0057 entry) when the session recorded again. It names packet and rule: LCC-8
  "root+P-L0-001+P-L0-004+schema 34,897 of 40,000 B"; my byte sum reproduces 34,897 exactly
  (6,712+11,992+4,883+11,310) and root 6,712 of 8,000. LCC-2 lists exactly the downward references I
  find in the six L0 records: `ROLE-<slot>` (`L0-ROOT.md:115`), `TOOL-protocol-core/-index/-ledger`
  (`P-L0-001:13`), `M-001` (`P-L0-001:20,157`; `P-L0-004:18,78`), `M-002` (`P-L0-002:19,93,100`); no
  P-L2/L5/L7/L9 id. Two notes, neither a defect: the fix-response pointer "journal ..., newest entry"
  now lands on the 0057 entry, not the LCC entry; the pre-change figure 49,495 B is not reproducible
  on the current tree (the same packet under the old rule now sums 49,956 B; 49,495 was measured
  before R-L0-19 existed).
- FACT CA-28. `TRIAL-NOTES.md:27-30` records that the S1-T08 back-edge acceptance is not met by the
  three trial records and that "met for FAIL" overstated it; `:32-36` records the S1-T11 FAIL sending
  P-L0-003/P-L0-004 back step 7 -> step 4 (back edge 7>4, attempt 1). The question it leaves to the
  controller was closed by PROTO-DEC-0056 item 4. Residue: CA-33.
- FACT CA-29. `TRIAL-NOTES.md:48` now says "all seven B records of stage 1"; the seven are
  `L0-ROOT:14`, `schema:8`, `P-L0-001:17`, `P-L0-002:16`, `P-L0-003:16`, `P-L0-005:17`, `P-L2-008:17`,
  each `cost_basis: unknown` or `owner=unknown`. Correct.
- FACT CA-30. `CORE-ARCH-1.md:247` now carries the same forward-reference exception as
  `P-L0-004:49`, and `:254-255` names P-L0-004 the home of the nine checks. Residue in the note: CA-35.
- FACT CA-31. `P-L0-004:54` LCC-7 covers R-L0-03..R-L0-08; `CORE-ARCH-1.md:252` lists the same range.
- Residues found this round (rows CA-32..CA-35): `TRIAL-NOTES.md:20` still names `R-L2-08.4`, an id no
  record defines (`P-L2-008` defines `R-L2-008.4`); `TRIAL-NOTES.md:32` says the review "failed three
  S1-T09 records" where it failed two and P-L0-005 holds; `P-L0-004:49` still says CORE-ARCH-1 §6.3
  "states the strict form", which the aligned `:247` no longer does and whose quoted sentence appears
  nowhere in CORE-ARCH-1.

## 3. CA-S2: the loading rule (accepted)

- FACT schema and plan agree: `procedure.schema.md:144-152` = `CORE-ARCH-7.md:97-100`: root full;
  records whose `roles` name the slot and whose `stages` name the stage or `any`, full; schemas in
  their `inputs`, full; `roles: [all]` and everything else at summary, an `all` record opened in full
  when its trigger fires.
- FACT budget: the procedure-author packet (root + P-L0-001 + P-L0-004 + schema) is 34,897 B <= 40,000
  (`CORE-ARCH-2.md:212`); it is also the largest L0 packet - reviewer and coordinator add no other
  full record - and the root is 6,712 B <= 8,000. Under the old rule the same records sum 49,956 B, so
  the loading change is what brings L0 under budget.
- Answer to whether it hides anything a role needs: no. Summary carries `roles`, `stages`, `triggers`,
  `status` (`schema:141`), every `all` record keeps its trigger tokens visible, the always-loaded root
  names where to go for each L0 trigger (`L0-ROOT.md:115-117`), and reading is never forbidden
  (R-L0-09). The dependency the rule creates is explicit and covered: CATALOG rows must carry
  `triggers`, which the catalog command does (`SPEC:54`).

## 4. Addendum A1: transcription of PROTO-DEC-0056 and 0057 (holds; notes, no defect)

- FACT item by item: 0056 items 1-5 (`DECISIONS.md:2302-2307`) and 0057 items 1-5 (`:2332-2337`) each
  restate the owner words quoted in their `Approved by` lines (`:2318`, `:2348`): step (b), executors
  not brands, rotation, one role per model per task, deepseek-flash 4.1, CA-28, raise-not-archive, the
  three confirmed readings, one task = one frame, never certify, 200 files / 2 MB / 100 journals.
- Notes only: 0056 item 2 states the owner's premise ("each task runs in a new terminal") as practice
  from a conditional sentence; item 3's "the stage-1 passes stand" is the transcriber's reading of
  "сильная модель" (the context question it answers); 0057 item 5's placement in package I-a is not
  in the quote. The 0056 Consequences already list the two questions 0057 items 3-4 answered.
- FACT registry: `REGISTRY.md:75-76` are the two new rows and match the blocks; the validator reports
  63 entries, no row-modification warning, exit 0.

## 5. Addendum A2: P-L2-002 model selection (holds)

- FACT schema 0.5 by hand: every `yes` key of `procedure`, `cost_basis` (class B) and `trial` (status
  trial) present; the eight headings in order (`P-L2-002:28-121`); `roles: [coordinator, owner]` in the
  L1 slot catalog (`CORE-ARCH-3.md:62-63`); `stages: [triage, dispatch]` in the schema registry
  (`schema:93`); back edge `7>5/1/owner` with its prose (`:101`); rules R-L2-002.1..6 anchored to the
  record's own id; `M-007` exists (`CORE-ARCH-6.md:140`). `status: trial` matches the owner
  instruction quoted at `P-L2-002:24-26` (= `DECISIONS.md:2305`).
- FACT tier-map sources: flags from PROTO-DEC-0047 item 9 (`DECISIONS.md:1983`); model ids from
  PROTO-DEC-0043 Context (`:1849`); the DeepSeek row from the owner quote and review headers
  (`docs/reviews/2026-09-24-deepseek-core-arch-stage1-control.md:7`). Non-*proposal* cells are
  traceable; *proposal* cells are declared for re-measurement in S4-T02.
- Note: `P-L2-002:111` "(PROTO-DEC-0056, pending this transcription)" reads stale now that 0056 is
  written; harmless while the trial stands.

## 6. Addendum A3: the raised caps (verified)

- FACT `validate-protocol.ps1:251-253` warns when journals exceed 100; `:256-299` warns when active
  `docs/reviews/` exceeds 200 files or 2 MB; both WARN-first. My byte scan: 0 non-ASCII bytes in the
  `.ps1`.
- FACT the four places agree with PROTO-DEC-0057 item 5 (`DECISIONS.md:2337`): `AGENTS.md:392-393`,
  `.ai/docs/PAIRED-CYCLE.md:187` (guardrail 8), `templates/ai/ARCHIVE.md:30`, the validator above.
- FACT tests: fixtures 201 files (`tests/validator.test.cjs:511`), 205 archived excluded (`:522`),
  2100 KB (`:533`), 205 files outside a junction (`:568`); the four C40-07 tests pass; the validator on
  this tree: exit 0, 0 warnings.

## 7. Addendum A4: plan text (two places hold, one finding)

- FACT `CORE-ARCH-4.md:66-69` and `CORE-ARCH-3.md:202` (row 7a) state the PROTO-DEC-0057 item 2 order:
  reviewer -> certifier; certifier PASS approves; FAIL/RECOMMENDATION goes to the owner; kernel work
  goes to the owner after the reviewer.
- FACT `CORE-ARCH-1.md:314` and `CORE-ARCH-3.md:121-122` still say the cap numbers/navigation and the
  one-task/separate-task questions await the owner, and `.ai/TASK.md:60` says "numbers and the
  navigation index pending", after PROTO-DEC-0057 items 3-5 answered them (`DECISIONS.md:2335-2337`).
  This is CA-34.

## 8. Findings appended to the ledger

| id | severity | defect | anchor |
|---|---|---|---|
| CA-32 | LOW | a reference to a renamed rule id survives the re-anchoring | TRIAL-NOTES.md:20 vs P-L2-008:38-44 |
| CA-33 | LOW | a stage record states a count the tree does not show (CA-29 class, 2nd) | TRIAL-NOTES.md:32 vs findings CA-24/25/30/31 |
| CA-34 | LOW | plan text repeats what PROTO-DEC-0057 has already answered | CORE-ARCH-1.md:314; CORE-ARCH-3.md:121-122; TASK.md:60 |
| CA-35 | LOW | the deviation note describes a CORE-ARCH-1 text that no longer exists (CA-30 class, 2nd) | P-L0-004:49 vs CORE-ARCH-1.md:247, :254-255 |

Existing rows were not rewritten; `protocol-verdict.cjs --stop-rule` passes.

## Verdict

**RECOMMENDATION**: CA-24, CA-25 and CA-26 are fixed and independently reproduced; CA-27..CA-31 hold
with the four LOW residues above; CA-S2 is sound against CORE-ARCH-2 §6 and CORE-ARCH-7 §6 and hides
nothing a role needs; A1, A2 and A3 hold. CA-32..CA-35 get one more targeted fix each
(PROTO-DEC-0046 item 4); none of them blocks S1-T12, to which stage 1 now goes with these rows open.
