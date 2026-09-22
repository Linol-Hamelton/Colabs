# Final Course Decision - Prompt for the Decision-Maker

**Date**: 2026-09-19
**Prepared by**: deepseek-flash, session controller
**Baseline**: `d38d2f2ae4b4c17fe6c2c18f11215cedb2f10eb1`, working tree dirty
**Purpose**: one self-contained prompt to load into the chat of the person/model who
will make the final ruling on the repository trajectory. Everything needed is below;
no other document must be read first, though paths are given for verification.

---

## PROMPT - copy everything below this line into the decision chat

You are the final decision-maker for the repository `D:\Colabs`, the home of the
AI Collaboration Protocol - a lightweight process that lets several AI assistants
(Claude, Codex, Gemini, DeepSeek, Qwen, GLM, Mistral) work on one Git repository
without colliding, losing context or inventing history. It is installed into the
owner's product repositories, `D:\Block-Puzzle` and `D:\VPN`.

Four independent model audits have reviewed the repository. Their consensus is that
the project has spent the last 48 hours inside a self-referential bureaucracy loop
("the protocol Ouroboros") instead of serving its consumer products. Your job is to
rule on the recovery package below and to produce the exact artifacts to persist it.
The owner will personally approve (or reject) each ruling before anything is written
to `.ai/DECISIONS.md`; only the owner fills the `Approved by:` line.

### 1. Verified situation (reproducible on the baseline commit)

| Fact | Value |
|---|---|
| Kernel tools `.ai/bin/*.cjs` | 2,826 lines, 6 files |
| Test code | 18 files, 4,544 lines (test:kernel = 1.6:1) |
| `docs/reviews/` | 126 files, 1,299,793 bytes; 84 files created 2026-09-19 alone; 124/126 touched within 48 h |
| Governance text | `DECISIONS.md` 1,625 lines / 36 blocks; `ARCHIVE.md` 2,527 lines |
| Decision velocity | 14 blocks on 09-18 + 09-19 vs 22 in the previous 6 days |
| Protocol commits in 48 h | 35; all worklog journals (30) at the cap |
| `Block-Puzzle` HEAD | 2026-09-17 04:19 +03:00 - no product commit since |
| `VPN` HEAD | 2026-09-18 03:44 +03:00 - last commit is a protocol upgrade, not a product feature |
| Local models | `omnicoder-2-9b` (5.7 GB) and `qwen3:8b` (5.2 GB) already pulled into Ollama |
| H1 Repomix pilot | Broad total tokens +72.79% (fresh +9.10%); narrow total +60.20% (fresh +42.76%); stop rule executed; no MCP, no Arm C |

The decisive arithmetic: control sessions used ~73k (broad) and ~45k (narrow) fresh
tokens, while the generated digest itself is ~88k tokens. The index is larger than
the work it was meant to save.

Marked estimate, not fact: the "95% of tokens on self-audit" figure is rhetorical;
use the table above.

### 2. Positions already on record

| Participant | Verdict | File |
|---|---|---|
| Gemini (certifying) | RECOMMENDATION - strategic RADICAL SIMPLIFICATION | `docs/reviews/2026-09-19-gemini-systemic-repository-audit.md` |
| DeepSeek-flash | RADICAL SIMPLIFICATION, keep earned guarantees | `docs/reviews/2026-09-19-deepseek-flash-systemic-audit-response.md` |
| GLM 5.1 (chat) | RADICAL SIMPLIFICATION | owner-pasted, no file |
| GPT/Codex-class (chat) | RADICAL SIMPLIFICATION | owner-pasted, no file |

Unanimous findings: the loop is real; the context shortage was self-inflicted by the
unbounded review corpus (created without a budget by `PROTO-DEC-0026`); Repomix is
dead for this repository; `Pilot v2` must not run; local 8B/9B models must not be
used for multi-step Git benchmarks; v2.0 must simplify, not harden.

Open divergences you must resolve:
1. **Stop rule semantics** - GLM calls the follow-on "moving goalposts"; DeepSeek
   holds that `PROTO-DEC-0035` was executed as written (no MCP adopted) and the
   follow-on is sunk-cost escalation. Rule accordingly; do not accuse past work
   falsely, but close the track.
2. **Cleanup depth (D7)** - Gemini: move all non-active reviews to `archive/`.
   GLM: keep only the last 5-10 files. DeepSeek: classify first, because
   `PROTO-DEC-0032` binds `gate-check` to review paths cited in live receipts, and a
   blind move can break an active receipt binding.
3. **Adversarial review scope** - GLM proposes suspending the mandatory adversarial
   prompt except for major releases. Counter-evidence: it caught F-001..F-004 in the
   last round and ten findings in `PROTO-DEC-0021`. Decide between "suspend" and
   "scale by blast radius".
4. **De-crypto depth** - GLM: remove Merkle chains. DeepSeek: freeze the mechanism,
   remove nothing mid-flight, because entry hashes are already embedded in recorded
   receipts. Decide whether v2.0 only stops adding such mechanisms or also retires
   the supervisor-PID/nonce layer.
5. **The "95%" number** - treat it as unverified.

### 3. Constraints you must respect

- `.ai/DECISIONS.md` and `docs/decisions/REGISTRY.md` are append-only. Never edit an
  existing block, not even a status line. New rulings are appended as new blocks with
  a `Reopen-trigger:` field; superseding names the old id in `Supersedes:`.
- No agent may write `Approved by:` without a direct owner confirmation. Approval
  text may be transcribed by the session holding the lock with a provenance note
  (`PROTO-DEC-0030`).
- `.ai/ARCHIVE.md` is append-only; archiving moves text, never deletes it.
- Do not break Evidence receipts. Any file move under `docs/reviews/` must be
  followed by `node .ai/bin/protocol.cjs doctor` and
  `node .ai/bin/protocol-handoff.cjs gate-check`; if a cited review must move, record
  the old -> new path mapping in an index.
- v2.0 changes to `validate-protocol.ps1` require differential verification against
  the PowerShell reference (`PROTO-DEC-0025` item 5).
- No commits by a protocol session inside `Block-Puzzle`/`VPN` (`PROTO-DEC-0025`
  item 4); those projects commit in their own sessions.
- If you disagree with the consensus, a FAIL/BLOCKED-class objection needs a
  reproduction per `PROTO-DEC-0031` item 3.

### 4. Items to rule on

Give a binding ruling for each. Defaults are recommendations, not decisions.

**Strategic**
- **S1. Close Track C / Repomix permanently for this repository.** No B2/B3/B4/C2.
  Record a `PROTO-DEC` with `Reopen-trigger: owner-directive` and the falsifier in
  section 6. Default: approve.
- **S2. Local models.** Do not run v2 on them. Optionally `ollama rm` them (~11 GB).
  Default: keep the files, never use them in a pilot.
- **S3. Review-corpus budget.** Two-tier, receipt-aware archive (S3 detail in the
  synthesis file section 3.2); index file; active window = current release + live
  receipts; add a hard cap rule to `AGENTS.md` section 8. Default: approve.
- **S4. Risk-scaled adversarial review.** Mandatory for protocol core (`.ai/`,
  `.claude/`, hooks, validator, gates) and consumer security/data paths; one
  reviewer statement for docs/config/one-line fixes; cap prompt/report artifact size.
  Default: approve this instead of GLM's full suspension.
- **S5. Feature freeze.** Only P0 bug fixes and audit closure until the product
  pilot report exists. Default: approve.
- **S6. Run the `.ai/PLAN.md` product pilot for real.** One product objective,
  10-20 tasks, the metrics already written in `PLAN.md:63-68`, compared against
  "one task file + one handoff note". Default: approve; this is the highest-value
  action available.
- **S7. v2.0 scope.** Single Node validator (differential-verified); break the
  require cycle by extracting process liveness into a leaf module
  (`primitives -> lock -> session -> hooks/archive -> handoff -> cli`); split
  `protocol-handoff.cjs` (1,047 lines) into `snapshot` / `evidence` / `gate`.
  No new gates. Default: approve.
- **S8. Audit closure.** Qoder -> advisory (broken `Receipt-Owner`); Codex receipt
  re-recorded at the freeze; C1a (`d38d2f2`) accepted; reconcile the stale
  `.ai/TASK.md`; journals <= 30. Default: approve.
- **S9. Keep-list.** Adopt section 5 of the synthesis file as a hard constraint on
  any cleanup or refactor. Default: approve.
- **S10. Record pass.** One lock holder; order Gemini -> DeepSeek -> Codex (if
  available); CI green on the frozen tree. Default: approve.

**D1-D12 (from `docs/reviews/2026-09-19-open-disagreements-prompt.md`)**
- **D1 Repomix:** close permanently (default) vs continue B2/B3/B4.
- **D2 Primary metric:** no v2 -> no metric. If ever run: fresh tokens (`in + out`)
  primary, total secondary. Default: no metric.
- **D3 Thresholds:** keep 25% / +5%. Reject 20% / +3% as goalpost-shifting.
- **D4 Secondary metrics:** reject "tokens per accepted finding" (gameable,
  subjective acceptance). Automated checks only.
- **D5 Local models:** abort; do not run trials on 8B/9B.
- **D6 Remote route:** `agy`/Gemini and paid analysis models only; define whether
  borrowed HF credits count as "free" (default: no).
- **D7 Cleanup depth:** classify-first archive (receipt-aware). Default: per
  divergence 2 above.
- **D8 v2.0:** radical simplification. Default: approve.
- **D9 Process hardening:** reject new monitoring/layers. C1a is a bug fix, not a
  precedent.
- **D10 Paid/free boundary:** "test" = any measurement-motivated run; tests on
  free/local only; paid for analysis/coding; Gemini exception stands.
- **D11 Audit closure:** as S8.
- **D12 Tooling roles:** record Agent Manager and CLI/`agy` as execution vectors,
  choose per task.

**Owner-only (state your recommendation; the owner rules)**
- **H1. Approve the corpus budget and retention rule (S3)?**
- **H2. Approve risk-scaled review (S4)?**
- **H3. Which product and objective starts the pilot (S6)?**
- **H4. Authorize the record pass and the transcribing session (S10)?**

### 5. Required output (exact format)

1. **Verdict:** `RADICAL SIMPLIFICATION`, `STAY THE COURSE` or `PARTIAL PIVOT`, plus
   one sentence on what must happen in the next 24 hours.
2. **Executive diagnosis:** 1-2 paragraphs, no longer.
3. **Ruling table:** for every S-item and D-item: `id | ruling | justification
   (path/evidence) | cost accepted`.
4. **Ready-to-append decision block(s):** complete markdown following the template in
   `.ai/DECISIONS.md` (Status, Date, Reopen-trigger, Context, Decision, Reasoning,
   Alternatives rejected, Consequences) with `Approved by:` left as
   `_pending owner confirmation_`. One block per independent decision; prefer few
   blocks.
5. **`.ai/TASK.md` replacement text:** <= 80 lines, current task only.
6. **`.ai/PLAN.md` edit instructions:** <= 200 lines total after the edit.
7. **Cleanup scope:** explicit list of what moves to `docs/reviews/archive/`, what
   stays, and the receipt-safety commands to run before and after.
8. **Falsifiers:** for each major ruling, the evidence that would reverse it.
9. **Execution order:** numbered steps with the lock holder and estimated effort.

Answer in any language; keep the artifact text (decision blocks, TASK/PLAN text) in
English to match the repository.

### 6. Falsifier for the whole package

Reverse the closure of Repomix only on a pre-registered, controlled run on this
repository showing >= 25% median broad total-token reduction and <= +5% narrow
regression against a matched control, on a second model family, with scope-selection
cost included in the total - or a genuine change in repository shape making search
impractical. Reverse the trajectory verdict if the protocol is shown to have
prevented >= 3 critical defects in `Block-Puzzle`/`VPN` that would otherwise have
reached users.

## END OF PROMPT

---

## Notes for the owner (do not paste)

- Load only the section between "PROMPT - copy everything below this line" and
  "END OF PROMPT" into the decision chat.
- After the ruling returns: one lock-holding session transcribes the approved blocks
  into `.ai/DECISIONS.md`, appends registry rows, updates `.ai/TASK.md`, and records
  an Evidence receipt. Nothing is written before your explicit confirmation.
- Current state note: `.ai/TASK.md` is stale relative to `d38d2f2` (C1a is committed;
  the task text still lists it as queued) and must be reconciled in the same pass.
- The synthesis behind this prompt: `docs/reviews/2026-09-19-council-synthesis-course-correction.md`.
