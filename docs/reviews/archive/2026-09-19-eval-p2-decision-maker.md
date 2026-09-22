# Final Ruling - Repository Trajectory (Decision-Maker, evaluation p2)

**Baseline**: `d38d2f2ae4b4c17fe6c2c18f11215cedb2f10eb1`, working tree dirty. Read-only evaluation; the only file written is this one.
**Answered prompt**: `docs/reviews/2026-09-19-final-course-decision-prompt.md`, section between the copy lines and `END OF PROMPT`.
**Authority**: every `Approved by:` line below is `_pending owner confirmation_`; nothing may be appended to `.ai/DECISIONS.md` before the owner confirms (PROTO-DEC-0030).

## 0. Verification of the section-1 figures (reported before ruling)
| Claim (prompt s.1) | Reproduces? | Actual value / note |
|---|---|---|
| Kernel tools 2,826 lines, 6 files | Yes | 2,826 lines / 6 `.cjs` files (blank lines excluded, same method as the synthesis). |
| Test code 18 files, 4,544 lines | Yes | 18 files in `tests/*.cjs`, 4,544 lines by the same method (5,304 raw incl. blanks). |
| `docs/reviews/` 126 files / 1,299,793 B; 84 dated 09-19; 124/126 touched in 48 h | **No** | Current tree: **130 files / 1,357,140 B / 88 dated 2026-09-19 / 128 touched <48 h**. The 126 figure matches neither the baseline commit (121 committed `.md`, 122 files incl. `2026-09-19-codex-trackc-h1-probes.cjs`) nor the current tree; it is a stale snapshot taken ~4 files earlier. The corpus only grew; the ruling direction is unaffected. |
| `DECISIONS.md` 1,625 lines / 36 blocks; `ARCHIVE.md` 2,527 lines | Partly | 1,625 raw lines yes (1,264 non-blank under the synthesis method); 36 `###` headings = **35 decisions + the `DEC-nnnn` template** (DEC-0001..0021 = 21, PROTO-DEC-0022..0035 = 14). `ARCHIVE.md` 2,527 raw lines yes. |
| 14 blocks on 09-18+09-19 vs 22 prior 6 days; 35 commits/48 h; 30 worklog journals | Partly | 14 yes (7+7); 35 commits yes. Prior six calendar days (09-12..09-17) = **11**; widest reading (09-11..09-16) = 21; "22" does not reproduce. Worklog holds **29 journals + README = 30 files**; "30 journals" is off by one. |
| Consumer HEADs: Block-Puzzle 2026-09-17 04:19; VPN 2026-09-18 03:44 (protocol upgrade) | Yes | Both reproduce; VPN's last commit is `feat(ai): ... v1.9.0 runtime upgrade`. |
| Local models `omnicoder-2-9b` 5.7 GB, `qwen3:8b` 5.2 GB | Yes | `carstenuhlig/omnicoder-2-9b:latest` 5.7 GB, `qwen3:8b` 5.2 GB; two older `minicpm-v4.5` models also present. |
| H1: broad total +72.79%, fresh +9.10%; narrow total +60.20%, fresh +42.76%; stop rule executed | Yes | Matches `2026-09-19-h1-pilot-report-correction.md` F-002, which supersedes the original report; Arm A fresh 73,269 broad / 45,470 narrow; digest ~88k (`...-mcp-selection-analysis.md`). |

Other checks: `PROTO-DEC-0021` referenced in the prompt s.2 / synthesis s.3.3 **does not exist**; the ten-findings block is **DEC-0021** (`DECISIONS.md:954`, 2026-09-16). `docs/reviews/archive/` does not exist yet. Live citation scan: 38 unique `docs/reviews/*.md` paths cited under `.ai/worklog/*.md` (all exist) and 17 files with `Mode: CERTIFYING`; union = **50 keep files**. Remote CI was not run locally and remains asserted, not verified. Tags v1.9.0/1/2/4/5 exist (no v1.9.3).

## 1. Verdict
**RADICAL SIMPLIFICATION** with the earned guarantees kept, not a partial pivot: the package's priorities are right, and the divergences are resolved below in favor of receipt-safe classification-first cleanup and risk-scaled review.

**Next 24 hours**: freeze protocol feature work, have one lock-holding session append the four approved blocks plus registry rows and reconcile `.ai/TASK.md`, then archive the non-active review corpus with `doctor`/`gate-check` verification on both sides, and start the first Block-Puzzle pilot task.

## 2. Executive diagnosis
The loop is real and measured, not rhetorical: 35 protocol commits and 88 review files in 48 h against zero product commits, while the kernel is 2,826 lines and the generated index (~88k tokens) is larger than the work it was meant to save (45-73k fresh tokens, H1). The context shortage was self-inflicted by an unbounded review corpus created without a budget by `PROTO-DEC-0026`; the follow-on Pilot v2 (B2-B4/C2) is sunk-cost escalation and must close, while `PROTO-DEC-0035` was in fact executed as written and should not be accused of violation. The recovery package is coherent: close the index track permanently, cap and archive the corpus receipt-safely, scale adversarial review by blast radius, freeze features, and spend the next full work window on the product pilot that `.ai/PLAN.md:51-54` specified and that has never run.

The package needs three corrections to be safe: the section-1 corpus figures are stale (130 files, not 126), the keep surface must be derived from live citations at freeze time (50 files today), and receipts must be recorded only after all file moves, because a review move after a receipt invalidates its tree digest. With those corrections the package is approved as ruled below.

## 3. Ruling table
| id | ruling | justification (path/evidence) | cost accepted |
|---|---|---|---|
| S1 | APPROVE - close Track C/Repomix permanently; no B2/B3/B4/C2 | 88k digest > 45-73k work (`h1-pilot-report-correction.md`); stop rule executed (`PROTO-DEC-0035`) | forfeit unknown index upside; closure is evidence-gated |
| S2 | APPROVE default - keep files, never use in a pilot; `ollama rm` is owner's call | `ollama list`; H1 variance 2,306 s vs 230-800 s | ~10.9 GB disk retained unless owner removes |
| S3 | APPROVE - two-tier receipt-aware archive, index, AGENTS.md cap (ruling: 60 files / 600 KB active) | keep-set = 50 files (38 cited + 17 certifying, overlap 5); `PROTO-DEC-0032` binding | one lookup via index; cap number owner-tunable |
| S4 | APPROVE risk-scaled review, reject full suspension | F-001..F-004 caught (`...-correction.md`); DEC-0021 ten findings | docs/one-line changes get one reviewer statement only |
| S5 | APPROVE freeze - P0 fixes + audit closure only | zero product commits since 09-17; 35/48 h commits | P1/P2 protocol work waits |
| S6 | APPROVE - run the PLAN.md product pilot for real | `PLAN.md:51-54`, `:63-68`, `:98-101` all unchecked | pilot can refute the protocol's value; that is the point |
| S7 | APPROVE scope; schedule after the pilot report | cycles: lock:10 -> session:26 -> hooks:553 -> archive:11-12 -> lock; handoff 1,047 lines | v2.0 waits on pilot data |
| S8 | APPROVE closure as ruled in D11 | Qoder `Receipt-Owner` qoder-86c43a9a02fd9789 vs journal qoder-4d1795a4ffecb995; C1a in `d38d2f2` | Qoder report stays advisory, not certifying |
| S9 | APPROVE keep-list (synthesis s.5) as a hard constraint | append-only files; receipt integrity; `AGENTS.md` s.5/6 | cleanup is slower than a blind move |
| S10 | APPROVE record pass; receipts only after the tree is final | `verify` fails when the tree has moved; `PROTO-DEC-0032` | one extra freeze window; ordering discipline |
| D1 | APPROVE - terminate permanently | same as S1; H1 arithmetic is decisive for this repository | B2 "index, not context" never tested; documented as such |
| D2 | No v2 -> no metric; if reopened: fresh tokens primary, total secondary | `PROTO-DEC-0035`; arm comparability | no metric work now |
| D3 | Keep 25% / +5%; reject 20%/+3% | lowering after a failed run is goalpost-shifting | none |
| D4 | Reject tokens-per-accepted-finding; automated checks only | acceptance needs a judge; gameable | fewer narrative metrics |
| D5 | Abort trials on 8B/9B; no further pulls | H1 variance; tool-call reliability | unknown cheap-model upside forfeited |
| D6 | `agy`/Gemini + paid analysis only; borrowed HF credits are not "free" | owner run policy; card-binding fragility | HF route unused |
| D7 | Classify-first archive, receipt-aware (as S3) | `PROTO-DEC-0032` gate binding; `PROTO-DEC-0026` immutability | archive pass is manual and verified |
| D8 | v2.0 = radical simplification, mechanism frozen (S7) | entry hashes embedded in recorded receipts | no deletions mid-flight; migration note if ever |
| D9 | Reject new monitoring/layers; C1a is a bug fix, not a precedent | no measured defect class for monitors | none |
| D10 | Binding: "test" = any measurement-motivated run; free/local only; paid for analysis/coding; Gemini exception stands | owner policy; removes pilot/analysis ambiguity | paid subjects never used for measurement |
| D11 | Close the round: Qoder -> advisory; Codex re-record at freeze; C1a accepted; TASK reconciled; journals <= 30 | correction addendum audit-round table | Codex receipt waits on quota/freeze |
| D12 | Record Agent Manager and CLI/`agy` as execution vectors; choose per task | owner direction; no theological split | none |

Owner-only recommendations: **H1 approve** (S3 as ruled). **H2 approve** (S4 scaled, not suspended). **H3: Block-Puzzle**, first objective = close the open DEC-0024 Step 3 acceptance item (manager continuity p.2, dependency p.7a, focus p.7d, on-device verification), then the Stage B backlog as the 10-20-task pilot stream; VPN's open items (G2/G3.1/G3.2) wait on CI/owner decisions and make a worse first subject. **H4 approve**, single lock holder with FS_WRITE + SHELL_EXEC + EVIDENCE_SIGN; recommended Gemini (implementer role, fresh certifying receipt), DeepSeek reviews the diff, order Gemini -> DeepSeek -> Codex if available.

## 4. Ready-to-append decision blocks
### PROTO-DEC-0036
Status: Accepted
Date: 2026-09-19
Reopen-trigger: owner-directive

Context:
H1 (Arm B) failed the pre-registered thresholds under every cohort interpretation (broad total +72.79%, narrow total +60.20%; `docs/reviews/2026-09-19-h1-pilot-report-correction.md`). The digest is ~88k tokens while control sessions used 45-73k fresh tokens, so the index is larger than the work it was meant to save. The `PROTO-DEC-0035` stop rule was executed as written; the post-mortem's B2/B3/B4/C2 follow-on is sunk-cost escalation, not a violated rule.

Decision:
1. Track C / Repomix is closed permanently for this repository. No B2, B3, B4 or C2 runs; no MCP adoption; no further index experiments.
2. `PROTO-DEC-0034` M0/C2 remain recorded policy only: the on-demand digest is advisory, never Evidence, never a gate input, and no workflow may depend on it.
3. Local 8B/9B models stay on disk but are never subjects of a pilot or benchmark; further pulls are aborted. `ollama rm` is the owner's call.
4. If the owner reopens this track by directive, the pre-registered rules apply unchanged: fresh tokens (`in + out`) primary and total secondary; thresholds 25% median broad reduction / +5% narrow bound; "tokens per accepted finding" rejected; free/local subjects for tests, paid for analysis/coding, Gemini exception via `agy`; borrowed HF credits are not free; remote route `agy`/Gemini only.
5. Reversal evidence is the closure falsifier only: a pre-registered controlled run on this repository showing >= 25% median broad total-token reduction and <= +5% narrow regression against a matched control, on a second model family, with scope-selection cost counted in the total - or a genuine repository-shape change making search impractical.

Reasoning: the arithmetic is decisive without another run; `rg`/targeted reads are O(relevant) with zero generation latency. The escalation is named as sunk cost so future sessions do not replay it, and the measurement rules are kept conditional rather than erased.

Alternatives rejected: B2-first reinterpretation (reintroduces the cost being optimized and re-litigates a pre-registered stop); lowering thresholds to 20%/+3% (goalpost-shifting); full erasure of the measurement policy (a future legitimate run would rebuild it from scratch).

Consequences: no further index/MCP spend; context effort moves to corpus retention. `PROTO-DEC-0035` stands as executed history.

Approved by: _pending owner confirmation_
### PROTO-DEC-0037
Status: Accepted
Date: 2026-09-19
Reopen-trigger: owner-directive

Context:
`PROTO-DEC-0026` created `docs/reviews/` as permanent, unbounded, Git-tracked history with no budget; it is now 130 files / 1,357,140 bytes against a 2,826-line kernel, and it is the dominant context cost. `PROTO-DEC-0032` binds `gate-check` to review paths cited in certified receipts, so a blind move can break an active binding.

Decision:
1. Two-tier corpus: the active window is `docs/reviews/` minus `docs/reviews/archive/`; it holds the current release's certifying documents plus every path cited by a live (verifying) receipt, an open task or an open decision. Everything else moves to `docs/reviews/archive/`.
2. Classify-first only. Run `node .ai/bin/protocol.cjs doctor` and `node .ai/bin/protocol-handoff.cjs gate-check` before and after; keep an append-only `docs/reviews/archive/INDEX.md` mapping old -> new path per file; if any verification fails, restore the moved file to its cited path.
3. Hard cap in `AGENTS.md` section 8: active `docs/reviews/` <= 60 files and 600 KB, overflow archived at release close; validator WARN at the cap and FAIL one release after adoption (registry migration style). The number is owner-tunable.
4. The synthesis section 5 keep-list is adopted as a hard constraint on any cleanup or refactor: append-only `DECISIONS.md`/`REGISTRY.md`/`ARCHIVE.md`; no receipt invalidation; the four earned fixes; lock discipline; secret scanning; no protocol commits in consumer repositories.
5. `.ai/DECISIONS.md`, `docs/decisions/REGISTRY.md` and `.ai/ARCHIVE.md` are never touched by the archive pass; archiving moves text, never deletes it.

Reasoning: the corpus is the problem, not the kernel; a cap plus receipt-aware archiving recovers context without destroying history or breaking gates. The keep surface is derivable: 38 cited + 17 certifying files = 50 today.

Alternatives rejected: mass-move everything non-active (Gemini) can break receipt bindings; keep only the last 5-10 files (GLM) has no receipt awareness; delete spent data violates the archive-never-delete rule.

Consequences: active corpus falls from 130 files toward ~50; archived files stay tracked under `archive/` with one index lookup; future overflow is mechanical.

Approved by: _pending owner confirmation_
### PROTO-DEC-0038
Status: Accepted
Date: 2026-09-19
Reopen-trigger: owner-directive

Context:
The mandatory adversarial prompt caught F-001..F-004 in the last round and ten reproduced findings in DEC-0021, so it pays for itself on the protocol core. A 10-page prompt+report pair for every docs or one-line change is the artifact-inflation driver. The prompt's s.2 ID reference to `PROTO-DEC-0021` is corrected here to `DEC-0021`.

Decision:
1. Full adversarial prompt+report pairs remain mandatory for protocol core: anything under `.ai/`, `.claude/`, hooks, validator and gates, plus consumer security/data paths.
2. Docs, config and one-line fixes require one independent reviewer statement (a review file or a journal-visible verdict); no prompt+report pair.
3. Prompt and report artifacts are size-capped unless an incident warrants more: prompt <= 150 lines, report <= 250 lines (owner-tunable).
4. `AGENTS.md` section 2 mandatory-prompt language is updated to this scale.
5. No new monitoring or enforcement layers (D9); C1a (`d38d2f2`) is a bug fix, not a precedent for instrumentation.

Reasoning: scale by blast radius keeps the defect class the protocol exists to catch while removing the volume driver. One reviewer statement is a deliberately lower bar for low-blast-radius changes.

Alternatives rejected: full suspension except major releases (GLM) drops the mechanism that caught real defects; status quo keeps unbounded review artifacts.

Consequences: review artifact volume drops sharply; core review rigor is unchanged; the lighter path is explicitly recorded so it cannot be confused with no review.

Approved by: _pending owner confirmation_
### PROTO-DEC-0039
Status: Accepted
Date: 2026-09-19
Reopen-trigger: owner-directive

Context:
The mission in `.ai/PLAN.md:51-54` was never executed and all five `## Review` boxes are unchecked; consumer repositories have had no product work while the protocol audited itself. The audit round is substantively closed except for the Qoder downgrade, the Codex receipt and the record pass.

Decision:
1. Feature freeze: protocol work is limited to P0 defects (data loss, security, false green, broken install) and audit closure until the product-pilot report exists.
2. Product pilot per `.ai/PLAN.md`: product `D:\Block-Puzzle`, first objective = close the open DEC-0024 Step 3 acceptance item (manager continuity p.2, dependency p.7a, focus p.7d, on-device verification), then the Stage B backlog as the 10-20-task pilot stream including one defect fix, one superseded decision, two agents in one area and one interrupted task; metrics from `PLAN.md:63-68` pre-agreed; control = "one task file + one handoff note" (`PLAN.md:67-68`); no protocol changes during the pilot except P0.
3. v2.0 scope, scheduled after the pilot report: a single Node validator per `PROTO-DEC-0025` item 5 with differential verification against the PowerShell reference; extract process liveness into a leaf module to break the require cycle (`protocol-lock.cjs:10` -> `protocol-session.cjs:26` -> `protocol-hooks.cjs:553` -> `protocol-archive.cjs:11-12` -> lock); split `protocol-handoff.cjs` (1,047 lines) into snapshot/evidence/gate; no new gates; existing hashes and receipt formats are frozen, not deleted.
4. Audit closure: Qoder -> advisory (header `Receipt-Owner: qoder-86c43a9a02fd9789` does not match journal `qoder-4d1795a4ffecb995`; the review file remains immutable); Codex receipt re-recorded at the freeze; C1a accepted; `.ai/TASK.md` reconciled; journals restored to <= 30 files.
5. Record pass: one lock holder, order Gemini -> DeepSeek -> Codex (if available); receipts recorded only after the tree is final; CI green on the frozen tree. Agent Manager and CLI/`agy` are both recorded execution vectors, chosen per task.

Reasoning: the pilot is the highest-value action available and the only test of the protocol's consumer value. v2.0 before that data would repeat the current mistake at lower cost.

Alternatives rejected: continuing protocol work first (S1 scenario rejected); running v2.0 immediately (non-urgent, unverifiable against product value); treating C1a as a precedent for more instrumentation (D9).

Consequences: consumer repositories receive the next full work window; v2.0 becomes a reduction, not an expansion; this task's completion gate follows PROTO-DEC-0038.

Approved by: _pending owner confirmation_

## 5. `.ai/TASK.md` replacement text (<= 80 lines)
```markdown
# Current Task

Status: In progress
Owner: RuslanFomenko
Last update: 2026-09-19

## Objective

Execute the owner-approved recovery package (PROTO-DEC-0036..0039): record the decisions, archive the non-active review corpus receipt-safely, freeze protocol features, and run the first real product pilot in D:\Block-Puzzle.

## Problem

The protocol spent 48 h on itself while the consumer repositories received no product work; Track C/Repomix is closed as refuted; docs/reviews/ is unbounded; the PLAN.md product pilot has never run.

## Constraints

- Feature freeze: only P0 defects (data loss, security, false green, broken install) and audit closure until the pilot report exists (PROTO-DEC-0039).
- Corpus: active docs/reviews/ <= 60 files / 600 KB; classify-first archive; never touch DECISIONS.md, REGISTRY.md, ARCHIVE.md (PROTO-DEC-0037).
- Review scale: full pairs for protocol core and consumer security/data paths; one reviewer statement otherwise (PROTO-DEC-0038).
- No protocol session commits in Block-Puzzle/VPN; one lock holder; receipts only after the tree is final (PROTO-DEC-0025 item 4).
- Validator 0 warnings; journals <= 30 files; TASK <= 80 lines.

## Acceptance criteria

- [ ] Owner approves PROTO-DEC-0036..0039; blocks and registry rows appended by one lock holder with provenance notes.
- [ ] Corpus archived per PROTO-DEC-0037 with an INDEX.md; doctor and gate-check clean before and after; any failing receipt restores its file.
- [ ] AGENTS.md section 8 cap row and section 2 review scale updated; PLAN.md rewritten (<= 200 lines) with metrics 63-68 kept.
- [ ] Audit round closed: Qoder advisory, Codex re-recorded at freeze, C1a accepted, journals 29-30, validator green on the frozen tree.
- [ ] Product pilot started in Block-Puzzle (DEC-0024 Step 3 first); metrics pre-agreed; freeze holds.
- [ ] v2.0 scope scheduled after the pilot report (PROTO-DEC-0039 item 3).

## Roles

- gemini: implementer
- deepseek: reviewer, auditor, controller

## Current state

Track C closed (B2/B3/B4/C2 cancelled). F-001 fixed by C1a (`d38d2f2`); F-002/F-003/F-004 fixed; Qoder downgrade and Codex re-record pending.

## Next

Owner rules H1-H4; lock holder transcribes; corpus archive; record pass; first Block-Puzzle pilot task.

## Open questions

- Codex re-record needs quota and a frozen tree; if unavailable, cite its audit as advisory anchored to `001af50`.
- Pilot start depends on the H3 owner confirmation.
```

## 6. `.ai/PLAN.md` edit instructions (target <= 120 lines, hard cap 200)
1. Under the shared-doc lock, replace the historical blocks `## Where wave 1 ended` and `## Production readiness, closed 2026-09-13` (current lines 16-49) with one line: "Historical waves are recorded in `.ai/DECISIONS.md` (DEC-0011..DEC-0021); this plan now covers the product pilot only."
2. Header: keep `Status: Draft` until the owner approves H3; then `Status: Approved`, `Approval: owner (<date>)`. Keep Author.
3. Keep `## Objective` (lines 51-54) and the five metrics in `## Proposed approach` (lines 63-68) verbatim; they are the pre-registered measures.
4. Rewrite lines 56-61 to the concrete pilot: product `D:\Block-Puzzle`, first objective DEC-0024 Step 3 (continuity p.2, dependency p.7a, focus p.7d, on-device verification), 10-20 comparable tasks including the four mandated shapes, control = one task file + one handoff note.
5. Add `## Product pilot scope`: task-count bounds, metric table, control definition, freeze rule (PROTO-DEC-0039), and the stop condition: if the protocol arm does not beat the control on the pre-agreed metrics, report it and move to the v2.0 reduction decision.
6. `## Alternatives considered`: replace the Codex-adapter text with "Pilot v2/Repomix closed (PROTO-DEC-0036); v2.0 scheduled after this pilot (PROTO-DEC-0039)." Keep `## Risks` and `## Validation`; add one risk line: "pilot run by protocol authors flatters the protocol; metrics frozen before task 1."
7. `## Review`: mark `Target metrics agreed before the first task` when true; leave `Approved by owner` unchecked until H3. Do not edit DECISIONS/REGISTRY/ARCHIVE in the same pass.

## 7. Cleanup scope (docs/reviews/ only; execute after the record pass)
**Stays in place (active window, 50 files today):** every path cited anywhere under `.ai/worklog/*.md` (38 unique, all exist) and every file carrying `Mode: CERTIFYING` (17); overlap 5. Also stay until the relevant block is recorded: this prompt, the council synthesis, the Gemini audit, the DeepSeek response, `2026-09-19-open-disagreements-prompt.md`, `2026-09-19-v2-remediation-plan.md`, the H1 report + correction + postmortem. Re-derive the set at freeze time (this snapshot is 130 files and may have grown).

**Moves to `docs/reviews/archive/` (~80 files):** all `*-prompt*.md` (25) not in the keep set; runbooks (2); H1 smoke/runbook artifacts; pre-2026-09-18 material (3); 2026-09-18 audit-round and trade-study files not cited by a live receipt; 2026-09-19 discussion/superseded-plan files after the record pass. Use `git mv` only, one file per command, one INDEX.md row per move. Never touch `.ai/DECISIONS.md`, `docs/decisions/REGISTRY.md`, `.ai/ARCHIVE.md`; no deletion of any review text anywhere.

**Receipt-safety sequence (record exit codes):**
```powershell
node .ai/bin/protocol.cjs doctor
node .ai/bin/protocol-handoff.cjs gate-check
git status --short
# move one classified file, add its INDEX.md row, then:
node .ai/bin/protocol.cjs doctor
node .ai/bin/protocol-handoff.cjs gate-check
node .ai/bin/protocol-handoff.cjs verify --owner <lock-owner>
powershell -ExecutionPolicy Bypass -File .\validate-protocol.ps1
```
If any check fails after a move, `git mv` the file back and stop; the index row records the attempt. A receipt recorded before the archive fails `verify` after it, so the record pass is **last**, after all moves; keep the index append-only and the tree otherwise untouched between checks.

## 8. Falsifiers
- **S1/Repomix closure**: pre-registered controlled run on this repository, second model family, >= 25% median broad total-token reduction and <= +5% narrow regression against a matched control with scope-selection cost counted - or a genuine repository-shape change making search impractical.
- **S3 budget**: after two release cycles, measured evidence that current work needs archived files (repeated restores) or doctor/gate-check failures caused by the archive; then raise the cap or widen the window.
- **S4 scale**: a defect a full pair would have caught escapes in protocol core or consumer security/data paths in two consecutive rounds -> restore full pairs; conversely, zero core findings over three rounds at > 20% effort -> narrow further.
- **S6 pilot**: if the protocol arm does not beat the one-file-handoff control on the pre-agreed metrics, the consumer-value hypothesis is refuted; v2.0 becomes a reduction/retirement decision.
- **S7 v2.0**: Node validator disagrees with the PowerShell reference on any differential case, or the cycle break regresses lock/session tests -> keep the PS validator and revert the extraction.
- **Trajectory verdict (whole package)**: measured, reproducible proof that the protocol prevented >= 3 critical defects in Block-Puzzle/VPN that would otherwise have reached users.

## 9. Execution order
1. Owner rules on H1-H4 and approves/rejects each block (owner; ~30 min).
2. One lock holder (Gemini recommended) appends PROTO-DEC-0036..0039, registry rows, TASK reconciliation, AGENTS.md cap + review-scale edits, PLAN rewrite (1 session; 2-3 h).
3. Freeze: stop all other sessions; `git status` baseline; run validator + doctor + gate-check; record outputs (same session; 30 min).
4. Corpus archive per section 7 with index and both-side checks (same session; 1-2 h).
5. Record pass Gemini -> DeepSeek -> Codex (if available) on the final tree; CI green (same or fresh sessions; 1-2 h).
6. Coordinator hands the pilot stream to the assigned Block-Puzzle session (days); after the pilot report, schedule v2.0 under a fresh lock holder (Node validator differential, liveness leaf module, handoff split) (next milestone).

No step may run outside the lock for shared documents; no protocol session commits inside `D:\Block-Puzzle` or `D:\VPN`; nothing in this file is approved until the owner fills the `Approved by:` lines.
