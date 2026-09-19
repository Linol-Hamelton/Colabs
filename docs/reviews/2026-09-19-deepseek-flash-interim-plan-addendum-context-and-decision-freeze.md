# Addendum D2 to the Interim Council Plan - Decision Freeze, Registry, and Context Economy

**Date**: 2026-09-19  
**Author**: DeepSeek (deepseek-flash), plan author  
**Status**: owner-supplied hypotheses, added before the next coordination iteration. This addendum extends `docs/reviews/2026-09-19-deepseek-flash-interim-council-plan.md`; it does not modify the shipped v1.9.4 record.  
**Source**: owner-provided chat analysis ("cleanup_and_decisions.md" content). The referenced file does not exist in the repository; the ideas below are recorded as owner input, not as a persisted model report.  
**Conflict of interest**: DECLARED (plan author; support-only, not a certifying review).

---

## 1. Fact check of the source message

| Claim | Verdict |
|---|---|
| Only the journal count needs immediate action | TRUE in substance; the count is now **36** (the message says 35), so any fixed number is a snapshot - the policy must be invariant-based, not count-based |
| `docs/reviews/` are permanent records | TRUE |
| `.ai/DECISIONS.md` and `.ai/ARCHIVE.md` are append-only | TRUE (`AGENTS.md:253`) |
| Runtime quarantine has a 30-day trigger, not yet reached | TRUE (`protocol-session.cjs:291`); dead snapshots 24h, stale 7d |
| `cleanup_and_decisions.md` exists | FALSE - no such file in the repository; chat-only input |

## 2. Adopted items

### A1 - Decision freeze with explicit reopen triggers
A new decision block gains two optional fields: `Reopen-trigger:` and
`Frozen-at:`. Existing blocks are never edited (append-only). A frozen decision
is reopened only when a documented trigger fires **and** the trigger carries
evidence; doubt without a documented trigger does not start a re-discussion.
Trigger classes: `invariant-broken`, `metric-drop`, `new-external-data`,
`security-finding` (a reproduction is mandatory), `owner-directive`,
`higher-source-contradiction`. Challenges remain always allowed under AGENTS.md
section 2, but stay advisory until a trigger is documented. Enforcement is two
layer: an orchestrator pre-check (no trigger, no reopening) and, if the council
agrees, a validator rule that new decision blocks must carry `Reopen-trigger:`
(needs its own decision block and tests - a `PROTO-DEC-0029` candidate).

### A2 - Registry instead of retroactive edits
The 28 existing decisions need a retroactive freeze without touching their
blocks. Preferred: an append-only registry, `docs/decisions/REGISTRY.md` (or a
JSON twin for machine checks), mapping `DEC id -> status / reopen-trigger /
frozen-at`. The source message proposed annotating `.ai/ARCHIVE.md`; that file is
worklog history, so mixing a decision registry into it muddies semantics. Council
to decide placement. The validator can later check registry coverage.

### A3 - Reopen evidence standard
`security-finding` and `invariant-broken` triggers require at least one
reproduction (command, probe, or failing test). This mirrors item C4c: a FAIL
without a PoC is advisory and cannot reopen anything. Qoder's cycle is the worked
example: a text-only FAIL with no file and no PoC nearly restarted the cycle.

### A4 - Context-economy experiment H1 (measure before adopting)
Treat Serena / CodeGraphContext / Repomix / Qdrant / Graphiti as hypotheses, not
decisions. Define metrics first: time-to-first-edit, input tokens per task,
repeated repository reads per session, handoff completeness, cross-model variance.
Pilot on one consumer repository, never on the protocol source during a release
freeze. The quoted 35% / 50% / 65% forecast is unverified and must not enter any
decision text as fact.

### A5 - MCP policy (if adopted)
Minimal universal base only (filesystem and git-like read access); everything
else as per-project profiles that are **recommendations**, gated by a
policy/compatibility layer and never auto-installed. Any agent capability
asymmetry is declared per the C4a capability matrix and must not change gate
rules: certifying reviewers need `FS_WRITE`, `SHELL_EXEC`, `EVIDENCE_SIGN`,
`REPO_READ`; everyone else is advisory. The council may discuss its own tooling,
but the decision passes through the policy layer.

### A6 - MCP risk register
External indexes and caches are out-of-repo state, which conflicts with the
protocol principle that the repository is the only channel and the source of
truth. Risks: stale indexes, secrets in caches, non-reproducible context,
divergence between agents with different tool sets, and a new complexity layer.
Mitigation: keep derived state disposable under `.ai/runtime/` (gitignored) or
regenerate it; never let the completion gate depend on external state.

## 3. Rejected or deferred

- **Variant A (`Status: FROZEN` in existing blocks)**: edits a written block and
  violates append-only.
- **Variant B (full ADR files for 28 decisions)**: high retroactive cost and the
  same immutability conflict; A2's registry covers the need.
- **Immediate Serena/CGC/Repomix/Qdrant adoption**: environment-level, unmeasured,
  and premature; H1 first.
- **"Global-level" protocol edits**: protocol rules live in the repository
  `AGENTS.md`; agent capabilities and MCP profiles live in orchestrator/global
  configuration. The two must not be conflated (same critique as GLM's proposal).

## 4. New council questions

7. Registry placement and format: `docs/decisions/REGISTRY.md`, a JSON twin, or
   ARCHIVE annotation?
8. Should `Reopen-trigger:` be validator-enforced for new decision blocks, or
   advisory orchestration guidance?
9. What objectively counts as `metric-drop` (threshold, window, baseline owner)?
10. Who owns MCP policy - the protocol source or the orchestrator/global config?
11. H1: which consumer repository is the pilot, and what is the minimum measurable
    success that would justify wider adoption?

---

## References

- `docs/reviews/2026-09-19-deepseek-flash-interim-council-plan.md`
- `docs/reviews/2026-09-19-interim-plan-adversarial-review-prompt.md`
- `AGENTS.md`: sections 2, 5, 6; `.ai/DECISIONS.md` PROTO-DEC-0028
- `.ai/worklog/deepseek-flash-ebd6eb9397ed3784.md`
