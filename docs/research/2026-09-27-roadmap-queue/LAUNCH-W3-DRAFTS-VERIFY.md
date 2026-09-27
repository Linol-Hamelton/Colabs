# Launch: task:roadmap-w3-drafts-verify (Kimi K3, its own session)

Wave-3 drafts verification (advisory; one targeted correction round). Preconditions: the drafter
(Claude Opus 5.5) has delivered `docs/research/2026-09-27-roadmap-queue/drafts/KERNEL-V1-SCOPE.md`
and `drafts/K-LAUNCH-MEMO.md` with its journal and `record`. Work in the worktree
`D:\Colabs\.ai\runtime\w3` (branch `roadmap-wave3`).

## Check both drafts

1. **KERNEL-V1-SCOPE.md**: two or three options with numbers; the mandatory option text ("v1 =
   current kernel + merged 2A; the Node port (2B), CORE-ARCH stage 3 and OPS-1 B/C continue in
   parallel with the product pilots") present verbatim; the exit criterion covers the four
   required elements (BASELINE wall times - the suite `Bs = 591 s` cited from `BASELINE.md`; the
   2A certification rounds; usage or an explicit not-exposed marker in run records; a disposition
   for every "not built" DIG row); the recommendation and its falsifiers are present.
2. **K-LAUNCH-MEMO.md**: the M-3 choice (Studies A/B on `protocol-dispatch.cjs` vs the old path),
   the W1-retire link, the 2026-10-03 review date of F-04/F-05, a recommendation and its trigger.
3. Internal consistency and agreement with `.ai/DECISIONS.md`, `BASELINE.md`, `FRAMES.md` (the
   F-17 row and the DIG counter) and the DIG drafts. Numbers must trace to a cited source.
4. Produce `drafts/DRAFTS-VERIFICATION-KIMI.md`: per document, findings with severity, the evidence
   checked, and the concrete corrections for a single targeted fix round by the drafter.

## Rules

- `node .ai/bin/protocol-session.cjs start --agent kimi`; use the printed owner name.
- Advisory only: no verdicts, no certification. Do not edit the drafts or anything outside your
  verification file, journal and evidence; the correction round belongs to the drafter.
- Do not run `test-protocol.ps1`; run `validate-protocol.ps1` once and `record --quick` at the end.
- Commit your files on this branch with explicit paths; do not push.
- Journal: five labels plus model/effort and usage.
