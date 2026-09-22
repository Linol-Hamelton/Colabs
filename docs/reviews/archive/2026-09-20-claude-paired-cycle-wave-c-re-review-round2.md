# Certifying Review: Paired-Cycle Wave C limited external re-review, round 2 (F-1..F-8)

Reviewer: Claude Opus 5 (external limited re-reviewer, outside the DeepSeek-Gemini pair)
Date: 2026-09-20
Reviewed commit: d38d2f2ae4b4c17fe6c2c18f11215cedb2f10eb1
Working tree: dirty (uncommitted Wave C set including the fix round; measurements taken 2026-09-20 ~21:20-22:10 local)
Mode: CERTIFYING
Receipt-Owner: claude-a75ba0ab6356c2b8
Scope: re-verification of F-1..F-8 from `docs/reviews/2026-09-20-claude-paired-cycle-wave-c-re-review.md` against the current tree, plus third-party re-coverage of the areas DeepSeek touched (PLAN Wave C section, unified prompt, R8 ledger). Read-only with respect to the repository; every fixture under the system temp directory. The owner's parallel Claude analysis artifacts were neither read for judgement nor assessed.
Verdict: FAIL

Every engineering defect is closed. F-1, F-2, F-3, F-4 and F-5 are VERIFIED-FIXED, each reproduced
in my own fixtures rather than taken from the implementer's report. The suite is green at 300/300.
What remains is not code: F-6 (TASK/PLAN statements against measurement) is a round-1 BLOCKING item
and is still wrong on the current tree, F-7 (the review's journal binding) is still absent, F-8 has
moved the wrong way (37 journals, up from 36), and one new blocking-for-closure item appeared - the
unified prompt and the DeepSeek CERTIFYING review both predate the fix round and do not cover it.

## Measurements actually taken

| Measurement | Command | Result |
|---|---|---|
| Validator | `powershell -ExecutionPolicy Bypass -File .\validate-protocol.ps1 -Quiet` | exit **0**, **1 warning**: `37 session journals in .ai/worklog (cap 30, PROTO-DEC-0037 WARN-first policy)` |
| Regression suite | `powershell -ExecutionPolicy Bypass -File .\test-protocol.ps1` | exit **0**; `# tests 300`, `# pass 300`, `# fail 0`, `# skipped 0`, 220.2 s |
| Controller probe | `node .ai/runtime/wave-c-probe2.cjs` (read first, then run) | 10 of 10 cases A-J `OK`, both engines agree |
| Historical upgrade tests | suite output lines 1545-1565 | `ok 256` v1.9.4, `ok 257` v1.9.5, `ok 258` coverage; no skips |
| Active review corpus | own recursive walk, `archive/` excluded | **55 files / 561,301 bytes (548.1 KB)**; 0 non-`.md`; caps 60 / 600 KB not exceeded |
| Session journals | own walk of `.ai/worklog/` | **37 `.md`** (excluding `README.md`); **31** carry a dated entry, all 31 with five labels; **6** are empty SessionStart placeholders |
| Archive ledger | net replay of `docs/reviews/archive/INDEX.md` against disk | 147 rows, 130 tracked artifacts, **130 net-consistent, 0 inconsistent**, 116 physical archive `.md`, **0 without a ledger row** |

Beyond the required runs I built fourteen fresh fixtures of my own (P, P2, P3, T, T2-T5, R1, R2,
W, X, Y, Z, Z2) plus three patched copies of the upgrade suite (A, B, C), all under
`%TEMP%\claude-r2\`, each exercised through `validate-protocol.ps1 -Quiet` **and**
`node .ai/bin/protocol-handoff.cjs gate-check` on the same tree so the two engines are compared
directly rather than separately.

## Findings

| ID | Item | Verdict | Finding | Reproduction |
|---|---|---|---|---|
| F-1 | tar extraction | **VERIFIED-FIXED** | `tests/upgrade.test.cjs:155-163` now asserts `archRes.status` and `tarRes.status`, prefers `C:\Windows\System32\tar.exe` when it exists, and runs with `cwd = tmp` using the relative names `release.tar` and `-C old-src`. The Windows-path-as-host-spec failure cannot recur, and neither exit status can be swallowed. | My probe on the real tags: `tarExe=C:\Windows\System32\tar.exe archive.status=0 FIXED.status=0 entries=21 setup=true pairedCycle=false`. The round-1 form on the same tag: `status=128`, `tar: Cannot connect to C: resolve failed`, `oldEntries=0`. Belt and braces: with `tarExe` forced to bare `tar` (Git's GNU tar, still first on this PATH) the relative form also returns `status=0 entries=21`, so the fix is PATH-independent by two mechanisms. Suite: `ok 256`, `ok 257`. |
| F-2 | coverage test | **VERIFIED-FIXED** | `tests/upgrade.test.cjs:177-199` builds `verifiedTags` from the `passedTags` Set that each per-tag test populates only on success, and `assert.deepEqual`s it against `historicalTags` before the diagnostic line. The PASS diagnostic is now unreachable over red tests. | Variant A (v1.9.5 forced to fail): `not ok 2`, `not ok 3 - historical release tag coverage`, message `Incomplete historical release tag coverage: verified [v1.9.4], required [v1.9.4, v1.9.5]`; no `PASS verified` line. Variant B (both forced to fail): `not ok 1/2/3`, `verified []`. Unmodified: `ok 258` with `# Historical release upgrade suite PASS verified for tags: v1.9.4, v1.9.5` only after both per-tag tests were green. |
| F-3 | `Reviewer:` parity | **VERIFIED-FIXED** | The Node strict path gained the check at `.ai/bin/protocol-handoff.cjs:1253-1257`, and the Node light path carries the same check at `:1155-1159`, both using the regex PowerShell uses at `validate-protocol.ps1:741` and `:833`. Both engines now enforce the contract documented in `.ai/docs/PROTOCOL.md` and `.ai/docs/PAIRED-CYCLE.md`. | Case P (source fixture, strict gate, review `Date: 2026-09-18` + `Verdict: PASS`, no `Reviewer:`): **PS=1, Node=1**, PS `independent review must name a Reviewer: docs/reviews/r.md`, Node `independent review docs/reviews/r.md is missing a Reviewer`. Case P3 (installed role, owner-selected `audits/` path, same review): **PS=1, Node=1**, same reasons. Case P2 (control, `Reviewer: external` added, nothing else changed): **PS=0, Node=0**. |
| F-4 | leading `./` | **VERIFIED-FIXED** | Both engines now normalise identically: Node `.replace(/\\/g,'/').replace(/^\.\//,'')` at `:977-978`, PowerShell `.Replace('\','/') -replace '^\./',''` at `validate-protocol.ps1:644`, `:696`, `:770`, `:771`, `:780`. One strip, same order, prompt and review, light and strict. | Case T (source, `./` on both fields, full strict fixture: `Mode: CERTIFYING`, `Receipt-Owner`, five-label journal citing the review path, real `record --quick`): **PS=0, Node=0**. T2 (no prefix, control): 0/0. T3 (`./` on the review only): 0/0. T5 (installed role, `./audits/...`): 0/0. T4 (`./././`, which exceeds the single specified strip): **PS=1, Node=1**, both `in source repository, adversarial review prompt must be under docs/reviews/: ././docs/reviews/2026-09-20-prompt.md` - identical residue, identical reason. |
| F-5 | DeepSeek verdict line | **VERIFIED-FIXED** | `docs/reviews/2026-09-20-deepseek-paired-cycle-wave-c-review.md:10` is now exactly `Verdict: PASS`. The file carries `Reviewer:`, `Date: 2026-09-20 (UTC)`, `Mode: CERTIFYING`, `Receipt-Owner: deepseek-59c81998639a4feb`, and no transcription marker. It satisfies the header contract as persisted. | Case R2 (the real prompt and the real review copied byte-for-byte into a source fixture, journal for the declared Receipt-Owner citing the review path, real `record --quick`): **PS=0, Node=0**, `completion gate verified: docs/reviews/2026-09-20-deepseek-paired-cycle-wave-c-review.md bound to .ai\worklog\deepseek-59c81998639a4feb.md (section 0)`. The verdict token is no longer the obstacle. |
| F-6 | TASK/PLAN vs measurement | **STILL-BROKEN** | `.ai/TASK.md:51` still reads "full suite 270/270, validator 0 warnings, corpus 58 files, 27 session journals (cap 30)". Measured: **300/300**, **1 warning**, **55 files**, **37 journals**. Four numbers, four mismatches; not one of them was right in round 1 either. `.ai/TASK.md:39` remains ticked for "Final validator 0 warnings, full suite green, corpus/journal budgets restored safely" - the suite is green but the validator warns and the journal budget is 7 over. `.ai/TASK.md:22` states the constraint "Validator 0 warnings; journals <= 30 files", which the tree violates. `.ai/PLAN.md` Wave C item 7 sets "full suite green; validator 0 warnings" as acceptance; the first half is now met, the second is not. `.ai/PLAN.md` Wave C item 5 promises "TASK/PLAN dispositions match reality". | The measurement table above; `.ai/TASK.md` was last written 10:41, before the whole Wave C fix round. |
| F-7 | review journal binding | **STILL-BROKEN (precondition)** | No journal in `.ai/worklog/` cites `docs/reviews/2026-09-20-deepseek-paired-cycle-wave-c-review.md`. `deepseek-59c81998639a4feb.md` was last written at 10:56 and its newest entry is "Controller-executed remediation of the closure pass (F-001/F-002/F-003)"; it has no Wave C entry. The mechanism is correct and fails closed, so `Status: Completed` is unreachable today. | `grep -rln "2026-09-20-deepseek-paired-cycle-wave-c-review" .ai/worklog/` -> no match (exit 1); `grep -rln "wave-c-review" .ai/worklog/` -> no match. Case R1 (real artifacts, Receipt-Owner journal present with a valid receipt but not citing the path): **PS=1, Node=1**, both `journal .ai\worklog\deepseek-59c81998639a4feb.md does not mention independent review docs/reviews/2026-09-20-deepseek-paired-cycle-wave-c-review.md`. Case R2 above shows the same tree passing once the entry cites it. |
| F-8 | journal count | **STILL-BROKEN (recommendation)** | 37 journals against a cap of 30 - one more than round 1, because this session's placeholder was added. 31 carry a dated entry and every one of those 31 has all five labels; 6 are empty SessionStart placeholders (`claude-235a7864cb443d43`, `claude-6e9b2f313994d3fa`, `claude-993ffa9667e315c0`, `claude-a75ba0ab6356c2b8`, `claude-d1ce822523829175`, `codex-d50f00dd448b975b`). This is the sole validator warning. Pruning the five placeholders that are not mine leaves 32; the cap still needs an archival pass under the lock. | Own walk of `.ai/worklog/`; validator warning text quoted above. |
| F-9 | certifying artifacts vs the tree | **NEW - BLOCKING for closure** | The unified prompt and the CERTIFYING review both predate the fix round they are supposed to cover. `docs/reviews/2026-09-20-deepseek-paired-cycle-wave-c-review.md` (20:44) was written before `validate-protocol.ps1`, `.ai/bin/protocol-handoff.cjs` and `tests/upgrade.test.cjs` (all 20:47), and before the prompt's own last edit (20:48). Its "Checks actually run" section states `0 warnings`, `295/295 pass`, `Corpus 52 files / ~600 KB region`, `journals 30 (validator clean)`; measured today: 1 warning, 300/300, 55 files / 548.1 KB, 37 journals. The prompt's change list (items 1-5) describes the pre-fix implementation only: it does not mention the tar PATH-independence and exit-status assertions, the `passedTags` linkage, the Node `Reviewer:` check, the `./` normalisation, or the `headerEnd` bounds fix. AGENTS.md section 2 item 1 requires the prompt to cover **every** item of the implementation, and a CERTIFYING review to be the report against it. As they stand, no pair artifact covers the five changes that closed F-1..F-5. | File modification times listed above; the prompt is 49 lines and its item 35 still describes only "eliminated silent `continue`"; the review's lines 51-56 hold the stale numbers. |

## Per-finding verdicts

**F-1 VERIFIED-FIXED.** Both required properties hold and are independently reproduced: extraction no
longer depends on PATH order, and both `git archive` and `tar` exit statuses are asserted. There is no
silent continue left in the per-tag path. Tests 256 and 257 are green in a full run, not skipped.

**F-2 VERIFIED-FIXED.** The coverage test is now a function of per-tag results. I forced one tag red
and then both tags red; in each case the coverage test went red with a message naming exactly which
tags were verified, and the `PASS verified` diagnostic never printed. One residual, fail-closed:
when only *some* required tags exist in the checkout the coverage test hard-fails rather than skipping.
Variant C (`historicalTags = ['v1.9.4','v9.9.9']`, second tag absent) gave `ok 1`, `ok 2 # SKIP`,
`not ok 3 ... verified [v1.9.4], required [v1.9.4, v9.9.9]`. A partial-tag CI checkout therefore
reports a failure rather than a skip. That is the safe direction and the per-tag skip message already
tells CI to fetch tags, so I record it as a RECOMMENDATION, not a defect.

**F-3 VERIFIED-FIXED.** Parity is complete across all five elements of the header contract. Cases P,
P2 and P3 pin the new behaviour in both roles, and the previously divergent case is now 1/1 with the
same reason in both engines. The round-1 latent PowerShell hazard next to it is also closed:
`validate-protocol.ps1:730` and `:822` both read
`elseif ($headerEnd -le 0) { "" }`, so a terminator on line 0 yields an empty header region instead of
splicing the file's last line through the `0..-1` range. Cases W (`---` first) and X (`## ` first)
confirm 1/1 in both engines with `missing a Reviewer`.

**F-4 VERIFIED-FIXED.** Five cases, five parity agreements, including the negative. The two engines
now produce identical results and identical residues for `./`-prefixed declarations. Case Z and Z2
extend this to the light path and to the `.\` backslash form, both 0/0.

**F-5 VERIFIED-FIXED.** The bare `Verdict: PASS` parses in both engines. The persisted review can
satisfy the completion gate as written; its only remaining obstacle is F-7, which is a property of the
journal rather than of the review.

**F-6 STILL-BROKEN.** This is a round-1 BLOCKING item and it is unresolved. I record what mismatches
rather than fixing it, as instructed: `.ai/TASK.md:51` (four wrong numbers), `.ai/TASK.md:39` (a
ticked acceptance box whose first and third clauses are false), `.ai/TASK.md:22` (a stated constraint
the tree violates), `.ai/PLAN.md` Wave C item 7 (acceptance half-met) and item 5 (the promise that
dispositions match reality). The correct current values are 300/300, 1 validator warning, 55 files /
548.1 KB, 37 journals.

**F-7 STILL-BROKEN (precondition).** Unchanged from round 1 and reproduced from both directions. The
gate reacts correctly; the support simply does not exist yet.

**F-8 STILL-BROKEN (recommendation).** The count moved from 36 to 37. `protocol-session.cjs prune`
clears the six placeholders, of which mine will become an entry-bearing journal at the end of this
session; that leaves roughly 32, so an archival pass under the lock is still needed to reach the cap.

**F-9 NEW, BLOCKING for closure.** See the findings table. Nothing about the code is wrong here - the
code is the part I verified clean. The gap is that the pair's own prompt+report pair, which section 2
requires to cover every item of the implementation, describes a tree that ceased to exist three
minutes after the review was written.

## Areas DeepSeek touched (third-party re-coverage)

**PLAN Wave C section: RECOMMENDATION.** `.ai/PLAN.md` is 130 lines (limit 200). Items 1-6 still
match code I read in both engines, and item 5's clause about explicit `t.skip()` is now backed by a
real skip path I exercised in variant C. Item 7's acceptance is half met: the matrix is green in both
engines (I re-ran it) and the suite is green, but "validator 0 warnings" is not true and item 5's
"TASK/PLAN dispositions match reality" is not true. Those are the F-6 reconciliations.

**Unified prompt: PASS on numbers, FAIL on coverage.** `docs/reviews/2026-09-20-gemini-paired-cycle-remediation-adversarial-prompt.md`
is 49 lines (cap 150) and its refreshed corpus figure - "currently 55 files / ~548 KB, within the
60 files / 600 KB cap" - matches my independent walk to the file and to the tenth of a kilobyte. Its
structure still satisfies the strict-path prompt check (cases T, R1, R2 all cleared
`must identify a unified adversarial audit prompt`). The refresh was numbers only; the change list
does not cover the F-1..F-5 fix round. That is F-9.

**R8 ledger: PASS.** Unchanged and intact under append-only semantics. Forward replay of
`docs/reviews/archive/INDEX.md` gives 147 rows over 130 tracked artifacts, all 130 net states matching
disk, and all 116 physical archive documents carry a ledger row. Identical to round 1, so the fix
round disturbed nothing here.

## Limits of this review

- One machine, one shell, one locale. F-1's round-1 failure was PATH-dependent; the fix removes that
  dependence in two independent ways, and I checked both, but I cannot speak for a host with neither
  `System32\tar.exe` nor a `tar` that accepts relative extraction.
- My first F-1 probe reported `tarExe=tar` because my own shell heredoc collapsed the backslashes in
  the path literal. The repository file is correct; I rebuilt the probe from a written file and
  re-ran it. The conclusion above rests on the rebuilt probe.
- Case Y (a review that is both `Mode: ADVISORY` and carries a transcription marker) returns 1 in both
  engines but for different stated reasons: PowerShell reports the transcription, Node reports the
  advisory mode, because the two checks sit in opposite order. Verdict parity holds, reason parity
  does not. Cosmetic; I raise it only so it is on the record.
- I did not attempt to defeat the baseline self-declaration, which the prompt and the runbook already
  record as accepted residual risk.
- I read `.ai/TASK.md`, `.ai/PLAN.md`, both engine implementations, the Wave C tests, the ledger, the
  journals, the unified prompt and the DeepSeek review. I did not read the owner's parallel Claude
  analysis documents for judgement and offer no opinion on them.
- Read-only: no repository file was modified, moved or deleted by this session other than creating
  this review and this session's own journal. No commit, no tag, no push, no lock taken, no edit to
  `.ai/TASK.md`, `.ai/PLAN.md`, `.ai/DECISIONS.md` or `docs/decisions/REGISTRY.md`.

## What would turn this into a PASS

1. Reconcile `.ai/TASK.md:51`, `:39`, `:22` and `.ai/PLAN.md` Wave C items 5 and 7 with the measured
   values: suite 300/300, corpus 55 files / 548.1 KB, journals 37 (or the post-prune count), and the
   validator's one warning - or clear the warning first and then state zero.
2. Prune the empty placeholders and archive journals under the lock until `.ai/worklog/` is at or
   below 30, so the validator reports 0 warnings and the ticked acceptance box becomes true.
3. Give `docs/reviews/2026-09-20-deepseek-paired-cycle-wave-c-review.md` a journal entry in
   `deepseek-59c81998639a4feb.md` that cites its own path, with a final-tree receipt (F-7).
4. Extend the unified prompt to the fix round, and issue the CERTIFYING report against the tree that
   actually contains it, with measurements taken on that tree (F-9). Under section 5.5 immutability
   the existing review is history; the reissue is a new file carrying `Supersedes:`.
5. Re-run the validator and the suite on that final tree before recording receipts, and state the
   numbers that run produces.
