# Mandatory Adversarial Review Prompt: Interim Council Action Plan (v1.9.4 Follow-up)

**Date**: 2026-09-19  
**Author**: DeepSeek (deepseek-flash), plan author  
**Plan under review**: `docs/reviews/2026-09-19-deepseek-flash-interim-council-plan.md`  
**Release baseline**: `c71bdcf` (annotated tag `v1.9.4`); HEAD `a6dbf8c` plus uncommitted certification artifacts  
**Supporting record**: `docs/reviews/2026-09-19-deepseek-flash-certification-integrity-and-consolidation.md`  
**Role**: Mandatory Adversarial Peer Review (AGENTS.md section 2) of the PLAN, before the owner fixes the final plan  
**Invited reviewers**: Claude, Copilot, Gemini, Mistral, Qwen, CodeGeeX, Qoder, and any other available model  
**Conflict rule**: DeepSeek authored the interim plan and the phase gate reviews; DeepSeek may submit probes but must not be the certifying reviewer of its own plan. Unconflicted models render the verdicts.

---

## 1. Context

Protocol v1.9.4 is tagged (`c71bdcf`) and its hardening core is verified (suite
200/200, doctor Healthy, consumers 18/18). The cycle is **conditionally closed**:
a session-liveness defect (C0) is still reproducible, the certification package
is uncommitted, the validator reports one journal-count warning, and the
completion gate cites a review whose Evidence receipt is now stale. There is no
personal bookkeeping here: every claim below is reproducible from the repository.

Your task is **not** to re-litigate the shipped v1.9.4 code (except to verify the
C0 defect). Your task is to attack the INTERIM PLAN: its factual base, its
diagnosis, its forks, its recommendations, its acceptance criteria, and its
omissions.

## 2. The interim plan under attack (summary; read the file for the full text)

Open items: **C0** session liveness cleanup still broken (`prune` quarantines a
live session's journal and `cleanup-runtime --force` removes its snapshot; root
cause `protocol-session.cjs:28-33` reads only `record.pid`, ignoring
`supervisorPid`); **C1** journal count 34/30 -> validator warning; **C2**
certification package uncommitted; **C3** completion gate cites a stale receipt;
**C4** chat-only audit artifacts (Qoder FAIL, Claude Code synthesis) violate the
AGENTS.md section 5 ordering rule; **C5** docs accuracy (legacy receipts are
editable; "clean tree" claims; stale "16-byte nonce" note); **C6** no
exclusion-set regression for the fast-validator stub; **C7** carried hypotheses
(`nonceHash` storage; doctor + receipt-freshness in CI).

Forks: **F1** C0 fix design (recommended: supervisor-first liveness plus a
conservative recency fallback vs supervisor-only vs recency-only); **F2** gate
freshness (recommended: require `verify --deep` of the cited review at gate time);
**F3** journal cap (recommended: keep 30, make archival a release-gate step);
**F4** legacy Evidence policy (recommended: keep label-only and document);
**F5** next-cycle vehicle (recommended: v1.9.5 patch for C0-C3+C5, v2.0 for C7);
**F6** freeze-then-single-re-record protocol (recommended), based on `.ai/worklog`
being excluded from the anchor digest while `docs/reviews` and `TASK.md` are
included.

Council questions: (1) F1 mechanism and window; (2) does a stale receipt
invalidate a certification that was valid when recorded; (3) is 30 the right
journal cap for multi-model councils; (4) does C0 warrant its own decision block
(`PROTO-DEC-0029`); (5) what is the sanction for chat-only audit artifacts;
(6) after C0 is fixed, re-run all six vectors or only a targeted liveness review.

## 3. Attack vectors (each answer must cite command output or file evidence)

### Vector 1 - Verify the plan's factual base
- Reproduce the receipt states: `verify --owner <id> --deep` for
  `claude-123ff4a27989f7af`, `mistral-vibe-7d4ebdb4413f0de0`,
  `gemini-2da9379ddcd247b6`, `copilot-13595b63-cf45-4860-a3e7-05c7972c5702`,
  `deepseek-flash-ebd6eb9397ed3784`. Is the plan's claim correct that only the
  last writer verifies, and why?
- Read the anchor code and confirm or refute: is `.ai/worklog/**` really excluded
  from the digest, and are `docs/reviews/**` and `.ai/TASK.md` really included?
- Count journals by the validator's own rule and by a raw directory listing; is
  the plan's 34 (README excluded) correct?

### Vector 2 - Attack the C0 diagnosis and each F1 fix
- Reproduce C0 exactly as the plan states. Then attack the candidate fixes:
  - Does supervisor-first liveness let a **stale/dead** `supervisorPid` protect a
    dead session forever? What reaps it?
  - Does a recency fallback let a **dead** session be kept alive indefinitely by
    touching the journal, or protect a live session across a long idle period?
  - What happens on a **foreign host**, with a **PID recycled** on the same host,
    and when `cleanup-runtime` runs with `liveness: null`?
  - Is there a simpler correct mechanism the plan missed (heartbeat field,
    session TTL stored at start, lock-based liveness, process-group id)?
- State whether the plan's root cause and severity are correct, and whether C0
  contradicts PROTO-DEC-0025 item 3 as claimed.

### Vector 3 - Attack F6 (freeze and re-record) mechanically
- Verify the digest-exclusion claim in code.
- Find digest-changing side effects during a re-record pass. In particular:
  does `record` ever write `.ai/ARCHIVE.md` (auto-archive) or anything else that
  is NOT excluded, thereby re-staling receipts recorded earlier in the same pass?
  If yes, the recommended F6 ordering is unsafe - propose a corrected protocol.
- Does `rehash` change the digest? Does `record --quick` skip any digest write?

### Vector 4 - Attack the forks' framing
- For each of F2-F5, name a concrete failure mode of the recommended option that
  the plan does not mention, and a hybrid or cheaper alternative.
- Are any forks false dilemmas (two options that can coexist)?
- Does F5 under-estimate consumer impact: Block-Puzzle and VPN already run v1.9.4
  with the C0 defect - must they be re-synced in the next cycle, and how is that
  ordered against the source freeze?

### Vector 5 - Find omissions and wrong priorities
- What is missing from C0-C7? Consider at least: validator tests for any new gate
  check; `PROTO-DEC-0029`; CI wiring for `doctor`/freshness; the stale receipt of
  the gate-cited review as a separate item from C3; documentation of the liveness
  model; the `git push` question (main is ahead of origin by 10); untracked
  certification artifacts and `.gitignore`; the journal limit interacting with
  every future council (each session adds a journal).
- Re-rank C0-C7 if you disagree with the order.
- Identify anything in the plan that is not actionable, not verifiable, or that
  violates AGENTS.md.

### Vector 6 - Attack the acceptance criteria
- Are the criteria measurable and sufficient? Name a failing implementation that
  would still satisfy them.
- Must the six vectors be re-run after C0, or is a targeted review enough? Justify.

### Vector 7 - Meta: plan-review hygiene
- Are the council questions the right ones? Add missing questions.
- Is the plan's own evidence standard met by the plan (are its claims reproducible)?
- Does the plan overstep into owner authority (e.g., prescribing a PROTO-DEC block
  or a release vehicle) in a way that should be explicitly marked as a proposal?

## 4. Required deliverable

Each reviewer returns:
1. A report conforming to `templates/reviews/REVIEW.md`, saved to
   `docs/reviews/YYYY-MM-DD-<agent>-<description>.md`, with an explicit verdict
   (PASS / RECOMMENDATION / FAIL / BLOCKED) **of the plan**, naming the reviewer
   and the reviewed commit.
2. Per-fork answers F1-F6 with a recommendation and at least the strongest
   counter-argument, and per-question answers Q1-Q6.
3. A delta list: items to add, remove, reprioritize, or reword in the interim plan,
   each with a one-line justification.
4. Command output for every reproduced claim (receipts, C0, digest mechanics).
5. A journal entry with all five labels, then
   `node .ai/bin/protocol-handoff.cjs record --owner <session-id>` and
   `node .ai/bin/protocol-handoff.cjs verify --owner <session-id> --deep`.
6. A conflict-of-interest declaration in the report header.

Chat output stays a short executive summary with the report path; the full
analysis lives in the file. A chat-only answer is non-compliant (AGENTS.md
section 5).

## 5. Constraints

- Do not modify `.ai/`, `.ai/bin/`, tests, or any implementation file for this
  review; it is a plan review. Probes run in throwaway fixtures.
- Do not rewrite historical journals, ARCHIVE.md, or decision blocks.
- Do not re-open the shipped v1.9.4 code beyond verifying C0 and the plan's
  factual claims.
- The owner decides the final plan; the council output is input, not a decision.
