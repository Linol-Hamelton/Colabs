# Worklog: kilo-a5143d29cc7dd8ff

Session journal. Owned by this session. No other session writes here.

Newest entry first. Limit 150 lines.

<!-- archived-parent: sha256:323c55ced5d07bdb6acf870f2826484c98cef4c9f436e3503227f3d6ab945ed7 -->

---

## 2026-09-28 - STOP: merged-tree suite RED on 2 pre-existing v2.0.0 fixture failures; merge rolled back

Agent: kilo (DeepSeek Flash via kilo; operator session kilo-a5143d29cc7dd8ff)

Action: Started the single merged run on the owner's explicit instruction (Available at the
pre-start gate 7.1-7.6 GB, i.e. below the 8 GB letter; started anyway per "запускай СЕЙЧАС", with
this deviation recorded). `git merge --no-ff kernel-batch-1` -> `bdfacf9`, no conflicts. Suite on
the merged tree: `validate-protocol.ps1` exit 0 (5 s, 1 warning); `test-protocol.ps1` exit 1 -
421 pass / **2 fail**, wall 284.7 s. Available during the run: start 5.93 GB (the merge checkout),
minimum 3.63 GB, recovering to 8.48 GB by 16:43Z; the run was NOT interrupted (owner item 2); no
actual WMI timeouts (the grep hits are test names like "busy lock timeout"). The 2 failures are
`tests/registry.test.cjs` tests 6 and 7 ("new decision block without Reopen-trigger / with unknown
Reopen-trigger emits WARN"). Attribution: they PASS on the frozen `kernel-batch-1` tree, and FAIL
identically on the rolled-back clean `v2.0.0` `7ecef0f` WITHOUT the merge - so the red is a
PRE-EXISTING v2.0.0-side defect, not caused by the candidate. Root cause (captured from the
validator output): the fixture `validate(root)` resolves `.ai/DECISIONS.md` from the REAL repository
root, and the real corpus now contains `PROTO-DEC-0099` (my night-1 block), so the tests'
synthetic `PROTO-DEC-0099` yields `[FAIL] duplicate decision: PROTO-DEC-0099` and `[FAIL]
PROTO-DEC-0099 was edited after it was written` -> `res.status != 0`. The suite was green (420/420)
at `a2db48c` (12:15Z) when the real corpus ended at 0090; the breakage began as the night's own
blocks reached 0099. Rolled the local merge back (`git reset --hard 7ecef0f`; nothing pushed, nothing
pushed rewritten). Stopped the gate sampler (log `.ai/runtime/gate-s5.log`, 18 samples).
S5 record fragment: start Available 5.93 GB (pre-merge 7.1-7.6), min 3.63 GB, finish ~8.5 GB; suite
wall 284.7 s; the 2 failures pre-existing; no WMI timeouts.

Result: Merge NOT pushed; STOP sent to the owner with the diagnosis and the proposed fix (renumber
the synthetic ids in `tests/registry.test.cjs` to a reserved range far above the live corpus, e.g.
PROTO-DEC-9998/9999, or make the fixture read its own root). The candidate `79670de` and the frozen
`9bf15ae` remain valid; `v2.0.0` is untouched at `7ecef0f`.

Next step: await the owner's decision; after the test fix and a green suite, repeat the single run.

Open: the v2.0.0 fixture fix (owner decision); then re-merge + suite + push + S6 + packet 2.

Evidence:
- anchor: 7ecef0fd396b74b557fbd81b91e162345053ea97, uncommitted changes present
- digest: sha256:f782970720dd3cedff7786888e91bbdc303b631a227f7a8b57a2b795efd5b0ed over 1872 tracked and untracked files
- digest format: 4
- recorded: 2026-09-28T16:46:34.747Z by kilo-a5143d29cc7dd8ff
- entry hash format: 2
- entry: sha256:a4f279970db9414dca7f5b79982e06ccb1f770db2a631ba823cdd9686b154b0f of this entry without this block
- parent-entry: sha256:323c55ced5d07bdb6acf870f2826484c98cef4c9f436e3503227f3d6ab945ed7
- scope: validator only; the regression suite was NOT run; host-project tests run separately
- validate-protocol.ps1: exit 0 in 5s
- reproduce: node .ai/bin/protocol-handoff.cjs verify
