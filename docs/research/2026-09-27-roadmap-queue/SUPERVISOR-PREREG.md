# Kernel v1 choice: pre-registered decision lens (supervisor note)

Author: `claude-e108f8be9e0e2049` (Claude Opus 5.5, ROADMAP-1 supervisor at the owner's request).
Written 2026-09-27. The variants, signals and switching rules were written before the supervisor
read any F-17 draft; the Mistral and DeepSeek drafts (`12946ff`, `27dc95a`) were already committed
on `roadmap-wave3` by then, and the dated early reading at the end was added after reading them.
Status: advisory. Nothing here is a decision. It is the owner's lens for packet 2 and is
deliberately NOT an input to the `KERNEL-V1-SCOPE.md` drafter, so the draft stays independent.

## Variants on the table at packet 2

- **A.** v1 = current kernel + merged 2A. Pilots resume when the exit metrics hold; 2B, 2C and
  OPS-1 B/C continue in parallel with the pilots.
- **A'.** A plus one small "pilot-path" batch: the not-built items on the installed/host path,
  fixed before the pilots start.
- **B.** Strict PROTO-DEC-0048 reading: pilots wait for 2B (and possibly CORE-ARCH stage 3).
- **C.** Probe: after the 2A merge, one pilot (Block-Puzzle) starts as a measurement probe with one
  kernel stream beside it; VPN and the other kernel streams wait.
- **D.** Reduction: v1 is defined by withdrawing decided-but-not-built items, not by building them.

## Signals, sources, and switching rules

| # | Assumption behind A | Signal and source | Arrives | Keep A if | Switch if |
|---|---|---|---|---|---|
| S1 | The kernel converges | 2A review findings, fix pass, MiMo + Sol verdicts, round count | 2A certification | <= 2 BLOCKING in review; PASS/RECOMMENDATION by round 2 | round 3 reached, a root cause of the 0048 class (prose parsing, immutability boundary), or a FAIL reproduced in both slots -> **B** |
| S2 | Nothing decided-but-unbuilt sits on the pilot path | F-17 DIG registry: "not built" rows on the installed/host path (installer, installed-role validator, completion gate, review-path contract, hooks, receipts) | wave-3 collectors + Sol | 0 such rows | 1-5 rows, each 2A-sized -> **A'**; > 5 rows or one that contradicts the pilot flow -> **B** |
| S3 | The protocol is not mostly paper | F-17: share of "not built" over all numbered items | wave 3 | < 30% | >= 30% -> weigh **D** alongside the chosen variant |
| S4 | The registry is trustworthy | Sol rejection rate on its 20% sample | Sol verification | <= 20% rows rejected | > 20% -> no variant switch; postpone the v1 decision by one correction round |
| S5 | The suite is a usable metric | owner-lane full suite on the 2A CANDIDATE; S-7 WMI throttle | 2A owner lane | <= 12 min, no WMI timeouts | > 15 min or flaky -> suite speed (W8 or a 2B slice) enters v1 |
| S6 | Usage is measurable | `docs/ops/RUNS.jsonl` after the 2A merge | 2A merge | every dispatch row has usage or an explicit `not-exposed` marker | rows missing -> 2A is incomplete; no v1 before it is fixed |
| S7 | Certifier quota allows parallel streams | Sol and MiMo finish DIG verification + 2A certs without quota stops | 2A certification | no quota stop | a quota stop -> **C** (pilot + one kernel stream), not B |
| S8 | One operator can run the parallel load | supervisor corrections of operator correctness (lock, archive, commit) during 2A and wave 3 | running | <= 1 incident | >= 2 incidents -> **C** |
| S9 | Pilots need no cloud Evidence | owner statement: will pilot sessions run in the cloud? | owner, any time | local Windows only | cloud sessions planned -> the fail-closed cloud Evidence slice of 2B enters v1 (**B-lite**) |

S1 and S2 dominate: a switch on either overrides a "keep" on the others. The K-launch memo (wave 3
item 2) affects CORE-ARCH, not the pilots, and is not a signal here.

## Already known on 2026-09-27 (weakens plain A before any data)

- The host review-path contract is open: F-C01 in `.ai/TASK.md` (neutral-requirement probes return
  RECOMMENDATION/0 instead of FAIL/1), and the pending DeepSeek note on the host review-path
  contract. Both sit on the pilot path, so by S2 the prior leans to **A'** rather than A.
- The VPN triage commit is not done (`.ai/TASK.md` acceptance criteria), so a VPN pilot cannot start
  on the same day as Block-Puzzle in any variant.
- Kilo and agy do not expose usage. The supervisor's earlier criterion "usage for every client" is
  corrected here to "usage or an explicit `not-exposed` marker" (S6).

## What packet 2 will still not know

How the protocol behaves inside the product repositories, the cost per product task, and whether
the pilot-path fixes are sufficient. No kernel wave produces that information; only a pilot does.
This is the standing argument for **C** when S1-S2 are ambiguous rather than failing.

## Reading rule at packet 2

1. Fill each row with the observed value and its source path.
2. Apply S1 and S2 first, then S7-S9, then S3-S6.
3. If no row switches, choose A (or A' by the known F-C01 item).
4. Record the table in the packet-2 message, so the choice cites evidence, not this note.

## Observed values, 2026-09-28 (operator; in progress; sources named)

| # | Observed | Source |
|---|---|---|
| S1 | 2A certification round 1: Sol FAIL with two reproduced blockers (W5 test hermeticity - a journal import into the tracked tree; S-7 bound measured 6 vs 4); MiMo pending; round 2 of 3 starts after the MiMo verdict and covers both certifiers' blockers. | `docs/reviews/2026-09-28-sol-wave2a-certification.md` (`d23d826`); PROTO-DEC-0096 item 1 |
| S2 | Final counts after the PROTO-DEC-0096 correction: Mistral 0 not built; Gemini 1 not built (0060/3); DeepSeek 9 not built (0079/3, 0084/5, 0085/9, 0085/10, A-4, A-7, A-8, A-9, A-11), all kernel-internal per the collector classification (none on the installed/host pilot path as classified; the assumption S2 rests on) -> keep A. | `drafts/DIG-MISTRAL-0022-0047.md`, `DIG-GEMINI-0048-0067.md`, `DIG-DEEPSEEK-0068-0086.md` (corrected 2026-09-28) |
| S3 | Not-built share after the correction: 10 not built over 334 rows = ~3% (< 30%, keep). | the three corrected producer files |
| S4 | First-pass rejection 130/179 = 72.6% > 20% -> no variant switch; the Kernel v1 decision was postponed by one correction round (option (b)); after the corrections Luna's rechecks confirm 117/118 then 15/15 (the single reject fixed) = 100% of the corrected rows re-proven. | `docs/reviews/2026-09-28-gpt-5.6-luna-dig-verification.md`, `2026-09-28-luna-dig-recheck.md`, `2026-09-28-luna-dig-recheck2.md` |
| S5 | The 2A owner-lane suite has not run (candidate unmerged); the merged-tree docs suite of the perf merge ran 192.9 s with no WMI timeouts. | `.ai/runtime/merged-suite.log`; pending the 2A owner lane |
| S6 | `docs/ops/RUNS.jsonl` on `kernel-batch-1` holds 2 valid records; on `v2.0.0` the file is still empty (the fix sits in the 2A candidate). Usage-or-marker coverage is pending the 2A merge. | 2A candidate; `docs/ops/RUNS.jsonl` |
| S7 | No quota stop: Sol used 1 of its 2 reserved calls (round 1); MiMo's run in progress; Luna's DIG verification completed. | journals; PROTO-DEC-0095 item 4 |
| S8 | Operator incidents so far: 1 (a new decision block initially placed out of order; fixed before commit and push, recorded in the operator journal). | `.ai/worklog/kilo-a5143d29cc7dd8ff.md` |
| S9 | No cloud pilot sessions have been stated by the owner; local Windows only is assumed so far. | owner statements 2026-09-28 |
| S2 (corrected, PROTO-DEC-0099 item 2) | **S2 = A'**, not A: F-C01 (the host review-path contract; its probes return RECOMMENDATION/0 instead of FAIL/1) lies on the pilot path. The single Gemini "not built" row is PROTO-DEC-0060 item 3 (`.ai/core/` absent, landing deferred to package I-a) - kernel-internal, NOT on the host/install path. | owner correction 2026-09-28; `docs/reviews/2026-09-28-gpt-5.6-luna-dig-verification.md`; `drafts/DIG-GEMINI-0048-0067.md` |
| S9 (awaiting) | S9 waits for the owner's answer; the operator does not fill it (PROTO-DEC-0099 item 4). | PROTO-DEC-0099 |

Packet 2 gate (PROTO-DEC-0099 item 1, ordered by PROTO-DEC-0101 item 3): the Kernel v1 choice goes to
the owner only after S1 (MiMo + Sol round-2 verdicts), S5 (full suite on the frozen 2A candidate in a
quiet window, strictly sequential) and S6 (`docs/ops/RUNS.jsonl` read AFTER the 2A merge only: usage
or a not-exposed marker on every dispatch row); then the whole table ships. No quiet window (free
RAM < 8 GB): wait, log the gate every 30 min; one line to the owner after 60 min without a window.

S9 mapping (PROTO-DEC-0101 item 4; the owner picks): local Windows only -> keep; cloud planned ->
v1 includes the 2B cloud Evidence slice (B-lite). The operator does not fill S9.

### S8 corrections list (operator; the count is the owner's; PROTO-DEC-0099 item 3)

Cases where the supervisor/advisor corrected the operator, and whether each falls into the S8
categories (lock, archive, commit):

1. 2026-09-28 12:16Z - owner note: the first cycle after the reboot is strictly sequential; the
   merged-tree suite ran while the agy recovery-3 session was alive. Category: sequencing/H-1
   purity, NOT lock/archive/commit.
2. 2026-09-28 15:08Z - owner order: do not freeze the 2A SHA before the DeepSeek review (the
   operator's plan had freeze right after the fix). Category: process order, NOT lock/archive/commit.
3. 2026-09-28 14:42Z - owner correction: the operator's own calls are paid DeepSeek API calls, not
   Vercel (the operator had inferred Vercel from a config entry while the env key was absent).
   Category: accounting fact, NOT lock/archive/commit.
4. 2026-09-28 15:22Z - owner correction: S2 reads A' because F-C01 sits on the pilot path.
   Category: signal analysis, NOT lock/archive/commit.
5. Self-caught (not a supervisor correction, listed for completeness): PROTO-DEC-0095 was briefly
   appended before 0094 in the working file; fixed before commit and push.
6. Self-caught: the operator journal entry edited after `record` (wording) and refreshed with
   `rehash` and a reason.

S8 count under the categories (lock, archive, commit): 0 supervisor/advisor corrections. All six
items above are process, accounting or analysis corrections outside those categories; the count is
the owner's.

## Early reading, 2026-09-27 evening (collector drafts, not yet verified by Sol)

- DeepSeek, 0068-0086 + A-1..A-14: 111 rows, 87 built / 15 partial / 9 not built; 101 `path:line`
  proofs. Not built = 8%, partial = 14% (S3: keep). The nine not-built rows are kernel-internal
  (A-4 Node port, A-7 index, A-8 `protocol-core.cjs`, A-9 `record --candidate`, model-evidence,
  byte budgets, closure procedure, A-11 redaction, 0079 item 3); none is on the pilot path (S2: keep
  for this range).
- Mistral, 0022-0047: 129 rows, 111 built / 18 partial / 0 not built; only 19 `path:line` proofs.
  Several "built" rows cite the decision block itself or an AGENTS.md section (a written rule, not
  an enforced one); partial notes read "may not be complete" or "unclear". This range holds the
  host/installed-path decisions (0025, 0037, 0038, 0040, 0046), so **S2 cannot be read from it** and
  S4 is at risk before Sol starts.
- Added rule for S4 (evidence density), set before the correction runs: a collector row counts as
  evidence only with a code, test or validator `path:line`, or a commit; a decision block or a prose
  section alone makes the row "described", not "built". A draft with < 80% evidenced rows gets one
  targeted correction; if it is still < 80%, its range is reassigned by the owner.
