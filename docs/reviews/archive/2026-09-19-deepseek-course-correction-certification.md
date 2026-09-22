# DeepSeek - Independent Certifying Audit: Course Correction Recovery Package

**Date**: 2026-09-19
**Reviewer**: DeepSeek (deepseek-ca93599cfe8cca6b), independent of the implementer
**Mode**: CERTIFYING (FS_WRITE, SHELL_EXEC, EVIDENCE_SIGN, REPO_READ)
**Receipt-Owner**: deepseek-ca93599cfe8cca6b
**Reviewed commit**: d38d2f2ae4b4c17fe6c2c18f11215cedb2f10eb1
**Working tree**: dirty (the audited change set is uncommitted, as dispatched)
**Scope**: PROTO-DEC-0036..0039, review-corpus archive + INDEX, grand-consensus v2, TASK, PLAN, AGENTS.md, QUICKSTART.md, evidence and receipt chain
**Authorizing prompt**: docs/reviews/2026-09-19-course-correction-adversarial-audit-prompt.md
**Path note**: the prompt names `2026-09-19-deepseek-flash-course-correction-audit.md`; eval-P4:190 and the owner instruction name the certification path below. This file follows the owner instruction.
**Verdict**: **FAIL** (integrity-critical items pass; four reproducible defects below block certification)

---

## 1. Commands executed (all reproduced by the reviewer, 2026-09-19)

| Command | Result |
|---|---|
| `powershell -ExecutionPolicy Bypass -File .\validate-protocol.ps1` | exit 0, **1 WARN** (`32 session journals`), `Protocol OK. 1 warning(s).` |
| `powershell -ExecutionPolicy Bypass -File .\test-protocol.ps1` | exit 0, `# pass 255 / # fail 0` in 123 s |
| `node .ai/bin/protocol.cjs doctor` | exit 0, `Verdict: Protocol Healthy` (warnings: 10 legacy receipts) |
| `node .ai/bin/protocol-handoff.cjs gate-check` | exit 0, `not applicable: task status is In progress` |
| `node .ai/bin/protocol-handoff.cjs verify --owner gemini-b67e88f213c39b83` | exit 0, `evidence matches the current tree` (measured before this review file existed) |
| `node .ai/bin/protocol-lock.cjs status` | lock null, operation gate clean |
| INDEX parse | 70/70 rows resolve; every archived path exists, every old path is gone |
| Worklog citation scan (`docs/reviews/*.md` under `.ai/worklog/*.md`) | 41 distinct paths, 40 resolve, 1 archived-by-exception |
| Encoding probe (BOM/CRLF) on all new/modified files | clean, UTF-8 no BOM, LF |
| Line counts | TASK 48/80, PLAN 60/200, longest journal 123/150 |

## 2. Checklist verdicts

| Audit item | Verdict | Note |
|---|---|---|
| 1. Decision blocks and registry | PASS | Appended only; provenance exact; triggers valid; 0038 supersedes 0027 item 1 only; 0036 numbers/stop-rule wording exact |
| 2. Corpus archival and receipt safety | PARTIAL | INDEX 70/70 accurate; no journal-cited or `Mode: CERTIFYING` file moved except the permitted superseded original; **but** three open-decision citations now point at archived paths (F-4) |
| 3. Grand-consensus reissue v2 | PASS | `Supersedes:`, `Mode: ADVISORY`, `Receipt-Owner: none`; unverified `Approved by` and `Status: Accepted` removed; mojibake converted to ASCII; original immutable in archive/ |
| 4. TASK.md and PLAN.md | PASS | Limits respected; `## Objective` and metrics from old `PLAN.md:63-68` preserved verbatim; two parallel streams, triage-first, disjoint sessions, kill criterion present |
| 5. AGENTS.md and QUICKSTART.md | PASS | Section 2 risk-scaled review and section 8 cap row match PROTO-DEC-0038/0037 |

## 3. Fail-level findings

### F-1: The validator is not warning-free and the report does not disclose the warning

Dispatch §3.8.1: "Run `validate-protocol.ps1` (expect 0 warnings)". TASK Constraints: "Validator 0 warnings; journals <= 30 files".

```
powershell -ExecutionPolicy Bypass -File .\validate-protocol.ps1
  -> [WARN] 32 session journals in .ai/worklog; archive the oldest into .ai/ARCHIVE.md
  -> Protocol OK. 1 warning(s).   (exit 0)
git status --short .ai/worklog     -> " D .ai/worklog/claude-2bbb5fe2d47c227e.md" (3 of 3, unstaged)
git ls-files .ai/worklog           -> 30 tracked entries (29 journals + README)
Get-ChildItem .ai/worklog -Filter *.md -File -> 30 files (29 journals + README)
```

`protocol-archive.cjs status` reports 29/30 active journals; the validator counts the union of on-disk and tracked paths, so the three pruned-but-unstaged tracked journal files keep the count at 32. PROTOCOL.md:218-220 step 3 (`git add -A -- <removed-path>`) was not executed, so the warning was avoidable without a commit. The implementation report §4 item 4 states only "Exit 0 ... 0 failures" and never mentions the warning; only the journal entry discloses it. A green validator was a stated expectation and is a TASK constraint.

### F-2: The report's corpus statistics are internally inconsistent by one file

```
(Get-ChildItem docs/reviews -File).Count                                  -> 70
(Get-ChildItem docs/reviews -File | Measure-Object Length -Sum).Sum       -> 818607
# report §2 claims: before 138 files / 1468700 B, after 68 files / 805859 B, moved 70 / archived 680070 B
# bytes reconcile exactly: 818607 - 7471 (report) - 5277 (prompt) = 805859;  805859 - 17229 (v2) + 680070 = 1468700
# count does not: 68 - 1 (v2 was created during this implementation; mtime 22:31Z, after §3.1) + 70 = 137, not 138
```

The after-set (68 files) contains grand-consensus v2 (17,229 B); the before-byte figure excludes it, which is correct only if v2 was created after the before-measurement. The before file count of 138 is therefore one too high (or the after count is one too low). The 68-file keep-set total itself is confirmed: 67 `.md` + `2026-09-19-codex-trackc-h1-probes.cjs`, and the stated "38 worklog-cited" is accurate for the archive-time state (41 today minus the three artifacts created after the archive).

### F-3: The active corpus exceeds the cap adopted in the same package

```
(Get-ChildItem docs/reviews -File).Count                     -> 70        (limit 60, AGENTS.md section 8)
(Get-ChildItem docs/reviews -File | Measure-Object Length -Sum).Sum -> 818607  (limit 614400 = 600 KiB)
```

The cap was introduced by PROTO-DEC-0037 item 3 and AGENTS.md section 8 in this same change, repeated as a TASK constraint ("active `docs/reviews/` <= 60 files / 600 KB"), and the owner ruling's target was ~50 kept files; the report's own after-archive state (68 files / 805,859 B) was already over. The cap text says "recommended, owner-tunable" with staggered WARN/FAIL enforcement, so this needs an explicit owner decision (archive ~10 more uncited files or record a waiver), not silent presentation as PASS. The report does not disclose the overage.

### F-4: Three open-decision citations resolve only under `archive/`, contradicting PROTO-DEC-0037 item 1

PROTO-DEC-0037 item 1 (adopted here): the active window "holds ... every path cited by a live (verifying) receipt, an open task or an open decision".

```
Select-String .ai/DECISIONS.md -Pattern 'mcp-selection-analysis|h1-pilot-design|grand-council-consensus'
# 1248: PROTO-DEC-0026  -> docs/reviews/2026-09-18-grand-council-consensus-v1.9.0.md
# 1549: PROTO-DEC-0034  -> docs/reviews/2026-09-19-deepseek-flash-mcp-selection-analysis.md  (0034 is "in full force" per 0036 item 2)
# 1581: PROTO-DEC-0035  -> docs/reviews/2026-09-19-h1-pilot-design.md
Test-Path docs/reviews/2026-09-19-deepseek-flash-mcp-selection-analysis.md         -> False
Test-Path docs/reviews/archive/2026-09-19-deepseek-flash-mcp-selection-analysis.md -> True
```

This trade-off was anticipated in eval-P4:73 ("Review paths cited by immutable historical text ... no longer resolve ...; INDEX.md preserves the mapping") and the INDEX does resolve them, and `gate-check` is unaffected while the task is In progress. It is still a rule/state contradiction inside the accepted package: the retention rule its own item 1 states is violated by the state adopted with it. Owner waiver or restoration of the three files is required. The same class affects `.ai/docs/PROTOCOL.md:224` and a comment in `tests/upgrade.test.cjs:8` (both cite archived files).

## 4. Minor findings and recommendations

- **M-1** Report §4 item 7 claims "18 test suites"; the repository has 17 `tests/*.test.cjs` files (255 subtests confirmed). Count is wrong.
- **M-2** Report §4 item 8 says `prune` cleaned "3 uncommitted empty journals"; the three claude journals were committed, header-only templates (`git show HEAD:.ai/worklog/claude-2bbb5fe2d47c227e.md`). "Uncommitted" is wrong, and PROTOCOL.md step 3 staging is missing (see F-1).
- **M-3** Stale line-number citations after the PLAN rewrite: PROTO-DEC-0039 context cites `.ai/PLAN.md:51-54`, item 2c cites `PLAN.md:63-68`, item 2d cites `PLAN.md:67-68`; the new PLAN.md is 60 lines and holds the metrics at 20-25. The metrics text is verbatim (verified) but the line numbers no longer resolve. Same stale `PLAN.md:51-54` in grand-consensus v2 line 25.
- **M-4** Grand-consensus v2 keeps the draft block with `Reopen-trigger: metric-gain-in-consumer-repo`, not in the PROTO-DEC-0033 taxonomy, while the accepted PROTO-DEC-0036 uses `owner-directive`. It is a draft inside an advisory file, but the mismatch can mislead.
- **M-5** Dispatch §3.1 asked for baseline (before-archive) validator and count evidence; the report shows only post-state commands and reconstructed counts, which is where F-2 originates.
- **M-6** Report §2 "All live receipt citations under `.ai/worklog/*.md` ... remain untouched" overstates: `gemini-434bcd8012e0f38c.md:15` cites the grand-consensus original, which moved to archive/ (the prompt's one permitted exception).
- **M-7** `docs/reviews/2026-09-19-gemini-course-correction-implementation-report.md` declares `Mode: CERTIFYING`, `Receipt-Owner: gemini-b67e88f213c39b83`, `Verdict: PASS` for the implementer's own work. It is journal-mentioned and its receipt verifies, so it could satisfy a future completion gate as an "independent review" although it is self-certification. The independent review is this file. Recommend re-labeling it as a self-report or adding an implementer/reviewer independence check.

## 5. Verified clean (no findings)

- Append-only: `.ai/DECISIONS.md` diff is four appended blocks only; validator "35 committed decision blocks are unchanged"; `docs/decisions/REGISTRY.md` diff is four appended rows only, existing rows untouched.
- Provenance: all four blocks carry `Approved by: RuslanFomenko (direct owner confirmation in chat, 2026-09-19, transcribed by gemini-b67e88f213c39b83)`; triggers are `owner-directive` from the PROTO-DEC-0033 taxonomy.
- PROTO-DEC-0036 records +72.79% broad total, +9.10% broad fresh, +60.20% narrow total, +42.76% narrow fresh and "the stop rule was executed as written"; PROTO-DEC-0034 remains in force.
- PROTO-DEC-0038 supersedes PROTO-DEC-0027 item 1 only; all 7 items of 0027 exist and items 2-7 remain in force; AGENTS.md §2 and QUICKSTART.md §2 match.
- INDEX: 70 rows, each new path present and each old path absent; archive contains exactly those 70 files plus INDEX.md.
- `Mode: CERTIFYING` metadata scan: 25 active files in root; exactly one archived file carries it — the superseded grand-consensus original, the prompt's explicit exception.
- Reissue v2: mojibake converted to ASCII (`в””` artifacts absent), `Approved by`/`Status: Accepted` removed from the draft block, original immutable in archive/.
- TASK.md: 48 lines, `Status: In progress`, no completion gate, roles `gemini: implementer` / `deepseek: reviewer, auditor, controller`, audit-round criterion correctly still unchecked.
- PLAN.md: 60 lines, `## Objective` and the five metrics verbatim from old lines 63-68, two parallel pilot streams, triage-first, disjoint sessions, kill criterion, freeze.
- Encoding: BOM/CRLF-free on every new or modified file; validator inspected 228 protocol-owned text files cleanly.
- Evidence: `verify --owner gemini-b67e88f213c39b83` freshly matched the tree before this file was written; `doctor` and `gate-check` clean.

## 6. Verdict

**FAIL.** The package's integrity-critical content is sound — decisions, provenance, append-only discipline, archive mapping, reissue, TASK, and PLAN all verify. It cannot be certified as-is because F-1 (a stated 0-warning expectation is not met and the warning is omitted from the report), F-2 (report statistics do not reconcile), F-3 (the active corpus exceeds the cap recorded by the same change), and F-4 (open-decision citations were archived against the package's own retention rule) are all reproducible from the current tree.

Required before re-record/certification: stage the three pruned journals (or record a reasoned waiver of the warning), reconcile the report's corpus table, decide the cap disposition (archive ~10 more uncited files or record an owner waiver), and restore or explicitly waive the three decision-cited paths; optionally re-label the implementation report (M-7) and correct M-1/M-2. Per the dispatch's stop point, the product pilots start only after a PASS/RECOMMENDATION or an explicit owner decision on this verdict.
