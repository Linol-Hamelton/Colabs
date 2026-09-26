Mode: ADVISORY
Baseline: 27dd7a6 (HEAD, kilo stage-7 journal), b946355 (stage-7 dispatch), 13c9f16 (stage 5-6);
frozen corpus 7b6d17a; working tree status: dirty (one untracked session journal)
Reviewer: DeepSeek 4.1 Flash, route kilo, effort max, 2026-09-26
Scope: stage-7 pre-check of `round6/FINAL-RESOLUTION-CLAUDE.md` and `round6/packages/PKG-1.md` .. `PKG-5.md`
Verdict: BLOCKING

# Stage-7 pre-check (DeepSeek)

- Frame `task:ownerideas-r7-precheck-deepseek`; role: verify, decide nothing (AGENTS.md section 2;
  `prompts/COMMON.md`). Owner pre-approval: PROTO-DEC-0086 item 3.
- Labels: **[F]** fact checked in this session (`path:line` or decision id); **[I]** inference;
  **[Q]** open question.
- Stage 8 cannot start as written: two nameable defects make a required validation command and a
  required golden fixture impossible, and one same-wave file collision is acknowledged by the
  resolution but serialized by no package. Both defects have a one-line fix.

## 1. Check verdicts (PRE-CHECK.md checks 1-7)

| # | Check | Verdict | Basis |
|---|---|---|---|
| 1 | Completeness: five packages, all amendment item-7 fields | PASS | exactly 5 files; each carries ID, Goal, Scope, Stream and wave, Inputs, Allowed paths, Forbidden paths, Dependencies, Required outputs, Acceptance criteria, Validation commands, Integration conditions, Risk class and certification route, Artifact plan, Executor requirements, STOP conditions |
| 2 | Critique coverage: every BLOCKING item ruled by name | PASS | resolution section 3.1 rules Kimi B-1/B-2/B-3 and MiMo B1/B2/B3/B4, each ACCEPT or ACCEPT-with-different-fix and a reason (lines 90-100) |
| 3 | Dependencies: waves and inputs | PASS with N-4 | E1 PKG-1->PKG-3, E2 PKG-2->PKG-4->PKG-5 (resolution 216-223); A-4 and A-9 out of scope (resolution 164-168); A-11 pending (205, 210) |
| 4 | No overlaps in a wave | **FAIL** | B2: `protocol-manifest.json` is changed by both W1 packages. No other same-wave collision found (PKG-3/PKG-4 disjoint; PKG-5 alone in W3) |
| 5 | Acceptance and verification | **FAIL** | B1 (missing `R3-DISPATCH.json` path breaks AC-4 and a validation command) and B3 (missing golden row). Other commands exist or are package-created |
| 6 | Determinism | PASS with N-3, N-5 | every free choice is a STOP condition or a named owner question; exact-text edits are guarded by STOP 1 |
| 7 | Owner questions flagged, not solved | PASS | OQ-1 (A-11), OQ-2 (A-1 design block), OQ-3 (stall threshold) and OQ-4..OQ-13 are context (resolution section 9) |

## 2. BLOCKING findings

### B1 — PKG-1. AC-4 and a validation command name a dispatch file that does not exist

- **Path**: `PKG-1.md:65` (Inputs), `:347` (AC-4), `:366` (validation commands), `:434-435` (STOP 3).
- **Defect [F]**. The package requires `check` to accept
  `docs/research/2026-09-25-validator-migration-council/prompts/R3-DISPATCH.json` and runs
  `node .ai/bin/protocol-dispatch.cjs check <that path>`. F-06 is CLOSED and archived
  (FRAMES.md:31); the file now lives in the archive. The old directory keeps only
  `final-plan-2.md` and `tools/`; `prompts/`, `round1/`, `round2/`, `round3/` are empty. STOP 3
  ("`check` rejects ... `R3-DISPATCH.json`") presupposes a file the executor cannot open, and
  PROTO-DEC-0085 item 5 makes archive paths provenance-only, excluded from default-context input.
- **Reproduction**
  ```
  Test-Path 'docs/research/2026-09-25-validator-migration-council/prompts/R3-DISPATCH.json'   # False
  Test-Path 'docs/research/archive/2026-09-25-validator-migration-council/prompts/R3-DISPATCH.json' # True
  Get-ChildItem -Recurse -File 'docs/research/2026-09-25-validator-migration-council'  # 4 files, no prompts/
  ```
- **Minimal fix**. In the four places, either point at the archive path
  `docs/research/archive/2026-09-25-validator-migration-council/prompts/R3-DISPATCH.json`, or copy
  that file once into `tests/fixtures/dispatch/` (an Allowed path) and require parity against the
  copy. Keep AC-4's run-chain-parity intent; drop the stale path.

### B2 — PKG-2. The golden corpus cites a `r6-claude-final` FAILED row that does not exist

- **Path**: `PKG-2.md:209-214` ("the `r6-claude-final` FAILED row of
  `docs/research/2026-09-26-ownerideas-revision/USAGE.md` (0 wall minutes, one retry)"), restated as
  `round6/FINAL-RESOLUTION-CLAUDE.md:345` in the resume log.
- **Defect [F]**. `USAGE.md:21` records `r6-claude-final ... 13 ... 0 ... DONE`. There is no FAILED
  row for that slot and no `0 wall minutes, one retry` row anywhere in the program's `USAGE.md`. The
  only live FAILED row is `docs/research/2026-09-26-model-layer/USAGE.md:10` (`f02-verifier`, wall 5,
  1 retry). The executor cannot build the required fixture from the named row and would reach its own
  STOP 3 ("a real past row cannot be expressed ... without inventing a value").
- **Reproduction**
  ```
  Select-String -LiteralPath 'docs/research/2026-09-26-ownerideas-revision/USAGE.md' -Pattern 'r6-claude-final'
  # | r6-claude-final | claude | claude-opus-5-5 | high | 13 | 466 | ... | 0 | 0 | DONE |
  Select-String -Path 'docs/research/*/USAGE.md','docs/research/archive/*/*/USAGE.md' -Pattern 'FAILED'
  # only f02-verifier and archived rows
  ```
- **Minimal fix**. Either cite the existing FAILED row (`docs/research/2026-09-26-model-layer/USAGE.md:10`,
  `f02-verifier`, one retry) as the golden corpus, or state the intended values without claiming a
  source row, and add the row to the corpus. Do not leave a citation the executor must contradict.

### B3 — Same-wave collision on `protocol-manifest.json` (check 4)

- **Path**: `PKG-1.md:85` + `:330-336` (S11) and `PKG-2.md:63` + `:188-192` (S6); acknowledged at
  `round6/FINAL-RESOLUTION-CLAUDE.md:225-229`.
- **Defect [F]**. PKG-1 (E1) and PKG-2 (E2) run concurrently in wave W1 and both change
  `protocol-manifest.json`. The resolution calls this "one exception" and mitigates it by "inserting
  the package's own entries ... re-read immediately before the edit, never rewritten whole". That is
  still an unsynchronized read-modify-write on one file by two writers; nothing in either package
  tells its executor how to detect or recover a lost update. Check 4 requires same-wave paths not to
  collide, and `tests/manifest.test.cjs:68-72` only detects a loss at the W1 gate, after both
  packages have finished.
- **Reproduction / evidence**
  ```
  Select-String -LiteralPath docs/research/2026-09-26-ownerideas-revision/round6/packages/PKG-1.md -Pattern 'protocol-manifest.json'
  Select-String -LiteralPath docs/research/2026-09-26-ownerideas-revision/round6/packages/PKG-2.md -Pattern 'protocol-manifest.json'
  ```
- **Minimal fix**. Add one explicit serialization rule to both packages, for example: after the
  single append, re-read the file and assert that every manifest entry of both W1 packages is
  present; if not, re-apply the append; on a second failure, stop and report. Alternatively assign
  the one manifest edit to the operator at the W1 gate and remove it from both executors.

## 3. RECOMMENDATION findings (PASS with these on a reworked resolution)

| # | Path | Defect | Minimal fix |
|---|---|---|---|
| N-1 | `PKG-2.md:46`, `:49`; resolution `:71-72` | [F] Inputs cite archived files: `.../2026-09-25-validator-migration-council/round3/USAGE.md` and `docs/research/2026-09-23-routing/INDEX-draft.md:21-22`; both are under `docs/research/archive/` | Repoint to the archive paths, or quote the 77/26/2.96 figure inline (it is what AC-8 needs) |
| N-2 | resolution `:249` | [F] The package table says PKG-4 changes "L0-ROOT 0.6 (R-L0-23)", but PKG-4 S5 defines R-L0-37/R-L0-38 and the resume log `:350-354` explains why R-L0-23 is wrong | Change the row to R-L0-37/R-L0-38 |
| N-3 | `PKG-4.md:110-113` | [F] The new P-L2-002 paragraph asserts "The six factors are the parameters of 0075 item 8"; PROTO-DEC-0075 item 8 names four parameters (uncertainty/reasoning depth; consequence/reversibility; coupling; independent judgement) | Reword to "operationalize the parameters of 0075 item 8", or show the six-to-four mapping in one clause. AC-9 requires the citation to say what the text claims |
| N-4 | resolution `:250` | [F] PKG-5's dependency row names only PKG-1; PKG-5 S6 also needs PKG-3 (the fall hook), as its own Dependencies say | Add PKG-3 to the row (= resume-log refinement 4) |
| N-5 | `PKG-4.md:203` | [F] S3 quotes "Узел считается пройденным, когда существует его выходной артефакт (L5)." but the source breaks after "когда" (`CORE-ARCH-4.md:75-76`) | Say the target sentence spans lines 75-76, or quote it with the break. STOP 1 would otherwise fire on a literal search |
| N-6 | `PKG-1.md:185-193` | [F] `effort.how` lists `flag` for claude/copilot only, but `kilo`/`mimo` use `--variant` (a flag, `run-chain.cjs:35,42`); S2 item 2 also says to add codex `-C` though `run-chain.cjs:33` already has it | Add `flag` = claude `--effort`, copilot `--reasoning-effort`, kilo/mimo `--variant`; say codex `-C` is kept from run-chain |
| N-7 | `PKG-4.md:346`, `PKG-1.md:358` | [F] AC-5 (PKG-4) and AC-15 (PKG-1) are search-and-justify/manual checks, so DONE needs judgement | Keep them, but record them as reviewer checks, not mechanical gates (PRE-CHECK check 5 wording) |

## 4. Verified sound (positive evidence)

- **PKG-2 schema vs PROTO-DEC-0075** [F]: pins = item 7; budget = items 3, 5; completion = item 6;
  `state`/`transitions` = item 11's eleven states; `class` = item 4's fifteen names; cost = item 9;
  `fallen` = PROTO-DEC-0051 item 4. The Stop-telemetry reader matches
  `protocol-hooks.cjs:621-641` (one row per Stop) and `.ai/runtime/metrics/sessions.jsonl` exists.
- **PKG-3 AC-15** [F]: the two predicted `resolve` rows are consistent with
  `MODEL-ECONOMICS.md:28-40` and the tier table `MODEL-MATRIX.md:126-135`: rung 9 Mistral T1-T9 is
  the primary; below-floor = Opus rungs, Luna XHigh, Gemini 3.7 High; tier-unknown = Sol Medium,
  Terra High, Gemini 3.6 High; route-unknown = DeepSeek V4.1 Max (client kilo, model null).
- **PKG-4 target text** [F]: the Size row, the step-3 floor sentence, R-L3-004.4/.5/.6/.8, В-24, the
  L0-ROOT intro/rule anchors and the `S1-SUMMARY` rows all exist as quoted (N-5 is the one wrap).
- **PKG-5 record shape** [F]: P-L3-005 and P-L0-009 front matter satisfy `procedure.schema.md`
  sections 1-3 (required keys; `cost_basis` for class B; `enforced_by` for `S~`; `## Open` allowed
  between required headings; L0 sub-rule anchoring to R-L0-38).
- **Checks 2, 3, 7** [F]: all seven BLOCKING items are ruled; A-4/A-9 leave package scope with a
  target; A-11 is reported pending; OQ-1/OQ-2/OQ-3 are context.

## 5. Open questions and notes

- [Q] The report header asks for `effort max` (`prompts/PRE-CHECK.md:39`), but this route exposes no
  effort flag; the comparable round-4 DeepSeek run recorded `effort unknown`
  (`round4/PLAN-DEEPSEEK.md:3`). The header follows the prompt; the journal Launch line records the
  route reality. No decision requested; the owner may want one convention.
- [Q] The resolution's own conflict reports (OQ-6 certifier floor; OQ-7 Gemini CORE-ARCH
  certification) stay open and are correctly not solved. If OQ-6 is confirmed as an override, the
  Kimi/MiMo certification route for PKG-1/2/3/5 stands.
- [F] Independence: I read only the files named in the launch and pre-check prompts. No stage-7 or
  later output existed before this run; I opened no other reviewer's file. No commits, tags, pushes
  or branches; the only files written are this report and my journal.

## 6. Resume note

On a reworked resolution, re-run checks 4 and 5 only: B1 and B2 are path/text corrections and B3 is
one added sentence; no other check depends on them.
