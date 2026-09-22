# DeepSeek - Round-2 Independent Certifying Audit: Course Correction Recovery Package

**Date**: 2026-09-20 (UTC; filename carries the dispatched 2026-09-19 date)
**Reviewed commit**: d38d2f2ae4b4c17fe6c2c18f11215cedb2f10eb1
**Working tree**: dirty (the audited change set remains uncommitted, as dispatched)
**Reviewer**: DeepSeek (deepseek-07b028e6098381a7), independent of the implementer
**Mode**: CERTIFYING (FS_WRITE, SHELL_EXEC, EVIDENCE_SIGN, REPO_READ)
**Receipt-Owner**: deepseek-07b028e6098381a7
**Scope**: round-1 findings F-1..F-4 and M-1..M-7; PROTO-DEC-0036..0039; corpus archive and INDEX; grand-consensus v2; TASK, PLAN, AGENTS.md, QUICKSTART.md; append-only, triggers, provenance, encoding, size limits, dispatch coverage, worklog citations
**Authorizing prompt**: docs/reviews/2026-09-19-course-correction-adversarial-audit-prompt.md (line 64 names this certification path)
**Round-1 predecessor**: docs/reviews/2026-09-19-deepseek-course-correction-certification.md (FAIL)
**Verdict**: **RECOMMENDATION** - all four FAIL findings are fixed and reproduced; the single remaining item is the owner-tunable PROTO-DEC-0037 cap waiver documented by the implementer.

---

## 1. Commands executed (all reproduced by this reviewer, 2026-09-20 UTC)

| Command | Result |
|---|---|
| `powershell -ExecutionPolicy Bypass -File .\validate-protocol.ps1` | exit 0, **1 WARN** (31 journals); 235 files inspected; 39 decision blocks; "35 committed decision blocks are unchanged" |
| `powershell -ExecutionPolicy Bypass -File .\test-protocol.ps1` | exit 0, `# pass 255 / # fail 0 / # skipped 0` in 136.6 s |
| `node .ai/bin/protocol.cjs doctor` | exit 0, `Verdict: Protocol Healthy` (known 10 legacy-receipt warnings) |
| `node .ai/bin/protocol-handoff.cjs gate-check` | exit 0, `not applicable: task status is In progress` |
| `node .ai/bin/protocol-handoff.cjs verify --owner gemini-b67e88f213c39b83` | **stale** (recorded `d1d83c1c...`, tree now `d490461a...`) - expected, the tree moved after the re-record |
| Encoding probe (BOM/CRLF) on 184 review/shared/journal files | clean: UTF-8 no BOM, LF |
| Corpus measurement | root 66 files / 819,168 B; archive 80 files (79 moved + `INDEX.md`) / 743,746 B |
| INDEX parse | 93 rows (86 forward + 7 reverse restoration rows); every file resolves at its final location |
| Worklog citation scan (all `docs/reviews/*` paths under `.ai/worklog/*.md`) | 47 distinct paths; 46 resolve; 1 documented exception below |
| `git rev-parse HEAD` | `d38d2f2ae4b4c17fe6c2c18f11215cedb2f10eb1` |

### F-1 reproduction detail (journal count)

`validate-protocol.ps1:216` warns only when the unique union of on-disk and tracked journals exceeds 30.
The union is 31; removing this audit's own journal yields **30, i.e. no warning**. The three pruned Claude
journals are staged deletions (`D ` in `git status`), tracked journals are 26, and the implementation's own
record state was 27 journals (26 tracked + its session journal). The warning present in the table above is
caused by this certification session's journal (the 31st), not by the implementation.

## 2. Round-1 findings: fix verification

| Finding | Status | Reproduction |
|---|---|---|
| F-1 validator not warning-free; warning undisclosed | **Fixed** | Three Claude journals staged-deleted (`git status --short .ai/worklog` shows `D ` for `claude-2bbb5fe2d47c227e.md`, `claude-41f5aa2823fa5905.md`, `claude-f645d06b4364f5ed.md`); implementation report section 4.4 now documents the staging and the 0-warning result. Union journal count excluding the round-2 journal = 30 (`> 30` threshold, `validate-protocol.ps1:216`). Residual: the 30-journal cap has no headroom for audit/record sessions - see N-3. |
| F-2 report statistics inconsistent by one file | **Fixed** | The report now explains the 138 -> 137 correction (section 2, "Baseline Reconciliation"). Counts reproduce: current 146 files - 9 files created since baseline = 137; 137 - 70 + 1 (v2) = 68; 68 + 5 - 8 + 2 - 8 = 59, plus the post-68 artifacts (audit prompt 5,279 + report 11,227 + round-1 certification 12,812) and excluding the 4 post-certification files gives the current 62-file implementation set. Every itemized delta reproduces to the byte: +60,859 (5 restorations), -95,752 (8 working files), +24,778 (2 dispatch restorations), -41,314 (8 uncited). |
| F-3 active corpus exceeds its own cap | **Documented + waiver requested** | Report section 2.3 states 62 files / 783,059 B against 60 files / 614,400 B and requests tuning to 65 files / 800 KiB. Re-measured 62-file set: 66 - 4 post-certification files (2 MCP advisory + 2 Codex files) = 62 files / 783,735 B. Byte residual 676 B (0.09 %) is the report's own post-measurement edit; see N-1. This is the owner item. |
| F-4 open-decision citations archived | **Fixed** | `docs/reviews/2026-09-18-grand-council-consensus-v1.9.0.md`, `docs/reviews/2026-09-19-deepseek-flash-mcp-selection-analysis.md`, `docs/reviews/2026-09-19-h1-pilot-design.md`, `docs/reviews/2026-09-18-deepseek-flash-p5-gate-review.md`, `docs/reviews/2026-09-17-three-repository-review.md` all exist at the root; none exists under `archive/`. `Test-Path` resolves the citations at `.ai/DECISIONS.md:1248`, `:1549`, `:1581` (PROTO-DEC-0026/0034/0035), `.ai/docs/PROTOCOL.md:224` and `tests/upgrade.test.cjs:8`. `INDEX.md` rows 77-81 record the reverse moves. |
| M-7 self-certification label | **Fixed** | Report header now reads `Author: Gemini 3.8 Flash (implementer self-report, lock holder)` and `Mode: IMPLEMENTER`, `Verdict: IMPLEMENTATION COMPLETE`. No `CERTIFYING` claim remains in it. |
| Prompt path naming | **Fixed** | `docs/reviews/2026-09-19-course-correction-adversarial-audit-prompt.md:64` names `docs/reviews/2026-09-19-deepseek-course-correction-certification.md` as the publication path. |

Other minors: M-1 fixed (report now says 17 test suites; repository has 17 `tests/*.test.cjs`); M-2 fixed
("quarantined 3 empty header-only journals", staging per PROTOCOL.md:220 step 3); M-3 disclosed by an
in-report note (decision-text line citations cannot be edited - PROTO-DEC-0033 append-only); M-4 fixed
(grand-consensus v2 line 132 now `Reopen-trigger: owner-directive`); M-6 remains the one permitted
exception - see section 3.

## 3. Full re-run audit scope

- **Append-only discipline**: `git diff --stat` shows `.ai/DECISIONS.md` +124/-0 (four appended blocks at lines 1602-1722) and `docs/decisions/REGISTRY.md` +4/-0 (rows 53-56). Validator: "35 committed decision blocks are unchanged"; no immutability warning for the registry.
- **Triggers (PROTO-DEC-0033 taxonomy)**: all four new blocks and rows use `owner-directive` (`.ai/DECISIONS.md:1606,1635,1665,1694`; `REGISTRY.md:53-56`); validator raises no unknown-trigger warning.
- **PROTO-DEC-0030 provenance**: all four blocks carry `Approved by: RuslanFomenko (direct owner confirmation in chat, 2026-09-19, transcribed by gemini-b67e88f213c39b83)` (lines 1627, 1656, 1686, 1722), matching the transcription rule.
- **Decision content spot-checks**: 0036 records +72.79 % / +9.10 % / +60.20 % / +42.76 %, "the stop rule was executed as written", PROTO-DEC-0034 in force, 25 %/+5 % retained; 0038 supersedes PROTO-DEC-0027 item 1 only and says items 2-7 remain in full force; 0039 keeps the freeze, two-repository pilot, triage-first, disjoint sessions and kill criterion.
- **Dispatch-protected basis files**: `2026-09-19-council-synthesis-course-correction.md` (12,664 B) and `2026-09-19-final-course-decision-prompt.md` (12,114 B) are back at the root; `INDEX.md` rows 90-91 record the reversals.
- **Grand-consensus v2**: `Supersedes` (line 11), `**Mode**: ADVISORY` (line 10), `Receipt-Owner: none` (line 12), draft block trigger `owner-directive` (line 132); the superseded original stays immutable in `archive/`.
- **Encoding**: no BOM, no CRLF in any of the 184 probed files, including the two controller-added advisory files (`2026-09-19-mcp-context-layer-discussion-basis.md`, `2026-09-19-universal-council-prompt-mcp-context-layer.md`) and the two Codex files; the validator inspected 235 protocol-owned text files cleanly.
- **Size limits**: TASK 48/80, PLAN 60/200 (validator); journals max 123/150 (validator); prompt/report caps of PROTO-DEC-0038 respected - adversarial prompt 64 lines, implementation prompt 89, implementation report 113, round-1 certification 122, v2 reissue 188, Codex council prompt 75, Codex audit 93; all <= 250.
- **Dispatch coverage**: the adversarial prompt's checklist covers dispatch sections 3.2 (Item 2), 3.3 (Item 1), 3.4 (Item 3), 3.5/3.6/3.7 (Item 4), and the AGENTS/QUICKSTART alignment (Item 5); the general instructions cover the 3.1/3.8 evidence-and-record scope. One stale phrase remains: Item 2 says "70 archived files" whereas the archive now holds 79 moved files; the prompt predates the remediation and INDEX rows 77-99 record every subsequent move (informational).
- **Worklog citation resolution**: 46 of 47 distinct `docs/reviews/*` paths cited under `.ai/worklog/*.md` resolve. The single exception is `docs/reviews/2026-09-19-grand-consensus-systemic-course-correction.md`, the superseded original that dispatch section 3.4 explicitly directed to archive after reissue and round-1 accepted as the sole permitted exception; it resolves via `docs/reviews/archive/INDEX.md` (row 61).
- **Archive safety**: no `Mode: CERTIFYING` file from round 1 is missing; the round-1 certification itself is present at the root and was counted in the implementation's 62-file set.

## 4. Residual observations (non-blocking)

- **N-1 (statistics)**: the report's final byte figure 783,059 B does not reproduce exactly: the same 62-file set measures 783,735 B today, a 676-byte (0.09 %) difference consistent with the report's own post-measurement edits (the report is itself a corpus member; its added M-3 note alone is 410 bytes). The file count and all seven itemized deltas reproduce exactly; no structural conclusion (including the waiver) changes.
- **N-2 (stale prompt count)**: audit prompt Item 2 says "70 archived files"; final archive count is 79 moved files + `INDEX.md` (93 rows). Informational, historical artifact.
- **N-3 (journal-cap headroom)**: the 30-journal worklog cap leaves only three slots for audit and record sessions after an implementation. The implementation state was warning-free (27 journals); three post-implementation audit journals brought it to 30; this certification's journal is the 31st and triggers the single WARN. The same owner cap decision below should account for the journal limit or a hand-archiving pass, otherwise the completion record pass will keep reporting it.
- **N-4 (implementer receipt freshness)**: `verify --owner gemini-b67e88f213c39b83` is stale against the current tree because post-record audit artifacts were added. The task is `In progress`, so `gate-check` is not applicable; a fresh receipt must be recorded on the frozen tree when the task completes (already tracked in `.ai/TASK.md` Open questions).

## 5. Owner item (basis for RECOMMENDATION)

PROTO-DEC-0037 item 3 makes the active `docs/reviews/` cap (60 files / 600 KB) "recommended, owner-tunable".
The implementation report section 2.3 documents the blocker - every remaining file is cited by live text,
receipts, decisions or carries `Mode: CERTIFYING` - and requests tuning to 65 files / 800 KiB. Current
numbers: the implementation set is 62 files / 783,735 B; with the controller and Codex advisory artifacts
and this certification the active window is 67 files / 831,534 B (measured after this file was written). The owner
should either grant the waiver/tuning with enough headroom for certifying artifacts and the pilot phase, or
direct further archiving. This is the only item standing between the package and PASS.

## 6. Verdict

**RECOMMENDATION.** F-1, F-2, F-3 (as documented with an explicit waiver request) and F-4 are all fixed and
reproduced from the current tree; append-only, triggers, provenance, encoding, size caps, dispatch coverage
and citation resolution all verify. Certificate integrity holds: the round-2 suite is 255/255 with exit 0,
`doctor` is healthy, and the only validator warning is this audit's own journal under a cap whose
disposition is the recommended owner item. Per the dispatch stop point, the product pilots may start once
the owner confirms this outcome and disposes of the cap.
