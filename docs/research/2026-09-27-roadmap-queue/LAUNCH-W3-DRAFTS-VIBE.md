# Launch: task:roadmap-w3-drafts-vibe (Mistral Medium 3.5 via vibe, its own session)

Reassignment per PROTO-DEC-0094 B.2 (owner, 2026-09-28): vibe replaces the originally planned
drafter (Claude Opus 5.5) and the Kimi K3 verification; the scope below is unchanged from
`LAUNCH-W3-DRAFTS.md`. Work in the worktree `D:\Colabs\.ai\runtime\w3` (branch `roadmap-wave3`).
The three DIG collectors have finished; the drafts cite the DIG registry.

## Output (only these, into `docs/research/2026-09-27-roadmap-queue/drafts/`)

- `KERNEL-V1-SCOPE.md` (wave-3 item 1);
- `K-LAUNCH-MEMO.md` (wave-3 item 2, BACKLOG M-3).

## KERNEL-V1-SCOPE.md (owner's mandatory requirements)

1. Two or three options for the Kernel v1 scope (P-L0-008 R-L0-22.54, OQ-11), each with numbers:
   what ships, what stays out, the cost/effort class, the consequence if chosen.
2. One option must read: "v1 = current kernel + merged 2A; the Node port (2B), CORE-ARCH stage 3
   and OPS-1 B/C continue in parallel with the product pilots".
3. A measurable exit criterion for the chosen scope, built from:
   - `BASELINE.md` wall times as the frozen baseline (the full suite `Bs = 591 s`; cite the file);
   - the certification rounds of 2A (review, fix, freeze, owner lane, audit prompt, two certifiers,
     merge);
   - usage coverage in run records (`docs/ops/RUNS.jsonl`, the A-10 chain); the criterion is
     "usage or an explicit not-exposed marker", not "usage for every client";
   - a disposition for every "not built" DIG row (cite the registry files in `drafts/`).
4. A recommendation with reasoning, and the risks that would falsify it.

## K-LAUNCH-MEMO.md (BACKLOG M-3)

One page: run Studies A and B (frames F-04, F-05) on `.ai/bin/protocol-dispatch.cjs` instead of
`launch.cjs` plus M-3, or keep the old path. Note that W1-retire (wave 2A) marks `run-chain.cjs`
retired and points new programs to `protocol-dispatch.cjs`; the memo unblocks CORE-ARCH stage 3.
Both frames' review date is 2026-10-03. Give the recommendation and its trigger.

## Session rules

- `node .ai/bin/protocol-session.cjs start --agent mistral`; use the printed owner name.
- Read-only on the rest of the repository; never edit `.ai/DECISIONS.md`, `docs/research/FRAMES.md`
  or the collectors' DIG files. Drafter, not a certifier: no verdicts, no certification.
- Do not run `test-protocol.ps1`; run `validate-protocol.ps1` once and `record --quick` at the end.
- Commit your files with explicit paths on this branch; do not push.
- Journal: five labels plus model/effort and usage. Record the model honestly: requested `glm-5-3`,
  ran `mistral-medium-3.5` while the vibe log shows "falling back" (PROTO-DEC-0094 B.1); check the
  log before claiming any model.
- Every number cites its source (`BASELINE.md`, `FRAMES.md`, the DIG drafts, `final-plan-2.md`).

## After

The operator collects the drafts; verification is assigned separately (not by this session).
