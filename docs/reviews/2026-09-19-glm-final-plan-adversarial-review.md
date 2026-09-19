# GLM 5.1 - Adversarial Analysis of the Final v1.9.5 Plan (Transcribed, Advisory)

**Date**: 2026-09-19  
**Reviewed commit**: `a6dbf8ce18be52c8f5d95ae837d71af5d7c63cac`  
**Working tree**: dirty  
**Reviewer**: GLM 5.1  
**Scope**: council / adversarial plan review  
**Mode**: READ-ONLY ADVISORY - no direct repository access claimed; no journal entry and no Evidence block exist for this analysis; it carries advisory weight only and is **non-certifying**.  
**Verdict**: none stated by the participant (analysis and delta list only)

> Transcribed from chat by deepseek-flash (FS-capable agent), model: GLM 5.1, date: 2026-09-19T00:02:00Z. Source: owner-supplied chat transcript. Content below is the participant's text; the "Transcriber verification" section is the transcriber's own probe result and is clearly separated.

---

## Participant Content

The v1.9.5 plan is vulnerable to digest side-effects from auto-archiving, C0 liveness is trivially defeated by PID recycling, and the gate freshness check must be a dedicated subcommand rather than a validator-embedded field.

### V1 - Digest/Freeze Mechanics

Claim verified: `protocol-hooks.cjs:125` excludes `.ai/runtime/`, `.ai/worklog/` and `.ai/ARCHIVE.md` from the anchor digest.

Side-effect the plan missed: auto-archiving invalidates receipts. When `autoArchiveWorklog` triggers (journal > 150 lines) it mutates `.ai/ARCHIVE.md`. While `.ai/ARCHIVE.md` is excluded from the tree digest, the archived entry's Merkle parent hash changes because the journal's content is rewritten (older entries removed). A receipt recorded before the auto-archive will fail `verify --deep` if the archived parent hash is recalculated against the modified journal tail, contradicting the F-002 fix in `2026-09-18-grand-council-consensus-v1.9.0.md` which assumed archive exclusion was sufficient.

Recommendation: auto-archive must be treated as a digest-breaking operation. The plan must mandate that `autoArchiveWorklog` requires a subsequent record to re-certify the tree state, or receipts must anchor to a frozen commit SHA rather than a mutable tree digest.

### V2 - Break the C0 Design (Session Liveness)

- Recycled PID: a CLI process exits, releasing PID N. The OS recycles N for an unrelated process. `isProcessAlive(N)` returns true, permanently protecting a dead session's snapshot/journal from `cleanup-runtime --force`.
- Empty journal touch: a malicious or buggy hookless session runs `touch .ai/worklog/agent-id.md` every 14 minutes to stay inside `RECENT_WINDOW` (15 min) indefinitely, bypassing quarantine and accumulating untracked runtime state.
- Scope: the plan ambiguously applies the window to both journals and snapshots. Snapshots are disposable; journals are history. A 15-min window on journals risks deleting legitimate short sessions that finished quickly.

Recommendation: `RECENT_WINDOW` must apply only to snapshots. Journals must rely on `prune` (which requires emptiness). Liveness must not rely solely on PID existence; it requires a lock lease or heartbeat file.

### V3 - Supervisor Registration

Option (a) "any live PID > 4" reintroduces squatting. Concrete attack: Agent A registers PID 1234 (a long-running system daemon). Agent B tries to start; `cleanup-runtime` sees PID 1234 alive and refuses to prune A's snapshot even if A's session is logically dead. Agent A has effectively DoS'd the runtime directory with an unprunable snapshot using a non-owning PID.

Recommendation: option (b) own/ppid only is the only safe default for CLI tools, as `protocol-session.cjs:75-76` already enforces. To support external orchestrators (option c), require a handshake token written to `.ai/runtime/<session>.token` that the orchestrator must present to prove delegation, avoiding global PID squatting.

### V4 - Gate Freshness

A validator-embedded `Session:` field is insufficient.

Failure modes: installed projects have no journals and the validator cannot find the `Session:` field; legacy/transcribed reviews lack a native Evidence block (AGENTS.md section 5.5); recursion - if the validator checks the gate and the gate cites a review that runs the validator, circular dependencies emerge.

Recommendation: implement a `protocol-handoff.cjs gate-check` subcommand verifying (1) the cited review file exists, (2) its Evidence block verifies against the current tree, (3) the verdict matches; exit 0 with a warning if no journal exists for installed/legacy cases.

### V5 - Decision Freeze/Registry

Loopholes: `metric-drop` with no baseline is unfalsifiable; an unrecorded owner directive in chat circumvents the freeze.

Registry format proposal:

```json
{ "decision": "DEC-0025", "trigger": "metric-regression", "baseline": "sha256:...", "status": "frozen" }
```

The validator checks coverage by ensuring every decision cited in AGENTS.md or `protocol-manifest.json` has a registry entry; it does not edit DECISIONS.md and only warns on missing entries.

### V6 - Acceptance/Sequencing

A failing implementation that passes criteria: one where `cleanup-runtime --force` deletes all snapshots regardless of liveness and `prune` deletes all journals regardless of content - it passes "no stale runtime state" and "no empty journals" while violating the safety property (F-005 in `2026-09-18-grand-council-consensus-v1.9.0.md`).

Missing prerequisite: Track A (C0 fix) must precede Track B (gate freshness), because if liveness is broken a stale session can write a gate receipt that appears fresh but is actually orphaned.

### V7 - Omissions/Hypotheses

- No mention of worktree safety: `.kilo/worktrees/helix-mum/` in the repo shares a `.git` directory; probes in a worktree can mutate the main worktree's `.ai/ARCHIVE.md` if the lock is bypassed.
- H1: "reduced orphaned snapshots" is not measurable without a baseline count in v1.9.4.
- MCP risk register does not cover protocol behavior depending on out-of-repo state (global Git config, `core.hooksPath` pointing away from `.ai/hooks`).
- The 35%/50%/65% forecast is not marked as unverified in the participant's reading.

### Delta List

| Action | Item | Justification |
|---|---|---|
| Add | Auto-archive re-certification step | Archive mutation breaks existing receipt validity (V1) |
| Add | Worktree isolation test | Probes in worktrees can bypass locks and mutate shared state (V7) |
| Remove | PID-based liveness for snapshots | Defeated by PID recycling; replace with lock lease (V2) |
| Reword | `RECENT_WINDOW` applies to snapshots only | Journals are history; a time window risks data loss (V2) |
| Reprioritize | Track A before Track B | Liveness must be fixed before gate receipts can be trusted (V6) |
| Add | `gate-check` subcommand | Validator-embedded field fails for installed/legacy projects (V4) |
| Reword | Mark 35%/50%/65% as unverified forecast | No empirical basis in repo history (V7) |

---

## Transcriber Verification (deepseek-flash probes, throwaway clone)

| Claim | Probe result | Disposition |
|---|---|---|
| Auto-archive invalidates receipts / changes the archived parent hash | REFUTED. Two certified entries, entry A archived with `protocol-archive.cjs worklog --keep 1`: tree digest unchanged (`736b246c...` before == after), `verify --owner probe-runner --deep` exit 0, `archived-parent` marker matched A's recorded entry hash `5c1bf8de...`. Archiving rewrites the journal and ARCHIVE.md (both digest-excluded) and preserves canonical entry bodies. | Reject as a defect; keep as a regression test to add |
| Worktree probes can mutate the main worktree's `.ai/ARCHIVE.md` | REFUTED. `.kilo/worktrees/helix-mum` is excluded via `.git/info/exclude:9`; linked worktrees have separate working trees and per-worktree HEAD/index; the shared `.git` object database does not share `.ai/` files. | Reject; optional worktree note only |
| 35%/50%/65% forecast not marked unverified | REFUTED. Plan C1 states it is "recorded as an unverified hypothesis and must not appear in any decision text as fact"; `grep '35%|50%|65%' .ai/DECISIONS.md` returns nothing. | Reject |
| Recycled PID / touched empty journal keep dead state alive | CONFIRMED as residue/hygiene only (no content loss; empty journals are movable to quarantine, snapshots only affect comparison). | Accept as documented residual; optional TTL later |
| `prune` should preserve foreign-host (`null`) journals; plan must say so | CONFIRMED (same as Gemini F-001 and DeepSeek F-001). | Already adopted in the consolidated plan |
| Option (b) own/ppid only; token handshake for orchestrators | REJECTED as a security boundary. Probe: a hand-written `.ai/runtime/<owner>.json` with a borrowed live PID and its own nonce acquires and pins the lock under the current code; the token handshake file would be equally forgeable because the session writes it itself. | Adopt (a) with a documented anti-accident caveat |
| Dedicated `gate-check` subcommand | CONFIRMED (consensus; `verify --deep` is ~0.4s/owner, no recursion - `verify` never runs the validator). | Adopted |
| Track A before Track B | CONFIRMED. | Adopted |

This transcription gives the participant's analysis a durable, citable record (advisory). It does not certify the plan and cannot carry gate weight under the A4/C8 rule.
