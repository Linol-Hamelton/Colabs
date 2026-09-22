# Mandatory Adversarial Review Prompt: Final v1.9.5 Follow-up Plan (Last Council Round)

**Date**: 2026-09-19  
**Author**: DeepSeek (deepseek-flash), plan author  
**Plan under review**: `docs/reviews/2026-09-19-deepseek-flash-final-followup-plan-v1.9.5.md`  
**Superseded drafts**: `2026-09-19-deepseek-flash-interim-council-plan.md`, `...-addendum-context-and-decision-freeze.md`  
**Release baseline**: `c71bdcf` (annotated tag `v1.9.4`); HEAD `a6dbf8c` plus uncommitted certification artifacts  
**Role**: final Mandatory Adversarial Peer Review (AGENTS.md section 2) before the owner freezes the v1.9.5 plan  
**Invited reviewers**: Claude, Copilot, Gemini, Mistral, Qwen, CodeGeeX, GLM, Qoder, and any other available model  
**Conflict rule**: DeepSeek authored the plan; it may submit probes but not certify. Only reviewers with `FS_WRITE`, `SHELL_EXEC`, `EVIDENCE_SIGN` and `REPO_READ` may render a certifying verdict; text-only participants answer as `[MODE: READ-ONLY ADVISORY]` and their output must be transcribed per AGENTS.md section 5.5 by an FS-capable agent or the owner, else it carries no weight.

---

## 1. Context

This is the last discussion round before the owner fixes the final plan for the
v1.9.5 cycle. The v1.9.4 hardening core is verified (suite 200/200, doctor
Healthy, consumers 18/18), but one reproducible defect (C0, session liveness),
one gate-integrity gap (stale receipt citation), and a governance weakness
(decisions get re-litigated without triggers) remain. The plan consolidates the
owner's hypotheses, three adversarial plan reviews, and the Qoder/GLM capability
responses. Your job is to attack the plan, not the shipped code.

## 2. Facts the plan asserts (verify or refute each with command output)

1. `.ai/bin/protocol-hooks.cjs:125` excludes `.ai/runtime/`, `.ai/worklog/` and
   `.ai/ARCHIVE.md` from the anchor digest, while `docs/reviews/**` and
   `.ai/TASK.md` are included. Consequence to verify empirically: writing a
   review or editing TASK stales prior receipts; writing only a journal does not.
2. C0 is still reproducible: `prune` quarantines a live session's empty journal
   and `cleanup-runtime --force` removes its snapshot while a registered
   supervisor is alive. Call sites: `protocol-session.cjs` around `:182` (prune)
   and `:247/:261` (cleanup); the helper `:28-33` never reads `supervisorPid`.
3. `protocol-session.cjs:75-76` restricts `--supervisor-pid` to own/ppid, which
   blocks an external orchestrator spawning `start` through a shell.
4. The gate currently cites Copilot's review whose receipt does not verify; the
   validator checks file existence and verdict only.
5. Journal count is now 29 and the validator reports 0 warnings; the quarantined
   files are header-only (no content lost).

## 3. Attack vectors

### V1 - Empirically validate the digest/freeze mechanics
Run the ordering protocol end to end in the real repository on throwaway
artifacts (or in a clone/fixture): write a review file then check a receipt (must
go stale), record a journal then check (must stay fresh), and confirm that a
`git commit` does not stale receipts. Report any step that does not behave as the
plan asserts, and any digest-changing side effect the plan missed (auto-archive,
rehash, prune, temp files, `.tmp` cleanup, `.gitignore` changes).

### V2 - Break the C0 fix design
Attack the five-branch matrix and the proposed `isSessionAlive`. Construct:
a stale-but-alive supervisor PID that outlives its session; a foreign host; a
recycled PID; a session whose empty journal is touched to stay inside the window
while dead; a live hookless session that idles past the window. State whether
the recommended `RECENT_WINDOW` (15 min) is safe, too short, or too long, and
whether the window should apply to journals, snapshots, or both.

### V3 - Supervisor registration policy
Evaluate: (a) accept any live PID > 4 for `--supervisor-pid` (recommended),
(b) keep own/ppid only, (c) token handshake. Does (a) reintroduce any lock
squatting or denial-of-service vector, given that registration only protects the
owner's own journal and snapshot and the lock keeps its strict binding? Produce a
concrete attack or show there is none.

### V4 - Gate freshness implementation
Compare (a) validator-embedded `verify --owner` using a `Session:` field in the
review header, and (b) a new `gate-check` subcommand. Identify failure modes:
installed projects without the journal, legacy reviews without a Session field,
reviews recorded by a proxy/transcriber, re-recording after the gate is filled,
and validator recursion or performance. Recommend one with tests.

### V5 - Decision freeze and registry
Find a loophole in the reopen triggers (for example `metric-drop` with no
baseline, `new-external-data` with an unreproducible blog post, `owner-directive`
without a record) and propose tighter criteria. Check registry compatibility
with append-only rules and propose the exact file format, including how the
validator would verify coverage without editing DECISIONS.md.

### V6 - Acceptance criteria and sequencing
Name a failing implementation that still satisfies the plan's acceptance
criteria. Reorder the sequencing if a dependency is wrong; identify any missing
prerequisite (migrations, docs, CI, tests, decision blocks).

### V7 - Omissions and hypotheses
What is still missing from Track A/B/C? Evaluate the H1 metrics for
measurability with available tooling and propose numeric thresholds. Does the MCP
policy risk register cover the worst failure (protocol behavior depending on
out-of-repo state)? Is the 35%/50%/65% forecast properly marked as unverified?

## 4. Required deliverable

1. A report per `templates/reviews/REVIEW.md` under
   `docs/reviews/YYYY-MM-DD-<agent>-<description>.md`, with reviewer, reviewed
   commit, scope, conflict declaration, and an explicit verdict on the PLAN
   (PASS / RECOMMENDATION / FAIL / BLOCKED).
2. Answers to the plan's 14 council questions (section 6 of the plan), each with
   a recommendation and the strongest counter-argument.
3. A delta list: add / remove / reword / reprioritize, one-line justification.
4. Command output for every reproduced claim, including at least one negative
   test for each mechanism you attack.
5. A five-label journal entry, then
   `node .ai/bin/protocol-handoff.cjs record --owner <session-id>` and
   `node .ai/bin/protocol-handoff.cjs verify --owner <session-id> --deep`.
6. Chat output: short executive summary and the report path. A chat-only answer
   is non-compliant (AGENTS.md section 5); text-only participants add
   `[MODE: READ-ONLY ADVISORY]` and rely on the transcription fallback.

## 5. Constraints

- Do not modify implementation files, `.ai/`, tests, or the plan; probes run in
  throwaway fixtures or a clone.
- Do not rewrite historical journals, ARCHIVE.md, or decision blocks.
- Do not re-open shipped v1.9.4 code beyond verifying C0 and the plan's facts.
- The owner fixes the final plan; council output is input, not a decision.
