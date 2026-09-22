# Mandatory Adversarial Review Prompt: Final Cycle-Architecture Strategy (Last Council Round)

Date: 2026-09-20
Repository: D:\Colabs
Baseline: d38d2f2ae4b4c17fe6c2c18f11215cedb2f10eb1; dirty tree, verify the current snapshot yourself
Mode: ADVERSARIAL ANALYSIS — not a certification of Wave C, the kernel, or any product
Status: Proposed dispatch; the owner appoints one synthesizer and up to three reviewers

## Mission

One round. Attack `docs/reviews/2026-09-20-final-cycle-architecture-strategy.md` (the Proposed
strategy), correct it by evidence, and prepare it for the owner's explicit approval. Do not
choose a winner among models; do not open another general discussion after the synthesis.
Facts and reproductions outrank majority. An unresolved mandatory blocker stays a blocker and
cannot be waived by a round limit.

## Input package (same for every participant)

1. `AGENTS.md`, `.ai/TASK.md`, `.ai/PLAN.md`; PROTO-DEC-0037, 0038, 0039, 0040; DEC-0020.
2. The Proposed strategy: `docs/reviews/2026-09-20-final-cycle-architecture-strategy.md`.
3. Claude statistical audit: `docs/reviews/2026-09-20-claude-cycle-architecture-statistical-audit.md`.
4. Gemini adversarial review: `docs/reviews/2026-09-20-gemini-cycle-architecture-adversarial-review.md`.
5. Codex research: `docs/reviews/2026-09-20-codex-cycle-history-research.md`, its plan
   `...-codex-cycle-improvement-plan.md`, and its prompt `...-codex-cycle-final-council-prompt.md`;
   the reproducible script and snapshot under `docs/research/2026-09-20-cycle-history/`.
6. The owner's 12-stage list (in `2026-09-20-cycle-architecture-council-prompt.md`).
7. Primary historical reports and external sources by the links in the Codex research.

`HEAD` does not identify a dirty snapshot. If the current corpus differs from
`evidence.json`, name the changed inputs before ruling.

## Mandatory independent verifications (agreement without computation does not count)

V1. Recompute the k-curve on the SAME three cohorts with n>=4: k=3 must be 15.71% and
    k=4 7.14% (not 7.86% to 7.14%). Show your arithmetic.
V2. Demonstrate with at least one real document that a `RECOMMENDATION` verdict can carry
    findings that a later `FAIL` used (verdict is a judgement of obligation, not detection).
    Check `docs/reviews/2026-09-20-deepseek-flash-paired-cycle-review.md` versus
    `docs/reviews/2026-09-20-codex-paired-cycle-review.md`.
V3. Verify the strategy's census claim about today's corpus (files, Verdict/Reviewer/Mode
    counts, exact tokens) with your own command; state if the counts move during the round
    and why that weakens any numeric norm.
V4. Check that Wave B (two items) had its central R5 parity claim overturned by the C40
    re-audit (`docs/reviews/2026-09-20-codex-paired-cycle-remediation-reaudit.md`), and
    state what this does to any "1-2 items per block" rule.
V5. Verify A2: the PASS was overturned by the same reviewer's addendum (self-correction),
    not by an external detector; then judge whether the strategy's certification-
    independence invariant is stated as a policy (correct) or as a measured optimum (wrong).
V6. Check the closed verdict vocabulary against the CURRENT gate implementation in
    `validate-protocol.ps1` and `.ai/bin/protocol-handoff.cjs`: which exact tokens pass, what
    happens to `PASS - explanation`, `CONDITIONAL PASS`, `CORRECTION REQUIRED`; are
    historical artifacts affected?
V7. Audit the new authorization rule (§6 of the strategy) for implementability with the
    existing validator/gate-check and without a new kernel gate: BARC fields, diff-scope
    containment, forbidden paths, author!=reviewer, receipt binding. Name the first step
    that would fail today and the smallest change that makes it workable.

## Attack questions (answer each explicitly: agree / amend / reject with evidence)

A1. Does the seven-phase sequence with four repeat triggers (§2) hide an unconditional
    "N reviewers x M rounds" requirement anywhere? Quote the line.
A2. Does the certification-independence invariant (§3) block useful reviewers, break small
    teams, or contradict PROTO-DEC-0038? Give a concrete failure case.
A3. Is the risk-class table (§3) complete? Which real change type would fall between classes?
A4. Is the block definition (§4) sufficient to prevent another Wave B-style overturned
    parity claim, or does it need a mandatory integration-matrix clause?
A5. Does the anti-idle-loop budget (§6.4) risk accepting a real defect? Name the scenario and
    the guard that catches it.
A6. Are the four repeat triggers exhaustive? Which situation is missing (e.g., reviewer
    capability failure, environment EPERM-class blocker, owner request)?
A7. Does §6 authorization conflict with the owner's direct authority or with lock/journal
    protocol? Propose exact wording fixes.
A8. Is the "no model ranking by FAIL share" position correct? Attack it with data if you can.
A9. Which owner decisions (D-A..D-E) need splitting, merging or rejection?
A10. What is the minimal change that makes this strategy acceptable to you? What is
    optional backlog?

## Required output (one file; <= 250 lines, preferably <= 120)

Header: Reviewer/model, Date (UTC), baseline/snapshot, Mode: ADVISORY, Verdict — exactly one
of `PASS`, `RECOMMENDATION`, `FAIL`, `BLOCKED`; explanation in the body, never in the token.
Table: `ID | where (section) | mandatory/optional | problem | evidence/command | exact
replacement text | risk/cost`.
Then: verifications V1-V7 with commands and observed outputs; unknowns; the minimal fix that
makes the strategy acceptable.
Do not rank models. Do not write "agreed" without a reproduction where a number is involved.
Do not modify history, decisions, or another session's journal; no commits.

## Synthesis and fixation (owner-driven, in the same round)

The owner appoints one synthesizer (not a reviewer of the same package's core claims if the
certification-independence rule would be violated). The synthesizer issues ONE disposition
table: each amendment accepted / rejected / merged / left open, with reason and evidence.
A rejected blocker requires a counter-reproduction. Targeted fact-checks run inside this
round; no new general positions and no expansion of participants are scheduled
automatically. The owner resolves policy tradeoffs. If a factual blocker remains, the
affected clause is not approved and the missing evidence is named. After the targeted fixes,
the owner approves the final version explicitly; only then is the required governance record
written under the lock. Nothing is adopted or declared Approved before that.

## Capacity note (applies to this round)

Active review corpus is already near the cap after the strategy and this prompt. Reviewers:
prefer ONE consolidated review package with provenance sections, or ask the owner to archive
before adding files; do not push the corpus over 60 files / 600 KB, and do not create a file
per participant unless capacity allows.

## Boundaries

Do not change Wave C, the kernel, product repositories or frozen metrics; this round does not
close Wave C and does not authorize product work. Reopening Track C or DECISIONS requires the
owner's explicit dated directive.
