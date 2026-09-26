Mode: ADVISORY
Baseline: reviewed commits f965cde, 566debf, e68bc58, b929ba9 (frozen corpus 7b6d17a); working tree status: dirty (untracked journals only)
Reviewer: MiMo-V2.6-Pro (`xiaomi/mimo-v2.6-pro`, `--variant high`), route `mimo` CLI, effort high, 2026-09-26
Scope: critique of PLAN-DEEPSEEK.md (stage 4, critic B; independent; CRITIQUE-KIMI.md not opened)
Verdict: CONFIRM_WITH_CHANGES

# Critique of PLAN-DEEPSEEK.md (MiMo)

Frame `task:ownerideas-r5-mimo-critique`. Advisory only: nothing here is a decision (AGENTS.md §2).
Claude resolves. Labels: [F] fact with `path:line` or decision id; [I] inference; [Q] open question.

## 1. Coverage matrix (check 1)

| Corpus ID | Plan section | Present | Traceable |
|---|---|---|---|
| A-1..A-14 | `PLAN-DEEPSEEK.md:108-313` | 14/14 | yes, by ID |
| R-1..R-7 | `PLAN-DEEPSEEK.md:321-399` | 7/7 | yes, by ID |
| Task one DIG | `PLAN-DEEPSEEK.md:21-42` | yes | method stated |
| Five packages / D6 | `PLAN-DEEPSEEK.md:83-99` | yes | streams mapped |
| D1 waves | `PLAN-DEEPSEEK.md:71-81` | yes | order follows PLAN-AMENDMENT |

[F] No active or research ID is missing. The plan does not invent extra A/R items.

## 2. BLOCKING findings

| # | Severity | Plan cite | Evidence | Change requested |
|---|---|---|---|---|
| B1 | BLOCKING | `PLAN-DEEPSEEK.md:347-348` | [F] Plan R-3 gate says "H-WAI-2..5 stay frozen", while PROTO-DEC-0080 item 1 lifts PROTO-DEC-0076 item 4 **for exactly one frame: R-3** and says only "All other frozen hypotheses stay frozen" (`DECISIONS.md:3437-3444`). [F] RESOLUTION:388 lists H-WAI-3 as R-3's own question and names the freeze as the block; the plan's own expected output still promises "evidence on the H-WAI hypotheses" (`PLAN-DEEPSEEK.md:358`) and "EXPERIMENT for the hypotheses" (`:360-361`). As written, the gate forbids the work the plan schedules. | Rewrite the gate: H-WAI-2..5 are unfrozen **inside R-3 only**; outside R-3 the freeze stands. Keep "no new hypotheses outside R-3". |
| B2 | BLOCKING | `PLAN-DEEPSEEK.md:30-37` | [F] R-L0-22.41: DIG counts **accepted** items not yet implemented. [F] The plan counts 14 but admits "A-11 needs a small owner decision before its code" (`:35-36`); RESOLUTION:373 marks A-11 Needs **D**, then I. A-11 has no accepted decision block. The baseline number feeds DIG_FLOOR (R-L0-22.44) and the ratchet (R-L0-22.45). | Report DIG = 13 on accepted blocks; list A-11 beside DIG as pending-decision (same honesty pattern as DEFERRED_ACCEPTED, R-L0-22.42). Do not silently inflate the baseline. |
| B3 | BLOCKING | `PLAN-DEEPSEEK.md:73-77` vs `:88-94` | [F] D1 wave 1 S2 runs A-12 and A-6 (`:75`); package table puts A-12 in PKG-5 "Wave 2-3" (`:94`) and A-11 in PKG-2 "Wave 2" (`:91`) while D1 places A-11 in wave 3 (`:77`). Two different start waves for the same items. [F] A-13 and A-14 appear only in the package table (`:90-91`) and in no D1 wave row. | One source of truth for start order: either expand the D1 table to every A-id or mark A-13/A-14 as folds with an explicit wave, and align A-11/A-12 waves across both tables. |
| B4 | BLOCKING | `PLAN-DEEPSEEK.md:206-208` | [F] Plan A-6 dependency: "the next stage-2 fix round, or this program's PKG-4, whichever runs first (PROTO-DEC-0075 Consequences)". [F] PROTO-DEC-0075 Consequences say "the next stage-2 fix round or in the stage-4 dispatch script, whichever the owner schedules first" (`DECISIONS.md:3178-3182`), not PKG-4. PKG-4 **contains** A-6 (`PLAN:93`), so the stated dependency is circular. | Cite 0075 as written: stage-2 fix round **or the kernel dispatch script (A-3 / PKG-2)**, whichever the owner schedules first. A-6 does not wait on its own package. |

## 3. RECOMMENDATION findings

| # | Severity | Plan cite | Evidence | Change requested |
|---|---|---|---|---|
| R1 | RECOMMENDATION | `PLAN-DEEPSEEK.md:377-381` | [F] Plan R-5 = "Stream 1, **minor**". [F] `FRAMES.md:52` already records candidate C-R5 as **major**. Size is an admission field (R-L0-22.8, R-L0-22.13) and changes the per-stream major slot (R-L0-22.24). | Align: either mark R-5 major in the plan, or record why minor is correct and correct FRAMES.md at admission. |
| R2 | RECOMMENDATION | `PLAN-DEEPSEEK.md:317-341` | [F] R-L0-22.13 requires five admission fields (decision dependent, one primary question, alternatives, budget, exit condition). [F] Each R-item has question/gate/inputs/output/stop criteria but **not** alternatives and **not** a budget (participants, rounds, deadline). [F] Only F-02 is marked "admission pending" (`FRAMES.md:24`); the plan does not say admission is pending for R-1..R-7. | Per R-item, add alternatives + budget, or an explicit `admission: PENDING (five fields at README)` line. Frames stay CANDIDATE until the row is admitted (R-L0-22.12). |
| R3 | RECOMMENDATION | `PLAN-DEEPSEEK.md:75-78`, `:32-33`, `:198`, `:237` | [F] R-L0-22.9 defines S2 as "model and task routing (schemas, profiles, calibration)". [F] The plan renames S2 to "model/task routing and records" and places A-5 (signals ledger, `.ai/SIGNALS.md`, kernel records) and A-2 (L0 source rule) on S2. Domain fit is S1 (kernel/runtime). [I] The move looks like capacity balancing for D6, not stream semantics. | Either justify the S2 extension in one sentence (records capacity) or move A-2/A-5 to S1 and rebalance the packages. Do not silently widen a P-L0-008 stream definition. |
| R4 | RECOMMENDATION | `PLAN-DEEPSEEK.md:343-349` | [F] RESOLUTION:161-164 keeps "reviewer precision against recall" and "verification strength as routing variable" as R-3 inputs; the plan's R-3 inputs list only the four seed files (`:349`). A plan-only reader can drop them. | Name both minority inputs in the R-3 inputs bullet (or an explicit sub-bullet "kept inputs from RESOLUTION 3.3 items 8-9"). |
| R5 | RECOMMENDATION | `PLAN-DEEPSEEK.md:281-282` | [F] RESOLUTION:221 maps P-6 to A-3 **and** A-12 (context-window data gap). Plan A-3 has hard-constraint filters; plan A-12 scope is only model/effort after launch (`:281-288`). The data half of P-6 has no home. | Put the context-window / hard-constraint **data** requirement into A-12 acceptance or state it waits for R-3 values. |
| R6 | RECOMMENDATION | `PLAN-DEEPSEEK.md:417-418` | [F] PROTO-DEC-0079 Open: "U-8 (security: waits inside R-1, **never DEFER**)" (`DECISIONS.md:3406-3407`). The plan's flag list drops the never-DEFER clause. [F] R-L0-22.33 independently forbids DEFER of security findings without owner decision. | Restore "U-8 never DEFER without owner decision" next to the flag. |
| R7 | RECOMMENDATION | `PLAN-DEEPSEEK.md:35-36` | [F] Plan says "Of the 14, thirteen rest on an accepted block". [I] PROTO-DEC-0079 item 1 prioritises A-items as program work but does not itself accept A-1..A-14 as a closed work list; the active list is RESOLUTION output (advisory) elevated by the owner's resume. | When fixing B2, state which items are covered by an accepted block id and which only by the owner's program-priority text, so DIG does not rest on an unstated reading of "accepted". |

## 4. NOTE findings

| # | Plan cite | Evidence | Comment |
|---|---|---|---|
| N1 | `PLAN-DEEPSEEK.md:120-121` | [F] Seven H-AUTH-02 checks are the numbered list `H-AUTH-02.md:42-48`; plan cites `:41-48` (includes the blank line). | Off-by-one citation; harmless if the tests copy the seven items, not the line range. |
| N2 | `PLAN-DEEPSEEK.md:35-37` | [F] Plan correctly flags that a program-wide DIG must count other programs (P-L0-008 checks, R-L0-36, stage-2 roles). | Good honesty; keep that split when B2 is fixed. |
| N3 | `PLAN-DEEPSEEK.md:64-66` | [F] Certification outsiders listed include Kimi and MiMo. This stage uses Kimi and MiMo as plan critics (`DISPATCH-OWNER.md:694-711`). | [I] Critique of a plan is not authorship/control under 0041 item 1, so certification remains available; still worth a one-line independence note in stage 5 so Claude does not reuse a critic as the sole certifier of work that absorbed that critique. |
| N4 | `PLAN-DEEPSEEK.md:21-26` | [F] DIG method excludes research frames and section 4.1 IMPLEMENTED rows. Consistent with R-L0-22.41 once B2 is fixed. | Method is sound; only the membership list is wrong. |
| N5 | `PLAN-DEEPSEEK.md:412-419` | [F] Flag list matches PROTO-DEC-0079 Open items (resolver metric, tie-break, DEFER cap, Kernel v1 scope, U-3/4/8/10/11/13/14), except the U-8 clause in R6. | Good "flag, do not solve" compliance with PLAN-AMENDMENT:27-30. |

## 5. Fidelity to findings (check 2)

| Minority finding (RESOLUTION 3.3) | In plan? | Where |
|---|---|---|
| 4 OwnerIdeas status rule | yes | A-2 (`:127-143`) |
| 5 model-layer freeze | partial | R-3; freeze wording is B1 |
| 6 ten dangling markers | yes | R-3 contract-first (`:350-353`) |
| 7 conflicts with decisions | yes | U-5/U-6/U-7 resolved into R-3 gate (`:347-348`); stale "conflicts with 0062/0063" still in the evidence gap (`:345-346`) though 0079 item 3 and 0080 item 2 closed them |
| 8 reviewer precision/recall | weak | see R4 |
| 9 verification strength | weak | R-3 question only |
| 10 launcher never launched | yes | A-13 (`:293-303`) |

[F] No accepted item from section 6 or 7 is dropped. Simplifications that remain are above; none is silent deletion of an A/R id.

## 6. Dependencies, executability, necessity (checks 3-5)

- **D1 order** [F]: Wave 1 routes + A-10, Wave 2 resolver v0 then rest of A-3, second stream A-5/A-6/A-12 — matches `PLAN-AMENDMENT.md:13-16`. Wave 0 resolved claims match `:17-18`. Blockers: B3 (wave vs package), B4 (A-6 gate).
- **R-3 as one major S2 frame with contract-first** [F]: present (`:342-361`), matching PROTO-DEC-0080 item 1 and `PLAN-AMENDMENT.md:19-23`.
- **Inputs exist before start** [F]: A-4 after M-7 (`:176-177`); A-3 after PKG-1 (`:156-157`); A-1 enforcement after A-3 (`:118`); R-5 after U-3; R-6/R-4 after K-launch/M-3. No reverse dependency found except the A-6 circularity (B4).
- **Verifiable acceptance** [F]: all A-items carry acceptance + validation lines (`:119-123` … `:310-311`). A-14 has no dedicated test ("folded into A-3/A-4 reviews", `:312`) — acceptable as L-M if stage 5 keeps it inside those reviews. R-items are verifiable only as gate verdicts + stop criteria; they are research, not implementation (R-L0-22.4). Flagged, not fatal.
- **Unnecessary work** [I]: none found. A-2 is transcription of PROTO-DEC-0079 item 7, not new design. Task one is required by the amendment. The five packages are stage-5 material the plan correctly marks Claude-owned (`:85`).
- **Two-stream fit** [F]: five packages map to two streams with at most one package per stream (`:88-98`); the PKG-4/PKG-5 S2 concurrency question is flagged (`:96-99`), which is correct under R-L0-22.24 / 0048 item 7.

## 7. Governor admission and DIG (check 6)

| Requirement | Status |
|---|---|
| Task one DIG baseline present | yes (`:21-42`), count wrong (B2) |
| Stream + size per frame | stated for R-1..R-7; R-5 conflicts with FRAMES (R1) |
| Five admission fields | missing / not marked pending (R2) |
| R-3 contract-first steps | yes (`:350-353`) |
| Terminal verdict set (ACCEPT/REJECT/EXPERIMENT/DEFER) | yes per R-item (`:331`, `:340`, `:360`, `:370`, `:381`, `:390`, `:399`) |

## 8. CORE-ARCH boundaries (check 7)

| Constraint | Status |
|---|---|
| Kernel changes inside CORE-ARCH (0054 item 2, 0077 item 2) | held (`:59-61`) |
| High-risk certification outside execution/control (0038 item 1, 0041 items 1-2) | held (`:59-66`); U-2 closed correctly via 0079 item 6 |
| No new hypotheses outside R-3 | held in text (`:50-51`); B1 is the freeze wording, not a new hypothesis |
| No separate characterization layer (0062 item 2, 0079 item 3) | held (`:52-53`, `:353`) |
| No prompt text in scripts (0073) | held (`:58-59`) |
| Reopen only via REGISTRY trigger | held (`:67`) |

## 9. What is solid (confirmed)

1. Full ID traceability A-1..A-14 and R-1..R-7 against RESOLUTION §§6-7.
2. D1 order matches the owner's PLAN-AMENDMENT; Wave 0 resolutions (U-1/D6, U-2/D7, U-9/D8, A-2/D9) are cited correctly.
3. Task one exists and is hand-reproducible until the ledger (R-L0-22.45).
4. Risk classes and certifier-exclusion rule match PROTO-DEC-0038/0041 and 0079 item 6.
5. R-items carry stream + major/minor and a four-way terminal verdict set (R-L0-22.15, R-L0-22.26 of the plan amendment).
6. Open owner questions are flagged, not solved (`:412-419`), per PLAN-AMENDMENT:27-30.
7. The plan states it is not a decision and that Claude owns the final package split.

## 10. Verdict

**CONFIRM_WITH_CHANGES**

BLOCKING (must be fixed before stage 5 freezes scope):
1. B1 — R-3 freeze wording contradicts PROTO-DEC-0080 item 1.
2. B2 — DIG baseline includes A-11 without an accepted decision (R-L0-22.41).
3. B3 — D1 wave table and package table disagree on A-11/A-12 start waves; A-13/A-14 unplaced.
4. B4 — A-6 dependency misquotes PROTO-DEC-0075 and is circular through PKG-4.

RECOMMENDATION: R1-R7 as tabled. NOTES: N1-N5.

[Q] If the owner or Claude reads "H-WAI-2..5 stay frozen" as "the hypotheses are not rewritten, only measured", say so explicitly in the plan; the present sentence is ambiguous against RESOLUTION:151-154 and 0080.

## 11. Independence statement

I did not open `round5/CRITIQUE-KIMI.md` or any other critic's report. Inputs were the files named in `prompts/run/r5-mimo-critique.md` and `prompts/CRITIQUE.md` only. No commits, tags, pushes or branches. Output is exactly this file.
