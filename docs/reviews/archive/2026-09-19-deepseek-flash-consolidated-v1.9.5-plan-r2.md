# Consolidated v1.9.5 Plan (Revision 2) - After the Final Council Round

**Date**: 2026-09-19  
**Author**: DeepSeek (deepseek-flash), consolidating the owner's directives, six model submissions and three probe rounds  
**Status**: APPROVED by the owner (RuslanFomenko) on 2026-09-19: all section-9 recommendations were accepted as recommended; D5/D8 execution was additionally confirmed in chat (freeze, commit, push). This revision supersedes `docs/reviews/2026-09-19-deepseek-flash-final-followup-plan-v1.9.5.md` as the working draft; implementation proceeds under the gate protocol in section 10.  
**Conflict declaration**: the author also authored the superseded draft; all measurements were re-probed in throwaway clones, and the verdict-bearing reviews remain those of other models.  
**Release baseline**: `c71bdcf` (annotated tag `v1.9.4`); HEAD `a6dbf8c` plus uncommitted certification artifacts.  
**Inputs**: Gemini 3.8 Flash review, Gemini-Opus (Claude Opus 4.6 in the gemini role) review, Qoder review, Mistral Vibe review, DeepSeek probe review, GLM 5.1 chat analysis (transcribed advisory), Qwen Code chat summary, owner chat directives, two probe rounds in `C:\Users\Dmitry\AppData\Local\Temp\kilo\v195probe*` (throwaway clones).

---

## 0. Council compliance audit (2026-09-19 ~03:00 local)

| Participant | Report artifact | Journal entry | Evidence receipt | Verdict | Compliance |
|---|---|---|---|---|---|
| Gemini 3.8 Flash | `2026-09-19-gemini-final-plan-adversarial-review.md` | **absent for this report** | **absent for this report** | RECOMMENDATION | PARTIAL - artifact persisted, no entry/receipt of its own; the shared owner journal (`gemini-28974c8a8a07888d`) records only the Opus pass |
| Gemini-Opus (Claude Opus 4.6) | `2026-09-19-gemini-opus-final-plan-adversarial-review.md` | `gemini-28974c8a8a07888d` | recorded, now stale | RECOMMENDATION | COMPLIANT at record time |
| Qoder | `2026-09-19-qoder-adversarial-review-v1.9.5.md` | `qoder-86c43a9a02fd9789` | recorded, now stale | "CONDITIONAL PASS" (not a protocol verdict label) | PARTIAL - persisted, but its Fact 5 ("29 journals, 0 warnings") is false at its own timestamp (31/32) and appears copied from the plan; not named in TASK.md Roles |
| Mistral Vibe | `2026-09-19-mistral-vibe-final-v1.9.5-followup-plan-review.md` | `mistral-vibe-7d4ebdb4413f0de0` | recorded, **fresh** at audit time | PASS | COMPLIANT |
| DeepSeek (probe review) | `2026-09-19-deepseek-flash-final-plan-probe-review.md` | `deepseek-flash-8a681a17d5224abf` | recorded, now stale | PROBES ONLY (non-certifying, conflict) | COMPLIANT |
| GLM 5.1 | none (chat only) | none | none | none stated | NON-COMPLIANT until transcribed; now transcribed advisory at `2026-09-19-glm-final-plan-adversarial-review.md` |
| Copilot, CodeGeeX, Qwen (TASK roles) | no response in this round | - | - | - | SILENT - no violation, no input |
| DeepSeek plan author | plan + prompt | `deepseek-flash-ebd6eb9397ed3784` | recorded, now stale | - | COMPLIANT |
| Claude (`claude-123ff4a27989f7af`) | v1.9.4 certification only | recorded, now stale | - | PASS (v1.9.4) | not a final-plan participant |

Interpretation for the owner:

- **Receipts cannot be fresh until the tree is frozen.** All receipts except Mistral's were stale at audit time because later reviews/journals moved the digest; this is the expected consequence of recording before the freeze, not misconduct.
- **Forwarding is unnecessary for FS-capable participants.** Every report and journal above is in the repository; Gemini, Qoder, Mistral, DeepSeek, Claude and Gemini-Opus have demonstrated FS access, so they can read each other's artifacts without owner copy-paste. Only GLM 5.1's chat answer needed persistence, and that is now done (advisory, non-certifying). If GLM is text-only, continuing its participation requires the owner to forward repository content by chat.
- **Items to repair before any gate use**: (1) the Gemini-Flash report needs its own journal entry + receipt or must be downgraded to advisory; (2) Qoder's fact error must be corrected in its own artifact or the report must not be cited as evidence; (3) "CONDITIONAL PASS" is not a verdict the gate accepts; (4) TASK.md Roles does not name Qoder.

---

## 1. Verified facts (re-probed)

| # | Fact | Evidence |
|---|---|---|
| 1 | `protocol-hooks.cjs:102-158` digest excludes `.ai/runtime/`, `.ai/worklog/`, `.ai/ARCHIVE.md` (`:125`); includes `docs/reviews/**` (untracked non-ignored) and `.ai/TASK.md` | Clone: review write changed `638f4fe6` -> `5f6393f9` and staled a receipt (verify exit 1); sibling journal, `rehash`, ARCHIVE append, staging and `git commit` left the digest unchanged |
| 2 | C0 reproduces: `isProcessAlive` (`protocol-session.cjs:28-33`) reads only `state.pid`; `prune` (`:182`) and `cleanup-runtime` (`:247/:261`) ignore `supervisorPid` | `prune` quarantined a journal while supervisor PID 16236 was alive and transient PID 25048 was dead; `cleanup-runtime --force` removed the snapshot of a session with supervisor PID 4712 alive |
| 3 | `--supervisor-pid` accepts only `process.pid`/`process.ppid` (`:75-76`) | A `cmd`-spawned `start` with an external caller PID failed: "must be current process PID or parent PID" |
| 4 | The completion gate checks existence and verdict only (`validate-protocol.ps1:404-479`); the cited Copilot receipt does not verify | `verify --owner copilot-...` exit 1 stale; validator exit 0 while the gate PASSes |
| 5 | Journal count was understated; the count is now **32** (was 30 before this round) and the validator reports `[WARN] 31 session journals` | `git ls-files` count rule and validator output |
| 6 | Auto-archive is **not** receipt-breaking | Two certified entries, entry A archived with `--keep 1`: digest `736b246c...` unchanged before/after; `verify --deep` exit 0; `archived-parent` matched A's hash `5c1bf8de...` |
| 7 | Registration is not an authenticated boundary; policy choice is ergonomic, not security | A hand-written `.ai/runtime/<owner>.json` with a borrowed live PID (explorer 9972) and its own nonce acquired and pinned the lock ("liveness": "registered"); a wrong token was rejected; `clear-lock` required `--force --reason` (audited) |
| 8 | No production session has yet registered a supervisor | 23 state files, 0 with `supervisorPid` |
| 9 | `.kilo/worktrees/` cannot mutate the main worktree's protocol files | Excluded via `.git/info/exclude:9`; linked worktrees have separate working files, HEAD and index |
| 10 | All current reviews lack a receipt-owner field | `^Session:` count over `docs/reviews/*.md` = 0 (61 files) |
| 11 | `record` auto-archives **before** attaching its own Evidence block, so a near-limit journal is pushed over 150 lines and FAILs validation; the tree is currently **red** | `validate-protocol.ps1` output: `[FAIL] .ai/worklog/mistral-vibe-7d4ebdb4413f0de0.md: 159 lines exceeds limit of 150` and `[WARN] 32 session journals`; the final `record` appended a 14-line Evidence block after `autoArchiveWorklog` had already run |

---

## 2. Reviewer claim dispositions

| Claim | Source | Disposition |
|---|---|---|
| Auto-archive invalidates receipts / changes archived parent hash | GLM V1 | REJECTED by probe (fact 6); add an archive+deep-verify regression test |
| Worktree probes can mutate the main worktree | GLM V7 | REJECTED (fact 9); optional note only |
| 35%/50%/65% forecast unmarked | GLM V7 | REJECTED - plan C1 marks it unverified and DECISIONS.md has no mention |
| PID recycling and touched empty artifacts keep dead sessions looking alive | GLM V2 | CONFIRMED as residue/hygiene, no content loss; document; optional TTL deferred to v2.0 |
| `RECENT_WINDOW` must cover snapshots only | GLM V2 | PARTIALLY REJECTED - empty journals are not history (they hold no entry); the window is needed there to avoid quarantining live hookless sessions. Content-bearing journals are protected by `holdsContent` regardless |
| own/ppid only + token handshake | GLM V3, Qoder | REJECTED as a security boundary (fact 7); the handshake file would be equally forgeable. Adopt (a) with documented anti-accident caveat |
| Foreign-host journals silently quarantined by `prune` | Gemini F-001, DeepSeek F-001 | CONFIRMED; fixed by the three-way liveness rule |
| Supervisor registration needs an idle timeout | Gemini F-002 | CONFIRMED as accumulation hygiene; addressed by recency + cap archival; TTL deferred (owner choice D2) |
| A3 sequenced too early | Gemini F-004, DeepSeek F-003 | CONFIRMED; reordered in section 7 |
| `gate-check` subcommand, not validator-embedded verify | Gemini F-003, Claude/Opus, Mistral, GLM, Qoder, DeepSeek | CONFIRMED; specified in A3 |
| Journal count wrong (31/32, not 29); A2 before freeze | Claude/Opus, DeepSeek | CONFIRMED (fact 5) |
| A1 matrix gameable without aged artifacts | Claude/Opus, DeepSeek | CONFIRMED; test matrix in A1.6 |
| Whole-tree freeze definition | Claude/Opus, DeepSeek | CONFIRMED (fact 1); specified in Track 0 |
| 0/58 reviews have `Session:` | Claude/Opus | CONFIRMED (fact 10, now 0/61); template change required |
| Qoder "29 journals, 0 warnings" | Qoder Fact 5 | REJECTED - false at its timestamp; its review is advisory until corrected |
| Token handshake for external orchestrators | Qoder | REJECTED (fact 7) |
| Capability/evidence discipline, advisory rule, FAIL-needs-repro | Qoder, GLM, DeepSeek | ACCEPTED; A4 |
| H1 metrics need baselines/instrumentation | GLM V7, DeepSeek | CONFIRMED; C1 prerequisite added |
| MCP out-of-repo state risk | GLM V7, DeepSeek | ACCEPTED; C2 risk-register additions |
| Keep the 30 cap with release-gate archival | Mistral Q5, DeepSeek | ACCEPTED; A2 |
| Registry needs its own DEC block and append-only enforcement | Mistral, DeepSeek, GLM | ACCEPTED; B1-B4 |
| Approve v1.9.5 as the vehicle, not v2.0 | Mistral Q14, consensus | ACCEPTED |

---

## 3. Track 0 - housekeeping and the freeze protocol (before any implementation)

**0.1 Archive journals to the cap.**
Current count 32 (>30) and the tree is red: `.ai/worklog/mistral-vibe-7d4ebdb4413f0de0.md` is 159/150 lines (`[FAIL]`), which blocks every `record` pass until trimmed. Two distinct procedures:

- **Trim an over-limit journal** (already executed for mistral-vibe under owner authorization): `node .ai/bin/protocol-archive.cjs worklog .ai/worklog/<journal>.md --keep 1 --root .` keeps the newest entry, moves older ones to `.ai/ARCHIVE.md`, clears the FAIL; the journal stays in the count.
- **Remove a journal to reduce the count**: `node .ai/bin/protocol-archive.cjs worklog .ai/worklog/<journal>.md --keep 0 --root .` moves **all** entries to `.ai/ARCHIVE.md` and leaves a header-only file; then `node .ai/bin/protocol-session.cjs prune --root .` quarantines it to `.ai/runtime/pruned/` (recoverable 30 days). Verified in a clone: `--keep 0` -> header-only -> prune quarantined, count -1.

Repeat the second procedure for the oldest unprotected journals until `@(git ls-files --cached --others --exclude-standard | ? { $_ -match '^\.ai/worklog/[^/]+\.md$' -and $_ -ne '.ai/worklog/README.md' })` counts <= 30, then require `validate-protocol.ps1` exit 0 with **0 warnings**. Journal text is never deleted, only moved.

**Staging step (mandatory)**: the validator counts index entries, so run `git add -A -- .ai/worklog/<removed>.md` after each removal; quarantining alone leaves the path in `git ls-files --cached` and the warning persists.

**Executed 2026-09-19** (owner-authorized): mistral-vibe trimmed with `--keep 1` (FAIL cleared); the four oldest unprotected journals (`deepseek-e3aa704632940af2`, `mistral-4e357cac97c0f738`, `gemini-cf450c6f1e867ef9`, `copilot-5193e510e50f2012`) removed with `--keep 0` + `prune` + staged deletions. Result: **28 journals, validator exit 0, 0 warnings**.

**Protected journals** (do not remove until the freeze/re-record pass is complete): `copilot-13595b63-cf45-4860-a3e7-05c7972c5702`, `claude-123ff4a27989f7af`, `mistral-vibe-7d4ebdb4413f0de0`, `gemini-2da9379ddcd247b6`, `deepseek-flash-ebd6eb9397ed3784` (v1.9.4 gate receipts), plus `gemini-28974c8a8a07888d`, `qoder-86c43a9a02fd9789`, `deepseek-flash-8a681a17d5224abf` (active final-round receipts).

**0.2 Repair the compliance gaps** (section 0): Gemini-Flash entry+receipt or advisory downgrade; Qoder correction or advisory downgrade; TASK.md Roles to include or exclude Qoder explicitly.

**0.3 Whole-tree freeze.**
After all review artifacts and `TASK.md` are final:
1. no writes anywhere except `.ai/worklog/`, `.ai/runtime/`, `.ai/ARCHIVE.md`;
2. capture `node .ai/bin/protocol-handoff.cjs state` before and after the record pass; the digest must be identical;
3. only then run `record` for each cited owner, then `verify --owner <id> --deep` for each; require exit 0 for every cited owner;
4. commit the certification package. Committing does not change file identities, so receipts stay valid.

**0.4 v1.9.4 completion gate repair.**
`TASK.md` is `Completed` and cites the Copilot review whose receipt is stale. Under the current validator this passes; under the new A3 rule it must not. Execute 0.3 for the existing package (owners: copilot, claude, mistral-vibe, gemini, deepseek-flash, plus the new jodors/glm advisory files are not gate-cited) so the published record is honest. Owner decision D5: commit now as a docs-only commit, or fold into the v1.9.5 cycle.

**0.5 Open the v1.9.5 task.**
Owner updates `.ai/TASK.md`: Status `In progress`, objective (v1.9.5 remediation), roles `gemini: implementer`, `deepseek: reviewer, auditor, controller` (owner directive 2026-09-19), plus any retained reviewers. TASK.md is owner-written; the owner or an instructed session performs this under the shared-doc lock.

---

## 4. Track A - v1.9.5 remediation

### A1 - C0 session liveness (release blocker)

**Defect**: `prune` quarantines a live session's empty journal and `cleanup-runtime --force` removes its snapshot when a registered `supervisorPid` is alive; the helper never reads it. Violates PROTO-DEC-0025 item 3.

**A1.1 - `isSessionAlive(state)` contract** (replaces `isProcessAlive` at the four call sites):

| State | Result |
|---|---|
| hostname mismatch (foreign host) | `null` |
| `supervisorPid` integer > 0 and alive | `true` |
| `supervisorPid` integer > 0 and dead | fall through to `pid` |
| `pid` integer > 0 and alive | `true` |
| `pid` integer > 0 and dead | `false` |
| no usable pid fields (legacy null state) | `null` |

PID liveness: `process.kill(pid, 0)`; `EPERM` counts as alive; other errors dead.

**A1.2 - call-site polarity (each call site gets its own rule, not a rename):**

| Call site | `true` | `false` | `null` |
|---|---|---|---|
| `prune` empty-journal check (`:182`) | skip (even with `--force`) | quarantine | **preserve** (matrix iv); `--force` may quarantine with an audit message |
| `cleanup-runtime` live check (`:247`) | skip | continue to TTL/force rules | **preserve** (even with `--force`) |
| `cleanup-runtime` dead-session check (`:261`) | skip | existing `--force`/24h rule | preserve |
| `cleanup-runtime` stale check (`:272`) | skip | existing 7d rule | preserve |

This resolves the contradiction in the superseded draft (A1.4 "force overrides false/null" vs matrix iv). Unknown liveness is never destroyed by `--force`.

**A1.3 - recency fallback.**
When liveness is `false` or `null` and the artifact is an **empty journal** (prune) or a **snapshot** (cleanup), treat it as active while `mtime >= now - RECENT_WINDOW`. Content-bearing journals remain protected by `holdsContent`. `--force` overrides recency but never a live session (`true`). Window value and scope: owner decision D2 (recommended 15 minutes, both artifact classes, recorded as a heuristic).

**A1.4 - supervisor registration.**
Accept any live PID > 4 for `--supervisor-pid` (recommended; owner decision D1). Rationale: registration is not an authenticated boundary (fact 7); own/ppid-only permanently blocks shell-spawned orchestrators (fact 3); a token handshake adds no security because the session writes the handshake itself. Document the anti-accident model in PROTOCOL.md. Optionally record `supervisorPidAt` for a future TTL.

**A1.5 - shared liveness helper.**
Extract one `processAlive(record)`/`isSessionAlive(record)` implementation (protocol-session.cjs) and reuse it from protocol-lock.cjs to end the duplicated `process.kill` logic; tests must pin both modules to the same semantics.

**A1.6 - mandatory test matrix** (`tests/session.test.cjs`, plus a cleanup test file if none exists). Every branch ages artifacts with `fs.utimesSync` beyond the window unless stated:

| # | Scenario | Expected |
|---|---|---|
| 1 | supervisor alive, transient pid dead, aged | journal + snapshot preserved (forces supervisor consultation; a recency-only implementation fails) |
| 2 | supervisor dead, transient pid dead, aged | journal quarantined, snapshot removable |
| 3 | supervisor dead, transient pid alive | preserved |
| 4 | no supervisor, pid dead, aged | prunable/removable |
| 5 | no supervisor, pid dead, fresh | preserved by recency |
| 6 | foreign host, supervisor "alive" PID, aged | preserved without `--force`; preserved by cleanup even with `--force` |
| 7 | journal with content, dead everything | never quarantined |
| 8 | `--force` + live supervisor | preserved (both commands) |
| 9 | `--force` + foreign host | prune may quarantine (audited); cleanup preserves |
| 10 | missing state file, empty journal fresh / aged | preserved / quarantined |
| 11 | archive a certified entry then `verify --deep` | exit 0 (fact 6 regression) |

**A1.7 - decisions and docs**: `PROTO-DEC-0029` (liveness model, three-way rule, registration policy, window) approved by the owner; `PROTOCOL.md:68-73` and `:194-196` updated in the same change (the current text promises "an active live session ... is never pruned", which C0 breaks).

### A2 - Journal cap invariant

- Keep the 30-file cap (validator's own rule, `validate-protocol.ps1:215-217`). No exemptions for certification journals.
- The release-gate step is section 0.1, executed **before** any freeze/record pass.
- **New defect (fact 11)**: `protocol-handoff.cjs record` calls `autoArchiveWorklog` before attaching the Evidence block; the append can push a journal over 150 lines and fail validation (observed: mistral-vibe 159/150). Fix: re-run `autoArchiveWorklog` after the attach write (or compute the projected size before writing), and if the single newest entry plus its Evidence cannot fit, FAIL with an actionable message instead of leaving a red tree. Add a regression: a journal at the limit minus 10 lines must stay <= 150 after `record`. The immediate tree is red until the mistral-vibe journal is archived (`protocol-archive.cjs worklog .ai/worklog/mistral-vibe-7d4ebdb4413f0de0.md --keep 1`); only its owner session or the owner should execute that write.
- CI escalation: `.github/workflows/protocol.yml` treats a validator `[WARN]` as failure (grep the output or add a `-Gate` switch to the validator). Owner decision D6 (CI scope).

### A3 - Gate freshness (C3/C8)

**Artifact changes:**
- `templates/reviews/REVIEW.md` gains `**Receipt-Owner**: <owner id>` (fallback accepted: `Session:`), `**Mode**: CERTIFYING | ADVISORY`, and `**Receipt**: <path or digest>` (optional).
- Legacy reviews (dated on or before 2026-09-19) without the field: WARN, not FAIL. Reviews dated after: FAIL when cited as the independent review.

**New subcommand**: `node .ai/bin/protocol-handoff.cjs gate-check [--root <path>]`.
Algorithm:
1. Parse `.ai/TASK.md` `## Completion gate`; require both fields, files under `docs/reviews/`, non-empty (same checks as today's validator).
2. For the independent review: read `Reviewer:`, `Verdict:` (PASS or RECOMMENDATION only), `Receipt-Owner:`/`Session:`, `Mode:`.
3. Resolve `.ai/worklog/<owner>.md`. Find every dated section whose Evidence verifies against the current tree with the in-process checks of `verify --deep` (digest, format, entry hash, parent chain, exit codes) **and** whose entry body mentions the cited review path. If none: FAIL with a reason naming the owner and the binding failure.
4. Advisory/transcribed citations (`Mode: ADVISORY`, `Transcribed by:`) may cite a transcriber receipt, but can never satisfy the independent-review slot.
5. Exit 0 pass, 1 fail. No subprocess recursion (import functions; `verify` never invokes the validator).

**Validator integration**: in `role: source` only, run `gate-check` and fold a non-zero exit into FAIL; in `role: installed`, skip (owner decision D4 on strictness). Tests: `tests/gate.test.cjs` with valid, stale, missing-field, legacy, advisory-transcriber, multi-review-per-owner and wrong-owner cases. Decision block `PROTO-DEC-0032`.

### A4 - Capability and evidence discipline (was A5)

- `Mode: CERTIFYING` requires `FS_WRITE`, `SHELL_EXEC`, `EVIDENCE_SIGN`, `REPO_READ`; anything less is `ADVISORY`. Capability is set by the orchestrator profile, never self-declared.
- Advisory outputs carry `[MODE: READ-ONLY ADVISORY]`; persistence uses the AGENTS.md section 5.5 transcription fallback; the transcriber records its own receipt and the report states `non-certifying`.
- A `FAIL`/`BLOCKED` verdict requires at least one reproduction per claim; otherwise it is advisory and cannot reopen a decision.
- `gate-check` accepts only a CERTIFYING independent review with a verifying receipt and the review-path binding. Decision block `PROTO-DEC-0031`.

### A5 - Documentation accuracy

`.ai/docs/PROTOCOL.md`: liveness model (supervisor-first, three-way rule, recency window, `holdsContent`); legacy Evidence receipts are editable/not tamper-evident, format 2 is the only authenticated format; correct the stale nonce note if it reappears (Mistral observed a 16-byte mention vs the 32-byte nonce); one paragraph recording the P5-F2 boundary-canonicalization deviation so it is not rediscovered. Remove "clean tree" wording where untracked artifacts exist.

### A6 - Deprioritized (carried, not blocking)

`fastValidator` exclusion-set regression; `nonceHash` storage for lock tokens (v2.0); registered-liveness TTL (v2.0); `doctor` in CI folds into A2.

---

## 5. Track B - decision freeze and registry

- **B1 Statuses**: `accepted`, `frozen`, `reopened`; DECISIONS.md stays append-only and untouched for existing blocks.
- **B2 Triggers** (tighter criteria): `invariant-broken` (failing test/probe output attached), `metric-drop` (metric name, baseline value + date + measurement command, threshold, new value + evidence - all required), `new-external-data` (reproduction command in-repo or an artifact committed under `docs/reviews/` with a content hash and retrieval date), `security-finding` (PoC), `owner-directive` (date, quote, channel, recorded by an FS-capable agent), `higher-source-contradiction` (the contradicting path). No trigger, no reopening; doubt stays a journal/TASK note.
- **B3 Registry**: `docs/decisions/REGISTRY.md`, append-only rows `| id | status | reopen-trigger | frozen-at | supersedes | evidence |`; current status = last row per id. One hand-edited source of truth; if a JSON twin is wanted, generate it from the Markdown in CI (owner decision D3). `frozen-at` carries the commit SHA; `evidence` carries a path#anchor or hash.
- **B4 Enforcement**: orchestrator pre-check plus a validator rule (source role) that (a) every `### (PROTO-)?DEC-\d{4}` id in `.ai/DECISIONS.md` has at least one registry row (coverage), (b) no committed registry row was edited or deleted (same `git show HEAD:` discipline as DECISIONS.md), (c) new decision blocks carry `Reopen-trigger:` - advisory WARN first, FAIL after the owner approves `PROTO-DEC-0033`. The validator never edits DECISIONS.md.
- **B5 Approval provenance (implemented 2026-09-19)**: `PROTO-DEC-0030` and AGENTS.md section 2 state that an owner approval given in a direct conversation may be transcribed into the block by the session that holds the lock, with a provenance note (`Approved by: <name> (direct owner confirmation, YYYY-MM-DD, transcribed by <agent>)`); an agent must never write the line without a direct owner confirmation. `PROTO-DEC-0029` is the first block recorded under this rule.

---

## 6. Track C - measurement and tooling (hypotheses)

- **C1 H1 instrumentation prerequisite**: `protocol-session.cjs:122-125` prints telemetry only when `result.durationSec`/`result.changedFiles` exist, and `hooks.run` never sets them (dead branch). First wire those, plus `startTime` (already in state) and first-changed-file mtime, so that H1 metrics exist: time-to-first-edit, session wall time, repeated repository reads (orchestrator-level), handoff completeness (in-repo), cross-model variance, context assembly time; token metrics only if the orchestrator exports per-session usage. Thresholds pre-registered before the A/B, e.g. >=25% median token reduction with n>=10 per arm and no handoff-completeness regression; pilot on `D:\Block-Puzzle` with a crossed task list. The 35%/50%/65% forecast stays an unverified hypothesis and must not enter decision text as fact.
- **C2 MCP policy**: minimal universal base (filesystem, git read); per-project profiles as recommendations gated by policy/compatibility; no auto-install; capability declarations feed A4; the gate must never depend on external state; derived indexes are disposable under `.ai/runtime/` or regenerated. Risk register adds: MCP-unavailable must degrade to identical gate semantics; server/tool version pinning; MCP output can carry secrets into journals (scanner patterns are partial); agent capability asymmetry must not change gate weight.
- Track C starts only after Track A/B merge (owner decision D7).

---

## 7. Sequencing (dependency order)

1. **Track 0**: archive to <=30; compliance repairs; v1.9.4 freeze + re-record + verify + commit decision (0.4); open the v1.9.5 task.
2. **A1** C0 fix + A1.6 tests + `PROTO-DEC-0029` + PROTOCOL.md liveness text (one change set, one commit).
3. **A2** archival automation + CI escalation.
4. **A4** capability/evidence discipline + template fields (`PROTO-DEC-0031`).
5. **A3** `gate-check` + validator integration + tests (`PROTO-DEC-0032`).
6. **A5** documentation closure for anything left.
7. **B1-B4** registry (`PROTO-DEC-0033` if enforcement is adopted); B5 approval provenance already implemented (`PROTO-DEC-0030`).
8. **Final certification**: whole-scope mandatory adversarial prompt (all A/B changes), independent review, completion gate in TASK.md, freeze, ordered `record` + `verify --deep`, atomic release commit, annotated tag `v1.9.5` (owner decision), push (owner decision).
9. **C1 pilot**, then C2 policy if positive; optional consumer re-sync for Block-Puzzle and VPN per DEC-0025 item 4 (owner decision).

Rationale for the reorder (adopted from Gemini, Claude/Opus, Mistral): the certification commit is the *last* step, not step 3; A2 must precede every record pass; A4 precedes A3 because the gate needs the Mode/Receipt-Owner vocabulary.

---

## 8. Acceptance criteria (measurable)

- **A1**: all 11 branches of A1.6 pass; `PROTO-DEC-0029` recorded; PROTOCOL.md updated; no recency-only or supervisor-blind implementation passes branch 1.
- **A2**: validator 0 warnings and journals <= 30 at every freeze; CI fails on a journal warning.
- **A3**: a stale citation fails `gate-check`; a valid CERTIFYING review with a fresh receipt passes; legacy review WARNs; advisory transcriptions never satisfy the independent slot; tests in `tests/gate.test.cjs` pass.
- **A4**: an advisory-only artifact cannot carry gate weight in any test; a FAIL without reproduction is advisory.
- **B**: registry covers every decision id; committed rows are immutable; reopening without a trigger is refused.
- **C1**: pilot report with measured metrics and a pre-registered threshold; adoption/rejection is evidence-based.
- **Release**: validator 0 warnings, suite green, doctor Healthy, certification package committed, tag decision recorded.

---

## 9. Owner decisions required (forks that block the freeze)

| # | Decision | Recommendation |
|---|---|---|
| D1 | Supervisor registration policy: (a) any live PID>4, (b) own/ppid only, (c) token handshake | (a), documented as anti-accident |
| D2 | `RECENT_WINDOW`: value (5/15/30 min) and scope (journals+snapshots vs snapshots only); TTL addition | 15 min, both classes, no TTL in v1.9.5 |
| D3 | Registry: single Markdown vs Markdown+generated JSON; location; enforcement level (WARN vs FAIL) | single `docs/decisions/REGISTRY.md`, append-only; enforcement WARN first |
| D4 | Gate-check strictness: require Receipt-Owner + review-path binding; grandfather legacy reviews; installed-role behavior | require + bind; legacy WARN; installed skip |
| D5 | v1.9.4 certification package: docs-only commit now after freeze/re-record, or fold into v1.9.5 | commit now (docs-only), then open v1.9.5 |
| D6 | CI scope for the journal warning (workflow change) | treat WARN as failure in the source repo |
| D7 | Track C timing: after Track A/B vs in parallel | after |
| D8 | v1.9.5 tag + push to origin (main is 10 commits ahead) and commit signing | tag after certification; push after commit; signing optional |
| D9 | TASK.md Roles for the next phase: gemini implementer, deepseek reviewer/auditor; keep or drop Qoder, GLM, CodeGeeX, Copilot, Qwen | gemini + deepseek active; others reviewer-on-call |
| D10 | Gemini-Flash and Qoder artifacts: repair entry/receipt (Gemini-Flash) and correct the false fact (Qoder), or downgrade both to advisory | repair if the participants still have FS access, else downgrade |

**Owner decision 2026-09-19 (RuslanFomenko, chat)**: every recommendation in this table was accepted as recommended. Default applied now for D10: the Gemini-Flash and Qoder artifacts are downgraded to advisory; they are not cited as gate evidence, and their content is already reflected in this plan. D5, D8, D9 and D10 remain owner-executed or owner-authorized actions.

---

## 10. Next phase - two-sided model and gate protocol (owner directive)

- **Roles** (to be recorded by the owner in TASK.md): `gemini` = implementer; `deepseek` = controller, reviewer, auditor. Both have FS_WRITE/SHELL_EXEC/REPO_READ; deepseek signs Evidence.
- **Per item**: Gemini implements one sequenced item with tests and a commit; DeepSeek reviews it adversarially (mandatory prompt per item or per batch, report under `docs/reviews/`, receipt via `record`); the owner approves the gate before the next item.
- **Completion**: after the last item, one whole-scope mandatory adversarial review prompt; an independent reviewer (not Gemini, not the author of the item reviews) certifies; TASK.md completion gate cites the prompt and the review; freeze, ordered records, `verify --deep`, commit, tag, push decision.
- **Prohibition**: Gemini does not mark items complete unilaterally; DeepSeek does not implement the items it audits in the same cycle; no write to shared documents without the lock.

---

## 11. Residual risks

| Risk | Mitigation |
|---|---|
| Recency window keeps dead sessions briefly | short window; supervisor-first; documented heuristic |
| Registered-liveness pinning (borrowed PID) | documented anti-accident model; `clear-lock --force --reason` audit path |
| Receipts stale again during the next round | freeze protocol in Track 0; commit last |
| Journal cap churn every round | archival is step 0; CI escalation |
| Registry drifts from decisions | validator coverage + append-only check |
| Track C scope creep | owner gate D7; hypotheses only |

---

## 12. References

- This plan supersedes: `docs/reviews/2026-09-19-deepseek-flash-final-followup-plan-v1.9.5.md`
- Reviews: `2026-09-19-gemini-final-plan-adversarial-review.md`, `2026-09-19-gemini-opus-final-plan-adversarial-review.md`, `2026-09-19-qoder-adversarial-review-v1.9.5.md`, `2026-09-19-mistral-vibe-final-v1.9.5-followup-plan-review.md`, `2026-09-19-deepseek-flash-final-plan-probe-review.md`, `2026-09-19-glm-final-plan-adversarial-review.md`
- Decisions: `PROTO-DEC-0025`, `PROTO-DEC-0028`; proposed `PROTO-DEC-0031`..`0033` (0029 and the approval-provenance 0030 already accepted).
- Active task: `.ai/TASK.md`; probe fixtures: `C:\Users\Dmitry\AppData\Local\Temp\kilo\v195probe*` (not part of the repository)
