# P1 Evaluation - Owner-Approval Decision on the Radical Simplification Package

**Date**: 2026-09-19
**Reviewed commit**: d38d2f2ae4b4c17fe6c2c18f11215cedb2f10eb1
**Working tree**: dirty
**Reviewer**: deepseek-flash (independent evaluation session, prompt formulation P1)
**Scope**: owner-approval checklist, ready-to-append decision artifacts, adversarial audit of the prompt
**Verdict**: RECOMMENDATION - RADICAL SIMPLIFICATION, corrected (sections 3-4)
**Mode**: ADVISORY (evaluation; no Evidence receipt; nothing below is approved until the owner signs)

> This file answers the "SYSTEMIC AUDIT: DECISION TIME" checklist. It records rulings, not approvals: every `Approved by:` line stays `_pending owner confirmation_` (AGENTS.md section 2, PROTO-DEC-0030). Only this file was created; nothing else was modified, moved or committed.

## 0. Ruling in one line

RADICAL SIMPLIFICATION: approve de-escalation, the product pivot and v2.0 as simplification; correct four items (D1 wording, D7 method, the review rule, D8 scope). Next 24 hours: one audit-closure/record pass, then ONE product objective in ONE consumer repository - not both.

## 1. Filled checklist

### 1.1 Immediate de-escalation (Track C and Repomix)

- [x] **D1 - Close Track C (Repomix) permanently: YES, with corrected text.** The stop rule fired and the M1/M2 index-adoption hypothesis is refuted for this repository; but the closure must not cancel `PROTO-DEC-0034` (M0 digest and C2 tooling policy stay as an optional advisory helper), and "falsified by Stop Rule" inverts the logic - the pilot data breached pre-registered thresholds, then the stop rule was executed. Use section 2, not the prompt's one-liner.
- [x] **D5 - Halt Ollama downloads: YES, but already moot.** `ollama list` at this reading shows `carstenuhlig/omnicoder-2-9b:latest` 5.7 GB and `qwen3:8b` 5.2 GB fully pulled (modified ~28 and ~20 minutes earlier); there is no active download. The substantive ruling "no local 8B/9B benchmark runs for Git tasks" stands; keep the files or `ollama rm` them later (owner's choice).

### 1.2 Context detox (Rule 7 and reviews)

- [x] **D7 - Move historical reviews: YES, classified-first; the "last 5-10 active files" target is rejected as unsafe.** `PROTO-DEC-0032` binds `gate-check` to cited review paths and `PROTO-DEC-0026` section 6 makes reviews immutable records; a blind move breaks cited paths and stales receipts. Corpus at this reading: 130 `.md` files / 1,366,911 bytes, growing per round. Freeze the active set (current release certification + certifying reviews cited by a decision or a live completion gate + open audit items), `git mv` the rest to `docs/reviews/archive/` with an old-to-new index, and run `node .ai/bin/protocol.cjs doctor` and `node .ai/bin/protocol-handoff.cjs gate-check` before and after. Never touch `.ai/DECISIONS.md`, `docs/decisions/REGISTRY.md`, `.ai/ARCHIVE.md`.
- [x] **"Rule 7 Amendment" - suspend the mandatory adversarial prompt: NO as written; YES risk-scaled.** The rule is AGENTS.md section 2, not section 7 (section 7 is checks and evidence); its trigger is completing a plan or council decision, not "the end of every session"; and full suspension removes the completion gate that produced `PROTO-DEC-0021`'s ten findings and F-001..F-004. "Only major releases" fails because a hook, lock or gate change can ship in any session. Replace with the blast-radius rule in `PROTO-DEC-0037` (section 2): full prompt + independent certifying review for `.ai/`, `.claude/`, hooks, validator, gates and consumer security/data paths; one reviewer statement for docs/config/one-line fixes; artifact size capped.

### 1.3 Strategic pivot to consumers

- [x] **Product pivot: YES, with four carve-outs.** (a) The audit-closure/record pass is internal work and runs first; (b) then freeze protocol feature work except P0 fixes, and defer v2.0 implementation - as written, item 3 ("freeze all internal development") and item 4 ("approve v2.0 refactor") contradict each other; (c) product sessions run inside the consumer repository under its own task and evidence - the protocol source session commits nothing there (`PROTO-DEC-0025` item 4); (d) "Block-Puzzle and VPN" is two assignments; the owner must name one first objective, metrics and control (section 4).

### 1.4 Architectural simplification (v2.0 direction)

- [x] **D8 (v2.0 concept): YES to radical simplification as direction; NO to removing Merkle/nonces now.** Splitting `protocol-handoff.cjs` (1,047 non-blank lines), breaking the require cycle via a leaf liveness module, and a single Node validator: approved as design. Deleting entry hashes, Merkle traversal or nonces mid-flight is a breaking change: recorded Evidence, format versions and `gate-check` deep verification depend on them (`PROTO-DEC-0015/0016/0021/0028`). Freeze the mechanism, stop adding new layers, retire only with a migration note and re-recorded receipts after the product pilot (synthesis keep-list, section 5 item 3).
- [x] **PS1 deprecation: YES as the v2.0 target, conditional on differential parity.** `PROTO-DEC-0025` item 5 already schedules this and requires differential verification against the PowerShell reference. Keep `validate-protocol.ps1` (778 lines) as reference until a Node engine reproduces every check (registry immutability, decision-block edit detection, gate-check, installer self-check, encoding), then retire in one green commit. Scope note: `test-protocol.ps1` and `setup-ai-protocol.ps1` are also PowerShell; "migrate validation entirely" must name them.

### 1.5 Dispute resolution (D2-D4, D9-D12)

- [x] **D2-D4: SPLIT - cancel the meta-metrics YES; adopt the replacements NO.** "Tokens per accepted finding" goes (gameable, subjective). "Time-to-first-commit and regression count" is undefined and unpre-registered, and Track C is closed so no v2 metric is needed. If the product pilot runs, pre-register the `PLAN.md:63-68` measures before the first task; do not adopt new metrics at decision time.
- [x] **D9-D10: YES.** No new monitors, supervisory timers, budget machinery or gates; C1a is a bug fix, not a precedent; cooperative lock + git history remains the enforcement ceiling; the existing liveness layer is frozen in place, not deleted.
- [x] **D11: YES with conditions.** Qoder to advisory (broken `Receipt-Owner`) and F-001..F-004 fixed are supported: F-001 at `d38d2f2` (C1a), F-002/F-003/F-004 per the correction addendum. Closure is complete only when the Codex receipt is re-recorded at the freeze (`.ai/TASK.md:31`) and the stale TASK/state text (C1a still listed as queued) is reconciled.
- [x] **D12: NO as phrased.** `DEC-0020`: the `## Roles` section is written by the owner; nothing assigns, and "Antigravity" is an execution vector (CLI/IDE), not a participant id. Record the CLI/`agy` and Agent Manager as vectors with the per-task caveat; let the owner write the roles.

## 2. Ready-to-append artifacts

Append only after the owner confirms; then replace the pending line with the transcribed approval per `PROTO-DEC-0030`. `PROTO-DEC-0037` is required because item 1.2 changes `PROTO-DEC-0027` item 1 - editing AGENTS.md alone would violate the append-only decision log. The grand-consensus draft's `Reopen-trigger: metric-gain-in-consumer-repo` is outside the closed `PROTO-DEC-0033` taxonomy and is corrected to `owner-directive` here.

```markdown
### PROTO-DEC-0036

Status: Accepted
Date: 2026-09-19
Reopen-trigger: owner-directive

Context:
Track C tested whether a universal on-demand context digest reduces session token cost (PROTO-DEC-0034 M0/C2; PROTO-DEC-0035 C1). The H1 pilot (one repetition, ten crossed tasks, subject DeepSeek V4 Pro) compared Arm B (raw Repomix digest) with Arm A (no digest). After the external audit corrections (F-002, docs/reviews/2026-09-19-h1-pilot-report-correction.md), Arm B breached every pre-registered threshold: broad total tokens +72.79% (threshold: >= 25% reduction) and broad fresh +9.10%; narrow total +60.20% and narrow fresh +42.76% (threshold: <= +5%). Both certifying auditors confirmed the negative result; no cohort interpretation passes the gate. A post-pilot proposal for further arms (B2/B3/B4/C2) on local 8B/9B models was rejected as sunk-cost escalation, and those models were already fully pulled, so no benchmark was pending. The digest itself is about 88k tokens, larger than the 45-73k fresh tokens an unassisted session uses on the same task set.

Decision:
1. Track C is closed as a research track for this repository: no Pilot v2, no arms B2/B3/B4/C2, no Repomix index or MCP adoption run.
2. The PROTO-DEC-0035 stop rule is executed and satisfied; the M1/M2 adoption hypothesis is refuted for this repository and task set. PROTO-DEC-0034 remains in force: the digest stays an optional, on-demand, advisory CLI helper, never auto-injected, never a gate input.
3. Reopening Track C requires new data: a pre-registered, controlled run against a matched control showing >= 25% median broad total-token reduction with <= +5% narrow regression, scope-selection cost included, on a second model family - or a genuine change in repository shape that makes search impractical. The owner may also direct a reopening per PROTO-DEC-0033.
4. No goalpost shifting: the 20%/+3% thresholds proposed after the negative result are rejected; the pre-registered 25%/+5% pair stands for any future candidate.
5. Audit caveats are part of this record: F-001 fixed by C1a at d38d2f2; F-002/F-003/F-004 fixed per the correction addendum; Codex receipt to be re-recorded at the freeze; Qoder downgraded to advisory.

Reasoning:
A pre-registered threshold that is abandoned when it fails is not a threshold. The arithmetic also stands alone: an index larger than the work it indexes cannot save tokens on this repository.

Alternatives rejected:
- Pilot v2 (B2/B3/B4/C2): rejected; the stop rule already fired and the new arms redefine the same hypothesis.
- Lowering thresholds to 20%/+3%: rejected as post-hoc goalpost shifting.
- Deleting Repomix support: rejected; the advisory helper costs nothing and is already documented under PROTO-DEC-0034.

Consequences:
No further Track C compute or agent attention. The negative result is permanent record; proposals to re-run must cite the clause-3 falsifier.

Approved by: _pending owner confirmation_
```

Registry row (append-only):

```markdown
| PROTO-DEC-0036 | accepted | owner-directive | | | docs/reviews/2026-09-19-h1-pilot-report-correction.md |
```

`PROTO-DEC-0037` (risk-scaled review; supersedes PROTO-DEC-0027 item 1 only) follows the same template: Context = full-ceremony-for-every-change produced the measured loop while the mechanism caught `PROTO-DEC-0021` and F-001..F-004; Decision = mandatory full prompt + certifying review for `.ai/`, `.claude/`, hooks, validator, gates and consumer security/data paths, one reviewer statement for docs/config/one-line fixes, combined artifact cap 40 KB absent an owner-authorized incident, completion-gate paragraph of AGENTS.md section 2 unchanged for the mandatory class; Reasoning = review strength tracks blast radius; Alternatives rejected = full suspension (a gate change ships in any session) and universal pair (the measured driver); Consequences = docs close lighter, core keeps the gate. A retention rule for `docs/reviews/` (D7) needs its own block in the same pass (`PROTO-DEC-0038`): active window = current release certification + reviews cited by a live completion gate or in-force decision; everything else moves to `docs/reviews/archive/` with an old-to-new index; history is moved, never deleted; receipts are re-anchored by re-recording, not rewritten. Do not fold this into 0036.

## 3. Fatal errors, inaccuracies and unsupported claims in the prompt

1. **The proposed `PROTO-DEC-0036` one-liner is not a recordable block.** No `Reopen-trigger` (required by `PROTO-DEC-0033`), no template sections, and "falsified by Stop Rule" is backwards - the measured +72.79% breached the pre-registered gate and the stop rule was then executed. Section 2 supplies the corrected block.
2. **"Rule 7 Amendment" misidentifies the rule and its trigger.** The mandatory adversarial prompt is AGENTS.md section 2; section 7 is checks and evidence. It applies on completing a plan or council decision, not "at the end of every session". Suspending it wholesale deletes the completion gate that caught F-001..F-004 and `PROTO-DEC-0021`'s ten findings; any amendment must supersede `PROTO-DEC-0027` item 1 through a new block, not just edit AGENTS.md.
3. **"Stop-rule failure" is wrong.** The stop rule executed in full (no MCP, no Arm C); the follow-on Pilot v2 proposal was the escalation the council rejected as sunk-cost. Do not record past work as a rule violation.
4. **The headline number omits the corrected cohorts.** `+72.8%` is the broad total-token figure (+72.79% corrected); broad fresh was +9.10%, narrow total +60.20%, narrow fresh +42.76%. Citing only the largest number repeats the F-002 defect the external audit corrected.
5. **D5 is stale.** Both Ollama models are already fully pulled (`ollama list`: 5.7 GB and 5.2 GB, modified minutes before the reading). Nothing can be halted; only "do not run benchmarks on them" has content.
6. **D7's "keep only the last 5-10 active files" understates the receipt constraint.** `PROTO-DEC-0032` binds `gate-check` to cited review paths and `PROTO-DEC-0026` section 6 calls reviews immutable records; a blind move breaks cited paths and stales Evidence digests. Classify-first with an index and `doctor`/`gate-check` runs is the safe form.
7. **The falsifier conflates two tests.** Track C reopening is governed by a token-reduction measurement (>= 25% broad, <= +5% narrow, `PROTO-DEC-0035`), not defect-prevention in products; the ">= 3 critical defects prevented" bar is the trajectory-level counterfactual, practically unprovable and never operationalized. As written, the closure becomes unreopenable by the evidence the protocol itself pre-registered. "Retain the current bureaucracy" is also a strawman: no recorded participant defended the status quo; the dispute is simplification depth.
8. **The package contradicts itself.** Item 3 freezes all internal protocol development; item 4 approves the v2.0 re-architecture (a protocol program); the D11 closure is also internal work. Sequence: closure pass, freeze, v2.0 design/implementation after the pilot.
9. **"Redirect all agent sessions to Block-Puzzle and VPN" is two assignments.** `PLAN.md` requires one product objective with owner-agreed metrics and a control arm, and `DEC-0020` records the first pilot's failure of exactly this kind (one task given twice, two answers, no product). Consumer sessions run under the consumer repository's task and are not committed by the protocol session (`PROTO-DEC-0025` item 4).
10. **D2-D4 and D12 renumber/redirect repository items.** D2-D4 in `2026-09-19-open-disagreements-prompt.md` are metric formula, thresholds and secondary metrics, not "cancel meta-metrics"; D12 assigns tools to roles, which `DEC-0020` reserves to the owner. The prompt silently replaces the recorded questions.
11. **"80-90% context reduction" is an estimate, not a measurement**, the same class as the flagged "95%" figure. Measurable facts: 130 files / 1.37 MB corpus at this reading, growing per round, against a 2,826-line kernel. The 2,826-line kernel, 1,047 non-blank-line `protocol-handoff.cjs` and 778-line validator claims reproduce.
12. **"Four independent model audits (Gemini, DeepSeek, GLM, CodeGeeX)" is loose attribution.** Persisted: Gemini (certifying) and DeepSeek-Flash (advisory), plus the grand-consensus file naming GLM; CodeGeeX appears in the disagreement table, not as an audit file. Unanimity on the strategic diagnosis is supported by the grand-consensus record; the participant list varies by file.

## 4. The one item the owner must personally decide that this checklist hides

**Which single product, which first objective, and which pre-registered metrics and control arm start the pilot.** The checklist says "redirect all agent sessions to `Block-Puzzle` and `VPN` to prove the protocol's value", but value needs a target: `.ai/PLAN.md:98-101` still has unchecked owner-only items - "Owner names the first product objective" and "Target metrics agreed before the first task" - and its Risks section warns that metrics chosen after seeing results flatter the protocol. No agent may write this line, and starting both repositories at once repeats `DEC-0020`'s duplicate-assignment failure. Everything else in this package can be delegated to a lock-holding session; this cannot. Decide: one product, one objective, the `PLAN.md:63-68` measures or equivalent, and the "one task file + one handoff note" control, before the first product session starts. Corollary: define what happens if the pilot shows no measurable protocol value - this checklist contains no kill criterion for the protocol itself.

## 5. Execution order (recommended)

1. Owner confirms/rejects each item; signatures stay pending until then.
2. One lock-holding session: append `PROTO-DEC-0036` (and `0037`/`0038` if approved), registry rows, reconcile `.ai/TASK.md` (<= 80 lines).
3. Classified review archive with `doctor` + `gate-check` before and after.
4. Freeze protocol feature work (P0 + closure only); re-record the Codex receipt.
5. Owner names the pilot target; product sessions start in that repository.
6. v2.0 design only after the pilot report; implementation deferred.

Reproduction commands used for every figure in this file:

```powershell
git -C D:\Colabs rev-parse HEAD
Get-ChildItem .ai/bin/*.cjs | ForEach-Object { $_.Name + ' ' + (Get-Content $_.FullName | Measure-Object -Line).Lines }
(Get-ChildItem docs/reviews -File -Filter *.md | Measure-Object).Count
(Get-ChildItem docs/reviews -File -Recurse | Measure-Object Length -Sum).Sum
ollama list
git -C D:\Block-Puzzle log -1 --format="%ci %s"; git -C D:\VPN log -1 --format="%ci %s"
```

**Owner Signature:** _________________________  **Date:** _________________________
