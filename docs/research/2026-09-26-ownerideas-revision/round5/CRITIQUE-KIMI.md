Mode: ADVISORY
Baseline: 7b6d17a; working tree status: dirty
Reviewer: Kimi K2.7 Code HighSpeed, route kimi CLI, effort high, 2026-09-26
Scope: critique of PLAN-DEEPSEEK.md
Verdict: CONFIRM_WITH_CHANGES

# Critique of PLAN-DEEPSEEK.md

This critique is independent. I read `COMMON.md`, `CRITIQUE.md`, `PLAN-DEEPSEEK.md`, `RESOLUTION-CLAUDE.md` sections 4-8 and 10, `PLAN-AMENDMENT.md`, `P-L0-008-research-governor.md`, `FRAMES.md`, and `DECISIONS.md` PROTO-DEC-0079..0083. I did not open `round5/CRITIQUE-MIMO.md`.

## Summary

The plan is faithful to the boundary set by `RESOLUTION-CLAUDE.md` and the `PLAN-AMENDMENT.md` owner directive. All active items A-1..A-14 and research frames R-1..R-7 are present and traceable by ID. The D1 wave order, the five-packages/two-streams decomposition, the R-3 contract-first steps, and the CORE-ARCH boundary constraints are all represented. Risk class and certification routes are correctly assigned for every A-item.

Three issues prevent a plain `CONFIRM`: the D1 wave table does not schedule the M-7 gate that A-4 requires; A-9 and A-11 are placed in Wave 3 but depend on scheduling decisions that are not in the plan; and the concurrency of PKG-4 and PKG-5 in stream 2 in Wave 2 is unresolved and could breach the two-stream cap. These are reproduced below as BLOCKING items.

## BLOCKING findings

| # | Severity | Plan location | Defect | Evidence | Requested change |
|---|---|---|---|---|---|
| B-1 | BLOCKING | `PLAN-DEEPSEEK.md:71-78` (D1 waves), `:168-182` (A-4 dependencies) | Wave 3 places A-4 after M-7, but the wave order never schedules M-7 items 2-6. | A-4 "starts only after [M-7 items 2-6] hold" (`PLAN-DEEPSEEK.md:176-177`). The D1 table has no wave for M-7. | Add an explicit wave 0 or wave 1 milestone that closes M-7 (certifier preflight, phase-0 baseline, oracle cohort, L correction pass) before A-4 opens. |
| B-2 | BLOCKING | `PLAN-DEEPSEEK.md:88-99` (package table), `:96-99` and `:437` (PKG-4/PKG-5 concurrency [Q]) | PKG-5's A-1 design is shown starting in wave 2 while PKG-4 still holds stream 2. | The plan itself flags the reading as unresolved (`PLAN-DEEPSEEK.md:98`). PROTO-DEC-0048 item 7 and the package table's "at most one package per stream at a time" (`PLAN-DEEPSEEK.md:96`) are in tension with this overlap. | State unambiguously whether stream 2 in wave 2 carries one active package or two; if two, cite the owner override required by `P-L0-008` R-L0-22.25 and `FRAMES.md` bypass-incident rules. |
| B-3 | BLOCKING | `PLAN-DEEPSEEK.md:88-99` (package table), `:240-249` (A-9) | A-9 is placed in PKG-3 / Wave 3 but is blocked on "its CORE-ARCH package must be scheduled first" (`RESOLUTION-CLAUDE.md:371`; `PLAN-DEEPSEEK.md:245`). | The five-package table does not schedule or name the CORE-ARCH package that unblocks A-9. | Either add the CORE-ARCH package to the schedule with an explicit wave, or move A-9 out of Wave 3 until the package is scheduled. |

## RECOMMENDATION findings

| # | Severity | Plan location | Issue | Evidence | Requested change |
|---|---|---|---|---|---|
| R-1 | RECOMMENDATION | `PLAN-DEEPSEEK.md:315-399` (R-items) | R-items list question, evidence gap, gate, inputs, expected output and stop criteria, but not the five governor admission fields. | `P-L0-008` R-L0-22.13 requires the frame README to state: the decision that depends on it, the primary question, alternatives, budget, and exit condition. Alternatives and budget are absent. | Add "alternatives" and "budget" to each R-item, or mark them explicitly pending before the frame opens. |
| R-2 | RECOMMENDATION | `PLAN-DEEPSEEK.md:21-43` (Task one) | DIG baseline counts A-1 design and A-11 code as accepted, but A-11 still needs a small owner decision before code (`PLAN-DEEPSEEK.md:274`; `RESOLUTION-CLAUDE.md:373`). | `P-L0-008` R-L0-22.41 counts accepted items not yet implemented. An item needing a further owner decision before implementation is not yet fully accepted. | Split A-1 into design (accepted) and enforcement (accepted); split A-11 into decision (pending) and implementation; or explain in Task one why A-11 is counted before its decision. |
| R-3 | RECOMMENDATION | `PLAN-DEEPSEEK.md:88-99` | The two-stream fit is expressed only as a package table. Concurrency across waves is hard to read. | `PLAN-AMENDMENT.md:17-18` requires the plan to "show how the five packages fit into two streams." | Add a wave-by-wave Gantt-style table that lists the active package per stream for each wave, including research frames exempt from the cap. |
| R-4 | RECOMMENDATION | `PLAN-DEEPSEEK.md:127-143` (A-2), `:88-99` (package table) | A-2 is an L0 source-conflict rule (`RESOLUTION-CLAUDE.md:364`) but is assigned to stream 2 (model/task routing and records). | Stream definitions in `P-L0-008` R-L0-22.9 and `FRAMES.md:6` put source/governance rules closest to S1 kernel/runtime. | Either justify A-2 in S2 or move it to S1, noting that it is a transcription task with no code edits. |

## NOTE findings

| # | Severity | Plan location | Observation | Evidence |
|---|---|---|---|---|
| N-1 | NOTE | `PLAN-DEEPSEEK.md:360-361` (R-3 verdict) | R-3 terminal verdict is phrased as sub-verdicts (EXPERIMENT for hypotheses, ACCEPT for schema if owner approves, DEFER for parts). | `P-L0-008` R-L0-22.15 requires one of four verdicts for the frame. Clarify whether this means one compound verdict with recorded parts, or whether R-3 will be split into sub-frames. |
| N-2 | NOTE | `PLAN-DEEPSEEK.md:75-76`, `:251-267` (A-10) | A-10 is in Wave 1 but consumed by A-3 in Wave 2. | Distinguish the schema-only deliverable in Wave 1 from the populated run record in Wave 2 to avoid acceptance confusion. |
| N-3 | NOTE | `PLAN-DEEPSEEK.md:228-239` (A-8), `:438` ([Q]) | A-8 code home is flagged as unresolved. | `SPEC-protocol-core.md:3` says "specification, not code"; P-L0-004 is draft. Resolve the code home before Wave 3 implementation. |
| N-4 | NOTE | `PLAN-DEEPSEEK.md:140-142` (A-2 risk class [Q]) | A-2 risk class is flagged as unresolved (0046 item 3 vs 0038 item 2). | Resolve before A-2 transcription so the correct certification route is applied. |

## Traceability check

| ID | Present in plan | Stream | Risk class | Notes |
|---|---|---|---|---|
| A-1 | Yes, `PLAN-DEEPSEEK.md:108-126` | S1 | H | Design in PKG-2, enforcement in PKG-3. Correct per PROTO-DEC-0081. |
| A-2 | Yes, `PLAN-DEEPSEEK.md:127-143` | S2 | M (questioned) | Decision already made by PROTO-DEC-0079 item 7; transcription only. |
| A-3 | Yes, `PLAN-DEEPSEEK.md:145-167` | S1 | H | Resolver v0 in Wave 2, rest of A-3 follows. Correct per D1. |
| A-4 | Yes, `PLAN-DEEPSEEK.md:168-182` | S1 | H | M-7 gate not in D1 waves (B-1). |
| A-5 | Yes, `PLAN-DEEPSEEK.md:184-199` | S2 | H | Fills stream 2 in Wave 1-2. Correct. |
| A-6 | Yes, `PLAN-DEEPSEEK.md:200-215` | S2 | M/H if invariant changes | Alignments; dependency on next stage-2 fix round or PKG-4. |
| A-7 | Yes, `PLAN-DEEPSEEK.md:216-227` | S1 | H | Wave 3. Correct. |
| A-8 | Yes, `PLAN-DEEPSEEK.md:228-239` | S1 | H | Shadow-only until P-L0-004 approved. Correct. |
| A-9 | Yes, `PLAN-DEEPSEEK.md:240-249` | S1 | H | Blocked on CORE-ARCH package scheduling (B-3). |
| A-10 | Yes, `PLAN-DEEPSEEK.md:251-267` | S1 | H | Wave 1, shipped by PKG-1, consumed by PKG-2. Correct per D1. |
| A-11 | Yes, `PLAN-DEEPSEEK.md:269-279` | S1 | H | Needs owner D before code; placed Wave 3 (R-2). |
| A-12 | Yes, `PLAN-DEEPSEEK.md:281-291` | S2 | M | Wave 1. Correct. |
| A-13 | Yes, `PLAN-DEEPSEEK.md:293-305` | S1 | H (code); operation | First real launch; operational evidence is its journal. Correct. |
| A-14 | Yes, `PLAN-DEEPSEEK.md:306-313` | S1 | L-M | Folded into A-3/A-4. Correct. |
| R-1 | Yes, `PLAN-DEEPSEEK.md:321-332` | S1 major | — | Sequenced behind no other S1 major in D1. Governor cap with R-6 noted at `:403-404`. |
| R-2 | Yes, `PLAN-DEEPSEEK.md:333-341` | S1 minor (or inside R-1) | — | Verdict DEFER now. Correct. |
| R-3 | Yes, `PLAN-DEEPSEEK.md:342-362` | S2 major | — | Contract-first steps present. Correct per PROTO-DEC-0080 item 1. |
| R-4 | Yes, `PLAN-DEEPSEEK.md:363-371` | S2 major | — | Waits for K-launch after M-3. Correct. |
| R-5 | Yes, `PLAN-DEEPSEEK.md:372-382` | S1 minor | — | Waits for U-1/U-3. Correct. |
| R-6 | Yes, `PLAN-DEEPSEEK.md:383-392` | S1 major | — | Waits for K-launch after M-3. Governor cap with R-1 noted. |
| R-7 | Yes, `PLAN-DEEPSEEK.md:393-399` | S1 minor | — | Waits for Node phase-0 baseline. Correct. |

## Dependency and boundary check

| Requirement | Source | Plan handling | Status |
|---|---|---|---|
| D1 wave order: routes + A-10, then resolver v0, then rest | `PLAN-AMENDMENT.md:13-16` | `PLAN-DEEPSEEK.md:71-78` | OK |
| Five packages fit two streams (D6) | `PLAN-AMENDMENT.md:17-18` | `PLAN-DEEPSEEK.md:83-99` | OK, except Wave 2 concurrency (B-2) |
| R-3 one major frame in S2 with contract-first steps (D2) | `PLAN-AMENDMENT.md:19-23` | `PLAN-DEEPSEEK.md:342-362` | OK |
| No separate characterization layer (D3) | `PLAN-AMENDMENT.md:23` | `PLAN-DEEPSEEK.md:52-53`, `:347` | OK |
| No new hypotheses outside R-3 | PROTO-DEC-0076 item 4 | All R-items map to `RESOLUTION-CLAUDE.md` §7 | OK |
| Kernel changes inside CORE-ARCH | PROTO-DEC-0054 item 2, 0077 item 2 | `PLAN-DEEPSEEK.md:59-61` | OK |
| High-risk certification by two independent external certifiers | PROTO-DEC-0038 item 1, 0041 items 1-2 | Every H item lists two certifiers outside author/controller | OK |
| Task/dispatch files name roles, not models | PROTO-DEC-0074 item 2 | `PLAN-DEEPSEEK.md:54-58` | OK |
| No prompt text in scripts | PROTO-DEC-0073 items 1-3 | `PLAN-DEEPSEEK.md:57-58` | OK |
| Reopen nothing without REGISTRY trigger | AGENTS.md §6 | `PLAN-DEEPSEEK.md:67-68` | OK |

## Minority findings and fidelity

No accepted item from `RESOLUTION-CLAUDE.md` sections 6-7 is dropped. Minority findings retained in the plan include:
- A-2 status rule for OwnerIdeas (Claude R1 minority; `RESOLUTION-CLAUDE.md`:148-150, `:364`).
- R-3 blocked while H-WAI-2..5 frozen, unblocked by PROTO-DEC-0080 (`RESOLUTION-CLAUDE.md`:388, `:54`).
- Ten `:chatgpt-content-reference` markers as R-3 step one (`RESOLUTION-CLAUDE.md`:156, `:348`).
- Variant E superseded and U-14 not a conflict (`RESOLUTION-CLAUDE.md`:145-146, `:448-450`).

Where the plan simplifies, it does so explicitly and flags the simplification as [I] or [Q].

## Governor admission check

| Frame | Stream | Size | Five admission fields | Verdict |
|---|---|---|---|---|
| R-1 | S1 | major | Partial: alternatives and budget absent | Noted in R-1 |
| R-2 | S1 | minor | Partial: alternatives and budget absent | DEFER now |
| R-3 | S2 | major | Partial: alternatives and budget absent | EXPERIMENT/ACCEPT/DEFER |
| R-4 | S2 | major | Partial: alternatives and budget absent | ACCEPT/REJECT/EXPERIMENT |
| R-5 | S1 | minor | Partial: alternatives and budget absent | EXPERIMENT/DEFER/REJECT |
| R-6 | S1 | major | Partial: alternatives and budget absent | ACCEPT/REJECT/DEFER |
| R-7 | S1 | minor | Partial: alternatives and budget absent | EXPERIMENT/DEFER |

The stream and size fields are present for every R-item. The five admission fields required by `P-L0-008` R-L0-22.13 are incomplete: alternatives and budget are missing. This is a `RECOMMENDATION` (R-1), not blocking, because the frames are not yet open and the README can be completed at admission.

## Open questions returned (not solved)

The plan correctly returns these as open:
- Program-wide DIG beyond the 14 items (`PLAN-DEEPSEEK.md:39-41`, `:434`).
- A-2 risk class and A-6 kernel-record risk class (`PLAN-DEEPSEEK.md:140-142`, `:435`).
- PKG-4/PKG-5 stream-2 concurrency (`PLAN-DEEPSEEK.md:96-99`, `:437`).
- A-8 exact code home (`PLAN-DEEPSEEK.md:438`).
- Resolver metric, cost-vs-latency tie-break, DEFER cap, Kernel v1 scope, operating threshold (`PLAN-DEEPSEEK.md:414-417`).
- U-3, U-4, U-8, U-10, U-11, U-13, U-14 (`PLAN-AMENDMENT.md:30`; `PLAN-DEEPSEEK.md:417-420`).

## Verdict

`CONFIRM_WITH_CHANGES`. The plan is coherent, traceable, and faithful to the boundary. Fix the three BLOCKING items (M-7 scheduling, PKG-4/PKG-5 concurrency, A-9 scheduling) before handoff to stage 5. Address the four RECOMMENDATIONs to improve executability and governor compliance.
