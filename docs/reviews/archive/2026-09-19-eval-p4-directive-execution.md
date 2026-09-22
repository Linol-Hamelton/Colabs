# Evaluation P4 - Owner Directive "PROTO-DEC-0036 course correction": execution feasibility report

**Date**: 2026-09-19
**Baseline**: `d38d2f2` (HEAD of `main`), working tree dirty (9 untracked review files, `Modelfile` staged for deletion)
**Reviewer**: DeepSeek V4.1 Flash, read-only evaluator (evaluation freeze: no repository writes except this report)
**Mode**: ADVISORY
**Receipt-Owner**: none
**Verdict**: FEASIBLE WITH CORRECTIONS - directives 1, 3, 4 are blocked until (a) the owner confirms approval directly, (b) a new certifying review with a fresh receipt exists, and (c) the non-taxonomy reopen trigger is replaced. Directives 2 and 6 are executable; directive 5 is an owner/coordinator action, not a repository edit.
`[MODE: READ-ONLY ADVISORY]` - this report cannot satisfy a completion gate (PROTO-DEC-0031).

## 1. Feasibility verdict per numbered directive

1. **Close Track C / record PROTO-DEC-0036 / registry row** - FEASIBLE WITH CORRECTIONS, owner-gated.
   Mechanically safe: `.ai/DECISIONS.md` is append-only and uncapped; the validator compares committed blocks to `HEAD` and WARNs only on a missing/unknown `Reopen-trigger:`. Hard defects: the proposed trigger is invalid; the `Approved by:` line lacks the PROTO-DEC-0030 provenance suffix; no owner confirmation exists in the repository (see 6.2); `accepted` cannot be claimed before approval (PROTO-DEC-0022 forbids `Proposed`; proposals live in `.ai/PLAN.md`).
2. **Stop Ollama benchmark pulls** - FEASIBLE, no repository artifact required. `ollama list` evidence is in `.ai/worklog/deepseek-flash-8a681a17d5224abf.md` (models pulled). Note the staged deletion `D Modelfile` is another session's uncommitted work; do not commit or revert it as part of this directive.
3. **Context detox of `docs/reviews/`** - FEASIBLE WITH CORRECTIONS. `docs/reviews/archive/` does not exist (verified `Test-Path` = False). 131 files / 1,366,911 bytes today; 122 tracked + 9 untracked. Moving files is legal for history but must not move (i) the two future completion-gate artifacts, (ii) any review whose receipt must stay fresh at freeze, (iii) this evaluation's sibling reports pending the owner's decision. The 85% reduction is a projection; the candidate stay-set below yields ~92% byte reduction (1,367 KB -> ~111 KB).
4. **Close the current task in `.ai/TASK.md`** - NOT EXECUTABLE AS WRITTEN TODAY. `Status: Completed` triggers the full completion gate: a unified adversarial prompt, a separate CERTIFYING review with PASS/RECOMMENDATION, and a receipt verifying against the frozen tree. The available Track C audits are Codex FAIL, Gemini FAIL, Qoder RECOMMENDATION with a broken `Receipt-Owner`; the systemic reviews are ADVISORY (DeepSeek) or predate the execution. TASK.md also still carries unchecked items (C1a; audit closure) that contradict "closed". A new certifying review plus receipt is mandatory and is sequenced in 7.
5. **Redirect active sessions to `D:\Block-Puzzle` and `D:\VPN`** - FEASIBLE ONLY AS AN OWNER/COORDINATOR ACTION. No repository edit can assign sessions; PROTO-DEC-0025 item 4 forbids this repository from committing in consumers. Both consumers currently run protocol **1.9.4** and must be upgraded inside their own sessions before or during the pivot.
6. **v2.0 as radical simplification** - FEASIBLE AS DECISION TEXT ONLY. Node.js validator migration is already scheduled by PROTO-DEC-0025 item 5 with differential verification; the require-cycle and `protocol-handoff.cjs` (1,047 lines) refactors are mechanical. No new gates/layers may be added. No implementation now.

## 2. Corrected PROTO-DEC-0036 (append only after direct owner confirmation)

```markdown
### PROTO-DEC-0036

Status: Accepted
Date: 2026-09-19
Reopen-trigger: new-external-data

Context:
The H1 pilot (repetition 1 of the pre-registered design in PROTO-DEC-0035; ten crossed tasks, DeepSeek V4 Pro subject)
found Arm B (raw Repomix digest) worse than the unassisted control in every cohort: repetition-1 broad total tokens
+72.79%, repetition-1 narrow total +60.20%; fresh-token views +9.10% and +42.76% (correction addendum to
docs/reviews/2026-09-19-h1-pilot-report.md). The pre-registered PROTO-DEC-0035 thresholds (>=25% broad reduction,
<=+5% narrow regression) are breached, so the stop rule was executed: no MCP adoption, no Arm C. The post-pilot
proposal to test further arms (B2/B3/B4/C2) on local 8B models was rejected by the three-model council synthesis
(docs/reviews/2026-09-19-grand-consensus-systemic-course-correction.md): the raw digest (~88k tokens) is larger than
the fresh work it would save (~45-73k tokens), and small-model Git variance would make results uninterpretable. The
kernel is 2,826 lines of JavaScript (~21k tokens); the review corpus reached 131 files / ~1.30 MB (measured
2026-09-19), the dominant avoidable context load.

Decision:
1. Close Track C permanently for this repository: no Arm B2/B3/B4/C2 pilots, no MCP adoption, no further index
   trials. This executes, and does not supersede, PROTO-DEC-0035.
2. Repomix remains only the optional, on-demand, advisory CLI helper defined in PROTO-DEC-0034: never auto-injected,
   never a hook, never Evidence, never a gate input.
3. Apply a classified retention policy to docs/reviews/: move historical prompts, discussions and pre-v1.9.5 review
   material into docs/reviews/archive/; keep at the root only the reviews cited by the current completion gate and
   the active evidence set; add docs/reviews/archive/INDEX.md mapping every moved path. Files cited by a live
   receipt or completion gate are never moved.
4. Freeze protocol meta-feature development. New collaborative work starts in the consumer repositories
   D:\Block-Puzzle and D:\VPN under their own task contexts (PROTO-DEC-0025 item 4).
5. Plan v2.0 strictly as simplification: a single Node.js validator per PROTO-DEC-0025 item 5, removal of the kernel
   require-cycle (primitives -> lock -> session), and decomposition of protocol-handoff.cjs. No new gates or layers.

Reasoning:
Pre-registered thresholds are binding; one repetition suffices to reject adoption because the observed effect has the
opposite sign and is large relative to the bound. An index larger than the work it indexes cannot save context, and
targeted ripgrep/Read remains O(relevant). Capping working memory (PROTO-DEC-0026) while leaving the review corpus
unbounded created the self-referential load this decision ends.

Alternatives rejected:
- Running Pilot v2 (Arms B2-B4/C2) on local 8B models: sunk-cost escalation; the arithmetic refutes the premise and
  small-model Git variance would corrupt the data.
- Mass-deleting docs/reviews/: breaks receipt path bindings (PROTO-DEC-0032) and destroys history that must be
  archived, not erased.
- Adding monitoring/hardening layers before consumer validation: rejected by the council (D9) and contrary to v2.0
  as simplification.

Consequences:
Track C is closed; pilot worktrees and runtime data may be purged after the owner's cleanup decision. Archiving moves
the tree and invalidates all pre-move Evidence digests; any review cited by a completion gate must be re-recorded
after the freeze. Review paths cited by immutable historical text (journals, decision blocks) no longer resolve at
their old locations; INDEX.md preserves the mapping. Consumer repositories run protocol v1.9.4 and are upgraded in
their own sessions.

Approved by: _pending owner confirmation_
```

Note: replace the last line with `Approved by: RuslanFomenko (direct owner confirmation, 2026-09-19, transcribed by <agent>)` only after the owner confirms in chat (PROTO-DEC-0030). Until then this block must not be appended.

## 3. Exact registry row (append after the block; never edit existing rows)

```markdown
| PROTO-DEC-0036 | accepted | new-external-data | | | docs/reviews/2026-09-19-grand-consensus-systemic-course-correction.md |
```

Status `accepted` only after the approval line is filled. The trigger must match the block exactly. `metric-gain-in-consumer-repo` is not in the PROTO-DEC-0033 closed taxonomy (`invariant-broken`, `metric-drop`, `new-external-data`, `security-finding`, `owner-directive`, `higher-source-contradiction`, `none`); the validator would emit an unknown-trigger WARN, and `metric-drop` is semantically wrong (it covers a measured drop, not a gain). `new-external-data` is the correct home for the reproducible consumer-repo falsifier in the DeepSeek review; `owner-directive` is always available but weaker.

## 4. Exact `.ai/TASK.md` replacement (49 -> 38 lines, under the 80-line limit)

```markdown
# Current Task

Status: Completed
Owner: RuslanFomenko
Last update: 2026-09-19

## Objective

Close the v1.9.5 external audit round and Track C (context economy), record PROTO-DEC-0036, archive the historical
review corpus, and freeze protocol meta-development in favour of consumer-repository work.

## Outcome

- C1a fail-safe Stop telemetry (F-001) implemented and committed with regressions (d38d2f2).
- F-002/F-003/F-004 corrected: cohort arithmetic, trials.jsonl fidelity, journal count 29/30 (correction addendum).
- H1 pilot negative result for the raw Repomix digest; PROTO-DEC-0035 stop rule executed (no MCP, no Arm C).
- PROTO-DEC-0036 recorded: Track C closed; Repomix stays optional/advisory only (PROTO-DEC-0034).
- docs/reviews/ classified: historical material moved to docs/reviews/archive/ with INDEX.md; gate-cited reviews
  unchanged in place.
- Qoder Track C audit downgraded to advisory (Receipt-Owner mismatch); Codex and Gemini FAILs closed by the
  correction addendum and d38d2f2.
- Protocol meta-feature work frozen; v2.0 scoped as simplification only (PROTO-DEC-0025 item 5).

## Next

Owner starts the first protocol-observed product task in D:\Block-Puzzle or D:\VPN (the mission in .ai/PLAN.md).
Consumer installations are at v1.9.4 and are upgraded within their own sessions. v2.0 starts only after product
evidence exists.

## Completion gate

- Adversarial review prompt: docs/reviews/2026-09-19-course-correction-adversarial-audit-prompt.md
- Independent review: docs/reviews/2026-09-19-course-correction-certification.md
```

The two gate files do not exist yet. They must be created before this text is applied. The prompt must contain a phrase matching the validator's "unified ... adversarial ... prompt" rule; the review must declare `Reviewer:`, `Verdict: PASS|RECOMMENDATION`, `Date:`, `Mode: CERTIFYING`, `Receipt-Owner: <id>`, and the owner's journal entry must mention the review path without a period or slash immediately after it (gate-check boundary `(?![A-Za-z0-9._/-])`, protocol-handoff.cjs:1074).

## 5. Classified move list and receipt-safety checks (read-only)

**Proposed stay set (8 root files, all currently existing):**
1. `2026-09-19-grand-consensus-systemic-course-correction.md` - decision basis, CERTIFYING, receipt currently verifies
2. `2026-09-19-gemini-systemic-repository-audit.md` - council input, CERTIFYING
3. `2026-09-19-deepseek-flash-systemic-audit-response.md` - council input, ADVISORY
4. `2026-09-19-codex-trackc-h1-audit.md` - F-001..F-004 source, cited in TASK.md
5. `2026-09-19-gemini-trackc-h1-audit.md` - second certifying package FAIL
6. `2026-09-19-qoder-trackc-h1-audit.md` - advisory downgrade evidence
7. `2026-09-19-h1-pilot-report.md` - primary pilot evidence
8. `2026-09-19-h1-pilot-report-correction.md` - corrected numbers cited by PROTO-DEC-0036

**Move set**: every other root file = 123 files as measured (117 tracked + 6 untracked): 25 `*prompt*`, 41 audit-named (45 minus 4 staying), 11 `*certif*`, 42 dated 2026-09-12..18, 81 dated 2026-09-19 (including `2026-09-19-codex-trackc-h1-probes.cjs`, runbooks, discussions, plan reviews, release certifications). Exact predicate: `Get-ChildItem docs/reviews -File | Where-Object { $_.Name -notin $stay -and $_.Name -notlike '2026-09-19-eval-*' }` (eval siblings exempt pending owner decision). Tracked files move with `git mv`, untracked with `Move-Item`; same basenames, no collisions. `docs/reviews/archive/INDEX.md` records `old -> new` for each. The 5-8 budget can be met strictly by moving inputs 3, 7, 8 too and keeping the consensus + three audits + the two new gate artifacts (7 files).

**Checks actually run (2026-09-19, read-only):**

- `node .ai/bin/protocol.cjs doctor` -> `Verdict: Protocol Healthy. All checks passed.` lock free, operation gate clean, `.ai/TASK.md: 49/80`, `.ai/worklog/: 29/30`, Merkle chains verified across 29 journals, `[WARN] Legacy unauthenticated Evidence receipts: 10 journal(s)`.
- `node .ai/bin/protocol-handoff.cjs gate-check` -> `not applicable: task status is In progress`, exit 0. No review is gate-bound today; the 8-file stay set is a policy choice for the imminent closure, not a gate-check requirement.
- `node .ai/bin/protocol-handoff.cjs verify --owner gemini-434bcd8012e0f38c` -> `.ai\worklog\gemini-434bcd8012e0f38c.md: evidence matches the current tree`, exit 0. This receipt will stale the moment any new file lands in the tree (including this report and the three eval siblings), so the cited owner must re-record at freeze.
- `git branch -a` -> only `main`, `origin/main`, `origin/snapshot-2026-09-19`; no B2/B3/B4/C2 arms exist as branches.
- Corpus: 131 files, 1,366,911 bytes; kernel `.ai/bin/*.cjs` exactly 2,826 lines; consumers at protocol 1.9.4 (last commits 2026-09-17 / 2026-09-18).

Safety conclusions: (a) moving files is safe only for non-cited, non-receipt-bound history; (b) the validator inspects `docs/reviews/**` recursively in the source role (validate-protocol.ps1:175), so archived files stay encoding-checked - keep INDEX.md UTF-8 without BOM and LF; (c) all pre-move receipts report "tree moved" after the archival, which is expected and must be stated in the decision Consequences; (d) no write to `docs/reviews/` may occur after the final certifying record, or the gate goes stale again.

## 6. Errors, contradictions and unverifiable claims in the directive

1. **Invalid reopen trigger** (hard): `metric-gain-in-consumer-repo` is outside the closed PROTO-DEC-0033 taxonomy; replace with `new-external-data`.
2. **Owner approval is unverified**: the directive asserts "direct owner confirmation, 2026-09-19". The cited consensus journal (`gemini-434bcd8012e0f38c.md`, entry of 20:44Z) says "Owner reviews the final executive decision prompt and formally approves PROTO-DEC-0036" - i.e. approval was still pending. The claimed `Approved by:` line also omits the mandatory `transcribed by <agent>` provenance (PROTO-DEC-0030). Treat as pending.
3. **"Unanimous consensus" provenance is weaker than stated**: of the two cited files, one is a synthesis by a single session that names GLM 5.1 as a participant, and the DeepSeek file is explicitly `Mode: ADVISORY`, `Receipt-Owner: none`, non-certifying. No standalone GLM systemic-audit artifact exists in the repository (only a plan adversarial review).
4. **"Branches B2, B3, B4, C2" do not exist**: `git branch -a` shows none; these are experimental arms proposed in the post-mortem, not Git branches. "Cancelling" them is a text decision, not a git operation.
5. **"F-001..F-004 closed by commit d38d2f2" is imprecise**: d38d2f2 contains the F-001 code fix and the correction addendum; F-002/F-003 corrected data lives in `.ai/runtime/pilot-data/trials.jsonl`, which is untracked and disposable (`.ai/runtime/` is excluded from Git and from digests), so the data fix is not reproducible from a clone. Current TASK.md still lists C1a and audit closure as unchecked.
6. **Pilot claim needs a cohort qualifier**: +72.79%/+60.20% are the corrected repetition-1 cohorts (the preliminary table's narrow figure was +83.9% all-rows). It is one repetition of the planned three, flagship subject, parallel launch; the report itself notes Arm B produced more thorough audits (quality confound) and that timing/cost are non-authoritative. The stop-rule conclusion holds under every cohort reading.
7. **"1.25 MB / 1:460" are snapshot estimates**: measured now 131 files / 1,366,911 bytes (≈1.30 MiB); the consensus snapshot said 126 / 1,299,793. The ratio 1:460 is bytes per line of code, not a token ratio. "~21k tokens" and "~88k digest" are reported estimates (PROTOCOL.md records ~21.8k raw core and ~88.1k raw kernel+tests).
8. **"85% context reduction" is a projection**: the proposed 8-file stay set removes ~92% of review bytes; only the owner-approved execution proves the number.
9. **Closure order violates the protocol if executed as written**: `Status: Completed` before a certifying review and a receipt frozen after all writes will fail `gate-check` (PROTO-DEC-0032), and the archive moves would stale the grand-consensus receipt. The directive's "immediate execution" of items 1, 3, 4 is therefore blocked behind the sequence in 7.
10. **Directive 5 cannot be a repository edit**: session placement is an owner/coordinator action; also consumers run 1.9.4, so the pivot must include upgrading them in their own sessions (PROTO-DEC-0025 item 4).
11. **Minor**: directive 2 cites `omnicoder-2-9b`/`qwen3:8b`; the pulls are recorded but no Ollama benchmark task exists in the repository to cancel - it is an operational stop, plus the pre-existing staged `Modelfile` deletion should be left to its owner.

## 7. Exact command sequence for a lock-holding session

```powershell
# 0. Preconditions: owner confirmed approval in chat; gate artifacts drafted; no other writer active.
node .ai/bin/protocol-lock.cjs status                     # expect lock: null
node .ai/bin/protocol-session.cjs start --agent <agent>   # note the printed session id -> OWNER
node .ai/bin/protocol-lock.cjs acquire --owner <session-id>

# 1. Archive within the lock (after owner approval; never move gate-cited or receipt-bound files)
New-Item -ItemType Directory -Force docs/reviews/archive
# tracked:   git mv docs/reviews/<file> docs/reviews/archive/<file>   (117 files)
# untracked: Move-Item docs/reviews/<file> docs/reviews/archive/<file> (6 files; exclude eval-*)
# write docs/reviews/archive/INDEX.md (old -> new mapping, UTF-8 no BOM, LF)

# 2. Append the corrected PROTO-DEC-0036 to .ai/DECISIONS.md (append-only; Approved by only if confirmed)
# 3. Append the registry row to docs/decisions/REGISTRY.md (append-only)
# 4. Replace .ai/TASK.md with the section-4 text (Status: Completed + Completion gate paths)

# 5. Independent reviewer session creates the two gate artifacts, then bootstraps the receipt,
#    because a first full `record` on a Completed task fails gate-check before a receipt exists
#    (PROTOCOL_SKIP_GATE=1 is set only for --quick, protocol-handoff.cjs:97):
node .ai/bin/protocol-session.cjs start --agent <reviewer>
# reviewer writes its dated journal entry naming docs/reviews/2026-09-19-course-correction-certification.md
node .ai/bin/protocol-handoff.cjs record --owner <reviewer-session-id> --quick
powershell -ExecutionPolicy Bypass -File .\validate-protocol.ps1   # gate-check now verifies
node .ai/bin/protocol-handoff.cjs record --owner <reviewer-session-id>   # full suite-backed refresh, same tree

# 6. Freeze verification
powershell -ExecutionPolicy Bypass -File .\validate-protocol.ps1
powershell -ExecutionPolicy Bypass -File .\test-protocol.ps1
node .ai/bin/protocol-handoff.cjs gate-check
node .ai/bin/protocol-lock.cjs release --owner <session-id>

# 7. Commit only if the owner instructed it (no other session writes after the receipt)
# git add -A; git commit -m "..."
```

Ordering rules: all tree writes precede both records; `record` touches only the journal (excluded from the digest), so receipts stay fresh across record passes; `.ai/ARCHIVE.md` auto-archiving is digest-neutral (protocol-hooks.cjs:125); no new file may land in the tree after the final record or the gate stales again. This report itself, and the three sibling evaluation reports, will stale the current gemini receipt until the freeze pass re-records it.
