# Worklog: kilo-a5143d29cc7dd8ff

Session journal. Owned by this session. No other session writes here.

Newest entry first. Limit 150 lines.

<!-- archived-parent: sha256:c3b01f2124801876443e5744fccb520191f517518a8edaa4615562fc63739cb3 -->

---

## 2026-09-28 - 2A MERGED AND PUSHED (bb19cc3); S6 green; STATE checkpoint for restart

Agent: kilo (DeepSeek Flash via kilo; operator session kilo-a5143d29cc7dd8ff)

Action: Pushed `v2.0.0` = **`bb19cc3`** and the branch `fix-registry-fixture` (the one line
"2A merged, push bb19cc3" goes to the owner). S6 after the merge: `docs/ops/RUNS.jsonl` holds 2
valid run-record rows (`R-20260927T020054Z-cr-collector-a` with the explicit
`tokens.source="none"` marker; `R-20260927T020803Z-cr-collector-b` with full usage 127656/37257 and
0.093511 USD) - the usage-or-marker condition holds. Updated `SUPERVISOR-PREREG.md` with the final
S5 (both runs) and S6 rows. Wrote the post-merge STATE checkpoint (2A merged; the packet-2 table
S1-S9 with values and sources; the next actions: advisor request 001 after the restart, A-1,
M-2A-res, N-3; key SHAs). committed the S5b/journal/state records.

Result: The wave-2A kernel batch is on `v2.0.0`; the packet-2 table is in STATE and in this
message; the owner restarts the Kilo window; the new session opens the advisor channel with
request 001.

Next step: after the restart - advisor 001 (effort High by the owner), then A-1 per plan.

Open: advisor 001; A-1; M-2A-res/N-3/backlog items; F-18 verifier (MiMo) pending.

Evidence:
- anchor: bb19cc31fe1c0db9362c7a453c5f2388589ba146, uncommitted changes present
- digest: sha256:c652d9392f5b5bea411c4cd00dc9e0c0e761763cb4911eacab2cfe1669a7ba7c over 1894 tracked and untracked files
- digest format: 4
- recorded: 2026-09-28T17:28:55.373Z by kilo-a5143d29cc7dd8ff
- entry hash format: 2
- entry: sha256:3ff181c08d0df8f632c22c951f0f7070e063bc6761df0a9f3928fb4019e2f83a of this entry without this block
- parent-entry: sha256:867286161dde09bd03fc63a5bd49b332d8353391d08a2591c73de5a141223137
- scope: validator only; the regression suite was NOT run; host-project tests run separately
- validate-protocol.ps1: exit 0 in 6s
- reproduce: node .ai/bin/protocol-handoff.cjs verify
## 2026-09-28 - S5b REPEAT RUN GREEN (423/423); registry fix and 2A merged locally

Agent: kilo (DeepSeek Flash via kilo; operator session kilo-a5143d29cc7dd8ff)

Action: Recorded PROTO-DEC-0104 (repeat-run insurance Available >= 7 GB; unverified review
provenance; the "2A merged, push <SHA>" line rule) under the lock (`590bd7f`, pushed). Started the
repeat run on the owner's direct order: `git merge --no-ff fix-registry-fixture` -> `b04e0d9`
(ff was impossible: v2.0.0 had advanced past the branch point), then `git merge --no-ff
kernel-batch-1` -> `0030fd6`; both conflict-free. Full suite on the merged tree: validate exit 0
(1 warning); **test-protocol exit 0 - 423 pass / 0 fail, wall 186.4 s**; WMI mentions: 0. Gate
sampler `.ai/runtime/gate-s5b.log` (10 samples): start 11.18 GB, minimum 9.0 GB, finish 10.39 GB -
the window was fully open. S5 second line: repeat run 186.4 s, no WMI timeouts, Available
11.18/9.0/10.39 GB (the first line stays: 284.7 s, 5.93/3.63/8.5 GB). Added the registry-fix review
MEASUREMENTS row with `model_ran=unverified` (`model_ran_source=unverified`) per item 3. Then
`record --quick` (post-merge anchor) and `verify` for this session.

Result: The merged tree is green with both merges local; pushing v2.0.0 and the fix branch next.

Next step: push; send the one line "2A merged, push <SHA>"; then S6 (RUNS.jsonl after the merge),
the packet-2 table to the owner, the STATE checkpoint, and "готово к перезапуску".

Open: the push, then S6.

Evidence:
- anchor: 0030fd6c6800b97b857dafab4f8fc53b43be2d02, uncommitted changes present
- digest: sha256:99ecfd66208eed803e0b9527f3c9213f7aa122b0b8046b87f5c2b717dcc74df2 over 1894 tracked and untracked files
- digest format: 4
- recorded: 2026-09-28T17:27:33.452Z by kilo-a5143d29cc7dd8ff
- entry hash format: 2
- entry: sha256:867286161dde09bd03fc63a5bd49b332d8353391d08a2591c73de5a141223137 of this entry without this block
- parent-entry: sha256:c3b01f2124801876443e5744fccb520191f517518a8edaa4615562fc63739cb3
- scope: validator only; the regression suite was NOT run; host-project tests run separately
- validate-protocol.ps1: exit 0 in 4s
- reproduce: node .ai/bin/protocol-handoff.cjs verify
