# Council Synthesis - Repository Trajectory and Course Correction

**Date**: 2026-09-19
**Reviewed commit**: d38d2f2ae4b4c17fe6c2c18f11215cedb2f10eb1
**Working tree**: dirty
**Synthesizer**: deepseek-flash (session controller/reviewer)
**Scope**: council synthesis, strategic trajectory, decision package
**Verdict**: RECOMMENDATION - RADICAL SIMPLIFICATION with a defined keep-list
**Mode**: ADVISORY (no Evidence receipt; non-binding until the owner rules)
**Purpose**: reduce four independent model positions to one objective synthesis and
one decision package, before the last discussion cycle closes. This file records
analysis. It does not decide: only the owner can approve (AGENTS.md section 2).

## 0. Positions consolidated

| Source | Type | Verdict | Unique contribution |
|---|---|---|---|
| `docs/reviews/2026-09-19-gemini-systemic-repository-audit.md` | CERTIFYING, persisted | RECOMMENDATION / strategic RADICAL | 4-phase recovery roadmap; module architecture; D1-D12 table |
| `docs/reviews/2026-09-19-deepseek-flash-systemic-audit-response.md` | ADVISORY, persisted | RADICAL SIMPLIFICATION | PLAN.md never executed; index (88k) > work (45-73k); receipt-safe cleanup |
| GLM 5.1 position (owner-pasted, no repository file) | advisory, chat | RADICAL SIMPLIFICATION | cap audits per release; suspend mandatory adversarial prompt; drop Merkle |
| GPT/Codex-class position (owner-pasted, no repository file) | advisory, chat | RADICAL SIMPLIFICATION | full agreement with the above; consumer-repo pivot |

No participant defended STAY THE COURSE. The disagreement space is therefore not
*whether* to simplify, but *how far*, *how to clean up without breaking receipts*,
and *what to keep*.

## 1. Verified evidence base

All figures reproduce on `d38d2f2`; commands in section 7.

| Fact | Value |
|---|---|
| Kernel tools | 2,826 lines across 6 `.cjs` files in `.ai/bin/` |
| Test code | 18 files, 4,544 lines (test:kernel ratio 1.6:1) |
| Review corpus | 126 files, 1,299,793 bytes; 84 files named `2026-09-19`; 124 of 126 modified within 48 h |
| Governance text | `DECISIONS.md` 1,625 lines / 36 blocks; `ARCHIVE.md` 2,527 lines; registry appended |
| Decision velocity | 7 blocks on 09-18, 7 on 09-19 (14 blocks in 2 days) vs 22 blocks in the prior 6 days |
| Protocol commits in 48 h | 35 |
| Worklogs | 30 files (at the documented cap) |
| `Block-Puzzle` HEAD | 2026-09-17 04:19 (+03:00), no product commit since |
| `VPN` HEAD | 2026-09-18 03:44 (+03:00); its last commit is a protocol upgrade, not a product feature |
| Local models | `omnicoder-2-9b` 5.7 GB and `qwen3:8b` 5.2 GB present in Ollama (`ollama list`) |
| H1 pilot | Broad total +72.79%, fresh +9.10%; narrow total +60.20%, fresh +42.76%; stop rule executed; no MCP, no Arm C |
| Audit round | F-001 fixed by C1a (`d38d2f2`); F-002/F-003/F-004 fixed; Qoder receipt broken; Codex receipt stale |

**Marked as unverified estimate:** the "95% of tokens spent on self-audit" figure in
the Gemini/GLM positions is an estimate, not a measurement. The defensible proxies are
the ratio, the 35 commits, the 84 files/day and the zero product commits above.

## 2. Unanimous findings (no further debate needed)

1. The last 48 h were consumed by the protocol auditing and governing itself; the
   consumer repositories received no product work.
2. The context shortage was self-inflicted: an unbounded review corpus
   (`PROTO-DEC-0026` gave `docs/reviews/` permanent status with no budget) is the
   dominant cost, not the ~21k-token kernel.
3. The Repomix index path is dead for this repository. Arm A needed 73,269 broad and
   45,470 narrow fresh tokens; the digest itself is ~88k. The index is larger than
   the work it was meant to save.
4. `Pilot v2` (B2/B3/B4/C2) must not run on the current trajectory. The stop rule
   (`PROTO-DEC-0035`) fired, and continuing is sunk-cost escalation. Lowering the
   thresholds to 20%/+3% (CodeGeeX) is goalpost-shifting.
5. Local 8B/9B models must not be used for multi-step Git benchmarks; H1 already
   showed extreme variance (2,306 s vs 230-800 s on one trial).
6. `v2.0` must be a simplification (single Node validator, broken require cycle, split
   `protocol-handoff.cjs`), not another enforcement layer.
7. No further process hardening (power monitors, external supervisors, extra gates).

## 3. Divergences and their objective resolution

### 3.1 Was the stop rule violated?

- GLM: "refusal to accept failure / moving goalposts".
- deepseek-flash: the rule was executed in letter (no MCP, no Arm C); the escalation
  is a *reinterpretation*, better called sunk-cost escalation.
- **Resolution: deepseek-flash.** The decision text and the commit history show
  compliance. The error is the follow-on proposal, not a broken stop rule. Record the
  distinction so the closing decision does not accuse past work falsely.

### 3.2 Cleanup depth (D7): mass-move vs classify-first

- Gemini: move all non-active reviews to `archive/`.
- GLM: leave only the last 5-10 files; archive the rest.
- deepseek-flash: classify first; `PROTO-DEC-0032` binds `gate-check` to review paths
  cited in live receipts, and `PROTO-DEC-0026` section 6 makes reviews immutable
  historical records. A blind move can break an active receipt binding or a citation.
- **Resolution: classify-first, then archive.** Move prompts, runbooks, discussions,
  chat transcriptions and pre-v1.9.5 material freely. Before moving an audit, run
  `node .ai/bin/protocol.cjs doctor` and `node .ai/bin/protocol-handoff.cjs gate-check`
  to confirm nothing active cites it. Keep an index with old -> new paths.
  Never touch `.ai/DECISIONS.md`, `docs/decisions/REGISTRY.md`, `.ai/ARCHIVE.md`.

### 3.3 Mandatory adversarial review scope

- GLM: suspend the mandatory adversarial prompt except for major releases.
- Others: silent.
- Counter-evidence: the adversarial machinery caught real defects - F-001..F-004 in
  the latest round and ten findings in `PROTO-DEC-0021`. Dropping it wholesale
  reintroduces the class of defect the protocol exists to prevent.
- **Resolution: scale by blast radius, keep for protocol core and consumer safety.**
  Mandatory for changes under `.ai/`, `.claude/`, the validator, hooks and gates, and
  for consumer security/data paths. For docs/config/one-line fixes: one reviewer
  statement, no full prompt/report pair. Cap artifact size unless an incident warrants
  more. This is a rule change and needs explicit owner approval.

### 3.4 How deep should de-crypto go?

- GLM: remove Merkle chains for the single-user mode.
- Gemini: drop "cryptographic theatre", keep cooperative locking.
- deepseek-flash: keep cheap integrity-vs-accident; drop adversarial framing.
- **Resolution: freeze the mechanism, remove nothing mid-flight.** Existing entry
  hashes and format versions are cheap and already embedded in recorded receipts.
  Removing them has a migration cost and can invalidate evidence. v2.0 should stop
  *adding* such mechanisms (no new nonces, no new traversal layers) and may retire
  the supervisor-PID/nonce layer only with a migration note. New work is judged by
  the keep-list in section 5.

### 3.5 The "95%" number

Use it only as a rhetorical summary, never as a fact. Cite the section 1 table.

## 4. Scenario analysis (what leads to the most effective outcome)

| Scenario | Content | Expected outcome | Cost / risk | Verdict |
|---|---|---|---|---|
| S1 Stay the course | Continue hardening; run Pilot v2 on local models | Low probability of a positive result: the 88k digest cannot beat 45-73k of targeted work; more process debt | Weeks of agent time and attention; consumer repos stay frozen | Reject |
| S2 Simplification + product pivot | Close Track C; archive corpus with receipt protection; freeze protocol features; run the PLAN.md product pilot; then v2.0 simplification | Highest information per unit of effort; the protocol is finally judged on real work; context cost drops immediately | Over-correction risk if mechanisms are deleted blindly - mitigated by the keep-list | **Recommended** |
| S3 Hybrid | One cheap pre-registered B3 run in parallel with S2 | Marginal information; the arithmetic already answers the question | Reopens the loop; consumes the attention S2 needs | Only if the owner wants documentary closure; not required |

Prediction: S2 dominates. The single highest-value action is not an experiment - it is
the product pilot that `.ai/PLAN.md:51-54` specified and that has never been run.

## 5. Keep-list - what must not be broken

1. `.ai/DECISIONS.md` and `docs/decisions/REGISTRY.md` are append-only; no block is
   edited, not even a status line.
2. `.ai/ARCHIVE.md` is append-only; archive moves text, never deletes it.
3. Existing Evidence receipts: do not invalidate them. Any file move must not break a
   cited receipt path; verify with `protocol.cjs doctor` and `gate-check` afterwards.
4. The four real fixes this protocol earned: journal partitioning, tree-anchored
   evidence, false-green validation removal, and the certifying/advisory split
   (`PROTO-DEC-0031`).
5. Lock discipline and the single-writer rule for shared documents (AGENTS.md section 6).
6. No secrets in journals; `record`/Stop scanning stays.
7. No protocol session commits inside consumer repositories (`PROTO-DEC-0025` item 4).

## 6. Decision package (for the owner)

| # | Item | Recommended default | Requires |
|---|---|---|---|
| S1 | Close Track C / Repomix permanently for this repository; no B2/B3/B4/C2 | Approve; record a `PROTO-DEC` with `Reopen-trigger: owner-directive` and the section-7 falsifier | Owner |
| S2 | Local models | Do not run v2 on them; keep or `ollama rm` them (optional, ~11 GB) | Owner |
| S3 | Review-corpus budget | Two-tier archive, receipt-aware (3.2); index file; active window = current release + live receipts; add a hard cap rule to `AGENTS.md` | Owner |
| S4 | Risk-scaled adversarial review | Mandatory for protocol core and consumer safety; lightweight otherwise; artifact size caps | Owner |
| S5 | Feature freeze | Only P0 bug fixes and audit closure until the product pilot report exists | Owner |
| S6 | Product pilot | Run `.ai/PLAN.md` for real: one product objective, 10-20 tasks, metrics from `PLAN.md:63-68`, compare against "one task file + one handoff note" | Owner |
| S7 | v2.0 scope | Node validator (differential-verified), require-cycle break via a liveness leaf module, `handoff` split; no new gates | Owner |
| S8 | Audit closure | Qoder -> advisory; Codex re-record at freeze; C1a accepted; reconcile stale `.ai/TASK.md`; restore <=30 journals | Owner/coordinator |
| S9 | Keep-list | Section 5 adopted as a constraint of any cleanup or refactor | Owner |
| S10 | Record pass | Single lock holder, order Gemini -> DeepSeek -> Codex (if available); CI green on the frozen tree | Coordinator |

## 7. Falsifiers and reproduction

Falsifier for S1/S2 (what would reverse "close Repomix permanently"): a pre-registered,
controlled run on this repository showing >= 25% median broad total-token reduction and
<= +5% narrow regression against a matched control, on a second model family, with the
scope-selection cost counted in the total - or a genuine change in repository shape
(the kernel or corpus becoming too large to search comfortably). Absent either, more
arms add noise.

Falsifier for the whole trajectory verdict: measured, reproducible evidence that the
protocol prevented >= 3 critical defects in `Block-Puzzle`/`VPN` that would have
reached users (GLM's bar). Then the maintenance cost is justified and only the corpus
budget needs fixing.

Reproduction commands:

```powershell
git -C D:\Colabs rev-parse HEAD
Get-ChildItem .ai/bin/*.cjs | Get-Content | Measure-Object -Line
Get-ChildItem docs/reviews/*.md | Measure-Object Length -Sum
git -C D:\Colabs log --since="48 hours ago" --oneline
git -C D:\Block-Puzzle log -1 --format="%ci %s"; git -C D:\VPN log -1 --format="%ci %s"
ollama list
node .ai/bin/protocol-archive.cjs status
```

## 8. References

- `.ai/PLAN.md:51-54`, `:63-68`, `:98-101` (the unexecuted pilot)
- `PROTO-DEC-0026` (unbounded review corpus), `PROTO-DEC-0031` (certifying split),
  `PROTO-DEC-0032` (receipt path binding), `PROTO-DEC-0035` (stop rule)
- `docs/reviews/2026-09-19-h1-pilot-report.md` and `...-correction.md`
- `docs/reviews/2026-09-19-h1-pilot-postmortem-and-repomix-paths.md`
- `docs/reviews/2026-09-19-gemini-systemic-repository-audit.md`
- `docs/reviews/2026-09-19-deepseek-flash-systemic-audit-response.md`
- `docs/reviews/2026-09-19-open-disagreements-prompt.md`, `...-v2-remediation-plan.md`
- `docs/reviews/2026-09-19-final-course-decision-prompt.md` (the decision request)
