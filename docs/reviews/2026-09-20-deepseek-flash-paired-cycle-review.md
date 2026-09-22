# DeepSeek-Flash - Council audit: reusable paired cycle (v1.9.6, freeze exception)

**Date**: 2026-09-20
**Reviewed commit**: d38d2f2ae4b4c17fe6c2c18f11215cedb2f10eb1
**Working tree**: dirty
**Reviewer**: deepseek-flash
**Scope**: council | architecture | edge-cases (protocol core integration of a new managed document)
**Verdict**: RECOMMENDATION
**Mode**: CERTIFYING
**Receipt-Owner**: deepseek-flash-b46d113672e9d5fc
**Receipt**: .ai/worklog/deepseek-flash-b46d113672e9d5fc.md

---

## Executive Summary

The documented deliverable exists, installs, and its claimed checks largely reproduce: `validate-protocol.ps1` exits 0, `test-protocol.ps1` is 255/255, the manifest/installer/pointers are consistent at 1.9.6, and the `gemini-8f96a135c4637578` receipt verified against the tree as of session start. Three non-blocking but must-fix issues remain: (F-001, reproduced) the new managed document is missing from the validator's `$docDigests` host-reconciliation allowlist, so an installed project that edits it gets `FAIL`/exit 1 instead of `WARN`; (F-002) the freeze exception and the 1.9.6 bump are recorded only in `.ai/TASK.md`, which is outranked by the binding freeze in `.ai/DECISIONS.md`; (F-003) the runbook's Phase 3 permits completion without the PROTO-DEC-0038 mandatory prompt+report pair and never mentions the `## Completion gate`. Claimed "0 warnings" is not reproducible now (exit 0, 1 warning, 31 journals) because a later session added a journal after the receipt; this is not caused by the audited change.

---

## Scope and Evidence

- **Baseline Commit**: `d38d2f2ae4b4c17fe6c2c18f11215cedb2f10eb1` (`git rev-parse HEAD`), `## main...origin/main`, dirty.
- **Changed artifacts in scope**: `.ai/docs/PAIRED-CYCLE.md` (new, 161 lines, untracked), `protocol-manifest.json`, `.ai/docs/PROTOCOL.md`, `AGENTS.md`, `setup-ai-protocol.ps1`, `.ai/TASK.md` (acceptance checkbox only).
- **Commands executed**:
  - `powershell -ExecutionPolicy Bypass -File .\validate-protocol.ps1` -> exit 0, `Protocol OK. 1 warning(s).`
  - `powershell -ExecutionPolicy Bypass -File .\test-protocol.ps1` -> exit 0, `# pass 255 / # fail 0`.
  - `node --test tests/manifest.test.cjs tests/upgrade.test.cjs` -> 23/23 pass.
  - `node .ai/bin/protocol-handoff.cjs verify --owner gemini-8f96a135c4637578` -> exit 0, "evidence matches the current tree" (218 files, digest `sha256:8d763a6a...`); seconds later `--deep` -> stale at 219 files after a parallel session wrote `docs/reviews/2026-09-20-mcp-stack-council-round1-prompt.md`.
  - `git diff --numstat` on `.ai/DECISIONS.md` / `docs/decisions/REGISTRY.md` / `.ai/ARCHIVE.md` -> `124/0`, `4/0`, `394/0` (append-only, no deletions).
  - Isolated temp-fixture probe (TEMP only, repository untouched): install 1.9.6 into a fixture, edit/delete `.ai/docs/PAIRED-CYCLE.md`, rerun installed validator.
- **Environment**: Windows (PowerShell 5.1), Node.js v22.21.0, Git for Windows.

---

## Claims under test

| # | Claim | Reproduction | Status |
|---|---|---|---|
| 1 | `validate-protocol.ps1` exit 0 / 0 warnings | exit 0 reproduced; 1 warning ("31 session journals") | exit 0 VERIFIED; 0 warnings FALSE (drift, see F-008) |
| 2 | `test-protocol.ps1` 255/255 | 255/255, exit 0 | VERIFIED |
| 3 | journals 30/30 | 30 journals at record time (by mtime); 31 at audit start, 32 later | PARTIAL (see F-008) |
| 4 | install creates `.ai/docs/PAIRED-CYCLE.md`, manifest 1.9.6, built-in validator OK | isolated fixture: file created, `role: installed`, version 1.9.6, `contentDigest` present; `manifest.test.cjs` / `installer.test.cjs` / `upgrade.test.cjs` pass | VERIFIED |
| 5 | receipt `gemini-8f96a135c4637578` recorded and verifies | verified at audit start (see above); stale after parallel write | VERIFIED at check time; mechanism works as designed |

---

## Findings

| Id | Severity | Title | Location | Impact | Status |
|---|---|---|---|---|---|
| F-001 | MEDIUM | New managed doc missing from validator reconciliation allowlist | `validate-protocol.ps1:657-665` | Host edit of `.ai/docs/PAIRED-CYCLE.md` -> `FAIL`, exit 1; all other shipped docs -> `WARN` | Open (reproduced) |
| F-002 | MEDIUM | Freeze exception + 1.9.6 bump not recorded in DECISIONS/registry | `.ai/TASK.md:35`; `AGENTS.md:38-49,287-297` | Lower-ranked source carries the authorization; no `Approved by:` record; future audits see a freeze violation | Open |
| F-003 | MEDIUM | Runbook completion path bypasses PROTO-DEC-0038 full pair / completion gate | `.ai/docs/PAIRED-CYCLE.md:47,59-62` vs `AGENTS.md:87-114,155-157` | Protocol-core work could be marked Completed after one review; runbook never mentions `## Completion gate` | Open |
| F-004 | LOW | `[--quick]` receipt pattern does not evidence the required suite | `.ai/docs/PAIRED-CYCLE.md:39,115`; `.ai/worklog/gemini-8f96a135c4637578.md:15,29` | Receipt is honest ("suite was NOT run") but prose claims "All tests pass"; evidence gap | Open |
| F-005 | LOW | "Verify deep receipt" command omits `--deep` | `.ai/docs/PAIRED-CYCLE.md:134` | Reviewer following the template performs a shallow chain check while believing it is deep | Open |
| F-006 | LOW | No test pins the new managed entry | `tests/manifest.test.cjs:14-18,30-42` | Deleting the manifest entry breaks no test; coverage is one-directional | Open |
| F-007 | LOW | Version bump to 1.9.6 inside freeze without tag/release | `protocol-manifest.json:3`; latest tag `v1.9.5` | `-Force` installs report 1.9.6 with no release; TASK exception text omits the bump; PROTO-DEC-0025 item 1 wants atomic release+tag | Open (owner call) |
| F-008 | INFO | "0 warnings" state drift | `validate-protocol.ps1:215-218` | 31/32 journals > 30 cap -> WARN; caused by sessions started after the receipt | Open |
| F-009 | INFO | Corpus cap (60/600 KB) is not machine-enforced | no logic found in `validate-protocol.ps1` / `.ai/bin/*.cjs` | Guardrail 5 is policy only; cycle adds 1-3 review files per task | Open (pre-existing) |
| F-010 | INFO | Receipt staleness observed live | `docs/reviews/2026-09-20-mcp-stack-council-round1-prompt.md` | Parallel session write invalidated the verified receipt exactly as documented | Resolved (expected) |

### F-001 - MEDIUM - Installed-role validator treats the new document as runtime tooling

- **Location**: `validate-protocol.ps1:657-665` (`$docDigests` list), `setup-ai-protocol.ps1:254-262` (installed `contentDigest`).
- **Confidence**: High.
- **Reproduction** (isolated TEMP fixture; repository untouched):
  ```text
  installed role: installed version: 1.9.6
  PAIRED-CYCLE in managed: true ; contentDigest has PAIRED-CYCLE: true
  [probe 1] host edits PAIRED-CYCLE.md -> exit 1
  [FAIL] .ai/docs/PAIRED-CYCLE.md is not the content this protocol version installed; ...
  [probe 2] host edits COPILOT.md too -> exit 1
  [WARN] .ai/docs/COPILOT.md differs from the installed protocol content; it is a document the host may reconcile.
  [FAIL] .ai/docs/PAIRED-CYCLE.md ...
  [probe 3] PAIRED-CYCLE.md deleted -> exit 1
  [FAIL] missing file: .ai/docs/PAIRED-CYCLE.md
  ```
- **Impact**: `AGENTS.md`/`PROTOCOL.md` establish that shipped documents may be reconciled and then warn; the new managed runbook is a document but not in `$docDigests`, so a host that adapts it gets `Protocol BROKEN`, exit 1. Inconsistent with the announced policy and with the upgrade guidance.
- **Recommendation**: add `'.ai/docs/PAIRED-CYCLE.md'` to `$docDigests` (one line) and add a regression next to the COPILOT.md warn test; alternatively record explicitly that the file must never be edited and stays strict. Probe 3 behaviour (deletion -> FAIL) is correct and should stay.

### F-002 - MEDIUM - Governance record of the freeze exception

- **Location**: `.ai/TASK.md:35` (checkbox text), `AGENTS.md:38-49` (decision definition), `AGENTS.md:287-297` (registry trigger taxonomy), `.ai/DECISIONS.md` PROTO-DEC-0039 item 1 (freeze: P0/audit closure only), `docs/decisions/REGISTRY.md` (last appended rows 0036-0039).
- **Confidence**: High (text inspection; owner chat not accessible).
- **Impact**: The only repository record that a non-P0 protocol deliverable was authorized during the freeze is one acceptance checkbox in TASK.md. `AGENTS.md` section 1 ranks DECISIONS.md above TASK.md, and section 2 says a decision exists only as an approved block with `Approved by:`. A later session reading only DECISIONS/registry cannot distinguish an owner directive from a freeze violation; the 1.9.6 bump is not covered by the checkbox text either.
- **Recommendation**: append an `owner-directive` trigger row to `docs/decisions/REGISTRY.md` and a new approved block (`Status: Accepted`, `Approved by: RuslanFomenko (direct owner confirmation, 2026-09-20, transcribed by <agent>)`) naming the exception scope: the paired-cycle document, its manifest entry, the pointer edits, and the 1.9.6 version bump. Do not edit PROTO-DEC-0039.

### F-003 - MEDIUM - Runbook vs risk-scaled review and completion gate

- **Location**: `.ai/docs/PAIRED-CYCLE.md:47` ("if `PASS`, marks completion or advances to Phase 6"), `:59-62` (Phase 6 ends at prompt composition) vs `AGENTS.md:87-114` (PROTO-DEC-0038; `## Completion gate` with two artifacts) and `:155-157` (compose the prompt before `Status: Completed`).
- **Confidence**: High (grep: the document contains no `0038`, `Completion gate`, `Receipt-Owner`, or capability reference; `CERTIFYING` appears only at `:45` and `:126`).
- **Impact**: A protocol-core change (anything under `.ai/`, `.claude/`, hooks, validator, gates, consumer security/data paths) run through this cycle as written can be completed after a single certifying review, skipping the mandatory adversarial prompt+report pair. For docs/config the lighter path of PROTO-DEC-0038 item 2 is the correct one, but the runbook does not distinguish the two.
- **Recommendation**: add a risk branch in Phase 3/6: for protocol-core artifacts `PASS` always advances to Phase 6 and completion additionally requires the `## Completion gate` section with separate prompt and review files; for docs/config one reviewer statement is sufficient. Reference `AGENTS.md` section 2 and PROTO-DEC-0038 directly.

### F-004 - LOW - Quick receipt and prose overclaim

- **Location**: `.ai/docs/PAIRED-CYCLE.md:39,115`; `.ai/worklog/gemini-8f96a135c4637578.md:13,15` ("ran validation and regression suite", "All tests pass") vs `:29` ("scope: validator only; the regression suite was NOT run").
- **Confidence**: High. `tests/review-findings.test.cjs:124-130` pins the honest quick-scope wording (`L1`), so the receipt itself is not false green; the journal prose is the weak part.
- **Recommendation**: in the source role require a full `record` (or an explicit journal line for separately run suites) in Phase 2 acceptance, and qualify the `[--quick]` hint as iteration-only. The audit independently reran the suite: 255/255, so the underlying claim held.

### F-005 - LOW - `verify --journal` is valid, but "deep" is not

- **Location**: `.ai/docs/PAIRED-CYCLE.md:134` vs `.ai/bin/protocol-handoff.cjs:11,366-367,681` and `AGENTS.md:236`.
- **Confidence**: High. `--journal` is a supported flag; `--deep` (archive-chain traversal) is not passed.
- **Recommendation**: use `verify --owner <id> --deep` or drop the word "deep".

### F-006 - LOW - Coverage of the manifest addition

- **Location**: `tests/manifest.test.cjs:14-18`, `:30-42`, `:104-109`; `tests/upgrade.test.cjs:89-101`.
- **Confidence**: High.
- **Impact**: The manifest tests iterate `manifest.managed` in the direction manifest -> repository/install. If the new entry were removed from the manifest (file left on disk), no shipped test would fail; nothing asserts that a shipped document is entry-listed. A one-line pin test (analogous to `tests/context-policy.test.cjs`) would close this.

### F-007 - LOW - Version bump semantics inside the freeze

- **Location**: `protocol-manifest.json:3`, `AGENTS.md:3`, `setup-ai-protocol.ps1:1`; tags: `v1.9.0/1/2/4/5`, no `v1.9.6`; PROTO-DEC-0025 item 1 (release commit atomic and tagged).
- **Confidence**: High for the facts; severity is an owner judgement.
- **Impact**: `-Force` upgrades now deliver a declared 1.9.6 with no release/tag and no decision record; the convention observed for v1.9.4/v1.9.5 pairs the bump with the release transition. If a v1.9.6 release later includes further changes, the version already in the tree may need re-bumping.
- **Recommendation**: either record the bump in the F-002 decision block or revert the version strings until the release transition. Validator "one protocol version everywhere" requires the three strings to move together either way.

### F-008 - INFO - Journals above the 30 cap (claimed 0 warnings not reproducible)

- **Facts**: validator emits `1 warning(s)` for 31 (now 32) journals; exit 0. Journal mtimes show 30 journals at the receipt time `2026-09-20T03:57:50Z`; `claude-36a05908383b5a26.md` (04:24:50Z) and `claude-daa799a69ca8a3c0.md` (04:37Z) were created after it. The drift is not caused by the paired-cycle change, but it means "validator 0 warnings" is no longer a true state description in `.ai/TASK.md:47`.

### F-009 - INFO - Corpus cap is policy, not a check

- No 60-file/600-KB logic was found in `validate-protocol.ps1` or `.ai/bin/*.cjs`; the guardrail is textual. Current active corpus: 48 files / 438,670 B (headroom 12 files / ~161 KB); each cycle can add 1-3 review files.

### F-010 - INFO - Receipt staleness is real and was observed

- `verify --owner gemini-...` passed at audit start (218 files, `sha256:8d763a6a...`); `--deep` minutes later reported stale against 219 files after another session created `docs/reviews/2026-09-20-mcp-stack-council-round1-prompt.md`. This is the documented "receipts only after final tree" behaviour, not a defect; parallel council sessions will keep stale-ing each other's receipts.

---

## Point-by-point results

- **A. Contradictions**: one substantive (F-003). Guardrails 1-6 otherwise match `AGENTS.md` section 6 (shared docs list, lock order), section 1 (chat/runtime not memory), section 7 (receipt discipline), section 8 (caps, language from TASK). Journal ownership (one file per session) and lock-before-shared-edit are consistent; no contradiction found in Phase 2/4/5 sequencing.
- **B. Templates**: self-sufficient in a fresh installed project; they reference only installed paths (`AGENTS.md`, `.ai/TASK.md`, `.ai/PLAN.md`, `.ai/DECISIONS.md`, `.ai/worklog/`, `validate-protocol.ps1`, `.ai/bin/*`). `verify --journal` is a real flag. Defects: "deep receipt" without `--deep` (F-005); `--agent [implementer]` is a literal placeholder inside a command; "test suite" in Template 3 is ambiguous for installed projects (no `test-protocol.ps1` there).
- **C. Manifest and install**: `.ai/docs/PAIRED-CYCLE.md` is in `managed`; version 1.9.6 in exactly the three files the validator compares; installer copies it (fixture install, `manifest.test.cjs`, `installer.test.cjs` pass); installed manifest is `role: installed` with a `contentDigest` entry for the new file. Installed validator accepts an unmodified install, but misclassifies edits (F-001).
- **D. Tests**: validator exit 0 (1 warning); suite 255/255; `manifest.test.cjs` + `upgrade.test.cjs` 23/23. If the managed entry is deleted from the manifest (file kept), no shipped test fails (F-006). If instead the file is deleted while the entry stays, `tests/manifest.test.cjs` ("every managed and integration entry exists", "an installed project contains every manifest entry") and the validator's required-file check fail.
- **E. Diff discipline**: `.ai/DECISIONS.md`, `docs/decisions/REGISTRY.md`, `.ai/ARCHIVE.md` are append-only in the diff (0 deletions); no kernel `.cjs` changed (only a review `.cjs` renamed into `docs/reviews/archive/`); `.ai/TASK.md` remains `Status: In progress` with the acceptance item checked. Untouched-by-this-session claim holds as far as a tree-level check can show; attribution across the shared dirty tree is not provable from git alone.
- **F. Governance**: not sufficient (F-002). Minimum rule set: `AGENTS.md:38-49` (decision = approved block with `Approved by:`), `AGENTS.md:20` (DECISIONS outranks TASK), `AGENTS.md:287-297` (trigger `owner-directive` requires explicit dated confirmation and an appended registry row). Fix: registry row + approved block; PROTO-DEC-0039 itself stays frozen and unedited.
- **G. Upgrade path**: for a 1.9.4/1.9.5 host, `-Force` creates the new file and replaces managed docs with backups; `-Verify` reports it missing (exit 1, expected). A plain install (no `-Force`) creates the file but keeps older managed copies while the manifest advances to 1.9.6, so validation FAILs on runtime files until `-Force` - the pre-existing "cannot claim a version it did not deliver" design, worth repeating in upgrade notes. Deleting the installed file -> `[FAIL] missing file` (probe 3). Hosts that reconcile the file -> F-001 false failure. No other failure modes found; the installer's preflight aborts before writes on missing source/JSON/marker errors.
- **H. Unmentioned risks**: (1) bump without release/tag (F-007); (2) defaults name `gemini`/`deepseek`, so in projects without them the runbook reads as if those roles exist - TASK `## Roles` is the configured source, but the doc could say so more loudly; (3) corpus cap interaction (F-009) plus the 30-journal cap: a full cycle needs one implementer and one reviewer journal, and the cap is already exceeded, so each cycle worsens the warning state until an archiving pass; (4) Phase 6 stops at prompt composition with no machine check in installed projects (`gate-check` is skipped in `role: installed`), so the mandatory review is honor-system for hosts; (5) `Mode: CERTIFYING` in Template 3 is a request header; the capability gate (`FS_WRITE`, `SHELL_EXEC`, `EVIDENCE_SIGN`, `REPO_READ`) is orchestrator-determined and the template does not restate it.
- **I. Falsification**: validator/test/receipt claims reproduced as listed above; only "0 warnings" and "journals 30/30" failed reproduction, with the cause identified as post-receipt sessions (F-008). The receipt was verified before the parallel write and is now correctly stale (F-010).

---

## Not verified

- `setup-ai-protocol.ps1 -Force` against a real external project (`D:\Block-Puzzle`, `D:\VPN`) was not run: the audit mode is read-only. Installation was reproduced in isolated TEMP fixtures via the repository's own test helpers and suite.
- Owner chat and the original 2026-09-20 directive are not accessible; the exception's existence is taken from `.ai/TASK.md:35` and this dispatch. F-002 concerns its record, not its authenticity.
- Session-to-change attribution inside the shared dirty tree (which session wrote which hunk) cannot be proven from git status alone; append-only checks are tree-level.
- I did not test the runbook end-to-end with two live assistant sessions.

---

## Minimal fixes (not implemented, per read-only mode)

1. `validate-protocol.ps1`: add `'.ai/docs/PAIRED-CYCLE.md'` to `$docDigests`; add a warn-path regression (F-001).
2. `docs/decisions/REGISTRY.md` + `.ai/DECISIONS.md`: append an `owner-directive` row and an approved block covering the exception and the 1.9.6 bump, or revert the bump (F-002, F-007).
3. `.ai/docs/PAIRED-CYCLE.md`: Phase 3/6 risk branch referencing PROTO-DEC-0038 and the `## Completion gate`; `--deep` in Template 3; qualify `[--quick]` (F-003, F-004, F-005).
4. `tests/manifest.test.cjs` (or a small pin test): assert the new entry is listed (F-006).

---

## Immutability

This review is a permanent record of the tree at the digest recorded by the receipt in `.ai/worklog/deepseek-flash-b46d113672e9d5fc.md`. Revisions must be published as a new file or marked `Superseded by:` in the header. No audited artifact was modified, moved, or installed by this session; only this review file and the reviewer journal entry were added.

Receipt anchor: `node .ai/bin/protocol-handoff.cjs verify --owner deepseek-flash-b46d113672e9d5fc --deep`
