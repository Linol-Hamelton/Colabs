# Final Wave C Limited External Spot Review

Reviewer: Claude (Opus 5), independent limited external reviewer
Date: 2026-09-20 (UTC)
Reviewed commit: d38d2f2ae4b4c17fe6c2c18f11215cedb2f10eb1
Working tree: dirty (uncommitted Wave C set)
Mode: CERTIFYING
Receipt-Owner: claude-8b15f776aaa94d27
Scope: final closure of Wave C: acceptance measurements, process items F-6..F-9, the
controller matrix, the archive ledger, and falsification of previously closed defects.
Read-only with respect to the repository; fixtures under TEMP; no TASK/PLAN/DECISIONS/
REGISTRY edit, no commit.
Verdict: FAIL

## Measurements

The tree moved during this review. T0 is session start; T1 is after a concurrent session
wrote `docs/reviews/2026-09-20-claude-final-cycle-architecture-decision.md` (53,447 B,
22:46) - not my artifact. Both snapshots are reported; see S-8.

| Check | Command | T0 | T1 (now) | Claimed in TASK/PLAN |
|---|---|---|---|---|
| Validator | `validate-protocol.ps1` | exit 0, **1 warning** | exit 0, **2 warnings** | 0 warnings |
| Suite | `test-protocol.ps1` | exit 0, **300/300**, 0 fail, 238 s | not re-run | 300/300 |
| Corpus | recursive, excl. `archive/` | **57 / 604,675 B** | **59 / 668,285 B** | 56 / 589,151 B |
| Journals | validator union rule | **31** (30 on disk + 1 phantom) | **31** | 30 |
| Matrix | `node .ai/runtime/wave-c-probe2.cjs` | **10/10 agree A-J** | unchanged | 10/10 |
| Receipts | `protocol-handoff.cjs verify --deep` | exit **0**, matches | exit **1**, none match | verify --deep |

At T0 the corpus was within both caps (600 KB = 614,400 B). At T1 it is over the byte cap
by 53,885 B. Excluding this report (10,163 B) it is still over by 43,722 B, so the breach
is not caused by the artifact the brief asked me to produce.

## Findings

| # | Item | Verdict | Reproduction |
|---|---|---|---|
| S-1 | F-6 TASK/PLAN vs measurement | **FAIL** | `.ai/TASK.md:52` and `.ai/PLAN.md` Wave C item 7 both read "56 files / 589,151 B", "30 journals", "0 warnings". Measured 57 / 604,675 B, 31 journals, 1 warning. Delta 15,524 B = the two artifacts DeepSeek added after the reconciliation (`...final-cycle-architecture-strategy.md` 19,513 B + `...-adversarial-prompt.md` 7,238 B, less one archived). A third figure is on record: the certifying review line 53 and its archived journal entry (`.ai/ARCHIVE.md:4359`) say **580,759 B**. Three numbers, none current. |
| S-2 | F-7 journal binding | **FAIL** | `grep -rn "deepseek-paired-cycle-wave-c-review-round2" .ai/worklog/` -> no match (exit 1). The citing entry was moved out of `deepseek-59c81998639a4feb.md` into `.ai/ARCHIVE.md:4359` by that owner's next session; the journal now holds only the cycle-architecture entry. Fixture X1 (source role, real prompt + real review byte-for-byte, real journal as it stands, `Status: Completed` + `## Completion gate`): **PS=1, Node=1**, both "journal .ai\worklog\deepseek-59c81998639a4feb.md does not mention independent review docs/reviews/2026-09-20-deepseek-paired-cycle-wave-c-review-round2.md". Control X2, one citing entry prepended and a real `record --quick`: **PS=0, Node=0**, "completion gate verified: ... bound to .ai\worklog\deepseek-59c81998639a4feb.md (section 0)". |
| S-3 | Validator warning / journal cap | **FAIL** | Validator (`:251`) unions `git ls-files` with on-disk `.ai/worklog/*.md`, excluding README. Union = 31. Exactly one entry is a phantom: `deepseek-flash-ebd6eb9397ed3784.md` is `MD` in `git status` (index modified, worktree deletion **unstaged**) and absent from disk. The closure staged `qoder-86c43a9a02fd9789` (`D `) but not this one. 30 real journals + 1 phantom = 31 > cap 30. |
| S-4 | F-9 review-side coverage | **FAIL (partial)** | The unified prompt covers all five fix-round items: tar PATH-independence and exit statuses (`:37`, Q9), `passedTags` coverage (`:38`, Q9), Node `Reviewer:` (`:23`, Q4), `./` normalisation (`:25`, Q7), PS `headerEnd` bounds (`:24`, Q5). The reissued review covers four: F-1 tar (`:41`), F-2 passedTags (`:43`), F-3 Reviewer (`:45`), F-4 `./` (`:47`). Its "F-5" (`:48`) is its own predecessor's verdict line, not an implementation change. `grep -i "headerEnd\|line 0\|line-0"` over the review -> no match. Challenge question 5 is unanswered by the report that is meant to be the report against that prompt (AGENTS.md section 2). |
| S-5 | Implementer receipt | **FAIL** | `.ai/TASK.md:39` requires "Final-tree receipts for both owners verify --deep". `gemini-927b6b871251a111.md` (the implementer named in the prompt `:5`) contains **no `Evidence:` block at all**. The newest Gemini receipt anywhere is `gemini-ceed538477bc3230` at 07:53:40Z, hours before the fix round. `verify --deep` verifies exactly one journal, `deepseek-59c81998639a4feb`. The review's F-7 claim (`:55`) that "the receipts follow on the same final tree" holds for one owner, not both. |
| S-6 | Corpus headroom vs the mandated artifact | **FAIL** | `.ai/TASK.md:52` states "the final external spot report adds one artifact". Headroom at T0 was 614,400 - 604,675 = **9,725 B**. A report meeting the 250-line brief does not fit in 9,725 B; this file was compressed toward that target and still reached 10,163 B. The closure mandates an artifact for which it left no room. |
| S-8 | The "final tree" is not final | **FAIL** | At T0, `verify --deep` exited **0** and the DeepSeek certifying receipt matched. At T1 it exits **1**: "no evidence matches the current tree sha256:4720a31c...", and all **26** receipts including `deepseek-59c81998639a4feb` report "anchored to a different tree". The trigger is a concurrent session's `2026-09-20-claude-final-cycle-architecture-decision.md` (53,447 B, 22:46), which alone pushes the corpus 43,722 B over cap and raises the second validator warning (`59 files / 652,6 KB`). PROTO-DEC-0025 item 4 requires receipts only after the tree is final; a session writing 53 KB into the corpus during the closure review means it was not. My own receipt, recorded after this file was written, re-anchors and verifies; the other 26, including the certifying one, stay stale until retaken. |
| S-7 | Ledger net replay | **PASS** | Sequential replay of `docs/reviews/archive/INDEX.md`: 153 data rows, 135 distinct artifacts, 15 restore rows. Net state 122 archived / 13 active. On disk under `archive/` (excl. INDEX): **122**. Ledger-archived-but-absent: 0. On-disk-but-unledgered: 0. Artifacts absent from their ledger location: 0. One blemish: row 153 re-archives `2026-09-19-gemini-course-correction-implementation-report.md`, already archived with no intervening restore - a no-op duplicate, net state unaffected. |

## Falsification attempts against previously closed defects

All failed to falsify; each closed defect held.

- **C40-01..C40-08 matrix.** `node .ai/runtime/wave-c-probe2.cjs`: A 0/0, B 0/0, C 1/1, D 1/1,
  E 1/1, F 1/1, G 1/1, H 1/1, I 0/0, J 1/1. **10/10 agreement, no mismatch.**
- **F-5 PS `headerEnd` line-0 bounds** (the item the reissued review omits). Own fixture K,
  review file beginning with `---` and carrying `Verdict: PASS` as its **last** line: **PS=1,
  Node=1**, both "independent review ... missing a Reviewer". The header region evaluated
  empty; the last line was not spliced in. Control K2, identical fields in a real header
  region: both engines parse the header and advance past it to the journal-binding check.
  The code fix is correct in both engines and carries regression test `ok 300`. S-4 is a
  documentation gap, not a code risk.
- **Header contract of the reissued review.** Fixture X2 copies the real file byte-for-byte:
  bare `Verdict: PASS`, `Mode: CERTIFYING`, `Receipt-Owner: deepseek-59c81998639a4feb`,
  `Reviewer:` all parse in both engines; gate returns **0/0** once the journal cites it.
  The header is not the obstacle; S-2 is.
- **C40-07 corpus counter.** Fixture L, four files of 200,000 B each including a `.txt`, a
  nested `.md` and a `.bin` two levels deep: WARN "4 files / 781,2 KB; limit 60 files /
  600 KB" - non-`.md` and nested files are counted. L2, two of them moved under
  `docs/reviews/archive/`: warning gone. Exclusion and recursion both hold, and this pins
  the byte cap at 614,400 B, under which 604,675 B passes.
- **Evidence chain.** `node .ai/bin/protocol-handoff.cjs verify` and `verify --deep` both
  exit 0: "evidence matches the current tree" for `deepseek-59c81998639a4feb`. The tree has
  not moved since that record.

## Per-item verdicts against the brief

1. Acceptance measurements - **FAIL**. Suite 300/300 with 0 fail is confirmed, and at T0 the
   corpus was within both caps. Validator is exit 0 but **1 warning** at T0 and **2** at T1,
   never 0; journals are 31 against a cap of 30 (S-3); the corpus is over the byte cap at
   T1 (S-8).
2. F-6 TASK/PLAN vs measurement - **FAIL** (S-1).
3. F-7 Receipt-Owner journal citation - **FAIL** (S-2).
4. F-9 prompt and review coverage - **FAIL (partial)**. Prompt side **PASS**: all five
   fix-round items covered, 54 lines, within the 150-line cap. Review side fails on the PS
   `headerEnd` item (S-4). The header contract parses in both engines.
5. Controller matrix - **PASS**. 10/10 agreement; no case needed reproduction in my own
   fixtures, and the two I rebuilt independently (line-0 header, corpus counter) agreed.
6. Ledger net replay - **PASS** (S-7).
7. Falsification of previously closed defects - **PASS**. Nothing previously closed was
   falsified; four independent probes all confirmed the fixes.

## Assessment

Every engineering defect of Wave C is closed and stays closed under adversarial probing.
The suite is green at 300/300, the two engines agree on all ten matrix cases, and the four
fixes I re-derived myself behave as documented. Nothing here is a code regression.

What fails is closure bookkeeping, and it fails the same way twice. F-6 and F-7 were both
closed, and both were reopened by the **next session of the same owner**: the
cycle-architecture pass added two artifacts without updating TASK/PLAN (S-1) and archived
the citing journal entry into `.ai/ARCHIVE.md` (S-2). A closure whose evidence is
point-in-time and whose state is mutated by the following session is not a closure. S-3 and
S-6 are the same shape: the pass left zero journal headroom plus an unstaged phantom, and
9,725 B of corpus headroom, so the external spot review that TASK itself mandates breaches
two budgets merely by existing.

S-8 is the sharpest form of the same problem and it happened while I was measuring: a
concurrent session added 53 KB to the review corpus, which invalidated every receipt in the
repository and pushed the corpus over cap. The closure cannot be certified against a tree
that another session is still writing to.

The verdict is FAIL because seven mandatory items are unresolved on the current tree, not
because any of them is hard to fix. None requires a code change.

## Limits

- One machine, one shell (Git Bash + Windows PowerShell 5.1), one locale, one Node
  (v22.21.0). Unlike the predecessor Codex session, `git` and the child test runners
  spawned normally here; its EPERM failures did not reproduce and are environmental.
- I did not re-derive every one of the 300 suite assertions; I read the summary and the
  named F-1..F-5 subtests.
- S-1 attributes the 15,524 B delta by file size arithmetic, not by a byte-level diff of
  the corpus at the moment TASK was written; the conclusion that TASK/PLAN are stale does
  not depend on the attribution.
- Fixtures X1/X2, K/K2 and L/L2 use `tests/helpers.cjs` fixtures seeded from this
  repository. A defect in the helpers would be invisible to me.
- Capability is asserted by the orchestrator profile, not self-declared: this session has
  FS_WRITE (limited to this file, my journal and my evidence), SHELL_EXEC, REPO_READ and
  EVIDENCE_SIGN.
- The suite was run once, at T0. I did not re-run it after the T1 write; the concurrent
  artifact is a document under `docs/reviews/` and cannot affect test outcomes, but that is
  an inference, not a measurement.
- S-8's attribution rests on file mtimes and byte arithmetic. I did not read the concurrent
  session's artifact for judgement and take no position on its content.
- This review certifies the state of the closure, not the product pilots, and reopens no
  decision. The owner-Proposed cycle-architecture strategy was out of scope and unread for
  judgement.
