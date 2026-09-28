# Worklog: kilo-a5143d29cc7dd8ff

Session journal. Owned by this session. No other session writes here.

Newest entry first. Limit 150 lines.

<!-- archived-parent: sha256:c3b01f2124801876443e5744fccb520191f517518a8edaa4615562fc63739cb3 -->

---

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
