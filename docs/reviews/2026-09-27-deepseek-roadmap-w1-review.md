# DeepSeek Flash - ROADMAP-1 wave-1 independent review

**Date**: 2026-09-27
**Reviewed commit**: c7f4fe8f049456b5e2036bc32166d61e5f847078
**Reviewed diff**: `f2d33fb..531e872` on `v2.0.0` (9 commits)
**Working tree**: dirty (only the reviewer's own untracked journal `.ai/worklog/deepseek-115f8847b115ec32.md`; no wave file uncommitted)
**Reviewer**: deepseek/deepseek-flash (effort and usage: not exposed by the client; kilo session `deepseek-115f8847b115ec32`)
**Scope**: audit (whole wave: F-02 closure, TASK.md refresh, template notes, journal archive, baseline, S-5 note, hygiene)
**scope-check**: PASS
**Verdict**: RECOMMENDATION
**Mode**: ADVISORY (PROTO-DEC-0041 item 1: a wave review is not certification; PROTO-DEC-0038 item 2)

---

## Executive Summary

The wave is substantively sound: the F-02 closure is complete and consistent across `FRAMES.md`,
`CLOSURES.jsonl` and `INDEX.md`, the references are repointed, TASK.md is within limits with its old
text preserved, no frozen kernel path was touched, and the validator is green at the head. The one
defect worth a fix round is in the journal archive: `.ai/ARCHIVE.md` kept only the dated entries, so
the per-journal preamble was dropped (the `# Worklog:` header plus, for 7 journals, the `Launch:` /
`Orientation:` model-effort-route provenance) while the journal files were deleted, which contradicts
"archived whole" and AGENTS.md section 8 ("Archiving moves text. It never deletes text."). Verdict:
RECOMMENDATION.

---

## Scope and Evidence

- **Baseline commit**: `c7f4fe8f049456b5e2036bc32166d61e5f847078` (wave head `531e872` + the committed
  review task). The reviewed content is the nine-commit diff `f2d33fb..531e872`.
- **Working tree state**: dirty only from the reviewer's own session journal (untracked). Confirmed
  the wave itself left the tree clean (`git status --short --branch`).
- **Commands executed**:
  - `powershell -ExecutionPolicy Bypass -File .\validate-protocol.ps1` -> `Protocol OK. 0 warning(s).`
  - `node --test tests/resolver.test.cjs` -> `# tests 7 # pass 7 # fail 0` (AC-1 ladder-section
    sha256 anchor holds).
  - `node .ai/bin/protocol-handoff.cjs verify` -> reports no evidence matches the *current* tree; this
    is caused by the reviewer's own untracked journal and the post-wave review-task commit, so it is
    not a wave finding (see INFO-03).
  - `git diff --name-status f2d33fb 531e872`, `git show`, `git cat-file` inspections as cited below.
- **Environment**: Windows 11 Pro, Windows PowerShell 5.1, Node.js v22.21.0.

---

## Checklist Verdicts

| # | Item | Verdict | Basis |
|---|---|---|---|
| 1 | F-02 closure (artifact set, FRAMES row, CLOSURES append, references) | PASS | 20/20 files moved as `R100`; FRAMES row matches the required receipt; CLOSURES.jsonl line appended; PROMPT/LAUNCH/FRAMES/INDEX repointed |
| 2 | TASK.md refresh (<= 80 lines, facts, text preserved) | PASS | 61 lines; old "Current state"/"Next" present in `.ai/ARCHIVE.md` (`## 2026-09-27 - .ai/TASK.md Current state and Next archived`) |
| 3 | Template notes S-4/S-10, `clients.json` untouched | PASS | S-4 in `templates/prompts/COMMON.md` rule 5; S-10 in CLI-AGENTS, `templates/`, PAIRED-CYCLE; `.ai/docs/clients.json` not in the diff |
| 4 | Journal archive (28 whole, byte preservation, <= 100, key journals kept) | RECOMMENDATION | 126 -> 99 journals, operator+executor journals kept, but preambles not preserved (F-001) |
| 5 | Baseline (method, internal consistency, suite 24/24, validator 0 warnings) | RECOMMENDATION | Bv/Bs/Bn/Bm consistent with telemetry; 24 test files; 0 warnings at head; sampler-interval claim off (F-002) |
| 6 | S-5 route note (verbatim ladder preserved, route named, BACKLOG closed) | PASS | `resolver.test.cjs` AC-1 passes against the unchanged section sha256; note names `deepseek/deepseek-flash`, effort `max`; BACKLOG S-5 closed |
| 7 | Hygiene (no kernel edits, explicit paths, clean status, evidence block, encodings) | PASS | no `.ai/bin`, `tests/`, `docs/specs/`, `clients.json` edits; per-commit paths scoped; executor journal carries a `--quick` Evidence block; all changed text UTF-8/LF, no BOM, no `.ps1` touched |
| 8 | Red flags (invented numbers, self-certification, scope creep, lost text, dangling refs, caps) | RECOMMENDATION | no invented numbers or self-certification; caps respected; "lost text" found in the journal archive (F-001) |

---

## Findings Ledger

| ID | Requirement | Candidate | Reproduction | Actual Result | Severity | Disposition |
|---|---|---|---|---|---|---|
| F-001 | "append them whole"; AGENTS.md section 8 "Archiving moves text. It never deletes text." | `f4e95c7` | see below | preambles dropped from `.ai/ARCHIVE.md`; source journals deleted | MEDIUM | confirmed |
| F-002 | Baseline method internally consistent | `654a104` | see below | claimed 800-1000 ms sampling vs ~1.21 s/sample observed | LOW | confirmed |
| F-003 | Append-only, no rewrite of `CLOSURES.jsonl` | `3dc7de5` | see below | receipt appended unchanged; one stray blank line added | INFO | confirmed |
| F-004 | Accurate execution report | `711b6d7` | see below | "127 to 99" journals vs git 126 -> 99 | LOW | confirmed |
| F-005 | Launch file stability | `3dc7de5` | see below | launch receipt placeholder rewritten to the concrete receipt | INFO | confirmed |
| F-006 | Clean insertion | `2a5f67b` | see below | `README.md` files gained a double blank line | INFO | confirmed |

### F-001 - MEDIUM - Journal preambles not preserved by the archive

- **Requirement**: `LAUNCH-W1.md` item 5 "append them whole into `.ai/ARCHIVE.md`"; AGENTS.md section 8
  "Archiving moves text. It never deletes text."
- **Location**: `.ai/ARCHIVE.md:11071` (codex-752016...), `:11514` (agy-1d46...), `:11575`
  (claude-0f8a...), `:11699` (deepseek-674e...); claim at
  `docs/research/2026-09-27-roadmap-queue/W1-EXECUTION.md:59`.
- **Confidence**: High.
- **Reproduction**:
  ```powershell
  git show f4e95c7^:.ai/worklog/claude-0f8aa56190c5104d.md | Select-Object -First 12
  # .ai/ARCHIVE.md section starting at line 11575 starts at the first "## " entry heading
  Select-String -Path .ai/ARCHIVE.md -Pattern 'Launch: model=claude-opus-5-5 effort=high'
  # -> no match
  ```
- **Actual Result**: `.ai/ARCHIVE.md` stores only the text from the first `## YYYY-MM-DD` entry onward.
  Every one of the 28 archived journals lost its leading preamble: the `# Worklog: <id>` title, the
  "Session journal. Owned by this session..." boilerplate, and the `---` separator. For 7 journals the
  preamble also carried substantive provenance that is now absent anywhere in the tree - `agy-1d46`
  (`Launch: model=Gemini 3.1 Pro (High) effort=High client=agy`), `antigravity-7cc4` (Gemini 3.1 Pro
  Low/low), `claude-0f8a` (`claude-opus-5-5 effort=high client=claude`), `deepseek-674e`
  (`deepseek/deepseek-flash effort=unknown`), `gemini-6bd5` (`gemini-3.8-flash-high effort=high`),
  `gemini-e6af` (`gemini-3.8-flash effort=low`), `kilo-c4ba` (`kilo/google/gemini-3.7-flash effort=1.0`).
  `W1-EXECUTION.md` describes the result as "whole" and tabulates the full original byte sizes, so the
  report overstates what was preserved. (The two journals whose `# Worklog:` block sat mid-file -
  `deepseek-674e`, `gemini-6bd5` - retained it by accident, which also shows the omission was not
  deliberate.)
- **Disposition**: `confirmed`.
- **Recommendation / Proposed Fix**: In the one fix round, append each missing preamble to its section
  in `.ai/ARCHIVE.md` (a small scripted append of `git show f4e95c7^:<path>` up to the first `## `),
  or record an explicit, owner-visible mapping that the preamble boilerplate is intentionally not
  preserved. Either way, correct the "whole" wording in `W1-EXECUTION.md`. Entries and Evidence blocks
  are byte-intact, so no gate is bypassed.
- **Proof of Closure**: re-run the check above; each section begins with `# Worklog: <id>`.

### F-002 - LOW - Baseline sampler interval claim does not match the sample counts

- **Requirement**: method plausible and internally consistent (this task, checklist item 5).
- **Location**: `docs/research/2026-09-27-roadmap-queue/BASELINE.md:25` vs `:39-42` and `:63-84`.
- **Confidence**: Medium.
- **Reproduction**: 5 samples / 6.182 s = 1.24 s per sample; 488 samples / 590.781 s = 1.21 s per
  sample, against a stated "every 800-1000 ms".
- **Actual Result**: The effective interval is ~1.2 s, not 0.8-1.0 s. Most likely WMI query latency was
  not accounted for, but the document does not say so. All other numbers checked out: wall spans vs
  `StartUtc`/`EndUtc` agree within ~10 ms, `Bn+1` totals match, and the byte-to-MB conversions
  (241,569,792 B -> 230.38 MB; 2,700,238,848 B -> 2,575.15 MB) are exact.
- **Disposition**: `confirmed`.
- **Recommendation / Proposed Fix**: state the measured interval (or the WMI overhead), or re-word
  line 25 to "at least every 1.3 s".
- **Proof of Closure**: text update.

### F-003 - INFO - `CLOSURES.jsonl` gained a trailing blank line

- **Location**: `docs/research/CLOSURES.jsonl:14`.
- **Actual Result**: the CR-F02-1 line is correctly appended and line 12 (CR-F01-1) is unchanged; the
  diff adds one empty line at EOF. Cosmetic only.
- **Disposition**: `confirmed`.
- **Recommendation**: drop the trailing blank line when the file is next touched.
- **Proof of Closure**: `git diff f2d33fb 531e872 -- docs/research/CLOSURES.jsonl` shows only additions.

### F-004 - LOW - Journal-count figure in the execution report is off by one

- **Location**: `docs/research/2026-09-27-roadmap-queue/W1-EXECUTION.md:62` ("127 to 99").
- **Reproduction**: `git ls-tree -r --name-only f2d33fb -- .ai/worklog` -> 126 journals (excluding
  `README.md`); at `531e872` -> 99. `127` counts `README.md` as a journal.
- **Actual Result**: the substantive claim (at most 100 journals remain) holds; the stated starting
  count is off by one. The executor journal itself says 99, which matches git.
- **Disposition**: `confirmed`.
- **Recommendation**: correct `127` to `126`.
- **Proof of Closure**: text update.

### F-005 - INFO - The launch file's receipt placeholder was rewritten after execution

- **Location**: `docs/research/2026-09-27-roadmap-queue/LAUNCH-W1.md:36`.
- **Actual Result**: `receipt: CR-F02-1 <apply-sha> K:..` was replaced with the concrete
  `CR-F02-1 c3b9b53 K:0 C:0 A:20 D:0 R:0 T:0`. The old placeholder text is lost from the launch file,
  though the outcome is recorded in `W1-EXECUTION.md` and `FRAMES.md`. A launch file is normally a
  frozen instruction; note it, no action required.
- **Disposition**: `confirmed`.
- **Recommendation**: prefer recording achieved values in the execution report, not in the launch file.
- **Proof of Closure**: n/a (process observation).

### F-006 - INFO - Double blank line introduced in the worklog READMEs

- **Location**: `.ai/worklog/README.md`, `templates/ai/worklog/README.md` (both at the same offset).
- **Actual Result**: the S-10 sentence is added correctly, but it is followed by two blank lines before
  "When this directory passes thirty files...".
- **Disposition**: `confirmed`.
- **Recommendation**: collapse to one blank line.
- **Proof of Closure**: `git diff f2d33fb 531e872 -- .ai/worklog/README.md`.

---

## Deep Dives

### F-02 closure consistency (item 1)

- Artifact set: `f2d33fb` had exactly 20 files under `docs/research/2026-09-26-model-layer/`; `531e872`
  has exactly 20 under `docs/research/archive/2026-09-26-model-layer/`, all `R100` renames, no content
  change. The old directory no longer exists.
- FRAMES: `docs/research/FRAMES.md` row F-02 reads status `CLOSED`, verdict "ACCEPT at the round-2 gate
  (PACKET-1 Q1)", receipt `CR-F02-1 c3b9b53 K:0 C:0 A:20 D:0 R:0 T:0`; the unreceipted-frames counter
  row was updated in the same commit.
- CLOSURES: the CR-F02-1 JSON line is appended after CR-F01-1 and its `counts` equal the receipt
  (`A:20`, all else 0), `closure_commit: c3b9b53`, `baseline: f2d33fb`; `certified_by: null`, which is
  the point of this review.
- References: `PROMPT.md:72`, `LAUNCH-W1.md:31,33`, `FRAMES.md:27` and the new `INDEX.md` row all use
  the archive path. Remaining hits for the old path are historical (journals, `docs/reviews/`, archived
  files) or the deliberate source column in `INDEX.md`/`CLOSURES.jsonl`; the live
  `docs/research/2026-09-26-ownerideas-revision/prompts/run/r6-...md` fixture is the one active
  citation and is covered by CR-F01-1's TRANSFER rule. No operational dangling reference.

### Journal archive (item 4)

- Counts: 126 journals at `f2d33fb`, 28 removed, 1 added (executor journal) -> 99 at `531e872`
  (100 including `README.md`); `kilo-e1b4dd4a82b08b8e.md` and `gemini-64401c9d1745781d.md` are present.
- Byte preservation: entries and `Evidence:` blocks match the pre-delete blobs for the samples checked
  (`codex-752016`, `deepseek-fad8`, `mistral-6cd9`, `claude-0f8a`, `gemini-85e9`); only the preamble
  differs (F-001).
- References to archived journals survive only in disposable `.ai/runtime/` logs, historical journals,
  archived documents, and the intentional archive-mapping table in `W1-EXECUTION.md`.

### Head hygiene (item 7)

- `git diff --name-status f2d33fb 531e872` contains no path under `.ai/bin/`, `tests/`,
  `docs/specs/`, and not `.ai/docs/clients.json`.
- Every commit (`c3b9b53`, `3dc7de5`, `793a825`, `2a5f67b`, `f4e95c7`, `aac9681`, `654a104`,
  `711b6d7`, `531e872`) carries only its item's paths.
- Encodings: all 17 changed text files are UTF-8 without BOM and LF-only; no `.ps1` was changed, so the
  ASCII rule is untested but untouched.
- The executor journal `.ai/worklog/gemini-64401c9d1745781d.md` carries a `record --quick` Evidence
  block (`scope: validator only`) with anchor `711b6d7`. I could not re-confirm `verify` in-session
  (INFO-03): the current tree digest changed after the anchor from the post-wave review-task commit
  `c7f4fe8` and the reviewer's own untracked journal, so this is an artefact of reviewing, not a wave
  defect; at the frozen head the anchor and digest are internally consistent.

---

## Alternatives Considered & Trade-offs

- **Verdict PASS**: rejected. F-001 is a reproduced divergence from a written rule, so a clean PASS
  would understate it. Under this wave's PASS/RECOMMENDATION vocabulary it is a RECOMMENDATION with a
  bounded fix; none of the findings touches a gate, a kernel path, or evidence integrity.
- **Treating F-001 as blocking (FAIL)**: rejected for this wave. The entries and Evidence blocks - the
  history the archive exists to keep - are intact; only the preamble boilerplate and launch provenance
  were dropped. If the owner wants literal byte-perfect preservation, F-001 becomes the fix-round
  condition rather than a wave failure.

---

## Recommendations & Actionable Plan

1. Restore the dropped preambles into `.ai/ARCHIVE.md` (per F-001) or record the omission explicitly,
   and correct the "whole"/"127" wording in `W1-EXECUTION.md` (F-001, F-004).
2. Document the real baseline sampler interval or re-word BASELINE.md line 25 (F-002).
3. Cosmetic cleanups: drop the `CLOSURES.jsonl` trailing blank line (F-003) and the double blank lines in
   the two READMEs (F-006).
4. Do not change the launch-file convention retroactively (F-005); record outcomes in the execution
   report next time.

---

## References

- Decisions: `PROTO-DEC-0038` item 2, `PROTO-DEC-0041` items 1-2, `PROTO-DEC-0071`
- Task/launch: `docs/research/2026-09-27-roadmap-queue/W1-REVIEW-TASK.md`, `LAUNCH-W1.md`, `PACKET-1.md`
- Artifacts: `docs/research/FRAMES.md`, `docs/research/CLOSURES.jsonl`, `docs/research/archive/INDEX.md`,
  `docs/research/2026-09-27-roadmap-queue/BASELINE.md`, `.ai/ARCHIVE.md`
- Session journal: `.ai/worklog/deepseek-115f8847b115ec32.md`
