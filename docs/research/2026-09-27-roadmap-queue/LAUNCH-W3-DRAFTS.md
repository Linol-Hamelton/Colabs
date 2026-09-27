# Launch: task:roadmap-w3-drafts (Claude Opus 5.5, a NEW session; not the supervisor session)

Wave-3 items 1 and 2 of ROADMAP-1 (`PROMPT.md` wave 3; owner answers 2026-09-27 in
`.ai/worklog/kilo-e1b4dd4a82b08b8e.md`). Work in the worktree `D:\Colabs\.ai\runtime\w3` (branch
`roadmap-wave3`). **Start only after the three DIG collectors have finished** (the operator
dispatches; the drafts cite the DIG registry). Output only into
`docs/research/2026-09-27-roadmap-queue/drafts/`:

- `KERNEL-V1-SCOPE.md` (item 1)
- `K-LAUNCH-MEMO.md` (item 2)

## Session rules

- `node .ai/bin/protocol-session.cjs start --agent claude`; use the printed owner name.
- Read-only on the rest of the repository; never edit `.ai/DECISIONS.md`, `docs/research/FRAMES.md`
  or the collectors' DIG files. Drafter, not a certifier: no verdicts, no certification.
- Do **not** run `test-protocol.ps1`; run `validate-protocol.ps1` once and `record --quick` at the
  end. Commit your files with explicit paths on this branch; do not push.
- Journal: five labels plus model/effort and usage. Every number cites its source
  (`BASELINE.md`, `FRAMES.md`, the DIG drafts, `final-plan-2.md`).

## KERNEL-V1-SCOPE.md (the owner's mandatory requirements)

1. Two or three options for the Kernel v1 scope (P-L0-008 R-L0-22.54, OQ-11), each with numbers
   (what ships, what stays out, the cost/effort class, the consequence if chosen).
2. One option must read: **"v1 = current kernel + merged 2A; the Node port (2B), CORE-ARCH
   stage 3 and OPS-1 B/C continue in parallel with the product pilots"**.
3. A measurable exit criterion for the chosen scope, built from:
   - `BASELINE.md` wall times as the frozen baseline (the full suite `Bs = 591 s`; cite the file);
   - the certification rounds of 2A (high-risk flow: review, fix, freeze, owner lane, audit
     prompt, two certifiers, merge);
   - usage coverage in run records (`docs/ops/RUNS.jsonl`, the A-10 chain); the criterion is
     **"usage or an explicit not-exposed marker"**, not "usage for every client";
   - a disposition for **every** "not built" DIG row (cite the registry files in `drafts/`).
4. Give a recommendation with the reasoning, and the risks that would falsify it.

## K-LAUNCH-MEMO.md (BACKLOG M-3)

One page: run Studies A and B (frames F-04 and F-05) on `.ai/bin/protocol-dispatch.cjs` instead of
`launch.cjs` plus M-3, or keep the old path. Note that W1-retire (wave 2A) marks `run-chain.cjs`
retired and points new programs to `protocol-dispatch.cjs`; the memo unblocks CORE-ARCH stage 3.
Both frames' review date is 2026-10-03. Give the recommendation and its trigger.

## After you

The Kimi K3 verifier checks both drafts in its own session (another family than the drafter); one
targeted correction round follows if needed. GPT-5.6 Sol is reserved for the DIG verification and
the 2A/2B certifications, not for these drafts.
