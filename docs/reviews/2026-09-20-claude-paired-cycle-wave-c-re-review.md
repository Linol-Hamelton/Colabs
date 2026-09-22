# Certifying Review: Paired-Cycle Wave C limited external re-review (C40-01..C40-08)

Reviewer: Claude Opus 5 (external limited re-reviewer, outside the DeepSeek-Gemini pair)
Date: 2026-09-20
Reviewed commit: d38d2f2ae4b4c17fe6c2c18f11215cedb2f10eb1
Working tree: dirty (uncommitted Wave C set; measurements taken at 2026-09-20 ~20:20-20:45 local)
Mode: CERTIFYING
Receipt-Owner: claude-b5daf6a83e33d743
Scope: re-verification of the eight reproduced defects C40-01..C40-08 from `docs/reviews/2026-09-20-codex-paired-cycle-remediation-reaudit.md` on the current tree, plus third-party coverage of the three areas DeepSeek touched (PLAN Wave C section, unified prompt refresh, R8 journal housekeeping). Read-only with respect to the repository; all fixtures under the system temp directory. The owner's parallel Claude analysis artifacts were not read for judgement and are not assessed here.
Verdict: FAIL

Two mandatory items are unresolved on the current tree: C40-08 (the regression suite is red and its
own per-tag coverage test reports a false PASS) and C40-04 (the two engines do not agree on the
`Reviewer:` requirement). Six of eight items are verified fixed. Nothing found is a regression of a
previously closed item; the failures are in the new Wave C artifacts themselves.

## Measurements actually taken

| Measurement | Command | Result |
|---|---|---|
| Validator | `powershell -ExecutionPolicy Bypass -File .\validate-protocol.ps1 -Quiet` | exit 0, **1 warning**: `36 session journals in .ai/worklog (cap 30 ...)` |
| Regression suite | `powershell -ExecutionPolicy Bypass -File .\test-protocol.ps1` | exit **1**; `# tests 295`, `# pass 293`, `# fail 2`, 212.9 s |
| Controller probe | `node .ai/runtime/wave-c-probe2.cjs` (read first, then run) | 10 of 10 cases A-J `OK`, both engines agree |
| Active review corpus | `find docs/reviews -type f -not -path "docs/reviews/archive/*"` | **54 files / 543,892 bytes (531.1 KB)**; 0 non-`.md`; cap 60 / 600 KB not exceeded |
| Corpus counter parity | source fixture seeded with the real corpus + 7 filler files | validator prints `61 files / 531,2 KB` - matches my independent count exactly |
| Session journals | `ls .ai/worklog/*.md` | **36 files**; 30 carry a dated entry, 6 are empty SessionStart placeholders |
| Archive ledger | net replay of `docs/reviews/archive/INDEX.md` against disk | 130 files tracked, **130 consistent, 0 inconsistent**, 116 physical archive `.md`, **0 without a ledger row** |

I reproduced the controller probe's ten cases rather than trusting them, then added eleven cases of
my own (K-V below) in fresh TEMP fixtures built by the real installer (`setup-ai-protocol.ps1`) and
by `makeProtocolFixture`, each run through `validate-protocol.ps1 -Quiet` **and**
`node .ai/bin/protocol-handoff.cjs gate-check`.

## Findings

| ID | Item | Severity | Finding | Reproduction |
|---|---|---|---|---|
| F-1 | C40-08 | BLOCKING | Tests 253 and 254 (`upgrade from historical release fixture v1.9.4 / v1.9.5 ...`) fail. `tests/upgrade.test.cjs:154` calls `run('tar', ['-xf', tarPath, '-C', oldSrc], tmp)` and never checks its status. `spawnSync` resolves `tar` to `C:\Program Files\Git\usr\bin\tar.exe` (GNU tar 1.35), which reads the Windows path `C:\Users\...\release.tar` as a remote host spec. Extraction silently produces an empty `old-src`, and the failure surfaces later as an opaque PowerShell `-File` error. | `node -e "...h.run('tar',['-xf',tarPath,'-C',oldSrc],tmp)"` -> `status=128`, `tar: Cannot connect to C: resolve failed`, `oldSrc entries=[]`. `where.exe tar` -> Git tar precedes `C:\Windows\System32\tar.exe`. |
| F-2 | C40-08 | BLOCKING | The per-tag coverage test (test 255, `tests/upgrade.test.cjs:177`) asserts only that the tags *exist*, not that the per-tag tests passed. With 253 and 254 red it still reports `ok 255` and prints `# Historical release upgrade suite PASS verified for tags: v1.9.4, v1.9.5`. A reader of the suite output is told the historical upgrade path is verified when it is not. | `grep -n "^not ok" suite.txt` -> 253, 254; three lines later `ok 255` plus the PASS diagnostic. |
| F-3 | C40-04 | BLOCKING | The engines disagree on `Reviewer:`. `validate-protocol.ps1:834` fails a strict-path review that names no `Reviewer:`; `protocol-handoff.cjs` has no `Reviewer` check anywhere in the strict path (lines 1219-1404 check Verdict, Date, Mode, Receipt-Owner only). `.ai/docs/PROTOCOL.md` and `.ai/docs/PAIRED-CYCLE.md` both document `Reviewer:` as a strict-path requirement, so Node under-enforces its own documented contract. | Case P: installed fixture, strict gate, review `Date: 2026-09-18` + `Verdict: PASS`, no `Reviewer:`. **PS=1** (`independent review must name a Reviewer`), **Node=0** (legacy warnings, exit 0). |
| F-4 | C40-06 | RECOMMENDATION | The two engines normalise the declared path differently. Node strips one leading `./` (`protocol-handoff.cjs:977-978`); PowerShell compares the raw value (`validate-protocol.ps1:779`, `:696`). A `./docs/reviews/x.md` entry is therefore rejected by PS as "outside docs/reviews/" in the source role and accepted by Node. Fail-closed (the stricter engine blocks), but the results are not identical. | Case T: source fixture, `- Adversarial review prompt: ./docs/reviews/p.md`, `- Independent review: ./docs/reviews/r.md`. **PS=1**, **Node=0**. |
| F-5 | C40-04 / artifact | BLOCKING for closure | The final DeepSeek review is itself rejected by the contract Wave C enforces. Its header line is `Verdict: PASS (external limited re-review still required by the acceptance criteria; see Remaining gate)`. Both engines require the verdict token to equal `PASS` or `RECOMMENDATION` exactly, so this file can never satisfy the completion gate as persisted. | Case R (real artifacts copied into a source fixture): **PS=1**, **Node=1**, both `verdict must be PASS or RECOMMENDATION, got PASS (external limited re-review ...)`. |
| F-6 | C40-08 | BLOCKING | TASK/PLAN statements do not match measurement. `.ai/TASK.md:51` states "full suite 270/270, validator 0 warnings, corpus 58 files, 27 session journals"; acceptance box `.ai/TASK.md:39` is ticked for "Final validator 0 warnings, full suite green". Measured: 295 tests with 2 failures, 1 validator warning, corpus 54 files, 36 journals. `.ai/PLAN.md` Wave C item 7 sets "full suite green; validator 0 warnings" as acceptance, which the tree does not meet. | The measurement table above. |
| F-7 | C40-03 | PRECONDITION | No journal in `.ai/worklog/` mentions `docs/reviews/2026-09-20-deepseek-paired-cycle-wave-c-review.md`, and `deepseek-59c81998639a4feb.md` has no Wave C entry (newest entry 07:56; the review was written 19:04). The binding mechanism is correct, so the gate would fail today if the task were marked Completed. The controller disclosed this sequencing in its own "Remaining gate" section; it is not a defect, but it must be closed before `Status: Completed`. | `grep -rln "2026-09-20-deepseek-paired-cycle-wave-c-review" .ai/worklog/` -> no match. Cases U/V below show the gate reacting correctly to both states. |
| F-8 | R8 | RECOMMENDATION | 36 journals against a cap of 30 raises the single validator warning. 30 carry entries; 6 are empty SessionStart placeholders created after Gemini's 18:13 delivery (19:03-20:24), one of them mine. At delivery time the count was 30. `protocol-session.cjs prune` clears the placeholders; the count still lands at 31 once this session's entry exists. | `ls -lt .ai/worklog/`; entry-bearing count 30, empty count 6. |

## Per-item verdicts

**1. C40-01 - core file named as the review artifact forces strict in both engines: VERIFIED-FIXED.**
Case C (probe): `CLAUDE.md` declared as `Independent review:` under `Scope: docs` - PS=1, Node=1.
Case N (mine): `docs/decisions/REGISTRY.md` in the changed set - PS=1, Node=1, both
`completed task is missing its adversarial review prompt field`, i.e. the classifier refused the
light path rather than the parser refusing the file. Protected-path evaluation precedes the review
exclusion in both engines (`protocol-handoff.cjs:1015-1053`, `validate-protocol.ps1:626-640`).

**2. C40-02 - baseline-based classification survives an ordinary commit; empty set stays strict: VERIFIED-FIXED.**
Cases A and B (probe): identical bytes before and after `git commit` both classify light - PS=0/Node=0
in both states. Case K (mine): everything committed at the baseline so the changed set is empty -
PS=1, Node=1. Suite tests `C40-02: light path rejects non-40-hex baseline before calling git` and
`gate-check: light path stays valid after ordinary commit of completed docs work` are green.

**3. C40-03 - journal binding for the persisted prompt and the final review: VERIFIED-FIXED (mechanism), PRECONDITION OPEN (current tree).**
Case U (mine): real prompt + real review (verdict normalised to bare `PASS` in the fixture only),
`Receipt-Owner` journal present with a valid receipt but no mention of the review path - PS=1,
Node=1, both `journal .ai\worklog\deepseek-59c81998639a4feb.md does not mention independent review
docs/reviews/2026-09-20-deepseek-paired-cycle-wave-c-review.md`. Case V: same tree with the path
cited in the entry - PS=0, Node=0, `completion gate verified: ... bound to ... (section 0)`. The
binding is exactly as specified. On the real tree the support does not yet exist (F-7), and the
review as persisted could not pass anyway (F-5).

**4. C40-04 - one review header contract in both engines: STILL-BROKEN (partial).**
Parity holds for the four sub-checks the re-audit reproduced: verdict suffix (case E,
`PASS WITH BLOCKERS`), transcription markers (case F), body-only `Reviewer:`/`Verdict:` beneath a
`## ` heading (case G) - PS=1/Node=1 in all three, and both engines fail on the parser, not on
classification, so the *reason* matches too. The contract's fifth element does not hold: `Reviewer:`
is enforced by PowerShell only (F-3). A latent PowerShell defect sits next to it - when the header
terminator is on line 0, `$reviewLines[0..($headerEnd - 1)]` evaluates the range `0..-1`, which in
PowerShell yields elements 0 and -1, so the file's last line is spliced into the header region
(`validate-protocol.ps1:730`, `:821`). I could not turn it into a false PASS, because both a `---`
and a `## ` first line leave Node with an empty header region and PS still short of a `Reviewer:`,
so both engines fail; it is a correctness hazard rather than a hole.

**5. C40-05 - only document extensions under docs/, plus root README/CHANGELOG: VERIFIED-FIXED.**
Case D (probe): `docs/auth.js` - PS=1, Node=1. Case M (mine): `docs/diagram.png` (non-executable,
non-document) - PS=1, Node=1. Case L (mine): `docs/a.rst` + `docs/b.txt` + root `README.md` together
- PS=0, Node=0, `completion gate verified (light path: docs, baseline: fad2937...)`. Case N confirms
`docs/decisions/` stays protected despite the `.md` extension.

**6. C40-06 - identical path contract in both engines: VERIFIED-FIXED for every reproduced defect.**
Case H (probe): in-root junction `docs/link/r.md` - PS=1, Node=1. Case O (mine): out-of-root
junction `docs/outlink/r.md` pointing at a TEMP directory - PS=1, Node=1, both
`independent review must be a safe path inside ... root`. Case I: `custom-audit/r.md` accepted in the
installed role (PS=0, Node=0). Case J: the same path rejected in the source role (PS=1, Node=1).
The residual `./`-prefix divergence (F-4) is a new observation, not one of the reproduced defects,
and it fails closed.

**7. C40-07 - recursive corpus counter excluding archive/, files and bytes, WARN-first: VERIFIED-FIXED.**
Four suite tests are green: non-`.md` in nested subdirectories counted (`61 files`), `archive/`
excluded at 65 files, byte limit tripped independently by one 650 KB file, and an out-of-root
junction under `docs/reviews/` not traversed. I confirmed the arithmetic against the real corpus: my
own walk gives 54 files / 543,892 bytes, and a fixture seeded with that corpus plus 7 files makes the
validator print `61 files / 531,2 KB` - the same numbers, and it warns without failing (exit 0).
My round-2 probe first reported "no warning" here; that was my own regex, which did not allow the
comma decimal separator of this locale. The counter is correct.

**8. C40-08 - docs and tests: STILL-BROKEN (partial).**
Fixed and verified: the CERTIFY template in `.ai/docs/PAIRED-CYCLE.md:138-172` is fenced with four
backticks around an inner three-backtick block; the gate test at `tests/gate.test.cjs:527` parses the
header out of the real `.ai/docs/PAIRED-CYCLE.md`, fills it and runs a real `record` + `gate-check`
(green); the light-gate contract is documented in full in `.ai/docs/PAIRED-CYCLE.md` section 3 and
`.ai/docs/PROTOCOL.md` "Completion gate and light-path contract", and both texts match the
implemented evaluation order step by step. Not fixed: the per-tag upgrade tests are red (F-1), their
coverage test reports a false PASS (F-2), and the TASK/PLAN statements do not match measurement
(F-6). The `t.skip()` calls are correctly named and would fire if the tags were absent - but here the
tags are present, so the skip path is not what is exercised.

## Areas DeepSeek touched (third-party coverage)

**PLAN Wave C section text: RECOMMENDATION.** `.ai/PLAN.md` (130 lines, within the 200 limit)
describes items 1-6 accurately; each clause matches code I read in both engines. Item 7's acceptance
clause - "the seven-item negative/positive matrix green in BOTH engines; full suite green; validator
0 warnings; limited external re-review PASS" - is not met by the tree it describes: the matrix is
green (I re-ran it), but the suite is red and the validator carries one warning. The section states
an intent that the tree has not reached; it needs reconciling with F-1, F-2, F-6 and F-8.

**Unified prompt refresh: PASS.** `docs/reviews/2026-09-20-gemini-paired-cycle-remediation-adversarial-prompt.md`
is 49 lines (cap 150), carries the exact title form, names implementer, reviewer, baseline anchor and
working-tree state, covers all of C40-01..C40-08 in the change list, and poses eight challenge
questions that map onto the eight findings. Its numbers have drifted: it claims the archiving
"reduc[ed] active count to 50 files and ~500 KB", where the corpus is now 54 / 531 KB - explained by
artifacts added after it was written, and still inside the cap. `tests/gate.test.cjs` and my case U/V
confirm the prompt satisfies the strict-path prompt check (`must identify a unified adversarial audit
prompt`).

**R8 journal housekeeping: PASS on the ledger, RECOMMENDATION on the count.** The archive mapping is
intact under append-only semantics: replaying `docs/reviews/archive/INDEX.md` forward and reverse
gives 130 tracked files, all 130 net states matching disk, and all 116 physical archive documents
carry a ledger row. My first pass flagged 13 "missing" destinations; that was my error - those rows
are archivals later reversed by restore rows recorded in the same append-only ledger, and the net
state is correct. The journal count is the one open item: 36 on disk against a cap of 30 (F-8),
attributable to six post-delivery SessionStart placeholders rather than to the Wave C work.

## Limits of this review

- One machine, one shell. F-1 is environment-dependent: it reproduces because Git's GNU tar precedes
  `System32\tar.exe` on this PATH. On a host where bsdtar wins, tests 253/254 pass and the suite is
  295/295 - which is the most likely explanation for the controller's reported green run. The test is
  fragile rather than unconditionally broken, but it is red on this tree in this environment and the
  unchecked `tar` exit status is a real defect either way. F-2 is unconditional.
- I did not attempt to defeat the baseline self-declaration, which both the prompt and the runbook
  already record as accepted residual risk.
- Case Q (a current-dated CERTIFYING review with no `Reviewer:`) converged at PS=1/Node=1 only
  because my fixture's receipt recorded a failing check; it neither confirms nor refutes F-3. Case P
  is the clean demonstration.
- Junction cases required Windows privileges; all of them created successfully here, so nothing was
  skipped for that reason.
- I read `.ai/TASK.md`, `.ai/PLAN.md`, both engine implementations, the Wave C tests, both runbook
  documents, the ledger and the journals. I did not read the owner's parallel Claude analysis
  documents for judgement and offer no opinion on them.
- Read-only: no repository file was modified, moved or deleted by this session other than creating
  this review and this session's own journal. No commit, no tag, no push, no lock taken, no edit to
  TASK/PLAN/DECISIONS/REGISTRY.

## What would turn this into a PASS

1. Make `tests/upgrade.test.cjs` assert the `git archive` and `tar` exit statuses and extract in a
   way that does not depend on PATH order (`--force-local`, or an explicit interpreter choice).
2. Make the coverage test depend on per-tag *results*, not on tag presence, so it cannot print
   "PASS verified" over red tests.
3. Add the `Reviewer:` check to the Node strict path so both engines enforce the documented header
   contract, and align `./`-prefix normalisation.
4. Re-issue the DeepSeek Wave C review with a bare `Verdict: PASS` line, and give it a journal entry
   citing its own path plus a final-tree receipt.
5. Reconcile `.ai/TASK.md` and `.ai/PLAN.md` with measured numbers, and prune the empty journals.
